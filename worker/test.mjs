/* 中継の判定だけを確かめる。外へは出ないよう、fetch を差し替える。
       node worker/test.mjs
*/
import mod from './index.js';

let asked = null;
globalThis.fetch = async (req) => {
  asked = typeof req === 'string' ? req : req.url;
  return new Response('（配信元の中身）', { headers: { 'Content-Type': 'text/html' } });
};

const cases = [
  ['/play/sushitsumu/',            'そのまま中継'],
  ['/app/sushitsumu/',             '入口が違えば別扱い'],
  ['/play/sushitsumu/?lang=en',    'クエリを引き継ぐ'],
  ['/play/sushitsumu/favicon.svg', '中のファイルも中継'],
  ['/play/sushitsumu',             '末尾の / を足して送り直す'],
  ['/play/stopwatch10/',           '二本目も中継'],
  ['/play/',                       '作品一覧へ返す'],
  ['/play/しらないやつ/',            '知らない作品'],
  ['/works/',                      'ここが受ける道ではない'],
];

let bad = 0;
for (const [path, name] of cases) {
  asked = null;
  const res = await mod.fetch(new Request('https://koshinstudio.com' + path));
  const loc = res.headers.get('location') || '';
  const line = `${res.status}${loc ? ' → ' + loc : ''}${asked ? '  取りに行った先: ' + asked : ''}`;
  console.log(`${name.padEnd(22)} ${path.padEnd(28)} ${line}`);
}

/* 肝心なところだけ、機械でも確かめる */
const check = async (path, want) => {
  asked = null;
  const res = await mod.fetch(new Request('https://koshinstudio.com' + path));
  const got = { status: res.status, loc: res.headers.get('location'), asked };
  const ok = Object.keys(want).every((k) => String(got[k]) === String(want[k]));
  if (!ok) { console.error('× ' + path, JSON.stringify(got), '≠', JSON.stringify(want)); bad = 1; }
};
await check('/play/sushitsumu/', { status: 200, asked: 'https://sushitsumu.pages.dev/' });
await check('/play/sushitsumu/?lang=en', { status: 200, asked: 'https://sushitsumu.pages.dev/?lang=en' });
await check('/play/sushitsumu', { status: 301, loc: 'https://koshinstudio.com/play/sushitsumu/' });
await check('/play/', { status: 302, loc: 'https://koshinstudio.com/works/' });
await check('/play/nope/', { status: 404 });
await check('/works/', { status: 404 });
await check('/app/sushitsumu/', { status: 404 });   /* play のものは app には無い */
/* 作品が増えたら、ここにも一行足す。ROUTES を書き換えただけで
   出し忘れても気づけるようにしておく */
await check('/play/stopwatch10/', { status: 200, asked: 'https://stopwatch10.pages.dev/' });
await check('/app/', { status: 302, loc: 'https://koshinstudio.com/works/' });
await check('/app/nope/', { status: 404 });
console.log(bad ? '\n合わないところがあります' : '\n判定はすべて狙いどおり。');
process.exit(bad);
