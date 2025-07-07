import { Express, Request, Response } from 'express';

const FACEBOOK_GRAPH_URL = 'https://graph.facebook.com/v18.0';

export interface FacebookPost {
  id: string;
  userId: string;
  productId: string;
  postId?: string;
  message: string;
  link: string;
  createdAt: Date;
  status: 'pending' | 'posted' | 'failed';
}

export interface FacebookWebhookMessage {
  senderId: string;
  message: string;
  timestamp: Date;
  autoReplyUsed: boolean;
}

class FacebookMarketingManager {
  private static posts: Map<string, FacebookPost> = new Map();
  private static webhookMessages: FacebookWebhookMessage[] = [];
  private static userTokens: Map<string, string> = new Map();

  /**
   * Store user's Facebook access token
   */
  static setUserToken(userId: string, accessToken: string): void {
    this.userTokens.set(userId, accessToken);
  }

  /**
   * Share product to Facebook user feed or page
   */
  static async postToFacebook(userId: string, productData: any): Promise<string> {
    const accessToken = this.userTokens.get(userId);
    if (!accessToken) {
      throw new Error('Facebook access token not found for user');
    }

    const message = `${productData.title}\n\n${productData.description}\n\nPrice: $${productData.price}\n\nClick below to Deliver Now with MarketPace!`;
    const link = `https://marketpace.app/product/${productData.id}?deliver_now=true`;

    const post: FacebookPost = {
      id: `fb_${Date.now()}_${userId}`,
      userId,
      productId: productData.id,
      message,
      link,
      createdAt: new Date(),
      status: 'pending'
    };

    try {
      const response = await fetch(`${FACEBOOK_GRAPH_URL}/me/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          link: link,
          access_token: accessToken
        })
      });

      const data = await response.json();
      if (data.id) {
        post.postId = data.id;
        post.status = 'posted';
        console.log(`✅ Facebook post successful: ${data.id}`);
      } else {
        post.status = 'failed';
        console.error('❌ Facebook post failed:', data);
        throw new Error(data.error?.message || 'Facebook posting failed');
      }
    } catch (error) {
      post.status = 'failed';
      console.error('❌ Error posting to Facebook:', error);
      throw error;
    }

    this.posts.set(post.id, post);
    return post.id;
  }

  /**
   * Handle Facebook webhook for message detection
   */
  static handleFacebookWebhook(webhookData: any): boolean {
    const entry = webhookData.entry?.[0];
    const messaging = entry?.messaging?.[0];
    
    if (!messaging) return false;

    const message = messaging.message?.text;
    const senderId = messaging.sender?.id;

    if (message && senderId) {
      const webhookMessage: FacebookWebhookMessage = {
        senderId,
        message,
        timestamp: new Date(),
        autoReplyUsed: false
      };

      // Check for availability inquiry
      if (message.toLowerCase().includes('is this still available') || 
          message.toLowerCase().includes('still available') ||
          message.toLowerCase().includes('available?')) {
        
        this.sendAutoReply(senderId);
        webhookMessage.autoReplyUsed = true;
      }

      this.webhookMessages.push(webhookMessage);
      return true;
    }

    return false;
  }

  /**
   * Send automated reply through Facebook Messenger
   */
  static async sendAutoReply(recipientId: string): Promise<void> {
    const PAGE_ACCESS_TOKEN = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    
    if (!PAGE_ACCESS_TOKEN) {
      console.error('❌ Facebook Page Access Token not configured');
      return;
    }

    const replyText = "Yes it is! Purchase now and have it delivered to you at the next available delivery route from MarketPace. Click the link in the original post to order!";

    try {
      const response = await fetch(`${FACEBOOK_GRAPH_URL}/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient: { id: recipientId },
          message: { text: replyText }
        })
      });

      const data = await response.json();
      if (data.message_id) {
        console.log('✅ Facebook auto-reply sent successfully');
      } else {
        console.error('❌ Facebook auto-reply failed:', data);
      }
    } catch (error) {
      console.error('❌ Error sending Facebook auto-reply:', error);
    }
  }

  /**
   * Get user's Facebook posts
   */
  static getUserPosts(userId: string): FacebookPost[] {
    return Array.from(this.posts.values()).filter(post => post.userId === userId);
  }

  /**
   * Get recent webhook messages
   */
  static getRecentMessages(limit: number = 50): FacebookWebhookMessage[] {
    return this.webhookMessages
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Get Facebook marketing analytics
   */
  static getAnalytics(userId: string) {
    const userPosts = this.getUserPosts(userId);
    const totalPosts = userPosts.length;
    const successfulPosts = userPosts.filter(p => p.status === 'posted').length;
    const failedPosts = userPosts.filter(p => p.status === 'failed').length;
    const autoRepliesUsed = this.webhookMessages.filter(m => m.autoReplyUsed).length;

    return {
      totalPosts,
      successfulPosts,
      failedPosts,
      successRate: totalPosts > 0 ? (successfulPosts / totalPosts * 100).toFixed(1) : '0',
      autoRepliesUsed,
      lastPostDate: userPosts.length > 0 ? userPosts[userPosts.length - 1].createdAt : null
    };
  }
}

export function registerFacebookRoutes(app: Express): void {
  // Connect Facebook account
  app.post('/api/facebook/connect', async (req: any, res: any) => {
    try {
      const { accessToken } = req.body;
      const userId = 'demo_user'; // In real app, get from session

      if (!accessToken) {
        return res.status(400).json({ error: 'Access token is required' });
      }

      FacebookMarketingManager.setUserToken(userId, accessToken);

      res.json({
        success: true,
        message: 'Facebook account connected successfully'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Post product to Facebook
  app.post('/api/facebook/post', async (req: any, res: any) => {
    try {
      const { productData } = req.body;
      const userId = 'demo_user'; // In real app, get from session

      if (!productData) {
        return res.status(400).json({ error: 'Product data is required' });
      }

      const postId = await FacebookMarketingManager.postToFacebook(userId, productData);

      res.json({
        success: true,
        postId,
        message: 'Product posted to Facebook successfully'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Facebook webhook endpoint
  app.post('/api/facebook/webhook', (req: any, res: any) => {
    try {
      const webhookData = req.body;
      
      // Verify webhook (in production, verify signature)
      if (req.query['hub.verify_token'] === process.env.FACEBOOK_VERIFY_TOKEN) {
        return res.send(req.query['hub.challenge']);
      }

      const processed = FacebookMarketingManager.handleFacebookWebhook(webhookData);
      
      res.json({
        success: true,
        processed,
        message: processed ? 'Webhook processed' : 'No action needed'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get Facebook webhook verification
  app.get('/api/facebook/webhook', (req: Request, res: Response) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === process.env.FACEBOOK_VERIFY_TOKEN) {
      console.log('✅ Facebook webhook verified');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  });

  // Get user's Facebook posts
  app.get('/api/facebook/posts', (req: Request, res: Response) => {
    try {
      const userId = 'demo_user'; // In real app, get from session
      const posts = FacebookMarketingManager.getUserPosts(userId);

      res.json({
        success: true,
        posts
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get Facebook analytics
  app.get('/api/facebook/analytics', (req: Request, res: Response) => {
    try {
      const userId = 'demo_user'; // In real app, get from session
      const analytics = FacebookMarketingManager.getAnalytics(userId);

      res.json({
        success: true,
        analytics
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get recent messages
  app.get('/api/facebook/messages', (req: Request, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const messages = FacebookMarketingManager.getRecentMessages(limit);

      res.json({
        success: true,
        messages
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}