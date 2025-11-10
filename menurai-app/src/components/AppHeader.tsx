import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebIcon } from './WebIcon';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { Typography, Spacing, Shadows } from '../theme/styles';

interface AppHeaderProps {
  title?: string;
  showBackButton?: boolean;
  showMenuButton?: boolean;
  showNotificationButton?: boolean;
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
  customRight?: React.ReactNode;
}

export const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  showBackButton = false,
  showMenuButton = false,
  showNotificationButton = false,
  onMenuPress,
  onNotificationPress,
  customRight,
}) => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleBackPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background, // Match app background
          borderBottomColor: 'transparent', // Remove border for seamless look
          paddingTop: insets.top || StatusBar.currentHeight || 0,
        },
      ]}
    >
      <View style={styles.content}>
        {/* Left Section */}
        <View style={styles.leftSection}>
          {showBackButton ? (
            <TouchableOpacity
              onPress={handleBackPress}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <WebIcon name="chevron-left" size={24} color={colors.primaryText} />
            </TouchableOpacity>
          ) : showMenuButton ? (
            <TouchableOpacity
              onPress={onMenuPress}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <WebIcon name="menu" size={24} color={colors.primaryText} />
            </TouchableOpacity>
          ) : (
            <View style={styles.logoContainer}>
              <Image
                source={require('../../assets/icon.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
              <Text style={[styles.logoText, { color: colors.primaryText }]}>
                Menurai
              </Text>
            </View>
          )}
        </View>

        {/* Center Section - Title */}
        {title && showBackButton && (
          <View style={styles.centerSection}>
            <Text
              style={[styles.title, { color: colors.primaryText }]}
              numberOfLines={1}
            >
              {title}
            </Text>
          </View>
        )}

        {/* Right Section */}
        <View style={styles.rightSection}>
          {customRight ? (
            customRight
          ) : showNotificationButton ? (
            <TouchableOpacity
              onPress={onNotificationPress}
              style={styles.iconButton}
              activeOpacity={0.7}
            >
              <WebIcon name="notifications" size={22} color={colors.primaryText} />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholder} />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    ...Shadows.sm,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: Spacing.md,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoImage: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  logoBackground: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    marginLeft: Spacing.sm,
    fontSize: 20,
    fontWeight: '700' as '700',
    letterSpacing: -0.5,
  },
  title: {
    ...Typography.h4,
    fontSize: 18,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  placeholder: {
    width: 40,
  },
});