import { Express, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { db } from './db';
import { users, passwordResetTokens } from '../shared/schema';
import { eq, and, lt } from 'drizzle-orm';

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

      // Set session or user context (for demo purposes, we'll use a simple approach)
      // In production, you would set up proper session management or JWT tokens
      
      res.json({
        success: true,
        message: 'Account created successfully! Welcome to MarketPace.',
        user: {
          id: newUser.id,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber,
          firstName: newUser.firstName,
          lastName: newUser.lastName
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
          isPro: user.isPro
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