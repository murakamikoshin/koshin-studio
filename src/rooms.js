// Room shell (walls, floor, doorway, lights) and the five rooms
import { THREE, CANNON, S, rnd, pick, clamp, V, mat, glassMat, bx, cy, sp, plane, RW, RD, RH, DW, DH, WZ, after, shake, hitStop, addCombo, addDopamine } from './ctx.js';
import { floorTex, wallTex, label } from './tex.js';
import { P, addProp, texMat, breakProp, damage, explode } from './props.js';
import { buildGuard } from './person.js';
import { emit, pop, say, flash } from './fx.js';
import { sfx } from './audio.js';
import { PAR } from './par.js';

function tiledBox(w, h, d, unit = 2) {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv;
  const su = [d, d, w, w, w, w], sv = [h, h, d, d, h, h];
  for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) { const k = f * 4 + i; uv.setXY(k, uv.getX(k) * su[f] / unit, uv.getY(k) * sv[f] / unit); }
  return g;
}
function addStatic(hx, hy, hz, x, y, z) {
  const b = new CANNON.Body({ mass: 0, shape: new CANNON.Box(new CANNON.Vec3(hx, hy, hz)), material: S.physMat });
  b.position.set(x, y, z); S.world.addBody(b);
}

export function buildShell(def) {
  const g = S.roomGroup, pal = def.pal, T = 0.3;
  // floor slab
  const ft = floorTex(pal.floorType, pal.floorA, pal.floorB); ft.repeat.set(1, 1);
  const fm = new THREE.MeshStandardMaterial({ map: ft, roughness: pal.floorR ?? 0.85, metalness: pal.floorM ?? 0 }); fm.userData.own = true;
  const sideM = mat(0x1b1230);
  const floor = new THREE.Mesh(tiledBox(RW + 2 * T, 0.4, RD + T, pal.floorUnit || 3), [sideM, sideM, fm, sideM, sideM, sideM]);
  floor.position.set(0, -0.2, -T / 2); floor.receiveShadow = true; g.add(floor);
  // walls
  const wt = wallTex(pal.wallType, pal.wallA, pal.wallB); wt.repeat.set(1, 1);
  const wm = new THREE.MeshStandardMaterial({ map: wt, roughness: 0.92 }); wm.userData.own = true;
  const wall = (w, h, d, x, y, z) => { const m = new THREE.Mesh(tiledBox(w, h, d, 2), wm); m.position.set(x, y, z); m.receiveShadow = true; g.add(m); };
  const segW = (RW - DW) / 2;
  wall(segW, RH, T, -(DW / 2 + segW / 2), RH / 2, WZ - T / 2);
  wall(segW, RH, T, DW / 2 + segW / 2, RH / 2, WZ - T / 2);
  wall(DW, RH - DH, T, 0, DH + (RH - DH) / 2, WZ - T / 2);
  wall(T, RH, RD + T, -(RW / 2 + T / 2), RH / 2, -T / 2);
  wall(T, RH, RD + T, RW / 2 + T / 2, RH / 2, -T / 2);
  // trim
  const tr = pal.trim;
  for (const s of [-1, 1]) {
    bx(g, segW, 0.16, 0.05, tr, s * (DW / 2 + segW / 2), 0.08, WZ + 0.025);
    bx(g, 0.05, 0.16, RD, tr, s * (RW / 2 - 0.025), 0.08, 0);
    bx(g, 0.14, DH + 0.07, 0.36, tr, s * (DW / 2 + 0.07), (DH + 0.07) / 2, WZ - 0.1);
  }
  bx(g, DW + 0.28, 0.14, 0.36, tr, 0, DH + 0.07, WZ - 0.1);
  // corridor behind the door, flooded with light
  const dark = mat(0x120a22);
  bx(g, DW + 1.6, 0.3, 2.6, 0x3a2a55, 0, -0.15, WZ - T - 1.3);
  for (const s of [-1, 1]) bx(g, 0.3, DH + 1, 3.2, 0, s * (DW / 2 + 0.6), (DH + 1) / 2, WZ - T - 1.6, { mat: dark });
  bx(g, DW + 2.2, 0.3, 3.2, 0, 0, DH + 0.75, WZ - T - 1.6, { mat: dark });
  bx(g, DW + 2.2, DH + 1, 0.3, 0, 0, (DH + 1) / 2, WZ - T - 3.05, { mat: dark });
  const gm = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.6, 2.3, 1.7), toneMapped: false }); gm.userData.own = true;
  plane(g, DW + 0.9, DH + 0.55, gm, 0, (DH + 0.55) / 2, WZ - T - 2.55);
  const sm = new THREE.MeshBasicMaterial({ color: 0xfff2c0, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }); sm.userData.own = true;
  const shp = new THREE.Shape(); shp.moveTo(-DW / 2, 0); shp.lineTo(DW / 2, 0); shp.lineTo(DW / 2 + 1.4, 3.8); shp.lineTo(-DW / 2 - 1.4, 3.8); shp.closePath();
  const spill = new THREE.Mesh(new THREE.ShapeGeometry(shp), sm); spill.rotation.x = Math.PI / 2; spill.position.set(0, 0.02, WZ); g.add(spill);
  S.room.spill = spill;
  // exit sign
  plane(g, 0.86, 0.34, texMat(label([{ t: '出口 EXIT', s: 50, c: '#fff' }], { w: 256, h: 100, bg: '#12a150' }), { e: 0xffffff, ei: 1.5 }), 0, DH + 0.5, WZ + 0.02);
  const pl = new THREE.PointLight(pal.lampColor || 0xffe2b0, 13, 16, 1.6); pl.position.set(0, 3.1, 0.3); g.add(pl); S.room.lamp = pl;
  // physics statics
  addStatic(12, 0.5, 12, 0, -0.5, 0);
  const hw = (10 - DW / 2) / 2;
  addStatic(hw, 6, 0.25, -(DW / 2 + hw), 5, WZ - 0.25); addStatic(hw, 6, 0.25, DW / 2 + hw, 5, WZ - 0.25);
  addStatic(DW / 2, 3, 0.25, 0, DH + 3, WZ - 0.25);
  addStatic(0.25, 6, 12, -(RW / 2 + 0.25), 5, 0); addStatic(0.25, 6, 12, RW / 2 + 0.25, 5, 0);
  addStatic(12, 6, 0.25, 0, 5, RD / 2 + 0.25);
  addStatic(12, 0.5, 12, 0, RH + 3.5, 0);
  addStatic(3, 6, 0.25, 0, 5, WZ - 4.5);
  for (const s of [-1, 1]) addStatic(0.25, 6, 2.5, s * (DW / 2 + 0.7), 5, WZ - 2.5);
}

function rug(color, color2, r = 1.6, x = 0, z = 0.6) {
  const a = new THREE.Mesh(new THREE.CircleGeometry(r, 40), mat(color)); a.rotation.x = -Math.PI / 2; a.position.set(x, 0.012, z); a.receiveShadow = true; S.roomGroup.add(a);
  const b = new THREE.Mesh(new THREE.RingGeometry(r * 0.72, r * 0.8, 40), mat(color2)); b.rotation.x = -Math.PI / 2; b.position.set(x, 0.016, z); b.receiveShadow = true; S.roomGroup.add(b);
}
function wallSign(lines, w, h, x, y, o = {}) {
  plane(S.roomGroup, w, h, texMat(label(lines, o)), x, y, WZ + 0.015);
}
// Never leave the player without something to throw.
function refillThrowables() {
  const R = S.room;
  if (R.refill || S.game.exitOpen) return;
  const w = R.wall && R.wall.alive ? R.wall.pos.z : -99;   // only what is on the kid's side of the glass counts
  // explosives do not count: with nothing safe left to throw, every option would wake the room
  if (S.props.some((p) => p.alive && p.throwable && p.pos.z > w && p.name !== 'tnt' && !(p.name === 'barrel' && p.o.color === 0xd92b2b))) return;
  R.refill = true;
  after(1.2, () => {
    R.refill = false;
    if (S.game.exitOpen) return;
    const x = rnd(-1.5, 1.5), z = rnd(0, 2);
    addProp({ ...P.crate(x, z, 0.7, 2.2), noCount: true, value: 0 });
    pop(V(x, 2.4, z), 'おかわり', { size: 30 });
  });
}

// Someone asleep who must not be woken. Throw something at them to keep it that way.
function addSleeper(x, z, look = {}, shout = 'コラーッ！！', opts = {}) {
  const R = S.room;
  R.sleepers = (R.sleepers || 0) + 1; R.guard = 'asleep';
  if (!R.wakers) {
    R.wakers = []; R.sl = [];
    R.wake = () => {
      if (R.guard !== 'asleep' || S.game.exitOpen) return;
      R.guard = 'awake';
      for (const w of R.wakers) w();
      sfx.whistle(); flash('#ff2a2a', 0.45, 0.6); shake(0.5);
      S.kid.caught(); say('やべっ', 1.2);
      S.game.caught++; S.game.pauseDrain = 4;
      after(0.9, () => S.retryRoom());
    };
  }
  let parts, state = 'asleep', zz = 0.4 + R.sleepers * 0.5, me = null;
  R.wakers.push(() => {
    if (state !== 'asleep') return;
    state = 'awake';
    parts.head.rotation.set(0, 0, 0); parts.man.position.y = 0.28; parts.man.position.z = 0.15;
    for (const e of parts.eyes) e.scale.set(0.5, 4, 1);
    pop(V(x, 2.6, z + 0.35), shout, { size: 56, cls: 'big' });
  });
  // Knock this one out, sent flying away from `from`. A flying guard takes the next one in line with him.
  const ko = (from) => {
    if (state !== 'asleep' || R.guard !== 'asleep') return;
    state = 'ko'; R.sleepers--;
    parts.head.rotation.set(-0.5, 0, 0);
    const dx = x - from.x, dz = z - from.z, d = Math.hypot(dx, dz) || 1, dir = [dx / d, dz / d];
    breakProp(me, 'throw', from);
    emit(V(x, 2, z), 14, { color: 0xffe14a, hdr: 2.5, speed: [2, 6], size: [0.05, 0.1], life: [0.4, 0.9], grav: 5 });
    R.koBurst = (R.koBurst || 0) + 1; after(1.2, () => { R.koBurst--; });
    if (R.koBurst >= 3) pop(V(0, 2.8, -1), 'ストライク！！', { size: 64, cls: 'big' });
    if (R.sleepers <= 0) { R.guard = 'ko'; S.game.noiseOn = false; S.game.noise = 0; say('よし。静かになった', 1.6); }
    else say(`あと${R.sleepers}人`, 1.4);
    if (opts.onKO) opts.onKO(dir);
    after(0.14, () => {
      for (const o of R.sl) {
        if (o.ko === ko || !o.asleep()) continue;
        const ox = o.x - x, oz = o.z - z, od = Math.hypot(ox, oz);
        if (od < 1.9 && (ox * dir[0] + oz * dir[1]) / od > 0.4) o.ko(V(x, 0.9, z));
      }
    });
  };
  R.sl.push({ x, z, ko, helmet: !!opts.helmet, shield: !!opts.shield, asleep: () => state === 'asleep' });
  me = addProp({
    name: opts.helmet ? 'helmet' : 'guard', kind: 'guard', size: [0.8, 1.7, 0.8], pos: [x, 0.85, z], mass: 0, hp: 999, value: 2, breakStyle: 'fly', flyMass: 6, dopa: 30,
    immune: { punch: true, throw: true, scream: true, blast: true, impact: true },
    build(g) {
      parts = buildGuard(g, look);
      if (opts.shield) {   // a riot shield held out in front: nothing thrown from the front gets through
        bx(g, 0.78, 1.05, 0.07, 0x2f5fa8, 0, -0.1, 0.5, { round: 0.03, r: 0.35, m: 0.6 });
        bx(g, 0.5, 0.2, 0.02, 0xbfe3ff, 0, 0.2, 0.545); bx(g, 0.6, 0.06, 0.02, 0xf5c518, 0, -0.35, 0.545);
      }
      if (opts.helmet) {   // an iron helmet: thrown things bounce off
        sp(parts.head, 0.34, 0x76828f, 0, 0.36, -0.02, { sy: 0.78, r: 0.55, m: 0.55 });
        cy(parts.head, 0.4, 0.4, 0.04, 0x7f8b99, 0, 0.3, 0, { r: 0.3, m: 0.85 });
        bx(parts.head, 0.08, 0.3, 0.05, 0xf5c518, 0, 0.5, 0.2, { rx: -0.6 });
      }
    },
    onPunch() {
      const pl = S.props.find((q) => q.alive && q.name === 'plank' && Math.abs(q.pos.x - x) < q.hx && Math.abs(q.pos.z - z) < q.hz);
      if (pl) { damage(pl, 99, 'punch', S.kid.pos3()); return true; }   // he is standing on a trapdoor: the floor goes, not him
      R.wake(); return true;
    },
    onRam(p, from) { ko(from); },
    onImpact(p, other, v) {
      if (!other || !(other.thrownT > 0) || v <= 2.5) return true;
      if (opts.shield && state === 'asleep' && other.name !== 'tnt' && other.pos.z - z > Math.abs(other.pos.x - x) * 0.8) {
        sfx.clang(); pop(V(x, 2.0, z + 0.7), 'ガンッ', { size: 40 });
        if (!R.shieldTold) { R.shieldTold = true; after(0.5, () => say('盾だ。正面からは効かない。横から', 2.4)); }
        return true;
      }
      if (opts.helmet) {
        if (other.name !== 'tnt' && state === 'asleep') { sfx.metal(); pop(V(x, 2.4, z + 0.3), 'カーン', { size: 40 }); if (!R.helmTold) { R.helmTold = true; after(0.5, () => say('ヘルメットは鉄。投げても効かない', 2.2)); } }
        return true;
      }
      ko(other.pos); return true;
    },
    update(p, dt) {
      if (state !== 'asleep' || R.guard !== 'asleep') return;
      parts.man.scale.y = 1 + Math.sin(S.kid.t * 2 + x) * 0.02;
      zz -= dt;
      if (zz <= 0) { zz = 1.5; pop(V(p.pos.x + 0.35, 2.3, p.pos.z), 'Zzz', { size: 26, cls: 'small' }); }
    },
  });
}
function sleeperUpdate() {
  const R = S.room;
  if (R.guard === 'asleep') { if (S.game.noise >= 100) R.wake(); else refillThrowables(); }
}
// Keep TNT coming once it has been released, so a wasted blast is never a dead end.
function tntRefill() {
  const R = S.room;
  if (!R.tntReady || R.pending || S.game.exitOpen || S.props.some((p) => p.name === 'tnt' && p.alive)) return;
  R.pending = true;
  after(1.4, () => {
    R.pending = false;
    if (S.game.exitOpen) return;
    const x = rnd(-1.4, 1.4), z = rnd(-0.2, 1.4);
    addProp(P.tnt(x, 1.3, z)); sfx.blip();
    pop(V(x, 2.0, z), 'TNT補充', { size: 30 });
  });
}

// Shared "you got caught" beat: whistle, red flash, the room restarts.
function bust(pos, shout, line) {
  const R = S.room;
  if (R.busted || S.game.exitOpen) return;
  R.busted = true;
  const w = document.getElementById('watch'); if (w) w.classList.remove('on');
  pop(pos, shout, { size: 56, cls: 'big' });
  sfx.whistle(); flash('#ff2a2a', 0.45, 0.6); shake(0.5);
  S.kid.caught(); say(line, 1.3);
  S.game.caught++; S.game.pauseDrain = 4;
  after(0.9, () => S.retryRoom());
}
// A guard who is wide awake. He looks away, then swings round: anything but standing still gets you caught.
function addWatcher(x, z, w) {
  const R = S.room, all = { punch: true, throw: true, scream: true, blast: true, impact: true };
  const W = R.watch = { phase: 'away', t: 2.0, away: Math.max(1.5, 2.6 - w * 0.006), look: Math.min(1.4, 0.8 + w * 0.003), grace: 0 };
  let parts, yaw = Math.PI;
  const ui = (on) => { const el = document.getElementById('watch'); if (el) el.classList.toggle('on', on); };
  const moving = () => { const k = S.kid; return k.state === 'dash' || k.state === 'charge' || k.state === 'scream' || k.punchT > 0.35 || k.throwT > 0.35; };
  addProp({
    name: 'watcher', kind: 'guard', size: [0.8, 1.7, 0.8], pos: [x, 0.85, z], rotY: Math.PI, mass: 0, hp: 999, value: 0, noCount: true, immune: all,
    build(g) {
      parts = buildGuard(g, { uniform: 0x9a2a2a, dark: 0x3a0a14 });
      parts.head.rotation.set(0, 0, 0);
      for (const e of parts.eyes) e.scale.set(0.5, 3.4, 1);
      sp(parts.head, 0.33, 0xdfe5ea, 0, 0.36, -0.02, { sy: 0.7, r: 0.3, m: 0.8 });
    },
    onPunch(p) { bust(V(x, 2.6, z + 0.35), 'コラーッ！！', '殴ったらバレた'); return true; },
    onImpact(p, other, v) {
      if (other && other.thrownT > 0 && v > 2.5) {
        sfx.clang(); pop(V(x, 2.4, z + 0.3), 'カーン', { size: 34 }); say('ヘルメットかよ…効かん', 1.4);
        if (W.phase === 'away') { W.phase = 'warn'; W.t = 0.3; }
      }
      return true;
    },
    update(p, dt) {
      if (S.game.exitOpen || R.busted) { ui(false); return; }
      W.t -= dt;
      let target = Math.PI;
      if (W.phase === 'away') {
        if (W.t <= 0) { W.phase = 'warn'; W.t = 0.45; sfx.error(); pop(V(x, 2.6, z + 0.3), '！', { size: 64, cls: 'big' }); }
      } else if (W.phase === 'warn') {
        target = Math.PI * 0.45;
        if (W.t <= 0) { W.phase = 'look'; W.t = W.look; W.grace = 0.12; ui(true); }
      } else {
        target = 0; W.grace -= dt;
        if (W.grace <= 0 && moving()) bust(V(x, 2.6, z + 0.35), 'コラーッ！！', '動いたのバレた');
        else if (W.t <= 0) { W.phase = 'away'; W.t = W.away; ui(false); }
      }
      yaw += (target - yaw) * Math.min(1, dt * 14);
      p.body.quaternion.setFromEuler(0, yaw, 0);
    },
  });
}
// Giant dominoes: knock over the first and the row takes the exit off its hinges.
function addDominoes(w, door) {
  const R = S.room, H = 2.3, all = { punch: true, throw: true, scream: true, blast: true, impact: true };
  const pts = [[2.75, 1.75], [2.6, 0.6], [2.2, -0.5], [1.55, -1.5], [0.7, -2.3]];
  const need = Math.min(12, 1 + Math.floor(w / 8));
  let hits = 0;
  const slabs = pts.map(([x, z], i) => {
    const nx = i < pts.length - 1 ? pts[i + 1] : [0, WZ + 0.1], dx = nx[0] - x, dz = nx[1] - z, L = Math.hypot(dx, dz);
    const d = { x, z, dir: [dx / L, dz / L], yaw: Math.atan2(dx, dz), ang: 0, fall: false, trig: false, max: i < pts.length - 1 ? 1.2 : 1.32 };
    const tip = () => { if (R.domGo) return; R.domGo = true; d.fall = true; };
    const p = addProp({
      name: i ? 'domino' : 'domino1', kind: 'stone', size: [1.25, H, 0.3], pos: [x, H / 2, z], rotY: d.yaw, mass: 0, hp: 999, value: 0, noCount: true, immune: all, color: 0xf4f1e8,
      build(g) {
        bx(g, 1.25, H, 0.3, 0xf4f1e8, 0, 0, 0, { round: 0.06, r: 0.5 });
        bx(g, 1.05, 0.05, 0.32, 0x222222, 0, 0, 0);
        for (const f of [-1, 1]) for (let k = 0; k <= i; k++) sp(g, 0.09, 0x222222, ((k % 3) - 1) * 0.3, 0.3 + Math.floor(k / 3) * 0.32 + (f > 0 ? 0 : -1.3), f * 0.15, { sz: 0.4 });
        if (i === 0) plane(g, 0.9, 0.34, texMat(label([{ t: '絶対に押すな', s: 40, c: '#fff' }], { w: 320, h: 110, bg: '#d22' })), 0, 0.75, -0.16, { ry: Math.PI });
      },
      onPunch(pp, kid) {
        if (R.domGo) return true;
        if (i > 0) { sfx.clang(); say('びくともしない。一番手前のやつから', 1.6); kid.recoil = 1; return true; }
        hits++; sfx.punch(0.7); shake(0.25); addCombo(); addDopamine(5);
        d.ang = Math.min(0.2, hits / need * 0.2);
        if (hits >= need) tip(); else { pop(V(x, 2.2, z), 'ぐらっ', { size: 34 }); say(`重い。あと${need - hits}発`, 1); }
        return true;
      },
      onImpact(pp, other, v) { if (i === 0 && need === 1 && other && other.thrownT > 0 && v > 3) tip(); return true; },
      update(pp, dt) {
        if (d.fall && d.ang < d.max) {
          d.ang = Math.min(d.max, d.ang + dt * (1.4 + d.ang * 7));
          if (!d.trig && d.ang > 0.55) {
            d.trig = true; sfx.stone(); shake(0.35); addCombo(); addDopamine(9);
            pop(V(pp.pos.x, 2.2, pp.pos.z), pick(['ドン', 'バタン', 'ゴトン']), { size: 40 });
            if (i < slabs.length - 1) slabs[i + 1].dom.fall = true;
            else if (door.alive) damage(door, 99, 'blast', pp.pos);
          }
        }
        const a = d.ang;
        pp.body.position.set(d.x + d.dir[0] * Math.sin(a) * H / 2, Math.cos(a) * H / 2 + Math.sin(a) * 0.15, d.z + d.dir[1] * Math.sin(a) * H / 2);
        pp.body.quaternion.setFromEuler(a, d.yaw, 0, 'YXZ');
      },
    });
    p.dom = d;
    return p;
  });
}

// One move that clears two or more barriers gets a slow-motion beat and a shout.
function mkBarrier() {
  const R = S.room; R.evMove = -1; R.evN = 0;
  return () => {
    if (R.evMove !== S.game.moves) { R.evMove = S.game.moves; R.evN = 0; }
    R.evN++;
    if (R.evN >= 2) { S.game.slowT = Math.max(S.game.slowT, 0.5); shake(0.4); pop(V(0, 3.0, 0.5), `${R.evN}枚抜き！！`, { size: 66, cls: 'big' }); sfx.clear(); addDopamine(30); }
  };
}

const HINT = {
  study: ['暗証番号のヒント', '本棚の本を虹の七色の順に左から並べ替え、赤い本の冊数を千の位、青い本の冊数を百の位とする。次に机の引き出しの二段目を開け、中の時計が指す時刻の「分」を下二桁とせよ。ただし絵画の三角形が上を向いている場合に限り、全体から金庫のダイヤルの目盛り数を引くこと。なお金庫の中には予備の鍵が入っているが、金庫の番号は扉の番号を逆から読んだものに、花瓶の数を足した値である。'],
  ware: ['ハシゴ組立手順書', '①床に散らばった部品A・B・Cを集める。②部品Aの溝に部品Bの突起を合わせ、カチッと音がするまで差し込む。③部品Cを上段に連結し、安全ピンを二か所に通す。④ハシゴを壁に立てかけ、足元を確認のうえ昇り、非常開放ボタンを押す。※部品を投げないこと。※樽やタイヤの上に乗らないこと。※作業前に必ず本書を最後まで読むこと。'],
  gallery: ['展示室の謎', '四枚の絵画に描かれた記号を、作者の生年が古い順に並べよ。その順番どおりに台座のガラス細工を九十度ずつ回転させると、扉のロックが解除される。ヒントは各絵画の額縁の裏に記されている。※館内ではお静かに願います。大声は作品を傷めるおそれがあるため、固くお断りいたします。'],
  guard: ['警備マニュアル（抜粋）', '扉の鍵は左から二番目のロッカーの上段にある。ロッカーの暗証番号は当直表の日付と、モニターに映る部屋番号の合計である。巡回は三十分おき。仮眠中の警備員を起こさぬよう、足音を立てずに行動すること。物音が一定以上になると、警備員は必ず目を覚ます。'],
  gym: ['体育倉庫のきまり', '非常ボタンは左右に一つずつあり、二人が同時に押したときだけシャッターが開く。跳び箱を八段まで積み、マットを敷いたうえで、二人一組で安全に昇ること。ボールを投げてボタンを押す行為は、器物破損につながるため固く禁止する。使用後は用具を元の位置に戻し、体育委員に報告すること。'],
  library: ['図書室の暗号', '鍵は貸出カウンターの引き出しにある。引き出しの番号は、日本十進分類法で「自然科学」「歴史」「文学」を表す数字を、背表紙の色が暖色の本の冊数で割った値である。司書の先生方はお昼寝中のため、物音を立てず、本は一冊ずつ丁寧に扱うこと。'],
  lab: ['実験の手順', '①試薬Aを十ミリリットル量り取り、ビーカーに入れる。②試薬Bを一滴ずつ加え、色が青から紫に変わったら止める。③できた溶液を防火扉の錠前に三滴たらすと、五分ほどで錠が溶ける。※薬品箱に衝撃を与えないこと。※火気厳禁。※一箱でも爆発すると連鎖するおそれがある。'],
  music: ['音楽室の課題', '黒板の五線譜に書かれた音符を読み取り、ピアノで正しい旋律を最後まで弾ききると、防音ガラスの扉が開く。一音でも間違えた場合は最初からやり直し。なお、先生は居眠り中だが耳がとても良い。大きな音、とくに叫び声には必ず目を覚ます。'],
  principal: ['校長室の金庫について', '金庫の暗号は、机の三つの引き出しを正しい順に開けると手に入る。順番は歴代校長の肖像画の並びに対応している。校長先生はお休み中である。危険物ケースは理科室から預かったものなので、絶対に触れないこと。'],
  vault: ['金庫室 解錠手順', '三つのダイヤルを、左から順に素数・平方数・完全数に合わせ、三名で同時に回すこと。レーザー網は解除後六十秒で再起動する。危険物ケースには絶対に触れないこと。大声・衝撃・火気は厳禁とする。万一爆発した場合、当行は一切の責任を負わない。'],
};

export const FONT_SAMPLE = Object.values(HINT).flat().join('') + '出口EXIT防弾ガラス危険物非常開放ボタン※ハシゴを使用のことお静かに同時に回せ押TNT¥防火扉しずか火気厳禁校訓：よく考えて行動♪♩♫♬ドレミソシ？正弾開警報器絶対に押すな';

export const ROOMS = [
  // ------------------------------------------------------------ 1 書斎
  {
    id: 'study', code: '1-1', name: '書斎', mission: '4桁の暗証番号を解読し、扉を開けよ', stamp: '知らん。殴れ。', teach: 'tap',
    pal: { wallType: 'stripe', wallA: '#2f6b5e', wallB: '#2a6155', floorType: 'wood', floorA: '#b9824e', floorB: '#8a5a33', floorUnit: 3, trim: 0xf4e9d0, ground: 0x6a4a30 },
    start: [0, 2.3], assist: [],
    hints: [[7, 'ドア、殴れば開くっしょ（連打）']],
    setup() {
      rug(0xa0182c, 0xf0b93a);
      addProp({ ...P.door({ hp: 6 }), onBreak() { S.openExit(); } });
      addProp(P.keypad(1.3));
      addProp(P.desk(-2.3, -2.9));
      addProp(P.hint(-2.7, 0.93, -2.85, ...HINT.study, { rotY: 0.2 }));
      addProp(P.mug(-1.7, 1.0, -2.8));
      addProp(P.chair(-2.3, -1.85, Math.PI));
      addProp(P.lamp(-3.35, -1.2));
      addProp(P.bookshelf(2.75, -3.4));
      addProp(P.safe(2.95, -1.5));
      addProp(P.vase(-3.2, 1.3));
      addProp(P.crate(1.7, 2.3)); addProp(P.crate(2.5, 2.4)); addProp(P.crate(2.1, 2.35, 0.5, 0.96));
      addProp(P.plant(3.2, 3.2));
      addProp(P.painting(-2.3, 2.55, 0, ['#f0b93a', '#2a3a8a']));
      addProp(P.window(0.6));
    },
  },
  // ------------------------------------------------------------ 2 倉庫
  {
    id: 'ware', code: '1-2', name: '倉庫', mission: '部品を集めてハシゴを組み立て、ボタンを押せ', stamp: '知らん。投げろ。', teach: 'swipe',
    pal: { wallType: 'block', wallA: '#6c7a8a', wallB: '#5f6c7b', floorType: 'concrete', floorA: '#8f969c', floorB: '#f5c518', floorUnit: 2.5, trim: 0xf5c518, ground: 0x4a5560, lamp: 0xf5c518 },
    start: [0, 2.3], assist: ['button'], needThrow: true,
    hints: [[8, 'あの赤いボタン…何か投げたら当たるくね？（スワイプ）'], [18, '物をスワイプ → ボタンの方へ弾く']],
    setup() {
      const R = S.room;
      const shutter = addProp(P.shutter());
      wallSign([{ t: '非常開放ボタン', s: 40, c: '#111' }, { t: '※ハシゴを使用のこと', s: 24, c: '#111', w: 700 }], 1.5, 0.5, 2.3, 2.42, { w: 384, h: 128, bg: '#f5c518', border: '#111', bw: 8 });
      addProp({ ...P.button(2.3, 3.25),
        onPunch() { say(pick(['届かん！！', '高っ。ムリ'])); return true; },
        onImpact(p, other, v) {
          if (R.pressed || v < 2.2) return true;
          R.pressed = true;
          p.cap.material = mat(0x2ad94a, { e: 0x2ad94a, ei: 2.2, r: 0.35 }); p.cap.position.z = -0.03;
          sfx.blip(); sfx.open(); pop(V(p.pos.x, p.pos.y + 0.3, p.pos.z + 0.3), 'ポチッ', { size: 44 }); shake(0.3);
          shutter.opening = true;
          after(0.45, () => { S.world.removeBody(shutter.body); });
          S.openExit();
          return true;
        } });
      addProp(P.hint(-1.75, 1.5, WZ + 0.03, ...HINT.ware, { wall: true }));
      addProp(P.ladderPart(-1.1, 0.4, 0.4)); addProp(P.ladderPart(1.0, 1.7, -1.0)); addProp(P.ladderPart(-2.4, 2.5, 1.3));
      addProp(P.barrel(-3.15, -3.1)); addProp(P.barrel(-2.3, -3.15, 0xf07a1f)); addProp(P.barrel(-3.1, -2.2, 0x2fa56a));
      addProp(P.metalShelf(3.3, -0.9, -Math.PI / 2));
      addProp(P.crate(-0.6, 2.9)); addProp(P.crate(-1.4, 3.0)); addProp(P.crate(-1.0, 2.95, 0.55, 0.98));
      addProp(P.crate(1.7, -3.1));
      addProp(P.cone(1.5, 0.3)); addProp(P.cone(3.1, 2.6));
      addProp(P.tire(-3.05, 0.5)); addProp(P.tire(-3.05, 0.5, 0.47)); addProp(P.tire(2.2, 3.0));
    },
    update() { if (!S.room.pressed) refillThrowables(); },
  },
  // ------------------------------------------------------------ 3 美術館
  {
    id: 'gallery', code: '1-3', name: '美術館', mission: '絵画の記号を正しい順に並べ、ロックを解除せよ', stamp: '知らん。叫べ。', teach: 'hold',
    pal: { wallType: 'dots', wallA: '#efe8d8', wallB: '#e0d6c0', floorType: 'carpet', floorA: '#8f1f33', floorB: '#b0304a', floorUnit: 1.5, trim: 0xd9a93a, ground: 0x7a3040 },
    start: [0, 2.6], assist: [], noLamp: true,
    hints: [[8, 'ガラスって声で割れるらしい。動画で見た（長押し）'], [18, '画面を長押し → 離して絶叫']],
    setup() {
      addProp({ ...P.glassDoor(), onBreak() { S.openExit(); } });
      addProp(P.chandelier(0, 0.3));
      let v = 0;
      for (const [x, z] of [[-2.6, -2.5], [2.6, -2.5], [-2.7, 0.7], [2.7, 0.7]]) { addProp(P.pedestal(x, z)); addProp(P.glassArt(x, 1.42, z, v++)); }
      addProp(P.showcase(0, -0.7));
      for (const [x, z] of [[-1.0, 0.25], [1.0, 0.25], [-1.0, -1.65], [1.0, -1.65]]) addProp(P.ropePost(x, z));
      addProp(P.painting(-2.45, 2.35, 0, ['#1f3a6a', '#f0b93a']));
      addProp(P.painting(2.45, 2.35, 1, ['#f2e7c8', '#c22a3a']));
      addProp(P.painting(-1.2, 2.35, 2, ['#2a2a2a', '#3fbf7f'], { side: -1 }));
      addProp(P.painting(-1.2, 2.35, 3, ['#6a2a7a', '#ffe14a'], { side: 1 }));
      addProp(P.hint(1.4, 1.5, WZ + 0.03, ...HINT.gallery, { wall: true }));
      addProp(P.bench(0, 3.1));
      addProp(P.vase(-3.2, 3.1, 0.42, true)); addProp(P.vase(3.2, 3.1, 0.42, true));
    },
  },
  // ------------------------------------------------------------ 4 警備室
  {
    id: 'guard', code: '1-4', name: '警備室', mission: '警備員を起こさずに、ロッカーの鍵を見つけ出せ', stamp: '知らん。黙らせろ。', teach: 'swipe', noise: true,
    pal: { wallType: 'panel', wallA: '#46507a', wallB: '#3a4368', floorType: 'checker', floorA: '#e9e9e4', floorB: '#3a3f52', floorUnit: 1.5, trim: 0xdfe5ea, ground: 0x3a4060 },
    start: [-0.6, 2.5], assist: ['guard'], needThrow: true,
    hints: [[6, 'うるさくすると起きる。遠くから何か投げて黙らせたい'], [16, '物をスワイプ → 警備員へ弾く']],
    setup() {
      addProp({ ...P.door(), onBreak() { S.openExit(); } });
      addSleeper(1.75, -2.95);
      for (let i = 0; i < 3; i++) addProp(P.locker(-3.35, -2.9 + i * 0.75, Math.PI / 2, i === 1 ? 0x8a6a5d : 0x5d8a8a));
      addProp(P.desk(-1.6, -2.9, 0x6c7a89));
      addProp(P.monitor(-2.05, 1.16, -3.0)); addProp(P.monitor(-1.3, 1.16, -3.0));
      addProp(P.donuts(-1.7, 0.97, -2.6)); addProp(P.mug(-0.85, 1.0, -2.7));
      addProp(P.chair(-1.6, -1.85, Math.PI));
      addProp(P.trashcan(-2.9, 0.9));
      addProp(P.cooler(3.25, -0.3));
      addProp(P.extinguisher(3.3, -1.6));
      addProp(P.crate(2.4, 2.6)); addProp(P.plant(-3.2, 3.2));
      addProp(P.hint(0.7, 0.02, 1.2, ...HINT.guard, { rotY: -0.3 }));
      wallSign([{ t: 'お静かに', s: 54, c: '#fff' }], 1.0, 0.36, -1.6, 2.5, { w: 256, h: 96, bg: '#27407a' });
    },
    onScream() { if (S.room.wake) S.room.wake(); },
    update: sleeperUpdate,
  },
  // ------------------------------------------------------------ 5 金庫室
  {
    id: 'vault', code: '1-5', name: '金庫室', mission: '3つのダイヤルを同時に回し、レーザーを解除せよ', stamp: '知らん。爆破しろ。', teach: 'all',
    pal: { wallType: 'panel', wallA: '#2c4f57', wallB: '#22424a', floorType: 'metal', floorA: '#59666f', floorB: '#3f4a52', floorUnit: 1.9, floorR: 0.55, floorM: 0.5, trim: 0xffc531, ground: 0x2a4a50, lampColor: 0xd8f0ff },
    start: [0.6, 2.5], assist: ['vault'],
    hints: [[7, '金庫は殴ってもムダ。あのTNT使えそう'], [15, 'ガラスは叫んで割る → TNTを金庫へ投げる']],
    setup() {
      const R = S.room; R.tntReady = false; R.pending = false; R.lasers = [];
      const lm = new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 0.25, 0.35), toneMapped: false }); lm.userData.own = true;
      for (const y of [0.5, 1.3, 2.1]) {
        R.lasers.push(cy(S.roomGroup, 0.016, 0.016, 3.3, 0, 0, y, WZ + 1.0, { rz: Math.PI / 2, mat: lm, seg: 6 }));
        for (const s of [-1, 1]) R.lasers.push(bx(S.roomGroup, 0.12, 0.16, 0.16, 0x2a313c, s * 1.7, y, WZ + 1.0));
      }
      addProp({ ...P.vaultDoor(), onBreak() { for (const l of R.lasers) l.visible = false; S.openExit(); } });
      addProp(P.glassCase(-2.35, -1.7, () => { R.tntReady = true; }));
      for (let i = 0; i < 3; i++) addProp(P.dial(2.05 + i * 0.6, 1.7, [7, 9, 6][i]));
      wallSign([{ t: '同時に回せ', s: 40, c: '#111' }], 1.3, 0.3, 2.65, 2.2, { w: 320, h: 72, bg: '#ffc531' });
      addProp(P.hint(-1.95, 1.5, WZ + 0.03, ...HINT.vault, { wall: true }));
      addProp(P.goldPile(2.7, -2.7)); addProp(P.goldPile(3.1, -1.6)); addProp(P.goldPile(2.5, 0.3));
      addProp(P.moneyBag(1.8, -2.2)); addProp(P.moneyBag(-3.25, -0.4)); addProp(P.moneyBag(-1.3, 2.9));
      addProp(P.steelCrate(-2.2, 3.0)); addProp(P.steelCrate(3.1, 2.7));
      addProp(P.safe(-3.05, 1.2));
    },
    update(dt) {
      const R = S.room, t = S.kid.t;
      for (let i = 0; i < R.lasers.length; i += 3) R.lasers[i].scale.x = R.lasers[i].scale.z = 0.7 + Math.abs(Math.sin(t * 9 + i)) * 0.8;
      tntRefill();
    },
  },
  // ============================================================ WORLD 2 学校
  // ------------------------------------------------------------ 2-1 体育館
  {
    id: 'gym', code: '2-1', name: '体育館', mission: '跳び箱を8段積み、2人同時にボタンを押せ', stamp: '知らん。両方に投げろ。', teach: 'swipe',
    pal: { wallType: 'panel', wallA: '#d9b382', wallB: '#c49a66', floorType: 'wood', floorA: '#e3b574', floorB: '#b98548', floorUnit: 3, trim: 0x2f7fd1, ground: 0x7a5a3a },
    start: [0, 2.6], assist: ['button'], needThrow: true,
    hints: [[8, 'ボタン2個。片方ずつ急いで当てれば「同時」ってことになるっしょ'], [20, 'ボールをスワイプ → 左右のボタンへ。5秒以内に両方']],
    setup() {
      const R = S.room; R.lit = [-99, -99]; R.btn = [];
      rug(0x2f7fd1, 0xffffff, 1.3, 0, 0.4);
      const shutter = addProp(P.shutter());
      [-2.5, 2.5].forEach((x, i) => {
        wallSign([{ t: '同時に押せ', s: 34, c: '#111' }], 1.1, 0.3, x, 2.45, { w: 256, h: 72, bg: '#f5c518', border: '#111', bw: 6 });
        R.btn.push(addProp({ ...P.button(x, 3.25),
          onPunch() { say(pick(['届かん！！', '高っ。ムリ'])); return true; },
          onImpact(p, other, v) {
            if (R.pressed || v < 2.2 || S.game.roomTime - R.lit[i] < 5) return true;
            R.lit[i] = S.game.roomTime;
            p.cap.material = mat(0x2ad94a, { e: 0x2ad94a, ei: 2.2, r: 0.35 }); p.cap.position.z = -0.03;
            sfx.blip(); pop(V(p.pos.x, p.pos.y + 0.3, p.pos.z + 0.3), 'ポチッ', { size: 40 }); shake(0.2);
            if (S.game.roomTime - R.lit[1 - i] < 5) {
              R.pressed = true; sfx.open();
              shutter.opening = true;
              after(0.45, () => { S.world.removeBody(shutter.body); });
              S.openExit();
            } else say('もう片方！！ 5秒以内', 1.6);
            return true;
          } }));
      });
      addProp(P.hint(-1.45, 1.5, WZ + 0.03, ...HINT.gym, { wall: true }));
      addProp(P.tobibako(-2.7, -2.6)); addProp(P.tobibako(2.7, -2.6));
      addProp(P.ball(-1.2, 1.4)); addProp(P.ball(1.3, 1.6, 0xd94848)); addProp(P.ball(-0.4, 3.0, 0x3d7fd9)); addProp(P.ball(0.6, 2.9)); addProp(P.ball(2.6, 0.4, 0xf0b93a)); addProp(P.ball(-2.7, 0.3, 0x2fa56a));
      addProp(P.cone(-3.2, 2.6)); addProp(P.cone(3.2, 2.9)); addProp(P.cone(3.1, 1.6));
      addProp(P.bench(-2.9, 3.2, 0.2));
      addProp(P.drum(1.9, 3.1, 0x2f7fd1));
    },
    update() {
      const R = S.room;
      if (R.pressed) return;
      for (let i = 0; i < 2; i++) {
        if (R.lit[i] > -50 && S.game.roomTime - R.lit[i] >= 5) {
          R.lit[i] = -99;
          const c = R.btn[i].cap; c.material = mat(0xff2a2a, { e: 0xff1a1a, ei: 1.6, r: 0.35 }); c.position.z = 0.02;
          sfx.error(); say('時間切れ。同時じゃないとダメか…', 1.8);
        }
      }
      refillThrowables();
    },
  },
  // ------------------------------------------------------------ 2-2 図書室
  {
    id: 'library', code: '2-2', name: '図書室', mission: '分類番号の暗号を解き、カウンターの鍵を取れ', stamp: '知らん。2人とも黙らせろ。', teach: 'swipe', noise: true,
    pal: { wallType: 'stripe', wallA: '#6a4a3a', wallB: '#5d4032', floorType: 'carpet', floorA: '#2f5a4a', floorB: '#3d6f5c', floorUnit: 1.5, trim: 0xd9a93a, ground: 0x3a4a3a },
    start: [0, 2.7], assist: ['guard'], needThrow: true,
    hints: [[6, '司書が2人寝てる。両方に投げてから扉'], [16, '外すと音が出る。本をスワイプ → 司書へ']],
    setup() {
      addProp({ ...P.door(), onBreak() { S.openExit(); } });
      addSleeper(-1.8, -2.95, { uniform: 0x4f7a5a, cap: false, bun: true, glasses: true, mustache: false, hair: 0x5a3a2a }, 'しーーっ！！');
      addSleeper(1.8, -2.95, { uniform: 0x7a5a3a, cap: false, bald: true, glasses: true, hair: 0xdddddd }, 'こらーっ！！');
      addProp(P.bookshelf(-3.4, -1.0, Math.PI / 2)); addProp(P.bookshelf(-3.4, 0.6, Math.PI / 2));
      addProp(P.bookshelf(3.4, -1.0, -Math.PI / 2)); addProp(P.bookshelf(3.4, 0.6, -Math.PI / 2));
      addProp(P.desk(-1.3, 0.5, 0x8a5a33)); addProp(P.desk(1.4, 1.4, 0x8a5a33));
      addProp(P.books(-1.8, 1.05, 0.5)); addProp(P.books(-0.9, 1.05, 0.45)); addProp(P.globe(-1.35, 1.18, 0.6));
      addProp(P.books(1.0, 1.05, 1.4)); addProp(P.books(1.8, 1.05, 1.35));
      addProp(P.hint(1.4, 0.93, 1.5, ...HINT.library, { rotY: -0.2 }));
      addProp(P.chair(-1.3, 1.5, Math.PI)); addProp(P.chair(1.4, 2.4, Math.PI));
      addProp(P.books(-0.3, 0.15, 2.9)); addProp(P.books(0.5, 0.15, 3.1)); addProp(P.globe(-2.6, 0.28, 2.9));
      addProp(P.plant(3.2, 3.2));
      wallSign([{ t: 'しずかに', s: 54, c: '#fff' }], 1.0, 0.36, 0, 3.75, { w: 256, h: 96, bg: '#4f7a5a' });
    },
    onScream() { if (S.room.wake) S.room.wake(); },
    update: sleeperUpdate,
  },
  // ------------------------------------------------------------ 2-3 理科室
  {
    id: 'lab', code: '2-3', name: '理科室', mission: '薬品を正しい順に調合し、扉の錠を溶かせ', stamp: '知らん。まとめて爆破。', teach: 'swipe',
    pal: { wallType: 'block', wallA: '#dfe8ea', wallB: '#c9d6da', floorType: 'checker', floorA: '#e8eef0', floorB: '#9fb4bb', floorUnit: 1.5, trim: 0x5fb0c0, ground: 0x6a8088, lampColor: 0xe8f6ff },
    start: [0, 2.9], assist: ['tnt'],
    hints: [[7, '薬品箱、1個爆発したら全部つながりそう。離れて何か投げる'], [17, '近くで殴ると自分も吹っ飛ぶ。遠くからスワイプ']],
    setup() {
      const R = S.room; R.tntReady = true; R.pending = false;
      addProp({ ...P.steelDoor(), onBreak() { S.openExit(); } });
      for (const [x, z] of [[0.5, -2.5], [-0.7, -1.3], [0.6, -0.1]]) addProp(P.tnt(x, 0.28, z));
      addProp(P.desk(-2.6, -2.7, 0x3a4652)); addProp(P.desk(2.6, -2.7, 0x3a4652));
      let v = 0;
      for (const [x, z] of [[-3.0, -2.7], [-2.3, -2.75], [2.2, -2.7], [2.9, -2.75]]) addProp(P.glassArt(x, 1.22, z, v++));
      addProp(P.skeleton(-3.2, -0.6)); addProp(P.cooler(3.25, -0.9));
      addProp(P.hint(-1.6, 1.5, WZ + 0.03, ...HINT.lab, { wall: true }));
      wallSign([{ t: '火気厳禁', s: 54, c: '#fff' }], 1.1, 0.36, 1.7, 1.9, { w: 256, h: 96, bg: '#d22' });
      addProp(P.schoolDesk(-2.2, 2.2)); addProp(P.schoolDesk(2.3, 2.3));
      addProp(P.vase(-2.2, 2.2, 1.18, true)); addProp(P.mug(2.3, 0.86, 2.3));
      addProp(P.extinguisher(3.3, 1.2)); addProp(P.trashcan(-3.2, 3.1));
      addProp(P.books(-0.9, 0.15, 3.2)); addProp(P.ball(1.1, 3.1, 0xf0b93a));
      addProp(P.window(0.9));
    },
    update() { tntRefill(); },
  },
  // ------------------------------------------------------------ 2-4 音楽室
  {
    id: 'music', code: '2-4', name: '音楽室', mission: '楽譜を解読し、ピアノで正しい旋律を弾け', stamp: '知らん。黙らせて叫べ。', teach: 'all', noise: true,
    pal: { wallType: 'dots', wallA: '#f3e3ea', wallB: '#e3c9d6', floorType: 'wood', floorA: '#8f5f3d', floorB: '#6a4028', floorUnit: 3, trim: 0xa0182c, ground: 0x6a4a50 },
    start: [-0.4, 2.7], assist: ['guard'], needThrow: true,
    hints: [[6, '扉はガラス。でも叫ぶと先生が起きる。先に投げて黙らせる'], [17, '①物をスワイプ → 先生へ ②長押しで絶叫']],
    setup() {
      addProp({ ...P.glassDoor(), onBreak() { S.openExit(); } });
      addSleeper(1.95, -2.95, { uniform: 0x8d4fd1, cap: false, hair: 0x2a2a2a, glasses: true }, 'うるさーい！！');
      addProp(P.piano(-2.4, -3.2));
      addProp(P.blackboard(-2.4, ['♪ ♩ ♫ ♩ ♪ ♬ ♩', 'ド レ ミ ？ ソ ？ シ', '※ 正しく弾けたら開く']));
      addProp(P.chair(-2.4, -2.3, Math.PI));
      addProp(P.drum(-3.1, 0.2)); addProp(P.drum(-2.3, 0.6, 0x2f7fd1)); addProp(P.drum(3.0, 1.0, 0xf0b93a));
      for (const [x, z] of [[-0.9, 0.6], [0.4, 0.9], [1.6, 0.5]]) addProp(P.ropePost(x, z));
      addProp(P.schoolDesk(2.6, 2.6)); addProp(P.schoolDesk(1.6, 2.8)); addProp(P.chair(-2.8, 2.8, 2.6));
      addProp(P.hint(1.6, 0.78, 2.8, ...HINT.music, { rotY: 0.2 }));
      addProp(P.vase(3.25, -1.0, 0.42, true)); addProp(P.vase(-3.25, 1.9, 0.42, true));
      addProp(P.window(-0.9));
      addProp(P.books(0.2, 0.15, 3.2));
    },
    onScream() { if (S.room.wake) S.room.wake(); },
    update: sleeperUpdate,
  },
  // ------------------------------------------------------------ 2-5 校長室
  {
    id: 'principal', code: '2-5', name: '校長室', mission: '机の引き出しを正しい順に開け、金庫の暗号を得よ', stamp: '知らん。全部やれ。', teach: 'all', noise: true,
    pal: { wallType: 'panel', wallA: '#5a2f2f', wallB: '#4a2525', floorType: 'carpet', floorA: '#2a3a6a', floorB: '#3a4d86', floorUnit: 1.5, trim: 0xffc531, ground: 0x3a2a3a, lampColor: 0xffe2b0 },
    start: [0.4, 2.7], assist: ['guard', 'vault'],
    hints: [[6, '順番が大事。①校長を黙らせる ②叫んでTNT ③金庫に投げる'], [18, 'いきなり叫ぶと校長が起きる。まず何か投げる']],
    setup() {
      const R = S.room; R.tntReady = false; R.pending = false;
      addProp({ ...P.vaultDoor(), onBreak() { S.openExit(); } });
      addSleeper(2.5, -2.7, { uniform: 0x3a3a44, cap: false, bald: true, hair: 0xf2f2f2 }, '何をしとるかーっ！！');
      addProp(P.glassCase(-2.4, -1.7, () => { R.tntReady = true; }));
      addProp(P.painting(1.0, 2.5, 1, ['#e9dcc0', '#5a3a2a'], { side: -1 })); addProp(P.painting(-0.5, 2.5, 2, ['#e9dcc0', '#3a4a6a'], { side: -1 }));
      addProp(P.painting(0.3, 2.5, 3, ['#2a2a3a', '#ffc531'], { side: 1 }));
      addProp(P.sofa(-2.7, 2.3, Math.PI / 2));
      addProp(P.pedestal(3.1, 0.2)); addProp(P.trophy(3.1, 1.39, 0.2));
      addProp(P.pedestal(3.1, 1.7)); addProp(P.trophy(3.1, 1.39, 1.7));
      addProp(P.plant(-3.2, -0.2)); addProp(P.plant(3.25, 3.2));
      addProp(P.books(1.4, 0.15, 2.6)); addProp(P.globe(-0.8, 0.28, 3.0)); addProp(P.vase(1.7, 1.2, 0.42));
      addProp(P.hint(-0.3, 0.02, 1.6, ...HINT.principal, { rotY: 0.3 }));
      wallSign([{ t: '校訓：よく考えて行動', s: 30, c: '#111' }], 1.5, 0.3, 2.6, 2.55, { w: 384, h: 76, bg: '#ffc531' });
    },
    onScream() { if (S.room.wake) S.room.wake(); },
    update() { sleeperUpdate(); tntRefill(); },
  },
  // ============================================================ STAGE 3 からくり部屋
  // One trick per room. Materials never lie: wood gives to force, glass to a scream, steel only to a blast.
  // ------------------------------------------------------------ 3-1 大広間
  {
    id: 'hall', code: '3-1', name: '大広間', mission: '眠る警備員の腰から、そっと鍵を抜き取れ', stamp: '知らん。', teach: 'none', noise: true, par: 1,
    pal: { wallType: 'stripe', wallA: '#5a2f4a', wallB: '#4d2740', floorType: 'wood', floorA: '#8f5f3d', floorB: '#6a4028', floorUnit: 3, trim: 0xf4e9d0, ground: 0x5a3a40 },
    start: [-1.4, 2.5], assist: ['rope'], needThrow: true, noLamp: true,
    hints: [[6, '天井のシャンデリア、ロープ1本で吊ってあるだけ'], [14, 'ロープに何か投げる。真下に警備員と扉がある']],
    setup() {
      const R = S.room, all = { punch: true, throw: true, scream: true, blast: true, impact: true };
      const door = addProp({ ...P.door({ hp: 12 }), onBreak() { S.openExit(); } });
      addSleeper(0.55, -2.75);
      const ch = addProp({ name: 'ironch', kind: 'metal', size: [1.8, 0.5, 1.8], pos: [0.3, 3.0, -2.75], mass: 0, hp: 999, value: 0, noCount: true, noPick: true, immune: all,
        build(g) {
          const iron = mat(0x2a2a30, { r: 0.4, m: 0.8 });
          for (const [r, y] of [[0.85, 0], [0.5, 0.14]]) { const t = new THREE.Mesh(new THREE.TorusGeometry(r, 0.06, 8, 28), iron); t.rotation.x = Math.PI / 2; t.position.y = y; g.add(t); }
          for (let i = 0; i < 4; i++) bx(g, 1.7, 0.05, 0.07, 0, 0, 0.02, 0, { mat: iron, ry: i * Math.PI / 4 });
          for (let i = 0; i < 8; i++) { const a = i / 8 * 6.28; cy(g, 0.035, 0.035, 0.22, 0xf4f1e8, Math.cos(a) * 0.85, 0.14, Math.sin(a) * 0.85); sp(g, 0.05, 0xffe19a, Math.cos(a) * 0.85, 0.3, Math.sin(a) * 0.85, { e: 0xffc860, ei: 3, noShadow: true }); }
          cy(g, 0.16, 0.05, 0.3, 0, 0, -0.16, 0, { mat: iron });
        } });
      addProp({ name: 'rope', kind: 'wood', size: [0.2, 0.85, 0.2], pos: [0.3, 3.72, -2.75], mass: 0, hp: 1, value: 0, noCount: true, quiet: true, dopa: 0, color: 0xc9a877, chunks: 4,
        build(g) { cy(g, 0.045, 0.045, 0.85, 0xc9a877, 0, 0, 0); sp(g, 0.1, 0xb08a55, 0, -0.3, 0); sp(g, 0.09, 0xb08a55, 0, 0.1, 0); },
        onPunch() { say('届かん！！'); return true; },
        onBreak() {
          pop(V(0.3, 3.7, -2.4), 'ブチッ', { size: 40 }); sfx.plastic();
          const b = ch.body; b.type = CANNON.Body.DYNAMIC; b.mass = 40; b.updateMassProperties(); b.wakeUp(); b.velocity.set(0, -3, 0);
          after(0.4, () => {
            shake(0.9); sfx.metal(); sfx.stone(); pop(V(0.3, 2.2, -2.2), 'ガッシャーン！！', { size: 60, cls: 'big' });
            emit(V(0.3, 1.0, -2.75), 30, { color: 0xffe9a8, hdr: 3, speed: [3, 9], size: [0.04, 0.08], life: [0.2, 0.5], grav: 6 });
            for (const o of R.sl) o.ko(V(0.6, 3, -1.2));
            if (door.alive) damage(door, 99, 'impact', V(0.3, 2, -1.6));
          });
        } });
      rug(0x2a3a6a, 0xd9a93a, 1.5, -0.6, 1.2);
      addProp(P.bookshelf(-3.4, -1.6, Math.PI / 2)); addProp(P.sofa(3.0, 0.2, -Math.PI / 2)); addProp(P.plant(3.25, -2.6)); addProp(P.lamp(-3.3, 0.4));
      addProp(P.vase(-2.2, 1.5)); addProp(P.books(-0.4, 0.15, 3.1)); addProp(P.globe(1.6, 0.28, 2.4)); addProp(P.chair(2.4, 2.9, 2.2)); addProp(P.crate(-2.6, 3.0));
      addProp(P.painting(-2.4, 2.4, 3, ['#2a2a3a', '#ffc531']));
      addProp(P.hint(-0.9, 0.02, 1.9, ...HINT.guard, { rotY: 0.3 }));
    },
    onScream() { if (S.room.wake) S.room.wake(); },
    update: sleeperUpdate,
  },
  // ------------------------------------------------------------ 3-2 水族館
  {
    id: 'aqua', code: '3-2', name: '水族館', mission: '水槽のダイヤル錠を解き、沈んだ鍵を取り出せ', stamp: '知らん。', teach: 'none', par: 1,
    pal: { wallType: 'dots', wallA: '#1f4a6a', wallB: '#1a3f5c', floorType: 'checker', floorA: '#cfe4ee', floorB: '#2f6a8a', floorUnit: 1.5, trim: 0x5fe3ff, ground: 0x1f4a6a, lampColor: 0xbfe8ff },
    start: [2.6, -2.3], assist: ['steeldoor'],
    hints: [[5, '水槽の中にTNTが浮いてる。ガラスなら叫べば割れる'], [13, '水は自分と反対側へ流れる。扉の正面に回り込んでから叫ぶ']],
    setup() {
      const R = S.room; R.tntReady = false; R.pending = false;
      addProp({ ...P.steelDoor(), onBreak() { S.openExit(); } });
      const water = mat(0x3fa8e0, { r: 0.1, op: 0.42 });
      addProp({ name: 'tank', kind: 'glass', size: [2.4, 1.8, 1.3], pos: [0, 0.9, -0.7], mass: 0, hp: 1, value: 4, color: 0xbfefff, chunks: 18, dopa: 30,
        immune: { punch: true, throw: true, impact: true },
        build(g, p) {
          bx(g, 2.5, 0.2, 1.4, 0x2a313c, 0, -0.8, 0);
          bx(g, 2.3, 1.5, 1.2, 0, 0, 0.0, 0, { mat: glassMat() });
          bx(g, 2.2, 1.25, 1.1, 0, 0, -0.1, 0, { mat: water });
          p.floaters = [-0.55, 0.55].map((x) => bx(g, 0.56, 0.56, 0.56, 0xd92b2b, x, 0.25, 0, { round: 0.03 }));
          for (let i = 0; i < 5; i++) bx(g, 0.22, 0.1, 0.05, 0xff8a1f, -0.9 + i * 0.45, -0.35 + (i % 2) * 0.3, 0.3 - (i % 3) * 0.25, { round: 0.02 });
        },
        update(p) { p.floaters.forEach((m, i) => { m.position.y = 0.25 + Math.sin(S.kid.t * 2 + i * 2) * 0.06; m.rotation.z = Math.sin(S.kid.t * 1.3 + i) * 0.15; }); },
        onPunch(p, kid) { sfx.bounce(); pop(V(p.pos.x, 1.6, p.pos.z + 0.8), 'ボヨン', { size: 38 }); say('分厚っ。殴っても割れん', 1.4); kid.recoil = 1; return true; },
        onBreak(p, src, from) {
          const k = S.kid, fx = from ? from.x : k.x, fz = from ? from.z : k.z;
          let dx = p.pos.x - fx, dz = p.pos.z - fz; const d = Math.hypot(dx, dz) || 1; dx /= d; dz /= d;
          const flow = V(dx, 0.1, dz);
          pop(V(0, 2.6, -0.7), 'ザバーン！！', { size: 60, cls: 'big' }); sfx.open(); shake(0.6);
          emit(V(0, 0.9, -0.7), 90, { color: [0x3fa8e0, 0x8fd4f5, 0xffffff], speed: [3, 9], size: [0.08, 0.2], life: [0.5, 1.1], grav: 12, up: 2, spread: 0.8, dir: flow });
          for (let i = 0; i < 5; i++) addDebrisFish(i, dx, dz);
          after(0.02, () => {
            for (const s of [-0.5, 0.5]) {
              const t = addProp(P.tnt(-dz * s, 0.9, -0.7 + dx * s));
              t.body.velocity.set(dx * 7.2, 2.6, dz * 7.2); t.thrownT = 3; t.body.wakeUp();
            }
            R.tntReady = true;
          });
        } });
      function addDebrisFish(i, dx, dz) {
        const f = addProp({ name: 'fish', kind: 'plastic', size: [0.26, 0.12, 0.08], pos: [-0.9 + i * 0.45, 0.8, -0.7], mass: 0.2, hp: 1, value: 0, noCount: true, throwable: true, color: 0xff8a1f, quiet: true, dopa: 2 });
        f.body.velocity.set(dx * rnd(3, 7), rnd(2, 5), dz * rnd(3, 7));
      }
      addProp(P.bench(-2.9, 2.6, 0.3)); addProp(P.plant(3.25, 3.2)); addProp(P.plant(-3.25, -2.9));
      addProp(P.trashcan(3.0, 0.9)); addProp(P.ropePost(-1.7, 1.2)); addProp(P.ropePost(1.7, 1.2));
      wallSign([{ t: '水槽をたたかないで', s: 34, c: '#fff' }], 1.5, 0.34, -2.2, 2.3, { w: 384, h: 90, bg: '#1f6a8a' });
      addProp(P.hint(-1.7, 1.5, WZ + 0.03, ...HINT.lab, { wall: true }));
    },
    update() { tntRefill(); },
  },
  // ------------------------------------------------------------ 3-3 ボウリング場
  {
    id: 'bowl', code: '3-3', name: 'ボウリング場', mission: '3人の見張りの交代時刻を割り出し、隙を突け', stamp: '知らん。', teach: 'none', noise: true, par: 2,
    swipe: 'roll', verbs: { swipe: '転がす' },
    pal: { wallType: 'panel', wallA: '#3a2a6a', wallB: '#30235a', floorType: 'wood', floorA: '#e8c98a', floorB: '#c29a55', floorUnit: 3, trim: 0xff2e7e, ground: 0x4a3a6a },
    start: [0.9, 2.7], assist: ['guard'], needThrow: true,
    hints: [[5, '見張りが一列に並んでる。先頭に球を転がす'], [14, '全員倒したら、ガラスの扉は叫んで割る']],
    setup() {
      addProp({ ...P.glassDoor(), onBreak() { S.openExit(); } });
      for (const [x, z] of [[-0.9, 0.4], [-0.95, -0.9], [-1.0, -2.2]]) addSleeper(x, z, LOOKS[(Math.abs(z) * 3 | 0) % LOOKS.length]);
      const lane = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 6.6), mat(0xf6dfae, { r: 0.35 })); lane.rotation.x = -Math.PI / 2; lane.position.set(-0.95, 0.012, -0.2); lane.receiveShadow = true; S.roomGroup.add(lane);
      for (const s of [-1, 1]) bx(S.roomGroup, 0.12, 0.08, 6.6, 0x2a2a30, -0.95 + s * 0.82, 0.04, -0.2);
      for (const [x, z, c] of [[0.3, 2.9, 0x1a1a22], [1.6, 2.2, 0x2f7fd1], [2.3, 3.0, 0xd92b2b], [1.5, 1.2, 0x2fa56a], [2.6, 1.6, 0x8d4fd1]]) addProp({ ...P.ball(x, z, c), kind: 'stone', mass: 3, hp: 6, name: 'bowlball' });
      for (let i = 0; i < 6; i++) { const r = i < 3 ? 0 : i < 5 ? 1 : 2, k = i < 3 ? i - 1 : i < 5 ? i - 3.5 : 0;
        addProp({ name: 'pin', kind: 'plastic', size: [0.2, 0.6, 0.2], pos: [2.5 + k * 0.32, 0.3, -2.9 + r * 0.3], mass: 0.5, hp: 1, throwable: true, color: 0xfdfdfd, chunks: 4, chunkColors: [0xfdfdfd, 0xd92b2b],
          build(g) { cy(g, 0.06, 0.09, 0.36, 0xfdfdfd, 0, -0.1, 0, { r: 0.3 }); sp(g, 0.07, 0xfdfdfd, 0, 0.2, 0, { r: 0.3 }); cy(g, 0.062, 0.062, 0.04, 0xd92b2b, 0, 0.08, 0); } }); }
      addProp(P.bench(2.6, -0.6, -Math.PI / 2)); addProp(P.cooler(-3.25, 2.6)); addProp(P.trashcan(-3.1, 0.6));
      wallSign([{ t: 'お静かに投球ください', s: 32, c: '#fff' }], 1.6, 0.34, 2.3, 2.3, { w: 400, h: 86, bg: '#ff2e7e' });
      addProp(P.hint(-2.0, 1.5, WZ + 0.03, ...HINT.guard, { wall: true }));
    },
    onScream() { if (S.room.wake) S.room.wake(); },
    update: sleeperUpdate,
  },
  // ------------------------------------------------------------ 3-4 スーパー
  {
    id: 'mart', code: '3-4', name: 'スーパー', mission: 'レジの暗証番号を調べ、バックヤードの鍵を借りよ', stamp: '知らん。', teach: 'none', noise: true, par: 1,
    swipe: 'charge', verbs: { swipe: '突進' },
    pal: { wallType: 'panel', wallA: '#f2efe6', wallB: '#e2ddd0', floorType: 'checker', floorA: '#f4f4ee', floorB: '#bfe0c8', floorUnit: 1.5, trim: 0x2fa56a, ground: 0x6a8a70 },
    start: [-2.6, 2.6], assist: ['door'],
    hints: [[5, 'カートに乗ってる。スワイプした方向へ突っ込む'], [13, '木の扉と人は吹っ飛ぶ。TNTの箱には突っ込まない方がいい']],
    setup() {
      addProp({ ...P.door({ hp: 12 }), onBreak() { S.openExit(); } });
      addSleeper(0.0, -2.6, { uniform: 0x2fa56a, cap: false, hair: 0x3a2a22, mustache: false });
      // shelves to smash through, TNT to steer round
      for (const x of [-1.75, 1.75]) for (const z of [-0.5, 0.25, 1.0]) addProp(P.crate(x, z, 0.7));
      for (const [x, z] of [[-1.25, -1.5], [1.25, -1.5], [-1.95, 1.75]]) addProp(P.tnt(x, 0.28, z));
      for (const [x, z] of [[2.8, 2.6], [2.2, 3.2], [3.1, 1.2]]) addProp(P.crate(x, z, 0.6));
      addProp(P.cooler(3.25, -2.6)); addProp(P.trashcan(-3.2, -2.8)); addProp(P.cone(0.9, 2.9));
      for (const [x, z] of [[-3.1, -0.9], [3.1, -0.8]]) addProp(P.barrel(x, z, 0xf0b93a));
      wallSign([{ t: '店内は走らないで', s: 34, c: '#fff' }], 1.5, 0.34, 2.3, 2.3, { w: 384, h: 90, bg: '#2fa56a' });
      addProp(P.hint(-1.75, 1.5, WZ + 0.03, ...HINT.study, { wall: true }));
    },
    onScream() { if (S.room.wake) S.room.wake(); },
    update: sleeperUpdate,
  },
  // ------------------------------------------------------------ 3-5 ボイラー室
  {
    id: 'boiler', code: '3-5', name: 'ボイラー室', mission: '配管図を読み解き、正しいバルブを順に閉めよ', stamp: '知らん。', teach: 'none', par: 2,
    pal: { wallType: 'block', wallA: '#5a4a44', wallB: '#4d3f3a', floorType: 'metal', floorA: '#5c5550', floorB: '#3f3a36', floorUnit: 1.9, floorR: 0.6, floorM: 0.4, trim: 0xf07a1f, ground: 0x4a3a34, lampColor: 0xffc890 },
    start: [-0.4, 2.6], assist: ['gauge', 'steeldoor'], needThrow: true,
    hints: [[5, '扉の横のガスメーターがガラス。割ればガスが出る'], [13, 'ガスが出たら離れて何か投げる。近くで殴ると自分も吹っ飛ぶ']],
    setup() {
      const R = S.room; R.gas = false; R.lit = false; R.gasT = 0; R.assist = ['gauge'];
      addProp({ ...P.steelDoor(), onBreak() { S.openExit(); } });
      addProp({ name: 'gauge', kind: 'glass', size: [0.7, 0.7, 0.2], pos: [1.6, 1.5, WZ + 0.11], mass: 0, hp: 1, value: 1, color: 0xbfefff, chunks: 8,
        build(g) {
          cy(g, 0.34, 0.34, 0.1, 0xd9a93a, 0, 0, -0.04, { rx: Math.PI / 2, r: 0.3, m: 0.9 });
          const m = new THREE.Mesh(new THREE.CircleGeometry(0.29, 24), texMat(label([{ t: 'GAS', s: 44, c: '#c22' }], { w: 128, h: 128, bg: '#fffdf2' }))); m.position.z = 0.015; g.add(m);
          bx(g, 0.03, 0.24, 0.02, 0xc22222, 0.05, 0.06, 0.03, { rz: -0.6 });
          cy(g, 0.3, 0.3, 0.05, 0, 0, 0, 0.06, { rx: Math.PI / 2, mat: glassMat() });
        },
        onBreak() { R.gas = true; R.assist = ['steeldoor']; sfx.whoosh(); after(0.4, () => say('シューッ…ガス漏れてる', 1.8)); } });
      // pipes and a boiler: steel, so only a blast moves them
      for (const y of [2.6, 3.0]) cy(S.roomGroup, 0.09, 0.09, RW, 0xb86a3a, 0, y, WZ + 0.14, { rz: Math.PI / 2, r: 0.4, m: 0.8 });
      cy(S.roomGroup, 0.09, 0.09, 1.2, 0xb86a3a, 1.6, 2.0, WZ + 0.14, { r: 0.4, m: 0.8 });
      addProp({ name: 'boiler', kind: 'metal', size: [1.5, 2.2, 1.5], pos: [-2.7, 1.1, -2.7], mass: 0, hp: 8, value: 3, color: 0x7a5a4a, chunks: 14, chunkColors: [0x7a5a4a, 0x5a4034, 0xb86a3a],
        immune: { punch: true, throw: true, scream: true, impact: true },
        build(g) { cy(g, 0.75, 0.75, 2.0, 0x7a5a4a, 0, -0.1, 0, { r: 0.45, m: 0.7 }); sp(g, 0.75, 0x7a5a4a, 0, 0.9, 0, { sy: 0.4, r: 0.45, m: 0.7 }); for (const y of [-0.6, 0.3]) cy(g, 0.78, 0.78, 0.08, 0xb86a3a, 0, y, 0, { r: 0.4, m: 0.8 }); sp(g, 0.12, 0xff5a1f, 0, 0.0, 0.74, { e: 0xff5a1f, ei: 2.5, noShadow: true }); },
        onPunch(p, kid) { sfx.clang(); pop(V(p.pos.x, 1.6, p.pos.z + 0.9), 'ゴーン', { size: 38 }); kid.recoil = 1; return true; } });
      addProp(P.barrel(3.1, -2.6, 0x8a8a8a)); addProp(P.barrel(3.1, -1.7, 0x8a8a8a));
      for (const [x, z] of [[-1.6, 1.4], [0.9, 1.7], [2.2, 2.6], [-2.6, 2.9]]) addProp(P.crate(x, z, 0.6));
      addProp(P.extinguisher(3.3, 0.6)); addProp(P.trashcan(-3.2, 0.4)); addProp(P.tire(1.9, 0.5));
      wallSign([{ t: '火気厳禁', s: 54, c: '#fff' }], 1.1, 0.36, -1.5, 2.1, { w: 256, h: 96, bg: '#d22' });
      addProp(P.hint(-1.6, 1.4, WZ + 0.03, ...HINT.lab, { wall: true }));
    },
    // any spark inside the gas cloud sets the lot off
    onSpark(pos) {
      const R = S.room;
      if (!R.gas || R.lit || R.gasT < 0.6 || S.game.exitOpen) return;   // the gas needs a moment to spread
      const c = V(0.7, 1.0, -2.6), r = Math.min(3.4, 1.4 + R.gasT * 0.9);
      if (Math.hypot(pos.x - c.x, pos.z - c.z) > r) return;
      R.lit = true;
      after(0.03, () => { pop(V(c.x, 2.6, c.z), 'ガス爆発！！', { size: 54, cls: 'big' }); explode(c, 4.0); });
    },
    update(dt) {
      const R = S.room;
      if (R.gas && !R.lit) {
        R.gasT += dt;
        const r = Math.min(3.4, 1.4 + R.gasT * 0.9);
        if (Math.random() < 0.7) emit(V(0.7 + rnd(-r, r) * 0.7, rnd(0.2, 1.6), -2.6 + rnd(-r, r) * 0.6), 1, { color: [0x9ee86a, 0xc8f59a], speed: [0.1, 0.5], size: [0.14, 0.26], life: [0.8, 1.5], grav: -0.4, drag: 2, grow: 1.4 });
      }
      refillThrowables();
    },
  },
  // ============================================================ STAGE 4 三枚抜き（試作）
  // Three barriers, several ways through each, no hints unless asked. Fewer moves is the whole game.
  {
    id: 'triple', code: '4-1', name: 'ガラスの向こう', mission: '3つの関門の解除コードを順に入力し、最深部へ進め', stamp: '知らん。', teach: 'none', noise: true, par: 2,
    pal: { wallType: 'panel', wallA: '#27414f', wallB: '#203744', floorType: 'checker', floorA: '#dfe6e4', floorB: '#3a5560', floorUnit: 1.5, trim: 0xffc531, ground: 0x27414f, lampColor: 0xd8f0ff },
    start: [0.4, 2.7], assist: ['guard', 'rope', 'steeldoor'], needThrow: true, noLamp: true,
    tips: ['叫び声は届く範囲がある。長押し中の黄色い輪がその範囲', '爆発に巻き込まれた見張りは、起きる前に気絶する', '天井のロープに物を投げると、鉄のシャンデリアが落ちる', '短く叫ぶほど輪は小さい。遠くの見張りには聞こえない'],
    setup() {
      const R = S.room, all = { punch: true, throw: true, scream: true, blast: true, impact: true };
      R.tntReady = true; R.pending = false; R.evMove = -1; R.evN = 0;
      // one move clearing several barriers is the moment to celebrate
      const barrier = () => {
        if (R.evMove !== S.game.moves) { R.evMove = S.game.moves; R.evN = 0; }
        R.evN++;
        if (R.evN >= 2) { S.game.slowT = Math.max(S.game.slowT, 0.5); shake(0.4); pop(V(0, 3.0, 0.5), `${R.evN}枚抜き！！`, { size: 66, cls: 'big' }); sfx.clear(); addDopamine(30); }
      };
      addProp({ ...P.steelDoor(), onBreak() { barrier(); S.openExit(); } });
      // armoured glass partition across the whole room
      R.wall = addProp({ name: 'gwall', kind: 'glass', size: [RW, 2.6, 0.14], pos: [0, 1.3, -1.0], mass: 0, hp: 1, value: 4, color: 0xbfefff, chunks: 18, dopa: 30, noPick: false,
        immune: { punch: true, throw: true, impact: true, blast: true },
        build(g) {
          bx(g, RW - 0.1, 2.5, 0.08, 0, 0, 0, 0, { mat: glassMat() });
          for (const x of [-RW / 2 + 0.06, -1.25, 1.25, RW / 2 - 0.06]) bx(g, 0.1, 2.6, 0.16, 0x8b97a6, x, 0, 0, { r: 0.38, m: 0.75 });
          bx(g, RW, 0.1, 0.16, 0x8b97a6, 0, 1.25, 0, { r: 0.38, m: 0.75 }); bx(g, RW, 0.1, 0.16, 0x8b97a6, 0, -1.25, 0, { r: 0.38, m: 0.75 });
          plane(g, 0.9, 0.3, texMat(label([{ t: '防弾ガラス', s: 44, c: '#fff' }], { w: 256, h: 86, bg: '#d22' })), -2.4, 0.4, 0.08);
        },
        onPunch(p, kid) { sfx.bounce(); pop(V(kid.x, 1.5, -0.6), 'ボヨン', { size: 38 }); kid.recoil = 1; return true; },
        onImpact(p, other, v) { if (other && other.thrownT > 0 && v > 3) { sfx.bounce(); pop(V(other.pos.x, 1.6, -0.6), 'ボヨン', { size: 32 }); } return true; },
        onBreak() { barrier(); } });
      // front zone: two sleepers in a line on the left, loose TNT on the right
      const front = (dir) => { if (!R.frontKO) R.frontKO = 0; R.frontKO++; if (R.frontKO === 2) barrier(); };
      addSleeper(-2.7, 1.9, LOOKS[1], 'しーーっ！！', { onKO: front }); addSleeper(-2.7, 0.5, LOOKS[2], 'こらーっ！！', { onKO: front });
      addProp(P.tnt(2.9, 0.28, 1.4));
      for (const [x, z] of [[1.4, 1.2], [2.0, 3.1], [-0.9, 3.1]]) addProp(P.crate(x, z, 0.6));
      addProp(P.ball(-1.3, 2.3, 0x3d7fd9));   // the middle of the room stays clear so a throw at the door has a clean line
      // back zone: a third sleeper by the door under an iron chandelier, TNT in a glass case
      addSleeper(1.75, -2.85, LOOKS[0], 'コラーッ！！');
      const ch = addProp({ name: 'ironch', kind: 'metal', size: [1.6, 0.5, 1.6], pos: [1.75, 3.0, -2.75], mass: 0, hp: 999, value: 0, noCount: true, noPick: true, immune: all,
        build(g) {
          const iron = mat(0x2a2a30, { r: 0.4, m: 0.8 });
          const t = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.06, 8, 28), iron); t.rotation.x = Math.PI / 2; g.add(t);
          for (let i = 0; i < 4; i++) bx(g, 1.5, 0.05, 0.07, 0, 0, 0.02, 0, { mat: iron, ry: i * Math.PI / 4 });
          for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; sp(g, 0.06, 0xffe19a, Math.cos(a) * 0.75, 0.16, Math.sin(a) * 0.75, { e: 0xffc860, ei: 3, noShadow: true }); }
        } });
      addProp({ name: 'rope', kind: 'wood', size: [0.2, 0.85, 0.2], pos: [1.75, 3.72, -2.75], mass: 0, hp: 1, value: 0, noCount: true, quiet: true, dopa: 0, color: 0xc9a877, chunks: 4,
        build(g) { cy(g, 0.045, 0.045, 0.85, 0xc9a877, 0, 0, 0); sp(g, 0.1, 0xb08a55, 0, -0.3, 0); },
        onPunch() { say('届かん！！'); return true; },
        onBreak() {
          pop(V(1.75, 3.7, -2.4), 'ブチッ', { size: 40 }); sfx.plastic();
          const b = ch.body; b.type = CANNON.Body.DYNAMIC; b.mass = 40; b.updateMassProperties(); b.wakeUp(); b.velocity.set(0, -3, 0);
          after(0.4, () => { shake(0.8); sfx.metal(); pop(V(1.75, 2.2, -2.2), 'ガッシャーン', { size: 52, cls: 'big' }); for (const o of R.sl) if (o.z < -2) o.ko(V(1.75, 3, -1.6)); });
        } });
      addProp(P.glassCase(-2.3, -2.6, () => {}));
      addProp(P.goldPile(3.0, -1.8)); addProp(P.moneyBag(-0.8, -2.9)); addProp(P.plant(-3.25, 3.2));
      addProp(P.hint(-1.75, 1.5, WZ + 0.03, ...HINT.vault, { wall: true }));
    },
    update() { sleeperUpdate(); tntRefill(); },
  },
  // ------------------------------------------------------------ 4-2 火薬庫
  {
    id: 't2', code: '4-2', name: '火薬庫', mission: '火薬の在庫表と照合し、欠けている番号を答えよ', stamp: '知らん。', teach: 'none', noise: true, par: 3,
    pal: { wallType: 'block', wallA: '#7a8590', wallB: '#69747f', floorType: 'metal', floorA: '#6a747c', floorB: '#4c555c', floorUnit: 1.9, floorR: 0.6, floorM: 0.4, trim: 0xf5c518, ground: 0x4a5560 },
    start: [2.7, 3.0], assist: ['guard', 'tnt', 'steeldoor'], needThrow: true, noLamp: true,
    tips: ['爆発に巻き込まれた見張りは、起きる前に気絶する', 'TNTは投げなくても、何かを当てれば爆発する', 'ガラスの壁は爆風を通さない。音は通る', 'ガラスケースも、叫べば割れる'],
    setup() {
      const R = S.room, barrier = mkBarrier(); R.tntReady = false; R.pending = false;
      addProp({ ...P.steelDoor(), onBreak() { barrier(); S.openExit(); } });
      R.wall = addProp(glassWall(barrier));
      let down = 0;
      [[-1.6, -0.2], [-0.2, -0.2], [1.2, -0.2]].forEach(([x, z], i) => addSleeper(x, z, LOOKS[i + 1], 'コラーッ！！', { onKO() { if (++down === 3) barrier(); } }));
      addProp(P.tnt(-0.2, 0.28, 1.0));
      addProp(P.glassCase(-2.3, -2.6, () => { R.tntReady = true; }));
      for (const [x, z] of [[2.0, 2.2], [3.1, 1.7], [-2.6, 3.0], [1.2, 3.3]]) addProp(P.crate(x, z, 0.6));
      addProp(P.ball(-1.3, 2.9, 0xd94848)); addProp(P.cone(-3.1, 1.6));
      addProp(P.goldPile(2.6, -2.4)); addProp(P.moneyBag(0.9, -2.9));
      addProp(P.hint(1.75, 1.5, WZ + 0.03, ...HINT.lab, { wall: true }));
    },
    update() { sleeperUpdate(); tntRefill(); refillThrowables(); },
  },
  // ------------------------------------------------------------ 4-3 静かな展示室
  {
    id: 't3', code: '4-3', name: '静かな展示室', mission: '4人の見張りの死角を計算し、展示ケースの番号を読み取れ', stamp: '知らん。', teach: 'none', noise: true, par: 2,
    pal: { wallType: 'dots', wallA: '#efe8d8', wallB: '#e0d6c0', floorType: 'carpet', floorA: '#6a2440', floorB: '#84304f', floorUnit: 1.5, trim: 0xd9a93a, ground: 0x6a3a48 },
    start: [0.7, 3.1], assist: ['guard'], needThrow: true, noLamp: true,
    tips: ['叫ぶ場所で、聞こえる相手が変わる', '長押し中の黄色い輪に入った見張りだけが起きる', '短く叫ぶほど輪は小さい', '全員を黙らせる必要はない'],
    setup() {
      const barrier = mkBarrier();
      addProp({ ...P.glassDoor(), onBreak() { barrier(); S.openExit(); } });
      [[2.6, -2.7], [-2.9, 0.4], [-1.0, 2.4], [2.9, 1.6]].forEach(([x, z], i) => addSleeper(x, z, LOOKS[(i + 3) % LOOKS.length]));
      for (const [x, z] of [[-1.2, -2.6], [1.0, 0.2]]) { addProp(P.pedestal(x, z)); addProp(P.glassArt(x, 1.42, z, x > 0 ? 1 : 2)); }
      addProp(P.vase(-3.2, -2.9, 0.42, true)); addProp(P.vase(0.2, -1.2, 0.42, true));
      for (const [x, z] of [[1.9, 3.2], [-0.4, 1.2], [-2.6, 3.2]]) addProp(P.ropePost(x, z));
      addProp(P.books(2.0, 0.15, 2.6)); addProp(P.books(-0.6, 0.15, 3.3)); addProp(P.trophy(1.6, 0.28, 1.2));
      addProp(P.painting(-2.45, 2.35, 1, ['#f2e7c8', '#c22a3a'])); addProp(P.painting(2.45, 2.35, 0, ['#1f3a6a', '#f0b93a']));
      addProp(P.hint(-1.4, 1.5, WZ + 0.03, ...HINT.gallery, { wall: true }));
    },
    update() { sleeperUpdate(); refillThrowables(); },
  },
  // ------------------------------------------------------------ 4-4 シャンデリアの間
  {
    id: 't4', code: '4-4', name: 'シャンデリアの間', mission: '2つのシャンデリアの灯りの数から、扉の暗証番号を導け', stamp: '知らん。', teach: 'none', noise: true, par: 4,
    pal: { wallType: 'stripe', wallA: '#5a2f4a', wallB: '#4d2740', floorType: 'wood', floorA: '#8f5f3d', floorB: '#6a4028', floorUnit: 3, trim: 0xf4e9d0, ground: 0x5a3a40 },
    start: [-0.6, 2.9], assist: ['guard', 'rope'], needThrow: true, noLamp: true,
    tips: ['ロープで吊ってある物は、ロープに何か当てると落ちる', 'ロープは壁の上を越えて狙える', '全員黙らせてから大きく叫ぶと、ガラスは全部まとめて割れる', '一列に並んだ見張りは、先頭に当てるとまとめて倒れる'],
    setup() {
      const R = S.room, barrier = mkBarrier();
      addProp({ ...P.glassDoor(), onBreak() { barrier(); S.openExit(); } });
      R.wall = addProp(glassWall(barrier));
      for (const x of [1.75, -1.75]) { addSleeper(x, -2.85, LOOKS[x > 0 ? 0 : 5]); ironChandelier(x, -2.85); }
      let down = 0;
      [[2.7, 2.2], [2.7, 0.9]].forEach(([x, z], i) => addSleeper(x, z, LOOKS[i + 1], 'コラーッ！！', { onKO() { if (++down === 2) barrier(); } }));
      for (const [x, z] of [[-1.8, 2.2], [0.6, 3.3], [-2.9, 0.6], [1.0, 1.4], [-2.2, 3.3]]) addProp(P.crate(x, z, 0.6));
      addProp(P.vase(-3.2, -0.3)); addProp(P.books(0.2, 0.15, 0.6)); addProp(P.plant(3.25, 3.3));
      addProp(P.moneyBag(0.0, -2.2)); addProp(P.hint(-0.0, 0.02, 2.0, ...HINT.guard, { rotY: 0.4 }));
    },
    update() { sleeperUpdate(); refillThrowables(); },
  },
  // ------------------------------------------------------------ 4-5 最深部
  {
    id: 't5', code: '4-5', name: '最深部', mission: '6人の見張りの交代時刻をすべて記録し、金庫の暗号を完成させよ', stamp: '知らん。', teach: 'none', noise: true, par: 3,
    pal: { wallType: 'panel', wallA: '#2c4f57', wallB: '#22424a', floorType: 'checker', floorA: '#dfe6e4', floorB: '#2f4a50', floorUnit: 1.5, trim: 0xffc531, ground: 0x2a4a50, lampColor: 0xd8f0ff },
    start: [0.4, 3.1], assist: ['guard', 'tnt', 'vault'], needThrow: true, noLamp: true,
    tips: ['爆発は、近くの見張りをまとめて黙らせる', 'TNTは投げなくても、何かを当てれば爆発する', 'TNTをどこで使うかで手数が変わる', '遠くから短く叫べば、奥の見張りには聞こえない'],
    setup() {
      const R = S.room, barrier = mkBarrier(); R.tntReady = true; R.pending = false;
      addProp({ ...P.vaultDoor(), onBreak() { barrier(); S.openExit(); } });
      R.wall = addProp(glassWall(barrier));
      let back = 0, front = 0;
      for (const x of [1.75, -1.75]) addSleeper(x, -2.85, LOOKS[x > 0 ? 0 : 4], 'コラーッ！！', { onKO() { if (++back === 2) barrier(); } });
      [[-2.7, 1.6], [-2.7, 0.3], [2.7, 1.6], [2.7, 0.3]].forEach(([x, z], i) => addSleeper(x, z, LOOKS[(i + 1) % LOOKS.length], 'コラーッ！！', { onKO() { if (++front === 4) barrier(); } }));
      addProp(P.tnt(0.3, 0.28, 0.9));
      for (const [x, z] of [[-1.4, 2.9], [1.6, 2.6], [-0.7, 1.9], [1.3, 3.4]]) addProp(P.crate(x, z, 0.6));
      addProp(P.ball(-2.0, 3.3, 0x2fa56a)); addProp(P.goldPile(3.0, -1.8)); addProp(P.goldPile(-3.0, -1.8)); addProp(P.moneyBag(0.9, -2.3));
      addProp(P.hint(-2.9, 1.5, WZ + 0.03, ...HINT.vault, { wall: true }));
    },
    update() { sleeperUpdate(); tntRefill(); refillThrowables(); },
  },
];

// ====================================================================== generated stages (STAGE 3 and up)
// Hand-built rooms teach the verbs; from STAGE 3 the rooms are assembled from the same parts with the
// difficulty knobs turned up a little every stage.
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const roman = (n) => { let out = ''; for (const [v, t] of [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]) while (n >= v) { out += t; n -= v; } return out; };
export const LAST_STAGE = 200;
const THEMES = [
  { name: '工場', twist: 'boom', rooms: ['搬入口', '組立ライン', '検査室', '守衛所', '制御室'], tall: ['metalShelf', 'locker', 'cooler'], small: ['crate', 'barrel', 'cone', 'tire', 'steelCrate', 'extinguisher'],
    pal: { wallType: 'block', wallA: '#7a8590', wallB: '#69747f', floorType: 'metal', floorA: '#6a747c', floorB: '#4c555c', floorUnit: 1.9, floorR: 0.6, floorM: 0.4, trim: 0xf5c518, ground: 0x4a5560 } },
  { name: 'オフィス', twist: 'paper', rooms: ['受付', '会議室', 'ガラス張りの部屋', '夜勤フロア', '社長室'], tall: ['locker', 'bookshelf', 'cooler', 'plant'], small: ['chair', 'trashcan', 'books', 'schoolDesk', 'globe'],
    pal: { wallType: 'panel', wallA: '#c9d3dc', wallB: '#b6c1cc', floorType: 'carpet', floorA: '#4a5a6e', floorB: '#58697f', floorUnit: 1.5, trim: 0x3d7fd9, ground: 0x566070 } },
  { name: '博物館', twist: 'glass', rooms: ['化石の間', '企画展示室', '水晶の間', '夜の展示室', '宝物庫'], tall: ['pedestal', 'skeleton', 'plant'], small: ['vase', 'ropePost', 'trophy', 'books'],
    pal: { wallType: 'dots', wallA: '#efe8d8', wallB: '#e0d6c0', floorType: 'carpet', floorA: '#6a2440', floorB: '#84304f', floorUnit: 1.5, trim: 0xd9a93a, ground: 0x6a3a48 } },
  { name: '銀行', rooms: ['通用口', '窓口フロア', '応接室', '警備詰所', '大金庫'], tall: ['safe', 'locker', 'plant'], small: ['goldPile', 'moneyBag', 'steelCrate', 'chair'],
    pal: { wallType: 'panel', wallA: '#2c4f57', wallB: '#22424a', floorType: 'checker', floorA: '#dfe6e4', floorB: '#2f4a50', floorUnit: 1.5, trim: 0xffc531, ground: 0x2a4a50, lampColor: 0xd8f0ff } },
  { name: '放課後の学校', twist: 'balls', rooms: ['昇降口', '体育倉庫', '美術室', '職員室', '理事長室'], tall: ['tobibako', 'bookshelf', 'piano'], small: ['ball', 'drum', 'schoolDesk', 'books', 'chair'],
    pal: { wallType: 'panel', wallA: '#d9b382', wallB: '#c49a66', floorType: 'wood', floorA: '#e3b574', floorB: '#b98548', floorUnit: 3, trim: 0x2f7fd1, ground: 0x7a5a3a } },
  { name: '洋館', twist: 'glass', rooms: ['玄関ホール', '書庫', '温室', '使用人部屋', '隠し金庫'], tall: ['bookshelf', 'lamp', 'plant', 'sofa'], small: ['crate', 'chair', 'vase', 'books'],
    pal: { wallType: 'stripe', wallA: '#5a2f4a', wallB: '#4d2740', floorType: 'wood', floorA: '#8f5f3d', floorB: '#6a4028', floorUnit: 3, trim: 0xf4e9d0, ground: 0x5a3a40 } },
  { name: '研究所', twist: 'bigblast', rooms: ['搬入室', '実験棟', '培養室', '監視室', '最深部'], tall: ['skeleton', 'cooler', 'metalShelf'], small: ['trashcan', 'extinguisher', 'ball', 'barrel', 'steelCrate'],
    pal: { wallType: 'block', wallA: '#dfe8ea', wallB: '#c9d6da', floorType: 'checker', floorA: '#e8eef0', floorB: '#9fb4bb', floorUnit: 1.5, trim: 0x5fb0c0, ground: 0x6a8088, lampColor: 0xe8f6ff } },
  { name: '宇宙船', twist: 'lowgrav', rooms: ['エアロック', '貨物室', '展望デッキ', '冷凍睡眠室', '動力炉'], tall: ['locker', 'metalShelf', 'cooler'], small: ['steelCrate', 'barrel', 'tire', 'cone', 'ball'],
    pal: { wallType: 'panel', wallA: '#3a3360', wallB: '#2e2850', floorType: 'metal', floorA: '#4a4a66', floorB: '#33334a', floorUnit: 1.9, floorR: 0.5, floorM: 0.6, trim: 0x5fe3ff, ground: 0x2a2a50, lampColor: 0xbfe8ff } },
];
const LOOKS = [
  {}, { uniform: 0x4f7a5a, cap: false, bun: true, glasses: true, mustache: false, hair: 0x5a3a2a }, { uniform: 0x7a5a3a, cap: false, bald: true, glasses: true, hair: 0xdddddd },
  { uniform: 0x8d4fd1, cap: false, hair: 0x2a2a2a, glasses: true }, { uniform: 0x3a3a44, cap: false, bald: true, hair: 0xf2f2f2 }, { uniform: 0xa0182c, dark: 0x3a0a14 },
];
function tallProps(key, side, z, i) {
  const ry = side < 0 ? Math.PI / 2 : -Math.PI / 2, X = (d) => side * (RW / 2 - d);
  switch (key) {
    case 'metalShelf': return [P.metalShelf(X(0.4), z, ry)];
    case 'locker': return [P.locker(X(0.4), z - 0.4, ry), P.locker(X(0.4), z + 0.4, ry, 0x8a6a5d)];
    case 'bookshelf': return [P.bookshelf(X(0.38), z, ry)];
    case 'cooler': return [P.cooler(X(0.5), z)];
    case 'plant': return [P.plant(X(0.55), z)];
    case 'lamp': return [P.lamp(X(0.45), z)];
    case 'skeleton': return [P.skeleton(X(0.5), z)];
    case 'safe': return [P.safe(X(0.7), z)];
    case 'tobibako': return [P.tobibako(X(0.55), z, ry)];
    case 'piano': return [P.piano(X(0.5), z, ry)];
    case 'sofa': return [P.sofa(X(0.55), z, ry)];
    default: return [P.pedestal(X(0.6), z), P.glassArt(X(0.6), 1.42, z, i)];
  }
}
function smallProp(key, x, z, r, boom) {
  switch (key) {
    case 'barrel': return P.barrel(x, z, [0x2f7fd1, 0xf07a1f, 0x2fa56a][(r * 3) | 0], boom && r < 0.6);
    case 'cone': return P.cone(x, z);
    case 'tire': return P.tire(x, z);
    case 'steelCrate': return P.steelCrate(x, z);
    case 'extinguisher': return P.extinguisher(x, z);
    case 'chair': return P.chair(x, z, r * 6);
    case 'trashcan': return P.trashcan(x, z);
    case 'books': return P.books(x, 0.15, z);
    case 'schoolDesk': return P.schoolDesk(x, z, r - 0.5);
    case 'globe': return P.globe(x, 0.28, z);
    case 'vase': return P.vase(x, z);
    case 'ropePost': return P.ropePost(x, z);
    case 'trophy': return P.trophy(x, 0.28, z);
    case 'goldPile': return P.goldPile(x, z);
    case 'moneyBag': return P.moneyBag(x, z);
    case 'ball': return P.ball(x, z, [0xf07a1f, 0xd94848, 0x3d7fd9, 0xf0b93a][(r * 4) | 0]);
    case 'drum': return P.drum(x, z);
    default: return P.crate(x, z);
  }
}
function buttonsUpdate() {
  const R = S.room;
  if (!R.pressed) {
    for (let i = 0; i < R.lit.length; i++) {
      if (R.lit[i] > -50 && S.game.roomTime - R.lit[i] >= R.win) {
        R.lit[i] = -99;
        const c = R.btn[i].cap; c.material = mat(0xff2a2a, { e: 0xff1a1a, ei: 1.6, r: 0.35 }); c.position.z = 0.02;
        sfx.error(); say('時間切れ。もっと速く全部に当てる', 1.8);
      }
    }
    refillThrowables();
  }
}

// ---- parts shared by the generated three-barrier rooms
const MISSIONS = [
  '3つの関門の解除コードを順に入力し、最深部へ進め', '見張りの交代表を入手し、巡回の隙を割り出せ', '壁の暗号と床の模様を照合し、正しい扉を選べ',
  '配電盤のヒューズを正しい順に差し替えよ', '鍵は3つに分割されている。すべて集めて組み立てよ', '監視カメラの死角だけを通って出口へ向かえ',
  '4桁の暗証番号は、室内の数字をすべて足した値である', '赤・青・黄のスイッチを、正しい順に押せ', '見張りの寝言から暗号を聞き取れ',
];
const TIPS = [
  '叫び声は届く範囲がある。長押し中の黄色い輪がその範囲', '爆発に巻き込まれた見張りは、起きる前に気絶する', '一列に並んだ見張りは、先頭に当てるとまとめて倒れる',
  '短く叫ぶほど輪は小さい。遠くの見張りには聞こえない', '木は殴る、ガラスは叫ぶ、鉄は爆破', 'ロープで吊ってある物は、ロープに何か当てると落ちる',
];
function glassWall(onBreak, dbl) {
  let lines = null;
  return { name: 'gwall', kind: 'glass', cracks: dbl ? 1 : 0,
    onCrack() { if (lines) lines.visible = true; }, size: [RW, 2.6, 0.14], pos: [0, 1.3, -1.0], mass: 0, hp: 1, value: 4, color: 0xbfefff, chunks: 18, dopa: 30,
    immune: { punch: true, throw: true, impact: true, blast: true },
    build(g) {
      bx(g, RW - 0.1, 2.5, 0.08, 0, 0, 0, 0, { mat: glassMat() });
      for (const x of [-RW / 2 + 0.06, -1.25, 1.25, RW / 2 - 0.06]) bx(g, 0.1, 2.6, 0.16, 0x8b97a6, x, 0, 0, { r: 0.38, m: 0.75 });
      bx(g, RW, 0.1, 0.16, 0x8b97a6, 0, 1.25, 0, { r: 0.38, m: 0.75 }); bx(g, RW, 0.1, 0.16, 0x8b97a6, 0, -1.25, 0, { r: 0.38, m: 0.75 });
      plane(g, 0.9, 0.3, texMat(label([{ t: dbl ? '二重ガラス' : '防弾ガラス', s: 44, c: '#fff' }], { w: 256, h: 86, bg: dbl ? '#7a2fd1' : '#d22' })), -2.4, 0.4, 0.08);
      if (dbl) {   // a second pane, and the cracks that show after the first scream
        bx(g, RW - 0.1, 2.5, 0.05, 0, 0, 0, -0.12, { mat: glassMat() });
        lines = new THREE.Group(); lines.visible = false; g.add(lines);
        const lm = new THREE.MeshBasicMaterial({ color: 0xffffff });
        for (let i = 0; i < 22; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(rnd(0.5, 1.5), 0.025), lm); m.position.set(rnd(-3.4, 3.4), rnd(-1.0, 1.0), 0.06); m.rotation.z = rnd(0, Math.PI); lines.add(m); }
      }
    },
    onPunch(p, kid) { sfx.bounce(); pop(V(kid.x, 1.5, -0.6), 'ボヨン', { size: 38 }); kid.recoil = 1; return true; },
    onImpact(p, other, v) { if (other && other.thrownT > 0 && v > 3) { sfx.bounce(); pop(V(other.pos.x, 1.6, -0.6), 'ボヨン', { size: 32 }); } return true; },
    onBreak };
}
// Iron chandelier on a single rope: cut the rope and it flattens whoever dozes underneath.
function ironChandelier(x, z) {
  const R = S.room, all = { punch: true, throw: true, scream: true, blast: true, impact: true };
  const ch = addProp({ name: 'ironch', kind: 'metal', size: [1.6, 0.5, 1.6], pos: [x, 3.0, z + 0.1], mass: 0, hp: 999, value: 0, noCount: true, noPick: true, immune: all,
    build(g) {
      const iron = mat(0x2a2a30, { r: 0.4, m: 0.8 });
      const t = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.06, 8, 28), iron); t.rotation.x = Math.PI / 2; g.add(t);
      for (let i = 0; i < 4; i++) bx(g, 1.5, 0.05, 0.07, 0, 0, 0.02, 0, { mat: iron, ry: i * Math.PI / 4 });
      for (let i = 0; i < 6; i++) { const a = i / 6 * 6.28; sp(g, 0.06, 0xffe19a, Math.cos(a) * 0.75, 0.16, Math.sin(a) * 0.75, { e: 0xffc860, ei: 3, noShadow: true }); }
    } });
  addProp({ name: 'rope', kind: 'wood', size: [0.2, 0.85, 0.2], pos: [x, 3.72, z + 0.1], mass: 0, hp: 1, value: 0, noCount: true, quiet: true, dopa: 0, color: 0xc9a877, chunks: 4,
    build(g) { cy(g, 0.045, 0.045, 0.85, 0xc9a877, 0, 0, 0); sp(g, 0.1, 0xb08a55, 0, -0.3, 0); },
    onPunch() { say('届かん！！'); return true; },
    onBreak() {
      pop(V(x, 3.7, z + 0.5), 'ブチッ', { size: 40 }); sfx.plastic();
      const b = ch.body; b.type = CANNON.Body.DYNAMIC; b.mass = 40; b.updateMassProperties(); b.wakeUp(); b.velocity.set(0, -3, 0);
      after(0.4, () => { shake(0.8); sfx.metal(); pop(V(x, 2.2, z + 0.6), 'ガッシャーン', { size: 52, cls: 'big' }); for (const o of R.sl) if (Math.hypot(o.x - x, o.z - z) < 1.2) o.ko(V(x, 3, z + 1.2)); });
    } });
}

// Extra rules layered on the three-barrier rooms. Seven kinds take turns, one per stage; later laps add a second one.
const PRIM = ['helmet', 'charge', 'speaker', 'pull', 'blow', 'stomp', 'kick'];
// each lap through the seven stacks a different second (and later third) rule on top, so a kind of stage never comes back unchanged
const LAPS = {
  helmet: [['helmet'], ['helmet', 'speaker'], ['helmet', 'kick'], ['helmet', 'speaker', 'stomp']],
  charge: [['charge'], ['charge', 'speaker'], ['charge', 'stomp'], ['charge', 'speaker', 'stomp']],
  speaker: [['speaker'], ['speaker', 'stomp'], ['speaker', 'helmet'], ['speaker', 'kick']],
  pull: [['pull'], ['pull', 'speaker'], ['pull', 'blow'], ['pull', 'speaker']],
  blow: [['blow'], ['blow', 'stomp'], ['blow', 'kick'], ['blow', 'stomp', 'kick']],
  stomp: [['stomp'], ['stomp', 'speaker'], ['stomp', 'helmet'], ['stomp', 'kick']],
  kick: [['kick'], ['kick', 'speaker'], ['kick', 'helmet'], ['kick', 'helmet', 'speaker']],
};
function rulesFor(w) { return LAPS[PRIM[(w - 5) % PRIM.length]][Math.floor((w - 5) / PRIM.length) % 4]; }
const RULE_TIPS = {
  helmet: ['ヘルメットは鉄。投げても効かない', 'ヘルメットの見張りは、爆発か、飛んできた仲間で倒れる'],
  speaker: ['マイクに届くように叫ぶと、スピーカーからも声が出る', 'マイクは木。殴れば壊れる'],
  charge: ['スワイプした方向へカートで突っ込む。木と人は吹っ飛ぶ', '鉄とガラスの壁には跳ね返される'],
  pull: ['スワイプすると、じゅうたんの端まで走って引っこ抜く', 'じゅうたんはガラスの壁の下も通っている'],
  blow: ['長押しで息を吹く。音は出ない', '軽い物がまわりに吹っ飛ぶ。見張りとの間に物を挟んで吹く'],
  stomp: ['見張りの足元が木の板なら、踏み抜けば落ちる'],
  kick: ['蹴った物は壁で跳ね返って戻ってくる', '斜めに蹴ると、部屋じゅうを走り回る'],
};
const RULE_SAY = { helmet: 'ヘルメットかぶってる。鉄だ', speaker: 'マイクとスピーカーがある', charge: 'カートがある。乗る', pull: 'じゅうたんだ。引っこ抜ける', blow: 'ここは叫べない。吹く', stomp: '床が板だ。踏み抜ける', kick: 'ここは蹴る' };
const RULE_NAME = { helmet: 'ヘルメット', charge: '突進', speaker: 'スピーカー', pull: '引っぱる', blow: '吹く', stomp: '踏む', kick: '蹴る' };
const RULE_VERB = { charge: ['swipe', '突進'], pull: ['swipe', '引っぱる'], kick: ['swipe', '蹴る'], blow: ['hold', '吹く'], stomp: ['tap', '踏む'] };
// A rug with sleepers on it: yank it from the handle end and everyone on it goes over.
function addRug(x0, x1, z0, z1, stand, far) {
  const R = S.room; R.rugs = R.rugs || [];
  const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, col = [0xb8323a, 0x2f6fb5, 0x2f8a5a, 0x8a4fb5][R.rugs.length % 4];
  const prop = addProp({ name: 'rug', kind: 'paper', size: [w, 0.04, d], pos: [cx, 0.02 + R.rugs.length * 0.006, cz], mass: 0, hp: 999, value: 0, noCount: true, noPick: true, quiet: true, dopa: 0, color: col, chunks: 6,
    immune: { punch: true, throw: true, scream: true, blast: true, impact: true },
    build(g) {
      bx(g, w, 0.03, d, col, 0, 0, 0); bx(g, w - 0.24, 0.034, d - 0.24, 0xf4e9d0, 0, 0, 0); bx(g, w - 0.4, 0.038, d - 0.4, col, 0, 0, 0);
      const hx = stand[0] - cx, hz = stand[1] - cz, m = Math.max(Math.abs(hx) / (w / 2), Math.abs(hz) / (d / 2));   // tassels at the handle end
      for (let i = -2; i <= 2; i++) bx(g, Math.abs(hx) > Math.abs(hz) ? 0.16 : 0.07, 0.03, Math.abs(hx) > Math.abs(hz) ? 0.07 : 0.16, 0xffd23a, hx / m + (Math.abs(hx) > Math.abs(hz) ? Math.sign(hx) * 0.08 : i * 0.2), 0, hz / m + (Math.abs(hx) > Math.abs(hz) ? i * 0.2 : Math.sign(hz) * 0.08));
    } });
  const rug = { stand, far, done: false, prop,
    pull() {
      if (rug.done) return; rug.done = true;
      sfx.whoosh(); shake(0.45); hitStop(0.05); pop(V(stand[0], 1.8, stand[1]), 'ズルッ！！', { size: 54, cls: 'big' });
      for (const o of R.sl) if (o.asleep() && o.x > x0 && o.x < x1 && o.z > z0 && o.z < z1) o.ko(V(far[0], 0.9, far[1]));
      breakProp(prop, 'throw', V(far[0], 0, far[1]));
    } };
  R.rugs.push(rug); return rug;
}
// A wooden trapdoor: stomp it and whoever stands on it drops.
function addPlank(x, z) {
  const R = S.room;
  return addProp({ name: 'plank', kind: 'wood', size: [1.5, 0.06, 1.5], pos: [x, 0.03, z], mass: 0, hp: 1, value: 1, quiet: true, color: 0xc9a877, chunks: 8,
    build(g) { for (let i = -2; i <= 2; i++) bx(g, 0.27, 0.06, 1.46, i % 2 ? 0x6a4028 : 0x8a5a3a, i * 0.3, 0, 0); for (const zz of [-0.69, 0.69]) bx(g, 1.5, 0.07, 0.1, 0xf5c518, 0, 0, zz); for (const xx of [-0.69, 0.69]) bx(g, 0.1, 0.07, 1.5, 0xf5c518, xx, 0, 0); },
    onPunch(p, kid) { kid.jumpT = 1; sfx.punch(0.7); after(0.12, () => damage(p, 99, 'punch', kid.pos3())); return true; },   // a stomp is one clean thud, not a racket
    onBreak() {
      pop(V(x, 1.2, z), 'バキッ！！', { size: 46, cls: 'big' }); shake(0.4);
      const hole = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), new THREE.MeshBasicMaterial({ color: 0x08080c })); hole.rotation.x = -Math.PI / 2; hole.position.set(x, 0.012, z); S.roomGroup.add(hole);
      for (const o of R.sl) if (o.asleep() && Math.abs(o.x - x) < 0.8 && Math.abs(o.z - z) < 0.8) o.ko(V(x + rnd(-0.3, 0.3), 3, z + 0.6));
    } });
}
function micProp(x, z) {
  return { name: 'mic', kind: 'wood', size: [0.34, 1.4, 0.34], pos: [x, 0.7, z], mass: 0, hp: 1, value: 1, color: 0x8a5a3a, chunks: 5,
    build(g) {
      cy(g, 0.22, 0.26, 0.06, 0x6a4028, 0, -0.67, 0); cy(g, 0.03, 0.03, 1.2, 0x8a5a3a, 0, -0.05, 0);
      sp(g, 0.12, 0x333338, 0, 0.6, 0, { r: 0.4, m: 0.7 }); sp(g, 0.035, 0xff3a3a, 0, 0.44, 0.06, { e: 0xff2020, ei: 3, noShadow: true });
    } };
}
function speakerProp(x, z) {
  const ry = Math.atan2(-x, -1 - z);
  return { name: 'speaker', kind: 'wood', size: [0.8, 1.3, 0.6], pos: [x, 0.65, z], mass: 0, hp: 3, value: 2, color: 0x6a4028, chunks: 8,
    build(g) {
      const h = new THREE.Group(); h.rotation.y = ry; g.add(h);
      bx(h, 0.8, 1.3, 0.6, 0xb5793f, 0, 0, 0, { round: 0.03 });
      cy(h, 0.27, 0.27, 0.05, 0x222226, 0, -0.25, 0.3, { rx: Math.PI / 2 }); cy(h, 0.12, 0.12, 0.07, 0x55555c, 0, -0.25, 0.31, { rx: Math.PI / 2 });
      cy(h, 0.14, 0.14, 0.05, 0x222226, 0, 0.33, 0.3, { rx: Math.PI / 2 }); cy(h, 0.06, 0.06, 0.07, 0xff5a9a, 0, 0.33, 0.31, { rx: Math.PI / 2 });
    } };
}

// Every generated room is the same kind of problem as 4-1: sleepers, maybe a glass wall, an exit of one material,
// and a few tools lying about. What changes from room to room is the arrangement, so the shortest way through changes too.
function genDef(w, c) {
  const th = THEMES[(w - 5) % THEMES.length], cyc = Math.floor((w - 5) / THEMES.length);
  const rules = rulesFor(w), has = (n) => rules.includes(n);
  const mode = ['charge', 'pull', 'kick'].find(has) || 'throw', blowOn = has('blow');
  const noTnt = mode === 'charge' || mode === 'pull' || blowOn;
  const wall = !blowOn && (c >= 3 || (c === 2 && w % 2 === 0) || has('speaker') || has('helmet') || mode === 'charge' || mode === 'pull');
  let exitKind = c === 5 ? 'vault' : ['steel', 'glass', 'wood', 'steel'][(w * 7 + c * 3) % 4];
  if (has('speaker') && c === 3) exitKind = 'glass';
  if (has('speaker') && c === 1 && exitKind === 'glass') exitKind = w % 2 ? 'steel' : 'wood';   // one scream into the microphone should not be the whole course
  if (mode === 'charge') exitKind = c % 2 ? 'wood' : 'glass';
  if (mode === 'pull') exitKind = c % 2 ? 'glass' : 'wood';
  if (blowOn) exitKind = 'wood';
  if (exitKind === 'glass' && !wall) exitKind = (w + c) % 2 ? 'wood' : 'steel';   // a lone glass door is one scream and done
  // difficulty: every 35 stages there is one more sleeper in the front half, up to six
  const frontN = clamp(1 + Math.floor(c / 2) + Math.floor(w / 35), 1, 6);
  // every 28 stages is a chapter; each chapter turns one more screw
  const ch = Math.floor((w - 5) / 28);
  const dbl = ch >= 1 && c + ch >= 5;                                   // double glass: two screams
  const shieldN = ch < 2 ? 0 : Math.min(frontN - 1, ch - 1);            // riot shields on the last few in the front half
  const backN = wall || c >= 4 ? clamp(Math.floor((c - 1) / 2) + Math.floor(w / 50), 0, 2) : (c >= 2 ? 1 : 0);
  const blast = exitKind === 'steel' || exitKind === 'vault';
  const dark = w >= 7 && (w + c) % 5 === 0;
  const GC = [0.9, 1.0, -2.7];   // where leaking gas pools
  return {
    id: `g${w}-${c}`, code: `${w}-${c}`, name: th.rooms[c - 1], worldName: th.name + (cyc ? ' ' + roman(cyc + 1) : '') + '・' + rules.map((n) => RULE_NAME[n]).join('＋'),
    mission: MISSIONS[(w * 3 + c) % MISSIONS.length], stamp: '知らん。', teach: 'none', noise: true, pal: th.pal, start: [0.4, 2.7], gen: 'triple', dark,
    grav: th.twist === 'lowgrav' ? 9 : 25, blastMul: th.twist === 'bigblast' ? 1.3 : 1,
    assist: mode === 'charge' ? ['guard', 'door'] : ['guard', 'rope', 'gauge', 'helmet', 'steeldoor', 'vault'], needThrow: true, noLamp: true, tips: [...(shieldN ? ['盾を持った見張りは、正面から投げても効かない。横か後ろから'] : []), ...(dbl && wall ? ['二重ガラスは、2回叫ばないと割れない'] : []), ...rules.flatMap((n) => RULE_TIPS[n]), ...TIPS],
    swipe: mode === 'throw' ? undefined : mode, hold: has('blow') ? 'blow' : undefined, tap: has('stomp') ? 'stomp' : undefined,
    verbs: Object.fromEntries(rules.filter((n) => RULE_VERB[n]).map((n) => RULE_VERB[n])), rules,
    plan: { wall, exitKind, frontN, backN },
    setup() {
      const R = S.room, r = rng(w * 131 + c * 17);
      const sh = (a) => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
      const used = [[0.4, 2.7]];
      const free = (x, z, d = 0.95) => used.every(([ux, uz]) => Math.hypot(ux - x, uz - z) > d);
      const take = (x, z) => { used.push([x, z]); return [x, z]; };
      const firstFree = (spots, d) => { for (const [x, z] of spots) if (free(x, z, d)) return take(x, z); return null; };
      R.tntReady = !noTnt; R.pending = false; R.evMove = -1; R.evN = 0; R.gas = false; R.lit = false; R.gasT = 0;
      const barrier = () => {
        if (R.evMove !== S.game.moves) { R.evMove = S.game.moves; R.evN = 0; }
        R.evN++;
        if (R.evN >= 2) { S.game.slowT = Math.max(S.game.slowT, 0.5); shake(0.4); pop(V(0, 3.0, 0.5), `${R.evN}枚抜き！！`, { size: 66, cls: 'big' }); sfx.clear(); addDopamine(30); }
      };
      const out = { onBreak() { barrier(); S.openExit(); } };
      if (exitKind === 'steel') addProp({ ...P.steelDoor(), ...out });
      else if (exitKind === 'glass') addProp({ ...P.glassDoor(), ...out });
      else if (exitKind === 'wood') addProp({ ...P.door({ hp: 5 }), ...out });
      else addProp({ ...P.vaultDoor(), hp: w < 40 ? 10 : w < 110 ? 20 : 30, ...out,
        onHit(p) { const n = Math.ceil(p.hp / 12); after(0.8, () => { if (p.alive) say(`ヒビが入った。あと${n}発`, 2.2); }); } });
      if (wall) R.wall = addProp(glassWall(barrier, dbl));

      // sleepers by the exit, sometimes under a chandelier
      sh([[1.75, -2.85], [-1.75, -2.85]]).slice(0, backN).forEach(([x, z], i) => {
        addSleeper(x, z, LOOKS[(w + i) % LOOKS.length]); take(x, z);
        if (i === 0 && r() < 0.6 && mode === 'throw') ironChandelier(x, z);
        if (mode === 'pull') addRug(x - 0.6, x + 0.6, -3.4, -0.45, [x, 0.05], [x, -3.4]);
      });
      // sleepers in the front half: a line can be bowled over, a spread cannot
      const forms = [
        [[-2.7, 2.2], [-2.7, 0.9], [-2.7, -0.3], [-1.4, -0.3], [-1.4, 0.9], [-0.1, -0.3]], [[2.7, 2.2], [2.7, 0.9], [2.7, -0.3], [1.4, -0.3], [1.4, 0.9], [0.1, -0.3]],
        [[-1.6, -0.2], [-0.2, -0.2], [1.2, -0.2], [2.6, -0.2], [-3.0, -0.2], [-0.9, 1.0]], [[-2.8, 2.3], [2.8, 0.3], [-1.2, -0.3], [2.7, 2.6], [0.9, -0.3], [-2.9, 0.6]],
        [[-2.7, 1.6], [-2.7, 0.3], [2.7, 1.6], [2.7, 0.3], [-1.5, 0.3], [1.5, 0.3]],
      ];
      let down = 0;
      const formI = w > 100 && r() < (w - 100) / 160 ? 3 : Math.floor(r() * forms.length);   // late on, more rooms where nobody stands in a line
      const onKO = () => { if (++down === frontN && frontN > 1) barrier(); };
      if (mode === 'pull') {
        // everyone in the front half stands on a rug that runs from a side wall to the middle
        const slots = sh([[-1, 2.1], [-1, 0.55], [1, 2.1], [1, 0.55]]), nR = Math.min(frontN, Math.ceil(frontN / 2) + (r() < 0.5 ? 1 : 0));
        for (let k = 0; k < nR; k++) { const [sd, zc] = slots[k]; addRug(sd < 0 ? -3.4 : 0.9, sd < 0 ? -0.9 : 3.4, zc - 0.55, zc + 0.55, [sd * 0.4, zc], [sd * 3.4, zc]); }
        const cnt = new Array(nR).fill(0);
        for (let i = 0; i < frontN; i++) { const k = i % nR, [sd, zc] = slots[k], x = sd * (cnt[k]++ ? 1.6 : 2.7); addSleeper(x, zc, LOOKS[(w + c + i + 2) % LOOKS.length], 'コラーッ！！', { onKO }); take(x, zc); }
      } else forms[formI].slice(0, frontN).forEach(([x, z], i) => {
        const plank = has('stomp') && i % 2 === 0;
        if (plank) addPlank(x, z);
        const helmet = has('helmet') && !plank && (has('stomp') || (w > 60 ? i % 3 !== 2 : i % 2 === 0));
        addSleeper(x, z, LOOKS[(w + c + i + 2) % LOOKS.length], 'コラーッ！！', { helmet, shield: !helmet && !plank && mode !== 'charge' && i >= frontN - shieldN, onKO }); take(x, z);
      });

      // tools: loose TNT, or TNT locked in a glass case, sometimes a gas meter by a steel exit
      if (has('speaker')) {
        const back = S.room.sl.find((o) => o.z < -2);
        const side = back ? -Math.sign(back.x) : (r() < 0.5 ? 1 : -1);
        const q = c % 2 && exitKind !== 'glass' ? [side * 3.0, -1.75] :   // never where one scream takes the wall and a glass exit together
          (firstFree([[side * 3.1, 1.0], [-side * 3.1, 1.0]], 0.9) || [side * 3.0, -1.75]);
        take(q[0], q[1]); addProp(speakerProp(q[0], q[1]));
        // the microphone stands next to a sleeper: reaching it means dealing with him first
        const fs = S.room.sl.find((o) => o.z > -1);
        const near = fs ? [[fs.x + 1.3, fs.z], [fs.x - 1.3, fs.z], [fs.x, fs.z + 1.3]].filter(([x, z]) => Math.abs(x) < 3.1 && z < 3.2) : [];
        const m = firstFree([...near, ...sh([[0.3, 0.9], [-1.2, 1.3], [1.5, 0.7], [-0.5, 1.9]])], 1.0); if (m) addProp(micProp(m[0], m[1]));
      }
      const loose = noTnt ? 0 : has('helmet') ? 1 : blast ? (w < 12 || r() < 0.7 ? 1 : 0) : (r() < 0.35 ? 1 : 0);
      for (let i = 0; i < loose; i++) { const q = firstFree(sh([[2.9, 1.4], [-2.9, 3.1], [0.3, 0.9], [2.9, 3.0], [-1.5, 1.3]]), 1.1); if (q) addProp(P.tnt(q[0], 0.28, q[1])); }
      if (blast && !loose && !noTnt) {
        const q = firstFree(wall ? [[-2.3, -2.6], [2.3, -2.6], [2.4, 0.9], [-2.4, 0.9]] : [[-2.4, 0.9], [2.4, 0.9], [-2.3, -2.6], [2.3, -2.6]], 1.5);
        if (q) { R.tntReady = false; addProp(P.glassCase(q[0], q[1], () => { R.tntReady = true; })); }
      }
      if (exitKind === 'steel' && r() < 0.35 && mode === 'throw') {
        const gx = free(1.75, -2.85, 0.5) ? 1.6 : -1.6; GC[0] = gx * 0.55;
        addProp({ name: 'gauge', kind: 'glass', size: [0.7, 0.7, 0.2], pos: [gx, 1.5, WZ + 0.11], mass: 0, hp: 1, value: 1, color: 0xbfefff, chunks: 8,
          build(g) {
            cy(g, 0.34, 0.34, 0.1, 0xd9a93a, 0, 0, -0.04, { rx: Math.PI / 2, r: 0.3, m: 0.9 });
            const m = new THREE.Mesh(new THREE.CircleGeometry(0.29, 24), texMat(label([{ t: 'GAS', s: 44, c: '#c22' }], { w: 128, h: 128, bg: '#fffdf2' }))); m.position.z = 0.015; g.add(m);
            cy(g, 0.3, 0.3, 0.05, 0, 0, 0, 0.06, { rx: Math.PI / 2, mat: glassMat() });
          },
          onBreak() { R.gas = true; sfx.whoosh(); after(0.4, () => say('シューッ…ガス漏れてる', 1.8)); } });
      }
      // red drums go off when hit: a stray throw next to a sleeper is expensive
      const drums = noTnt ? 0 : Math.min(3, Math.floor(w / 15)) + (c === 5 ? 1 : 0);
      for (let i = 0; i < drums; i++) { const q = firstFree(sh([[-1.6, 1.5], [1.7, 0.9], [-0.4, 1.9], [1.9, -0.3], [-1.7, -0.3], [1.6, 2.4]]), 1.0); if (q) addProp(P.barrel(q[0], q[1], 0, true)); }
      // things to throw, kept off the middle line where possible
      const nThrow = blowOn ? 7 : Math.max(3, 6 - Math.floor(w / 40));
      sh([[1.4, 1.2], [2.0, 3.1], [-0.9, 3.1], [-1.5, 2.3], [2.8, 2.2], [-0.3, 3.3], [1.3, 3.3], [-2.0, 3.2], [-3.1, 3.2], [3.1, 3.2]]).filter(([x, z]) => free(x, z, 0.85)).slice(0, nThrow)
        .forEach(([x, z]) => { take(x, z); addProp(smallProp(th.small[Math.floor(r() * th.small.length)], x, z, r(), false)); });
      // theme flavour and back-room dressing
      if (th.twist === 'glass') for (const q of [[-3.2, 1.0], [3.2, 1.2]]) if (free(q[0], q[1], 0.8)) { take(q[0], q[1]); addProp(P.vase(q[0], q[1], 0.42, true)); }
      if (th.twist === 'balls') for (const q of [[0.9, 2.0], [-0.6, 2.2]]) if (free(q[0], q[1], 0.7)) { take(q[0], q[1]); addProp(P.ball(q[0], q[1], 0x3d7fd9)); }
      if (th.twist === 'paper') [[-0.9, 1.4], [1.0, 0.6]].forEach(([x, z], i) => { if (free(x, z, 0.7)) addProp(P.hint(x, 0.02, z, ...HINT[['library', 'guard'][i]], { rotY: r() * 2 - 1 })); });
      for (const [x, z] of sh([[3.0, -1.8], [-3.0, -1.8], [-0.8, -2.9], [0.9, -2.9]]).slice(0, 2)) if (free(x, z, 1.0)) { take(x, z); addProp(r() < 0.5 ? P.goldPile(x, z) : P.moneyBag(x, z)); }
      addProp(P.hint(free(-1.75, -2.85, 0.5) ? -1.75 : 1.75, 1.5, WZ + 0.03, ...HINT.vault, { wall: true }));
      R.sig = { form: formI, chand: S.props.some((p) => p.name === 'rope'), loose, cased: S.props.some((p) => p.name === 'case'), gas: S.props.some((p) => p.name === 'gauge'), drums, rules: rules.join('+') };
      if (c === 1 && rules.length && !dark) after(1.9, () => say(RULE_SAY[rules[0]], 2.2));
      if (dark) after(1.9, () => say('停電。殴ると火花で一瞬だけ見える', 2.4));
    },
    onSpark(pos) {
      const R = S.room;
      if (!R.gas || R.lit || R.gasT < 0.6 || S.game.exitOpen) return;
      if (Math.hypot(pos.x - GC[0], pos.z - GC[2]) > Math.min(3.4, 1.4 + R.gasT * 0.9)) return;
      R.lit = true;
      after(0.03, () => { pop(V(GC[0], 2.6, GC[2]), 'ガス爆発！！', { size: 54, cls: 'big' }); explode(V(GC[0], GC[1], GC[2]), 4.0); });
    },
    update(dt) {
      const R = S.room;
      sleeperUpdate(); tntRefill(); refillThrowables();
      if (R.gas && !R.lit) {
        R.gasT += dt;
        const q = Math.min(3.4, 1.4 + R.gasT * 0.9);
        if (Math.random() < 0.7) emit(V(GC[0] + rnd(-q, q) * 0.7, rnd(0.2, 1.6), GC[2] + rnd(-q, q) * 0.6), 1, { color: [0x9ee86a, 0xc8f59a], speed: [0.1, 0.5], size: [0.14, 0.26], life: [0.8, 1.5], grav: -0.4, drag: 2, grow: 1.4 });
      }
    },
  };
}
for (let w = 5; w <= LAST_STAGE; w++) for (let c = 1; c <= 5; c++) ROOMS.push(genDef(w, c));
ROOMS.forEach((d, i) => {
  const [w, c] = d.code.split('-').map(Number);
  d.world = w; if (!d.worldName) d.worldName = ['', 'ひみつの屋敷', '学校', 'からくり部屋', '三枚抜き'][w];
  if (d.gen && PAR[d.code]) d.par = PAR[d.code];
  d.drain = Math.min(11.5, 6 + w * 0.028 + c * 0.15); d.noiseMul = 1 + Math.min(0.6, (w - 1) * 0.005);
});
