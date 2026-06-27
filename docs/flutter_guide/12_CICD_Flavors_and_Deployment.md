# CI/CD, Flavors & Deployment

## 1. Build Modes

Flutter compiles apps in three modes, each optimized for a different stage of development.

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Flutter Build Modes                            │
├──────────────┬──────────────────┬────────────────────────────────────┤
│    Debug     │    Profile       │     Release                       │
│              │                  │                                    │
│  • Asserts   │  • Some DevTools │  • Full AOT compilation           │
│  • Hot Reload│  • Real perf     │  • Tree shaking                   │
│  • DevTools  │  • No debugger   │  • No asserts                     │
│  • JIT       │  • AOT           │  • Smallest binary                │
│              │                  │  • Obfuscation available           │
└──────────────┴──────────────────┴────────────────────────────────────┘
```

```dart
// Checking current build mode at runtime
import 'package:flutter/foundation.dart';

void initServices() {
  if (kDebugMode) {
    // Only runs in debug builds
    print('🐛 Debug mode — detailed logging enabled');
    setupDebugTools();
  }

  if (kProfileMode) {
    // Only runs in profile builds
    print('📊 Profile mode — performance monitoring active');
    startPerformanceOverlay();
  }

  if (kReleaseMode) {
    // Only runs in release builds
    print('🚀 Release mode — production configuration');
    initCrashlytics();
    disableScreenshots();
  }
}
```

```dart
// Conditional imports and behavior based on build mode
class ApiConfig {
  static String get baseUrl {
    if (kDebugMode) return 'http://localhost:8080/api';
    if (kProfileMode) return 'https://staging.myapp.com/api';
    return 'https://api.myapp.com/api';   // kReleaseMode
  }

  static Duration get timeout {
    // Longer timeout in debug for stepping through code
    if (kDebugMode) return const Duration(seconds: 60);
    return const Duration(seconds: 15);
  }

  static bool get enableLogging => !kReleaseMode;
}
```

| Mode | Command | Compilation | Asserts | DevTools | Use Case |
|------|---------|------------|---------|----------|----------|
| Debug | `flutter run` | JIT | ✅ | ✅ | Development, hot reload |
| Profile | `flutter run --profile` | AOT | ❌ | Partial | Performance testing |
| Release | `flutter run --release` | AOT | ❌ | ❌ | Production, store submission |

> **Interview Tip**: `kDebugMode` is a compile-time constant, so the compiler can tree-shake the entire `if` block in release builds. Using `assert()` for debug-only checks is another approach — asserts are stripped in release mode. Never use `kDebugMode` to gate security logic; always assume it could be bypassed.

---

## 2. Flavors / Build Variants

Flavors let you produce multiple versions of your app (dev, staging, prod) from a single codebase with different configurations, API endpoints, app IDs, and icons.

```
┌────────────────────────────────────────────────────────┐
│                   Single Codebase                       │
│                                                         │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐           │
│   │   dev     │   │ staging  │   │   prod   │           │
│   │          │   │          │   │          │           │
│   │ id: .dev │   │ id: .stg │   │ id: .com │           │
│   │ API: lcl │   │ API: stg │   │ API: prd │           │
│   │ icon: 🔧 │   │ icon: 🧪 │   │ icon: 🚀 │           │
│   └──────────┘   └──────────┘   └──────────┘           │
└────────────────────────────────────────────────────────┘
```

### Android: build.gradle productFlavors

```groovy
// android/app/build.gradle
android {
    // ...
    flavorDimensions "environment"

    productFlavors {
        dev {
            dimension "environment"
            applicationIdSuffix ".dev"
            versionNameSuffix "-dev"
            resValue "string", "app_name", "MyApp Dev"
            // Points to dev Firebase config
            // google-services.json in android/app/src/dev/
        }
        staging {
            dimension "environment"
            applicationIdSuffix ".staging"
            versionNameSuffix "-staging"
            resValue "string", "app_name", "MyApp Staging"
        }
        prod {
            dimension "environment"
            // No suffix — this is the production app ID
            resValue "string", "app_name", "MyApp"
        }
    }
}
```

### iOS: Xcode Schemes & Configurations

```
┌─────────────────────────────────────────────────────┐
│  Xcode Project Structure for Flavors                 │
│                                                      │
│  Configurations:                                     │
│    ├── Debug-dev                                     │
│    ├── Debug-staging                                 │
│    ├── Debug-prod                                    │
│    ├── Release-dev                                   │
│    ├── Release-staging                               │
│    └── Release-prod                                  │
│                                                      │
│  Schemes:                                            │
│    ├── dev    → uses Debug-dev / Release-dev         │
│    ├── staging→ uses Debug-staging / Release-staging │
│    └── prod   → uses Debug-prod / Release-prod      │
│                                                      │
│  Each scheme has its own:                            │
│    • Bundle Identifier (PRODUCT_BUNDLE_IDENTIFIER)   │
│    • Display Name (PRODUCT_NAME)                     │
│    • App Icon set                                    │
│    • Entitlements file                               │
└─────────────────────────────────────────────────────┘
```

### Running with Flavors

```bash
# Run specific flavor
flutter run --flavor dev
flutter run --flavor staging
flutter run --flavor prod

# Build specific flavor
flutter build apk --flavor prod --release
flutter build appbundle --flavor prod --release
flutter build ipa --flavor prod --release

# Combine with --dart-define for compile-time env variables
flutter run --flavor dev \
  --dart-define=API_URL=http://localhost:8080 \
  --dart-define=ENABLE_LOGS=true \
  --dart-define=APP_NAME=MyApp-Dev

# Using --dart-define-from-file (Flutter 3.7+)
flutter run --flavor dev --dart-define-from-file=config/dev.json
```

```json
// config/dev.json
{
  "API_URL": "http://localhost:8080",
  "ENABLE_LOGS": "true",
  "APP_NAME": "MyApp Dev",
  "SENTRY_DSN": "https://dev@sentry.io/123"
}
```

### Reading --dart-define at Runtime

```dart
// Access compile-time --dart-define values
class EnvConfig {
  static const String apiUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'https://api.myapp.com',
  );

  static const bool enableLogs = bool.fromEnvironment(
    'ENABLE_LOGS',
    defaultValue: false,
  );

  static const String appName = String.fromEnvironment(
    'APP_NAME',
    defaultValue: 'MyApp',
  );

  static const String sentryDsn = String.fromEnvironment('SENTRY_DSN');

  // These are true compile-time constants — tree-shaking works!
  // If ENABLE_LOGS is false, the logging code is removed entirely
}
```

### Environment Configuration Pattern

```dart
// lib/config/app_environment.dart
enum Environment { dev, staging, prod }

class AppConfig {
  final Environment environment;
  final String apiBaseUrl;
  final String appTitle;
  final bool enableLogging;
  final String sentryDsn;
  final bool enableAnalytics;

  const AppConfig({
    required this.environment,
    required this.apiBaseUrl,
    required this.appTitle,
    this.enableLogging = false,
    this.sentryDsn = '',
    this.enableAnalytics = false,
  });

  /// Factory that reads from --dart-define values
  factory AppConfig.fromEnvironment() {
    const env = String.fromEnvironment('ENV', defaultValue: 'dev');
    switch (env) {
      case 'prod':
        return AppConfig.prod();
      case 'staging':
        return AppConfig.staging();
      default:
        return AppConfig.dev();
    }
  }

  factory AppConfig.dev() => const AppConfig(
        environment: Environment.dev,
        apiBaseUrl: 'http://localhost:8080/api',
        appTitle: 'MyApp [DEV]',
        enableLogging: true,
      );

  factory AppConfig.staging() => const AppConfig(
        environment: Environment.staging,
        apiBaseUrl: 'https://staging-api.myapp.com/api',
        appTitle: 'MyApp [STG]',
        enableLogging: true,
        sentryDsn: 'https://staging@sentry.io/123',
      );

  factory AppConfig.prod() => const AppConfig(
        environment: Environment.prod,
        apiBaseUrl: 'https://api.myapp.com/api',
        appTitle: 'MyApp',
        enableLogging: false,
        sentryDsn: 'https://prod@sentry.io/456',
        enableAnalytics: true,
      );

  bool get isDev => environment == Environment.dev;
  bool get isStaging => environment == Environment.staging;
  bool get isProd => environment == Environment.prod;
}
```

```dart
// lib/main_dev.dart — separate entry point per flavor
import 'package:myapp/config/app_environment.dart';
import 'package:myapp/app.dart';

void main() {
  final config = AppConfig.dev();
  runApp(MyApp(config: config));
}

// lib/main_staging.dart
void main() {
  final config = AppConfig.staging();
  runApp(MyApp(config: config));
}

// lib/main_prod.dart
void main() {
  final config = AppConfig.prod();
  runApp(MyApp(config: config));
}
```

```bash
# Run with specific entry point (target)
flutter run --flavor dev -t lib/main_dev.dart
flutter run --flavor staging -t lib/main_staging.dart
flutter run --flavor prod -t lib/main_prod.dart
```

### flutter_flavorizr Package

```yaml
# pubspec.yaml — automated flavor setup
dev_dependencies:
  flutter_flavorizr: ^2.2.3

flavorizr:
  flavors:
    dev:
      app:
        name: "MyApp Dev"
      android:
        applicationId: "com.example.myapp.dev"
      ios:
        bundleId: "com.example.myapp.dev"
    staging:
      app:
        name: "MyApp Staging"
      android:
        applicationId: "com.example.myapp.staging"
      ios:
        bundleId: "com.example.myapp.staging"
    prod:
      app:
        name: "MyApp"
      android:
        applicationId: "com.example.myapp"
      ios:
        bundleId: "com.example.myapp"
```

```bash
# Generate all flavor configs automatically
flutter pub run flutter_flavorizr
```

> **Interview Tip**: Flavors and `--dart-define` serve different purposes. Flavors change native-level configuration (app ID, icon, name, signing). `--dart-define` injects compile-time Dart constants. Use both together: flavors for platform config, `--dart-define` for Dart-level feature flags and API URLs. Values from `String.fromEnvironment` are true compile-time constants, making them eligible for tree-shaking.

---

## 3. App Signing

### Android: Keystore & Signing Config

```bash
# Step 1: Generate a keystore (do this ONCE, keep it safe)
keytool -genkey -v \
  -keystore ~/upload-keystore.jks \
  -storetype JKS \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias upload
```

```properties
# Step 2: android/key.properties (DO NOT commit to git!)
storePassword=your_store_password
keyPassword=your_key_password
keyAlias=upload
storeFile=/Users/you/upload-keystore.jks
```

```groovy
// Step 3: android/app/build.gradle — read key.properties & configure signing
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ...

    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile keystoreProperties['storeFile']
                    ? file(keystoreProperties['storeFile'])
                    : null
            storePassword keystoreProperties['storePassword']
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true       // Enable R8/ProGuard
            shrinkResources true     // Remove unused resources
            proguardFiles getDefaultProguardFile(
                'proguard-android-optimize.txt'
            ), 'proguard-rules.pro'
        }
    }
}
```

```gitignore
# .gitignore — NEVER commit these files
*.jks
*.keystore
key.properties
```

### iOS: Certificates & Provisioning Profiles

```
┌─────────────────────────────────────────────────────────────────┐
│               iOS Signing Chain                                  │
│                                                                  │
│  Apple Developer Account                                         │
│    │                                                             │
│    ├── Certificate (Development / Distribution)                  │
│    │     └── Private Key (in Keychain)                           │
│    │                                                             │
│    ├── App ID (com.example.myapp)                                │
│    │     └── Capabilities (Push, IAP, etc.)                      │
│    │                                                             │
│    └── Provisioning Profile                                      │
│          ├── Links Certificate + App ID + Devices                │
│          ├── Development Profile → for debug builds              │
│          └── Distribution Profile → for App Store / Ad Hoc       │
│                                                                  │
│  Xcode "Automatically manage signing" handles all of this       │
│  OR use manual signing for CI/CD pipelines                       │
└─────────────────────────────────────────────────────────────────┘
```

```ruby
# Fastlane match — recommended for team/CI signing management
# Matchfile
git_url("https://github.com/yourorg/certificates")
storage_mode("git")
type("appstore")            # appstore, adhoc, development
app_identifier("com.example.myapp")
username("dev@yourcompany.com")

# Usage in Fastfile
lane :build do
  match(type: "appstore")   # Fetches or creates cert + profile
  build_app(
    scheme: "prod",
    export_method: "app-store",
  )
end
```

> **Interview Tip**: On Android, Google Play uses App Signing by Google Play — you upload with an "upload key" and Google re-signs with the actual signing key. This means losing your upload key is recoverable (contact Google), but losing the Google-held signing key is not. On iOS, always use Fastlane Match for CI/CD — it stores certificates in a Git repo or cloud storage, ensuring every CI machine has the same signing identity.

---

## 4. Build Commands

### Complete Build Command Reference

```bash
# ─────────────────────────────────────────────
# Android APK (universal or per-ABI)
# ─────────────────────────────────────────────
flutter build apk                              # Fat APK (all ABIs)
flutter build apk --split-per-abi              # Separate APKs per ABI
flutter build apk --release --flavor prod      # Production APK
flutter build apk --target-platform android-arm64  # Specific arch
flutter build apk --obfuscate --split-debug-info=build/symbols

# ─────────────────────────────────────────────
# Android App Bundle (recommended for Play Store)
# ─────────────────────────────────────────────
flutter build appbundle                        # Default release AAB
flutter build appbundle --flavor prod          # With flavor
flutter build appbundle --obfuscate \
  --split-debug-info=build/symbols             # Obfuscated + symbols

# ─────────────────────────────────────────────
# iOS IPA
# ─────────────────────────────────────────────
flutter build ipa                              # Builds .xcarchive + .ipa
flutter build ipa --flavor prod                # With flavor
flutter build ipa --export-method ad-hoc       # For testing (not App Store)
flutter build ipa --obfuscate \
  --split-debug-info=build/symbols

# ─────────────────────────────────────────────
# Web
# ─────────────────────────────────────────────
flutter build web                              # Default (HTML renderer)
flutter build web --web-renderer canvaskit     # CanvasKit (Skia-based)
flutter build web --web-renderer html          # HTML renderer
flutter build web --base-href /myapp/          # Custom base URL path
flutter build web --pwa-strategy none          # Disable service worker

# ─────────────────────────────────────────────
# macOS / Windows / Linux
# ─────────────────────────────────────────────
flutter build macos
flutter build windows
flutter build linux

# ─────────────────────────────────────────────
# Common Flags (apply to all platforms)
# ─────────────────────────────────────────────
--release                    # Release mode (default for build)
--debug                      # Debug mode
--profile                    # Profile mode
--flavor <name>              # Build flavor
-t lib/main_prod.dart        # Custom entry point (--target)
--dart-define=KEY=VALUE      # Compile-time constant
--dart-define-from-file=X    # Load defines from JSON file
--obfuscate                  # Obfuscate Dart code
--split-debug-info=<dir>     # Output debug symbols (needed for --obfuscate)
--build-name=1.2.3           # Override version name
--build-number=42            # Override build number
--tree-shake-icons           # Remove unused Material icons (default: on)
```

| Command | Output | Size | Use Case |
|---------|--------|------|----------|
| `build apk` | Single `.apk` | ~15-40 MB | Direct install, internal testing |
| `build apk --split-per-abi` | 3 `.apk` files | ~8-15 MB each | Size-conscious distribution |
| `build appbundle` | `.aab` | ~10-20 MB | Google Play Store (required) |
| `build ipa` | `.ipa` + `.xcarchive` | ~20-50 MB | Apple App Store / TestFlight |
| `build web` | `build/web/` folder | ~2-5 MB | Web hosting |

> **Interview Tip**: Always use `--obfuscate` with `--split-debug-info` for release builds. Obfuscation renames symbols to make reverse-engineering harder. The split debug info folder contains the mapping files you need to symbolicate crash reports in Firebase Crashlytics or Sentry. Google Play requires `.aab` (App Bundle) — APKs are no longer accepted for new apps.

---

## 5. CI/CD Pipelines

### Pipeline Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                     CI/CD Pipeline Flow                               │
│                                                                       │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐           │
│  │  Lint   │───▶│  Test   │───▶│  Build  │───▶│ Deploy  │           │
│  │         │    │         │    │         │    │         │           │
│  │ analyze │    │ unit    │    │ APK/AAB │    │ Play    │           │
│  │ format  │    │ widget  │    │ IPA     │    │ App Str │           │
│  │ rules   │    │ integr. │    │ Web     │    │ Firebase│           │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘           │
│       │              │              │              │                  │
│       ▼              ▼              ▼              ▼                  │
│   [PR Gate]      [PR Gate]    [Main/Tag]     [Main/Tag]             │
└──────────────────────────────────────────────────────────────────────┘
```

### GitHub Actions Workflow (Complete YAML)

```yaml
# .github/workflows/flutter_ci.yml
name: Flutter CI/CD

on:
  push:
    branches: [main, develop]
    tags: ['v*']
  pull_request:
    branches: [main, develop]

# Cancel in-progress runs for the same branch
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  FLUTTER_VERSION: '3.24.0'
  JAVA_VERSION: '17'

jobs:
  # ──────────────────────────────────────────
  # Stage 1: Lint & Analyze
  # ──────────────────────────────────────────
  analyze:
    name: 🔍 Analyze
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: subosito/flutter-action@v2
        with:
          flutter-version: ${{ env.FLUTTER_VERSION }}
          cache: true

      - name: Install dependencies
        run: flutter pub get

      - name: Check formatting
        run: dart format --set-exit-if-changed .

      - name: Run analyzer
        run: flutter analyze --fatal-infos

      - name: Check for unused dependencies
        run: |
          dart pub global activate dependency_validator
          dart pub global run dependency_validator

  # ──────────────────────────────────────────
  # Stage 2: Test
  # ──────────────────────────────────────────
  test:
    name: 🧪 Test
    runs-on: ubuntu-latest
    needs: analyze
    steps:
      - uses: actions/checkout@v4

      - uses: subosito/flutter-action@v2
        with:
          flutter-version: ${{ env.FLUTTER_VERSION }}
          cache: true

      - name: Install dependencies
        run: flutter pub get

      - name: Run unit & widget tests with coverage
        run: flutter test --coverage --test-randomize-ordering-seed=random

      - name: Check minimum coverage (90%)
        uses: VeryGoodOpenSource/very_good_coverage@v3
        with:
          min_coverage: 90
          path: coverage/lcov.info

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v4
        with:
          file: coverage/lcov.info
          token: ${{ secrets.CODECOV_TOKEN }}

  # ──────────────────────────────────────────
  # Stage 3: Build Android
  # ──────────────────────────────────────────
  build-android:
    name: 🤖 Build Android
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main' || startsWith(github.ref, 'refs/tags/v')
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: ${{ env.JAVA_VERSION }}

      - uses: subosito/flutter-action@v2
        with:
          flutter-version: ${{ env.FLUTTER_VERSION }}
          cache: true

      - name: Install dependencies
        run: flutter pub get

      # Decode keystore from GitHub Secrets
      - name: Decode keystore
        run: echo "${{ secrets.ANDROID_KEYSTORE_BASE64 }}" | base64 -d > android/app/upload-keystore.jks

      - name: Create key.properties
        run: |
          cat <<EOF > android/key.properties
          storePassword=${{ secrets.ANDROID_STORE_PASSWORD }}
          keyPassword=${{ secrets.ANDROID_KEY_PASSWORD }}
          keyAlias=${{ secrets.ANDROID_KEY_ALIAS }}
          storeFile=upload-keystore.jks
          EOF

      - name: Build App Bundle
        run: |
          flutter build appbundle \
            --flavor prod \
            -t lib/main_prod.dart \
            --obfuscate \
            --split-debug-info=build/symbols \
            --build-number=${{ github.run_number }}

      - name: Upload AAB artifact
        uses: actions/upload-artifact@v4
        with:
          name: android-release
          path: build/app/outputs/bundle/prodRelease/*.aab

      - name: Upload debug symbols
        uses: actions/upload-artifact@v4
        with:
          name: android-symbols
          path: build/symbols/

  # ──────────────────────────────────────────
  # Stage 4: Build iOS
  # ──────────────────────────────────────────
  build-ios:
    name: 🍎 Build iOS
    runs-on: macos-latest
    needs: test
    if: github.ref == 'refs/heads/main' || startsWith(github.ref, 'refs/tags/v')
    steps:
      - uses: actions/checkout@v4

      - uses: subosito/flutter-action@v2
        with:
          flutter-version: ${{ env.FLUTTER_VERSION }}
          cache: true

      - name: Install dependencies
        run: flutter pub get

      - name: Install CocoaPods
        run: cd ios && pod install

      # iOS signing with Fastlane Match
      - name: Setup signing
        env:
          MATCH_PASSWORD: ${{ secrets.MATCH_PASSWORD }}
          MATCH_GIT_URL: ${{ secrets.MATCH_GIT_URL }}
          APP_STORE_CONNECT_API_KEY: ${{ secrets.APP_STORE_CONNECT_API_KEY }}
        run: |
          cd ios
          bundle install
          bundle exec fastlane match appstore --readonly

      - name: Build IPA
        run: |
          flutter build ipa \
            --flavor prod \
            -t lib/main_prod.dart \
            --obfuscate \
            --split-debug-info=build/symbols \
            --build-number=${{ github.run_number }} \
            --export-options-plist=ios/ExportOptions.plist

      - name: Upload IPA artifact
        uses: actions/upload-artifact@v4
        with:
          name: ios-release
          path: build/ios/ipa/*.ipa

  # ──────────────────────────────────────────
  # Stage 5: Deploy (on tag push only)
  # ──────────────────────────────────────────
  deploy-android:
    name: 🚀 Deploy Android
    runs-on: ubuntu-latest
    needs: build-android
    if: startsWith(github.ref, 'refs/tags/v')
    steps:
      - uses: actions/download-artifact@v4
        with:
          name: android-release

      - name: Upload to Google Play (internal track)
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.GOOGLE_PLAY_SERVICE_ACCOUNT }}
          packageName: com.example.myapp
          releaseFiles: "*.aab"
          track: internal        # internal → alpha → beta → production
          status: completed

  deploy-ios:
    name: 🚀 Deploy iOS
    runs-on: macos-latest
    needs: build-ios
    if: startsWith(github.ref, 'refs/tags/v')
    steps:
      - uses: actions/checkout@v4

      - uses: actions/download-artifact@v4
        with:
          name: ios-release

      - name: Upload to TestFlight
        env:
          APP_STORE_CONNECT_API_KEY: ${{ secrets.APP_STORE_CONNECT_API_KEY }}
        run: |
          cd ios
          bundle install
          bundle exec fastlane upload_to_testflight(
            ipa: "../build/ios/ipa/MyApp.ipa",
            skip_waiting_for_build_processing: true
          )
```

### Codemagic (codemagic.yaml)

```yaml
# codemagic.yaml — drop-in CI/CD for Flutter
workflows:
  flutter-production:
    name: Production Build
    max_build_duration: 60
    instance_type: mac_mini_m2
    environment:
      flutter: 3.24.0
      xcode: latest
      groups:
        - google_play_credentials
        - app_store_credentials
      vars:
        BUNDLE_ID: "com.example.myapp"
    
    triggering:
      events:
        - tag
      tag_patterns:
        - pattern: 'v*'

    scripts:
      - name: Install dependencies
        script: flutter pub get

      - name: Run tests
        script: flutter test

      - name: Build Android
        script: |
          flutter build appbundle \
            --flavor prod \
            -t lib/main_prod.dart \
            --build-number=$PROJECT_BUILD_NUMBER

      - name: Build iOS
        script: |
          flutter build ipa \
            --flavor prod \
            -t lib/main_prod.dart \
            --build-number=$PROJECT_BUILD_NUMBER

    artifacts:
      - build/**/outputs/**/*.aab
      - build/ios/ipa/*.ipa

    publishing:
      google_play:
        credentials: $GCLOUD_SERVICE_ACCOUNT_CREDENTIALS
        track: internal
      app_store_connect:
        api_key: $APP_STORE_CONNECT_PRIVATE_KEY
        key_id: $APP_STORE_CONNECT_KEY_ID
        issuer_id: $APP_STORE_CONNECT_ISSUER_ID
        submit_to_testflight: true
```

### Fastlane Integration

```ruby
# ios/fastlane/Fastfile
default_platform(:ios)

platform :ios do
  desc "Build and upload to TestFlight"
  lane :beta do
    setup_ci if ENV['CI']
    
    match(
      type: "appstore",
      readonly: is_ci,
    )
    
    build_app(
      scheme: "prod",
      archive_path: "./build/Runner.xcarchive",
      export_method: "app-store",
      output_directory: "./build/ipa",
    )
    
    upload_to_testflight(
      skip_waiting_for_build_processing: true,
    )
  end

  desc "Build and distribute via Firebase"
  lane :firebase_distribute do
    setup_ci if ENV['CI']
    
    match(type: "adhoc", readonly: is_ci)
    
    build_app(
      scheme: "staging",
      export_method: "ad-hoc",
    )
    
    firebase_app_distribution(
      app: "1:123456789:ios:abcdef",
      groups: "internal-testers",
      release_notes: changelog_from_git_commits,
    )
  end
end
```

```ruby
# android/fastlane/Fastfile
default_platform(:android)

platform :android do
  desc "Deploy to Google Play internal track"
  lane :internal do
    upload_to_play_store(
      track: "internal",
      aab: "../build/app/outputs/bundle/prodRelease/app-prod-release.aab",
      json_key: "play-store-credentials.json",
      skip_upload_metadata: true,
      skip_upload_changelogs: false,
    )
  end

  desc "Promote internal to production"
  lane :promote_to_production do
    upload_to_play_store(
      track: "internal",
      track_promote_to: "production",
      json_key: "play-store-credentials.json",
      rollout: "0.1",    # 10% staged rollout
    )
  end
end
```

> **Interview Tip**: In CI/CD, never hardcode secrets in YAML. Use encrypted secrets (GitHub Secrets, Codemagic env groups). For iOS CI, you need a macOS runner — GitHub Actions charges more for `macos-latest`. Codemagic gives free macOS M2 minutes for Flutter projects. The typical promotion flow for Play Store is: internal → closed testing → open testing → production with staged rollout.

---

## 6. Code Quality

### flutter analyze & Custom Rules

```yaml
# analysis_options.yaml — strict, production-grade config
include: package:flutter_lints/flutter.yaml
# OR use the stricter version:
# include: package:very_good_analysis/analysis_options.yaml

analyzer:
  errors:
    # Treat these as errors (fail CI)
    missing_return: error
    dead_code: warning
    unused_import: warning
    unused_local_variable: warning
    
  exclude:
    - "**/*.g.dart"           # Generated code (json_serializable, etc.)
    - "**/*.freezed.dart"     # Freezed generated code
    - "**/*.mocks.dart"       # Mockito mocks
    - "lib/generated/**"
    - "test/.test_coverage.dart"

  language:
    strict-casts: true        # No implicit casts
    strict-raw-types: true    # No raw generic types
    strict-inference: true    # Require type annotations where needed

linter:
  rules:
    # ── Style ──
    - always_declare_return_types
    - always_use_package_imports    # No relative imports
    - avoid_print                   # Use logger instead
    - avoid_relative_lib_imports
    - prefer_const_constructors
    - prefer_const_declarations
    - prefer_final_locals
    - prefer_single_quotes
    - sort_constructors_first
    - sort_unnamed_constructors_first
    - unawaited_futures             # Must await or use unawaited()
    
    # ── Safety ──
    - avoid_dynamic_calls
    - cancel_subscriptions
    - close_sinks
    - no_duplicate_case_values
    - throw_in_finally             # Never throw in finally blocks
    - unnecessary_statements
    
    # ── Flutter-specific ──
    - sized_box_for_whitespace     # SizedBox instead of Container
    - use_colored_box              # ColoredBox instead of Container
    - use_decorated_box            # DecoratedBox instead of Container
    - avoid_unnecessary_containers
    - use_key_in_widget_constructors
```

```bash
# Run analysis
flutter analyze                    # Default — shows all issues
flutter analyze --fatal-infos     # Exit code 1 on info-level issues
flutter analyze --fatal-warnings  # Exit code 1 on warnings (default)

# Auto-fix known issues
dart fix --dry-run                # Preview fixes
dart fix --apply                  # Apply all auto-fixes

# Format code
dart format .                     # Format all Dart files
dart format --set-exit-if-changed .   # Fail CI if unformatted
dart format -l 100 .              # Custom line length (default: 80)
```

### Pre-commit Hooks with Lefthook

```yaml
# lefthook.yml — git hooks for code quality
pre-commit:
  parallel: true
  commands:
    format:
      glob: "*.dart"
      run: dart format --set-exit-if-changed {staged_files}
    
    analyze:
      glob: "*.dart"
      run: flutter analyze --fatal-infos
    
    test:
      run: flutter test --no-pub

pre-push:
  commands:
    full-test:
      run: flutter test --coverage
    
    check-coverage:
      run: |
        flutter test --coverage
        lcov_total=$(lcov --summary coverage/lcov.info 2>&1 | grep 'lines' | grep -oP '[\d.]+(?=%)')
        if (( $(echo "$lcov_total < 80" | bc -l) )); then
          echo "Coverage $lcov_total% is below 80%"
          exit 1
        fi
```

```bash
# Install lefthook
brew install lefthook      # macOS
lefthook install           # Set up git hooks
```

### Custom Lint Rules with custom_lint

```dart
// Using DCM (Dart Code Metrics) for advanced analysis
// pubspec.yaml
dev_dependencies:
  dart_code_metrics: ^5.7.0

// analysis_options.yaml
dart_code_metrics:
  metrics:
    cyclomatic-complexity: 20        # Max complexity per method
    number-of-parameters: 5          # Max params per function
    maximum-nesting-level: 5         # Max nesting depth
    lines-of-code: 100              # Max lines per method
    source-lines-of-code: 50        # Max SLOC per method
  
  rules:
    - avoid-nested-conditional-expressions
    - avoid-returning-widgets
    - no-boolean-literal-compare
    - no-empty-block
    - prefer-conditional-expressions
    - prefer-trailing-comma
```

> **Interview Tip**: `flutter analyze` runs the Dart analyzer with lint rules. In a CI pipeline, always use `--fatal-infos` so even info-level hints break the build. `dart fix --apply` can auto-migrate deprecated APIs. Pre-commit hooks prevent bad code from ever reaching the repo. The `very_good_analysis` package from Very Good Ventures provides the strictest community-maintained lint ruleset.

---

## 7. App Distribution

### Google Play Store Deployment

```
┌────────────────────────────────────────────────────────┐
│          Google Play Release Pipeline                   │
│                                                         │
│  1. Build AAB                                           │
│     flutter build appbundle --flavor prod               │
│                                                         │
│  2. Upload to Play Console                              │
│     ├── Internal Testing (immediate)                    │
│     ├── Closed Testing (invite-only)                    │
│     ├── Open Testing (public beta)                      │
│     └── Production                                      │
│           ├── Full rollout (100%)                        │
│           └── Staged rollout (1% → 5% → 25% → 100%)    │
│                                                         │
│  3. Review Process                                      │
│     ├── First submission: 3-7 days                      │
│     └── Updates: usually < 24 hours                     │
│                                                         │
│  Play Console Requirements:                             │
│     ├── App Bundle (.aab) — APK not accepted            │
│     ├── Target SDK: latest stable                       │
│     ├── Privacy Policy URL                              │
│     ├── Data Safety form                                │
│     ├── Store listing (screenshots, description)        │
│     └── Content rating questionnaire                    │
└────────────────────────────────────────────────────────┘
```

### Apple App Store Deployment

```
┌────────────────────────────────────────────────────────┐
│          App Store Release Pipeline                     │
│                                                         │
│  1. Build IPA                                           │
│     flutter build ipa --flavor prod                     │
│                                                         │
│  2. Upload via Xcode / Transporter / Fastlane           │
│     └── Appears in App Store Connect                    │
│                                                         │
│  3. TestFlight (optional, recommended)                  │
│     ├── Internal testers: up to 100, no review          │
│     ├── External testers: up to 10,000, needs review    │
│     └── Builds expire after 90 days                     │
│                                                         │
│  4. App Review                                          │
│     ├── First submission: 1-3 days                      │
│     ├── Updates: usually < 24 hours                     │
│     └── Rejections → fix → resubmit                     │
│                                                         │
│  App Store Connect Requirements:                        │
│     ├── .ipa signed with Distribution certificate       │
│     ├── App Icon (1024×1024, no alpha)                   │
│     ├── Screenshots for each supported device size      │
│     ├── Privacy Policy URL                              │
│     ├── App Privacy details (nutrition labels)          │
│     └── Minimum deployment target                       │
└────────────────────────────────────────────────────────┘
```

### Firebase App Distribution

```dart
// For internal/beta testing — much faster than store review
```

```bash
# Install Firebase CLI
npm install -g firebase-tools
firebase login

# Distribute Android APK
firebase appdistribution:distribute \
  build/app/outputs/flutter-apk/app-staging-release.apk \
  --app 1:123456789:android:abcdef \
  --groups "qa-team,designers" \
  --release-notes "Bug fixes and performance improvements"

# Distribute iOS IPA
firebase appdistribution:distribute \
  build/ios/ipa/MyApp.ipa \
  --app 1:123456789:ios:abcdef \
  --groups "qa-team" \
  --release-notes-file release_notes.txt
```

```yaml
# Firebase App Distribution in GitHub Actions
- name: Distribute to Firebase
  uses: wzieba/Firebase-Distribution-Github-Action@v1
  with:
    appId: ${{ secrets.FIREBASE_APP_ID }}
    serviceCredentialsFileContent: ${{ secrets.FIREBASE_CREDENTIALS }}
    groups: qa-team
    file: build/app/outputs/flutter-apk/app-staging-release.apk
    releaseNotes: |
      Build #${{ github.run_number }}
      Branch: ${{ github.ref_name }}
      Commit: ${{ github.sha }}
```

### Over-the-Air Updates with Shorebird

```bash
# Shorebird — push Dart code updates without store review
# (Only Dart code, not native code or assets)

# Install Shorebird
curl --proto '=https' --tlsv1.2 https://raw.githubusercontent.com/shorebirdtech/install/main/install.sh -sSf | bash

# Initialize in your project
shorebird init

# Create a release (baseline build)
shorebird release android --flavor prod -t lib/main_prod.dart
shorebird release ios --flavor prod -t lib/main_prod.dart

# Push a patch (OTA update — no store review needed!)
shorebird patch android --flavor prod -t lib/main_prod.dart
shorebird patch ios --flavor prod -t lib/main_prod.dart
```

```dart
// Check for updates in-app (optional — updates apply on next restart)
import 'package:shorebird_code_push/shorebird_code_push.dart';

class UpdateChecker {
  final _codePush = ShorebirdCodePush();

  Future<void> checkForUpdate() async {
    final isUpdateAvailable =
        await _codePush.isNewPatchAvailableForDownload();

    if (isUpdateAvailable) {
      // Download the patch
      await _codePush.downloadUpdateIfAvailable();
      // Notify user to restart, or schedule for next cold start
      _showUpdateSnackBar();
    }
  }

  Future<int?> currentPatchNumber() async {
    return await _codePush.currentPatchNumber();
  }
}
```

> **Interview Tip**: Shorebird patches only Dart code — you cannot change native code, assets, or plugin versions via OTA. Apple's guidelines allow OTA for interpreted code as long as it doesn't change the app's primary purpose. Firebase App Distribution is for pre-release testing (replaces TestFlight for faster iteration), not for production distribution. Know the difference between Firebase App Distribution (testing) and Shorebird (production OTA patches).

---

## 8. Versioning Strategy

### Semantic Versioning

```
┌──────────────────────────────────────────────────────────┐
│            Version Format: MAJOR.MINOR.PATCH+BUILD       │
│                                                           │
│  Example: 2.5.3+47                                        │
│                                                           │
│     2     →  MAJOR: Breaking changes, major rewrites      │
│     5     →  MINOR: New features, backward compatible     │
│     3     →  PATCH: Bug fixes, minor improvements         │
│    +47    →  BUILD: Auto-incremented by CI                │
│                                                           │
│  Android:                                                 │
│     versionName = "2.5.3"                                 │
│     versionCode = 47         (must always increase)       │
│                                                           │
│  iOS:                                                     │
│     CFBundleShortVersionString = "2.5.3"                  │
│     CFBundleVersion = "47"   (must always increase)       │
└──────────────────────────────────────────────────────────┘
```

```yaml
# pubspec.yaml
name: my_app
description: My Flutter application
version: 2.5.3+47
#         ^^^^^
#   versionName / CFBundleShortVersionString
#              ^^
#   versionCode / CFBundleVersion (build number)
```

```dart
// Reading version at runtime
import 'package:package_info_plus/package_info_plus.dart';

class AppVersion {
  static late final PackageInfo _packageInfo;

  static Future<void> init() async {
    _packageInfo = await PackageInfo.fromPlatform();
  }

  static String get version => _packageInfo.version;       // "2.5.3"
  static String get buildNumber => _packageInfo.buildNumber; // "47"
  static String get fullVersion => '$version+$buildNumber'; // "2.5.3+47"
  static String get appName => _packageInfo.appName;
  static String get packageName => _packageInfo.packageName;
}

// Usage in settings/about screen
ListTile(
  title: const Text('App Version'),
  subtitle: Text('v${AppVersion.fullVersion}'),
)
```

### Automated Versioning in CI

```bash
# Override version at build time (CI usually manages build number)
flutter build appbundle \
  --build-name=2.5.3 \
  --build-number=$GITHUB_RUN_NUMBER

# Git-tag based versioning
VERSION=$(git describe --tags --abbrev=0)  # e.g., v2.5.3
BUILD=$(git rev-list --count HEAD)          # e.g., 347
flutter build appbundle \
  --build-name=${VERSION#v} \
  --build-number=$BUILD
```

```yaml
# Automated version bumping with cider
# Install: dart pub global activate cider

# Bump patch: 2.5.3 → 2.5.4
# cider bump patch

# Bump minor: 2.5.3 → 2.6.0
# cider bump minor

# Bump major: 2.5.3 → 3.0.0
# cider bump major

# Set specific version
# cider version 2.5.4+48
```

```dart
// Version-aware API headers
class ApiClient {
  final Dio _dio;

  ApiClient(this._dio) {
    _dio.options.headers.addAll({
      'X-App-Version': AppVersion.version,
      'X-Build-Number': AppVersion.buildNumber,
      'X-Platform': Platform.isIOS ? 'ios' : 'android',
    });
  }
}

// Force update check
class ForceUpdateService {
  Future<bool> shouldForceUpdate() async {
    final minimumVersion = await _fetchMinimumVersion();
    final currentVersion = Version.parse(AppVersion.version);

    // If current version is less than the minimum, force update
    return currentVersion < minimumVersion;
  }

  void showForceUpdateDialog(BuildContext context) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        title: const Text('Update Required'),
        content: const Text(
          'A new version is available. Please update to continue.',
        ),
        actions: [
          TextButton(
            onPressed: () => _openStore(),
            child: const Text('Update Now'),
          ),
        ],
      ),
    );
  }
}
```

> **Interview Tip**: The build number (versionCode on Android, CFBundleVersion on iOS) must strictly increase with every store submission — you cannot upload a build with a lower or equal build number. A common CI strategy is to use `GITHUB_RUN_NUMBER` or `CI_PIPELINE_IID` as the build number so it auto-increments. The version name (2.5.3) is what users see; the build number (47) is what the store uses to determine newer builds. `package_info_plus` is the standard way to read version info at runtime.

---

## 9. Quick Revision Table

| Topic | Key Concept | Command / Code |
|-------|------------|---------------|
| **Debug mode** | JIT, hot reload, asserts on | `flutter run` / `kDebugMode` |
| **Profile mode** | AOT, real perf, limited DevTools | `flutter run --profile` / `kProfileMode` |
| **Release mode** | AOT, no asserts, tree-shaken | `flutter build --release` / `kReleaseMode` |
| **Android flavor** | `productFlavors` in build.gradle | `flutter run --flavor dev` |
| **iOS flavor** | Xcode Schemes + Configurations | `flutter run --flavor dev` |
| **Dart define** | Compile-time constant injection | `--dart-define=KEY=VALUE` |
| **Dart define file** | Bulk env vars from JSON | `--dart-define-from-file=config.json` |
| **Read dart-define** | Access injected constants | `String.fromEnvironment('KEY')` |
| **Separate entry points** | Per-flavor main files | `-t lib/main_dev.dart` |
| **Android signing** | keystore + key.properties | `signingConfigs { release {...} }` |
| **iOS signing** | Cert + Provisioning Profile | Fastlane Match / Xcode auto-signing |
| **Build APK** | Universal or split-per-ABI | `flutter build apk --split-per-abi` |
| **Build AAB** | Required for Play Store | `flutter build appbundle` |
| **Build IPA** | For App Store / TestFlight | `flutter build ipa` |
| **Build Web** | Static site output | `flutter build web --web-renderer canvaskit` |
| **Obfuscation** | Rename symbols for security | `--obfuscate --split-debug-info=dir` |
| **flutter analyze** | Static analysis + lint rules | `flutter analyze --fatal-infos` |
| **dart fix** | Auto-fix deprecated APIs | `dart fix --apply` |
| **dart format** | Enforce code formatting | `dart format --set-exit-if-changed .` |
| **analysis_options** | Custom lint rules | `include: package:flutter_lints/flutter.yaml` |
| **Pre-commit hooks** | Run checks before commit | Lefthook / Husky |
| **GitHub Actions** | Cloud CI/CD for Flutter | `.github/workflows/flutter_ci.yml` |
| **Codemagic** | Flutter-optimized CI/CD | `codemagic.yaml` |
| **Fastlane** | iOS/Android build automation | `Fastfile` with lanes |
| **Firebase Distribution** | Pre-release beta testing | `firebase appdistribution:distribute` |
| **Shorebird** | OTA Dart code patches | `shorebird patch android` |
| **Semantic versioning** | MAJOR.MINOR.PATCH+BUILD | `version: 2.5.3+47` in pubspec.yaml |
| **Read version** | Runtime version info | `PackageInfo.fromPlatform()` |
| **Play Store tracks** | internal → closed → open → prod | Staged rollout recommended |
| **TestFlight** | iOS beta distribution | Upload via Xcode / Fastlane |
| **Force update** | Block old app versions | Compare version against server minimum |

---

## Common Interview Questions

**Q: What is the difference between `--dart-define` and flavors?**

Flavors change native-level configuration (app ID, icon, name, Firebase config, signing). `--dart-define` injects compile-time Dart constants (API URLs, feature flags). Use both together: flavors for platform identity, `--dart-define` for Dart-layer configuration. Values from `String.fromEnvironment` are compile-time constants eligible for tree-shaking.

**Q: Why use App Bundle (.aab) instead of APK?**

Google Play requires AAB for new apps. AAB lets Google Play generate optimized APKs per device (right ABI, right screen density, right language). This reduces download size by 15-30% on average. You can still build APKs for internal distribution or sideloading.

**Q: How would you set up CI/CD for a Flutter project from scratch?**

1. Add `analysis_options.yaml` with strict rules.
2. Set up pre-commit hooks (Lefthook) for formatting and analysis.
3. Configure GitHub Actions with stages: analyze → test → build → deploy.
4. Store signing keys in CI secrets (base64-encoded keystore, key.properties values).
5. Use Fastlane Match for iOS signing in CI.
6. Deploy to internal/TestFlight tracks on `main` pushes, promote to production on version tags.
7. Upload debug symbols to Crashlytics/Sentry for symbolicated crash reports.

**Q: How does Shorebird OTA work and what are its limitations?**

Shorebird patches the Dart AOT snapshot. On app restart, it checks for and applies the latest patch. Limitations: only Dart code changes (not native code, assets, pubspec changes, or plugin additions). Apple allows this because it falls under their interpreted-code exception. Patches are rollbackable from the Shorebird console.

**Q: How do you handle different Firebase projects per flavor?**

Place the flavor-specific `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) in flavor-specific directories: `android/app/src/dev/google-services.json`, `android/app/src/prod/google-services.json`. The Gradle plugin and Xcode build phases automatically pick the right file based on the active flavor/scheme.
