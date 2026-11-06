# English and katakana names share no characters: a fingerprint gate rejected 42 correct matches

> The market-price link rate fell to 39%. The products existed on the market site, but my English names and its katakana names share no characters, so 42 matches were rejected in 26 hours. I kept the gate and added a narrow second judgement for this match only.

- URL: https://koshinstudio.com/en/notes/transliteration-gate/
- Original (Japanese): https://koshinstudio.com/notes/transliteration-gate/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/transliteration-gate/)

Development log of the Toreca Dash app / August 2026

  My app Toreca Dash fetches each product’s market price from a site with real trading records and shows it next to the official price. But the health check said:

  Market-price link rate dropped: 177 / 449 (39%)
  I could have written it off as “new sets are not on that site yet”. But when I searched that site, the products were there. This is the real reason and the fix.

  Written from my work log of 24 August 2026.

## The products were on the market-price site

  Mine     Expansion Pack "30th CELEBRATION"
Market   Pokémon Card Game MEGA Expansion Pack "30th Anniversary Celebration" Box (exists)

Mine     QUARTER CENTURY TRINITY BOX
Market   Yu-Gi-Oh! OCG Duel Monsters Quarter Century Trinity Box (in katakana; exists)

Mine     Start Deck Blue Kuzan [ST-33]
Market   One Piece Card Game Start Deck "Blue Kuzan" (exists)

## The cause: a fingerprint check that structurally cannot match

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

## The fix: do not weaken the fingerprint; add a second, narrow judgement for this match only

  Loosening the fingerprint check would loosen its other uses too (registering aliases, merging duplicates) and the original corruption would return. I never weaken it.

  Instead, only for candidates the market match rejected on fingerprint, I added a second judgement on one point: “is this the English and katakana forms of the same proper name?” (snkrdunkNamesAreTransliterationMatch).

- Candidates with conflicting product codes are rejected without asking the AI. (OP-01 vs OP-17, however similar they sound.)

- The AI answers only “do they correspond in sound?”, and if unsure, always false. A language difference such as “English version” counts as a different product.

- Everything passed is logged (“confirmed as an English/katakana spelling variant”) so it can be checked later on real data.

## Check on real data: dry run first

  A “not found” verdict has a 7-day cooldown. Only for the 148 products with displayed articles, I lifted the wait and had them judged again. It is a bulk rewrite, so I checked the count with a dry run before running it.

## What I learned

> A correct gate can structurally reject correct matches. Do not weaken the gate; add a narrow second judgement.

- Do not write it off as “can’t be helped”; actually look. The products were there.

- Count a gate’s rejections and read them. Most of 42 were correct matches.

- Do not weaken the gate. Its other defences would fall too.

- Add a narrow second judgement. Reject code conflicts without the AI; allow the AI to say false when unsure.

- Log what passes. You can verify it later on real data.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/transliteration-gate/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
