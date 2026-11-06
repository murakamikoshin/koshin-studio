# Firebase Auth: force-quitting the app created anonymous accounts in bulk (waiting for currentUser to restore)

> Force-quitting the app made Firebase create a new anonymous account each launch: 17 of 19 users were throwaway. Cause: reading currentUser too early.

- URL: https://koshinstudio.com/en/notes/apple-signin/
- Original (Japanese): https://koshinstudio.com/notes/apple-signin/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/apple-signin/)

Development log of Torecadash / October 2026

  In my iOS app, Torecadash, a user reported: “once I kill the app, it asks me to sign in with Apple again.” When I looked, 17 of the 19 users were anonymous accounts that had been created and thrown away. The cause was how I checked, with a single line, right after launch. This is from my hand-over notes and the commit record (August 14, 2026).

## The symptom

  It only happened when the app was fully quit by swiping it away and then launched again. Leaving to the home screen and coming back did not trigger it.

## Looking at the real data

  I opened the Authentication user list in the Firebase console:

    Users | Count

    Total | 19

    Signed in with Apple | 2

    Throwaway anonymous accounts (created and last signed in on the same day) | 17

  Ten of the 17 were from August 13 alone. A new anonymous account was being created every time the app started again.

## Cause: reading something that had not been restored yet, synchronously

  Right after launch, the app checked Auth.auth().currentUser on the spot. If nobody was signed in, it created a new anonymous account.

  But as Firebase’s own documentation says, currentUser is not guaranteed to be restored from the Keychain yet right after launch. If restoration is late, it looks as if nobody is signed in. Then, just before the existing Apple sign-in state is restored, the app creates a new anonymous account. It is a race condition.

  The race only happens on a cold start. When the app returns from the background, Firebase is not initialized again, so it does not happen. That matches the report exactly.

## The fix

- Stop checking synchronously. The moment restoration is known to be finished is the first call of the state listener (addStateDidChangeListener). I made the decision only at that point.

- Add one safety net. At launch, the account-management side (AccountStore) now compares against the real server-side state with reload(), corrects any mismatch with its local record, and leaves a diagnostic log.

## One more thing I found

  During the investigation I learned that Sign in with Apple had never succeeded on a real device since I implemented it on August 7.

- The first error was that the sign-in provider configuration could not be found. The Apple provider had never been enabled in the Firebase console.

- After I enabled it, a new error said the credential was already linked. An attempt made before enabling had actually gone halfway through, and the Apple ID was already linked to this device’s anonymous account. The app showed this as an error, but in effect the user was signed in. I changed it to treat it as success.

## What I have not verified

  This is an iOS-side change, so I cannot confirm the effect on a real device until it reaches TestFlight. My notes say the top priority is to check that the Apple link survives repeated force-quits and relaunches. There is no result in the record at the time of writing.

## What I learned

> The state right after launch is not settled yet.

- “Not restored yet” is different from “none.” If you decide “none” without waiting, you create a new one.

- Symptoms show up in real data. Opening the console showed 17 throwaway accounts. I would have had a hard time finding this by reproducing “the sign-in disappears” on my own device.

- “Never succeeded” shows up as a missing success record. The clue was that none of the registered accounts had any Apple information.

  This article summarizes my hand-over notes and the commit record (August 14, 2026).

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/apple-signin/).

  More in English

- All English pages (https://koshinstudio.com/en/)
