import 'package:firebase_auth/firebase_auth.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:flutter/foundation.dart'; // <-- IMPORT THIS for kIsWeb

class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn.instance;

  /// Signs in with Google and returns the UserCredential
  /// Throws an exception if sign-in fails
  Future<UserCredential> signInWithGoogle() async {
    try {
      // --- THIS IS THE 200 IQ FIX ---
      if (kIsWeb) {
        // --- WEB FLOW ---
        // Use signInWithPopup for a web-based pop-up flow.
        final googleProvider = GoogleAuthProvider();
        final userCredential = await _auth.signInWithPopup(googleProvider);
        return userCredential;
      } else {
        // --- MOBILE (iOS/Android) FLOW ---
        // Your existing code is correct for mobile.
        final GoogleSignInAccount? googleUser = await _googleSignIn.authenticate();

        if (googleUser == null) {
          throw Exception('Google Sign-In was cancelled');
        }

        final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
        final credential = GoogleAuthProvider.credential(
          idToken: googleAuth.idToken,
          
        );

        final UserCredential userCredential = await _auth.signInWithCredential(credential);
        return userCredential;
      }
    } on FirebaseAuthException catch (e) {
      // Use your existing error handling, but I'll add the web-specific one
      if (e.code == 'popup-closed-by-user' || e.code == 'cancelled') {
        throw Exception('Sign-in cancelled');
      }
      // Handle Firebase-specific errors
      switch (e.code) {
        case 'account-exists-with-different-credential':
          throw Exception('An account already exists with a different sign-in method');
        case 'invalid-credential':
          throw Exception('Invalid credentials. Please try again');
        case 'operation-not-allowed':
          throw Exception('Google Sign-In is not enabled');
        case 'user-disabled':
          throw Exception('This account has been disabled');
        case 'user-not-found':
          throw Exception('No account found');
        case 'wrong-password':
          throw Exception('Invalid password');
        default:
          throw Exception('Authentication failed: ${e.message}');
      }
    } catch (e) {
      // Handle any other errors
      throw Exception('Sign-in failed: ${e.toString()}');
    }
  }

  /// Signs out the current user
  Future<void> signOut() async {
    // We sign out of Firebase on all platforms
    await _auth.signOut();
    
    // We only call GoogleSignIn.disconnect on mobile
    if (!kIsWeb) {
      await _googleSignIn.disconnect();
    }
  }

  /// Gets the current user
  User? get currentUser => _auth.currentUser;

  /// Stream of auth state changes
  Stream<User?> get authStateChanges => _auth.authStateChanges();
}