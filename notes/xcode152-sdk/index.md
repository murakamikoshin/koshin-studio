# Xcode 15.2 で Firebase 12 が使えない（Swift 6.0 必須）：Firebase 11.4.0 と AdMob 11.5.0 に固定した理由

> 古い Mac の Xcode 15.2 では、Firebase 12 以降と 11.12.0 以降は Xcode 16.2 が必須、AdMob 11.6.0 以降は MarketplaceKit で Xcode 15.3 が必須。Exact Version で固定した記録。

- URL: https://koshinstudio.com/notes/xcode152-sdk/
- 公開: 2026-10-08
- 書いた人: Koshin（https://koshinstudio.com/about/）
- サイト: Koshin Studio

  English version (https://koshinstudio.com/en/notes/xcode152-sdk/)

トレカダッシュ 開発の記録 ／ 2026年10月

  iOS アプリ「トレカダッシュ」は、2017 年の古い Mac で、Xcode 15.2 を使って作っています。この環境では、Firebase の iOS SDK と、AdMob（Google Mobile Ads）の SDK を、新しい版にすると、ビルドできません。どの版から使えなくなって、どの版に固定したのか。開発の引き継ぎ記録（2026年7月）に残っている内容で書きます。

  このサイトには、トレカダッシュの作品ページがあります（トレカダッシュ (https://koshinstudio.com/works/torecadash/)）。ここに書くのは、開発の記録です。版の番号は、2026 年 7 月の時点のもので、いまの最新版では、事情が違うかもしれません。

## 開発の環境

- Mac：MacBook Pro 13 インチ（2017）。macOS は、Ventura（13.7.8）が上限で、これ以上は上げられません。

- Xcode：15.2（Ventura で使える最新版）。正式に対応するのは、iOS 17.2 までです。

- 実機の iPhone は、iOS 26。そのため、ケーブルで、手元の Xcode から、実機に書き込むことはできません。実機での確認は、Xcode Cloud を通して、TestFlight に配信する経路だけです。

- 手元では、xcodebuild でコンパイルが通るかを確かめます。SwiftUI のプレビューは、この Mac では、ほぼ表示されません。

## Firebase：11.4.0 に固定した

  Firebase の iOS SDK は、版が上がるほど、新しい Xcode を要求します。記録には、次のように残っています。

    Firebase の版 | 起きること

    12.0.0 以降 | Swift 6.0 のツールチェーン（Xcode 16.2 以降）が必須

    11.12.0 以降 | 同じく Xcode 16.2 が必須

    11.5.0 〜 | FirebaseDataEncoder.swift のバグ（Firebase の Issue #15029）

    11.4.0 | 安定して動くことを確認

  そこで、Swift Package Manager の指定を、Exact Version（その版ぴったり）で 11.4.0 にしました。Xcode は、最新の版を提案してきますが、それには従いません。

  ここで、混乱しやすい点があります。Xcode Cloud（クラウド側のビルド）は、最新の Xcode で動きます。ただ、固定の設定はそのまま維持されるので、クラウド側でも、問題なくビルドが成功しています。つまり、手元の古い Xcode に合わせて固定しておけば、クラウド側の新しい Xcode でも、同じ版で通ります。

## AdMob：11.5.0 に固定した

  AdMob の SDK（swift-package-manager-google-mobile-ads）も、同じ理由で、11.5.0 に固定しました（2026 年 7 月 22 日）。

- 11.6.0 以降：Apple 純正の MarketplaceKit に依存するようになり、Xcode 15.3 以降が必須になります。Xcode 15.2 では、リンクのときに、Undefined symbols（MarketplaceKit 関連）のエラーで、ビルドが失敗します。

- 11.5.0 の注意：この版の SDK には、Swift らしい新しいクラス名（BannerView、RewardedAd など）が、まだありません。GAD の接頭辞が付いた、古い名前（GADBannerView、GADRewardedAd、GADRequest、GADMobileAds、GADFullScreenContentDelegate など）を使う必要があります。

  将来、Xcode を新しくして、版を上げるときは、版の番号だけでなく、クラス名の書き換えも、必要になります。記録に、そう書き残してあります。

## 同じ環境の人に、伝えたいこと

- 固定は、「Exact Version」で。「この版以降」の指定のままだと、Xcode が、使えない新しい版を、選んでしまいます。

- 「どの版から壊れるか」を、版の番号で書いておく。数か月後に、自分が、なぜ固定したかを忘れても、理由が分かります。

- 手元の環境の制約は、クラウドでは、緩められる。実機の確認は、Xcode Cloud と TestFlight を通せば、古い Mac でも続けられます（ただし、無料枠には、上限があります。TestFlight にビルドが来ない件 (https://koshinstudio.com/notes/torecadash-ci/)を、参考にしてください）。

## 確認できていないこと

  この記事の版の番号は、2026 年 7 月の記録のものです。その後に出た版で、Xcode 15.2 の制約が、どうなっているかは、確かめていません。「この版以降は使えない」という境目は、その時点での、ビルドの結果です。

  この話に出てくるもの

- TestFlight にビルドが来ない：Xcode Cloud の月25時間を使い切っていた (https://koshinstudio.com/notes/torecadash-ci/) — 同じ環境の、Xcode Cloud の記録

- ITMS-91064「無効なバイナリ」 (https://koshinstudio.com/notes/itms-91064/) — AdMob まわりの、別の記録
