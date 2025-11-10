/**
 * Cross-platform SafeAreaView wrapper
 * Works properly on web, iOS, and Android
 */

import React from 'react';
import { SafeAreaView, View, Platform, StyleSheet, ViewProps } from 'react-native';

interface SafeViewProps extends ViewProps {
  children: React.ReactNode;
}

export const SafeView: React.FC<SafeViewProps> = ({ children, style, ...props }) => {
  // On web, use a regular View since SafeAreaView doesn't work
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webContainer, style]} {...props}>
        {children}
      </View>
    );
  }

  // On mobile, use SafeAreaView
  return (
    <SafeAreaView style={[styles.container, style]} {...props}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webContainer: {
    flex: 1,
    // Add padding for web to simulate safe area
    ...(Platform.OS === 'web' && {
      paddingTop: 0,
    }),
  },
});
