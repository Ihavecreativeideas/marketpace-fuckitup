import express from 'express';
import { Request, Response } from 'express';
import { db } from './db';
import { eventCheckIns, events, users } from '../shared/schema';
import { eq, desc, and, count, sql } from 'drizzle-orm';
import QRCode from 'qrcode';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/checkins/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

// Get social feed with check-ins
router.get('/feed', async (req: Request, res: Response) => {
  try {
    const feedData = await db
      .select({
        checkInId: eventCheckIns.id,
        message: eventCheckIns.message,
        media: eventCheckIns.media,
        location: eventCheckIns.location,
        verifiedLocation: eventCheckIns.verifiedLocation,
        createdAt: eventCheckIns.createdAt,
        likes: eventCheckIns.likes,
        userName: users.firstName,
        userLastName: users.lastName,
        userEmail: users.email,
        eventName: events.title,
        eventLocation: events.location,
        eventId: events.id
      })
      .from(eventCheckIns)
      .leftJoin(users, eq(eventCheckIns.userId, users.id))
      .leftJoin(events, eq(eventCheckIns.eventId, events.id))
      .orderBy(desc(eventCheckIns.createdAt))
      .limit(20);

    res.json({ success: true, feed: feedData });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch feed' });
  }
});

// Create new check-in
router.post('/checkins', upload.array('media', 5), async (req, res) => {
  try {
    const { eventId, message, latitude, longitude, verifyLocation } = req.body;
    const userId = req.user?.claims?.sub; // From authentication middleware

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    if (!eventId) {
      return res.status(400).json({ success: false, message: 'Event ID is required' });
    }

    // Verify event exists
    const event = await db.select().from(events).where(eq(events.id, eventId)).limit(1);
    if (!event.length) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Process uploaded media files
    const mediaFiles = req.files as Express.Multer.File[];
    const mediaPaths = mediaFiles ? mediaFiles.map(file => file.path) : [];

    // Verify location if requested
    let locationData = null;
    let isVerified = false;
    
    if (verifyLocation === 'true' && latitude && longitude) {
      locationData = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        timestamp: new Date()
      };
      
      // Here you could add logic to verify the user is actually at the event location
      // For now, we'll assume if they provide coordinates, it's verified
      isVerified = true;
    }

    // Create check-in
    const [newCheckIn] = await db
      .insert(checkIns)
      .values({
        userId,
        eventId,
        message: message || '',
        media: mediaPaths,
        location: locationData,
        verifiedLocation: isVerified,
        likes: 0,
        createdAt: new Date()
      })
      .returning();

    // Update event attendance
    await db
      .insert(eventAttendees)
      .values({
        eventId,
        userId,
        checkedIn: true,
        checkInTime: new Date()
      })
      .onConflictDoUpdate({
        target: [eventAttendees.eventId, eventAttendees.userId],
        set: {
          checkedIn: true,
          checkInTime: new Date()
        }
      });

    res.json({ success: true, checkIn: newCheckIn });
  } catch (error) {
    console.error('Error creating check-in:', error);
    res.status(500).json({ success: false, message: 'Failed to create check-in' });
  }
});

// Like/unlike a check-in
router.post('/checkins/:id/like', async (req, res) => {
  try {
    const checkInId = req.params.id;
    const userId = req.user?.claims?.sub;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Toggle like (simple increment/decrement for now - in production you'd track individual likes)
    const [checkIn] = await db
      .select({ likes: checkIns.likes })
      .from(checkIns)
      .where(eq(checkIns.id, checkInId))
      .limit(1);

    if (!checkIn) {
      return res.status(404).json({ success: false, message: 'Check-in not found' });
    }

    // For simplicity, just increment likes (in production, track user likes separately)
    const [updatedCheckIn] = await db
      .update(checkIns)
      .set({ likes: checkIn.likes + 1 })
      .where(eq(checkIns.id, checkInId))
      .returning();

    res.json({ success: true, likes: updatedCheckIn.likes });
  } catch (error) {
    console.error('Error updating likes:', error);
    res.status(500).json({ success: false, message: 'Failed to update likes' });
  }
});

// Get trending events
router.get('/trending-events', async (req, res) => {
  try {
    const trendingEvents = await db
      .select({
        eventId: events.id,
        eventName: events.title,
        eventLocation: events.location,
        attendeeCount: count(eventAttendees.userId),
        checkInCount: sql<number>`COUNT(CASE WHEN ${eventAttendees.checkedIn} = true THEN 1 END)`
      })
      .from(events)
      .leftJoin(eventAttendees, eq(events.id, eventAttendees.eventId))
      .where(sql`${events.eventDate} >= NOW() - INTERVAL '7 days'`)
      .groupBy(events.id, events.title, events.location)
      .orderBy(desc(sql`COUNT(${eventAttendees.userId})`))
      .limit(5);

    res.json({ success: true, events: trendingEvents });
  } catch (error) {
    console.error('Error fetching trending events:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trending events' });
  }
});

// Get user stats
router.get('/user-stats', async (req, res) => {
  try {
    const userId = req.user?.claims?.sub;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Get user check-in count
    const [checkInStats] = await db
      .select({ count: count() })
      .from(checkIns)
      .where(eq(checkIns.userId, userId));

    // Get unique events attended
    const [eventStats] = await db
      .select({ count: count() })
      .from(eventAttendees)
      .where(and(
        eq(eventAttendees.userId, userId),
        eq(eventAttendees.checkedIn, true)
      ));

    res.json({ 
      success: true, 
      stats: {
        checkIns: checkInStats.count,
        eventsAttended: eventStats.count
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user stats' });
  }
});

// Generate QR code for event check-in
router.get('/events/:id/qr-code', async (req, res) => {
  try {
    const eventId = req.params.id;
    
    // Verify event exists
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Create QR code data with event info and location
    const qrData = {
      type: 'event_checkin',
      eventId: event.id,
      eventName: event.title,
      location: event.location,
      coordinates: event.coordinates,
      timestamp: new Date().toISOString(),
      verificationUrl: `${req.protocol}://${req.get('host')}/mypace/verify-checkin/${eventId}`
    };

    // Generate QR code
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      width: 256
    });

    res.json({ 
      success: true, 
      qrCode: qrCodeDataURL,
      eventInfo: {
        id: event.id,
        name: event.title,
        location: event.location,
        date: event.eventDate
      }
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ success: false, message: 'Failed to generate QR code' });
  }
});

// Verify check-in via QR code
router.post('/verify-checkin/:eventId', async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const { latitude, longitude, timestamp } = req.body;
    const userId = req.user?.claims?.sub;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    // Verify event exists and get location
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    // Verify user is at event location (simple distance check)
    if (latitude && longitude && event.coordinates) {
      const eventCoords = event.coordinates as { latitude: number; longitude: number };
      const distance = calculateDistance(
        parseFloat(latitude),
        parseFloat(longitude),
        eventCoords.latitude,
        eventCoords.longitude
      );

      // Allow check-in if within 100 meters of event location
      if (distance > 0.1) { // 0.1 km = 100 meters
        return res.status(400).json({ 
          success: false, 
          message: 'You must be at the event location to check in' 
        });
      }
    }

    // Create verified check-in
    const [newCheckIn] = await db
      .insert(checkIns)
      .values({
        userId,
        eventId,
        message: 'Checked in via QR code',
        location: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          timestamp: new Date(timestamp)
        },
        verifiedLocation: true,
        likes: 0,
        createdAt: new Date()
      })
      .returning();

    // Update attendance
    await db
      .insert(eventAttendees)
      .values({
        eventId,
        userId,
        checkedIn: true,
        checkInTime: new Date()
      })
      .onConflictDoUpdate({
        target: [eventAttendees.eventId, eventAttendees.userId],
        set: {
          checkedIn: true,
          checkInTime: new Date()
        }
      });

    res.json({ 
      success: true, 
      message: 'Successfully checked in!', 
      checkIn: newCheckIn 
    });
  } catch (error) {
    console.error('Error verifying check-in:', error);
    res.status(500).json({ success: false, message: 'Failed to verify check-in' });
  }
});

// Get event attendees and check-ins
router.get('/events/:id/attendees', async (req, res) => {
  try {
    const eventId = req.params.id;

    const attendees = await db
      .select({
        userId: users.id,
        userName: users.firstName,
        userLastName: users.lastName,
        checkedIn: eventAttendees.checkedIn,
        checkInTime: eventAttendees.checkInTime,
        rsvpTime: eventAttendees.createdAt
      })
      .from(eventAttendees)
      .leftJoin(users, eq(eventAttendees.userId, users.id))
      .where(eq(eventAttendees.eventId, eventId))
      .orderBy(desc(eventAttendees.checkInTime));

    res.json({ success: true, attendees });
  } catch (error) {
    console.error('Error fetching attendees:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch attendees' });
  }
});

// Utility function to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return distance;
}

export default router;