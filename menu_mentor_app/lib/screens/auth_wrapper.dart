import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

// Import your screen widgets
import 'package:menu_mentor_app/screens/auth_screen.dart';
import 'package:menu_mentor_app/screens/scan_options_screen.dart';
import 'package:menu_mentor_app/screens/profile_setup_screen.dart';

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    // Listen to authentication state changes
    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.authStateChanges(),
      builder: (context, authSnapshot) {
        // Show loading indicator while checking auth state
        if (authSnapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(body: Center(child: CircularProgressIndicator()));
        }

        // If user is logged IN
        if (authSnapshot.hasData && authSnapshot.data != null) {
          final User user = authSnapshot.data!;

          // Check if the user's profile is complete in Firestore
          return StreamBuilder<DocumentSnapshot>(
            // Stream listens to the specific user's document
            stream: FirebaseFirestore.instance.collection('users').doc(user.uid).snapshots(),
            builder: (context, profileSnapshot) {
              // Show loading while fetching profile data
              if (profileSnapshot.connectionState == ConnectionState.waiting) {
                return const Scaffold(body: Center(child: CircularProgressIndicator()));
              }

              // Handle potential errors fetching profile
              if (profileSnapshot.hasError) {
                 print("Error fetching profile: ${profileSnapshot.error}");
                 // Optionally show an error screen or attempt logout
                return const Scaffold(body: Center(child: Text('Error loading profile.')));
              }

              // Check if the document exists and the 'profileComplete' flag is true
              final bool profileComplete = profileSnapshot.hasData &&
                                           profileSnapshot.data!.exists &&
                                           (profileSnapshot.data!.data() as Map<String, dynamic>?)?['profileComplete'] == true;

              if (profileComplete) {
                // User logged in AND profile complete -> Go to Home
                return const ScanOptionsScreen();
              } else {
                // User logged in BUT profile incomplete -> Go to Profile Setup
                return const ProfileSetupScreen();
              }
            },
          );
        } else {
          // User is NOT logged in -> Go to Auth Screen
          return const AuthScreen();
        }
      },
    );
  }
}
