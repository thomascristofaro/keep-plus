# Building APK Without Android Studio

## Quick Answer
**Yes!** You can build the APK using Gradle command line tools without opening Android Studio.

## Prerequisites

1. **Java Development Kit (JDK) 17 or later**
   - Download: https://adoptium.net/ (OpenJDK)
   - Install and verify: `java -version`

2. **Android SDK Command Line Tools**
   - Option A: Install Android Studio once (easier, includes everything)
   - Option B: Install standalone SDK tools (more complex)

## Method 1: Using Android Studio's Gradle (Easiest)

Even if you don't want to use the IDE, installing Android Studio once gives you all the tools:

1. **Install Android Studio** (one-time setup)
2. **Build APK without opening IDE:**

```powershell
# Build the web app for mobile
cross-env CAPACITOR=true npm run build

# Sync to Android
npx cap sync android

# Build debug APK using Gradle
cd android
.\gradlew assembleDebug

# APK location:
# android\app\build\outputs\apk\debug\app-debug.apk
```

3. **Install on your phone:**
   - Connect phone via USB with USB debugging enabled
   - Run: `.\gradlew installDebug`
   - OR copy `app-debug.apk` to your phone and install manually

## Method 2: Build Commands Only

### Debug APK (for testing):
```powershell
# Build web app
cross-env CAPACITOR=true npm run build

# Sync to Android
npx cap sync android

# Navigate to Android folder
cd android

# Build debug APK
.\gradlew assembleDebug
```

**Output:** `android\app\build\outputs\apk\debug\app-debug.apk`

### Release APK (for distribution):

1. **Create a signing key (one-time):**
```powershell
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. **Configure signing in `android\app\build.gradle`:**
Add before the `android` block:
```gradle
def keystorePropertiesFile = rootProject.file("keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}
```

Add inside `android` block:
```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

3. **Create `android\keystore.properties`:**
```properties
storeFile=../my-release-key.keystore
storePassword=your_store_password
keyAlias=my-key-alias
keyPassword=your_key_password
```

4. **Build release APK:**
```powershell
cd android
.\gradlew assembleRelease
```

**Output:** `android\app\build\outputs\apk\release\app-release.apk`

## Quick Build Script

Add to `package.json`:
```json
"scripts": {
  "build:apk": "cross-env CAPACITOR=true npm run build && npx cap sync android && cd android && .\\gradlew assembleDebug",
  "install:phone": "cd android && .\\gradlew installDebug"
}
```

Then just run:
```powershell
npm run build:apk
```

APK will be in: `android\app\build\outputs\apk\debug\app-debug.apk`

## Installing on Your Phone

### Method 1: Via USB
```powershell
cd android
.\gradlew installDebug
```

### Method 2: Manual Install
1. Copy `app-debug.apk` to your phone
2. Open file manager on phone
3. Tap the APK file
4. Allow installation from unknown sources if prompted
5. Install

## Common Issues

**"ANDROID_HOME not set"**
- Set environment variable:
  ```powershell
  $env:ANDROID_HOME = "C:\Users\YourName\AppData\Local\Android\Sdk"
  ```

**"Gradle not found"**
- Make sure you're in the `android` folder
- Or use: `android\gradlew.bat` from root

**"Java version error"**
- Install JDK 17 or later
- Update `JAVA_HOME` environment variable

## Summary

**Answer to your questions:**

1. **Should you push the `android` folder?**
   - **YES, push it to Git** (but ignore build artifacts)
   - The `.gitignore` has been updated to ignore:
     - `android/app/build/` (compiled files)
     - `android/.gradle/` (Gradle cache)
     - `android/app/src/main/assets/public/` (copied web assets)
   - Push the rest (native code, configs, manifests)

2. **Can you build APK without Android Studio?**
   - **YES!** Use `.\gradlew assembleDebug` in the `android` folder
   - You still need JDK and Android SDK (easiest to get via Android Studio installation)
   - No need to open the IDE, just use command line

**Simplest workflow:**
```powershell
# Build and create APK
cross-env CAPACITOR=true npm run build
npx cap sync android
cd android
.\gradlew assembleDebug

# APK is ready at: android\app\build\outputs\apk\debug\app-debug.apk
# Copy to your phone and install!
```
