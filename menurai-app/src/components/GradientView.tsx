import React from 'react';
import { View, ViewProps, StyleSheet, Platform } from 'react-native';

interface GradientViewProps extends ViewProps {
  colors: [string, string];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  children?: React.ReactNode;
}

/**
 * Cross-platform gradient view component
 * Uses CSS gradients on web, works with react-native-linear-gradient on native
 */
export const GradientView: React.FC<GradientViewProps> = ({
  colors,
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  children,
  style,
  ...props
}) => {
  if (Platform.OS === 'web') {
    // Use CSS linear gradient for web
    const angle = Math.atan2(end.y - start.y, end.x - start.x) * (180 / Math.PI) + 90;
    const webStyle = {
      backgroundImage: `linear-gradient(${angle}deg, ${colors[0]}, ${colors[1]})`,
    };

    return (
      <View style={[styles.container, style, webStyle]} {...props}>
        {children}
      </View>
    );
  }

  // For native platforms, we'll use react-native-linear-gradient
  // This import is done conditionally to avoid web bundling issues
  try {
    const LinearGradient = require('react-native-linear-gradient').default;
    return (
      <LinearGradient
        colors={colors}
        start={start}
        end={end}
        style={[styles.container, style]}
        {...props}
      >
        {children}
      </LinearGradient>
    );
  } catch (error) {
    // Fallback to solid color if LinearGradient is not available
    return (
      <View style={[styles.container, style, { backgroundColor: colors[0] }]} {...props}>
        {children}
      </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
