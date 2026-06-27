# Firebase & Platform Channels

## 1. Firebase Setup

### Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Flutter App                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │   Auth   │ │Firestore │ │ Storage  │  ...        │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘            │
│       │             │            │                  │
│  ┌────┴─────────────┴────────────┴───────────────┐  │
│  │           firebase_core (Flutter)             │  │
│  └────────────────────┬──────────────────────────┘  │
│                       │                             │
│  ┌────────────────────┴──────────────────────────┐  │
│  │       firebase_options.dart (generated)       │  │
│  └───────────────────────────────────────────────┘  │
└───────────────────────┬─────────────────────────────┘
                        │
            ┌───────────┴───────────┐
            │  Firebase Console     │
            │  (Cloud Project)      │
            └───────────────────────┘
```

### FlutterFire CLI Setup

```bash
# 1. Install the FlutterFire CLI globally
dart pub global activate flutterfire_cli

# 2. Login to Firebase
firebase login

# 3. Configure your Flutter app (run from project root)
flutterfire configure

# This auto-generates:
#   - lib/firebase_options.dart
#   - google-services.json (Android)
#   - GoogleService-Info.plist (iOS)
#   - firebase.json
```

> **Interview Tip**: `flutterfire configure` eliminates manual platform setup. It generates `DefaultFirebaseOptions` with API keys, project IDs, and app IDs per platform. Never commit these to public repos.

### Firebase Initialization

```dart
// main.dart
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

void main() async {
  // Required before any Firebase service is used
  WidgetsFlutterBinding.ensureInitialized();

  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  runApp(const MyApp());
}
```

### pubspec.yaml Dependencies

```yaml
dependencies:
  firebase_core: ^3.9.0
  firebase_auth: ^5.5.0
  cloud_firestore: ^5.6.0
  firebase_storage: ^12.4.0
  firebase_messaging: ^15.2.0
  firebase_crashlytics: ^4.3.0
  google_sign_in: ^6.2.2
```

> **Interview Tip**: Always call `Firebase.initializeApp()` before `runApp()`. Use `WidgetsFlutterBinding.ensureInitialized()` because Firebase init uses platform channels which need the binding.

---

## 2. Firebase Authentication

### Auth State Architecture

```
┌────────────────────────────────────────────────────────┐
│                  FirebaseAuth Instance                 │
│                                                        │
│  authStateChanges()  ─── Stream<User?>                 │
│       │                   │                            │
│       │    ┌──────────────┴──────────────────┐         │
│       │    │  null = signed out              │         │
│       │    │  User = signed in               │         │
│       │    │  Emits on sign-in/out/token     │         │
│       │    └─────────────────────────────────┘         │
│       │                                                │
│  idTokenChanges()    ─── also fires on token refresh   │
│  userChanges()       ─── also fires on profile update  │
└────────────────────────────────────────────────────────┘
```

### Email/Password Authentication

```dart
class AuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;

  // ── Register ──
  Future<UserCredential> register(String email, String password) async {
    try {
      final credential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      // Optional: Update display name after registration
      await credential.user?.updateDisplayName(email.split('@').first);

      return credential;
    } on FirebaseAuthException catch (e) {
      switch (e.code) {
        case 'email-already-in-use':
          throw Exception('This email is already registered.');
        case 'weak-password':
          throw Exception('Password must be at least 6 characters.');
        case 'invalid-email':
          throw Exception('Invalid email format.');
        default:
          throw Exception('Registration failed: ${e.message}');
      }
    }
  }

  // ── Sign In ──
  Future<UserCredential> signIn(String email, String password) async {
    try {
      return await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
    } on FirebaseAuthException catch (e) {
      switch (e.code) {
        case 'user-not-found':
          throw Exception('No user found with this email.');
        case 'wrong-password':
          throw Exception('Incorrect password.');
        case 'user-disabled':
          throw Exception('This account has been disabled.');
        default:
          throw Exception('Sign in failed: ${e.message}');
      }
    }
  }

  // ── Sign Out ──
  Future<void> signOut() async {
    await _auth.signOut();
  }

  // ── Password Reset ──
  Future<void> resetPassword(String email) async {
    await _auth.sendPasswordResetEmail(email: email);
  }

  // ── Current User ──
  User? get currentUser => _auth.currentUser;

  // ── Auth State Stream ──
  Stream<User?> get authStateChanges => _auth.authStateChanges();
}
```

### Google Sign-In

```dart
import 'package:google_sign_in/google_sign_in.dart';

class GoogleAuthService {
  final FirebaseAuth _auth = FirebaseAuth.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();

  Future<UserCredential?> signInWithGoogle() async {
    // 1. Trigger Google sign-in flow (shows account picker)
    final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
    if (googleUser == null) return null; // User cancelled

    // 2. Obtain auth details from the Google account
    final GoogleSignInAuthentication googleAuth =
        await googleUser.authentication;

    // 3. Create a Firebase credential from Google tokens
    final OAuthCredential credential = GoogleAuthProvider.credential(
      accessToken: googleAuth.accessToken,
      idToken: googleAuth.idToken,
    );

    // 4. Sign in to Firebase with the credential
    return await _auth.signInWithCredential(credential);
  }

  Future<void> signOut() async {
    await Future.wait([
      _auth.signOut(),
      _googleSignIn.signOut(),
    ]);
  }
}
```

> **Interview Tip**: Google Sign-In uses OAuth 2.0. The `idToken` proves the user's identity; the `accessToken` grants access to Google APIs. Firebase receives these to create/link an account.

### Auth State Listener in Widget Tree

```dart
class AuthGate extends StatelessWidget {
  const AuthGate({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<User?>(
      stream: FirebaseAuth.instance.authStateChanges(),
      builder: (context, snapshot) {
        // Show loading while checking auth state
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }

        // User is signed in → home screen
        if (snapshot.hasData) {
          return const HomeScreen();
        }

        // User is signed out → login screen
        return const LoginScreen();
      },
    );
  }
}
```

### Auth State Persistence

```dart
// Firebase Auth persists sessions by default on mobile.
// On web, you can control persistence:
await FirebaseAuth.instance.setPersistence(Persistence.LOCAL);
// Options: LOCAL (survives browser close), SESSION (tab only), NONE

// Force refresh the ID token (useful after custom claims change)
final idToken = await FirebaseAuth.instance.currentUser?.getIdToken(true);
```

> **Interview Tip**: `authStateChanges()` fires on sign-in/sign-out only. `idTokenChanges()` also fires on token refresh. `userChanges()` also fires on profile updates (`updateDisplayName`, `updateEmail`). Pick the right stream for your use case.

---

## 3. Cloud Firestore

### Data Model

```
Firestore Database
│
├── users (collection)
│   ├── uid_001 (document)
│   │   ├── name: "Alice"
│   │   ├── email: "alice@example.com"
│   │   ├── createdAt: Timestamp
│   │   │
│   │   └── posts (sub-collection)
│   │       ├── post_001 (document)
│   │       │   ├── title: "Hello World"
│   │       │   ├── body: "..."
│   │       │   └── likes: 42
│   │       └── post_002
│   │
│   └── uid_002 (document)
│       ├── name: "Bob"
│       └── ...
│
└── settings (collection)
    └── app_config (document)
        ├── maintenanceMode: false
        └── minVersion: "2.0.0"
```

### CRUD Operations

```dart
class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // ── CREATE ──
  Future<DocumentReference> addUser(Map<String, dynamic> data) async {
    // add() auto-generates a document ID
    return await _db.collection('users').add({
      ...data,
      'createdAt': FieldValue.serverTimestamp(), // server-side timestamp
    });
  }

  // CREATE with a specific ID
  Future<void> setUser(String uid, Map<String, dynamic> data) async {
    // set() creates or overwrites the entire document
    await _db.collection('users').doc(uid).set(data);
  }

  // CREATE or MERGE (keeps existing fields not in data)
  Future<void> mergeUser(String uid, Map<String, dynamic> data) async {
    await _db.collection('users').doc(uid).set(
      data,
      SetOptions(merge: true), // only updates provided fields
    );
  }

  // ── READ (one-time) ──
  Future<Map<String, dynamic>?> getUser(String uid) async {
    final doc = await _db.collection('users').doc(uid).get();
    if (doc.exists) {
      return {'id': doc.id, ...doc.data()!};
    }
    return null;
  }

  // READ all documents in a collection
  Future<List<Map<String, dynamic>>> getAllUsers() async {
    final snapshot = await _db.collection('users').get();
    return snapshot.docs.map((doc) {
      return {'id': doc.id, ...doc.data()};
    }).toList();
  }

  // ── UPDATE ──
  Future<void> updateUser(String uid, Map<String, dynamic> data) async {
    // update() fails if the document doesn't exist
    await _db.collection('users').doc(uid).update(data);
  }

  // Atomic field operations
  Future<void> incrementLikes(String postId) async {
    await _db.collection('posts').doc(postId).update({
      'likes': FieldValue.increment(1),          // atomic increment
      'tags': FieldValue.arrayUnion(['trending']), // add to array
    });
  }

  // ── DELETE ──
  Future<void> deleteUser(String uid) async {
    await _db.collection('users').doc(uid).delete();
  }

  // Delete a specific field from a document
  Future<void> removeField(String uid, String field) async {
    await _db.collection('users').doc(uid).update({
      field: FieldValue.delete(),
    });
  }
}
```

> **Interview Tip**: `set()` overwrites the entire document. `update()` modifies specific fields but fails if the doc doesn't exist. `set()` with `merge: true` gives you the best of both — creates if missing, updates only provided fields.

### Real-time Listeners

```dart
class RealtimeService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // Listen to a single document
  Stream<Map<String, dynamic>?> watchUser(String uid) {
    return _db.collection('users').doc(uid).snapshots().map((doc) {
      if (doc.exists) {
        return {'id': doc.id, ...doc.data()!};
      }
      return null;
    });
  }

  // Listen to a collection query
  Stream<List<Map<String, dynamic>>> watchActiveUsers() {
    return _db
        .collection('users')
        .where('isActive', isEqualTo: true)
        .orderBy('lastSeen', descending: true)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs.map((doc) {
        return {'id': doc.id, ...doc.data()};
      }).toList();
    });
  }

  // Using snapshot metadata to detect source
  Stream<List<Map<String, dynamic>>> watchWithSource() {
    return _db.collection('users').snapshots().map((snapshot) {
      // Check if data came from cache or server
      final fromCache = snapshot.metadata.isFromCache;
      debugPrint('Data source: ${fromCache ? "cache" : "server"}');

      // Detect which documents changed
      for (final change in snapshot.docChanges) {
        switch (change.type) {
          case DocumentChangeType.added:
            debugPrint('New doc: ${change.doc.id}');
          case DocumentChangeType.modified:
            debugPrint('Modified: ${change.doc.id}');
          case DocumentChangeType.removed:
            debugPrint('Removed: ${change.doc.id}');
        }
      }

      return snapshot.docs.map((doc) => {'id': doc.id, ...doc.data()}).toList();
    });
  }
}
```

### Queries — Filtering, Ordering & Pagination

```dart
class QueryService {
  final _db = FirebaseFirestore.instance;

  // ── Compound queries ──
  Future<List<QueryDocumentSnapshot>> queryPosts() async {
    final snapshot = await _db
        .collection('posts')
        .where('status', isEqualTo: 'published')
        .where('likes', isGreaterThan: 10)
        .orderBy('likes', descending: true)
        .orderBy('createdAt', descending: true)
        .limit(20)
        .get();

    return snapshot.docs;
  }

  // ── Array queries ──
  Future<void> arrayQueries() async {
    // Documents where tags array contains 'flutter'
    await _db
        .collection('posts')
        .where('tags', arrayContains: 'flutter')
        .get();

    // Documents where tags contain ANY of these values (max 30)
    await _db
        .collection('posts')
        .where('tags', arrayContainsAny: ['flutter', 'dart'])
        .get();

    // Documents where status is one of these values (max 30)
    await _db
        .collection('posts')
        .where('status', whereIn: ['published', 'featured'])
        .get();
  }

  // ── Cursor-based Pagination ──
  DocumentSnapshot? _lastDocument;

  Future<List<Map<String, dynamic>>> getPage({int pageSize = 15}) async {
    Query query = _db
        .collection('posts')
        .orderBy('createdAt', descending: true)
        .limit(pageSize);

    // If we have a cursor, start after it
    if (_lastDocument != null) {
      query = query.startAfterDocument(_lastDocument!);
    }

    final snapshot = await query.get();

    if (snapshot.docs.isNotEmpty) {
      _lastDocument = snapshot.docs.last; // save cursor for next page
    }

    return snapshot.docs
        .map((doc) => {'id': doc.id, ...doc.data() as Map<String, dynamic>})
        .toList();
  }

  // Check if more pages are available
  bool get hasMore => _lastDocument != null;

  void resetPagination() => _lastDocument = null;
}
```

> **Interview Tip**: Firestore requires a composite index for queries with `where` + `orderBy` on different fields, or multiple inequality filters. The Flutter console error will include a direct link to create the required index.

### Sub-Collections

```dart
// ── Writing to a sub-collection ──
Future<void> addPost(String userId, Map<String, dynamic> post) async {
  await FirebaseFirestore.instance
      .collection('users')     // parent collection
      .doc(userId)             // parent document
      .collection('posts')     // sub-collection
      .add({
    ...post,
    'createdAt': FieldValue.serverTimestamp(),
  });
}

// ── Reading from a sub-collection ──
Stream<List<Map<String, dynamic>>> watchUserPosts(String userId) {
  return FirebaseFirestore.instance
      .collection('users')
      .doc(userId)
      .collection('posts')
      .orderBy('createdAt', descending: true)
      .snapshots()
      .map((snap) => snap.docs.map((d) => {'id': d.id, ...d.data()}).toList());
}

// ── Collection Group Query (query across ALL 'posts' sub-collections) ──
Future<List<Map<String, dynamic>>> getAllPostsFromAllUsers() async {
  // Requires a collection group index in Firebase Console
  final snapshot = await FirebaseFirestore.instance
      .collectionGroup('posts')
      .where('likes', isGreaterThan: 100)
      .orderBy('likes', descending: true)
      .get();

  return snapshot.docs
      .map((doc) => {'id': doc.id, 'path': doc.reference.path, ...doc.data()})
      .toList();
}
```

> **Interview Tip**: Sub-collections don't load when you read the parent document — they're independently queried. Use `collectionGroup()` to query the same-named sub-collection across all parent documents (requires a collection group index).

### Data Modeling with Type-Safe Models

```dart
class UserModel {
  final String id;
  final String name;
  final String email;
  final DateTime createdAt;
  final List<String> roles;

  const UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.createdAt,
    this.roles = const [],
  });

  // From Firestore document
  factory UserModel.fromFirestore(DocumentSnapshot<Map<String, dynamic>> doc) {
    final data = doc.data()!;
    return UserModel(
      id: doc.id,
      name: data['name'] as String,
      email: data['email'] as String,
      createdAt: (data['createdAt'] as Timestamp).toDate(),
      roles: List<String>.from(data['roles'] ?? []),
    );
  }

  // To Firestore-compatible map
  Map<String, dynamic> toFirestore() {
    return {
      'name': name,
      'email': email,
      'createdAt': Timestamp.fromDate(createdAt),
      'roles': roles,
    };
  }
}

// ── Using withConverter for type safety ──
final usersRef = FirebaseFirestore.instance
    .collection('users')
    .withConverter<UserModel>(
      fromFirestore: (snap, _) => UserModel.fromFirestore(snap),
      toFirestore: (user, _) => user.toFirestore(),
    );

// Now all reads/writes are type-safe
Future<void> typeSafeExample() async {
  // Write — accepts UserModel directly
  await usersRef.doc('uid_001').set(
    UserModel(
      id: 'uid_001',
      name: 'Alice',
      email: 'alice@example.com',
      createdAt: DateTime.now(),
      roles: ['admin'],
    ),
  );

  // Read — returns UserModel directly
  final snapshot = await usersRef.doc('uid_001').get();
  final UserModel? user = snapshot.data(); // No manual parsing!
}
```

### Batch Writes & Transactions

```dart
// ── Batch Write (atomic, no reads) ──
Future<void> batchOperation() async {
  final batch = FirebaseFirestore.instance.batch();
  final usersRef = FirebaseFirestore.instance.collection('users');

  // Multiple operations in a single atomic commit
  batch.set(usersRef.doc('u1'), {'name': 'Alice'});
  batch.update(usersRef.doc('u2'), {'score': FieldValue.increment(10)});
  batch.delete(usersRef.doc('u3'));

  await batch.commit(); // All succeed or all fail (max 500 ops)
}

// ── Transaction (atomic reads + writes) ──
Future<void> transferPoints(String fromId, String toId, int points) async {
  await FirebaseFirestore.instance.runTransaction((transaction) async {
    final fromRef = FirebaseFirestore.instance.collection('users').doc(fromId);
    final toRef = FirebaseFirestore.instance.collection('users').doc(toId);

    // Reads must come before writes in a transaction
    final fromSnap = await transaction.get(fromRef);
    final toSnap = await transaction.get(toRef);

    final fromPoints = fromSnap.data()!['points'] as int;
    if (fromPoints < points) {
      throw Exception('Insufficient points');
    }

    // Writes
    transaction.update(fromRef, {'points': fromPoints - points});
    transaction.update(toRef, {
      'points': (toSnap.data()!['points'] as int) + points,
    });
  });
}
```

> **Interview Tip**: Transactions automatically retry on contention (up to 5 times). All reads must happen before writes inside a transaction. Batch writes are for bulk operations without reads — they're simpler and faster.

### Security Rules Overview

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can only read/write their own document
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;

      // Sub-collection: only the owner can CRUD their posts
      match /posts/{postId} {
        allow read: if request.auth != null;
        allow create: if request.auth.uid == userId
                      && request.resource.data.title is string
                      && request.resource.data.title.size() <= 200;
        allow update, delete: if request.auth.uid == userId;
      }
    }

    // Public read, admin-only write
    match /settings/{doc} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
  }
}
```

> **Interview Tip**: Security rules run on the server. They DO NOT filter data — they only allow or deny requests. A query that could potentially return unauthorized documents will fail entirely, even if all actual results would be authorized. Your client queries must mirror your rules.

---

## 4. Firebase Storage

### Upload / Download Files

```dart
import 'dart:io';
import 'package:firebase_storage/firebase_storage.dart';

class StorageService {
  final FirebaseStorage _storage = FirebaseStorage.instance;

  // ── Upload a file ──
  Future<String> uploadFile(File file, String path) async {
    final ref = _storage.ref().child(path);
    // path example: 'users/uid_001/profile.jpg'

    // Set metadata
    final metadata = SettableMetadata(
      contentType: 'image/jpeg',
      customMetadata: {'uploadedBy': 'uid_001'},
    );

    final uploadTask = ref.putFile(file, metadata);

    // Wait for completion
    final snapshot = await uploadTask;

    // Get the download URL
    final downloadUrl = await snapshot.ref.getDownloadURL();
    return downloadUrl;
  }

  // ── Upload from bytes (web-friendly) ──
  Future<String> uploadBytes(Uint8List data, String path) async {
    final ref = _storage.ref().child(path);
    await ref.putData(data, SettableMetadata(contentType: 'image/png'));
    return await ref.getDownloadURL();
  }

  // ── Download a file ──
  Future<File> downloadFile(String path, String localPath) async {
    final ref = _storage.ref().child(path);
    final file = File(localPath);
    await ref.writeToFile(file);
    return file;
  }

  // ── Delete a file ──
  Future<void> deleteFile(String path) async {
    await _storage.ref().child(path).delete();
  }

  // ── List files in a directory ──
  Future<List<String>> listFiles(String directory) async {
    final result = await _storage.ref().child(directory).listAll();
    final urls = <String>[];
    for (final ref in result.items) {
      urls.add(await ref.getDownloadURL());
    }
    return urls;
  }
}
```

### Upload with Progress Tracking

```dart
class UploadWithProgress {
  Future<String> uploadWithProgress(
    File file,
    String path, {
    required void Function(double progress) onProgress,
  }) async {
    final ref = FirebaseStorage.instance.ref().child(path);
    final uploadTask = ref.putFile(file);

    // Listen to state changes
    uploadTask.snapshotEvents.listen((TaskSnapshot snapshot) {
      switch (snapshot.state) {
        case TaskState.running:
          final progress =
              snapshot.bytesTransferred / snapshot.totalBytes;
          onProgress(progress); // 0.0 to 1.0
        case TaskState.paused:
          debugPrint('Upload paused');
        case TaskState.success:
          debugPrint('Upload complete');
        case TaskState.canceled:
          debugPrint('Upload cancelled');
        case TaskState.error:
          debugPrint('Upload error');
      }
    });

    // Pause / Resume / Cancel controls
    // uploadTask.pause();
    // uploadTask.resume();
    // uploadTask.cancel();

    final snapshot = await uploadTask;
    return await snapshot.ref.getDownloadURL();
  }
}

// Usage in a widget with StreamBuilder
class UploadWidget extends StatefulWidget {
  const UploadWidget({super.key});

  @override
  State<UploadWidget> createState() => _UploadWidgetState();
}

class _UploadWidgetState extends State<UploadWidget> {
  UploadTask? _uploadTask;

  void _startUpload(File file) {
    final ref = FirebaseStorage.instance.ref('uploads/${file.uri.pathSegments.last}');
    setState(() {
      _uploadTask = ref.putFile(file);
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_uploadTask == null) return const Text('No upload');

    return StreamBuilder<TaskSnapshot>(
      stream: _uploadTask!.snapshotEvents,
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const CircularProgressIndicator();

        final data = snapshot.data!;
        final progress = data.bytesTransferred / data.totalBytes;

        return Column(
          children: [
            LinearProgressIndicator(value: progress),
            Text('${(progress * 100).toStringAsFixed(1)}%'),
            if (data.state == TaskState.running)
              TextButton(
                onPressed: () => _uploadTask!.pause(),
                child: const Text('Pause'),
              ),
            if (data.state == TaskState.paused)
              TextButton(
                onPressed: () => _uploadTask!.resume(),
                child: const Text('Resume'),
              ),
          ],
        );
      },
    );
  }
}
```

### Image Compression Before Upload

```dart
import 'package:image/image.dart' as img;

class ImageCompressor {
  /// Compress an image file before uploading to Firebase Storage.
  /// Returns the compressed file.
  static Future<File> compressImage(
    File file, {
    int maxWidth = 1024,
    int quality = 80,
  }) async {
    // Read the file bytes
    final bytes = await file.readAsBytes();

    // Decode the image
    final image = img.decodeImage(bytes);
    if (image == null) throw Exception('Could not decode image');

    // Resize if wider than maxWidth
    img.Image resized;
    if (image.width > maxWidth) {
      resized = img.copyResize(image, width: maxWidth);
    } else {
      resized = image;
    }

    // Encode as JPEG with quality parameter
    final compressed = img.encodeJpg(resized, quality: quality);

    // Write to a temporary file
    final tempDir = await getTemporaryDirectory();
    final compressedFile = File('${tempDir.path}/compressed_${DateTime.now().millisecondsSinceEpoch}.jpg');
    await compressedFile.writeAsBytes(compressed);

    return compressedFile;
  }
}

// Usage
Future<String> uploadProfilePhoto(File originalFile) async {
  final compressed = await ImageCompressor.compressImage(
    originalFile,
    maxWidth: 512,
    quality: 70,
  );

  return await StorageService().uploadFile(
    compressed,
    'profiles/${FirebaseAuth.instance.currentUser!.uid}.jpg',
  );
}
```

> **Interview Tip**: Always compress images client-side before upload. A 5MB photo can typically be reduced to 100–300KB with acceptable quality loss. This saves bandwidth, storage costs, and reduces load times for other users.

---

## 5. Firebase Cloud Messaging (FCM)

### FCM Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Your Server    │────▶│   FCM Service    │────▶│  User's Device   │
│  (sends message) │     │  (Google cloud)  │     │  (receives push) │
└──────────────────┘     └──────────────────┘     └──────────────────┘
                                                         │
                                              ┌──────────┴──────────┐
                                              │                     │
                                        ┌─────┴─────┐       ┌──────┴─────┐
                                        │ Foreground │       │ Background │
                                        │ onMessage  │       │ onMessage  │
                                        │            │       │ OpenedApp  │
                                        └────────────┘       └────────────┘
```

### Push Notification Setup

```dart
import 'package:firebase_messaging/firebase_messaging.dart';

// ── Top-level function for background messages ──
// Must be a top-level function (not a class method)
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  debugPrint('Background message: ${message.messageId}');
  // Handle data-only messages, update local DB, etc.
}

class FCMService {
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;

  Future<void> initialize() async {
    // 1. Register background handler (must be before any other FCM calls)
    FirebaseMessaging.onBackgroundMessage(
      _firebaseMessagingBackgroundHandler,
    );

    // 2. Request permission (required on iOS, Android 13+)
    final settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false, // true = silent notifications on iOS
      announcement: false,
      carPlay: false,
      criticalAlert: false,
    );

    debugPrint('Permission status: ${settings.authorizationStatus}');
    // AuthorizationStatus.authorized / .denied / .provisional / .notDetermined

    // 3. Get the FCM token (unique per device)
    final token = await _messaging.getToken();
    debugPrint('FCM Token: $token');
    // Save this token to your backend for targeted pushes

    // 4. Listen for token refresh (token can change)
    _messaging.onTokenRefresh.listen((newToken) {
      debugPrint('Token refreshed: $newToken');
      // Update token in your backend
    });

    // 5. Set up foreground message handler
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

    // 6. Handle notification tap when app is in background/terminated
    FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);

    // 7. Check if app was opened from a terminated state via notification
    final initialMessage = await _messaging.getInitialMessage();
    if (initialMessage != null) {
      _handleNotificationTap(initialMessage);
    }
  }

  void _handleForegroundMessage(RemoteMessage message) {
    debugPrint('Foreground message: ${message.notification?.title}');

    // Foreground notifications are NOT shown automatically on Android.
    // You need flutter_local_notifications to display them:
    _showLocalNotification(message);
  }

  void _handleNotificationTap(RemoteMessage message) {
    // Navigate to the appropriate screen based on message data
    final route = message.data['route'];
    final id = message.data['id'];
    debugPrint('Navigate to $route with id $id');
    // navigatorKey.currentState?.pushNamed(route, arguments: id);
  }

  void _showLocalNotification(RemoteMessage message) {
    // Use flutter_local_notifications package here
    // See notification channel setup below
  }
}
```

### Topic Subscriptions

```dart
class TopicService {
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;

  // Subscribe to a topic (e.g., per-user preferences)
  Future<void> subscribeToTopic(String topic) async {
    await _messaging.subscribeToTopic(topic);
    // Examples: 'news', 'sports', 'deals_us', 'flutter_updates'
  }

  Future<void> unsubscribeFromTopic(String topic) async {
    await _messaging.unsubscribeFromTopic(topic);
  }
}

// Server-side (Node.js example for context — not Flutter code):
// admin.messaging().send({
//   topic: 'flutter_updates',
//   notification: { title: 'New Update', body: 'Flutter 4.0 is here!' },
//   data: { route: '/updates', id: '42' },
// });
```

### Android Notification Channel Setup

```dart
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class NotificationChannels {
  static const AndroidNotificationChannel highImportanceChannel =
      AndroidNotificationChannel(
    'high_importance_channel',          // id
    'High Importance Notifications',    // name
    description: 'Used for important notifications.',
    importance: Importance.high,
    playSound: true,
    enableVibration: true,
  );

  static Future<void> setup() async {
    final flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();

    // Create the channel on Android
    await flutterLocalNotificationsPlugin
        .resolvePlatformSpecificImplementation<
            AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(highImportanceChannel);

    // Initialize
    await flutterLocalNotificationsPlugin.initialize(
      const InitializationSettings(
        android: AndroidInitializationSettings('@mipmap/ic_launcher'),
        iOS: DarwinInitializationSettings(),
      ),
      onDidReceiveNotificationResponse: (response) {
        // Handle notification tap from local notification
        debugPrint('Tapped local notification: ${response.payload}');
      },
    );
  }

  // Show a notification when a foreground FCM message arrives
  static void showForegroundNotification(RemoteMessage message) {
    final notification = message.notification;
    if (notification == null) return;

    FlutterLocalNotificationsPlugin().show(
      notification.hashCode,
      notification.title,
      notification.body,
      NotificationDetails(
        android: AndroidNotificationDetails(
          highImportanceChannel.id,
          highImportanceChannel.name,
          channelDescription: highImportanceChannel.description,
          icon: '@mipmap/ic_launcher',
        ),
        iOS: const DarwinNotificationDetails(),
      ),
      payload: message.data['route'],
    );
  }
}
```

> **Interview Tip**: On Android 13+ (API 33), `POST_NOTIFICATIONS` permission is required at runtime. FCM does NOT show notifications automatically when the app is in the foreground — you need `flutter_local_notifications`. Background and terminated notifications ARE shown automatically by the system.

---

## 6. Crashlytics

### Setup & Error Reporting

```dart
import 'package:firebase_crashlytics/firebase_crashlytics.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );

  // ── Catch all Flutter framework errors ──
  FlutterError.onError = (errorDetails) {
    FirebaseCrashlytics.instance.recordFlutterFatalError(errorDetails);
  };

  // ── Catch async errors not caught by Flutter ──
  PlatformDispatcher.instance.onError = (error, stack) {
    FirebaseCrashlytics.instance.recordError(error, stack, fatal: true);
    return true;
  };

  // ── Optional: Disable in debug mode ──
  // await FirebaseCrashlytics.instance
  //     .setCrashlyticsCollectionEnabled(!kDebugMode);

  runApp(const MyApp());
}
```

### Custom Keys, Logs & Non-Fatal Errors

```dart
class CrashlyticsService {
  final FirebaseCrashlytics _crashlytics = FirebaseCrashlytics.instance;

  // ── Set user identifier for crash grouping ──
  Future<void> setUser(String userId) async {
    await _crashlytics.setUserIdentifier(userId);
  }

  // ── Custom keys (appear in Crashlytics dashboard) ──
  Future<void> setCustomKeys() async {
    await _crashlytics.setCustomKey('subscription_plan', 'premium');
    await _crashlytics.setCustomKey('items_in_cart', 3);
    await _crashlytics.setCustomKey('dark_mode', true);
    await _crashlytics.setCustomKey('locale', 'en_US');
  }

  // ── Custom log messages (appear in crash report timeline) ──
  void logEvent(String message) {
    _crashlytics.log(message);
    // Example: 'User tapped checkout button'
    // Example: 'API response: 500 on /api/orders'
    // Stored in a ring buffer — latest 64KB kept per crash
  }

  // ── Non-fatal error reporting ──
  Future<void> reportNonFatal(dynamic error, StackTrace stack) async {
    await _crashlytics.recordError(
      error,
      stack,
      reason: 'API call failed',
      fatal: false, // non-fatal — appears separately in dashboard
    );
  }

  // ── Force a test crash ──
  void testCrash() {
    _crashlytics.crash(); // Throws a native crash for testing
  }
}

// Usage in a try-catch block
Future<void> fetchData() async {
  try {
    FirebaseCrashlytics.instance.log('Fetching user profile...');
    final response = await apiClient.get('/profile');
    FirebaseCrashlytics.instance.log('Profile fetched: ${response.statusCode}');
  } catch (e, stack) {
    FirebaseCrashlytics.instance.log('Profile fetch failed');
    await FirebaseCrashlytics.instance.recordError(
      e,
      stack,
      reason: 'Profile API failure',
      fatal: false,
    );
  }
}
```

> **Interview Tip**: Use `recordFlutterFatalError` for synchronous Flutter errors via `FlutterError.onError` and `recordError` with `fatal: true` for async errors via `PlatformDispatcher.instance.onError`. Use `fatal: false` for handled exceptions you still want to track.

---

## 7. Platform Channels

### How Platform Channels Work

```
┌─────────────────────────────────────────────────────────────────┐
│                     Flutter (Dart)                              │
│                                                                 │
│  ┌─────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │  MethodChannel  │  │  EventChannel    │  │ BasicMessage  │  │
│  │  (request/reply)│  │  (native→Dart    │  │ Channel       │  │
│  │                 │  │   stream)        │  │ (raw codec)   │  │
│  └────────┬────────┘  └────────┬─────────┘  └──────┬────────┘  │
│           │                    │                    │            │
├───────────┼────────────────────┼────────────────────┼────────────┤
│           │      Platform Channel (binary message)  │            │
├───────────┼────────────────────┼────────────────────┼────────────┤
│           │                    │                    │            │
│  ┌────────┴────────┐  ┌───────┴──────────┐  ┌──────┴────────┐  │
│  │  MethodChannel  │  │  EventChannel    │  │ BasicMessage  │  │
│  │  (handler)      │  │  (StreamHandler) │  │ Channel       │  │
│  └─────────────────┘  └──────────────────┘  └───────────────┘  │
│                                                                 │
│               Android (Kotlin/Java) / iOS (Swift/ObjC)          │
└─────────────────────────────────────────────────────────────────┘

Channel Types:
  MethodChannel      → One-shot request/response (like RPC)
  EventChannel       → Continuous stream from native to Dart
  BasicMessageChannel → Raw messages with a codec (custom protocols)
```

### MethodChannel — Dart Side

```dart
import 'package:flutter/services.dart';

class BatteryService {
  // Channel name must match exactly on both Dart and native sides
  static const _channel = MethodChannel('com.example.app/battery');

  /// Get the current battery level (0-100)
  Future<int> getBatteryLevel() async {
    try {
      // invokeMethod sends a message to native and awaits a response
      final int level = await _channel.invokeMethod('getBatteryLevel');
      return level;
    } on PlatformException catch (e) {
      throw Exception('Failed to get battery level: ${e.message}');
    } on MissingPluginException {
      throw Exception('Battery plugin not available on this platform');
    }
  }

  /// Send data to native with arguments
  Future<Map<String, dynamic>> getDeviceInfo() async {
    final result = await _channel.invokeMethod<Map>('getDeviceInfo', {
      'includeHardware': true,
      'includeOS': true,
    });
    return Map<String, dynamic>.from(result!);
  }

  /// Handle calls FROM native to Dart
  void setupNativeCallHandler() {
    _channel.setMethodCallHandler((MethodCall call) async {
      switch (call.method) {
        case 'onBatteryWarning':
          final level = call.arguments as int;
          debugPrint('Battery warning from native: $level%');
          return 'acknowledged'; // return value to native
        default:
          throw MissingPluginException('Not implemented: ${call.method}');
      }
    });
  }
}
```

### MethodChannel — Android (Kotlin) Side

```kotlin
// android/app/src/main/kotlin/.../MainActivity.kt
package com.example.app

import android.os.BatteryManager
import android.content.Context
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private val CHANNEL = "com.example.app/battery"

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        MethodChannel(
            flutterEngine.dartExecutor.binaryMessenger,
            CHANNEL
        ).setMethodCallHandler { call, result ->
            when (call.method) {
                "getBatteryLevel" -> {
                    val level = getBatteryLevel()
                    if (level != -1) {
                        result.success(level)        // Return value to Dart
                    } else {
                        result.error(               // Return error to Dart
                            "UNAVAILABLE",
                            "Battery level not available",
                            null
                        )
                    }
                }
                "getDeviceInfo" -> {
                    // Read arguments sent from Dart
                    val includeHardware = call.argument<Boolean>("includeHardware") ?: false
                    val info = mutableMapOf<String, Any>(
                        "model" to android.os.Build.MODEL,
                        "manufacturer" to android.os.Build.MANUFACTURER,
                    )
                    if (includeHardware) {
                        info["hardware"] = android.os.Build.HARDWARE
                    }
                    result.success(info)
                }
                else -> result.notImplemented()     // Method not found
            }
        }
    }

    private fun getBatteryLevel(): Int {
        val batteryManager = getSystemService(Context.BATTERY_SERVICE) as BatteryManager
        return batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
    }
}
```

### MethodChannel — iOS (Swift) Side

```swift
// ios/Runner/AppDelegate.swift
import UIKit
import Flutter

@main
@objc class AppDelegate: FlutterAppDelegate {
    override func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        let controller = window?.rootViewController as! FlutterViewController
        
        let channel = FlutterMethodChannel(
            name: "com.example.app/battery",
            binaryMessenger: controller.binaryMessenger
        )
        
        channel.setMethodCallHandler { [weak self] (call, result) in
            switch call.method {
            case "getBatteryLevel":
                self?.getBatteryLevel(result: result)
            case "getDeviceInfo":
                let args = call.arguments as? [String: Any]
                let includeHardware = args?["includeHardware"] as? Bool ?? false
                var info: [String: Any] = [
                    "model": UIDevice.current.model,
                    "systemVersion": UIDevice.current.systemVersion,
                ]
                if includeHardware {
                    info["name"] = UIDevice.current.name
                }
                result(info)
            default:
                result(FlutterMethodNotImplemented)
            }
        }
        
        GeneratedPluginRegistrant.register(with: self)
        return super.application(application, didFinishLaunchingWithOptions: launchOptions)
    }
    
    private func getBatteryLevel(result: @escaping FlutterResult) {
        let device = UIDevice.current
        device.isBatteryMonitoringEnabled = true
        
        if device.batteryState == .unknown {
            result(FlutterError(
                code: "UNAVAILABLE",
                message: "Battery level not available",
                details: nil
            ))
        } else {
            result(Int(device.batteryLevel * 100))
        }
    }
}
```

> **Interview Tip**: Platform channel names are arbitrary strings — convention is reverse-domain (`com.example.app/feature`). The name must match exactly between Dart and native. Calls are asynchronous on Dart side but run on the platform's UI thread on native side — offload heavy work to background threads.

### EventChannel — Streaming Data from Native

```dart
// Dart side — receiving a stream from native
class SensorService {
  static const _eventChannel = EventChannel('com.example.app/accelerometer');

  /// Returns a stream of accelerometer readings
  Stream<Map<String, double>> get accelerometerStream {
    return _eventChannel.receiveBroadcastStream().map((event) {
      final data = Map<String, dynamic>.from(event as Map);
      return {
        'x': (data['x'] as num).toDouble(),
        'y': (data['y'] as num).toDouble(),
        'z': (data['z'] as num).toDouble(),
      };
    });
  }
}

// Usage in a widget
class SensorWidget extends StatelessWidget {
  const SensorWidget({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<Map<String, double>>(
      stream: SensorService().accelerometerStream,
      builder: (context, snapshot) {
        if (!snapshot.hasData) return const Text('Waiting for sensor...');
        final data = snapshot.data!;
        return Text('X: ${data['x']!.toStringAsFixed(2)}, '
            'Y: ${data['y']!.toStringAsFixed(2)}, '
            'Z: ${data['z']!.toStringAsFixed(2)}');
      },
    );
  }
}
```

```kotlin
// Android side — EventChannel with StreamHandler
// In MainActivity.kt configureFlutterEngine:

import io.flutter.plugin.common.EventChannel
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager

class MainActivity : FlutterActivity() {
    private val EVENT_CHANNEL = "com.example.app/accelerometer"
    private var sensorManager: SensorManager? = null

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        sensorManager = getSystemService(Context.SENSOR_SERVICE) as SensorManager

        EventChannel(
            flutterEngine.dartExecutor.binaryMessenger,
            EVENT_CHANNEL
        ).setStreamHandler(object : EventChannel.StreamHandler {

            private var listener: SensorEventListener? = null

            // Called when Dart starts listening
            override fun onListen(arguments: Any?, events: EventChannel.EventSink?) {
                listener = object : SensorEventListener {
                    override fun onSensorChanged(event: SensorEvent?) {
                        event?.let {
                            // Send data to Dart via the EventSink
                            events?.success(mapOf(
                                "x" to it.values[0],
                                "y" to it.values[1],
                                "z" to it.values[2]
                            ))
                        }
                    }

                    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
                }

                val accelerometer = sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
                sensorManager?.registerListener(
                    listener,
                    accelerometer,
                    SensorManager.SENSOR_DELAY_UI
                )
            }

            // Called when Dart stops listening (stream cancelled)
            override fun onCancel(arguments: Any?) {
                sensorManager?.unregisterListener(listener)
                listener = null
            }
        })
    }
}
```

```swift
// iOS side — EventChannel with FlutterStreamHandler
// In AppDelegate.swift:

import CoreMotion

class AccelerometerStreamHandler: NSObject, FlutterStreamHandler {
    private let motionManager = CMMotionManager()
    
    func onListen(
        withArguments arguments: Any?,
        eventSink events: @escaping FlutterEventSink
    ) -> FlutterError? {
        guard motionManager.isAccelerometerAvailable else {
            events(FlutterError(
                code: "UNAVAILABLE",
                message: "Accelerometer not available",
                details: nil
            ))
            return nil
        }
        
        motionManager.accelerometerUpdateInterval = 0.1  // 10 Hz
        motionManager.startAccelerometerUpdates(to: .main) { data, error in
            if let error = error {
                events(FlutterError(
                    code: "ERROR",
                    message: error.localizedDescription,
                    details: nil
                ))
                return
            }
            if let data = data {
                events([
                    "x": data.acceleration.x,
                    "y": data.acceleration.y,
                    "z": data.acceleration.z,
                ])
            }
        }
        return nil
    }
    
    func onCancel(withArguments arguments: Any?) -> FlutterError? {
        motionManager.stopAccelerometerUpdates()
        return nil
    }
}

// Register in AppDelegate:
// let eventChannel = FlutterEventChannel(
//     name: "com.example.app/accelerometer",
//     binaryMessenger: controller.binaryMessenger
// )
// eventChannel.setStreamHandler(AccelerometerStreamHandler())
```

> **Interview Tip**: `MethodChannel` is for one-shot request/response. `EventChannel` is for continuous streams from native to Dart (sensors, connectivity, location). Dart listens via `receiveBroadcastStream()`. Native implements `StreamHandler` with `onListen`/`onCancel`.

### BasicMessageChannel

```dart
// BasicMessageChannel uses a codec for raw message passing.
// Useful for custom protocols or simple string/JSON messaging.

class BasicMessageService {
  // String codec
  static const _stringChannel = BasicMessageChannel<String>(
    'com.example.app/string_messages',
    StringCodec(),
  );

  // JSON codec
  static const _jsonChannel = BasicMessageChannel<dynamic>(
    'com.example.app/json_messages',
    JSONMessageCodec(),
  );

  /// Send and receive a string
  Future<String?> sendString(String message) async {
    return await _stringChannel.send(message);
  }

  /// Send and receive JSON
  Future<Map<String, dynamic>?> sendJson(Map<String, dynamic> data) async {
    final response = await _jsonChannel.send(data);
    return response != null ? Map<String, dynamic>.from(response) : null;
  }

  /// Listen for messages from native
  void listenForMessages() {
    _stringChannel.setMessageHandler((String? message) async {
      debugPrint('Received from native: $message');
      return 'Dart received: $message'; // reply
    });
  }
}
```

### Full Bidirectional Example — Clipboard Manager

```dart
// Dart side — full bidirectional communication
class ClipboardBridge {
  static const _channel = MethodChannel('com.example.app/clipboard');

  /// Call native to copy text
  Future<bool> copyToClipboard(String text) async {
    final result = await _channel.invokeMethod<bool>('copy', {'text': text});
    return result ?? false;
  }

  /// Call native to paste
  Future<String?> pasteFromClipboard() async {
    return await _channel.invokeMethod<String>('paste');
  }

  /// Listen for clipboard changes pushed FROM native
  void onClipboardChanged(void Function(String text) callback) {
    _channel.setMethodCallHandler((call) async {
      if (call.method == 'clipboardChanged') {
        final text = call.arguments as String;
        callback(text);
        return true; // acknowledge receipt
      }
      throw MissingPluginException();
    });
  }
}
```

```kotlin
// Android side — bidirectional
class MainActivity : FlutterActivity() {
    private lateinit var channel: MethodChannel

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        channel = MethodChannel(
            flutterEngine.dartExecutor.binaryMessenger,
            "com.example.app/clipboard"
        )

        channel.setMethodCallHandler { call, result ->
            when (call.method) {
                "copy" -> {
                    val text = call.argument<String>("text") ?: ""
                    val clipboard = getSystemService(Context.CLIPBOARD_SERVICE)
                        as android.content.ClipboardManager
                    clipboard.setPrimaryClip(
                        android.content.ClipData.newPlainText("text", text)
                    )
                    result.success(true)
                }
                "paste" -> {
                    val clipboard = getSystemService(Context.CLIPBOARD_SERVICE)
                        as android.content.ClipboardManager
                    val clip = clipboard.primaryClip
                    if (clip != null && clip.itemCount > 0) {
                        result.success(clip.getItemAt(0).text.toString())
                    } else {
                        result.success(null)
                    }
                }
                else -> result.notImplemented()
            }
        }

        // ── Call Dart FROM native ──
        // Example: notify Dart when clipboard changes
        // channel.invokeMethod("clipboardChanged", "new clipboard text")
    }
}
```

### Supported Data Types Across Platform Channels

| Dart Type | Android (Kotlin/Java) | iOS (Swift/ObjC) |
|---|---|---|
| `null` | `null` | `nil` (NSNull) |
| `bool` | `Boolean` | `Bool` (NSNumber) |
| `int` | `Int` / `Long` | `Int` (NSNumber) |
| `double` | `Double` | `Double` (NSNumber) |
| `String` | `String` | `String` |
| `Uint8List` | `ByteArray` | `FlutterStandardTypedData` |
| `Int32List` | `IntArray` | `FlutterStandardTypedData` |
| `Float64List` | `DoubleArray` | `FlutterStandardTypedData` |
| `List` | `ArrayList` | `Array` (NSArray) |
| `Map` | `HashMap` | `Dictionary` (NSDictionary) |

> **Interview Tip**: Only the types above can be sent across platform channels using `StandardMessageCodec`. Custom objects must be serialized to `Map`/`List` first. Nested structures are supported.

### Pigeon — Type-Safe Code Generation

```
┌───────────────────────────────────────────────────────┐
│                   Pigeon Workflow                     │
│                                                       │
│  1. Define API in Dart (abstract class + annotations) │
│                     │                                 │
│                     ▼                                 │
│  2. Run: dart run pigeon --input pigeons/messages.dart│
│                     │                                 │
│                     ▼                                 │
│  3. Generated code:                                   │
│     ├── lib/src/messages.g.dart      (Dart)           │
│     ├── android/.../Messages.g.kt    (Kotlin)         │
│     └── ios/Runner/Messages.g.swift  (Swift)          │
│                                                       │
│  4. Implement the generated interface on each platform│
└───────────────────────────────────────────────────────┘
```

```dart
// pigeons/messages.dart — Pigeon input definition
import 'package:pigeon/pigeon.dart';

// Configure output paths
@ConfigurePigeon(PigeonOptions(
  dartOut: 'lib/src/messages.g.dart',
  kotlinOut: 'android/app/src/main/kotlin/com/example/app/Messages.g.kt',
  kotlinOptions: KotlinOptions(package: 'com.example.app'),
  swiftOut: 'ios/Runner/Messages.g.swift',
))

// Data class — auto-generates serialization on all platforms
class DeviceInfo {
  final String model;
  final String osVersion;
  final int batteryLevel;
  final bool isCharging;

  DeviceInfo({
    required this.model,
    required this.osVersion,
    required this.batteryLevel,
    required this.isCharging,
  });
}

// Dart → Native (host API)
@HostApi()
abstract class DeviceApi {
  DeviceInfo getDeviceInfo();
  bool setBrightness(double level);
}

// Native → Dart (flutter API)
@FlutterApi()
abstract class DeviceEventsApi {
  void onBatteryWarning(int level);
  void onChargingStateChanged(bool isCharging);
}
```

```bash
# Generate platform code
dart run pigeon --input pigeons/messages.dart
```

```dart
// Dart usage (generated DeviceApi)
class DeviceService {
  final _api = DeviceApi();

  Future<DeviceInfo> getInfo() async {
    return await _api.getDeviceInfo();
    // Returns a strongly-typed DeviceInfo object!
  }

  Future<void> setBrightness(double level) async {
    await _api.setBrightness(level);
  }
}
```

```kotlin
// Android — implement the generated interface
// Messages.g.kt is auto-generated; you implement the interface:
class DeviceApiImpl(private val context: Context) : DeviceApi {
    override fun getDeviceInfo(): DeviceInfo {
        val batteryManager = context.getSystemService(Context.BATTERY_SERVICE)
            as BatteryManager
        return DeviceInfo(
            model = android.os.Build.MODEL,
            osVersion = android.os.Build.VERSION.RELEASE,
            batteryLevel = batteryManager.getIntProperty(
                BatteryManager.BATTERY_PROPERTY_CAPACITY
            ).toLong(),
            isCharging = batteryManager.isCharging
        )
    }

    override fun setBrightness(level: Double): Boolean {
        // Set screen brightness...
        return true
    }
}

// Register in MainActivity:
// DeviceApi.setUp(flutterEngine.dartExecutor.binaryMessenger, DeviceApiImpl(this))
```

> **Interview Tip**: Pigeon eliminates hand-written platform channel boilerplate and provides compile-time type safety. It generates serialization code for data classes and strongly-typed API interfaces. This is the recommended approach for production apps with significant native interop.

---

## 8. Quick Revision Table

| Topic | Key Class/Concept | Notes |
|---|---|---|
| Firebase Init | `Firebase.initializeApp()` | Must call before `runApp()`, needs `WidgetsFlutterBinding.ensureInitialized()` |
| FlutterFire CLI | `flutterfire configure` | Generates `firebase_options.dart` and platform config files |
| Email Auth | `FirebaseAuth.instance` | `createUserWithEmailAndPassword()` / `signInWithEmailAndPassword()` |
| Google Sign-In | `GoogleSignIn` + `GoogleAuthProvider` | Get Google tokens → create Firebase `OAuthCredential` → `signInWithCredential()` |
| Auth Stream | `authStateChanges()` | `Stream<User?>` — null = signed out, User = signed in |
| Auth Persistence | Automatic on mobile | On web: `setPersistence(Persistence.LOCAL)` |
| Firestore Create | `add()` / `set()` | `add()` = auto-ID, `set()` = custom ID, `set(merge: true)` = upsert |
| Firestore Read | `.get()` / `.snapshots()` | `.get()` = one-time, `.snapshots()` = real-time stream |
| Firestore Update | `update()` | Fails if doc doesn't exist; use `FieldValue.increment()`, `arrayUnion()` |
| Firestore Query | `where()` + `orderBy()` + `limit()` | Compound queries may need composite indexes |
| Pagination | `startAfterDocument()` | Cursor-based; save last `DocumentSnapshot` for next page |
| Collection Group | `collectionGroup('name')` | Queries same-named sub-collections across all parents |
| Transactions | `runTransaction()` | Atomic read+write; reads before writes; auto-retries (5x) |
| Batch Writes | `WriteBatch` | Atomic writes only (no reads); max 500 operations |
| Security Rules | `firestore.rules` | Server-side; deny by default; queries must mirror rules |
| Storage Upload | `ref.putFile()` / `ref.putData()` | Returns `UploadTask`; `snapshotEvents` for progress |
| Storage URL | `ref.getDownloadURL()` | Returns a long-lived HTTPS URL |
| FCM Token | `getToken()` / `onTokenRefresh` | Unique per device; save to backend for targeted push |
| FCM Foreground | `onMessage` listener | Must show notification manually via `flutter_local_notifications` |
| FCM Background | `onBackgroundMessage()` | Top-level function; runs in isolate |
| FCM Tap | `onMessageOpenedApp` / `getInitialMessage()` | Navigate based on `message.data` |
| Topics | `subscribeToTopic()` | Broadcast to all subscribers of a topic |
| Crashlytics | `FlutterError.onError` + `PlatformDispatcher.onError` | Catches sync + async errors; use `recordError()` for non-fatal |
| Custom Keys | `setCustomKey()` | Key-value pairs shown in crash reports |
| MethodChannel | `invokeMethod()` / `setMethodCallHandler()` | One-shot request/response; bidirectional |
| EventChannel | `receiveBroadcastStream()` | Native → Dart continuous stream; native implements `StreamHandler` |
| BasicMessageChannel | Codec-based raw messaging | `StringCodec`, `JSONMessageCodec`, `StandardMessageCodec` |
| Pigeon | `@HostApi()` / `@FlutterApi()` | Type-safe code generation; eliminates manual serialization |
| Channel Types | Supported types only | `null`, `bool`, `int`, `double`, `String`, `List`, `Map`, `Uint8List` |
| Channel Threading | UI thread on native | Offload heavy native work to background threads |

---

> **Interview Tip**: When asked about Firebase vs. other backends, mention: Firebase provides real-time sync, offline support, and serverless functions out of the box. Downsides: vendor lock-in, limited query flexibility (no JOINs, no OR across fields), pricing scales with reads/writes. For complex relational data, consider Supabase or a custom backend.

> **Interview Tip**: When asked "How does Flutter communicate with native code?", explain: Flutter uses Platform Channels — binary message passing over named channels. `MethodChannel` for request/response, `EventChannel` for streams, `BasicMessageChannel` for raw messages. Messages are serialized using `StandardMessageCodec`. For type safety in production, use Pigeon for code generation. All channel calls are async on Dart side but execute on the platform UI thread natively.
