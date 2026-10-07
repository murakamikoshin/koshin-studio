/* IndexNow（Bing・Yandex など）へ、更新した URL を知らせる。
   Google は IndexNow を使わない（Google は Search Console の sitemap で見る）。
   鍵のファイルは、サイトの直下に <鍵>.txt として置いてある（中身は鍵だけ）。

       node tools/indexnow.mjs            # sitemap.xml の全 URL を送る
*/
import { readFileSync, readdirSync } from 'node:fs';
const SITE_DIR = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const keyFile = readdirSync(SITE_DIR).find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error('鍵のファイル（<32桁>.txt）がサイト直下に無い');
const key = keyFile.replace('.txt', '');
const urls = [...readFileSync(SITE_DIR + '/sitemap.xml', 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const body = { host: 'koshinstudio.com', key, keyLocation: `https://koshinstudio.com/${keyFile}`, urlList: urls };
const r = await fetch('https://api.indexnow.org/IndexNow', {
  method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify(body) });
console.log(`IndexNow: ${r.status} ${r.statusText}（${urls.length} URL）`);
