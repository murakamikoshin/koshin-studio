# Seven silent failures: real lotteries discarded, pages never read, and errors swallowed without a trace

> Seven real cases where nothing raised an error yet real data was being dropped or never read: regexes, dates without a year, truncated AI answers, t.co relays, notice pages, swallowed try? failures, and fail-open.

- URL: https://koshinstudio.com/en/notes/silent-failures/
- Original (Japanese): https://koshinstudio.com/notes/silent-failures/
- Published: 2026-11-07
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/silent-failures/)

Development log of Toreca Dash / 7 records in one place

  The worst bugs are the ones that raise no error. The job says “success” and something shows on screen, yet real lotteries are being thrown away, or links are never actually read. These are seven such silent failures, how they were noticed and how they were fixed, in the order they happened.

  Each section was first published as a separate record (from 2026-10). Numbers and sources are as in the work logs of the time. They were gathered into one article per theme on 7 November 2026.

## Four real lotteries silently thrown away: a regex, dates without a year, batched answers and null

  Record from 2026-10-17.

My iPhone app Toreca Dash has many places that decide “this is out of scope” and throw an item away. Throwing away looks like the safe side: if it is wrong, only some junk is missing from the screen.

  But mistakes of this kind give you no reason to notice them. A real lottery can be thrown away and nothing shows. This article describes four cases where I silently dropped, or nearly dropped, real lotteries.

  Numbers and dates come from my work logs between 28 August and 20 September 2026.

### 1. “x.com” matched “e-starbox.com” (31 August)

  If a link is a social-media link it is not a store page, so I do not use it. I listed the sites to exclude and joined them into one regular expression.

  new RegExp(["x\\.com", "note\\.com", ...].join("|"))
  That also matches inside other host names. x\.com matches the end of e-starbox.com, and note\.com matches mynote.com.

  The real damage was on the lottery service “Lottery Rotobox” (shoplottery.e-starbox.com). Its application links were judged “social media, not a store link” and never adopted once.

  The fix: host-only entries match only right after // or a dot ((?:^|//|\.) in front). I tested 13 examples, both URLs that should pass and URLs that should be blocked. An exclusion list looks like the safe side, so nobody doubts it.

### 2. A date with no year was read as six years ago (28 August)

  Store and aggregator posts write dates like “30 August (Sun)” without a year. I had an AI read the text to extract deadlines.

  For one aggregator, Pokémon card items came back as 30 August 2020, six years ago. A past deadline is rejected at the entrance gate, so all Pokémon card items from that source were never imported. One Piece and Dragon Ball happened to be read as 2026, which hid the problem.

  The fix was to put today’s date in the prompt and “do not fill in a year before today”. Readable items went from 0 to 46. “A year consistent with the post date” is not enough, because when the post date is unknown the year is undetermined.

### 3. The number of batched answers did not match (19 September)

  Sending one AI request per post costs one request each. So I batched several posts into one call to classify their sale type. I joined multi-line post bodies as “1. text”, “2. text”, separated by newlines.

  The AI cannot tell a newline inside a post from the boundary between posts. On the day X monitoring resumed, the number of answers did not match 8 times. On a mismatch the code marked the whole group “out of scope”, so real lotteries in those groups were dropped together.

  Worse, even when the count matched, some answers belonged to different posts. A Yu-Gi-Oh! lottery was thrown out as out of scope.

  The fix: pass a JSON array ([{no, text}]) or headings that cannot appear in the text (“[Article N]”), make the reply include numbers, and on a mismatch ask one by one instead of falling back to “out of scope”.

### 4. “Cannot decide” read as “none” (20 September)

  One function guesses the card genre from a post. When two or more genres appear, it returns null (“cannot decide”).

  Another job used it to detect “no card words (a toy-only announcement)” as !fn(text). There, null was read as “none”.

  A roundup post that lists Pokémon, One Piece, Yu-Gi-Oh!, Dragon Ball and Gundam model kits has several genres, so it returns null. That was read as “zero card words”, and because “Gundam” was found, as a toy announcement.

  Left alone, the daily bulk job at 05:15 would have hidden 129 real, displayed lotteries (for 9 products such as 30th CELEBRATION). I stopped it because I ran a count-only dry run before the real run. The dry run said 129, and that is how I noticed.

  The fix: to detect “none”, use the function that returns all matched genres and check that its length is 0.

### What I learned

> Mistakes in what you throw away raise no complaints, so count them yourself.

- Exclusion lists are wrong too. The safer something looks, the less it is doubted.

- Test what should pass, too. Testing only what should be blocked can hide a block on what should pass (case 1 used 13 examples of both).

- Give the AI every premise. Today’s date, separators. If you do not, it silently uses another premise.

- Do not default to “out of scope” on a count mismatch. If the fallback is “discard”, real items vanish together.

- “None” and “cannot decide” are different answers. Do not blindly negate null.

- Count before a daily bulk job. The 129 was known in advance.

## Candidates were found, yet reading the answer failed every time: a URL cut at 200 tokens, and a search that returned 400 on hyphens

  Record from 2026-10-17.

In my app Toreca Dash, aggregator-derived articles get their links replaced with the store’s official announcement page. But developer-mode reports kept coming, seven in a row: “the correct announcement URL is this one; do it properly”.

  Looking into it, candidates were being found, and the step that reads the answer failed every time. This article records the real cause and a very similar case from the same period.

  Numbers come from my work logs of 23 and 24 August 2026.

### The real cause: the AI’s reply was cut off at 200 tokens

  The step that chooses the official announcement page asks an AI at the end: “which candidate is that store’s announcement?” I had set the reply’s length limit (max_output_tokens) to 200.

  But the reply contains a long URL with Japanese percent-encoded, which exceeds 200 characters on its own. The reply was cut off, could not be read as JSON, and raised Unterminated string in JSON.

  WARN [application link] official page judgement failed [shop / …]: Unterminated st…
→ all 10 targets: "not found"
  Candidates had been found. It fell over every time at reading the answer. I raised the limit to 800, and added a rescue that, if it is still cut, does not discard everything but re-extracts just the "url": "… part.

### Still 0 adopted after the fix: the AI was obeying my instruction

  Even after fixing the JSON, 0 were adopted. The log showed candidates but “none adopted”. The cause: the AI was following the instruction faithfully. Store announcements read like this:

  "[App members only] Reprint / Pokémon Card Game, 4 types, about the lottery sale"
  They name no individual product. My instruction said “do not choose it if the product differs”, so the AI refused.

  I fixed two things:

- In addition to the search by product name, always also search site:store-domain lottery and merge the candidates. (“Only when the search came up empty” never triggered, because one unrelated page was always returned.)

- Add to the instruction: “if the store’s own announcement page covers several products and gives no individual names, you may choose it”. Other stores and aggregator sites are never chosen, even if they cover several products.

  The result: 3 of 10 were replaced with the store’s official announcement page.

  I also made a list of app-only stores (stores that give lottery information only in their app), so the app can say “please check in the app”. Only stores known to have an app; I do not add by guess.

### A similar case: Rakuten’s keyword search failed on hyphens (24 August)

  The log kept showing “Rakuten Ichiba per-set search failed”, for Yu-Gi-Oh! alone for 8+ sets. Rakuten’s API failed the whole request with 400 wrong_parameter depending on how hyphens are used in the keyword.

    Keyword shape | Result

      "A - B" (spaces around the hyphen) | 400

      "A B " (trailing space only) | 400

      "A B-" (ends with a hyphen) | 400

      "AB-" (a word with no space, trailing hyphen) | 200 (OK)

  Yu-Gi-Oh! product names often put a subtitle between hyphens, as in “LIMIT OVER COLLECTION - THE RIVALS -”. Sets of that form had never once been found by the per-set search.

  The fix has two steps: (1) remove spaces right after a hyphen, (2) drop trailing hyphens and spaces. “LIMIT OVER COLLECTION - THE RIVALS -” became “LIMIT OVER COLLECTION -THE RIVALS” and returned 200. I confirmed the same problem happens with the Rakuten Books API, and applied the same sanitising to the four functions that pass keywords.

### What I learned

> When candidates were found but the result is 0, suspect the place that reads the answer.

- Set a reply length limit from what is returned. A percent-encoded URL is long.

- Do not throw away a failure; salvage it. You can pull the needed part out of cut-off JSON.

- An AI is faithful to instructions. If the instruction does not fit how things are really written, it correctly refuses.

- Separate an external API’s quirks by measuring. 400 and 200 split on the hyphen position.

- The same quirk exists wherever the same API is used. It happened on Rakuten Books too.

## “Checked” marks on articles that had never been read: the t.co relay page

  Record from 2026-10-17.

My iPhone app Toreca Dash collects trading-card lottery information from store posts on X (Twitter). Each post links to an application form. The app also opens that link to check the deadline and whether entries have already closed.

  A report came in: “the deadline is wrong”. It turned out to be worse than a wrong deadline: the app had never read the linked page at all, and yet the article carried a “checked” mark.

  This is written from my work log of 16 October 2026 (the investigation and its numbers).

### The symptom: a closed form still shown as open

  The reported lottery was a game shop’s “30th CELEBRATION card set, 9 types” announcement on X. The Google Form it linked to said “Responses are no longer accepted”. In the app, the lottery was still shown, with an empty deadline.

  The odd part: the article had a “checked whether it has closed” timestamp. It had been “checked” and nobody noticed it had closed, so the check was not looking at the page.

### The cause: t.co returns a different page if you pretend to be a browser

  Links in X posts go through the short URL t.co. Normally it redirects to the real page (HTTP 301).

  But if you open it with a browser User-Agent, it does not redirect. It returns a roughly 500-byte page that redirects with JavaScript. Both of my reading functions opened t.co with a browser User-Agent and “follow redirects”. So:

- No redirect happened, so the final URL was still t.co.

- The text I read was the relay page’s HTML, not the form.

- I had never read the form at all.

  I had added the browser User-Agent on 6 August. This bug was a side effect of that change.

### How widespread was it?

  To check whether this was one case, I looked at every displayed X lottery or reservation article with a t.co link.

    What I checked | Result

      Displayed articles with a t.co link | 220

      Of those, relay page returned | 220 (all)

      Of those, actually a closed form but still displayed | 9

  The 9 were spread over several stores, so it was a systemic problem.

  One more clue I could not ignore: a daily job that fixes empty deadlines had been reporting “126 targets, 0 updated” every day. Not “nothing to fix” but “could not read, so could not fix”.

### The fix

  I put the redirect lookup into one function, fetchTcoTarget:

- Open t.co without a User-Agent, and do not follow redirects (redirect: "manual"). Take only the first target.

- If a target comes back, use it.

- If a relay page comes back, read the meta refresh tag inside it to get the real target.

- Then open that target with the browser User-Agent.

  Whether you send a User-Agent changes what comes back, so I split the uses: resolving a short URL uses none; reading the real page uses the browser one. I added a regression test.

### What to do with the wrong “checked” marks

  Fixing the code is not enough. The wrong marks stay on the articles. An article with the mark counts as “already checked” and is skipped.

  I removed the mark from 195 articles (X lottery/reservation posts that link to a post and have a t.co link), then ran the closed-entry check and the deadline re-extraction by hand.

    Job | Before | After

      Deadline re-extraction (targets / updated) | 126 targets, 0 updated (every day) | 123 targets, 14 updated

  The same day I also changed the closed-entry check: articles with no deadline every 6 hours (with a deadline, every 24), 80 articles per run instead of 40, 7 minutes at most. Now that t.co can be read, a closed form should not stay up for a whole day.

### What I learned

> Write “checked” only when you could actually read it.

- Write the mark only on success. If you mark an unreadable page as checked, it is never looked at again, even after the fix.

- After fetching an external page, check it is the page you meant. Is the final URL still the short URL? Is the text the right kind of page?

- “0 updated” every day can be a symptom. Tell “nothing to do” from “could not do”.

- When you change a network setting, review everything that uses it. A User-Agent added in August broke t.co reading two months later.

## What I read as “fetched” was just a notice page: three days of zero products

  Record from 2026-10-08.

My iOS app Torecadash regularly visits the sales pages of online shops to collect lottery and first-come sale information. One day I found that fetching from Pokémon Center Online had been returning zero products for three days straight. There were no errors, because each fetch was judged “fetched.” What was happening is written from my commit record.

  This is a development log of the app.

### My “fetched” check was too lenient

  Pages are fetched through an external service (Scrape.do). Fetch settings range from cheap to expensive, and the design is that if the cheap setting fails, it escalates to a stronger one (the same mechanism as in my article on scraping cost (https://koshinstudio.com/notes/ai-cost-cutting/#s3), in Japanese).

  The problem was the judgment of “did it fetch.” When the Pokémon Center page was fetched with the cheap setting, what came back was a 2,410-byte page saying “Please enable JavaScript”. It was not a product list, just a notice. But I read this as “fetched” and treated it as a success. If it is a success, there is no escalation to the stronger setting either.

  So from September 4, for three days, fetches kept “succeeding” while products stayed at zero.

### The fix

- Gather the “fetched” check in one place. The check had been scattered over several places. I made one function that looks at whether a page is a blocked page (scrapeDoResultLooksBlocked) and made everything use it.

- Remember the setting that worked. It remembers a setting that succeeded once and tries from there next time. This cut the credits used per fetch from 36 to 25.

### Another bit of dirt found the same day

  The same inspection found another problem. The logic that decides a mismatch between alternative spellings of a product name was written separately at the entrance of matching and in the cleanup side. Only the cleanup side lacked a check for “the product forms differ.” As a result, an alternative spelling of a trial deck stayed attached to a booster pack product, and kept triggering wrong matches every day. I made the check a shared function and removed 46 entries across 27 products.

  I also resolved the “no document to update” error (64 in 7 days). Now products are re-read when their cache is old, and articles that have disappeared are skipped so the remaining dedupe processing continues.

### What I learned

> “Success” and “the contents were fetched” are different things.

- Judge success by the contents. That the communication went through and that what you wanted was fetched are different. If “zero items fetched” continues, that itself must be watched as an anomaly.

- Keep a judgment in one place. If the same judgment exists in two places, one of them goes stale, like the matching entrance and the cleanup.

- No errors is not evidence that things are going well.

  This article is written from my commit record (September 7, 2026). How I noticed the three days of zero is not written in the commit.

## I opened the links of displayed articles and compared them: about 60 mistakes, and three mistakes in my own first check

  Record from 2026-10-17.

The articles in my app Toreca Dash link to store and shopping-site pages. Even if an article’s title and price are right, if the linked page is closed or about a different product, it is no use to the user.

  On the night of 15 September 2026, asked to “check the destination content too”, I actually opened the links of displayed articles and compared the content with the article: product, store, whether open, sale type, deadline and price. About 60 mistakes turned up.

  Numbers come from my work log of 15 September 2026. The check itself made no writes; I fixed the findings separately.

### How I checked

- X posts (361): 0 deleted. The text had been compared in earlier checks.

- Non-X (703, excluding Yahoo!): I read the destination directly or via the scraping service (with a Japanese IP) and judged with an AI. Amazon always goes through the scraping service.

  My first version of the check got three things wrong:

- I opened Amazon from Singapore. Prices showed in Singapore dollars and I saw another seller, and judged that “wrong”.

- I read Rakuten as garbled text. I had not detected the character encoding (EUC-JP).

- I opened 501 Yahoo! pages six at a time. The production IP was refused with HTTP 489 (see another article (https://koshinstudio.com/en/notes/data-repair/#s6)). I stopped partway through Yahoo!.

  If the checking tool is wrong, the count of “mistakes” inflates. I fixed encoding detection, opening Amazon from Japan, and judging only by stock of “this exact item”, then reran.

### Mistakes found (about 60)

    What | Count | Fix

      Amazon “invitation request” shown as pre-order or first-come | 10 | Make it a lottery

      Amazon “pre-order” shown as first-come | 7 | Make it a reservation

      Rakuten Books “pre-orders open” shown as first-come | 3 | Make it a reservation

      Shops closed temporarily (Yahoo!) | 6 | Hide

      Sold out or closed but still displayed | many | Hide

      Link goes to a different store or an ended lottery | 3 | Go back to the store’s X post

      Link goes to a different product | 2 | Hide

      Price mismatch | about 10 | Correct

      Empty store name | 1 | Fill in

  The most frequent was the wrong sale type. On Amazon there are “invitation requests”, neither first-come nor pre-order. Treating one as first-come means users cannot buy however fast they are. The earlier code only marked the invitation and did not correct the sale type.

  Some sold-out pages did not match my sold-out wording. A Yahoo! sold-out page says “out of stock” on screen, but matched none of the keywords. So I now judge by the stock data embedded in the page for that item ("stock":{"isAvailable":false). The data is more reliable than the wording on screen.

### “Opening the application link goes to the site’s top page”

  Found in another check the same day. The QR code on a store’s lottery image pointed to a URL that, actually opened, redirects to the site’s top page, not an application page.

  I added a check to the single gate that adopts application links. It opens the URL, and if the original URL has a path other than the top but the destination path is empty (or a file name that looks like a top page), it does not adopt it. If it cannot be read (403, timeout), it still adopts, since many stores use bot protection and unreadable is not a sign of badness. The same URL is held for 6 hours.

### What I did not fix, and could not fix

  It matters that I did not count everything found as a “mistake”. There are cases I checked and did not fix.

- Rakuten Ichiba “sold out”: the page data said in stock (a setting hides stock counts). The AI misread it.

- Amazon “See all buying options”: other sellers exist, so it is not necessarily sold out.

- Amazon English titles: auto-translated names; the product was right.

- 85 pages I could not read: Rakuten Ichiba (via ad links), membership sites, LINE, Google Forms and so on.

  I keep results in three groups with reasons: fixed, not fixed, could not read. “Not fixed” needs a reason too.

### What I learned

> Even if title and price match, you cannot know until you open the link.

- Actually open the link. Looking only at the article cannot show that the destination is closed.

- Check the checking tool first. Country, encoding, parallelism: a wrong tool inflates “mistakes”.

- Embedded data beats screen wording. Judge sold-out by stock data, not text.

- Do not make everything found a “mistake”. Keep reasons for what you do not fix.

- Do not treat “could not read” as bad. Bot protection makes unreadable normal.

## If you throw failure away, the screen lies: a calendar that said “registered” with none added, a frozen OCR, a notification without a store name

  Record from 2026-10-17.

In developing my app Toreca Dash, bugs of one kind appeared in a row: failures I had swallowed made the app show a false success. This article records three.

  Written from my work log of 25 August 2026.

### 1. “Registered N events” while none reached the calendar

  The app can export lottery deadlines to the iPhone calendar. A build warning (result of 'try?' is unused) led me to review it. try? is a Swift way of discarding a failure. The feature called save with try? store.save(...) and try? store.commit(), throwing failures away.

  As a result:

- Nothing reached the calendar, yet it said “Registered N events”.

- Only the “exported” record remained.

- Pressing again said “no new items to register”, so they could never be registered.

  The fix: return failures to the caller and count only successes. Devices with no default calendar are detected first and told. The messages are split by cause; before, every failure said “access is not allowed”.

### 2. When text recognition fails, the screen freezes

  The feature that reads text from an application image (OCR) also discarded failure with try? handler.perform([request]). If recognition failed, the callback was never called. The “reading…” spinner never stopped, and the only way out was to close the screen.

  The fix: on failure too, return to a “finished recognising (found nothing)” state.

  The build warning result of 'try?' is unused is a sign of swallowing. Run the build and read the warnings regularly.

### 3. A notification without the store name: forgotten in the buffer

  A different story with the same shape. A report said “the notification has no store name”. The article had the store name (sellerName) correctly. The notification did not show it.

  Lottery and reservation notifications are put in a buffer and sent in batches (to hold them in quiet hours and to limit the rate). But the store name was not carried into the buffer. When sending, looking for the store name found no information, and only the category (“LivePocket”) remained.

  This was partly surfaced by the earlier fix. When I fixed “the notification arrives under the name LivePocket”, I made it return null when the store name is unknown. That forgotten carry-over changed its symptom from “wrong store name” to “no store name”.

  The same gap existed in both buffers (by genre and by product), so I fixed both. For the 5 already buffered I filled in the store name from the article and confirmed it appears when sent.

  The same gap had happened on 17 August with another field (product names). The lesson: when putting something in a buffer, carry every field that will be used at send time. The other two buffers, which store the finished wording as is, do not have this problem.

### What I learned

> If you throw failure away, the screen lies.

- Return failures to the caller. Discarding them makes the display differ from reality.

- On failure too, return to a “finished” state. If a callback is never called, the screen freezes.

- Record success only on success. If it stays after a failure, you cannot retry.

- Read the build warnings. A try? warning is a sign of swallowing.

- Put every field used at send time into the buffer. The same gap shows up later in another field.

## It let things through when it could not check: how “fail-open” brought in resale items

  Record from 2026-10-08.

In my iOS app Torecadash, three in-app bug reports said “lots of resale prices are coming in from Amazon.” One was an obvious resale item at ¥79,800. The cause was a blind spot in a design I had put in on purpose: “if it cannot be confirmed, let it pass.” This is from my hand-over notes and the commit record (July 30, 2026).

  This is a development log of the app.

### The price gate, and the “let it pass” design

  The app picks up listings from online shops (Rakuten, Yahoo! Shopping, Amazon and others) and shows them in a feed. There is a “price gate” that checks whether a listing’s price is reasonable against the product’s list price. It has an AI (with web search) look up the list price, and rejects extremely expensive resale items.

  The gate had a behavior: “if the list price could not be confirmed, let it pass without review.” That was intended. If you exclude products whose list price the AI genuinely does not know just because you cannot confirm it, you also erase genuine listings. This is so-called fail-open (open on failure, meaning let it pass).

### The blind spot: hitting the search cap took the same path

  The AI’s web search has a cap of 300 calls a day (a circuit breaker to prevent unexpected cost). But the gate did not distinguish the reason the list price could not be confirmed.

- The AI answered “I do not know the list price of this product.”

- The daily cap was reached, so the check itself could not be done.

  Both went down the same “price unknown → let it pass” path. The first is as intended. The second is just “the road was closed before looking,” yet the gate became wide open.

### Why the hole did real damage

  The hole surfaced because of a previous change (the one that widened Amazon’s scope). Widening the scope suddenly increased the number of products whose price had to be newly checked. As a result, the daily cap was reached often. While it was reached, the gate was open and resale items mixed in in large numbers.

  There was secondary damage too. A result of “list price unknown” was designed to be cached for 24 hours regardless of reason. So a product that once hit the cap stayed open for up to 24 hours even after the cap was released.

### The fix: distinguish the reason

  I created a dedicated marker (QUOTA_EXCEEDED) so the two could be told apart.

    Situation | What the gate does

    The AI genuinely did not know the list price (null) | Let it pass as before (still fail-open)

    The daily cap meant the check itself could not be done (QUOTA_EXCEEDED) | Exclude (fail-close)

  The latter is not put into the 24-hour cache either. It tries to confirm again the next time it is called. This gate is shared by every feature that uses price review: Rakuten, Yahoo! Shopping, Amazon, AI listing discovery, first-come Rakuten Books and so on, so one fix reaches widely (the commit record says 18 functions were deployed).

  I hid the three reported items by hand. After that, the re-review batch that runs every 5 minutes is expected to pick up the same misses again.

  What I have not verified: my notes say “check in the next session whether resale-price reports stopped after the cap reset.” There is no result for that in the record at the time of writing.

### Is the same hole in other decisions?

  In a later check (July 30, 2026), I looked at the other AI decisions such as deciding sales format and matching products. All of them are designed to fall to the safe side (exclude, or null) on failure, and I found no new fail-open hole.

### What I learned

> “Could not confirm” comes in two kinds: did not know, and could not look.

- Before using a let-it-pass design, make clear the reason it is fine to let through. “Let it through because I do not know” and “let it through because I cannot look” are different things.

- Do not cache the result of a failure regardless of its reason. I froze a temporary failure for 24 hours.

- One change can turn a hole elsewhere into real damage. Widening Amazon’s scope brought the cap’s hole to the surface.

  This article is written from my hand-over notes (session 182) and the commit record (July 30, 2026).

## Key points of each

- Four real lotteries silently thrown away: “x.com” matched “e-starbox.com” so application links were never used; a date with no year was read as 2020 so no Pokémon items were imported; batched answers got out of step; “cannot decide” was read as “none” and nearly hid 129 lotteries.

- Candidates were found, yet reading the answer failed every time: An AI reply choosing an official announcement page was cut at 200 tokens and failed every time. The result stayed 0 because store announcements name no product and the AI obeyed my instruction. Rakuten’s search returned 400 depending on hyphen position.

- “Checked” marks on articles that had never been read: Opened with a browser User-Agent, t.co returned a relay page instead of redirecting. All 220 displayed articles were unread and 9 were closed forms. How I fixed it and how I removed the wrong “checked” marks.

- What I read as “fetched” was just a notice page: A scraper returned zero products for three days because a 2,410-byte “enable JavaScript” page counted as success. How I centralized the check.

- I opened the links of displayed articles and compared them: Opening more than 1,000 destination pages and comparing with the articles: Amazon invitation requests shown as first-come, closed or sold-out items displayed, links to other stores or products, application links redirecting to a site’s top page. My first check was wrong in three ways too.

- If you throw failure away, the screen lies: try? discarded failures, so the calendar showed “registered N events” with 0 added and could never register again, OCR failure froze the screen, and the notification buffer forgot the store name.

- It let things through when it could not check: A gate that let items pass when the list price could not be confirmed had a blind spot: a daily search cap. Telling “did not know” from “could not look.”

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/silent-failures/).

  More development logs, by theme: Notes (https://koshinstudio.com/en/notes/). About the app: Toreca Dash (https://koshinstudio.com/en/works/torecadash/).
