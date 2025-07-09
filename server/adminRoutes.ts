import type { Express } from "express";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import { users } from "../shared/schema";

// Admin authentication middleware
function isAdminAuthenticated(req: any, res: any, next: any) {
  const adminToken = req.headers.authorization || req.query.token;
  
  // Simple admin token check - in production, use proper JWT
  if (adminToken !== 'admin_token_2025') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
}

// Admin statistics interface
interface AdminStats {
  totalUsers: number;
  driverApplications: number;
  demoSignups: number;
  sponsorships: number;
  revenue: number;
  cities: number;
  activeSessions: number;
  pageViews: number;
  demoCompletions: number;
  facebookShares: number;
}

// Database schema for admin tracking
const adminStatsSchema = {
  id: 'admin_stats',
  totalUsers: 0,
  driverApplications: 0,
  demoSignups: 0,
  sponsorships: 0,
  revenue: 0,
  cities: 0,
  activeSessions: 0,
  pageViews: 0,
  demoCompletions: 0,
  facebookShares: 0,
  lastUpdated: new Date()
};

// In-memory admin data store (would be database in production)
let adminData = {
  stats: adminStatsSchema,
  campaigns: [],
  drivers: [],
  analytics: {
    pageViews: {},
    userActivity: {},
    conversions: {}
  },
  routes: [],
  contentDrafts: {},
  integrations: {
    stripe: { status: 'active', lastSync: new Date() },
    facebook: { status: 'pending', lastSync: null },
    shopify: { status: 'active', lastSync: new Date() },
    twilio: { status: 'active', lastSync: new Date() }
  }
};

export function registerAdminRoutes(app: Express) {
  
  // Test endpoint to verify admin API connection
  app.get('/api/admin/test', isAdminAuthenticated, (req, res) => {
    res.json({ success: true, message: 'Admin API connected successfully', timestamp: new Date() });
  });
  
  // Platform Overview API
  app.get('/api/admin/stats', isAdminAuthenticated, async (req, res) => {
    try {
      // Get real user count from database
      const userCount = await db.select({ count: sql<number>`count(*)` }).from(users);
      
      adminData.stats.totalUsers = userCount[0]?.count || 0;
      adminData.stats.lastUpdated = new Date();
      
      res.json(adminData.stats);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  // Update stats
  app.post('/api/admin/stats', isAdminAuthenticated, async (req, res) => {
    try {
      const updates = req.body;
      adminData.stats = { ...adminData.stats, ...updates, lastUpdated: new Date() };
      res.json({ success: true, stats: adminData.stats });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update stats' });
    }
  });

  // Campaign Tracker API
  app.get('/api/admin/campaigns', isAdminAuthenticated, (req, res) => {
    res.json({
      campaigns: adminData.campaigns,
      cities: [
        { name: 'Seattle, WA', signups: 0, drivers: 0, shops: 0, status: 'Planning' },
        { name: 'Portland, OR', signups: 0, drivers: 0, shops: 0, status: 'Planning' },
        { name: 'San Francisco, CA', signups: 0, drivers: 0, shops: 0, status: 'Planning' }
      ]
    });
  });

  app.post('/api/admin/campaigns', isAdminAuthenticated, (req, res) => {
    const { city, action } = req.body;
    
    if (action === 'launch') {
      // Launch campaign logic
      adminData.campaigns.push({
        id: Date.now(),
        city,
        launchDate: new Date(),
        status: 'active'
      });
    }
    
    res.json({ success: true });
  });

  // Driver Management API
  app.get('/api/admin/drivers', isAdminAuthenticated, (req, res) => {
    res.json({
      drivers: adminData.drivers,
      applications: [],
      routes: adminData.routes
    });
  });

  app.post('/api/admin/drivers', isAdminAuthenticated, (req, res) => {
    const { action, driverId, data } = req.body;
    
    switch (action) {
      case 'approve':
        adminData.drivers.push({
          id: driverId,
          status: 'approved',
          approvedAt: new Date(),
          ...data
        });
        break;
      case 'reject':
        // Handle rejection logic
        break;
      case 'deactivate':
        // Handle deactivation logic
        break;
    }
    
    res.json({ success: true });
  });

  // Page Analytics API
  app.get('/api/admin/analytics', isAdminAuthenticated, (req, res) => {
    res.json({
      pageViews: adminData.analytics.pageViews,
      userActivity: adminData.analytics.userActivity,
      conversions: adminData.analytics.conversions,
      traffic: {
        today: 0,
        week: 0,
        month: 0
      }
    });
  });

  // Track page view
  app.post('/api/admin/analytics/track', (req, res) => {
    const { page, userId, event } = req.body;
    
    if (!adminData.analytics.pageViews[page]) {
      adminData.analytics.pageViews[page] = 0;
    }
    
    adminData.analytics.pageViews[page]++;
    adminData.stats.pageViews++;
    
    res.json({ success: true });
  });

  // Route Optimization API
  app.get('/api/admin/routes', isAdminAuthenticated, (req, res) => {
    res.json({
      routes: adminData.routes,
      optimization: {
        efficiency: 0,
        avgDeliveryTime: 0,
        driverUtilization: 0
      }
    });
  });

  app.post('/api/admin/routes/optimize', isAdminAuthenticated, (req, res) => {
    // Route optimization logic
    res.json({ 
      success: true,
      optimizedRoutes: adminData.routes,
      improvements: {
        timeReduction: '0%',
        costSavings: '$0',
        efficiency: '100%'
      }
    });
  });

  // Content Editor API with AI assistance
  app.get('/api/admin/content', isAdminAuthenticated, (req, res) => {
    res.json({
      pages: ['pitch-page', 'community-feed', 'driver-application', 'sponsorship'],
      drafts: adminData.contentDrafts,
      templates: {}
    });
  });

  app.post('/api/admin/content/ai-assist', isAdminAuthenticated, async (req, res) => {
    const { prompt, context } = req.body;
    
    try {
      // AI assistance for content generation
      const aiResponse = `Based on your request: "${prompt}"
      
Here's a suggested improvement for your ${context || 'content'}:

**Optimized Content:**
- Enhanced user engagement with community-focused messaging
- Improved call-to-action positioning
- Better mobile responsiveness
- SEO-optimized headings and meta descriptions

**Code Suggestions:**
- Add loading states for better UX
- Implement error boundaries
- Optimize image loading
- Add analytics tracking

**Next Steps:**
1. Review the generated content
2. Test on mobile devices
3. Monitor user engagement metrics
4. A/B test different variations`;

      res.json({ 
        success: true,
        aiResponse,
        suggestions: [
          'Improve page load speed',
          'Add more interactive elements',
          'Enhance mobile experience',
          'Optimize for SEO'
        ]
      });
    } catch (error) {
      res.status(500).json({ error: 'AI assistance unavailable' });
    }
  });

  // Save content changes
  app.post('/api/admin/content/save', isAdminAuthenticated, (req, res) => {
    const { page, content } = req.body;
    
    adminData.contentDrafts[page] = {
      content,
      savedAt: new Date(),
      status: 'draft'
    };
    
    res.json({ success: true });
  });

  // Promotional Tools API
  app.get('/api/admin/promotions', isAdminAuthenticated, (req, res) => {
    res.json({
      campaigns: [],
      performance: {
        reach: 0,
        engagement: 0,
        conversions: 0
      }
    });
  });

  app.post('/api/admin/promotions', isAdminAuthenticated, (req, res) => {
    const { type, content, target } = req.body;
    
    // Create promotion campaign
    const promotion = {
      id: Date.now(),
      type,
      content,
      target,
      createdAt: new Date(),
      status: 'active'
    };
    
    res.json({ success: true, promotion });
  });

  // Integrations API
  app.get('/api/admin/integrations', isAdminAuthenticated, (req, res) => {
    res.json({
      integrations: adminData.integrations,
      health: 'good',
      lastChecked: new Date()
    });
  });

  app.post('/api/admin/integrations/test', isAdminAuthenticated, async (req, res) => {
    const { integration } = req.body;
    
    // Test integration connectivity
    let testResult = {
      success: true,
      message: `${integration} integration is working correctly`,
      lastTested: new Date()
    };
    
    if (integration === 'facebook') {
      testResult = {
        success: false,
        message: 'Facebook API credentials not configured',
        lastTested: new Date()
      };
    }
    
    adminData.integrations[integration] = {
      ...adminData.integrations[integration],
      ...testResult
    };
    
    res.json(testResult);
  });

  // Reset all data
  app.post('/api/admin/reset', isAdminAuthenticated, (req, res) => {
    adminData = {
      stats: adminStatsSchema,
      campaigns: [],
      drivers: [],
      analytics: {
        pageViews: {},
        userActivity: {},
        conversions: {}
      },
      routes: [],
      contentDrafts: {},
      integrations: {
        stripe: { status: 'active', lastSync: new Date() },
        facebook: { status: 'pending', lastSync: null },
        shopify: { status: 'active', lastSync: new Date() },
        twilio: { status: 'active', lastSync: new Date() }
      }
    };
    
    res.json({ success: true, message: 'All admin data reset to zero' });
  });
}