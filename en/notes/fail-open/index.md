# It let things through when it could not check: how “fail-open” brought in resale items

> A gate that let items pass when the list price could not be confirmed had a blind spot: a daily search cap. Telling “did not know” from “could not look.”

- URL: https://koshinstudio.com/en/notes/fail-open/
- Original (Japanese): https://koshinstudio.com/notes/fail-open/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/fail-open/)

Development log of Torecadash / October 2026

  In my iOS app Torecadash, three in-app bug reports said “lots of resale prices are coming in from Amazon.” One was an obvious resale item at ¥79,800. The cause was a blind spot in a design I had put in on purpose: “if it cannot be confirmed, let it pass.” This is from my hand-over notes and the commit record (July 30, 2026).

  This is a development log of the app.

## The price gate, and the “let it pass” design

  The app picks up listings from online shops (Rakuten, Yahoo! Shopping, Amazon and others) and shows them in a feed. There is a “price gate” that checks whether a listing’s price is reasonable against the product’s list price. It has an AI (with web search) look up the list price, and rejects extremely expensive resale items.

  The gate had a behavior: “if the list price could not be confirmed, let it pass without review.” That was intended. If you exclude products whose list price the AI genuinely does not know just because you cannot confirm it, you also erase genuine listings. This is so-called fail-open (open on failure, meaning let it pass).

## The blind spot: hitting the search cap took the same path

  The AI’s web search has a cap of 300 calls a day (a circuit breaker to prevent unexpected cost). But the gate did not distinguish the reason the list price could not be confirmed.

- The AI answered “I do not know the list price of this product.”

- The daily cap was reached, so the check itself could not be done.

  Both went down the same “price unknown → let it pass” path. The first is as intended. The second is just “the road was closed before looking,” yet the gate became wide open.

## Why the hole did real damage

  The hole surfaced because of a previous change (the one that widened Amazon’s scope). Widening the scope suddenly increased the number of products whose price had to be newly checked. As a result, the daily cap was reached often. While it was reached, the gate was open and resale items mixed in in large numbers.

  There was secondary damage too. A result of “list price unknown” was designed to be cached for 24 hours regardless of reason. So a product that once hit the cap stayed open for up to 24 hours even after the cap was released.

## The fix: distinguish the reason

  I created a dedicated marker (QUOTA_EXCEEDED) so the two could be told apart.

    Situation | What the gate does

    The AI genuinely did not know the list price (null) | Let it pass as before (still fail-open)

    The daily cap meant the check itself could not be done (QUOTA_EXCEEDED) | Exclude (fail-close)

  The latter is not put into the 24-hour cache either. It tries to confirm again the next time it is called. This gate is shared by every feature that uses price review: Rakuten, Yahoo! Shopping, Amazon, AI listing discovery, first-come Rakuten Books and so on, so one fix reaches widely (the commit record says 18 functions were deployed).

  I hid the three reported items by hand. After that, the re-review batch that runs every 5 minutes is expected to pick up the same misses again.

  What I have not verified: my notes say “check in the next session whether resale-price reports stopped after the cap reset.” There is no result for that in the record at the time of writing.

## Is the same hole in other decisions?

  In a later check (July 30, 2026), I looked at the other AI decisions such as deciding sales format and matching products. All of them are designed to fall to the safe side (exclude, or null) on failure, and I found no new fail-open hole.

## What I learned

> “Could not confirm” comes in two kinds: did not know, and could not look.

- Before using a let-it-pass design, make clear the reason it is fine to let through. “Let it through because I do not know” and “let it through because I cannot look” are different things.

- Do not cache the result of a failure regardless of its reason. I froze a temporary failure for 24 hours.

- One change can turn a hole elsewhere into real damage. Widening Amazon’s scope brought the cap’s hole to the surface.

  This article is written from my hand-over notes (session 182) and the commit record (July 30, 2026).

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/fail-open/).

  More in English

- All English pages (https://koshinstudio.com/en/)
