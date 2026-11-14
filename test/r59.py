import time, json, sys
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    br = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg = br.new_page(viewport={'width':390,'height':844})
    logs=[]; pg.on('pageerror', lambda e: logs.append('PAGEERROR: '+str(e)))
    pg.route('**/*', lambda r: r.abort() if 'fonts.g' in r.request.url else r.continue_())
    pg.goto('http://127.0.0.1:8765/index.html'); pg.wait_for_function('window.__dg', timeout=20000); time.sleep(1.5)
    pg.evaluate('__dg.setQuality(0)'); pg.add_script_tag(content=open('bot.js').read())
    for i in ([int(x) for x in sys.argv[2].split(',')] if sys.argv[1]=='L' else range(int(sys.argv[1]),int(sys.argv[2]),int(sys.argv[3]) if len(sys.argv)>3 else 1)):
        r=pg.evaluate(f'BOT({i})'); c=r['careful']; s=r['smart']
        print(r['code'], r['sig'].get('rules'), r['plan']['exitKind'], 'F',r['plan']['frontN'],'B',r['plan']['backN'], '| careful', c.get('moves') if c['ok'] else 'FAIL:'+c['why'], '| smart', s.get('moves') if s['ok'] else 'FAIL:'+s['why'])
    print(logs[:5]); br.close()
