import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from 'firebase/auth';

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
  dietaryPresets: string[];
  customRestrictions: string[];
  lastDietUpdate: Timestamp | null;
  hasUsedFreeEdit: boolean; // Track if user has used their free edit after initial setup
  isPremium: boolean; // Premium subscription status
  scanCount: number; // Track number of scans for freemium users
  aiConsentGiven: boolean; // Track if user has consented to AI processing of their data
  createdAt: Timestamp;
  updatedAt: Timestamp;
  subscriptionId: string | null;
  subscriptionStatus: SubscriptionStatus;
  planId: string | null;
  validUntil: Timestamp | null;
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
    };

    return normalized;
  }

  private isPremiumUser(profile: UserProfile | null): boolean {
    if (!profile) return false;
    return this.computeIsPremium(profile.subscriptionStatus, profile.validUntil);
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
          dietaryPresets: [],
          customRestrictions: [],
          lastDietUpdate: null,
          hasUsedFreeEdit: false, // New users haven't used their free edit yet
          isPremium: false, // Default to free tier
          scanCount: 0, // New users start with 0 scans
          aiConsentGiven: false, // Consent must be explicitly given during profile setup
          createdAt: serverTimestamp() as Timestamp,
          updatedAt: serverTimestamp() as Timestamp,
          subscriptionId: null,
          subscriptionStatus: 'free',
          planId: null,
          validUntil: null,
        };
        await setDoc(userRef, newProfile);
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
    dietaryPresets: string[],
    customRestrictions: string[],
    aiConsentGiven?: boolean
  ): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      const profile = await this.getUserProfile(uid);

      // Check if dietary presets are being changed
      const presetsChanged =
        JSON.stringify(profile?.dietaryPresets?.sort()) !==
        JSON.stringify(dietaryPresets.sort());

      const updates: any = {
        dietaryPresets,
        customRestrictions,
        profileComplete: true,
        updatedAt: serverTimestamp(),
      };

      // Update AI consent if provided (for initial setup)
      if (aiConsentGiven !== undefined) {
        updates.aiConsentGiven = aiConsentGiven;
      }

      // Handle free edit logic
      if (profile?.profileComplete) {
        // This is an edit after initial setup
        if (!profile.hasUsedFreeEdit) {
          // This is the free edit - mark it as used but don't set lastDietUpdate
          updates.hasUsedFreeEdit = true;
        } else if (presetsChanged) {
          // Free edit already used, apply 30-day lock for future edits
          updates.lastDietUpdate = serverTimestamp();
        }
      }
      // If profile not complete, this is initial setup - no restrictions

      await updateDoc(userRef, updates);
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
  canEditDietaryPresets(profile: UserProfile | null): {
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
}

export default new UserService();