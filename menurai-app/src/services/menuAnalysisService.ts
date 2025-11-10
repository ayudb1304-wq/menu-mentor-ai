import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { storage, functions, auth } from '../config/firebase';
import { Platform } from 'react-native';
import userService from './userService';

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
  imageUrl?: string;
  timestamp?: Date;
}

class MenuAnalysisService {
  /**
   * Upload image to Firebase Storage
   */
  async uploadImage(imageUri: string): Promise<string> {
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

      // Return the gs:// URL for the Cloud Function
      const gsUrl = `gs://${snapshot.metadata.bucket}/${snapshot.metadata.fullPath}`;
      return gsUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image. Please try again.');
    }
  }

  /**
   * Analyze menu using Cloud Function
   */
  async analyzeMenu(imageUrl: string): Promise<AnalysisResult> {
    try {
      console.log('Calling analyzeMenu Cloud Function...');

      // Get the current user
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Fetch the user's profile
      const userProfile = await userService.getUserProfile(user.uid);
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // Format the user profile for the Cloud Function
      // The Cloud Function expects 'diets' and 'restrictions' arrays
      const formattedProfile = {
        diets: userProfile.dietaryPresets || [],
        restrictions: userProfile.customRestrictions || []
      };

      console.log('Sending request with userProfile:', formattedProfile);

      // Call the Cloud Function with both imageUrl and userProfile
      const analyzeMenuFunction = httpsCallable(functions, 'analyzeMenu');
      const result = await analyzeMenuFunction({
        imageUrl,
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
        imageUrl,
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
      // Step 1: Upload image
      const imageUrl = await this.uploadImage(imageUri);

      // Step 2: Analyze menu
      const result = await this.analyzeMenu(imageUrl);

      return result;
    } catch (error) {
      console.error('Error processing menu image:', error);
      throw error;
    }
  }
}

export default new MenuAnalysisService();