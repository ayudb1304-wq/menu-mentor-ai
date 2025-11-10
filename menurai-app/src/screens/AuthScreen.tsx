import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { Typography, Spacing, BorderRadius } from '../theme/styles';
import { SocialAuthButtons } from '../components/SocialAuthButtons';
import { LoadingOverlay } from '../components';
import { useAuth } from '../hooks/useAuth';

export const AuthScreen: React.FC = () => {
  const { colors, isDarkMode } = useTheme();
  const { signInWithGoogle, loading, error } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (error) {
      Alert.alert('Sign In Error', error.message, [{ text: 'OK' }]);
    }
  }, [error]);

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
      // Navigation will be handled by AuthWrapper listening to auth state
    } catch (err) {
      console.error('Google sign-in error:', err);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={true}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.appName, { color: colors.primaryText }]}>Menurai</Text>
            <Text style={[styles.tagline, { color: colors.secondaryText }]}>
              Dine with confidence. Every dish, every time.
            </Text>
          </View>

          {/* Auth Section */}
          <View style={styles.authSection}>
            <Text style={[styles.title, { color: colors.primaryText }]}>Get Started</Text>
            <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
              Sign in to personalize your dining experience
            </Text>

            <View style={styles.buttonsContainer}>
              <SocialAuthButtons
                onGoogleSignIn={handleGoogleSignIn}
                loading={isSigningIn || loading}
              />
            </View>

            {/* Terms and Privacy */}
            <Text style={[styles.terms, { color: colors.secondaryText }]}>
              By continuing, you agree to our{' '}
              <Text style={[styles.link, { color: Colors.brand.blue }]}>Terms of Service</Text>{' '}
              and{' '}
              <Text style={[styles.link, { color: Colors.brand.blue }]}>Privacy Policy</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={isSigningIn || loading} message="Signing in..." />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  logoSection: {
    alignItems: 'center',
    marginTop: Spacing.xxl,
    marginBottom: Spacing.xxl,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: Spacing.md,
  },
  appName: {
    ...Typography.h1,
    fontSize: 36,
    marginBottom: Spacing.sm,
  },
  tagline: {
    ...Typography.body,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  authSection: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  buttonsContainer: {
    marginBottom: Spacing.lg,
  },
  terms: {
    ...Typography.caption,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
    lineHeight: 18,
  },
  link: {
    textDecorationLine: 'underline',
  },
});