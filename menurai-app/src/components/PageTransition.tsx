import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewProps, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type TransitionType = 'fade' | 'slide' | 'scale' | 'slideUp' | 'zoomIn';

interface PageTransitionProps extends ViewProps {
  children: React.ReactNode;
  type?: TransitionType;
  duration?: number;
  delay?: number;
}

/**
 * Animated page transition wrapper
 */
export const PageTransition: React.FC<PageTransitionProps> = ({
  children,
  type = 'fade',
  duration = 400,
  delay = 0,
  style,
  ...props
}) => {
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  const getAnimatedStyle = () => {
    switch (type) {
      case 'fade':
        return {
          opacity: animValue,
        };
      
      case 'slide':
        return {
          opacity: animValue,
          transform: [
            {
              translateX: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [SCREEN_WIDTH, 0],
              }),
            },
          ],
        };
      
      case 'slideUp':
        return {
          opacity: animValue,
          transform: [
            {
              translateY: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [50, 0],
              }),
            },
          ],
        };
      
      case 'scale':
        return {
          opacity: animValue,
          transform: [
            {
              scale: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
              }),
            },
          ],
        };
      
      case 'zoomIn':
        return {
          opacity: animValue,
          transform: [
            {
              scale: animValue.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
            },
          ],
        };
      
      default:
        return { opacity: animValue };
    }
  };

  return (
    <Animated.View style={[styles.container, getAnimatedStyle(), style]} {...props}>
      {children}
    </Animated.View>
  );
};

interface StaggeredListProps {
  children: React.ReactElement[];
  staggerDelay?: number;
  itemType?: TransitionType;
}

/**
 * Staggered animation for list items
 */
export const StaggeredList: React.FC<StaggeredListProps> = ({
  children,
  staggerDelay = 100,
  itemType = 'slideUp',
}) => {
  return (
    <>
      {React.Children.map(children, (child, index) => (
        <PageTransition type={itemType} delay={index * staggerDelay} duration={400}>
          {child}
        </PageTransition>
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
