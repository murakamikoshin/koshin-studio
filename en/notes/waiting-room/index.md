# When first-come sales start, the site becomes a waiting-room page: a 15 KB notice slipped through an 8,000-byte gate

> On AEON Style Online, a first-come sale turned the whole site into a 15 KB “heavy access” page. It passed the 8,000-byte check added earlier that day and was read as “success, 0 products”. I switched to a title check; Amazon’s 13 minutes were serial AI screening.

- URL: https://koshinstudio.com/en/notes/waiting-room/
- Original (Japanese): https://koshinstudio.com/notes/waiting-room/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/waiting-room/)

Development log of the Toreca Dash app / September 2026

  My app Toreca Dash reads shopping-site pages to collect first-come and lottery information. As I wrote in an earlier article (https://koshinstudio.com/en/notes/blocked-page/), my “was it fetched?” check had a hole and treated a notice page as success. On the very day I fixed it (7 September 2026), I found another hole of the same kind in a different shape.

  And it occurred at the moment when missing something matters most.

  Numbers come from my work log of 7 September 2026.

## When first-come sales start, the site becomes a waiting-room page

  A report came: “AEON Style Online seems to have first-come sales too”, “it seems to have started at exactly 14:00”. So I tried fetching at that moment.

    Method | Result

      Plain request | 403 (blocked by bot protection)

      Scraping service, cheap setting | 200, 15,188 bytes, title “Notice: heavy access”

      Scraping service, super | 200, 15,188 bytes, same

      Scraping service, super + render | 200, 15,459 bytes, same

  The instant a first-come sale starts, the whole site becomes a waiting-room page, and every setting returns the same notice.

## A 15 KB notice slipped through an 8,000-byte gate

  The “not fetched” check I had added earlier that day looked for a JavaScript notice inside pages under 8,000 bytes. Large legitimate pages also contain the same sentence.

  This waiting-room page is about 15 KB. It passed the gate and was read as “fetch succeeded, 0 products”. It failed silently at the moment I most needed it.

  The fix: look at the title, not the size. If the title contains “heavy access” or “we will guide you in order”, treat it as a failure. I limited it to the title so legitimate pages that merely mention those words are not caught.

  I also changed the frequency from every 3 hours to every 15 minutes. At about 21 credits a run it is costly, but about 6,000 credits a day stays within 92% of the remaining balance.

## Two more causes of slowness found the same day

  Amazon’s 13 minutes were AI screening, not fetching. The Amazon monitor ran every 30 minutes, one scan took 13 minutes and the worst delay was about 43 minutes. The meter showed the time went to AI screening of new listings (421 a day, about ¥10). Fetching itself cost only 1,047 credits a day. The cause was handling 15 genres one at a time. They are independent, so I ran 4 in parallel, with a 10-minute interval and 8-minute runs. AI screening runs only for new listings, so cost does not rise with patrol frequency.

  Even when found fast, 17% were not notified. Finding things sooner means nothing if notifications stop afterwards. Counting what was delivered showed another hole (see the article on counting notifications (https://koshinstudio.com/en/notes/interval-vs-delivery/)).

## What I learned

> A hole in a judgement widens at the most important moment.

- A notice page has more than one shape. Short ones and big waiting-room pages. Size cannot tell them apart.

- Changing where you look reduces collateral. Title, not body, so legitimate pages are not caught.

- When a report arrives, measure at that time, on the spot. “It started at 14:00” was the last chance to reproduce.

- Check where slow time really goes. Amazon’s 13 minutes were serial AI screening, not fetching.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/waiting-room/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
