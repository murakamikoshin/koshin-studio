# Seven records of cutting misses in crawling and monitoring: pagination, X monitoring, measuring coverage and waiting rooms

> Seven records of counting and cutting misses while crawling and monitoring lottery and first-come sales: aggregator pagination, gaps in X monitoring, how coverage was measured, intervals vs delivery, and waiting-room pages.

- URL: https://koshinstudio.com/en/notes/crawl-monitoring/
- Original (Japanese): https://koshinstudio.com/notes/crawl-monitoring/
- Published: 2026-11-07
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/crawl-monitoring/)

Development log of Toreca Dash / 7 records in one place

  Lotteries and first-come sales are over once you miss them. Toreca Dash crawls store sites, aggregator sites and X to watch for them. These are seven records of counting the misses and cutting them, including cases where the measurement itself was wrong.

  Each section was first published as a separate record (from 2026-10). Numbers and sources are as in the work logs of the time. They were gathered into one article per theme on 7 November 2026.

## An aggregator crawl read only page 1: card articles were on pages 2–4, and only the first 6,000 characters went to the AI

  Record from 2026-10-17.

One of my app Toreca Dash’s sources is an aggregator site for stock information, which lists lottery articles together. This crawl had two causes of “things that should appear but did not”.

  Written from my work log of 28 August 2026.

### Cause 1: only the first page of the list was read

  The function that reads the aggregator’s list of lottery articles (fetchNyukaNowChusenArticles) read only page 1. The 11 items on page 1 were mostly game consoles, a virtual pet and plush toys. The trading-card articles were on later pages.

    Kind of article | Where it was

      Pokémon cards | a later page

      Gundam card game | page 2

      Dragon Ball, Digimon, Duel Masters | page 3

      Union Arena, Weiss Schwarz | page 4

  Many existing articles derive from one Pokémon-card roundup, yet the crawl no longer read that article itself. The fix was to follow up to 12 pages.

### Cause 2: only the first 6,000 characters of the body went to the AI

  A Pokémon-card roundup lists 15 or more stores on one page. I gave the AI only the first 6,000 characters of the body, so the later stores dropped out entirely. That is also why the number readable per run wobbled 48, 39, 40.

  The fix was to read all of it in 5,000-character pieces with a 600-character overlap. The import itself uses the same function.

### Found the same day: dates with no year

  The aggregator’s table writes only “30 August (Sun)”. I was not giving the AI today’s date, so Pokémon-card items came back as 30 August 2020. A past deadline is rejected by the entrance gate, so Pokémon-card items from this route were not imported at all. After I put today’s date and “do not fill in a year before today” in the prompt, the open items I could read went from 0 to 46. (This is also told in another article (https://koshinstudio.com/en/notes/silent-failures/#s1).)

### What I learned

> Three cut points in an import: pages, characters, years.

- Read a list to its last page. What you want is not necessarily on page 1.

- Check that the AI’s character limit is not dropping the back half. A wobbling count is a sign.

- Pass the whole text, in order, with overlap. If you pass only the head, the rest drops.

- For dates with no year, give today’s date. Otherwise it fills in six years ago.

- “Not reading the source of existing articles now” is a sign of a gap.

## Four gaps in monitoring X: posts missing from search, accounts that change hands, a store-finding query, and catching up after an outage

  Record from 2026-10-17.

Of my app Toreca Dash’s sources, the fastest and the easiest to miss is stores’ own posts on X (Twitter). Stores announce lotteries and first-come sales on X first. The app patrols registered store accounts regularly.

  On 19 September 2026, four “gaps” in this monitoring turned up in a single day. This is the record.

  Numbers come from my work logs of 19–20 September 2026. Private individuals’ accounts are not named.

### 1. Some posts do not appear in search

  The monitor found posts through X search. But for four stores, lottery announcements did not appear even after fetching 751 posts without any keyword filter, nor per store. X search can omit part of a store’s posts.

  Reading the timeline (the store’s own list of posts) directly (profileTweets) worked.

  The nasty part: a store for which no article can ever be created stays “no track record”. Patrol priority and countermeasures are based on track record, so those stores are never included. What cannot be seen stays unseen (a chicken-and-egg problem).

  The fix: read store timelines in addition to search. But timeline reads cannot be filtered by words and every item read is billed. So stores with a track record are read daily, stores without it weekly, with a cap per store (10 and 8 items).

    Estimate | Value

      Posts per day, stores with a track record | 13.5

      Posts per day, randomly chosen stores | 4.5

      Monthly cost after adding | about $51 (the plan includes $39)

  Cost varies a lot with each store’s posting rate, so always estimate from measurements. It stops automatically once the month passes $62, and an automatic pace check estimates whether all stores can be read daily with the remaining budget, narrowing the stores if not.

### 2. A registered store had quietly stopped being a store

  Two accounts registered as “stores” in the monitoring list were no longer stores. One, registered in August as a branch of a second-hand shop, had become a person’s chatter. The other, registered in May, was an individual info account whose “[PR] lottery sale” posts became articles as if from a store.

  Articles appear as “store primary information”, so wrong information is notified as is.

  The list was checked only once, when registered. Nothing noticed when an account’s owner or use changed.

  The check: match the store name in the list comments against the display name on articles from the last 30 days, by a 2-character overlap. Of 828, I reviewed mismatches by eye and found 2 had become personal. Most mismatches were just “unknown” registrations that became official names, so I decided by eye, not by machine.

### 3. The store-finding search found only 11 of 63 stores

  New stores’ X accounts are found by search. The query was “store name genre name lottery site:x.com”, looking at the top 5 results. Out of 63 stores, it found X for only 11. Aggregators and customers’ posts ranked first and were rejected by the store-name match.

  Among 8 stores whose X account was known, the old method found 5 and the “store name site:x.com” query found 7 (all ranked first).

  But in a dry run right after widening the query, it picked up personal or unrelated accounts, because search-result titles contain the whole post and the match fired on the store name in the body. I changed it to extract only the display-name part of the title. More hits bring more mistakes at the same time. When you change a query, always run a preview and look at each item it picks up.

### 4. Catching up after an outage took half a day

  The data-fetching service’s (Apify) budget ran out, and X monitoring was down for 6 days. When I resumed, in 2 hours it read 185 of 2,866.

  Patrol is a rotation: “stores with a track record every 3 hours, others every 12 hours”. A rotation fits the normal state where everyone is about equally behind. After an outage, lateness is not uniform. Catching up would take more than half a day, and lotteries closing the next day would end before being read.

  For the same reason, newly found accounts joined the middle of the “no track record” list and went unread for up to 12 hours.

  The fix: add to the rotation a slot that reads the longest-unread items, oldest first. Attempt marks are kept separately so items that keep failing do not hog it. I also ran a manual catch-up right after resuming.

### Aside: a “this month only” budget stopped everything twice

  This catch-up was caused by the budget running out. I used to change the cap month by month, “this month only $44”, “automatically go back to $29 on 6 September”. If the value I went back to was below that month’s usage, all X monitoring stopped at the cycle start. It happened twice (28 August and 13 September).

  The decision on 19 September: one monthly cap of $70, and the interval not changed by month (all accounts once per 6 hours). Real monthly cost is about $10 to $18. I do not bring back a month-by-month cap.

### What I learned

> Posts you cannot see cannot be counted.

- Do not rely on search alone. Search does not return everything, and what is invisible raises no complaints.

- Registration is not a one-time check. Owners change. Compare the registered name with the current display name regularly.

- Preview when you change a query. More hits means more mistakes.

- After an outage, catch-up needs its own design. The normal rotation does not suit it.

- Do not change a cost cap by month. Forgetting to restore it, or restoring the wrong value, stops everything.

## Comparing with other sites to count gaps: the first “23% coverage” was a measuring mistake and the truth was 49%

  Record from 2026-10-17.

One goal of my app Toreca Dash is to show lottery information without leaving anything out. The best way to find gaps is to compare with other sites that publish the same information and count “what they have and I do not”.

  I did this in the early hours of 29 August 2026. The first number was “23% coverage”. But that was a mistake in how I measured. This article records the five problems found as the number moved from 23% to 49% and then 90%.

  Numbers come from my work log of 29 August 2026. I do not name other sites.

### First, I surveyed every competitor

  The request was: “remove every article competitors publish that this app does not”. First I surveyed every possible competitor. Whether I could import from each was decided by reading the robots.txt (the request to machines) and the terms of use in full.

    What I found | Count | Handling

      Sites I already imported from | 3 | Unchanged

      Site newly added this time (Site A) | 1 | Per-case entries, with application links

      Sites whose terms have no prohibition and can be imported | 2 | Compared by hand this time

      Explainer-style sites with no per-store list | several | Skipped: almost no difference

      Sites whose robots.txt and terms prohibit automated fetching | 2 | Not imported. Not allowed as application links either

      A site whose domain no longer exists | 1 | Removed from the list

  One site states the prohibition in Japanese at the very top of its robots.txt. That a machine can fetch it does not mean it should.

### The comparison site was finer-grained than mine

  The site I added (Site A) lists “store × product × deadline × application link”, 90 entries on a single page. My sources were per-article, A is per-case, and its application links are the external forms themselves (Google Forms, LivePocket, Lottery Rotobox, the store’s official X). It was a good counterpart both for counting and for filling gaps.

### Problem 1: a different way of writing a product name counted as “missed”

  The first number was 23% coverage. Reason one was how product names are written.

  Them  30th CELEBRATION BOX
Mine  Expansion Pack "30th CELEBRATION"
  Neither contains the other, so naive “contains” never matches. 60 entries were counted as missed because of this.

  But “same if contained” is not the answer. The name “30th CELEBRATION” is contained in “30th CELEBRATION Premium Deck Set”. That errs in the direction of counting a different product as “covered”, hiding holes.

  The fix: drop set-type words (expansion pack, high-class pack) and quantity words (BOX, n-piece set, n types), then link to a catalogue product ID. The order: exact match, then the longest catalogue name contained in their name, then the reverse only when there is exactly one.

### Problem 2: an expired article counted as “covered”

  Reason two was 5 entries. An article with a 29 July deadline at one store was paired with their 30 August case and reported as “article exists but hidden”. It was a different, earlier lottery. After these two fixes the true number was 49%.

### Problem 3: articles made to fill gaps landed on the wrong product

  Gaps are filled by creating articles. But I passed their product name to an AI as is. The AI linked “30th CELEBRATION BOX” to “30th CELEBRATION FUTURISTIC BOX”, priced at ¥27,500. 10 articles ended up on the wrong product.

  The counting side had already narrowed to one catalogue product. The right fix was to give the creating side my catalogue name: one judgement for counting and creating.

  While repairing, I made another mistake. I wrote product IDs truncated to the first 10 characters and created 10 articles with nonexistent IDs. My check printed IDs with slice(0, 10) to read them, and I used those short values directly. I fixed it at once, and the rule is now: never use an ID shortened for display in processing.

### Problem 4: application links other than t.co were always discarded

  The step that attaches application links to aggregator-derived articles passed each store’s URL through a link-expanding function. That function only looks at t.co (X’s short URL), because links in X posts are always shortened. Other sources hold application URLs in plain form. Through it, they gave 0 results every time and fell back to web search.

  Of 32 articles made from Site A, 17 pointed to the source site’s page rather than the application form. Sending users to the source site was something I had decided to prohibit.

  The fix: use plain, unshortened URLs as candidates directly (the usual check still decides adoption). For articles already made, I added a step that rewrites the application link on every comparison, and rewrote 16.

### Problem 5: articles hidden for “no deadline” had no way back

  A job hid aggregator-derived articles whose deadline was unknown. It only hid; even if the deadline became known later, it stayed hidden forever. It is the same shape as an alert that keeps ringing after the fix. For cases where the other site gives a deadline, I now set it and restore the article (articles hidden for other reasons are not restored). Two were restored.

  I also fixed how deadline times are handled. The parsed date was returned as a “Japan-time shifted” value and, saved as is, would have been a deadline 9 hours off. 23:59 Japan time is 14:59 UTC; I now return the real time.

### Result

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

### What I learned

> A flaw in the counting tool does not make the number look bad; it makes holes invisible.

- Doubt how you measure coverage. The first 23% was really 49%, and I got to 90%.

- Do not use “same if contained”. It counts a different product as covered.

- The other side’s entries can be wrong. Among the remainder was one such case.

- Make one judgement for counting and creating. Otherwise the product counted and the product created differ.

- Never use a value shortened for display in processing.

- A hiding process needs a way back, built together.

- Read the terms before importing. Being able to fetch is not being allowed to.

## A “1-minute” monitor checked each item once per 10 minutes: before speeding up, count the revisit interval and what was delivered

  Record from 2026-10-17.

For first-come sales (stock gone in minutes), speed is everything. So the first-come monitor in my app Toreca Dash was built to “run every minute”.

  On 7 September 2026 I measured its real reaction speed. It was about 10× off from what I had designed. And when I sped things up, something else got slower.

  Numbers come from my measurement log of 7 September 2026.

### “Every minute” was once per 10 minutes per item

    What I measured | Value

      Job interval | about 61 seconds (as designed)

      Items watched | 63

      Items checked per run | 4 to 9 (48 of 53 runs hit the time budget)

      Revisit interval per item | about once per 10 minutes

      First-come sales caught in 7 days | 3 (8,648 empty runs)

  “Runs every minute” feels fast. What users feel is how often each item is checked. If you can only check 4 to 9 of 63 per run, one pass takes about 10 minutes. The formula is items ÷ items per run × interval. I had never computed it, so “running but never winning” went on.

### Cause: equal sharing of a shared external API

  The Rakuten API I use to check stock allows one call per 1.5 seconds. Five jobs shared it equally, so the most urgent monitor got only 13%.

  The fix: while the urgent job runs, the batch jobs do not take slots. One trap:

- If the “yield” flag is raised and lowered around each call, it is taken back between calls. In one measurement, 13 of 20 runs were still stuck at “4 items”.

- Holding the flag for the whole patrol gave 30 to 33 items per run.

- Always put a wait limit on the yielding side, or it starves.

### Speeding things up slowed down the one I cared about

  The same day I shortened the intervals of several jobs. When I set the Amazon check to 5 minutes, the Rakuten Books instant-sellout monitor got slower.

     | Before | After shortening | After reverting

      Rakuten Books monitor completion interval | 60–80 s | 2 min 41 s / 3 min 52 s | 60–110 s

      Skips of that monitor (per 10 min) | 0 | 6 | 0

      Jobs waiting in the queue | 0 | 17–29 | 0

  The Amazon check takes 5 to 8 minutes per run, yet I set a 5-minute interval. When a run takes at least as long as its interval, the job occupies one of the concurrency slots (8) permanently, and other jobs wait. Reverting restored it.

### One more: “not screened” means “not notified”

  Before a first-come notification, listings are screened by price against the official price to catch resale. When units did not match, the screen returned “not screened”. A comment called it “safe, no guessing”.

  But an unscreened listing gets a “price unverified” mark, and notifications stop. Counting 148 first-come listings over 7 days:

    Result | Listings

      Notified | 41

      Skipped (official price unverified) | 25

  Of 55 displayed, 45% never got a notification. The article still shows in the feed, so audits do not see it and nobody complains. Making detection faster, from 10 minutes to 80 seconds, did not help while half of them silently fell out afterwards.

  And “cannot compare” was an assumption. The catalogue price of 5,280 yen divided by 12 packs per box is 440 yen, a normal single-pack price. That amount was already the price of one box. I could have compared it directly.

### What I learned

> The answer to “make it faster” is usually not “faster” but “find what is dropping out on the way”.

- Measure the revisit interval per item, not the job interval. items ÷ per run × interval.

- Count what arrived. Not articles created, but notifications delivered.

- Write down which way a gate falls when it cannot decide. If it falls to “users get nothing”, that is not the safe side.

- Faster can make something else slower. Concurrency slots are limited.

- Revisit what is marked “cannot compare”. Once units were aligned, it could be compared.

## When you cannot watch everything quickly: popular 128 of 427 sets run fast, and the fastest lane yields to the budget

  Record from 2026-10-17.

My app Toreca Dash searches shopping sites by set (a release unit of products) to collect first-come and pre-order information. There are 427 sets in all. I would like to watch them all quickly, but there are limits on scraping cost and on calls to external services.

  On the night of 7 September 2026 I decided on a policy, “watch only the popular ones quickly”, and built it. This is a record of what I sped up, what I gave up, and how I protected cost.

  Numbers come from my work log of 7 September 2026.

### Policy: three popular genres, latest and last two years only

  The policy: “for Pokémon cards, ONE PIECE cards and Dragon Ball, the latest sets and the last two years of sets are enough”. Three genres × the last 24 months is 128 sets, about 30% of all 427.

  The original per-set search walked all 427 sets in order, and one lap took different times per site.

     | One lap over 427 sets | Popular lane, 128 sets

      Amazon | 4 hours | every 30 minutes (about 450 s per run)

      Rakuten Books | 24 hours | 22 sets every 10 minutes, one lap per hour

      Rakuten Ichiba | 24 hours | 22 sets every 10 minutes, one lap per hour

      Yahoo! | 8 hours | 128 sets every 2 hours

  The popular lane runs on a separate cursor from the normal lane. Sharing one would disturb the normal lane’s progress.

  Two sites (Amiami and AEON Style) have no concept of a popular lane. They do not search by set but read a list page whole, all at once. There is nothing to narrow; going faster means shortening the interval, which is a cost question.

### Batching them stopped another monitor

  I caused a regression with Rakuten right after adding this, and fixed it on the spot. At first I ran Rakuten as “128 sets in one go every hour”. But Rakuten’s API allows one call per 1.5 seconds shared by all jobs, and the instant sell-out monitor alone uses 30 calls a minute, 75% of the allowance all the time. A batch took over 13 minutes, and meanwhile even the sell-out monitor was skipped as “previous run still going”.

  The same 128 sets per hour, scattered as 22 sets every 10 minutes, makes no pile-up. I also offset the minutes (Rakuten Books lane at :03, :13…, Ichiba lane at :08, :18…). Right afterwards: the sell-out monitor ran 8 times in 9 minutes with 0 skips, average 44.9 s, no worse.

### Fastest lane: popular items truly once a minute

  There was also a request: “I want popular items checked every minute.” That made the third time that day I confirmed what I wrote about before (https://koshinstudio.com/en/notes/crawl-monitoring/#s4): “runs every minute” is not “checks each item every minute”.

- Rakuten Books sell-out monitor: 62 to 92 items were un-notified, about 30 could be checked per run, one lap 3 minutes. Only 18 of them were in the three popular genres (Pokémon 9, Dragon Ball 5, One Piece 4). Checking those first on every run makes it truly once a minute, at zero cost. The other 44 are about every 3.7 minutes. Advance the cursor only for the rotating part; if popular items advance it, it stops there and other items never get a turn.

- Amazon fastest lane: 28 sets (popular genres, before release or within 60 days after), 10 sets per minute in rotation, one lap about 2.8 minutes. Measured: 27.4 s per run, 0 skips.

  I cannot hit all 28 sets every minute. At 40,320 requests a day, the month would be 1.96 million, above the 1.25 million contract. At 10 sets a minute it is 14,400 a day. In exchange I moved Amazon’s popular lane (128 sets) from 30 to 60 minutes.

    Amazon lane | Target | Cycle

      Fastest | 28 sets before / just after release | about 2.8 min

      Popular | 128 sets, three genres | 1 hour

      Normal | All 427 sets | 4 hours

### What I cannot do, I say I cannot

- Rakuten Ichiba: the sell-out monitor uses 75% of the 1.5-second allowance. Adding every-minute checks would break the monitor. The popular lane (every 20 minutes) is the limit.

- Yahoo!: once a minute is 40,000 calls a day, orders of magnitude over. Also new saves were recently 0. It stays at every 2 hours.

### The fastest lane yields when it exceeds the budget pace

  Amazon is a priority host that passes the scraping service’s daily throttling unconditionally, because it is the lifeline of the first-come race. That is right in itself, but if the every-minute fastest lane also passes unconditionally, Amazon eats the whole allowance and every other site is throttled.

  Rather than fix a count on the safe side, it is more reliable to look at actual consumption and stop automatically. I added a check (isScrapeDoOverPace()) that skips the run if the time-proportional budget pace is exceeded.

  Measured over a 2-minute window: 55 requests, 55 credits, 27.5 credits a minute (about 39,600 a day). The allowance was 1,147,389 remaining and 23 days to reset, 47,392 a day. One trap about window length: measured over 10 minutes it looked like 47.5 credits a minute (68,400 a day). A costly job every 3 hours (25 credits each) happened to fall in that window. Extrapolating from a short window is wrong; check the next day’s daily total.

### What I learned

> When you cannot speed up everything, decide what to speed up and what to slow down in return.

- Narrow the target. 128 of 427; even then only a narrower 18 or 28 can be truly once a minute.

- Do not batch; scatter. The same count with no pile-up does not stop others.

- With a shared allowance, faster for one means slower for another. Decide what to protect first.

- Make the budget yield by itself. Stopping on actual consumption beats a fixed count.

- Do not extrapolate from a short window. Confirm with the daily record.

## When first-come sales start, the site becomes a waiting-room page: a 15 KB notice slipped through an 8,000-byte gate

  Record from 2026-10-17.

My app Toreca Dash reads shopping-site pages to collect first-come and lottery information. As I wrote in an earlier article (https://koshinstudio.com/en/notes/silent-failures/#s4), my “was it fetched?” check had a hole and treated a notice page as success. On the very day I fixed it (7 September 2026), I found another hole of the same kind in a different shape.

  And it occurred at the moment when missing something matters most.

  Numbers come from my work log of 7 September 2026.

### When first-come sales start, the site becomes a waiting-room page

  A report came: “AEON Style Online seems to have first-come sales too”, “it seems to have started at exactly 14:00”. So I tried fetching at that moment.

    Method | Result

      Plain request | 403 (blocked by bot protection)

      Scraping service, cheap setting | 200, 15,188 bytes, title “Notice: heavy access”

      Scraping service, super | 200, 15,188 bytes, same

      Scraping service, super + render | 200, 15,459 bytes, same

  The instant a first-come sale starts, the whole site becomes a waiting-room page, and every setting returns the same notice.

### A 15 KB notice slipped through an 8,000-byte gate

  The “not fetched” check I had added earlier that day looked for a JavaScript notice inside pages under 8,000 bytes. Large legitimate pages also contain the same sentence.

  This waiting-room page is about 15 KB. It passed the gate and was read as “fetch succeeded, 0 products”. It failed silently at the moment I most needed it.

  The fix: look at the title, not the size. If the title contains “heavy access” or “we will guide you in order”, treat it as a failure. I limited it to the title so legitimate pages that merely mention those words are not caught.

  I also changed the frequency from every 3 hours to every 15 minutes. At about 21 credits a run it is costly, but about 6,000 credits a day stays within 92% of the remaining balance.

### Two more causes of slowness found the same day

  Amazon’s 13 minutes were AI screening, not fetching. The Amazon monitor ran every 30 minutes, one scan took 13 minutes and the worst delay was about 43 minutes. The meter showed the time went to AI screening of new listings (421 a day, about ¥10). Fetching itself cost only 1,047 credits a day. The cause was handling 15 genres one at a time. They are independent, so I ran 4 in parallel, with a 10-minute interval and 8-minute runs. AI screening runs only for new listings, so cost does not rise with patrol frequency.

  Even when found fast, 17% were not notified. Finding things sooner means nothing if notifications stop afterwards. Counting what was delivered showed another hole (see the article on counting notifications (https://koshinstudio.com/en/notes/crawl-monitoring/#s4)).

### What I learned

> A hole in a judgement widens at the most important moment.

- A notice page has more than one shape. Short ones and big waiting-room pages. Size cannot tell them apart.

- Changing where you look reduces collateral. Title, not body, so legitimate pages are not caught.

- When a report arrives, measure at that time, on the spot. “It started at 14:00” was the last chance to reproduce.

- Check where slow time really goes. Amazon’s 13 minutes were serial AI screening, not fetching.

## “Not just noticing; not letting it happen”: turning a report-only monitor into one that fills gaps on the spot

  Record from 2026-10-17.

The goal of my app Toreca Dash is to show lottery information without missing any. The user’s instruction was: “don’t just notice; make sure missing things do not happen in the first place”.

  This article records how, on 27 August 2026, I turned monitoring from “find and report” into “find and fill on the spot”.

  Numbers come from my work log of 27 August 2026.

### A report-only monitor does not fill until a person notices

  The old gap monitor (reportCoverageGap) only reported. The gap stayed until someone noticed and ran a fix by hand. I made it create articles on the spot (fill), three times a day after the import.

- It uses the existing creation path. Duplicates are prevented by the existing check (hasExistingCoverageForStore).

- If the import side works correctly, this ends with 0. Anything created here means the import side still has a hole. Read the count as “the size of the holes left”.

### I added a log to the branch that silently dropped things

  An early return in one function (touchLastSeenIfExists) was the only branch that moved on without saying anything. All other branches log. That silence is why another hole (24 stores getting the same article ID) was not found for so long. A branch that silently drops is a hiding place for holes nobody can see.

### Even with no link, show “how to apply”

  Of 32 articles with an unknown application link, 17 were not given a URL in the other table either (a store’s app, an in-store QR and so on). But the other side writes the “how to apply” and “conditions” in prose. I imported those and passed them to the application-method detector. “Apply in the app” or “apply with the QR code in store” helps more than “we do not know where to apply”.

### Articles missed by the link repair

  Articles marked “application link unknown” that were neither app-only nor pointing to an aggregator never became a repair target: only 15 of 34 were. I made the mark itself the condition for being a target.

### The final numbers

     | Before | After

      Gap coverage (against one site, 24 items) | 92% | 100% (96% on the way)

      Displayed articles | 1,444 | 1,488 (+44)

      Articles with an application link | 97.4% | 97.8%

  But 100% is a number for one site. A gap survey against the X aggregates found 3 stores, but the stored text was cut at 500 characters, so that is a lower bound. I decided to measure again after X monitoring resumed.

### What I learned

> Connect the mechanism that notices to the one that fills.

- A report-only monitor does not fill until a person notices. Fill on the spot.

- The count filled is “the size of the holes left”. 0 is the goal.

- Add logs to branches that silently drop. One silent place hides a hole for a long time.

- Without a link you can still show how to apply. “Apply in the app” beats “unknown”.

- Decide repair targets by the mark itself. A combination of conditions leaves gaps.

- 100% is a number for what you measured. Call it a lower bound.

## Key points of each

- An aggregator crawl read only page 1: The crawl of a stock-information aggregator read only page 1 (mostly consoles), while Pokémon and Gundam articles were on later pages. Only the first 6,000 characters went to the AI, so later stores dropped. I followed 12 pages and read all the text.

- Four gaps in monitoring X: Four stores’ lottery posts did not appear in search even after 751 posts; a registered store had become a person; store-finding found 11 of 63; and after a 6-day outage only 185 of 2,866 were read in 2 hours. Fixes and cost estimates.

- Comparing with other sites to count gaps: Counting whether I show lotteries other sites list: the first 23% was distorted by product-name spelling and expired articles. After fixing it, 49%; after fixing five gap-filling problems, 90%. Sites whose terms prohibit automated fetching were not imported.

- A “1-minute” monitor checked each item once per 10 minutes: A first-come monitor watched 63 items but checked 4–9 per run, so each item once per 10 minutes, and caught 3 sales in 7 days. Shortening other intervals slowed it further, and “not screened” meant 45% of first-come listings got no notification.

- When you cannot watch everything quickly: Full laps over 427 sets took 4 to 24 hours. A separate lane for 128 popular sets and truly once-a-minute checks for popular items; batching stopped another monitor and measuring over a short window misjudged cost.

- When first-come sales start, the site becomes a waiting-room page: On AEON Style Online, a first-come sale turned the whole site into a 15 KB “heavy access” page. It passed the 8,000-byte check added earlier that day and was read as “success, 0 products”. I switched to a title check; Amazon’s 13 minutes were serial AI screening.

- “Not just noticing; not letting it happen”: The gap monitor only reported and nothing was filled until a person noticed. I made it create missing articles on the spot, logged a branch that dropped silently, and showed how to apply even with no link. Coverage went from 92% to 100%.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/crawl-monitoring/).

  More development logs, by theme: Notes (https://koshinstudio.com/en/notes/). About the app: Toreca Dash (https://koshinstudio.com/en/works/torecadash/).
