# Measuring the gap between ads in time, not in plays

> Why I replaced “one ad every 5 plays” with “7 minutes since the last ad” in a browser game, how it behaves, and what I still do not know.

- URL: https://koshinstudio.com/en/notes/adgap/
- Original (Japanese): https://koshinstudio.com/notes/adgap/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/adgap/)

Development log of Sushi Stack / October 2026

  Sushi Stack has a mechanism that can insert one ad at the break between one game and the next. At first I set it to “one ad per 5 plays,” and the next day I changed it to count time, not plays. This is the reason and a record of how it behaves.

  This site does not show ads yet (the ad loader is left empty). This is about a mechanism I built ahead of time for when ads are turned on.

## The first rule: one ad per 5 plays

  In the first version on September 7, an ad was inserted before “one more game” every 5 plays, and never on the first play. The idea was to skip the first game to protect the first impression. The game detects which of CrazyGames, Poki or Google it runs on, uses that SDK if there is one, and passes through if there is none.

## Why it did not fit

  The next day, September 8, I dropped this counting. The commit gives two reasons.

- If one game is long, ads never appear. A game can last 30 minutes, so the 5th play comes 2.5 hours later. Almost nobody plays that long.

- If games end quickly, ads appear one after another. After several quick losses, several ads show up within minutes.

  Both come from counting plays. What bothers a player is not the number of ads but the time between ads. So I changed what I count to time.

## The rule after the change

- No ad on the first game (as before).

- For someone who has not seen an ad yet, one ad at the break after the second game.

- After that, only when at least 7 minutes have passed since the last ad, one ad at the next break.

  The time of the last ad is remembered in the browser (localStorage). Nothing is sent to a server. The behavior I checked:

    Situation | Ad

    First play | None

    Second play (no ad shown yet) | Shown

    1 minute / 6 minutes since the last ad | None

    8 minutes since the last ad | Shown

    After a long game (40 minutes) | Shown

  For the earlier version (one ad per 5 plays), I ran 7 games with a fake CrazyGames SDK and confirmed that “an ad appears once after the 5th game” and that “with no SDK, none appears and there are zero errors.” For the time-based version too, I checked that the screen always returns after an ad ends.

## What I noticed while writing

  How I chose “7 minutes” is not in the commit. I will be honest: the reason is not recorded.

  What bothers me most is the length of a game. The commit’s “a game can take 30 minutes” was later, in the September 10 commit, written as “median 7.5 minutes in auto-play, 30 minutes for a human.” So 30 minutes is a guess, not a measured number. The 7.5 minutes of auto-play (7.7 minutes in the conger eel article (https://koshinstudio.com/notes/anago/), in Japanese) is the measured one.

  And on September 10 a game became half as long, so the earlier table is out of date. Recalculating (I put an auto-play game at half of 7.7 minutes, about 3.8 minutes):

    Length of one game | One per 5 plays (old) | One per 7 minutes (new)

    About 3.8 min (auto-play, after halving) | One per about 19 min | About one per 2 games

    About 15 min (half of “30 for a human”) | One per about 75 min | Every game

  I still have not measured how long a game takes a person. Whether 7 minutes is long or short cannot be decided without that. Measuring the length of a game comes before turning ads on.

## What I learned

> Counting plays makes ad frequency swing with how people play. Counting time does not.
  But changing to time did not make the frequency right. My current conclusion is that whether 7 minutes is long or short cannot be decided until I know how long a game takes a person. When I am ready to turn ads on, I will measure that first.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/adgap/).

  More in English

- All English pages (https://koshinstudio.com/en/)
