import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';
import 'package:menu_mentor_app/screens/scan_options_screen.dart';
import 'package:menu_mentor_app/screens/profile_screen.dart'; // <-- Our new screen

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
    return Scaffold(
      // The body is just the currently selected screen
      body: Center(
        child: _widgetOptions.elementAt(_selectedIndex),
      ),
      // The 200 IQ Bottom Navigation Bar
      bottomNavigationBar: BottomNavigationBar(
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.home),
            label: 'Home',
          ),
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.history),
            label: 'History',
          ),
          BottomNavigationBarItem(
            icon: Icon(LucideIcons.user),
            label: 'Profile',
          ),
        ],
        currentIndex: _selectedIndex,
        selectedItemColor: Theme.of(context).colorScheme.primary,
        onTap: _onItemTapped,
      ),
    );
  }
}
