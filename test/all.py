import time, json
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg = b.new_page(viewport={'width':390,'height':844})
    logs=[]; pg.on('pageerror', lambda e: logs.append('PAGEERROR: '+str(e)))
    pg.route('**/*', lambda r: r.abort() if 'fonts.g' in r.request.url else r.continue_())
    pg.goto('http://127.0.0.1:8765/index.html'); pg.wait_for_function('window.__dg', timeout=20000); time.sleep(1.5)
    pg.evaluate('__dg.setQuality(0)')
    # build every course once and step the physics a little; report anything that throws or starts broken
    res = pg.evaluate('''async () => { const out={n:__dg.ROOMS.length, bad:[], types:{}};
      for (let i=0;i<__dg.ROOMS.length;i++){ try { __dg.startGame(i); const S=__dg.S; S.game.pauseDrain=99;
          for(let k=0;k<25;k++){ S.world.step(1/60); const q=S.deferred; S.deferred=[]; for(const f of q) f(); }
          const d=__dg.ROOMS[i]; out.types[d.gen||'hand']=(out.types[d.gen||'hand']||0)+1;
          const nm=S.props.map(p=>p.name); const exits=nm.filter(n=>['door','glassdoor','steeldoor','vault','shutter'].includes(n)).length; if (S.game.exitOpen || S.props.length<6 || S.game.broken>0 || exits!==1) out.bad.push([d.code, S.game.exitOpen, S.props.length, S.game.broken, exits]);
        } catch(e){ out.bad.push([__dg.ROOMS[i].code, String(e)]); } }
      return out; }''')
    print(json.dumps(res, ensure_ascii=False)[:1500]); print(logs[:5]); b.close()
