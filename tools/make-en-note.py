"""英語の記事ページを作る。日本語の記事の head/foot を型にして、本文だけを差し替える。
   使い方は、tools/en-notes.py（本文はそこに書く）から呼ばれる。"""
import re, json, html as H

def make(ja_slug, title, desc, crumb, lead, body):
    src = open(f'notes/{ja_slug}/index.html', encoding='utf8').read()
    head = src[:src.index('<main>')]
    foot = src[src.index('</main>') + len('</main>'):]
    e = H.escape
    head = re.sub(r'<title>.*?</title>', f'<title>{e(title, quote=False)} — Koshin Studio</title>', head, flags=re.S)
    head = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{e(desc)}">', head)
    head = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{e(title)}">', head)
    head = re.sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{e(desc)}">', head)
    head = head.replace('<html lang="ja">', '<html lang="en">')
    foot = re.sub(r'<footer class="site">.*?</footer>', '<footer class="site"><div class="wrap"></div></footer>', foot, flags=re.S)
    main = f'''<main><div class="wrap">
  <nav class="crumbs" aria-label="You are here"><a href="/en/">Koshin Studio</a><i aria-hidden="true">›</i><span aria-current="page">{e(crumb, quote=False)}</span></nav>
  <h1>{e(title, quote=False)}</h1>
  <div class="rule"></div>
  <p class="lead">{lead}</p>

{body}
  <p class="note">This is the English version of <a href="/notes/{ja_slug}/" hreflang="ja" lang="ja">the original Japanese article</a>.</p>

  <div class="rule" style="margin:40px 0 22px"></div>
  <p class="eyebrow">More in English</p>
  <ul class="plain">
    <li><a href="/en/">All English pages</a></li>
  </ul>
</div>
</main>'''
    import os
    os.makedirs(f'en/notes/{ja_slug}', exist_ok=True)
    open(f'en/notes/{ja_slug}/index.html', 'w', encoding='utf8').write(head + main + foot)
    return {"ja": f"/notes/{ja_slug}/", "en": f"/en/notes/{ja_slug}/", "title": title, "date": "2026-10-09", "blurb": desc}
