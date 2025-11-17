import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { BorderRadius, Spacing, Typography } from '../theme/styles';
import { Colors } from '../theme/colors';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'choice' | 'filter' | 'input';
  closeable?: boolean;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onPress,
  disabled = false,
  variant = 'choice',
  closeable = false,
}) => {
  const { colors, isDarkMode } = useTheme();

  const chipStyles = [
    styles.chip,
    {
      backgroundColor: selected
        ? variant === 'input'
          ? colors.primaryText
          : Colors.brand.primary
        : Colors.transparent,
      borderColor: selected ? Colors.brand.primary : colors.border,
      opacity: disabled ? 0.5 : 1,
    },
  ];

  const textStyles = [
    styles.text,
    {
      color: selected
        ? variant === 'input' && !isDarkMode
          ? Colors.white
          : selected && variant !== 'input'
          ? Colors.white
          : colors.primaryText
        : colors.secondaryText,
    },
  ];

  return (
    <TouchableOpacity
      style={chipStyles}
      onPress={onPress}
      disabled={disabled || !onPress}
      activeOpacity={0.7}
    >
      <Text style={textStyles}>{label}</Text>
      {closeable && selected && (
        <Text style={[textStyles, styles.closeIcon]}>×</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  text: {
    ...Typography.bodySmall,
    fontWeight: '500' as '500',
  },
  closeIcon: {
    marginLeft: Spacing.xs,
    fontSize: 18,
    fontWeight: '600' as '600',
  },
});