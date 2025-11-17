import {
  signInWithPopup,
  signInWithCredential,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  User,
  onAuthStateChanged,
  AuthCredential,
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { ResponseType } from 'expo-auth-session';

// Complete the auth session for web
WebBrowser.maybeCompleteAuthSession();

// Google OAuth configuration
const GOOGLE_WEB_CLIENT_ID = '130497814341-web-client-id.apps.googleusercontent.com'; // Need to add actual web client ID
const GOOGLE_IOS_CLIENT_ID = '130497814341-s06m1ikgim60ctmffpi6j44ldsl7look.apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = '130497814341-android-client-id.apps.googleusercontent.com'; // Need to add actual Android client ID

class AuthService {
  private googleProvider: GoogleAuthProvider;

  constructor() {
    this.googleProvider = new GoogleAuthProvider();
    this.googleProvider.setCustomParameters({
      prompt: 'select_account',
    });
  }

  /**
   * Get the current authenticated user
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  }

  /**
   * Sign in with Google - handles both web and mobile
   */
  async signInWithGoogle(): Promise<User | null> {
    try {
      if (Platform.OS === 'web') {
        // Web implementation using Firebase popup
        const result = await signInWithPopup(auth, this.googleProvider);
        return result.user;
      } else {
        // Mobile implementation using Expo AuthSession
        const result = await this.signInWithGoogleMobile();
        return result;
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Mobile Google Sign-In using Expo AuthSession
   */
  private async signInWithGoogleMobile(): Promise<User | null> {
    try {
      // Configure the request
      const request = new AuthSession.AuthRequest({
        clientId: Platform.OS === 'ios' ? GOOGLE_IOS_CLIENT_ID : GOOGLE_ANDROID_CLIENT_ID,
        responseType: ResponseType.IdToken,
        scopes: ['openid', 'profile', 'email'],
        redirectUri: AuthSession.makeRedirectUri({
          scheme: 'com.menurai.app', // This should match your app scheme
        }),
      });

      // Initiate the authentication flow
      const result = await request.promptAsync({
        authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
      });

      if (result.type === 'success' && result.params.id_token) {
        // Create credential from the ID token
        const credential = GoogleAuthProvider.credential(result.params.id_token);

        // Sign in with the credential
        const userCredential = await signInWithCredential(auth, credential);
        return userCredential.user;
      }

      return null;
    } catch (error) {
      console.error('Error in mobile Google sign-in:', error);
      throw error;
    }
  }

  /**
   * Sign in with Facebook (placeholder)
   */
  async signInWithFacebook(): Promise<User | null> {
    // TODO: Implement Facebook sign-in
    throw new Error('Facebook sign-in not yet implemented');
  }

  /**
   * Sign in with X/Twitter (placeholder)
   */
  async signInWithX(): Promise<User | null> {
    // TODO: Implement X/Twitter sign-in
    throw new Error('X sign-in not yet implemented');
  }

  /**
   * Sign in with GitHub (placeholder)
   */
  async signInWithGitHub(): Promise<User | null> {
    // TODO: Implement GitHub sign-in
    throw new Error('GitHub sign-in not yet implemented');
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Delete the current user's account
   * This will delete both Firebase Auth and Firestore data
   */
  async deleteAccount(): Promise<void> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        throw new Error('No user is currently signed in');
      }

      // Import functions dynamically to avoid circular dependencies
      const { functions } = await import('../config/firebase');
      const { httpsCallable } = await import('firebase/functions');

      // Call the Cloud Function to delete the account
      const deleteUserAccount = httpsCallable<void, { message: string }>(
        functions,
        'deleteUserAccount'
      );
      await deleteUserAccount();

      // Sign out after successful deletion
      await this.signOut();
    } catch (error: any) {
      console.error('Error deleting account:', error);
      throw this.handleAuthError(error);
    }
  }

  /**
   * Listen to authentication state changes
   */
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Handle and format authentication errors
   */
  private handleAuthError(error: any): Error {
    const errorCode = error.code;
    const errorMessages: Record<string, string> = {
      'auth/cancelled-popup-request': 'Sign-in popup was cancelled',
      'auth/popup-blocked': 'Sign-in popup was blocked by the browser',
      'auth/popup-closed-by-user': 'Sign-in popup was closed before completing',
      'auth/unauthorized-domain': 'This domain is not authorized for sign-in',
      'auth/user-disabled': 'This user account has been disabled',
      'auth/user-not-found': 'No user found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/invalid-email': 'Invalid email address',
      'auth/account-exists-with-different-credential': 'An account already exists with the same email',
      'auth/network-request-failed': 'Network error. Please check your connection',
    };

    const message = errorMessages[errorCode] || `Authentication error: ${error.message}`;
    return new Error(message);
  }
}

export default new AuthService();