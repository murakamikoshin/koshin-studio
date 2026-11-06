# “One page = one case” was false: articles of a shop taking 6 products on one form were hidden just for sharing a link

> A job that decided duplicates by link alone hid 5 of 6 articles of a shop taking 6 products on one Google Form. I changed it to link + product. I also found the server’s “entry tiers” were never read by the app.

- URL: https://koshinstudio.com/en/notes/one-page-many-cases/
- Original (Japanese): https://koshinstudio.com/notes/one-page-many-cases/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/one-page-many-cases/)

Development log of the Toreca Dash app / August 2026

  My app Toreca Dash twice received the report “several products are accepted, yet there is only one article”. I thought I fixed it the first time, but the second report came.

  This article records the real cause, and a story from the same period: a field I created that the app never read.

  Written from my work log of 25 August 2026.

## The real cause: duplicates decided by link alone

  After the first report I had fixed it as far as “they are treated as duplicates because the link is the same”. But existing articles stayed hidden, so I got the same complaint again.

  The culprit was runHideDuplicateLinkArticles, a job that judges duplicates by link alone.

  The real data: one mail-order shop takes lotteries for 6 products on a single Google Form. All 6 articles have the same URL. The job hid 5 of them as “duplicates”, so users saw only one product.

  The fix: change the grouping unit from link to link + product. The same link with a different product is a different case. For articles whose product is unknown, there is nothing to tell them apart, so they are treated as duplicates by link alone as before.

  “One page = one case” does not hold for card lotteries. Stores that accept several products on one form or one announcement page are common.

  I restored the articles that had been hidden as link-only duplicates, only those whose product or title differs from a displayed article with the same link (7 articles): 5 from the mail-order shop (all 6 products now show), 1 from a large game store and 1 from another chain.

## The server created “entry tiers”, and the app never read them

  Since 23 August the server had been reading entry conditions with an AI and extracting entry tiers (entryTiers): “Players Club: identity-verified tier versus unverified tier”, “Group A and Group B”, “Bic Camera Suica card members only”. They were in the real data.

  But the iOS app never read this field. I was paying for the AI and users could not see it. I added the field to the app and show it in the detail screen as “Entry tiers”.

  You can find such server/app mismatches mechanically: extract the fields the app reads from the source (grep) and compare them with Firestore’s real data.

## Announcement text had got into the product list

  Event notices such as “ONE PIECE Card Game corner [advance entry / lottery] Monday 31 August, JUMP SHOP Tokyo Station” had been registered as products.

  A list of phrases cannot keep up, so I rejected them with a general rule: a concrete date. A trading-card product name does not contain a calendar date like “31 August”. “Vol.3”, “Set 2” and “2025 issue 19” are not dates and are unaffected. I tested 10 patterns with 0 mismatches and deleted the 6 existing ones.

## What I learned

> Doubt the premise. Check that what you built is used.

- Do not assume “one page = one case”. Stores accepting several products on one form are common.

- After fixing, look at existing articles. Fixing the entrance does not bring hidden articles back.

- Cross-check the fields the server makes and the app reads. You can pay the cost and users still see nothing.

- A general rule beats a list of phrases. “A concrete date means it is not a product name.”

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/one-page-many-cases/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
