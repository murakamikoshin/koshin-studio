# Moving from Cloud Functions to a ¥4,300 server: ¥3,700 a day, Yahoo! failing in the EEA, and five traps

> After the free trial, Cloud Functions cost about ¥3,700 a day because waiting time was billed. I moved almost unchanged code to a Singapore VPS (about ¥4,300 a month). Helsinki failed because Yahoo! blocks the EEA; there were 15 secrets, not 5.

- URL: https://koshinstudio.com/en/notes/vps-migration/
- Original (Japanese): https://koshinstudio.com/notes/vps-migration/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/vps-migration/)

Development log of the Toreca Dash app / August 2026

  The back end of my iPhone app Toreca Dash originally ran on Google Cloud Functions (billed per function for the time it runs). When the free trial ended on 16 August 2026, from 17 August it cost about ¥3,700 a day (about ¥106,000 a month).

  This article records how I moved that code almost unchanged to a server (VPS) at about ¥4,300 a month: what I decided, what I corrected later, and the traps.

  Numbers come from my work log of 20 August 2026. I do not include server addresses or connection details.

## Why move: waiting time was billed too

  About 97% of the Cloud Functions bill was CPU time (vCPU seconds). But nearly all of my functions just wait for scraping targets and AI replies, and that waiting was billed in full.

  On a flat-rate server that structural waste disappears.

  I also considered Cloudflare Workers. The Firestore admin SDK does not run there and hundreds of places would need rewriting to another API, so I dropped it. On a VPS the current code runs as is.

## What I chose, and where I first got it wrong

    Item | Details

      Provider | Hetzner Cloud

      Spec | 2 vCPU, 4 GB memory, 80 GB SSD

      Location | Singapore

      Price | €26.99 a month (about ¥4,300)

  I first built it in Helsinki (€5.99 a month). Then I rebuilt it.

  The reason: Yahoo! Shopping’s API blocks access from the EEA and the UK. Calling it from Helsinki returned not the API response but a notice page, “For customers in the European Economic Area and the UK”, with HTTP 403. All 15 genres failed. It is a legal geo-block, not bot detection, so retrying never helps. From Singapore it returns HTTP 200 normally.

  I deleted the Helsinki server; it had cost €0.02 (about ¥3).

  Hetzner’s pricing gives a €7 a month discount only in three European locations. The cheapest line (CX) is sold only in Europe. So “cheap location = EEA = Yahoo! dies”. Do not go back to Europe for the price.

  Singapore also helped by being closer to Japanese sites: the Pokémon card new-arrival check went from 52.7 seconds to 15.8 seconds (3.3× faster).

## Run the code unchanged: intercept require

  I wrote a runner (runner.js). The original code (index.js) is not changed at all.

  Instead of copying 132 schedules by hand, I intercept require and replace firebase-functions with my own, making the calls that register schedules just add to a list. Then I load the original code, and all definitions are collected automatically. The counts collected:

  132 scheduled jobs / 256 HTTP endpoints / 9 Firestore triggers
  Not copying by hand was right. One schedule is written as the template string `every ${X_CHECK_INTERVAL_MINUTES} minutes`. Copying by eye would have got it wrong. I matched all 132 mechanically and confirmed they agree.

  The 9 Firestore triggers (functions that fire when data changes) do not fire on the VPS. I left them on Cloud Functions (they are event-driven and cost almost nothing). The 256 HTTP endpoints stay there too, because the app and admin page call them.

## Five traps I hit in the move

### 1. There were 15 secrets, not 5

  My earlier notes said “5 secrets”. Counting every environment variable in the code gave 15. The missing 10 included Rakuten, Google Maps, Yahoo!, X authentication, the billing integration, a membership-site session and a debug secret.

  A missed secret does not raise an error; it quietly returns 0 results. Extract the variable names from the code mechanically and count them.

### 2. A secret value contained newlines

  The membership-site session secret is in a “one line per site” format, so the value itself contains newlines. Written naively into an env file, line two onwards becomes separate variables and 3 of 4 sites quietly die. I made the env-file reader understand escaped newlines (\n).

### 3. A write-blocked rehearsal looped forever

  Rakuten’s and Yahoo!’s APIs need a spacing between calls (rate limiting). The code writes “last call time” to Firestore and waits until it advances. In a rehearsal where all writes were swallowed, the time never advanced and the loop never ended. (Cloud Functions was also updating it every 1.5 seconds, so “someone else updated it, wait again” repeated forever. A Rakuten Ichiba job not returning for over 15 minutes revealed it.) In rehearsal I let just that rate-limit record through.

### 4. “Writes on, notifications off” silently deletes notifications

  The job that sends notifications in batches deletes the pending list once it counts them as sent. Stubbing only the sending while allowing writes would delete without sending, losing notifications. So during the rehearsal stage I did not register seven notification-related schedules on the VPS. They are removed from the skip list only when notifications are turned on.

### 5. A new exit IP quietly stops one scraper

  A supermarket site was fetched with a plain request and had no fallback. From Japan it was 200, from Singapore 403. I compared all 75 hosts from both Japan and Singapore: 6 are “visible from Japan, not from Singapore”; 5 of those already went through the scraping service or had a fallback and were fine. Only one broke. “403 from Singapore” alone is not proof of breakage. Check whether it goes through the scraping service.

## The order of the move: not to send notifications twice

- Stage 1: read only (no writes, no notifications) and compare fetch counts with Cloud Functions.

- Stage 2: write, but leave notifications to Cloud Functions.

- Stage 3: delete only the 132 scheduled functions from Cloud Functions.

- Stage 4: turn notifications on in the VPS.

  Always keep exactly one side sending notifications. If both send at once, users get the same notification twice.

## What I learned

> A service billed by time does not suit code that mostly waits.

- Look at the billing unit. If waiting is billed, scraping and AI calls are expensive.

- Hosting has legal limits. The cheap place may be a place you cannot use.

- Look for a way to move without rewriting. Interception and mechanical matching avoided hand-copy errors.

- Count settings by machine. 15, not 5.

- Move in stages to avoid duplicate notifications.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/vps-migration/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
