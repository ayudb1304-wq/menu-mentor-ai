import 'dart:async';
import 'dart:convert';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';

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
      // Load ImageProvider
      if (kIsWeb) {
        _imageProvider = NetworkImage(widget.imageFile.path);
      } else {
        _imageProvider = FileImage(File(widget.imageFile.path));
      }

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
      // --- TODO: Upload image and trigger cloud function ---

      // Simulate analysis
      await Future.delayed(const Duration(seconds: 4));

      // Create Fake JSON Result
      const fakeJsonResult = '''
{
  "items": [
    {
      "name": "Spring Rolls",
      "classification": "compliant",
      "reason": "Ingredients are vegan-friendly.",
      "boundingBox": {"xMin": 0.1, "yMin": 0.15, "xMax": 0.8, "yMax": 0.25}
    },
    {
      "name": "Pad Thai",
      "classification": "non-compliant",
      "reason": "Contains peanuts and fish sauce.",
      "boundingBox": {"xMin": 0.1, "yMin": 0.3, "xMax": 0.8, "yMax": 0.4}
    },
    {
      "name": "Green Curry",
      "classification": "modifiable",
      "reason": "Contains shrimp. Can be made with tofu.",
      "boundingBox": {"xMin": 0.1, "yMin": 0.45, "xMax": 0.8, "yMax": 0.55}
    }
  ]
}
''';

      // Parse the JSON
      final parsedResult = AnalysisResult.fromJson(jsonDecode(fakeJsonResult));

      setState(() {
        _analysisResult = parsedResult;
        _isAnalyzing = false;
      });
    } catch (e) {
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
                Text("Extracting menu text... 🔍"),
                Text("Analyzing ingredients... 🧑‍🍳"),
                Text("Checking your profile... 📋"),
              ],
            ),
          ),
        ],
      );
    }

    if (_errorMessage != null) {
      return Padding(
        padding: const EdgeInsets.all(16.0),
        child: Text(
          'Error: $_errorMessage',
          style: const TextStyle(color: Colors.red),
          textAlign: TextAlign.center,
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
