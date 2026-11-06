# A “1-minute” monitor checked each item once per 10 minutes: before speeding up, count the revisit interval and what was delivered

> A first-come monitor watched 63 items but checked 4–9 per run, so each item once per 10 minutes, and caught 3 sales in 7 days. Shortening other intervals slowed it further, and “not screened” meant 45% of first-come listings got no notification.

- URL: https://koshinstudio.com/en/notes/interval-vs-delivery/
- Original (Japanese): https://koshinstudio.com/notes/interval-vs-delivery/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/interval-vs-delivery/)

Development log of the Toreca Dash app / September 2026

  For first-come sales (stock gone in minutes), speed is everything. So the first-come monitor in my app Toreca Dash was built to “run every minute”.

  On 7 September 2026 I measured its real reaction speed. It was about 10× off from what I had designed. And when I sped things up, something else got slower.

  Numbers come from my measurement log of 7 September 2026.

## “Every minute” was once per 10 minutes per item

    What I measured | Value

      Job interval | about 61 seconds (as designed)

      Items watched | 63

      Items checked per run | 4 to 9 (48 of 53 runs hit the time budget)

      Revisit interval per item | about once per 10 minutes

      First-come sales caught in 7 days | 3 (8,648 empty runs)

  “Runs every minute” feels fast. What users feel is how often each item is checked. If you can only check 4 to 9 of 63 per run, one pass takes about 10 minutes. The formula is items ÷ items per run × interval. I had never computed it, so “running but never winning” went on.

## Cause: equal sharing of a shared external API

  The Rakuten API I use to check stock allows one call per 1.5 seconds. Five jobs shared it equally, so the most urgent monitor got only 13%.

  The fix: while the urgent job runs, the batch jobs do not take slots. One trap:

- If the “yield” flag is raised and lowered around each call, it is taken back between calls. In one measurement, 13 of 20 runs were still stuck at “4 items”.

- Holding the flag for the whole patrol gave 30 to 33 items per run.

- Always put a wait limit on the yielding side, or it starves.

## Speeding things up slowed down the one I cared about

  The same day I shortened the intervals of several jobs. When I set the Amazon check to 5 minutes, the Rakuten Books instant-sellout monitor got slower.

     | Before | After shortening | After reverting

      Rakuten Books monitor completion interval | 60–80 s | 2 min 41 s / 3 min 52 s | 60–110 s

      Skips of that monitor (per 10 min) | 0 | 6 | 0

      Jobs waiting in the queue | 0 | 17–29 | 0

  The Amazon check takes 5 to 8 minutes per run, yet I set a 5-minute interval. When a run takes at least as long as its interval, the job occupies one of the concurrency slots (8) permanently, and other jobs wait. Reverting restored it.

## One more: “not screened” means “not notified”

  Before a first-come notification, listings are screened by price against the official price to catch resale. When units did not match, the screen returned “not screened”. A comment called it “safe, no guessing”.

  But an unscreened listing gets a “price unverified” mark, and notifications stop. Counting 148 first-come listings over 7 days:

    Result | Listings

      Notified | 41

      Skipped (official price unverified) | 25

  Of 55 displayed, 45% never got a notification. The article still shows in the feed, so audits do not see it and nobody complains. Making detection faster, from 10 minutes to 80 seconds, did not help while half of them silently fell out afterwards.

  And “cannot compare” was an assumption. The catalogue price of 5,280 yen divided by 12 packs per box is 440 yen, a normal single-pack price. That amount was already the price of one box. I could have compared it directly.

## What I learned

> The answer to “make it faster” is usually not “faster” but “find what is dropping out on the way”.

- Measure the revisit interval per item, not the job interval. items ÷ per run × interval.

- Count what arrived. Not articles created, but notifications delivered.

- Write down which way a gate falls when it cannot decide. If it falls to “users get nothing”, that is not the safe side.

- Faster can make something else slower. Concurrency slots are limited.

- Revisit what is marked “cannot compare”. Once units were aligned, it could be compared.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/interval-vs-delivery/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
