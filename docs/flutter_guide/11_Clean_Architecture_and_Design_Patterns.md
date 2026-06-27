# Clean Architecture & Design Patterns

## 1. Clean Architecture

Uncle Bob's Clean Architecture separates software into concentric layers, each with distinct responsibilities. The core rule: **dependencies always point inward** — outer layers know about inner layers, never the reverse.

```
╔══════════════════════════════════════════════════════════════════╗
║                      CLEAN ARCHITECTURE                          ║
║                                                                  ║
║   ┌──────────────────────────────────────────────────────────┐   ║
║   │                   PRESENTATION LAYER                     │   ║
║   │   Widgets · BLoCs / Cubits · ViewModels · Pages · UI     │   ║
║   │                                                          │   ║
║   │   ┌──────────────────────────────────────────────────┐   │   ║
║   │   │                  DOMAIN LAYER                    │   │   ║
║   │   │   Entities · Use Cases · Repository Interfaces   │   │   ║
║   │   │                                                  │   │   ║
║   │   │   ┌──────────────────────────────────────────┐   │   │   ║
║   │   │   │              DATA LAYER                  │   │   │   ║
║   │   │   │  Models · Repos · DataSources · DTOs     │   │   │   ║
║   │   │   └──────────────────────────────────────────┘   │   │   ║
║   │   │                                                  │   │   ║
║   │   └──────────────────────────────────────────────────┘   │   ║
║   │                                                          │   ║
║   └──────────────────────────────────────────────────────────┘   ║
║                                                                  ║
║   DEPENDENCY RULE: Outer → Inner (never the reverse)             ║
╚══════════════════════════════════════════════════════════════════╝
```

### The Dependency Rule

```
Presentation ──depends on──► Domain ◄──depends on── Data
                               ▲
                     (innermost — knows nothing
                      about UI or databases)
```

- **Domain** layer is pure Dart — no Flutter imports, no packages.
- **Presentation** depends on Domain (calls use cases, reads entities).
- **Data** depends on Domain (implements repository interfaces, maps models to entities).
- **Presentation** and **Data** never depend on each other directly.

> **Interview Tip**: The dependency rule is the #1 thing interviewers ask. Always say: "Dependencies point inward. The domain layer has zero dependencies on Flutter, databases, or network libraries."

### Folder Structure (Feature-First with Layers)

```
lib/
├── core/
│   ├── error/
│   │   ├── failures.dart
│   │   └── exceptions.dart
│   ├── usecases/
│   │   └── usecase.dart          # Base UseCase interface
│   ├── network/
│   │   └── network_info.dart
│   └── utils/
│       └── constants.dart
│
├── features/
│   ├── authentication/
│   │   ├── data/
│   │   │   ├── datasources/
│   │   │   │   ├── auth_remote_data_source.dart
│   │   │   │   └── auth_local_data_source.dart
│   │   │   ├── models/
│   │   │   │   └── user_model.dart
│   │   │   └── repositories/
│   │   │       └── auth_repository_impl.dart
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   │   └── user.dart
│   │   │   ├── repositories/
│   │   │   │   └── auth_repository.dart
│   │   │   └── usecases/
│   │   │       ├── login_user.dart
│   │   │       └── register_user.dart
│   │   └── presentation/
│   │       ├── bloc/
│   │       │   ├── auth_bloc.dart
│   │       │   ├── auth_event.dart
│   │       │   └── auth_state.dart
│   │       ├── pages/
│   │       │   ├── login_page.dart
│   │       │   └── register_page.dart
│   │       └── widgets/
│   │           └── auth_form.dart
│   │
│   └── products/
│       ├── data/ ...
│       ├── domain/ ...
│       └── presentation/ ...
│
├── injection_container.dart       # get_it / injectable setup
└── main.dart
```

---

## 2. Domain Layer

The innermost layer — pure Dart, no dependencies on Flutter or external packages (except for functional types like `Either`).

### 2.1 Entities

Entities are core business objects. They contain **enterprise-wide business rules**.

```dart
// domain/entities/user.dart
import 'package:equatable/equatable.dart';

class User extends Equatable {
  final String id;
  final String email;
  final String name;
  final DateTime createdAt;

  const User({
    required this.id,
    required this.email,
    required this.name,
    required this.createdAt,
  });

  /// Domain logic lives ON the entity
  bool get isEmailVerified => email.contains('@');

  String get displayName => name.isNotEmpty ? name : email.split('@').first;

  @override
  List<Object?> get props => [id, email, name, createdAt];
}
```

```dart
// domain/entities/product.dart
class Product extends Equatable {
  final String id;
  final String title;
  final double price;
  final String category;
  final int stockCount;

  const Product({
    required this.id,
    required this.title,
    required this.price,
    required this.category,
    required this.stockCount,
  });

  bool get isInStock => stockCount > 0;
  bool get isOnSale => price < 50.0;

  @override
  List<Object?> get props => [id, title, price, category, stockCount];
}
```

> **Interview Tip**: Entities should be immutable and should NOT contain any serialization logic (no `fromJson`/`toJson`). That belongs in the Data layer's Models.

### 2.2 Repository Interfaces (Contracts)

Defined in Domain, implemented in Data. This is the **Dependency Inversion** principle.

```dart
// domain/repositories/auth_repository.dart
import 'package:dartz/dartz.dart';

abstract class AuthRepository {
  /// Returns [User] on success or [Failure] on error.
  Future<Either<Failure, User>> login(String email, String password);
  Future<Either<Failure, User>> register(String email, String password, String name);
  Future<Either<Failure, User>> getCurrentUser();
  Future<Either<Failure, void>> logout();
}
```

```dart
// domain/repositories/product_repository.dart
abstract class ProductRepository {
  Future<Either<Failure, List<Product>>> getProducts({int page = 1});
  Future<Either<Failure, Product>> getProductById(String id);
  Future<Either<Failure, List<Product>>> searchProducts(String query);
}
```

### 2.3 Use Cases (Single Responsibility)

Each use case represents **one action** the user can perform.

```dart
// core/usecases/usecase.dart — Base interface
import 'package:dartz/dartz.dart';
import 'package:equatable/equatable.dart';

/// Type = return type, Params = input parameters
abstract class UseCase<Type, Params> {
  Future<Either<Failure, Type>> call(Params params);
}

/// When no parameters are needed
class NoParams extends Equatable {
  @override
  List<Object?> get props => [];
}
```

```dart
// domain/usecases/login_user.dart
class LoginUser implements UseCase<User, LoginParams> {
  final AuthRepository repository;

  const LoginUser(this.repository);

  @override
  Future<Either<Failure, User>> call(LoginParams params) {
    return repository.login(params.email, params.password);
  }
}

class LoginParams extends Equatable {
  final String email;
  final String password;

  const LoginParams({required this.email, required this.password});

  @override
  List<Object?> get props => [email, password];
}
```

```dart
// domain/usecases/get_products.dart
class GetProducts implements UseCase<List<Product>, GetProductsParams> {
  final ProductRepository repository;

  const GetProducts(this.repository);

  @override
  Future<Either<Failure, List<Product>>> call(GetProductsParams params) {
    return repository.getProducts(page: params.page);
  }
}

class GetProductsParams extends Equatable {
  final int page;
  const GetProductsParams({this.page = 1});

  @override
  List<Object?> get props => [page];
}
```

```dart
// domain/usecases/get_current_user.dart
class GetCurrentUser implements UseCase<User, NoParams> {
  final AuthRepository repository;

  const GetCurrentUser(this.repository);

  @override
  Future<Either<Failure, User>> call(NoParams params) {
    return repository.getCurrentUser();
  }
}
```

> **Interview Tip**: Use cases enforce single responsibility. If an interviewer asks "why not call the repository directly from the BLoC?", answer: "Use cases encapsulate business logic that may involve multiple repositories, validation, or orchestration — keeping the presentation layer thin."

### 2.4 Failure Handling (Either/Result Pattern)

```dart
// core/error/failures.dart
import 'package:equatable/equatable.dart';

abstract class Failure extends Equatable {
  final String message;
  const Failure(this.message);

  @override
  List<Object?> get props => [message];
}

class ServerFailure extends Failure {
  const ServerFailure([super.message = 'Server error occurred']);
}

class CacheFailure extends Failure {
  const CacheFailure([super.message = 'Cache error occurred']);
}

class NetworkFailure extends Failure {
  const NetworkFailure([super.message = 'No internet connection']);
}

class AuthFailure extends Failure {
  const AuthFailure([super.message = 'Authentication failed']);
}

class ValidationFailure extends Failure {
  final Map<String, String> fieldErrors;
  const ValidationFailure(this.fieldErrors, [super.message = 'Validation failed']);

  @override
  List<Object?> get props => [message, fieldErrors];
}
```

```dart
// core/error/exceptions.dart
class ServerException implements Exception {
  final String message;
  final int? statusCode;
  const ServerException({this.message = 'Server error', this.statusCode});
}

class CacheException implements Exception {
  final String message;
  const CacheException({this.message = 'Cache error'});
}

class NetworkException implements Exception {
  final String message;
  const NetworkException({this.message = 'No internet connection'});
}
```

```
Flow: Exception → caught in Repository Impl → converted to Failure → returned as Left(Failure)

  DataSource throws       Repository catches        UseCase returns
  ┌──────────────┐       ┌──────────────────┐      ┌──────────────────┐
  │ServerException│──────►│ try/catch block   │─────►│Left(ServerFailure)│
  └──────────────┘       │ returns Either    │      └──────────────────┘
                         └──────────────────┘
                                  │
                    on success ───┘
                         ┌──────────────────┐
                         │ Right(Entity)     │
                         └──────────────────┘
```

---

## 3. Data Layer

Implements repository contracts, handles serialization, and manages data sources.

### 3.1 Models (DTOs — Data Transfer Objects)

Models extend or map to entities and contain serialization logic.

```dart
// data/models/user_model.dart
class UserModel extends User {
  const UserModel({
    required super.id,
    required super.email,
    required super.name,
    required super.createdAt,
  });

  /// From JSON → Model
  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      email: json['email'] as String,
      name: json['name'] as String? ?? '',
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  /// Model → JSON
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'name': name,
      'created_at': createdAt.toIso8601String(),
    };
  }

  /// Entity → Model (for caching)
  factory UserModel.fromEntity(User user) {
    return UserModel(
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    );
  }
}
```

```dart
// data/models/product_model.dart
class ProductModel extends Product {
  const ProductModel({
    required super.id,
    required super.title,
    required super.price,
    required super.category,
    required super.stockCount,
  });

  factory ProductModel.fromJson(Map<String, dynamic> json) {
    return ProductModel(
      id: json['id'] as String,
      title: json['title'] as String,
      price: (json['price'] as num).toDouble(),
      category: json['category'] as String,
      stockCount: json['stock_count'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'price': price,
      'category': category,
      'stock_count': stockCount,
    };
  }
}
```

### DTOs vs Entities — Key Differences

| Aspect | Entity (Domain) | Model / DTO (Data) |
|--------|-----------------|---------------------|
| **Location** | `domain/entities/` | `data/models/` |
| **Purpose** | Business logic carrier | Serialization & transport |
| **Dependencies** | None (pure Dart) | json_annotation, freezed, etc. |
| **Methods** | Business rules | `fromJson()`, `toJson()` |
| **Mutability** | Immutable | Immutable (typically) |
| **Inherits from** | `Equatable` | Extends Entity or maps to it |

> **Interview Tip**: "Why not use the same class for Entity and Model?" — Answer: Separation of concerns. If the API response format changes, only the Model changes. The Entity (and all domain/presentation code) remains untouched. This is the core value of Clean Architecture.

### 3.2 Data Sources

```dart
// data/datasources/auth_remote_data_source.dart
abstract class AuthRemoteDataSource {
  Future<UserModel> login(String email, String password);
  Future<UserModel> register(String email, String password, String name);
  Future<UserModel> getCurrentUser();
  Future<void> logout();
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final http.Client client;
  final String baseUrl;

  const AuthRemoteDataSourceImpl({
    required this.client,
    this.baseUrl = 'https://api.example.com',
  });

  @override
  Future<UserModel> login(String email, String password) async {
    final response = await client.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      return UserModel.fromJson(data['user']);
    } else {
      throw ServerException(
        message: 'Login failed',
        statusCode: response.statusCode,
      );
    }
  }

  @override
  Future<UserModel> getCurrentUser() async {
    final response = await client.get(
      Uri.parse('$baseUrl/auth/me'),
      headers: {'Content-Type': 'application/json'},
    );

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body) as Map<String, dynamic>;
      return UserModel.fromJson(data['user']);
    } else {
      throw ServerException(statusCode: response.statusCode);
    }
  }

  // ... register, logout implementations
}
```

```dart
// data/datasources/auth_local_data_source.dart
abstract class AuthLocalDataSource {
  Future<UserModel?> getCachedUser();
  Future<void> cacheUser(UserModel user);
  Future<void> clearCache();
}

class AuthLocalDataSourceImpl implements AuthLocalDataSource {
  final SharedPreferences sharedPreferences;
  static const cachedUserKey = 'CACHED_USER';

  const AuthLocalDataSourceImpl({required this.sharedPreferences});

  @override
  Future<UserModel?> getCachedUser() async {
    final jsonString = sharedPreferences.getString(cachedUserKey);
    if (jsonString != null) {
      final json = jsonDecode(jsonString) as Map<String, dynamic>;
      return UserModel.fromJson(json);
    }
    return null;
  }

  @override
  Future<void> cacheUser(UserModel user) async {
    await sharedPreferences.setString(
      cachedUserKey,
      jsonEncode(user.toJson()),
    );
  }

  @override
  Future<void> clearCache() async {
    await sharedPreferences.remove(cachedUserKey);
  }
}
```

### 3.3 Repository Implementations

```dart
// data/repositories/auth_repository_impl.dart
class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final AuthLocalDataSource localDataSource;
  final NetworkInfo networkInfo;

  const AuthRepositoryImpl({
    required this.remoteDataSource,
    required this.localDataSource,
    required this.networkInfo,
  });

  @override
  Future<Either<Failure, User>> login(String email, String password) async {
    if (await networkInfo.isConnected) {
      try {
        final userModel = await remoteDataSource.login(email, password);
        // Cache on successful login
        await localDataSource.cacheUser(userModel);
        return Right(userModel); // UserModel IS-A User (extends it)
      } on ServerException catch (e) {
        return Left(ServerFailure(e.message));
      }
    } else {
      return const Left(NetworkFailure());
    }
  }

  @override
  Future<Either<Failure, User>> getCurrentUser() async {
    try {
      if (await networkInfo.isConnected) {
        final userModel = await remoteDataSource.getCurrentUser();
        await localDataSource.cacheUser(userModel);
        return Right(userModel);
      } else {
        // Offline fallback
        final cachedUser = await localDataSource.getCachedUser();
        if (cachedUser != null) {
          return Right(cachedUser);
        }
        return const Left(CacheFailure('No cached user found'));
      }
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    } on CacheException catch (e) {
      return Left(CacheFailure(e.message));
    }
  }

  @override
  Future<Either<Failure, void>> logout() async {
    try {
      await remoteDataSource.logout();
      await localDataSource.clearCache();
      return const Right(null);
    } on ServerException catch (e) {
      return Left(ServerFailure(e.message));
    }
  }

  // ... register implementation
}
```

> **Interview Tip**: The repository implementation is the *bridge* between Data and Domain layers. It catches exceptions from data sources and converts them to `Failure` objects using the `Either` type. This guarantees no exceptions leak into the domain or presentation layers.

---

## 4. Presentation Layer

### 4.1 BLoC Integration with Clean Architecture

```dart
// presentation/bloc/auth_event.dart
abstract class AuthEvent extends Equatable {
  const AuthEvent();

  @override
  List<Object?> get props => [];
}

class LoginRequested extends AuthEvent {
  final String email;
  final String password;

  const LoginRequested({required this.email, required this.password});

  @override
  List<Object?> get props => [email, password];
}

class LogoutRequested extends AuthEvent {}

class AuthCheckRequested extends AuthEvent {}
```

```dart
// presentation/bloc/auth_state.dart
abstract class AuthState extends Equatable {
  const AuthState();

  @override
  List<Object?> get props => [];
}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

class AuthAuthenticated extends AuthState {
  final User user;
  const AuthAuthenticated(this.user);

  @override
  List<Object?> get props => [user];
}

class AuthUnauthenticated extends AuthState {}

class AuthError extends AuthState {
  final String message;
  const AuthError(this.message);

  @override
  List<Object?> get props => [message];
}
```

```dart
// presentation/bloc/auth_bloc.dart
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final LoginUser loginUser;          // Use case — NOT repository
  final GetCurrentUser getCurrentUser;
  final LogoutUser logoutUser;

  AuthBloc({
    required this.loginUser,
    required this.getCurrentUser,
    required this.logoutUser,
  }) : super(AuthInitial()) {
    on<LoginRequested>(_onLoginRequested);
    on<LogoutRequested>(_onLogoutRequested);
    on<AuthCheckRequested>(_onAuthCheckRequested);
  }

  Future<void> _onLoginRequested(
    LoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());

    final result = await loginUser(
      LoginParams(email: event.email, password: event.password),
    );

    // fold: Left → failure callback, Right → success callback
    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (user) => emit(AuthAuthenticated(user)),
    );
  }

  Future<void> _onLogoutRequested(
    LogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    final result = await logoutUser(NoParams());
    result.fold(
      (failure) => emit(AuthError(failure.message)),
      (_) => emit(AuthUnauthenticated()),
    );
  }

  Future<void> _onAuthCheckRequested(
    AuthCheckRequested event,
    Emitter<AuthState> emit,
  ) async {
    final result = await getCurrentUser(NoParams());
    result.fold(
      (failure) => emit(AuthUnauthenticated()),
      (user) => emit(AuthAuthenticated(user)),
    );
  }
}
```

### 4.2 Riverpod Integration with Clean Architecture

```dart
// presentation/providers/auth_providers.dart

// --- Data Source Providers ---
final authRemoteDataSourceProvider = Provider<AuthRemoteDataSource>((ref) {
  return AuthRemoteDataSourceImpl(client: ref.watch(httpClientProvider));
});

final authLocalDataSourceProvider = Provider<AuthLocalDataSource>((ref) {
  return AuthLocalDataSourceImpl(
    sharedPreferences: ref.watch(sharedPreferencesProvider),
  );
});

// --- Repository Provider ---
final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepositoryImpl(
    remoteDataSource: ref.watch(authRemoteDataSourceProvider),
    localDataSource: ref.watch(authLocalDataSourceProvider),
    networkInfo: ref.watch(networkInfoProvider),
  );
});

// --- Use Case Providers ---
final loginUserProvider = Provider<LoginUser>((ref) {
  return LoginUser(ref.watch(authRepositoryProvider));
});

final getCurrentUserProvider = Provider<GetCurrentUser>((ref) {
  return GetCurrentUser(ref.watch(authRepositoryProvider));
});

// --- State Notifier ---
final authStateProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    loginUser: ref.watch(loginUserProvider),
    getCurrentUser: ref.watch(getCurrentUserProvider),
  );
});

class AuthNotifier extends StateNotifier<AuthState> {
  final LoginUser loginUser;
  final GetCurrentUser getCurrentUser;

  AuthNotifier({
    required this.loginUser,
    required this.getCurrentUser,
  }) : super(AuthInitial());

  Future<void> login(String email, String password) async {
    state = AuthLoading();

    final result = await loginUser(
      LoginParams(email: email, password: password),
    );

    state = result.fold(
      (failure) => AuthError(failure.message),
      (user) => AuthAuthenticated(user),
    );
  }
}
```

### 4.3 UI Binding

```dart
// presentation/pages/login_page.dart
class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocConsumer<AuthBloc, AuthState>(
      listener: (context, state) {
        if (state is AuthAuthenticated) {
          Navigator.of(context).pushReplacementNamed('/home');
        }
        if (state is AuthError) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(state.message)),
          );
        }
      },
      builder: (context, state) {
        return Scaffold(
          appBar: AppBar(title: const Text('Login')),
          body: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                TextField(
                  controller: _emailController,
                  decoration: const InputDecoration(labelText: 'Email'),
                ),
                const SizedBox(height: 16),
                TextField(
                  controller: _passwordController,
                  obscureText: true,
                  decoration: const InputDecoration(labelText: 'Password'),
                ),
                const SizedBox(height: 24),
                if (state is AuthLoading)
                  const CircularProgressIndicator()
                else
                  ElevatedButton(
                    onPressed: () {
                      context.read<AuthBloc>().add(
                        LoginRequested(
                          email: _emailController.text,
                          password: _passwordController.text,
                        ),
                      );
                    },
                    child: const Text('Login'),
                  ),
              ],
            ),
          ),
        );
      },
    );
  }
}
```

> **Interview Tip**: The presentation layer should ONLY talk to use cases. It should never import data layer classes directly. If you see a BLoC importing a DataSource, the architecture is broken.

---

## 5. Dependency Injection with Clean Architecture

### 5.1 get_it Registration by Layer

```dart
// injection_container.dart
import 'package:get_it/get_it.dart';

final sl = GetIt.instance; // sl = Service Locator

Future<void> init() async {
  // ─────────────────────── External ───────────────────────
  final sharedPreferences = await SharedPreferences.getInstance();
  sl.registerLazySingleton(() => sharedPreferences);
  sl.registerLazySingleton(() => http.Client());
  sl.registerLazySingleton<NetworkInfo>(() => NetworkInfoImpl());

  // ─────────────────────── Features ───────────────────────
  _initAuth();
  _initProducts();
}

void _initAuth() {
  // BLoC — registered as Factory (new instance per screen)
  sl.registerFactory(
    () => AuthBloc(
      loginUser: sl(),
      getCurrentUser: sl(),
      logoutUser: sl(),
    ),
  );

  // Use Cases
  sl.registerLazySingleton(() => LoginUser(sl()));
  sl.registerLazySingleton(() => GetCurrentUser(sl()));
  sl.registerLazySingleton(() => LogoutUser(sl()));

  // Repository
  sl.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(
      remoteDataSource: sl(),
      localDataSource: sl(),
      networkInfo: sl(),
    ),
  );

  // Data Sources
  sl.registerLazySingleton<AuthRemoteDataSource>(
    () => AuthRemoteDataSourceImpl(client: sl()),
  );
  sl.registerLazySingleton<AuthLocalDataSource>(
    () => AuthLocalDataSourceImpl(sharedPreferences: sl()),
  );
}

void _initProducts() {
  // BLoC
  sl.registerFactory(
    () => ProductBloc(getProducts: sl(), searchProducts: sl()),
  );

  // Use Cases
  sl.registerLazySingleton(() => GetProducts(sl()));
  sl.registerLazySingleton(() => SearchProducts(sl()));

  // Repository
  sl.registerLazySingleton<ProductRepository>(
    () => ProductRepositoryImpl(remoteDataSource: sl(), networkInfo: sl()),
  );

  // Data Sources
  sl.registerLazySingleton<ProductRemoteDataSource>(
    () => ProductRemoteDataSourceImpl(client: sl()),
  );
}
```

```dart
// main.dart
void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await init(); // Initialize DI container
  runApp(const MyApp());
}
```

### 5.2 Injectable (Code Generation)

```dart
// injection_container.dart — with injectable
import 'package:get_it/get_it.dart';
import 'package:injectable/injectable.dart';
import 'injection_container.config.dart';

final getIt = GetIt.instance;

@InjectableInit()
Future<void> configureDependencies() async => getIt.init();
```

```dart
// Annotate your classes:
@lazySingleton
class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final http.Client client;
  const AuthRemoteDataSourceImpl(@Named('httpClient') this.client);
  // ...
}

@LazySingleton(as: AuthRepository) // Register as interface type
class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;
  final AuthLocalDataSource localDataSource;
  final NetworkInfo networkInfo;

  const AuthRepositoryImpl(
    this.remoteDataSource,
    this.localDataSource,
    this.networkInfo,
  );
  // ...
}

@injectable // Factory — new instance each time
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  AuthBloc(this.loginUser, this.getCurrentUser, this.logoutUser)
      : super(AuthInitial());
  // ...
}
```

| Registration | get_it Method | Injectable Annotation | Lifecycle |
|---|---|---|---|
| **Singleton** | `registerSingleton` | `@singleton` | Created once at registration |
| **Lazy Singleton** | `registerLazySingleton` | `@lazySingleton` | Created once on first access |
| **Factory** | `registerFactory` | `@injectable` | New instance every time |
| **Async Singleton** | `registerSingletonAsync` | `@preResolve` | Async init, awaited at startup |

> **Interview Tip**: BLoCs/Cubits should be registered as **factories** (new instance per screen), while repositories and data sources should be **lazy singletons** (shared, one instance).

---

## 6. Design Patterns in Flutter

### 6.1 Singleton Pattern

Ensures only one instance of a class exists throughout the app.

```dart
class AppDatabase {
  // Private constructor
  AppDatabase._internal();

  // The single instance
  static final AppDatabase _instance = AppDatabase._internal();

  // Factory constructor always returns the same instance
  factory AppDatabase() => _instance;

  // Alternatively: static getter
  static AppDatabase get instance => _instance;

  Database? _db;

  Future<Database> get database async {
    _db ??= await _initDatabase();
    return _db!;
  }

  Future<Database> _initDatabase() async {
    final path = await getDatabasesPath();
    return openDatabase(
      join(path, 'app.db'),
      version: 1,
      onCreate: _createTables,
    );
  }

  Future<void> _createTables(Database db, int version) async {
    await db.execute('''
      CREATE TABLE users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        name TEXT NOT NULL
      )
    ''');
  }
}

// Usage — both return the SAME instance
final db1 = AppDatabase();
final db2 = AppDatabase.instance;
assert(identical(db1, db2)); // true
```

### 6.2 Factory Pattern

Creates objects without exposing instantiation logic.

```dart
// Abstract payment processor
abstract class PaymentProcessor {
  Future<PaymentResult> processPayment(double amount);
  String get name;
}

class StripeProcessor implements PaymentProcessor {
  @override
  String get name => 'Stripe';

  @override
  Future<PaymentResult> processPayment(double amount) async {
    // Stripe-specific logic
    return PaymentResult(success: true, transactionId: 'stripe_${DateTime.now().millisecondsSinceEpoch}');
  }
}

class PayPalProcessor implements PaymentProcessor {
  @override
  String get name => 'PayPal';

  @override
  Future<PaymentResult> processPayment(double amount) async {
    // PayPal-specific logic
    return PaymentResult(success: true, transactionId: 'paypal_${DateTime.now().millisecondsSinceEpoch}');
  }
}

class RazorpayProcessor implements PaymentProcessor {
  @override
  String get name => 'Razorpay';

  @override
  Future<PaymentResult> processPayment(double amount) async {
    return PaymentResult(success: true, transactionId: 'rzp_${DateTime.now().millisecondsSinceEpoch}');
  }
}

// Factory
class PaymentProcessorFactory {
  static PaymentProcessor create(PaymentMethod method) {
    return switch (method) {
      PaymentMethod.stripe   => StripeProcessor(),
      PaymentMethod.paypal   => PayPalProcessor(),
      PaymentMethod.razorpay => RazorpayProcessor(),
    };
  }
}

enum PaymentMethod { stripe, paypal, razorpay }

// Usage
final processor = PaymentProcessorFactory.create(PaymentMethod.stripe);
final result = await processor.processPayment(99.99);
```

### 6.3 Builder Pattern

Constructs complex objects step-by-step.

```dart
class QueryBuilder {
  String _table = '';
  final List<String> _conditions = [];
  final List<String> _columns = [];
  String _orderBy = '';
  int? _limit;

  QueryBuilder table(String table) {
    _table = table;
    return this;
  }

  QueryBuilder select(List<String> columns) {
    _columns.addAll(columns);
    return this;
  }

  QueryBuilder where(String condition) {
    _conditions.add(condition);
    return this;
  }

  QueryBuilder orderBy(String column, {bool descending = false}) {
    _orderBy = '$column ${descending ? "DESC" : "ASC"}';
    return this;
  }

  QueryBuilder limit(int count) {
    _limit = count;
    return this;
  }

  String build() {
    final cols = _columns.isEmpty ? '*' : _columns.join(', ');
    var query = 'SELECT $cols FROM $_table';

    if (_conditions.isNotEmpty) {
      query += ' WHERE ${_conditions.join(' AND ')}';
    }
    if (_orderBy.isNotEmpty) {
      query += ' ORDER BY $_orderBy';
    }
    if (_limit != null) {
      query += ' LIMIT $_limit';
    }

    return query;
  }
}

// Usage — fluent, readable chain
final query = QueryBuilder()
    .table('products')
    .select(['id', 'title', 'price'])
    .where('price > 10')
    .where('category = "electronics"')
    .orderBy('price', descending: true)
    .limit(20)
    .build();

// Output: SELECT id, title, price FROM products
//         WHERE price > 10 AND category = "electronics"
//         ORDER BY price DESC LIMIT 20
```

### 6.4 Observer Pattern

Notify multiple listeners when state changes. Flutter's `ChangeNotifier` and `ValueNotifier` are built-in observer patterns.

```dart
// Custom Observer implementation
abstract class EventListener<T> {
  void onEvent(T event);
}

class EventBus<T> {
  final List<EventListener<T>> _listeners = [];

  void subscribe(EventListener<T> listener) {
    _listeners.add(listener);
  }

  void unsubscribe(EventListener<T> listener) {
    _listeners.remove(listener);
  }

  void publish(T event) {
    for (final listener in _listeners) {
      listener.onEvent(event);
    }
  }

  void dispose() {
    _listeners.clear();
  }
}

// Concrete event
class CartEvent {
  final String productId;
  final CartAction action;
  const CartEvent(this.productId, this.action);
}

enum CartAction { added, removed, updated }

// Concrete listener
class AnalyticsTracker implements EventListener<CartEvent> {
  @override
  void onEvent(CartEvent event) {
    print('Analytics: ${event.action.name} product ${event.productId}');
  }
}

class NotificationService implements EventListener<CartEvent> {
  @override
  void onEvent(CartEvent event) {
    if (event.action == CartAction.added) {
      // Show local notification
    }
  }
}

// Usage
final cartEventBus = EventBus<CartEvent>();
cartEventBus.subscribe(AnalyticsTracker());
cartEventBus.subscribe(NotificationService());
cartEventBus.publish(CartEvent('prod_123', CartAction.added));
```

### 6.5 Strategy Pattern

Swap algorithms at runtime without changing the consuming code.

```dart
// Strategy interface
abstract class SortStrategy<T> {
  List<T> sort(List<T> items);
  String get name;
}

class PriceLowToHigh implements SortStrategy<Product> {
  @override
  String get name => 'Price: Low to High';

  @override
  List<Product> sort(List<Product> items) {
    return List.of(items)..sort((a, b) => a.price.compareTo(b.price));
  }
}

class PriceHighToLow implements SortStrategy<Product> {
  @override
  String get name => 'Price: High to Low';

  @override
  List<Product> sort(List<Product> items) {
    return List.of(items)..sort((a, b) => b.price.compareTo(a.price));
  }
}

class NameAlphabetical implements SortStrategy<Product> {
  @override
  String get name => 'Name: A-Z';

  @override
  List<Product> sort(List<Product> items) {
    return List.of(items)..sort((a, b) => a.title.compareTo(b.title));
  }
}

// Context class that uses the strategy
class ProductSorter {
  SortStrategy<Product> _strategy;

  ProductSorter(this._strategy);

  void setStrategy(SortStrategy<Product> strategy) {
    _strategy = strategy;
  }

  List<Product> sortProducts(List<Product> products) {
    return _strategy.sort(products);
  }
}

// Usage — swap strategies at runtime
final sorter = ProductSorter(PriceLowToHigh());
var sorted = sorter.sortProducts(products);

sorter.setStrategy(PriceHighToLow());
sorted = sorter.sortProducts(products);
```

### 6.6 Repository Pattern

Abstracts data access behind a clean interface (already covered above, but here's a minimal standalone example).

```dart
// The pattern in its purest form
abstract class Repository<T> {
  Future<List<T>> getAll();
  Future<T?> getById(String id);
  Future<void> create(T item);
  Future<void> update(T item);
  Future<void> delete(String id);
}

class InMemoryRepository<T extends HasId> implements Repository<T> {
  final Map<String, T> _store = {};

  @override
  Future<List<T>> getAll() async => _store.values.toList();

  @override
  Future<T?> getById(String id) async => _store[id];

  @override
  Future<void> create(T item) async => _store[item.id] = item;

  @override
  Future<void> update(T item) async => _store[item.id] = item;

  @override
  Future<void> delete(String id) async => _store.remove(id);
}

abstract class HasId {
  String get id;
}
```

### 6.7 Adapter Pattern

Converts one interface into another that clients expect. Common when integrating third-party libraries.

```dart
// Third-party analytics SDK with its own interface
class FirebaseAnalyticsSDK {
  void logEvent(String eventName, Map<String, Object> params) {
    // Firebase-specific implementation
  }
}

class MixpanelSDK {
  void track(String event, {Map<String, dynamic>? properties}) {
    // Mixpanel-specific implementation
  }
}

// Our app's expected interface
abstract class AnalyticsService {
  void trackEvent(String name, {Map<String, dynamic>? data});
  void trackScreen(String screenName);
}

// Adapter for Firebase
class FirebaseAnalyticsAdapter implements AnalyticsService {
  final FirebaseAnalyticsSDK _firebase;

  FirebaseAnalyticsAdapter(this._firebase);

  @override
  void trackEvent(String name, {Map<String, dynamic>? data}) {
    _firebase.logEvent(name, data?.cast<String, Object>() ?? {});
  }

  @override
  void trackScreen(String screenName) {
    _firebase.logEvent('screen_view', {'screen_name': screenName});
  }
}

// Adapter for Mixpanel
class MixpanelAnalyticsAdapter implements AnalyticsService {
  final MixpanelSDK _mixpanel;

  MixpanelAnalyticsAdapter(this._mixpanel);

  @override
  void trackEvent(String name, {Map<String, dynamic>? data}) {
    _mixpanel.track(name, properties: data);
  }

  @override
  void trackScreen(String screenName) {
    _mixpanel.track('Screen View', properties: {'name': screenName});
  }
}

// Usage — swap analytics providers without changing app code
final AnalyticsService analytics = FirebaseAnalyticsAdapter(FirebaseAnalyticsSDK());
analytics.trackEvent('purchase', data: {'amount': 99.99});
analytics.trackScreen('Home');
```

### 6.8 BLoC as a Design Pattern

BLoC (Business Logic Component) is itself a design pattern — it separates business logic from UI via streams of events and states.

```
  ┌──────────────────────────────────────────────────────┐
  │                        UI                            │
  │                                                      │
  │   User taps button                                   │
  │        │                                             │
  │        ▼                                             │
  │   bloc.add(Event) ──────────► ┌──────────────┐       │
  │                               │     BLoC     │       │
  │                               │              │       │
  │                               │  mapEvent    │       │
  │                               │  ToState()   │       │
  │                               │              │       │
  │   BlocBuilder ◄─── Stream ◄── │  emit(State) │       │
  │        │                      └──────────────┘       │
  │        ▼                                             │
  │   Rebuild widget with new state                      │
  └──────────────────────────────────────────────────────┘
```

```dart
// Minimal BLoC pattern from scratch (without the bloc package)
class CounterBloc {
  int _count = 0;

  // Input stream (Events)
  final _eventController = StreamController<CounterEvent>();
  Sink<CounterEvent> get eventSink => _eventController.sink;

  // Output stream (States)
  final _stateController = StreamController<int>.broadcast();
  Stream<int> get stateStream => _stateController.stream;

  CounterBloc() {
    _eventController.stream.listen(_mapEventToState);
  }

  void _mapEventToState(CounterEvent event) {
    switch (event) {
      case CounterEvent.increment:
        _count++;
      case CounterEvent.decrement:
        _count--;
      case CounterEvent.reset:
        _count = 0;
    }
    _stateController.add(_count);
  }

  void dispose() {
    _eventController.close();
    _stateController.close();
  }
}

enum CounterEvent { increment, decrement, reset }
```

### Design Patterns Summary Table

| Pattern | Purpose | Flutter Example |
|---------|---------|-----------------|
| **Singleton** | One shared instance | Database, SharedPreferences wrapper |
| **Factory** | Create objects by type | Widget factories, payment processors |
| **Builder** | Step-by-step construction | Query builders, theme builders |
| **Observer** | Notify on state change | ChangeNotifier, Streams, EventBus |
| **Strategy** | Swap algorithms at runtime | Sorting, validation, formatting |
| **Repository** | Abstract data access | Data layer in Clean Architecture |
| **Adapter** | Convert interfaces | Third-party SDK wrappers |
| **BLoC** | Separate business logic from UI | Event-in → State-out via streams |

> **Interview Tip**: When asked "what design patterns do you use in Flutter?", cover at least: Repository (data abstraction), Observer (ChangeNotifier, streams), Factory (widget building), and BLoC (architecture). Bonus: mention Strategy for features like sorting/filtering.

---

## 7. MVVM vs MVC vs MVP in Flutter

```
  MVC                        MVP                         MVVM
  ───                        ───                         ────
  ┌──────┐                  ┌──────┐                   ┌──────┐
  │ View │◄────────────────►│ View │                   │ View │
  └──┬───┘                  └──┬───┘                   └──┬───┘
     │                         │                          │
     │  User action            │  delegates               │ data binding
     ▼                         ▼                          ▼
  ┌──────────┐            ┌───────────┐             ┌───────────┐
  │Controller│            │ Presenter │             │ ViewModel │
  └──┬───────┘            └──┬────────┘             └──┬────────┘
     │                       │                         │
     │  updates              │  updates                │  updates
     ▼                       ▼                         ▼
  ┌──────┐               ┌──────┐                  ┌──────┐
  │Model │               │Model │                  │Model │
  └──────┘               └──────┘                  └──────┘

  View DIRECTLY reads       Presenter mediates        ViewModel exposes
  Model. Controller          ALL communication.        observable state.
  handles logic.            View is passive.           View binds to it.
```

### Comparison Table

| Aspect | MVC | MVP | MVVM |
|--------|-----|-----|------|
| **Full Name** | Model-View-Controller | Model-View-Presenter | Model-View-ViewModel |
| **View ↔ Logic** | View knows Controller | View knows Presenter | View binds to ViewModel |
| **View Role** | Active (reads Model) | Passive (Presenter updates it) | Reactive (observes ViewModel) |
| **Logic Location** | Controller | Presenter | ViewModel |
| **Data Flow** | Bidirectional | Presenter is mediator | Unidirectional (typically) |
| **Testability** | Medium | High | High |
| **Flutter Fit** | ❌ Not idiomatic | ⚠️ Possible | ✅ Natural fit |
| **Flutter Examples** | Rare | Custom implementations | BLoC, Riverpod, Provider |
| **Binding** | Manual | Interface callbacks | Streams / ChangeNotifier |
| **Complexity** | Low | Medium | Medium-High |

### MVVM in Flutter (Most Common)

```dart
// ViewModel (using ChangeNotifier)
class ProductListViewModel extends ChangeNotifier {
  final GetProducts _getProducts;

  ProductListViewModel(this._getProducts);

  List<Product> _products = [];
  List<Product> get products => _products;

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  String? _error;
  String? get error => _error;

  Future<void> loadProducts({int page = 1}) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    final result = await _getProducts(GetProductsParams(page: page));

    result.fold(
      (failure) {
        _error = failure.message;
      },
      (products) {
        _products = products;
      },
    );

    _isLoading = false;
    notifyListeners();
  }
}

// View binds to ViewModel
class ProductListPage extends StatelessWidget {
  const ProductListPage({super.key});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => sl<ProductListViewModel>()..loadProducts(),
      child: Consumer<ProductListViewModel>(
        builder: (context, vm, _) {
          if (vm.isLoading) return const Center(child: CircularProgressIndicator());
          if (vm.error != null) return Center(child: Text(vm.error!));
          return ListView.builder(
            itemCount: vm.products.length,
            itemBuilder: (_, i) => ProductTile(product: vm.products[i]),
          );
        },
      ),
    );
  }
}
```

> **Interview Tip**: MVVM is the most natural pattern for Flutter because Flutter's reactive UI model (widgets rebuild when state changes) aligns perfectly with ViewModel's observable state. BLoC is essentially MVVM where Events = user actions and States = observable view state.

---

## 8. Feature-First vs Layer-First Folder Structure

### Layer-First Structure

```
lib/
├── data/
│   ├── datasources/
│   │   ├── auth_remote_data_source.dart
│   │   ├── auth_local_data_source.dart
│   │   ├── product_remote_data_source.dart
│   │   └── product_local_data_source.dart
│   ├── models/
│   │   ├── user_model.dart
│   │   └── product_model.dart
│   └── repositories/
│       ├── auth_repository_impl.dart
│       └── product_repository_impl.dart
│
├── domain/
│   ├── entities/
│   │   ├── user.dart
│   │   └── product.dart
│   ├── repositories/
│   │   ├── auth_repository.dart
│   │   └── product_repository.dart
│   └── usecases/
│       ├── login_user.dart
│       ├── get_products.dart
│       └── search_products.dart
│
├── presentation/
│   ├── blocs/
│   │   ├── auth_bloc.dart
│   │   └── product_bloc.dart
│   ├── pages/
│   │   ├── login_page.dart
│   │   └── product_list_page.dart
│   └── widgets/
│       ├── auth_form.dart
│       └── product_tile.dart
│
└── main.dart
```

### Feature-First Structure

```
lib/
├── core/
│   ├── error/
│   ├── network/
│   ├── theme/
│   └── usecases/
│
├── features/
│   ├── auth/
│   │   ├── data/
│   │   │   ├── datasources/
│   │   │   ├── models/
│   │   │   └── repositories/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── repositories/
│   │   │   └── usecases/
│   │   └── presentation/
│   │       ├── bloc/
│   │       ├── pages/
│   │       └── widgets/
│   │
│   ├── products/
│   │   ├── data/ ...
│   │   ├── domain/ ...
│   │   └── presentation/ ...
│   │
│   └── cart/
│       ├── data/ ...
│       ├── domain/ ...
│       └── presentation/ ...
│
└── main.dart
```

### Comparison

| Aspect | Layer-First | Feature-First |
|--------|------------|---------------|
| **Organization** | Grouped by layer type | Grouped by business feature |
| **Navigation** | Jump between folders for one feature | Everything for a feature in one place |
| **Scalability** | Folders grow large with many features | Each feature stays contained |
| **Team Work** | Merge conflicts across layers | Teams own entire features independently |
| **Code Discovery** | Must search across layers | Open one folder, see everything |
| **Shared Code** | Easy (same folder) | Needs a `core/` or `shared/` folder |
| **Small Projects** | ✅ Simple and sufficient | ⚠️ May be overkill |
| **Large Projects** | ❌ Hard to navigate | ✅ Best practice |
| **Extractable** | Difficult to extract features | Easy to extract to packages/modules |
| **Recommended** | < 5 features | ≥ 5 features or team > 3 developers |

> **Interview Tip**: Most production Flutter apps use **feature-first** structure. Say: "I prefer feature-first because it scales with team size. Each developer can own an entire feature folder without stepping on others' code. Shared utilities go in a `core/` directory."

---

## 9. Error Handling Patterns

### 9.1 Either Type (dartz / fpdart)

The `Either<L, R>` type represents a value that is one of two types: `Left` (failure) or `Right` (success).

```dart
// Using dartz
import 'package:dartz/dartz.dart';

Future<Either<Failure, User>> getUser(String id) async {
  try {
    final response = await api.getUser(id);
    return Right(UserModel.fromJson(response.data));
  } on ServerException catch (e) {
    return Left(ServerFailure(e.message));
  } on SocketException {
    return const Left(NetworkFailure());
  }
}

// Consuming Either in a BLoC
final result = await getUser('user_123');

// Option 1: fold — handle both cases
result.fold(
  (failure) => emit(UserError(failure.message)),
  (user) => emit(UserLoaded(user)),
);

// Option 2: Pattern matching (Dart 3)
switch (result) {
  case Left(value: final failure):
    emit(UserError(failure.message));
  case Right(value: final user):
    emit(UserLoaded(user));
}

// Option 3: getOrElse
final user = result.getOrElse(() => User.empty());

// Option 4: map / flatMap for chaining
final nameResult = result.map((user) => user.name);
```

### 9.2 Result Pattern (Without External Packages)

```dart
// Custom Result type using sealed classes (Dart 3)
sealed class Result<T> {
  const Result();
}

class Success<T> extends Result<T> {
  final T data;
  const Success(this.data);
}

class Failure<T> extends Result<T> {
  final AppException error;
  const Failure(this.error);
}

// Extension methods for ergonomic usage
extension ResultExtension<T> on Result<T> {
  R fold<R>(
    R Function(AppException error) onFailure,
    R Function(T data) onSuccess,
  ) {
    return switch (this) {
      Success(data: final d) => onSuccess(d),
      Failure(error: final e) => onFailure(e),
    };
  }

  T getOrElse(T Function() fallback) {
    return switch (this) {
      Success(data: final d) => d,
      Failure() => fallback(),
    };
  }

  Result<R> map<R>(R Function(T data) transform) {
    return switch (this) {
      Success(data: final d) => Success(transform(d)),
      Failure(error: final e) => Failure(e),
    };
  }

  bool get isSuccess => this is Success<T>;
  bool get isFailure => this is Failure<T>;
}

// Usage
Future<Result<User>> getUser(String id) async {
  try {
    final user = await api.fetchUser(id);
    return Success(user);
  } catch (e) {
    return Failure(AppException(e.toString()));
  }
}

final result = await getUser('123');
result.fold(
  (error) => showError(error.message),
  (user) => showUser(user),
);
```

### 9.3 Sealed Class Errors (Typed Error Hierarchy)

```dart
// Exhaustive error handling with sealed classes
sealed class AppError {
  final String message;
  final StackTrace? stackTrace;
  const AppError(this.message, [this.stackTrace]);
}

class NetworkError extends AppError {
  final int? statusCode;
  const NetworkError(super.message, {this.statusCode, super.stackTrace});
}

class AuthenticationError extends AppError {
  final AuthErrorType type;
  const AuthenticationError(super.message, {required this.type, super.stackTrace});
}

class ValidationError extends AppError {
  final Map<String, List<String>> fieldErrors;
  const ValidationError(super.message, {required this.fieldErrors, super.stackTrace});
}

class StorageError extends AppError {
  const StorageError(super.message, {super.stackTrace});
}

enum AuthErrorType { invalidCredentials, tokenExpired, accountLocked }

// Exhaustive handling — compiler ensures all cases covered
String errorToUserMessage(AppError error) {
  return switch (error) {
    NetworkError(statusCode: 404) => 'Resource not found',
    NetworkError(statusCode: 500) => 'Server error. Try again later.',
    NetworkError() => 'Network error. Check your connection.',
    AuthenticationError(type: AuthErrorType.tokenExpired) => 'Session expired. Please login again.',
    AuthenticationError(type: AuthErrorType.accountLocked) => 'Account locked. Contact support.',
    AuthenticationError() => 'Invalid credentials.',
    ValidationError(fieldErrors: final errors) =>
      errors.entries.map((e) => '${e.key}: ${e.value.join(", ")}').join('\n'),
    StorageError() => 'Local storage error. Clear app cache.',
  };
}
```

### 9.4 Global Error Handling

```dart
// main.dart — Catch ALL uncaught errors
void main() {
  // Catch Flutter framework errors
  FlutterError.onError = (FlutterErrorDetails details) {
    FlutterError.presentError(details);
    // Log to crash reporting
    CrashReporting.recordFlutterError(details);
  };

  // Catch async errors not caught by Flutter
  PlatformDispatcher.instance.onError = (error, stack) {
    CrashReporting.recordError(error, stack);
    return true; // handled
  };

  // Catch errors in the Dart zone
  runZonedGuarded(
    () => runApp(const MyApp()),
    (error, stackTrace) {
      CrashReporting.recordError(error, stackTrace);
    },
  );
}
```

```dart
// Global BLoC error observer
class AppBlocObserver extends BlocObserver {
  @override
  void onError(BlocBase bloc, Object error, StackTrace stackTrace) {
    super.onError(bloc, error, stackTrace);
    CrashReporting.recordError(
      error,
      stackTrace,
      reason: 'BLoC error in ${bloc.runtimeType}',
    );
  }

  @override
  void onTransition(Bloc bloc, Transition transition) {
    super.onTransition(bloc, transition);
    debugPrint('${bloc.runtimeType}: ${transition.event} → ${transition.nextState}');
  }
}

// Register in main.dart
void main() {
  Bloc.observer = AppBlocObserver();
  runApp(const MyApp());
}
```

```dart
// Global error widget for UI
class GlobalErrorHandler extends StatelessWidget {
  final Widget child;
  const GlobalErrorHandler({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    // Override the default error widget in release mode
    ErrorWidget.builder = (FlutterErrorDetails details) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, size: 64, color: Colors.red),
              const SizedBox(height: 16),
              const Text('Something went wrong'),
              const SizedBox(height: 8),
              if (kDebugMode)
                Text(
                  details.exceptionAsString(),
                  style: const TextStyle(fontSize: 12),
                  textAlign: TextAlign.center,
                ),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  // Navigate to home or restart
                },
                child: const Text('Go Home'),
              ),
            ],
          ),
        ),
      );
    };

    return child;
  }
}
```

### Error Handling Patterns Comparison

| Pattern | Package | Pros | Cons |
|---------|---------|------|------|
| **try/catch** | None (core Dart) | Simple, familiar | No type safety for errors |
| **Either** | dartz / fpdart | Type-safe, composable | Extra dependency, learning curve |
| **Result (sealed)** | None (Dart 3) | No dependency, exhaustive | Must implement yourself |
| **Exceptions** | None (core Dart) | Simple to throw | Easy to forget to catch |
| **Freezed unions** | freezed | Code-gen, exhaustive | Build runner overhead |

> **Interview Tip**: If asked "how do you handle errors?", answer: "I use the Either type from dartz (or a custom sealed Result class) at the repository level. Exceptions from data sources are caught and converted to typed Failures. The presentation layer uses `fold()` to handle both success and failure paths. I also set up global error handlers via `FlutterError.onError` and `PlatformDispatcher.instance.onError` for unhandled crashes."

---

## 10. Quick Revision Table

| Topic | Key Concept | Remember |
|-------|-------------|----------|
| **Clean Architecture** | 3 layers: Presentation → Domain ← Data | Dependencies point INWARD |
| **Dependency Rule** | Inner layers know nothing about outer | Domain has NO Flutter imports |
| **Entities** | Core business objects in Domain | Immutable, no serialization |
| **Use Cases** | One action = one class | Single Responsibility Principle |
| **Repository Interface** | Defined in Domain | Dependency Inversion Principle |
| **Repository Impl** | Defined in Data | Catches exceptions → returns Failures |
| **Models / DTOs** | Data layer serialization classes | `fromJson` / `toJson` live here |
| **Data Sources** | Remote (API) + Local (cache) | Throw Exceptions, not Failures |
| **BLoC + Clean Arch** | BLoC calls Use Cases, not Repositories | Events in → States out |
| **DI Registration** | BLoC = Factory, Repos = LazySingleton | get_it or injectable |
| **Singleton** | One instance globally | Private constructor + static field |
| **Factory Pattern** | Create by type without exposing logic | `switch` on enum/type |
| **Builder** | Step-by-step construction | Method chaining, `.build()` at end |
| **Observer** | Pub/sub for state changes | ChangeNotifier, Streams |
| **Strategy** | Swap algorithms at runtime | Sort, filter, validate |
| **Adapter** | Convert third-party interface to yours | SDK wrappers |
| **MVVM** | ViewModel exposes observable state | Natural fit for Flutter |
| **MVP** | Presenter mediates View ↔ Model | Possible but not idiomatic |
| **MVC** | Controller handles logic, View reads Model | Not a good fit for Flutter |
| **Feature-First** | Group by business feature | Best for large apps / teams |
| **Layer-First** | Group by layer type (data, domain, etc.) | OK for small apps |
| **Either Type** | `Left(Failure)` or `Right(Success)` | From dartz / fpdart |
| **Sealed Errors** | Exhaustive, compile-time safe error types | Dart 3 sealed classes |
| **Global Errors** | `FlutterError.onError` + `PlatformDispatcher` | Catch everything |
| **Exception vs Failure** | Exception = Data layer, Failure = Domain | Never let exceptions bubble up |

> **Interview Tip**: When whiteboarding Clean Architecture, always draw the concentric circles, label the three layers, and draw the dependency arrows pointing inward. Then say: "The Domain layer is the innermost — it's pure Dart with zero external dependencies. The Data layer implements repository contracts from Domain. The Presentation layer calls use cases from Domain. Data and Presentation never import each other."
