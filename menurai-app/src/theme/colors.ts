/**
 * Modern, brand-worthy color palette for Menurai
 * Inspired by modern design systems with vibrant, accessible colors
 */

export const Colors = {
  // App Colors - Modern light theme with sophisticated palette
  light: {
    background: '#FAF9F6',  // Warm off-white with subtle cream tone
    container: '#FFFFFF',     // Pure white for containers
    primaryText: '#1A1A1A',  // Deep charcoal for excellent readability
    secondaryText: '#6B7280', // Modern gray (gray-500)
    tertiaryText: '#9CA3AF', // Lighter gray for subtle text
    border: '#E5E7EB',        // Soft gray border (gray-200)
    card: '#FFFFFF',         // Pure white cards
    surface: '#F9FAFB',      // Subtle surface color (gray-50)
    
    // Semantic colors - Modern, vibrant
    success: '#10B981',      // Emerald green (modern)
    warning: '#F59E0B',      // Amber (modern)
    error: '#EF4444',        // Red-500 (modern)
    info: '#3B82F6',        // Blue-500 (modern)
  },

  // Dark theme (for future use)
  dark: {
    background: '#111827',   // Dark gray-900
    container: '#1F2937',     // Dark gray-800
    primaryText: '#F9FAFB',   // Almost white
    secondaryText: '#D1D5DB', // Gray-300
    tertiaryText: '#9CA3AF',  // Gray-400
    border: '#374151',        // Gray-700
    card: '#1F2937',          // Dark gray-800
    surface: '#111827',       // Dark gray-900
    
    // Semantic colors for dark mode
    success: '#34D399',       // Emerald-400
    warning: '#FBBF24',       // Amber-400
    error: '#F87171',        // Red-400
    info: '#60A5FA',         // Blue-400
  },

  // Brand Colors - Modern, vibrant gradient palette
  brand: {
    // Primary brand colors - Blue gradient
    primary: '#0066FF',       // Vibrant blue
    primaryLight: '#3B82F6',  // Blue-500
    primaryDark: '#0052CC',  // Darker blue
    primaryGradient: ['#0066FF', '#3B82F6'], // Blue gradient
    
    // Secondary brand colors - Teal/Cyan accent
    secondary: '#06B6D4',     // Cyan-500
    secondaryLight: '#22D3EE', // Cyan-400
    secondaryDark: '#0891B2',  // Cyan-600
    secondaryGradient: ['#06B6D4', '#22D3EE'], // Cyan gradient
    
    // Accent colors
    accent: '#8B5CF6',        // Purple-500 (for special highlights)
    accentLight: '#A78BFA',  // Purple-400
    accentGradient: ['#8B5CF6', '#A78BFA'], // Purple gradient
  },

  // Semantic Colors for menu analysis - Modern, accessible
  semantic: {
    compliant: '#10B981',    // Emerald-500 - Modern green
    compliantLight: '#34D399', // Emerald-400
    compliantDark: '#059669', // Emerald-600
    compliantGradient: ['#10B981', '#34D399'], // Green gradient
    
    modifiable: '#F59E0B',    // Amber-500 - Modern orange
    modifiableLight: '#FBBF24', // Amber-400
    modifiableDark: '#D97706',  // Amber-600
    modifiableGradient: ['#F59E0B', '#FBBF24'], // Orange gradient
    
    nonCompliant: '#EF4444',  // Red-500 - Modern red
    nonCompliantLight: '#F87171', // Red-400
    nonCompliantDark: '#DC2626',  // Red-600
    nonCompliantGradient: ['#EF4444', '#F87171'], // Red gradient
  },

  // Social media brand colors - Updated to modern palette
  social: {
    google: '#4285F4',       // Google Blue
    googleHover: '#357AE8',  // Darker on hover
    x: '#000000',            // X/Twitter Black
    xHover: '#1DA1F2',       // Twitter Blue on hover
    facebook: '#1877F2',     // Facebook Blue
    facebookHover: '#166FE5', // Darker on hover
    github: '#181717',       // GitHub Black
    githubHover: '#333333',   // Darker on hover
  },

  // Tab Bar Colors - Modern styling
  tabBar: {
    light: {
      active: '#0066FF',     // Brand primary
      inactive: '#9CA3AF',   // Gray-400
      underline: '#0066FF',  // Brand primary
      background: '#FFFFFF', // White background
      border: '#E5E7EB',     // Gray-200
    },
    dark: {
      active: '#3B82F6',     // Blue-500
      inactive: '#6B7280',   // Gray-500
      underline: '#3B82F6', // Blue-500
      background: '#1F2937', // Dark gray-800
      border: '#374151',     // Gray-700
    },
  },

  // Gradient Presets - Modern, vibrant gradients
  gradients: {
    primary: ['#0066FF', '#3B82F6'],           // Blue gradient
    secondary: ['#06B6D4', '#22D3EE'],         // Cyan gradient
    success: ['#10B981', '#34D399'],           // Green gradient
    warning: ['#F59E0B', '#FBBF24'],          // Orange gradient
    error: ['#EF4444', '#F87171'],            // Red gradient
    purple: ['#8B5CF6', '#A78BFA'],           // Purple gradient
    sunset: ['#F59E0B', '#EF4444'],          // Sunset gradient
    ocean: ['#06B6D4', '#3B82F6'],            // Ocean gradient
    forest: ['#10B981', '#06B6D4'],          // Forest gradient
  },

  // Utility colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  overlayDark: 'rgba(0, 0, 0, 0.7)',
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  
  // Modern grays for various use cases
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },
} as const;
