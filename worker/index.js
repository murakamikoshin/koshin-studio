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
  },
  app: {
    shindananime: 'https://shindananime.pages.dev',
    /* トレカダッシュの Web版（受付中の抽選・予約まとめ）。
       中身は cardalerthub の functions/web/ が VPS で毎時組んで出す */
    torecadash: 'https://torecadash-web.pages.dev',
  },
};

/* 名前を変えた作品。古い道で来たら、新しい道へ送り直す（後ろの道と ?… はそのまま） */
const MOVED = {
  play: { 'kaeru-dani': 'kaeru-sekai' },
  app: {},
};

export default {
  async fetch(request) {
    const url = new URL(request.url);

    const m = url.pathname.match(/^\/(play|app)(?:\/([A-Za-z0-9_-]+)(\/.*)?)?\/?$/);
    if (!m) return new Response('Not found', { status: 404 });
    const [, kind, slug, rest] = m;

    const moved = (MOVED[kind] || {})[slug];
    if (moved) return Response.redirect(url.origin + '/' + kind + '/' + moved + (rest || '/') + url.search, 301);

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

    const res = await fetch(new Request(target.toString(), request));
    /* 中継したことが分かるように、内容はそのまま、頭だけ触る */
    const out = new Response(res.body, res);
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
