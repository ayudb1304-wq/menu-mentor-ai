import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { User } from 'firebase/auth';
import { db, functions } from '../config/firebase';

export type SubscriptionStatus =
  | 'free'
  | 'pending'
  | 'active'
  | 'failed'
  | 'cancelled'
  | 'pending_cancel';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  profileComplete: boolean;
  isPremium: boolean;
  scanCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  subscriptionId: string | null;
  subscriptionStatus: SubscriptionStatus;
  planId: string | null;
  validUntil: Timestamp | null;
  primaryProfileId?: string | null;
  currentProfileId?: string | null;
}

export interface DietaryProfile {
  id: string;
  name: string;
  avatarColor?: string | null;
  emoji?: string | null;
  dietaryPresets: string[];
  customRestrictions: string[];
  profileComplete: boolean;
  hasUsedFreeEdit: boolean;
  lastDietUpdate: Timestamp | null;
  isPrimary: boolean;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export interface ProfileInput {
  name: string;
  dietaryPresets: string[];
  customRestrictions: string[];
  avatarColor?: string | null;
  emoji?: string | null;
}

export const DIETARY_PRESETS = [
  'Vegan',
  'Vegetarian',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Keto',
  'Paleo',
] as const;

const PROFILE_COLLECTION = 'profiles';
const MAX_PROFILES = 4; // 1 primary + 3 additional

class UserService {
  private isValidSubscriptionStatus(status: any): status is SubscriptionStatus {
    return ['free', 'pending', 'active', 'failed', 'cancelled', 'pending_cancel'].includes(status);
  }

  private computeIsPremium(status: SubscriptionStatus, validUntil: Timestamp | null): boolean {
    if (status !== 'active' || !validUntil) {
      return false;
    }
    return validUntil.toDate().getTime() > Date.now();
  }

  private normalizeProfileData(data: any): UserProfile {
    const rawStatus = data?.subscriptionStatus;
    const subscriptionStatus: SubscriptionStatus = this.isValidSubscriptionStatus(rawStatus)
      ? rawStatus
      : 'free';

    const rawValidUntil = data?.validUntil;
    const validUntil =
      rawValidUntil && typeof rawValidUntil.toDate === 'function'
        ? (rawValidUntil as Timestamp)
        : null;

    const normalized: UserProfile = {
      ...data,
      subscriptionId: data?.subscriptionId ?? null,
      planId: data?.planId ?? null,
      subscriptionStatus,
      validUntil,
      isPremium: this.computeIsPremium(subscriptionStatus, validUntil),
      primaryProfileId: data?.primaryProfileId ?? null,
      currentProfileId: data?.currentProfileId ?? null,
    };

    return normalized;
  }

  private isPremiumUser(profile: UserProfile | null): boolean {
    if (!profile) return false;
    return this.computeIsPremium(profile.subscriptionStatus, profile.validUntil);
  }

  private profilesRef(uid: string) {
    return collection(doc(db, 'users', uid), PROFILE_COLLECTION);
  }

  private normalizeDietaryProfile(id: string, data: any): DietaryProfile {
    return {
      id,
      name: data?.name || 'Profile',
      avatarColor: data?.avatarColor ?? null,
      emoji: data?.emoji ?? null,
      dietaryPresets: Array.isArray(data?.dietaryPresets) ? data.dietaryPresets : [],
      customRestrictions: Array.isArray(data?.customRestrictions) ? data.customRestrictions : [],
      profileComplete: !!data?.profileComplete,
      hasUsedFreeEdit: !!data?.hasUsedFreeEdit,
      lastDietUpdate: data?.lastDietUpdate ?? null,
      isPrimary: !!data?.isPrimary,
      createdAt: data?.createdAt ?? null,
      updatedAt: data?.updatedAt ?? null,
    };
  }

  private async ensurePrimaryProfile(uid: string, account: UserProfile | null): Promise<DietaryProfile | null> {
    const primaryQuery = query(this.profilesRef(uid), orderBy('createdAt', 'asc'), limit(1));
    const snapshot = await getDocs(primaryQuery);

    if (!snapshot.empty) {
      const docSnap = snapshot.docs[0];
      return this.normalizeDietaryProfile(docSnap.id, docSnap.data());
    }

    if (!account) {
      return null;
    }

    const profileRef = doc(this.profilesRef(uid));
    const now = serverTimestamp();

    await setDoc(profileRef, {
      name: account.displayName || 'Primary Profile',
      avatarColor: null,
      emoji: null,
      dietaryPresets: [],
      customRestrictions: [],
      profileComplete: !!account.profileComplete,
      hasUsedFreeEdit: false,
      lastDietUpdate: null,
      isPrimary: true,
      createdAt: now,
      updatedAt: now,
    });

    await updateDoc(doc(db, 'users', uid), {
      primaryProfileId: profileRef.id,
      currentProfileId: profileRef.id,
      updatedAt: now,
    });

    return this.normalizeDietaryProfile(profileRef.id, {
      name: account.displayName || 'Primary Profile',
      dietaryPresets: [],
      customRestrictions: [],
      profileComplete: !!account.profileComplete,
      hasUsedFreeEdit: false,
      lastDietUpdate: null,
      isPrimary: true,
    });
  }

  private enforceProfileLimit(isPremium: boolean, profileCount: number) {
    if (!isPremium && profileCount >= 1) {
      throw new Error('Additional profiles are available to premium members.');
    }

    if (profileCount >= MAX_PROFILES) {
      throw new Error('You have reached the maximum number of profiles.');
    }
  }

  /**
   * Get user profile from Firestore
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return this.normalizeProfileData(userDoc.data());
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  /**
   * Create or update user profile
   */
  async createOrUpdateProfile(user: User): Promise<UserProfile> {
    try {
      const userRef = doc(db, 'users', user.uid);
      const existingProfile = await this.getUserProfile(user.uid);

      if (existingProfile) {
        // Update existing profile
        const updates = {
          email: user.email || existingProfile.email,
          displayName: user.displayName || existingProfile.displayName,
          photoURL: user.photoURL || existingProfile.photoURL,
          updatedAt: serverTimestamp(),
        };
        await updateDoc(userRef, updates);
        const refreshedProfile = await this.getUserProfile(user.uid);
        if (!refreshedProfile) {
          throw new Error('Failed to refresh user profile after update');
        }
        return refreshedProfile;
      } else {
        // Create new profile
        const newProfile: Partial<UserProfile> = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL,
          profileComplete: false,
          isPremium: false, // Default to free tier
          scanCount: 0, // New users start with 0 scans
          createdAt: serverTimestamp() as Timestamp,
          updatedAt: serverTimestamp() as Timestamp,
          subscriptionId: null,
          subscriptionStatus: 'free',
          planId: null,
          validUntil: null,
        };
        await setDoc(userRef, newProfile);
        await this.ensurePrimaryProfile(user.uid, newProfile as UserProfile);
        const createdProfile = await this.getUserProfile(user.uid);
        if (!createdProfile) {
          throw new Error('Failed to load user profile after creation');
        }
        return createdProfile;
      }
    } catch (error) {
      console.error('Error creating/updating user profile:', error);
      throw error;
    }
  }

  /**
   * Update dietary preferences
   */
  async updateDietaryPreferences(
    uid: string,
    profileId: string,
    dietaryPresets: string[],
    customRestrictions: string[]
  ): Promise<void> {
    try {
      const profileRef = doc(this.profilesRef(uid), profileId);
      const snapshot = await getDoc(profileRef);

      if (!snapshot.exists()) {
        throw new Error('Profile not found');
      }

      const currentProfile = this.normalizeDietaryProfile(profileId, snapshot.data());
      const presetsChanged =
        JSON.stringify(currentProfile.dietaryPresets?.sort()) !== JSON.stringify(dietaryPresets.sort());

      const updates: Record<string, any> = {
        dietaryPresets,
        customRestrictions,
        profileComplete: true,
        updatedAt: serverTimestamp(),
      };

      if (currentProfile.profileComplete) {
        if (!currentProfile.hasUsedFreeEdit) {
          updates.hasUsedFreeEdit = true;
        } else if (presetsChanged) {
          updates.lastDietUpdate = serverTimestamp();
        }
      }

      await updateDoc(profileRef, updates);

      if (currentProfile.isPrimary && !currentProfile.profileComplete) {
        await updateDoc(doc(db, 'users', uid), {
          profileComplete: true,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error updating dietary preferences:', error);
      throw error;
    }
  }

  /**
   * Check if user can edit dietary preferences
   * - Initial setup: always allowed
   * - First edit after setup: always allowed (free edit)
   * - Subsequent edits: 30-day lock applies
   */
  canEditDietaryPresets(profile: DietaryProfile | null): {
    canEdit: boolean;
    daysRemaining: number;
    isFreeEdit: boolean;
  } {
    // No profile or initial setup - always allowed
    if (!profile || !profile.profileComplete) {
      return { canEdit: true, daysRemaining: 0, isFreeEdit: false };
    }

    // Check if user hasn't used their free edit yet
    if (!profile.hasUsedFreeEdit) {
      return { canEdit: true, daysRemaining: 0, isFreeEdit: true };
    }

    // Free edit used, check 30-day lock
    if (!profile.lastDietUpdate) {
      // No lastDietUpdate yet (shouldn't happen, but handle gracefully)
      return { canEdit: true, daysRemaining: 0, isFreeEdit: false };
    }

    const lastUpdate = profile.lastDietUpdate.toDate();
    const now = new Date();
    const daysSinceUpdate = Math.floor(
      (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysRemaining = Math.max(0, 30 - daysSinceUpdate);

    return {
      canEdit: daysSinceUpdate >= 30,
      daysRemaining,
      isFreeEdit: false,
    };
  }

  /**
   * Check if user can scan (freemium limit: 5 scans)
   */
  canScan(profile: UserProfile | null): boolean {
    if (!profile) return false;
    if (this.isPremiumUser(profile)) return true; // Premium users have unlimited scans
    const currentCount = profile.scanCount ?? 0; // Default to 0 if undefined
    return currentCount < 5; // Free users limited to 5 scans
  }

  /**
   * Get remaining scans for free users
   */
  getRemainingScans(profile: UserProfile | null): number {
    if (!profile) return 0;
    if (this.isPremiumUser(profile)) return -1; // -1 means unlimited
    const currentCount = profile.scanCount ?? 0; // Default to 0 if undefined
    return Math.max(0, 5 - currentCount);
  }

  /**
   * Increment scan count for user
   */
  async incrementScanCount(uid: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      const profile = await this.getUserProfile(uid);
      
      if (!profile) {
        throw new Error('User profile not found');
      }

      // Only increment if user is not premium
      if (!this.isPremiumUser(profile)) {
        const currentCount = profile.scanCount ?? 0; // Default to 0 if undefined
        await updateDoc(userRef, {
          scanCount: currentCount + 1,
          updatedAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error incrementing scan count:', error);
      throw error;
    }
  }

  /**
   * Subscribe to user profile changes
   */
  subscribeToProfile(uid: string, callback: (profile: UserProfile | null) => void) {
    const userRef = doc(db, 'users', uid);
    return onSnapshot(
      userRef,
      (doc) => {
        if (doc.exists()) {
          callback(this.normalizeProfileData(doc.data()));
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error listening to profile changes:', error);
        callback(null);
      }
    );
  }

  private async ensureSinglePrimaryProfile(uid: string, profiles: DietaryProfile[]): Promise<void> {
    const primaryProfiles = profiles.filter(p => p.isPrimary);
    
    if (primaryProfiles.length <= 1) {
      return; // Already correct
    }

    // Sort by createdAt to find the oldest one
    const sortedPrimary = primaryProfiles.sort((a, b) => {
      const aTime = a.createdAt?.toMillis() || 0;
      const bTime = b.createdAt?.toMillis() || 0;
      return aTime - bTime;
    });

    // Keep the first one as primary, remove primary flag from others
    const keepPrimary = sortedPrimary[0];
    const removePrimary = sortedPrimary.slice(1);

    // Update profiles to remove primary flag from duplicates
    const batch = removePrimary.map(profile => 
      updateDoc(doc(this.profilesRef(uid), profile.id), {
        isPrimary: false,
        updatedAt: serverTimestamp(),
      })
    );

    await Promise.all(batch);
    console.log(`Fixed multiple primary profiles: kept ${keepPrimary.name} as primary, removed primary flag from ${removePrimary.length} profile(s)`);
  }

  subscribeToProfiles(uid: string, callback: (profiles: DietaryProfile[]) => void) {
    const profilesQuery = query(this.profilesRef(uid), orderBy('createdAt', 'asc'));
    return onSnapshot(
      profilesQuery,
      async (snapshot) => {
        if (snapshot.empty) {
          const account = await this.getUserProfile(uid);
          const seeded = await this.ensurePrimaryProfile(uid, account);
          callback(seeded ? [seeded] : []);
          return;
        }
        const profiles = snapshot.docs.map((docSnap) => this.normalizeDietaryProfile(docSnap.id, docSnap.data()));
        
        // Fix multiple primary profiles if they exist (fire and forget - will trigger another snapshot)
        this.ensureSinglePrimaryProfile(uid, profiles).catch(err => {
          console.error('Error fixing multiple primary profiles:', err);
        });
        
        // Return profiles immediately (fix will apply on next snapshot)
        callback(profiles);
      },
      (error) => {
        console.error('Error listening to dietary profiles:', error);
        callback([]);
      }
    );
  }

  async getDietaryProfiles(uid: string): Promise<DietaryProfile[]> {
    const snapshot = await getDocs(query(this.profilesRef(uid), orderBy('createdAt', 'asc')));
    if (snapshot.empty) {
      const account = await this.getUserProfile(uid);
      const seeded = await this.ensurePrimaryProfile(uid, account);
      return seeded ? [seeded] : [];
    }
    const profiles = snapshot.docs.map((docSnap) => this.normalizeDietaryProfile(docSnap.id, docSnap.data()));
    
    // Fix multiple primary profiles if they exist
    await this.ensureSinglePrimaryProfile(uid, profiles);
    
    // Return profiles with corrected primary flags (fix updates Firestore, but we return corrected array)
    const primaryProfiles = profiles.filter(p => p.isPrimary);
    if (primaryProfiles.length > 1) {
      // Sort by createdAt and keep only the oldest as primary
      const sortedPrimary = primaryProfiles.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0;
        const bTime = b.createdAt?.toMillis() || 0;
        return aTime - bTime;
      });
      // Update the array in memory to reflect the fix
      profiles.forEach(p => {
        if (p.id !== sortedPrimary[0].id && p.isPrimary) {
          p.isPrimary = false;
        }
      });
    }
    
    return profiles;
  }

  async setCurrentProfile(uid: string, profileId: string): Promise<void> {
    await updateDoc(doc(db, 'users', uid), {
      currentProfileId: profileId,
      updatedAt: serverTimestamp(),
    });
  }

  async createDietaryProfile(uid: string, input: ProfileInput, account: UserProfile): Promise<void> {
    const profiles = await this.getDietaryProfiles(uid);
    this.enforceProfileLimit(this.isPremiumUser(account), profiles.length);

    const profileRef = doc(this.profilesRef(uid));
    const now = serverTimestamp();

    await setDoc(profileRef, {
      name: input.name,
      avatarColor: input.avatarColor ?? null,
      emoji: input.emoji ?? null,
      dietaryPresets: input.dietaryPresets ?? [],
      customRestrictions: input.customRestrictions ?? [],
      profileComplete: true,
      hasUsedFreeEdit: false,
      lastDietUpdate: null,
      isPrimary: false,
      createdAt: now,
      updatedAt: now,
    });

    await this.setCurrentProfile(uid, profileRef.id);
  }

  async deleteDietaryProfile(profileId: string): Promise<void> {
    const callable = httpsCallable(functions, 'deleteUserProfileData');
    await callable({ profileId });
  }

  async renameDietaryProfile(uid: string, profileId: string, name: string): Promise<void> {
    await updateDoc(doc(this.profilesRef(uid), profileId), {
      name,
      updatedAt: serverTimestamp(),
    });
  }

  async deleteAccountData(): Promise<void> {
    const callable = httpsCallable(functions, 'deleteAccountData');
    await callable();
  }
}

export default new UserService();