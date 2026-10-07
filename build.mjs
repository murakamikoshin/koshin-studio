/* ============================================================
   サイトの組み立て
     ・ゲーム本体と絵を、配る形に並べる
     ・data/*.json から、一覧のページを書き出す
   作品が増えたら data/works.json に一行足して、これを走らせるだけ。
       node site/build.mjs
   ============================================================ */
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const here = import.meta.dirname;

/* 公開先。独自ドメインを繋いだら data/site.json の url を書き換える。
   canonical・og・sitemap・feed・構造化データが全部ここを見ているので、
   直すのはその一箇所でよい。一度だけ試したい時は SITE_URL= で上書きできる */
const SITE = (process.env.SITE_URL
  || (existsSync(here + '/data/site.json')
      ? (JSON.parse(readFileSync(here + '/data/site.json', 'utf8')).url || '')
      : '')
  || 'https://koshin-studio.pages.dev').replace(/\/+$/, '');

/* ゲーム本体はこのリポジトリには無い。
   作品は、それぞれ自分の場所から配信している（sushitsumu なら
   sushitsumu.koshinstudio.com）。ここが持つのは紹介と行き先だけ。
   遊ぶ先は data/works.json の play に書く。

   絵（表紙・画面写真）は出来上がったものを assets/ に置いてある。
   撮り直したいときだけ、ゲームのリポジトリを隣に置いて
   tools/shots.mjs と tools/images.py を走らせる。 */

/* ---- 部品 ---- */
const read = (p) => JSON.parse(readFileSync(here + p, 'utf8'));
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const works = read('/data/works.json');
const notes = read('/data/notes.json');
const kinds = read('/data/kinds.json');
const conf  = existsSync(here + '/data/site.json') ? read('/data/site.json') : { social: [], ads: {} };
const stack = existsSync(here + '/data/stack.json') ? read('/data/stack.json') : { groups: [] };

/* ---- 中身が変わったら、名前も変える ----
   style.css と motion.js は名前が変わらないので、一度読ませると
   ブラウザがしばらく持ち続ける（_headers で一日）。直して配っても
   古いものが動き続けてしまうので、中身の印を尻に付けて別物にする。
   書体も同じ。字を足して作り直したのに古いものを掴むと、豆腐になる。 */
const stamp = (rel) => {
  const f = here + rel;
  if (!existsSync(f)) return '';
  return createHash('sha1').update(readFileSync(f)).digest('hex').slice(0, 8);
};
const stamped = (rel) => { const v = stamp(rel); return v ? rel + '?v=' + v : rel; };

/* 絵の在り処は拡張子なしで持つ決まり。古い書き方（.png 付き）も受ける */
const base = (p) => String(p || '').replace(/\.(png|jpe?g|webp|avif|gif)$/i, '');

const head = (title, desc, extra = '') => `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="theme-color" content="#fbfaf7" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#070c17" media="(prefers-color-scheme: dark)">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:type" content="website">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script>document.documentElement.className+=" js"</script>
<link rel="stylesheet" href="/style.css">${extra}
</head>
<body>
<canvas id="motes"></canvas>

<header class="site"><div class="wrap">
  <a class="logo" href="/">Koshin Studio</a>
  <nav><a href="/works/">Works</a><a href="/notes/">Notes</a><a href="/anime/">診断</a><a href="/about/">About</a></nav>
</div></header>
`;
const socialHtml = (conf.social || []).map((x) =>
  `<a class="sns" href="${x.url}" rel="me noopener" target="_blank">${esc(x.label)}<i>${esc(x.handle || '')}</i></a>`
).join('');

const foot = `
<footer class="site"><div class="wrap">
  <span>© 2026 Koshin Studio</span>
  <div class="sns-row">${socialHtml}</div>
  <nav><a href="/about/">About</a><a href="/privacy/">あつかい</a></nav>
</div></footer>
<script src="/motion.js" defer></script>
</body>
</html>
`;

/* 絵は拡張子を付けずに持つ。webp を先に出し、読めない相手には jpg を渡す。
   元の PNG は重すぎるので配らない */
const workCard = (w, i) => `      <li class="rv" data-kind="${w.kind}" data-delay="${i * 70}"><a class="work" href="${w.url}">
        <picture>
          <source srcset="${base(w.cover)}.webp 360w, ${base(w.cover)}@2x.webp 720w" sizes="132px" type="image/webp">
          <img src="${base(w.cover)}.jpg" srcset="${base(w.cover)}.jpg 360w, ${base(w.cover)}@2x.jpg 720w" sizes="132px"
               alt="${esc(w.title)}の表紙" width="${w.coverW || 720}" height="${w.coverH || 720}" loading="lazy" decoding="async">
        </picture>
        <div>
          <h3>${esc(w.title)}</h3>
          <p>${esc(w.blurb)}</p>
          <div class="tags"><span class="tag tag-kind">${kinds[w.kind].ja}</span>${
            w.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')
          }<span class="tag">${esc(w.year)}</span></div>
        </div>
      </a></li>`;

/* ---- /works/ ---- */
const chips = ['<button class="chip on" data-f="all">All<i>すべて</i></button>']
  .concat(Object.keys(kinds).map((k) =>
    `<button class="chip" data-f="${k}">${kinds[k].label}<i>${kinds[k].ja}</i></button>`)).join('');

writeFileSync(here + '/works/index.html',
  head('Works — ブラウザゲーム・アプリ・Web サイトの制作一覧 — Koshin Studio', 'これまでに作ったものの一覧。ブラウザゲーム、スマートフォンのアプリ、Web サイト、3D モデル。分野で絞り込めます。') +
`<main><div class="wrap">
  <h1>Works</h1>
  <div class="rule"></div>
  <p class="lead">作ったものの一覧です。増えたらここに並びます。</p>

  <h2 class="sr">作品の一覧</h2>
  <div class="chips rv">${chips}</div>
  <ul class="works" id="worklist">
${works.map(workCard).join('\n')}
  </ul>
  <p class="soon rv" id="empty" hidden>こ の 種 類 は ま だ あ り ま せ ん</p>
  <p class="soon rv" style="margin-top:22px">次 の 作 品 を 用 意 し て い ま す</p>
</div></main>` + foot);

/* ---- 使っている道具 ---- */
if (existsSync(here + '/about/index.html')) {
  const html = (stack.groups || []).map((g, gi) => `  <section class="stack-g">
    <h2 class="rv">${esc(g.name)}</h2>
    <div class="stack">
${g.items.map((it, i) => `      <div class="si rv" data-delay="${i * 40}">
        <b>${esc(it.n)}</b><span class="lv" data-l="${esc(it.level)}">${esc(it.level)}</span>
        <p>${esc(it.d)}</p>
      </div>`).join('\n')}
    </div>
  </section>`).join('\n');
  const f = here + '/about/index.html';
  writeFileSync(f, readFileSync(f, 'utf8').replace(
    /<!--stack:start-->[\s\S]*?<!--stack:end-->/,
    '<!--stack:start-->\n' + html + '\n  <!--stack:end-->'));
}

/* ---- /anime/ ガチアニメ診断の読みもの ----
   診断そのものは別リポジトリ（/app/shindananime/）。ここは、その 6 軸と
   64 タイプを読ませるページ。材料は data/anime-axes.json（手書き）と
   data/anime-types.json（tools/anime-types.mjs が診断本体から書き出す）。 */
const animeAxes = read('/data/anime-axes.json').axes;
const animeData = read('/data/anime-types.json');
const animeTypes = animeData.types;
const typeByCode = Object.fromEntries(animeTypes.map((t) => [t.code, t]));
const typeUrl = (code) => `/anime/types/${code.toLowerCase()}/`;
const APP = (works.find((w) => w.slug === 'shindananime') || {}).play || '/app/shindananime/';
const sideOf = (t, i) => (t.letters[i] === animeAxes[i].pos.l ? animeAxes[i].pos : animeAxes[i].neg);
const codeOf = (letters) => letters.slice(0, 4).join('') + '-' + letters.slice(4).join('');
const flip = (t, i) => {
  const l = t.letters.slice();
  l[i] = l[i] === animeAxes[i].pos.l ? animeAxes[i].neg.l : animeAxes[i].pos.l;
  return typeByCode[codeOf(l)];
};
const opposite = (t) => typeByCode[codeOf(t.letters.map((x, i) =>
  (x === animeAxes[i].pos.l ? animeAxes[i].neg.l : animeAxes[i].pos.l)))];
const ctaBtn = (label) => `<p class="rv" style="margin-top:30px"><a class="btn" data-play="shindananime" href="${APP}">${label}</a><a class="btn ghost" href="/works/shindananime/">この診断について</a></p>`;
const typeChip = (t) => `<a class="type-chip" href="${typeUrl(t.code)}"><b>${t.code}</b><span>${esc(t.nickname)}</span></a>`;

/* タイプ別ページは自動生成で薄い。本人の言葉（data/anime-types.json の note）が
   入るまでは、検索に載せない（noindex）。入ったものだけ sitemap にも入る */
const writeAnime = (rel, html) => {
  const m = rel.match(/^\/anime\/types\/([^/]+)\/index\.html$/);
  if (m && !(typeByCode[m[1].toUpperCase()] || {}).note)
    html = html.replace('</head>', '<meta name="robots" content="noindex,follow">\n</head>');
  const f = here + rel;
  mkdirSync(f.slice(0, f.lastIndexOf('/')), { recursive: true });
  writeFileSync(f, html);
};

/* 入口 */
const featured = ['RDCP-VM', 'FHSA-TL', 'FDCA-VM', 'RHSP-TL'].map((c) => typeByCode[c]);
writeAnime('/anime/index.html',
  head('診断 — ガチアニメ診断の読みもの：6つの軸と64タイプ — Koshin Studio',
       'ガチアニメ診断の解説。6つの軸の意味、64タイプの二つ名と特徴、タイプごとに近いアニメ作品をまとめています。') +
`<main><div class="wrap">
  <h1>診断</h1>
  <div class="rule"></div>
  <p class="lead">ガチアニメ診断の読みもの。<br>6つの軸と64タイプが、それぞれ何を表しているかを書いています。</p>

  <h2 class="rv">診断のしくみ</h2>
  <p class="rv">ガチアニメ診断は、12問から最大50問までの選択式の質問から、アニメの好みを<strong>6つの軸</strong>で測ります。軸ごとにどちら側へ寄ったかを文字で表し、並べたものがタイプコード（例: <code>RDCP-VM</code>）です。6軸それぞれが2択なので、組み合わせは2の6乗で<strong>64タイプ</strong>になります。</p>
  <p class="rv" data-delay="60">作品の側にも、同じ6軸の値が付いています。診断の結果は、あなたの6軸と作品の6軸をベクトルとして並べて、近さ（コサイン類似度）で選びます。タイプのページに並ぶ作品は、そのタイプの軸の向きに近い作品を、診断と同じ計算で選んだものです。</p>
  ${ctaBtn('診断をはじめる（無料・1分）')}

  <h2 class="rv">6つの軸</h2>
  <div class="kinds">
${animeAxes.map((a, i) => `    <div class="kind rv" data-delay="${i * 60}"><h3>${esc(a.label)}<i>${a.pos.l} / ${a.neg.l}</i></h3>
      <p>${esc(a.ask)}。${esc(a.pos.name)}か、${esc(a.neg.name)}か。</p></div>`).join('\n')}
  </div>
  <p class="rv"><a href="/anime/axes/">6つの軸を詳しく読む →</a></p>

  <h2 class="rv">64タイプ</h2>
  <p class="rv">二つ名は、世界観×後味、構成×テイスト、視覚×視聴スタイルの組み合わせから決まります。まずは、よくあるタイプを4つ。</p>
  <div class="type-list rv">${featured.map(typeChip).join('')}</div>
  <p class="rv"><a href="/anime/types/">64タイプの一覧を見る →</a></p>
</div></main>` + foot);

/* 6 軸の解説 */
writeAnime('/anime/axes/index.html',
  head('6つの軸 — ガチアニメ診断が測っているもの — Koshin Studio',
       '世界観、後味・刺激、構成・テンポ、サブテイスト、視覚・フェチ、視聴スタイル。ガチアニメ診断の6つの軸が何を測っているかを解説します。') +
`<main><div class="wrap">
  <h1>6つの軸</h1>
  <div class="rule"></div>
  <p class="lead">ガチアニメ診断が測っているのは、この6つ。<br>それぞれ2択で、どちら側に寄ったかが文字になります。</p>
${animeAxes.map((a) => `
  <h2 class="rv">${esc(a.label)}<span class="axis-code"> ${a.pos.l} / ${a.neg.l}</span></h2>
  <p class="rv"><em>${esc(a.ask)}</em></p>
  <p class="rv">${esc(a.body)}</p>
  <div class="axis-sides rv">
    <div><b>${a.pos.l} — ${esc(a.pos.name)}</b><p>${esc(a.pos.desc)}</p></div>
    <div><b>${a.neg.l} — ${esc(a.neg.name)}</b><p>${esc(a.neg.desc)}</p></div>
  </div>`).join('\n')}

  <h2 class="rv">画質・年代の好みについて</h2>
  <p class="rv">タイプコードには入らない項目として、「新しめ・高画質が好きか、年代は問わないか」も聞いています。同じタイプでも、この好みと、好き・苦手なジャンルの違いで、選ばれる作品は変わります。</p>
  ${ctaBtn('診断をはじめる（無料・1分）')}
  <p class="rv"><a href="/anime/types/">64タイプの一覧へ →</a></p>
</div></main>` + foot);

/* 64 タイプの一覧。世界観×後味の 4 グループに分ける */
const groups = [['R', 'D'], ['R', 'H'], ['F', 'D'], ['F', 'H']].map(([w, m]) => ({
  title: `${animeAxes[0][w === 'R' ? 'pos' : 'neg'].name} × ${animeAxes[1][m === 'D' ? 'pos' : 'neg'].name}`,
  list: animeTypes.filter((t) => t.letters[0] === w && t.letters[1] === m),
}));
writeAnime('/anime/types/index.html',
  head('64タイプ一覧 — ガチアニメ診断のタイプと二つ名 — Koshin Studio',
       'ガチアニメ診断の64タイプの一覧。世界観と後味の組み合わせで4つに分けて、二つ名とタイプコードを並べています。') +
`<main><div class="wrap">
  <h1>64タイプ</h1>
  <div class="rule"></div>
  <p class="lead">6つの軸の組み合わせで、64タイプ。<br>世界観と後味で4つに分けて並べています。</p>
${groups.map((g) => `
  <h2 class="rv">${esc(g.title)}</h2>
  <div class="type-list rv">${g.list.map(typeChip).join('')}</div>`).join('\n')}
  ${ctaBtn('自分のタイプを診断する')}
</div></main>` + foot);

/* タイプ別 */
for (const t of animeTypes) {
  const opp = opposite(t);
  const six = t.letters.map((_, i) => {
    const a = animeAxes[i], me = sideOf(t, i), other = t.letters[i] === a.pos.l ? a.neg : a.pos;
    return `    <li><b>${esc(a.label)}　${me.l} ${esc(me.name)}</b><span>${esc(me.desc)}。<i>反対側は${other.l}（${esc(other.name)}）</i></span></li>`;
  }).join('\n');
  const near = t.works.slice(0, 5).map((w) =>
    `    <li>${esc(w.title)}${w.year ? `<span>${w.year}</span>` : ''}</li>`).join('\n');
  const nb = animeAxes.map((a, i) => {
    const o = flip(t, i);
    return `<a class="type-chip" href="${typeUrl(o.code)}"><b>${o.code}</b><span>${esc(a.label)}だけ反対側（${esc(sideOf(o, i).name)}）</span></a>`;
  }).join('');
  writeAnime(`${typeUrl(t.code)}index.html`,
    head(`${t.code}「${t.nickname}」 — ガチアニメ診断のタイプ解説 — Koshin Studio`,
         `ガチアニメ診断のタイプ ${t.code}「${t.nickname}」の特徴。6つの軸の向き、近いアニメ作品、1軸だけ違うタイプを紹介します。`) +
`<main><div class="wrap">
  <h1>${t.code}<span class="type-nick">${esc(t.nickname)}</span></h1>
  <div class="rule"></div>
  <p class="lead">ガチアニメ診断の64タイプのひとつ。<br>6つの軸は、こう向いています。</p>

  <ul class="axis-rows rv">
${six}
  </ul>

  <h2 class="rv">このタイプに近い作品</h2>
  <p class="rv">${t.code} の軸の向きに近い作品を、診断と同じ計算で選んだものです。実際の診断では、画質・年代や好きなジャンルの回答も加わるので、人によって結果は変わります。</p>
  <ul class="near rv">
${near}
  </ul>

  <h2 class="rv">1つだけ違うタイプ</h2>
  <p class="rv">6つの軸のうち、1つだけ反対側になるタイプです。気分や時期でこちらに動く人も多いはずです。</p>
  <div class="type-list rv">${nb}</div>

  <h2 class="rv">正反対のタイプ</h2>
  <p class="rv">6軸がすべて反対側になるタイプ。</p>
  <div class="type-list rv">${typeChip(opp)}</div>

  ${ctaBtn('診断で確かめる（無料・1分）')}
  <p class="rv"><a href="/anime/types/">64タイプの一覧へ</a>　<a href="/anime/axes/">6つの軸の解説へ</a></p>
</div></main>` + foot);
}

/* ---- 記録の配信（RSS） ---- */
writeFileSync(here + '/feed.xml',
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n<channel>\n' +
  `  <title>Koshin Studio — Notes</title>\n  <link>${SITE}/notes/</link>\n` +
  '  <description>作りながら考えたことの記録</description>\n  <language>ja</language>\n' +
  `  <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml"/>\n` +
  notes.map((n) => `  <item>\n    <title>${esc(n.title)}</title>\n` +
    `    <link>${SITE}${n.url}</link>\n    <guid isPermaLink="true">${SITE}${n.url}</guid>\n` +
    `    <pubDate>${new Date(n.date + 'T00:00:00+09:00').toUTCString()}</pubDate>\n` +
    `    <description>${esc(n.blurb)}</description>\n  </item>`).join('\n') +
  '\n</channel>\n</rss>\n');

/* ---- /notes/ ---- */
const noteRow = (n, i) => `    <li class="rv" data-delay="${i * 70}"><a class="note-row" href="${n.url}">
      <time datetime="${n.date}">${n.date.replace(/-/g, '.')}</time>
      <div><h3>${esc(n.title)}</h3><p>${esc(n.blurb)}</p>
      <div class="tags"><span class="tag">${esc(n.work)}</span></div></div>
    </a></li>`;

writeFileSync(here + '/notes/index.html',
  head('Notes — 作りながら考えたことの記録 — Koshin Studio', '作りながら考えたことの記録。数字を取って直した話が中心です。') +
`<main><div class="wrap">
  <h1>Notes</h1>
  <div class="rule"></div>
  <p class="lead">作りながら考えたことの記録。<br>勘で直す前に、まず測る——という話が多いです。</p>
  <h2 class="sr">記録の一覧</h2>
  <ul class="notes">
${notes.map(noteRow).join('\n')}
  </ul>
</div></main>` + foot);

/* ---- トップ ---- */
const kindKeys = Object.keys(kinds);

/* まわりを回るもの：作品の表紙が先、足りない分は分野の札で埋める */
const orbitCells = []
  .concat(works.map((w) => ({
    href: w.url, img: w.cover, label: w.title, sub: kinds[w.kind].ja,
  })))
  .concat(kindKeys.map((k) => ({
    href: '/works/#' + k, label: kinds[k].label, sub: kinds[k].ja, note: kinds[k].note,
  })));

const orbitHtml = orbitCells.map((c, i) => `      <a class="orb${c.img ? ' has-img' : ''}" href="${c.href}" style="--i:${i}">
        ${c.img
          ? `<picture><source srcset="${base(c.img)}.webp" type="image/webp"><img src="${base(c.img)}.jpg" alt="${esc(c.label)}" width="360" height="360" loading="eager" decoding="async"></picture>`
          : `<span class="orb-mark">${esc(c.label)}</span>`}
        <span class="orb-cap">${esc(c.img ? c.label : c.sub)}</span>
      </a>`).join('\n');

/* 分野の札（本文側） */
const kindHtml = kindKeys.map((k, i) => {
  const n = works.filter((w) => w.kind === k).length;
  return `      <a class="kind rv" data-delay="${i * 70}" href="/works/#${k}">
        <span class="kind-n">${String(i + 1).padStart(2, '0')}</span>
        <h3>${kinds[k].label}<i>${kinds[k].ja}</i></h3>
        <p>${kinds[k].note}</p>
        <span class="kind-count">${n ? n + ' 点' : '準備中'}</span>
      </a>`;
}).join('\n');

/* 表紙に出す作ったもの。/works/ と同じ札をそのまま使うので、
   作品が増えたら表紙もそのまま育つ。一つの作品を大写しにすると、
   その一つのための場所に見えてしまう */
const worksTeaser = works.slice(0, 3).map(workCard).join('\n');

/* 記録の抜粋 */
const noteTeaser = notes.slice(0, 3).map(noteRow).join('\n');

let home = readFileSync(here + '/index.html', 'utf8');
const put = (key, body) => {
  home = home.replace(
    new RegExp('<!--' + key + ':start-->[\\s\\S]*?<!--' + key + ':end-->'),
    '<!--' + key + ':start-->\n' + body + '\n    <!--' + key + ':end-->'
  );
};
const logoSvg = existsSync(here + '/assets/logotype.svg')
  ? readFileSync(here + '/assets/logotype.svg', 'utf8').replace(/\n\s*/g, ' ')
  : '';
put('logo', logoSvg);
put('orbit', orbitHtml);
put('kinds', kindHtml);
put('works', worksTeaser);
put('notes', noteTeaser);
writeFileSync(here + '/index.html', home);


/* ============================================================
   さがしてもらうための下ごしらえ
     ・正規 URL（canonical）と og:url を全ページに入れる
     ・構造化データ（JSON-LD）を、ページの種類に応じて入れる
     ・sitemap.xml と robots.txt を書き出す
   手で書いたページにも後から差し込むので、ページを足しても勝手に付く。
   ============================================================ */
function walk(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = dir + '/' + e.name;
    if (e.isDirectory()) {
      if (['vendor', 'assets', 'data', 'tools'].includes(e.name)) continue;
      if (full.endsWith('/works/sushitsumu/play')) continue;
      walk(full, out);
    } else if (e.name.endsWith('.html') && e.name !== '404.html') out.push(full);
  }
  return out;
}

const pages = walk(here).sort();
const urlOf = (f) => {
  let u = f.slice(here.length).replace(/\/index\.html$/, '/');
  if (!u.endsWith('/') && u.endsWith('.html')) u = u;
  return SITE + (u === '' ? '/' : u);
};

const workBySlug = Object.fromEntries(works.map((w) => [w.slug, w]));
const noteBySlug = Object.fromEntries(notes.map((n) => [n.slug, n]));

/* 本名は書かない。確かめようのないことを構造化データに入れると、
   検索側にも読む人にも嘘をつくことになる。
   代わりに、footer に出しているのと同じ公開の持ち場だけを繋ぐ */
const PERSON = {
  '@type': 'Organization', '@id': SITE + '#studio', name: 'Koshin Studio',
  url: SITE, description: 'ブラウザゲームと診断アプリを個人で制作し、作り方と検証の記録を書いています。',
  logo: SITE + '/assets/og/og_home.jpg',
  sameAs: (conf.social || []).map((x) => x.url),
};

/* og 画像の在り処。head に入れるものと同じ絵を構造化データからも指す */
const ogFor = (rel) => {
  const n = 'og' + (rel === '/index.html' ? '_home'
    : rel.replace(/\/index\.html$/, '').replace(/\.html$/, '').replace(/\//g, '_')) + '.jpg';
  return existsSync(here + '/assets/og/' + n)
    ? SITE + '/assets/og/' + n
    : rel.startsWith('/anime/') ? SITE + '/assets/og/og_works_shindananime.jpg'
    : SITE + '/assets/sushitsumu-wide.jpg';
};

function ldFor(file, url) {
  const rel = file.slice(here.length);
  const page = (name) => ({ '@type': 'WebPage', name: name, url: url,
    inLanguage: 'ja', isPartOf: { '@id': SITE + '#studio' }, primaryImageOfPage: ogFor(rel) });
  const crumbs = (trail) => ({
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem', position: i + 1, name: t[0], item: SITE + t[1],
    })),
  });
  if (rel === '/index.html') {
    return [
      PERSON,
      { '@type': 'WebSite', url: SITE, name: 'Koshin Studio', publisher: { '@id': SITE + '#studio' },
        inLanguage: 'ja' },
      { '@type': 'ItemList', name: '作ったもの',
        itemListElement: works.map((w, i) => ({
          '@type': 'ListItem', position: i + 1, url: SITE + w.url, name: w.title })) },
    ];
  }
  const wm = rel.match(/^\/works\/([^/]+)\/index\.html$/);
  if (wm && workBySlug[wm[1]]) {
    const w = workBySlug[wm[1]];
    const type = w.kind === 'game' ? 'VideoGame' : 'SoftwareApplication';
    /* 絵と分野は作品ごとに違う。ここを決め打ちにしていたせいで、
       どの作品の構造化データにも すし積む の絵と「落ち物パズル」が
       入っていた。検索側には「中身と合っていない」と読まれる。
       image は works.json の image → 表紙の @2x → 共有カード の順で拾う。
       genre は書いてある作品だけに入れる（嘘を書くより落とす） */
    const wImage = w.image ? SITE + w.image
      : w.cover ? SITE + w.cover + '@2x.jpg'
      : ogFor(rel);
    return [
      { '@type': type, name: w.title, url: SITE + w.url, description: w.blurb,
        inLanguage: 'ja', image: wImage,
        /* category は作品ごとに違うことがある（診断アプリを「実用」に
           入れるのは実態と合わない）ので、works.json の category が
           あればそちらを使う。無ければ今まで通りの決め打ち */
        applicationCategory: w.category || (w.kind === 'game' ? 'GameApplication' : 'UtilitiesApplication'),
        operatingSystem: 'Web', datePublished: w.year,
        ...(w.kind === 'game'
          ? { gamePlatform: 'Web browser', playMode: 'SinglePlayer',
              ...(w.genre && w.genre.length ? { genre: w.genre } : {}) }
          : {}),
        author: { '@id': SITE + '#studio' }, publisher: { '@id': SITE + '#studio' },
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' } },
      crumbs([['Koshin Studio', '/'], ['Works', '/works/'], [w.title, w.url]]),
      /* よくある質問。ページの目に見える内容と揃っているものだけ書く
         （works.json の faq がそのまま本文にも出る） */
      ...(w.faq && w.faq.length ? [{
        '@type': 'FAQPage',
        mainEntity: w.faq.map((f) => ({
          '@type': 'Question', name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }] : []),
    ];
  }
  const nm = rel.match(/^\/notes\/([^/]+)\/index\.html$/);
  if (nm && noteBySlug[nm[1]]) {
    const nn = noteBySlug[nm[1]];
    return [
      { '@type': 'BlogPosting', headline: nn.title, url: SITE + nn.url, description: nn.blurb,
        datePublished: nn.date, dateModified: nn.updated || nn.date, inLanguage: 'ja',
        image: ogFor(rel),
        author: { '@id': SITE + '#studio' }, publisher: { '@id': SITE + '#studio' },
        mainEntityOfPage: SITE + nn.url },
      crumbs([['Koshin Studio', '/'], ['Notes', '/notes/'], [nn.title, nn.url]]),
    ];
  }
  if (rel === '/works/index.html') return [crumbs([['Koshin Studio', '/'], ['Works', '/works/']])];
  if (rel === '/notes/index.html') return [crumbs([['Koshin Studio', '/'], ['Notes', '/notes/']])];
  if (rel === '/about/index.html') {
    const tools = [].concat(...(stack.groups || []).map((g) => g.items || []));
    return [
      PERSON,
      { '@type': 'AboutPage', name: 'About', url: url, inLanguage: 'ja',
        isPartOf: { '@id': SITE + '#studio' } },
      { '@type': 'ItemList', name: '使っている道具',
        itemListElement: tools.map((t, i) => ({
          '@type': 'ListItem', position: i + 1, name: t.n })) },
      crumbs([['Koshin Studio', '/'], ['About', '/about/']]),
    ];
  }
  if (rel === '/anime/index.html') return [page('診断 — ガチアニメ診断の読みもの'), crumbs([['Koshin Studio', '/'], ['診断', '/anime/']])];
  if (rel === '/anime/axes/index.html') return [page('6つの軸'), crumbs([['Koshin Studio', '/'], ['診断', '/anime/'], ['6つの軸', '/anime/axes/']])];
  if (rel === '/anime/types/index.html') return [page('64タイプ一覧'), crumbs([['Koshin Studio', '/'], ['診断', '/anime/'], ['64タイプ', '/anime/types/']])];
  const tm = rel.match(/^\/anime\/types\/([^/]+)\/index\.html$/);
  if (tm && typeByCode[tm[1].toUpperCase()]) {
    const t = typeByCode[tm[1].toUpperCase()];
    return [page(t.code + '「' + t.nickname + '」'),
      crumbs([['Koshin Studio', '/'], ['診断', '/anime/'], ['64タイプ', '/anime/types/'], [t.code, typeUrl(t.code)]])];
  }
  if (rel === '/privacy/index.html') {
    return [page('あつかい（プライバシー）'),
      crumbs([['Koshin Studio', '/'], ['あつかい', '/privacy/']])];
  }
  const gm = rel.match(/^\/works\/([^/]+)\/guide\.html$/);
  if (gm && workBySlug[gm[1]]) {
    const w = workBySlug[gm[1]];
    return [
      { '@type': 'WebPage', name: w.title + ' 遊び方', url: url, inLanguage: 'ja',
        primaryImageOfPage: ogFor(rel),
        about: { '@type': 'VideoGame', name: w.title, url: SITE + w.url } },
      crumbs([['Koshin Studio', '/'], ['Works', '/works/'], [w.title, w.url],
              ['遊び方', w.url + 'guide.html']]),
    ];
  }
  return null;
}

/* style.css の中の書体にも印を付ける。書体は style.css より長く持たせて
   いるので、字を足して作り直したときに古いものを掴むと豆腐になる */
{
  const cssPath = here + '/style.css';
  if (existsSync(cssPath)) {
    const before = readFileSync(cssPath, 'utf8');
    const after = before.replace(/url\("(\/vendor\/fonts\/[^"?]+)(\?v=[0-9a-f]+)?"\)/g,
      (m, path) => 'url("' + stamped(path) + '")');
    if (after !== before) writeFileSync(cssPath, after);
  }
}

for (const file of pages) {
  const rel = file.slice(here.length);
  let html = readFileSync(file, 'utf8');
  /* 脚の SNS 欄と、広告の枠を差し替える（data/site.json が元） */
  html = html.replace(/<header class="site"><div class="wrap">\s*<a class="logo" href="\/">Koshin Studio<\/a>\s*<nav>[\s\S]*?<\/nav>/,
    '<header class="site"><div class="wrap">\n  <a class="logo" href="/">Koshin Studio</a>\n  <nav><a href="/works/">Works</a><a href="/notes/">Notes</a><a href="/anime/">診断</a><a href="/about/">About</a></nav>');
  html = html.replace(/(<footer class="site"><div class="wrap">[\s\S]*?)<nav>[\s\S]*?<\/nav>(\s*<\/div><\/footer>)/,
    '$1<nav><a href="/about/">About</a><a href="/privacy/">あつかい</a></nav>$2');
  html = html.replace(/<div class="sns-row">[\s\S]*?<\/div>/g, `<div class="sns-row">${socialHtml}</div>`);
  if (!/class="sns-row"/.test(html)) {
    html = html.replace('<footer class="site"><div class="wrap">\n  <span>© 2026 Koshin Studio</span>',
      `<footer class="site"><div class="wrap">\n  <span>© 2026 Koshin Studio</span>\n  <div class="sns-row">${socialHtml}</div>`);
  }
  /* 連絡先（data/site.json の contact） */
  const ct = conf.contact || {};
  /* 主役はひとつだけ置く。メールがあればメール、無ければフォーム。
     両方あるときは、フォームを控えに回す。
     フォームしか無いのに小さな副ボタンだと、仕事を頼む頁として弱い */
  const ctMailMain = ct.email
    ? `<a class="ct-main" href="mailto:${ct.email}?subject=${encodeURIComponent('お問い合わせ')}">${esc(ct.email)}<span>メールで送る</span></a>`
    : '';
  const ctFormMain = ct.form
    ? `<a class="ct-main" href="${ct.form}" target="_blank" rel="noopener">お問い合わせフォーム<span>ここから送れます</span></a>`
    : '';
  const ctFormSub = ct.form
    ? `<a class="ct-sub" href="${ct.form}" target="_blank" rel="noopener">フォームから送る</a>` : '';
  const ctHtml = ct.email ? ctMailMain + ctFormSub : ctFormMain;
  /* 連絡先がまだ無いときは、節ごと出さない（「準備中」と書くより、何も書かないほうが良い） */
  if (!ctHtml) html = html.replace(/\s*<!--contact-section:start-->[\s\S]*?<!--contact-section:end-->/, '');
  html = html.replace(/<!--contact:start-->[\s\S]*?<!--contact:end-->/,
    '<!--contact:start-->' + ctHtml + '<!--contact:end-->');

  /* パンくず（見る人にも、検索にも効く） */
  const TRAIL = {
    '/works/index.html': [['Works', '/works/']],
    '/notes/index.html': [['Notes', '/notes/']],
    '/about/index.html': [['About', '/about/']],
    '/anime/index.html': [['診断', '/anime/']],
    '/anime/axes/index.html': [['診断', '/anime/'], ['6つの軸', '/anime/axes/']],
    '/anime/types/index.html': [['診断', '/anime/'], ['64タイプ', '/anime/types/']],
    '/privacy/index.html': [['あつかい', '/privacy/']],
  };
  let trail = TRAIL[rel];
  const wm2 = rel.match(/^\/works\/([^/]+)\//);
  const nm2 = rel.match(/^\/notes\/([^/]+)\//);
  const am2 = rel.match(/^\/anime\/types\/([^/]+)\/index\.html$/);
  if (am2 && typeByCode[am2[1].toUpperCase()]) {
    trail = [['診断', '/anime/'], ['64タイプ', '/anime/types/'], [am2[1].toUpperCase(), '/anime/types/' + am2[1] + '/']];
  }
  if (wm2 && workBySlug[wm2[1]]) {
    const w = workBySlug[wm2[1]];
    trail = [['Works', '/works/']].concat(
      rel.endsWith('/index.html') && rel === w.url + 'index.html'
        ? [[w.title, w.url]] : [[w.title, w.url], ['遊び方', rel.replace('index.html', '')]]);
  } else if (nm2 && noteBySlug[nm2[1]]) {
    trail = [['Notes', '/notes/'], [noteBySlug[nm2[1]].title, noteBySlug[nm2[1]].url]];
  }
  /* 属性付きも消えるようにする（class="crumbs" だけを見ると一致せず、
     組み直すたびに増え続けていた） */
  html = html.replace(/\s*<nav class="crumbs"[^>]*>[\s\S]*?<\/nav>/g, '');
  if (trail) {
    const items = [['Koshin Studio', '/']].concat(trail);
    const cr = '<nav class="crumbs" aria-label="現在地">' + items.map((t, i) =>
      i === items.length - 1
        ? `<span aria-current="page">${esc(t[0])}</span>`
        : `<a href="${t[1]}">${esc(t[0])}</a><i aria-hidden="true">›</i>`).join('') + '</nav>';
    html = html.replace(/(<main[^>]*>\s*<div class="wrap">)/, `$1\n  ${cr}`);
  }

  const ads = conf.ads || {};
  html = html.replace(/<div class="ad-slot"[^>]*>[\s\S]*?<\/div>\s*<!--\/ad-->/g, (m) => {
    const kind = (m.match(/data-slot="([^"]+)"/) || [, 'article'])[1];
    const id = (ads.slots || {})[kind];
    const inner = ads.enabled && ads.client && id
      ? `<ins class="adsbygoogle" style="display:block" data-ad-client="${ads.client}" data-ad-slot="${id}" data-ad-format="auto" data-full-width-responsive="true"></ins><script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>`
      : '';
    return `<div class="ad-slot" data-slot="${kind}"${inner ? '' : ' hidden'}>${inner}</div>\n<!--/ad-->`;
  });
  /* 枠だけ置いても出ない。読み込む側の script が要る。
     入れっぱなしにすると、広告を止めたあとも向こうへ繋ぎに行くので、
     枠が生きているページにだけ、そのつど入れ直す */
  html = html.replace(/\n?\s*<script async src="https:\/\/pagead2\.googlesyndication\.com[^>]*><\/script>/g, '');
  if (ads.enabled && ads.client && /<ins class="adsbygoogle"/.test(html)) {
    html = html.replace('</head>',
      `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ads.client}" crossorigin="anonymous"></script>\n</head>`);
  }
  const url = urlOf(file);
  html = html.replace(/\n?\s*<link rel="canonical"[^>]*>/g, '')
             .replace(/\n?\s*<meta property="og:url"[^>]*>/g, '')
             .replace(/\n?\s*<meta name="twitter:card"[^>]*>/g, '')
             .replace(/\n?\s*<meta property="og:site_name"[^>]*>/g, '')
             .replace(/\n?\s*<meta property="og:locale"[^>]*>/g, '')
             .replace(/\n?\s*<link rel="alternate" type="application\/rss\+xml"[^>]*>/g, '')
             .replace(/\n?\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
  const ld = ldFor(file, url);
  const head = [
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:site_name" content="Koshin Studio">`,
    `<meta property="og:locale" content="ja_JP">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<link rel="alternate" type="application/rss+xml" title="Koshin Studio — Notes" href="${SITE}/feed.xml">`,
    ld ? `<script type="application/ld+json">${JSON.stringify(
      { '@context': 'https://schema.org', '@graph': ld })}</script>` : '',
  ].filter(Boolean).join('\n');
  html = html.replace('</head>', head + '\n</head>');
  /* ホーム画面に置いたときの絵と、manifest。
     SVG だけだと iOS で何も出ない。消してから入れ直す */
  html = html.replace(/\n?\s*<link rel="apple-touch-icon"[^>]*>/g, '')
             .replace(/\n?\s*<link rel="manifest"[^>]*>/g, '');
  html = html.replace('<script>document.documentElement.className+=" js"</script>',
    '<link rel="apple-touch-icon" href="/assets/icon/icon-180.png">\n'
    + '<link rel="manifest" href="/site.webmanifest">\n'
    + '<script>document.documentElement.className+=" js"</script>');

  /* 中身の印を付け直す。古い印は消してから入れるので、組み直しても増えない */
  html = html.replace(/(["'])(\/(?:style\.css|motion\.js))(\?v=[0-9a-f]+)?\1/g,
    (m, q, path) => q + stamped(path) + q);
  html = html.replace(/(["'])(\/vendor\/[A-Za-z0-9@._/-]+\.(?:js|woff2|css))(\?v=[0-9a-f]+)?\1/g,
    (m, q, path) => q + stamped(path) + q);

  /* 遊ぶ先を入れ直す。作品はそれぞれ自分の場所から配信しているので、
     行き先はここが持つ（works.json の play）。頁の側は
     data-play="<slug>" と書いておけばよく、配信先が変わっても
     直すのは works.json の一行だけ。組むたびに入れ直すので焼き付かない */
  html = html.replace(/<a([^>]*?)\sdata-play="([^"]+)"([^>]*?)>/g, (m, a, slug, b) => {
    const w = works.find((x) => x.slug === slug);
    if (!w || !w.play) return m;
    const rest = (a + b).replace(/\shref="[^"]*"/, '');
    return `<a${rest} data-play="${slug}" href="${w.play}">`;
  });

  const ogPath = ogFor(rel);      /* 構造化データと同じ絵を指す */
  html = html.replace(/\n?\s*<meta property="og:image"[^>]*>/g, '')
             .replace(/\n?\s*<meta property="og:image:width"[^>]*>/g, '')
             .replace(/\n?\s*<meta property="og:image:height"[^>]*>/g, '');
  html = html.replace('</head>',
    `<meta property="og:image" content="${ogPath}">\n` +
    `<meta property="og:image:width" content="1200">\n` +
    `<meta property="og:image:height" content="630">\n</head>`);
  /* 関連の読みもの。記事の終わりには「ほかの記録」、作品ページには
     「この作品の記録」を入れる。印の間は組むたびに作り直すので、増えない */
  html = html.replace(/\n?<!--related-->[\s\S]*?<!--\/related-->\n?/g, '');
  const relBlock = (title, list) => !list.length ? '' :
    `\n<!--related-->\n  <div class="rule" style="margin:40px 0 22px"></div>\n  <p class="eyebrow">${title}</p>\n`
    + `  <ul class="plain">\n${list.map((n) => `    <li><a href="${n.url}">${esc(n.title)}</a> — ${esc(n.blurb)}</li>`).join('\n')}\n  </ul>\n<!--/related-->\n`;
  const rn = rel.match(/^\/notes\/([^/]+)\/index\.html$/);
  const rw = rel.match(/^\/works\/([^/]+)\/index\.html$/);
  let relHtml = '';
  if (rn && noteBySlug[rn[1]]) {
    const me = noteBySlug[rn[1]];
    const others = notes.filter((n) => n.slug !== me.slug)
      .sort((a, b) => (b.work === me.work) - (a.work === me.work));
    relHtml = relBlock('ほかの記録', others.slice(0, 3));
  } else if (rw && workBySlug[rw[1]]) {
    relHtml = relBlock('この作品の記録', notes.filter((n) => n.work === workBySlug[rw[1]].title));
  }
  if (relHtml) html = html.replace(/<\/div>\s*<\/main>/, (m) => relHtml + m);
  writeFileSync(file, html);
}

/* 最後に直した日。git が覚えている「実際に配った変更」の日を使う。
   組み直すたびに今日の日付を並べると、嘘の更新を報せることになる。
   git が無い所では日付を省く（無いほうが、間違った日より良い） */
const lastMod = (f) => {
  try {
    const d = execFileSync('git', ['log', '-1', '--format=%cs', '--', f],
      { cwd: here, encoding: 'utf8' }).trim();
    return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : '';
  } catch (e) { return ''; }
};

writeFileSync(here + '/sitemap.xml',
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9">\n'.replace('sitemap.org', 'sitemaps.org') +
  pages.filter((f) => !readFileSync(f, 'utf8').includes('name="robots" content="noindex')).map((f) => {
    const rel = f.slice(here.length);
    const pri = rel === '/index.html' ? '1.0'
      : /^\/(works|notes)\/index\.html$/.test(rel) ? '0.9'
      : /^\/works\/[^/]+\/index\.html$/.test(rel) ? '0.8'
      : /^\/notes\/[^/]+\/index\.html$/.test(rel) ? '0.8'
      : /^\/anime\/(index\.html|types\/index\.html|axes\/index\.html)$/.test(rel) ? '0.8'
      : /^\/anime\/types\/[^/]+\/index\.html$/.test(rel) ? '0.6'
      : /^\/about\/index\.html$/.test(rel) ? '0.7' : '0.5';
    const m = lastMod(f);
    return `  <url><loc>${urlOf(f)}</loc>${m ? `<lastmod>${m}</lastmod>` : ''}`
      + `<priority>${pri}</priority></url>`;
  }).join('\n') + '\n</urlset>\n');

writeFileSync(here + '/robots.txt',
  'User-agent: *\nAllow: /\n\nSitemap: ' + SITE + '/sitemap.xml\n');

console.log(`site: ${pages.length} ページに canonical と構造化データ、sitemap.xml を書きました`);

console.log(`site: works ${works.length} / notes ${notes.length} / 分野 ${kindKeys.length} を書き出しました`);
