import { Platform } from 'react-native';

// Environment detection
export const isWeb = Platform.OS === 'web';
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// API Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 
  (isWeb ? 'https://www.marketpace.shop' : 'http://localhost:5000');

// OAuth Configuration
export const OAUTH_CONFIG = {
  facebook: {
    appId: process.env.FACEBOOK_APP_ID || '1043690817269912',
    redirectUri: isWeb 
      ? `${API_BASE_URL}/api/auth/facebook/redirect`
      : 'fb1043690817269912://authorize',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || '167280787729-dgvuodnecaeraphr8rulh5u0028f7qbk.apps.googleusercontent.com',
    redirectUri: isWeb
      ? `${API_BASE_URL}/api/auth/google/callback`
      : 'com.marketpace.app://oauth/google',
  },
};

// Platform-specific features
export const FEATURES = {
  camera: !isWeb,
  location: true,
  pushNotifications: !isWeb,
  backgroundLocation: !isWeb,
  nativeDeepLinking: !isWeb,
  webDeepLinking: isWeb,
};

// Navigation configuration
export const NAVIGATION_CONFIG = {
  enableScreenTracking: true,
  enableUrlHandling: isWeb,
  initialRouteName: 'Marketplace',
};

export default {
  API_BASE_URL,
  OAUTH_CONFIG,
  FEATURES,
  NAVIGATION_CONFIG,
  isWeb,
  isIOS,
  isAndroid,
};