# Four things that stopped my iOS app before App Review: iPad screenshots, ITMS-91064, account deletion, reporting posts

> Before submitting an iOS app, four things stopped me: iPad screenshots, ITMS-91064, account deletion (5.1.1(v)) and user-content reporting (1.2), and how I fixed each.

- URL: https://koshinstudio.com/en/notes/torecadash-review/
- Original (Japanese): https://koshinstudio.com/notes/torecadash-review/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/torecadash-review/)

Development log of Torecadash / October 2026

  When I tried to submit my iOS app Torecadash to App Review, I was stopped before submitting several times: things caught by Apple’s automated checks, things caught on the submission screen, and things I found by checking against the guidelines. From my commit record, here are four.

  The result of review is not included in this article.

## 1. I was asked for iPad screenshots

  When I tried to submit for review in App Store Connect, it stopped me with “You must upload a screenshot for 13-inch iPad displays.” The project settings had been iPhone and iPad (1,2) from the beginning.

  But there was no sign that I had built it with iPad in mind. Device checks and layout adjustments were all on iPhone. Submitting it unverified as “iPad supported” was a risk, so I changed it to iPhone only (1).

## 2. “Invalid Binary” in the automated check (ITMS-91064)

  Build 877 was rejected by Apple’s automated review as an “invalid binary.” The cause was in the privacy manifest (PrivacyInfo.xcprivacy): I had written that it tracks (NSPrivacyTracking=true), but the list of tracking domains (NSPrivacyTrackingDomains) was empty. Apple’s check rejects this combination as a contradiction.

  The app shows AdMob ads (banner, native, app-open) personalized after ATT consent. It does track, so “true” was correct. What needed fixing was the empty domain list. But Google does not publish an official list of domains for AdMob. So I added widely used ad-serving domains (googlesyndication.com, googleadservices.com, doubleclick.net, google.com). I confirmed that a Release build passes.

## 3. Account deletion (Guideline 5.1.1(v))

  An app that lets you create an account must let you delete it from within the app. The deletion also removes the user’s map posts (sighting reports) and their related data (owner, reports, flags, thanks). For people signed in with Apple, the app re-authenticates with Apple, then deletes on the server and revokes the token. I also matched the explanation in the settings screen and the privacy policy to the real behavior.

  In addition, deleting the account does not cancel a subscription. I added this to the settings text and to the deletion confirmation screen (as a review requirement).

## 4. User-generated posts (Guideline 1.2)

  Map posts can be written freely by users. Until then there were only format checks such as length and coordinate range, and nothing that rejected by content. So I added a simple banned-word check to three free-text fields (shop name, product name, note). If it matches, the post is created but starts in a pending-review state.

  One more thing. Reports of posts would go unnoticed unless I myself remembered the admin screen’s URL and opened it. I added the count of items pending review to my daily operations notice so they are not overlooked.

## What I learned

> Review is not something you fail after submitting; half of it is found by checking before you submit.

- Of the four, two (iPad, ITMS-91064) were stopped by a machine. The other two (deletion, posts) I found by reading the guidelines and checking myself.

- “Do not submit what is unverified” was faster and safer than “support everything” (the iPad case).

  This article is written from my commit record (September 16 to October 6, 2026).

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/torecadash-review/).

  More in English

- All English pages (https://koshinstudio.com/en/)
