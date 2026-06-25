# Flutter Fundamentals & Architecture

## 1. What is Flutter?

Flutter is Google's open-source UI toolkit for building natively compiled applications for **mobile, web, desktop, and embedded** devices from a single Dart codebase.

```
┌──────────────────────────────────────────────────────────────────┐
│                        Flutter App                               │
│                                                                  │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│   │  iOS    │  │ Android │  │   Web   │  │ Desktop │          │
│   └─────────┘  └─────────┘  └─────────┘  └─────────┘          │
│                    ▲                                             │
│                    │                                             │
│              Single Codebase (Dart)                              │
└──────────────────────────────────────────────────────────────────┘
```

### Why Flutter Exists
- **Cross-platform** from a single codebase
- **Pixel-perfect** control — Flutter renders its own UI (doesn't use native views)
- **Fast development** with Hot Reload / Hot Restart
- **Near-native performance** via AOT compilation to native ARM code
- **Expressive UI** with a rich composable widget system

> **Interview Note**: Flutter does NOT use WebView (like Ionic/Cordova) or native UI components (like React Native). It draws every pixel itself using the Skia/Impeller rendering engine.

---

## 2. Flutter Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    YOUR APP (Dart)                        │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Framework Layer (Dart)                 │  │
│  │  ┌──────────┐ ┌──────────┐ ┌────────────────────┐ │  │
│  │  │ Material │ │ Cupertino│ │    Widgets         │ │  │
│  │  └──────────┘ └──────────┘ └────────────────────┘ │  │
│  │  ┌──────────┐ ┌──────────┐ ┌────────────────────┐ │  │
│  │  │Rendering │ │Animation │ │    Gestures        │ │  │
│  │  └──────────┘ └──────────┘ └────────────────────┘ │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │              Foundation                       │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │              Engine Layer (C++)                     │  │
│  │  ┌──────────┐ ┌──────────┐ ┌────────────────────┐ │  │
│  │  │  Skia /  │ │  Dart    │ │   Platform        │ │  │
│  │  │ Impeller │ │  Runtime │ │   Channels        │ │  │
│  │  └──────────┘ └──────────┘ └────────────────────┘ │  │
│  └────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────┐  │
│  │           Embedder Layer (Platform)                │  │
│  │  ┌──────────┐ ┌──────────┐ ┌────────────────────┐ │  │
│  │  │  Android │ │   iOS    │ │   Web / Desktop   │ │  │
│  │  └──────────┘ └──────────┘ └────────────────────┘ │  │
│  └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### Framework Layer (Dart)
- **Material / Cupertino**: Platform-specific design language widgets
- **Widgets**: Core composable UI building blocks
- **Rendering**: Layout and painting system
- **Animation**: Tween, physics-based animations
- **Gestures**: Tap, drag, scale recognition
- **Foundation**: Base utilities, key classes

### Engine Layer (C++)
- **Skia / Impeller**: 2D rendering engine (Impeller is the new default on iOS, coming to Android)
- **Dart Runtime**: VM for JIT (debug) and AOT-compiled code (release)
- **Platform Channels**: Communication bridge between Dart and native code
- **Text Layout**: ICU text rendering

### Embedder Layer (Platform-Specific)
- Provides the surface to draw on
- Handles input events, accessibility, lifecycle
- Each platform (Android, iOS, Web, Desktop) has its own embedder

> **Interview Tip**: The three-layer architecture (Framework → Engine → Embedder) is a fundamental interview question. Know what each layer does.

---

## 3. Flutter vs Alternatives

| Feature | Flutter | React Native | Native (Swift/Kotlin) | KMP |
|---|---|---|---|---|
| **Language** | Dart | JavaScript | Swift / Kotlin | Kotlin |
| **UI Rendering** | Own canvas (Skia/Impeller) | Native UI components | Native UI | Native UI |
| **Performance** | Near-native (AOT compiled) | Bridge overhead | Native | Native |
| **Hot Reload** | ✅ Stateful | ✅ Fast Refresh | ❌ (preview mode) | ❌ |
| **Code Sharing** | ~95% (UI + logic) | ~85% (logic, partial UI) | 0% | ~70% (logic only) |
| **UI Consistency** | Pixel-perfect across platforms | Platform-specific look | Platform-specific | Platform-specific |
| **Platform Access** | Platform Channels | Native Modules | Full | Full (shared logic) |
| **Community** | Growing fast | Large | Largest | Growing |
| **Best For** | Single team, consistent UI | JS teams, native-feel | Max performance | Shared business logic |

### Key Distinction
```
React Native:  JS → Bridge → Native Views    (uses platform widgets)
Flutter:       Dart → Skia/Impeller → Canvas  (draws its own widgets)
KMP:           Kotlin → shared logic only     (native UI per platform)
```

> **Interview Note**: Flutter's key advantage is pixel-perfect consistency. Its main trade-off is less "native feel" since it draws its own UI. React Native delegates to native views, giving a more platform-native look at the cost of consistency.

---

## 4. Dart Essentials for Flutter

### Classes & Constructors
```dart
class User {
  final String name;
  final int age;
  final String? email; // Nullable

  // Positional constructor
  User(this.name, this.age, [this.email]);

  // Named constructor
  User.guest() : name = 'Guest', age = 0, email = null;

  // Factory constructor (can return cached/subtype instance)
  factory User.fromJson(Map<String, dynamic> json) {
    return User(json['name'], json['age'], json['email']);
  }

  // Named parameters (common in Flutter)
  // User({required this.name, required this.age, this.email});
}

// Const constructor (immutable, compile-time constant)
class Config {
  final String apiUrl;
  const Config(this.apiUrl);
}

const config = Config('https://api.example.com'); // Compile-time constant
```

### Null Safety
```dart
String? nullableName;   // Can be null
String nonNullName = ''; // Cannot be null

// Null-aware operators
String display = nullableName ?? 'default';  // If null, use default
int? length = nullableName?.length;           // Safe access
String forced = nullableName!;                // Force unwrap (throws if null)

// Late initialization
late final String apiKey;
apiKey = fetchApiKey(); // Must be assigned before first read
```

### Mixins
```dart
mixin Loggable {
  void log(String message) => print('[LOG] $message');
}

mixin Cacheable {
  final Map<String, dynamic> _cache = {};
  void cache(String key, dynamic value) => _cache[key] = value;
  dynamic getCache(String key) => _cache[key];
}

class ApiService with Loggable, Cacheable {
  Future<String> fetchData(String url) async {
    log('Fetching $url');
    final cached = getCache(url);
    if (cached != null) return cached;
    // ... fetch from network
    return '';
  }
}
```

### Extensions
```dart
extension StringExtension on String {
  String capitalize() => '${this[0].toUpperCase()}${substring(1)}';
  bool get isEmail => RegExp(r'^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(this);
}

extension DateTimeExtension on DateTime {
  String get formatted => '$day/$month/$year';
  bool get isToday {
    final now = DateTime.now();
    return year == now.year && month == now.month && day == now.day;
  }
}

// Usage
'hello'.capitalize(); // 'Hello'
'user@email.com'.isEmail; // true
DateTime.now().formatted; // '25/6/2026'
```

### Generics
```dart
class Result<T> {
  final T? data;
  final String? error;
  final bool isLoading;

  const Result._({this.data, this.error, this.isLoading = false});

  factory Result.success(T data) => Result._(data: data);
  factory Result.failure(String error) => Result._(error: error);
  factory Result.loading() => const Result._(isLoading: true);

  R when<R>({
    required R Function(T data) success,
    required R Function(String error) failure,
    required R Function() loading,
  }) {
    if (isLoading) return loading();
    if (error != null) return failure(error!);
    return success(data as T);
  }
}

// Usage
Result<User> result = Result.success(User('Alice', 25));
result.when(
  success: (user) => print(user.name),
  failure: (error) => print('Error: $error'),
  loading: () => print('Loading...'),
);
```

### Async/Await & Futures
```dart
// Future — represents a value available in the future
Future<User> fetchUser(String id) async {
  final response = await http.get(Uri.parse('/api/users/$id'));
  return User.fromJson(jsonDecode(response.body));
}

// Parallel execution
final results = await Future.wait([
  fetchUser('1'),
  fetchUser('2'),
  fetchUser('3'),
]);

// Error handling
try {
  final user = await fetchUser('1');
} on SocketException {
  print('No internet');
} on HttpException catch (e) {
  print('HTTP error: ${e.message}');
} catch (e) {
  print('Unknown error: $e');
}

// Future with timeout
final user = await fetchUser('1').timeout(
  const Duration(seconds: 5),
  onTimeout: () => throw TimeoutException('Request timed out'),
);
```

### Streams
```dart
// Stream — sequence of asynchronous events
Stream<int> countStream(int max) async* {
  for (int i = 1; i <= max; i++) {
    await Future.delayed(const Duration(seconds: 1));
    yield i;
  }
}

// Listening to a stream
countStream(5).listen(
  (value) => print('Count: $value'),
  onDone: () => print('Done!'),
  onError: (error) => print('Error: $error'),
);

// StreamController (create your own streams)
final controller = StreamController<String>.broadcast();
controller.sink.add('Hello');
controller.sink.add('World');
controller.stream.listen((data) => print(data));
controller.close();

// Stream transformations
Stream<String> searchStream = inputController.stream
    .debounceTime(const Duration(milliseconds: 300))
    .distinct()
    .switchMap((query) => searchApi(query));
```

### Isolates (Parallel Computing)
```dart
// Heavy computation — run in a separate isolate
Future<List<int>> heavyComputation(List<int> data) async {
  return await Isolate.run(() {
    // This runs on a separate thread
    return data.where((n) => isPrime(n)).toList();
  });
}

// compute() helper (Flutter)
final result = await compute(parseJson, rawJsonString);

List<User> parseJson(String json) {
  final list = jsonDecode(json) as List;
  return list.map((e) => User.fromJson(e)).toList();
}
```

> **Interview Tip**: Know the difference between `Future` (single async value) and `Stream` (multiple async values). Know when to use `Isolate.run()` vs `compute()` for heavy work.

---

## 5. Flutter Project Structure

### Default Structure
```
my_app/
├── android/           # Android-specific code
├── ios/               # iOS-specific code
├── web/               # Web-specific code
├── linux/             # Linux desktop code
├── macos/             # macOS desktop code
├── windows/           # Windows desktop code
├── lib/               # Main Dart code
│   └── main.dart      # Entry point
├── test/              # Unit & widget tests
├── integration_test/  # Integration tests
├── assets/            # Images, fonts, etc.
├── pubspec.yaml       # Dependencies & config
└── analysis_options.yaml
```

### Feature-First Structure (Recommended)
```
lib/
├── main.dart
├── app.dart
├── core/
│   ├── constants/
│   ├── errors/
│   ├── network/
│   ├── theme/
│   └── utils/
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   ├── models/
│   │   │   ├── repositories/
│   │   │   └── datasources/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── repositories/
│   │   │   └── usecases/
│   │   └── presentation/
│   │       ├── screens/
│   │       ├── widgets/
│   │       └── bloc/ (or providers/)
│   ├── home/
│   └── settings/
└── shared/
    ├── widgets/
    └── models/
```

---

## 6. Entry Point & MaterialApp

```dart
// main.dart
void main() {
  WidgetsFlutterBinding.ensureInitialized(); // Required before async ops
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'My App',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: true,
      ),
      darkTheme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.deepPurple,
          brightness: Brightness.dark,
        ),
        useMaterial3: true,
      ),
      themeMode: ThemeMode.system,
      home: const HomeScreen(),
    );
  }
}
```

> **Interview Note**: `WidgetsFlutterBinding.ensureInitialized()` must be called before any async operations in `main()` (e.g., loading SharedPreferences, Firebase init).

---

## 7. Hot Reload vs Hot Restart

| Feature | Hot Reload | Hot Restart |
|---|---|---|
| **Speed** | ~1 second | ~3-5 seconds |
| **Preserves State** | ✅ Yes | ❌ No |
| **What Changes** | Widget tree rebuild | Full app restart |
| **When to Use** | UI tweaks, small changes | State changes, new dependencies |
| **Limitations** | Doesn't work for `main()`, global variables, static fields | None |

---

## Quick Revision: Fundamentals

| Concept | Description |
|---|---|
| Flutter | Google's UI toolkit for cross-platform apps |
| Dart | Language used by Flutter (AOT + JIT) |
| Skia/Impeller | Rendering engines (Flutter draws its own UI) |
| Framework Layer | Widgets, rendering, animation (Dart) |
| Engine Layer | Skia, Dart runtime, platform channels (C++) |
| Embedder Layer | Platform-specific integration |
| Hot Reload | Fast UI updates, preserves state |
| `runApp()` | Entry point, takes root widget |
| `const` constructors | Enable compile-time constants, improve performance |
| Null Safety | Types are non-nullable by default |
