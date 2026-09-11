/* 「10秒ピッタリで止めろ！」の画面写真を撮る。

   すし積むの shots.mjs は、あちらの自動プレイ（tools/sim）を借りているので
   そのままでは使えない。こちらは押すだけなので、別にしてある。

       node tools/shots-stopwatch10.mjs

   撮ったままの絵は assets/shots/raw に置く（配らない）。
   配る形（jpg と webp）にするのは tools/images.py の仕事。

   撮り直すと出る数字が変わる。works/stopwatch10/index.html の alt に
   その数字を書いてあるので、撮り直したら alt も直すこと。

   ゲーム本体はこのリポジトリには無い。隣に置くか、場所を教える:
       GAME_DIR_STOPWATCH10=~/Desktop/koshin/stopwatch10 node tools/shots-stopwatch10.mjs
*/
import { chromium } from 'playwright-core';
import { mkdirSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const SITE = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const OUT = SITE + '/assets/shots/raw';
const CHROME = process.env.CHROME || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

const HOME = process.env.HOME || '';
const tidy = (d) => String(d).trim().replace(/^~(?=$|\/)/, HOME).replace(/\/+$/, '');
const GAME = [process.env.GAME_DIR_STOPWATCH10, process.argv[2],
  SITE + '/../stopwatch10', HOME + '/Desktop/koshin/stopwatch10', HOME + '/stopwatch10']
  .filter(Boolean).map(tidy).find((d) => existsSync(d + '/index.html'));
if (!GAME) {
  console.error('ゲーム本体が見つかりません。隣に置くか、場所を教えてください:');
  console.error('  GAME_DIR_STOPWATCH10=~/Desktop/koshin/stopwatch10 node tools/shots-stopwatch10.mjs');
  process.exit(1);
}
mkdirSync(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const url = pathToFileURL(GAME + '/index.html').href;
const b = await chromium.launch({ executablePath: CHROME });

/* 一枚ごとに開き直す。同じ画面を続けて使うと、前の回の記録が残ってしまう */
async function shot(name, play) {
  const p = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  await p.goto(url);
  await p.waitForTimeout(300);
  await play(p);
  await p.screenshot({ path: `${OUT}/sw10-${name}.png` });
  await p.close();
  console.log(`  shots/raw/sw10-${name}.png`);
}

await shot('ready', async () => {});
await shot('run', async (p) => { await p.click('#key'); await sleep(700); });

/* 3回そろった画面。それらしい記録が出るように、10秒の近くで止める */
await shot('done', async (p) => {
  for (const hold of [10040, 9930, 10105]) {
    await p.click('#key');
    await sleep(hold);
    await p.click('#key');
    await sleep(1500);
    if (hold !== 10105) await p.click('#key');   // つぎへ
  }
  console.log('  1回あたり ' + await p.$eval('#avg', (el) => el.textContent));
});

await b.close();
console.log('撮りました。配る形にするのは python3 tools/images.py');
