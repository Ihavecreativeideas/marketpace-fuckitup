import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { storage, setRLSContext, clearRLSContext } from "./storage";
import revenueRoutes from "./revenueRoutes.js";
import { registerDriverRoutes } from "./driverRoutes";
import { registerPasswordRecoveryRoutes } from "./passwordRecovery";
import { registerIntegrationRoutes } from "./integrationRoutes";
import { registerScammerProtectionRoutes } from "./antiScammerProtection";
import { registerFacebookRoutes } from "./facebookIntegration";
import { setupFacebookAuth } from "./facebookAuth";
import { facebookAPI } from "./facebookGraphAPI";
import { registerAuthRoutes } from "./authRoutes";
import { setupShopifyBusinessRoutes } from "./shopifyBusinessIntegration";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);
  
  // Facebook Auth setup (optional - requires credentials)
  setupFacebookAuth(app);

  // Enhanced authentication routes (signup, login, password reset)
  registerAuthRoutes(app);
  
  // Supabase integration API
  app.post('/api/integrations/supabase/connect', async (req, res) => {
    try {
      const { url, anonKey, serviceKey } = req.body;
      
      if (!url || !anonKey) {
        return res.status(400).json({
          success: false,
          error: 'Supabase URL and Anon Key are required'
        });
      }

      // Test Supabase connection
      const testResponse = await fetch(`${url}/rest/v1/`, {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`
        }
      });

      if (!testResponse.ok) {
        throw new Error('Failed to connect to Supabase');
      }

      // Store integration credentials (in real app, encrypt these)
      const integrationData = {
        platform: 'supabase',
        url: url,
        anonKey: anonKey,
        serviceKey: serviceKey || null,
        status: 'connected',
        connectedAt: new Date().toISOString()
      };

      res.json({
        success: true,
        message: 'Successfully connected to Supabase',
        integration: integrationData
      });
    } catch (error) {
      console.error('Supabase connection error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to connect to Supabase'
      });
    }
  });

  // RLS Context middleware - sets user context for database security policies
  app.use(async (req: any, res, next) => {
    try {
      if (req.isAuthenticated() && req.user?.claims) {
        const userId = req.user.claims.sub;
        const user = await storage.getUser(userId);
        await setRLSContext(userId, user?.userType || 'buyer');
      } else {
        await clearRLSContext();
      }
      next();
    } catch (error) {
      console.error('RLS Context error:', error);
      await clearRLSContext();
      next();
    }
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch('/api/auth/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updateData = req.body;
      
      // Update user profile
      const updatedUser = await storage.updateUserProfile(userId, updateData);
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Privacy-compliant first-party analytics
  app.post('/api/analytics/track', async (req, res) => {
    try {
      const { event, properties, userId } = req.body;
      
      // Store analytics data in our own database instead of third-party
      await storage.trackEvent({
        event,
        properties,
        userId: userId || 'anonymous',
        timestamp: new Date(),
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        // Privacy compliant - don't store sensitive data
        sessionId: req.sessionID,
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Analytics tracking error:', error);
      res.status(500).json({ message: 'Failed to track event' });
    }
  });

  // Town search API for launched towns
  app.get('/api/towns', async (req, res) => {
    try {
      const { query } = req.query;
      
      const launchedTowns = [
        { name: 'Orange Beach', state: 'Alabama', fullName: 'Orange Beach, AL' },
        { name: 'Gulf Shores', state: 'Alabama', fullName: 'Gulf Shores, AL' },
        { name: 'Foley', state: 'Alabama', fullName: 'Foley, AL' },
        { name: 'Fairhope', state: 'Alabama', fullName: 'Fairhope, AL' },
        { name: 'Daphne', state: 'Alabama', fullName: 'Daphne, AL' },
        { name: 'Mobile', state: 'Alabama', fullName: 'Mobile, AL' },
        { name: 'Pensacola', state: 'Florida', fullName: 'Pensacola, FL' },
        { name: 'Destin', state: 'Florida', fullName: 'Destin, FL' },
        { name: 'Fort Walton Beach', state: 'Florida', fullName: 'Fort Walton Beach, FL' },
        { name: 'Navarre', state: 'Florida', fullName: 'Navarre, FL' },
        { name: 'Perdido Key', state: 'Florida', fullName: 'Perdido Key, FL' },
        { name: 'Crestview', state: 'Florida', fullName: 'Crestview, FL' }
      ];
      
      if (query) {
        const filtered = launchedTowns.filter(town => 
          town.name.toLowerCase().includes(query.toLowerCase()) ||
          town.state.toLowerCase().includes(query.toLowerCase())
        );
        res.json(filtered);
      } else {
        res.json(launchedTowns);
      }
    } catch (error) {
      console.error('Town search error:', error);
      res.status(500).json({ message: 'Failed to search towns' });
    }
  });

  // Category routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get('/api/categories/:type', async (req, res) => {
    try {
      const { type } = req.params;
      const categories = await storage.getCategoriesByType(type);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories by type:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Listing routes
  app.get('/api/listings', async (req, res) => {
    try {
      const { categoryId, search, limit } = req.query;
      const listings = await storage.getListings(
        categoryId ? parseInt(categoryId as string) : undefined,
        search as string,
        limit ? parseInt(limit as string) : undefined
      );
      res.json(listings);
    } catch (error) {
      console.error("Error fetching listings:", error);
      res.status(500).json({ message: "Failed to fetch listings" });
    }
  });

  app.get('/api/listings/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const listing = await storage.getListing(parseInt(id));
      if (!listing) {
        return res.status(404).json({ message: "Listing not found" });
      }
      res.json(listing);
    } catch (error) {
      console.error("Error fetching listing:", error);
      res.status(500).json({ message: "Failed to fetch listing" });
    }
  });

  app.post('/api/listings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const listingData = { ...req.body, userId };
      const listing = await storage.createListing(listingData);
      res.json(listing);
    } catch (error) {
      console.error("Error creating listing:", error);
      res.status(500).json({ message: "Failed to create listing" });
    }
  });

  app.get('/api/my-listings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const listings = await storage.getUserListings(userId);
      res.json(listings);
    } catch (error) {
      console.error("Error fetching user listings:", error);
      res.status(500).json({ message: "Failed to fetch listings" });
    }
  });

  // Cart routes
  app.get('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { listingId, quantity } = req.body;
      const cartItem = await storage.addToCart({ userId, listingId, quantity });
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.delete('/api/cart/:listingId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { listingId } = req.params;
      await storage.removeFromCart(userId, parseInt(listingId));
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  // Order routes
  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const orderData = { ...req.body, buyerId: userId };
      const order = await storage.createOrder(orderData);
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get('/api/orders/:type', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type } = req.params;
      const orders = await storage.getUserOrders(userId, type as 'buyer' | 'seller' | 'driver');
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Business Scheduling SMS API Route
  // Business scheduling settings endpoint
  app.post('/api/business-scheduling/save-settings', isAuthenticated, async (req: any, res) => {
    try {
      const { BusinessSchedulingService } = await import('./business-scheduling');
      const schedulingService = new BusinessSchedulingService();
      
      const userId = req.user.claims.sub;
      const settings = req.body;
      
      // For demo purposes, using userId as businessId
      // In real implementation, would get businessId from user's businesses
      const savedSettings = await schedulingService.saveBusinessSettings(userId, settings);
      
      res.json({ 
        success: true, 
        message: 'Business settings saved successfully',
        settings: savedSettings 
      });
    } catch (error) {
      console.error('Error saving business settings:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to save settings', 
        error: error.message 
      });
    }
  });

  app.get('/api/business-scheduling/settings', isAuthenticated, async (req: any, res) => {
    try {
      const { BusinessSchedulingService } = await import('./business-scheduling');
      const schedulingService = new BusinessSchedulingService();
      
      const userId = req.user.claims.sub;
      
      // For demo purposes, using userId as businessId
      const settings = await schedulingService.getBusinessSettings(userId);
      
      res.json({ success: true, settings });
    } catch (error) {
      console.error('Error getting business settings:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to get settings', 
        error: error.message 
      });
    }
  });

  app.post('/api/business-scheduling/send-sms-invite', isAuthenticated, async (req: any, res) => {
    try {
      const { BusinessSchedulingService } = await import('./business-scheduling');
      const businessService = new BusinessSchedulingService();
      
      const { phoneNumber, role, inviteLink, businessName } = req.body;
      
      if (!phoneNumber || !role || !inviteLink || !businessName) {
        return res.status(400).json({ 
          message: 'Missing required fields: phoneNumber, role, inviteLink, businessName' 
        });
      }
      
      const result = await businessService.sendSMSInvitation({
        phoneNumber,
        role,
        inviteLink,
        businessName
      });
      
      res.json(result);
    } catch (error: any) {
      console.error("Error sending SMS invitation:", error);
      res.status(500).json({ 
        message: "Failed to send SMS invitation", 
        error: error.message 
      });
    }
  });

  // Driver application routes
  app.post('/api/driver-application', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applicationData = { ...req.body, userId };
      
      // Enhanced application processing with immediate approval logic
      const application = await storage.submitDriverApplication(applicationData);
      
      // Auto-approve if all requirements are met
      if (
        applicationData.licenseNumber &&
        applicationData.licenseExpirationDate &&
        applicationData.insuranceCompany &&
        applicationData.backgroundCheckPassed &&
        applicationData.vehicleInfo?.make &&
        applicationData.bankAccountNumber
      ) {
        // Immediate approval for valid applications
        await storage.updateDriverApplicationStatus(application.id, 'approved', 'system');
        
        // Update user type to include driver role
        const user = await storage.getUser(userId);
        if (user) {
          await storage.updateUserProfile(userId, { 
            userType: user.userType === 'buyer' ? 'driver' : `${user.userType},driver`
          });
        }
        
        res.json({ ...application, status: 'approved' });
      } else {
        res.json(application);
      }
    } catch (error) {
      console.error("Error submitting driver application:", error);
      res.status(500).json({ message: "Failed to submit application" });
    }
  });

  app.get('/api/driver-application', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const application = await storage.getDriverApplication(userId);
      res.json(application);
    } catch (error) {
      console.error("Error fetching driver application:", error);
      res.status(500).json({ message: "Failed to fetch application" });
    }
  });

  // Driver status and dashboard routes
  app.post('/api/driver-status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { isOnline } = req.body;
      
      await storage.updateDriverStatus(userId, isOnline);
      res.json({ success: true, isOnline });
    } catch (error) {
      console.error("Error updating driver status:", error);
      res.status(500).json({ message: "Failed to update driver status" });
    }
  });

  app.get('/api/driver-stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDriverStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching driver stats:", error);
      res.status(500).json({ message: "Failed to fetch driver stats" });
    }
  });

  // Serve the Shopify integration test page
  app.get('/test-shopify-integration', (req, res) => {
    res.sendFile('test-shopify-integration.html', { root: '.' });
  });

  // Serve the Printful integration test page
  app.get('/test-printful-integration', (req, res) => {
    res.sendFile('test-printful-integration.html', { root: '.' });
  });

  // Printful integration routes
  app.post('/api/printful/test-connection', async (req, res) => {
    try {
      const PRINTFUL_API_KEY = '8ix90dXLKcFM8s5CgODZz6TS5MUd38KSgfI2e3leHzbdMSOSgrXwU5G00kmtxpf3';
      
      console.log('Testing Printful connection...');
      const response = await fetch('https://api.printful.com/store', {
        headers: {
          'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.code === 200) {
        res.json({
          success: true,
          message: 'Printful connection successful',
          store: result.result,
          apiKey: PRINTFUL_API_KEY.substring(0, 10) + '...'
        });
      } else {
        res.json({
          success: false,
          error: 'OAuth 2.0 token required',
          details: result,
          solution: 'Visit https://developers.printful.com/ to get OAuth 2.0 token',
          migration: 'Legacy API keys are no longer supported'
        });
      }
    } catch (error: any) {
      console.error('Printful connection error:', error);
      res.status(500).json({
        success: false,
        error: 'Connection test failed',
        message: error.message
      });
    }
  });

  // Printful products endpoint
  app.get('/api/printful/products', async (req, res) => {
    try {
      const PRINTFUL_API_KEY = '8ix90dXLKcFM8s5CgODZz6TS5MUd38KSgfI2e3leHzbdMSOSgrXwU5G00kmtxpf3';
      
      const response = await fetch('https://api.printful.com/products', {
        headers: {
          'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      res.json(result);
    } catch (error: any) {
      console.error('Error fetching Printful products:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

  // Printful store products endpoint
  app.get('/api/printful/store/products', async (req, res) => {
    try {
      const PRINTFUL_API_KEY = '8ix90dXLKcFM8s5CgODZz6TS5MUd38KSgfI2e3leHzbdMSOSgrXwU5G00kmtxpf3';
      
      const response = await fetch('https://api.printful.com/store/products', {
        headers: {
          'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      res.json(result);
    } catch (error: any) {
      console.error('Error fetching store products:', error);
      res.status(500).json({ error: 'Failed to fetch store products' });
    }
  });

  // Printful orders endpoint
  app.get('/api/printful/orders', async (req, res) => {
    try {
      const PRINTFUL_API_KEY = '8ix90dXLKcFM8s5CgODZz6TS5MUd38KSgfI2e3leHzbdMSOSgrXwU5G00kmtxpf3';
      
      const response = await fetch('https://api.printful.com/orders', {
        headers: {
          'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      res.json(result);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  // Printful files endpoint
  app.get('/api/printful/files', async (req, res) => {
    try {
      const PRINTFUL_API_KEY = '8ix90dXLKcFM8s5CgODZz6TS5MUd38KSgfI2e3leHzbdMSOSgrXwU5G00kmtxpf3';
      
      const response = await fetch('https://api.printful.com/files', {
        headers: {
          'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      res.json(result);
    } catch (error: any) {
      console.error('Error fetching files:', error);
      res.status(500).json({ error: 'Failed to fetch files' });
    }
  });

  // Printful business integration
  app.post('/api/printful/business-integration/connect', async (req, res) => {
    try {
      const PRINTFUL_API_KEY = '8ix90dXLKcFM8s5CgODZz6TS5MUd38KSgfI2e3leHzbdMSOSgrXwU5G00kmtxpf3';
      const { businessId, printfulStoreId } = req.body;
      
      const response = await fetch('https://api.printful.com/store', {
        headers: {
          'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.code === 200) {
        const integrationSettings = {
          businessId,
          printfulStoreId: printfulStoreId || result.result.id,
          apiKey: PRINTFUL_API_KEY,
          connected: true,
          connectedAt: new Date().toISOString()
        };
        
        res.json({
          success: true,
          message: 'Successfully connected to Printful store',
          store: result.result,
          settings: integrationSettings
        });
      } else {
        res.json({
          success: false,
          error: 'Failed to connect to Printful store',
          details: result
        });
      }
    } catch (error: any) {
      console.error('Printful business integration error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to connect Printful store',
        message: error.message
      });
    }
  });

  app.get('/api/driver-active-routes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const routes = await storage.getDriverActiveRoutes(userId);
      res.json(routes);
    } catch (error) {
      console.error("Error fetching active routes:", error);
      res.status(500).json({ message: "Failed to fetch active routes" });
    }
  });

  app.get('/api/available-routes', isAuthenticated, async (req: any, res) => {
    try {
      const { timeSlot } = req.query;
      const routes = await storage.getAvailableRoutes(timeSlot as string);
      res.json(routes);
    } catch (error) {
      console.error("Error fetching available routes:", error);
      res.status(500).json({ message: "Failed to fetch available routes" });
    }
  });

  app.post('/api/accept-route/:routeId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { routeId } = req.params;
      
      const route = await storage.acceptDeliveryRoute(parseInt(routeId), userId);
      res.json(route);
    } catch (error) {
      console.error("Error accepting route:", error);
      res.status(500).json({ message: "Failed to accept route" });
    }
  });

  // Enhanced Driver Dashboard API Endpoints
  
  // Get driver's current location
  app.get('/api/drivers/location', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'Driver not found' });
      }

      res.json({
        location: {
          address: user.address,
          lat: user.lat,
          lng: user.lng
        }
      });
    } catch (error) {
      console.error('Error fetching driver location:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get nearby routes ordered by distance
  app.get('/api/drivers/routes/nearby', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { lat, lng } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({ error: 'Driver location required' });
      }

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ error: 'Driver not found' });
      }

      // Get mock nearby routes for demo
      const mockRoutes = [
        {
          id: 1,
          timeSlot: 'afternoon',
          startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
          endTime: new Date(Date.now() + 4 * 60 * 60 * 1000),
          pickups: 2,
          dropoffs: 4,
          mileage: 8.5,
          originalMileage: 8.5,
          earnings: 28.25,
          pickupLat: parseFloat(lat) + 0.01,
          pickupLng: parseFloat(lng) + 0.01,
          status: 'available',
          distance: 0.7,
          customers: [
            { id: 'cust1', name: 'Sarah M.', email: 'sarah@example.com' },
            { id: 'cust2', name: 'Mike K.', email: 'mike@example.com' }
          ]
        },
        {
          id: 2,
          timeSlot: 'evening',
          startTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours from now
          endTime: new Date(Date.now() + 6 * 60 * 60 * 1000),
          pickups: 3,
          dropoffs: 5,
          mileage: 12.3,
          originalMileage: 12.3,
          earnings: 41.65,
          pickupLat: parseFloat(lat) + 0.02,
          pickupLng: parseFloat(lng) - 0.01,
          status: 'available',
          distance: 1.4,
          customers: [
            { id: 'cust3', name: 'Anna L.', email: 'anna@example.com' }
          ]
        }
      ];

      res.json({
        routes: mockRoutes
      });
    } catch (error) {
      console.error('Error fetching nearby routes:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Send message to customer about earlier delivery
  app.post('/api/drivers/messages/customer', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { customerId, message, feeAdjustment } = req.body;
      
      if (!customerId || !message) {
        return res.status(400).json({ error: 'Customer ID and message are required' });
      }

      // Mock message sending for demo
      const messageData = {
        id: 'msg_' + Math.random().toString(36).substr(2, 9),
        driverId: userId,
        customerId: customerId,
        message: message,
        messageType: 'route_offer',
        feeAdjustment: feeAdjustment || 0,
        sentAt: new Date()
      };

      res.json({
        success: true,
        message: 'Message sent successfully',
        messageData: messageData
      });
    } catch (error) {
      console.error('Error sending customer message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Update driver status (online/offline)
  app.post('/api/drivers/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { status } = req.body;
      
      if (!['online', 'offline'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      await storage.updateUserProfile(userId, {
        isOnline: status === 'online',
        lastOnlineAt: new Date()
      });

      res.json({
        success: true,
        message: 'Status updated successfully',
        status: status
      });
    } catch (error) {
      console.error('Error updating driver status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Get driver stats and earnings
  app.get('/api/drivers/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Mock stats for demo
      const mockStats = {
        todayEarnings: 47.50,
        weeklyEarnings: 312.75,
        completedDeliveries: 23,
        status: 'online',
        averageRating: 4.8,
        totalEarnings: 1247.30
      };

      res.json(mockStats);
    } catch (error) {
      console.error('Error fetching driver stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Mark delivery as complete with late tracking
  app.post('/api/drivers/deliveries/:deliveryId/complete', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { deliveryId } = req.params;
      const { isLate = false, completedAt } = req.body;
      
      const completionTime = new Date(completedAt || Date.now());

      // Mock delivery completion for demo
      const mockCompletion = {
        id: deliveryId,
        status: 'completed',
        completedAt: completionTime,
        isLate: isLate,
        driverEarnings: isLate ? 8.50 : 12.75, // Reduced earnings for late delivery
        notes: isLate ? 'Late delivery - admin note added' : 'Completed on time'
      };

      res.json({
        success: true,
        message: 'Delivery marked as complete',
        delivery: mockCompletion,
        isLate: isLate
      });
    } catch (error) {
      console.error('Error marking delivery complete:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Enhanced Shipt-style Driver API Endpoints

  // Update delivery status with customer notifications
  app.patch('/api/drivers/deliveries/:deliveryId/status', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { deliveryId } = req.params;
      const { status } = req.body;
      
      const validStatuses = ['pending', 'en_route', 'picked_up', 'delivering', 'completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      // Mock status update with customer notification
      const mockUpdate = {
        id: deliveryId,
        status: status,
        updatedAt: new Date(),
        customerNotified: true,
        message: `Driver has updated status to: ${status.replace('_', ' ')}`
      };

      res.json({
        success: true,
        message: 'Status updated and customer notified',
        delivery: mockUpdate
      });
    } catch (error) {
      console.error('Error updating delivery status:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Send pickup photo to buyer
  app.post('/api/drivers/deliveries/:deliveryId/photo', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { deliveryId } = req.params;
      
      // In production, handle image upload to cloud storage
      const mockPhotoResponse = {
        id: deliveryId,
        photoUrl: 'https://example.com/pickup-photos/' + deliveryId + '.jpg',
        sentToBuyer: true,
        sentAt: new Date(),
        buyerResponse: null // Will be updated when buyer responds
      };

      res.json({
        success: true,
        message: 'Pickup photo sent to buyer for confirmation',
        photo: mockPhotoResponse
      });
    } catch (error) {
      console.error('Error sending pickup photo:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Handle buyer rejection and return to seller
  app.post('/api/drivers/deliveries/:deliveryId/return', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { deliveryId } = req.params;
      const { reason, chargeBuyer } = req.body;
      
      // Mock return processing
      const mockReturn = {
        id: deliveryId,
        status: 'returning_to_seller',
        reason: reason,
        buyerCharged: chargeBuyer,
        returnFee: 5.00, // Return fee charged to buyer
        driverCompensation: 8.00, // Driver still gets compensation
        processedAt: new Date()
      };

      res.json({
        success: true,
        message: 'Return initiated. Buyer charged delivery fee portion.',
        return: mockReturn
      });
    } catch (error) {
      console.error('Error processing return:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Bail on route functionality
  app.post('/api/drivers/routes/:routeId/bail', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { routeId } = req.params;
      const { reason } = req.body;
      
      // Mock route bail processing
      const mockBail = {
        routeId: routeId,
        originalDriverId: userId,
        bailReason: reason,
        bailedAt: new Date(),
        routeStatus: 'available', // Route goes back to job board
        penalty: false, // No penalty for legitimate bails
        compensation: 5.00 // Partial compensation for time spent
      };

      res.json({
        success: true,
        message: 'Route returned to job board for reassignment',
        bail: mockBail
      });
    } catch (error) {
      console.error('Error processing route bail:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Pause route functionality
  app.post('/api/drivers/routes/:routeId/pause', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { routeId } = req.params;
      
      const mockPause = {
        routeId: routeId,
        status: 'paused',
        pausedAt: new Date(),
        customerNotification: 'Driver has temporarily paused deliveries',
        etaAdjustment: 15 // 15 minute delay added to all ETAs
      };

      res.json({
        success: true,
        message: 'Route paused. Customers have been notified.',
        pause: mockPause
      });
    } catch (error) {
      console.error('Error pausing route:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Resume route functionality
  app.post('/api/drivers/routes/:routeId/resume', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { routeId } = req.params;
      
      const mockResume = {
        routeId: routeId,
        status: 'active',
        resumedAt: new Date(),
        customerNotification: 'Driver has resumed deliveries',
        recalculatedETAs: true
      };

      res.json({
        success: true,
        message: 'Route resumed. ETAs recalculated.',
        resume: mockResume
      });
    } catch (error) {
      console.error('Error resuming route:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Handle tips from both buyer and seller
  app.post('/api/drivers/deliveries/:deliveryId/tip', isAuthenticated, async (req: any, res) => {
    try {
      const { deliveryId } = req.params;
      const { amount, tipperType } = req.body;
      
      if (!['buyer', 'seller'].includes(tipperType)) {
        return res.status(400).json({ error: 'Invalid tipper type' });
      }

      const mockTip = {
        deliveryId: deliveryId,
        amount: amount,
        tipperType: tipperType,
        processedAt: new Date(),
        driverReceives: amount, // Driver gets 100% of tips
        platformFee: 0
      };

      res.json({
        success: true,
        message: `Tip received from ${tipperType}. 100% goes to driver.`,
        tip: mockTip
      });
    } catch (error) {
      console.error('Error processing tip:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Enhanced Payment Processing Endpoints

  // Create payment intent for driver earnings
  app.post('/api/drivers/payment-intent', isAuthenticated, async (req: any, res) => {
    try {
      const { amount, deliveryId, paymentType } = req.body;
      
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        metadata: {
          deliveryId: deliveryId,
          paymentType: paymentType,
          driverId: req.user.claims.sub
        },
        description: `MarketPace Driver Payment - Delivery #${deliveryId}`
      });

      res.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      console.error('Error creating driver payment intent:', error);
      res.status(500).json({ error: 'Failed to create payment intent' });
    }
  });

  // Process buyer rejection payment
  app.post('/api/drivers/buyer-rejection-payment', isAuthenticated, async (req: any, res) => {
    try {
      const { deliveryId, buyerCharge, driverCompensation, reason } = req.body;
      
      // Create payment intent for buyer charge
      const buyerPayment = await stripe.paymentIntents.create({
        amount: Math.round(buyerCharge * 100),
        currency: 'usd',
        metadata: {
          deliveryId: deliveryId,
          reason: reason,
          type: 'buyer_rejection_fee'
        },
        description: `Delivery fee for rejected item - Delivery #${deliveryId}`
      });

      // Create payout for driver compensation
      const driverPayout = await stripe.paymentIntents.create({
        amount: Math.round(driverCompensation * 100),
        currency: 'usd',
        metadata: {
          deliveryId: deliveryId,
          driverId: req.user.claims.sub,
          type: 'rejection_compensation'
        },
        description: `Driver compensation for rejected delivery #${deliveryId}`
      });

      res.json({
        success: true,
        buyerPayment: buyerPayment.id,
        driverPayout: driverPayout.id,
        buyerCharge: buyerCharge,
        driverCompensation: driverCompensation
      });
    } catch (error) {
      console.error('Error processing buyer rejection payment:', error);
      res.status(500).json({ error: 'Failed to process rejection payment' });
    }
  });

  // Process tips from buyers and sellers
  app.post('/api/drivers/process-tip', isAuthenticated, async (req: any, res) => {
    try {
      const { deliveryId, tipAmount, tipperType, driverReceives } = req.body;
      
      const tipPayment = await stripe.paymentIntents.create({
        amount: Math.round(tipAmount * 100),
        currency: 'usd',
        metadata: {
          deliveryId: deliveryId,
          tipperType: tipperType,
          driverId: req.user.claims.sub,
          type: 'driver_tip'
        },
        description: `Tip for driver from ${tipperType} - Delivery #${deliveryId}`
      });

      res.json({
        success: true,
        tipPayment: tipPayment.id,
        tipAmount: tipAmount,
        driverReceives: driverReceives,
        tipperType: tipperType,
        platformFee: 0 // 100% to driver
      });
    } catch (error) {
      console.error('Error processing tip:', error);
      res.status(500).json({ error: 'Failed to process tip' });
    }
  });

  // Update delivery method
  app.patch('/api/drivers/deliveries/:deliveryId/method', isAuthenticated, async (req: any, res) => {
    try {
      const { deliveryId } = req.params;
      const { methodId, methodDetails } = req.body;
      
      const mockUpdate = {
        deliveryId: deliveryId,
        previousMethod: 'marketpace_delivery',
        newMethod: methodId,
        methodDetails: methodDetails,
        updatedAt: new Date(),
        feeAdjustment: calculateMethodFeeAdjustment(methodId)
      };

      res.json({
        success: true,
        message: 'Delivery method updated successfully',
        update: mockUpdate
      });
    } catch (error) {
      console.error('Error updating delivery method:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  function calculateMethodFeeAdjustment(methodId: string): number {
    const adjustments: { [key: string]: number } = {
      'same_day_delivery': 10.00,
      'self_pickup': -6.00, // Remove delivery fees
      'contactless_delivery': 0.00,
      'scheduled_delivery': 0.00,
      'counter_offer': 0.00 // Negotiable
    };
    
    return adjustments[methodId] || 0.00;
  }

  app.post('/api/complete-stop/:routeId/:stopIndex', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { routeId, stopIndex } = req.params;
      
      const result = await storage.completeRouteStop(
        parseInt(routeId), 
        parseInt(stopIndex), 
        userId
      );
      res.json(result);
    } catch (error) {
      console.error("Error completing stop:", error);
      res.status(500).json({ message: "Failed to complete stop" });
    }
  });

  // Tip routes
  app.post('/api/tips/checkout', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { orderId, amount } = req.body;
      
      const tip = await storage.addDriverTip({
        orderId: parseInt(orderId),
        buyerId: userId,
        amount: parseFloat(amount),
        tipType: 'checkout',
        status: 'pending'
      });
      
      res.json(tip);
    } catch (error) {
      console.error("Error adding checkout tip:", error);
      res.status(500).json({ message: "Failed to add tip" });
    }
  });

  app.post('/api/tips/post-delivery', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { orderId, amount } = req.body;
      
      const tip = await storage.addDriverTip({
        orderId: parseInt(orderId),
        buyerId: userId,
        amount: parseFloat(amount),
        tipType: 'post_delivery',
        status: 'pending'
      });
      
      res.json(tip);
    } catch (error) {
      console.error("Error adding post-delivery tip:", error);
      res.status(500).json({ message: "Failed to add tip" });
    }
  });

  // Demo route for showcasing delivery optimization
  app.get('/api/delivery-demo', async (req, res) => {
    try {
      const demoData = await storage.generateDeliveryDemo();
      res.json(demoData);
    } catch (error) {
      console.error("Error generating delivery demo:", error);
      res.status(500).json({ message: "Failed to generate demo" });
    }
  });

  // Admin routes
  app.get('/api/admin/driver-applications', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.userType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const applications = await storage.getPendingDriverApplications();
      res.json(applications);
    } catch (error) {
      console.error("Error fetching driver applications:", error);
      res.status(500).json({ message: "Failed to fetch applications" });
    }
  });

  app.put('/api/admin/driver-applications/:id', isAuthenticated, async (req: any, res) => {
    try {
      const user = await storage.getUser(req.user.claims.sub);
      if (user?.userType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      const { id } = req.params;
      const { status } = req.body;
      const application = await storage.updateDriverApplicationStatus(
        parseInt(id),
        status,
        req.user.claims.sub
      );
      res.json(application);
    } catch (error) {
      console.error("Error updating driver application:", error);
      res.status(500).json({ message: "Failed to update application" });
    }
  });

  // Community routes
  app.get('/api/community-posts', async (req, res) => {
    try {
      const { limit } = req.query;
      const posts = await storage.getCommunityPosts(
        limit ? parseInt(limit as string) : undefined
      );
      res.json(posts);
    } catch (error) {
      console.error("Error fetching community posts:", error);
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post('/api/community-posts', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const postData = { ...req.body, userId };
      const post = await storage.createCommunityPost(postData);
      res.json(post);
    } catch (error) {
      console.error("Error creating community post:", error);
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.get('/api/community-posts/:id/comments', async (req, res) => {
    try {
      const { id } = req.params;
      const comments = await storage.getPostComments(parseInt(id));
      res.json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  app.post('/api/community-posts/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const commentData = { ...req.body, userId, postId: parseInt(id) };
      const comment = await storage.addComment(commentData);
      res.json(comment);
    } catch (error) {
      console.error("Error adding comment:", error);
      res.status(500).json({ message: "Failed to add comment" });
    }
  });

  // Offer routes
  app.post('/api/offers', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const offerData = { ...req.body, buyerId: userId };
      const offer = await storage.createOffer(offerData);
      res.json(offer);
    } catch (error) {
      console.error("Error creating offer:", error);
      res.status(500).json({ message: "Failed to create offer" });
    }
  });

  app.get('/api/offers/:type', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type } = req.params;
      const offers = await storage.getUserOffers(userId, type as 'buyer' | 'seller');
      res.json(offers);
    } catch (error) {
      console.error("Error fetching offers:", error);
      res.status(500).json({ message: "Failed to fetch offers" });
    }
  });

  // Privacy-compliant Stripe checkout (redirect-based, not embedded)
  app.post("/api/create-checkout-session", isAuthenticated, async (req, res) => {
    try {
      const { amount, returnUrl, description = 'MarketPace Service' } = req.body;
      
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: description,
              },
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: returnUrl,
        // Privacy compliant settings
        consent_collection: {
          terms_of_service: 'required',
        },
        // Use session tokens instead of cookies
        metadata: {
          user_id: req.user?.claims?.sub || 'anonymous',
          timestamp: new Date().toISOString(),
        },
      });
      
      res.json({ 
        sessionId: session.id,
        url: session.url,
        // Use redirect instead of embedded iframe
        redirect: true
      });
    } catch (error: any) {
      res.status(500).json({ 
        message: "Error creating checkout session: " + error.message 
      });
    }
  });

  // Legacy payment intent route for backward compatibility
  app.post("/api/create-payment-intent", isAuthenticated, async (req, res) => {
    try {
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
      });
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res
        .status(500)
        .json({ message: "Error creating payment intent: " + error.message });
    }
  });

  app.post('/api/create-subscription', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      let user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        res.json({
          subscriptionId: subscription.id,
          clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
        });
        return;
      }
      
      if (!user.email) {
        return res.status(400).json({ message: 'No user email on file' });
      }

      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      });

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: process.env.STRIPE_PRICE_ID || 'price_1234567890',
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      await storage.updateUserStripeInfo(userId, customer.id, subscription.id);
  
      res.json({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice?.payment_intent?.client_secret,
      });
    } catch (error: any) {
      return res.status(400).json({ error: { message: error.message } });
    }
  });

  // Admin panel routes (require admin user type)
  const isAdmin = (req: any, res: any, next: any) => {
    if (!req.user || req.user.claims.userType !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  };

  // Get all app settings
  app.get('/api/admin/settings', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const settings = await storage.getAppSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching app settings:", error);
      res.status(500).json({ message: "Failed to fetch app settings" });
    }
  });

  // Get settings by category
  app.get('/api/admin/settings/:category', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { category } = req.params;
      const settings = await storage.getAppSettingsByCategory(category);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings by category:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // Update app setting
  app.put('/api/admin/settings/:key', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const { key } = req.params;
      const { value } = req.body;
      const userId = req.user.claims.sub;
      
      const updatedSetting = await storage.updateAppSetting(key, value, userId);
      res.json(updatedSetting);
    } catch (error) {
      console.error("Error updating app setting:", error);
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  // Create new app setting
  app.post('/api/admin/settings', isAuthenticated, isAdmin, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settingData = { ...req.body, updatedBy: userId };
      
      const newSetting = await storage.createAppSetting(settingData);
      res.json(newSetting);
    } catch (error) {
      console.error("Error creating app setting:", error);
      res.status(500).json({ message: "Failed to create setting" });
    }
  });

  // Admin panel web interface
  app.get('/admin', isAuthenticated, async (req: any, res) => {
    const user = await storage.getUser(req.user.claims.sub);
    if (!user || user.userType !== 'admin') {
      return res.status(403).send('Admin access required');
    }

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>MarketPace Admin Panel</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f7fa;
            color: #333;
          }
          .header {
            background: #007AFF;
            color: white;
            padding: 20px;
            box-shadow: 0 2px 10px rgba(0,122,255,0.1);
          }
          .header h1 { font-size: 24px; font-weight: 600; }
          .header p { opacity: 0.9; margin-top: 5px; }
          
          .container { max-width: 1200px; margin: 0 auto; padding: 30px 20px; }
          
          .settings-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
          }
          
          .settings-card {
            background: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 2px 15px rgba(0,0,0,0.08);
            border: 1px solid #e1e8ed;
          }
          
          .settings-card h3 {
            color: #1a1a1a;
            margin-bottom: 15px;
            font-size: 18px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .setting-item {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid #f0f0f0;
          }
          
          .setting-item:last-child {
            border-bottom: none;
            margin-bottom: 0;
          }
          
          .setting-label {
            font-weight: 500;
            margin-bottom: 5px;
            color: #333;
          }
          
          .setting-description {
            font-size: 12px;
            color: #666;
            margin-bottom: 8px;
          }
          
          .setting-input {
            width: 100%;
            padding: 10px 12px;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
            background: #fff;
          }
          
          .setting-input:focus {
            outline: none;
            border-color: #007AFF;
            box-shadow: 0 0 0 3px rgba(0,122,255,0.1);
          }
          
          .btn {
            background: #007AFF;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: background 0.2s;
          }
          
          .btn:hover { background: #0056cc; }
          .btn-success { background: #34c759; }
          .btn-success:hover { background: #28a745; }
          
          .save-indicator {
            display: none;
            color: #34c759;
            font-size: 12px;
            margin-top: 5px;
          }
          
          .tabs {
            display: flex;
            gap: 5px;
            margin-bottom: 20px;
            border-bottom: 1px solid #e1e8ed;
          }
          
          .tab {
            padding: 10px 20px;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 14px;
            color: #666;
            border-bottom: 2px solid transparent;
          }
          
          .tab.active {
            color: #007AFF;
            border-bottom-color: #007AFF;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MarketPace Admin Panel</h1>
          <p>Manage app settings, pricing, and content</p>
        </div>
        
        <div class="container">
          <div class="tabs">
            <button class="tab active" onclick="showCategory('general')">General</button>
            <button class="tab" onclick="showCategory('pricing')">Pricing</button>
            <button class="tab" onclick="showCategory('driver')">Driver Settings</button>
            <button class="tab" onclick="showCategory('subscription')">Subscriptions</button>
            <button class="tab" onclick="showCategory('content')">Content</button>
          </div>
          
          <div id="settings-content">
            <p>Loading settings...</p>
          </div>
        </div>

        <script>
          let allSettings = [];
          
          async function loadSettings() {
            try {
              const response = await fetch('/api/admin/settings');
              allSettings = await response.json();
              showCategory('general');
            } catch (error) {
              console.error('Error loading settings:', error);
              document.getElementById('settings-content').innerHTML = '<p style="color: red;">Error loading settings</p>';
            }
          }
          
          function showCategory(category) {
            // Update active tab
            document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
            document.querySelector(\`[onclick="showCategory('\${category}')"]\`).classList.add('active');
            
            // Get settings for this category
            const categorySettings = allSettings.filter(s => s.category === category);
            
            if (categorySettings.length === 0) {
              // Show default settings for this category
              showDefaultSettings(category);
            } else {
              renderSettings(categorySettings, category);
            }
          }
          
          function showDefaultSettings(category) {
            const defaultSettings = getDefaultSettingsForCategory(category);
            const content = \`
              <div class="settings-card">
                <h3>\${getCategoryIcon(category)} \${getCategoryTitle(category)}</h3>
                \${defaultSettings.map(setting => \`
                  <div class="setting-item">
                    <div class="setting-label">\${setting.label}</div>
                    <div class="setting-description">\${setting.description}</div>
                    <input 
                      type="\${setting.type === 'number' ? 'number' : 'text'}" 
                      class="setting-input" 
                      value="\${setting.value}"
                      onchange="saveSetting('\${setting.key}', this.value, '\${setting.type}', '\${category}', '\${setting.label}', '\${setting.description}')"
                    >
                    <div class="save-indicator">Saved!</div>
                  </div>
                \`).join('')}
              </div>
            \`;
            document.getElementById('settings-content').innerHTML = content;
          }
          
          function renderSettings(settings, category) {
            const content = \`
              <div class="settings-card">
                <h3>\${getCategoryIcon(category)} \${getCategoryTitle(category)}</h3>
                \${settings.map(setting => \`
                  <div class="setting-item">
                    <div class="setting-label">\${setting.label}</div>
                    <div class="setting-description">\${setting.description}</div>
                    <input 
                      type="\${setting.type === 'number' ? 'number' : 'text'}" 
                      class="setting-input" 
                      value="\${setting.value}"
                      onchange="updateSetting('\${setting.key}', this.value)"
                    >
                    <div class="save-indicator">Saved!</div>
                  </div>
                \`).join('')}
              </div>
            \`;
            document.getElementById('settings-content').innerHTML = content;
          }
          
          async function updateSetting(key, value) {
            try {
              const response = await fetch(\`/api/admin/settings/\${key}\`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value })
              });
              
              if (response.ok) {
                showSaveIndicator();
                // Update local settings
                const setting = allSettings.find(s => s.key === key);
                if (setting) setting.value = value;
              }
            } catch (error) {
              console.error('Error updating setting:', error);
            }
          }
          
          async function saveSetting(key, value, type, category, label, description) {
            try {
              const response = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value, type, category, label, description })
              });
              
              if (response.ok) {
                showSaveIndicator();
                // Add to local settings
                const newSetting = await response.json();
                allSettings.push(newSetting);
              }
            } catch (error) {
              console.error('Error saving setting:', error);
            }
          }
          
          function showSaveIndicator() {
            const indicators = document.querySelectorAll('.save-indicator');
            indicators.forEach(indicator => {
              indicator.style.display = 'block';
              setTimeout(() => indicator.style.display = 'none', 2000);
            });
          }
          
          function getCategoryIcon(category) {
            const icons = {
              general: '⚙️',
              pricing: '💰',
              driver: '🚚',
              subscription: '💳',
              content: '📝'
            };
            return icons[category] || '📋';
          }
          
          function getCategoryTitle(category) {
            const titles = {
              general: 'General Settings',
              pricing: 'Pricing & Fees',
              driver: 'Driver Settings',
              subscription: 'Subscription Plans',
              content: 'App Content'
            };
            return titles[category] || 'Settings';
          }
          
          function getDefaultSettingsForCategory(category) {
            const defaults = {
              general: [
                { key: 'app_name', label: 'App Name', value: 'MarketPace', type: 'text', description: 'Display name of the application' },
                { key: 'app_tagline', label: 'App Tagline', value: 'Delivering Opportunities. Building Local Power.', type: 'text', description: 'Main tagline shown in the app' },
                { key: 'default_delivery_radius', label: 'Default Delivery Radius (miles)', value: '10', type: 'number', description: 'Default radius for delivery services' }
              ],
              pricing: [
                { key: 'delivery_fee_per_mile', label: 'Delivery Fee per Mile', value: '0.50', type: 'number', description: 'Amount charged per mile for delivery' },
                { key: 'platform_commission_rate', label: 'Platform Commission (%)', value: '5', type: 'number', description: 'Percentage commission taken from sales' },
                { key: 'minimum_order_amount', label: 'Minimum Order Amount', value: '10.00', type: 'number', description: 'Minimum amount required for orders' }
              ],
              driver: [
                { key: 'driver_pickup_fee', label: 'Driver Pickup Fee', value: '4.00', type: 'number', description: 'Amount paid to driver for each pickup' },
                { key: 'driver_dropoff_fee', label: 'Driver Drop-off Fee', value: '2.00', type: 'number', description: 'Amount paid to driver for each drop-off' },
                { key: 'driver_fee_per_mile', label: 'Driver Fee per Mile', value: '0.50', type: 'number', description: 'Amount paid to driver per mile' },
                { key: 'max_deliveries_per_route', label: 'Max Deliveries per Route', value: '6', type: 'number', description: 'Maximum number of deliveries per route' }
              ],
              subscription: [
                { key: 'silver_monthly_price', label: 'Silver Plan Monthly Price', value: '15.00', type: 'number', description: 'Monthly price for Silver membership' },
                { key: 'gold_monthly_price', label: 'Gold Plan Monthly Price', value: '25.00', type: 'number', description: 'Monthly price for Gold membership' },
                { key: 'platinum_monthly_price', label: 'Platinum Plan Monthly Price', value: '50.00', type: 'number', description: 'Monthly price for Platinum membership' }
              ],
              content: [
                { key: 'welcome_message', label: 'Welcome Message', value: 'Welcome to MarketPace! Start buying, selling, and earning in your community.', type: 'text', description: 'Message shown to new users' },
                { key: 'driver_application_message', label: 'Driver Application Message', value: 'Join our driver network and start earning today!', type: 'text', description: 'Message shown on driver application page' }
              ]
            };
            return defaults[category] || [];
          }
          
          // Load settings when page loads
          loadSettings();
        </script>
      </body>
      </html>
    `);
  });

  // Check authentication status
  app.get('/api/auth-status', (req, res) => {
    const isLoggedIn = req.isAuthenticated();
    const user = req.user as any;
    res.json({ 
      isAuthenticated: isLoggedIn,
      user: isLoggedIn ? { 
        id: user?.claims?.sub, 
        email: user?.claims?.email,
        name: user?.claims?.name 
      } : null 
    });
  });

  // Make current user admin (for initial setup)
  app.post('/api/make-admin', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.updateUserProfile(userId, { userType: 'admin' });
      res.json({ message: 'User successfully promoted to admin', userId });
    } catch (error) {
      console.error("Error making user admin:", error);
      res.status(500).json({ message: "Failed to make user admin" });
    }
  });

  // Health check route
  app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'MarketPace API is running' });
  });

  // Root route for web access
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>MarketPace</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          h1 { color: #007AFF; margin-bottom: 20px; }
          .status { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .admin-panel { background: #007AFF; color: white; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; }
          .admin-panel a { color: white; text-decoration: none; font-weight: bold; }
          .admin-panel a:hover { text-decoration: underline; }
          .endpoints { background: #f8f9fa; padding: 20px; border-radius: 5px; }
          .endpoint { margin: 10px 0; font-family: monospace; }
          a { color: #007AFF; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>🚀 MarketPace API</h1>
          <div class="status">
            <strong>✅ Server Status:</strong> Running successfully on port ${process.env.PORT || 5000}
          </div>
          
          <div class="admin-panel">
            <h3>🛠 Admin Panel</h3>
            <p>Manage app settings, pricing, and content without coding</p>
            <a href="/admin">Access Admin Panel</a>
            <br><br>
            <div style="margin-top: 15px;">
              <button onclick="makeAdmin()" style="background: #FFD700; color: #333; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; font-weight: bold;">Make Me Admin</button>
              <button onclick="login()" style="background: #28a745; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer; margin-left: 10px;">Login with Replit</button>
            </div>
            <small style="display: block; margin-top: 10px;">First login, then click "Make Me Admin" to get admin access.</small>
          </div>
          
          <p>Welcome to MarketPace - a marketplace delivery service platform similar to "Facebook Marketplace meets Uber Eats".</p>
          
          <h3>📱 Mobile App</h3>
          <p>This is the backend API for the MarketPace React Native mobile application. The mobile app provides:</p>
          <ul>
            <li>Marketplace for buying and selling items</li>
            <li>On-demand delivery services</li>
            <li>Driver applications and route management</li>
            <li>Community features and posts</li>
            <li>Stripe payment integration</li>
          </ul>

          <h3>🔗 API Endpoints</h3>
          <div class="endpoints">
            <div class="endpoint"><a href="/health">GET /health</a> - Server health check</div>
            <div class="endpoint"><a href="/api/categories">GET /api/categories</a> - Available categories</div>
            <div class="endpoint">GET /api/listings - Marketplace listings</div>
            <div class="endpoint">POST /api/auth/login - User authentication</div>
            <div class="endpoint">GET /api/community-posts - Community posts</div>
            <div class="endpoint">POST /api/orders - Create orders</div>
          </div>

          <h3>🛠 Development</h3>
          <p>Database: PostgreSQL with ${Object.keys(process.env).filter(k => k.includes('DATABASE')).length > 0 ? '✅ Connected' : '❌ Not Connected'}</p>
          <p>Stripe: ${process.env.STRIPE_SECRET_KEY ? '✅ Configured' : '❌ Not Configured'}</p>
        </div>
        
        <script>
          let isLoggedIn = false;
          let currentUser = null;

          // Check authentication status on page load
          async function checkAuthStatus() {
            try {
              const response = await fetch('/api/auth-status');
              const authData = await response.json();
              isLoggedIn = authData.isAuthenticated;
              currentUser = authData.user;
              updateUI();
            } catch (error) {
              console.log('Auth check failed:', error);
              updateUI();
            }
          }

          function updateUI() {
            const loginBtn = document.querySelector('[onclick="login()"]');
            const makeAdminBtn = document.querySelector('[onclick="makeAdmin()"]');
            const adminLink = document.querySelector('a[href="/admin"]');
            
            if (isLoggedIn && currentUser) {
              loginBtn.innerText = \`Logged in as \${currentUser.name || currentUser.email}\`;
              loginBtn.style.background = '#28a745';
              loginBtn.onclick = logout;
              makeAdminBtn.style.display = 'inline-block';
              adminLink.style.background = '#007AFF';
              adminLink.style.color = 'white';
              adminLink.style.padding = '8px 16px';
              adminLink.style.borderRadius = '4px';
              adminLink.style.textDecoration = 'none';
            } else {
              loginBtn.innerText = 'Login with Replit';
              loginBtn.style.background = '#28a745';
              makeAdminBtn.style.display = 'none';
            }
          }
          
          function login() {
            window.location.href = '/api/login';
          }

          function logout() {
            window.location.href = '/api/logout';
          }
          
          async function makeAdmin() {
            const makeAdminBtn = document.querySelector('[onclick="makeAdmin()"]');
            try {
              const response = await fetch('/api/make-admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              });
              
              if (response.ok) {
                const result = await response.json();
                alert('Success! You are now an admin. You can access the admin panel.');
                makeAdminBtn.innerText = 'Admin Access Granted ✓';
                makeAdminBtn.style.background = '#28a745';
                makeAdminBtn.disabled = true;
              } else {
                const error = await response.json();
                alert('Error: ' + error.message);
              }
            } catch (error) {
              alert('Error: Please login first by clicking "Login with Replit"');
            }
          }

          // Check auth status when page loads
          checkAuthStatus();
        </script>
      </body>
      </html>
    `);
  });

  // ============ DATA COLLECTION & ANALYTICS ENDPOINTS ============

  // User behavior tracking
  app.post('/api/track/behavior', async (req, res) => {
    try {
      const { eventType, page, element, data, sessionId } = req.body;
      const userId = req.user?.claims?.sub;

      if (!userId) {
        return res.status(401).json({ message: 'User must be logged in to track behavior' });
      }

      const behavior = await storage.trackUserBehavior({
        userId,
        sessionId,
        eventType,
        page,
        element,
        data,
        timestamp: new Date(),
      });

      res.json(behavior);
    } catch (error) {
      console.error('Error tracking behavior:', error);
      res.status(500).json({ message: 'Failed to track behavior' });
    }
  });

  // User session management
  app.post('/api/track/session', async (req, res) => {
    try {
      const { sessionId, deviceType, browser, location } = req.body;
      const userId = req.user?.claims?.sub;

      if (!userId) {
        return res.status(401).json({ message: 'User must be logged in' });
      }

      const session = await storage.createUserSession({
        userId,
        sessionId,
        deviceType,
        browser,
        location,
        startTime: new Date(),
      });

      res.json(session);
    } catch (error) {
      console.error('Error creating session:', error);
      res.status(500).json({ message: 'Failed to create session' });
    }
  });

  // Search tracking
  app.post('/api/track/search', async (req, res) => {
    try {
      const { query, category, resultsShown, timeSpent } = req.body;
      const userId = req.user?.claims?.sub;

      if (!userId) {
        return res.status(401).json({ message: 'User must be logged in' });
      }

      const search = await storage.trackSearch({
        userId,
        query,
        category,
        resultsShown,
        timeSpent,
        timestamp: new Date(),
      });

      res.json(search);
    } catch (error) {
      console.error('Error tracking search:', error);
      res.status(500).json({ message: 'Failed to track search' });
    }
  });

  // Purchase tracking
  app.post('/api/track/purchase', async (req, res) => {
    try {
      const { orderId, category, subcategory, priceRange } = req.body;
      const userId = req.user?.claims?.sub;

      if (!userId) {
        return res.status(401).json({ message: 'User must be logged in' });
      }

      const purchase = await storage.trackPurchase({
        userId,
        orderId,
        category,
        subcategory,
        priceRange,
        dayOfWeek: new Date().getDay(),
        hourOfDay: new Date().getHours(),
        timestamp: new Date(),
      });

      res.json(purchase);
    } catch (error) {
      console.error('Error tracking purchase:', error);
      res.status(500).json({ message: 'Failed to track purchase' });
    }
  });

  // Get user analytics data for business profiles
  app.get('/api/analytics/user/:userId', isAuthenticated, async (req, res) => {
    try {
      const { userId } = req.params;
      const requestingUserId = req.user?.claims?.sub;

      // Only allow businesses to access user analytics or users to access their own
      if (requestingUserId !== userId && req.user?.claims?.userType !== 'business') {
        return res.status(403).json({ message: 'Access denied' });
      }

      const [interests, behavior, sessions, searches, purchases] = await Promise.all([
        storage.getUserInterests(userId),
        storage.getUserBehavior(userId, { 
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          end: new Date() 
        }),
        storage.getUserSessions(userId, 10),
        storage.getSearchHistory(userId),
        storage.getPurchaseHistory(userId),
      ]);

      res.json({
        interests,
        recentBehavior: behavior.slice(0, 100),
        sessions: sessions.slice(0, 10),
        searches: searches.slice(0, 50),
        purchases: purchases.slice(0, 20),
      });
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      res.status(500).json({ message: 'Failed to fetch analytics' });
    }
  });

  // ============ FACEBOOK-STYLE ADVERTISING ENDPOINTS ============

  // Create advertising campaign
  app.post('/api/advertising/campaigns', isAuthenticated, async (req, res) => {
    try {
      const {
        name,
        objective,
        type,
        dailyBudget,
        lifetimeBudget,
        targeting,
        schedule
      } = req.body;
      
      const businessId = req.user?.claims?.sub;

      if (!businessId) {
        return res.status(401).json({ message: 'Business account required' });
      }

      const campaign = await storage.createAdCampaign({
        businessId,
        name,
        objective,
        type,
        dailyBudget,
        lifetimeBudget,
        targeting,
        schedule,
        status: 'draft',
      });

      res.json(campaign);
    } catch (error) {
      console.error('Error creating campaign:', error);
      res.status(500).json({ message: 'Failed to create campaign' });
    }
  });

  // Get business campaigns
  app.get('/api/advertising/campaigns', isAuthenticated, async (req, res) => {
    try {
      const businessId = req.user?.claims?.sub;
      const campaigns = await storage.getAdCampaigns(businessId!);
      res.json(campaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      res.status(500).json({ message: 'Failed to fetch campaigns' });
    }
  });

  // Update campaign
  app.put('/api/advertising/campaigns/:id', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const campaign = await storage.updateAdCampaign(parseInt(id), updates);
      res.json(campaign);
    } catch (error) {
      console.error('Error updating campaign:', error);
      res.status(500).json({ message: 'Failed to update campaign' });
    }
  });

  // Create ad creative
  app.post('/api/advertising/campaigns/:campaignId/creatives', isAuthenticated, async (req, res) => {
    try {
      const { campaignId } = req.params;
      const {
        name,
        format,
        headline,
        primaryText,
        description,
        callToAction,
        mediaUrls,
        linkUrl
      } = req.body;

      const creative = await storage.createAdCreative({
        campaignId: parseInt(campaignId),
        name,
        format,
        headline,
        primaryText,
        description,
        callToAction,
        mediaUrls,
        linkUrl,
      });

      res.json(creative);
    } catch (error) {
      console.error('Error creating creative:', error);
      res.status(500).json({ message: 'Failed to create creative' });
    }
  });

  // Get campaign creatives
  app.get('/api/advertising/campaigns/:campaignId/creatives', isAuthenticated, async (req, res) => {
    try {
      const { campaignId } = req.params;
      const creatives = await storage.getAdCreatives(parseInt(campaignId));
      res.json(creatives);
    } catch (error) {
      console.error('Error fetching creatives:', error);
      res.status(500).json({ message: 'Failed to fetch creatives' });
    }
  });

  // Audience estimation (Facebook-style)
  app.post('/api/advertising/audience/estimate', isAuthenticated, async (req, res) => {
    try {
      const { targeting } = req.body;
      
      const estimatedSize = await storage.calculateAudienceSize(targeting);
      const potentialReach = Math.floor(estimatedSize * 0.8); // 80% reach rate
      
      res.json({
        estimatedSize,
        potentialReach,
        targeting,
        costEstimate: {
          dailyMin: potentialReach * 0.01, // $0.01 per impression
          dailyMax: potentialReach * 0.05, // $0.05 per impression
        }
      });
    } catch (error) {
      console.error('Error estimating audience:', error);
      res.status(500).json({ message: 'Failed to estimate audience' });
    }
  });

  // Create custom audience segment
  app.post('/api/advertising/audiences', isAuthenticated, async (req, res) => {
    try {
      const { name, description, criteria, type } = req.body;
      const businessId = req.user?.claims?.sub;

      const segment = await storage.createAudienceSegment({
        businessId: businessId!,
        name,
        description,
        criteria,
        type: type || 'custom',
      });

      res.json(segment);
    } catch (error) {
      console.error('Error creating audience segment:', error);
      res.status(500).json({ message: 'Failed to create audience segment' });
    }
  });

  // Get business audience segments
  app.get('/api/advertising/audiences', isAuthenticated, async (req, res) => {
    try {
      const businessId = req.user?.claims?.sub;
      const segments = await storage.getAudienceSegments(businessId!);
      res.json(segments);
    } catch (error) {
      console.error('Error fetching audience segments:', error);
      res.status(500).json({ message: 'Failed to fetch audience segments' });
    }
  });

  // Generate lookalike audience
  app.post('/api/advertising/audiences/:id/lookalike', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { size = 1000 } = req.body;
      
      const lookalikeAudience = await storage.generateLookalikeAudience(parseInt(id), size);
      res.json(lookalikeAudience);
    } catch (error) {
      console.error('Error generating lookalike audience:', error);
      res.status(500).json({ message: 'Failed to generate lookalike audience' });
    }
  });

  // Campaign performance metrics
  app.get('/api/advertising/campaigns/:id/performance', isAuthenticated, async (req, res) => {
    try {
      const { id } = req.params;
      const { startDate, endDate } = req.query;
      
      const dateRange = startDate && endDate ? {
        start: new Date(startDate as string),
        end: new Date(endDate as string)
      } : undefined;
      
      const metrics = await storage.getAdPerformanceMetrics(parseInt(id), dateRange);
      res.json(metrics);
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      res.status(500).json({ message: 'Failed to fetch performance metrics' });
    }
  });

  // Record ad impression (for internal ad serving)
  app.post('/api/advertising/impression', async (req, res) => {
    try {
      const { campaignId, creativeId, userId, placement, cost } = req.body;
      
      const impression = await storage.recordAdImpression({
        campaignId,
        creativeId,
        userId,
        placement,
        cost: cost || 0.001, // Default CPM
        timestamp: new Date(),
      });

      res.json(impression);
    } catch (error) {
      console.error('Error recording impression:', error);
      res.status(500).json({ message: 'Failed to record impression' });
    }
  });

  // Record ad click
  app.post('/api/advertising/click', async (req, res) => {
    try {
      const { impressionId, campaignId, creativeId, userId, clickType, cost } = req.body;
      
      const click = await storage.recordAdClick({
        impressionId,
        campaignId,
        creativeId,
        userId,
        clickType: clickType || 'link_click',
        cost: cost || 0.25, // Default CPC
        timestamp: new Date(),
      });

      res.json(click);
    } catch (error) {
      console.error('Error recording click:', error);
      res.status(500).json({ message: 'Failed to record click' });
    }
  });

  // Record ad conversion
  app.post('/api/advertising/conversion', async (req, res) => {
    try {
      const { campaignId, clickId, userId, conversionType, value } = req.body;
      
      const conversion = await storage.recordAdConversion({
        campaignId,
        clickId,
        userId,
        conversionType,
        value: value || 0,
        timestamp: new Date(),
      });

      res.json(conversion);
    } catch (error) {
      console.error('Error recording conversion:', error);
      res.status(500).json({ message: 'Failed to record conversion' });
    }
  });

  // Privacy settings management
  app.get('/api/privacy/settings', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const settings = await storage.getPrivacySettings(userId!);
      
      // Default privacy settings if none exist
      const defaultSettings = {
        allowDataCollection: true,
        allowTargetedAds: true,
        allowDataSharing: false,
        allowLocationTracking: true,
        allowBehaviorTracking: true,
        allowCrossDeviceTracking: true,
        allowThirdPartyData: false,
        dataRetentionPeriod: 730,
      };

      res.json(settings || defaultSettings);
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
      res.status(500).json({ message: 'Failed to fetch privacy settings' });
    }
  });

  app.put('/api/privacy/settings', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      const settings = await storage.updatePrivacySettings(userId!, req.body);
      res.json(settings);
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      res.status(500).json({ message: 'Failed to update privacy settings' });
    }
  });

  // Data export (GDPR compliance)
  app.get('/api/privacy/export', isAuthenticated, async (req, res) => {
    try {
      const userId = req.user?.claims?.sub;
      
      const [user, interests, behavior, sessions, searches, purchases, connections] = await Promise.all([
        storage.getUser(userId!),
        storage.getUserInterests(userId!),
        storage.getUserBehavior(userId!),
        storage.getUserSessions(userId!),
        storage.getSearchHistory(userId!),
        storage.getPurchaseHistory(userId!),
        storage.getUserConnections(userId!),
      ]);

      const exportData = {
        user,
        interests,
        behavior,
        sessions,
        searches,
        purchases,
        connections,
        exportedAt: new Date(),
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="marketpace-data-${userId}.json"`);
      res.json(exportData);
    } catch (error) {
      console.error('Error exporting data:', error);
      res.status(500).json({ message: 'Failed to export data' });
    }
  });

  // Revenue system routes
  app.use('/api/revenue', revenueRoutes);

  // Driver application routes
  registerDriverRoutes(app);

  // Password recovery routes
  registerPasswordRecoveryRoutes(app);

  // Subscription routes
  const { registerSubscriptionRoutes } = await import('./subscriptionRoutes.js');
  registerSubscriptionRoutes(app);

  // Enhanced delivery system test routes
  app.post('/api/delivery/calculate-fee', async (req, res) => {
    try {
      const { itemSize, vehicleType, distance, tip } = req.body;
      
      const { calculateEnhancedDeliveryFee } = await import('./revenue.js');
      const result = calculateEnhancedDeliveryFee(itemSize, vehicleType, distance || 5, tip || 0);
      
      res.json({
        success: true,
        calculation: result
      });
    } catch (error) {
      console.error('Delivery fee calculation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to calculate delivery fee'
      });
    }
  });

  app.post('/api/delivery/create-route', async (req, res) => {
    try {
      const { driverId } = req.body;
      
      const { DeliveryRouteManager } = await import('./revenue.js');
      const routeId = DeliveryRouteManager.createRoute(driverId);
      
      res.json({
        success: true,
        routeId,
        message: 'Route created successfully'
      });
    } catch (error) {
      console.error('Route creation error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create route'
      });
    }
  });

  app.post('/api/delivery/add-item', async (req, res) => {
    try {
      const { routeId, item } = req.body;
      
      const { DeliveryRouteManager } = await import('./revenue.js');
      const result = DeliveryRouteManager.addItemToRoute(routeId, item);
      
      res.json({
        success: result.success,
        message: result.message,
        route: result.route
      });
    } catch (error) {
      console.error('Add item to route error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add item to route'
      });
    }
  });

  // Temporarily disabled problematic integrations causing routing errors
  // registerIntegrationRoutes(app);
  
  // Setup Shopify Business Integration Routes
  setupShopifyBusinessRoutes(app);
  // registerScammerProtectionRoutes(app);

  // Facebook API integration routes
  app.post('/api/facebook/connect', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { accessToken } = req.body;
      
      if (!accessToken) {
        return res.status(400).json({ error: 'Access token is required' });
      }
      
      // Get user's Facebook pages
      const pagesResponse = await facebookAPI.getUserPages(accessToken);
      
      if (pagesResponse.error) {
        return res.status(400).json({ error: pagesResponse.error.message });
      }
      
      // Save Facebook connection to user profile
      await storage.updateUserProfile(userId, {
        facebookConnected: true,
        facebookAccessToken: accessToken,
        facebookPages: pagesResponse.data?.data || []
      });
      
      res.json({ 
        success: true, 
        pages: pagesResponse.data?.data || [],
        message: 'Facebook account connected successfully' 
      });
    } catch (error) {
      console.error('Facebook connect error:', error);
      res.status(500).json({ error: 'Failed to connect Facebook account' });
    }
  });

  app.post('/api/facebook/post', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { pageId, message, link } = req.body;
      
      const user = await storage.getUser(userId);
      if (!user?.facebookAccessToken) {
        return res.status(401).json({ error: 'Facebook not connected' });
      }
      
      const postResponse = await facebookAPI.postToPage(
        pageId, 
        user.facebookAccessToken, 
        message, 
        link
      );
      
      if (postResponse.error) {
        return res.status(400).json({ error: postResponse.error.message });
      }
      
      res.json({ 
        success: true, 
        postId: postResponse.data?.id,
        message: 'Post created successfully' 
      });
    } catch (error) {
      console.error('Facebook post error:', error);
      res.status(500).json({ error: 'Failed to create Facebook post' });
    }
  });

  app.get('/api/facebook/pages', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user?.facebookAccessToken) {
        return res.status(401).json({ error: 'Facebook not connected' });
      }
      
      const pagesResponse = await facebookAPI.getUserPages(user.facebookAccessToken);
      
      if (pagesResponse.error) {
        return res.status(400).json({ error: pagesResponse.error.message });
      }
      
      res.json({ pages: pagesResponse.data?.data || [] });
    } catch (error) {
      console.error('Facebook pages error:', error);
      res.status(500).json({ error: 'Failed to fetch Facebook pages' });
    }
  });

  app.get('/api/facebook/conversations/:pageId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { pageId } = req.params;
      
      const user = await storage.getUser(userId);
      if (!user?.facebookAccessToken) {
        return res.status(401).json({ error: 'Facebook not connected' });
      }
      
      const conversationsResponse = await facebookAPI.getPageConversations(
        pageId, 
        user.facebookAccessToken
      );
      
      if (conversationsResponse.error) {
        return res.status(400).json({ error: conversationsResponse.error.message });
      }
      
      res.json({ conversations: conversationsResponse.data?.data || [] });
    } catch (error) {
      console.error('Facebook conversations error:', error);
      res.status(500).json({ error: 'Failed to fetch conversations' });
    }
  });

  // Facebook Webhook Verification (GET request)
  app.get('/api/facebook/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    
    // Verify the webhook with your verify token
    const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN || 'marketpace_webhook_token';
    
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Facebook webhook verified successfully');
      res.status(200).send(challenge);
    } else {
      console.log('Failed to verify Facebook webhook');
      res.status(403).send('Forbidden');
    }
  });

  // Facebook Webhook Handler (POST request)
  app.post('/api/facebook/webhook', async (req, res) => {
    try {
      const body = req.body;
      
      // Verify webhook signature
      const signature = req.headers['x-hub-signature-256'];
      
      if (body.object === 'page') {
        body.entry.forEach(async (entry: any) => {
          const webhookEvent = entry.messaging?.[0];
          
          if (webhookEvent && webhookEvent.message) {
            // Handle incoming Facebook message
            const senderId = webhookEvent.sender.id;
            const messageText = webhookEvent.message.text;
            
            // Check if message contains "Is this still available?"
            if (messageText?.toLowerCase().includes('still available')) {
              const pageId = entry.id;
              const autoReply = "Thanks for your interest! This item is still available. You can get it delivered through MarketPace at https://marketpace.shop - just search for the item and we'll deliver it right to you!";
              
              // Send auto-reply
              await facebookAPI.sendMessage(pageId, process.env.FACEBOOK_PAGE_ACCESS_TOKEN!, senderId, autoReply);
            }
          }
        });
      }
      
      res.status(200).send('EVENT_RECEIVED');
    } catch (error) {
      console.error('Facebook webhook error:', error);
      res.status(500).send('Webhook error');
    }
  });

  // Temporarily disabled problematic Facebook routes causing routing errors
  // registerFacebookRoutes(app);

  const httpServer = createServer(app);
  return httpServer;
}
