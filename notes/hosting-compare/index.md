# 静的サイトを置く場所を、公式の規約で比べる：Cloudflare Pages・Netlify・Vercel・GitHub Pages・Firebase Hosting

> 静的サイトの置き場を公式の規約で比較。広告を載せていいかが一番の分かれ目で、Vercel Hobby は非商用のみ。確認できなかったことも書いた。

- URL: https://koshinstudio.com/notes/hosting-compare/
- 公開: 2026-10-08
- 書いた人: Koshin（https://koshinstudio.com/about/）
- サイト: Koshin Studio

  English version (https://koshinstudio.com/en/notes/hosting-compare/)

比べたもの ／ 2026年10月

  このサイトと、トレカダッシュの周りの仕組みは、Cloudflare に置いています（配るときの落とし穴の記事 (https://koshinstudio.com/notes/deploy-gotchas/)と、無料枠の記事 (https://koshinstudio.com/notes/ranking-free-tier/)）。ほかの置き場は、どうなっているのか。公式の料金・上限・規約のページだけを読んで、並べました。ほかの置き場を、実際に使って比べたわけではありません。

  2026 年 10 月 8 日に確認した内容です。料金体系は、変わりやすいところです（Vercel と Netlify は、最近の変更を公式が案内しています）。決める前に、出典で確かめてください。

## 早見表：知りたいことから探す

  先に、答えだけを並べます。くわしい数字と出典は、あとの節にあります。

    知りたいこと | 公式から言えること

    広告（AdSense など）を載せたい | Vercel の Hobby は、広告の掲載を商用として、使えない。GitHub Pages は、オンラインビジネス用の使い方を不可とし、広告の明記は確認できなかった。Cloudflare・Netlify・Firebase は、調べた規約に制限が見つからなかった（許可の明記ではない）

    上限に届いても、止まりたくない | Netlify（月 300 クレジット）と Firebase（保存 10GB・転送 月 10GB）は、届くと止まる。GitHub Pages の帯域（月 100GB）は、ソフトな上限

    ファイルがたくさんある | Cloudflare は 1 サイト 20,000 ファイル・1 ファイル 25MiB。Vercel の Hobby は、元のファイル 15,000 個・合計 100MB

    _redirects / _headers を使いたい | Cloudflare と Netlify が対応。Vercel は vercel.json、Firebase は firebase.json。GitHub Pages は、確認できなかった

    日本からの速さの、公式の記述がほしい | Cloudflare（東京・大阪・福岡・那覇の拠点）と Vercel（東京・大阪の計算リージョン）にあった。遅延の数字は、どこにも無い

  表の中の内容は、2026 年 10 月 8 日に公式ページで確認したものです。「見つからなかった」は、「できる」という意味ではありません。

## 先に、いちばん大事なところ：広告を載せていいか

  無料のプランで、広告やアフィリエイトを載せていいのか。サイトで収益を考えるなら、ここが一番の分かれ目でした。

    サービス | 公式に書かれていたこと

    Vercel | Hobby は、非商用・個人利用のみ。商用の例として「Google AdSense などの広告の掲載」「アフィリエイトのリンクが主目的のサイト」が、はっきり書かれている。広告を載せるなら Pro 以上

    GitHub Pages | 「オンラインビジネスを動かす無料のホスティング」としての利用、EC、商用 SaaS は不可と明記。寄付のボタンは許容。広告についての明記は、確認できなかった

    Cloudflare | 調べた規約に、無料プランでの商用利用や広告の制限は見つからなかった（記述が無い、という確認で、許可の明記ではない）

    Netlify | 利用規約・契約に、商用や広告の制限は見つからなかった。ただし、無料の枠は、条件の変更・廃止・予告なしの停止がありうると明記されている

    Firebase Hosting | 取得した Firebase の規約ページに、商用・広告の制限は無かった（規約の本体までは読んでいない）

  「見つからなかった」は、「広告を載せていい」という意味ではありません。迷うときは、運営元に問い合わせるのが確実です。

## 無料の枠

    サービス | 公式に書かれていたこと

    Cloudflare（Pages / Workers の静的アセット） | 静的ファイルへのリクエストは「無料で無制限」。ビルドは月 500 回（Pages）。Worker を動かすリクエストは、1 日 10 万回（Workers Free）。帯域の上限は、確認できなかった

    Netlify（Free） | 月 300 クレジットのハードリミット。使い切ると、全プロジェクトが止まる。帯域は 1GB あたり 20 クレジット、本番の配備は 1 回 15 クレジット。プレビューは 0 クレジット

    Vercel（Hobby） | 転送 100GB、CDN のリクエスト 100 万回、関数の呼び出し 100 万回まで。超えると、約 30 日使えなくなるのが通常。配備は 1 日 100 回まで

    GitHub Pages | 帯域は月 100GB のソフトな上限。ビルドは 1 時間 10 回のソフトな上限

    Firebase Hosting（無料） | 保存 10GB、転送 月 10GB。届くと、翌月までサイトが無効になる（有料に切り替えれば、すぐ戻る）

## ファイルの数と大きさ

    サービス | 公式に書かれていたこと

    Cloudflare | 1 サイト 20,000 ファイル、1 ファイル 25MiB

    Vercel（Hobby） | コマンドからの配備で、元のファイル 15,000 個・合計 100MB。出力側のファイル数に上限はない（10 万を超えると遅くなる）。1 ファイルの最大は確認できなかった

    GitHub Pages | 公開するサイトは 1GB まで。1 ファイルの上限は確認できなかった

    Firebase Hosting | 1 ファイル最大 2GB。ファイル数の上限は確認できなかった

    Netlify | 配備ごとのファイル数・大きさの上限を述べた公式ページは、確認できなかった

## リダイレクトとヘッダーの設定

- Cloudflare：_redirects（静的 2,000 ＋ 動的 100）と _headers（100 ルール）。リダイレクトのほうが、ヘッダーより先に処理されます。Worker が作った応答には、どちらも効きません。

- Netlify：_redirects と _headers、または netlify.toml。proxy や関数の応答には、ヘッダーが付きません。

- Vercel：vercel.json。リダイレクト・書き換え・ヘッダーの合計で、1 回の配備につき 2,048 ルールまで。_redirects 形式の記述は、調べたページに無かった。

- Firebase：firebase.json。先に一致した規則が使われます。

- GitHub Pages：調べたページに、記述が無く、確認できなかった。

## プレビュー配備・日本からの速さ

- プレビュー：Cloudflare・Netlify・Vercel は、プルリクエストやブランチごとに自動で作られます。Firebase は「プレビューチャンネル」で、既定で 7 日、最長 30 日で消えます。GitHub Pages は確認できませんでした。

- 日本からの速さ：公式に日本の記述があったのは、Cloudflare（東京・大阪・福岡・那覇に拠点）と、Vercel（計算のリージョンに東京と大阪。関数の既定は米国東部）だけでした。遅延の数字は、どこにも書かれていませんでした。

## 分かったこと

> 「無料で置ける」と「無料で稼げる」は、別の話。

- 広告を載せる予定があるなら、最初に規約を読む。置いてから規約で止められると、移し替えになります。

- 止まり方が違う。上限に届いたとき、サイトが止まる所（Netlify、Firebase）と、ソフトな上限で済む所（GitHub Pages）があります。

- 設定のファイルが、サービスごとに違う。同じ _redirects でも、書ける数や、効く範囲は別です。移すときは、ここで手間が出ます。

## 確認できなかったこと

- Cloudflare：静的アセットの帯域の上限や課金の記述、独自ドメインの証明書の出し方、無料プランでの広告の公式な可否

- Netlify：配備のファイル数・大きさの上限、独自ドメインが無料で使えるかの明記、日本の速さの記述

- Vercel：Hobby の静的出力の、1 ファイルの最大

- GitHub Pages：広告の可否の明記、ヘッダーの設定、プレビュー、日本の速さ

- Firebase：ファイル数の上限、独自ドメインの費用、規約の本体（商用・広告）

- 速さの比較（公式に数字が無いので、していません）

## 出典（すべて 2026 年 10 月 8 日に確認）

- Cloudflare：Pages の制限 (https://developers.cloudflare.com/pages/platform/limits/)

- Cloudflare：静的アセットの課金と制限 (https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/)

- Cloudflare：Pages のリダイレクト (https://developers.cloudflare.com/pages/configuration/redirects/)

- Cloudflare：Pages のヘッダー (https://developers.cloudflare.com/pages/configuration/headers/)

- Cloudflare：ネットワーク (https://www.cloudflare.com/network/)

- Netlify：クレジットのしくみ (https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/)

- Netlify：利用規約 (https://www.netlify.com/legal/terms-of-use/)

- Vercel：Hobby プラン (https://vercel.com/docs/plans/hobby)

- Vercel：公正利用のガイドライン (https://vercel.com/docs/limits/fair-use-guidelines)

- Vercel：制限 (https://vercel.com/docs/limits)

- GitHub Pages：制限 (https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)

- Firebase Hosting：使用量と料金 (https://firebase.google.com/docs/hosting/usage-quotas-pricing)

  公式ページは、要約を通して読んだ箇所があります（数字は、原文と一字ずつ照らし合わせたものではありません）。特に Netlify のクレジットと Vercel の上限は、原文で確かめてください。
