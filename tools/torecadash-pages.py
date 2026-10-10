#!/usr/bin/env python3
"""トレカダッシュの外国語の紹介ページを作る。
   data/torecadash-pages.json（言語ごとの文面）→ <言語>/works/torecadash/index.html と、
   data/en.json の alt（hreflang の組）。そのあと node build.mjs で head と sitemap を組む。
   文面を直すときは JSON を直して、これを流し、build.mjs を流す。"""
import json,os,re
HERE=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP='https://apps.apple.com/jp/app/id6788758920'
ST='https://cardalerthub.web.app'
# 言語コード: (パス, og:locale, 表示名, 入口(crumbの行き先))
LANGS={
 'en':('/en/works/torecadash/','en_US','English','/en/'),
 'zh-Hans':('/zh/works/torecadash/','zh_CN','简体中文','/zh/'),
 'zh-Hant':('/zh-hant/works/torecadash/','zh_TW','繁體中文','/en/'),
 'vi':('/vi/works/torecadash/','vi_VN','Tiếng Việt','/en/'),
 'ko':('/ko/works/torecadash/','ko_KR','한국어','/ko/'),
 'th':('/th/works/torecadash/','th_TH','ไทย','/en/'),
 'id':('/id/works/torecadash/','id_ID','Bahasa Indonesia','/id/'),
 'es':('/es/works/torecadash/','es_ES','Español','/es/'),
 'pt-BR':('/pt/works/torecadash/','pt_BR','Português','/pt/'),
 'fr':('/fr/works/torecadash/','fr_FR','Français','/fr/'),
 'de':('/de/works/torecadash/','de_DE','Deutsch','/de/'),
 'ru':('/ru/works/torecadash/','ru_RU','Русский','/ru/'),
 'tr':('/tr/works/torecadash/','tr_TR','Türkçe','/tr/'),
}
JA='/works/torecadash/'
data=json.load(open(HERE+'/data/torecadash-pages.json',encoding='utf-8'))
def other_links(skip):
    items=[('ja',JA,'日本語')]+[(l,p,n) for l,(p,_,n,_) in LANGS.items()]
    return ' / '.join(f'<a href="{p}" hreflang="{l}" lang="{l}">{n}</a>' for l,p,n in items if l!=skip)
def page(code):
    c=data[code]; path,locale,_,home=LANGS[code]
    feats=''.join(f'  <h3>{h}</h3>\n  <p>{t}</p>\n' for h,t in c['feats'])
    pro=''.join(f'    <li>{x}</li>\n' for x in c['pro'])
    know=''.join(f'    <li>{x}</li>\n' for x in c['know'])
    faq=''.join(f'  <h3>{q}</h3>\n  <p>{a}</p>\n' for q,a in c['faq'])
    return f'''<!doctype html>
<html lang="{code}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{c['title']}</title>
<meta name="description" content="{c['desc']}">
<meta name="apple-itunes-app" content="app-id=6788758920">
<meta property="og:title" content="{c['h1']}">
<meta property="og:description" content="{c['og']}">
<meta property="og:type" content="website">
<meta name="theme-color" content="#fbfaf7">
<script>document.documentElement.className+=" js"</script>
<link rel="stylesheet" href="/style.css?v=7001672f">
<meta property="og:image" content="https://koshinstudio.com/assets/torecadash-square@2x.jpg">
<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
</head>
<body>
<canvas id="motes"></canvas>

<header class="site"><div class="wrap">
  <a class="logo" href="/"><img class="logo-mark" src="/favicon.svg?v=b9d7922f" alt="" width="28" height="28">Koshin Studio</a>
  <nav><a href="/works/">Works</a><a href="/notes/">Notes</a><a href="/picks/">Picks</a><a href="/calc/">Tools</a><a href="/about/">About</a></nav>
</div></header>

<main><div class="wrap">
  <nav class="crumbs" aria-label="Breadcrumb"><a href="{home}">Koshin Studio</a><i aria-hidden="true">›</i><span aria-current="page">{c['h1']}</span></nav>
  <h1>{c['h1']}</h1>
  <div class="rule"></div>
  <p class="note">{c['other']}: {other_links(code)}</p>
  <p class="lead">{c['lead']}</p>

  <p><a class="btn" href="{APP}" rel="noopener">{c['btn']}</a></p>
  <p class="note">{c['free']}</p>

  <h2 class="rv">{c['s_what']}</h2>
  <p>{c['p_what']}</p>

  <h2 class="rv">{c['s_feat']}</h2>
{feats}
  <h2 class="rv">{c['s_games']}</h2>
  <p>{c['p_games']}</p>

  <h2 class="rv">{c['s_pro']}</h2>
  <ul>
{pro}  </ul>

  <h2 class="rv">{c['s_know']}</h2>
  <ul>
{know}  </ul>

  <h2 class="rv">{c['s_faq']}</h2>
{faq}
  <p style="margin-top:40px"><a class="btn" href="{APP}" rel="noopener">{c['btn']}</a></p>
  <p class="note"><a href="{ST}/support.html" rel="noopener">Support</a> / <a href="{ST}/terms.html" rel="noopener">Terms</a> / <a href="{ST}/privacy.html" rel="noopener">Privacy</a></p>
</div>
</main>

<footer class="site"><div class="wrap"></div></footer>
<script src="/motion.js?v=1e7447ec" defer></script>
</body>
</html>
'''
for code in LANGS:
    path=LANGS[code][0].strip('/')
    os.makedirs(HERE+'/'+path,exist_ok=True)
    open(HERE+'/'+path+'/index.html','w',encoding='utf-8').write(page(code))
# en.json
p=HERE+'/data/en.json'
arr=json.load(open(p,encoding='utf-8'))
arr=[x for x in arr if x.get('en')!=LANGS['en'][0]]
alt={}
for code,(path,locale,_,_) in LANGS.items():
    if code=='en': continue
    alt[code]={'path':path,'locale':locale,'title':data[code]['title'],'blurb':data[code]['desc']}
arr.append({'ja':JA,'en':LANGS['en'][0],'title':data['en']['title'],'date':'2026-10-10','blurb':data['en']['desc'],
            'app':APP,'cover':'/assets/torecadash-square@2x.jpg','alt':alt})
json.dump(arr,open(p,'w',encoding='utf-8'),ensure_ascii=False,indent=2); open(p,'a').write('\n')
# 日本語ページの「ほかの言語」の行を更新
jp=HERE+'/works/torecadash/index.html'
s=open(jp,encoding='utf-8').read()
new='  <p class="note">Other languages: '+' / '.join(f'<a href="{p_}" hreflang="{l}" lang="{l}">{n}</a>' for l,(p_,_,n,_) in LANGS.items())+'</p>\n'
s2=re.sub(r'  <p class="note">Other languages: .*?</p>\n',lambda m:new,s,count=1,flags=re.S)
open(jp,'w',encoding='utf-8').write(s2)
print('pages:',len(LANGS))
