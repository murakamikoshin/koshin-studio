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

/* タイプごとの「中身」（2026-11-20）。型どおりの文だけの頁にしないために、
   データベースを数えた結果を持たせる。作品の軸 v の符号が、そのタイプの
   6 文字と全部同じ作品を「このタイプの作品」と数える。
   出すのは作品名・年・自前で付けたタグだけ。あらすじ・画像・★・レビュー数は持ってこない。 */
const signCode = (v) => L.typeCode(v.map((x) => (x >= 0 ? 1 : -1)));
const members = {};
for (const w of works) (members[signCode(w.v)] ||= []).push(w);
const tagAll = {};
for (const w of works) for (const g of w.g || []) tagAll[g] = (tagAll[g] || 0) + 1;
const decadeOf = (y) => (!y ? null : y < 2000 ? '〜1999' : y < 2010 ? '2000年代' : y < 2020 ? '2010年代' : '2020年代');
const DECADES = ['〜1999', '2000年代', '2010年代', '2020年代'];
const decAll = Object.fromEntries(DECADES.map((d) => [d, 0]));
let datedAll = 0;
for (const w of works) { const d = decadeOf(w.y); if (d) { decAll[d]++; datedAll++; } }
const dedupe = (list, n) => {
  const out = [], used = [];
  for (const w of list) {
    if (out.length >= n) break;
    const f = L.franchise(w);
    if (used.some((g) => L.sameFranchise(f, g))) continue;
    out.push(w); used.push(f);
  }
  return out;
};

const types = [];
for (let n = 0; n < 64; n++) {
  /* 6 軸の勝ち負けを、2 進数の各桁に割り当てる */
  const u = L.AXES.map((_, i) => ((n >> (5 - i)) & 1 ? -1 : 1));
  const code = L.typeCode(u);
  const picks = L.pick(u, works, 20).map((c) => ({
    title: c.work.t, year: c.work.y || null, match: c.match, tags: (c.work.g || []).slice(0, 3),
  }));
  const mine = members[code] || [];
  /* よく知られた作品：このタイプの作品を、人気（p）の高い順に。同じシリーズは 1 つだけ */
  const known = dedupe(mine.slice().sort((a, b) => (b.p || 0) - (a.p || 0)), 12)
    .map((w) => ({ title: w.t, year: w.y || null, tags: (w.g || []).slice(0, 3) }));
  /* 年代の内訳（年の分かる作品だけ） */
  const dec = Object.fromEntries(DECADES.map((d) => [d, 0]));
  let dated = 0;
  for (const w of mine) { const d = decadeOf(w.y); if (d) { dec[d]++; dated++; } }
  /* タグ：このタイプでの割合が、全体での割合の何倍か。10 作以上に付いたものだけ */
  const tagMine = {};
  for (const w of mine) for (const g of w.g || []) tagMine[g] = (tagMine[g] || 0) + 1;
  const tags = Object.entries(tagMine)
    .filter(([, c]) => c >= Math.max(5, Math.min(10, mine.length * 0.08)))
    .map(([g, c]) => ({ tag: g, count: c, share: +(c / mine.length * 100).toFixed(1),
      lift: +((c / mine.length) / (tagAll[g] / works.length)).toFixed(2) }))
    .sort((a, b) => b.lift - a.lift).slice(0, 6);
  types.push({
    code,
    nickname: L.nickname(u),
    letters: L.letters(u),
    works: picks,
    count: mine.length,
    share: +(mine.length / works.length * 100).toFixed(2),
    known,
    decades: DECADES.map((d) => ({ label: d, count: dec[d], share: dated ? +(dec[d] / dated * 100).toFixed(1) : 0 })),
    tags,
  });
}
/* 多い順の順位（同数は同じ順位） */
const byCount = types.slice().sort((a, b) => b.count - a.count);
byCount.forEach((t, i) => { t.rank = i && byCount[i - 1].count === t.count ? byCount[i - 1].rank : i + 1; });
const overall = { decades: DECADES.map((d) => ({ label: d, share: +(decAll[d] / datedAll * 100).toFixed(1) })) };
types.sort((a, b) => a.code.localeCompare(b.code));

writeFileSync(here + '/../data/anime-types.json',
  JSON.stringify({ total: works.length, overall, types }, null, 1) + '\n');
console.log('64 タイプ、作品 ' + works.length + ' 件から書き出しました');
