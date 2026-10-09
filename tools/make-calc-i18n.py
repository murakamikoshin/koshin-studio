"""計算機の多言語化。calc/i18n.js（実行時の文字列）と、各言語のページを書き出す。
   文面は tools/calc-i18n-data.py と tools/calc-pages-data.py。"""
import json, re, os, html as H
exec(open('tools/calc-i18n-data.py', encoding='utf8').read())
exec(open('tools/calc-pages-data.py', encoding='utf8').read())
langs = json.load(open('data/langs.json', encoding='utf8'))
e = lambda s: H.escape(s, quote=True)

# 1. 実行時の文字列
open('calc/i18n.js', 'w', encoding='utf8').write(
  '/* 計算機の画面に出す文字列。tools/make-calc-i18n.py が書き出す（直接は直さない） */\n'
  'window.CALC_I18N = ' + json.dumps(RT, ensure_ascii=False, indent=1) + ';\n')

COMMON = r'''  var $ = function (id) { return document.getElementById(id); };
  var out = $('out');
  var LANG = document.documentElement.lang || 'ja';
  var T = (window.CALC_I18N || {})[LANG.split('-')[0]] || window.CALC_I18N.ja;
  var f = function (s, o) { return s.replace(/\{(\w+)\}/g, function (m, k) { return o[k]; }); };
  var money = function (x) { return f(T.money, { n: Math.round(x).toLocaleString(LANG === 'ja' ? 'ja-JP' : LANG) }); };
  var paren = function (s) { return f(T.paren, { x: s }); };
  var pct = function (x) { return x * 100 >= 99.95 ? T.pctMax : (x * 100).toFixed(1) + '%'; };
  function num(id) { var v = $(id).value; return v === '' ? null : Number(v); }
'''
G = r'''(function () {
''' + COMMON + r'''  function render() {
    var n = num('n'), k = num('k') || 0, price = num('price'), set = num('set'), m = num('m');
    if (!n || n < 2 || n > 100 || n !== Math.floor(n)) { out.innerHTML = '<p class="note">' + T.g_errN + '</p>'; return; }
    if (k < 0 || k >= n || k !== Math.floor(k)) { out.innerHTML = '<p class="note">' + T.g_errK + '</p>'; return; }
    var r = window.gachaCalc(n, k);
    var cost = function (t) { return price ? paren(money(t * price)) : ''; };
    var h = '<div class="calc-main"><p>' + T.avg + '</p><p class="big">' + f(T.big, { n: r.expected.toFixed(1) }) + '</p>' +
      (price ? '<p>' + money(r.expected * price) + '</p>' : '') + '</div><ul>' +
      '<li>' + f(T.g_dup, { n: r.expectedDup.toFixed(1) }) + '</li>' +
      '<li>' + f(T.g_p50, { n: r.p50, c: cost(r.p50) }) + '</li>' +
      '<li>' + f(T.g_p90, { n: r.p90, c: cost(r.p90) }) + '</li>' +
      '<li>' + f(T.g_p99, { n: r.p99, c: cost(r.p99) }) + '</li>';
    if (m !== null && m >= 0) h += '<li>' + f(T.g_after, { m: Math.floor(m), p: pct(r.within(Math.floor(m))) }) + '</li>';
    if (set && price) {
      var cnt = Math.floor(set / price), p = r.within(cnt);
      h += '<li>' + f(set < r.expected * price ? T.g_setCheap : T.g_setPricey,
        { price: money(set), cnt: cnt, p: pct(p), avgc: money(r.expected * price) }) + '</li>';
    }
    out.innerHTML = h + '</ul>';
  }
  ['n', 'k', 'price', 'set', 'm'].forEach(function (id) { $(id).addEventListener('input', render); });
  render();
})();
'''
R = r'''(function () {
''' + COMMON + r'''  function render() {
    var p = num('p'), k = num('k'), N = num('N'), price = num('price'), m = num('m');
    if (!p || p < 0.001 || p > 100) { out.innerHTML = '<p class="note">' + T.r_errP + '</p>'; return; }
    if (!k || k < 1 || k > 10 || k !== Math.floor(k)) { out.innerHTML = '<p class="note">' + T.r_errK + '</p>'; return; }
    if (N !== null && (N < 2 || N > 500 || N !== Math.floor(N))) { out.innerHTML = '<p class="note">' + T.r_errN + '</p>'; return; }
    if (!N && p < 0.05 && k > 3) { out.innerHTML = '<p class="note">' + T.r_errHeavy + '</p>'; return; }
    var r = window.rateCalc(p / 100, k, N || 0);
    var cost = function (t) { return price ? paren(money(t * price)) : ''; };
    var h = '<div class="calc-main"><p>' + T.avg + '</p><p class="big">' + f(T.big, { n: r.expected.toFixed(1) }) + '</p>' +
      (price ? '<p>' + money(r.expected * price) + '</p>' : '') + '</div><ul>' +
      '<li>' + f(T.r_p50, { n: r.p50, c: cost(r.p50) }) + '</li>' +
      '<li>' + f(T.r_p90, { n: r.p90, c: cost(r.p90) }) + '</li>' +
      '<li>' + f(T.r_p99, { n: r.p99, c: cost(r.p99) }) + '</li>';
    if (N) h += '<li>' + f(T.r_pity, { n1: N - 1, p: pct(r.reachPity) }) + '</li>' +
      '<li>' + f(T.r_max, { t: k * N, c: cost(k * N), k: k }) + '</li>';
    if (m !== null && m >= 0) h += '<li>' + f(T.r_after, { m: Math.floor(m), k: k, p: pct(r.within(Math.floor(m))) }) + '</li>';
    out.innerHTML = h + '</ul>';
  }
  ['p', 'k', 'N', 'price', 'm'].forEach(function (id) { $(id).addEventListener('input', render); });
  render();
})();
'''
open('calc/gacha/page.js', 'w', encoding='utf8').write(G)
open('calc/gacha-rate/page.js', 'w', encoding='utf8').write(R)

# 2. 日本語ページに i18n.js を足す
for slug in ('gacha', 'gacha-rate'):
    p = f'calc/{slug}/index.html'; s = open(p, encoding='utf8').read()
    tag = '<script src="/calc/i18n.js" defer></script>\n  '
    if '/calc/i18n.js' not in s:
        s = s.replace(f'<script src="/calc/{slug}/', tag + f'<script src="/calc/{slug}/', 1)
        open(p, 'w', encoding='utf8').write(s)

# 3. 各言語のページ
FORMS = {
 'g': ['<input type="number" id="n" min="2" max="100" value="5" inputmode="numeric">', '<input type="number" id="k" min="0" max="99" value="0" inputmode="numeric">',
       '<input type="number" id="price" min="0" value="300" inputmode="numeric">', '<input type="number" id="set" min="0" placeholder="1500" inputmode="numeric">',
       '<input type="number" id="m" min="0" placeholder="10" inputmode="numeric">'],
 'r': ['<input type="number" id="p" min="0.001" max="100" step="any" value="3" inputmode="decimal">', '<input type="number" id="k" min="1" max="10" value="1" inputmode="numeric">',
       '<input type="number" id="N" min="2" max="500" placeholder="90" inputmode="numeric">', '<input type="number" id="price" min="0" placeholder="300" inputmode="numeric">',
       '<input type="number" id="m" min="0" placeholder="100" inputmode="numeric">'],
}
SLUG = {'g': 'gacha', 'r': 'gacha-rate'}
for code, L in langs.items():
    P = PG[code]
    for key in ('g', 'r'):
        d = P[key]; slug = SLUG[key]; other = SLUG['r' if key == 'g' else 'g']
        src = open(f'calc/{slug}/index.html', encoding='utf8').read()
        head = src[:src.index('<main>')]; foot = src[src.index('</main>') + 7:]
        foot = re.sub(r'<footer class="site">.*?</footer>', '<footer class="site"><div class="wrap"></div></footer>', foot, flags=re.S)
        head = re.sub(r'<title>.*?</title>', f'<title>{e(d["title"])} — Koshin Studio</title>', head, flags=re.S)
        head = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{e(d["desc"])}">', head)
        head = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{e(d["h1"])}">', head)
        head = re.sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{e(d["lead"])}">', head)
        head = head.replace('<html lang="ja">', f'<html lang="{L["lang"]}">')
        labels = ''.join(f'    <label>{e(lab)}{inp}</label>\n' for lab, inp in zip(d['lab'], FORMS[key]))
        lim = ''.join(f'    <li>{x}</li>\n' for x in d['lim'])
        main = f'''<main><div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="{L["path"]}">Koshin Studio</a><i aria-hidden="true">›</i><span aria-current="page">{e(d["h1"])}</span></nav>
  <h1>{e(d["h1"])}</h1>
  <div class="rule"></div>
  <p class="lead">{e(d["lead"])}</p>

  <p>{d["intro"]}</p>

  <form class="calc" id="calc" onsubmit="return false">
{labels}  </form>

  <div class="calc-out" id="out" aria-live="polite"></div>

  <h2 class="rv">{e(d["how_h"])}</h2>
  <p>{d["how"]}</p>

  <h2 class="rv">{e(d["lim_h"])}</h2>
  <ul>
{lim}  </ul>

  <p class="note">{d["other"].replace("{o}", L["path"] + "calc/" + other + "/")}</p>

  <script src="/calc/i18n.js" defer></script>
  <script src="/calc/{slug}/{"gacha.js" if key == "g" else "rate.js"}" defer></script>
  <script src="/calc/{slug}/page.js" defer></script>
</div>
</main>'''
        out = L['path'].strip('/') + f'/calc/{slug}'
        os.makedirs(out, exist_ok=True)
        open(out + '/index.html', 'w', encoding='utf8').write(head + main + foot)
print('ok')
