import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { BorderRadius, Spacing } from '../theme/styles';

interface SkeletonLoaderProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.md,
  style,
}) => {
  const { colors } = useTheme();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.shimmer,
          {
            opacity,
            backgroundColor: colors.card,
          },
        ]}
      />
    </View>
  );
};

interface SkeletonCardProps {
  style?: ViewStyle;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ style }) => {
  return (
    <View style={[styles.card, style]}>
      <SkeletonLoader width="60%" height={20} style={styles.title} />
      <SkeletonLoader width="40%" height={16} style={styles.subtitle} />
      <SkeletonLoader width="100%" height={80} style={styles.content} />
      <View style={styles.footer}>
        <SkeletonLoader width="30%" height={16} />
        <SkeletonLoader width="30%" height={16} />
      </View>
    </View>
  );
};

interface SkeletonListProps {
  count?: number;
  style?: ViewStyle;
}

export const SkeletonList: React.FC<SkeletonListProps> = ({ count = 3, style }) => {
  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} style={styles.listItem} />
      ))}
    </View>
  );
};

interface SkeletonCircleProps {
  size?: number;
  style?: ViewStyle;
}

export const SkeletonCircle: React.FC<SkeletonCircleProps> = ({ size = 48, style }) => {
  return (
    <SkeletonLoader
      width={size}
      height={size}
      borderRadius={size / 2}
      style={style}
    />
  );
};

interface SkeletonTextProps {
  lines?: number;
  lastLineWidth?: number | `${number}%`;
  style?: ViewStyle;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  lastLineWidth = '70%',
  style,
}) => {
  return (
    <View style={style}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLoader
          key={index}
          width={index === lines - 1 ? lastLineWidth : '100%'}
          height={16}
          style={styles.textLine}
        />
      ))}
    </View>
  );
};

interface SkeletonButtonProps {
  style?: ViewStyle;
}

export const SkeletonButton: React.FC<SkeletonButtonProps> = ({ style }) => {
  return <SkeletonLoader width="100%" height={48} borderRadius={BorderRadius.lg} style={style} />;
};

interface SkeletonImageProps {
  width?: number | `${number}%`;
  height?: number;
  style?: ViewStyle;
}

export const SkeletonImage: React.FC<SkeletonImageProps> = ({
  width = '100%',
  height = 200,
  style,
}) => {
  return (
    <SkeletonLoader
      width={width}
      height={height}
      borderRadius={BorderRadius.md}
      style={style}
    />
  );
};

// Skeleton for menu item analysis
export const SkeletonMenuItem: React.FC = () => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.menuItem, { backgroundColor: colors.card }]}>
      <View style={styles.menuItemHeader}>
        <SkeletonCircle size={24} />
        <SkeletonLoader width="60%" height={18} style={{ marginLeft: Spacing.sm }} />
      </View>
      <SkeletonLoader width="40%" height={14} style={{ marginTop: Spacing.xs }} />
      <SkeletonText lines={2} lastLineWidth="80%" style={{ marginTop: Spacing.sm }} />
    </View>
  );
};

// Skeleton for scan history item
export const SkeletonHistoryItem: React.FC = () => {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.historyItem, { backgroundColor: colors.card }]}>
      <SkeletonLoader width="50%" height={14} />
      <View style={styles.historyStats}>
        <SkeletonCircle size={32} style={{ marginRight: Spacing.sm }} />
        <SkeletonCircle size={32} style={{ marginRight: Spacing.sm }} />
        <SkeletonCircle size={32} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  shimmer: {
    width: '100%',
    height: '100%',
  },
  card: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  title: {
    marginBottom: Spacing.xs,
  },
  subtitle: {
    marginBottom: Spacing.md,
  },
  content: {
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  listItem: {
    marginBottom: Spacing.md,
  },
  textLine: {
    marginBottom: Spacing.sm,
  },
  menuItem: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  menuItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyItem: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  historyStats: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
  },
});
