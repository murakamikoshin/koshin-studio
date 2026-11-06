# Four times my own tools hurt me: a summary dropped conditions, one undefined stopped saving, a check locked out production, alerts that never cleared

> A “15 characters” prompt dropped entry conditions in 671 checked lotteries; one undefined broke every save and burned 41% of a day’s credits; six parallel requests got the production IP blocked; I made alerts that kept ringing after the fix.

- URL: https://koshinstudio.com/en/notes/self-inflicted/
- Original (Japanese): https://koshinstudio.com/notes/self-inflicted/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/self-inflicted/)

Development log of the Toreca Dash app / August–September 2026

  Besides external bugs, my app’s development has had several cases where something I built, or a check I ran, harmed me. These are four of them, each fixed once numbers made it visible.

  Numbers and dates come from my work logs between 28 August and 15 September 2026.

## 1. “About 15 characters” dropped the entry conditions (14 September)

  The app asks an AI to summarise lottery entry conditions (follow and repost, membership card needed, etc.) for display. I compared 671 displayed lotteries with the original posts (text and images) using an AI.

  I found more omissions than contradictions.

    Missing condition | Count

      Repost | 23

      Membership | 20

      App | 13

      LivePocket (entry service) | 13

  The cause was the prompt. It asked for “about 15 characters”, so the AI cut conditions to one or two. A rule “do not write receiving or purchase conditions” was stretched to drop even “membership card checked at purchase”, which is an entry condition because you cannot buy without it.

  A length limit makes an AI choose what to drop; a drop rule drops boundary conditions too. The fix: “include everything, up to N characters”, and list what must stay. In the check itself, I did not stop at counting AI verdicts, but checked representative cases against the original image, since an AI review is noisy.

## 2. One undefined value made every save fail (28 August)

  A job wrote back a whole map of scraping-service settings at once. One day the write failed every time with:

  Cannot use "undefined" as a Firestore value (found in field "domains.`www.yamada-denkiweb.com`.super")
  One undefined in one site’s entry made every later save fail.

  The damage showed up elsewhere. A record meaning “pause sites that cannot be fetched with any setting for 6 hours” could not be saved. One site was hit on every patrol with three settings (1 + 10 + 25 = 36 credits), burning 13,183 credits in a day, 41% of that day’s total. The service spreads its daily budget over time of day, so when one site uses 41% of a day, less is left for the others.

  The lesson: when you write a whole map back, one dirty value breaks the whole save. Strip undefined before writing, and make failed saves loud.

## 3. My check locked my production IP out (15 September)

  I ran a stock-check script from the same server as production. It opened 501 Yahoo Shopping product pages six at a time with plain requests. Within minutes the server’s IP address got HTTP 489 (access denied) and it did not clear for hours.

  Production imports and stock rechecks read Yahoo from the same IP. My check blinded production. The check also sent pages it could not read to the scraping service, burning credits.

  The rule now: when reading shopping sites in bulk from the production server, one at a time with a pause after each. Run a handful first and check the status is still 200. For stock, check the structured data in the page on a small sample and leave the full check to the production recheck job.

## 4. Four alerts that kept ringing after the fix (29 August)

  I have added many alerts. In one night on 29 August, I fixed three alerts that kept ringing although there was a way to resolve them, and made a fourth myself: a mark for “AI credit ran out” that stayed for 24 hours even after I topped up.

  The same shape had appeared before:

- A data-fetching cost alert that “always exceeds 80% at month end”.

- A scraping-service alert that “always has 20% left at month end”.

- An alert that fires on 0 items when 0 is normal.

- A cancelled official price that the catalogue wrote back the next morning.

  An alert that never clears buries real problems. Now when I write one, I make the condition that clears it at the same time, asking three things:

- When the problem is fixed, who clears this alert?

- Does it fire just because time passes, such as month end?

- Is 0, or a low value, a normal state?

  I do not write an alert nobody clears. The code that clears the mark on success goes into the same change as the alert.

## What I learned

> My tools work on me too.

- A limit makes you choose what to drop. If you set a length cap, say what must stay.

- Writing everything at once breaks on one dirty value. Clean before you write.

- A check must not disturb production. Same IP, same limits: go gently.

- Create an alert together with the way it clears.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/self-inflicted/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
