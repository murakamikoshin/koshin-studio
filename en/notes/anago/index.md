# The conger eel was too big: finding why a merge puzzle’s last piece was out of reach

> I could never reach my puzzle’s last piece. Statistics from hundreds of auto-played games showed the real cause: everything was too big for the tub.

- URL: https://koshinstudio.com/en/notes/anago/
- Original (Japanese): https://koshinstudio.com/notes/anago/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/anago/)

Development log of Sushi Stack / September 2026

  Added on October 8, 2026. The numbers in this article are from the September 8 version. On September 10 I changed the sizes and the falling pieces once more (see “Afterward” at the bottom).

  After finishing Sushi Stack (https://koshinstudio.com/works/sushitsumu/), one thing bothered me: I could never reach the last piece, the golden sushi tub.

  However many times I played, I rarely even saw the spiny lobster before it. My feeling was “the conger eel is too big.” But if you tweak sizes by feel, something else usually breaks. I decided to measure first.

## Building a way to measure

  The game is a single HTML file, and time is driven by requestAnimationFrame. As it is, a game takes minutes, so I swapped in my own clock. I intercept requestAnimationFrame and setTimeout and advance them at any speed I like. If I also empty the drawing code, a game finishes in about 2 seconds.

  After that I wrote a bot of modest skill — merge first, and wait until the pile settles before placing — and let it run.

## What a hundred games showed

  First, a hundred games as it was.

  score   min 12,337 / median 21,664 / max 44,622
best piece reached   otoro 43 games  anago 52  spiny lobster 4  golden tub 0
  Zero for the golden tub. So where does it get stuck? Lining up the yield for moving up one tier (the share of times two of the lower piece became one of the next) made it clear.

    Merge | Yield

    Salmon → tuna | 94.0%

    Tuna → ikura gunkan | 91.9%

    Ikura gunkan → uni gunkan | 86.9%

    Uni gunkan → otoro | 71.4%

    Otoro → anago | 55.2%

    Anago → spiny lobster | 13.1%

    Spiny lobster → golden tub | 0.0%

  It falls gently and then there is a cliff at the anago. Of the 61 anago made, 53 (87%) were still sitting on the final board. Only 8 made it to a merge.

## The conger eel really was off

  Lining up the dimensions made it obvious at a glance. The inner width of the tub is 336.

    Piece | Width | Height | Width / inner | Growth from previous

    Otoro | 149 | 83 | 44% | ×1.34

    Anago | 247 | 71 | 74% | ×1.66

    Spiny lobster | 230 | 107 | 68% | ×0.93

    Golden tub | 210 | 210 | 62% | ×0.91

  The anago was the widest piece in the game. Wider than the spiny lobster after it, and wider than the final golden tub. Its width growth is 1.66 where other tiers are 1.0 to 1.34.

  As a result, when one anago lies down, the gap left beside it is 336 − 247 = 89. Only up to salmon (width 85) fits there; neither uni nor otoro. The anago spanned the tub and blocked the road ahead.

  By the way, the ladder of areas was clean. Every tier was a constant “0.70 to 0.71 times the two pieces below.” Only the order of widths was broken.

## Fix it, but measure first

  I made only the width 4/5 (247 → 198) and ran another hundred games.

     | Median | Max | Anago | Spiny lobster | Anago → lobster yield

    247 × 71 (original) | 21,664 | 44,622 | 61 | 4 | 13.1%

    198 × 71 | 24,858 | 47,392 | 79 | 12 | 30.4%

    205 × 85 (keep the area) | 25,149 | 36,350 | 33 | 1 | 6.1%

  The third row was interesting. The version that got thinner while keeping its area made the late game not move at all. What mattered was not “thin” itself but that the anago no longer spanned the tub and big pieces could sit beside it.

## Still, the golden tub is out of reach

  Spiny lobsters appeared three times as often. But the golden tub was still zero. Here another wall showed up.

  The falling pieces were only three kinds: shari, tamago and shrimp. After subtracting gari, each drop is only 2.217 shari-equivalents. Meanwhile:

    To make | In shari | Drops needed with zero waste

    1 anago | 256 | 115

    1 spiny lobster | 512 | 231

    1 golden tub | 1,024 | 462

  The measured number of drops was a median of 280 and 426 at most. Even with zero waste, there were not enough moves. 231 drops for a spiny lobster is right at the border, which matches the measured 12 in a hundred.

## The real cause: the sushi was too big

  In Suika Game some people make “twin watermelons.” That works because the last fruit is small enough compared with the box. What about mine?

  With one golden tub in place, I must make a second spiny lobster
  golden tub 210 + lobster 107 + lobster 107 = 424px  >  usable height 302px
  side by side: lobster 230 × 2 = 460px               >  inner width 336px
  It fits neither vertically nor horizontally. This is not a matter of luck or skill: there is no gap for it to fit in.

  So I tried scaling all the pieces by 0.8 across the board. The diameter of the golden tub goes from 210 to 168, exactly half of the tub’s inner width of 336.

     | Median | Max | Reach golden tub | Reach lobster | One game

    Original size | 24,858 | 47,392 | 0 / 100 games | 12% | 3.7 min

    0.8x | 58,741 | 103,630 | 7% | 65% | 7.7 min

  At last the road was open. The spiny lobster is reached nearly every game, and the golden tub appears once in a dozen or so. The twin never appeared in sixty games, which is not a failure; it is probably the right state. It became a legend within reach.

## I redrew the ranks too

  Scores came out 2.4 times higher, so I had to redo all the rank thresholds. For the top rank, matching the fact that games reaching the golden tub all scored 86,000 or more, I set 85,000. The number is the same as before but its meaning changed. Before, it was a decoration nobody could reach; now it is “make the golden tub and you are a legend.”

## I measured again after release

  With the fixed version, using the same contents as what is published, I ran three hundred games again. The shape I saw at 100 games continues.

    Measured | 300 games

    Median score | 59,305

    Highest score | 163,426

    Reached grilled anago | 99%

    Reached spiny lobster | 73%

    Reached golden sushi tub | 10% (31 games)

    Two golden tubs in one game | 0

    Length of one game (median) | 7.7 min

    Pieces placed (median) | 589

    Longest chain | 10

  The bot is tools/sim/bot.js. It merges first and waits for the pile to settle before placing. A human can play better or worse, but it was enough to compare before and after with the same yardstick.

## What I learned

> My feeling was right. But the cause was not where I thought.
  The feeling that “the anago is too big” was correct. But thinning only the anago did not move the late game, and the real cause was that all of the sushi was too big for the tub. If I had suspected and fixed one place, I probably would never have gotten there.

  Collecting statistics from three hundred games took about ten minutes in total. It was much faster and more reliable than tweaking by feel three times and checking.

## Afterward (September 10): I changed it again

  After this article, I submitted the game to CrazyGames and was rejected (details in another article (https://koshinstudio.com/en/notes/crazygames/)). What I reconsidered was that tension in the tub did not happen even once in the few minutes of review. The commit says: measured with auto-play, one game is a median of 594 moves, 7.5 minutes. 30 minutes for a human. The tub never fills, and dangerous moments never come.

  I left each tier’s dimensions and area ratios alone and changed only places where I could fix without losing the feeling of “growing as you merge.” I chose them by measuring with auto-play.

- Falling pieces from 3 kinds to 5. I added salmon and tuna to shari, tamago and shrimp (weights 1:1:2:3:2). More piles up per move and the median went from 594 to 279 moves. The rate of reaching higher tiers also went up.

- The shape of the tub. Rim from 320 to 250, height from 308 to 378. The play area went from 45% to 62% of the screen.

- Spiny lobster and golden tub scaled another 0.89x. The area ratio from anago to spiny lobster alone had jumped to 1.76 and is now 1.40, in line. The leftover when two golden tubs sit side by side went from 0 px to 36 px, and a double golden tub (golden tubs merging) became possible in real play. The logic had been there before but never happened once in 300 games.

  With a game half as long, scores also fell by about 20% (auto-play median from 59,305 to 46,529). I re-took the rank thresholds from quantiles of 60 games and restored the same distribution as before (apprentice 7%, journeyman 28%, head chef 40%, master 17%, legend 8%). I also raised the double-golden-tub reward from 8,000 to 25,000, because merges up to making one golden tub already give about 34,000 points.

  The moves needed for a double golden tub are 275 even with zero waste. Auto-play makes one golden tub in about 2.0 times the ideal, so auto-play cannot reach it (0 in 40 games). It is set up so that only a person who tidies the pile and plays well can reach it.

  The numbers in the “0.8x” table above (median 58,741, 7.7 minutes a game and so on) are from the September 8 version. They differ from the current numbers.

  Related

- Sushi Stack (work page, Japanese) (https://koshinstudio.com/works/sushitsumu/)

  Play (https://koshinstudio.com/play/sushitsumu/)

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/anago/).

  More in English

- All English pages (https://koshinstudio.com/en/)
