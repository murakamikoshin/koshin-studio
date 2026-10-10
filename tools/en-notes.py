import json, sys
sys.path.insert(0, 'tools')
from importlib import import_module
mk = import_module('make-en-note'.replace('-', '_')) if False else None
exec(open('tools/make-en-note.py', encoding='utf8').read())
pairs = json.load(open('data/en.json', encoding='utf8'))
pairs = [p for p in pairs if p['ja'] == '/notes/itms-91064/' or not p['ja'].startswith('/notes/')]   # 手で書いた1本と、記事以外の対は残す

pairs.append(make('review-info-needed',
 'App Store review sent “Guideline 2.1 Information Needed”: the six things Apple asked for',
 'My first App Store submission did not get a rejection but a request for more information (Guideline 2.1). The six things Apple asked for, and how they connect to what I had already fixed.',
 'Guideline 2.1 Information Needed',
 'Development log of Torecadash / October 2026',
 '''  <p>I submitted my iOS app, Torecadash, to App Review for the first time on October 6 (4:24 a.m. Pacific time). What came back was not a rejection but an email saying <strong>“additional information is needed.”</strong> This is a summary of what Apple asked for.</p>
  <p class="note">I do not write the review result in this article. I will add it once there is one.</p>

  <h2 class="rv" id="s1">What arrived</h2>
  <p>It was Guideline 2.1 “Information Needed — New App Submissions.” The reason given was that <strong>this developer account has little review history</strong>. Apple wanted more information so it could understand the app well enough to finish the review. It was not a finding that the app is defective.</p>

  <h2 class="rv" id="s2">The six things requested</h2>
  <p>I was asked to reply in App Store Connect and also to put the same content in the “App Review Information” notes field. The six items (summarized):</p>
  <ol>
    <li><strong>A screen recording on a physical device.</strong> On a device with the latest OS, starting from launching the app, show the normal flow of use. If there are account registration, login and deletion, user-generated content (including the report and block mechanisms), or paid features, include those too.</li>
    <li><strong>The purpose of the app and its intended users.</strong> What problem it solves and what value it provides.</li>
    <li><strong>How to start using the main features.</strong> If login is required, the credentials or sample files.</li>
    <li><strong>A list of the external services used.</strong> Data providers, authentication, payments, AI, and so on.</li>
    <li><strong>Differences in features or content by region.</strong> If there are none, say that it works the same in every region.</li>
    <li><strong>Proof of rights</strong> if the app deals with a highly regulated field or third-party protected material.</li>
  </ol>
  <p>The email also included a list of common problems: bugs and crashes on a real device, a demo account if login is required, screenshots that show actual use, submitting in-app purchase products together with the app, and so on.</p>

  <h2 class="rv" id="s3">How it connects to what I fixed before</h2>
  <p>The first item mentions account deletion and reporting user-generated content. These overlap with what I had <a href="/notes/torecadash-review/" hreflang="ja" lang="ja">fixed before submitting</a> (Japanese). Account deletion removed map posts too and revoked the Sign in with Apple token. Posts had a banned-word check and a report-review queue. I had also already drafted the review notes: the main features work without login, where deletion is, reporting of posts, and what Pro includes.</p>
  <p>So <strong>the mechanisms existed, but I lacked something to show them.</strong> The screen recording in item 1 is exactly that.</p>

  <h2 class="rv" id="s4">What I learned</h2>
  <blockquote>In a first review, you have to show the reviewer that it works.</blockquote>
  <ul>
    <li>The recording on a physical device is explicitly required to start <strong>from launching the app</strong>.</li>
    <li>Put <strong>the same content</strong> in the notes field as in the reply. You can reuse it for the next submission.</li>
    <li>Before submitting, check that you can answer the six questions yourself. If the answers come quickly, you save one round trip with review.</li>
  </ul>
  <p class="note">This article summarizes the email I received. It does not include the submission ID or other identifiers.</p>
'''))

pairs.append(make('xcode152-sdk',
 'Firebase 12 does not work with Xcode 15.2 (Swift 6.0 required): why I pinned Firebase 11.4.0 and AdMob 11.5.0',
 'On an old Mac stuck on Xcode 15.2, newer Firebase and AdMob SDKs fail to build. Which versions break, which versions I pinned, and what to do about AdMob class names. Notes from July 2026.',
 'Firebase 12 and Xcode 15.2',
 'Development log of Torecadash / October 2026',
 '''  <p>I build my iOS app, Torecadash, on a 2017 Mac with Xcode 15.2. In this environment, <strong>newer versions of the Firebase iOS SDK and the AdMob (Google Mobile Ads) SDK do not build</strong>. This is which version breaks and which version I pinned, written from my hand-over notes (July 2026).</p>
  <p class="note">The version numbers are as of July 2026. The situation may be different with the latest versions today.</p>

  <h2 class="rv" id="s1">The environment</h2>
  <ul>
    <li>Mac: MacBook Pro 13-inch (2017). macOS tops out at Ventura (13.7.8) and cannot go higher.</li>
    <li>Xcode: 15.2, the latest that runs on Ventura. It officially supports up to iOS 17.2.</li>
    <li>My iPhone runs iOS 26, so <strong>I cannot install onto the device from the local Xcode with a cable</strong>. The only way to test on the device is to build with Xcode Cloud and distribute through TestFlight.</li>
    <li>Locally I only check that <code>xcodebuild</code> compiles. SwiftUI previews almost never render on this Mac.</li>
  </ul>

  <h2 class="rv" id="s2">Firebase: pinned to 11.4.0</h2>
  <p>The newer the Firebase iOS SDK, the newer the Xcode it requires. My notes recorded this:</p>
  <div class="scroll rv"><table>
    <tr><th>Firebase version</th><th>What happens</th></tr>
    <tr><td>12.0.0 and later</td><td>Requires a Swift 6.0 toolchain (Xcode 16.2 or later)</td></tr>
    <tr><td>11.12.0 and later</td><td>Also requires Xcode 16.2</td></tr>
    <tr><td>11.5.0 onward</td><td>A bug in <code>FirebaseDataEncoder.swift</code> (Firebase issue #15029)</td></tr>
    <tr><td><strong>11.4.0</strong></td><td><strong>Confirmed to work reliably</strong></td></tr>
  </table></div>
  <p>So I set the Swift Package Manager rule to <strong>Exact Version 11.4.0</strong>. Xcode keeps suggesting the latest version, and I do not follow it.</p>
  <p>One point is easy to get confused about. Xcode Cloud (the cloud build) runs the latest Xcode, but <strong>the pinned setting is kept as it is</strong>, so cloud builds succeed without trouble. If you pin to suit the old local Xcode, the same version also builds on the newer Xcode in the cloud.</p>

  <h2 class="rv" id="s3">AdMob: pinned to 11.5.0</h2>
  <p>For the same reason, I <strong>pinned the AdMob SDK</strong> (<code>swift-package-manager-google-mobile-ads</code>) <strong>to 11.5.0</strong> (July 22, 2026).</p>
  <ul>
    <li><strong>11.6.0 and later:</strong> The SDK depends on Apple's <code>MarketplaceKit</code>, which <strong>requires Xcode 15.3 or later</strong>. On Xcode 15.2 the build fails at link time with <code>Undefined symbols</code> errors related to MarketplaceKit.</li>
    <li><strong>A caveat for 11.5.0:</strong> This version does not yet have the new Swift-style class names (<code>BannerView</code>, <code>RewardedAd</code>, and so on). You have to use the old names with the <code>GAD</code> prefix (<code>GADBannerView</code>, <code>GADRewardedAd</code>, <code>GADRequest</code>, <code>GADMobileAds</code>, <code>GADFullScreenContentDelegate</code>, and so on).</li>
  </ul>
  <p>When I upgrade Xcode and raise the version later, <strong>I will need to rewrite the class names, not only change the version number</strong>. I left that in my notes.</p>

  <h2 class="rv" id="s4">What I would tell someone in the same situation</h2>
  <ol>
    <li><strong>Pin with “Exact Version.”</strong> With an “up to next” rule, Xcode picks a newer version you cannot use.</li>
    <li><strong>Write down “from which version it breaks,” with version numbers.</strong> A few months later, when you have forgotten why you pinned, the reason is still there.</li>
    <li><strong>The limits of your local environment can be relaxed in the cloud.</strong> You can keep testing on a real device through Xcode Cloud and TestFlight even with an old Mac. (The free tier has a monthly limit, though. See <a href="/notes/torecadash-ci/" hreflang="ja" lang="ja">builds not arriving in TestFlight</a>, in Japanese.)</li>
  </ol>

  <h2 class="rv" id="s5">What I have not verified</h2>
  <p>The version numbers in this article come from my July 2026 notes. I have not checked what the Xcode 15.2 constraints look like with versions released since. The “breaks from this version” boundaries are <strong>the build results at that time</strong>.</p>
'''))

pairs.append(make('torecadash-watchdog',
 'iOS app freezes and is killed (0x8BADF00D): a SwiftUI computed property ran on every redraw',
 'An iOS app was force-quit by the watchdog (0x8BADF00D). A SwiftUI computed property re-filtered and re-sorted 951 articles on the main thread on every body evaluation. How I found it and changed it, and what is not verified.',
 '0x8BADF00D in SwiftUI',
 'Development log of Torecadash / October 2026',
 '''  <p>For my iOS app, Torecadash, I received a report: “the app crashes a lot.” Reading the device log, I found that <strong>the app froze and was force-quit by the OS</strong>. The cause was that it recounted 951 articles every time the screen was redrawn. This is written from my commit history.</p>

  <h2 class="rv" id="s1">What the log showed</h2>
  <p>The hang log from the device had the exit code <code>0x8BADF00D</code> and the line <code>Failed to terminate gracefully after 5.0s</code>. It means <strong>the OS (the watchdog) killed an app that did not respond within 5 seconds</strong>. The main thread was stuck in processing that went through <code>NSKeyedArchiver</code>. The device was also hot (Thermal State: serious), so work that normally finishes instantly took more than 5 seconds.</p>

  <h2 class="rv" id="s2">The real cause</h2>
  <p>What froze was the list of product articles in the “Following” tab, in a case with 951 articles.</p>
  <p>The article list (<code>articles</code>) was <strong>just a computed property</strong>. SwiftUI evaluates the view (<code>body</code>) many times, even when the article data has not changed. Each time, <strong>it redid four filters, a transformation and a sort over 951 articles on the main thread</strong>.</p>
  <p>Normally this finishes instantly, so you do not notice. Only when the device slows down from heat does it exceed 5 seconds and get killed.</p>

  <h2 class="rv" id="s3">The fix</h2>
  <p>I changed it to recompute on a background thread <strong>only when something actually changes</strong>: the article data, the receive mode, or the sort option. The result goes into a state for display (<code>displayArticles</code>, <code>@State</code>), so the main thread is no longer blocked.</p>
  <pre><code>// (Illustration only. Not the actual code.)
// Before: every time body is evaluated
var articles: [Article] { fetched.filter…filter…map…sorted }

// After: compute in the background only on change, and keep the result
@State var displayArticles: [Article] = []
// recompute when fetchedArticles / receiveMode / sortOption change</code></pre>

  <h2 class="rv" id="s4">What I have not verified</h2>
  <p>The only verification recorded in the commit is that <code>xcodebuild</code> succeeded (BUILD SUCCEEDED). <strong>There is no record that the freeze is gone on a real device.</strong> A hot device is hard to reproduce, so it is not easy to check. In this article I write “I identified the cause and changed the approach,” not “I fixed it.”</p>

  <h2 class="rv" id="s5">What I learned</h2>
  <blockquote>Work that is instant on a normal day stops the app on a slow day.</blockquote>
  <p>Computed properties are easy to write. But if you put one where it runs on every redraw, it gets slower in proportion to the amount of data. 951 items is not a small number. The obvious lesson, “decide where to put things by how often they are called,” came from a real device log.</p>
  <p class="note">This article was written from the commit record (October 5, 2026).</p>
'''))

pairs.append(make('u2028',
 'Python splitlines() breaks JSONL: the culprit was U+2028, an invisible line separator',
 'A JSONL file read with Python splitlines() broke because two of 7,247 records contained U+2028 (LINE SEPARATOR). Why it happens, the numbers, and the one-line fix: split on the newline character only.',
 'splitlines() and U+2028',
 'Development log of the Anime Type Quiz / October 2026',
 '''  <p>While building the data for the <a href="/en/works/shindananime/">Anime Type Quiz</a>, I fixed a bug where <strong>the JSON broke</strong>. The cause was <code>splitlines()</code>, a perfectly ordinary function.</p>

  <h2 class="rv" id="s1">What broke</h2>
  <p>The quiz data comes from Filmarks and is stored in <code>data/filmarks_works.jsonl</code>. JSONL puts <strong>one JSON object per line</strong>, and you read it by splitting into lines and passing each one to <code>json.loads</code>. In Python I had first written:</p>
  <pre><code>for line in path.read_text(encoding='utf-8').splitlines():
    r = json.loads(line)</code></pre>
  <p>But when a synopsis contained <strong>U+2028 (LINE SEPARATOR)</strong>, that line was split in the middle, and <code>json.loads</code> was handed JSON that ended inside a string, and failed.</p>

  <h2 class="rv" id="s2">What U+2028 is</h2>
  <p>U+2028 is a Unicode character meaning “line separator.” It looks almost like a newline. In JSON, it is <strong>valid</strong> to put it raw inside a string, and the writing side (<code>json.dumps(..., ensure_ascii=False)</code>) outputs it as is.</p>
  <p>The problem was on the reading side. Python’s <code>str.splitlines()</code> splits not only on <code>\\n</code> but also on <strong>Unicode line boundaries</strong> such as U+2028. <code>split('\\n')</code> splits only on <code>\\n</code>.</p>
  <pre><code>s = json.dumps({"a": "x\\u2028y"}, ensure_ascii=False)
len(s.splitlines())   # 2  (one line splits in two)
len(s.split('\\n'))    # 1</code></pre>
  <p>Passing each half to <code>json.loads</code> raises <code>Unterminated string</code>. The short example above reproduces exactly that.</p>

  <h2 class="rv" id="s3">The numbers in the real data</h2>
  <p>I recounted both ways on the current data file.</p>
  <div class="scroll rv"><table>
    <tr><th>How it is split</th><th class="n">Number of lines</th></tr>
    <tr><td><code>split('\\n')</code> (real newlines only)</td><td class="n">7,247</td></tr>
    <tr><td><code>splitlines()</code></td><td class="n">7,255</td></tr>
  </table></div>
  <p>The difference is <strong>8</strong>. Counting U+2028 in the file gave exactly <strong>8</strong>, in the lines of <strong>2 works</strong>. Two works out of 7,247, under 0.03%, were enough to make the whole file unreadable.</p>

  <h2 class="rv" id="s4">The fix</h2>
  <p>One line:</p>
  <pre><code>- for line in path.read_text(encoding='utf-8').splitlines():
+ for line in path.read_text(encoding='utf-8').split('\\n'):</code></pre>
  <p>I left the reason in a comment so that my future self would not be puzzled: when making JSONL, the only line separator is <code>\\n</code>, so reading should split on <code>\\n</code> only.</p>

  <h2 class="rv" id="s5">Why it is hard to notice</h2>
  <ul>
    <li><strong>You cannot see it.</strong> Depending on the editor, U+2028 looks like a newline or a space. Staring at the synopsis will not find it.</li>
    <li><strong>It is rare.</strong> 2 of 7,247 works. While you test with a small sample, it may never show up. It is the kind of bug that appears only once you have fetched everything.</li>
    <li><strong>The writer is correct.</strong> Nothing written is wrong as JSON. What broke it was the reader’s assumption about what a “line” is.</li>
  </ul>

  <h2 class="rv" id="s6">One more fix from the same day</h2>
  <p>The same commit fixed another bug caused by <strong>characters that look alike but are different</strong>. When matching titles, Annict’s <code>＜物語＞</code> (full-width angle brackets) and Filmarks’s <code>〈物語〉</code> (Japanese angle brackets) did not match even though they were the same work. NFKC normalization turns the full-width <code>＜＞</code> into half-width, but <code>〈〉</code> stays as it is, so I removed both from the comparison string.</p>
  <p>Both are the same lesson: characters are not always what they look like.</p>

  <h2 class="rv" id="s7">What I learned</h2>
  <blockquote>A function I used “for newlines” had a wider idea of newlines than I assumed.</blockquote>
  <p>When reading JSONL, do not use <code>splitlines()</code>. Split on the character the writer used as the separator (<code>\\n</code>), or use <code>for line in f:</code>, which splits only on <code>\\n</code>. I am writing it here for the next time the data grows.</p>
  <p class="note">The numbers in this article come from recounting the data file on October 7, 2026.</p>
'''))

pairs.append(make('torecadash-ci',
 'No builds arriving in TestFlight: I had used up the 25 free Xcode Cloud hours (my first diagnosis was wrong)',
 'New builds stopped appearing in TestFlight. My first diagnosis, “[ci skip] is blocking builds,” was wrong; the real cause was a workflow that built the iOS app on every commit and burned the free 25 hours a month. The numbers and the fix.',
 'Xcode Cloud free hours ran out',
 'Development log of Torecadash / October 2026',
 '''  <p>While developing my iOS app, Torecadash, I hit a bug: “new builds are not arriving in TestFlight.” The first cause I came up with was <strong>wrong</strong>. This is where I went wrong, how I noticed, and what the real cause was, written from the numbers in my hand-over notes and commits.</p>

  <h2 class="rv" id="s1">The first diagnosis: “[ci skip] is the cause”</h2>
  <p>On September 2, I got a report: “there have been no builds since 9/1.” My first diagnosis was that <strong><code>[ci skip]</code> in my commit messages was stopping the builds</strong>. I had been adding it to documentation-only changes so they would not use up Xcode Cloud’s free tier (25 hours a month). Along with the diagnosis, I even wrote a rule: “do not use <code>[ci skip]</code>.”</p>

  <h2 class="rv" id="s2">The timeline did not fit</h2>
  <p>Looking at Xcode Cloud in App Store Connect, it said:</p>
  <blockquote>You have reached your usage limit. The limit resets on September 8, your renewal date.</blockquote>
  <p>Usage over the last 30 days was <strong>493 builds, 28 hours 14 minutes</strong>. The free tier is 25 hours a month, so it was used up.</p>
  <p>What showed my first diagnosis was wrong was the <strong>timeline</strong>. Only three commits carried <code>[ci skip]</code>, all on September 2. The builds had stopped on September 1. <strong>The cause came after the effect</strong>, so it could not be the cause. Worse, the rule I made was counterproductive when the quota was short.</p>

  <h2 class="rv" id="s3">Why did it run 493 times?</h2>
  <p>The workflow’s start condition was “any file changed.” Counting commits over the last 30 days:</p>
  <div class="scroll rv"><table>
    <tr><th>Last 30 days</th><th class="n">Count</th></tr>
    <tr><td>All commits</td><td class="n">1,146</td></tr>
    <tr><td>of which touched the iOS app</td><td class="n">219 (19%)</td></tr>
    <tr><td>Builds run by Xcode Cloud</td><td class="n">493 (3.4 minutes each on average)</td></tr>
  </table></div>
  <p>So <strong>80% of the time, I was building the whole iOS app although only server code or documents had changed</strong>. On top of that, “Clean build” was checked, so every build skipped the cache and took as long as possible.</p>

  <h2 class="rv" id="s4">The fix is a setting, not a marker</h2>
  <ol>
    <li>Change the start condition to custom file and folder rules, limited to the iOS app folder and the Xcode project.</li>
    <li>Uncheck “Clean build.”</li>
  </ol>
  <p>My hand-over notes estimate this takes builds from 493 to about 94, and time from 28 hours to about 5.4 hours a month. That is a calculated estimate, not a measurement after the change.</p>

  <h2 class="rv" id="s5">What I learned</h2>
  <blockquote>Check whether a cause explains the facts, using the timeline, before settling on it.</blockquote>
  <p>My first diagnosis stopped at the first plausible cause. Something that happened after the effect cannot be its cause. This check takes a minute if done before announcing the diagnosis. In my hand-over notes (§183) I left a warning that “this diagnosis was wrong,” as a record.</p>
  <p class="note">The numbers in this article come from my hand-over notes and the commit record (September 2, 2026).</p>
'''))


pairs.append(make('apple-signin',
 'Firebase Auth: force-quitting the app created anonymous accounts in bulk (waiting for currentUser to restore)',
 'Users said the app asked for Sign in with Apple again after being killed. 17 of 19 Firebase users were throwaway anonymous accounts. Cause: checking currentUser synchronously at launch. Fix: addStateDidChangeListener.',
 'Firebase Auth anonymous accounts',
 'Development log of Torecadash / October 2026',
 '''  <p>In my iOS app, Torecadash, a user reported: “once I kill the app, it asks me to sign in with Apple again.” When I looked, <strong>17 of the 19 users were anonymous accounts that had been created and thrown away</strong>. The cause was how I checked, with a single line, right after launch. This is from my hand-over notes and the commit record (August 14, 2026).</p>

  <h2 class="rv" id="s1">The symptom</h2>
  <p>It only happened when the app was <strong>fully quit by swiping it away and then launched again</strong>. Leaving to the home screen and coming back did not trigger it.</p>

  <h2 class="rv" id="s2">Looking at the real data</h2>
  <p>I opened the Authentication user list in the Firebase console:</p>
  <div class="scroll rv"><table>
    <tr><th>Users</th><th class="n">Count</th></tr>
    <tr><td>Total</td><td class="n">19</td></tr>
    <tr><td>Signed in with Apple</td><td class="n">2</td></tr>
    <tr><td>Throwaway anonymous accounts (created and last signed in on the same day)</td><td class="n">17</td></tr>
  </table></div>
  <p>Ten of the 17 were from August 13 alone. A new anonymous account was being created every time the app started again.</p>

  <h2 class="rv" id="s3">Cause: reading something that had not been restored yet, synchronously</h2>
  <p>Right after launch, the app checked <code>Auth.auth().currentUser</code> on the spot. If nobody was signed in, it created a new anonymous account.</p>
  <p>But as Firebase’s own documentation says, <code>currentUser</code> is <strong>not guaranteed to be restored from the Keychain yet</strong> right after launch. If restoration is late, it looks as if nobody is signed in. Then, just before the existing Apple sign-in state is restored, <strong>the app creates a new anonymous account</strong>. It is a race condition.</p>
  <p>The race only happens on a cold start. When the app returns from the background, Firebase is not initialized again, so it does not happen. That matches the report exactly.</p>

  <h2 class="rv" id="s4">The fix</h2>
  <ul>
    <li><strong>Stop checking synchronously.</strong> The moment restoration is known to be finished is the <strong>first call</strong> of the state listener (<code>addStateDidChangeListener</code>). I made the decision only at that point.</li>
    <li><strong>Add one safety net.</strong> At launch, the account-management side (<code>AccountStore</code>) now compares against the real server-side state with <code>reload()</code>, corrects any mismatch with its local record, and leaves a diagnostic log.</li>
  </ul>

  <h2 class="rv" id="s5">One more thing I found</h2>
  <p>During the investigation I learned that Sign in with Apple <strong>had never succeeded on a real device</strong> since I implemented it on August 7.</p>
  <ul>
    <li>The first error was that the sign-in provider configuration could not be found. The Apple provider had never been enabled in the Firebase console.</li>
    <li>After I enabled it, a new error said the credential was already linked. An attempt made before enabling had actually gone halfway through, and the Apple ID was already linked to this device’s anonymous account. The app showed this as an error, but in effect the user was signed in. I changed it to <strong>treat it as success</strong>.</li>
  </ul>

  <h2 class="rv" id="s6">What I have not verified</h2>
  <p>This is an iOS-side change, so I cannot confirm the effect on a real device until it reaches TestFlight. My notes say the top priority is to check that the Apple link survives repeated force-quits and relaunches. There is no result in the record at the time of writing.</p>

  <h2 class="rv" id="s7">What I learned</h2>
  <blockquote>The state right after launch is not settled yet.</blockquote>
  <ul>
    <li><strong>“Not restored yet” is different from “none.”</strong> If you decide “none” without waiting, you create a new one.</li>
    <li><strong>Symptoms show up in real data.</strong> Opening the console showed 17 throwaway accounts. I would have had a hard time finding this by reproducing “the sign-in disappears” on my own device.</li>
    <li><strong>“Never succeeded” shows up as a missing success record.</strong> The clue was that none of the registered accounts had any Apple information.</li>
  </ul>
  <p class="note">This article summarizes my hand-over notes and the commit record (August 14, 2026).</p>
'''))

pairs.append(make('logo-pop',
 'A canvas becomes twice as large on Retina: inset:0 does not stretch it (a bug in a logo that bursts when you tap it)',
 'Burst particles came out of the wrong place on high-DPI screens. A canvas with only inset:0 keeps its pixel size, so on a 2x display it was 2x larger in CSS. Measured numbers at 1x, 2x and 3x, and the fix.',
 'Canvas size on Retina',
 'Development log of Koshin Studio / October 2026',
 '''  <p>The top of this site has a large logo. When you tap a letter, it pops and particles scatter. After I rebuilt the logo with my own typeface, I was told “the particles come out of a strange place, not from the letter” and “it is still shifted to the right.” It took <strong>three stages</strong> to fix. Here are the cause and how I found it, with measured numbers.</p>

  <h2 class="rv" id="s1">Rebuilding the logo with my own typeface</h2>
  <p>The old logo was set in Latin letters built on a Mincho skeleton. I replaced it with my own typeface, Koshin Pop (rounded Latin letterforms drawn from scratch). The font is under the SIL Open Font License 1.1, which allows use in a logo.</p>
  <p>I extract the outlines of the <strong>nine letters K O S H I N T U D</strong> from the font file and turn them into SVG paths (<code>tools/logotype_pop.py</code>). The logo is delivered as a picture, so the site does not ship the font file. The font has several shapes for the same letter (base, pop1, pop2), so I lined up three combinations and picked the one with the best rhythm.</p>

  <h2 class="rv" id="s2">Stage 1: after a tap, the letter did not return to its place</h2>
  <p>I recorded positions over time after a tap. The letters <strong>did not return to where they started</strong>.</p>
  <div class="scroll rv"><table>
    <tr><th>Letter</th><th>Center before</th><th>2 s after</th></tr>
    <tr><td>K (top left)</td><td>(327, 306)</td><td>(320, 313)</td></tr>
    <tr><td>S (bottom left)</td><td>(331, 442)</td><td>(323, 435)</td></tr>
  </table></div>
  <p>That is about 7 px off. A <code>matrix(1, 0, 0, 1, -46, -42)</code> was left over: the scale was back to 1 but the position offset stayed.</p>
  <p><strong>Cause:</strong> the animation library (GSAP) rewrote the position that was already set on the letter’s SVG <code>&lt;g&gt;</code> (<code>transform="translate(x,0)"</code>) using its own calculation, and part of that correction remained afterward.</p>
  <p><strong>Fix:</strong> I split the element into a layer that holds the position (outer <code>&lt;g transform&gt;</code>) and a layer that moves (inner <code>&lt;g class="ks-ch"&gt;</code>), and switched the motion to the browser’s Web Animations (when it ends, the effect disappears and the original state returns). I checked all 12 letters: the centers did not move, and the transform after the animation went back to <code>none</code>.</p>

  <h2 class="rv" id="s3">Stage 2: “it is still to the right”</h2>
  <p>After that fix I was still told the animation sat to the right. My measurement said particles started within 2 to 13 px of the letter’s center. <strong>What I measured and what was seen disagreed.</strong></p>
  <p>I had measured on a <strong>1x display</strong>, counting particle positions in screen coordinates. When I measured on 2x (Retina) and 3x (phone) displays, the CSS size of the particle canvas (<code>#burst</code>) was wrong.</p>
  <div class="scroll rv"><table>
    <tr><th>Display</th><th class="n">Viewport width</th><th class="n">Canvas width (before)</th><th class="n">(after)</th></tr>
    <tr><td>1280 px, 1x</td><td class="n">1280</td><td class="n">1280</td><td class="n">1280</td></tr>
    <tr><td>1440 px, 2x</td><td class="n">1440</td><td class="n"><strong>2880</strong></td><td class="n">1440</td></tr>
    <tr><td>390 px, 3x (phone)</td><td class="n">390</td><td class="n"><strong>780</strong></td><td class="n">390</td></tr>
  </table></div>
  <p><strong>Cause:</strong> I positioned the canvas with <code>inset:0</code> in CSS, but <strong>a replaced element such as a canvas does not stretch to fill with <code>inset:0</code> alone</strong>. It keeps its intrinsic size (its pixel count). On a 2x display the pixel count is doubled, so the CSS size doubled too, and particles appeared at twice the coordinates (toward the lower right). On a 1x display the sizes are equal, so you cannot notice.</p>
  <p><strong>Fix:</strong> set width and height to <code>100%</code> explicitly. After the fix, the canvas matched the viewport on every pixel ratio.</p>

  <h2 class="rv" id="s4">Stage 3: emit from the letter itself</h2>
  <p>Finally I was asked whether particles could come from the letter itself. Until then they came from the <strong>center</strong> of the letter’s box, so for a letter with an empty middle like “O” they seemed to come from nowhere.</p>
  <p>I now pick points <strong>along the outline</strong> of the letter’s path (<code>getPointAtLength</code>), take their on-screen positions, and send particles outward from the letter’s center with some scatter. The bottom row is drawn as “letter = mask”, so I look up the path inside the mask that the rect refers to. In the captures, “O” emits from around its ring and “U” along its shape.</p>

  <h2 class="rv" id="s5">What I learned</h2>
  <blockquote>When measured numbers and what people see disagree, suspect the conditions of the measurement.</blockquote>
  <ul>
    <li><strong>The viewer’s screen is not yours.</strong> I measured only on a 1x display and judged “the offset is small.” On a 2x display the particles came out at twice the position.</li>
    <li><strong>Measure in the space people look at.</strong> I counted logical coordinates, so the on-screen offset was never visible to me.</li>
    <li><strong>Measure the state after an animation ends, too.</strong> That letters did not return was invisible while I only watched the motion.</li>
    <li><strong>Keep position and motion on different layers.</strong> If one element holds both, one overwrites the other.</li>
  </ul>
  <p class="note">The numbers come from operating this site’s top page in a real browser (Chrome) on October 8, 2026. I have not confirmed the fix on an actual Retina device; I reproduced 2x and 3x pixel ratios with browser settings.</p>
'''))

json.dump(pairs, open('data/en.json', 'w', encoding='utf8'), ensure_ascii=False, indent=2)
print(len(pairs))
