import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:menu_mentor_app/screens/scan_options_screen.dart';
import 'package:menu_mentor_app/screens/profile_screen.dart';
import 'package:menu_mentor_app/widgets/animated_tab_bar.dart';
import 'package:menu_mentor_app/theme/app_colors.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  // These are the three screens managed by the nav bar
  static const List<Widget> _widgetOptions = <Widget>[
    ScanOptionsScreen(), // The "Home" tab
    Center(
      child: Text('History (Coming Soon!)', style: TextStyle(fontSize: 18)),
    ),
    ProfileScreen(), // The "Profile" tab
  ];

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isDark = theme.brightness == Brightness.dark;

    // Determine inactive color based on theme
    final inactiveColor = isDark
        ? AppColors.darkSecondaryText
        : AppColors.lightSecondaryText;

    return Scaffold(
      // The body is just the currently selected screen
      body: Center(
        child: _widgetOptions.elementAt(_selectedIndex),
      ),
      // Premium AnimatedTabBar replacing the standard BottomNavigationBar
      bottomNavigationBar: AnimatedTabBar(
        items: [
          TabItem(
            icon: const Icon(LucideIcons.home, size: 24),
            activeColor: AppColors.brandBlue,
            inactiveColor: inactiveColor,
          ),
          TabItem(
            icon: const Icon(LucideIcons.history, size: 24),
            activeColor: AppColors.brandGreen,
            inactiveColor: inactiveColor,
          ),
          TabItem(
            icon: const Icon(LucideIcons.user, size: 24),
            activeColor: AppColors.brandBlue,
            inactiveColor: inactiveColor,
          ),
        ],
        initialIndex: _selectedIndex,
        onTabChange: _onItemTapped,
      ),
    );
  }
}
