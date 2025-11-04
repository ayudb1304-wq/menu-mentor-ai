import 'dart:ui';

/// Centralized color palette for the entire app.
/// This provides a shadcn-inspired color system with light and dark theme support.
class AppColors {
  // Private constructor to prevent instantiation
  AppColors._();

  // Light Theme Colors
  static const Color lightBackground = Color(0xFFFFFFFF);
  static const Color lightPrimaryText = Color(0xFF212529);
  static const Color lightSecondaryText = Color(0xFF6C757D);
  static const Color lightBorder = Color(0xFFE0E0E0);
  static const Color lightCard = Color(0xFFFFFFFF);

  // Dark Theme Colors
  static const Color darkBackground = Color(0xFF121212);
  static const Color darkRaisedGray = Color(0xFF1E1E1E);
  static const Color darkPrimaryText = Color(0xFFE0E0E0);
  static const Color darkSecondaryText = Color(0xFFB0B0B0);
  static const Color darkBorder = Color(0xFF303030);

  // Brand & Action Colors
  static const Color brandBlue = Color(0xFF007BFF);
  static const Color brandGreen = Color(0xFF28A745);

  // Semantic Colors (Data Visualization)
  static const Color semanticGreen = Color(0xFF28A745);
  static const Color semanticOrange = Color(0xFFFD7E14);
  static const Color semanticRed = Color(0xFFDC3545);
}
