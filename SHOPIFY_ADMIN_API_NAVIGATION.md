# How to Find Admin API Scopes in Your Shopify App

## Current Status: ✅ Basic Admin API Access Working

Your access token is working for basic shop information, but you need to add specific scopes for products and inventory.

## Step-by-Step Navigation Guide

### In Your Shopify Admin Panel

1. **Go to your MarketPace app settings**:
   - Settings → Apps and sales channels → Develop apps → MarketPace

2. **Look for "Admin API integration" section**:
   - This should be SEPARATE from the "Storefront API" section you were viewing
   - May be labeled as "Admin API" or "Private app scopes"

3. **Admin API scopes you need to check**:
   - `read_products` ✅
   - `write_products` ✅
   - `read_orders` ✅
   - `read_locations` ✅
   - `read_inventory` ✅

### What You're Looking For

**CORRECT Section (Admin API)**:
```
Admin API integration
└── Configure scopes
    ├── read_products ☐
    ├── write_products ☐
    ├── read_orders ☐
    ├── read_locations ☐
    └── read_inventory ☐
```

**WRONG Section (what you were viewing)**:
```
Storefront API
└── Unauthenticated access scopes
    ├── unauthenticated_read_products ☐
    ├── unauthenticated_read_customers ☐
    └── unauthenticated_read_content ☐
```

### Alternative Places to Look

If you don't see "Admin API integration":
1. **Check for tabs**: Look for "Admin API" vs "Storefront API" tabs
2. **Scroll up/down**: Admin API might be above or below current view
3. **Look for "Private app scopes"**: Some interfaces use this label
4. **Check "Configuration" tab**: Admin API settings might be in Configuration section

## Test Commands

Once you enable the scopes, I can test:
- Products: `curl "https://myshop-marketpace-com.myshopify.com/admin/api/2024-01/products.json?limit=3"`
- Locations: `curl "https://myshop-marketpace-com.myshopify.com/admin/api/2024-01/locations.json"`

## What This Enables

After enabling these scopes:
✅ Product synchronization from Shopify to MarketPace
✅ Inventory management and stock updates
✅ Order tracking and fulfillment
✅ Local delivery integration for your products

---
**Current Status**: Your access token works for basic shop data. You just need to enable the specific Admin API scopes for products and inventory.