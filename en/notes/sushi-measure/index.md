# “The pile settles at 89%” was wrong: my measurement was what was wrong

> Rebalancing a merge puzzle, I found my measurement had counted falling pieces. Three causes: a backward size ladder, a pit-shaped tub, and pieces tunneling the floor.

- URL: https://koshinstudio.com/en/notes/sushi-measure/
- Original (Japanese): https://koshinstudio.com/notes/sushi-measure/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/sushi-measure/)

Development log of Sushi Stack / October 2026

  Sushi Stack (https://koshinstudio.com/en/works/) is a falling-block puzzle where you bump the same toppings together to merge them and grow them until the tub is full. While adjusting balance, I realized my own measurement result had been wrong. What was wrong, how I found it, and how I fixed it are written with the numbers in my commits.

  The numbers in this article are as of September 7, 2026. After this, the sizes of the pieces were scaled by 0.8 across the board, and changed again on September 10 (the kinds of falling pieces and the shape of the tub) (written in the conger eel article (https://koshinstudio.com/notes/anago/), in Japanese). They differ from today’s numbers.

## “It settles at 89%” was wrong

  My first measurement said “the pile settles at 89% of the tub’s height.” That would mean you can stack without overflowing and never lose.

  When I measured again, this was an illusion from counting the falling piece. The real pile kept rising. But it rose so slowly that even after dropping 240 pieces, only a third of the tub was filled. “A game you cannot lose” did not mean safe. It meant the pile does not grow enough to lose.

## Three causes

  The commit splits the causes into three. Each was confirmed by measurement before I removed it.

### 1. The size ladder went backward in three places

  When I lined up the sizes by the radius of a circle of the same area (equivalent radius), in three places the merged piece was smaller than the one before.

- Tamago was smaller than shari

- Otoro was smaller than uni

- Anago was smaller than otoro

  Merging produced a smaller piece than before. On the busiest path, “shari → tamago,” more than half of what I dropped vanished on the spot. So I rebuilt it as a monotonically increasing ladder with a size ratio of 1.19.

### 2. The pieces were too small for the tub

  I had used the 9:16 portrait tub directly as the drop area, so it was a vertical pit rather than a real sushi tub. I made the tub shallow enough to fit in the lower half of the screen, and drew a noren curtain (with the game name) and a plank wall in the empty space above. The deadline (past it, you lose) became the rim of the tub itself.

### 3. Big pieces fell through the floor

  The physical thickness of the walls and floor was only 12, the same as how it looked, so heavier pieces tunneled through the single plank and fell out of the tub. I made the thickness 80, and also rounded the position for pieces born from a merge that sink into a wall. I also added a cleanup for spilled pieces (sweepStrays).

## The numbers after the fix

    What I measured | Before | After

    How full the tub is after dropping 240 | about a third | —

    Drops until game over | not reached | 385 (rank: journeyman)

    Score (same conditions) | 7,298 | 10,658

  The pile moves up and down in front of the rim and opens up at once with a big merge. The tension this kind of game should have appeared. The score rose because the pieces that had been falling through and vanishing came back. I verified that 9:16 holds from iPhone SE to 15 Pro Max, in landscape and on desktop, that there is no overflow or errors, and that 60 fps holds with a full tub.

## What I learned

> What you measure is not necessarily what you want to know.
  The first “89%” counted the falling piece, so it was not measuring “the height of the pile.” I want to record that when a measurement looks too good, it is better to doubt what is being counted than the number itself. After the fix, I measured the numbers again with the same method as the conger eel article (https://koshinstudio.com/notes/anago/) (hundreds of auto-played games).

  The numbers in this article come from my commit record (September 7, 2026).

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/sushi-measure/).

  More in English

- All English pages (https://koshinstudio.com/en/)
