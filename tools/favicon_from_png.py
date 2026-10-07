#!/usr/bin/env python3
"""用意した 1 枚の PNG（角が丸く透明な、正方形の絵）から、サイトのアイコン一式を作る。

    python3 tools/favicon_from_png.py ~/Downloads/koshinstudio-favicon.png

書くもの:
  favicon.svg            PNG（128px）を埋め込んだ SVG。<head> の指定（/favicon.svg）を変えずに済む。
                         タブに出るのは 16〜64px なので 128px で足りる（大きいと毎ページ重い）
  favicon.ico            16 / 32 / 48 px（古い環境と、/favicon.ico を決め打ちで取りに来る相手のため）
  assets/icon/icon-192.png, icon-512.png   角の丸みを残したもの（web manifest 用）
  assets/icon/icon-180.png                 角の透明を、絵の地の色で埋めた正方形
                                           （iOS のホーム画面は自分で角を丸めるので、透明が残ると黒く出る）
Pillow が要る:  python3 -m pip install --user pillow
元の PNG は配らない（大きいので）。残したいときは、サイトの外に置く。
"""
import base64, io, os, sys
from PIL import Image

SITE = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    src = Image.open(os.path.expanduser(sys.argv[1])).convert('RGBA')
    assert src.size[0] == src.size[1], '正方形の絵が要る'
    w = src.size[0]
    # 絵の地の色は、縁の真ん中の画素から取る（角は透明なので使えない）
    bg = src.getpixel((w // 2, 6))[:3]

    def sized(n):
        return src.resize((n, n), Image.LANCZOS)

    icons = os.path.join(SITE, 'assets', 'icon')
    os.makedirs(icons, exist_ok=True)
    sized(512).save(os.path.join(icons, 'icon-512.png'), optimize=True)
    sized(192).save(os.path.join(icons, 'icon-192.png'), optimize=True)
    flat = Image.new('RGBA', (180, 180), bg + (255,))
    flat.alpha_composite(sized(180))
    flat.convert('RGB').save(os.path.join(icons, 'icon-180.png'), optimize=True)

    ico = [sized(n) for n in (48, 32, 16)]
    ico[0].save(os.path.join(SITE, 'favicon.ico'), format='ICO',
                sizes=[(48, 48), (32, 32), (16, 16)], append_images=ico[1:])

    buf = io.BytesIO()
    sized(128).save(buf, format='PNG', optimize=True)
    b64 = base64.b64encode(buf.getvalue()).decode('ascii')
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 128 128">'
           f'<image width="128" height="128" href="data:image/png;base64,{b64}"/></svg>\n')
    open(os.path.join(SITE, 'favicon.svg'), 'w', encoding='utf-8').write(svg)

    for f in ('favicon.svg', 'favicon.ico', 'assets/icon/icon-180.png', 'assets/icon/icon-192.png', 'assets/icon/icon-512.png'):
        print(f'  {f:28} {os.path.getsize(os.path.join(SITE, f)) / 1024:6.1f} KB')
    print('地の色:', '#%02x%02x%02x' % bg)


if __name__ == '__main__':
    main()
