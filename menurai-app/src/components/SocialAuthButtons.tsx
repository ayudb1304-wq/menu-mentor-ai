import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { FontAwesome, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
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
  onFacebookSignIn?: () => void;
  onXSignIn?: () => void;
  onGitHubSignIn?: () => void;
  loading?: boolean;
}

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({
  onGoogleSignIn,
  onFacebookSignIn,
  onXSignIn,
  onGitHubSignIn,
  loading = false,
}) => {
  const { isDarkMode } = useTheme();

  const handleComingSoon = (platform: string) => {
    Alert.alert(
      'Coming Soon',
      `${platform} sign-in will be available in a future update.`,
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      <SocialButton
        onPress={onGoogleSignIn}
        icon={<FontAwesome name="google" size={20} color={Colors.white} />}
        title="Continue with Google"
        backgroundColor={Colors.social.google}
        disabled={loading}
      />

      <SocialButton
        onPress={onXSignIn || (() => handleComingSoon('X'))}
        icon={
          <FontAwesome5
            name="twitter"
            size={20}
            color={isDarkMode ? Colors.black : Colors.white}
          />
        }
        title="Continue with X"
        backgroundColor={isDarkMode ? Colors.white : Colors.social.x}
        textColor={isDarkMode ? Colors.black : Colors.white}
        disabled={loading || !onXSignIn}
      />

      <SocialButton
        onPress={onFacebookSignIn || (() => handleComingSoon('Facebook'))}
        icon={<FontAwesome5 name="facebook-f" size={20} color={Colors.white} />}
        title="Continue with Facebook"
        backgroundColor={Colors.social.facebook}
        disabled={loading || !onFacebookSignIn}
      />

      <SocialButton
        onPress={onGitHubSignIn || (() => handleComingSoon('GitHub'))}
        icon={
          <FontAwesome5
            name="github"
            size={20}
            color={isDarkMode ? Colors.black : Colors.white}
          />
        }
        title="Continue with GitHub"
        backgroundColor={isDarkMode ? Colors.white : Colors.social.github}
        textColor={isDarkMode ? Colors.black : Colors.white}
        disabled={loading || !onGitHubSignIn}
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
});