import { notificationService, PurchaseNotificationData } from './notificationService';
import { db } from './db';
import { users } from '../shared/schema';
import { eq, and, inArray } from 'drizzle-orm';

export interface NotificationData {
  id?: string;
  userId: string;
  type: 'purchase_alert' | 'favorite_post' | 'interest_match' | 'community_update' | 'delivery_available' | 'seller_sale' | 'admin_announcement';
  title: string;
  message: string;
  data?: any;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: ('sms' | 'email' | 'push')[];
  createdAt: Date;
  sentAt?: Date;
  status: 'pending' | 'sent' | 'failed' | 'read';
}

export interface SellerNotificationData {
  sellerId: string;
  sellerEmail?: string;
  sellerPhone?: string;
  customerName: string;
  itemName: string;
  amount: number;
  orderNumber: string;
  deliveryAddress: string;
  itemId?: string;
}

export interface MemberNotificationData {
  memberIds: string[];
  type: 'favorite_post' | 'interest_match' | 'community_update' | 'delivery_available';
  title: string;
  message: string;
  actionUrl?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  channels: ('sms' | 'email')[];
  data?: any;
}

export class NotificationCenter {
  
  // Send real-time seller notification for item purchase
  async notifySellerOfPurchase(data: SellerNotificationData): Promise<boolean> {
    try {
      console.log(`Sending seller notification to ${data.sellerId} for purchase of ${data.itemName}`);
      
      // Get seller contact information from database
      const seller = await db.select({
        email: users.email,
        phone: users.phone,
        username: users.username
      }).from(users).where(eq(users.id, data.sellerId)).limit(1);

      if (!seller.length) {
        console.log('Seller not found in database');
        return false;
      }

      const sellerInfo = seller[0];
      
      // Send seller notification email
      if (sellerInfo.email || data.sellerEmail) {
        await notificationService.sendSellerNotification({
          sellerEmail: data.sellerEmail || sellerInfo.email!,
          customerName: data.customerName,
          itemName: data.itemName,
          amount: data.amount,
          orderNumber: data.orderNumber,
          deliveryAddress: data.deliveryAddress
        });
      }

      // Send seller SMS notification
      if (sellerInfo.phone || data.sellerPhone) {
        await this.sendSellerSMS({
          sellerPhone: data.sellerPhone || sellerInfo.phone!,
          sellerName: sellerInfo.username || 'Seller',
          customerName: data.customerName,
          itemName: data.itemName,
          amount: data.amount,
          orderNumber: data.orderNumber
        });
      }

      // Log notification to database
      await this.logNotification({
        userId: data.sellerId,
        type: 'seller_sale',
        title: `New Sale: ${data.itemName}`,
        message: `${data.customerName} purchased your ${data.itemName} for $${data.amount}`,
        priority: 'high',
        channels: ['sms', 'email'],
        createdAt: new Date(),
        status: 'sent',
        data: { 
          orderNumber: data.orderNumber, 
          amount: data.amount,
          itemId: data.itemId 
        }
      });

      return true;
    } catch (error) {
      console.error('Error sending seller notification:', error);
      return false;
    }
  }

  // Send SMS notification to seller
  private async sendSellerSMS(data: {
    sellerPhone: string;
    sellerName: string;
    customerName: string;
    itemName: string;
    amount: number;
    orderNumber: string;
  }): Promise<boolean> {
    try {
      const smsData: PurchaseNotificationData = {
        customerName: data.sellerName,
        customerEmail: '',
        customerPhone: data.sellerPhone,
        purchaseType: 'marketplace',
        itemName: `SALE ALERT: ${data.itemName}`,
        amount: data.amount,
        orderNumber: data.orderNumber,
        transactionId: data.orderNumber
      };

      // Custom SMS message for sellers
      const customMessage = `🎉 SALE ALERT!\n\n${data.customerName} purchased your "${data.itemName}" for $${data.amount}\n\nOrder: ${data.orderNumber}\n\nPrepare item for pickup. You'll get driver notification soon!\n\nTrack: marketpace.shop/seller-dashboard`;

      // Use notification service but override message
      await notificationService.sendPurchaseSMS({
        ...smsData,
        itemName: customMessage
      });

      return true;
    } catch (error) {
      console.error('Error sending seller SMS:', error);
      return false;
    }
  }

  // Send notifications to multiple members
  async notifyMembers(data: MemberNotificationData): Promise<number> {
    try {
      let successCount = 0;
      
      // Get member contact information
      const members = await db.select({
        id: users.id,
        email: users.email,
        phone: users.phone,
        username: users.username
      }).from(users).where(inArray(users.id, data.memberIds));

      for (const member of members) {
        try {
          // Send email notification if requested
          if (data.channels.includes('email') && member.email) {
            await this.sendMemberEmail({
              email: member.email,
              name: member.username || 'Member',
              title: data.title,
              message: data.message,
              actionUrl: data.actionUrl,
              type: data.type
            });
          }

          // Send SMS notification if requested
          if (data.channels.includes('sms') && member.phone) {
            await this.sendMemberSMS({
              phone: member.phone,
              name: member.username || 'Member',
              title: data.title,
              message: data.message,
              actionUrl: data.actionUrl
            });
          }

          // Log notification
          await this.logNotification({
            userId: member.id,
            type: data.type,
            title: data.title,
            message: data.message,
            priority: data.priority,
            channels: data.channels,
            createdAt: new Date(),
            status: 'sent',
            data: data.data
          });

          successCount++;
        } catch (error) {
          console.error(`Error sending notification to member ${member.id}:`, error);
        }
      }

      console.log(`Successfully sent notifications to ${successCount}/${members.length} members`);
      return successCount;
    } catch (error) {
      console.error('Error sending member notifications:', error);
      return 0;
    }
  }

  // Send email to member
  private async sendMemberEmail(data: {
    email: string;
    name: string;
    title: string;
    message: string;
    actionUrl?: string;
    type: string;
  }): Promise<void> {
    const emailContent = this.generateMemberEmailHTML(data);
    
    await notificationService.sendPurchaseEmail({
      customerName: data.name,
      customerEmail: data.email,
      customerPhone: '',
      purchaseType: 'marketplace', // Reusing email template
      itemName: data.title,
      amount: 0,
      transactionId: `notif_${Date.now()}`
    });
  }

  // Send SMS to member
  private async sendMemberSMS(data: {
    phone: string;
    name: string;
    title: string;
    message: string;
    actionUrl?: string;
  }): Promise<void> {
    const smsMessage = `MarketPace Alert!\n\n${data.title}\n\n${data.message}\n\n${data.actionUrl ? `View: ${data.actionUrl}` : 'Check your MarketPace app for details'}`;

    await notificationService.sendPurchaseSMS({
      customerName: data.name,
      customerEmail: '',
      customerPhone: data.phone,
      purchaseType: 'marketplace',
      itemName: smsMessage,
      amount: 0,
      transactionId: `sms_${Date.now()}`
    });
  }

  // Generate member email HTML
  private generateMemberEmailHTML(data: {
    email: string;
    name: string;
    title: string;
    message: string;
    actionUrl?: string;
    type: string;
  }): string {
    const typeIcons = {
      favorite_post: '💝',
      interest_match: '🎯',
      community_update: '📢',
      delivery_available: '🚚',
      admin_announcement: '📋'
    };

    const icon = typeIcons[data.type as keyof typeof typeIcons] || '🔔';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>${data.title} - MarketPace</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #0d0221 0%, #1a0b3d 50%, #2d1b69 100%); padding: 30px; text-align: center; }
          .header h1 { color: #00FFFF; margin: 0; font-size: 24px; text-shadow: 0 0 10px rgba(0,255,255,0.5); }
          .content { padding: 30px; }
          .notification-card { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #00FFFF; }
          .cta-button { background: linear-gradient(45deg, #4169E1, #87ceeb); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; display: inline-block; margin: 20px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${icon} ${data.title}</h1>
            <p style="color: #87ceeb; margin: 0;">MarketPace Community Update</p>
          </div>
          
          <div class="content">
            <p>Hi ${data.name},</p>
            
            <div class="notification-card">
              <h3 style="margin-top: 0; color: #333;">${data.title}</h3>
              <p>${data.message}</p>
            </div>

            ${data.actionUrl ? `
              <div style="text-align: center;">
                <a href="${data.actionUrl}" class="cta-button">View Details</a>
              </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <p><strong>MarketPace</strong> - Building stronger communities through local commerce</p>
            <p>Questions? Contact us at MarketPace.contact@gmail.com</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Log notification to database (placeholder - would need notification table)
  private async logNotification(notification: NotificationData): Promise<void> {
    console.log('Notification logged:', {
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      status: notification.status,
      createdAt: notification.createdAt
    });
    
    // In a real implementation, you would save to a notifications table
    // await db.insert(notifications).values(notification);
  }

  // Admin method to send community announcements
  async sendAdminAnnouncement(data: {
    title: string;
    message: string;
    targetAudience: 'all' | 'sellers' | 'buyers' | 'specific';
    memberIds?: string[];
    priority: 'low' | 'medium' | 'high' | 'urgent';
    channels: ('sms' | 'email')[];
    actionUrl?: string;
  }): Promise<number> {
    try {
      let targetMembers: string[] = [];

      if (data.targetAudience === 'all') {
        // Get all active members
        const allMembers = await db.select({ id: users.id }).from(users);
        targetMembers = allMembers.map(m => m.id);
      } else if (data.targetAudience === 'specific' && data.memberIds) {
        targetMembers = data.memberIds;
      } else {
        // For sellers/buyers, you'd filter based on their activity
        // For now, treating as 'all'
        const allMembers = await db.select({ id: users.id }).from(users);
        targetMembers = allMembers.map(m => m.id);
      }

      return await this.notifyMembers({
        memberIds: targetMembers,
        type: 'admin_announcement',
        title: data.title,
        message: data.message,
        actionUrl: data.actionUrl,
        priority: data.priority,
        channels: data.channels,
        data: { 
          adminSent: true, 
          targetAudience: data.targetAudience 
        }
      });
    } catch (error) {
      console.error('Error sending admin announcement:', error);
      return 0;
    }
  }
}

export const notificationCenter = new NotificationCenter();