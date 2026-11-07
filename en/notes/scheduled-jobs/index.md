# Nine things that happened running scheduled jobs and a server: timeouts, time budgets, re-runs on deploy and a VPS migration

> Nine records from the jobs that run hourly and daily, and the server under them: moving from Cloud Functions to a VPS, a timeout fixed three times, checks that never ran, re-runs on every deploy, and secrets in logs.

- URL: https://koshinstudio.com/en/notes/scheduled-jobs/
- Original (Japanese): https://koshinstudio.com/notes/scheduled-jobs/
- Published: 2026-11-07
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/scheduled-jobs/)

Development log of Toreca Dash / 9 records in one place

  Behind Toreca Dash, hundreds of jobs run hourly and daily. It is a place full of bugs nobody notices: jobs that stopped, and jobs that run far too often. These are nine things that happened with scheduled jobs and server operations, and how they were fixed, in the order they happened.

  Each section was first published as a separate record (from 2026-10). Numbers and sources are as in the work logs of the time. They were gathered into one article per theme on 7 November 2026.

## Moving from Cloud Functions to a ¥4,300 server: ¥3,700 a day, Yahoo! failing in the EEA, and five traps

  Record from 2026-10-17.

The back end of my iPhone app Toreca Dash originally ran on Google Cloud Functions (billed per function for the time it runs). When the free trial ended on 16 August 2026, from 17 August it cost about ¥3,700 a day (about ¥106,000 a month).

  This article records how I moved that code almost unchanged to a server (VPS) at about ¥4,300 a month: what I decided, what I corrected later, and the traps.

  Numbers come from my work log of 20 August 2026. I do not include server addresses or connection details.

### Why move: waiting time was billed too

  About 97% of the Cloud Functions bill was CPU time (vCPU seconds). But nearly all of my functions just wait for scraping targets and AI replies, and that waiting was billed in full.

  On a flat-rate server that structural waste disappears.

  I also considered Cloudflare Workers. The Firestore admin SDK does not run there and hundreds of places would need rewriting to another API, so I dropped it. On a VPS the current code runs as is.

### What I chose, and where I first got it wrong

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

### Run the code unchanged: intercept require

  I wrote a runner (runner.js). The original code (index.js) is not changed at all.

  Instead of copying 132 schedules by hand, I intercept require and replace firebase-functions with my own, making the calls that register schedules just add to a list. Then I load the original code, and all definitions are collected automatically. The counts collected:

  132 scheduled jobs / 256 HTTP endpoints / 9 Firestore triggers
  Not copying by hand was right. One schedule is written as the template string `every ${X_CHECK_INTERVAL_MINUTES} minutes`. Copying by eye would have got it wrong. I matched all 132 mechanically and confirmed they agree.

  The 9 Firestore triggers (functions that fire when data changes) do not fire on the VPS. I left them on Cloud Functions (they are event-driven and cost almost nothing). The 256 HTTP endpoints stay there too, because the app and admin page call them.

### Five traps I hit in the move

  1. There were 15 secrets, not 5
  My earlier notes said “5 secrets”. Counting every environment variable in the code gave 15. The missing 10 included Rakuten, Google Maps, Yahoo!, X authentication, the billing integration, a membership-site session and a debug secret.

  A missed secret does not raise an error; it quietly returns 0 results. Extract the variable names from the code mechanically and count them.

  2. A secret value contained newlines
  The membership-site session secret is in a “one line per site” format, so the value itself contains newlines. Written naively into an env file, line two onwards becomes separate variables and 3 of 4 sites quietly die. I made the env-file reader understand escaped newlines (\n).

  3. A write-blocked rehearsal looped forever
  Rakuten’s and Yahoo!’s APIs need a spacing between calls (rate limiting). The code writes “last call time” to Firestore and waits until it advances. In a rehearsal where all writes were swallowed, the time never advanced and the loop never ended. (Cloud Functions was also updating it every 1.5 seconds, so “someone else updated it, wait again” repeated forever. A Rakuten Ichiba job not returning for over 15 minutes revealed it.) In rehearsal I let just that rate-limit record through.

  4. “Writes on, notifications off” silently deletes notifications
  The job that sends notifications in batches deletes the pending list once it counts them as sent. Stubbing only the sending while allowing writes would delete without sending, losing notifications. So during the rehearsal stage I did not register seven notification-related schedules on the VPS. They are removed from the skip list only when notifications are turned on.

  5. A new exit IP quietly stops one scraper
  A supermarket site was fetched with a plain request and had no fallback. From Japan it was 200, from Singapore 403. I compared all 75 hosts from both Japan and Singapore: 6 are “visible from Japan, not from Singapore”; 5 of those already went through the scraping service or had a fallback and were fine. Only one broke. “403 from Singapore” alone is not proof of breakage. Check whether it goes through the scraping service.

### The order of the move: not to send notifications twice

- Stage 1: read only (no writes, no notifications) and compare fetch counts with Cloud Functions.

- Stage 2: write, but leave notifications to Cloud Functions.

- Stage 3: delete only the 132 scheduled functions from Cloud Functions.

- Stage 4: turn notifications on in the VPS.

  Always keep exactly one side sending notifications. If both send at once, users get the same notification twice.

### What I learned

> A service billed by time does not suit code that mostly waits.

- Look at the billing unit. If waiting is billed, scraping and AI calls are expensive.

- Hosting has legal limits. The cheap place may be a place you cannot use.

- Look for a way to move without rewriting. Interception and mechanical matching avoided hand-copy errors.

- Count settings by machine. 15, not 5.

- Move in stages to avoid duplicate notifications.

## A secret token was in the logs in plain text: scrub at the one exit that cannot be forgotten

  Record from 2026-10-17.

While checking the logs behind my app Toreca Dash, I found that an external service’s secret (an API token) was written in plain text. It was 24 August 2026.

  It had been a to-do I had marked “no deadline, optional”. Looking at the server’s real logs, it really had leaked. This article records the cause and the fix: scrub at a place that cannot be forgotten.

  Written from my work log of 24 August 2026. No real value is included.

### A real token was in the log

  The server log had lines like this (the token part was real):

  WARN [recheck] fetch via the scraping service failed [https://…]:
request to https://api.scrape.do/?token=<the real token>&url=… failed, reason: read ETIMEDOUT
  The cause: the error message of the HTTP library (node-fetch) includes the request URL as is. The token= in the URL carries the secret.

### I had “fixed” the same thing before

  On 19 August the same thing had happened with Rakuten API credentials. I wrote a function to scrub secrets from log strings (redactSecretsForLog). But it only works where it is called explicitly. There are over 50 places that call the scraping service, and I had forgotten some.

### The fix: scrub at the single exit every log goes through

  So that I would not repeat the same fix, I did two things:

- Scrub at the log exit (fmt()). Every server log goes through it, so it cannot be forgotten. It scrubs URL query values such as token, api_key, secret, applicationId, accessKey, affiliateId and setCookies, and also the raw form of the X-monitoring login cookies.

- Rebuild the error in the function that calls the scraping service. Before returning it to callers, re-create the error with the scrubbed text. That function is also used on the event-driven side (Cloud Functions triggers), so this covers that log too.

  I checked four real log strings. I also checked that ordinary log lines do not change (an unrelated = like deadline=2026-08-30 must not be scrubbed).

### What about logs already written?

  Even after the fix, logs already written still hold the real token. They can be read only with administrator rights on the server, so urgency was low, but if it worries you, reissue the token in the service’s dashboard and replace the value in the server’s settings. At the time of this record I had left that as an item awaiting a decision.

### What I learned

> If there are 50 places where you can forget, do it once at a place you cannot forget.

- A countermeasure you must call explicitly leaks when forgotten. Forget one of 50 and it leaks.

- Scrub at the single exit. Put one at the place every log goes through.

- Check you are not scrubbing too much. Test that ordinary logs do not change.

- Things already written do not vanish. Decide whether to reissue.

- Do not trust a third-party library’s error messages. They can include the URL as is.

## I fixed a timeout three times and it did not stop: the culprit was a second process under the same lock

  Record from 2026-10-17.

The job in my app Toreca Dash that rechecks Rakuten Books stock timed out 17 times a day. A timeout means a run does not finish within its limit (480 seconds).

  I fixed it three times, and it did not stop. The real culprit was in a place I had not looked, each time. This is the record of how I tracked it down.

  Written from my work log of 25 August 2026.

### First fix: fetches had no timeout

  The first thing I found was that fetches had no time limit. If an external site never replies, the process waits forever. I added a limit. But the 17 timeouts a day did not stop.

### Second fix: the screening of items that became buyable

  Next I suspected the resale-price screening of items that had become purchasable. It includes calls to an external API, so a path that could hang remained. When screening skips an item, the notification count stays 0, so the symptom does not reveal it.

  I extracted the whole handling of one item into a single function (processOne()) and wrapped it in a Promise.race (take whichever finishes first) with the remaining time as the limit. After deploying, 0 timeouts in 7 minutes, and the log said “checked: 12 (rest next time because time ran out)”, a normal finish.

  The lesson: putting a limit only on “the spot that looks stuck” is not enough. The time budget is only checked at the head of the loop. If any unbounded wait remains inside one item’s processing, the job runs to the hard limit. Put the limit on the whole processing of one item.

  But the timeouts had not stopped.

### Third fix: the culprit was a second process under the same lock

  The reason three fixes did not work: none of the places I limited was the real one.

  The culprit was a second process (runRevalidateRakutenBooksAvailability) running under the same “prevent double runs” lock.

- It re-fetches every Rakuten Books reservation and first-come article and calls the API one by one.

- Rakuten’s API has a 1.5-second interval limit.

- It had no time limit at all.

  However many limits I put on the first process (the stock check), the second ran to 480 seconds. The log shows the first one’s completion message, so it looked like “it finishes normally yet times out”.

  I gave the second process a “remaining time” limit too. It runs every minute anyway, so cutting it short loses nothing. 15 minutes after deploying, 0 timeouts.

### A bonus: a site that erred every time

  Another bug found along the way: a game company’s shop site returned an infinite redirect loop (maximum redirect reached) with a plain fetch, logging an error at every recheck (a dozen or so a day). The scraping service’s “escalation memory” already knew it needed a stronger setting.

  The fix: hosts remembered in the escalation memory go straight through the scraping service without trying a plain fetch. I did not list host names by hand. The memory builds up automatically from real failures, so new sites need no extra work.

### What I learned

> When chasing a timeout, first count everything the function calls.

- One scheduled function can contain two or more processes. Three times I looked only at the first.

- Put the limit on the whole processing of one item. One suspect spot is not enough.

- “Finishes normally yet times out” means suspect another process. The completion message may be the first one’s.

- Log the time of each segment. Next time it will be obvious at once.

- Prefer memory built from real failures to hand-written lists. It works on new sites automatically.

## “Automate everything that can be”: counting showed 66 repair jobs had never run on a schedule, and I added only six

  Record from 2026-10-17.

On my app Toreca Dash the instruction was: “automate everything that can be automated”.

  On 28 August 2026, the first thing I did was count. 66 repair processes had never once been called from a schedule. This article records how I counted, and why I did not put all 66 on a schedule.

  Numbers come from my work log of 28 August 2026.

### Counted: 66 only worked if you hit the URL by hand

  I matched 319 HTTP endpoints against 184 scheduled jobs by function calls, not by name, because something with a different name can still be called from a scheduled job.

  The result: 66 only ran if someone hit the URL by hand. Articles that could be fixed stay broken until a person remembers “time to run that”.

### I did not schedule all 66 at once

  The 66 fell into three groups:

- Needed continuously (needed whenever new data arrives) → put on a schedule.

- One-off migrations (backfill*, reclassify* and so on) → do not schedule. Running them daily is wasted work and only adds room for accidents.

- Destructive or needing human judgement (deleting orphaned products, manual re-linking) → do not schedule.

  A new scheduled job runs once the moment it is deployed. Before adding any, I rehearsed all of them with a dry run (no writes) to see what they would hit.

### The six I added

    Job | Dry-run result

      Fix empty deadlines on X articles | 32 targets, 0 updated

      Fix aggregator-derived store names | 5 (an account’s promotional text had become the seller)

      Fix shipping fees counted in the price | 0

      Fix links to generic products | 0

      Fix titles of split articles | newly built

      Fix aggregator-derived deadlines | newly built

  I spread their start times. Running them together fights for concurrency slots and lengthens the queue. Scheduled jobs went from 184 to 190.

  The remaining candidates (deadline repair, broken product-image repair, Rakuten affiliate-link repair) take over 2 minutes and their dry runs did not finish in time, so I held back. I do not add one without checking it.

### The product catalogue was already fully automatic

  To “can the product catalogue be automated too?” the answer was “it already is”. All 15 genres had an import from the official catalogue, updated an hour earlier. Linking articles to products is automatic: 1,406 of 1,415 measured were linked. The rest were “new sets not yet on the official site”, which come in automatically once the official site lists them.

### The queue kept growing

  Counting also turned up another thing. The queue length was growing 81, 86, 91 within 45 seconds.

  The cause: the function that adds jobs (enqueue) only checked “is it running”, and did not check jobs already waiting in the queue. While the concurrency limit was reached, the time for a “every minute” job kept coming, and the same job piled up many times.

  I made it remember the names of waiting jobs and not add them twice. The queue stayed at 0.

### What I learned

> Automation is not putting everything on a schedule. Count, sort, check, then add.

- Count first. 66 had never been called. Match by calls, not names.

- Sort. Add only what is needed continuously; not one-off migrations or destructive jobs.

- Check with a dry run before adding. A new scheduled job runs the moment it is added.

- Spread the times. Running together lengthens the queue.

- Before queueing, check “is it waiting” too. Checking only “running” lets it pile up.

## “The server went down and I cannot recover it” was wrong: only inbound SSH had been blocked

  Record from 2026-10-17.

My app Toreca Dash’s server became unreachable from 3:10 a.m. on 28 August 2026. I wrote in my notes: “the server went down; I cannot recover it from here”.

  That judgement was wrong. I only learned that when it came back at 10:15. This article is the record of why I was wrong and what the work I did in between produced.

  Written from my work log of 28 August 2026.

### What I saw, and what I concluded

- Ports 22 (SSH), 80 and 443 of the server were all closed.

- A traceroute reached a carrier backbone in Singapore and stopped just past it.

- The hosting provider’s (Hetzner) status page showed no incident for that region.

  From that I concluded: “the server has stopped, and I cannot recover it from here (it needs a restart in the provider’s console)”.

### What was true: the server had been running all along

  When it became reachable at 10:15 and I checked:

    What I checked | Result

      Server processes | had been running all along (uptime 7 days 10 hours)

      Jobs completed | 4,100

      192 scheduled jobs | kept running normally

      What was blocked | only inbound SSH

  The server had not stopped. Only connections from outside (SSH) were blocked. Nothing behind the app had stopped.

### A second mistake: the “pile of repairs” was made by me

  Meanwhile I also noticed “41 hourly repairs have piled up” and blamed that on the server too.

  In fact I had created it: I called an endpoint that does not accept a dry run (a no-write rehearsal), thinking it was a check. What I took as a check ran production work 41 times.

### The alternative route: deploy only what I needed elsewhere

  Because I could not get into the server, I deployed just the checks and repairs I needed to Cloud Functions, individually (firebase deploy --only functions:name). I did not touch any scheduled jobs. Those HTTP endpoints stay after the server comes back and can be used for checks as they are.

  I also noted what to do after recovery: first, send the day’s changes to the server. That day I had added 8 scheduled jobs, so they would run as catch-ups right after deploy. All had been run by hand from dry run through real run, so running them does no harm.

### What I learned

> “Cannot connect” is not “stopped”.

- Do not conclude from one angle. Ports can be closed while the process keeps running.

- Look at other signals. Are notifications arriving, is data being updated, what is the app’s state? Some things are visible from outside.

- Before writing “cannot recover”, write how much you actually know. All I knew was “SSH does not connect”.

- Do not run production while “checking”. An entrance with no dry run cannot be rehearsed.

- Keep an alternative route for when you cannot get in. A place where I could deploy individual functions helped.

## Checks that logged “deferred to next run” had never run: three time budgets counted from the same start

  Record from 2026-10-17.

Behind my app Toreca Dash is a process that checks and fixes articles’ “sale type”. Inside it was a part that ran “25 checks in rotation”.

  On 11 September 2026, after adding a meter that times each stage, I learned that those 25 checks had never run once. The log kept saying “deferred 18 items to the next run for the time budget”. That “18” meant not some of them but all.

  Numbers come from my work log of 11 September 2026.

### Three budgets were counted from the same start time

  The process had three stages, each with a time budget.

    Stage | Budget | Measured

      ① Main loop | 420 s | uses all 425 s

      ② Always-run slot | 780 s (total) | only 360 s really usable; ends at 861 s

      ③ Rotating 25 checks | 700 s (total) | ② overruns 700 s, so 0 checks every time

  The three budgets were counted from the same start time: ① 420 seconds, ② 780 in total, ③ 700 in total. It looks as if each stage has room. But ② can only use 360 seconds of its 780 after ① used 425, and when ② ended (861 seconds), ③’s “700 in total” was long gone. ③ was judged “out of budget” before it started, every time: 0 checks.

  The log’s “deferred 18 items to the next run” meant sending everything to the next run, every time. “Next run” never came.

### The fix: do not widen by feel; allocate from the job’s time limit

  I stopped widening the numbers by feel. Instead I allocate from the job’s own time limit. The limit is written in one place (REPAIR_SALE_TYPES_TIMEOUT_SEC) and each stage’s deadline is that times a ratio.

    Stage | Deadline (share of the limit)

      ① Main | 23%

      ② Always-run slot | 67%

      ③ Rotation | 93%

  The limit became 1,800 seconds. Since each deadline is a share of the whole rather than a continuation of the previous stage, later stages keep their budget even if an earlier stage uses everything.

### Add a meter: which stage was heavy was invisible

  Another cause: I had widened the limit without knowing which of the 12 was heavy. So I log the seconds each step takes. Heaviest first as measured:

    Step | Time

      Attach replacement articles to hidden, already-notified ones | 119 s

      Find the application link from the QR in the announcement image | 102 s

      Fix the unit of the reference price | 48 s

      Copy the reference price | 46 s

      Fix articles with neither a link nor an application method | 41 s

### What I learned

> “Next run” only means something if a next run is certain.

- Counting budgets from the same start starves the later stages. If an earlier one uses it all, the later one has 0.

- Count the “deferred” log lines. If everything is deferred every time, it has never run.

- Allocate from the job’s total limit, not by feel.

- Measure each stage first. Widening limits without knowing what is heavy does not help.

## Before widening concurrency slots: widening a 2-core server from 8 to 14, and the earlier conclusion that was half wrong

  Record from 2026-10-17.

The back end of my app Toreca Dash runs over 200 scheduled jobs on one small server (2 cores, 3.8 GB of memory). The number of jobs that can run at once is capped: the concurrency slots.

  On 7 September 2026, when I shortened some intervals to speed up first-come monitoring, the monitor I most wanted fast was slowed by waiting for a slot. I raised the slots from 8 to 11 and then 14. This is the record of that decision and of what to look at.

  Numbers come from my work log of 7 September 2026.

### 8 slots were not enough

  To speed up first-come monitoring I shortened several intervals. Then the one-minute “instant sell-out monitor” started being skipped, because all 8 slots were full.

     | 8 slots (after shortening) | 11 slots

      Queue length | 17–29 | 0

      Running at once | pinned at 8 | 6 / 11 (room)

      Monitor skips | 6 per 10 min | 1 per 10 min

      Load average | 1.62 | 1.24

      Memory | 1,161 MB | 667 MB

  With 11 slots the queue was 0 and load and memory fell. Most jobs only wait for network replies and use no CPU. The cap was the slots, not the CPU.

  The slot value lives only in a server settings file (runner.env) and never enters git, because the deploy script does not send it. Looking at the repository would not show this change, so I wrote it down and kept a backup of the old value.

### “Only 2 cores, so no more” was half wrong

  Later I added a lane for popular sets and a fastest lane. Concurrency pinned at 11, the queue grew to 15 and the monitor was skipped twice (effective interval 1.0 to 1.4 minutes).

- 2 cores, load 1.66, 83% of them.

- Long Rakuten jobs hold a slot while sleeping on the API’s 1.5-second wait: stock recheck 240 s, marketplace 181 s, new listings 110 s, stock 104 s.

- They use no CPU yet consume slots, the hardest culprit to see.

  At the time I concluded “with 2 cores, widening the slots would just slow everything” and reduced the Rakuten popular lanes.

     | After adding | After reducing

      Concurrency | pinned at 11 | 9–11

      Queue | up to 15 | 0–1

      Monitor skips | 2 per 10 min | 0

      Monitor effective interval | 1.4 min | 1.0 min

      Load | 1.66 | 1.25

  That conclusion turned out half wrong. The Rakuten jobs holding slots are asleep on the API wait and use no CPU. More slots only means “more can sleep at once”, not more CPU contention. I measured again with 11 and 14:

     | 11 slots | 14 slots

      Monitor skips | 1 per 5 min | 0 per 6.7 min

      Effective interval | 1.3 min | 1.0 min

      Load | 1.25 | 1.25 (unchanged)

### The deciding question: CPU-bound or waiting?

- If waiting jobs hold the slots, widen them, after checking load (uptime) does not rise.

- If CPU-bound jobs hold them, widening slows everything.

  Two places to look: the queue length (queued in the health check; if it is always at least 1 there is no spare), and the average run time per job, longest first. If long Rakuten-API jobs top the list, they are the ones sleeping on slots.

  That day I made the same regression four times: Amazon every 5 minutes, Amazon-like store every 5 minutes, batched Rakuten popular lanes, Rakuten popular lanes every 10 minutes. Each time I meant to speed up and instead ate slots and slowed the one I cared about.

### What I learned

> Do not count slots; look at what holds them.

- A job whose run time ≥ its interval occupies a slot. The faster it goes, the more others wait.

- Measure what the limit really is. CPU or slots? Look at load and memory.

- A previous conclusion can be half wrong. “2 cores, so no” did not apply to waiting jobs.

- Record settings that are not in git. A value only on the server is invisible in the repository.

- To speed one thing up, slow another down. Decide what to protect first.

## Four things from a full sweep of 61 audits: 51 jobs clumped at 4 a.m., a lock that expired in 55 seconds, and a price-filling idea I decided not to add

  Record from 2026-10-17.

My app Toreca Dash has 61 audits that find anomalies. In the early hours of 8 September 2026 I ran them all and checked every item that was not 0 against real data, one by one.

  This article is four stories from that work. Three are things I fixed; one is a story where I measured, and deliberately did not add it.

  Numbers come from my work log of the evening of 7 to the morning of 8 September 2026.

### 1. 51 once-a-day jobs were clumped at 4 and 5 a.m.

  At 04:53 the measurements were:

- The 14 concurrency slots were full, 8 waiting.

- 6 jobs timed out at the 540-second limit.

- The “instant sell-out monitor” and the “Amazon fastest lane” I wanted to protect were skipped 9 times each per hour.

  The cause was clumping in time. Counting once-a-day jobs: 27 at 4 o’clock and 24 at 5; at 1 o’clock and from 10 to 21, 0.

  The fix was not to edit times one by one, which would not apply to jobs added later. I fixed the mechanism that spreads start times. The spread was a flat 270 seconds; for jobs with an interval of 6 hours or more it now spreads up to 1,800 seconds (30 minutes). 27 jobs over 30 minutes is about one per 67 seconds, so 3 to 5 run at once.

  I kept it to 30 minutes so it does not spill into the next hour’s slot and break time-based order like “check at 2, fill at 3”.

### 2. A patrol meant to be “every minute” took 181 to 480 seconds per run

  The Rakuten Ichiba patrol was meant to run every minute. Measured, one run took 181 to 480 seconds. The harm was threefold:

- It occupied a concurrency slot almost all the time.

- It timed out at the 480-second limit (4 times in 2 hours) and the results were thrown away.

- It held the Rakuten API allowance (one call per 1.5 seconds, shared by all jobs) the whole time, cutting the share of the instant sell-out monitor.

  The effective interval was 3.5 to 6 minutes. And after a timeout it restarts from the same first genre every time, so later genres never get a turn.

  I switched it to the five-genres-at-a-time rotation proven on Rakuten Books.

     | Before | After

      One run | 181–480 s | 50–83 s

      Timeouts | 4 per 2 hours | 0

      Interval per genre | 3.5–6 min | 3 min

  I found one more thing. The lock that means “if the previous run is still going, do not start” (preventing double runs) expired after only 55 seconds. For jobs with a 480-second limit and 181–480 s real runs, a run that slipped past the runner’s skip (a manual run, a catch-up right after restart) could run twice at once, doubling Rakuten API use and hitting first-come monitoring. I set both to 480,000 ms. A lock’s expiry should be at least the job’s timeout.

### 3. Stop counting anomalies you cannot fix

  If you keep counting things that cannot be fixed, real anomalies get buried. I revisited three.

- “Lottery with no deadline: 77” became 0. Scanning the text of all 89 real cases, only 5 contained a date-like value, and those were not application deadlines (“lottery results 9/5”, “pick up by 9/13”). The store simply did not write one, and nothing can be done. Now only items that have both deadline wording and a date in the text count as anomalies.

- “3 stopped scrapers” became 0. What was counted were state records with no run time, not jobs. The main code excludes them, only the audit did not.

- One store’s “0 items for 173 hours” was normal. Fetching its three categories worked (16 and 6 items), and all were “point-exchange only” (0 yen). There was just no lottery or pre-order at the time.

  But “0 items” has two meanings: (a) no product matches (normal), (b) the page layout changed and nothing can be read (broken). If you cannot tell them apart, real breakage is buried (the previous day’s Pokémon Center (https://koshinstudio.com/en/notes/silent-failures/#s4) was exactly this). So I now put the number scanned into the completion message.

### 4. A case I measured and deliberately did not add

  397 products had unknown official prices, which stops first-come notifications. The filling job had, measured, zero results.

  Official price unset: 397
Has a price at a regular store: 51
Two or more stores agree: 0
  The “two or more stores agree” condition had effectively never been satisfied. Accepting one store would fill 51. All were kinds with no catalogue price (imported Magic cards and so on).

  I still did not add it. Regular stores discount. If I record a discounted price as the official price, the price check’s ceiling (official price × 1.08 plus margin) becomes lower than the real price and legitimate listings are removed as resale. At 10% off, the real price is 1.11× and exceeds the ceiling. And over-deletion draws no complaints, so I would not notice.

  I wrote down what to do first if I add it:

- Compare the 51 prices by eye with official sites and the manufacturer’s suggested price (confirm whether they are discounted; do not guess a factor).

- Mark single-store-based prices and add margin to the ceiling only for that mark.

- After adding, count hidden articles before and after.

### What I learned

> Clumping is invisible until counted. Record the decision not to add, too.

- Count clumping in time. 27 at 4 o’clock, 0 from 10 to 21.

- Jobs hold something you cannot see. A lock’s expiry should be at least the timeout.

- Do not count anomalies you cannot fix. If the number does not fit, doubt how you count.

- Distinguish what “0 items” means. Show the number scanned.

- If you decide not to add something, keep the reason and the conditions. Even when measurement shows a gain, if it risks over-deleting, I do not add it.

## Every deploy re-ran the daily jobs: 477 runs in 48 hours, 46.6% of that day’s Gemini cost

  Record from 2026-10-17.

The back end of my app Toreca Dash runs many scheduled jobs. One of them was supposed to run once a day. Counting the logs for one day, it had run 43 times.

  This article is about the bug that turned up: every deploy (replacing the code and restarting) re-ran the daily jobs from scratch.

  Numbers come from my work log of 1 September 2026.

### 477 catch-up runs in 48 hours

  Jobs are triggered by cron. A restart loses any run scheduled at that moment, so on startup I look for jobs whose last run is too old and catch them up. The rule was “last run older than 1.05 × the interval”.

  Counting 48 hours, there were 477 catch-up runs. A daily job that repairs product links ran 43 times in a day and accounted for 46.6% of that day’s Gemini cost, 1,295 calls. It was pricing the same articles with the AI again and getting nothing new.

### The cause: the “it finished” record was not written

  A job that exceeds its time limit (540 seconds) is recorded as “timed out”. But JavaScript cannot stop a running job, so the job keeps running to the end after “timed out” is recorded.

  The problem was that the “last run time” was written only on success. If the job timed out, even if the body finished, no run time was written. On each restart the logic concluded:

- This job has no (or an old) last-run record.

- It is older than 1.05 × the interval, so it was missed.

- Run it now.

  A daily job re-ran on every restart. A few deploys a day make 43 runs.

### The fix: “recorded a timeout” and “did not run” are different things

  Even if a timeout was recorded, if the body finished, I now record the run as having happened. Only when it failed do I not record it.

  This fix had to come together with lowering the time limit. Lowering the limit alone does not stop the catch-ups if the run time is never recorded.

### The opposite problem: chasing too much, or too little

  The catch-up had the opposite flaw too. On 31 August my deploy landed exactly on 08:00. Cron fires only at that instant, so the 08:00 digest notification was never sent.

  The digest runs five times a day (6, 8, 12, 18, 21 h), an average of 4.8 hours apart, below the 6-hour minimum for catch-up, so it was treated as “wait for the next one”. But for users who chose that time, a whole day’s worth was lost.

  The fix: only for jobs that deliver something to users, check at startup whether the last 55 minutes of schedule were missed, and run once. Until 10 minutes after the scheduled time it waits, since it may just not have run yet.

  Do not extend this to all jobs. When I counted on real data, 33 jobs looked missed on every restart, and most had just been interrupted by it. Chasing them all would waste scraping and API limits. The rule for adding a job: if it misses a run, does something a user was owed disappear?

### What I learned

> “No record” does not always mean “did not run”.

- Write the run record after every outcome. Writing it only on success makes timed-out runs look unrun.

- Catch-up fails both ways. Chase deliveries; for the rest, wait for the next run.

- Count what runs at each deploy. The 477 in 48 hours was invisible until counted.

- Repeating the same work burns money. 46.6% of that day’s cost was calls that produced nothing.

## Key points of each

- Moving from Cloud Functions to a ¥4,300 server: After the free trial, Cloud Functions cost about ¥3,700 a day because waiting time was billed. I moved almost unchanged code to a Singapore VPS (about ¥4,300 a month). Helsinki failed because Yahoo! blocks the EEA; there were 15 secrets, not 5.

- A secret token was in the logs in plain text: An HTTP library put the request URL in its error message, so a scraping-service token reached the logs. My earlier scrubbing function worked only where called, and there are over 50 callers. I moved the scrubbing to the single exit every log passes through.

- I fixed a timeout three times and it did not stop: A Rakuten Books stock check timed out 17 times a day. Limiting fetches, then a whole item, did not help; the third time I found that another process under the same lock re-fetched everything with no time limit.

- “Automate everything that can be”: Matching 319 HTTP endpoints against 184 scheduled jobs by call showed 66 that only ran by hand. After a dry run I scheduled only the continuously needed ones, six, and fixed a queue that let the same job pile up.

- “The server went down and I cannot recover it” was wrong: From 3:10 a.m. I could not connect to the server and judged it stopped. In fact its processes had run for over 7 days, all 192 scheduled jobs were normal, and only inbound SSH was blocked.

- Checks that logged “deferred to next run” had never run: A process had three stages whose time budgets were counted from the same start time, so the rotating 25 checks ran 0 times each run. “Deferred 18 items” meant all of them. I allocated from the job’s time limit and logged each step’s time.

- Before widening concurrency slots: Shortening intervals made the 1-minute first-come monitor wait for a slot. I widened slots from 8 to 11 and 14 and measured. The real cap was not CPU but jobs sleeping on Rakuten API’s 1.5-second wait while holding slots.

- Four things from a full sweep of 61 audits: Once-a-day jobs clumped at 27 at 4 o’clock and 24 at 5; a Rakuten patrol took 181–480 s per run with a 55-second lock; I stopped counting anomalies that cannot be fixed; and I measured a way to fill official prices from one store but did not add it.

- Every deploy re-ran the daily jobs: A once-a-day job ran 43 times and used 46.6% of a day’s Gemini cost. Timed-out runs never wrote their last-run time, so every restart treated them as missed. A deploy at 08:00 also swallowed the digest.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/scheduled-jobs/).

  More development logs, by theme: Notes (https://koshinstudio.com/en/notes/). About the app: Toreca Dash (https://koshinstudio.com/en/works/torecadash/).
