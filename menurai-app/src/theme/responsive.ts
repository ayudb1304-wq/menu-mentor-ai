import { ResponsiveValue } from '../utils/responsive';

type ResponsiveScale<T = number> = Record<string, ResponsiveValue<T>>;

export const ResponsiveLayout: ResponsiveScale<number> = {
  contentMaxWidth: {
    phone: 480,
    tablet: 720,
    tabletLarge: 960,
  },
  screenPadding: {
    phone: 16,
    tablet: 24,
    tabletLarge: 32,
  },
  sectionGap: {
    phone: 16,
    tablet: 24,
    tabletLarge: 32,
  },
  cardSpacing: {
    phone: 12,
    tablet: 16,
    tabletLarge: 20,
  },
};

export const ResponsiveSpacing: ResponsiveScale<number> = {
  xs: {
    phone: 4,
    tablet: 6,
    tabletLarge: 8,
  },
  sm: {
    phone: 8,
    tablet: 10,
    tabletLarge: 12,
  },
  md: {
    phone: 16,
    tablet: 18,
    tabletLarge: 20,
  },
  lg: {
    phone: 24,
    tablet: 28,
    tabletLarge: 32,
  },
  xl: {
    phone: 32,
    tablet: 36,
    tabletLarge: 40,
  },
};

export const ResponsiveTypography: ResponsiveScale<number> = {
  h1: {
    phone: 32,
    tablet: 34,
    tabletLarge: 36,
  },
  h2: {
    phone: 28,
    tablet: 30,
    tabletLarge: 32,
  },
  h3: {
    phone: 24,
    tablet: 26,
    tabletLarge: 28,
  },
  h4: {
    phone: 20,
    tablet: 22,
    tabletLarge: 24,
  },
  body: {
    phone: 16,
    tablet: 18,
    tabletLarge: 18,
  },
  caption: {
    phone: 12,
    tablet: 13,
    tabletLarge: 14,
  },
};

export type { ResponsiveScale };

