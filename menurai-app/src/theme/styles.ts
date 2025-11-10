import { StyleSheet } from 'react-native';
import { FlexDirection, AlignItems, JustifyContent, FontWeight } from './styleTypes';

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
 * Common border radius values
 */
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
} as const;

/**
 * Typography styles
 */
export const Typography = StyleSheet.create({
  // Headings
  h1: {
    fontSize: 32,
    fontWeight: '700' as '700',
    lineHeight: 40,
    // fontFamily: 'Inter-Bold', // Uncomment when fonts are loaded
  },
  h2: {
    fontSize: 28,
    fontWeight: '600' as '600',
    lineHeight: 36,
    // fontFamily: 'Inter-SemiBold',
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as '600',
    lineHeight: 32,
    // fontFamily: 'Inter-SemiBold',
  },
  h4: {
    fontSize: 20,
    fontWeight: '600' as '600',
    lineHeight: 28,
    // fontFamily: 'Inter-SemiBold',
  },
  h5: {
    fontSize: 18,
    fontWeight: '500' as '500',
    lineHeight: 24,
    // fontFamily: 'Inter-Medium',
  },

  // Body text
  body: {
    fontSize: 16,
    fontWeight: '400' as '400',
    lineHeight: 24,
    // fontFamily: 'Inter-Regular',
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500' as '500',
    lineHeight: 24,
    // fontFamily: 'Inter-Medium',
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as '400',
    lineHeight: 20,
    // fontFamily: 'Inter-Regular',
  },

  // Other text styles
  caption: {
    fontSize: 12,
    fontWeight: '400' as '400',
    lineHeight: 16,
    // fontFamily: 'Inter-Regular',
  },
  button: {
    fontSize: 16,
    fontWeight: '600' as '600',
    lineHeight: 24,
    // fontFamily: 'Inter-SemiBold',
  },
  buttonSmall: {
    fontSize: 14,
    fontWeight: '600' as '600',
    lineHeight: 20,
    // fontFamily: 'Inter-SemiBold',
  },
});

/**
 * Tab Bar Typography styles
 */
export const TabBarStyles = StyleSheet.create({
  tabLabel: {
    fontSize: 12,
    fontWeight: '600' as '600',
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  tabLabelActive: {
    fontSize: 12,
    fontWeight: '700' as '700',
    lineHeight: 16,
    letterSpacing: 0.3,
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