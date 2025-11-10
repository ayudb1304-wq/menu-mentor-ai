/**
 * Assets configuration for cross-platform compatibility
 * This module provides proper asset imports for both native and web platforms
 */

import { Platform } from 'react-native';

// For native platforms, use require
// For web, we'll use the public folder path
export const AppAssets = {
  logo: Platform.OS === 'web' 
    ? { uri: '/icon.png' } 
    : require('../../assets/icon.png'),
  
  icon: Platform.OS === 'web'
    ? { uri: '/icon.png' }
    : require('../../assets/icon.png'),
    
  favicon: Platform.OS === 'web'
    ? { uri: '/favicon.png' }
    : require('../../assets/favicon.png'),
};
