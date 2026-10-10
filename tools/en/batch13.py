pairs.append(make('anago',
 'The conger eel was too big: finding why a merge puzzle’s last piece was out of reach',
 'I could never reach the final piece of my falling-block puzzle. Instead of tweaking by feel, I collected statistics from hundreds of auto-played games and found the real cause: everything was too large for the tub.',
 'The conger eel was too big',
 'Development log of Sushi Stack / September 2026',
 '''  <p class="note">Added on October 8, 2026. The numbers in this article are from <strong>the September 8 version</strong>. On September 10 I changed the sizes and the falling pieces once more (see “Afterward” at the bottom).</p>
  <p>After finishing <a href="/works/sushitsumu/" hreflang="ja" lang="ja">Sushi Stack</a>, one thing bothered me: <strong>I could never reach the last piece, the golden sushi tub.</strong></p>
  <p>However many times I played, I rarely even saw the spiny lobster before it. My feeling was “the conger eel is too big.” But if you tweak sizes by feel, something else usually breaks. I decided to measure first.</p>

  <h2 class="rv" id="s1">Building a way to measure</h2>
  <p>The game is a single HTML file, and time is driven by <code>requestAnimationFrame</code>. As it is, a game takes minutes, so <strong>I swapped in my own clock</strong>. I intercept <code>requestAnimationFrame</code> and <code>setTimeout</code> and advance them at any speed I like. If I also empty the drawing code, <strong>a game finishes in about 2 seconds</strong>.</p>
  <p>After that I wrote a bot of modest skill — merge first, and wait until the pile settles before placing — and let it run.</p>

  <h2 class="rv" id="s2">What a hundred games showed</h2>
  <p>First, a hundred games as it was.</p>
  <pre><code>score   min 12,337 / median 21,664 / max 44,622
best piece reached   otoro 43 games  anago 52  spiny lobster 4  golden tub 0</code></pre>
  <p>Zero for the golden tub. So where does it get stuck? Lining up <strong>the yield for moving up one tier</strong> (the share of times two of the lower piece became one of the next) made it clear.</p>
  <div class="scroll rv"><table>
    <tr><th>Merge</th><th class="n">Yield</th></tr>
    <tr><td>Salmon → tuna</td><td class="n">94.0%</td></tr>
    <tr><td>Tuna → ikura gunkan</td><td class="n">91.9%</td></tr>
    <tr><td>Ikura gunkan → uni gunkan</td><td class="n">86.9%</td></tr>
    <tr><td>Uni gunkan → otoro</td><td class="n">71.4%</td></tr>
    <tr><td>Otoro → anago</td><td class="n">55.2%</td></tr>
    <tr><td><strong>Anago → spiny lobster</strong></td><td class="n"><strong>13.1%</strong></td></tr>
    <tr><td>Spiny lobster → golden tub</td><td class="n">0.0%</td></tr>
  </table></div>
  <p>It falls gently and then there is a cliff at the anago. Of the 61 anago made, <strong>53 (87%) were still sitting on the final board</strong>. Only 8 made it to a merge.</p>

  <h2 class="rv" id="s3">The conger eel really was off</h2>
  <p>Lining up the dimensions made it obvious at a glance. The inner width of the tub is 336.</p>
  <div class="scroll rv"><table>
    <tr><th>Piece</th><th class="n">Width</th><th class="n">Height</th><th class="n">Width / inner</th><th class="n">Growth from previous</th></tr>
    <tr><td>Otoro</td><td class="n">149</td><td class="n">83</td><td class="n">44%</td><td class="n">×1.34</td></tr>
    <tr><td><strong>Anago</strong></td><td class="n"><strong>247</strong></td><td class="n">71</td><td class="n"><strong>74%</strong></td><td class="n"><strong>×1.66</strong></td></tr>
    <tr><td>Spiny lobster</td><td class="n">230</td><td class="n">107</td><td class="n">68%</td><td class="n">×0.93</td></tr>
    <tr><td>Golden tub</td><td class="n">210</td><td class="n">210</td><td class="n">62%</td><td class="n">×0.91</td></tr>
  </table></div>
  <p><strong>The anago was the widest piece in the game.</strong> Wider than the spiny lobster after it, and wider than the final golden tub. Its width growth is 1.66 where other tiers are 1.0 to 1.34.</p>
  <p>As a result, when one anago lies down, the gap left beside it is <strong>336 − 247 = 89</strong>. Only up to salmon (width 85) fits there; neither uni nor otoro. <strong>The anago spanned the tub and blocked the road ahead.</strong></p>
  <p>By the way, the ladder of areas was clean. Every tier was a constant “0.70 to 0.71 times the two pieces below.” Only the order of widths was broken.</p>

  <h2 class="rv" id="s4">Fix it, but measure first</h2>
  <p>I made only the width 4/5 (247 → 198) and ran another hundred games.</p>
  <div class="scroll rv"><table>
    <tr><th></th><th class="n">Median</th><th class="n">Max</th><th class="n">Anago</th><th class="n">Spiny lobster</th><th class="n">Anago → lobster yield</th></tr>
    <tr><td>247 × 71 (original)</td><td class="n">21,664</td><td class="n">44,622</td><td class="n">61</td><td class="n">4</td><td class="n">13.1%</td></tr>
    <tr><td><strong>198 × 71</strong></td><td class="n"><strong>24,858</strong></td><td class="n"><strong>47,392</strong></td><td class="n">79</td><td class="n"><strong>12</strong></td><td class="n"><strong>30.4%</strong></td></tr>
    <tr><td>205 × 85 (keep the area)</td><td class="n">25,149</td><td class="n">36,350</td><td class="n">33</td><td class="n">1</td><td class="n">6.1%</td></tr>
  </table></div>
  <p>The third row was interesting. <strong>The version that got thinner while keeping its area made the late game not move at all.</strong> What mattered was not “thin” itself but that the anago no longer spanned the tub and big pieces could sit beside it.</p>

  <h2 class="rv" id="s5">Still, the golden tub is out of reach</h2>
  <p>Spiny lobsters appeared three times as often. But the golden tub was still zero. Here another wall showed up.</p>
  <p>The falling pieces were only three kinds: shari, tamago and shrimp. After subtracting gari, each drop is only <strong>2.217 shari-equivalents</strong>. Meanwhile:</p>
  <div class="scroll rv"><table>
    <tr><th>To make</th><th class="n">In shari</th><th class="n">Drops needed with zero waste</th></tr>
    <tr><td>1 anago</td><td class="n">256</td><td class="n">115</td></tr>
    <tr><td>1 spiny lobster</td><td class="n">512</td><td class="n">231</td></tr>
    <tr><td><strong>1 golden tub</strong></td><td class="n"><strong>1,024</strong></td><td class="n"><strong>462</strong></td></tr>
  </table></div>
  <p>The measured number of drops was a median of 280 and 426 at most. <strong>Even with zero waste, there were not enough moves.</strong> 231 drops for a spiny lobster is right at the border, which matches the measured 12 in a hundred.</p>

  <h2 class="rv" id="s6">The real cause: the sushi was too big</h2>
  <p>In Suika Game some people make “twin watermelons.” That works because the last fruit is small enough compared with the box. What about mine?</p>
  <pre><code>With one golden tub in place, I must make a second spiny lobster
  golden tub 210 + lobster 107 + lobster 107 = 424px  >  usable height 302px
  side by side: lobster 230 × 2 = 460px               >  inner width 336px</code></pre>
  <p>It fits neither vertically nor horizontally. This is not a matter of luck or skill: <strong>there is no gap for it to fit in</strong>.</p>
  <p>So I tried scaling all the pieces by <strong>0.8 across the board</strong>. The diameter of the golden tub goes from 210 to 168, exactly half of the tub’s inner width of 336.</p>
  <div class="scroll rv"><table>
    <tr><th></th><th class="n">Median</th><th class="n">Max</th><th class="n">Reach golden tub</th><th class="n">Reach lobster</th><th class="n">One game</th></tr>
    <tr><td>Original size</td><td class="n">24,858</td><td class="n">47,392</td><td class="n">0 / 100 games</td><td class="n">12%</td><td class="n">3.7 min</td></tr>
    <tr><td><strong>0.8x</strong></td><td class="n"><strong>58,741</strong></td><td class="n"><strong>103,630</strong></td><td class="n"><strong>7%</strong></td><td class="n"><strong>65%</strong></td><td class="n">7.7 min</td></tr>
  </table></div>
  <p>At last the road was open. The spiny lobster is reached nearly every game, and the golden tub appears once in a dozen or so. <strong>The twin never appeared in sixty games</strong>, which is not a failure; it is probably the right state. It became a legend within reach.</p>

  <h2 class="rv" id="s7">I redrew the ranks too</h2>
  <p>Scores came out 2.4 times higher, so I had to redo all the rank thresholds. For the top rank, matching the fact that games reaching the golden tub all scored 86,000 or more, I set <strong>85,000</strong>. The number is the same as before but its meaning changed. Before, it was a decoration nobody could reach; now it is “<strong>make the golden tub and you are a legend</strong>.”</p>

  <h2 class="rv" id="s8">I measured again after release</h2>
  <p>With the fixed version, using the same contents as what is published, I ran <strong>three hundred games</strong> again. The shape I saw at 100 games continues.</p>
  <div class="scroll rv"><table>
    <tr><th>Measured</th><th class="n">300 games</th></tr>
    <tr><td>Median score</td><td class="n">59,305</td></tr>
    <tr><td>Highest score</td><td class="n">163,426</td></tr>
    <tr><td>Reached grilled anago</td><td class="n">99%</td></tr>
    <tr><td>Reached spiny lobster</td><td class="n">73%</td></tr>
    <tr><td>Reached golden sushi tub</td><td class="n">10% (31 games)</td></tr>
    <tr><td>Two golden tubs in one game</td><td class="n">0</td></tr>
    <tr><td>Length of one game (median)</td><td class="n">7.7 min</td></tr>
    <tr><td>Pieces placed (median)</td><td class="n">589</td></tr>
    <tr><td>Longest chain</td><td class="n">10</td></tr>
  </table></div>
  <p class="note">The bot is <code>tools/sim/bot.js</code>. It merges first and waits for the pile to settle before placing. A human can play better or worse, but it was enough to compare before and after with the same yardstick.</p>

  <h2 class="rv" id="s9">What I learned</h2>
  <blockquote>My feeling was right. But the cause was not where I thought.</blockquote>
  <p>The feeling that “the anago is too big” was correct. But thinning only the anago did not move the late game, and the real cause was <strong>that all of the sushi was too big for the tub</strong>. If I had suspected and fixed one place, I probably would never have gotten there.</p>
  <p>Collecting statistics from three hundred games took about ten minutes in total. It was much faster and more reliable than tweaking by feel three times and checking.</p>

  <h2 class="rv" id="s10">Afterward (September 10): I changed it again</h2>
  <p>After this article, I submitted the game to CrazyGames and was rejected (details in <a href="/en/notes/crazygames/" hreflang="en" lang="en">another article</a>). What I reconsidered was that tension in the tub did not happen even once in the few minutes of review. The commit says: measured with auto-play, one game is a median of 594 moves, 7.5 minutes. <strong>30 minutes for a human.</strong> The tub never fills, and dangerous moments never come.</p>
  <p>I left each tier’s dimensions and area ratios alone and changed only places where I could fix without losing the feeling of “growing as you merge.” I chose them by measuring with auto-play.</p>
  <ul>
    <li><strong>Falling pieces from 3 kinds to 5.</strong> I added salmon and tuna to shari, tamago and shrimp (weights 1:1:2:3:2). More piles up per move and the median went from 594 to 279 moves. The rate of reaching higher tiers also went up.</li>
    <li><strong>The shape of the tub.</strong> Rim from 320 to 250, height from 308 to 378. The play area went from 45% to 62% of the screen.</li>
    <li><strong>Spiny lobster and golden tub scaled another 0.89x.</strong> The area ratio from anago to spiny lobster alone had jumped to 1.76 and is now 1.40, in line. The leftover when two golden tubs sit side by side went from 0 px to 36 px, and a <strong>double golden tub</strong> (golden tubs merging) became possible in real play. The logic had been there before but never happened once in 300 games.</li>
  </ul>
  <p>With a game half as long, scores also fell by about 20% (auto-play median from 59,305 to 46,529). I re-took the rank thresholds from quantiles of 60 games and restored the same distribution as before (apprentice 7%, journeyman 28%, head chef 40%, master 17%, legend 8%). I also raised the double-golden-tub reward from 8,000 to 25,000, because merges up to making one golden tub already give about 34,000 points.</p>
  <p>The moves needed for a double golden tub are 275 even with zero waste. Auto-play makes one golden tub in about 2.0 times the ideal, so auto-play cannot reach it (0 in 40 games). It is set up so that <strong>only a person who tidies the pile and plays well can reach it</strong>.</p>
  <p class="note">The numbers in the “0.8x” table above (median 58,741, 7.7 minutes a game and so on) are from the September 8 version. They differ from the current numbers.</p>

  <div class="rule" style="margin:40px 0 22px"></div>
  <p class="eyebrow">Related</p>
  <ul class="plain">
    <li><a href="/works/sushitsumu/" hreflang="ja" lang="ja">Sushi Stack (work page, Japanese)</a></li>
  </ul>
  <p style="margin-top:32px"><a class="btn" data-play="sushitsumu" href="/play/sushitsumu/">Play</a></p>
'''))

pairs.append(make('typo-catalog',
 'A typo born once multiplied across shops: the “30th SEREBRATION” incident',
 'A misspelled product was created once, then reused as an “existing product” for every new shop article. How I fixed 13 articles, added exact-match prevention for short headings, and verified the limits of the safety net.',
 'The SEREBRATION typo',
 'Development log of Torecadash / October 2026',
 '''  <p>In my iOS app Torecadash, a user reported: “this article duplicates another one, and the product name is odd.” When I looked, <strong>a misspelled product created just once was being reused every time an article from a shop arrived, and it kept multiplying</strong>. The cause, the fix, and the limits of the fix are written from my commit record.</p>
  <p class="note">This is a development log of the app.</p>

  <h2 class="rv" id="s1">What was reported</h2>
  <p>Articles for the Pokémon Card product “30th CELEBRATION” were appearing at several shops under the product name <strong>“30th SEREBRATION”</strong> (a misspelling of CELEBRATION). They also duplicated the articles with the correct name for the same product.</p>

  <h2 class="rv" id="s2">Root cause: a short heading did not match the official name</h2>
  <p>Summaries posted by roundup sites have <strong>short headings</strong> like “‘30th CELEBRATION’.” The official name in the app’s catalog is “Expansion Pack ‘30th CELEBRATION’.” The short heading is shorter than the official name, so a one-direction check of “does the article title contain the official name” did not match.</p>
  <p>When there was no match, it went to AI matching. Along that path, <strong>just once</strong>, a misspelled product “30th SEREBRATION” was created. My commit guesses it came from a mistake when converting another spelling in the catalog (“30th セレブレーション” in katakana) to the Latin alphabet.</p>
  <p>The real trouble came next. Once a misspelled product is created, <strong>it is reused repeatedly as an “existing product.”</strong> Each time a new article arrived from a shop, the same typo and the same duplicate were mass-produced.</p>

  <h2 class="rv" id="s3">First, fix the data</h2>
  <p>I checked all shops. At three shops including Bic Camera, Sanyodo Shoten and Game Plaza, it duplicated an article with the correct name, so I hid one of each. The other 10 articles only needed their product reassigned. <strong>13 articles in total.</strong> I deleted the misspelled product.</p>
  <p>I left one thing alone on purpose. The existing tool for merging products judged “SEREBRATION” and “CELEBRATION” as different products and refused. That gate is intentionally strict, so <strong>I did not loosen it</strong>. I fixed these by hand, one by one.</p>

  <h2 class="rv" id="s4">The real prevention: pick up short headings by “exact match”</h2>
  <p>Fixing the data alone would let it happen again. So I fixed the matching with the official catalog. I strip one <strong>generic form word</strong> (such as “Expansion Pack”) from the front of the official name, and treat it as the same product only when what remains <strong>exactly matches</strong> the article title.</p>
  <p>I chose “exact match” instead of “contains” so as <strong>not to pick up more specific, different products</strong> such as “30th CELEBRATION Card Set X.” Now it matches the official catalog correctly from the start, and never reaches the AI matching path where the typo was born. The results I confirmed:</p>
  <ul>
    <li>“30th CELEBRATION” matches the official product correctly.</li>
    <li>The misspelled “30th SEREBRATION” does not match (it is not wrongly treated as official).</li>
    <li>Existing exact matches, other genres and unrelated set names behave as before.</li>
  </ul>

  <h2 class="rv" id="s5">Safety net: an edit-distance check, and its limits</h2>
  <p>As a precaution, I also added a check at the point just before a product is created: “a candidate with a small edit distance from the official catalog is strongly suspected to be a typo, so reject it.” But this check alone <strong>cannot catch “30th SEREBRATION” against “Expansion Pack ‘30th CELEBRATION’.”</strong> The difference in length is too large, so the edit distance is far (I confirmed this).</p>
  <p>So the safety net does not work for this case. What works is the main fix above. I kept the safety net to catch <strong>other typos of the same length</strong> (for example, Weiss Schwarz names missing a “/”). I also built a read-only audit that finds catalog entries suspected of typos. At the time of the commit it found 21 suspects of the same shape.</p>

  <h2 class="rv" id="s6">What I learned</h2>
  <blockquote>A mistake born once becomes “existing,” and multiplies.</blockquote>
  <ul>
    <li><strong>Wrong data multiplies by itself.</strong> What was created becomes the thing reused next time. Fixing the data is not enough; you have to fix <strong>the path by which it is born</strong>.</li>
    <li><strong>“Exact match” over “contains.”</strong> Picking up widely drags in other products.</li>
    <li><strong>Check the limits of a safety net and write them down.</strong> Instead of assuming “this check prevents it,” I checked first that it does not work for this typo.</li>
    <li><strong>Do not loosen a strict gate.</strong> What the merge tool rejected was the correct behavior.</li>
  </ul>
  <p class="note">This article is written from my commit record (September 28, 2026). How the typo was born is the commit’s guess.</p>
'''))

pairs.append(make('torecadash-9set',
 'The “9-pack set” was nine different products: the same product that never matched',
 'Matching my app against roundup sites showed only 54% of lotteries displayed. Causes: a product mix-up, an asymmetry in how names were compared, and an article ID that blocked the next round. Coverage went to 91%.',
 'The nine-product set',
 'Development log of Torecadash / October 2026',
 '''  <p>My iOS app Torecadash collects lottery and first-come sale information for trading cards and notifies users. To check for gaps, I <strong>match and count</strong> listings on other roundup sites (Chusen Zukan, Pokechu) against the articles in my own app. When I measured on October 7, most gaps came from a small discrepancy: <strong>the same product that never matched</strong>. This is from my hand-over notes and commit record.</p>
  <p class="note">This is a development log of the app.</p>

  <h2 class="rv" id="s1">What I measured</h2>
  <p>With read-only access, I checked “are all lotteries introduced by the roundup sites shown in the app?”</p>
  <ul>
    <li>Chusen Zukan: of 90 open lotteries, <strong>49 (54%)</strong> were displayed in the app. 12 had an article but were hidden, and 29 were not in the feed.</li>
    <li>Pokechu: 18 of 21 (86%).</li>
    <li>X roundup posts: 606 posts in 72 hours. Only 9 linked to an article.</li>
  </ul>

  <h2 class="rv" id="s2">Of the 12 hidden, 7 were because the row was wrong</h2>
  <p>Looking at the 12 hidden, in 7 the roundup site’s row named <strong>a different product from the application page</strong>. Four shops of one chain said “energy card set,” and three others said “expansion pack.” The application page (the lottery form) and the shop’s X account showed it was actually a <strong>“card set, 9-pack set, 10,800 yen.”</strong></p>
  <p>The app’s “price gate” (which rejects items whose listing price does not match the product’s list price) was <strong>correctly rejecting</strong> them. What was wrong was not the gate but the product mix-up. I reassigned the products and restored them to visible.</p>

  <h2 class="rv" id="s3">What the “9-pack set” really was</h2>
  <p>This “9-pack set” is a card set of Pokémon Card 30th CELEBRATION, which is <strong>9 products, each a set of the starter trio from nine generations</strong>. The catalog had these 9 products registered correctly from the beginning. But each time a marketplace listing or X monitoring created a new article, a bug registered it as another product named after only one of the three, in several of the 9 products. For example, a product with only “Hinoarashi.”</p>

  <h2 class="rv" id="s4">The same product, never matching</h2>
  <p>The matching has a process that makes a “key” for comparing product names. It had a <strong>left-right asymmetry</strong>.</p>
  <ul>
    <li>On the other side, “card set <strong>9-pack</strong>” has the trailing “9-pack” dropped before comparing.</li>
    <li>On the catalog side, “card set <strong>9-kinds set</strong>” is not dropped.</li>
  </ul>
  <p>The same product <strong>never matched</strong>. As a result, the other side’s name was wrongly resolved to a different product such as “energy card set” or “expansion pack.” That was where the mix-up came from. I applied the same rule to both sides (drop “N packs,” “N kinds” and “set”), and also made names that carry a number specification not be settled to one by partial match. I confirmed that there are 0 key collisions across the whole catalog.</p>

  <h2 class="rv" id="s5">Another hole: the previous article blocked the next round</h2>
  <p>The main cause of “not in the feed” was elsewhere. The article ID was made from “roundup URL + shop + product,” and <strong>it did not include the lottery round</strong>. The expired article from the previous round stopped the new round’s article for the same shop and product from being created (“the same article ID already exists”). If the new round’s deadline is more than 1 day later than the previous one, it now creates an article with a different ID that adds the date.</p>

  <h2 class="rv" id="s6">Result</h2>
  <div class="scroll rv"><table>
    <tr><th>Coverage</th><th class="n">Before</th><th class="n">After</th></tr>
    <tr><td>Chusen Zukan (90 open)</td><td class="n">54% (49)</td><td class="n">91% (82)</td></tr>
    <tr><td>Pokechu</td><td class="n">86%</td><td class="n">90%</td></tr>
  </table></div>
  <p>The remainder are cases where the application page only says “various products” so the product cannot be identified, where the page has no clue to the shop name, and so on. They include ones I decided not to adopt for safety. The misses did not become zero.</p>

  <h2 class="rv" id="s7">What I learned</h2>
  <blockquote>A gate that rejected correctly and wrong data are different problems.</blockquote>
  <ul>
    <li><strong>Before doubting what was rejected, look at why it was rejected.</strong> The price gate worked correctly; what was wrong was the product mix-up.</li>
    <li><strong>The cause of “does not match” can be a left-right asymmetry in how you compare.</strong> The same product never matching was a mismatch of rules, not dirty data.</li>
    <li><strong>You do not see gaps unless you count coverage.</strong> Only when the number 54% came out did I know where to fix.</li>
  </ul>
  <p class="note">The numbers in this article come from my hand-over notes (§272, §281) and commit record (October 7, 2026).</p>
'''))
