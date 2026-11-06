# “The server went down and I cannot recover it” was wrong: only inbound SSH had been blocked

> From 3:10 a.m. I could not connect to the server and judged it stopped. In fact its processes had run for over 7 days, all 192 scheduled jobs were normal, and only inbound SSH was blocked.

- URL: https://koshinstudio.com/en/notes/misdiagnosis-down/
- Original (Japanese): https://koshinstudio.com/notes/misdiagnosis-down/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/misdiagnosis-down/)

Development log of the Toreca Dash app / August 2026

  My app Toreca Dash’s server became unreachable from 3:10 a.m. on 28 August 2026. I wrote in my notes: “the server went down; I cannot recover it from here”.

  That judgement was wrong. I only learned that when it came back at 10:15. This article is the record of why I was wrong and what the work I did in between produced.

  Written from my work log of 28 August 2026.

## What I saw, and what I concluded

- Ports 22 (SSH), 80 and 443 of the server were all closed.

- A traceroute reached a carrier backbone in Singapore and stopped just past it.

- The hosting provider’s (Hetzner) status page showed no incident for that region.

  From that I concluded: “the server has stopped, and I cannot recover it from here (it needs a restart in the provider’s console)”.

## What was true: the server had been running all along

  When it became reachable at 10:15 and I checked:

    What I checked | Result

      Server processes | had been running all along (uptime 7 days 10 hours)

      Jobs completed | 4,100

      192 scheduled jobs | kept running normally

      What was blocked | only inbound SSH

  The server had not stopped. Only connections from outside (SSH) were blocked. Nothing behind the app had stopped.

## A second mistake: the “pile of repairs” was made by me

  Meanwhile I also noticed “41 hourly repairs have piled up” and blamed that on the server too.

  In fact I had created it: I called an endpoint that does not accept a dry run (a no-write rehearsal), thinking it was a check. What I took as a check ran production work 41 times.

## The alternative route: deploy only what I needed elsewhere

  Because I could not get into the server, I deployed just the checks and repairs I needed to Cloud Functions, individually (firebase deploy --only functions:name). I did not touch any scheduled jobs. Those HTTP endpoints stay after the server comes back and can be used for checks as they are.

  I also noted what to do after recovery: first, send the day’s changes to the server. That day I had added 8 scheduled jobs, so they would run as catch-ups right after deploy. All had been run by hand from dry run through real run, so running them does no harm.

## What I learned

> “Cannot connect” is not “stopped”.

- Do not conclude from one angle. Ports can be closed while the process keeps running.

- Look at other signals. Are notifications arriving, is data being updated, what is the app’s state? Some things are visible from outside.

- Before writing “cannot recover”, write how much you actually know. All I knew was “SSH does not connect”.

- Do not run production while “checking”. An entrance with no dry run cannot be rehearsed.

- Keep an alternative route for when you cannot get in. A place where I could deploy individual functions helped.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/misdiagnosis-down/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
