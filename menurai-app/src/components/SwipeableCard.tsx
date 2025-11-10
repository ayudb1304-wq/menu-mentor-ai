import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  ViewStyle,
  Dimensions,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { BorderRadius, Spacing } from '../theme/styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;
const SWIPE_OUT_DURATION = 250;

interface SwipeAction {
  icon: string;
  color: string;
  onPress: () => void;
  label?: string;
}

interface SwipeableCardProps {
  children: React.ReactNode;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  style?: ViewStyle;
}

/**
 * Swipeable card with customizable left/right actions
 * Includes haptic feedback and smooth animations
 */
export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  children,
  leftAction,
  rightAction,
  onSwipeLeft,
  onSwipeRight,
  style,
}) => {
  const { colors } = useTheme();
  const pan = useRef(new Animated.ValueXY()).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        // Only allow swipe if there's an action in that direction
        if (gesture.dx > 0 && rightAction) {
          pan.setValue({ x: gesture.dx, y: 0 });
        } else if (gesture.dx < 0 && leftAction) {
          pan.setValue({ x: gesture.dx, y: 0 });
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (Math.abs(gesture.dx) > SWIPE_THRESHOLD) {
          // Trigger haptic feedback
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }

          // Swipe out animation
          const direction = gesture.dx > 0 ? SCREEN_WIDTH : -SCREEN_WIDTH;
          Animated.parallel([
            Animated.timing(pan, {
              toValue: { x: direction, y: 0 },
              duration: SWIPE_OUT_DURATION,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: SWIPE_OUT_DURATION,
              useNativeDriver: true,
            }),
          ]).start(() => {
            // Call appropriate callback
            if (gesture.dx > 0) {
              rightAction?.onPress();
              onSwipeRight?.();
            } else {
              leftAction?.onPress();
              onSwipeLeft?.();
            }
            // Reset position
            pan.setValue({ x: 0, y: 0 });
            opacity.setValue(1);
          });
        } else {
          // Trigger light haptic for cancelled swipe
          if (Platform.OS !== 'web' && Math.abs(gesture.dx) > 20) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }

          // Spring back to center
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            friction: 5,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const getIconScale = () => {
    return pan.x.interpolate({
      inputRange: [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
      outputRange: [1.5, 0, 1.5],
      extrapolate: 'clamp',
    });
  };

  const getLeftActionOpacity = () => {
    return pan.x.interpolate({
      inputRange: [-SWIPE_THRESHOLD, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });
  };

  const getRightActionOpacity = () => {
    return pan.x.interpolate({
      inputRange: [0, SWIPE_THRESHOLD],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });
  };

  return (
    <View style={[styles.container, style]}>
      {/* Left Action (Delete/Remove) */}
      {leftAction && (
        <Animated.View
          style={[
            styles.actionContainer,
            styles.leftAction,
            { backgroundColor: leftAction.color, opacity: getLeftActionOpacity() },
          ]}
        >
          <Animated.View style={{ transform: [{ scale: getIconScale() }] }}>
            <Feather name={leftAction.icon as any} size={24} color={Colors.white} />
          </Animated.View>
          {leftAction.label && (
            <Text style={styles.actionLabel}>{leftAction.label}</Text>
          )}
        </Animated.View>
      )}

      {/* Right Action (Archive/Complete) */}
      {rightAction && (
        <Animated.View
          style={[
            styles.actionContainer,
            styles.rightAction,
            { backgroundColor: rightAction.color, opacity: getRightActionOpacity() },
          ]}
        >
          <Animated.View style={{ transform: [{ scale: getIconScale() }] }}>
            <Feather name={rightAction.icon as any} size={24} color={Colors.white} />
          </Animated.View>
          {rightAction.label && (
            <Text style={styles.actionLabel}>{rightAction.label}</Text>
          )}
        </Animated.View>
      )}

      {/* Card Content */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.card,
          {
            transform: [{ translateX: pan.x }],
            opacity,
          },
        ]}
      >
        {children}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    position: 'relative',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  actionContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  leftAction: {
    right: 0,
    justifyContent: 'flex-end',
  },
  rightAction: {
    left: 0,
    justifyContent: 'flex-start',
  },
  actionLabel: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: Spacing.sm,
  },
});
