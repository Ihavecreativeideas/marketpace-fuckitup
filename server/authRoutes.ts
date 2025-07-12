import { Express, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { db } from './db';
import { users, passwordResetTokens, emailVerificationTokens, smsVerificationCodes, userSessions } from '../shared/schema';
import { eq, and, lt } from 'drizzle-orm';
import { emailService } from './emailService';
import { smsService } from './smsService';
import { sessionManager, type AuthenticatedRequest } from './sessionManager';

interface AuthenticatedRequest extends Request {
  user?: any;
}

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY_HOURS = 1;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;

// Password validation function
function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' };
  }
  return { valid: true };
}

// Email validation function
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Generate secure reset token
function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Generate 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Get device info from request
function getDeviceInfo(req: Request) {
  return {
    userAgent: req.get('User-Agent') || 'Unknown',
    ipAddress: req.ip || req.connection.remoteAddress || 'Unknown',
    acceptLanguage: req.get('Accept-Language'),
    acceptEncoding: req.get('Accept-Encoding'),
  };
}

// Hash password with bcrypt
async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

// Verify password with bcrypt
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// Generate unique user ID
function generateUserId(): string {
  return 'user_' + crypto.randomBytes(16).toString('hex');
}

// Clean up expired tokens
async function cleanupExpiredTokens(): Promise<void> {
  try {
    await db.delete(passwordResetTokens)
      .where(lt(passwordResetTokens.expiresAt, new Date()));
  } catch (error) {
    console.error('Error cleaning up expired tokens:', error);
  }
}

// Unlock accounts that have passed lockout duration
async function unlockExpiredAccounts(): Promise<void> {
  try {
    await db.update(users)
      .set({ 
        isLocked: false, 
        loginAttempts: 0, 
        lockedUntil: null 
      })
      .where(and(
        eq(users.isLocked, true),
        lt(users.lockedUntil, new Date())
      ));
  } catch (error) {
    console.error('Error unlocking expired accounts:', error);
  }
}

export function registerAuthRoutes(app: Express): void {
  // User signup endpoint
  app.post('/api/seamless-signup', async (req: Request, res: Response) => {
    try {
      const { email, password, phone } = req.body;

      // Validate input
      if (!email || !password || !phone) {
        return res.status(400).json({
          success: false,
          message: 'Email, password, and phone number are required'
        });
      }

      // Validate email format
      if (!validateEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid email address'
        });
      }

      // Validate password strength
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({
          success: false,
          message: passwordValidation.message
        });
      }

      // Check if user already exists
      const existingUser = await db.select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      if (existingUser.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists. Please use the login form instead.'
        });
      }

      // Hash password
      const passwordHash = await hashPassword(password);

      // Create new user
      const userId = generateUserId();
      const [newUser] = await db.insert(users).values({
        id: userId,
        email: email.toLowerCase(),
        passwordHash,
        phoneNumber: phone,
        firstName: '',
        lastName: '',
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();

      // Generate email verification token
      const emailToken = generateResetToken();
      const emailCode = generateVerificationCode();
      const emailExpiresAt = new Date();
      emailExpiresAt.setHours(emailExpiresAt.getHours() + 24); // 24 hours for email verification

      await db.insert(emailVerificationTokens).values({
        userId: newUser.id,
        email: newUser.email!,
        token: emailToken,
        code: emailCode,
        expiresAt: emailExpiresAt,
        isUsed: false,
        attempts: 0,
        createdAt: new Date()
      });

      // Generate SMS verification code
      const smsCode = generateVerificationCode();
      const smsExpiresAt = new Date();
      smsExpiresAt.setMinutes(smsExpiresAt.getMinutes() + 10); // 10 minutes for SMS

      await db.insert(smsVerificationCodes).values({
        userId: newUser.id,
        phoneNumber: phone,
        code: smsCode,
        purpose: 'signup',
        expiresAt: smsExpiresAt,
        isUsed: false,
        attempts: 0,
        createdAt: new Date()
      });

      // Generate JWT tokens
      const { accessToken, refreshToken } = sessionManager.generateTokens(
        newUser.id,
        newUser.email!,
        newUser.userType
      );

      // Create session record
      const sessionId = sessionManager.generateSessionId();
      const sessionExpiresAt = new Date();
      sessionExpiresAt.setDate(sessionExpiresAt.getDate() + 7); // 7 days

      await db.insert(userSessions).values({
        id: sessionId,
        userId: newUser.id,
        sessionToken: accessToken,
        refreshToken: refreshToken,
        deviceInfo: getDeviceInfo(req),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        isActive: true,
        lastActivityAt: new Date(),
        expiresAt: sessionExpiresAt,
        createdAt: new Date()
      });

      // Send welcome email (async, don't wait)
      emailService.sendWelcomeEmail(newUser.email!, newUser.firstName || '').catch(console.error);

      // Send SMS verification code (async, don't wait)
      smsService.sendVerificationCode(phone, smsCode).catch(console.error);

      // Set secure cookies
      sessionManager.setAuthCookies(res, accessToken, refreshToken, req.secure);
      
      res.json({
        success: true,
        message: 'Account created successfully! Please check your email and phone for verification codes.',
        user: {
          id: newUser.id,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          isVerified: newUser.isVerified
        },
        tokens: {
          accessToken,
          refreshToken
        },
        verificationRequired: {
          email: true,
          phone: true
        }
      });

    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create account. Please try again.'
      });
    }
  });

  // User login endpoint
  app.post('/api/seamless-login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Clean up expired locks
      await unlockExpiredAccounts();

      // Find user by email
      const [user] = await db.select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid email or password. Please check your credentials or create a new account.'
        });
      }

      // Check if account is locked
      if (user.isLocked && user.lockedUntil && user.lockedUntil > new Date()) {
        const unlockTime = user.lockedUntil.toLocaleTimeString();
        return res.status(423).json({
          success: false,
          message: `Account is temporarily locked due to multiple failed login attempts. Please try again after ${unlockTime}.`
        });
      }

      // Check if user has a password hash (might be social login only)
      if (!user.passwordHash) {
        return res.status(401).json({
          success: false,
          message: 'This account uses social login. Please use Facebook or Google to sign in.'
        });
      }

      // Verify password
      const isPasswordValid = await verifyPassword(password, user.passwordHash);

      if (!isPasswordValid) {
        // Increment login attempts
        const newAttempts = (user.loginAttempts || 0) + 1;
        const updateData: any = {
          loginAttempts: newAttempts,
          updatedAt: new Date()
        };

        // Lock account if max attempts reached
        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          const lockUntil = new Date();
          lockUntil.setMinutes(lockUntil.getMinutes() + LOCKOUT_DURATION_MINUTES);
          
          updateData.isLocked = true;
          updateData.lockedUntil = lockUntil;
        }

        await db.update(users)
          .set(updateData)
          .where(eq(users.id, user.id));

        return res.status(401).json({
          success: false,
          message: newAttempts >= MAX_LOGIN_ATTEMPTS 
            ? `Account locked due to multiple failed attempts. Try again in ${LOCKOUT_DURATION_MINUTES} minutes.`
            : `Invalid email or password. ${MAX_LOGIN_ATTEMPTS - newAttempts} attempts remaining.`
        });
      }

      // Generate JWT tokens
      const { accessToken, refreshToken } = sessionManager.generateTokens(
        user.id,
        user.email!,
        user.userType
      );

      // Create session record
      const sessionId = sessionManager.generateSessionId();
      const sessionExpiresAt = new Date();
      sessionExpiresAt.setDate(sessionExpiresAt.getDate() + 7); // 7 days

      await db.insert(userSessions).values({
        id: sessionId,
        userId: user.id,
        sessionToken: accessToken,
        refreshToken: refreshToken,
        deviceInfo: getDeviceInfo(req),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        isActive: true,
        lastActivityAt: new Date(),
        expiresAt: sessionExpiresAt,
        createdAt: new Date()
      });

      // Successful login - reset login attempts and update last login
      await db.update(users)
        .set({
          loginAttempts: 0,
          isLocked: false,
          lockedUntil: null,
          lastLoginAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));

      // Set secure cookies
      sessionManager.setAuthCookies(res, accessToken, refreshToken, req.secure);

      res.json({
        success: true,
        message: 'Login successful! Welcome back to MarketPace.',
        user: {
          id: user.id,
          email: user.email,
          phoneNumber: user.phoneNumber,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
          accountType: user.accountType,
          isPro: user.isPro,
          isVerified: user.isVerified
        },
        tokens: {
          accessToken,
          refreshToken
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed. Please try again.'
      });
    }
  });

  // Forgot password endpoint
  app.post('/api/forgot-password', async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email address is required'
        });
      }

      // Validate email format
      if (!validateEmail(email)) {
        return res.status(400).json({
          success: false,
          message: 'Please enter a valid email address'
        });
      }

      // Clean up expired tokens
      await cleanupExpiredTokens();

      // Find user by email
      const [user] = await db.select()
        .from(users)
        .where(eq(users.email, email.toLowerCase()))
        .limit(1);

      // Always return success to prevent email enumeration attacks
      if (!user) {
        return res.json({
          success: true,
          message: 'If an account with this email exists, you will receive a password reset link shortly.'
        });
      }

      // Generate reset token
      const resetToken = generateResetToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);

      // Store reset token in database
      await db.insert(passwordResetTokens).values({
        userId: user.id,
        email: user.email,
        token: resetToken,
        method: 'email',
        expiresAt,
        isUsed: false,
        createdAt: new Date()
      });

      // In a real application, you would send an email here
      // For demo purposes, we'll log the token
      console.log(`Password reset token for ${email}: ${resetToken}`);
      console.log(`Reset URL: https://your-domain.com/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`);

      res.json({
        success: true,
        message: 'If an account with this email exists, you will receive a password reset link shortly.',
        // For demo purposes only - remove this in production
        resetToken: resetToken,
        resetUrl: `/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process password reset request. Please try again.'
      });
    }
  });

  // Reset password endpoint
  app.post('/api/reset-password', async (req: Request, res: Response) => {
    try {
      const { email, token, newPassword } = req.body;

      if (!email || !token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Email, token, and new password are required'
        });
      }

      // Validate new password
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.valid) {
        return res.status(400).json({
          success: false,
          message: passwordValidation.message
        });
      }

      // Clean up expired tokens
      await cleanupExpiredTokens();

      // Find valid reset token
      const [resetTokenRecord] = await db.select()
        .from(passwordResetTokens)
        .where(and(
          eq(passwordResetTokens.email, email.toLowerCase()),
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.isUsed, false)
        ))
        .limit(1);

      if (!resetTokenRecord) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token. Please request a new password reset.'
        });
      }

      // Check if token has expired
      if (resetTokenRecord.expiresAt < new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Reset token has expired. Please request a new password reset.'
        });
      }

      // Hash new password
      const newPasswordHash = await hashPassword(newPassword);

      // Update user password and reset login attempts
      await db.update(users)
        .set({
          passwordHash: newPasswordHash,
          loginAttempts: 0,
          isLocked: false,
          lockedUntil: null,
          updatedAt: new Date()
        })
        .where(eq(users.id, resetTokenRecord.userId));

      // Mark token as used
      await db.update(passwordResetTokens)
        .set({ isUsed: true })
        .where(eq(passwordResetTokens.id, resetTokenRecord.id));

      res.json({
        success: true,
        message: 'Password reset successful! You can now log in with your new password.'
      });

    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset password. Please try again.'
      });
    }
  });

  // Validate reset token endpoint
  // Email verification endpoint
  app.post('/api/verify-email', async (req: Request, res: Response) => {
    try {
      const { email, code, token } = req.body;

      if (!email || (!code && !token)) {
        return res.status(400).json({
          success: false,
          message: 'Email and verification code or token are required'
        });
      }

      // Find valid verification
      const [emailVerification] = await db.select()
        .from(emailVerificationTokens)
        .where(
          and(
            eq(emailVerificationTokens.email, email.toLowerCase()),
            eq(emailVerificationTokens.isUsed, false),
            lt(new Date(), emailVerificationTokens.expiresAt),
            code ? eq(emailVerificationTokens.code, code) : eq(emailVerificationTokens.token, token)
          )
        )
        .limit(1);

      if (!emailVerification) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification code'
        });
      }

      // Mark as used
      await db.update(emailVerificationTokens)
        .set({ isUsed: true })
        .where(eq(emailVerificationTokens.id, emailVerification.id));

      // Update user verification status
      await db.update(users)
        .set({ 
          isVerified: true,
          emailVerifiedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(users.id, emailVerification.userId));

      res.json({
        success: true,
        message: 'Email successfully verified!'
      });

    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify email'
      });
    }
  });

  // SMS verification endpoint
  app.post('/api/verify-sms', async (req: Request, res: Response) => {
    try {
      const { phone, code, purpose = 'signup' } = req.body;

      if (!phone || !code) {
        return res.status(400).json({
          success: false,
          message: 'Phone number and verification code are required'
        });
      }

      // Find valid verification
      const [smsVerification] = await db.select()
        .from(smsVerificationCodes)
        .where(
          and(
            eq(smsVerificationCodes.phoneNumber, phone),
            eq(smsVerificationCodes.code, code),
            eq(smsVerificationCodes.purpose, purpose),
            eq(smsVerificationCodes.isUsed, false),
            lt(new Date(), smsVerificationCodes.expiresAt)
          )
        )
        .limit(1);

      if (!smsVerification) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification code'
        });
      }

      // Mark as used
      await db.update(smsVerificationCodes)
        .set({ isUsed: true })
        .where(eq(smsVerificationCodes.id, smsVerification.id));

      // Update user phone verification if signup
      if (purpose === 'signup') {
        await db.update(users)
          .set({ 
            phoneVerifiedAt: new Date(),
            updatedAt: new Date()
          })
          .where(eq(users.id, smsVerification.userId));
      }

      res.json({
        success: true,
        message: 'Phone number successfully verified!'
      });

    } catch (error) {
      console.error('SMS verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify phone number'
      });
    }
  });

  // Resend verification codes endpoint
  app.post('/api/resend-verification', async (req: Request, res: Response) => {
    try {
      const { email, phone, type } = req.body;

      if (!type || (type === 'email' && !email) || (type === 'sms' && !phone)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification type or missing required fields'
        });
      }

      if (type === 'email') {
        // Find user by email
        const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
        if (!user) {
          return res.status(400).json({
            success: false,
            message: 'User not found'
          });
        }

        // Generate new email verification
        const emailToken = generateResetToken();
        const emailCode = generateVerificationCode();
        const emailExpiresAt = new Date();
        emailExpiresAt.setHours(emailExpiresAt.getHours() + 24);

        await db.insert(emailVerificationTokens).values({
          userId: user.id,
          email: user.email!,
          token: emailToken,
          code: emailCode,
          expiresAt: emailExpiresAt,
          isUsed: false,
          attempts: 0,
          createdAt: new Date()
        });

        // Send verification email
        emailService.sendWelcomeEmail(user.email!, user.firstName || '').catch(console.error);

        res.json({
          success: true,
          message: 'Verification email sent successfully'
        });

      } else if (type === 'sms') {
        // Find user by phone
        const [user] = await db.select().from(users).where(eq(users.phoneNumber, phone)).limit(1);
        if (!user) {
          return res.status(400).json({
            success: false,
            message: 'User not found'
          });
        }

        // Generate new SMS verification
        const smsCode = generateVerificationCode();
        const smsExpiresAt = new Date();
        smsExpiresAt.setMinutes(smsExpiresAt.getMinutes() + 10);

        await db.insert(smsVerificationCodes).values({
          userId: user.id,
          phoneNumber: phone,
          code: smsCode,
          purpose: 'signup',
          expiresAt: smsExpiresAt,
          isUsed: false,
          attempts: 0,
          createdAt: new Date()
        });

        // Send SMS verification
        smsService.sendVerificationCode(phone, smsCode).catch(console.error);

        res.json({
          success: true,
          message: 'Verification code sent successfully'
        });
      }

    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resend verification'
      });
    }
  });

  // Logout endpoint
  app.post('/api/logout', sessionManager.authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;

      // Deactivate all user sessions
      await db.update(userSessions)
        .set({ isActive: false })
        .where(eq(userSessions.userId, userId));

      // Clear cookies
      sessionManager.clearAuthCookies(res);

      res.json({
        success: true,
        message: 'Successfully logged out'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to logout'
      });
    }
  });

  // Refresh token endpoint
  app.post('/api/refresh-token', async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      const cookieRefreshToken = req.cookies?.refreshToken;
      
      const token = refreshToken || cookieRefreshToken;
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required'
        });
      }

      const newTokens = await sessionManager.refreshAccessToken(token);
      
      if (!newTokens) {
        return res.status(403).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      // Set new cookies
      sessionManager.setAuthCookies(res, newTokens.accessToken, newTokens.refreshToken, req.secure);

      res.json({
        success: true,
        message: 'Tokens refreshed successfully',
        tokens: newTokens
      });

    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to refresh token'
      });
    }
  });

  // Two-Factor Authentication setup verification
  app.post('/api/verify-2fa-setup', async (req: Request, res: Response) => {
    try {
      const { userId, code, secretKey, method } = req.body;

      if (!userId || !code || !method) {
        return res.status(400).json({
          success: false,
          message: 'User ID, verification code, and method are required'
        });
      }

      if (method === 'authenticator') {
        // For authenticator apps, verify the TOTP code
        // In a real implementation, you would use a TOTP library to verify the code
        const isValidCode = code.length === 6 && /^\d+$/.test(code);
        
        if (!isValidCode) {
          return res.status(400).json({
            success: false,
            message: 'Invalid verification code format'
          });
        }
      }

      // For demo purposes, accept any 6-digit code
      res.json({
        success: true,
        message: 'Two-factor authentication verified successfully',
        method: method
      });

    } catch (error) {
      console.error('2FA setup verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify two-factor authentication setup'
      });
    }
  });

  // Setup SMS two-factor authentication
  app.post('/api/setup-2fa-sms', async (req: Request, res: Response) => {
    try {
      const { userId, phoneNumber } = req.body;

      if (!userId || !phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'User ID and phone number are required'
        });
      }

      // Generate SMS verification code
      const smsCode = generateVerificationCode();
      const smsExpiresAt = new Date();
      smsExpiresAt.setMinutes(smsExpiresAt.getMinutes() + 10);

      // Store SMS verification in database
      await db.insert(smsVerificationCodes).values({
        userId: userId,
        phoneNumber: phoneNumber,
        code: smsCode,
        purpose: '2fa_setup',
        expiresAt: smsExpiresAt,
        isUsed: false,
        attempts: 0,
        createdAt: new Date()
      });

      // Send SMS verification code
      await smsService.sendVerificationCode(phoneNumber, smsCode);

      res.json({
        success: true,
        message: 'SMS verification code sent successfully'
      });

    } catch (error) {
      console.error('SMS 2FA setup error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to setup SMS two-factor authentication'
      });
    }
  });

  // Setup Email two-factor authentication
  app.post('/api/setup-2fa-email', async (req: Request, res: Response) => {
    try {
      const { userId, emailAddress } = req.body;

      if (!userId || !emailAddress) {
        return res.status(400).json({
          success: false,
          message: 'User ID and email address are required'
        });
      }

      // Generate email verification
      const emailToken = generateResetToken();
      const emailCode = generateVerificationCode();
      const emailExpiresAt = new Date();
      emailExpiresAt.setHours(emailExpiresAt.getHours() + 1);

      // Store email verification in database
      await db.insert(emailVerificationTokens).values({
        userId: userId,
        email: emailAddress,
        token: emailToken,
        code: emailCode,
        expiresAt: emailExpiresAt,
        isUsed: false,
        attempts: 0,
        createdAt: new Date()
      });

      // Send verification email
      await emailService.sendVerificationEmail(emailAddress, emailCode);

      res.json({
        success: true,
        message: 'Verification email sent successfully'
      });

    } catch (error) {
      console.error('Email 2FA setup error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to setup email two-factor authentication'
      });
    }
  });

  // Complete two-factor authentication setup
  app.post('/api/complete-2fa-setup', async (req: Request, res: Response) => {
    try {
      const { userId, method, secretKey, recoveryCodes } = req.body;

      if (!userId || !method) {
        return res.status(400).json({
          success: false,
          message: 'User ID and method are required'
        });
      }

      // Update user with 2FA settings
      await db.update(users)
        .set({
          twoFactorEnabled: true,
          twoFactorMethod: method,
          twoFactorSecret: secretKey || null,
          twoFactorRecoveryCodes: recoveryCodes ? JSON.stringify(recoveryCodes) : null,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      res.json({
        success: true,
        message: 'Two-factor authentication setup completed successfully'
      });

    } catch (error) {
      console.error('2FA setup completion error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete two-factor authentication setup'
      });
    }
  });

  // Device management API endpoints
  app.get('/api/user/devices', sessionManager.authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;
      
      // Get user's trusted devices from database
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      const trustedDevices = user.trustedDevices ? JSON.parse(user.trustedDevices as string) : [];
      
      res.json({
        success: true,
        devices: trustedDevices
      });
      
    } catch (error) {
      console.error('Get devices error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve devices'
      });
    }
  });
  
  // Trust a device
  app.post('/api/user/devices/trust', sessionManager.authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const { deviceId, deviceInfo } = req.body;
      
      if (!deviceId || !deviceInfo) {
        return res.status(400).json({
          success: false,
          message: 'Device ID and device info are required'
        });
      }
      
      // Get current trusted devices
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      const trustedDevices = user.trustedDevices ? JSON.parse(user.trustedDevices as string) : [];
      
      // Add new device if not already trusted
      const existingDevice = trustedDevices.find((device: any) => device.id === deviceId);
      if (!existingDevice) {
        trustedDevices.push({
          id: deviceId,
          ...deviceInfo,
          trustedAt: new Date().toISOString()
        });
        
        // Update user record
        await db.update(users)
          .set({
            trustedDevices: JSON.stringify(trustedDevices),
            updatedAt: new Date()
          })
          .where(eq(users.id, userId));
      }
      
      res.json({
        success: true,
        message: 'Device trusted successfully'
      });
      
    } catch (error) {
      console.error('Trust device error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to trust device'
      });
    }
  });
  
  // Revoke device trust
  app.post('/api/user/devices/revoke', sessionManager.authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const { deviceId } = req.body;
      
      if (!deviceId) {
        return res.status(400).json({
          success: false,
          message: 'Device ID is required'
        });
      }
      
      // Get current trusted devices
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      const trustedDevices = user.trustedDevices ? JSON.parse(user.trustedDevices as string) : [];
      
      // Remove device from trusted list
      const updatedDevices = trustedDevices.filter((device: any) => device.id !== deviceId);
      
      // Update user record
      await db.update(users)
        .set({
          trustedDevices: JSON.stringify(updatedDevices),
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
      
      res.json({
        success: true,
        message: 'Device trust revoked successfully'
      });
      
    } catch (error) {
      console.error('Revoke device error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to revoke device trust'
      });
    }
  });
  
  // Update biometric settings
  app.post('/api/user/biometric', sessionManager.authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const { settings } = req.body;
      
      if (!settings) {
        return res.status(400).json({
          success: false,
          message: 'Biometric settings are required'
        });
      }
      
      // Update user biometric settings
      await db.update(users)
        .set({
          biometricEnabled: Object.values(settings).some(Boolean),
          biometricSettings: JSON.stringify(settings),
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
      
      res.json({
        success: true,
        message: 'Biometric settings updated successfully'
      });
      
    } catch (error) {
      console.error('Update biometric settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update biometric settings'
      });
    }
  });
  
  // Verify email verification code
  app.post('/api/verify-email', async (req: Request, res: Response) => {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return res.status(400).json({
          success: false,
          message: 'Email and verification code are required'
        });
      }

      // Find the verification token
      const [token] = await db.select()
        .from(emailVerificationTokens)
        .where(
          and(
            eq(emailVerificationTokens.email, email),
            eq(emailVerificationTokens.code, code),
            eq(emailVerificationTokens.isUsed, false)
          )
        )
        .limit(1);

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification code'
        });
      }

      // Check if token has expired
      if (new Date() > token.expiresAt) {
        return res.status(400).json({
          success: false,
          message: 'Verification code has expired'
        });
      }

      // Mark token as used
      await db.update(emailVerificationTokens)
        .set({ isUsed: true })
        .where(eq(emailVerificationTokens.id, token.id));

      // Update user's email verification status
      await db.update(users)
        .set({ 
          emailVerifiedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(users.id, token.userId));

      res.json({
        success: true,
        message: 'Email verified successfully'
      });

    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify email'
      });
    }
  });

  // Verify SMS verification code
  app.post('/api/verify-sms', async (req: Request, res: Response) => {
    try {
      const { phone, code, purpose = 'signup' } = req.body;

      if (!phone || !code) {
        return res.status(400).json({
          success: false,
          message: 'Phone number and verification code are required'
        });
      }

      // Find the verification code
      const [smsCode] = await db.select()
        .from(smsVerificationCodes)
        .where(
          and(
            eq(smsVerificationCodes.phoneNumber, phone),
            eq(smsVerificationCodes.code, code),
            eq(smsVerificationCodes.purpose, purpose),
            eq(smsVerificationCodes.isUsed, false)
          )
        )
        .limit(1);

      if (!smsCode) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification code'
        });
      }

      // Check if code has expired
      if (new Date() > smsCode.expiresAt) {
        return res.status(400).json({
          success: false,
          message: 'Verification code has expired'
        });
      }

      // Mark code as used
      await db.update(smsVerificationCodes)
        .set({ isUsed: true })
        .where(eq(smsVerificationCodes.id, smsCode.id));

      // Update user's phone verification status
      await db.update(users)
        .set({ 
          phoneVerifiedAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(users.id, smsCode.userId));

      res.json({
        success: true,
        message: 'Phone number verified successfully'
      });

    } catch (error) {
      console.error('SMS verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify phone number'
      });
    }
  });

  // Resend verification code
  app.post('/api/resend-verification', async (req: Request, res: Response) => {
    try {
      const { email, phone, type } = req.body;

      if (type === 'email' && email) {
        // Generate new email verification code
        const emailCode = generateVerificationCode();
        const emailExpiresAt = new Date();
        emailExpiresAt.setHours(emailExpiresAt.getHours() + 1);

        // Find user by email
        const [user] = await db.select()
          .from(users)
          .where(eq(users.email, email))
          .limit(1);

        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        // Create new verification token
        await db.insert(emailVerificationTokens).values({
          userId: user.id,
          email: email,
          token: generateResetToken(),
          code: emailCode,
          expiresAt: emailExpiresAt,
          isUsed: false,
          attempts: 0,
          createdAt: new Date()
        });

        // Send verification email
        await emailService.sendVerificationEmail(email, emailCode);

        res.json({
          success: true,
          message: 'Verification email sent successfully'
        });

      } else if (type === 'sms' && phone) {
        // Generate new SMS verification code
        const smsCode = generateVerificationCode();
        const smsExpiresAt = new Date();
        smsExpiresAt.setMinutes(smsExpiresAt.getMinutes() + 10);

        // Find user by phone
        const [user] = await db.select()
          .from(users)
          .where(eq(users.phoneNumber, phone))
          .limit(1);

        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found'
          });
        }

        // Create new verification code
        await db.insert(smsVerificationCodes).values({
          userId: user.id,
          phoneNumber: phone,
          code: smsCode,
          purpose: 'signup',
          expiresAt: smsExpiresAt,
          isUsed: false,
          attempts: 0,
          createdAt: new Date()
        });

        // Send SMS verification code
        await smsService.sendVerificationCode(phone, smsCode);

        res.json({
          success: true,
          message: 'SMS verification code sent successfully'
        });

      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid verification type or missing contact information'
        });
      }

    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to resend verification code'
      });
    }
  });

  // Add security alert
  app.post('/api/user/security-alert', sessionManager.authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId!;
      const { type, title, message, severity = 'info' } = req.body;
      
      if (!type || !title || !message) {
        return res.status(400).json({
          success: false,
          message: 'Type, title, and message are required'
        });
      }
      
      // Get current security alerts
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }
      
      const securityAlerts = user.securityAlerts ? JSON.parse(user.securityAlerts as string) : [];
      
      // Add new alert
      const newAlert = {
        id: Date.now(),
        type,
        title,
        message,
        severity,
        timestamp: new Date().toISOString(),
        read: false
      };
      
      securityAlerts.unshift(newAlert);
      
      // Keep only last 50 alerts
      if (securityAlerts.length > 50) {
        securityAlerts.splice(50);
      }
      
      // Update user record
      await db.update(users)
        .set({
          securityAlerts: JSON.stringify(securityAlerts),
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));
      
      res.json({
        success: true,
        message: 'Security alert added successfully',
        alert: newAlert
      });
      
    } catch (error) {
      console.error('Add security alert error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add security alert'
      });
    }
  });

  app.post('/api/validate-reset-token', async (req: Request, res: Response) => {
    try {
      const { email, token } = req.body;

      if (!email || !token) {
        return res.status(400).json({
          success: false,
          message: 'Email and token are required'
        });
      }

      // Clean up expired tokens
      await cleanupExpiredTokens();

      // Find valid reset token
      const [resetTokenRecord] = await db.select()
        .from(passwordResetTokens)
        .where(and(
          eq(passwordResetTokens.email, email.toLowerCase()),
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.isUsed, false)
        ))
        .limit(1);

      const isValid = resetTokenRecord && resetTokenRecord.expiresAt > new Date();

      res.json({
        success: true,
        valid: isValid,
        message: isValid ? 'Token is valid' : 'Invalid or expired token'
      });

    } catch (error) {
      console.error('Token validation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to validate token'
      });
    }
  });
}

// Run cleanup tasks every hour
setInterval(() => {
  cleanupExpiredTokens();
  unlockExpiredAccounts();
}, 60 * 60 * 1000);