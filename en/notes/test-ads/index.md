# With no ads, 25 real-device checks were blocked: test ads in developer mode only, and no hard-coded prize names

> Before ads were served, 25 of 163 real-device checklist items could not be verified. In developer mode only, the app switches to Google’s test ad units. Prize names are read from one setting and never hard-coded, including in the checklist.

- URL: https://koshinstudio.com/en/notes/test-ads/
- Original (Japanese): https://koshinstudio.com/notes/test-ads/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/test-ads/)

Development log of the Toreca Dash app / September 2026

  My app Toreca Dash has a daily lottery (omikuji) feature. “Watch a video to try” starts the draw animation after a video ad.

  On 11 September 2026, reviewing the real-device checklist revealed a problem: because ads were not being served yet, 25 of the 163 checklist items could not be verified.

  Numbers come from my work log of 11 September 2026.

## Without an ad, you cannot check what follows

  Before review and before serving starts, my own ad slot has no inventory. The omikuji’s “Watch a video to try” stays at “Preparing an ad…” and cannot be pressed. Everything after it (the draw, the animation, the prize applying, entering a delivery address) cannot be verified. 25 of the 163 items (15%) of the real-device checklist were blocked.

## Use test ads only in developer mode

  I use the test ad units Google publishes. Test ads always have inventory. Switching to them only in developer mode lets me verify through to the end on the same path as production.

     | Production | Developer mode

      Banner | My ad unit | Google’s test unit

      Rewarded (video) | My ad unit | Google’s test unit

      Native | My ad unit | Google’s test unit

      App open | My ad unit | Google’s test unit

  Developer mode is enabled only by “tap the version 7 times” and “only on the same device ID”. Users never see it. Ad rules say test ads are for your own device only; this satisfies that.

## Never hard-code prize names anywhere

  Another, similar story. After I changed the omikuji prizes, I was told “some text is still the old one”. I will keep changing prizes, each time.

  Looking into it, the display side was correct:

- The prize list, the terms and the result card all read one and the same setting (lotteryConfig/publicStatus).

- The process that changes prizes writes both “current” and “public” in the same transaction, so they cannot drift.

- Temporarily unlocking Pro features is decided by a separate field (perk), not the prize name.

  What was stale was two places with prize names hard-coded:

- Three items of the real-device checklist (shown in the app), written like “Medium luck says ‘ads hidden for 24 hours’”.

- The fallback text used when the setting has not arrived.

  I rewrote the checklist to not name prizes (“the prize names currently set in the admin page appear as they are”), and the fallback to “Prizes are being prepared”. I added an item “right after changing prizes, the prize list, terms and result card all show the new prizes” (164 items). Since I change prizes every time, I put “where to look each time” into one item.

  I did keep an old wording in the server’s “defaults when no setting exists”, because wording and effect are paired (hidden-ads text and the ad-free unlock). Neutralising only one side would make “unlocked but no explanation”.

## What I learned

> Make a way to verify what you cannot verify; do not hard-code what changes.

- For things that come from outside, such as ads, provide a test path. Relying on production inventory leaves what follows unchecked.

- Keep the test path for developers only. Guard it with 7 taps and the device ID.

- Do not hard-code wording that changes every time. Read from one setting; write in one transaction.

- Do not fix only one half of a pair. Fix wording and effect together.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/test-ads/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
