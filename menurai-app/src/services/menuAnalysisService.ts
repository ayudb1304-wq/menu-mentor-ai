import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { storage, functions, auth, db } from '../config/firebase';
import { Platform } from 'react-native';
import userService, { UserProfile } from './userService';

export interface MenuItem {
  name: string;
  classification: 'compliant' | 'non_compliant' | 'modifiable';
  reason: string;
  boundingBox?: {
    xMin: number;
    yMin: number;
    xMax: number;
    yMax: number;
  };
}

export interface AnalysisResult {
  items: MenuItem[];
  imageUrl?: string; // gs:// URL for Cloud Function
  downloadUrl?: string; // Download URL for display
  timestamp?: Date;
}

class MenuAnalysisService {
  /**
   * Upload image to Firebase Storage
   * Returns both gs:// URL (for Cloud Function) and download URL (for display)
   */
  async uploadImage(imageUri: string): Promise<{ gsUrl: string; downloadUrl: string }> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `menu_${timestamp}.jpg`;
      const storagePath = `uploads/${user.uid}/${fileName}`;
      const storageRef = ref(storage, storagePath);

      let uploadBlob;

      if (Platform.OS === 'web') {
        // For web, fetch the blob from the URI
        const response = await fetch(imageUri);
        uploadBlob = await response.blob();
      } else {
        // For mobile, convert URI to blob
        const response = await fetch(imageUri);
        uploadBlob = await response.blob();
      }

      // Upload the blob
      console.log('Uploading image to Firebase Storage...');
      const snapshot = await uploadBytes(storageRef, uploadBlob);
      console.log('Upload successful:', snapshot.metadata.fullPath);

      // Get the download URL
      const downloadUrl = await getDownloadURL(snapshot.ref);

      // Get the gs:// URL for the Cloud Function
      const gsUrl = `gs://${snapshot.metadata.bucket}/${snapshot.metadata.fullPath}`;
      
      return { gsUrl, downloadUrl };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image. Please try again.');
    }
  }

  /**
   * Analyze menu using Cloud Function
   */
  async analyzeMenu(gsUrl: string, downloadUrl: string): Promise<AnalysisResult> {
    try {
      console.log('Calling analyzeMenu Cloud Function...');

      // Get the current user
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

        // Fetch the user's active profile
        const userData = await userService.getUserData(user.uid);
        if (!userData) {
          throw new Error('User data not found');
        }
        if (!userData.activeProfileId) {
          throw new Error(
            'No active profile selected. Please go to your profile and create or select one.'
          );
        }

        const profileRef = doc(db, 'users', user.uid, 'profiles', userData.activeProfileId);
        const profileSnap = await getDoc(profileRef);
        if (!profileSnap.exists()) {
          throw new Error('Active profile not found. Please select a different profile.');
        }

        const userProfile = profileSnap.data() as Omit<UserProfile, 'id'>;

        // Format the user profile for the Cloud Function
      // The Cloud Function expects 'diets' and 'restrictions' arrays
      const formattedProfile = {
        diets: userProfile.dietaryPresets || [],
          restrictions: userProfile.customRestrictions || [],
      };

      console.log('Sending request with userProfile:', formattedProfile);

      // Call the Cloud Function with gs:// URL (for Cloud Function)
      const analyzeMenuFunction = httpsCallable(functions, 'analyzeMenu');
      const result = await analyzeMenuFunction({
        imageUrl: gsUrl,
        userProfile: formattedProfile
      });

      console.log('Analysis result:', result.data);

      // Parse and validate the result
      const data = result.data as any;

      if (!data || !data.items) {
        throw new Error('Invalid response from analysis service');
      }

      return {
        items: data.items,
        imageUrl: gsUrl,
        downloadUrl: downloadUrl,
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error('Error analyzing menu:', error);

      // Handle specific error cases
      if (error.code === 'functions/deadline-exceeded') {
        throw new Error('Analysis is taking longer than expected. Please try again with a clearer image.');
      } else if (error.code === 'functions/unauthenticated') {
        throw new Error('Authentication required. Please sign in and try again.');
      } else if (error.message?.includes('no text found')) {
        throw new Error('No text found in the image. Please ensure the menu is clearly visible.');
      }

      throw new Error(error.message || 'Failed to analyze menu. Please try again.');
    }
  }

  /**
   * Complete analysis flow: upload and analyze
   */
  async processMenuImage(imageUri: string): Promise<AnalysisResult> {
    try {
      // Step 1: Upload image (returns both gs:// and download URL)
      const { gsUrl, downloadUrl } = await this.uploadImage(imageUri);

      // Step 2: Analyze menu (use gs:// URL for Cloud Function)
      const result = await this.analyzeMenu(gsUrl, downloadUrl);

      return result;
    } catch (error) {
      console.error('Error processing menu image:', error);
      throw error;
    }
  }
}

export default new MenuAnalysisService();