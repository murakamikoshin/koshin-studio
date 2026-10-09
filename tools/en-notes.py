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
json.dump(pairs, open('data/en.json', 'w', encoding='utf8'), ensure_ascii=False, indent=2)
print(len(pairs))
