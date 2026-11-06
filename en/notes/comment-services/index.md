# Comparing comment systems for static sites by their official information: giscus, utterances, Disqus, Remark42 and more

> giscus, utterances, Disqus, Remark42, Cusdis, Staticman and Commento compared by official pages (Oct 2026): storage, ads and tracking, maintenance status.

- URL: https://koshinstudio.com/en/notes/comment-services/
- Original (Japanese): https://koshinstudio.com/notes/comment-services/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/comment-services/)

A comparison / October 2026

  The comment box on this site is giscus. It is set up so that nothing connects to an outside site until you press “Open comments.” What are the other options like? I read only the official descriptions and official repositories and lined them up. I have actually used only giscus.

  This is what I confirmed on October 8, 2026. The state of services changes. Check the sources before you use one.

## Quick table: look up what you want to know

  The answers first. Details and sources are in the sections below.

    What you want to know | What the official pages say

    I do not want ads or tracking | giscus, utterances, Cusdis and Remark42 say officially that there is no tracking or advertising. The free version of Disqus is run on ads.

    I do not want to run a server | giscus (GitHub Discussions) and utterances (GitHub Issues) store on GitHub. Both need a GitHub account to write.

    I want people to write without logging in | Cusdis needs no login but has ended. Remark42 can allow anonymous posts by configuration (you need your own server).

    I only want ones that are still maintained | Recent updates were confirmed for giscus (2026-05-26) and Remark42 (2026-09-14). utterances, Staticman and Commento are suspected stopped; Cusdis has ended.

    I want a Japanese UI | giscus and Remark42 have Japanese translation files. I could not confirm for the others.

  The contents of the table were confirmed on official pages and repositories on October 8, 2026. “Suspected stopped” is not an official announcement of closure.

## Where it is stored and who can write

    Service | Storage | What you need to post | Cost

    giscus | GitHub Discussions | A GitHub account | Free (MIT)

    utterances | GitHub Issues | A GitHub account | Free (MIT)

    Disqus | Disqus’s servers (I could not confirm an explicit statement on storage) | Could not confirm | The free version has ads. Paid Plus is $12 to $35 a month depending on monthly pageviews ($12 up to 100,000, $20 up to 350,000, $35 up to 900,000; official help, 2025-04-30 version).

    Remark42 | A server you run yourself (built-in data store) | Various logins (Google, GitHub and so on), email; anonymous by configuration | Free (MIT). Server cost is yours.

    Cusdis | A server you run yourself (PostgreSQL and others) | No login needed | OSS (GPL-3.0)

    Staticman | Saved as files in a GitHub or GitLab repository | Could not confirm | OSS (MIT). You run it yourself.

    Commento | A server you run yourself (PostgreSQL) | Supports login and SSO. I could not confirm anonymous posting. | The self-hosted version is free software. The README says the cloud version is not offered for free.

## What the official pages say about ads and tracking

- giscus and utterances: Both state officially that there is no tracking and no ads. Note that opening giscus comments connects to GitHub, and how GitHub handles that is a separate matter.

- Disqus: The free version is run on ads. The official help describes cookies recording visits to advertisers’ sites, cookie IDs being shared with advertising partners and affiliates, and wording such as “sold or shared.” Adopting it seems to carry the heaviest burden for consent management and ad-related notices (I did not look into how this is treated under its official policy).

- Cusdis: The README says it uses no cookies at all.

- Remark42 and Commento: The official pages say they do not track users and have no ads.

## Is it still maintained?

  You use a comment system for a long time once it is in. Whether it has stopped matters.

    Service | What I confirmed on the official repository or page | Assessment

    giscus | No formal release numbers; it states “rolling-release.” The latest change was 2026-05-26. A warning that features may break because of changes on the GitHub side. | Active

    Remark42 | Latest is v1.17.1 (2026-09-14). | Active

    utterances | The last commit was 2022-02-12. No releases. Not archived. | Suspected stopped (no announcement of closure)

    Staticman | The last commit was 2020-07-06. The only release is v1.0.0 from 2016. | Suspected stopped (I could not confirm an official announcement)

    Commento | The last tag is v1.8.0 (2020-04) and the last commit 2021-02-28. The cloud site and its description pages all return 404. | Suspected stopped (I could not confirm an official notice)

    Cusdis | The repository was archived on 2026-07-17. The README says “deprecated.” | Ended, it is fair to say

    Disqus | The service is running (the pricing help article is dated 2025-04-30). | Running

## Japanese, spam protection and weight

- Japanese UI: giscus and Remark42 have Japanese translation files. I could not confirm for the others.

- Spam protection: giscus only says comments can be moderated on GitHub, with no spam protection described. Disqus has a spam filter even in the basic free version. With Cusdis, the admin approves before display.

- Weight: Only Cusdis gave a number (about 5 kb gzipped). giscus has an option to delay loading comments. utterances says it is “lightweight” but gives no number.

## What I paid attention to with giscus on this site

  The giscus documentation says there is no tracking or ads. Even so, on this site nothing connects to giscus or GitHub until you press “Open comments.” That is so people who only read generate no extra traffic and the page loads lighter. The conditions for connecting are written on the privacy page (https://koshinstudio.com/en/privacy/).

## What I learned

> More than a feature table, ask “is it still going?”

- More services have stopped than I expected. Of the 7 I looked at, 4 (Cusdis, Staticman, Commento and utterances) had ended or were suspected stopped.

- Free services sometimes make you pay with ads or tracking. The free version of Disqus is an example.

- Systems that need a GitHub account to write (giscus, utterances) narrow your readers to people close to development. Depending on who reads your articles, that may not fit.

## What I could not confirm

- Disqus: the official pricing page (its body is drawn by JavaScript and could not be read; the prices are from the help article), requirements for commenters’ accounts, a Japanese UI, an explicit statement on storage, load weight.

- utterances: a Japanese UI, spam protection.

- Cusdis: cloud-version pricing, the list of supported languages.

- Staticman: requirements for commenters, spam protection such as Akismet, statements on ads or tracking, an official announcement of closure.

- Commento: the state and price of the cloud version, a Japanese UI, an official notice of closure.

- How a comment section is treated under AdSense’s official policy (I did not look into it).

## Sources (all checked on October 8, 2026)

- giscus: repository (https://github.com/giscus/giscus)

- giscus: official configuration page (https://giscus.app/ja)

- utterances: repository (https://github.com/utterance/utterances)

- Disqus: pricing and plans (help) (https://help.disqus.com/en/articles/1717110-comments-pricing-and-plans)

- Disqus: privacy FAQ (https://help.disqus.com/en/articles/1717103-disqus-privacy-faq)

- Remark42: repository (https://github.com/umputun/remark42)

- Cusdis: repository (https://github.com/djyde/cusdis)

- Staticman: repository (https://github.com/eduardoboucas/staticman)

- Commento: repository (GitLab) (https://gitlab.com/commento/commento)

  I read some of the official pages through summaries. The Disqus prices were checked against the original text of the official help article (2025-04-30 version) on 2026-10-08. Disqus’s own pricing page is drawn by JavaScript and could not be read, so please check current prices there.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/comment-services/).

  More in English

- All English pages (https://koshinstudio.com/en/)
