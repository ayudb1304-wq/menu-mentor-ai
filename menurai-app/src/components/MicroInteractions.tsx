import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Animated,
  ViewStyle,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';

interface PressableWithFeedbackProps {
  children: React.ReactNode;
  onPress?: () => void;
  hapticType?: 'light' | 'medium' | 'heavy' | 'selection';
  scaleEffect?: 'subtle' | 'normal' | 'strong';
  style?: ViewStyle;
}

/**
 * Enhanced pressable with haptic feedback and scale animation
 */
export const PressableWithFeedback: React.FC<PressableWithFeedbackProps> = ({
  children,
  onPress,
  hapticType = 'light',
  scaleEffect = 'normal',
  style,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const getScaleValue = () => {
    switch (scaleEffect) {
      case 'subtle':
        return 0.98;
      case 'strong':
        return 0.92;
      default:
        return 0.95;
    }
  };

  const getHapticFeedback = () => {
    if (Platform.OS === 'web') return;

    switch (hapticType) {
      case 'light':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      case 'medium':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      case 'heavy':
        return Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      case 'selection':
        return Haptics.selectionAsync();
    }
  };

  const handlePressIn = () => {
    getHapticFeedback();
    Animated.spring(scaleAnim, {
      toValue: getScaleValue(),
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      <Animated.View
        style={[
          { transform: [{ scale: scaleAnim }] },
          style,
        ]}
      >
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

interface ShakeAnimationProps {
  children: React.ReactNode;
  trigger: boolean;
  onShakeComplete?: () => void;
  style?: ViewStyle;
}

/**
 * Shake animation for errors or invalid states
 */
export const ShakeAnimation: React.FC<ShakeAnimationProps> = ({
  children,
  trigger,
  onShakeComplete,
  style,
}) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (trigger) {
      // Trigger haptic for error
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }

      // Shake animation
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onShakeComplete?.();
      });
    }
  }, [trigger]);

  return (
    <Animated.View
      style={[
        { transform: [{ translateX: shakeAnim }] },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
};

interface SuccessCheckmarkProps {
  visible: boolean;
  size?: number;
  color?: string;
  onComplete?: () => void;
}

/**
 * Animated success checkmark
 */
export const SuccessCheckmark: React.FC<SuccessCheckmarkProps> = ({
  visible,
  size = 60,
  color = '#28A745',
  onComplete,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      // Trigger success haptic
      if (Platform.OS !== 'web') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Success animation
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onComplete?.();
      });
    } else {
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [
          { scale: scaleAnim },
          { rotate },
        ],
        opacity: opacityAnim,
      }}
    >
      <Animated.Text
        style={{
          fontSize: size * 0.5,
          color: 'white',
          fontWeight: 'bold',
        }}
      >
        ✓
      </Animated.Text>
    </Animated.View>
  );
};
