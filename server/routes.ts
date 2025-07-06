import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { storage } from "./storage";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

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

  // Driver application routes
  app.post('/api/driver-application', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const applicationData = { ...req.body, userId };
      const application = await storage.submitDriverApplication(applicationData);
      res.json(application);
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

  // Payment routes
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
          function login() {
            window.location.href = '/auth/login';
          }
          
          async function makeAdmin() {
            try {
              const response = await fetch('/api/make-admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
              });
              
              if (response.ok) {
                const result = await response.json();
                alert('Success! You are now an admin. You can access the admin panel.');
              } else {
                const error = await response.json();
                alert('Error: ' + error.message + '\\n\\nPlease login first by clicking "Login with Replit"');
              }
            } catch (error) {
              alert('Error: Please login first by clicking "Login with Replit"');
            }
          }
        </script>
      </body>
      </html>
    `);
  });

  const httpServer = createServer(app);
  return httpServer;
}
