pairs.append(make('crazygames',
 'Rejected by CrazyGames with no reason given: I recorded the game and found four problems',
 'A browser-game portal rejected my game with only “overall quality below expectations.” I captured what the reviewer would have seen and found four separate causes, then fixed them by measuring first.',
 'Rejected by CrazyGames',
 'Development log of Sushi Stack / October 2026',
 '''  <p>I submitted <a href="/en/works/" hreflang="en" lang="en">Sushi Stack</a>, my merge puzzle game, to the browser-game portal CrazyGames, and it was rejected. The only reason given was that “overall quality does not meet expectations.” So I captured the game myself and looked for the problem. I found four. This is written from my commit record.</p>

  <h2 class="rv" id="s1">When no reason is given</h2>
  <p>“Quality” does not tell me what is wrong. The commit notes say that once I actually recorded the game, I recognized the problems. A reviewer plays for a few minutes and judges from what is on the screen. So I decided to look at the same screen the reviewer saw.</p>

  <h2 class="rv" id="s2">The four I found</h2>
  <h3>1. A black line across the screen</h3>
  <p>The darkening effect for the background left the edge where the wall meets the floor, so a <strong>black straight line ran across the screen</strong> and a <strong>vertical seam</strong> showed at the rim of the tub. It looked broken. I blended the boundary and changed the edge fade from a straight cut to a curve.</p>
  <h3>2. On a wide screen, the play area was only 30%</h3>
  <p>On a wide screen the play area took 30% of the screen and the rest was just dark. I put the <strong>evolution chain</strong> (what merges into what) on the left. In a merge game it is the first thing players look for, and I had hidden it inside the encyclopedia.</p>
  <h3>3. The silhouettes of unlocked tiers were invisible</h3>
  <p>Tiers not yet reached are shown as silhouettes. But I drew dark brown silhouettes on a dark background, so they could not be seen. I made it possible to pass a lighter silhouette.</p>
  <h3>4. Tension never happened</h3>
  <p>The fourth was heavier than looks. Measured with auto-play, one game was a <strong>median of 594 moves, about 7.5 minutes</strong>, and my commit says “30 minutes for a human.” The tub never filled up, so <strong>the dangerous moments never came</strong>. In the few minutes a reviewer spends, tension never occurred even once.</p>

  <h2 class="rv" id="s3">The fix: measure, then choose</h2>
  <p>I decided not to touch the size or area ratio of each tier, since that would damage the feeling of merging into something bigger. I used auto-play to find places I could change without losing that feeling. I also gave my balance-testing tool a way to swap sizes and the spawn distribution from outside, and ran candidates in bulk to compare.</p>
  <div class="scroll rv"><table>
    <tr><th>What changed</th><th class="n">Before</th><th class="n">After</th></tr>
    <tr><td>Items that fall</td><td class="n">3 kinds</td><td class="n">5 kinds (added salmon and tuna)</td></tr>
    <tr><td>Moves per game (auto-play median)</td><td class="n">594</td><td class="n">279</td></tr>
    <tr><td>Tub rim / height</td><td class="n">320 / 308</td><td class="n">250 / 378</td></tr>
    <tr><td>Share of screen used by the play area</td><td class="n">45%</td><td class="n">62%</td></tr>
    <tr><td>Area ratio, conger eel to spiny lobster</td><td class="n">1.76</td><td class="n">1.40</td></tr>
    <tr><td>Leftover width when two gold tubs sit side by side</td><td class="n">0 px</td><td class="n">36 px</td></tr>
  </table></div>
  <p>Now two gold tubs fit side by side, so a <strong>gold-tub merge</strong> (merging gold tubs together) works in real play. The logic had been there before, but it never happened once in 300 games. A game is half as long, so scores also dropped by about 20% (auto-play median from 59,305 to 46,529). I recalculated the ranking thresholds.</p>

  <h2 class="rv" id="s4">What I learned</h2>
  <blockquote>“Low quality” was four separate problems.</blockquote>
  <p>Two were about appearance, one about where information was placed, and one about the substance of play. When no reason is given, the first thing to do is <strong>look at the screen the other person saw</strong>. For someone who plays for a few minutes, tension that builds over 30 minutes does not exist.</p>
  <p class="note">This article is written from my commit record (September 10, 2026). The result of a re-review is not included.</p>
'''))

pairs.append(make('adgap',
 'Measuring the gap between ads in time, not in plays',
 'Why I replaced “one ad every 5 plays” with “only when 7 minutes have passed since the last ad,” how it behaves, and what I noticed while writing: I do not know how long a game takes a person.',
 'Ad interval by time',
 'Development log of Sushi Stack / October 2026',
 '''  <p>Sushi Stack has a mechanism that can insert one ad at the break between one game and the next. At first I set it to “one ad per 5 plays,” and the next day I changed it to <strong>count time, not plays</strong>. This is the reason and a record of how it behaves.</p>
  <p class="note">This site does not show ads yet (the ad loader is left empty). This is about a mechanism I built ahead of time for when ads are turned on.</p>

  <h2 class="rv" id="s1">The first rule: one ad per 5 plays</h2>
  <p>In the first version on September 7, an ad was inserted before “one more game” every 5 plays, and never on the first play. The idea was to skip the first game to protect the first impression. The game detects which of CrazyGames, Poki or Google it runs on, uses that SDK if there is one, and passes through if there is none.</p>

  <h2 class="rv" id="s2">Why it did not fit</h2>
  <p>The next day, September 8, I dropped this counting. The commit gives two reasons.</p>
  <ul>
    <li><strong>If one game is long, ads never appear.</strong> A game can last 30 minutes, so the 5th play comes 2.5 hours later. Almost nobody plays that long.</li>
    <li><strong>If games end quickly, ads appear one after another.</strong> After several quick losses, several ads show up within minutes.</li>
  </ul>
  <p>Both come from counting plays. What bothers a player is not the number of ads but <strong>the time between ads</strong>. So I changed what I count to time.</p>

  <h2 class="rv" id="s3">The rule after the change</h2>
  <ul>
    <li>No ad on the first game (as before).</li>
    <li>For someone who has not seen an ad yet, one ad at the break after the second game.</li>
    <li>After that, <strong>only when at least 7 minutes have passed since the last ad</strong>, one ad at the next break.</li>
  </ul>
  <p>The time of the last ad is remembered in the browser (<code>localStorage</code>). Nothing is sent to a server. The behavior I checked:</p>
  <div class="scroll rv"><table>
    <tr><th>Situation</th><th class="n">Ad</th></tr>
    <tr><td>First play</td><td class="n">None</td></tr>
    <tr><td>Second play (no ad shown yet)</td><td class="n">Shown</td></tr>
    <tr><td>1 minute / 6 minutes since the last ad</td><td class="n">None</td></tr>
    <tr><td>8 minutes since the last ad</td><td class="n">Shown</td></tr>
    <tr><td>After a long game (40 minutes)</td><td class="n">Shown</td></tr>
  </table></div>
  <p>For the earlier version (one ad per 5 plays), I ran 7 games with a fake CrazyGames SDK and confirmed that “an ad appears once after the 5th game” and that “with no SDK, none appears and there are zero errors.” For the time-based version too, I checked that the screen always returns after an ad ends.</p>

  <h2 class="rv" id="s4">What I noticed while writing</h2>
  <p>How I chose “7 minutes” is not in the commit. I will be honest: the reason is not recorded.</p>
  <p>What bothers me most is the length of a game. The commit’s “a game can take 30 minutes” was later, in the September 10 commit, written as <strong>“median 7.5 minutes in auto-play, 30 minutes for a human.”</strong> So 30 minutes is a guess, <strong>not a measured number</strong>. The 7.5 minutes of auto-play (7.7 minutes in <a href="/notes/anago/" hreflang="ja" lang="ja">the conger eel article</a>, in Japanese) is the measured one.</p>
  <p>And on September 10 a game became <strong>half as long</strong>, so the earlier table is out of date. Recalculating (I put an auto-play game at half of 7.7 minutes, about 3.8 minutes):</p>
  <div class="scroll rv"><table>
    <tr><th>Length of one game</th><th class="n">One per 5 plays (old)</th><th class="n">One per 7 minutes (new)</th></tr>
    <tr><td>About 3.8 min (auto-play, after halving)</td><td class="n">One per about 19 min</td><td class="n">About one per 2 games</td></tr>
    <tr><td>About 15 min (half of “30 for a human”)</td><td class="n">One per about 75 min</td><td class="n">Every game</td></tr>
  </table></div>
  <p>I still have not measured how long a game takes a person. Whether 7 minutes is long or short cannot be decided without that. <strong>Measuring the length of a game comes before turning ads on.</strong></p>

  <h2 class="rv" id="s5">What I learned</h2>
  <blockquote>Counting plays makes ad frequency swing with how people play. Counting time does not.</blockquote>
  <p>But changing to time did not make the frequency <em>right</em>. My current conclusion is that whether 7 minutes is long or short cannot be decided until I know how long a game takes a person. When I am ready to turn ads on, I will measure that first.</p>
'''))

pairs.append(make('ascii-text',
 'Japanese text garbled in the CrazyGames preview: the file was correct, the cause was never found, so I escaped to ASCII',
 'One character of “大連鎖！” rendered broken in a game portal preview even though the file bytes were correct. How I made the game immune without finding the cause, plus a check of 14 languages for overflow.',
 'Garbled text in the CrazyGames preview',
 'Development log of Sushi Stack / October 2026',
 '''  <p>When I opened <a href="/en/works/" hreflang="en" lang="en">Sushi Stack</a> in a game portal’s preview, a report said that only the character 連 in “大連鎖！” (Big Chain!) appeared broken. I checked the file and <strong>the character was stored correctly</strong>. This is how I moved on, without knowing the cause, by making it a form that does not matter if it breaks, from my commit record.</p>

  <h2 class="rv" id="s1">Only one character breaks</h2>
  <p>The report came from the CrazyGames preview. When a chain happens in the game, “大連鎖！” appears on screen. That one character, 連, was rendered broken. The other characters were fine.</p>
  <p>I first checked the game file itself. <strong>The byte sequence was correct.</strong> So the file on my side was not broken. It had to break somewhere <strong>in the hand-off</strong> before it reached the portal, or somewhere in how the portal read it. The commit does not say where. <strong>I have not identified the cause.</strong></p>

  <h2 class="rv" id="s2">How to fix something whose cause you cannot find</h2>
  <p>If the cause is outside my hands, I decided to make a form <strong>that does not matter wherever it breaks</strong>.</p>
  <ul>
    <li><strong>Replace displayed text with ASCII-only notation.</strong> Do not write Japanese characters directly in the file. In scripts use <code>\\uXXXX</code>, in HTML text and attributes use <code>&amp;#xXXXX;</code>. Even if multi-byte characters get corrupted midway, ASCII has nothing to corrupt.</li>
    <li><strong>Leave the replacement to a tool (<code>tools/asciify.mjs</code>).</strong> I write in Japanese, then run the tool. It gives the same result no matter how many times I run it. Comments stay in Japanese so they stay readable (they never appear on screen).</li>
    <li><strong>Add a font that has the kanji to the end of the font stack.</strong> That also closes the path where a font lacks the character and it does not show.</li>
  </ul>

  <h2 class="rv" id="s3">Two other problems found in the same check</h2>
  <ul>
    <li><strong>Emoji do not show on some devices.</strong> The globe and mobile-phone emoji are missing on some devices. I redrew them as SVG shapes.</li>
    <li><strong>Floating text during a chain overlaps and cannot be read.</strong> Text that appears at nearby positions now moves upward to avoid overlap.</li>
  </ul>

  <h2 class="rv" id="s4">The next day: do 14 languages fit in their boxes?</h2>
  <p>The game supports 14 languages. Translations are often longer than the Japanese and overflow easily in the side column on PC (192 px wide) and inside cards. I added a tool that switches through the languages in turn and <strong>counts anything that sticks out of its parent box or scrolls sideways</strong>.</p>
  <p>The result: <strong>no overflow in 14 languages × 2 screen sizes</strong>. As with broken characters, “nothing overflows” is more reliable counted than eyeballed.</p>

  <h2 class="rv" id="s5">What I learned</h2>
  <blockquote>When you do not know the cause, stop depending on the place where the cause is.</blockquote>
  <ul>
    <li><strong>A correct file does not mean a correct screen.</strong> The hand-off and the portal’s reading are things I cannot fix.</li>
    <li><strong>Write down what you do not know.</strong> I still do not know why 連 broke. ASCII escaping did not fix the cause. It only <strong>made the game unaffected by it</strong>.</li>
    <li><strong>Have a machine count visual breakage.</strong> Checking 14 languages by eye is not realistic.</li>
  </ul>
  <p class="note">This article is written from my commit record (September 7 and 8, 2026). The cause of the broken character is not in the record, so it is not written here.</p>
'''))
