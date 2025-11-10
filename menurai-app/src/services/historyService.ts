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
      const scanId = `scan_${Date.now()}`;
      const historyRef = doc(db, 'users', user.uid, 'scanHistory', scanId);

      const scanData: Omit<ScanHistory, 'id'> = {
        userId: user.uid,
        imageUrl: analysisResult.imageUrl || '',
        items: analysisResult.items,
        scanDate: Timestamp.now(),
        restaurantName,
        notes,
        createdAt: serverTimestamp() as Timestamp,
      };

      await setDoc(historyRef, scanData);
      console.log('Scan saved to history:', scanId);
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
      const currentUser = auth.currentUser;
      const uid = userId || currentUser?.uid;

      if (!uid) {
        throw new Error('User not authenticated');
      }

      const historyRef = collection(db, 'users', uid, 'scanHistory');
      const q = query(historyRef, orderBy('scanDate', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);

      const history: ScanHistory[] = [];
      querySnapshot.forEach((doc) => {
        history.push({
          id: doc.id,
          ...doc.data(),
        } as ScanHistory);
      });

      return history;
    } catch (error) {
      console.error('Error fetching scan history:', error);
      return [];
    }
  }

  /**
   * Delete a scan from history
   */
  async deleteScan(scanId: string): Promise<void> {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      const scanRef = doc(db, 'users', user.uid, 'scanHistory', scanId);
      await deleteDoc(scanRef);
      console.log('Scan deleted from history:', scanId);
    } catch (error) {
      console.error('Error deleting scan from history:', error);
      throw new Error('Failed to delete scan from history');
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
    } catch (error) {
      console.error('Error fetching scan:', error);
      return null;
    }
  }
}

export default new HistoryService();