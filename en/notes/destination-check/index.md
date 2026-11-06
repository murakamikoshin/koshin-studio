# I opened the links of displayed articles and compared them: about 60 mistakes, and three mistakes in my own first check

> Opening more than 1,000 destination pages and comparing with the articles: Amazon invitation requests shown as first-come, closed or sold-out items displayed, links to other stores or products, application links redirecting to a site’s top page. My first check was wrong in three ways too.

- URL: https://koshinstudio.com/en/notes/destination-check/
- Original (Japanese): https://koshinstudio.com/notes/destination-check/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/destination-check/)

Development log of the Toreca Dash app / September 2026

  The articles in my app Toreca Dash link to store and shopping-site pages. Even if an article’s title and price are right, if the linked page is closed or about a different product, it is no use to the user.

  On the night of 15 September 2026, asked to “check the destination content too”, I actually opened the links of displayed articles and compared the content with the article: product, store, whether open, sale type, deadline and price. About 60 mistakes turned up.

  Numbers come from my work log of 15 September 2026. The check itself made no writes; I fixed the findings separately.

## How I checked

- X posts (361): 0 deleted. The text had been compared in earlier checks.

- Non-X (703, excluding Yahoo!): I read the destination directly or via the scraping service (with a Japanese IP) and judged with an AI. Amazon always goes through the scraping service.

  My first version of the check got three things wrong:

- I opened Amazon from Singapore. Prices showed in Singapore dollars and I saw another seller, and judged that “wrong”.

- I read Rakuten as garbled text. I had not detected the character encoding (EUC-JP).

- I opened 501 Yahoo! pages six at a time. The production IP was refused with HTTP 489 (see another article (https://koshinstudio.com/en/notes/self-inflicted/)). I stopped partway through Yahoo!.

  If the checking tool is wrong, the count of “mistakes” inflates. I fixed encoding detection, opening Amazon from Japan, and judging only by stock of “this exact item”, then reran.

## Mistakes found (about 60)

    What | Count | Fix

      Amazon “invitation request” shown as pre-order or first-come | 10 | Make it a lottery

      Amazon “pre-order” shown as first-come | 7 | Make it a reservation

      Rakuten Books “pre-orders open” shown as first-come | 3 | Make it a reservation

      Shops closed temporarily (Yahoo!) | 6 | Hide

      Sold out or closed but still displayed | many | Hide

      Link goes to a different store or an ended lottery | 3 | Go back to the store’s X post

      Link goes to a different product | 2 | Hide

      Price mismatch | about 10 | Correct

      Empty store name | 1 | Fill in

  The most frequent was the wrong sale type. On Amazon there are “invitation requests”, neither first-come nor pre-order. Treating one as first-come means users cannot buy however fast they are. The earlier code only marked the invitation and did not correct the sale type.

  Some sold-out pages did not match my sold-out wording. A Yahoo! sold-out page says “out of stock” on screen, but matched none of the keywords. So I now judge by the stock data embedded in the page for that item ("stock":{"isAvailable":false). The data is more reliable than the wording on screen.

## “Opening the application link goes to the site’s top page”

  Found in another check the same day. The QR code on a store’s lottery image pointed to a URL that, actually opened, redirects to the site’s top page, not an application page.

  I added a check to the single gate that adopts application links. It opens the URL, and if the original URL has a path other than the top but the destination path is empty (or a file name that looks like a top page), it does not adopt it. If it cannot be read (403, timeout), it still adopts, since many stores use bot protection and unreadable is not a sign of badness. The same URL is held for 6 hours.

## What I did not fix, and could not fix

  It matters that I did not count everything found as a “mistake”. There are cases I checked and did not fix.

- Rakuten Ichiba “sold out”: the page data said in stock (a setting hides stock counts). The AI misread it.

- Amazon “See all buying options”: other sellers exist, so it is not necessarily sold out.

- Amazon English titles: auto-translated names; the product was right.

- 85 pages I could not read: Rakuten Ichiba (via ad links), membership sites, LINE, Google Forms and so on.

  I keep results in three groups with reasons: fixed, not fixed, could not read. “Not fixed” needs a reason too.

## What I learned

> Even if title and price match, you cannot know until you open the link.

- Actually open the link. Looking only at the article cannot show that the destination is closed.

- Check the checking tool first. Country, encoding, parallelism: a wrong tool inflates “mistakes”.

- Embedded data beats screen wording. Judge sold-out by stock data, not text.

- Do not make everything found a “mistake”. Keep reasons for what you do not fix.

- Do not treat “could not read” as bad. Bot protection makes unreadable normal.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/destination-check/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
