# Scrolling, Slivers & Navigation

## 1. ListView

### Basic ListView
```dart
// Simple list (all children built at once — OK for small lists)
ListView(
  padding: const EdgeInsets.all(16),
  children: [
    ListTile(title: Text('Item 1')),
    ListTile(title: Text('Item 2')),
    ListTile(title: Text('Item 3')),
  ],
)
```

### ListView.builder (Lazy — Preferred for Large Lists)
```dart
ListView.builder(
  itemCount: users.length,
  itemBuilder: (context, index) {
    final user = users[index];
    return ListTile(
      leading: CircleAvatar(child: Text(user.name[0])),
      title: Text(user.name),
      subtitle: Text(user.email),
      trailing: const Icon(Icons.chevron_right),
      onTap: () => _navigateToDetail(user),
    );
  },
)
```

### ListView.separated (With Dividers)
```dart
ListView.separated(
  itemCount: items.length,
  separatorBuilder: (context, index) => const Divider(height: 1),
  itemBuilder: (context, index) => ListTile(title: Text(items[index])),
)
```

> **Interview Tip**: Always use `ListView.builder` for large or dynamic lists. It lazily builds only visible items, not the entire list.

---

## 2. GridView

```dart
// Fixed column count
GridView.count(
  crossAxisCount: 2,
  crossAxisSpacing: 8,
  mainAxisSpacing: 8,
  childAspectRatio: 3 / 4,
  padding: const EdgeInsets.all(8),
  children: products.map((p) => ProductCard(product: p)).toList(),
)

// Fixed max extent (responsive)
GridView.extent(
  maxCrossAxisExtent: 200, // Each item up to 200px wide
  crossAxisSpacing: 8,
  mainAxisSpacing: 8,
  children: products.map((p) => ProductCard(product: p)).toList(),
)

// Builder (lazy, for large grids)
GridView.builder(
  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
    crossAxisCount: 2,
    crossAxisSpacing: 8,
    mainAxisSpacing: 8,
    childAspectRatio: 0.75,
  ),
  itemCount: products.length,
  itemBuilder: (context, index) => ProductCard(product: products[index]),
)

// Responsive grid with maxCrossAxisExtent
GridView.builder(
  gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
    maxCrossAxisExtent: 200,
    crossAxisSpacing: 8,
    mainAxisSpacing: 8,
  ),
  itemCount: items.length,
  itemBuilder: (context, index) => ItemCard(item: items[index]),
)
```

---

## 3. SingleChildScrollView

For scrolling a single child (not a list).

```dart
SingleChildScrollView(
  padding: const EdgeInsets.all(16),
  child: Column(
    children: [
      Image.asset('assets/hero.png'),
      const SizedBox(height: 16),
      Text('Long form content...'),
      // ... more widgets
    ],
  ),
)

// Horizontal scrolling
SingleChildScrollView(
  scrollDirection: Axis.horizontal,
  child: Row(
    children: categories.map((c) => CategoryChip(category: c)).toList(),
  ),
)
```

> **Interview Note**: Don't use `SingleChildScrollView` with a `Column` containing a `ListView`. Use `CustomScrollView` with slivers instead.

---

## 4. CustomScrollView & Slivers

`CustomScrollView` lets you combine different scrollable areas (slivers) into a single scrollable viewport.

```dart
CustomScrollView(
  slivers: [
    // Collapsible app bar
    SliverAppBar(
      expandedHeight: 200,
      floating: false,
      pinned: true,
      flexibleSpace: FlexibleSpaceBar(
        title: const Text('My App'),
        background: Image.network(
          'https://example.com/header.jpg',
          fit: BoxFit.cover,
        ),
      ),
    ),

    // Section header
    SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Text('Featured', style: Theme.of(context).textTheme.headlineSmall),
      ),
    ),

    // Horizontal list inside vertical scroll
    SliverToBoxAdapter(
      child: SizedBox(
        height: 200,
        child: ListView.builder(
          scrollDirection: Axis.horizontal,
          itemCount: featured.length,
          itemBuilder: (context, i) => FeaturedCard(item: featured[i]),
        ),
      ),
    ),

    // Grid section
    SliverGrid(
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        mainAxisSpacing: 8,
        crossAxisSpacing: 8,
      ),
      delegate: SliverChildBuilderDelegate(
        (context, index) => ProductCard(product: products[index]),
        childCount: products.length,
      ),
    ),

    // List section
    SliverList(
      delegate: SliverChildBuilderDelegate(
        (context, index) => ListTile(title: Text(items[index])),
        childCount: items.length,
      ),
    ),

    // Bottom padding
    const SliverPadding(
      padding: EdgeInsets.only(bottom: 80),
      sliver: SliverToBoxAdapter(child: SizedBox.shrink()),
    ),
  ],
)
```

### Sliver Types
| Sliver | Purpose |
|---|---|
| `SliverAppBar` | Collapsible/floating app bar |
| `SliverList` | Scrollable list of items |
| `SliverGrid` | Scrollable grid of items |
| `SliverToBoxAdapter` | Wrap a non-sliver widget |
| `SliverPadding` | Add padding around a sliver |
| `SliverFillRemaining` | Fill remaining viewport space |
| `SliverPersistentHeader` | Header that sticks/shrinks |
| `SliverAnimatedList` | Animated list additions/removals |

### SliverAppBar Modes
| Property | Behavior |
|---|---|
| `floating: true` | Reappears immediately on scroll up |
| `pinned: true` | Stays visible at collapsed size |
| `snap: true` | Snaps to fully expanded/collapsed (requires floating) |
| `stretch: true` | Allows over-scroll stretching |

> **Interview Tip**: Slivers are for **efficient scrollable layouts**. When you need a scrollable page with mixed content (app bars, lists, grids, headers), use `CustomScrollView` with slivers.

---

## 5. Scroll Controllers & Physics

```dart
class _MyListState extends State<MyList> {
  final _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  void _onScroll() {
    // Infinite scroll detection
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      _loadMore();
    }
  }

  void _scrollToTop() {
    _scrollController.animateTo(
      0,
      duration: const Duration(milliseconds: 500),
      curve: Curves.easeOut,
    );
  }

  @override
  void dispose() {
    _scrollController.dispose(); // Always dispose!
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ListView.builder(
      controller: _scrollController,
      physics: const BouncingScrollPhysics(), // iOS-style
      // physics: const ClampingScrollPhysics(), // Android-style
      itemCount: items.length,
      itemBuilder: (context, index) => ListTile(title: Text(items[index])),
    );
  }
}
```

### ScrollPhysics
| Physics | Behavior |
|---|---|
| `BouncingScrollPhysics` | iOS-style bounce at edges |
| `ClampingScrollPhysics` | Android-style clamp at edges |
| `NeverScrollableScrollPhysics` | Disable scrolling |
| `AlwaysScrollableScrollPhysics` | Always scrollable (even if content fits) |
| `PageScrollPhysics` | Snaps to pages |

---

## 6. PageView

```dart
final _pageController = PageController(viewportFraction: 0.9);

PageView.builder(
  controller: _pageController,
  itemCount: onboardingPages.length,
  onPageChanged: (index) => setState(() => _currentPage = index),
  itemBuilder: (context, index) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: OnboardingPage(data: onboardingPages[index]),
    );
  },
)

// Page indicator dots
Row(
  mainAxisAlignment: MainAxisAlignment.center,
  children: List.generate(
    onboardingPages.length,
    (index) => AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      margin: const EdgeInsets.symmetric(horizontal: 4),
      width: _currentPage == index ? 24 : 8,
      height: 8,
      decoration: BoxDecoration(
        color: _currentPage == index ? Colors.blue : Colors.grey,
        borderRadius: BorderRadius.circular(4),
      ),
    ),
  ),
)
```

---

## 7. Navigation — Navigator 1.0 (Imperative)

### Basic Push/Pop
```dart
// Push a new route
Navigator.of(context).push(
  MaterialPageRoute(builder: (context) => const DetailScreen()),
);

// Push and remove all previous routes (e.g., after login)
Navigator.of(context).pushAndRemoveUntil(
  MaterialPageRoute(builder: (context) => const HomeScreen()),
  (route) => false, // Remove all routes
);

// Pop (go back)
Navigator.of(context).pop();

// Pop with result
Navigator.of(context).pop('selectedItem');

// Receive result from popped route
final result = await Navigator.of(context).push<String>(
  MaterialPageRoute(builder: (context) => const SelectionScreen()),
);
if (result != null) {
  // Use result
}

// Replace current route
Navigator.of(context).pushReplacement(
  MaterialPageRoute(builder: (context) => const NewScreen()),
);
```

### Named Routes
```dart
// Define in MaterialApp
MaterialApp(
  routes: {
    '/': (context) => const HomeScreen(),
    '/detail': (context) => const DetailScreen(),
    '/settings': (context) => const SettingsScreen(),
  },
)

// Navigate
Navigator.pushNamed(context, '/detail');

// With arguments
Navigator.pushNamed(context, '/detail', arguments: {'id': '123'});

// Receive arguments
class DetailScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final args = ModalRoute.of(context)!.settings.arguments as Map;
    return Text('ID: ${args['id']}');
  }
}

// Route generation (more flexible)
MaterialApp(
  onGenerateRoute: (settings) {
    if (settings.name == '/user') {
      final userId = settings.arguments as String;
      return MaterialPageRoute(
        builder: (context) => UserScreen(userId: userId),
      );
    }
    return MaterialPageRoute(builder: (context) => const NotFoundScreen());
  },
)
```

> **Interview Note**: Named routes are simple but limited. They don't support type-safe arguments, deep linking well, or complex navigation patterns. For production apps, use `go_router`.

---

## 8. Navigation — go_router (Declarative, Recommended)

```yaml
# pubspec.yaml
dependencies:
  go_router: ^14.0.0
```

### Basic Setup
```dart
final GoRouter router = GoRouter(
  initialLocation: '/',
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomeScreen(),
      routes: [
        // Nested route: /details/:id
        GoRoute(
          path: 'details/:id',
          builder: (context, state) {
            final id = state.pathParameters['id']!;
            return DetailScreen(id: id);
          },
        ),
      ],
    ),
    GoRoute(
      path: '/login',
      builder: (context, state) => const LoginScreen(),
    ),
  ],
  // Redirect (auth guard)
  redirect: (context, state) {
    final isLoggedIn = AuthService.instance.isLoggedIn;
    final isOnLogin = state.matchedLocation == '/login';

    if (!isLoggedIn && !isOnLogin) return '/login';
    if (isLoggedIn && isOnLogin) return '/';
    return null; // No redirect
  },
  // Error page
  errorBuilder: (context, state) => ErrorScreen(error: state.error),
);

// Use in MaterialApp
MaterialApp.router(routerConfig: router)
```

### Navigation with go_router
```dart
// Navigate to route
context.go('/details/123');          // Replaces current stack
context.push('/details/123');        // Pushes onto stack
context.pop();                       // Go back

// With query parameters
context.go('/search?q=flutter&page=1');

// Access query params
final query = state.uri.queryParameters['q'];

// Named routes (type-safe)
GoRoute(
  path: '/user/:id',
  name: 'user',
  builder: (context, state) => UserScreen(id: state.pathParameters['id']!),
)

// Navigate by name
context.goNamed('user', pathParameters: {'id': '123'});
```

### Shell Routes (Persistent Navigation, Tab Bars)
```dart
final router = GoRouter(
  routes: [
    ShellRoute(
      builder: (context, state, child) {
        return ScaffoldWithBottomNav(child: child);
      },
      routes: [
        GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
        GoRoute(path: '/search', builder: (_, __) => const SearchScreen()),
        GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
      ],
    ),
    // Routes outside the shell (no bottom nav)
    GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
  ],
);

class ScaffoldWithBottomNav extends StatelessWidget {
  final Widget child;
  const ScaffoldWithBottomNav({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: NavigationBar(
        selectedIndex: _calculateIndex(GoRouterState.of(context).matchedLocation),
        onDestinationSelected: (index) {
          switch (index) {
            case 0: context.go('/home');
            case 1: context.go('/search');
            case 2: context.go('/profile');
          }
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home), label: 'Home'),
          NavigationDestination(icon: Icon(Icons.search), label: 'Search'),
          NavigationDestination(icon: Icon(Icons.person), label: 'Profile'),
        ],
      ),
    );
  }
}
```

### StatefulShellRoute (Preserves Tab State)
```dart
StatefulShellRoute.indexedStack(
  builder: (context, state, navigationShell) {
    return ScaffoldWithBottomNav(navigationShell: navigationShell);
  },
  branches: [
    StatefulShellBranch(routes: [
      GoRoute(path: '/home', builder: (_, __) => const HomeScreen()),
    ]),
    StatefulShellBranch(routes: [
      GoRoute(path: '/search', builder: (_, __) => const SearchScreen()),
    ]),
    StatefulShellBranch(routes: [
      GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
    ]),
  ],
)
```

### Deep Linking
```dart
// go_router handles deep linking automatically
// Configure in:
// Android: android/app/src/main/AndroidManifest.xml
// iOS: ios/Runner/Info.plist or Associated Domains

// Android
// <intent-filter>
//   <action android:name="android.intent.action.VIEW"/>
//   <category android:name="android.intent.category.DEFAULT"/>
//   <category android:name="android.intent.category.BROWSABLE"/>
//   <data android:scheme="https" android:host="myapp.com"/>
// </intent-filter>

// The router handles: https://myapp.com/details/123 → /details/123
```

> **Interview Tip**: `go_router` is the officially recommended routing package. Key concepts: `go()` (replaces stack), `push()` (adds to stack), `ShellRoute` (persistent UI like bottom nav), `redirect` (auth guards).

---

## Quick Revision: Scrolling & Navigation

| Concept | Use When |
|---|---|
| `ListView.builder` | Long scrollable list (lazy) |
| `GridView.builder` | Scrollable grid (lazy) |
| `CustomScrollView` | Mixed content (app bar + list + grid) |
| `SliverAppBar` | Collapsible/floating app bar |
| `PageView` | Swipeable pages (onboarding, gallery) |
| `Navigator.push` | Simple stack navigation |
| `go_router` | Production apps, deep linking, auth guards |
| `ShellRoute` | Persistent bottom/side navigation |
| `context.go()` | Replace navigation stack |
| `context.push()` | Push onto navigation stack |
