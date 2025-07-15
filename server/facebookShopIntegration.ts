import { Express, Request, Response } from 'express';
import axios from 'axios';

const FACEBOOK_GRAPH_URL = 'https://graph.facebook.com/v20.0';

export interface FacebookShopProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  availability: 'in stock' | 'out of stock';
  category: string;
  url: string;
  condition: 'new' | 'used' | 'refurbished';
  brand?: string;
  retailer_id: string;
}

export interface FacebookShopConnection {
  userId: string;
  accessToken: string;
  pageId: string;
  shopId: string;
  catalogId: string;
  pageName: string;
  connectedAt: Date;
  lastSyncAt?: Date;
}

export interface MarketPaceProduct {
  id: string;
  facebookProductId: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  deliveryAvailable: boolean;
  deliveryRadius: number;
  deliveryFee: number;
  syncedAt: Date;
  status: 'active' | 'inactive' | 'out_of_stock';
}

class FacebookShopManager {
  private static connections: Map<string, FacebookShopConnection> = new Map();
  private static syncedProducts: Map<string, MarketPaceProduct[]> = new Map();

  /**
   * Initiate Facebook Shop OAuth flow
   */
  static getFacebookShopAuthUrl(redirectUri: string): string {
    const clientId = process.env.FACEBOOK_APP_ID;
    const scopes = [
      'pages_show_list',
      'catalog_management',
      'pages_read_engagement',
      'business_management',
      'commerce_account_read_orders',
      'commerce_account_read_settings'
    ].join(',');

    return `https://www.facebook.com/v20.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes}&response_type=code&state=facebook_shop_integration`;
  }

  /**
   * Exchange authorization code for access token
   */
  static async exchangeCodeForToken(code: string, redirectUri: string): Promise<string> {
    const clientId = process.env.FACEBOOK_APP_ID;
    const clientSecret = process.env.FACEBOOK_APP_SECRET;

    const tokenResponse = await axios.get(
      `${FACEBOOK_GRAPH_URL}/oauth/access_token`,
      {
        params: {
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          code
        }
      }
    );

    return tokenResponse.data.access_token;
  }

  /**
   * Get user's Facebook pages with shops
   */
  static async getUserPages(accessToken: string): Promise<any[]> {
    const response = await axios.get(
      `${FACEBOOK_GRAPH_URL}/me/accounts?fields=id,name,access_token,category,instagram_business_account`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    return response.data.data;
  }

  /**
   * Get page's product catalogs
   */
  static async getPageCatalogs(pageId: string, pageAccessToken: string): Promise<any[]> {
    const response = await axios.get(
      `${FACEBOOK_GRAPH_URL}/${pageId}/product_catalogs?fields=id,name,business,product_count`,
      {
        headers: {
          'Authorization': `Bearer ${pageAccessToken}`
        }
      }
    );

    return response.data.data;
  }

  /**
   * Get products from catalog
   */
  static async getCatalogProducts(catalogId: string, accessToken: string): Promise<FacebookShopProduct[]> {
    const response = await axios.get(
      `${FACEBOOK_GRAPH_URL}/${catalogId}/products?fields=id,name,description,price,currency,images,availability,category,url,condition,brand,retailer_id&limit=100`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    return response.data.data.map((product: any) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: parseFloat(product.price),
      currency: product.currency,
      images: product.images?.map((img: any) => img.url) || [],
      availability: product.availability,
      category: product.category,
      url: product.url,
      condition: product.condition,
      brand: product.brand,
      retailer_id: product.retailer_id
    }));
  }

  /**
   * Connect Facebook shop to MarketPace
   */
  static async connectFacebookShop(
    userId: string,
    accessToken: string,
    pageId: string,
    catalogId: string
  ): Promise<FacebookShopConnection> {
    // Get page information
    const pageResponse = await axios.get(
      `${FACEBOOK_GRAPH_URL}/${pageId}?fields=id,name,access_token`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    const pageData = pageResponse.data;
    
    const connection: FacebookShopConnection = {
      userId,
      accessToken: pageData.access_token,
      pageId,
      shopId: pageId, // Facebook pages serve as shops
      catalogId,
      pageName: pageData.name,
      connectedAt: new Date()
    };

    this.connections.set(userId, connection);
    
    // Sync products immediately after connection
    await this.syncShopProducts(userId);
    
    return connection;
  }

  /**
   * Sync Facebook shop products to MarketPace
   */
  static async syncShopProducts(userId: string): Promise<MarketPaceProduct[]> {
    const connection = this.connections.get(userId);
    if (!connection) {
      throw new Error('Facebook shop not connected');
    }

    const facebookProducts = await this.getCatalogProducts(connection.catalogId, connection.accessToken);
    
    const marketPaceProducts: MarketPaceProduct[] = facebookProducts.map(product => ({
      id: `mp_${product.id}`,
      facebookProductId: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      images: product.images,
      category: product.category,
      deliveryAvailable: true,
      deliveryRadius: 25, // Default 25 mile radius
      deliveryFee: 4.50, // Base delivery fee
      syncedAt: new Date(),
      status: product.availability === 'in stock' ? 'active' : 'out_of_stock'
    }));

    this.syncedProducts.set(userId, marketPaceProducts);
    
    // Update connection last sync time
    connection.lastSyncAt = new Date();
    this.connections.set(userId, connection);

    return marketPaceProducts;
  }

  /**
   * Get synced products for user
   */
  static getSyncedProducts(userId: string): MarketPaceProduct[] {
    return this.syncedProducts.get(userId) || [];
  }

  /**
   * Get Facebook shop connection status
   */
  static getShopConnection(userId: string): FacebookShopConnection | null {
    return this.connections.get(userId) || null;
  }

  /**
   * Add MarketPace delivery button to Facebook product
   */
  static async addDeliveryButton(userId: string, productId: string, deliveryUrl: string): Promise<boolean> {
    const connection = this.connections.get(userId);
    if (!connection) {
      throw new Error('Facebook shop not connected');
    }

    try {
      // Add custom CTA button to product
      const response = await axios.post(
        `${FACEBOOK_GRAPH_URL}/${productId}`,
        {
          custom_data: {
            delivery_available: true,
            delivery_url: deliveryUrl,
            delivery_provider: 'MarketPace'
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${connection.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.status === 200;
    } catch (error) {
      console.error('Failed to add delivery button:', error);
      return false;
    }
  }

  /**
   * Create MarketPace delivery link for Facebook product
   */
  static createDeliveryLink(userId: string, productId: string): string {
    const baseUrl = process.env.REPLIT_DOMAIN || 'https://marketpace.shop';
    return `${baseUrl}/facebook-delivery?user=${userId}&product=${productId}&source=facebook_shop`;
  }

  /**
   * Get shop analytics
   */
  static getShopAnalytics(userId: string) {
    const connection = this.connections.get(userId);
    const products = this.getSyncedProducts(userId);
    
    if (!connection) {
      return null;
    }

    return {
      connected: true,
      shopName: connection.pageName,
      totalProducts: products.length,
      activeProducts: products.filter(p => p.status === 'active').length,
      outOfStockProducts: products.filter(p => p.status === 'out_of_stock').length,
      lastSyncAt: connection.lastSyncAt,
      deliveryEnabled: products.filter(p => p.deliveryAvailable).length,
      averageDeliveryFee: products.reduce((sum, p) => sum + p.deliveryFee, 0) / products.length || 0
    };
  }

  /**
   * Disconnect Facebook shop
   */
  static disconnectShop(userId: string): boolean {
    const connection = this.connections.get(userId);
    if (!connection) {
      return false;
    }

    this.connections.delete(userId);
    this.syncedProducts.delete(userId);
    return true;
  }
}

export function registerFacebookShopRoutes(app: Express): void {
  // Initiate Facebook Shop OAuth
  app.get('/api/facebook-shop/auth', (req: Request, res: Response) => {
    const redirectUri = `${req.protocol}://${req.get('host')}/api/facebook-shop/callback`;
    const authUrl = FacebookShopManager.getFacebookShopAuthUrl(redirectUri);
    
    res.json({
      success: true,
      authUrl,
      message: 'Redirect user to this URL to connect Facebook Shop'
    });
  });

  // Facebook Shop OAuth callback
  app.get('/api/facebook-shop/callback', async (req: Request, res: Response) => {
    try {
      const { code, state } = req.query;
      
      if (!code || state !== 'facebook_shop_integration') {
        return res.status(400).json({ error: 'Invalid authorization code or state' });
      }

      const redirectUri = `${req.protocol}://${req.get('host')}/api/facebook-shop/callback`;
      const accessToken = await FacebookShopManager.exchangeCodeForToken(code as string, redirectUri);
      
      // Get user pages
      const pages = await FacebookShopManager.getUserPages(accessToken);
      
      // Store token temporarily for setup
      req.session.tempAccessToken = accessToken;
      req.session.userPages = pages;
      
      res.redirect('/facebook-shop-setup?success=true');
    } catch (error) {
      console.error('Facebook Shop OAuth error:', error);
      res.redirect('/facebook-shop-setup?error=oauth_failed');
    }
  });

  // Get user's Facebook pages
  app.get('/api/facebook-shop/pages', async (req: Request, res: Response) => {
    try {
      const pages = req.session.userPages || [];
      
      res.json({
        success: true,
        pages: pages.map((page: any) => ({
          id: page.id,
          name: page.name,
          category: page.category,
          hasInstagram: !!page.instagram_business_account
        }))
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get page catalogs
  app.get('/api/facebook-shop/catalogs/:pageId', async (req: Request, res: Response) => {
    try {
      const { pageId } = req.params;
      const pages = req.session.userPages || [];
      const page = pages.find((p: any) => p.id === pageId);
      
      if (!page) {
        return res.status(404).json({ error: 'Page not found' });
      }

      const catalogs = await FacebookShopManager.getPageCatalogs(pageId, page.access_token);
      
      res.json({
        success: true,
        catalogs
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Connect Facebook Shop
  app.post('/api/facebook-shop/connect', async (req: Request, res: Response) => {
    try {
      const { pageId, catalogId } = req.body;
      const userId = req.session.userId || 'demo_user';
      const accessToken = req.session.tempAccessToken;
      
      if (!accessToken) {
        return res.status(400).json({ error: 'No access token found. Please re-authenticate.' });
      }

      const connection = await FacebookShopManager.connectFacebookShop(
        userId,
        accessToken,
        pageId,
        catalogId
      );

      // Clear temporary session data
      delete req.session.tempAccessToken;
      delete req.session.userPages;

      res.json({
        success: true,
        connection: {
          shopName: connection.pageName,
          connectedAt: connection.connectedAt,
          productsCount: FacebookShopManager.getSyncedProducts(userId).length
        },
        message: 'Facebook Shop connected successfully'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Sync shop products
  app.post('/api/facebook-shop/sync', async (req: Request, res: Response) => {
    try {
      const userId = req.session.userId || 'demo_user';
      const products = await FacebookShopManager.syncShopProducts(userId);
      
      res.json({
        success: true,
        products: products.length,
        message: `Synced ${products.length} products from Facebook Shop`
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get synced products
  app.get('/api/facebook-shop/products', (req: Request, res: Response) => {
    try {
      const userId = req.session.userId || 'demo_user';
      const products = FacebookShopManager.getSyncedProducts(userId);
      
      res.json({
        success: true,
        products
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get shop connection status
  app.get('/api/facebook-shop/status', (req: Request, res: Response) => {
    try {
      const userId = req.session.userId || 'demo_user';
      const analytics = FacebookShopManager.getShopAnalytics(userId);
      
      res.json({
        success: true,
        connected: !!analytics,
        analytics
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create delivery link
  app.post('/api/facebook-shop/delivery-link', (req: Request, res: Response) => {
    try {
      const { productId } = req.body;
      const userId = req.session.userId || 'demo_user';
      
      const deliveryLink = FacebookShopManager.createDeliveryLink(userId, productId);
      
      res.json({
        success: true,
        deliveryLink,
        message: 'Delivery link created successfully'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Add delivery button to Facebook product
  app.post('/api/facebook-shop/add-delivery-button', async (req: Request, res: Response) => {
    try {
      const { productId } = req.body;
      const userId = req.session.userId || 'demo_user';
      
      const deliveryUrl = FacebookShopManager.createDeliveryLink(userId, productId);
      const success = await FacebookShopManager.addDeliveryButton(userId, productId, deliveryUrl);
      
      res.json({
        success,
        message: success ? 'Delivery button added successfully' : 'Failed to add delivery button'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Disconnect Facebook shop
  app.post('/api/facebook-shop/disconnect', (req: Request, res: Response) => {
    try {
      const userId = req.session.userId || 'demo_user';
      const success = FacebookShopManager.disconnectShop(userId);
      
      res.json({
        success,
        message: success ? 'Facebook Shop disconnected successfully' : 'No shop connection found'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
}