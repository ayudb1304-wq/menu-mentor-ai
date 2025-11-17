/**
 * Modern font system for Menurai
 * Uses Inter font family - a modern, highly legible sans-serif
 * Falls back to system fonts for better performance
 */

import { Platform } from 'react-native';

/**
 * Font family configuration
 * Inter is a modern, geometric sans-serif designed for screens
 */
export const FontFamily = {
  // Primary font - Inter (modern, clean, highly legible)
  primary: Platform.select({
    web: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    ios: 'System',
    android: 'sans-serif',
    default: 'System',
  }),
  
  // Monospace font for code/technical content
  monospace: Platform.select({
    web: '"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro", monospace',
    ios: 'Courier',
    android: 'monospace',
    default: 'monospace',
  }),
} as const;

/**
 * Font weights - Modern weight scale
 */
export const FontWeight = {
  thin: '100' as const,
  extraLight: '200' as const,
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
  extraBold: '800' as const,
  black: '900' as const,
} as const;

/**
 * Letter spacing values for better readability
 */
export const LetterSpacing = {
  tighter: -0.5,
  tight: -0.25,
  normal: 0,
  wide: 0.25,
  wider: 0.5,
  widest: 1,
} as const;

/**
 * Font loading utility for web
 * Loads Inter font from Google Fonts
 */
export const loadFonts = async (): Promise<void> => {
  if (Platform.OS === 'web' && typeof document !== 'undefined') {
    // Check if font is already loaded
    if (document.fonts && document.fonts.check) {
      try {
        await document.fonts.load('400 16px Inter');
        return;
      } catch (error) {
        console.warn('Font loading error:', error);
      }
    }

    // Load Inter from Google Fonts
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }
};

/**
 * Typography scale - Modern, consistent sizing
 * Based on 16px base (1rem = 16px)
 */
export const FontSize = {
  xs: 12,    // 0.75rem
  sm: 14,    // 0.875rem
  base: 16,  // 1rem (base)
  lg: 18,    // 1.125rem
  xl: 20,    // 1.25rem
  '2xl': 24, // 1.5rem
  '3xl': 30, // 1.875rem
  '4xl': 36, // 2.25rem
  '5xl': 48, // 3rem
} as const;

/**
 * Line height scale - Optimized for readability
 */
export const LineHeight = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;
