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
import { WebIcon } from './WebIcon';
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
  const [tabInfo, setTabInfo] = useState<TabInfo[]>([]);
  const tabColors = Colors.tabBar.light; // Always use light mode

  // Measure tab positions
  const handleTabLayout = (index: number) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setTabInfo((prev) => {
      const newInfo = [...prev];
      newInfo[index] = { x, width };
      return newInfo;
    });
  };

  // Animate underline to selected tab
  useEffect(() => {
    if (tabInfo.length > 0 && tabInfo[state.index]) {
      const targetTab = tabInfo[state.index];
      const targetX = targetTab.x + (targetTab.width - targetTab.width * 0.6) / 2; // Center underline at 60% of tab width
      const targetWidth = targetTab.width * 0.6; // 60% of tab width for aesthetic

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
          useNativeDriver: false, // width animation requires false
        }),
      ]).start();
    }
  }, [state.index, tabInfo]);

  const renderIcon = (route: any, focused: boolean) => {
    const iconColor = focused ? tabColors.active : tabColors.inactive;
    const iconSize = 24;

    switch (route.name) {
      case 'Scan':
        return <WebIcon name="camera" size={iconSize} color={iconColor} />;
      case 'History':
        return <WebIcon name="history" size={iconSize} color={iconColor} />;
      case 'Profile':
        return <WebIcon name="user" size={iconSize} color={iconColor} />;
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: tabColors.background }]}>
      {/* Top Border */}
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

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

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
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              onLayout={handleTabLayout(index)}
              style={styles.tab}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                {renderIcon(route, isFocused)}
                <Text
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
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Animated Underline */}
      <Animated.View
        style={[
          styles.underline,
          {
            transform: [{ translateX: underlineTranslateX }],
            width: underlineWidth,
            backgroundColor: tabColors.underline,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: Platform.select({ ios: 80, android: 70, web: 65, default: 70 }),
    position: 'relative',
    ...Shadows.sm,
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
  },
  tabContainer: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
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
  },
});