import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography, Spacing, BorderRadius, Shadows } from '../theme/styles';
import { useTheme } from '../theme/ThemeContext';

interface SocialButtonProps {
  onPress: () => void;
  icon: React.ReactNode;
  title: string;
  backgroundColor: string;
  textColor?: string;
  disabled?: boolean;
}

const SocialButton: React.FC<SocialButtonProps> = ({
  onPress,
  icon,
  title,
  backgroundColor,
  textColor = Colors.white,
  disabled = false,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor,
          opacity: disabled ? 0.5 : 1,
        },
        !isDarkMode && Shadows.sm,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={[styles.buttonText, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
};

interface SocialAuthButtonsProps {
  onGoogleSignIn: () => void;
  loading?: boolean;
}

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  onGoogleSignIn,
  loading = false,
}) => {
  return (
    <View style={styles.container}>
      <SocialButton
        onPress={onGoogleSignIn}
        icon={
          <View style={styles.googleBadge}>
            <Text style={styles.googleBadgeText}>G</Text>
          </View>
        }
        title="Continue with Google"
        backgroundColor={Colors.social.google}
        disabled={loading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    minHeight: 52,
  },
  iconContainer: {
    marginRight: Spacing.sm,
    width: 24,
    alignItems: 'center',
  },
  buttonText: {
    ...Typography.button,
    fontSize: 16,
  },
  googleBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleBadgeText: {
    ...Typography.button,
    color: Colors.social.google,
    fontSize: 16,
  },
});