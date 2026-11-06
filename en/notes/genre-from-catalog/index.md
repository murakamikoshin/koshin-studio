# Fixing product genre from the official catalogue: three dry runs took 13 changes down to 4

> A Duel Masters product was registered as Pokémon. Making the official catalogue the source of truth, my first dry run would have moved nine correct Weiss Schwarz products to another game; after three dry runs there were 0 misfires.

- URL: https://koshinstudio.com/en/notes/genre-from-catalog/
- Original (Japanese): https://koshinstudio.com/notes/genre-from-catalog/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/genre-from-catalog/)

Development log of the Toreca Dash app / September 2026

  In my app Toreca Dash a report said: “this product being treated as a Pokémon card is wrong in the first place”. The product was “Winning enemy! Reversal, the Oni’s ∞ Dispectar!!”. It is a Duel Masters product, but had been registered as a Pokémon card product and shown in the Pokémon feed.

  The fix was “make the official catalogue the source of truth for genre”. But before applying it in bulk I needed three dry runs before it was safe. This is that process.

  Numbers come from my work log of 11 September 2026.

## Why a Duel Masters product became Pokémon

  Store X accounts are monitored as “Pokémon card” accounts, so an article’s genre becomes its product’s genre. This product’s name has neither the game’s name nor a product code. The two existing judgements (guess from words in the name, guess from the product code) could answer neither.

  The official catalogue lists it as “DM26-RP3 Duel Masters TCG Reverse Card chapter 3 Winning enemy! Reversal, the Oni’s ∞ Dispectar!!”. Like the product name, image and price, genre too belongs to the official source. I added a judgement “decide genre from the official catalogue” and put the same judgement in both the entrance (creating products) and the re-apply step (fixing existing products).

## Dry run 1: nine correct products were about to be moved to another game

  The first rule was “if the name is wholly contained in a set name of exactly one genre, use that genre”. A dry run (results only, no writes) gave 13 to fix. Nine correct Weiss Schwarz products would have been moved to Union Arena.

    Run | Rule | To fix | What was in it

      1 | Name wholly contained in one genre’s set | 13 | 9 correct Weiss products moved to Union Arena

      2 | + ambiguity checked on the work name with form words removed | 9 | 5 Weiss products still misfired

      3 | + only when the official set name itself names the game or a code | 4 | 0 misfires

## The real cause: the official list does not cover old sets

  Misfires came from the official list not including older sets (Weiss Schwarz has 64, only recent ones). Also a set name that is only a form word plus a work name, such as “Booster Pack Chainsaw Man”, does not identify the game, because the same work’s cards appear in several games.

  So I trust a match only when the set name contains a game name such as “Duel Masters TCG” or “ONE PIECE”, or a code only that genre uses such as [SB02], [EVX13] or DM26-RP3.

  The four left were all correct fixes:

  pokemon    → onepiece     "Heroines Edition"        (ONE PIECE ... [EB-03])
pokemon    → duelmasters  "Winning enemy! Reversal..." (the reported one)
yugioh     → dragonball   "MANGA BOOSTER 02"        ([SB02])
dragonball → gundam       "Premium Card Collection 02" ([EVX13])

## One more: a product name written across lines was treated as “not written”

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

## What I learned

> One dry run is not enough.

- An official list is not complete. Do not stop at “trust it if it is listed”; narrow to “only when it names itself”.

- Dry-run before you write. 13 in run 1, 4 in run 3, and 0 misfires.

- Put the same judgement at the entrance and the re-apply step. One of them alone leaves a gap.

- Normalise writing variants before comparing. One “∟” dropped a correct match.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/genre-from-catalog/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
