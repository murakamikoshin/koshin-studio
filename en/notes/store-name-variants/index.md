# “ヤマダ電機” versus “ヤマダデンキ”: spelling variants and duplicates had three overlapping causes

> Store names compared only by “contains”, deadlines differing by 59 seconds, and a manual-only dedupe job. I used a general comparison key instead of a synonym table, ran it hourly, and found two dangers in testing.

- URL: https://koshinstudio.com/en/notes/store-name-variants/
- Original (Japanese): https://koshinstudio.com/notes/store-name-variants/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/store-name-variants/)

Development log of the Toreca Dash app / August 2026

  In my app Toreca Dash, the same store’s name was written differently, such as “ヤマダ電機” and “ヤマダデンキ” (both Yamada Denki). Two reports came: “spellings vary” and “articles are duplicated for the same reason”. The instruction was: “make sure it does not happen for other stores either, thoroughly”.

  This article records that three causes overlapped, and the process of fixing with a general rule instead of a synonym table.

  Written from my work log of 25 August 2026.

## Three causes overlapped

- Store names were compared only by “contains”. The two Yamada spellings contain neither one another, so they were different stores.

- Deadlines were compared to the millisecond. The same “until 26 Aug” was 23:59:00 from the aggregator and 23:59:59 from X, a 59-second difference that stopped them being seen as duplicates. Four real products were like this.

- The dedupe job was manual-only and had never run automatically. Even if I make it as a “one-off repair”, articles arrive daily, so duplicates are born daily.

## The fix: no synonym table

  I made a comparison key (storeNameComparisonKey). It drops corporate forms, symbols, spaces and full/half-width, turns katakana into hiragana, and unifies “電機 / 電器 / でんき”.

  I do not make a table of store-name synonyms. It would recur whenever a new store appears. I made a general rule that unifies different writings that sound the same.

- Deadlines are compared as dates (Japan-time dates) and I require the same sale type instead. Even on the same day, first-come and lottery are different cases.

- Articles that have no store name (sellerName) and only a store name in the category are included. Aggregator and official-site articles are mostly like that, and I had overlooked them wholesale.

- When hiding as a duplicate, always set the hidden mark (hiddenByDuplicate).

- I added an hourly scheduled run.

- The spelling itself is also pulled to the majority of real data. I keep no list of correct spellings. On a tie, katakana wins, then string order, so the answer does not change at each run and cause a rewrite war.

## Two dangers found in testing

  Both found by tests after the fix.

- If you key only on the part before “＠”, a store whose name itself contains ＠ gets an extremely short key. “Card Shop ＠ Home. Kagoshima” would become a key like “card shop” and be equated with other stores. The comparison key does not cut at ＠. (Names with an advertising tail are caught by the contains test.)

- If “one is the beginning of the other means the same name”, branch names disappear. “Yellow Submarine” and “Yellow Submarine Akihabara” would merge and lose the branch. I treat them as the same only when the addition begins with a note marker such as “＠”, “【” or “（”.

  I checked 17 real patterns and found 0 mismatches.

## Result

     | Before | After

      Store-name spelling variants | 2 | 0

      Duplicates with same product, deadline and store | 7 groups | 0 groups

  As a bonus, 23 store names with an advertising tail like “○○ ＠ staff wanted” were unified too. When there are duplicates, the one kept is the one with a price and a result-announcement date.

## What I learned

> Fix with a general rule, not a list; and run the fixing job automatically.

- Do not compare only by “contains”. Different writings do not contain each other.

- Do not compare to the millisecond. Compare by date and sale type.

- A “one-off repair” is not enough for what is born daily. Run it automatically, regularly.

- A synonym table recurs with new stores. Use a general rule for same-sounding writings.

- Merge only notes. Never erase a branch name.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/store-name-variants/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
