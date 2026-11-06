# A secret token was in the logs in plain text: scrub at the one exit that cannot be forgotten

> An HTTP library put the request URL in its error message, so a scraping-service token reached the logs. My earlier scrubbing function worked only where called, and there are over 50 callers. I moved the scrubbing to the single exit every log passes through.

- URL: https://koshinstudio.com/en/notes/secret-in-logs/
- Original (Japanese): https://koshinstudio.com/notes/secret-in-logs/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/secret-in-logs/)

Development log of the Toreca Dash app / August 2026

  While checking the logs behind my app Toreca Dash, I found that an external service’s secret (an API token) was written in plain text. It was 24 August 2026.

  It had been a to-do I had marked “no deadline, optional”. Looking at the server’s real logs, it really had leaked. This article records the cause and the fix: scrub at a place that cannot be forgotten.

  Written from my work log of 24 August 2026. No real value is included.

## A real token was in the log

  The server log had lines like this (the token part was real):

  WARN [recheck] fetch via the scraping service failed [https://…]:
request to https://api.scrape.do/?token=<the real token>&url=… failed, reason: read ETIMEDOUT
  The cause: the error message of the HTTP library (node-fetch) includes the request URL as is. The token= in the URL carries the secret.

## I had “fixed” the same thing before

  On 19 August the same thing had happened with Rakuten API credentials. I wrote a function to scrub secrets from log strings (redactSecretsForLog). But it only works where it is called explicitly. There are over 50 places that call the scraping service, and I had forgotten some.

## The fix: scrub at the single exit every log goes through

  So that I would not repeat the same fix, I did two things:

- Scrub at the log exit (fmt()). Every server log goes through it, so it cannot be forgotten. It scrubs URL query values such as token, api_key, secret, applicationId, accessKey, affiliateId and setCookies, and also the raw form of the X-monitoring login cookies.

- Rebuild the error in the function that calls the scraping service. Before returning it to callers, re-create the error with the scrubbed text. That function is also used on the event-driven side (Cloud Functions triggers), so this covers that log too.

  I checked four real log strings. I also checked that ordinary log lines do not change (an unrelated = like deadline=2026-08-30 must not be scrubbed).

## What about logs already written?

  Even after the fix, logs already written still hold the real token. They can be read only with administrator rights on the server, so urgency was low, but if it worries you, reissue the token in the service’s dashboard and replace the value in the server’s settings. At the time of this record I had left that as an item awaiting a decision.

## What I learned

> If there are 50 places where you can forget, do it once at a place you cannot forget.

- A countermeasure you must call explicitly leaks when forgotten. Forget one of 50 and it leaks.

- Scrub at the single exit. Put one at the place every log goes through.

- Check you are not scrubbing too much. Test that ordinary logs do not change.

- Things already written do not vanish. Decide whether to reissue.

- Do not trust a third-party library’s error messages. They can include the URL as is.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/secret-in-logs/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
