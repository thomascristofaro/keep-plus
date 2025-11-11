# Keep+ Android App - Quick Start

## ✅ What's Been Done

1. **Capacitor Installed** - Your React app can now run as a native Android app
2. **Android Project Created** - Native Android code in `/android` folder
3. **Build Scripts Added** - New npm commands for mobile builds
4. **Share Intent Configured** - Your app can receive shared content from other apps
5. **Testing Guide Created** - See `CAPACITOR_TESTING.md` for full details

## 🚀 How to Test on Android

### Prerequisites First!
**You MUST have Android Studio installed** before running these commands.
Download: https://developer.android.com/studio

### Option 1: Quick Command (Recommended)
```powershell
npm run android
```
This will:
1. Build your React app for mobile
2. Sync assets to the Android project  
3. Open Android Studio (if installed)
4. Then click the green "Run" button in Android Studio

**Note:** If you see "Unable to launch Android Studio", install it first or manually open Android Studio and navigate to the `android` folder in your project.

### Option 2: Manual Steps (if npm run android fails)
```powershell
# 1. Build for mobile
$env:CAPACITOR="true"; npm run build

# 2. Sync to Android
npx cap sync android

# 3. Open Android Studio
npx cap open android

# 4. Click Run in Android Studio
```

## 📱 Testing Share Functionality

1. Install Keep+ on your Android device/emulator
2. Open any app (Chrome, Instagram, Notes, etc.)
3. Share content (text, URL, image link)
4. Select "Keep Plus" from the share menu
5. Keep+ will open with the shared content pre-filled in the modal

## 💡 What You Need

- **Android Studio** - https://developer.android.com/studio
- **Android device** with USB debugging OR
- **Android emulator** (AVD) in Android Studio

## 🔄 Making Changes

After editing your React code:
```powershell
npm run android
```
This rebuilds everything and reopens Android Studio.

## 📚 More Details

See `CAPACITOR_TESTING.md` for:
- Detailed setup instructions
- Debugging tips
- Building APK files for distribution
- iOS setup (if you have a Mac)
- Common issues and solutions
