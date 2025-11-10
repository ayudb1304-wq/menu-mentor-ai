import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Typography, Spacing } from '../theme/styles';

export const HomeScreen: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.container }]}>
      <Text style={[styles.text, { color: colors.primaryText }]}>
        Home Screen - Scan Options will go here
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  text: {
    ...Typography.h4,
  },
});