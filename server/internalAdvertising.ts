import { Request, Response } from 'express';
import { db } from './db';
import { users } from '../shared/schema';
import { eq, and, or, like, gte, ne } from 'drizzle-orm';

// Internal Advertising System for MarketPace Members
// Members can target other members with Facebook-style ads
// NO external data sharing - everything stays within MarketPace

export interface AdCampaign {
  id: string;
  advertiserId: string;
  title: string;
  description: string;
  imageUrl?: string;
  targetingRules: TargetingRules;
  budget: number;
  dailyBudget: number;
  bidAmount: number;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'active' | 'paused' | 'completed';
  adType: 'marketplace_listing' | 'service_promotion' | 'event_announcement' | 'business_spotlight';
  createdAt: Date;
  updatedAt: Date;
}

export interface TargetingRules {
  // Geographic targeting
  cities?: string[];
  radius?: number; // miles from user location
  
  // Demographic targeting
  ageRange?: { min: number; max: number };
  interests?: string[];
  
  // Behavioral targeting (based on MarketPace activity only)
  recentBuyers?: boolean;
  recentSellers?: boolean;
  serviceProviders?: boolean;
  eventAttendees?: boolean;
  
  // Business targeting
  businessOwners?: boolean;
  specificBusinessTypes?: string[];
  
  // Activity-based targeting
  activeInLastDays?: number;
  hasCompletedTransactions?: boolean;
  membershipTier?: 'basic' | 'pro' | 'premium';
}

export interface AdImpression {
  id: string;
  adId: string;
  viewerId: string;
  viewedAt: Date;
  clickedAt?: Date;
  actionTaken?: 'viewed' | 'clicked' | 'purchased' | 'contacted';
  cost: number;
}

export class InternalAdvertisingSystem {
  
  // Create a new ad campaign for members
  static async createAdCampaign(
    advertiserId: string,
    campaignData: Partial<AdCampaign>
  ): Promise<AdCampaign> {
    
    const campaign: AdCampaign = {
      id: `ad_${Math.random().toString(36).substr(2, 9)}`,
      advertiserId,
      title: campaignData.title || '',
      description: campaignData.description || '',
      imageUrl: campaignData.imageUrl,
      targetingRules: campaignData.targetingRules || {},
      budget: campaignData.budget || 0,
      dailyBudget: campaignData.dailyBudget || 0,
      bidAmount: campaignData.bidAmount || 0.50, // Default 50 cents per click
      startDate: campaignData.startDate || new Date(),
      endDate: campaignData.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'draft',
      adType: campaignData.adType || 'marketplace_listing',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Store in database (would need to add ads table to schema)
    console.log(`Creating ad campaign: ${campaign.title} for user ${advertiserId}`);
    
    return campaign;
  }

  // Find target audience based on targeting rules
  static async findTargetAudience(
    targetingRules: TargetingRules,
    excludeUserId: string
  ): Promise<string[]> {
    
    let whereConditions: any[] = [];
    
    // Exclude the advertiser themselves
    whereConditions.push(ne(users.id, excludeUserId));
    
    // Geographic targeting
    if (targetingRules.cities && targetingRules.cities.length > 0) {
      const cityConditions = targetingRules.cities.map(city => 
        like(users.location, `%${city}%`)
      );
      whereConditions.push(or(...cityConditions));
    }
    
    // Age targeting (if available in user profile)
    if (targetingRules.ageRange) {
      // Would need age field in users table
      // whereConditions.push(
      //   and(
      //     gte(users.age, targetingRules.ageRange.min),
      //     lte(users.age, targetingRules.ageRange.max)
      //   )
      // );
    }
    
    // Business owner targeting
    if (targetingRules.businessOwners) {
      whereConditions.push(eq(users.userType, 'business'));
    }
    
    // Membership tier targeting
    if (targetingRules.membershipTier) {
      whereConditions.push(eq(users.subscriptionTier, targetingRules.membershipTier));
    }
    
    // Active user targeting
    if (targetingRules.activeInLastDays) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - targetingRules.activeInLastDays);
      whereConditions.push(gte(users.lastActiveAt, cutoffDate));
    }

    try {
      const targetUsers = await db.select({ id: users.id })
        .from(users)
        .where(and(...whereConditions))
        .limit(1000); // Reasonable limit for targeting

      return targetUsers.map(user => user.id);
    } catch (error) {
      console.error('Error finding target audience:', error);
      return [];
    }
  }

  // Serve personalized ads to members
  static async getPersonalizedAds(
    userId: string,
    location: string,
    interests: string[],
    limit: number = 3
  ): Promise<AdCampaign[]> {
    
    // This would query active ad campaigns and match them to user profile
    // For now, return sample ads structure
    
    const personalizedAds: AdCampaign[] = [
      {
        id: 'ad_local_restaurant',
        advertiserId: 'restaurant_owner_123',
        title: 'New Italian Restaurant - Grand Opening!',
        description: 'Try our authentic wood-fired pizza. 20% off first order for MarketPace members!',
        imageUrl: '/ads/restaurant_ad.jpg',
        targetingRules: {
          cities: [location],
          radius: 10,
          interests: ['food', 'dining'],
          recentBuyers: true
        },
        budget: 500,
        dailyBudget: 50,
        bidAmount: 0.75,
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        status: 'active',
        adType: 'business_spotlight',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'ad_local_service',
        advertiserId: 'handyman_456',
        title: 'Professional Handyman Services',
        description: 'Home repairs, installations, and maintenance. Licensed and insured!',
        imageUrl: '/ads/handyman_ad.jpg',
        targetingRules: {
          cities: [location],
          radius: 15,
          businessOwners: false,
          hasCompletedTransactions: true
        },
        budget: 300,
        dailyBudget: 30,
        bidAmount: 0.60,
        startDate: new Date(),
        endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        status: 'active',
        adType: 'service_promotion',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    return personalizedAds.slice(0, limit);
  }

  // Record ad impression and handle billing
  static async recordAdImpression(
    adId: string,
    viewerId: string,
    action: 'viewed' | 'clicked' | 'purchased' | 'contacted'
  ): Promise<void> {
    
    const impression: AdImpression = {
      id: `imp_${Math.random().toString(36).substr(2, 9)}`,
      adId,
      viewerId,
      viewedAt: new Date(),
      actionTaken: action,
      cost: action === 'clicked' ? 0.50 : 0.05 // 50 cents for click, 5 cents for view
    };

    if (action === 'clicked') {
      impression.clickedAt = new Date();
    }

    // Store impression and charge advertiser
    console.log(`Recording ${action} for ad ${adId} by user ${viewerId} - Cost: $${impression.cost}`);
    
    // In real implementation, this would:
    // 1. Store impression in database
    // 2. Charge advertiser's account
    // 3. Update campaign statistics
  }

  // Get ad performance analytics for advertisers
  static async getAdAnalytics(advertiserId: string, adId?: string): Promise<any> {
    
    // Sample analytics data structure
    return {
      totalImpressions: 1247,
      totalClicks: 89,
      clickThroughRate: 7.1,
      totalSpent: 67.35,
      averageCostPerClick: 0.76,
      conversions: 12,
      conversionRate: 13.5,
      reachedUsers: 1051,
      demographics: {
        ageGroups: {
          '18-24': 15,
          '25-34': 32,
          '35-44': 28,
          '45-54': 18,
          '55+': 7
        },
        locations: {
          'Orange Beach, AL': 45,
          'Gulf Shores, AL': 31,
          'Pensacola, FL': 24
        }
      },
      timePerformance: {
        bestPerformingHours: ['6-9 AM', '5-8 PM'],
        bestPerformingDays: ['Saturday', 'Sunday', 'Wednesday']
      }
    };
  }

  // Create Facebook-style ad builder interface
  static generateAdBuilderConfig(): any {
    return {
      adTypes: [
        {
          id: 'marketplace_listing',
          name: 'Marketplace Listing',
          description: 'Promote items you\'re selling to interested buyers',
          minBudget: 10,
          suggestedBid: 0.50
        },
        {
          id: 'service_promotion',
          name: 'Service Promotion',
          description: 'Advertise your services to local community members',
          minBudget: 25,
          suggestedBid: 0.75
        },
        {
          id: 'event_announcement',
          name: 'Event Announcement',
          description: 'Get the word out about your upcoming events',
          minBudget: 15,
          suggestedBid: 0.40
        },
        {
          id: 'business_spotlight',
          name: 'Business Spotlight',
          description: 'Showcase your business to potential customers',
          minBudget: 50,
          suggestedBid: 1.00
        }
      ],
      targetingOptions: {
        geographic: {
          cities: ['Orange Beach, AL', 'Gulf Shores, AL', 'Pensacola, FL'],
          radiusOptions: [5, 10, 15, 25, 50]
        },
        demographic: {
          ageRanges: [
            { label: '18-24', min: 18, max: 24 },
            { label: '25-34', min: 25, max: 34 },
            { label: '35-44', min: 35, max: 44 },
            { label: '45-54', min: 45, max: 54 },
            { label: '55+', min: 55, max: 100 }
          ]
        },
        interests: [
          'Shopping', 'Home Improvement', 'Food & Dining', 'Entertainment',
          'Sports & Fitness', 'Arts & Crafts', 'Technology', 'Automotive',
          'Fashion', 'Health & Wellness', 'Travel', 'Music & Events'
        ],
        behavioral: [
          'Recent Buyers', 'Recent Sellers', 'Service Providers',
          'Event Attendees', 'Business Owners', 'Active Members'
        ]
      },
      budgetSuggestions: {
        small: { budget: 25, dailyBudget: 5, duration: 5 },
        medium: { budget: 100, dailyBudget: 10, duration: 10 },
        large: { budget: 500, dailyBudget: 25, duration: 20 }
      }
    };
  }
}

// Revenue sharing model for internal ads
export class AdRevenueModel {
  
  // MarketPace keeps percentage of ad revenue
  static readonly PLATFORM_COMMISSION = 0.15; // 15%
  static readonly ADVERTISER_GETS = 0.85; // 85% goes to campaign effectiveness
  
  static calculateAdCost(
    impressions: number,
    clicks: number,
    bidAmount: number
  ): { totalCost: number; platformRevenue: number; campaignCost: number } {
    
    const viewCost = impressions * 0.05; // 5 cents per view
    const clickCost = clicks * bidAmount;
    const totalCost = viewCost + clickCost;
    
    const platformRevenue = totalCost * this.PLATFORM_COMMISSION;
    const campaignCost = totalCost * this.ADVERTISER_GETS;
    
    return { totalCost, platformRevenue, campaignCost };
  }
}