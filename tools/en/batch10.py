pairs.append(make('dup-zero',
 'I counted “duplicates are practically zero,” but the audit reported 112 pairs',
 'A nightly merge job timed out partway through the first genre every night, so later genres were never reached. My count of “zero” looked only at the first genre. How I fixed it with a rotating budget and took 112 pairs to 0.',
 'Duplicates counted as zero',
 'Development log of Torecadash / October 2026',
 '''  <p>My iOS app Torecadash has a job that merges “duplicates,” where one product is registered as several products, every night. One day I counted by myself and recorded “duplicates are practically zero.” But the repository audit reported <strong>112 pairs</strong>. <strong>My way of measuring was wrong.</strong> This is the story from my commit record.</p>
  <p class="note">This is a development log of the app.</p>

  <h2 class="rv" id="s1">I counted zero, and 112 pairs appeared</h2>
  <p>Looking at the 112 pairs, for example one trading-card booster pack was registered <strong>split into 7 entries</strong>, even though the merge job was supposed to run every night.</p>

  <h2 class="rv" id="s2">Cause: it timed out partway through, every night</h2>
  <p>Running the merge over all genres takes <strong>about 15 minutes</strong>. But the time budget I had given the nightly scheduled run was <strong>480 seconds (8 minutes)</strong>. The order always starts from the same genre (Pokémon). So <strong>every night it timed out in the middle of Pokémon, and the later genres were never reached</strong>.</p>
  <p>My count was “zero” because only the range I was looking at (the first genre) was clean.</p>

  <h2 class="rv" id="s3">The fix</h2>
  <ul>
    <li><strong>Rotate.</strong> Start from the genre after where the last run stopped, and stop when the time budget (6 minutes) is used up. The next night continues from where it stopped.</li>
    <li><strong>First, run it to completion by hand.</strong> Running all genres to the end by hand took <strong>duplicates from 112 pairs to 0</strong> and products from <strong>2,753 to 2,570</strong>.</li>
  </ul>

  <h2 class="rv" id="s4">What I already knew: one pass is not enough</h2>
  <p>Two days earlier (September 5), I had learned something else about merging. <strong>When A is merged into B, B’s name can become the same as another C.</strong> Then one pass is not enough. In real data:</p>
  <div class="scroll rv"><table>
    <tr><th>Pass</th><th class="n">Merged</th><th>Result</th></tr>
    <tr><td>1st</td><td class="n">138</td><td>53 new same-name pairs appeared</td></tr>
    <tr><td>2nd</td><td class="n">54</td><td>0 same-name duplicates</td></tr>
  </table></div>
  <p>Products went from 2,935 to 2,713. So the daily slot now <strong>repeats until nothing is merged</strong> (up to 3 times). This “timeout” problem sat even before that repetition.</p>

  <h2 class="rv" id="s5">Three more things the same day</h2>
  <ul>
    <li><strong>Six open lotteries had disappeared because of another product’s list price.</strong> A 7,200 yen lottery (the official 360 yen × 20 packs) had been compared with <strong>another product’s list price of 27,500 yen</strong> left on the article and rejected by price. I added a condition: “<strong>fix only when it can be proven</strong>.” Across all real data, 10 matched the condition and all were sales at a normal price. I restored 11 to visible.</li>
    <li><strong>False alarms in matching.</strong> Of 17 “article exists but hidden,” 9 had a replacement article visible under <strong>a different spelling</strong> of the same shop (like two different kanji spellings of the same store name). If the replacement is visible, it now counts as covered, which moved coverage from 87% to 90% and hidden items from 17 to 4.</li>
    <li><strong>The audit itself had stopped.</strong> The reader part for audits misread a regular expression right after <code>=&gt;</code> as a division, and four audits were failing with <code>ReferenceError</code>. I changed it so that names it could not cut out are reported with a reason instead of being skipped silently.</li>
  </ul>

  <h2 class="rv" id="s6">What I learned</h2>
  <blockquote>When you count “zero,” first doubt what you counted.</blockquote>
  <ul>
    <li><strong>The range you looked at is not necessarily everything.</strong> Only the first genre was processed every night, so counting only the first genre looks clean.</li>
    <li><strong>For time-limited jobs, check whether it finished.</strong> Running and reaching the end are different.</li>
    <li><strong>The tool that counts also breaks.</strong> When an audit has stopped, the result looks like “0 items.” You need a way to notice that it stopped.</li>
  </ul>
  <p class="note">This article is written from my commit record (September 5 and 7, 2026).</p>
'''))

pairs.append(make('torecadash-ai',
 '“It should shrink” was wrong twice: cutting AI calls and what I measured afterward',
 'I tried to reduce calls to an AI in a trading-card info app. A 45% reduction was really 4.5%, and batching ran zero times after deployment. What I found by recounting, with numbers from my commits.',
 'Cutting AI calls',
 'Development log of Torecadash / October 2026',
 '''  <p>My iOS app Torecadash collects information on reservations, lotteries and first-come sales of trading cards (Pokémon, Yu-Gi-Oh!, One Piece) and notifies users. It uses an AI (Gemini) to decide “which product an article is about.” While trying to reduce calls to that AI, <strong>things I had written down as “it should shrink” were wrong twice</strong>. In order, with the numbers left in my commits:</p>
  <p class="note">This is a development log of the app.</p>

  <h2 class="rv" id="s1">What I ask the AI</h2>
  <p>The article title (for example “30th CELEBRATION Premium Deck Set Espeon”) is matched against a list of recent product candidates (the latest 60), and <strong>the AI answers which product it is</strong>. One call is about 3,083 tokens, of which about 1,800 were the same fixed instruction text every time.</p>

  <h2 class="rv" id="s2">First: if the title is exactly a product name, no need to ask</h2>
  <p>If a title matches a known product name exactly, there is no need to ask the AI. When I added this “short circuit,” <strong>43% of X monitoring</strong> matched in real data. There were 0 disagreements (the short circuit’s answer differing from the AI’s). So I recorded that it should <strong>cut about 45%</strong>.</p>
  <p>But 90 minutes after deployment, the short circuit had <strong>not fired even once</strong>. Recounting, it looked like this:</p>
  <div class="scroll rv"><table>
    <tr><th>Source</th><th class="n">Could short-circuit</th><th class="n">Already free before</th><th class="n">Newly saved</th></tr>
    <tr><td>X monitoring</td><td class="n">813</td><td class="n">768</td><td class="n">45 (2%)</td></tr>
    <tr><td>Others</td><td class="n">419</td><td class="n">188</td><td class="n">231 (32%)</td></tr>
  </table></div>
  <p>Before this step, there was <strong>an already free path</strong> that checks against the official catalog. Most articles that could be short-circuited were already settled there. Adding up what is newly saved, it is <strong>about 39 calls a day, about 4.5% of the total</strong>. Not 45%, but 4.5%.</p>
  <blockquote>The share a rule applies to and the calls it actually removes are different things.</blockquote>
  <p>If there is a free path before it, you have to count the difference. That is what the lessons field in my commit says. The logic itself was correct and safe, so I kept it. But as an AI reduction, it was small.</p>

  <h2 class="rv" id="s3">Second: ask in batches</h2>
  <p>The next main idea was to <strong>combine several articles into one call</strong>, because the fixed instruction text is then paid only once. Articles of the same genre share “the latest 60,” so the merged candidate list barely grows.</p>
  <p>In the design I took care of two things.</p>
  <ul>
    <li><strong>Do not add waiting time.</strong> In measurement, a short window of a few hundred milliseconds could not batch anything (only 12 times in 24 hours did articles arrive in the same second). But waiting a few minutes would slow X monitoring’s rounds by 5 times. So I chose to “send the moment every still-running article has come to wait.” The safety cap is 20 seconds.</li>
    <li><strong>Do not lose accuracy.</strong> When batched, the candidate list becomes the union for everyone, so an article can see other articles’ candidates. So the answer is returned as a real product ID, and I always verify that it is among that article’s own candidates. If not, I do not accept it. For an article with a missing reply, I ask again for that one alone.</li>
  </ul>
  <p>I measured the effect by reconstructing candidate lists from the real articles of the last two days (characters sent).</p>
  <div class="scroll rv"><table>
    <tr><th>Batch size</th><th class="n">One by one</th><th class="n">Batched</th><th class="n">Reduction</th></tr>
    <tr><td>2</td><td class="n">21,762</td><td class="n">13,427</td><td class="n">−38%</td></tr>
    <tr><td>3</td><td class="n">32,673</td><td class="n">14,964</td><td class="n">−54%</td></tr>
    <tr><td>4</td><td class="n">43,571</td><td class="n">16,192</td><td class="n">−63%</td></tr>
    <tr><td>6</td><td class="n">65,000</td><td class="n">17,729</td><td class="n">−73%</td></tr>
  </table></div>

  <h2 class="rv" id="s4">Third: deployed, and it never batched once</h2>
  <p>Six hours after deployment, there were 47 product-matching calls and <strong>0 batches</strong>. Although 2 to 7 calls came in the same minute, each was asked one at a time.</p>
  <p>The cause was the “send condition.” I had checked “number waiting ≥ number of unfinished jobs (pending),” but <strong>jobs that had come to wait were also counted in pending</strong>. X monitoring runs 32 accounts at once. If 31 had already finished, pending was 1. The moment the last one came to wait, the condition held and <strong>it was sent immediately as a single item</strong>.</p>
  <p>The fix was to check “are there zero jobs that have not even come to wait yet.” When the number completely finished plus the number now waiting reaches the total, send. I also shortened the safety cap from 20 seconds to 6 seconds. If only one item comes, waiting 20 seconds every time would be longer than one X monitoring run (17.8 seconds measured) and delay the rounds.</p>
  <p>During this check, the first short circuit was also reviewed. <strong>In 6 hours, 28 of 47 calls (60%)</strong> were handled without calling the AI. The short circuit was working correctly.</p>

  <h2 class="rv" id="s5">What I learned</h2>
  <ul>
    <li><strong>Do not write the “share it applies to” as the amount saved.</strong> If there is a free path before it, only the difference is saved.</li>
    <li><strong>Deploying does not mean it ran.</strong> “0 batches” was found because I recounted. If I had decided in advance that a log should say “batched,” I would have noticed sooner.</li>
    <li>The three numbers (4.5%, −38 to 73%, 60%) are all <strong>not what I first estimated</strong>. They are numbers re-measured on real data after deployment.</li>
  </ul>
  <p class="note">The numbers in this article come from my commit record (September 4 and 5, 2026). I do not write amounts of money.</p>
'''))

pairs.append(make('stopwatch-rank',
 'Making a 10-second stopwatch ranking fair: 3 decimals, ties and write counts',
 'Why I truncate to three decimals so low-resolution clocks do not get an advantage, how ties are broken (a 1/333 chance), and how I counted KV writes on the free tier, plus launch-day stumbles.',
 'Fair stopwatch ranking',
 'Development log of the 10-second stopwatch / October 2026',
 '''  <p><a href="/en/works/" hreflang="en" lang="en">Stop at exactly 10 seconds!</a> is a game where you count ten seconds in your head and stop. It is three rounds and the smaller your error, the better. When I added a ranking to it, I had to decide “what is fair” in three places. This is written from the README and code comments in the repository.</p>

  <h2 class="rv" id="s1">Display down to three decimals</h2>
  <p>Error is measured with the browser’s <code>performance.now()</code>. According to the README, this clock is deliberately made less precise as a security measure (Spectre). Chrome is in 5-microsecond steps, Safari and Firefox in 1 millisecond.</p>
  <p>What would happen if error were shown to 6 decimal places? A device with a coarser clock more easily ends in <code>000</code> and <strong>gets an advantage</strong>. The README’s guess is that iPhones would take the top ranks. So I decided to <strong>cut to 3 decimals and align all devices</strong>. For the start of measurement, I use <code>event.timeStamp</code> of <code>pointerdown</code> rather than <code>click</code>, because <code>click</code> adds extra delay.</p>

  <h2 class="rv" id="s2">Ties happen more than you think</h2>
  <p>With 3 decimals, an exact 0.000 comes up with probability 1/1000 per attempt. The chance that any one of three attempts is 0.000 is about <strong>1/333</strong>. If you build a “best of three” board, <strong>ties at 0.000 will pile up</strong>.</p>
  <p>So for a tie, <strong>the one with the smaller total error in the other two attempts ranks higher</strong>. If that is equal too, whoever submitted first. Someone who hit 0.000 and also did well on the other two ranks above, so they can be told apart from someone with one lucky attempt.</p>
  <p>The “total” and “average” rankings have exactly the same order (it is just division by 3), so they are one board. Separately I placed a “best single attempt” board. The idea is that the average is skill and the best single is luck.</p>

  <h2 class="rv" id="s3">Counting writes</h2>
  <p>The ranking is built on Cloudflare Workers and KV (a key-value store). According to the code comments, KV writes are 1,000 a day on the free tier. To stay within that, I decided the following.</p>
  <ul>
    <li>The board for each mode is stored under <strong>one key</strong>. One submission writes at most twice (today’s and all-time).</li>
    <li>Submissions that do not make the ranking, and submissions with the same name that are worse than before, are <strong>not written at all</strong>.</li>
    <li>Only one row is kept per name. One person cannot fill the board.</li>
  </ul>
  <p>Also, since scores are reported by the client, cheating cannot be prevented. The README says so. So I operate on the assumption that <strong>it is reset every day</strong>. Days are cut in Japan time, and today’s board disappears in 3 days.</p>

  <h2 class="rv" id="s4">What I fixed around the launch</h2>
  <ul>
    <li><strong>The range of accepted error.</strong> I accept up to the slowest result the screen can show (99.999 seconds in 10-second mode). Even terrible results are accepted, since they will not stay on the board anyway.</li>
    <li><strong>Do not cache the read before a write.</strong> If KV reads have a short cache, a new value is written over a stale one and <strong>submissions that came in between disappear</strong>. Only the read before a write has no cache. View-only reads stay cached.</li>
    <li><strong>Retry when it could not connect.</strong> At first, if the game could not reach the ranking when it opened, it did not show the ranking box and never tried again. Even if the ranking backend came up while playing, there was no way back. When three attempts are done and the box is still hidden, it now reads once more.</li>
    <li><strong>Stay quiet.</strong> Until it connects, the ranking box is not shown at all and there is no apology message. I decided that being silent is better than showing an empty box or red text.</li>
  </ul>

  <h2 class="rv" id="s5">A stumble on launch day</h2>
  <p>When I first deployed to Cloudflare Pages, I did not pass <code>--branch</code>. The name of the working branch I happened to be on was <strong>registered as the production branch</strong> of Pages. After that, deploying with <code>--branch main</code> only went to a preview, and the public URL did not change. <strong>I did not notice for an hour.</strong></p>
  <p>I fixed the production branch to main in the dashboard. One more thing I had confused: the branch name shown on the “Production” row of the deployment list is <strong>the name at the time that deployment was made</strong> and is not rewritten when you change the setting. To see the setting, look at the “Production branch” column in the project list.</p>

  <h2 class="rv" id="s6">What I learned</h2>
  <blockquote>Fairness is made of digits, ties and write counts.</blockquote>
  <p>None of them looks like what makes a game fun. But <strong>cutting to three decimals</strong> and <strong>deciding tie-breaking in advance</strong> directly affect how convincing the ranking feels to players.</p>
  <p class="note">This article is written from the repository’s README, code comments and the commit record (September 8 to 12, 2026). The clock precision per browser is as stated in the README.</p>
'''))
