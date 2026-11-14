// Particles, shock rings, manga onomatopoeia, speech bubble, screen flash
import { THREE, S, rnd, pick, V } from './ctx.js';

const MAXP = 700;
let pm, pi = 0, layer, bubbleEl, flashEl;
const pd = [], rings = [];
const dummy = new THREE.Object3D(), col = new THREE.Color(), tmp = new THREE.Vector3();

export function initFx() {
  layer = document.getElementById('fx-layer');
  bubbleEl = document.getElementById('bubble');
  flashEl = document.getElementById('flash');
  pm = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ toneMapped: false }), MAXP);
  pm.frustumCulled = false;
  pm.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  dummy.scale.setScalar(0); dummy.updateMatrix();
  for (let i = 0; i < MAXP; i++) {
    pd.push({ life: 0, max: 1, p: V(), v: V(), size: 0.1, grav: 0, drag: 0, grow: 0, rot: V(), spin: V() });
    pm.setMatrixAt(i, dummy.matrix); pm.setColorAt(i, col.setRGB(1, 1, 1));
  }
  S.scene.add(pm);
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.84, 1, 56),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, toneMapped: false, blending: THREE.AdditiveBlending }));
    m.visible = false; S.scene.add(m);
    rings.push({ m, t: 0, dur: 1, r0: 0.2, r1: 1 });
  }
}

export function emit(pos, n, o = {}) {
  const sp = o.speed || [1, 4], sz = o.size || [0.05, 0.12], lf = o.life || [0.3, 0.7];
  const cols = Array.isArray(o.color) ? o.color : [o.color ?? 0xffffff];
  const hdr = o.hdr || 1, spread = o.spread || 0.1;
  if (S.reduced) n = Math.ceil(n / 2);
  for (let k = 0; k < n; k++) {
    const p = pd[pi]; const idx = pi; pi = (pi + 1) % MAXP;
    p.p.set(pos.x + rnd(-spread, spread), pos.y + rnd(-spread, spread), pos.z + rnd(-spread, spread));
    const th = rnd(0, Math.PI * 2), ph = Math.acos(rnd(-1, 1)), s = rnd(sp[0], sp[1]);
    p.v.set(Math.sin(ph) * Math.cos(th) * s, Math.cos(ph) * s + (o.up || 0), Math.sin(ph) * Math.sin(th) * s);
    if (o.dir) p.v.addScaledVector(o.dir, s * 0.8);
    p.size = rnd(sz[0], sz[1]); p.life = p.max = rnd(lf[0], lf[1]);
    p.grav = o.grav ?? 14; p.drag = o.drag ?? 1.5; p.grow = o.grow || 0;
    p.rot.set(rnd(0, 6), rnd(0, 6), rnd(0, 6)); p.spin.set(rnd(-8, 8), rnd(-8, 8), rnd(-8, 8));
    col.set(pick(cols)); col.multiplyScalar(hdr);
    pm.setColorAt(idx, col);
  }
  pm.instanceColor.needsUpdate = true;
}

export function ring(pos, r1, o = {}) {
  const r = rings.find((q) => !q.m.visible) || rings[0];
  r.m.visible = true; r.t = 0; r.dur = o.dur || 0.45; r.r0 = o.r0 || 0.2; r.r1 = r1;
  r.m.position.copy(pos);
  r.m.material.color.set(o.color || 0xffffff);
  r.a = o.a || 0.9;
  if (o.face) r.m.quaternion.copy(S.camera.quaternion); else r.m.rotation.set(-Math.PI / 2, 0, 0);
}

export function toScreen(v) {
  tmp.copy(v).project(S.camera);
  return { x: (tmp.x * 0.5 + 0.5) * S.vw, y: (-tmp.y * 0.5 + 0.5) * S.vh, z: tmp.z };
}

export function pop(pos, text, o = {}) {
  if (!layer) return;
  while (layer.childElementCount > 16) layer.firstChild.remove();
  const s = toScreen(pos);
  const el = document.createElement('div');
  el.className = 'pop ' + (o.cls || '');
  el.textContent = text;
  el.style.left = Math.max(40, Math.min(S.vw - 40, s.x)) + 'px';
  el.style.top = Math.max(60, s.y) + 'px';
  el.style.setProperty('--rot', rnd(-14, 14).toFixed(1) + 'deg');
  const scale = Math.min(1, S.vw / 520 + 0.35);
  el.style.fontSize = Math.round((o.size || 34) * scale) + 'px';
  layer.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}

export function say(text, dur = 1.6) {
  if (!bubbleEl) return;
  bubbleEl.textContent = text;
  bubbleEl.classList.remove('show'); void bubbleEl.offsetWidth; bubbleEl.classList.add('show');
  S.bubbleT = dur;
}

export function flash(color = '#fff', a = 0.6, dur = 0.25) {
  if (!flashEl) return;
  if (S.reduced) a *= 0.3;
  flashEl.style.transition = 'none';
  flashEl.style.background = color; flashEl.style.opacity = a;
  void flashEl.offsetWidth;
  flashEl.style.transition = `opacity ${dur}s ease-out`;
  flashEl.style.opacity = 0;
}

export function updateFx(dt) {
  for (let i = 0; i < MAXP; i++) {
    const p = pd[i];
    if (p.life <= 0) continue;
    p.life -= dt;
    if (p.life <= 0) { dummy.scale.setScalar(0); dummy.position.set(0, -50, 0); dummy.updateMatrix(); pm.setMatrixAt(i, dummy.matrix); continue; }
    p.v.y -= p.grav * dt;
    p.v.multiplyScalar(Math.max(0, 1 - p.drag * dt));
    p.p.addScaledVector(p.v, dt);
    if (p.p.y < 0.03 && p.grav > 0) { p.p.y = 0.03; p.v.y *= -0.35; p.v.x *= 0.6; p.v.z *= 0.6; }
    const k = p.life / p.max;
    const s = p.grow ? p.size * (1 + (1 - k) * p.grow) * Math.min(1, k * 3) : p.size * Math.sqrt(k);
    dummy.position.copy(p.p);
    dummy.rotation.set(p.rot.x + p.spin.x * (1 - k), p.rot.y + p.spin.y * (1 - k), p.rot.z);
    dummy.scale.setScalar(s); dummy.updateMatrix();
    pm.setMatrixAt(i, dummy.matrix);
  }
  pm.instanceMatrix.needsUpdate = true;
  for (const r of rings) {
    if (!r.m.visible) continue;
    r.t += dt;
    const k = r.t / r.dur;
    if (k >= 1) { r.m.visible = false; continue; }
    const e = 1 - Math.pow(1 - k, 3);
    r.m.scale.setScalar(r.r0 + (r.r1 - r.r0) * e);
    r.m.material.opacity = r.a * (1 - k);
  }
}
