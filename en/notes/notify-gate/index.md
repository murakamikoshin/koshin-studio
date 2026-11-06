# Notifications cannot be recalled: 19% of the last 72 hours’ notifications were wrong, and the gate worked after the fact

> Of 644 notifications in 72 hours, 122 (19%) were wrong. The article gate hides articles later, but a notification goes out about 0.6 seconds after saving; 25 of 30 hidden articles had already been pushed. I put the same gate at the notification entrance.

- URL: https://koshinstudio.com/en/notes/notify-gate/
- Original (Japanese): https://koshinstudio.com/notes/notify-gate/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/notify-gate/)

Development log of the Toreca Dash app / September 2026

  My iPhone app Toreca Dash collects trading-card lottery information and sends a push notification when something new appears. Collected articles pass a gate (filter) that checks “is this a lottery you can really apply to?”: it keeps out winner announcements, buy-back notices, non-card products and so on.

  But a check on 20 September 2026 showed that about one notification in five went out for an article the gate should have rejected. The gate existed; the notifications were not stopped by it.

  Written from my work log of the 20 September 2026 re-check.

## I counted every notification of the last 72 hours

  The method is simple: take every article notified in the last 72 hours and judge again whether it should have been.

    Notified | Wrong | Share

    644 | 122 | 19%

    Reason | Count

      Winner-only notice (cannot apply) | 30

      Old post (days old, notified as if new) | 27

      Expired | 11

      No way to apply | 14

      Not a card product | 10

      Lottery with entry conditions | 8

      Other | 22

## The gate decided “show it?” after the fact

  The article gate also worked by hiding articles later. But a notification is sent about 0.6 seconds after the article is saved. Hiding later does not recall it.

  Of 30 articles the gate hid afterwards, 25 had already been pushed. They disappeared from the screen, but a notification on a phone cannot be taken back.

## A second cause: catch-up made old posts look new

  X monitoring had been down for a while. From 12:44 on 19 September a catch-up ran, and posts from 13 to 18 September were notified as new, 367 at once.

  Importing posts made during the outage is right. But if you judge “new” by when I found it rather than the post date, week-old posts look like fresh news.

## The fix: run the same gate at the sender

  Adding gates that act at save time was not enough. A notification cannot be taken back, so I made the notification function’s entrance run the same judgement as the article gate.

- New judgements go into the pre-save gate (screenArticleBeforeSave); the notification entrance goes through the same function, so the two cannot disagree.

- Old posts are judged by post date, not save date.

- After a catch-up or restart, always check the breakdown of skipped notifications.

## What I learned

> Stop what cannot be taken back before it goes out.

- Put the gate before the exit that cannot be undone. A screen can be lowered later; a notification cannot.

- Use the same judgement at save time and at the exit. Adding it to one leaves a path around it.

- “New” means the post date. Not the day you found it.

- Count everything. Only judging all 644 notifications one by one showed 19%.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/notify-gate/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
