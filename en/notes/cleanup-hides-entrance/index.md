# “It gets cleaned up later” hid an entrance bug: 400 near-identical products were re-created every day

> Catalogue registration looked up existing products by exact name only, so brackets, spaces and full/half-width differences re-created near-identical products daily: 437 in one day, 410 with no articles. The nightly merge job hid it.

- URL: https://koshinstudio.com/en/notes/cleanup-hides-entrance/
- Original (Japanese): https://koshinstudio.com/notes/cleanup-hides-entrance/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/cleanup-hides-entrance/)

Development log of the Toreca Dash app / August 2026

  My app Toreca Dash has a nightly clean-up job that merges duplicate products. “It will be cleaned up later, so it is fine.” That was the belief, and in that place an entrance bug was re-creating near-identical products every day.

  A full check on 27 August 2026 showed that 437 products had been created that day alone, and 410 of them had no articles attached.

  Numbers come from my work log of 27 August 2026.

## The cause: it only looked for an exact name match

  The step that registers products from the official catalogue decided “does this product already exist?” by exact name match only.

  Existing "Expansion Pack「Ancient Roar」"  ↔  Catalogue "Expansion Pack Ancient Roar"
Existing "V Starter Deck Grass (full-width space) Bulbasaur"  ↔  Catalogue "V Starter Deck Grass Bulbasaur"
  Differences in brackets, spaces or full-width versus half-width made it say “not there yet”, and near-identical products were re-created every day.

  The duplicates were later cleaned up by the weekly and daily merge jobs. That is why I did not notice. In between, users see the same product twice and article links split.

  The fix was to compare with the same normalisation the merge job uses (it absorbs brackets, spaces and full/half-width). The catalogue itself also has spelling-variant duplicates, so within one run I keep one per key.

  The lesson: a mechanism with a clean-up job “for later” hides entrance bugs. If the clean-up count is about the same every time, it is not that things are cleaned; they are being created every day.

## Another: six products absorbed into one

  Six Magic: The Gathering “FINAL FANTASY” Commander decks (Psionic Spell, Limit Break, Counter-Blitz, Trans-Reanimate and others) were all absorbed into one product.

- Another set’s name gets into a product’s aliases.

- It shows up as an AI candidate.

- It leads to the next wrong match.

  That is a self-multiplying loop. Cleaning the aliases alone did not fix it, because the AI kept choosing the same product. I added a filter that removes products whose quoted proper name differs (namesDifferentQuotedVariant) to the candidate list too. With it gone from the candidates, the AI can answer “new product” and the correct one is created.

  To remove false positives, when the quoted text is a generic word, place name, store name, quantity or state, it is not treated as a proper name. On real data, before this condition 6 of 12 were false positives.

  There was also an idea I did not adopt: a strong rule “delete if the product’s proper name is not in the aliases”. 6 of 43 were false positives (different sets with the same code, names containing “+”), so I dropped it.

## My own repair put a deadline on first-come sales

  I ran a repair job that inherits dates from articles of the same announcement page (inheritDatesFromSameAnnouncement). It gave a first-come sale (sold until stock runs out) the deadline of a lottery article on the same page. A first-come sale has no deadline, and users would see a false “you can buy until that day”.

  In both places that inherit (the save-time step and the repair job), first-come articles no longer get a deadline. I deleted the one that had been affected.

  The lesson: after running a repair job, compare the audit before and after. Looking only at “how many were fixed” hides anomalies you added yourself.

## What I learned

> A later clean-up hides entrance bugs.

- If the clean-up count is the same each time, they are made daily. It is not being cleaned up.

- Use the same normalisation at the entrance and in the clean-up. If the entrance is stricter, the clean-up covers for it.

- Cleaning aliases alone does not stop self-multiplication. Remove it from the AI’s candidates.

- Count false positives before a strong rule. 6 of 43 means dropping it.

- Compare audits before and after a repair. To find the anomalies you added.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/cleanup-hides-entrance/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
