import { StyleSheet, Platform } from 'react-native';
import { FlexDirection, AlignItems, JustifyContent, FontWeight } from './styleTypes';
import { FontFamily, FontSize, LineHeight, LetterSpacing, FontWeight as FontWeights } from './fonts';

/**
 * Common spacing values following an 8px grid system
 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

/**
 * Common border radius values - Modern, rounded design
 */
export const BorderRadius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  '2xl': 24,
  full: 9999,
} as const;

/**
 * Modern Typography styles with Inter font
 * Optimized for readability and modern aesthetics
 */
export const Typography = StyleSheet.create({
  // Display - Large, impactful headings
  display: {
    fontSize: FontSize['5xl'],
    fontWeight: FontWeights.bold,
    lineHeight: FontSize['5xl'] * LineHeight.tight,
    fontFamily: FontFamily.primary,
    letterSpacing: LetterSpacing.tight,
  },
  
  // Headings - Modern hierarchy
  h1: {
    fontSize: FontSize['4xl'],
    fontWeight: FontWeights.bold,
    lineHeight: FontSize['4xl'] * LineHeight.tight,
    fontFamily: FontFamily.primary,
    letterSpacing: LetterSpacing.tight,
  },
  h2: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeights.bold,
    lineHeight: FontSize['3xl'] * LineHeight.snug,
    fontFamily: FontFamily.primary,
    letterSpacing: LetterSpacing.normal,
  },
  h3: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeights.semiBold,
    lineHeight: FontSize['2xl'] * LineHeight.snug,
    fontFamily: FontFamily.primary,
    letterSpacing: LetterSpacing.normal,
  },
  h4: {
    fontSize: FontSize.xl,
    fontWeight: FontWeights.semiBold,
    lineHeight: FontSize.xl * LineHeight.normal,
    fontFamily: FontFamily.primary,
    letterSpacing: LetterSpacing.normal,
  },
  h5: {
    fontSize: FontSize.lg,
    fontWeight: FontWeights.semiBold,
    lineHeight: FontSize.lg * LineHeight.normal,
    fontFamily: FontFamily.primary,
    letterSpacing: LetterSpacing.normal,
  },
  h6: {
    fontSize: FontSize.base,
    fontWeight: FontWeights.semiBold,
    lineHeight: FontSize.base * LineHeight.normal,
    fontFamily: FontFamily.primary,
    letterSpacing: LetterSpacing.wide,
  },

  // Body text - Optimized for reading
  body: {
    fontSize: FontSize.base,
    fontWeight: FontWeights.regular,
    lineHeight: FontSize.base * LineHeight.relaxed,
    fontFamily: FontFamily.primary,
    letterSpacing: LetterSpacing.normal,
  },
  bodyMedium: {
    fontSize: FontSize.base,
    fontWeight: FontWeights.medium,
    lineHeight: FontSize.base * LineHeight.relaxed,
    fontFamily: FontFamily.primary,
    letterSpacing: LetterSpacing.normal,
  },
  bodySmall: {
    fontSize: FontSize.sm,
    fontWeight: FontWeights.regular,
    lineHeight: FontSize.sm * LineHeight.relaxed,
    fontFamily: FontFamily.primary,
    letterSpacing: LetterSpacing.normal,
  },
  bodyLarge: {
    fontSize: FontSize.lg,
    fontWeight: FontWeights.regular,
    lineHeight: FontSize.lg * LineHeight.relaxed,
    fontFamily: FontFamily.primary,
    letterSpacing: LetterSpacing.normal,
  },

  // Other text styles
  caption: {
    fontSize: FontSize.xs,
    fontWeight: FontWeights.regular,
    lineHeight: FontSize.xs * LineHeight.normal,
    fontFamily: FontFamily.primary,
    letterSpacing: LetterSpacing.wide,
  },
  captionMedium: {
    fontSize: FontSize.xs,
    fontWeight: FontWeights.medium,
    lineHeight: FontSize.xs * LineHeight.normal,
    fontFamily: FontFamily.primary,
    letterSpacing: LetterSpacing.wide,
  },
  overline: {
    fontSize: FontSize.xs,
    fontWeight: FontWeights.semiBold,
    lineHeight: FontSize.xs * LineHeight.normal,
    fontFamily: FontFamily.primary,
    letterSpacing: LetterSpacing.widest,
    textTransform: 'uppercase' as const,
  },
  
  // Button text
  button: {
    fontSize: FontSize.base,
    fontWeight: FontWeights.semiBold,
    lineHeight: FontSize.base * LineHeight.normal,
    fontFamily: FontFamily.primary,
    letterSpacing: LetterSpacing.wide,
  },
  buttonSmall: {
    fontSize: FontSize.sm,
    fontWeight: FontWeights.semiBold,
    lineHeight: FontSize.sm * LineHeight.normal,
    fontFamily: FontFamily.primary,
    letterSpacing: LetterSpacing.wide,
  },
  buttonLarge: {
    fontSize: FontSize.lg,
    fontWeight: FontWeights.semiBold,
    lineHeight: FontSize.lg * LineHeight.normal,
    fontFamily: FontFamily.primary,
    letterSpacing: LetterSpacing.wide,
  },
});

/**
 * Tab Bar Typography styles - Modern styling
 */
export const TabBarStyles = StyleSheet.create({
  tabLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeights.medium,
    lineHeight: FontSize.xs * LineHeight.normal,
    letterSpacing: LetterSpacing.wide,
    fontFamily: FontFamily.primary,
  },
  tabLabelActive: {
    fontSize: FontSize.xs,
    fontWeight: FontWeights.semiBold,
    lineHeight: FontSize.xs * LineHeight.normal,
    letterSpacing: LetterSpacing.wide,
    fontFamily: FontFamily.primary,
  },
});

/**
 * Common shadow styles
 */
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

/**
 * Common container styles
 */
export const CommonStyles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: Spacing.md,
  },
  safeContainer: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  card: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  separator: {
    height: 1,
    width: '100%',
    marginVertical: Spacing.md,
  },
});