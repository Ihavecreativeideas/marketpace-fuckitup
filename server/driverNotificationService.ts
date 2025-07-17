import { notificationService } from './notificationService';
import { notificationCenter } from './notificationCenter';
import { db } from './db';
import { users } from '../shared/schema';
import { eq, and, inArray } from 'drizzle-orm';

export interface DeliveryRoute {
  id: string;
  driverId: string;
  timeSlot: string; // "9am-12pm", "12pm-3pm", "3pm-6pm", "6pm-9pm"
  date: string;
  orders: DeliveryOrder[];
  status: 'open' | 'assigned' | 'in_progress' | 'completed' | 'closed';
  maxOrders: number;
  closesAt: Date; // 20 minutes before start time
  startsAt: Date;
  endsAt: Date;
}

export interface DeliveryOrder {
  id: string;
  routeId: string;
  sellerId: string;
  buyerId: string;
  itemName: string;
  amount: number;
  pickupAddress: string;
  deliveryAddress: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled';
  orderNumber: string;
  customerPhone?: string;
  sellerPhone?: string;
  specialInstructions?: string;
}

export interface DriverProfile {
  id: string;
  userId: string;
  name: string;
  phone: string;
  email: string;
  isActive: boolean;
  currentRoute?: string;
  preferredSlots: string[];
  maxRoutesPerDay: number;
  rating: number;
  completedDeliveries: number;
}

export class DriverNotificationService {
  
  // Send real-time notification to drivers when new delivery becomes available
  async notifyNewDeliveryAvailable(order: DeliveryOrder, availableRoutes: DeliveryRoute[]): Promise<void> {
    try {
      console.log(`Notifying drivers of new delivery: ${order.itemName}`);
      
      // Get all active drivers who can take routes in the available time slots
      const eligibleDrivers = await this.getEligibleDrivers(availableRoutes);
      
      for (const driver of eligibleDrivers) {
        // Send SMS notification to driver
        await this.sendDriverSMS({
          driverPhone: driver.phone,
          driverName: driver.name,
          message: `🚚 NEW DELIVERY AVAILABLE!\n\nOrder: ${order.itemName}\nAmount: $${order.amount}\nPickup: ${order.pickupAddress}\nDelivery: ${order.deliveryAddress}\n\nRoutes closing soon! Accept now in driver dashboard.\n\nmarketpace.shop/driver-dashboard`,
          priority: 'high'
        });

        // Send email notification
        await this.sendDriverEmail({
          driverEmail: driver.email,
          driverName: driver.name,
          subject: '🚚 New Delivery Route Available',
          order: order,
          availableSlots: availableRoutes.map(r => r.timeSlot),
          closingTimes: availableRoutes.map(r => r.closesAt)
        });
      }
      
      console.log(`Notified ${eligibleDrivers.length} eligible drivers of new delivery`);
    } catch (error) {
      console.error('Error notifying drivers of new delivery:', error);
    }
  }

  // Send notification when route is complete
  async notifyRouteComplete(route: DeliveryRoute, driver: DriverProfile): Promise<void> {
    try {
      console.log(`Notifying driver ${driver.name} of completed route ${route.id}`);
      
      const totalEarnings = this.calculateRouteEarnings(route);
      const completedOrders = route.orders.filter(o => o.status === 'delivered').length;
      
      // Send completion SMS
      await this.sendDriverSMS({
        driverPhone: driver.phone,
        driverName: driver.name,
        message: `🎉 ROUTE COMPLETE!\n\n✅ ${completedOrders} deliveries completed\n💰 Earnings: $${totalEarnings.toFixed(2)}\n⭐ Great job!\n\nPayment processing now. Check your account in 5-10 minutes.\n\nReady for your next route?`,
        priority: 'medium'
      });

      // Send completion email with detailed breakdown
      await this.sendRouteCompletionEmail(driver, route, totalEarnings);
      
      // Update driver stats and notify them if they're eligible for bonuses
      await this.updateDriverStats(driver, route);
      
    } catch (error) {
      console.error('Error notifying driver of route completion:', error);
    }
  }

  // Automatically close routes 20 minutes before start time
  async closeRoutesBeforeStartTime(): Promise<void> {
    try {
      const now = new Date();
      const twentyMinutesFromNow = new Date(now.getTime() + 20 * 60 * 1000);
      
      // Find routes that should be closed (start time is within 20 minutes)
      const routesToClose = await this.getRoutesClosingSoon(twentyMinutesFromNow);
      
      for (const route of routesToClose) {
        await this.closeRoute(route);
        
        // Notify assigned driver that route is starting soon
        if (route.driverId) {
          const driver = await this.getDriverById(route.driverId);
          if (driver) {
            await this.sendDriverSMS({
              driverPhone: driver.phone,
              driverName: driver.name,
              message: `🕐 ROUTE STARTING SOON!\n\nRoute ${route.id} starts at ${this.formatTime(route.startsAt)}\n📍 ${route.orders.length} stops\n\nRoute is now CLOSED to new orders. Get ready to start!\n\nmarketpace.shop/driver-dashboard`,
              priority: 'urgent'
            });
          }
        }
      }
      
      console.log(`Closed ${routesToClose.length} routes that were starting within 20 minutes`);
    } catch (error) {
      console.error('Error closing routes before start time:', error);
    }
  }

  // Send notification when customer tries to book closed route
  async notifyCustomerRouteUnavailable(customerPhone: string, requestedSlot: string, nextAvailableSlot: string): Promise<void> {
    try {
      if (!customerPhone) return;
      
      await notificationService.sendPurchaseSMS({
        customerName: 'MarketPace Customer',
        customerEmail: '',
        customerPhone: customerPhone,
        purchaseType: 'delivery_notification',
        itemName: `⏰ DELIVERY WINDOW CLOSED\n\nThe ${requestedSlot} delivery window is no longer available (closes 20 min before start).\n\nNext available: ${nextAvailableSlot}\n\nPlease select a different time slot to complete your order.`,
        amount: 0,
        transactionId: `route_closed_${Date.now()}`
      });
    } catch (error) {
      console.error('Error notifying customer of route unavailability:', error);
    }
  }

  // Send SMS to driver
  private async sendDriverSMS(data: {
    driverPhone: string;
    driverName: string;
    message: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
  }): Promise<void> {
    try {
      await notificationService.sendPurchaseSMS({
        customerName: data.driverName,
        customerEmail: '',
        customerPhone: data.driverPhone,
        purchaseType: 'driver_notification',
        itemName: data.message,
        amount: 0,
        transactionId: `driver_${Date.now()}`
      });
    } catch (error) {
      console.error('Error sending driver SMS:', error);
    }
  }

  // Send email to driver
  private async sendDriverEmail(data: {
    driverEmail: string;
    driverName: string;
    subject: string;
    order: DeliveryOrder;
    availableSlots: string[];
    closingTimes: Date[];
  }): Promise<void> {
    try {
      // Use notification service with custom email content
      await notificationService.sendPurchaseEmail({
        customerName: data.driverName,
        customerEmail: data.driverEmail,
        customerPhone: '',
        purchaseType: 'driver_notification',
        itemName: data.subject,
        amount: 0,
        transactionId: `driver_email_${Date.now()}`
      });
    } catch (error) {
      console.error('Error sending driver email:', error);
    }
  }

  // Send route completion email
  private async sendRouteCompletionEmail(driver: DriverProfile, route: DeliveryRoute, earnings: number): Promise<void> {
    const completedOrders = route.orders.filter(o => o.status === 'delivered').length;
    const emailContent = this.generateCompletionEmailHTML(driver, route, earnings, completedOrders);
    
    await this.sendDriverEmail({
      driverEmail: driver.email,
      driverName: driver.name,
      subject: `🎉 Route Complete - $${earnings.toFixed(2)} Earned`,
      order: route.orders[0], // Use first order as template
      availableSlots: [],
      closingTimes: []
    });
  }

  // Generate completion email HTML
  private generateCompletionEmailHTML(driver: DriverProfile, route: DeliveryRoute, earnings: number, completedOrders: number): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Route Complete - MarketPace Driver</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #0d0221 0%, #1a0b3d 50%, #2d1b69 100%); padding: 30px; text-align: center; color: white; }
          .content { padding: 30px; }
          .earnings-box { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #28a745; }
          .earnings-amount { font-size: 36px; font-weight: bold; color: #28a745; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Route Complete!</h1>
            <p style="margin: 0; color: #87ceeb;">Great job, ${driver.name}!</p>
          </div>
          
          <div class="content">
            <div class="earnings-box">
              <h3 style="margin-top: 0; color: #28a745;">Total Earnings</h3>
              <div class="earnings-amount">$${earnings.toFixed(2)}</div>
              <p style="margin-bottom: 0;">${completedOrders} deliveries completed</p>
            </div>
            
            <p>Your route ${route.id} for ${route.timeSlot} has been completed successfully!</p>
            <p>Payment will be processed and available in your account within 5-10 minutes.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://marketpace.shop/driver-dashboard" style="background: linear-gradient(45deg, #4169E1, #87ceeb); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px;">
                View Next Available Routes
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Helper methods (would be implemented with actual database queries)
  private async getEligibleDrivers(routes: DeliveryRoute[]): Promise<DriverProfile[]> {
    // Mock implementation - in real app, query drivers table
    return [
      {
        id: 'driver1',
        userId: 'user1',
        name: 'Mike Johnson',
        phone: '+1234567890',
        email: 'mike@example.com',
        isActive: true,
        preferredSlots: ['9am-12pm', '12pm-3pm'],
        maxRoutesPerDay: 2,
        rating: 4.8,
        completedDeliveries: 156
      }
    ];
  }

  private async getRoutesClosingSoon(cutoffTime: Date): Promise<DeliveryRoute[]> {
    // Mock implementation - query routes that start within cutoff time
    return [];
  }

  private async getDriverById(driverId: string): Promise<DriverProfile | null> {
    // Mock implementation
    return {
      id: driverId,
      userId: 'user1',
      name: 'Mike Johnson',
      phone: '+1234567890',
      email: 'mike@example.com',
      isActive: true,
      preferredSlots: ['9am-12pm'],
      maxRoutesPerDay: 2,
      rating: 4.8,
      completedDeliveries: 156
    };
  }

  private async closeRoute(route: DeliveryRoute): Promise<void> {
    console.log(`Closing route ${route.id} - no more orders can be added`);
    // Update route status to 'closed' in database
  }

  private calculateRouteEarnings(route: DeliveryRoute): number {
    let earnings = 0;
    route.orders.forEach(order => {
      if (order.status === 'delivered') {
        earnings += 4; // $4 pickup fee
        earnings += 2; // $2 delivery fee
        // Add mileage calculation: distance * $0.50
        earnings += 3; // Mock 6 miles * $0.50
      }
    });
    return earnings;
  }

  private async updateDriverStats(driver: DriverProfile, route: DeliveryRoute): Promise<void> {
    // Update driver completion count, rating, etc.
    console.log(`Updated stats for driver ${driver.name}`);
  }

  private formatTime(date: Date): string {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }
}

export const driverNotificationService = new DriverNotificationService();