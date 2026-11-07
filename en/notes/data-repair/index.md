# Seven lessons from repairing bad data: existing records, bulk-job accidents, counting duplicates and the notification gate

> Seven real lessons from repairing bad data: fixing the gate does not fix existing data, cleanup can hide entry bugs, a bulk job that hit everything, how duplicates were counted, and notifications that cannot be undone.

- URL: https://koshinstudio.com/en/notes/data-repair/
- Original (Japanese): https://koshinstudio.com/notes/data-repair/
- Published: 2026-11-07
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/data-repair/)

Development log of Toreca Dash / 7 records in one place

  Fixing the entry point does not fix data that already got in. And when something cleans up afterwards, the entry bug becomes invisible. These are seven real mistakes made while repairing data, and the procedures decided from them, in the order they happened.

  Each section was first published as a separate record (from 2026-10). Numbers and sources are as in the work logs of the time. They were gathered into one article per theme on 7 November 2026.

## A bulk update hit “all articles”: count before you write, and break your tests to prove they work

  Record from 2026-10-08.

In my iOS app Torecadash, a new job that fixes article status in bulk hit every article, including ones I never meant to target, the first time I ran it. 18 items from other sites were wrongly restored to visible. This is how I fixed the accident, and how I checked that the test I built afterward to close the same hole actually works, from my hand-over notes.

  This is a development log of the app.

### What the job was for

  The app has a “price gate” that checks whether a listing’s price is reasonable (I wrote about it in another article (https://koshinstudio.com/en/notes/silent-failures/#s7)). Among articles hidden by this gate only because of price, I added a job that restores those that were actually correct and had been hidden because of a product mix-up. The condition for restoring is “the correct product’s list price matches the listing price.”

### The accident: it hit all articles

  At first this job hit all articles without distinguishing the source. As a result, 18 articles from other sites (Amazon, Card Labo, Ministop and others) were restored to visible. They should have stayed hidden.

  There were two fixes.

- Narrow the scope. I limited the job to articles from that source only (those whose site identifier starts with that source).

- Put back what I had restored. I identified the 18 wrongly restored articles from the status history (statusHistory) and put them back to their original state (hidden, rejected by price).

  But there was something I could not get back for these 18. The job had overwritten the original list-price field with the listing price. The value stays as the listing price.

  The cause was that I had not counted the target range before writing. My notes say so: “count the target range before a bulk write.”

### Building tests to close the same hole

  To make sure the problems found in that day’s inspection (wrong splitting of 9-pack sets, single cards slipping in, non-card products slipping in) never happen again, I built tests: 66 cases in catalog-guards.test.js, and all six test files together can be run in one procedure (run-all.sh).

  I also added warnings to my daily operations notice: when the miss rate of matching falls below the criteria (Chusen Zukan 80%, Pokechu 75%, X roundup 75%), when nothing has run for 30 hours, and when single cards or non-card names appear in the product list. The judgments are pure functions with no side effects, so once things are fixed, the warning disappears by itself on the next run.

### Breaking it to check that the tests work

  You cannot tell whether a test works just by writing it. A test that always passes may protect nothing. So I took a copy of the production code and removed its rules one at a time to confirm the tests fail.

- Remove one rule (break it).

- Run the tests.

- If they fail, the test is protecting that rule.

  With this procedure, I tried 6 kinds of modification, and the tests failed for all 6 (all were detected).

  I also wrote down an operating rule: if I touch functions/index.js, I always run all the tests before deploying.

### What I learned

> Count before a bulk write. Break the test to prove it.

- Before writing, count “how many it will hit.” If you run it without a preview, you notice the range was wrong only after it has finished writing.

- Write in a form you can undo. I could restore the 18 because I could identify them from the history. The overwritten field, though, cannot be restored.

- Prefer a test that fails when broken to a test that passes. Only after removing a rule and seeing it fail can I trust the test.

  This article is written from my hand-over notes (§272) (October 7, 2026). The counts are as written in the notes.

## I counted “duplicates are practically zero,” but the audit reported 112 pairs

  Record from 2026-10-08.

My iOS app Torecadash has a job that merges “duplicates,” where one product is registered as several products, every night. One day I counted by myself and recorded “duplicates are practically zero.” But the repository audit reported 112 pairs. My way of measuring was wrong. This is the story from my commit record.

  This is a development log of the app.

### I counted zero, and 112 pairs appeared

  Looking at the 112 pairs, for example one trading-card booster pack was registered split into 7 entries, even though the merge job was supposed to run every night.

### Cause: it timed out partway through, every night

  Running the merge over all genres takes about 15 minutes. But the time budget I had given the nightly scheduled run was 480 seconds (8 minutes). The order always starts from the same genre (Pokémon). So every night it timed out in the middle of Pokémon, and the later genres were never reached.

  My count was “zero” because only the range I was looking at (the first genre) was clean.

### The fix

- Rotate. Start from the genre after where the last run stopped, and stop when the time budget (6 minutes) is used up. The next night continues from where it stopped.

- First, run it to completion by hand. Running all genres to the end by hand took duplicates from 112 pairs to 0 and products from 2,753 to 2,570.

### What I already knew: one pass is not enough

  Two days earlier (September 5), I had learned something else about merging. When A is merged into B, B’s name can become the same as another C. Then one pass is not enough. In real data:

    Pass | Merged | Result

    1st | 138 | 53 new same-name pairs appeared

    2nd | 54 | 0 same-name duplicates

  Products went from 2,935 to 2,713. So the daily slot now repeats until nothing is merged (up to 3 times). This “timeout” problem sat even before that repetition.

### Three more things the same day

- Six open lotteries had disappeared because of another product’s list price. A 7,200 yen lottery (the official 360 yen × 20 packs) had been compared with another product’s list price of 27,500 yen left on the article and rejected by price. I added a condition: “fix only when it can be proven.” Across all real data, 10 matched the condition and all were sales at a normal price. I restored 11 to visible.

- False alarms in matching. Of 17 “article exists but hidden,” 9 had a replacement article visible under a different spelling of the same shop (like two different kanji spellings of the same store name). If the replacement is visible, it now counts as covered, which moved coverage from 87% to 90% and hidden items from 17 to 4.

- The audit itself had stopped. The reader part for audits misread a regular expression right after => as a division, and four audits were failing with ReferenceError. I changed it so that names it could not cut out are reported with a reason instead of being skipped silently.

### What I learned

> When you count “zero,” first doubt what you counted.

- The range you looked at is not necessarily everything. Only the first genre was processed every night, so counting only the first genre looks clean.

- For time-limited jobs, check whether it finished. Running and reaching the end are different.

- The tool that counts also breaks. When an audit has stopped, the result looks like “0 items.” You need a way to notice that it stopped.

  This article is written from my commit record (September 5 and 7, 2026).

## “It gets cleaned up later” hid an entrance bug: 400 near-identical products were re-created every day

  Record from 2026-10-17.

My app Toreca Dash has a nightly clean-up job that merges duplicate products. “It will be cleaned up later, so it is fine.” That was the belief, and in that place an entrance bug was re-creating near-identical products every day.

  A full check on 27 August 2026 showed that 437 products had been created that day alone, and 410 of them had no articles attached.

  Numbers come from my work log of 27 August 2026.

### The cause: it only looked for an exact name match

  The step that registers products from the official catalogue decided “does this product already exist?” by exact name match only.

  Existing "Expansion Pack「Ancient Roar」"  ↔  Catalogue "Expansion Pack Ancient Roar"
Existing "V Starter Deck Grass (full-width space) Bulbasaur"  ↔  Catalogue "V Starter Deck Grass Bulbasaur"
  Differences in brackets, spaces or full-width versus half-width made it say “not there yet”, and near-identical products were re-created every day.

  The duplicates were later cleaned up by the weekly and daily merge jobs. That is why I did not notice. In between, users see the same product twice and article links split.

  The fix was to compare with the same normalisation the merge job uses (it absorbs brackets, spaces and full/half-width). The catalogue itself also has spelling-variant duplicates, so within one run I keep one per key.

  The lesson: a mechanism with a clean-up job “for later” hides entrance bugs. If the clean-up count is about the same every time, it is not that things are cleaned; they are being created every day.

### Another: six products absorbed into one

  Six Magic: The Gathering “FINAL FANTASY” Commander decks (Psionic Spell, Limit Break, Counter-Blitz, Trans-Reanimate and others) were all absorbed into one product.

- Another set’s name gets into a product’s aliases.

- It shows up as an AI candidate.

- It leads to the next wrong match.

  That is a self-multiplying loop. Cleaning the aliases alone did not fix it, because the AI kept choosing the same product. I added a filter that removes products whose quoted proper name differs (namesDifferentQuotedVariant) to the candidate list too. With it gone from the candidates, the AI can answer “new product” and the correct one is created.

  To remove false positives, when the quoted text is a generic word, place name, store name, quantity or state, it is not treated as a proper name. On real data, before this condition 6 of 12 were false positives.

  There was also an idea I did not adopt: a strong rule “delete if the product’s proper name is not in the aliases”. 6 of 43 were false positives (different sets with the same code, names containing “+”), so I dropped it.

### My own repair put a deadline on first-come sales

  I ran a repair job that inherits dates from articles of the same announcement page (inheritDatesFromSameAnnouncement). It gave a first-come sale (sold until stock runs out) the deadline of a lottery article on the same page. A first-come sale has no deadline, and users would see a false “you can buy until that day”.

  In both places that inherit (the save-time step and the repair job), first-come articles no longer get a deadline. I deleted the one that had been affected.

  The lesson: after running a repair job, compare the audit before and after. Looking only at “how many were fixed” hides anomalies you added yourself.

### What I learned

> A later clean-up hides entrance bugs.

- If the clean-up count is the same each time, they are made daily. It is not being cleaned up.

- Use the same normalisation at the entrance and in the clean-up. If the entrance is stricter, the clean-up covers for it.

- Cleaning aliases alone does not stop self-multiplication. Remove it from the AI’s candidates.

- Count false positives before a strong rule. 6 of 43 means dropping it.

- Compare audits before and after a repair. To find the anomalies you added.

## “Weird articles keep multiplying”: I counted by creation route and closed the entrances, and my counting was wrong twice

  Record from 2026-10-17.

For my app Toreca Dash the instruction came: “weird articles keep multiplying. No deadlines, so many odd articles. Solve it permanently. Investigate the articles made by other routes thoroughly too.”

  This article records counting articles by the route that created them and closing the entrances, and also how I got the counting wrong twice.

  Numbers come from my work log of 28 August 2026.

### I counted by route

  Articles are created by several routes (stores’ official X posts, store sites, aggregator sites, AI discovery). I counted what kinds of “weird articles” each route had.

    Route | Lotteries | No deadline | Link is a search result | Link is a top page | Link is the aggregator itself

      X (store official) | 118 | 11 | 0 | 1 | 0

      Store site (direct) | 63 | 1 | 1 | 0 | 0

      Aggregator A | 39 | 33 | 3 | 2 | 8

      Aggregator B | 28 | 11 | 0 | 1 | 5

      AI discovery | 4 | 2 | 0 | 0 | 0

      Total | 252 | 58 | 4 | 4 | 13

### I corrected my counting twice

- First I counted over all articles and said “1,204 of 1,398 have no deadline (86%)”. A deadline is a concept only for lotteries. First-come sales (1,055) and reservations (91) never had one. I had counted without checking what the field means.

- I wrote “the saved chunk is another store’s (98%)”, but in fact the full post text was stored and it just happened to begin with Amazon. I asserted from the leading marker alone.

### Holes found and fixes

  1. Ended rounds left in the aggregator’s table were imported every day (33)
  The aggregator keeps past rounds in its table. In real data, a store’s “13–14 July” was imported on 27 August; the deadline was in the past and not adopted, giving an article with an empty deadline. With no deadline, the mechanism that removes articles past their deadline never acts, and it stays forever.

  I closed the entrance in three layers:

- Read the acceptance period as a date and skip rows that have ended.

- If a deadline cannot be read, do not create the article.

- If the store’s row has ended, do not create it.

  Checked in practice: I cleared the mark, re-ran the import, read 24 stores and got 0 new.

  2. The application link was not an application page (5 reports)
  A search-results page (?keywords=) or a site’s top page had been adopted. I added “looks like a search result URL” and “looks like a site top page URL” checks to the single gate that adopts application links. Every route goes through that one gate, so the fix works there alone.

  3. The article holds the full post text, so a reader who forgets to cut reads the first store (39)
  The article’s source text (sourceText) now holds only that store’s chunk. The full text goes into a separate field for verification. Whatever the reader does, it cannot pick up another store’s value.

  4. The deadline disagreed with the store’s own row (5 of 6)
  A deadline is looked for in “the text chunk, the page linked, the attached image”, in that order. But the last two are not necessarily that store’s information. In real data the saved deadline and the store’s row differed by 53, 18 and 20 days, each a finished lottery shown as open.

  I made a function that returns a value “only when an end is stated explicitly” and, at the end of fixing a deadline, a gate: if it disagrees with the row, trust the row. One caution: a function that also returns the date for a row that only has a start, like “from 19 June”, must not be used as is to overwrite.

### Clean-up starts with a dry run

- The job “hide articles with no deadline”: 33. Before running, I read each one’s own row period and confirmed all 33 had ended and 0 were open, then ran it.

- The job “align the deadline to the row”: 5. It does not hide; if the date has passed, the existing past-deadline mechanism removes it.

  Both repairs now run automatically every day at 4:20 and 4:30 (from 190 to 192 jobs).

### Result

     | Before | After

      Displayed lotteries | 252 | 199

      No deadline | 58 | 25

      Aggregator A with no deadline | 33 | 0

      Shown past the deadline | 5 | 0

      “Other site ended, mine open” | 12 | 7

  The remaining 7 are likely cases where mine has caught the newer round (the other table is out of date).

### What I learned

> Count by route, and doubt the counting itself.

- Count by route. A table shows where weird articles enter.

- Check what a field means before counting. A deadline is only for lotteries.

- Do not assert from a leading marker. The full text was stored.

- If no deadline can be read, do not create the article. Articles with an empty deadline stay forever.

- Make it impossible to pick up another store’s value. Do not rely on the reader’s care.

- If they disagree, trust that store’s row. The linked page and image are not necessarily that store’s information.

## Fixing a gate does not fix existing data: a “tried already” mark, a URL marker and a lookup table

  Record from 2026-10-17.

While developing my app Toreca Dash, I kept getting the same report in the same shape: “I fixed it, but it is not fixed”. The code is fixed, the tests pass, yet the screen still shows the mistake.

  The reason: fixing code does not rewrite data that is already saved. These are three forms of it, with real cases.

  Numbers come from my work logs of 26 August, 3 September and 8 September 2026.

### 1. I loosened a gate, but a “tried already” mark remained (3 September)

  A product-matching gate had a mistake. I fixed it and deployed. Yet 12 of the 32 existing articles stayed wrong.

  The reason was the “skip mark”. When the gate once says “this pairing is wrong”, the article gets a “tried already” mark and is not retried for 7 days. Fixing the judgement does not revisit it while the mark lasts. Among those 12 were 4 open lotteries closing on 5 and 6 September. Lotteries close in days, so waiting for the mark to expire means they vanish. The same day I found the same shape again (a 14-day cooldown in a process that splits into multiple products).

  The fix: before skipping because of a mark, re-check with the current judgement. If the judgement is a pure function that uses neither AI nor external calls, it costs nothing. If you also store “what material I judged with” (for example whether I looked at the image), you can retry only when new material appears.

### 2. A state marker was stored in the URL (3 September)

  Split articles (children) need a marker saying “already split”. At the time I put it in a part of the URL (?_product=product-name): “never split again if this is present”.

  But this project later rewrites application URLs to the store’s official page. The same day I started running that rewrite over everything. Anything stored in the URL is certain to be lost. Of 832 child articles, 111 lost their marker, looked like “parents not yet split”, and were split again. Broken articles pointing at themselves as the “replacement” went from 8 to 14 in 30 minutes. In the past, the same route had once made 1 article into 18.

  The fix was to decide using a field that does not get rewritten, such as splitFromArticleId. The other lesson: on a day you let “a process that only applied to some” run over everything, check what depends on the fields that process rewrites.

### 3. Removing a key from a table does not remove written values (26 August)

  I removed a store chain from the “nearest branch” lookup table. It was gone from the code. But the “nearest branch key” written on articles stayed. The app thought “there is a key, so show a distance”, prepared it and got no answer (the server returns 400 for an unresolvable key). Three articles were stuck forever.

  A change to a table is a change to code; migrating data does not happen automatically. When you remove something from a table, clean the existing data in the same change. This pairs with the mistake of adding a new hidden flag and forgetting to add it to the restore step: that is a miss on the adding side, this is a miss on the removing side.

  Cleaning can reveal new anomalies in audits. Those are real holes that were hidden. I did not restore the key to hide them.

### Five reports of one shape (8 September)

  On 8 September, five of the seven things found by running all 61 audits had the same shape: “a mechanism exists to fix it, but it does not reach the target, or never gets its turn”.

    Symptom | Root

      Opening days mixed into store names (4th report) | The fixer and the gate were different functions; the comment “same yardstick” was false

      A notification opens an article that does not exist (322) | The mark (split) was missing from the target query of the filling job

      Official events still displayed | The rejecting gate existed, but its re-apply never got a turn

      Wrong-unit reference prices (24) | The fix was buried in a 25-job rotation, one lap 2.5 days

      “19 deferred to the next run for time budget” | A cheap fix shared a budget and rotation with an expensive one

  A gate protects only new articles. Fixing existing articles is a separate process, and if that does not run, “fixed but not fixed” repeats. When the same report keeps coming, you have usually fixed the entrance but not the exit (existing data).

  The shared solution was to take “re-apply the save-time gate to existing articles” out of the rotation and run it every time. It reads articles once and passes them through the gate (no AI or external call; at most 20 articles and 50 marks per run).

### What I learned

> When you fix the entrance, fix the exit (existing data) too.

- When you add a gate, check that its re-apply runs every time. A gate protects only new articles.

- Re-check “tried already” marks with the current judgement. Waiting for expiry means the lottery is over.

- Put state markers in fields that are not rewritten. URLs get replaced later.

- When you remove from a table, clean the data. A code change does not move data.

- When a report comes twice, suspect the exit. Fixing the entrance is not enough.

## Four times my own tools hurt me: a summary dropped conditions, one undefined stopped saving, a check locked out production, alerts that never cleared

  Record from 2026-10-17.

Besides external bugs, my app’s development has had several cases where something I built, or a check I ran, harmed me. These are four of them, each fixed once numbers made it visible.

  Numbers and dates come from my work logs between 28 August and 15 September 2026.

### 1. “About 15 characters” dropped the entry conditions (14 September)

  The app asks an AI to summarise lottery entry conditions (follow and repost, membership card needed, etc.) for display. I compared 671 displayed lotteries with the original posts (text and images) using an AI.

  I found more omissions than contradictions.

    Missing condition | Count

      Repost | 23

      Membership | 20

      App | 13

      LivePocket (entry service) | 13

  The cause was the prompt. It asked for “about 15 characters”, so the AI cut conditions to one or two. A rule “do not write receiving or purchase conditions” was stretched to drop even “membership card checked at purchase”, which is an entry condition because you cannot buy without it.

  A length limit makes an AI choose what to drop; a drop rule drops boundary conditions too. The fix: “include everything, up to N characters”, and list what must stay. In the check itself, I did not stop at counting AI verdicts, but checked representative cases against the original image, since an AI review is noisy.

### 2. One undefined value made every save fail (28 August)

  A job wrote back a whole map of scraping-service settings at once. One day the write failed every time with:

  Cannot use "undefined" as a Firestore value (found in field "domains.`www.yamada-denkiweb.com`.super")
  One undefined in one site’s entry made every later save fail.

  The damage showed up elsewhere. A record meaning “pause sites that cannot be fetched with any setting for 6 hours” could not be saved. One site was hit on every patrol with three settings (1 + 10 + 25 = 36 credits), burning 13,183 credits in a day, 41% of that day’s total. The service spreads its daily budget over time of day, so when one site uses 41% of a day, less is left for the others.

  The lesson: when you write a whole map back, one dirty value breaks the whole save. Strip undefined before writing, and make failed saves loud.

### 3. My check locked my production IP out (15 September)

  I ran a stock-check script from the same server as production. It opened 501 Yahoo Shopping product pages six at a time with plain requests. Within minutes the server’s IP address got HTTP 489 (access denied) and it did not clear for hours.

  Production imports and stock rechecks read Yahoo from the same IP. My check blinded production. The check also sent pages it could not read to the scraping service, burning credits.

  The rule now: when reading shopping sites in bulk from the production server, one at a time with a pause after each. Run a handful first and check the status is still 200. For stock, check the structured data in the page on a small sample and leave the full check to the production recheck job.

### 4. Four alerts that kept ringing after the fix (29 August)

  I have added many alerts. In one night on 29 August, I fixed three alerts that kept ringing although there was a way to resolve them, and made a fourth myself: a mark for “AI credit ran out” that stayed for 24 hours even after I topped up.

  The same shape had appeared before:

- A data-fetching cost alert that “always exceeds 80% at month end”.

- A scraping-service alert that “always has 20% left at month end”.

- An alert that fires on 0 items when 0 is normal.

- A cancelled official price that the catalogue wrote back the next morning.

  An alert that never clears buries real problems. Now when I write one, I make the condition that clears it at the same time, asking three things:

- When the problem is fixed, who clears this alert?

- Does it fire just because time passes, such as month end?

- Is 0, or a low value, a normal state?

  I do not write an alert nobody clears. The code that clears the mark on success goes into the same change as the alert.

### What I learned

> My tools work on me too.

- A limit makes you choose what to drop. If you set a length cap, say what must stay.

- Writing everything at once breaks on one dirty value. Clean before you write.

- A check must not disturb production. Same IP, same limits: go gently.

- Create an alert together with the way it clears.

## Notifications cannot be recalled: 19% of the last 72 hours’ notifications were wrong, and the gate worked after the fact

  Record from 2026-10-17.

My iPhone app Toreca Dash collects trading-card lottery information and sends a push notification when something new appears. Collected articles pass a gate (filter) that checks “is this a lottery you can really apply to?”: it keeps out winner announcements, buy-back notices, non-card products and so on.

  But a check on 20 September 2026 showed that about one notification in five went out for an article the gate should have rejected. The gate existed; the notifications were not stopped by it.

  Written from my work log of the 20 September 2026 re-check.

### I counted every notification of the last 72 hours

  The method is simple: take every article notified in the last 72 hours and judge again whether it should have been.

    Notified | Wrong | Share

    644 | 122 | 19%

    Reason | Count

      Winner-only notice (cannot apply) | 30

      Old post (days old, notified as if new) | 27

      Expired | 11

      No way to apply | 14

      Not a card product | 10

      Lottery with entry conditions | 8

      Other | 22

### The gate decided “show it?” after the fact

  The article gate also worked by hiding articles later. But a notification is sent about 0.6 seconds after the article is saved. Hiding later does not recall it.

  Of 30 articles the gate hid afterwards, 25 had already been pushed. They disappeared from the screen, but a notification on a phone cannot be taken back.

### A second cause: catch-up made old posts look new

  X monitoring had been down for a while. From 12:44 on 19 September a catch-up ran, and posts from 13 to 18 September were notified as new, 367 at once.

  Importing posts made during the outage is right. But if you judge “new” by when I found it rather than the post date, week-old posts look like fresh news.

### The fix: run the same gate at the sender

  Adding gates that act at save time was not enough. A notification cannot be taken back, so I made the notification function’s entrance run the same judgement as the article gate.

- New judgements go into the pre-save gate (screenArticleBeforeSave); the notification entrance goes through the same function, so the two cannot disagree.

- Old posts are judged by post date, not save date.

- After a catch-up or restart, always check the breakdown of skipped notifications.

### What I learned

> Stop what cannot be taken back before it goes out.

- Put the gate before the exit that cannot be undone. A screen can be lowered later; a notification cannot.

- Use the same judgement at save time and at the exit. Adding it to one leaves a path around it.

- “New” means the post date. Not the day you found it.

- Count everything. Only judging all 644 notifications one by one showed 19%.

## Key points of each

- A bulk update hit “all articles”: A bulk job hit every article and wrongly restored 18 items. How I reverted them from status history and proved new tests work by breaking rules one at a time.

- I counted “duplicates are practically zero,” but the audit reported 112 pairs: A nightly merge job timed out partway through the first genre, so later genres were never reached. My count of zero saw only that genre. Fixed with a rotating budget.

- “It gets cleaned up later” hid an entrance bug: Catalogue registration looked up existing products by exact name only, so brackets, spaces and full/half-width differences re-created near-identical products daily: 437 in one day, 410 with no articles. The nightly merge job hid it.

- “Weird articles keep multiplying”: 252 displayed lotteries were counted by route. Ended rounds left in an aggregator’s table were imported daily with empty deadlines (33); links to search results or top pages and deadlines disagreeing with the store’s own row were closed at the entrance.

- Fixing a gate does not fix existing data: After fixing a judgement, 12 of 32 existing articles stayed wrong (the skip mark lasts 7 days); a marker stored in the URL was lost on link rewrite and 111 articles were split again; removing a table key left written values. Five reports had one shape.

- Four times my own tools hurt me: A “15 characters” prompt dropped entry conditions in 671 checked lotteries; one undefined broke every save and burned 41% of a day’s credits; six parallel requests got the production IP blocked; I made alerts that kept ringing after the fix.

- Notifications cannot be recalled: Of 644 notifications in 72 hours, 122 (19%) were wrong. The article gate hides articles later, but a notification goes out about 0.6 seconds after saving; 25 of 30 hidden articles had already been pushed. I put the same gate at the notification entrance.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/data-repair/).

  More development logs, by theme: Notes (https://koshinstudio.com/en/notes/). About the app: Toreca Dash (https://koshinstudio.com/en/works/torecadash/).
