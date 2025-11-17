/**
 * Platform-specific icon wrapper
 * Uses lucide-react on web and lucide-react-native on native platforms
 */

import React from 'react';
import { Platform } from 'react-native';

// Import from both libraries
import * as LucideWeb from 'lucide-react';
import * as LucideNative from 'lucide-react-native';

// Icon props interface
export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// Create wrapper function for web icons to match native API
const createWebIcon = (WebIcon: any) => {
  return ({ size = 24, color = 'currentColor', strokeWidth = 2 }: IconProps) => {
    return React.createElement(WebIcon, {
      size,
      color,
      strokeWidth,
      style: { display: 'inline-block', verticalAlign: 'middle' }
    });
  };
};

// Create wrapper function that returns the appropriate icon
const createIcon = (name: string) => {
  if (Platform.OS === 'web') {
    const WebIcon = (LucideWeb as any)[name];
    return createWebIcon(WebIcon);
  } else {
    return (LucideNative as any)[name];
  }
};

// Export all icons
export const Camera = createIcon('Camera');
export const ImageIcon = createIcon('Image');
export const History = createIcon('History');
export const User = createIcon('User');
export const ChefHat = createIcon('ChefHat');
export const Scan = createIcon('Scan');
export const Clock = createIcon('Clock');
export const UserCircle = createIcon('UserCircle');
export const ArrowLeft = createIcon('ArrowLeft');
export const Menu = createIcon('Menu');
export const Bell = createIcon('Bell');
export const LogOut = createIcon('LogOut');
export const Edit = createIcon('Edit');
export const Utensils = createIcon('Utensils');
export const Heart = createIcon('Heart');
export const AlertCircle = createIcon('AlertCircle');
export const CheckCircle = createIcon('CheckCircle');
export const XCircle = createIcon('XCircle');
export const Info = createIcon('Info');
export const Search = createIcon('Search');
export const Filter = createIcon('Filter');
export const Download = createIcon('Download');
export const Upload = createIcon('Upload');
export const Settings = createIcon('Settings');
export const Home = createIcon('Home');
export const Plus = createIcon('Plus');
export const Minus = createIcon('Minus');
export const X = createIcon('X');
export const Check = createIcon('Check');
export const ChevronRight = createIcon('ChevronRight');
export const ChevronLeft = createIcon('ChevronLeft');
export const ChevronDown = createIcon('ChevronDown');
export const ChevronUp = createIcon('ChevronUp');
export const Trash2 = createIcon('Trash2');
export const Share2 = createIcon('Share2');
export const Edit2 = createIcon('Edit2');
export const Star = createIcon('Star');
export const HelpCircle = createIcon('HelpCircle');
export const Lock = createIcon('Lock');
export const LockKeyhole = createIcon('LockKeyhole');
export const WifiOff = createIcon('WifiOff');
