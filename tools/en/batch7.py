pairs.append(make('fail-open',
 'It let things through when it could not check: how “fail-open” brought in resale items',
 'A price gate that “lets items pass when the list price cannot be confirmed” had a blind spot: the daily cap on web searches. How I told “did not know” apart from “could not look up,” and fixed it.',
 'Fail-open price gate',
 'Development log of Torecadash / October 2026',
 '''  <p>In my iOS app Torecadash, three in-app bug reports said “lots of resale prices are coming in from Amazon.” One was an obvious resale item at ¥79,800. The cause was <strong>a blind spot in a design I had put in on purpose: “if it cannot be confirmed, let it pass.”</strong> This is from my hand-over notes and the commit record (July 30, 2026).</p>
  <p class="note">This is a development log of the app.</p>

  <h2 class="rv" id="s1">The price gate, and the “let it pass” design</h2>
  <p>The app picks up listings from online shops (Rakuten, Yahoo! Shopping, Amazon and others) and shows them in a feed. There is a “price gate” that checks <strong>whether a listing’s price is reasonable against the product’s list price</strong>. It has an AI (with web search) look up the list price, and rejects extremely expensive resale items.</p>
  <p>The gate had a behavior: <strong>“if the list price could not be confirmed, let it pass without review.”</strong> That was intended. If you exclude products whose list price the AI genuinely does not know just because you cannot confirm it, you also erase genuine listings. This is so-called <strong>fail-open</strong> (open on failure, meaning let it pass).</p>

  <h2 class="rv" id="s2">The blind spot: hitting the search cap took the same path</h2>
  <p>The AI’s web search has a cap of 300 calls a day (a circuit breaker to prevent unexpected cost). But the gate <strong>did not distinguish the reason</strong> the list price could not be confirmed.</p>
  <ul>
    <li>The AI answered “I do not know the list price of this product.”</li>
    <li>The daily cap was reached, so <strong>the check itself could not be done</strong>.</li>
  </ul>
  <p>Both went down the same “price unknown → let it pass” path. The first is as intended. The second is just “the road was closed before looking,” yet <strong>the gate became wide open</strong>.</p>

  <h2 class="rv" id="s3">Why the hole did real damage</h2>
  <p>The hole surfaced because of a previous change (the one that widened Amazon’s scope). Widening the scope suddenly increased the number of products whose price had to be newly checked. As a result, the daily cap was reached often. While it was reached, the gate was open and resale items mixed in in large numbers.</p>
  <p>There was secondary damage too. A result of “list price unknown” was designed to be <strong>cached for 24 hours</strong> regardless of reason. So a product that once hit the cap stayed <strong>open for up to 24 hours even after the cap was released</strong>.</p>

  <h2 class="rv" id="s4">The fix: distinguish the reason</h2>
  <p>I created a dedicated marker (<code>QUOTA_EXCEEDED</code>) so the two could be told apart.</p>
  <div class="scroll rv"><table>
    <tr><th>Situation</th><th>What the gate does</th></tr>
    <tr><td>The AI genuinely did not know the list price (null)</td><td>Let it pass as before (still fail-open)</td></tr>
    <tr><td>The daily cap meant the check itself could not be done (QUOTA_EXCEEDED)</td><td><strong>Exclude</strong> (fail-close)</td></tr>
  </table></div>
  <p>The latter is not put into the 24-hour cache either. It tries to confirm again the next time it is called. This gate is shared by <strong>every feature that uses price review</strong>: Rakuten, Yahoo! Shopping, Amazon, AI listing discovery, first-come Rakuten Books and so on, so one fix reaches widely (the commit record says 18 functions were deployed).</p>
  <p>I hid the three reported items by hand. After that, the re-review batch that runs every 5 minutes is expected to pick up the same misses again.</p>
  <p><strong>What I have not verified:</strong> my notes say “check in the next session whether resale-price reports stopped after the cap reset.” There is no result for that in the record at the time of writing.</p>

  <h2 class="rv" id="s5">Is the same hole in other decisions?</h2>
  <p>In a later check (July 30, 2026), I looked at the other AI decisions such as deciding sales format and matching products. All of them are designed to fall to the safe side (exclude, or null) on failure, and <strong>I found no new fail-open hole</strong>.</p>

  <h2 class="rv" id="s6">What I learned</h2>
  <blockquote>“Could not confirm” comes in two kinds: did not know, and could not look.</blockquote>
  <ul>
    <li><strong>Before using a let-it-pass design, make clear the reason it is fine to let through.</strong> “Let it through because I do not know” and “let it through because I cannot look” are different things.</li>
    <li><strong>Do not cache the result of a failure regardless of its reason.</strong> I froze a temporary failure for 24 hours.</li>
    <li><strong>One change can turn a hole elsewhere into real damage.</strong> Widening Amazon’s scope brought the cap’s hole to the surface.</li>
  </ul>
  <p class="note">This article is written from my hand-over notes (session 182) and the commit record (July 30, 2026).</p>
'''))

pairs.append(make('blocked-page',
 'What I read as “fetched” was just a notice page: three days of zero products',
 'A scraper reported success for three days while returning zero products, because a cheap setting returned a 2,410-byte “enable JavaScript” page that I counted as a success. How I centralized the check.',
 'A notice page read as success',
 'Development log of Torecadash / October 2026',
 '''  <p>My iOS app Torecadash regularly visits the sales pages of online shops to collect lottery and first-come sale information. One day I found that fetching from Pokémon Center Online had been returning <strong>zero products for three days straight</strong>. There were no errors, because each fetch was judged “fetched.” What was happening is written from my commit record.</p>
  <p class="note">This is a development log of the app.</p>

  <h2 class="rv" id="s1">My “fetched” check was too lenient</h2>
  <p>Pages are fetched through an external service (Scrape.do). Fetch settings range from cheap to expensive, and the design is that <strong>if the cheap setting fails, it escalates to a stronger one</strong> (the same mechanism as in <a href="/notes/scrape-cost/" hreflang="ja" lang="ja">my article on scraping cost</a>, in Japanese).</p>
  <p>The problem was the judgment of “did it fetch.” When the Pokémon Center page was fetched with the cheap setting, what came back was <strong>a 2,410-byte page saying “Please enable JavaScript”</strong>. It was not a product list, just a notice. But I <strong>read this as “fetched” and treated it as a success</strong>. If it is a success, there is no escalation to the stronger setting either.</p>
  <p>So from September 4, for three days, fetches kept “succeeding” while products stayed at zero.</p>

  <h2 class="rv" id="s2">The fix</h2>
  <ul>
    <li><strong>Gather the “fetched” check in one place.</strong> The check had been scattered over several places. I made one function that looks at whether a page is a blocked page (<code>scrapeDoResultLooksBlocked</code>) and made everything use it.</li>
    <li><strong>Remember the setting that worked.</strong> It remembers a setting that succeeded once and tries from there next time. This cut the credits used per fetch from 36 to 25.</li>
  </ul>

  <h2 class="rv" id="s3">Another bit of dirt found the same day</h2>
  <p>The same inspection found another problem. The logic that decides a mismatch between alternative spellings of a product name was <strong>written separately at the entrance of matching and in the cleanup side</strong>. Only the cleanup side lacked a check for “the product forms differ.” As a result, an alternative spelling of a trial deck stayed attached to a booster pack product, <strong>and kept triggering wrong matches every day</strong>. I made the check a shared function and removed 46 entries across 27 products.</p>
  <p>I also resolved the “no document to update” error (64 in 7 days). Now products are re-read when their cache is old, and articles that have disappeared are skipped so the remaining dedupe processing continues.</p>

  <h2 class="rv" id="s4">What I learned</h2>
  <blockquote>“Success” and “the contents were fetched” are different things.</blockquote>
  <ul>
    <li><strong>Judge success by the contents.</strong> That the communication went through and that what you wanted was fetched are different. If “zero items fetched” continues, that itself must be watched as an anomaly.</li>
    <li><strong>Keep a judgment in one place.</strong> If the same judgment exists in two places, one of them goes stale, like the matching entrance and the cleanup.</li>
    <li><strong>No errors is not evidence that things are going well.</strong></li>
  </ul>
  <p class="note">This article is written from my commit record (September 7, 2026). How I noticed the three days of zero is not written in the commit.</p>
'''))
