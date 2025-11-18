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
  Modal,
} from 'react-native';
import {
  Utensils,
  Edit2,
  Lock,
  Info,
  HelpCircle,
  ChevronRight,
  User,
  Plus,
  Star,
  AlertCircle,
  CheckCircle,
  Trash2,
  X,
} from '../components/icons';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { Typography, Spacing, BorderRadius } from '../theme/styles';
import { Button, Card, Chip, GlassModal, GlassCard } from '../components';
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
    profile: accountProfile,
    profiles,
    currentProfile,
    canEditDietaryPresets,
    daysRemainingForEdit,
    isFreeEdit,
    isPremiumUser,
    selectProfile,
    deleteAccount,
    deleteProfile,
  } = useUserProfile();
  const navigation = useNavigation<any>();
  const [cancelLoading, setCancelLoading] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteProfileModalVisible, setDeleteProfileModalVisible] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<typeof profiles[0] | null>(null);
  const [deletingProfile, setDeletingProfile] = useState(false);

  const subscriptionStatus = accountProfile?.subscriptionStatus ?? 'free';
  const subscriptionStatusLabel =
    SUBSCRIPTION_STATUS_LABELS[subscriptionStatus as keyof typeof SUBSCRIPTION_STATUS_LABELS] ||
    'Free';
  const planLabel = accountProfile?.planId ? PLAN_LABELS[accountProfile.planId] ?? 'Premium Plan' : 'Free Plan';
  const validUntilDate =
    accountProfile?.validUntil && typeof accountProfile.validUntil.toDate === 'function'
      ? accountProfile.validUntil.toDate()
      : null;
  const validUntilText = validUntilDate ? format(validUntilDate, 'MMM d, yyyy') : null;

  const handleEditProfile = (profileId?: string) => {
    navigation.navigate('ProfileSetup', { isEditMode: true, profileId });
  };

  const handleAddProfile = () => {
    if (!isPremiumUser) {
      // Freemium user - navigate to paywall with context
      // Navigate to Scan tab, then to Paywall screen with context
      navigation.navigate('Scan', { screen: 'Paywall', params: { context: 'addProfile' } });
    } else {
      // Premium user - check if they can add more profiles (max 4)
      // For now, show an alert. Later this can navigate to profile creation
      if (profiles.length >= 4) {
        Alert.alert('Limit Reached', 'You have reached the maximum number of profiles.');
        return;
      }
      navigation.navigate('ProfileSetup', { isEditMode: true, mode: 'create' });
    }
  };

  const handleSetActiveProfile = async (profileId: string) => {
    try {
      await selectProfile(profileId);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to switch profile.');
    }
  };

  const handleDeleteProfile = (profile: typeof profiles[0]) => {
    if (profile.isPrimary) {
      Alert.alert('Cannot Delete', 'The primary profile cannot be deleted.');
      return;
    }

    setProfileToDelete(profile);
    setDeleteProfileModalVisible(true);
  };

  const confirmDeleteProfile = async () => {
    if (!profileToDelete) return;

    try {
      setDeletingProfile(true);
      await deleteProfile(profileToDelete.id);
      setDeleteProfileModalVisible(false);
      setProfileToDelete(null);
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to delete profile.');
    } finally {
      setDeletingProfile(false);
    }
  };

  const cancelDeleteProfile = () => {
    setDeleteProfileModalVisible(false);
    setProfileToDelete(null);
  };

  const handleDeleteAccountData = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account, all profiles, and history across all devices. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingAccount(true);
              await deleteAccount();
              await signOut();
            } catch (error: any) {
              Alert.alert('Error', error?.message || 'Failed to delete account.');
            } finally {
              setDeletingAccount(false);
            }
          },
        },
      ]
    );
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
              style={[styles.addProfileButton, { backgroundColor: Colors.brand.primary + '20' }]}
            >
              <Plus size={20} color={Colors.brand.primary} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Subscription Card */}
        <Card style={styles.subscriptionCard}>
          <View style={styles.subscriptionHeader}>
            <View style={[styles.subscriptionIcon, { backgroundColor: Colors.brand.primary + '20' }]}>
              <Star size={24} color={Colors.brand.primary} fill={Colors.brand.primary} />
            </View>
            <View style={styles.subscriptionDetails}>
              <Text style={[styles.subscriptionTitle, { color: colors.primaryText }]}>
                Premium Status
              </Text>
              <Text
                style={[
                  styles.subscriptionStatus,
                  { color: isPremiumUser ? Colors.semantic.compliant : colors.secondaryText },
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

        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <User size={24} color={Colors.brand.primary} />
              <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
                Profiles
              </Text>
            </View>
            <TouchableOpacity onPress={handleAddProfile}>
              <Plus size={20} color={Colors.brand.primary} />
            </TouchableOpacity>
          </View>
          {profiles.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              Create profiles to scan for family members.
            </Text>
          ) : (
            profiles.map((p) => (
              <View key={p.id} style={[styles.profileCard, { borderColor: colors.border }]}>
                <View style={styles.profileInfo}>
                  <Text style={[styles.profileName, { color: colors.primaryText }]}>{p.name}</Text>
                  <Text style={[styles.profileMeta, { color: colors.secondaryText }]}>
                    {p.dietaryPresets.length > 0
                      ? `${p.dietaryPresets.length} presets`
                      : 'No presets'}
                  </Text>
                  <View style={styles.profileBadges}>
                    {p.isPrimary && (
                      <Text style={[styles.profileBadge, { color: Colors.brand.primary }]}>Primary</Text>
                    )}
                    {currentProfile?.id === p.id && (
                      <Text style={[styles.profileBadge, { color: Colors.brand.primary }]}>Active</Text>
                    )}
                  </View>
                </View>
                <View style={styles.profileActions}>
                  <TouchableOpacity
                    style={styles.profileActionButton}
                    onPress={() => handleEditProfile(p.id)}
                    accessibilityLabel={`Edit ${p.name}`}
                  >
                    <Edit2 size={16} color={colors.secondaryText} />
                  </TouchableOpacity>
                  {currentProfile?.id !== p.id && (
                    <TouchableOpacity
                      style={styles.profileActionButton}
                      onPress={() => handleSetActiveProfile(p.id)}
                      accessibilityLabel={`Set ${p.name} as active`}
                    >
                      <CheckCircle size={16} color={Colors.semantic.compliant} />
                    </TouchableOpacity>
                  )}
                  {!p.isPrimary && (
                    <TouchableOpacity
                      style={styles.profileActionButton}
                      onPress={() => handleDeleteProfile(p)}
                      accessibilityLabel={`Delete ${p.name}`}
                    >
                      <Trash2 size={16} color={Colors.semantic.nonCompliant} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
          {profiles.length >= 4 && (
            <Text style={[styles.limitNote, { color: colors.secondaryText }]}>
              Maximum of 4 profiles added.
            </Text>
          )}
        </Card>

        {/* Dietary Profile Card */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleRow}>
            <Utensils size={24} color={Colors.semantic.compliant} />
              <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
                Dietary Profile
              </Text>
          </View>
          <TouchableOpacity onPress={() => handleEditProfile(currentProfile?.id)}>
            <Edit2 size={20} color={Colors.brand.primary} />
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
            <View style={[styles.lockNotice, { backgroundColor: Colors.brand.primary + '20' }]}>
              <Info size={16} color={Colors.brand.primary} />
              <Text style={[styles.lockText, { color: Colors.brand.primary }]}>
                You have one free edit available
              </Text>
            </View>
          )}

          {currentProfile?.dietaryPresets && currentProfile.dietaryPresets.length > 0 && (
            <>
              <Text style={[styles.subsectionTitle, { color: colors.secondaryText }]}>
                Dietary Preferences
              </Text>
              <View style={styles.chipsContainer}>
                {currentProfile.dietaryPresets.map((preset) => (
                  <Chip key={preset} label={preset} selected variant="filter" />
                ))}
              </View>
            </>
          )}

          {currentProfile?.customRestrictions && currentProfile.customRestrictions.length > 0 && (
            <>
              <Text style={[styles.subsectionTitle, { color: colors.secondaryText }]}>
                Restrictions
              </Text>
              <View style={styles.chipsContainer}>
                {currentProfile.customRestrictions.map((restriction) => (
                  <Chip key={restriction} label={restriction} selected variant="input" />
                ))}
              </View>
            </>
          )}

          {(!currentProfile?.dietaryPresets?.length && !currentProfile?.customRestrictions?.length) && (
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              No dietary preferences set. Tap edit to add your preferences.
            </Text>
          )}
        </Card>

        {/* Settings Section */}
        <Card style={styles.section}>
          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate('ContactSupport')}
          >
            <View style={styles.settingLeft}>
              <HelpCircle size={24} color={colors.secondaryText} />
              <Text style={[styles.settingText, { color: colors.primaryText }]}>
                Contact Support
              </Text>
            </View>
            <ChevronRight size={20} color={colors.secondaryText} />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate('Terms')}
          >
            <View style={styles.settingLeft}>
              <Info size={24} color={colors.secondaryText} />
              <Text style={[styles.settingText, { color: colors.primaryText }]}>
                Terms & Conditions
              </Text>
            </View>
            <ChevronRight size={20} color={colors.secondaryText} />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <View style={styles.settingLeft}>
              <Lock size={24} color={colors.secondaryText} />
              <Text style={[styles.settingText, { color: colors.primaryText }]}>
                Privacy Policy
              </Text>
            </View>
            <ChevronRight size={20} color={colors.secondaryText} />
          </TouchableOpacity>

          <View style={styles.separator} />

          <TouchableOpacity
            style={styles.settingRow}
            onPress={() => navigation.navigate('CancellationPolicy')}
          >
            <View style={styles.settingLeft}>
              <AlertCircle size={24} color={colors.secondaryText} />
              <Text style={[styles.settingText, { color: colors.primaryText }]}>
                Cancellation & Refund
              </Text>
            </View>
            <ChevronRight size={20} color={colors.secondaryText} />
          </TouchableOpacity>
        </Card>

        <Button
          title="Delete Account & Data"
          variant="ghost"
          onPress={handleDeleteAccountData}
          fullWidth
          style={styles.deleteAccountButton}
          loading={deletingAccount}
        />

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

      {/* Delete Profile Confirmation Modal */}
      <Modal
        animationType="fade"
        transparent
        visible={deleteProfileModalVisible}
        onRequestClose={cancelDeleteProfile}
      >
        <GlassModal visible={deleteProfileModalVisible}>
          <GlassCard style={styles.deleteModalContent} intensity={90}>
            <View style={styles.deleteModalHeader}>
              <View style={styles.modalHeaderSpacer} />
              <Text style={[styles.deleteModalTitle, { color: colors.primaryText }]}>
                Delete Profile
              </Text>
              <TouchableOpacity
                style={styles.modalHeaderSpacer}
                onPress={cancelDeleteProfile}
              >
                <X size={24} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>
            <View style={styles.deleteModalBody}>
              <AlertCircle size={48} color={Colors.semantic.nonCompliant} />
              <Text style={[styles.deleteModalMessage, { color: colors.primaryText }]}>
                Are you sure you want to delete "{profileToDelete?.name}"?
              </Text>
              <Text style={[styles.deleteModalWarning, { color: colors.secondaryText }]}>
                This will permanently remove the profile and all associated scan history. This action cannot be undone.
              </Text>
            </View>
            <View style={styles.deleteModalActions}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={cancelDeleteProfile}
                fullWidth
                style={styles.deleteModalCancelButton}
              />
              <Button
                title="Delete"
                variant="primary"
                onPress={confirmDeleteProfile}
                fullWidth
                loading={deletingProfile}
                style={[styles.deleteModalDeleteButton, { backgroundColor: Colors.semantic.nonCompliant }]}
              />
            </View>
          </GlassCard>
        </GlassModal>
      </Modal>
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
  limitNote: {
    ...Typography.caption,
    marginTop: Spacing.sm,
  },
  profileCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...Typography.bodyMedium,
    fontWeight: '600' as '600',
  },
  profileMeta: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },
  profileBadges: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
  },
  profileBadge: {
    ...Typography.caption,
    marginRight: Spacing.sm,
    fontWeight: '600' as '600',
  },
  profileActions: {
    flexDirection: 'row',
    marginLeft: Spacing.sm,
  },
  profileActionButton: {
    padding: Spacing.sm,
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
  deleteAccountButton: {
    marginTop: Spacing.sm,
  },
  version: {
    ...Typography.caption,
    textAlign: 'center',
    marginTop: Spacing.lg,
  },
  deleteModalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  deleteModalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalHeaderSpacer: {
    width: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteModalTitle: {
    ...Typography.h4,
    textAlign: 'center',
    flex: 1,
  },
  deleteModalBody: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  deleteModalMessage: {
    ...Typography.h5,
    textAlign: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  deleteModalWarning: {
    ...Typography.bodySmall,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  deleteModalActions: {
    gap: Spacing.sm,
  },
  deleteModalCancelButton: {
    marginBottom: 0,
  },
  deleteModalDeleteButton: {
    marginTop: 0,
  },
});