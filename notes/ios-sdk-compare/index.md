# iOS アプリの広告 SDK と Firebase を、公式の情報で比べる：AdMob・AppLovin MAX・LevelPlay・Supabase

> iOSの広告SDKとFirebase・Supabaseを公式の情報で比較。SDKの要件はページの間で食い違うことがある。確認できなかったことも書いた。

- URL: https://koshinstudio.com/notes/ios-sdk-compare/
- 公開: 2026-10-08
- 書いた人: Koshin（https://koshinstudio.com/about/）
- サイト: Koshin Studio

  English version (https://koshinstudio.com/en/notes/ios-sdk-compare/)

比べたもの ／ 2026年10月

  トレカダッシュでは、古い Mac の Xcode 15.2 に合わせて、Firebase 11.4.0 と AdMob 11.5.0 に版を固定しました（その記事 (https://koshinstudio.com/notes/xcode152-sdk/)）。審査では、ITMS-91064 で却下もされています（その記事 (https://koshinstudio.com/notes/itms-91064/)）。そのとき調べきれなかった周りの選択肢を、公式のページだけで並べます。実際に使って比べたのは、AdMob と Firebase だけです。ほかは、使っていません。

  2026 年 10 月 8 日に確認した内容です。SDK の版や要件は、すぐ変わります。使う前に、出典で確かめてください。

## 早見表：知りたいことから探す

  先に、答えだけを並べます。くわしい数字と出典は、あとの節にあります。

    知りたいこと | 公式から言えること

    古い Xcode で、使える版を知りたい | AdMob 11.6.0 以降は Xcode 15.3 以上。Firebase 11.12.0 以降は Xcode 16.2 以上、12.0.0 以降は Swift 6.0 が必要（公式のリリースノート）

    広告の、最低の支払い額を知りたい | AdMob は USD で最低 $100（公式の表）。AppLovin は額が公式 FAQ に無く、支払いは前月分を翌月 15 日。LevelPlay と Meta は、確認できなかった

    広告のネットワークを、複数使いたい | AdMob・AppLovin MAX・LevelPlay に、メディエーションがある。AdMob の統合ガイドには、24 社のネットワークが載っている

    CocoaPods で、Firebase を使い続けたい | Firebase は 2026 年 10 月に、CocoaPods への新しい版の公開を止めると公式に明記。SPM が推奨

    無料で、サーバー側の処理も使いたい | Firebase の Spark では、Cloud Functions が使えない（Blaze のみ）。Supabase の無料は、1 週間操作が無いと、プロジェクトが一時停止する

  表の中の内容は、2026 年 10 月 8 日に公式ページで確認したものです。SDK の要件は、ページの間で食い違うことがあるので、手元のビルドでも確かめてください。

## 広告 SDK：しくみと支払い

    SDK | しくみ | 最低の支払い額

    Google AdMob | メディエーション（複数の広告ネットワークから配信する機能）あり。iOS の統合ガイドに、AppLovin・ironSource・Meta Audience Network・Unity Ads など 24 社 | USD の支払いは最低 $100（公式の表）。通貨ごとに値が違う

    AppLovin MAX | メディエーションのプラットフォーム | 具体的な額は、公式 FAQ に書かれていない（ダッシュボードで確認する形）。支払いは、前月分を翌月 15 日（NET15）

    Unity LevelPlay（ironSource） | LevelPlay の広告とメディエーション。アダプタは別パッケージ | 確認できなかった

    Meta Audience Network | 単体の広告ネットワーク。AdMob のメディエーションの対象としては掲載あり | 確認できなかった

  Meta Audience Network については、公式の終了の告知も、継続の明言も、確認できませんでした。いま新しく入れられるのかは、公式の一次情報では確定できません。

## iOS のプライバシー要件

- Apple の決まり（共通）：NSPrivacyTracking が true なら、NSPrivacyTrackingDomains にドメインの一覧が要ります。ユーザーが ATT（追跡の許可）を許可していないと、そのドメインへの通信は失敗し、アプリがエラーを受け取る、と Apple の文書にあります。ITMS-91064 の記事で起きたことと、一致しています。

- AdMob：広告を読み込む前に ATT を求めます（SDK 7.64.0 以上）。プライバシーマニフェストへの対応は 11.2.0（2024-03-14）から。トラッキングのドメインの公式な一覧は、AdMob のページでは見つけられませんでした（「存在しない」とは断定できません）。

- AppLovin MAX：12.4.1 以降が、プライバシーマニフェストに対応。連携する各ネットワークにも、必要な版があります（AdMob 11.2.0 以上、Meta 6.15.0 以上、Unity Ads 4.10.0 以上）。

- Meta：Audience Network SDK の iOS 用プライバシーマニフェストがあり、「6.15.0 に更新を」と案内。ドメインは事前に入っていて、手動で足すことは勧めていません。

- LevelPlay：調べた統合ページに、ATT とプライバシーマニフェストの記述は、確認できませんでした。

## 最低の Xcode と iOS、入れ方

    SDK | 最低の要件 | 入れ方

    AdMob | 最新は 13.11.0（2026-09-29）。リリースノートでは、最低 Xcode 26.2（13.4.0 から）。ただし、クイックスタートは「Xcode 16.0 以上」「iOS 13.0 以上」と書いていて、ページの間で食い違っている | SPM（推奨）・CocoaPods・手動

    Firebase | 最新は 13.0.0（2026-10-07）。Xcode 26.2 が最低、iOS 15.0。11.12.0 から Xcode 16.2 が必須、12.0.0 から Swift 6.0 が必須 | SPM が推奨。2026 年 10 月に、CocoaPods への新しい版の公開を止めると公式に明記

    AppLovin MAX | iOS 12.0 以上、Xcode 15 以上（統合ページ） | CocoaPods・SPM・手動。SPM なら、SDK と全アダプタを SPM でそろえる（混在は、版の衝突のもと）

    LevelPlay | 統合ページは iOS 12+・Xcode 15.4+。別のページ（Unity 用）は iOS 13+・Xcode 16+（検索結果の要約）。ページの間で食い違い | CocoaPods・SPM（9.3.0 以上）・手動

  トレカダッシュが版を固定した理由は、この表でも確かめられます。AdMob の 11.6.0 は MarketplaceKit に依存して Xcode 15.3 以上が必要、Firebase の 11.12.0 以降は Xcode 16.2 が必要、という公式のリリースノートの記述は、記事と一致していました。

## 解析・バックエンド：Firebase と Supabase の無料枠

    サービス | 公式に書かれていたこと

    Firebase（Spark） | Firestore：保存 1GiB、読み取り 5 万回/日、書き込み 2 万回/日、削除 2 万回/日。Authentication：月間アクティブ 5 万人（電話認証は使えない）。Cloud Functions：Spark では使えない（有料の Blaze のみ）。Analytics と Cloud Messaging：上限の数字なし（無料）

    Supabase（無料） | 月間アクティブ 5 万人、データベース 500MB、ファイルの保存 1GB、通信 5GB。有効なプロジェクトは 2 つまで。1 週間操作が無いと、無料のプロジェクトは一時停止

## 分かったこと

> 最新版に追いつけない環境では、「最低の要件」の表が、いちばん効く。

- SDK の要件は、ページの間で食い違うことがある。AdMob も LevelPlay も、リリースノートと導入の案内で、数字が違いました。両方を見て、手元でビルドして確かめるしかありません。

- プライバシーの設定は、SDK の外で起きる。NSPrivacyTracking を true にしたら、ドメインも書く。Apple の側の決まりで、SDK ごとの違いではありませんでした。

- 無料枠の止まり方を、先に見る。Supabase は、無操作で一時停止します。Firebase の Spark は、Functions が使えません。

## 確認できなかったこと

- LevelPlay と Meta Audience Network の、最低の支払い額

- Meta Audience Network の、提供状況（終了・継続）と、最低の Xcode / iOS、SPM への対応、現行の版

- AppLovin の最低の支払い額の具体額、MAX SDK の最新の版（リリースノートの URL が開けなかった）

- AdMob の、アクセスできる範囲での、トラッキングのドメインの公式な一覧

- Firebase 11.5.0 以降の FirebaseDataEncoder の不具合（記事に書いたとおり、手元のビルドで確かめたことで、公式の記載は確認できなかった）

- supabase-swift のプライバシーマニフェストの中身

- 精度や収益の比較（公式に数字が無いので、していません）

## 出典（すべて 2026 年 10 月 8 日に確認）

- AdMob：iOS のリリースノート (https://developers.google.com/admob/ios/rel-notes)

- AdMob：iOS のクイックスタート (https://developers.google.com/admob/ios/quick-start)

- AdMob：メディエーション (https://developers.google.com/admob/ios/mediation)

- AdMob：プライバシー (https://developers.google.com/admob/ios/privacy)

- AdMob：支払いのしきい値 (https://support.google.com/admob/answer/2772208?hl=en)

- Firebase：iOS のリリースノート (https://firebase.google.com/support/release-notes/ios)

- Firebase：導入の方法 (https://firebase.google.com/docs/ios/installation-methods)

- Firebase：料金 (https://firebase.google.com/pricing)

- AppLovin：統合（iOS） (https://support.applovin.com/en/max/ios/overview/integration)

- AppLovin：プライバシーマニフェスト (https://support.applovin.com/en/max/ios/overview/privacy-manifests)

- Unity LevelPlay：iOS SDK の統合 (https://docs.unity.com/en-us/grow/levelplay/sdk/ios/sdk-integration)

- Apple：プライバシーマニフェストファイル (https://developer.apple.com/documentation/bundleresources/privacy-manifest-files)

- Supabase：料金 (https://supabase.com/pricing)

  公式ページは、要約を通して読んだ箇所があります（数字は、原文と一字ずつ照らし合わせたものではありません）。載せる前に、原文を見直すことを前提にしてください。
