import 'package:flutter/material.dart';
import 'package:flutter_vector_icons/flutter_vector_icons.dart';
import 'package:menu_mentor_app/theme/app_colors.dart';

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
  }) {
    return OutlinedButton.icon(
      icon: Icon(icon, size: 18.0, color: AppColors.lightSecondaryText),
      label: Text(label),
      onPressed: () => onPressed(provider),
      style: OutlinedButton.styleFrom(
        minimumSize: const Size(double.infinity, 48),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _buildSocialButton(
          context: context,
          provider: SocialAuthProvider.google,
          icon: MaterialCommunityIcons.google,
          label: 'Continue with Google',
        ),
        const SizedBox(height: 12),
        _buildSocialButton(
          context: context,
          provider: SocialAuthProvider.x,
          icon: MaterialCommunityIcons.twitter,
          label: 'Continue with X',
        ),
        const SizedBox(height: 12),
        _buildSocialButton(
          context: context,
          provider: SocialAuthProvider.facebook,
          icon: MaterialCommunityIcons.facebook,
          label: 'Continue with Facebook',
        ),
        const SizedBox(height: 12),
        _buildSocialButton(
          context: context,
          provider: SocialAuthProvider.github,
          icon: MaterialCommunityIcons.github,
          label: 'Continue with GitHub',
        ),
      ],
    );
  }
}
