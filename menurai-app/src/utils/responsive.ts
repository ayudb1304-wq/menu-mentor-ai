import { Dimensions, Platform, ScaledSize } from 'react-native';

export const Breakpoints = {
  phone: 0,
  tablet: 768,
  tabletLarge: 1024,
  desktop: 1280,
} as const;

export type Orientation = 'portrait' | 'landscape';

export type ResponsiveValue<T> =
  | T
  | {
      phone?: T;
      tablet?: T;
      tabletLarge?: T;
      desktop?: T;
    };

export interface ResponsiveInfo {
  width: number;
  height: number;
  orientation: Orientation;
  isPhone: boolean;
  isTablet: boolean;
  isLargeTablet: boolean;
  isDesktop: boolean;
  platform: typeof Platform.OS;
}

type ResponsiveListener = (info: ResponsiveInfo) => void;

let cachedDimensions = Dimensions.get('window');
const listeners = new Set<ResponsiveListener>();

const calculateInfo = (dimensions: Pick<ScaledSize, 'width' | 'height'>): ResponsiveInfo => {
  const { width, height } = dimensions;
  const orientation: Orientation = width >= height ? 'landscape' : 'portrait';
  const isTablet = width >= Breakpoints.tablet;
  const isLargeTablet = width >= Breakpoints.tabletLarge;
  const isDesktop = width >= Breakpoints.desktop;

  return {
    width,
    height,
    orientation,
    isTablet,
    isLargeTablet,
    isDesktop,
    isPhone: !isTablet,
    platform: Platform.OS,
  };
};

const handleDimensionChange = ({ window }: { window: ScaledSize }) => {
  cachedDimensions = window;
  const info = calculateInfo(window);
  listeners.forEach(listener => listener(info));
};

// Newer React Native versions return an event emitter subscription while older ones
// expect Dimensions.addEventListener to register callbacks directly.
const dimensionSubscription = Dimensions.addEventListener
  ? Dimensions.addEventListener('change', handleDimensionChange)
  : null;

export const getResponsiveInfo = (): ResponsiveInfo => calculateInfo(cachedDimensions);

export const buildResponsiveInfo = (dimensions: { width: number; height: number }): ResponsiveInfo =>
  calculateInfo(dimensions);

export const isTablet = (width = cachedDimensions.width) => width >= Breakpoints.tablet;

export const isLargeTablet = (width = cachedDimensions.width) => width >= Breakpoints.tabletLarge;

export const isDesktop = (width = cachedDimensions.width) => width >= Breakpoints.desktop;

export const addResponsiveListener = (listener: ResponsiveListener) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && dimensionSubscription && 'remove' in dimensionSubscription) {
      dimensionSubscription.remove();
    }
  };
};

export const getResponsiveValue = <T>(value: ResponsiveValue<T>, info?: ResponsiveInfo): T => {
  if (
    value != null &&
    typeof value === 'object' &&
    !Array.isArray(value)
  ) {
    const current = info ?? getResponsiveInfo();
    const responsiveMap = value as ResponsiveValue<T> & Record<string, T | undefined>;

    if (current.isDesktop && responsiveMap.desktop !== undefined) {
      return responsiveMap.desktop;
    }
    if (current.isLargeTablet && responsiveMap.tabletLarge !== undefined) {
      return responsiveMap.tabletLarge;
    }
    if (current.isTablet && responsiveMap.tablet !== undefined) {
      return responsiveMap.tablet;
    }
    if (responsiveMap.phone !== undefined) {
      return responsiveMap.phone;
    }
  }

  return value as T;
};

export const getOrientation = (): Orientation => getResponsiveInfo().orientation;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const getHorizontalGutter = (info: ResponsiveInfo = getResponsiveInfo()) => {
  if (info.isDesktop) {
    return clamp(info.width * 0.05, 40, 80);
  }
  if (info.isLargeTablet) {
    return 40;
  }
  if (info.isTablet) {
    return 28;
  }
  return 16;
};

export const getContentMaxWidth = (info: ResponsiveInfo = getResponsiveInfo()) => {
  if (info.isDesktop) {
    // For desktop, use 90% of width with min/max constraints
    return Math.min(Math.max(info.width * 0.9, 1200), 1600);
  }
  if (info.isLargeTablet) {
    // For large tablets (iPad Pro), use 92% of width
    return info.width * 0.92;
  }
  if (info.isTablet) {
    // For regular tablets (iPad Air, iPad Mini), use 95% of width to fill screen
    return info.width * 0.95;
  }
  return info.width;
};

export const getScreenPadding = (info: ResponsiveInfo = getResponsiveInfo()) => {
  if (info.isDesktop) {
    return clamp(info.width * 0.05, 40, 72);
  }
  if (info.isLargeTablet) {
    // For iPad Pro, use 4% of width
    return Math.max(info.width * 0.04, 32);
  }
  if (info.isTablet) {
    // For iPad Air and iPad Mini, use 2.5% of width (smaller padding to allow more content)
    return Math.max(info.width * 0.025, 20);
  }
  return 16;
};

export const getColumnCount = (
  info: ResponsiveInfo = getResponsiveInfo(),
  options?: {
    minItemWidth?: number;
    maxColumns?: number;
    minColumns?: number;
  }
) => {
  const minItemWidth = options?.minItemWidth ?? 320;
  const maxColumns = options?.maxColumns ?? 4;
  const minColumns = options?.minColumns ?? 1;
  const gutter = getHorizontalGutter(info);
  const availableWidth = Math.max(info.width - gutter * 2, minItemWidth);
  const computed = Math.floor(availableWidth / minItemWidth);
  return clamp(computed, minColumns, maxColumns);
};

export default {
  Breakpoints,
  getResponsiveInfo,
  getResponsiveValue,
  isTablet,
  isLargeTablet,
  isDesktop,
  getOrientation,
  getContentMaxWidth,
  getScreenPadding,
  getHorizontalGutter,
  getColumnCount,
};

