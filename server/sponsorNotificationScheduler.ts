import { sponsorExpirationNotificationService } from './sponsorExpirationNotifications';

class SponsorNotificationScheduler {
    private intervalId: NodeJS.Timeout | null = null;
    private readonly CHECK_INTERVAL = 24 * 60 * 60 * 1000; // Check daily at midnight

    start(): void {
        console.log('🔔 Starting sponsor expiration notification scheduler');
        
        // Run initial check
        this.runDailyCheck();
        
        // Schedule daily checks at midnight
        this.intervalId = setInterval(() => {
            this.runDailyCheck();
        }, this.CHECK_INTERVAL);
    }

    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('⏹️ Stopped sponsor expiration notification scheduler');
        }
    }

    private async runDailyCheck(): Promise<void> {
        try {
            const now = new Date();
            console.log(`🔍 Running sponsor benefit expiration check at ${now.toISOString()}`);
            
            await sponsorExpirationNotificationService.checkExpiringBenefits();
            
            console.log('✅ Sponsor expiration check completed successfully');
        } catch (error) {
            console.error('❌ Error running sponsor expiration check:', error);
        }
    }

    // Manual trigger for testing
    async runManualCheck(): Promise<void> {
        console.log('🔧 Running manual sponsor expiration check');
        await this.runDailyCheck();
    }
}

export const sponsorNotificationScheduler = new SponsorNotificationScheduler();