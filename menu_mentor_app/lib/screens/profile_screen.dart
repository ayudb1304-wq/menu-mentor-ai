import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:dotted_border/dotted_border.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:menu_mentor_app/services/auth_service.dart';
import 'package:menu_mentor_app/models/user_profile.dart';
import 'package:menu_mentor_app/screens/profile_setup_screen.dart';

// Version number - update this with each deployment
const String _appVersion = 'v1.0.6';

// --- Data holder class for the FutureBuilder ---
class ProfileScreenData {
  final User user;
  final UserProfile profile;

  ProfileScreenData({required this.user, required this.profile});
}

// --- The new ProfileScreen ---
class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final AuthService _auth = AuthService();
  late Future<ProfileScreenData> _profileDataFuture;

  @override
  void initState() {
    super.initState();
    _profileDataFuture = _loadProfileData();
  }

  // --- Fetches both Auth and Firestore data ---
  Future<ProfileScreenData> _loadProfileData() async {
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      throw Exception('No user found');
    }

    final doc = await FirebaseFirestore.instance
        .collection('users')
        .doc(user.uid)
        .get();
    if (!doc.exists) {
      // This case should rarely happen if AuthWrapper is correct
      // But we can create a default empty profile to be safe
      return ProfileScreenData(
          user: user,
          profile: UserProfile(
            dietaryPresets: [],
            customRestrictions: [],
          ));
    }

    final profile = UserProfile.fromFirestore(doc.data()!);
    return ProfileScreenData(user: user, profile: profile);
  }

  // --- Navigation to Edit Screen ---
  void _editProfile(UserProfile userProfile) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ProfileSetupScreen(userProfile: userProfile),
      ),
    ).then((_) {
      // After edit screen is popped, refresh the data
      setState(() {
        _profileDataFuture = _loadProfileData();
      });
    });
  }

  // --- "Add Profile" Premium Placeholder Logic ---
  void _showPremiumDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Feature Coming Soon!'),
        content:
            const Text('Managing multiple profiles will be part of Menu Mentor Premium.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Got it!'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Image.asset(
          'assets/images/menurai_logo.png',
          height: 32,
          fit: BoxFit.contain,
        ),
        centerTitle: true,
        automaticallyImplyLeading: false,
      ),
      body: FutureBuilder<ProfileScreenData>(
        future: _profileDataFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }
          if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          }
          if (!snapshot.hasData) {
            return const Center(child: Text('No profile data found.'));
          }

          final data = snapshot.data!;
          final user = data.user;
          final profile = data.profile;

          return SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // --- 1. User Identity Header ---
                _buildUserHeader(context, user),
                const SizedBox(height: 32),

                // --- 2. Dietary Profile Card ---
                _buildDietaryProfileCard(
                    context, profile, () => _editProfile(profile)),
                const SizedBox(height: 24),

                // --- 3. Premium Feature Placeholder ---
                _buildAddProfileCard(context, _showPremiumDialog),
                const SizedBox(height: 40),

                // --- 4. Sign Out Button ---
                OutlinedButton.icon(
                  icon: const Icon(LucideIcons.logOut, size: 18),
                  label: const Text('Sign Out'),
                  onPressed: () async {
                    await _auth.signOut();
                    // AuthWrapper will handle navigation
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: theme.colorScheme.error,
                    side: BorderSide(
                        color: theme.colorScheme.error.withOpacity(0.5)),
                  ),
                ),

                const SizedBox(height: 24),

                // --- 5. Version Number ---
                Center(
                  child: Text(
                    _appVersion,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurface.withOpacity(0.4),
                      fontSize: 10,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
              ],
            ),
          );
        },
      ),
    );
  }

  // --- WIDGET BUILDER: User Header ---
  Widget _buildUserHeader(BuildContext context, User user) {
    final theme = Theme.of(context);
    return Row(
      children: [
        CircleAvatar(
          radius: 30,
          backgroundColor: theme.colorScheme.surfaceContainerHighest,
          // Use CachedNetworkImage to show Gmail/social pic
          backgroundImage: (user.photoURL != null)
              ? CachedNetworkImageProvider(user.photoURL!)
              : null,
          child: (user.photoURL == null)
              ? Icon(
                  LucideIcons.user,
                  size: 30,
                  color: theme.colorScheme.onSurfaceVariant,
                )
              : null,
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                user.displayName ?? 'Valued User',
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (user.email != null)
                Text(
                  user.email!,
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurface.withOpacity(0.7),
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }

  // --- WIDGET BUILDER: Dietary Profile Card ---
  Widget _buildDietaryProfileCard(
      BuildContext context, UserProfile profile, VoidCallback onEdit) {
    final theme = Theme.of(context);
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: theme.colorScheme.outline.withOpacity(0.3)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Card Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'My Dietary Profile',
                  style: theme.textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                IconButton(
                  icon: Icon(LucideIcons.pencil,
                      size: 20, color: theme.colorScheme.primary),
                  onPressed: onEdit,
                ),
              ],
            ),
            const Divider(height: 24),

            // Diets Section
            _buildProfileSection(
              icon: LucideIcons.leaf,
              title: 'My Diets',
              items: profile.dietaryPresets,
              placeholder: 'No diets selected.',
            ),
            const SizedBox(height: 16),

            // Restrictions Section
            _buildProfileSection(
              icon: LucideIcons.shieldAlert,
              title: 'My Restrictions',
              items: profile.customRestrictions,
              placeholder: 'No restrictions added.',
            ),
          ],
        ),
      ),
    );
  }

  // Helper for the profile card
  Widget _buildProfileSection({
    required IconData icon,
    required String title,
    required List<String> items,
    required String placeholder,
  }) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Icon(icon, size: 18, color: theme.colorScheme.primary),
            const SizedBox(width: 8),
            Text(title, style: theme.textTheme.titleSmall),
          ],
        ),
        const SizedBox(height: 8),
        if (items.isEmpty)
          Text(
            placeholder,
            style: theme.textTheme.bodyMedium?.copyWith(
              color: theme.colorScheme.onSurface.withOpacity(0.6),
            ),
          )
        else
          Wrap(
            spacing: 8.0,
            runSpacing: 4.0,
            children: items
                .map((item) => Chip(
                      label: Text(item),
                      backgroundColor: theme.colorScheme.surfaceContainerHighest,
                      side: BorderSide.none,
                      labelStyle: theme.textTheme.bodySmall,
                    ))
                .toList(),
          ),
      ],
    );
  }

  // --- WIDGET BUILDER: "Add Profile" Placeholder ---
  Widget _buildAddProfileCard(BuildContext context, VoidCallback onTap) {
    final theme = Theme.of(context);
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: DottedBorder(
        child: SizedBox(
          height: 100,
          width: double.infinity,
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  LucideIcons.plus,
                  size: 30,
                  color: theme.colorScheme.onSurface.withOpacity(0.5),
                ),
                const SizedBox(height: 8),
                Text(
                  'Add Another Profile (Premium)',
                  style: theme.textTheme.bodyMedium?.copyWith(
                    color: theme.colorScheme.onSurface.withOpacity(0.5),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
