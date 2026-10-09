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
