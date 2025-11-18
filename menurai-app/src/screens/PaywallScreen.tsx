import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Lock, Star, CheckCircle, X } from '../components/icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { Typography, Spacing, BorderRadius, Shadows } from '../theme/styles';
import { Button, Card, GlassCard, PageTransition, HeroTransition } from '../components';
import { ScanStackParamList } from '../navigation/types';
import RazorpayCheckout from 'react-native-razorpay';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../config/firebase';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { openRazorpayCheckout } from '../utils/razorpayWeb';

type PaywallScreenRouteProp = RouteProp<ScanStackParamList, 'Paywall'>;

const PLAN_IDS = {
  monthly: 'plan_RfIuMzKNOBsDvv',
  yearly: 'plan_RfJKP64ICEoRDU',
} as const;

type PlanType = keyof typeof PLAN_IDS;

const PLAN_DETAILS: Record<PlanType, { label: string; price: number; billingPeriod: string; savingsLabel?: string }> = {
  monthly: {
    label: 'Monthly',
    price: 199,
    billingPeriod: 'per month',
  },
  yearly: {
    label: 'Yearly',
    price: 2399,
    billingPeriod: 'per year',
  },
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);

export const PaywallScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<PaywallScreenRouteProp>();
  const context = route.params?.context || 'scanLimit';
  const { user } = useAuth();
  const { profile, isPremiumUser } = useUserProfile();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('monthly');

  const planOptions = useMemo(
    () =>
      (Object.keys(PLAN_IDS) as PlanType[]).map((plan) => ({
        value: plan,
        label: PLAN_DETAILS[plan].label,
      })),
    []
  );

  const selectedPlanDetails = PLAN_DETAILS[selectedPlan];

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

  const handleSubscribe = async () => {
    if (isProcessing) {
      return;
    }

    if (isPremiumUser) {
      Alert.alert('Already Premium', 'Your account already has premium access.');
      return;
    }

    let createdSubscriptionId: string | null = null;

    try {
      setIsProcessing(true);
      const createSubscription = httpsCallable<
        { planId: string },
        { subscriptionId: string; keyId: string }
      >(functions, 'createSubscription');
      const response = await createSubscription({ planId: PLAN_IDS[selectedPlan] });
      const data = response.data;

      if (!data?.subscriptionId || !data?.keyId) {
        throw new Error('Unable to initiate subscription. Please try again.');
      }

      createdSubscriptionId = data.subscriptionId;

      const options = {
        key: data.keyId,
        subscription_id: data.subscriptionId,
        name: 'Menu Mentor Premium',
        description: `${selectedPlanDetails.label} plan`,
        prefill: {
          email: user?.email ?? profile?.email ?? '',
          name: user?.displayName ?? profile?.displayName ?? '',
        },
        theme: {
          color: Colors.brand.primary,
        },
      };

      if (Platform.OS === 'web') {
        await openRazorpayCheckout(options);
      } else {
        if (typeof RazorpayCheckout?.open !== 'function') {
          throw new Error('Razorpay is not available on this device. Please reinstall the app.');
        }
        await RazorpayCheckout.open(options);
      }

      Alert.alert(
        'Success',
        'Payment successful! Your account will be upgraded shortly once the transaction is confirmed.'
      );
      navigation.goBack();
    } catch (error: any) {
      console.error('Subscription error:', error);

      if (createdSubscriptionId) {
        try {
          const abortSubscriptionCallable = httpsCallable<void, { message: string }>(
            functions,
            'abortPendingSubscription'
          );
          await abortSubscriptionCallable();
        } catch (cleanupError) {
          console.error('Failed to abort pending subscription:', cleanupError);
        }
      }

      if (error?.description) {
        Alert.alert('Payment Failed', `Payment failed: ${error.description}`);
      } else if (error?.code && error?.message) {
        Alert.alert('Error', error.message);
      } else if (error instanceof Error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert('Error', 'Something went wrong while processing your payment.');
      }
    } finally {
      setIsProcessing(false);
    }
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
              <View style={[styles.iconContainer, { backgroundColor: Colors.brand.primary + '20' }]}>
                <Lock size={64} color={Colors.brand.primary} />
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
                <Star size={32} color={Colors.brand.primary} fill={Colors.brand.primary} />
                <Text style={[styles.badgeTitle, { color: colors.primaryText }]}>
                  MenuMentor Premium
                </Text>
                <Text style={[styles.badgeSubtitle, { color: colors.secondaryText }]}>
                  Unlock unlimited scans and premium features
                </Text>
              </View>
            </GlassCard>
          </HeroTransition>

          {/* Plan Selector */}
          <HeroTransition delay={120} duration={400}>
            <Card style={styles.planSelectorCard} variant="elevated">
              <View style={[styles.planToggleContainer, { backgroundColor: Colors.brand.primary + '10' }]}>
                {planOptions.map((option) => {
                  const isActive = selectedPlan === option.value;
                  return (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => setSelectedPlan(option.value)}
                      style={[
                        styles.planToggle,
                        {
                          backgroundColor: isActive ? Colors.brand.primary : colors.background,
                          borderColor: Colors.brand.primary,
                        },
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.planToggleLabel,
                          { color: isActive ? Colors.white : colors.primaryText },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <View style={styles.planDetails}>
                <Text style={[styles.planPrice, { color: colors.primaryText }]}>
                  {formatCurrency(selectedPlanDetails.price)}
                </Text>
                <Text style={[styles.planBillingPeriod, { color: colors.secondaryText }]}>
                  {selectedPlanDetails.billingPeriod}
                </Text>
                {selectedPlanDetails.savingsLabel ? (
                  <View style={[styles.planSavingsBadge, { backgroundColor: Colors.brand.primary + '15' }] }>
                    <Text style={[styles.planSavingsText, { color: Colors.brand.primary }]}>
                      {selectedPlanDetails.savingsLabel}
                    </Text>
                  </View>
                ) : null}
              </View>
            </Card>
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
                    <View style={[styles.featureIcon, { backgroundColor: Colors.semantic.compliant + '20' }]}>
                      <CheckCircle size={24} color={Colors.semantic.compliant} />
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
              title={isPremiumUser ? "You're Premium" : `Upgrade • ${selectedPlanDetails.label}`}
              onPress={handleSubscribe}
              fullWidth
              style={styles.upgradeButton}
              icon={<Star size={20} color={Colors.white} fill={Colors.white} />}
              disabled={isPremiumUser}
              loading={isProcessing}
            />
            {!isPremiumUser && (
              <Text style={[styles.planDisclaimer, { color: colors.secondaryText }]}>
                {`${formatCurrency(selectedPlanDetails.price)} ${selectedPlanDetails.billingPeriod}`}
              </Text>
            )}
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
  planSelectorCard: {
    marginBottom: Spacing.xl,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  planToggleContainer: {
    flexDirection: 'row',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xs,
    gap: Spacing.xs,
  },
  planToggle: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planToggleLabel: {
    ...Typography.buttonSmall,
    fontWeight: '600',
  },
  planDetails: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  planPrice: {
    ...Typography.h2,
    fontWeight: '700',
  },
  planBillingPeriod: {
    ...Typography.bodyMedium,
  },
  planSavingsBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  planSavingsText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  planDisclaimer: {
    ...Typography.caption,
    textAlign: 'center',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.sm,
  },
});

