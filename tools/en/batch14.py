pairs.append(make('fake-products',
 'Splitting a “9-pack set” by contents created 80 fake products',
 'In a trading-card app, one real product had been split into its contents, creating 80 products that do not exist. How I stopped the entry point, restored 22 parents, detached 190 children, and removed the fakes with an audit to watch.',
 'Fake products from splitting',
 'Development log of Torecadash / October 2026',
 '''  <p>While inspecting the product list of my iOS app Torecadash, I found <strong>80 products that do not exist</strong> around the Pokémon Card “30th CELEBRATION Card Set.” There are only 9 official products. The other 80 were fake products created as a result of <strong>splitting a “9-pack set” by its contents</strong>. What happened and how I fixed it are written from my hand-over notes.</p>
  <p class="note">This is a development log of the app.</p>

  <h2 class="rv" id="s1">The 9-pack set was “one product”</h2>
  <p>The lottery for a “card set (9-pack set)” that a shop offers is <strong>one product</strong>. In the catalog it is registered as a “9-kinds set” (10,800 yen). But the app’s product matching (the step that splits an article mentioning several products into one per product) split this title <strong>by contents</strong>. Names of the nine contents, such as “Mega Mewtwo X” and “Nyabby,” were each treated as a separate product.</p>
  <p>As a result, this is what it looked like:</p>
  <div class="scroll rv"><table>
    <tr><th>State</th><th class="n">Count</th></tr>
    <tr><td>Original articles that had been split (parents) were hidden</td><td class="n">22</td></tr>
    <tr><td>Articles created by splitting (children)</td><td class="n">190 (63 visible)</td></tr>
    <tr><td>Fake products created for the children</td><td class="n">80</td></tr>
  </table></div>
  <p>On screen, one lottery appeared as if it were separate lotteries for each content item.</p>

  <h2 class="rv" id="s2">The fix: stop the entry, then put things back</h2>
  <ol>
    <li><strong>Do not split at the entry.</strong> A title of the form “card set” + “N kinds” is not split.</li>
    <li><strong>Restore the parents.</strong> I put the 22 hidden parents back onto the “9-kinds set” product. How I restored each differed (5 back to visible, 3 treated as duplicates because the same shop already had a visible 9-pack set, 13 whose deadline had passed, and 1 with no deadline).</li>
    <li><strong>Detach the children.</strong> I marked the 190 children with a “wrong split” flag (<code>hiddenByWrongSplit</code>), hid them, and removed their link to a product.</li>
    <li><strong>Delete the fake products.</strong> I deleted the 80. Before deleting, I confirmed that nothing referenced them and saved the original contents as a backup.</li>
  </ol>
  <p>There is an exception. A listing like “Starter Set ex Nyaoha / Hogator / Quaxly 3-kinds set,” where <strong>the title spells out all the product names</strong>, is still split as before. What I learned this time is that an “N-kinds set” is sold as one product.</p>

  <h2 class="rv" id="s3">Other fake products found in the same inspection</h2>
  <ul>
    <li><strong>Things that are not cards.</strong> Products for apparel, figures, tournaments and music CDs had been created between September 3 and October 3. I added a gate at the entry for names that are not cards (<code>looksLikeNonCardMerchOrEventName</code>) and confirmed 0 false hits across the whole catalog. I deleted 25.</li>
    <li><strong>Single cards.</strong> I deleted a total of 30 single-card products that came from Snkrdunk listings. Some of those single cards had a “list price.” Having a list price turned out not to be proof of an official cross-check. The proof is <code>imageIsOfficial</code>.</li>
    <li><strong>A product combining three packs.</strong> I deleted one unofficial product that lined up several set names. Its 49 linked articles were all expired.</li>
  </ul>
  <p>To watch for these, I added an audit (<code>audit_catalog_clean.js</code>). Each time it counts five things: single-card products, products with several set names, mismatches between an application page’s title and the product, drift of list prices copied from products, and products with non-card names.</p>

  <h2 class="rv" id="s4">What I learned</h2>
  <blockquote>A “split” process needs a “do not split” condition.</blockquote>
  <ul>
    <li><strong>Splitting one product into several multiplies fake products.</strong> Splitting should happen only after checking “is it really several products.”</li>
    <li><strong>Count references before deleting.</strong> I deleted only after confirming zero references and a saved backup.</li>
    <li><strong>Stop fake products at both the entry and the contents.</strong> An entry gate alone leaves what already exists. An audit counts what remains.</li>
  </ul>
  <p class="note">This article is written from my hand-over notes (§272) (October 7, 2026). The counts are as written in the notes.</p>
  <div class="rule" style="margin:40px 0 22px"></div>
  <p class="eyebrow">Related</p>
  <ul class="plain">
    <li><a href="/en/notes/torecadash-9set/" hreflang="en" lang="en">The “9-pack set” was nine different products</a> — the matching record for the same product</li>
    <li><a href="/en/notes/dup-zero/" hreflang="en" lang="en">I counted duplicates as zero, but the audit found 112 pairs</a> — another record from the same day</li>
  </ul>
'''))

pairs.append(make('qiita-post-interval',
 'Measuring Qiita’s “posting too frequently” limit: a new account could not create another article for about 30 minutes',
 'After publishing an article on Qiita, creating the next one showed “posting too frequently.” I measured how long a brand-new account waits by checking the editor every 5 minutes. Two measurements both came out near 30 minutes; the third was lost.',
 'Measuring Qiita’s post interval',
 'This site / October 2026',
 '''  <p>I published summaries of this site’s articles on Qiita. But when I tried to create a second one right after the first, the new-article screen would not open and said “posting too frequently.” <strong>How long you have to wait</strong> did not seem to be written officially, so I measured it.</p>
  <p class="note">I measured only <strong>this one new account (registered on October 8, 2026)</strong>. This does not mean it is a general specification of Qiita.</p>

  <h2 class="rv" id="s1">How I measured</h2>
  <ul>
    <li>I record the time an article was published (for the first one, “14:19” from Qiita’s notification, which is only to the minute).</li>
    <li>Then <strong>about every 5 minutes</strong>, I open the “new article” screen in a logged-in browser. If it opens it is “allowed”; if I am redirected to the trend page it is “blocked.” I record this with the time.</li>
    <li>When it opens, I publish the next article right away and take the same record again.</li>
    <li>I did not do anything like slipping past the limit by posting. I only checked whether the screen opens.</li>
  </ul>

  <h2 class="rv" id="s2">Results</h2>
  <div class="scroll rv"><table>
    <tr><th>Interval</th><th>Previous article published at</th><th>Last blocked check</th><th>First allowed check</th><th>Publish until it opens</th></tr>
    <tr><td>1st → 2nd</td><td>14:19</td><td>14:46:34 (blocked)</td><td>14:51:50 (allowed)</td><td>about 27.6 to 32.8 min</td></tr>
    <tr><td>2nd → 3rd</td><td>14:52:36</td><td>15:19:03 (blocked)</td><td>15:24:18 (allowed)</td><td>about 26.5 to 31.7 min</td></tr>
    <tr><td>3rd → 4th</td><td>15:24:59</td><td>15:30:29 (blocked)</td><td>16:10:02 (allowed)</td><td><strong>5.5 to 45.1 min (unknown)</strong></td></tr>
  </table></div>
  <ul>
    <li><strong>The first and second were both around 30 minutes.</strong> The range exists because I only checked every 5 minutes. “It opened” somewhere between the last block and the first allow.</li>
    <li><strong>The third is unusable data.</strong> The next check after 15:30:29 is not in the record until 16:10:02. The checks were not running for about 40 minutes (I have not confirmed why; the computer may have been asleep). The opening time is somewhere in there, and the interval is unknown.</li>
    <li>The wording “posting too frequently” could not be captured by the automatic check (I was only sent back to the trend page, and no message appeared). It is the wording I saw on my own screen.</li>
  </ul>

  <h2 class="rv" id="s3">What I know and what I do not</h2>
  <blockquote>On this new account, I could not create the next article for about 30 minutes after publishing.</blockquote>
  <ul>
    <li>Two measurements agreed at about 30 minutes. But it is only two. It is not a number that lets me say “exactly 30 minutes.”</li>
    <li>A personal blog from 2018 reported “you cannot post or edit for about 30 minutes after posting.” It is close to this measurement. But it is another person’s report from another time, and I do not know whether it is the same mechanism.</li>
    <li><strong>I do not know whether it is a limit only for newly registered accounts or applies to ordinary ones too.</strong> I measured only one account.</li>
    <li>I also do not know whether the limit changes with the number of posts (from which post it gets longer), because the third was lost.</li>
  </ul>

  <h2 class="rv" id="s4">Reflections on the measurement</h2>
  <ul>
    <li><strong>The check interval was 5 minutes.</strong> A 5-minute range was left each time. Checking every minute would shrink it.</li>
    <li><strong>I did not notice that the checks had stopped.</strong> I needed a mechanism to warn me when there is no check record for a set time.</li>
    <li><strong>The first publish time was only to the minute.</strong> I could take seconds only from the second onward, where I recorded the time myself.</li>
  </ul>

  <h2 class="rv" id="s5">What I could not confirm</h2>
  <ul>
    <li>Qiita’s official rule on posting interval (I looked, but found no public description).</li>
    <li>The interval for the third (the record is missing).</li>
    <li>The same measurement on other accounts.</li>
    <li>Whether the limit changes with the age of the account or the number of posts.</li>
  </ul>
'''))
