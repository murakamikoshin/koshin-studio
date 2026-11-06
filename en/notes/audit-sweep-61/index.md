# Four things from a full sweep of 61 audits: 51 jobs clumped at 4 a.m., a lock that expired in 55 seconds, and a price-filling idea I decided not to add

> Once-a-day jobs clumped at 27 at 4 o’clock and 24 at 5; a Rakuten patrol took 181–480 s per run with a 55-second lock; I stopped counting anomalies that cannot be fixed; and I measured a way to fill official prices from one store but did not add it.

- URL: https://koshinstudio.com/en/notes/audit-sweep-61/
- Original (Japanese): https://koshinstudio.com/notes/audit-sweep-61/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/audit-sweep-61/)

Development log of the Toreca Dash app / September 2026

  My app Toreca Dash has 61 audits that find anomalies. In the early hours of 8 September 2026 I ran them all and checked every item that was not 0 against real data, one by one.

  This article is four stories from that work. Three are things I fixed; one is a story where I measured, and deliberately did not add it.

  Numbers come from my work log of the evening of 7 to the morning of 8 September 2026.

## 1. 51 once-a-day jobs were clumped at 4 and 5 a.m.

  At 04:53 the measurements were:

- The 14 concurrency slots were full, 8 waiting.

- 6 jobs timed out at the 540-second limit.

- The “instant sell-out monitor” and the “Amazon fastest lane” I wanted to protect were skipped 9 times each per hour.

  The cause was clumping in time. Counting once-a-day jobs: 27 at 4 o’clock and 24 at 5; at 1 o’clock and from 10 to 21, 0.

  The fix was not to edit times one by one, which would not apply to jobs added later. I fixed the mechanism that spreads start times. The spread was a flat 270 seconds; for jobs with an interval of 6 hours or more it now spreads up to 1,800 seconds (30 minutes). 27 jobs over 30 minutes is about one per 67 seconds, so 3 to 5 run at once.

  I kept it to 30 minutes so it does not spill into the next hour’s slot and break time-based order like “check at 2, fill at 3”.

## 2. A patrol meant to be “every minute” took 181 to 480 seconds per run

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

## 3. Stop counting anomalies you cannot fix

  If you keep counting things that cannot be fixed, real anomalies get buried. I revisited three.

- “Lottery with no deadline: 77” became 0. Scanning the text of all 89 real cases, only 5 contained a date-like value, and those were not application deadlines (“lottery results 9/5”, “pick up by 9/13”). The store simply did not write one, and nothing can be done. Now only items that have both deadline wording and a date in the text count as anomalies.

- “3 stopped scrapers” became 0. What was counted were state records with no run time, not jobs. The main code excludes them, only the audit did not.

- One store’s “0 items for 173 hours” was normal. Fetching its three categories worked (16 and 6 items), and all were “point-exchange only” (0 yen). There was just no lottery or pre-order at the time.

  But “0 items” has two meanings: (a) no product matches (normal), (b) the page layout changed and nothing can be read (broken). If you cannot tell them apart, real breakage is buried (the previous day’s Pokémon Center (https://koshinstudio.com/en/notes/blocked-page/) was exactly this). So I now put the number scanned into the completion message.

## 4. A case I measured and deliberately did not add

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

## What I learned

> Clumping is invisible until counted. Record the decision not to add, too.

- Count clumping in time. 27 at 4 o’clock, 0 from 10 to 21.

- Jobs hold something you cannot see. A lock’s expiry should be at least the timeout.

- Do not count anomalies you cannot fix. If the number does not fit, doubt how you count.

- Distinguish what “0 items” means. Show the number scanned.

- If you decide not to add something, keep the reason and the conditions. Even when measurement shows a gain, if it risks over-deleting, I do not add it.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/audit-sweep-61/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
