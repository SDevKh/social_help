# SocialFuse Android Play Store App

This is a separate Android Trusted Web Activity wrapper for the hosted SocialFuse web app at:

`https://social-fuse.app`

The Django web app remains the source of truth. The Play Store app launches the hosted site in a verified, app-like Chrome container.

## Build

1. Open this folder in Android Studio:
   `social_help/social_help/mobile/android-twa`
2. Let Android Studio sync Gradle.
3. Generate a signed app bundle:
   `Build > Generate Signed Bundle / APK > Android App Bundle`
4. Upload the generated `.aab` to Google Play Console.

## Important Before Production

After creating your upload key or enabling Play App Signing, get the SHA-256 certificate fingerprint and set these environment variables on Render:

```text
ANDROID_TWA_PACKAGE_NAME=app.socialfuse.twa
ANDROID_CERT_SHA256=YOUR:SHA256:FINGERPRINT:HERE
```

Then confirm this URL returns your package and SHA-256:

`https://social-fuse.app/.well-known/assetlinks.json`

Without that Digital Asset Links match, Android may open the site with a browser bar instead of full-screen TWA mode.

## Store Listing Checklist

- App name: SocialFuse
- Short description: AI Instagram comment moderation for creators and brands.
- Privacy policy URL: `https://social-fuse.app/privacy-policy/`
- Website: `https://social-fuse.app/`
- Support/contact: `https://social-fuse.app/contact/`
- Package name: `app.socialfuse.twa`
- Release format: Android App Bundle `.aab`

You still need final Play Store graphics: a 512x512 app icon, feature graphic, screenshots, content rating, data safety form, and tester/release track setup.
