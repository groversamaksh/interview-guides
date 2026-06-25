# Forms, Networking & JSON Serialization

## 1. Forms

### Basic Form with Validation
```dart
class LoginForm extends StatefulWidget {
  const LoginForm({super.key});

  @override
  State<LoginForm> createState() => _LoginFormState();
}

class _LoginFormState extends State<LoginForm> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _submit() {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();
      // Process login
      final email = _emailController.text;
      final password = _passwordController.text;
      // ...
    }
  }

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      autovalidateMode: AutovalidateMode.onUserInteraction,
      child: Column(
        children: [
          TextFormField(
            controller: _emailController,
            keyboardType: TextInputType.emailAddress,
            textInputAction: TextInputAction.next,
            decoration: const InputDecoration(
              labelText: 'Email',
              prefixIcon: Icon(Icons.email),
              border: OutlineInputBorder(),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) return 'Email is required';
              if (!RegExp(r'^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
                return 'Enter a valid email';
              }
              return null;
            },
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: _passwordController,
            obscureText: _obscurePassword,
            textInputAction: TextInputAction.done,
            decoration: InputDecoration(
              labelText: 'Password',
              prefixIcon: const Icon(Icons.lock),
              border: const OutlineInputBorder(),
              suffixIcon: IconButton(
                icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility),
                onPressed: () => setState(() => _obscurePassword = !_obscurePassword),
              ),
            ),
            validator: (value) {
              if (value == null || value.isEmpty) return 'Password is required';
              if (value.length < 8) return 'Password must be at least 8 characters';
              return null;
            },
            onFieldSubmitted: (_) => _submit(),
          ),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: _submit,
              child: const Text('Login'),
            ),
          ),
        ],
      ),
    );
  }
}
```

### Custom Validators
```dart
class Validators {
  static String? required(String? value) {
    if (value == null || value.trim().isEmpty) return 'This field is required';
    return null;
  }

  static String? email(String? value) {
    if (value == null || value.isEmpty) return 'Email is required';
    if (!RegExp(r'^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
      return 'Enter a valid email';
    }
    return null;
  }

  static String? minLength(int min) {
    return (String? value) {
      if (value != null && value.length < min) {
        return 'Must be at least $min characters';
      }
      return null;
    };
  }

  static String? confirmPassword(TextEditingController passwordController) {
    return (String? value) {
      if (value != passwordController.text) return 'Passwords do not match';
      return null;
    };
  }

  // Combine multiple validators
  static String? Function(String?) compose(List<String? Function(String?)> validators) {
    return (value) {
      for (final validator in validators) {
        final result = validator(value);
        if (result != null) return result;
      }
      return null;
    };
  }
}

// Usage
TextFormField(
  validator: Validators.compose([
    Validators.required,
    Validators.email,
  ]),
)
```

### Dynamic Form
```dart
class DynamicForm extends StatefulWidget {
  final List<FormFieldConfig> fields;
  const DynamicForm({super.key, required this.fields});

  @override
  State<DynamicForm> createState() => _DynamicFormState();
}

class _DynamicFormState extends State<DynamicForm> {
  final _formKey = GlobalKey<FormState>();
  final Map<String, TextEditingController> _controllers = {};

  @override
  void initState() {
    super.initState();
    for (final field in widget.fields) {
      _controllers[field.key] = TextEditingController(text: field.defaultValue);
    }
  }

  @override
  void dispose() {
    for (final controller in _controllers.values) {
      controller.dispose();
    }
    super.dispose();
  }

  Map<String, String> get formData =>
      _controllers.map((key, controller) => MapEntry(key, controller.text));

  @override
  Widget build(BuildContext context) {
    return Form(
      key: _formKey,
      child: Column(
        children: [
          for (final field in widget.fields)
            Padding(
              padding: const EdgeInsets.only(bottom: 16),
              child: TextFormField(
                controller: _controllers[field.key],
                decoration: InputDecoration(
                  labelText: field.label,
                  border: const OutlineInputBorder(),
                ),
                validator: field.isRequired ? Validators.required : null,
                keyboardType: field.keyboardType,
              ),
            ),
          FilledButton(
            onPressed: () {
              if (_formKey.currentState!.validate()) {
                // Submit formData
              }
            },
            child: const Text('Submit'),
          ),
        ],
      ),
    );
  }
}
```

---

## 2. Networking — HTTP Package

```dart
import 'package:http/http.dart' as http;
import 'dart:convert';

class ApiService {
  final String baseUrl;
  final http.Client _client;

  ApiService({required this.baseUrl, http.Client? client})
      : _client = client ?? http.Client();

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
  };

  // GET
  Future<List<User>> getUsers() async {
    final response = await _client.get(
      Uri.parse('$baseUrl/users'),
      headers: _headers,
    );
    if (response.statusCode == 200) {
      final List<dynamic> data = jsonDecode(response.body);
      return data.map((json) => User.fromJson(json)).toList();
    }
    throw HttpException('Failed to load users: ${response.statusCode}');
  }

  // POST
  Future<User> createUser(Map<String, dynamic> userData) async {
    final response = await _client.post(
      Uri.parse('$baseUrl/users'),
      headers: _headers,
      body: jsonEncode(userData),
    );
    if (response.statusCode == 201) {
      return User.fromJson(jsonDecode(response.body));
    }
    throw HttpException('Failed to create user: ${response.statusCode}');
  }

  // PUT
  Future<User> updateUser(String id, Map<String, dynamic> userData) async {
    final response = await _client.put(
      Uri.parse('$baseUrl/users/$id'),
      headers: _headers,
      body: jsonEncode(userData),
    );
    if (response.statusCode == 200) {
      return User.fromJson(jsonDecode(response.body));
    }
    throw HttpException('Failed to update user');
  }

  // DELETE
  Future<void> deleteUser(String id) async {
    final response = await _client.delete(
      Uri.parse('$baseUrl/users/$id'),
      headers: _headers,
    );
    if (response.statusCode != 204) {
      throw HttpException('Failed to delete user');
    }
  }

  void dispose() => _client.close();
}
```

---

## 3. Networking — Dio (Feature-Rich)

```yaml
dependencies:
  dio: ^5.4.0
```

```dart
class DioApiService {
  late final Dio _dio;

  DioApiService({required String baseUrl}) {
    _dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 15),
      headers: {'Content-Type': 'application/json'},
    ));

    // Interceptors
    _dio.interceptors.addAll([
      _AuthInterceptor(),
      _LoggingInterceptor(),
      _RetryInterceptor(_dio),
    ]);
  }

  Future<List<User>> getUsers({int page = 1, int limit = 20}) async {
    try {
      final response = await _dio.get('/users', queryParameters: {
        'page': page,
        'limit': limit,
      });
      return (response.data as List).map((e) => User.fromJson(e)).toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  Future<User> createUser(Map<String, dynamic> data) async {
    try {
      final response = await _dio.post('/users', data: data);
      return User.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // File upload with progress
  Future<String> uploadImage(File file) async {
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(file.path, filename: 'image.jpg'),
    });
    final response = await _dio.post(
      '/upload',
      data: formData,
      onSendProgress: (sent, total) {
        final progress = (sent / total * 100).toStringAsFixed(0);
        print('Upload progress: $progress%');
      },
    );
    return response.data['url'];
  }

  // Cancel requests
  Future<List<Product>> search(String query, CancelToken cancelToken) async {
    final response = await _dio.get(
      '/search',
      queryParameters: {'q': query},
      cancelToken: cancelToken,
    );
    return (response.data as List).map((e) => Product.fromJson(e)).toList();
  }

  AppException _handleError(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.receiveTimeout:
        return NetworkException('Connection timed out');
      case DioExceptionType.badResponse:
        return ServerException('Server error: ${e.response?.statusCode}');
      case DioExceptionType.cancel:
        return CancelledException('Request cancelled');
      default:
        return NetworkException('Network error');
    }
  }
}
```

### Dio Interceptors
```dart
class _AuthInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    final token = AuthStorage.getToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    handler.next(options);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) async {
    if (err.response?.statusCode == 401) {
      // Try to refresh token
      try {
        final newToken = await AuthService.refreshToken();
        err.requestOptions.headers['Authorization'] = 'Bearer $newToken';
        final response = await Dio().fetch(err.requestOptions);
        handler.resolve(response);
        return;
      } catch (_) {
        // Refresh failed — logout
        AuthService.logout();
      }
    }
    handler.next(err);
  }
}

class _LoggingInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    print('→ ${options.method} ${options.uri}');
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    print('← ${response.statusCode} ${response.requestOptions.uri}');
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    print('✗ ${err.response?.statusCode} ${err.requestOptions.uri}');
    handler.next(err);
  }
}
```

---

## 4. Repository Pattern

```dart
// Abstract repository (domain layer)
abstract class UserRepository {
  Future<List<User>> getUsers();
  Future<User> getUserById(String id);
  Future<User> createUser(CreateUserDto dto);
  Future<void> deleteUser(String id);
}

// Implementation (data layer)
class UserRepositoryImpl implements UserRepository {
  final DioApiService _api;
  final UserLocalDataSource _local;

  UserRepositoryImpl(this._api, this._local);

  @override
  Future<List<User>> getUsers() async {
    try {
      final users = await _api.getUsers();
      await _local.cacheUsers(users); // Cache for offline
      return users;
    } catch (e) {
      // Fallback to cache
      final cached = await _local.getCachedUsers();
      if (cached.isNotEmpty) return cached;
      rethrow;
    }
  }

  @override
  Future<User> getUserById(String id) async {
    return _api.getUserById(id);
  }

  @override
  Future<User> createUser(CreateUserDto dto) async {
    return _api.createUser(dto.toJson());
  }

  @override
  Future<void> deleteUser(String id) async {
    await _api.deleteUser(id);
    await _local.removeUser(id);
  }
}
```

---

## 5. JSON Serialization

### Manual Parsing
```dart
class User {
  final String id;
  final String name;
  final String email;
  final DateTime createdAt;

  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      name: json['name'] as String,
      email: json['email'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'created_at': createdAt.toIso8601String(),
    };
  }

  User copyWith({String? name, String? email}) {
    return User(
      id: id,
      name: name ?? this.name,
      email: email ?? this.email,
      createdAt: createdAt,
    );
  }
}
```

### json_serializable (Code Generation)
```yaml
dependencies:
  json_annotation: ^4.9.0
dev_dependencies:
  json_serializable: ^6.8.0
  build_runner: ^2.4.0
```

```dart
import 'package:json_annotation/json_annotation.dart';
part 'user.g.dart';

@JsonSerializable()
class User {
  final String id;
  final String name;
  final String email;
  @JsonKey(name: 'created_at')
  final DateTime createdAt;
  @JsonKey(defaultValue: false)
  final bool isActive;

  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.createdAt,
    this.isActive = false,
  });

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);
}

// Run: dart run build_runner build
```

### Freezed (Immutable Data Classes + Unions)
```yaml
dependencies:
  freezed_annotation: ^2.4.0
dev_dependencies:
  freezed: ^2.5.0
  build_runner: ^2.4.0
```

```dart
import 'package:freezed_annotation/freezed_annotation.dart';
part 'user.freezed.dart';
part 'user.g.dart';

@freezed
class User with _$User {
  const factory User({
    required String id,
    required String name,
    required String email,
    @JsonKey(name: 'created_at') required DateTime createdAt,
    @Default(false) bool isActive,
  }) = _User;

  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
}

// Freezed gives you:
// ✅ copyWith()
// ✅ == operator (value equality)
// ✅ hashCode
// ✅ toString()
// ✅ fromJson / toJson (with json_serializable)

// Usage
final user = User(id: '1', name: 'Alice', email: 'a@b.com', createdAt: DateTime.now());
final updated = user.copyWith(name: 'Bob'); // Immutable copy

// Sealed unions with Freezed
@freezed
sealed class AuthState with _$AuthState {
  const factory AuthState.initial() = _Initial;
  const factory AuthState.loading() = _Loading;
  const factory AuthState.authenticated(User user) = _Authenticated;
  const factory AuthState.unauthenticated() = _Unauthenticated;
  const factory AuthState.error(String message) = _Error;
}

// Pattern matching
authState.when(
  initial: () => const SplashScreen(),
  loading: () => const LoadingIndicator(),
  authenticated: (user) => HomeScreen(user: user),
  unauthenticated: () => const LoginScreen(),
  error: (message) => ErrorScreen(message: message),
);
```

> **Interview Tip**: Use `freezed` for model classes — it generates `copyWith`, equality, and `fromJson/toJson` automatically. Use sealed unions for state classes.

---

## 6. Dependency Injection — get_it

```yaml
dependencies:
  get_it: ^7.7.0
  injectable: ^2.4.0
dev_dependencies:
  injectable_generator: ^2.6.0
  build_runner: ^2.4.0
```

### Manual Registration
```dart
final getIt = GetIt.instance;

void setupDependencies() {
  // Singleton (one instance forever)
  getIt.registerSingleton<ApiService>(ApiService(baseUrl: 'https://api.example.com'));

  // Lazy Singleton (created on first access)
  getIt.registerLazySingleton<AuthRepository>(() => AuthRepositoryImpl(getIt()));

  // Factory (new instance every time)
  getIt.registerFactory<LoginBloc>(() => LoginBloc(getIt()));
}

// Usage
final apiService = getIt<ApiService>();
final authRepo = getIt<AuthRepository>();

// In main.dart
void main() {
  setupDependencies();
  runApp(const MyApp());
}
```

### With Injectable (Code Generation)
```dart
@module
abstract class RegisterModule {
  @lazySingleton
  Dio get dio => Dio(BaseOptions(baseUrl: 'https://api.example.com'));
}

@injectable
class UserRepository {
  final Dio _dio;
  UserRepository(this._dio); // Automatically injected!
}

@injectable
class UserBloc extends Bloc<UserEvent, UserState> {
  UserBloc(UserRepository repo) : super(UserInitial());
}

// Run: dart run build_runner build
```

---

## Quick Revision: Networking & Data

| Concept | Package | Use Case |
|---|---|---|
| HTTP | `http` | Simple REST calls |
| Dio | `dio` | Advanced HTTP (interceptors, upload, cancel) |
| Manual JSON | Built-in | Small models |
| `json_serializable` | `json_serializable` | Medium apps, code-gen |
| Freezed | `freezed` | Immutable models, unions, code-gen |
| get_it | `get_it` | Service locator / DI |
| injectable | `injectable` | Code-gen DI with get_it |
