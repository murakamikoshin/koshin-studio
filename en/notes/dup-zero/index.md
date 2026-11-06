# I counted “duplicates are practically zero,” but the audit reported 112 pairs

> A nightly merge job timed out partway through the first genre, so later genres were never reached. My count of zero saw only that genre. Fixed with a rotating budget.

- URL: https://koshinstudio.com/en/notes/dup-zero/
- Original (Japanese): https://koshinstudio.com/notes/dup-zero/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/dup-zero/)

Development log of Torecadash / October 2026

  My iOS app Torecadash has a job that merges “duplicates,” where one product is registered as several products, every night. One day I counted by myself and recorded “duplicates are practically zero.” But the repository audit reported 112 pairs. My way of measuring was wrong. This is the story from my commit record.

  This is a development log of the app.

## I counted zero, and 112 pairs appeared

  Looking at the 112 pairs, for example one trading-card booster pack was registered split into 7 entries, even though the merge job was supposed to run every night.

## Cause: it timed out partway through, every night

  Running the merge over all genres takes about 15 minutes. But the time budget I had given the nightly scheduled run was 480 seconds (8 minutes). The order always starts from the same genre (Pokémon). So every night it timed out in the middle of Pokémon, and the later genres were never reached.

  My count was “zero” because only the range I was looking at (the first genre) was clean.

## The fix

- Rotate. Start from the genre after where the last run stopped, and stop when the time budget (6 minutes) is used up. The next night continues from where it stopped.

- First, run it to completion by hand. Running all genres to the end by hand took duplicates from 112 pairs to 0 and products from 2,753 to 2,570.

## What I already knew: one pass is not enough

  Two days earlier (September 5), I had learned something else about merging. When A is merged into B, B’s name can become the same as another C. Then one pass is not enough. In real data:

    Pass | Merged | Result

    1st | 138 | 53 new same-name pairs appeared

    2nd | 54 | 0 same-name duplicates

  Products went from 2,935 to 2,713. So the daily slot now repeats until nothing is merged (up to 3 times). This “timeout” problem sat even before that repetition.

## Three more things the same day

- Six open lotteries had disappeared because of another product’s list price. A 7,200 yen lottery (the official 360 yen × 20 packs) had been compared with another product’s list price of 27,500 yen left on the article and rejected by price. I added a condition: “fix only when it can be proven.” Across all real data, 10 matched the condition and all were sales at a normal price. I restored 11 to visible.

- False alarms in matching. Of 17 “article exists but hidden,” 9 had a replacement article visible under a different spelling of the same shop (like two different kanji spellings of the same store name). If the replacement is visible, it now counts as covered, which moved coverage from 87% to 90% and hidden items from 17 to 4.

- The audit itself had stopped. The reader part for audits misread a regular expression right after => as a division, and four audits were failing with ReferenceError. I changed it so that names it could not cut out are reported with a reason instead of being skipped silently.

## What I learned

> When you count “zero,” first doubt what you counted.

- The range you looked at is not necessarily everything. Only the first genre was processed every night, so counting only the first genre looks clean.

- For time-limited jobs, check whether it finished. Running and reaching the end are different.

- The tool that counts also breaks. When an audit has stopped, the result looks like “0 items.” You need a way to notice that it stopped.

  This article is written from my commit record (September 5 and 7, 2026).

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/dup-zero/).

  More in English

- All English pages (https://koshinstudio.com/en/)
