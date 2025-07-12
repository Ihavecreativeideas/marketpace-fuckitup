const jwt = require('jsonwebtoken');
const crypto = require('crypto');
import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import { userSessions } from '../shared/schema';
import { eq, and, lt } from 'drizzle-orm';

// Extended request interface for authenticated requests
export interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
  userType?: string;
}

// Session manager for JWT tokens and secure session handling
class SessionManager {
  private jwtSecret: string;
  private refreshSecret: string;

  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here';
    this.refreshSecret = process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key-here';
  }

  // Generate unique session ID
  generateSessionId(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  // Generate access and refresh tokens
  generateTokens(userId: string, email: string, userType?: string) {
    const payload = {
      userId,
      email,
      userType: userType || 'individual',
      type: 'access'
    };

    const refreshPayload = {
      userId,
      email,
      userType: userType || 'individual',
      type: 'refresh'
    };

    const accessToken = jwt.sign(payload, this.jwtSecret, {
      expiresIn: '15m', // Short-lived access token
      issuer: 'marketpace',
      audience: 'marketpace-users'
    });

    const refreshToken = jwt.sign(refreshPayload, this.refreshSecret, {
      expiresIn: '7d', // Long-lived refresh token
      issuer: 'marketpace',
      audience: 'marketpace-users'
    });

    return { accessToken, refreshToken };
  }

  // Verify access token
  verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret, {
        issuer: 'marketpace',
        audience: 'marketpace-users'
      });
    } catch (error) {
      return null;
    }
  }

  // Verify refresh token
  verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, this.refreshSecret, {
        issuer: 'marketpace',
        audience: 'marketpace-users'
      });
    } catch (error) {
      return null;
    }
  }

  // Refresh access token using refresh token
  async refreshAccessToken(refreshToken: string) {
    try {
      const decoded = this.verifyRefreshToken(refreshToken);
      if (!decoded || decoded.type !== 'refresh') {
        return null;
      }

      // Check if session exists and is active
      const [session] = await db.select()
        .from(userSessions)
        .where(
          and(
            eq(userSessions.userId, decoded.userId),
            eq(userSessions.refreshToken, refreshToken),
            eq(userSessions.isActive, true),
            lt(new Date(), userSessions.expiresAt)
          )
        )
        .limit(1);

      if (!session) {
        return null;
      }

      // Generate new tokens
      const newTokens = this.generateTokens(decoded.userId, decoded.email, decoded.userType);

      // Update session with new tokens
      await db.update(userSessions)
        .set({
          sessionToken: newTokens.accessToken,
          refreshToken: newTokens.refreshToken,
          lastActivityAt: new Date()
        })
        .where(eq(userSessions.id, session.id));

      return newTokens;
    } catch (error) {
      console.error('Refresh token error:', error);
      return null;
    }
  }

  // Set secure HTTP-only cookies
  setAuthCookies(res: Response, accessToken: string, refreshToken: string, isSecure: boolean = false) {
    const cookieOptions = {
      httpOnly: true,
      secure: isSecure, // Use HTTPS in production
      sameSite: 'strict' as const,
      path: '/'
    };

    res.cookie('accessToken', accessToken, {
      ...cookieOptions,
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
  }

  // Clear authentication cookies
  clearAuthCookies(res: Response) {
    res.clearCookie('accessToken', { path: '/' });
    res.clearCookie('refreshToken', { path: '/' });
  }

  // Middleware for authenticating requests
  authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Get token from Authorization header or cookies
      const authHeader = req.headers.authorization;
      const accessToken = authHeader?.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : req.cookies?.accessToken;

      if (!accessToken) {
        return res.status(401).json({
          success: false,
          message: 'Access token required'
        });
      }

      // Verify token
      const decoded = this.verifyAccessToken(accessToken);
      if (!decoded) {
        return res.status(403).json({
          success: false,
          message: 'Invalid or expired access token'
        });
      }

      // Check if session is still active
      const [session] = await db.select()
        .from(userSessions)
        .where(
          and(
            eq(userSessions.userId, decoded.userId),
            eq(userSessions.sessionToken, accessToken),
            eq(userSessions.isActive, true),
            lt(new Date(), userSessions.expiresAt)
          )
        )
        .limit(1);

      if (!session) {
        return res.status(403).json({
          success: false,
          message: 'Session not found or expired'
        });
      }

      // Update last activity
      await db.update(userSessions)
        .set({ lastActivityAt: new Date() })
        .where(eq(userSessions.id, session.id));

      // Add user info to request
      req.userId = decoded.userId;
      req.userEmail = decoded.email;
      req.userType = decoded.userType;

      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(500).json({
        success: false,
        message: 'Authentication failed'
      });
    }
  };

  // Optional authentication middleware (doesn't fail if no token)
  optionalAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;
      const accessToken = authHeader?.startsWith('Bearer ') 
        ? authHeader.substring(7) 
        : req.cookies?.accessToken;

      if (accessToken) {
        const decoded = this.verifyAccessToken(accessToken);
        if (decoded) {
          // Check if session is still active
          const [session] = await db.select()
            .from(userSessions)
            .where(
              and(
                eq(userSessions.userId, decoded.userId),
                eq(userSessions.sessionToken, accessToken),
                eq(userSessions.isActive, true),
                lt(new Date(), userSessions.expiresAt)
              )
            )
            .limit(1);

          if (session) {
            req.userId = decoded.userId;
            req.userEmail = decoded.email;
            req.userType = decoded.userType;

            // Update last activity
            await db.update(userSessions)
              .set({ lastActivityAt: new Date() })
              .where(eq(userSessions.id, session.id));
          }
        }
      }

      next();
    } catch (error) {
      console.error('Optional auth error:', error);
      next(); // Continue without authentication
    }
  };

  // Invalidate all sessions for a user
  async invalidateUserSessions(userId: string) {
    await db.update(userSessions)
      .set({ isActive: false })
      .where(eq(userSessions.userId, userId));
  }

  // Clean up expired sessions
  async cleanupExpiredSessions() {
    await db.update(userSessions)
      .set({ isActive: false })
      .where(lt(userSessions.expiresAt, new Date()));
  }

  // Get active sessions for a user
  async getUserSessions(userId: string) {
    return await db.select()
      .from(userSessions)
      .where(
        and(
          eq(userSessions.userId, userId),
          eq(userSessions.isActive, true),
          lt(new Date(), userSessions.expiresAt)
        )
      );
  }
}

export const sessionManager = new SessionManager();