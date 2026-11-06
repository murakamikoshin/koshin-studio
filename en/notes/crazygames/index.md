# Rejected by CrazyGames with no reason given: I recorded the game and found four problems

> A game portal rejected my game with only “overall quality below expectations.” I recorded what the reviewer saw, found four causes and fixed them by measuring.

- URL: https://koshinstudio.com/en/notes/crazygames/
- Original (Japanese): https://koshinstudio.com/notes/crazygames/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/crazygames/)

Development log of Sushi Stack / October 2026

  I submitted Sushi Stack (https://koshinstudio.com/en/works/), my merge puzzle game, to the browser-game portal CrazyGames, and it was rejected. The only reason given was that “overall quality does not meet expectations.” So I captured the game myself and looked for the problem. I found four. This is written from my commit record.

## When no reason is given

  “Quality” does not tell me what is wrong. The commit notes say that once I actually recorded the game, I recognized the problems. A reviewer plays for a few minutes and judges from what is on the screen. So I decided to look at the same screen the reviewer saw.

## The four I found

### 1. A black line across the screen

  The darkening effect for the background left the edge where the wall meets the floor, so a black straight line ran across the screen and a vertical seam showed at the rim of the tub. It looked broken. I blended the boundary and changed the edge fade from a straight cut to a curve.

### 2. On a wide screen, the play area was only 30%

  On a wide screen the play area took 30% of the screen and the rest was just dark. I put the evolution chain (what merges into what) on the left. In a merge game it is the first thing players look for, and I had hidden it inside the encyclopedia.

### 3. The silhouettes of unlocked tiers were invisible

  Tiers not yet reached are shown as silhouettes. But I drew dark brown silhouettes on a dark background, so they could not be seen. I made it possible to pass a lighter silhouette.

### 4. Tension never happened

  The fourth was heavier than looks. Measured with auto-play, one game was a median of 594 moves, about 7.5 minutes, and my commit says “30 minutes for a human.” The tub never filled up, so the dangerous moments never came. In the few minutes a reviewer spends, tension never occurred even once.

## The fix: measure, then choose

  I decided not to touch the size or area ratio of each tier, since that would damage the feeling of merging into something bigger. I used auto-play to find places I could change without losing that feeling. I also gave my balance-testing tool a way to swap sizes and the spawn distribution from outside, and ran candidates in bulk to compare.

    What changed | Before | After

    Items that fall | 3 kinds | 5 kinds (added salmon and tuna)

    Moves per game (auto-play median) | 594 | 279

    Tub rim / height | 320 / 308 | 250 / 378

    Share of screen used by the play area | 45% | 62%

    Area ratio, conger eel to spiny lobster | 1.76 | 1.40

    Leftover width when two gold tubs sit side by side | 0 px | 36 px

  Now two gold tubs fit side by side, so a gold-tub merge (merging gold tubs together) works in real play. The logic had been there before, but it never happened once in 300 games. A game is half as long, so scores also dropped by about 20% (auto-play median from 59,305 to 46,529). I recalculated the ranking thresholds.

## What I learned

> “Low quality” was four separate problems.
  Two were about appearance, one about where information was placed, and one about the substance of play. When no reason is given, the first thing to do is look at the screen the other person saw. For someone who plays for a few minutes, tension that builds over 30 minutes does not exist.

  This article is written from my commit record (September 10, 2026). The result of a re-review is not included.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/crazygames/).

  More in English

- All English pages (https://koshinstudio.com/en/)
