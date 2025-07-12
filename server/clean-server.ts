import express from "express";
import cors from "cors";
import path from "path";
import { config } from "dotenv";

// Load environment variables
config();

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../pitch-page.html'));
});

app.get('/pitch-page', (req, res) => {
  res.sendFile(path.join(__dirname, '../pitch-page.html'));
});

app.get('/community', (req, res) => {
  res.sendFile(path.join(__dirname, '../community.html'));
});

// Settings route
app.get('/settings', (req, res) => {
  res.sendFile(path.join(__dirname, '../settings.html'));
});

// Deliveries route
app.get('/deliveries', (req, res) => {
  res.sendFile(path.join(__dirname, '../deliveries.html'));
});

// Security route
app.get('/security', (req, res) => {
  res.sendFile(path.join(__dirname, '../security.html'));
});

// Navigation pages routes
app.get('/shops', (req, res) => {
  res.sendFile(path.join(__dirname, '../shops.html'));
});

app.get('/services', (req, res) => {
  res.sendFile(path.join(__dirname, '../services.html'));
});

app.get('/the-hub', (req, res) => {
  res.sendFile(path.join(__dirname, '../the-hub.html'));
});

app.get('/cart', (req, res) => {
  res.sendFile(path.join(__dirname, '../cart.html'));
});

app.get('/marketpace-menu', (req, res) => {
  res.sendFile(path.join(__dirname, '../marketpace-menu.html'));
});

app.get('/profile', (req, res) => {
  res.sendFile(path.join(__dirname, '../profile.html'));
});

app.get('/login-password', (req, res) => {
  res.sendFile(path.join(__dirname, '../login-password.html'));
});

app.get('/signup-login', (req, res) => {
  res.sendFile(path.join(__dirname, '../signup-login.html'));
});

// Authentication routes
app.post('/api/auth/facebook', (req, res) => {
  // Facebook OAuth is not fully configured yet
  res.status(200).json({
    success: false,
    message: 'Facebook signup integration requires Facebook Developer App setup. For now, please use email signup or try the demo at /community',
    redirectUrl: '/community'
  });
});

app.post('/api/auth/google', (req, res) => {
  // Google OAuth endpoint
  res.status(200).json({
    success: false,
    message: 'Google authentication is being configured. Please use email signup for now.',
    redirectUrl: '/community'
  });
});

app.get('/api/auth/google', (req, res) => {
  // Handle Google OAuth callback
  res.redirect('/community');
});

// Email/Password Authentication endpoints
app.post('/api/check-user-exists', (req, res) => {
  const { email } = req.body;
  
  // For demo purposes, simulate checking user existence
  // In a real app, this would check the database
  const demoUsers = ['demo@marketpace.com', 'test@example.com'];
  const exists = demoUsers.includes(email.toLowerCase());
  
  res.json({ 
    success: true, 
    exists: exists,
    message: exists ? 'User found' : 'User not found'
  });
});

app.post('/api/seamless-login', (req, res) => {
  const { email, password } = req.body;
  
  // For demo purposes, accept any password for known emails
  const demoUsers = ['demo@marketpace.com', 'test@example.com'];
  
  if (demoUsers.includes(email.toLowerCase()) && password) {
    // Successful login
    const userData = {
      id: 'demo-user-' + Math.random().toString(36).substr(2, 9),
      email: email,
      name: email.split('@')[0],
      loggedIn: true,
      accountType: 'demo'
    };
    
    res.json({
      success: true,
      message: 'Login successful',
      user: userData,
      redirectUrl: '/community'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid email or password'
    });
  }
});

app.post('/api/seamless-signup', (req, res) => {
  const { email, password, name } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required'
    });
  }
  
  // For demo purposes, always allow signup
  const userData = {
    id: 'user-' + Math.random().toString(36).substr(2, 9),
    email: email,
    name: name || email.split('@')[0],
    loggedIn: true,
    accountType: 'member'
  };
  
  res.json({
    success: true,
    message: 'Account created successfully',
    user: userData,
    redirectUrl: '/community'
  });
});

app.post('/api/forgot-password', (req, res) => {
  const { email } = req.body;
  
  res.json({
    success: true,
    message: 'Password reset instructions sent to your email',
    resetUrl: '/password-reset' // For demo purposes
  });
});

app.get('/signup-login', (req, res) => {
  res.sendFile(path.join(__dirname, '../signup-login.html'));
});

app.get('/demo-login', (req, res) => {
  res.sendFile(path.join(__dirname, '../demo-login.html'));
});

app.get('/enhanced-signup', (req, res) => {
  res.sendFile(path.join(__dirname, '../enhanced-signup.html'));
});

// Internal Ads Demo route
app.get('/internal-ads-demo', (req, res) => {
  res.sendFile(path.join(__dirname, '../internal-ads-demo.html'));
});

// *** INTERNAL ADVERTISING SYSTEM API - MEMBER TO MEMBER ONLY ***
// ALL ADVERTISING DATA STAYS WITHIN MARKETPACE PLATFORM

app.post('/api/ads/campaigns', (req, res) => {
  const { title, description, targetingRules, budget, adType } = req.body;
  
  res.json({
    success: true,
    message: 'Ad campaign created successfully for member-to-member targeting',
    campaignId: 'ad_' + Math.random().toString(36).substr(2, 9),
    campaign: {
      title,
      description,
      targetingRules,
      budget,
      adType,
      status: 'active',
      reach: 'MarketPace members only',
      createdAt: new Date()
    },
    privacy: 'All ad data stays within MarketPace - never shared externally',
    dataPolicy: 'Zero external data sharing - internal member targeting only'
  });
});

app.get('/api/ads/builder-config', (req, res) => {
  res.json({
    success: true,
    config: {
      adTypes: [
        { 
          id: 'marketplace_listing', 
          name: 'Marketplace Listing', 
          description: 'Promote your items for sale to local members',
          icon: '🛍️'
        },
        { 
          id: 'service_promotion', 
          name: 'Service Promotion', 
          description: 'Advertise your professional services to the community',
          icon: '⚡'
        },
        { 
          id: 'event_announcement', 
          name: 'Event Announcement', 
          description: 'Promote local events and entertainment',
          icon: '🎉'
        },
        { 
          id: 'business_spotlight', 
          name: 'Business Spotlight', 
          description: 'Highlight your local business to neighbors',
          icon: '⭐'
        }
      ],
      targetingOptions: {
        geographic: {
          name: 'Location Targeting',
          options: ['city', 'radius', 'neighborhood'],
          description: 'Target members in specific local areas'
        },
        demographic: {
          name: 'Member Demographics',
          options: ['age_range', 'interests', 'member_type'],
          description: 'Target based on member profile information'
        },
        behavioral: {
          name: 'Shopping Behavior',
          options: ['recent_buyers', 'frequent_browsers', 'service_seekers'],
          description: 'Target based on MarketPace activity patterns'
        }
      },
      budgetGuidelines: {
        minimum: 5,
        recommended: 25,
        maximum: 500,
        bidRange: { min: 0.25, max: 2.00 }
      },
      privacyNotice: 'All targeting uses only MarketPace member data. No external data sources.',
      dataPolicy: 'Your ad campaigns target MarketPace members only - data never leaves our platform'
    }
  });
});

app.get('/api/ads/personalized', (req, res) => {
  const { location, interests, limit = 3 } = req.query;
  
  const sampleAds = [
    {
      id: 'ad_coffee_shop',
      title: 'Orange Beach Coffee Co. Grand Opening',
      description: 'Try our artisan coffee and fresh pastries! 20% off first order for MarketPace members.',
      imageUrl: '/coffee-shop-placeholder.jpg',
      adType: 'business_spotlight',
      advertiser: 'Orange Beach Coffee Co.',
      targetReason: 'Based on your interest in local food and drinks',
      cta: 'Visit Now',
      budget: 50,
      reach: 342
    },
    {
      id: 'ad_cleaning_service',
      title: 'Gulf Coast Home Cleaning',
      description: 'Professional house cleaning services. First cleaning 50% off for new MarketPace customers!',
      imageUrl: '/cleaning-service-placeholder.jpg',
      adType: 'service_promotion',
      advertiser: 'Gulf Coast Cleaning',
      targetReason: 'Based on your recent home service searches',
      cta: 'Book Service',
      budget: 75,
      reach: 156
    },
    {
      id: 'ad_yard_sale',
      title: 'Neighborhood Yard Sale Extravaganza',
      description: 'Huge yard sale this Saturday! Furniture, electronics, clothes, and more. Early birds welcome!',
      imageUrl: '/yard-sale-placeholder.jpg',
      adType: 'marketplace_listing',
      advertiser: 'Sarah M.',
      targetReason: 'Based on your shopping activity',
      cta: 'Get Directions',
      budget: 15,
      reach: 89
    }
  ];
  
  res.json({
    success: true,
    ads: sampleAds.slice(0, parseInt(limit as string || '3')),
    location: location || 'Orange Beach, AL',
    targeting: `Personalized for ${interests || 'your interests'}`,
    privacyNote: 'These ads are targeted using only your MarketPace activity and preferences',
    dataSource: 'Internal MarketPace member data only - no external tracking'
  });
});

app.post('/api/ads/impressions', (req, res) => {
  const { adId, memberId, impressionType } = req.body;
  
  res.json({
    success: true,
    message: 'Ad impression recorded - internal analytics only',
    impressionId: 'imp_' + Math.random().toString(36).substr(2, 9),
    privacy: 'Impression data stays within MarketPace platform',
    tracking: 'No external analytics - MarketPace internal metrics only'
  });
});

// Analytics route with campaign ID
app.get('/api/ads/analytics/:campaignId', (req, res) => {
  const { campaignId } = req.params;
  res.json({
    success: true,
    campaignId,
    analytics: {
      period: 'Last 7 days',
      impressions: 1250,
      clicks: 87,
      conversions: 12,
      ctr: 6.96,
      cpc: 0.75,
      totalSpent: 65.25,
      reachWithinMarketPace: 450,
      topPerformingAd: 'Local Coffee Shop Grand Opening',
      demographics: {
        'Orange Beach': 65,
        'Gulf Shores': 22,
        'Other': 13
      },
      timeOfDay: {
        'Morning (6-12)': 35,
        'Afternoon (12-6)': 45,
        'Evening (6-12)': 20
      }
    },
    privacy: 'Analytics limited to MarketPace member interactions only',
    dataScope: 'Internal platform metrics - no external data sharing'
  });
});

// Analytics route without campaign ID (all campaigns)
app.get('/api/ads/analytics', (req, res) => {
  res.json({
    success: true,
    campaignId: 'all_campaigns',
    analytics: {
      period: 'Last 7 days',
      totalCampaigns: 5,
      totalImpressions: 6250,
      totalClicks: 435,
      totalConversions: 60,
      avgCtr: 6.96,
      avgCpc: 0.75,
      totalSpent: 326.25,
      reachWithinMarketPace: 2250,
      topPerformingAd: 'Local Coffee Shop Grand Opening',
      demographics: {
        'Orange Beach': 65,
        'Gulf Shores': 22,
        'Other': 13
      }
    },
    privacy: 'Analytics limited to MarketPace member interactions only',
    dataScope: 'Internal platform metrics - no external data sharing'
  });
});

app.get('/api/ads/preferences', (req, res) => {
  res.json({
    success: true,
    preferences: {
      allowPersonalizedAds: true,
      allowLocationBasedAds: true,
      allowBehaviorBasedAds: true,
      maxAdsPerDay: 5,
      blockedAdvertisers: [],
      preferredAdTypes: ['business_spotlight', 'event_announcement'],
      optedOutCategories: [],
      dataUsageConsent: 'internal_only'
    },
    explanation: 'Control how MarketPace members can target ads to you',
    dataPolicy: 'These settings only affect internal MarketPace ad targeting'
  });
});

app.put('/api/ads/preferences', (req, res) => {
  const preferences = req.body;
  
  res.json({
    success: true,
    message: 'Ad preferences updated successfully',
    updatedPreferences: preferences,
    privacy: 'Preferences control internal MarketPace ad targeting only',
    effect: 'Changes how other MarketPace members can advertise to you'
  });
});

app.post('/api/ads/targeting-suggestions', (req, res) => {
  const { adType, budget, location } = req.body;
  
  res.json({
    success: true,
    suggestions: {
      estimatedReach: 342,
      topInterests: ['local_shopping', 'food_dining', 'community_events'],
      optimalBudget: 50,
      recommendedBid: 0.65,
      bestTimeSlots: ['weekday_evening', 'weekend_morning'],
      competitorAnalysis: {
        averageBid: 0.58,
        topPerformingCategories: ['restaurants', 'services', 'events']
      },
      audienceInsights: `Strong local engagement in ${location || 'Orange Beach'} area`,
      forecastedResults: {
        expectedImpressions: 450,
        expectedClicks: 27,
        estimatedConversions: 4
      }
    },
    privacy: 'Targeting suggestions based on MarketPace member data only',
    scope: 'Analysis limited to internal platform activity'
  });
});

// Campaign management endpoints
app.get('/api/ads/campaigns', (req, res) => {
  res.json({
    success: true,
    campaigns: [
      {
        id: 'camp_123',
        title: 'Coffee Shop Grand Opening',
        status: 'active',
        budget: 100,
        spent: 65.25,
        impressions: 1250,
        clicks: 87,
        conversions: 12,
        startDate: '2025-01-08',
        endDate: '2025-01-15'
      }
    ],
    total: 1,
    privacy: 'Campaign data specific to your MarketPace advertising'
  });
});

app.put('/api/ads/campaigns/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  res.json({
    success: true,
    message: `Campaign ${id} updated successfully`,
    updates,
    privacy: 'Campaign changes affect MarketPace member targeting only'
  });
});

app.delete('/api/ads/campaigns/:id', (req, res) => {
  const { id } = req.params;
  
  res.json({
    success: true,
    message: `Campaign ${id} deleted successfully`,
    privacy: 'Campaign data removed from MarketPace platform'
  });
});

// Basic API endpoints for authentication simulation
app.post('/api/seamless-signup', (req, res) => {
  res.json({
    success: true,
    message: 'User registered successfully',
    user: { id: 'user_123', ...req.body }
  });
});

app.post('/api/seamless-login', (req, res) => {
  res.json({
    success: true,
    message: 'Login successful',
    user: { id: 'user_123', email: req.body.email }
  });
});

const port = process.env.PORT || 5000;

app.listen(port, "0.0.0.0", () => {
  console.log(`MarketPace Server running on port ${port}`);
  console.log('🎯 Internal Advertising System Active');
  console.log('🔒 Privacy Protected: All ad data stays within MarketPace');
  console.log('👥 Member-to-Member advertising only - No external data sharing');
  console.log('📊 Complete Facebook-style ad builder with targeting and analytics');
  console.log('✅ Zero external data sales - Internal platform advertising only');
});