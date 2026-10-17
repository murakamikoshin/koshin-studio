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
/* Notes は制作の記録。比べたもの・買ったものは Picks に分ける（記事の置き場は同じ notes/） */
const PICK_WORKS = new Set(['比べたもの', '買ったもの']);
const isPick = (n) => PICK_WORKS.has(n.work);
const records = notes.filter((n) => !isPick(n));
const picks = notes.filter(isPick);
const pickById = Object.fromEntries((read('/data/picks.json').items || []).map((x) => [x.id, x]));
/* 楽天の商品API（tools/rakuten-picks.mjs）で選んだ「画像つきの1点」。無ければ文字のリンクだけ */
const pickRk = existsSync(here + '/data/picks-rakuten.json') ? read('/data/picks-rakuten.json') : {};
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
<meta name="theme-color" content="#fbfaf7">
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
  <a class="logo" href="/"><img class="logo-mark" src="/favicon.svg" alt="" width="28" height="28">Koshin Studio</a>
  <nav><a href="/works/">Works</a><a href="/notes/">Notes</a><a href="/picks/">Picks</a><a href="/calc/">Tools</a><a href="/about/">About</a></nav>
</div></header>
`;
const socialHtml = (conf.social || []).map((x) =>
  `<a class="sns" href="${x.url}" rel="me noopener" target="_blank">${esc(x.label)}<i>${esc(x.handle || '')}</i></a>`
).join('');

const foot = `
<footer class="site"><div class="wrap">
  <span>© 2026 Koshin Studio</span>
  <div class="sns-row">${socialHtml}</div>
  <nav><a href="/about/">About</a><a href="/privacy/">あつかい</a><a href="/en/" hreflang="en" lang="en">English</a></nav>
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
  <p class="rv">ブラウザですぐ遊べるゲームが 3 つ、診断アプリが 1 つ、iPhone のアプリが 1 つあります。どれも、登録なしで始められます（iPhone のアプリは、App Store から入れます）。それぞれのページに、<strong>遊び方、仕組み、預かる情報、まだ確かめていないこと</strong>を書いています。</p>
  <ul class="rv">
    <li><strong>すし積む</strong> — 寿司のネタを落として、同じものを合体させる、物理演算のパズル。</li>
    <li><strong>寝返り将棋</strong> — 6×6 の盤で、挟んだ駒が裏返って寝返る将棋。AI 対戦とオンライン対戦があります。</li>
    <li><strong>10秒ピッタリで止めろ！</strong> — 数字も音も出ない画面で、頭の中で 10 秒を数えて止める。</li>
    <li><strong>ガチアニメ診断</strong> — 6 つの軸で、64 タイプに分ける診断。</li>
    <li><strong>トレカダッシュ</strong> — トレカの抽選・予約・先着の情報を集めた iPhone アプリ。</li>
  </ul>
  <p class="rv">作り方や、測ったことの記録は、<a href="/notes/">Notes</a> にあります。たとえば、<a href="/notes/negaeri-balance/">寝返り将棋のルールを AI 同士の対局で決めた記録</a>や、<a href="/notes/stopwatch-rank/">10 秒ゲームのランキングを公平にした記録</a>です。</p>

  <h2 class="sr">作品の一覧</h2>
  <div class="chips rv">${chips}</div>
  <ul class="works" id="worklist">
${works.map(workCard).join('\n')}
  </ul>
  <p class="soon rv" id="empty" hidden>この種類はまだありません</p>
  <p class="soon rv" style="margin-top:22px">次の作品を用意しています</p>
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

/* ---- /anime/ ガチアニメ診断ガイド ----
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
  head('アニメ診断ガイド：ガチアニメ診断の6つの軸と64タイプ — Koshin Studio',
       'アニメ診断「ガチアニメ診断」の解説。6つの軸の意味、64タイプの二つ名と特徴、タイプごとに近いアニメ作品をまとめています。') +
`<main><div class="wrap">
  <h1>ガチアニメ診断ガイド</h1>
  <div class="rule"></div>
  <p class="lead">ガチアニメ診断ガイド。<br>6つの軸と64タイプが、それぞれ何を表しているかを書いています。</p>

  <p class="rv"><strong>はじめての方へ：</strong><a href="/anime/guide/">アニメ診断の選び方</a>（診断の見分け方、答え方のコツ、結果の読み方）</p>

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

/* アニメ診断の選び方に付ける「よくある質問」。画面に出す文と、構造化データ
   （FAQPage）に出す文を、同じ配列から作る（食い違うと検索エンジンの指針に反する） */
const guideFaq = [
  { q: 'アニメ診断は無料ですか？何問ありますか？',
    a: 'ガチアニメ診断は無料です。まず12問（約30秒）でタイプと運命の1作が出ます。続けて答えると、最大50問まで広がります。すべて選択式です。' },
  { q: 'アニメ診断は当たりますか？',
    a: '「当たる」の意味によります。タイプは、12問でもだいたい合います（作り物の回答者で測ると、6文字を1文字ずつ見て、9割以上が同じ側に落ちました）。一方、運命の1作は、質問を足すたびに揺れます（12問で出た1作が、50問でも1作目に来るのは、5〜8人に1人）。診断が測っているのは、好みと作品の「近さ」で、面白いと感じるかどうかの保証ではありません。' },
  { q: '回答や結果は、どこかに保存されますか？',
    a: 'いいえ。回答は、この端末の中だけで計算していて、サーバーには送りません。' },
  { q: '何度やっても、同じ結果になりますか？',
    a: 'タイプは安定しやすいですが、運命の1作は、答え方や、放送年の切り替え、好きなジャンルの選び方で変わります。すでに見た作品は、「見た」を押すと、次点の作品に差し替わります。' },
  { q: '古いアニメも選ばれますか？',
    a: '選ばれにくいです。診断が使う作品のデータベースは、2000年以降の作品が90.5%を占めていて、新しい作品とよく語られる作品に、偏っています。放送年は、結果の画面で、「こだわらない」「2010年以降」「2018年以降」から選べます。' },
];

/* アニメ診断の選び方（「おすすめのアニメ診断」を探す人に向けた解説。
   診断の仕様と、このサイトで実測した数字だけで書く。他の診断への評価は書かない） */
writeAnime('/anime/guide/index.html',
  head('アニメ診断の選び方：自分に合う作品が見つかる診断の見分け方 — Koshin Studio',
       'おすすめのアニメ診断を選ぶときに見る四つのこと、答え方のコツ、結果の読み方。ガチアニメ診断が何を測って、どう作品を選んでいるかを、実測の数字つきで書きました。') +
`<main><div class="wrap">
  <h1>アニメ診断の選び方</h1>
  <div class="rule"></div>
  <p class="lead">診断の結果が「当たる」かどうかは、<br>何を測っているかで決まります。</p>

  <p class="rv">アニメの診断は、たくさんあります。名前は似ていても、やっていることは、同じではありません。ここでは、診断を選ぶときに見るところと、答え方、結果の読み方を、<a href="/works/shindananime/">ガチアニメ診断</a>を例に書きます。数字は、このサイトで実際に測ったものです。</p>

  <h2 class="rv">アニメ診断には、二つの種類がある</h2>
  <ul class="rv">
    <li><strong>タイプを当てる診断。</strong>質問に答えて、あなたの「アニメの好みのタイプ」や、キャラクターを出します。結果は、ほとんどの場合「分類」です。</li>
    <li><strong>作品をすすめる診断。</strong>好みから、見るべき作品を挙げます。結果は「作品の名前」です。</li>
  </ul>
  <p class="rv">ガチアニメ診断は、この<strong>両方を一度に</strong>出します。6つの軸でタイプ（例：<code>RDCP-VM</code>）を出して、そのうえで、データベースから、運命の1作と、次点の2作を選びます。</p>

  <h2 class="rv">おすすめのアニメ診断を選ぶときに、見る四つのこと</h2>
  <h3>1. 何を測っているか、書いてあるか</h3>
  <p class="rv">「あなたはこのタイプ」と言われても、何を基準にしたのか分からなければ、納得できません。ガチアニメ診断は、<strong>世界観・後味・構成・サブテイスト・視覚・視聴スタイル</strong>の6つの軸で測っています。軸ごとの意味は、<a href="/anime/axes/">6つの軸</a>に書いてあります。</p>
  <h3>2. 結果の理由が、分かるか</h3>
  <p class="rv">タイプコードの一文字ずつが、どの軸のどちら側に寄ったかを表しています。結果の画面には、軸ごとの寄り方と、作品の適合度（%）が出ます。この数字は、並び順と同じ物差しから作っています（<a href="/notes/match-percent/">「82%より80%が選ばれる」</a>に、その経緯を書きました）。</p>
  <h3>3. 何作の中から選んでいるか</h3>
  <p class="rv">診断が実際に使う作品は、<strong>6,074 作</strong>です。もとは 16,177 件あって、レビューの言葉が少なく、軸を決める手がかりが足りない作品は、落としました。落とした基準と、残った作品の偏り（2000 年以降が 90.5%）は、<a href="/notes/anime-db/">データベースの記事</a>に、数字で書いています。</p>
  <h3>4. 回答は、どこへ行くか</h3>
  <p class="rv">ガチアニメ診断は、回答を、この端末の中だけで計算します。サーバーには送りません。診断のデータの扱いは、<a href="/privacy/">あつかい</a>に書いています。</p>

  <h2 class="rv">答え方のコツ</h2>
  <ul class="rv">
    <li><strong>直感で答える。</strong>悩んだ質問は、「どちらかといえば」で十分です。</li>
    <li><strong>「どちらでもない」を続けない。</strong>真ん中ばかりだと、軸の向きが決まらず、結果がぼやけます。</li>
    <li><strong>まず 12 問、続きは気が向いたら。</strong>12 問（約 30 秒）で、タイプと運命の1作が出ます。続けて答えると、最大 50 問まで広がり、画質・年代や、恋愛・ホラー・異世界転生などの好みの要素も、加味して選び直します。</li>
    <li><strong>見た作品は「見た」を押す。</strong>次点の作品に、差し替わります。</li>
    <li><strong>放送年は、結果の画面で切り替えられる。</strong>「こだわらない」「2010 年以降」「2018 年以降」から選べます。</li>
  </ul>

  <h2 class="rv">結果の読み方：タイプは安定、1作は揺れる</h2>
  <p class="rv">12 問と 50 問で、結果がどれだけ変わるかを、作り物の回答者 1,000 人で測りました（<a href="/notes/shindan12/">診断を12問にしたら、結果はどこまで変わるのか</a>）。</p>
  <ul class="rv">
    <li><strong>タイプは、短くても、だいたい合う。</strong>6 文字を 1 文字ずつ見ると、回答のブレが中くらいでも、9 割以上は、同じ側に落ちます。</li>
    <li><strong>運命の1作は、質問を足すたびに、揺れる。</strong>12 問で出た 1 作が、50 問でも 1 作目に来るのは、5〜8 人に 1 人です。6,000 作から 1 つを選ぶので、少しの入力の差で、順位が入れ替わります。</li>
  </ul>
  <p class="rv">タイプを知りたいだけなら、12 問で十分です。1 作の精度を上げたい人は、続きに進んでください。50 問のほうが、「本当の好み」に、約 1.7〜1.9 倍、近づきます。</p>

  <h2 class="rv">診断で分かること、分からないこと</h2>
  <ul class="rv">
    <li><strong>分かる：</strong>あなたの好みの<strong>傾向</strong>と、その傾向に近い作品。</li>
    <li><strong>分からない：</strong>その作品を、あなたが<strong>面白いと感じるか</strong>。診断が測っているのは、好みと作品の「近さ」です。</li>
    <li><strong>偏りがある：</strong>データベースは、新しい作品と、よく語られる作品に、寄っています。古い作品や、あまり語られない作品は、選ばれにくいです。</li>
    <li><strong>好みは変わる：</strong>今日の結果が、来年も同じとは限りません。</li>
  </ul>
  <h2 class="rv">よくある質問</h2>
${guideFaq.map((f) => `  <h3>${esc(f.q)}</h3>\n  <p class="rv">${esc(f.a)}</p>`).join('\n')}
  ${ctaBtn('ガチアニメ診断をはじめる（無料・1分）')}

  <p class="rv" style="margin-top:34px">続けて読む：<a href="/anime/axes/">6つの軸</a> ／ <a href="/anime/types/">64タイプの一覧</a> ／ <a href="/anime/">診断ガイドの入り口</a></p>
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
const codeEx = typeByCode['RDCP-VM'];
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

  <h2 class="rv">タイプコードの読み方</h2>
  <p class="rv">タイプコードは、6つの軸それぞれで、どちら側に寄ったかを、1文字ずつ並べたものです。たとえば <code>${codeEx.code}</code>（二つ名「${esc(codeEx.nickname)}」）は、次の6文字でできています。</p>
  <div class="scroll rv"><table>
    <tr><th>軸</th><th>文字</th><th>寄った側</th></tr>
${codeEx.letters.map((l, i) => { const ax = animeAxes[i]; const side = l === ax.pos.l ? ax.pos : ax.neg; return `    <tr><td>${esc(ax.label)}</td><td><code>${esc(l)}</code></td><td>${esc(side.name)}：${esc(side.desc)}</td></tr>`; }).join('\n')}
  </table></div>
  <p class="rv">6つの軸は、それぞれ2択です。2の6乗で、<strong>64タイプ</strong>になります。診断の仕組みは<a href="/anime/guide/">アニメ診断の選び方</a>に、軸の意味は<a href="/anime/axes/">6つの軸</a>に書いています。</p>
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

/* テーマ別の案内（記事の数が増えたので、はじめての方向けに） */
const themeNoteBySlug = Object.fromEntries(notes.map((n) => [n.slug, n]));
const noteThemes = [
  { title: '数えて、直した', lead: '勘で直す前に、まず数える。費用と監査の数字を疑って、測り直した記録。',
    slugs: ['firestore-91', 'gemini-meter', 'scrape-cost', 'dup-zero', 'audit-sweep-61', 'fix-the-existing-data', 'budget-starved', 'torecadash-ai'] },
  { title: '静かに壊れていた', lead: 'エラーが出ないまま、本物が消えていた、または読めていなかった失敗の記録。',
    slugs: ['blocked-page', 'tco-relay', 'silent-discard', 'truncated-answer', 'waiting-room', 'notify-gate', 'destination-check'] },
  { title: '名前と商品の取り違え', lead: '同じ名前、同じリンクが、別のものを指していた。商品と店の取り違えの記録。',
    slugs: ['split-mixups', 'same-page-not-same-store', 'store-name-variants', 'geocode-shizuoka', 'one-page-many-cases', 'transliteration-gate', 'catalog-seed-393', 'genre-from-catalog', 'leaked-value', 'cleanup-hides-entrance', 'typo-catalog', 'fake-products'] },
  { title: '監視と定期処理', lead: '先着の監視、同時実行の枠、配備と再実行。動き続ける処理の設計の記録。',
    slugs: ['interval-vs-delivery', 'hot-lane', 'concurrency-slots', 'timeout-third-fix', 'rerun-on-deploy', 'automate-sorted', 'x-monitoring-gaps', 'coverage-check', 'fill-the-gap', 'self-inflicted'] },
  { title: 'iOS アプリと基盤', lead: 'サーバーの移行、iCloud、広告、審査、ビルド。アプリとその土台の、実際に起きたことの記録。',
    slugs: ['vps-migration', 'secret-in-logs', 'icloud-overwrite', 'swallowed-failure', 'swiftui-hit-area', 'test-ads', 'torecadash-watchdog', 'torecadash-ci', 'itms-91064', 'xcode152-sdk', 'torecadash-review', 'review-info-needed', 'apple-signin'] },
  { title: 'ゲームの設計と測定', lead: '釣り合いを、AI 同士の対局や自動の試行で測って決めた記録。',
    slugs: ['negaeri-balance', 'negaeri-online', 'anago', 'sushi-measure', 'stopwatch-rank', 'shindan12'] },
  { title: '公式の情報で比べた', lead: '値段・規約・上限を、公式の情報だけで比べた記事。確認できなかったことも書いてあります。',
    slugs: ['hosting-compare', 'claude-vs-gemini-api', 'ios-sdk-compare', 'comment-services'] },
];

/* 記事を作品ごとにまとめる（新しい記事が先に来る順を保つ）。作品ページがあれば、そこへのリンクも */
const noteGroups = [];
for (const n of records) {
  let g = noteGroups.find((x) => x.work === n.work);
  if (!g) { g = { work: n.work, list: [], page: works.find((w) => w.title === n.work) }; noteGroups.push(g); }
  g.list.push(n);
}

writeFileSync(here + '/notes/index.html',
  head('Notes — 作りながら考えたことの記録 — Koshin Studio', 'ゲームやアプリを作る中で、数字を取って、思い込みを直した記録。App Store の審査、広告の間隔、データの重複、API の移行など、実際に起きたことを、測った数字つきで書いています。') +
`<main><div class="wrap">
  <h1>Notes</h1>
  <div class="rule"></div>
  <p class="lead">作りながら考えたことの記録。<br>勘で直す前に、まず測る——という話が多いです。</p>
  <p class="rv">実際の作業の記録（コミットと、手元で測った数字）から書いています。作品ごとに、まとめました。</p>
  <h2 class="rv" id="themes">テーマ別に読む</h2>
  <p class="rv">本数が多いので、はじめての方は、次のテーマから選ぶと読みやすいです。</p>
${noteThemes.map((t) => `  <h3 class="rv">${esc(t.title)}</h3>
  <p class="rv">${esc(t.lead)}</p>
  <ul class="plain">
${t.slugs.map((sl) => themeNoteBySlug[sl]).filter(Boolean).map((n) => `    <li><a href="${n.url}">${esc(n.title)}</a></li>`).join('\n')}
  </ul>`).join('\n')}
  <nav class="toc rv" aria-label="作品ごとの目次"><p>作品ごとに読む</p><ol>${noteGroups.map((g, i) =>
    `<li><a href="#g${i + 1}">${esc(g.work)}</a>（${g.list.length}本）</li>`).join('')}</ol></nav>
${noteGroups.map((g, i) => `
  <h2 class="rv" id="g${i + 1}">${esc(g.work)}<span class="group-n">${g.list.length}本</span></h2>${
    g.page ? `\n  <p class="rv group-link"><a href="${g.page.url}">${esc(g.work)}の作品ページ →</a></p>` : ''}
  <ul class="notes">
${g.list.map(noteRow).join('\n')}
  </ul>`).join('\n')}
</div></main>` + foot);


/* ---- /picks/（比べたもの・買ったもの）と /calc/（計算機） ---- */
const af0 = conf.affiliate || {};
mkdirSync(here + '/picks', { recursive: true });
writeFileSync(here + '/picks/index.html',
  head('Picks — 比べたもの・買ったもの — Koshin Studio', '使ったもの・買ったものの感想と、公式の情報だけで比べた記事。数字には出典と確認した日を付けています。') +
`<main><div class="wrap">
  <h1>Picks</h1>
  <div class="rule"></div>
  <p class="lead">比べたもの・買ったもの</p>
  <p class="rv">使ったもの、買ったものの感想と、サービスや道具を<strong>公式の情報だけ</strong>で比べた記事です。比べた記事には、出典と、確認した日、確認できなかったことを書いています。</p>
  <p class="rv note">${af0.enabled ? esc(af0.disclosure || '') : 'いまのところ、このページの記事に、広告やアフィリエイトのリンクはありません。リンクを付けるときは、記事の冒頭に書きます。'}</p>
  <ul class="notes">
${picks.map(noteRow).join('\n')}
  </ul>
  <p class="rv" style="margin-top:26px"><a class="btn ghost" href="/calc/">計算機（Tools）を見る</a></p>
</div></main>` + foot);

const tools = [
  { url: '/calc/gacha/', title: 'ガチャのコンプリート計算機', blurb: '全種類をそろえるのに、何回・何円かかるか。平均と、9 割の人が揃う回数、コンプリートセットとの損得まで。' },
  { url: '/calc/gacha-rate/', title: 'ガチャの当たり確率・天井計算機', blurb: '排出率から、何回で当たるか。欲しい個数と天井（○回で確定）にも対応。' },
  { url: '/calc/box-price/', title: 'トレカの BOX・パックの単価換算計算機', blurb: 'BOX やセットの値段を 1 パックあたりに直して、定価と比べる。ジャンルごとの 1 BOX のパック数（179 件の出品から数えた実測）つき。' },
  { url: '/calc/lottery/', title: '抽選の当選確率計算機', blurb: '倍率と応募の回数から、ひとつ以上当たる確率を出す。応募先ごとに確率が違っても使える。トレカの抽選販売の考え方つき。' },
];
mkdirSync(here + '/calc', { recursive: true });
writeFileSync(here + '/calc/index.html',
  head('Tools — 計算機 — Koshin Studio', 'ガチャのコンプリートと当たり確率・天井、抽選の当選確率、トレカの BOX の単価換算の計算機。計算は、コンピューターで 20 万人ぶん引かせた結果と照らして確かめています。') +
`<main><div class="wrap">
  <h1>Tools</h1>
  <div class="rule"></div>
  <p class="lead">計算機</p>
  <p class="rv">ブラウザの中だけで動く計算機です。入れた数字は、どこにも送りません。計算が合っているかは、コンピューターで 20 万人ぶんを実際に引かせた結果と照らして、確かめています。</p>
  <p class="rv">どれも、「平均は何回か」だけでなく、<strong>運の悪い人はどれくらいかかるか</strong>（9 割の人・99% の人が当たるまでの回数）を出します。平均だけを見ると、「それくらいで当たるはず」と思い込みやすいからです。使い方に迷ったら、次のように選んでください。</p>
  <ul class="rv">
    <li><strong>全種類を集めたい</strong>（ガチャポン、ランダム封入のコレクション）→ コンプリート計算機。種類の数と、もう持っている数から、平均と、運の悪い人の回数を出します。</li>
    <li><strong>ある 1 つを当てたい</strong>（排出率が決まっているガチャ、天井つき）→ 当たり確率・天井計算機。</li>
    <li><strong>BOX の値段が、定価に対して高いのか知りたい</strong>（1 パックの定価と、BOX の値段を比べたい）→ トレカの BOX・パックの単価換算計算機。中のパック数で割って、同じ単位にそろえます。</li>
    <li><strong>抽選販売に何か所か応募する</strong>（倍率が分かる、または見積もれる）→ 抽選の当選確率計算機。応募先ごとに倍率が違っても組み合わせられます。</li>
  </ul>
  <p class="rv note">どの計算機も、確率の計算です。必ず当たる、という意味ではありません。前提が当てはまらない場合（確率が途中で変わるゲーム、重複応募が禁止の抽選など）は、各ページの「この計算が当てはまらないとき」に書いています。</p>
  <ul class="notes">
${tools.map((t, i) => `    <li class="rv" data-delay="${i * 70}"><a class="note-row" href="${t.url}">
      <time>計算機</time>
      <div><h3>${esc(t.title)}</h3><p>${esc(t.blurb)}</p></div>
    </a></li>`).join('\n')}
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
          ? `<picture><source srcset="${base(c.img)}.webp" type="image/webp"><img src="${base(c.img)}.jpg" alt="" width="360" height="360" loading="eager" decoding="async"></picture>`
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
const worksTeaser = works.slice(0, 4).map(workCard).join('\n');

/* 記録の抜粋 */
const noteTeaser = records.slice(0, 3).map(noteRow).join('\n');

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
put('picks', picks.slice(0, 3).map(noteRow).join('\n'));
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
  /* Cloudflare Pages は /x.html を /x へ 308 で転送する。正規の URL（canonical・sitemap・構造化データ）は、
     転送先の形（.html なし）にそろえる。転送される URL を載せると、Search Console に
     「ページにリダイレクトがあります」と出る */
  if (!u.endsWith('/') && u.endsWith('.html')) u = u.replace(/\.html$/, '');
  return SITE + (u === '' ? '/' : u);
};

const workBySlug = Object.fromEntries(works.map((w) => [w.slug, w]));
const noteBySlug = Object.fromEntries(notes.map((n) => [n.slug, n]));

/* 英語版。data/en.json に「日本語のページ ⇄ 英語のページ」の対を書く。
   対になったページには、お互いを指す hreflang と、言語の切り替えのリンクが入る。
   英語版は /en/ の下に、手で書く（機械翻訳のままは出さない） */
const enPairs = existsSync(here + '/data/en.json') ? read('/data/en.json') : [];
const enByPath = Object.fromEntries(enPairs.map((p) => [p.en, p]));
/* 言語ごとの入口（/en/ /es/ /zh/ …）。data/langs.json。ここにある言語の入口どうしは、
   日本語のトップ（/）も含めて、互いに hreflang で結ぶ。x-default は英語 */
const I18N = existsSync(here + '/data/langs.json') ? read('/data/langs.json') : {};
const hubPaths = Object.fromEntries(Object.values(I18N).map((l) => [l.path, true]));
const jaToEn = Object.fromEntries(enPairs.map((p) => [p.ja, p]));
/* 日本語・英語のほかに、同じ作品の別言語のページがある場合（data/en.json の alt）。
   全部のページを hreflang で結び、<html lang> と og:locale を正しく出す。
   alt の各項目: { "path", "locale", "title", "blurb" }。app があれば構造化データに配信先を入れる */
const altPageMeta = {};
const altGroupByPath = {};
for (const p of enPairs) {
  if (!p.alt) continue;
  const members = [['ja', p.ja], ['en', p.en]];
  altPageMeta[p.en] = { lang: 'en', locale: 'en_US', title: p.title, blurb: p.blurb, app: p.app, cover: p.cover };
  for (const [lang, a] of Object.entries(p.alt)) {
    members.push([lang, a.path]);
    altPageMeta[a.path] = { lang, locale: a.locale, title: a.title, blurb: a.blurb, app: p.app, cover: p.cover };
  }
  for (const m of members) altGroupByPath[m[1]] = { members, xdefault: p.en };
}

/* 本名は書かない。確かめようのないことを構造化データに入れると、
   検索側にも読む人にも嘘をつくことになる。
   代わりに、footer に出しているのと同じ公開の持ち場だけを繋ぐ */
const PERSON = {
  '@type': 'Organization', '@id': SITE + '#studio', name: 'Koshin Studio', alternateName: ['KoshinStudio'],
  url: SITE, description: 'なんでも、ひとりで挑戦して、作って、試して、書いています。ゲームや診断アプリなどを作り、作り方と検証の記録を公開しています。',
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

/* 英語ページの共有カード：自分の絵があればそれ、無ければ日本語側の絵 */
const ogForPair = (relEn, relJa) => {
  const own = ogFor(relEn);
  return /\/og_en_|\/og_[a-z]{2}_/.test(own) ? own : ogFor(relJa);
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
      { '@type': 'WebSite', url: SITE, name: 'Koshin Studio', alternateName: ['KoshinStudio'], publisher: { '@id': SITE + '#studio' },
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
        operatingSystem: w.os || 'Web', ...(w.status === '公開中' ? { datePublished: w.year } : {}),
        /* App Store に出しているアプリは、配信先を構造化データに入れる
           （works.json の appStoreUrl。無い作品には何も足さない） */
        ...(w.appStoreUrl ? { downloadUrl: w.appStoreUrl, installUrl: w.appStoreUrl } : {}),
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
  const em = rel.match(/^\/en\/notes\/([^/]+)\/index\.html$/);
  if (em && enByPath['/en/notes/' + em[1] + '/']) {
    const p = enByPath['/en/notes/' + em[1] + '/'];
    return [
      { '@type': 'BlogPosting', headline: p.title, url: SITE + p.en, description: p.blurb,
        datePublished: p.date, dateModified: p.updated || p.date, inLanguage: 'en',
        image: ogForPair(rel, p.ja + 'index.html'),
        author: { '@id': SITE + '#studio' }, publisher: { '@id': SITE + '#studio' },
        mainEntityOfPage: SITE + p.en },
      crumbs([['Koshin Studio', '/en/'], [p.title, p.en]]),
    ];
  }
  const am = altPageMeta[rel.replace(/index\.html$/, '')];
  if (am && am.app) {
    const amPath = rel.replace(/index\.html$/, '');
    return [
      { '@type': 'SoftwareApplication', name: am.title, url: url, description: am.blurb, inLanguage: am.lang,
        operatingSystem: 'iOS', applicationCategory: 'UtilitiesApplication',
        downloadUrl: am.app, installUrl: am.app,
        ...(am.cover ? { image: SITE + am.cover } : {}),
        author: { '@id': SITE + '#studio' }, publisher: { '@id': SITE + '#studio' },
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' } },
      crumbs([['Koshin Studio', '/en/'], [am.title, amPath]]),
    ];
  }
  /* 記事（notes）の各言語版：英語版と同じ BlogPosting を、その言語の inLanguage で出す */
  if (am && !am.app && /^\/[^/]+\/notes\//.test(rel)) {
    const amPath = rel.replace(/index\.html$/, '');
    const pair = enPairs.find((q) => q.alt && Object.values(q.alt).some((x) => x.path === amPath));
    if (pair) {
      return [
        { '@type': 'BlogPosting', headline: am.title, url: url, description: am.blurb,
          datePublished: pair.date, dateModified: pair.updated || pair.date, inLanguage: am.lang,
          image: ogFor(rel),
          author: { '@id': SITE + '#studio' }, publisher: { '@id': SITE + '#studio' },
          mainEntityOfPage: url,
          translationOfWork: { '@type': 'BlogPosting', url: SITE + pair.ja, inLanguage: 'ja' } },
        crumbs([['Koshin Studio', '/en/'], [am.title, amPath]]),
      ];
    }
  }
  const ep = enByPath[rel.replace(/index\.html$/, '')];
  if (ep && !em) {
    /* 英語の作品ページは、日本語側の作品データ（種別・絵・年）を借りて、
       VideoGame / SoftwareApplication として書く。言語は en */
    const wj = (ep.ja.match(/^\/works\/([^/]+)\/$/) || [])[1];
    const w = wj && workBySlug[wj];
    if (w) {
      const wImage = w.image ? SITE + w.image : w.cover ? SITE + w.cover + '@2x.jpg' : ogForPair(rel, ep.ja + 'index.html');
      return [
        { '@type': w.kind === 'game' ? 'VideoGame' : 'SoftwareApplication', name: ep.title, url: url, description: ep.blurb,
          inLanguage: 'en', image: wImage,
          applicationCategory: w.category || (w.kind === 'game' ? 'GameApplication' : 'UtilitiesApplication'),
          operatingSystem: w.os || 'Web', ...(w.status === '公開中' ? { datePublished: w.year } : {}),
          ...(w.appStoreUrl ? { downloadUrl: w.appStoreUrl, installUrl: w.appStoreUrl } : {}),
          ...(w.kind === 'game' ? { gamePlatform: 'Web browser', playMode: 'SinglePlayer' } : {}),
          author: { '@id': SITE + '#studio' }, publisher: { '@id': SITE + '#studio' },
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' } },
        crumbs([['Koshin Studio', '/en/'], [ep.title, ep.en]]),
      ];
    }
    const pg = page(ep.title); pg.inLanguage = 'en';
    return [pg, crumbs([['Koshin Studio', '/en/'], [ep.title, ep.en]])];
  }
  const cl = rel.match(/^\/([a-z]{2})\/calc\/(gacha|gacha-rate|lottery)\/index\.html$/);
  if (cl && I18N[cl[1]]) {
    const h1 = (readFileSync(file, 'utf8').match(/<h1>(.*?)<\/h1>/) || [, ''])[1];
    return [
      { '@type': 'WebApplication', name: h1, url: url, applicationCategory: 'UtilitiesApplication',
        operatingSystem: 'Any (browser)', inLanguage: 'ja', isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
        author: { '@id': SITE + '#studio' }, publisher: { '@id': SITE + '#studio' } },
      crumbs([['Koshin Studio', I18N[cl[1]].path], [h1, '/' + cl[1] + '/calc/' + cl[2] + '/']]),
    ];
  }
  const hm = rel.match(/^\/([a-z]{2})\/index\.html$/);
  if (hm && I18N[hm[1]]) return [page('Koshin Studio — ' + I18N[hm[1]].label), crumbs([['Koshin Studio', I18N[hm[1]].path]])];
  const nm = rel.match(/^\/notes\/([^/]+)\/index\.html$/);
  if (nm && noteBySlug[nm[1]]) {
    const nn = noteBySlug[nm[1]];
    return [
      { '@type': 'BlogPosting', headline: nn.title, url: SITE + nn.url, description: nn.blurb,
        datePublished: nn.date, dateModified: nn.updated || nn.date, inLanguage: 'ja',
        image: ogFor(rel),
        author: { '@id': SITE + '#studio' }, publisher: { '@id': SITE + '#studio' },
        mainEntityOfPage: SITE + nn.url },
      crumbs([['Koshin Studio', '/'], isPick(nn) ? ['Picks', '/picks/'] : ['Notes', '/notes/'], [nn.title, nn.url]]),
    ];
  }
  if (rel === '/works/index.html') return [crumbs([['Koshin Studio', '/'], ['Works', '/works/']]),
    { '@type': 'CollectionPage', name: 'Works', url: url, inLanguage: 'ja', isPartOf: { '@id': SITE + '#studio' } },
    { '@type': 'ItemList', name: '作ったもの',
      itemListElement: works.map((w, i) => ({ '@type': 'ListItem', position: i + 1, url: SITE + w.url, name: w.title })) }];
  if (rel === '/notes/index.html') return [crumbs([['Koshin Studio', '/'], ['Notes', '/notes/']]),
    { '@type': 'CollectionPage', name: 'Notes', url: url, inLanguage: 'ja', isPartOf: { '@id': SITE + '#studio' } },
    { '@type': 'ItemList', name: '制作の記録',
      itemListElement: records.map((n, i) => ({ '@type': 'ListItem', position: i + 1, url: SITE + n.url, name: n.title })) }];
  if (rel === '/picks/index.html') return [crumbs([['Koshin Studio', '/'], ['Picks', '/picks/']]),
    { '@type': 'CollectionPage', name: 'Picks', url: url, inLanguage: 'ja', isPartOf: { '@id': SITE + '#studio' } },
    { '@type': 'ItemList', name: '比べたもの・買ったもの',
      itemListElement: picks.map((n, i) => ({ '@type': 'ListItem', position: i + 1, url: SITE + n.url, name: n.title })) }];
  const tool = { '/calc/gacha/index.html': ['ガチャのコンプリート計算機', '/calc/gacha/'], '/calc/gacha-rate/index.html': ['ガチャの当たり確率・天井計算機', '/calc/gacha-rate/'], '/calc/lottery/index.html': ['抽選の当選確率計算機', '/calc/lottery/'], '/calc/box-price/index.html': ['トレカの BOX・パックの単価換算計算機', '/calc/box-price/'] }[rel];
  if (tool) return [crumbs([['Koshin Studio', '/'], ['Tools', '/calc/'], [tool[0], tool[1]]]),
    { '@type': 'WebApplication', name: tool[0], url: SITE + tool[1], applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any (ブラウザ)', inLanguage: 'ja', isAccessibleForFree: true,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
      author: { '@id': SITE + '#studio' }, publisher: { '@id': SITE + '#studio' } }];
  if (rel === '/calc/index.html') return [crumbs([['Koshin Studio', '/'], ['Tools', '/calc/']]),
    { '@type': 'CollectionPage', name: 'Tools', url: url, inLanguage: 'ja', isPartOf: { '@id': SITE + '#studio' } }];
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
  if (rel === '/anime/index.html') return [page('ガチアニメ診断ガイド'), crumbs([['Koshin Studio', '/'], ['Works', '/works/'], ['ガチアニメ診断', '/works/shindananime/'], ['ガイド', '/anime/']])];
  if (rel === '/anime/guide/index.html') return [page('アニメ診断の選び方'),
    { '@type': 'FAQPage', mainEntity: guideFaq.map((f) => ({ '@type': 'Question', name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a } })) },
    crumbs([['Koshin Studio', '/'], ['Works', '/works/'], ['ガチアニメ診断', '/works/shindananime/'], ['ガイド', '/anime/'], ['選び方', '/anime/guide/']])];
  if (rel === '/anime/axes/index.html') return [page('6つの軸'), crumbs([['Koshin Studio', '/'], ['Works', '/works/'], ['ガチアニメ診断', '/works/shindananime/'], ['ガイド', '/anime/'], ['6つの軸', '/anime/axes/']])];
  if (rel === '/anime/types/index.html') return [page('64タイプ一覧'), crumbs([['Koshin Studio', '/'], ['Works', '/works/'], ['ガチアニメ診断', '/works/shindananime/'], ['ガイド', '/anime/'], ['64タイプ', '/anime/types/']])];
  const tm = rel.match(/^\/anime\/types\/([^/]+)\/index\.html$/);
  if (tm && typeByCode[tm[1].toUpperCase()]) {
    const t = typeByCode[tm[1].toUpperCase()];
    return [page(t.code + '「' + t.nickname + '」'),
      crumbs([['Koshin Studio', '/'], ['Works', '/works/'], ['ガチアニメ診断', '/works/shindananime/'], ['ガイド', '/anime/'], ['64タイプ', '/anime/types/'], [t.code, typeUrl(t.code)]])];
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
              ['遊び方', w.url + 'guide']]),
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
    '<header class="site"><div class="wrap">\n  <a class="logo" href="/"><img class="logo-mark" src="/favicon.svg" alt="" width="28" height="28">Koshin Studio</a>\n  <nav><a href="/works/">Works</a><a href="/notes/">Notes</a><a href="/picks/">Picks</a><a href="/calc/">Tools</a><a href="/about/">About</a></nav>');
  html = html.replace(/(<footer class="site"><div class="wrap">[\s\S]*?)<nav>[\s\S]*?<\/nav>(\s*<\/div><\/footer>)/,
    '$1' + (I18N[rel.split('/')[1]]
      ? '<nav><a href="/en/" hreflang="en" lang="en">English</a><a href="/" hreflang="ja" lang="ja">日本語</a><a href="/en/privacy/" hreflang="en" lang="en">Privacy</a></nav>'
      : '<nav><a href="/picks/">Picks</a><a href="/calc/">Tools</a><a href="/about/">About</a><a href="/privacy/">あつかい</a><a href="/en/" hreflang="en" lang="en">English</a></nav>') + '$2');
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
    '/anime/index.html': [['Works', '/works/'], ['ガチアニメ診断', '/works/shindananime/'], ['ガイド', '/anime/']],
    '/anime/axes/index.html': [['Works', '/works/'], ['ガチアニメ診断', '/works/shindananime/'], ['ガイド', '/anime/'], ['6つの軸', '/anime/axes/']],
    '/anime/guide/index.html': [['Works', '/works/'], ['ガチアニメ診断', '/works/shindananime/'], ['ガイド', '/anime/'], ['選び方', '/anime/guide/']],
    '/anime/types/index.html': [['Works', '/works/'], ['ガチアニメ診断', '/works/shindananime/'], ['ガイド', '/anime/'], ['64タイプ', '/anime/types/']],
    '/privacy/index.html': [['あつかい', '/privacy/']],
    '/picks/index.html': [['Picks', '/picks/']],
    '/calc/index.html': [['Tools', '/calc/']],
    '/calc/gacha/index.html': [['Tools', '/calc/'], ['ガチャのコンプリート計算機', '/calc/gacha/']],
    '/calc/gacha-rate/index.html': [['Tools', '/calc/'], ['ガチャの当たり確率・天井計算機', '/calc/gacha-rate/']],
    '/calc/lottery/index.html': [['Tools', '/calc/'], ['抽選の当選確率計算機', '/calc/lottery/']],
    '/calc/box-price/index.html': [['Tools', '/calc/'], ['トレカの BOX・パックの単価換算計算機', '/calc/box-price/']],
  };
  let trail = TRAIL[rel];
  const wm2 = rel.match(/^\/works\/([^/]+)\//);
  const nm2 = rel.match(/^\/notes\/([^/]+)\//);
  const am2 = rel.match(/^\/anime\/types\/([^/]+)\/index\.html$/);
  if (am2 && typeByCode[am2[1].toUpperCase()]) {
    trail = [['Works', '/works/'], ['ガチアニメ診断', '/works/shindananime/'], ['ガイド', '/anime/'], ['64タイプ', '/anime/types/'], [am2[1].toUpperCase(), '/anime/types/' + am2[1] + '/']];
  }
  if (wm2 && workBySlug[wm2[1]]) {
    const w = workBySlug[wm2[1]];
    trail = [['Works', '/works/']].concat(
      rel.endsWith('/index.html') && rel === w.url + 'index.html'
        ? [[w.title, w.url]] : [[w.title, w.url], ['遊び方', rel.replace(/(index)?\.html$/, '')]]);
  } else if (nm2 && noteBySlug[nm2[1]]) {
    trail = [isPick(noteBySlug[nm2[1]]) ? ['Picks', '/picks/'] : ['Notes', '/notes/'], [noteBySlug[nm2[1]].title, noteBySlug[nm2[1]].url]];
  }
  /* 属性付きも消えるようにする（class="crumbs" だけを見ると一致せず、
     組み直すたびに増え続けていた） */
  const L = I18N[rel.split('/')[1]] || null;
  const isEn = !!L || !!altPageMeta[rel.replace(/index\.html$/, '')];
  if (!isEn) html = html.replace(/\s*<nav class="crumbs"[^>]*>[\s\S]*?<\/nav>/g, '');
  if (trail && !isEn) {
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
  html = html.replace(/\n?\s*<meta name="google-adsense-account"[^>]*>/g, '');
  const live = ads.enabled && ads.client && /<ins class="adsbygoogle"/.test(html);
  /* 審査中は枠が無くても、サイトの確認用に script とメタタグだけ入れる（広告は出ない） */
  if (live || (ads.verify && ads.client)) {
    html = html.replace('</head>',
      `<meta name="google-adsense-account" content="${ads.client}">\n<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ads.client}" crossorigin="anonymous"></script>\n</head>`);
  }
  const url = urlOf(file);
  html = html.replace(/\n?\s*<link rel="canonical"[^>]*>/g, '')
             .replace(/\n?\s*<meta property="og:url"[^>]*>/g, '')
             .replace(/\n?\s*<meta name="twitter:card"[^>]*>/g, '')
             .replace(/\n?\s*<meta property="og:site_name"[^>]*>/g, '')
             .replace(/\n?\s*<meta property="og:locale"[^>]*>/g, '')
             .replace(/\n?\s*<link rel="alternate" hreflang="[^"]*"[^>]*>/g, '')
             .replace(/\n?\s*<link rel="alternate" type="application\/rss\+xml"[^>]*>/g, '')
             .replace(/\n?\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, '');
  const ld = ldFor(file, url);
  const pageMeta = altPageMeta[url.slice(SITE.length)] || null;
  const pageLang = pageMeta ? pageMeta.lang : (L ? L.lang : 'ja');
  const pageLocale = pageMeta ? pageMeta.locale : (L ? L.locale : 'ja_JP');
  html = html.replace(/<html lang="[^"]*">/, `<html lang="${pageLang}">`);
  const relUrl = url.slice(SITE.length);
  const pair = enByPath[relUrl] || jaToEn[relUrl];
  const hubSet = (relUrl === '/' || hubPaths[relUrl])
    ? [['ja', '/']].concat(Object.values(I18N).map((l) => [l.lang, l.path])) : null;
  /* 計算機は、日本語と各言語のページを、同じ組にする */
  const calcM = relUrl.match(/^(?:\/([a-z]{2}))?\/calc\/(gacha|gacha-rate|lottery)\/$/);
  const calcSet = calcM && (!calcM[1] || I18N[calcM[1]])
    ? [['ja', '/calc/' + calcM[2] + '/']].concat(Object.values(I18N).map((l) => [l.lang, l.path + 'calc/' + calcM[2] + '/'])) : null;
  const grp = hubSet || calcSet;
  const altGrp = altGroupByPath[relUrl] || null;
  const hreflangs = altGrp ? altGrp.members.map(([c, p]) => `<link rel="alternate" hreflang="${c}" href="${SITE + p}">`)
      .concat(`<link rel="alternate" hreflang="x-default" href="${SITE + altGrp.xdefault}">`)
    : grp ? grp.map(([c, p]) => `<link rel="alternate" hreflang="${c}" href="${SITE + p}">`)
      .concat(`<link rel="alternate" hreflang="x-default" href="${SITE + (hubSet ? '/en/' : '/en/calc/' + calcM[2] + '/')}">`)
    : pair ? [
    `<link rel="alternate" hreflang="ja" href="${SITE + pair.ja}">`,
    `<link rel="alternate" hreflang="en" href="${SITE + pair.en}">`,
    `<link rel="alternate" hreflang="x-default" href="${SITE + pair.en}">`,
  ] : [];
  /* 言語の切り替え。印の間は組むたびに作り直す */
  html = html.replace(/\n?<!--lang-->[\s\S]*?<!--\/lang-->\n?/g, '');
  if (pair) {
    const link = isEn
      ? `<a href="${pair.ja}" hreflang="ja" lang="ja">日本語版</a>`
      : `<a href="${pair.en}" hreflang="en" lang="en">English version</a>`;
    html = html.replace('<div class="rule"></div>', `<div class="rule"></div>\n<!--lang-->\n  <p class="note">${link}</p>\n<!--/lang-->`);
  }
  const head = [
    `<link rel="canonical" href="${url}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:site_name" content="Koshin Studio">`,
    `<meta property="og:locale" content="${pageLocale}">`,
    ...hreflangs,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<link rel="alternate" type="application/rss+xml" title="Koshin Studio — Notes" href="${SITE}/feed.xml">`,
    ld ? `<script type="application/ld+json">${JSON.stringify(
      { '@context': 'https://schema.org', '@graph': ld }).replace(/"inLanguage":"ja"/g, `"inLanguage":"${pageLang}"`)}</script>` : '',
  ].filter(Boolean).join('\n');
  html = html.replace('</head>', head + '\n</head>');
  /* ヘッダーのロゴ画像も、ファビコンと同じ印を付ける（絵を替えたら別の URL に） */
  html = html.replace(/src="\/favicon\.svg[^"]*"/g, () => `src="${stamped('/favicon.svg')}"`);
  /* ファビコン。絵を替えても、名前が同じだと、ブラウザは覚えた古い絵を使い続ける。
     中身の印（?v=）を付けて、替えたら別物として取りに行かせる。
     .ico も並べる（SVG に対応しない環境や、/favicon.ico を決め打ちで取る相手のため） */
  html = html.replace(/\n?\s*<link rel="icon"[^>]*>/g, '');
  html = html.replace('<script>document.documentElement.className+=" js"</script>',
    `<link rel="icon" href="${stamped('/favicon.ico')}" sizes="48x48">\n`
    + `<link rel="icon" href="${stamped('/favicon.svg')}" type="image/svg+xml" sizes="any">\n`
    /* Google は、検索結果のファビコンに、48px の倍数の正方形（PNG・ICO・SVG）を勧めている。
       SVG に画像を埋め込んだものだけだと拾われにくいので、192px の PNG も並べる */
    + `<link rel="icon" href="${stamped('/assets/icon/icon-192.png')}" type="image/png" sizes="192x192">\n`
    + '<script>document.documentElement.className+=" js"</script>');
  /* ホーム画面に置いたときの絵と、manifest。
     SVG だけだと iOS で何も出ない。消してから入れ直す */
  html = html.replace(/\n?\s*<link rel="apple-touch-icon"[^>]*>/g, '')
             .replace(/\n?\s*<link rel="manifest"[^>]*>/g, '');
  html = html.replace('<script>document.documentElement.className+=" js"</script>',
    `<link rel="apple-touch-icon" href="${stamped('/assets/icon/icon-180.png')}">\n`
    + '<link rel="manifest" href="/site.webmanifest">\n'
    + '<script>document.documentElement.className+=" js"</script>');

  /* GSAP（と ScrollTrigger）を使うのは、数字を数え上げる data-count と、
     スクロールで動く絵（feat-media）だけ。それが無いページには配らない
     （測ると、JavaScript を止めた状態は、初回表示が約2倍速い）。
     組み直しても、同じ結果になる（無いものは、消すだけ） */
  if (!/data-count|feat-media/.test(html)) {
    html = html.replace(/<script src="\/vendor\/(?:gsap|ScrollTrigger)\.min\.js[^"]*" defer><\/script>\n?/g, '');
  }

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

  /* 英語のページは、対になった日本語のページの絵を使う */
  const ogPath = enByPath[rel.replace(/index\.html$/, '')] ? ogForPair(rel, enByPath[rel.replace(/index\.html$/, '')].ja + 'index.html') : ogFor(rel);      /* 構造化データと同じ絵を指す */
  html = html.replace(/\n?\s*<meta property="og:image"[^>]*>/g, '')
             .replace(/\n?\s*<meta property="og:image:width"[^>]*>/g, '')
             .replace(/\n?\s*<meta property="og:image:height"[^>]*>/g, '');
  html = html.replace('</head>',
    `<meta property="og:image" content="${ogPath}">\n` +
    `<meta property="og:image:width" content="1200">\n` +
    `<meta property="og:image:height" content="630">\n</head>`);
  /* 目次（記事だけ）。見出し（h2）から作る。読む人が長い記事の中で迷わないのと、
     見出しへの直接のリンク（#...）が検索結果の「ジャンプ先」に出ることがあるため。
     組み直しても増えないよう、印の間を消してから入れ、id も付け直す */
  html = html.replace(/\n?<!--toc-->[\s\S]*?<!--\/toc-->\n?/g, '');
  if (/^\/notes\/[^/]+\/index\.html$/.test(rel)) {
    let k = 0; const items = [];
    html = html.replace(/<h2 class="rv"(?: id="[^"]*")?>([\s\S]*?)<\/h2>/g, (m, inner) => {
      k += 1; items.push([`s${k}`, inner.replace(/<[^>]+>/g, '')]);
      return `<h2 class="rv" id="s${k}">${inner}</h2>`;
    });
    if (items.length >= 3) {
      const toc = `\n<!--toc-->\n  <nav class="toc" aria-label="目次"><p>目次</p><ol>${
        items.map(([id, t]) => `<li><a href="#${id}">${esc(t)}</a></li>`).join('')}</ol></nav>\n<!--/toc-->\n`;
      html = html.replace(/(\s*)<h2 class="rv" id="s1">/, (m) => toc + m.replace(/^\s*/, '  '));
    }
  }

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
    /* 先に、notes.json の related（スラッグの配列）で指した記事。そのあとを、同じ作品の記事で埋める。
       埋めるときは、自分の次の記事から順に取る。全記事が同じ 3 本を指して、
       ほかの記事へリンクが届かなくなるのを防ぐため */
    const same = (n) => n.slug !== me.slug && isPick(n) === isPick(me);
    const pinned = (me.related || []).map((s) => noteBySlug[s]).filter((n) => n && same(n));
    const at = notes.indexOf(me);
    const rest = notes.slice(at + 1).concat(notes.slice(0, at)).filter((n) => same(n) && !pinned.includes(n))
      .sort((a, b) => (b.work === me.work) - (a.work === me.work));
    relHtml = relBlock(isPick(me) ? 'ほかの Picks' : 'ほかの記録', pinned.concat(rest).slice(0, 3));
  } else if (rw && workBySlug[rw[1]]) {
    relHtml = relBlock('この作品の記録', notes.filter((n) => n.work === workBySlug[rw[1]].title));
  }
  if (relHtml) html = html.replace(/<\/div>\s*<\/main>/, (m) => relHtml + m);
  /* 紹介の枠（記事だけ。アフィリエイト）。site.json の affiliate.enabled が true で、
     data/notes.json の記事に picks があり、data/picks.json のその項目に url がある時だけ出す。
     開示の一文を冒頭にも入れる（隠さない）。組み直しても増えないよう、印の間を消してから入れる */
  html = html.replace(/\n?<!--picks-->[\s\S]*?<!--\/picks-->\n?/g, '')
             .replace(/\n?<!--picks-note-->[\s\S]*?<!--\/picks-note-->\n?/g, '');
  /* 記事（notes の各言語版）は、読みやすさのために専用の組み方にする（style.css の body.article）。
     組み直しても増えないよう、class が無い <body> にだけ付ける */
  if (/^\/(?:[^/]+\/)?(?:notes\/[^/]+|about|privacy|works\/[^/]+)\/index\.html$/.test(rel)) html = html.replace(/<body(?: class="article(?: doc)?")?>/, /\/(?:about|privacy|works)\//.test(rel) ? '<body class="article doc">' : '<body class="article">');
  const af = conf.affiliate || {};
  /* 紹介の枠の対象：日本語・英語の記事（notes）と作品ページ（works）。
     ⚠️手で書いた枠（class="note picks-note" が印の外にある頁。スリーブ記事の各言語版）には重ねない */
  const pm = rel.match(/^\/(en\/)?(notes|works)\/([^/]+)\/index\.html$/);
  const pEntry = pm ? (pm[2] === 'notes' ? noteBySlug[pm[3]] : workBySlug[pm[3]]) : null;
  const pEn = !!(pm && pm[1]);
  if (af.enabled && pEntry && (pEntry.picks || []).length && !html.includes('picks-note')) {
    const items = pEntry.picks.map((id) => pickById[id]).filter((x) => x && x.url);
    if (items.length) {
      const disc = pEn ? (af.disclosure_en || af.disclosure || '') : (af.disclosure || '');
      const head = pEn ? 'Related items' : (pm[2] === 'works' ? '関連するもの' : 'この記事で紹介したもの');
      const box = `\n<!--picks-->
  <section class="picks" id="picks">
    <h2 id="picks-h">${head}</h2>
    <p class="note">${esc(disc)}</p>
    ${items.some((x) => pickRk[x.id]) ? `<p class="note">${pEn ? 'Cards with a photo are picked automatically from Rakuten\u2019s best sellers and reviews. I have not used them.' : '写真つきのカードは、楽天の売れ筋とレビューから機械的に選んだものです（使って選んだものではありません）。'}</p>` : ''}
    <ul class="plain pick-list">${items.map((x) => {
      const rk = pickRk[x.id];
      const aLink = `<a href="${esc(x.url)}" rel="sponsored noopener" target="_blank">${esc(pEn ? (x.name_en || x.name) : x.name)}</a>`;
      if (!rk) return `
      <li>${aLink}${x.service && !String(x.name).includes(x.service) ? ` (${esc(x.service)})` : ''} \u2014 ${esc(pEn ? (x.comment_en || x.comment || '') : (x.comment || ''))}</li>`;
      const stars = rk.reviewCount ? ` \u2605${rk.reviewAverage.toFixed(1)} (${rk.reviewCount})` : '';
      return `
      <li class="pick-card">
        <a class="pick-img" href="${esc(rk.url)}" rel="sponsored noopener" target="_blank"><img src="${esc(rk.image)}" alt="" width="100" height="100" loading="lazy" referrerpolicy="no-referrer"></a>
        <div class="pick-body">
          <a class="pick-title" href="${esc(rk.url)}" rel="sponsored noopener" target="_blank">${esc(rk.title)}</a>
          <div class="pick-meta">\u00a5${rk.price.toLocaleString('ja-JP')}${stars} \u00b7 ${esc(pEn ? (rk.shop === '楽天ブックス' ? 'Rakuten Books' : 'Rakuten Ichiba') : rk.shop)}</div>
          <div class="pick-links"><a class="btn pick-btn" href="${esc(rk.url)}" rel="sponsored noopener" target="_blank">${pEn ? 'View on Rakuten' : '楽天で見る'}</a> ${aLink}</div>
        </div>
      </li>`;
    }).join('')}
    </ul>
    ${items.some((x) => pickRk[x.id]) ? '<p class="note"><a href="https://webservice.rakuten.co.jp/" target="_blank" rel="noopener">Supported by Rakuten Developers</a></p>' : ''}
  </section>
<!--/picks-->\n`;
      html = html.replace(/<\/div>\s*<\/main>/, (m) => box + m);
      html = html.replace(/(<\/h1>)/, `$1\n<!--picks-note--><p class="note picks-note">${esc(disc)}</p><!--/picks-note-->`);
    }
  }
  /* コメント欄（記事だけ。giscus ＝ GitHub Discussions）。site.json の comments.categoryId が
     空の間は何も出さない。「コメントを開く」を押すまで、外部（giscus.app・GitHub）へは繋がない
     （読み込みが重くなるのと、押さない人の接続を増やさないため）。組み直しても増えない */
  html = html.replace(/\n?<!--comments-->[\s\S]*?<!--\/comments-->\n?/g, '');
  const cm = conf.comments || {};
  if (cm.repo && cm.repoId && cm.categoryId && /^\/notes\/[^/]+\/index\.html$/.test(rel)) {
    const box = `\n<!--comments-->
  <section class="comments" id="comments" data-repo="${esc(cm.repo)}" data-repo-id="${esc(cm.repoId)}"
    data-category="${esc(cm.category || 'Comments')}" data-category-id="${esc(cm.categoryId)}">
    <h2 id="comments-h">コメント</h2>
    <p>感想や、記事の間違いの指摘は、ここへ。書くには、GitHub のアカウントが要ります。</p>
    <p><button type="button" class="btn ghost" id="load-comments">コメントを開く</button></p>
    <p class="note">押すと、giscus（giscus.app）と GitHub に接続します。押さなければ、接続しません。詳しくは<a href="/privacy/">あつかい</a>に書いています。</p>
    <div id="giscus-box"></div>
  </section>
<!--/comments-->\n`;
    html = html.replace(/<\/div>\s*<\/main>/, (m) => box + m);
  }

  /* 検索結果・Discover で、大きい画像と、長い抜粋を出してよい、という意思表示。
     noindex のページ（タイプ別など）には付けない。組み直しても増えないよう、消してから入れる */
  html = html.replace(/\n?<meta name="robots" content="index,follow[^"]*">/g, '');
  if (!/name="robots"/.test(html)) {
    html = html.replace('</head>', '<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">\n</head>');
  }
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

/* /submit と /top は、すし積むの番付サーバーへの通信先の名前で、ゲームの
   プログラムの中に文字列として書いてある（実際の通信先は別のサーバー）。
   検索ロボットがそれを URL だと思って取りに来て、404 になる（実害は無い）。
   取りに来なくてよい、と伝えておく。このサイトに、同じ名前のページは無い */
writeFileSync(here + '/robots.txt',
  [
    '# 検索エンジンにも、AI の検索・回答のための取得にも、記事と計算機を読んでもらってかまいません。',
    '# 下の名前付きの取得ロボットも、同じ規則で、許可しています（全部「User-agent: *」と同じ）。',
    ...['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'Claude-SearchBot', 'Claude-User',
      'PerplexityBot', 'Perplexity-User', 'Google-Extended', 'Applebot-Extended', 'Bingbot', 'Googlebot']
      .map((ua) => 'User-agent: ' + ua).concat(['User-agent: *']),
    'Allow: /', 'Disallow: /submit', 'Disallow: /top', '',
    'Sitemap: ' + SITE + '/sitemap.xml',
    /* トレカダッシュ Web版（/app/torecadash/、別の Pages から worker が中継）は
       ページが毎時入れ替わるので、sitemap も向こうが自分で書き出す */
    'Sitemap: ' + SITE + '/app/torecadash/sitemap.xml', ''].join('\n'));


/* ---- llms.txt / llms-full.txt（AI が、このサイトを読み取りやすくする） ----
   llms.txt: サイトの要約と、ページの一覧（題と、一文の説明つき）。
   llms-full.txt: 主な頁の本文を、見出しと表を残した文章にして、一続きにしたもの。
   記事に書いた内容を、そのまま取れる形で置く。組み直すたびに、作り直す */
const decodeEnt = (s) => s.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
function mainAsText(file) {
  let h = readFileSync(file, 'utf8');
  const m = h.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  if (!m) return '';
  h = m[1]
    .replace(/<!--toc-->[\s\S]*?<!--\/toc-->/g, '').replace(/<!--related-->[\s\S]*?<!--\/related-->/g, '')
    .replace(/<!--comments-->[\s\S]*?<!--\/comments-->/g, '')
    .replace(/<nav class="crumbs"[\s\S]*?<\/nav>/g, '').replace(/<nav class="toc"[\s\S]*?<\/nav>/g, '')
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>|<form[\s\S]*?<\/form>|<noscript[\s\S]*?<\/noscript>/g, '')
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g, (x, u, t) => {
      const txt = t.replace(/<[^>]+>/g, '').trim();
      return /^(\/|https?:)/.test(u) && txt ? `${txt} (${u.startsWith('/') ? SITE + u : u})` : txt;
    })
    .replace(/<h1[^>]*>/g, '\n# ').replace(/<h2[^>]*>/g, '\n\n## ').replace(/<h3[^>]*>/g, '\n\n### ')
    .replace(/<\/h[1-3]>/g, '\n').replace(/<li[^>]*>/g, '\n- ').replace(/<\/tr>/g, '\n')
    .replace(/<\/t[hd]>\s*<t[hd][^>]*>/g, ' | ').replace(/<t[hd][^>]*>/g, '').replace(/<\/p>|<br\s*\/?>/g, '\n')
    .replace(/<blockquote[^>]*>/g, '\n> ').replace(/<[^>]+>/g, '');
  return decodeEnt(h).replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
const abs = (u) => SITE + u;
const line = (t, u, d) => `- [${t}](${abs(u)})${d ? ': ' + d : ''}`;
const toolRows = (typeof tools !== 'undefined' ? tools : []);
const llms = [
  '# Koshin Studio', '',
  `> ${conf.tagline || ''} 個人で、ゲーム・アプリ・診断を作って、試して、書いているスタジオです。記事は、実際に作って測ったことと、公式ページだけで比べた結果（出典と確認日つき）を書いています。確認できなかったことは、確認できなかったと書きます。`, '',
  `サイト: ${SITE}/`, `全文: ${abs('/llms-full.txt')}`, '',
  '## Notes（制作の記録）', ...records.map((n) => line(n.title, n.url, n.blurb)), '',
  '## Picks（比べたもの・買ったもの）', ...picks.map((n) => line(n.title, n.url, n.blurb)), '',
  '## Tools（計算機）', ...toolRows.map((t) => line(t.title, t.url, t.blurb)), '',
  '## Works（作ったもの）', ...works.map((w) => line(w.title, w.url, w.blurb)), '',
  '## ガチアニメ診断のガイド',
  line('ガイド', '/anime/', '診断の仕組みと 64 タイプ'), line('6 つの軸', '/anime/axes/', ''), line('選び方', '/anime/guide/', 'アニメ診断の選び方'), line('64 タイプ一覧', '/anime/types/', ''), '',
  '## English (en)',
  ...enPairs.map((p) => line(p.title, p.en, p.blurb)),
  line('English hub', '/en/', 'Games, tools and development logs in English'),
  ...Object.values(I18N).filter((l) => l.path !== '/en/').map((l) => line(l.label, l.path, 'Games and tools in this language')), '',
  '## そのほか', line('About', '/about/', '運営者・連絡先・記事の書き方と訂正について'), line('あつかい（プライバシー）', '/privacy/', ''), ''].join('\n');
writeFileSync(here + '/llms.txt', llms);
const fullPages = [].concat(
  records.map((n) => n.url), picks.map((n) => n.url), toolRows.map((t) => t.url),
  works.map((w) => w.url), ['/anime/', '/anime/axes/', '/anime/guide/', '/about/', '/privacy/'], enPairs.map((p) => p.en), ['/en/']);
const full = ['# Koshin Studio — 全文', '', `> ${SITE}/ の主な頁の本文です。出典は、各頁の URL。`, ''].concat(
  fullPages.map((u) => {
    const f = here + u + 'index.html';
    return existsSync(f) ? `\n---\n\nURL: ${abs(u)}\n\n${mainAsText(f)}\n` : '';
  })).join('\n');
writeFileSync(here + '/llms-full.txt', full);
console.log(`site: llms.txt（${llms.split('\n').length} 行）と llms-full.txt（${Math.round(full.length / 1024)} KB）を書きました`);

console.log(`site: ${pages.length} ページに canonical と構造化データ、sitemap.xml を書きました`);

console.log(`site: works ${works.length} / notes ${notes.length} / 分野 ${kindKeys.length} を書き出しました`);
