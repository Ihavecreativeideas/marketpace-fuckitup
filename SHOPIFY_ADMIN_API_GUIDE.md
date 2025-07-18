# Shopify Admin API Configuration Guide

## Current Issue: Wrong API Section

You're currently viewing **"unauthenticated_"** scopes (Storefront API), but MarketPace needs **Admin API** scopes.

## How to Find Admin API Scopes

### Step 1: Look for Admin API Section
In your Shopify app configuration, look for:
- **"Admin API integration"** section (not "Storefront API")
- **"Admin API access scopes"** (not "unauthenticated_" scopes)
- Scopes without "unauthenticated_" prefix

### Step 2: Required Admin API Scopes
Select these scopes (they should NOT have "unauthenticated_" prefix):
- `read_products` ✅
- `write_products` ✅
- `read_orders` ✅
- `read_locations` ✅
- `read_inventory` ✅
- `read_customers` ✅

### Step 3: What You're Currently Seeing (Wrong Section)
❌ `unauthenticated_read_products` - This is Storefront API
❌ `unauthenticated_read_customers` - This is Storefront API
❌ `unauthenticated_read_content` - This is Storefront API

### Step 4: What You Need to Find (Correct Section)
✅ `read_products` - This is Admin API
✅ `read_customers` - This is Admin API
✅ `read_orders` - This is Admin API

## Navigation Tips

1. **Look for tabs**: There might be separate tabs for "Admin API" vs "Storefront API"
2. **Scroll up/down**: Admin API scopes might be in a different section
3. **Check for "Admin API integration"**: This is the section you need
4. **Look for scopes without "unauthenticated_" prefix**

## Expected Interface

You should see something like:
```
Admin API integration
└── Access scopes
    ├── read_products
    ├── write_products
    ├── read_orders
    ├── read_locations
    └── read_inventory
```

NOT:
```
Storefront API (unauthenticated access)
└── Access scopes
    ├── unauthenticated_read_products
    ├── unauthenticated_read_customers
    └── unauthenticated_read_content
```

## Test Connection
Once you configure the correct Admin API scopes, I can test the integration immediately.

---
**Next Step**: Find and configure the Admin API scopes (without "unauthenticated_" prefix)