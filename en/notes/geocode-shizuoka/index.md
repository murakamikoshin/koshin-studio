# Looking up an ambiguous store name returns Shizuoka, the middle of Japan: I judged by Google’s own answer, not a list of chains

> Passing a store name to Google’s place search with a rectangle covering Japan returned its middle (Shizuoka/Aichi) for ambiguous names. Instead of a list of chain names I judged trust from the answer itself with four rules.

- URL: https://koshinstudio.com/en/notes/geocode-shizuoka/
- Original (Japanese): https://koshinstudio.com/notes/geocode-shizuoka/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/geocode-shizuoka/)

Development log of the Toreca Dash app / August 2026

  My app Toreca Dash shows store locations on a map and sorts by distance. A report said “the location shows Shizuoka”. Store locations come from passing the store name to Google’s place search (Places API).

  The cause: when you query with an ambiguous store name, Google returns the middle of Japan (Shizuoka and Aichi). This article records the measurement and the fix of not listing chain names.

  Written from my work log of 25 August 2026.

## Measured: the answer to an ambiguous name is Shizuoka or Aichi

  I pass a rectangle covering all of Japan as a location hint (locationbias). With an ambiguous name and nothing to decide by, Google returns the middle of that rectangle, which is Shizuoka and Aichi. I measured it with the API.

    Query | Google’s answer

      Yamada Denki | Yamada Denki Tecc Land Hamamatsu (Shizuoka)

      San-A | San-A Kaken, Kakegawa Factory (Shizuoka)

      Hobby Station | Toreca Station Toyohashi (Aichi)

      Book Off | BOOKOFF Kakegawa (Shizuoka)

      Hareruya | Hareruya Shizuoka (Shizuoka)

      Omusubi | a rice-ball shop in Hamamatsu (Shizuoka)

  “San-A” meant a retail chain, but the answer was a different company’s factory with a similar name.

## The fix: judge by Google’s own answer, not a list of chain names

  I did not make a “list of ambiguous chain names”. It would recur whenever a new chain appears. Instead I wrote a function (geocodeMatchIsTrustworthy) that judges from Google’s own answer.

- If the queried name is only the head of the returned name and the rest is a branch name, reject. (Yamada Denki → …Tecc Land Hamamatsu.) If only “store” was added, it is the same shop.

- If the name has a branch hint (“… store”, hall, mall…), accept as before.

- If the returned name equals the queried name or is a part of it, accept. Do not accept the reverse. (San-A ⊂ San-A Kaken is a different company.)

- Otherwise, judge by whether the name and address share 2 or more characters. (Stores with Ikebukuro, Totsuka, Sapporo or Takadanobaba in the name pass here.)

  On 25 real patterns, all 9 wrong ones were rejected and all 16 correct ones accepted. The only miss was one written in Roman letters.

  I cleared the 30 articles with a wrong location baked in and 22 store cache entries, and resolved them again. Clearing the cache costs one API call per store.

## A similar story the same day: the notification’s store name was “LivePocket”

  A report said “the notification’s store name is LivePocket”. When no store name could be found, the category (“LivePocket”) was used as the last fallback. LivePocket is a place that takes applications, not a store. So when unknown, return null. The caller uses the article title if there is no store name. LivePocket titles begin with the store name, like “Kiddy Land LaLaport Fujimi store …”, which says it more correctly.

## What I learned

> Check an external answer for trustworthiness using the answer itself.

- With nothing to decide by, an external service returns a plausible answer. The middle of Japan: Shizuoka and Aichi.

- Do not make a list of chain names. It recurs when a new chain appears.

- Do not accept the reverse containment. San-A is not part of San-A Kaken.

- Clear baked-in values and resolve again. The cache too.

- When unknown, null. No name is better than a wrong one.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/geocode-shizuoka/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
