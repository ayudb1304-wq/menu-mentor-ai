import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_storage/firebase_storage.dart';
import 'package:cloud_functions/cloud_functions.dart';

// Placeholder imports (widgets don't exist yet)
// import 'package:menu_mentor_app/models/analysis_result.dart';
// import 'package:menu_mentor_app/widgets/menu_analysis_results.dart';
// import 'package:menu_mentor_app/widgets/text_loop.dart';

// --- PLACEHOLDERS ---
// These models are required by the MenuAnalysisResults widget.
class AnalysisResult {
  final List<AnalysisItem> items;
  AnalysisResult({required this.items});
  factory AnalysisResult.fromJson(Map<String, dynamic> json) {
    var itemsList = json['items'] as List;
    List<AnalysisItem> items = itemsList.map((i) => AnalysisItem.fromJson(i)).toList();
    return AnalysisResult(items: items);
  }
}

class AnalysisItem {
  final String name;
  final String classification;
  final String? reason;
  final BoundingBox boundingBox;
  AnalysisItem({required this.name, required this.classification, this.reason, required this.boundingBox});
  factory AnalysisItem.fromJson(Map<String, dynamic> json) {
    return AnalysisItem(
      name: json['name'],
      classification: json['classification'],
      reason: json['reason'],
      boundingBox: BoundingBox.fromJson(json['boundingBox']),
    );
  }
}

class BoundingBox {
  final double xMin, yMin, xMax, yMax;
  BoundingBox({required this.xMin, required this.yMin, required this.xMax, required this.yMax});
  factory BoundingBox.fromJson(Map<String, dynamic>? json) {
    if (json == null) return BoundingBox(xMin: 0, yMin: 0, xMax: 0, yMax: 0);
    return BoundingBox(
      xMin: (json['xMin'] ?? 0.0).toDouble(),
      yMin: (json['yMin'] ?? 0.0).toDouble(),
      xMax: (json['xMax'] ?? 0.0).toDouble(),
      yMax: (json['yMax'] ?? 0.0).toDouble(),
    );
  }
  Rect toRelativeRect() => Rect.fromLTRB(xMin, yMin, xMax, yMax);
}

// Placeholder TextLoop widget
class TextLoop extends StatefulWidget {
  final List<Widget> children;
  const TextLoop({super.key, required this.children});

  @override
  State<TextLoop> createState() => _TextLoopState();
}

class _TextLoopState extends State<TextLoop> {
  int _currentIndex = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _timer = Timer.periodic(const Duration(seconds: 2), (timer) {
      setState(() {
        _currentIndex = (_currentIndex + 1) % widget.children.length;
      });
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedSwitcher(
      duration: const Duration(milliseconds: 500),
      child: Container(
        key: ValueKey<int>(_currentIndex),
        child: widget.children[_currentIndex],
      ),
    );
  }
}

// Placeholder MenuAnalysisResults widget
class MenuAnalysisResults extends StatelessWidget {
  final ImageProvider imageProvider;
  final AnalysisResult analysisResult;
  final Size originalImageSize;

  const MenuAnalysisResults({
    super.key,
    required this.imageProvider,
    required this.analysisResult,
    required this.originalImageSize,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        children: [
          // Display the menu image
          Container(
            constraints: BoxConstraints(maxHeight: 400),
            child: Image(image: imageProvider, fit: BoxFit.contain),
          ),
          const SizedBox(height: 16),
          // Display analysis results
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Analysis Results',
                  style: Theme.of(context).textTheme.headlineSmall,
                ),
                const SizedBox(height: 16),
                ...analysisResult.items.map((item) {
                  Color statusColor;
                  IconData statusIcon;
                  switch (item.classification) {
                    case 'compliant':
                      statusColor = Colors.green;
                      statusIcon = Icons.check_circle;
                      break;
                    case 'non-compliant':
                      statusColor = Colors.red;
                      statusIcon = Icons.cancel;
                      break;
                    case 'modifiable':
                      statusColor = Colors.orange;
                      statusIcon = Icons.warning;
                      break;
                    default:
                      statusColor = Colors.grey;
                      statusIcon = Icons.help;
                  }

                  return Card(
                    margin: const EdgeInsets.only(bottom: 12),
                    child: ListTile(
                      leading: Icon(statusIcon, color: statusColor, size: 32),
                      title: Text(item.name, style: const TextStyle(fontWeight: FontWeight.bold)),
                      subtitle: Text(item.reason ?? ''),
                      trailing: Chip(
                        label: Text(
                          item.classification.toUpperCase(),
                          style: const TextStyle(fontSize: 10),
                        ),
                        backgroundColor: statusColor.withOpacity(0.2),
                      ),
                    ),
                  );
                }).toList(),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
// --- END PLACEHOLDERS ---

class AnalysisScreen extends StatefulWidget {
  final XFile imageFile;

  const AnalysisScreen({super.key, required this.imageFile});

  @override
  State<AnalysisScreen> createState() => _AnalysisScreenState();
}

class _AnalysisScreenState extends State<AnalysisScreen> {
  final String _storageBucketId = 'menu-mentor-prod.firebasestorage.app'; // REPLACE THIS

  bool _isAnalyzing = true;
  AnalysisResult? _analysisResult;
  String? _errorMessage;
  ImageProvider? _imageProvider;
  Size? _originalImageSize;

  @override
  void initState() {
    super.initState();
    _initializeScreen();
  }

  Future<void> _initializeScreen() async {
    try {
      // Load ImageProvider (cross-platform using bytes)
      final bytes = await widget.imageFile.readAsBytes();
      _imageProvider = MemoryImage(bytes);

      // Get Image Dimensions
      final imageSize = await _getImageDimensions(_imageProvider!);
      setState(() {
        _originalImageSize = imageSize;
      });

      // Run Analysis
      _runAnalysis();
    } catch (e) {
      setState(() {
        _errorMessage = 'Error loading image: $e';
        _isAnalyzing = false;
      });
    }
  }

  Future<Size> _getImageDimensions(ImageProvider provider) {
    final completer = Completer<Size>();
    final stream = provider.resolve(const ImageConfiguration());
    stream.addListener(ImageStreamListener((ImageInfo info, bool _) {
      completer.complete(Size(
        info.image.width.toDouble(),
        info.image.height.toDouble(),
      ));
    }));
    return completer.future;
  }

  Future<void> _runAnalysis() async {
    setState(() {
      _isAnalyzing = true;
      _errorMessage = null;
    });

    try {
      // Get current user
      final user = FirebaseAuth.instance.currentUser;
      if (user == null) {
        throw Exception('No user logged in');
      }

      // Define upload path
      final timestamp = DateTime.now().millisecondsSinceEpoch;
      final fileName = '${timestamp}_${widget.imageFile.name}';
      final uploadPath = 'uploads/${user.uid}/$fileName';

      // Read bytes from XFile (works on all platforms including web)
      final bytes = await widget.imageFile.readAsBytes();

      // Upload image to Firebase Storage using putData
      final storageRef = FirebaseStorage.instance.ref().child(uploadPath);
      final uploadTask = await storageRef.putData(bytes);

      // Construct gs:// path
      final gsPath = 'gs://$_storageBucketId/${uploadTask.ref.fullPath}';

      // Fetch user profile from Firestore
      final userDoc = await FirebaseFirestore.instance
          .collection('users')
          .doc(user.uid)
          .get();

      if (!userDoc.exists) {
        throw Exception('User profile not found');
      }

      final userData = userDoc.data()!;

      // Build userProfile map
      final userProfile = {
        'diets': userData['dietaryPresets'] ?? [],
        'restrictions': userData['customRestrictions'] ?? [],
      };

      // Call analyzeMenu Cloud Function
      final callable = FirebaseFunctions.instance.httpsCallable('analyzeMenu');
      final result = await callable.call({
        'imageUrl': gsPath,
        'userProfile': userProfile,
      });

      // Parse result
      final parsedResult = AnalysisResult.fromJson(result.data as Map<String, dynamic>);

      setState(() {
        _analysisResult = parsedResult;
        _isAnalyzing = false;
      });
    } on FirebaseFunctionsException catch (e) {
      print('FirebaseFunctionsException - Code: ${e.code}, Message: ${e.message}, Details: ${e.details}');
      setState(() {
        _errorMessage = 'Function error: ${e.message ?? e.code}';
        _isAnalyzing = false;
      });
    } catch (e) {
      print('Error during analysis: $e');
      setState(() {
        _errorMessage = 'Error during analysis: $e';
        _isAnalyzing = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Analyzing Menu...'),
      ),
      body: Center(
        child: _buildBody(),
      ),
    );
  }

  Widget _buildBody() {
    if (_isAnalyzing) {
      return Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(),
          const SizedBox(height: 20),
          DefaultTextStyle(
            style: Theme.of(context).textTheme.titleMedium!,
            textAlign: TextAlign.center,
            child: const TextLoop(
              children: [
                Text("Uploading menu... ☁️"),
                Text("Analyzing ingredients... 🧠"),
                Text("Checking your profile... 🧑‍🔬"),
                Text("Building your results... 🪄"),
              ],
            ),
          ),
        ],
      );
    }

    if (_errorMessage != null) {
      return Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              color: Colors.red,
              size: 80,
            ),
            const SizedBox(height: 16),
            Text(
              'Analysis Failed',
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
            const SizedBox(height: 8),
            Text(
              _errorMessage!,
              style: const TextStyle(color: Colors.red),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Try Again'),
            ),
          ],
        ),
      );
    }

    if (_analysisResult != null && _imageProvider != null && _originalImageSize != null) {
      return MenuAnalysisResults(
        imageProvider: _imageProvider!,
        analysisResult: _analysisResult!,
        originalImageSize: _originalImageSize!,
      );
    }

    // This is the state while the image dimensions are loading
    return const Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        CircularProgressIndicator(),
        SizedBox(height: 16),
        Text('Loading image...'),
      ],
    );
  }
}
