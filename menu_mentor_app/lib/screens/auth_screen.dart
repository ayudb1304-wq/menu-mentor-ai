import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:menu_mentor_app/widgets/social_auth_buttons.dart';
import 'package:menu_mentor_app/services/auth_service.dart';
import 'package:menu_mentor_app/theme/app_colors.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final AuthService _authService = AuthService();
  bool _isLoading = false;

  Future<void> _handleSocialLogin(SocialAuthProvider provider) async {
    // Handle different providers
    if (provider == SocialAuthProvider.google) {
      await _signInWithGoogle();
    } else {
      // Show "Coming Soon" for other providers
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('${provider.name.toUpperCase()} Sign-In coming soon!'),
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }

  Future<void> _signInWithGoogle() async {
    setState(() {
      _isLoading = true;
    });

    try {
      await _authService.signInWithGoogle();
      // Success - AuthWrapper will handle navigation automatically
    } catch (e) {
      // Handle error
      if (!mounted) return;
      setState(() {
        _isLoading = false;
      });

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceAll('Exception: ', '')),
          backgroundColor: Colors.red,
          duration: const Duration(seconds: 4),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Center(
            child: Padding(
              padding: const EdgeInsets.all(28.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    LucideIcons.utensilsCrossed,
                    size: 64,
                    color: AppColors.brandGreen,
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Welcome to Menurai',
                    style: Theme.of(context).textTheme.headlineMedium,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Sign in to save your preferences',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: AppColors.lightSecondaryText,
                        ),
                  ),
                  const SizedBox(height: 48),
                  SocialAuthButtons(
                    onPressed: _handleSocialLogin,
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'By continuing, you agree to our Terms of Service.',
                    textAlign: TextAlign.center,
                    style: Theme.of(context).textTheme.bodySmall,
                  ),
                ],
              ),
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
