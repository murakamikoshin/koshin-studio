"""トレカダッシュの記録を、テーマごとの記事に束ねる（2026-11-07）。
   元の記事の本文は書き直さず、そのまま節として並べる（見出しは 1 段下げる）。
   足すのは、冒頭の説明と、末尾の「それぞれの要点」（元記事の一行要約）だけ。
   旧 URL は、_redirects で新しい記事のその節へ 301 で送る。
       python3 tools/merge-notes.py
   一度きりの作業。元の記事は消すので、二度目は走らない（元が無いと止まる）。"""
import json, re, os, shutil, html as H

GROUPS = [
 dict(slug='tcg-store-matching', date_new='2026-11-07',
  ja_title='店名の照合で起きた4つの取り違え：表記ゆれ・あいまいな地図検索・「同じ応募ページ＝同じ店」・1ページ複数案件',
  ja_desc='トレカの抽選情報を集めるアプリで、店名の照合が間違えた4つの記録。ヤマダ電機とヤマダデンキの表記ゆれ、地図検索が静岡を返す件、同じ応募ページでも別の店、1つのフォームで6商品。',
  ja_intro='トレカダッシュは、店の告知や X の投稿から「どの店の、どの抽選か」を読み取って並べます。いちばん間違えやすいのが<strong>店の名前</strong>でした。同じ店が別の名前で書かれ、別の店が同じリンクを使い、あいまいな名前は地図で遠くの場所に化けます。ここには、店の照合で実際に起きた 4 つの取り違えと、その直し方を、起きた順にまとめました。',
  en_title='Four store-matching mistakes in a TCG lottery app: spelling variants, vague map lookups, shared entry pages, and one page with many products',
  en_desc='Four real cases where matching store names went wrong in a trading-card lottery app: spelling variants, a map lookup that returned Shizuoka, one entry page used by different stores, and one form for six products.',
  en_intro='Toreca Dash reads store announcements and posts on X to work out which store is running which lottery. The easiest thing to get wrong was <strong>the store’s name</strong>: the same store written differently, different stores sharing one link, and vague names turning into a far-away place on the map. These are four real store-matching mistakes and how they were fixed, in the order they happened.',
  members=['store-name-variants', 'geocode-shizuoka', 'same-page-not-same-store', 'one-page-many-cases']),
 dict(slug='tcg-product-matching', date_new='2026-11-07',
  ja_title='商品名の照合で起きた8つの失敗：英語とカタカナ、セット商品の分け方、公式カタログ、誤字の増殖',
  ja_desc='トレカの抽選記事を「どの商品の話か」に結びつける処理で起きた8つの失敗。英語表記とカタカナ、9種セットの分割、公式カタログからの商品作成、誤字の増殖、弾いた値の漏れ。',
  ja_intro='抽選の記事を「どの商品の話か」に結びつけるのは、トレカダッシュの中心の処理です。商品名は、英語とカタカナ、略称、セットの書き方、誤字で、いくらでも形を変えます。ここには、商品の照合で実際に起きた 8 つの失敗と、直し方と、測った数字を、起きた順にまとめました。',
  en_title='Eight product-matching failures in a TCG lottery app: English vs katakana, splitting sets, official catalogs and spreading typos',
  en_desc='Eight real failures in matching trading-card lottery articles to products: English vs katakana names, splitting 9-pack sets, products seeded from official catalogs, spreading typos, and leaked values.',
  en_intro='Linking each lottery article to the product it is about is the core of Toreca Dash. Product names change shape endlessly: English versus katakana, abbreviations, how sets are written, and typos. These are eight real product-matching failures, with the fixes and the numbers measured, in the order they happened.',
  members=['transliteration-gate', 'split-mixups', 'fake-products', 'torecadash-9set', 'catalog-seed-393', 'typo-catalog', 'genre-from-catalog', 'leaked-value']),
 dict(slug='silent-failures', date_new='2026-11-07',
  ja_title='エラーを出さずに壊れていた7つの事例：本物の抽選を捨てる・読めていない・失敗を握りつぶす',
  ja_desc='エラーが出ないまま、本物のデータを捨てていた、読めていなかった7つの実例。正規表現、年のない日付、切れたAIの返事、t.co の中継、案内ページ、try? で捨てた失敗、fail-open。',
  ja_intro='いちばん厄介な不具合は、<strong>エラーが出ない</strong>ものです。処理は「成功」と言い、画面には何かが出ているのに、本物の抽選が黙って捨てられていたり、リンク先を一度も読めていなかったりします。ここには、そうした「静かに壊れていた」7 つの実例と、どうやって気づいたか、どう直したかを、起きた順にまとめました。',
  en_title='Seven silent failures: real lotteries discarded, pages never read, and errors swallowed without a trace',
  en_desc='Seven real cases where nothing raised an error yet real data was being dropped or never read: regexes, dates without a year, truncated AI answers, t.co relays, notice pages, swallowed try? failures, and fail-open.',
  en_intro='The worst bugs are the ones that <strong>raise no error</strong>. The job says “success” and something shows on screen, yet real lotteries are being thrown away, or links are never actually read. These are seven such silent failures, how they were noticed and how they were fixed, in the order they happened.',
  members=['silent-discard', 'truncated-answer', 'tco-relay', 'blocked-page', 'destination-check', 'swallowed-failure', 'fail-open']),
 dict(slug='crawl-monitoring', date_new='2026-11-07',
  ja_title='巡回と監視の取りこぼしを減らした7つの記録：ページ送り・X 監視・カバー率の測り方・先着の順番待ち',
  ja_desc='抽選・先着の情報を集める巡回と監視で、取りこぼしを数えて減らした7つの記録。まとめサイトのページ送り、X 監視の漏れ、カバー率の測り方、監視の間隔と配信、順番待ちページ。',
  ja_intro='抽選や先着販売は、見逃したら終わりです。トレカダッシュは、店のサイトやまとめサイト、X を巡回して監視しています。ここには、その<strong>取りこぼしを数えて、減らした</strong> 7 つの記録をまとめました。測り方そのものが間違っていた話も入っています。',
  en_title='Seven records of cutting misses in crawling and monitoring: pagination, X monitoring, measuring coverage and waiting rooms',
  en_desc='Seven records of counting and cutting misses while crawling and monitoring lottery and first-come sales: aggregator pagination, gaps in X monitoring, how coverage was measured, intervals vs delivery, and waiting-room pages.',
  en_intro='Lotteries and first-come sales are over once you miss them. Toreca Dash crawls store sites, aggregator sites and X to watch for them. These are seven records of <strong>counting the misses and cutting them</strong>, including cases where the measurement itself was wrong.',
  members=['aggregator-pagination', 'x-monitoring-gaps', 'coverage-check', 'interval-vs-delivery', 'hot-lane', 'waiting-room', 'fill-the-gap']),
 dict(slug='scheduled-jobs', date_new='2026-11-07',
  ja_title='定期実行とサーバー運用で起きた9つのこと：タイムアウト・時間予算・配備のたびの再実行・VPS 移行',
  ja_desc='毎日・毎時動く処理と、それを載せるサーバーで起きた9つの記録。Cloud Functions から VPS への移行、3回直したタイムアウト、走っていなかった点検、配備のたびの再実行、ログの秘密。',
  ja_intro='トレカダッシュの裏では、数百本の処理が毎時・毎日動いています。止まっても誰も気づかない、動きすぎても気づかない、という種類の不具合が多い場所です。ここには、定期実行とサーバーの運用で起きた 9 つのことと、直し方を、起きた順にまとめました。',
  en_title='Nine things that happened running scheduled jobs and a server: timeouts, time budgets, re-runs on deploy and a VPS migration',
  en_desc='Nine records from the jobs that run hourly and daily, and the server under them: moving from Cloud Functions to a VPS, a timeout fixed three times, checks that never ran, re-runs on every deploy, and secrets in logs.',
  en_intro='Behind Toreca Dash, hundreds of jobs run hourly and daily. It is a place full of bugs nobody notices: jobs that stopped, and jobs that run far too often. These are nine things that happened with scheduled jobs and server operations, and how they were fixed, in the order they happened.',
  members=['vps-migration', 'secret-in-logs', 'timeout-third-fix', 'automate-sorted', 'misdiagnosis-down', 'budget-starved', 'concurrency-slots', 'audit-sweep-61', 'rerun-on-deploy']),
 dict(slug='ai-cost-cutting', date_new='2026-11-07',
  ja_title='AI と Firestore の費用を、測り直して削った5つの記録：Gemini の計器・読み取りの91%・取得の費用',
  ja_desc='個人開発のアプリで、AI（Claude・Gemini）と Firestore、取得の費用を削った5つの記録。削る前に計器を疑い、円で出して、どこに使われているかを数えた。',
  ja_intro='個人で作るアプリにとって、毎月の費用は死活問題です。トレカダッシュでは、AI の問い合わせ、データベースの読み取り、ページの取得に、お金がかかります。ここには、<strong>削る前に測り直した</strong> 5 つの記録をまとめました。「減るはず」が外れた話も、そのまま書いています。',
  en_title='Five records of measuring, then cutting, AI and Firestore costs: a broken Gemini meter, 91% of reads in one place, and crawl costs',
  en_desc='Five records of cutting AI (Claude, Gemini), Firestore and crawling costs in an indie app: doubting the meter first, converting to yen, and counting where the money actually went.',
  en_intro='For an app made by one person, the monthly bill matters. Toreca Dash pays for AI calls, database reads and page fetches. These are five records of <strong>measuring again before cutting</strong>, including the times “this should go down” turned out wrong.',
  members=['gemini-migration', 'torecadash-ai', 'scrape-cost', 'firestore-91', 'gemini-meter']),
 dict(slug='data-repair', date_new='2026-11-07',
  ja_title='データの不具合を直すときの7つの教訓：すでにあるデータ・一括処理の事故・重複の数え方・通知の関門',
  ja_desc='データの不具合を直すときに踏んだ7つの記録。関門を直しても既存データは直らない、後から掃除が入口の不具合を隠す、一括処理の事故、重複の数え方、通知は取り消せない。',
  ja_intro='入口の不具合を直しても、<strong>すでに入ってしまったデータ</strong>は直りません。逆に、後から掃除する仕組みがあると、入口の不具合が見えなくなります。ここには、データの不具合を直すときに実際に踏んだ 7 つの失敗と、そこから決めた手順を、起きた順にまとめました。',
  en_title='Seven lessons from repairing bad data: existing records, bulk-job accidents, counting duplicates and the notification gate',
  en_desc='Seven real lessons from repairing bad data: fixing the gate does not fix existing data, cleanup can hide entry bugs, a bulk job that hit everything, how duplicates were counted, and notifications that cannot be undone.',
  en_intro='Fixing the entry point does not fix <strong>data that already got in</strong>. And when something cleans up afterwards, the entry bug becomes invisible. These are seven real mistakes made while repairing data, and the procedures decided from them, in the order they happened.',
  members=['bulk-accident', 'dup-zero', 'cleanup-hides-entrance', 'weird-articles-by-route', 'fix-the-existing-data', 'self-inflicted', 'notify-gate']),
 dict(slug='app-store-review', date_new='2026-11-07',
  ja_title='App Store 審査で止まったこと：はじめての提出の「Guideline 2.1 Information Needed」と、4つのリジェクト',
  ja_desc='個人開発の iOS アプリを App Store に出すときに止まった記録。はじめての提出で来た Guideline 2.1 Information Needed の6項目と、iPad のスクリーンショットなど4つのリジェクト。',
  ja_intro='はじめて App Store にアプリを出すと、審査で何度か止まります。ここには、トレカダッシュの提出で実際に止まった記録を 2 つまとめました。リジェクトではなく「情報が足りない」と言われた件と、そのあとに止まった 4 つの件です。',
  en_title='Where App Store review stopped me: “Guideline 2.1 Information Needed” on the first submission, and four rejections',
  en_desc='Records of an indie iOS app stuck in App Store review: the six items asked for in Guideline 2.1 Information Needed on the first submission, and four rejections including iPad screenshots.',
  en_intro='The first time you submit an app to the App Store, review stops you a few times. These are two records of where Toreca Dash actually got stuck: being asked for more information rather than rejected, and the four rejections after that.',
  members=['review-info-needed', 'torecadash-review']),
]

notes = json.load(open('data/notes.json', encoding='utf8'))
en_pairs = json.load(open('data/en.json', encoding='utf8'))
by_slug = {n['slug']: n for n in notes}
en_by_ja = {p['ja']: p for p in en_pairs}

def body_ja(slug):
    s = open(f'notes/{slug}/index.html', encoding='utf8').read()
    m = s[s.index('<main'):s.index('</main>')]
    m = re.sub(r'<!--(toc|lang|byline|related|comments)-->[\s\S]*?<!--/\1-->', '', m)
    i = m.index('<p class="lead">'); i = m.index('</p>', i) + 4
    m = m[i:]
    cut = len(m)
    for pat in [r'<div class="ad-slot"', r'<!--/ad-->', r'<div class="rule" style="margin:40px', r'<p class="eyebrow">', r'\n</div>\s*$']:
        mm = re.search(pat, m)
        if mm: cut = min(cut, mm.start())
    return m[:cut].strip()

def body_en(slug):
    f = f'en/notes/{slug}/index.html'
    if not os.path.exists(f): return None
    s = open(f, encoding='utf8').read()
    m = s[s.index('<main'):s.index('</main>')]
    m = re.sub(r'<!--(toc|lang|byline|related|comments)-->[\s\S]*?<!--/\1-->', '', m)
    i = m.index('<p class="lead">'); i = m.index('</p>', i) + 4
    m = m[i:]
    cut = len(m)
    for pat in [r'<p class="note">This is the English version', r'<div class="rule" style="margin:40px', r'<div class="ad-slot"']:
        mm = re.search(pat, m)
        if mm: cut = min(cut, mm.start())
    return m[:cut].strip()

def demote(b, n):
    """見出しを 1 段下げ、id と、頁の中を指すリンクに、節の番号を付ける（頁の中で重ならないように）"""
    b = re.sub(r'<(/?)h3\b', r'<\1h4', b)
    b = re.sub(r'<(/?)h2\b', r'<\1h3', b)
    b = re.sub(r'\bid="([^"]+)"', lambda m: f'id="c{n}-{m.group(1)}"', b)
    b = re.sub(r'href="#([^"]+)"', lambda m: f'href="#c{n}-{m.group(1)}"', b)
    return b

def short(t):
    return t.split('：')[0] if '：' in t else t.split(': ')[0] if ': ' in t else t

e = lambda s: H.escape(s, quote=False)
def jdate(d, day=True):
    y, m, dd = (int(x) for x in d.split('-'))
    return f'{y} 年 {m} 月 {dd} 日' if day else f'{y} 年 {m} 月'
redirects = []
new_notes, new_pairs = [], []
removed = set()

for g in GROUPS:
    mem = [by_slug[s] for s in g['members']]
    first_date = min(n['date'] for n in mem)
    # ---- 日本語 ----
    tpl = open(f'notes/{g["members"][0]}/index.html', encoding='utf8').read()
    head = tpl[:tpl.index('<main>')]; foot = tpl[tpl.index('</main>') + 7:]
    for a, v in [('name="description"', g['ja_desc']), ('property="og:title"', g['ja_title']), ('property="og:description"', g['ja_desc'])]:
        head = re.sub(r'<meta ' + a + r' content="[^"]*">', f'<meta {a} content="{H.escape(v)}">', head)
    head = re.sub(r'<title>[\s\S]*?</title>', f'<title>{e(g["ja_title"])} — Koshin Studio</title>', head)
    secs = []
    for k, n in enumerate(mem, 1):
        secs.append(f'''  <h2 class="rv" id="s{k}">{e(n["title"])}</h2>
  <p class="note">{jdate(n["date"])}の記録。</p>
{demote(body_ja(n["slug"]), k)}''')
        redirects.append((n['url'], f'/notes/{g["slug"]}/#s{k}'))
    summary = '\n'.join(f'    <li><a href="#s{k}">{e(short(n["title"]))}</a>：{e(n["blurb"])}</li>' for k, n in enumerate(mem, 1))
    ja_main = f'''<main><div class="wrap">
  <h1>{e(g["ja_title"])}</h1>
  <div class="rule"></div>
  <p class="lead">トレカダッシュ 開発の記録 ／ {len(mem)} 件のまとめ</p>
  <p>{g["ja_intro"]}</p>
  <p class="note">それぞれの節は、もとは別々に公開していた記録です（{jdate(first_date, day=False)}から）。数字と出典は、その時の作業の記録のままです。テーマごとに読めるよう、1 つの記事にまとめ直しました（2026 年 11 月 7 日）。</p>

{chr(10).join(secs)}

  <h2 class="rv" id="s{len(mem) + 1}">それぞれの要点</h2>
  <ul>
{summary}
  </ul>
  <p>ほかの記録は、<a href="/notes/">Notes の一覧</a>から、テーマごとに読めます。トレカダッシュそのものは、<a href="/works/torecadash/">作品ページ</a>に書いています。</p>
</div></main>'''
    os.makedirs(f'notes/{g["slug"]}', exist_ok=True)
    open(f'notes/{g["slug"]}/index.html', 'w', encoding='utf8').write(head + ja_main + foot)
    new_notes.append({'slug': g['slug'], 'title': g['ja_title'], 'date': first_date, 'updated': g['date_new'], 'work': 'トレカダッシュ',
                      'url': f'/notes/{g["slug"]}/', 'blurb': g['ja_desc']})
    # ---- 英語 ----
    en_secs = []
    for k, n in enumerate(mem, 1):
        p = en_by_ja.get(n['url']); b = body_en(n['slug'])
        if p:
            redirects.append((p['en'], f'/en/notes/{g["slug"]}/#s{k}'))
        if not (p and b): continue
        en_secs.append(f'''  <h2 class="rv" id="s{k}">{e(p["title"])}</h2>
  <p class="note">Record from {n["date"]}.</p>
{demote(b, k)}''')
    if en_secs:
        en_tpl_slug = next(s for s in g['members'] if os.path.exists(f'en/notes/{s}/index.html'))
        t2 = open(f'en/notes/{en_tpl_slug}/index.html', encoding='utf8').read()
        h2 = t2[:t2.index('<main>')]; f2 = t2[t2.index('</main>') + 7:]
        for a, v in [('name="description"', g['en_desc']), ('property="og:title"', g['en_title']), ('property="og:description"', g['en_desc'])]:
            h2 = re.sub(r'<meta ' + a + r' content="[^"]*">', f'<meta {a} content="{H.escape(v)}">', h2)
        h2 = re.sub(r'<title>[\s\S]*?</title>', f'<title>{e(g["en_title"])}</title>', h2)
        en_summary = '\n'.join(f'    <li><a href="#s{k}">{e(short(en_by_ja[n["url"]]["title"]))}</a>: {e(en_by_ja[n["url"]].get("blurb", ""))}</li>'
                               for k, n in enumerate(mem, 1) if n['url'] in en_by_ja)
        en_main = f'''<main><div class="wrap">
  <nav class="crumbs" aria-label="You are here"><a href="/en/">Koshin Studio</a><i aria-hidden="true">›</i><span aria-current="page">{e(short(g["en_title"]))}</span></nav>
  <h1>{e(g["en_title"])}</h1>
  <div class="rule"></div>
  <p class="lead">Development log of Toreca Dash / {len(mem)} records in one place</p>
  <p>{g["en_intro"]}</p>
  <p class="note">Each section was first published as a separate record (from {first_date[:7]}). Numbers and sources are as in the work logs of the time. They were gathered into one article per theme on 7 November 2026.</p>

{chr(10).join(en_secs)}

  <h2 class="rv" id="s{len(mem) + 1}">Key points of each</h2>
  <ul>
{en_summary}
  </ul>
  <p class="note">This is the English version of <a href="/notes/{g["slug"]}/" hreflang="ja" lang="ja">the original Japanese article</a>.</p>
  <p>More development logs, by theme: <a href="/en/notes/" hreflang="en" lang="en">Notes</a>. About the app: <a href="/en/works/torecadash/" hreflang="en" lang="en">Toreca Dash</a>.</p>
</div>
</main>'''
        os.makedirs(f'en/notes/{g["slug"]}', exist_ok=True)
        open(f'en/notes/{g["slug"]}/index.html', 'w', encoding='utf8').write(h2 + en_main + f2)
        new_pairs.append({'ja': f'/notes/{g["slug"]}/', 'en': f'/en/notes/{g["slug"]}/', 'title': g['en_title'],
                          'date': g['date_new'], 'blurb': g['en_desc']})
    removed.update(g['members'])

# ---- 一覧（notes.json / en.json）を入れ替える ----
notes = [n for n in notes if n['slug'] not in removed] + new_notes
notes.sort(key=lambda n: n['date'], reverse=True)
open('data/notes.json', 'w', encoding='utf8').write(json.dumps(notes, ensure_ascii=False, indent=2) + '\n')
en_pairs = [p for p in en_pairs if not (p['ja'].startswith('/notes/') and p['ja'].split('/')[2] in removed)] + new_pairs
open('data/en.json', 'w', encoding='utf8').write(json.dumps(en_pairs, ensure_ascii=False, indent=2) + '\n')

# ---- 旧 URL → 新しい節（301）。元の頁は消す ----
json.dump(redirects, open('tools/merge-notes-map.json', 'w', encoding='utf8'), ensure_ascii=False, indent=1)
for s in removed:
    for d in (f'notes/{s}', f'en/notes/{s}'):
        if os.path.isdir(d): shutil.rmtree(d)
    for og in (f'assets/og/og_notes_{s}.jpg', f'assets/og/og_en_notes_{s}.jpg'):
        if os.path.exists(og): os.remove(og)
print(f'{len(GROUPS)} 本にまとめた（元 {len(removed)} 本）。転送 {len(redirects)} 件')
