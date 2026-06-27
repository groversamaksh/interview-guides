# Testing — Unit, Widget, Integration & Beyond

## 1. Testing Pyramid

```
           /\
          /  \
         / E2E\            ← Integration Tests
        / (few) \           Slow, high confidence
       /──────────\         Run on device/emulator
      /  Widget    \       ← Widget Tests
     /  (moderate)  \       Fast, test UI + interactions
    /────────────────\
   /     Unit         \    ← Unit Tests
  /    (many, fast)    \    Fastest, test pure logic
 /──────────────────────\
```

| Layer | Speed | Confidence | Scope | Dependency |
|---|---|---|---|---|
| **Unit** | ⚡ Very fast | Logic only | Single function/class | None (mocked) |
| **Widget** | 🏃 Fast | UI + logic | Single widget / screen | Flutter test framework |
| **Integration** | 🐢 Slow | End-to-end | Full app flow | Real device / emulator |

> **Interview Tip**: The ideal ratio is roughly 70% unit, 20% widget, 10% integration. Unit tests catch logic bugs cheaply; widget tests catch UI regressions; integration tests validate real user flows.

### Setup — `pubspec.yaml`

```yaml
dev_dependencies:
  flutter_test:
    sdk: flutter
  test: ^1.25.0               # Unit testing
  mockito: ^5.4.0              # Mocking
  build_runner: ^2.4.0         # Code generation for mockito
  bloc_test: ^9.1.0            # Bloc/Cubit testing
  integration_test:
    sdk: flutter
```

---

## 2. Unit Testing

### 2.1 Basic `test()` and `group()`

```dart
// test/utils/string_utils_test.dart
import 'package:test/test.dart';
import 'package:my_app/utils/string_utils.dart';

void main() {
  // group() organises related tests
  group('StringUtils', () {
    group('capitalize', () {
      test('capitalises first letter of a word', () {
        expect(capitalize('flutter'), equals('Flutter'));
      });

      test('returns empty string for empty input', () {
        expect(capitalize(''), equals(''));
      });

      test('handles single character', () {
        expect(capitalize('f'), equals('F'));
      });

      test('does not change already capitalised string', () {
        expect(capitalize('Flutter'), equals('Flutter'));
      });
    });

    group('slugify', () {
      test('converts spaces to hyphens', () {
        expect(slugify('hello world'), equals('hello-world'));
      });

      test('converts to lowercase', () {
        expect(slugify('Hello World'), equals('hello-world'));
      });
    });
  });
}
```

### 2.2 `setUp` and `tearDown`

```dart
// test/services/calculator_test.dart
import 'package:test/test.dart';
import 'package:my_app/services/calculator.dart';

void main() {
  late Calculator calculator;

  // Runs BEFORE each test in this group
  setUp(() {
    calculator = Calculator();
  });

  // Runs AFTER each test in this group
  tearDown(() {
    calculator.dispose();
  });

  // Runs ONCE before all tests in this file
  setUpAll(() {
    print('Starting calculator tests...');
  });

  // Runs ONCE after all tests in this file
  tearDownAll(() {
    print('Calculator tests complete.');
  });

  test('adds two numbers', () {
    expect(calculator.add(2, 3), equals(5));
  });

  test('divides two numbers', () {
    expect(calculator.divide(10, 2), equals(5.0));
  });

  test('throws on divide by zero', () {
    expect(
      () => calculator.divide(10, 0),
      throwsA(isA<ArgumentError>()),
    );
  });
}
```

```
  Lifecycle per test:
  ┌─────────────────────────────────────────┐
  │  setUpAll()        ← once              │
  │  ┌──────────────────────────────────┐   │
  │  │  setUp()        ← before each    │   │
  │  │  test(...)      ← the test       │   │
  │  │  tearDown()     ← after each     │   │
  │  └──────────────────────────────────┘   │
  │  ... repeat for each test ...           │
  │  tearDownAll()     ← once              │
  └─────────────────────────────────────────┘
```

### 2.3 Matchers — The `expect()` Arsenal

```dart
import 'package:test/test.dart';

void main() {
  // ── Equality ──────────────────────────────────────
  test('equality matchers', () {
    expect(42, equals(42));
    expect('hello', isNot(equals('world')));
    expect(null, isNull);
    expect(42, isNotNull);
  });

  // ── Type checking ────────────────────────────────
  test('type matchers', () {
    expect(42, isA<int>());
    expect('hello', isA<String>());
    expect(3.14, isA<double>());

    // With additional conditions
    expect(42, isA<int>().having((n) => n, 'value', greaterThan(40)));
  });

  // ── Numeric comparisons ──────────────────────────
  test('numeric matchers', () {
    expect(10, greaterThan(5));
    expect(10, greaterThanOrEqualTo(10));
    expect(5, lessThan(10));
    expect(5, lessThanOrEqualTo(5));
    expect(5.0001, closeTo(5.0, 0.01)); // within delta
    expect(10, inInclusiveRange(1, 10));
  });

  // ── String matchers ──────────────────────────────
  test('string matchers', () {
    expect('Flutter testing', contains('testing'));
    expect('Flutter', startsWith('Flu'));
    expect('Flutter', endsWith('ter'));
    expect('hello', matches(RegExp(r'^h.*o$')));
    expect('  hello  ', equalsIgnoringWhitespace('hello'));
  });

  // ── Collection matchers ──────────────────────────
  test('collection matchers', () {
    expect([1, 2, 3], contains(2));
    expect([1, 2, 3], containsAll([1, 3]));
    expect([1, 2, 3], hasLength(3));
    expect([], isEmpty);
    expect([1], isNotEmpty);
    expect([1, 2, 3], orderedEquals([1, 2, 3]));
    expect([3, 1, 2], unorderedEquals([1, 2, 3]));
    expect([1, 2, 3], everyElement(greaterThan(0)));
  });

  // ── Map matchers ─────────────────────────────────
  test('map matchers', () {
    final map = {'name': 'Flutter', 'version': 3};
    expect(map, containsPair('name', 'Flutter'));
    expect(map, isA<Map>().having((m) => m.keys, 'keys', contains('name')));
  });

  // ── Exception matchers ───────────────────────────
  test('exception matchers', () {
    expect(() => throw Exception('oops'), throwsException);
    expect(() => throw ArgumentError('bad'), throwsArgumentError);
    expect(() => throw StateError('bad'), throwsStateError);

    // Check exception message
    expect(
      () => throw FormatException('invalid input'),
      throwsA(
        isA<FormatException>().having(
          (e) => e.message,
          'message',
          contains('invalid'),
        ),
      ),
    );

    // Generic throwsA
    expect(
      () => throw CustomException(404, 'Not found'),
      throwsA(
        allOf(
          isA<CustomException>(),
          predicate<CustomException>((e) => e.code == 404),
        ),
      ),
    );
  });

  // ── Boolean / predicate ──────────────────────────
  test('boolean matchers', () {
    expect(true, isTrue);
    expect(false, isFalse);
    expect(42, predicate<int>((v) => v.isEven, 'is even'));
  });
}
```

> **Interview Tip**: `isA<T>().having(...)` is incredibly powerful for matching properties of complex objects. Chain multiple `.having()` calls for deep assertions.

### 2.4 Testing Async Code

```dart
// lib/services/user_service.dart
class UserService {
  final ApiClient _client;
  UserService(this._client);

  Future<User> getUser(String id) async {
    final response = await _client.get('/users/$id');
    return User.fromJson(response.data);
  }
}

// test/services/user_service_test.dart
import 'package:test/test.dart';

void main() {
  test('getUser returns a User', () async {
    final service = UserService(MockApiClient());

    // Simply use async/await — the test framework handles it
    final user = await service.getUser('123');

    expect(user.name, equals('John'));
    expect(user.id, equals('123'));
  });

  test('getUser throws on network error', () async {
    final service = UserService(FailingApiClient());

    // Use throwsA for async exceptions
    expect(
      () => service.getUser('123'),
      throwsA(isA<NetworkException>()),
    );
  });

  test('with timeout', () async {
    final future = Future.delayed(
      const Duration(seconds: 5),
      () => 42,
    );

    expect(
      future,
      completion(equals(42)),  // completes with value
    );
  }, timeout: Timeout(Duration(seconds: 10)));
}
```

### 2.5 Testing Streams

```dart
// lib/services/counter_stream.dart
class CounterStream {
  final _controller = StreamController<int>();
  Stream<int> get stream => _controller.stream;
  int _count = 0;

  void increment() => _controller.add(++_count);
  void decrement() => _controller.add(--_count);
  void dispose() => _controller.close();
}

// test/services/counter_stream_test.dart
import 'package:test/test.dart';

void main() {
  late CounterStream counter;

  setUp(() => counter = CounterStream());
  tearDown(() => counter.dispose());

  test('emits values on increment', () {
    // expectLater + emitsInOrder for stream assertions
    expectLater(
      counter.stream,
      emitsInOrder([1, 2, 3]),
    );

    counter.increment();
    counter.increment();
    counter.increment();
  });

  test('emits specific value', () {
    expectLater(counter.stream, emits(1));
    counter.increment();
  });

  test('stream matchers', () {
    expectLater(
      counter.stream,
      emitsInOrder([
        1,                          // exact value
        emitsThrough(3),            // skip until 3
        emitsDone,                  // stream closes
      ]),
    );

    counter.increment(); // 1
    counter.increment(); // 2
    counter.increment(); // 3
    counter.dispose();   // closes
  });

  test('neverEmits', () {
    expectLater(
      counter.stream,
      neverEmits(isNegative),       // no negative values
    );

    counter.increment();
    counter.increment();
    counter.dispose();
  });

  test('emitsError', () {
    final controller = StreamController<int>();
    expectLater(
      controller.stream,
      emitsError(isA<StateError>()),
    );
    controller.addError(StateError('broken'));
    controller.close();
  });
}
```

| Stream Matcher | Description |
|---|---|
| `emits(matcher)` | Next event matches |
| `emitsInOrder([...])` | Sequence of events |
| `emitsThrough(matcher)` | Skip until match |
| `emitsDone` | Stream closes |
| `emitsError(matcher)` | Error event |
| `neverEmits(matcher)` | No event ever matches |
| `emitsAnyOf([...])` | At least one matches |
| `mayEmit(matcher)` | Optionally matches |

> **Interview Tip**: Always `expectLater` (not `expect`) for streams. Set up the expectation **before** triggering emissions.

---

## 3. Mocking with Mockito

### 3.1 Setup and `@GenerateMocks`

```dart
// lib/repositories/user_repository.dart
abstract class UserRepository {
  Future<User> getUserById(String id);
  Future<List<User>> getAllUsers();
  Future<void> deleteUser(String id);
  Stream<List<User>> watchUsers();
}

// test/mocks.dart  (centralised mock file)
import 'package:mockito/annotations.dart';
import 'package:my_app/repositories/user_repository.dart';
import 'package:my_app/services/api_client.dart';
import 'package:http/http.dart' as http;

@GenerateMocks([
  UserRepository,
  ApiClient,
  http.Client,
])
void main() {}
// Run: dart run build_runner build --delete-conflicting-outputs
// Generates: test/mocks.mocks.dart
```

### 3.2 Stubbing — `when` / `thenReturn` / `thenAnswer` / `thenThrow`

```dart
// test/services/user_service_test.dart
import 'package:mockito/mockito.dart';
import 'package:test/test.dart';
import 'mocks.mocks.dart';  // generated

void main() {
  late MockUserRepository mockRepo;
  late UserService service;

  setUp(() {
    mockRepo = MockUserRepository();
    service = UserService(mockRepo);
  });

  // ── thenReturn: for synchronous values ────────────
  test('thenReturn — sync value', () {
    when(mockRepo.getUserById('1'))
        .thenReturn(User(id: '1', name: 'Alice'));
    // NOTE: thenReturn only works for non-Future return types
    // For Future, use thenAnswer
  });

  // ── thenAnswer: for async (Future) values ─────────
  test('getUser returns user from repository', () async {
    when(mockRepo.getUserById('1'))
        .thenAnswer((_) async => User(id: '1', name: 'Alice'));

    final user = await service.getUser('1');

    expect(user.name, equals('Alice'));
  });

  // ── thenThrow: simulate errors ────────────────────
  test('getUser throws when repository fails', () async {
    when(mockRepo.getUserById('1'))
        .thenThrow(ServerException('500'));

    expect(
      () => service.getUser('1'),
      throwsA(isA<ServerException>()),
    );
  });

  // ── thenAnswer with invocation access ─────────────
  test('thenAnswer can inspect call args', () async {
    when(mockRepo.getUserById(any))
        .thenAnswer((invocation) async {
      final id = invocation.positionalArguments[0] as String;
      return User(id: id, name: 'User_$id');
    });

    final user = await service.getUser('42');
    expect(user.name, equals('User_42'));
  });

  // ── Stream stubbing ──────────────────────────────
  test('watchUsers returns stream', () {
    when(mockRepo.watchUsers())
        .thenAnswer((_) => Stream.fromIterable([
              [User(id: '1', name: 'Alice')],
              [User(id: '1', name: 'Alice'), User(id: '2', name: 'Bob')],
            ]));

    expectLater(
      mockRepo.watchUsers(),
      emitsInOrder([
        hasLength(1),
        hasLength(2),
      ]),
    );
  });
}
```

### 3.3 Verification

```dart
void main() {
  late MockUserRepository mockRepo;
  late UserService service;

  setUp(() {
    mockRepo = MockUserRepository();
    service = UserService(mockRepo);
    when(mockRepo.getUserById(any))
        .thenAnswer((_) async => User(id: '1', name: 'Alice'));
    when(mockRepo.deleteUser(any))
        .thenAnswer((_) async {});
  });

  test('verify — method was called', () async {
    await service.getUser('1');

    verify(mockRepo.getUserById('1')).called(1);
  });

  test('verifyNever — method was NOT called', () async {
    await service.getUser('1');

    verifyNever(mockRepo.deleteUser(any));
  });

  test('verifyInOrder — call sequence matters', () async {
    await service.getUser('1');
    await service.deleteUser('1');

    verifyInOrder([
      mockRepo.getUserById('1'),
      mockRepo.deleteUser('1'),
    ]);
  });

  test('verify call count', () async {
    await service.getUser('1');
    await service.getUser('1');
    await service.getUser('2');

    verify(mockRepo.getUserById('1')).called(2);
    verify(mockRepo.getUserById('2')).called(1);
  });

  test('verifyNoMoreInteractions', () async {
    await service.getUser('1');
    verify(mockRepo.getUserById('1'));

    verifyNoMoreInteractions(mockRepo);
  });
}
```

### 3.4 Argument Matchers

```dart
void main() {
  late MockUserRepository mockRepo;

  setUp(() {
    mockRepo = MockUserRepository();
  });

  test('any — matches all values', () async {
    when(mockRepo.getUserById(any))
        .thenAnswer((_) async => User(id: '1', name: 'Test'));

    await mockRepo.getUserById('anything');
    verify(mockRepo.getUserById(any)).called(1);
  });

  test('argThat — conditional matching', () async {
    when(mockRepo.getUserById(argThat(startsWith('user_'))))
        .thenAnswer((_) async => User(id: '1', name: 'Matched'));

    await mockRepo.getUserById('user_123');
    verify(mockRepo.getUserById(argThat(startsWith('user_')))).called(1);
  });

  test('captureAny — capture arguments for inspection', () async {
    when(mockRepo.deleteUser(any)).thenAnswer((_) async {});

    await mockRepo.deleteUser('user_1');
    await mockRepo.deleteUser('user_2');

    final captured = verify(mockRepo.deleteUser(captureAny)).captured;
    expect(captured, equals(['user_1', 'user_2']));
  });
}
```

| Matcher | Use Case |
|---|---|
| `any` | Match any value |
| `argThat(matcher)` | Match with condition |
| `captureAny` | Capture all passed values |
| `captureThat(matcher)` | Capture matching values |

### 3.5 Mocking HTTP Clients

```dart
// test/services/api_service_test.dart
import 'package:http/http.dart' as http;
import 'package:mockito/mockito.dart';
import 'package:test/test.dart';
import 'mocks.mocks.dart';

void main() {
  late MockClient mockHttpClient;
  late ApiService apiService;

  setUp(() {
    mockHttpClient = MockClient();
    apiService = ApiService(mockHttpClient);
  });

  test('fetchUsers parses JSON response', () async {
    // Stub HTTP GET
    when(mockHttpClient.get(
      Uri.parse('https://api.example.com/users'),
      headers: anyNamed('headers'),
    )).thenAnswer((_) async => http.Response(
          '[ {"id": "1", "name": "Alice"} ]',
          200,
          headers: {'content-type': 'application/json'},
        ));

    final users = await apiService.fetchUsers();

    expect(users, hasLength(1));
    expect(users.first.name, equals('Alice'));
    verify(mockHttpClient.get(any, headers: anyNamed('headers'))).called(1);
  });

  test('fetchUsers throws on non-200', () async {
    when(mockHttpClient.get(any, headers: anyNamed('headers')))
        .thenAnswer((_) async => http.Response('Server Error', 500));

    expect(
      () => apiService.fetchUsers(),
      throwsA(isA<ApiException>()),
    );
  });
}
```

### 3.6 Mocking Repositories (Layered Architecture)

```dart
/*
  ┌──────────────┐      ┌──────────────────┐      ┌───────────────┐
  │   UI Layer   │ ───▶ │  Service/BLoC     │ ───▶ │  Repository   │
  │  (Widget)    │      │  (Business Logic) │      │  (Data Layer) │
  └──────────────┘      └──────────────────┘      └───────────────┘
       Widget test            Unit test               Mocked
*/

// test/blocs/user_bloc_test.dart
class UserBloc {
  final UserRepository _repo;
  UserBloc(this._repo);

  Future<UserState> loadUser(String id) async {
    try {
      final user = await _repo.getUserById(id);
      return UserLoaded(user);
    } catch (e) {
      return UserError(e.toString());
    }
  }
}

void main() {
  late MockUserRepository mockRepo;
  late UserBloc bloc;

  setUp(() {
    mockRepo = MockUserRepository();
    bloc = UserBloc(mockRepo);
  });

  test('loadUser returns UserLoaded on success', () async {
    when(mockRepo.getUserById('1'))
        .thenAnswer((_) async => User(id: '1', name: 'Alice'));

    final state = await bloc.loadUser('1');

    expect(state, isA<UserLoaded>());
    expect((state as UserLoaded).user.name, 'Alice');
  });

  test('loadUser returns UserError on failure', () async {
    when(mockRepo.getUserById('1'))
        .thenThrow(Exception('Network error'));

    final state = await bloc.loadUser('1');

    expect(state, isA<UserError>());
  });
}
```

> **Interview Tip**: Always mock the layer **below** what you're testing. Testing a BLoC? Mock the repository. Testing a repository? Mock the HTTP client. This isolates each layer.

---

## 4. Widget Testing

### 4.1 `testWidgets` and `WidgetTester`

```dart
// test/widgets/counter_page_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:my_app/pages/counter_page.dart';

void main() {
  testWidgets('Counter increments when FAB is tapped',
      (WidgetTester tester) async {
    // 1. Build the widget
    await tester.pumpWidget(
      const MaterialApp(home: CounterPage()),
    );

    // 2. Verify initial state
    expect(find.text('0'), findsOneWidget);
    expect(find.text('1'), findsNothing);

    // 3. Perform action
    await tester.tap(find.byIcon(Icons.add));

    // 4. Rebuild after state change
    await tester.pump();

    // 5. Verify new state
    expect(find.text('1'), findsOneWidget);
    expect(find.text('0'), findsNothing);
  });
}
```

```
  pump vs pumpAndSettle:
  ┌────────────────────────────────────────────────────────┐
  │  pump()            Rebuilds ONE frame.                 │
  │                    Use after setState, tap, enterText. │
  │                                                        │
  │  pump(Duration)    Advances clock by duration,         │
  │                    then rebuilds.                       │
  │                                                        │
  │  pumpAndSettle()   Pumps frames until NO more          │
  │                    animations are pending.              │
  │                    Use after navigations, animations.   │
  │                    ⚠️ Hangs on infinite animations!    │
  │                                                        │
  │  pumpWidget(w)     Replaces the entire widget tree     │
  │                    with w, then pumps one frame.        │
  └────────────────────────────────────────────────────────┘
```

### 4.2 Finders

```dart
void main() {
  testWidgets('Finder examples', (tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Column(
            children: [
              const Text('Hello'),
              const Text('World'),
              ElevatedButton(
                key: const Key('submit_btn'),
                onPressed: () {},
                child: const Text('Submit'),
              ),
              const Icon(Icons.star),
              const CircularProgressIndicator(),
            ],
          ),
        ),
      ),
    );

    // ── find.text ──────────────────────────────────
    expect(find.text('Hello'), findsOneWidget);
    expect(find.text('Missing'), findsNothing);
    expect(find.textContaining('ell'), findsOneWidget);

    // ── find.byType ────────────────────────────────
    expect(find.byType(ElevatedButton), findsOneWidget);
    expect(find.byType(Text), findsNWidgets(3)); // Hello, World, Submit
    expect(find.byType(CircularProgressIndicator), findsOneWidget);

    // ── find.byKey ─────────────────────────────────
    expect(find.byKey(const Key('submit_btn')), findsOneWidget);

    // ── find.byIcon ────────────────────────────────
    expect(find.byIcon(Icons.star), findsOneWidget);

    // ── find.byWidgetPredicate ─────────────────────
    expect(
      find.byWidgetPredicate(
        (widget) => widget is Text && widget.data == 'Hello',
      ),
      findsOneWidget,
    );

    // ── find.descendant ────────────────────────────
    expect(
      find.descendant(
        of: find.byType(ElevatedButton),
        matching: find.text('Submit'),
      ),
      findsOneWidget,
    );

    // ── find.ancestor ──────────────────────────────
    expect(
      find.ancestor(
        of: find.text('Hello'),
        matching: find.byType(Column),
      ),
      findsOneWidget,
    );
  });
}
```

| Finder | Finds by |
|---|---|
| `find.text('...')` | Exact text |
| `find.textContaining('...')` | Partial text match |
| `find.byType(T)` | Widget type |
| `find.byKey(Key)` | Widget key |
| `find.byIcon(IconData)` | Icon |
| `find.byWidgetPredicate(fn)` | Custom predicate |
| `find.descendant(of:, matching:)` | Child within parent |
| `find.ancestor(of:, matching:)` | Parent of child |
| `find.bySemanticsLabel('...')` | Accessibility label |

| Expectation | Meaning |
|---|---|
| `findsOneWidget` | Exactly 1 match |
| `findsNothing` | Zero matches |
| `findsNWidgets(n)` | Exactly n matches |
| `findsAtLeast(n)` | n or more matches |
| `findsWidgets` | 1 or more |

### 4.3 Actions — Tap, Enter Text, Drag, Scroll

```dart
void main() {
  testWidgets('User interaction actions', (tester) async {
    String? submitted;
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: Column(
            children: [
              TextField(key: const Key('email')),
              TextField(key: const Key('password'), obscureText: true),
              ElevatedButton(
                key: const Key('login'),
                onPressed: () => submitted = 'done',
                child: const Text('Login'),
              ),
            ],
          ),
        ),
      ),
    );

    // ── enterText ──────────────────────────────────
    await tester.enterText(
      find.byKey(const Key('email')),
      'user@example.com',
    );
    await tester.enterText(
      find.byKey(const Key('password')),
      'secret123',
    );

    // ── tap ────────────────────────────────────────
    await tester.tap(find.byKey(const Key('login')));
    await tester.pump();

    expect(submitted, equals('done'));

    // ── longPress ──────────────────────────────────
    // await tester.longPress(find.byKey(const Key('item')));

    // ── drag ───────────────────────────────────────
    // await tester.drag(
    //   find.byKey(const Key('dismissible')),
    //   const Offset(500.0, 0.0),  // swipe right
    // );

    // ── fling (swipe with velocity) ────────────────
    // await tester.fling(
    //   find.byType(ListView),
    //   const Offset(0.0, -300.0),  // scroll up
    //   1000.0,                      // velocity
    // );
  });
}
```

### 4.4 Testing with Providers / BLoC (Wrapping Widgets)

```dart
// When your widget depends on Provider, BLoC, or InheritedWidgets,
// wrap the widget under test with the required ancestors.

// ── Provider ────────────────────────────────────────
testWidgets('works with Provider', (tester) async {
  final mockRepo = MockUserRepository();
  when(mockRepo.getAllUsers())
      .thenAnswer((_) async => [User(id: '1', name: 'Alice')]);

  await tester.pumpWidget(
    MultiProvider(
      providers: [
        Provider<UserRepository>.value(value: mockRepo),
        ChangeNotifierProvider(
          create: (_) => UserListNotifier(mockRepo),
        ),
      ],
      child: const MaterialApp(home: UserListPage()),
    ),
  );
  await tester.pumpAndSettle(); // wait for async

  expect(find.text('Alice'), findsOneWidget);
});

// ── BLoC ────────────────────────────────────────────
testWidgets('works with BlocProvider', (tester) async {
  final mockRepo = MockUserRepository();
  when(mockRepo.getAllUsers())
      .thenAnswer((_) async => [User(id: '1', name: 'Alice')]);

  final bloc = UserListBloc(mockRepo);

  await tester.pumpWidget(
    BlocProvider<UserListBloc>.value(
      value: bloc,
      child: const MaterialApp(home: UserListPage()),
    ),
  );

  bloc.add(LoadUsers());
  await tester.pumpAndSettle();

  expect(find.text('Alice'), findsOneWidget);
});

// ── Riverpod ────────────────────────────────────────
testWidgets('works with ProviderScope', (tester) async {
  final mockRepo = MockUserRepository();

  await tester.pumpWidget(
    ProviderScope(
      overrides: [
        userRepositoryProvider.overrideWithValue(mockRepo),
      ],
      child: const MaterialApp(home: UserListPage()),
    ),
  );
  await tester.pumpAndSettle();

  expect(find.text('Alice'), findsOneWidget);
});
```

> **Interview Tip**: Always wrap widgets under test with `MaterialApp` (or `CupertinoApp`) — many widgets depend on `MediaQuery`, `Directionality`, and `Theme` provided by these.

### 4.5 Testing Navigation

```dart
testWidgets('navigates to detail page on tap', (tester) async {
  await tester.pumpWidget(
    MaterialApp(
      home: const UserListPage(),
      routes: {
        '/detail': (_) => const UserDetailPage(),
      },
    ),
  );

  await tester.tap(find.text('Alice'));
  await tester.pumpAndSettle();

  // Verify we navigated
  expect(find.byType(UserDetailPage), findsOneWidget);
  expect(find.byType(UserListPage), findsNothing);
});
```

### 4.6 Golden Tests

```dart
// Golden tests compare widget rendering against a saved image
// Great for catching unexpected visual regressions

testWidgets('LoginPage matches golden', (tester) async {
  await tester.pumpWidget(
    const MaterialApp(home: LoginPage()),
  );
  await tester.pumpAndSettle();

  // First run: creates the golden file
  // Subsequent runs: compares against it
  await expectLater(
    find.byType(LoginPage),
    matchesGoldenFile('goldens/login_page.png'),
  );
});

// Run to update golden files:
//   flutter test --update-goldens

// Run to check against golden files:
//   flutter test
```

```
  Golden Test Workflow:
  ┌──────────────┐   flutter test          ┌──────────────────┐
  │  Widget       │  --update-goldens  ──▶ │  goldens/         │
  │  Rendering    │                         │  login_page.png   │
  └──────────────┘                         └──────────────────┘
         │                                        │
         │       flutter test                     │
         └──────────────────────▶  compare  ◀─────┘
                                     │
                              Pass / Fail
```

> **Interview Tip**: Golden tests are **platform-sensitive** — images may differ across macOS, Linux, Windows. CI should run on a consistent platform. Many teams use a dedicated Docker image for golden comparisons.

---

## 5. Integration Testing

### 5.1 Setup

```yaml
# pubspec.yaml
dev_dependencies:
  integration_test:
    sdk: flutter
  flutter_test:
    sdk: flutter
```

```
  Project structure:
  my_app/
  ├── lib/
  ├── test/                       ← unit & widget tests
  └── integration_test/           ← integration tests
      └── app_test.dart
```

### 5.2 Writing Integration Tests

```dart
// integration_test/app_test.dart
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:my_app/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  group('End-to-end: Login Flow', () {
    testWidgets('user can log in and see home page', (tester) async {
      // Launch the real app
      app.main();
      await tester.pumpAndSettle();

      // Enter credentials
      await tester.enterText(
        find.byKey(const Key('email_field')),
        'user@example.com',
      );
      await tester.enterText(
        find.byKey(const Key('password_field')),
        'password123',
      );

      // Tap login button
      await tester.tap(find.byKey(const Key('login_button')));
      await tester.pumpAndSettle(const Duration(seconds: 3));

      // Verify navigation to home
      expect(find.text('Welcome, User!'), findsOneWidget);
      expect(find.byType(HomePage), findsOneWidget);
    });

    testWidgets('shows error on invalid credentials', (tester) async {
      app.main();
      await tester.pumpAndSettle();

      await tester.enterText(
        find.byKey(const Key('email_field')),
        'wrong@example.com',
      );
      await tester.enterText(
        find.byKey(const Key('password_field')),
        'wrongpassword',
      );

      await tester.tap(find.byKey(const Key('login_button')));
      await tester.pumpAndSettle(const Duration(seconds: 3));

      expect(find.text('Invalid credentials'), findsOneWidget);
    });
  });
}
```

### 5.3 Running Integration Tests

```bash
# On a connected device / emulator
flutter test integration_test/app_test.dart

# On a specific device
flutter test integration_test/ -d <device_id>

# All integration tests
flutter test integration_test/

# With verbose output
flutter test integration_test/ --verbose
```

### 5.4 Patrol Package (Advanced E2E)

```dart
// Patrol allows interacting with native OS dialogs,
// permissions, notifications — things integration_test cannot do.

// pubspec.yaml
// dev_dependencies:
//   patrol: ^3.13.0

// integration_test/login_test.dart
import 'package:patrol/patrol.dart';
import 'package:my_app/main.dart' as app;

void main() {
  patrolTest('grant camera permission and take photo', ($) async {
    app.main();
    await $.pumpAndSettle();

    // Tap button that requests camera permission
    await $.tap(find.text('Take Photo'));

    // Patrol can handle native OS permission dialogs!
    await $.native.grantPermissionWhenInUse();

    await $.pumpAndSettle();
    expect(find.byType(CameraPreview), findsOneWidget);
  });
}
```

> **Interview Tip**: `integration_test` (Flutter SDK) handles in-app flows. **Patrol** extends this by interacting with native OS elements (permission dialogs, notifications, system settings). Know when each is appropriate.

---

## 6. Testing Bloc / Cubit

### 6.1 Setup

```yaml
dev_dependencies:
  bloc_test: ^9.1.0
  mockito: ^5.4.0
  build_runner: ^2.4.0
```

### 6.2 Example Bloc Under Test

```dart
// lib/blocs/auth/auth_event.dart
sealed class AuthEvent {}
class LoginRequested extends AuthEvent {
  final String email;
  final String password;
  LoginRequested({required this.email, required this.password});
}
class LogoutRequested extends AuthEvent {}

// lib/blocs/auth/auth_state.dart
sealed class AuthState {}
class AuthInitial extends AuthState {}
class AuthLoading extends AuthState {}
class AuthSuccess extends AuthState {
  final User user;
  AuthSuccess(this.user);
}
class AuthFailure extends AuthState {
  final String message;
  AuthFailure(this.message);
}

// lib/blocs/auth/auth_bloc.dart
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository _authRepo;

  AuthBloc(this._authRepo) : super(AuthInitial()) {
    on<LoginRequested>(_onLogin);
    on<LogoutRequested>(_onLogout);
  }

  Future<void> _onLogin(
    LoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final user = await _authRepo.login(event.email, event.password);
      emit(AuthSuccess(user));
    } catch (e) {
      emit(AuthFailure(e.toString()));
    }
  }

  Future<void> _onLogout(
    LogoutRequested event,
    Emitter<AuthState> emit,
  ) async {
    await _authRepo.logout();
    emit(AuthInitial());
  }
}
```

### 6.3 `blocTest()` — The Standard Pattern

```dart
// test/blocs/auth_bloc_test.dart
import 'package:bloc_test/bloc_test.dart';
import 'package:mockito/mockito.dart';
import 'package:test/test.dart';
import '../mocks.mocks.dart';

void main() {
  late MockAuthRepository mockAuthRepo;

  setUp(() {
    mockAuthRepo = MockAuthRepository();
  });

  group('AuthBloc', () {
    // ── Test initial state ─────────────────────────
    test('initial state is AuthInitial', () {
      final bloc = AuthBloc(mockAuthRepo);
      expect(bloc.state, isA<AuthInitial>());
    });

    // ── Test successful login ──────────────────────
    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, AuthSuccess] on successful login',
      setUp: () {
        when(mockAuthRepo.login('user@test.com', 'pass123'))
            .thenAnswer((_) async => User(id: '1', name: 'Alice'));
      },
      build: () => AuthBloc(mockAuthRepo),
      act: (bloc) => bloc.add(
        LoginRequested(email: 'user@test.com', password: 'pass123'),
      ),
      expect: () => [
        isA<AuthLoading>(),
        isA<AuthSuccess>()
            .having((s) => s.user.name, 'user.name', 'Alice'),
      ],
      verify: (_) {
        verify(mockAuthRepo.login('user@test.com', 'pass123')).called(1);
      },
    );

    // ── Test failed login ──────────────────────────
    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, AuthFailure] on failed login',
      setUp: () {
        when(mockAuthRepo.login(any, any))
            .thenThrow(Exception('Invalid credentials'));
      },
      build: () => AuthBloc(mockAuthRepo),
      act: (bloc) => bloc.add(
        LoginRequested(email: 'bad@test.com', password: 'wrong'),
      ),
      expect: () => [
        isA<AuthLoading>(),
        isA<AuthFailure>()
            .having((s) => s.message, 'message', contains('Invalid')),
      ],
    );

    // ── Test logout ────────────────────────────────
    blocTest<AuthBloc, AuthState>(
      'emits [AuthInitial] on logout',
      setUp: () {
        when(mockAuthRepo.logout()).thenAnswer((_) async {});
      },
      build: () => AuthBloc(mockAuthRepo),
      seed: () => AuthSuccess(User(id: '1', name: 'Alice')),
      act: (bloc) => bloc.add(LogoutRequested()),
      expect: () => [isA<AuthInitial>()],
    );

    // ── Test no duplicate events ───────────────────
    blocTest<AuthBloc, AuthState>(
      'does not emit duplicate states',
      setUp: () {
        when(mockAuthRepo.login(any, any))
            .thenAnswer((_) async => User(id: '1', name: 'Alice'));
      },
      build: () => AuthBloc(mockAuthRepo),
      act: (bloc) {
        bloc.add(LoginRequested(email: 'a@b.com', password: '123'));
        bloc.add(LoginRequested(email: 'a@b.com', password: '123'));
      },
      // Two separate login events → each goes through Loading → Success
      expect: () => [
        isA<AuthLoading>(),
        isA<AuthSuccess>(),
        isA<AuthLoading>(),
        isA<AuthSuccess>(),
      ],
    );
  });
}
```

```
  blocTest() anatomy:
  ┌──────────────────────────────────────────────────────┐
  │  blocTest<BlocType, StateType>(                     │
  │    'description',                                    │
  │    setUp:   () { ... },    ← stub mocks here        │
  │    build:   () => Bloc(),  ← create the bloc         │
  │    seed:    () => State(), ← optional initial state  │
  │    act:     (bloc) { ... },← add events              │
  │    wait:    Duration(...), ← wait for debounce etc   │
  │    expect:  () => [...],   ← expected state sequence │
  │    verify:  (bloc) { ... },← post-test verification  │
  │    tearDown:() { ... },    ← cleanup                 │
  │  );                                                  │
  └──────────────────────────────────────────────────────┘
```

### 6.4 Testing Cubit

```dart
// lib/cubits/counter_cubit.dart
class CounterCubit extends Cubit<int> {
  CounterCubit() : super(0);
  void increment() => emit(state + 1);
  void decrement() => emit(state - 1);
  void reset() => emit(0);
}

// test/cubits/counter_cubit_test.dart
void main() {
  group('CounterCubit', () {
    blocTest<CounterCubit, int>(
      'emits [1] when increment is called',
      build: () => CounterCubit(),
      act: (cubit) => cubit.increment(),
      expect: () => [1],
    );

    blocTest<CounterCubit, int>(
      'emits [-1] when decrement is called',
      build: () => CounterCubit(),
      act: (cubit) => cubit.decrement(),
      expect: () => [-1],
    );

    blocTest<CounterCubit, int>(
      'emits [1, 2, 3] on three increments',
      build: () => CounterCubit(),
      act: (cubit) {
        cubit.increment();
        cubit.increment();
        cubit.increment();
      },
      expect: () => [1, 2, 3],
    );

    blocTest<CounterCubit, int>(
      'emits [1, 0] on increment then reset',
      build: () => CounterCubit(),
      act: (cubit) {
        cubit.increment();
        cubit.reset();
      },
      expect: () => [1, 0],
    );
  });
}
```

> **Interview Tip**: `blocTest` automatically handles subscription, waiting, and closing the bloc. The `expect` list contains **only emitted states** (not the initial state). Use `seed` to set a custom initial state.

---

## 7. Testing Riverpod

### 7.1 `ProviderContainer` for Unit Tests

```dart
// lib/providers/counter_provider.dart
final counterProvider = StateNotifierProvider<CounterNotifier, int>(
  (ref) => CounterNotifier(),
);

class CounterNotifier extends StateNotifier<int> {
  CounterNotifier() : super(0);
  void increment() => state++;
  void decrement() => state--;
}

// test/providers/counter_provider_test.dart
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:test/test.dart';

void main() {
  late ProviderContainer container;

  setUp(() {
    container = ProviderContainer();
  });

  tearDown(() {
    container.dispose();
  });

  test('initial value is 0', () {
    expect(container.read(counterProvider), equals(0));
  });

  test('increment increases state', () {
    container.read(counterProvider.notifier).increment();
    expect(container.read(counterProvider), equals(1));
  });

  test('decrement decreases state', () {
    container.read(counterProvider.notifier).decrement();
    expect(container.read(counterProvider), equals(-1));
  });
}
```

### 7.2 Testing with Overrides (Dependency Injection)

```dart
// lib/providers/user_provider.dart
final userRepositoryProvider = Provider<UserRepository>(
  (ref) => UserRepositoryImpl(),
);

final userListProvider = FutureProvider<List<User>>((ref) async {
  final repo = ref.watch(userRepositoryProvider);
  return repo.getAllUsers();
});

// test/providers/user_provider_test.dart
void main() {
  test('userListProvider returns mocked users', () async {
    final mockRepo = MockUserRepository();
    when(mockRepo.getAllUsers())
        .thenAnswer((_) async => [User(id: '1', name: 'Alice')]);

    final container = ProviderContainer(
      overrides: [
        // Override the real repo with mock
        userRepositoryProvider.overrideWithValue(mockRepo),
      ],
    );
    addTearDown(container.dispose);

    // Read the FutureProvider
    // Listen to trigger the provider
    final subscription = container.listen(userListProvider, (_, __) {});

    // Wait for the future to resolve
    await container.read(userListProvider.future);

    final state = container.read(userListProvider);
    expect(
      state,
      isA<AsyncData<List<User>>>()
          .having((d) => d.value.length, 'length', 1)
          .having((d) => d.value.first.name, 'first name', 'Alice'),
    );

    subscription.close();
  });
}
```

### 7.3 Testing Notifier (Riverpod 2.0+ with `@riverpod`)

```dart
// lib/providers/todo_notifier.dart
@riverpod
class TodoNotifier extends _$TodoNotifier {
  @override
  List<Todo> build() => [];

  void add(Todo todo) {
    state = [...state, todo];
  }

  void remove(String id) {
    state = state.where((t) => t.id != id).toList();
  }

  void toggleComplete(String id) {
    state = [
      for (final todo in state)
        if (todo.id == id) todo.copyWith(completed: !todo.completed)
        else todo,
    ];
  }
}

// test/providers/todo_notifier_test.dart
void main() {
  late ProviderContainer container;

  setUp(() {
    container = ProviderContainer();
  });

  tearDown(() => container.dispose());

  test('starts with empty list', () {
    expect(container.read(todoNotifierProvider), isEmpty);
  });

  test('add inserts a todo', () {
    final notifier = container.read(todoNotifierProvider.notifier);
    notifier.add(Todo(id: '1', title: 'Buy milk'));

    final todos = container.read(todoNotifierProvider);
    expect(todos, hasLength(1));
    expect(todos.first.title, 'Buy milk');
  });

  test('remove deletes a todo', () {
    final notifier = container.read(todoNotifierProvider.notifier);
    notifier.add(Todo(id: '1', title: 'Buy milk'));
    notifier.add(Todo(id: '2', title: 'Walk dog'));
    notifier.remove('1');

    final todos = container.read(todoNotifierProvider);
    expect(todos, hasLength(1));
    expect(todos.first.id, '2');
  });

  test('toggleComplete flips completed flag', () {
    final notifier = container.read(todoNotifierProvider.notifier);
    notifier.add(Todo(id: '1', title: 'Buy milk'));

    notifier.toggleComplete('1');
    expect(container.read(todoNotifierProvider).first.completed, isTrue);

    notifier.toggleComplete('1');
    expect(container.read(todoNotifierProvider).first.completed, isFalse);
  });
}
```

### 7.4 Testing Async Riverpod Providers

```dart
// lib/providers/weather_provider.dart
final weatherProvider = FutureProvider.family<Weather, String>((ref, city) async {
  final repo = ref.watch(weatherRepositoryProvider);
  return repo.getWeather(city);
});

// test/providers/weather_provider_test.dart
void main() {
  test('weatherProvider returns data for valid city', () async {
    final mockWeatherRepo = MockWeatherRepository();
    when(mockWeatherRepo.getWeather('London'))
        .thenAnswer((_) async => Weather(city: 'London', temp: 15.0));

    final container = ProviderContainer(
      overrides: [
        weatherRepositoryProvider.overrideWithValue(mockWeatherRepo),
      ],
    );
    addTearDown(container.dispose);

    // Subscribe to trigger
    container.listen(weatherProvider('London'), (_, __) {});

    // Wait for future
    final weather = await container.read(weatherProvider('London').future);

    expect(weather.city, 'London');
    expect(weather.temp, 15.0);
  });

  test('weatherProvider returns error for unknown city', () async {
    final mockWeatherRepo = MockWeatherRepository();
    when(mockWeatherRepo.getWeather('Atlantis'))
        .thenThrow(NotFoundException('City not found'));

    final container = ProviderContainer(
      overrides: [
        weatherRepositoryProvider.overrideWithValue(mockWeatherRepo),
      ],
    );
    addTearDown(container.dispose);

    container.listen(weatherProvider('Atlantis'), (_, __) {});

    expect(
      () => container.read(weatherProvider('Atlantis').future),
      throwsA(isA<NotFoundException>()),
    );
  });
}
```

> **Interview Tip**: Riverpod's `ProviderContainer` with `overrides` is the testing equivalent of dependency injection. No `BuildContext` needed — you can test providers in pure Dart without `flutter_test`.

---

## 8. Test Coverage

### 8.1 Running with Coverage

```bash
# Generate coverage data
flutter test --coverage

# Output: coverage/lcov.info

# Generate HTML report (requires lcov)
# Install: brew install lcov
genhtml coverage/lcov.info -o coverage/html

# Open the report
open coverage/html/index.html

# Filter out generated code (e.g., .g.dart, .freezed.dart)
lcov --remove coverage/lcov.info \
  '**/*.g.dart' \
  '**/*.freezed.dart' \
  '**/*.part.dart' \
  '**/generated/**' \
  -o coverage/lcov_filtered.info

genhtml coverage/lcov_filtered.info -o coverage/html
```

### 8.2 Interpreting Results

```
  coverage/html/index.html
  ┌──────────────────────────────────────────────────────┐
  │  File                   Lines    Covered   %         │
  │  ─────────────────────  ───────  ────────  ─────     │
  │  lib/models/user.dart      20       20     100.0%    │
  │  lib/blocs/auth_bloc.dart  45       42      93.3%    │
  │  lib/services/api.dart     80       60      75.0%    │
  │  lib/utils/helpers.dart    30       15      50.0%    │
  │  ─────────────────────  ───────  ────────  ─────     │
  │  TOTAL                    175      137      78.3%    │
  └──────────────────────────────────────────────────────┘
```

| Coverage % | Interpretation |
|---|---|
| 90–100% | Excellent — most code paths tested |
| 75–90% | Good — typical production target |
| 50–75% | Fair — significant gaps remain |
| < 50% | Poor — high risk of undetected bugs |

```bash
# Run only tests in a specific directory
flutter test test/blocs/ --coverage

# Run a single test file
flutter test test/blocs/auth_bloc_test.dart --coverage

# Run tests with tags
flutter test --tags=unit
flutter test --exclude-tags=integration

# CI-friendly: fail if coverage below threshold
# (Use a package like 'very_good_cli')
very_good test --coverage --min-coverage 80
```

> **Interview Tip**: Coverage measures **lines executed**, not **correctness**. A test that calls a function but never asserts anything gives 100% coverage with 0% assurance. Always combine coverage metrics with meaningful assertions.

---

## 9. Quick Revision Table

| Topic | Key Points |
|---|---|
| **Testing Pyramid** | Unit (many, fast) → Widget (moderate) → Integration (few, slow) |
| **test()** | Basic unit test function. Use `group()` to organise. |
| **setUp / tearDown** | Run before/after each test. `setUpAll`/`tearDownAll` run once. |
| **expect()** | `expect(actual, matcher)` — core assertion function |
| **Matchers** | `equals`, `isA<T>()`, `throwsA`, `contains`, `hasLength`, `closeTo` |
| **isA().having()** | Chain `.having(selector, name, matcher)` for deep property matching |
| **Stream matchers** | `emits`, `emitsInOrder`, `emitsDone`, `neverEmits`, `emitsError` |
| **expectLater** | Use for Futures and Streams (not `expect`) |
| **Mockito setup** | `@GenerateMocks([...])` → `dart run build_runner build` |
| **thenReturn** | Sync return value (`when(...).thenReturn(value)`) |
| **thenAnswer** | Async return value (`when(...).thenAnswer((_) async => value)`) |
| **thenThrow** | Throw exception (`when(...).thenThrow(Exception())`) |
| **verify** | Assert method was called: `verify(mock.method()).called(n)` |
| **verifyNever** | Assert method was never called |
| **any / argThat** | Argument matchers for flexible stubbing & verification |
| **captureAny** | Capture arguments: `verify(mock.fn(captureAny)).captured` |
| **testWidgets** | Widget test entry point, provides `WidgetTester` |
| **pumpWidget** | Replace widget tree and render one frame |
| **pump()** | Render one frame (after setState, tap, etc.) |
| **pumpAndSettle()** | Pump until all animations complete. ⚠️ No infinite animations! |
| **Finders** | `find.text`, `find.byType`, `find.byKey`, `find.byIcon`, `find.descendant` |
| **findsOneWidget** | Exactly one widget matches the finder |
| **Widget wrapping** | Always wrap with `MaterialApp`. Add `Provider`/`BlocProvider` as needed. |
| **Golden tests** | `matchesGoldenFile(path)` — visual regression testing |
| **Integration tests** | `integration_test` package, run on real device/emulator |
| **Patrol** | Extends integration tests with native OS interactions |
| **blocTest()** | `build` → `act` → `expect`. `seed` for initial state. |
| **blocTest expect** | Lists **emitted** states only (not initial state) |
| **Cubit testing** | Same `blocTest()`, just call methods instead of adding events |
| **ProviderContainer** | Unit-test Riverpod providers without Flutter/BuildContext |
| **overrides** | `ProviderContainer(overrides: [...])` for DI in tests |
| **Coverage** | `flutter test --coverage` → `genhtml` for HTML report |
| **Coverage ≠ Quality** | High coverage without good assertions is meaningless |
| **Test file naming** | `*_test.dart` suffix required. Mirror `lib/` structure in `test/`. |

---

## 10. Common Interview Questions

> **Interview Tip**: Be prepared to **write a test live** during interviews. Practise the `blocTest` and `testWidgets` patterns until they're muscle memory.

**Q: What's the difference between `pump()` and `pumpAndSettle()`?**
`pump()` renders a single frame. `pumpAndSettle()` keeps pumping until there are no pending frames (animations complete). Never use `pumpAndSettle` with infinite animations (e.g., `CircularProgressIndicator`).

**Q: How do you test a widget that depends on a BLoC?**
Wrap the widget with `BlocProvider.value(value: mockBloc, child: ...)` and use `whenListen` or pre-seed the bloc's state. Always wrap in `MaterialApp`.

**Q: Why use `thenAnswer` instead of `thenReturn` for Futures?**
`thenReturn` returns the **same** Future instance every time, which can cause issues when the Future is awaited multiple times. `thenAnswer` creates a **new** Future on each call.

**Q: How do you mock a repository that returns a Stream?**
Use `when(mock.watchItems()).thenAnswer((_) => Stream.fromIterable([...]))` or use a `StreamController` for more control.

**Q: What is a golden test?**
A golden test captures a widget's rendered image and saves it as a "golden file". Future test runs compare the current rendering against this baseline to catch visual regressions.

**Q: How do you test Riverpod providers in unit tests?**
Use `ProviderContainer` with `overrides` to inject mock dependencies. Read providers with `container.read()`. No `BuildContext` or widget tree needed.
