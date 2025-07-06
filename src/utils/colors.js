// MarketPace Futuristic Dark Purple Theme
export const colors = {
  // Primary brand colors - Futuristic dark purple gradient
  primary: '#8B5CF6',      // Bright purple
  primaryLight: '#A78BFA', // Light purple
  primaryDark: '#6366F1',  // Deep purple blue
  
  // Secondary colors - Cosmic gradient accents
  secondary: '#C084FC',    // Medium light purple
  secondaryLight: '#DDD6FE', // Very light purple
  secondaryDark: '#7C3AED', // Dark purple
  
  // Semantic colors with futuristic glow
  success: '#10B981',      // Emerald green
  warning: '#F59E0B',      // Amber  
  error: '#EF4444',        // Red
  info: '#3B82F6',         // Blue
  
  // Core theme colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Dark theme grayscale
  gray: '#6B7280',         // Medium gray
  lightGray: '#9CA3AF',    // Light gray
  darkGray: '#374151',     // Dark gray
  
  // Text colors for dark theme
  text: '#F9FAFB',         // Very light text
  textSecondary: '#E5E7EB', // Secondary light text
  textTertiary: '#D1D5DB',  // Tertiary light text
  textMuted: '#9CA3AF',    // Muted text
  
  // Dark background colors
  background: '#0F0B1F',   // Very dark purple
  backgroundSecondary: '#1A1625', // Dark purple
  backgroundTertiary: '#2D1B52',  // Medium dark purple
  
  // Glass morphism surfaces
  surface: 'rgba(139, 92, 246, 0.1)',     // Semi-transparent purple
  surfaceSecondary: 'rgba(99, 102, 241, 0.08)', // Semi-transparent purple blue
  surfaceGlass: 'rgba(255, 255, 255, 0.05)', // Glass effect
  
  // Border colors for dark theme
  border: 'rgba(139, 92, 246, 0.3)',       // Purple border
  borderLight: 'rgba(139, 92, 246, 0.2)',  // Light purple border
  
  // Futuristic marketplace categories
  marketplace: {
    shops: '#6366F1',      // Purple blue for shops
    services: '#10B981',   // Emerald for services
    events: '#F59E0B',     // Amber for events/hub
    community: '#8B5CF6',  // Purple for community features
    delivery: '#3B82F6',   // Blue for delivery
    rentals: '#C084FC',    // Light purple for rentals
  },
  
  // Futuristic theme specific colors
  cosmic: {
    // Main gradient backgrounds
    gradient: {
      primary: ['#0F0B1F', '#1A1625', '#2D1B52'],   // Dark to medium purple
      secondary: ['#1A1625', '#2D1B52', '#4C1D95'], // Medium purple gradient
      accent: ['#6366F1', '#8B5CF6', '#C084FC'],     // Bright purple gradient
    },
    // Floating particles
    particles: {
      primary: '#A78BFA',    // Light purple particles
      secondary: '#C084FC',  // Medium light purple
      glow: '#DDD6FE',       // Very light purple glow
      trail: 'rgba(139, 92, 246, 0.6)', // Particle trails
    },
    // Glass morphism effects
    glass: {
      light: 'rgba(255, 255, 255, 0.1)',
      medium: 'rgba(255, 255, 255, 0.05)',
      dark: 'rgba(0, 0, 0, 0.2)',
      border: 'rgba(139, 92, 246, 0.3)',
    },
    // Neon glow effects
    neon: {
      purple: '#8B5CF6',
      blue: '#6366F1',
      pink: '#EC4899',
      cyan: '#06B6D4',
    },
  },
  
  // Delivery status colors with futuristic theme
  delivery: {
    pending: '#F59E0B',    // Amber
    inProgress: '#3B82F6', // Blue
    completed: '#10B981',  // Emerald
    cancelled: '#EF4444',  // Red
  },
  
  // Driver status colors
  driver: {
    offline: '#6B7280',    // Gray
    online: '#10B981',     // Emerald
    busy: '#F59E0B',       // Amber
  },
  
  // Rating/review colors
  rating: {
    excellent: '#10B981',  // Emerald (4.5-5 stars)
    good: '#F59E0B',       // Amber (3.5-4.4 stars)
    average: '#FB923C',    // Orange (2.5-3.4 stars)
    poor: '#EF4444',       // Red (1-2.4 stars)
  },
  
  // Dark theme overlay colors
  overlay: 'rgba(15, 11, 31, 0.8)',         // Dark purple overlay
  overlayLight: 'rgba(15, 11, 31, 0.6)',    // Light dark overlay
  overlayDark: 'rgba(15, 11, 31, 0.9)',     // Heavy dark overlay
  overlayGlass: 'rgba(139, 92, 246, 0.1)',  // Glass overlay
  
  // Transparent colors for subtle effects
  transparent: 'transparent',
  
  // Futuristic shadow colors with purple tint
  shadowColor: '#8B5CF6',
  shadowLight: 'rgba(139, 92, 246, 0.2)',
  shadowMedium: 'rgba(139, 92, 246, 0.4)',
  shadowDark: 'rgba(139, 92, 246, 0.6)',
  shadowGlow: 'rgba(139, 92, 246, 0.8)',
};

// Color utility functions
export const colorUtils = {
  // Add alpha transparency to a color
  addAlpha: (color, alpha) => {
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
  },
  
  // Lighten a color
  lighten: (color, amount = 0.1) => {
    // This is a simplified version - for production use a proper color manipulation library
    return color + Math.round(255 * amount).toString(16).padStart(2, '0');
  },
  
  // Darken a color
  darken: (color, amount = 0.1) => {
    // This is a simplified version - for production use a proper color manipulation library
    return color;
  },
  
  // Get contrast color (black or white) for given background
  getContrastColor: (backgroundColor) => {
    // Simple contrast detection - return white for dark colors, black for light colors
    const darkColors = [colors.primary, colors.secondary, colors.success, colors.error, colors.black, colors.darkGray];
    return darkColors.includes(backgroundColor) ? colors.white : colors.black;
  },
  
  // Get status color based on condition
  getStatusColor: (status) => {
    const statusColors = {
      active: colors.success,
      inactive: colors.gray,
      pending: colors.warning,
      error: colors.error,
      cancelled: colors.error,
      completed: colors.success,
      draft: colors.gray,
    };
    
    return statusColors[status] || colors.gray;
  },
  
  // Get marketplace category color
  getCategoryColor: (category) => {
    const categoryColors = {
      shops: colors.marketplace.shops,
      services: colors.marketplace.services,
      events: colors.marketplace.events,
      rentals: colors.marketplace.rentals,
      hub: colors.marketplace.events,
    };
    
    return categoryColors[category] || colors.primary;
  },
  
  // Get rating color based on score
  getRatingColor: (rating) => {
    if (rating >= 4.5) return colors.rating.excellent;
    if (rating >= 3.5) return colors.rating.good;
    if (rating >= 2.5) return colors.rating.average;
    return colors.rating.poor;
  },
  
  // Get delivery status color
  getDeliveryStatusColor: (status) => {
    return colors.delivery[status] || colors.gray;
  },
  
  // Get driver status color
  getDriverStatusColor: (status) => {
    return colors.driver[status] || colors.gray;
  },
};

// Theme variants (for future dark mode support)
export const themes = {
  light: {
    ...colors,
    background: colors.background,
    surface: colors.surface,
    text: colors.text,
    border: colors.border,
  },
  
  dark: {
    ...colors,
    // Override colors for dark theme
    background: '#000000',
    surface: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#EBEBF5',
    border: '#38383A',
    lightGray: '#1C1C1E',
    gray: '#EBEBF5',
  },
};

// Export default colors
export default colors;
