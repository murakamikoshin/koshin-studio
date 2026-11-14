// The player character: movement, the three brute-force verbs, and procedural animation
import { THREE, CANNON, S, rnd, pick, clamp, V, RW, RD, WZ, addDopamine, addCombo, addNoise, after, hitStop, shake } from './ctx.js';
import { buildKid } from './person.js';
import { bx, cy } from './ctx.js';
import { damage, blastImpulse, GRP } from './props.js';
import { emit, ring, pop, say, toScreen } from './fx.js';
import { sfx } from './audio.js';

const SPEED = 15, GRAV = 25;
const SOOT = new THREE.Color(0x2b2b2b);

function ballistic(o, t) {
  const dx = t.x - o.x, dy = t.y - o.y, dz = t.z - o.z;
  const T = clamp(Math.hypot(dx, dz) / 13, 0.28, 0.75);
  return V(dx / T, dy / T + 0.5 * (S.grav || GRAV) * T, dz / T);
}

// Screen-space aim assist: swipe roughly toward something and the throw lands on it.
function aimTarget(origin, sdir, thrown) {
  // TNT is for blasting things open; everything else is for hitting people, ropes and buttons
  const o2 = toScreen(origin), all = (S.room && (S.room.assist || S.room.def.assist)) || [];
  const blastable = all.filter((n) => n === 'steeldoor' || n === 'vault' || n === 'helmet'), rest = all.filter((n) => !blastable.includes(n));
  const pri = thrown && thrown.name === 'tnt' ? (blastable.length ? blastable : all) : (rest.length ? rest : all);
  const roll = S.room && S.room.def.swipe === 'roll';
  const gw = S.room && S.room.wall && S.room.wall.alive ? S.room.wall : null;
  let best = null, bestScore = 1e9;
  for (const p of S.props) {
    if (!p.alive || p === thrown || p.kind === 'paper') continue;
    if (gw && p !== gw && p.name !== 'rope' && (origin.z - gw.pos.z) * (p.pos.z - gw.pos.z) < 0) continue;   // nothing behind unbroken glass can be hit
    const isPri = pri.includes(p.name);
    const s = toScreen(p.pos);
    const dx = s.x - o2.x, dy = s.y - o2.y;
    const along = dx * sdir.x + dy * sdir.y;
    if (along < 36) continue;
    const perp = Math.abs(dx * sdir.y - dy * sdir.x);
    const tol = (isPri ? 0.5 : 0.2) * along + (isPri ? 54 : 22);
    if (perp > tol) continue;
    // a room's key target always beats ordinary clutter that happens to be on the same line
    // closest in angle wins; when bowling, the front of the line is the one to hit
    const score = (roll && isPri ? along : (perp / along) * 100 + along * 0.01) + (isPri ? 0 : 1e4);
    if (score < bestScore) { bestScore = score; best = p; }
  }
  return best ? best.pos.clone() : null;
}

export const screamReach = (p) => 4.2 + 4.6 * p;
export const SPEAKER_R = 3.4;
// double glass: the first scream only cracks it
function crack(q) {
  if (!(q.o.cracks > 0)) return false;
  q.o.cracks--; q.squash = 1; sfx.glass && sfx.glass(); shake(0.3);
  pop(V(0, 2.2, q.pos.z + 0.4), 'ピシッ！！', { size: 54, cls: 'big' });
  if (q.o.onCrack) q.o.onCrack(q);
  after(0.5, () => say('ヒビが入った。もう1回', 1.8));
  return true;
}
export const blowReach = (p) => 3 + 3.5 * p;
// A scream that reaches a live microphone also comes out of every speaker: glass near a speaker breaks, sleepers near it wake.
function speakerOut(q) {
  if (!q.alive) return;
  const c = V(q.pos.x, 1.0, q.pos.z), R = SPEAKER_R;
  sfx.scream(0.6); shake(0.5); q.squash = 1;
  pop(V(q.pos.x, 2.3, q.pos.z), 'キーーーン！！', { size: 46, cls: 'big' });
  ring(V(q.pos.x, 0.06, q.pos.z), R, { dur: 0.5, color: 0xff5a9a });
  for (const g of [...S.props]) {
    if (!g.alive || g.kind !== 'glass' || g.immune.scream) continue;
    const d = Math.hypot(Math.max(Math.abs(c.x - g.pos.x) - g.hx, 0), Math.max(Math.abs(c.z - g.pos.z) - g.hz, 0));
    if (d < R) { if (crack(g)) continue; after(0.05 + d * 0.045, () => damage(g, 99, 'scream', c)); }
  }
  const R0 = S.room;
  if (R0 && R0.sl && R0.wake && R0.sl.some((o) => o.asleep() && Math.hypot(o.x - q.pos.x, o.z - q.pos.z) < R)) R0.wake();
}
export class Kid {
  constructor() {
    Object.assign(this, buildKid());
    this.rig = this.body;
    S.scene.add(this.root);
    this.baseCols = [this.M.hood, this.M.hood2, this.M.skin, this.M.shoe].map((m) => ({ m, c: m.color.clone() }));
    this.pbody = new CANNON.Body({ mass: 0, type: CANNON.Body.KINEMATIC, shape: new CANNON.Sphere(0.42) });
    this.pbody.collisionFilterGroup = GRP.KID; this.pbody.collisionFilterMask = GRP.PROP | GRP.DEBRIS;
    this.light = new THREE.PointLight(0x7fd4ff, 0, 3.5); this.light.position.set(0, 1.25, 0.55); this.root.add(this.light);
    // shopping cart, only shown in rooms where a swipe means "ram"
    const cart = this.cart = new THREE.Group();
    const st = { r: 0.35, m: 0.8 };
    bx(cart, 0.7, 0.05, 0.9, 0xaab3bd, 0, 0.32, 0, st);
    for (const a of [-1, 1]) { bx(cart, 0.04, 0.5, 0.9, 0xaab3bd, a * 0.34, 0.57, 0, st); bx(cart, 0.7, 0.5, 0.04, 0xaab3bd, 0, 0.57, a * 0.44, st); }
    bx(cart, 0.74, 0.05, 0.05, 0xd92b2b, 0, 0.95, -0.52);
    for (const a of [-1, 1]) for (const b of [-1, 1]) cy(cart, 0.09, 0.09, 0.06, 0x222222, a * 0.3, 0.09, b * 0.36, { rz: Math.PI / 2 });
    cart.position.z = 0.75; cart.visible = false; this.root.add(cart);
    cart.traverse((m) => { if (m.isMesh) m.castShadow = true; });
    this.t = 0; this.sootShown = -1;
    this.reset(0, 2.2);
  }
  reset(x, z) {
    this.x = x; this.z = z; this.yaw = 0; this.state = 'idle'; this.stT = 0;
    this.dest = null; this.onArrive = null; this.target = null; this.extra = 0;
    this.punchT = this.throwT = this.jumpT = this.recoil = this.soot = this.chargeT = 0; this.arm = 0;
    this.phase = 0; this.exited = false;
    this.root.visible = true; this.phone.visible = false; this.light.intensity = 0;
    this.cart.visible = !!(S.room && S.room.def.swipe === 'charge');
  }
  pos3() { return V(this.x, 0.9, this.z); }
  canAct() { return this.state === 'idle' || this.state === 'dash'; }
  face(x, z) { if (Math.hypot(x - this.x, z - this.z) > 0.01) this.yaw = Math.atan2(x - this.x, z - this.z); }

  standFor(p) {
    const c = p.pos, hx = p.hx, hz = p.hz;
    const qx = clamp(this.x, c.x - hx, c.x + hx), qz = clamp(this.z, c.z - hz, c.z + hz);
    let dx = this.x - qx, dz = this.z - qz, d = Math.hypot(dx, dz);
    if (d < 1e-3) { dx = 0; dz = 1; d = 1; return { x: clamp(c.x, -RW / 2 + 0.45, RW / 2 - 0.45), z: clamp(c.z + hz + 0.7, WZ + 0.5, RD / 2 - 0.45), reach: false }; }
    return {
      x: clamp(qx + dx / d * 0.72, -RW / 2 + 0.45, RW / 2 - 0.45),
      z: clamp(qz + dz / d * 0.72, WZ + 0.5, RD / 2 - 0.45),
      reach: d < 1.0,
    };
  }
  goTo(x, z, cb) { this.dest = { x, z }; this.onArrive = cb; this.state = 'dash'; sfx.dash(); }

  // an unbroken glass wall keeps the kid on his side of the room
  barred(z) { const w = S.room && S.room.wall; return !!(w && w.alive && z < w.pos.z); }
  cmdTap(prop, point) {
    if (!this.canAct()) return;
    if (prop && prop.alive && prop !== S.room.wall && this.barred(prop.pos.z)) { say(pick(['ガラスの壁で行けん', '壁の向こう…']), 1.2); return; }
    if (point && this.barred(point.z)) point.z = S.room.wall.pos.z + 0.6;
    if (prop && prop.alive) {
      const st = this.standFor(prop);
      if (st.reach) { this.dest = null; this.onArrive = null; this.state = 'idle'; this.punch(prop); }
      else if (this.state === 'dash' && this.target === prop) this.extra = Math.min(3, this.extra + 1);
      else {
        this.target = prop; this.extra = 0;
        this.goTo(st.x, st.z, () => {
          this.punch(prop);
          const n = this.extra; this.extra = 0;
          for (let i = 1; i <= n; i++) after(i * 0.09, () => { if (this.canAct()) this.punch(prop); });
        });
      }
    } else if (point) {
      this.target = null;
      this.goTo(clamp(point.x, -RW / 2 + 0.45, RW / 2 - 0.45), clamp(point.z, WZ + 0.5, RD / 2 - 0.45), null);
    }
  }

  punch(p) {
    if (!p.alive) return;
    this.face(p.pos.x, p.pos.z); this.punchT = 1; this.arm ^= 1; S.game.moves++;
    if (p.pos.y > 1.7 || S.room.def.tap === 'stomp') this.jumpT = 1;
    if (p.o.onPunch && p.o.onPunch(p, this)) return;
    const dx = p.pos.x - this.x, dz = p.pos.z - this.z, d = Math.hypot(dx, dz) || 1, r = Math.min(d, 0.7);
    const c = V(this.x + dx / d * r, clamp(p.pos.y, 0.5, 2.2), this.z + dz / d * r);
    if (p.immune.punch) {
      sfx.clang(); pop(c, pick(['カーン', '硬っ']), { size: 34 }); shake(0.15); this.recoil = 1; addNoise(10);
      return;
    }
    sfx.punch(rnd(0.9, 1.25)); hitStop(0.04); shake(0.2);
    emit(c, 7, { color: 0xfff2b0, hdr: 3, speed: [3, 8], size: [0.03, 0.07], life: [0.12, 0.3], grav: 4 });
    emit(c, 4, { color: [0xffffff, 0xdddddd], speed: [1, 3], size: [0.08, 0.16], life: [0.25, 0.5], grav: -1, drag: 3, grow: 1 });
    ring(c, 0.7, { face: true, dur: 0.18, r0: 0.1, a: 0.8 });
    addDopamine(3); addCombo(); addNoise(24);
    if (S.room.def.onSpark) S.room.def.onSpark(c);
    const b = p.body;
    if (b.type === CANNON.Body.DYNAMIC) {
      const k = 6 / (1 + b.mass / 4);
      b.wakeUp(); b.velocity.x += dx / d * k; b.velocity.z += dz / d * k; b.velocity.y += k * 0.45;
      b.angularVelocity.set(rnd(-4, 4), rnd(-4, 4), rnd(-4, 4));
      if (b.mass < 3) p.thrownT = 1.2;
    }
    damage(p, 1, 'punch', this.pos3());
    if (p.alive) pop(c, pick(['ドッ', 'ガッ', 'オラッ', 'ドゴ']), { size: 28, cls: 'small' });
  }

  cmdThrow(prop, sdir) {
    if (!this.canAct()) return;
    if (!prop) { say(pick(['投げるもんがない', '何もねぇ'])); return; }
    if (this.barred(prop.pos.z)) { say('それは壁の向こう', 1.2); return; }
    const st = this.standFor(prop), go = () => this.doThrow(prop, sdir);
    if (st.reach) { this.dest = null; this.onArrive = null; this.state = 'idle'; go(); }
    else { this.target = prop; this.extra = 0; this.goTo(st.x, st.z, go); }
  }
  doThrow(p, sdir) {
    if (!p.alive || !this.canAct()) return;
    const origin = V(this.x, 1.85, this.z);
    let tgt = aimTarget(origin, sdir, p);
    if (!tgt) {
      const range = clamp(3 + sdir.power * 5, 3.5, 8.5);
      tgt = V(clamp(this.x + sdir.x * range, -RW / 2 + 0.3, RW / 2 - 0.3), 0.4, clamp(this.z + sdir.y * range, WZ + 0.3, RD / 2 - 0.3));
    }
    this.face(tgt.x, tgt.z); this.throwT = 1; S.game.moves++;
    origin.x += Math.sin(this.yaw) * 0.35; origin.z += Math.cos(this.yaw) * 0.35;
    let v = ballistic(origin, tgt);
    const sw = S.room.def.swipe;
    if (sw === 'roll' || sw === 'kick') {   // along the floor instead of a lob
      origin.y = p.size[1] / 2 + 0.05;
      origin.x += Math.sin(this.yaw) * 0.5; origin.z += Math.cos(this.yaw) * 0.5;   // clear of the kid's own feet
      const dx = tgt.x - origin.x, dz = tgt.z - origin.z, d = Math.hypot(dx, dz) || 1;
      const v0 = sw === 'kick' ? 15 : 12;
      v = V(dx / d * v0, 0, dz / d * v0);
      if (sw === 'kick' && p.name !== 'tnt') { p.kickT = 1.3; p.kd = [dx / d, dz / d]; }   // a kicked thing keeps going and comes back off the walls
    }
    const b = p.body;
    b.wakeUp(); b.position.set(origin.x, origin.y, origin.z); b.velocity.set(v.x, v.y, v.z);
    b.angularVelocity.set(rnd(-7, 7), rnd(-7, 7), rnd(-7, 7));
    p.thrownT = 3; p.sync(); sfx.whoosh(); addDopamine(4);
    pop(V(origin.x, 1.9, origin.z), sw === 'kick' ? pick(['ドカッ', 'おらぁ']) : sw === 'roll' ? pick(['ゴロゴロ', 'そりゃ']) : pick(['ポイッ', 'うらぁ', 'そいっ']), { size: 28, cls: 'small' });
  }

  // Ride the cart in a straight line: wood and people give way, steel does not.
  cmdRam(sdir) {
    if (!this.canAct()) return;
    let dx = sdir.x, dz = sdir.y;
    const pri = (S.room.assist || S.room.def.assist || []);
    for (const p of S.props) {          // only a light snap: lining the run up is the point of the room
      if (!p.alive || !pri.includes(p.name)) continue;
      const tx = p.pos.x - this.x, tz = p.pos.z - this.z, td = Math.hypot(tx, tz) || 1;
      if ((tx * dx + tz * dz) / td > 0.992) { dx = tx / td; dz = tz / td; }
    }
    this.ram = { dx, dz, hit: new Set() };
    this.state = 'ride'; this.dest = null; this.onArrive = null; this.yaw = Math.atan2(dx, dz);
    S.game.moves++; sfx.whoosh(); addDopamine(4);
    pop(V(this.x, 2.2, this.z), 'うおおおお', { size: 36 });
  }
  startCharge() {
    if (!this.canAct()) return false;
    this.dest = null; this.onArrive = null; this.state = 'charge'; this.chargeT = 0;
    return true;
  }
  cancelCharge() { if (this.state === 'charge') this.state = 'idle'; }
  release() {
    if (this.state !== 'charge') return;
    const p = clamp(this.chargeT / 0.8, 0.25, 1);
    if (S.room.def.hold === 'blow') this.blow(p); else this.scream(p);
  }
  // Blow: no sound at all, but everything light around the kid takes off outward.
  blow(p) {
    this.state = 'scream'; this.stT = 0.45; S.game.moves++;
    const R = blowReach(p), c = V(this.x, 1.0, this.z);
    sfx.whoosh(); shake(0.3 + 0.3 * p);
    pop(V(this.x, 2.4, this.z), p > 0.7 ? 'ふーーーーっ！！！' : 'ふーっ！！', { size: 40 + p * 18, cls: 'big' });
    ring(V(this.x, 0.06, this.z), R, { dur: 0.45, color: 0x9fe8ff });
    emit(c, 26, { color: [0xffffff, 0xcfefff], speed: [5, 12], size: [0.05, 0.12], life: [0.25, 0.5], grav: 0, drag: 2, grow: 1.2 });
    addDopamine(6);
    for (const q of S.props) {
      if (!q.alive || q.body.type !== CANNON.Body.DYNAMIC) continue;
      const dx = q.pos.x - this.x, dz = q.pos.z - this.z, d = Math.hypot(dx, dz);
      if (d > R || d < 0.15) continue;
      const f = (13 + 7 * p) * (1 - 0.4 * d / R) / (1 + q.body.mass / 10);
      q.body.wakeUp(); q.body.velocity.set(dx / d * f, 2.6, dz / d * f);
      q.body.angularVelocity.set(rnd(-6, 6), rnd(-6, 6), rnd(-6, 6));
      q.thrownT = 2.2;
    }
  }
  // Pull: run to the end of a rug and yank it out from under whoever is standing on it.
  cmdPull(sdir) {
    if (!this.canAct()) return;
    const rugs = (S.room.rugs || []).filter((r) => !r.done);
    if (!rugs.length) { say('もう引っぱる物がない', 1.2); return; }
    let best = null, bs = -9;
    for (const r of rugs) {
      const dx = r.stand[0] - this.x, dz = r.stand[1] - this.z, d = Math.hypot(dx, dz);
      const sc = d < 0.4 ? 1 : (dx * sdir.x + dz * sdir.y) / d;
      if (sc > bs) { bs = sc; best = r; }
    }
    S.game.moves++; this.target = null;
    this.goTo(best.stand[0], best.stand[1], () => { this.face(best.far[0], best.far[1]); this.punchT = 1; best.pull(); });
  }
  scream(p) {
    this.state = 'scream'; this.stT = 0.5; S.game.moves++;
    sfx.scream(p); shake(0.45 + 0.4 * p); hitStop(0.05);
    const c = V(this.x, 1.3, this.z), R = screamReach(p);
    pop(V(this.x, 2.4, this.z), p > 0.7 ? 'わああああああ！！！' : 'わあああ！！', { size: 42 + p * 20, cls: 'big' });
    ring(V(this.x, 0.06, this.z), R, { dur: 0.5, color: 0xfff06a });
    ring(c, R * 0.6, { dur: 0.4, face: true, color: 0xffffff });
    after(0.08, () => ring(V(this.x, 0.06, this.z), R * 0.8, { dur: 0.45, color: 0xff5a9a }));
    emit(c, 14, { color: 0xfff06a, hdr: 2.5, speed: [5, 11], size: [0.03, 0.06], life: [0.2, 0.4], grav: 0, drag: 3 });
    addDopamine(6);
    for (const q of [...S.props]) {
      if (!q.alive || q.kind !== 'glass' || q.immune.scream) continue;
      if (q.o.screamMin && p < q.o.screamMin) { q.squash = 1; after(0.5, () => say('ビクともしない。もっと長く溜めて叫ぶ', 2.2)); continue; }
      // distance to the nearest face, so a long pane counts from its closest point
      const d = Math.hypot(Math.max(Math.abs(c.x - q.pos.x) - q.hx, 0), Math.max(Math.abs(c.z - q.pos.z) - q.hz, 0));
      if (d < R) { if (crack(q)) continue; after(0.05 + d * 0.045, () => damage(q, 99, 'scream', c)); }
    }
    blastImpulse(c, R, 3 + 4 * p);
    // only the sleepers the scream actually reaches wake up
    const R0 = S.room;
    if (R0 && R0.sl && R0.wake && R0.sl.some((o) => o.asleep() && Math.hypot(o.x - this.x, o.z - this.z) < R)) R0.wake();    if (S.props.some((q) => q.alive && q.name === 'mic' && Math.hypot(q.pos.x - this.x, q.pos.z - this.z) < R))
      for (const q of S.props) if (q.alive && q.name === 'speaker') after(0.14, () => speakerOut(q));
  }

  hurt(sec, from) {
    if (this.state === 'exit' || this.state === 'caught') return;
    this.state = 'hurt'; this.stT = sec; this.soot = 1; this.dest = null; this.onArrive = null;
    this.phone.visible = false; this.light.intensity = 0;
    say(pick(['ぐへぇ', 'あっつ！！', '近すぎた']), 1.2);
  }
  usePhone() {
    this.state = 'phone'; this.stT = 2.6; this.dest = null; this.onArrive = null; this.yaw = 0;
    this.phone.visible = true; this.light.intensity = 2.5;
    S.game.phones++; sfx.phone();
  }
  caught() { this.state = 'caught'; this.dest = null; this.onArrive = null; }
  exit() { this.state = 'exit'; this.phase = 0; this.dest = null; this.onArrive = null; this.phone.visible = false; this.light.intensity = 0; }

  update(dt, raw) {
    this.t += raw;
    // kicked things travel in straight lines and come back off the walls
    for (const q of S.props) {
      if (!(q.kickT > 0) || !q.alive) continue;
      q.kickT -= dt;
      const b = q.body, d = q.kd, w = S.room.wall && S.room.wall.alive ? S.room.wall.pos.z + 0.45 : WZ + 0.5;
      const sp0 = Math.hypot(b.velocity.x, b.velocity.z);
      let hit = false;
      if ((b.position.x > 3.3 && d[0] > 0) || (b.position.x < -3.3 && d[0] < 0)) { d[0] = -d[0]; hit = true; }
      if ((b.position.z > 3.3 && d[1] > 0) || (b.position.z < w && d[1] < 0)) { d[1] = -d[1]; hit = true; }
      if (!hit && sp0 < 4 && q.kickT < 1.15) { d[0] = -d[0]; d[1] = -d[1]; hit = true; }   // stopped dead by something solid
      if (hit) { sfx.bounce(); pop(V(b.position.x, 1.0, b.position.z), 'カン', { size: 26, cls: 'small' }); }
      b.velocity.x = d[0] * 15; b.velocity.z = d[1] * 15; if (b.velocity.y > 2) b.velocity.y = 2;
      q.thrownT = Math.max(q.thrownT || 0, 0.4);
    }
    const g = S.game, px = this.x, pz = this.z;
    if (this.punchT > 0) this.punchT = Math.max(0, this.punchT - raw * 7);
    if (this.throwT > 0) this.throwT = Math.max(0, this.throwT - raw * 4.5);
    if (this.jumpT > 0) this.jumpT = Math.max(0, this.jumpT - raw * 3.2);
    if (this.recoil > 0) this.recoil = Math.max(0, this.recoil - raw * 5);
    if (this.soot > 0 && this.state !== 'hurt') this.soot = Math.max(0, this.soot - raw * 0.5);
    switch (this.state) {
      case 'dash': {
        const dx = this.dest.x - this.x, dz = this.dest.z - this.z, d = Math.hypot(dx, dz), step = SPEED * dt;
        if (d <= step || d < 0.02) {
          this.x = this.dest.x; this.z = this.dest.z; this.state = 'idle'; this.dest = null;
          const cb = this.onArrive; this.onArrive = null; if (cb) cb();
        } else if (dt > 0) {
          this.x += dx / d * step; this.z += dz / d * step; this.yaw = Math.atan2(dx, dz);
          if (Math.random() < 0.6) emit(V(this.x, 0.06, this.z), 1, { color: [0xffffff, 0xdddddd], speed: [0.2, 1], size: [0.08, 0.16], life: [0.2, 0.45], grav: -0.5, drag: 3, grow: 1 });
        }
        break;
      }
      case 'ride': {
        const r = this.ram, step = 17 * dt;
        if (dt <= 0) break;
        const nx = this.x + r.dx * step, nz = this.z + r.dz * step;
        let stop = false;
        for (const p of [...S.props]) {
          if (!p.alive || r.hit.has(p) || p.kind === 'paper' || p.pos.y - p.size[1] / 2 > 1.5) continue;
          if (Math.abs(p.pos.x - nx) > p.hx + 0.5 || Math.abs(p.pos.z - nz) > p.hz + 0.5) continue;
          r.hit.add(p);
          if (p.o.onRam) { p.o.onRam(p, this.pos3()); continue; }
          if (p.immune.throw || p.immune.impact) {          // steel, armoured glass
            sfx.clang(); shake(0.5); pop(V(nx, 1.6, nz), 'ガァン', { size: 44 }); say(pick(['いってぇ…', '鉄には勝てん']), 1.2);
            stop = true; this.recoil = 1; break;
          }
          hitStop(0.03); shake(0.25);
          p.thrownT = 0.5; damage(p, 99, 'impact', this.pos3());
        }
        if (!stop && (Math.abs(nx) > RW / 2 - 0.45 || nz < WZ + 0.5 || nz > RD / 2 - 0.45)) {
          if (!S.game.exitOpen) { sfx.thud(); shake(0.3); pop(V(nx, 1.4, nz), 'ドンッ', { size: 34 }); }
          stop = true;
        }
        if (stop) { if (this.state === 'ride') this.state = 'idle'; }
        else { this.x = nx; this.z = nz; if (Math.random() < 0.7) emit(V(this.x, 0.06, this.z), 1, { color: [0xffffff, 0xdddddd], speed: [0.3, 1.2], size: [0.08, 0.16], life: [0.2, 0.45], grav: -0.5, drag: 3, grow: 1 }); }
        break;
      }
      case 'charge': this.chargeT += raw; if (this.chargeT > 1.5) this.release(); break;
      case 'scream': this.stT -= raw; if (this.stT <= 0) this.state = 'idle'; break;
      case 'phone':
        this.stT -= raw;
        if (this.stT <= 0) {
          this.state = 'idle'; this.phone.visible = false; this.light.intensity = 0;
          g.dopamine = 55; g.pauseDrain = 0.6;
          say(pick(['…ハッ', 'やべ、脱出中だった', 'あと1本だけ…いや出る']), 1.2);
        }
        break;
      case 'hurt': this.stT -= raw; this.yaw += raw * 16; if (this.stT <= 0) { this.state = 'idle'; this.yaw = 0; } break;
      case 'exit':
        if (this.phase === 0) {
          const tx = 0, tz = WZ + 1.0, dx = tx - this.x, dz = tz - this.z, d = Math.hypot(dx, dz), step = SPEED * dt;
          if (d <= step || d < 0.05) { this.x = tx; this.z = tz; this.phase = 1; this.yaw = Math.PI; }
          else { this.x += dx / d * step; this.z += dz / d * step; this.yaw = Math.atan2(dx, dz); }
        } else {
          this.z -= 11 * dt;
          if (this.z < WZ - 2.3 && !this.exited) { this.exited = true; this.root.visible = false; if (S.onExited) S.onExited(); }
        }
        break;
      default: break;
    }
    const inv = dt > 1e-4 ? 1 / dt : 0;
    this.pbody.velocity.set((this.x - px) * inv, 0, (this.z - pz) * inv);
    this.pbody.position.set(this.x, 0.5, this.z);
    this.animate();
  }

  animate() {
    const t = this.t, st = this.state;
    let lean = 0, bob = 0, twist = 0, headX = 0, headY = 0, aLx = 0, aRx = 0, aLz = -0.15, aRz = 0.15, lL = 0, lR = 0, sy = 1, mouth = 1, jx = 0;
    if (st === 'idle') {
      bob = Math.abs(Math.sin(t * 10)) * 0.025; lR = Math.sin(t * 22) * 0.22;
      headY = Math.sin(t * 3.1) * (Math.sin(t * 1.3) > 0 ? 0.55 : 0.15);
      aLx = Math.sin(t * 10) * 0.12; aRx = -aLx;
    } else if (st === 'ride') {
      lean = 0.3; aLx = aRx = -1.2; bob = Math.abs(Math.sin(t * 30)) * 0.03; mouth = 5;
    } else if (st === 'dash' || st === 'exit') {
      lean = 0.42; lL = Math.sin(t * 38) * 0.95; lR = -lL; aLx = -lL * 0.9; aRx = lL * 0.9; bob = Math.abs(Math.sin(t * 38)) * 0.05;
    } else if (st === 'charge') {
      const k = Math.min(1, this.chargeT / 0.8);
      sy = 1 - 0.14 * k; lean = -0.12; aLx = aRx = 0.9 * k; headX = -0.3 * k; jx = rnd(-0.025, 0.025) * (0.4 + k); mouth = 1 + k * 2;
    } else if (st === 'scream') {
      lean = -0.3; headX = -0.5; mouth = 8; aLz = -1.7; aRz = 1.7; sy = 1.06 + Math.sin(t * 60) * 0.03; jx = rnd(-0.03, 0.03);
    } else if (st === 'phone') {
      headX = 0.6; aLx = -1.0; aRx = -1.05; aLz = 0.35; aRz = -0.3;
    } else if (st === 'hurt') {
      aLz = -2.4; aRz = 2.4; bob = Math.abs(Math.sin(t * 14)) * 0.25; mouth = 5;
    } else if (st === 'caught') {
      aLz = -2.7; aRz = 2.7; mouth = 5; jx = rnd(-0.015, 0.015);
    }
    if (this.punchT > 0) {
      const k = Math.sin(this.punchT * Math.PI);
      if (this.arm) { aRx = -1.75 * k; twist = -0.5 * k; } else { aLx = -1.75 * k; twist = 0.5 * k; }
      lean += 0.22 * k; mouth = Math.max(mouth, 1 + 3 * k);
    }
    if (this.throwT > 0) { const k = this.throwT; aLx = aRx = -1.0 - 2.0 * k; lean += 0.3 * (1 - k); mouth = Math.max(mouth, 3); }
    if (this.recoil > 0) lean -= 0.35 * this.recoil;
    const jump = this.jumpT > 0 ? Math.sin(this.jumpT * Math.PI) * 0.95 : 0;
    this.root.position.set(this.x + jx, jump + bob, this.z);
    this.root.rotation.y = this.yaw;
    this.rig.rotation.x = lean; this.rig.scale.y = sy;
    this.torso.rotation.y = twist;
    this.head.rotation.set(headX, headY, 0);
    this.armL.rotation.set(aLx, 0, aLz); this.armR.rotation.set(aRx, 0, aRz);
    this.legL.rotation.x = lL; this.legR.rotation.x = lR;
    this.mouth.scale.set(mouth > 2 ? 1.25 : 1, mouth, 1);
    this.mouth.position.y = 0.13 - (mouth - 1) * 0.012;
    if (this.soot !== this.sootShown) {
      this.sootShown = this.soot;
      for (const b of this.baseCols) b.m.color.copy(b.c).lerp(SOOT, Math.min(1, this.soot) * 0.85);
    }
  }
}
