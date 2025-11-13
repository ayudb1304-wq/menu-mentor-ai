import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Typography, Spacing } from '../theme/styles';

export const TermsScreen: React.FC = () => {
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
          Terms and Conditions
        </Text>
        <Text style={[styles.updated, { color: colors.secondaryText }]}>
          Last Updated: October 23, 2025
        </Text>

        <Text style={[styles.paragraph, { color: colors.primaryText }]}>
          Welcome to Menu Mentor ("the App"). These Terms and Conditions ("Terms") govern your use of
          our mobile application and services. By creating an account, you agree to these Terms.
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>1. The Service</Text>
          <Text style={[styles.paragraph, { color: colors.primaryText }]}>
            Menu Mentor is a tool designed to help users with dietary restrictions analyze restaurant
            menus. You provide your dietary profile, and our AI analyzes menu text—from images you
            upload—to classify dishes as "safe," "unsafe," or "needs modification."
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
            2. Disclaimer of Liability & AI Analysis
          </Text>
          <Text style={[styles.paragraph, styles.bold, { color: colors.primaryText }]}>
            Menu Mentor&apos;s analysis is for informational purposes only. It is not medical advice.
          </Text>
          <Text style={[styles.paragraph, { color: colors.primaryText }]}>
            The AI analysis is based on interpreting menu text and may not be 100% accurate. Menu
            descriptions can be vague, and we cannot account for hidden ingredients,
            cross-contamination, or recipe changes made by the restaurant.
          </Text>
          <Text style={[styles.paragraph, styles.bold, { color: colors.primaryText }]}>
            You are 100% responsible for your own safety. You must independently verify all
            information with restaurant staff before ordering or consuming any food.
          </Text>
          <Text style={[styles.paragraph, { color: colors.primaryText }]}>
            We are not liable for any allergic reactions, dietary violations, or adverse health
            effects that may occur from relying on information provided by the App. You use Menu
            Mentor at your own risk.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
            3. Accounts & Subscriptions
          </Text>
          <Text style={[styles.paragraph, { color: colors.primaryText }]}>
            You must create an account to use the App. We offer two tiers:
          </Text>
          <View style={styles.list}>
            <Text style={[styles.listItem, { color: colors.primaryText }]}>
              • <Text style={styles.bold}>Free Tier:</Text> Includes one (1) saved dietary profile
              and up to ten (10) menu scans per calendar month.
            </Text>
            <Text style={[styles.listItem, { color: colors.primaryText }]}>
              • <Text style={styles.bold}>Premium Tier:</Text> Offered at $4.99/month or $29.99/year.
              Includes unlimited menu scans, up to five (5) saved dietary profiles, access to the
              “Ask the Chef” feature, and saved scan history.
            </Text>
          </View>
          <Text style={[styles.paragraph, { color: colors.primaryText }]}>
            Payments are handled by the Apple App Store or Google Play Store.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>4. User Content</Text>
          <Text style={[styles.paragraph, { color: colors.primaryText }]}>
            You grant Menu Mentor a non-exclusive, worldwide, royalty-free license to use, copy, and
            process the menu images you upload for the sole purpose of providing and improving the
            service.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>5. Termination</Text>
          <Text style={[styles.paragraph, { color: colors.primaryText }]}>
            We reserve the right to terminate or suspend your account at any time, without notice,
            for conduct that violates these Terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>6. Governing Law</Text>
          <Text style={[styles.paragraph, { color: colors.primaryText }]}>
            These Terms shall be governed by the laws of your country or state of incorporation.
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
  list: {
    gap: Spacing.xs,
  },
  listItem: {
    ...Typography.body,
    lineHeight: 22,
  },
  bold: {
    fontWeight: '600',
  },
});

