# What I read as “fetched” was just a notice page: three days of zero products

> A scraper returned zero products for three days because a 2,410-byte “enable JavaScript” page counted as success. How I centralized the check.

- URL: https://koshinstudio.com/en/notes/blocked-page/
- Original (Japanese): https://koshinstudio.com/notes/blocked-page/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/blocked-page/)

Development log of Torecadash / October 2026

  My iOS app Torecadash regularly visits the sales pages of online shops to collect lottery and first-come sale information. One day I found that fetching from Pokémon Center Online had been returning zero products for three days straight. There were no errors, because each fetch was judged “fetched.” What was happening is written from my commit record.

  This is a development log of the app.

## My “fetched” check was too lenient

  Pages are fetched through an external service (Scrape.do). Fetch settings range from cheap to expensive, and the design is that if the cheap setting fails, it escalates to a stronger one (the same mechanism as in my article on scraping cost (https://koshinstudio.com/notes/scrape-cost/), in Japanese).

  The problem was the judgment of “did it fetch.” When the Pokémon Center page was fetched with the cheap setting, what came back was a 2,410-byte page saying “Please enable JavaScript”. It was not a product list, just a notice. But I read this as “fetched” and treated it as a success. If it is a success, there is no escalation to the stronger setting either.

  So from September 4, for three days, fetches kept “succeeding” while products stayed at zero.

## The fix

- Gather the “fetched” check in one place. The check had been scattered over several places. I made one function that looks at whether a page is a blocked page (scrapeDoResultLooksBlocked) and made everything use it.

- Remember the setting that worked. It remembers a setting that succeeded once and tries from there next time. This cut the credits used per fetch from 36 to 25.

## Another bit of dirt found the same day

  The same inspection found another problem. The logic that decides a mismatch between alternative spellings of a product name was written separately at the entrance of matching and in the cleanup side. Only the cleanup side lacked a check for “the product forms differ.” As a result, an alternative spelling of a trial deck stayed attached to a booster pack product, and kept triggering wrong matches every day. I made the check a shared function and removed 46 entries across 27 products.

  I also resolved the “no document to update” error (64 in 7 days). Now products are re-read when their cache is old, and articles that have disappeared are skipped so the remaining dedupe processing continues.

## What I learned

> “Success” and “the contents were fetched” are different things.

- Judge success by the contents. That the communication went through and that what you wanted was fetched are different. If “zero items fetched” continues, that itself must be watched as an anomaly.

- Keep a judgment in one place. If the same judgment exists in two places, one of them goes stale, like the matching entrance and the cleanup.

- No errors is not evidence that things are going well.

  This article is written from my commit record (September 7, 2026). How I noticed the three days of zero is not written in the commit.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/blocked-page/).

  More in English

- All English pages (https://koshinstudio.com/en/)
