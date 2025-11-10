import React from 'react';
import { View, ViewProps, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { BorderRadius, Spacing, Shadows } from '../theme/styles';
import { Colors } from '../theme/colors';

interface CardProps extends ViewProps {
  variant?: 'filled' | 'outlined';
  noPadding?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'filled',
  noPadding = false,
  children,
  style,
  ...props
}) => {
  const { colors, isDarkMode } = useTheme();

  const cardStyle = {
    backgroundColor: variant === 'filled' ? colors.card : Colors.transparent,
    borderWidth: variant === 'outlined' ? 1 : 0,
    borderColor: colors.border,
    borderRadius: BorderRadius.md,
    padding: noPadding ? 0 : Spacing.md,
    ...(variant === 'filled' && !isDarkMode && Shadows.sm),
  };

  return (
    <View style={[cardStyle, style]} {...props}>
      {children}
    </View>
  );
};