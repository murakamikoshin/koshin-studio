# Sushi Stack scores stopped reaching the leaderboard: I changed the game’s numbers and forgot the server’s re-check (twice)

> Honest runs of a browser game stopped reaching the online leaderboard: two game values changed without updating the server that re-checks scores. The fix, and a test that compares both sides with the same seeds.

- URL: https://koshinstudio.com/en/notes/rank-verify-mismatch/
- Original (Japanese): https://koshinstudio.com/notes/rank-verify-mismatch/
- Published: 2026-11-07
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/rank-verify-mismatch/)

Development log of Sushi Stack / October 2026

  My browser game Sushi Stack (https://koshinstudio.com/en/works/sushitsumu/) has an online leaderboard. At some point, runs that were played normally to the end stopped appearing on it. The screen said: “Your record did not add up, so it could not be posted.” The cause was that I had changed numbers in the game and not updated the same numbers in the server’s re-check. And after I thought I had fixed it, a second mismatch was still there.

  This article is written from the work on October 23, 2026 and from the commits in the repository.

## What the leaderboard re-check does

  A leaderboard anyone can post to attracts fake scores. So the game sends the sequence of play (when, what was dropped, what merged) together with the score, and the server recounts the score and refuses it if it does not match the claim (server/verify.js).

  It does not replay the physics (how the toppings rolled). That does not fit in the free tier’s CPU time (10 ms per call). Instead it checks only that the books balance:

- Drop sequence: the toppings dropped match the sequence regenerated from the seed

- Inventory: nothing merged without two of the same topping existing

- Score: adding up the recorded events gives the claimed score

- Timing: drop intervals, chain parents and order contents are within the rules

  The weakness of this design: if even one number differs between the game and the server, honest records get rejected too.

## Mismatch 1: the golden-tub bonus was still 8,000

  On September 10 I tuned the length of a run and its rewards so that a “double golden tub” (making two golden tubs and merging them) became reachable. As part of that I raised the bonus for merging two golden tubs (GOLDEN_BONUS) from 8,000 to 25,000 (commit 174bb2b). The re-check still used 8,000.

     | Game (index.html) | Re-check (verify.js)

      Merging two golden tubs | +25,000 | +8,000

  Any run that merged two golden tubs got 25,000 from the game and 8,000 from the server, so it always disagreed. Only the very best runs, the ones that reached the double golden tub, were kept off the board. I fixed this (commit 2753293) and deployed the leaderboard server.

## Mismatch 2: the falling toppings were still 3 kinds

  After the fix, I got a report: “A normal run that ended quickly was not posted either.” That run never reached a golden tub. The first mismatch could not explain it.

  Looking further, a commit on the same September 10 (6ebabc3) had increased the falling toppings from 3 kinds to 5: rice, egg and shrimp, plus salmon and tuna, drawn with weights (ROLL_W = [1, 1, 2, 3, 2]). The re-check still “drew from 3 kinds with equal probability.”

     | Game | Re-check

      Kinds of topping | 5 (weighted) | 3 (equal)

      How each drop is drawn | One random number, subtract weights until it runs out | One random number × 3, rounded down

  The sequence regenerated from the seed drifts almost every time, and the first drifted drop is rejected as “sequence does not match.” In other words, since September 10, almost every normal run should have been rejected, golden tub or not. The golden-tub bug was a second mismatch hiding behind the main one.

  I cannot count how many players were affected. The server code had no counter for rejected records.

## It happened despite a warning comment

  From the very beginning, the top of verify.js said:

> The constants here must equal the ones in index.html. Touching only one side rejects honest records, so always change both.

  The warning was there. Still, in about 30 minutes on September 10 (14:05 to 14:34), I stacked five tuning commits on the game, and none of them touched the re-check. Writing it down does not keep it true. So I assumed it would be broken again and made a machine watch it.

  tools/verify-sync.mjs checks two things:

- The scoring constants (merge points, golden-tub bonus, chain cap, drop interval and so on) and formulas (chain multiplier, order rewards) are the same in the game and the re-check

- Given the same 6 seeds, the game’s rollItem() and the re-check’s makeRoller() each produce 2,000 drops, and the sequences match

  Run against the code before the fix, it caught both the golden-tub bonus and the sequence mismatch (all 6 seeds). After the fix, all 12,000 drops matched. It also runs first in the combined check (tools/check.mjs).

  A test that only compares constants would not have found the second mismatch (the weights). It was not a number that changed but the way of drawing itself. Only a test that actually runs both sides and compares their output caught it.

## Confirming with the real game

  A passing comparison does not prove that records the game really produces will pass. So I used my balance tool (it fast-forwards the game on a virtual clock and lets a bot play) and fed records written by the actual game into the re-check.

    Mode | Runs | Re-check | Score range

      Free play | 4 | All 4 passed | 36,368 – 54,836

      Orders | 4 | All 4 passed | 81,857 – 166,105

  All 8 matched, down to the recounted score. Then I deployed the leaderboard server again and played the live game myself to confirm the score was posted.

  None of the 8 bot runs reached a double golden tub. The path through merging two golden tubs is confirmed only by comparing constants, not by a real record.

## What I learned

- If the same number lives in two places, changing one breaks the other. A comment was not enough.

- “Fixed” may mean only one cause is fixed. Before saying it was fixed, I should have checked that the reported symptom (not posted even without a golden tub) was explained by the cause I fixed.

- I was not counting rejections. I do not know how many people hit this because the server rejected silently. Next, I want to count rejections by reason (sequence, score and so on) so a rise is noticed.

- Turn comparison tests into tests that run both sides. Matching numbers could not catch a change in how values are drawn.

  Related: halving the leaderboard’s free-tier usage (https://koshinstudio.com/en/notes/ranking-free-tier/) and making the 10-second game’s ranking fair (https://koshinstudio.com/en/notes/stopwatch-rank/).

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/rank-verify-mismatch/).

  More in English

- All English pages (https://koshinstudio.com/en/)
