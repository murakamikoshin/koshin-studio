# “It should shrink” was wrong twice: cutting AI calls and what I measured afterward

> Reducing calls to an AI in a trading-card app: a predicted 45% cut was 4.5%, and batching ran zero times after deploy. What I found by recounting, with numbers.

- URL: https://koshinstudio.com/en/notes/torecadash-ai/
- Original (Japanese): https://koshinstudio.com/notes/torecadash-ai/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/torecadash-ai/)

Development log of Torecadash / October 2026

  My iOS app Torecadash collects information on reservations, lotteries and first-come sales of trading cards (Pokémon, Yu-Gi-Oh!, One Piece) and notifies users. It uses an AI (Gemini) to decide “which product an article is about.” While trying to reduce calls to that AI, things I had written down as “it should shrink” were wrong twice. In order, with the numbers left in my commits:

  This is a development log of the app.

## What I ask the AI

  The article title (for example “30th CELEBRATION Premium Deck Set Espeon”) is matched against a list of recent product candidates (the latest 60), and the AI answers which product it is. One call is about 3,083 tokens, of which about 1,800 were the same fixed instruction text every time.

## First: if the title is exactly a product name, no need to ask

  If a title matches a known product name exactly, there is no need to ask the AI. When I added this “short circuit,” 43% of X monitoring matched in real data. There were 0 disagreements (the short circuit’s answer differing from the AI’s). So I recorded that it should cut about 45%.

  But 90 minutes after deployment, the short circuit had not fired even once. Recounting, it looked like this:

    Source | Could short-circuit | Already free before | Newly saved

    X monitoring | 813 | 768 | 45 (2%)

    Others | 419 | 188 | 231 (32%)

  Before this step, there was an already free path that checks against the official catalog. Most articles that could be short-circuited were already settled there. Adding up what is newly saved, it is about 39 calls a day, about 4.5% of the total. Not 45%, but 4.5%.

> The share a rule applies to and the calls it actually removes are different things.
  If there is a free path before it, you have to count the difference. That is what the lessons field in my commit says. The logic itself was correct and safe, so I kept it. But as an AI reduction, it was small.

## Second: ask in batches

  The next main idea was to combine several articles into one call, because the fixed instruction text is then paid only once. Articles of the same genre share “the latest 60,” so the merged candidate list barely grows.

  In the design I took care of two things.

- Do not add waiting time. In measurement, a short window of a few hundred milliseconds could not batch anything (only 12 times in 24 hours did articles arrive in the same second). But waiting a few minutes would slow X monitoring’s rounds by 5 times. So I chose to “send the moment every still-running article has come to wait.” The safety cap is 20 seconds.

- Do not lose accuracy. When batched, the candidate list becomes the union for everyone, so an article can see other articles’ candidates. So the answer is returned as a real product ID, and I always verify that it is among that article’s own candidates. If not, I do not accept it. For an article with a missing reply, I ask again for that one alone.

  I measured the effect by reconstructing candidate lists from the real articles of the last two days (characters sent).

    Batch size | One by one | Batched | Reduction

    2 | 21,762 | 13,427 | −38%

    3 | 32,673 | 14,964 | −54%

    4 | 43,571 | 16,192 | −63%

    6 | 65,000 | 17,729 | −73%

## Third: deployed, and it never batched once

  Six hours after deployment, there were 47 product-matching calls and 0 batches. Although 2 to 7 calls came in the same minute, each was asked one at a time.

  The cause was the “send condition.” I had checked “number waiting ≥ number of unfinished jobs (pending),” but jobs that had come to wait were also counted in pending. X monitoring runs 32 accounts at once. If 31 had already finished, pending was 1. The moment the last one came to wait, the condition held and it was sent immediately as a single item.

  The fix was to check “are there zero jobs that have not even come to wait yet.” When the number completely finished plus the number now waiting reaches the total, send. I also shortened the safety cap from 20 seconds to 6 seconds. If only one item comes, waiting 20 seconds every time would be longer than one X monitoring run (17.8 seconds measured) and delay the rounds.

  During this check, the first short circuit was also reviewed. In 6 hours, 28 of 47 calls (60%) were handled without calling the AI. The short circuit was working correctly.

## What I learned

- Do not write the “share it applies to” as the amount saved. If there is a free path before it, only the difference is saved.

- Deploying does not mean it ran. “0 batches” was found because I recounted. If I had decided in advance that a log should say “batched,” I would have noticed sooner.

- The three numbers (4.5%, −38 to 73%, 60%) are all not what I first estimated. They are numbers re-measured on real data after deployment.

  The numbers in this article come from my commit record (September 4 and 5, 2026). I do not write amounts of money.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/torecadash-ai/).

  More in English

- All English pages (https://koshinstudio.com/en/)
