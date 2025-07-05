// App configuration constants
export const APP_CONFIG = {
  name: 'MarketPace',
  version: '1.0.0',
  description: 'Your marketplace delivery service',
  website: 'https://marketpace.app',
  supportEmail: 'support@marketpace.app',
  privacyPolicyUrl: 'https://marketpace.app/privacy',
  termsOfServiceUrl: 'https://marketpace.app/terms',
};

// API configuration
export const API_CONFIG = {
  baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

// Storage keys for AsyncStorage
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  CART_ITEMS: 'cart_items',
  USER_PREFERENCES: 'user_preferences',
  ONBOARDING_COMPLETED: 'onboarding_completed',
  LOCATION_PERMISSION: 'location_permission',
  NOTIFICATION_PERMISSION: 'notification_permission',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  LAST_SYNC: 'last_sync',
  CACHED_LISTINGS: 'cached_listings',
  SEARCH_HISTORY: 'search_history',
  FAVORITE_LISTINGS: 'favorite_listings',
};

// User roles and permissions
export const USER_ROLES = {
  GUEST: 'guest',
  USER: 'user',
  BUSINESS: 'business',
  DRIVER: 'driver',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

export const PERMISSIONS = {
  // User permissions
  CREATE_LISTING: 'create_listing',
  EDIT_LISTING: 'edit_listing',
  DELETE_LISTING: 'delete_listing',
  VIEW_ORDERS: 'view_orders',
  CREATE_ORDER: 'create_order',
  
  // Business permissions
  MANAGE_BUSINESS_PROFILE: 'manage_business_profile',
  VIEW_BUSINESS_ANALYTICS: 'view_business_analytics',
  MANAGE_BUSINESS_LISTINGS: 'manage_business_listings',
  
  // Driver permissions
  VIEW_DRIVER_DASHBOARD: 'view_driver_dashboard',
  ACCEPT_DELIVERIES: 'accept_deliveries',
  MANAGE_DELIVERY_ROUTES: 'manage_delivery_routes',
  VIEW_DRIVER_EARNINGS: 'view_driver_earnings',
  
  // Admin permissions
  VIEW_ADMIN_DASHBOARD: 'view_admin_dashboard',
  MANAGE_USERS: 'manage_users',
  MANAGE_DRIVERS: 'manage_drivers',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_CONTENT: 'manage_content',
  MODERATE_REPORTS: 'moderate_reports',
  MANAGE_PAYMENTS: 'manage_payments',
  SYSTEM_SETTINGS: 'system_settings',
};

// Marketplace categories
export const MARKETPLACE_CATEGORIES = {
  SHOPS: {
    id: 'shops',
    name: 'Shops',
    icon: 'storefront',
    subcategories: [
      'Electronics',
      'Fashion',
      'Home & Garden',
      'Sports',
      'Books',
      'Toys',
      'Automotive',
      'Health & Beauty',
      'Music',
      'Art & Crafts',
    ],
  },
  SERVICES: {
    id: 'services',
    name: 'Services',
    icon: 'construct',
    subcategories: [
      'Cleaning',
      'Repairs',
      'Tutoring',
      'Beauty',
      'Fitness',
      'Tech Support',
      'Lawn Care',
      'Pet Care',
      'Moving',
      'Photography',
    ],
  },
  HUB: {
    id: 'hub',
    name: 'The Hub',
    icon: 'play-circle',
    subcategories: [
      'Concerts',
      'Sports',
      'Food & Drink',
      'Art & Culture',
      'Business',
      'Community',
      'Nightlife',
      'Festivals',
      'Workshops',
      'Meetups',
    ],
  },
};

// Listing conditions
export const LISTING_CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

// Order statuses
export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY_FOR_PICKUP: 'ready_for_pickup',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

// Delivery statuses
export const DELIVERY_STATUSES = {
  PENDING_ASSIGNMENT: 'pending_assignment',
  ASSIGNED: 'assigned',
  PICKUP_IN_PROGRESS: 'pickup_in_progress',
  IN_TRANSIT: 'in_transit',
  DELIVERY_IN_PROGRESS: 'delivery_in_progress',
  DELIVERED: 'delivered',
  FAILED: 'failed',
};

// Driver statuses
export const DRIVER_STATUSES = {
  OFFLINE: 'offline',
  ONLINE: 'online',
  BUSY: 'busy',
  BREAK: 'break',
};

// Payment methods
export const PAYMENT_METHODS = {
  CREDIT_CARD: 'credit_card',
  DEBIT_CARD: 'debit_card',
  PAYPAL: 'paypal',
  APPLE_PAY: 'apple_pay',
  GOOGLE_PAY: 'google_pay',
  CASH: 'cash',
};

// Validation constants
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^\+?[\d\s-()]+$/,
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]/,
  ZIP_CODE_REGEX: /^\d{5}(-\d{4})?$/,
  
  // File upload limits
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_DOCUMENT_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'image/jpeg', 'image/png'],
  
  // Listing limits
  MAX_LISTING_IMAGES: 10,
  MAX_LISTING_TITLE_LENGTH: 100,
  MAX_LISTING_DESCRIPTION_LENGTH: 2000,
  MAX_LISTING_TAGS: 10,
  
  // Cart limits
  MAX_CART_ITEMS: 50,
  MAX_ITEM_QUANTITY: 99,
  MIN_ORDER_AMOUNT: 5.00,
  
  // Delivery limits
  MAX_DELIVERY_DISTANCE: 25, // miles
  MAX_ROUTE_STOPS: 12,
  MAX_BULK_ITEMS: 6,
};

// Pricing constants
export const PRICING = {
  DELIVERY_FEE: 3.99,
  SERVICE_FEE_PERCENTAGE: 0.05, // 5%
  MIN_SERVICE_FEE: 1.99,
  MAX_SERVICE_FEE: 9.99,
  TAX_RATE: 0.08, // 8%
  
  // Driver compensation
  BASE_DELIVERY_PAY: 3.00,
  PER_MILE_PAY: 0.60,
  PER_STOP_PAY: 1.50,
  PEAK_HOURS_MULTIPLIER: 1.5,
  
  // Pro membership
  PRO_MONTHLY_PRICE: 9.99,
  PRO_ANNUAL_PRICE: 99.99,
  PRO_ANNUAL_DISCOUNT: 0.17, // 17% discount
};

// Time constants
export const TIME_CONSTANTS = {
  // Session timeouts
  SESSION_TIMEOUT: 30 * 24 * 60 * 60 * 1000, // 30 days
  REFRESH_TOKEN_TIMEOUT: 90 * 24 * 60 * 60 * 1000, // 90 days
  
  // Order timeouts
  ORDER_CONFIRMATION_TIMEOUT: 5 * 60 * 1000, // 5 minutes
  PICKUP_TIMEOUT: 15 * 60 * 1000, // 15 minutes
  DELIVERY_TIMEOUT: 5 * 60 * 1000, // 5 minutes
  
  // Cache timeouts
  LISTINGS_CACHE_TIMEOUT: 10 * 60 * 1000, // 10 minutes
  USER_CACHE_TIMEOUT: 5 * 60 * 1000, // 5 minutes
  
  // Retry timeouts
  API_RETRY_DELAY: 1000, // 1 second
  MAX_RETRY_ATTEMPTS: 3,
  
  // Real-time update intervals
  LOCATION_UPDATE_INTERVAL: 30 * 1000, // 30 seconds
  ORDER_STATUS_POLL_INTERVAL: 10 * 1000, // 10 seconds
  DRIVER_STATUS_POLL_INTERVAL: 60 * 1000, // 1 minute
};

// Feature flags
export const FEATURES = {
  SOCIAL_LOGIN: true,
  GUEST_MODE: true,
  BIOMETRIC_AUTH: true,
  PUSH_NOTIFICATIONS: true,
  LOCATION_SERVICES: true,
  OFFLINE_MODE: false,
  DARK_MODE: false,
  MULTI_LANGUAGE: false,
  LIVE_CHAT: true,
  VIDEO_CALLS: false,
  LIVE_STREAMING: false,
  AI_RECOMMENDATIONS: true,
  AUGMENTED_REALITY: false,
  VOICE_SEARCH: false,
  BARCODE_SCANNER: true,
  QR_CODE_SCANNER: true,
  PAYMENT_WALLET: true,
  CRYPTO_PAYMENTS: false,
  SUBSCRIPTION_PLANS: true,
  LOYALTY_PROGRAM: false,
  REFERRAL_SYSTEM: true,
  GAMIFICATION: false,
  ANALYTICS_TRACKING: true,
  CRASH_REPORTING: true,
  PERFORMANCE_MONITORING: true,
};

// Notification types
export const NOTIFICATION_TYPES = {
  ORDER_CONFIRMED: 'order_confirmed',
  ORDER_PREPARING: 'order_preparing',
  ORDER_READY: 'order_ready',
  ORDER_PICKED_UP: 'order_picked_up',
  ORDER_DELIVERED: 'order_delivered',
  ORDER_CANCELLED: 'order_cancelled',
  DRIVER_ASSIGNED: 'driver_assigned',
  DRIVER_NEARBY: 'driver_nearby',
  PAYMENT_PROCESSED: 'payment_processed',
  PAYMENT_FAILED: 'payment_failed',
  NEW_MESSAGE: 'new_message',
  LISTING_APPROVED: 'listing_approved',
  LISTING_REJECTED: 'listing_rejected',
  DRIVER_APPLICATION_STATUS: 'driver_application_status',
  PROMOTIONAL: 'promotional',
  SYSTEM_MAINTENANCE: 'system_maintenance',
};

// Error codes
export const ERROR_CODES = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  
  // Authentication errors
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EXPIRED_TOKEN: 'EXPIRED_TOKEN',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Business logic errors
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  DELIVERY_UNAVAILABLE: 'DELIVERY_UNAVAILABLE',
  
  // File upload errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE: 'INVALID_FILE_TYPE',
  UPLOAD_FAILED: 'UPLOAD_FAILED',
  
  // Location errors
  LOCATION_PERMISSION_DENIED: 'LOCATION_PERMISSION_DENIED',
  LOCATION_UNAVAILABLE: 'LOCATION_UNAVAILABLE',
  OUTSIDE_DELIVERY_AREA: 'OUTSIDE_DELIVERY_AREA',
  
  // Generic errors
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE',
};

// Success messages
export const SUCCESS_MESSAGES = {
  ACCOUNT_CREATED: 'Account created successfully!',
  LOGIN_SUCCESS: 'Welcome back!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  LISTING_CREATED: 'Listing created successfully!',
  ORDER_PLACED: 'Order placed successfully!',
  PAYMENT_PROCESSED: 'Payment processed successfully!',
  MESSAGE_SENT: 'Message sent successfully!',
  REVIEW_SUBMITTED: 'Review submitted successfully!',
  DRIVER_APPLICATION_SUBMITTED: 'Driver application submitted successfully!',
};

// Default values
export const DEFAULTS = {
  PROFILE_IMAGE: 'https://via.placeholder.com/150x150/CCCCCC/FFFFFF?text=User',
  LISTING_IMAGE: 'https://via.placeholder.com/300x200/CCCCCC/FFFFFF?text=No+Image',
  BUSINESS_LOGO: 'https://via.placeholder.com/100x100/CCCCCC/FFFFFF?text=Logo',
  
  PAGINATION: {
    PAGE_SIZE: 20,
    MAX_PAGE_SIZE: 100,
  },
  
  LOCATION: {
    DEFAULT_LATITUDE: 37.7749,
    DEFAULT_LONGITUDE: -122.4194,
    DEFAULT_ZOOM: 13,
  },
  
  SEARCH: {
    MIN_QUERY_LENGTH: 2,
    MAX_RECENT_SEARCHES: 10,
    DEBOUNCE_DELAY: 300,
  },
};

export default {
  APP_CONFIG,
  API_CONFIG,
  STORAGE_KEYS,
  USER_ROLES,
  PERMISSIONS,
  MARKETPLACE_CATEGORIES,
  LISTING_CONDITIONS,
  ORDER_STATUSES,
  DELIVERY_STATUSES,
  DRIVER_STATUSES,
  PAYMENT_METHODS,
  VALIDATION,
  PRICING,
  TIME_CONSTANTS,
  FEATURES,
  NOTIFICATION_TYPES,
  ERROR_CODES,
  SUCCESS_MESSAGES,
  DEFAULTS,
};
