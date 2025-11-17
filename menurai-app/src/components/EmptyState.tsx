import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { Typography, Spacing, BorderRadius } from '../theme/styles';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: string;
  iconSet?: 'MaterialIcons' | 'Feather';
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

/**
 * Beautiful empty state with animated illustration
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'inbox',
  iconSet = 'MaterialIcons',
  title,
  description,
  actionLabel,
  onAction,
  style,
}) => {
  const { colors } = useTheme();
  
  // Animation values
  const floatAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial entrance animation
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const IconComponent = iconSet === 'Feather' ? Feather : MaterialIcons;

  return (
    <Animated.View
      style={[
        styles.container,
        { opacity: opacityAnim },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          {
            backgroundColor: Colors.brand.primary + '15',
            transform: [
              { translateY: floatAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        <IconComponent
          name={icon as any}
          size={64}
          color={Colors.brand.primary}
        />
      </Animated.View>

      <Text style={[styles.title, { color: colors.primaryText }]}>
        {title}
      </Text>

      {description && (
        <Text style={[styles.description, { color: colors.secondaryText }]}>
          {description}
        </Text>
      )}

      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          style={styles.actionButton}
        />
      )}
    </Animated.View>
  );
};

interface NoResultsProps {
  searchTerm?: string;
  onReset?: () => void;
  style?: ViewStyle;
}

/**
 * No search results empty state
 */
export const NoResults: React.FC<NoResultsProps> = ({
  searchTerm,
  onReset,
  style,
}) => {
  return (
    <EmptyState
      icon="search-off"
      iconSet="Feather"
      title="No Results Found"
      description={
        searchTerm
          ? `We couldn't find anything matching "${searchTerm}"`
          : "Try adjusting your search criteria"
      }
      actionLabel={onReset ? "Clear Search" : undefined}
      onAction={onReset}
      style={style}
    />
  );
};

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

/**
 * Error state with retry option
 */
export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something Went Wrong",
  description = "We encountered an error. Please try again.",
  onRetry,
  style,
}) => {
  return (
    <EmptyState
      icon="alert-circle"
      iconSet="Feather"
      title={title}
      description={description}
      actionLabel={onRetry ? "Try Again" : undefined}
      onAction={onRetry}
      style={style}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h3,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    ...Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    maxWidth: 300,
  },
  actionButton: {
    minWidth: 160,
  },
});
