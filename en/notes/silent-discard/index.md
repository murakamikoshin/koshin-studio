# Four real lotteries silently thrown away: a regex, dates without a year, batched answers and null

> “x.com” matched “e-starbox.com” so application links were never used; a date with no year was read as 2020 so no Pokémon items were imported; batched answers got out of step; “cannot decide” was read as “none” and nearly hid 129 lotteries.

- URL: https://koshinstudio.com/en/notes/silent-discard/
- Original (Japanese): https://koshinstudio.com/notes/silent-discard/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/silent-discard/)

Development log of the Toreca Dash app / August–September 2026

  My iPhone app Toreca Dash has many places that decide “this is out of scope” and throw an item away. Throwing away looks like the safe side: if it is wrong, only some junk is missing from the screen.

  But mistakes of this kind give you no reason to notice them. A real lottery can be thrown away and nothing shows. This article describes four cases where I silently dropped, or nearly dropped, real lotteries.

  Numbers and dates come from my work logs between 28 August and 20 September 2026.

## 1. “x.com” matched “e-starbox.com” (31 August)

  If a link is a social-media link it is not a store page, so I do not use it. I listed the sites to exclude and joined them into one regular expression.

  new RegExp(["x\\.com", "note\\.com", ...].join("|"))
  That also matches inside other host names. x\.com matches the end of e-starbox.com, and note\.com matches mynote.com.

  The real damage was on the lottery service “Lottery Rotobox” (shoplottery.e-starbox.com). Its application links were judged “social media, not a store link” and never adopted once.

  The fix: host-only entries match only right after // or a dot ((?:^|//|\.) in front). I tested 13 examples, both URLs that should pass and URLs that should be blocked. An exclusion list looks like the safe side, so nobody doubts it.

## 2. A date with no year was read as six years ago (28 August)

  Store and aggregator posts write dates like “30 August (Sun)” without a year. I had an AI read the text to extract deadlines.

  For one aggregator, Pokémon card items came back as 30 August 2020, six years ago. A past deadline is rejected at the entrance gate, so all Pokémon card items from that source were never imported. One Piece and Dragon Ball happened to be read as 2026, which hid the problem.

  The fix was to put today’s date in the prompt and “do not fill in a year before today”. Readable items went from 0 to 46. “A year consistent with the post date” is not enough, because when the post date is unknown the year is undetermined.

## 3. The number of batched answers did not match (19 September)

  Sending one AI request per post costs one request each. So I batched several posts into one call to classify their sale type. I joined multi-line post bodies as “1. text”, “2. text”, separated by newlines.

  The AI cannot tell a newline inside a post from the boundary between posts. On the day X monitoring resumed, the number of answers did not match 8 times. On a mismatch the code marked the whole group “out of scope”, so real lotteries in those groups were dropped together.

  Worse, even when the count matched, some answers belonged to different posts. A Yu-Gi-Oh! lottery was thrown out as out of scope.

  The fix: pass a JSON array ([{no, text}]) or headings that cannot appear in the text (“[Article N]”), make the reply include numbers, and on a mismatch ask one by one instead of falling back to “out of scope”.

## 4. “Cannot decide” read as “none” (20 September)

  One function guesses the card genre from a post. When two or more genres appear, it returns null (“cannot decide”).

  Another job used it to detect “no card words (a toy-only announcement)” as !fn(text). There, null was read as “none”.

  A roundup post that lists Pokémon, One Piece, Yu-Gi-Oh!, Dragon Ball and Gundam model kits has several genres, so it returns null. That was read as “zero card words”, and because “Gundam” was found, as a toy announcement.

  Left alone, the daily bulk job at 05:15 would have hidden 129 real, displayed lotteries (for 9 products such as 30th CELEBRATION). I stopped it because I ran a count-only dry run before the real run. The dry run said 129, and that is how I noticed.

  The fix: to detect “none”, use the function that returns all matched genres and check that its length is 0.

## What I learned

> Mistakes in what you throw away raise no complaints, so count them yourself.

- Exclusion lists are wrong too. The safer something looks, the less it is doubted.

- Test what should pass, too. Testing only what should be blocked can hide a block on what should pass (case 1 used 13 examples of both).

- Give the AI every premise. Today’s date, separators. If you do not, it silently uses another premise.

- Do not default to “out of scope” on a count mismatch. If the fallback is “discard”, real items vanish together.

- “None” and “cannot decide” are different answers. Do not blindly negate null.

- Count before a daily bulk job. The 129 was known in advance.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/silent-discard/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
