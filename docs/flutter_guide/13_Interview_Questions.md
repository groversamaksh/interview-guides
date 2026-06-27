# Flutter Interview Questions — 150 Questions with Answers

## Section A: Core Flutter (Q1–Q30)

### Q1. What is Flutter and how does it differ from React Native?
Flutter is Google's UI toolkit for building natively compiled applications from a single codebase. Key differences:

| Aspect | Flutter | React Native |
|---|---|---|
| Language | Dart | JavaScript |
| Rendering | Own engine (Skia/Impeller) | Native platform views |
| Bridge | No bridge (compiled to native) | JS bridge / JSI |
| UI Components | Custom widgets (pixel-perfect) | Wraps native components |
| Hot Reload | Sub-second | Sub-second |
| Performance | Near-native | Near-native (with JSI) |
| OEM Widgets | Does NOT use OEM widgets | Uses OEM widgets |

### Q2. Explain Flutter's architecture layers.
```
┌─────────────────────────────────────┐
│         Framework (Dart)            │  ← Widgets, Rendering, Material/Cupertino
├─────────────────────────────────────┤
│         Engine (C/C++)              │  ← Skia/Impeller, Dart Runtime, Platform Channels
├─────────────────────────────────────┤
│       Embedder (Platform-specific)  │  ← Android Activity, iOS UIViewController
└─────────────────────────────────────┘
```
- **Framework**: Material/Cupertino widgets, rendering, animation, gestures
- **Engine**: Skia (2D graphics), Dart VM, text layout, platform channels
- **Embedder**: Platform-specific entry point, surface management

### Q3. What is the difference between `StatelessWidget` and `StatefulWidget`?
- **StatelessWidget**: Immutable. `build()` depends only on constructor params. No internal mutable state. Use for static UI.
- **StatefulWidget**: Has a companion `State` object that persists across rebuilds. Use when the widget needs to change over time (user input, animations, API data).

### Q4. Explain the Widget tree, Element tree, and RenderObject tree.
| Tree | Purpose | Lifespan |
|---|---|---|
| Widget | Blueprint/configuration | Immutable, recreated on rebuild |
| Element | Manager linking Widget ↔ RenderObject | Persistent, reused across rebuilds |
| RenderObject | Handles layout, painting, hit-testing | Persistent, updated in place |

Widgets are cheap configuration objects. Elements decide whether to create a new RenderObject or update an existing one. RenderObjects do the expensive layout and paint work.

### Q5. What is BuildContext?
`BuildContext` is the Element's position in the widget tree. It's used to:
- Find ancestor widgets (`Theme.of(context)`, `Navigator.of(context)`)
- Access inherited data (`MediaQuery.of(context)`)
- Show overlays (`showDialog`, `ScaffoldMessenger`)

**Important**: Don't use BuildContext across async gaps — the widget may have been unmounted.

### Q6. What are Keys and when should you use them?
Keys preserve state when widgets move in the tree. Types:
- **ValueKey**: For unique business value (`ValueKey(user.id)`)
- **ObjectKey**: For unique object identity
- **UniqueKey**: Force recreation (new key each time)
- **GlobalKey**: Access state/widget from anywhere (expensive, use sparingly)

**Use Keys when**: Reordering lists, swapping widgets of the same type, preserving state in `AnimatedList`, `ListView.builder` with reorderable items.

### Q7. What happens when `setState()` is called?
1. The callback runs synchronously, modifying state variables
2. The Element is marked as "dirty"
3. Flutter schedules a frame
4. During the next frame, `build()` is called on the dirty element
5. The new widget tree is compared (reconciled) with the old tree
6. Only changed RenderObjects are updated

### Q8. What is the difference between `const` and `final` in Flutter widgets?
- `final`: Runtime constant. Value assigned once, can be a computed value.
- `const`: Compile-time constant. The widget and all its parameters must be const-evaluable. `const` widgets are canonicalized — identical instances are shared in memory and never rebuild.

```dart
const Text('Hello')     // Compile-time, shared, never rebuilt
final text = Text(name) // Runtime, new instance each build
```

### Q9. Explain the Flutter rendering pipeline.
```
User Input / setState()
  → Build Phase (rebuild widgets)
    → Layout Phase (calculate sizes & positions)
      → Paint Phase (generate display list)
        → Compositing (layer tree → GPU)
          → Rasterization (pixels on screen)
```
Target: 16ms per frame (60fps) or 8ms (120fps).

### Q10. What is the difference between `mainAxisAlignment` and `crossAxisAlignment`?
- **mainAxisAlignment**: Alignment along the primary axis (horizontal for Row, vertical for Column)
- **crossAxisAlignment**: Alignment perpendicular to the primary axis

| Property | Row | Column |
|---|---|---|
| `mainAxisAlignment` | Horizontal | Vertical |
| `crossAxisAlignment` | Vertical | Horizontal |

### Q11. Explain Flutter's constraint system.
> **"Constraints go down, sizes go up, parent sets position."**

1. Parent passes constraints (min/max width & height) to child
2. Child decides its size within those constraints
3. Parent decides child's position

A widget's size is always between `constraints.minWidth` and `constraints.maxWidth` (same for height).

### Q12. What is `LayoutBuilder` and when do you use it?
`LayoutBuilder` provides the parent's constraints to its builder function, enabling responsive layouts:
```dart
LayoutBuilder(
  builder: (context, constraints) {
    if (constraints.maxWidth > 600) return WideLayout();
    return NarrowLayout();
  },
)
```
Use for responsive designs, adaptive grids, or when child sizing depends on available space.

### Q13. What is `IntrinsicHeight` / `IntrinsicWidth` and why should you use them sparingly?
They force a child to size itself to its intrinsic dimensions. This requires a two-pass layout (first to measure, then to lay out), making it O(2^N) in deeply nested trees. Use `CrossAxisAlignment.stretch` or explicit sizing as alternatives.

### Q14. What is a `Sliver` and when should you use it?
Slivers are scrollable area building blocks that support lazy loading. Use when:
- You need a custom scrollable layout
- Combining different scrolling behaviors (app bar + list + grid)
- Building collapsible/stretching headers

Common slivers: `SliverList`, `SliverGrid`, `SliverAppBar`, `SliverToBoxAdapter`, `SliverPersistentHeader`.

### Q15. Explain `Navigator 1.0` vs `Navigator 2.0` vs `go_router`.
| Feature | Navigator 1.0 | Navigator 2.0 | go_router |
|---|---|---|---|
| Style | Imperative (push/pop) | Declarative (pages list) | Declarative (simplified) |
| Deep Linking | Manual | Built-in | Built-in |
| Web Support | Poor | Good | Good |
| Complexity | Low | Very High | Medium |
| Recommended | Simple apps | Rarely used directly | Production apps |

### Q16. What is `go_router`?
Google's recommended routing package. Declarative URL-based routing with:
- Path parameters (`/user/:id`)
- Query parameters
- Nested routes & `ShellRoute`
- Redirect guards
- Deep linking out of the box

### Q17. What are `GlobalKey` use cases and risks?
**Use cases**: Accessing a widget's `State` from outside, form validation (`GlobalKey<FormState>`), scroll position preservation.
**Risks**: Expensive (bypasses tree diffing), can cause memory leaks if not disposed, breaks widget identity if misused.

### Q18. Explain `MediaQuery` vs `LayoutBuilder`.
| | MediaQuery | LayoutBuilder |
|---|---|---|
| **Scope** | Entire screen metrics | Parent's constraints only |
| **Data** | Screen size, padding, orientation, text scale | maxWidth, maxHeight, minWidth, minHeight |
| **When** | Global responsive decisions | Local responsive layouts |

### Q19. What is `RepaintBoundary`?
Wraps a subtree in its own compositing layer, isolating it from repaint. When a sibling changes, the subtree inside `RepaintBoundary` doesn't repaint. Use for: charts, animations, expensive custom paints.

### Q20. What is `CustomPaint` and `CustomPainter`?
`CustomPaint` provides a canvas for drawing custom graphics. `CustomPainter` has `paint(Canvas, Size)` and `shouldRepaint()` methods. Used for charts, signatures, game UIs, custom shapes.

### Q21. Explain the lifecycle of a `StatefulWidget`.
```
createState() → initState() → didChangeDependencies() → build()
  → [didUpdateWidget() → build()]*
  → deactivate() → dispose()
```
- `initState()`: Once. Initialize state, controllers, subscriptions.
- `didChangeDependencies()`: When InheritedWidget changes.
- `didUpdateWidget()`: When parent rebuilds with new config.
- `deactivate()`: Widget removed from tree (may re-insert).
- `dispose()`: Permanent removal. Clean up controllers, listeners.

### Q22. Difference between `dispose()` and `deactivate()`?
- `deactivate()`: Called when widget is removed from tree but may be reinserted (e.g., moved via GlobalKey). Rarely overridden.
- `dispose()`: Permanent cleanup. Cancel subscriptions, dispose controllers, close streams. **Always call `super.dispose()`**.

### Q23. What are `Tween` and `AnimationController`?
- **AnimationController**: Generates values from 0.0→1.0 over a duration. Requires `TickerProvider` (vsync).
- **Tween**: Maps the controller's 0.0→1.0 range to any value range (e.g., `Tween(begin: 0, end: 300)`).
- **CurvedAnimation**: Applies an easing curve to the controller.

### Q24. Implicit vs Explicit animations — when to use each?
- **Implicit** (`AnimatedContainer`, `AnimatedOpacity`): For simple property transitions. Just set new values.
- **Explicit** (`AnimationController` + `Tween`): For looping, staggered, or chained animations. Full control.

### Q25. What is a `Hero` animation?
A shared element transition. A widget with the same `Hero tag` on two screens automatically animates between them during navigation. Flutter calculates the size/position difference and animates the transition.

### Q26. What is `Isolate` in Flutter?
Dart runs on a single thread. For heavy computation (image processing, JSON parsing large data), use `Isolate` — a separate thread with its own memory. Communication via message passing (`SendPort`/`ReceivePort`). Use `compute()` for simple cases.

### Q27. What is `compute()` function?
A simplified Isolate API for running a single function on a background isolate:
```dart
final result = await compute(parseJsonList, rawJson);
```
Limitations: Function must be top-level or static. Arguments and return value must be serializable.

### Q28. What is `FutureBuilder` and `StreamBuilder`?
| | FutureBuilder | StreamBuilder |
|---|---|---|
| Data source | `Future<T>` | `Stream<T>` |
| Updates | Once (when Future completes) | Multiple times (each emission) |
| Use case | One-time API call | Real-time data (WebSocket, Firestore) |

**Caveat**: Don't create Futures/Streams inside `build()` — it restarts on every rebuild. Create in `initState()` or use state management.

### Q29. What is `ValueNotifier` and `ValueListenableBuilder`?
A lightweight reactive primitive. `ValueNotifier` holds a single value and notifies listeners when it changes.
```dart
final counter = ValueNotifier<int>(0);
ValueListenableBuilder<int>(
  valueListenable: counter,
  builder: (context, value, child) => Text('$value'),
)
```
Use for simple, single-value reactivity without full state management.

### Q30. What are `mixin` and `with` in Flutter context?
Mixins add behavior to classes without inheritance. Flutter uses them extensively:
- `SingleTickerProviderStateMixin`: Provides `vsync` for one AnimationController
- `TickerProviderStateMixin`: For multiple controllers
- `AutomaticKeepAliveClientMixin`: Keep tab state alive
- `WidgetsBindingObserver`: Observe app lifecycle

---

## Section B: State Management (Q31–Q55)

### Q31. What is state management and why do we need it?
State management is the practice of handling data that can change over time and ensuring the UI reflects that data. Without it, sharing data between distant widgets requires "prop drilling" — passing data through constructors across many layers.

### Q32. What is `InheritedWidget`?
The foundational primitive for propagating data down the widget tree. `Theme.of(context)`, `MediaQuery.of(context)`, and Provider all build on InheritedWidget. It uses `updateShouldNotify` to control when dependents rebuild.

### Q33. What is Provider?
A wrapper around InheritedWidget that simplifies state management. Key concepts:
- `ChangeNotifierProvider`: Provides a `ChangeNotifier` model
- `Consumer`: Rebuilds when model changes
- `context.watch<T>()`: Listen + rebuild
- `context.read<T>()`: One-time read (for callbacks)
- `context.select<T, R>()`: Listen to specific property

### Q34. `context.watch` vs `context.read` vs `context.select`?
| Method | Rebuilds? | When to Use |
|---|---|---|
| `watch<T>()` | Yes, on any change | In `build()` for reactive UI |
| `read<T>()` | No | In callbacks (`onPressed`) |
| `select<T, R>()` | Only when selected value changes | Granular rebuilds |

**Rule**: Never use `read` in `build()`. Never use `watch` in callbacks.

### Q35. What is Riverpod and how is it better than Provider?
Riverpod is the evolution of Provider with these advantages:
- **Compile-safe**: No `ProviderNotFoundException` at runtime
- **No BuildContext needed**: Providers are global, testable
- **AutoDispose**: Automatic cleanup of unused providers
- **Family**: Parameterized providers
- **Testable**: Override providers easily in tests

### Q36. List Riverpod provider types.
| Provider | Use Case |
|---|---|
| `Provider` | Read-only computed value |
| `StateProvider` | Simple mutable state |
| `FutureProvider` | Async data (one-shot) |
| `StreamProvider` | Stream-based data |
| `NotifierProvider` | Complex synchronous state |
| `AsyncNotifierProvider` | Complex async state |

### Q37. What is `ref.watch` vs `ref.read` vs `ref.listen` in Riverpod?
- `ref.watch(provider)`: Reactive. Rebuilds widget when provider changes. Use in `build()`.
- `ref.read(provider)`: Non-reactive one-time read. Use in callbacks.
- `ref.listen(provider, callback)`: Executes callback on changes without rebuilding. Use for side effects (navigation, snackbar).

### Q38. What is `autoDispose` in Riverpod?
Automatically disposes a provider when no widgets are listening to it. Prevents memory leaks. The provider state is recreated next time it's watched.
```dart
final searchProvider = FutureProvider.autoDispose.family<List<Result>, String>(...);
```

### Q39. What is Bloc pattern?
**B**usiness **Lo**gic **C**omponent. A predictable state management pattern:
```
Event → Bloc → State
```
- **Events**: Input triggers (button tap, API response)
- **Bloc**: Processes events, emits new states
- **States**: Output that the UI renders

Enforces unidirectional data flow and separation of concerns.

### Q40. Bloc vs Cubit — when to use which?
| | Cubit | Bloc |
|---|---|---|
| API | Call methods → emit states | Add events → on handlers → emit states |
| Traceability | Low | High (events are logged) |
| Boilerplate | Less | More |
| Use | Simple state changes | Complex flows with multiple triggers |

### Q41. What is `BlocBuilder` vs `BlocListener` vs `BlocConsumer`?
- **BlocBuilder**: Rebuilds UI based on state. For rendering.
- **BlocListener**: Executes side effects (navigation, snackbar, dialog). No rebuild.
- **BlocConsumer**: Combines both — side effects + UI rebuild.

### Q42. How do you test a Bloc?
```dart
blocTest<CounterBloc, int>(
  'emits [1] when increment is added',
  build: () => CounterBloc(),
  act: (bloc) => bloc.add(IncrementEvent()),
  expect: () => [1],
);
```
Use `bloc_test` package. Mock repositories and verify event → state transitions.

### Q43. What are `Equatable` and why use it with Bloc?
`Equatable` overrides `==` and `hashCode` based on properties. Bloc uses equality to determine if a new state differs from the current state. Without Equatable, identical states would still trigger rebuilds.

### Q44. How do you handle loading/error/success states?
Use sealed classes:
```dart
sealed class UserState {}
class UserLoading extends UserState {}
class UserLoaded extends UserState { final User user; }
class UserError extends UserState { final String message; }
```
Or with Freezed unions for generated `when()`/`map()` methods.

### Q45. What is `MultiBlocProvider`?
Nests multiple `BlocProvider`s for cleaner code:
```dart
MultiBlocProvider(
  providers: [
    BlocProvider(create: (_) => AuthBloc()),
    BlocProvider(create: (_) => ThemeBloc()),
  ],
  child: MyApp(),
)
```

### Q46. Explain `ChangeNotifier` vs `ValueNotifier`.
- **ChangeNotifier**: Can notify about any change. Call `notifyListeners()` manually.
- **ValueNotifier**: A `ChangeNotifier` that holds a single value. Auto-notifies when `value` is set.

### Q47. What is the `Selector` widget in Provider?
Prevents unnecessary rebuilds by selecting a specific value from the model:
```dart
Selector<CartModel, int>(
  selector: (_, cart) => cart.itemCount,
  builder: (_, count, __) => Text('$count'),
)
```
Only rebuilds when `itemCount` changes, not on every cart modification.

### Q48. How does Provider differ from GetX?
| | Provider | GetX |
|---|---|---|
| Architecture | Follows Flutter conventions | Own conventions |
| Testing | Excellent | Difficult |
| Community | Official recommendation | Large but controversial |
| Learning Curve | Low | Very Low |
| Separation of Concerns | Enforced | Optional |

### Q49. What is `ProxyProvider`?
Creates a provider that depends on other providers:
```dart
ProxyProvider<AuthService, ApiService>(
  update: (_, auth, __) => ApiService(token: auth.token),
)
```
Rebuilds when the dependency changes.

### Q50. Can you use multiple state management solutions together?
Yes, and it's common. Example:
- Provider/Riverpod for DI (services, repositories)
- Bloc for complex feature-level business logic
- setState for local UI state (animations, toggles)

### Q51. What is the difference between `StateProvider` and `NotifierProvider` in Riverpod?
- **StateProvider**: For simple state (int, bool, enum). Updated via `ref.read(provider.notifier).state = newValue`.
- **NotifierProvider**: For complex state with methods. Extends `Notifier<T>` with custom methods.

Use `NotifierProvider` when state updates involve logic beyond simple assignment.

### Q52. How do you handle side effects in Riverpod?
Use `ref.listen()`:
```dart
ref.listen(authProvider, (previous, next) {
  if (next is AuthError) showSnackBar(context, next.message);
  if (next is AuthAuthenticated) context.go('/home');
});
```

### Q53. What are `StateNotifier` vs `Notifier` in Riverpod?
- **StateNotifier** (v1): Separate class, state updated via `state = newState`. Being deprecated.
- **Notifier** (v2): Integrated with Riverpod, uses `build()` method for initial state. Recommended for new code.

### Q54. How do you scope providers in Riverpod?
Use `ProviderScope` with overrides:
```dart
ProviderScope(
  overrides: [apiUrlProvider.overrideWithValue('https://staging.api.com')],
  child: MyApp(),
)
```
Useful for testing and flavor-based configuration.

### Q55. What is `AsyncValue` in Riverpod?
A sealed class representing async states: `AsyncData`, `AsyncLoading`, `AsyncError`. Used with `when()` for exhaustive handling:
```dart
ref.watch(usersProvider).when(
  data: (users) => UserList(users),
  loading: () => CircularProgressIndicator(),
  error: (e, st) => Text('Error: $e'),
);
```

---

## Section C: Networking, Storage & Backend (Q56–Q75)

### Q56. How do you make HTTP requests in Flutter?
Using `http` package for simple requests or `dio` for advanced features (interceptors, cancel tokens, upload progress).

### Q57. What is `Dio` and why prefer it over `http`?
| Feature | http | Dio |
|---|---|---|
| Interceptors | ❌ | ✅ |
| Cancel Requests | ❌ | ✅ (CancelToken) |
| Upload Progress | ❌ | ✅ |
| Retry Logic | Manual | Via interceptor |
| FormData | Manual | Built-in |
| Global Config | Manual | BaseOptions |

### Q58. What are Dio interceptors and give use cases?
Interceptors intercept requests/responses/errors globally:
- **Auth interceptor**: Attach token to every request, refresh on 401
- **Logging interceptor**: Log all network activity
- **Retry interceptor**: Retry failed requests with exponential backoff
- **Cache interceptor**: Cache GET responses

### Q59. How do you handle API errors in Flutter?
```dart
try {
  final response = await dio.get('/users');
} on DioException catch (e) {
  switch (e.type) {
    case DioExceptionType.connectionTimeout: // ...
    case DioExceptionType.badResponse:
      final statusCode = e.response?.statusCode;
      // Map to domain exception
  }
}
```
Use a centralized error handler that maps HTTP errors to domain exceptions.

### Q60. What is the Repository pattern?
An abstraction layer between data sources and business logic:
```
UI → Bloc/Notifier → Repository (abstract) → Data Source (API / DB)
```
Benefits: Testable (mock repository), swappable data sources, offline fallback, caching.

### Q61. How do you implement offline-first architecture?
1. Always save API responses locally (Hive/SQLite)
2. On request, try remote first → cache on success
3. On failure, fallback to cached data
4. For writes, save locally + queue for sync
5. Sync pending changes when connectivity returns

### Q62. Compare local storage options in Flutter.
| Storage | Type | Encrypted | Best For |
|---|---|---|---|
| SharedPreferences | Key-value | ❌ | Settings, flags |
| Hive | NoSQL | Optional | Structured data, offline cache |
| sqflite | SQL | ❌ | Relational data |
| Isar | NoSQL | ❌ | Large datasets, queries |
| drift | Type-safe SQL | ❌ | Complex relational queries |
| flutter_secure_storage | Key-value | ✅ | Tokens, passwords |

### Q63. When should you use SQLite vs Hive?
- **SQLite**: Relational data, complex joins/queries, large datasets, existing SQL knowledge
- **Hive**: Fast key-value or object storage, simple queries, offline caching, quick setup

### Q64. What is `flutter_secure_storage` and when to use it?
Encrypted storage using Keychain (iOS) and Keystore (Android). Use for: JWT tokens, refresh tokens, API keys, passwords, biometric data. Never store sensitive data in SharedPreferences.

### Q65. How do you serialize JSON in Flutter?
Three approaches:
1. **Manual**: `fromJson()`/`toJson()` factory methods
2. **json_serializable**: Code generation with `@JsonSerializable()`
3. **Freezed**: Full data class generation (copyWith, equality, JSON)

### Q66. What is `json_serializable` and how does it work?
Add `@JsonSerializable()` annotation → run `build_runner` → generates `.g.dart` files with `_$ModelFromJson()` and `_$ModelToJson()`. Use `@JsonKey(name:)` for field name mapping.

### Q67. What is Freezed and why use it?
Code generator that creates immutable data classes with:
- `copyWith()` for immutable updates
- Value equality (`==`)
- `toString()` override
- JSON serialization (with json_serializable)
- Sealed unions for state classes

### Q68. How do you upload files with progress in Flutter?
```dart
final formData = FormData.fromMap({
  'file': await MultipartFile.fromFile(path, filename: 'photo.jpg'),
});
await dio.post('/upload', data: formData, onSendProgress: (sent, total) {
  print('${(sent / total * 100).toStringAsFixed(0)}%');
});
```

### Q69. How do you handle pagination in Flutter?
- **Offset pagination**: `?page=2&limit=20`
- **Cursor pagination**: `?after=cursor_id&limit=20`

Implementation: Use `ScrollController` with listener, detect when near bottom (`position.pixels >= position.maxScrollExtent - threshold`), load next page.

### Q70. What is WebSocket and how to use in Flutter?
```dart
final channel = WebSocketChannel.connect(Uri.parse('wss://echo.websocket.org'));
channel.stream.listen((message) => print(message));
channel.sink.add('Hello!');
```
Use for real-time features: chat, live updates, stock prices.

### Q71. How does Firebase Firestore differ from Realtime Database?
| | Firestore | Realtime Database |
|---|---|---|
| Data Model | Documents & Collections | JSON tree |
| Queries | Complex (compound, pagination) | Simple (limited filtering) |
| Offline | Built-in | Built-in |
| Scaling | Better | Limited |
| Pricing | Per read/write | Per bandwidth |

### Q72. How do you implement real-time data with Firestore?
```dart
FirebaseFirestore.instance
    .collection('messages')
    .orderBy('timestamp', descending: true)
    .limit(50)
    .snapshots()
    .listen((snapshot) {
  final messages = snapshot.docs.map((doc) => Message.fromFirestore(doc)).toList();
});
```

### Q73. What are Firestore security rules?
Server-side rules that control read/write access:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Q74. How do you implement push notifications in Flutter?
1. Add `firebase_messaging` package
2. Request permission (`FirebaseMessaging.instance.requestPermission()`)
3. Get FCM token for device
4. Handle foreground messages with `FirebaseMessaging.onMessage`
5. Handle background with `FirebaseMessaging.onBackgroundMessage` (top-level function)
6. Handle notification taps with `FirebaseMessaging.onMessageOpenedApp`

### Q75. How do you handle deep linking in Flutter?
Using `go_router`:
```dart
GoRouter(routes: [
  GoRoute(path: '/product/:id', builder: (_, state) =>
    ProductPage(id: state.pathParameters['id']!)),
])
```
Configure Android (`AndroidManifest.xml` intent-filters) and iOS (`Info.plist` associated domains).

---

## Section D: UI & Layout (Q76–Q95)

### Q76. What is `Expanded` vs `Flexible`?
- `Expanded`: Forces child to fill remaining space (`flex: 1`, `fit: FlexFit.tight`)
- `Flexible`: Allows child to take up to remaining space but can be smaller (`fit: FlexFit.loose`)

### Q77. What is `SizedBox` vs `Container`?
- `SizedBox`: Lightweight, only sets size constraints. Preferred for spacing.
- `Container`: Heavier, combines padding, margin, decoration, color, constraints, transform.

Use `SizedBox(height: 16)` for spacing, `Container` when you need decoration/padding.

### Q78. How do you create responsive layouts?
1. `LayoutBuilder` — adapt based on parent constraints
2. `MediaQuery.sizeOf(context)` — screen-level decisions
3. `Expanded`/`Flexible` — proportional sizing
4. `AspectRatio` — maintain proportions
5. `FractionallySizedBox` — percentage-based sizing

### Q79. What is `Stack` and when to use it?
Overlapping widgets. Children are positioned relative to the Stack edges using `Positioned`. Use for: overlays, badges, floating labels, custom card designs.

### Q80. `Padding` vs `Container` with padding?
`Padding` is lighter. Use `Container` only when you also need decoration, color, or margins. `Padding(padding: EdgeInsets.all(16), child: ...)` is preferred over `Container(padding: ..., child: ...)`.

### Q81. What is `SafeArea`?
Insets child by the system UI (notch, status bar, navigation bar, rounded corners). Essential for full-screen designs to prevent content from being clipped.

### Q82. What is `FittedBox`?
Scales and positions its child to fit within the parent's constraints. Common use: prevent text overflow by scaling down:
```dart
FittedBox(fit: BoxFit.scaleDown, child: Text(longText))
```

### Q83. What is `Wrap` vs `Row`?
- `Row`: Single line. Overflows if children exceed width.
- `Wrap`: Wraps children to the next line when space runs out. Use for tag chips, skill badges.

### Q84. How do you handle text overflow?
```dart
Text(
  longText,
  overflow: TextOverflow.ellipsis,  // ... at end
  maxLines: 2,                       // Limit lines
)
```

### Q85. What is `ClipRRect` vs `ClipOval`?
- `ClipRRect`: Clips to rounded rectangle (`borderRadius`)
- `ClipOval`: Clips to circle/ellipse
- `ClipPath`: Clips to custom path

### Q86. What is `Scaffold` and its key properties?
Material design screen structure:
- `appBar`: Top app bar
- `body`: Main content
- `floatingActionButton`: FAB
- `drawer` / `endDrawer`: Side navigation
- `bottomNavigationBar`: Bottom nav
- `bottomSheet`: Persistent bottom sheet

### Q87. What is `CustomScrollView`?
A scrollable area that combines multiple slivers:
```dart
CustomScrollView(
  slivers: [
    SliverAppBar(expandedHeight: 200, floating: true),
    SliverList(delegate: SliverChildBuilderDelegate(...)),
    SliverGrid(delegate: ..., gridDelegate: ...),
  ],
)
```

### Q88. What is `SliverAppBar` and its modes?
| Property | Behavior |
|---|---|
| `floating: true` | Appears when scrolling up slightly |
| `pinned: true` | Stays visible at top |
| `snap: true` | Snaps fully open/closed |
| `expandedHeight` | Height when fully expanded |
| `flexibleSpace` | Content in expanded area |

### Q89. What is `showModalBottomSheet` vs `showBottomSheet`?
- `showModalBottomSheet`: Overlay with scrim. Blocks interaction with content behind.
- `showBottomSheet`: Inline, no scrim. Content behind remains interactive.

### Q90. What is `Form` and `FormState`?
`Form` groups `TextFormField` widgets. `FormState` provides `validate()`, `save()`, and `reset()` methods. Access via `GlobalKey<FormState>`.

### Q91. What is `GestureDetector` vs `InkWell`?
- `GestureDetector`: Raw gesture handling. No visual feedback.
- `InkWell`: Material ripple effect + gesture handling. Use for tappable Material widgets.

### Q92. What is `OrientationBuilder`?
Rebuilds when device orientation changes:
```dart
OrientationBuilder(
  builder: (context, orientation) {
    return GridView.count(
      crossAxisCount: orientation == Orientation.portrait ? 2 : 4,
    );
  },
)
```

### Q93. How do you implement pull-to-refresh?
Wrap a scrollable widget with `RefreshIndicator`:
```dart
RefreshIndicator(
  onRefresh: () async => await loadData(),
  child: ListView.builder(...),
)
```

### Q94. What is `InteractiveViewer`?
Enables pan, zoom, and rotate gestures on a child widget. Use for images, maps, or diagrams that need zoom/pan support.

### Q95. What is `Semantics` and accessibility in Flutter?
`Semantics` describes a widget's meaning for screen readers. Flutter automatically generates semantics for Material widgets. Add custom semantics for `CustomPaint` and visual-only widgets:
```dart
Semantics(
  label: 'Profile picture of John',
  child: CircleAvatar(backgroundImage: NetworkImage(url)),
)
```

---

## Section E: Advanced Topics (Q96–Q125)

### Q96. What are Platform Channels?
Communication bridge between Dart and native code (Kotlin/Swift):
- **MethodChannel**: Two-way method calls
- **EventChannel**: Stream of events from native to Dart
- **BasicMessageChannel**: Raw message passing

### Q97. When would you use Platform Channels?
- Accessing native APIs not available in Flutter (Bluetooth, NFC, sensors)
- Using existing native SDKs
- Platform-specific functionality (iOS HealthKit, Android Work Manager)
- Performance-critical operations in native code

### Q98. What is Pigeon?
A type-safe code generator for platform channels. Generates Dart, Kotlin, Swift, and Objective-C code from a Dart interface definition. Eliminates manual string-based channel names and casting.

### Q99. How do you handle app lifecycle events?
```dart
class _MyPageState extends State<MyPage> with WidgetsBindingObserver {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    switch (state) {
      case AppLifecycleState.resumed:    // Foreground
      case AppLifecycleState.inactive:   // Transitioning
      case AppLifecycleState.paused:     // Background
      case AppLifecycleState.detached:   // Terminated
      case AppLifecycleState.hidden:     // Hidden (desktop)
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }
}
```

### Q100. What is `Isolate` and `compute()`?
- **Isolate**: Independent execution thread with own memory. Communication via `SendPort`/`ReceivePort`.
- **compute()**: Simplified API for running a single function on a background isolate.

Use for: heavy JSON parsing, image processing, cryptographic operations, complex algorithms.

### Q101. How does Flutter achieve 60fps/120fps rendering?
Flutter skips platform UI frameworks entirely. It:
1. Renders directly to a Skia/Impeller canvas
2. Manages its own compositing and rasterization
3. Uses the GPU for rendering
4. Targets 16ms/frame (60fps) or 8ms (120fps)

### Q102. What is Impeller vs Skia?
| | Skia | Impeller |
|---|---|---|
| Type | 2D graphics library | Flutter's new rendering engine |
| Shader Compilation | At runtime (causes jank) | Pre-compiled at build time |
| Performance | Good but shader jank on first run | Smooth from first frame |
| Platform | All platforms | iOS default, Android preview |

### Q103. What is tree shaking?
Dart compiler removes unused code during AOT compilation. Keeps binary size small. Only code reachable from `main()` is included. Works automatically — no manual configuration needed.

### Q104. AOT vs JIT compilation in Flutter?
| | JIT | AOT |
|---|---|---|
| Mode | Debug | Release |
| Speed | Slower execution | Fast execution |
| Feature | Hot reload | No hot reload |
| Size | Larger | Optimized |
| Startup | Slower | Faster |

### Q105. What is the Element lifecycle in detail?
```
Widget.createElement() → Element.mount()
  → Element.performRebuild() → Element.update() (on parent rebuild)
  → Element.deactivate() (removed from tree)
  → Element.unmount() (garbage collected)
```
Elements are the persistent workers that manage the link between Widget blueprints and RenderObjects.

### Q106. How does Flutter handle gestures and hit-testing?
1. Touch event arrives from platform
2. Flutter walks the RenderObject tree (back-to-front)
3. Each RenderObject's `hitTest()` checks if the point is within its bounds
4. Matching objects are collected in a `HitTestResult` list
5. `GestureArena` resolves conflicts when multiple detectors match

### Q107. What is the `GestureArena`?
When multiple `GestureDetector`s compete for the same pointer event, the `GestureArena` resolves which one wins. Rules:
- First recognizer to claim victory wins
- Others are rejected
- Disambiguated by gesture type (tap vs drag vs long press)

### Q108. What is `Ticker` and `TickerProvider`?
A `Ticker` fires a callback every frame (~60x/second). `TickerProvider` creates Tickers for `AnimationController`. Mixins:
- `SingleTickerProviderStateMixin`: One controller
- `TickerProviderStateMixin`: Multiple controllers

### Q109. What is `SchedulerBinding`?
Manages frame scheduling. Key methods:
- `addPostFrameCallback`: Run after current frame renders
- `addPersistentFrameCallback`: Run every frame
- `scheduleFrame`: Request a new frame

### Q110. How do you implement deep linking?
1. Define routes in `go_router` with path parameters
2. Android: Add intent filters in `AndroidManifest.xml`
3. iOS: Configure Associated Domains and `apple-app-site-association`
4. Handle initial link: `GoRouter` handles this automatically
5. Test with `adb shell am start -a android.intent.action.VIEW -d "myapp://product/123"`

### Q111. What is Method Channel flow in detail?
```
Dart: MethodChannel('com.app/battery').invokeMethod('getBatteryLevel')
  → Platform Channel (binary messenger)
    → Native: MethodChannel handler (Kotlin/Swift)
      → Native API call
        → Result sent back via channel
          → Dart receives Future<dynamic> result
```

### Q112. What is `PlatformView`?
Embeds native platform views (Android View/iOS UIView) inside Flutter widget tree:
- `AndroidView` / `UiKitView`
- Use for: Google Maps, WebView, native ad SDKs
- Performance cost — use sparingly

### Q113. What are `WidgetBindings` and when are they useful?
`WidgetsFlutterBinding.ensureInitialized()` initializes the binding between Flutter framework and the engine. Required before `runApp()` if you call native code (Firebase, SharedPreferences) in `main()`.

### Q114. What is `RenderObject` and when would you create one?
The object that handles layout and painting. You rarely create custom ones. Do it when:
- You need a completely custom layout algorithm
- Performance-critical custom rendering
- Existing widgets can't achieve the desired behavior

### Q115. What is `CompositedTransformTarget` / `CompositedTransformFollower`?
A pair of widgets where the follower's position tracks the target's position across layers. Use for: tooltips, dropdown menus, overlay popups that follow a widget.

### Q116. What is `BackdropFilter` and how does it work?
Applies a filter (blur, color matrix) to everything painted beneath it:
```dart
BackdropFilter(
  filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
  child: Container(color: Colors.white.withOpacity(0.2)),
)
```
Use for: frosted glass effects, blurred backgrounds. Performance-heavy.

### Q117. What is Flutter Flavors?
Build variants for different environments (dev, staging, production). Each flavor can have different:
- App name and icon
- API base URL
- Firebase project
- Feature flags

### Q118. What is `flutter_localizations` and i18n?
Internationalization support. Steps:
1. Add `flutter_localizations` dependency
2. Create `.arb` files for each locale
3. Run code generation
4. Use `AppLocalizations.of(context)!.helloWorld` for translated strings

### Q119. What is `BuildOwner`?
Manages the build lifecycle. Tracks dirty elements, schedules rebuilds, and processes the build queue. There's typically one per `WidgetsBinding`.

### Q120. How do you handle memory leaks in Flutter?
Common causes and fixes:
1. **Undisposed controllers**: Always dispose `TextEditingController`, `AnimationController`, `ScrollController`
2. **Active listeners**: Remove listeners in `dispose()`
3. **Stream subscriptions**: Cancel in `dispose()`
4. **Closures capturing context**: Don't use BuildContext across async gaps
5. **Global state holding widget references**: Use WeakReference or proper cleanup

### Q121. What is `OverlayEntry`?
Inserts a widget above everything else in the app (above Scaffold, AppBar, etc.). Use for: custom tooltips, floating UI, toasts, onboarding highlights.

### Q122. How does `flutter build` differ across platforms?
| Command | Output |
|---|---|
| `flutter build apk` | Android APK |
| `flutter build appbundle` | Android App Bundle (Play Store) |
| `flutter build ipa` | iOS archive |
| `flutter build web` | Static web files |
| `flutter build macos` | macOS app |
| `flutter build linux` | Linux binary |

### Q123. What is code push / OTA updates (Shorebird)?
Updates Dart code without going through the app store review process. Shorebird patches the Dart runtime AOT snapshot. Limitations: Can't change native code, assets, or native dependencies.

### Q124. What is Flutter's garbage collection?
Dart uses a generational garbage collector:
- **Young generation**: Short-lived objects (widget rebuilds) → fast collection
- **Old generation**: Long-lived objects → mark-sweep
Flutter widgets are designed to be short-lived, aligning with the young-gen GC for efficiency.

### Q125. What is the difference between `runApp` and `WidgetsFlutterBinding`?
- `runApp(widget)`: Initializes binding + attaches widget to screen. Calls `WidgetsFlutterBinding.ensureInitialized()` internally.
- `WidgetsFlutterBinding.ensureInitialized()`: Only initializes binding. Call explicitly when you need bindings before `runApp` (e.g., Firebase init).

---

## Section F: Testing & Architecture (Q126–Q150)

### Q126. What is the testing pyramid in Flutter?
```
        ╱╲
       ╱  ╲         Integration Tests (few, slow, high confidence)
      ╱────╲
     ╱      ╲       Widget Tests (some, medium speed)
    ╱────────╲
   ╱          ╲     Unit Tests (many, fast, low cost)
  ╱────────────╲
```

### Q127. What is `testWidgets` and `WidgetTester`?
`testWidgets` creates a test environment for widget testing. `WidgetTester` provides:
- `pumpWidget()`: Render a widget
- `pump()`: Trigger a frame
- `pumpAndSettle()`: Wait for all animations to complete
- `tap()`, `enterText()`, `drag()`: Simulate interactions

### Q128. What are finders in widget testing?
```dart
find.text('Hello')        // Find by text
find.byType(ElevatedButton) // Find by widget type
find.byKey(Key('login'))  // Find by key
find.byIcon(Icons.add)    // Find by icon
find.ancestor(...)        // Find parent widget
find.descendant(...)      // Find child widget
```

### Q129. How do you mock dependencies in Flutter tests?
Using `mockito`:
```dart
@GenerateMocks([UserRepository])
void main() {
  late MockUserRepository mockRepo;
  setUp(() => mockRepo = MockUserRepository());
  test('loads users', () async {
    when(mockRepo.getUsers()).thenAnswer((_) async => [User(name: 'Test')]);
    // ... test logic
    verify(mockRepo.getUsers()).called(1);
  });
}
```

### Q130. What is a Golden test?
Compares widget rendering against a saved "golden" image:
```dart
testWidgets('matches golden', (tester) async {
  await tester.pumpWidget(MyWidget());
  await expectLater(find.byType(MyWidget), matchesGoldenFile('golden/my_widget.png'));
});
```
Run `flutter test --update-goldens` to generate/update golden files.

### Q131. What is Clean Architecture?
A software architecture with concentric layers:
```
Data Layer → Domain Layer ← Presentation Layer
```
- **Domain**: Entities, Use Cases, Repository interfaces (no dependencies)
- **Data**: API, DB, Repository implementations (depends on Domain)
- **Presentation**: UI, State management (depends on Domain)

Key rule: Dependencies point inward. Domain has no dependencies on outer layers.

### Q132. What is a Use Case in Clean Architecture?
A single-purpose class that encapsulates one business action:
```dart
class GetUserUseCase {
  final UserRepository repo;
  GetUserUseCase(this.repo);
  Future<User> call(String id) => repo.getUserById(id);
}
```
Single Responsibility. One use case per business operation.

### Q133. What is the Either/Result pattern?
A functional pattern for error handling without exceptions:
```dart
Future<Either<Failure, User>> getUser(String id) async {
  try {
    return Right(await api.getUser(id));
  } catch (e) {
    return Left(ServerFailure(e.toString()));
  }
}
```
Forces callers to handle both success and failure paths.

### Q134. What is get_it and how is it used?
A service locator for dependency injection:
```dart
getIt.registerLazySingleton<ApiService>(() => ApiService());
getIt.registerFactory<LoginBloc>(() => LoginBloc(getIt()));
```
Register in `main()`, access anywhere with `getIt<T>()`.

### Q135. Feature-first vs Layer-first folder structure?
**Layer-first**: `lib/data/`, `lib/domain/`, `lib/presentation/`
**Feature-first**: `lib/features/auth/data/`, `lib/features/auth/domain/`

Feature-first scales better for large apps. Layer-first is simpler for small apps.

### Q136. What is `injectable` package?
Code generator for get_it that auto-registers dependencies using annotations:
- `@injectable`: Factory
- `@singleton`: Singleton
- `@lazySingleton`: Lazy singleton
- `@module`: External dependencies

### Q137. SOLID principles applied to Flutter?
| Principle | Flutter Application |
|---|---|
| **S** - Single Responsibility | One widget/class does one thing |
| **O** - Open/Closed | Extend via composition, not modification |
| **L** - Liskov Substitution | Repository interface, swap implementations |
| **I** - Interface Segregation | Small, focused abstract classes |
| **D** - Dependency Inversion | Depend on abstractions (Repository interface) |

### Q138. What is the difference between `integration_test` and `flutter_driver`?
- `integration_test`: New, recommended. Runs on device/emulator. Access to widget tree.
- `flutter_driver`: Legacy. Limited API. Being deprecated.

### Q139. How do you test asynchronous code?
```dart
test('fetches users', () async {
  when(mockApi.getUsers()).thenAnswer((_) async => [User(name: 'Test')]);
  final result = await useCase.execute();
  expect(result, isA<List<User>>());
  expect(result.length, 1);
});
```
Use `async/await` in tests. `expectLater` for stream-based assertions.

### Q140. How do you test streams?
```dart
test('emits states', () {
  expect(
    bloc.stream,
    emitsInOrder([
      isA<Loading>(),
      isA<Loaded>(),
    ]),
  );
  bloc.add(FetchEvent());
});
```

### Q141. What is `blocTest`?
```dart
blocTest<UserBloc, UserState>(
  'emits [Loading, Loaded] when FetchUsers is added',
  build: () => UserBloc(mockRepo),
  act: (bloc) => bloc.add(FetchUsers()),
  expect: () => [UserLoading(), UserLoaded(users)],
);
```

### Q142. How do you achieve code coverage in Flutter?
```bash
flutter test --coverage
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html
```

### Q143. What is the MVVM pattern in Flutter?
- **Model**: Data/domain layer
- **View**: Widget (UI)
- **ViewModel**: State + business logic (ChangeNotifier, Bloc, or Notifier)

View observes ViewModel. ViewModel calls Model. View never accesses Model directly.

### Q144. Observer pattern in Flutter?
`ChangeNotifier` + `Listenable` are Observer pattern implementations:
```
ChangeNotifier (Subject) ──notify──→ Listeners (Observers)
```
`addListener()`, `removeListener()`, `notifyListeners()`.

### Q145. Strategy pattern in Flutter?
Define interchangeable algorithms:
```dart
abstract class SortStrategy { List<T> sort<T>(List<T> items); }
class AlphabeticalSort implements SortStrategy { ... }
class DateSort implements SortStrategy { ... }
class ProductListBloc {
  SortStrategy _strategy;
  void setStrategy(SortStrategy s) => _strategy = s;
}
```

### Q146. What is Riverpod `ProviderContainer`?
A container for all provider states. Used in testing to override providers:
```dart
final container = ProviderContainer(overrides: [
  apiProvider.overrideWithValue(MockApiService()),
]);
final users = await container.read(usersProvider.future);
```

### Q147. How do you structure tests in a large Flutter project?
```
test/
├── unit/
│   ├── models/
│   ├── repositories/
│   └── blocs/
├── widget/
│   ├── screens/
│   └── components/
├── integration/
│   └── flows/
├── fixtures/           ← JSON test data
└── helpers/            ← Common test utilities
```

### Q148. What is the `setUp` and `tearDown` lifecycle in tests?
- `setUp`: Runs before each test. Initialize mocks, create instances.
- `tearDown`: Runs after each test. Cleanup.
- `setUpAll`: Once before all tests in group.
- `tearDownAll`: Once after all tests in group.

### Q149. How do you test navigation?
```dart
testWidgets('navigates to detail on tap', (tester) async {
  await tester.pumpWidget(MaterialApp(
    routes: {'/detail': (_) => DetailPage()},
    home: ListPage(),
  ));
  await tester.tap(find.text('Item 1'));
  await tester.pumpAndSettle();
  expect(find.byType(DetailPage), findsOneWidget);
});
```

### Q150. How do you mock `SharedPreferences` in tests?
```dart
setUp(() {
  SharedPreferences.setMockInitialValues({'dark_mode': true, 'lang': 'en'});
});
```
`setMockInitialValues` provides in-memory storage for tests.
