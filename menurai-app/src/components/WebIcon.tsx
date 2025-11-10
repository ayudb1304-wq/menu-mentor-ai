/**
 * Web-compatible icon component
 * Provides a fallback for icons that don't render on web
 */

import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface WebIconProps {
  name: string;
  size?: number;
  color?: string;
  style?: any;
}

// Simple SVG-based icons for web fallback
const IconSVGs: { [key: string]: string } = {
  'check-circle': '✓',
  'info': 'ℹ',
  'cancel': '✕',
  'restaurant-menu': '🍽',
  'lock-clock': '🔒',
  'star': '⭐',
  'notifications': '🔔',
  'help-outline': '❓',
  'privacy-tip': '🔐',
  'history': '⏱',
  'error-outline': '⚠',
  'google': 'G',
  'facebook-f': 'f',
  'twitter': '𝕏',
  'github': '',
  'user': '👤',
  'edit-2': '✎',
  'chevron-right': '›',
  'chevron-left': '‹',
  'trash-2': '🗑',
  'camera': '📷',
  'image': '🖼',
  'x': '✕',
  'check': '✓',
  'menu': '☰',
};

export const WebIcon: React.FC<WebIconProps> = ({ name, size = 24, color = '#000', style }) => {
  // On native platforms, this component shouldn't be used
  // But we provide a fallback just in case
  const iconChar = IconSVGs[name] || '?';
  
  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Text 
        style={[
          styles.icon, 
          { 
            fontSize: size * 0.8, 
            color,
            lineHeight: size 
          }
        ]}
      >
        {iconChar}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    textAlign: 'center',
    includeFontPadding: false,
  },
});
