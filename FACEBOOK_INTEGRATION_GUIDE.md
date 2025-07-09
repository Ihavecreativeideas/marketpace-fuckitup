# Facebook Integration Setup Guide for MarketPace

## Step 1: Create Facebook App

1. **Go to Facebook Developers**
   - Visit https://developers.facebook.com/
   - Click "My Apps" → "Create App"
   - Select "Consumer" or "Business" type
   - Fill in app name: "MarketPace"

2. **Add Required Products**
   - Facebook Login (for user authentication)
   - Facebook Commerce API (for marketplace integration)
   - Webhooks (for real-time updates)

## Step 2: Configure App Settings

1. **Basic Settings**
   - App ID: (save this for environment variables)
   - App Secret: (save this for environment variables)
   - Add platform: Website
   - Site URL: https://marketpace.shop

2. **Facebook Login Settings**
   - Valid OAuth Redirect URIs: 
     - https://marketpace.shop/auth/facebook/callback
     - http://localhost:5000/auth/facebook/callback (for testing)
   - Deauthorize Callback URL: https://marketpace.shop/auth/facebook/deauth

## Step 3: Set Up Required Permissions

**For User Authentication:**
- `email` - User's email address
- `public_profile` - Basic profile information

**For Marketplace Integration:**
- `pages_manage_metadata` - Manage page information
- `pages_read_engagement` - Read page interactions
- `catalog_management` - Manage product catalogs
- `business_management` - Manage business assets

**For Marketing Automation:**
- `pages_messaging` - Send messages to page
- `pages_manage_posts` - Create and manage posts

## Step 4: Environment Variables Needed

Add these to your `.env` file:

```
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
FACEBOOK_VERIFY_TOKEN=your_custom_verify_token_here
FACEBOOK_PAGE_ACCESS_TOKEN=your_page_access_token_here
FACEBOOK_WEBHOOK_SECRET=your_webhook_secret_here
```

## Step 5: Set Up Webhooks

1. **Configure Webhook URL**
   - Callback URL: https://marketpace.shop/api/facebook/webhook
   - Verify Token: (use your custom token from .env)

2. **Subscribe to Events**
   - `messages` - For customer inquiries
   - `messaging_postbacks` - For button clicks
   - `feed` - For post interactions

## Step 6: Get Page Access Token

1. **Generate Token**
   - Go to Graph API Explorer
   - Select your app
   - Choose page you want to manage
   - Generate long-lived page access token

2. **Test Token**
   - Use Graph API Explorer to test permissions
   - Try GET /me/accounts to verify access

## Step 7: Implementation Checklist

### Frontend Integration (Client-side)
- [ ] Facebook SDK for JavaScript loaded
- [ ] Facebook Login button implemented
- [ ] Profile sync after login
- [ ] Product sharing functionality

### Backend Integration (Server-side)
- [ ] Facebook passport strategy configured
- [ ] Webhook endpoint secured and verified
- [ ] Product catalog API calls
- [ ] Message handling system
- [ ] Auto-reply functionality

### Testing
- [ ] Login/logout flow works
- [ ] Product sharing to Facebook
- [ ] Webhook receives messages
- [ ] Auto-replies are sent
- [ ] Error handling works

## Step 8: Go Live

1. **App Review Process**
   - Submit app for review
   - Provide use case descriptions
   - Include privacy policy
   - Complete business verification

2. **Switch to Live Mode**
   - Update App Mode to "Live"
   - Test with real users
   - Monitor error logs

## Security Notes

- Never expose App Secret in client-side code
- Use HTTPS for all webhook endpoints
- Verify webhook signatures
- Implement rate limiting
- Store tokens securely encrypted

## Quick Start Commands

```bash
# Install required packages
npm install passport-facebook facebook-graph-api

# Set up environment variables
cp .env.example .env
# Edit .env with your Facebook credentials

# Test webhook locally
ngrok http 5000
# Use ngrok URL for webhook testing
```

## Common Issues

1. **Token Expires**: Implement token refresh logic
2. **Webhook Verification Fails**: Check verify token matches
3. **Permission Denied**: Ensure all required permissions are granted
4. **Rate Limits**: Implement exponential backoff

## Support Resources

- Facebook Developer Documentation: https://developers.facebook.com/docs/
- Graph API Explorer: https://developers.facebook.com/tools/explorer/
- Webhook Tester: https://developers.facebook.com/tools/webhooks/