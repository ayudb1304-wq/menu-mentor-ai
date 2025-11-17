import React, { useRef } from 'react';
import { View, ViewProps, StyleSheet, Animated, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { BorderRadius, Spacing, Shadows } from '../theme/styles';
import { Colors } from '../theme/colors';

interface CardProps extends ViewProps {
  variant?: 'filled' | 'outlined' | 'elevated';
  noPadding?: boolean;
  children: React.ReactNode;
  pressable?: boolean;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
  variant = 'filled',
  noPadding = false,
  children,
  pressable = false,
  onPress,
  style,
  ...props
}) => {
  const { colors, isDarkMode } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const elevationAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    if (pressable || onPress) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0.98,
          useNativeDriver: true,
        }),
        Animated.timing(elevationAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  const handlePressOut = () => {
    if (pressable || onPress) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.timing(elevationAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    }
  };

  const getCardStyle = () => {
    const baseStyle = {
      backgroundColor: variant === 'filled' || variant === 'elevated' ? colors.card : Colors.transparent,
      borderWidth: variant === 'outlined' ? 1 : 0,
      borderColor: colors.border,
      borderRadius: BorderRadius.lg,
      padding: noPadding ? 0 : Spacing.md,
    };

    // Enhanced shadows based on variant
    if (variant === 'filled' && !isDarkMode) {
      return {
        ...baseStyle,
        ...Shadows.sm,
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
      };
    }

    if (variant === 'elevated') {
      return {
        ...baseStyle,
        shadowColor: Colors.brand.primary,
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
      };
    }

    return baseStyle;
  };

  const animatedShadow = elevationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: variant === 'elevated' ? [12, 20] : [8, 16],
  });

  const animatedElevation = elevationAnim.interpolate({
    inputRange: [0, 1],
    outputRange: variant === 'elevated' ? [6, 12] : [3, 8],
  });

  const animatedStyle = {
    transform: [{ scale: scaleAnim }],
    ...(variant !== 'outlined' && {
      shadowRadius: animatedShadow,
      elevation: animatedElevation,
    }),
  };

  if (pressable || onPress) {
    return (
      <Animated.View style={[getCardStyle(), animatedStyle, style]}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={({ pressed }) => [
            styles.pressableContent,
            pressed && styles.pressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={props.accessibilityLabel}
          accessibilityHint={props.accessibilityHint}
          {...props}
        >
          {children}
        </Pressable>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[getCardStyle(), animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  pressableContent: {
    flex: 1,
  },
  pressed: {
    opacity: 0.95,
  },
});
