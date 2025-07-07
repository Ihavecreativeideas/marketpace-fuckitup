# Facebook Marketing Automation Testing Guide

## Quick Demo Testing (No Facebook Setup Required)

### 1. Test Integration Interface
1. Open MarketPace app → Profile → Integrations
2. You'll see the Facebook Marketing Automation section with:
   - "Connect Facebook Page" button
   - "Share Product Demo" button
   - Feature checklist showing auto-posting and messaging capabilities

### 2. Test Demo Functions
- Click "Connect Facebook Page" - prompts for access token (demo mode)
- Click "Share Product Demo" - simulates posting a vintage chair listing
- Both buttons show success/error messages demonstrating the workflow

## Full Facebook Testing (Requires Facebook Developer Account)

### Step 1: Set Up Facebook App
1. Go to https://developers.facebook.com/
2. Create a new app → Business → Continue
3. Add Facebook Login and Webhooks products
4. Configure these permissions:
   - `pages_manage_posts` (post to pages)
   - `pages_messaging` (respond to messages)
   - `pages_read_engagement` (read comments/messages)

### Step 2: Get Access Tokens
1. In Facebook App → Tools → Graph API Explorer
2. Select your page and generate User Access Token
3. Exchange for long-lived Page Access Token using:
   ```
   https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=YOUR_APP_ID&client_secret=YOUR_APP_SECRET&fb_exchange_token=SHORT_LIVED_TOKEN
   ```

### Step 3: Configure Environment Variables
Add to your `.env` file:
```
FACEBOOK_PAGE_ACCESS_TOKEN=your_page_access_token_here
FACEBOOK_VERIFY_TOKEN=your_custom_verify_token_here
```

### Step 4: Set Up Webhook
1. In Facebook App → Webhooks → New Subscription
2. Callback URL: `https://your-replit-domain.replit.app/api/facebook/webhook`
3. Verify Token: Use the same token from your .env file
4. Subscribe to: `messages`, `messaging_postbacks`

### Step 5: Test Live Integration
1. Connect your Facebook page using the real access token
2. Post a product - it will appear on your Facebook page with delivery link
3. Comment "Is this still available?" on the Facebook post
4. The webhook will trigger and auto-reply through Messenger

## API Endpoints for Direct Testing

### Connect Facebook Account
```bash
curl -X POST http://localhost:5000/api/facebook/connect \
  -H "Content-Type: application/json" \
  -d '{"accessToken": "YOUR_ACCESS_TOKEN"}'
```

### Post Product to Facebook
```bash
curl -X POST http://localhost:5000/api/facebook/post \
  -H "Content-Type: application/json" \
  -d '{
    "productData": {
      "id": "test123",
      "title": "Test Product",
      "description": "This is a test product for MarketPace",
      "price": 50
    }
  }'
```

### Check Facebook Analytics
```bash
curl http://localhost:5000/api/facebook/analytics
```

### View Recent Messages
```bash
curl http://localhost:5000/api/facebook/messages
```

## Testing Webhook Responses

### Simulate Facebook Message Webhook
```bash
curl -X POST http://localhost:5000/api/facebook/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "entry": [{
      "messaging": [{
        "sender": {"id": "test_user_123"},
        "message": {"text": "Is this still available?"}
      }]
    }]
  }'
```

## Expected Behaviors

### Successful Facebook Post
- Returns post ID from Facebook
- Creates "Deliver Now" link: `https://marketpace.app/product/{id}?deliver_now=true`
- Tracks post in analytics system

### Auto-Reply Triggers
Messages containing these phrases trigger auto-replies:
- "is this still available"
- "still available"
- "available?"

### Auto-Reply Message
"Yes it is! Purchase now and have it delivered to you at the next available delivery route from MarketPace. Click the link in the original post to order!"

## Troubleshooting

### Common Issues
1. **Invalid Access Token**: Ensure token has proper permissions and hasn't expired
2. **Webhook Verification Failed**: Check verify token matches .env file
3. **Auto-Reply Not Working**: Verify webhook is subscribed to 'messages' event
4. **Posts Not Appearing**: Check page permissions and app review status

### Debug Mode
Check server logs for detailed Facebook API responses and error messages.