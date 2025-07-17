import type { Express } from "express";
import { driverNotificationService, DeliveryRoute, DeliveryOrder, DriverProfile } from './driverNotificationService';

export function registerDriverRoutes(app: Express) {
  
  // Endpoint to simulate new delivery order creation
  app.post('/api/driver/new-delivery', async (req, res) => {
    try {
      const { 
        itemName, 
        amount, 
        pickupAddress, 
        deliveryAddress, 
        customerPhone,
        sellerId,
        buyerId,
        requestedTimeSlot 
      } = req.body;

      // Check if requested time slot is still available (not closed)
      const now = new Date();
      const requestedSlotTime = parseTimeSlot(requestedTimeSlot);
      const twentyMinutesBefore = new Date(requestedSlotTime.getTime() - 20 * 60 * 1000);
      
      if (now >= twentyMinutesBefore) {
        // Route is closed, notify customer and suggest next available slot
        const nextAvailableSlot = getNextAvailableSlot(requestedTimeSlot);
        
        await driverNotificationService.notifyCustomerRouteUnavailable(
          customerPhone,
          requestedTimeSlot,
          nextAvailableSlot
        );
        
        return res.status(400).json({ 
          error: 'Delivery window closed',
          message: `The ${requestedTimeSlot} delivery window is no longer available. Routes close 20 minutes before start time.`,
          nextAvailableSlot: nextAvailableSlot
        });
      }

      // Create delivery order
      const order: DeliveryOrder = {
        id: `order_${Date.now()}`,
        routeId: `route_${requestedTimeSlot}_${new Date().toDateString()}`,
        sellerId,
        buyerId,
        itemName,
        amount: parseFloat(amount),
        pickupAddress,
        deliveryAddress,
        status: 'pending',
        orderNumber: `MP${Date.now()}`,
        customerPhone,
        specialInstructions: req.body.specialInstructions
      };

      // Find or create available routes for this time slot
      const availableRoutes = await findAvailableRoutes(requestedTimeSlot);
      
      // Notify all eligible drivers
      await driverNotificationService.notifyNewDeliveryAvailable(order, availableRoutes);
      
      res.json({ 
        success: true, 
        message: 'Delivery order created and drivers notified',
        orderNumber: order.orderNumber,
        routeId: order.routeId
      });
      
    } catch (error) {
      console.error('Error creating delivery order:', error);
      res.status(500).json({ error: 'Failed to create delivery order' });
    }
  });

  // Endpoint for driver to accept a route
  app.post('/api/driver/accept-route', async (req, res) => {
    try {
      const { routeId, driverId } = req.body;
      
      if (!routeId || !driverId) {
        return res.status(400).json({ error: 'Route ID and Driver ID are required' });
      }

      // Assign driver to route
      const route = await assignDriverToRoute(routeId, driverId);
      
      if (!route) {
        return res.status(404).json({ error: 'Route not found or already assigned' });
      }

      // Send confirmation to driver
      const driver = await getDriverProfile(driverId);
      if (driver) {
        await driverNotificationService.sendDriverSMS({
          driverPhone: driver.phone,
          driverName: driver.name,
          message: `✅ ROUTE ACCEPTED!\n\nRoute: ${routeId}\nTime: ${route.timeSlot}\nStops: ${route.orders.length}\n\nRoute details available in driver dashboard.\n\nmarketpace.shop/driver-dashboard`,
          priority: 'high'
        });
      }

      res.json({ 
        success: true, 
        message: 'Route accepted successfully',
        route: route
      });
      
    } catch (error) {
      console.error('Error accepting route:', error);
      res.status(500).json({ error: 'Failed to accept route' });
    }
  });

  // Endpoint for driver to complete a route
  app.post('/api/driver/complete-route', async (req, res) => {
    try {
      const { routeId, driverId, completedOrders } = req.body;
      
      if (!routeId || !driverId) {
        return res.status(400).json({ error: 'Route ID and Driver ID are required' });
      }

      // Mark route as completed
      const route = await completeRoute(routeId, completedOrders);
      const driver = await getDriverProfile(driverId);
      
      if (!route || !driver) {
        return res.status(404).json({ error: 'Route or driver not found' });
      }

      // Send completion notification
      await driverNotificationService.notifyRouteComplete(route, driver);
      
      res.json({ 
        success: true, 
        message: 'Route completed successfully',
        earnings: calculateEarnings(route),
        completedDeliveries: completedOrders?.length || route.orders.length
      });
      
    } catch (error) {
      console.error('Error completing route:', error);
      res.status(500).json({ error: 'Failed to complete route' });
    }
  });

  // Endpoint to get available routes for drivers
  app.get('/api/driver/available-routes', async (req, res) => {
    try {
      const { driverId } = req.query;
      
      // Get routes that are still open and available
      const availableRoutes = await getAvailableRoutesForDriver(driverId as string);
      
      res.json({ 
        success: true, 
        routes: availableRoutes,
        message: `Found ${availableRoutes.length} available routes`
      });
      
    } catch (error) {
      console.error('Error getting available routes:', error);
      res.status(500).json({ error: 'Failed to get available routes' });
    }
  });

  // Endpoint to check delivery window availability
  app.get('/api/driver/check-delivery-window', async (req, res) => {
    try {
      const { timeSlot, date } = req.query;
      
      const now = new Date();
      const requestedSlotTime = parseTimeSlot(timeSlot as string, date as string);
      const twentyMinutesBefore = new Date(requestedSlotTime.getTime() - 20 * 60 * 1000);
      
      const isAvailable = now < twentyMinutesBefore;
      const nextAvailable = isAvailable ? null : getNextAvailableSlot(timeSlot as string);
      
      res.json({ 
        available: isAvailable,
        timeSlot: timeSlot,
        closesAt: twentyMinutesBefore.toISOString(),
        minutesUntilClosed: Math.max(0, Math.floor((twentyMinutesBefore.getTime() - now.getTime()) / 60000)),
        nextAvailableSlot: nextAvailable
      });
      
    } catch (error) {
      console.error('Error checking delivery window:', error);
      res.status(500).json({ error: 'Failed to check delivery window' });
    }
  });

  // Background job endpoint to close routes (called by cron job)
  app.post('/api/driver/close-routes-job', async (req, res) => {
    try {
      await driverNotificationService.closeRoutesBeforeStartTime();
      
      res.json({ 
        success: true, 
        message: 'Route closure job completed successfully'
      });
      
    } catch (error) {
      console.error('Error in route closure job:', error);
      res.status(500).json({ error: 'Route closure job failed' });
    }
  });
}

// Helper functions (mock implementations)
function parseTimeSlot(timeSlot: string, date?: string): Date {
  const today = date ? new Date(date) : new Date();
  const [startTime] = timeSlot.split('-');
  
  const timeMap: { [key: string]: { hour: number; minute: number } } = {
    '9am': { hour: 9, minute: 0 },
    '12pm': { hour: 12, minute: 0 },
    '3pm': { hour: 15, minute: 0 },
    '6pm': { hour: 18, minute: 0 }
  };
  
  const time = timeMap[startTime] || { hour: 9, minute: 0 };
  const slotDate = new Date(today);
  slotDate.setHours(time.hour, time.minute, 0, 0);
  
  return slotDate;
}

function getNextAvailableSlot(currentSlot: string): string {
  const slots = ['9am-12pm', '12pm-3pm', '3pm-6pm', '6pm-9pm'];
  const currentIndex = slots.indexOf(currentSlot);
  
  if (currentIndex === -1 || currentIndex === slots.length - 1) {
    return '9am-12pm (tomorrow)';
  }
  
  return slots[currentIndex + 1];
}

async function findAvailableRoutes(timeSlot: string): Promise<DeliveryRoute[]> {
  // Mock implementation - would query database for routes with capacity
  return [
    {
      id: `route_${timeSlot}_${Date.now()}`,
      driverId: '',
      timeSlot,
      date: new Date().toDateString(),
      orders: [],
      status: 'open',
      maxOrders: 6,
      closesAt: new Date(Date.now() + 20 * 60 * 1000),
      startsAt: parseTimeSlot(timeSlot),
      endsAt: new Date(parseTimeSlot(timeSlot).getTime() + 3 * 60 * 60 * 1000)
    }
  ];
}

async function assignDriverToRoute(routeId: string, driverId: string): Promise<DeliveryRoute | null> {
  // Mock implementation - would update database
  return {
    id: routeId,
    driverId,
    timeSlot: '12pm-3pm',
    date: new Date().toDateString(),
    orders: [],
    status: 'assigned',
    maxOrders: 6,
    closesAt: new Date(),
    startsAt: new Date(),
    endsAt: new Date()
  };
}

async function completeRoute(routeId: string, completedOrders?: any[]): Promise<DeliveryRoute | null> {
  // Mock implementation
  return {
    id: routeId,
    driverId: 'driver1',
    timeSlot: '12pm-3pm',
    date: new Date().toDateString(),
    orders: [
      {
        id: 'order1',
        routeId,
        sellerId: 'seller1',
        buyerId: 'buyer1',
        itemName: 'Test Item',
        amount: 25.00,
        pickupAddress: '123 Main St',
        deliveryAddress: '456 Oak Ave',
        status: 'delivered',
        orderNumber: 'MP123456'
      }
    ],
    status: 'completed',
    maxOrders: 6,
    closesAt: new Date(),
    startsAt: new Date(),
    endsAt: new Date()
  };
}

async function getDriverProfile(driverId: string): Promise<DriverProfile | null> {
  // Mock implementation
  return {
    id: driverId,
    userId: 'user1',
    name: 'Mike Johnson',
    phone: '+1234567890',
    email: 'mike@example.com',
    isActive: true,
    preferredSlots: ['9am-12pm', '12pm-3pm'],
    maxRoutesPerDay: 2,
    rating: 4.8,
    completedDeliveries: 156
  };
}

async function getAvailableRoutesForDriver(driverId: string): Promise<DeliveryRoute[]> {
  // Mock implementation
  return [
    {
      id: 'route_3pm-6pm_today',
      driverId: '',
      timeSlot: '3pm-6pm',
      date: new Date().toDateString(),
      orders: [
        {
          id: 'order1',
          routeId: 'route_3pm-6pm_today',
          sellerId: 'seller1',
          buyerId: 'buyer1',
          itemName: 'Electronics Bundle',
          amount: 85.00,
          pickupAddress: '789 Tech St',
          deliveryAddress: '321 Home Ave',
          status: 'pending',
          orderNumber: 'MP789012'
        }
      ],
      status: 'open',
      maxOrders: 6,
      closesAt: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes from now
      startsAt: new Date(Date.now() + 65 * 60 * 1000), // 65 minutes from now
      endsAt: new Date(Date.now() + 245 * 60 * 1000)   // 4 hours from now
    }
  ];
}

function calculateEarnings(route: DeliveryRoute): number {
  let earnings = 0;
  route.orders.forEach(order => {
    if (order.status === 'delivered') {
      earnings += 4; // $4 pickup
      earnings += 2; // $2 delivery
      earnings += 3; // $3 estimated mileage
    }
  });
  return earnings;
}