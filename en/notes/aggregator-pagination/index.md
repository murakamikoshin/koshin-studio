# An aggregator crawl read only page 1: card articles were on pages 2–4, and only the first 6,000 characters went to the AI

> The crawl of a stock-information aggregator read only page 1 (mostly consoles), while Pokémon and Gundam articles were on later pages. Only the first 6,000 characters went to the AI, so later stores dropped. I followed 12 pages and read all the text.

- URL: https://koshinstudio.com/en/notes/aggregator-pagination/
- Original (Japanese): https://koshinstudio.com/notes/aggregator-pagination/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/aggregator-pagination/)

Development log of the Toreca Dash app / August 2026

  One of my app Toreca Dash’s sources is an aggregator site for stock information, which lists lottery articles together. This crawl had two causes of “things that should appear but did not”.

  Written from my work log of 28 August 2026.

## Cause 1: only the first page of the list was read

  The function that reads the aggregator’s list of lottery articles (fetchNyukaNowChusenArticles) read only page 1. The 11 items on page 1 were mostly game consoles, a virtual pet and plush toys. The trading-card articles were on later pages.

    Kind of article | Where it was

      Pokémon cards | a later page

      Gundam card game | page 2

      Dragon Ball, Digimon, Duel Masters | page 3

      Union Arena, Weiss Schwarz | page 4

  Many existing articles derive from one Pokémon-card roundup, yet the crawl no longer read that article itself. The fix was to follow up to 12 pages.

## Cause 2: only the first 6,000 characters of the body went to the AI

  A Pokémon-card roundup lists 15 or more stores on one page. I gave the AI only the first 6,000 characters of the body, so the later stores dropped out entirely. That is also why the number readable per run wobbled 48, 39, 40.

  The fix was to read all of it in 5,000-character pieces with a 600-character overlap. The import itself uses the same function.

## Found the same day: dates with no year

  The aggregator’s table writes only “30 August (Sun)”. I was not giving the AI today’s date, so Pokémon-card items came back as 30 August 2020. A past deadline is rejected by the entrance gate, so Pokémon-card items from this route were not imported at all. After I put today’s date and “do not fill in a year before today” in the prompt, the open items I could read went from 0 to 46. (This is also told in another article (https://koshinstudio.com/en/notes/silent-discard/).)

## What I learned

> Three cut points in an import: pages, characters, years.

- Read a list to its last page. What you want is not necessarily on page 1.

- Check that the AI’s character limit is not dropping the back half. A wobbling count is a sign.

- Pass the whole text, in order, with overlap. If you pass only the head, the rest drops.

- For dates with no year, give today’s date. Otherwise it fills in six years ago.

- “Not reading the source of existing articles now” is a sign of a gap.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/aggregator-pagination/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
