import { smsService } from './smsService';
import { emailService } from './emailService';

interface SponsorMember {
    id: string;
    name: string;
    email: string;
    phone: string;
    tier: string;
    purchaseDate: string;
    feeExemptExpiry: string;
    proFeaturesExpiry: string;
    amount: string;
}

export class SponsorExpirationNotificationService {
    // Check for sponsors whose benefits expire in 7 days
    async checkExpiringBenefits(): Promise<void> {
        const sponsorMembers = await this.getSponsorMembers();
        const oneWeekFromNow = new Date();
        oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7);

        for (const sponsor of sponsorMembers) {
            // Check fee exemption expiry
            if (this.isExpiringInOneWeek(sponsor.feeExemptExpiry, oneWeekFromNow)) {
                await this.sendFeeExemptionExpiryNotification(sponsor);
            }

            // Check pro features expiry
            if (this.isExpiringInOneWeek(sponsor.proFeaturesExpiry, oneWeekFromNow)) {
                await this.sendProFeaturesExpiryNotification(sponsor);
            }
        }
    }

    private isExpiringInOneWeek(expiryDate: string, checkDate: Date): boolean {
        if (expiryDate === 'Lifetime' || expiryDate === 'Forever') {
            return false;
        }

        const expiry = new Date(expiryDate);
        const timeDiff = expiry.getTime() - checkDate.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
        
        // Notify if expiring within 1 day of the 7-day mark
        return daysDiff >= 0 && daysDiff <= 1;
    }

    private async sendFeeExemptionExpiryNotification(sponsor: SponsorMember): Promise<void> {
        const smsMessage = this.createFeeExemptionSMS(sponsor);
        const emailContent = this.createFeeExemptionEmail(sponsor);

        try {
            // Send SMS notification
            await smsService.sendSMS(sponsor.phone, smsMessage);
            
            // Send email notification
            await emailService.sendEmail({
                to: sponsor.email,
                subject: 'MarketPace Sponsor Benefits - Fee Exemption Ending Soon',
                html: emailContent
            });

            console.log(`Sent fee exemption expiry notification to ${sponsor.name}`);
        } catch (error) {
            console.error(`Failed to send fee exemption notification to ${sponsor.name}:`, error);
        }
    }

    private async sendProFeaturesExpiryNotification(sponsor: SponsorMember): Promise<void> {
        const smsMessage = this.createProFeaturesExpirySMS(sponsor);
        const emailContent = this.createProFeaturesExpiryEmail(sponsor);

        try {
            // Send SMS notification
            await smsService.sendSMS(sponsor.phone, smsMessage);
            
            // Send email notification
            await emailService.sendEmail({
                to: sponsor.email,
                subject: 'MarketPace Sponsor Benefits - Pro Features Ending Soon',
                html: emailContent
            });

            console.log(`Sent pro features expiry notification to ${sponsor.name}`);
        } catch (error) {
            console.error(`Failed to send pro features notification to ${sponsor.name}:`, error);
        }
    }

    private createFeeExemptionSMS(sponsor: SponsorMember): string {
        return `Hi ${sponsor.name}! Thank you for your ${sponsor.tier} support helping MarketPace launch! Your commission-free selling ends ${sponsor.feeExemptExpiry}. We're grateful for your early support and hope you've enjoyed fee-free sales! Ready to continue in our MarketPace community? Update subscription: https://marketpace.shop/subscription`;
    }

    private createProFeaturesExpirySMS(sponsor: SponsorMember): string {
        return `Hi ${sponsor.name}! Thank you for supporting MarketPace as a ${sponsor.tier}! Your free Pro features end ${sponsor.proFeaturesExpiry}. We're truly grateful for helping us launch and hope you've enjoyed premium features! Continue with Pro: https://marketpace.shop/pro-upgrade`;
    }

    private createFeeExemptionEmail(sponsor: SponsorMember): string {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f7fa; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 2rem; text-align: center; color: white; }
                .content { padding: 2rem; }
                .thank-you { background: #e8f5e8; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; border-left: 4px solid #27ae60; }
                .expiry-notice { background: #fff3cd; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; border-left: 4px solid #856404; }
                .cta-button { display: inline-block; background: #667eea; color: white; padding: 1rem 2rem; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 1rem 0; }
                .footer { background: #f8f9fa; padding: 1rem; text-align: center; color: #666; font-size: 0.9rem; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Thank You for Supporting MarketPace!</h1>
                    <p>Your ${sponsor.tier} sponsorship helped us launch</p>
                </div>
                
                <div class="content">
                    <div class="thank-you">
                        <h3>🙏 We're Truly Grateful</h3>
                        <p>Dear ${sponsor.name},</p>
                        <p>Thank you for your incredible ${sponsor.tier} support that helped MarketPace get up and running! Your ${sponsor.amount} contribution was instrumental in building our community-first marketplace.</p>
                        <p>Your support in the beginning was truly helpful and we are deeply grateful for believing in our vision.</p>
                    </div>

                    <div class="expiry-notice">
                        <h3>⏰ Commission-Free Period Ending</h3>
                        <p><strong>Your fee exemption expires: ${sponsor.feeExemptExpiry}</strong></p>
                        <p>We hope you have enjoyed using our app commission-free and selling your items without the 5% sustainability fee. This benefit was our way of thanking early supporters like you!</p>
                    </div>

                    <h3>Continue Your MarketPace Journey</h3>
                    <p>Are you ready to update your subscription and continue to stay part of our MarketPace community?</p>
                    
                    <p>After ${sponsor.feeExemptExpiry}, standard rates apply:</p>
                    <ul>
                        <li>5% sustainability fee on sales (helps support local communities)</li>
                        <li>All other features remain the same</li>
                        <li>Continue supporting local commerce and community building</li>
                    </ul>

                    <div style="text-align: center; margin: 2rem 0;">
                        <a href="https://marketpace.shop/subscription" class="cta-button">
                            Update Subscription & Stay Connected
                        </a>
                    </div>

                    <p>Thank you again for being an essential part of MarketPace's journey. Your early support made our community-focused platform possible!</p>
                </div>

                <div class="footer">
                    <p>MarketPace - Delivering Opportunities. Building Local Power.</p>
                    <p>Contact us: <a href="mailto:MarketPace.contact@gmail.com">MarketPace.contact@gmail.com</a></p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    private createProFeaturesExpiryEmail(sponsor: SponsorMember): string {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f7fa; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%); padding: 2rem; text-align: center; color: #333; }
                .content { padding: 2rem; }
                .thank-you { background: #e8f5e8; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; border-left: 4px solid #27ae60; }
                .expiry-notice { background: #fff3cd; padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; border-left: 4px solid #856404; }
                .cta-button { display: inline-block; background: #ffd700; color: #333; padding: 1rem 2rem; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 1rem 0; }
                .footer { background: #f8f9fa; padding: 1rem; text-align: center; color: #666; font-size: 0.9rem; }
                .pro-features { background: #f8f9fa; padding: 1rem; border-radius: 8px; margin: 1rem 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>⭐ Thank You for Supporting MarketPace Pro!</h1>
                    <p>Your ${sponsor.tier} sponsorship gave you exclusive Pro access</p>
                </div>
                
                <div class="content">
                    <div class="thank-you">
                        <h3>🙏 We're Truly Grateful</h3>
                        <p>Dear ${sponsor.name},</p>
                        <p>Thank you for your amazing ${sponsor.tier} support with your ${sponsor.amount} contribution! Your sponsorship helped MarketPace launch and gave you exclusive access to all Pro features.</p>
                        <p>Your support in the beginning was helpful and we are truly grateful for believing in our community-first vision.</p>
                    </div>

                    <div class="expiry-notice">
                        <h3>⏰ Pro Features Access Ending</h3>
                        <p><strong>Your free Pro features expire: ${sponsor.proFeaturesExpiry}</strong></p>
                        <p>We hope you have enjoyed using our Pro features free and experienced the full power of MarketPace for business growth and community engagement!</p>
                    </div>

                    <div class="pro-features">
                        <h3>Pro Features You've Been Enjoying:</h3>
                        <ul>
                            <li>🏪 Advanced Shop Management with Shopify integration</li>
                            <li>📅 Professional booking calendars for services</li>
                            <li>🎵 Music video uploads and playlist creation</li>
                            <li>🎫 Ticket sales integration and event management</li>
                            <li>🛍️ Merch store with Printful/Shopify integration</li>
                            <li>📊 Advanced analytics and business insights</li>
                            <li>⭐ Priority customer support</li>
                        </ul>
                    </div>

                    <h3>Continue with MarketPace Pro</h3>
                    <p>Are you ready to continue to stay part of our MarketPace community with full Pro access?</p>
                    
                    <p>Pro Membership Options:</p>
                    <ul>
                        <li><strong>Silver Pro ($15/month):</strong> Website integration, self pickup, color tracking</li>
                        <li><strong>Gold Pro ($25/month):</strong> AI analysis, product import, event tools</li>
                        <li><strong>Platinum Pro ($50/month):</strong> Livestreaming, advanced analytics, featured ads</li>
                    </ul>

                    <div style="text-align: center; margin: 2rem 0;">
                        <a href="https://marketpace.shop/pro-upgrade" class="cta-button">
                            Continue with Pro Features
                        </a>
                    </div>

                    <p>Thank you again for being a founding member of MarketPace Pro. Your early sponsorship made our advanced features possible for the entire community!</p>
                </div>

                <div class="footer">
                    <p>MarketPace Pro - Delivering Opportunities. Building Local Power.</p>
                    <p>Contact us: <a href="mailto:MarketPace.contact@gmail.com">MarketPace.contact@gmail.com</a></p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    private async getSponsorMembers(): Promise<SponsorMember[]> {
        // In a real implementation, this would query the database
        // For now, returning demo data matching the admin dashboard
        return [
            {
                id: 'sarah-johnson',
                name: 'Sarah Johnson',
                email: 'sarah.johnson@email.com',
                phone: '+15551234567',
                tier: 'Community Supporter',
                purchaseDate: 'January 12, 2025',
                feeExemptExpiry: 'July 12, 2025',
                proFeaturesExpiry: 'January 12, 2026',
                amount: '$25'
            },
            {
                id: 'mikes-automotive',
                name: 'Mike\'s Automotive',
                email: 'mike@mikesauto.com',
                phone: '+15559876543',
                tier: 'Local Partner',
                purchaseDate: 'January 8, 2025',
                feeExemptExpiry: 'July 8, 2025',
                proFeaturesExpiry: 'January 8, 2026',
                amount: '$100'
            },
            {
                id: 'browns-painting',
                name: 'Browns Painting LLC',
                email: 'info@brownspainting.com',
                phone: '+15554567890',
                tier: 'Legacy Founder',
                purchaseDate: 'December 15, 2024',
                feeExemptExpiry: 'Lifetime',
                proFeaturesExpiry: 'Lifetime',
                amount: '$2,500'
            }
        ];
    }

    // Manual trigger for testing
    async sendTestNotification(sponsorId: string, notificationType: 'fee' | 'pro'): Promise<void> {
        const sponsors = await this.getSponsorMembers();
        const sponsor = sponsors.find(s => s.id === sponsorId);
        
        if (!sponsor) {
            throw new Error('Sponsor not found');
        }

        if (notificationType === 'fee') {
            await this.sendFeeExemptionExpiryNotification(sponsor);
        } else {
            await this.sendProFeaturesExpiryNotification(sponsor);
        }
    }
}

export const sponsorExpirationNotificationService = new SponsorExpirationNotificationService();