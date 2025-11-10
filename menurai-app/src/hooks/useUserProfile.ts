import { useEffect, useState } from 'react';
import userService, { UserProfile } from '../services/userService';
import { useAuth } from './useAuth';

interface UseUserProfileReturn {
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  canEditDietaryPresets: boolean;
  daysRemainingForEdit: number;
  isFreeEdit: boolean;
  canScan: boolean;
  remainingScans: number;
  updateDietaryPreferences: (
    dietaryPresets: string[],
    customRestrictions: string[]
  ) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export const useUserProfile = (): UseUserProfileReturn => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Calculate edit permissions
  const { canEdit, daysRemaining, isFreeEdit } = userService.canEditDietaryPresets(profile);
  
  // Calculate scan permissions
  const canScan = userService.canScan(profile);
  const remainingScans = userService.getRemainingScans(profile);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to profile changes
    const unsubscribe = userService.subscribeToProfile(user.uid, (profileData) => {
      setProfile(profileData);
      setLoading(false);

      // Create profile if it doesn't exist
      if (!profileData) {
        userService.createOrUpdateProfile(user).then(setProfile).catch(setError);
      }
    });

    return unsubscribe;
  }, [user]);

  const updateDietaryPreferences = async (
    dietaryPresets: string[],
    customRestrictions: string[]
  ): Promise<void> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);
      await userService.updateDietaryPreferences(
        user.uid,
        dietaryPresets,
        customRestrictions
      );
    } catch (err: any) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
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

  return {
    profile,
    loading,
    error,
    canEditDietaryPresets: canEdit,
    daysRemainingForEdit: daysRemaining,
    isFreeEdit,
    canScan,
    remainingScans,
    updateDietaryPreferences,
    refreshProfile,
  };
};