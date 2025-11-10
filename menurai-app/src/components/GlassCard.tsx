import React from 'react';
import { View, ViewProps, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme } from '../theme/ThemeContext';
import { BorderRadius, Spacing } from '../theme/styles';

interface GlassCardProps extends ViewProps {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  noPadding?: boolean;
  children: React.ReactNode;
}

/**
 * Glassmorphism card with frosted glass effect
 * Uses blur on supported platforms, fallback on web
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  intensity = 80,
  tint = 'light',
  noPadding = false,
  children,
  style,
  ...props
}) => {
  const { colors } = useTheme();

  if (Platform.OS === 'web') {
    // Web fallback with CSS backdrop-filter
    const webStyle = {
      backgroundColor: 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.3)',
    };

    return (
      <View
        style={[
          styles.card,
          { padding: noPadding ? 0 : Spacing.md },
          webStyle,
          style,
        ]}
        {...props}
      >
        {children}
      </View>
    );
  }

  // Native platforms use BlurView
  return (
    <BlurView
      intensity={intensity}
      tint={tint}
      style={[
        styles.card,
        { 
          padding: noPadding ? 0 : Spacing.md,
          backgroundColor: 'rgba(255, 255, 255, 0.5)',
        },
        style,
      ]}
      {...props}
    >
      {children}
    </BlurView>
  );
};

interface GlassModalProps extends ViewProps {
  visible?: boolean;
  children: React.ReactNode;
  onClose?: () => void;
}

/**
 * Full-screen glass modal with blur background
 */
export const GlassModal: React.FC<GlassModalProps> = ({
  visible = true,
  children,
  onClose,
  style,
  ...props
}) => {
  if (!visible) return null;

  if (Platform.OS === 'web') {
    const webStyle = {
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
    };

    return (
      <View style={[styles.modal, webStyle, style]} {...props}>
        {children}
      </View>
    );
  }

  return (
    <BlurView intensity={40} tint="dark" style={[styles.modal, style]} {...props}>
      {children}
    </BlurView>
  );
};

interface GlassHeaderProps extends ViewProps {
  children: React.ReactNode;
}

/**
 * Glass header with blur effect - perfect for sticky headers
 */
export const GlassHeader: React.FC<GlassHeaderProps> = ({
  children,
  style,
  ...props
}) => {
  if (Platform.OS === 'web') {
    const webStyle = {
      backgroundColor: 'rgba(248, 249, 250, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
    };

    return (
      <View style={[styles.header, webStyle, style]} {...props}>
        {children}
      </View>
    );
  }

  return (
    <BlurView
      intensity={90}
      tint="light"
      style={[
        styles.header,
        { backgroundColor: 'rgba(248, 249, 250, 0.85)' },
        style,
      ]}
      {...props}
    >
      {children}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  modal: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  header: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
});
