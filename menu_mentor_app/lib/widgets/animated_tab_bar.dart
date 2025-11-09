import 'package:flutter/material.dart';
import 'package:menu_mentor_app/theme/app_colors.dart';
import 'package:menu_mentor_app/widgets/tab_bar_clipper.dart';

/// Model class for tab bar items
/// Accepts any Widget for maximum flexibility (Icon, CustomPaint, SvgPicture, etc.)
class TabItem {
  final Widget icon;
  final Color activeColor; // This will be the wave/bubble color
  final Color inactiveColor;

  TabItem({
    required this.icon,
    required this.activeColor,
    this.inactiveColor = AppColors.lightSecondaryText,
  });
}

/// Premium animated tab bar with a "bubble wave"
/// Features a smooth wave that slides and "pops out,"
/// and the active icon animates "up" into the wave.
class AnimatedTabBar extends StatefulWidget {
  final List<TabItem> items;
  final Function(int index) onTabChange;
  final int initialIndex;

  const AnimatedTabBar({
    super.key,
    required this.items,
    required this.onTabChange,
    this.initialIndex = 0,
  }) : assert(items.length >= 2, 'AnimatedTabBar requires at least 2 items');

  @override
  State<AnimatedTabBar> createState() => _AnimatedTabBarState();
}

class _AnimatedTabBarState extends State<AnimatedTabBar>
    with SingleTickerProviderStateMixin {
  late int _activeIndex;
  late AnimationController _animationController;
  final List<GlobalKey> _itemKeys = [];
  double _waveOffset = 0.0; // This is the wave's horizontal position
  bool _isInitialized = false;

  // --- Dimensions ---
  // The bar itself
  static const double _barHeight = 60.0;
  // The "pop-out" bubble
  static const double _waveHeight = 80.0; // Total height of the wave widget
  static const double _waveWidth = 100.0;  // Width of the wave

  // How much the wave "pops" above the bar
  static const double _wavePop = _waveHeight - _barHeight; // 20.0
  // How deep the curve goes. Making it negative and > pop creates the bubble.
  static const double _waveDip = -40.0;
  // How much the icon "pops" up
  static const double _iconLift = -18.0;

  @override
  void initState() {
    super.initState();
    _activeIndex = widget.initialIndex;

    for (int i = 0; i < widget.items.length; i++) {
      _itemKeys.add(GlobalKey());
    }

    _animationController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );

    WidgetsBinding.instance.addPostFrameCallback((_) {
      _updateWavePosition();
      setState(() => _isInitialized = true);
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  /// Calculates the position of the sliding wave
  void _updateWavePosition() {
    if (!mounted) return;

    final RenderBox? activeBox =
        _itemKeys[_activeIndex].currentContext?.findRenderObject() as RenderBox?;
    final RenderBox? menuBox = context.findRenderObject() as RenderBox?;

    if (activeBox != null && menuBox != null) {
      final activeItemPosition = activeBox.localToGlobal(Offset.zero);
      final menuPosition = menuBox.localToGlobal(Offset.zero);

      // Get the center of the active item
      final activeItemCenter =
          activeItemPosition.dx - menuPosition.dx + (activeBox.size.width / 2);

      setState(() {
        _waveOffset = activeItemCenter - (_waveWidth / 2);
      });
    }
  }

  /// Handles tab item click
  void _handleTabChange(int index) {
    if (_activeIndex == index) return;

    setState(() {
      _activeIndex = index;
    });

    _animationController.forward(from: 0.0);
    _updateWavePosition();
    widget.onTabChange(index);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    final barBackgroundColor =
        isDark ? AppColors.darkRaisedGray : AppColors.lightCard;
    final defaultInactiveColor = isDark
        ? AppColors.darkSecondaryText
        : AppColors.lightSecondaryText;

    // The whole widget must be tall enough to contain the popped-out wave
    return SizedBox(
      height: _waveHeight,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          // 1. Main bar background (Static)
          // Positioned at the BOTTOM of the SizedBox
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              height: _barHeight,
              decoration: BoxDecoration(
                color: barBackgroundColor,
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 10,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
            ),
          ),

          // 2. Sliding "Bubble Wave" (Animated)
          AnimatedPositioned(
            duration: const Duration(milliseconds: 300),
            curve: Curves.easeInOut,
            left: _waveOffset,
            bottom: 0, // Aligned with the bottom of the main bar
            child: Opacity(
              opacity: _isInitialized ? 1.0 : 0.0,
              child: ClipPath(
                clipper: TabBarClipper(
                  wavePop: _wavePop,
                  waveDip: _waveDip,
                ),
                child: Container(
                  width: _waveWidth,
                  height: _waveHeight,
                  decoration: BoxDecoration(
                    color: widget.items[_activeIndex].activeColor,
                    boxShadow: [
                      BoxShadow(
                        color: widget.items[_activeIndex].activeColor
                            .withOpacity(0.3),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),

          // 3. Tab items row (Icons)
          // This MUST be on top of the wave
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              crossAxisAlignment: CrossAxisAlignment.center,
              children: List.generate(
                widget.items.length,
                (index) => _buildTabItem(index, defaultInactiveColor),
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// Builds an individual tab item
  Widget _buildTabItem(int index, Color defaultInactiveColor) {
    final item = widget.items[index];
    final isActive = _activeIndex == index;
    final iconColor = isActive ? Colors.white : item.inactiveColor;

    return Expanded(
      key: _itemKeys[index],
      child: GestureDetector(
        onTap: () => _handleTabChange(index),
        behavior: HitTestBehavior.opaque,
        // This SizedBox must be tall enough for the lifted icon
        child: SizedBox(
          height: _waveHeight,
          child: Center(
            // This is the icon-lift magic
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              transform: isActive
                  ? Matrix4.translationValues(0, _iconLift, 0)
                  : Matrix4.identity(),
              child: IconTheme(
                data: IconThemeData(
                  color: iconColor,
                  size: 26,
                ),
                child: item.icon,
              ),
            ),
          ),
        ),
      ),
    );
  }
}
