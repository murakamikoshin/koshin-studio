# Making a 10-second stopwatch ranking fair: 3 decimals, ties and write counts

> Why I truncate to three decimals so coarse clocks get no advantage, how ties (a 1/333 chance) are broken, and how I counted KV writes on the free tier.

- URL: https://koshinstudio.com/en/notes/stopwatch-rank/
- Original (Japanese): https://koshinstudio.com/notes/stopwatch-rank/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/stopwatch-rank/)

Development log of the 10-second stopwatch / October 2026

  Stop at exactly 10 seconds! (https://koshinstudio.com/en/works/) is a game where you count ten seconds in your head and stop. It is three rounds and the smaller your error, the better. When I added a ranking to it, I had to decide “what is fair” in three places. This is written from the README and code comments in the repository.

## Display down to three decimals

  Error is measured with the browser’s performance.now(). According to the README, this clock is deliberately made less precise as a security measure (Spectre). Chrome is in 5-microsecond steps, Safari and Firefox in 1 millisecond.

  What would happen if error were shown to 6 decimal places? A device with a coarser clock more easily ends in 000 and gets an advantage. The README’s guess is that iPhones would take the top ranks. So I decided to cut to 3 decimals and align all devices. For the start of measurement, I use event.timeStamp of pointerdown rather than click, because click adds extra delay.

## Ties happen more than you think

  With 3 decimals, an exact 0.000 comes up with probability 1/1000 per attempt. The chance that any one of three attempts is 0.000 is about 1/333. If you build a “best of three” board, ties at 0.000 will pile up.

  So for a tie, the one with the smaller total error in the other two attempts ranks higher. If that is equal too, whoever submitted first. Someone who hit 0.000 and also did well on the other two ranks above, so they can be told apart from someone with one lucky attempt.

  The “total” and “average” rankings have exactly the same order (it is just division by 3), so they are one board. Separately I placed a “best single attempt” board. The idea is that the average is skill and the best single is luck.

## Counting writes

  The ranking is built on Cloudflare Workers and KV (a key-value store). According to the code comments, KV writes are 1,000 a day on the free tier. To stay within that, I decided the following.

- The board for each mode is stored under one key. One submission writes at most twice (today’s and all-time).

- Submissions that do not make the ranking, and submissions with the same name that are worse than before, are not written at all.

- Only one row is kept per name. One person cannot fill the board.

  Also, since scores are reported by the client, cheating cannot be prevented. The README says so. So I operate on the assumption that it is reset every day. Days are cut in Japan time, and today’s board disappears in 3 days.

## What I fixed around the launch

- The range of accepted error. I accept up to the slowest result the screen can show (99.999 seconds in 10-second mode). Even terrible results are accepted, since they will not stay on the board anyway.

- Do not cache the read before a write. If KV reads have a short cache, a new value is written over a stale one and submissions that came in between disappear. Only the read before a write has no cache. View-only reads stay cached.

- Retry when it could not connect. At first, if the game could not reach the ranking when it opened, it did not show the ranking box and never tried again. Even if the ranking backend came up while playing, there was no way back. When three attempts are done and the box is still hidden, it now reads once more.

- Stay quiet. Until it connects, the ranking box is not shown at all and there is no apology message. I decided that being silent is better than showing an empty box or red text.

## A stumble on launch day

  When I first deployed to Cloudflare Pages, I did not pass --branch. The name of the working branch I happened to be on was registered as the production branch of Pages. After that, deploying with --branch main only went to a preview, and the public URL did not change. I did not notice for an hour.

  I fixed the production branch to main in the dashboard. One more thing I had confused: the branch name shown on the “Production” row of the deployment list is the name at the time that deployment was made and is not rewritten when you change the setting. To see the setting, look at the “Production branch” column in the project list.

## What I learned

> Fairness is made of digits, ties and write counts.
  None of them looks like what makes a game fun. But cutting to three decimals and deciding tie-breaking in advance directly affect how convincing the ranking feels to players.

  This article is written from the repository’s README, code comments and the commit record (September 8 to 12, 2026). The clock precision per browser is as stated in the README.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/stopwatch-rank/).

  More in English

- All English pages (https://koshinstudio.com/en/)
