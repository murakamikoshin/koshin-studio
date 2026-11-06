# ITMS-91064 “Invalid Binary”: NSPrivacyTracking was true but NSPrivacyTrackingDomains was empty

> An iOS build was rejected by Apple's automated review with ITMS-91064. NSPrivacyTracking was true while NSPrivacyTrackingDomains was an empty array. How it was fixed, and what was not verified.

- URL: https://koshinstudio.com/en/notes/itms-91064/
- Original (Japanese): https://koshinstudio.com/notes/itms-91064/
- Published: 2026-10-08
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/itms-91064/)

Development log of Torecadash / October 2026

  I uploaded my iOS app, Torecadash, and Apple's automated review rejected build 877 as an “Invalid Binary”. The error code was ITMS-91064. The cause was a combination of two entries in the privacy manifest (PrivacyInfo.xcprivacy). This is what happened and how I fixed it, written from my commit history.

## What happened

  Build 877 was rejected as an “Invalid Binary” by Apple's automated review (October 6, 2026). In other words, it was stopped by a machine check, before any human reviewer saw it.

## The cause: tracking declared, but the domain list was empty

  The privacy manifest had these two entries:

    Key | Value

    NSPrivacyTracking (whether the app tracks) | true

    NSPrivacyTrackingDomains (domains used for tracking) | an empty array

  Apple's check rejects this combination as a contradiction: the app declares that it tracks, but lists no domain at all.

  Should I have just set NSPrivacyTracking to false? No. The app shows AdMob ads (banner, native and app-open) and personalizes them for users who agreed to ATT (App Tracking Transparency). The app really does track, so true is the correct declaration. The thing to fix was the empty domain list.

## The fix: list the domains

  However, Google does not publish an official list of tracking domains for AdMob. So I added widely used ad-serving domains:

- googlesyndication.com

- googleadservices.com

- doubleclick.net

- google.com

  I confirmed that the Release configuration builds (xcodebuild reported BUILD SUCCEEDED).

## What I have not verified

  The commit only records that the build succeeds. At the time of writing, I have no record of whether Apple accepted the fixed build. I also could not check whether the domains above cover every domain AdMob uses for tracking, because there is no official list.

## What I learned

> A declaration and its contents can be cross-checked by a machine.

- If you declare that you do it, write the contents (the domains) too. One without the other is rejected as a contradiction.

- When rejected, don't escape by deleting the declaration. If the app really does it, keep the declaration true and fill in the contents.

- When there is no official list, write down how far you verified.

  This article was written from the commit record (October 6, 2026). It is the English version of the original Japanese article (https://koshinstudio.com/notes/itms-91064/).

  More in English

- All English pages (https://koshinstudio.com/en/)
