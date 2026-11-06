# “That’s just a Beyblade” came back after I added a gate: the blocked value leaked in another form

> A gate “do not create a product whose name contains a toy’s name” was bypassed because the AI’s product name lost the toy’s name. I moved the judgement to the announcement body and rejected only when no card-game word appears.

- URL: https://koshinstudio.com/en/notes/leaked-value/
- Original (Japanese): https://koshinstudio.com/notes/leaked-value/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/leaked-value/)

Development log of the Toreca Dash app / September 2026

  My app Toreca Dash received three reports: “this is just a Beyblade”. An app that gathers trading-card information had a toy, Beyblade, registered as a product.

  On 6 September I had added a gate: “do not create a product if the product name contains a toy’s name”. Yet it came back. This article is about a value I had blocked coming back in a different form.

  Numbers come from my work logs of 6 to 11 September 2026.

## I added the gate, but the toy’s name had vanished from the product name

  The store announcement was:

  New toy: Beyblade X
(1) CX-19 Random Booster Kuro Tread set
(2) CX-00 Tigerage FT3-60T
  An AI builds product names from it, and the products created were:

  "CX-19 Random Booster Kuro Tread Select"
"CX-00 'Tigerage' FT3-60T"
  Neither contains the word “Beyblade”. My gate rejected a product name that contained a toy’s name. Because the AI’s product name no longer had it, the gate let it through. The value I had blocked (the toy’s name) returned in another form (a product name without it).

## The fix: judge on the announcement text, not the product name

  I moved the judgement to the announcement body, not the product name. The body states the toy’s name.

  But “contains a toy’s name, so reject” would not do. Store announcements sometimes list both toys and card games, such as “[Beyblade] [Dragon Ball Card Game]”. Rejecting would remove real lotteries. So the rule is: reject only when no card-game word appears at all.

  Counting on real data:

    What I checked | Count

      Articles that touch a toy line | 44

      Of those, matching the rule (no card-game word) | 31

      Of those, displayed | only the reported one

      Articles with a card-game word (all kept) | 13

## What I learned

> A blocked value comes back in another form. Follow where the value goes.

- When you add a gate, follow where the blocked value leaks. Stop it creating products and it survives in a title or another field.

- Judge close to the source of the material. The original announcement is more reliable than a product name processed by an AI.

- Do not reject on “present” alone. Listings are mixed, so limit it to “no other word at all”.

- Count what remains for a rejecting rule. I confirmed the 13 stay.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/leaked-value/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
