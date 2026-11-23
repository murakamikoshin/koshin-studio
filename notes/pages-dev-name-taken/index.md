# 「出たか」の確認が、他人のサイトで通っていた：Cloudflare Pages のプロジェクト名と *.pages.dev の住所は、同じとは限らない

> Pages に dopagaki という名前で出したら、住所は dopagaki-36i.pages.dev だった。200 を見るだけの配備確認は、他人のサイトで通っていた。404.html の無い Pages は無い道にも 200 を返す。API で住所を聞き、中身で確かめる直し方。

- URL: https://koshinstudio.com/notes/pages-dev-name-taken/
- 公開: 2026-11-15
- 書いた人: Koshin（https://koshinstudio.com/about/）
- サイト: Koshin Studio

  書いた人：Koshin (https://koshinstudio.com/about/#operator)（Web エンジニア・アプリエンジニア）　公開：2026-11-15
ドパガキ脱出！！ 開発の記録 ／ 2026年11月

  新しいブラウザゲーム「ドパガキ脱出！！」 (https://koshinstudio.com/works/dopagaki/)を、Cloudflare Pages に出しました。GitHub Actions で、dopagaki という名前の Pages プロジェクトを作って配り、最後に https://dopagaki.pages.dev/ を開いて 状態コードが 200 なら成功、という確認を入れていました。

  確認は通りました。でも、dopagaki.pages.dev は他の人のサイトでした。このプロジェクトに割り振られた住所は dopagaki-36i.pages.dev で、確認は、他人のサイトの 200 を見て「出た」と判断していました。

  この記事は、そのときのログと、あとから測った数字をもとに、何が起きたか・なぜ確認をすり抜けたか・どう直したかを書いたものです。Pages を CI から出している人なら、同じ形の確認を持っているかもしれません。

  この記事は、koshin-studio リポジトリの game-dopagaki ブランチのコミット（60483e4・a52d290、2026 年 11 月 15 日）、その GitHub Actions のログ、2026 年 11 月 15 日に curl で測った結果から書いています。

## 起きたこと：名前は dopagaki、住所は dopagaki-36i

  最初の配備の手順は、この 3 つでした。

  # 1. プロジェクトを作る（2 回目以降は「既にある」で失敗するので、握りつぶす）
npx -y wrangler@3 pages project create dopagaki --production-branch main || echo "既にある"

# 2. 配る
npx -y wrangler@3 pages deploy dist --project-name dopagaki --branch main --commit-dirty=true

# 3. 出たか確かめる
sleep 20
for u in / /game.js; do
  c=$(curl -s -o /dev/null -w "%{http_code}" "https://dopagaki.pages.dev$u"); echo "$c $u"; [ "$c" = 200 ] || exit 1
done
  Actions のログには、こう出ていました（日時は UTC）。

  22:50:22 ✨ Successfully created the 'dopagaki' project. It will be available at https://dopagaki-36i.pages.dev/ once you create your first deployment.
22:50:28 ✨ Deployment complete! Take a peek over at https://eb089e13.dopagaki-36i.pages.dev
22:50:48 200 /
22:50:48 200 /game.js
  wrangler は、プロジェクトを作った時点で本当の住所（dopagaki-36i.pages.dev）を表示していました。プロジェクト名の dopagaki はそのまま通りましたが、dopagaki.pages.dev という住所は、すでに他の人が使っていたので、後ろに -36i が付いた住所が割り振られた、という形です。プロジェクトが作れたことと、<名前>.pages.dev が自分の物になることは、別でした。

  そして、確認は成功で終わっています。ジョブは緑のままでした。

## なぜ通ったか：200 は、どのサイトでも返る

  確認は「/ と /game.js が 200 か」だけを見ていました。dopagaki.pages.dev には他の人のサイトが出ているので、/ が 200 なのは当然です。不思議なのは /game.js まで 200 だったことで、他人のサイトに同じ名前のファイルがあるとは限りません。

  あとから（2026 年 11 月 15 日）curl で測ると、こうなりました。

    開いた URL | 状態 | Content-Type | 大きさ | 「ドパガキ脱出」を含むか

      dopagaki.pages.dev/（他人） | 200 | text/html | 1,858 B | 含まない

      dopagaki.pages.dev/game.js（他人） | 200 | text/html | 1,858 B | 含まない

      dopagaki.pages.dev/no-such-file-xyz（他人） | 200 | text/html | 1,858 B | 含まない

      dopagaki-36i.pages.dev/（自分） | 200 | text/html | 25,408 B | 含む

      dopagaki-36i.pages.dev/game.js（自分） | 200 | application/javascript | 1,075,018 B | —

      dopagaki-36i.pages.dev/no-such-file-xyz（自分） | 200 | text/html | 25,408 B | 含む

  他人のサイトの /game.js は、JavaScript ではなく、トップページと同じ 1,858 バイトの HTMLでした。存在しない道（/no-such-file-xyz）も同じものが 200 で返ります。

  これは Pages の決まった動きです。プロジェクトの一番上に 404.html が無いと、Pages はそのサイトをシングルページアプリとして扱い、無い道にもトップの index.html を 200 で返します（Cloudflare のドキュメント「Serving Pages」 (https://developers.cloudflare.com/pages/configuration/serving-pages/)）。表の下の行のとおり、自分のプロジェクトも 404.html を置いていないので、同じ動きをしています。

  つまり、404.html の無い Pages に対しては、「この道が 200 か」はほとんど何も確かめていません。住所を間違えても、ファイルを入れ忘れても、200 が返ります。

## 直し方：住所は聞く、中身で確かめる、書き残す

  直したのは、最初の配備から約 3 分後のコミット（a52d290）です。やったことは 3 つです。

### 1. 住所は推測せず、API で聞く

  Pages のプロジェクトの情報には、割り振られた住所が subdomain として入っています。それを配備のたびに聞いて、後の手順で使います。

  - name: 住所を聞く
  run: |
    host=$(curl -s -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
      "https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/pages/projects/dopagaki" \
      | python3 -c "import json,sys; print(json.load(sys.stdin)['result']['subdomain'])")
    echo "住所: $host"; echo "HOST=$host" >> "$GITHUB_ENV"
  次の配備のログでは、住所: dopagaki-36i.pages.dev と出ました。トークンは、Pages を配るときに使っているもの（GitHub の Secrets に置いたもの）をそのまま使っています。

### 2. 状態コードだけでなく、中身で確かめる

  確認の行き先を $HOST に変え、さらにトップページに自分のゲームの名前が入っているかを見るようにしました。他人のサイトや、空のページが出ていれば、ここで止まります。

  - name: 出たか確かめる
  run: |
    sleep 20
    for u in / /game.js; do
      c=$(curl -s -o /dev/null -w "%{http_code}" "https://$HOST$u"); echo "$c $u"; [ "$c" = 200 ] || exit 1
    done
    curl -s "https://$HOST/" | grep -q 'ドパガキ脱出' || { echo "別の中身が出ている"; exit 1; }

### 3. 住所をファイルに書き残す

  このサイトは、koshinstudio.com/play/dopagaki/ を Worker で Pages へ中継しています（配り方の別の記録 (https://koshinstudio.com/notes/deploy-gotchas/)）。中継の行き先を書く人が、また dopagaki.pages.dev と書いてしまわないよう、聞いた住所を PAGES_HOST というファイルに書いて、Actions からコミットするようにしました（contents: write の権限を足し、コミットには [skip ci] を付けて、配備が自分を呼び直さないようにしています）。

  $ cat PAGES_HOST
dopagaki-36i.pages.dev
  中継の設定（worker/index.js）と、その検査（worker/test.mjs）も、この住所で書いています。

  // worker/index.js
dopagaki: 'https://dopagaki-36i.pages.dev',

// worker/test.mjs
await check('/play/dopagaki/', { status: 200, asked: 'https://dopagaki-36i.pages.dev/' });
await check('/play/dopagaki/game.js', { status: 200, asked: 'https://dopagaki-36i.pages.dev/game.js' });

## まだ残っている穴：/game.js の 200

  直したあとの確認でも、/game.js は状態コードしか見ていません。上の表のとおり、404.html の無い Pages では、game.js を入れ忘れても HTML が 200 で返るので、この行は今も、ほぼ何も確かめていません。トップの中身を見る確認は入ったので、住所の取り違えは捕まりますが、ファイルの入れ忘れは捕まりません。

  塞ぐなら、たとえば Content-Type を見るのが手軽です（このリポジトリには、まだ入れていません）。

  t=$(curl -s -o /dev/null -w "%{content_type}" "https://$HOST/game.js")
case "$t" in application/javascript*|text/javascript*) ;; *) echo "game.js が JS でない: $t"; exit 1;; esac
  あるいは、一番上に 404.html を置けば、無い道は 404 を返すようになり、状態コードの確認がそのまま意味を持ちます。ただし、その場合はシングルページアプリとしての扱いも無くなるので、道ごとの HTML を持たない作りでは使えません。

## Pages を CI から出す人へ：確かめる 4 つ

- <プロジェクト名>.pages.dev を、手で組み立てない。pages project create の表示か、API の result.subdomain で、本当の住所を確かめる。

- 404.html が無いなら、200 は「何かが返った」以上の意味を持たない。住所の間違いも、ファイルの入れ忘れも、200 で返る。

- 「自分の物が出ているか」を見る。ページの中の決まった文字、ファイルの Content-Type、大きさなど、他のサイトでは成り立たないものを確かめる。

- 聞いた住所は、書き残す。中継や DNS など、住所を書く場所が他にあるなら、推測で書かれないようにする。

  今回は、wrangler が最初から正しい住所を表示していたのに、確認は自分で組み立てた住所を見ていました。ジョブが緑だったので、ログを読まなければ気づかないところでした。
