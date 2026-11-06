# Cutting six buttons to one: first-time players did not know what to press

> A browser game title screen had six things to press. I made the first step one button, and fixed saves vanishing inside an iframe and play continuing in a hidden tab.

- URL: https://koshinstudio.com/en/notes/first-visit/
- Original (Japanese): https://koshinstudio.com/notes/first-visit/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/first-visit/)

Development log of Sushi Stack / October 2026

  The title screen of Sushi Stack (https://koshinstudio.com/en/works/) had six things you could press. Someone opening it for the first time did not know which to press. For the game portal launch, I narrowed “what a first-time player presses first” to one. I also wrote down, from my commits, two problems I fixed at the same time: saves vanishing, and what happens when you leave the screen.

## What a portal measures you by

  According to the commit, the portal I decided to submit to (CrazyGames) first has a trial stage (Basic Launch) shown to a limited audience for two weeks. Whether you move up to the next stage (Full Launch) is decided by these three things during that time.

- The share of people who start playing

- Average time played

- The share of people who come back

  Ads are disabled during this trial, so these are all that matters now. In other words, I had to improve two things by design: “people who open it start playing” and “they come back.”

## I narrowed it to one thing to press

  The title had six: Play, Menu, Ranking, Encyclopedia, Words and Info. To a first-timer, they all look equally heavy. So I rearranged it:

- One large “Play.”

- “Menu” as a thin second option.

- Ranking, Encyclopedia, Words and Info are folded into a thin row below.

  The ranking and the encyclopedia are “reasons to come back,” but they are not the first step the first time. That was my judgment.

## From the second visit, show that there is more

  The title shows the high score and how much of the encyclopedia is filled. But not to first-timers, because showing 0 points and 0 kinds means nothing.

## Inside the portal, saves vanish

  The portal runs the game in an iframe on a different domain. In some browsers, saving to the device (localStorage) is blocked inside it, and high scores and the encyclopedia vanish every time.

  If the portal provides a storage shelf (CrazyGames’ Data Module), I save there; if not, I keep it on the device as before. The portal’s part arrives later, so it keeps looking until it is found.

  The way I verified it was to plug in a fake storage shelf. When the shelf exists, it writes there and not to the device. Even in an environment where saving to the device throws an error, it starts and can be played.

## Leave the screen and it stops

  Until then, when you moved to another tab, only the deadline kept advancing, and it was already over when you came back. Now, when sent to the background, it pauses and the sound stops too. I actually fired the event for the screen being hidden (visibilitychange) and confirmed that it stops, that the score does not move after 1.5 seconds, and that it resumes.

## What I verified

- In all 14 languages, it fits on an iPhone SE screen.

- Across 7 screens × 3 languages, the 9:16 aspect ratio does not break.

- Two full playthroughs (163 moves in Japanese, 263 in English) at 60 fps with 0 errors.

## What I learned

> What a first-timer needs is not choices but a first step.

- “A reason to come back” and “the first step” are different things. The ranking and the encyclopedia have value, but they are not what a first-timer presses first.

- Saving may be unavailable depending on where it runs. That it worked on my machine does not guarantee it works inside a frame.

- Design what happens when someone leaves the screen. It is easy to build assuming people are watching all the time.

  This article is written from my commit record (September 7, 2026). The portal’s review conditions are as stated in the commit. After this, the game was rejected in review (Rejected by CrazyGames (https://koshinstudio.com/en/notes/crazygames/)).

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/first-visit/).

  More in English

- All English pages (https://koshinstudio.com/en/)
