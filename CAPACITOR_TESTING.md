# Capacitor Testing Guide for Keep+

## Overview
Keep+ is now configured to run as a native Android app using Capacitor. This allows you to:
- Run the app on Android devices/emulators
- Receive shared content from other apps (share intent)
- Access native device features

## Prerequisites

### For Android Testing
1. **Android Studio** - Download from https://developer.android.com/studio
2. **Java Development Kit (JDK)** - Version 17 or later
3. **Android SDK** - Installed via Android Studio
4. **Android device or emulator** - Physical device or Android Virtual Device (AVD)

## Building the App

### 1. Build for Android
```powershell
# Build the web app with Capacitor mode
$env:CAPACITOR="true"; npm run build

# Sync assets to Android project
npx cap sync android

# Open in Android Studio
npx cap open android
```

Or use the shortcut:
```powershell
npm run android
```

### 2. Run on Device/Emulator
Once Android Studio opens:
1. Wait for Gradle sync to complete
2. Connect an Android device (with USB debugging enabled) OR start an AVD emulator
3. Click the green "Run" button (▶️) or press Shift+F10
4. Select your device/emulator from the list
5. Wait for the app to build and install

## Testing Share Intent

### Test receiving shared content:
1. Install and run Keep+ on your Android device/emulator
2. Open another app (e.g., Chrome, Instagram, Notes)
3. Find content you want to share (text, URL, etc.)
4. Tap the Share button
5. Select "Keep Plus" from the share menu
6. The Keep+ modal should open with the shared content pre-filled

### What gets shared:
- **Title**: Shared page title (if available)
- **URL**: Shared link
- **Text**: Selected text or note content

## Development Workflow

### Making changes:
1. Edit your React/TypeScript code in `src/`
2. Rebuild and sync:
   ```powershell
   $env:CAPACITOR="true"; npm run build
   npx cap sync android
   ```
3. Android Studio will detect changes and prompt to rebuild
4. Run the app again to test

### Live Reload (optional):
For faster development, you can use Capacitor's live reload:
1. Start the Vite dev server: `npm run dev`
2. Update `capacitor.config.ts` to add your local IP:
   ```typescript
   server: {
     url: 'http://192.168.1.XXX:5173', // Replace with your IP
     cleartext: true
   }
   ```
3. Rebuild: `npx cap sync android`
4. Run the app - it will load from your dev server

## Testing on iOS (if you have a Mac)

### Prerequisites:
- macOS computer
- Xcode 14 or later
- Apple Developer account (for device testing)

### Build for iOS:
```bash
# Add iOS platform (one-time)
npx cap add ios

# Build and open in Xcode
npm run ios
```

## Debugging

### Android Logcat:
View logs in Android Studio:
1. Open the "Logcat" tab at the bottom
2. Filter by package name: `com.keepplus.app`
3. Look for JavaScript console.log output

### Chrome DevTools (Android):
1. Connect device via USB
2. Open Chrome on your computer
3. Go to `chrome://inspect`
4. Find your device and click "inspect"
5. Use DevTools to debug the WebView

### Common Issues:

**"Gradle sync failed"**
- Open Android Studio settings
- Go to Build, Execution, Deployment > Build Tools > Gradle
- Set Gradle JDK to version 17 or later

**"App crashes on startup"**
- Check Android Logcat for errors
- Ensure you ran `npx cap sync android` after building

**"Changes not appearing"**
- Clear app data: Settings > Apps > Keep Plus > Storage > Clear Data
- Rebuild: `npm run build:mobile && npx cap sync android`

## Building APK for Distribution

### Debug APK (for testing):
```powershell
cd android
.\gradlew assembleDebug
```
APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK (for production):
1. Generate a keystore (one-time):
   ```powershell
   keytool -genkey -v -keystore keep-plus.keystore -alias keep-plus -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Update `android/app/build.gradle` with signing config

3. Build release:
   ```powershell
   cd android
   .\gradlew assembleRelease
   ```

## Project Structure

```
keep-plus/
├── src/                    # React/TypeScript source
├── dist/                   # Built web assets (gitignored)
├── android/                # Android native project
│   ├── app/
│   │   └── src/main/
│   │       ├── assets/     # Web assets copied here
│   │       ├── java/       # Native Android code
│   │       └── AndroidManifest.xml
│   └── build.gradle
├── capacitor.config.ts     # Capacitor configuration
└── vite.config.ts          # Vite build config
```

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [Capacitor Share Plugin](https://capacitorjs.com/docs/apis/share)
