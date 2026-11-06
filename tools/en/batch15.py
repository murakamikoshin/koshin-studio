# 2026-11-07：英語版の無かった 2 本（番付の検算、トレカ抽選アプリの比較）
pairs.append({**make('rank-verify-mismatch',
 'Sushi Stack scores stopped reaching the leaderboard: I changed the game’s numbers and forgot the server’s re-check (twice)',
 'Normal runs of my browser game stopped appearing on the online leaderboard. I had changed two game values (the golden-tub bonus 8,000 → 25,000, and 3 → 5 falling toppings) without updating the server that re-checks every score. A comment was not enough, so I added a test that compares both sides with the same seeds.',
 'Leaderboard re-check mismatch',
 'Development log of Sushi Stack / October 2026',
 '''  <p>My browser game <a href="/en/works/sushitsumu/" hreflang="en" lang="en">Sushi Stack</a> has an online leaderboard. At some point, <strong>runs that were played normally to the end stopped appearing on it</strong>. The screen said: “Your record did not add up, so it could not be posted.” The cause was that <strong>I had changed numbers in the game and not updated the same numbers in the server’s re-check</strong>. And after I thought I had fixed it, a second mismatch was still there.</p>
  <p class="note">This article is written from the work on October 23, 2026 and from the commits in the repository.</p>

  <h2 class="rv" id="s1">What the leaderboard re-check does</h2>
  <p>A leaderboard anyone can post to attracts fake scores. So the game sends <strong>the sequence of play (when, what was dropped, what merged) together with the score</strong>, and the server recounts the score and refuses it if it does not match the claim (<code>server/verify.js</code>).</p>
  <p>It does not replay the physics (how the toppings rolled). That does not fit in the free tier’s CPU time (10 ms per call). Instead it checks only that the books balance:</p>
  <ul>
    <li>Drop sequence: the toppings dropped match the sequence regenerated from the seed</li>
    <li>Inventory: nothing merged without two of the same topping existing</li>
    <li>Score: adding up the recorded events gives the claimed score</li>
    <li>Timing: drop intervals, chain parents and order contents are within the rules</li>
  </ul>
  <p>The weakness of this design: <strong>if even one number differs between the game and the server, honest records get rejected too</strong>.</p>

  <h2 class="rv" id="s2">Mismatch 1: the golden-tub bonus was still 8,000</h2>
  <p>On September 10 I tuned the length of a run and its rewards so that a “double golden tub” (making two golden tubs and merging them) became reachable. As part of that I <strong>raised the bonus for merging two golden tubs (<code>GOLDEN_BONUS</code>) from 8,000 to 25,000</strong> (commit <code>174bb2b</code>). The re-check still used 8,000.</p>
  <div class="scroll rv"><table>
    <thead><tr><th></th><th>Game (<code>index.html</code>)</th><th>Re-check (<code>verify.js</code>)</th></tr></thead>
    <tbody>
      <tr><td>Merging two golden tubs</td><td>+25,000</td><td>+8,000</td></tr>
    </tbody>
  </table></div>
  <p>Any run that merged two golden tubs got 25,000 from the game and 8,000 from the server, so it <strong>always disagreed</strong>. Only the very best runs, the ones that reached the double golden tub, were kept off the board. I fixed this (commit <code>2753293</code>) and deployed the leaderboard server.</p>

  <h2 class="rv" id="s3">Mismatch 2: the falling toppings were still 3 kinds</h2>
  <p>After the fix, I got a report: “A normal run that ended quickly was not posted either.” That run never reached a golden tub. The first mismatch could not explain it.</p>
  <p>Looking further, a commit on the same September 10 (<code>6ebabc3</code>) had <strong>increased the falling toppings from 3 kinds to 5</strong>: rice, egg and shrimp, plus salmon and tuna, drawn with weights (<code>ROLL_W = [1, 1, 2, 3, 2]</code>). The re-check still “drew from 3 kinds with equal probability.”</p>
  <div class="scroll rv"><table>
    <thead><tr><th></th><th>Game</th><th>Re-check</th></tr></thead>
    <tbody>
      <tr><td>Kinds of topping</td><td>5 (weighted)</td><td>3 (equal)</td></tr>
      <tr><td>How each drop is drawn</td><td>One random number, subtract weights until it runs out</td><td>One random number × 3, rounded down</td></tr>
    </tbody>
  </table></div>
  <p>The sequence regenerated from the seed drifts almost every time, and the first drifted drop is rejected as “sequence does not match.” In other words, <strong>since September 10, almost every normal run should have been rejected, golden tub or not</strong>. The golden-tub bug was a second mismatch hiding behind the main one.</p>
  <p>I cannot count how many players were affected. The server code had no counter for rejected records.</p>

  <h2 class="rv" id="s4">It happened despite a warning comment</h2>
  <p>From the very beginning, the top of <code>verify.js</code> said:</p>
  <blockquote><p>The constants here must equal the ones in index.html. Touching only one side rejects honest records, so always change both.</p></blockquote>
  <p>The warning was there. Still, in about 30 minutes on September 10 (14:05 to 14:34), I stacked five tuning commits on the game, and none of them touched the re-check. <strong>Writing it down does not keep it true.</strong> So I assumed it would be broken again and <strong>made a machine watch it</strong>.</p>
  <p><code>tools/verify-sync.mjs</code> checks two things:</p>
  <ul>
    <li>The scoring constants (merge points, golden-tub bonus, chain cap, drop interval and so on) and formulas (chain multiplier, order rewards) are the same in the game and the re-check</li>
    <li>Given the same 6 seeds, the game’s <code>rollItem()</code> and the re-check’s <code>makeRoller()</code> each produce 2,000 drops, and the sequences match</li>
  </ul>
  <p>Run against the code before the fix, it caught both the golden-tub bonus and the sequence mismatch (all 6 seeds). After the fix, all 12,000 drops matched. It also runs first in the combined check (<code>tools/check.mjs</code>).</p>
  <p class="note">A test that only compares constants would not have found the second mismatch (the weights). It was not a number that changed but <strong>the way of drawing itself</strong>. Only a test that actually runs both sides and compares their output caught it.</p>

  <h2 class="rv" id="s5">Confirming with the real game</h2>
  <p>A passing comparison does not prove that records the game really produces will pass. So I used my balance tool (it fast-forwards the game on a virtual clock and lets a bot play) and <strong>fed records written by the actual game into the re-check</strong>.</p>
  <div class="scroll rv"><table>
    <thead><tr><th>Mode</th><th>Runs</th><th>Re-check</th><th>Score range</th></tr></thead>
    <tbody>
      <tr><td>Free play</td><td>4</td><td>All 4 passed</td><td>36,368 – 54,836</td></tr>
      <tr><td>Orders</td><td>4</td><td>All 4 passed</td><td>81,857 – 166,105</td></tr>
    </tbody>
  </table></div>
  <p>All 8 matched, down to the recounted score. Then I deployed the leaderboard server again and <strong>played the live game myself to confirm the score was posted</strong>.</p>
  <p class="note">None of the 8 bot runs reached a double golden tub. The path through merging two golden tubs is confirmed only by comparing constants, not by a real record.</p>

  <h2 class="rv" id="s6">What I learned</h2>
  <ul>
    <li><strong>If the same number lives in two places, changing one breaks the other.</strong> A comment was not enough.</li>
    <li><strong>“Fixed” may mean only one cause is fixed.</strong> Before saying it was fixed, I should have checked that the reported symptom (not posted even without a golden tub) was explained by the cause I fixed.</li>
    <li><strong>I was not counting rejections.</strong> I do not know how many people hit this because the server rejected silently. Next, I want to count rejections by reason (sequence, score and so on) so a rise is noticed.</li>
    <li><strong>Turn comparison tests into tests that run both sides.</strong> Matching numbers could not catch a change in how values are drawn.</li>
  </ul>
  <p>Related: <a href="/en/notes/ranking-free-tier/" hreflang="en" lang="en">halving the leaderboard’s free-tier usage</a> and <a href="/en/notes/stopwatch-rank/" hreflang="en" lang="en">making the 10-second game’s ranking fair</a>.</p>
'''), 'date': '2026-11-07'})

pairs.append({**make('tcg-lottery-app-compare',
 'Japanese Pokémon card & TCG lottery apps compared: Toreca Dash, Toreget, NowPokeca, Pokeka Tracker and Toreca no Chizu',
 'Apps and sites that track trading-card lotteries, pre-orders and restocks at stores in Japan, compared on genres, alerts, maps and price. Written by the developer of Toreca Dash, including its weak points.',
 'Japanese TCG lottery apps compared',
 'Toreca Dash / Comparison / October 2026',
 '''  <p>In Japan, new Pokémon Card Game boxes and other popular trading cards are often sold <strong>by lottery (抽選, <i>chūsen</i>)</strong>: you enter at a store or online shop before a deadline, and only winners can buy. Several apps and sites track these lotteries, pre-orders and restocks. This article puts <strong>Toreca Dash</strong> and four others side by side on the same items, for anyone looking for a <strong>Japanese TCG lottery app</strong>.</p>
  <p class="note"><strong>Disclosure first: I (Koshin) am the developer of Toreca Dash.</strong> This is not a neutral third-party comparison. For the other services I wrote only what their official pages and App Store pages said when I checked on October 23, 2026, and marked anything not stated as “not stated.” I also wrote Toreca Dash’s weak points.</p>
  <p class="note"><strong>For readers outside Japan:</strong> all five services cover stores in Japan, and their information is mostly in Japanese. Most lotteries require a Japanese address or in-store pickup, and some stores require a membership. They are most useful if you live in Japan, are visiting, or use a proxy-buying service.</p>
  <p class="rv"><a class="btn" href="https://apps.apple.com/jp/app/id6788758920" rel="noopener">See Toreca Dash on the App Store</a></p>
  <p class="note">Toreca Dash on the App Store: <a href="https://apps.apple.com/jp/app/id6788758920" rel="noopener">https://apps.apple.com/jp/app/id6788758920</a> (free, iPhone) / about page on this site: <a href="/en/works/torecadash/" hreflang="en" lang="en">Toreca Dash</a></p>

  <h2 class="rv" id="s1">Short answer: which one to pick</h2>
  <ul>
    <li><strong>You follow games other than Pokémon (Yu-Gi-Oh!, One Piece, Gundam and more) or want iPhone push alerts</strong> → <a href="https://apps.apple.com/jp/app/id6788758920" rel="noopener">Toreca Dash</a> (15 games)</li>
    <li><strong>A browser or LINE is enough, not an iPhone app</strong> → Toreget (web and LINE, 6 games)</li>
    <li><strong>Only Pokémon cards, and you want to try free restock alerts first</strong> → NowPokeca</li>
    <li><strong>You want to track Pokémon card prices and the profit or loss of your collection</strong> → Pokeka Tracker</li>
    <li><strong>You want to find card shops nearby</strong> → Toreca no Chizu (lottery listings and alerts: not stated)</li>
  </ul>
  <p>You can combine them, for example Toreca Dash for lottery alerts and another app for prices.</p>

  <h2 class="rv" id="s2">The five, compared</h2>
  <div class="scroll rv"><table>
    <thead><tr><th></th><th>Toreca Dash</th><th>Toreget</th><th>NowPokeca</th><th>Pokeka Tracker</th><th>Toreca no Chizu</th></tr></thead>
    <tbody>
      <tr><th>Where</th><td><a href="https://apps.apple.com/jp/app/id6788758920" rel="noopener">App Store</a></td><td><a href="https://cardchusen.com/" rel="noopener">cardchusen.com</a></td><td><a href="https://apps.apple.com/us/app/-/id6469001897" rel="noopener">App Store</a></td><td><a href="https://apps.apple.com/es/app/pokeka-tracker-%E3%83%9D%E3%82%B1%E3%82%AB%E4%BE%A1%E6%A0%BC%E3%82%92%E7%A2%BA%E8%AA%8D%E3%81%A7%E3%81%8D%E3%82%8B%E3%82%A2%E3%83%97%E3%83%AA/id6450254728" rel="noopener">App Store</a></td><td><a href="https://torecamap.co.jp/" rel="noopener">torecamap.co.jp</a></td></tr>
      <tr><th>Form</th><td>iPhone app</td><td>Website + LINE alerts</td><td>iPhone app</td><td>iPhone / iPad app</td><td>Website</td></tr>
      <tr><th>Games</th><td>15 (Pokémon, Yu-Gi-Oh!, One Piece, Union Arena, Lorcana, Duel Masters, Dragon Ball, Gundam, MTG, Weiß Schwarz, Detective Conan, hololive, Digimon, Haikyu!! VABACA, Palworld)</td><td>6 (Dragon Ball, Yu-Gi-Oh!, Pokémon, One Piece, Weiß Schwarz, Duel Masters)</td><td>Pokémon (from its name and description)</td><td>Pokémon, One Piece</td><td>Seen on the page: One Piece, Yu-Gi-Oh!, Pokémon</td></tr>
      <tr><th>Lottery / pre-order list</th><td>Yes</td><td>Yes (by deadline)</td><td>Yes</td><td>Lottery alerts</td><td>Not stated</td></tr>
      <tr><th>Alerts</th><td>Push</td><td>LINE</td><td>Push (per store)</td><td>Push</td><td>Not stated</td></tr>
      <tr><th>Store locations on a map</th><td>Yes (stores with open lotteries on a map)</td><td>No map stated (filter by prefecture)</td><td>Not stated</td><td>Not stated</td><td>Yes (a shop finder; no lottery info stated)</td></tr>
      <tr><th>Deadline calendar / entry log</th><td>Yes</td><td>Not stated</td><td>Not stated</td><td>Not stated</td><td>Not stated</td></tr>
      <tr><th>Price / profit tracking</th><td>Yes (Pro)</td><td>Not stated</td><td>Charts for favorite cards</td><td>Yes (the core feature)</td><td>Market prices listed</td></tr>
      <tr><th>Price</th><td>Free + in-app purchase (Pro: ¥480/month, ¥3,800/year, ¥9,800 lifetime)</td><td>Not stated</td><td>Free + paid ad removal</td><td>Free + Pro (Spanish store: €5.99/month, €59.99/year; Japanese price not stated)</td><td>No user pricing stated</td></tr>
    </tbody>
  </table></div>
  <p class="note">Sources: each service’s official page and App Store page, checked on October 23, 2026. Services change, so check the official page before you rely on them.</p>

  <h2 class="rv" id="s3">Toreca Dash: strengths</h2>
  <h3>1. It covers 15 card games</h3>
  <p>Pokémon Card Game, Yu-Gi-Oh!, ONE PIECE Card Game, Union Arena, Lorcana, Duel Masters, Dragon Ball, Gundam, Magic: The Gathering, Weiß Schwarz, Detective Conan, hololive, Digimon, Haikyu!! VABACA and Palworld. <strong>Among the four I looked at, none published more games.</strong> If you collect several games, you do not need separate apps.</p>
<div class="shots rv" style="align-items:flex-start"><figure style="max-width:152px"><img src="/assets/notes/tcg-compare-feed-genres.jpg" alt="The Toreca Dash feed. Genre filters for Pokémon, Yu-Gi-Oh!, One Piece, Union Arena, Lorcana, Duel Masters, Dragon Ball and Gundam, each with the number of open entries" width="462" height="1000" loading="lazy"><figcaption>Genre filters with counts. Scroll down for all 15</figcaption></figure></div>
  <h3>2. A map of stores running lotteries now</h3>
  <p>The app’s map tab has a mode for <strong>stores with open lotteries</strong>. It shows a pin for each store that currently accepts lottery or pre-order entries; tapping a pin opens that store’s lottery article.</p>
  <ul>
    <li>Entries past their deadline, or not yet open, are not shown on the map (the code says so).</li>
    <li>Only stores whose location could be determined are pinned. Others appear only in the feed.</li>
    <li>In “sightings” on the same screen, users can post restocks and lotteries they saw in a store. Posts disappear after 12 hours.</li>
  </ul>
  <p>Among the services I checked, I found no other that shows “where lotteries are open right now” on a map (Toreca no Chizu is a shop finder, with no lottery listings stated).</p>
<div class="shots rv" style="align-items:flex-start"><figure style="max-width:152px"><img src="/assets/notes/tcg-compare-map-lottery-stores.jpg" alt="The Toreca Dash map in the open-lotteries mode: pins for stores in the Kanto area that accept lottery or pre-order entries" width="462" height="1000" loading="lazy"><figcaption>Stores with open lotteries. The number on a pin is how many entries are open there</figcaption></figure><figure style="max-width:152px"><img src="/assets/notes/tcg-compare-map-store-detail.jpg" alt="A store opened from a pin, showing a Pokémon card lottery and its deadline" width="462" height="1000" loading="lazy"><figcaption>Tap a pin for that store’s lotteries and deadlines, with directions</figcaption></figure></div>
  <h3>3. No sign-in needed</h3>
  <p>The feed, alerts and calendar work without signing in. Sign in with Apple is needed only to post on the map and for the daily fortune.</p>
  <h3>4. Deadline calendar and entry log</h3>
  <p>A lottery does not end when you enter: there is a results date and a purchase deadline. The app lays out deadlines on a calendar and lets you record the results of lotteries you entered, so you do not forget whether you applied.</p>
  <h3>5. Many sources</h3>
  <p>A server automatically collects official sites, online shops, aggregator sites and public posts on X. What it collects and how much, including the failures, is in <a href="/en/notes/aggregator-pagination/" hreflang="en" lang="en">the article on crawling aggregator sites</a> and <a href="/en/notes/blocked-page/" hreflang="en" lang="en">the article on a crawl returning zero results</a>.</p>

  <h2 class="rv" id="s4">Toreca Dash: weaknesses</h2>
  <ul>
    <li><strong>iPhone only.</strong> I distribute only the iPhone version on the App Store. There is no browser or Android version. It needs iOS 17.2 or later.</li>
    <li><strong>On the free plan, first-come and surprise-sale alerts arrive about 15 minutes late.</strong> Getting them fastest needs Pro (paid): ¥480/month, ¥3,800/year or ¥9,800 lifetime (as shown on the App Store).</li>
    <li><strong>It shows ads.</strong> Removing them takes a ¥480 one-time purchase or Pro.</li>
    <li><strong>Few ratings yet.</strong> The App Store rating is 5.0, but from <strong>2</strong> ratings. That tells you little.</li>
    <li><strong>Dedicated apps go deeper on prices.</strong> Toreca Dash has collection and profit tracking (Pro), but it does not match an app built around prices, such as Pokeka Tracker.</li>
    <li><strong>Only public information.</strong> Lotteries shown only to a store’s members, or announced only to LINE friends, can be missed. Always check the store’s official page before entering.</li>
    <li><strong>It is an unofficial app by an individual developer</strong>, not affiliated with any card game’s rights holders or with the stores.</li>
  </ul>

  <h2 class="rv" id="s5">Toreget</h2>
  <p><a href="https://cardchusen.com/" rel="noopener">Official site (cardchusen.com)</a></p>
  <p>A website that gathers card lottery, pre-order, stock and restock information. Its official page lists 6 games: Dragon Ball, Yu-Gi-Oh!, Pokémon, One Piece, Weiß Schwarz and Duel Masters. Alerts go through LINE, with daily lottery reminders. You can filter by prefecture and browse a list of stores.</p>
  <p><strong>Good for</strong> people who do not want to install an app, Android users, and anyone who prefers LINE alerts. <strong>Points to note:</strong> no app is mentioned, and no map is mentioned. Pricing was not stated.</p>
  <p class="note">The operating company also publishes surveys of lottery win rates (for example a September 2026 press release comparing win rates between stores). Win-rate statistics look like Toreget’s strength.</p>

  <h2 class="rv" id="s6">NowPokeca</h2>
  <p><a href="https://apps.apple.com/us/app/-/id6469001897" rel="noopener">App Store page</a></p>
  <p>An iPhone app that watches Pokémon card sales and sends a push alert when an online shop starts selling (or taking pre-orders). It has a list of lottery sales and per-store alert settings. Free; removing ads is paid ($1.99 on the US store).</p>
  <p><strong>Good for</strong> people who only follow Pokémon cards and want to start free. <strong>Points to note:</strong> it is Pokémon-focused, with no other games mentioned. It had one App Store rating and is made by an individual developer.</p>

  <h2 class="rv" id="s7">Pokeka Tracker</h2>
  <p><a href="https://apps.apple.com/es/app/pokeka-tracker-%E3%83%9D%E3%82%B1%E3%82%AB%E4%BE%A1%E6%A0%BC%E3%82%92%E7%A2%BA%E8%AA%8D%E3%81%A7%E3%81%8D%E3%82%8B%E3%82%A2%E3%83%97%E3%83%AA/id6450254728" rel="noopener">App Store page</a></p>
  <p>An app centered on <strong>Pokémon card prices</strong>: daily price updates, PSA 10 and PSA 9 prices, unrealized profit or loss from what you paid, price alerts and lottery alerts, card scanning, and widgets. It also covers One Piece card prices.</p>
  <p><strong>Good for</strong> people who want to track the value and profit of their collection. <strong>Points to note:</strong> Pro looks relatively expensive (what I could confirm was the Spanish store: €5.99/month, €59.99/year; I could not confirm the Japanese price). It needs iOS 18.0 or later.</p>

  <h2 class="rv" id="s8">Toreca no Chizu (trading card map)</h2>
  <p><a href="https://torecamap.co.jp/" rel="noopener">Official site (torecamap.co.jp)</a></p>
  <p>A web portal for finding trading card shops nearby, with stock search, market prices and tournament information. You pick an area on a map and filter by “open now,” “buys cards,” “parking,” “duel space” and more. I could not find lottery listings or alerts on the page (its columns do explain how individual stores run lotteries).</p>
  <p><strong>Good for</strong> finding card shops themselves. To follow lotteries, you would combine it with another service.</p>

  <h2 class="rv" id="s9">FAQ</h2>
  <h3>Which shows the most TCG lottery information in one place?</h3>
  <p>By number of games, Toreca Dash with 15 was the most among those I checked. For Pokémon only, every service covers it. Choose by your device (iPhone or not) and how you want alerts (an app or LINE).</p>
  <h3>Is there a free app for Pokémon card lottery alerts in Japan?</h3>
  <p>Toreca Dash (on the free plan, first-come alerts are about 15 minutes late), NowPokeca (free) and Toreget (LINE; pricing not stated) all seemed usable for free. What is free can change.</p>
  <h3>Can I find stores running lotteries on a map?</h3>
  <p>Yes, in Toreca Dash’s map tab, in the open-lotteries mode. To just find card shops, Toreca no Chizu works.</p>
  <h3>Do they cover Yu-Gi-Oh! and One Piece lotteries?</h3>
  <p>Toreca Dash (15 games) and Toreget (6 games) both do. NowPokeca is for Pokémon.</p>
  <h3>Is anything available on Android?</h3>
  <p>Toreget is a website, so it works in any browser. Toreca Dash is iPhone only.</p>
  <h3>How can I raise my chance of winning?</h3>
  <p>No app changes the win rate itself. What an app can do is reduce missed deadlines and increase the number of stores you enter. One survey found large differences in win rates between stores (Toreget’s data). From the odds and the number of entries, the chance of winning at least once can be computed with the <a href="/en/calc/lottery/" hreflang="en" lang="en">lottery win chance calculator</a>.</p>

  <h2 class="rv" id="s10">How I checked, and the limits of this article</h2>
  <ul>
    <li>Checked on October 23, 2026. I opened each official page and App Store page and wrote down what they said. I did <strong>not</strong> use each service to measure alert speed or misses.</li>
    <li>“Not found among those I checked” does <strong>not</strong> mean “does not exist.” There are other apps and sites for card lotteries.</li>
    <li>Toreca Dash details come from its app description, its code and its App Store page.</li>
    <li>If you spot a mistake, please tell me via the <a href="/en/about/#contact" hreflang="en" lang="en">contact page</a>. I will check and fix it.</li>
  </ul>
'''), 'date': '2026-11-07'})
