import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  TouchableOpacityProps,
} from 'react-native';
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
  ...props
}) => {
  const { colors, isDarkMode } = useTheme();

  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: BorderRadius.md,
      ...(fullWidth && { width: '100%' }),
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.paddingHorizontal = Spacing.sm;
        baseStyle.paddingVertical = Spacing.xs;
        baseStyle.minHeight = 32;
        break;
      case 'large':
        baseStyle.paddingHorizontal = Spacing.lg;
        baseStyle.paddingVertical = Spacing.md;
        baseStyle.minHeight = 56;
        break;
      default: // medium
        baseStyle.paddingHorizontal = Spacing.md;
        baseStyle.paddingVertical = Spacing.sm + 2;
        baseStyle.minHeight = 44;
        break;
    }

    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = Colors.brand.blue;
        break;
      case 'secondary':
        baseStyle.backgroundColor = Colors.brand.green;
        break;
      case 'outline':
        baseStyle.backgroundColor = Colors.transparent;
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = colors.border;
        break;
      case 'ghost':
        baseStyle.backgroundColor = Colors.transparent;
        break;
    }

    // Disabled state
    if (disabled || loading) {
      baseStyle.opacity = 0.6;
    }

    return baseStyle;
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
      case 'ghost':
        baseStyle.color = colors.primaryText;
        break;
    }

    return baseStyle;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size={size === 'small' ? 'small' : 'small'}
          color={variant === 'primary' || variant === 'secondary' ? Colors.white : colors.primaryText}
        />
      ) : (
        <>
          {icon}
          <Text style={getTextStyle()}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};