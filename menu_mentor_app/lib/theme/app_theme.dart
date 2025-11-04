import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

/// Centralized theme configuration for light and dark modes.
class AppTheme {
  // Private constructor to prevent instantiation
  AppTheme._();

  /// Returns the light theme configuration
  static ThemeData getLightTheme() {
    final baseTextTheme = GoogleFonts.interTextTheme();

    return ThemeData(
      brightness: Brightness.light,
      scaffoldBackgroundColor: AppColors.lightBackground,
      primaryColor: AppColors.brandBlue,

      // Text Theme
      textTheme: baseTextTheme.copyWith(
        bodyLarge: baseTextTheme.bodyLarge?.copyWith(
          color: AppColors.lightPrimaryText,
        ),
        bodyMedium: baseTextTheme.bodyMedium?.copyWith(
          color: AppColors.lightPrimaryText,
        ),
        bodySmall: baseTextTheme.bodySmall?.copyWith(
          color: AppColors.lightSecondaryText,
        ),
        titleLarge: baseTextTheme.titleLarge?.copyWith(
          color: AppColors.lightPrimaryText,
        ),
        titleMedium: baseTextTheme.titleMedium?.copyWith(
          color: AppColors.lightPrimaryText,
        ),
        headlineMedium: baseTextTheme.headlineMedium?.copyWith(
          color: AppColors.lightPrimaryText,
        ),
        labelSmall: baseTextTheme.labelSmall?.copyWith(
          color: AppColors.lightSecondaryText,
        ),
        labelMedium: baseTextTheme.labelMedium?.copyWith(
          color: AppColors.lightSecondaryText,
        ),
      ),

      // AppBar Theme
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.lightBackground,
        elevation: 0,
        foregroundColor: AppColors.lightPrimaryText,
      ),

      // Elevated Button Theme
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.brandBlue,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8.0),
          ),
          padding: const EdgeInsets.symmetric(vertical: 16.0, horizontal: 24.0),
        ),
      ),

      // Outlined Button Theme
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.lightPrimaryText,
          side: const BorderSide(color: AppColors.lightBorder),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8.0),
          ),
        ),
      ),

      // Input Decoration Theme
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        enabledBorder: OutlineInputBorder(
          borderSide: const BorderSide(color: AppColors.lightBorder),
          borderRadius: BorderRadius.circular(8.0),
        ),
        focusedBorder: OutlineInputBorder(
          borderSide: const BorderSide(color: AppColors.brandBlue),
          borderRadius: BorderRadius.circular(8.0),
        ),
      ),

      // Color Scheme
      colorScheme: const ColorScheme.light(
        primary: AppColors.brandBlue,
        secondary: AppColors.brandGreen,
        error: AppColors.semanticRed,
        background: AppColors.lightBackground,
      ),
    );
  }

  /// Returns the dark theme configuration
  static ThemeData getDarkTheme() {
    final baseTextTheme = GoogleFonts.interTextTheme(ThemeData.dark().textTheme);

    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: AppColors.darkBackground,
      primaryColor: AppColors.brandBlue,

      // Text Theme
      textTheme: baseTextTheme.copyWith(
        bodyLarge: baseTextTheme.bodyLarge?.copyWith(
          color: AppColors.darkPrimaryText,
        ),
        bodyMedium: baseTextTheme.bodyMedium?.copyWith(
          color: AppColors.darkPrimaryText,
        ),
        bodySmall: baseTextTheme.bodySmall?.copyWith(
          color: AppColors.darkSecondaryText,
        ),
        titleLarge: baseTextTheme.titleLarge?.copyWith(
          color: AppColors.darkPrimaryText,
        ),
        titleMedium: baseTextTheme.titleMedium?.copyWith(
          color: AppColors.darkPrimaryText,
        ),
        headlineMedium: baseTextTheme.headlineMedium?.copyWith(
          color: AppColors.darkPrimaryText,
        ),
        labelSmall: baseTextTheme.labelSmall?.copyWith(
          color: AppColors.darkSecondaryText,
        ),
        labelMedium: baseTextTheme.labelMedium?.copyWith(
          color: AppColors.darkSecondaryText,
        ),
      ),

      // AppBar Theme
      appBarTheme: const AppBarTheme(
        backgroundColor: AppColors.darkBackground,
        elevation: 0,
        foregroundColor: AppColors.darkPrimaryText,
      ),

      // Elevated Button Theme
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.brandBlue,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8.0),
          ),
          padding: const EdgeInsets.symmetric(vertical: 16.0, horizontal: 24.0),
        ),
      ),

      // Outlined Button Theme
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          foregroundColor: AppColors.darkPrimaryText,
          side: const BorderSide(color: AppColors.darkBorder),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(8.0),
          ),
        ),
      ),

      // Input Decoration Theme
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.darkRaisedGray,
        enabledBorder: OutlineInputBorder(
          borderSide: const BorderSide(color: AppColors.darkBorder),
          borderRadius: BorderRadius.circular(8.0),
        ),
        focusedBorder: OutlineInputBorder(
          borderSide: const BorderSide(color: AppColors.brandBlue),
          borderRadius: BorderRadius.circular(8.0),
        ),
      ),

      // Card Theme
      cardTheme: const CardTheme(
        color: AppColors.darkRaisedGray,
      ),

      // Bottom Sheet Theme
      bottomSheetTheme: const BottomSheetThemeData(
        backgroundColor: AppColors.darkRaisedGray,
      ),

      // Color Scheme
      colorScheme: const ColorScheme.dark(
        primary: AppColors.brandBlue,
        secondary: AppColors.brandGreen,
        error: AppColors.semanticRed,
        background: AppColors.darkBackground,
        surface: AppColors.darkRaisedGray,
      ),
    );
  }
}
