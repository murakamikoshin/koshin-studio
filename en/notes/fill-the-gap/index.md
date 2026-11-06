# “Not just noticing; not letting it happen”: turning a report-only monitor into one that fills gaps on the spot

> The gap monitor only reported and nothing was filled until a person noticed. I made it create missing articles on the spot, logged a branch that dropped silently, and showed how to apply even with no link. Coverage went from 92% to 100%.

- URL: https://koshinstudio.com/en/notes/fill-the-gap/
- Original (Japanese): https://koshinstudio.com/notes/fill-the-gap/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/fill-the-gap/)

Development log of the Toreca Dash app / August 2026

  The goal of my app Toreca Dash is to show lottery information without missing any. The user’s instruction was: “don’t just notice; make sure missing things do not happen in the first place”.

  This article records how, on 27 August 2026, I turned monitoring from “find and report” into “find and fill on the spot”.

  Numbers come from my work log of 27 August 2026.

## A report-only monitor does not fill until a person notices

  The old gap monitor (reportCoverageGap) only reported. The gap stayed until someone noticed and ran a fix by hand. I made it create articles on the spot (fill), three times a day after the import.

- It uses the existing creation path. Duplicates are prevented by the existing check (hasExistingCoverageForStore).

- If the import side works correctly, this ends with 0. Anything created here means the import side still has a hole. Read the count as “the size of the holes left”.

## I added a log to the branch that silently dropped things

  An early return in one function (touchLastSeenIfExists) was the only branch that moved on without saying anything. All other branches log. That silence is why another hole (24 stores getting the same article ID) was not found for so long. A branch that silently drops is a hiding place for holes nobody can see.

## Even with no link, show “how to apply”

  Of 32 articles with an unknown application link, 17 were not given a URL in the other table either (a store’s app, an in-store QR and so on). But the other side writes the “how to apply” and “conditions” in prose. I imported those and passed them to the application-method detector. “Apply in the app” or “apply with the QR code in store” helps more than “we do not know where to apply”.

## Articles missed by the link repair

  Articles marked “application link unknown” that were neither app-only nor pointing to an aggregator never became a repair target: only 15 of 34 were. I made the mark itself the condition for being a target.

## The final numbers

     | Before | After

      Gap coverage (against one site, 24 items) | 92% | 100% (96% on the way)

      Displayed articles | 1,444 | 1,488 (+44)

      Articles with an application link | 97.4% | 97.8%

  But 100% is a number for one site. A gap survey against the X aggregates found 3 stores, but the stored text was cut at 500 characters, so that is a lower bound. I decided to measure again after X monitoring resumed.

## What I learned

> Connect the mechanism that notices to the one that fills.

- A report-only monitor does not fill until a person notices. Fill on the spot.

- The count filled is “the size of the holes left”. 0 is the goal.

- Add logs to branches that silently drop. One silent place hides a hole for a long time.

- Without a link you can still show how to apply. “Apply in the app” beats “unknown”.

- Decide repair targets by the mark itself. A combination of conditions leaves gaps.

- 100% is a number for what you measured. Call it a lower bound.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/fill-the-gap/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
