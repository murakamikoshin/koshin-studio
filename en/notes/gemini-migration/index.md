# Migrating from the Claude API to the Gemini API (gemini-3.1-flash-lite): 16 call sites into one function

> Moving an iOS app backend from Claude Haiku 4.5 to Gemini 3.1 Flash-Lite: choosing by deprecation date, one wrapper, a search cap breaker, a kill switch.

- URL: https://koshinstudio.com/en/notes/gemini-migration/
- Original (Japanese): https://koshinstudio.com/notes/gemini-migration/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/gemini-migration/)

Development log of Torecadash / October 2026

  On the server side of my iOS app Torecadash, AI is used for things like deciding “which product an article is about.” On July 25, 2026, I fully migrated this AI from Anthropic’s Claude (Haiku 4.5) to Google’s Gemini (gemini-3.1-flash-lite). What I decided, how I unified the calls, and what I added after the migration are written from my hand-over notes.

  This site has a page for Torecadash (Works (https://koshinstudio.com/en/works/)). This is a development log. I do not write amounts of money.

## What triggered it

  According to my notes, the reason was that I reached Anthropic’s API usage limit and got an unplanned charge. Since then only Gemini has run, and I removed the Anthropic SDK and key from the code and from the secret store (Secret Manager). In a check on July 30, I confirmed there are 0 mentions of Anthropic in the code.

## How I chose the model

  I chose gemini-3.1-flash-lite. My notes also keep the reason for what I did not choose.

- Gemini 2.5 Flash-Lite, which is cheaper, was scheduled to be shut down on October 16, 2026, so I passed on it (according to my notes. When I reviewed the official deprecation list on October 8, 2026, this model showed “no shutdown date announced.” I have not confirmed whether the entry changed later).

- The shutdown date of the one I chose, gemini-3.1-flash-lite, is May 7, 2027. At the time of migration (July 25) that was still about nine and a half months away.

  If you choose only by price, it will be shut down soon and you migrate again. I added “when will it be shut down” to the selection criteria.

## 16 call sites into one function

  There were 16 places that call AI (deciding the sales format, matching products, discovering listings and so on). I unified them to go through one function (createGeminiInteraction) at the top of functions/index.js. Inside it calls client.interactions.create() from @google/genai.

  Callers pass arguments close to the original Anthropic form (system_instruction, max_output_tokens in generation_config, input) as they are. What comes back is text (output_text). I made it a form where only the inside is swapped, with almost no rewriting of callers.

## Web search had no “call count cap” setting

  In four places (discovering listings, discovering sellers, a Rakuten Books lookup and a list-price lookup), the AI does a web search. With Gemini I use tools: [{type: "google_search"}] (grounding with Google Search).

  Here was a pitfall. Anthropic’s web search had max_uses (a cap on the number of searches), but Gemini has no equivalent setting, and the model searches as many times as it thinks necessary. My notes say: “the absence of this setting can itself be a cause of unexpected cost.”

  So the day after migration (July 26), I added a circuit breaker with a daily counter inside createGeminiInteraction (up to 300 calls a day). When the limit is reached, it returns an error to the caller. In price review, I designed this error to be excluded and kept distinct from “could not find the list price” (I wrote about that in another article (https://koshinstudio.com/notes/fail-open/), in Japanese).

## A switch to stop it

  I added one more thing: AI_CALLS_PAUSED, a switch that stops all AI calls from one place. My notes include a reflection from July 25: “I thought I had stopped the calls, but they had not actually stopped, and the automatic job running every 10 minutes kept producing errors.” I decided that when the budget is about to be exceeded, I first set this to true and stop right away.

## A note when adding new processing

  Functions that call AI (Cloud Functions) must always have secrets: ["GEMINI_API_KEY"]. If you forget it, deployment succeeds and then it fails with a permission error.

## What I have not verified

  This article is written from the AI section of my hand-over notes. A before-and-after accuracy comparison of decisions is not part of the material. So I do not judge here whether Gemini is better or worse.

## What I learned

> If you gather calls in one place, the place to stop them is one place too.

- Pass every call through one function. The migration, the safety limit and the stop switch can all live in that one place.

- Count “there is no setting” as a risk. When you move to a service with no cap on call count, build the cap on your own side.

- Check that the stop switch really stops. Thinking you stopped but not having stopped is the most expensive case.

  This article is written from my hand-over notes (AI API information, July 25 and 26, 2026).

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/gemini-migration/).

  More in English

- All English pages (https://koshinstudio.com/en/)
