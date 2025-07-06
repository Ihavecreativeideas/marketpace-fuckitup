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
      </body>
      </html>
    `);
  });

  const httpServer = createServer(app);
  return httpServer;
}
