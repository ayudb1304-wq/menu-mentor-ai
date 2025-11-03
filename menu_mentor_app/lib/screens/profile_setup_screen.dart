import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

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
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Select any presets that apply to you.',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 16),
                Wrap(
                  spacing: 12.0,
                  runSpacing: 8.0,
                  children: _availableDiets.map((diet) {
                    return FilterChip(
                      label: Text(diet),
                      selected: _selectedDiets[diet] ?? false,
                      onSelected: (bool selected) {
                        setState(() {
                          _selectedDiets[diet] = selected;
                        });
                      },
                      selectedColor: Theme.of(context).colorScheme.primary,
                      checkmarkColor: Theme.of(context).colorScheme.onPrimary,
                      labelStyle: TextStyle(
                        color: _selectedDiets[diet] ?? false
                            ? Theme.of(context).colorScheme.onPrimary
                            : Theme.of(context).colorScheme.onSurface,
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 32),
                Text(
                  'Add Allergens & Restrictions',
                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                ),
                const SizedBox(height: 8),
                Text(
                  'Separate items with a comma (e.g., peanuts, shellfish, sesame).',
                  style: Theme.of(context).textTheme.bodyMedium,
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _restrictionsController,
                  decoration: const InputDecoration(
                    hintText: 'e.g., peanuts, shellfish, sesame',
                    border: OutlineInputBorder(),
                  ),
                ),
                const SizedBox(height: 40),
                Center(
                  child: ElevatedButton(
                    onPressed: _saveProfile,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 48,
                        vertical: 16,
                      ),
                      textStyle: Theme.of(context).textTheme.titleMedium,
                    ),
                    child: const Text('Save Profile & Continue'),
                  ),
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
