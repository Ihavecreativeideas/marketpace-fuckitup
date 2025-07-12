import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { db } from './db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';

// Rate limiting configurations
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 password reset requests per hour
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Enhanced security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.stripe.com"],
      frameSrc: ["'self'", "https://js.stripe.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      workerSrc: ["'self'"],
      childSrc: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Device fingerprinting middleware
export function deviceFingerprint(req: Request, res: Response, next: NextFunction) {
  const deviceInfo = {
    userAgent: req.get('User-Agent') || '',
    acceptLanguage: req.get('Accept-Language') || '',
    acceptEncoding: req.get('Accept-Encoding') || '',
    ip: req.ip || req.connection.remoteAddress || '',
    timestamp: new Date().toISOString()
  };

  // Create a simple fingerprint hash
  const fingerprint = Buffer.from(JSON.stringify(deviceInfo)).toString('base64');
  
  req.deviceFingerprint = fingerprint;
  req.deviceInfo = deviceInfo;
  
  next();
}

// Account lockout protection
export async function accountLockoutCheck(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    
    if (!email) {
      return next();
    }

    // Check if user exists and is locked
    const [user] = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (user && user.isLocked) {
      // Check if lockout period has expired
      if (user.lockedUntil && new Date() < user.lockedUntil) {
        const timeLeft = Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60000);
        return res.status(423).json({
          success: false,
          message: `Account is locked due to too many failed attempts. Try again in ${timeLeft} minutes.`,
          lockedUntil: user.lockedUntil
        });
      } else if (user.lockedUntil && new Date() >= user.lockedUntil) {
        // Unlock the account
        await db.update(users)
          .set({
            isLocked: false,
            lockedUntil: null,
            loginAttempts: 0,
            updatedAt: new Date()
          })
          .where(eq(users.id, user.id));
      }
    }

    next();
  } catch (error) {
    console.error('Account lockout check error:', error);
    next();
  }
}

// Track failed login attempts
export async function trackFailedLogin(email: string) {
  try {
    const [user] = await db.select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) return;

    const newAttempts = (user.loginAttempts || 0) + 1;
    const maxAttempts = 5;
    const lockoutDuration = 30 * 60 * 1000; // 30 minutes

    if (newAttempts >= maxAttempts) {
      // Lock the account
      const lockedUntil = new Date(Date.now() + lockoutDuration);
      
      await db.update(users)
        .set({
          loginAttempts: newAttempts,
          isLocked: true,
          lockedUntil: lockedUntil,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));
    } else {
      // Increment attempts
      await db.update(users)
        .set({
          loginAttempts: newAttempts,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));
    }
  } catch (error) {
    console.error('Track failed login error:', error);
  }
}

// Reset login attempts on successful login
export async function resetLoginAttempts(email: string) {
  try {
    await db.update(users)
      .set({
        loginAttempts: 0,
        isLocked: false,
        lockedUntil: null,
        lastLoginAt: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.email, email));
  } catch (error) {
    console.error('Reset login attempts error:', error);
  }
}

// Security event logging
export async function logSecurityEvent(userId: string, event: {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: any;
}) {
  try {
    // Get current security alerts
    const [user] = await db.select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) return;

    const securityAlerts = user.securityAlerts ? JSON.parse(user.securityAlerts as string) : [];
    
    // Add new security event
    const newAlert = {
      id: Date.now(),
      type: event.type,
      title: event.description,
      message: event.description,
      severity: event.severity,
      timestamp: new Date().toISOString(),
      metadata: event.metadata || {},
      read: false
    };
    
    securityAlerts.unshift(newAlert);
    
    // Keep only last 100 alerts
    if (securityAlerts.length > 100) {
      securityAlerts.splice(100);
    }
    
    // Update user record
    await db.update(users)
      .set({
        securityAlerts: JSON.stringify(securityAlerts),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

  } catch (error) {
    console.error('Security event logging error:', error);
  }
}

// Input sanitization middleware
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  // Sanitize common XSS patterns
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    }
    
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        obj[key] = sanitize(obj[key]);
      }
    }
    
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  
  if (req.query) {
    req.query = sanitize(req.query);
  }
  
  next();
}

// IP whitelist middleware (for admin endpoints)
export function ipWhitelist(allowedIPs: string[] = []) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || '';
    
    // For development, allow localhost
    if (process.env.NODE_ENV === 'development') {
      return next();
    }
    
    if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied from this IP address'
      });
    }
    
    next();
  };
}

// CSRF protection for state-changing operations
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Check for CSRF token in header
  const csrfToken = req.get('X-CSRF-Token') || req.body.csrfToken;
  const sessionToken = req.get('Authorization')?.split(' ')[1];
  
  if (!csrfToken || !sessionToken) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token required'
    });
  }
  
  // Verify CSRF token matches session (simplified implementation)
  // In production, use a more robust CSRF protection library
  const expectedToken = Buffer.from(sessionToken).toString('base64').slice(0, 32);
  
  if (csrfToken !== expectedToken) {
    return res.status(403).json({
      success: false,
      message: 'Invalid CSRF token'
    });
  }
  
  next();
}

// Password strength validation
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong';
} {
  const errors: string[] = [];
  let score = 0;
  
  // Length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else if (password.length >= 12) {
    score += 2;
  } else {
    score += 1;
  }
  
  // Uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }
  
  // Lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }
  
  // Number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  } else {
    score += 1;
  }
  
  // Special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) {
    errors.push('Password must contain at least one special character');
  } else {
    score += 1;
  }
  
  // Common patterns check
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /admin/i,
    /login/i
  ];
  
  if (commonPatterns.some(pattern => pattern.test(password))) {
    errors.push('Password contains common patterns');
    score -= 2;
  }
  
  // Determine strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 5) strength = 'strong';
  else if (score >= 3) strength = 'medium';
  
  return {
    isValid: errors.length === 0,
    errors,
    strength
  };
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      deviceFingerprint?: string;
      deviceInfo?: any;
    }
  }
}