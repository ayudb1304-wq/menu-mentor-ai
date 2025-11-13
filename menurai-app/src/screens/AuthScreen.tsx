import React, { useState, useEffect, useRef } from 'react';
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
  ImageBackground,
  TouchableOpacity,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { Typography, Spacing, BorderRadius, Shadows } from '../theme/styles';
import { LoadingOverlay } from '../components';
import { useAuth } from '../hooks/useAuth';

export const AuthScreen: React.FC = () => {
  const { colors, isDarkMode } = useTheme();
  const { signInWithGoogle, loading, error } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isDemoVisible, setIsDemoVisible] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const sheetHeight = useRef(Dimensions.get('window').height * 0.7).current;
  const sheetTranslateY = useRef(new Animated.Value(sheetHeight)).current;

  useEffect(() => {
    if (error) {
      Alert.alert('Sign In Error', error.message, [{ text: 'OK' }]);
    }
  }, [error]);

  useEffect(() => {
    Animated.timing(sheetTranslateY, {
      toValue: isDemoVisible ? 0 : sheetHeight,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isDemoVisible, sheetHeight, sheetTranslateY]);

  useEffect(() => {
    if (isDemoVisible && !showResults) {
      setShowResults(true);
    }
  }, [isDemoVisible, showResults]);

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

  const handleDemoSignIn = async () => {
    setShowResults(true);
    await handleGoogleSignIn();
  };

  const handleShowDemo = () => {
    setIsDemoVisible(true);
  };

  const handleHideDemo = () => {
    setIsDemoVisible(false);
    setShowResults(false);
  };

  const handleDemoItemPress = (itemId: string) => {
    if (itemId === 'classic-burger') {
      Alert.alert(
        'Reason',
        "Burger bun contains gluten.\n\nTap 'Ask the Chef' to see what to say.",
        [
          { text: 'Ask the Chef', onPress: () => {} },
          { text: 'Close', style: 'cancel' },
        ]
      );
    }
  };

  const demoItems = [
    {
      id: 'chicken-quiche',
      status: 'green',
      title: 'Chicken Quiche',
      subtitle: 'Safe to Eat',
      icon: '✅',
    },
    {
      id: 'classic-burger',
      status: 'yellow',
      title: 'Classic Burger',
      subtitle: 'Needs Modification',
      icon: '⚠️',
    },
    {
      id: 'margarine',
      status: 'red',
      title: 'Margarine',
      subtitle: 'Contains: Dairy',
      icon: '❌',
    },
    {
      id: 'barley-risotto',
      status: 'red',
      title: 'Barley Risotto',
      subtitle: 'Contains: Gluten',
      icon: '❌',
    },
  ] as const;

  return (
    <SafeAreaView style={[styles.container]}>
      <ImageBackground
        source={require('../assets/images/menuimage.jpg')}
        style={styles.background}
        resizeMode="cover"
        blurRadius={6}
        imageStyle={styles.backgroundImage}
      >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
          <View style={styles.contentWrapper}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <Image
                source={require('../assets/images/menurai_logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.appName}>Menurai</Text>
              <Text style={styles.tagline}>
                Dine with confidence. Every dish, every time.
              </Text>
            </View>

            {/* Auth Section */}
            <View style={styles.authSection}>
              <Text style={styles.headline}>What can you actually eat?</Text>
              <Text style={styles.subheadline}>Stop guessing. Start enjoying.</Text>

              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: Colors.brand.blue }]}
                activeOpacity={0.85}
                onPress={handleShowDemo}
                disabled={isSigningIn || loading}
              >
                <Text style={styles.primaryButtonText}>Show Me the Magic</Text>
              </TouchableOpacity>

              {/* Terms and Privacy */}
              <Text style={styles.terms}>
                By continuing, you agree to our{' '}
                <Text style={styles.link}>Terms of Service</Text>{' '}
                and{' '}
                <Text style={styles.link}>Privacy Policy</Text>
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Bottom sheet */}
        {isDemoVisible && (
          <TouchableWithoutFeedback onPress={handleHideDemo}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>
        )}
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              backgroundColor: colors.card,
              transform: [{ translateY: sheetTranslateY }],
              height: sheetHeight,
            },
          ]}
        >
          <View style={styles.sheetHandle} />
          <ScrollView
            style={styles.sheetScroll}
            contentContainerStyle={styles.sheetScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.pitchSection}>
              <Text style={[styles.pitchTitle, { color: colors.primaryText }]}>
                This is Menu Mentor.
              </Text>
              <Text style={[styles.pitchSubtitle, { color: colors.secondaryText }]}>
                Get this clarity on every menu.
              </Text>
              <TouchableOpacity
                style={[
                  styles.googleButton,
                  {
                    borderColor: colors.border,
                    backgroundColor: Colors.white,
                  },
                ]}
                activeOpacity={0.85}
                onPress={handleDemoSignIn}
                disabled={isSigningIn || loading}
              >
                <View style={styles.googleBadge}>
                  <Text style={styles.googleBadgeText}>G</Text>
                </View>
                <Text style={[styles.googleButtonText, { color: colors.primaryText }]}>
                  Sign in with Google
                </Text>
              </TouchableOpacity>
            </View>

            {showResults && (
              <>
                <View style={styles.resultsHeaderSpacing} />
                <View style={styles.sheetHeader}>
                  <Text style={[styles.sheetTitle, { color: colors.primaryText }]}>
                    Showing results for...
                  </Text>
                  <Text style={[styles.sheetSubtitle, { color: colors.secondaryText }]}>
                    Profile: "Gluten-Free, Nut Allergy"
                  </Text>
                </View>
                <Image
                  source={require('../assets/images/menuimage.jpg')}
                  style={styles.menuImagePreview}
                  resizeMode="cover"
                />

                <View style={styles.demoList}>
                  {demoItems.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.demoItem,
                        styles[item.status],
                        !isDarkMode && Shadows.sm,
                      ]}
                      activeOpacity={0.85}
                      onPress={() => handleDemoItemPress(item.id)}
                    >
                      <Text style={styles.demoIcon}>{item.icon}</Text>
                      <View style={styles.demoTextWrapper}>
                        <Text style={[styles.demoTitle, { color: colors.primaryText }]}>
                          {item.title}
                        </Text>
                        <Text style={[styles.demoSubtitle, { color: colors.secondaryText }]}>
                          {item.subtitle}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </ScrollView>
        </Animated.View>
      </ImageBackground>

      <LoadingOverlay visible={isSigningIn || loading} message="Signing in..." />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  flex: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
  },
  logoSection: {
    alignItems: 'center',
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
    color: Colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.45)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  tagline: {
    ...Typography.body,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  authSection: {
    alignItems: 'center',
    width: '100%',
  },
  headline: {
    ...Typography.h2,
    textAlign: 'center',
    fontSize: 32,
    marginBottom: Spacing.md,
    color: Colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  subheadline: {
    ...Typography.body,
    textAlign: 'center',
    fontSize: 18,
    marginBottom: Spacing.xl,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 24,
  },
  primaryButton: {
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    width: '100%',
    paddingHorizontal: Spacing.xl,
  },
  primaryButtonText: {
    ...Typography.button,
    fontSize: 18,
    color: Colors.white,
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 48,
    height: 6,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'rgba(33, 37, 41, 0.16)',
    marginBottom: Spacing.lg,
  },
  sheetHeader: {
    marginBottom: Spacing.lg,
  },
  sheetScroll: {
    flex: 1,
  },
  sheetScrollContent: {
    paddingBottom: Spacing.lg,
  },
  resultsHeaderSpacing: {
    height: Spacing.lg,
  },
  menuImagePreview: {
    width: '100%',
    height: 160,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  sheetTitle: {
    ...Typography.h4,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  sheetSubtitle: {
    ...Typography.body,
    textAlign: 'center',
  },
  demoList: {
    marginBottom: Spacing.lg,
  },
  demoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  demoIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  demoTextWrapper: {
    flex: 1,
  },
  demoTitle: {
    ...Typography.h5,
    marginBottom: Spacing.xs,
  },
  demoSubtitle: {
    ...Typography.caption,
  },
  pitchSection: {
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    width: '100%',
  },
  pitchTitle: {
    ...Typography.h4,
    marginBottom: Spacing.xs,
  },
  pitchSubtitle: {
    ...Typography.body,
    textAlign: 'center',
  },
  green: {
    backgroundColor: 'rgba(46, 204, 113, 0.15)',
  },
  yellow: {
    backgroundColor: 'rgba(241, 196, 15, 0.15)',
  },
  red: {
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: Spacing.lg,
    width: '100%',
    minHeight: 56,
  },
  googleBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.social.google,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  googleBadgeText: {
    ...Typography.button,
    color: Colors.white,
    fontSize: 20,
    fontWeight: '600',
  },
  googleButtonText: {
    ...Typography.button,
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  terms: {
    ...Typography.caption,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
    lineHeight: 18,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  link: {
    textDecorationLine: 'underline',
    color: Colors.white,
  },
});