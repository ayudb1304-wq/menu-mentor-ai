import { useEffect, useMemo, useState } from 'react';
import userService, { DietaryProfile, UserProfile } from '../services/userService';
import { useAuth } from './useAuth';

interface UseUserProfileReturn {
  profile: UserProfile | null;
  profiles: DietaryProfile[];
  currentProfile: DietaryProfile | null;
  loading: boolean;
  error: Error | null;
  canEditDietaryPresets: boolean;
  daysRemainingForEdit: number;
  isFreeEdit: boolean;
  canScan: boolean;
  remainingScans: number;
  isPremiumUser: boolean;
  selectProfile: (profileId: string) => Promise<void>;
  createProfile: (input: { name: string; dietaryPresets: string[]; customRestrictions: string[] }) => Promise<void>;
  deleteProfile: (profileId: string) => Promise<void>;
  renameProfile: (profileId: string, name: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  updateDietaryPreferences: (
    dietaryPresets: string[],
    customRestrictions: string[],
    profileId?: string
  ) => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshProfiles: () => Promise<void>;
}

export const useUserProfile = (): UseUserProfileReturn => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profiles, setProfiles] = useState<DietaryProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [profilesLoading, setProfilesLoading] = useState(true);

  const currentProfile = useMemo(() => {
    if (!profiles.length) return null;
    if (profile?.currentProfileId) {
      const match = profiles.find((p) => p.id === profile.currentProfileId);
      if (match) return match;
    }
    const primary = profiles.find((p) => p.isPrimary);
    return primary || profiles[0];
  }, [profiles, profile?.currentProfileId]);

  // Calculate edit permissions
  const { canEdit, daysRemaining, isFreeEdit } = userService.canEditDietaryPresets(currentProfile);

  // Calculate scan permissions
  const canScan = userService.canScan(profile);
  const remainingScans = userService.getRemainingScans(profile);
  const isPremiumUser =
    profile?.subscriptionStatus === 'active' &&
    !!profile?.validUntil &&
    profile.validUntil.toDate().getTime() > Date.now();

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      setProfiles([]);
      setProfilesLoading(false);
      return;
    }

    setLoading(true);
    setProfilesLoading(true);

    // Subscribe to profile changes
    const unsubscribe = userService.subscribeToProfile(user.uid, (profileData) => {
      setProfile(profileData);
      setLoading(false);

      // Create profile if it doesn't exist
      if (!profileData) {
        userService.createOrUpdateProfile(user).then(setProfile).catch(setError);
      }
    });

    const unsubscribeProfiles = userService.subscribeToProfiles(user.uid, (profileList) => {
      setProfiles(profileList);
      setProfilesLoading(false);
    });

    return () => {
      unsubscribe();
      unsubscribeProfiles();
    };
  }, [user]);

  const updateDietaryPreferences = async (
    dietaryPresets: string[],
    customRestrictions: string[],
    targetProfileId?: string
  ): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    const targetProfile = targetProfileId
      ? profiles.find((p) => p.id === targetProfileId)
      : currentProfile;

    if (!targetProfile) {
      throw new Error('No active profile selected');
    }

    try {
      setProfilesLoading(true);
      setError(null);
      await userService.updateDietaryPreferences(
        user.uid,
        targetProfile.id,
        dietaryPresets,
        customRestrictions
      );
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setProfilesLoading(false);
    }
  };

  const refreshProfile = async (): Promise<void> => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const profileData = await userService.getUserProfile(user.uid);
      setProfile(profileData);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfiles = async (): Promise<void> => {
    if (!user) return;
    try {
      setProfilesLoading(true);
      const list = await userService.getDietaryProfiles(user.uid);
      setProfiles(list);
    } catch (err: any) {
      setError(err);
    } finally {
      setProfilesLoading(false);
    }
  };

  const selectProfile = async (profileId: string): Promise<void> => {
    if (!user) return;
    try {
      await userService.setCurrentProfile(user.uid, profileId);
    } catch (err: any) {
      setError(err);
      throw err;
    }
  };

  const createProfile = async (input: { name: string; dietaryPresets: string[]; customRestrictions: string[] }) => {
    if (!user || !profile) throw new Error('User not authenticated');
    await userService.createDietaryProfile(user.uid, input, profile);
  };

  const deleteProfile = async (profileId: string) => {
    await userService.deleteDietaryProfile(profileId);
  };

  const renameProfile = async (profileId: string, name: string) => {
    if (!user) throw new Error('User not authenticated');
    await userService.renameDietaryProfile(user.uid, profileId, name);
  };

  const deleteAccount = async () => {
    await userService.deleteAccountData();
  };

  return {
    profile,
    profiles,
    currentProfile,
    loading: loading || profilesLoading,
    error,
    canEditDietaryPresets: canEdit,
    daysRemainingForEdit: daysRemaining,
    isFreeEdit,
    canScan,
    remainingScans,
    isPremiumUser,
    selectProfile,
    createProfile,
    deleteProfile,
    renameProfile,
    deleteAccount,
    updateDietaryPreferences,
    refreshProfile,
    refreshProfiles: refreshProfiles,
  };
};