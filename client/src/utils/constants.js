export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

export const CATEGORIES = {
  SHOPS: 'shops',
  SERVICES: 'services',
  ENTERTAINMENT: 'entertainment',
};

export const USER_TYPES = {
  BUYER: 'buyer',
  SELLER: 'seller',
  DRIVER: 'driver',
  ADMIN: 'admin',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PICKUP: 'pickup',
  IN_TRANSIT: 'in_transit',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
};

export const DELIVERY_ROUTE_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
};

export const LISTING_CONDITIONS = {
  NEW: 'new',
  LIKE_NEW: 'like_new',
  GOOD: 'good',
  FAIR: 'fair',
  POOR: 'poor',
};

export const RENTAL_PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
};

export const COMMUNITY_POST_TYPES = {
  GENERAL: 'general',
  EVENT: 'event',
  ANNOUNCEMENT: 'announcement',
  QUESTION: 'question',
};

export const VERIFICATION_STATUS = {
  PENDING: 'pending',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded',
};

export const OFFER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COUNTERED: 'countered',
};

export const DELIVERY_OPTIONS = {
  PICKUP: 'pickup',
  DELIVERY: 'delivery',
  BOTH: 'both',
};

export const ROUTE_COLORS = [
  '#007AFF', '#4DA6FF', // Blue variants
  '#FF3B30', '#FF6B6B', // Red variants
  '#34C759', '#7ED321', // Green variants
  '#FF9500', '#FFB84D', // Orange variants
  '#AF52DE', '#D478F0', // Purple variants
  '#FF2D92', '#FF7DC7', // Pink variants
];
