import type { Express } from "express";

// Website Integration Types
export interface WebsiteIntegration {
  id: string;
  userId: string;
  websiteUrl: string;
  platformType: 'shopify' | 'woocommerce' | 'squarespace' | 'bigcommerce' | 'etsy' | 'custom' | 'other';
  apiKey?: string;
  isConnected: boolean;
  lastSync: Date;
  productCount: number;
  syncErrors?: string[];
}

// Social Media Shop Integration Types
export interface SocialMediaIntegration {
  id: string;
  userId: string;
  platform: 'facebook' | 'tiktok';
  accessToken: string;
  shopId: string;
  isConnected: boolean;
  lastSync: Date;
  productCount: number;
  syncErrors?: string[];
}

// Product Import Types
export interface ImportedProduct {
  id: string;
  externalId: string;
  source: 'website' | 'facebook' | 'tiktok';
  name: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  inventory: number;
  isActive: boolean;
  lastUpdated: Date;
}

// Integration Management Classes
class WebsiteIntegrationManager {
  private static integrations: Map<string, WebsiteIntegration> = new Map();
  private static products: Map<string, ImportedProduct[]> = new Map();

  static async testConnection(websiteUrl: string, platformType: string): Promise<{
    success: boolean;
    productCount?: number;
    error?: string;
  }> {
    try {
      // Simulate connection testing based on platform
      const platformHandlers = {
        shopify: () => this.testShopifyConnection(websiteUrl),
        woocommerce: () => this.testWooCommerceConnection(websiteUrl),
        squarespace: () => this.testSquarespaceConnection(websiteUrl),
        bigcommerce: () => this.testBigCommerceConnection(websiteUrl),
        etsy: () => this.testEtsyConnection(websiteUrl),
        custom: () => this.testCustomWebsiteConnection(websiteUrl),
        other: () => this.testGenericConnection(websiteUrl)
      };

      const handler = platformHandlers[platformType as keyof typeof platformHandlers];
      if (!handler) {
        return { success: false, error: 'Unsupported platform type' };
      }

      return await handler();
    } catch (error) {
      return { success: false, error: 'Connection test failed' };
    }
  }

  private static async testShopifyConnection(websiteUrl: string) {
    // Shopify API integration simulation
    return { success: true, productCount: 127 };
  }

  private static async testWooCommerceConnection(websiteUrl: string) {
    // WooCommerce REST API simulation
    return { success: true, productCount: 89 };
  }

  private static async testSquarespaceConnection(websiteUrl: string) {
    // Squarespace API simulation
    return { success: true, productCount: 34 };
  }

  private static async testBigCommerceConnection(websiteUrl: string) {
    // BigCommerce API simulation
    return { success: true, productCount: 156 };
  }

  private static async testEtsyConnection(websiteUrl: string) {
    // Etsy API simulation
    return { success: true, productCount: 45 };
  }

  private static async testCustomWebsiteConnection(websiteUrl: string) {
    // Custom website scraping simulation
    return { success: true, productCount: 23 };
  }

  private static async testGenericConnection(websiteUrl: string) {
    // Generic website analysis
    return { success: true, productCount: 12 };
  }

  static async createIntegration(userId: string, websiteUrl: string, platformType: string): Promise<string> {
    const integrationId = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const integration: WebsiteIntegration = {
      id: integrationId,
      userId,
      websiteUrl,
      platformType: platformType as any,
      isConnected: true,
      lastSync: new Date(),
      productCount: 0,
      syncErrors: []
    };

    this.integrations.set(integrationId, integration);
    
    // Simulate initial product import
    await this.importProducts(integrationId);
    
    return integrationId;
  }

  static async importProducts(integrationId: string): Promise<ImportedProduct[]> {
    const integration = this.integrations.get(integrationId);
    if (!integration) throw new Error('Integration not found');

    // Simulate product import based on platform
    const mockProducts = this.generateMockProducts(integration.platformType, integration.websiteUrl);
    this.products.set(integrationId, mockProducts);
    
    // Update integration stats
    integration.productCount = mockProducts.length;
    integration.lastSync = new Date();
    
    return mockProducts;
  }

  private static generateMockProducts(platformType: string, websiteUrl: string): ImportedProduct[] {
    const products: ImportedProduct[] = [];
    const count = Math.floor(Math.random() * 50) + 10; // 10-60 products

    for (let i = 0; i < count; i++) {
      products.push({
        id: `prod_${Date.now()}_${i}`,
        externalId: `ext_${i}`,
        source: 'website',
        name: `Product ${i + 1} from ${platformType}`,
        description: `Imported from ${websiteUrl}`,
        price: Math.floor(Math.random() * 200) + 10,
        images: [`https://via.placeholder.com/300x300?text=Product+${i + 1}`],
        category: ['Electronics', 'Clothing', 'Home', 'Books', 'Sports'][Math.floor(Math.random() * 5)],
        inventory: Math.floor(Math.random() * 100),
        isActive: true,
        lastUpdated: new Date()
      });
    }

    return products;
  }

  static getIntegration(integrationId: string): WebsiteIntegration | undefined {
    return this.integrations.get(integrationId);
  }

  static getUserIntegrations(userId: string): WebsiteIntegration[] {
    return Array.from(this.integrations.values()).filter(integration => integration.userId === userId);
  }

  static getImportedProducts(integrationId: string): ImportedProduct[] {
    return this.products.get(integrationId) || [];
  }
}

class SocialMediaIntegrationManager {
  private static integrations: Map<string, SocialMediaIntegration> = new Map();
  private static products: Map<string, ImportedProduct[]> = new Map();

  static async connectFacebookShop(userId: string, accessToken: string): Promise<string> {
    const integrationId = `fb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const integration: SocialMediaIntegration = {
      id: integrationId,
      userId,
      platform: 'facebook',
      accessToken,
      shopId: `fb_shop_${Math.random().toString(36).substr(2, 9)}`,
      isConnected: true,
      lastSync: new Date(),
      productCount: 0,
      syncErrors: []
    };

    this.integrations.set(integrationId, integration);
    
    // Simulate Facebook product import
    await this.importSocialProducts(integrationId);
    
    return integrationId;
  }

  static async connectTikTokShop(userId: string, accessToken: string): Promise<string> {
    const integrationId = `tt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const integration: SocialMediaIntegration = {
      id: integrationId,
      userId,
      platform: 'tiktok',
      accessToken,
      shopId: `tt_shop_${Math.random().toString(36).substr(2, 9)}`,
      isConnected: true,
      lastSync: new Date(),
      productCount: 0,
      syncErrors: []
    };

    this.integrations.set(integrationId, integration);
    
    // Simulate TikTok product import
    await this.importSocialProducts(integrationId);
    
    return integrationId;
  }

  static async importSocialProducts(integrationId: string): Promise<ImportedProduct[]> {
    const integration = this.integrations.get(integrationId);
    if (!integration) throw new Error('Integration not found');

    // Simulate social media product import
    const mockProducts = this.generateMockSocialProducts(integration.platform);
    this.products.set(integrationId, mockProducts);
    
    // Update integration stats
    integration.productCount = mockProducts.length;
    integration.lastSync = new Date();
    
    return mockProducts;
  }

  private static generateMockSocialProducts(platform: string): ImportedProduct[] {
    const products: ImportedProduct[] = [];
    const count = Math.floor(Math.random() * 30) + 5; // 5-35 products

    for (let i = 0; i < count; i++) {
      products.push({
        id: `${platform}_prod_${Date.now()}_${i}`,
        externalId: `${platform}_${i}`,
        source: platform as 'facebook' | 'tiktok',
        name: `${platform} Product ${i + 1}`,
        description: `Imported from ${platform.charAt(0).toUpperCase() + platform.slice(1)} Shop`,
        price: Math.floor(Math.random() * 150) + 5,
        images: [`https://via.placeholder.com/300x300?text=${platform}+${i + 1}`],
        category: ['Fashion', 'Beauty', 'Tech', 'Lifestyle', 'Accessories'][Math.floor(Math.random() * 5)],
        inventory: Math.floor(Math.random() * 50),
        isActive: true,
        lastUpdated: new Date()
      });
    }

    return products;
  }

  static getSocialIntegration(integrationId: string): SocialMediaIntegration | undefined {
    return this.integrations.get(integrationId);
  }

  static getUserSocialIntegrations(userId: string): SocialMediaIntegration[] {
    return Array.from(this.integrations.values()).filter(integration => integration.userId === userId);
  }

  static getSocialProducts(integrationId: string): ImportedProduct[] {
    return this.products.get(integrationId) || [];
  }
}

// API Routes
export function registerIntegrationRoutes(app: Express): void {
  // Website Integration Routes
  app.post('/api/integrations/website/test', async (req, res) => {
    try {
      const { websiteUrl, platformType } = req.body;
      
      if (!websiteUrl || !platformType) {
        return res.status(400).json({ 
          success: false, 
          error: 'Website URL and platform type are required' 
        });
      }

      const result = await WebsiteIntegrationManager.testConnection(websiteUrl, platformType);
      res.json(result);
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to test website connection' 
      });
    }
  });

  app.post('/api/integrations/website/connect', async (req, res) => {
    try {
      const { websiteUrl, platformType } = req.body;
      const userId = req.user?.id || 'demo_user'; // In real app, get from authenticated user
      
      if (!websiteUrl || !platformType) {
        return res.status(400).json({ 
          success: false, 
          error: 'Website URL and platform type are required' 
        });
      }

      const integrationId = await WebsiteIntegrationManager.createIntegration(userId, websiteUrl, platformType);
      const integration = WebsiteIntegrationManager.getIntegration(integrationId);
      const products = WebsiteIntegrationManager.getImportedProducts(integrationId);

      res.json({
        success: true,
        integration,
        productsImported: products.length,
        message: `Successfully connected and imported ${products.length} products`
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to connect website' 
      });
    }
  });

  app.get('/api/integrations/website/:integrationId/products', async (req, res) => {
    try {
      const { integrationId } = req.params;
      const products = WebsiteIntegrationManager.getImportedProducts(integrationId);
      
      res.json({ success: true, products });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch imported products' 
      });
    }
  });

  // Social Media Integration Routes
  app.post('/api/integrations/facebook/connect', async (req, res) => {
    try {
      const userId = req.user?.id || 'demo_user'; // In real app, get from authenticated user
      const accessToken = 'demo_facebook_token'; // In real app, handle OAuth flow
      
      const integrationId = await SocialMediaIntegrationManager.connectFacebookShop(userId, accessToken);
      const integration = SocialMediaIntegrationManager.getSocialIntegration(integrationId);
      const products = SocialMediaIntegrationManager.getSocialProducts(integrationId);

      res.json({
        success: true,
        integration,
        productsImported: products.length,
        message: `Successfully connected Facebook Shop and imported ${products.length} products`
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to connect Facebook Shop' 
      });
    }
  });

  app.post('/api/integrations/tiktok/connect', async (req, res) => {
    try {
      const userId = req.user?.id || 'demo_user'; // In real app, get from authenticated user
      const accessToken = 'demo_tiktok_token'; // In real app, handle OAuth flow
      
      const integrationId = await SocialMediaIntegrationManager.connectTikTokShop(userId, accessToken);
      const integration = SocialMediaIntegrationManager.getSocialIntegration(integrationId);
      const products = SocialMediaIntegrationManager.getSocialProducts(integrationId);

      res.json({
        success: true,
        integration,
        productsImported: products.length,
        message: `Successfully connected TikTok Shop and imported ${products.length} products`
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to connect TikTok Shop' 
      });
    }
  });

  app.get('/api/integrations/social/:integrationId/products', async (req, res) => {
    try {
      const { integrationId } = req.params;
      const products = SocialMediaIntegrationManager.getSocialProducts(integrationId);
      
      res.json({ success: true, products });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch social media products' 
      });
    }
  });

  // General Integration Routes
  app.get('/api/integrations/user/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      
      const websiteIntegrations = WebsiteIntegrationManager.getUserIntegrations(userId);
      const socialIntegrations = SocialMediaIntegrationManager.getUserSocialIntegrations(userId);
      
      res.json({
        success: true,
        integrations: {
          website: websiteIntegrations,
          social: socialIntegrations
        }
      });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to fetch user integrations' 
      });
    }
  });

  app.post('/api/integrations/sync/:integrationId', async (req, res) => {
    try {
      const { integrationId } = req.params;
      
      // Determine integration type and sync accordingly
      if (integrationId.startsWith('web_')) {
        const products = await WebsiteIntegrationManager.importProducts(integrationId);
        res.json({ 
          success: true, 
          message: `Synced ${products.length} products from website`,
          productCount: products.length 
        });
      } else if (integrationId.startsWith('fb_') || integrationId.startsWith('tt_')) {
        const products = await SocialMediaIntegrationManager.importSocialProducts(integrationId);
        res.json({ 
          success: true, 
          message: `Synced ${products.length} products from social media`,
          productCount: products.length 
        });
      } else {
        res.status(400).json({ 
          success: false, 
          error: 'Invalid integration ID' 
        });
      }
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        error: 'Failed to sync integration' 
      });
    }
  });
}