# Comparing iOS ad SDKs and Firebase by their official information: AdMob, AppLovin MAX, LevelPlay and Supabase

> AdMob, AppLovin MAX, LevelPlay, Firebase and Supabase compared by official pages (Oct 2026): payouts, privacy manifests, minimum Xcode, free tiers.

- URL: https://koshinstudio.com/en/notes/ios-sdk-compare/
- Original (Japanese): https://koshinstudio.com/notes/ios-sdk-compare/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/ios-sdk-compare/)

A comparison / October 2026

  For my iOS app Torecadash, I pinned Firebase to 11.4.0 and AdMob to 11.5.0 to suit Xcode 15.2 on an old Mac (that article (https://koshinstudio.com/en/notes/xcode152-sdk/)). The app was also rejected once for ITMS-91064 (that article (https://koshinstudio.com/en/notes/itms-91064/)). Here I line up the surrounding options I could not look into at the time, using official pages only. I have actually used only AdMob and Firebase. I have not used the others.

  This is what I confirmed on October 8, 2026. SDK versions and requirements change quickly. Check the sources before you use them.

## Quick table: look up what you want to know

  The answers first. The numbers and sources are in the sections below.

    What you want to know | What the official pages say

    Which versions work on an old Xcode | AdMob 11.6.0 and later needs Xcode 15.3 or later. Firebase 11.12.0 and later needs Xcode 16.2, and 12.0.0 and later needs Swift 6.0 (official release notes).

    Minimum payout | AdMob: at least $100 in USD (official table). AppLovin: no amount in the official FAQ; payment is for the previous month on the 15th of the next. LevelPlay and Meta: could not confirm.

    I want to use several ad networks | AdMob, AppLovin MAX and LevelPlay have mediation. The AdMob integration guide lists 24 networks.

    I want to keep using Firebase with CocoaPods | Firebase states that in October 2026 it stops publishing new versions to CocoaPods. SPM is recommended.

    I want server-side processing for free | On Firebase Spark, Cloud Functions is not available (Blaze only). On Supabase’s free plan, a project pauses after one week without activity.

  The contents of the table were confirmed on official pages on October 8, 2026. SDK requirements can disagree between pages, so check with your own build as well.

## Ad SDKs: how they work and payments

    SDK | How it works | Minimum payout

    Google AdMob | Has mediation (serving from several ad networks). The iOS integration guide lists 24 networks including AppLovin, ironSource, Meta Audience Network and Unity Ads. | Payments in USD have a minimum of $100 (official table). The value differs by currency.

    AppLovin MAX | A mediation platform. | No specific amount in the official FAQ (you check it on the dashboard). Payment is for the previous month on the 15th of the next (NET15).

    Unity LevelPlay (ironSource) | LevelPlay ads and mediation. Adapters are separate packages. | Could not confirm.

    Meta Audience Network | A standalone ad network. Listed as a mediation target in AdMob. | Could not confirm.

  For Meta Audience Network, I could not confirm either an official announcement of closure or a statement that it continues. Whether you can newly adopt it now cannot be settled from official primary sources.

## iOS privacy requirements

- Apple’s rule (common to all): if NSPrivacyTracking is true, NSPrivacyTrackingDomains needs a list of domains. If the user has not allowed ATT (tracking permission), connections to those domains fail and the app receives an error, according to Apple’s documentation. This matches what happened in the ITMS-91064 article.

- AdMob: asks for ATT before loading ads (SDK 7.64.0 and later). Privacy manifest support is from 11.2.0 (2024-03-14). I could not find an official list of tracking domains on AdMob’s pages (I cannot say it does not exist).

- AppLovin MAX: 12.4.1 and later supports privacy manifests. Each connected network also has a required version (AdMob 11.2.0 or later, Meta 6.15.0 or later, Unity Ads 4.10.0 or later).

- Meta: the Audience Network SDK has an iOS privacy manifest and recommends updating to 6.15.0. The domains are pre-filled and it does not recommend adding them by hand.

- LevelPlay: I could not confirm any description of ATT or privacy manifests on the integration pages I read.

## Minimum Xcode and iOS, and how to install

    SDK | Minimum requirements | Installation

    AdMob | Latest is 13.11.0 (2026-09-29). The release notes say a minimum of Xcode 26.2 (from 13.4.0). But the quick start says “Xcode 16.0 or later” and “iOS 13.0 or later,” so pages disagree. | SPM (recommended), CocoaPods, manual

    Firebase | Latest is 13.0.0 (2026-10-07). Minimum Xcode 26.2, iOS 15.0. Xcode 16.2 is required from 11.12.0, and Swift 6.0 from 12.0.0. | SPM is recommended. It states that in October 2026 it stops publishing new versions to CocoaPods.

    AppLovin MAX | iOS 12.0 or later, Xcode 15 or later (integration page). | CocoaPods, SPM, manual. With SPM, use SPM for the SDK and all adapters (mixing causes version conflicts).

    LevelPlay | The integration page says iOS 12+ and Xcode 15.4+. Another page (for Unity) says iOS 13+ and Xcode 16+ (from a search summary). Pages disagree. | CocoaPods, SPM (9.3.0 or later), manual

  This table also confirms why Torecadash pinned its versions. The official release notes say AdMob 11.6.0 depends on MarketplaceKit and needs Xcode 15.3 or later, and Firebase 11.12.0 and later needs Xcode 16.2. This matched my article.

## Analytics and backend: Firebase and Supabase free tiers

    Service | What the official pages say

    Firebase (Spark) | Firestore: 1 GiB storage, 50,000 reads a day, 20,000 writes a day, 20,000 deletes a day. Authentication: 50,000 monthly active users (phone auth not available). Cloud Functions: not available on Spark (paid Blaze only). Analytics and Cloud Messaging: no numeric limit (free).

    Supabase (free) | 50,000 monthly active users, 500 MB database, 1 GB file storage, 5 GB egress. Up to 2 active projects. Free projects pause after one week without activity.

## What I learned

> In an environment that cannot keep up with the latest version, the “minimum requirements” table matters most.

- SDK requirements can disagree between pages. Both AdMob and LevelPlay had different numbers in the release notes and the setup guides. You have to look at both and confirm with your own build.

- Privacy settings happen outside the SDK. If you set NSPrivacyTracking to true, you also write the domains. That is Apple’s rule, not a difference between SDKs.

- Look at how a free tier stops first. Supabase pauses with no activity. Firebase Spark cannot use Functions.

## What I could not confirm

- Minimum payouts for LevelPlay and Meta Audience Network.

- Meta Audience Network’s availability (closed or continuing), minimum Xcode and iOS, SPM support, and current version.

- AppLovin’s specific minimum payout amount, and the latest MAX SDK version (the release-notes URL would not open).

- An official list of tracking domains for AdMob, within what I could access.

- The FirebaseDataEncoder bug from Firebase 11.5.0 (as my article says, I confirmed it with my own build and could not find an official record).

- The contents of supabase-swift’s privacy manifest.

- Comparisons of accuracy or revenue (I did not do them, because there are no official numbers).

## Sources (all checked on October 8, 2026)

- AdMob: iOS release notes (https://developers.google.com/admob/ios/rel-notes)

- AdMob: iOS quick start (https://developers.google.com/admob/ios/quick-start)

- AdMob: mediation (https://developers.google.com/admob/ios/mediation)

- AdMob: privacy (https://developers.google.com/admob/ios/privacy)

- AdMob: payment thresholds (https://support.google.com/admob/answer/2772208?hl=en)

- Firebase: iOS release notes (https://firebase.google.com/support/release-notes/ios)

- Firebase: installation methods (https://firebase.google.com/docs/ios/installation-methods)

- Firebase: pricing (https://firebase.google.com/pricing)

- AppLovin: integration (iOS) (https://support.applovin.com/en/max/ios/overview/integration)

- AppLovin: privacy manifests (https://support.applovin.com/en/max/ios/overview/privacy-manifests)

- Unity LevelPlay: iOS SDK integration (https://docs.unity.com/en-us/grow/levelplay/sdk/ios/sdk-integration)

- Apple: privacy manifest files (https://developer.apple.com/documentation/bundleresources/privacy-manifest-files)

- Supabase: pricing (https://supabase.com/pricing)

  I read some of the official pages through summaries (the numbers have not been checked against the originals character by character). Please review the original text before relying on them.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/ios-sdk-compare/).

  More in English

- All English pages (https://koshinstudio.com/en/)
