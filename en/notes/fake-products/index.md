# Splitting a “9-pack set” by contents created 80 fake products

> One real product was split by its contents, creating 80 products that do not exist. Stopping the entry, restoring 22 parents, detaching 190 children and an audit.

- URL: https://koshinstudio.com/en/notes/fake-products/
- Original (Japanese): https://koshinstudio.com/notes/fake-products/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/fake-products/)

Development log of Torecadash / October 2026

  While inspecting the product list of my iOS app Torecadash, I found 80 products that do not exist around the Pokémon Card “30th CELEBRATION Card Set.” There are only 9 official products. The other 80 were fake products created as a result of splitting a “9-pack set” by its contents. What happened and how I fixed it are written from my hand-over notes.

  This is a development log of the app.

## The 9-pack set was “one product”

  The lottery for a “card set (9-pack set)” that a shop offers is one product. In the catalog it is registered as a “9-kinds set” (10,800 yen). But the app’s product matching (the step that splits an article mentioning several products into one per product) split this title by contents. Names of the nine contents, such as “Mega Mewtwo X” and “Nyabby,” were each treated as a separate product.

  As a result, this is what it looked like:

    State | Count

    Original articles that had been split (parents) were hidden | 22

    Articles created by splitting (children) | 190 (63 visible)

    Fake products created for the children | 80

  On screen, one lottery appeared as if it were separate lotteries for each content item.

## The fix: stop the entry, then put things back

- Do not split at the entry. A title of the form “card set” + “N kinds” is not split.

- Restore the parents. I put the 22 hidden parents back onto the “9-kinds set” product. How I restored each differed (5 back to visible, 3 treated as duplicates because the same shop already had a visible 9-pack set, 13 whose deadline had passed, and 1 with no deadline).

- Detach the children. I marked the 190 children with a “wrong split” flag (hiddenByWrongSplit), hid them, and removed their link to a product.

- Delete the fake products. I deleted the 80. Before deleting, I confirmed that nothing referenced them and saved the original contents as a backup.

  There is an exception. A listing like “Starter Set ex Nyaoha / Hogator / Quaxly 3-kinds set,” where the title spells out all the product names, is still split as before. What I learned this time is that an “N-kinds set” is sold as one product.

## Other fake products found in the same inspection

- Things that are not cards. Products for apparel, figures, tournaments and music CDs had been created between September 3 and October 3. I added a gate at the entry for names that are not cards (looksLikeNonCardMerchOrEventName) and confirmed 0 false hits across the whole catalog. I deleted 25.

- Single cards. I deleted a total of 30 single-card products that came from Snkrdunk listings. Some of those single cards had a “list price.” Having a list price turned out not to be proof of an official cross-check. The proof is imageIsOfficial.

- A product combining three packs. I deleted one unofficial product that lined up several set names. Its 49 linked articles were all expired.

  To watch for these, I added an audit (audit_catalog_clean.js). Each time it counts five things: single-card products, products with several set names, mismatches between an application page’s title and the product, drift of list prices copied from products, and products with non-card names.

## What I learned

> A “split” process needs a “do not split” condition.

- Splitting one product into several multiplies fake products. Splitting should happen only after checking “is it really several products.”

- Count references before deleting. I deleted only after confirming zero references and a saved backup.

- Stop fake products at both the entry and the contents. An entry gate alone leaves what already exists. An audit counts what remains.

  This article is written from my hand-over notes (§272) (October 7, 2026). The counts are as written in the notes.

  Related

- The “9-pack set” was nine different products (https://koshinstudio.com/en/notes/torecadash-9set/) — the matching record for the same product

- I counted duplicates as zero, but the audit found 112 pairs (https://koshinstudio.com/en/notes/dup-zero/) — another record from the same day

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/fake-products/).

  More in English

- All English pages (https://koshinstudio.com/en/)
