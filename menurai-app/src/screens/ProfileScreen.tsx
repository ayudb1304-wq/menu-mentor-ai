import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { Utensils, Edit2, Lock, Info, HelpCircle, ChevronRight, User, Plus, Star } from '../components/icons';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { Typography, Spacing, BorderRadius } from '../theme/styles';
import { Button, Card, Chip } from '../components';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { format } from 'date-fns';
import { functions } from '../config/firebase';
import { httpsCallable } from 'firebase/functions';


const PLAN_LABELS: Record<string, string> = {
  plan_PREMIUM_MONTHLY: 'Premium Monthly',
  plan_PREMIUM_YEARLY: 'Premium Yearly',
};

const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  free: 'Free',
  pending: 'Pending Activation',
  active: 'Active',
  failed: 'Payment Failed',
  cancelled: 'Subscription Cancelled',
  pending_cancel: 'Subscription Cancelled',
};

export const ProfileScreen: React.FC = () => {
  const { colors } = useTheme();
  const { user, signOut } = useAuth();
  const {
    profile,
    canEditDietaryPresets,
    daysRemainingForEdit,
    isFreeEdit,
    isPremiumUser,
  } = useUserProfile();
  const navigation = useNavigation<any>();
  const [cancelLoading, setCancelLoading] = useState(false);

  const subscriptionStatus = profile?.subscriptionStatus ?? 'free';
  const subscriptionStatusLabel =
    SUBSCRIPTION_STATUS_LABELS[subscriptionStatus as keyof typeof SUBSCRIPTION_STATUS_LABELS] ||
    'Free';
  const planLabel = profile?.planId ? PLAN_LABELS[profile.planId] ?? 'Premium Plan' : 'Free Plan';
  const validUntilDate =
    profile?.validUntil && typeof profile.validUntil.toDate === 'function'
      ? profile.validUntil.toDate()
      : null;
  const validUntilText = validUntilDate ? format(validUntilDate, 'MMM d, yyyy') : null;

  const handleEditProfile = () => {
    navigation.navigate('ProfileSetup', { isEditMode: true });
  };

  const handleAddProfile = () => {
    if (!isPremiumUser) {
      // Freemium user - navigate to paywall with context
      // Navigate to Scan tab, then to Paywall screen with context
      navigation.navigate('Scan', { screen: 'Paywall', params: { context: 'addProfile' } });
    } else {
      // Premium user - check if they can add more profiles (max 4)
      // For now, show an alert. Later this can navigate to profile creation
      Alert.alert(
        'Add Profile',
        'Profile creation feature coming soon. Premium users can add up to 4 profiles.',
        [{ text: 'OK' }]
      );
    }
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const requestSubscriptionCancellation = async () => {
    try {
      setCancelLoading(true);
      if (!user) {
        throw new Error('You must be signed in to cancel your subscription.');
      }

      const cancelSubscriptionCallable = httpsCallable<
        void,
        { message?: string }
      >(functions, 'cancelSubscription');
      const result = await cancelSubscriptionCallable();

      const message =
        result?.data?.message ??
        'Your subscription will end at the close of the current billing period.';

      showAlert('Cancellation Requested', message);
    } catch (error: any) {
      console.error('Cancel subscription error:', error);
      const errorMessage =
        (error?.message as string) ??
        (error?.details as string) ??
        'Unable to cancel subscription. Please try again later.';
      showAlert('Error', errorMessage);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCancelSubscription = () => {
    const message = validUntilText
      ? `Your premium access will continue until ${validUntilText}. Do you want to cancel your subscription?`
      : 'Your premium access will remain active until the end of the current billing cycle. Do you want to cancel your subscription?';

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `${message}\n\nSelect OK to cancel at the end of the current billing period.`
      );
      if (confirmed) {
        void requestSubscriptionCancellation();
      }
      return;
    }

    Alert.alert('Cancel Subscription', message, [
      { text: 'Keep Subscription', style: 'cancel' },
      {
        text: 'Cancel at Cycle End',
        style: 'destructive',
        onPress: requestSubscriptionCancellation,
      },
    ]);
  };

  const handleSignOut = async () => {
    console.log('handleSignOut called');
    try {
      console.log('Starting sign out...');
      await signOut();
      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  const appVersion = Constants.expoConfig?.version || '1.0.0';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.container }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Info Card */}
        <Card style={styles.userCard}>
          <View style={styles.userInfo}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: colors.border }]}>
                <User size={32} color={colors.secondaryText} />
              </View>
            )}
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: colors.primaryText }]}>
                {user?.displayName || 'User'}
              </Text>
              <Text style={[styles.userEmail, { color: colors.secondaryText }]}>
                {user?.email}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={handleAddProfile}
              style={[styles.addProfileButton, { backgroundColor: Colors.brand.blue + '20' }]}
            >
              <Plus size={20} color={Colors.brand.blue} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Subscription Card */}
        <Card style={styles.subscriptionCard}>
          <View style={styles.subscriptionHeader}>
            <View style={[styles.subscriptionIcon, { backgroundColor: Colors.brand.blue + '20' }]}>
              <Star size={24} color={Colors.brand.blue} fill={Colors.brand.blue} />
            </View>
            <View style={styles.subscriptionDetails}>
              <Text style={[styles.subscriptionTitle, { color: colors.primaryText }]}>
                Premium Status
              </Text>
              <Text
                style={[
                  styles.subscriptionStatus,
                  { color: isPremiumUser ? Colors.brand.green : colors.secondaryText },
                ]}
              >
                {subscriptionStatusLabel}
              </Text>
            </View>
          </View>
          <View style={styles.subscriptionMeta}>
            <Text style={[styles.subscriptionMetaText, { color: colors.secondaryText }]}>
              Plan: {planLabel}
            </Text>
            {validUntilText && (
              <Text style={[styles.subscriptionMetaText, { color: colors.secondaryText }]}>
                Valid until {validUntilText}
              </Text>
            )}
          </View>

          {subscriptionStatus === 'pending' && (
            <Text style={[styles.subscriptionMessage, { color: colors.secondaryText }]}>
              {`We're processing your payment. Premium features will unlock once Razorpay confirms the subscription.`}
            </Text>
          )}
          {subscriptionStatus === 'failed' && (
            <Text style={[styles.subscriptionMessage, { color: Colors.semantic.nonCompliant }]}>
              Payment failed. Please try again from the paywall or update your payment method.
            </Text>
          )}
          {subscriptionStatus === 'cancelled' && validUntilText && (
            <Text style={[styles.subscriptionMessage, { color: colors.secondaryText }]}>
              Premium access ended on {validUntilText}. Upgrade again to regain full access.
            </Text>
          )}
          {subscriptionStatus === 'pending_cancel' && (
            <Text style={[styles.subscriptionMessage, { color: colors.secondaryText }]}>
              {validUntilText
                ? `Your subscription remains active until ${validUntilText}. Premium access will end afterwards.`
                : 'Your subscription will remain active until the current billing period ends.'}
            </Text>
          )}

          {subscriptionStatus === 'active' && (
            <Button
              title="Cancel Subscription"
              onPress={handleCancelSubscription}
              variant="outline"
              fullWidth
              loading={cancelLoading}
              style={styles.subscriptionAction}
            />
          )}

          {!isPremiumUser && subscriptionStatus !== 'active' && (
            <Button
              title="Upgrade to Premium"
              onPress={() => navigation.navigate('Scan', { screen: 'Paywall', params: { context: 'scanLimit' } })}
              icon={<Star size={18} color={Colors.white} fill={Colors.white} />}
              fullWidth
              style={styles.subscriptionAction}
            />
          )}
        </Card>

        {/* Dietary Profile Card */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Utensils size={24} color={Colors.brand.green} />
              <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
                Dietary Profile
              </Text>
          </View>
          <TouchableOpacity onPress={handleEditProfile}>
            <Edit2 size={20} color={Colors.brand.blue} />
            </TouchableOpacity>
          </View>

          {!canEditDietaryPresets && !isFreeEdit && (
            <View style={[styles.lockNotice, { backgroundColor: Colors.light.warning + '20' }]}>
              <Lock size={16} color={Colors.light.warning} />
              <Text style={[styles.lockText, { color: Colors.light.warning }]}>
                Dietary preferences locked for {daysRemainingForEdit} days
              </Text>
            </View>
          )}

          {isFreeEdit && (
            <View style={[styles.lockNotice, { backgroundColor: Colors.brand.blue + '20' }]}>
              <Info size={16} color={Colors.brand.blue} />
              <Text style={[styles.lockText, { color: Colors.brand.blue }]}>
                You have one free edit available
              </Text>
            </View>
          )}

          {profile?.dietaryPresets && profile.dietaryPresets.length > 0 && (
            <>
              <Text style={[styles.subsectionTitle, { color: colors.secondaryText }]}>
                Dietary Preferences
              </Text>
              <View style={styles.chipsContainer}>
                {profile.dietaryPresets.map((preset) => (
                  <Chip key={preset} label={preset} selected variant="filter" />
                ))}
              </View>
            </>
          )}

          {profile?.customRestrictions && profile.customRestrictions.length > 0 && (
            <>
              <Text style={[styles.subsectionTitle, { color: colors.secondaryText }]}>
                Restrictions
              </Text>
              <View style={styles.chipsContainer}>
                {profile.customRestrictions.map((restriction) => (
                  <Chip key={restriction} label={restriction} selected variant="input" />
                ))}
              </View>
            </>
          )}

          {(!profile?.dietaryPresets?.length && !profile?.customRestrictions?.length) && (
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              No dietary preferences set. Tap edit to add your preferences.
            </Text>
          )}
        </Card>

        {/* Settings Section */}
        <Card style={styles.section}>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <HelpCircle size={24} color={colors.secondaryText} />
              <Text style={[styles.settingText, { color: colors.primaryText }]}>
                Help & Support
              </Text>
            </View>
            <ChevronRight size={20} color={colors.secondaryText} />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Lock size={24} color={colors.secondaryText} />
              <Text style={[styles.settingText, { color: colors.primaryText }]}>
                Privacy Policy
              </Text>
            </View>
            <ChevronRight size={20} color={colors.secondaryText} />
          </TouchableOpacity>
        </Card>

        {/* Sign Out Button */}
        <Button
          title="Sign Out"
          variant="outline"
          onPress={() => {
            console.log('Sign out button pressed');
            handleSignOut();
          }}
          fullWidth
          style={styles.signOutButton}
        />

        {/* App Version */}
        <Text style={[styles.version, { color: colors.secondaryText }]}>
          v{appVersion}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  userCard: {
    marginBottom: Spacing.lg,
  },
  subscriptionCard: {
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  subscriptionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  subscriptionDetails: {
    flex: 1,
  },
  subscriptionTitle: {
    ...Typography.bodyMedium,
    fontWeight: '600' as '600',
    marginBottom: Spacing.xs,
  },
  subscriptionStatus: {
    ...Typography.h5,
  },
  subscriptionMeta: {
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  subscriptionMetaText: {
    ...Typography.caption,
  },
  subscriptionMessage: {
    ...Typography.bodySmall,
    marginBottom: Spacing.md,
  },
  subscriptionAction: {
    marginTop: Spacing.sm,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  addProfileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.md,
  },
  userName: {
    ...Typography.h5,
    marginBottom: Spacing.xs,
  },
  userEmail: {
    ...Typography.bodySmall,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    ...Typography.h5,
    marginLeft: Spacing.sm,
  },
  lockNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  lockText: {
    ...Typography.caption,
    marginLeft: Spacing.xs,
    fontWeight: '600' as '600',
  },
  subsectionTitle: {
    ...Typography.bodySmall,
    marginBottom: Spacing.sm,
    fontWeight: '600' as '600',
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.sm,
  },
  emptyText: {
    ...Typography.body,
    fontStyle: 'italic',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    ...Typography.body,
    marginLeft: Spacing.md,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.light.border,
    marginVertical: Spacing.xs,
  },
  signOutButton: {
    marginTop: Spacing.lg,
  },
  version: {
    ...Typography.caption,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
});