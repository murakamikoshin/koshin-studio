// Breakable props: physics body + visual, damage / fracture / explosion, and the prop library
import { THREE, CANNON, S, rnd, pick, clamp, V, mat, glassMat, goldMat, bx, cy, sp, plane,
  addDopamine, addCombo, addNoise, after, hitStop, shake, RW, WZ, DW, DH } from './ctx.js';
import { emit, ring, pop, flash, say } from './fx.js';
import { sfx, breakSound } from './audio.js';
import { label, paperTex, paintingTex, ctex, JP } from './tex.js';

export const GRP = { STATIC: 1, PROP: 2, DEBRIS: 4, KID: 8, HEAVY: 16 };
const unitBox = new THREE.BoxGeometry(1, 1, 1); unitBox.userData.shared = true;
const coinGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.035, 10); coinGeo.userData.shared = true;
export const MAXD = (typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches) ? 110 : 160;

const WORDS = {
  wood: ['バキッ', 'ドゴッ', 'メキャッ'], metal: ['ガシャン', 'ゴンッ', 'ベコッ'], glass: ['パリーン', 'ガシャーン'],
  paper: ['クシャッ', 'ビリッ'], stone: ['ゴシャッ', 'ガコッ'], plastic: ['ベキッ', 'パキッ'], gold: ['ジャラッ', 'チャリーン'],
  rubber: ['ボヨン'], tnt: ['バキッ'], guard: ['ぐえっ'],
};
const DUST = {
  wood: [0xd9a066, 0x8a5a2b, 0xf0d3a0], metal: [0xcfd6de, 0x7d8791], glass: [0xe8fbff, 0xbfefff], paper: [0xffffff, 0xf2ead0],
  stone: [0xd8d2c4, 0x9a958a], plastic: [0xeeeeee, 0x555555], gold: [0xffd84a, 0xfff1a8], rubber: [0x333333], tnt: [0xd92b2b, 0x8a5a2b], guard: [0xffffff],
};

export function texMat(tex, o = {}) {
  const m = new THREE.MeshStandardMaterial({ map: tex, roughness: o.r ?? 0.8, metalness: o.m ?? 0, emissive: o.e ?? 0x000000, emissiveMap: o.e ? tex : null, emissiveIntensity: o.ei ?? 1 });
  m.userData.own = true;
  return m;
}

// ------------------------------------------------------------------ Prop
export class Prop {
  constructor(o) {
    const g = S.game;
    this.o = o; this.name = o.name || 'prop'; this.kind = o.kind || 'wood'; this.size = o.size;
    this.hp = o.hp ?? 2; this.value = o.value ?? 1; this.throwable = !!o.throwable; this.immune = o.immune || {};
    this.alive = true; this.thrownT = 0; this.squash = 0; this.impactCd = 0;
    this.group = new THREE.Group(); this.group.userData.prop = this;
    if (o.build) o.build(this.group, this); else bx(this.group, o.size[0], o.size[1], o.size[2], o.color ?? 0xc98a4b, 0, 0, 0, { round: 0.04 });
    this.group.traverse((m) => {
      if (m.isMesh) { const tr = m.material.transparent; m.castShadow = !tr && !m.userData.noShadow; m.receiveShadow = !tr; }
    });
    const [w, h, d] = o.size, mass = o.mass ?? 0;
    const side = o.rotY && Math.abs(Math.sin(o.rotY)) > 0.7;
    this.hx = (side ? d : w) / 2; this.hz = (side ? w : d) / 2;
    const body = new CANNON.Body({ mass, shape: new CANNON.Box(new CANNON.Vec3(w / 2, h / 2, d / 2)), material: this.kind === 'rubber' ? S.rubberMat : S.physMat });
    body.position.set(o.pos[0], o.pos[1], o.pos[2]);
    if (o.rotY) body.quaternion.setFromEuler(0, o.rotY, 0);
    body.linearDamping = 0.04; body.angularDamping = 0.2;
    body.allowSleep = true; body.sleepSpeedLimit = 0.25; body.sleepTimeLimit = 0.5;
    const heavy = mass > 10;
    body.collisionFilterGroup = mass === 0 ? GRP.STATIC : heavy ? GRP.HEAVY : GRP.PROP;
    body.collisionFilterMask = (heavy || mass === 0) ? (GRP.STATIC | GRP.PROP | GRP.DEBRIS | GRP.HEAVY) : -1;
    body.prop = this; this.body = body;
    body.addEventListener('collide', (e) => {
      if (!this.alive || this.impactCd > 0) return;
      const v = Math.abs(e.contact.getImpactVelocityAlongNormal());
      if (v < 2.2) return;
      this.impactCd = 0.06;
      const other = e.body.prop || null, shard = e.body.collisionFilterGroup === GRP.DEBRIS;
      S.deferred.push(() => impact(this, other, v, shard));
    });
    S.world.addBody(body); S.roomGroup.add(this.group); this.sync(); S.props.push(this);
    if (this.value && !o.noCount) g.total += this.value;
  }
  sync() { this.group.position.copy(this.body.position); this.group.quaternion.copy(this.body.quaternion); }
  get pos() { return this.group.position; }
}
export const addProp = (o) => new Prop(o);

function impact(p, other, v, shard) {
  if (!p.alive || shard) return;   // loose rubble never breaks or detonates anything
  if (p.o.onImpact && p.o.onImpact(p, other, v)) return;
  const selfThrown = p.thrownT > 0, otherThrown = !!other && other.thrownT > 0;
  if ((selfThrown || otherThrown) && v > 3) {
    if (selfThrown) {
      if (!(other && other.kind === 'guard')) addNoise(30);   // a clean hit on a sleeper is silent; a miss is not
      sfx.thud(); shake(0.1);
      emit(p.pos, 6, { color: DUST[p.kind] || 0xffffff, speed: [1, 3], size: [0.05, 0.1] });
      p.thrownT = Math.min(p.thrownT, 0.3);
      if (S.room && S.room.def.onSpark) S.room.def.onSpark(p.pos);
    }
    damage(p, Math.max(1, Math.round(v / 5)), 'throw', other ? other.pos : null);
  } else if (v > 12 && !shard) damage(p, 1, 'impact', null);   // flying rubble never sets things off by itself
}

export function damage(p, amt, src, from) {
  if (!p.alive) return false;
  const im = p.immune;
  if (im[src] || (src === 'impact' && im.throw)) return false;
  p.hp -= amt; p.squash = 1;
  if (p.hp <= 0) breakProp(p, src, from);
  else if (p.o.onHit) p.o.onHit(p, src);
  return true;
}

export function removeProp(p) {
  p.alive = false;
  S.world.removeBody(p.body);
  S.roomGroup.remove(p.group);
  S.propsDirty = true;
}

export function breakProp(p, src, from) {
  if (!p.alive) return;
  const g = S.game, c = p.pos.clone();
  if (p.value && !p.o.noCount) g.broken += p.value;
  if (p.o.breakStyle === 'fly') {
    p.alive = false; S.propsDirty = true;
    const b = p.body;
    b.type = CANNON.Body.DYNAMIC; b.mass = p.o.flyMass || 8; b.updateMassProperties();
    b.collisionFilterGroup = GRP.DEBRIS; b.collisionFilterMask = -1; b.wakeUp();
    const dir = from ? V(c.x - from.x, 0, c.z - from.z).normalize() : V(rnd(-1, 1), 0, 1).normalize();
    b.velocity.set(dir.x * 7, 7.5, dir.z * 7);
    b.angularVelocity.set(rnd(-8, 8), rnd(-8, 8), rnd(-8, 8));
    S.debris.push({ mesh: p.group, body: b, life: 9, base: [1, 1, 1], kept: true });
  } else {
    removeProp(p);
    spawnChunks(p, from);
  }
  const big = p.size[0] * p.size[1] * p.size[2] > 0.6;
  emit(c, big ? 22 : 12, { color: DUST[p.kind] || 0xffffff, speed: [2, 6], size: [0.05, 0.14], up: 2, spread: Math.min(p.size[0], p.size[1]) * 0.4 });
  emit(c, big ? 9 : 5, { color: 0xffe9a8, hdr: 3, speed: [3, 8], size: [0.03, 0.07], life: [0.15, 0.4], grav: 6 });
  emit(c, big ? 6 : 3, { color: [0xf2f2f2, 0xdcdcdc], speed: [0.5, 1.8], size: [0.07, 0.14], life: [0.4, 0.8], grav: -1.2, drag: 2.5, grow: 1.3 });
  breakSound(p.kind);
  if (!p.o.quiet) pop(V(c.x, Math.min(c.y + p.size[1] / 2 + 0.2, 3.6), c.z), pick(WORDS[p.kind] || WORDS.wood), { size: big ? 46 : 34 });
  shake(big ? 0.45 : 0.25); hitStop(big ? 0.07 : 0.04);
  addDopamine(p.o.dopa ?? (8 + p.value * 3)); addCombo(); addNoise(14);
  for (const b of S.world.bodies) if (b.sleepState === 2 && b.position.distanceTo(p.body.position) < 3.2) b.wakeUp();
  if (p.o.onBreak) p.o.onBreak(p, src, from);
}

function spawnChunks(p, from) {
  const [w, h, d] = p.size, vol = w * h * d, glass = p.kind === 'glass';
  const n = p.o.chunks ?? clamp(Math.round(vol * 5) + 5, 5, glass ? 18 : 13);
  const s = Math.cbrt(vol / n);
  const nx = clamp(Math.round(w / s), 1, 5), ny = clamp(Math.round(h / s), 1, 5), nz = clamp(Math.round(d / s), 1, 5);
  const q = p.body.quaternion, bp = p.body.position, bv = p.body.velocity;
  const push = from ? V(bp.x - from.x, 0, bp.z - from.z).normalize() : V();
  const colors = p.o.chunkColors || [p.o.color ?? 0xc98a4b];
  const thin = glass ? [w, h, d].indexOf(Math.min(w, h, d)) : -1;
  const local = new CANNON.Vec3(), wp = new CANNON.Vec3();
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) for (let k = 0; k < nz; k++) {
    const lx = ((i + 0.5) / nx - 0.5) * w, ly = ((j + 0.5) / ny - 0.5) * h, lz = ((k + 0.5) / nz - 0.5) * d;
    const sz = [w / nx * rnd(0.5, 0.95), h / ny * rnd(0.5, 0.95), d / nz * rnd(0.5, 0.95)];
    if (glass) { sz[thin] = Math.min(sz[thin], 0.035); if (nx * ny * nz < 8) { sz[(thin + 1) % 3] *= 0.6; } }
    local.set(lx, ly, lz); q.vmult(local, wp); wp.vadd(bp, wp);
    const out = V(lx, ly, lz); if (out.lengthSq() > 0) out.normalize();
    const vel = V(bv.x, bv.y, bv.z).multiplyScalar(0.6).addScaledVector(out, rnd(1.5, 4.5)).addScaledVector(push, rnd(2, 6.5));
    vel.y += rnd(1, 4.5);
    addDebris({
      size: sz, pos: wp, quat: q, vel,
      material: glass ? glassMat() : p.kind === 'gold' ? goldMat() : mat(pick(colors), p.kind === 'metal' ? { r: 0.4, m: 0.7 } : {}),
      life: glass ? rnd(2, 3.2) : rnd(5, 8),
    });
  }
}

export function addDebris(o) {
  if (S.debris.length >= MAXD) { for (const d of S.debris) if (d.life > 0.25 && !d.kept) { d.life = 0.25; break; } }
  const mesh = new THREE.Mesh(o.geo || unitBox, o.material);
  mesh.scale.set(o.size[0], o.size[1], o.size[2]);
  mesh.castShadow = !o.material.transparent; mesh.receiveShadow = !o.material.transparent;
  const hs = o.half || [o.size[0] / 2, o.size[1] / 2, o.size[2] / 2];
  const body = new CANNON.Body({
    mass: o.mass ?? clamp(o.size[0] * o.size[1] * o.size[2] * 40, 0.08, 3),
    shape: new CANNON.Box(new CANNON.Vec3(hs[0], hs[1], hs[2])), material: S.physMat,
  });
  body.position.set(o.pos.x, o.pos.y, o.pos.z);
  if (o.quat) body.quaternion.copy(o.quat);
  body.velocity.set(o.vel.x, o.vel.y, o.vel.z);
  body.angularVelocity.set(rnd(-10, 10), rnd(-10, 10), rnd(-10, 10));
  body.collisionFilterGroup = GRP.DEBRIS;
  body.linearDamping = 0.05; body.angularDamping = 0.3;
  body.allowSleep = true; body.sleepSpeedLimit = 0.3; body.sleepTimeLimit = 0.4;
  S.world.addBody(body); S.roomGroup.add(mesh);
  mesh.position.copy(body.position); mesh.quaternion.copy(body.quaternion);
  S.debris.push({ mesh, body, life: o.life ?? 6, base: o.size });
}

export function spawnCoins(pos, n) {
  for (let i = 0; i < n; i++) {
    addDebris({ geo: coinGeo, size: [1, 1, 1], half: [0.09, 0.02, 0.09], mass: 0.12,
      pos: { x: pos.x + rnd(-0.2, 0.2), y: pos.y + rnd(0, 0.4), z: pos.z + rnd(-0.2, 0.2) },
      vel: V(rnd(-4, 4), rnd(4, 9), rnd(-2, 5)), material: goldMat(), life: rnd(5, 8) });
  }
  emit(pos, 16, { color: 0xffd84a, hdr: 2.6, speed: [3, 8], size: [0.03, 0.07], life: [0.3, 0.7], up: 3 });
  sfx.coins();
}

export function explode(pos, R = 3.4 * ((S.room && S.room.def.blastMul) || 1)) {
  flash('#fff3c4', 0.85, 0.5); shake(1); hitStop(0.09); sfx.boom();
  pop(V(pos.x, Math.min(pos.y + 1, 3.4), pos.z), 'ドカーン！！', { size: 64, cls: 'big' });
  emit(pos, 46, { color: [0xff8a1f, 0xffd23a, 0xff4a1f], hdr: 3.2, speed: [4, 13], size: [0.07, 0.2], life: [0.25, 0.7], grav: 4, up: 2 });
  emit(pos, 26, { color: [0x3a3a3a, 0x5a5a5a, 0x222222], speed: [1, 4.5], size: [0.16, 0.34], life: [0.6, 1.3], grav: -2, drag: 2, grow: 1.6 });
  ring(V(pos.x, 0.06, pos.z), R * 1.4, { color: 0xffc35a, dur: 0.5 });
  ring(pos, R, { color: 0xffffff, dur: 0.3, face: true });
  // an unbroken glass wall stops the blast: nothing on the far side is touched
  const gw = S.room && S.room.wall && S.room.wall.alive ? S.room.wall : null;
  const shielded = (z) => !!gw && (pos.z - gw.pos.z) * (z - gw.pos.z) < 0;
  // a blast knocks out anyone dozing inside it; whoever is further away hears it
  if (S.room && S.room.sl) for (const o of S.room.sl) if (o.asleep() && !shielded(o.z) && Math.hypot(o.x - pos.x, 0.85 - pos.y, o.z - pos.z) < R) o.ko(pos);
  addDopamine(25); addNoise(100);
  for (const p of [...S.props]) {
    if (!p.alive || (p !== gw && shielded(p.pos.z))) continue;
    const dist = p.pos.distanceTo(pos);
    if (dist < (p.o.blastR ?? R)) { const pp = p; after(0.03 + dist * 0.03, () => damage(pp, 12, 'blast', pos)); }
    else if (p.o.onBlastFar) p.o.onBlastFar(p);
  }
  blastImpulse(pos, R * 1.5, 13);
  const k = S.kid;
  if (k && !shielded(k.z) && k.pos3().distanceTo(pos) < 2.7) k.hurt(1.2, pos);
}

export function blastImpulse(pos, R, power) {
  for (const b of S.world.bodies) {
    if (b.type !== CANNON.Body.DYNAMIC) continue;
    const dx = b.position.x - pos.x, dy = b.position.y - pos.y, dz = b.position.z - pos.z;
    const dist = Math.hypot(dx, dy, dz);
    if (dist > R) continue;
    const f = (1 - dist / R) * power / (1 + b.mass / 9), inv = 1 / Math.max(dist, 0.3);
    b.wakeUp();
    b.velocity.x += dx * inv * f; b.velocity.z += dz * inv * f; b.velocity.y += (Math.max(dy * inv, 0) + 0.7) * f * 0.75;
    b.angularVelocity.set(rnd(-6, 6), rnd(-6, 6), rnd(-6, 6));
  }
}

export function updateProps(dt) {
  for (const p of S.props) {
    if (!p.alive) continue;
    p.sync();
    if (p.thrownT > 0) p.thrownT -= dt;
    if (p.impactCd > 0) p.impactCd -= dt;
    if (p.squash > 0) {
      p.squash = Math.max(0, p.squash - dt * 8);
      const k = Math.sin(p.squash * Math.PI) * 0.1;
      p.group.scale.set(1 + k, 1 - k, 1 + k);
    }
    if (p.o.update) p.o.update(p, dt);
    if (p.body.position.y < -6) { p.body.position.set(0, 3, 0); p.body.velocity.set(0, 0, 0); }
  }
  if (S.propsDirty) { S.props = S.props.filter((p) => p.alive); S.propsDirty = false; }
  for (let i = S.debris.length - 1; i >= 0; i--) {
    const d = S.debris[i];
    d.life -= dt;
    if (d.life <= 0 || d.body.position.y < -6) {
      S.world.removeBody(d.body); S.roomGroup.remove(d.mesh); S.debris.splice(i, 1); continue;
    }
    d.mesh.position.copy(d.body.position); d.mesh.quaternion.copy(d.body.quaternion);
    if (d.life < 0.35) { const k = d.life / 0.35; d.mesh.scale.set(d.base[0] * k, d.base[1] * k, d.base[2] * k); }
  }
}

// ------------------------------------------------------------------ prop library
const WOOD = 0xc98a4b, WOOD_D = 0x8a5a33, STEEL = 0x8b97a6, STEEL_D = 0x4f5a69;
const steel = (c = STEEL) => ({ r: 0.38, m: 0.75 });

function readPaper(p) {
  const g = S.game;
  g.hints++;
  say(pick(['長っ', '3行で頼む', '読めん', '動画にして', '字ぃ多っ']), 1.3);
  sfx.paper(); addDopamine(8);
  const c = p.pos.clone();
  removeProp(p);
  addDebris({ size: [0.17, 0.17, 0.17], pos: { x: c.x, y: c.y + 0.5, z: c.z }, vel: V(rnd(-3, 3), 5.5, rnd(2, 5)), material: mat(0xfffdf2), life: 6 });
  pop(V(c.x, c.y + 0.4, c.z), 'ポイッ', { size: 30 });
  return true;
}

export const P = {
  crate(x, z, s = 0.7, y) {
    return { name: 'crate', kind: 'wood', size: [s, s, s], pos: [x, y ?? s / 2, z], mass: 2.4, hp: 2, throwable: true, color: WOOD, rotY: rnd(-0.3, 0.3),
      chunkColors: [WOOD, WOOD_D, 0xdba463],
      build(g) {
        bx(g, s * 0.95, s * 0.95, s * 0.95, 0xdba463);
        const t = s * 0.13, e = (s - t) / 2;
        for (const a of [-1, 1]) for (const b of [-1, 1]) {
          bx(g, s, t, t, WOOD_D, 0, a * e, b * e); bx(g, t, s, t, WOOD_D, a * e, 0, b * e); bx(g, t, t, s, WOOD_D, a * e, b * e, 0);
        }
        bx(g, t * 0.8, s * 1.2, 0.02, WOOD_D, 0, 0, s / 2, { rz: 0.78 });
      } };
  },
  barrel(x, z, color = 0x2f7fd1, boom = false) {
    if (boom) color = 0xd92b2b;
    return { name: 'barrel', kind: 'metal', size: [0.74, 1, 0.74], pos: [x, 0.5, z], mass: 4, hp: boom ? 2 : 3, throwable: true, color,
      onBreak: boom ? (p) => { const c = p.pos.clone(); after(0.02, () => explode(c, 2.3)); } : undefined,
      build(g) {
        cy(g, 0.37, 0.37, 1, color, 0, 0, 0, { r: 0.45, m: 0.5 });
        for (const yy of [-0.3, 0.3]) cy(g, 0.385, 0.385, 0.06, 0xdfe5ea, 0, yy, 0, steel());
        cy(g, 0.33, 0.33, 0.02, STEEL_D, 0, 0.5, 0, steel());
      } };
  },
  chair(x, z, rotY = 0) {
    return { name: 'chair', kind: 'wood', size: [0.6, 1.1, 0.6], pos: [x, 0.55, z], mass: 2.6, hp: 2, throwable: true, color: WOOD, rotY,
      build(g) {
        bx(g, 0.6, 0.08, 0.6, 0xb2703a, 0, -0.05, 0, { round: 0.03 });
        bx(g, 0.5, 0.06, 0.5, 0xd94848, 0, 0.02, 0, { round: 0.03 });
        for (const a of [-1, 1]) for (const b of [-1, 1]) bx(g, 0.07, 0.5, 0.07, WOOD_D, a * 0.24, -0.3, b * 0.24);
        bx(g, 0.6, 0.5, 0.07, 0xb2703a, 0, 0.3, -0.26, { round: 0.03 });
      } };
  },
  desk(x, z, color = 0xa9683a) {
    return { name: 'desk', kind: 'wood', size: [2, 0.9, 0.9], pos: [x, 0.45, z], mass: 14, hp: 4, value: 2, color, chunkColors: [color, WOOD_D],
      build(g) {
        bx(g, 2, 0.1, 0.9, color, 0, 0.4, 0, { round: 0.03 });
        bx(g, 0.08, 0.8, 0.8, WOOD_D, -0.9, -0.05, 0); bx(g, 0.08, 0.8, 0.8, WOOD_D, 0.9, -0.05, 0);
        bx(g, 0.6, 0.6, 0.8, color, 0.55, 0.05, 0, { round: 0.02 });
        for (const yy of [0.2, -0.08]) { bx(g, 0.5, 0.2, 0.03, 0xc07a45, 0.55, yy, 0.41); sp(g, 0.035, 0xffd66b, 0.55, yy, 0.44, { m: 0.9, r: 0.3 }); }
        bx(g, 1.8, 0.5, 0.04, WOOD_D, 0, 0.1, -0.4);
      } };
  },
  bookshelf(x, z, rotY = 0) {
    const bc = [0xd94848, 0x3d7fd9, 0x2fa56a, 0xf0b93a, 0x8d4fd1, 0xf07a3a, 0xf2f2f2];
    return { name: 'bookshelf', kind: 'wood', size: [1.4, 2.6, 0.55], pos: [x, 1.3, z], mass: 20, hp: 5, value: 3, rotY, color: WOOD_D, chunks: 14,
      chunkColors: [...bc, WOOD_D, WOOD_D, WOOD_D],
      build(g) {
        bx(g, 1.4, 2.6, 0.06, 0x6b4426, 0, 0, -0.24);
        bx(g, 0.08, 2.6, 0.55, WOOD_D, -0.66, 0, 0); bx(g, 0.08, 2.6, 0.55, WOOD_D, 0.66, 0, 0);
        for (let r = 0; r < 5; r++) {
          const yy = -1.26 + r * 0.63;
          bx(g, 1.4, 0.07, 0.55, WOOD_D, 0, yy, 0);
          if (r === 4) break;
          let px = -0.58;
          while (px < 0.5) {
            const bw = rnd(0.07, 0.13), bh = rnd(0.36, 0.5);
            bx(g, bw, bh, 0.36, pick(bc), px + bw / 2, yy + 0.035 + bh / 2, 0.02, { rz: Math.random() < 0.12 ? 0.18 : 0 });
            px += bw + 0.012;
          }
        }
      } };
  },
  safe(x, z) {
    return { name: 'safe', kind: 'metal', size: [1.1, 1.2, 1], pos: [x, 0.6, z], mass: 60, hp: 12, value: 4, color: 0x3f4856, chunks: 12,
      chunkColors: [0x3f4856, 0x596475, 0x2a313c], dopa: 30,
      build(g) {
        bx(g, 1.1, 1.2, 1, 0x3f4856, 0, 0, 0, { round: 0.06, r: 0.4, m: 0.7 });
        bx(g, 0.9, 1.0, 0.06, 0x596475, 0, 0, 0.5, { round: 0.03, r: 0.35, m: 0.8 });
        cy(g, 0.19, 0.19, 0.08, 0xdfe5ea, -0.12, 0.08, 0.56, { rx: Math.PI / 2, r: 0.25, m: 0.9 });
        cy(g, 0.05, 0.05, 0.14, 0x222831, -0.12, 0.08, 0.6, { rx: Math.PI / 2 });
        for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; bx(g, 0.012, 0.045, 0.01, 0x222831, -0.12 + Math.cos(a) * 0.15, 0.08 + Math.sin(a) * 0.15, 0.605, { rz: a - Math.PI / 2 }); }
        bx(g, 0.07, 0.34, 0.07, 0xdfe5ea, 0.3, 0.05, 0.56, { round: 0.03, r: 0.25, m: 0.9 });
        for (const yy of [-0.35, 0.35]) bx(g, 0.07, 0.2, 0.06, 0x2a313c, -0.5, yy, 0.5);
      },
      onBreak(p) { spawnCoins(p.pos, 18); pop(V(p.pos.x, 2, p.pos.z), 'ジャラララ！', { size: 46 }); } };
  },
  vase(x, z, y = 0.42, glass = false, color = 0x3d7fd9) {
    return { name: 'vase', kind: glass ? 'glass' : 'stone', size: [0.44, 0.84, 0.44], pos: [x, y, z], mass: 1.3, hp: 1, throwable: true, color,
      chunkColors: [color, 0xf4f1e8],
      build(g) {
        const m = glass ? glassMat() : null, o = m ? { mat: m } : { r: 0.3 };
        sp(g, 0.22, color, 0, -0.14, 0, { ...o, sy: 1.25 });
        cy(g, 0.1, 0.14, 0.3, 0xf4f1e8, 0, 0.2, 0, o);
        cy(g, 0.15, 0.1, 0.07, color, 0, 0.385, 0, o);
        cy(g, 0.14, 0.17, 0.07, 0xf4f1e8, 0, -0.385, 0, o);
      } };
  },
  lamp(x, z) {
    return { name: 'lamp', kind: 'metal', size: [0.46, 2, 0.46], pos: [x, 1, z], mass: 2, hp: 1, throwable: true, color: 0x2a313c, chunkColors: [0x2a313c, 0xffe7a8],
      build(g) {
        cy(g, 0.2, 0.22, 0.06, 0x2a313c, 0, -0.97, 0, steel());
        cy(g, 0.025, 0.025, 1.6, 0x2a313c, 0, -0.17, 0, steel());
        cy(g, 0.13, 0.23, 0.36, 0xffe7a8, 0, 0.78, 0, { e: 0xffc860, ei: 1.3, r: 0.6 });
      } };
  },
  plant(x, z) {
    return { name: 'plant', kind: 'stone', size: [0.6, 1.2, 0.6], pos: [x, 0.6, z], mass: 3, hp: 1, throwable: true, color: 0xc4683f, chunkColors: [0xc4683f, 0x2fa56a, 0x3fbf7f, 0x5a3a22],
      build(g) {
        cy(g, 0.26, 0.19, 0.45, 0xc4683f, 0, -0.37, 0);
        cy(g, 0.24, 0.24, 0.03, 0x5a3a22, 0, -0.15, 0);
        for (let i = 0; i < 7; i++) {
          const a = i / 7 * 6.28, r = i ? 0.16 : 0;
          sp(g, 0.16, i % 2 ? 0x2fa56a : 0x3fbf7f, Math.cos(a) * r, 0.12 + (i % 3) * 0.14, Math.sin(a) * r, { sy: 1.9, rz: Math.cos(a) * -0.5, rx: Math.sin(a) * 0.5, seg: 10, seg2: 8 });
        }
      } };
  },
  painting(x, y, sym, colors, o = {}) {
    const side = o.side || 0; // 0 back wall, -1 left wall, 1 right wall
    const pos = side === 0 ? [x, y, WZ + 0.07] : [side * (RW / 2 - 0.07), y, x];
    return { name: 'painting', kind: 'wood', size: [1.1, 1.1, 0.1], pos, rotY: side ? -side * Math.PI / 2 : 0, mass: 0, hp: 1, color: 0xb88a3a,
      chunkColors: [0xb88a3a, colors[0], colors[1]],
      build(g) {
        bx(g, 1.1, 1.1, 0.08, 0xb88a3a, 0, 0, 0, { round: 0.03, r: 0.4, m: 0.6 });
        plane(g, 0.9, 0.9, texMat(paintingTex(sym, colors[0], colors[1])), 0, 0, 0.045);
      } };
  },
  window(z, y = 2.2) {
    return { name: 'window', kind: 'glass', size: [1.6, 1.4, 0.08], pos: [-RW / 2 + 0.06, y, z], rotY: Math.PI / 2, mass: 0, hp: 2, color: 0xbfefff, chunks: 14,
      build(g) {
        bx(g, 1.5, 1.3, 0.03, 0, 0, 0, 0, { mat: glassMat() });
        for (const a of [-1, 1]) { bx(g, 1.7, 0.09, 0.1, 0xf4f1e8, 0, a * 0.7, 0); bx(g, 0.09, 1.4, 0.1, 0xf4f1e8, a * 0.8, 0, 0); }
        bx(g, 0.05, 1.4, 0.06, 0xf4f1e8, 0, 0, 0); bx(g, 1.6, 0.05, 0.06, 0xf4f1e8, 0, 0, 0);
      } };
  },
  keypad(x, y = 1.35) {
    const tex = ctex(128, 192, (c, w, h) => {
      c.fillStyle = '#20242c'; c.fillRect(0, 0, w, h);
      c.fillStyle = '#0c3'; c.fillRect(14, 12, w - 28, 34); c.fillStyle = '#031'; c.font = '700 24px monospace'; c.fillText('____', 30, 38);
      for (let r = 0; r < 4; r++) for (let q = 0; q < 3; q++) { c.fillStyle = '#e8e8e8'; c.fillRect(16 + q * 34, 58 + r * 32, 28, 26); c.fillStyle = '#222'; c.font = '700 18px sans-serif'; c.fillText('123456789*0#'[r * 3 + q], 24 + q * 34, 78 + r * 32); }
    });
    let mashed = false;
    return { name: 'keypad', kind: 'plastic', size: [0.36, 0.52, 0.1], pos: [x, y, WZ + 0.06], mass: 0, hp: 2, color: 0x20242c,
      build(g) { bx(g, 0.36, 0.52, 0.08, 0x20242c, 0, 0, 0, { round: 0.02 }); plane(g, 0.32, 0.48, texMat(tex), 0, 0, 0.045); sp(g, 0.02, 0xff2a2a, 0.13, 0.22, 0.05, { e: 0xff2a2a, ei: 3 }); },
      onPunch(p) { if (mashed) return false; mashed = true; sfx.keypad(); after(0.25, () => sfx.error()); say('ピピピピ…ERROR。知らん', 1.3); p.squash = 1; addDopamine(4); return true; } };
  },
  hint(x, y, z, title, body, o = {}) {
    S.game.hintsTotal++;
    const wall = o.wall;
    return { name: 'hint', kind: 'paper', size: wall ? [0.6, 0.8, 0.03] : [0.5, 0.03, 0.68], pos: [x, y, z], rotY: o.rotY || 0, mass: wall ? 0 : 0.2, hp: 1, value: 0, color: 0xfffdf2,
      build(g) {
        if (wall) { bx(g, 0.6, 0.8, 0.02, 0xfffdf2); plane(g, 0.58, 0.78, texMat(paperTex(title, body)), 0, 0, 0.012); }
        else { bx(g, 0.5, 0.02, 0.68, 0xfffdf2); plane(g, 0.48, 0.66, texMat(paperTex(title, body)), 0, 0.012, 0, { rx: -Math.PI / 2 }); }
      },
      onPunch: readPaper, onImpact() { return true; } };
  },
  door(o = {}) {
    return { name: 'door', kind: 'wood', size: [DW, DH, 0.16], pos: [0, DH / 2, WZ + 0.1], mass: 0, hp: o.hp ?? 5, value: 3, color: 0x9a6236, chunks: 16,
      chunkColors: [0x9a6236, 0x7d4d28, 0xb37842], dopa: 30,
      build(g) {
        bx(g, DW, DH, 0.14, 0x9a6236, 0, 0, 0, { round: 0.02 });
        for (const yy of [0.62, -0.62]) bx(g, DW - 0.5, 0.95, 0.04, 0x7d4d28, 0, yy, 0.07, { round: 0.02 });
        sp(g, 0.075, 0xffd66b, 0.62, -0.05, 0.13, { m: 0.9, r: 0.25 });
        bx(g, 0.2, 0.17, 0.07, 0xf0b93a, 0.62, -0.32, 0.12, { round: 0.03, m: 0.7, r: 0.3 });
        const sh = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.02, 8, 16, Math.PI), mat(0xdfe5ea, steel()));
        sh.position.set(0.62, -0.235, 0.12); g.add(sh);
      } };
  },
  shutter() {
    return { name: 'shutter', kind: 'metal', size: [DW, DH, 0.14], pos: [0, DH / 2, WZ + 0.1], mass: 0, hp: 999, value: 0, color: STEEL, immune: { punch: true, throw: true, scream: true, blast: true, impact: true },
      build(g) {
        for (let i = 0; i < 15; i++) bx(g, DW, DH / 15 - 0.01, i % 2 ? 0.1 : 0.14, i % 2 ? 0x7d8794 : 0xa5b0bd, 0, -DH / 2 + (i + 0.5) * DH / 15, 0, steel());
        plane(g, DW, 0.22, texMat(label([''], { w: 256, h: 32, bg: '#f5c518', hazard: true })), 0, -DH / 2 + 0.13, 0.075);
        bx(g, 0.4, 0.06, 0.08, 0x2a313c, 0, -DH / 2 + 0.36, 0.09);
      },
      onPunch(p, kid) { sfx.clang(); shake(0.2); pop(V(p.pos.x, 1.4, p.pos.z + 0.3), 'カーン', { size: 38 }); say(pick(['硬っ！！', '手ぇ痛っ', 'シャッター無理'])); kid.recoil = 1; addNoise(10); return true; },
      update(p, dt) {
        if (!p.opening) return;
        p.body.position.y += dt * 4.2;
        if (p.body.position.y > DH * 1.5 + 0.1) { p.opening = false; }
      } };
  },
  glassDoor() {
    return { name: 'glassdoor', kind: 'glass', size: [DW, DH, 0.16], pos: [0, DH / 2, WZ + 0.1], mass: 0, hp: 1, value: 3, color: 0xbfefff, chunks: 18, dopa: 30,
      immune: { punch: true, throw: true, impact: true, blast: false },
      build(g) {
        bx(g, DW - 0.1, DH - 0.1, 0.1, 0, 0, 0, 0, { mat: glassMat() });
        for (const a of [-1, 1]) { bx(g, 0.08, DH, 0.16, STEEL, a * (DW / 2 - 0.04), 0, 0, steel()); bx(g, DW, 0.08, 0.16, STEEL, 0, a * (DH / 2 - 0.04), 0, steel()); }
        bx(g, 0.06, 0.7, 0.06, 0xdfe5ea, 0.55, 0, 0.11, steel());
        plane(g, 0.7, 0.26, texMat(label([{ t: '防弾ガラス', s: 44, c: '#fff' }], { w: 256, h: 96, bg: '#d22' })), -0.25, 0.5, 0.06);
      },
      onPunch(p, kid) { sfx.bounce(); pop(V(p.pos.x, 1.4, p.pos.z + 0.3), 'ボヨン', { size: 38 }); say(pick(['防弾ガラスかよ', '割れん！！', '殴ってもムダか…'])); kid.recoil = 1; return true; } };
  },
  vaultDoor() {
    return { name: 'vault', kind: 'metal', size: [2.7, 2.9, 0.5], pos: [0, 1.45, WZ + 0.3], mass: 0, hp: 10, value: 5, color: 0x7b8794, chunks: 16, dopa: 40,
      chunkColors: [0x7b8794, 0x5a6471, 0xa7b2bf], immune: { punch: true, throw: true, scream: true, impact: true }, blastR: 2.5,
      onBlastFar() { after(0.9, () => say('金庫まで届いてない。TNTは金庫に投げる', 2.6)); },
      build(g) {
        cy(g, 1.35, 1.35, 0.4, 0x7b8794, 0, 0, 0, { rx: Math.PI / 2, seg: 40, r: 0.35, m: 0.85 });
        cy(g, 1.1, 1.1, 0.46, 0x99a5b3, 0, 0, 0.02, { rx: Math.PI / 2, seg: 40, r: 0.3, m: 0.85 });
        for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; cy(g, 0.07, 0.07, 0.1, 0x5a6471, Math.cos(a) * 1.22, Math.sin(a) * 1.22, 0.2, { rx: Math.PI / 2, seg: 8, m: 0.8, r: 0.4 }); }
        const wheel = new THREE.Group(); wheel.position.z = 0.32; g.add(wheel);
        const t = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.045, 10, 28), mat(0xdfe5ea, steel())); wheel.add(t);
        for (let i = 0; i < 3; i++) bx(wheel, 0.84, 0.05, 0.05, 0xdfe5ea, 0, 0, 0, { rz: i * Math.PI / 3, ...steel() });
        cy(wheel, 0.09, 0.09, 0.14, 0x5a6471, 0, 0, 0, { rx: Math.PI / 2 });
        bx(g, 0.3, 0.7, 0.3, 0x5a6471, -1.3, 0, 0.05, { round: 0.05, m: 0.8, r: 0.4 });
      },
      onPunch(p, kid) { sfx.clang(); shake(0.2); pop(V(p.pos.x, 1.4, p.pos.z + 0.5), 'ゴーン', { size: 40 }); say(pick(['ビクともせん', '厚っ！！', '爆破しかなくね？'])); kid.recoil = 1; return true; } };
  },
  button(x, y) {
    return { name: 'button', kind: 'plastic', size: [0.8, 0.8, 0.3], pos: [x, y, WZ + 0.15], mass: 0, hp: 999, value: 0, color: 0xff2a2a,
      immune: { punch: true, throw: true, scream: true, blast: true, impact: true },
      build(g, p) {
        plane(g, 0.9, 0.9, texMat(label([''], { w: 128, h: 128, bg: '#f5c518', hazard: true })), 0, 0, -0.13);
        cy(g, 0.3, 0.3, 0.1, 0x2a313c, 0, 0, -0.08, { rx: Math.PI / 2 });
        p.cap = cy(g, 0.24, 0.24, 0.16, 0xff2a2a, 0, 0, 0.02, { rx: Math.PI / 2, e: 0xff1a1a, ei: 1.6, r: 0.35 });
      } };
  },
  ladderPart(x, z, rotY = 0) {
    return { name: 'ladder', kind: 'metal', size: [0.5, 0.1, 1.5], pos: [x, 0.06, z], rotY, mass: 1.2, hp: 2, throwable: true, color: 0xf0b93a, chunkColors: [0xf0b93a, 0xdfe5ea],
      build(g) { for (const a of [-1, 1]) bx(g, 0.06, 0.08, 1.5, 0xf0b93a, a * 0.22, 0, 0, steel()); for (let i = 0; i < 4; i++) bx(g, 0.44, 0.05, 0.05, 0xdfe5ea, 0, 0, -0.55 + i * 0.37, steel()); } };
  },
  cone(x, z) {
    return { name: 'cone', kind: 'plastic', size: [0.5, 0.7, 0.5], pos: [x, 0.35, z], mass: 0.8, hp: 1, throwable: true, color: 0xff7a1f, chunkColors: [0xff7a1f, 0xffffff],
      build(g) { bx(g, 0.5, 0.05, 0.5, 0xff7a1f, 0, -0.32, 0, { round: 0.02 }); cy(g, 0.04, 0.2, 0.62, 0xff7a1f, 0, 0, 0); cy(g, 0.105, 0.14, 0.12, 0xffffff, 0, 0.0, 0); } };
  },
  tire(x, z, y = 0.16) {
    return { name: 'tire', kind: 'rubber', size: [0.9, 0.3, 0.9], pos: [x, y, z], mass: 2, hp: 3, throwable: true, color: 0x26282c, chunkColors: [0x26282c, 0x3a3d43],
      build(g) {
        const t = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.14, 10, 22), mat(0x26282c, { r: 0.95 })); t.rotation.x = Math.PI / 2; g.add(t);
        cy(g, 0.19, 0.19, 0.16, 0xaab3bd, 0, 0, 0, steel());
      } };
  },
  metalShelf(x, z, rotY = 0) {
    return { name: 'shelf', kind: 'metal', size: [1.8, 2.2, 0.6], pos: [x, 1.1, z], rotY, mass: 25, hp: 5, value: 3, color: STEEL, chunks: 14,
      chunkColors: [STEEL, STEEL_D, WOOD, 0xd94848, 0x3d7fd9, 0xf0b93a],
      build(g) {
        for (const a of [-1, 1]) for (const b of [-1, 1]) bx(g, 0.06, 2.2, 0.06, STEEL_D, a * 0.87, 0, b * 0.27, steel());
        for (let r = 0; r < 4; r++) {
          const yy = -1.0 + r * 0.68; bx(g, 1.8, 0.05, 0.6, STEEL, 0, yy, 0, steel());
          if (r < 3) for (let i = 0; i < 3; i++) { const w = rnd(0.3, 0.5), h = rnd(0.25, 0.5); bx(g, w, h, 0.4, pick([WOOD, 0xd94848, 0x3d7fd9, 0xf0b93a, 0xdba463]), -0.58 + i * 0.58 + rnd(-0.05, 0.05), yy + 0.03 + h / 2, 0, { round: 0.02 }); }
        }
      } };
  },
  pedestal(x, z) {
    return { name: 'pedestal', kind: 'stone', size: [0.62, 1.1, 0.62], pos: [x, 0.55, z], mass: 12, hp: 4, color: 0xf0ece2, chunkColors: [0xf0ece2, 0xd9d3c4],
      build(g) { bx(g, 0.62, 0.12, 0.62, 0xf0ece2, 0, -0.49, 0, { round: 0.02 }); bx(g, 0.46, 0.86, 0.46, 0xe6e0d2, 0, 0, 0, { round: 0.02 }); bx(g, 0.62, 0.12, 0.62, 0xf0ece2, 0, 0.49, 0, { round: 0.02 }); } };
  },
  glassArt(x, y, z, v = 0) {
    return { name: 'glassart', kind: 'glass', size: [0.4, 0.62, 0.4], pos: [x, y, z], mass: 0.8, hp: 1, throwable: true, color: 0xbfefff, chunks: 8,
      build(g) {
        const m = glassMat();
        if (v % 3 === 0) { sp(g, 0.2, 0, 0, -0.08, 0, { mat: m }); cy(g, 0.02, 0.12, 0.34, 0, 0, 0.14, 0, { mat: m }); }
        else if (v % 3 === 1) { cy(g, 0.2, 0.06, 0.4, 0, 0, 0.08, 0, { mat: m, seg: 6 }); cy(g, 0.12, 0.16, 0.2, 0, 0, -0.2, 0, { mat: m, seg: 6 }); }
        else { bx(g, 0.26, 0.26, 0.26, 0, 0, 0.12, 0, { mat: m, rz: 0.78, rx: 0.6 }); cy(g, 0.05, 0.15, 0.3, 0, 0, -0.16, 0, { mat: m }); }
      } };
  },
  trophy(x, y, z) {
    return { name: 'trophy', kind: 'gold', size: [0.36, 0.56, 0.36], pos: [x, y, z], mass: 1.5, hp: 2, throwable: true, color: 0xffc531, chunks: 6,
      build(g) { const m = goldMat(); cy(g, 0.17, 0.08, 0.26, 0, 0, 0.14, 0, { mat: m }); cy(g, 0.03, 0.03, 0.14, 0, 0, -0.06, 0, { mat: m }); cy(g, 0.13, 0.15, 0.1, 0, 0, -0.22, 0, { mat: m });
        for (const a of [-1, 1]) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.018, 6, 12), m); t.position.set(a * 0.19, 0.15, 0); g.add(t); } },
      onBreak(p) { spawnCoins(p.pos, 6); } };
  },
  showcase(x, z) {
    return { name: 'showcase', kind: 'glass', size: [1.2, 1.6, 0.8], pos: [x, 0.8, z], mass: 0, hp: 2, value: 2, color: 0xbfefff, chunks: 18,
      build(g) {
        bx(g, 1.2, 0.6, 0.8, 0x4a2a22, 0, -0.5, 0, { round: 0.03 });
        bx(g, 1.1, 0.04, 0.7, 0xa0182c, 0, -0.19, 0);
        bx(g, 1.14, 0.96, 0.74, 0, 0, 0.3, 0, { mat: glassMat() });
        const m = goldMat(); cy(g, 0.17, 0.08, 0.26, 0, 0, 0.14, 0, { mat: m }); cy(g, 0.03, 0.03, 0.14, 0, 0, -0.06, 0, { mat: m }); cy(g, 0.13, 0.15, 0.1, 0, 0, -0.12, 0, { mat: m });
      },
      onBreak(p) { const c = p.pos; after(0.02, () => { const t = addProp({ ...P.trophy(c.x, 0.9, c.z), noCount: true }); t.body.velocity.set(rnd(-1, 1), 3, 2); }); } };
  },
  ropePost(x, z) {
    return { name: 'post', kind: 'metal', size: [0.26, 1, 0.26], pos: [x, 0.5, z], mass: 1, hp: 2, throwable: true, color: 0xd9a93a, chunkColors: [0xd9a93a, 0xa0182c],
      build(g) { const m = { r: 0.3, m: 0.9 }; cy(g, 0.13, 0.14, 0.05, 0xd9a93a, 0, -0.47, 0, m); cy(g, 0.03, 0.03, 0.9, 0xd9a93a, 0, 0, 0, m); sp(g, 0.07, 0xd9a93a, 0, 0.46, 0, m); bx(g, 0.05, 0.05, 0.3, 0xa0182c, 0, 0.32, 0.12); } };
  },
  bench(x, z, rotY = 0) {
    return { name: 'bench', kind: 'wood', size: [1.7, 0.5, 0.55], pos: [x, 0.25, z], rotY, mass: 7, hp: 3, throwable: true, color: 0x5a3a2a, chunkColors: [0x5a3a2a, 0xa0182c],
      build(g) { bx(g, 1.7, 0.14, 0.55, 0xa0182c, 0, 0.18, 0, { round: 0.05 }); for (const a of [-1, 1]) bx(g, 0.12, 0.36, 0.5, 0x5a3a2a, a * 0.7, -0.07, 0); } };
  },
  chandelier(x, z) {
    return { name: 'chandelier', kind: 'glass', noPick: true, size: [1.6, 0.9, 1.6], pos: [x, 3.3, z], mass: 0, hp: 1, value: 3, color: 0xbfefff, chunks: 18, dopa: 20,
      immune: { punch: true },
      build(g) {
        const br = { r: 0.3, m: 0.9 }, m = glassMat();
        cy(g, 0.02, 0.02, 0.5, 0xd9a93a, 0, 0.6, 0, br);
        const t = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.035, 8, 28), mat(0xd9a93a, br)); t.rotation.x = Math.PI / 2; t.position.y = 0.2; g.add(t);
        const t2 = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.03, 8, 20), mat(0xd9a93a, br)); t2.rotation.x = Math.PI / 2; t2.position.y = 0.36; g.add(t2);
        for (let i = 0; i < 10; i++) {
          const a = i / 10 * 6.28;
          cy(g, 0.07, 0.01, 0.34, 0, Math.cos(a) * 0.62, 0, Math.sin(a) * 0.62, { mat: m, seg: 6 });
          sp(g, 0.045, 0xfff1c4, Math.cos(a) * 0.62, 0.26, Math.sin(a) * 0.62, { e: 0xffe19a, ei: 2.4, noShadow: true });
          if (i % 2) cy(g, 0.06, 0.01, 0.3, 0, Math.cos(a) * 0.32, 0.14, Math.sin(a) * 0.32, { mat: m, seg: 6 });
        }
        sp(g, 0.14, 0, 0, -0.1, 0, { mat: m });
      },
      onPunch() { say('届かん！！'); return true; } };
  },
  locker(x, z, rotY = 0, color = 0x5d8a8a) {
    return { name: 'locker', kind: 'metal', size: [0.7, 2, 0.6], pos: [x, 1, z], rotY, mass: 18, hp: 5, value: 2, color, chunkColors: [color, STEEL_D],
      build(g) {
        bx(g, 0.7, 2, 0.6, color, 0, 0, 0, { round: 0.02, r: 0.45, m: 0.5 });
        bx(g, 0.6, 1.86, 0.02, 0x6f9c9c, 0, 0, 0.3, { r: 0.45, m: 0.5 });
        for (let i = 0; i < 4; i++) bx(g, 0.34, 0.025, 0.03, STEEL_D, 0, 0.7 - i * 0.07, 0.31);
        bx(g, 0.05, 0.16, 0.04, 0xdfe5ea, 0.22, 0, 0.32, steel());
      } };
  },
  monitor(x, y, z) {
    const tex = ctex(128, 96, (c, w, h) => { c.fillStyle = '#0a1a2a'; c.fillRect(0, 0, w, h); for (let i = 0; i < 4; i++) { c.fillStyle = ['#1f6fb0', '#2a8a6a', '#3b4f9a', '#2a6a8a'][i]; c.fillRect(4 + (i % 2) * 62, 4 + ((i / 2) | 0) * 46, 58, 42); } c.fillStyle = '#f33'; c.fillRect(8, 8, 8, 8); });
    return { name: 'monitor', kind: 'plastic', size: [0.62, 0.5, 0.16], pos: [x, y, z], mass: 1.4, hp: 1, throwable: true, color: 0x20242c, chunkColors: [0x20242c, 0x3fa0e0],
      build(g) { bx(g, 0.62, 0.42, 0.06, 0x20242c, 0, 0.04, 0, { round: 0.02 }); plane(g, 0.56, 0.36, texMat(tex, { e: 0xffffff, ei: 0.9 }), 0, 0.04, 0.035); bx(g, 0.06, 0.1, 0.05, 0x20242c, 0, -0.18, 0); bx(g, 0.3, 0.03, 0.16, 0x20242c, 0, -0.235, 0); } };
  },
  mug(x, y, z) {
    return { name: 'mug', kind: 'stone', size: [0.17, 0.2, 0.17], pos: [x, y, z], mass: 0.3, hp: 1, throwable: true, color: 0xf4f1e8, chunks: 4,
      build(g) { cy(g, 0.08, 0.07, 0.2, 0xf4f1e8, 0, 0, 0, { r: 0.3 }); cy(g, 0.065, 0.065, 0.01, 0x4a2a16, 0, 0.096, 0); } };
  },
  donuts(x, y, z) {
    return { name: 'donuts', kind: 'paper', size: [0.5, 0.12, 0.4], pos: [x, y, z], mass: 0.4, hp: 1, throwable: true, color: 0xff8fb5, chunks: 6, chunkColors: [0xff8fb5, 0xc98a4b, 0x6b3a1e, 0xffe3a8],
      build(g) { bx(g, 0.5, 0.1, 0.4, 0xff8fb5, 0, 0, 0, { round: 0.02 }); for (let i = 0; i < 6; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.025, 6, 12), mat(i % 2 ? 0x6b3a1e : 0xffe3a8)); t.rotation.x = Math.PI / 2; t.position.set(-0.15 + (i % 3) * 0.15, 0.06, -0.08 + ((i / 3) | 0) * 0.16); g.add(t); } } };
  },
  trashcan(x, z) {
    return { name: 'trash', kind: 'metal', size: [0.46, 0.6, 0.46], pos: [x, 0.3, z], mass: 1.2, hp: 2, throwable: true, color: 0x9aa5b1, chunkColors: [0x9aa5b1, 0xffffff, 0xf2ead0],
      build(g) { cy(g, 0.23, 0.18, 0.6, 0x9aa5b1, 0, 0, 0, steel()); cy(g, 0.21, 0.21, 0.02, 0xf2ead0, 0, 0.28, 0); } };
  },
  cooler(x, z) {
    return { name: 'cooler', kind: 'plastic', size: [0.46, 1.5, 0.46], pos: [x, 0.75, z], mass: 6, hp: 2, throwable: true, color: 0xf2f2f2, chunkColors: [0xf2f2f2, 0x6fc8f0, 0x6fc8f0],
      build(g) { bx(g, 0.46, 1.0, 0.46, 0xf2f2f2, 0, -0.25, 0, { round: 0.04 }); cy(g, 0.19, 0.19, 0.42, 0x6fc8f0, 0, 0.47, 0, { mat: mat(0x6fc8f0, { r: 0.1, op: 0.55 }) }); cy(g, 0.07, 0.19, 0.08, 0x6fc8f0, 0, 0.71, 0, { mat: mat(0x6fc8f0, { r: 0.1, op: 0.55 }) }); bx(g, 0.1, 0.06, 0.06, 0x3d7fd9, -0.08, 0.0, 0.24); bx(g, 0.1, 0.06, 0.06, 0xd94848, 0.08, 0.0, 0.24); } };
  },
  extinguisher(x, z) {
    return { name: 'ext', kind: 'metal', size: [0.26, 0.62, 0.26], pos: [x, 0.31, z], mass: 1.5, hp: 1, throwable: true, color: 0xd92b2b, chunkColors: [0xd92b2b, 0x222222],
      build(g) { cy(g, 0.12, 0.12, 0.5, 0xd92b2b, 0, -0.05, 0, { r: 0.35, m: 0.4 }); cy(g, 0.04, 0.06, 0.1, 0x222222, 0, 0.25, 0); bx(g, 0.16, 0.03, 0.04, 0x222222, 0.05, 0.29, 0); },
      onBreak(p) { emit(p.pos, 50, { color: [0xffffff, 0xeeeeee], speed: [2, 7], size: [0.14, 0.28], life: [0.8, 1.6], grav: -0.5, drag: 2.2, grow: 1.6 }); pop(V(p.pos.x, 1.6, p.pos.z), 'ブシューッ', { size: 44 }); addDopamine(10); } };
  },
  goldPile(x, z) {
    return { name: 'gold', kind: 'gold', size: [0.9, 0.42, 0.6], pos: [x, 0.21, z], mass: 9, hp: 3, value: 2, throwable: true, color: 0xffc531, chunks: 9,
      build(g) { const m = goldMat(); for (let r = 0; r < 3; r++) for (let i = 0; i < 3 - r; i++) bx(g, 0.26, 0.12, 0.56, 0, -0.29 + i * 0.29 + r * 0.145, -0.14 + r * 0.135, 0, { mat: m, round: 0.02 }); },
      onBreak(p) { spawnCoins(p.pos, 8); } };
  },
  moneyBag(x, z) {
    const tex = label([{ t: '¥', s: 90, c: '#2a2a2a' }], { w: 128, h: 128, bg: '#c9b48a' });
    return { name: 'bag', kind: 'paper', size: [0.52, 0.62, 0.52], pos: [x, 0.31, z], mass: 1.5, hp: 1, throwable: true, color: 0xc9b48a, chunks: 10, chunkColors: [0x3fa56a, 0x3fa56a, 0x57c486, 0xc9b48a],
      build(g) { sp(g, 0.27, 0xc9b48a, 0, -0.05, 0, { sy: 1.0 }); cy(g, 0.11, 0.07, 0.14, 0xc9b48a, 0, 0.24, 0); cy(g, 0.085, 0.085, 0.04, 0x7a4a22, 0, 0.19, 0); plane(g, 0.24, 0.24, texMat(tex), 0, -0.04, 0.265); },
      onBreak(p) { emit(p.pos, 26, { color: [0x3fa56a, 0x57c486], speed: [2, 6], size: [0.08, 0.16], life: [0.9, 1.8], grav: 3, drag: 2.5, up: 4 }); } };
  },
  steelCrate(x, z, y = 0.4) {
    return { name: 'steelcrate', kind: 'metal', size: [0.8, 0.8, 0.8], pos: [x, y, z], mass: 6, hp: 4, throwable: true, color: 0x6c7a89, chunkColors: [0x6c7a89, 0x4f5a69],
      build(g) { bx(g, 0.8, 0.8, 0.8, 0x6c7a89, 0, 0, 0, { round: 0.04, r: 0.4, m: 0.7 }); for (const a of [-1, 1]) for (const b of [-1, 1]) sp(g, 0.035, 0xdfe5ea, a * 0.3, b * 0.3, 0.4, steel()); bx(g, 0.82, 0.1, 0.82, 0x4f5a69, 0, 0, 0, steel()); } };
  },
  tnt(x, y, z) {
    const tex = label([{ t: 'TNT', s: 60, c: '#fff' }], { w: 128, h: 128, bg: '#d92b2b', border: '#8a1414', bw: 10 });
    return { name: 'tnt', kind: 'tnt', size: [0.56, 0.56, 0.56], pos: [x, y, z], mass: 2, hp: 1, value: 0, noCount: true, throwable: true, color: 0xd92b2b, quiet: true, dopa: 0,
      chunkColors: [0xd92b2b, 0x8a1414],
      build(g, p) {
        bx(g, 0.56, 0.56, 0.56, 0xd92b2b, 0, 0, 0, { round: 0.03 });
        const m = texMat(tex);
        for (let i = 0; i < 4; i++) plane(g, 0.5, 0.5, m, Math.sin(i * Math.PI / 2) * 0.285, 0, Math.cos(i * Math.PI / 2) * 0.285, { ry: i * Math.PI / 2 });
        cy(g, 0.015, 0.015, 0.2, 0x333333, 0.1, 0.36, 0.05, { rz: -0.3 });
        p.spark = sp(g, 0.045, 0xffd23a, 0.13, 0.46, 0.05, { e: 0xffb41f, ei: 4, noShadow: true });
      },
      update(p) { if (p.spark) p.spark.scale.setScalar(0.7 + Math.random() * 0.8); },
      onBreak(p) { const c = p.pos.clone(); after(0.02, () => explode(c)); } };
  },
  glassCase(x, z, onOpen) {
    return { name: 'case', kind: 'glass', size: [1.6, 1.5, 1.0], pos: [x, 0.75, z], mass: 0, hp: 1, value: 2, color: 0xbfefff, chunks: 18,
      immune: { punch: true, throw: true, impact: true },
      build(g) {
        bx(g, 1.6, 0.16, 1.0, 0x2a313c, 0, -0.67, 0, steel());
        bx(g, 1.52, 1.3, 0.92, 0, 0, 0.06, 0, { mat: glassMat() });
        for (const a of [-1, 1]) for (const b of [-1, 1]) bx(g, 0.05, 1.34, 0.05, 0xdfe5ea, a * 0.77, 0.06, b * 0.47, steel());
        for (const a of [-0.38, 0.38]) bx(g, 0.56, 0.56, 0.56, 0xd92b2b, a, -0.31, 0, { round: 0.03 });
        plane(g, 0.9, 0.3, texMat(label([{ t: '危険物', s: 50, c: '#111' }], { w: 256, h: 96, bg: '#f5c518', hazard: true })), 0, 0.42, 0.47);
      },
      onPunch(p, kid) { sfx.bounce(); pop(V(p.pos.x, 1.5, p.pos.z + 0.6), 'ボヨン', { size: 38 }); say(pick(['強化ガラス…', '割れん！！声か？'])); kid.recoil = 1; return true; },
      onBreak(p) { const c = p.pos.clone(); after(0.02, () => { for (const a of [-0.38, 0.38]) addProp(P.tnt(c.x + a, 0.45, c.z)); if (onOpen) onOpen(); }); } };
  },
  ball(x, z, color = 0xf07a1f, y) {
    const r = 0.25;
    return { name: 'ball', kind: 'rubber', size: [r * 2, r * 2, r * 2], pos: [x, y ?? r, z], mass: 0.7, hp: 4, throwable: true, color, chunkColors: [color, 0x222222],
      build(g) {
        sp(g, r, color, 0, 0, 0, { r: 0.6 });
        for (const rot of [[0, 0], [Math.PI / 2, 0], [0, Math.PI / 2]]) { const t = new THREE.Mesh(new THREE.TorusGeometry(r + 0.003, 0.008, 4, 28), mat(0x222222)); t.rotation.set(rot[0], rot[1], 0); g.add(t); }
      } };
  },
  tobibako(x, z, rotY = 0) {
    return { name: 'tobibako', kind: 'wood', size: [1.3, 1.0, 0.75], pos: [x, 0.5, z], rotY, mass: 16, hp: 4, value: 2, color: 0xe8d8b8, chunkColors: [0xe8d8b8, 0xc9a877, 0x8a2a2a],
      build(g) {
        for (let i = 0; i < 4; i++) { const k = 1 - i * 0.09; bx(g, 1.3 * k, 0.2, 0.75 * k, i % 2 ? 0xc9a877 : 0xe8d8b8, 0, -0.4 + i * 0.21, 0, { round: 0.02 }); }
        bx(g, 0.95, 0.14, 0.5, 0x8a2a2a, 0, 0.43, 0, { round: 0.06 });
      } };
  },
  books(x, y, z) {
    const bc = [0xd94848, 0x3d7fd9, 0x2fa56a, 0xf0b93a, 0x8d4fd1];
    return { name: 'books', kind: 'paper', size: [0.42, 0.3, 0.32], pos: [x, y, z], rotY: rnd(-0.4, 0.4), mass: 0.8, hp: 1, throwable: true, color: bc[0], chunks: 6, chunkColors: [...bc, 0xfffdf2],
      build(g) { for (let i = 0; i < 3; i++) bx(g, 0.4 - i * 0.03, 0.09, 0.3 - i * 0.02, bc[(i * 2 + ((x * 7) | 0) + 5) % 5], rnd(-0.02, 0.02), -0.1 + i * 0.1, 0, { ry: rnd(-0.2, 0.2) }); } };
  },
  globe(x, y, z) {
    return { name: 'globe', kind: 'plastic', size: [0.4, 0.56, 0.4], pos: [x, y, z], mass: 0.9, hp: 1, throwable: true, color: 0x3d7fd9, chunkColors: [0x3d7fd9, 0x2fa56a, 0x8a5a33],
      build(g) {
        sp(g, 0.19, 0x3d7fd9, 0, 0.06, 0, { r: 0.4 });
        for (let i = 0; i < 5; i++) sp(g, 0.07, 0x2fa56a, Math.cos(i * 1.9) * 0.15, 0.06 + Math.sin(i * 2.7) * 0.11, Math.sin(i * 1.9) * 0.15, { sy: 0.6, seg: 8, seg2: 6 });
        cy(g, 0.02, 0.02, 0.14, 0x8a5a33, 0, -0.17, 0); cy(g, 0.13, 0.15, 0.04, 0x8a5a33, 0, -0.26, 0);
      } };
  },
  blackboard(x, lines) {
    const tex = ctex(512, 220, (c, w, h) => {
      c.fillStyle = '#24513f'; c.fillRect(0, 0, w, h);
      c.fillStyle = 'rgba(255,255,255,.9)'; c.font = `700 30px ${JP}`; c.textBaseline = 'top';
      lines.forEach((l, i) => c.fillText(l, 22, 18 + i * 46, w - 44));
    });
    return { name: 'blackboard', kind: 'wood', size: [3.0, 1.3, 0.1], pos: [x, 1.95, WZ + 0.07], mass: 0, hp: 3, value: 2, color: 0x24513f, chunks: 12, chunkColors: [0x24513f, 0x24513f, 0xb88a3a],
      build(g) { bx(g, 3.0, 1.3, 0.07, 0xb88a3a, 0, 0, 0, { round: 0.02 }); plane(g, 2.86, 1.16, texMat(tex), 0, 0, 0.04); bx(g, 2.6, 0.05, 0.1, 0xb88a3a, 0, -0.66, 0.06); } };
  },
  piano(x, z, rotY = 0) {
    return { name: 'piano', kind: 'wood', size: [1.6, 1.3, 0.7], pos: [x, 0.65, z], rotY, mass: 30, hp: 6, value: 3, color: 0x1c1c22, chunks: 14, chunkColors: [0x1c1c22, 0x1c1c22, 0xf4f1e8, 0x333340], dopa: 26,
      build(g) {
        bx(g, 1.6, 1.3, 0.45, 0x1c1c22, 0, 0, -0.12, { round: 0.03, r: 0.25 });
        bx(g, 1.6, 0.1, 0.3, 0x1c1c22, 0, -0.05, 0.2, { r: 0.25 });
        bx(g, 1.4, 0.03, 0.22, 0xf4f1e8, 0, 0.01, 0.22);
        for (let i = 0; i < 10; i++) bx(g, 0.05, 0.035, 0.13, 0x111111, -0.6 + i * 0.133, 0.03, 0.17);
        for (const a of [-1, 1]) bx(g, 0.08, 0.6, 0.3, 0x1c1c22, a * 0.74, -0.38, 0.2);
        bx(g, 0.5, 0.3, 0.02, 0xfffdf2, 0, 0.42, 0.115);
      },
      onBreak(p) { sfx.piano(); pop(V(p.pos.x, 2.2, p.pos.z), 'ジャーン！！', { size: 50 }); } };
  },
  drum(x, z, color = 0xd92b2b) {
    return { name: 'drum', kind: 'plastic', size: [0.62, 0.5, 0.62], pos: [x, 0.25, z], mass: 1.5, hp: 2, throwable: true, color, chunkColors: [color, 0xf4f1e8, 0xdfe5ea],
      build(g) { cy(g, 0.3, 0.3, 0.44, color, 0, 0, 0, { r: 0.35 }); for (const a of [-1, 1]) cy(g, 0.31, 0.31, 0.04, 0xdfe5ea, 0, a * 0.22, 0, steel()); cy(g, 0.28, 0.28, 0.02, 0xf4f1e8, 0, 0.245, 0); } };
  },
  skeleton(x, z) {
    const W = 0xf2efe4;
    return { name: 'skeleton', kind: 'stone', size: [0.5, 1.7, 0.4], pos: [x, 0.85, z], mass: 2, hp: 1, throwable: true, color: W, chunks: 12, chunkColors: [W],
      build(g) {
        cy(g, 0.2, 0.22, 0.05, 0x333333, 0, -0.82, 0); cy(g, 0.015, 0.015, 1.6, 0x666666, 0, -0.02, -0.1, steel());
        sp(g, 0.14, W, 0, 0.66, 0, { sy: 1.1 }); bx(g, 0.1, 0.06, 0.1, W, 0, 0.53, 0.03);
        for (const a of [-1, 1]) sp(g, 0.03, 0x222222, a * 0.05, 0.68, 0.12);
        bx(g, 0.05, 0.55, 0.05, W, 0, 0.2, 0);
        for (let i = 0; i < 4; i++) bx(g, 0.34 - i * 0.03, 0.035, 0.16, W, 0, 0.4 - i * 0.09, 0.02, { round: 0.015 });
        bx(g, 0.26, 0.1, 0.12, W, 0, -0.1, 0, { round: 0.04 });
        for (const a of [-1, 1]) { bx(g, 0.04, 0.5, 0.04, W, a * 0.22, 0.18, 0, { rz: a * 0.12 }); bx(g, 0.05, 0.62, 0.05, W, a * 0.09, -0.46, 0); }
      },
      onBreak(p) { pop(V(p.pos.x, 1.9, p.pos.z), 'カラカラッ', { size: 34 }); } };
  },
  steelDoor() {
    return { name: 'steeldoor', kind: 'metal', size: [DW, DH, 0.2], pos: [0, DH / 2, WZ + 0.12], mass: 0, hp: 10, value: 4, color: 0x8b97a6, chunks: 16, dopa: 36,
      chunkColors: [0x8b97a6, 0x6c7786, 0xf5c518], immune: { punch: true, throw: true, scream: true, impact: true }, blastR: 2.7,
      onBlastFar() { after(0.9, () => say('扉まで届いてない。もっと扉の近くで爆破', 2.6)); },
      build(g) {
        bx(g, DW, DH, 0.18, 0x8b97a6, 0, 0, 0, { round: 0.02, ...steel() });
        for (const yy of [0.75, -0.75]) bx(g, DW - 0.3, 0.9, 0.04, 0x9fabb9, 0, yy, 0.09, { round: 0.02, ...steel() });
        plane(g, DW - 0.2, 0.3, texMat(label([{ t: '防火扉', s: 50, c: '#111' }], { w: 320, h: 72, bg: '#f5c518', hazard: true })), 0, 0, 0.115);
        bx(g, 0.5, 0.07, 0.1, 0x2a313c, 0.4, -0.3, 0.13, steel());
      },
      onPunch(p, kid) { sfx.clang(); shake(0.2); pop(V(p.pos.x, 1.4, p.pos.z + 0.4), 'ゴーン', { size: 40 }); say(pick(['鉄じゃん', '手ぇ痛っ！！', '爆破しかない'])); kid.recoil = 1; return true; } };
  },
  schoolDesk(x, z, rotY = 0) {
    return { name: 'sdesk', kind: 'wood', size: [0.7, 0.75, 0.5], pos: [x, 0.375, z], rotY, mass: 3, hp: 2, throwable: true, color: 0xd9a066, chunkColors: [0xd9a066, 0x9aa5b1],
      build(g) { bx(g, 0.7, 0.06, 0.5, 0xd9a066, 0, 0.34, 0, { round: 0.02 }); for (const a of [-1, 1]) for (const b of [-1, 1]) cy(g, 0.02, 0.02, 0.7, 0x9aa5b1, a * 0.3, -0.03, b * 0.2, steel()); bx(g, 0.62, 0.12, 0.42, 0x9aa5b1, 0, 0.22, 0, steel()); } };
  },
  sofa(x, z, rotY = 0, color = 0x7a2a2a) {
    return { name: 'sofa', kind: 'wood', size: [1.8, 0.8, 0.8], pos: [x, 0.4, z], rotY, mass: 12, hp: 4, value: 2, color, chunkColors: [color, color, 0xfffdf2, 0x3a2a22],
      build(g) {
        bx(g, 1.8, 0.36, 0.8, color, 0, -0.16, 0, { round: 0.1 });
        bx(g, 1.8, 0.5, 0.22, color, 0, 0.15, -0.29, { round: 0.1 });
        for (const a of [-1, 1]) { bx(g, 0.2, 0.34, 0.8, color, a * 0.8, 0.1, 0, { round: 0.09 }); bx(g, 0.72, 0.1, 0.5, 0x8f3a3a, a * 0.37, 0.05, 0.08, { round: 0.05 }); }
      } };
  },
  // Fragile alarm beside the exit. Glass, so a scream, a stray punch or a nearby blast all set it off.
  alarm(x, onTrip) {
    return { name: 'alarm', kind: 'glass', size: [0.5, 0.6, 0.16], pos: [x, 1.5, WZ + 0.09], mass: 0, hp: 1, value: 0, noCount: true, color: 0xbfefff, chunks: 8, quiet: true, dopa: 0,
      build(g, p) {
        bx(g, 0.5, 0.6, 0.08, 0xd92b2b, 0, 0, -0.03, { round: 0.03 });
        p.lampM = sp(g, 0.09, 0xff5a3a, 0, 0.12, 0.03, { e: 0xff2a1a, ei: 2.2, noShadow: true });
        plane(g, 0.42, 0.2, texMat(label([{ t: '警報器', s: 40, c: '#fff' }], { w: 192, h: 80, bg: '#8a1414' })), 0, -0.15, 0.012);
        bx(g, 0.46, 0.56, 0.05, 0, 0, 0, 0.055, { mat: glassMat() });
      },
      update(p) { if (p.lampM) p.lampM.scale.setScalar(0.85 + Math.abs(Math.sin(S.kid.t * 3)) * 0.3); },
      onBreak(p) { if (onTrip) onTrip(p); } };
  },
  // Steel plate that slides across a button and back. Throw while it is out of the way.
  shield(x, y, open, closed, phase) {
    const all = { punch: true, throw: true, scream: true, blast: true, impact: true };
    return { name: 'shield', kind: 'metal', size: [1.0, 1.0, 0.1], pos: [x, y, WZ + 0.46], mass: 0, hp: 999, value: 0, noCount: true, noPick: true, immune: all, color: 0x8b97a6,
      build(g) {
        bx(g, 1.0, 1.0, 0.08, 0x8b97a6, 0, 0, 0, { round: 0.02, ...steel() });
        plane(g, 0.9, 0.24, texMat(label([''], { w: 256, h: 64, bg: '#f5c518', hazard: true })), 0, 0, 0.045);
        for (const a of [-1, 1]) for (const b of [-1, 1]) sp(g, 0.04, 0xdfe5ea, a * 0.4, b * 0.4, 0.04, steel());
      },
      onImpact(p, other, v) { if (v > 2.5 && other) { sfx.clang(); pop(V(p.pos.x, p.pos.y, p.pos.z + 0.3), 'カーン', { size: 32 }); } return true; },
      update(p, dt) {
        p.t = (p.t ?? phase) + dt;
        const u = p.t % (open + closed), target = u < closed ? 0 : 1;
        p.k = (p.k ?? 0) + (target - (p.k ?? 0)) * Math.min(1, dt * 12);
        p.body.position.x = x + p.k * 1.08 * (x < 0 ? 1 : -1);
      } };
  },
  dial(x, y, n) {
    const tex = ctex(128, 128, (c, w) => { c.fillStyle = '#d7dde4'; c.beginPath(); c.arc(64, 64, 62, 0, 7); c.fill(); c.strokeStyle = '#222'; c.lineWidth = 3; for (let i = 0; i < 20; i++) { const a = i / 20 * 6.28; c.beginPath(); c.moveTo(64 + Math.cos(a) * 50, 64 + Math.sin(a) * 50); c.lineTo(64 + Math.cos(a) * 60, 64 + Math.sin(a) * 60); c.stroke(); } c.fillStyle = '#c22'; c.font = '900 44px sans-serif'; c.textAlign = 'center'; c.fillText(String(n), 64, 80); });
    return { name: 'dial', kind: 'metal', size: [0.5, 0.5, 0.12], pos: [x, y, WZ + 0.07], mass: 0, hp: 2, color: 0xd7dde4, chunks: 5, chunkColors: [0xd7dde4, 0x4f5a69],
      build(g) { cy(g, 0.25, 0.25, 0.08, 0x4f5a69, 0, 0, 0, { rx: Math.PI / 2, ...steel() }); const m = new THREE.Mesh(new THREE.CircleGeometry(0.22, 24), texMat(tex)); m.position.z = 0.045; g.add(m); cy(g, 0.03, 0.03, 0.16, 0x222831, 0, 0, 0.05, { rx: Math.PI / 2 }); } };
  },
};
