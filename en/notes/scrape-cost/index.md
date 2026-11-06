# I re-measured a “nothing can be done” assumption and scraping cost dropped to one eighth

> I believed two sites could not be fetched more often because of cost. Comparing three Scrape.do settings showed rendering was wasted: 3x faster, 1/8 the credits.

- URL: https://koshinstudio.com/en/notes/scrape-cost/
- Original (Japanese): https://koshinstudio.com/notes/scrape-cost/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/scrape-cost/)

Development log of Torecadash / October 2026

  My iOS app Torecadash regularly visits sales pages on online shops and collects lottery and first-come sale information. Pages are fetched through an external service (Scrape.do), and each fetch setting uses a different number of credits. For one site, I re-measured something I had accepted as “it cannot be helped,” and it became 3 times faster using about one eighth of the credits. This is from my commit record.

  This is a development log of the app. I do not write amounts of money, only numbers of credits.

## The reason for “it cannot be helped” was cost

  I thought the fetch interval for two sites, AEON Style Online and Amiami, could not be shortened. The reason was that fetching was expensive. In other words, a conclusion based on an old unit price. I decided to measure it again.

## Fetching the same page with three settings

  There are three levels of fetch settings: a plain fetch (1 credit), render in a browser and then fetch (render, 5 credits), and render through a stronger route (super + render, 25 credits). I fetched AEON’s list page with all three and compared contents, two pages three times each.

    Setting | Credits | Size (bytes) | Products | Prices

    Plain | 1 | 649,734 | 20 | 25

    render | 5 | 663,026 | 20 | 25

    super + render | 25 | 669,510 | 20 | 25

  All three returned exactly the same products and prices. So rendering was a complete waste. I had been paying 25 credits for something that 1 credit was enough for.

## The fix

- Try the cheap setting first. For AEON, fetch plainly first. Only when the “access is busy” page that appears at the start of a first-come sale comes back does it escalate automatically to a stronger setting.

- Interval from 15 minutes to 5 minutes. Every 5 minutes is 288 times a day. For 2 pages, that is 576 credits. Before, it was about 4,600 credits a day (as stated in the commit). It is 3 times faster and uses about one eighth.

- I applied the same measured result to Amiami. Removing rendering took one fetch from 5 credits to 1, saving about 1,200 credits a day.

  But for Amiami I kept the interval at 15 minutes. That day it had hit timeouts twice, and one run took 284 seconds. Fetching overall was getting crowded, so I decided not to touch it. What I measured was “is rendering needed,” not “is it safe to shorten the interval.”

## What I learned

> When was the number behind “it cannot be helped” measured?

- Re-measure old conclusions. Unit prices, settings and how sites are built all change. “AEON cannot be helped” turned out not to be true when measured.

- Strong settings tend to get added “just in case.” Whether they are needed can be seen by comparing results. If the results are the same, the cheaper one is enough.

- When you fix one thing, check the other conditions. The same measurement fixed Amiami’s setting, but I left its interval because of a separate issue (timeouts).

  The numbers in this article come from my commit record (September 7, 2026). “4,600” is as written in the commit and is a little off from the calculation of 25 credits × 2 pages × 96 runs (every 15 minutes) = 4,800.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/scrape-cost/).

  More in English

- All English pages (https://koshinstudio.com/en/)
