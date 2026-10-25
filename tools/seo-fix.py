#!/usr/bin/env python3
"""公開済みの HTML の <title> と説明文を、検索結果で切れない長さ・狙う検索語が入る形に直す。
使い方: python3 tools/seo-fix.py          （変更内容を表示するだけ）
        python3 tools/seo-fix.py --apply  （HTML に書き込む。data/en-seo.json の英語記事ぶんも更新）
英語記事の <title> は、生成スクリプト tools/make-en-note.py が data/en-seo.json を使うので、そちらも同じ値にそろえる。"""
import html, json, re, sys

APPLY = "--apply" in sys.argv
SUFFIX = " — Koshin Studio"

# ---- 手で決めた値: 付いていない所は、説明文を自動で短くする -------------------------------
JA = {
  "/": dict(desc="なんでも、ひとりで挑戦する。無料のブラウザゲーム、トレカの抽選通知アプリ、アニメ診断、Web サイト、3D モデル。作って、試して、書いています。ブラウザで開いたらすぐ動くものを中心に。"),
  "/works/": dict(desc="これまでに作ったものの一覧。無料のブラウザゲーム（落ち物パズル・将棋風ボードゲーム・ドラフトゲームなど）、トレカの抽選通知アプリ、アニメ診断、Web サイト、3D モデル。分野で絞り込めます。"),
  "/picks/": dict(desc="使ったもの・買ったものの感想と、公式の情報だけで比べた記事。ポケカのスリーブ・ローダーの選び方、静的サイトの置き場所、Claude API と Gemini API の比較など。数字には出典と確認した日を付けています。"),
  "/anime/types/": dict(desc="ガチアニメ診断の64タイプの一覧。世界観と後味の組み合わせで4つに分けて、二つ名とタイプコードを並べています。気になるタイプから、診断の中身をたどれます。"),
  "/works/sushitsumu/": dict(title="すし積む｜寿司を合体させて金の桶をめざす無料の落ち物パズル" + SUFFIX,
      desc="シャリから始めて同じネタをぶつけて育てる、江戸前の無料の落ち物パズル（寿司マージゲーム）。ブラウザだけで遊べて、14 言語対応、オンライン番付つき。"),
  "/works/stopwatch10/": dict(title="10秒ぴったり止めるゲーム｜10秒ピッタリで止めろ！（無料）" + SUFFIX,
      desc="10秒ぴったりで止められるか、頭の中で数えて止めるだけの無料ストップウォッチゲーム。3回勝負で、1回あたりの誤差が小さいほど強い。導入も登録も要らないブラウザゲームです。"),
  "/works/negaeri-shogi/": dict(title="寝返り将棋｜挟むと駒が寝返る6×6の将棋風ボードゲーム（無料）" + SUFFIX,
      desc="挟まれた駒は敵に寝返り、出世する。6×6の盤で、持ち駒を打って挟み、連鎖で一気に裏返す無料の対戦ゲーム。AI 対戦、2人対戦、レーティングつきのオンライン対戦。ブラウザだけで遊べます。"),
  "/works/torecadash/": dict(title="トレカダッシュ｜ポケカ・トレカの抽選・予約・再販を通知する iPhone アプリ" + SUFFIX,
      desc="ポケカをはじめトレカの抽選・予約・先着販売の情報を、店舗やジャンルごとにまとめて通知する iPhone アプリ（無料）。締切カレンダーと応募の記録つき。App Store で配信中です。"),
  "/works/draft-party/": dict(title="ドラフトゲーム・ドラフトシミュレーター｜ドラフト会議ごっこ" + SUFFIX,
      desc="友達とも知らない人とも遊べる無料のドラフトゲーム（ドラフトシミュレーター）。自分の選手を育てて、1巡目の入札・くじ引き・入団交渉まで。数年後の成績や選手の人生、世界ランキングも。"),
  "/notes/tcg-lottery-app-compare/": dict(title="ポケカ・トレカ抽選アプリ比較【2026年10月】トレカダッシュ・トレゲト・NowPokecaの違い" + SUFFIX,
      desc="ポケカ・トレカの抽選・予約・再販を追う抽選アプリ・サイトを、同じ項目で比較。ジャンル数・通知・地図・料金を表にして、トレカダッシュ（15ジャンル、抽選受付中の店舗を地図表示）のメリットとデメリットも書いた。作者による比較。"),
}
EN = {
  "/en/privacy/": dict(desc="What Koshin Studio stores (ranking names, online game ratings), what it does not collect, how comments and analytics work, and how to request deletion."),
  "/en/about/": dict(desc="Koshin Studio is a one-person studio making free browser games and small apps, and writing down what it measures. How I work, my tools, and how to contact me."),
  "/en/calc/gacha-rate/": dict(title="Gacha Drop Rate & Pity Calculator — How Many Pulls? | Koshin Studio",
      desc="Enter a gacha drop rate (%) to see how many pulls it takes. Supports several copies and pity (guaranteed after N pulls). Average, the 90% mark, and cost."),
  "/en/calc/gacha/": dict(title="Gacha Complete-Set Calculator: Pulls to Collect All | Koshin Studio",
      desc="How many pulls (and how much money) to collect every type in a gacha or capsule machine. Average, the 90% mark, and whether a complete set is worth it."),
  "/en/calc/lottery/": dict(title="Lottery Win Chance Calculator — Entries Until You Win | Koshin Studio",
      desc="Work out your chance of winning at least one lottery from the odds and number of entries. Handles different odds per store, with trading-card lotteries in mind."),
  "/en/notes/interval-vs-delivery/": dict(title="A 1-minute monitor checked each item only every 10 minutes"),
  "/en/notes/negaeri-balance/": dict(title="Balancing Negaeri Shogi rules with AI-vs-AI playtests"),
  "/en/notes/leaked-value/": dict(title="“Just a Beyblade” products returned after I added a gate"),
  "/en/notes/misdiagnosis-down/": dict(title="“Server down, cannot recover” was wrong: only SSH was blocked"),
  "/en/notes/geocode-shizuoka/": dict(title="Google Places search returned Shizuoka for ambiguous store names"),
  "/en/notes/destination-check/": dict(title="Checking 1,000+ link destinations of displayed articles"),
  "/en/notes/same-page-not-same-store/": dict(title="Same application page ≠ same store: a store-merge bug"),
  "/en/notes/budget-starved/": dict(title="“Deferred to next run” checks had never run: a time-budget bug"),
  "/en/notes/truncated-answer/": dict(title="An AI answer cut at 200 tokens failed every run"),
  "/en/notes/itms-91064/": dict(title="ITMS-91064 Invalid Binary: NSPrivacyTracking fix",
      desc="An iOS build was rejected with ITMS-91064: NSPrivacyTracking was true while NSPrivacyTrackingDomains was empty. How it was fixed, and what is not verified."),
  "/en/works/torecadash/": dict(desc="An iPhone app that gathers lottery, pre-order and first-come sales of trading cards from stores across Japan, with a deadline calendar and alerts."),
  "/en/works/sushitsumu/": dict(desc="Sushi Stack is a free browser merge puzzle. Drop rice, merge matching toppings up 11 tiers to the golden sushi tub. Online ranking, 14 languages, no sign-up."),
  "/en/works/shindananime/": dict(title="Anime Type Quiz (12 questions) — find your anime | Koshin Studio",
      desc="A free anime quiz. Answer 12 questions (up to 50) to get your anime type from 6 axes and a nickname, plus your destined anime from over 6,000 real titles."),
  "/en/works/stopwatch10/": dict(desc="A free browser game: press start and count ten seconds in your head, with no numbers or sound. Three modes, millisecond precision, and a fair daily ranking."),
  "/en/works/negaeri-shogi/": dict(title="Negaeri Shogi: Free 6×6 Board Game, Pieces Defect | Koshin Studio",
      desc="A free 6×6 browser board game: sandwiched pieces defect to your side and get promoted, and chains flip many at once. Play locally, vs AI, or online."),
}

def trim(desc, limit=160):
    """英語の説明文を、文の切れ目（なければ、読点・語の切れ目）で limit 字以内にする"""
    if len(desc) <= limit: return desc
    cut = desc[:limit]
    for sep in (". ", "; ", ": "):
        i = cut.rfind(sep)
        if i > 70: return cut[:i + (1 if sep == ". " else 0)].rstrip(";: ") + ("" if sep == ". " else ".")
    i = max(cut.rfind(", "), cut.rfind(" "))
    return cut[:i].rstrip(",;: ") + "…"

def read(path): return open(path, encoding="utf8").read()

def set_tag(s, pat, value):
    new = re.sub(pat, lambda m: m.group(1) + html.escape(value, quote=True) + m.group(2), s, count=1, flags=re.S)
    return new

def fix_page(url, title=None, desc=None):
    path = url.lstrip("/") + "index.html"
    s = read(path)
    old_t = html.unescape(re.search(r"<title>(.*?)</title>", s, re.S).group(1)).strip()
    old_d = html.unescape((re.search(r'<meta name="description" content="(.*?)"', s, re.S) or [None, ""])[1]).strip()
    if title is None: title = old_t
    if desc is None: desc = trim(old_d)
    if title == old_t and desc == old_d: return None
    for pat, v in ((r"(<title>)(.*?)(</title>)", title),):
        s = re.sub(r"(<title>).*?(</title>)", lambda m: m.group(1) + html.escape(title, quote=False) + m.group(2), s, count=1, flags=re.S)
    for name, v in (("title", title), ("description", desc)):
        s = set_tag(s, rf'(<meta property="og:{name}" content=")[^"]*(")', v)
        s = set_tag(s, rf'(<meta name="twitter:{name}" content=")[^"]*(")', v)
    s = set_tag(s, r'(<meta name="description" content=")[^"]*(")', desc)
    return path, s, (old_t, title, old_d, desc)

changes = []
rows = json.load(open("/private/tmp/claude-501/-Users-murakami-Desktop-koshinstudio-koshin-studio/9d170c40-d732-405d-9b8e-8851a5971f41/scratchpad/audit.json"))
targets = {**{u: v for u, v in JA.items()}, **{u: v for u, v in EN.items()}}
# 説明文が170字を超える英語ページは、手で決めていなくても自動で短くする（160字台までは検索結果で問題ない）
for r in rows:
    if r["url"].startswith("/en/") and len(r["desc"]) > 170 and r["url"] not in targets: targets[r["url"]] = {}
for url, v in targets.items():
    res = fix_page(url, v.get("title"), v.get("desc"))
    if res: changes.append((url, res))
for url, (path, s, (ot, nt, od, nd)) in changes:
    print(f"\n{url}")
    if ot != nt: print(f"  T: {ot}\n  → {nt}  ({len(nt)})")
    if od != nd: print(f"  D: {od}\n  → {nd}  ({len(nd)})")
print(f"\n変更 {len(changes)} ページ")
if APPLY:
    for url, (path, s, _) in changes: open(path, "w", encoding="utf8").write(s)
    seo = json.load(open("data/en-seo.json", encoding="utf8"))
    for url, (path, s, (ot, nt, od, nd)) in changes:
        m = re.match(r"/en/notes/([^/]+)/$", url)
        if m and m.group(1) in seo:
            nt_clean = nt[:-len(SUFFIX)] if nt.endswith(SUFFIX) else nt
            seo[m.group(1)] = {**seo[m.group(1)], "title": nt_clean, "desc": nd}
    open("data/en-seo.json", "w", encoding="utf8").write(json.dumps(seo, ensure_ascii=False, indent=2) + "\n")
    print("書き込みました")
