# Claude API と Gemini API を、公式の数字で比べる：小さいモデルの値段・Web検索・上限・廃止予定

> Claude API と Gemini API を公式の数字で比較。値段は時期で逆転し、安全装置と廃止の知らせ方は表の外にある。確認できなかったことも書いた。

- URL: https://koshinstudio.com/notes/claude-vs-gemini-api/
- 公開: 2026-10-08
- 書いた人: Koshin（https://koshinstudio.com/about/）
- サイト: Koshin Studio

  English version (https://koshinstudio.com/en/notes/claude-vs-gemini-api/)

比べたもの ／ 2026年10月

  トレカダッシュは、Claude API から Gemini API へ移行しました（経緯は移行の記事 (https://koshinstudio.com/notes/gemini-migration/)）。あのとき書かなかった公式の数字を、ここで並べます。公式のページに書いてあることだけを使います。精度や速さの比較は、公式の数字が無いので、していません。

  数字はすべて、2026 年 10 月 8 日に公式ページで見たものです。料金や上限は変わります。使う前に、各項目の出典で、もう一度確かめてください。公式ページに書かれていなかったことは「確認できなかった」と書き、「無い」とは書きません。

## 早見表：知りたいことから探す

  先に、答えだけを並べます。くわしい数字と出典は、あとの節にあります。

    知りたいこと | 公式から言えること

    値段がいちばん安いのは？ | いまの公式の表では、Claude Haiku 5.5（入力 $0.10・出力 $0.50）と Gemini 2.5 Flash-Lite（$0.10・$0.40）が近い価格帯。Gemini 3.1 Flash-Lite は $0.25・$1.50

    検索の回数を、設定で止めたい | Claude は max_uses がある。Gemini は、公式ページに回数を決める設定の記述が見当たらなかった

    検索を、無料で使いたい | Gemini の有料枠は、月 5,000 リクエストまで無料。ただし、無料枠（Free tier）では、3.1 Flash-Lite の検索は使えない。Claude は 1,000 検索ごとに $10

    使いすぎで、止まる上限がほしい | どちらも月の支出の上限があり、届くと翌月 1 日まで止まる（Claude は Start $500 から、Gemini は Tier 1 $250 から）

    廃止の知らせの約束がほしい | Claude は「退役の少なくとも 60 日前」と明記。Gemini は日数の約束を確認できず、表の日付は「最短の廃止日」

    日本語の、公式の数字がほしい | Claude の多言語のページにある（Haiku 4.5 で英語比 93.5%）。Gemini は、確認できなかった

  表の中の数字は、2026 年 10 月 8 日に公式ページで確認したものです。どれを選ぶべきか、という結論ではなく、「公式に書いてあること」の整理です。

## 小さいモデルの値段

  100 万トークンあたり、米ドルです。移行前に使っていたのは Claude Haiku 4.5 でした。

    モデル | 入力 | 出力

    Claude Haiku 4.5 | $1 | $5

    Claude Haiku 5.5 | $0.10（プロンプト 10 万トークン以下）／ $0.50（超えた分） | $0.50（10 万以下）／ $2.50（超えた分）

    Gemini 3.1 Flash-Lite（移行先） | $0.25（文字・画像・動画）／ $0.50（音声） | $1.50

    Gemini 3.5 Flash-Lite | $0.30 | $2.50

    Gemini 2.5 Flash-Lite | $0.10 | $0.40

- いまの公式の価格表では、Haiku 5.5 のほうが、Gemini 3.1 Flash-Lite より安くなっています。移行したときの比較相手は Haiku 4.5 で、そのときに Haiku 5.5 が使えたかどうかは、確かめていません。

- Claude には、バッチ（50% 割引）と、キャッシュ読み取りの安い単価があります。Gemini のバッチの割引率は、確認できませんでした。

- 公式に、「Claude 4.7 以降は、新しい分割方式で、同じ文章でもトークンが約 30% 増える」という記載があります。Haiku 5.5 に当てはまるかは、確認できませんでした。

## Web 検索のしくみと値段

     | Claude | Gemini

    料金 | $10 / 1,000 検索（加えて、結果ぶんの通常のトークン代） | 有料枠：月 5,000 リクエストまで無料、超えると $14 / 1,000 リクエスト。無料枠（Free tier）では、3.1 Flash-Lite の検索は使えない

    数え方 | 検索 1 回ごと。エラーのときは課金されない | Gemini 3 系は、モデルが実行した検索クエリごと（複数のクエリなら複数回の課金）

    回数の上限を決める設定 | あり（max_uses）。超えると、検索の結果が max_uses_exceeded のエラーになる | 検索の公式ページに、回数を決める設定の記述が見当たらない（「無い」と断定はできない）

    ドメインの指定 | 許可・拒否のドメインを指定できる | 確認できなかった

  移行の記事に書いた「Web 検索に回数の上限が無い問題」は、公式ページの記述の範囲でも、同じ読み取りになります。Claude の max_uses に当たるものが、Gemini の検索のページには書かれていませんでした。ただし、見つけられなかっただけの可能性は残ります。

## 上限と、止まり方

  ここが、移行の理由に近いところです。

     | Claude | Gemini

    月の支出の上限 | Start $500 ／ Build $1,000 ／ Scale $200,000 | Tier 1 $250 ／ Tier 2 $2,000 ／ Tier 3 $20,000 から

    上限に届くと | HTTP 429（enforced_spend_limit_reached）。翌月 1 日 0 時（UTC）まで止まる | 請求アカウントの全プロジェクトが、翌月 1 日まで止まる

    自分で下げる上限 | 設定できる（届くと HTTP 400） | AI Studio でプロジェクトごとに設定できる（実験的な機能で、請求の反映が約 10 分遅れるので、超えることがある）

    無料枠 | 新規に少額の無料クレジット。続く無料の枠は見当たらなかった | あり。3.1 Flash-Lite のトークンは無料。ただし、キャッシュと検索のグラウンディングは、無料枠では使えない

    小さいモデルの毎分の上限 | Start：Haiku 4.5 / 5.5 とも 1,000 リクエスト/分、入力 200 万・出力 40 万トークン/分 | 具体的な数字は、文書に無い（AI Studio で確認する形）

  移行の記事は、理由を「Anthropic の利用上限に達して、予定外の課金が出た」と書いています。ただ、Claude の公式は「上限に届いたら止まる」と書いていて、予定外の課金が出るしくみは、公式からは説明できませんでした。記事の経緯は、手元の記録によるもので、公式の文書で裏づけられたものではありません。

## 廃止の知らせ方

     | Claude | Gemini

    通知の約束 | 公開済みのモデルは、退役の少なくとも 60 日前に通知する（メールとドキュメント） | 「正確な廃止日は事前に通知する」とあるが、日数の約束は確認できなかった。表の日付は「最短の廃止日」

    書き方 | 「Not sooner than ○○」（○○より早くは退役しない） | 公開日・廃止日・推奨の移行先を表にしている

    例 | Haiku 3.5：告知（2025-12-19）から退役（2026-02-19）まで約 2 か月。Haiku 4.5：2026-10-15 より早くは退役しない | 3.1 Flash-Lite：公開 2026-05-07、廃止 2027-05-07（公開から 12 か月）。2.0 Flash：廃止 2026-06-01

  選んだ gemini-3.1-flash-lite の廃止日は、公式の表でも 2027 年 5 月 7 日でした。移行の記事とは、一致しています。一方で、移行の記事の「2.5 Flash-Lite は 10 月 16 日に廃止予定」は、いまの公式の表（「廃止日の告知なし」）と食い違っています。記事には、訂正を書き足しました。

## 構造化出力・ツール呼び出し・日本語

- JSON の形を指定した出力：どちらも対応しています。Claude は「スキーマに沿うことを保証する」と書いています。Gemini は「一部の JSON スキーマの機能のみ対応」で、「値の意味は、検証が必要」とあります。

- ツール呼び出し：どちらも対応しています。構造化出力と、検索などのツールを同時に使うのは、Gemini では 3 系だけで、「プレビュー機能」と書かれています。

- 日本語：Claude の多言語のページには、英語を 100% としたときの日本語の相対スコアがあります（Haiku 4.5 は 93.5%）。Gemini 3.1 Flash-Lite のページには、対応言語の公式な記述が、見つかりませんでした。「Gemini の日本語が弱い」という意味ではなく、公式の数字で比べられなかったということです。

## 分かったこと

> 値段の表だけでは、選べない。

- 値段は、時期で逆転する。移行の時点では安かった側が、いまは高い、ということが起きます。

- 安全装置の有無は、表の外にある。検索の回数の上限、支出の上限、止まり方（止まるのか、課金が続くのか）は、単価の表には出てきません。

- 廃止の知らせ方は、約束の有無が違う。日数の約束がある側と、最短の日付だけを出す側とでは、乗り換えの計画の立て方が変わります。

## 確認できなかったこと

- Gemini の無料枠・各ティアの、具体的な毎分・毎日の上限の数字（文書に数字が無い）

- Gemini のバッチの割引率

- Gemini の検索の、回数を決める設定の有無（ページに記述が見当たらないだけで、「無い」とは言えない）

- Gemini の廃止の通知が、最短で何日前なのか

- Gemini の日本語の公式な記述と、数字による比較

- Claude の Haiku 4.5 / 5.5 が、Web 検索ツールに対応しているかの明記（公式は、対応モデルを API で確かめるよう案内している）

- 精度・速さの比較（公式の一次情報では取れないので、していません）

## 出典（すべて 2026 年 10 月 8 日に確認）

- Claude：料金 (https://platform.claude.com/docs/en/about-claude/pricing)

- Claude：レート制限と支出の上限 (https://platform.claude.com/docs/en/api/rate-limits)

- Claude：Web 検索ツール (https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool)

- Claude：モデルの廃止 (https://platform.claude.com/docs/en/about-claude/model-deprecations)

- Claude：構造化出力 (https://platform.claude.com/docs/en/build-with-claude/structured-outputs)

- Claude：多言語対応 (https://platform.claude.com/docs/en/build-with-claude/multilingual-support)

- Gemini：料金 (https://ai.google.dev/gemini-api/docs/pricing)

- Gemini：レート制限 (https://ai.google.dev/gemini-api/docs/rate-limits)

- Gemini：請求 (https://ai.google.dev/gemini-api/docs/billing)

- Gemini：Google 検索によるグラウンディング (https://ai.google.dev/gemini-api/docs/google-search)

- Gemini：モデルの廃止 (https://ai.google.dev/gemini-api/docs/deprecations)

- Gemini：構造化出力 (https://ai.google.dev/gemini-api/docs/structured-output)

- Gemini：関数呼び出し (https://ai.google.dev/gemini-api/docs/function-calling)

- Gemini：3.1 Flash-Lite (https://ai.google.dev/gemini-api/docs/models/gemini-3.1-flash-lite)

  公式ページは、要約を通して読んだ箇所があります（数字は、原文と一字ずつ照らし合わせたものではありません）。決める前には、必ず出典の原文で確かめてください。
