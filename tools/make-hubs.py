"""言語ごとの入口ページ（/en/ /es/ /zh/ …）を書き出す。文面はここに持つ。
   node build.mjs が、head（canonical・hreflang・構造化データ）を後から足す。
   ゲームの対応言語に合わせて、書く内容を変える：
     すし積む … 14言語（ブラウザの言語に合わせて開く）
     寝返り将棋 … 日本語・英語
     10秒ピッタリ … 日本語のみ"""
import json, re, html as H
langs = json.load(open('data/langs.json', encoding='utf8'))
src = open('en/notes/itms-91064/index.html', encoding='utf8').read()
head0 = src[:src.index('<main>')]
foot0 = src[src.index('</main>') + len('</main>'):]
foot0 = re.sub(r'<footer class="site">.*?</footer>', '<footer class="site"><div class="wrap"></div></footer>', foot0, flags=re.S)

T = {
 'en': dict(title='Koshin Studio — free browser games and tools', desc='Koshin Studio is a one-person studio making free browser games and small tools, and writing down what it measures. Play in your browser, no install or sign-up.',
  lead='A one-person studio. I build browser games and small apps, and write down what I measure.', h_play='Play', 
  sushi=('Sushi Stack', 'A falling-block puzzle: collide matching sushi toppings to grow them, all the way up to the golden sushi tub. Available in 14 languages, opens in your browser language.'),
  nega=('Negaeri Shogi', 'A 6×6 board game. Pieces you sandwich defect to your side and get promoted, and chains flip many at once. Local, vs AI, and online with ratings. The game is in English and Japanese.'),
  stop=('Stop at 10 seconds', 'Count ten seconds in your head and stop. Best of three; the smaller the error, the stronger you are. No setup, no sign-up. The interface is in Japanese.'),
  h_log='Development logs', log='Measured results and fixes, written up with numbers. These articles are in English and Japanese.', logs=True,
  h_lang='Languages', free='Free. No install, no sign-up.'),
 'zh': dict(title='Koshin Studio — 免费网页游戏与小工具', desc='Koshin Studio 是一人工作室，制作免费的网页游戏和小工具，并记录实测结果。无需安装、无需注册，用浏览器即可游玩。',
  lead='一人工作室。我制作网页游戏和小应用，并把实测的数据记录下来。', h_play='开始游玩',
  sushi=('寿司堆叠（すし積む）', '把相同的寿司料撞在一起让它们成长，最终堆成金色寿司桶的下落式益智游戏。支持14种语言，会按浏览器语言打开。'),
  nega=('倒戈将棋（寝返り将棋）', '6×6 棋盘游戏。被夹住的棋子会倒戈到你这一方并升变，连锁时一次翻转多枚。支持本地双人、对战 AI 和带评分的在线对战。游戏界面为英语和日语。'),
  stop=('10秒整停下（10秒ピッタリ）', '在心里数10秒，然后停下。三局两胜，误差越小越强。无需设置，无需注册。界面为日语。'),
  h_log='开发记录', log='实测结果与修复，附带数字。这些文章为英语和日语。', logs=True, h_lang='语言', free='免费。无需安装，无需注册。'),
 'es': dict(title='Koshin Studio — juegos de navegador gratis y herramientas', desc='Koshin Studio es un estudio de una sola persona que crea juegos de navegador gratuitos y pequeñas herramientas, y anota lo que mide. Sin instalar ni registrarse.',
  lead='Un estudio de una sola persona. Hago juegos de navegador y pequeñas aplicaciones, y anoto lo que mido.', h_play='Jugar',
  sushi=('Sushi Stack (すし積む)', 'Un rompecabezas de bloques que caen: junta ingredientes de sushi iguales para que crezcan hasta llegar al cubo de sushi dorado. Disponible en 14 idiomas; se abre en el idioma de tu navegador.'),
  nega=('Negaeri Shogi (寝返り将棋)', 'Un juego de tablero de 6×6. Las piezas que atrapas entre las tuyas se pasan a tu bando y se promueven, y las cadenas voltean muchas a la vez. Local, contra la IA y en línea con puntuación. El juego está en inglés y japonés.'),
  stop=('Para en 10 segundos (10秒ピッタリ)', 'Cuenta diez segundos en tu cabeza y para. Tres rondas; cuanto menor el error, mejor. Sin configuración ni registro. La interfaz está en japonés.'),
  h_log='Registros de desarrollo', log='Resultados medidos y correcciones, con números. Estos artículos están en inglés y japonés.', logs=True, h_lang='Idiomas', free='Gratis. Sin instalar ni registrarse.'),
 'pt': dict(title='Koshin Studio — jogos de navegador grátis e ferramentas', desc='O Koshin Studio é um estúdio de uma pessoa que faz jogos de navegador gratuitos e pequenas ferramentas, e registra o que mede. Sem instalar nem cadastrar.',
  lead='Um estúdio de uma pessoa só. Faço jogos de navegador e pequenos apps, e anoto o que meço.', h_play='Jogar',
  sushi=('Sushi Stack (すし積む)', 'Um quebra-cabeça de blocos que caem: junte coberturas de sushi iguais para fazê-las crescer até o barril de sushi dourado. Disponível em 14 idiomas; abre no idioma do seu navegador.'),
  nega=('Negaeri Shogi (寝返り将棋)', 'Um jogo de tabuleiro 6×6. As peças que você prende mudam para o seu lado e são promovidas, e as correntes viram várias de uma vez. Local, contra a IA e on-line com pontuação. O jogo está em inglês e japonês.'),
  stop=('Pare em 10 segundos (10秒ピッタリ)', 'Conte dez segundos de cabeça e pare. Melhor de três; quanto menor o erro, melhor. Sem configuração nem cadastro. A interface está em japonês.'),
  h_log='Registros de desenvolvimento', log='Resultados medidos e correções, com números. Estes artigos estão em inglês e japonês.', logs=True, h_lang='Idiomas', free='Grátis. Sem instalar nem cadastrar.'),
 'fr': dict(title='Koshin Studio — jeux de navigateur gratuits et outils', desc='Koshin Studio est un studio d’une seule personne qui crée des jeux de navigateur gratuits et de petits outils, et note ce qu’il mesure. Sans installation ni inscription.',
  lead='Un studio d’une seule personne. Je fabrique des jeux de navigateur et de petites applications, et je note ce que je mesure.', h_play='Jouer',
  sushi=('Sushi Stack (すし積む)', 'Un puzzle de blocs qui tombent : entrechoquez des garnitures de sushi identiques pour les faire grandir jusqu’au tonneau de sushi doré. Disponible en 14 langues ; s’ouvre dans la langue de votre navigateur.'),
  nega=('Negaeri Shogi (寝返り将棋)', 'Un jeu de plateau 6×6. Les pièces que vous encadrez passent de votre côté et sont promues, et les chaînes en retournent beaucoup d’un coup. En local, contre l’IA et en ligne avec classement. Le jeu est en anglais et en japonais.'),
  stop=('Arrêtez à 10 secondes (10秒ピッタリ)', 'Comptez dix secondes dans votre tête, puis arrêtez. Trois manches ; plus l’erreur est petite, mieux c’est. Sans réglage ni inscription. L’interface est en japonais.'),
  h_log='Journaux de développement', log='Résultats mesurés et corrections, avec des chiffres. Ces articles sont en anglais et en japonais.', logs=True, h_lang='Langues', free='Gratuit. Sans installation ni inscription.'),
 'de': dict(title='Koshin Studio — kostenlose Browserspiele und Tools', desc='Koshin Studio ist ein Ein-Personen-Studio, das kostenlose Browserspiele und kleine Tools baut und aufschreibt, was es misst. Ohne Installation und ohne Anmeldung.',
  lead='Ein Ein-Personen-Studio. Ich baue Browserspiele und kleine Apps und schreibe auf, was ich messe.', h_play='Spielen',
  sushi=('Sushi Stack (すし積む)', 'Ein Puzzle mit fallenden Blöcken: Lass gleiche Sushi-Beläge zusammenstoßen, damit sie wachsen – bis zum goldenen Sushi-Fass. In 14 Sprachen verfügbar; öffnet sich in der Sprache deines Browsers.'),
  nega=('Negaeri Shogi (寝返り将棋)', 'Ein Brettspiel auf 6×6 Feldern. Eingeklemmte Figuren laufen zu dir über und werden befördert, und Ketten drehen viele auf einmal um. Lokal, gegen die KI und online mit Wertung. Das Spiel ist auf Englisch und Japanisch.'),
  stop=('Stopp bei 10 Sekunden (10秒ピッタリ)', 'Zähle im Kopf zehn Sekunden und stoppe. Drei Runden; je kleiner der Fehler, desto besser. Keine Einrichtung, keine Anmeldung. Die Oberfläche ist auf Japanisch.'),
  h_log='Entwicklungsprotokolle', log='Gemessene Ergebnisse und Korrekturen, mit Zahlen. Diese Artikel sind auf Englisch und Japanisch.', logs=True, h_lang='Sprachen', free='Kostenlos. Ohne Installation und Anmeldung.'),
 'ru': dict(title='Koshin Studio — бесплатные браузерные игры и инструменты', desc='Koshin Studio — студия из одного человека: бесплатные браузерные игры и небольшие инструменты, а также записи о том, что удалось измерить. Без установки и регистрации.',
  lead='Студия из одного человека. Я делаю браузерные игры и небольшие приложения и записываю то, что измеряю.', h_play='Играть',
  sushi=('Sushi Stack (すし積む)', 'Головоломка с падающими блоками: сталкивайте одинаковые начинки суши, чтобы они росли, вплоть до золотой бочки суши. 14 языков; открывается на языке вашего браузера.'),
  nega=('Negaeri Shogi (寝返り将棋)', 'Настольная игра на поле 6×6. Зажатые фигуры переходят на вашу сторону и повышаются, а цепочки переворачивают сразу много. Локально, против ИИ и онлайн с рейтингом. Игра на английском и японском.'),
  stop=('Остановись на 10 секундах (10秒ピッタリ)', 'Отсчитайте про себя десять секунд и остановитесь. Три попытки; чем меньше ошибка, тем лучше. Без настройки и регистрации. Интерфейс на японском.'),
  h_log='Журналы разработки', log='Измеренные результаты и исправления, с цифрами. Эти статьи на английском и японском.', logs=True, h_lang='Языки', free='Бесплатно. Без установки и регистрации.'),
 'id': dict(title='Koshin Studio — game browser gratis dan alat kecil', desc='Koshin Studio adalah studio satu orang yang membuat game browser gratis dan alat kecil, serta mencatat apa yang diukur. Tanpa instal dan tanpa daftar.',
  lead='Studio satu orang. Saya membuat game browser dan aplikasi kecil, lalu mencatat apa yang saya ukur.', h_play='Main',
  sushi=('Sushi Stack (すし積む)', 'Teka-teki balok jatuh: tabrakkan topping sushi yang sama agar tumbuh, sampai menjadi tong sushi emas. Tersedia dalam 14 bahasa; terbuka dalam bahasa browser Anda.'),
  nega=('Negaeri Shogi (寝返り将棋)', 'Permainan papan 6×6. Bidak yang Anda apit akan berpindah ke pihak Anda dan dipromosikan, dan rantai membalik banyak sekaligus. Lokal, melawan AI, dan online dengan peringkat. Game ini berbahasa Inggris dan Jepang.'),
  stop=('Berhenti di 10 detik (10秒ピッタリ)', 'Hitung sepuluh detik di kepala lalu berhenti. Tiga ronde; makin kecil selisihnya, makin hebat. Tanpa pengaturan, tanpa daftar. Antarmukanya berbahasa Jepang.'),
  h_log='Catatan pengembangan', log='Hasil pengukuran dan perbaikan, lengkap dengan angka. Artikel ini berbahasa Inggris dan Jepang.', logs=True, h_lang='Bahasa', free='Gratis. Tanpa instal dan tanpa daftar.'),
 'ko': dict(title='Koshin Studio — 무료 브라우저 게임과 도구', desc='Koshin Studio는 무료 브라우저 게임과 작은 도구를 만들고, 직접 측정한 결과를 기록하는 1인 스튜디오입니다. 설치도 가입도 필요 없습니다.',
  lead='1인 스튜디오입니다. 브라우저 게임과 작은 앱을 만들고, 직접 잰 것을 기록합니다.', h_play='플레이',
  sushi=('스시 쌓기 (すし積む)', '떨어지는 블록 퍼즐입니다. 같은 스시 토핑끼리 부딪쳐 키우고, 마지막에는 황금 스시통까지 만들어 보세요. 14개 언어를 지원하며 브라우저 언어로 열립니다.'),
  nega=('네가에리 쇼기 (寝返り将棋)', '6×6 보드 게임입니다. 끼인 말은 내 편으로 넘어와 승급하고, 연쇄로 한 번에 많이 뒤집힙니다. 로컬 대전, AI 대전, 레이팅이 있는 온라인 대전을 지원합니다. 게임은 영어와 일본어입니다.'),
  stop=('10초에 딱 멈춰라 (10秒ピッタリ)', '머릿속으로 10초를 세고 멈추세요. 3판 승부이며 오차가 작을수록 강합니다. 설정도 가입도 필요 없습니다. 화면은 일본어입니다.'),
  h_log='개발 기록', log='측정한 결과와 수정 내용을 숫자와 함께 적었습니다. 이 글은 영어와 일본어입니다.', logs=True, h_lang='언어', free='무료. 설치도 가입도 필요 없습니다.'),
 'tr': dict(title='Koshin Studio — ücretsiz tarayıcı oyunları ve araçlar', desc='Koshin Studio, ücretsiz tarayıcı oyunları ve küçük araçlar yapan, ölçtüklerini not eden tek kişilik bir stüdyodur. Kurulum ve üyelik gerekmez.',
  lead='Tek kişilik bir stüdyo. Tarayıcı oyunları ve küçük uygulamalar yapıyor, ölçtüklerimi not ediyorum.', h_play='Oyna',
  sushi=('Sushi Stack (すし積む)', 'Düşen bloklu bir bulmaca: aynı suşi malzemelerini çarpıştırıp büyüt, altın suşi fıçısına kadar. 14 dilde; tarayıcınızın dilinde açılır.'),
  nega=('Negaeri Shogi (寝返り将棋)', '6×6 tahta oyunu. Sıkıştırdığın taşlar senin tarafına geçip terfi eder, zincirler bir anda çok taşı çevirir. Yerel, yapay zekâya karşı ve puanlı çevrimiçi. Oyun İngilizce ve Japonca.'),
  stop=('10 saniyede dur (10秒ピッタリ)', 'Aklından on saniye say ve dur. Üç tur; hata ne kadar küçükse o kadar iyi. Ayar ve üyelik yok. Arayüz Japonca.'),
  h_log='Geliştirme kayıtları', log='Ölçülen sonuçlar ve düzeltmeler, rakamlarla. Bu yazılar İngilizce ve Japonca.', logs=True, h_lang='Diller', free='Ücretsiz. Kurulum ve üyelik yok.'),
}
QUIZ = dict(
 en='12 questions, 6 axes: your anime type and the one anime that fits you right now. Free, nothing is sent anywhere. In English.',
 zh='12 个问题、6 条轴：得出你的动画类型和此刻最适合你的一部动画。免费，不会发送任何数据。英语界面。',
 es='12 preguntas, 6 ejes: tu tipo de anime y el anime que mejor te encaja ahora. Gratis, no se envía nada. En inglés.',
 pt='12 perguntas, 6 eixos: seu tipo de anime e o anime que mais combina com você agora. Grátis, nada é enviado. Em inglês.',
 fr='12 questions, 6 axes : votre type d’anime et l’anime qui vous correspond le mieux en ce moment. Gratuit, rien n’est envoyé. En anglais.',
 de='12 Fragen, 6 Achsen: dein Anime-Typ und der Anime, der gerade am besten zu dir passt. Kostenlos, nichts wird gesendet. Auf Englisch.',
 ru='12 вопросов, 6 осей: ваш тип аниме и то аниме, которое сейчас подходит вам лучше всего. Бесплатно, ничего не отправляется. На английском.',
 id='12 pertanyaan, 6 sumbu: tipe anime Anda dan anime yang paling cocok untuk Anda sekarang. Gratis, tidak ada data yang dikirim. Dalam bahasa Inggris.',
 ko='12개 질문, 6개 축: 나의 애니 타입과 지금 가장 잘 맞는 애니 한 편. 무료이며 아무것도 전송하지 않습니다. 영어로 제공됩니다.',
 tr='12 soru, 6 eksen: anime tipiniz ve şu an size en çok uyan anime. Ücretsiz, hiçbir şey gönderilmez. İngilizce.',
)
import glob as _g
LOGS = []
for _f in sorted(_g.glob('en/notes/*/index.html')):
    _t = open(_f, encoding='utf8').read()
    _h = re.search(r'<h1>(.*?)</h1>', _t, re.S).group(1)
    LOGS.append((_f[:-len('index.html')].replace('en/notes', '/en/notes'), H.unescape(_h)))
e = lambda x: H.escape(x, quote=True)
exec(open('tools/calc-pages-data.py', encoding='utf8').read())
TOOLS_H = dict(en='Tools', zh='工具', es='Herramientas', pt='Ferramentas', fr='Outils', de='Werkzeuge', ru='Инструменты', id='Alat', ko='도구', tr='Araçlar')
for code, L in langs.items():
    t = T[code]
    h = re.sub(r'<title>.*?</title>', f'<title>{e(t["title"])}</title>', head0, flags=re.S)
    h = re.sub(r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{e(t["desc"])}">', h)
    h = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{e(t["title"])}">', h)
    h = re.sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{e(t["desc"])}">', h)
    langlinks = ' · '.join(f'<a href="{l["path"]}" hreflang="{l["lang"]}" lang="{l["lang"]}">{e(l["label"])}</a>' for l in langs.values()) + ' · <a href="/" hreflang="ja" lang="ja">日本語</a>'
    play = f'''  <ul class="plain">
    <li><a href="/play/sushitsumu/">{e(t["sushi"][0])}</a> — {e(t["sushi"][1])} <a href="/en/works/sushitsumu/" hreflang="en" lang="en">(About, English)</a></li>
    <li><a href="/play/negaeri-shogi/">{e(t["nega"][0])}</a> — {e(t["nega"][1])} <a href="/en/works/negaeri-shogi/" hreflang="en" lang="en">(rules, English)</a></li>
    <li><a href="/play/stopwatch10/">{e(t["stop"][0])}</a> — {e(t["stop"][1])} <a href="/en/works/stopwatch10/" hreflang="en" lang="en">(About, English)</a></li>
    <li><a href="/app/shindananime/en/" hreflang="en" lang="en">Anime Type Quiz</a> — {e(QUIZ[code])}</li>
  </ul>'''
    logs = f'''  <h2 class="rv">{e(t["h_log"])}</h2>
  <p>{e(t["log"])}</p>
  <ul class="plain">
''' + '\n'.join(f'    <li><a href="{u}" hreflang="en" lang="en">{e(n)}</a></li>' for u, n in LOGS) + '\n  </ul>\n'
    tools = f'''  <h2 class="rv">{e(TOOLS_H[code])}</h2>
  <ul class="plain">
    <li><a href="{L["path"]}calc/gacha/">{e(PG[code]["g"]["h1"])}</a> — {e(PG[code]["g"]["lead"])}</li>
    <li><a href="{L["path"]}calc/gacha-rate/">{e(PG[code]["r"]["h1"])}</a> — {e(PG[code]["r"]["lead"])}</li>
  </ul>
'''
    main = f'''<main><div class="wrap">
  <h1>Koshin Studio</h1>
  <div class="rule"></div>
  <p class="lead">{e(t["lead"])}</p>
  <p class="note">{e(t["free"])}</p>

  <h2 class="rv">{e(t["h_play"])}</h2>
{play}

{tools}
{logs}
  <h2 class="rv">{e(t["h_lang"])}</h2>
  <p>{langlinks}</p>
</div>
</main>'''
    page = h.replace('<html lang="en">', f'<html lang="{L["lang"]}">')
    import os
    os.makedirs(L['path'].strip('/'), exist_ok=True)
    open(L['path'].strip('/') + '/index.html', 'w', encoding='utf8').write(page + main + foot0)
print('ok', len(langs))
