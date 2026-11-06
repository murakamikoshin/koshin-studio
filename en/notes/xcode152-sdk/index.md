# Firebase 12 does not work with Xcode 15.2 (Swift 6.0 required): why I pinned Firebase 11.4.0 and AdMob 11.5.0

> On an old Mac stuck on Xcode 15.2, newer Firebase and AdMob SDKs fail to build. Which versions break, which I pinned (Firebase 11.4.0, AdMob 11.5.0), and why.

- URL: https://koshinstudio.com/en/notes/xcode152-sdk/
- Original (Japanese): https://koshinstudio.com/notes/xcode152-sdk/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/xcode152-sdk/)

Development log of Torecadash / October 2026

  I build my iOS app, Torecadash, on a 2017 Mac with Xcode 15.2. In this environment, newer versions of the Firebase iOS SDK and the AdMob (Google Mobile Ads) SDK do not build. This is which version breaks and which version I pinned, written from my hand-over notes (July 2026).

  The version numbers are as of July 2026. The situation may be different with the latest versions today.

## The environment

- Mac: MacBook Pro 13-inch (2017). macOS tops out at Ventura (13.7.8) and cannot go higher.

- Xcode: 15.2, the latest that runs on Ventura. It officially supports up to iOS 17.2.

- My iPhone runs iOS 26, so I cannot install onto the device from the local Xcode with a cable. The only way to test on the device is to build with Xcode Cloud and distribute through TestFlight.

- Locally I only check that xcodebuild compiles. SwiftUI previews almost never render on this Mac.

## Firebase: pinned to 11.4.0

  The newer the Firebase iOS SDK, the newer the Xcode it requires. My notes recorded this:

    Firebase version | What happens

    12.0.0 and later | Requires a Swift 6.0 toolchain (Xcode 16.2 or later)

    11.12.0 and later | Also requires Xcode 16.2

    11.5.0 onward | A bug in FirebaseDataEncoder.swift (Firebase issue #15029)

    11.4.0 | Confirmed to work reliably

  So I set the Swift Package Manager rule to Exact Version 11.4.0. Xcode keeps suggesting the latest version, and I do not follow it.

  One point is easy to get confused about. Xcode Cloud (the cloud build) runs the latest Xcode, but the pinned setting is kept as it is, so cloud builds succeed without trouble. If you pin to suit the old local Xcode, the same version also builds on the newer Xcode in the cloud.

## AdMob: pinned to 11.5.0

  For the same reason, I pinned the AdMob SDK (swift-package-manager-google-mobile-ads) to 11.5.0 (July 22, 2026).

- 11.6.0 and later: The SDK depends on Apple's MarketplaceKit, which requires Xcode 15.3 or later. On Xcode 15.2 the build fails at link time with Undefined symbols errors related to MarketplaceKit.

- A caveat for 11.5.0: This version does not yet have the new Swift-style class names (BannerView, RewardedAd, and so on). You have to use the old names with the GAD prefix (GADBannerView, GADRewardedAd, GADRequest, GADMobileAds, GADFullScreenContentDelegate, and so on).

  When I upgrade Xcode and raise the version later, I will need to rewrite the class names, not only change the version number. I left that in my notes.

## What I would tell someone in the same situation

- Pin with “Exact Version.” With an “up to next” rule, Xcode picks a newer version you cannot use.

- Write down “from which version it breaks,” with version numbers. A few months later, when you have forgotten why you pinned, the reason is still there.

- The limits of your local environment can be relaxed in the cloud. You can keep testing on a real device through Xcode Cloud and TestFlight even with an old Mac. (The free tier has a monthly limit, though. See builds not arriving in TestFlight (https://koshinstudio.com/notes/torecadash-ci/), in Japanese.)

## What I have not verified

  The version numbers in this article come from my July 2026 notes. I have not checked what the Xcode 15.2 constraints look like with versions released since. The “breaks from this version” boundaries are the build results at that time.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/xcode152-sdk/).

  More in English

- All English pages (https://koshinstudio.com/en/)
