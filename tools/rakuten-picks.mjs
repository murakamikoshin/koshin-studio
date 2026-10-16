/* data/picks.json の rk（楽天の検索条件）を持つ項目について、楽天の商品APIで
   「売れ筋で、画像と値段とレビューがある1点」を選び、data/picks-rakuten.json に書く。
   サイトに画像つきのカードで出すため（node build.mjs が読む）。

       RAKUTEN_APP_ID=… RAKUTEN_ACCESS_KEY=… RAKUTEN_AFFILIATE_ID=… node tools/rakuten-picks.mjs

   ⚠️鍵はこのリポジトリに置かない（環境変数で渡す）。書き出すのは公開されて良い情報だけ
   （題名・画像のURL・値段・レビュー・アフィリエイトのリンク）。
   ⚠️「使って選んだ」ではなく「売れ筋」で選ぶ。題名が rk.must に合わないもの（検索語に引かれた別物）は採らない
   （採らなければ、その項目は画像なしのAmazon検索リンクだけになる）。ページにもそう書く（build.mjs）。
   ⚠️楽天ウェブサービスの規約：クレジット表示（Supported by Rakuten Developers）を
   カードの近くに出す（build.mjs）。 */
import { readFileSync, writeFileSync } from 'node:fs';

const SITE_DIR = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const { RAKUTEN_APP_ID: appId, RAKUTEN_ACCESS_KEY: accessKey, RAKUTEN_AFFILIATE_ID: affiliateId } = process.env;
if (!appId || !accessKey) throw new Error('RAKUTEN_APP_ID / RAKUTEN_ACCESS_KEY が要る');
const picks = JSON.parse(readFileSync(SITE_DIR + '/data/picks.json', 'utf8')).items;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const BAD = /中古|訳あり|アウトレット|福袋|ジャンク|予約|ガチャ/;

async function getJson(url) {
  for (let i = 1; i <= 4; i++) {
    const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (r.ok) return r.json();
    if (r.status === 429) { await sleep(2000 * i); continue; }
    throw new Error(`楽天API ${r.status}: ${(await r.text()).slice(0, 200)}`);
  }
  throw new Error('楽天APIの再試行に失敗');
}

const ok = (title, rk) => (!rk.must || new RegExp(rk.must, 'i').test(title)) && !(rk.mustnot && new RegExp(rk.mustnot, 'i').test(title));

async function books(keyword, rk) {
  const q = new URLSearchParams({ applicationId: appId, accessKey, affiliateId: affiliateId || '',
    keyword, sort: 'sales', hits: '20', availability: '1', formatVersion: '2' });
  const d = await getJson('https://openapi.rakuten.co.jp/services/api/BooksTotal/Search/20170404?' + q);
  const items = Array.isArray(d.Items) ? d.Items : [];
  for (const it of items) {
    const image = it.largeImageUrl || it.mediumImageUrl || '';
    if (!image || !it.itemUrl || BAD.test(it.title || '') || !ok(it.title || '', rk)) continue;
    return { title: it.title, sub: [it.author, it.publisherName].filter(Boolean).join(' / '),
      price: Number(it.itemPrice) || 0, image: image.replace(/\?_ex=\d+x\d+$/, '?_ex=200x200'),
      url: it.affiliateUrl || it.itemUrl, reviewAverage: Number(it.reviewAverage) || 0,
      reviewCount: Number(it.reviewCount) || 0, shop: '楽天ブックス' };
  }
  return null;
}

async function ichiba(keyword, rk) {
  const q = new URLSearchParams({ applicationId: appId, accessKey, affiliateId: affiliateId || '',
    keyword, hits: '30', sort: '-reviewCount', availability: '1', imageFlag: '1', formatVersion: '2' });
  const d = await getJson('https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701?' + q);
  for (const it of d.Items || []) {
    const imgs = it.mediumImageUrls || [];
    const image = imgs.length ? (typeof imgs[0] === 'string' ? imgs[0] : imgs[0].imageUrl) : '';
    if (!image || !it.affiliateUrl || BAD.test(it.itemName || '') || !ok(it.itemName || '', rk)) continue;
    if (Number(it.itemPrice) > 12000) continue;
    if (Number(it.reviewCount) < 10 || Number(it.reviewAverage) < 4.2) continue;
    return { title: String(it.itemName).replace(/【[^】]*】|★|☆/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 60),
      sub: it.shopName || '', price: Number(it.itemPrice) || 0,
      image: image.replace(/\?_ex=\d+x\d+$/, '?_ex=200x200'), url: it.affiliateUrl,
      reviewAverage: Number(it.reviewAverage) || 0, reviewCount: Number(it.reviewCount) || 0, shop: '楽天市場' };
  }
  return null;
}

const out = {};
for (const p of picks) {
  if (!p.rk) continue;
  try {
    const hit = p.rk.type === 'books' ? await books(p.rk.keyword, p.rk) : await ichiba(p.rk.keyword, p.rk);
    if (hit) { out[p.id] = { ...hit, fetchedAt: new Date().toISOString().slice(0, 10) }; console.log('OK  ', p.id, hit.title.slice(0, 40), hit.price); }
    else console.log('なし', p.id);
  } catch (e) { console.log('失敗', p.id, e.message.slice(0, 80)); }
  await sleep(1100);
}
writeFileSync(SITE_DIR + '/data/picks-rakuten.json', JSON.stringify(out, null, 2) + '\n');
console.log('書きました', Object.keys(out).length, '件');
