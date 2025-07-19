import { db } from './db';
import { facebookMarketplacePosts, facebookAutoResponses, users, businesses } from '../shared/schema';
import { eq, and } from 'drizzle-orm';

export interface FacebookMessage {
  postId: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: Date;
}

export interface AutoResponseConfig {
  enabled: boolean;
  deliveryAvailable: boolean;
  businessName: string;
  marketplaceUrl: string;
  customMessage?: string;
}

export class FacebookAutoResponseService {
  private readonly CLIENT_TOKEN = process.env.FACEBOOK_CLIENT_TOKEN || '49651a769000e57e5750a6fd439a3e18';
  private readonly APP_SECRET = process.env.FACEBOOK_APP_SECRET;

  // Check if message is asking about availability
  private isAvailabilityMessage(message: string): boolean {
    const availabilityKeywords = [
      'is this available',
      'still available',
      'available?',
      'is it available',
      'do you still have',
      'still have this',
      'for sale?',
      'interested',
      'price',
      'buy this'
    ];
    
    const lowerMessage = message.toLowerCase();
    return availabilityKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  // Generate appropriate auto-response message
  private generateAutoResponse(config: AutoResponseConfig, originalMessage: string): string {
    const { deliveryAvailable, businessName, marketplaceUrl, customMessage } = config;
    
    if (customMessage) {
      return customMessage;
    }

    let baseResponse = "Yes it's available! ";
    
    if (deliveryAvailable) {
      baseResponse += "It's available for delivery now on MarketPace! ";
    } else {
      baseResponse += "Check out pickup/delivery and payment options on MarketPace! ";
    }
    
    baseResponse += `Visit ${marketplaceUrl} to see all our items, secure payment options, and delivery details. `;
    baseResponse += `You can also browse our other products while you're there! 🛍️`;
    
    return baseResponse;
  }

  // Main auto-response handler
  async handleFacebookMessage(message: FacebookMessage): Promise<boolean> {
    try {
      if (!this.isAvailabilityMessage(message.message)) {
        return false; // Not an availability inquiry
      }

      // Find the MarketPace post associated with this Facebook post
      const [marketplacePost] = await db
        .select()
        .from(facebookMarketplacePosts)
        .where(eq(facebookMarketplacePosts.facebookPostId, message.postId))
        .limit(1);

      if (!marketplacePost || !marketplacePost.autoResponseEnabled) {
        return false; // No auto-response for this post
      }

      // Get user/business info for personalized response
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, marketplacePost.userId))
        .limit(1);

      if (!user) {
        return false;
      }

      // Get business info if it's a business account
      let business = null;
      if (user.isPro) {
        [business] = await db
          .select()
          .from(businesses)
          .where(eq(businesses.ownerId, user.id))
          .limit(1);
      }

      // Configure auto-response
      const config: AutoResponseConfig = {
        enabled: marketplacePost.autoResponseEnabled,
        deliveryAvailable: marketplacePost.deliveryAvailable,
        businessName: business?.name || user.businessName || `${user.firstName}'s MarketPace`,
        marketplaceUrl: `https://www.marketpace.shop/user/${user.id}`,
        customMessage: user.socialMediaSettings?.autoResponseMessage as string
      };

      const responseMessage = this.generateAutoResponse(config, message.message);
      
      // Send the auto-response via Facebook API
      const success = await this.sendFacebookMessage(message.postId, message.senderId, responseMessage);
      
      if (success) {
        // Log the auto-response
        await db.insert(facebookAutoResponses).values({
          facebookPostId: message.postId,
          senderName: message.senderName,
          messageReceived: message.message,
          responseMessage: responseMessage,
          responseType: marketplacePost.deliveryAvailable ? 'delivery_available' : 'pickup_only',
          sentAt: new Date()
        });
        
        console.log(`✅ Auto-response sent for post ${message.postId} to ${message.senderName}`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error handling Facebook auto-response:', error);
      return false;
    }
  }

  // Send message via Facebook API
  private async sendFacebookMessage(postId: string, recipientId: string, message: string): Promise<boolean> {
    try {
      // In a real implementation, this would use Facebook's Send API
      // For now, we'll simulate the response and log it
      console.log(`📤 Facebook Auto-Response Sent:
        Post ID: ${postId}
        Recipient: ${recipientId}
        Message: ${message}
      `);
      
      // Simulate successful sending
      return true;
    } catch (error) {
      console.error('Error sending Facebook message:', error);
      return false;
    }
  }

  // Webhook handler for incoming Facebook messages
  async handleWebhook(webhookData: any): Promise<void> {
    try {
      if (webhookData.object === 'page') {
        for (const entry of webhookData.entry) {
          if (entry.messaging) {
            for (const messagingEvent of entry.messaging) {
              if (messagingEvent.message) {
                const message: FacebookMessage = {
                  postId: messagingEvent.postback?.referral?.ref || 'unknown',
                  senderId: messagingEvent.sender.id,
                  senderName: messagingEvent.sender.name || 'Facebook User',
                  message: messagingEvent.message.text || '',
                  timestamp: new Date(messagingEvent.timestamp)
                };
                
                await this.handleFacebookMessage(message);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error processing Facebook webhook:', error);
    }
  }

  // Test auto-response system
  async testAutoResponse(userId: string, testMessage: string = "Is this still available?"): Promise<string> {
    const mockMessage: FacebookMessage = {
      postId: 'test_post_123',
      senderId: 'test_user_456',
      senderName: 'Test User',
      message: testMessage,
      timestamp: new Date()
    };

    // Create a test marketplace post
    const [testPost] = await db.insert(facebookMarketplacePosts).values({
      userId: userId,
      marketplacePostId: 'test_mp_post_123',
      facebookPostId: 'test_post_123',
      title: 'Test Item',
      description: 'Test item for auto-response',
      price: '$50',
      category: 'Electronics',
      deliveryAvailable: true,
      autoResponseEnabled: true
    }).returning();

    const success = await this.handleFacebookMessage(mockMessage);
    
    if (success) {
      return "✅ Auto-response test successful! Check the console for the simulated response.";
    } else {
      return "❌ Auto-response test failed. Check your configuration.";
    }
  }
}

export const facebookAutoResponseService = new FacebookAutoResponseService();