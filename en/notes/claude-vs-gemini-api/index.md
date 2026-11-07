# Claude API vs Gemini API by official numbers: small-model prices, web search, spend limits and deprecation

> Claude and Gemini API compared by official pages (Oct 2026): small-model prices, web search cost and caps, spend limits, deprecation notice.

- URL: https://koshinstudio.com/en/notes/claude-vs-gemini-api/
- Original (Japanese): https://koshinstudio.com/notes/claude-vs-gemini-api/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/claude-vs-gemini-api/)

A comparison / October 2026

  Torecadash moved from the Claude API to the Gemini API (the story is in the migration article (https://koshinstudio.com/en/notes/ai-cost-cutting/#s1)). Here I line up the official numbers I did not write down then. I use only what the official pages say. I did not compare accuracy or speed, because there are no official numbers for them.

  All numbers were seen on official pages on October 8, 2026. Prices and limits change. Check each item’s source again before you use it. What the official pages did not say is written as “could not confirm,” not as “does not exist.”

## Quick table: look up what you want to know

  The answers first. Details and sources are in the sections below.

    What you want to know | What the official pages say

    Which is cheapest? | In the current official tables, Claude Haiku 5.5 (input $0.10, output $0.50) and Gemini 2.5 Flash-Lite ($0.10, $0.40) are in a similar range. Gemini 3.1 Flash-Lite is $0.25 and $1.50.

    I want a setting to cap the number of searches | Claude has max_uses. For Gemini, I did not find a setting for the number of searches on the official pages.

    I want to use search for free | Gemini’s paid tier includes up to 5,000 requests a month free. But on the free tier, search is not available for 3.1 Flash-Lite. Claude is $10 per 1,000 searches.

    I want a spend cap that stops me | Both have a monthly spend limit and stop until the 1st of next month when reached (Claude from Start at $500, Gemini from Tier 1 at $250).

    I want a promise about deprecation notice | Claude states “at least 60 days before retirement.” For Gemini I could not confirm a promise of days; the date in the table is the “earliest shutdown date.”

    I want official numbers for Japanese | Claude’s multilingual page has them (93.5% of English for Haiku 4.5). For Gemini I could not confirm.

  The numbers in the table were confirmed on official pages on October 8, 2026. This is not a conclusion about which to choose; it is an organization of “what is officially written.”

## Prices of small models

  US dollars per million tokens. The model I used before the migration was Claude Haiku 4.5.

    Model | Input | Output

    Claude Haiku 4.5 | $1 | $5

    Claude Haiku 5.5 | $0.10 (prompts up to 100,000 tokens) / $0.50 (beyond that) | $0.50 (up to 100,000) / $2.50 (beyond that)

    Gemini 3.1 Flash-Lite (where I moved) | $0.25 (text, image, video) / $0.50 (audio) | $1.50

    Gemini 3.5 Flash-Lite | $0.30 | $2.50

    Gemini 2.5 Flash-Lite | $0.10 | $0.40

- In the current official price tables, Haiku 5.5 is cheaper than Gemini 3.1 Flash-Lite. What I compared against when migrating was Haiku 4.5, and I have not checked whether Haiku 5.5 was available then.

- Claude has batch (50% discount) and a cheap rate for cache reads. I could not confirm Gemini’s batch discount rate.

- The official pages say that from Claude 4.7 onward, a new tokenizer makes the same text about 30% more tokens. I could not confirm whether this applies to Haiku 5.5.

## How web search works and what it costs

     | Claude | Gemini

    Price | $10 / 1,000 searches (plus normal token cost for the results) | Paid tier: up to 5,000 requests a month free, then $14 / 1,000 requests. On the free tier, search is not available for 3.1 Flash-Lite.

    How it is counted | Per search. Not charged on error. | For Gemini 3 models, per search query the model runs (multiple queries mean multiple charges).

    A setting to cap the count | Yes (max_uses). Beyond it, the search result is a max_uses_exceeded error. | I did not find a setting to cap the count on the search page (I cannot say it does not exist).

    Domain restrictions | Allowed and blocked domains can be specified. | Could not confirm.

  The problem I wrote about in the migration article, “web search has no cap on the number of calls,” reads the same within what the official pages say. Nothing equivalent to Claude’s max_uses was written on Gemini’s search page. It is still possible that I just did not find it.

## Limits and how they stop

  This is close to my reason for migrating.

     | Claude | Gemini

    Monthly spend limit | Start $500 / Build $1,000 / Scale $200,000 | From Tier 1 $250 / Tier 2 $2,000 / Tier 3 $20,000

    When the limit is reached | HTTP 429 (enforced_spend_limit_reached). Stopped until 00:00 UTC on the 1st of next month. | All projects in the billing account stop until the 1st of next month.

    A limit you set lower yourself | Can be set (HTTP 400 when reached). | Can be set per project in AI Studio (an experimental feature; billing is reflected with a delay of about 10 minutes, so you can overshoot).

    Free tier | A small free credit for new accounts. I did not find a continuing free allowance. | Yes. 3.1 Flash-Lite tokens are free. But caching and search grounding are not available on the free tier.

    Per-minute limits for small models | Start: Haiku 4.5 / 5.5 both 1,000 requests per minute, 2 million input and 400,000 output tokens per minute. | No specific numbers in the documentation (you check in AI Studio).

  The migration article gives the reason as “I hit Anthropic’s usage limit and got an unplanned charge.” However, Claude’s official pages say it stops when the limit is reached, and I could not explain from the official pages how an unplanned charge arises. The account in that article comes from my own records, not backed by official documents.

## How deprecation is announced

     | Claude | Gemini

    Notice promise | For released models, notice at least 60 days before retirement (by email and documentation). | It says “the exact shutdown date will be announced in advance,” but I could not confirm a promise of days. The date in the table is the “earliest shutdown date.”

    How it is written | “Not sooner than X” (it will not retire earlier than X). | A table of release date, shutdown date and recommended replacement.

    Examples | Haiku 3.5: about 2 months from announcement (2025-12-19) to retirement (2026-02-19). Haiku 4.5: not retired sooner than 2026-10-15. | 3.1 Flash-Lite: released 2026-05-07, shutdown 2027-05-07 (12 months after release). 2.0 Flash: shutdown 2026-06-01.

  The shutdown date of gemini-3.1-flash-lite, which I chose, is also May 7, 2027 in the official table. It matches the migration article. On the other hand, the migration article’s “2.5 Flash-Lite is scheduled to be shut down on October 16” disagrees with the current official table (“no shutdown date announced”). I added a correction to that article.

## Structured output, tool calling and Japanese

- Output in a specified JSON shape: Both support it. Claude says it “guarantees conformance to the schema.” Gemini says it supports “only some JSON schema features” and that “the meaning of values needs validation.”

- Tool calling: Both support it. Using structured output together with tools such as search works only on Gemini 3 models and is described as a “preview feature.”

- Japanese: Claude’s multilingual page has a relative score for Japanese with English as 100% (Haiku 4.5 is 93.5%). On the Gemini 3.1 Flash-Lite page I could not find an official statement on supported languages. That does not mean “Gemini’s Japanese is weak”; it means I could not compare using official numbers.

## What I learned

> You cannot choose from a price table alone.

- Prices flip over time. The side that was cheaper at migration can be more expensive now.

- Whether safety devices exist is outside the table. Caps on search calls, spend limits and how things stop (does it stop, or does billing continue) do not appear in a unit price table.

- How deprecation is announced differs in whether there is a promise. Planning a switch is different when one side promises days and the other only shows the earliest date.

## What I could not confirm

- Specific per-minute and per-day limit numbers for Gemini’s free tier and each tier (the documentation has no numbers).

- Gemini’s batch discount rate.

- Whether Gemini’s search has a setting to cap the count (I only did not find it on the page, so I cannot say it does not exist).

- How many days before shutdown Gemini notifies, at minimum.

- An official statement on Gemini’s Japanese and a numeric comparison.

- An explicit statement that Claude Haiku 4.5 / 5.5 support the web search tool (the official pages tell you to check supported models with the API).

- Accuracy and speed comparisons (not obtainable from official primary sources, so I did not do them).

## Sources (all checked on October 8, 2026)

- Claude: pricing (https://platform.claude.com/docs/en/about-claude/pricing)

- Claude: rate limits and spend limits (https://platform.claude.com/docs/en/api/rate-limits)

- Claude: web search tool (https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool)

- Claude: model deprecations (https://platform.claude.com/docs/en/about-claude/model-deprecations)

- Claude: structured outputs (https://platform.claude.com/docs/en/build-with-claude/structured-outputs)

- Claude: multilingual support (https://platform.claude.com/docs/en/build-with-claude/multilingual-support)

- Gemini: pricing (https://ai.google.dev/gemini-api/docs/pricing)

- Gemini: rate limits (https://ai.google.dev/gemini-api/docs/rate-limits)

- Gemini: billing (https://ai.google.dev/gemini-api/docs/billing)

- Gemini: grounding with Google Search (https://ai.google.dev/gemini-api/docs/google-search)

- Gemini: model deprecations (https://ai.google.dev/gemini-api/docs/deprecations)

- Gemini: structured output (https://ai.google.dev/gemini-api/docs/structured-output)

- Gemini: function calling (https://ai.google.dev/gemini-api/docs/function-calling)

- Gemini: 3.1 Flash-Lite (https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite)

  I read some of the official pages through summaries (the numbers have not been checked against the originals character by character). Always check the original text of the sources before deciding.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/claude-vs-gemini-api/).

  More in English

- All English pages (https://koshinstudio.com/en/)
