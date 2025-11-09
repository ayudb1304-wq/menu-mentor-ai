import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:collection/collection.dart';
import 'package:menu_mentor_app/theme/app_colors.dart';
import 'package:menu_mentor_app/models/user_profile.dart';

class ProfileSetupScreen extends StatefulWidget {
  final UserProfile? userProfile;

  const ProfileSetupScreen({super.key, this.userProfile});

  @override
  State<ProfileSetupScreen> createState() => _ProfileSetupScreenState();
}

class _ProfileSetupScreenState extends State<ProfileSetupScreen> {
  final List<String> _availableDiets = [
    'Vegan',
    'Vegetarian',
    'Gluten-Free',
    'Dairy-Free',
    'Nut-Free',
    'Keto',
    'Paleo'
  ];
  final Map<String, bool> _selectedDiets = {};
  final TextEditingController _restrictionsController = TextEditingController();
  bool _isLoading = false;

  // NEW state for edit mode
  late Map<String, bool> _initialDietsMap;
  late String _initialRestrictionsText;
  late Timestamp? _lastDietUpdate;
  bool _isDietEditBlocked = false;
  int _daysRemaining = 0;
  bool _isEditMode = false;

  @override
  void initState() {
    super.initState();

    if (widget.userProfile != null) {
      // --- EDIT MODE ---
      _isEditMode = true;
      final profile = widget.userProfile!;

      // 1. Populate diets
      _initialDietsMap = {
        for (var d in _availableDiets) d: profile.dietaryPresets.contains(d)
      };
      _selectedDiets.addAll(_initialDietsMap); // Set current state

      // 2. Populate restrictions
      _initialRestrictionsText = profile.customRestrictions.join(', ');
      _restrictionsController.text = _initialRestrictionsText;

      // 3. CHECK THE LOCK
      _lastDietUpdate = profile.lastDietUpdate;
      if (_lastDietUpdate != null) {
        final now = DateTime.now();
        final lastUpdate = _lastDietUpdate!.toDate();
        final difference = now.difference(lastUpdate);

        // 30-day lock
        const lockDuration = Duration(days: 30);
        if (difference < lockDuration) {
          setState(() {
            _isDietEditBlocked = true;
            _daysRemaining = lockDuration.inDays - difference.inDays;
          });
        }
      }
    } else {
      // --- SETUP MODE (as before) ---
      _isEditMode = false;
      _initialDietsMap = {for (var d in _availableDiets) d: false};
      for (final diet in _availableDiets) {
        _selectedDiets[diet] = false;
      }
      _initialRestrictionsText = '';
      _lastDietUpdate = null;
    }
  }

  @override
  void dispose() {
    _restrictionsController.dispose();
    super.dispose();
  }

  void _toggleDiet(String diet) {
    setState(() {
      _selectedDiets[diet] = !(_selectedDiets[diet] ?? false);
    });
  }

  Future<void> _saveProfile() async {
    if (_isLoading) return;
    setState(() => _isLoading = true);

    // Get current user
    final userId = FirebaseAuth.instance.currentUser?.uid;
    if (userId == null) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error: No user logged in.')),
      );
      setState(() => _isLoading = false);
      return;
    }

    // 1. Get NEW values
    final newDiets = _selectedDiets.entries
        .where((e) => e.value)
        .map((e) => e.key)
        .toList();
    final newRestrictions = _restrictionsController.text
        .split(',')
        .map((s) => s.trim())
        .where((s) => s.isNotEmpty)
        .toList();

    // 2. Get INITIAL values (from state)
    final initialDiets = _initialDietsMap.entries
        .where((e) => e.value)
        .map((e) => e.key)
        .toList();
    final initialRestrictions = _initialRestrictionsText
        .split(',')
        .map((s) => s.trim())
        .where((s) => s.isNotEmpty)
        .toList();

    // 3. Check what *actually* changed
    // We use SetEquality to ignore order
    final eq = const SetEquality();
    final bool dietsChanged =
        !eq.equals(newDiets.toSet(), initialDiets.toSet());
    final bool restrictionsChanged =
        !eq.equals(newRestrictions.toSet(), initialRestrictions.toSet());

    // 4. Build the data map for Firestore
    final Map<String, dynamic> dataToSave = {
      'profileComplete': true,
    };

    if (restrictionsChanged) {
      dataToSave['customRestrictions'] = newRestrictions;
      // No timestamp!
    }

    if (dietsChanged && !_isDietEditBlocked) {
      dataToSave['dietaryPresets'] = newDiets;
      dataToSave['lastDietUpdate'] = FieldValue.serverTimestamp(); // <-- THE LOCK
    }

    // 5. Save to Firestore (only if something changed)
    if (dataToSave.length > 1) {
      // > 1 because profileComplete is always there
      try {
        await FirebaseFirestore.instance
            .collection('users')
            .doc(userId)
            .set(dataToSave, SetOptions(merge: true));

        if (mounted) {
          // Navigate based on mode
          if (_isEditMode) {
            Navigator.pop(context); // Just go back
          } else {
            // In setup mode, AuthWrapper will handle navigation
          }
        }
      } catch (e) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error saving profile: ${e.toString()}')),
        );
      } finally {
        if (mounted) setState(() => _isLoading = false);
      }
    } else {
      // Nothing changed, just close the screen
      if (_isEditMode) Navigator.pop(context);
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      appBar: AppBar(
        title: Text(_isEditMode ? 'Edit Profile' : 'Setup Your Profile'),
        automaticallyImplyLeading: _isEditMode,
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.all(24.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Select Your Diets',
                  style: theme.textTheme.titleLarge,
                ),
                const SizedBox(height: 16),
                // --- ADD THIS LOCK MESSAGE ---
                if (_isDietEditBlocked)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 16.0),
                    child: Text(
                      'You can change your diets again in $_daysRemaining days. '
                      'Allergen/restriction edits are still enabled below.',
                      style: TextStyle(color: theme.colorScheme.error),
                    ),
                  ),
                // --- ADD Opacity AND IgnorePointer ---
                Opacity(
                  opacity: _isDietEditBlocked ? 0.5 : 1.0,
                  child: IgnorePointer(
                    ignoring: _isDietEditBlocked,
                    child: Wrap(
                      spacing: 12.0,
                      runSpacing: 8.0,
                      children: _availableDiets.map((diet) {
                        final isSelected = _selectedDiets[diet] ?? false;
                        return ChoiceChip(
                          label: Text(diet),
                          selected: isSelected,
                          onSelected: (selected) => _toggleDiet(diet),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8.0),
                          ),
                          side: isSelected
                              ? BorderSide.none
                              : const BorderSide(color: AppColors.lightBorder),
                          selectedColor: AppColors.brandBlue,
                          labelStyle: TextStyle(
                            color: isSelected
                                ? Colors.white
                                : AppColors.lightPrimaryText,
                          ),
                          backgroundColor: AppColors.lightBackground,
                          showCheckmark: false,
                        );
                      }).toList(),
                    ),
                  ),
                ),
                const SizedBox(height: 32),
                Text(
                  'Add Allergens & Restrictions',
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 8),
                Text(
                  'Separate items with a comma (e.g., peanuts, shellfish, gluten)',
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: AppColors.lightSecondaryText,
                      ),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _restrictionsController,
                  decoration: const InputDecoration(
                    hintText: 'e.g., peanuts, shellfish, gluten',
                  ),
                ),
                const SizedBox(height: 40),
                ElevatedButton(
                  onPressed: _saveProfile,
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size(double.infinity, 52),
                  ),
                  child: _isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : Text(_isEditMode
                          ? 'Update Profile'
                          : 'Save Profile & Continue'),
                ),
              ],
            ),
          ),
          // Loading overlay
          if (_isLoading)
            Container(
              color: Colors.black.withOpacity(0.5),
              child: const Center(
                child: CircularProgressIndicator(),
              ),
            ),
        ],
      ),
    );
  }
}
