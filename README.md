# ドパガキ脱出！！

脱出ゲームなのに謎は解かない。殴る・投げる・叫ぶ（ステージによって突進・蹴る・引っぱる・踏む・吹く）で部屋ごと突破する3Dブラウザゲーム。全200ステージ・1000コース。

- 遊ぶ：https://koshinstudio.com/play/dopagaki/
- 紹介：https://koshinstudio.com/works/dopagaki/

## 置き場所について

このゲームは、サイトのリポジトリ（koshin-studio）の **`game-dopagaki` ブランチ**に置いてある（main とは履歴がつながっていない別物）。
このブランチに push すると `.github/workflows/deploy.yml` が組み立てて Cloudflare Pages の `dopagaki` に出す。
`koshinstudio.com/play/dopagaki/` は、main 側の `worker/` が `dopagaki.pages.dev` へ中継している。
専用のリポジトリに移すなら、このブランチの中身をそのまま持っていけばよい（Secrets の `CLOUDFLARE_API_TOKEN` も要る）。

## 組み立て

    npm ci
    npm run build        # src/ → dist/game.js

`dist/index.html` は手で書いた画面（HUD・地図・結果）。`dist/game.js` が組み立てた中身。

## 中身

    src/main.js     起動・描画・入力・画面遷移
    src/rooms.js    部屋の殻・手作りの20コース（STAGE 1〜4）・STAGE 5〜200 の生成
    src/par.js      生成コースの目標手数（テスト用ボットの実測）
    src/kid.js      主人公（移動・殴る・投げる・叫ぶ・突進・吹く・引っぱる）
    src/props.js    物（壊れ方・爆発・素材）
    src/person.js   主人公と見張りの姿
    src/fx.js  src/audio.js  src/tex.js  src/ctx.js
    test/           ボット（Playwright）。全コースが解けるか、何手かかるかを測る

## 決めごと

- 素材の壊し方は全ステージで変えない：木＝殴る、ガラス＝叫ぶ、鉄＝爆破
- 画面下の操作表示は動詞だけ（「殴る」「蹴る」）。説明や「＝」は付けない
- 「本来のルール」は最初の1.6秒だけ中央（その間は操作できない）、その後は画面下。同じコースを続けて遊ぶときは最初から下
