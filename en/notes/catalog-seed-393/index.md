# 393 “work-name-only” products from an official list: the name field did not contain the product form

> An official-list import created 502 products in one day (usually 1–10). The name field held only the work name; the form was in the category. Cleaning 393 and re-registering 328 correct names took alias collisions from 0 pairs to 250.

- URL: https://koshinstudio.com/en/notes/catalog-seed-393/
- Original (Japanese): https://koshinstudio.com/notes/catalog-seed-393/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/catalog-seed-393/)

Development log of the Toreca Dash app / September 2026

  The product list of my app Toreca Dash is partly built from official site lists. Counting products created by that import per day, I saw 502 in one day, against the usual 1 to 10.

  Looking inside, 379 were Weiss Schwarz, and the names looked like this:

  GA Bunko
Makai Senki Disgaea 4
Goddess of Victory: NIKKE
Love Live! Nijigasaki High School Idol Club
  All of them were names of works, not names of products. This is the cause, and a side effect that appeared after the clean-up.

  Numbers come from my work log of 7 September 2026.

## The cause: the product form was outside the name

  On the official list page, the name field (products__name) holds only the work name. The product form (booster pack, trial deck) is in the category (part of the page URL).

    Category | Real data in the name field

      booster-pack | “Azur Lane Vol.3”, “Stellasora”, “anemoi”

      trial-deck | “Girls und Panzer Oarai Girls Academy”, “GA Bunko”

  The right product name carries the form, like “Trial Deck GA Bunko”. It then matches existing correct products such as “Booster Pack D4DJ Groovy Mix”.

## The fix: at the entrance, and for what was already made

  Entrance: add the form from the category (trial-deck becomes trial deck, booster-pack becomes booster pack, and so on). If the form cannot be decided (“others”), do not add it and do not create the product.

  Existing items: I made a clean-up tool. By default it only previews; it deletes with delete=true. It deletes only items for which all four are true:

- created from the official list,

- no form word in the name,

- no articles attached,

- no official price and no image.

  The preview found 393. After the run, products went from 811 to 418. One, “[Oshi no Ko] Vol.3”, has articles attached, so I kept it. Over-deletion draws no complaints, so I keep the conditions strict.

  After cleaning I re-imported the official list and re-registered 328 Weiss Schwarz entries with correct names (form attached, like “Trial Deck Is the Order a Rabbit??”). Zero entries lack a form word.

## Why no audit caught it

  The name audit looks for “unnatural product names”: symbols, line breaks, URLs. Proper Japanese work names do not look unnatural. “Love Live! Nijigasaki High School Idol Club” is a perfectly good name.

  The other gap: there was no audit that counts. Counting “products created per day” would have made 502 obvious. If you only look at what is shown, things that quietly increase are invisible.

## A side effect: alias collisions from 0 pairs to 250

  Adding 328 correctly named products caused a new problem. Products have alternative names (aliases). An existing product’s alias, “Booster Pack Is the Order a Rabbit??”, collided with the new official-name product. The audit that counts aliases claimed by two or more products went from 0 pairs to 250.

  I ran the repair tool the audit points to, previewing first. The rule is “keep the one that uses the name as its official name”; only the other product loses it. 253 ambiguous aliases (220 products) were removed, and the audit returned to 0.

## What I learned

> After a change that grows the catalogue, run the audits again.

- Check what a source field really contains on real data. The “name” field does not necessarily hold the product name.

- Count how many are created per day. 502 would have been obvious.

- When deleting, require all conditions. Keep anything that has articles.

- More names mean more collisions. If you fix the entrance and stop, the next person sees 250 in an audit that should be 0.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/catalog-seed-393/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
