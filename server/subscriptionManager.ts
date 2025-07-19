import { Router } from 'express';
import { sendSMS } from './smsService';
import { sendEmail } from './emailService';

const router = Router();

// Subscription management system for Pro members
class SubscriptionManager {
  
  // Check for expiring free subscriptions (run daily)
  static async checkExpiringSubscriptions() {
    try {
      console.log('Checking for expiring Pro subscriptions...');
      
      // Get all Pro members with free subscriptions expiring soon
      const expiringMembers = await this.getExpiringMembers();
      
      for (const member of expiringMembers) {
        await this.sendExpirationNotifications(member);
      }
      
      console.log(`Processed ${expiringMembers.length} expiring subscriptions`);
      
    } catch (error) {
      console.error('Error checking expiring subscriptions:', error);
    }
  }
  
  // Get members whose free subscriptions are expiring
  static async getExpiringMembers() {
    // Demo data for testing - in production, this would query the database
    const now = new Date();
    const expirationDate = new Date('2026-01-01');
    const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    // Return demo members who need notifications
    const demoMembers = [
      {
        id: 'user_001',
        email: 'sarah@example.com',
        phone: '+12345678901',
        businessName: 'Sarah\'s Boutique',
        subscriptionType: 'pro_free_launch',
        expirationDate: '2026-01-01',
        daysUntilExpiration,
        lastNotificationSent: null,
        isActive: true
      },
      {
        id: 'user_002',
        email: 'mike@example.com', 
        phone: '+12345678902',
        businessName: 'Mike\'s Handyman Services',
        subscriptionType: 'pro_free_launch',
        expirationDate: '2026-01-01',
        daysUntilExpiration,
        lastNotificationSent: null,
        isActive: true
      }
    ];
    
    // Filter members who need notifications (30, 14, 7, 3, 1 days before expiration)
    const notificationDays = [30, 14, 7, 3, 1];
    return demoMembers.filter(member => 
      notificationDays.includes(member.daysUntilExpiration) && 
      member.isActive
    );
  }
  
  // Send expiration notifications via email and SMS
  static async sendExpirationNotifications(member: any) {
    try {
      console.log(`Sending expiration notification to ${member.businessName}`);
      
      // Create payment link for subscription renewal
      const paymentLink = `https://marketpace.shop/subscribe?userId=${member.id}&plan=pro`;
      
      // Email notification
      if (member.email) {
        await this.sendExpirationEmail(member, paymentLink);
      }
      
      // SMS notification
      if (member.phone) {
        await this.sendExpirationSMS(member, paymentLink);
      }
      
      // Update last notification timestamp
      await this.updateNotificationTimestamp(member.id);
      
    } catch (error) {
      console.error(`Error sending notifications to ${member.businessName}:`, error);
    }
  }
  
  // Send expiration email
  static async sendExpirationEmail(member: any, paymentLink: string) {
    const subject = `Your MarketPace Pro subscription expires in ${member.daysUntilExpiration} days`;
    
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a0b3d, #2d1b69); color: white; border-radius: 10px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #FFD700, #FFA500); padding: 30px; text-align: center;">
          <h1 style="margin: 0; color: #1a0b3d; font-size: 28px;">MarketPace Pro</h1>
          <p style="margin: 10px 0 0; color: #1a0b3d; font-size: 16px;">Your subscription is expiring soon</p>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #FFD700; margin-bottom: 20px;">Hi ${member.businessName}!</h2>
          
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
            Your free MarketPace Pro subscription (part of our launch campaign) will expire in 
            <strong style="color: #FFD700;">${member.daysUntilExpiration} days</strong> on January 1, 2026.
          </p>
          
          <div style="background: rgba(255, 215, 0, 0.1); border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 8px; padding: 20px; margin-bottom: 25px;">
            <h3 style="color: #FFD700; margin-bottom: 15px;">What happens next?</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">Your Pro features will be frozen (not deleted) if payment isn't updated</li>
              <li style="margin-bottom: 8px;">You can reactivate anytime by updating your subscription</li>
              <li style="margin-bottom: 8px;">Account deletion only occurs after 6 months of inactivity</li>
              <li>All your business data and settings will be preserved</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-bottom: 25px;">
            <a href="${paymentLink}" style="
              background: linear-gradient(135deg, #FFD700, #FFA500); 
              color: #1a0b3d; 
              text-decoration: none; 
              padding: 15px 30px; 
              border-radius: 25px; 
              font-weight: bold; 
              font-size: 16px;
              display: inline-block;
            ">Continue Pro Subscription</a>
          </div>
          
          <div style="background: rgba(0, 255, 255, 0.1); border: 1px solid rgba(0, 255, 255, 0.3); border-radius: 8px; padding: 15px; text-align: center;">
            <p style="margin: 0; font-size: 14px;">
              Questions? Contact us at 
              <a href="mailto:MarketPace.contact@gmail.com" style="color: #00ffff;">MarketPace.contact@gmail.com</a>
            </p>
          </div>
        </div>
      </div>
    `;
    
    await sendEmail({
      to: member.email,
      subject,
      html: htmlContent
    });
    
    console.log(`Expiration email sent to ${member.email}`);
  }
  
  // Send expiration SMS
  static async sendExpirationSMS(member: any, paymentLink: string) {
    const message = `MarketPace Pro Alert: Your free subscription expires in ${member.daysUntilExpiration} days (Jan 1, 2026). Continue Pro features: ${paymentLink} - Your account will be frozen (not deleted) if not renewed. Questions? MarketPace.contact@gmail.com`;
    
    await sendSMS(member.phone, message);
    console.log(`Expiration SMS sent to ${member.phone}`);
  }
  
  // Update notification timestamp
  static async updateNotificationTimestamp(userId: string) {
    // In production, update database record
    console.log(`Updated notification timestamp for user ${userId}`);
  }
  
  // Freeze Pro account (called when subscription expires)
  static async freezeProAccount(userId: string) {
    try {
      console.log(`Freezing Pro account for user ${userId}`);
      
      // In production, update database to set account status to 'frozen'
      const updateData = {
        proStatus: 'frozen',
        frozenDate: new Date().toISOString(),
        canReactivate: true
      };
      
      console.log('Account frozen:', updateData);
      
      // Send account frozen notification
      await this.sendAccountFrozenNotification(userId);
      
    } catch (error) {
      console.error(`Error freezing account ${userId}:`, error);
    }
  }
  
  // Reactivate Pro account
  static async reactivateProAccount(userId: string, newSubscriptionId: string) {
    try {
      console.log(`Reactivating Pro account for user ${userId}`);
      
      // In production, update database
      const updateData = {
        proStatus: 'active',
        reactivatedDate: new Date().toISOString(),
        subscriptionId: newSubscriptionId,
        frozenDate: null
      };
      
      console.log('Account reactivated:', updateData);
      
      // Send reactivation confirmation
      await this.sendReactivationConfirmation(userId);
      
    } catch (error) {
      console.error(`Error reactivating account ${userId}:`, error);
    }
  }
  
  // Send account frozen notification
  static async sendAccountFrozenNotification(userId: string) {
    // Implementation for frozen account notification
    console.log(`Sent account frozen notification to user ${userId}`);
  }
  
  // Send reactivation confirmation
  static async sendReactivationConfirmation(userId: string) {
    // Implementation for reactivation confirmation
    console.log(`Sent reactivation confirmation to user ${userId}`);
  }
  
  // Schedule automatic account deletion after 6 months of inactivity
  static async scheduleAccountDeletion(userId: string) {
    const deletionDate = new Date();
    deletionDate.setMonth(deletionDate.getMonth() + 6);
    
    console.log(`Scheduled account deletion for user ${userId} on ${deletionDate.toISOString()}`);
    
    // In production, this would create a scheduled job
  }
}

// API Routes for subscription management

// Check expiring subscriptions (admin endpoint)
router.post('/api/subscriptions/check-expiring', async (req, res) => {
  try {
    await SubscriptionManager.checkExpiringSubscriptions();
    res.json({ success: true, message: 'Expiring subscriptions checked' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Freeze account (admin endpoint)
router.post('/api/subscriptions/freeze/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    await SubscriptionManager.freezeProAccount(userId);
    res.json({ success: true, message: 'Account frozen' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reactivate account
router.post('/api/subscriptions/reactivate/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { subscriptionId } = req.body;
    await SubscriptionManager.reactivateProAccount(userId, subscriptionId);
    res.json({ success: true, message: 'Account reactivated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Test notification system
router.post('/api/subscriptions/test-notifications', async (req, res) => {
  try {
    const testMember = {
      id: 'test_user',
      email: 'test@example.com',
      phone: '+12512826662', // Your phone number for testing
      businessName: 'Test Business',
      subscriptionType: 'pro_free_launch',
      expirationDate: '2026-01-01',
      daysUntilExpiration: 7,
      lastNotificationSent: null,
      isActive: true
    };
    
    await SubscriptionManager.sendExpirationNotifications(testMember);
    res.json({ success: true, message: 'Test notifications sent' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { router as subscriptionRoutes, SubscriptionManager };