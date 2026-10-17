# X の投稿（そのまま貼れる形）

Xの文字数は、全角を2、半角を1、URLを23として数えた値（上限280）。投稿の間隔は、1日1〜2本で、数日に分ける（一度に出すと、量産に見える）。

## 日本語

### 1. tco-relay（208/280）
```
「確認済み」の印が付いていたのに、リンク先を一度も読めていなかった。t.co はブラウザのふりで開くと、転送せず中継ページを返す。表示中の220件が全部読めておらず、9件は閉じたフォームだった。
https://koshinstudio.com/notes/tco-relay/
```

### 2. firestore-91（171/280）
```
Firestore の費用を円にしたら、月1.3万円。読み取りの91%は、商品一覧の読み直しだった。60秒のキャッシュが効かなかったのは、32件が同時に動いていたから。
https://koshinstudio.com/notes/firestore-91/
```

### 3. notify-gate（154/280）
```
通知は取り消せない。直近72時間の通知644件のうち、122件（19%）が誤通知だった。記事の関門は「後から下げる」ので、通知は先に出ていた。
https://koshinstudio.com/notes/notify-gate/
```

### 4. negaeri-balance（161/280）
```
寝返り将棋のルールを、AI同士の対局で決めた記録。効いた変更は1つ（盤の端を、挟みの終わりに）で、反転が42%から81%に。壊れた案6つも表にした。
https://koshinstudio.com/notes/negaeri-balance/
```

### 5. silent-discard（167/280）
```
「x.com」が「e-starbox.com」に一致して、抽選サービスの応募リンクが一度も採用されていなかった。ほか3つ。本物の抽選を、静かに捨てていた4つの実例。
https://koshinstudio.com/notes/silent-discard/
```

### 6. lottery（147/280）
```
抽選に何か所か応募したとき、ひとつでも当たる確率の計算機。応募先ごとに倍率が違っても使える。計算は、20万回の試行で検算した。
https://koshinstudio.com/calc/lottery/
```

### 7. vps-migration（182/280）
```
Cloud Functions で1日3,700円かかっていたので、月4,300円のサーバーに移した。ヘルシンキはEEAでYahoo!が全滅したので、シンガポールに作り直した。移行で踏んだ罠5つ。
https://koshinstudio.com/notes/vps-migration/
```

### 8. gemini-meter（176/280）
```
Gemini の費用を削る前に、計測を疑った。単価・内訳・キャッシュの3つが壊れていた。キャッシュが効く条件は、9月は約8,000、10月は約4,000トークンと食い違った。
https://koshinstudio.com/notes/gemini-meter/
```

## 英語

### E1. tco-relay（179/280）
```
A "checked" mark on articles that had never been read: t.co returns a relay page when you pretend to be a browser. All 220 were unread; 9 were closed forms.
https://koshinstudio.com/en/notes/tco-relay/
```

### E2. firestore-91（178/280）
```
I priced Firestore in yen for the first time: about 13,000 yen a month, 91% of reads from one place. My 60-second cache failed because 32 jobs ran at once.
https://koshinstudio.com/en/notes/firestore-91/
```

### E3. negaeri-balance（150/280）
```
Setting the rules of a board game by AI-vs-AI play: one change that worked, six that broke. Drops that cause a flip went from 2% to 81%.
https://koshinstudio.com/en/notes/negaeri-balance/
```

### E4. vps-migration（171/280）
```
Cloud Functions cost 3,700 yen a day because waiting time was billed. I moved to a 4,300-yen-a-month server. Helsinki failed: Yahoo! blocks the EEA.
https://koshinstudio.com/en/notes/vps-migration/
```
