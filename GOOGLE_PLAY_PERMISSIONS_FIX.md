# Google Play Photo and Video Permissions Policy Fix

## Issue
Google Play rejected the app due to violation of the Photo and Video Permissions policy. The app was requesting `READ_MEDIA_IMAGES` and `READ_MEDIA_VIDEO` permissions, which are only allowed for apps with persistent media access as a core feature.

## Solution
Configured the app to use the Android Photo Picker instead of requesting broad media permissions.

## Changes Made

### 1. Updated `app.json`
Modified the `expo-image-picker` plugin configuration:
- Set `photosPermission` to `false` to prevent requesting legacy media permissions
- Added `androidPhotoPickerAvailable: true` to enable the Android Photo Picker
- Kept `cameraPermission` for video recording functionality (allowed use case)

**Before:**
```json
[
  "expo-image-picker",
  {
    "photosPermission": "The app needs access to your photos to let you select videos for testimonies.",
    "cameraPermission": "The app needs access to your camera to record videos for testimonies."
  }
]
```

**After:**
```json
[
  "expo-image-picker",
  {
    "photosPermission": false,
    "cameraPermission": "The app needs access to your camera to record videos for testimonies.",
    "androidPhotoPickerAvailable": true
  }
]
```

## How It Works
- The Android Photo Picker provides a system UI for selecting media files
- Users can select videos without granting broad storage permissions
- The app receives temporary access only to the selected files
- This complies with Google Play's one-time access policy

## Next Steps

1. **Rebuild the app:**
   ```bash
   eas build --platform android --profile production
   ```

2. **Test the video picker:**
   - Open the app and navigate to "Submit Testimony"
   - Tap "Upload Video"
   - Verify the Android Photo Picker appears (system UI, not app UI)
   - Select a video and ensure it uploads correctly

3. **Submit to Google Play:**
   - Upload the new APK/AAB to Google Play Console
   - Submit for review
   - The app should now comply with the Photo and Video Permissions policy

## Important Notes
- The Android Photo Picker is available on Android 11+ (API 30+)
- For older Android versions, the app will fall back to the legacy picker with minimal permissions
- Camera permission is still requested (for recording videos), which is an allowed use case
- No code changes were needed in `submit-testimony.js` - the existing `ImagePicker.launchImageLibraryAsync()` call will automatically use the photo picker
