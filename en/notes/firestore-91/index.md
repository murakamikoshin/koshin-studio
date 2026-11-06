# Firestore cost in yen: 91% of reads came from one place, and my first cache did not work

> Seen in yen for the first time, Firestore cost about ¥13,000 a month, close to Gemini. 91% of reads were a product list re-read for every post. A 60-second cache failed because 32 jobs ran at once; caching the pending promise fixed it.

- URL: https://koshinstudio.com/en/notes/firestore-91/
- Original (Japanese): https://koshinstudio.com/notes/firestore-91/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/firestore-91/)

Development log of the Toreca Dash app / September 2026

  The back end of my iPhone app Toreca Dash (a Japanese trading-card lottery and restock alert app) runs on Firebase’s Firestore database and a set of scheduled jobs. I had been reporting the cost of Gemini (AI) and of a scraping service in yen every day. I had not been reporting Firestore at all.

  On the night of 4 September 2026 I converted it to yen for the first time. It was almost the same as Gemini. This is the record of how I found that 91% of the reads came from one place, why my first cache did not work, and how I fixed it again.

  Numbers come from my work log of 4 September 2026. Prices are the real Tokyo-region prices.

## Once it was in yen, there was a cost nobody was watching

    Day | Reads | Writes | Cost per day

      28 Aug | 2.18 million | 120k | ¥226 (about ¥6,777 a month)

      1 Sep | 3.66 million | 134k | ¥368 (about ¥11,028 a month)

      3 Sep | 4.21 million | 162k | ¥427 (about ¥12,810 a month)

  The free tier is 50,000 reads a day. I was reading 84 times that, and it had grown 89% in a week, growing with every new article. A cost that is not shown in yen might as well not exist: about ¥13,000 a month, and nobody noticed because it was not in the report.

## A meter found it in three minutes

  I added a meter that counts which job reads which collection, and how much. The answer came as soon as it was in.

  8,725 reads  X monitor | products   ← 91% of the 9,593 measured
  197 reads  X monitor | news_items
  For each post, the X monitor asks an AI “which product is this about?”. To build the candidate list it re-read every product of the genre each time. The Pokémon genre has 693 products, so matching one post cost 693 reads. If I had searched the code, it would have taken much longer. Count before you search.

## The first cache barely helped

  The fix sounds simple: remember the list after reading it. I first cached for 60 seconds. It barely helped.

  The X monitor handles up to 32 accounts at the same time (Promise.all). What happened was:

- The first call sees “not in the cache” and starts reading.

- Before it finishes, the other 31 calls also see “not in the cache”.

- All of them read the same 693 products at once.

  I measured one re-read every 23 seconds. A cache remembers a finished result; callers that arrive during the read have nothing to find.

  The fix is to remember the pending promise, not the result. The first call stores its promise; the other 31 wait for the same one. However many calls arrive together, there is one read.

  // An illustration of the idea: cache the pending promise, not the result
cache.set(genre, { at: Date.now(), promise: loadProducts(genre) });
// callers always await cache.get(genre).promise
  I added three rules with it:

- Drop the cache the moment a product is created or deleted. Otherwise the list shows products that no longer exist, or creates the same product twice.

- Another function read the same products under the same conditions. I moved both to one cache so one side does not miss it.

- The cache lasts 10 minutes per genre.

  Measured in a quiet period and converted to a day, 5.07 million reads became 277,000.

## Another one: reading 3,085 documents every 5 minutes and using 146

  After the product cache, the next item at the top of the meter was a job that rechecks Rakuten Books stock every 5 minutes with this query:

  news_items where saleType in ["reservation", "guerrilla"]
  It returned 3,085 documents and then filtered to Rakuten Books in code. Only 146 were relevant: 95% was wasted. At 288 runs a day that is about 888,000 reads, roughly ¥2,400 a month.

- Cache the target list (only references and ISBNs) for 2 hours.

- But re-read the fields used for decisions every time, so I never write based on stale values. It is only 146 documents, so it is cheap.

  Reads fell from 888,000 to about 79,000 a day (−91%).

## What I learned

> A cost you do not show in yen does not exist.

- Fix the meter first. A cost you do not look at can grow unnoticed.

- Count before searching. One “job × collection” tally showed where 91% went in three minutes.

- For concurrent code, cache the pending promise. A cache of finished results lets everyone who arrives together walk past it.

- Filter before you read. Reading everything and keeping 5% is paying to throw away 95%.

- Confirm final numbers the next day. “5.07 million to 277,000” was a quiet-period measurement.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/firestore-91/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
