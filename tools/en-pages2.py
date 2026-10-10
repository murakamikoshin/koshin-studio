"""英語の紹介ページ（作品）。すし積む、10秒ピッタリ。"""
import json, re, html as H, os
def page(ja_slug, title, desc, og_title, og_desc, crumb, main, date, base='works'):
    jaDir = f'{base}/{ja_slug}' if base != '.' else ja_slug
    enDir = f'en/{base}/{ja_slug}' if base != '.' else f'en/{ja_slug}'
    jaUrl = f'/{base}/{ja_slug}/' if base != '.' else f'/{ja_slug}/'
    enUrl = '/' + enDir + '/'
    src = open(f'{jaDir}/index.html', encoding='utf8').read()
    head = src[:src.index('<main>')]; foot = src[src.index('</main>') + 7:]
    foot = re.sub(r'<footer class="site">.*?</footer>', '<footer class="site"><div class="wrap"></div></footer>', foot, flags=re.S)
    head = re.sub(r'<title>.*?</title>', f'<title>{H.escape(title, quote=False)}</title>', head, flags=re.S)
    head = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{H.escape(desc)}">', head)
    head = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{H.escape(og_title)}">', head)
    head = re.sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{H.escape(og_desc)}">', head)
    head = head.replace('<html lang="ja">', '<html lang="en">')
    os.makedirs(enDir, exist_ok=True)
    open(f'{enDir}/index.html', 'w', encoding='utf8').write(head + main + foot)
    pairs = json.load(open('data/en.json', encoding='utf8'))
    pairs = [p for p in pairs if p['ja'] != jaUrl]
    pairs.append({"ja": jaUrl, "en": enUrl, "title": og_title, "date": date, "blurb": desc})
    json.dump(pairs, open('data/en.json', 'w', encoding='utf8'), ensure_ascii=False, indent=2)

def fig(n, alt, cap, w=560, h=1212):
    return f'''    <figure>
      <picture>
        <source srcset="/assets/shots/{n}.webp" type="image/webp">
        <img src="/assets/shots/{n}.jpg" alt="{alt}" width="{w}" height="{h}" loading="lazy" decoding="async">
      </picture>
      <figcaption>{cap}</figcaption>
    </figure>
'''

# ---- Sushi Stack ----
main = '''<main><div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="/en/">Koshin Studio</a><i aria-hidden="true">›</i><span aria-current="page">Sushi Stack</span></nav>
  <h1>Sushi Stack</h1>
  <div class="rule"></div>
  <p class="lead">Start with rice and merge matching toppings to grow them.<br>The final piece is the golden sushi tub.</p>

  <p><a class="btn" data-play="sushitsumu" href="/play/sushitsumu/">Play now</a></p>
  <p class="note">Free. Runs in your browser, no install or sign-up. Available in 14 languages including English.</p>

  <figure class="shot-wide rv">
    <picture>
      <source srcset="/assets/shots/desktop.webp" type="image/webp">
      <img src="/assets/shots/desktop.jpg" alt="Playing on a computer: the score is shown to the left of the tub and the ranking column to the right" width="1200" height="831" loading="lazy" decoding="async">
    </picture>
    <figcaption>On a computer, the score sits to the left of the tub and the ranking to the right</figcaption>
  </figure>
  <div class="shots rv" data-delay="80">
''' + fig('title', 'The title screen of Sushi Stack with a Play button under the title', 'Title screen', 560, 844) + fig('play', 'Mid-game: sushi piled up in the tub and the next piece waiting above', 'Playing') + fig('dex', 'The sushi encyclopedia: ten of twelve kinds collected and two still shown as ???', 'The sushi encyclopedia', 560, 811) + '''  </div>

  <div class="stats rv">
    <div><b data-count="11">11</b><span>tiers of toppings</span></div>
    <div><b data-count="14">14</b><span>languages</span></div>
    <div><b data-count="300">300</b><span>games verified by auto-play</span></div>
  </div>

  <h2 class="rv">What it is</h2>
  <p>You drop pieces of rice into a tub from above. When two of the same topping touch, they become the next topping up: rice becomes egg, egg becomes shrimp, shrimp becomes salmon, and so on, up 11 tiers.</p>
  <p>You lose when the tub overflows. It is that simple, but <strong>bigger toppings take more room</strong>, so stacking without thinking ahead gets you stuck quickly. Each time you choose where to drop, and it adds up.</p>
  <p>When a merge produces a topping that immediately merges again, that is a “chain.” Five in a row is a “big chain,” and the score jumps.</p>

  <h2 class="rv">What is in it</h2>
  <h3>The sushi encyclopedia</h3>
  <p>You can see only the toppings you have made so far; the rest are shown as silhouettes. It is stored per device, so everyone fills it differently. There are 12 kinds in total (including gari, the pickled ginger).</p>
  <h3>Ranking (online leaderboard)</h3>
  <p>Today’s top and the all-time top. Enter a name and submit to be listed. On a computer, it is always shown at the right of the screen.</p>
  <h3>The menu mode</h3>
  <p>The chef calls out orders such as “two tuna,” and if you make exactly that within the time you get a bonus. The longer you keep fulfilling orders, the higher the multiplier, and it resets to one when you miss. Scores run about 1.6 times those of normal play, so it has its own ranking.</p>
  <h3>Gari</h3>
  <p>About once in twenty drops, gari comes instead of a topping. It removes one topping it touches, an escape for when you have stacked badly.</p>

  <h2 class="rv">What you need to play</h2>
  <p>Just a browser. No install and no sign-up. On a phone, drag to choose the position and release to drop. On a computer, you can also play with the left and right arrow keys and the space bar.</p>
  <p>It supports 14 languages: Japanese, English, Spanish, Portuguese, French, German, Italian, Polish, Turkish, Russian, Indonesian, Vietnamese, Korean and Chinese.</p>

  <h2 class="rv">How it is made</h2>
  <p>The whole thing is <strong>one HTML file</strong>. It uses <a href="https://brm.io/matter-js/" rel="noopener">Matter.js</a> for physics, and the sushi is drawn on a Canvas every time rather than shown as images. The ranking runs on Cloudflare Workers and D1, and the server re-verifies the sequence of moves it receives before ranking it.</p>
  <p>The balance was tuned by letting the game play itself and taking numbers first. That story is in <a href="/en/notes/anago/" hreflang="en" lang="en">the development log</a>.</p>

  <p style="margin-top:40px"><a class="btn" data-play="sushitsumu" href="/play/sushitsumu/">Play now</a></p>

  <div class="rule" style="margin:40px 0 22px"></div>
  <p class="eyebrow">Development logs for this game</p>
  <ul class="plain">
    <li><a href="/en/notes/anago/" hreflang="en" lang="en">The conger eel was too big: finding why the last piece was out of reach</a></li>
    <li><a href="/en/notes/sushi-measure/" hreflang="en" lang="en">“The pile settles at 89%” was wrong: my measurement was wrong</a></li>
    <li><a href="/en/notes/crazygames/" hreflang="en" lang="en">Rejected by CrazyGames with no reason given</a></li>
    <li><a href="/en/notes/first-visit/" hreflang="en" lang="en">Cutting six buttons to one</a></li>
    <li><a href="/en/notes/webaudio/" hreflang="en" lang="en">I could not listen, so I measured the waveform</a></li>
    <li><a href="/en/notes/ranking-free-tier/" hreflang="en" lang="en">Making a ranking server use half of the free tier</a></li>
    <li><a href="/en/notes/adgap/" hreflang="en" lang="en">Measuring the gap between ads in time, not plays</a></li>
    <li><a href="/en/notes/ascii-text/" hreflang="en" lang="en">Garbled Japanese in the CrazyGames preview</a></li>
  </ul>

  <p class="note">This is the English version of <a href="/works/sushitsumu/" hreflang="ja" lang="ja">the Japanese page</a>. The ranking stores the name you enter and your results (see the <a href="/en/privacy/" hreflang="en" lang="en">privacy page</a>).</p>
</div>
</main>'''
page('sushitsumu',
 'Sushi Stack: a free sushi merge puzzle | Koshin Studio',
 'Sushi Stack is a free browser merge puzzle. Drop rice, merge matching toppings up 11 tiers to reach the golden sushi tub. Online ranking, 14 languages, no install or sign-up.',
 'Sushi Stack', 'Drop rice and merge matching toppings up 11 tiers to the golden sushi tub. A free merge puzzle for your browser, in 14 languages.',
 'Sushi Stack', main, '2026-10-10')

# ---- 10-second stopwatch ----
main = '''<main><div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="/en/">Koshin Studio</a><i aria-hidden="true">›</i><span aria-current="page">Stop at exactly 10 seconds!</span></nav>
  <h1>Stop at exactly 10 seconds!</h1>
  <div class="rule"></div>
  <p class="lead">Press start and count ten seconds in your head.<br>When you think it is time, stop.</p>

  <p><a class="btn" data-play="stopwatch10" href="/play/stopwatch10/">Play now</a></p>
  <p class="note">Free. Runs in your browser, no install or sign-up. The screen text is in Japanese, but the game is just a start button and numbers.</p>

  <div class="shots rv">
''' + fig('sw10-ready', 'The screen before starting: the orange seven-segment display is off and a large start button is below', 'Before starting') + fig('sw10-run', 'The screen while counting: completely dark, with no numbers or ticks', 'While counting. Nothing moves') + fig('sw10-done', 'The screen after three attempts showing 10.134 and an error of 0.084 seconds per attempt', 'After three attempts') + '''  </div>

  <div class="stats rv">
    <div><b data-count="3">3</b><span>attempts per game</span></div>
    <div><b data-count="3">3</b><span>modes</span></div>
    <div><b data-count="1000">1,000</b><span>one-thousandth of a second</span></div>
  </div>

  <h2 class="rv">What it is</h2>
  <p>The screen shows no numbers, no ticks and no sound. Between pressing and stopping, nothing moves. All you can rely on is the second hand inside you.</p>
  <p>You stop three times and see your <strong>error</strong> from the target. Some people are off by 0.5 seconds, and some stop within 0.02. It is shown per attempt rather than as a total, because that makes your skill easier to feel. The best single attempt of the three is also kept. The average is skill; the best single is luck of the day.</p>

  <h2 class="rv">Three modes</h2>
  <h3>10 seconds, no hint</h3>
  <p>The basic way to play: three attempts. There is no clue at all.</p>
  <h3>10 seconds, with a hint</h3>
  <p>A clock is shown for the first 3 seconds only. Match your own beat to it and do the rest by yourself. The moment 3 seconds pass, the display disappears completely.</p>
  <h3>100 seconds, one shot</h3>
  <p>One attempt only. While you count the 100 seconds there is nothing to do. If you leave the screen (switch tabs or the screen turns off), that attempt becomes invalid.</p>

  <h2 class="rv">Why three decimals</h2>
  <p>Browser clocks differ in coarseness by device. <code>performance.now()</code> is deliberately made less precise as a Spectre countermeasure: Chrome in 5 µs steps, Safari and Firefox in 1 ms steps.</p>
  <p>If six decimals were shown, <strong>a device with a coarser clock would more often end in 000 and gain an advantage</strong>. In a game about being “exact,” the luck of your device would decide the ranking. So I cut at three decimals to put every device on the same ground.</p>

  <h2 class="rv">Nothing moving</h2>
  <p>While building it, I once put a blinking lamp somewhere in the display. It became <strong>a stand-in metronome</strong>. If something flashes at 1 Hz in your sight, people can count along with it, and a game about counting by yourself vanishes entirely.</p>
  <p>Now there is nothing that moves periodically during measurement: no pulsing buttons, no blinking, no animation. From the moment you press until you stop, the screen is completely still.</p>

  <h2 class="rv">How it is made</h2>
  <p>The whole thing is <strong>one HTML file</strong> with zero external libraries. The digits are drawn as SVG polygons in a seven-segment shape, so it depends on no font either. The sound effects use no audio files and are generated on the spot.</p>
  <p>The stop time is taken from <code>event.timeStamp</code> of <code>pointerdown</code>, because waiting for <code>click</code> adds extra delay. Your records stay in your device, per mode.</p>

  <p style="margin-top:40px"><a class="btn" data-play="stopwatch10" href="/play/stopwatch10/">Play now</a></p>

  <div class="rule" style="margin:40px 0 22px"></div>
  <p class="eyebrow">Development log for this game</p>
  <ul class="plain">
    <li><a href="/en/notes/stopwatch-rank/" hreflang="en" lang="en">Making a 10-second stopwatch ranking fair: 3 decimals, ties and write counts</a></li>
  </ul>

  <p class="note">This is the English version of <a href="/works/stopwatch10/" hreflang="ja" lang="ja">the Japanese page</a>.</p>
</div>
</main>'''
page('stopwatch10',
 'Stop at exactly 10 seconds! A free stopwatch game | Koshin Studio',
 'A free browser game: press start and count ten seconds in your head, with no numbers or sound on screen. Three modes, millisecond precision, and a fair daily ranking.',
 'Stop at exactly 10 seconds!', 'Count ten seconds in your head and stop. No numbers, no ticks, nothing moves. A free browser game with a fair ranking.',
 'Stop at exactly 10 seconds!', main, '2026-10-10')

# ---- About ----
src = open('about/index.html', encoding='utf8').read()
main = '''<main><div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="/en/">Koshin Studio</a><i aria-hidden="true">›</i><span aria-current="page">About</span></nav>
  <h1>About</h1>
  <div class="rule"></div>
  <p class="lead">Koshin Studio is a place for taking on anything, alone.<br>Make, try, write. Games, a quiz app and more, with records of how they were made and verified.</p>

  <h2 class="rv">What you can do here</h2>
  <ul class="rv">
    <li><a href="/en/">English hub</a> — games, tools and development logs in English</li>
    <li><a href="/en/works/sushitsumu/" hreflang="en" lang="en">Sushi Stack</a>, <a href="/en/works/negaeri-shogi/" hreflang="en" lang="en">Negaeri Shogi</a>, <a href="/en/works/stopwatch10/" hreflang="en" lang="en">Stop at exactly 10 seconds!</a> — free browser games</li>
    <li><a href="/en/works/shindananime/" hreflang="en" lang="en">Hardcore Anime Type Diagnosis</a> — an anime quiz with 64 types and 6 axes</li>
    <li><a href="/en/calc/gacha/" hreflang="en" lang="en">Gacha calculators</a> — rate and pity calculators</li>
  </ul>

  <h2 class="rv">How I work</h2>
  <p class="rv">Mostly alone, running things on my own machine as I go. Because I do everything from design to art to sound, I can fix what needs fixing on the spot.</p>
  <p class="rv" data-delay="60">For balance, <strong>I always prepare a way to measure</strong>. For a game, I let it play itself hundreds of times and look at where it gets stuck in numbers. It is much faster and more reliable than tweaking by feel three times and checking. The process is in <a href="/en/notes/anago/" hreflang="en" lang="en">a development log</a>.</p>
  <blockquote class="rv" data-delay="120">My feeling was right.<br>But the cause was not where I thought.</blockquote>
  <p class="rv" data-delay="160">No install and no sign-up. It starts right away when you open it in a browser. That is the one thing I try not to break.</p>

  <h2 class="rv">How the articles are written, and corrections</h2>
  <p class="rv">The articles in the development logs are written from real commits (work records) and measured numbers. I follow three rules.</p>
  <ul class="rv">
    <li><strong>I write where the numbers come from.</strong> At the end of an article I say which record it was written from and when it was measured.</li>
    <li><strong>I write “not verified” when I have not verified.</strong> Causes I never found and things I did not confirm on a real device are written as they are.</li>
    <li><strong>I fix mistakes, and say I fixed them.</strong> When I learn something later, I add it to the article and change the update date (for example, <a href="/en/notes/anago/" hreflang="en" lang="en">the conger eel article</a> got an addendum with the numbers after sizes changed).</li>
  </ul>
  <p class="rv">If you notice a mistake in an article, please tell me using the contact below.</p>

  <h2 class="rv">Tools I use</h2>
  <ul class="rv">
    <li><strong>Languages:</strong> JavaScript (the main one: games and the site), Python (fonts, image conversion, statistics tools), Swift (iOS apps), plain HTML and CSS written by hand.</li>
    <li><strong>Games:</strong> Matter.js for physics, Canvas 2D for drawing every frame instead of using images, Web Audio for synthesized sound.</li>
    <li><strong>The site:</strong> GSAP and ScrollTrigger, Lenis, and SVG (I even drew the logo letters myself).</li>
    <li><strong>Hosting:</strong> Cloudflare Pages, Workers and D1 for this site and the ranking server, and Firebase for app backends.</li>
    <li><strong>Tooling:</strong> Git and GitHub, Playwright (to let games play themselves and to walk the whole site), fontTools, Pillow and Xcode.</li>
  </ul>
  <p class="rv">I add a framework only when I need it. This site added GSAP only when it came to thickening the motion. It does not connect to outside CDNs; everything it uses is on my own server, which is fast and unaffected when others go down. Fonts are trimmed to the characters needed instead of pasting a stock font.</p>

  <h2 class="rv">Contact</h2>
  <p class="rv">Corrections, impressions and questions are welcome. I may not be able to reply to everything, but I read them.</p>
  <div class="contact-box rv"><a class="ct-main" href="mailto:koshinstudio88@gmail.com?subject=Koshin%20Studio">koshinstudio88@gmail.com<span>Send an email</span></a></div>
  <p class="note rv">How personal information and quiz answers are handled is written on the <a href="/en/privacy/" hreflang="en" lang="en">privacy page</a>. This is the English version of <a href="/about/" hreflang="ja" lang="ja">the Japanese page</a>.</p>
</div>
</main>'''
page('about', 'About Koshin Studio, a one-person studio | Koshin Studio',
 'Koshin Studio is a one-person studio making free browser games and small apps, and writing down what it measures. How I work, how articles are written, the tools I use, and how to contact me.',
 'About Koshin Studio', 'A one-person studio making free browser games and apps, and writing down what it measures.',
 'About', main, '2026-10-10', base='.')
