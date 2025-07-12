// Note: Twilio is installed but will gracefully handle missing configuration
let Twilio: any;
try {
  Twilio = require('twilio').Twilio;
} catch (error) {
  console.log('Twilio not available - SMS features disabled');
}

// SMS service for authentication and notifications
class SMSService {
  private client: any = null;

  constructor() {
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && Twilio) {
      try {
        this.client = new Twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        console.log('SMS Service initialized successfully with Twilio');
      } catch (error) {
        console.log('Twilio initialization failed:', error);
      }
    } else {
      console.log('Twilio credentials not configured - SMS features will be disabled');
    }
  }

  private isEnabled(): boolean {
    return this.client !== null && !!process.env.TWILIO_PHONE_NUMBER;
  }

  async sendVerificationCode(phoneNumber: string, code: string): Promise<boolean> {
    if (!this.isEnabled()) {
      console.log(`SMS Service not configured. Verification code for ${phoneNumber}: ${code}`);
      return false; // Return false to indicate SMS not sent
    }

    try {
      const message = await this.client!.messages.create({
        body: `Your MarketPace verification code is: ${code}. This code expires in 10 minutes. Don't share this code with anyone.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });
      console.log(`SMS sent successfully to ${phoneNumber}, SID: ${message.sid}`);
      return true;
    } catch (error) {
      console.error('SMS verification error:', error);
      return false;
    }
  }

  async sendPasswordResetCode(phoneNumber: string, code: string): Promise<boolean> {
    if (!this.isEnabled()) {
      console.log(`SMS Service not configured. Password reset code for ${phoneNumber}: ${code}`);
      return true; // Return true for demo purposes
    }

    try {
      await this.client!.messages.create({
        body: `Your MarketPace password reset code is: ${code}. This code expires in 1 hour. If you didn't request this, please ignore this message.`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });
      return true;
    } catch (error) {
      console.error('SMS password reset error:', error);
      return false;
    }
  }

  async sendAccountAlert(phoneNumber: string, message: string): Promise<boolean> {
    if (!this.isEnabled()) {
      console.log(`SMS Service not configured. Alert for ${phoneNumber}: ${message}`);
      return true; // Return true for demo purposes
    }

    try {
      await this.client!.messages.create({
        body: `MarketPace Security Alert: ${message}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });
      return true;
    } catch (error) {
      console.error('SMS alert error:', error);
      return false;
    }
  }

  async sendWelcomeSMS(phoneNumber: string, firstName?: string): Promise<boolean> {
    if (!this.isEnabled()) {
      console.log(`SMS Service not configured. Welcome SMS for ${phoneNumber}`);
      return true; // Return true for demo purposes
    }

    try {
      const message = `Welcome to MarketPace${firstName ? `, ${firstName}` : ''}! 🎉 Start exploring your local community marketplace at ${process.env.APP_URL || 'marketpace.shop'}. Reply STOP to opt out.`;
      
      await this.client!.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phoneNumber,
      });
      return true;
    } catch (error) {
      console.error('Welcome SMS error:', error);
      return false;
    }
  }

  generateVerificationCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Add +1 if it's a 10-digit US number
    if (cleaned.length === 10) {
      return `+1${cleaned}`;
    }
    
    // Add + if it doesn't start with it
    if (!cleaned.startsWith('+')) {
      return `+${cleaned}`;
    }
    
    return cleaned;
  }
}

export const smsService = new SMSService();