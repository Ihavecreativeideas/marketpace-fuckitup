# Google Maps API Setup Guide for MarketPace

## Platform-Specific API Key Configuration

### Step 1: Create API Keys in Google Cloud Console

You need **3 separate API keys** with different restrictions:

#### Web API Key (for website)
- **Restriction Type**: HTTP referrers (web sites)  
- **Website Restrictions**:
  - `https://www.marketpace.shop/*`
  - `https://*.replit.dev/*` 
  - `http://localhost:*/*`
  - `https://*.replit.co/*`

#### iOS API Key (for iPhone/iPad app)
- **Restriction Type**: iOS apps
- **Bundle Identifier**: `com.marketpace.app` (or your iOS bundle ID)

#### Android API Key (for Android app)  
- **Restriction Type**: Android apps
- **Package Name**: `com.marketpace.app` (or your Android package name)
- **SHA-1 Certificate**: (get this from your Android development setup)

### Step 2: Enable Required APIs

Enable these APIs for all three keys:

✅ **Maps JavaScript API** (for web interface)  
✅ **Maps SDK for iOS** (for iOS app)  
✅ **Maps SDK for Android** (for Android app)  
✅ **Places API** (for business search in geo QR system)  
✅ **Geocoding API** (for address validation)  
✅ **Directions API** (for driver routing)

### Step 3: Add Keys to Environment

Update your `.env` file with:

```bash
# Google Maps API Configuration
GOOGLE_MAPS_API_KEY_WEB=your_web_api_key_here
GOOGLE_MAPS_API_KEY_IOS=your_ios_api_key_here  
GOOGLE_MAPS_API_KEY_ANDROID=your_android_api_key_here
```

## MarketPace Integration Points

### 1. Driver Dashboard (`enhanced-driver-dashboard.html`)
- **Real-time route optimization** using Directions API
- **Traffic layer integration** for optimal delivery timing  
- **Driver location tracking** with GPS coordinates
- **Interactive route visualization** with pickup/dropoff markers

### 2. Business Scheduling (`business-scheduling.html`)
- **Employee location verification** for shift assignments
- **Business address validation** using Geocoding API
- **Multi-location business support** for chain stores
- **Geofenced attendance tracking** with radius validation

### 3. Geo QR Code System (`employee-geo-qr-system.html`)  
- **Global business search** using Places API
- **Location-based QR validation** with customizable radius
- **Address autocomplete** for manual business entry
- **GPS verification** for secure employee check-ins

## API Endpoints Created

The MarketPace server now includes these Google Maps endpoints:

### `/api/maps/api-key` (GET)
- **Purpose**: Returns appropriate API key based on platform
- **Platform Detection**: Automatically detects iOS/Android/Web from User-Agent
- **Response**: `{ apiKey: "key", platform: "web|ios|android" }`

### `/api/maps/places/search` (POST)  
- **Purpose**: Search businesses globally using Places API
- **Request**: `{ query: "business name", location?: {lat, lng} }`
- **Response**: `{ success: true, results: [...], status: "OK" }`

### `/api/maps/geocode` (POST)
- **Purpose**: Convert addresses to GPS coordinates  
- **Request**: `{ address: "123 Main St, City, State" }`
- **Response**: `{ success: true, results: [...] }`

### `/api/maps/directions` (POST)
- **Purpose**: Calculate optimized routes for drivers
- **Request**: `{ origin: "start", destination: "end", waypoints: [...] }`  
- **Response**: `{ success: true, routes: [...] }`

## Security Features

### Platform-Based Key Distribution
- Web browsers receive web-restricted keys
- iOS apps receive iOS-restricted keys  
- Android apps receive Android-restricted keys
- Server-side key selection based on User-Agent detection

### Request Validation
- All API calls routed through MarketPace server
- Rate limiting and request validation
- Error handling for missing or invalid keys
- Fallback to manual entry when APIs unavailable

## Next Steps

1. **Configure your three API keys** in Google Cloud Console with proper restrictions
2. **Add keys to your `.env` file** using the variable names shown above
3. **Test the enhanced driver dashboard** at `/enhanced-driver-dashboard.html`
4. **Verify geo QR business search** functionality
5. **Test business scheduling** address validation

The system will automatically detect when keys are configured and enable full Google Maps functionality across your website, iOS app, and Android app.