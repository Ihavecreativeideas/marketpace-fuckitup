import express from 'express';
import { db } from './db';
import { users, businesses, facebookMarketplacePosts } from '../shared/schema';
import { eq } from 'drizzle-orm';
import { facebookAutoResponseService } from './facebookAutoResponse';

const router = express.Router();

// Update user social media links
router.post('/api/social-media/update-links', async (req, res) => {
  try {
    const { 
      userId, 
      facebookPageUrl, 
      instagramUrl, 
      twitterUrl, 
      tiktokUrl, 
      youtubeUrl, 
      linkedinUrl,
      autoResponseEnabled = true,
      customAutoResponseMessage
    } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Update user social media settings
    const socialMediaSettings = {
      autoResponseEnabled,
      autoResponseMessage: customAutoResponseMessage,
      crossPostingEnabled: true,
      lastUpdated: new Date().toISOString()
    };

    await db.update(users)
      .set({
        facebookPageUrl,
        instagramUrl,
        twitterUrl,
        tiktokUrl,
        youtubeUrl,
        linkedinUrl,
        socialMediaSettings,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    res.json({ 
      success: true, 
      message: 'Social media links updated successfully',
      settings: socialMediaSettings
    });
  } catch (error) {
    console.error('Error updating social media links:', error);
    res.status(500).json({ error: 'Failed to update social media links' });
  }
});

// Get user social media links
router.get('/api/social-media/links/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const [user] = await db
      .select({
        facebookPageUrl: users.facebookPageUrl,
        instagramUrl: users.instagramUrl,
        twitterUrl: users.twitterUrl,
        tiktokUrl: users.tiktokUrl,
        youtubeUrl: users.youtubeUrl,
        linkedinUrl: users.linkedinUrl,
        socialMediaSettings: users.socialMediaSettings
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    console.error('Error fetching social media links:', error);
    res.status(500).json({ error: 'Failed to fetch social media links' });
  }
});

// Create Facebook Marketplace cross-post
router.post('/api/social-media/facebook-marketplace/create-post', async (req, res) => {
  try {
    const {
      userId,
      marketplacePostId,
      title,
      description,
      price,
      category,
      images,
      deliveryAvailable = true,
      autoResponseEnabled = true
    } = req.body;

    if (!userId || !marketplacePostId || !title) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // In a real implementation, this would post to Facebook Marketplace API
    // For now, we'll simulate the post creation
    const facebookPostId = `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Save the cross-post record
    const [crossPost] = await db.insert(facebookMarketplacePosts).values({
      userId,
      marketplacePostId,
      facebookPostId,
      title,
      description,
      price,
      category,
      deliveryAvailable,
      autoResponseEnabled,
      crossPostingEnabled: true
    }).returning();

    // Add "Deliver Now" button link back to MarketPace
    const marketplaceUrl = `https://www.marketpace.shop/item/${marketplacePostId}`;
    const enhancedDescription = `${description}\n\n🚚 DELIVER NOW: Order with delivery on MarketPace: ${marketplaceUrl}`;

    console.log(`📤 Facebook Marketplace Post Created:
      Title: ${title}
      Price: ${price}
      Category: ${category}
      Delivery Available: ${deliveryAvailable}
      Auto-Response: ${autoResponseEnabled}
      MarketPace Link: ${marketplaceUrl}
    `);

    res.json({
      success: true,
      message: 'Facebook Marketplace post created successfully',
      data: {
        crossPost,
        facebookPostId,
        marketplaceUrl,
        autoResponseEnabled
      }
    });
  } catch (error) {
    console.error('Error creating Facebook Marketplace post:', error);
    res.status(500).json({ error: 'Failed to create Facebook Marketplace post' });
  }
});

// Handle Facebook webhook for auto-responses
router.post('/api/social-media/facebook-webhook', async (req, res) => {
  try {
    // Verify webhook (simplified for demo)
    const webhookData = req.body;
    
    await facebookAutoResponseService.handleWebhook(webhookData);
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error handling Facebook webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Test auto-response system
router.post('/api/social-media/test-auto-response', async (req, res) => {
  try {
    const { userId, testMessage = "Is this still available?" } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const result = await facebookAutoResponseService.testAutoResponse(userId, testMessage);
    
    res.json({
      success: true,
      message: result,
      testMessage,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error testing auto-response:', error);
    res.status(500).json({ error: 'Auto-response test failed' });
  }
});

// Get Facebook auto-response history
router.get('/api/social-media/auto-response-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    // Get auto-response history for user's posts
    const history = await db
      .select()
      .from(facebookAutoResponses)
      .innerJoin(
        facebookMarketplacePosts,
        eq(facebookAutoResponses.facebookPostId, facebookMarketplacePosts.facebookPostId)
      )
      .where(eq(facebookMarketplacePosts.userId, userId))
      .orderBy(facebookAutoResponses.sentAt)
      .limit(50);

    res.json({
      success: true,
      data: history,
      count: history.length
    });
  } catch (error) {
    console.error('Error fetching auto-response history:', error);
    res.status(500).json({ error: 'Failed to fetch auto-response history' });
  }
});

export { router as socialMediaRoutes };