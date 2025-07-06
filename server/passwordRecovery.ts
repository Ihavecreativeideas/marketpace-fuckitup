import type { Express } from "express";

export interface PasswordResetRequest {
  email: string;
  resetToken: string;
  expiresAt: Date;
  createdAt: Date;
}

class PasswordRecoveryManager {
  private static resetRequests: Map<string, PasswordResetRequest> = new Map();

  static generateResetToken(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  static async requestPasswordReset(email: string): Promise<string> {
    const resetToken = this.generateResetToken();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiry

    const resetRequest: PasswordResetRequest = {
      email,
      resetToken,
      expiresAt,
      createdAt: new Date()
    };

    this.resetRequests.set(email, resetRequest);

    // Send reset email (simulated)
    await this.sendPasswordResetEmail(email, resetToken);

    return resetToken;
  }

  private static async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    console.log(`
=== PASSWORD RESET EMAIL SENT ===
To: ${email}
Subject: Reset Your MarketPlace Password

Someone requested a password reset for your MarketPlace account.

Reset Link: https://marketpace.app/reset-password?token=${resetToken}

This link expires in 1 hour.

If you didn't request this reset, please ignore this email.

Best regards,
MarketPlace Support Team
==============================
    `);
  }

  static validateResetToken(email: string, token: string): boolean {
    const resetRequest = this.resetRequests.get(email);
    
    if (!resetRequest) {
      return false;
    }

    if (resetRequest.resetToken !== token) {
      return false;
    }

    if (new Date() > resetRequest.expiresAt) {
      this.resetRequests.delete(email);
      return false;
    }

    return true;
  }

  static async resetPassword(email: string, token: string, newPassword: string): Promise<boolean> {
    if (!this.validateResetToken(email, token)) {
      return false;
    }

    // Here you would update the user's password in the database
    // For now, we'll just simulate it
    console.log(`Password reset successful for ${email}`);

    // Clean up the reset request
    this.resetRequests.delete(email);

    return true;
  }

  static cleanupExpiredTokens(): void {
    const now = new Date();
    for (const [email, request] of this.resetRequests.entries()) {
      if (now > request.expiresAt) {
        this.resetRequests.delete(email);
      }
    }
  }
}

export function registerPasswordRecoveryRoutes(app: Express): void {
  // Request password reset
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email is required'
        });
      }

      const resetToken = await PasswordRecoveryManager.requestPasswordReset(email);

      res.json({
        success: true,
        message: 'If an account with this email exists, you will receive a password reset link.',
        // In production, don't return the token
        token: resetToken
      });
    } catch (error) {
      console.error('Password reset request error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process password reset request'
      });
    }
  });

  // Reset password with token
  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { email, token, newPassword } = req.body;

      if (!email || !token || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Email, token, and new password are required'
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 8 characters long'
        });
      }

      const success = await PasswordRecoveryManager.resetPassword(email, token, newPassword);

      if (!success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }

      res.json({
        success: true,
        message: 'Password reset successfully'
      });
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to reset password'
      });
    }
  });

  // Validate reset token
  app.post('/api/auth/validate-reset-token', async (req, res) => {
    try {
      const { email, token } = req.body;

      if (!email || !token) {
        return res.status(400).json({
          success: false,
          message: 'Email and token are required'
        });
      }

      const isValid = PasswordRecoveryManager.validateResetToken(email, token);

      res.json({
        success: true,
        valid: isValid
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

// Cleanup expired tokens every hour
setInterval(() => {
  PasswordRecoveryManager.cleanupExpiredTokens();
}, 60 * 60 * 1000);

export { PasswordRecoveryManager };