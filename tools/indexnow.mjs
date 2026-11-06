/* IndexNow（Bing・Yandex など）へ、更新した URL を知らせる。
   Google は IndexNow を使わない（Google は Search Console の sitemap で見る）。
   Bing は ChatGPT の検索や Copilot の土台でもあるので、海外の AI の回答にも効く。
   鍵のファイルは、サイトの直下に <鍵>.txt として置いてある（中身は鍵だけ）。

       node tools/indexnow.mjs            # sitemap.xml の全 URL を送る
       node tools/indexnow.mjs --changed  # いちばん新しい lastmod の日に変わった URL だけ（配備のたびに使う）

   --changed は、sitemap の lastmod（git の最後の変更日）を見る。全部を毎回送ると、
   変わっていない頁まで「変わった」と言うことになるので、配備では変わった分だけ送る。
   送る先が落ちていても、配備は止めない（知らせは、おまけ）。 */
import { readFileSync, readdirSync } from 'node:fs';
const SITE_DIR = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const keyFile = readdirSync(SITE_DIR).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error('鍵のファイル（<32桁>.txt）がサイト直下に無い');
const key = keyFile.replace('.txt', '');
const entries = [...readFileSync(SITE_DIR + '/sitemap.xml', 'utf8').matchAll(/<url><loc>([^<]+)<\/loc>(?:<lastmod>([^<]+)<\/lastmod>)?/g)]
  .map((m) => ({ url: m[1], mod: m[2] || '' }));
let urls = entries.map((e) => e.url);
if (process.argv.includes('--changed')) {
  const newest = entries.map((e) => e.mod).sort().pop() || '';
  urls = entries.filter((e) => e.mod && e.mod === newest).map((e) => e.url);
  console.log(`IndexNow: lastmod ${newest} の ${urls.length} URL を送ります`);
}
if (!urls.length) { console.log('IndexNow: 送る URL がありません'); process.exit(0); }
try {
  const body = { host: 'koshinstudio.com', key, keyLocation: `https://koshinstudio.com/${keyFile}`, urlList: urls.slice(0, 10000) };
  const r = await fetch('https://api.indexnow.org/IndexNow', {
    method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify(body) });
  console.log(`IndexNow: ${r.status} ${r.statusText}（${urls.length} URL）`);
} catch (e) {
  console.log('IndexNow: 送れませんでした（配備は続けます）', e.message);
}
