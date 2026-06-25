# Animations & Theming

## 1. Implicit Animations

Automatically animate between old and new values. No controller needed.

```dart
// AnimatedContainer — animates all visual properties
AnimatedContainer(
  duration: const Duration(milliseconds: 300),
  curve: Curves.easeInOut,
  width: isExpanded ? 300 : 100,
  height: isExpanded ? 200 : 100,
  decoration: BoxDecoration(
    color: isExpanded ? Colors.blue : Colors.red,
    borderRadius: BorderRadius.circular(isExpanded ? 24 : 12),
    boxShadow: [
      BoxShadow(
        color: Colors.black.withOpacity(isExpanded ? 0.3 : 0.1),
        blurRadius: isExpanded ? 20 : 5,
        offset: Offset(0, isExpanded ? 10 : 2),
      ),
    ],
  ),
  child: const Center(child: Text('Tap me')),
)

// AnimatedOpacity
AnimatedOpacity(
  duration: const Duration(milliseconds: 500),
  opacity: isVisible ? 1.0 : 0.0,
  child: const Text('Fade in/out'),
)

// AnimatedAlign
AnimatedAlign(
  duration: const Duration(milliseconds: 300),
  alignment: isLeft ? Alignment.centerLeft : Alignment.centerRight,
  child: const Icon(Icons.arrow_forward),
)

// AnimatedSwitcher — cross-fade between different widgets
AnimatedSwitcher(
  duration: const Duration(milliseconds: 300),
  transitionBuilder: (child, animation) {
    return FadeTransition(opacity: animation, child: child);
  },
  child: Text(
    '$count',
    key: ValueKey(count), // Key must change for animation!
    style: Theme.of(context).textTheme.headlineLarge,
  ),
)

// AnimatedList
final _listKey = GlobalKey<AnimatedListState>();

AnimatedList(
  key: _listKey,
  initialItemCount: items.length,
  itemBuilder: (context, index, animation) {
    return SlideTransition(
      position: Tween<Offset>(
        begin: const Offset(1, 0),
        end: Offset.zero,
      ).animate(animation),
      child: ListTile(title: Text(items[index])),
    );
  },
)

// Insert with animation
_listKey.currentState?.insertItem(index);

// Remove with animation
_listKey.currentState?.removeItem(
  index,
  (context, animation) => SizeTransition(
    sizeFactor: animation,
    child: ListTile(title: Text(items[index])),
  ),
);
```

### Implicit Animation Widgets
| Widget | Animates |
|---|---|
| `AnimatedContainer` | Size, color, decoration, padding, alignment |
| `AnimatedOpacity` | Opacity |
| `AnimatedPadding` | Padding |
| `AnimatedAlign` | Alignment |
| `AnimatedPositioned` | Position in Stack |
| `AnimatedDefaultTextStyle` | Text style |
| `AnimatedCrossFade` | Cross-fade between two children |
| `AnimatedSwitcher` | Cross-fade between any child swap |
| `AnimatedSize` | Size changes |
| `AnimatedScale` | Scale transform |
| `AnimatedSlide` | Slide offset |
| `AnimatedRotation` | Rotation |

> **Interview Tip**: Use implicit animations for simple property changes. They're the easiest to implement — just set a new value and the widget animates to it.

---

## 2. Explicit Animations

For precise control — use `AnimationController`.

```dart
class PulseAnimation extends StatefulWidget {
  const PulseAnimation({super.key});

  @override
  State<PulseAnimation> createState() => _PulseAnimationState();
}

class _PulseAnimationState extends State<PulseAnimation>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _scaleAnimation;
  late final Animation<double> _opacityAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true); // Loop back and forth

    _scaleAnimation = Tween<double>(begin: 1.0, end: 1.2).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );

    _opacityAnimation = Tween<double>(begin: 1.0, end: 0.5).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeIn),
    );
  }

  @override
  void dispose() {
    _controller.dispose(); // Always dispose!
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: Opacity(
            opacity: _opacityAnimation.value,
            child: child, // Passed-through child doesn't rebuild
          ),
        );
      },
      child: const Icon(Icons.favorite, color: Colors.red, size: 48),
    );
  }
}
```

### AnimationController Methods
| Method | Behavior |
|---|---|
| `forward()` | Animate from 0 → 1 |
| `reverse()` | Animate from 1 → 0 |
| `repeat()` | Loop animation |
| `repeat(reverse: true)` | Ping-pong animation |
| `stop()` | Pause animation |
| `reset()` | Reset to 0 |
| `animateTo(0.5)` | Animate to specific value |

### Staggered Animation
```dart
class StaggeredAnimation extends StatefulWidget {
  @override
  State<StaggeredAnimation> createState() => _StaggeredAnimationState();
}

class _StaggeredAnimationState extends State<StaggeredAnimation>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<double> _slideAnimation;
  late final Animation<double> _fadeAnimation;
  late final Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    );

    // 0.0-0.4: Slide in
    _slideAnimation = Tween(begin: -1.0, end: 0.0).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.0, 0.4, curve: Curves.easeOut)),
    );

    // 0.2-0.6: Fade in
    _fadeAnimation = Tween(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.2, 0.6, curve: Curves.easeIn)),
    );

    // 0.5-1.0: Scale up
    _scaleAnimation = Tween(begin: 0.5, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: const Interval(0.5, 1.0, curve: Curves.elasticOut)),
    );

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(_slideAnimation.value * 200, 0),
          child: Opacity(
            opacity: _fadeAnimation.value,
            child: Transform.scale(scale: _scaleAnimation.value, child: child),
          ),
        );
      },
      child: const Card(child: Padding(
        padding: EdgeInsets.all(32),
        child: Text('Staggered!'),
      )),
    );
  }
}
```

---

## 3. Hero Animations

Shared element transition between screens.

```dart
// Source screen
Hero(
  tag: 'hero-${product.id}', // Must match on both screens
  child: ClipRRect(
    borderRadius: BorderRadius.circular(12),
    child: Image.network(product.imageUrl, width: 100, height: 100, fit: BoxFit.cover),
  ),
)

// Destination screen
Hero(
  tag: 'hero-${product.id}', // Same tag!
  child: Image.network(product.imageUrl, width: double.infinity, height: 300, fit: BoxFit.cover),
)
```

---

## 4. Page Route Transitions

```dart
// Custom page transition
class FadePageRoute<T> extends PageRouteBuilder<T> {
  final Widget page;

  FadePageRoute({required this.page})
      : super(
          transitionDuration: const Duration(milliseconds: 400),
          reverseTransitionDuration: const Duration(milliseconds: 300),
          pageBuilder: (context, animation, secondaryAnimation) => page,
          transitionsBuilder: (context, animation, secondaryAnimation, child) {
            return FadeTransition(
              opacity: CurvedAnimation(parent: animation, curve: Curves.easeInOut),
              child: child,
            );
          },
        );
}

// Slide transition
transitionsBuilder: (context, animation, secondaryAnimation, child) {
  return SlideTransition(
    position: Tween<Offset>(
      begin: const Offset(1.0, 0.0), // Slide from right
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: animation, curve: Curves.easeOutCubic)),
    child: child,
  );
}

// Usage
Navigator.of(context).push(FadePageRoute(page: const DetailScreen()));
```

---

## 5. Theming — ThemeData & Material 3

```dart
class AppTheme {
  // Color Scheme from seed color
  static ThemeData lightTheme() {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: const Color(0xFF6750A4),
      brightness: Brightness.light,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,

      // Typography
      textTheme: GoogleFonts.interTextTheme().copyWith(
        headlineLarge: GoogleFonts.inter(fontWeight: FontWeight.bold),
      ),

      // AppBar
      appBarTheme: AppBarTheme(
        centerTitle: true,
        elevation: 0,
        backgroundColor: colorScheme.surface,
        foregroundColor: colorScheme.onSurface,
        surfaceTintColor: Colors.transparent,
      ),

      // Cards
      cardTheme: CardTheme(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: BorderSide(color: colorScheme.outlineVariant),
        ),
      ),

      // Buttons
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size(double.infinity, 48),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),

      // Input fields
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: colorScheme.surfaceContainerHighest.withOpacity(0.5),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      ),

      // Bottom Nav
      navigationBarTheme: NavigationBarThemeData(
        height: 65,
        labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
        indicatorColor: colorScheme.primaryContainer,
      ),
    );
  }

  static ThemeData darkTheme() {
    final colorScheme = ColorScheme.fromSeed(
      seedColor: const Color(0xFF6750A4),
      brightness: Brightness.dark,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: colorScheme,
      // ... same customizations with dark overrides
    );
  }
}

// Usage in MaterialApp
MaterialApp(
  theme: AppTheme.lightTheme(),
  darkTheme: AppTheme.darkTheme(),
  themeMode: ThemeMode.system, // or .light / .dark
)

// Access theme in widgets
final colorScheme = Theme.of(context).colorScheme;
final textTheme = Theme.of(context).textTheme;

Container(
  color: colorScheme.primaryContainer,
  child: Text('Hello', style: textTheme.headlineMedium?.copyWith(
    color: colorScheme.onPrimaryContainer,
  )),
)
```

### Material 3 Color Roles
| Role | Usage |
|---|---|
| `primary` | Key UI elements (FAB, buttons) |
| `onPrimary` | Text/icons on primary |
| `primaryContainer` | Container backgrounds |
| `onPrimaryContainer` | Text/icons on primaryContainer |
| `secondary` | Less prominent elements |
| `surface` | Background surfaces (cards, sheets) |
| `onSurface` | Text/icons on surfaces |
| `error` | Error states |
| `outline` | Borders, dividers |
| `surfaceContainerHighest` | Elevated surface variant |

### Dynamic Theming
```dart
class ThemeNotifier extends ChangeNotifier {
  ThemeMode _mode = ThemeMode.system;
  Color _seedColor = const Color(0xFF6750A4);

  ThemeMode get mode => _mode;
  Color get seedColor => _seedColor;

  void setMode(ThemeMode mode) {
    _mode = mode;
    notifyListeners();
  }

  void setSeedColor(Color color) {
    _seedColor = color;
    notifyListeners();
  }

  ThemeData get lightTheme => ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(seedColor: _seedColor),
  );

  ThemeData get darkTheme => ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(seedColor: _seedColor, brightness: Brightness.dark),
  );
}
```

---

## 6. Adaptive & Platform-Aware Design

```dart
import 'dart:io' show Platform;

// Platform check
Widget build(BuildContext context) {
  if (Platform.isIOS) {
    return CupertinoButton(child: Text('iOS'), onPressed: () {});
  }
  return FilledButton(onPressed: () {}, child: Text('Android'));
}

// Adaptive icons
Icon(Icons.adaptive.share) // share icon for both platforms

// Adaptive widgets
Switch.adaptive(value: val, onChanged: onChanged) // Material or Cupertino
Slider.adaptive(value: val, onChanged: onChanged)
CircularProgressIndicator.adaptive()

// Responsive layout
class ResponsiveLayout extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth >= 1200) {
          return DesktopLayout();
        } else if (constraints.maxWidth >= 600) {
          return TabletLayout();
        }
        return MobileLayout();
      },
    );
  }
}

// MediaQuery
final screenWidth = MediaQuery.sizeOf(context).width;
final isLandscape = MediaQuery.orientationOf(context) == Orientation.landscape;
final textScale = MediaQuery.textScaleFactorOf(context);
final bottomPadding = MediaQuery.viewPaddingOf(context).bottom; // Safe area
```

> **Interview Tip**: Use `MediaQuery.sizeOf(context)` instead of `MediaQuery.of(context).size` — it only rebuilds when size changes, not when any MediaQuery property changes.

---

## Quick Revision: Animations & Theming

| Type | When to Use | Example |
|---|---|---|
| Implicit | Simple property changes | `AnimatedContainer`, `AnimatedOpacity` |
| Explicit | Full control, looping, staggered | `AnimationController` + `AnimatedBuilder` |
| Hero | Shared element between screens | `Hero(tag: 'id')` |
| Page Transition | Custom route animations | `PageRouteBuilder` |
| `AnimatedSwitcher` | Widget swap animation | Cross-fade between child widgets |
| `AnimatedList` | List add/remove animations | Slide in/out list items |
