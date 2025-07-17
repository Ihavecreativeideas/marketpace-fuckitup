import type { Express } from "express";
import { notificationCenter } from "./notificationCenter";

export function registerAdminNotificationRoutes(app: Express) {
  
  // Admin endpoint to send community announcements
  app.post('/api/admin/send-announcement', async (req, res) => {
    try {
      const { 
        title, 
        message, 
        targetAudience = 'all', 
        memberIds, 
        priority = 'medium', 
        channels = ['email'],
        actionUrl,
        adminToken 
      } = req.body;

      // Simple admin authentication
      if (adminToken !== 'admin_token_2025') {
        return res.status(401).json({ error: 'Unauthorized access' });
      }

      if (!title || !message) {
        return res.status(400).json({ error: 'Title and message are required' });
      }

      const sentCount = await notificationCenter.sendAdminAnnouncement({
        title,
        message,
        targetAudience,
        memberIds,
        priority,
        channels,
        actionUrl
      });

      res.json({ 
        success: true, 
        message: `Announcement sent to ${sentCount} members`,
        sentCount 
      });
      
    } catch (error) {
      console.error('Error sending admin announcement:', error);
      res.status(500).json({ error: 'Failed to send announcement' });
    }
  });

  // Admin endpoint to send delivery availability notifications
  app.post('/api/admin/notify-delivery-available', async (req, res) => {
    try {
      const { 
        cityName, 
        memberIds, 
        customMessage,
        adminToken 
      } = req.body;

      if (adminToken !== 'admin_token_2025') {
        return res.status(401).json({ error: 'Unauthorized access' });
      }

      const title = `🚚 Delivery Now Available in ${cityName}!`;
      const message = customMessage || `Great news! MarketPace delivery service is now live in ${cityName}. Start ordering from local shops and get items delivered to your door!`;

      const sentCount = await notificationCenter.sendAdminAnnouncement({
        title,
        message,
        targetAudience: memberIds ? 'specific' : 'all',
        memberIds,
        priority: 'high',
        channels: ['sms', 'email'],
        actionUrl: 'https://marketpace.shop/community.html'
      });

      res.json({ 
        success: true, 
        message: `Delivery availability notification sent to ${sentCount} members`,
        sentCount 
      });
      
    } catch (error) {
      console.error('Error sending delivery availability notification:', error);
      res.status(500).json({ error: 'Failed to send notification' });
    }
  });

  // Admin endpoint to notify members about favorite member activity
  app.post('/api/admin/notify-favorite-activity', async (req, res) => {
    try {
      const { 
        memberIds, 
        favoriteMemberName, 
        activityType, 
        itemName,
        actionUrl,
        adminToken 
      } = req.body;

      if (adminToken !== 'admin_token_2025') {
        return res.status(401).json({ error: 'Unauthorized access' });
      }

      if (!memberIds || !memberIds.length) {
        return res.status(400).json({ error: 'Member IDs are required' });
      }

      const title = `💝 ${favoriteMemberName} posted something new!`;
      const message = activityType === 'new_item' 
        ? `${favoriteMemberName} just posted "${itemName}" for sale in your community.`
        : `${favoriteMemberName} has new activity you might be interested in.`;

      const sentCount = await notificationCenter.notifyMembers({
        memberIds,
        type: 'favorite_post',
        title,
        message,
        actionUrl,
        priority: 'medium',
        channels: ['sms', 'email']
      });

      res.json({ 
        success: true, 
        message: `Favorite activity notifications sent to ${sentCount} members`,
        sentCount 
      });
      
    } catch (error) {
      console.error('Error sending favorite activity notification:', error);
      res.status(500).json({ error: 'Failed to send notification' });
    }
  });

  // Admin endpoint to send interest-based recommendations
  app.post('/api/admin/notify-interest-match', async (req, res) => {
    try {
      const { 
        memberIds, 
        itemName, 
        sellerName, 
        price,
        category,
        actionUrl,
        adminToken 
      } = req.body;

      if (adminToken !== 'admin_token_2025') {
        return res.status(401).json({ error: 'Unauthorized access' });
      }

      const title = `🎯 New ${category} item matches your interests!`;
      const message = `${sellerName} just posted "${itemName}" for $${price}. Based on your activity, you might be interested in this item.`;

      const sentCount = await notificationCenter.notifyMembers({
        memberIds,
        type: 'interest_match',
        title,
        message,
        actionUrl,
        priority: 'medium',
        channels: ['email']
      });

      res.json({ 
        success: true, 
        message: `Interest match notifications sent to ${sentCount} members`,
        sentCount 
      });
      
    } catch (error) {
      console.error('Error sending interest match notification:', error);
      res.status(500).json({ error: 'Failed to send notification' });
    }
  });

  // Admin endpoint to get notification statistics
  app.get('/api/admin/notification-stats', async (req, res) => {
    try {
      const { adminToken } = req.query;

      if (adminToken !== 'admin_token_2025') {
        return res.status(401).json({ error: 'Unauthorized access' });
      }

      // In a real implementation, you'd query the notifications table
      const stats = {
        totalSent: 1247,
        successRate: 94.2,
        lastWeek: {
          sellerNotifications: 89,
          memberNotifications: 156,
          adminAnnouncements: 3
        },
        byType: {
          seller_sale: 89,
          favorite_post: 34,
          interest_match: 67,
          community_update: 23,
          delivery_available: 12,
          admin_announcement: 22
        }
      };

      res.json(stats);
      
    } catch (error) {
      console.error('Error getting notification stats:', error);
      res.status(500).json({ error: 'Failed to get stats' });
    }
  });
}