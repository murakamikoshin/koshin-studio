# A bulk update hit “all articles”: count before you write, and break your tests to prove they work

> A bulk job hit every article and wrongly restored 18 items. How I reverted them from status history and proved new tests work by breaking rules one at a time.

- URL: https://koshinstudio.com/en/notes/bulk-accident/
- Original (Japanese): https://koshinstudio.com/notes/bulk-accident/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/bulk-accident/)

Development log of Torecadash / October 2026

  In my iOS app Torecadash, a new job that fixes article status in bulk hit every article, including ones I never meant to target, the first time I ran it. 18 items from other sites were wrongly restored to visible. This is how I fixed the accident, and how I checked that the test I built afterward to close the same hole actually works, from my hand-over notes.

  This is a development log of the app.

## What the job was for

  The app has a “price gate” that checks whether a listing’s price is reasonable (I wrote about it in another article (https://koshinstudio.com/en/notes/fail-open/)). Among articles hidden by this gate only because of price, I added a job that restores those that were actually correct and had been hidden because of a product mix-up. The condition for restoring is “the correct product’s list price matches the listing price.”

## The accident: it hit all articles

  At first this job hit all articles without distinguishing the source. As a result, 18 articles from other sites (Amazon, Card Labo, Ministop and others) were restored to visible. They should have stayed hidden.

  There were two fixes.

- Narrow the scope. I limited the job to articles from that source only (those whose site identifier starts with that source).

- Put back what I had restored. I identified the 18 wrongly restored articles from the status history (statusHistory) and put them back to their original state (hidden, rejected by price).

  But there was something I could not get back for these 18. The job had overwritten the original list-price field with the listing price. The value stays as the listing price.

  The cause was that I had not counted the target range before writing. My notes say so: “count the target range before a bulk write.”

## Building tests to close the same hole

  To make sure the problems found in that day’s inspection (wrong splitting of 9-pack sets, single cards slipping in, non-card products slipping in) never happen again, I built tests: 66 cases in catalog-guards.test.js, and all six test files together can be run in one procedure (run-all.sh).

  I also added warnings to my daily operations notice: when the miss rate of matching falls below the criteria (Chusen Zukan 80%, Pokechu 75%, X roundup 75%), when nothing has run for 30 hours, and when single cards or non-card names appear in the product list. The judgments are pure functions with no side effects, so once things are fixed, the warning disappears by itself on the next run.

## Breaking it to check that the tests work

  You cannot tell whether a test works just by writing it. A test that always passes may protect nothing. So I took a copy of the production code and removed its rules one at a time to confirm the tests fail.

- Remove one rule (break it).

- Run the tests.

- If they fail, the test is protecting that rule.

  With this procedure, I tried 6 kinds of modification, and the tests failed for all 6 (all were detected).

  I also wrote down an operating rule: if I touch functions/index.js, I always run all the tests before deploying.

## What I learned

> Count before a bulk write. Break the test to prove it.

- Before writing, count “how many it will hit.” If you run it without a preview, you notice the range was wrong only after it has finished writing.

- Write in a form you can undo. I could restore the 18 because I could identify them from the history. The overwritten field, though, cannot be restored.

- Prefer a test that fails when broken to a test that passes. Only after removing a rule and seeing it fail can I trust the test.

  This article is written from my hand-over notes (§272) (October 7, 2026). The counts are as written in the notes.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/bulk-accident/).

  More in English

- All English pages (https://koshinstudio.com/en/)
