# “Automate everything that can be”: counting showed 66 repair jobs had never run on a schedule, and I added only six

> Matching 319 HTTP endpoints against 184 scheduled jobs by call showed 66 that only ran by hand. After a dry run I scheduled only the continuously needed ones, six, and fixed a queue that let the same job pile up.

- URL: https://koshinstudio.com/en/notes/automate-sorted/
- Original (Japanese): https://koshinstudio.com/notes/automate-sorted/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/automate-sorted/)

Development log of the Toreca Dash app / August 2026

  On my app Toreca Dash the instruction was: “automate everything that can be automated”.

  On 28 August 2026, the first thing I did was count. 66 repair processes had never once been called from a schedule. This article records how I counted, and why I did not put all 66 on a schedule.

  Numbers come from my work log of 28 August 2026.

## Counted: 66 only worked if you hit the URL by hand

  I matched 319 HTTP endpoints against 184 scheduled jobs by function calls, not by name, because something with a different name can still be called from a scheduled job.

  The result: 66 only ran if someone hit the URL by hand. Articles that could be fixed stay broken until a person remembers “time to run that”.

## I did not schedule all 66 at once

  The 66 fell into three groups:

- Needed continuously (needed whenever new data arrives) → put on a schedule.

- One-off migrations (backfill*, reclassify* and so on) → do not schedule. Running them daily is wasted work and only adds room for accidents.

- Destructive or needing human judgement (deleting orphaned products, manual re-linking) → do not schedule.

  A new scheduled job runs once the moment it is deployed. Before adding any, I rehearsed all of them with a dry run (no writes) to see what they would hit.

## The six I added

    Job | Dry-run result

      Fix empty deadlines on X articles | 32 targets, 0 updated

      Fix aggregator-derived store names | 5 (an account’s promotional text had become the seller)

      Fix shipping fees counted in the price | 0

      Fix links to generic products | 0

      Fix titles of split articles | newly built

      Fix aggregator-derived deadlines | newly built

  I spread their start times. Running them together fights for concurrency slots and lengthens the queue. Scheduled jobs went from 184 to 190.

  The remaining candidates (deadline repair, broken product-image repair, Rakuten affiliate-link repair) take over 2 minutes and their dry runs did not finish in time, so I held back. I do not add one without checking it.

## The product catalogue was already fully automatic

  To “can the product catalogue be automated too?” the answer was “it already is”. All 15 genres had an import from the official catalogue, updated an hour earlier. Linking articles to products is automatic: 1,406 of 1,415 measured were linked. The rest were “new sets not yet on the official site”, which come in automatically once the official site lists them.

## The queue kept growing

  Counting also turned up another thing. The queue length was growing 81, 86, 91 within 45 seconds.

  The cause: the function that adds jobs (enqueue) only checked “is it running”, and did not check jobs already waiting in the queue. While the concurrency limit was reached, the time for a “every minute” job kept coming, and the same job piled up many times.

  I made it remember the names of waiting jobs and not add them twice. The queue stayed at 0.

## What I learned

> Automation is not putting everything on a schedule. Count, sort, check, then add.

- Count first. 66 had never been called. Match by calls, not names.

- Sort. Add only what is needed continuously; not one-off migrations or destructive jobs.

- Check with a dry run before adding. A new scheduled job runs the moment it is added.

- Spread the times. Running together lengthens the queue.

- Before queueing, check “is it waiting” too. Checking only “running” lets it pile up.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/automate-sorted/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
