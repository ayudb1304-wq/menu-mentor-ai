import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  LayoutChangeEvent,
  Platform,
} from 'react-native';
import { Camera, History, User } from './icons';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { TabBarStyles, Spacing, Shadows } from '../theme/styles';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';

interface TabInfo {
  x: number;
  width: number;
}

export const AnimatedTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { colors, isDarkMode } = useTheme();
  const underlineTranslateX = useRef(new Animated.Value(0)).current;
  const underlineWidth = useRef(new Animated.Value(0)).current;
  const bubbleTranslateX = useRef(new Animated.Value(0)).current;
  const bubbleScale = useRef(new Animated.Value(0)).current;
  const [tabInfo, setTabInfo] = useState<TabInfo[]>([]);
  const tabColors = Colors.tabBar.light; // Always use light mode
  
  // Animation refs for each tab (bounce effect)
  const tabScaleAnims = useRef(
    state.routes.map(() => new Animated.Value(1))
  ).current;
  const iconScaleAnims = useRef(
    state.routes.map(() => new Animated.Value(1))
  ).current;

  // Measure tab positions
  const handleTabLayout = (index: number) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setTabInfo((prev) => {
      const newInfo = [...prev];
      newInfo[index] = { x, width };
      return newInfo;
    });
  };

  // Animate underline and bubble to selected tab
  useEffect(() => {
    if (tabInfo.length > 0 && tabInfo[state.index]) {
      const targetTab = tabInfo[state.index];
      const targetX = targetTab.x + (targetTab.width - targetTab.width * 0.6) / 2;
      const targetWidth = targetTab.width * 0.6;
      const bubbleX = targetTab.x + (targetTab.width - 56) / 2; // Center 56px bubble

      // Animate underline
      Animated.parallel([
        Animated.spring(underlineTranslateX, {
          toValue: targetX,
          damping: 20,
          stiffness: 150,
          useNativeDriver: true,
        }),
        Animated.spring(underlineWidth, {
          toValue: targetWidth,
          damping: 20,
          stiffness: 150,
          useNativeDriver: false,
        }),
      ]).start();

      // Animate bubble background
      Animated.parallel([
        Animated.spring(bubbleTranslateX, {
          toValue: bubbleX,
          damping: 15,
          stiffness: 120,
          useNativeDriver: true,
        }),
        Animated.spring(bubbleScale, {
          toValue: 1,
          damping: 15,
          stiffness: 120,
          useNativeDriver: true,
        }),
      ]).start();

      // Bounce animation for the selected tab
      Animated.sequence([
        Animated.spring(tabScaleAnims[state.index], {
          toValue: 1.2,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.spring(tabScaleAnims[state.index], {
          toValue: 1,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Icon bounce animation
      Animated.sequence([
        Animated.spring(iconScaleAnims[state.index], {
          toValue: 1.3,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.spring(iconScaleAnims[state.index], {
          toValue: 1,
          friction: 3,
          tension: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [state.index, tabInfo]);

  const renderIcon = (route: any, focused: boolean, index: number) => {
    const iconColor = focused ? tabColors.active : tabColors.inactive;
    const iconSize = 24;

    let IconComponent;
    switch (route.name) {
      case 'Scan':
        IconComponent = Camera;
        break;
      case 'History':
        IconComponent = History;
        break;
      case 'Profile':
        IconComponent = User;
        break;
      default:
        return null;
    }

    return (
      <Animated.View
        style={{
          transform: [{ scale: iconScaleAnims[index] }],
        }}
      >
        <IconComponent size={iconSize} color={iconColor} strokeWidth={focused ? 2.5 : 2} />
      </Animated.View>
    );
  };

  const handleTabPress = (index: number, route: any, isFocused: boolean) => {
    // Micro-interaction: quick press animation
    Animated.sequence([
      Animated.timing(tabScaleAnims[index], {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(tabScaleAnims[index], {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    const event = navigation.emit({
      type: 'tabPress',
      target: route.key,
      canPreventDefault: true,
    });

    if (!isFocused && !event.defaultPrevented) {
      navigation.navigate(route.name);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: tabColors.background }]}>
      {/* Animated Background Bubble */}
      <Animated.View
        style={[
          styles.bubble,
          {
            transform: [
              { translateX: bubbleTranslateX },
              { scale: bubbleScale },
            ],
            backgroundColor: tabColors.active + '15',
          },
        ]}
      />

      {/* Top Border with gradient effect */}
      <View style={[styles.topBorder, { backgroundColor: tabColors.border }]} />

      {/* Tab Items */}
      <View style={styles.tabContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => handleTabPress(index, route, isFocused);

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              onPress={onPress}
              onLongPress={onLongPress}
              onLayout={handleTabLayout(index)}
              style={styles.tab}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.tabContent,
                  {
                    transform: [{ scale: tabScaleAnims[index] }],
                  },
                ]}
              >
                {renderIcon(route, isFocused, index)}
                <Animated.Text
                  style={[
                    isFocused ? TabBarStyles.tabLabelActive : TabBarStyles.tabLabel,
                    {
                      color: isFocused ? tabColors.active : tabColors.inactive,
                      marginTop: 4,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {label as string}
                </Animated.Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Animated Underline with glow effect */}
      <Animated.View
        style={[
          styles.underline,
          {
            transform: [{ translateX: underlineTranslateX }],
            width: underlineWidth,
            backgroundColor: tabColors.underline,
            shadowColor: tabColors.underline,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 4,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: Platform.select({ ios: 80, android: 70, default: 70 }),
    position: 'relative',
    ...Shadows.md,
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  bubble: {
    position: 'absolute',
    top: 8,
    left: 0,
    width: 56,
    height: 56,
    borderRadius: 28,
    zIndex: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    zIndex: 1,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  tabContent: {
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
  },
  underline: {
    position: 'absolute',
    bottom: 0,
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    elevation: 4,
  },
});
