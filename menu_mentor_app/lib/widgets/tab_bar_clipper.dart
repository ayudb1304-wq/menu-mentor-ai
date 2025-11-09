import 'package:flutter/material.dart';

/// Custom clipper that creates a smooth semi-circular "bubble" wave
/// This uses a single quadratic Bezier curve with a deep control point
/// to create a true bubble shape that pops out above the tab bar
class TabBarClipper extends CustomClipper<Path> {
  final double wavePop; // The amount the wave "pops" above the bar (e.g., 20.0)
  final double waveDip; // How deep the curve goes (e.g., -40.0, to make it circular)

  TabBarClipper({required this.wavePop, required this.waveDip});

  @override
  Path getClip(Size size) {
    final path = Path();
    final width = size.width;
    final height = size.height;

    // The y-position of the bar's top edge
    final double baseHeight = wavePop;

    // Start at bottom-left
    path.moveTo(0, height);

    // Line to the start of the curve (top-left of the wave area)
    path.lineTo(0, baseHeight);

    // Draw the single, smooth, "bubbly" curve
    // We go from (0, baseHeight) to (width, baseHeight)
    // The control point is in the middle (width / 2)
    // and *far above* the line (waveDip) to pull it into a bubble.
    path.quadraticBezierTo(
      width / 2, // Control point X: center
      waveDip,   // Control point Y: *Deep* (e.g., -40)
      width,     // End point X
      baseHeight // End point Y
    );

    // Line from the end of the curve down to the bottom-right
    path.lineTo(width, height);

    // Close the path
    path.close();
    return path;
  }

  @override
  bool shouldReclip(TabBarClipper oldClipper) =>
      oldClipper.wavePop != wavePop || oldClipper.waveDip != waveDip;
}
