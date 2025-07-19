import { SubscriptionManager } from './subscriptionManager';

// Subscription monitoring and automatic management
class SubscriptionScheduler {
  private static instance: SubscriptionScheduler;
  private intervalId: NodeJS.Timeout | null = null;
  
  static getInstance(): SubscriptionScheduler {
    if (!SubscriptionScheduler.instance) {
      SubscriptionScheduler.instance = new SubscriptionScheduler();
    }
    return SubscriptionScheduler.instance;
  }
  
  // Start automatic subscription monitoring
  start() {
    console.log('🔔 Subscription monitoring started');
    
    // Check every 24 hours for expiring subscriptions
    this.intervalId = setInterval(async () => {
      console.log('📅 Daily subscription check running...');
      await SubscriptionManager.checkExpiringSubscriptions();
      await this.checkFrozenAccounts();
    }, 24 * 60 * 60 * 1000); // 24 hours
    
    // Run initial check
    this.runInitialCheck();
  }
  
  // Stop monitoring
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Subscription monitoring stopped');
    }
  }
  
  // Run initial check when server starts
  private async runInitialCheck() {
    console.log('🚀 Running initial subscription check...');
    try {
      await SubscriptionManager.checkExpiringSubscriptions();
      console.log('✅ Initial subscription check completed');
    } catch (error) {
      console.error('❌ Initial subscription check failed:', error);
    }
  }
  
  // Check frozen accounts for deletion eligibility
  private async checkFrozenAccounts() {
    try {
      console.log('🔍 Checking frozen accounts for deletion eligibility...');
      
      // Get frozen accounts older than 6 months
      const frozenAccounts = await this.getFrozenAccountsOlderThan6Months();
      
      for (const account of frozenAccounts) {
        await this.processAccountDeletion(account);
      }
      
      console.log(`🗑️ Processed ${frozenAccounts.length} accounts for deletion`);
      
    } catch (error) {
      console.error('Error checking frozen accounts:', error);
    }
  }
  
  // Get frozen accounts older than 6 months
  private async getFrozenAccountsOlderThan6Months() {
    // Demo data - in production, query database
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    return [
      // Demo frozen accounts that are ready for deletion
      {
        id: 'frozen_user_001',
        businessName: 'Old Frozen Business',
        frozenDate: '2025-01-15T00:00:00Z', // Frozen 6+ months ago
        email: 'oldbusiness@example.com',
        phone: '+12345678903'
      }
    ].filter(account => new Date(account.frozenDate) <= sixMonthsAgo);
  }
  
  // Process account deletion for accounts frozen 6+ months
  private async processAccountDeletion(account: any) {
    try {
      console.log(`🗑️ Processing deletion for account: ${account.businessName}`);
      
      // Send final warning before deletion
      await this.sendFinalDeletionWarning(account);
      
      // Wait 7 days before actual deletion
      setTimeout(async () => {
        await this.deleteAccount(account);
      }, 7 * 24 * 60 * 60 * 1000); // 7 days
      
    } catch (error) {
      console.error(`Error processing deletion for ${account.id}:`, error);
    }
  }
  
  // Send final warning before account deletion
  private async sendFinalDeletionWarning(account: any) {
    console.log(`⚠️ Sending final deletion warning to ${account.businessName}`);
    
    // Email and SMS warning would be sent here
    // Implementation similar to expiration notifications
  }
  
  // Delete account after final warning period
  private async deleteAccount(account: any) {
    console.log(`🗑️ Deleting account: ${account.businessName} (${account.id})`);
    
    // In production, this would:
    // 1. Remove all user data
    // 2. Cancel any remaining subscriptions
    // 3. Send deletion confirmation
    // 4. Log deletion for audit purposes
  }
  
  // Manual trigger for testing
  async runManualCheck() {
    console.log('🔧 Manual subscription check triggered');
    await SubscriptionManager.checkExpiringSubscriptions();
    await this.checkFrozenAccounts();
  }
}

// Initialize and start monitoring when module loads
const subscriptionScheduler = SubscriptionScheduler.getInstance();

// Auto-start monitoring in production
if (process.env.NODE_ENV === 'production') {
  subscriptionScheduler.start();
} else {
  // In development, start after a short delay
  setTimeout(() => {
    subscriptionScheduler.start();
  }, 5000);
}

export { SubscriptionScheduler, subscriptionScheduler };