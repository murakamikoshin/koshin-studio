pairs.append(make('torecadash-review',
 'Four things that stopped my iOS app before App Review: iPad screenshots, ITMS-91064, account deletion, reporting posts',
 'Before submitting an iOS app to App Review, four things stopped me: a request for iPad screenshots, ITMS-91064, account deletion (5.1.1(v)) and user-content reporting (1.2).',
 'Four things before App Review',
 'Development log of Torecadash / October 2026',
 '''  <p>When I tried to submit my iOS app Torecadash to App Review, <strong>I was stopped before submitting several times</strong>: things caught by Apple’s automated checks, things caught on the submission screen, and things I found by checking against the guidelines. From my commit record, here are four.</p>
  <p class="note">The result of review is not included in this article.</p>

  <h2 class="rv" id="s1">1. I was asked for iPad screenshots</h2>
  <p>When I tried to submit for review in App Store Connect, it stopped me with “You must upload a screenshot for 13-inch iPad displays.” The project settings had been iPhone and iPad (1,2) from the beginning.</p>
  <p>But there was no sign that I had built it with iPad in mind. Device checks and layout adjustments were all on iPhone. <strong>Submitting it unverified as “iPad supported” was a risk</strong>, so I changed it to iPhone only (1).</p>

  <h2 class="rv" id="s2">2. “Invalid Binary” in the automated check (ITMS-91064)</h2>
  <p>Build 877 was rejected by Apple’s automated review as an “invalid binary.” The cause was in the privacy manifest (<code>PrivacyInfo.xcprivacy</code>): <strong>I had written that it tracks (<code>NSPrivacyTracking=true</code>), but the list of tracking domains (<code>NSPrivacyTrackingDomains</code>) was empty</strong>. Apple’s check rejects this combination as a contradiction.</p>
  <p>The app shows AdMob ads (banner, native, app-open) personalized after ATT consent. It does track, so “true” was correct. What needed fixing was the empty domain list. But Google does not publish an official list of domains for AdMob. So I added widely used ad-serving domains (<code>googlesyndication.com</code>, <code>googleadservices.com</code>, <code>doubleclick.net</code>, <code>google.com</code>). I confirmed that a Release build passes.</p>

  <h2 class="rv" id="s3">3. Account deletion (Guideline 5.1.1(v))</h2>
  <p>An app that lets you create an account must let you delete it from within the app. The deletion also removes the user’s map posts (sighting reports) and their related data (owner, reports, flags, thanks). For people signed in with Apple, the app re-authenticates with Apple, then deletes on the server and revokes the token. I also matched the explanation in the settings screen and the privacy policy to the real behavior.</p>
  <p>In addition, <strong>deleting the account does not cancel a subscription</strong>. I added this to the settings text and to the deletion confirmation screen (as a review requirement).</p>

  <h2 class="rv" id="s4">4. User-generated posts (Guideline 1.2)</h2>
  <p>Map posts can be written freely by users. Until then there were only format checks such as length and coordinate range, and nothing that rejected by content. So I added a simple banned-word check to three free-text fields (shop name, product name, note). If it matches, the post is created but starts in a pending-review state.</p>
  <p>One more thing. Reports of posts would go unnoticed unless I myself remembered the admin screen’s URL and opened it. I added the count of items pending review to my daily operations notice so they are not overlooked.</p>

  <h2 class="rv" id="s5">What I learned</h2>
  <blockquote>Review is not something you fail after submitting; half of it is found by checking before you submit.</blockquote>
  <ul>
    <li>Of the four, two (iPad, ITMS-91064) were stopped by a machine. The other two (deletion, posts) I found by reading the guidelines and checking myself.</li>
    <li>“Do not submit what is unverified” was faster and safer than “support everything” (the iPad case).</li>
  </ul>
  <p class="note">This article is written from my commit record (September 16 to October 6, 2026).</p>
'''))

pairs.append(make('scrape-cost',
 'I re-measured a “nothing can be done” assumption and scraping cost dropped to one eighth',
 'I had believed two sites could not be fetched more often because of cost. Fetching the same page with three scraper settings showed rendering was a total waste: 3x faster, about 1/8 of the credits.',
 'Re-measuring scraping cost',
 'Development log of Torecadash / October 2026',
 '''  <p>My iOS app Torecadash regularly visits sales pages on online shops and collects lottery and first-come sale information. Pages are fetched through an external service (Scrape.do), and <strong>each fetch setting uses a different number of credits</strong>. For one site, I re-measured something I had accepted as “it cannot be helped,” and it became <strong>3 times faster using about one eighth of the credits</strong>. This is from my commit record.</p>
  <p class="note">This is a development log of the app. I do not write amounts of money, only numbers of credits.</p>

  <h2 class="rv" id="s1">The reason for “it cannot be helped” was cost</h2>
  <p>I thought the fetch interval for two sites, AEON Style Online and Amiami, could not be shortened. The reason was that fetching was expensive. In other words, <strong>a conclusion based on an old unit price</strong>. I decided to measure it again.</p>

  <h2 class="rv" id="s2">Fetching the same page with three settings</h2>
  <p>There are three levels of fetch settings: a plain fetch (1 credit), render in a browser and then fetch (render, 5 credits), and render through a stronger route (super + render, 25 credits). I fetched AEON’s list page with all three and compared contents, two pages three times each.</p>
  <div class="scroll rv"><table>
    <tr><th>Setting</th><th class="n">Credits</th><th class="n">Size (bytes)</th><th class="n">Products</th><th class="n">Prices</th></tr>
    <tr><td>Plain</td><td class="n">1</td><td class="n">649,734</td><td class="n">20</td><td class="n">25</td></tr>
    <tr><td>render</td><td class="n">5</td><td class="n">663,026</td><td class="n">20</td><td class="n">25</td></tr>
    <tr><td>super + render</td><td class="n">25</td><td class="n">669,510</td><td class="n">20</td><td class="n">25</td></tr>
  </table></div>
  <p>All three returned <strong>exactly the same products and prices</strong>. So rendering was <strong>a complete waste</strong>. I had been paying 25 credits for something that 1 credit was enough for.</p>

  <h2 class="rv" id="s3">The fix</h2>
  <ul>
    <li><strong>Try the cheap setting first.</strong> For AEON, fetch plainly first. Only when the “access is busy” page that appears at the start of a first-come sale comes back does it escalate automatically to a stronger setting.</li>
    <li><strong>Interval from 15 minutes to 5 minutes.</strong> Every 5 minutes is 288 times a day. For 2 pages, that is 576 credits. Before, it was about 4,600 credits a day (as stated in the commit). <strong>It is 3 times faster and uses about one eighth</strong>.</li>
    <li><strong>I applied the same measured result to Amiami.</strong> Removing rendering took one fetch from 5 credits to 1, saving about 1,200 credits a day.</li>
  </ul>
  <p>But for Amiami I <strong>kept the interval at 15 minutes</strong>. That day it had hit timeouts twice, and one run took 284 seconds. Fetching overall was getting crowded, so I decided not to touch it. What I measured was “is rendering needed,” not “is it safe to shorten the interval.”</p>

  <h2 class="rv" id="s4">What I learned</h2>
  <blockquote>When was the number behind “it cannot be helped” measured?</blockquote>
  <ul>
    <li><strong>Re-measure old conclusions.</strong> Unit prices, settings and how sites are built all change. “AEON cannot be helped” turned out not to be true when measured.</li>
    <li><strong>Strong settings tend to get added “just in case.”</strong> Whether they are needed can be seen by comparing results. If the results are the same, the cheaper one is enough.</li>
    <li><strong>When you fix one thing, check the other conditions.</strong> The same measurement fixed Amiami’s setting, but I left its interval because of a separate issue (timeouts).</li>
  </ul>
  <p class="note">The numbers in this article come from my commit record (September 7, 2026). “4,600” is as written in the commit and is a little off from the calculation of 25 credits × 2 pages × 96 runs (every 15 minutes) = 4,800.</p>
'''))

pairs.append(make('bulk-accident',
 'A bulk update hit “all articles”: count before you write, and break your tests to prove they work',
 'A bulk job meant for one source hit every article and wrongly restored 18 items. How I reverted them from status history, and how I proved the new tests work by removing rules one at a time.',
 'Bulk update accident',
 'Development log of Torecadash / October 2026',
 '''  <p>In my iOS app Torecadash, a new job that fixes article status in bulk <strong>hit every article, including ones I never meant to target</strong>, the first time I ran it. 18 items from other sites were wrongly restored to visible. This is how I fixed the accident, and how I checked that the test I built afterward to close the same hole <em>actually works</em>, from my hand-over notes.</p>
  <p class="note">This is a development log of the app.</p>

  <h2 class="rv" id="s1">What the job was for</h2>
  <p>The app has a “price gate” that checks whether a listing’s price is reasonable (I wrote about it in <a href="/en/notes/fail-open/" hreflang="en" lang="en">another article</a>). Among articles hidden by this gate only because of price, I added a job that restores <strong>those that were actually correct and had been hidden because of a product mix-up</strong>. The condition for restoring is “the correct product’s list price matches the listing price.”</p>

  <h2 class="rv" id="s2">The accident: it hit all articles</h2>
  <p>At first this job hit <strong>all articles without distinguishing the source</strong>. As a result, 18 articles from other sites (Amazon, Card Labo, Ministop and others) were restored to visible. They should have stayed hidden.</p>
  <p>There were two fixes.</p>
  <ul>
    <li><strong>Narrow the scope.</strong> I limited the job to articles from that source only (those whose site identifier starts with that source).</li>
    <li><strong>Put back what I had restored.</strong> I identified the 18 wrongly restored articles from the status history (<code>statusHistory</code>) and put them back to their original state (hidden, rejected by price).</li>
  </ul>
  <p>But there was something I could not get back for these 18. The job had <strong>overwritten the original list-price field with the listing price</strong>. The value stays as the listing price.</p>
  <p><strong>The cause was that I had not counted the target range before writing.</strong> My notes say so: “count the target range before a bulk write.”</p>

  <h2 class="rv" id="s3">Building tests to close the same hole</h2>
  <p>To make sure the problems found in that day’s inspection (wrong splitting of 9-pack sets, single cards slipping in, non-card products slipping in) never happen again, I built tests: 66 cases in <code>catalog-guards.test.js</code>, and all six test files together can be run in one procedure (<code>run-all.sh</code>).</p>
  <p>I also added warnings to my daily operations notice: when the miss rate of matching falls below the criteria (Chusen Zukan 80%, Pokechu 75%, X roundup 75%), when nothing has run for 30 hours, and when single cards or non-card names appear in the product list. The judgments are <strong>pure functions with no side effects</strong>, so once things are fixed, the warning disappears by itself on the next run.</p>

  <h2 class="rv" id="s4">Breaking it to check that the tests work</h2>
  <p>You cannot tell whether a test works just by writing it. A test that always passes may protect nothing. So I took a copy of the production code and <strong>removed its rules one at a time</strong> to confirm the tests fail.</p>
  <ul>
    <li>Remove one rule (break it).</li>
    <li>Run the tests.</li>
    <li>If they fail, the test is protecting that rule.</li>
  </ul>
  <p>With this procedure, <strong>I tried 6 kinds of modification, and the tests failed for all 6</strong> (all were detected).</p>
  <p>I also wrote down an operating rule: if I touch <code>functions/index.js</code>, I always run all the tests before deploying.</p>

  <h2 class="rv" id="s5">What I learned</h2>
  <blockquote>Count before a bulk write. Break the test to prove it.</blockquote>
  <ul>
    <li><strong>Before writing, count “how many it will hit.”</strong> If you run it without a preview, you notice the range was wrong only after it has finished writing.</li>
    <li><strong>Write in a form you can undo.</strong> I could restore the 18 because I could identify them from the history. The overwritten field, though, cannot be restored.</li>
    <li><strong>Prefer a test that fails when broken to a test that passes.</strong> Only after removing a rule and seeing it fail can I trust the test.</li>
  </ul>
  <p class="note">This article is written from my hand-over notes (§272) (October 7, 2026). The counts are as written in the notes.</p>
'''))
