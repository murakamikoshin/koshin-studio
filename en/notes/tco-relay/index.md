# “Checked” marks on articles that had never been read: the t.co relay page

> Opened with a browser User-Agent, t.co returned a relay page instead of redirecting. All 220 displayed articles were unread and 9 were closed forms. How I fixed it and how I removed the wrong “checked” marks.

- URL: https://koshinstudio.com/en/notes/tco-relay/
- Original (Japanese): https://koshinstudio.com/notes/tco-relay/
- Published: 2026-10-17
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/tco-relay/)

Development log of the Toreca Dash app / October 2026

  My iPhone app Toreca Dash collects trading-card lottery information from store posts on X (Twitter). Each post links to an application form. The app also opens that link to check the deadline and whether entries have already closed.

  A report came in: “the deadline is wrong”. It turned out to be worse than a wrong deadline: the app had never read the linked page at all, and yet the article carried a “checked” mark.

  This is written from my work log of 16 October 2026 (the investigation and its numbers).

## The symptom: a closed form still shown as open

  The reported lottery was a game shop’s “30th CELEBRATION card set, 9 types” announcement on X. The Google Form it linked to said “Responses are no longer accepted”. In the app, the lottery was still shown, with an empty deadline.

  The odd part: the article had a “checked whether it has closed” timestamp. It had been “checked” and nobody noticed it had closed, so the check was not looking at the page.

## The cause: t.co returns a different page if you pretend to be a browser

  Links in X posts go through the short URL t.co. Normally it redirects to the real page (HTTP 301).

  But if you open it with a browser User-Agent, it does not redirect. It returns a roughly 500-byte page that redirects with JavaScript. Both of my reading functions opened t.co with a browser User-Agent and “follow redirects”. So:

- No redirect happened, so the final URL was still t.co.

- The text I read was the relay page’s HTML, not the form.

- I had never read the form at all.

  I had added the browser User-Agent on 6 August. This bug was a side effect of that change.

## How widespread was it?

  To check whether this was one case, I looked at every displayed X lottery or reservation article with a t.co link.

    What I checked | Result

      Displayed articles with a t.co link | 220

      Of those, relay page returned | 220 (all)

      Of those, actually a closed form but still displayed | 9

  The 9 were spread over several stores, so it was a systemic problem.

  One more clue I could not ignore: a daily job that fixes empty deadlines had been reporting “126 targets, 0 updated” every day. Not “nothing to fix” but “could not read, so could not fix”.

## The fix

  I put the redirect lookup into one function, fetchTcoTarget:

- Open t.co without a User-Agent, and do not follow redirects (redirect: "manual"). Take only the first target.

- If a target comes back, use it.

- If a relay page comes back, read the meta refresh tag inside it to get the real target.

- Then open that target with the browser User-Agent.

  Whether you send a User-Agent changes what comes back, so I split the uses: resolving a short URL uses none; reading the real page uses the browser one. I added a regression test.

## What to do with the wrong “checked” marks

  Fixing the code is not enough. The wrong marks stay on the articles. An article with the mark counts as “already checked” and is skipped.

  I removed the mark from 195 articles (X lottery/reservation posts that link to a post and have a t.co link), then ran the closed-entry check and the deadline re-extraction by hand.

    Job | Before | After

      Deadline re-extraction (targets / updated) | 126 targets, 0 updated (every day) | 123 targets, 14 updated

  The same day I also changed the closed-entry check: articles with no deadline every 6 hours (with a deadline, every 24), 80 articles per run instead of 40, 7 minutes at most. Now that t.co can be read, a closed form should not stay up for a whole day.

## What I learned

> Write “checked” only when you could actually read it.

- Write the mark only on success. If you mark an unreadable page as checked, it is never looked at again, even after the fix.

- After fetching an external page, check it is the page you meant. Is the final URL still the short URL? Is the text the right kind of page?

- “0 updated” every day can be a symptom. Tell “nothing to do” from “could not do”.

- When you change a network setting, review everything that uses it. A User-Agent added in August broke t.co reading two months later.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/tco-relay/).

  More in English

- All English pages (https://koshinstudio.com/en/)

- Toreca Dash (https://koshinstudio.com/en/works/torecadash/)
