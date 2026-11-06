# Comparing with other sites to count gaps: the first “23% coverage” was a measuring mistake and the truth was 49%

> Counting whether I show lotteries other sites list: the first 23% was distorted by product-name spelling and expired articles. After fixing it, 49%; after fixing five gap-filling problems, 90%. Sites whose terms prohibit automated fetching were not imported.

- URL: https://koshinstudio.com/en/notes/coverage-check/
- Original (Japanese): https://koshinstudio.com/notes/coverage-check/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/coverage-check/)

Development log of the Toreca Dash app / August 2026

  One goal of my app Toreca Dash is to show lottery information without leaving anything out. The best way to find gaps is to compare with other sites that publish the same information and count “what they have and I do not”.

  I did this in the early hours of 29 August 2026. The first number was “23% coverage”. But that was a mistake in how I measured. This article records the five problems found as the number moved from 23% to 49% and then 90%.

  Numbers come from my work log of 29 August 2026. I do not name other sites.

## First, I surveyed every competitor

  The request was: “remove every article competitors publish that this app does not”. First I surveyed every possible competitor. Whether I could import from each was decided by reading the robots.txt (the request to machines) and the terms of use in full.

    What I found | Count | Handling

      Sites I already imported from | 3 | Unchanged

      Site newly added this time (Site A) | 1 | Per-case entries, with application links

      Sites whose terms have no prohibition and can be imported | 2 | Compared by hand this time

      Explainer-style sites with no per-store list | several | Skipped: almost no difference

      Sites whose robots.txt and terms prohibit automated fetching | 2 | Not imported. Not allowed as application links either

      A site whose domain no longer exists | 1 | Removed from the list

  One site states the prohibition in Japanese at the very top of its robots.txt. That a machine can fetch it does not mean it should.

## The comparison site was finer-grained than mine

  The site I added (Site A) lists “store × product × deadline × application link”, 90 entries on a single page. My sources were per-article, A is per-case, and its application links are the external forms themselves (Google Forms, LivePocket, Lottery Rotobox, the store’s official X). It was a good counterpart both for counting and for filling gaps.

## Problem 1: a different way of writing a product name counted as “missed”

  The first number was 23% coverage. Reason one was how product names are written.

  Them  30th CELEBRATION BOX
Mine  Expansion Pack "30th CELEBRATION"
  Neither contains the other, so naive “contains” never matches. 60 entries were counted as missed because of this.

  But “same if contained” is not the answer. The name “30th CELEBRATION” is contained in “30th CELEBRATION Premium Deck Set”. That errs in the direction of counting a different product as “covered”, hiding holes.

  The fix: drop set-type words (expansion pack, high-class pack) and quantity words (BOX, n-piece set, n types), then link to a catalogue product ID. The order: exact match, then the longest catalogue name contained in their name, then the reverse only when there is exactly one.

## Problem 2: an expired article counted as “covered”

  Reason two was 5 entries. An article with a 29 July deadline at one store was paired with their 30 August case and reported as “article exists but hidden”. It was a different, earlier lottery. After these two fixes the true number was 49%.

## Problem 3: articles made to fill gaps landed on the wrong product

  Gaps are filled by creating articles. But I passed their product name to an AI as is. The AI linked “30th CELEBRATION BOX” to “30th CELEBRATION FUTURISTIC BOX”, priced at ¥27,500. 10 articles ended up on the wrong product.

  The counting side had already narrowed to one catalogue product. The right fix was to give the creating side my catalogue name: one judgement for counting and creating.

  While repairing, I made another mistake. I wrote product IDs truncated to the first 10 characters and created 10 articles with nonexistent IDs. My check printed IDs with slice(0, 10) to read them, and I used those short values directly. I fixed it at once, and the rule is now: never use an ID shortened for display in processing.

## Problem 4: application links other than t.co were always discarded

  The step that attaches application links to aggregator-derived articles passed each store’s URL through a link-expanding function. That function only looks at t.co (X’s short URL), because links in X posts are always shortened. Other sources hold application URLs in plain form. Through it, they gave 0 results every time and fell back to web search.

  Of 32 articles made from Site A, 17 pointed to the source site’s page rather than the application form. Sending users to the source site was something I had decided to prohibit.

  The fix: use plain, unshortened URLs as candidates directly (the usual check still decides adoption). For articles already made, I added a step that rewrites the application link on every comparison, and rewrote 16.

## Problem 5: articles hidden for “no deadline” had no way back

  A job hid aggregator-derived articles whose deadline was unknown. It only hid; even if the deadline became known later, it stayed hidden forever. It is the same shape as an alert that keeps ringing after the fix. For cases where the other site gives a deadline, I now set it and restore the article (articles hidden for other reasons are not restored). Two were restored.

  I also fixed how deadline times are handled. The parsed date was returned as a “Japan-time shifted” value and, saved as is, would have been a deadline 9 hours off. 23:59 Japan time is 14:59 UTC; I now return the real time.

## Result

     | Count

      Open cases Site A lists | 86

      Shown in my app | 77 (90% coverage)

      Missing from the feed | 0

      Article exists but hidden | 2

      Cannot create because they do not identify the product | 7

  This work created 32 articles, rewrote 16 application links and restored 2 with deadlines.

  The remaining 9 all have known reasons:

- One store’s premium deck set is deliberately excluded, because its application page says only “for one box of the expansion pack”. Here the other side is wrong.

- Seven “Starter Set ex, 3 types” entries: the other side does not say which 3 types either. Guessing three articles would put articles about other products side by side, so I do not create them.

- The last is one article hidden for not being seen recently. It may also need a “way back” and stays on my to-do list.

## What I learned

> A flaw in the counting tool does not make the number look bad; it makes holes invisible.

- Doubt how you measure coverage. The first 23% was really 49%, and I got to 90%.

- Do not use “same if contained”. It counts a different product as covered.

- The other side’s entries can be wrong. Among the remainder was one such case.

- Make one judgement for counting and creating. Otherwise the product counted and the product created differ.

- Never use a value shortened for display in processing.

- A hiding process needs a way back, built together.

- Read the terms before importing. Being able to fetch is not being allowed to.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/coverage-check/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
