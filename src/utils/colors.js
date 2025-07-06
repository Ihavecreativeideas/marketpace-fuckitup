// Color palette for MarketPace app - Community-focused cosmic theme
export const colors = {
  // Primary brand colors - Deep purples for community focus
  primary: '#6B46C1',      // Deep purple
  primaryLight: '#A78BFA', // Light purple
  primaryDark: '#4C1D95',  // Dark purple
  
  // Secondary colors - Cosmic gradient accents
  secondary: '#8B5CF6',    // Medium purple
  secondaryLight: '#C4B5FD', // Very light purple
  secondaryDark: '#5B21B6', // Very dark purple
  
  // Semantic colors
  success: '#34C759',      // iOS green
  warning: '#FF9500',      // iOS orange  
  error: '#FF3B30',        // iOS red
  info: '#007AFF',         // iOS blue
  
  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  
  // Gray scale
  gray: '#8E8E93',         // iOS gray
  lightGray: '#F2F2F7',    // iOS light gray
  darkGray: '#48484A',     // iOS dark gray
  
  // Text colors
  text: '#1C1C1E',         // iOS label
  textSecondary: '#3A3A3C', // iOS secondary label
  textTertiary: '#48484A',  // iOS tertiary label
  
  // Background colors
  background: '#F2F2F7',   // iOS system background
  backgroundSecondary: '#FFFFFF', // iOS secondary system background
  backgroundTertiary: '#F2F2F7',  // iOS tertiary system background
  
  // Surface colors (for cards, modals, etc.)
  surface: '#FFFFFF',
  surfaceSecondary: '#F2F2F7',
  
  // Border colors
  border: '#C6C6C8',       // iOS separator
  borderLight: '#E5E5EA',  // iOS light separator
  
  // Community-focused marketplace colors
  marketplace: {
    shops: '#6366F1',      // Indigo for shops
    services: '#10B981',   // Emerald for services
    events: '#F59E0B',     // Amber for events/hub
    community: '#8B5CF6',  // Purple for community features
    delivery: '#3B82F6',   // Blue for delivery
  },
  
  // Cosmic theme specific colors
  cosmic: {
    gradient: {
      start: '#1E1B4B',    // Dark navy
      middle: '#4C1D95',   // Dark purple  
      end: '#6B21A8',      // Purple
    },
    particle: '#A78BFA',   // Light purple for floating particles
    glow: '#C4B5FD',       // Very light purple for glowing effects
    starfield: '#E0E7FF',  // Very light blue for star effects
  },
    rentals: '#5856D6',    // Purple for rentals
  },
  
  // Delivery status colors
  delivery: {
    pending: '#FF9500',    // Orange
    inProgress: '#007AFF', // Blue
    completed: '#34C759',  // Green
    cancelled: '#FF3B30',  // Red
  },
  
  // Driver status colors
  driver: {
    offline: '#8E8E93',    // Gray
    online: '#34C759',     // Green
    busy: '#FF9500',       // Orange
  },
  
  // Rating/review colors
  rating: {
    excellent: '#34C759',  // Green (4.5-5 stars)
    good: '#FFCC00',       // Yellow (3.5-4.4 stars)
    average: '#FF9500',    // Orange (2.5-3.4 stars)
    poor: '#FF3B30',       // Red (1-2.4 stars)
  },
  
  // Overlay colors
  overlay: 'rgba(0, 0, 0, 0.4)',
  overlayLight: 'rgba(0, 0, 0, 0.2)',
  overlayDark: 'rgba(0, 0, 0, 0.6)',
  
  // Transparent colors for subtle effects
  transparent: 'transparent',
  
  // Shadow colors
  shadowColor: '#000000',
  shadowLight: 'rgba(0, 0, 0, 0.1)',
  shadowMedium: 'rgba(0, 0, 0, 0.2)',
  shadowDark: 'rgba(0, 0, 0, 0.3)',
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
