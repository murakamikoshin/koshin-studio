# Eight product-matching failures in a TCG lottery app: English vs katakana, splitting sets, official catalogs and spreading typos

> Eight real failures in matching trading-card lottery articles to products: English vs katakana names, splitting 9-pack sets, products seeded from official catalogs, spreading typos, and leaked values.

- URL: https://koshinstudio.com/en/notes/tcg-product-matching/
- Original (Japanese): https://koshinstudio.com/notes/tcg-product-matching/
- Published: 2026-11-07
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/tcg-product-matching/)

Development log of Toreca Dash / 8 records in one place

  Linking each lottery article to the product it is about is the core of Toreca Dash. Product names change shape endlessly: English versus katakana, abbreviations, how sets are written, and typos. These are eight real product-matching failures, with the fixes and the numbers measured, in the order they happened.

  Each section was first published as a separate record (from 2026-10). Numbers and sources are as in the work logs of the time. They were gathered into one article per theme on 7 November 2026.

## English and katakana names share no characters: a fingerprint gate rejected 42 correct matches

  Record from 2026-10-17.

My app Toreca Dash fetches each product’s market price from a site with real trading records and shows it next to the official price. But the health check said:

  Market-price link rate dropped: 177 / 449 (39%)
  I could have written it off as “new sets are not on that site yet”. But when I searched that site, the products were there. This is the real reason and the fix.

  Written from my work log of 24 August 2026.

### The products were on the market-price site

  Mine     Expansion Pack "30th CELEBRATION"
Market   Pokémon Card Game MEGA Expansion Pack "30th Anniversary Celebration" Box (exists)

Mine     QUARTER CENTURY TRINITY BOX
Market   Yu-Gi-Oh! OCG Duel Monsters Quarter Century Trinity Box (in katakana; exists)

Mine     Start Deck Blue Kuzan [ST-33]
Market   One Piece Card Game Start Deck "Blue Kuzan" (exists)

### The cause: a fingerprint check that structurally cannot match

  This match re-checks the AI’s chosen candidate in code too, with whether the products’ proper-name tokens really overlap (a fingerprint check, productNamesShareFingerprint). I had added it on 8 August as a defence against the data corruption of merging unrelated products, and it is itself correct.

  But for this market-price match alone, the comparison structurally cannot succeed. My product names are the maker’s official English names, and the market site’s are often in katakana, so no character is shared.

  In the real log (26 hours), 42 candidates were rejected as “fingerprint mismatch”. Looking inside, most were correct matches.

    Mine | Market site

      PHOTON HYPERNOVA | Photon Hypernova Box (katakana)

      CHAOS IMPACT | Chaos Impact Box (katakana)

      ROMANCE DAWN [OP-01] | Booster Pack Romance Dawn Box (katakana)

      RAGE OF THE ABYSS | Rage of the Abyss Box (katakana)

      Expansion Pack “30th CELEBRATION” | Expansion Pack “30th Anniversary Celebration” Box

  And one of those 42 was the very product from report [111] “the market price is too cheap, suspicious” (30th CELEBRATION). I had earlier fixed “lottery prices mixed into the market price”, but a deeper cause remained: it had never been linked to the real market price at all.

### The fix: do not weaken the fingerprint; add a second, narrow judgement for this match only

  Loosening the fingerprint check would loosen its other uses too (registering aliases, merging duplicates) and the original corruption would return. I never weaken it.

  Instead, only for candidates the market match rejected on fingerprint, I added a second judgement on one point: “is this the English and katakana forms of the same proper name?” (snkrdunkNamesAreTransliterationMatch).

- Candidates with conflicting product codes are rejected without asking the AI. (OP-01 vs OP-17, however similar they sound.)

- The AI answers only “do they correspond in sound?”, and if unsure, always false. A language difference such as “English version” counts as a different product.

- Everything passed is logged (“confirmed as an English/katakana spelling variant”) so it can be checked later on real data.

### Check on real data: dry run first

  A “not found” verdict has a 7-day cooldown. Only for the 148 products with displayed articles, I lifted the wait and had them judged again. It is a bulk rewrite, so I checked the count with a dry run before running it.

### What I learned

> A correct gate can structurally reject correct matches. Do not weaken the gate; add a narrow second judgement.

- Do not write it off as “can’t be helped”; actually look. The products were there.

- Count a gate’s rejections and read them. Most of 42 were correct matches.

- Do not weaken the gate. Its other defences would fall too.

- Add a narrow second judgement. Reject code conflicts without the AI; allow the AI to say false when unsure.

- Log what passes. You can verify it later on real data.

## Three mix-ups in splitting one article into products: a child treated as a parent, a shared link pointing to another store, a name owned by two products

  Record from 2026-10-17.

My app Toreca Dash has a process that splits a store announcement into one article per product. If one announcement says “lotteries for Pokémon card A and B”, it makes an article for A and one for B. I call the split articles children and the original the parent.

  Around this process I found three mix-ups. In each, a real lottery disappeared and nothing showed on screen.

  Numbers come from my work logs of September 2026 (including 5 and 20 September).

### 1. Parent-level processing was applied to a child again (20 September)

  In a broad check I found that 60 lotteries (23 stores) closing at 23:59 that day were all missing from the feed.

  A child keeps the parent’s flyer image and the parent’s title (splitFromTitle). A job that re-asks about articles with several products looked at a child, read it as “9 products”, left the child’s product field empty and rewrote it as “9 items”. The next day a job that tidies generic articles (those that point to no particular product) judged it “a generic article with no product” and hid it.

  The target product IDs were the same as the existing siblings, so zero new articles were made. Only that product vanished.

  The same root cause hit a second place: the check for result announcements and winner notices missed children because a child’s title is only the product name, and the body (the parent’s title) did not reach the check (16 articles).

  The fix: when adding a job that collects, judges or hides articles, always decide to exclude children (articles with splitFromArticleId) or pass the parent title as body. The marker for “this is a child” is a field on the article, not a part of the URL, because URL markers are lost when application links are rewritten.

### 2. Looking up the parent by link alone returned another store’s article

  Ten two-product announcements from one store chain were never split. The function that finds the parent looked it up by link alone.

  That chain’s stores share one page, 13 stores with the same link. A link-only lookup hit one of:

- an ID fixed by the link alone,

- the first of the articles with that link,

- a child whose marker was lost in a link rewrite (it has the parent’s link).

  As a result it split another store’s article, or a child, again and again. The log showed “split into 2 products” for the same parent each time.

  A link is not a key that identifies a store. Shared pages, quotes and aggregator posts give several articles the same link. The fix: when looking up by link, add site and store name to the condition, and never take a child as a parent. “If the log shows the same parent ID again and again, suspect it” is now a lesson.

### 3. A name claimed by two products identifies neither (5 September)

  Products have alternative names. “30th CELEBRATION BOX” was an alias of both the expansion pack “30th CELEBRATION” and a different product, “30th CELEBRATION FUTURISTIC BOX”.

  That name identifies neither. If an AI sees it as a candidate, the result depends on which one it picked at that moment. 25 displayed articles were shown under the other product’s name.

  Counting, such “names claimed by two or more products” numbered 267 pairs and 321 articles.

  The same shape: a step that cut store names “before the ＠” merged three branches of one shop into one store and folded two of them away as duplicates every day.

  The fix: whenever a system identifies something by name, count whether two or more things claim that name. An audit keeps it at zero. Keep a name only when it is mechanically decidable (exactly one product uses it as its official name); otherwise remove it from all. Put the same judgement at the entrance and in the cleaner, or what you remove is added back.

### What I learned

> A split-off article is not the original. A name works as a key only if it has one owner.

- Do not re-run the original’s processing on derived items. Keep the child marker in a field of the article.

- A link is not a key. Also use site and store name.

- Count the owners of a name. A name claimed by two identifies nothing.

- When you add a job that hides things, count whether a replacement is really displayed. Looking only at the hidden side cannot show over-deletion.

## Splitting a “9-pack set” by contents created 80 fake products

  Record from 2026-10-08.

While inspecting the product list of my iOS app Torecadash, I found 80 products that do not exist around the Pokémon Card “30th CELEBRATION Card Set.” There are only 9 official products. The other 80 were fake products created as a result of splitting a “9-pack set” by its contents. What happened and how I fixed it are written from my hand-over notes.

  This is a development log of the app.

### The 9-pack set was “one product”

  The lottery for a “card set (9-pack set)” that a shop offers is one product. In the catalog it is registered as a “9-kinds set” (10,800 yen). But the app’s product matching (the step that splits an article mentioning several products into one per product) split this title by contents. Names of the nine contents, such as “Mega Mewtwo X” and “Nyabby,” were each treated as a separate product.

  As a result, this is what it looked like:

    State | Count

    Original articles that had been split (parents) were hidden | 22

    Articles created by splitting (children) | 190 (63 visible)

    Fake products created for the children | 80

  On screen, one lottery appeared as if it were separate lotteries for each content item.

### The fix: stop the entry, then put things back

- Do not split at the entry. A title of the form “card set” + “N kinds” is not split.

- Restore the parents. I put the 22 hidden parents back onto the “9-kinds set” product. How I restored each differed (5 back to visible, 3 treated as duplicates because the same shop already had a visible 9-pack set, 13 whose deadline had passed, and 1 with no deadline).

- Detach the children. I marked the 190 children with a “wrong split” flag (hiddenByWrongSplit), hid them, and removed their link to a product.

- Delete the fake products. I deleted the 80. Before deleting, I confirmed that nothing referenced them and saved the original contents as a backup.

  There is an exception. A listing like “Starter Set ex Nyaoha / Hogator / Quaxly 3-kinds set,” where the title spells out all the product names, is still split as before. What I learned this time is that an “N-kinds set” is sold as one product.

### Other fake products found in the same inspection

- Things that are not cards. Products for apparel, figures, tournaments and music CDs had been created between September 3 and October 3. I added a gate at the entry for names that are not cards (looksLikeNonCardMerchOrEventName) and confirmed 0 false hits across the whole catalog. I deleted 25.

- Single cards. I deleted a total of 30 single-card products that came from Snkrdunk listings. Some of those single cards had a “list price.” Having a list price turned out not to be proof of an official cross-check. The proof is imageIsOfficial.

- A product combining three packs. I deleted one unofficial product that lined up several set names. Its 49 linked articles were all expired.

  To watch for these, I added an audit (audit_catalog_clean.js). Each time it counts five things: single-card products, products with several set names, mismatches between an application page’s title and the product, drift of list prices copied from products, and products with non-card names.

### What I learned

> A “split” process needs a “do not split” condition.

- Splitting one product into several multiplies fake products. Splitting should happen only after checking “is it really several products.”

- Count references before deleting. I deleted only after confirming zero references and a saved backup.

- Stop fake products at both the entry and the contents. An entry gate alone leaves what already exists. An audit counts what remains.

  This article is written from my hand-over notes (§272) (October 7, 2026). The counts are as written in the notes.

## The “9-pack set” was nine different products: the same product that never matched

  Record from 2026-10-08.

My iOS app Torecadash collects lottery and first-come sale information for trading cards and notifies users. To check for gaps, I match and count listings on other roundup sites (Chusen Zukan, Pokechu) against the articles in my own app. When I measured on October 7, most gaps came from a small discrepancy: the same product that never matched. This is from my hand-over notes and commit record.

  This is a development log of the app.

### What I measured

  With read-only access, I checked “are all lotteries introduced by the roundup sites shown in the app?”

- Chusen Zukan: of 90 open lotteries, 49 (54%) were displayed in the app. 12 had an article but were hidden, and 29 were not in the feed.

- Pokechu: 18 of 21 (86%).

- X roundup posts: 606 posts in 72 hours. Only 9 linked to an article.

### Of the 12 hidden, 7 were because the row was wrong

  Looking at the 12 hidden, in 7 the roundup site’s row named a different product from the application page. Four shops of one chain said “energy card set,” and three others said “expansion pack.” The application page (the lottery form) and the shop’s X account showed it was actually a “card set, 9-pack set, 10,800 yen.”

  The app’s “price gate” (which rejects items whose listing price does not match the product’s list price) was correctly rejecting them. What was wrong was not the gate but the product mix-up. I reassigned the products and restored them to visible.

### What the “9-pack set” really was

  This “9-pack set” is a card set of Pokémon Card 30th CELEBRATION, which is 9 products, each a set of the starter trio from nine generations. The catalog had these 9 products registered correctly from the beginning. But each time a marketplace listing or X monitoring created a new article, a bug registered it as another product named after only one of the three, in several of the 9 products. For example, a product with only “Hinoarashi.”

### The same product, never matching

  The matching has a process that makes a “key” for comparing product names. It had a left-right asymmetry.

- On the other side, “card set 9-pack” has the trailing “9-pack” dropped before comparing.

- On the catalog side, “card set 9-kinds set” is not dropped.

  The same product never matched. As a result, the other side’s name was wrongly resolved to a different product such as “energy card set” or “expansion pack.” That was where the mix-up came from. I applied the same rule to both sides (drop “N packs,” “N kinds” and “set”), and also made names that carry a number specification not be settled to one by partial match. I confirmed that there are 0 key collisions across the whole catalog.

### Another hole: the previous article blocked the next round

  The main cause of “not in the feed” was elsewhere. The article ID was made from “roundup URL + shop + product,” and it did not include the lottery round. The expired article from the previous round stopped the new round’s article for the same shop and product from being created (“the same article ID already exists”). If the new round’s deadline is more than 1 day later than the previous one, it now creates an article with a different ID that adds the date.

### Result

    Coverage | Before | After

    Chusen Zukan (90 open) | 54% (49) | 91% (82)

    Pokechu | 86% | 90%

  The remainder are cases where the application page only says “various products” so the product cannot be identified, where the page has no clue to the shop name, and so on. They include ones I decided not to adopt for safety. The misses did not become zero.

### What I learned

> A gate that rejected correctly and wrong data are different problems.

- Before doubting what was rejected, look at why it was rejected. The price gate worked correctly; what was wrong was the product mix-up.

- The cause of “does not match” can be a left-right asymmetry in how you compare. The same product never matching was a mismatch of rules, not dirty data.

- You do not see gaps unless you count coverage. Only when the number 54% came out did I know where to fix.

  The numbers in this article come from my hand-over notes (§272, §281) and commit record (October 7, 2026).

## 393 “work-name-only” products from an official list: the name field did not contain the product form

  Record from 2026-10-17.

The product list of my app Toreca Dash is partly built from official site lists. Counting products created by that import per day, I saw 502 in one day, against the usual 1 to 10.

  Looking inside, 379 were Weiss Schwarz, and the names looked like this:

  GA Bunko
Makai Senki Disgaea 4
Goddess of Victory: NIKKE
Love Live! Nijigasaki High School Idol Club
  All of them were names of works, not names of products. This is the cause, and a side effect that appeared after the clean-up.

  Numbers come from my work log of 7 September 2026.

### The cause: the product form was outside the name

  On the official list page, the name field (products__name) holds only the work name. The product form (booster pack, trial deck) is in the category (part of the page URL).

    Category | Real data in the name field

      booster-pack | “Azur Lane Vol.3”, “Stellasora”, “anemoi”

      trial-deck | “Girls und Panzer Oarai Girls Academy”, “GA Bunko”

  The right product name carries the form, like “Trial Deck GA Bunko”. It then matches existing correct products such as “Booster Pack D4DJ Groovy Mix”.

### The fix: at the entrance, and for what was already made

  Entrance: add the form from the category (trial-deck becomes trial deck, booster-pack becomes booster pack, and so on). If the form cannot be decided (“others”), do not add it and do not create the product.

  Existing items: I made a clean-up tool. By default it only previews; it deletes with delete=true. It deletes only items for which all four are true:

- created from the official list,

- no form word in the name,

- no articles attached,

- no official price and no image.

  The preview found 393. After the run, products went from 811 to 418. One, “[Oshi no Ko] Vol.3”, has articles attached, so I kept it. Over-deletion draws no complaints, so I keep the conditions strict.

  After cleaning I re-imported the official list and re-registered 328 Weiss Schwarz entries with correct names (form attached, like “Trial Deck Is the Order a Rabbit??”). Zero entries lack a form word.

### Why no audit caught it

  The name audit looks for “unnatural product names”: symbols, line breaks, URLs. Proper Japanese work names do not look unnatural. “Love Live! Nijigasaki High School Idol Club” is a perfectly good name.

  The other gap: there was no audit that counts. Counting “products created per day” would have made 502 obvious. If you only look at what is shown, things that quietly increase are invisible.

### A side effect: alias collisions from 0 pairs to 250

  Adding 328 correctly named products caused a new problem. Products have alternative names (aliases). An existing product’s alias, “Booster Pack Is the Order a Rabbit??”, collided with the new official-name product. The audit that counts aliases claimed by two or more products went from 0 pairs to 250.

  I ran the repair tool the audit points to, previewing first. The rule is “keep the one that uses the name as its official name”; only the other product loses it. 253 ambiguous aliases (220 products) were removed, and the audit returned to 0.

### What I learned

> After a change that grows the catalogue, run the audits again.

- Check what a source field really contains on real data. The “name” field does not necessarily hold the product name.

- Count how many are created per day. 502 would have been obvious.

- When deleting, require all conditions. Keep anything that has articles.

- More names mean more collisions. If you fix the entrance and stop, the next person sees 250 in an audit that should be 0.

## A typo born once multiplied across shops: the “30th SEREBRATION” incident

  Record from 2026-10-08.

In my iOS app Torecadash, a user reported: “this article duplicates another one, and the product name is odd.” When I looked, a misspelled product created just once was being reused every time an article from a shop arrived, and it kept multiplying. The cause, the fix, and the limits of the fix are written from my commit record.

  This is a development log of the app.

### What was reported

  Articles for the Pokémon Card product “30th CELEBRATION” were appearing at several shops under the product name “30th SEREBRATION” (a misspelling of CELEBRATION). They also duplicated the articles with the correct name for the same product.

### Root cause: a short heading did not match the official name

  Summaries posted by roundup sites have short headings like “‘30th CELEBRATION’.” The official name in the app’s catalog is “Expansion Pack ‘30th CELEBRATION’.” The short heading is shorter than the official name, so a one-direction check of “does the article title contain the official name” did not match.

  When there was no match, it went to AI matching. Along that path, just once, a misspelled product “30th SEREBRATION” was created. My commit guesses it came from a mistake when converting another spelling in the catalog (“30th セレブレーション” in katakana) to the Latin alphabet.

  The real trouble came next. Once a misspelled product is created, it is reused repeatedly as an “existing product.” Each time a new article arrived from a shop, the same typo and the same duplicate were mass-produced.

### First, fix the data

  I checked all shops. At three shops including Bic Camera, Sanyodo Shoten and Game Plaza, it duplicated an article with the correct name, so I hid one of each. The other 10 articles only needed their product reassigned. 13 articles in total. I deleted the misspelled product.

  I left one thing alone on purpose. The existing tool for merging products judged “SEREBRATION” and “CELEBRATION” as different products and refused. That gate is intentionally strict, so I did not loosen it. I fixed these by hand, one by one.

### The real prevention: pick up short headings by “exact match”

  Fixing the data alone would let it happen again. So I fixed the matching with the official catalog. I strip one generic form word (such as “Expansion Pack”) from the front of the official name, and treat it as the same product only when what remains exactly matches the article title.

  I chose “exact match” instead of “contains” so as not to pick up more specific, different products such as “30th CELEBRATION Card Set X.” Now it matches the official catalog correctly from the start, and never reaches the AI matching path where the typo was born. The results I confirmed:

- “30th CELEBRATION” matches the official product correctly.

- The misspelled “30th SEREBRATION” does not match (it is not wrongly treated as official).

- Existing exact matches, other genres and unrelated set names behave as before.

### Safety net: an edit-distance check, and its limits

  As a precaution, I also added a check at the point just before a product is created: “a candidate with a small edit distance from the official catalog is strongly suspected to be a typo, so reject it.” But this check alone cannot catch “30th SEREBRATION” against “Expansion Pack ‘30th CELEBRATION’.” The difference in length is too large, so the edit distance is far (I confirmed this).

  So the safety net does not work for this case. What works is the main fix above. I kept the safety net to catch other typos of the same length (for example, Weiss Schwarz names missing a “/”). I also built a read-only audit that finds catalog entries suspected of typos. At the time of the commit it found 21 suspects of the same shape.

### What I learned

> A mistake born once becomes “existing,” and multiplies.

- Wrong data multiplies by itself. What was created becomes the thing reused next time. Fixing the data is not enough; you have to fix the path by which it is born.

- “Exact match” over “contains.” Picking up widely drags in other products.

- Check the limits of a safety net and write them down. Instead of assuming “this check prevents it,” I checked first that it does not work for this typo.

- Do not loosen a strict gate. What the merge tool rejected was the correct behavior.

  This article is written from my commit record (September 28, 2026). How the typo was born is the commit’s guess.

## Fixing product genre from the official catalogue: three dry runs took 13 changes down to 4

  Record from 2026-10-17.

In my app Toreca Dash a report said: “this product being treated as a Pokémon card is wrong in the first place”. The product was “Winning enemy! Reversal, the Oni’s ∞ Dispectar!!”. It is a Duel Masters product, but had been registered as a Pokémon card product and shown in the Pokémon feed.

  The fix was “make the official catalogue the source of truth for genre”. But before applying it in bulk I needed three dry runs before it was safe. This is that process.

  Numbers come from my work log of 11 September 2026.

### Why a Duel Masters product became Pokémon

  Store X accounts are monitored as “Pokémon card” accounts, so an article’s genre becomes its product’s genre. This product’s name has neither the game’s name nor a product code. The two existing judgements (guess from words in the name, guess from the product code) could answer neither.

  The official catalogue lists it as “DM26-RP3 Duel Masters TCG Reverse Card chapter 3 Winning enemy! Reversal, the Oni’s ∞ Dispectar!!”. Like the product name, image and price, genre too belongs to the official source. I added a judgement “decide genre from the official catalogue” and put the same judgement in both the entrance (creating products) and the re-apply step (fixing existing products).

### Dry run 1: nine correct products were about to be moved to another game

  The first rule was “if the name is wholly contained in a set name of exactly one genre, use that genre”. A dry run (results only, no writes) gave 13 to fix. Nine correct Weiss Schwarz products would have been moved to Union Arena.

    Run | Rule | To fix | What was in it

      1 | Name wholly contained in one genre’s set | 13 | 9 correct Weiss products moved to Union Arena

      2 | + ambiguity checked on the work name with form words removed | 9 | 5 Weiss products still misfired

      3 | + only when the official set name itself names the game or a code | 4 | 0 misfires

### The real cause: the official list does not cover old sets

  Misfires came from the official list not including older sets (Weiss Schwarz has 64, only recent ones). Also a set name that is only a form word plus a work name, such as “Booster Pack Chainsaw Man”, does not identify the game, because the same work’s cards appear in several games.

  So I trust a match only when the set name contains a game name such as “Duel Masters TCG” or “ONE PIECE”, or a code only that genre uses such as [SB02], [EVX13] or DM26-RP3.

  The four left were all correct fixes:

  pokemon    → onepiece     "Heroines Edition"        (ONE PIECE ... [EB-03])
pokemon    → duelmasters  "Winning enemy! Reversal..." (the reported one)
yugioh     → dragonball   "MANGA BOOSTER 02"        ([SB02])
dragonball → gundam       "Premium Card Collection 02" ([EVX13])

### One more: a product name written across lines was treated as “not written”

  The same day another automatic report came in: “rejected a match whose product-name fingerprint did not match”. Stores’ X posts write product names across several lines.

  [On sale today]
○ Union Arena
Advanced Deck
∟ BLEACH Thousand-Year Blood War
Limit one per person

* Booster Pack "BLEACH Thousand-Year Blood War Vol.3" is
sold by lottery. Only winners may buy.
  The match code has a rule: “if the chosen product name appears whole in the title, say nothing”. But it did not strip the leading “∟”, so it judged the name as not whole in the title. It then used another product in the same post (“Booster Pack BLEACH Thousand-Year Blood War Vol.3”) as grounds to reject a correct match.

  Several products in one post is normal. The fix was to add continuation marks (∟ └ ┗ ├ ┣ ⇒ → ▶ >) to the comparison-only normaliser. It is called from 6 places, so one fix applies to all. I confirmed on real data that a rejection becomes an acceptance.

### What I learned

> One dry run is not enough.

- An official list is not complete. Do not stop at “trust it if it is listed”; narrow to “only when it names itself”.

- Dry-run before you write. 13 in run 1, 4 in run 3, and 0 misfires.

- Put the same judgement at the entrance and the re-apply step. One of them alone leaves a gap.

- Normalise writing variants before comparing. One “∟” dropped a correct match.

## “That’s just a Beyblade” came back after I added a gate: the blocked value leaked in another form

  Record from 2026-10-17.

My app Toreca Dash received three reports: “this is just a Beyblade”. An app that gathers trading-card information had a toy, Beyblade, registered as a product.

  On 6 September I had added a gate: “do not create a product if the product name contains a toy’s name”. Yet it came back. This article is about a value I had blocked coming back in a different form.

  Numbers come from my work logs of 6 to 11 September 2026.

### I added the gate, but the toy’s name had vanished from the product name

  The store announcement was:

  New toy: Beyblade X
(1) CX-19 Random Booster Kuro Tread set
(2) CX-00 Tigerage FT3-60T
  An AI builds product names from it, and the products created were:

  "CX-19 Random Booster Kuro Tread Select"
"CX-00 'Tigerage' FT3-60T"
  Neither contains the word “Beyblade”. My gate rejected a product name that contained a toy’s name. Because the AI’s product name no longer had it, the gate let it through. The value I had blocked (the toy’s name) returned in another form (a product name without it).

### The fix: judge on the announcement text, not the product name

  I moved the judgement to the announcement body, not the product name. The body states the toy’s name.

  But “contains a toy’s name, so reject” would not do. Store announcements sometimes list both toys and card games, such as “[Beyblade] [Dragon Ball Card Game]”. Rejecting would remove real lotteries. So the rule is: reject only when no card-game word appears at all.

  Counting on real data:

    What I checked | Count

      Articles that touch a toy line | 44

      Of those, matching the rule (no card-game word) | 31

      Of those, displayed | only the reported one

      Articles with a card-game word (all kept) | 13

### What I learned

> A blocked value comes back in another form. Follow where the value goes.

- When you add a gate, follow where the blocked value leaks. Stop it creating products and it survives in a title or another field.

- Judge close to the source of the material. The original announcement is more reliable than a product name processed by an AI.

- Do not reject on “present” alone. Listings are mixed, so limit it to “no other word at all”.

- Count what remains for a rejecting rule. I confirmed the 13 stay.

## Key points of each

- English and katakana names share no characters: The market-price link rate fell to 39%. The products existed on the market site, but my English names and its katakana names share no characters, so 42 matches were rejected in 26 hours. I kept the gate and added a narrow second judgement for this match only.

- Three mix-ups in splitting one article into products: Reprocessing a split “child” hid 60 lotteries closing that day (23 stores); a link-only lookup shared by 13 stores picked another store’s parent; names claimed by two products numbered 267 pairs. Real items vanished with nothing on screen.

- Splitting a “9-pack set” by contents created 80 fake products: One real product was split by its contents, creating 80 products that do not exist. Stopping the entry, restoring 22 parents, detaching 190 children and an audit.

- The “9-pack set” was nine different products: Matching my app against roundup sites showed 54% of lotteries displayed: a product mix-up, an asymmetric name key and an article ID that blocked new rounds.

- 393 “work-name-only” products from an official list: An official-list import created 502 products in one day (usually 1–10). The name field held only the work name; the form was in the category. Cleaning 393 and re-registering 328 correct names took alias collisions from 0 pairs to 250.

- A typo born once multiplied across shops: A misspelled product created once was reused as an existing product for every shop. Fixing 13 articles, exact-match prevention, and the limits of a safety net.

- Fixing product genre from the official catalogue: A Duel Masters product was registered as Pokémon. Making the official catalogue the source of truth, my first dry run would have moved nine correct Weiss Schwarz products to another game; after three dry runs there were 0 misfires.

- “That’s just a Beyblade” came back after I added a gate: A gate “do not create a product whose name contains a toy’s name” was bypassed because the AI’s product name lost the toy’s name. I moved the judgement to the announcement body and rejected only when no card-game word appears.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/tcg-product-matching/).

  More development logs, by theme: Notes (https://koshinstudio.com/en/notes/). About the app: Toreca Dash (https://koshinstudio.com/en/works/torecadash/).
