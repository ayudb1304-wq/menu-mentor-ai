import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:menu_mentor_app/widgets/animated_tab_bar.dart';

/// Demo screen showcasing the AnimatedTabBar widget
/// Replicates the React demo with 5 tabs and animated background colors
class AnimatedTabBarDemoScreen extends StatefulWidget {
  const AnimatedTabBarDemoScreen({super.key});

  @override
  State<AnimatedTabBarDemoScreen> createState() =>
      _AnimatedTabBarDemoScreenState();
}

class _AnimatedTabBarDemoScreenState extends State<AnimatedTabBarDemoScreen> {
  int _currentIndex = 0;

  // Background colors matching React demo (converted from hex)
  final List<Color> _bgColors = [
    const Color(0xFFFFB457), // #ffb457 - Orange
    const Color(0xFFFF96BD), // #ff96bd - Pink
    const Color(0xFF9999FB), // #9999fb - Purple
    const Color(0xFFFFE797), // #ffe797 - Yellow
    const Color(0xFFCFFFF1), // #cffff1 - Mint
  ];

  late List<TabItem> _tabItems;

  @override
  void initState() {
    super.initState();

    // Initialize tab items with LucideIcons and matching colors
    _tabItems = [
      TabItem(
        icon: const Icon(LucideIcons.menu, size: 24),
        activeColor: const Color(0xFFFF8C00), // #ff8c00
        inactiveColor: Colors.black.withOpacity(0.3),
      ),
      TabItem(
        icon: const Icon(LucideIcons.inbox, size: 24),
        activeColor: const Color(0xFFF54888), // #f54888
        inactiveColor: Colors.black.withOpacity(0.3),
      ),
      TabItem(
        icon: const Icon(LucideIcons.layers, size: 24),
        activeColor: const Color(0xFF4343F5), // #4343f5
        inactiveColor: Colors.black.withOpacity(0.3),
      ),
      TabItem(
        icon: const Icon(LucideIcons.layout, size: 24),
        activeColor: const Color(0xFFE0B115), // #e0b115
        inactiveColor: Colors.black.withOpacity(0.3),
      ),
      TabItem(
        icon: const Icon(LucideIcons.image, size: 24),
        activeColor: const Color(0xFF65DDB7), // #65ddb7
        inactiveColor: Colors.black.withOpacity(0.3),
      ),
    ];
  }

  void _handleTabChange(int index) {
    setState(() {
      _currentIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 400),
      curve: Curves.easeInOut,
      color: _bgColors[_currentIndex],
      child: Scaffold(
        backgroundColor: Colors.transparent,
        appBar: AppBar(
          title: const Text(
            'AnimatedTabBar Demo',
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          backgroundColor: Colors.transparent,
          elevation: 0,
          centerTitle: true,
          iconTheme: const IconThemeData(color: Colors.white),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Large tab number display
              Text(
                'Tab ${_currentIndex + 1}',
                style: const TextStyle(
                  fontSize: 64,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  shadows: [
                    Shadow(
                      color: Colors.black26,
                      offset: Offset(2, 2),
                      blurRadius: 4,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Tab description
              Text(
                _getTabDescription(_currentIndex),
                style: const TextStyle(
                  fontSize: 20,
                  color: Colors.white,
                  fontWeight: FontWeight.w500,
                ),
              ),
              const SizedBox(height: 48),

              // Instructions
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 32,
                  vertical: 16,
                ),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Text(
                  'Tap the tabs below to see the animation',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.white,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ),
        bottomNavigationBar: AnimatedTabBar(
          items: _tabItems,
          initialIndex: _currentIndex,
          onTabChange: _handleTabChange,
        ),
      ),
    );
  }

  String _getTabDescription(int index) {
    switch (index) {
      case 0:
        return 'Menu';
      case 1:
        return 'Inbox';
      case 2:
        return 'Layers';
      case 3:
        return 'Layout';
      case 4:
        return 'Gallery';
      default:
        return '';
    }
  }
}
