"""英語の紹介ページ（記事以外）。寝返り将棋。"""
import json, re, html as H, os
src = open('works/negaeri-shogi/index.html', encoding='utf8').read()
head = src[:src.index('<main>')]; foot = src[src.index('</main>') + 7:]
foot = re.sub(r'<footer class="site">.*?</footer>', '<footer class="site"><div class="wrap"></div></footer>', foot, flags=re.S)
T = 'Negaeri Shogi — a free 6×6 board game where sandwiched pieces defect'
D = 'Negaeri Shogi is a free browser board game on a 6×6 board. Drop a piece to sandwich your opponent’s pieces: they defect to your side and get promoted, and chains flip many at once. Play locally, vs AI, or online with ratings.'
head = re.sub(r'<title>.*?</title>', f'<title>{H.escape(T, quote=False)} — Koshin Studio</title>', head, flags=re.S)
head = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{H.escape(D)}">', head)
head = re.sub(r'<meta property="og:title" content="[^"]*">', '<meta property="og:title" content="Negaeri Shogi">', head)
head = re.sub(r'<meta property="og:description" content="[^"]*">', '<meta property="og:description" content="Sandwiched pieces defect to your side and get promoted. A free 6×6 board game for your browser.">', head)
head = head.replace('<html lang="ja">', '<html lang="en">')
fig = lambda n, alt, cap: f'''    <figure>
      <picture>
        <source srcset="/assets/shots/{n}.webp" type="image/webp">
        <img src="/assets/shots/{n}.jpg" alt="{alt}" width="560" height="1019" loading="lazy" decoding="async">
      </picture>
      <figcaption>{cap}</figcaption>
    </figure>
'''
main = '''<main><div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="/en/">Koshin Studio</a><i aria-hidden="true">›</i><span aria-current="page">Negaeri Shogi</span></nav>
  <h1>Negaeri Shogi</h1>
  <div class="rule"></div>
  <p class="lead">Sandwiched pieces defect to your side.<br>Defected pieces get promoted.</p>

  <p><a class="btn" data-play="negaeri-shogi" href="/play/negaeri-shogi/">Play now</a></p>
  <p class="note">Free. Runs in your browser, no install or sign-up. The game is available in English and Japanese.</p>

  <div class="shots rv">
''' + fig('negaeri-initial', 'The starting position: a 6×6 board with king, rook, bishop and pawns facing each other', 'The starting position') + fig('negaeri-ai', 'Mid-game against the AI: a rook has advanced to the middle of the board', 'Mid-game against the AI') + '''  </div>

  <h2 class="rv">What it is</h2>
  <p>A small 6×6 board and shogi pieces, played like Reversi: drop a piece from your hand so that it sandwiches your opponent’s pieces in a line, and the sandwiched pieces flip to your side. Every piece that flips is also <strong>promoted</strong> (pawn to tokin, rook to dragon, bishop to horse). A promoted piece moves in new ways, so it can create new sandwiches, and the flips <strong>chain</strong>. A single move can change the whole board.</p>

  <h2 class="rv">Rules in short</h2>
  <ul>
    <li>Four kinds of pieces: king, pawn, rook and bishop. They move as in shogi.</li>
    <li>On your turn you either <strong>drop</strong> a piece from your hand (this is when sandwiching happens) or <strong>move</strong> a piece on the board (no flipping).</li>
    <li>Sandwiching works in all 8 directions. <strong>The edge of the board also counts as an end</strong>, so pieces pushed against the edge can flip together.</li>
    <li><strong>Kings never flip.</strong> Pieces next to your own king do not flip either, so the squares around the king are safe.</li>
    <li>Capture the opponent’s king to win. If neither side can move, the player with more pieces wins.</li>
    <li>Online games have 3 minutes per player, plus 5 seconds per move.</li>
  </ul>

  <h2 class="rv">Ways to play</h2>
  <ul>
    <li><strong>Two players</strong> on one device.</li>
    <li><strong>Against the AI</strong> at three levels (weak, medium, strong). The AI runs in your browser.</li>
    <li><strong>Online</strong> against another player, with an Elo-style rating and a ranking. A name is stored, and no sign-up is needed.</li>
  </ul>

  <h2 class="rv">About the balance</h2>
  <p>The numbers (how many pieces each side holds, the king’s protection) were tuned by AI self-play. Balance in human-versus-human games has not been verified yet. If one side feels too strong, please tell me.</p>

  <p style="margin-top:40px"><a class="btn" data-play="negaeri-shogi" href="/play/negaeri-shogi/">Play now</a></p>

  <p class="note">This is the English version of <a href="/works/negaeri-shogi/" hreflang="ja" lang="ja">the Japanese page</a>. Online play stores your name, rating and results (see the <a href="/privacy/" hreflang="ja" lang="ja">privacy page</a>, in Japanese).</p>
</div>
</main>'''
os.makedirs('en/works/negaeri-shogi', exist_ok=True)
open('en/works/negaeri-shogi/index.html', 'w', encoding='utf8').write(head + main + foot)
pairs = json.load(open('data/en.json', encoding='utf8'))
pairs = [p for p in pairs if p['ja'] != '/works/negaeri-shogi/']
pairs.append({"ja": "/works/negaeri-shogi/", "en": "/en/works/negaeri-shogi/", "title": T, "date": "2026-10-09", "blurb": D})
json.dump(pairs, open('data/en.json', 'w', encoding='utf8'), ensure_ascii=False, indent=2)

# ---- プライバシー（英語） ----
src = open('privacy/index.html', encoding='utf8').read()
head = src[:src.index('<main>')]; foot = src[src.index('</main>') + 7:]
foot = re.sub(r'<footer class="site">.*?</footer>', '<footer class="site"><div class="wrap"></div></footer>', foot, flags=re.S)
T2 = 'Privacy: what this site keeps and what it does not'
D2 = 'What Koshin Studio stores (names and results you submit to rankings, online game ratings), what it does not collect, how comments and analytics work, and how to ask for deletion.'
head = re.sub(r'<title>.*?</title>', f'<title>{T2} — Koshin Studio</title>', head, flags=re.S)
head = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{H.escape(D2)}">', head)
head = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{T2}">', head)
head = re.sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{H.escape(D2)}">', head)
head = head.replace('<html lang="ja">', '<html lang="en">')
main2 = '''<main><div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="/en/">Koshin Studio</a><i aria-hidden="true">›</i><span aria-current="page">Privacy</span></nav>
  <h1>Privacy</h1>
  <div class="rule"></div>
  <p class="lead">What is stored and what is not.<br>Last updated October 2026</p>

  <h2 class="rv">What is stored</h2>
  <p>Only when you submit to a ranking, the <strong>name and score you enter</strong> are stored on our servers. Some works store a little more, as described below.</p>
  <p><strong>Sushi Stack</strong> also stores <strong>a number generated on your device</strong> and <strong>the move history of that run</strong>. The history is used to check that the score adds up. The device number is a random string created on your device and is used only to group records from the same device. It does not identify anyone.</p>
  <p><strong>Stop at 10 seconds</strong> stores only <strong>your name, the errors of your three tries and the time you submitted</strong>. It does not create a device number. The day’s ranking is cleared when the date changes.</p>
  <p><strong>Negaeri Shogi</strong>, when you play online (and when you open the ranking), stores <strong>a device-generated number, your name (default: “Anonymous” in Japanese), your rating, win/loss counts, and the moves and result of each game</strong>. Your name and rating appear in the ranking. Playing against the AI, or two players on the same device, stores nothing.</p>
  <p><strong>Anime Type Quiz</strong> calculates your answers on your device only and sends them nowhere.</p>
  <p>You can choose any name. You do not need to use your real name.</p>

  <h2 class="rv">What is not stored</h2>
  <p>Nothing else is collected. <strong>There is no registration and no mechanism to track individuals.</strong> We do not receive your email address, phone number or location.</p>
  <p>The site runs Cloudflare Web Analytics, which counts how many times pages are opened and which pages are read. It is not used to track individuals or for advertising.</p>

  <h2 class="rv">What stays only on your device</h2>
  <p>High scores, personal bests, collection data, language and sound settings stay <strong>only on your device</strong>. If you do not submit to a ranking, nothing leaves your device. Clearing your browser’s storage removes it.</p>

  <h2 class="rv">Comments on articles</h2>
  <p>Some articles have a comments section. <strong>Only when you press “Open comments”</strong> does your browser connect to giscus (giscus.app) and GitHub. If you do not press it, no connection is made. Writing a comment requires a GitHub account, and comments are public, stored in GitHub Discussions with your GitHub username. You can delete your own comment on GitHub.</p>

  <h2 class="rv">If you want something deleted</h2>
  <p>To remove a record you submitted to a ranking, contact the address on the <a href="/about/" hreflang="ja" lang="ja">About page</a> (Japanese) with the name you used. We will confirm and delete it.</p>

  <h2 class="rv">Where it is hosted</h2>
  <p>This site and the ranking servers run on Cloudflare. Sushi Stack and Negaeri Shogi rankings are stored in Cloudflare D1 (a database), and Stop at 10 seconds in Cloudflare KV.</p>

  <h2 class="rv">About advertising</h2>
  <p>When our games are published on other sites (game portals), that site’s own advertising systems may apply, under that site’s policy. This site loads Google’s advertising script for Google AdSense review. No ads are shown until review is passed. When ads are shown, this page will describe what is used (such as cookies) and how to turn it off.</p>

  <h2 class="rv">Children</h2>
  <p>We do not ask for age and do not collect information related to age. Apart from the name you put in a ranking, nothing reaches us.</p>

  <p class="note">This is the English version of <a href="/privacy/" hreflang="ja" lang="ja">the Japanese privacy page</a>. If they differ, the Japanese page is the original.</p>
</div>
</main>'''
os.makedirs('en/privacy', exist_ok=True)
open('en/privacy/index.html', 'w', encoding='utf8').write(head + main2 + foot)
pairs = json.load(open('data/en.json', encoding='utf8'))
pairs = [p for p in pairs if p['ja'] != '/privacy/']
pairs.append({"ja": "/privacy/", "en": "/en/privacy/", "title": T2, "date": "2026-10-09", "blurb": D2})
json.dump(pairs, open('data/en.json', 'w', encoding='utf8'), ensure_ascii=False, indent=2)

# ---- ガチアニメ診断（英語の紹介ページ） ----
src = open('works/shindananime/index.html', encoding='utf8').read()
head = src[:src.index('<main>')]; foot = src[src.index('</main>') + 7:]
foot = re.sub(r'<footer class="site">.*?</footer>', '<footer class="site"><div class="wrap"></div></footer>', foot, flags=re.S)
T3 = 'Anime Type Quiz — find your anime type and the one anime that fits you'
D3 = 'A free anime quiz. Answer 12 questions (up to 50), get your anime type from 6 axes (like RDCP-VM) and a nickname, and see your destined anime plus two runners-up chosen from over 6,000 real titles.'
head = re.sub(r'<title>.*?</title>', f'<title>{T3} — Koshin Studio</title>', head, flags=re.S)
head = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{H.escape(D3)}">', head)
head = re.sub(r'<meta property="og:title" content="[^"]*">', '<meta property="og:title" content="Anime Type Quiz">', head)
head = re.sub(r'<meta property="og:description" content="[^"]*">', '<meta property="og:description" content="Your anime type from 12 questions, and the one anime that fits you best right now.">', head)
head = head.replace('<html lang="ja">', '<html lang="en">')
main3 = '''<main><div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="/en/">Koshin Studio</a><i aria-hidden="true">›</i><span aria-current="page">Anime Type Quiz</span></nav>
  <h1>Anime Type Quiz</h1>
  <div class="rule"></div>
  <p class="lead">12 questions, 6 axes.<br>Your anime type, and the one anime that fits you right now.</p>

  <p><a class="btn" href="/app/shindananime/en/">Start the quiz (free, about 1 minute)</a></p>
  <p class="note">Free, runs in your browser, no sign-up. Your answers never leave your device.</p>

  <h2 class="rv">What it is</h2>
  <p>The Anime Type Quiz is a free quiz that finds the anime that suits you right now. It asks up to 50 questions about six axes (<strong>world, aftertaste, structure, taste, visuals and viewing style</strong>), your taste in picture quality and era, and themes such as romance, gore and isekai. Twelve questions are enough to get your six-axis type; the rest are optional. From your answers it works out the direction of each axis and gives you a type code (for example <strong>RDCP-VM</strong>) and a nickname. There are 64 possible types.</p>
  <p>Unlike most personality quizzes, it does not stop at the type. It then picks, from a database of over 6,000 anime, the one closest to you at the moment.</p>

  <h2 class="rv">It picks real titles</h2>
  <p>You get a “destined pick” and two runners-up. Even people with the same type get different titles, because the pick also takes into account the years you prefer and the themes you like or dislike. If you have already seen a title, press “Seen it” and the next best match moves up.</p>
  <p>Closeness between titles is measured by cosine similarity of the six-axis vectors. Popularity and era preferences add only a little, on purpose: if they counted for more, the same few titles would come up for everyone.</p>

  <h2 class="rv">Frequently asked questions</h2>
  <h3>How many questions, and how long does it take?</h3>
  <p>Twelve questions (about 30 seconds) give you your type and your destined pick. If you keep going, up to 50 questions refine the result with era and theme preferences. Every question is multiple choice.</p>
  <h3>Are my answers or results stored anywhere?</h3>
  <p>No. Your answers are calculated on your device and are not sent anywhere.</p>
  <h3>Will the same type always get the same anime?</h3>
  <p>No. The pick also reflects the years you prefer and the themes you like or avoid, so it differs from person to person.</p>
  <h3>Do I need to install anything?</h3>
  <p>No. It works in any browser, on a phone or a computer.</p>
  <h3>Where do the data and the English titles come from?</h3>
  <p>The database is built from publicly available information about anime and is used only for per-title tendencies; it does not keep review text. English titles and detail links come from AniList. A few titles have no English title yet and show the original Japanese title. Streaming availability differs by country, so the buttons link to JustWatch and other services rather than to a single store.</p>

  <p style="margin-top:40px"><a class="btn" href="/app/shindananime/en/">Start the quiz (free, about 1 minute)</a></p>

  <p class="note">This is the English version of <a href="/works/shindananime/" hreflang="ja" lang="ja">the Japanese page</a>. The quiz’s questions and result texts are in English at the link above; the Japanese version is at <a href="/app/shindananime/" hreflang="ja" lang="ja">/app/shindananime/</a>.</p>
</div>
</main>'''
os.makedirs('en/works/shindananime', exist_ok=True)
open('en/works/shindananime/index.html', 'w', encoding='utf8').write(head + main3 + foot)
pairs = json.load(open('data/en.json', encoding='utf8'))
pairs = [p for p in pairs if p['ja'] != '/works/shindananime/']
pairs.append({"ja": "/works/shindananime/", "en": "/en/works/shindananime/", "title": T3, "date": "2026-10-09", "blurb": D3})
json.dump(pairs, open('data/en.json', 'w', encoding='utf8'), ensure_ascii=False, indent=2)
