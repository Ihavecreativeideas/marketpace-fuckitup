import { Router } from "express";
import fetch from "node-fetch";

const router = Router();

// Uber Eats OAuth Configuration
const UBER_CLIENT_ID = process.env.UBER_CLIENT_ID || 'xIC8cXF3k1opCrVZvVg_MAW0lMh8vVIG';
const UBER_CLIENT_SECRET = process.env.UBER_CLIENT_SECRET || 'TG8de43ETuHu2sActoi6hVZJsUqpQLJ6xhAuQE96';
const UBER_REDIRECT_URI = process.env.UBER_REDIRECT_URI || 'https://www.marketpace.shop/api/integrations/uber-eats/callback';
const UBER_WEBHOOK_URL = process.env.UBER_WEBHOOK_URL || 'https://www.marketpace.shop/api/integrations/uber-eats/webhook';
const UBER_TOKEN_URL = 'https://auth.uber.com/oauth/v2/token';

interface UberEatsStore {
  id: string;
  name: string;
  address: string;
  phone: string;
  cuisine_types: string[];
  status: 'active' | 'inactive';
  delivery_fee?: number;
  minimum_order_amount?: number;
}

interface UberEatsCredentials {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

// Step 1: Initiate OAuth Flow
router.get('/auth', (req, res) => {
  const scopes = [
    'eats.store',
    'eats.orders',
    'eats.menus',
    'profile'
  ].join(' ');

  const authUrl = `https://auth.uber.com/oauth/v2/authorize?` +
    `client_id=${UBER_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(UBER_REDIRECT_URI)}&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `response_type=code`;

  res.json({
    success: true,
    authUrl,
    message: 'Redirect user to this URL to begin Uber Eats integration'
  });
});

// Step 2: Handle OAuth Callback
router.get('/callback', async (req, res) => {
  const { code, error } = req.query;

  if (error) {
    return res.status(400).json({
      success: false,
      error: `OAuth error: ${error}`
    });
  }

  if (!code) {
    return res.status(400).json({
      success: false,
      error: 'Authorization code not provided'
    });
  }

  try {
    // Step 3: Exchange authorization code for access token
    const tokenResponse = await fetch('https://auth.uber.com/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_secret: UBER_CLIENT_SECRET,
        client_id: UBER_CLIENT_ID,
        grant_type: 'authorization_code',
        redirect_uri: UBER_REDIRECT_URI,
        code: code as string
      })
    });

    const tokenData = await tokenResponse.json() as UberEatsCredentials;

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${JSON.stringify(tokenData)}`);
    }

    // Store credentials securely (in production, encrypt these)
    // For now, we'll return them for demo purposes
    res.json({
      success: true,
      message: 'Uber Eats integration successful',
      credentials: {
        access_token: tokenData.access_token,
        expires_in: tokenData.expires_in,
        scope: tokenData.scope
      },
      next_steps: [
        'Store credentials securely',
        'Fetch store information',
        'Sync menu items',
        'Set up webhook endpoints'
      ]
    });

  } catch (error) {
    console.error('Uber Eats OAuth error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete Uber Eats integration',
      details: error.message
    });
  }
});

// Get Store Information
router.get('/store-info', async (req, res) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authorization token required'
    });
  }

  const accessToken = authHeader.split(' ')[1];

  try {
    const storeResponse = await fetch('https://api.uber.com/v1/eats/stores', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const storeData = await storeResponse.json();

    if (!storeResponse.ok) {
      throw new Error(`Store fetch failed: ${JSON.stringify(storeData)}`);
    }

    res.json({
      success: true,
      stores: storeData,
      integration_status: 'connected'
    });

  } catch (error) {
    console.error('Uber Eats store fetch error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch store information',
      details: error.message
    });
  }
});

// Sync Menu Items
router.post('/sync-menu', async (req, res) => {
  const authHeader = req.headers.authorization;
  const { store_id } = req.body;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authorization token required'
    });
  }

  if (!store_id) {
    return res.status(400).json({
      success: false,
      error: 'Store ID required'
    });
  }

  const accessToken = authHeader.split(' ')[1];

  try {
    const menuResponse = await fetch(`https://api.uber.com/v1/eats/stores/${store_id}/menus`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const menuData = await menuResponse.json();

    if (!menuResponse.ok) {
      throw new Error(`Menu fetch failed: ${JSON.stringify(menuData)}`);
    }

    // Process menu items for MarketPace integration
    const processedItems = menuData.menus?.map((menu: any) => ({
      id: menu.id,
      name: menu.title,
      description: menu.subtitle,
      price: menu.price_info?.price || 0,
      currency: menu.price_info?.currency || 'USD',
      category: menu.category_id,
      available: menu.suspension_info?.is_suspended === false,
      uber_eats_id: menu.id
    })) || [];

    res.json({
      success: true,
      message: `Synced ${processedItems.length} menu items`,
      items: processedItems,
      sync_timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Uber Eats menu sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync menu items',
      details: error.message
    });
  }
});

// Update Store Status
router.patch('/store-status', async (req, res) => {
  const authHeader = req.headers.authorization;
  const { store_id, status } = req.body;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Authorization token required'
    });
  }

  if (!store_id || !status) {
    return res.status(400).json({
      success: false,
      error: 'Store ID and status required'
    });
  }

  const accessToken = authHeader.split(' ')[1];

  try {
    const updateResponse = await fetch(`https://api.uber.com/v1/eats/stores/${store_id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: status
      })
    });

    const updateData = await updateResponse.json();

    if (!updateResponse.ok) {
      throw new Error(`Status update failed: ${JSON.stringify(updateData)}`);
    }

    res.json({
      success: true,
      message: `Store status updated to: ${status}`,
      store: updateData
    });

  } catch (error) {
    console.error('Uber Eats status update error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update store status',
      details: error.message
    });
  }
});

// Refresh Access Token
router.post('/refresh-token', async (req, res) => {
  const { refresh_token } = req.body;

  if (!refresh_token) {
    return res.status(400).json({
      success: false,
      error: 'Refresh token required'
    });
  }

  try {
    const refreshResponse = await fetch('https://auth.uber.com/oauth/v2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_secret: UBER_CLIENT_SECRET,
        client_id: UBER_CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: refresh_token
      })
    });

    const tokenData = await refreshResponse.json() as UberEatsCredentials;

    if (!refreshResponse.ok) {
      throw new Error(`Token refresh failed: ${JSON.stringify(tokenData)}`);
    }

    res.json({
      success: true,
      message: 'Access token refreshed successfully',
      credentials: {
        access_token: tokenData.access_token,
        expires_in: tokenData.expires_in,
        scope: tokenData.scope
      }
    });

  } catch (error) {
    console.error('Uber Eats token refresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh access token',
      details: error.message
    });
  }
});

// Test Integration Status
router.get('/test', async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({
      success: true,
      status: 'not_connected',
      message: 'No authorization token provided',
      next_steps: [
        'Start OAuth flow with /api/integrations/uber-eats/auth',
        'Complete authorization in browser',
        'Provide access token for API calls'
      ]
    });
  }

  const accessToken = authHeader.split(' ')[1];

  try {
    // Test API connectivity with user profile endpoint
    const profileResponse = await fetch('https://api.uber.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const profileData = await profileResponse.json();

    if (!profileResponse.ok) {
      throw new Error(`Profile fetch failed: ${JSON.stringify(profileData)}`);
    }

    res.json({
      success: true,
      status: 'connected',
      message: 'Uber Eats integration is working',
      user_info: {
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        email: profileData.email
      },
      available_actions: [
        'Fetch store information',
        'Sync menu items',
        'Update store status',
        'Process orders'
      ]
    });

  } catch (error) {
    console.error('Uber Eats test error:', error);
    res.status(500).json({
      success: false,
      status: 'error',
      error: 'Integration test failed',
      details: error.message
    });
  }
});

// Webhook endpoint for Uber Eats order updates
router.post('/webhook', (req, res) => {
  try {
    console.log('Uber Eats webhook received:', req.body);
    
    const { event_type, resource_href, resource_type, store_id, event_time } = req.body;
    
    // Verify webhook authenticity (in production, add proper verification)
    if (!event_type || !resource_href) {
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook payload'
      });
    }
    
    // Handle different webhook event types
    switch (event_type) {
      case 'orders.notification':
        console.log(`New order notification for store ${store_id}`);
        // Handle new order
        break;
        
      case 'orders.status_changed':
        console.log(`Order status changed for store ${store_id}`);
        // Handle order status updates
        break;
        
      case 'orders.cancel':
        console.log(`Order cancelled for store ${store_id}`);
        // Handle order cancellation
        break;
        
      case 'store.status_changed':
        console.log(`Store status changed for store ${store_id}`);
        // Handle store status updates
        break;
        
      default:
        console.log(`Unknown webhook event type: ${event_type}`);
    }
    
    // Respond with success (Uber expects 200 status)
    res.status(200).json({
      success: true,
      message: 'Webhook processed successfully',
      event_id: req.headers['x-uber-signature'] || 'unknown'
    });
    
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({
      success: false,
      error: 'Webhook processing failed'
    });
  }
});

// Get webhook configuration info
router.get('/webhook-config', (req, res) => {
  res.json({
    success: true,
    webhook_config: {
      webhook_url: UBER_WEBHOOK_URL,
      authentication_type: 'oAuth',
      client_id: UBER_CLIENT_ID,
      client_secret: UBER_CLIENT_SECRET.substring(0, 8) + '...',
      token_url: UBER_TOKEN_URL,
      scopes: [
        'eats.store',
        'eats.orders',
        'eats.menus',
        'profile'
      ],
      supported_events: [
        'orders.notification',
        'orders.status_changed', 
        'orders.cancel',
        'store.status_changed'
      ]
    },
    setup_instructions: {
      webhook_delivery_url: UBER_WEBHOOK_URL,
      authentication_type: 'oAuth',
      client_id: UBER_CLIENT_ID,
      client_secret: UBER_CLIENT_SECRET,
      token_url: UBER_TOKEN_URL,
      recommended_scopes: 'eats.store eats.orders eats.menus profile'
    }
  });
});

export default router;