# Five records of measuring, then cutting, AI and Firestore costs: a broken Gemini meter, 91% of reads in one place, and crawl costs

> Five records of cutting AI (Claude, Gemini), Firestore and crawling costs in an indie app: doubting the meter first, converting to yen, and counting where the money actually went.

- URL: https://koshinstudio.com/en/notes/ai-cost-cutting/
- Original (Japanese): https://koshinstudio.com/notes/ai-cost-cutting/
- Published: 2026-11-07
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/ai-cost-cutting/)

Development log of Toreca Dash / 5 records in one place

  For an app made by one person, the monthly bill matters. Toreca Dash pays for AI calls, database reads and page fetches. These are five records of measuring again before cutting, including the times “this should go down” turned out wrong.

  Each section was first published as a separate record (from 2026-10). Numbers and sources are as in the work logs of the time. They were gathered into one article per theme on 7 November 2026.

## Migrating from the Claude API to the Gemini API (gemini-3.1-flash-lite): 16 call sites into one function

  Record from 2026-10-08.

On the server side of my iOS app Torecadash, AI is used for things like deciding “which product an article is about.” On July 25, 2026, I fully migrated this AI from Anthropic’s Claude (Haiku 4.5) to Google’s Gemini (gemini-3.1-flash-lite). What I decided, how I unified the calls, and what I added after the migration are written from my hand-over notes.

  This site has a page for Torecadash (Works (https://koshinstudio.com/en/works/)). This is a development log. I do not write amounts of money.

### What triggered it

  According to my notes, the reason was that I reached Anthropic’s API usage limit and got an unplanned charge. Since then only Gemini has run, and I removed the Anthropic SDK and key from the code and from the secret store (Secret Manager). In a check on July 30, I confirmed there are 0 mentions of Anthropic in the code.

### How I chose the model

  I chose gemini-3.1-flash-lite. My notes also keep the reason for what I did not choose.

- Gemini 2.5 Flash-Lite, which is cheaper, was scheduled to be shut down on October 16, 2026, so I passed on it (according to my notes. When I reviewed the official deprecation list on October 8, 2026, this model showed “no shutdown date announced.” I have not confirmed whether the entry changed later).

- The shutdown date of the one I chose, gemini-3.1-flash-lite, is May 7, 2027. At the time of migration (July 25) that was still about nine and a half months away.

  If you choose only by price, it will be shut down soon and you migrate again. I added “when will it be shut down” to the selection criteria.

### 16 call sites into one function

  There were 16 places that call AI (deciding the sales format, matching products, discovering listings and so on). I unified them to go through one function (createGeminiInteraction) at the top of functions/index.js. Inside it calls client.interactions.create() from @google/genai.

  Callers pass arguments close to the original Anthropic form (system_instruction, max_output_tokens in generation_config, input) as they are. What comes back is text (output_text). I made it a form where only the inside is swapped, with almost no rewriting of callers.

### Web search had no “call count cap” setting

  In four places (discovering listings, discovering sellers, a Rakuten Books lookup and a list-price lookup), the AI does a web search. With Gemini I use tools: [{type: "google_search"}] (grounding with Google Search).

  Here was a pitfall. Anthropic’s web search had max_uses (a cap on the number of searches), but Gemini has no equivalent setting, and the model searches as many times as it thinks necessary. My notes say: “the absence of this setting can itself be a cause of unexpected cost.”

  So the day after migration (July 26), I added a circuit breaker with a daily counter inside createGeminiInteraction (up to 300 calls a day). When the limit is reached, it returns an error to the caller. In price review, I designed this error to be excluded and kept distinct from “could not find the list price” (I wrote about that in another article (https://koshinstudio.com/notes/silent-failures/#s7), in Japanese).

### A switch to stop it

  I added one more thing: AI_CALLS_PAUSED, a switch that stops all AI calls from one place. My notes include a reflection from July 25: “I thought I had stopped the calls, but they had not actually stopped, and the automatic job running every 10 minutes kept producing errors.” I decided that when the budget is about to be exceeded, I first set this to true and stop right away.

### A note when adding new processing

  Functions that call AI (Cloud Functions) must always have secrets: ["GEMINI_API_KEY"]. If you forget it, deployment succeeds and then it fails with a permission error.

### What I have not verified

  This article is written from the AI section of my hand-over notes. A before-and-after accuracy comparison of decisions is not part of the material. So I do not judge here whether Gemini is better or worse.

### What I learned

> If you gather calls in one place, the place to stop them is one place too.

- Pass every call through one function. The migration, the safety limit and the stop switch can all live in that one place.

- Count “there is no setting” as a risk. When you move to a service with no cap on call count, build the cap on your own side.

- Check that the stop switch really stops. Thinking you stopped but not having stopped is the most expensive case.

  This article is written from my hand-over notes (AI API information, July 25 and 26, 2026).

## “It should shrink” was wrong twice: cutting AI calls and what I measured afterward

  Record from 2026-10-07.

My iOS app Torecadash collects information on reservations, lotteries and first-come sales of trading cards (Pokémon, Yu-Gi-Oh!, One Piece) and notifies users. It uses an AI (Gemini) to decide “which product an article is about.” While trying to reduce calls to that AI, things I had written down as “it should shrink” were wrong twice. In order, with the numbers left in my commits:

  This is a development log of the app.

### What I ask the AI

  The article title (for example “30th CELEBRATION Premium Deck Set Espeon”) is matched against a list of recent product candidates (the latest 60), and the AI answers which product it is. One call is about 3,083 tokens, of which about 1,800 were the same fixed instruction text every time.

### First: if the title is exactly a product name, no need to ask

  If a title matches a known product name exactly, there is no need to ask the AI. When I added this “short circuit,” 43% of X monitoring matched in real data. There were 0 disagreements (the short circuit’s answer differing from the AI’s). So I recorded that it should cut about 45%.

  But 90 minutes after deployment, the short circuit had not fired even once. Recounting, it looked like this:

    Source | Could short-circuit | Already free before | Newly saved

    X monitoring | 813 | 768 | 45 (2%)

    Others | 419 | 188 | 231 (32%)

  Before this step, there was an already free path that checks against the official catalog. Most articles that could be short-circuited were already settled there. Adding up what is newly saved, it is about 39 calls a day, about 4.5% of the total. Not 45%, but 4.5%.

> The share a rule applies to and the calls it actually removes are different things.
  If there is a free path before it, you have to count the difference. That is what the lessons field in my commit says. The logic itself was correct and safe, so I kept it. But as an AI reduction, it was small.

### Second: ask in batches

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

### Third: deployed, and it never batched once

  Six hours after deployment, there were 47 product-matching calls and 0 batches. Although 2 to 7 calls came in the same minute, each was asked one at a time.

  The cause was the “send condition.” I had checked “number waiting ≥ number of unfinished jobs (pending),” but jobs that had come to wait were also counted in pending. X monitoring runs 32 accounts at once. If 31 had already finished, pending was 1. The moment the last one came to wait, the condition held and it was sent immediately as a single item.

  The fix was to check “are there zero jobs that have not even come to wait yet.” When the number completely finished plus the number now waiting reaches the total, send. I also shortened the safety cap from 20 seconds to 6 seconds. If only one item comes, waiting 20 seconds every time would be longer than one X monitoring run (17.8 seconds measured) and delay the rounds.

  During this check, the first short circuit was also reviewed. In 6 hours, 28 of 47 calls (60%) were handled without calling the AI. The short circuit was working correctly.

### What I learned

- Do not write the “share it applies to” as the amount saved. If there is a free path before it, only the difference is saved.

- Deploying does not mean it ran. “0 batches” was found because I recounted. If I had decided in advance that a log should say “batched,” I would have noticed sooner.

- The three numbers (4.5%, −38 to 73%, 60%) are all not what I first estimated. They are numbers re-measured on real data after deployment.

  The numbers in this article come from my commit record (September 4 and 5, 2026). I do not write amounts of money.

## I re-measured a “nothing can be done” assumption and scraping cost dropped to one eighth

  Record from 2026-10-08.

My iOS app Torecadash regularly visits sales pages on online shops and collects lottery and first-come sale information. Pages are fetched through an external service (Scrape.do), and each fetch setting uses a different number of credits. For one site, I re-measured something I had accepted as “it cannot be helped,” and it became 3 times faster using about one eighth of the credits. This is from my commit record.

  This is a development log of the app. I do not write amounts of money, only numbers of credits.

### The reason for “it cannot be helped” was cost

  I thought the fetch interval for two sites, AEON Style Online and Amiami, could not be shortened. The reason was that fetching was expensive. In other words, a conclusion based on an old unit price. I decided to measure it again.

### Fetching the same page with three settings

  There are three levels of fetch settings: a plain fetch (1 credit), render in a browser and then fetch (render, 5 credits), and render through a stronger route (super + render, 25 credits). I fetched AEON’s list page with all three and compared contents, two pages three times each.

    Setting | Credits | Size (bytes) | Products | Prices

    Plain | 1 | 649,734 | 20 | 25

    render | 5 | 663,026 | 20 | 25

    super + render | 25 | 669,510 | 20 | 25

  All three returned exactly the same products and prices. So rendering was a complete waste. I had been paying 25 credits for something that 1 credit was enough for.

### The fix

- Try the cheap setting first. For AEON, fetch plainly first. Only when the “access is busy” page that appears at the start of a first-come sale comes back does it escalate automatically to a stronger setting.

- Interval from 15 minutes to 5 minutes. Every 5 minutes is 288 times a day. For 2 pages, that is 576 credits. Before, it was about 4,600 credits a day (as stated in the commit). It is 3 times faster and uses about one eighth.

- I applied the same measured result to Amiami. Removing rendering took one fetch from 5 credits to 1, saving about 1,200 credits a day.

  But for Amiami I kept the interval at 15 minutes. That day it had hit timeouts twice, and one run took 284 seconds. Fetching overall was getting crowded, so I decided not to touch it. What I measured was “is rendering needed,” not “is it safe to shorten the interval.”

### What I learned

> When was the number behind “it cannot be helped” measured?

- Re-measure old conclusions. Unit prices, settings and how sites are built all change. “AEON cannot be helped” turned out not to be true when measured.

- Strong settings tend to get added “just in case.” Whether they are needed can be seen by comparing results. If the results are the same, the cheaper one is enough.

- When you fix one thing, check the other conditions. The same measurement fixed Amiami’s setting, but I left its interval because of a separate issue (timeouts).

  The numbers in this article come from my commit record (September 7, 2026). “4,600” is as written in the commit and is a little off from the calculation of 25 credits × 2 pages × 96 runs (every 15 minutes) = 4,800.

## Firestore cost in yen: 91% of reads came from one place, and my first cache did not work

  Record from 2026-10-17.

The back end of my iPhone app Toreca Dash (a Japanese trading-card lottery and restock alert app) runs on Firebase’s Firestore database and a set of scheduled jobs. I had been reporting the cost of Gemini (AI) and of a scraping service in yen every day. I had not been reporting Firestore at all.

  On the night of 4 September 2026 I converted it to yen for the first time. It was almost the same as Gemini. This is the record of how I found that 91% of the reads came from one place, why my first cache did not work, and how I fixed it again.

  Numbers come from my work log of 4 September 2026. Prices are the real Tokyo-region prices.

### Once it was in yen, there was a cost nobody was watching

    Day | Reads | Writes | Cost per day

      28 Aug | 2.18 million | 120k | ¥226 (about ¥6,777 a month)

      1 Sep | 3.66 million | 134k | ¥368 (about ¥11,028 a month)

      3 Sep | 4.21 million | 162k | ¥427 (about ¥12,810 a month)

  The free tier is 50,000 reads a day. I was reading 84 times that, and it had grown 89% in a week, growing with every new article. A cost that is not shown in yen might as well not exist: about ¥13,000 a month, and nobody noticed because it was not in the report.

### A meter found it in three minutes

  I added a meter that counts which job reads which collection, and how much. The answer came as soon as it was in.

  8,725 reads  X monitor | products   ← 91% of the 9,593 measured
  197 reads  X monitor | news_items
  For each post, the X monitor asks an AI “which product is this about?”. To build the candidate list it re-read every product of the genre each time. The Pokémon genre has 693 products, so matching one post cost 693 reads. If I had searched the code, it would have taken much longer. Count before you search.

### The first cache barely helped

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

### Another one: reading 3,085 documents every 5 minutes and using 146

  After the product cache, the next item at the top of the meter was a job that rechecks Rakuten Books stock every 5 minutes with this query:

  news_items where saleType in ["reservation", "guerrilla"]
  It returned 3,085 documents and then filtered to Rakuten Books in code. Only 146 were relevant: 95% was wasted. At 288 runs a day that is about 888,000 reads, roughly ¥2,400 a month.

- Cache the target list (only references and ISBNs) for 2 hours.

- But re-read the fields used for decisions every time, so I never write based on stale values. It is only 146 documents, so it is cheap.

  Reads fell from 888,000 to about 79,000 a day (−91%).

### What I learned

> A cost you do not show in yen does not exist.

- Fix the meter first. A cost you do not look at can grow unnoticed.

- Count before searching. One “job × collection” tally showed where 91% went in three minutes.

- For concurrent code, cache the pending promise. A cache of finished results lets everyone who arrives together walk past it.

- Filter before you read. Reading everything and keeping 5% is paying to throw away 95%.

- Confirm final numbers the next day. “5.07 million to 277,000” was a quiet-period measurement.

## Before cutting Gemini cost, I doubted the meter: price, breakdown and cache were all wrong, and the cache threshold changed when I re-measured

  Record from 2026-10-17.

My iPhone app Toreca Dash uses Google’s Gemini (AI) to classify posts and match products. You pay for what you use, so I have worked on the cost several times. This is the record of two of those rounds.

- 4 September: before cutting anything I checked the measurement, and all three parts were broken.

- 16 October: I re-measured when the cache works, and it disagreed with my September conclusion.

  Numbers come from my work logs of 4 September and 16 October 2026. The model is gemini-3.1-flash-lite.

### Three parts of the meter were broken

  I was asked to cut cost. The first thing I did was not cutting, but checking whether the numbers were right. Cutting with a broken meter means cutting the wrong things. I found three faults.

    Fault | What happened

      Wrong prices | The code used $0.10 input and $0.40 output per million tokens. The real prices are $0.25 and $1.50, so cost was under-reported by about 2.6×.

      Labels collapsed | The per-purpose tally read a key that does not exist (params.system; the real one is system_instruction). 31 purposes were merged into one lump, so I could never see which prompt was expensive.

      Cache not counted | 31% of input was cache hits at 1/10 the price, but everything was counted at full price, about 40% too high.

  One more thing: the “second most expensive” item, “(outside jobs)” at ¥195 a day, was not a production problem. It was me running things by hand. When judging production, exclude manual runs.

  With the meter fixed, the cost was about ¥606 a day (¥18,168 a month); minus the cache, about ¥13,200 a month. Nearly all of it was input tokens: the instructions and candidate lists I resend every time.

### September: the cache starts above about 8,000 tokens

  Gemini discounts repeated long prompts (implicit caching) from the second call, at 1/10 the price for the cached part. I sent the same instruction three times at different lengths.

    Prompt length (input tokens) | Cached tokens

      5,209 | 0

      8,490 | 4,079

      17,070 | 12,263

  The conclusion then was “it works above about 8,000 tokens”. Effective tokens are input − 0.9 × cached. Padding a prompt to reach the threshold costs more: stretching 4,200 tokens to 8,500 gives 4,814 effective tokens, more than before. The cache only pays off for prompts that are already large.

### October: the threshold was about 4,000 tokens

  I measured again with the production key, this time through the interactions API. The result differed from September.

    Prompt length (input tokens) | Cached tokens

      1,770 | 0

      4,093 | 2,031 (from the 2nd call)

      7,017 | 4,076

  It worked from about 4,000 tokens, in chunks of about 2,038 tokens. September said 8,000, October said 4,000. I have not found out why. A difference in how I measured or a change on the service side are possibilities, but I do not know which. What I do know is that the cache threshold is not a fixed fact; re-measure it.

  My production prompts were 1,000 to 2,500 tokens, so the fixed part never reached the threshold and hits were 0 all day. Input is almost all of the cost (output about 1%), so a working cache looked like a big saving.

### Padding the prompt shifted 9% of the answers

  I tried stretching the prompt to about 2,300 tokens with “notes that do not affect the judgement”. I compared old and new answers on 90 real cases.

- 8 answers (9%) differed, between “other”, “lottery” and “first-come sale”.

- At about 2,600 tokens it still did not hit the cache.

  It lowers accuracy and does not even get cache hits, so I withdrew it and never shipped it. Text that “does not matter” still changes an AI’s answers. Do not add it without checking.

### What is left

  On real data the biggest single item is product matching: on average 7,151 input tokens, 297 times a day, about ¥83. Narrowing candidates, batching and skipping the AI when the title equals the product name are already in. Going further means fewer candidates, that is, less accuracy, so I left it.

  If I cut more, it will be by shortening prompts, checking agreement on real data one at a time, and not chasing the cache with padding.

### What I learned

> Before cutting cost, doubt the tool you cut it with.

- Do not write prices from memory. Check the official price page. The 2.6× under-report was a copied price.

- Print one real breakdown and look at it. 31 purposes collapsed into one still add up to the right total.

- Check that your own work is not in production numbers.

- Re-measure conditions. September’s 8,000 was October’s 4,000.

- Test “harmless” changes on real data. 90 cases showed a 9% shift.

## Key points of each

- Migrating from the Claude API to the Gemini API (gemini-3.1-flash-lite): Moving an iOS app backend from Claude Haiku 4.5 to Gemini 3.1 Flash-Lite: choosing by deprecation date, one wrapper, a search cap breaker, a kill switch.

- “It should shrink” was wrong twice: Reducing calls to an AI in a trading-card app: a predicted 45% cut was 4.5%, and batching ran zero times after deploy. What I found by recounting, with numbers.

- I re-measured a “nothing can be done” assumption and scraping cost dropped to one eighth: I believed two sites could not be fetched more often because of cost. Comparing three Scrape.do settings showed rendering was wasted: 3x faster, 1/8 the credits.

- Firestore cost in yen: Seen in yen for the first time, Firestore cost about ¥13,000 a month, close to Gemini. 91% of reads were a product list re-read for every post. A 60-second cache failed because 32 jobs ran at once; caching the pending promise fixed it.

- Before cutting Gemini cost, I doubted the meter: The cost meter was broken in three places (prices under-reported 2.6×, 31 purposes merged, cache uncounted). The cache threshold was about 8,000 tokens in September and about 4,000 in October. Padding the prompt shifted 9% of answers.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/ai-cost-cutting/).

  More development logs, by theme: Notes (https://koshinstudio.com/en/notes/). About the app: Toreca Dash (https://koshinstudio.com/en/works/torecadash/).
