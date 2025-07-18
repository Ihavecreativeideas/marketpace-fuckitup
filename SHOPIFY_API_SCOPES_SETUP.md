# Shopify API Scopes Setup Guide

## Current Issue: Missing API Scopes

Your Shopify app "MarketPace" is installed but needs API scopes to be configured before it can access your store data.

## Required API Scopes for MarketPace Integration

### Admin API Scopes (Required)
- `read_products` - Access product information for syncing
- `write_products` - Update product information and variants
- `read_orders` - Access order information for tracking
- `read_locations` - Access store location information
- `read_inventory` - Access inventory levels
- `read_content` - Access store content and pages
- `read_customers` - Access customer information for orders

### Optional Enhanced Scopes
- `write_inventory` - Update inventory levels
- `write_orders` - Update order status
- `read_analytics` - Access sales analytics
- `read_marketing_events` - Access marketing data

## How to Configure API Scopes

### Step 1: Access App Configuration
1. Go to your Shopify Admin: https://myshop-marketpace-com.myshopify.com/admin
2. Navigate to **Settings > Apps and sales channels**
3. Click **Develop apps**
4. Click on your **MarketPace** app

### Step 2: Configure API Access
1. Click **Configuration** tab
2. Under **Admin API integration** section:
   - Click **Configure** or **Edit**
   - Select the required scopes listed above
   - Click **Save**

### Step 3: Install/Update App
1. After configuring scopes, click **Install app** or **Update app**
2. Review and approve the permissions
3. Click **Install** to confirm

### Step 4: Generate New Access Token (if needed)
1. Go to **API credentials** tab
2. Under **Admin API access token**:
   - If no token exists, click **Create token**
   - If token exists, you can use the existing one: `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`

## Verification Steps

After configuring scopes, test the integration:

1. **Test Product Access**:
   ```bash
   curl -s "https://myshop-marketpace-com.myshopify.com/admin/api/2024-01/products.json?limit=3" \
   -H "X-Shopify-Access-Token: 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"
   ```

2. **Test Location Access**:
   ```bash
   curl -s "https://myshop-marketpace-com.myshopify.com/admin/api/2024-01/locations.json" \
   -H "X-Shopify-Access-Token: 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"
   ```

## Expected Results After Configuration

- ✅ Product synchronization will work
- ✅ Inventory management will be active
- ✅ Order tracking will be functional
- ✅ MarketPace business integration will be fully operational

## Troubleshooting

If you still get permission errors after configuration:
1. **Regenerate Access Token**: Create a new token after scope configuration
2. **Check App Status**: Ensure app shows as "Installed" not "Draft"
3. **Verify Scopes**: Confirm all required scopes are checked and saved

---
**Next Step**: Configure the required API scopes in your Shopify Admin, then test the integration again.