# Candidates were found, yet reading the answer failed every time: a URL cut at 200 tokens, and a search that returned 400 on hyphens

> An AI reply choosing an official announcement page was cut at 200 tokens and failed every time. The result stayed 0 because store announcements name no product and the AI obeyed my instruction. Rakuten’s search returned 400 depending on hyphen position.

- URL: https://koshinstudio.com/en/notes/truncated-answer/
- Original (Japanese): https://koshinstudio.com/notes/truncated-answer/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/truncated-answer/)

Development log of the Toreca Dash app / August 2026

  In my app Toreca Dash, aggregator-derived articles get their links replaced with the store’s official announcement page. But developer-mode reports kept coming, seven in a row: “the correct announcement URL is this one; do it properly”.

  Looking into it, candidates were being found, and the step that reads the answer failed every time. This article records the real cause and a very similar case from the same period.

  Numbers come from my work logs of 23 and 24 August 2026.

## The real cause: the AI’s reply was cut off at 200 tokens

  The step that chooses the official announcement page asks an AI at the end: “which candidate is that store’s announcement?” I had set the reply’s length limit (max_output_tokens) to 200.

  But the reply contains a long URL with Japanese percent-encoded, which exceeds 200 characters on its own. The reply was cut off, could not be read as JSON, and raised Unterminated string in JSON.

  WARN [application link] official page judgement failed [shop / …]: Unterminated st…
→ all 10 targets: "not found"
  Candidates had been found. It fell over every time at reading the answer. I raised the limit to 800, and added a rescue that, if it is still cut, does not discard everything but re-extracts just the "url": "… part.

## Still 0 adopted after the fix: the AI was obeying my instruction

  Even after fixing the JSON, 0 were adopted. The log showed candidates but “none adopted”. The cause: the AI was following the instruction faithfully. Store announcements read like this:

  "[App members only] Reprint / Pokémon Card Game, 4 types, about the lottery sale"
  They name no individual product. My instruction said “do not choose it if the product differs”, so the AI refused.

  I fixed two things:

- In addition to the search by product name, always also search site:store-domain lottery and merge the candidates. (“Only when the search came up empty” never triggered, because one unrelated page was always returned.)

- Add to the instruction: “if the store’s own announcement page covers several products and gives no individual names, you may choose it”. Other stores and aggregator sites are never chosen, even if they cover several products.

  The result: 3 of 10 were replaced with the store’s official announcement page.

  I also made a list of app-only stores (stores that give lottery information only in their app), so the app can say “please check in the app”. Only stores known to have an app; I do not add by guess.

## A similar case: Rakuten’s keyword search failed on hyphens (24 August)

  The log kept showing “Rakuten Ichiba per-set search failed”, for Yu-Gi-Oh! alone for 8+ sets. Rakuten’s API failed the whole request with 400 wrong_parameter depending on how hyphens are used in the keyword.

    Keyword shape | Result

      "A - B" (spaces around the hyphen) | 400

      "A B " (trailing space only) | 400

      "A B-" (ends with a hyphen) | 400

      "AB-" (a word with no space, trailing hyphen) | 200 (OK)

  Yu-Gi-Oh! product names often put a subtitle between hyphens, as in “LIMIT OVER COLLECTION - THE RIVALS -”. Sets of that form had never once been found by the per-set search.

  The fix has two steps: (1) remove spaces right after a hyphen, (2) drop trailing hyphens and spaces. “LIMIT OVER COLLECTION - THE RIVALS -” became “LIMIT OVER COLLECTION -THE RIVALS” and returned 200. I confirmed the same problem happens with the Rakuten Books API, and applied the same sanitising to the four functions that pass keywords.

## What I learned

> When candidates were found but the result is 0, suspect the place that reads the answer.

- Set a reply length limit from what is returned. A percent-encoded URL is long.

- Do not throw away a failure; salvage it. You can pull the needed part out of cut-off JSON.

- An AI is faithful to instructions. If the instruction does not fit how things are really written, it correctly refuses.

- Separate an external API’s quirks by measuring. 400 and 200 split on the hyphen position.

- The same quirk exists wherever the same API is used. It happened on Rakuten Books too.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/truncated-answer/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
