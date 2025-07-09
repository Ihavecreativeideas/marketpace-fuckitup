# Facebook Integration Testing Guide

## Prerequisites

Before you can fully integrate Facebook with MarketPace, you need to:

1. **Create a Facebook Developer Account**
   - Go to https://developers.facebook.com/
   - Create a developer account if you don't have one

2. **Create a Facebook App**
   - Click "Create App" → Select "Business" type
   - Name it "MarketPace" or similar
   - Add your business information

3. **Get Required Credentials**
   - App ID (public - can be in client code)
   - App Secret (private - server only)
   - Page Access Token (for your business page)

## Environment Variables Setup

Add these to your `.env` file:

```env
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
FACEBOOK_PAGE_ACCESS_TOKEN=your_page_access_token_here
FACEBOOK_VERIFY_TOKEN=your_custom_verify_token_here
FACEBOOK_WEBHOOK_SECRET=your_webhook_secret_here
```

## Testing the Integration

### 1. Authentication Test

```bash
# Test Facebook login (replace with your actual credentials)
curl -X POST http://localhost:5000/auth/facebook \
  -H "Content-Type: application/json"
```

### 2. Page Connection Test

```bash
# Test getting user pages
curl -X POST http://localhost:5000/api/facebook/connect \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{"accessToken": "YOUR_FACEBOOK_ACCESS_TOKEN"}'
```

### 3. Post Creation Test

```bash
# Test posting to Facebook page
curl -X POST http://localhost:5000/api/facebook/post \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "pageId": "YOUR_PAGE_ID",
    "message": "Check out this amazing product on MarketPace!",
    "link": "https://marketpace.shop"
  }'
```

### 4. Webhook Test

```bash
# Test webhook endpoint
curl -X POST http://localhost:5000/api/facebook/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "object": "page",
    "entry": [
      {
        "id": "PAGE_ID",
        "messaging": [
          {
            "sender": {"id": "USER_ID"},
            "message": {"text": "Is this still available?"}
          }
        ]
      }
    ]
  }'
```

## Frontend Integration

### 1. Add Facebook Login Component

```jsx
import { FacebookLogin } from './components/FacebookLogin';

function LoginPage() {
  const handleFacebookSuccess = (response) => {
    console.log('Facebook login successful:', response);
    // Save user data and redirect
  };

  const handleFacebookError = (error) => {
    console.error('Facebook login error:', error);
  };

  return (
    <div>
      <FacebookLogin 
        onSuccess={handleFacebookSuccess}
        onError={handleFacebookError}
        buttonText="Continue with Facebook"
      />
    </div>
  );
}
```

### 2. Add Facebook Share Component

```jsx
import { FacebookShare } from './components/FacebookShare';

function ProductPage({ product }) {
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      
      <FacebookShare 
        url={`https://marketpace.shop/products/${product.id}`}
        title={product.name}
        description={product.description}
        image={product.image}
      />
    </div>
  );
}
```

## Required Facebook App Configuration

### 1. App Settings
- **App Domain**: `marketpace.shop`
- **Privacy Policy URL**: `https://marketpace.shop/privacy`
- **Terms of Service URL**: `https://marketpace.shop/terms`

### 2. Facebook Login Settings
- **Valid OAuth Redirect URIs**: 
  - `https://marketpace.shop/auth/facebook/callback`
  - `http://localhost:5000/auth/facebook/callback` (for testing)

### 3. Webhooks Configuration
- **Callback URL**: `https://marketpace.shop/api/facebook/webhook`
- **Verify Token**: (use your custom token from .env)
- **Subscription Fields**: `messages`, `messaging_postbacks`, `feed`

### 4. Permissions Required
- `email` - User's email address
- `public_profile` - Basic profile information
- `pages_manage_metadata` - Manage page information
- `pages_read_engagement` - Read page interactions
- `pages_messaging` - Send messages to page
- `pages_manage_posts` - Create and manage posts

## Common Issues and Solutions

### 1. "App Not Set Up" Error
- Ensure your Facebook App is configured correctly
- Check that all required permissions are added
- Verify your app domain is set correctly

### 2. "Invalid Access Token" Error
- Check that your access token hasn't expired
- Ensure you're using the correct token type (user vs page)
- Verify the token has the required permissions

### 3. "Webhook Verification Failed"
- Ensure your verify token matches exactly
- Check that your webhook URL is accessible
- Verify SSL certificate is valid

### 4. "Permission Denied" Error
- Request additional permissions in your Facebook app
- Ensure user has granted the required permissions
- Check that your app is approved for the permission

## Production Deployment

### 1. App Review Process
- Submit your app for review with Facebook
- Provide detailed use case descriptions
- Include screenshots and demo videos
- Complete business verification if required

### 2. Go Live Checklist
- [ ] All environment variables are set
- [ ] Webhook URL is accessible and secure
- [ ] SSL certificate is installed
- [ ] Privacy policy is published
- [ ] Terms of service are published
- [ ] App is switched to "Live" mode
- [ ] All required permissions are approved

## Support Resources

- **Facebook Developer Docs**: https://developers.facebook.com/docs/
- **Graph API Explorer**: https://developers.facebook.com/tools/explorer/
- **Webhook Tester**: https://developers.facebook.com/tools/webhooks/
- **Facebook Developer Community**: https://developers.facebook.com/community/

## Success Metrics

Once integrated, you should be able to:
- [ ] Users can log in with Facebook
- [ ] Business owners can connect their Facebook pages
- [ ] Products can be automatically posted to Facebook
- [ ] Auto-replies work for marketplace inquiries
- [ ] Webhooks receive and process messages correctly
- [ ] Facebook sharing works from your website