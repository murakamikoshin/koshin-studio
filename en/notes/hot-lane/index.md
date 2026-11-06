# When you cannot watch everything quickly: popular 128 of 427 sets run fast, and the fastest lane yields to the budget

> Full laps over 427 sets took 4 to 24 hours. A separate lane for 128 popular sets and truly once-a-minute checks for popular items; batching stopped another monitor and measuring over a short window misjudged cost.

- URL: https://koshinstudio.com/en/notes/hot-lane/
- Original (Japanese): https://koshinstudio.com/notes/hot-lane/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/hot-lane/)

Development log of the Toreca Dash app / September 2026

  My app Toreca Dash searches shopping sites by set (a release unit of products) to collect first-come and pre-order information. There are 427 sets in all. I would like to watch them all quickly, but there are limits on scraping cost and on calls to external services.

  On the night of 7 September 2026 I decided on a policy, “watch only the popular ones quickly”, and built it. This is a record of what I sped up, what I gave up, and how I protected cost.

  Numbers come from my work log of 7 September 2026.

## Policy: three popular genres, latest and last two years only

  The policy: “for Pokémon cards, ONE PIECE cards and Dragon Ball, the latest sets and the last two years of sets are enough”. Three genres × the last 24 months is 128 sets, about 30% of all 427.

  The original per-set search walked all 427 sets in order, and one lap took different times per site.

     | One lap over 427 sets | Popular lane, 128 sets

      Amazon | 4 hours | every 30 minutes (about 450 s per run)

      Rakuten Books | 24 hours | 22 sets every 10 minutes, one lap per hour

      Rakuten Ichiba | 24 hours | 22 sets every 10 minutes, one lap per hour

      Yahoo! | 8 hours | 128 sets every 2 hours

  The popular lane runs on a separate cursor from the normal lane. Sharing one would disturb the normal lane’s progress.

  Two sites (Amiami and AEON Style) have no concept of a popular lane. They do not search by set but read a list page whole, all at once. There is nothing to narrow; going faster means shortening the interval, which is a cost question.

## Batching them stopped another monitor

  I caused a regression with Rakuten right after adding this, and fixed it on the spot. At first I ran Rakuten as “128 sets in one go every hour”. But Rakuten’s API allows one call per 1.5 seconds shared by all jobs, and the instant sell-out monitor alone uses 30 calls a minute, 75% of the allowance all the time. A batch took over 13 minutes, and meanwhile even the sell-out monitor was skipped as “previous run still going”.

  The same 128 sets per hour, scattered as 22 sets every 10 minutes, makes no pile-up. I also offset the minutes (Rakuten Books lane at :03, :13…, Ichiba lane at :08, :18…). Right afterwards: the sell-out monitor ran 8 times in 9 minutes with 0 skips, average 44.9 s, no worse.

## Fastest lane: popular items truly once a minute

  There was also a request: “I want popular items checked every minute.” That made the third time that day I confirmed what I wrote about before (https://koshinstudio.com/en/notes/interval-vs-delivery/): “runs every minute” is not “checks each item every minute”.

- Rakuten Books sell-out monitor: 62 to 92 items were un-notified, about 30 could be checked per run, one lap 3 minutes. Only 18 of them were in the three popular genres (Pokémon 9, Dragon Ball 5, One Piece 4). Checking those first on every run makes it truly once a minute, at zero cost. The other 44 are about every 3.7 minutes. Advance the cursor only for the rotating part; if popular items advance it, it stops there and other items never get a turn.

- Amazon fastest lane: 28 sets (popular genres, before release or within 60 days after), 10 sets per minute in rotation, one lap about 2.8 minutes. Measured: 27.4 s per run, 0 skips.

  I cannot hit all 28 sets every minute. At 40,320 requests a day, the month would be 1.96 million, above the 1.25 million contract. At 10 sets a minute it is 14,400 a day. In exchange I moved Amazon’s popular lane (128 sets) from 30 to 60 minutes.

    Amazon lane | Target | Cycle

      Fastest | 28 sets before / just after release | about 2.8 min

      Popular | 128 sets, three genres | 1 hour

      Normal | All 427 sets | 4 hours

## What I cannot do, I say I cannot

- Rakuten Ichiba: the sell-out monitor uses 75% of the 1.5-second allowance. Adding every-minute checks would break the monitor. The popular lane (every 20 minutes) is the limit.

- Yahoo!: once a minute is 40,000 calls a day, orders of magnitude over. Also new saves were recently 0. It stays at every 2 hours.

## The fastest lane yields when it exceeds the budget pace

  Amazon is a priority host that passes the scraping service’s daily throttling unconditionally, because it is the lifeline of the first-come race. That is right in itself, but if the every-minute fastest lane also passes unconditionally, Amazon eats the whole allowance and every other site is throttled.

  Rather than fix a count on the safe side, it is more reliable to look at actual consumption and stop automatically. I added a check (isScrapeDoOverPace()) that skips the run if the time-proportional budget pace is exceeded.

  Measured over a 2-minute window: 55 requests, 55 credits, 27.5 credits a minute (about 39,600 a day). The allowance was 1,147,389 remaining and 23 days to reset, 47,392 a day. One trap about window length: measured over 10 minutes it looked like 47.5 credits a minute (68,400 a day). A costly job every 3 hours (25 credits each) happened to fall in that window. Extrapolating from a short window is wrong; check the next day’s daily total.

## What I learned

> When you cannot speed up everything, decide what to speed up and what to slow down in return.

- Narrow the target. 128 of 427; even then only a narrower 18 or 28 can be truly once a minute.

- Do not batch; scatter. The same count with no pile-up does not stop others.

- With a shared allowance, faster for one means slower for another. Decide what to protect first.

- Make the budget yield by itself. Stopping on actual consumption beats a fixed count.

- Do not extrapolate from a short window. Confirm with the daily record.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/hot-lane/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
