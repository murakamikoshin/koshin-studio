/* 弾幕パターンの動く見本。記事の <canvas data-demo="…"> ごとに 1 つ動かす。
   計算は弾幕メーカー（DanmakuCore/Simulation.swift・AdPatterns.swift）と同じ式。
   自機は、指やマウスを置いた所へ動く（触っていない間は、左右にゆっくり揺れる）。当たり判定はしない */
(function () {
  'use strict';
  var W = 360, H = 540, deg = Math.PI / 180;
  var PAL = ['#ff6b9d', '#5ce1e6', '#ffd166', '#b28dff', '#7cf29c'];
  var EN = /^en/.test(document.documentElement.lang || '');
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  /* 見本ごとの初期値。i: 発射間隔(秒)、c: 弾数、v: 速さ(×60 px/秒)、r: 角度(度) */
  var PRESET = {
    ring: { t: 'ring', i: 1, c: 16, v: 2, r: 0, k: 0 },
    rotate: { t: 'ring', i: .12, c: 3, v: 1.8, r: 11, k: 1 },
    swirl: { t: 'swirl', i: .12, c: 3, v: 1.8, r: 13, k: 3 },
    aimOdd: { t: 'aim', i: .8, c: 5, v: 3, r: 40, k: 2 },
    aimEven: { t: 'aim', i: .8, c: 6, v: 3, r: 40, k: 2 },
    rain: { t: 'rain', i: .25, c: 2, v: 2, r: 0, k: 1 },
    sweep: { t: 'sweep', i: .15, c: 5, v: 2.5, r: 60, k: 4 },
    homing: { t: 'homing', i: 1.2, c: 3, v: 1.6, r: 40, k: 0 }
  };
  function emit(m, k, cx, cy, px, py, rng, out) {
    var sp = m.v * 60, n = Math.max(1, m.c), j, b, col = PAL[m.k];
    function add(x, y, a, extra) { if (out.length < 1600) { var o = { x: x, y: y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, col: col, turn: 0, left: 0, home: false }; for (var key in extra) o[key] = extra[key]; out.push(o); } }
    switch (m.t) {
      case 'ring': for (j = 0; j < n; j++) add(cx, cy, j * 2 * Math.PI / n + k * m.r * deg); break;
      /* 本当の渦巻き：弾そのものが、出てから 8 秒、毎秒 30° ずつ同じ向きに曲がる */
      case 'swirl': for (j = 0; j < n; j++) add(cx, cy, j * 2 * Math.PI / n + k * m.r * deg, { turn: 30 * deg, left: 8 }); break;
      case 'aim': b = Math.atan2(py - cy, px - cx); for (j = 0; j < n; j++) add(cx, cy, b + (n > 1 ? (j / (n - 1) - .5) * m.r * deg : 0)); break;
      case 'rain': for (j = 0; j < n; j++) add(rng() * W, -8, Math.PI / 2 + (rng() - .5) * .3); break;
      case 'sweep': b = Math.PI / 2 + Math.sin(k * .25) * m.r * deg; for (j = 0; j < n; j++) add(cx, cy, b + (n > 1 ? (j / (n - 1) - .5) * .5 : 0)); break;
      /* 追尾：曲がれるのは毎秒 max(25°, 2×|r|°) まで、最初の 2.5 秒だけ */
      case 'homing': b = Math.atan2(py - cy, px - cx); for (j = 0; j < n; j++) add(cx, cy, b + (j - (n - 1) / 2) * .35, { turn: Math.max(25, Math.abs(m.r) * 2) * deg, left: 2.5, home: true }); break;
    }
  }
  function Demo(canvas) {
    var key = canvas.getAttribute('data-demo');
    var m = {}; var p = PRESET[key]; for (var x in p) m[x] = p[x];
    var ctx = canvas.getContext('2d'), bullets = [], t = 0, next = 0, shot = 0, rng = mulberry(7), last = 0, ptr = null, visible = false;
    var ship = { x: W / 2, y: H * .82 };
    var cx = W / 2, cy = H * .22;
    /* 操作：数・角度のつまみ（あれば） */
    var box = canvas.parentNode;
    box.querySelectorAll('input[data-k]').forEach(function (inp) {
      var out = box.querySelector('output[for="' + inp.id + '"]');
      inp.value = m[inp.getAttribute('data-k')];
      if (out) out.textContent = inp.value;
      inp.addEventListener('input', function () { m[inp.getAttribute('data-k')] = +inp.value; if (out) out.textContent = inp.value; bullets.length = 0; });
    });
    function pos(e) { var r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }; }
    canvas.addEventListener('pointermove', function (e) { ptr = pos(e); });
    canvas.addEventListener('pointerdown', function (e) { ptr = pos(e); });
    canvas.addEventListener('pointerleave', function () { ptr = null; });
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2), w = canvas.clientWidth || W;
      if (canvas.width !== Math.round(w * dpr)) { canvas.width = Math.round(w * dpr); canvas.height = Math.round(w * H / W * dpr); }
      return canvas.width / W;
    }
    function frame(now) {
      if (!visible) { last = 0; return; }
      var dt = last ? Math.min(.05, (now - last) / 1000) : 0; last = now; t += dt;
      var tx = ptr ? ptr.x : W / 2 + Math.sin(t * .7) * 110, ty = ptr ? ptr.y : H * .82;
      ship.x += (tx - ship.x) * Math.min(1, dt * 8); ship.y += (ty - ship.y) * Math.min(1, dt * 8);
      while (t >= next) { emit(m, shot, cx, cy, ship.x, ship.y, rng, bullets); shot++; next += Math.max(.05, m.i); }
      var w = 0;
      for (var i = 0; i < bullets.length; i++) {
        var b = bullets[i];
        if (b.left > 0) {
          var a = Math.atan2(b.vy, b.vx), s = Math.sqrt(b.vx * b.vx + b.vy * b.vy), na;
          if (b.home) { var want = Math.atan2(ship.y - b.y, ship.x - b.x), d = want - a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; na = a + Math.max(-b.turn * dt, Math.min(b.turn * dt, d)); }
          else na = a + b.turn * dt;
          b.vx = Math.cos(na) * s; b.vy = Math.sin(na) * s; b.left -= dt;
        }
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) continue;
        bullets[w++] = b;
      }
      bullets.length = w;
      var s2 = size(); ctx.setTransform(s2, 0, 0, s2, 0, 0);
      ctx.fillStyle = '#0a0818'; ctx.fillRect(0, 0, W, H);
      if (m.t !== 'rain') { ctx.strokeStyle = PAL[m.k]; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx, cy - 8); ctx.lineTo(cx + 8, cy); ctx.lineTo(cx, cy + 8); ctx.lineTo(cx - 8, cy); ctx.closePath(); ctx.stroke(); }
      ctx.fillStyle = '#5ce1e6'; ctx.beginPath(); ctx.moveTo(ship.x, ship.y - 11); ctx.lineTo(ship.x + 8, ship.y + 8); ctx.lineTo(ship.x, ship.y + 4); ctx.lineTo(ship.x - 8, ship.y + 8); ctx.closePath(); ctx.fill();
      for (var q = 0; q < bullets.length; q++) { var bb = bullets[q]; ctx.fillStyle = bb.col; ctx.beginPath(); ctx.arc(bb.x, bb.y, 6, 0, 7); ctx.fill(); }
      ctx.fillStyle = '#fff'; for (q = 0; q < bullets.length; q++) { ctx.beginPath(); ctx.arc(bullets[q].x, bullets[q].y, 3, 0, 7); ctx.fill(); }
      /* 当たり判定の円（半径 5.5）を、自機の上に薄く描く */
      ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(ship.x, ship.y, 5.5, 0, 7); ctx.stroke();
      requestAnimationFrame(frame);
    }
    /* 画面に見えている間だけ動かす（電池と CPU のため） */
    var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (en) { var was = visible; visible = en.isIntersecting; if (visible && !was) requestAnimationFrame(frame); }); }, { rootMargin: '100px' }) : null;
    if (io) io.observe(canvas); else { visible = true; requestAnimationFrame(frame); }
    canvas.setAttribute('aria-label', (EN ? 'Live demo: ' : '動く見本：') + (canvas.getAttribute('data-label') || key));
  }
  document.querySelectorAll('canvas[data-demo]').forEach(function (c) { Demo(c); });
})();
