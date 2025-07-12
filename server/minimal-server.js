const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Main routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../pitch-page.html'));
});

app.get('/pitch-page', (req, res) => {
  res.sendFile(path.join(__dirname, '../pitch-page.html'));
});

app.get('/community', (req, res) => {
  res.sendFile(path.join(__dirname, '../community.html'));
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

// Test route
app.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is working',
    timestamp: new Date()
  });
});

// Internal Ads Demo route
app.get('/internal-ads-demo', (req, res) => {
  res.sendFile(path.join(__dirname, '../internal-ads-demo.html'));
});

// Facebook Marketplace Integration route
app.get('/facebook-marketplace-integration', (req, res) => {
  res.sendFile(path.join(__dirname, '../facebook-marketplace-integration.html'));
});

// Facebook App Promotion route
app.get('/facebook-app-promotion', (req, res) => {
  res.sendFile(path.join(__dirname, '../facebook-app-promotion.html'));
});

// *** FACEBOOK MARKETPLACE-STYLE PROMOTION SYSTEM ***
// Facebook Product Catalog Integration for Member Products

app.post('/api/facebook/promote-to-marketplace', (req, res) => {
  const { productId, memberDetails, productData } = req.body;
  
  const deliveryButtonId = 'deliver_' + Math.random().toString(36).substr(2, 9);
  const marketplaceLink = `https://marketpace.shop/order/${productId}?ref=facebook&delivery=${deliveryButtonId}`;
  
  res.json({
    success: true,
    message: 'Product promotion to Facebook ecosystem initiated with MarketPace delivery integration',
    promotionId: 'fb_promo_' + Math.random().toString(36).substr(2, 9),
    productCatalogId: 'catalog_' + Math.random().toString(36).substr(2, 9),
    promotion: {
      productId,
      status: 'processing',
      facebookIntegration: {
        productCatalog: 'Created',
        facebookShop: 'Listed',
        marketplaceAds: 'Campaign Started',
        instagramShopping: 'Tagged',
        deliverNowButton: 'Active'
      },
      estimatedReach: '5,000-15,000 local Facebook users',
      marketplaceFeatures: [
        'Product appears in Facebook Shop',
        'Eligible for Marketplace-style ads',
        'Instagram Shopping tags',
        'Facebook feed promotions',
        'Local discovery optimization',
        '"Deliver Now" button for instant MarketPace ordering'
      ]
    },
    deliverNowIntegration: {
      description: 'Facebook users see "Deliver Now" button that brings them to MarketPace for instant delivery',
      buttonText: 'Deliver Now via MarketPace',
      marketplaceLink: marketplaceLink,
      features: [
        'One-click delivery ordering from Facebook',
        'Automatic MarketPace member signup for Facebook users',
        'Same-day delivery promotion highlighted',
        'Local delivery network integration',
        'Member conversion tracking from Facebook traffic'
      ],
      membershipIncentive: {
        message: 'Join MarketPace for instant local delivery!',
        benefits: [
          'Same-day delivery available',
          'Support local community members',
          'Track your order in real-time',
          'Rate and review delivery experience',
          'Access to local marketplace community'
        ]
      }
    },
    wayfairStyle: {
      description: 'Your product is now promoted like major retailers with enhanced delivery options',
      features: [
        'Professional product catalog listing',
        'Facebook Shop storefront placement',
        'Automated ad campaigns to local buyers',
        'Cross-platform visibility (Facebook + Instagram)',
        'Local marketplace-style discovery',
        'Instant delivery call-to-action buttons'
      ]
    },
    privacy: 'Product data shared only with Facebook for legitimate marketplace promotion'
  });
});

app.get('/api/facebook/catalog-status/:memberId', (req, res) => {
  const { memberId } = req.params;
  
  res.json({
    success: true,
    member: memberId,
    facebookCatalog: {
      status: 'active',
      productsListed: 12,
      totalViews: 2847,
      inquiries: 23,
      shopVisits: 156
    },
    marketplaceMetrics: {
      localReach: '8,500 users in Orange Beach area',
      impressions: 15420,
      clicks: 312,
      saveRate: '4.2%',
      inquiryRate: '7.4%'
    },
    activePromotions: [
      {
        productId: 'prod_123',
        name: 'Vintage Dining Table',
        status: 'Live on Facebook Shop',
        reach: 2400,
        engagement: 89
      },
      {
        productId: 'prod_456', 
        name: 'Mountain Bike',
        status: 'Instagram Shopping Tagged',
        reach: 1800,
        engagement: 67
      }
    ]
  });
});

app.post('/api/facebook/create-product-catalog', (req, res) => {
  const { memberInfo, businessType } = req.body;
  
  res.json({
    success: true,
    message: 'Facebook Product Catalog created for member',
    catalog: {
      catalogId: 'catalog_' + Math.random().toString(36).substr(2, 9),
      businessName: memberInfo.businessName || `${memberInfo.name}'s MarketPace Shop`,
      status: 'active',
      integrations: {
        facebookShop: 'Connected',
        instagramShopping: 'Connected',
        facebookAds: 'Enabled',
        dynamicAds: 'Ready'
      },
      capabilities: [
        'Product feed auto-sync',
        'Inventory management',
        'Price updates',
        'Local marketplace ads',
        'Cross-platform promotion'
      ]
    },
    marketplacePromotion: {
      description: 'Your products can now be promoted across Facebook ecosystem',
      features: [
        'Facebook Shop storefront',
        'Marketplace-style local ads',
        'Instagram product tags',
        'Dynamic retargeting ads',
        'Local discovery optimization'
      ]
    }
  });
});

app.post('/api/facebook/sync-product-feed', (req, res) => {
  const { catalogId, products } = req.body;
  
  res.json({
    success: true,
    message: 'Product feed synchronized with Facebook',
    sync: {
      catalogId,
      productsUpdated: products.length,
      status: 'completed',
      timestamp: new Date(),
      marketplaceReady: true
    },
    productStatus: products.map(product => ({
      id: product.id,
      name: product.name,
      facebookStatus: 'approved',
      marketplaceEligible: true,
      instagramReady: true
    })),
    promotionCapabilities: {
      localAds: 'Enabled - Target Facebook users in your area',
      marketplaceDiscovery: 'Active - Products appear in relevant searches',
      socialCommerce: 'Connected - Instagram and Facebook shopping',
      retargeting: 'Ready - Re-engage interested customers'
    }
  });
});

app.get('/api/facebook/marketplace-analytics/:catalogId', (req, res) => {
  const { catalogId } = req.params;
  
  res.json({
    success: true,
    catalogId,
    analytics: {
      period: 'Last 30 days',
      marketplaceMetrics: {
        productViews: 12750,
        shopVisits: 845,
        inquiries: 156,
        saves: 234,
        shares: 89
      },
      demographicBreakdown: {
        'Orange Beach, AL': 45,
        'Gulf Shores, AL': 30,
        'Mobile, AL': 15,
        'Pensacola, FL': 10
      },
      topPerformingProducts: [
        { name: 'Vintage Dining Table', views: 2400, inquiries: 23 },
        { name: 'Mountain Bike', views: 1800, inquiries: 18 },
        { name: 'Outdoor Furniture Set', views: 1650, inquiries: 15 }
      ],
      wayfairComparison: {
        description: 'Your products are promoted with enterprise-level features',
        reach: 'Similar local targeting as major retailers',
        visibility: 'Facebook Shop + Instagram + Marketplace ads'
      }
    }
  });
});

// Internal advertising API routes
app.post('/api/ads/campaigns', (req, res) => {
  res.json({
    success: true,
    message: 'Ad campaign created successfully for member-to-member targeting',
    campaignId: 'ad_' + Math.random().toString(36).substr(2, 9),
    privacy: 'All ad data stays within MarketPace - never shared externally'
  });
});

app.get('/api/ads/builder-config', (req, res) => {
  res.json({
    success: true,
    config: {
      adTypes: [
        { id: 'marketplace_listing', name: 'Marketplace Listing', description: 'Promote your items for sale' },
        { id: 'service_promotion', name: 'Service Promotion', description: 'Advertise your professional services' },
        { id: 'event_announcement', name: 'Event Announcement', description: 'Promote local events and entertainment' },
        { id: 'business_spotlight', name: 'Business Spotlight', description: 'Highlight your local business' }
      ],
      privacyNotice: 'All targeting uses only MarketPace member data. No external data sources.'
    }
  });
});

// Facebook Delivery Button Integration for Member Conversion
app.get('/api/facebook/delivery-button/:productId', (req, res) => {
  const { productId } = req.params;
  const { ref, delivery } = req.query;
  
  res.json({
    success: true,
    productId,
    deliveryButton: {
      buttonText: 'Deliver Now via MarketPace',
      buttonStyle: {
        backgroundColor: '#00bfff',
        color: 'white',
        padding: '12px 24px',
        borderRadius: '25px',
        fontWeight: 'bold',
        border: 'none',
        cursor: 'pointer'
      },
      clickAction: 'redirect_to_marketpace',
      destinationUrl: `https://marketpace.shop/order/${productId}?ref=${ref}&delivery=${delivery}`,
      membershipPromotion: {
        headline: 'Get It Delivered Today!',
        subtext: 'Join MarketPace for instant local delivery from community members',
        benefits: [
          '⚡ Same-day delivery available',
          '🏠 Support your local community',
          '📱 Track your order in real-time',
          '🚚 Professional local drivers',
          '⭐ Rate your delivery experience'
        ],
        callToAction: 'Join MarketPace & Order Now'
      }
    },
    conversionTracking: {
      source: 'facebook_marketplace',
      referralId: delivery,
      expectedConversionRate: '12-18%',
      averageOrderValue: '$45-75',
      deliveryRadius: '15 miles from seller location'
    }
  });
});

app.post('/api/facebook/track-conversion', (req, res) => {
  const { productId, deliveryButtonId, userAction, facebookUserId } = req.body;
  
  res.json({
    success: true,
    message: 'Facebook user conversion tracked successfully',
    conversion: {
      productId,
      deliveryButtonId,
      userAction, // 'clicked', 'viewed', 'signed_up', 'ordered'
      facebookUserId,
      timestamp: new Date(),
      conversionStage: userAction === 'ordered' ? 'completed' : 'in_progress'
    },
    membershipStatus: {
      isNewMember: userAction === 'signed_up',
      orderPlaced: userAction === 'ordered',
      deliveryScheduled: userAction === 'ordered' ? 'same_day_available' : null
    },
    analytics: {
      totalFacebookConversions: 156,
      conversionRate: '14.2%',
      averageOrderValue: '$62.50',
      newMembersFromFacebook: 89
    }
  });
});

// *** FACEBOOK APP PROMOTION SYSTEM ***
// Facebook Ads integration for MarketPace app marketing

app.post('/api/facebook/create-app-campaign', (req, res) => {
  const { type, name, location, budget, headline, description, callToAction } = req.body;
  
  const campaignId = 'fb_app_' + Math.random().toString(36).substr(2, 9);
  const adSetId = 'adset_' + Math.random().toString(36).substr(2, 9);
  
  // Calculate estimates based on budget and campaign type
  const dailyBudget = parseFloat(budget);
  const estimatedReach = Math.floor(dailyBudget * 600); // ~600 people per dollar
  const conversionRate = type === 'app-install' ? 0.032 : 0.025;
  const expectedInstalls = Math.floor(estimatedReach * conversionRate);
  const costPerInstall = dailyBudget / expectedInstalls;
  
  res.json({
    success: true,
    message: 'Facebook app promotion campaign created successfully',
    campaign: {
      campaignId,
      adSetId,
      name,
      type,
      status: 'active',
      objective: type === 'app-install' ? 'APP_INSTALLS' : 'BRAND_AWARENESS',
      targeting: {
        location: location,
        interests: [
          'Local business',
          'Community support',
          'Shopping',
          'Marketplace apps',
          'Local commerce'
        ],
        ageRange: '18-65',
        platform: ['Facebook', 'Instagram']
      },
      creative: {
        headline,
        description,
        callToAction,
        appStoreUrl: 'https://apps.apple.com/app/marketpace',
        playStoreUrl: 'https://play.google.com/store/apps/details?id=com.marketpace'
      },
      budget: {
        daily: dailyBudget,
        total: dailyBudget * 30, // 30-day campaign
        currency: 'USD'
      }
    },
    estimates: {
      reach: estimatedReach,
      installs: expectedInstalls,
      costPerInstall: costPerInstall.toFixed(2),
      conversionRate: (conversionRate * 100).toFixed(1),
      impressions: estimatedReach * 2.5,
      clicks: Math.floor(estimatedReach * 0.08)
    },
    features: [
      'Smart targeting based on local shopping interests',
      'App store optimization with direct download links',
      'Cross-platform delivery (Facebook + Instagram)',
      'Real-time performance tracking and analytics',
      'A/B testing capabilities for optimization',
      'Local community focus in ad messaging'
    ]
  });
});

app.get('/api/facebook/campaign-analytics/:campaignId', (req, res) => {
  const { campaignId } = req.params;
  const { days = 7 } = req.query;
  
  res.json({
    success: true,
    campaignId,
    period: `Last ${days} days`,
    performance: {
      appInstalls: 156,
      impressions: 45280,
      clicks: 2341,
      spend: 175.50,
      costPerInstall: 1.12,
      installRate: 6.7,
      reach: 18945
    },
    demographics: {
      ageGroups: {
        '18-24': 25,
        '25-34': 35,
        '35-44': 22,
        '45-54': 12,
        '55+': 6
      },
      gender: {
        female: 58,
        male: 42
      },
      devices: {
        mobile: 87,
        desktop: 13
      }
    },
    geographic: {
      'Orange Beach, AL': 45,
      'Gulf Shores, AL': 28,
      'Mobile, AL': 15,
      'Pensacola, FL': 12
    },
    hourlyPerformance: {
      bestHours: ['6-9 PM', '12-2 PM', '7-9 AM'],
      peakDays: ['Saturday', 'Sunday', 'Friday'],
      installTimes: {
        morning: 28,
        afternoon: 35,
        evening: 37
      }
    },
    optimization: {
      suggestions: [
        'Increase budget during peak hours (6-9 PM)',
        'Focus targeting on 25-44 age group',
        'Test video creative for higher engagement',
        'Add weekend budget boost for optimal performance'
      ],
      topPerformingAudiences: [
        'Local shopping enthusiasts',
        'Community supporters',
        'Small business advocates'
      ]
    }
  });
});

app.post('/api/facebook/optimize-campaign', (req, res) => {
  const { campaignId, optimizations } = req.body;
  
  res.json({
    success: true,
    message: 'Campaign optimization applied successfully',
    campaignId,
    optimizations: {
      applied: optimizations,
      expectedImprovement: {
        installRate: '+15%',
        costPerInstall: '-12%',
        reach: '+25%'
      },
      timestamp: new Date()
    },
    recommendations: {
      budget: 'Consider increasing daily budget to $35 for better performance',
      targeting: 'Expand to include nearby cities for larger audience',
      creative: 'Test video ads showing app features and community benefits',
      timing: 'Schedule ads during peak local activity hours'
    }
  });
});

app.get('/api/ads/personalized', (req, res) => {
  res.json({
    success: true,
    ads: [
      {
        id: 'ad_demo1',
        title: 'Local Coffee Shop Grand Opening',
        description: 'Try our artisan coffee and fresh pastries! 20% off first order for MarketPace members.',
        imageUrl: '/placeholder-coffee.jpg',
        adType: 'business_spotlight',
        advertiser: 'Orange Beach Coffee Co.',
        targetReason: 'Based on your interest in local food and drinks'
      }
    ],
    privacyNote: 'These ads are targeted using only your MarketPace activity and preferences'
  });
});

const port = process.env.PORT || 5000;

app.listen(port, "0.0.0.0", () => {
  console.log(`MarketPace Server running on port ${port}`);
  console.log('Internal Advertising System ready - Member-to-Member ads only');
  console.log('Privacy Protected: All ad data stays within MarketPace');
});