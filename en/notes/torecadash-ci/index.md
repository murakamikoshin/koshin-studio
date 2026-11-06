# No builds arriving in TestFlight: I had used up the 25 free Xcode Cloud hours (my first diagnosis was wrong)

> New builds stopped appearing in TestFlight. My first diagnosis (“[ci skip] is blocking builds”) was wrong; the workflow built the iOS app on every commit.

- URL: https://koshinstudio.com/en/notes/torecadash-ci/
- Original (Japanese): https://koshinstudio.com/notes/torecadash-ci/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/torecadash-ci/)

Development log of Torecadash / October 2026

  While developing my iOS app, Torecadash, I hit a bug: “new builds are not arriving in TestFlight.” The first cause I came up with was wrong. This is where I went wrong, how I noticed, and what the real cause was, written from the numbers in my hand-over notes and commits.

## The first diagnosis: “[ci skip] is the cause”

  On September 2, I got a report: “there have been no builds since 9/1.” My first diagnosis was that [ci skip] in my commit messages was stopping the builds. I had been adding it to documentation-only changes so they would not use up Xcode Cloud’s free tier (25 hours a month). Along with the diagnosis, I even wrote a rule: “do not use [ci skip].”

## The timeline did not fit

  Looking at Xcode Cloud in App Store Connect, it said:

> You have reached your usage limit. The limit resets on September 8, your renewal date.
  Usage over the last 30 days was 493 builds, 28 hours 14 minutes. The free tier is 25 hours a month, so it was used up.

  What showed my first diagnosis was wrong was the timeline. Only three commits carried [ci skip], all on September 2. The builds had stopped on September 1. The cause came after the effect, so it could not be the cause. Worse, the rule I made was counterproductive when the quota was short.

## Why did it run 493 times?

  The workflow’s start condition was “any file changed.” Counting commits over the last 30 days:

    Last 30 days | Count

    All commits | 1,146

    of which touched the iOS app | 219 (19%)

    Builds run by Xcode Cloud | 493 (3.4 minutes each on average)

  So 80% of the time, I was building the whole iOS app although only server code or documents had changed. On top of that, “Clean build” was checked, so every build skipped the cache and took as long as possible.

## The fix is a setting, not a marker

- Change the start condition to custom file and folder rules, limited to the iOS app folder and the Xcode project.

- Uncheck “Clean build.”

  My hand-over notes estimate this takes builds from 493 to about 94, and time from 28 hours to about 5.4 hours a month. That is a calculated estimate, not a measurement after the change.

## What I learned

> Check whether a cause explains the facts, using the timeline, before settling on it.
  My first diagnosis stopped at the first plausible cause. Something that happened after the effect cannot be its cause. This check takes a minute if done before announcing the diagnosis. In my hand-over notes (§183) I left a warning that “this diagnosis was wrong,” as a record.

  The numbers in this article come from my hand-over notes and the commit record (September 2, 2026).

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/torecadash-ci/).

  More in English

- All English pages (https://koshinstudio.com/en/)
