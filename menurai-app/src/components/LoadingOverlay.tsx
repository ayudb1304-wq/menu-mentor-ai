import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Modal } from 'react-native';
import { Colors } from '../theme/colors';
import { Typography, Spacing } from '../theme/styles';
import { useTheme } from '../theme/ThemeContext';
import { JustifyContent, AlignItems, TextAlign } from '../theme/styleTypes';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  fullScreen?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  visible,
  message,
  fullScreen = true,
}) => {
  const { colors } = useTheme();

  if (!visible) return null;

  const content = (
    <View style={styles.container}>
      <View style={[styles.loadingBox, { backgroundColor: colors.card }]}>
        <ActivityIndicator size="large" color={Colors.brand.blue} />
        {message && (
          <Text style={[styles.message, { color: colors.primaryText }]}>
            {message}
          </Text>
        )}
      </View>
    </View>
  );

  if (fullScreen) {
    return (
      <Modal transparent={true} animationType="fade" visible={visible}>
        {content}
      </Modal>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
    justifyContent: JustifyContent.center,
    alignItems: AlignItems.center,
    zIndex: 1000,
  },
  loadingBox: {
    padding: Spacing.lg,
    borderRadius: 12,
    alignItems: AlignItems.center,
    minWidth: 150,
  },
  message: {
    ...Typography.body,
    marginTop: Spacing.md,
    textAlign: TextAlign.center,
  },
});