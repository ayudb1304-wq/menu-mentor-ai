import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:menu_mentor_app/services/auth_service.dart'; // We need this for logout

class ProfileScreen extends StatelessWidget {
  const ProfileScreen({super.key});

  // 200 IQ Vibe: Get the user and stream their profile
  Stream<DocumentSnapshot<Map<String, dynamic>>> _getUserProfileStream() {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      // This should be impossible if they're on this screen, but good to have
      return Stream.error('No user logged in');
    }
    return FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .snapshots();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Your Profile'),
        automaticallyImplyLeading: false,
      ),
      body: StreamBuilder<DocumentSnapshot<Map<String, dynamic>>>(
        stream: _getUserProfileStream(),
        builder: (context, snapshot) {
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (!snapshot.hasData || !snapshot.data!.exists) {
            return const Center(child: Text('Could not load profile.'));
          }

          final profile = snapshot.data!.data()!;
          final List<String> diets = List<String>.from(profile['dietaryPresets'] ?? []);
          final List<String> restrictions = List<String>.from(profile['customRestrictions'] ?? []);

          return ListView(
            padding: const EdgeInsets.all(16.0),
            children: [
              // --- DIETS SECTION ---
              Text(
                'Your Diets',
                style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              if (diets.isEmpty)
                const Text('No preset diets selected.')
              else
                Wrap(
                  spacing: 8.0,
                  runSpacing: 4.0,
                  children: diets.map((diet) => Chip(label: Text(diet))).toList(),
                ),

              const SizedBox(height: 24),

              // --- RESTRICTIONS SECTION ---
              Text(
                'Your Restrictions',
                style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 8),
              if (restrictions.isEmpty)
                const Text('No custom restrictions added.')
              else
                Wrap(
                  spacing: 8.0,
                  runSpacing: 4.0,
                  children: restrictions
                      .map((item) => Chip(
                            label: Text(item),
                            backgroundColor: theme.colorScheme.errorContainer,
                            labelStyle: TextStyle(color: theme.colorScheme.onErrorContainer),
                          ))
                      .toList(),
                ),

              const Divider(height: 48),

              // --- ACTIONS ---
              ListTile(
                leading: Icon(LucideIcons.logOut, color: theme.colorScheme.error),
                title: Text(
                  'Sign Out',
                  style: TextStyle(color: theme.colorScheme.error),
                ),
                onTap: () async {
                  // Vibe Check: Use the AuthService to sign out
                  await AuthService().signOut();
                  // AuthWrapper will handle navigation
                },
              ),
            ],
          );
        },
      ),
    );
  }
}
