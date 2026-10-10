pairs.append(make('anime-db',
 'From 16,177 titles to 6,091: how the anime quiz database was built by dropping over 60%',
 'The anime recommendation quiz picks from about 6,000 titles. Where they came from, the criterion used to cut 62.3% of 16,177 merged titles, what the survivors look like, and the biases of this method, with numbers.',
 'Building the anime database',
 'Development log of the Anime Type Diagnosis / October 2026',
 '''  <p>The <a href="/en/works/shindananime/" hreflang="en" lang="en">Hardcore Anime Type Diagnosis</a> picks your “one anime of fate” from <strong>a database of more than 6,000 titles</strong>. Where did these 6,000 come from, and how were they narrowed down? This is how the quiz’s data was built, from the repository’s commits and the current real numbers.</p>

  <h2 class="rv" id="s1">Three sources</h2>
  <ul>
    <li>The title list of <strong>Annict</strong> (an anime tracking service): 15,971 entries.</li>
    <li>Anime on <strong>Filmarks</strong> (a movie and anime review service): 7,247 entries.</li>
    <li><strong>My own list of classics</strong>: about 500 titles.</li>
  </ul>
  <p>The same title is merged into one. After merging there are <strong>16,177 entries</strong>. From these I keep only what is usable for the quiz.</p>

  <h2 class="rv" id="s2">The criterion for keeping: “clues to place it on the axes”</h2>
  <p>The quiz describes each title on 6 axes (worldview, aftertaste, structure, subtaste, visuals, viewing style) and picks by closeness to your answers. So each title needs enough “clues to place it on the axes.”</p>
  <p>The clues are estimated from the number of words that appear in reviews (the review text itself is not kept; only the number of words is counted). Disparaging phrasing and negations such as “the animation collapsed” or “I did not cry” are not counted. A phrase like “god-tier animation” is not double counted. This “richness of clues” is given as a number from 0 to 1, and <strong>titles below 0.25 are dropped</strong>.</p>
  <p>Also, by default I exclude continuations of TV series and spin-off theatrical films (such as Doraemon or Conan movies). Standalone original films are kept.</p>
  <div class="scroll rv"><table>
    <tr><th></th><th class="n">Count</th><th class="n">Share</th></tr>
    <tr><td>Titles after merging</td><td class="n">16,177</td><td class="n">100%</td></tr>
    <tr><td>Dropped for too few clues</td><td class="n">10,086</td><td class="n">62.3%</td></tr>
    <tr><td>Kept (the database)</td><td class="n">6,091</td><td class="n">37.7%</td></tr>
  </table></div>
  <p><strong>More than 60% of titles were dropped because they lacked clues.</strong> The quiz also does not use titles whose values on every axis are close to neutral (absolute value 0.15 or less). That removes 17 more, so the quiz actually uses <strong>6,074 titles</strong>.</p>

  <h2 class="rv" id="s3">What the remaining 6,091 look like</h2>
  <p>The data was made on September 25, 2026, and I counted it again on October 8.</p>
  <div class="scroll rv"><table>
    <tr><th>Source</th><th class="n">Titles</th></tr>
    <tr><td>Listed on both Annict and Filmarks</td><td class="n">4,354</td></tr>
    <tr><td>Filmarks only</td><td class="n">1,077</td></tr>
    <tr><td>Annict only</td><td class="n">619</td></tr>
    <tr><td>My classics list only</td><td class="n">41</td></tr>
  </table></div>
  <div class="scroll rv"><table>
    <tr><th>Richness of clues</th><th class="n">Titles</th><th class="n">Share</th></tr>
    <tr><td>0.8 or more (plenty)</td><td class="n">3,388</td><td class="n">55.6%</td></tr>
    <tr><td>0.6 to 0.8</td><td class="n">639</td><td class="n">10.5%</td></tr>
    <tr><td>0.4 to 0.6</td><td class="n">1,148</td><td class="n">18.8%</td></tr>
    <tr><td>0.25 to 0.4 (barely)</td><td class="n">916</td><td class="n">15.0%</td></tr>
  </table></div>
  <p>The median richness is 0.92. But 15% passed only barely. The axis values for these titles are less certain than for the others.</p>
  <div class="scroll rv"><table>
    <tr><th>Decade of broadcast</th><th class="n">Titles</th></tr>
    <tr><td>2020s</td><td class="n">2,591</td></tr>
    <tr><td>2010s</td><td class="n">1,996</td></tr>
    <tr><td>2000s</td><td class="n">926</td></tr>
    <tr><td>1990s</td><td class="n">291</td></tr>
    <tr><td>1980s</td><td class="n">166</td></tr>
    <tr><td>1970s</td><td class="n">83</td></tr>
    <tr><td>1960s</td><td class="n">20</td></tr>
  </table></div>
  <p>Titles from 2000 onward make up <strong>90.5%</strong>. I think older titles tend to have fewer words in reviews and find it harder to meet the criterion (this is a guess, not confirmed). Titles with an image number 5,632 (92.5%).</p>

  <h2 class="rv" id="s4">Weak points of this method</h2>
  <ul>
    <li><strong>It is biased toward new and much-discussed titles.</strong> The more words in reviews, the more likely a title stays. Older titles and those rarely discussed are likely to drop. The quiz has a decade question that decides how much to downweight older titles, but the pool itself already leans toward newer ones.</li>
    <li><strong>The number of clues is “how much was said,” not “taste.”</strong> Estimating 6 axes from word counts is a rough approximation.</li>
    <li><strong>The data is as of when it was made.</strong> New titles have to be added every season.</li>
  </ul>

  <h2 class="rv" id="s5">What I learned</h2>
  <blockquote>Most of the “6,000 titles” turned out to be “what was left of 16,000 after keeping those with clues.”</blockquote>
  <p>It is tempting to say “covers all anime,” but in fact more than 60% were dropped for lack of clues. I think writing down how many I dropped and the criterion for keeping is what makes the quiz honest.</p>
  <p class="note">The numbers in this article come from the quiz’s data (made on September 25, 2026 and recounted on October 8). Titles, review contents and rating scores are not included.</p>
'''))

pairs.append(make('match-percent',
 '“80% was chosen over 82%”: the quiz’s match percentage disagreed with its ranking',
 'The match percentage shown by the anime quiz was computed with a different yardstick from the ranking order. With the old display, 35 to 40% of simulated respondents saw a reversed top three. Measured again with 1,000 synthetic respondents.',
 'Match percent vs ranking',
 'Development log of the Anime Type Diagnosis / October 2026',
 '''  <p>At the end, the <a href="/en/works/shindananime/" hreflang="en" lang="en">Hardcore Anime Type Diagnosis</a> shows “the one anime of fate” and two runners-up. Each has a number like “match 82%.” At one point this number <strong>disagreed with the ranking</strong>: “a title at 80% was chosen over a title at 82%.” I have re-measured how large the disagreement was, and I am writing it down.</p>

  <h2 class="rv" id="s1">The number and the ranking used different yardsticks</h2>
  <p>The quiz measures taste on 6 axes and computes a “closeness” (cosine similarity) for each title. But the final order is not decided by closeness alone. It is ordered by <strong>closeness × 0.82 plus the title’s rating (stars), popularity, era and taste elements (<code>total</code>)</strong>.</p>
  <p>However, the match percentage on screen was built from <strong>closeness alone</strong>. The order was by the total and the display by closeness: two yardsticks. A title could rank first by total but have a lower closeness than second place. Then the screen showed “1st 80%, 2nd 82%.”</p>

  <h2 class="rv" id="s2">The fix</h2>
  <p>I changed it so the percentage comes from the same <code>total</code> as the order (September 25, 2026). The same day I fixed another contradiction in the display. Even when an axis bar’s value was exactly 0, it showed “leans X 50%.” It said it leaned when it did not. I made the minimum 51%.</p>

  <h2 class="rv" id="s3">How big was the disagreement? Measure it</h2>
  <p>The commit of the time does not keep the proportion. So I measured with the same <strong>1,000 synthetic respondents</strong> (answering all 50 questions) as in <a href="/notes/shindan12/" hreflang="ja" lang="ja">the 12-question article</a> (in Japanese). For the top 3 titles, I compare how the screen display would look in three ways.</p>
  <ul>
    <li><strong>Old:</strong> integer % computed from closeness.</li>
    <li><strong>Middle:</strong> integer % computed from <code>total</code>.</li>
    <li><strong>Now:</strong> % to one decimal place computed from <code>total</code>.</li>
  </ul>
  <p>I counted two things. “<strong>Reversal</strong>” is when the 1st place % is lower than the 2nd or 3rd place %. “<strong>Tie</strong>” is when 1st and 2nd look like the same %. Answer noise is small (0.3), medium (0.5) and large (0.8).</p>
  <div class="scroll rv"><table>
    <tr><th>Display</th><th>Answer noise</th><th class="n">Reversal</th><th class="n">1st and 2nd tied</th></tr>
    <tr><td rowspan="3">Old (closeness, integer)</td><td>Small</td><td class="n">40.3%</td><td class="n">14.1%</td></tr>
    <tr><td>Medium</td><td class="n">37.7%</td><td class="n">15.3%</td></tr>
    <tr><td>Large</td><td class="n">35.1%</td><td class="n">15.3%</td></tr>
    <tr><td rowspan="3">Middle (total, integer)</td><td>Small</td><td class="n">0.0%</td><td class="n">31.7%</td></tr>
    <tr><td>Medium</td><td class="n">0.0%</td><td class="n">30.1%</td></tr>
    <tr><td>Large</td><td class="n">0.0%</td><td class="n">27.7%</td></tr>
    <tr><td rowspan="3">Now (total, one decimal)</td><td>Small</td><td class="n">0.0%</td><td class="n">3.6%</td></tr>
    <tr><td>Medium</td><td class="n">0.0%</td><td class="n">3.9%</td></tr>
    <tr><td>Large</td><td class="n">0.0%</td><td class="n">3.8%</td></tr>
  </table></div>
  <p><strong>With the old display, the top three were shown in reversed order for 35 to 40% of respondents.</strong> By this calculation about 2 in 5 people saw “the chosen first place is lower than the runner-up.”</p>

  <h2 class="rv" id="s4">Fixing it produced another problem</h2>
  <p>Computing from the total made reversals 0%. But with integer percentages, <strong>1st and 2nd looking like the same %</strong> rose to around 30%. The top has titles with close totals. Rounding to integers erases the difference and they gather on the same number.</p>
  <p>So I changed the display to <strong>one decimal place</strong> (like 99.6%). Ties dropped to about 4%. It does not reach 0% because sometimes the totals really differ by less than 0.1%.</p>

  <h2 class="rv" id="s5">Weak points of this measurement</h2>
  <ul>
    <li><strong>The respondents are synthetic.</strong> Real people answer differently.</li>
    <li><strong>“Old” is a reconstruction: today’s ordering with the old display method applied.</strong> I did not run the code of that time. At the time, ratings and taste boosts had no cap, and the results may have differed.</li>
    <li>What I measured is only “does the display agree with the ranking,” not “is the ranking right for that person.”</li>
  </ul>

  <h2 class="rv" id="s6">What I learned</h2>
  <blockquote>Make the number you show from the same yardstick you used to sort.</blockquote>
  <p>It sounds obvious, but as calculations were added, only the order changed and the displayed number was left behind. Another point: <strong>rounding can erase a difference in rank</strong>. Where differences are small, just adding one digit brings back the visible order.</p>
  <p class="note">The numbers in this article were measured on October 8, 2026 with 1,000 synthetic respondents (random numbers fixed). The commit record of that time is September 25, 2026.</p>
'''))

pairs.append(make('shindan12',
 'What changes when an anime quiz goes from 50 questions to 12?',
 'I made a 50-question anime quiz give a result from just the first 12. How much does the result change? Measured with 1,000 synthetic respondents: the type is mostly the same, but the single recommended title changes a lot.',
 'Quiz: 12 vs 50 questions',
 'Development log of the Anime Type Diagnosis / October 2026',
 '''  <p>The <a href="/en/works/shindananime/" hreflang="en" lang="en">Hardcore Anime Type Diagnosis</a> has 50 questions in total. People said it was long, so I made it possible to <strong>get a result from just the first 12 questions</strong>. The remaining 38 are for those who want to answer them.</p>
  <p>But the result must change a bit by being shorter. I wanted to know <strong>how much</strong> with numbers, not feelings.</p>

  <h2 class="rv" id="s1">How the 12 were chosen</h2>
  <p>The quiz measures taste on 6 axes (worldview, aftertaste, structure, subtaste, visuals, viewing style). The 12-question version takes <strong>2 questions from each axis, 12 in total</strong>. The calculation that produces the result is the same as with 50; unanswered questions are simply not counted.</p>
  <p>The 50 questions are 18 on the 6 axes, 2 on image quality and era, and 30 on taste elements (romance, horror, robots and so on). The 12-question version does not ask the last two (era and taste elements), so they do not affect the ordering of titles.</p>

  <h2 class="rv" id="s2">How I measured: 1,000 synthetic respondents</h2>
  <p>I cannot quickly have real people answer both 12 and 50 questions. So I used <strong>synthetic respondents</strong>. I say this up front: the numbers below are not the results of real people.</p>
  <ol>
    <li>For each respondent, I draw a “true taste” as a random number from −1 to +1 for the 6 axes, era, and 30 taste elements.</li>
    <li>Each answer is that “true taste” plus noise, rounded to 5 levels (leans A, slightly A, neither, slightly B, leans B).</li>
    <li>These answers are run through the same calculation as the real app (<code>logic.js</code>), once using only 12 questions and once using all 50.</li>
  </ol>
  <p>I do not know the size of the noise. People’s answers wobble even in the same mood, so I measured with three values: <strong>small (0.3), medium (0.5) and large (0.8)</strong>. The titles used are the 6,074 with enough clues on the axes.</p>

  <h2 class="rv" id="s3">The type mostly matches even with 12</h2>
  <p>First, whether the type code (6 letters) is the same with 12 and 50 questions.</p>
  <div class="scroll rv"><table>
    <tr><th>Answer noise</th><th class="n">All 6 letters match</th><th class="n">Match per letter</th></tr>
    <tr><td>Small (0.3)</td><td class="n">75.6%</td><td class="n">94.7 to 96.1%</td></tr>
    <tr><td>Medium (0.5)</td><td class="n">60.8%</td><td class="n">90.9 to 93.7%</td></tr>
    <tr><td>Large (0.8)</td><td class="n">43.2%</td><td class="n">85.5 to 87.6%</td></tr>
  </table></div>
  <p>Looking letter by letter, even with medium noise more than 90% fall on the same side. Matching <strong>all</strong> 6 letters gets harder because you have to be right six times in a row. Even with 90% per letter, six in a row is a little over half.</p>

  <h2 class="rv" id="s4">The single “title of fate” changes a lot</h2>
  <p>Next, the <strong>“title of fate”</strong> the quiz shows at the end. It is one pick out of 6,074 titles, so the situation is different.</p>
  <div class="scroll rv"><table>
    <tr><th>Answer noise</th><th class="n">Same single title</th><th class="n">Any of the top 3 in common</th></tr>
    <tr><td>Small (0.3)</td><td class="n">21.7%</td><td class="n">63.4%</td></tr>
    <tr><td>Medium (0.5)</td><td class="n">15.7%</td><td class="n">52.7%</td></tr>
    <tr><td>Large (0.8)</td><td class="n">12.4%</td><td class="n">39.9%</td></tr>
  </table></div>
  <p><strong>The title shown with 12 questions comes first with 50 questions for about 1 person in 5 to 8.</strong> With medium noise, about half have something in common in the top 3.</p>

  <h2 class="rv" id="s5">At which stage does it change?</h2>
  <p>I checked whether the reason is only “the 30 taste-element questions.” Between 12 and 50, I inserted <strong>18 questions on the 6 axes only</strong> (no taste elements or era) and compared the single title (medium noise, 600 respondents).</p>
  <div class="scroll rv"><table>
    <tr><th>Compared</th><th class="n">Same single title</th></tr>
    <tr><td>12 and 18 (axes only)</td><td class="n">33.8%</td></tr>
    <tr><td>18 and 50</td><td class="n">27.5%</td></tr>
    <tr><td>12 and 50</td><td class="n">15.0%</td></tr>
  </table></div>
  <p>Even just <strong>adding 6 axis questions before adding taste elements changes the single title for 2 in 3 people</strong>. When choosing one out of 6,000, a small difference in input reshuffles the order. It was not that “taste elements are doing harm.”</p>

  <h2 class="rv" id="s6">Is 50 questions really closer to the right answer?</h2>
  <p>In this setup I know the “true taste,” so the one title chosen from it can be treated as the <strong>correct answer</strong>. Do 12 and 50 get closer to it (medium noise)?</p>
  <div class="scroll rv"><table>
    <tr><th></th><th class="n">Same as the correct title</th><th class="n">In the correct top 3</th></tr>
    <tr><td>12 questions</td><td class="n">8.2%</td><td class="n">14.9%</td></tr>
    <tr><td>50 questions</td><td class="n">14.3%</td><td class="n">28.5%</td></tr>
  </table></div>
  <p>50 questions is <strong>about 1.7 to 1.9 times</strong> closer to the correct answer. With small noise, the difference is 17.9% to 29.0% (single title) and 29.0% to 52.6% (top 3). The remaining 38 questions were not wasted. But even with 50, hitting the exact single title is a little over one in ten.</p>

  <h2 class="rv" id="s7">Weak points of this measurement</h2>
  <ul>
    <li><strong>The respondents are synthetic.</strong> Real people’s tastes are not scattered like random numbers, and they are noisy in different ways.</li>
    <li><strong>The noise size is a placeholder.</strong> That is why I measured with three values; I do not know the true one.</li>
    <li><strong>The “correct answer” is correct on the quiz’s own yardstick.</strong> Whether it is something a person would really love is not measured.</li>
    <li>What I measured is “is it the same,” not “is it fun.”</li>
  </ul>

  <h2 class="rv" id="s8">What I learned</h2>
  <blockquote>The type is set even when short. The single title of fate wobbles each time you add questions.</blockquote>
  <p>The current design of giving a result at 12 questions and making the rest optional does not contradict these numbers. <strong>If you only want to know your type, 12 questions are enough, and only those who want a more accurate single title need continue.</strong> I think the result screen should say it that way.</p>
  <p>What I really want to check is real people’s answers: showing the same person the 12-question and the 50-question result and asking which feels right. If I get that far, I will write it in the next record.</p>
  <p class="note">The measuring script is in the quiz’s repository (random numbers are fixed, so the same numbers can be reproduced).</p>
  <p style="margin-top:32px"><a class="btn" href="/app/shindananime/en/">Take the quiz</a><a class="btn ghost" href="/en/works/shindananime/">About the quiz</a></p>
'''))
