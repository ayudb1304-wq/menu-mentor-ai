import { useCallback, useEffect, useRef, useState } from 'react';
import userService, { UserProfile, UserData } from '../services/userService';
import { useAuth } from './useAuth';

interface UpdateDietaryOptions {
  profileId?: string;
  name?: string;
}

interface UseUserProfileReturn {
  userData: UserData | null;
  activeProfile: UserProfile | null;
  allProfiles: UserProfile[];
  loading: boolean;
  error: Error | null;
  canEditDietaryPresets: boolean;
  daysRemainingForEdit: number;
  isFreeEdit: boolean;
  canScan: boolean;
  remainingScans: number;
  isPremiumUser: boolean;
  updateDietaryPreferences: (
    dietaryPresets: string[],
    customRestrictions: string[],
    options?: UpdateDietaryOptions
  ) => Promise<void>;
  refreshProfile: () => Promise<void>;
  setActiveProfile: (profileId: string) => Promise<void>;
}

export const useUserProfile = (): UseUserProfileReturn => {
  const { user } = useAuth();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [activeProfileState, setActiveProfileState] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const userDataRef = useRef<UserData | null>(null);

  useEffect(() => {
    if (!user) {
      setUserData(null);
      userDataRef.current = null;
      setAllProfiles([]);
      setActiveProfileState(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const loadState = { user: false, profiles: false };

    const unsubscribeUser = userService.subscribeToProfile(user.uid, (data) => {
      setUserData(data);
      userDataRef.current = data;

      if (!data) {
        userService
          .createOrUpdateProfile(user)
          .then(setUserData)
          .catch((err) => {
            console.error('Error creating user data:', err);
            setError(err as Error);
          });
      }

      loadState.user = true;
      if (loadState.user && loadState.profiles) {
        setLoading(false);
      }
    });

    const unsubscribeProfiles = userService.subscribeToAllProfiles(user.uid, (profiles) => {
      setAllProfiles(profiles);
      loadState.profiles = true;
      if (loadState.user && loadState.profiles) {
        setLoading(false);
      }
    });

    return () => {
      unsubscribeUser?.();
      unsubscribeProfiles?.();
    };
  }, [user]);

  useEffect(() => {
    if (!userData) {
      if (activeProfileState !== null) {
        setActiveProfileState(null);
      }
      return;
    }

    if (userData.activeProfileId) {
      const nextActive = allProfiles.find((profile) => profile.id === userData.activeProfileId) || null;
      if (
        (nextActive && activeProfileState && nextActive.id === activeProfileState.id) ||
        (!nextActive && !activeProfileState)
      ) {
        return;
      }
      setActiveProfileState(nextActive);
    } else if (allProfiles.length > 0 && user) {
      const defaultProfile = allProfiles[0];
      if (!activeProfileState || activeProfileState.id !== defaultProfile.id) {
        setActiveProfileState(defaultProfile);
      }
      userService
        .setActiveProfile(user.uid, defaultProfile.id)
        .catch((err) => console.error('Error setting default active profile:', err));
    } else if (activeProfileState !== null) {
      setActiveProfileState(null);
    }
  }, [userData, allProfiles, user, activeProfileState]);

  const setActiveProfile = useCallback(
    async (profileId: string) => {
      if (!user) {
        throw new Error('User not authenticated');
      }
      await userService.setActiveProfile(user.uid, profileId);
    },
    [user]
  );

  const updateDietaryPreferences = useCallback(
    async (
      dietaryPresets: string[],
      customRestrictions: string[],
      options?: UpdateDietaryOptions
    ): Promise<void> => {
      if (!user) {
        throw new Error('User not authenticated');
      }

      const targetProfileId =
        options?.profileId ?? userDataRef.current?.activeProfileId ?? activeProfileState?.id;

      if (!targetProfileId) {
        throw new Error('No active profile selected');
      }

      try {
        setLoading(true);
        setError(null);
        await userService.updateProfilePreferences(
          user.uid,
          targetProfileId,
          dietaryPresets,
          customRestrictions,
          { name: options?.name }
        );
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [user, activeProfileState]
  );

  const refreshProfile = useCallback(async (): Promise<void> => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const freshUserData = await userService.getUserData(user.uid);
      setUserData(freshUserData);
      userDataRef.current = freshUserData;

      if (freshUserData?.activeProfileId) {
        const active = await userService.getProfileById(user.uid, freshUserData.activeProfileId);
        setActiveProfileState(active);
      } else {
        setActiveProfileState(null);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const { canEdit, daysRemaining, isFreeEdit } = userService.canEditDietaryPresets(
    activeProfileState
  );
  const canScan = userService.canScan(userData);
  const remainingScans = userService.getRemainingScans(userData);
  const isPremiumUser = userData?.isPremium ?? false;

  return {
    userData,
    activeProfile: activeProfileState,
    allProfiles,
    loading,
    error,
    canEditDietaryPresets: canEdit,
    daysRemainingForEdit: daysRemaining,
    isFreeEdit,
    canScan,
    remainingScans,
    isPremiumUser,
    updateDietaryPreferences,
    refreshProfile,
    setActiveProfile,
  };
};
