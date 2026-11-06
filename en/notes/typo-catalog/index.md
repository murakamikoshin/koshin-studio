# A typo born once multiplied across shops: the “30th SEREBRATION” incident

> A misspelled product created once was reused as an existing product for every shop. Fixing 13 articles, exact-match prevention, and the limits of a safety net.

- URL: https://koshinstudio.com/en/notes/typo-catalog/
- Original (Japanese): https://koshinstudio.com/notes/typo-catalog/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/typo-catalog/)

Development log of Torecadash / October 2026

  In my iOS app Torecadash, a user reported: “this article duplicates another one, and the product name is odd.” When I looked, a misspelled product created just once was being reused every time an article from a shop arrived, and it kept multiplying. The cause, the fix, and the limits of the fix are written from my commit record.

  This is a development log of the app.

## What was reported

  Articles for the Pokémon Card product “30th CELEBRATION” were appearing at several shops under the product name “30th SEREBRATION” (a misspelling of CELEBRATION). They also duplicated the articles with the correct name for the same product.

## Root cause: a short heading did not match the official name

  Summaries posted by roundup sites have short headings like “‘30th CELEBRATION’.” The official name in the app’s catalog is “Expansion Pack ‘30th CELEBRATION’.” The short heading is shorter than the official name, so a one-direction check of “does the article title contain the official name” did not match.

  When there was no match, it went to AI matching. Along that path, just once, a misspelled product “30th SEREBRATION” was created. My commit guesses it came from a mistake when converting another spelling in the catalog (“30th セレブレーション” in katakana) to the Latin alphabet.

  The real trouble came next. Once a misspelled product is created, it is reused repeatedly as an “existing product.” Each time a new article arrived from a shop, the same typo and the same duplicate were mass-produced.

## First, fix the data

  I checked all shops. At three shops including Bic Camera, Sanyodo Shoten and Game Plaza, it duplicated an article with the correct name, so I hid one of each. The other 10 articles only needed their product reassigned. 13 articles in total. I deleted the misspelled product.

  I left one thing alone on purpose. The existing tool for merging products judged “SEREBRATION” and “CELEBRATION” as different products and refused. That gate is intentionally strict, so I did not loosen it. I fixed these by hand, one by one.

## The real prevention: pick up short headings by “exact match”

  Fixing the data alone would let it happen again. So I fixed the matching with the official catalog. I strip one generic form word (such as “Expansion Pack”) from the front of the official name, and treat it as the same product only when what remains exactly matches the article title.

  I chose “exact match” instead of “contains” so as not to pick up more specific, different products such as “30th CELEBRATION Card Set X.” Now it matches the official catalog correctly from the start, and never reaches the AI matching path where the typo was born. The results I confirmed:

- “30th CELEBRATION” matches the official product correctly.

- The misspelled “30th SEREBRATION” does not match (it is not wrongly treated as official).

- Existing exact matches, other genres and unrelated set names behave as before.

## Safety net: an edit-distance check, and its limits

  As a precaution, I also added a check at the point just before a product is created: “a candidate with a small edit distance from the official catalog is strongly suspected to be a typo, so reject it.” But this check alone cannot catch “30th SEREBRATION” against “Expansion Pack ‘30th CELEBRATION’.” The difference in length is too large, so the edit distance is far (I confirmed this).

  So the safety net does not work for this case. What works is the main fix above. I kept the safety net to catch other typos of the same length (for example, Weiss Schwarz names missing a “/”). I also built a read-only audit that finds catalog entries suspected of typos. At the time of the commit it found 21 suspects of the same shape.

## What I learned

> A mistake born once becomes “existing,” and multiplies.

- Wrong data multiplies by itself. What was created becomes the thing reused next time. Fixing the data is not enough; you have to fix the path by which it is born.

- “Exact match” over “contains.” Picking up widely drags in other products.

- Check the limits of a safety net and write them down. Instead of assuming “this check prevents it,” I checked first that it does not work for this typo.

- Do not loosen a strict gate. What the merge tool rejected was the correct behavior.

  This article is written from my commit record (September 28, 2026). How the typo was born is the commit’s guess.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/typo-catalog/).

  More in English

- All English pages (https://koshinstudio.com/en/)
