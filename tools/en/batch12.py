pairs.append(make('result-screen',
 'The streaming buttons were shown even for titles you could not watch: making the quiz result screen true',
 'The anime quiz result screen showed the same two streaming buttons for every title. Recounting against real availability, about 29% were wrong. How I narrowed buttons by availability and fixed image problems (http, placeholders, logos).',
 'Making the result screen true',
 'Development log of the Anime Type Diagnosis / October 2026',
 '''  <p>The result screen of the <a href="/en/works/shindananime/" hreflang="en" lang="en">Hardcore Anime Type Diagnosis</a> shows the cover of your title of fate and “where to watch” buttons. When I first built it, both the buttons and the images <strong>showed things that differed from reality</strong>. I recounted with my own data how large the difference was, and I am writing it down.</p>

  <h2 class="rv" id="s1">The streaming buttons were the same two for every title</h2>
  <p>In the first version, the streaming buttons on the result screen were <strong>only DMM TV and U-NEXT</strong>, the same two for any title. Pressing a button goes to that service’s search page. But the title is not necessarily available there.</p>
  <p>The quiz data includes, for each title, “which services stream it” (Filmarks streaming information). Of 6,091 titles, <strong>4,489 (73.7%)</strong> have this. Counting whether the two buttons of that time really pointed to a place where you can watch, for these 4,489:</p>
  <div class="scroll rv"><table>
    <tr><th>The two buttons of that time</th><th class="n">Titles</th><th class="n">Share</th></tr>
    <tr><td>Both point to a place you can watch</td><td class="n">3,192</td><td class="n">71.1%</td></tr>
    <tr><td>At least one points to a place you cannot watch</td><td class="n">1,297</td><td class="n">28.9%</td></tr>
    <tr><td>&nbsp;&nbsp;of which both are places you cannot watch</td><td class="n">295</td><td class="n">6.6%</td></tr>
  </table></div>
  <p>For one title in three or four, pressing the button did not find the title. It ended in “page not found.”</p>

  <h2 class="rv" id="s2">The fix: narrow by real availability</h2>
  <ul>
    <li>I <strong>increased the services from 2 to 12</strong> (Netflix, Prime Video, Disney+, U-NEXT, Hulu, DMM TV, ABEMA, d Anime Store, FOD, TELASA, Lemino, Bandai Channel). I opened the search URLs in a browser to check them.</li>
    <li>Buttons are made <strong>only for services in that title’s availability</strong>.</li>
    <li>But showing all of them would stretch the result card too tall. I sort by major services first (priority Netflix, Prime Video, Disney+, U-NEXT, Hulu) and show <strong>only the top 3</strong>.</li>
    <li>For titles with unknown availability (the remaining 26.3%), there is no way to check, so I show the top 3 by popularity as before.</li>
  </ul>
  <p>Along the way I noticed that DMM TV’s search URL returned 404 (I changed <code>/vod/search/</code> to <code>/vod/list/</code>).</p>
  <p class="note">Availability is as of the time the data was collected. Streaming changes, so a title may not still be there when you press the button.</p>

  <h2 class="rv" id="s3">The same thing was happening with images</h2>
  <p>Some cover images were wrong or did not appear.</p>
  <ul>
    <li><strong>http images do not appear.</strong> The quiz is served over https. If an image URL is <code>http://</code>, the browser blocks it as mixed content. (One official site had no certificate at all.) I treat http images as “none” and fill from an https image that comes later.</li>
    <li><strong>Placeholder pictures were shown as real.</strong> “No image” placeholders and generic images shared by an official site are not the actual art. I now reject them.</li>
    <li><strong>Logos got mixed in.</strong> Filmarks’ sharing image is a 240×240 square, and if the poster is not square, the company’s logo is put in the margin. I changed it to prefer another image embedded in the page (260×364, kept in the poster ratio). After re-fetching all 7,247 entries, the number using a poster-ratio image rose to 4,477 (89 are still in the old shape).</li>
    <li><strong>No image at all.</strong> Most of the cause was that Annict and Filmarks split titles differently, so matching titles failed. By filling from images of the same series, the share with an image went <strong>from 77% to 86%</strong>.</li>
  </ul>
  <p>In the end, <strong>92.5%</strong> of the 6,091 titles used by the quiz have an image.</p>

  <h2 class="rv" id="s4">What I learned</h2>
  <blockquote>On a result screen, trust is decided less by looks than by “what happens when I press it.”</blockquote>
  <ul>
    <li><strong>Showing the same thing to everyone is easy, but wrong nearly 3 times in 10.</strong> Look at the real situation (availability) and narrow.</li>
    <li><strong>Decide what to show when you “don’t know.”</strong> For the 26.3% with unknown availability, I fell back to the normal top 3.</li>
    <li><strong>Reject what is not the real thing.</strong> Placeholders, generic images and images with a logo are worse than a blank, I decided.</li>
  </ul>
  <p class="note">The shares in this article were counted on the quiz data (6,091 titles) as of October 8, 2026. The image counts come from the commit record (September 25, 2026).</p>
'''))

pairs.append(make('first-visit',
 'Cutting six buttons to one: first-time players did not know what to press',
 'The title screen had six things to press. For a game portal launch I made the first step one big button, and fixed saves vanishing inside an iframe and the game running while the tab was hidden.',
 'Six buttons to one',
 'Development log of Sushi Stack / October 2026',
 '''  <p>The title screen of <a href="/en/works/" hreflang="en" lang="en">Sushi Stack</a> had <strong>six</strong> things you could press. Someone opening it for the first time did not know which to press. For the game portal launch, I narrowed “what a first-time player presses first” to one. I also wrote down, from my commits, two problems I fixed at the same time: saves vanishing, and what happens when you leave the screen.</p>

  <h2 class="rv" id="s1">What a portal measures you by</h2>
  <p>According to the commit, the portal I decided to submit to (CrazyGames) first has a trial stage (Basic Launch) shown to a limited audience for two weeks. Whether you move up to the next stage (Full Launch) is decided by these three things during that time.</p>
  <ul>
    <li>The share of people who start playing</li>
    <li>Average time played</li>
    <li>The share of people who come back</li>
  </ul>
  <p>Ads are disabled during this trial, so these are all that matters now. In other words, I had to improve two things by design: <strong>“people who open it start playing” and “they come back.”</strong></p>

  <h2 class="rv" id="s2">I narrowed it to one thing to press</h2>
  <p>The title had six: Play, Menu, Ranking, Encyclopedia, Words and Info. To a first-timer, they all look equally heavy. So I rearranged it:</p>
  <ul>
    <li>One large “<strong>Play</strong>.”</li>
    <li>“Menu” as a thin second option.</li>
    <li>Ranking, Encyclopedia, Words and Info are folded into a thin row below.</li>
  </ul>
  <p>The ranking and the encyclopedia are “reasons to come back,” but <strong>they are not the first step the first time</strong>. That was my judgment.</p>

  <h2 class="rv" id="s3">From the second visit, show that there is more</h2>
  <p>The title shows the high score and how much of the encyclopedia is filled. But <strong>not to first-timers</strong>, because showing 0 points and 0 kinds means nothing.</p>

  <h2 class="rv" id="s4">Inside the portal, saves vanish</h2>
  <p>The portal runs the game in an <code>iframe</code> on a different domain. In some browsers, saving to the device (<code>localStorage</code>) is blocked inside it, and <strong>high scores and the encyclopedia vanish every time</strong>.</p>
  <p>If the portal provides a storage shelf (CrazyGames’ Data Module), I save there; if not, I keep it on the device as before. The portal’s part arrives later, so it keeps looking until it is found.</p>
  <p>The way I verified it was to plug in a fake storage shelf. When the shelf exists, it writes there and not to the device. Even in an environment where saving to the device throws an error, it starts and can be played.</p>

  <h2 class="rv" id="s5">Leave the screen and it stops</h2>
  <p>Until then, when you moved to another tab, <strong>only the deadline kept advancing</strong>, and it was already over when you came back. Now, when sent to the background, it pauses and the sound stops too. I actually fired the event for the screen being hidden (<code>visibilitychange</code>) and confirmed that it stops, that the score does not move after 1.5 seconds, and that it resumes.</p>

  <h2 class="rv" id="s6">What I verified</h2>
  <ul>
    <li>In all 14 languages, it fits on an iPhone SE screen.</li>
    <li>Across 7 screens × 3 languages, the 9:16 aspect ratio does not break.</li>
    <li>Two full playthroughs (163 moves in Japanese, 263 in English) at 60 fps with 0 errors.</li>
  </ul>

  <h2 class="rv" id="s7">What I learned</h2>
  <blockquote>What a first-timer needs is not choices but a first step.</blockquote>
  <ul>
    <li><strong>“A reason to come back” and “the first step” are different things.</strong> The ranking and the encyclopedia have value, but they are not what a first-timer presses first.</li>
    <li><strong>Saving may be unavailable depending on where it runs.</strong> That it worked on my machine does not guarantee it works inside a frame.</li>
    <li><strong>Design what happens when someone leaves the screen.</strong> It is easy to build assuming people are watching all the time.</li>
  </ul>
  <p class="note">This article is written from my commit record (September 7, 2026). The portal’s review conditions are as stated in the commit. After this, the game was rejected in review (<a href="/en/notes/crazygames/" hreflang="en" lang="en">Rejected by CrazyGames</a>).</p>
'''))

pairs.append(make('sushi-measure',
 '“The pile settles at 89%” was wrong: my measurement was what was wrong',
 'While rebalancing a merge puzzle I found my earlier measurement had counted falling pieces. Three causes: a size ladder going backward, a pit-shaped tub, and pieces falling through the floor. The numbers before and after.',
 'My measurement was wrong',
 'Development log of Sushi Stack / October 2026',
 '''  <p><a href="/en/works/" hreflang="en" lang="en">Sushi Stack</a> is a falling-block puzzle where you bump the same toppings together to merge them and grow them until the tub is full. While adjusting balance, I realized <strong>my own measurement result had been wrong</strong>. What was wrong, how I found it, and how I fixed it are written with the numbers in my commits.</p>
  <p class="note">The numbers in this article are as of September 7, 2026. After this, the sizes of the pieces were scaled by 0.8 across the board, and changed again on September 10 (the kinds of falling pieces and the shape of the tub) (written in <a href="/notes/anago/" hreflang="ja" lang="ja">the conger eel article</a>, in Japanese). They differ from today’s numbers.</p>

  <h2 class="rv" id="s1">“It settles at 89%” was wrong</h2>
  <p>My first measurement said “the pile settles at 89% of the tub’s height.” That would mean you can stack without overflowing and never lose.</p>
  <p>When I measured again, this was <strong>an illusion from counting the falling piece</strong>. The real pile kept rising. But it rose so slowly that <strong>even after dropping 240 pieces, only a third of the tub was filled</strong>. “A game you cannot lose” did not mean safe. It meant <strong>the pile does not grow enough to lose</strong>.</p>

  <h2 class="rv" id="s2">Three causes</h2>
  <p>The commit splits the causes into three. Each was confirmed by measurement before I removed it.</p>
  <h3>1. The size ladder went backward in three places</h3>
  <p>When I lined up the sizes by the radius of a circle of the same area (equivalent radius), in three places the merged piece was smaller than the one before.</p>
  <ul>
    <li>Tamago was smaller than shari</li>
    <li>Otoro was smaller than uni</li>
    <li>Anago was smaller than otoro</li>
  </ul>
  <p>Merging produced a smaller piece than before. On the busiest path, “shari → tamago,” <strong>more than half of what I dropped vanished on the spot</strong>. So I rebuilt it as <strong>a monotonically increasing ladder</strong> with a size ratio of 1.19.</p>
  <h3>2. The pieces were too small for the tub</h3>
  <p>I had used the 9:16 portrait tub directly as the drop area, so it was <strong>a vertical pit</strong> rather than a real sushi tub. I made the tub shallow enough to fit in the lower half of the screen, and drew a noren curtain (with the game name) and a plank wall in the empty space above. The deadline (past it, you lose) became the rim of the tub itself.</p>
  <h3>3. Big pieces fell through the floor</h3>
  <p>The physical thickness of the walls and floor was only 12, the same as how it looked, so heavier pieces <strong>tunneled</strong> through the single plank and fell out of the tub. I made the thickness 80, and also rounded the position for pieces born from a merge that sink into a wall. I also added a cleanup for spilled pieces (<code>sweepStrays</code>).</p>

  <h2 class="rv" id="s3">The numbers after the fix</h2>
  <div class="scroll rv"><table>
    <tr><th>What I measured</th><th class="n">Before</th><th class="n">After</th></tr>
    <tr><td>How full the tub is after dropping 240</td><td class="n">about a third</td><td class="n">—</td></tr>
    <tr><td>Drops until game over</td><td class="n">not reached</td><td class="n">385 (rank: journeyman)</td></tr>
    <tr><td>Score (same conditions)</td><td class="n">7,298</td><td class="n">10,658</td></tr>
  </table></div>
  <p>The pile moves up and down in front of the rim and opens up at once with a big merge. The tension this kind of game should have appeared. The score rose because the pieces that had been falling through and vanishing came back. I verified that 9:16 holds from iPhone SE to 15 Pro Max, in landscape and on desktop, that there is no overflow or errors, and that 60 fps holds with a full tub.</p>

  <h2 class="rv" id="s4">What I learned</h2>
  <blockquote>What you measure is not necessarily what you want to know.</blockquote>
  <p>The first “89%” counted the falling piece, so it was not measuring “the height of the pile.” I want to record that <strong>when a measurement looks too good</strong>, it is better to doubt what is being counted than the number itself. After the fix, I measured the numbers again with the same method as <a href="/notes/anago/" hreflang="ja" lang="ja">the conger eel article</a> (hundreds of auto-played games).</p>
  <p class="note">The numbers in this article come from my commit record (September 7, 2026).</p>
'''))
