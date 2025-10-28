import 'package:flutter/material.dart';
import 'package:menu_mentor_app/widgets/social_auth_buttons.dart';

class AuthScreen extends StatelessWidget {
  const AuthScreen({super.key});

  void _handleSocialLogin(SocialAuthProvider provider) {
    print('Attempting login with: ${provider.name}');
    // --- Implement Firebase Auth logic here ---
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Welcome'),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                'Sign In / Sign Up',
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 40),
              SocialAuthButtons(
                onPressed: _handleSocialLogin,
              ),
              const SizedBox(height: 30),
              const Text(
                'By continuing, you agree to our Terms of Service.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 12, color: Colors.grey),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
