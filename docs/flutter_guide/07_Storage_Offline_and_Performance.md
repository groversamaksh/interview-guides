# Local Storage, Offline & Performance

## 1. Local Storage Options

| Solution | Data Type | Speed | Complexity | Best For |
|---|---|---|---|---|
| `SharedPreferences` | Key-value (primitives) | Fast | Very Low | Settings, flags, tokens |
| **Hive** | NoSQL (objects) | Very Fast | Low | Structured data, offline cache |
| **Isar** | NoSQL (schema-based) | Very Fast | Medium | Complex queries, large datasets |
| **SQLite (sqflite/drift)** | SQL relational | Fast | Medium-High | Relational data, complex queries |
| **Secure Storage** | Encrypted key-value | Moderate | Low | Tokens, passwords, sensitive data |

---

## 2. SharedPreferences

```dart
import 'package:shared_preferences/shared_preferences.dart';

class PreferencesService {
  late final SharedPreferences _prefs;

  Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  // Theme
  bool get isDarkMode => _prefs.getBool('dark_mode') ?? false;
  Future<void> setDarkMode(bool value) => _prefs.setBool('dark_mode', value);

  // Onboarding
  bool get hasCompletedOnboarding => _prefs.getBool('onboarding_done') ?? false;
  Future<void> completeOnboarding() => _prefs.setBool('onboarding_done', true);

  // Auth token
  String? get authToken => _prefs.getString('auth_token');
  Future<void> setAuthToken(String token) => _prefs.setString('auth_token', token);
  Future<void> clearToken() => _prefs.remove('auth_token');

  // Complex data (store as JSON string)
  Future<void> setLastUser(User user) =>
      _prefs.setString('last_user', jsonEncode(user.toJson()));
  User? get lastUser {
    final json = _prefs.getString('last_user');
    return json != null ? User.fromJson(jsonDecode(json)) : null;
  }
}
```

> **Interview Note**: SharedPreferences is NOT encrypted and NOT suitable for sensitive data. Use `flutter_secure_storage` for tokens and passwords.

---

## 3. Hive (NoSQL)

```yaml
dependencies:
  hive: ^4.0.0
  hive_flutter: ^1.1.0
dev_dependencies:
  hive_generator: ^2.0.0
  build_runner: ^2.4.0
```

```dart
// Model
@HiveType(typeId: 0)
class Task extends HiveObject {
  @HiveField(0)
  late String title;

  @HiveField(1)
  late bool completed;

  @HiveField(2)
  late DateTime createdAt;
}

// Initialization
Future<void> main() async {
  await Hive.initFlutter();
  Hive.registerAdapter(TaskAdapter()); // Generated
  await Hive.openBox<Task>('tasks');
  runApp(const MyApp());
}

// CRUD Operations
class TaskRepository {
  final Box<Task> _box = Hive.box<Task>('tasks');

  List<Task> getAll() => _box.values.toList();

  Future<void> add(Task task) => _box.add(task);

  Future<void> update(int index, Task task) => _box.putAt(index, task);

  Future<void> delete(int index) => _box.deleteAt(index);

  // Listen for changes
  Stream<BoxEvent> watch() => _box.watch();
}
```

---

## 4. SQLite (sqflite / drift)

```dart
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DatabaseHelper {
  static Database? _database;

  Future<Database> get database async {
    _database ??= await _initDB();
    return _database!;
  }

  Future<Database> _initDB() async {
    final path = join(await getDatabasesPath(), 'app.db');
    return openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE users(
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            created_at TEXT NOT NULL
          )
        ''');
        await db.execute('''
          CREATE TABLE tasks(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            title TEXT NOT NULL,
            completed INTEGER DEFAULT 0,
            FOREIGN KEY (user_id) REFERENCES users(id)
          )
        ''');
      },
    );
  }

  // CRUD
  Future<int> insertUser(User user) async {
    final db = await database;
    return db.insert('users', user.toJson(), conflictAlgorithm: ConflictAlgorithm.replace);
  }

  Future<List<User>> getUsers() async {
    final db = await database;
    final maps = await db.query('users', orderBy: 'name ASC');
    return maps.map((m) => User.fromJson(m)).toList();
  }

  Future<int> updateUser(User user) async {
    final db = await database;
    return db.update('users', user.toJson(), where: 'id = ?', whereArgs: [user.id]);
  }

  Future<int> deleteUser(String id) async {
    final db = await database;
    return db.delete('users', where: 'id = ?', whereArgs: [id]);
  }
}
```

---

## 5. Secure Storage

```yaml
dependencies:
  flutter_secure_storage: ^9.2.0
```

```dart
class SecureStorageService {
  final _storage = const FlutterSecureStorage(
    aOptions: AndroidOptions(encryptedSharedPreferences: true),
    iOptions: IOSOptions(accessibility: KeychainAccessibility.first_unlock),
  );

  Future<void> saveToken(String token) => _storage.write(key: 'auth_token', value: token);
  Future<String?> getToken() => _storage.read(key: 'auth_token');
  Future<void> deleteToken() => _storage.delete(key: 'auth_token');
  Future<void> clearAll() => _storage.deleteAll();
}
```

---

## 6. Offline-First Architecture

```
┌──────────────────────────────────────────────────────┐
│                   UI Layer                            │
│  Widget watches Repository for data                  │
└──────────────────────┬───────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────┐
│                Repository Layer                       │
│  1. Try remote API                                   │
│  2. If success → cache locally → return data         │
│  3. If failure → return cached data (if available)   │
│  4. If no cache → return error                       │
└──────────┬───────────────────────┬───────────────────┘
           │                       │
┌──────────▼──────────┐  ┌────────▼────────────────────┐
│   Remote Data Source │  │    Local Data Source         │
│   (API / Firebase)   │  │    (Hive / SQLite / Isar)   │
└─────────────────────┘  └─────────────────────────────┘
```

```dart
class OfflineFirstRepository<T> {
  final RemoteDataSource<T> _remote;
  final LocalDataSource<T> _local;
  final ConnectivityService _connectivity;

  OfflineFirstRepository(this._remote, this._local, this._connectivity);

  Future<List<T>> getAll() async {
    if (await _connectivity.isConnected) {
      try {
        final data = await _remote.getAll();
        await _local.cacheAll(data);
        return data;
      } catch (e) {
        return _local.getAll(); // Fallback to cache
      }
    }
    return _local.getAll(); // Offline mode
  }

  Future<void> create(T item) async {
    await _local.save(item); // Save locally first

    if (await _connectivity.isConnected) {
      try {
        await _remote.create(item);
        await _local.markSynced(item);
      } catch (e) {
        await _local.markPendingSync(item);
      }
    } else {
      await _local.markPendingSync(item);
    }
  }

  // Sync pending items when connectivity returns
  Future<void> syncPending() async {
    final pending = await _local.getPendingSync();
    for (final item in pending) {
      try {
        await _remote.create(item);
        await _local.markSynced(item);
      } catch (e) {
        // Retry later
      }
    }
  }
}
```

---

## 7. Performance Optimization

### Const Widgets
```dart
// ❌ Creates new instance every rebuild
child: Text('Hello')
child: SizedBox(height: 16)
child: Icon(Icons.star)

// ✅ Compile-time constant — never recreated
child: const Text('Hello')
child: const SizedBox(height: 16)
child: const Icon(Icons.star)
```

> **Interview Tip**: `const` widgets are created at compile time and shared across rebuilds. They are the #1 easiest performance optimization in Flutter.

### Minimizing Rebuilds
```dart
// ❌ BAD: Entire tree rebuilds when counter changes
class BadExample extends StatefulWidget {
  @override
  State<BadExample> createState() => _BadExampleState();
}

class _BadExampleState extends State<BadExample> {
  int counter = 0;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        ExpensiveHeader(),    // Rebuilds unnecessarily!
        Text('Count: $counter'),
        ExpensiveFooter(),    // Rebuilds unnecessarily!
      ],
    );
  }
}

// ✅ GOOD: Extract static parts as const or separate widgets
class GoodExample extends StatefulWidget {
  @override
  State<GoodExample> createState() => _GoodExampleState();
}

class _GoodExampleState extends State<GoodExample> {
  int counter = 0;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        const ExpensiveHeader(),  // Won't rebuild (const)
        Text('Count: $counter'),  // Only this rebuilds
        const ExpensiveFooter(),  // Won't rebuild (const)
      ],
    );
  }
}
```

### RepaintBoundary
```dart
// Isolates repaints — prevents expensive widget from repainting
// when siblings change
RepaintBoundary(
  child: CustomPaint(
    painter: ExpensiveChartPainter(data),
    size: const Size(300, 200),
  ),
)
```

### ListView Optimization
```dart
// ✅ Use ListView.builder for large lists (lazy)
ListView.builder(
  itemCount: 10000,
  itemBuilder: (context, index) => ListTile(title: Text('Item $index')),
)

// ✅ Set itemExtent for uniform height items (faster layout)
ListView.builder(
  itemExtent: 72, // Each item is exactly 72px tall
  itemCount: items.length,
  itemBuilder: (context, index) => ItemTile(item: items[index]),
)

// ✅ Use cacheExtent to pre-build offscreen items
ListView.builder(
  cacheExtent: 500, // Pre-build items 500px before/after viewport
  itemCount: items.length,
  itemBuilder: (context, index) => ItemTile(item: items[index]),
)

// ✅ For very long lists, use addAutomaticKeepAlives: false
ListView.builder(
  addAutomaticKeepAlives: false, // Don't keep offscreen items alive
  addRepaintBoundaries: true,     // Isolate repaints
  itemCount: items.length,
  itemBuilder: (context, index) => ItemTile(item: items[index]),
)
```

### Image Optimization
```dart
// ✅ Cache images
CachedNetworkImage(
  imageUrl: url,
  placeholder: (context, url) => const CircularProgressIndicator(),
  errorWidget: (context, url, error) => const Icon(Icons.error),
  memCacheWidth: 300, // Resize in memory
)

// ✅ Precache images
precacheImage(NetworkImage(imageUrl), context);

// ✅ Use appropriate image resolution
Image.asset(
  'assets/image.png',
  cacheWidth: 300,   // Decode at smaller size to save memory
  cacheHeight: 300,
)
```

### Build Method Best Practices
```dart
// ❌ DON'T: Create objects in build()
@override
Widget build(BuildContext context) {
  final style = TextStyle(fontSize: 16, color: Colors.blue); // Created every build!
  return Text('Hello', style: style);
}

// ✅ DO: Use const or static
static const _titleStyle = TextStyle(fontSize: 16, color: Colors.blue);

@override
Widget build(BuildContext context) {
  return Text('Hello', style: _titleStyle);
}
```

---

## 8. Flutter DevTools

### Widget Inspector
- View the widget tree hierarchy
- Inspect properties of any widget
- Toggle Debug Paint (shows layout constraints)
- Toggle Performance Overlay

### Performance Profiling
```dart
// Profile mode (realistic performance measurement)
// flutter run --profile

// Timeline view shows:
// - Build phase timing
// - Layout phase timing
// - Paint phase timing
// - Rasterization timing

// Look for:
// - Jank (frames taking >16ms)
// - Excessive rebuilds
// - Expensive layout operations
```

### Memory Profiling
```dart
// Common memory issues:
// 1. Not disposing controllers
// 2. Not cancelling subscriptions
// 3. Large image caches
// 4. Retaining references to disposed objects

// Use DevTools Memory tab to:
// - Track allocations
// - Find memory leaks
// - Analyze garbage collection
```

### Debug Flags
```dart
// Enable in debug mode
import 'package:flutter/rendering.dart';

void main() {
  debugPaintSizeEnabled = true;         // Show layout boxes
  debugPaintBaselinesEnabled = true;    // Show text baselines
  debugPaintLayerBordersEnabled = true; // Show layer boundaries
  debugRepaintRainbowEnabled = true;    // Show repaint regions (rainbow colors)
  debugPrintRebuildDirtyWidgets = true; // Print which widgets rebuild

  runApp(const MyApp());
}
```

---

## 9. Performance Checklist

| Optimization | Impact | Effort |
|---|---|---|
| Use `const` constructors everywhere | High | Low |
| `ListView.builder` for lists | High | Low |
| Set `itemExtent` for uniform lists | Medium | Low |
| Extract widgets to avoid rebuilds | High | Medium |
| `RepaintBoundary` for expensive paints | Medium | Low |
| `const` for static TextStyles/Decorations | Medium | Low |
| Resize images with `cacheWidth/Height` | High | Low |
| Use `Selector`/`select` for granular rebuilds | High | Medium |
| Avoid `Opacity` widget (use color opacity) | Medium | Low |
| Profile in `--profile` mode, not debug | Critical | Low |
| Use Isolates for heavy computation | High | Medium |
| Avoid `IntrinsicHeight/Width` in lists | Medium | Low |

---

## Quick Revision: Storage & Performance

| Storage | Data | Encryption | Speed |
|---|---|---|---|
| SharedPreferences | Key-value primitives | ❌ | Fast |
| flutter_secure_storage | Key-value strings | ✅ | Moderate |
| Hive | NoSQL objects | Optional | Very Fast |
| Isar | NoSQL schema | ❌ | Very Fast |
| sqflite | SQL relational | ❌ | Fast |
| drift | Type-safe SQL | ❌ | Fast |
