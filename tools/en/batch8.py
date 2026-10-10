pairs.append(make('webaudio',
 'I could not listen, so I measured the waveform: building Japanese instruments with WebAudio for Sushi Stack',
 'Sushi Stack uses no audio files. The koto, taiko, hyoshigi and kane are synthesized in the browser. Because I could not listen while building, I set volumes by measuring waveform peaks, and re-set the rank thresholds from measured auto-play.',
 'Measuring audio with WebAudio',
 'Development log of Sushi Stack / October 2026',
 '''  <p>The sound of <a href="/en/works/" hreflang="en" lang="en">Sushi Stack</a> uses not a single audio file. <strong>Japanese instruments are synthesized on the spot with the browser’s audio feature (WebAudio)</strong>. The problem was that I had no way to listen while I was building it. So I <strong>measured the waveform and adjusted the volume</strong>. This is written with the numbers left in my commits.</p>

  <h2 class="rv" id="s1">Why no audio files</h2>
  <p>Using external libraries or audio files would break the form where the game is delivered as one file (and works offline). So I synthesized the koto (plucked), taiko, hyoshigi (wooden clappers) and kane (gong) from WebAudio parts and composed the music in the yo scale (a Japanese scale).</p>
  <ul>
    <li><strong>BGM:</strong> played by a look-ahead scheduler built on eighth notes. Its thickness changes in <strong>four steps</strong> with how full the tub is; the more dangerous it gets, the more taiko drums are added.</li>
    <li><strong>Sound effects:</strong> the number and weight of sounds stack up in this order: merge, chain, otoro, spiny lobster / golden, golden with golden.</li>
    <li>I added a celebratory phrase for ranking up and for beating a personal best. There is a sound on/off button, and the setting stays on the device.</li>
  </ul>

  <h2 class="rv" id="s2">I cannot listen, so I measure the waveform</h2>
  <p>The balance of volume is something you would normally decide by ear. But in this work I could not listen. So I swapped the same synthesis functions onto a render-only audio part (<code>OfflineAudioContext</code>), <strong>wrote the sound out as a waveform, and measured the maximum amplitude (peak)</strong>.</p>
  <p>The initial state was this:</p>
  <ul>
    <li>The jackpot sound peaked at <strong>1.18</strong>. Above 1.0 the sound clips and distorts.</li>
    <li>The merge sound was <strong>0.072</strong>. It was buried in the BGM and could not be heard.</li>
  </ul>
  <p>After adjusting, the sound effects lined up like stairs below the BGM peak of <strong>0.179</strong>.</p>
  <div class="scroll rv"><table>
    <tr><th>Sound</th><th class="n">Peak</th></tr>
    <tr><td>BGM (reference)</td><td class="n">0.179</td></tr>
    <tr><td>Merge</td><td class="n">0.16</td></tr>
    <tr><td>3-chain</td><td class="n">0.48</td></tr>
    <tr><td>Otoro</td><td class="n">0.49</td></tr>
    <tr><td>Golden</td><td class="n">0.85</td></tr>
    <tr><td>Jackpot</td><td class="n">0.81</td></tr>
  </table></div>
  <p>The distortion is gone, and I can confirm with numbers the order “the more rewarding the sound, the louder.” But whether it <strong>sounds pleasant to the ear</strong> cannot be told by this method.</p>

  <h2 class="rv" id="s3">I re-drew the ranks from measurements, too</h2>
  <p>The same day I reviewed the rank thresholds. I ran auto-play 12 times and took the score distribution:</p>
  <div class="scroll rv"><table>
    <tr><th>Mode</th><th class="n">Score range</th><th class="n">Moves placed</th></tr>
    <tr><td>Omakase</td><td class="n">12,532 to 22,413</td><td class="n">172 to 267</td></tr>
    <tr><td>Menu</td><td class="n">20,992 to 46,395</td><td class="n">171 to 306</td></tr>
  </table></div>
  <p>With the earlier criterion (legend = 30,000 points), <strong>an auto-play with no strategy reached the top rank</strong>. So I moved the thresholds above that (0 / 4,000 / 10,000 / 18,000 / 30,000 / 50,000 / 85,000). Menu scores come out about 1.8 times higher, so I stretched them by the same ratio. Both auto-plays now stop at “journeyman,” and <strong>from head chef up, it depends on skill</strong>.</p>
  <p>The next day I ran 120 games and measured the distribution (apprentice 6%, journeyman 32%, head chef 40%, master 14%, legend 8%). Auto-play is better than people, so it does not fall into the bottom two ranks. Those two are a layout meant to matter when humans play.</p>

  <h2 class="rv" id="s4">I also changed how chains are shown</h2>
  <ul>
    <li>I added the chain bonus to Omakase as well. Under the same conditions, the score nearly doubles.</li>
    <li>A 3-chain happened more than 20 times in a game and had no value. I now show the center-screen notice <strong>from 4-chain</strong> (2- and 3-chains only get floating text and sound).</li>
  </ul>

  <h2 class="rv" id="s5">What I learned</h2>
  <blockquote>Even if you cannot listen, you can measure.</blockquote>
  <ul>
    <li><strong>Decide with numbers what you cannot decide by feel.</strong> Both the audio balance and the ranks were built on measurements.</li>
    <li><strong>Being measurable is different from being verified.</strong> A waveform tells me whether there is distortion and the order of loudness. It does not tell me whether it is pleasant.</li>
    <li><strong>Test a “criterion” against something that should break it.</strong> A criterion that let a strategy-less auto-play reach the top rank was not working as a criterion.</li>
  </ul>
  <p class="note">The numbers in this article come from my commit record (September 7 and 8, 2026). The sizes of the pieces changed after those days (<a href="/notes/anago/" hreflang="ja" lang="ja">the conger eel article</a>, in Japanese), so the current score ranges and thresholds differ from what is written here.</p>
'''))

pairs.append(make('ranking-free-tier',
 'Making a ranking server use only half of the free tier: from 5 calls to 2',
 'Sushi Stack’s online ranking runs on Cloudflare Workers and D1 within the free tier. I halved its use: calls per play went from 5 to 2 and rows read from 421 to 221. How rank is counted and how the preflight call was removed.',
 'Halving free-tier usage',
 'Development log of Sushi Stack / October 2026',
 '''  <p><a href="/en/works/" hreflang="en" lang="en">Sushi Stack</a> has an online ranking. It runs on Cloudflare Workers and D1 (a database), within the free tier. I <strong>halved</strong> how much of the free tier this ranking server uses. What I counted and what I changed are written with the measured values in my commits.</p>

  <h2 class="rv" id="s1">The free tier is shared</h2>
  <p>Cloudflare’s free tier is per account. All Workers and D1 databases in the account share it. If other projects live there too, it is best to keep the ranking thin. My commit also says that <strong>from September 1, 2026, D1 really refuses queries at this limit</strong>. The limit is on “rows read,” 5 million a day.</p>

  <h2 class="rv" id="s2">What happens when one person plays</h2>
  <p>For the most ordinary flow, “one person plays once, submits a score, and views the ranking once,” I counted calls to the server and rows read. I counted by actually running the Worker with <code>node:sqlite</code> in place of D1.</p>
  <div class="scroll rv"><table>
    <tr><th></th><th class="n">Before</th><th class="n">After</th></tr>
    <tr><td>Calls</td><td class="n">5</td><td class="n">2</td></tr>
    <tr><td>Rows read</td><td class="n">421</td><td class="n">221</td></tr>
    <tr><td>Rows written</td><td class="n">1</td><td class="n">1</td></tr>
  </table></div>
  <p>The ceiling is rows read. Dividing 5 million rows by the rows per person gives how many people can play within the free tier. Before: 5,000,000 ÷ 421 ≈ 11,876 people (the commit says “about 11,000,” a little off from the division). After: 5,000,000 ÷ 221 ≈ <strong>22,624 people (about 22,000 in the commit)</strong>. By either count, the daily ceiling roughly <strong>doubled</strong>.</p>

  <h2 class="rv" id="s3">Two changes</h2>
  <h3>1. Count the rank on the server</h3>
  <p>Before, the game <strong>fetched the top-100 list twice</strong> and looked for itself in it. I changed it so the server counts the rank and returns it. The counting is a <code>COUNT</code> that cuts off after a fixed number of top rows (<code>SCAN</code>). The higher you are, the fewer rows are read.</p>
  <h3>2. Remove the preflight call</h3>
  <p>I made <code>/submit</code>, which sends the score, accept <code>text/plain</code>. The content is still JSON. But when sent with this type, the browser does not send the preflight check call (<code>OPTIONS</code>). One call is gone.</p>
  <p>The shared database on the artifact side has no mechanism to count rank. That side still counts in the game as before. Only when <code>submit</code> returns <code>null</code> does it fetch the list.</p>

  <h2 class="rv" id="s4">What I verified</h2>
  <ul>
    <li>Submitting two people to an empty ranking gives 1st and 2nd.</li>
    <li>In a ranking of 500 people, the server-counted rank (including “outside the top 100”) comes out correctly.</li>
    <li>Tampered score submissions are still rejected as before, in both Japanese and English.</li>
  </ul>

  <h2 class="rv" id="s5">What I learned</h2>
  <blockquote>What you count is not money but calls and rows.</blockquote>
  <ul>
    <li><strong>A free-tier limit is the one that runs out first.</strong> Here it was rows read, not the number of calls.</li>
    <li><strong>Measure one “ordinary play.”</strong> I could say “half” because I fixed one flow of a person playing and counted it.</li>
    <li>The same free-tier story is in <a href="/notes/stopwatch-rank/" hreflang="ja" lang="ja">the 10-second stopwatch ranking article</a> (in Japanese). There it was the number of writes (1,000 a day on KV).</li>
  </ul>
  <p class="note">The numbers in this article come from my commit record (September 7, 2026). The free-tier limits (such as 5 million rows a day) are as stated in the commit.</p>
'''))
