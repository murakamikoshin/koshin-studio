# 静的サイトのコメント欄を、公式の情報で比べる：giscus・utterances・Disqus・Remark42 ほか

> 静的サイトのコメント欄を公式の情報で比較。調べた7つのうち4つは終了か更新停止の疑い。無料のDisqusは広告で払う。確認できなかったことも書いた。

- URL: https://koshinstudio.com/notes/comment-services/
- 公開: 2026-10-08
- 書いた人: Koshin（https://koshinstudio.com/about/）
- サイト: Koshin Studio

  English version (https://koshinstudio.com/en/notes/comment-services/)

比べたもの ／ 2026年10月

  このサイトのコメント欄は、giscus です。「コメントを開く」を押すまで、外部のサイトに接続しない形にしてあります。そのほかの選択肢は、どうなっているのか。公式の説明と、公式のリポジトリだけを読んで、並べました。実際に使って比べたのは、giscus だけです。

  2026 年 10 月 8 日に確認した内容です。サービスの状況は変わります。使う前に、出典で確かめてください。

## 早見表：知りたいことから探す

  先に、答えだけを並べます。くわしい情報と出典は、あとの節にあります。

    知りたいこと | 公式から言えること

    広告や追跡を、入れたくない | giscus・utterances・Cusdis・Remark42 は、公式に追跡・広告が無いと書いている。Disqus の無料版は、広告で運営されている

    サーバーを、自分で持ちたくない | giscus（GitHub Discussions）と utterances（GitHub Issues）は、GitHub に保存される。どちらも、書くには GitHub のアカウントが要る

    ログインなしで、書いてほしい | Cusdis はログイン不要だが、終了している。Remark42 は、設定で匿名の投稿ができる（自前のサーバーが要る）

    続いているものだけに、絞りたい | 最近の更新を確認できたのは、giscus（2026-05-26）と Remark42（2026-09-14）。utterances・Staticman・Commento は更新停止の疑い、Cusdis は終了

    日本語の画面がほしい | giscus と Remark42 に、日本語の翻訳ファイルがある。ほかは、確認できなかった

  表の中の内容は、2026 年 10 月 8 日に公式ページとリポジトリで確認したものです。「更新停止の疑い」は、公式な終了の宣言ではありません。

## どこに保存されて、誰が書けるか

    サービス | 保存先 | 投稿に必要なもの | お金

    giscus | GitHub Discussions | GitHub のアカウント | 無料（MIT）

    utterances | GitHub Issues | GitHub のアカウント | 無料（MIT）

    Disqus | Disqus 側のサーバー（保存先の明記は確認できなかった） | 確認できなかった | 無料版は広告つき。有料の Plus は月 $12〜$35（月間 PV の帯による。月 10 万 PV 以下 $12、35 万以下 $20、90 万以下 $35。公式ヘルプ 2025-04-30 版）

    Remark42 | 自分で用意するサーバー（組み込みのデータ保存） | 各種ログイン（Google・GitHub など）、メール、設定で匿名も可 | 無料（MIT）。サーバーの費用は自分持ち

    Cusdis | 自分で用意するサーバー（PostgreSQL など） | ログイン不要 | OSS（GPL-3.0）

    Staticman | GitHub・GitLab のリポジトリにファイルとして保存 | 確認できなかった | OSS（MIT）。自分で運用

    Commento | 自分で用意するサーバー（PostgreSQL） | ログインや SSO に対応。匿名は確認できなかった | 自前でホストする版は無料のソフトウェア。クラウド版は、無料では提供されないと README にある

## 広告・追跡の公式の記述

- giscus・utterances：どちらも「追跡も広告も無い」と公式に書いています。ただし、giscus のコメントを開けば、GitHub に接続するので、GitHub 側の扱いは別です。

- Disqus：無料版は広告で運営されています。公式のヘルプに、Cookie で広告主のサイトの訪問を記録すること、Cookie ID などを広告のパートナーや関連会社と共有すること、「sold or shared（売る、または共有する）」という記述があります。導入すると、同意の管理や、広告まわりの表記が、いちばん重くなると読めます（公式ポリシー上の扱いまでは、調べていません）。

- Cusdis：「Cookie をまったく使わない」と README にあります。

- Remark42・Commento：「ユーザーを追跡しない」「広告は無い」といった記述が、公式にあります。

## 続いているか：更新の状況

  コメント欄は、一度入れると長く使います。止まっていないかは、大事な点です。

    サービス | 公式のリポジトリ・ページで確認したこと | 判断

    giscus | 正式なリリース番号は無く、「rolling-release」と明記。最新の更新履歴は 2026-05-26。「GitHub 側の変更で、機能が壊れることがある」と警告あり | 活発

    Remark42 | 最新は v1.17.1（2026-09-14） | 活発

    utterances | 最後のコミットは 2022-02-12。リリースなし。アーカイブはされていない | 更新停止の疑い（終了の宣言は無い）

    Staticman | 最後のコミットは 2020-07-06。リリースは 2016 年の v1.0.0 のみ | 更新停止の疑い（終了の公式な宣言は確認できなかった）

    Commento | 最後のタグは v1.8.0（2020-04）、最後のコミットは 2021-02-28。クラウド版のサイトと説明のページが、すべて 404 | 停止の疑い（公式な終了の告知は確認できなかった）

    Cusdis | リポジトリは 2026-07-17 にアーカイブ。README に「deprecated（非推奨）」 | 終了と見てよい

    Disqus | サービスは稼働中（料金のヘルプの日付は 2025-04-30） | 稼働中

## 日本語・スパム対策・重さ

- 日本語の画面：giscus と Remark42 には、日本語の翻訳ファイルがあります。ほかは、確認できませんでした。

- スパム対策：giscus は「GitHub 上でモデレートできる」とだけ書いていて、スパム対策の記述はありません。Disqus は基本の無料版にもスパムフィルターがあります。Cusdis は、管理者が承認してから表示します。

- 重さ：数字を出していたのは、Cusdis（約 5kb の gzip）だけでした。giscus は、コメントの読み込みを遅らせるオプションがあります。utterances は「軽い」と書いていますが、数字は無し。

## このサイトが giscus で気をつけたこと

  giscus の公式は、「追跡も広告も無い」と書いています。それでも、このサイトでは、「コメントを開く」を押すまで、giscus と GitHub に接続しないようにしました。読むだけの人の通信を増やさないためと、読み込みを軽くするためです。接続する条件は、プライバシーのページ (https://koshinstudio.com/privacy/)に書いています。

## 分かったこと

> 機能の表より、「いま、続いているか」。

- 止まったサービスが、意外に多い。調べた 7 つのうち、4 つ（Cusdis・Staticman・Commento・utterances）は、終了か、更新停止の疑いがありました。

- 無料のサービスは、広告や追跡で払うことがある。Disqus の無料版が、そうです。

- 書くのに GitHub のアカウントが要る方式（giscus・utterances）は、読者を、開発に近い人に絞ります。記事の読者によっては、そこが合わないこともあります。

## 確認できなかったこと

- Disqus：公式の料金ページ（本文が JavaScript で描かれ、読めなかった。価格は、ヘルプ記事のもの）、投稿者のアカウントの条件、日本語の画面、保存先の明記、読み込みの重さ

- utterances：日本語の画面、スパム対策

- Cusdis：クラウド版の料金、対応する言語の一覧

- Staticman：投稿者の条件、Akismet などのスパム対策、広告・追跡の記述、終了の公式な宣言

- Commento：クラウド版の現状と料金、日本語の画面、終了の公式な告知

- AdSense の公式ポリシーでの、コメント欄の扱い（調べていません）

## 出典（すべて 2026 年 10 月 8 日に確認）

- giscus：リポジトリ (https://github.com/giscus/giscus)

- giscus：公式の設定ページ (https://giscus.app/ja)

- utterances：リポジトリ (https://github.com/utterance/utterances)

- Disqus：料金とプラン（ヘルプ） (https://help.disqus.com/en/articles/1717110-comments-pricing-and-plans)

- Disqus：プライバシー FAQ (https://help.disqus.com/en/articles/1717103-disqus-privacy-faq)

- Remark42：リポジトリ (https://github.com/umputun/remark42)

- Cusdis：リポジトリ (https://github.com/djyde/cusdis)

- Staticman：リポジトリ (https://github.com/eduardoboucas/staticman)

- Commento：リポジトリ（GitLab） (https://gitlab.com/commento/commento)

  公式ページは、要約を通して読んだ箇所があります。Disqus の価格は、公式ヘルプの記事（2025-04-30 版）の原文で、2026-10-08 に確かめました。Disqus 自身の料金ページは、本文が JavaScript で描かれていて読めなかったので、現行の価格は、そちらで確かめてください。
