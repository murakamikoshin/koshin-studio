# Three mix-ups in splitting one article into products: a child treated as a parent, a shared link pointing to another store, a name owned by two products

> Reprocessing a split “child” hid 60 lotteries closing that day (23 stores); a link-only lookup shared by 13 stores picked another store’s parent; names claimed by two products numbered 267 pairs. Real items vanished with nothing on screen.

- URL: https://koshinstudio.com/en/notes/split-mixups/
- Original (Japanese): https://koshinstudio.com/notes/split-mixups/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/split-mixups/)

Development log of the Toreca Dash app / September 2026

  My app Toreca Dash has a process that splits a store announcement into one article per product. If one announcement says “lotteries for Pokémon card A and B”, it makes an article for A and one for B. I call the split articles children and the original the parent.

  Around this process I found three mix-ups. In each, a real lottery disappeared and nothing showed on screen.

  Numbers come from my work logs of September 2026 (including 5 and 20 September).

## 1. Parent-level processing was applied to a child again (20 September)

  In a broad check I found that 60 lotteries (23 stores) closing at 23:59 that day were all missing from the feed.

  A child keeps the parent’s flyer image and the parent’s title (splitFromTitle). A job that re-asks about articles with several products looked at a child, read it as “9 products”, left the child’s product field empty and rewrote it as “9 items”. The next day a job that tidies generic articles (those that point to no particular product) judged it “a generic article with no product” and hid it.

  The target product IDs were the same as the existing siblings, so zero new articles were made. Only that product vanished.

  The same root cause hit a second place: the check for result announcements and winner notices missed children because a child’s title is only the product name, and the body (the parent’s title) did not reach the check (16 articles).

  The fix: when adding a job that collects, judges or hides articles, always decide to exclude children (articles with splitFromArticleId) or pass the parent title as body. The marker for “this is a child” is a field on the article, not a part of the URL, because URL markers are lost when application links are rewritten.

## 2. Looking up the parent by link alone returned another store’s article

  Ten two-product announcements from one store chain were never split. The function that finds the parent looked it up by link alone.

  That chain’s stores share one page, 13 stores with the same link. A link-only lookup hit one of:

- an ID fixed by the link alone,

- the first of the articles with that link,

- a child whose marker was lost in a link rewrite (it has the parent’s link).

  As a result it split another store’s article, or a child, again and again. The log showed “split into 2 products” for the same parent each time.

  A link is not a key that identifies a store. Shared pages, quotes and aggregator posts give several articles the same link. The fix: when looking up by link, add site and store name to the condition, and never take a child as a parent. “If the log shows the same parent ID again and again, suspect it” is now a lesson.

## 3. A name claimed by two products identifies neither (5 September)

  Products have alternative names. “30th CELEBRATION BOX” was an alias of both the expansion pack “30th CELEBRATION” and a different product, “30th CELEBRATION FUTURISTIC BOX”.

  That name identifies neither. If an AI sees it as a candidate, the result depends on which one it picked at that moment. 25 displayed articles were shown under the other product’s name.

  Counting, such “names claimed by two or more products” numbered 267 pairs and 321 articles.

  The same shape: a step that cut store names “before the ＠” merged three branches of one shop into one store and folded two of them away as duplicates every day.

  The fix: whenever a system identifies something by name, count whether two or more things claim that name. An audit keeps it at zero. Keep a name only when it is mechanically decidable (exactly one product uses it as its official name); otherwise remove it from all. Put the same judgement at the entrance and in the cleaner, or what you remove is added back.

## What I learned

> A split-off article is not the original. A name works as a key only if it has one owner.

- Do not re-run the original’s processing on derived items. Keep the child marker in a field of the article.

- A link is not a key. Also use site and store name.

- Count the owners of a name. A name claimed by two identifies nothing.

- When you add a job that hides things, count whether a replacement is really displayed. Looking only at the hidden side cannot show over-deletion.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/split-mixups/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
