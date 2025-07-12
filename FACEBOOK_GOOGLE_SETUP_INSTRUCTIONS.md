# Facebook and Google OAuth Setup Instructions

## Current Issue Resolution

### Facebook Configuration Required

**1. Enable JavaScript SDK in Facebook Developer Console:**
- Go to https://developers.facebook.com/
- Select your app: **MarketPace** (App ID: 1043690817269912)
- Go to **Facebook Login** → **Settings**
- Toggle **"Login with Javascript SDK"** to **YES**

**2. Add App Domains:**
- In your Facebook app settings → **Basic Settings**
- Add these domains to **App Domains** field:
  ```
  replit.dev
  replit.co
  ihavecreativeid-workspace.replit.dev
  ```

**3. Add Valid OAuth Redirect URIs:**
- Go to **Facebook Login** → **Settings**
- Add these to **Valid OAuth Redirect URIs**:
  ```
  https://ihavecreativeid-workspace.replit.dev/signup-login.html
  https://ihavecreativeid-workspace.replit.dev/api/auth/facebook/callback
  ```

### Google OAuth Configuration Required

**1. Add Authorized Redirect URIs in Google Cloud Console:**
- Go to https://console.cloud.google.com/
- Navigate to **Credentials** → **OAuth 2.0 Client IDs**
- Select your client ID: `167280787729-dgvuodnecaeraphr8rulh5u0028f7qbk.apps.googleusercontent.com`
- Add these to **Authorized redirect URIs**:
  ```
  https://ihavecreativeid-workspace.replit.dev/signup-login.html
  https://ihavecreativeid-workspace.replit.dev/api/auth/google/callback
  ```

**2. Add Authorized JavaScript Origins:**
- In the same OAuth 2.0 client configuration
- Add these to **Authorized JavaScript origins**:
  ```
  https://ihavecreativeid-workspace.replit.dev
  ```

## Current App Configuration

- **Facebook App ID:** 1043690817269912
- **Google Client ID:** 167280787729-dgvuodnecaeraphr8rulh5u0028f7qbk.apps.googleusercontent.com
- **Primary Domain:** ihavecreativeid-workspace.replit.dev

## After Making These Changes

1. Save all settings in both Facebook and Google consoles
2. Wait 5-10 minutes for changes to propagate
3. Test authentication again

The authentication will work properly once these domain configurations are updated in both platforms.