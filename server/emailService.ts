const nodemailer = require('nodemailer');

// Email service for authentication and notifications
class EmailService {
  private transporter: any;

  constructor() {
    // Configure email transporter - using SMTP settings
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'MarketPace.contact@gmail.com', // Explicit Gmail address
        pass: 'xqgijzurfbzuvzhf', // Gmail App Password (spaces removed)
      },
    });
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"MarketPace" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Welcome to MarketPace! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0d0221 0%, #1a0233 50%, #2d1b69 100%); color: white; border-radius: 10px; overflow: hidden;">
            <div style="padding: 40px; text-align: center;">
              <h1 style="background: linear-gradient(135deg, #00ffff, #9d4edd); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 32px; margin: 0 0 20px 0;">MarketPace</h1>
              
              <h2 style="color: #00ffff; margin: 0 0 20px 0;">Welcome to Your Local Community Marketplace!</h2>
              
              <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi ${firstName || 'there'}!</p>
              
              <p style="font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Thank you for joining MarketPace! You're now part of a community-focused marketplace that empowers local businesses and connects neighbors.
              </p>
              
              <div style="background: rgba(0, 255, 255, 0.1); border: 1px solid rgba(0, 255, 255, 0.3); border-radius: 10px; padding: 20px; margin: 0 0 30px 0;">
                <h3 style="color: #00ffff; margin: 0 0 15px 0;">What you can do now:</h3>
                <ul style="text-align: left; padding-left: 20px;">
                  <li style="margin: 10px 0;">Browse local listings and find great deals</li>
                  <li style="margin: 10px 0;">Post items for sale or rent</li>
                  <li style="margin: 10px 0;">Connect with local service providers</li>
                  <li style="margin: 10px 0;">Join community discussions</li>
                  <li style="margin: 10px 0;">Apply to become a driver for extra income</li>
                </ul>
              </div>
              
              <a href="${process.env.APP_URL || 'https://your-domain.com'}/community" 
                 style="display: inline-block; background: linear-gradient(135deg, #00ffff, #9d4edd); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 0 0 30px 0;">
                Explore MarketPace Now
              </a>
              
              <p style="font-size: 14px; color: rgba(255, 255, 255, 0.7); margin: 0;">
                Need help? Reply to this email or visit our <a href="${process.env.APP_URL || 'https://your-domain.com'}/help" style="color: #00ffff;">Help Center</a>
              </p>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Welcome email error:', error);
      return false;
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string, firstName?: string): Promise<boolean> {
    try {
      const resetUrl = `${process.env.APP_URL || 'https://your-domain.com'}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
      
      const mailOptions = {
        from: `"MarketPace Security" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Reset Your MarketPace Password 🔒',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0d0221 0%, #1a0233 50%, #2d1b69 100%); color: white; border-radius: 10px; overflow: hidden;">
            <div style="padding: 40px; text-align: center;">
              <h1 style="background: linear-gradient(135deg, #00ffff, #9d4edd); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 32px; margin: 0 0 20px 0;">MarketPace</h1>
              
              <h2 style="color: #ff6b6b; margin: 0 0 20px 0;">Password Reset Request</h2>
              
              <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi ${firstName || 'there'}!</p>
              
              <p style="font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                We received a request to reset your MarketPace password. If you made this request, click the button below to create a new password.
              </p>
              
              <a href="${resetUrl}" 
                 style="display: inline-block; background: linear-gradient(135deg, #ff6b6b, #ff8e8e); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 0 0 30px 0;">
                Reset My Password
              </a>
              
              <div style="background: rgba(255, 107, 107, 0.1); border: 1px solid rgba(255, 107, 107, 0.3); border-radius: 10px; padding: 20px; margin: 0 0 30px 0;">
                <p style="font-size: 14px; margin: 0 0 10px 0;"><strong>Important Security Notes:</strong></p>
                <ul style="text-align: left; padding-left: 20px; font-size: 14px;">
                  <li style="margin: 5px 0;">This link expires in 1 hour for your security</li>
                  <li style="margin: 5px 0;">If you didn't request this reset, please ignore this email</li>
                  <li style="margin: 5px 0;">Never share this link with anyone</li>
                </ul>
              </div>
              
              <p style="font-size: 12px; color: rgba(255, 255, 255, 0.5); margin: 0; word-break: break-all;">
                If the button doesn't work, copy and paste this link: ${resetUrl}
              </p>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Password reset email error:', error);
      return false;
    }
  }

  async sendAccountLockoutNotification(email: string, unlockTime: Date, firstName?: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"MarketPace Security" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'MarketPace Account Security Alert 🛡️',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0d0221 0%, #1a0233 50%, #2d1b69 100%); color: white; border-radius: 10px; overflow: hidden;">
            <div style="padding: 40px; text-align: center;">
              <h1 style="background: linear-gradient(135deg, #00ffff, #9d4edd); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 32px; margin: 0 0 20px 0;">MarketPace</h1>
              
              <h2 style="color: #ffa500; margin: 0 0 20px 0;">Account Temporarily Locked</h2>
              
              <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi ${firstName || 'there'}!</p>
              
              <p style="font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Your MarketPace account has been temporarily locked due to multiple failed login attempts.
              </p>
              
              <div style="background: rgba(255, 165, 0, 0.1); border: 1px solid rgba(255, 165, 0, 0.3); border-radius: 10px; padding: 20px; margin: 0 0 30px 0;">
                <p style="font-size: 16px; margin: 0 0 10px 0;"><strong>Account will unlock at:</strong></p>
                <p style="font-size: 18px; color: #ffa500; margin: 0;">${unlockTime.toLocaleString()}</p>
              </div>
              
              <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                If this wasn't you, please contact our support team immediately. You can also reset your password if you've forgotten it.
              </p>
              
              <a href="${process.env.APP_URL || 'https://your-domain.com'}/signup-login" 
                 style="display: inline-block; background: linear-gradient(135deg, #00ffff, #9d4edd); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; font-size: 16px; margin: 0 0 30px 0;">
                Reset Password
              </a>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Account lockout email error:', error);
      return false;
    }
  }

  async sendPasswordChangeConfirmation(email: string, firstName?: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: `"MarketPace Security" <${process.env.SMTP_USER}>`,
        to: email,
        subject: 'Password Successfully Updated ✅',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #0d0221 0%, #1a0233 50%, #2d1b69 100%); color: white; border-radius: 10px; overflow: hidden;">
            <div style="padding: 40px; text-align: center;">
              <h1 style="background: linear-gradient(135deg, #00ffff, #9d4edd); background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-size: 32px; margin: 0 0 20px 0;">MarketPace</h1>
              
              <h2 style="color: #4ade80; margin: 0 0 20px 0;">Password Successfully Updated</h2>
              
              <p style="font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hi ${firstName || 'there'}!</p>
              
              <p style="font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Your MarketPace password has been successfully updated. Your account is now secure with your new password.
              </p>
              
              <div style="background: rgba(74, 222, 128, 0.1); border: 1px solid rgba(74, 222, 128, 0.3); border-radius: 10px; padding: 20px; margin: 0 0 30px 0;">
                <p style="font-size: 14px; margin: 0;"><strong>Security Tip:</strong> Keep your password safe and never share it with anyone. Consider using a password manager for better security.</p>
              </div>
              
              <p style="font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
                If you didn't make this change, please contact our support team immediately.
              </p>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Password change confirmation email error:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();

// Export helper function for sponsor notifications  
export const sendEmail = async (options: { to: string; subject: string; html: string }): Promise<boolean> => {
  try {
    const mailOptions = {
      from: `"MarketPace" <${process.env.SMTP_USER || 'MarketPace.contact@gmail.com'}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    };

    await emailService.transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${options.to}`);
    return true;
  } catch (error) {
    console.error('Email send error:', error);
    return false;
  }
};