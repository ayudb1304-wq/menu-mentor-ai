import React, { useRef, useEffect } from 'react';
import { Animated, View, StyleSheet, ViewStyle } from 'react-native';

interface HeroTransitionProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

/**
 * Hero transition component for dramatic image/element reveals
 */
export const HeroTransition: React.FC<HeroTransitionProps> = ({
  children,
  delay = 0,
  duration = 600,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: duration * 0.6,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [delay, duration]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { scale: scaleAnim },
            { translateY: translateY },
          ],
          opacity: opacityAnim,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface SharedElementProps {
  children: React.ReactNode;
  sharedId: string;
  style?: ViewStyle;
}

/**
 * Shared element for transitions between screens
 * Note: This is a simplified version. Full shared element transitions
 * require react-navigation's shared element library
 */
export const SharedElement: React.FC<SharedElementProps> = ({
  children,
  sharedId,
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
      onTouchStart={handlePress}
    >
      {children}
    </Animated.View>
  );
};

interface RevealAnimationProps {
  children: React.ReactNode;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  delay?: number;
  duration?: number;
  style?: ViewStyle;
}

/**
 * Reveal animation from specified direction
 */
export const RevealAnimation: React.FC<RevealAnimationProps> = ({
  children,
  direction = 'bottom',
  delay = 0,
  duration = 500,
  style,
}) => {
  const translateX = useRef(new Animated.Value(direction === 'left' ? -100 : direction === 'right' ? 100 : 0)).current;
  const translateY = useRef(new Animated.Value(direction === 'top' ? -100 : direction === 'bottom' ? 100 : 0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: 0,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: duration * 0.7,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [delay, duration, direction]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateX },
            { translateY },
          ],
          opacity,
        },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
