# Python の splitlines() で JSONL が壊れる：犯人は U+2028（見えない改行文字）

> JSONL を splitlines() で読むと、あらすじ中の U+2028 で行が割れて JSON が壊れる。実データ（7,255行と7,247件、U+2028 は8個）で確かめて、split("\n") に直した記録。

- URL: https://koshinstudio.com/notes/u2028/
- 公開: 2026-10-07
- 書いた人: Koshin（https://koshinstudio.com/about/）
- サイト: Koshin Studio

  English version (https://koshinstudio.com/en/notes/u2028/)

ガチアニメ診断 開発の記録 ／ 2026年10月

  ガチアニメ診断 (https://koshinstudio.com/works/shindananime/)の作品データを作る途中で、JSON が壊れるという不具合を直しました。原因は、splitlines() という、ごくふつうの関数でした。

## 何が壊れたのか

  診断の元になる作品データは、Filmarks から取ったものを data/filmarks_works.jsonl に貯めています。JSONL は1行に1作品の JSON を書く形式で、読むときは行ごとに割って json.loads に渡します。読み込みは Python で、最初はこう書いていました。

  for line in path.read_text(encoding='utf-8').splitlines():
    r = json.loads(line)
  ところが、あらすじの中に U+2028（LINE SEPARATOR）という文字を含む作品があると、その行が途中で割れて、json.loads が文字列の途中で切れた JSON を渡されて落ちます。

## U+2028 とは

  U+2028 は「行の区切り」を表す Unicode の文字で、見た目はほとんど改行です。JSON としては、文字列の中に生のまま書いても正しい文字です。書き出す側（json.dumps(..., ensure_ascii=False)）も、これをそのまま出力します。

  問題は読む側でした。Python の str.splitlines() は、\n だけでなく、U+2028 のようなUnicode 上の改行文字でも割ります。split('\n') は \n でしか割りません。

  s = json.dumps({"a": "x y"}, ensure_ascii=False)
len(s.splitlines())   # 2 （1行のはずが2つに割れる）
len(s.split('\n'))    # 1
  割れた片方ずつを json.loads に渡すと、Unterminated string（文字列が閉じていない）というエラーになります。上の短い例で、そのとおり再現しました。

## 実際のデータでの数字

  いまのデータファイルで、両方の割り方を数えなおしました。

    割り方 | 行の数

    split('\n')（本当の改行だけ） | 7,247

    splitlines() | 7,255

  差は 8。ファイルの中の U+2028 を数えると、ちょうど 8 個でした。それが入っていたのは2 作品の行です。7,247 作品のうちの 2 つ、つまり 0.03% に満たない数で、データ全体を読めなくするのに十分でした。

## 直し方

  やったことは1行です。

  - for line in path.read_text(encoding='utf-8').splitlines():
+ for line in path.read_text(encoding='utf-8').split('\n'):
  コミットには、あとで読んだ自分が迷わないよう、理由をコメントで残しました。JSONL を作るときに行を区切っているのは \n だけで、読むときも \n だけで割るのが対になる、ということです。

## 気づきにくい理由

- 見た目では分からない。U+2028 は、エディタによっては改行にも空白にも見えます。あらすじをいくら眺めても見つかりません。

- めったに出ない。7,247 作のうちの 2 作品です。少しだけ取って試している間は、一度も当たらなくても不思議はありません。全件を取りきってはじめて壊れる種類の不具合です。

- 書く側は正しい。JSON として間違ったものは、どこにも書かれていません。壊しているのは、読む側が「行とは何か」を思い込んでいたことです。

## もうひとつ、同じ日に直したもの

  同じコミットでは、もうひとつ、見た目が似ているのに別の文字が原因の不具合も直しています。作品名の突き合わせで、Annict の ＜物語＞（全角の不等号）と、Filmarks の 〈物語〉（日本語の山括弧）が、同じ作品なのに一致しませんでした。正規化（NFKC）は全角の ＜＞ を半角にしてくれますが、〈〉 はそのまま残るため、比較用の文字列から両方とも取り除くことにしました。

  どちらも「文字が見た目どおりとは限らない」という話です。

## 分かったこと

> 改行のつもりで使った関数が、改行だと思っている範囲を、思ったより広く取っていた。
  JSONL を読むときは、splitlines() ではなく、書いた側が区切りに使った文字（\n）で割る。あるいは、ファイルを1行ずつ読む for line in f: を使う（こちらは \n でしか割りません）。次にデータが増えたときのために、ここに書いておきます。

  この記事の数字は、2026年10月7日に、データファイルを実際に数えなおしたものです。

  この話に出てくるもの

- ガチアニメ診断（作品ページ） (https://koshinstudio.com/works/shindananime/) — 何を作ったのか、画面と数字で

- 診断を12問にしたら、結果はどこまで変わるのか (https://koshinstudio.com/notes/shindan12/) — 同じ診断の、別の記録

  診断する (https://koshinstudio.com/app/shindananime/)作品ページへ (https://koshinstudio.com/works/shindananime/)
