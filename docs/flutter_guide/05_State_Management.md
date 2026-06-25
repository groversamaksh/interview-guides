# State Management — Provider, Riverpod & Bloc

## 1. State Management Overview

```
┌──────────────────────────────────────────────────────────────┐
│                    State Types                                │
│                                                               │
│  Local/Ephemeral State    │    App/Shared State              │
│  ─────────────────────    │    ─────────────────             │
│  • Animation progress     │    • User authentication         │
│  • Current tab index      │    • Shopping cart                │
│  • Text field content     │    • Read/unread notifications    │
│  • Expanded/collapsed     │    • User preferences             │
│                           │    • Server-fetched data          │
│  → Use setState()         │    → Use state management        │
└──────────────────────────────────────────────────────────────┘
```

### Comparison Table
| Solution | Complexity | Boilerplate | Testability | Best For |
|---|---|---|---|---|
| `setState` | Very Low | None | Low | Local UI state |
| `InheritedWidget` | Medium | High | Medium | Framework-level (internal use) |
| **Provider** | Low | Low | High | Small-medium apps |
| **Riverpod** | Medium | Low | Very High | Medium-large apps |
| **Bloc/Cubit** | Medium-High | Medium | Very High | Large/enterprise apps |
| MobX | Medium | Low (codegen) | Medium | Reactive programming fans |
| GetX | Low | Very Low | Low | Quick prototyping |

> **Interview Tip**: Know at least Provider + one of (Riverpod or Bloc). Riverpod is the modern successor to Provider. Bloc is popular in enterprise.

---

## 2. setState

```dart
class CounterPage extends StatefulWidget {
  const CounterPage({super.key});

  @override
  State<CounterPage> createState() => _CounterPageState();
}

class _CounterPageState extends State<CounterPage> {
  int _count = 0;

  void _increment() {
    setState(() {
      _count++;
    });
    // setState triggers a rebuild of THIS widget's build()
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(child: Text('Count: $_count')),
      floatingActionButton: FloatingActionButton(
        onPressed: _increment,
        child: const Icon(Icons.add),
      ),
    );
  }
}
```

### setState Limitations
- State is local to one widget
- Sharing state requires lifting state up and passing via constructors (prop drilling)
- Rebuilds entire widget subtree (not granular)

---

## 3. InheritedWidget

The foundational mechanism for propagating data down the widget tree. `Theme.of(context)`, `MediaQuery.of(context)` all use InheritedWidget.

```dart
class AppState extends InheritedWidget {
  final int counter;
  final VoidCallback increment;

  const AppState({
    super.key,
    required this.counter,
    required this.increment,
    required super.child,
  });

  static AppState of(BuildContext context) {
    return context.dependOnInheritedWidgetOfExactType<AppState>()!;
  }

  @override
  bool updateShouldNotify(AppState oldWidget) {
    return counter != oldWidget.counter;
  }
}

// Usage
Text('Count: ${AppState.of(context).counter}')
```

> **Interview Note**: InheritedWidget is the low-level primitive. You rarely use it directly — Provider, Riverpod, and Bloc all build on top of it.

---

## 4. Provider

```yaml
dependencies:
  provider: ^6.0.0
```

### ChangeNotifier + ChangeNotifierProvider
```dart
// 1. Create the model
class CartModel extends ChangeNotifier {
  final List<Product> _items = [];

  List<Product> get items => List.unmodifiable(_items);
  int get itemCount => _items.length;
  double get totalPrice => _items.fold(0, (sum, item) => sum + item.price);

  void addItem(Product product) {
    _items.add(product);
    notifyListeners(); // Notify all listening widgets
  }

  void removeItem(Product product) {
    _items.remove(product);
    notifyListeners();
  }

  void clearCart() {
    _items.clear();
    notifyListeners();
  }
}

// 2. Provide it
void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => CartModel()),
        ChangeNotifierProvider(create: (_) => AuthModel()),
        Provider(create: (_) => ApiService()),
      ],
      child: const MyApp(),
    ),
  );
}

// 3. Consume it
class CartPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    // Option A: context.watch — rebuilds when CartModel changes
    final cart = context.watch<CartModel>();

    // Option B: Consumer — only rebuilds the Consumer's builder
    return Consumer<CartModel>(
      builder: (context, cart, child) {
        return Column(
          children: [
            child!, // Static child that doesn't rebuild
            Text('Items: ${cart.itemCount}'),
            Text('Total: \$${cart.totalPrice.toStringAsFixed(2)}'),
          ],
        );
      },
      child: const Text('Your Cart'), // Static, won't rebuild
    );
  }
}

// Read without listening (one-time read, no rebuild)
void _checkout(BuildContext context) {
  final cart = context.read<CartModel>();
  // Process cart.items...
  cart.clearCart();
}
```

### Provider Types
| Provider | Creates | Rebuilds On |
|---|---|---|
| `Provider` | Any value | Never (value is immutable) |
| `ChangeNotifierProvider` | `ChangeNotifier` | `notifyListeners()` |
| `FutureProvider` | `Future<T>` | When Future completes |
| `StreamProvider` | `Stream<T>` | Each stream emission |
| `ProxyProvider` | Dependent on other providers | When dependencies change |

### Selector (Granular Rebuilds)
```dart
// Only rebuilds when itemCount changes, not on every cart change
Selector<CartModel, int>(
  selector: (_, cart) => cart.itemCount,
  builder: (context, count, child) {
    return Badge(count: count, child: const Icon(Icons.shopping_cart));
  },
)

// Extension syntax
final count = context.select<CartModel, int>((cart) => cart.itemCount);
```

> **Interview Tip**: `context.watch` rebuilds on ANY change. `context.select` rebuilds only when the selected value changes. Use `context.read` for one-time reads (in callbacks, not in `build()`).

---

## 5. Riverpod

```yaml
dependencies:
  flutter_riverpod: ^2.5.0
  riverpod_annotation: ^2.3.0
dev_dependencies:
  riverpod_generator: ^2.4.0
  build_runner: ^2.4.0
```

### Setup
```dart
void main() {
  runApp(
    const ProviderScope( // Wrap the entire app
      child: MyApp(),
    ),
  );
}
```

### Provider Types
```dart
// 1. Simple Provider (read-only value)
final greetingProvider = Provider<String>((ref) => 'Hello, World!');

// 2. StateProvider (simple mutable state)
final counterProvider = StateProvider<int>((ref) => 0);

// 3. FutureProvider (async data)
final usersProvider = FutureProvider<List<User>>((ref) async {
  final apiService = ref.watch(apiServiceProvider);
  return apiService.getUsers();
});

// 4. StreamProvider (stream data)
final messagesProvider = StreamProvider<List<Message>>((ref) {
  final chatService = ref.watch(chatServiceProvider);
  return chatService.messagesStream;
});

// 5. NotifierProvider (complex state, replaces StateNotifier)
final todosProvider = NotifierProvider<TodosNotifier, List<Todo>>(TodosNotifier.new);

class TodosNotifier extends Notifier<List<Todo>> {
  @override
  List<Todo> build() => []; // Initial state

  void addTodo(String title) {
    state = [...state, Todo(id: uuid(), title: title, completed: false)];
  }

  void toggleTodo(String id) {
    state = [
      for (final todo in state)
        if (todo.id == id) todo.copyWith(completed: !todo.completed)
        else todo,
    ];
  }

  void removeTodo(String id) {
    state = state.where((t) => t.id != id).toList();
  }
}

// 6. AsyncNotifierProvider (async state)
final userProfileProvider = AsyncNotifierProvider<UserProfileNotifier, UserProfile>(
  UserProfileNotifier.new,
);

class UserProfileNotifier extends AsyncNotifier<UserProfile> {
  @override
  Future<UserProfile> build() async {
    final userId = ref.watch(currentUserIdProvider);
    return ref.watch(apiServiceProvider).getProfile(userId);
  }

  Future<void> updateName(String name) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() async {
      final api = ref.read(apiServiceProvider);
      return api.updateProfile(name: name);
    });
  }
}
```

### Consuming Providers
```dart
// In StatelessWidget — use ConsumerWidget
class TodoListPage extends ConsumerWidget {
  const TodoListPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final todos = ref.watch(todosProvider);

    return ListView.builder(
      itemCount: todos.length,
      itemBuilder: (context, index) {
        final todo = todos[index];
        return CheckboxListTile(
          title: Text(todo.title),
          value: todo.completed,
          onChanged: (_) => ref.read(todosProvider.notifier).toggleTodo(todo.id),
        );
      },
    );
  }
}

// In StatefulWidget — use ConsumerStatefulWidget
class SearchPage extends ConsumerStatefulWidget {
  @override
  ConsumerState<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends ConsumerState<SearchPage> {
  @override
  Widget build(BuildContext context) {
    final searchResults = ref.watch(searchProvider);
    // ...
  }
}
```

### AsyncValue Handling
```dart
final usersAsync = ref.watch(usersProvider);

return usersAsync.when(
  data: (users) => ListView.builder(
    itemCount: users.length,
    itemBuilder: (context, i) => ListTile(title: Text(users[i].name)),
  ),
  loading: () => const Center(child: CircularProgressIndicator()),
  error: (error, stack) => Center(child: Text('Error: $error')),
);
```

### Family Providers (Parameterized)
```dart
final userProvider = FutureProvider.family<User, String>((ref, userId) async {
  return ref.watch(apiServiceProvider).getUser(userId);
});

// Usage
final user = ref.watch(userProvider('user_123'));
```

### AutoDispose
```dart
// Automatically disposes when no longer listened to
final searchProvider = FutureProvider.autoDispose.family<List<Product>, String>(
  (ref, query) async {
    // Cancel previous request if still running
    ref.onDispose(() => /* cancel request */);
    // Debounce
    await Future.delayed(const Duration(milliseconds: 300));
    if (ref.state is AsyncLoading) return []; // Check if cancelled
    return ref.watch(apiServiceProvider).search(query);
  },
);
```

> **Interview Tip**: Riverpod advantages over Provider: compile-safe (no runtime `ProviderNotFoundException`), testable (override providers easily), supports `autoDispose`, doesn't need `BuildContext` to read providers.

---

## 6. Bloc Pattern

```yaml
dependencies:
  flutter_bloc: ^8.1.0
  bloc: ^8.1.0
  equatable: ^2.0.0
```

### Cubit (Simplified Bloc)
```dart
// State
class CounterState extends Equatable {
  final int count;
  const CounterState(this.count);

  @override
  List<Object?> get props => [count];
}

// Cubit — emits states directly, no events
class CounterCubit extends Cubit<int> {
  CounterCubit() : super(0); // Initial state

  void increment() => emit(state + 1);
  void decrement() => emit(state - 1);
  void reset() => emit(0);
}
```

### Full Bloc (Events → States)
```dart
// Events
sealed class AuthEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class LoginRequested extends AuthEvent {
  final String email;
  final String password;
  LoginRequested({required this.email, required this.password});

  @override
  List<Object?> get props => [email, password];
}

class LogoutRequested extends AuthEvent {}

class AuthCheckRequested extends AuthEvent {}

// States
sealed class AuthState extends Equatable {
  @override
  List<Object?> get props => [];
}

class AuthInitial extends AuthState {}
class AuthLoading extends AuthState {}
class AuthAuthenticated extends AuthState {
  final User user;
  AuthAuthenticated(this.user);
  @override
  List<Object?> get props => [user];
}
class AuthUnauthenticated extends AuthState {}
class AuthError extends AuthState {
  final String message;
  AuthError(this.message);
  @override
  List<Object?> get props => [message];
}

// Bloc
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository _authRepo;

  AuthBloc(this._authRepo) : super(AuthInitial()) {
    on<LoginRequested>(_onLogin);
    on<LogoutRequested>(_onLogout);
    on<AuthCheckRequested>(_onAuthCheck);
  }

  Future<void> _onLogin(LoginRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      final user = await _authRepo.login(event.email, event.password);
      emit(AuthAuthenticated(user));
    } catch (e) {
      emit(AuthError(e.toString()));
    }
  }

  Future<void> _onLogout(LogoutRequested event, Emitter<AuthState> emit) async {
    await _authRepo.logout();
    emit(AuthUnauthenticated());
  }

  Future<void> _onAuthCheck(AuthCheckRequested event, Emitter<AuthState> emit) async {
    final user = await _authRepo.getCurrentUser();
    if (user != null) {
      emit(AuthAuthenticated(user));
    } else {
      emit(AuthUnauthenticated());
    }
  }
}
```

### Using Bloc in UI
```dart
// Provide
BlocProvider(
  create: (context) => AuthBloc(context.read<AuthRepository>())
    ..add(AuthCheckRequested()),
  child: const MyApp(),
)

// Multiple providers
MultiBlocProvider(
  providers: [
    BlocProvider(create: (_) => AuthBloc(getIt<AuthRepository>())),
    BlocProvider(create: (_) => ThemeBloc()),
  ],
  child: const MyApp(),
)

// Consume with BlocBuilder
BlocBuilder<AuthBloc, AuthState>(
  builder: (context, state) {
    return switch (state) {
      AuthInitial() || AuthLoading() => const CircularProgressIndicator(),
      AuthAuthenticated(user: final user) => Text('Welcome, ${user.name}'),
      AuthUnauthenticated() => const LoginPage(),
      AuthError(message: final msg) => Text('Error: $msg'),
    };
  },
)

// React to state changes (side effects)
BlocListener<AuthBloc, AuthState>(
  listener: (context, state) {
    if (state is AuthError) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(state.message)),
      );
    }
    if (state is AuthAuthenticated) {
      context.go('/home');
    }
  },
  child: const LoginForm(),
)

// Combined: BlocConsumer = BlocBuilder + BlocListener
BlocConsumer<AuthBloc, AuthState>(
  listener: (context, state) {
    // Side effects (navigation, snackbar, dialog)
  },
  builder: (context, state) {
    // Build UI
    return const Placeholder();
  },
)

// Dispatch events
context.read<AuthBloc>().add(LoginRequested(email: email, password: password));
```

### Bloc vs Cubit
| Feature | Cubit | Bloc |
|---|---|---|
| **API** | `emit(newState)` | `add(event)` → `on<Event>` → `emit(state)` |
| **Traceability** | Low (direct state changes) | High (events are logged) |
| **Boilerplate** | Less | More (events + handlers) |
| **Best For** | Simple state | Complex flows, event-driven |
| **Testing** | Test methods directly | Test event → state transitions |

> **Interview Tip**: Bloc enforces a strict event → state pattern, making state changes traceable and testable. Cubit is simpler for straightforward state. Prefer Bloc for complex business logic with multiple entry points.

---

## 7. State Management Decision Guide

```
Is the state local to one widget?
├── YES → setState()
└── NO → Is it shared across widgets?
    ├── Is your app small/medium?
    │   ├── YES → Provider or Riverpod
    │   └── Want compile safety? → Riverpod
    └── Is your app large/enterprise?
        └── Bloc (event-driven traceability)
```

---

## Quick Revision: State Management

| Solution | Key API | Listen | Read (no rebuild) | Best For |
|---|---|---|---|---|
| `setState` | `setState(() { })` | N/A | N/A | Local state |
| Provider | `context.watch<T>()` | `watch` | `read` | Simple shared state |
| Riverpod | `ref.watch(provider)` | `watch` | `read` | Compile-safe, testable |
| Bloc | `BlocBuilder<B, S>` | `BlocBuilder` | `context.read<B>()` | Enterprise, event-driven |
| Cubit | `BlocBuilder<C, S>` | `BlocBuilder` | `context.read<C>()` | Simple Bloc alternative |
