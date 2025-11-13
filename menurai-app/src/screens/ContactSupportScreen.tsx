import React from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Linking from 'expo-linking';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Typography, Spacing } from '../theme/styles';
import { Button } from '../components';

const SUPPORT_EMAIL = 'aditya.dev.corp@gmail.com';

export const ContactSupportScreen: React.FC = () => {
  const { colors } = useTheme();

  const handleContactPress = async () => {
    const mailtoUrl = `mailto:${SUPPORT_EMAIL}`;
    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);

      if (!canOpen) {
        throw new Error('Unable to open email client.');
      }

      await Linking.openURL(mailtoUrl);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to open email client at this time.';
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Contact Support', message);
      }
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.container }]}
      edges={['left', 'right', 'bottom']}
    >
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.contentContainer}
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.heading, { color: colors.primaryText }]}>Contact Support</Text>
        <Text style={[styles.paragraph, { color: colors.secondaryText }]}>
          We&apos;re here to help. If you have questions about Menu Mentor, encounter issues, or want
          to share feedback, reach out to our support team.
        </Text>

        <View style={styles.card}>
          <Text style={[styles.cardTitle, { color: colors.primaryText }]}>Email Support</Text>
          <Text style={[styles.cardDescription, { color: colors.secondaryText }]}>
            Tap the button below to open your email client with our support address.
          </Text>
          <Button title="Email Support" onPress={handleContactPress} fullWidth />

          <View style={styles.emailHint}>
            <Text style={[styles.emailLabel, { color: colors.secondaryText }]}>Support Email</Text>
            <Text style={[styles.emailValue, { color: colors.primaryText }]}>{SUPPORT_EMAIL}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    paddingTop: Spacing.lg,
    gap: Spacing.lg,
  },
  heading: {
    ...Typography.h3,
    fontWeight: '700',
  },
  paragraph: {
    ...Typography.body,
    lineHeight: 22,
  },
  card: {
    gap: Spacing.md,
  },
  cardTitle: {
    ...Typography.h5,
    fontWeight: '600',
  },
  cardDescription: {
    ...Typography.body,
    lineHeight: 22,
  },
  emailHint: {
    gap: Spacing.xs,
  },
  emailLabel: {
    ...Typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  emailValue: {
    ...Typography.bodyMedium,
    fontWeight: '600',
  },
});

