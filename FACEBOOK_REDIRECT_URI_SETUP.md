# Facebook OAuth Redirect URI Setup Guide

## Issue: "URL Blocked" Error

If you're seeing this error: **"URL Blocked: This redirect failed because the redirect URI is not whitelisted in the app's Client OAuth Settings"**

This means your current domain needs to be added to your Facebook App's OAuth settings.

## Quick Fix: Add Your Current Domain to Facebook App

### Step 1: Get Your Current Domain
Your current Replit domain appears to be: `workspace.ihavecreativeid.repl.co`

### Step 2: Update Facebook App Settings

1. **Go to Facebook Developers Console**
   - Visit: https://developers.facebook.com/
   - Log in with your Facebook account

2. **Select Your MarketPace App**
   - Click on your app from the dashboard
   - If you don't have an app yet, create one first

3. **Navigate to Facebook Login Settings**
   - In the left sidebar, click **"Facebook Login"** 
   - Then click **"Settings"**

4. **Add Valid OAuth Redirect URIs**
   In the "Valid OAuth Redirect URIs" field, add these URLs (one per line):

   ```
   https://workspace.ihavecreativeid.repl.co/api/facebook/callback
   https://workspace.ihavecreativeid.repl.co/api/facebook/popup-callback
   https://www.marketpace.shop/api/facebook/callback
   https://www.marketpace.shop/api/facebook/popup-callback
   ```

5. **Save Changes**
   - Click **"Save Changes"** at the bottom
   - Wait a few minutes for changes to propagate

### Step 3: Test Facebook Authentication

1. Go back to your MyPace page
2. Try the Facebook authentication again
3. The popup should now work properly

## Additional Facebook App Settings

### Required Permissions
Make sure your Facebook App has these permissions enabled:
- `user_friends` - To search Facebook friends
- `pages_read_engagement` - To search Facebook pages
- `pages_show_list` - To list user's pages
- `user_events` (optional) - For event search
- `user_location` (optional) - For location-based search

### App Review Status
- For development/testing: Your app can stay in "Development" mode
- For production: You'll need to submit for App Review to access real user data

## Troubleshooting

### Still Getting "URL Blocked"?
1. Double-check the redirect URIs are exactly as shown above
2. Make sure you clicked "Save Changes" in Facebook Developer Console
3. Wait 5-10 minutes for Facebook's cache to update
4. Try clearing your browser cache

### Facebook API Not Returning Data?
1. Make sure your Facebook App is in "Live" mode (not Development)
2. Verify the required permissions are granted
3. Check that your access token is valid

### Current Environment Variables Needed
Make sure these are set in your `.env` file:
```
FACEBOOK_APP_ID=your_app_id_here
FACEBOOK_APP_SECRET=your_app_secret_here
```

## Success Indicators

When working correctly, you should see:
✅ Facebook popup opens within the app (no redirects)
✅ "Connected to Facebook" success message
✅ Real Facebook friends/pages appear when searching with @ symbols
✅ No more "URL Blocked" errors

## Questions?

If you're still having issues after following these steps, the problem might be:
1. Facebook App ID/Secret not configured properly
2. Facebook App still in Development mode (limits real data access)
3. Missing required permissions in Facebook App settings

The system will fall back to demo data if Facebook integration isn't working, so core functionality remains available.