import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { AnalysisResult, MenuItem } from './menuAnalysisService';
import userService from './userService';

const SCAN_ID_PREFIX = 'scan_';
const SCAN_ID_REGEX = /^scan_\d{5,}$/;

export interface ScanHistory {
  id: string;
  userId: string;
  imageUrl: string;
  items: MenuItem[];
  scanDate: Timestamp;
  restaurantName?: string;
  notes?: string;
  createdAt: Timestamp;
}

class HistoryService {
  private generateScanId(): string {
    return `${SCAN_ID_PREFIX}${Date.now()}`;
  }

  private isValidScanId(scanId: string): boolean {
    if (typeof scanId !== 'string') {
      return false;
    }

    if (SCAN_ID_REGEX.test(scanId)) {
      return true;
    }

    // Allow legacy IDs (non-prefixed) but log a warning for visibility
    console.warn('Scan ID does not match expected format, continuing anyway:', scanId);
    return scanId.trim().length > 0;
  }

  /**
   * Save a scan to history
   */
  async saveScan(
    analysisResult: AnalysisResult,
    restaurantName?: string,
    notes?: string
  ): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Generate unique ID
      const scanId = this.generateScanId();
      if (!this.isValidScanId(scanId)) {
        console.error('Generated invalid scan ID, aborting save:', scanId);
        throw new Error('Invalid scan identifier');
      }
      const historyRef = doc(db, 'users', user.uid, 'scanHistory', scanId);

      // Build scan data object, only including defined fields (Firestore doesn't allow undefined)
      const scanData: any = {
        userId: user.uid,
        // Use download URL for display, fallback to imageUrl if not available
        imageUrl: analysisResult.downloadUrl || analysisResult.imageUrl || '',
        items: analysisResult.items,
        scanDate: Timestamp.now(),
        createdAt: serverTimestamp() as Timestamp,
      };

      // Only add optional fields if they are defined (not undefined)
      if (restaurantName !== undefined && restaurantName !== null && restaurantName !== '') {
        scanData.restaurantName = restaurantName;
      }
      if (notes !== undefined && notes !== null && notes !== '') {
        scanData.notes = notes;
      }

      await setDoc(historyRef, scanData);
      console.log('Scan saved to history:', scanId);

      // Increment scan count for freemium users
      try {
        await userService.incrementScanCount(user.uid);
        console.log('Scan count incremented');
      } catch (countError) {
        console.error('Failed to increment scan count:', countError);
        // Don't fail the save if count increment fails
      }
    } catch (error) {
      console.error('Error saving scan to history:', error);
      throw new Error('Failed to save scan to history');
    }
  }

  /**
   * Get user's scan history
   */
  async getScanHistory(userId?: string): Promise<ScanHistory[]> {
    try {
      // Wait for auth to be ready
      const currentUser = auth.currentUser;
      const uid = userId || currentUser?.uid;

      if (!uid) {
        console.warn('User not authenticated when fetching scan history');
        throw new Error('User not authenticated');
      }

      // Verify user is authenticated
      if (!currentUser) {
        console.warn('No current user found when fetching scan history');
        throw new Error('User not authenticated');
      }

      // Ensure we're using the authenticated user's ID
      const authenticatedUserId = currentUser.uid;
      if (uid !== authenticatedUserId) {
        console.warn('User ID mismatch when fetching scan history');
        throw new Error('Permission denied: Cannot access other user\'s history');
      }

      const historyRef = collection(db, 'users', authenticatedUserId, 'scanHistory');
      const q = query(historyRef, orderBy('scanDate', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);

      console.log(`Found ${querySnapshot.size} scans in history for user ${authenticatedUserId}`);

      const history: ScanHistory[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`Scan ID: ${doc.id}, Items: ${data.items?.length || 0}, Date: ${data.scanDate?.toDate?.() || 'N/A'}`);
        history.push({
          id: doc.id,
          ...data,
        } as ScanHistory);
      });

      console.log(`Returning ${history.length} scans from history service`);
      return history;
    } catch (error: any) {
      console.error('Error fetching scan history:', error);
      
      // Provide more specific error messages
      if (error.code === 'permission-denied' || error.code === 'permissions-denied') {
        console.error('Permission denied: Check Firestore rules and user authentication');
        throw new Error('Permission denied: Please ensure you are logged in and have access to scan history');
      }
      
      if (error.message?.includes('not authenticated')) {
        throw new Error('Please log in to view your scan history');
      }
      
      // Return empty array for other errors to prevent app crash
      return [];
    }
  }

  /**
   * Delete a scan from history
   */
  async deleteScan(
    scanId: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const user = auth.currentUser;
      if (!user) {
        console.warn('Attempted to delete scan without authentication');
        return { success: false, message: 'User not authenticated' };
      }

      if (!this.isValidScanId(scanId)) {
        return {
          success: false,
          message: 'Invalid scan identifier provided',
        };
      }

      const scanRef = doc(db, 'users', user.uid, 'scanHistory', scanId);
      const scanDoc = await getDoc(scanRef);

      if (!scanDoc.exists()) {
        console.warn('Attempted to delete non-existent scan:', scanId);
        return { success: false, message: 'Scan not found' };
      }

      await deleteDoc(scanRef);
      console.log('Scan deleted from history:', scanId);
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting scan from history:', error);

      if (error.code === 'permission-denied' || error.code === 'permissions-denied') {
        return {
          success: false,
          message: 'Permission denied. Please check your account access.',
        };
      }

      return {
        success: false,
        message: 'Failed to delete scan from history',
      };
    }
  }

  /**
   * Get a single scan by ID
   */
  async getScanById(scanId: string): Promise<ScanHistory | null> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const scanRef = doc(db, 'users', user.uid, 'scanHistory', scanId);
      const scanDoc = await getDoc(scanRef);

      if (scanDoc.exists()) {
        return {
          id: scanDoc.id,
          ...scanDoc.data(),
        } as ScanHistory;
      }

      return null;
    } catch (error: any) {
      console.error('Error fetching scan:', error);
      
      // Provide more specific error messages
      if (error.code === 'permission-denied' || error.code === 'permissions-denied') {
        console.error('Permission denied: Check Firestore rules and user authentication');
        throw new Error('Permission denied: Please ensure you are logged in and have access to this scan');
      }
      
      return null;
    }
  }
}

export default new HistoryService();