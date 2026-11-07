# Where App Store review stopped me: “Guideline 2.1 Information Needed” on the first submission, and four rejections

> Records of an indie iOS app stuck in App Store review: the six items asked for in Guideline 2.1 Information Needed on the first submission, and four rejections including iPad screenshots.

- URL: https://koshinstudio.com/en/notes/app-store-review/
- Original (Japanese): https://koshinstudio.com/notes/app-store-review/
- Published: 2026-11-07
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/app-store-review/)

Development log of Toreca Dash / 2 records in one place

  The first time you submit an app to the App Store, review stops you a few times. These are two records of where Toreca Dash actually got stuck: being asked for more information rather than rejected, and the four rejections after that.

  Each section was first published as a separate record (from 2026-10). Numbers and sources are as in the work logs of the time. They were gathered into one article per theme on 7 November 2026.

## App Store review sent “Guideline 2.1 Information Needed”: the six things Apple asked for

  Record from 2026-10-08.

I submitted my iOS app, Torecadash, to App Review for the first time on October 6 (4:24 a.m. Pacific time). What came back was not a rejection but an email saying “additional information is needed.” This is a summary of what Apple asked for.

  I do not write the review result in this article. I will add it once there is one.

### What arrived

  It was Guideline 2.1 “Information Needed — New App Submissions.” The reason given was that this developer account has little review history. Apple wanted more information so it could understand the app well enough to finish the review. It was not a finding that the app is defective.

### The six things requested

  I was asked to reply in App Store Connect and also to put the same content in the “App Review Information” notes field. The six items (summarized):

- A screen recording on a physical device. On a device with the latest OS, starting from launching the app, show the normal flow of use. If there are account registration, login and deletion, user-generated content (including the report and block mechanisms), or paid features, include those too.

- The purpose of the app and its intended users. What problem it solves and what value it provides.

- How to start using the main features. If login is required, the credentials or sample files.

- A list of the external services used. Data providers, authentication, payments, AI, and so on.

- Differences in features or content by region. If there are none, say that it works the same in every region.

- Proof of rights if the app deals with a highly regulated field or third-party protected material.

  The email also included a list of common problems: bugs and crashes on a real device, a demo account if login is required, screenshots that show actual use, submitting in-app purchase products together with the app, and so on.

### How it connects to what I fixed before

  The first item mentions account deletion and reporting user-generated content. These overlap with what I had fixed before submitting (https://koshinstudio.com/notes/app-store-review/#s2) (Japanese). Account deletion removed map posts too and revoked the Sign in with Apple token. Posts had a banned-word check and a report-review queue. I had also already drafted the review notes: the main features work without login, where deletion is, reporting of posts, and what Pro includes.

  So the mechanisms existed, but I lacked something to show them. The screen recording in item 1 is exactly that.

### What I learned

> In a first review, you have to show the reviewer that it works.

- The recording on a physical device is explicitly required to start from launching the app.

- Put the same content in the notes field as in the reply. You can reuse it for the next submission.

- Before submitting, check that you can answer the six questions yourself. If the answers come quickly, you save one round trip with review.

  This article summarizes the email I received. It does not include the submission ID or other identifiers.

## Four things that stopped my iOS app before App Review: iPad screenshots, ITMS-91064, account deletion, reporting posts

  Record from 2026-10-08.

When I tried to submit my iOS app Torecadash to App Review, I was stopped before submitting several times: things caught by Apple’s automated checks, things caught on the submission screen, and things I found by checking against the guidelines. From my commit record, here are four.

  The result of review is not included in this article.

### 1. I was asked for iPad screenshots

  When I tried to submit for review in App Store Connect, it stopped me with “You must upload a screenshot for 13-inch iPad displays.” The project settings had been iPhone and iPad (1,2) from the beginning.

  But there was no sign that I had built it with iPad in mind. Device checks and layout adjustments were all on iPhone. Submitting it unverified as “iPad supported” was a risk, so I changed it to iPhone only (1).

### 2. “Invalid Binary” in the automated check (ITMS-91064)

  Build 877 was rejected by Apple’s automated review as an “invalid binary.” The cause was in the privacy manifest (PrivacyInfo.xcprivacy): I had written that it tracks (NSPrivacyTracking=true), but the list of tracking domains (NSPrivacyTrackingDomains) was empty. Apple’s check rejects this combination as a contradiction.

  The app shows AdMob ads (banner, native, app-open) personalized after ATT consent. It does track, so “true” was correct. What needed fixing was the empty domain list. But Google does not publish an official list of domains for AdMob. So I added widely used ad-serving domains (googlesyndication.com, googleadservices.com, doubleclick.net, google.com). I confirmed that a Release build passes.

### 3. Account deletion (Guideline 5.1.1(v))

  An app that lets you create an account must let you delete it from within the app. The deletion also removes the user’s map posts (sighting reports) and their related data (owner, reports, flags, thanks). For people signed in with Apple, the app re-authenticates with Apple, then deletes on the server and revokes the token. I also matched the explanation in the settings screen and the privacy policy to the real behavior.

  In addition, deleting the account does not cancel a subscription. I added this to the settings text and to the deletion confirmation screen (as a review requirement).

### 4. User-generated posts (Guideline 1.2)

  Map posts can be written freely by users. Until then there were only format checks such as length and coordinate range, and nothing that rejected by content. So I added a simple banned-word check to three free-text fields (shop name, product name, note). If it matches, the post is created but starts in a pending-review state.

  One more thing. Reports of posts would go unnoticed unless I myself remembered the admin screen’s URL and opened it. I added the count of items pending review to my daily operations notice so they are not overlooked.

### What I learned

> Review is not something you fail after submitting; half of it is found by checking before you submit.

- Of the four, two (iPad, ITMS-91064) were stopped by a machine. The other two (deletion, posts) I found by reading the guidelines and checking myself.

- “Do not submit what is unverified” was faster and safer than “support everything” (the iPad case).

  This article is written from my commit record (September 16 to October 6, 2026).

## Key points of each

- App Store review sent “Guideline 2.1 Information Needed”: My first App Store submission got a request for more information (Guideline 2.1), not a rejection. The six things Apple asked for and how they connect to earlier fixes.

- Four things that stopped my iOS app before App Review: Before submitting an iOS app, four things stopped me: iPad screenshots, ITMS-91064, account deletion (5.1.1(v)) and user-content reporting (1.2), and how I fixed each.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/app-store-review/).

  More development logs, by theme: Notes (https://koshinstudio.com/en/notes/). About the app: Toreca Dash (https://koshinstudio.com/en/works/torecadash/).
