# 他サイトに出すための要約（下書き）

使い方
- Zenn・Qiita・note には「要約 ＋ 元記事へのリンク」だけを出す。**本文をそのまま写さない**（検索で、元記事と同じ内容が並ぶと、どちらも弱くなるため）。
- 数字は元記事のもの（2026年10月8日に公式ページで確認）。出す前に、元記事の出典で見直すこと。特に Netlify のクレジット、Vercel の上限、Disqus 以外の価格は、要約ツールを通して読んだ数字。
- 末尾の「元記事」リンクは必ず付ける。
- X（Twitter）用の短い文は、各記事の最後にある。

---

## 1. Claude API と Gemini API を、公式の数字で比べる

元記事: https://koshinstudio.com/notes/claude-vs-gemini-api/

**Zenn / Qiita 用（題）**: Claude API から Gemini API に移行して、公式の数字を並べ直した（単価・Web検索・上限・廃止予定）

**本文（要約）**

iOS アプリの裏側で使っていた LLM を、Claude API から Gemini API に移行しました。そのとき書かなかった公式の数字を、2026年10月8日時点で、公式ページだけを見て並べました。精度や速さの比較は、公式に数字が無いので、していません。

分かったこと:

- **値段は、時期で逆転する。** 移行のときの比較相手は Claude Haiku 4.5（入力 $1・出力 $5 / 100万トークン）。いまの公式の表では、Haiku 5.5 が $0.10・$0.50 で、移行先の Gemini 3.1 Flash-Lite（$0.25・$1.50）より安くなっています。
- **Web検索に回数の上限を決める設定があるのは、Claude（`max_uses`）。** Gemini の検索のページには、回数を決める設定の記述が見当たりませんでした（「無い」と断定はできません）。
- **上限と止まり方は、表の外にある。** どちらも月の支出の上限があり、届くと翌月1日まで止まります。
- **廃止の知らせ方が違う。** Claude は「退役の少なくとも60日前」と明記。Gemini は日数の約束を確認できず、表の日付は「最短の廃止日」でした。

確認できなかったことも、記事に一覧にしてあります。

元記事（表と出典つき）: https://koshinstudio.com/notes/claude-vs-gemini-api/

**X 用**
> Claude API から Gemini API に移行して、公式の数字を並べ直しました。いまの公式の表だと、Haiku 5.5 のほうが移行先の Gemini 3.1 Flash-Lite より安い。Web検索の回数上限を決める設定があるのは Claude。確認できなかったことも書いています。 https://koshinstudio.com/notes/claude-vs-gemini-api/

---

## 2. 静的サイトを置く場所を、公式の規約で比べる

元記事: https://koshinstudio.com/notes/hosting-compare/

**Zenn / Qiita 用（題）**: 個人サイトに広告を載せたいとき、どこに置ける？ Cloudflare・Netlify・Vercel・GitHub Pages・Firebase を公式の規約で比べた

**本文（要約）**

静的サイトを置く場所を、公式の料金・上限・規約のページだけで比べました（2026年10月8日に確認）。ほかの置き場を、実際に使って比べたわけではありません。

いちばんの分かれ目は、**無料プランで広告を載せていいか**でした。

- **Vercel の Hobby は、非商用・個人利用のみ。** 商用の例として、Google AdSense などの広告の掲載が、はっきり書かれています。
- **GitHub Pages** は、オンラインビジネス用の使い方を不可としています。広告についての明記は、確認できませんでした。
- **Cloudflare・Netlify・Firebase** は、調べた規約に制限が見つかりませんでした（許可の明記ではありません）。

ほかに、上限で止まるか（Netlify と Firebase は止まる、GitHub Pages はソフトな上限）、ファイル数の上限、`_redirects` と `_headers` が使えるか、も表にしています。

元記事（表と出典つき）: https://koshinstudio.com/notes/hosting-compare/

**X 用**
> 個人サイトに広告を載せたいとき、どこに置ける？ 5つのホスティングを公式の規約だけで比べました。Vercel の Hobby は AdSense の掲載が商用扱いで不可。「見つからなかった」と「許可」は別、という点も書いています。 https://koshinstudio.com/notes/hosting-compare/

---

## 3. iOS の広告 SDK と Firebase を、公式の情報で比べる

元記事: https://koshinstudio.com/notes/ios-sdk-compare/

**Zenn / Qiita 用（題）**: 古い Xcode で iOS の広告 SDK を選ぶ：AdMob・AppLovin MAX・LevelPlay・Firebase・Supabase を公式で比べた

**本文（要約）**

Xcode 15.2 の古い Mac で、AdMob と Firebase の版を固定した経験をもとに、周りの選択肢を、公式のページだけで並べました（2026年10月8日に確認）。実際に使ったのは、AdMob と Firebase だけです。

- **最低の要件**: AdMob 11.6.0 以降は MarketplaceKit に依存して Xcode 15.3 以上。Firebase は 11.12.0 以降で Xcode 16.2 以上、12.0.0 以降で Swift 6.0 が必要。
- **公式ページの間で、要件が食い違うことがある。** AdMob はリリースノートとクイックスタートで、LevelPlay も統合ページ間で、数字が違いました。
- **プライバシー**: `NSPrivacyTracking` を true にしたら、`NSPrivacyTrackingDomains` にドメインが要る。ATT を許可していないと、そのドメインへの通信は失敗します（ITMS-91064 の原因）。
- **Firebase は、2026年10月に CocoaPods への新しい版の公開を止める**と、公式に書かれています。
- 無料枠の止まり方も表にしています（Firebase の Spark は Functions が使えない、Supabase の無料は1週間操作が無いと一時停止）。

元記事（表と出典つき）: https://koshinstudio.com/notes/ios-sdk-compare/

**X 用**
> 古い Xcode で iOS の広告 SDK を選ぶとき、見るのは「最低の要件」の表。AdMob 11.6.0 以降は Xcode 15.3 以上、Firebase 11.12.0 以降は 16.2 以上。公式ページの間で数字が食い違うこともありました。 https://koshinstudio.com/notes/ios-sdk-compare/

---

## 4. 静的サイトのコメント欄を、公式の情報で比べる

元記事: https://koshinstudio.com/notes/comment-services/

**Zenn / Qiita 用（題）**: 静的サイトのコメント欄、7つのうち4つは終了か更新停止の疑いだった（giscus・utterances・Disqus・Remark42 ほか）

**本文（要約）**

静的サイトのコメント欄サービスを、公式の説明とリポジトリだけで比べました（2026年10月8日に確認）。実際に使ったのは、giscus だけです。

- **調べた7つのうち、4つが、終了か更新停止の疑い。** Cusdis は2026年7月にアーカイブされて「deprecated」。Staticman は最後のコミットが2020年。Commento はクラウド版のサイトが404。utterances は最後のコミットが2022年（終了の宣言はありません）。
- **広告・追跡**: giscus・utterances・Cusdis・Remark42 は、公式に追跡も広告も無いと書いています。Disqus の無料版は広告で運営されています。
- **続いているのは**: giscus（最新の更新履歴 2026-05-26）と Remark42（v1.17.1、2026-09-14）。
- giscus は、このサイトでは「コメントを開く」を押すまで、外部に接続しない形で入れています。

元記事（表と出典つき）: https://koshinstudio.com/notes/comment-services/

**X 用**
> 静的サイトのコメント欄サービスを公式の情報で調べたら、7つのうち4つが終了か更新停止の疑い。広告・追跡の記述、続いているかの確認結果を表にしました。 https://koshinstudio.com/notes/comment-services/

---

## 5. ガチャのコンプリート計算機

ページ: https://koshinstudio.com/calc/gacha/

**X 用**
> ガチャの全種類をそろえるのに、何回・何円かかるか計算できる計算機を作りました。5種を1回300円なら、平均11.4回（約3,425円）、9割の人が揃うのは18回。コンプリートセットが得かどうかも出ます。 https://koshinstudio.com/calc/gacha/

**ブログ・note 用（一段落）**

ガチャの全種類をそろえるのに、何回かかるのか。種類数と、もう持っている数を入れると、平均の回数と費用、9割の人が揃う回数が出る計算機を作りました。計算が合っているかは、コンピューターで20万人ぶんを実際に引かせた結果と照らして確かめています。

ページ: https://koshinstudio.com/calc/gacha/

---

## 6. ガチャの当たり確率・天井計算機

ページ: https://koshinstudio.com/calc/gacha-rate/

**X 用**
> ガチャの排出率と回数から、当たる確率を計算する計算機を作りました。天井と、欲しい個数にも対応。「排出率3%」を100回回しても、約5%の人は一度も当たりません（95.2%で当たる）。 https://koshinstudio.com/calc/gacha-rate/

**ブログ・note 用（一段落）**

「排出率3％」は、「33回で必ず当たる」ではありません。100回回しても、約5％の人は一度も当たらない。排出率と回数から当たる確率を出し、天井（○回で確定）と欲しい個数にも対応した計算機を作りました。

ページ: https://koshinstudio.com/calc/gacha-rate/
