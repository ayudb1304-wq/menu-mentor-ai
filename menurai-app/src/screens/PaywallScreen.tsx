import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Lock, Star, CheckCircle, X, ArrowLeft } from '../components/icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { Typography, Spacing, BorderRadius, Shadows } from '../theme/styles';
import { Button, Card, GlassCard, PageTransition, HeroTransition } from '../components';
import { ScanStackParamList } from '../navigation/types';

type PaywallScreenRouteProp = RouteProp<ScanStackParamList, 'Paywall'>;

export const PaywallScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<PaywallScreenRouteProp>();
  const context = route.params?.context || 'scanLimit';

  const features = [
    {
      icon: '✓',
      title: 'Unlimited Menu Scans',
      description: 'Scan as many menus as you want, whenever you want',
    },
    {
      icon: '✓',
      title: 'Full Scan History',
      description: 'Access your complete scan history without limits',
    },
    {
      icon: '✓',
      title: 'Add up to 4 Profiles',
      description: 'Create profiles for family members and switch between them easily',
    },
    {
      icon: '✓',
      title: 'Personalized Suggestions',
      description: 'Tell us what you\'re craving to get an even more personalized suggestion',
    },
    {
      icon: '✓',
      title: 'Priority Support',
      description: 'Get faster response times and dedicated support',
    },
    {
      icon: '✓',
      title: 'Advanced Features',
      description: 'Unlock upcoming premium features as they launch',
    },
  ];

  const handleUpgrade = () => {
    // TODO: Implement premium upgrade flow
    // For now, show a placeholder alert
    // In production, this would integrate with payment provider
    console.log('Upgrade to Premium');
    // You can navigate to a payment screen or show payment modal here
  };

  const handleClose = () => {
    navigation.goBack();
  };

  return (
    <PageTransition type="fade" duration={300}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.container }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={24} color={colors.secondaryText} />
            </TouchableOpacity>
          </View>

          {/* Hero Section */}
          <HeroTransition delay={0} duration={400}>
            <View style={styles.heroSection}>
              <View style={[styles.iconContainer, { backgroundColor: Colors.brand.blue + '20' }]}>
                <Lock size={64} color={Colors.brand.blue} />
              </View>
              <Text style={[styles.heroTitle, { color: colors.primaryText }]}>
                {context === 'addProfile' 
                  ? 'Unlock Multiple Profiles' 
                  : "You've Reached Your Limit"}
              </Text>
              <Text style={[styles.heroSubtitle, { color: colors.secondaryText }]}>
                {context === 'addProfile'
                  ? 'Create up to 4 profiles for family members and switch between them easily. Upgrade to Premium to unlock this feature.'
                  : "You've used all 5 free menu scans. Upgrade to Premium for unlimited scans and more features."}
              </Text>
            </View>
          </HeroTransition>

          {/* Premium Badge */}
          <HeroTransition delay={100} duration={400}>
            <GlassCard style={styles.premiumBadge} intensity={70}>
              <View style={styles.badgeContent}>
                <Star size={32} color={Colors.brand.blue} fill={Colors.brand.blue} />
                <Text style={[styles.badgeTitle, { color: colors.primaryText }]}>
                  MenuMentor Premium
                </Text>
                <Text style={[styles.badgeSubtitle, { color: colors.secondaryText }]}>
                  Unlock unlimited scans and premium features
                </Text>
              </View>
            </GlassCard>
          </HeroTransition>

          {/* Features List */}
          <View style={styles.featuresSection}>
            <Text style={[styles.featuresTitle, { color: colors.primaryText }]}>
              Premium Features
            </Text>
            {features.map((feature, index) => (
              <HeroTransition key={index} delay={150 + index * 50} duration={400}>
                <Card style={styles.featureCard} variant="elevated">
                  <View style={styles.featureContent}>
                    <View style={[styles.featureIcon, { backgroundColor: Colors.brand.green + '20' }]}>
                      <CheckCircle size={24} color={Colors.brand.green} />
                    </View>
                    <View style={styles.featureText}>
                      <Text style={[styles.featureTitle, { color: colors.primaryText }]}>
                        {feature.title}
                      </Text>
                      <Text style={[styles.featureDescription, { color: colors.secondaryText }]}>
                        {feature.description}
                      </Text>
                    </View>
                  </View>
                </Card>
              </HeroTransition>
            ))}
          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <Button
              title="Upgrade to Premium"
              onPress={handleUpgrade}
              fullWidth
              style={styles.upgradeButton}
              icon={<Star size={20} color={Colors.white} fill={Colors.white} />}
            />
            <TouchableOpacity onPress={handleClose} style={styles.cancelButton}>
              <Text style={[styles.cancelText, { color: colors.secondaryText }]}>
                Maybe Later
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </PageTransition>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    marginTop: Spacing.md,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  heroTitle: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  heroSubtitle: {
    ...Typography.body,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
    lineHeight: 24,
  },
  premiumBadge: {
    marginBottom: Spacing.xl,
    padding: Spacing.lg,
  },
  badgeContent: {
    alignItems: 'center',
  },
  badgeTitle: {
    ...Typography.h4,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  badgeSubtitle: {
    ...Typography.body,
    textAlign: 'center',
  },
  featuresSection: {
    marginBottom: Spacing.xl,
  },
  featuresTitle: {
    ...Typography.h4,
    marginBottom: Spacing.md,
  },
  featureCard: {
    marginBottom: Spacing.md,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    ...Typography.bodyMedium,
    marginBottom: Spacing.xs,
    fontWeight: '600' as '600',
  },
  featureDescription: {
    ...Typography.bodySmall,
    lineHeight: 20,
  },
  ctaSection: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  upgradeButton: {
    marginBottom: Spacing.md,
  },
  cancelButton: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  cancelText: {
    ...Typography.bodyMedium,
  },
});

