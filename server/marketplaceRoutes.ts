import type { Express } from "express";
import { notificationService, PurchaseNotificationData } from "./notificationService";

export function registerMarketplaceRoutes(app: Express) {
  
  // API endpoint for marketplace purchases with notifications
  app.post('/api/marketplace/purchase', async (req, res) => {
    try {
      const { 
        customerName, 
        customerEmail, 
        customerPhone, 
        itemName, 
        amount, 
        purchaseType = 'marketplace',
        sellerEmail,
        deliveryAddress 
      } = req.body;
      
      if (!customerEmail && !customerPhone) {
        return res.status(400).json({ 
          error: 'Customer email or phone number required for notifications' 
        });
      }

      // Generate order number
      const orderNumber = `MP-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      // Send customer notifications
      const customerNotificationData: PurchaseNotificationData = {
        customerName: customerName || 'MarketPace Customer',
        customerEmail: customerEmail || '',
        customerPhone: customerPhone || '',
        purchaseType: purchaseType as any,
        itemName: itemName || 'MarketPace Item',
        amount: parseFloat(amount),
        orderNumber: orderNumber,
        transactionId: orderNumber,
      };
      
      await notificationService.sendPurchaseNotifications(customerNotificationData);
      
      // Send seller notification if seller email provided
      if (sellerEmail) {
        await notificationService.sendSellerNotification({
          sellerEmail,
          customerName: customerName || 'A customer',
          itemName: itemName || 'Your item',
          amount: parseFloat(amount),
          orderNumber,
          deliveryAddress: deliveryAddress || 'Address provided'
        });
      }

      res.json({ 
        success: true, 
        orderNumber,
        message: 'Purchase confirmed and notifications sent'
      });
      
    } catch (error) {
      console.error('Error processing marketplace purchase:', error);
      res.status(500).json({ error: 'Failed to process purchase' });
    }
  });

  // API endpoint for service bookings with notifications
  app.post('/api/services/book', async (req, res) => {
    try {
      const { 
        customerName, 
        customerEmail, 
        customerPhone, 
        serviceName, 
        amount,
        serviceDate,
        providerEmail 
      } = req.body;
      
      const bookingNumber = `SRV-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      // Send customer notifications
      const notificationData: PurchaseNotificationData = {
        customerName: customerName || 'MarketPace Customer',
        customerEmail: customerEmail || '',
        customerPhone: customerPhone || '',
        purchaseType: 'service',
        itemName: serviceName || 'MarketPace Service',
        amount: parseFloat(amount),
        orderNumber: bookingNumber,
        transactionId: bookingNumber,
      };
      
      await notificationService.sendPurchaseNotifications(notificationData);

      res.json({ 
        success: true, 
        bookingNumber,
        message: 'Service booked and notifications sent'
      });
      
    } catch (error) {
      console.error('Error processing service booking:', error);
      res.status(500).json({ error: 'Failed to process booking' });
    }
  });

  // API endpoint for rental bookings with notifications
  app.post('/api/rentals/book', async (req, res) => {
    try {
      const { 
        customerName, 
        customerEmail, 
        customerPhone, 
        itemName, 
        amount,
        rentalDates,
        ownerEmail 
      } = req.body;
      
      const rentalNumber = `RNT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      // Send customer notifications
      const notificationData: PurchaseNotificationData = {
        customerName: customerName || 'MarketPace Customer',
        customerEmail: customerEmail || '',
        customerPhone: customerPhone || '',
        purchaseType: 'rental',
        itemName: itemName || 'MarketPace Rental',
        amount: parseFloat(amount),
        orderNumber: rentalNumber,
        transactionId: rentalNumber,
      };
      
      await notificationService.sendPurchaseNotifications(notificationData);

      res.json({ 
        success: true, 
        rentalNumber,
        message: 'Rental booked and notifications sent'
      });
      
    } catch (error) {
      console.error('Error processing rental booking:', error);
      res.status(500).json({ error: 'Failed to process rental' });
    }
  });
}