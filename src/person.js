// Character models built from primitives: the kid and the security guard
import { THREE, bx, cy, sp, plane } from './ctx.js';

const own = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: o.r ?? 0.8, metalness: o.m ?? 0, emissive: o.e ?? 0x000000, emissiveIntensity: o.ei ?? 1 });
const mk = (parent, x, y, z) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); return g; };

export function buildKid() {
  const M = {
    hood: own(0xffd21f), hood2: own(0xf0a800), skin: own(0xffcfa3, { r: 0.7 }), hair: own(0x2b1b3d), shorts: own(0x26324f),
    shoe: own(0xffffff), sole: own(0xff2e7e), white: own(0xffffff, { r: 0.3 }), black: own(0x14092b), bag: own(0x7a4fa8),
    mouth: own(0x5a1a2a), eyebag: own(0xb07ab0), screen: own(0x9fdcff, { e: 0x6fd0ff, ei: 2.6 }),
  };
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const legL = mk(body, -0.14, 0.44, 0), legR = mk(body, 0.14, 0.44, 0);
  for (const l of [legL, legR]) {
    bx(l, 0.18, 0.36, 0.2, 0, 0, -0.16, 0, { mat: M.shorts, round: 0.05 });
    bx(l, 0.2, 0.11, 0.33, 0, 0, -0.365, 0.05, { mat: M.shoe, round: 0.04 });
    bx(l, 0.2, 0.035, 0.33, 0, 0, -0.425, 0.05, { mat: M.sole });
  }
  const torso = mk(body, 0, 0.42, 0);
  bx(torso, 0.54, 0.52, 0.38, 0, 0, 0.27, 0, { mat: M.hood, round: 0.13 });
  bx(torso, 0.32, 0.13, 0.04, 0, 0, 0.13, 0.185, { mat: M.hood2, round: 0.02 });
  sp(torso, 0.2, 0, 0, 0.5, -0.2, { mat: M.hood, sx: 1.25, sy: 0.85 });
  bx(torso, 0.36, 0.38, 0.14, 0, 0, 0.26, -0.25, { mat: M.bag, round: 0.06 });
  const armL = mk(torso, -0.33, 0.44, 0), armR = mk(torso, 0.33, 0.44, 0);
  for (const a of [armL, armR]) {
    bx(a, 0.15, 0.36, 0.17, 0, 0, -0.15, 0, { mat: M.hood, round: 0.065 });
    sp(a, 0.1, 0, 0, -0.37, 0, { mat: M.skin });
  }
  const head = mk(torso, 0, 0.56, 0);
  sp(head, 0.36, 0, 0, 0.3, 0, { mat: M.skin, seg: 24, seg2: 18 });
  sp(head, 0.37, 0, 0, 0.42, -0.08, { mat: M.hair, sy: 0.8, seg: 20 });
  for (let i = 0; i < 6; i++) {
    const a = -0.9 + i * 0.36;
    const c = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.3, 6), M.hair);
    c.position.set(Math.sin(a) * 0.27, 0.66 + Math.cos(a) * 0.07, 0.1);
    c.rotation.set(0.55, 0, -a * 0.9);
    head.add(c);
  }
  for (const s of [-1, 1]) {
    sp(head, 0.1, 0, s * 0.135, 0.3, 0.29, { mat: M.white, sz: 0.55 });
    sp(head, 0.036, 0, s * 0.135, 0.3, 0.345, { mat: M.black });
    bx(head, 0.14, 0.022, 0.02, 0, s * 0.135, 0.195, 0.325, { mat: M.eyebag });
    bx(head, 0.16, 0.04, 0.03, 0, s * 0.135, 0.435, 0.315, { mat: M.hair, rz: s * 0.35 });
  }
  const mouth = bx(head, 0.13, 0.035, 0.03, 0, 0, 0.13, 0.335, { mat: M.mouth });
  const phone = mk(armR, 0, -0.44, 0.08);
  bx(phone, 0.14, 0.24, 0.025, 0, 0, 0, 0, { mat: M.black });
  plane(phone, 0.12, 0.21, M.screen, 0, 0, 0.014);
  phone.rotation.x = -0.9; phone.visible = false;
  root.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = false; } });
  return { root, body, torso, head, armL, armR, legL, legR, mouth, phone, M };
}

// Seated guard. Built into a prop group whose centre is 0.85 above the floor.
export function buildGuard(g, look = {}) {
  const NAVY = look.uniform ?? 0x27407a, SKIN = look.skin ?? 0xf2bf94, DARK = look.dark ?? 0x1c2233, cap = look.cap !== false;
  const fig = mk(g, 0, -0.85, 0);
  // chair
  bx(fig, 0.66, 0.08, 0.62, 0x3a4152, 0, 0.5, 0, { round: 0.03 });
  for (const a of [-1, 1]) for (const b of [-1, 1]) bx(fig, 0.06, 0.5, 0.06, 0x2a2f3c, a * 0.27, 0.25, b * 0.25);
  bx(fig, 0.66, 0.7, 0.07, 0x3a4152, 0, 0.9, -0.3, { round: 0.03 });
  const man = mk(fig, 0, 0, 0);
  for (const s of [-1, 1]) {
    bx(man, 0.21, 0.19, 0.52, NAVY, s * 0.15, 0.64, 0.2, { round: 0.06 });
    bx(man, 0.19, 0.5, 0.19, NAVY, s * 0.15, 0.33, 0.42, { round: 0.05 });
    bx(man, 0.2, 0.1, 0.34, DARK, s * 0.15, 0.05, 0.48, { round: 0.04 });
    bx(man, 0.17, 0.5, 0.19, NAVY, s * 0.41, 0.98, 0.05, { round: 0.07 });
    sp(man, 0.085, SKIN, s * 0.41, 0.7, 0.07);
  }
  bx(man, 0.64, 0.72, 0.42, NAVY, 0, 1.02, 0, { round: 0.13 });
  bx(man, 0.66, 0.07, 0.44, DARK, 0, 0.72, 0);
  if (cap) bx(man, 0.1, 0.11, 0.03, 0xffd66b, -0.17, 1.2, 0.215, { m: 0.9, r: 0.3 });
  bx(man, 0.07, 0.3, 0.02, DARK, 0, 1.15, 0.215);
  const head = mk(man, 0, 1.4, 0);
  sp(head, 0.3, SKIN, 0, 0.26, 0, { seg: 22, seg2: 16 });
  if (cap) {
    cy(head, 0.31, 0.32, 0.15, NAVY, 0, 0.5, 0);
    bx(head, 0.42, 0.03, 0.26, DARK, 0, 0.43, 0.24, { round: 0.01 });
    bx(head, 0.1, 0.08, 0.03, 0xffd66b, 0, 0.5, 0.315, { m: 0.9, r: 0.3 });
  } else if (look.bald) {
    for (const s of [-1, 1]) sp(head, 0.1, look.hair ?? 0xdddddd, s * 0.27, 0.26, -0.05);
  } else {
    sp(head, 0.31, look.hair ?? 0x3a2a22, 0, 0.36, -0.06, { sy: 0.82 });
    if (look.bun) sp(head, 0.12, look.hair ?? 0x3a2a22, 0, 0.56, -0.16);
  }
  if (look.glasses) for (const s of [-1, 1]) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.012, 6, 14), new THREE.MeshStandardMaterial({ color: 0x222222 })); t.position.set(s * 0.12, 0.3, 0.29); head.add(t); }
  sp(head, 0.055, 0xe8a983, 0, 0.24, 0.3);
  if (look.mustache !== false) bx(head, 0.26, 0.06, 0.05, look.hair ?? 0x3a2a22, 0, 0.16, 0.29, { round: 0.02 });
  const eyes = [];
  for (const s of [-1, 1]) eyes.push(bx(head, 0.1, 0.02, 0.02, DARK, s * 0.12, 0.3, 0.285));
  head.rotation.x = 0.45; head.rotation.z = 0.15;
  return { fig, man, head, eyes };
}
