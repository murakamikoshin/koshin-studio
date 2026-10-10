pairs.append(make('deploy-gotchas',
 'Works on my machine, breaks when deployed: four incidents shipping a static site to Cloudflare Pages',
 'Stale cache, breadcrumbs that multiplied on every build, a symlink pointing into my own environment, and images that existed only locally. Four deploy incidents, each found only after I added a check.',
 'Four deploy incidents',
 'Development log of Koshin Studio / October 2026',
 '''  <p>This site is assembled from HTML and deployed to Cloudflare Pages. In a single day in September, four incidents of the “works on my machine, breaks when deployed” kind followed one another. This is written in order, from my commit record.</p>

  <h2 class="rv" id="s1">1. I fixed it, but the old version kept running</h2>
  <p>I fixed how the logo bursts, but returning visitors still saw the old motion. The cause was that the <strong>file names of <code>style.css</code> and <code>motion.js</code> did not change</strong>. A browser that had loaded them once held them for a day. My own screen was always fresh after a deploy, so I did not notice.</p>
  <p>The fix is to append a mark made from the file’s contents (the first 8 hex digits of its sha1) to the name, like <code>style.css?v=19008d13</code>. When the contents change, it is fetched as a different file. I added the same mark to the font. When I rebuilt the font with more characters and a browser held the old one, characters did not render (tofu boxes).</p>
  <p>Since names now change, I extended the cache lifetime from 1 day to <strong>30 days</strong>. I checked that rebuilding does not add marks, and that the same contents give the same mark.</p>

  <h2 class="rv" id="s2">2. Contents multiplied every time I rebuilt</h2>
  <p>On the Sushi Stack page, the breadcrumb list had grown to <strong>14 items</strong>. The build of this site works by rewriting finished HTML. Before inserting, it “removes” the previous insertion. If <strong>the removing side does not match</strong>, things pile up on every build.</p>
  <ul>
    <li>Breadcrumbs: the removing regular expression only looked for <code>class="crumbs"</code> and did not match the real element, which had an <code>aria-label</code>.</li>
    <li>RSS <code>link</code>: there was no removing side at all, so it was added every time.</li>
  </ul>
  <p>I made a machine find incidents of the same shape. The main check is to <strong>build twice and report any page that differs by even one character</strong>. It also checks that the header band, footer, body, breadcrumbs and headings are not duplicated. Right after adding it, the RSS case was caught.</p>

  <h2 class="rv" id="s3">3. I had committed a symlink that points into my own environment</h2>
  <p><code>tools/node_modules</code> was <strong>a symbolic link pointing inside this environment</strong>. Once it was in git, other machines had no target for it, and counting files for the deploy (wrangler) stopped. It actually stopped. I removed it from tracking, and added a check that reports any symlink among tracked files.</p>

  <h2 class="rv" id="s4">4. It worked only on my machine</h2>
  <p>My machine has images that are not in git, and leftovers from earlier builds. Because of those, <strong>things work only locally and give a 404 once deployed</strong>. The favicon of the play pages was exactly that.</p>
  <p>So I added a check that copies only the committed contents to another place, rebuilds there, and loads every page. Files I decided not to ship (those listed in <code>.assetsignore</code>) are dropped from the copy in the same way. In that run, 8 files were dropped and none was missing on the 12 pages.</p>

  <h2 class="rv" id="s5">What I learned</h2>
  <blockquote>The least trustworthy thing is my own machine.</blockquote>
  <ul>
    <li><strong>A file whose name does not change never delivers its new contents.</strong> Put a mark of the contents in the name.</li>
    <li><strong>Rebuild accidents are found by “do it twice, is it the same?”</strong> The first result always looks clean.</li>
    <li><strong>What is on your machine and what you ship are different.</strong> Check from a fresh clone.</li>
  </ul>
  <p>I did not notice any of the four myself. <strong>They were found only after I added checks.</strong> Walking through the pages did not reveal them.</p>
  <p class="note">This article is written from my commit record (September 8, 2026).</p>
'''))
