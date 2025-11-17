import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../theme/colors';

interface PulseLoaderProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

/**
 * Pulsing circular loader with gradient
 */
export const PulseLoader: React.FC<PulseLoaderProps> = ({
  size = 60,
  color = Colors.brand.primary,
  style,
}) => {
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;
  const pulse3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createPulse = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.timing(animValue, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
    };

    Animated.parallel([
      createPulse(pulse1, 0),
      createPulse(pulse2, 500),
      createPulse(pulse3, 1000),
    ]).start();
  }, []);

  const getPulseStyle = (animValue: Animated.Value) => ({
    opacity: animValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0.6, 0],
    }),
    transform: [
      {
        scale: animValue.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 2],
        }),
      },
    ],
  });

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Animated.View
        style={[
          styles.pulse,
          { 
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
          getPulseStyle(pulse1),
        ]}
      />
      <Animated.View
        style={[
          styles.pulse,
          { 
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
          getPulseStyle(pulse2),
        ]}
      />
      <Animated.View
        style={[
          styles.pulse,
          { 
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
          getPulseStyle(pulse3),
        ]}
      />
      <View
        style={[
          styles.center,
          { 
            width: size * 0.4,
            height: size * 0.4,
            borderRadius: size * 0.2,
            backgroundColor: color,
          },
        ]}
      />
    </View>
  );
};

interface DotsLoaderProps {
  color?: string;
  style?: ViewStyle;
}

/**
 * Three bouncing dots loader
 */
export const DotsLoader: React.FC<DotsLoaderProps> = ({
  color = Colors.brand.primary,
  style,
}) => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createBounce = (animValue: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: -15,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      );
    };

    Animated.parallel([
      createBounce(dot1, 0),
      createBounce(dot2, 150),
      createBounce(dot3, 300),
    ]).start();
  }, []);

  return (
    <View style={[styles.dotsContainer, style]}>
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: color, transform: [{ translateY: dot1 }] },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: color, transform: [{ translateY: dot2 }] },
        ]}
      />
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: color, transform: [{ translateY: dot3 }] },
        ]}
      />
    </View>
  );
};

interface SpinnerLoaderProps {
  size?: number;
  style?: ViewStyle;
}

/**
 * Gradient spinner loader
 */
export const SpinnerLoader: React.FC<SpinnerLoaderProps> = ({
  size = 40,
  style,
}) => {
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View
      style={[
        {
          width: size,
          height: size,
          transform: [{ rotate }],
        },
        style,
      ]}
    >
      <LinearGradient
        colors={['#0066FF', '#00B4D8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        <View
          style={[
            styles.spinnerInner,
            {
              width: size * 0.7,
              height: size * 0.7,
              borderRadius: size * 0.35,
              top: size * 0.15,
              left: size * 0.15,
            },
          ]}
        />
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulse: {
    position: 'absolute',
  },
  center: {
    position: 'absolute',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  spinnerInner: {
    backgroundColor: '#F8F9FA',
    position: 'absolute',
  },
});
