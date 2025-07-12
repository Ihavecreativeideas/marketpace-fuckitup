import express from 'express';
import { db } from '../database';
import { users, deliveryRoutes, deliveries, driverNotes, customerMessages } from '../../shared/schema';
import { eq, and, between, sql, desc } from 'drizzle-orm';

const router = express.Router();

// Get driver's current location
router.get('/location', async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const driver = await db
      .select({ 
        address: users.address,
        lat: users.lat,
        lng: users.lng
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!driver.length) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    res.json({
      location: {
        address: driver[0].address,
        lat: driver[0].lat,
        lng: driver[0].lng
      }
    });
  } catch (error) {
    console.error('Error fetching driver location:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get nearby routes ordered by distance
router.get('/routes/nearby', async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    const { lat, lng } = req.query;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Driver location required' });
    }

    const now = new Date();
    const twentyMinutesFromNow = new Date(now.getTime() + 20 * 60 * 1000);

    // Get routes that haven't been accepted and are still accepting orders
    const nearbyRoutes = await db
      .select({
        id: deliveryRoutes.id,
        timeBlock: deliveryRoutes.timeBlock,
        startTime: deliveryRoutes.startTime,
        endTime: deliveryRoutes.endTime,
        pickups: deliveryRoutes.pickups,
        dropoffs: deliveryRoutes.dropoffs,
        mileage: deliveryRoutes.mileage,
        originalMileage: deliveryRoutes.originalMileage,
        earnings: deliveryRoutes.earnings,
        status: deliveryRoutes.status,
        pickupLat: deliveryRoutes.pickupLat,
        pickupLng: deliveryRoutes.pickupLng,
        // Calculate distance from driver location
        distance: sql`ST_Distance(
          ST_Point(${parseFloat(lng)}, ${parseFloat(lat)})::geography,
          ST_Point(${deliveryRoutes.pickupLng}, ${deliveryRoutes.pickupLat})::geography
        ) / 1609.344` // Convert meters to miles
      })
      .from(deliveryRoutes)
      .where(
        and(
          eq(deliveryRoutes.status, 'available'),
          sql`${deliveryRoutes.startTime} > ${twentyMinutesFromNow}`
        )
      )
      .orderBy(sql`distance ASC`)
      .limit(10);

    // Get customer information for each route
    const routesWithCustomers = await Promise.all(
      nearbyRoutes.map(async (route) => {
        const customers = await db
          .select({
            id: users.id,
            name: sql`${users.firstName} || ' ' || ${users.lastName}`,
            email: users.email
          })
          .from(deliveries)
          .innerJoin(users, eq(deliveries.customerId, users.id))
          .where(eq(deliveries.routeId, route.id));

        return {
          ...route,
          distanceFromDriver: parseFloat(route.distance),
          customers: customers
        };
      })
    );

    res.json({
      routes: routesWithCustomers
    });
  } catch (error) {
    console.error('Error fetching nearby routes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available routes for driver
router.get('/routes/available', async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const now = new Date();
    const twentyMinutesFromNow = new Date(now.getTime() + 20 * 60 * 1000);

    // Get available routes
    const availableRoutes = await db
      .select()
      .from(deliveryRoutes)
      .where(
        and(
          eq(deliveryRoutes.status, 'available'),
          sql`${deliveryRoutes.startTime} > ${twentyMinutesFromNow}`
        )
      )
      .orderBy(deliveryRoutes.startTime);

    // Get driver's current route
    const currentRoute = await db
      .select()
      .from(deliveryRoutes)
      .where(
        and(
          eq(deliveryRoutes.driverId, userId),
          eq(deliveryRoutes.status, 'in_progress')
        )
      )
      .limit(1);

    // Get driver's accepted routes
    const acceptedRoutes = await db
      .select()
      .from(deliveryRoutes)
      .where(
        and(
          eq(deliveryRoutes.driverId, userId),
          eq(deliveryRoutes.status, 'accepted')
        )
      )
      .orderBy(deliveryRoutes.startTime);

    res.json({
      routes: availableRoutes,
      currentRoute: currentRoute[0] || null,
      acceptedRoutes: acceptedRoutes
    });
  } catch (error) {
    console.error('Error fetching available routes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Accept a route
router.post('/routes/:routeId/accept', async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    const { routeId } = req.params;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const now = new Date();
    const twentyMinutesFromNow = new Date(now.getTime() + 20 * 60 * 1000);

    // Check if route is still available
    const route = await db
      .select()
      .from(deliveryRoutes)
      .where(
        and(
          eq(deliveryRoutes.id, parseInt(routeId)),
          eq(deliveryRoutes.status, 'available'),
          sql`${deliveryRoutes.startTime} > ${twentyMinutesFromNow}`
        )
      )
      .limit(1);

    if (!route.length) {
      return res.status(400).json({ error: 'Route is no longer available' });
    }

    // Get driver's existing routes to check for conflicts
    const existingRoutes = await db
      .select()
      .from(deliveryRoutes)
      .where(
        and(
          eq(deliveryRoutes.driverId, userId),
          sql`${deliveryRoutes.status} IN ('accepted', 'in_progress')`
        )
      );

    // Check for time conflicts and 2-hour limit
    const routeToAccept = route[0];
    const newStart = new Date(routeToAccept.startTime);
    const newEnd = new Date(routeToAccept.endTime);

    // Check overlaps
    const hasOverlap = existingRoutes.some(existing => {
      const existingStart = new Date(existing.startTime);
      const existingEnd = new Date(existing.endTime);
      return (newStart < existingEnd && newEnd > existingStart);
    });

    if (hasOverlap) {
      return res.status(400).json({ error: 'Route conflicts with existing route' });
    }

    // Check 2-hour limit for same time block
    const sameTimeBlockRoutes = existingRoutes.filter(existing => 
      existing.timeBlock === routeToAccept.timeBlock
    );
    
    const totalTime = sameTimeBlockRoutes.reduce((total, existing) => {
      // Calculate route time: 5 min buffer + 2 min per mile + 3 min per stop
      const bufferTime = (existing.pickups + existing.dropoffs) * 5;
      const drivingTime = existing.mileage * 2;
      const stopTime = (existing.pickups + existing.dropoffs) * 3;
      return total + bufferTime + drivingTime + stopTime;
    }, 0);

    const newRouteTime = (routeToAccept.pickups + routeToAccept.dropoffs) * 5 + 
                        routeToAccept.mileage * 2 + 
                        (routeToAccept.pickups + routeToAccept.dropoffs) * 3;

    if (totalTime + newRouteTime > 120) { // 2 hours
      return res.status(400).json({ error: 'Total driving time would exceed 2 hours' });
    }

    // Accept the route
    await db
      .update(deliveryRoutes)
      .set({
        driverId: userId,
        status: 'accepted',
        acceptedAt: now
      })
      .where(eq(deliveryRoutes.id, parseInt(routeId)));

    res.json({
      message: 'Route accepted successfully',
      routeId: routeId
    });
  } catch (error) {
    console.error('Error accepting route:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Send message to customer
router.post('/messages/customer', async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    const { customerId, message } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!customerId || !message) {
      return res.status(400).json({ error: 'Customer ID and message are required' });
    }

    // Insert message into customer messages table
    await db.insert(customerMessages).values({
      driverId: userId,
      customerId: customerId,
      message: message,
      messageType: 'route_offer',
      sentAt: new Date()
    });

    res.json({
      message: 'Message sent successfully'
    });
  } catch (error) {
    console.error('Error sending customer message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark delivery as complete
router.post('/deliveries/:deliveryId/complete', async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    const { deliveryId } = req.params;
    const { isLate = false, completedAt } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const completionTime = new Date(completedAt || Date.now());

    // Update delivery status
    await db
      .update(deliveries)
      .set({
        status: 'completed',
        completedAt: completionTime,
        isLate: isLate
      })
      .where(
        and(
          eq(deliveries.id, parseInt(deliveryId)),
          eq(deliveries.driverId, userId)
        )
      );

    // If delivery was late, add note to driver profile
    if (isLate) {
      await db.insert(driverNotes).values({
        driverId: userId,
        noteType: 'late_delivery',
        note: `Late delivery for delivery ID ${deliveryId}`,
        createdAt: completionTime,
        createdBy: 'system'
      });
    }

    res.json({
      message: 'Delivery marked as complete',
      isLate: isLate
    });
  } catch (error) {
    console.error('Error marking delivery complete:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get driver stats
router.get('/stats', async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 7);

    // Get today's earnings
    const todayEarnings = await db
      .select({
        total: sql`COALESCE(SUM(${deliveries.driverEarnings}), 0)`
      })
      .from(deliveries)
      .where(
        and(
          eq(deliveries.driverId, userId),
          eq(deliveries.status, 'completed'),
          sql`${deliveries.completedAt} >= ${today}`
        )
      );

    // Get weekly earnings
    const weeklyEarnings = await db
      .select({
        total: sql`COALESCE(SUM(${deliveries.driverEarnings}), 0)`
      })
      .from(deliveries)
      .where(
        and(
          eq(deliveries.driverId, userId),
          eq(deliveries.status, 'completed'),
          sql`${deliveries.completedAt} >= ${weekStart}`
        )
      );

    // Get completed deliveries count
    const completedCount = await db
      .select({
        count: sql`COUNT(*)`
      })
      .from(deliveries)
      .where(
        and(
          eq(deliveries.driverId, userId),
          eq(deliveries.status, 'completed')
        )
      );

    // Get driver status
    const driverInfo = await db
      .select({
        driverStatus: users.driverStatus,
        isOnline: users.isOnline
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    res.json({
      todayEarnings: parseFloat(todayEarnings[0]?.total || 0),
      weeklyEarnings: parseFloat(weeklyEarnings[0]?.total || 0),
      completedDeliveries: parseInt(completedCount[0]?.count || 0),
      status: driverInfo[0]?.isOnline ? 'online' : 'offline'
    });
  } catch (error) {
    console.error('Error fetching driver stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update driver status (online/offline)
router.post('/status', async (req, res) => {
  try {
    const userId = req.session?.user?.id;
    const { status } = req.body;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!['online', 'offline'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    await db
      .update(users)
      .set({
        isOnline: status === 'online',
        lastOnlineAt: new Date()
      })
      .where(eq(users.id, userId));

    res.json({
      message: 'Status updated successfully',
      status: status
    });
  } catch (error) {
    console.error('Error updating driver status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;