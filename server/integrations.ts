import express from 'express';
import { storage } from './storage';
import uberEatsRoutes from './integrations/uber-eats';

const router = express.Router();

// Mount Uber Eats OAuth integration routes
router.use('/uber-eats', uberEatsRoutes);

// Facebook OAuth Integration
router.post('/facebook/connect', async (req, res) => {
  try {
    const { accessToken, userID } = req.body;
    
    if (!process.env.FACEBOOK_APP_ID || !process.env.FACEBOOK_APP_SECRET) {
      return res.status(500).json({ 
        success: false, 
        message: 'Facebook credentials not configured' 
      });
    }

    // Verify Facebook token
    const verifyResponse = await fetch(
      `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,email`
    );
    
    if (!verifyResponse.ok) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid Facebook token' 
      });
    }

    const facebookUser = await verifyResponse.json();
    
    // Store Facebook connection for authenticated user
    if (req.isAuthenticated()) {
      await storage.updateUserIntegration(req.user.claims.sub, {
        platform: 'facebook',
        accessToken,
        externalId: facebookUser.id,
        email: facebookUser.email,
        name: facebookUser.name
      });
    }

    res.json({ 
      success: true, 
      message: 'Facebook connected successfully',
      user: facebookUser 
    });
  } catch (error) {
    console.error('Facebook connection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to connect Facebook account' 
    });
  }
});

// Google OAuth Integration
router.post('/google/connect', async (req, res) => {
  try {
    const { accessToken, idToken } = req.body;
    
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return res.status(500).json({ 
        success: false, 
        message: 'Google credentials not configured' 
      });
    }

    // Verify Google token
    const verifyResponse = await fetch(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`
    );
    
    if (!verifyResponse.ok) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid Google token' 
      });
    }

    const googleUser = await verifyResponse.json();
    
    // Store Google connection for authenticated user
    if (req.isAuthenticated()) {
      await storage.updateUserIntegration(req.user.claims.sub, {
        platform: 'google',
        accessToken,
        externalId: googleUser.user_id,
        email: googleUser.email
      });
    }

    res.json({ 
      success: true, 
      message: 'Google connected successfully',
      user: googleUser 
    });
  } catch (error) {
    console.error('Google connection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to connect Google account' 
    });
  }
});

// Etsy Integration with proper v3 API structure
router.post('/etsy/connect', async (req, res) => {
  try {
    const { shopId, apiKey, userId, accessToken } = req.body;
    
    if (!shopId || !apiKey) {
      return res.status(400).json({ 
        success: false, 
        message: 'Shop ID and API key are required' 
      });
    }

    // Use provided API key or environment variable
    const etsyApiKey = apiKey || process.env.ETSY_API_KEY;
    
    if (!etsyApiKey) {
      return res.status(500).json({ 
        success: false, 
        message: 'Etsy API key not configured' 
      });
    }

    // Build headers according to Etsy v3 API documentation
    const headers: any = {
      'x-api-key': etsyApiKey,
      'Accept': 'application/json',
      'Content-Type': 'application/json; charset=utf-8'
    };

    // Add OAuth token if provided (format: userId.accessToken)
    if (userId && accessToken) {
      headers['Authorization'] = `Bearer ${userId}.${accessToken}`;
    }

    // Use correct Etsy v3 API endpoint
    const shopResponse = await fetch(`https://api.etsy.com/v3/application/shops/${shopId}`, {
      method: 'GET',
      headers
    });

    if (!shopResponse.ok) {
      const errorText = await shopResponse.text();
      return res.status(400).json({ 
        success: false, 
        message: `Failed to verify Etsy shop: ${shopResponse.status} - ${errorText}` 
      });
    }

    const shopData = await shopResponse.json();

    res.json({ 
      success: true, 
      message: 'Etsy shop connected successfully',
      shop: shopData,
      apiInfo: {
        endpoint: `https://api.etsy.com/v3/application/shops/${shopId}`,
        headers: {
          'x-api-key': 'Your Etsy App API Key',
          'Authorization': 'Bearer userId.accessToken (for OAuth scopes)'
        },
        documentation: 'API structure follows Etsy v3 specification'
      }
    });
  } catch (error) {
    console.error('Etsy connection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to connect Etsy shop: ' + error.message 
    });
  }
});

// DoorDash Integration (for restaurants)
router.post('/doordash/connect', async (req, res) => {
  try {
    const { businessId, accessToken } = req.body;
    
    if (!process.env.DOORDASH_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        message: 'DoorDash API key not configured' 
      });
    }

    // Note: DoorDash Drive API is currently sandbox only based on your email
    // This is a placeholder for when production access becomes available
    const sandboxResponse = {
      success: true,
      business_id: businessId,
      status: 'connected_sandbox',
      message: 'Connected to DoorDash sandbox environment'
    };

    // Store DoorDash connection
    if (req.isAuthenticated()) {
      await storage.updateUserIntegration(req.user.claims.sub, {
        platform: 'doordash',
        accessToken,
        externalId: businessId,
        status: 'sandbox',
        capabilities: ['delivery_tracking', 'order_management']
      });
    }

    res.json({ 
      success: true, 
      message: 'DoorDash connected (sandbox mode)',
      data: sandboxResponse 
    });
  } catch (error) {
    console.error('DoorDash connection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to connect DoorDash account' 
    });
  }
});

// Uber Eats Marketplace Integration (API Suite: Eats Marketplace)
router.post('/uber-eats/connect', async (req, res) => {
  try {
    const { storeId, clientId, clientSecret, accessToken } = req.body;
    
    if (!storeId || !clientId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Store ID and Client ID are required' 
      });
    }

    // Use provided credentials or environment variable
    const uberApiKey = process.env.UBER_EATS_API_KEY;
    
    if (!uberApiKey && !accessToken) {
      return res.status(500).json({ 
        success: false, 
        message: 'Uber Eats API credentials not configured' 
      });
    }

    // Uber Eats Marketplace API structure
    const headers: any = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Test connection to Uber Eats Marketplace API
    try {
      const response = await fetch(`https://api.uber.com/v1/eats/stores/${storeId}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.status(400).json({ 
          success: false, 
          message: `Failed to verify Uber Eats store: ${response.status} - ${errorText}` 
        });
      }

      const storeData = await response.json();

      res.json({ 
        success: true, 
        message: 'Uber Eats Marketplace connected successfully',
        store: storeData,
        apiSuite: 'Eats Marketplace',
        capabilities: [
          'menu_management',
          'order_tracking', 
          'delivery_coordination',
          'marketplace_integration',
          'analytics'
        ]
      });
    } catch (fetchError) {
      // Provide setup information for Eats Marketplace API
      res.json({ 
        success: false, 
        message: 'Uber Eats connection pending - complete API setup',
        setupInfo: {
          apiSuite: 'Eats Marketplace',
          selectedFromOptions: [
            'lending',
            'Spender Arrears', 
            'Uber Third Party Support',
            'Uber Pay',
            '✓ Eats Marketplace (SELECTED)',
            'Financial Services',
            'Uber Insurance Carrier',
            'Others'
          ],
          endpoint: 'https://api.uber.com/v1/eats/stores',
          documentation: 'https://developer.uber.com/docs/eats',
          requiredCredentials: ['Store ID', 'Client ID', 'OAuth Access Token'],
          nextSteps: 'Complete Uber Developer registration with Eats Marketplace API suite'
        }
      });
    }
  } catch (error) {
    console.error('Uber Eats connection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to connect Uber Eats: ' + error.message 
    });
  }
});

// Shopify Integration with Admin API
router.post('/shopify/connect', async (req, res) => {
  try {
    const { storeUrl, accessToken } = req.body;
    
    if (!storeUrl || !accessToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Store URL and access token are required' 
      });
    }

    // Clean store URL format
    const cleanStoreUrl = storeUrl.replace(/\/+$/, ''); // Remove trailing slashes
    
    // Test connection to Shopify Admin API
    const shopResponse = await fetch(`${cleanStoreUrl}/admin/api/2023-10/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });

    if (!shopResponse.ok) {
      const errorText = await shopResponse.text();
      return res.status(400).json({ 
        success: false, 
        message: `Failed to connect to Shopify store: ${shopResponse.status} - ${errorText}` 
      });
    }

    const shopData = await shopResponse.json();
    
    // Get product count
    const productsResponse = await fetch(`${cleanStoreUrl}/admin/api/2023-10/products/count.json`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json'
      }
    });

    let productCount = 0;
    if (productsResponse.ok) {
      const productsData = await productsResponse.json();
      productCount = productsData.count || 0;
    }

    // Store Shopify connection for authenticated user
    if (req.isAuthenticated()) {
      await storage.updateUserIntegration(req.user.claims.sub, {
        platform: 'shopify',
        accessToken,
        externalId: shopData.shop.id.toString(),
        storeUrl: cleanStoreUrl,
        storeName: shopData.shop.name,
        domain: shopData.shop.domain,
        productCount,
        plan: shopData.shop.plan_name
      });
    }

    res.json({ 
      success: true, 
      message: 'Shopify store connected successfully',
      store: {
        id: shopData.shop.id,
        name: shopData.shop.name,
        domain: shopData.shop.domain,
        plan: shopData.shop.plan_name,
        productCount,
        currency: shopData.shop.currency,
        timezone: shopData.shop.timezone
      },
      capabilities: [
        'product_sync',
        'order_management', 
        'inventory_tracking',
        'customer_data',
        'analytics'
      ]
    });
  } catch (error) {
    console.error('Shopify connection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to connect Shopify store: ' + error.message 
    });
  }
});

// Website Integration Testing (includes Shopify)
router.post('/website/test', async (req, res) => {
  try {
    const { websiteUrl, platformType, accessToken } = req.body;
    
    if (platformType === 'shopify' && accessToken) {
      // Test real Shopify connection
      const response = await fetch(`${websiteUrl}/admin/api/2023-10/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        return res.json({ success: false, error: `HTTP ${response.status}: ${errorText}` });
      }

      const data = await response.json();
      
      // Get product count
      const productsResponse = await fetch(`${websiteUrl}/admin/api/2023-10/products/count.json`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        }
      });

      let productCount = 0;
      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        productCount = productsData.count || 0;
      }

      return res.json({
        success: true,
        productCount,
        store: data.shop?.name || 'Unknown Store',
        plan: data.shop?.plan_name || 'Unknown Plan',
        domain: data.shop?.domain,
        currency: data.shop?.currency,
        id: data.shop?.id
      });
    } else {
      return res.json({ success: false, error: 'Invalid platform or missing access token' });
    }
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Ticketmaster Integration (for legal ticket sales)
router.post('/ticketmaster/connect', async (req, res) => {
  try {
    const { venueId, partnerApiKey } = req.body;
    
    if (!process.env.TICKETMASTER_API_KEY) {
      return res.status(500).json({ 
        success: false, 
        message: 'Ticketmaster API key not configured' 
      });
    }

    // Verify Ticketmaster venue/partner access
    const venueResponse = await fetch(
      `https://app.ticketmaster.com/discovery/v2/venues/${venueId}?apikey=${process.env.TICKETMASTER_API_KEY}`
    );

    if (!venueResponse.ok) {
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to verify Ticketmaster venue' 
      });
    }

    const venueData = await venueResponse.json();
    
    // Store Ticketmaster connection
    if (req.isAuthenticated()) {
      await storage.updateUserIntegration(req.user.claims.sub, {
        platform: 'ticketmaster',
        accessToken: partnerApiKey,
        externalId: venueId,
        venueName: venueData._embedded?.venues?.[0]?.name,
        venueUrl: venueData._embedded?.venues?.[0]?.url
      });
    }

    res.json({ 
      success: true, 
      message: 'Ticketmaster venue connected successfully',
      venue: venueData 
    });
  } catch (error) {
    console.error('Ticketmaster connection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to connect Ticketmaster venue' 
    });
  }
});

// Get user's connected integrations
router.get('/user/connections', async (req, res) => {
  try {
    // For demo/development, return sample connections showing available platforms
    const connections = [
      {
        platform: 'doordash',
        status: 'sandbox',
        externalName: 'DoorDash Developer Account',
        lastSyncAt: new Date().toISOString()
      },
      {
        platform: 'etsy',
        status: 'ready',
        externalName: 'Etsy Shop (API Ready)',
        lastSyncAt: new Date().toISOString()
      }
    ];
    
    res.json({ 
      success: true, 
      connections
    });
  } catch (error) {
    console.error('Error fetching user connections:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch connections' 
    });
  }
});

// Disconnect integration
router.delete('/disconnect/:platform', async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { platform } = req.params;
    await storage.removeUserIntegration(req.user.claims.sub, platform);
    
    res.json({ 
      success: true, 
      message: `${platform} disconnected successfully` 
    });
  } catch (error) {
    console.error('Error disconnecting integration:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to disconnect integration' 
    });
  }
});

// Food ordering integration endpoints
router.post('/food-ordering/uber-eats-redirect', async (req, res) => {
  try {
    const { restaurantId, restaurantName, userLocation } = req.body;
    
    // Build Uber Eats deep link with restaurant search
    const baseUrl = 'https://www.ubereats.com';
    let uberEatsUrl = baseUrl;
    
    if (restaurantName) {
      // Search for specific restaurant
      uberEatsUrl += `/search?q=${encodeURIComponent(restaurantName)}`;
      
      // Add location if provided
      if (userLocation && userLocation.lat && userLocation.lng) {
        uberEatsUrl += `&lat=${userLocation.lat}&lng=${userLocation.lng}`;
      }
    }
    
    res.json({
      success: true,
      uberEatsUrl,
      message: `Redirecting to Uber Eats for ${restaurantName}`,
      integration: {
        platform: 'uber_eats',
        method: 'deep_link_redirect',
        restaurantSearch: restaurantName,
        location: userLocation
      }
    });
  } catch (error) {
    console.error('Food ordering redirect error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create Uber Eats redirect'
    });
  }
});

// Get local restaurants (could be integrated with actual restaurant data)
router.get('/food-ordering/restaurants', async (req, res) => {
  try {
    const { location, cuisine, search } = req.query;
    
    // This would typically query your restaurant database
    // For now, return sample data that represents local restaurants
    const sampleRestaurants = [
      {
        id: 1,
        name: "Giuseppe's Italian Kitchen",
        cuisine: "Italian",
        rating: 4.8,
        deliveryTime: "25-35 min",
        deliveryFee: "$2.99",
        uberEatsAvailable: true,
        pickupAvailable: true,
        address: "123 Main St, Orange Beach, AL",
        phone: "(251) 555-0123"
      },
      {
        id: 2,
        name: "Sakura Sushi Bar", 
        cuisine: "Japanese",
        rating: 4.9,
        deliveryTime: "30-40 min",
        deliveryFee: "$3.49",
        uberEatsAvailable: true,
        pickupAvailable: true,
        address: "456 Beach Blvd, Orange Beach, AL",
        phone: "(251) 555-0456"
      }
    ];
    
    res.json({
      success: true,
      restaurants: sampleRestaurants,
      totalCount: sampleRestaurants.length,
      integrationInfo: {
        uberEatsPartnership: true,
        localBusinessSupport: true,
        deliveryOptions: ['uber_eats', 'restaurant_pickup']
      }
    });
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch restaurant data'
    });
  }
});

export default router;