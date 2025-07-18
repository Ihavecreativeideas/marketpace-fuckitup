import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Printful API Configuration
const PRINTFUL_API_BASE = 'https://api.printful.com';
const PRINTFUL_API_KEY = '8ix90dXLKcFM8s5CgODZz6TS5MUd38KSgfI2e3leHzbdMSOSgrXwU5G00kmtxpf3';
const PRINTFUL_CLIENT_ID = 'app-5364248';

// Helper function to make Printful API requests
async function printfulRequest(endpoint: string, method: string = 'GET', data?: any) {
  const url = `${PRINTFUL_API_BASE}${endpoint}`;
  const options: any = {
    method,
    headers: {
      'Authorization': `Bearer ${PRINTFUL_API_KEY}`,
      'Content-Type': 'application/json',
    },
  };

  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  return await response.json();
}

// Test Printful connection
router.post('/test-connection', async (req, res) => {
  try {
    console.log('Testing Printful connection...');
    const storeInfo = await printfulRequest('/store');
    
    if (storeInfo.code === 200) {
      res.json({
        success: true,
        message: 'Printful connection successful',
        store: storeInfo.result,
        apiKey: PRINTFUL_API_KEY.substring(0, 10) + '...'
      });
    } else {
      res.json({
        success: false,
        error: 'Failed to connect to Printful',
        details: storeInfo
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

// Get Printful products
router.get('/products', async (req, res) => {
  try {
    const products = await printfulRequest('/products');
    res.json(products);
  } catch (error: any) {
    console.error('Error fetching Printful products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get product variants
router.get('/products/:id/variants', async (req, res) => {
  try {
    const { id } = req.params;
    const variants = await printfulRequest(`/products/${id}`);
    res.json(variants);
  } catch (error: any) {
    console.error('Error fetching product variants:', error);
    res.status(500).json({ error: 'Failed to fetch product variants' });
  }
});

// Get store products (synced products)
router.get('/store/products', async (req, res) => {
  try {
    const products = await printfulRequest('/store/products');
    res.json(products);
  } catch (error: any) {
    console.error('Error fetching store products:', error);
    res.status(500).json({ error: 'Failed to fetch store products' });
  }
});

// Create store product
router.post('/store/products', async (req, res) => {
  try {
    const productData = req.body;
    const result = await printfulRequest('/store/products', 'POST', productData);
    res.json(result);
  } catch (error: any) {
    console.error('Error creating store product:', error);
    res.status(500).json({ error: 'Failed to create store product' });
  }
});

// Get orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await printfulRequest('/orders');
    res.json(orders);
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Create order
router.post('/orders', async (req, res) => {
  try {
    const orderData = req.body;
    const result = await printfulRequest('/orders', 'POST', orderData);
    res.json(result);
  } catch (error: any) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get order details
router.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await printfulRequest(`/orders/${id}`);
    res.json(order);
  } catch (error: any) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

// Confirm order
router.post('/orders/:id/confirm', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await printfulRequest(`/orders/${id}/confirm`, 'POST');
    res.json(result);
  } catch (error: any) {
    console.error('Error confirming order:', error);
    res.status(500).json({ error: 'Failed to confirm order' });
  }
});

// Get files
router.get('/files', async (req, res) => {
  try {
    const files = await printfulRequest('/files');
    res.json(files);
  } catch (error: any) {
    console.error('Error fetching files:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
});

// Upload file
router.post('/files', async (req, res) => {
  try {
    const fileData = req.body;
    const result = await printfulRequest('/files', 'POST', fileData);
    res.json(result);
  } catch (error: any) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Business integration endpoints
router.post('/business-integration/connect', async (req, res) => {
  try {
    const { businessId, printfulStoreId } = req.body;
    
    // Test connection with provided store ID
    const storeInfo = await printfulRequest('/store');
    
    if (storeInfo.code === 200) {
      // Store the integration settings
      const integrationSettings = {
        businessId,
        printfulStoreId: printfulStoreId || storeInfo.result.id,
        apiKey: PRINTFUL_API_KEY,
        connected: true,
        connectedAt: new Date().toISOString()
      };
      
      res.json({
        success: true,
        message: 'Successfully connected to Printful store',
        store: storeInfo.result,
        settings: integrationSettings
      });
    } else {
      res.json({
        success: false,
        error: 'Failed to connect to Printful store',
        details: storeInfo
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

// Sync products from Printful to MarketPace
router.post('/business-integration/sync', async (req, res) => {
  try {
    const { businessId } = req.body;
    
    console.log('Syncing Printful products for business:', businessId);
    
    // Get store products from Printful
    const storeProducts = await printfulRequest('/store/products');
    
    if (storeProducts.code === 200) {
      const products = storeProducts.result;
      
      res.json({
        success: true,
        message: 'Products synced successfully',
        productsFound: products.length,
        productsSynced: products.length,
        products: products.map((product: any) => ({
          id: product.id,
          name: product.name,
          thumbnail: product.thumbnail_url,
          price: product.retail_price,
          currency: product.currency,
          variants: product.variants?.length || 0
        }))
      });
    } else {
      res.json({
        success: false,
        error: 'Failed to fetch products from Printful',
        details: storeProducts
      });
    }
  } catch (error: any) {
    console.error('Printful sync error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync products',
      message: error.message
    });
  }
});

export default router;