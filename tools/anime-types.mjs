/* 64 タイプぶんの材料を data/anime-types.json に書き出す。
   /anime/ のページは、これを読んで build.mjs が組む。

   診断の計算（logic.js）と作品データ（all_anime_db.json）は
   ガチアニメ診断のリポジトリにある。ここでは持たず、読みに行く。
     node tools/anime-types.mjs                     … 公開中のものを読む
     ANIME_DIR=../shindananime node tools/anime-types.mjs  … 手元のものを読む

   タイプごとに、そのタイプの軸ベクトル（各軸 +1 / -1）に近い作品を
   診断本番と同じ pick() で選ぶ。人気や年代の上乗せは診断と同じ。
   作品名と年だけを書き、あらすじや画像は持ってこない。 */
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const here = import.meta.dirname;
const ORIGIN = 'https://shindananime.pages.dev';
const dir = process.env.ANIME_DIR;
const tmp = mkdtempSync(join(tmpdir(), 'anime-'));

async function grab(name) {
  if (dir) return join(dir, name);
  const r = await fetch(`${ORIGIN}/${name}`);
  if (!r.ok) throw new Error(name + ': ' + r.status);
  const p = join(tmp, name);
  writeFileSync(p, Buffer.from(await r.arrayBuffer()));
  return p;
}

const logicPath = await grab('logic.js');
const dbPath = await grab('all_anime_db.json');
const L = await import(logicPath);
const db = JSON.parse(readFileSync(dbPath, 'utf8'));
const works = L.usable(db.works);

const types = [];
for (let n = 0; n < 64; n++) {
  /* 6 軸の勝ち負けを、2 進数の各桁に割り当てる */
  const u = L.AXES.map((_, i) => ((n >> (5 - i)) & 1 ? -1 : 1));
  const picks = L.pick(u, works, 6).map((c) => ({
    title: c.work.t, year: c.work.y || null, match: c.match,
  }));
  types.push({
    code: L.typeCode(u),
    nickname: L.nickname(u),
    letters: L.letters(u),
    works: picks,
  });
}
types.sort((a, b) => a.code.localeCompare(b.code));

writeFileSync(here + '/../data/anime-types.json',
  JSON.stringify({ total: works.length, types }, null, 1) + '\n');
console.log('64 タイプ、作品 ' + works.length + ' 件から書き出しました');
