import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:menu_mentor_app/theme/app_colors.dart';

class ProfileSetupScreen extends StatefulWidget {
  const ProfileSetupScreen({super.key});

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

  @override
  void initState() {
    super.initState();
    // Initialize all diets as unselected
    for (final diet in _availableDiets) {
      _selectedDiets[diet] = false;
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
    // Step 1: Get current user
    final user = FirebaseAuth.instance.currentUser;
    if (user == null) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error: No user logged in.')),
      );
      return;
    }

    // Step 2: Check loading state
    if (_isLoading) return;
    setState(() {
      _isLoading = true;
    });

    // Step 3: Prepare data
    final List<String> diets = _selectedDiets.entries
        .where((entry) => entry.value == true)
        .map((entry) => entry.key)
        .toList();

    final List<String> restrictions = _restrictionsController.text
        .split(',')
        .map((item) => item.trim())
        .where((item) => item.isNotEmpty)
        .toList();

    // Step 4: Create payload
    final Map<String, dynamic> profileData = {
      'dietaryPresets': diets,
      'customRestrictions': restrictions,
      'profileComplete': true,
      'createdAt': FieldValue.serverTimestamp(),
    };

    // Step 5: Save to Firestore
    try {
      await FirebaseFirestore.instance
          .collection('users')
          .doc(user.uid)
          .set(profileData, SetOptions(merge: true));
      // Success - AuthWrapper will handle navigation
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error saving profile: ${e.toString()}')),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Setup Your Profile'),
        automaticallyImplyLeading: false,
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
                  style: Theme.of(context).textTheme.titleLarge,
                ),
                const SizedBox(height: 16),
                Wrap(
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
                      : const Text('Save Profile & Continue'),
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
