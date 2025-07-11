import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { SecurityMonitor, SECURITY_CONFIG } from './environment';

// Password hashing utilities
export class PasswordUtils {
  private static readonly SALT_ROUNDS = 12;

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static validatePasswordStrength(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < SECURITY_CONFIG.PASSWORD_MIN_LENGTH) {
      errors.push(`Password must be at least ${SECURITY_CONFIG.PASSWORD_MIN_LENGTH} characters long`);
    }

    if (SECURITY_CONFIG.PASSWORD_REQUIRE_UPPERCASE && !/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    if (SECURITY_CONFIG.PASSWORD_REQUIRE_LOWERCASE && !/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    if (SECURITY_CONFIG.PASSWORD_REQUIRE_NUMBERS && !/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    if (SECURITY_CONFIG.PASSWORD_REQUIRE_SYMBOLS && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// JWT token utilities
export class TokenUtils {
  static generateToken(payload: any, expiresIn: string = SECURITY_CONFIG.JWT_EXPIRES_IN): string {
    return jwt.sign(payload, SECURITY_CONFIG.JWT_SECRET, { expiresIn });
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, SECURITY_CONFIG.JWT_SECRET);
    } catch (error) {
      SecurityMonitor.logSecurityEvent('invalid_token', { error: error.message });
      throw error;
    }
  }

  static generateRefreshToken(userId: string): string {
    return this.generateToken({ userId, type: 'refresh' }, '7d');
  }

  static generateAccessToken(userId: string, role: string = 'user'): string {
    return this.generateToken({ userId, role, type: 'access' }, '1h');
  }
}

// Session management
export class SessionManager {
  private static activeSessions = new Map<string, {
    userId: string;
    createdAt: Date;
    lastActivity: Date;
    ipAddress: string;
    userAgent: string;
  }>();

  static createSession(userId: string, req: Request): string {
    const sessionId = this.generateSessionId();
    
    this.activeSessions.set(sessionId, {
      userId,
      createdAt: new Date(),
      lastActivity: new Date(),
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent') || 'unknown'
    });

    SecurityMonitor.logSecurityEvent('session_created', { userId, sessionId });
    return sessionId;
  }

  static validateSession(sessionId: string, req: Request): boolean {
    const session = this.activeSessions.get(sessionId);
    
    if (!session) {
      SecurityMonitor.logSecurityEvent('invalid_session', { sessionId });
      return false;
    }

    // Check session expiry
    const now = new Date();
    const maxAge = SECURITY_CONFIG.SESSION_MAX_AGE;
    
    if (now.getTime() - session.createdAt.getTime() > maxAge) {
      this.destroySession(sessionId);
      SecurityMonitor.logSecurityEvent('session_expired', { sessionId, userId: session.userId });
      return false;
    }

    // Update last activity
    session.lastActivity = now;
    return true;
  }

  static destroySession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      SecurityMonitor.logSecurityEvent('session_destroyed', { 
        sessionId, 
        userId: session.userId 
      });
      this.activeSessions.delete(sessionId);
    }
  }

  static getSessionInfo(sessionId: string): any {
    return this.activeSessions.get(sessionId);
  }

  static destroyUserSessions(userId: string): number {
    let destroyed = 0;
    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (session.userId === userId) {
        this.activeSessions.delete(sessionId);
        destroyed++;
      }
    }
    
    SecurityMonitor.logSecurityEvent('user_sessions_destroyed', { userId, count: destroyed });
    return destroyed;
  }

  private static generateSessionId(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  // Clean up expired sessions
  static cleanupExpiredSessions(): number {
    const now = new Date();
    const maxAge = SECURITY_CONFIG.SESSION_MAX_AGE;
    let cleaned = 0;

    for (const [sessionId, session] of this.activeSessions.entries()) {
      if (now.getTime() - session.createdAt.getTime() > maxAge) {
        this.activeSessions.delete(sessionId);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// Authentication middleware
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    SecurityMonitor.logSecurityEvent('missing_auth_token', { 
      endpoint: req.path,
      ip: req.ip 
    });
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
  }

  try {
    const decoded = TokenUtils.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    SecurityMonitor.logSecurityEvent('invalid_auth_token', { 
      endpoint: req.path,
      ip: req.ip,
      error: error.message 
    });
    return res.status(403).json({ 
      success: false, 
      error: 'Invalid access token' 
    });
  }
}

// Two-factor authentication utilities
export class TwoFactorAuth {
  private static pendingVerifications = new Map<string, {
    userId: string;
    code: string;
    expiresAt: Date;
    attempts: number;
  }>();

  static generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static createVerification(userId: string): string {
    const code = this.generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    this.pendingVerifications.set(userId, {
      userId,
      code,
      expiresAt,
      attempts: 0
    });

    SecurityMonitor.logSecurityEvent('2fa_code_generated', { userId });
    return code;
  }

  static verifyCode(userId: string, inputCode: string): boolean {
    const verification = this.pendingVerifications.get(userId);
    
    if (!verification) {
      SecurityMonitor.logSecurityEvent('2fa_no_pending_verification', { userId });
      return false;
    }

    verification.attempts++;

    // Check if too many attempts
    if (verification.attempts > 3) {
      this.pendingVerifications.delete(userId);
      SecurityMonitor.logSecurityEvent('2fa_too_many_attempts', { userId });
      return false;
    }

    // Check if expired
    if (new Date() > verification.expiresAt) {
      this.pendingVerifications.delete(userId);
      SecurityMonitor.logSecurityEvent('2fa_code_expired', { userId });
      return false;
    }

    // Verify code
    if (verification.code === inputCode) {
      this.pendingVerifications.delete(userId);
      SecurityMonitor.logSecurityEvent('2fa_verification_success', { userId });
      return true;
    }

    SecurityMonitor.logSecurityEvent('2fa_verification_failed', { 
      userId, 
      attempts: verification.attempts 
    });
    return false;
  }

  static cleanupExpiredVerifications(): number {
    const now = new Date();
    let cleaned = 0;

    for (const [userId, verification] of this.pendingVerifications.entries()) {
      if (now > verification.expiresAt) {
        this.pendingVerifications.delete(userId);
        cleaned++;
      }
    }

    return cleaned;
  }
}

// Account lockout protection
export class AccountLockout {
  private static failedAttempts = new Map<string, {
    count: number;
    lastAttempt: Date;
    lockedUntil?: Date;
  }>();

  private static readonly MAX_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 30 * 60 * 1000; // 30 minutes

  static recordFailedAttempt(identifier: string): boolean {
    const now = new Date();
    const attempts = this.failedAttempts.get(identifier) || { 
      count: 0, 
      lastAttempt: now 
    };

    attempts.count++;
    attempts.lastAttempt = now;

    if (attempts.count >= this.MAX_ATTEMPTS) {
      attempts.lockedUntil = new Date(now.getTime() + this.LOCKOUT_DURATION);
      SecurityMonitor.logSecurityEvent('account_locked', { 
        identifier, 
        attempts: attempts.count 
      });
    }

    this.failedAttempts.set(identifier, attempts);
    return attempts.count >= this.MAX_ATTEMPTS;
  }

  static isLocked(identifier: string): boolean {
    const attempts = this.failedAttempts.get(identifier);
    
    if (!attempts || !attempts.lockedUntil) {
      return false;
    }

    if (new Date() > attempts.lockedUntil) {
      // Lockout period expired
      this.failedAttempts.delete(identifier);
      return false;
    }

    return true;
  }

  static clearFailedAttempts(identifier: string): void {
    this.failedAttempts.delete(identifier);
  }

  static getFailedAttempts(identifier: string): number {
    return this.failedAttempts.get(identifier)?.count || 0;
  }
}