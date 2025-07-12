# Facebook and Google OAuth Setup Instructions

## Current Issue Resolution

### Facebook Configuration Required

**ALTERNATIVE SOLUTION IMPLEMENTED:** Server-side OAuth flow that bypasses JavaScript SDK domain issues!

**Required Facebook App Configuration:**
- Go to https://developers.facebook.com/apps/1043690817269912
- Navigate to **Facebook Login** → **Settings**
- Add to **Valid OAuth Redirect URIs**:
  ```
  https://www.marketpace.shop/api/auth/facebook/redirect
  https://marketpace.shop/api/auth/facebook/redirect
  https://ihavecreativeid-workspace.replit.dev/api/auth/facebook/redirect
  ```

**No JavaScript SDK configuration needed!** The authentication now uses server-side OAuth flow that works without domain restrictions.

### Google OAuth Configuration Required

**1. Add Authorized Redirect URIs in Google Cloud Console:**
- Go to https://console.cloud.google.com/
- Navigate to **Credentials** → **OAuth 2.0 Client IDs**
- Select your client ID: `167280787729-dgvuodnecaeraphr8rulh5u0028f7qbk.apps.googleusercontent.com`
- Add these to **Authorized redirect URIs**:
  ```
  https://www.marketpace.shop/api/auth/google/callback
  https://www.marketpace.shop/signup-login.html
  https://marketpace.shop/api/auth/google/callback
  https://marketpace.shop/signup-login.html
  https://ihavecreativeid-workspace.replit.dev/signup-login.html
  https://ihavecreativeid-workspace.replit.dev/api/auth/google/callback
  ```

**2. Add Authorized JavaScript Origins:**
- In the same OAuth 2.0 client configuration
- Add these to **Authorized JavaScript origins**:
  ```
  https://www.marketpace.shop
  https://marketpace.shop
  https://ihavecreativeid-workspace.replit.dev
  ```

## Current App Configuration

- **Facebook App ID:** 1043690817269912
- **Google Client ID:** 167280787729-dgvuodnecaeraphr8rulh5u0028f7qbk.apps.googleusercontent.com
- **Production Domain:** www.marketpace.shop (primary)
- **Alternative Domain:** marketpace.shop (redirect to www)
- **Development Domain:** ihavecreativeid-workspace.replit.dev (testing)

## After Making These Changes

1. Save all settings in both Facebook and Google consoles
2. Wait 5-10 minutes for changes to propagate
3. Test authentication again

The authentication will work properly once these domain configurations are updated in both platforms.