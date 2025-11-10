import React, { useRef } from 'react';
import {
  ScrollView,
  ScrollViewProps,
  Animated,
  View,
  StyleSheet,
  ViewStyle,
} from 'react-native';

interface ParallaxScrollProps extends ScrollViewProps {
  children: React.ReactNode;
  parallaxHeaderHeight?: number;
  renderHeader?: (scrollY: Animated.Value) => React.ReactNode;
  headerBackgroundColor?: string;
}

/**
 * Parallax scroll view with animated header
 */
export const ParallaxScroll: React.FC<ParallaxScrollProps> = ({
  children,
  parallaxHeaderHeight = 200,
  renderHeader,
  headerBackgroundColor = 'transparent',
  style,
  ...props
}) => {
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, parallaxHeaderHeight],
    outputRange: [0, -parallaxHeaderHeight / 2],
    extrapolate: 'clamp',
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, parallaxHeaderHeight / 2, parallaxHeaderHeight],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const headerScale = scrollY.interpolate({
    inputRange: [-parallaxHeaderHeight, 0, parallaxHeaderHeight],
    outputRange: [2, 1, 0.8],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      {renderHeader && (
        <Animated.View
          style={[
            styles.header,
            {
              height: parallaxHeaderHeight,
              backgroundColor: headerBackgroundColor,
              transform: [
                { translateY: headerTranslate },
                { scale: headerScale },
              ],
              opacity: headerOpacity,
            },
          ]}
        >
          {renderHeader(scrollY)}
        </Animated.View>
      )}
      
      <Animated.ScrollView
        {...props}
        style={[styles.scrollView, style]}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {renderHeader && <View style={{ height: parallaxHeaderHeight }} />}
        {children}
      </Animated.ScrollView>
    </View>
  );
};

interface ParallaxElementProps {
  scrollY: Animated.Value;
  speed?: number;
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Individual parallax element that moves at different speed
 */
export const ParallaxElement: React.FC<ParallaxElementProps> = ({
  scrollY,
  speed = 0.5,
  children,
  style,
}) => {
  const translateY = scrollY.interpolate({
    inputRange: [-1000, 0, 1000],
    outputRange: [1000 * speed, 0, -1000 * speed],
  });

  return (
    <Animated.View
      style={[
        {
          transform: [{ translateY }],
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
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
  },
});
