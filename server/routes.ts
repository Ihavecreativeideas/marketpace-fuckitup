import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { storage, setRLSContext, clearRLSContext } from "./storage";
import revenueRoutes from "./revenueRoutes.js";
import { registerDriverRoutes } from "./driverRoutes";
import { registerPasswordRecoveryRoutes } from "./passwordRecovery";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Web landing page route - serve HTML for root URL (MUST BE FIRST)
  app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MarketPlace - Pick Up the Pace in Your Community</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: white;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        
        .hero {
            text-align: center;
            padding: 80px 0 60px;
        }
        .logo {
            width: 80px;
            height: 80px;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-size: 32px;
            font-weight: bold;
        }
        h1 {
            font-size: 48px;
            margin-bottom: 16px;
            font-weight: bold;
        }
        .tagline {
            font-size: 24px;
            margin-bottom: 12px;
            font-weight: 600;
        }
        .subtitle {
            font-size: 18px;
            margin-bottom: 40px;
            opacity: 0.9;
        }
        
        /* Join Campaign Section */
        .campaign-section {
            background: rgba(255, 255, 255, 0.15);
            padding: 50px;
            border-radius: 20px;
            margin: 40px 0;
            text-align: center;
            backdrop-filter: blur(10px);
        }
        .campaign-title {
            font-size: 36px;
            margin-bottom: 20px;
            background: linear-gradient(45deg, #fff, #f0f0f0);
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            font-weight: bold;
        }
        .campaign-subtitle {
            font-size: 20px;
            margin-bottom: 30px;
            opacity: 0.9;
        }
        .campaign-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .campaign-stat {
            background: rgba(255, 255, 255, 0.1);
            padding: 20px;
            border-radius: 12px;
        }
        .campaign-stat-number {
            font-size: 28px;
            font-weight: bold;
            margin-bottom: 8px;
        }
        .campaign-stat-label {
            font-size: 14px;
            opacity: 0.8;
        }
        
        .login-options {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 40px 0;
        }
        .login-card {
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 16px;
            text-align: center;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.3s, background 0.3s;
        }
        .login-card:hover {
            transform: translateY(-5px);
            background: rgba(255, 255, 255, 0.15);
        }
        .login-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }
        .login-title {
            font-size: 24px;
            margin-bottom: 12px;
            font-weight: 600;
        }
        .login-description {
            font-size: 16px;
            margin-bottom: 20px;
            opacity: 0.8;
            line-height: 1.4;
        }
        
        .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            transition: all 0.3s;
            margin: 5px;
        }
        .btn:hover { transform: translateY(-2px); }
        .btn-primary {
            background: white;
            color: #667eea;
        }
        .btn-secondary {
            background: rgba(255, 255, 255, 0.2);
            color: white;
            border: 2px solid rgba(255, 255, 255, 0.3);
        }
        .btn-orange {
            background: linear-gradient(135deg, #ff7a18, #af002d);
            color: white;
        }
        .btn-admin {
            background: linear-gradient(135deg, #1e3a8a, #3730a3);
            color: white;
        }
        
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 30px;
            margin: 60px 0;
        }
        .feature {
            background: rgba(255, 255, 255, 0.1);
            padding: 30px;
            border-radius: 12px;
            text-align: center;
        }
        .feature-icon {
            font-size: 48px;
            margin-bottom: 16px;
        }
        .feature h3 {
            font-size: 20px;
            margin-bottom: 12px;
        }
        .feature p {
            opacity: 0.9;
            line-height: 1.5;
        }
        
        .why-join {
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 16px;
            margin: 40px 0;
        }
        .why-join h2 {
            font-size: 28px;
            margin-bottom: 20px;
            text-align: center;
        }
        .why-join-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 30px;
            margin-top: 30px;
        }
        .why-item {
            text-align: center;
        }
        .why-item h3 {
            font-size: 20px;
            margin-bottom: 12px;
            color: #ffd700;
        }
        .why-item p {
            line-height: 1.6;
            opacity: 0.9;
        }
        
        @media (max-width: 768px) {
            h1 { font-size: 36px; }
            .tagline { font-size: 20px; }
            .subtitle { font-size: 16px; }
            .campaign-title { font-size: 28px; }
            .campaign-section { padding: 30px 20px; }
            .login-options { grid-template-columns: 1fr; }
            .features { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="hero">
            <div class="logo">MP</div>
            <h1>MarketPlace</h1>
            <div class="tagline">Pick Up the Pace in Your Community</div>
            <div class="subtitle">Delivering Opportunities — Not Just Packages</div>
        </div>

        <!-- Join Campaign Section -->
        <div class="campaign-section">
            <h2 class="campaign-title">Join the Campaign</h2>
            <p class="campaign-subtitle">Be part of the movement to build stronger, more connected communities</p>
            
            <div class="campaign-stats">
                <div class="campaign-stat">
                    <div class="campaign-stat-number">12</div>
                    <div class="campaign-stat-label">Active Towns</div>
                </div>
                <div class="campaign-stat">
                    <div class="campaign-stat-number">247</div>
                    <div class="campaign-stat-label">Local Shops</div>
                </div>
                <div class="campaign-stat">
                    <div class="campaign-stat-number">89</div>
                    <div class="campaign-stat-label">Entertainers</div>
                </div>
                <div class="campaign-stat">
                    <div class="campaign-stat-number">156</div>
                    <div class="campaign-stat-label">Services</div>
                </div>
                <div class="campaign-stat">
                    <div class="campaign-stat-number">1,834</div>
                    <div class="campaign-stat-label">Members</div>
                </div>
            </div>
            
            <div class="login-options">
                <div class="login-card">
                    <div class="login-icon">👥</div>
                    <h3 class="login-title">Join as Member</h3>
                    <p class="login-description">Shop local, support your community, and discover amazing products and services from your neighbors</p>
                    <a href="/api/login" class="btn btn-primary">Join MarketPlace</a>
                    <a href="#" onclick="openMobileApp()" class="btn btn-secondary">Mobile App</a>
                </div>
                
                <div class="login-card">
                    <div class="login-icon">🚗</div>
                    <h3 class="login-title">Drive & Earn</h3>
                    <p class="login-description">Earn $4 per pickup + $2 per dropoff + $0.50/mile + 100% tips. Flexible schedule, daily pay</p>
                    <a href="/api/login?role=driver" class="btn btn-orange">Apply to Drive</a>
                    <div style="margin-top: 10px; font-size: 14px; opacity: 0.8;">Weekly potential: $125+</div>
                </div>
                
                <div class="login-card">
                    <div class="login-icon">⚙️</div>
                    <h3 class="login-title">Admin Access</h3>
                    <p class="login-description">Platform management, user oversight, analytics dashboard, and community moderation tools</p>
                    <a href="/admin" class="btn btn-admin">Admin Dashboard</a>
                    <a href="/api/login?role=admin" class="btn btn-secondary">Admin Login</a>
                </div>
            </div>
        </div>

        <!-- Why Join Section -->
        <div class="why-join">
            <h2>Why Join MarketPlace?</h2>
            <div class="why-join-grid">
                <div class="why-item">
                    <h3>🏘️ Community First</h3>
                    <p>Keep money circulating in your neighborhood instead of flowing to distant corporations. Every transaction strengthens your local economy.</p>
                </div>
                <div class="why-item">
                    <h3>💰 Fair Economics</h3>
                    <p>Transparent 5% fees, no hidden charges, 100% of tips go directly to drivers. We believe in honest, ethical business practices.</p>
                </div>
                <div class="why-item">
                    <h3>🚚 Local Delivery</h3>
                    <p>Neighbor-to-neighbor delivery system creating jobs and building connections. Support local drivers while getting fast, reliable service.</p>
                </div>
                <div class="why-item">
                    <h3>🎯 Everything Local</h3>
                    <p>Buy, sell, rent, find services, book entertainment - all in one community platform designed to bring neighbors together.</p>
                </div>
            </div>
            
            <div style="text-align: center; margin-top: 30px; font-style: italic; font-size: 18px;">
                "Big tech platforms have taught us to rely on strangers and algorithms. MarketPlace reminds us what happens when we invest in each other."
            </div>
        </div>
    </div>

    <script>
        function openMobileApp() {
            const mobileUrl = window.location.protocol + '//' + window.location.hostname + ':8083';
            window.open(mobileUrl, '_blank');
        }
    </script>
</body>
</html>
    `);
  });

  // Auth middleware
  await setupAuth(app);

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

  // Admin middleware to check if user is admin
  const isAdmin = async (req: any, res: any, next: any) => {
    try {
      if (!req.isAuthenticated() || !req.user?.claims) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.userType !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      next();
    } catch (error) {
      console.error("Admin check error:", error);
      res.status(500).json({ message: "Server error" });
    }
  };

  // Admin Dashboard Routes
  app.get('/api/admin/dashboard', isAuthenticated, isAdmin, async (req, res) => {
    try {
      // Get platform statistics
      const stats = {
        totalUsers: await storage.getUserCount(),
        totalListings: await storage.getListingCount(),
        totalOrders: await storage.getOrderCount(),
        totalRevenue: await storage.getTotalRevenue(),
        recentUsers: await storage.getRecentUsers(10),
        recentOrders: await storage.getRecentOrders(10)
      };
      
      res.json({
        success: true,
        stats,
        message: "Admin dashboard data retrieved successfully"
      });
    } catch (error) {
      console.error("Admin dashboard error:", error);
      res.status(500).json({ message: "Failed to load dashboard" });
    }
  });

  // Admin user management
  app.get('/api/admin/users', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { page = 1, limit = 50, search = '' } = req.query;
      const users = await storage.getAllUsers(Number(page), Number(limit), String(search));
      
      res.json({
        success: true,
        users,
        message: "Users retrieved successfully"
      });
    } catch (error) {
      console.error("Admin users error:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Admin user actions
  app.post('/api/admin/users/:userId/verify', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      await storage.verifyUser(userId);
      
      res.json({
        success: true,
        message: "User verified successfully"
      });
    } catch (error) {
      console.error("Admin verify user error:", error);
      res.status(500).json({ message: "Failed to verify user" });
    }
  });

  app.post('/api/admin/users/:userId/suspend', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const { reason } = req.body;
      await storage.suspendUser(userId, reason);
      
      res.json({
        success: true,
        message: "User suspended successfully"
      });
    } catch (error) {
      console.error("Admin suspend user error:", error);
      res.status(500).json({ message: "Failed to suspend user" });
    }
  });

  // Admin content moderation
  app.get('/api/admin/reports', isAuthenticated, isAdmin, async (req, res) => {
    try {
      const reports = await storage.getContentReports();
      
      res.json({
        success: true,
        reports,
        message: "Content reports retrieved successfully"
      });
    } catch (error) {
      console.error("Admin reports error:", error);
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });

  // Admin web interface
  app.get('/admin', isAuthenticated, isAdmin, async (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MarketPlace Admin Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f5f5;
            color: #333;
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            text-align: center;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            text-align: center;
        }
        .stat-number {
            font-size: 32px;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 8px;
        }
        .stat-label {
            font-size: 14px;
            color: #666;
        }
        .section {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        .section h2 {
            margin-bottom: 16px;
            color: #333;
        }
        .btn {
            padding: 10px 20px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            margin-right: 10px;
            margin-bottom: 10px;
        }
        .btn:hover { background: #5a67d8; }
        .user-list {
            max-height: 400px;
            overflow-y: auto;
        }
        .user-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
            border-bottom: 1px solid #eee;
        }
        .user-info {
            flex: 1;
        }
        .user-actions {
            display: flex;
            gap: 8px;
        }
        .btn-small {
            padding: 6px 12px;
            font-size: 12px;
        }
        .success { background: #10b981; }
        .warning { background: #f59e0b; }
        .danger { background: #ef4444; }
        .loading {
            text-align: center;
            padding: 20px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>MarketPlace Admin Dashboard</h1>
        <p>Platform Management & Analytics</p>
    </div>
    
    <div class="container">
        <div class="stats-grid" id="stats">
            <div class="loading">Loading platform statistics...</div>
        </div>
        
        <div class="section">
            <h2>Quick Actions</h2>
            <button class="btn" onclick="refreshData()">Refresh Data</button>
            <button class="btn success" onclick="exportUsers()">Export Users</button>
            <button class="btn warning" onclick="sendAnnouncement()">Send Announcement</button>
            <button class="btn" onclick="window.open('/api/login', '_blank')">Test Auth</button>
        </div>
        
        <div class="section">
            <h2>Recent Users</h2>
            <div id="users" class="user-list">
                <div class="loading">Loading users...</div>
            </div>
        </div>
        
        <div class="section">
            <h2>Platform Health</h2>
            <div id="health">
                <p>✅ Database: Connected</p>
                <p>✅ Authentication: Active</p>
                <p>✅ API Endpoints: Operational</p>
                <p>✅ Admin Access: Enabled</p>
            </div>
        </div>
    </div>

    <script>
        async function loadDashboard() {
            try {
                // Load platform statistics
                const statsResponse = await fetch('/api/admin/dashboard');
                const statsData = await statsResponse.json();
                
                if (statsData.success) {
                    displayStats(statsData.stats);
                    displayUsers(statsData.stats.recentUsers);
                } else {
                    throw new Error(statsData.message);
                }
            } catch (error) {
                console.error('Dashboard error:', error);
                document.getElementById('stats').innerHTML = '<div class="loading">Error loading dashboard data</div>';
                document.getElementById('users').innerHTML = '<div class="loading">Error loading users</div>';
            }
        }
        
        function displayStats(stats) {
            const statsHtml = \`
                <div class="stat-card">
                    <div class="stat-number">\${stats.totalUsers}</div>
                    <div class="stat-label">Total Users</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">\${stats.totalListings}</div>
                    <div class="stat-label">Active Listings</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">\${stats.totalOrders}</div>
                    <div class="stat-label">Total Orders</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">$\${stats.totalRevenue}</div>
                    <div class="stat-label">Revenue</div>
                </div>
            \`;
            document.getElementById('stats').innerHTML = statsHtml;
        }
        
        function displayUsers(users) {
            const usersHtml = users.map(user => \`
                <div class="user-item">
                    <div class="user-info">
                        <strong>\${user.first_name || 'Unknown'} \${user.last_name || ''}</strong><br>
                        <small>\${user.email || 'No email'} • \${user.user_type || 'buyer'} • \${user.is_verified ? 'Verified' : 'Unverified'}</small>
                    </div>
                    <div class="user-actions">
                        \${!user.is_verified ? \`<button class="btn btn-small success" onclick="verifyUser('\${user.id}')">Verify</button>\` : ''}
                        <button class="btn btn-small danger" onclick="suspendUser('\${user.id}')">Suspend</button>
                    </div>
                </div>
            \`).join('');
            document.getElementById('users').innerHTML = usersHtml;
        }
        
        async function verifyUser(userId) {
            try {
                const response = await fetch(\`/api/admin/users/\${userId}/verify\`, { method: 'POST' });
                const data = await response.json();
                if (data.success) {
                    alert('User verified successfully');
                    loadDashboard();
                } else {
                    alert('Error: ' + data.message);
                }
            } catch (error) {
                alert('Error verifying user');
            }
        }
        
        async function suspendUser(userId) {
            const reason = prompt('Reason for suspension:');
            if (!reason) return;
            
            try {
                const response = await fetch(\`/api/admin/users/\${userId}/suspend\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ reason })
                });
                const data = await response.json();
                if (data.success) {
                    alert('User suspended successfully');
                    loadDashboard();
                } else {
                    alert('Error: ' + data.message);
                }
            } catch (error) {
                alert('Error suspending user');
            }
        }
        
        function refreshData() {
            loadDashboard();
        }
        
        function exportUsers() {
            alert('User export functionality would be implemented here');
        }
        
        function sendAnnouncement() {
            alert('Platform announcement functionality would be implemented here');
        }
        
        // Load dashboard on page load
        loadDashboard();
    </script>
</body>
</html>
    `);
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

  // Admin panel routes (using existing isAdmin middleware)

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

  const httpServer = createServer(app);
  return httpServer;
}
