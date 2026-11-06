# Before widening concurrency slots: widening a 2-core server from 8 to 14, and the earlier conclusion that was half wrong

> Shortening intervals made the 1-minute first-come monitor wait for a slot. I widened slots from 8 to 11 and 14 and measured. The real cap was not CPU but jobs sleeping on Rakuten API’s 1.5-second wait while holding slots.

- URL: https://koshinstudio.com/en/notes/concurrency-slots/
- Original (Japanese): https://koshinstudio.com/notes/concurrency-slots/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/concurrency-slots/)

Development log of the Toreca Dash app / September 2026

  The back end of my app Toreca Dash runs over 200 scheduled jobs on one small server (2 cores, 3.8 GB of memory). The number of jobs that can run at once is capped: the concurrency slots.

  On 7 September 2026, when I shortened some intervals to speed up first-come monitoring, the monitor I most wanted fast was slowed by waiting for a slot. I raised the slots from 8 to 11 and then 14. This is the record of that decision and of what to look at.

  Numbers come from my work log of 7 September 2026.

## 8 slots were not enough

  To speed up first-come monitoring I shortened several intervals. Then the one-minute “instant sell-out monitor” started being skipped, because all 8 slots were full.

     | 8 slots (after shortening) | 11 slots

      Queue length | 17–29 | 0

      Running at once | pinned at 8 | 6 / 11 (room)

      Monitor skips | 6 per 10 min | 1 per 10 min

      Load average | 1.62 | 1.24

      Memory | 1,161 MB | 667 MB

  With 11 slots the queue was 0 and load and memory fell. Most jobs only wait for network replies and use no CPU. The cap was the slots, not the CPU.

  The slot value lives only in a server settings file (runner.env) and never enters git, because the deploy script does not send it. Looking at the repository would not show this change, so I wrote it down and kept a backup of the old value.

## “Only 2 cores, so no more” was half wrong

  Later I added a lane for popular sets and a fastest lane. Concurrency pinned at 11, the queue grew to 15 and the monitor was skipped twice (effective interval 1.0 to 1.4 minutes).

- 2 cores, load 1.66, 83% of them.

- Long Rakuten jobs hold a slot while sleeping on the API’s 1.5-second wait: stock recheck 240 s, marketplace 181 s, new listings 110 s, stock 104 s.

- They use no CPU yet consume slots, the hardest culprit to see.

  At the time I concluded “with 2 cores, widening the slots would just slow everything” and reduced the Rakuten popular lanes.

     | After adding | After reducing

      Concurrency | pinned at 11 | 9–11

      Queue | up to 15 | 0–1

      Monitor skips | 2 per 10 min | 0

      Monitor effective interval | 1.4 min | 1.0 min

      Load | 1.66 | 1.25

  That conclusion turned out half wrong. The Rakuten jobs holding slots are asleep on the API wait and use no CPU. More slots only means “more can sleep at once”, not more CPU contention. I measured again with 11 and 14:

     | 11 slots | 14 slots

      Monitor skips | 1 per 5 min | 0 per 6.7 min

      Effective interval | 1.3 min | 1.0 min

      Load | 1.25 | 1.25 (unchanged)

## The deciding question: CPU-bound or waiting?

- If waiting jobs hold the slots, widen them, after checking load (uptime) does not rise.

- If CPU-bound jobs hold them, widening slows everything.

  Two places to look: the queue length (queued in the health check; if it is always at least 1 there is no spare), and the average run time per job, longest first. If long Rakuten-API jobs top the list, they are the ones sleeping on slots.

  That day I made the same regression four times: Amazon every 5 minutes, Amazon-like store every 5 minutes, batched Rakuten popular lanes, Rakuten popular lanes every 10 minutes. Each time I meant to speed up and instead ate slots and slowed the one I cared about.

## What I learned

> Do not count slots; look at what holds them.

- A job whose run time ≥ its interval occupies a slot. The faster it goes, the more others wait.

- Measure what the limit really is. CPU or slots? Look at load and memory.

- A previous conclusion can be half wrong. “2 cores, so no” did not apply to waiting jobs.

- Record settings that are not in git. A value only on the server is invisible in the repository.

- To speed one thing up, slow another down. Decide what to protect first.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/concurrency-slots/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
