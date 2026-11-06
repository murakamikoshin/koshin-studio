# “The same application page” does not mean “the same store”: 52 articles showed another store’s name

> A job that unified store names across articles sharing an application page turned a Sendai store into “Shinjuku South Exit”. One page was shared by 15 separate stores. I changed it to unify only when confirmed the same place and restored 52 articles from an untouched field.

- URL: https://koshinstudio.com/en/notes/same-page-not-same-store/
- Original (Japanese): https://koshinstudio.com/notes/same-page-not-same-store/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/same-page-not-same-store/)

Development log of the Toreca Dash app / September 2026

  In my app Toreca Dash a bug report said: “to users it looks like a different store’s lottery”. An article for a Sendai station store showed as “Shinjuku South Exit store”, and an article for a Hachioji flagship showed as “Noshiro store”. 52 articles were affected.

  The cause was a wrong premise: “the same application page means the same store.”

  Numbers come from my work log of 7 September 2026.

## The symptom: store names of other stores

  Articles carried the name of a different branch of the same chain. A user opens “the Sendai store’s lottery” and the text says Shinjuku. 52 articles were like that.

## The cause: the same page is not the same store

  A job unified the store name and deadline across articles that share an application page. Same lottery, same deadline; same store, same name, I assumed. It copied the highest-quality article’s store name to everyone in the group.

  The premise did not hold. On real data:

    Application page | Stores sharing it

      A page (1) | 15 separate stores (Sendai, Hamamatsu, Maebashi, Shiwa, Gamagori, Hiroshima and more)

      A page (2) | 9 branches of one chain

      A page (3) | One shop and three other chains (not even the same chain)

  Chains often use one application page for all stores. The same page does not mean the same store.

  The same accident had already happened on the hiding side, and a guard existed there (the 51-branch case of one chain). I had forgotten to add it to the name-copying side. The same fix had not been applied to every entrance that uses the same judgement.

## A coordinates-only guard was not enough

  My first guard was “if coordinates disagree, they are different stores”. But for a group where only one article has coordinates, the “definitely different places” test returns false and passes. In a dry run (no writes), shops of three different chains were about to be rewritten as one store.

  The lasting fix was to reverse the logic: “unify only when confirmed to be the same place”, not “do not unify when confirmed different”. Only when both have coordinates and they match. If coordinates are missing or differ, I respect each article’s own name. Deadlines are still unified, since they belong to the same lottery on the same page.

## Restoring the 52 articles

  I had not saved the original names. The clue was a field this job never touches (category), set when an article is created from its own source (the store’s X account or the aggregator row). I checked all 52 by eye, and category matched the source.

  Coordinates could not serve as evidence. They are derived from the store name, so after a rewrite they were the coordinates of the wrong name (category was Sapporo Station but coordinates were Shinjuku). So I discarded coordinates too and put them back to be derived again.

- 51 in a dry run, then the real run.

- Afterwards, 0 new overwrites (the guard works).

- Only 2 displayed articles where name and category differed, both just different spellings of one store.

## A bonus bug: items that could not enter the queue

  Trying to re-derive coordinates, none of 4 articles got their turn. The location fixer has two queues:

    Queue | Contents

      Front (60 at a time) | Articles that want coordinates

      Retry (a 300-item window) | 658 measured, of which only 34 truly lacked coordinates

  The retry queue also held items that had been solved (success wrote the flag as false and left it in the queue). 624 finished articles filled the window, so the 34 that needed work never got a turn.

  The fix: when solved, delete the flag. It sits in neither queue.

## What I learned

> Before assuming “the same”, confirm “the same”.

- The same link does not mean the same store. Shared pages are normal.

- Unify only what you have confirmed is the same. If you cannot confirm, do not touch it.

- Apply a fix to every entrance that uses the same judgement. Adding it to one leaves the other.

- If you did not save the original, restore from a field you did not touch, and check it by eye, one by one.

- Setting a flag to false is not deleting it. It stays in the queue.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/same-page-not-same-store/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
