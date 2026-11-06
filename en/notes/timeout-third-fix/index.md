# I fixed a timeout three times and it did not stop: the culprit was a second process under the same lock

> A Rakuten Books stock check timed out 17 times a day. Limiting fetches, then a whole item, did not help; the third time I found that another process under the same lock re-fetched everything with no time limit.

- URL: https://koshinstudio.com/en/notes/timeout-third-fix/
- Original (Japanese): https://koshinstudio.com/notes/timeout-third-fix/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/timeout-third-fix/)

Development log of the Toreca Dash app / August 2026

  The job in my app Toreca Dash that rechecks Rakuten Books stock timed out 17 times a day. A timeout means a run does not finish within its limit (480 seconds).

  I fixed it three times, and it did not stop. The real culprit was in a place I had not looked, each time. This is the record of how I tracked it down.

  Written from my work log of 25 August 2026.

## First fix: fetches had no timeout

  The first thing I found was that fetches had no time limit. If an external site never replies, the process waits forever. I added a limit. But the 17 timeouts a day did not stop.

## Second fix: the screening of items that became buyable

  Next I suspected the resale-price screening of items that had become purchasable. It includes calls to an external API, so a path that could hang remained. When screening skips an item, the notification count stays 0, so the symptom does not reveal it.

  I extracted the whole handling of one item into a single function (processOne()) and wrapped it in a Promise.race (take whichever finishes first) with the remaining time as the limit. After deploying, 0 timeouts in 7 minutes, and the log said “checked: 12 (rest next time because time ran out)”, a normal finish.

  The lesson: putting a limit only on “the spot that looks stuck” is not enough. The time budget is only checked at the head of the loop. If any unbounded wait remains inside one item’s processing, the job runs to the hard limit. Put the limit on the whole processing of one item.

  But the timeouts had not stopped.

## Third fix: the culprit was a second process under the same lock

  The reason three fixes did not work: none of the places I limited was the real one.

  The culprit was a second process (runRevalidateRakutenBooksAvailability) running under the same “prevent double runs” lock.

- It re-fetches every Rakuten Books reservation and first-come article and calls the API one by one.

- Rakuten’s API has a 1.5-second interval limit.

- It had no time limit at all.

  However many limits I put on the first process (the stock check), the second ran to 480 seconds. The log shows the first one’s completion message, so it looked like “it finishes normally yet times out”.

  I gave the second process a “remaining time” limit too. It runs every minute anyway, so cutting it short loses nothing. 15 minutes after deploying, 0 timeouts.

## A bonus: a site that erred every time

  Another bug found along the way: a game company’s shop site returned an infinite redirect loop (maximum redirect reached) with a plain fetch, logging an error at every recheck (a dozen or so a day). The scraping service’s “escalation memory” already knew it needed a stronger setting.

  The fix: hosts remembered in the escalation memory go straight through the scraping service without trying a plain fetch. I did not list host names by hand. The memory builds up automatically from real failures, so new sites need no extra work.

## What I learned

> When chasing a timeout, first count everything the function calls.

- One scheduled function can contain two or more processes. Three times I looked only at the first.

- Put the limit on the whole processing of one item. One suspect spot is not enough.

- “Finishes normally yet times out” means suspect another process. The completion message may be the first one’s.

- Log the time of each segment. Next time it will be obvious at once.

- Prefer memory built from real failures to hand-written lists. It works on new sites automatically.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/timeout-third-fix/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
