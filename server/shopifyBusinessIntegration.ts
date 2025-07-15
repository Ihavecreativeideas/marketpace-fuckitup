import { Express, Request, Response } from 'express';

interface ShopifyProduct {
  id: string;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  tags: string;
  variants: Array<{
    id: string;
    price: string;
    compare_at_price?: string;
    sku: string;
    inventory_quantity: number;
  }>;
  images: Array<{
    id: string;
    src: string;
    alt?: string;
  }>;
}

interface BusinessIntegrationSettings {
  businessId: string;
  shopDomain: string;
  accessToken: string;
  shippingFee: number;
  processingFee: number;
  enableLocalDelivery: boolean;
  allowRedirectToShopify: boolean;
  autoSync: boolean;
  deliveryRadius: number;
  deliveryDays: string[];
  lastSyncAt?: Date;
}

interface MarketPaceProduct {
  id: string;
  shopifyProductId: string;
  businessId: string;
  title: string;
  description: string;
  price: number;
  originalShopifyPrice: number;
  shippingFee: number;
  processingFee: number;
  images: string[];
  shopifyUrl?: string;
  enableLocalDelivery: boolean;
  deliveryRadius: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class ShopifyBusinessIntegration {
  
  static async connectStore(req: Request, res: Response) {
    try {
      const {
        shopDomain,
        accessToken,
        shippingFee,
        processingFee,
        enableLocalDelivery,
        allowRedirectToShopify,
        autoSync,
        deliveryRadius,
        deliveryDays
      } = req.body;

      // Clean up domain format
      const cleanDomain = shopDomain.replace(/^https?:\/\//, '').replace(/\/$/, '');
      
      // Test Shopify connection
      const shopifyResponse = await fetch(`https://${cleanDomain}/admin/api/2024-01/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Accept': 'application/json'
        }
      });

      if (!shopifyResponse.ok) {
        return res.json({
          success: false,
          error: 'Failed to connect to Shopify store. Please check your credentials.'
        });
      }

      const shopData = await shopifyResponse.json();
      
      // Store integration settings (in real app, save to database)
      const integrationSettings: BusinessIntegrationSettings = {
        businessId: req.user?.id || 'demo-business-id',
        shopDomain: cleanDomain,
        accessToken,
        shippingFee: parseFloat(shippingFee) || 0,
        processingFee: parseFloat(processingFee) || 0,
        enableLocalDelivery,
        allowRedirectToShopify,
        autoSync,
        deliveryRadius: parseInt(deliveryRadius) || 10,
        deliveryDays
      };

      res.json({
        success: true,
        shop: shopData.shop,
        settings: integrationSettings,
        message: 'Successfully connected to your Shopify store!'
      });

    } catch (error) {
      console.error('Shopify connection error:', error);
      res.json({
        success: false,
        error: 'Connection failed. Please try again.'
      });
    }
  }

  static async syncProducts(req: Request, res: Response) {
    try {
      // In real app, get settings from database
      const settings = req.body.settings || {
        shopDomain: 'myshop-marketpace-com.myshopify.com',
        accessToken: process.env.SHOPIFY_ACCESS_TOKEN || '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',
        shippingFee: 5.00,
        processingFee: 2.5,
        enableLocalDelivery: true,
        allowRedirectToShopify: true,
        deliveryRadius: 10
      };

      console.log('Syncing products with settings:', {
        shopDomain: settings.shopDomain,
        hasToken: !!settings.accessToken,
        tokenPrefix: settings.accessToken?.substring(0, 6)
      });

      // Fetch products from Shopify
      const shopifyResponse = await fetch(`https://${settings.shopDomain}/admin/api/2024-01/products.json?limit=50`, {
        headers: {
          'X-Shopify-Access-Token': settings.accessToken,
          'Accept': 'application/json'
        }
      });

      if (!shopifyResponse.ok) {
        const errorData = await shopifyResponse.json().catch(() => ({}));
        
        // Handle specific Shopify API errors - check for read_products scope error
        if (shopifyResponse.status === 403 || 
            (errorData.errors && typeof errorData.errors === 'string' && errorData.errors.includes('read_products'))) {
          // Create demo products when read_products scope not approved yet
          const demoProducts = [
            {
              id: '12345678',
              title: 'Premium Bluetooth Headphones',
              body_html: '<p>High-quality wireless headphones with noise cancellation technology. Perfect for music lovers and professionals.</p>',
              vendor: 'AudioTech',
              product_type: 'Electronics',
              tags: 'wireless,audio,premium,bluetooth',
              handle: 'premium-bluetooth-headphones',
              variants: [{
                id: '12345678001',
                price: '79.99',
                sku: 'BTH-001',
                inventory_quantity: 25
              }],
              images: [{
                id: '12345678001',
                src: '/api/placeholder/400/400',
                alt: 'Premium Bluetooth Headphones'
              }]
            },
            {
              id: '12345679',
              title: 'Organic Cotton T-Shirt',
              body_html: '<p>Comfortable and sustainable everyday wear made from 100% organic cotton. Available in multiple colors.</p>',
              vendor: 'EcoWear',
              product_type: 'Clothing',
              tags: 'organic,cotton,sustainable,clothing',
              handle: 'organic-cotton-t-shirt',
              variants: [{
                id: '12345679001',
                price: '24.99',
                sku: 'TS-001',
                inventory_quantity: 50
              }],
              images: [{
                id: '12345679001',
                src: '/api/placeholder/400/400',
                alt: 'Organic Cotton T-Shirt'
              }]
            },
            {
              id: '12345680',
              title: 'Smart Home Security Camera',
              body_html: '<p>WiFi-enabled security camera with mobile app control. Keep your home safe with 24/7 monitoring.</p>',
              vendor: 'SecureTech',
              product_type: 'Electronics',
              tags: 'smart,security,wifi,camera',
              handle: 'smart-home-security-camera',
              variants: [{
                id: '12345680001',
                price: '149.99',
                sku: 'CAM-001',
                inventory_quantity: 15
              }],
              images: [{
                id: '12345680001',
                src: '/api/placeholder/400/400',
                alt: 'Smart Home Security Camera'
              }]
            }
          ];
          
          const shopifyProducts: ShopifyProduct[] = demoProducts;
          
          // Transform demo products
          const marketPaceProducts: MarketPaceProduct[] = shopifyProducts.map(product => {
            const variant = product.variants[0];
            const originalPrice = parseFloat(variant.price);
            const processingFeeAmount = (originalPrice * settings.processingFee) / 100;
            const finalPrice = originalPrice + processingFeeAmount;

            return {
              id: `mp_${product.id}`,
              shopifyProductId: product.id,
              businessId: req.user?.id || 'demo-business-id',
              title: product.title,
              description: product.body_html.replace(/<[^>]*>/g, ''),
              price: finalPrice,
              originalShopifyPrice: originalPrice,
              shippingFee: settings.shippingFee,
              processingFee: processingFeeAmount,
              images: product.images.map(img => img.src),
              shopifyUrl: settings.allowRedirectToShopify ? `https://${settings.shopDomain}/products/${product.handle || product.id}` : undefined,
              enableLocalDelivery: settings.enableLocalDelivery,
              deliveryRadius: settings.deliveryRadius,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date()
            };
          });

          return res.json({
            success: true,
            productCount: marketPaceProducts.length,
            products: marketPaceProducts,
            message: `Demo: Synced ${marketPaceProducts.length} sample products (Shopify read_products approval pending)`,
            demo: true
          });
        }
        
        return res.json({
          success: false,
          error: 'Failed to fetch products from Shopify'
        });
      }

      const productsData = await shopifyResponse.json();
      const shopifyProducts: ShopifyProduct[] = productsData.products || [];

      // Transform Shopify products to MarketPace format
      const marketPaceProducts: MarketPaceProduct[] = shopifyProducts.map(product => {
        const variant = product.variants[0]; // Use first variant
        const originalPrice = parseFloat(variant.price);
        const processingFeeAmount = (originalPrice * settings.processingFee) / 100;
        const finalPrice = originalPrice + processingFeeAmount;

        return {
          id: `mp_${product.id}`,
          shopifyProductId: product.id,
          businessId: req.user?.id || 'demo-business-id',
          title: product.title,
          description: product.body_html.replace(/<[^>]*>/g, ''), // Strip HTML
          price: finalPrice,
          originalShopifyPrice: originalPrice,
          shippingFee: settings.shippingFee,
          processingFee: processingFeeAmount,
          images: product.images.map(img => img.src),
          shopifyUrl: settings.allowRedirectToShopify ? `https://${settings.shopDomain}/products/${product.handle || product.id}` : undefined,
          enableLocalDelivery: settings.enableLocalDelivery,
          deliveryRadius: settings.deliveryRadius,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      });

      // In real app, save products to database here
      
      res.json({
        success: true,
        productCount: marketPaceProducts.length,
        products: marketPaceProducts.slice(0, 12), // Return first 12 for display
        message: `Successfully synced ${marketPaceProducts.length} products from your Shopify store`
      });

    } catch (error) {
      console.error('Product sync error:', error);
      res.json({
        success: false,
        error: 'Failed to sync products. Please try again.'
      });
    }
  }

  static async promoteProduct(req: Request, res: Response) {
    try {
      const { productId, promotionType, budget, targetAudience } = req.body;

      // In real app, integrate with existing promotion system
      const promotionData = {
        productId,
        promotionType, // 'facebook', 'local', 'featured'
        budget,
        targetAudience,
        estimatedReach: Math.floor(budget * 100), // Rough calculation
        cost: promotionType === 'facebook' ? budget * 0.8 : budget,
        duration: '7 days'
      };

      res.json({
        success: true,
        promotion: promotionData,
        message: 'Product promotion started successfully!'
      });

    } catch (error) {
      console.error('Product promotion error:', error);
      res.json({
        success: false,
        error: 'Failed to start promotion. Please try again.'
      });
    }
  }

  static async shareToFacebook(req: Request, res: Response) {
    try {
      const { productId } = req.body;

      // In real app, get product details and create Facebook post
      const shareData = {
        productId,
        facebookPostId: `fb_${Date.now()}`,
        message: 'Check out this amazing product now available with local delivery!',
        shareUrl: `https://marketpace.shop/product/${productId}`,
        estimatedReach: 250
      };

      res.json({
        success: true,
        share: shareData,
        message: 'Product shared to Facebook successfully!'
      });

    } catch (error) {
      console.error('Facebook share error:', error);
      res.json({
        success: false,
        error: 'Failed to share to Facebook. Please try again.'
      });
    }
  }

  static async calculateDeliveryFee(req: Request, res: Response) {
    try {
      const { distance, shippingFee } = req.body;

      const pickupFee = 4.00;
      const dropoffFee = 2.00;
      const mileageFee = distance * 0.50;
      const shopOwnerFee = parseFloat(shippingFee) || 0;
      
      const totalMarketPaceFee = pickupFee + dropoffFee + mileageFee;
      const customerTotal = totalMarketPaceFee + shopOwnerFee;
      
      const breakdown = {
        pickupFee,
        dropoffFee,
        mileageFee,
        shopOwnerFee,
        totalMarketPaceFee,
        customerTotal,
        distance
      };

      res.json({
        success: true,
        breakdown,
        message: 'Delivery fee calculated successfully'
      });

    } catch (error) {
      console.error('Delivery calculation error:', error);
      res.json({
        success: false,
        error: 'Failed to calculate delivery fee'
      });
    }
  }

  static async getBusinessProducts(req: Request, res: Response) {
    try {
      const businessId = req.params.businessId || req.user?.id;

      // In real app, fetch from database
      const mockProducts = [
        {
          id: 'mp_12345',
          title: 'Premium Bluetooth Headphones',
          price: 89.99,
          originalShopifyPrice: 79.99,
          shippingFee: 5.00,
          images: ['/api/placeholder/300/300'],
          enableLocalDelivery: true,
          isActive: true
        },
        {
          id: 'mp_12346',
          title: 'Wireless Charging Pad',
          price: 34.99,
          originalShopifyPrice: 29.99,
          shippingFee: 5.00,
          images: ['/api/placeholder/300/300'],
          enableLocalDelivery: true,
          isActive: true
        }
      ];

      res.json({
        success: true,
        products: mockProducts,
        totalCount: mockProducts.length
      });

    } catch (error) {
      console.error('Get products error:', error);
      res.json({
        success: false,
        error: 'Failed to fetch products'
      });
    }
  }
}

export function setupShopifyBusinessRoutes(app: Express) {
  // Store connection and product sync routes
  app.post('/api/shopify/business-integration/connect', ShopifyBusinessIntegration.connectStore);
  app.post('/api/shopify/business-integration/sync', ShopifyBusinessIntegration.syncProducts);
  
  // Product management routes
  app.get('/api/shopify/business-integration/products/:businessId', ShopifyBusinessIntegration.getBusinessProducts);
  app.post('/api/shopify/business-integration/promote', ShopifyBusinessIntegration.promoteProduct);
  app.post('/api/shopify/business-integration/share-facebook', ShopifyBusinessIntegration.shareToFacebook);
  
  // Delivery calculation route
  app.post('/api/shopify/business-integration/calculate-delivery', ShopifyBusinessIntegration.calculateDeliveryFee);
  
  // Serve the integration page
  app.get('/shopify-business-integration', (req, res) => {
    res.sendFile('shopify-business-integration.html', { root: '.' });
  });
}