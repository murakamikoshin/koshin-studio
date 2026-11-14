// Shared state, constants and small helpers
import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
export { THREE, CANNON };

export const RW = 7.5, RD = 7.5, RH = 4.2;      // room width / depth / height
export const DW = 1.7, DH = 2.7;                 // door hole
export const WZ = -RD / 2;                       // back wall z

export const S = {
  scene: null, camera: null, renderer: null, world: null, roomGroup: null,
  props: [], debris: [], timers: [], deferred: [],
  kid: null, room: null, trauma: 0,
  reduced: typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches,
  game: {
    mode: 'title', roomIndex: 0, time: 0, roomTime: 0,
    dopamine: 100, pauseDrain: 0,
    combo: 0, comboT: 0, maxCombo: 0,
    broken: 0, total: 0, hints: 0, hintsTotal: 0, phones: 0, caught: 0,
    exitOpen: false, hitStop: 0, slowT: 0,
    noise: 0, noiseOn: false, moves: 0,
  },
};

export const rnd = (a, b) => a + Math.random() * (b - a);
export const pick = (a) => a[(Math.random() * a.length) | 0];
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

// ---------- materials & primitive helpers ----------
const matCache = new Map();
export function mat(color, o = {}) {
  const key = [color, o.r, o.m, o.e, o.ei, o.op, o.flat].join('|');
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({
      color, roughness: o.r ?? 0.78, metalness: o.m ?? 0,
      emissive: o.e ?? 0x000000, emissiveIntensity: o.ei ?? 1,
      transparent: o.op !== undefined, opacity: o.op ?? 1, flatShading: !!o.flat,
    });
    if (o.op !== undefined) m.depthWrite = false;
    matCache.set(key, m);
  }
  return m;
}
export const glassMat = () => mat(0xbfefff, { r: 0.05, m: 0.1, op: 0.32 });
export const goldMat = () => mat(0xffc531, { r: 0.25, m: 0.95 });

function place(m, x, y, z, o) {
  m.position.set(x, y, z);
  if (o.rx) m.rotation.x = o.rx;
  if (o.ry) m.rotation.y = o.ry;
  if (o.rz) m.rotation.z = o.rz;
  if (o.noShadow) m.userData.noShadow = true;
  return m;
}
export function bx(g, w, h, d, color, x = 0, y = 0, z = 0, o = {}) {
  let geo;
  if (o.round) {
    const r = Math.min(o.round, w * 0.45, h * 0.45, d * 0.45);
    geo = new RoundedBoxGeometry(w, h, d, 2, r);
  } else geo = new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(geo, o.mat || mat(color, o));
  g.add(place(m, x, y, z, o));
  return m;
}
export function cy(g, rt, rb, h, color, x = 0, y = 0, z = 0, o = {}) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, o.seg || 20), o.mat || mat(color, o));
  g.add(place(m, x, y, z, o));
  return m;
}
export function sp(g, r, color, x = 0, y = 0, z = 0, o = {}) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, o.seg || 20, o.seg2 || 14), o.mat || mat(color, o));
  if (o.sx || o.sy || o.sz) m.scale.set(o.sx || 1, o.sy || 1, o.sz || 1);
  g.add(place(m, x, y, z, o));
  return m;
}
export function plane(g, w, h, material, x = 0, y = 0, z = 0, o = {}) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), material);
  g.add(place(m, x, y, z, o));
  return m;
}

// ---------- game-rule state changes ----------
export function addDopamine(n) {
  const g = S.game;
  const mult = 1 + Math.min(g.combo, 30) * 0.02;
  g.dopamine = clamp(g.dopamine + n * mult, 0, 100);
}
export function addCombo() {
  const g = S.game;
  g.combo++; g.comboT = 1.6;
  if (g.combo > g.maxCombo) g.maxCombo = g.combo;
}
export function addNoise(n) {
  const g = S.game;
  if (!g.noiseOn) return;
  g.noise = clamp(g.noise + n * (g.noiseMul || 1), 0, 100);
}
export function after(sec, fn) { S.timers.push({ t: sec, fn }); }
export function hitStop(sec) { if (!S.reduced) S.game.hitStop = Math.max(S.game.hitStop, sec); }
export function shake(a) { S.trauma = Math.min(1, S.trauma + (S.reduced ? a * 0.25 : a)); }
