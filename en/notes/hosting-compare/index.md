# Comparing static site hosts by their official terms: Cloudflare Pages, Netlify, Vercel, GitHub Pages and Firebase Hosting

> Cloudflare Pages, Netlify, Vercel, GitHub Pages and Firebase Hosting compared by official terms (Oct 2026): ads allowed, free limits, file limits, config.

- URL: https://koshinstudio.com/en/notes/hosting-compare/
- Original (Japanese): https://koshinstudio.com/notes/hosting-compare/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/hosting-compare/)

A comparison / October 2026

  This site and the systems around my iOS app run on Cloudflare (see my article on deploy pitfalls (https://koshinstudio.com/notes/deploy-gotchas/) and my article on free tiers (https://koshinstudio.com/notes/ranking-free-tier/), both in Japanese). How do the other hosts compare? I read only the official pricing, limits and terms pages and lined them up. I have not used the other hosts to compare in practice.

  This is what I confirmed on October 8, 2026. Pricing changes often (Vercel and Netlify have announced recent changes). Check the sources before deciding.

## Quick table: look up what you want to know

  The answers first. The numbers and sources are in the sections below.

    What you want to know | What the official pages say

    I want to put ads (AdSense and so on) on the site | Vercel’s Hobby plan treats hosting ads as commercial use and does not allow it. GitHub Pages disallows use for online businesses, and I could not confirm anything explicit about ads. For Cloudflare, Netlify and Firebase, I found no restriction in the terms I read (that is not an explicit permission).

    I do not want it to stop when I hit a limit | Netlify (300 credits a month) and Firebase (10 GB storage, 10 GB transfer a month) stop when reached. GitHub Pages bandwidth (100 GB a month) is a soft limit.

    I have many files | Cloudflare: 20,000 files per site, 25 MiB per file. Vercel Hobby: 15,000 source files and 100 MB in total.

    I want to use _redirects / _headers | Cloudflare and Netlify support them. Vercel uses vercel.json, Firebase uses firebase.json. For GitHub Pages I could not confirm.

    I want an official statement about speed from Japan | Cloudflare (locations in Tokyo, Osaka, Fukuoka and Naha) and Vercel (Tokyo and Osaka compute regions) had one. There are no latency numbers anywhere.

  The contents of the table were confirmed on the official pages on October 8, 2026. “I could not find it” does not mean “you can.”

## First, the most important one: are ads allowed?

  Can you put ads or affiliate links on a free plan? If you are thinking of earning from your site, this was the main dividing line.

    Service | What the official pages say

    Vercel | Hobby is for non-commercial, personal use only. Commercial examples explicitly include “hosting ads such as Google AdSense” and “sites whose main purpose is affiliate links.” To show ads, you need Pro or above.

    GitHub Pages | It states that use as “free hosting for running an online business,” e-commerce and commercial SaaS are not allowed. Donation buttons are tolerated. I could not confirm anything explicit about ads.

    Cloudflare | In the terms I read, I found no restriction on commercial use or ads on the free plan (this means nothing is stated, not that it is explicitly allowed).

    Netlify | I found no restriction on commercial use or ads in the terms of use or the agreement. However, it states that free allowances can change or end, and service can be suspended without notice.

    Firebase Hosting | The Firebase terms page I retrieved had no restriction on commercial use or ads (I did not read the full body of the terms).

  “I could not find it” does not mean “you may put ads.” When in doubt, asking the provider is the safe way.

## Free tiers

    Service | What the official pages say

    Cloudflare (Pages / Workers static assets) | Requests for static files are “free and unlimited.” Builds: 500 a month (Pages). Requests that run a Worker: 100,000 a day (Workers Free). I could not confirm a bandwidth limit.

    Netlify (Free) | A hard limit of 300 credits a month. When used up, all projects stop. Bandwidth costs 20 credits per GB, a production deploy 15 credits each. Previews cost 0.

    Vercel (Hobby) | Up to 100 GB transfer, 1 million CDN requests and 1 million function invocations. Beyond that you are usually locked out for about 30 days. Up to 100 deployments a day.

    GitHub Pages | Bandwidth is a soft limit of 100 GB a month. Builds are a soft limit of 10 an hour.

    Firebase Hosting (free) | 10 GB storage, 10 GB transfer a month. When reached, the site is disabled until next month (it comes back right away if you switch to a paid plan).

## Number and size of files

    Service | What the official pages say

    Cloudflare | 20,000 files per site, 25 MiB per file.

    Vercel (Hobby) | For deploys from the command line: 15,000 source files and 100 MB in total. No limit on output files (it slows down beyond 100,000). I could not confirm a maximum for one file.

    GitHub Pages | A published site can be up to 1 GB. I could not confirm a per-file limit.

    Firebase Hosting | Up to 2 GB per file. I could not confirm a file-count limit.

    Netlify | I could not find an official page stating per-deploy file count or size limits.

## Redirect and header configuration

- Cloudflare: _redirects (2,000 static + 100 dynamic) and _headers (100 rules). Redirects are processed before headers. Neither applies to responses produced by a Worker.

- Netlify: _redirects and _headers, or netlify.toml. Headers are not added to proxy or function responses.

- Vercel: vercel.json. Up to 2,048 rules per deployment in total for redirects, rewrites and headers. I did not find _redirects-style files on the pages I read.

- Firebase: firebase.json. The first matching rule is used.

- GitHub Pages: Nothing on the pages I read, so I could not confirm.

## Preview deploys and speed from Japan

- Previews: Cloudflare, Netlify and Vercel create them automatically for each pull request or branch. Firebase has “preview channels,” which expire in 7 days by default and 30 days at most. I could not confirm this for GitHub Pages.

- Speed from Japan: Only Cloudflare (locations in Tokyo, Osaka, Fukuoka and Naha) and Vercel (Tokyo and Osaka as compute regions; the default for functions is US East) had an official statement about Japan. No latency numbers were written anywhere.

## What I learned

> “Free to host” and “free to earn” are different things.

- If you plan to show ads, read the terms first. If the terms stop you after you have put the site there, you have to move.

- They stop differently. When you reach a limit, some sites stop (Netlify, Firebase) and some only have soft limits (GitHub Pages).

- Config files differ by service. Even for the same _redirects, the number you can write and the scope it affects differ. That is where moving costs effort.

## What I could not confirm

- Cloudflare: bandwidth limits and billing for static assets, how custom-domain certificates are issued, an official yes or no on ads for the free plan.

- Netlify: per-deploy file count and size limits, an explicit statement on free custom domains, anything about speed in Japan.

- Vercel: the maximum size of one file in Hobby static output.

- GitHub Pages: an explicit yes or no on ads, header configuration, previews, speed in Japan.

- Firebase: file-count limit, custom-domain cost, the body of the terms (commercial use and ads).

- A speed comparison (I did not do one, because there are no official numbers).

## Sources (all checked on October 8, 2026)

- Cloudflare: Pages limits (https://developers.cloudflare.com/pages/platform/limits/)

- Cloudflare: static assets billing and limitations (https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)

- Cloudflare: Pages redirects (https://developers.cloudflare.com/pages/configuration/redirects/)

- Cloudflare: Pages headers (https://developers.cloudflare.com/pages/configuration/headers/)

- Cloudflare: network (https://www.cloudflare.com/network/)

- Netlify: how credits work (https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/)

- Netlify: terms of use (https://www.netlify.com/legal/terms-of-use/)

- Vercel: Hobby plan (https://vercel.com/docs/plans/hobby)

- Vercel: fair use guidelines (https://vercel.com/docs/limits/fair-use-guidelines)

- Vercel: limits (https://vercel.com/docs/limits)

- GitHub Pages: limits (https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)

- Firebase Hosting: usage quotas and pricing (https://firebase.google.com/docs/hosting/usage-quotas-pricing)

  I read some of the official pages through summaries (the numbers have not been checked against the originals character by character). Please check the Netlify credits and Vercel limits against the original text in particular.

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/hosting-compare/).

  More in English

- All English pages (https://koshinstudio.com/en/)
