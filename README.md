# Koshin Studio — koshinstudio.com

Cloudflare Pages に置く静的サイト。枠組み（Next.js など）は使っていない。
動きに使う library（GSAP / ScrollTrigger / Lenis）は `vendor/` に置いて
自前で配る。外部 CDN には繋がない。

**作った物そのものは、ここには入っていない。** 作品はそれぞれ自分の
リポジトリから自分の Pages に出していて、このサイトが持つのは
「紹介するページ」と「そこへの行き先」だけ。実物は `worker/` が
`koshinstudio.com/play/…` に中継している（→「作り物の置き場所」）。

---

## いちばん短い説明

| | |
|---|---|
| このリポジトリ | koshinstudio.com そのもの（紹介・記事・一覧） |
| ゲームやアプリのリポジトリ | 実物。自分で自分の Pages に出す |
| `worker/` | `koshinstudio.com/play/すし積む/` を、すし積むの Pages に繋ぐ中継 |

だから **ゲームを直した時、このリポジトリは触らなくていい**。
逆に、紹介文や記事を直す時、ゲームのリポジトリは触らなくていい。

---

## 作り物の置き場所（URL の決め方）

`koshinstudio.com` の下は、こう分けてある。

| 道 | 何 | 中身の出どころ |
|---|---|---|
| `/works/` | 作った物ぜんぶの一覧と、それぞれの紹介 | このリポジトリ |
| `/works/<名前>/` | 作品ひとつの紹介ページ | このリポジトリ（手書き） |
| `/play/<名前>/` | ゲームの実物 | 別リポジトリ → `worker/` が中継 |
| `/app/<名前>/` | アプリの実物 | 別リポジトリ → `worker/` が中継 |
| `/notes/` | 制作の記録・記事 | このリポジトリ |
| `/stack/` | 使っている道具 | このリポジトリ |
| `/profile/` | 誰が作っているか | このリポジトリ |
| `/contact/` | ご依頼・お問い合わせ | このリポジトリ |
| `/privacy/` | あつかい（広告・記録） | このリポジトリ |

**紹介（`/works/…`）と実物（`/play/…`）は別物**、と覚えておけばいい。
`/works/sushitsumu/` は読むページ、`/play/sushitsumu/` は遊ぶページ。
一覧や紹介ページの「遊ぶ」ボタンが `/play/…` に送っている。

サブドメイン（`sushitsumu.koshinstudio.com`）にしていないのは、
ブラウザが覚えている物（ハイスコア・寿司図鑑・言語）が
ドメインごとに分かれてしまうから。同じ `koshinstudio.com` の下に
置いておけば、後から作る物と記録を共有できる。

---

## いつも通りの流れ

### A. 文章・一覧を直す（紹介文、並び、道具、SNS）

1. `data/*.json` を直す（手で書いても、管理画面でもいい）
2. `node build.mjs`
3. `node tools/check.mjs`（通ればよし）
4. `npx wrangler pages deploy . --project-name koshin-studio`

| したいこと | いじる場所 |
|---|---|
| 作品を足す・直す | `data/works.json` |
| 記録・記事を足す | `data/notes.json` |
| 分野を足す・名前を変える | `data/kinds.json` |
| 使っている道具 | `data/stack.json` |
| SNS を足す | `data/site.json` の `social` |
| 連絡先を出す | `data/site.json` の `contact` |
| 広告を出す | `data/site.json` の `ads` |
| 公開先の URL | `data/site.json` の `url` |

管理画面から直したいなら:

    node tools/admin.mjs      →  http://localhost:4321

保存すると JSON に書いて、そのまま組み直す。手元だけで動く。公開先には出ない。

### B. 記事（Notes）を書く

1. `notes/<名前>/index.html` を作る。既にある `notes/anago/index.html` を
   写して書き換えるのが早い。本文だけ書けばよく、`<head>` の中身
   （canonical・og・JSON-LD・パンくず）は build.mjs が入れ直す
2. `data/notes.json` に足す

       { "slug": "…", "title": "…", "date": "2026-09-08",
         "work": "すし積む", "url": "/notes/…/", "blurb": "一覧に出る一行" }

   `date` は `YYYY-MM-DD`。新しいものが上に来る
3. 上の A と同じ（build → check → deploy）

`feed.xml`（RSS）と `sitemap.xml` は build.mjs が作り直すので、触らない。

### C. ゲームを新しく作った（← ここがいちばん間違えやすい）

ゲーム側とサイト側で、やることが分かれている。

**ゲームのリポジトリで**

1. 配る形を組む（すし積むなら `node tools/dist.mjs` → `dist/`）
2. 自分の Pages に出す

       npx wrangler pages deploy dist --project-name <ゲーム名>

   → `https://<ゲーム名>.pages.dev` ができる
3. 配る形には `noindex, follow` を入れておく。検索に出すのは
   `koshinstudio.com/works/<ゲーム名>/` の紹介ページの方で、
   実物の方が先に拾われると具合が悪い

**このリポジトリで**

4. `worker/index.js` の `ROUTES` に一行足す

       const ROUTES = {
         play: {
           sushitsumu: 'https://sushitsumu.pages.dev',
           newgame:    'https://newgame.pages.dev',   // ← これ
         },
         app: {},
       };

5. 中継を出し直す

       cd worker && npx wrangler deploy && node test.mjs

   → `koshinstudio.com/play/newgame/` が繋がる
6. `data/works.json` に足す

       { "slug": "newgame", "title": "…", "kind": "game", "year": "2026",
         "status": "公開中", "url": "/works/newgame/",
         "play": "/play/newgame/",
         "cover": "/assets/newgame-square",   ← 拡張子は書かない
         "coverW": 720, "coverH": 720,
         "genre": ["…", "…"],                 ← 構造化データの分野。書かなければ出ない
         "blurb": "一覧に出る一行", "tags": ["…"], "featured": true }

   `genre` は検索側に渡す分野。**書かないと出ない**ので、他の作品の分野が
   紛れ込むことはない。構造化データの絵は `image`（拡張子つき）を書けば
   それ、無ければ表紙の `@2x.jpg` を使う。

7. `works/newgame/index.html` を作る（`works/sushitsumu/index.html` を写す）
8. 表紙の絵を置く（→「絵の置き方」）
9. A と同じ（build → check → deploy）

`play` を書いた作品には、`data-play` の付いたリンクが自動で
その行き先に書き換わる。ボタンの `href` を手で書く必要はない。

アプリなら `kind` を `app` にして、`ROUTES.app` の方に足す。
道は `/app/<名前>/` になる。

### D. ゲームを直した（中身だけ）

ゲームのリポジトリで組み直して、そのゲームの Pages に出すだけ。
**このリポジトリは触らなくていい。** 遊ぶ道（`/play/…`）は変わらない。

紹介文や数字（「300 戦を自動で検証」など）も直すなら、
`data/works.json` を直して A の流れ。

---

## 絵の置き方

- 撮ったままの絵は `assets/shots/raw/`。**配らない**（git にも入れない）
- 配る形（`.webp` / `.jpg`）は `tools/images.py` が作る。**これは git に入れる**
- 元の PNG（`assets/*.png`）も配らない。重いだけで、jpg と webp があれば足りる
- `data/*.json` の絵は**拡張子を付けずに**書く（`/assets/foo`）。
  `.webp` と `.jpg` は build.mjs が付ける
- 大きさ（`coverW` / `coverH`）は本物と合わせる。ずれると文章が飛ぶ

写したところで 404 になっていないかは、`tools/audit.mjs` が git の一覧と
突き合わせて見ている。

---

## 道具（tools/）

| | |
|---|---|
| `admin.mjs` | 手元の管理画面 |
| `audit.mjs` | サイト全体を機械で見て回る（下記） |
| `interact.mjs` | 押した後まで動くかを見る |
| `fresh-check.mjs` | 新しく clone した所で組んで、欠けが無いか |
| `check.mjs` | 上を順に全部 |
| `fonts.py` | 使っている字だけの書体を作る |
| `images.py` | 絵を配る形（WebP / JPEG）に落とす |
| `logotype.py` | ロゴの字（KOSHIN STUDIO）を起こす |
| `ogimages.mjs` | ページごとの共有カード（1200×630）を撮る |
| `shots.mjs` | ゲームの画面写真を撮る（自動で遊ばせて、いい所を残す） |
| `icons.mjs` | favicon.svg から貼り付け用の PNG と manifest を起こす |

文章を書き足したら `fonts.py`、絵を差し替えたら `images.py`、
ページを足したら `ogimages.mjs` を走らせ直す。

`shots.mjs` はゲーム本体を要る。隣に clone してあるか、`GAME_DIR` で
場所を教える。無ければ黙って飛ばす。

---

## 検査

    node tools/check.mjs             # 全部いっぺんに

一つずつなら

    node tools/audit.mjs             # 置かれた形を見る
    node tools/interact.mjs          # 押した後まで見る
    node tools/fresh-check.mjs       # 新しく clone した所で組んで、欠けが無いか
    cd worker && node test.mjs       # 中継の道が合っているか

`audit.mjs` は全ページ × 4 つの画面幅を回って数える。

- コンソールのエラー、読み込み失敗、リンク切れ
- 横のはみ出し、文字と背景の明暗差（WCAG）、見出しの並び、alt、押せる物の大きさ
- 画像に書いてある寸法と、本物の寸法が合っているか
- ページから指している絵が git に入っているか（手元では見えて、配ると 404）
- 組み直すたびに中身が増えていないか（差し込みの入れ替え漏れ）
- 下まで送っても現れない要素（現れ方の仕掛けの取りこぼし）
- **JS を切った状態**で本文が読めるか
- 動きを嫌う設定での見え方、鍵盤での辿りやすさ、重さ（LCP / CLS）

`/play/…` `/app/…` は中継の先なので、リンク切れの検査からは外してある。

`interact.mjs` は実際に押す。品書きの開閉、ロゴの弾ける演出、
Works の絞り込み、Tab での辿り着きやすさ。

---

## 出す

**サイト（このリポジトリ）**

    node build.mjs
    npx wrangler pages deploy . --project-name koshin-studio

`.assetsignore` に、配らないもの（`.git` / `tools` / `data` / `worker` など）を
並べてある。

**中継（worker/）**

    cd worker
    npx wrangler deploy

出すのは `ROUTES` を変えた時だけでいい。普段の更新では要らない。

**繋がっている先**

| | |
|---|---|
| Pages プロジェクト | `koshin-studio` |
| ドメイン | `koshinstudio.com`（Cloudflare Registrar） |
| `www` | Redirect Rule で apex に飛ばしてある |
| Worker | `koshin-studio-routes`（`/play/*` `/app/*`） |

---

## 中身

    index.html            トップ
    works/                作品（一覧は生成、中身は手書き）
    notes/                制作の記録
    stack/                使っている道具
    contact/              ご依頼
    profile/  privacy/    プロフィール・あつかい
    404.html
    data/                 一覧のもと（JSON）
    style.css  motion.js  見た目と動き
    vendor/               GSAP / ScrollTrigger / Lenis / 書体
    tools/                作る・測る道具
    worker/               /play/ /app/ の中継
    build.mjs             組み立て
    _headers              Pages のヘッダ設定
    .assetsignore         配らないもの

`build.mjs` がやっていること:

- `data/*.json` から Works / Notes / Stack / トップの一覧を書き出す
- 遊ぶ先（`data/works.json` の `play`）を、`data-play` の付いたリンクに入れ直す
- 全ページに canonical・og・JSON-LD を入れ、`sitemap.xml` `robots.txt` `feed.xml` を書く
- `style.css` `motion.js` と書体に、中身の印（`?v=…`）を付ける（古いものが残らないように）
