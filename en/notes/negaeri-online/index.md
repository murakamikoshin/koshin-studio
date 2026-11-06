# Online play that trusts nothing the client says: the server decides moves, clocks and results

> Online play without login. Moves are validated by the rules engine, the clock lives only on the server, a disconnect gets 30 seconds, tokens are signed with HMAC, and ratings use pre-match numbers. With real values from the server code.

- URL: https://koshinstudio.com/en/notes/negaeri-online/
- Original (Japanese): https://koshinstudio.com/notes/negaeri-online/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/negaeri-online/)

Development log of Negaeri Shogi / September 2026

  Negaeri Shogi (https://koshinstudio.com/en/works/negaeri-shogi/) has online play against strangers, with no sign-up or login. Press a button and you are matched with someone else who is waiting.

  The first rule I set for an online game was: trust nothing the client says. A client can be rewritten by its owner. It can send lies: “the board is like this”, “I have 2 minutes left”, “I won”. This article records how I built the server so those lies do not matter. Numbers and mechanisms are the real values in the server code.

  This is a record of the mechanism. Balance between human players is still not verified enough (see how I set the rules by AI-vs-AI play (https://koshinstudio.com/en/notes/negaeri-balance/)).

## Principle: the server decides; the client only asks

  A client can send only three kinds of message:

- join: join this match (with a signed identity token).

- move: play this move.

- resign: resign.

  It cannot send the board, the remaining time or the result. A received move is checked against the server’s own board by the rules engine, the same file the screen uses. Because the rules are written in one place, a move the screen allows can never be “illegal” on the server.

## One match = one small server

  The server runs on Cloudflare Workers. One match is handled by one Durable Object (a small server that keeps state), and both players connect to it over a WebSocket. The match’s progress (moves and clocks) is saved the moment each move is committed.

  A Durable Object sleeps when idle. When it wakes it replays the saved moves from the start to rebuild the board. Saving only the moves is less likely to drift than saving the board.

## What the server does when a move arrives

- Check for a timeout first. If the player to move has used all their time, the move is not accepted and they lose on time.

- Check whose turn it is. A move out of turn gets “it is not your turn”.

- Validate with the rules. An illegal move makes that player lose (reason: illegal move).

- Apply the move. Advance the board, append the move, advance the clock, save.

- Tell both players. The move, the order of flipped pieces, the chain count and the new clocks.

  An illegal move is not dropped silently; it loses the game.

## Only the server holds the clock

  Each player gets 3 minutes, plus 5 seconds per move (Fischer clock). The clock lives only on the server; the time on the screen is just a display of what the server sent.

  // when a move is committed
const used = now - clock.turnStartedAt;
clock.remaining[mover] = Math.max(0, clock.remaining[mover] - used) + INCREMENT_MS;
clock.turnStartedAt = now;
  Subtract the time used, add 5 seconds, start the other side’s turn. Math.max(0, …) keeps it from going below 0.

  The other problem is who notices a timeout when nobody moves. If the opponent sends nothing, the server does nothing. So I use an alarm (the server is woken at a given time). The next wake time is the earlier of “the moment the player to move runs out” and “the moment the disconnect grace ends”, and at least 1 second ahead.

## A disconnect gets 30 seconds

  Mobile connections drop. Losing on a momentary dropout would be harsh, so even after a disconnect the server waits 30 seconds. The opponent is told that the player left and how long the wait is. If the player returns in time, play resumes; the server resends all moves and clock state (a sync) so the screen catches up. If not, they lose on time.

  If the same person reopens the same match on another screen, the older connection is closed, so two screens cannot send different moves.

## Identifying people without sign-up

  With no login, the server must prove “you are that ID”. It issues an ID and signs it with a secret key (HMAC-SHA256), giving a token of the form “ID.signature”. The client stores it.

  To pose as another ID you need that ID’s valid signature, which you cannot make without the key. Signatures are compared with a comparison that checks every character to the end. An ordinary comparison stops at the first different character, and the timing difference can leak the signature.

  The token is valid only while it stays on the device. Clearing the device’s data makes you a new person. It is the trade-off for not requiring registration.

## Matchmaking: start close in rating, widen the longer you wait

  It matches players with close ratings. It starts at ±100 and widens the allowed gap by 100 every 10 seconds of waiting: a compromise between not making people wait and matching similar strength.

  Two players are paired if the gap fits either player’s allowed range, so the one waiting longer takes priority and no one waits forever. With several waiting, it goes from the longest wait and picks the closest rating.

  The lower-rated player gets the first move. The first move is slightly stronger, so the weaker player holds the stronger side, partly cancelling the gap.

## Ratings: Elo, using pre-match numbers

  Ratings use Elo, starting at 1500. The expected score is:

  1 / (1 + 10 ** ((opponentRating - myRating) / 400))
  The step size (K) is large while you have few games: 40 up to 30 games, 20 up to 100, then 10, so ratings approach true strength quickly.

  What I took care over: do not update the two ratings one after the other. Updating one first and then computing the other uses the opponent’s updated rating, which is unfair. Both use pre-match ratings.

  Only players with 10 or more games appear on the ranking, to avoid someone playing once and parking at a lucky rating.

## How I check it

- Unit tests: 126 tests cover rules, AI, clocks, rating, matchmaking and signatures.

- End-to-end tests: there are tests that open two browsers and make an online match happen, and tests that connect directly to the server.

  Not yet verified: behaviour with many strangers playing, and whether the first-player edge (61% in AI-vs-AI play (https://koshinstudio.com/en/notes/negaeri-balance/)) is the same for humans.

## What I learned

> Everything a client reports is a request. The server decides.

- The server holds the clock, the board and the result. Anything you give the client can be rewritten.

- Use the same rules for the screen and the server. Separate copies drift apart.

- Assume connections break. Decide the wait and the restore beforehand.

- Updating in sequence is unfair. Compute ratings from pre-match numbers.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/negaeri-online/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Negaeri Shogi (https://koshinstudio.com/en/works/negaeri-shogi/)
