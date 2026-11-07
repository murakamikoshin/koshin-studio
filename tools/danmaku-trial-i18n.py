"""弾幕メーカー ブラウザ版の画面の文言を、10 言語で書き出す（works/danmaku-maker/try/i18n.js）。

   文言は、できるだけアプリの翻訳（danmaku-maker/DanmakuApp/Localizable.xcstrings）をそのまま使う。
   アプリで人が確かめた訳なので、言い回しもアプリと揃う。アプリに無い、ブラウザ版だけの文言
   （コードの貼り付け、このブラウザに保存、など）だけを、下の MANUAL に書いた。

       python3 tools/danmaku-trial-i18n.py ../danmaku-maker/DanmakuApp/Localizable.xcstrings

   アプリの訳が直ったら、これを走らせ直すだけでよい。"""
import json, re, sys

LANGS = ['ja', 'en', 'zh-Hans', 'zh-Hant', 'ko', 'es', 'fr', 'de', 'pt-BR', 'ru']
NAMES = {'ja': '日本語', 'en': 'English', 'zh-Hans': '简体中文', 'zh-Hant': '繁體中文', 'ko': '한국어',
         'es': 'Español', 'fr': 'Français', 'de': 'Deutsch', 'pt-BR': 'Português', 'ru': 'Русский'}

xc = json.load(open(sys.argv[1], encoding='utf8'))['strings']
def unit(v, l): return v.get('localizations', {}).get(l, {}).get('stringUnit', {}).get('value')
JA2KEY = {}
for k, v in xc.items():
    j = unit(v, 'ja') or k
    if all(unit(v, l) or l == 'ja' for l in LANGS): JA2KEY.setdefault(j, k)

def fmt_conv(s):
    """%lld・%@・%d・%.1f・%1$@ を {0} {1} に"""
    i = [0]
    def rep(m):
        if m.group(1): return '{' + str(int(m.group(1)) - 1) + '}'
        n = i[0]; i[0] += 1; return '{' + str(n) + '}'
    return re.sub(r'%(?:(\d)\$)?(?:lld|ld|d|@|\.\d?f|f)', rep, s)

def app(ref, prefix='', suffix=''):
    k = ref if ref in xc else JA2KEY.get(ref)
    if not k: raise SystemExit(f'アプリに無い文言: {ref}')
    return {l: prefix + fmt_conv(unit(xc[k], l) or (k if l == 'ja' else '')) + suffix for l in LANGS}

MANUAL_N = 0
def man(*vals):
    global MANUAL_N; MANUAL_N += 1
    assert len(vals) == len(LANGS), vals[0]
    return dict(zip(LANGS, vals))

D = {
 # ---- アプリの訳をそのまま使う ----
 'ty_ring': app('放射'), 'ty_aim': app('自機狙い'), 'ty_rain': app('雨'), 'ty_sweep': app('首ふり扇'),
 'rl_aim': app('広がり'), 'rl_rain': app('（なし）'), 'rl_sweep': app('振れ幅'),
 'newb': app('home.create', '＋ '), 'play': app('遊ぶ'), 'world': app('home.tab.samples'),
 'boss': app('ボス'), 'surv': app('耐久'), 'rate': app('クリア率'), 'tries': app('挑戦'), 'clears': app('クリア'),
 'edit': app('編集'), 'code': app('detail.share'), 'editor': app('エディタ'), 'back': app('戻る', '← '),
 'cond': app('クリア条件'), 'mS': app('耐えきる'), 'mSd': app('決めた時間、被弾せずに生き残る'),
 'mB': app('ボスを倒す'), 'mBd': app('自動ショットでHPを削りきる'), 'name': app('ステージ名'), 'namePh': app('例：地獄の渦'),
 'authorPh': app('editor.author.placeholder'), 'dur': app('耐える時間'), 'durB': app('制限時間'),
 'mv': app('ボスの動き'), 'mv0': app('動かない'), 'mv1': app('ゆっくり左右'), 'mv2': app('速く左右'), 'bhp': app('ボスHP'),
 'bossNote': app('ボス戦では発射台はボスにくっつきます。HPが減るごとに「第1〜第3段階」に切り替わり、切り替わりで画面の弾が消えます。'),
 'add': app('editor.add', '＋ '), 'test': app('テストプレイ'), 'em': app('editor.emitter'), 'del': app('削除'),
 'pat': app('パターン'), 'color': app('弾の色'), 'phase': app('使う段階'),
 'ph0': app('全段階'), 'ph1': app('第1段階'), 'ph2': app('第2段階'), 'ph3': app('第3段階'),
 'sl_x': app('横位置'), 'sl_y': app('縦位置'), 'sl_s': app('開始'), 'sl_e': app('終了'), 'sl_i': app('発射間隔'),
 'sl_c': app('弾数'), 'sl_v': app('弾の速さ'), 'toEnd': app('最後まで'),
 'quit': app('やめる'), 'retry': app('もう一度'), 'backB': app('戻る'), 'hintDrag': app('play.hint'),
 'win': app('CLEAR!'), 'bossWin': app('撃破！'), 'timeUp': app('時間切れ'), 'hit': app('被弾…'), 'ready': app('READY'),
 'wBoss': app('result.msg.boss'), 'wSurv': app('result.msg.survive'), 'lTime': app('result.msg.timeup'), 'lHit': app('result.msg.hit'),
 'phaseB': app('play.phase'), 'survFor': app('detail.survive'), 'bossFor': app('detail.boss'), 'secs': app('unit.seconds'),
 'xText': app('share.author'), 'share': app('detail.share'),
 'lk_swirl': app('pattern.swirl'), 'lk_homing': app('pattern.homing'), 'lk_flower': app('pattern.flower'), 'lk_star': app('pattern.star'),
 'lk_heart': app('pattern.heart'), 'lk_sweepLaser': app('pattern.sweepLaser'), 'lk_mine': app('pattern.mine'),
 'lk_meteor': app('pattern.meteor'), 'lk_gravity': app('pattern.gravity'), 'lk_snake': app('pattern.snake'), 'lk_maker': app('maker.title'),
 # ---- ブラウザ版にしか無い文言（アプリに訳が無いので、ここで訳した） ----
 'ty_spiral': man('回転する放射', 'Rotating ring', '旋转放射', '旋轉放射', '회전 방사', 'Anillo giratorio', 'Anneau rotatif', 'Rotierender Ring', 'Anel giratório', 'Вращающееся кольцо'),
 'rl_rot': man('回転', 'Rotation', '旋转', '旋轉', '회전', 'Rotación', 'Rotation', 'Drehung', 'Rotação', 'Вращение'),
 'sl_r': man('角度', 'Angle', '角度', '角度', '각도', 'Ángulo', 'Angle', 'Winkel', 'Ângulo', 'Угол'),
 'tag': man('お試し版', 'Trial', '试玩版', '試玩版', '체험판', 'Prueba', 'Essai', 'Test', 'Teste', 'Пробная'),
 'sub': man('作って、クリアして、友達に送りつけろ。', 'Build a stage, clear it, and send it to a friend.', '做关卡、自己通关、发给朋友。', '做關卡、自己通關、傳給朋友。',
            '만들고, 클리어하고, 친구에게 보내자.', 'Crea un nivel, supéralo y mándaselo a un amigo.', 'Crée un niveau, termine-le et envoie-le à un ami.',
            'Bau ein Level, schaff es und schick es einem Freund.', 'Crie uma fase, vença e mande para um amigo.', 'Создай уровень, пройди его и отправь другу.'),
 'codeH': man('コード・リンクで遊ぶ', 'Play from a code or link', '用代码或链接游玩', '用代碼或連結遊玩', '코드·링크로 플레이', 'Jugar con un código o enlace',
              'Jouer avec un code ou un lien', 'Mit Code oder Link spielen', 'Jogar com código ou link', 'Играть по коду или ссылке'),
 'codePh': man('DM1- から始まるコードか、リンクを貼り付け', 'Paste a DM1- code or a link', '粘贴以 DM1- 开头的代码或链接', '貼上以 DM1- 開頭的代碼或連結',
               'DM1-로 시작하는 코드나 링크를 붙여넣기', 'Pega un código DM1- o un enlace', 'Colle un code DM1- ou un lien', 'DM1-Code oder Link einfügen',
               'Cole um código DM1- ou um link', 'Вставьте код DM1- или ссылку'),
 'recv': man('受け取ったステージ', 'Stages you received', '收到的关卡', '收到的關卡', '받은 스테이지', 'Niveles recibidos', 'Niveaux reçus', 'Erhaltene Level', 'Fases recebidas', 'Полученные уровни'),
 'mine': man('自分のステージ', 'Your stages', '我的关卡', '我的關卡', '내 스테이지', 'Tus niveles', 'Tes niveaux', 'Deine Level', 'Suas fases', 'Ваши уровни'),
 'emptyRecv': man('友達のコードやリンクで遊ぶと、ここに並びます。', 'Stages you open from a friend’s code or link appear here.',
                  '用朋友的代码或链接游玩后，会显示在这里。', '用朋友的代碼或連結遊玩後，會顯示在這裡。', '친구의 코드나 링크로 플레이하면 여기에 표시됩니다.',
                  'Aquí aparecen los niveles que abras con el código o enlace de un amigo.', 'Les niveaux ouverts depuis le code ou le lien d’un ami apparaissent ici.',
                  'Level, die du über den Code oder Link eines Freundes öffnest, erscheinen hier.', 'As fases que você abrir pelo código ou link de um amigo aparecem aqui.',
                  'Здесь появятся уровни, открытые по коду или ссылке друга.'),
 'emptyMine': man('まだありません。上のボタンから作ってみましょう。送るには、自分でクリアする必要があります。',
                  'Nothing yet. Use the button above to build one. You must clear your own stage before sharing it.',
                  '还没有关卡。用上方的按钮做一个吧。分享前必须自己通关。', '還沒有關卡。用上方的按鈕做一個吧。分享前必須自己通關。',
                  '아직 없습니다. 위의 버튼으로 만들어 보세요. 공유하려면 직접 클리어해야 합니다.',
                  'Aún no hay nada. Usa el botón de arriba para crear uno. Para compartirlo, primero debes superarlo.',
                  'Rien pour l’instant. Utilise le bouton ci-dessus pour en créer un. Pour le partager, tu dois d’abord le terminer.',
                  'Noch nichts. Erstelle eins mit dem Button oben. Zum Teilen musst du es zuerst selbst schaffen.',
                  'Nada ainda. Use o botão acima para criar uma. Para compartilhar, você precisa vencê-la primeiro.',
                  'Пока пусто. Создайте уровень кнопкой выше. Чтобы поделиться, сначала пройдите его сами.'),
 'note': man('お試し版です。ステージと記録は、このブラウザの中にだけ残ります。人へはリンクで渡します。',
             'Trial version. Your stages and records stay only in this browser. Share them with a link.',
             '这是试玩版。关卡和记录只保存在这个浏览器中。用链接分享给别人。', '這是試玩版。關卡和紀錄只保存在這個瀏覽器中。用連結分享給別人。',
             '체험판입니다. 스테이지와 기록은 이 브라우저에만 저장됩니다. 다른 사람에게는 링크로 보내세요.',
             'Versión de prueba. Tus niveles y récords solo se guardan en este navegador. Compártelos con un enlace.',
             'Version d’essai. Tes niveaux et records restent uniquement dans ce navigateur. Partage-les avec un lien.',
             'Testversion. Deine Level und Rekorde bleiben nur in diesem Browser. Teile sie per Link.',
             'Versão de teste. Suas fases e recordes ficam só neste navegador. Compartilhe com um link.',
             'Пробная версия. Уровни и рекорды хранятся только в этом браузере. Делитесь ими по ссылке.'),
 'codeErr': man('コードを読み取れませんでした。DM1- から最後まで全部貼り付けてください。', 'Could not read that code. Paste everything from DM1- to the end.',
                '无法读取代码。请从 DM1- 开始完整粘贴到最后。', '無法讀取代碼。請從 DM1- 開始完整貼上到最後。', '코드를 읽을 수 없습니다. DM1-부터 끝까지 모두 붙여넣어 주세요.',
                'No se pudo leer el código. Pega todo desde DM1- hasta el final.', 'Impossible de lire ce code. Colle tout, de DM1- jusqu’à la fin.',
                'Der Code konnte nicht gelesen werden. Füge alles von DM1- bis zum Ende ein.', 'Não foi possível ler o código. Cole tudo, de DM1- até o fim.',
                'Не удалось прочитать код. Вставьте всё, от DM1- до конца.'),
 'author': man('作者名', 'Creator', '作者名', '作者名', '작성자 이름', 'Autor', 'Auteur', 'Ersteller', 'Autor', 'Автор'),
 'post': man('共有リンクを作る', 'Get share link', '生成分享链接', '產生分享連結', '공유 링크 만들기', 'Crear enlace', 'Créer un lien de partage',
             'Teilen-Link erstellen', 'Criar link de compartilhamento', 'Создать ссылку'),
 'ok': man('クリア確認済み。共有できます。', 'Cleared. You can share it now.', '已确认通关，可以分享了。', '已確認通關，可以分享了。', '클리어 확인 완료. 공유할 수 있습니다.',
           'Superado. Ya puedes compartirlo.', 'Terminé. Tu peux le partager.', 'Geschafft. Du kannst es jetzt teilen.', 'Vencida. Já pode compartilhar.',
           'Пройдено. Теперь можно поделиться.'),
 'need': man('共有するには、まず自分でテストプレイしてクリアしてください。', 'To share, first clear it yourself in a test play.', '要分享，请先自己试玩并通关。',
             '要分享，請先自己試玩並通關。', '공유하려면 먼저 테스트 플레이로 직접 클리어하세요.', 'Para compartir, primero supéralo tú en una prueba.',
             'Pour partager, termine-le d’abord toi-même en test.', 'Zum Teilen schaffe es zuerst selbst im Testspiel.', 'Para compartilhar, vença primeiro no teste.',
             'Чтобы поделиться, сначала пройдите уровень сами в тестовой игре.'),
 'tNg': man('作った本人もクリアできないと、共有できません。', 'You need to clear your own stage before sharing it.', '作者自己通关后才能分享。', '作者自己通關後才能分享。',
            '만든 사람이 클리어해야 공유할 수 있습니다.', 'Debes superar tu propio nivel antes de compartirlo.', 'Tu dois terminer ton propre niveau avant de le partager.',
            'Du musst dein eigenes Level schaffen, bevor du es teilst.', 'Você precisa vencer sua própria fase antes de compartilhar.',
            'Нужно пройти свой уровень, прежде чем делиться им.'),
 'lockT': man('ほかの弾幕パターンは、アプリで使えます。', 'More patterns are available in the app.', '更多弹幕样式请在 App 中使用。', '更多彈幕樣式請在 App 中使用。',
              '더 많은 탄막 패턴은 앱에서 사용할 수 있습니다.', 'Hay muchos más patrones en la app.', 'Bien plus de motifs dans l’app.', 'Viele weitere Muster gibt es in der App.',
              'Muito mais padrões no app.', 'Гораздо больше узоров — в приложении.'),
 'moreOpt': man('ほかのパターン（アプリ）', 'More patterns (app)', '更多样式（App）', '更多樣式（App）', '더 많은 패턴 (앱)', 'Más patrones (app)', 'Plus de motifs (app)',
                'Weitere Muster (App)', 'Mais padrões (app)', 'Ещё узоры (приложение)'),
 'lockH': man('お試し版で使える弾幕：', 'Patterns in the trial:', '试玩版可用的弹幕：', '試玩版可用的彈幕：', '체험판에서 쓸 수 있는 탄막:', 'Patrones en la prueba:',
              'Motifs de l’essai :', 'Muster in der Testversion:', 'Padrões no teste:', 'Узоры в пробной версии:'),
 'appRes': man('アプリなら、作ったステージを世界に投稿できて、ランキングと、ずっと多くの弾幕パターンが使えます。',
               'In the app, your stages go out to players worldwide, with rankings and many more patterns.',
               '在 App 中，可以把关卡发布给全世界的玩家，还有排行榜和更多弹幕样式。', '在 App 中，可以把關卡發布給全世界的玩家，還有排行榜和更多彈幕樣式。',
               '앱에서는 만든 스테이지를 전 세계에 공개하고, 랭킹과 훨씬 많은 탄막 패턴을 쓸 수 있습니다.',
               'En la app puedes publicar tus niveles para todo el mundo, con rankings y muchos más patrones.',
               'Dans l’app, tu publies tes niveaux pour le monde entier, avec classements et bien plus de motifs.',
               'In der App veröffentlichst du Level weltweit, mit Ranglisten und vielen weiteren Mustern.',
               'No app, você publica suas fases para o mundo todo, com rankings e muito mais padrões.',
               'В приложении уровни видят игроки со всего мира, есть рейтинги и гораздо больше узоров.'),
 'appBtn': man('アプリを入れる（無料）', 'Get the app (free)', '下载 App（免费）', '下載 App（免費）', '앱 받기 (무료)', 'Descargar la app (gratis)', 'Obtenir l’app (gratuit)',
               'App laden (kostenlos)', 'Baixar o app (grátis)', 'Скачать приложение (бесплатно)'),
 'ctaB': man('アプリ版（無料）でできること', 'What the free app adds', '免费 App 还能做什么', '免費 App 還能做什麼', '무료 앱으로 할 수 있는 것', 'Lo que añade la app gratuita',
             'Ce qu’ajoute l’app gratuite', 'Was die kostenlose App bietet', 'O que o app grátis oferece', 'Что даёт бесплатное приложение'),
 'ctaA': man('App Store で見る', 'See it on the App Store', '在 App Store 查看', '在 App Store 查看', 'App Store에서 보기', 'Ver en la App Store', 'Voir sur l’App Store',
             'Im App Store ansehen', 'Ver na App Store', 'Открыть в App Store'),
 'lockModalH': man('このパターンはアプリで使えます', 'This pattern is in the app', '此样式可在 App 中使用', '此樣式可在 App 中使用', '이 패턴은 앱에서 쓸 수 있습니다',
                   'Este patrón está en la app', 'Ce motif est dans l’app', 'Dieses Muster gibt es in der App', 'Este padrão está no app', 'Этот узор есть в приложении'),
 'later': man('あとで', 'Later', '稍后', '稍後', '나중에', 'Más tarde', 'Plus tard', 'Später', 'Depois', 'Позже'),
 'shareH': man('共有リンク', 'Share link', '分享链接', '分享連結', '공유 링크', 'Enlace para compartir', 'Lien de partage', 'Teilen-Link', 'Link para compartilhar', 'Ссылка'),
 'shareNote': man('このリンクを送ると、相手もブラウザで同じステージを遊べます。', 'Send this link and your friend can play the same stage in their browser.',
                  '发送此链接，对方也能在浏览器中玩同一关卡。', '傳送此連結，對方也能在瀏覽器中玩同一關卡。', '이 링크를 보내면 상대도 브라우저에서 같은 스테이지를 플레이할 수 있습니다.',
                  'Envía este enlace y tu amigo podrá jugar el mismo nivel en su navegador.', 'Envoie ce lien et ton ami pourra jouer au même niveau dans son navigateur.',
                  'Schick diesen Link, dann kann dein Freund dasselbe Level im Browser spielen.', 'Envie este link e seu amigo poderá jogar a mesma fase no navegador.',
                  'Отправьте ссылку — друг сыграет этот уровень в браузере.'),
 'copy': man('コピー', 'Copy', '复制', '複製', '복사', 'Copiar', 'Copier', 'Kopieren', 'Copiar', 'Копировать'),
 'copied': man('コピーしました', 'Copied', '已复制', '已複製', '복사했습니다', 'Copiado', 'Copié', 'Kopiert', 'Copiado', 'Скопировано'),
 'selected': man('選択しました。長押しでコピーしてください。', 'Selected. Press and hold to copy.', '已选中，请长按复制。', '已選取，請長按複製。', '선택했습니다. 길게 눌러 복사하세요.',
                 'Seleccionado. Mantén pulsado para copiar.', 'Sélectionné. Appuie longuement pour copier.', 'Markiert. Zum Kopieren lange drücken.',
                 'Selecionado. Toque e segure para copiar.', 'Выделено. Нажмите и удерживайте, чтобы скопировать.'),
 'close': man('閉じる', 'Close', '关闭', '關閉', '닫기', 'Cerrar', 'Fermer', 'Schließen', 'Fechar', 'Закрыть'),
 'worldCta': man('世界への投稿はアプリで', 'Publish to the world in the app', '发布给全世界请用 App', '發布給全世界請用 App', '전 세계 공개는 앱에서',
                 'Publica para el mundo en la app', 'Publie pour le monde dans l’app', 'Weltweit veröffentlichen in der App', 'Publique para o mundo no app',
                 'Публикация для всего мира — в приложении'),
 'unnamed': man('名無しステージ', 'Untitled stage', '无名关卡', '無名關卡', '이름 없는 스테이지', 'Nivel sin nombre', 'Niveau sans nom', 'Unbenanntes Level', 'Fase sem nome', 'Безымянный уровень'),
 'anon': man('名無し', 'Anonymous', '匿名', '匿名', '익명', 'Anónimo', 'Anonyme', 'Anonym', 'Anônimo', 'Аноним'),
 'sampleBy': man('サンプル', 'Sample', '示例', '範例', '샘플', 'Ejemplo', 'Exemple', 'Beispiel', 'Exemplo', 'Пример'),
 'langLabel': man('言語', 'Language', '语言', '語言', '언어', 'Idioma', 'Langue', 'Sprache', 'Idioma', 'Язык'),
 's1': man('はじめての渦', 'First swirl', '初次漩涡', '初次漩渦', '첫 소용돌이', 'Primer remolino', 'Premier tourbillon', 'Erster Wirbel', 'Primeiro redemoinho', 'Первый вихрь'),
 's2': man('にわか雨', 'Sudden rain', '阵雨', '陣雨', '소나기', 'Chaparrón', 'Averse', 'Regenschauer', 'Pancada de chuva', 'Ливень'),
 's3': man('見てるぞ', 'Watching you', '盯着你', '盯著你', '지켜보고 있다', 'Te estoy viendo', 'Je te vois', 'Ich seh dich', 'Estou de olho', 'Я слежу'),
 's5': man('三段変化のボス', 'Three-phase boss', '三段变化的BOSS', '三段變化的BOSS', '3단 변신 보스', 'Jefe de tres fases', 'Boss en trois phases', 'Dreiphasiger Boss',
           'Chefe de três fases', 'Трёхфазный босс'),
 's4': man('鬼畜・花火大会', 'Fireworks from hell', '地狱烟花大会', '地獄煙火大會', '지옥의 불꽃놀이', 'Fuegos artificiales del infierno', 'Feu d’artifice infernal',
           'Höllenfeuerwerk', 'Fogos do inferno', 'Адский фейерверк'),
}
out = {l: {k: v[l] for k, v in D.items()} for l in LANGS}
js = ('/* 弾幕メーカー ブラウザ版の画面の文言（10 言語）。tools/danmaku-trial-i18n.py が書き出した。手で直さない */\n'
      'window.DM_LANGS = ' + json.dumps(NAMES, ensure_ascii=False) + ';\n'
      'window.DM_I18N = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
open('works/danmaku-maker/try/i18n.js', 'w', encoding='utf8').write(js)
print(f'{len(D)} 個の文言 × {len(LANGS)} 言語を書き出しました（アプリの訳 {len(D) - MANUAL_N} 個、ここで訳した {MANUAL_N} 個、{len(js) // 1024} KB）')
