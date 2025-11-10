import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { User, Edit2, UtensilsCrossed, Lock, Info, Star, Bell, HelpCircle, Shield, ChevronRight } from '../components/icons';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { Typography, Spacing, BorderRadius, Shadows } from '../theme/styles';
import { Button, Card, Chip, DottedBorder } from '../components';
import { useAuth } from '../hooks/useAuth';
import { useUserProfile } from '../hooks/useUserProfile';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';

export const ProfileScreen: React.FC = () => {
  const { colors, isDarkMode } = useTheme();
  const { user, signOut } = useAuth();
  const { profile, canEditDietaryPresets, daysRemainingForEdit, isFreeEdit } = useUserProfile();
  const navigation = useNavigation<any>();

  const handleEditProfile = () => {
    navigation.navigate('ProfileSetup', { isEditMode: true });
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.primaryText }]}>Profile</Text>
        </View>

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
          </View>
        </Card>

        {/* Dietary Profile Card */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <UtensilsCrossed size={24} color={Colors.brand.green} />
              <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
                Dietary Profile
              </Text>
            </View>
            <TouchableOpacity onPress={handleEditProfile}>
              <Edit2 size={20} color={Colors.brand.blue} />
            </TouchableOpacity>
          </View>

          {!canEditDietaryPresets && !isFreeEdit && (
            <View style={[styles.lockNotice, { backgroundColor: Colors.semantic.warning + '20' }]}>
              <Lock size={16} color={Colors.semantic.warning} />
              <Text style={[styles.lockText, { color: Colors.semantic.warning }]}>
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

        {/* Premium Feature Placeholder */}
        <DottedBorder style={styles.section} borderColor={Colors.brand.blue}>
          <View style={styles.premiumCard}>
            <Star size={24} color={Colors.brand.blue} />
            <Text style={[styles.premiumTitle, { color: colors.primaryText }]}>
              Multiple Profiles
            </Text>
            <Text style={[styles.premiumText, { color: colors.secondaryText }]}>
              Create profiles for family members and switch between them easily
            </Text>
            <Text style={[styles.comingSoon, { color: Colors.brand.blue }]}>
              Coming Soon
            </Text>
          </View>
        </DottedBorder>

        {/* Settings Section */}
        <Card style={styles.section}>
          <TouchableOpacity style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Bell size={24} color={colors.secondaryText} />
              <Text style={[styles.settingText, { color: colors.primaryText }]}>
                Notifications
              </Text>
            </View>
            <ChevronRight size={20} color={colors.secondaryText} />
          </TouchableOpacity>

          <View style={styles.separator} />

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
              <Shield size={24} color={colors.secondaryText} />
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
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h2,
  },
  userCard: {
    marginBottom: Spacing.lg,
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
  premiumCard: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  premiumTitle: {
    ...Typography.h5,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  premiumText: {
    ...Typography.bodySmall,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  comingSoon: {
    ...Typography.buttonSmall,
    fontWeight: '700' as '700',
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