# Four gaps in monitoring X: posts missing from search, accounts that change hands, a store-finding query, and catching up after an outage

> Four stores’ lottery posts did not appear in search even after 751 posts; a registered store had become a person; store-finding found 11 of 63; and after a 6-day outage only 185 of 2,866 were read in 2 hours. Fixes and cost estimates.

- URL: https://koshinstudio.com/en/notes/x-monitoring-gaps/
- Original (Japanese): https://koshinstudio.com/notes/x-monitoring-gaps/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/x-monitoring-gaps/)

Development log of the Toreca Dash app / September 2026

  Of my app Toreca Dash’s sources, the fastest and the easiest to miss is stores’ own posts on X (Twitter). Stores announce lotteries and first-come sales on X first. The app patrols registered store accounts regularly.

  On 19 September 2026, four “gaps” in this monitoring turned up in a single day. This is the record.

  Numbers come from my work logs of 19–20 September 2026. Private individuals’ accounts are not named.

## 1. Some posts do not appear in search

  The monitor found posts through X search. But for four stores, lottery announcements did not appear even after fetching 751 posts without any keyword filter, nor per store. X search can omit part of a store’s posts.

  Reading the timeline (the store’s own list of posts) directly (profileTweets) worked.

  The nasty part: a store for which no article can ever be created stays “no track record”. Patrol priority and countermeasures are based on track record, so those stores are never included. What cannot be seen stays unseen (a chicken-and-egg problem).

  The fix: read store timelines in addition to search. But timeline reads cannot be filtered by words and every item read is billed. So stores with a track record are read daily, stores without it weekly, with a cap per store (10 and 8 items).

    Estimate | Value

      Posts per day, stores with a track record | 13.5

      Posts per day, randomly chosen stores | 4.5

      Monthly cost after adding | about $51 (the plan includes $39)

  Cost varies a lot with each store’s posting rate, so always estimate from measurements. It stops automatically once the month passes $62, and an automatic pace check estimates whether all stores can be read daily with the remaining budget, narrowing the stores if not.

## 2. A registered store had quietly stopped being a store

  Two accounts registered as “stores” in the monitoring list were no longer stores. One, registered in August as a branch of a second-hand shop, had become a person’s chatter. The other, registered in May, was an individual info account whose “[PR] lottery sale” posts became articles as if from a store.

  Articles appear as “store primary information”, so wrong information is notified as is.

  The list was checked only once, when registered. Nothing noticed when an account’s owner or use changed.

  The check: match the store name in the list comments against the display name on articles from the last 30 days, by a 2-character overlap. Of 828, I reviewed mismatches by eye and found 2 had become personal. Most mismatches were just “unknown” registrations that became official names, so I decided by eye, not by machine.

## 3. The store-finding search found only 11 of 63 stores

  New stores’ X accounts are found by search. The query was “store name genre name lottery site:x.com”, looking at the top 5 results. Out of 63 stores, it found X for only 11. Aggregators and customers’ posts ranked first and were rejected by the store-name match.

  Among 8 stores whose X account was known, the old method found 5 and the “store name site:x.com” query found 7 (all ranked first).

  But in a dry run right after widening the query, it picked up personal or unrelated accounts, because search-result titles contain the whole post and the match fired on the store name in the body. I changed it to extract only the display-name part of the title. More hits bring more mistakes at the same time. When you change a query, always run a preview and look at each item it picks up.

## 4. Catching up after an outage took half a day

  The data-fetching service’s (Apify) budget ran out, and X monitoring was down for 6 days. When I resumed, in 2 hours it read 185 of 2,866.

  Patrol is a rotation: “stores with a track record every 3 hours, others every 12 hours”. A rotation fits the normal state where everyone is about equally behind. After an outage, lateness is not uniform. Catching up would take more than half a day, and lotteries closing the next day would end before being read.

  For the same reason, newly found accounts joined the middle of the “no track record” list and went unread for up to 12 hours.

  The fix: add to the rotation a slot that reads the longest-unread items, oldest first. Attempt marks are kept separately so items that keep failing do not hog it. I also ran a manual catch-up right after resuming.

## Aside: a “this month only” budget stopped everything twice

  This catch-up was caused by the budget running out. I used to change the cap month by month, “this month only $44”, “automatically go back to $29 on 6 September”. If the value I went back to was below that month’s usage, all X monitoring stopped at the cycle start. It happened twice (28 August and 13 September).

  The decision on 19 September: one monthly cap of $70, and the interval not changed by month (all accounts once per 6 hours). Real monthly cost is about $10 to $18. I do not bring back a month-by-month cap.

## What I learned

> Posts you cannot see cannot be counted.

- Do not rely on search alone. Search does not return everything, and what is invisible raises no complaints.

- Registration is not a one-time check. Owners change. Compare the registered name with the current display name regularly.

- Preview when you change a query. More hits means more mistakes.

- After an outage, catch-up needs its own design. The normal rotation does not suit it.

- Do not change a cost cap by month. Forgetting to restore it, or restoring the wrong value, stops everything.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/x-monitoring-gaps/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
