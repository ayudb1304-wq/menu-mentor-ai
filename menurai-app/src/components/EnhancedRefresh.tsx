import React, { useRef, useEffect } from 'react';
import {
  RefreshControl,
  RefreshControlProps,
  Animated,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../theme/colors';

interface EnhancedRefreshProps extends Omit<RefreshControlProps, 'refreshing' | 'onRefresh'> {
  refreshing: boolean;
  onRefresh: () => void;
}

/**
 * Enhanced refresh control with haptic feedback
 */
export const EnhancedRefresh: React.FC<EnhancedRefreshProps> = ({
  refreshing,
  onRefresh,
  ...props
}) => {
  const previousRefreshing = useRef(refreshing);

  useEffect(() => {
    // Trigger haptic when refresh starts
    if (refreshing && !previousRefreshing.current) {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
    
    // Trigger haptic when refresh completes
    if (!refreshing && previousRefreshing.current) {
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    }

    previousRefreshing.current = refreshing;
  }, [refreshing]);

  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={[Colors.brand.blue, Colors.brand.blueLight]}
      tintColor={Colors.brand.blue}
      progressBackgroundColor={Colors.white}
      {...props}
    />
  );
};

interface CustomRefreshIndicatorProps {
  progress: number; // 0 to 1
}

/**
 * Custom refresh indicator with animations
 */
export const CustomRefreshIndicator: React.FC<CustomRefreshIndicatorProps> = ({
  progress,
}) => {
  const rotation = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Scale based on pull progress
    Animated.spring(scale, {
      toValue: progress,
      friction: 5,
      useNativeDriver: true,
    }).start();

    // Continuous rotation
    if (progress >= 1) {
      Animated.loop(
        Animated.timing(rotation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    }
  }, [progress]);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.brand.blue,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [
          { scale },
          { rotate },
        ],
      }}
    >
      <Animated.Text
        style={{
          fontSize: 20,
          color: Colors.white,
          fontWeight: 'bold',
        }}
      >
        ↻
      </Animated.Text>
    </Animated.View>
  );
};
