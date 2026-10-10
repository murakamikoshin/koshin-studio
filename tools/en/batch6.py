pairs.append(make('claude-vs-gemini-api',
 'Claude API vs Gemini API by official numbers: small-model prices, web search, spend limits and deprecation',
 'The Claude API and Gemini API compared using only official pages as of October 8, 2026: small-model pricing, web search cost and call limits, spend limits and how they stop, deprecation notice, and what I could not confirm.',
 'Claude API vs Gemini API',
 'A comparison / October 2026',
 '''  <p>Torecadash moved from the Claude API to the Gemini API (the story is in <a href="/en/notes/gemini-migration/" hreflang="en" lang="en">the migration article</a>). Here I line up the official numbers I did not write down then. I use <strong>only what the official pages say</strong>. I did not compare accuracy or speed, because there are no official numbers for them.</p>
  <p class="note">All numbers were seen on official pages on October 8, 2026. Prices and limits change. Check each item’s source again before you use it. What the official pages did not say is written as “could not confirm,” not as “does not exist.”</p>

  <h2 class="rv" id="s1">Quick table: look up what you want to know</h2>
  <p>The answers first. Details and sources are in the sections below.</p>
  <div class="scroll rv"><table>
    <tr><th>What you want to know</th><th>What the official pages say</th></tr>
    <tr><td>Which is cheapest?</td><td>In the current official tables, Claude Haiku 5.5 (input $0.10, output $0.50) and Gemini 2.5 Flash-Lite ($0.10, $0.40) are in a similar range. Gemini 3.1 Flash-Lite is $0.25 and $1.50.</td></tr>
    <tr><td>I want a setting to cap the number of searches</td><td>Claude has <code>max_uses</code>. For Gemini, I did not find a setting for the number of searches on the official pages.</td></tr>
    <tr><td>I want to use search for free</td><td>Gemini’s paid tier includes up to 5,000 requests a month free. But on the free tier, search is not available for 3.1 Flash-Lite. Claude is $10 per 1,000 searches.</td></tr>
    <tr><td>I want a spend cap that stops me</td><td>Both have a monthly spend limit and stop until the 1st of next month when reached (Claude from Start at $500, Gemini from Tier 1 at $250).</td></tr>
    <tr><td>I want a promise about deprecation notice</td><td>Claude states “at least 60 days before retirement.” For Gemini I could not confirm a promise of days; the date in the table is the “earliest shutdown date.”</td></tr>
    <tr><td>I want official numbers for Japanese</td><td>Claude’s multilingual page has them (93.5% of English for Haiku 4.5). For Gemini I could not confirm.</td></tr>
  </table></div>
  <p class="note">The numbers in the table were confirmed on official pages on October 8, 2026. This is not a conclusion about which to choose; it is an organization of “what is officially written.”</p>

  <h2 class="rv" id="s2">Prices of small models</h2>
  <p>US dollars per million tokens. The model I used before the migration was Claude Haiku 4.5.</p>
  <div class="scroll rv"><table>
    <tr><th>Model</th><th>Input</th><th>Output</th></tr>
    <tr><td>Claude Haiku 4.5</td><td>$1</td><td>$5</td></tr>
    <tr><td>Claude Haiku 5.5</td><td>$0.10 (prompts up to 100,000 tokens) / $0.50 (beyond that)</td><td>$0.50 (up to 100,000) / $2.50 (beyond that)</td></tr>
    <tr><td>Gemini 3.1 Flash-Lite (where I moved)</td><td>$0.25 (text, image, video) / $0.50 (audio)</td><td>$1.50</td></tr>
    <tr><td>Gemini 3.5 Flash-Lite</td><td>$0.30</td><td>$2.50</td></tr>
    <tr><td>Gemini 2.5 Flash-Lite</td><td>$0.10</td><td>$0.40</td></tr>
  </table></div>
  <ul>
    <li>In the current official price tables, <strong>Haiku 5.5 is cheaper than Gemini 3.1 Flash-Lite</strong>. What I compared against when migrating was Haiku 4.5, and I have not checked whether Haiku 5.5 was available then.</li>
    <li>Claude has batch (50% discount) and a cheap rate for cache reads. I could not confirm Gemini’s batch discount rate.</li>
    <li>The official pages say that from Claude 4.7 onward, a new tokenizer makes the same text about 30% more tokens. I could not confirm whether this applies to Haiku 5.5.</li>
  </ul>

  <h2 class="rv" id="s3">How web search works and what it costs</h2>
  <div class="scroll rv"><table>
    <tr><th></th><th>Claude</th><th>Gemini</th></tr>
    <tr><td>Price</td><td>$10 / 1,000 searches (plus normal token cost for the results)</td><td>Paid tier: up to 5,000 requests a month free, then $14 / 1,000 requests. On the free tier, search is not available for 3.1 Flash-Lite.</td></tr>
    <tr><td>How it is counted</td><td>Per search. Not charged on error.</td><td>For Gemini 3 models, per search query the model runs (multiple queries mean multiple charges).</td></tr>
    <tr><td>A setting to cap the count</td><td><strong>Yes</strong> (<code>max_uses</code>). Beyond it, the search result is a <code>max_uses_exceeded</code> error.</td><td>I <strong>did not find</strong> a setting to cap the count on the search page (I cannot say it does not exist).</td></tr>
    <tr><td>Domain restrictions</td><td>Allowed and blocked domains can be specified.</td><td>Could not confirm.</td></tr>
  </table></div>
  <p>The problem I wrote about in the migration article, “web search has no cap on the number of calls,” reads the same within what the official pages say. Nothing equivalent to Claude’s <code>max_uses</code> was written on Gemini’s search page. It is still possible that I just did not find it.</p>

  <h2 class="rv" id="s4">Limits and how they stop</h2>
  <p>This is close to my reason for migrating.</p>
  <div class="scroll rv"><table>
    <tr><th></th><th>Claude</th><th>Gemini</th></tr>
    <tr><td>Monthly spend limit</td><td>Start $500 / Build $1,000 / Scale $200,000</td><td>From Tier 1 $250 / Tier 2 $2,000 / Tier 3 $20,000</td></tr>
    <tr><td>When the limit is reached</td><td>HTTP 429 (<code>enforced_spend_limit_reached</code>). Stopped until 00:00 UTC on the 1st of next month.</td><td>All projects in the billing account stop until the 1st of next month.</td></tr>
    <tr><td>A limit you set lower yourself</td><td>Can be set (HTTP 400 when reached).</td><td>Can be set per project in AI Studio (an experimental feature; billing is reflected with a delay of about 10 minutes, so you can overshoot).</td></tr>
    <tr><td>Free tier</td><td>A small free credit for new accounts. I did not find a continuing free allowance.</td><td>Yes. 3.1 Flash-Lite tokens are free. But caching and search grounding are not available on the free tier.</td></tr>
    <tr><td>Per-minute limits for small models</td><td>Start: Haiku 4.5 / 5.5 both 1,000 requests per minute, 2 million input and 400,000 output tokens per minute.</td><td>No specific numbers in the documentation (you check in AI Studio).</td></tr>
  </table></div>
  <p>The migration article gives the reason as “I hit Anthropic’s usage limit and got an unplanned charge.” However, <strong>Claude’s official pages say it stops when the limit is reached, and I could not explain from the official pages how an unplanned charge arises</strong>. The account in that article comes from my own records, not backed by official documents.</p>

  <h2 class="rv" id="s5">How deprecation is announced</h2>
  <div class="scroll rv"><table>
    <tr><th></th><th>Claude</th><th>Gemini</th></tr>
    <tr><td>Notice promise</td><td>For released models, notice <strong>at least 60 days</strong> before retirement (by email and documentation).</td><td>It says “the exact shutdown date will be announced in advance,” but I could not confirm a promise of days. The date in the table is the “earliest shutdown date.”</td></tr>
    <tr><td>How it is written</td><td>“Not sooner than X” (it will not retire earlier than X).</td><td>A table of release date, shutdown date and recommended replacement.</td></tr>
    <tr><td>Examples</td><td>Haiku 3.5: about 2 months from announcement (2025-12-19) to retirement (2026-02-19). Haiku 4.5: not retired sooner than 2026-10-15.</td><td>3.1 Flash-Lite: released 2026-05-07, shutdown 2027-05-07 (12 months after release). 2.0 Flash: shutdown 2026-06-01.</td></tr>
  </table></div>
  <p>The shutdown date of <code>gemini-3.1-flash-lite</code>, which I chose, is also May 7, 2027 in the official table. It matches the migration article. On the other hand, the migration article’s <strong>“2.5 Flash-Lite is scheduled to be shut down on October 16”</strong> disagrees with the current official table (“no shutdown date announced”). I added a correction to that article.</p>

  <h2 class="rv" id="s6">Structured output, tool calling and Japanese</h2>
  <ul>
    <li><strong>Output in a specified JSON shape:</strong> Both support it. Claude says it “guarantees conformance to the schema.” Gemini says it supports “only some JSON schema features” and that “the meaning of values needs validation.”</li>
    <li><strong>Tool calling:</strong> Both support it. <strong>Using structured output together with tools such as search</strong> works only on Gemini 3 models and is described as a “preview feature.”</li>
    <li><strong>Japanese:</strong> Claude’s multilingual page has a relative score for Japanese with English as 100% (Haiku 4.5 is 93.5%). On the Gemini 3.1 Flash-Lite page I could not find an official statement on supported languages. That does not mean “Gemini’s Japanese is weak”; it means <strong>I could not compare using official numbers</strong>.</li>
  </ul>

  <h2 class="rv" id="s7">What I learned</h2>
  <blockquote>You cannot choose from a price table alone.</blockquote>
  <ul>
    <li><strong>Prices flip over time.</strong> The side that was cheaper at migration can be more expensive now.</li>
    <li><strong>Whether safety devices exist is outside the table.</strong> Caps on search calls, spend limits and how things stop (does it stop, or does billing continue) do not appear in a unit price table.</li>
    <li><strong>How deprecation is announced differs in whether there is a promise.</strong> Planning a switch is different when one side promises days and the other only shows the earliest date.</li>
  </ul>

  <h2 class="rv" id="s8">What I could not confirm</h2>
  <ul>
    <li>Specific per-minute and per-day limit numbers for Gemini’s free tier and each tier (the documentation has no numbers).</li>
    <li>Gemini’s batch discount rate.</li>
    <li>Whether Gemini’s search has a setting to cap the count (I only did not find it on the page, so I cannot say it does not exist).</li>
    <li>How many days before shutdown Gemini notifies, at minimum.</li>
    <li>An official statement on Gemini’s Japanese and a numeric comparison.</li>
    <li>An explicit statement that Claude Haiku 4.5 / 5.5 support the web search tool (the official pages tell you to check supported models with the API).</li>
    <li>Accuracy and speed comparisons (not obtainable from official primary sources, so I did not do them).</li>
  </ul>

  <h2 class="rv" id="s9">Sources (all checked on October 8, 2026)</h2>
  <ul class="plain">
    <li><a href="https://platform.claude.com/docs/en/about-claude/pricing" rel="noopener" target="_blank">Claude: pricing</a></li>
    <li><a href="https://platform.claude.com/docs/en/api/rate-limits" rel="noopener" target="_blank">Claude: rate limits and spend limits</a></li>
    <li><a href="https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool" rel="noopener" target="_blank">Claude: web search tool</a></li>
    <li><a href="https://platform.claude.com/docs/en/about-claude/model-deprecations" rel="noopener" target="_blank">Claude: model deprecations</a></li>
    <li><a href="https://platform.claude.com/docs/en/build-with-claude/structured-outputs" rel="noopener" target="_blank">Claude: structured outputs</a></li>
    <li><a href="https://platform.claude.com/docs/en/build-with-claude/multilingual-support" rel="noopener" target="_blank">Claude: multilingual support</a></li>
    <li><a href="https://ai.google.dev/gemini-api/docs/pricing" rel="noopener" target="_blank">Gemini: pricing</a></li>
    <li><a href="https://ai.google.dev/gemini-api/docs/rate-limits" rel="noopener" target="_blank">Gemini: rate limits</a></li>
    <li><a href="https://ai.google.dev/gemini-api/docs/billing" rel="noopener" target="_blank">Gemini: billing</a></li>
    <li><a href="https://ai.google.dev/gemini-api/docs/google-search" rel="noopener" target="_blank">Gemini: grounding with Google Search</a></li>
    <li><a href="https://ai.google.dev/gemini-api/docs/deprecations" rel="noopener" target="_blank">Gemini: model deprecations</a></li>
    <li><a href="https://ai.google.dev/gemini-api/docs/structured-output" rel="noopener" target="_blank">Gemini: structured output</a></li>
    <li><a href="https://ai.google.dev/gemini-api/docs/function-calling" rel="noopener" target="_blank">Gemini: function calling</a></li>
    <li><a href="https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite" rel="noopener" target="_blank">Gemini: 3.1 Flash-Lite</a></li>
  </ul>
  <p class="note">I read some of the official pages through summaries (the numbers have not been checked against the originals character by character). Always check the original text of the sources before deciding.</p>
'''))

pairs.append(make('gemini-migration',
 'Migrating from the Claude API to the Gemini API (gemini-3.1-flash-lite): 16 call sites into one function',
 'I moved an iOS app’s backend from Claude Haiku 4.5 to Gemini 3.1 Flash-Lite after an unplanned charge. How I chose the model by deprecation date, unified 16 calls, added a circuit breaker for web search, and a kill switch.',
 'Claude to Gemini migration',
 'Development log of Torecadash / October 2026',
 '''  <p>On the server side of my iOS app Torecadash, AI is used for things like deciding “which product an article is about.” On July 25, 2026, I <strong>fully migrated this AI from Anthropic’s Claude (Haiku 4.5) to Google’s Gemini (<code>gemini-3.1-flash-lite</code>)</strong>. What I decided, how I unified the calls, and what I added after the migration are written from my hand-over notes.</p>
  <p class="note">This site has a page for Torecadash (<a href="/en/works/" hreflang="en" lang="en">Works</a>). This is a development log. I do not write amounts of money.</p>

  <h2 class="rv" id="s1">What triggered it</h2>
  <p>According to my notes, the reason was that <strong>I reached Anthropic’s API usage limit and got an unplanned charge</strong>. Since then only Gemini has run, and I removed the Anthropic SDK and key from the code and from the secret store (Secret Manager). In a check on July 30, I confirmed there are 0 mentions of Anthropic in the code.</p>

  <h2 class="rv" id="s2">How I chose the model</h2>
  <p>I chose <code>gemini-3.1-flash-lite</code>. My notes also keep the reason for what I did not choose.</p>
  <ul>
    <li>Gemini 2.5 Flash-Lite, which is cheaper, was <strong>scheduled to be shut down on October 16, 2026</strong>, so I passed on it (according to my notes. When I reviewed the official deprecation list on October 8, 2026, this model showed “no shutdown date announced.” I have not confirmed whether the entry changed later).</li>
    <li>The shutdown date of the one I chose, <code>gemini-3.1-flash-lite</code>, is May 7, 2027. At the time of migration (July 25) that was still about nine and a half months away.</li>
  </ul>
  <p>If you choose only by price, it will be shut down soon and you migrate again. I added “when will it be shut down” to the selection criteria.</p>

  <h2 class="rv" id="s3">16 call sites into one function</h2>
  <p>There were 16 places that call AI (deciding the sales format, matching products, discovering listings and so on). I unified them to go through <strong>one function (<code>createGeminiInteraction</code>)</strong> at the top of <code>functions/index.js</code>. Inside it calls <code>client.interactions.create()</code> from <code>@google/genai</code>.</p>
  <p>Callers pass arguments close to the original Anthropic form (<code>system_instruction</code>, <code>max_output_tokens</code> in <code>generation_config</code>, <code>input</code>) as they are. What comes back is text (<code>output_text</code>). I made it a form where <strong>only the inside is swapped, with almost no rewriting of callers</strong>.</p>

  <h2 class="rv" id="s4">Web search had no “call count cap” setting</h2>
  <p>In four places (discovering listings, discovering sellers, a Rakuten Books lookup and a list-price lookup), the AI does a web search. With Gemini I use <code>tools: [{type: "google_search"}]</code> (grounding with Google Search).</p>
  <p>Here was a pitfall. Anthropic’s web search had <code>max_uses</code> (a cap on the number of searches), but <strong>Gemini has no equivalent setting</strong>, and the model searches as many times as it thinks necessary. My notes say: “the absence of this setting can itself be a cause of unexpected cost.”</p>
  <p>So the day after migration (July 26), I added <strong>a circuit breaker with a daily counter</strong> inside <code>createGeminiInteraction</code> (up to 300 calls a day). When the limit is reached, it returns an error to the caller. In price review, I designed this error to be excluded and kept distinct from “could not find the list price” (I wrote about that in <a href="/notes/fail-open/" hreflang="ja" lang="ja">another article</a>, in Japanese).</p>

  <h2 class="rv" id="s5">A switch to stop it</h2>
  <p>I added one more thing: <code>AI_CALLS_PAUSED</code>, <strong>a switch that stops all AI calls from one place</strong>. My notes include a reflection from July 25: “I thought I had stopped the calls, but they had not actually stopped, and the automatic job running every 10 minutes kept producing errors.” I decided that when the budget is about to be exceeded, I first set this to <code>true</code> and stop right away.</p>

  <h2 class="rv" id="s6">A note when adding new processing</h2>
  <p>Functions that call AI (Cloud Functions) must always have <code>secrets: ["GEMINI_API_KEY"]</code>. If you forget it, deployment succeeds and then it fails with a permission error.</p>

  <h2 class="rv" id="s7">What I have not verified</h2>
  <p>This article is written from the AI section of my hand-over notes. A before-and-after accuracy comparison of decisions is not part of the material. So I do not judge here whether Gemini is better or worse.</p>

  <h2 class="rv" id="s8">What I learned</h2>
  <blockquote>If you gather calls in one place, the place to stop them is one place too.</blockquote>
  <ul>
    <li><strong>Pass every call through one function.</strong> The migration, the safety limit and the stop switch can all live in that one place.</li>
    <li><strong>Count “there is no setting” as a risk.</strong> When you move to a service with no cap on call count, build the cap on your own side.</li>
    <li><strong>Check that the stop switch really stops.</strong> Thinking you stopped but not having stopped is the most expensive case.</li>
  </ul>
  <p class="note">This article is written from my hand-over notes (AI API information, July 25 and 26, 2026).</p>
'''))
