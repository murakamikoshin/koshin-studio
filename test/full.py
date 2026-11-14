import time, json, sys
from playwright.sync_api import sync_playwright
a,b,out=int(sys.argv[1]),int(sys.argv[2]),sys.argv[3]
with sync_playwright() as p:
    br = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg = br.new_page(viewport={'width':390,'height':844})
    pg.route('**/*', lambda r: r.abort() if 'fonts.g' in r.request.url else r.continue_())
    pg.goto('http://127.0.0.1:8765/index.html'); pg.wait_for_function('window.__dg', timeout=20000); time.sleep(1.5)
    pg.evaluate('__dg.setQuality(0); window.BOT_TRIES=1'); pg.add_script_tag(content=open('bot.js').read())
    f=open(out,'a')
    done=set(json.loads(l)['i'] for l in open(out)) if True else set()
    for i in ([int(x) for x in open(sys.argv[4]).read().split(',')] if len(sys.argv)>4 else range(a,b)):
        if i in done: continue
        try: r=pg.evaluate(f'BOT({i})')
        except Exception as e: r={'code':'?','err':str(e)[:200]}
        r['i']=i; f.write(json.dumps(r,ensure_ascii=False)+'\n'); f.flush()
    br.close()
