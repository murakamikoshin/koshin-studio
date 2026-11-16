/* koshinstudio.com/play/<作品>/ と /app/<道具>/ を、それぞれの配信元へ中継する。

   作品はそれぞれ自分のリポジトリから自分の Pages に出す。
   ここはその前に立って、住所だけを koshinstudio.com に揃える係。

   ・サブドメインに分けると、ハイスコアや設定（localStorage）が
     サイトと別扱いになる。同じ住所に載せれば分断されない
   ・作品が増えても、増えるのは下の一行だけ

   出す:  cd worker && npx wrangler deploy
*/

/* 入口と、その中身。作品が増えたらここに一行足すだけ。
   /play/ は遊ぶもの、/app/ はブラウザで使う道具。
   分けてあるのは URL を見ただけで何か分かるようにするため */
const ROUTES = {
  play: {
    sushitsumu: 'https://sushitsumu.pages.dev',
    stopwatch10: 'https://stopwatch10.pages.dev',
    'kaeru-sekai': 'https://kaeru-sekai.pages.dev',
    /* dopagaki.pages.dev は他所の物なので、Pages が割り振った名前になっている。
       本体はこのリポジトリの game-dopagaki ブランチ（住所はそこの PAGES_HOST） */
    dopagaki: 'https://dopagaki-36i.pages.dev',
  },
  app: {
    shindananime: 'https://shindananime.pages.dev',
    /* トレカダッシュの Web版（torecadash-web.pages.dev）は、Pages のプロジェクトが無く
       530 になっていたので外した（2026-11-07）。作り直したら、ここに一行戻し、
       下の PAUSED から消し、build.mjs の robots.txt に sitemap の行を戻す */
  },
};

/* いまは中身の無い入口。404 にせず、紹介ページへ一時的に送る（戻すかもしれないので 302） */
const PAUSED = {
  play: {},
  app: { torecadash: '/works/torecadash/' },
};

/* 名前を変えた作品。古い道で来たら、新しい道へ送り直す（後ろの道と ?… はそのまま） */
const MOVED = {
  play: { 'kaeru-dani': 'kaeru-sekai' },
  app: {},
};

import { MOVED_NOTES } from './moved-notes.js';

export default {
  async fetch(request) {
    const url = new URL(request.url);

    /* /notes/ と /en/notes/：束ねた旧記事だけ 301 で送り、ほかはそのまま Pages へ通す */
    if (/^\/(en\/)?notes\//.test(url.pathname)) {
      const key = url.pathname.replace(/\/index\.(md|html)$/, '').replace(/\/$/, '');
      const to = MOVED_NOTES[key];
      if (to) return Response.redirect(url.origin + to, 301);
      return fetch(request);
    }

    const m = url.pathname.match(/^\/(play|app)(?:\/([A-Za-z0-9_-]+)(\/.*)?)?\/?$/);
    if (!m) return new Response('Not found', { status: 404 });
    const [, kind, slug, rest] = m;

    const moved = (MOVED[kind] || {})[slug];
    if (moved) return Response.redirect(url.origin + '/' + kind + '/' + moved + (rest || '/') + url.search, 301);

    const paused = (PAUSED[kind] || {})[slug];
    if (paused) return Response.redirect(url.origin + paused, 302);

    /* 入口だけで来たら、作品の一覧へ返す */
    if (!slug) return Response.redirect(url.origin + '/works/', 302);

    const origin = (ROUTES[kind] || {})[slug];
    if (!origin) {
      return new Response('それはここにはありません', {
        status: 404, headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }

    /* 末尾の / が無いと、中の相対指定がひとつ上を向いてしまう */
    if (!rest) {
      return Response.redirect(url.origin + '/' + kind + '/' + slug + '/' + url.search, 301);
    }

    const target = new URL(origin);
    target.pathname = rest;
    target.search = url.search;

    let res = await fetch(new Request(target.toString(), request));
    /* 検索に載せる。作品の側（*.pages.dev）は noindex のままでよい（同じ物が二か所に載らないように）。
       koshinstudio.com を通ったときだけ、noindex を外し、canonical をこの住所に向け直す */
    if (typeof HTMLRewriter !== 'undefined' && (res.headers.get('Content-Type') || '').includes('text/html')) {
      const self = url.origin + '/' + kind + '/' + slug + rest.replace(/index\.html$/, '');
      let hasCanonical = false;
      res = new HTMLRewriter()
        .on('meta[name="robots" i]', { element(e) { if (/noindex/i.test(e.getAttribute('content') || '')) e.remove(); } })
        .on('link[rel="canonical" i]', { element(e) { hasCanonical = true; e.setAttribute('href', self); } })
        .on('head', { element(e) { e.onEndTag((end) => { if (!hasCanonical) end.before(`<link rel="canonical" href="${self}">`, { html: true }); }); } })
        .transform(res);
    }
    /* 中継したことが分かるように、内容はそのまま、頭だけ触る */
    const out = new Response(res.body, res);
    out.headers.delete('X-Robots-Tag');
    out.headers.set('X-Served-By', 'koshin-studio/' + kind);
    /* 守りの頭。サイト本体（_headers）と揃える。ただし作品の側が決めた物は上書きしない
       （埋め込みの可否や CSP は、作品ごとに事情が違うので、ここでは足さない） */
    out.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    for (const [k, v] of [
      ['X-Content-Type-Options', 'nosniff'],
      ['Referrer-Policy', 'strict-origin-when-cross-origin'],
      ['X-Permitted-Cross-Domain-Policies', 'none'],
    ]) if (!out.headers.has(k)) out.headers.set(k, v);
    return out;
  },
};
