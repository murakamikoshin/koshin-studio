# The “9-pack set” was nine different products: the same product that never matched

> Matching my app against roundup sites showed 54% of lotteries displayed: a product mix-up, an asymmetric name key and an article ID that blocked new rounds.

- URL: https://koshinstudio.com/en/notes/torecadash-9set/
- Original (Japanese): https://koshinstudio.com/notes/torecadash-9set/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/torecadash-9set/)

Development log of Torecadash / October 2026

  My iOS app Torecadash collects lottery and first-come sale information for trading cards and notifies users. To check for gaps, I match and count listings on other roundup sites (Chusen Zukan, Pokechu) against the articles in my own app. When I measured on October 7, most gaps came from a small discrepancy: the same product that never matched. This is from my hand-over notes and commit record.

  This is a development log of the app.

## What I measured

  With read-only access, I checked “are all lotteries introduced by the roundup sites shown in the app?”

- Chusen Zukan: of 90 open lotteries, 49 (54%) were displayed in the app. 12 had an article but were hidden, and 29 were not in the feed.

- Pokechu: 18 of 21 (86%).

- X roundup posts: 606 posts in 72 hours. Only 9 linked to an article.

## Of the 12 hidden, 7 were because the row was wrong

  Looking at the 12 hidden, in 7 the roundup site’s row named a different product from the application page. Four shops of one chain said “energy card set,” and three others said “expansion pack.” The application page (the lottery form) and the shop’s X account showed it was actually a “card set, 9-pack set, 10,800 yen.”

  The app’s “price gate” (which rejects items whose listing price does not match the product’s list price) was correctly rejecting them. What was wrong was not the gate but the product mix-up. I reassigned the products and restored them to visible.

## What the “9-pack set” really was

  This “9-pack set” is a card set of Pokémon Card 30th CELEBRATION, which is 9 products, each a set of the starter trio from nine generations. The catalog had these 9 products registered correctly from the beginning. But each time a marketplace listing or X monitoring created a new article, a bug registered it as another product named after only one of the three, in several of the 9 products. For example, a product with only “Hinoarashi.”

## The same product, never matching

  The matching has a process that makes a “key” for comparing product names. It had a left-right asymmetry.

- On the other side, “card set 9-pack” has the trailing “9-pack” dropped before comparing.

- On the catalog side, “card set 9-kinds set” is not dropped.

  The same product never matched. As a result, the other side’s name was wrongly resolved to a different product such as “energy card set” or “expansion pack.” That was where the mix-up came from. I applied the same rule to both sides (drop “N packs,” “N kinds” and “set”), and also made names that carry a number specification not be settled to one by partial match. I confirmed that there are 0 key collisions across the whole catalog.

## Another hole: the previous article blocked the next round

  The main cause of “not in the feed” was elsewhere. The article ID was made from “roundup URL + shop + product,” and it did not include the lottery round. The expired article from the previous round stopped the new round’s article for the same shop and product from being created (“the same article ID already exists”). If the new round’s deadline is more than 1 day later than the previous one, it now creates an article with a different ID that adds the date.

## Result

    Coverage | Before | After

    Chusen Zukan (90 open) | 54% (49) | 91% (82)

    Pokechu | 86% | 90%

  The remainder are cases where the application page only says “various products” so the product cannot be identified, where the page has no clue to the shop name, and so on. They include ones I decided not to adopt for safety. The misses did not become zero.

## What I learned

> A gate that rejected correctly and wrong data are different problems.

- Before doubting what was rejected, look at why it was rejected. The price gate worked correctly; what was wrong was the product mix-up.

- The cause of “does not match” can be a left-right asymmetry in how you compare. The same product never matching was a mismatch of rules, not dirty data.

- You do not see gaps unless you count coverage. Only when the number 54% came out did I know where to fix.

  The numbers in this article come from my hand-over notes (§272, §281) and commit record (October 7, 2026).

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/torecadash-9set/).

  More in English

- All English pages (https://koshinstudio.com/en/)
