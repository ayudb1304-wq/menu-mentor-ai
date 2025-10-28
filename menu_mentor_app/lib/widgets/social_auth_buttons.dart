import 'package:flutter/material.dart';
import 'package:flutter_vector_icons/flutter_vector_icons.dart';

enum SocialAuthProvider { google, x, facebook, github }

class SocialAuthButtons extends StatelessWidget {
  final Function(SocialAuthProvider provider) onPressed;

  const SocialAuthButtons({
    super.key,
    required this.onPressed,
  });

  // Reusable Button builder
  Widget _buildSocialButton({
    required BuildContext context,
    required SocialAuthProvider provider,
    required IconData icon,
    required String label,
    required Color backgroundColor,
    required Color foregroundColor,
  }) {
    return ElevatedButton.icon(
      icon: Icon(icon, size: 18.0, color: foregroundColor.withOpacity(0.8)),
      label: Text(label),
      onPressed: () => onPressed(provider),
      style: ElevatedButton.styleFrom(
        backgroundColor: backgroundColor,
        foregroundColor: foregroundColor,
        minimumSize: const Size(double.infinity, 48), // Full width, good height
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8.0)),
        textStyle: const TextStyle(fontSize: 15, fontWeight: FontWeight.w500),
        elevation: 1,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildSocialButton(
          context: context, provider: SocialAuthProvider.google,
          icon: MaterialCommunityIcons.google, label: 'Login with Google',
          backgroundColor: const Color(0xFFDB4437), foregroundColor: Colors.white,
        ),
        const SizedBox(height: 12),
        _buildSocialButton(
          context: context, provider: SocialAuthProvider.x,
          icon: MaterialCommunityIcons.twitter, label: 'Login with X', // Update icon if needed
          backgroundColor: const Color(0xFF14171A), foregroundColor: Colors.white,
        ),
         const SizedBox(height: 12),
        _buildSocialButton(
          context: context, provider: SocialAuthProvider.facebook,
          icon: MaterialCommunityIcons.facebook, label: 'Login with Facebook',
          backgroundColor: const Color(0xFF1877F2), foregroundColor: Colors.white,
        ),
        const SizedBox(height: 12),
        _buildSocialButton(
          context: context, provider: SocialAuthProvider.github,
          icon: MaterialCommunityIcons.github, label: 'Login with GitHub',
          backgroundColor: const Color(0xFF333333), foregroundColor: Colors.white,
        ),
      ],
    );
  }
}
