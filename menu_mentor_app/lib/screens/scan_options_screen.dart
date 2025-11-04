import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:image_picker/image_picker.dart';
import 'package:menu_mentor_app/screens/analysis_screen.dart';
import 'package:menu_mentor_app/theme/app_colors.dart';

class ScanOptionsScreen extends StatefulWidget {
  const ScanOptionsScreen({super.key});

  @override
  State<ScanOptionsScreen> createState() => _ScanOptionsScreenState();
}

class _ScanOptionsScreenState extends State<ScanOptionsScreen> {
  bool _isLoading = false;

  void _handleScanMenuTap(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (BuildContext bc) {
        return SafeArea(
          child: Wrap(
            children: <Widget>[
              ListTile(
                leading: const Icon(LucideIcons.camera, color: AppColors.brandBlue),
                title: const Text('Take Photo'),
                onTap: () {
                  Navigator.pop(context);
                  _handleImageSourceSelection(context, ImageSource.camera);
                },
              ),
              ListTile(
                leading: const Icon(LucideIcons.image, color: AppColors.brandBlue),
                title: const Text('Choose from Gallery'),
                onTap: () {
                  Navigator.pop(context);
                  _handleImageSourceSelection(context, ImageSource.gallery);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  // --- 2. THIS LOGIC IS UPDATED ---
  void _handleImageSourceSelection(BuildContext context, ImageSource source) async {
    setState(() {
      _isLoading = true;
    });

    final ImagePicker picker = ImagePicker();

    try {
      final XFile? image = await picker.pickImage(source: source);

      if (image != null && context.mounted) {
        // VIBE CHECK: We got the image.
        print('Image picked, path: ${image.path}');

        // --- THIS IS THE FIX ---
        // Instead of a snackbar, we navigate to the AnalysisScreen.
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => AnalysisScreen(
              imageFile: image, // Pass the picked image
            ),
          ),
        );
        // --- END FIX ---
        
      } else {
        // User cancelled the picker
        print('Image picking cancelled.');
      }
    } catch (e) {
      // Handle errors
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Failed to pick image: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      // Hide loading overlay *after* navigation or if it fails
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Scaffold(
      body: Stack(
        children: [
          Center(
            child: Padding(
              padding: const EdgeInsets.all(32.0),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: <Widget>[
                  const Icon(LucideIcons.utensilsCrossed, size: 80.0, color: AppColors.brandGreen),
                  const SizedBox(height: 16),
                  Text(
                    'Menu Mentor',
                    textAlign: TextAlign.center,
                    style: theme.textTheme.headlineMedium?.copyWith(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Dine confidently. Your personal menu guide.',
                    textAlign: TextAlign.center,
                    style: theme.textTheme.titleMedium?.copyWith(color: AppColors.lightSecondaryText),
                  ),
                  const SizedBox(height: 60),
                  ElevatedButton.icon(
                    icon: const Icon(LucideIcons.scanLine),
                    label: const Text('Scan Menu'),
                    onPressed: () => _handleScanMenuTap(context),
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: 18.0),
                      textStyle: theme.textTheme.titleLarge?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
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