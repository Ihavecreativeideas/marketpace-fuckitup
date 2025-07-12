import express, { Request, Response } from 'express';
import { InternalAdvertisingSystem, AdRevenueModel } from '../internalAdvertising';

const router = express.Router();

// CRITICAL: All ad data stays within MarketPace - NO external sharing
// Members can target other members but data never leaves the platform

// Create new ad campaign (Facebook-style ad builder)
router.post('/campaigns', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Log internal advertising data usage (allowed within platform)
    console.log(`User ${userId} creating internal ad campaign - data stays within MarketPace`);

    const campaignData = req.body;
    const campaign = await InternalAdvertisingSystem.createAdCampaign(
      userId,
      campaignData
    );

    res.json({
      success: true,
      campaign,
      message: 'Ad campaign created successfully! Your ad will be reviewed and go live within 24 hours.'
    });

  } catch (error) {
    console.error('Ad campaign creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ad campaign. Please try again.'
    });
  }
});

// Get ad builder configuration (Facebook-style interface)
router.get('/builder-config', async (req: Request, res: Response) => {
  try {
    const config = InternalAdvertisingSystem.generateAdBuilderConfig();
    
    res.json({
      success: true,
      config,
      privacyNotice: 'All targeting uses only MarketPace member data. No external data sources.'
    });

  } catch (error) {
    console.error('Ad builder config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load ad builder configuration.'
    });
  }
});

// Get personalized ads for member feed (like Facebook news feed ads)
router.get('/personalized', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { location, interests, limit = 3 } = req.query;

    // Log that user is viewing personalized ads (internal use only)
    console.log(`User ${userId} viewing personalized ads - internal targeting only`);

    const ads = await InternalAdvertisingSystem.getPersonalizedAds(
      userId,
      location as string || '',
      (interests as string)?.split(',') || [],
      parseInt(limit as string)
    );

    res.json({
      success: true,
      ads,
      privacyNote: 'These ads are from MarketPace members targeting you based on your interests and location within our platform only.'
    });

  } catch (error) {
    console.error('Personalized ads error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load personalized ads.'
    });
  }
});

// Record ad impression/interaction
router.post('/impressions', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { adId, action } = req.body;

    if (!adId || !action) {
      return res.status(400).json({
        success: false,
        message: 'Ad ID and action are required'
      });
    }

    await InternalAdvertisingSystem.recordAdImpression(adId, userId, action);

    res.json({
      success: true,
      message: `Ad ${action} recorded successfully`
    });

  } catch (error) {
    console.error('Ad impression recording error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record ad interaction.'
    });
  }
});

// Get ad analytics for advertisers
router.get('/analytics/:campaignId?', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { campaignId } = req.params;

    // Log advertiser accessing their own campaign analytics
    console.log(`User ${userId} accessing own ad campaign analytics`);

    const analytics = await InternalAdvertisingSystem.getAdAnalytics(
      userId,
      campaignId
    );

    res.json({
      success: true,
      analytics,
      note: 'Analytics show aggregated, anonymized data from MarketPace members only.'
    });

  } catch (error) {
    console.error('Ad analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load ad analytics.'
    });
  }
});

// Get member's ad preferences (like Facebook ad preferences)
router.get('/preferences', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Sample ad preferences structure
    const preferences = {
      allowPersonalizedAds: true,
      allowLocationBasedAds: true,
      allowBehaviorBasedAds: true,
      blockedAdvertisers: [],
      preferredAdTypes: ['marketplace_listing', 'service_promotion'],
      maxAdsPerDay: 5,
      adFeedbackEnabled: true,
      dataUsageConsent: 'internal_only' // Data never leaves MarketPace
    };

    res.json({
      success: true,
      preferences,
      privacyNotice: 'Your ad preferences control how MarketPace members can target you. Your data is never shared outside MarketPace.'
    });

  } catch (error) {
    console.error('Ad preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load ad preferences.'
    });
  }
});

// Update member's ad preferences
router.put('/preferences', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const preferences = req.body;

    // Log user updating their ad preferences
    console.log(`User ${userId} updating ad preferences`);

    // In real implementation, save to database
    console.log(`Updating ad preferences for user ${userId}:`, preferences);

    res.json({
      success: true,
      message: 'Ad preferences updated successfully.',
      preferences
    });

  } catch (error) {
    console.error('Ad preferences update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ad preferences.'
    });
  }
});

// Get targeting suggestions for advertisers (Facebook-style)
router.post('/targeting-suggestions', async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { targetingRules } = req.body;

    // Log targeting analysis (internal use only)
    console.log(`User ${userId} analyzing ad targeting - internal optimization`);

    const audienceSize = await InternalAdvertisingSystem.findTargetAudience(
      targetingRules,
      userId
    );

    const suggestions = {
      estimatedReach: audienceSize.length,
      suggestedBudget: Math.max(25, audienceSize.length * 0.10),
      expectedClicks: Math.round(audienceSize.length * 0.05),
      expectedCost: audienceSize.length * 0.50 * 0.05,
      recommendations: [
        audienceSize.length < 100 ? 'Consider expanding your targeting criteria to reach more members' : null,
        audienceSize.length > 1000 ? 'Your targeting is quite broad. Consider narrowing to improve relevance' : null,
        'Add interests that match your offering for better engagement'
      ].filter(Boolean)
    };

    res.json({
      success: true,
      suggestions,
      privacyNote: 'Targeting suggestions based on MarketPace member data only. No external data sources used.'
    });

  } catch (error) {
    console.error('Targeting suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate targeting suggestions.'
    });
  }
});

export default router;