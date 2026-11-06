# Fixing a gate does not fix existing data: a “tried already” mark, a URL marker and a lookup table

> After fixing a judgement, 12 of 32 existing articles stayed wrong (the skip mark lasts 7 days); a marker stored in the URL was lost on link rewrite and 111 articles were split again; removing a table key left written values. Five reports had one shape.

- URL: https://koshinstudio.com/en/notes/fix-the-existing-data/
- Original (Japanese): https://koshinstudio.com/notes/fix-the-existing-data/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/fix-the-existing-data/)

Development log of the Toreca Dash app / August–September 2026

  While developing my app Toreca Dash, I kept getting the same report in the same shape: “I fixed it, but it is not fixed”. The code is fixed, the tests pass, yet the screen still shows the mistake.

  The reason: fixing code does not rewrite data that is already saved. These are three forms of it, with real cases.

  Numbers come from my work logs of 26 August, 3 September and 8 September 2026.

## 1. I loosened a gate, but a “tried already” mark remained (3 September)

  A product-matching gate had a mistake. I fixed it and deployed. Yet 12 of the 32 existing articles stayed wrong.

  The reason was the “skip mark”. When the gate once says “this pairing is wrong”, the article gets a “tried already” mark and is not retried for 7 days. Fixing the judgement does not revisit it while the mark lasts. Among those 12 were 4 open lotteries closing on 5 and 6 September. Lotteries close in days, so waiting for the mark to expire means they vanish. The same day I found the same shape again (a 14-day cooldown in a process that splits into multiple products).

  The fix: before skipping because of a mark, re-check with the current judgement. If the judgement is a pure function that uses neither AI nor external calls, it costs nothing. If you also store “what material I judged with” (for example whether I looked at the image), you can retry only when new material appears.

## 2. A state marker was stored in the URL (3 September)

  Split articles (children) need a marker saying “already split”. At the time I put it in a part of the URL (?_product=product-name): “never split again if this is present”.

  But this project later rewrites application URLs to the store’s official page. The same day I started running that rewrite over everything. Anything stored in the URL is certain to be lost. Of 832 child articles, 111 lost their marker, looked like “parents not yet split”, and were split again. Broken articles pointing at themselves as the “replacement” went from 8 to 14 in 30 minutes. In the past, the same route had once made 1 article into 18.

  The fix was to decide using a field that does not get rewritten, such as splitFromArticleId. The other lesson: on a day you let “a process that only applied to some” run over everything, check what depends on the fields that process rewrites.

## 3. Removing a key from a table does not remove written values (26 August)

  I removed a store chain from the “nearest branch” lookup table. It was gone from the code. But the “nearest branch key” written on articles stayed. The app thought “there is a key, so show a distance”, prepared it and got no answer (the server returns 400 for an unresolvable key). Three articles were stuck forever.

  A change to a table is a change to code; migrating data does not happen automatically. When you remove something from a table, clean the existing data in the same change. This pairs with the mistake of adding a new hidden flag and forgetting to add it to the restore step: that is a miss on the adding side, this is a miss on the removing side.

  Cleaning can reveal new anomalies in audits. Those are real holes that were hidden. I did not restore the key to hide them.

## Five reports of one shape (8 September)

  On 8 September, five of the seven things found by running all 61 audits had the same shape: “a mechanism exists to fix it, but it does not reach the target, or never gets its turn”.

    Symptom | Root

      Opening days mixed into store names (4th report) | The fixer and the gate were different functions; the comment “same yardstick” was false

      A notification opens an article that does not exist (322) | The mark (split) was missing from the target query of the filling job

      Official events still displayed | The rejecting gate existed, but its re-apply never got a turn

      Wrong-unit reference prices (24) | The fix was buried in a 25-job rotation, one lap 2.5 days

      “19 deferred to the next run for time budget” | A cheap fix shared a budget and rotation with an expensive one

  A gate protects only new articles. Fixing existing articles is a separate process, and if that does not run, “fixed but not fixed” repeats. When the same report keeps coming, you have usually fixed the entrance but not the exit (existing data).

  The shared solution was to take “re-apply the save-time gate to existing articles” out of the rotation and run it every time. It reads articles once and passes them through the gate (no AI or external call; at most 20 articles and 50 marks per run).

## What I learned

> When you fix the entrance, fix the exit (existing data) too.

- When you add a gate, check that its re-apply runs every time. A gate protects only new articles.

- Re-check “tried already” marks with the current judgement. Waiting for expiry means the lottery is over.

- Put state markers in fields that are not rewritten. URLs get replaced later.

- When you remove from a table, clean the data. A code change does not move data.

- When a report comes twice, suspect the exit. Fixing the entrance is not enough.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/fix-the-existing-data/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
