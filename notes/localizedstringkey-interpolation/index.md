# SwiftUI で翻訳キーがそのまま画面に出た：LocalizedStringKey に \(値) を埋め込むと、キーが別物になる（同じ間違いを 2 回）

> LocalizedStringKey("battle.rank.\(rank)") のキーは "battle.rank.%@" になり、翻訳が引けずに battle.rank.gold が画面に出た。Swift の型の決まりから原因を説明し、直し方と、同じ形を探す grep（直す前は 3 行、直した後は 0 行）を書いた。

- URL: https://koshinstudio.com/notes/localizedstringkey-interpolation/
- 公開: 2026-11-23
- 書いた人: Koshin（https://koshinstudio.com/about/）
- サイト: Koshin Studio

  書いた人：Koshin (https://koshinstudio.com/about/#operator)（Web エンジニア・アプリエンジニア）　公開：2026-11-23
弾幕メーカー 開発の記録 ／ 2026年11月

  iOS アプリ「弾幕メーカー」 (https://koshinstudio.com/works/danmaku-maker/)は、画面の文字を String Catalog（Localizable.xcstrings）で 10 言語に訳しています。そのアプリで、訳した文字の代わりに battle.rank.gold や pattern.twinRing のような「キー」がそのまま画面に出る不具合を、10 月と 11 月の 2 回、同じ原因で出しました。

  原因は、どちらもこの 1 行の形です。

  Text(LocalizedStringKey("battle.rank.\(rank)"))
  見た目は「battle.rank.gold というキーで翻訳を引く」ですが、実際に引かれるキーは battle.rank.%@ です。そんなキーは無いので、翻訳が見つかりません。この記事は、なぜそうなるのか、どう直したか、そして 2 回目を防げなかった理由と、同じ形をリポジトリから探す方法の記録です。

  この記事は、弾幕メーカーのリポジトリのコミット（0721668：2026 年 10 月 31 日、9d66669：2026 年 11 月 17 日）と、そのコードから書いています。grep の結果は、記事を書くときにそれぞれのコミットで実際に走らせたものです。

## 起きたこと：2 回とも「キーがそのまま出た」

     | 1 回目 | 2 回目

      直した日 | 2026-10-31（0721668） | 2026-11-17（9d66669）

      場所 | ショップの「広告でもらえるパターン」の名前（2 か所）と、通知の設定の種類名（1 か所） | 対戦モード「弾幕バトル」の勝ち・負けの表示（1 か所）と、ランク名（2 か所）

      出ていた文字 | pattern.twinRing のような ID | battle.result.win・battle.rank.gold のようなキー

      本来の表示（日本語） | パターンの名前 | 「勝ち！」「ゴールド」など

  2 回目の 3 か所は、対戦モードの画面を作ったコミット（dbc2f80、2026 年 11 月 11 日）で入ったものです。1.3.0 の公開後の確認で見つかり、11 月 17 日に直しました。

  どちらも、翻訳そのものは String Catalog にちゃんと入っていました。たとえば battle.rank.gold には、日本語の「ゴールド」を含む 10 言語（de・en・es・fr・ja・ko・pt-BR・ru・zh-Hans・zh-Hant）の訳があります。翻訳が無いのではなく、別のキーで引いていたのが原因です。

## なぜキーが別物になるのか

  理由は、Swift の言語の決まりと、SwiftUI の LocalizedStringKey の作りの、2 つが重なったことです。

- 型名("文字列リテラル") は、関数呼び出しではなく「その型のリテラル」として扱われる。Swift 5 からの決まり（SE-0213）で、型が ExpressibleByStringLiteral などに従っていれば、LocalizedStringKey("…") は "…" as LocalizedStringKey と同じ意味になります。String を受け取る初期化（init(_ value: String)）は使われません

- LocalizedStringKey は、文字列補間（\(…)）つきのリテラルを、自分で組み立てる。埋め込んだ値の所を %@ や %lld のような書式指定に置き換えた文字列をキーにし、値は「後で書式に当てはめる引数」として別に持ちます。Text("こんにちは、\(name)") を "こんにちは、%@" というキーで訳せるのは、この仕組みのおかげです

  つまり LocalizedStringKey("battle.rank.\(rank)") は、

- キー："battle.rank.%@"

- 引数：rank の値（たとえば "gold"）

  になります。String Catalog に battle.rank.%@ は無いので、翻訳は見つかりません。見つからないとき、SwiftUI はキーそのものを書式として使い、引数を当てはめて表示します。その結果、battle.rank.%@ に gold が入って、battle.rank.gold という「正しいキーと同じ文字列」が画面に出ます。

  これが見つけにくい点です。画面に出ている文字は、String Catalog に入っているキーと 1 文字も違いません。「キーは合っているのに、なぜ訳されないのか」と見えてしまいます。

## 書き方ごとの、引かれるキー

  rank が "gold" のとき、それぞれの書き方で、どのキーが引かれるかを並べます。

    書き方 | 引かれるキー | 訳されるか

      LocalizedStringKey("battle.rank.\(rank)") | battle.rank.%@ | ✕

      Text("battle.rank.\(rank)") | battle.rank.%@（Text にリテラルを渡すと、LocalizedStringKey として扱われるため同じ） | ✕

      LocalizedStringKey("battle.rank." + rank) | battle.rank.gold（+ でつないだ結果は String なので、init(_ value: String) が使われる） | ○

      let key = "battle.rank.\(rank)"
Text(LocalizedStringKey(key)) | battle.rank.gold（いったん String の変数に入れている） | ○

      Text(L("pattern.\(p.rawValue)"))
（L は下のヘルパー） | pattern.twinRing など（L の引数は String なので、補間は普通の文字列になる） | ○

  同じ \(…) でも、その文字列リテラルが「どの型として」読まれるかで結果が変わります。String として読まれれば普通の文字列、LocalizedStringKey として読まれれば書式つきのキーです。

  弾幕メーカーには、Text(LocalizedStringKey(keys[p] ?? "pattern.\(p.rawValue)")) という行もあります。これは ?? の左が String? なので、右のリテラルも String として読まれ、キーは正しく作られます。形が似ていても、型の決まり方で結果が分かれる例です。

## 直し方：キーを String として作ってから渡す

  やることは、キーを String として作ってから、翻訳を引く側に渡すことだけです。弾幕メーカーでは、2 つの書き方で直しました。

  2 回目（9d66669）は、+ でつなぐ形です。

  // 直す前
Text(LocalizedStringKey("battle.rank.\(s.rank)"))
Text(LocalizedStringKey("battle.result.\(result.outcome.rawValue)"))

// 直した後
Text(LocalizedStringKey("battle.rank." + s.rank))
Text(LocalizedStringKey("battle.result." + result.outcome.rawValue))
  1 回目（0721668）のショップの 2 か所は、翻訳を引いて String を返すヘルパーに通す形にしました。

  /// 画面に出す文字列（String Catalog 経由）
func L(_ key: String) -> String {
    String(localized: String.LocalizationValue(key))
}

// 直す前
Text(LocalizedStringKey("pattern.\(p.rawValue)"))
// 直した後
Text(L("pattern.\(p.rawValue)"))
  L の引数は String なので、"pattern.\(p.rawValue)" は普通の文字列 "pattern.twinRing" になり、そのキーで翻訳を引きます。Text には訳し終えた String を渡すので、Text 側でもう一度キーとして扱われることもありません。

  逆に、"%@ に勝った" のように、書式つきのキーを String Catalog に用意して値を当てはめたいときは、\(…) の埋め込みが正しい使い方です。まずいのは、キーの名前の一部を補間で作ることです。

## 2 回目を防げなかった理由と、grep で探す方法

  1 回目を直したとき、通知の設定の種類名を作る所（NotificationService.swift）には、こう注意書きを残していました。

  /// LocalizedStringKey("…\\(rawValue)") と書くと、キーが "settings.notify.%@" になって翻訳が引けないので、文字列をつないで作る
var titleKey: LocalizedStringKey { LocalizedStringKey("settings.notify." + rawValue) }
  それでも、11 日後に別のファイル（BattleHomeView.swift）で同じ形を 3 か所書きました。注意書きは、そのファイルを開いた人にしか読まれません。新しい画面を書くときに、別のファイルのコメントを思い出す仕組みはありません。

  この形は、1 行の grep でほぼ拾えます。「LocalizedStringKey(" で始まり、閉じる " の前に \( がある」行を探します。

  git grep -n -E 'LocalizedStringKey\("[^"]*\\\(' -- '*.swift'
  実際に、弾幕メーカーのリポジトリで、直す前と直した後のコミットに対して走らせた結果です（コメント行は除いて数えています）。

    コミット | 見つかった行

      1 回目を直す前（0721668 の 1 つ前） | 3 行（NotificationService.swift 1・ShopView.swift 2）

      1 回目を直した後（0721668） | 0 行

      2 回目を直す前（9d66669 の 1 つ前） | 3 行（BattleHomeView.swift 3）

      2 回目を直した後（9d66669） | 0 行

  2 回とも、直した場所と grep の結果は一致しました。このコマンドを 2 回目の前に一度走らせていれば、1.3.0 を出す前に 3 か所とも見つかったことになります。

  使うときの注意です。

- Text("battle.rank.\(rank)") のように、Text に直接書いた形は拾いません。こちらは、「キーらしい英小文字とドットで始まる」行を別に探すと絞れます：git grep -n -E 'Text\("[a-z]+\.[a-zA-Z.]*\\\(' -- '*.swift'（弾幕メーカーの 11 月 19 日時点のコード a783da8 では 0 行でした）

- 書式つきのキーを意図して使っている所も拾います。その場合は、String Catalog に %@ を含むキーがあるかを見て、あれば対象から外します。弾幕メーカーの String Catalog（1,188 キー）には、% を含むキーは 1 つもありませんでした。つまり、このアプリでは grep に当たった行は全部まちがい、と言えます

- キーを 1 行で書いていない（途中で改行している）と拾えません。grep は 1 行ずつ見るためです

  この grep を CI やコミット前の検査に入れるかどうかは、この記事を書いた時点ではまだ決めていません。入れるなら、上の 2 本を走らせて、1 行でも出たら止める形が簡単です。

## SwiftUI で翻訳を引く人へ：確かめる 4 つ

- 画面にキーがそのまま出たら、まず「そのキーをどう作ったか」を見る。翻訳ファイルにキーがあるのに訳されないなら、LocalizedStringKey や Text に \(…) つきのリテラルを渡していないかを疑います。画面の文字が正しいキーと同じでも、引いたキーは …%@ かもしれません

- キーの一部を値で変えるときは、String として作ってから渡す。+ でつなぐ、いったん変数に入れる、String(localized:) を通すヘルパーを使う、のどれかです

- 型名とかっこで囲んでも、リテラルはその型として読まれる。LocalizedStringKey("…\(x)") は、String を渡しているように見えて、String を通っていません

- 注意書きより、検査。同じ間違いが 2 回出たら、コメントを増やすより、上の grep のように機械で探せる形にしておく方が確かです

  弾幕メーカーの別の不具合の記録は、アプリとサーバーの点数がずれた記録 (https://koshinstudio.com/notes/swipe-next-twice/)に書いています。SwiftUI で起きた別の不具合は、ボタンが文字の上でしか反応しなかった記録 (https://koshinstudio.com/notes/swiftui-hit-area/)にあります。
