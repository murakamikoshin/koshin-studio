/* ============================================================
   Koshin Studio — 動き

   使っているもの（すべて vendor/ に置いた自前配信。外部 CDN に繋がない）
     GSAP + ScrollTrigger … 立ち上がりの筋書きと、スクロール連動
     Lenis                … 滑らかなスクロール
   粒と、ロゴの周りを回る札は、軽さのために手書きの canvas / transform。

   動きを嫌う設定（prefers-reduced-motion）なら、全部止めて静止画にする。
   ============================================================ */
(function () {
  'use strict';
  /* 常に白の地（style.css の末尾と対）。紺に戻すときは true */
  var DARK = false;
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var G = window.gsap;
  if (G && window.ScrollTrigger) G.registerPlugin(window.ScrollTrigger);

  /* ---------- 滑らかなスクロール ---------- */
  /* 2026-10-07 止めた：標準のスクロールのほうが、読む人の手に合う。
     取りこぼしの原因にもなっていた（下の「現れ方」の注を参照） */
  if (false && window.Lenis && !calm && !('ontouchstart' in window)) {
    /* 1.05 秒は長すぎた。ホイールを一回まわすたび、
       止まるまで 1 秒かかって「もっさり」の元になっていた。
       0.45 秒なら、滑らかさは残しつつ、指の動きに追いつく */
    var lenis = new window.Lenis({ duration: 0.45, smoothWheel: true });
    if (G) {
      lenis.on('scroll', window.ScrollTrigger.update);
      G.ticker.add(function (t) { lenis.raf(t * 1000); });
      G.ticker.lagSmoothing(0);
    } else {
      requestAnimationFrame(function r(t) { lenis.raf(t); requestAnimationFrame(r); });
    }
  }

  /* ---------- 立ち上がり ---------- */
  var lock = document.querySelector('.lockup');
  if (G && lock && !calm) {
    var tl = G.timeline({ defaults: { ease: 'power3.out' } });
    tl.from('.ks-l1', { yPercent: -22, opacity: 0, duration: 1.15 })
      .from('.ks-l2', { yPercent: 22, opacity: 0, duration: 1.15 }, '-=0.95')
      .to('.hairline', { width: 'min(280px, 62%)', duration: .9, ease: 'power2.inOut' }, '-=0.5')
      .from('.tagline', { y: 16, opacity: 0, duration: .8 }, '-=0.55')
      .from('.hero-act > *', { y: 20, opacity: 0, duration: .7, stagger: .09 }, '-=0.45')
      .from('.cue', { opacity: 0, duration: .7 }, '-=0.3')
      .from('.orb', { scale: .25, opacity: 0, duration: 1.15, stagger: { each: .07, from: 'random' },
                      ease: 'back.out(1.5)' }, 0.35);
  } else {
    var hl = document.querySelector('.hairline');
    if (hl) hl.style.width = 'min(280px, 62%)';
  }

  /* ---------- 小さい画面の品書き ---------- */
  (function () {
    var hd = document.querySelector('header.site .wrap');
    var nav = hd && hd.querySelector('nav');
    if (!nav || hd.querySelector('.menu-btn')) return;
    var btn = document.createElement('button');
    btn.className = 'menu-btn';
    btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'sitenav');
    btn.innerHTML = '<span></span><span></span><span></span><i class="sr">品書きを開く</i>';
    nav.id = 'sitenav';
    hd.appendChild(btn);
    function set(open) {
      document.body.classList.toggle('nav-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      btn.querySelector('i').textContent = open ? '品書きを閉じる' : '品書きを開く';
    }
    /* 品書きの後ろに敷く暗幕。押したら閉じる。
       header は backdrop-filter を持っていて、その中に置くと
       位置の基準が header になってしまうので body に付ける */
    var scrim = document.createElement('div');
    scrim.className = 'nav-scrim';
    scrim.setAttribute('aria-hidden', 'true');
    document.body.appendChild(scrim);
    scrim.addEventListener('click', function () { set(false); });

    btn.addEventListener('click', function () {
      set(!document.body.classList.contains('nav-open'));
    });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 620) set(false);
    });
  })();

  /* ---------- 現れ方 ----------
     ここは GSAP に任せない。Lenis と混ざると、条件次第で永久に現れない
     ことがある（自動検査で 89 か所出た）。素の IntersectionObserver と
     CSS の遷移だけで動かし、最後に取りこぼしを拾う保険も置く。 */
  var rv = document.querySelectorAll('.rv');
  function show(el) {
    var d = Number(el.getAttribute('data-delay')) || 0;
    if (calm || d === 0) el.classList.add('on');
    else setTimeout(function () { el.classList.add('on'); }, d);
  }
  if (calm || !('IntersectionObserver' in window)) {
    for (var i = 0; i < rv.length; i++) rv[i].classList.add('on');
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { show(e.target); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
    for (var j2 = 0; j2 < rv.length; j2++) io.observe(rv[j2]);
    /* 保険：画面に入っているのに現れていないものを、定期的に拾う */
    setInterval(function () {
      for (var k = 0; k < rv.length; k++) {
        var el = rv[k];
        if (el.classList.contains('on')) continue;
        var b = el.getBoundingClientRect();
        if (b.top < window.innerHeight + 80 && b.bottom > -80) show(el);
      }
    }, 900);
    /* 最後の砦：読み込みから 6 秒たったら、残りは全部出す */
    setTimeout(function () {
      for (var m = 0; m < rv.length; m++) rv[m].classList.add('on');
    }, 6000);
  }

  /* ---------- 代表作の絵：スクロールで奥行きを出す ---------- */
  if (G && window.ScrollTrigger && !calm) {
    var media = document.querySelector('.feat-media');
    if (media) {
      G.fromTo(media, { scale: 1.14, yPercent: -4 }, {
        scale: 1, yPercent: 0, ease: 'none',
        scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: .6 }
      });
    }
    /* 数字を数え上げる */
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var to = Number(el.getAttribute('data-count')) || 0, o = { v: 0 };
      G.to(o, {
        v: to, duration: 1.5, ease: 'power2.out',
        onUpdate: function () { el.textContent = Math.round(o.v).toLocaleString('ja-JP'); },
        scrollTrigger: { trigger: el, start: 'top 86%', once: true }
      });
    });
    /* 締めの一行は .rv に任せる（GSAP と二重にかけると出なくなる） */
  } else {
    document.querySelectorAll('[data-count]').forEach(function (el) {
      el.textContent = Number(el.getAttribute('data-count')).toLocaleString('ja-JP');
    });
  }

  /* ---------- ロゴの周りを回る札 ---------- */
  var orbit = document.getElementById('orbit');
  if (orbit) {
    var orbs = [].slice.call(orbit.querySelectorAll('.orb'));
    var n = orbs.length, ang = 0, spin = 1, hover = false;
    var lockEl = document.querySelector('.lockup');
    function place(now) {
      var box = orbit.getBoundingClientRect();
      var lb = lockEl ? lockEl.getBoundingClientRect() : { width: 0, height: 0 };
      var cw = orbs[0] ? orbs[0].offsetWidth : 120;
      var ch = orbs[0] ? orbs[0].offsetHeight : 150;
      /* ロゴの箱（札の半分ぶん膨らませたもの）。ここへは入れない */
      var Wc = lb.width / 2 + cw / 2 + 26;
      var Hc = lb.height / 2 + ch / 2 + 34;
      var rxCap = box.width / 2 - cw / 2 - 8;
      var ryCap = box.height / 2 - ch / 2 - 6;

      /* 輪がロゴを避けきれないほど狭い画面では、横に流れる帯にする */
      if (rxCap < Wc) {
        orbit.classList.add('strip');
        if (!calm) ang += 0.00055 * spin;
        var span = n * (cw + 22);
        for (var m = 0; m < n; m++) {
          var u = ((m / n + ang) % 1 + 1) % 1;
          var px2 = u * span - span / 2;
          /* 端で消えないよう、はみ出したぶんを反対側へ回す */
          var half = box.width / 2 + cw;
          while (px2 > half) px2 -= span;
          while (px2 < -half) px2 += span;
          var edge = Math.min(1, (box.width / 2 + cw / 2 - Math.abs(px2)) / (cw * 1.1));
          var e2 = orbs[m];
          e2.style.transform = 'translate3d(' + px2.toFixed(1) + 'px,' +
            (-box.height / 2 + ch / 2 + 4 + Math.sin(now / 1500 + m) * 4).toFixed(1) + 'px,0) scale(' +
            (0.86 + 0.1 * Math.max(0, edge)).toFixed(3) + ')';
          e2.style.opacity = Math.max(0, Math.min(1, edge)).toFixed(3);
          e2.style.zIndex = '20';
          e2.style.filter = 'none';
        }
        return;
      }

      orbit.classList.remove('strip');
      var rx = Math.min(rxCap, Math.max(box.width * 0.30, Wc));
      var ry = Math.min(ryCap, Math.max(box.height * 0.22, Hc));
      if (!calm) ang += 0.0022 * spin;
      for (var i = 0; i < n; i++) {
        var a = ang + (i / n) * Math.PI * 2;
        var z = Math.cos(a);
        var x = Math.sin(a) * rx;
        var y = -z * ry;
        y += Math.sin(now / 1400 + i) * 5;
        if (Math.abs(x) < Wc && Math.abs(y) < Hc) {
          var need = Math.min(Wc / Math.max(1, Math.abs(x)), Hc / Math.max(1, Math.abs(y)));
          x *= need; y *= need;
        }
        x = Math.max(-rxCap, Math.min(rxCap, x));
        y = Math.max(-ryCap, Math.min(ryCap, y));
        /* 枠に収めるための切り詰めで、せっかく外へ出した札が
           またロゴの上に戻ることがある。字に札が重なると、
           どちらも読めなくなる。余裕のある側の軸で、もう一度外へ出す */
        if (Math.abs(x) < Wc && Math.abs(y) < Hc) {
          var roomY = ryCap >= Hc, roomX = rxCap >= Wc;
          if (roomY && (!roomX || Math.abs(y) / Hc >= Math.abs(x) / Wc)) {
            y = (y < 0 ? -1 : 1) * Hc;
          } else if (roomX) {
            x = (x < 0 ? -1 : 1) * Wc;
          } else {
            y = (y < 0 ? -1 : 1) * ryCap;
          }
        }
        var s2 = 0.58 + 0.42 * (z + 1) / 2;
        var o = 0.26 + 0.74 * (z + 1) / 2;
        var el = orbs[i];
        el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + s2.toFixed(3) + ')';
        el.style.opacity = o.toFixed(3);
        el.style.zIndex = String(20 + Math.round(z * 28));
        el.style.filter = z < -0.1 ? 'blur(' + ((-z - 0.1) * 2.6).toFixed(2) + 'px)' : 'none';
      }
    }
    orbit.addEventListener('pointerenter', function () { hover = true; }, true);
    orbit.addEventListener('pointerleave', function () { hover = false; }, true);
    (function loop(t) {
      requestAnimationFrame(loop);
      spin += ((hover ? 0.22 : 1) - spin) * 0.06;
      place(t || 0);
    })(0);
  }

  /* ---------- ロゴを押すと弾ける ---------- */
  (function () {
    var xl = document.querySelector('.logo-xl');
    if (!xl) return;
    xl.style.pointerEvents = 'auto';
    xl.style.cursor = 'pointer';
    var bc = document.createElement('canvas');
    bc.id = 'burst';
    document.body.appendChild(bc);
    var bx = bc.getContext('2d'), bits = [], bw = 0, bh = 0, bd = 1;
    function bsize() {
      bd = Math.min(2, window.devicePixelRatio || 1);
      bw = window.innerWidth; bh = window.innerHeight;
      bc.width = Math.round(bw * bd); bc.height = Math.round(bh * bd);
      bx.setTransform(bd, 0, 0, bd, 0, 0);
    }
    bsize(); window.addEventListener('resize', bsize);
    var COL = DARK ? ['#7ec8e3', '#b9e6f5', '#e9eef6', '#2f6fd0', '#c8d6e6']
                   : ['#2f6fd0', '#4f95e0', '#1b6aa3', '#7ec8e3', '#173d82'];
    /* 弾けるのは押した一字だけ。ロゴ全体を揺らすと、
       どこを押しても同じに見えて、押した手応えが消える */
    var chars = [].slice.call(xl.querySelectorAll('.ks-ch'));

    function pop(cx, cy, n) {
      for (var i = 0; i < n; i++) {
        var a = Math.random() * 6.2832, v = 2.4 + Math.random() * 8.2;
        bits.push({ x: cx, y: cy, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2.2,
          r: 1.1 + Math.random() * 3.2, life: 1,
          c: COL[(Math.random() * COL.length) | 0], sp: Math.random() * 6.28 });
      }
    }

    /* その字の形（path）を探す。上段は字そのもの。下段は「字＝マスク」なので、
       矩形が指しているマスクの中の path が字の形 */
    function glyphPath(ch) {
      var path = ch.querySelector('path');
      if (path) return path;
      var rect = ch.querySelector('rect');
      var m = rect && /url\(#([^)]+)\)/.exec(rect.getAttribute('mask') || '');
      return m ? document.querySelector('#' + m[1] + ' path') : null;
    }

    /* 字の輪郭の上から、外へ向かって散らす。中心から出すと、「O」のように
       真ん中が空いた字では、字ではない所から出たように見える。
       輪郭の長さに沿って点を選び（getPointAtLength）、その画面上の位置から、
       字の中心と反対の向き（ばらつきあり）へ飛ばす */
    function popFromGlyph(ch, n) {
      var path = glyphPath(ch), box = boxOf(ch);
      var ccx = box.left + box.width / 2, ccy = box.top + box.height / 2;
      var m = path && path.getScreenCTM && path.getScreenCTM();
      var L = path && path.getTotalLength ? path.getTotalLength() : 0;
      if (!m || !L) { pop(ccx, ccy, n); return; }
      for (var i = 0; i < n; i++) {
        var pt = path.getPointAtLength(Math.random() * L);
        var x = m.a * pt.x + m.c * pt.y + m.e, y = m.b * pt.x + m.d * pt.y + m.f;
        var a = Math.atan2(y - ccy, x - ccx) + (Math.random() - .5) * 1.6;
        var v = 2.0 + Math.random() * 7.0;
        bits.push({ x: x, y: y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 1.6,
          r: 1.1 + Math.random() * 3.2, life: 1,
          c: COL[(Math.random() * COL.length) | 0], sp: Math.random() * 6.28 });
      }
    }

    /* 字の範囲（画面の座標）。ロゴの SVG は、字形そのものの範囲を data-box
       （viewBox の座標）で持っている。下段は「字＝マスク」なので、
       要素の枠（矩形）は字より大きい。字形の範囲から計算すると、
       粒が字の真ん中から出る。data-box が無い SVG は、要素の枠で代用する */
    function boxOf(el) {
      var d = el.getAttribute('data-box'), svg = el.ownerSVGElement;
      var m = svg && svg.getScreenCTM && svg.getScreenCTM();
      if (d && m) {
        var v = d.split(' ').map(Number);
        var l = m.a * v[0] + m.e, t = m.d * v[1] + m.f, w = m.a * v[2], h = m.d * v[3];
        return { left: l, top: t, width: w, height: h, right: l + w, bottom: t + h };
      }
      return el.getBoundingClientRect();
    }

    /* 押した所に一番近い字を探す。字の隙間を押されても取りこぼさない */
    function charAt(px, py) {
      var best = null, bestD = Infinity;
      for (var i = 0; i < chars.length; i++) {
        var b = boxOf(chars[i]);
        if (!b.width || !b.height) continue;
        var dx = Math.max(b.left - px, 0, px - b.right);
        var dy = Math.max(b.top - py, 0, py - b.bottom);
        var d = dx * dx + dy * dy;
        if (d < bestD) { bestD = d; best = chars[i]; }
        if (d === 0) break;
      }
      return best;
    }

    xl.addEventListener('pointerdown', function (e) {
      var px = e.clientX, py = e.clientY;
      if (px == null || py == null) {
        var r0 = xl.getBoundingClientRect();
        px = r0.left + r0.width / 2; py = r0.top + r0.height / 2;
      }
      var ch = charAt(px, py);
      if (!ch) return;
      popFromGlyph(ch, 34);
      if (!calm && ch.animate) {
        /* 下段は「字＝マスク、色＝矩形」なので、包んでいる <g> ごと動かす。
           矩形だけ動かすと、字が止まったまま色だけ滑る。
           GSAP で SVG の <g> を動かすと、終わったあとに位置が少しずれたまま
           戻らなかった（変形の原点の計算が残る）。ブラウザ標準の
           Web Animations なら、終わると元の状態に戻るので、ずれが残らない。
           字の位置は、外側の <g transform> が持っている（ks-ch には無い） */
        ch.style.transformBox = 'fill-box';
        ch.style.transformOrigin = 'center';
        ch.animate([
          { transform: 'scale(.88)', filter: 'brightness(2.6)', offset: 0 },
          { transform: 'scale(1.06)', filter: 'brightness(1.5)', offset: .35 },
          { transform: 'scale(.98)', filter: 'brightness(1.1)', offset: .65 },
          { transform: 'scale(1)', filter: 'brightness(1)', offset: 1 }
        ], { duration: 900, easing: 'cubic-bezier(.2,.8,.3,1)' });
      }
    });
    (function bloop() {
      requestAnimationFrame(bloop);
      bx.clearRect(0, 0, bw, bh);
      for (var i = bits.length - 1; i >= 0; i--) {
        var p = bits[i];
        p.vy += 0.19; p.vx *= 0.988; p.vy *= 0.988;
        p.x += p.vx; p.y += p.vy; p.life -= 0.0125; p.sp += 0.2;
        if (p.life <= 0) { bits.splice(i, 1); continue; }
        bx.globalAlpha = Math.max(0, p.life);
        bx.fillStyle = p.c;
        bx.beginPath();
        bx.ellipse(p.x, p.y, p.r, p.r * (0.5 + 0.5 * Math.abs(Math.cos(p.sp))), p.sp, 0, 6.2832);
        bx.fill();
      }
      bx.globalAlpha = 1;
    })();
  })();

  /* ---------- 漂う粒 ---------- */
  var cv = document.getElementById('motes');
  /* 粒はトップだけ。読みものの後ろでは動かさない */
  if (!cv || calm || !document.body.classList.contains('home')) return;
  var c = cv.getContext('2d');
  var W = 0, H = 0, dpr = 1, parts = [], px = 0, py = 0, tx = 0, ty = 0;
  function seed() {
    var num = Math.round(Math.min(80, Math.max(26, (W * H) / 25000)));
    parts = [];
    for (var i = 0; i < num; i++) {
      var z = Math.random();
      parts.push({ x: Math.random() * W, y: Math.random() * H, z: z, r: 0.7 + z * 2.5,
        vy: -(0.05 + z * 0.22), vx: (Math.random() - .5) * 0.12, a: 0.06 + z * 0.30,
        ph: Math.random() * 6.283, sw: 0.25 + Math.random() * 0.75, gold: Math.random() < 0.18 });
    }
  }
  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    c.setTransform(dpr, 0, 0, dpr, 0, 0); seed();
  }
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', function (e) {
    tx = (e.clientX / window.innerWidth - .5) * 26;
    ty = (e.clientY / window.innerHeight - .5) * 18;
  });
  var t0 = 0;
  function frame() {
    requestAnimationFrame(frame);
    t0 += 0.006;
    px += (tx - px) * 0.045; py += (ty - py) * 0.045;
    c.clearRect(0, 0, W, H);
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      p.y += p.vy; p.x += p.vx + Math.sin(t0 * p.sw + p.ph) * 0.18;
      if (p.y < -12) { p.y = H + 12; p.x = Math.random() * W; }
      if (p.x < -12) p.x = W + 12; else if (p.x > W + 12) p.x = -12;
      var x = p.x + px * (0.25 + p.z), y = p.y + py * (0.25 + p.z);
      var tw = 0.72 + 0.28 * Math.sin(t0 * 2.1 + p.ph);
      c.beginPath(); c.arc(x, y, p.r, 0, 6.2832);
      c.fillStyle = p.gold ? (DARK ? 'rgba(126,200,227,' : 'rgba(47,111,208,') + (p.a * tw * .85).toFixed(3) + ')'
                           : (DARK ? 'rgba(200,214,230,' : 'rgba(60,80,110,') + (p.a * tw).toFixed(3) + ')';
      c.fill();
    }
  }
  resize(); requestAnimationFrame(frame);

  /* ---------- 種類で絞る（Works） ---------- */
  var chips = document.querySelectorAll('.chip');
  var list = document.getElementById('worklist');
  if (!chips.length || !list) return;
  var items = list.querySelectorAll('li');
  var empty = document.getElementById('empty');
  for (var m = 0; m < chips.length; m++) {
    chips[m].addEventListener('click', function () {
      var f = this.getAttribute('data-f'), shown = 0;
      for (var q = 0; q < chips.length; q++) chips[q].classList.toggle('on', chips[q] === this);
      for (var r = 0; r < items.length; r++) {
        var ok = (f === 'all' || items[r].getAttribute('data-kind') === f);
        items[r].hidden = !ok;
        if (ok) { shown++; items[r].classList.add('on'); items[r].style.opacity = 1; items[r].style.transform = 'none'; }
      }
      if (empty) empty.hidden = shown > 0;
      try { history.replaceState(null, '', f === 'all' ? location.pathname : '#' + f); } catch (e) {}
    });
  }
  var h = (location.hash || '').slice(1);
  if (h) for (var v = 0; v < chips.length; v++)
    if (chips[v].getAttribute('data-f') === h) chips[v].click();
})();
