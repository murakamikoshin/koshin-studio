# “Weird articles keep multiplying”: I counted by creation route and closed the entrances, and my counting was wrong twice

> 252 displayed lotteries were counted by route. Ended rounds left in an aggregator’s table were imported daily with empty deadlines (33); links to search results or top pages and deadlines disagreeing with the store’s own row were closed at the entrance.

- URL: https://koshinstudio.com/en/notes/weird-articles-by-route/
- Original (Japanese): https://koshinstudio.com/notes/weird-articles-by-route/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/weird-articles-by-route/)

Development log of the Toreca Dash app / August 2026

  For my app Toreca Dash the instruction came: “weird articles keep multiplying. No deadlines, so many odd articles. Solve it permanently. Investigate the articles made by other routes thoroughly too.”

  This article records counting articles by the route that created them and closing the entrances, and also how I got the counting wrong twice.

  Numbers come from my work log of 28 August 2026.

## I counted by route

  Articles are created by several routes (stores’ official X posts, store sites, aggregator sites, AI discovery). I counted what kinds of “weird articles” each route had.

    Route | Lotteries | No deadline | Link is a search result | Link is a top page | Link is the aggregator itself

      X (store official) | 118 | 11 | 0 | 1 | 0

      Store site (direct) | 63 | 1 | 1 | 0 | 0

      Aggregator A | 39 | 33 | 3 | 2 | 8

      Aggregator B | 28 | 11 | 0 | 1 | 5

      AI discovery | 4 | 2 | 0 | 0 | 0

      Total | 252 | 58 | 4 | 4 | 13

## I corrected my counting twice

- First I counted over all articles and said “1,204 of 1,398 have no deadline (86%)”. A deadline is a concept only for lotteries. First-come sales (1,055) and reservations (91) never had one. I had counted without checking what the field means.

- I wrote “the saved chunk is another store’s (98%)”, but in fact the full post text was stored and it just happened to begin with Amazon. I asserted from the leading marker alone.

## Holes found and fixes

### 1. Ended rounds left in the aggregator’s table were imported every day (33)

  The aggregator keeps past rounds in its table. In real data, a store’s “13–14 July” was imported on 27 August; the deadline was in the past and not adopted, giving an article with an empty deadline. With no deadline, the mechanism that removes articles past their deadline never acts, and it stays forever.

  I closed the entrance in three layers:

- Read the acceptance period as a date and skip rows that have ended.

- If a deadline cannot be read, do not create the article.

- If the store’s row has ended, do not create it.

  Checked in practice: I cleared the mark, re-ran the import, read 24 stores and got 0 new.

### 2. The application link was not an application page (5 reports)

  A search-results page (?keywords=) or a site’s top page had been adopted. I added “looks like a search result URL” and “looks like a site top page URL” checks to the single gate that adopts application links. Every route goes through that one gate, so the fix works there alone.

### 3. The article holds the full post text, so a reader who forgets to cut reads the first store (39)

  The article’s source text (sourceText) now holds only that store’s chunk. The full text goes into a separate field for verification. Whatever the reader does, it cannot pick up another store’s value.

### 4. The deadline disagreed with the store’s own row (5 of 6)

  A deadline is looked for in “the text chunk, the page linked, the attached image”, in that order. But the last two are not necessarily that store’s information. In real data the saved deadline and the store’s row differed by 53, 18 and 20 days, each a finished lottery shown as open.

  I made a function that returns a value “only when an end is stated explicitly” and, at the end of fixing a deadline, a gate: if it disagrees with the row, trust the row. One caution: a function that also returns the date for a row that only has a start, like “from 19 June”, must not be used as is to overwrite.

## Clean-up starts with a dry run

- The job “hide articles with no deadline”: 33. Before running, I read each one’s own row period and confirmed all 33 had ended and 0 were open, then ran it.

- The job “align the deadline to the row”: 5. It does not hide; if the date has passed, the existing past-deadline mechanism removes it.

  Both repairs now run automatically every day at 4:20 and 4:30 (from 190 to 192 jobs).

## Result

     | Before | After

      Displayed lotteries | 252 | 199

      No deadline | 58 | 25

      Aggregator A with no deadline | 33 | 0

      Shown past the deadline | 5 | 0

      “Other site ended, mine open” | 12 | 7

  The remaining 7 are likely cases where mine has caught the newer round (the other table is out of date).

## What I learned

> Count by route, and doubt the counting itself.

- Count by route. A table shows where weird articles enter.

- Check what a field means before counting. A deadline is only for lotteries.

- Do not assert from a leading marker. The full text was stored.

- If no deadline can be read, do not create the article. Articles with an empty deadline stay forever.

- Make it impossible to pick up another store’s value. Do not rely on the reader’s care.

- If they disagree, trust that store’s row. The linked page and image are not necessarily that store’s information.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/weird-articles-by-route/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
