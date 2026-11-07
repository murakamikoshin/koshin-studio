# Four store-matching mistakes in a TCG lottery app: spelling variants, vague map lookups, shared entry pages, and one page with many products

> Four real cases where matching store names went wrong in a trading-card lottery app: spelling variants, a map lookup that returned Shizuoka, one entry page used by different stores, and one form for six products.

- URL: https://koshinstudio.com/en/notes/tcg-store-matching/
- Original (Japanese): https://koshinstudio.com/notes/tcg-store-matching/
- Published: 2026-11-07
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/tcg-store-matching/)

Development log of Toreca Dash / 4 records in one place

  Toreca Dash reads store announcements and posts on X to work out which store is running which lottery. The easiest thing to get wrong was the store’s name: the same store written differently, different stores sharing one link, and vague names turning into a far-away place on the map. These are four real store-matching mistakes and how they were fixed, in the order they happened.

  Each section was first published as a separate record (from 2026-10). Numbers and sources are as in the work logs of the time. They were gathered into one article per theme on 7 November 2026.

## “ヤマダ電機” versus “ヤマダデンキ”: spelling variants and duplicates had three overlapping causes

  Record from 2026-10-17.

In my app Toreca Dash, the same store’s name was written differently, such as “ヤマダ電機” and “ヤマダデンキ” (both Yamada Denki). Two reports came: “spellings vary” and “articles are duplicated for the same reason”. The instruction was: “make sure it does not happen for other stores either, thoroughly”.

  This article records that three causes overlapped, and the process of fixing with a general rule instead of a synonym table.

  Written from my work log of 25 August 2026.

### Three causes overlapped

- Store names were compared only by “contains”. The two Yamada spellings contain neither one another, so they were different stores.

- Deadlines were compared to the millisecond. The same “until 26 Aug” was 23:59:00 from the aggregator and 23:59:59 from X, a 59-second difference that stopped them being seen as duplicates. Four real products were like this.

- The dedupe job was manual-only and had never run automatically. Even if I make it as a “one-off repair”, articles arrive daily, so duplicates are born daily.

### The fix: no synonym table

  I made a comparison key (storeNameComparisonKey). It drops corporate forms, symbols, spaces and full/half-width, turns katakana into hiragana, and unifies “電機 / 電器 / でんき”.

  I do not make a table of store-name synonyms. It would recur whenever a new store appears. I made a general rule that unifies different writings that sound the same.

- Deadlines are compared as dates (Japan-time dates) and I require the same sale type instead. Even on the same day, first-come and lottery are different cases.

- Articles that have no store name (sellerName) and only a store name in the category are included. Aggregator and official-site articles are mostly like that, and I had overlooked them wholesale.

- When hiding as a duplicate, always set the hidden mark (hiddenByDuplicate).

- I added an hourly scheduled run.

- The spelling itself is also pulled to the majority of real data. I keep no list of correct spellings. On a tie, katakana wins, then string order, so the answer does not change at each run and cause a rewrite war.

### Two dangers found in testing

  Both found by tests after the fix.

- If you key only on the part before “＠”, a store whose name itself contains ＠ gets an extremely short key. “Card Shop ＠ Home. Kagoshima” would become a key like “card shop” and be equated with other stores. The comparison key does not cut at ＠. (Names with an advertising tail are caught by the contains test.)

- If “one is the beginning of the other means the same name”, branch names disappear. “Yellow Submarine” and “Yellow Submarine Akihabara” would merge and lose the branch. I treat them as the same only when the addition begins with a note marker such as “＠”, “【” or “（”.

  I checked 17 real patterns and found 0 mismatches.

### Result

     | Before | After

      Store-name spelling variants | 2 | 0

      Duplicates with same product, deadline and store | 7 groups | 0 groups

  As a bonus, 23 store names with an advertising tail like “○○ ＠ staff wanted” were unified too. When there are duplicates, the one kept is the one with a price and a result-announcement date.

### What I learned

> Fix with a general rule, not a list; and run the fixing job automatically.

- Do not compare only by “contains”. Different writings do not contain each other.

- Do not compare to the millisecond. Compare by date and sale type.

- A “one-off repair” is not enough for what is born daily. Run it automatically, regularly.

- A synonym table recurs with new stores. Use a general rule for same-sounding writings.

- Merge only notes. Never erase a branch name.

## Looking up an ambiguous store name returns Shizuoka, the middle of Japan: I judged by Google’s own answer, not a list of chains

  Record from 2026-10-17.

My app Toreca Dash shows store locations on a map and sorts by distance. A report said “the location shows Shizuoka”. Store locations come from passing the store name to Google’s place search (Places API).

  The cause: when you query with an ambiguous store name, Google returns the middle of Japan (Shizuoka and Aichi). This article records the measurement and the fix of not listing chain names.

  Written from my work log of 25 August 2026.

### Measured: the answer to an ambiguous name is Shizuoka or Aichi

  I pass a rectangle covering all of Japan as a location hint (locationbias). With an ambiguous name and nothing to decide by, Google returns the middle of that rectangle, which is Shizuoka and Aichi. I measured it with the API.

    Query | Google’s answer

      Yamada Denki | Yamada Denki Tecc Land Hamamatsu (Shizuoka)

      San-A | San-A Kaken, Kakegawa Factory (Shizuoka)

      Hobby Station | Toreca Station Toyohashi (Aichi)

      Book Off | BOOKOFF Kakegawa (Shizuoka)

      Hareruya | Hareruya Shizuoka (Shizuoka)

      Omusubi | a rice-ball shop in Hamamatsu (Shizuoka)

  “San-A” meant a retail chain, but the answer was a different company’s factory with a similar name.

### The fix: judge by Google’s own answer, not a list of chain names

  I did not make a “list of ambiguous chain names”. It would recur whenever a new chain appears. Instead I wrote a function (geocodeMatchIsTrustworthy) that judges from Google’s own answer.

- If the queried name is only the head of the returned name and the rest is a branch name, reject. (Yamada Denki → …Tecc Land Hamamatsu.) If only “store” was added, it is the same shop.

- If the name has a branch hint (“… store”, hall, mall…), accept as before.

- If the returned name equals the queried name or is a part of it, accept. Do not accept the reverse. (San-A ⊂ San-A Kaken is a different company.)

- Otherwise, judge by whether the name and address share 2 or more characters. (Stores with Ikebukuro, Totsuka, Sapporo or Takadanobaba in the name pass here.)

  On 25 real patterns, all 9 wrong ones were rejected and all 16 correct ones accepted. The only miss was one written in Roman letters.

  I cleared the 30 articles with a wrong location baked in and 22 store cache entries, and resolved them again. Clearing the cache costs one API call per store.

### A similar story the same day: the notification’s store name was “LivePocket”

  A report said “the notification’s store name is LivePocket”. When no store name could be found, the category (“LivePocket”) was used as the last fallback. LivePocket is a place that takes applications, not a store. So when unknown, return null. The caller uses the article title if there is no store name. LivePocket titles begin with the store name, like “Kiddy Land LaLaport Fujimi store …”, which says it more correctly.

### What I learned

> Check an external answer for trustworthiness using the answer itself.

- With nothing to decide by, an external service returns a plausible answer. The middle of Japan: Shizuoka and Aichi.

- Do not make a list of chain names. It recurs when a new chain appears.

- Do not accept the reverse containment. San-A is not part of San-A Kaken.

- Clear baked-in values and resolve again. The cache too.

- When unknown, null. No name is better than a wrong one.

## “The same application page” does not mean “the same store”: 52 articles showed another store’s name

  Record from 2026-10-17.

In my app Toreca Dash a bug report said: “to users it looks like a different store’s lottery”. An article for a Sendai station store showed as “Shinjuku South Exit store”, and an article for a Hachioji flagship showed as “Noshiro store”. 52 articles were affected.

  The cause was a wrong premise: “the same application page means the same store.”

  Numbers come from my work log of 7 September 2026.

### The symptom: store names of other stores

  Articles carried the name of a different branch of the same chain. A user opens “the Sendai store’s lottery” and the text says Shinjuku. 52 articles were like that.

### The cause: the same page is not the same store

  A job unified the store name and deadline across articles that share an application page. Same lottery, same deadline; same store, same name, I assumed. It copied the highest-quality article’s store name to everyone in the group.

  The premise did not hold. On real data:

    Application page | Stores sharing it

      A page (1) | 15 separate stores (Sendai, Hamamatsu, Maebashi, Shiwa, Gamagori, Hiroshima and more)

      A page (2) | 9 branches of one chain

      A page (3) | One shop and three other chains (not even the same chain)

  Chains often use one application page for all stores. The same page does not mean the same store.

  The same accident had already happened on the hiding side, and a guard existed there (the 51-branch case of one chain). I had forgotten to add it to the name-copying side. The same fix had not been applied to every entrance that uses the same judgement.

### A coordinates-only guard was not enough

  My first guard was “if coordinates disagree, they are different stores”. But for a group where only one article has coordinates, the “definitely different places” test returns false and passes. In a dry run (no writes), shops of three different chains were about to be rewritten as one store.

  The lasting fix was to reverse the logic: “unify only when confirmed to be the same place”, not “do not unify when confirmed different”. Only when both have coordinates and they match. If coordinates are missing or differ, I respect each article’s own name. Deadlines are still unified, since they belong to the same lottery on the same page.

### Restoring the 52 articles

  I had not saved the original names. The clue was a field this job never touches (category), set when an article is created from its own source (the store’s X account or the aggregator row). I checked all 52 by eye, and category matched the source.

  Coordinates could not serve as evidence. They are derived from the store name, so after a rewrite they were the coordinates of the wrong name (category was Sapporo Station but coordinates were Shinjuku). So I discarded coordinates too and put them back to be derived again.

- 51 in a dry run, then the real run.

- Afterwards, 0 new overwrites (the guard works).

- Only 2 displayed articles where name and category differed, both just different spellings of one store.

### A bonus bug: items that could not enter the queue

  Trying to re-derive coordinates, none of 4 articles got their turn. The location fixer has two queues:

    Queue | Contents

      Front (60 at a time) | Articles that want coordinates

      Retry (a 300-item window) | 658 measured, of which only 34 truly lacked coordinates

  The retry queue also held items that had been solved (success wrote the flag as false and left it in the queue). 624 finished articles filled the window, so the 34 that needed work never got a turn.

  The fix: when solved, delete the flag. It sits in neither queue.

### What I learned

> Before assuming “the same”, confirm “the same”.

- The same link does not mean the same store. Shared pages are normal.

- Unify only what you have confirmed is the same. If you cannot confirm, do not touch it.

- Apply a fix to every entrance that uses the same judgement. Adding it to one leaves the other.

- If you did not save the original, restore from a field you did not touch, and check it by eye, one by one.

- Setting a flag to false is not deleting it. It stays in the queue.

## “One page = one case” was false: articles of a shop taking 6 products on one form were hidden just for sharing a link

  Record from 2026-10-17.

My app Toreca Dash twice received the report “several products are accepted, yet there is only one article”. I thought I fixed it the first time, but the second report came.

  This article records the real cause, and a story from the same period: a field I created that the app never read.

  Written from my work log of 25 August 2026.

### The real cause: duplicates decided by link alone

  After the first report I had fixed it as far as “they are treated as duplicates because the link is the same”. But existing articles stayed hidden, so I got the same complaint again.

  The culprit was runHideDuplicateLinkArticles, a job that judges duplicates by link alone.

  The real data: one mail-order shop takes lotteries for 6 products on a single Google Form. All 6 articles have the same URL. The job hid 5 of them as “duplicates”, so users saw only one product.

  The fix: change the grouping unit from link to link + product. The same link with a different product is a different case. For articles whose product is unknown, there is nothing to tell them apart, so they are treated as duplicates by link alone as before.

  “One page = one case” does not hold for card lotteries. Stores that accept several products on one form or one announcement page are common.

  I restored the articles that had been hidden as link-only duplicates, only those whose product or title differs from a displayed article with the same link (7 articles): 5 from the mail-order shop (all 6 products now show), 1 from a large game store and 1 from another chain.

### The server created “entry tiers”, and the app never read them

  Since 23 August the server had been reading entry conditions with an AI and extracting entry tiers (entryTiers): “Players Club: identity-verified tier versus unverified tier”, “Group A and Group B”, “Bic Camera Suica card members only”. They were in the real data.

  But the iOS app never read this field. I was paying for the AI and users could not see it. I added the field to the app and show it in the detail screen as “Entry tiers”.

  You can find such server/app mismatches mechanically: extract the fields the app reads from the source (grep) and compare them with Firestore’s real data.

### Announcement text had got into the product list

  Event notices such as “ONE PIECE Card Game corner [advance entry / lottery] Monday 31 August, JUMP SHOP Tokyo Station” had been registered as products.

  A list of phrases cannot keep up, so I rejected them with a general rule: a concrete date. A trading-card product name does not contain a calendar date like “31 August”. “Vol.3”, “Set 2” and “2025 issue 19” are not dates and are unaffected. I tested 10 patterns with 0 mismatches and deleted the 6 existing ones.

### What I learned

> Doubt the premise. Check that what you built is used.

- Do not assume “one page = one case”. Stores accepting several products on one form are common.

- After fixing, look at existing articles. Fixing the entrance does not bring hidden articles back.

- Cross-check the fields the server makes and the app reads. You can pay the cost and users still see nothing.

- A general rule beats a list of phrases. “A concrete date means it is not a product name.”

## Key points of each

- “ヤマダ電機” versus “ヤマダデンキ”: Store names compared only by “contains”, deadlines differing by 59 seconds, and a manual-only dedupe job. I used a general comparison key instead of a synonym table, ran it hourly, and found two dangers in testing.

- Looking up an ambiguous store name returns Shizuoka, the middle of Japan: Passing a store name to Google’s place search with a rectangle covering Japan returned its middle (Shizuoka/Aichi) for ambiguous names. Instead of a list of chain names I judged trust from the answer itself with four rules.

- “The same application page” does not mean “the same store”: A job that unified store names across articles sharing an application page turned a Sendai store into “Shinjuku South Exit”. One page was shared by 15 separate stores. I changed it to unify only when confirmed the same place and restored 52 articles from an untouched field.

- “One page = one case” was false: A job that decided duplicates by link alone hid 5 of 6 articles of a shop taking 6 products on one Google Form. I changed it to link + product. I also found the server’s “entry tiers” were never read by the app.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/tcg-store-matching/).

  More development logs, by theme: Notes (https://koshinstudio.com/en/notes/). About the app: Toreca Dash (https://koshinstudio.com/en/works/torecadash/).
