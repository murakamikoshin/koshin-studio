# Works on my machine, breaks when deployed: four incidents shipping a static site to Cloudflare Pages

> Stale cache, breadcrumbs that multiplied each build, a symlink into my own environment, and local-only images: four deploy incidents on Cloudflare Pages.

- URL: https://koshinstudio.com/en/notes/deploy-gotchas/
- Original (Japanese): https://koshinstudio.com/notes/deploy-gotchas/
- Published: 2026-10-09
- Author: Koshin (https://koshinstudio.com/en/about/)
- Site: Koshin Studio

  日本語版 (https://koshinstudio.com/notes/deploy-gotchas/)

Development log of Koshin Studio / October 2026

  This site is assembled from HTML and deployed to Cloudflare Pages. In a single day in September, four incidents of the “works on my machine, breaks when deployed” kind followed one another. This is written in order, from my commit record.

## 1. I fixed it, but the old version kept running

  I fixed how the logo bursts, but returning visitors still saw the old motion. The cause was that the file names of style.css and motion.js did not change. A browser that had loaded them once held them for a day. My own screen was always fresh after a deploy, so I did not notice.

  The fix is to append a mark made from the file’s contents (the first 8 hex digits of its sha1) to the name, like style.css?v=19008d13. When the contents change, it is fetched as a different file. I added the same mark to the font. When I rebuilt the font with more characters and a browser held the old one, characters did not render (tofu boxes).

  Since names now change, I extended the cache lifetime from 1 day to 30 days. I checked that rebuilding does not add marks, and that the same contents give the same mark.

## 2. Contents multiplied every time I rebuilt

  On the Sushi Stack page, the breadcrumb list had grown to 14 items. The build of this site works by rewriting finished HTML. Before inserting, it “removes” the previous insertion. If the removing side does not match, things pile up on every build.

- Breadcrumbs: the removing regular expression only looked for class="crumbs" and did not match the real element, which had an aria-label.

- RSS link: there was no removing side at all, so it was added every time.

  I made a machine find incidents of the same shape. The main check is to build twice and report any page that differs by even one character. It also checks that the header band, footer, body, breadcrumbs and headings are not duplicated. Right after adding it, the RSS case was caught.

## 3. I had committed a symlink that points into my own environment

  tools/node_modules was a symbolic link pointing inside this environment. Once it was in git, other machines had no target for it, and counting files for the deploy (wrangler) stopped. It actually stopped. I removed it from tracking, and added a check that reports any symlink among tracked files.

## 4. It worked only on my machine

  My machine has images that are not in git, and leftovers from earlier builds. Because of those, things work only locally and give a 404 once deployed. The favicon of the play pages was exactly that.

  So I added a check that copies only the committed contents to another place, rebuilds there, and loads every page. Files I decided not to ship (those listed in .assetsignore) are dropped from the copy in the same way. In that run, 8 files were dropped and none was missing on the 12 pages.

## What I learned

> The least trustworthy thing is my own machine.

- A file whose name does not change never delivers its new contents. Put a mark of the contents in the name.

- Rebuild accidents are found by “do it twice, is it the same?” The first result always looks clean.

- What is on your machine and what you ship are different. Check from a fresh clone.

  I did not notice any of the four myself. They were found only after I added checks. Walking through the pages did not reveal them.

  This article is written from my commit record (September 8, 2026).

  This is the English version of the original Japanese article (https://koshinstudio.com/notes/deploy-gotchas/).

  More in English

- All English pages (https://koshinstudio.com/en/)
