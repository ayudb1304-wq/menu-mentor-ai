import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
  Animated,
  Platform,
} from 'react-native';
import { GradientView } from './GradientView';
import { Colors } from '../theme/colors';
import { Typography, BorderRadius, Spacing } from '../theme/styles';
import { useTheme } from '../theme/ThemeContext';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  fullWidth = false,
  disabled,
  style,
  onPressIn,
  onPressOut,
  ...props
}) => {
  const { colors, isDarkMode } = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const iconRotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for primary buttons when not disabled
  useEffect(() => {
    if (variant === 'primary' && !disabled && !loading) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [variant, disabled, loading]);

  const handlePressIn = (event: any) => {
    // Scale down animation
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();

    // Rotate icon
    if (icon) {
      Animated.timing(iconRotateAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    // Scale back to normal
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();

    // Rotate icon back
    if (icon) {
      Animated.timing(iconRotateAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }

    onPressOut?.(event);
  };

  const iconRotation = iconRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '15deg'],
  });

  const getGradientColors = (): [string, string] => {
    switch (variant) {
      case 'primary':
        return ['#0066FF', '#00B4D8'];
      case 'secondary':
        return ['#38A169', '#68D391'];
      default:
        return [Colors.transparent, Colors.transparent];
    }
  };

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: size === 'large' ? BorderRadius.full : BorderRadius.lg,
      overflow: 'hidden',
      ...(fullWidth && { width: '100%' }),
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.paddingHorizontal = Spacing.md;
        baseStyle.paddingVertical = Spacing.sm;
        baseStyle.minHeight = 36;
        break;
      case 'large':
        baseStyle.paddingHorizontal = Spacing.xl;
        baseStyle.paddingVertical = Spacing.md + 2;
        baseStyle.minHeight = 56;
        break;
      default: // medium
        baseStyle.paddingHorizontal = Spacing.lg;
        baseStyle.paddingVertical = Spacing.sm + 4;
        baseStyle.minHeight = 48;
        break;
    }

    // Variant styles for non-gradient variants
    switch (variant) {
      case 'outline':
        baseStyle.backgroundColor = Colors.transparent;
        baseStyle.borderWidth = 2;
        baseStyle.borderColor = Colors.brand.blue;
        break;
      case 'ghost':
        baseStyle.backgroundColor = colors.background;
        break;
    }

    // Disabled state
    if (disabled || loading) {
      baseStyle.opacity = 0.6;
    }

    return baseStyle;
  };

  const getContainerStyle = (): ViewStyle => {
    const containerStyle: ViewStyle = {
      overflow: 'hidden',
      borderRadius: size === 'large' ? BorderRadius.full : BorderRadius.lg,
    };

    // Add shadow for primary and secondary variants
    if ((variant === 'primary' || variant === 'secondary') && !disabled) {
      containerStyle.shadowColor = variant === 'primary' ? '#0066FF' : '#38A169';
      containerStyle.shadowOffset = {
        width: 0,
        height: 4,
      };
      containerStyle.shadowOpacity = 0.3;
      containerStyle.shadowRadius = 8;
      containerStyle.elevation = 8;
    }

    return containerStyle;
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      marginLeft: icon ? Spacing.sm : 0,
    };

    // Size styles
    switch (size) {
      case 'small':
        Object.assign(baseStyle, Typography.buttonSmall);
        break;
      default:
        Object.assign(baseStyle, Typography.button);
        break;
    }

    // Variant styles
    switch (variant) {
      case 'primary':
      case 'secondary':
        baseStyle.color = Colors.white;
        break;
      case 'outline':
        baseStyle.color = Colors.brand.blue;
        break;
      case 'ghost':
        baseStyle.color = colors.primaryText;
        break;
    }

    return baseStyle;
  };

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          size={size === 'small' ? 'small' : 'small'}
          color={variant === 'primary' || variant === 'secondary' ? Colors.white : colors.primaryText}
        />
      ) : (
        <>
          {icon && (
            <Animated.View
              style={{
                transform: [{ rotate: iconRotation }],
              }}
            >
              {icon}
            </Animated.View>
          )}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </>
  );

  const animatedStyle = {
    transform: [
      { scale: scaleAnim },
      ...(variant === 'primary' && !disabled && !loading ? [{ scale: pulseAnim }] : []),
    ],
  };

  if (variant === 'primary' || variant === 'secondary') {
    return (
      <Animated.View style={[getContainerStyle(), animatedStyle, style]}>
        <TouchableOpacity
          style={getButtonStyle()}
          disabled={disabled || loading}
          activeOpacity={0.9}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole="button"
          accessibilityLabel={props.accessibilityLabel || title}
          accessibilityState={{ disabled: disabled || loading }}
          accessibilityHint={props.accessibilityHint}
          {...props}
        >
          <GradientView
            colors={getGradientColors()}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradient}
          >
            {renderContent()}
          </GradientView>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        style={[getButtonStyle(), getContainerStyle()]}
        disabled={disabled || loading}
        activeOpacity={0.7}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        accessibilityLabel={props.accessibilityLabel || title}
        accessibilityState={{ disabled: disabled || loading }}
        accessibilityHint={props.accessibilityHint}
        {...props}
      >
        {renderContent()}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 4,
  },
});
