# Making a ranking server use only half of the free tier: from 5 calls to 2

> A game ranking on Workers and D1: calls per play from 5 to 2, rows read from 421 to 221. Server-side rank counting and removing the preflight call.

- URL: https://koshinstudio.com/en/notes/ranking-free-tier/
- Original (Japanese): https://koshinstudio.com/notes/ranking-free-tier/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/ranking-free-tier/)

Development log of Sushi Stack / October 2026

  Sushi Stack (https://koshinstudio.com/en/works/) has an online ranking. It runs on Cloudflare Workers and D1 (a database), within the free tier. I halved how much of the free tier this ranking server uses. What I counted and what I changed are written with the measured values in my commits.

## The free tier is shared

  Cloudflare’s free tier is per account. All Workers and D1 databases in the account share it. If other projects live there too, it is best to keep the ranking thin. My commit also says that from September 1, 2026, D1 really refuses queries at this limit. The limit is on “rows read,” 5 million a day.

## What happens when one person plays

  For the most ordinary flow, “one person plays once, submits a score, and views the ranking once,” I counted calls to the server and rows read. I counted by actually running the Worker with node:sqlite in place of D1.

     | Before | After

    Calls | 5 | 2

    Rows read | 421 | 221

    Rows written | 1 | 1

  The ceiling is rows read. Dividing 5 million rows by the rows per person gives how many people can play within the free tier. Before: 5,000,000 ÷ 421 ≈ 11,876 people (the commit says “about 11,000,” a little off from the division). After: 5,000,000 ÷ 221 ≈ 22,624 people (about 22,000 in the commit). By either count, the daily ceiling roughly doubled.

## Two changes

### 1. Count the rank on the server

  Before, the game fetched the top-100 list twice and looked for itself in it. I changed it so the server counts the rank and returns it. The counting is a COUNT that cuts off after a fixed number of top rows (SCAN). The higher you are, the fewer rows are read.

### 2. Remove the preflight call

  I made /submit, which sends the score, accept text/plain. The content is still JSON. But when sent with this type, the browser does not send the preflight check call (OPTIONS). One call is gone.

  The shared database on the artifact side has no mechanism to count rank. That side still counts in the game as before. Only when submit returns null does it fetch the list.

## What I verified

- Submitting two people to an empty ranking gives 1st and 2nd.

- In a ranking of 500 people, the server-counted rank (including “outside the top 100”) comes out correctly.

- Tampered score submissions are still rejected as before, in both Japanese and English.

## What I learned

> What you count is not money but calls and rows.

- A free-tier limit is the one that runs out first. Here it was rows read, not the number of calls.

- Measure one “ordinary play.” I could say “half” because I fixed one flow of a person playing and counted it.

- The same free-tier story is in the 10-second stopwatch ranking article (https://koshinstudio.com/notes/stopwatch-rank/) (in Japanese). There it was the number of writes (1,000 a day on KV).

  The numbers in this article come from my commit record (September 7, 2026). The free-tier limits (such as 5 million rows a day) are as stated in the commit.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/ranking-free-tier/).

  More in English

- All English pages (https://koshinstudio.com/en/)
