pairs.append(make('comment-services',
 'Comparing comment systems for static sites by their official information: giscus, utterances, Disqus, Remark42 and more',
 'Comment systems for static sites (giscus, utterances, Disqus, Remark42, Cusdis, Staticman, Commento) compared using only official pages and repositories as of October 8, 2026: storage, ads and tracking, maintenance status, and what I could not confirm.',
 'Comment systems compared',
 'A comparison / October 2026',
 '''  <p>The comment box on this site is giscus. It is set up so that nothing connects to an outside site until you press “Open comments.” What are the other options like? I read <strong>only the official descriptions and official repositories</strong> and lined them up. I have actually used only giscus.</p>
  <p class="note">This is what I confirmed on October 8, 2026. The state of services changes. Check the sources before you use one.</p>

  <h2 class="rv" id="s1">Quick table: look up what you want to know</h2>
  <p>The answers first. Details and sources are in the sections below.</p>
  <div class="scroll rv"><table>
    <tr><th>What you want to know</th><th>What the official pages say</th></tr>
    <tr><td>I do not want ads or tracking</td><td>giscus, utterances, Cusdis and Remark42 say officially that there is no tracking or advertising. The free version of Disqus is run on ads.</td></tr>
    <tr><td>I do not want to run a server</td><td>giscus (GitHub Discussions) and utterances (GitHub Issues) store on GitHub. Both need a GitHub account to write.</td></tr>
    <tr><td>I want people to write without logging in</td><td>Cusdis needs no login but has ended. Remark42 can allow anonymous posts by configuration (you need your own server).</td></tr>
    <tr><td>I only want ones that are still maintained</td><td>Recent updates were confirmed for giscus (2026-05-26) and Remark42 (2026-09-14). utterances, Staticman and Commento are suspected stopped; Cusdis has ended.</td></tr>
    <tr><td>I want a Japanese UI</td><td>giscus and Remark42 have Japanese translation files. I could not confirm for the others.</td></tr>
  </table></div>
  <p class="note">The contents of the table were confirmed on official pages and repositories on October 8, 2026. “Suspected stopped” is not an official announcement of closure.</p>

  <h2 class="rv" id="s2">Where it is stored and who can write</h2>
  <div class="scroll rv"><table>
    <tr><th>Service</th><th>Storage</th><th>What you need to post</th><th>Cost</th></tr>
    <tr><td>giscus</td><td>GitHub Discussions</td><td>A GitHub account</td><td>Free (MIT)</td></tr>
    <tr><td>utterances</td><td>GitHub Issues</td><td>A GitHub account</td><td>Free (MIT)</td></tr>
    <tr><td>Disqus</td><td>Disqus’s servers (I could not confirm an explicit statement on storage)</td><td>Could not confirm</td><td>The free version has ads. Paid Plus is $12 to $35 a month depending on monthly pageviews ($12 up to 100,000, $20 up to 350,000, $35 up to 900,000; official help, 2025-04-30 version).</td></tr>
    <tr><td>Remark42</td><td>A server you run yourself (built-in data store)</td><td>Various logins (Google, GitHub and so on), email; anonymous by configuration</td><td>Free (MIT). Server cost is yours.</td></tr>
    <tr><td>Cusdis</td><td>A server you run yourself (PostgreSQL and others)</td><td>No login needed</td><td>OSS (GPL-3.0)</td></tr>
    <tr><td>Staticman</td><td>Saved as files in a GitHub or GitLab repository</td><td>Could not confirm</td><td>OSS (MIT). You run it yourself.</td></tr>
    <tr><td>Commento</td><td>A server you run yourself (PostgreSQL)</td><td>Supports login and SSO. I could not confirm anonymous posting.</td><td>The self-hosted version is free software. The README says the cloud version is not offered for free.</td></tr>
  </table></div>

  <h2 class="rv" id="s3">What the official pages say about ads and tracking</h2>
  <ul>
    <li><strong>giscus and utterances:</strong> Both state officially that there is no tracking and no ads. Note that opening giscus comments connects to GitHub, and how GitHub handles that is a separate matter.</li>
    <li><strong>Disqus:</strong> The free version is run on ads. The official help describes cookies recording visits to advertisers’ sites, cookie IDs being shared with advertising partners and affiliates, and wording such as “sold or shared.” <strong>Adopting it seems to carry the heaviest burden for consent management and ad-related notices</strong> (I did not look into how this is treated under its official policy).</li>
    <li><strong>Cusdis:</strong> The README says it uses no cookies at all.</li>
    <li><strong>Remark42 and Commento:</strong> The official pages say they do not track users and have no ads.</li>
  </ul>

  <h2 class="rv" id="s4">Is it still maintained?</h2>
  <p>You use a comment system for a long time once it is in. Whether it has stopped matters.</p>
  <div class="scroll rv"><table>
    <tr><th>Service</th><th>What I confirmed on the official repository or page</th><th>Assessment</th></tr>
    <tr><td>giscus</td><td>No formal release numbers; it states “rolling-release.” The latest change was 2026-05-26. A warning that features may break because of changes on the GitHub side.</td><td>Active</td></tr>
    <tr><td>Remark42</td><td>Latest is v1.17.1 (2026-09-14).</td><td>Active</td></tr>
    <tr><td>utterances</td><td>The last commit was 2022-02-12. No releases. Not archived.</td><td><strong>Suspected stopped</strong> (no announcement of closure)</td></tr>
    <tr><td>Staticman</td><td>The last commit was 2020-07-06. The only release is v1.0.0 from 2016.</td><td><strong>Suspected stopped</strong> (I could not confirm an official announcement)</td></tr>
    <tr><td>Commento</td><td>The last tag is v1.8.0 (2020-04) and the last commit 2021-02-28. The cloud site and its description pages all return 404.</td><td><strong>Suspected stopped</strong> (I could not confirm an official notice)</td></tr>
    <tr><td>Cusdis</td><td>The repository was archived on 2026-07-17. The README says “deprecated.”</td><td><strong>Ended</strong>, it is fair to say</td></tr>
    <tr><td>Disqus</td><td>The service is running (the pricing help article is dated 2025-04-30).</td><td>Running</td></tr>
  </table></div>

  <h2 class="rv" id="s5">Japanese, spam protection and weight</h2>
  <ul>
    <li><strong>Japanese UI:</strong> giscus and Remark42 have Japanese translation files. I could not confirm for the others.</li>
    <li><strong>Spam protection:</strong> giscus only says comments can be moderated on GitHub, with no spam protection described. Disqus has a spam filter even in the basic free version. With Cusdis, the admin approves before display.</li>
    <li><strong>Weight:</strong> Only Cusdis gave a number (about 5 kb gzipped). giscus has an option to delay loading comments. utterances says it is “lightweight” but gives no number.</li>
  </ul>

  <h2 class="rv" id="s6">What I paid attention to with giscus on this site</h2>
  <p>The giscus documentation says there is no tracking or ads. Even so, on this site <strong>nothing connects to giscus or GitHub until you press “Open comments.”</strong> That is so people who only read generate no extra traffic and the page loads lighter. The conditions for connecting are written on <a href="/en/privacy/" hreflang="en" lang="en">the privacy page</a>.</p>

  <h2 class="rv" id="s7">What I learned</h2>
  <blockquote>More than a feature table, ask “is it still going?”</blockquote>
  <ul>
    <li><strong>More services have stopped than I expected.</strong> Of the 7 I looked at, 4 (Cusdis, Staticman, Commento and utterances) had ended or were suspected stopped.</li>
    <li><strong>Free services sometimes make you pay with ads or tracking.</strong> The free version of Disqus is an example.</li>
    <li><strong>Systems that need a GitHub account to write</strong> (giscus, utterances) narrow your readers to people close to development. Depending on who reads your articles, that may not fit.</li>
  </ul>

  <h2 class="rv" id="s8">What I could not confirm</h2>
  <ul>
    <li>Disqus: the official pricing page (its body is drawn by JavaScript and could not be read; the prices are from the help article), requirements for commenters’ accounts, a Japanese UI, an explicit statement on storage, load weight.</li>
    <li>utterances: a Japanese UI, spam protection.</li>
    <li>Cusdis: cloud-version pricing, the list of supported languages.</li>
    <li>Staticman: requirements for commenters, spam protection such as Akismet, statements on ads or tracking, an official announcement of closure.</li>
    <li>Commento: the state and price of the cloud version, a Japanese UI, an official notice of closure.</li>
    <li>How a comment section is treated under AdSense’s official policy (I did not look into it).</li>
  </ul>

  <h2 class="rv" id="s9">Sources (all checked on October 8, 2026)</h2>
  <ul class="plain">
    <li><a href="https://github.com/giscus/giscus" rel="noopener" target="_blank">giscus: repository</a></li>
    <li><a href="https://giscus.app/ja" rel="noopener" target="_blank">giscus: official configuration page</a></li>
    <li><a href="https://github.com/utterance/utterances" rel="noopener" target="_blank">utterances: repository</a></li>
    <li><a href="https://help.disqus.com/en/articles/1717110-comments-pricing-and-plans" rel="noopener" target="_blank">Disqus: pricing and plans (help)</a></li>
    <li><a href="https://help.disqus.com/en/articles/1717103-disqus-privacy-faq" rel="noopener" target="_blank">Disqus: privacy FAQ</a></li>
    <li><a href="https://github.com/umputun/remark42" rel="noopener" target="_blank">Remark42: repository</a></li>
    <li><a href="https://github.com/djyde/cusdis" rel="noopener" target="_blank">Cusdis: repository</a></li>
    <li><a href="https://github.com/eduardoboucas/staticman" rel="noopener" target="_blank">Staticman: repository</a></li>
    <li><a href="https://gitlab.com/commento/commento" rel="noopener" target="_blank">Commento: repository (GitLab)</a></li>
  </ul>
  <p class="note">I read some of the official pages through summaries. The Disqus prices were checked against the original text of the official help article (2025-04-30 version) on 2026-10-08. Disqus’s own pricing page is drawn by JavaScript and could not be read, so please check current prices there.</p>
'''))

pairs.append(make('ios-sdk-compare',
 'Comparing iOS ad SDKs and Firebase by their official information: AdMob, AppLovin MAX, LevelPlay and Supabase',
 'iOS ad SDKs (AdMob, AppLovin MAX, LevelPlay) plus Firebase and Supabase compared using only official pages as of October 8, 2026: payouts, privacy requirements, minimum Xcode and iOS, free tiers, and what I could not confirm.',
 'iOS ad SDKs compared',
 'A comparison / October 2026',
 '''  <p>For my iOS app Torecadash, I pinned Firebase to 11.4.0 and AdMob to 11.5.0 to suit Xcode 15.2 on an old Mac (<a href="/en/notes/xcode152-sdk/" hreflang="en" lang="en">that article</a>). The app was also rejected once for ITMS-91064 (<a href="/en/notes/itms-91064/" hreflang="en" lang="en">that article</a>). Here I line up the surrounding options I could not look into at the time, using <strong>official pages only</strong>. I have actually used only AdMob and Firebase. I have not used the others.</p>
  <p class="note">This is what I confirmed on October 8, 2026. SDK versions and requirements change quickly. Check the sources before you use them.</p>

  <h2 class="rv" id="s1">Quick table: look up what you want to know</h2>
  <p>The answers first. The numbers and sources are in the sections below.</p>
  <div class="scroll rv"><table>
    <tr><th>What you want to know</th><th>What the official pages say</th></tr>
    <tr><td>Which versions work on an old Xcode</td><td>AdMob 11.6.0 and later needs Xcode 15.3 or later. Firebase 11.12.0 and later needs Xcode 16.2, and 12.0.0 and later needs Swift 6.0 (official release notes).</td></tr>
    <tr><td>Minimum payout</td><td>AdMob: at least $100 in USD (official table). AppLovin: no amount in the official FAQ; payment is for the previous month on the 15th of the next. LevelPlay and Meta: could not confirm.</td></tr>
    <tr><td>I want to use several ad networks</td><td>AdMob, AppLovin MAX and LevelPlay have mediation. The AdMob integration guide lists 24 networks.</td></tr>
    <tr><td>I want to keep using Firebase with CocoaPods</td><td>Firebase states that in October 2026 it stops publishing new versions to CocoaPods. SPM is recommended.</td></tr>
    <tr><td>I want server-side processing for free</td><td>On Firebase Spark, Cloud Functions is not available (Blaze only). On Supabase’s free plan, a project pauses after one week without activity.</td></tr>
  </table></div>
  <p class="note">The contents of the table were confirmed on official pages on October 8, 2026. SDK requirements can disagree between pages, so check with your own build as well.</p>

  <h2 class="rv" id="s2">Ad SDKs: how they work and payments</h2>
  <div class="scroll rv"><table>
    <tr><th>SDK</th><th>How it works</th><th>Minimum payout</th></tr>
    <tr><td>Google AdMob</td><td>Has mediation (serving from several ad networks). The iOS integration guide lists 24 networks including AppLovin, ironSource, Meta Audience Network and Unity Ads.</td><td>Payments in USD have a <strong>minimum of $100</strong> (official table). The value differs by currency.</td></tr>
    <tr><td>AppLovin MAX</td><td>A mediation platform.</td><td>No specific amount in the official FAQ (you check it on the dashboard). Payment is for the previous month on the 15th of the next (NET15).</td></tr>
    <tr><td>Unity LevelPlay (ironSource)</td><td>LevelPlay ads and mediation. Adapters are separate packages.</td><td>Could not confirm.</td></tr>
    <tr><td>Meta Audience Network</td><td>A standalone ad network. Listed as a mediation target in AdMob.</td><td>Could not confirm.</td></tr>
  </table></div>
  <p><strong>For Meta Audience Network, I could not confirm either an official announcement of closure or a statement that it continues.</strong> Whether you can newly adopt it now cannot be settled from official primary sources.</p>

  <h2 class="rv" id="s3">iOS privacy requirements</h2>
  <ul>
    <li><strong>Apple’s rule (common to all):</strong> if <code>NSPrivacyTracking</code> is true, <code>NSPrivacyTrackingDomains</code> needs a list of domains. If the user has not allowed ATT (tracking permission), connections to those domains <strong>fail and the app receives an error</strong>, according to Apple’s documentation. This matches what happened in the ITMS-91064 article.</li>
    <li><strong>AdMob:</strong> asks for ATT before loading ads (SDK 7.64.0 and later). Privacy manifest support is from 11.2.0 (2024-03-14). <strong>I could not find an official list of tracking domains on AdMob’s pages</strong> (I cannot say it does not exist).</li>
    <li><strong>AppLovin MAX:</strong> 12.4.1 and later supports privacy manifests. Each connected network also has a required version (AdMob 11.2.0 or later, Meta 6.15.0 or later, Unity Ads 4.10.0 or later).</li>
    <li><strong>Meta:</strong> the Audience Network SDK has an iOS privacy manifest and recommends updating to 6.15.0. The domains are pre-filled and it does not recommend adding them by hand.</li>
    <li><strong>LevelPlay:</strong> I could not confirm any description of ATT or privacy manifests on the integration pages I read.</li>
  </ul>

  <h2 class="rv" id="s4">Minimum Xcode and iOS, and how to install</h2>
  <div class="scroll rv"><table>
    <tr><th>SDK</th><th>Minimum requirements</th><th>Installation</th></tr>
    <tr><td>AdMob</td><td>Latest is 13.11.0 (2026-09-29). The release notes say a minimum of Xcode 26.2 (from 13.4.0). <strong>But the quick start says “Xcode 16.0 or later” and “iOS 13.0 or later,” so pages disagree.</strong></td><td>SPM (recommended), CocoaPods, manual</td></tr>
    <tr><td>Firebase</td><td>Latest is 13.0.0 (2026-10-07). Minimum Xcode 26.2, iOS 15.0. Xcode 16.2 is required from 11.12.0, and Swift 6.0 from 12.0.0.</td><td>SPM is recommended. <strong>It states that in October 2026 it stops publishing new versions to CocoaPods.</strong></td></tr>
    <tr><td>AppLovin MAX</td><td>iOS 12.0 or later, Xcode 15 or later (integration page).</td><td>CocoaPods, SPM, manual. With SPM, use SPM for the SDK and all adapters (mixing causes version conflicts).</td></tr>
    <tr><td>LevelPlay</td><td>The integration page says iOS 12+ and Xcode 15.4+. Another page (for Unity) says iOS 13+ and Xcode 16+ (from a search summary). Pages disagree.</td><td>CocoaPods, SPM (9.3.0 or later), manual</td></tr>
  </table></div>
  <p>This table also confirms why Torecadash pinned its versions. The official release notes say AdMob 11.6.0 depends on MarketplaceKit and needs Xcode 15.3 or later, and Firebase 11.12.0 and later needs Xcode 16.2. This matched my article.</p>

  <h2 class="rv" id="s5">Analytics and backend: Firebase and Supabase free tiers</h2>
  <div class="scroll rv"><table>
    <tr><th>Service</th><th>What the official pages say</th></tr>
    <tr><td>Firebase (Spark)</td><td>Firestore: 1 GiB storage, 50,000 reads a day, 20,000 writes a day, 20,000 deletes a day. Authentication: 50,000 monthly active users (phone auth not available). Cloud Functions: not available on Spark (paid Blaze only). Analytics and Cloud Messaging: no numeric limit (free).</td></tr>
    <tr><td>Supabase (free)</td><td>50,000 monthly active users, 500 MB database, 1 GB file storage, 5 GB egress. Up to 2 active projects. <strong>Free projects pause after one week without activity.</strong></td></tr>
  </table></div>

  <h2 class="rv" id="s6">What I learned</h2>
  <blockquote>In an environment that cannot keep up with the latest version, the “minimum requirements” table matters most.</blockquote>
  <ul>
    <li><strong>SDK requirements can disagree between pages.</strong> Both AdMob and LevelPlay had different numbers in the release notes and the setup guides. You have to look at both and confirm with your own build.</li>
    <li><strong>Privacy settings happen outside the SDK.</strong> If you set <code>NSPrivacyTracking</code> to true, you also write the domains. That is Apple’s rule, not a difference between SDKs.</li>
    <li><strong>Look at how a free tier stops first.</strong> Supabase pauses with no activity. Firebase Spark cannot use Functions.</li>
  </ul>

  <h2 class="rv" id="s7">What I could not confirm</h2>
  <ul>
    <li>Minimum payouts for LevelPlay and Meta Audience Network.</li>
    <li>Meta Audience Network’s availability (closed or continuing), minimum Xcode and iOS, SPM support, and current version.</li>
    <li>AppLovin’s specific minimum payout amount, and the latest MAX SDK version (the release-notes URL would not open).</li>
    <li>An official list of tracking domains for AdMob, within what I could access.</li>
    <li>The <code>FirebaseDataEncoder</code> bug from Firebase 11.5.0 (as my article says, I confirmed it with my own build and could not find an official record).</li>
    <li>The contents of supabase-swift’s privacy manifest.</li>
    <li>Comparisons of accuracy or revenue (I did not do them, because there are no official numbers).</li>
  </ul>

  <h2 class="rv" id="s8">Sources (all checked on October 8, 2026)</h2>
  <ul class="plain">
    <li><a href="https://developers.google.com/admob/ios/rel-notes" rel="noopener" target="_blank">AdMob: iOS release notes</a></li>
    <li><a href="https://developers.google.com/admob/ios/quick-start" rel="noopener" target="_blank">AdMob: iOS quick start</a></li>
    <li><a href="https://developers.google.com/admob/ios/mediation" rel="noopener" target="_blank">AdMob: mediation</a></li>
    <li><a href="https://developers.google.com/admob/ios/privacy" rel="noopener" target="_blank">AdMob: privacy</a></li>
    <li><a href="https://support.google.com/admob/answer/2772208?hl=en" rel="noopener" target="_blank">AdMob: payment thresholds</a></li>
    <li><a href="https://firebase.google.com/support/release-notes/ios" rel="noopener" target="_blank">Firebase: iOS release notes</a></li>
    <li><a href="https://firebase.google.com/docs/ios/installation-methods" rel="noopener" target="_blank">Firebase: installation methods</a></li>
    <li><a href="https://firebase.google.com/pricing" rel="noopener" target="_blank">Firebase: pricing</a></li>
    <li><a href="https://support.applovin.com/en/max/ios/overview/integration" rel="noopener" target="_blank">AppLovin: integration (iOS)</a></li>
    <li><a href="https://support.applovin.com/en/max/ios/overview/privacy-manifests" rel="noopener" target="_blank">AppLovin: privacy manifests</a></li>
    <li><a href="https://docs.unity.com/en-us/grow/levelplay/sdk/ios/sdk-integration" rel="noopener" target="_blank">Unity LevelPlay: iOS SDK integration</a></li>
    <li><a href="https://developer.apple.com/documentation/bundleresources/privacy-manifest-files" rel="noopener" target="_blank">Apple: privacy manifest files</a></li>
    <li><a href="https://supabase.com/pricing" rel="noopener" target="_blank">Supabase: pricing</a></li>
  </ul>
  <p class="note">I read some of the official pages through summaries (the numbers have not been checked against the originals character by character). Please review the original text before relying on them.</p>
'''))
