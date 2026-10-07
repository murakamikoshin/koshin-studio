#!/usr/bin/env python3
"""KOSHIN STUDIO のロゴを、自作の書体「恒紳ポップ」（Koshin Pop）の字形から起こす。

書体: https://github.com/murakamikoshin/Koshin-Font （SIL OFL 1.1）
使うのは K O S H I N T U D の 9 文字だけ。字形の輪郭を SVG の path にして埋め込むので、
サイトは書体ファイルを配らない（ロゴは絵として配る）。

    python3 tools/logotype_pop.py                    # assets/logotype.svg を書く
    python3 tools/logotype_pop.py --out /tmp/x.svg   # 試しに別の所へ書く
    python3 tools/logotype_pop.py --vars "K0 O1 S0 H2 I1 N0 / S1 T0 U2 D1 I0 O1"

--vars は字ごとの跳ね方。0=基本形、1=pop1、2=pop2。上段 / 下段の順。
書体のファイルは、無ければ GitHub から一時フォルダ（サイトの外）へ取ってくる。
fontTools が要る:  python3 -m pip install --user fonttools
"""
import argparse, os, sys, tempfile, urllib.request

FONT_URL = 'https://raw.githubusercontent.com/murakamikoshin/Koshin-Font/HEAD/build/KoshinPop-{w}.ttf'
WORD1, WORD2 = 'KOSHIN', 'STUDIO'
DEFAULT_VARS = 'K0 O1 S0 H2 I1 N0 / S1 T0 U2 D1 I0 O1'
TRACK = 40      # 字間（書体の送り幅に足す）
GAP = 90        # 上段と下段のあいだ
SEAM = 3        # 輪郭に足す細い線。輪郭どうしが接する所に出る継ぎ目を消す


def font_path(weight):
    d = os.path.join(tempfile.gettempdir(), 'koshin-pop')
    os.makedirs(d, exist_ok=True)
    f = os.path.join(d, f'KoshinPop-{weight}.ttf')
    if not os.path.exists(f):
        print('書体を取得:', FONT_URL.format(w=weight), file=sys.stderr)
        urllib.request.urlretrieve(FONT_URL.format(w=weight), f)
    return f


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--weight', default='Black', choices=['Regular', 'Bold', 'Black'])
    ap.add_argument('--vars', default=DEFAULT_VARS)
    ap.add_argument('--out', default=os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'logotype.svg'))
    a = ap.parse_args()

    from fontTools.ttLib import TTFont
    from fontTools.pens.svgPathPen import SVGPathPen
    from fontTools.pens.boundsPen import BoundsPen

    font = TTFont(font_path(a.weight))
    cmap, gs, hmtx = font.getBestCmap(), font.getGlyphSet(), font['hmtx']

    v1, v2 = [s.split() for s in a.vars.split('/')]

    def glyphs(word, vs):
        out = []
        for ch, v in zip(word, vs):
            assert v[0] == ch, f'{ch} に {v} は合わない'
            base = cmap[ord(ch)]
            name = base if v[1] == '0' else f'{base}.pop{v[1]}'
            pen, bp = SVGPathPen(gs), BoundsPen(gs)
            gs[name].draw(pen); gs[name].draw(bp)
            out.append((hmtx[name][0], pen.getCommands(), bp.bounds))
        return out

    g1, g2 = glyphs(WORD1, v1), glyphs(WORD2, v2)

    def layout(gl):
        x, cells = 0, []
        for adv, d, b in gl:
            cells.append((x, adv, f'<path d="{d}"/>', b))
            x += adv + TRACK
        return cells, x - TRACK

    c1, w1 = layout(g1)
    c2, w2 = layout(g2)
    lo1, hi1 = min(b[1] for _, _, b in g1), max(b[3] for _, _, b in g1)
    lo2, hi2 = min(b[1] for _, _, b in g2), max(b[3] for _, _, b in g2)
    h1, h2 = hi1 - lo1, hi2 - lo2
    W = max(w1, w2)
    H = h1 + GAP + h2

    # y 上向きの座標で組んで、<g> で上下を反転する（元のロゴと同じ作り）。
    # 下段は y=0 から、上段はその上に置く。
    base2 = -lo2                  # 下段の基線
    base1 = h2 + GAP - lo1        # 上段の基線
    off1, off2 = (W - w1) / 2, (W - w2) / 2

    def box(x0, base, off, b):
        """字形の範囲を viewBox の座標（y 下向き）で。弾ける粒の出所に使う"""
        X = off + x0 + b[0]
        Y = H - (base + b[3])
        return f'{X:.0f} {Y:.0f} {b[2] - b[0]:.0f} {b[3] - b[1]:.0f}'

    # 位置を決める <g>（transform）と、弾かせる <g class="ks-ch"> は別にする。
    # 同じ <g> に両方を持たせると、弾かせる側が transform を書き換えて、
    # 字が元の位置に戻らなくなる。
    l1 = ''.join(
        f'<g transform="translate({x},0)"><g class="ks-ch" data-box="{box(x, base1, off1, b)}">{inner}</g></g>'
        for x, adv, inner, b in c1)

    masks = ''.join(
        f'\n    <mask id="ksM{i}" maskUnits="userSpaceOnUse" x="0" y="0" width="{W}" height="{H}">'
        f'<g fill="#fff" stroke="#fff" stroke-width="{SEAM}" stroke-linejoin="round" transform="translate(0,{H}) scale(1,-1)">'
        f'<g transform="translate({off2 + x},{base2})">{inner}</g></g></mask>'
        for i, (x, adv, inner, b) in enumerate(c2))
    rects = ''.join(
        f'\n    <g class="ks-ch" data-box="{box(x, base2, off2, b)}"><rect x="{off2 + x - TRACK / 2}" y="{H - h2 - 1}" width="{adv + TRACK}" height="{h2 + 2}"'
        f' fill="url(#ksGrad)" mask="url(#ksM{i})"/></g>'
        for i, (x, adv, inner, b) in enumerate(c2))

    svg = f'''<svg class="ks-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W:.0f} {H:.0f}" role="img" aria-label="Koshin Studio" preserveAspectRatio="xMidYMid meet">
  <defs>
    <!-- 字形は書体「恒紳ポップ」（SIL OFL 1.1）から。tools/logotype_pop.py が書く。
         グラデーションは、字ごとの座標系で解決されると先頭の色しか拾わない。
         だから文字は「マスク」にして、色は矩形の側に塗る（字ごとに分けてあるのは、
         押した字だけを弾けさせるため）。userSpaceOnUse なので、色の繋がりは変わらない。 -->
    <linearGradient id="ksGrad" gradientUnits="userSpaceOnUse" x1="{off2:.0f}" y1="0" x2="{off2 + w2:.0f}" y2="0">
      <stop offset="0%" stop-color="#eef6fc"/><stop offset="24%" stop-color="#9adcf0"/>
      <stop offset="54%" stop-color="#4f95e0"/><stop offset="80%" stop-color="#2a63c4"/>
      <stop offset="100%" stop-color="#7ec8e3"/>
    </linearGradient>
{masks}
  </defs>
  <g class="ks-l1" fill="currentColor" stroke="currentColor" stroke-width="{SEAM}" stroke-linejoin="round" transform="translate(0,{H:.0f}) scale(1,-1)">
    <g transform="translate({off1},{base1})">{l1}</g>
  </g>
  <g class="ks-l2">{rects}
  </g>
</svg>
'''
    out = os.path.normpath(a.out)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    open(out, 'w', encoding='utf-8').write(svg)
    print('書きました:', out, f'({W:.0f}x{H:.0f}, {a.weight}, {a.vars})')


if __name__ == '__main__':
    main()
