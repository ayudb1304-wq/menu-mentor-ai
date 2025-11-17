import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { Colors } from '../theme/colors';
import { Typography, Spacing } from '../theme/styles';
import { useTheme } from '../theme/ThemeContext';
import { AlertCircle, WifiOff } from './icons';

/**
 * Network status bar that appears at the top when offline
 * Provides user feedback about connectivity issues
 */
export const NetworkStatusBar: React.FC = () => {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const { colors } = useTheme();
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const isOffline = !isConnected || isInternetReachable === false;

  useEffect(() => {
    if (isOffline) {
      // Slide down and fade in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide up and fade out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isOffline, slideAnim, opacityAnim]);

  if (!isOffline) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: Colors.semantic.error,
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={styles.content}>
        <WifiOff size={20} color={Colors.white} />
        <Text style={styles.text}>
          No internet connection. Some features may be unavailable.
        </Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: Platform.OS === 'ios' ? 44 : 8,
    paddingBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
    ...Platform.select({
      web: {
        position: 'fixed' as any,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  text: {
    ...Typography.caption,
    color: Colors.white,
    fontWeight: '600',
  },
});
