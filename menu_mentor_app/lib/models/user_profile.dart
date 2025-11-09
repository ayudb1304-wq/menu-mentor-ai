import 'package:cloud_firestore/cloud_firestore.dart';

class UserProfile {
  // Use the *real* field names from Firestore
  final List<String> dietaryPresets;
  final List<String> customRestrictions;
  final Timestamp? lastDietUpdate;

  UserProfile({
    required this.dietaryPresets,
    required this.customRestrictions,
    this.lastDietUpdate,
  });

  factory UserProfile.fromFirestore(Map<String, dynamic> data) {
    return UserProfile(
      // Map from the *exact* Firestore field names
      dietaryPresets: List<String>.from(data['dietaryPresets'] ?? []),
      customRestrictions: List<String>.from(data['customRestrictions'] ?? []),
      lastDietUpdate: data['lastDietUpdate'] as Timestamp?,
    );
  }
}
