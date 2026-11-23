/* 遊ぶ画面（/play/<作品>/）に足す「遊び方・このゲームについて」。

   なぜ要るか：
   遊ぶ画面は、ゲームの部品の文字（スコア、ボタンの名前）しか無く、文章がほぼ無かった
   （10秒ピッタリで 130 字ほど）。検索にも広告の審査にも「中身の薄いページ」に見える。
   noindex にはしない方針なので、文章のほうを足す。

   どう足すか：
   ・flow  … ページが縦に流れる作品（10秒ピッタリ）。いちばん下に、そのまま節として足す
   ・sheet … 画面いっぱいに固定の作品。小さなボタンを 1 つ置き、押すと全画面の説明が開く。
             ボタンは、遊びはじめたら（ゲームのどこかを押したら）消える。邪魔をしないため
   文章は、紹介ページ（/works/<作品>/）に書いてある事実だけを、短くまとめ直したもの。
   遊び方や数字を変えたら、紹介ページと、ここの両方を直す。

   作品の側（別リポジトリ）は触らない。中継（index.js）が、入口の HTML にだけ差し込む。 */

const CSS = `
#ks-about,#ks-about *{box-sizing:border-box}
#ks-about{font-family:-apple-system,BlinkMacSystemFont,"Hiragino Sans","Noto Sans JP","Yu Gothic",sans-serif;font-size:15px;line-height:1.8;color:#1b2a4a;text-align:left;letter-spacing:normal;font-weight:400;-webkit-text-size-adjust:100%}
#ks-about .ks-in{max-width:680px;margin:0 auto;padding:28px 20px 40px}
#ks-about h2{font-size:20px;line-height:1.4;margin:0 0 12px;font-weight:700;color:#14213d}
#ks-about h3{font-size:16px;line-height:1.5;margin:26px 0 6px;font-weight:700;color:#14213d}
#ks-about p{margin:0 0 10px}
#ks-about ul,#ks-about ol{margin:0 0 10px;padding-left:1.4em}
#ks-about li{margin:0 0 4px}
#ks-about a{color:#1d4ed8;text-decoration:underline}
#ks-about .ks-links{list-style:none;padding:0;margin:8px 0 0}
#ks-about .ks-links li{margin:0;border-top:1px solid #dbe1ec}
#ks-about .ks-links a{display:block;padding:12px 2px;text-decoration:none;font-weight:600}
#ks-about.ks-flow{background:#fff;border-top:1px solid #dbe1ec;margin-top:32px}
#ks-about.ks-sheet{position:fixed;inset:0;z-index:2147483647;background:#fff;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;touch-action:pan-y;user-select:text;-webkit-user-select:text}
#ks-about.ks-sheet[hidden]{display:none}
#ks-about .ks-close{position:sticky;top:0;display:block;width:100%;margin:0;padding:14px 20px;border:0;border-bottom:1px solid #dbe1ec;background:#14213d;color:#fff;font:inherit;font-weight:700;text-align:center;cursor:pointer}
#ks-about-open{position:fixed;z-index:2147483646;margin:0;padding:9px 16px;border:1px solid rgba(255,255,255,.55);border-radius:999px;background:rgba(20,33,61,.92);color:#fff;font:600 13px/1.2 -apple-system,BlinkMacSystemFont,"Hiragino Sans","Noto Sans JP",sans-serif;letter-spacing:.02em;cursor:pointer;box-shadow:0 2px 10px rgba(0,0,0,.25);white-space:nowrap;-webkit-tap-highlight-color:transparent}
#ks-about-open[hidden]{display:none}
`;

/* 開け閉めと、遊びはじめたらボタンを消す。失敗しても、ゲームには触らない */
const JS = `(function(){try{
var b=document.getElementById('ks-about-open'),s=document.getElementById('ks-about');if(!b||!s)return;
var c=s.querySelector('.ks-close');
function open(){s.hidden=false;b.setAttribute('aria-expanded','true');s.scrollTop=0;if(c)c.focus();}
function close(){s.hidden=true;b.setAttribute('aria-expanded','false');}
b.addEventListener('click',function(e){e.stopPropagation();open();});
if(c)c.addEventListener('click',function(e){e.stopPropagation();close();});
['pointerdown','mousedown','touchstart','keydown','keyup','wheel','click'].forEach(function(t){
s.addEventListener(t,function(e){if(t==='keydown'&&e.key==='Escape')close();e.stopPropagation();});
b.addEventListener(t,function(e){e.stopPropagation();});});
function gone(e){if(!s.hidden)return;b.hidden=true;window.removeEventListener('pointerdown',gone,true);window.removeEventListener('keydown',gone,true);}
window.addEventListener('pointerdown',function(e){if(e.target===b||s.contains(e.target))return;gone(e);},true);
window.addEventListener('keydown',function(e){if(e.target===b||s.contains(e.target)||e.key==='Tab')return;gone(e);},true);
}catch(_){}})();`;

const links = (slug, extra = []) => `
<h3>もっと読む</h3>
<ul class="ks-links">
<li><a href="/works/${slug}/">この作品の紹介ページ（仕組み・預かる情報）</a></li>
${extra.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join('\n')}
<li><a href="/works/">Koshin Studio のほかのゲーム</a></li>
<li><a href="/about/">作った人・お問い合わせ</a></li>
</ul>`;

/* 作品ごとの文章と、ボタンの置き場所（pos は CSS。題名画面で何にも重ならない所を、実機の幅で確かめて決めた） */
export const ABOUT = {
  sushitsumu: {
    mode: 'sheet',
    pos: 'left:50%;transform:translateX(-50%);bottom:max(18px,env(safe-area-inset-bottom))',
    html: `
<h2>すし積むの遊び方</h2>
<p>「すし積む」は、桶の上から寿司のネタを落として、同じネタ同士をくっつけて育てる落ち物パズルです。ブラウザだけで、登録なし・無料で遊べます。</p>
<h3>ルール</h3>
<ol>
<li>桶の上から、ネタを1つずつ落とします。最初はシャリです。</li>
<li>同じネタ同士が触れると合体して、ひとつ上のネタになります（シャリ→玉子→エビ→サーモン…と、全部で11段）。</li>
<li>いちばん上まで育てると、金のすし桶になります。</li>
<li>ネタが桶からあふれたら、おしまいです。</li>
</ol>
<h3>操作</h3>
<ul>
<li>スマートフォン：指でなぞって落とす位置を決め、離すと落ちます。</li>
<li>パソコン：左右キーとスペースでも遊べます。</li>
</ul>
<h3>点を伸ばすコツ</h3>
<ul>
<li>大きいネタほど場所を取ります。後先を考えずに積むと、すぐ行き詰まります。</li>
<li>合体でできたネタが、間を置かずにまた合体すると「連鎖」。5つ続くと「大連鎖」で、点が大きく伸びます。</li>
<li>20回に1回くらい来る「ガリ」は、触れたネタを1つ消します。積み間違えたときの逃げ道に使えます。</li>
</ul>
<h3>ほかに入っているもの</h3>
<ul>
<li><strong>お品書き</strong>：大将の注文（「マグロを二貫」など）どおりに、時間内に作るとボーナスが入る遊び方。番付はふつうの遊び方と別枠です。</li>
<li><strong>番付</strong>：その日の上位と、通算の上位。名前を入れて送ると載ります。</li>
<li><strong>寿司図鑑</strong>：これまでに作れたネタが、端末ごとに記録されます（ガリを含めて全12種）。</li>
<li>日本語・英語など、14言語で遊べます。</li>
</ul>` + links('sushitsumu', [
      ['/works/sushitsumu/guide', '遊び方をくわしく（すし積む 攻略ガイド）'],
      ['/notes/anago/', '開発の記録：穴子がデカすぎた話（300戦を自動で遊ばせて調整）'],
    ]),
  },

  stopwatch10: {
    mode: 'flow',
    html: `
<h2>10秒ピッタリで止めろ！の遊び方</h2>
<p>スタートを押して、頭の中で10秒を数え、ここだと思ったところで止める。体内時計だけで10秒を当てるゲームです。ブラウザだけで、登録なし・無料で遊べます。</p>
<h3>ルール</h3>
<ol>
<li>「スタート」を押すと、計測が始まります。</li>
<li>計測中は、数字も目盛りも音も出ません。画面は何も動きません。</li>
<li>10秒たったと思ったところで、もう一度押して止めます。</li>
<li>これを3回。目標の10秒との誤差を、「1回あたり」の平均と「ベスト1回」で出します。</li>
</ol>
<h3>3つのモード</h3>
<ul>
<li><strong>10秒・ヒントなし</strong>：基本の遊び方。手がかりは何もありません。3回勝負です。</li>
<li><strong>10秒・ヒントあり</strong>：最初の3秒だけ時計が見えます。そこで自分の刻みを合わせて、残りの7秒は自力で数えます。</li>
<li><strong>100秒・一発勝負</strong>：1回きりで100秒を数えます。途中でタブを切り替えたり、画面が消えたりすると、その勝負は無効です。</li>
</ul>
<h3>記録とランキング</h3>
<ul>
<li>誤差は、1,000分の1秒（小数3桁）まで出します。3桁で切っているのは、端末によって時計の細かさが違い、細かく出すほど端末の当たり外れで順位が決まってしまうからです。</li>
<li>自己ベストは、モードごとに、遊んだ端末の中に残ります。</li>
<li>ランキングは「今日」と「通算」があり、名前を入れて「のせる」を押すと載ります。</li>
</ul>
<h3>うまく止めるには</h3>
<p>計測中の画面には、点滅するものも、動くものも、わざと置いていません。1秒ごとに光るものが目に入ると、それに合わせて数えられてしまうからです。頼れるのは自分のリズムだけなので、「ヒントあり」で最初の3秒の速さを体に入れてから、「ヒントなし」に挑むのが近道です。</p>` + links('stopwatch10', [
      ['/notes/stopwatch-rank/', '開発の記録：ランキングを公平にする（小数3桁・同着の決め方）'],
    ]),
  },

  'kaeru-sekai': {
    mode: 'sheet',
    pos: 'left:50%;transform:translateX(-50%);top:calc(max(12px,env(safe-area-inset-top)) + 96px)',
    html: `
<h2>還る世界の遊び方</h2>
<p>「還る世界」は、色を失った灰色の世界に光の種をまいて緑を戻し、そこに人を住まわせて100年を見届ける、景色を眺めるゲームです。ブラウザだけで、登録なし・無料で遊べます。</p>
<h3>流れ</h3>
<ol>
<li>地面をタップすると、光の種が落ちて、そこから緑が広がります。種は10粒です。</li>
<li>どこにまくかで、緑の戻る速さが変わります。種が尽きても、緑の縁はゆっくり広がり続けます。</li>
<li>緑が戻ったら、住む人の数を選んで「100年見届ける」を押します。</li>
<li>人が少なければ、家と畑が増えて道がつながり、村の真ん中に教会や塔が建ちます。多すぎると、緑が削られて、景色はまた灰色に戻っていきます。</li>
</ol>
<p>何人までなら世界が持つのかは、遊んで確かめてください。</p>
<h3>歩く・撮る</h3>
<ul>
<li>「歩く」を押すと、世界の中を自分の目線で歩けます。スマートフォンは、画面の左側で歩き、右側で見回します。パソコンは、WASD キーで歩き、ドラッグで見回します。</li>
<li>家に近づくと、中に入れます。</li>
<li>シャッターを押すと、その場面を写真に残せます。「みんなのアルバム」に載せることもできます。</li>
</ul>
<h3>世界は番号で決まる</h3>
<p>世界は、1から99999までの番号から作られます。谷、草原、フィヨルド、砂漠、島、火山、群島、雪原。同じ番号なら、だれが開いても同じ世界になるので、番号つきのリンクを送れば、相手も同じ世界で遊べます。何も選ばなければ、その日の世界が出ます。ときどき、桜が咲きそろう世界や、空の色がおかしい世界など、めずらしい世界に当たります。</p>
<h3>重いとき</h3>
<p>景色は、画像を使わずに、その場で計算して描いています。端末の速さを見ながら、描く細かさを自動で下げるので、表示が重いときは、少し待つと軽くなります。</p>` + links('kaeru-sekai'),
  },

  dopagaki: {
    mode: 'sheet',
    pos: 'right:max(12px,env(safe-area-inset-right));top:max(10px,env(safe-area-inset-top))',
    html: `
<h2>ドパガキ脱出！！の遊び方</h2>
<p>「ドパガキ脱出！！」は、脱出ゲームなのに謎を解かないアクションパズルです。暗号もダイヤルも無視して、扉ごと壊して部屋を出ます。全200ステージ・1000コース。ブラウザだけで、登録なし・全ステージ無料で遊べます。</p>
<h3>基本の操作</h3>
<ul>
<li><strong>タップ</strong>：その場所へ走ります。物をタップすると、殴ります。</li>
<li><strong>スワイプ</strong>：近くの物を、その向きへ投げます。</li>
<li><strong>長押し</strong>：溜めて、離すと叫びます。溜めている間、声の届く範囲が、床に黄色い輪で出ます。</li>
</ul>
<p>STAGE 5 からは、ステージによって同じ操作が別の行動に変わります（スワイプが「突進」「蹴る」「引っぱる」、長押しが「吹く」、タップが「踏む」など）。今の操作は、いつも画面の下に出ています。</p>
<h3>壊し方の決まり</h3>
<ul>
<li>木は、殴れば壊れます。</li>
<li>ガラスは、叫べば割れます。</li>
<li>鉄は、殴っても投げても効きません。爆発（TNT）でしか開きません。</li>
</ul>
<p>この決まりは、200ステージを通して変わりません。</p>
<h3>見張りに気をつける</h3>
<ul>
<li>部屋には、居眠りしている見張りがいます。叫び声が届いたり、殴る音が積もったりすると、目を覚まして、捕まるとやり直しです。</li>
<li>物を当てれば、起こさずに気絶させられます。一列に並んでいれば、先頭に当てると後ろもまとめて倒れます。</li>
<li>ガラスの壁は、爆風は止めますが、声は通します。</li>
</ul>
<h3>コツ</h3>
<p>考えるのは謎の答えではなく、「どの順番で、どこから、何を壊すか」です。1回の操作で関門を2つ以上抜けると「2枚抜き」「3枚抜き」になります。クリア画面に出る「目標手数」は、自動で遊ぶプログラムが実際にかかった手数です。進み具合は、遊んでいる端末のブラウザに保存されます。</p>` + links('dopagaki'),
  },
};

/* 入口の HTML に差し込む文字列を作る。作品が表に無ければ null */
export function aboutHtml(slug) {
  const a = ABOUT[slug];
  if (!a) return null;
  if (a.mode === 'flow') {
    return `<style>${CSS}</style><section id="ks-about" class="ks-flow" lang="ja"><div class="ks-in">${a.html}</div></section>`;
  }
  return `<style>${CSS}#ks-about-open{${a.pos}}</style>` +
    `<button id="ks-about-open" type="button" aria-controls="ks-about" aria-expanded="false">遊び方・このゲームについて</button>` +
    `<aside id="ks-about" class="ks-sheet" lang="ja" aria-label="遊び方・このゲームについて" hidden>` +
    `<button class="ks-close" type="button">× 閉じて、ゲームに戻る</button><div class="ks-in">${a.html}</div></aside>` +
    `<script>${JS}</script>`;
}
