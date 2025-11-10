/**
 * Centralized color palette for the entire app.
 * This provides a shadcn-inspired color system with light and dark theme support.
 */

export const Colors = {
  // App Colors - Light theme only with off-white background
  light: {
    background: '#F9F5EC',  // Off-white background
    container: '#FFFAF1',  // Container background color
    primaryText: '#212529',
    secondaryText: '#6C757D',
    border: '#E0E0E0',
    card: '#FFFFFF',
    // Semantic colors
    success: '#28A745',
    warning: '#FD7E14',
    error: '#DC3545',
  },

  // Keep dark colors for compatibility but app will only use light mode
  dark: {
    background: '#F9F5EC',  // Same as light for now
    container: '#FFFAF1',  // Container background color
    raisedGray: '#FFFFFF',
    card: '#FFFFFF',
    primaryText: '#212529',
    secondaryText: '#6C757D',
    border: '#E0E0E0',
    // Semantic colors
    success: '#28A745',
    warning: '#FD7E14',
    error: '#DC3545',
  },

  // Brand & Action Colors (theme-independent)
  brand: {
    blue: '#0066FF',
    blueLight: '#00B4D8',
    green: '#38A169',
    greenLight: '#68D391',
  },

  // Semantic Colors for menu analysis
  semantic: {
    compliant: '#28A745',    // Green for compliant items
    modifiable: '#FD7E14',   // Orange for modifiable items
    nonCompliant: '#DC3545', // Red for non-compliant items
  },

  // Social media brand colors
  social: {
    google: '#4285F4',
    x: '#000000',
    facebook: '#1877F2',
    github: '#333333',
  },

  // Tab Bar Colors
  tabBar: {
    light: {
      active: '#007BFF',
      inactive: '#6C757D',
      underline: '#007BFF',
      background: '#F9F5EC',  // Off-white to match app background
      border: '#E0E0E0',
    },
    dark: {
      active: '#007BFF',
      inactive: '#6C757D',
      underline: '#007BFF',
      background: '#F9F5EC',  // Same as light
      border: '#E0E0E0',
    },
  },

  // Utility colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;