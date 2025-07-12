import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import { config } from "dotenv";

// Load environment variables
config();

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Test internal advertising routes
app.get('/internal-ads-demo', (req, res) => {
  res.sendFile(path.join(__dirname, '../internal-ads-demo.html'));
});

// Internal advertising API routes (Member-to-Member ads ONLY)
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
      targetingOptions: {
        geographic: ['city', 'radius', 'neighborhood'],
        demographic: ['age_range', 'interests', 'member_type'],
        behavioral: ['recent_buyers', 'frequent_browsers', 'service_seekers']
      },
      privacyNotice: 'All targeting uses only MarketPace member data. No external data sources.'
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
  console.log(`Test server running on port ${port}`);
  console.log('Internal Advertising System ready - Member-to-Member ads only');
  console.log('Privacy Protected: All ad data stays within MarketPace');
});