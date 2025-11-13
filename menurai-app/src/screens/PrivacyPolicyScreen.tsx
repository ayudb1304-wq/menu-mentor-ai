import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';
import { Typography, Spacing } from '../theme/styles';

export const PrivacyPolicyScreen: React.FC = () => {
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
        <Text style={[styles.heading, { color: colors.primaryText }]}>Privacy Policy</Text>
        <Text style={[styles.updated, { color: colors.secondaryText }]}>
          Last Updated: October 23, 2025
        </Text>

        <Text style={[styles.paragraph, { color: colors.primaryText }]}>
          Your privacy and trust are critical to us. This policy explains what data we collect and why.
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
            1. Information We Collect
          </Text>
          <View style={styles.list}>
            <Text style={[styles.listItem, { color: colors.primaryText }]}>
              • <Text style={styles.bold}>Personal Information:</Text> Your email address and
              authentication data from Google or Apple Sign-In.
            </Text>
            <Text style={[styles.listItem, { color: colors.primaryText }]}>
              • <Text style={styles.bold}>Sensitive Personal Information:</Text> Your dietary profile,
              including preset diets (e.g., Vegan, Gluten-Free) and any custom allergens you provide
              (e.g., "peanuts," "shellfish").
            </Text>
            <Text style={[styles.listItem, { color: colors.primaryText }]}>
              • <Text style={styles.bold}>User Content:</Text> The menu images you capture or upload.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
            2. How We Use Your Information
          </Text>
          <Text style={[styles.paragraph, { color: colors.primaryText }]}>
            We use your data to provide the core service:
          </Text>
          <View style={styles.list}>
            <Text style={[styles.listItem, { color: colors.primaryText }]}>
              • Your dietary profile personalizes the AI analysis.
            </Text>
            <Text style={[styles.listItem, { color: colors.primaryText }]}>
              • Menu images are processed to extract text.
            </Text>
            <Text style={[styles.listItem, { color: colors.primaryText }]}>
              • Your email is used for account management and communication.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
            3. Third-Party Data Sharing
          </Text>
          <Text style={[styles.paragraph, { color: colors.primaryText }]}>
            We do not sell your personal data. However, to make the App function, we share specific
            data with trusted partners:
          </Text>
          <View style={styles.list}>
            <Text style={[styles.listItem, { color: colors.primaryText }]}>
              • <Text style={styles.bold}>Google Cloud Vision API:</Text> We send menu images to this
              service to perform Optical Character Recognition (OCR) and extract text.
            </Text>
            <Text style={[styles.listItem, { color: colors.primaryText }]}>
              • <Text style={styles.bold}>Google Gemini API:</Text> We send the extracted menu text
              and your active dietary profile to this service to run the AI analysis and classification.
            </Text>
            <Text style={[styles.listItem, { color: colors.primaryText }]}>
              • <Text style={styles.bold}>Firebase (Google):</Text> We use Firebase services such as
              Authentication and Firestore to securely store your account and saved dietary profiles.
            </Text>
          </View>
          <Text style={[styles.paragraph, { color: colors.primaryText }]}>
            By using the App, you consent to this processing.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
            4. Data Security
          </Text>
          <Text style={[styles.paragraph, { color: colors.primaryText }]}>
            We implement industry-standard safeguards, including Firebase security rules, to protect
            your data. No security method is 100% foolproof, and you share data at your own risk.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
            5. Children&apos;s Privacy
          </Text>
          <Text style={[styles.paragraph, { color: colors.primaryText }]}>
            You must be 13 or older to use Menu Mentor. We do not knowingly collect data from
            children.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>6. Contact Us</Text>
          <Text style={[styles.paragraph, { color: colors.primaryText }]}>
            If you have questions about this policy, contact us at aditya.dev.corp@gmail.com.
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

