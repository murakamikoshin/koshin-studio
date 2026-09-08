/* サイトを、まとめて確かめる。

       node tools/check.mjs

   走らせるもの:
     1. build.mjs           組み直す
     2. tools/interact      押した後まで動くか
     3. tools/audit         全ページ × 4 幅を見て回る
     4. tools/fresh-check   新しく clone した所で組んで、欠けが無いか
     5. worker/test         /play/ の中継の判定

   ゲーム本体はこのリポジトリには無いので、ここでは見ない。
   ゲームの検査は sushitsumu 側の tools/check.mjs にある。
   playwright-core が要る（npm i playwright-core を tools/ に）。
*/
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const ROOT = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const JOBS = [
  ['組み立て', ROOT + '/build.mjs'],
  ['押した後', ROOT + '/tools/interact.mjs'],
  ['見て回る', ROOT + '/tools/audit.mjs'],
  ['写した先', ROOT + '/tools/fresh-check.mjs'],
  ['中継の判定', ROOT + '/worker/test.mjs'],
];

let failed = 0;
for (const [name, file] of JOBS) {
  if (!existsSync(file)) { console.log(`— ${name}（${file} が無いので飛ばす）`); continue; }
  process.stdout.write(`\n=== ${name} ===\n`);
  const r = spawnSync(process.execPath, [file], { stdio: 'inherit', cwd: ROOT });
  if (r.status !== 0) { console.error(`\n× ${name} で止まりました`); failed = 1; break; }
}
if (!failed) console.log('\n全部通りました。');
process.exit(failed);
