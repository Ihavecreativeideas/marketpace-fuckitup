# Etsy API Integration Guide - Simple Steps

## What You Need
Just one thing: Your **Etsy API Key** (called "Keystring" in Etsy's developer portal)

## Step-by-Step Process

### 1. Go to Etsy Developer Portal
- Visit: **https://www.etsy.com/developers/**
- Sign in with your existing Etsy account (or create one if needed)

### 2. Create Your App
- Click **"Create a new app"** or go to **"Your Account" → "Apps"**
- Fill out the simple form:
  - **App Name**: "MarketPace Integration" 
  - **App Description**: "Marketplace platform connecting local businesses"
  - **Website URL**: `https://www.marketpace.shop`
  - **Callback URL**: `https://www.marketpace.shop/api/integrations/etsy/callback`

### 3. Get Your API Key
- Once approved (usually instant), you'll see your **"Keystring"**
- This keystring IS your API key - copy it
- Add it to your environment variables as `ETSY_API_KEY`

### 4. Test Connection
- Go to `/platform-integrations` on your MarketPace site
- Enter any Etsy shop ID (like "YourShopName" from the URL)
- Click "Connect Etsy" - it should work with your API key

## Rate Limits (Don't Worry About These)
Your integration automatically handles Etsy's limits:
- **10,000 requests per day** (plenty for most apps)
- **10 requests per second** maximum
- If you hit limits, wait 2 hours for more requests
- MarketPace shows remaining requests in the dashboard

## What The Rate Limit Info Means
That complex explanation from Etsy just means:
1. You get 10,000 API calls per day
2. Don't make more than 10 calls per second
3. If you run out, you can get more requests after waiting (max 2 hours)
4. Etsy tells you how many requests you have left in response headers

## Your Integration is Ready
Your MarketPace platform already:
- ✅ Handles rate limiting automatically
- ✅ Uses proper Etsy v3 API format
- ✅ Shows rate limit status in responses
- ✅ Supports both public and OAuth authentication
- ✅ Displays helpful error messages

## Need More API Calls?
If 10,000 daily requests isn't enough:
- Email `developer@etsy.com` 
- Describe your MarketPace app
- Estimate how many calls you need
- They can increase your limits

## Common Shop ID Examples
- If shop URL is `https://www.etsy.com/shop/VintageFinds` → Shop ID is `VintageFinds`
- If shop URL is `https://www.etsy.com/shop/HandmadeJewelry` → Shop ID is `HandmadeJewelry`

That's it! The technical complexity is already handled by your platform.

## Current Status
- ✅ Integration system built and ready
- ✅ Etsy API credentials configured
- ⏳ Waiting for Etsy to approve API key
- 📋 Ready to activate once approved

**Your Etsy App Details:**
- App Name: MarketPace Integration
- API Key: [Configured via environment variable ETSY_API_KEY]
- Status: Under review by Etsy

Once Etsy approves your API key, your integration will be fully functional!