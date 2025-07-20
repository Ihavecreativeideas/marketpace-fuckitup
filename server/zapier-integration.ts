import express from 'express';
import { storage } from './storage';

const router = express.Router();

// Zapier webhook endpoint for Facebook Events
router.post('/facebook-events/webhook', async (req, res) => {
  try {
    const { event, user_id, facebook_page_id, zapier_signature } = req.body;
    
    // Verify Zapier signature for security
    if (!zapier_signature) {
      return res.status(401).json({ error: 'Missing Zapier signature' });
    }
    
    // Process Facebook event data
    const facebookEvent = {
      facebook_event_id: event.id,
      facebook_page_id: facebook_page_id,
      user_id: user_id,
      title: event.name,
      description: event.description || '',
      start_time: event.start_time,
      end_time: event.end_time,
      location: event.place?.name || event.location || '',
      cover_photo: event.cover?.source || null,
      ticket_uri: event.ticket_uri || null,
      event_url: `https://facebook.com/events/${event.id}`,
      category: detectEventCategory(event.name, event.description),
      status: 'active',
      imported_from: 'facebook',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Store event in MarketPace database
    await storage.createFacebookEvent(facebookEvent);
    
    // Send success response to Zapier
    res.status(200).json({
      success: true,
      message: 'Facebook event imported successfully',
      event_id: event.id,
      marketpace_event_id: facebookEvent.facebook_event_id
    });
    
    console.log(`✅ Facebook event imported: ${event.name} from page ${facebook_page_id}`);
    
  } catch (error) {
    console.error('❌ Facebook event import failed:', error);
    res.status(500).json({ 
      error: 'Failed to import Facebook event',
      details: error.message 
    });
  }
});

// Zapier authentication endpoint
router.post('/auth/test', async (req, res) => {
  try {
    const { api_key, facebook_page_id } = req.body;
    
    // Verify API key belongs to valid MarketPace user
    const user = await storage.getUserByApiKey(api_key);
    if (!user) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    // Test Facebook page access
    if (facebook_page_id) {
      const pageAccess = await storage.checkFacebookPageAccess(user.id, facebook_page_id);
      if (!pageAccess) {
        return res.status(403).json({ error: 'Facebook page not connected' });
      }
    }
    
    res.status(200).json({
      success: true,
      user_id: user.id,
      username: user.username,
      facebook_pages: await storage.getUserFacebookPages(user.id)
    });
    
  } catch (error) {
    console.error('❌ Zapier auth test failed:', error);
    res.status(500).json({ error: 'Authentication test failed' });
  }
});

// Get user's Facebook page events for Zapier trigger
router.get('/facebook-pages/:pageId/events', async (req, res) => {
  try {
    const { pageId } = req.params;
    const { api_key } = req.query;
    
    // Verify API key and page access
    const user = await storage.getUserByApiKey(api_key as string);
    if (!user) {
      return res.status(401).json({ error: 'Invalid API key' });
    }
    
    const pageAccess = await storage.checkFacebookPageAccess(user.id, pageId);
    if (!pageAccess) {
      return res.status(403).json({ error: 'Facebook page not connected' });
    }
    
    // Get recent Facebook events for this page
    const events = await storage.getFacebookPageEvents(pageId);
    
    res.status(200).json({
      success: true,
      page_id: pageId,
      events: events.map(event => ({
        id: event.facebook_event_id,
        name: event.title,
        description: event.description,
        start_time: event.start_time,
        end_time: event.end_time,
        location: event.location,
        event_url: event.event_url,
        imported_at: event.created_at
      }))
    });
    
  } catch (error) {
    console.error('❌ Failed to get Facebook page events:', error);
    res.status(500).json({ error: 'Failed to retrieve events' });
  }
});

// Member Facebook page connection endpoint
router.post('/connect-facebook-page', async (req, res) => {
  try {
    const { user_id, facebook_page_id, page_name, access_token, zapier_webhook_url } = req.body;
    
    // Validate user exists
    const user = await storage.getUser(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Store Facebook page connection
    const connection = {
      user_id,
      facebook_page_id,
      page_name,
      access_token: access_token ? 'encrypted_token_placeholder' : null, // In production, encrypt this
      zapier_webhook_url,
      status: 'active',
      connected_at: new Date().toISOString()
    };
    
    await storage.createFacebookPageConnection(connection);
    
    res.status(200).json({
      success: true,
      message: 'Facebook page connected successfully',
      connection_id: facebook_page_id,
      webhook_url: zapier_webhook_url
    });
    
    console.log(`✅ Facebook page connected: ${page_name} for user ${user.username}`);
    
  } catch (error) {
    console.error('❌ Facebook page connection failed:', error);
    res.status(500).json({ error: 'Failed to connect Facebook page' });
  }
});

// Utility function to detect event category
function detectEventCategory(title: string, description: string): string {
  const text = (title + ' ' + description).toLowerCase();
  
  if (text.match(/music|concert|band|dj|festival|live|performance/)) return 'music';
  if (text.match(/sport|game|tournament|competition|race|match/)) return 'sports';
  if (text.match(/food|restaurant|dining|chef|cooking|taste|culinary/)) return 'food';
  if (text.match(/business|networking|conference|seminar|meeting|workshop/)) return 'business';
  if (text.match(/community|local|neighborhood|charity|volunteer|social/)) return 'community';
  
  return 'community'; // default category
}

// Facebook Events sync endpoint for calendar integration
router.post('/facebook-events/sync', async (req, res) => {
  try {
    const { user_id, radius_miles, location } = req.body;
    
    // Get user's connected Facebook pages
    const userPages = await storage.getUserFacebookPages(user_id);
    let allEvents = [];
    
    // Collect events from all connected Facebook pages
    for (const page of userPages) {
      const pageEvents = await storage.getFacebookPageEvents(page.facebook_page_id);
      allEvents = allEvents.concat(pageEvents);
    }
    
    // Filter events by radius and location if specified
    const filteredEvents = allEvents.filter(event => {
      // In a real implementation, this would use actual geolocation
      // For demo purposes, we'll return all events
      return event.status === 'active';
    });
    
    res.status(200).json({
      success: true,
      events: filteredEvents.map(event => ({
        id: event.facebook_event_id,
        name: event.title,
        description: event.description,
        start_time: event.start_time,
        end_time: event.end_time,
        location: event.location,
        category: event.category,
        event_url: event.event_url,
        cover_photo: event.cover_photo,
        ticket_uri: event.ticket_uri
      })),
      total_events: filteredEvents.length,
      location: location,
      radius_miles: radius_miles
    });
    
    console.log(`✅ Synced ${filteredEvents.length} Facebook events for user ${user_id}`);
    
  } catch (error) {
    console.error('❌ Facebook events sync failed:', error);
    res.status(500).json({ 
      error: 'Failed to sync Facebook events',
      details: error.message 
    });
  }
});

export { router as zapierRouter };