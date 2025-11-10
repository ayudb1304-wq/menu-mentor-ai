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
  createdAt: Timestamp;
  updatedAt: Timestamp;
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
  /**
   * Get user profile from Firestore
   */
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data() as UserProfile;
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
        return { ...existingProfile, ...updates } as UserProfile;
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
          createdAt: serverTimestamp() as Timestamp,
          updatedAt: serverTimestamp() as Timestamp,
        };
        await setDoc(userRef, newProfile);
        return newProfile as UserProfile;
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
    customRestrictions: string[]
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
   * Subscribe to user profile changes
   */
  subscribeToProfile(uid: string, callback: (profile: UserProfile | null) => void) {
    const userRef = doc(db, 'users', uid);
    return onSnapshot(
      userRef,
      (doc) => {
        if (doc.exists()) {
          callback(doc.data() as UserProfile);
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