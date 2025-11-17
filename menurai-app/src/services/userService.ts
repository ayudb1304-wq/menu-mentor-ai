import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  QueryDocumentSnapshot,
  setDoc,
  Timestamp,
  updateDoc,
  serverTimestamp,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { User } from 'firebase/auth';

export type SubscriptionStatus =
  | 'free'
  | 'pending'
  | 'active'
  | 'failed'
  | 'cancelled'
  | 'pending_cancel';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  dietaryPresets: string[];
  customRestrictions: string[];
  lastDietUpdate: Timestamp | null;
  hasUsedFreeEdit: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserData {
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
  activeProfileId: string | null;
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

  private normalizeUserData(rawData: any, uid: string): UserData {
    const rawStatus = rawData?.subscriptionStatus;
    const subscriptionStatus: SubscriptionStatus = this.isValidSubscriptionStatus(rawStatus)
      ? rawStatus
      : 'free';

    const rawValidUntil = rawData?.validUntil;
    const validUntil =
      rawValidUntil && typeof rawValidUntil.toDate === 'function'
        ? (rawValidUntil as Timestamp)
        : null;

    const rawCreatedAt = rawData?.createdAt;
    const rawUpdatedAt = rawData?.updatedAt;

    const createdAt =
      rawCreatedAt && typeof rawCreatedAt.toDate === 'function'
        ? (rawCreatedAt as Timestamp)
        : Timestamp.now();
    const updatedAt =
      rawUpdatedAt && typeof rawUpdatedAt.toDate === 'function'
        ? (rawUpdatedAt as Timestamp)
        : Timestamp.now();

    const computedIsPremium = this.computeIsPremium(subscriptionStatus, validUntil);

    return {
      uid: rawData?.uid ?? uid,
      email: rawData?.email ?? '',
      displayName: rawData?.displayName ?? '',
      photoURL: rawData?.photoURL ?? null,
      profileComplete: !!rawData?.profileComplete,
      isPremium: computedIsPremium,
      scanCount: typeof rawData?.scanCount === 'number' ? rawData.scanCount : 0,
      createdAt,
      updatedAt,
      subscriptionId: rawData?.subscriptionId ?? null,
      subscriptionStatus,
      planId: rawData?.planId ?? null,
      validUntil,
      activeProfileId: rawData?.activeProfileId ?? null,
    };
  }

  private mapProfileDoc(snapshot: QueryDocumentSnapshot | DocumentSnapshot): UserProfile {
    const data = snapshot.data() ?? {};
    const rawCreatedAt = (data as any)?.createdAt;
    const rawUpdatedAt = (data as any)?.updatedAt;

    return {
      id: snapshot.id,
      name: data?.name ?? 'My Profile',
      email: data?.email ?? '',
      dietaryPresets: Array.isArray(data?.dietaryPresets) ? data.dietaryPresets : [],
      customRestrictions: Array.isArray(data?.customRestrictions) ? data.customRestrictions : [],
      lastDietUpdate:
        data?.lastDietUpdate && typeof data.lastDietUpdate.toDate === 'function'
          ? (data.lastDietUpdate as Timestamp)
          : null,
      hasUsedFreeEdit: !!data?.hasUsedFreeEdit,
      createdAt:
        rawCreatedAt && typeof rawCreatedAt.toDate === 'function'
          ? (rawCreatedAt as Timestamp)
          : Timestamp.now(),
      updatedAt:
        rawUpdatedAt && typeof rawUpdatedAt.toDate === 'function'
          ? (rawUpdatedAt as Timestamp)
          : Timestamp.now(),
    };
  }

  private isPremiumUser(userData: UserData | null): boolean {
    if (!userData) return false;
    return this.computeIsPremium(userData.subscriptionStatus, userData.validUntil);
  }

  /**
   * Get user data document
   */
  async getUserData(uid: string): Promise<UserData | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return this.normalizeUserData(userDoc.data(), uid);
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  }

  /**
   * Fetch a profile by ID
   */
  async getProfileById(uid: string, profileId: string): Promise<UserProfile | null> {
    try {
      const profileRef = doc(db, 'users', uid, 'profiles', profileId);
      const snapshot = await getDoc(profileRef);
      if (!snapshot.exists()) {
        return null;
      }
      return this.mapProfileDoc(snapshot);
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  /**
   * Fetch the active user profile (backwards compatible helper)
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userData = await this.getUserData(uid);
    if (!userData?.activeProfileId) {
      return null;
    }
    return this.getProfileById(uid, userData.activeProfileId);
  }

  /**
   * Create or update user profile
   */
  async createOrUpdateProfile(user: User): Promise<UserData> {
    try {
      const userRef = doc(db, 'users', user.uid);
      const existingUserData = await this.getUserData(user.uid);

      if (existingUserData) {
        const updates = {
          email: user.email || existingUserData.email,
          displayName: user.displayName || existingUserData.displayName,
          photoURL: user.photoURL ?? existingUserData.photoURL,
          updatedAt: serverTimestamp(),
        };
        await updateDoc(userRef, updates);
        const refreshed = await this.getUserData(user.uid);
        if (!refreshed) {
          throw new Error('Failed to refresh user data after update');
        }
        return refreshed;
      } else {
        const newUser: Partial<UserData> = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          photoURL: user.photoURL ?? null,
          profileComplete: false,
          isPremium: false,
          scanCount: 0,
          createdAt: serverTimestamp() as Timestamp,
          updatedAt: serverTimestamp() as Timestamp,
          subscriptionId: null,
          subscriptionStatus: 'free',
          planId: null,
          validUntil: null,
          activeProfileId: null,
        };
        await setDoc(userRef, newUser);
        const created = await this.getUserData(user.uid);
        if (!created) {
          throw new Error('Failed to load user data after creation');
        }
        return created;
      }
    } catch (error) {
      console.error('Error creating/updating user data:', error);
      throw error;
    }
  }

  /**
   * Create a new profile within the user's subcollection
   */
  async createProfile(uid: string, profileName: string): Promise<string> {
    const trimmedName = profileName.trim();
    if (!trimmedName) {
      throw new Error('Profile name is required');
    }

    try {
      const profilesRef = collection(db, 'users', uid, 'profiles');
      const newProfile: Omit<UserProfile, 'id'> = {
        name: trimmedName,
        email: auth.currentUser?.email || '',
        dietaryPresets: [],
        customRestrictions: [],
        lastDietUpdate: null,
        hasUsedFreeEdit: false,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      const docRef = await addDoc(profilesRef, newProfile);
      const userData = await this.getUserData(uid);
      const shouldSetActive = !userData?.activeProfileId;
      const userRef = doc(db, 'users', uid);

      await setDoc(userRef, {
        profileComplete: true,
        activeProfileId: shouldSetActive ? docRef.id : userData?.activeProfileId ?? docRef.id,
        updatedAt: serverTimestamp(),
      }, { merge: true });

      return docRef.id;
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  }

  subscribeToAllProfiles(uid: string, callback: (profiles: UserProfile[]) => void) {
    const profilesRef = collection(db, 'users', uid, 'profiles');
    return onSnapshot(
      profilesRef,
      (snapshot) => {
        const profiles = snapshot.docs.map((docSnap) => this.mapProfileDoc(docSnap));
        callback(profiles);
      },
      (error) => {
        console.error('Error listening to profiles:', error);
        callback([]);
      }
    );
  }

  async setActiveProfile(uid: string, profileId: string) {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      activeProfileId: profileId,
      updatedAt: serverTimestamp(),
    });
  }

  /**
   * Update dietary preferences
   */
  async updateProfilePreferences(
    uid: string,
    profileId: string,
    dietaryPresets: string[],
    customRestrictions: string[],
    options?: { name?: string }
  ): Promise<void> {
    try {
      const profileRef = doc(db, 'users', uid, 'profiles', profileId);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        throw new Error('Profile not found');
      }

      const profile = this.mapProfileDoc(profileSnap);
      const sortedExisting = [...(profile.dietaryPresets ?? [])].sort();
      const sortedIncoming = [...dietaryPresets].sort();
      const presetsChanged = JSON.stringify(sortedExisting) !== JSON.stringify(sortedIncoming);

      const isInitialSetup =
        (profile.dietaryPresets?.length ?? 0) === 0 && (profile.customRestrictions?.length ?? 0) === 0;

      const updates: Partial<UserProfile> = {
        dietaryPresets,
        customRestrictions,
        updatedAt: serverTimestamp() as Timestamp,
      };

      const trimmedName = options?.name?.trim();
      if (trimmedName) {
        updates.name = trimmedName;
      }

      if (!isInitialSetup) {
        if (!profile.hasUsedFreeEdit) {
          updates.hasUsedFreeEdit = true;
        } else if (presetsChanged) {
          updates.lastDietUpdate = serverTimestamp() as Timestamp;
        }
      }

      await updateDoc(profileRef, updates);
      await updateDoc(doc(db, 'users', uid), {
        profileComplete: true,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error updating profile preferences:', error);
      throw error;
    }
  }

  /**
   * Check if user can edit dietary preferences
   * - Initial setup: always allowed
   * - First edit after setup: always allowed (free edit)
   * - Subsequent edits: 30-day lock applies
   */
  canEditDietaryPresets(profile: UserProfile | null): {
    canEdit: boolean;
    daysRemaining: number;
    isFreeEdit: boolean;
  } {
    if (!profile) {
      return { canEdit: true, daysRemaining: 0, isFreeEdit: false };
    }

    const hasAnyPreferences =
      (profile.dietaryPresets?.length ?? 0) > 0 || (profile.customRestrictions?.length ?? 0) > 0;
    if (!hasAnyPreferences) {
      return { canEdit: true, daysRemaining: 0, isFreeEdit: false };
    }

    if (!profile.hasUsedFreeEdit) {
      return { canEdit: true, daysRemaining: 0, isFreeEdit: true };
    }

    if (!profile.lastDietUpdate) {
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
  canScan(userData: UserData | null): boolean {
    if (!userData) return false;
    if (this.isPremiumUser(userData)) return true;
    const currentCount = userData.scanCount ?? 0;
    return currentCount < 5;
  }

  /**
   * Get remaining scans for free users
   */
  getRemainingScans(userData: UserData | null): number {
    if (!userData) return 0;
    if (this.isPremiumUser(userData)) return -1;
    const currentCount = userData.scanCount ?? 0;
    return Math.max(0, 5 - currentCount);
  }

  /**
   * Increment scan count for user
   */
  async incrementScanCount(uid: string): Promise<void> {
    try {
      const userData = await this.getUserData(uid);
      if (!userData) {
        throw new Error('User data not found');
      }

      if (this.isPremiumUser(userData)) {
        return;
      }

      const currentCount = userData.scanCount ?? 0;
      await updateDoc(doc(db, 'users', uid), {
        scanCount: currentCount + 1,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('Error incrementing scan count:', error);
      throw error;
    }
  }

  /**
   * Subscribe to user profile changes
   */
  subscribeToProfile(uid: string, callback: (userData: UserData | null) => void) {
    const userRef = doc(db, 'users', uid);
    return onSnapshot(
      userRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(this.normalizeUserData(snapshot.data(), uid));
        } else {
          callback(null);
        }
      },
      (error) => {
        console.error('Error listening to user data changes:', error);
        callback(null);
      }
    );
  }
}

export default new UserService();