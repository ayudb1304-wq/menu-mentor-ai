import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Typography, Spacing } from '../theme/styles';

export const CancellationPolicyScreen: React.FC = () => {
  const { colors } = useTheme();

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
        <Text style={[styles.heading, { color: colors.primaryText }]}>
          Cancellation & Refund Policy
        </Text>
        <Text style={[styles.updated, { color: colors.secondaryText }]}>
          Last Updated: October 23, 2025
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>1. Cancellation</Text>
          <Text style={[styles.paragraph, { color: colors.primaryText }]}>
            You may cancel your Premium subscription at any time. Subscriptions are managed directly
            through your Apple App Store or Google Play Store account.
          </Text>
          <Text style={[styles.paragraph, { color: colors.primaryText }]}>
            If you cancel, your Premium access will continue until the end of your current billing
            cycle (monthly or annual), after which your account will revert to the Free Tier.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>2. Refunds</Text>
          <Text style={[styles.paragraph, styles.bold, { color: colors.primaryText }]}>
            All sales are final. We do not offer refunds.
          </Text>
          <Text style={[styles.paragraph, { color: colors.primaryText }]}>
            We do not provide refunds or credits for partial subscription periods, unused time, or
            accidental purchases.
          </Text>
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
    gap: Spacing.md,
  },
  heading: {
    ...Typography.h3,
    fontWeight: '700',
  },
  updated: {
    ...Typography.caption,
  },
  paragraph: {
    ...Typography.body,
    lineHeight: 22,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.h5,
    fontWeight: '600',
  },
  bold: {
    fontWeight: '600',
  },
});

