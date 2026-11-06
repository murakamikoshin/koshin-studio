# Before cutting Gemini cost, I doubted the meter: price, breakdown and cache were all wrong, and the cache threshold changed when I re-measured

> The cost meter was broken in three places (prices under-reported 2.6×, 31 purposes merged, cache uncounted). The cache threshold was about 8,000 tokens in September and about 4,000 in October. Padding the prompt shifted 9% of answers.

- URL: https://koshinstudio.com/en/notes/gemini-meter/
- Original (Japanese): https://koshinstudio.com/notes/gemini-meter/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/gemini-meter/)

Development log of the Toreca Dash app / September–October 2026

  My iPhone app Toreca Dash uses Google’s Gemini (AI) to classify posts and match products. You pay for what you use, so I have worked on the cost several times. This is the record of two of those rounds.

- 4 September: before cutting anything I checked the measurement, and all three parts were broken.

- 16 October: I re-measured when the cache works, and it disagreed with my September conclusion.

  Numbers come from my work logs of 4 September and 16 October 2026. The model is gemini-3.1-flash-lite.

## Three parts of the meter were broken

  I was asked to cut cost. The first thing I did was not cutting, but checking whether the numbers were right. Cutting with a broken meter means cutting the wrong things. I found three faults.

    Fault | What happened

      Wrong prices | The code used $0.10 input and $0.40 output per million tokens. The real prices are $0.25 and $1.50, so cost was under-reported by about 2.6×.

      Labels collapsed | The per-purpose tally read a key that does not exist (params.system; the real one is system_instruction). 31 purposes were merged into one lump, so I could never see which prompt was expensive.

      Cache not counted | 31% of input was cache hits at 1/10 the price, but everything was counted at full price, about 40% too high.

  One more thing: the “second most expensive” item, “(outside jobs)” at ¥195 a day, was not a production problem. It was me running things by hand. When judging production, exclude manual runs.

  With the meter fixed, the cost was about ¥606 a day (¥18,168 a month); minus the cache, about ¥13,200 a month. Nearly all of it was input tokens: the instructions and candidate lists I resend every time.

## September: the cache starts above about 8,000 tokens

  Gemini discounts repeated long prompts (implicit caching) from the second call, at 1/10 the price for the cached part. I sent the same instruction three times at different lengths.

    Prompt length (input tokens) | Cached tokens

      5,209 | 0

      8,490 | 4,079

      17,070 | 12,263

  The conclusion then was “it works above about 8,000 tokens”. Effective tokens are input − 0.9 × cached. Padding a prompt to reach the threshold costs more: stretching 4,200 tokens to 8,500 gives 4,814 effective tokens, more than before. The cache only pays off for prompts that are already large.

## October: the threshold was about 4,000 tokens

  I measured again with the production key, this time through the interactions API. The result differed from September.

    Prompt length (input tokens) | Cached tokens

      1,770 | 0

      4,093 | 2,031 (from the 2nd call)

      7,017 | 4,076

  It worked from about 4,000 tokens, in chunks of about 2,038 tokens. September said 8,000, October said 4,000. I have not found out why. A difference in how I measured or a change on the service side are possibilities, but I do not know which. What I do know is that the cache threshold is not a fixed fact; re-measure it.

  My production prompts were 1,000 to 2,500 tokens, so the fixed part never reached the threshold and hits were 0 all day. Input is almost all of the cost (output about 1%), so a working cache looked like a big saving.

## Padding the prompt shifted 9% of the answers

  I tried stretching the prompt to about 2,300 tokens with “notes that do not affect the judgement”. I compared old and new answers on 90 real cases.

- 8 answers (9%) differed, between “other”, “lottery” and “first-come sale”.

- At about 2,600 tokens it still did not hit the cache.

  It lowers accuracy and does not even get cache hits, so I withdrew it and never shipped it. Text that “does not matter” still changes an AI’s answers. Do not add it without checking.

## What is left

  On real data the biggest single item is product matching: on average 7,151 input tokens, 297 times a day, about ¥83. Narrowing candidates, batching and skipping the AI when the title equals the product name are already in. Going further means fewer candidates, that is, less accuracy, so I left it.

  If I cut more, it will be by shortening prompts, checking agreement on real data one at a time, and not chasing the cache with padding.

## What I learned

> Before cutting cost, doubt the tool you cut it with.

- Do not write prices from memory. Check the official price page. The 2.6× under-report was a copied price.

- Print one real breakdown and look at it. 31 purposes collapsed into one still add up to the right total.

- Check that your own work is not in production numbers.

- Re-measure conditions. September’s 8,000 was October’s 4,000.

- Test “harmless” changes on real data. 90 cases showed a 9% shift.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/gemini-meter/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)

- Firestore cost in yen (https://koshinstudio.com/en/notes/firestore-91/)
