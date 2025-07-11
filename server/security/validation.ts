import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

// Initialize DOMPurify for server-side use
const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Rate limiting store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Input sanitization utility
export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    return purify.sanitize(input);
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[key] = sanitizeInput(value);
    }
    return sanitized;
  }
  return input;
}

// Validation middleware
export function validateAndSanitize(req: Request, res: Response, next: NextFunction) {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }

  // Sanitize all input
  req.body = sanitizeInput(req.body);
  req.query = sanitizeInput(req.query);
  req.params = sanitizeInput(req.params);

  next();
}

// Rate limiting middleware
export function rateLimit(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientId = req.ip || 'unknown';
    const now = Date.now();
    const clientData = rateLimitStore.get(clientId);

    if (!clientData || now > clientData.resetTime) {
      rateLimitStore.set(clientId, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    if (clientData.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
      });
    }

    clientData.count++;
    next();
  };
}

// CSRF protection
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }

  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({
      success: false,
      error: 'CSRF token validation failed'
    });
  }

  next();
}

// Email validation
export const validateEmail = body('email')
  .isEmail()
  .normalizeEmail()
  .withMessage('Invalid email format');

// URL validation
export const validateUrl = body('url')
  .isURL({ protocols: ['http', 'https'] })
  .withMessage('Invalid URL format');

// Bandzoogle URL validation
export const validateBandzoogleUrl = body('bandzoogleUrl')
  .isURL()
  .custom((value) => {
    if (!value.includes('bandzoogle.com') && !value.includes('.band')) {
      throw new Error('Must be a valid Bandzoogle website URL');
    }
    return true;
  });

// API key validation
export const validateApiKey = body('apiKey')
  .isLength({ min: 10, max: 100 })
  .matches(/^[a-zA-Z0-9_-]+$/)
  .withMessage('Invalid API key format');

// User ID validation
export const validateUserId = param('userId')
  .isAlphanumeric()
  .isLength({ min: 3, max: 50 })
  .withMessage('Invalid user ID');

// Integration ID validation
export const validateIntegrationId = param('integrationId')
  .matches(/^[a-zA-Z0-9_-]+$/)
  .isLength({ min: 5, max: 100 })
  .withMessage('Invalid integration ID');

// Phone number validation
export const validatePhoneNumber = body('phoneNumber')
  .isMobilePhone('any')
  .withMessage('Invalid phone number');

// Password validation
export const validatePassword = body('password')
  .isLength({ min: 8, max: 128 })
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
  .withMessage('Password must contain at least 8 characters with uppercase, lowercase, number, and special character');

// SQL injection prevention
export function preventSqlInjection(input: string): string {
  const sqlKeywords = [
    'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
    'EXEC', 'EXECUTE', 'UNION', 'SCRIPT', '--', ';', 'xp_', 'sp_'
  ];
  
  let sanitized = input;
  sqlKeywords.forEach(keyword => {
    const regex = new RegExp(keyword, 'gi');
    sanitized = sanitized.replace(regex, '');
  });
  
  return sanitized;
}

// File upload validation
export function validateFileUpload(file: any): { valid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.mimetype)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'File too large. Maximum size is 5MB.' };
  }

  return { valid: true };
}

// Security headers middleware
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  // Generate nonce for CSP
  const nonce = Buffer.from(Math.random().toString()).toString('base64');
  res.locals.nonce = nonce;

  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Enhanced CSP with nonce
  const cspDirectives = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' https://js.stripe.com`,
    "style-src 'self' 'unsafe-inline' https:",
    "img-src 'self' data: https:",
    "connect-src 'self' https:",
    "font-src 'self' https: data:",
    "object-src 'none'",
    "media-src 'self'",
    "frame-src 'self' https://checkout.stripe.com https://js.stripe.com",
    "form-action 'self' https://checkout.stripe.com"
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', cspDirectives);

  next();
}

// Authentication validation
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  // Validate token (implement your token validation logic)
  try {
    // Add your JWT validation here
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid authentication token'
    });
  }
}

// Admin authorization
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  // Check if user has admin privileges
  const userRole = req.user?.role; // Assuming user is attached to request
  
  if (userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin privileges required'
    });
  }

  next();
}