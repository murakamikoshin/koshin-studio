# ITMS-91064「無効なバイナリ」：NSPrivacyTracking が true なのに NSPrivacyTrackingDomains が空だった

> ビルドが Apple の自動審査で ITMS-91064 により却下された。NSPrivacyTracking が true で、NSPrivacyTrackingDomains が空の配列だったのが原因。ドメインを補った経緯と、確認できていないこと。

- URL: https://koshinstudio.com/notes/itms-91064/
- 公開: 2026-10-08
- 書いた人: Koshin（https://koshinstudio.com/about/）
- サイト: Koshin Studio

  English version (https://koshinstudio.com/en/notes/itms-91064/)

トレカダッシュ 開発の記録 ／ 2026年10月

  iOS アプリ「トレカダッシュ」をアップロードしたところ、Apple 側の自動審査で、ビルド 877 が「無効なバイナリ」として却下されました。エラーコードは ITMS-91064。原因は、プライバシーマニフェスト（PrivacyInfo.xcprivacy）の、二つの項目の組み合わせでした。コミットの記録で、何が起きて、どう直したかを書きます。

  このサイトには、トレカダッシュの作品ページがあります（トレカダッシュ (https://koshinstudio.com/works/torecadash/)）。ここに書くのは、開発の記録です。

## 起きたこと

  ビルド 877 が、Apple の自動審査で、「無効なバイナリ」として却下されました（2026年10月6日）。人が見る審査の前に、機械の検査で弾かれた、ということです。

## 原因：「トラッキングする」と書いて、ドメインが空だった

  プライバシーマニフェストには、次の二つの項目がありました。

    項目 | 値

    NSPrivacyTracking（トラッキングをするか） | true

    NSPrivacyTrackingDomains（トラッキングに使うドメイン） | 空の配列

  Apple の検査は、この組み合わせを、矛盾として弾きます。「トラッキングをする」と宣言しているのに、そのドメインが、一つも書かれていないからです。

  では、NSPrivacyTracking のほうを false にすればよいか、というと、そうではありませんでした。このアプリは、AdMob の広告（バナー、ネイティブ、アプリ起動広告）を、ATT（トラッキングの許可）に同意した人に、パーソナライズして出しています。トラッキングは、実際にしているので、true が正しい宣言です。直すべきは、空のドメインのほうでした。

## 直し方：ドメインを書く

  ただ、Google は、AdMob 向けの、トラッキングドメインの公式な一覧を、出していません。そこで、広く使われている広告配信のドメインを、追加しました。

- googlesyndication.com

- googleadservices.com

- doubleclick.net

- google.com

  Release 構成で、ビルドが通る（xcodebuild が BUILD SUCCEEDED）ことは、確認しています。

## 確認できていないこと

  コミットに書かれているのは、ビルドが通ることまでです。修正したビルドを、Apple が受け付けたかは、この記事を書いた時点で、記録にありません。また、ここに挙げたドメインの一覧が、AdMob のトラッキングに使われるドメインを、すべて覆っているかも、公式の一覧が無いため、確かめられていません。

## 分かったこと

> 宣言と中身は、機械に、突き合わせられる。

- 「する」と宣言したら、その中身（ドメイン）も書く。片方だけでは、矛盾として弾かれます。

- 弾かれたとき、宣言のほうを消して、逃げない。実際にしていることなら、宣言を正しいまま、中身を補います。

- 公式の一覧が無いものは、「どこまで確かめたか」を、書いておく。

  この記事は、コミット（2026年10月6日）の記録から書きました。

  この話に出てくるもの

- App Store の審査で止まった四つ (https://koshinstudio.com/notes/torecadash-review/) — ITMS-91064 を含む、審査の手前の記録

- App Store 審査で「Guideline 2.1 Information Needed」が届いた (https://koshinstudio.com/notes/review-info-needed/) — このあとの記録
