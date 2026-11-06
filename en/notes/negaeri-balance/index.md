# Setting the rules of Negaeri Shogi by playing AI against AI: one change that worked, six that broke

> A 6×6 board game where sandwiched pieces defect. Instead of guessing the numbers, I ran 40 to 100 AI-vs-AI games per rule. Flips per move went from 2% to 81%, removing the king guard ended games in 17 moves, and the first-move edge is still unsolved.

- URL: https://koshinstudio.com/en/notes/negaeri-balance/
- Original (Japanese): https://koshinstudio.com/notes/negaeri-balance/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/negaeri-balance/)

Development log of Negaeri Shogi / September 2026

  Negaeri Shogi (https://koshinstudio.com/en/works/negaeri-shogi/) is a shogi-style game on a 6×6 board played a bit like Othello. Pieces you sandwich defect to your side and are promoted at the same time. If the new moves of a promoted piece create another sandwich, the flips continue. That is a chain.

  The rules come down to about ten numbers. I did not set them by feel. I ran dozens of AI-vs-AI games per candidate and measured. Only one change really worked; most of the others broke the game. I keep the ways they broke here.

  The numbers come from the measurement log in the game’s README (as of 13 September 2026). They are AI-vs-AI results. Balance between human players has not been verified enough yet.

## What I measured, and how

  The AI is a home-made alpha-beta search. I made depth-3 AIs play each other and counted:

- Share of drops that cause a flip. If low, most moves do nothing.

- Average game length. Too short means a one-sided game.

- First player’s win rate. Closer to 50% is fairer.

- Share of games with a chain of 3 or more. Chains are the point of the game.

- Lead changes. Too few: whoever is ahead early wins. Too many: it flips every move and feels random.

  Candidates were compared at 40 games each; final numbers use 100 games. Anyone can re-run it with the README commands (npm run report, npm run sweep).

## The first rules barely did anything

  At first a sandwich only worked along the directions a piece can move in shogi. In AI-vs-AI games, only 2% of drops caused a flip. Games lasted 16 moves and the first player won 71%. A flipping game where almost nothing flipped.

    Stage | Drops that flip | Avg. moves | First player wins

      Start (move directions only, empty board) | 2% | 16 | 71%

      All 8 directions | 8% | — | —

      Formation start position | — | 29 | —

      Pieces next to the king are safe | 42% | 51 | 33%

      One extra pawn in hand for the first player | 42% | 61 | 47%

      Board edge counts as the end of a sandwich | 81% | 53 | 59%

  The first player’s win rate jumps 71%, 33%, 47%, 59% because each rule change moved the advantage somewhere else. Every change needed a fresh measurement.

## The change that mattered: the edge is an anchor

  If a run of enemy pieces ends at the edge of the board, it counts as sandwiched. Pieces pushed against the edge defect together. This took flipping drops from 42% to 81%. Compared with other ideas at 40 games each:

    Idea | Flips per move | Games with a 3+ chain | Lead changes

      Before | 0.76 | 15% | 7.0

      Edge as anchor | 2.51 | 85% | 7.4

      + dropped piece is promoted too | 3.06 | 80% | 9.9

      Dropped piece promoted, alone | 0.72 | 13% | 5.0

      Chain limit of 3 | 0.71 | 8% | 5.8

      Piece-count result at 60 moves | 0.69 | 3% | 4.8

  Promoting the dropped piece too adds flips, but lead changes rise to 9.9 and the lead flips nearly every move, which thins out the shogi side of the game. I left it out (one setting turns it on).

## What I tried and dropped

    Idea | What happened

      Off-direction sandwiches reach only 1 square | Games with a 3+ chain fell from 95% to 13%. The reach of a sandwich was the engine of chains.

      5×5 board | Flips per move rose from 2.88 to 5.99, but the first player won 70%. Games were short (35 moves).

      Remove the king guard | Games ended in 17 moves on average and the first player won 95%. Guards defect at once and the king is left bare.

      Chain limit of 8 | Almost identical (2.86 vs 2.88 flips per move). The limit of 5 hardly mattered.

      Dropped piece promoted by a big flip | More flips, but 9.9 lead changes: it flips every move.

      Piece-count result at 60 moves | Games with a 3+ chain fell to 3%.

  The most useful row was “a limit of 8 changes nothing.” Raising the limit sounds like it should add chains. Measured, the result barely moved, so the limit of 5 was not doing much. I was about to tune a number that did not matter.

## Pieces next to your king never defect

  In this game a piece next to your own king does not defect. Removing that rule is the third row above: 17 moves on average and a 95% first-player win. Guards defected in a single move and the king was taken early. It is one plain sentence in the rules, and the game does not work without it.

## Current numbers (100 AI-vs-AI games, depth 3)

    Measure | Value

      Average length | 52.7 moves

      Board fill | 61%

      Drops that flip | 81%

      Flips per move | 3.08

      Games with a 3+ chain | 87%

      Games with a 4+ chain | 38%

      Average lead changes | 10.4

      Games with no lead change | 0%

      Games where the loser led at some point | 98%

      Point at which the result is decided | 81% of the way through

      First player’s win rate | 61%

  The board changes hands again and again and stays close to the end, yet it is not luck: a depth-3 AI beat a depth-2 AI in 20 of 24 games (as first or second player). 98% of games end by taking the king, so sandwiching stays a means and the shogi goal stays the goal.

## Still unsolved: the first player’s edge

  In the final measurement the first player won 61% (59% in an earlier, separate measurement). That is 11 points from 50%. I tried five handicap setups and found none clearly better.

    Handicap | First player wins

      None | 33%

      One extra pawn in the first player’s hand (current) | 61%

      One extra pawn on the first player’s side of the board | 38%

      Move one of the first player’s board pawns into hand | 64%

      Extra pawn in hand for the first player and extra pawn on the board for the second | 27%

  Pieces come in whole units, and the same “one pawn” is worth very different amounts depending on where it is placed: a point-symmetric addition moved the result by +5 points in one case and −34 in the other. Adding up small pieces cannot tune it to 50%.

  In online play, matchmaking gives the first move to the lower-rated player, which partly cancels the gap. That is not a fix. Games between humans are still to be checked.

## What I learned

> Half the changes that felt like good ideas broke the game when I measured them.

- Build the measuring tool first. Being able to run AI-vs-AI games automatically is what let me compare six ideas under the same conditions.

- Some numbers do nothing. The chain limit gave the same result at 5 and at 8.

- Ideas that break the point of the game only show up in measurement. “Reach one square” looked like it would restore each piece’s character; it cut chains from 95% to 13%.

- Say what is not fixed. The first-player gap is still 61%.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/negaeri-balance/). Numbers come from the README measurement log (13 September 2026). Negaeri Shogi (https://koshinstudio.com/en/works/negaeri-shogi/) is free to play in the browser.

  More in English

- All English pages (https://koshinstudio.com/en/)

- Negaeri Shogi (https://koshinstudio.com/en/works/negaeri-shogi/)
