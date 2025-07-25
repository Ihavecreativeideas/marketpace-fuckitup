# Deploy MarketPace to www.marketpace.shop

## Quick Deploy Steps

### 1. Deploy to Vercel
```bash
# Install Vercel CLI if you don't have it
npm i -g vercel

# Deploy to Vercel
vercel

# Add your custom domain
vercel domains add www.marketpace.shop
```

### 2. Configure Facebook App for Production Domain

Go to https://developers.facebook.com/ and update your Facebook App:

**In Facebook Login → Settings → Valid OAuth Redirect URIs, add:**
```
https://www.marketpace.shop/api/facebook/callback
https://www.marketpace.shop/api/facebook/popup-callback
https://marketpace.shop/api/facebook/callback
https://marketpace.shop/api/facebook/popup-callback
```

### 3. Update DNS Settings
Point your domain to Vercel:
- **A Record**: `76.76.21.21` (Vercel's IP)
- **CNAME**: `cname.vercel-dns.com`

### 4. Environment Variables
Your app is already configured with production URLs. Make sure these secrets are set in Vercel:
- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- etc.

## Current Status
✅ Server configured to prioritize production domain
✅ Vercel.json deployment configuration ready
✅ Production URLs already set in environment

## Test After Deployment
1. Visit https://www.marketpace.shop
2. Go to MyPace page
3. Test Facebook authentication
4. Should work without URL blocking errors

The app will automatically use your production domain URLs instead of temporary Replit domains once deployed.