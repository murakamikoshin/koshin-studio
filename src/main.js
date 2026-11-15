// Boot, render loop, input, game flow and HUD
import { THREE, CANNON, S, rnd, pick, clamp, V, RW, RD, RH, DH, WZ, after } from './ctx.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { initFx, updateFx, toScreen, say, flash, pop, emit } from './fx.js';
import { initAudio, sfx, setMuted, isMuted, musicTick } from './audio.js';
import { backdropTex } from './tex.js';
import { updateProps } from './props.js';
import { Kid, screamReach, blowReach, SPEAKER_R } from './kid.js';
import { ROOMS, buildShell, FONT_SAMPLE, LAST_STAGE } from './rooms.js';

const $ = (id) => document.getElementById(id);
const g = S.game;
let renderer, scene, camera, composer, bloom, hemi, sun;
let quality = 3, slowFrames = 0, lastT = 0, resumeRoom = 0;
const camBase = V(), camTarget = V(), camDir = V();
let camDist = 14, zoomK = 0, lightK = 1, reach = null, reach2 = [], tipI = 0;
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
const coarse = matchMedia('(pointer: coarse)').matches;

// ------------------------------------------------------------------ setup
function init() {
  const canvas = $('c');
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance' });
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  S.renderer = renderer;
  scene = S.scene = new THREE.Scene();
  scene.background = backdropTex();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.32;
  camera = S.camera = new THREE.PerspectiveCamera(45, 1, 0.5, 120);
  hemi = new THREE.HemisphereLight(0xfff6ea, 0x554466, 0.8); scene.add(hemi);
  sun = new THREE.DirectionalLight(0xfff0d8, 1.75);
  sun.position.set(-5, 10.5, 7.5); sun.target.position.set(0, 0, -0.6);
  sun.castShadow = true;
  const sm = coarse ? 1024 : 2048; sun.shadow.mapSize.set(sm, sm);
  const sc = sun.shadow.camera; sc.left = -7.5; sc.right = 7.5; sc.top = 7.5; sc.bottom = -7.5; sc.near = 1; sc.far = 32;
  sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.035; sun.shadow.radius = 3;
  scene.add(sun, sun.target);
  S.roomGroup = new THREE.Group(); scene.add(S.roomGroup);

  const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, samples: 2 });
  composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, camera));
  bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.4, 0.5, 1.3);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  const world = S.world = new CANNON.World({ gravity: new CANNON.Vec3(0, -25, 0) });
  // Default (naive) broadphase on purpose: cannon-es's SAP list is only sorted once, so it silently drops
  // contacts between moving bodies. ~150 bodies is cheap enough to test exhaustively.
  world.allowSleep = true; world.solver.iterations = 8;
  S.physMat = new CANNON.Material('def'); S.rubberMat = new CANNON.Material('rubber');
  world.defaultContactMaterial.friction = 0.5; world.defaultContactMaterial.restitution = 0.18;
  world.addContactMaterial(new CANNON.ContactMaterial(S.physMat, S.physMat, { friction: 0.5, restitution: 0.18 }));
  world.addContactMaterial(new CANNON.ContactMaterial(S.physMat, S.rubberMat, { friction: 0.7, restitution: 0.75 }));

  initFx();
  S.kid = new Kid();
  // floor ring that shows how far the scream will carry while it is being charged
  reach = new THREE.Mesh(new THREE.RingGeometry(0.975, 1, 72), new THREE.MeshBasicMaterial({ color: 0xffe030, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }));
  reach.rotation.x = -Math.PI / 2; reach.visible = false; scene.add(reach);
  for (let i = 0; i < 2; i++) {
    const m = new THREE.Mesh(reach.geometry, new THREE.MeshBasicMaterial({ color: 0xff5a9a, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false, toneMapped: false }));
    m.rotation.x = -Math.PI / 2; m.visible = false; m.scale.setScalar(SPEAKER_R); scene.add(m); reach2.push(m);
  }
  S.openExit = openExit; S.onExited = onExited; S.retryRoom = retryRoom;
  resize(); addEventListener('resize', resize);
  if (window.visualViewport) visualViewport.addEventListener('resize', resize);
  bindInput(); bindUi();
  loadRoom(0);
  g.mode = 'title';
  lastT = performance.now();
  requestAnimationFrame(frame);
}

function setQuality(q) {
  quality = q;
  const dpr = Math.min(window.devicePixelRatio || 1, q >= 3 ? 2 : q === 2 ? 1.5 : 1);
  renderer.setPixelRatio(dpr); composer.setPixelRatio(dpr);
  renderer.setSize(S.vw, S.vh, false); composer.setSize(S.vw, S.vh);
  bloom.enabled = q >= 2;
  if (q < 1 && renderer.shadowMap.enabled) { renderer.shadowMap.enabled = false; sun.castShadow = false; }
}

function resize() {
  const app = $('app');
  S.vw = Math.max(1, app.clientWidth); S.vh = Math.max(1, app.clientHeight);
  setQuality(quality);
  camera.aspect = S.vw / S.vh;
  fitCamera();
}

// Frame the whole diorama for any aspect ratio, leaving room for the HUD.
function fitCamera() {
  const a = camera.aspect, k = clamp((a - 0.55) / (1.5 - 0.55), 0, 1);
  camera.fov = 50 - 10 * k;
  const elev = (40 - 9 * k) * Math.PI / 180;
  camTarget.set(0, 1.25 - 0.25 * (1 - k), -0.55 + 0.35 * (1 - k));
  camDir.set(0, Math.sin(elev), Math.cos(elev));
  camera.updateProjectionMatrix();
  const top = 1 - 2 * Math.min(150, S.vh * 0.2) / S.vh, bot = -1 + 2 * Math.min(96, S.vh * 0.13) / S.vh;
  const pts = [];
  for (const x of [-RW / 2 - 0.08, RW / 2 + 0.08]) { pts.push(V(x, 0, WZ - 0.3), V(x, RH + 0.15, WZ - 0.3), V(x, 0, RD / 2), V(x, 1.9, RD / 2)); }
  const tmp = V();
  let lo = 6, hi = 70;
  for (let i = 0; i < 22; i++) {
    const d = (lo + hi) / 2;
    camera.position.copy(camTarget).addScaledVector(camDir, d); camera.lookAt(camTarget); camera.updateMatrixWorld();
    let ok = true;
    for (const p of pts) { tmp.copy(p).project(camera); if (Math.abs(tmp.x) > 0.97 || tmp.y > top || tmp.y < bot) { ok = false; break; } }
    if (ok) hi = d; else lo = d;
  }
  camDist = hi;
  camBase.copy(camTarget).addScaledVector(camDir, camDist);
  camera.position.copy(camBase); camera.lookAt(camTarget); camera.updateMatrixWorld();
}

// ------------------------------------------------------------------ rooms & flow
function disposeTree(o) {
  o.traverse((m) => {
    if (!m.isMesh) return;
    if (m.geometry && !m.geometry.userData.shared) m.geometry.dispose();
    for (const mt of Array.isArray(m.material) ? m.material : [m.material]) {
      if (mt && mt.userData.own) { if (mt.map) mt.map.dispose(); mt.dispose(); }
    }
  });
}
// The old room is not thrown away until the new one is built and its shaders are ready:
// releasing the old materials first would drop shader programs the new room needs again,
// and recompiling them is the stall people see between courses (worst on phones).
let oldRoom = [];
function clearRoom() {
  for (const b of [...S.world.bodies]) S.world.removeBody(b);
  oldRoom.push(...S.roomGroup.children);
  S.roomGroup.clear();
  S.props = []; S.debris = []; S.timers = []; S.deferred = []; S.propsDirty = false;
  S.world.addBody(S.kid.pbody);
}

function loadRoom(i, retry) {
  clearRoom();
  if (retry && S.snap) Object.assign(g, S.snap);
  S.snap = { broken: g.broken, total: g.total, hints: g.hints, hintsTotal: g.hintsTotal };
  const def = ROOMS[i];
  S.room = { def, hintIdx: 0 };
  g.roomIndex = i; g.roomTime = 0; g.exitOpen = false; g.noise = 0; g.noiseOn = !!def.noise; g.noiseMul = def.noiseMul || 1;
  g.dopamine = 100; g.pauseDrain = 0.4; g.moves = 0; g.combo = 0; g.comboT = 0; g.slowT = 0; g.hitStop = 0;
  zoomK = 0; S.trauma = 0; g.lockT = 0; S.dark = !!def.dark; S.grav = def.grav || 25; S.world.gravity.set(0, -S.grav, 0); $('watch').classList.remove('on');
  buildShell(def); def.setup();
  S.kid.reset(def.start[0], def.start[1]);
  hemi.groundColor.set(def.pal.ground);
  // get every shader the new room needs ready now, while the screen is covered, then let the old room go
  try { S.renderer.compile(S.scene, S.camera); } catch (e) { /* compile is only a warm-up */ }
  for (const o of oldRoom) disposeTree(o);
  oldRoom = [];
  $('room-no').textContent = `STAGE ${def.code}` + (def.dark ? '・停電' : '') + (def.grav && def.grav < 20 ? '・低重力' : '');
  $('mini-text').textContent = def.mission; $('mini-stamp').textContent = def.stamp;
  $('room-name').textContent = def.name;
  $('tip').hidden = !def.tips; tipI = 0;
  $('noise').hidden = !(def.noise || def.meter); $('noise-label').textContent = def.meter || '騒音'; $('noise').classList.toggle('good', !!def.meter);
  const verbs = def.verbs || {};
  for (const c of document.querySelectorAll('.chip')) {
    const k = c.dataset.k;
    c.lastChild.textContent = verbs[k] || { tap: '殴る', swipe: '投げる', hold: '叫ぶ' }[k];
    c.classList.toggle('on', def.teach === 'all' || k === def.teach || !!verbs[k]);   // a changed verb is worth pointing at
  }
  $('phone').hidden = true; $('escape').classList.remove('show');
  // The centre card is for a first look. Playing the same course again straight away starts at once,
  // with the rule already sitting in its small spot under the stage name.
  if (g.mode === 'play' || g.mode === 'trans') {
    if (S.lastShown === i) { $('banner').classList.remove('show'); $('mission-mini').classList.remove('late'); g.pauseDrain = 0.8; }
    else showMission(def);
    S.lastShown = i;
  }
}

function showMission(def) {
  const b = $('banner');
  $('mission-text').textContent = def.mission;
  $('stamp').textContent = def.stamp;
  // the card opens mid-screen, then shrinks into the small struck-through line under the stage name
  const mini = $('mission-mini');
  b.classList.remove('show'); mini.classList.remove('late'); void b.offsetWidth;
  const br = b.getBoundingClientRect(), mr = mini.getBoundingClientRect();
  b.style.setProperty('--dx', (mr.left - br.left).toFixed(1) + 'px');
  b.style.setProperty('--dy', (mr.top - br.top).toFixed(1) + 'px');
  b.style.setProperty('--sc', clamp(mr.width / Math.max(br.width, 1), 0.25, 1).toFixed(2));
  b.classList.add('show'); mini.classList.add('late');
  g.lockT = 1.6;   // no input, no clock, no drain while the card covers the room
}

function openExit() {
  if (g.exitOpen || S.kid.state === 'caught') return;   // no slipping out the door mid-arrest
  // the way out is open but a glass wall is still in the way: wait until it is gone
  if (S.room.wall && S.room.wall.alive) { if (!S.room.exitPending) { S.room.exitPending = true; say('出口は開いた。でもガラスの壁が邪魔', 2.2); } return; }
  g.exitOpen = true; g.slowT = 0.55; g.noiseOn = false;
  sfx.clear(); flash('#fff8d8', 0.5, 0.6);
  S.room.spill.material.opacity = 0.42;
  const e = $('escape'); e.classList.remove('show'); void e.offsetWidth; e.classList.add('show');
  const d0 = S.room.def;
  $('escape-time').textContent = fmt(g.roomTime) + '秒・' + g.moves + '手' + (d0.par ? (d0.gen ? (g.moves <= d0.par ? '　目標クリア！' : `（目標${d0.par}手）`) : (g.moves <= d0.par ? '　最短！' : `（最短${d0.par}手）`)) : '');
  after(0.3, () => S.kid.exit());
}
function onExited() {
  if (g.mode !== 'play') return;
  g.mode = 'trans';
  const f = $('fade'); f.classList.add('on');
  setTimeout(() => {
    unlock(g.roomIndex + 1); saveBest(ROOMS[g.roomIndex].code, g.roomTime, g.moves);
    if (g.roomIndex < S.endRoom) { loadRoom(g.roomIndex + 1); g.mode = 'play'; requestAnimationFrame(() => requestAnimationFrame(() => f.classList.remove('on'))); }
    else { showResult(); f.classList.remove('on'); }
  }, 420);
}
function retryRoom() {
  if (g.mode !== 'play') return;
  g.mode = 'trans';
  const f = $('fade'); f.classList.add('on', 'dark');
  setTimeout(() => { loadRoom(g.roomIndex, true); g.mode = 'play'; f.classList.remove('on'); setTimeout(() => f.classList.remove('dark'), 400); }, 380);
}

function startGame(fromRoom = 0) {
  initAudio();
  Object.assign(g, { time: 0, maxCombo: 0, broken: 0, total: 0, hints: 0, hintsTotal: 0, phones: 0, caught: 0 });
  S.snap = null;
  S.endRoom = fromRoom; while (S.endRoom + 1 < ROOMS.length && ROOMS[S.endRoom + 1].world === ROOMS[fromRoom].world) S.endRoom++;
  S.played = S.endRoom - fromRoom + 1;
  g.mode = 'play';
  $('title').hidden = true; $('result').hidden = true; $('map').hidden = true; $('hud').hidden = false; $('mission-mini').hidden = false;
  loadRoom(fromRoom);
  sfx.blip();
}

const fmt = (t) => { const m = Math.floor(t / 60), s = t - m * 60; return (m ? m + ':' + (s < 10 ? '0' : '') : '') + s.toFixed(1); };

function showResult() {
  g.mode = 'result';
  $('hud').hidden = true; $('phone').hidden = true; $('mission-mini').hidden = true; $('tip').hidden = true;
  const rate = g.total ? Math.round(g.broken / g.total * 100) : 0;
  const score = rate + Math.max(0, 100 - g.time / (0.36 * Math.max(1, S.played))) + Math.min(25, g.maxCombo) - g.caught * 8;
  const ranks = [
    [150, 'S', '末期ドパガキ', '部屋が説明を始める前に壊し終えている。'],
    [115, 'A', '重度ドパガキ', '謎を1文字も読まずに出てきた。立派。'],
    [80, 'B', 'ドパガキ予備軍', 'まだ「考える」という悪い癖が残っている。'],
    [-1e9, 'C', 'ほぼ健常者', '落ち着きすぎ。もっと雑にやれる。'],
  ];
  const r = ranks.find((q) => score >= q[0]);
  $('r-head').textContent = `STAGE ${ROOMS[g.roomIndex].world} ` + (S.played >= 5 ? '通しクリア' : `${ROOMS[S.endRoom - S.played + 1].code} からクリア`);
  $('rank').textContent = r[1]; $('rank-title').textContent = r[2]; $('rank-note').textContent = r[3];
  if (ROOMS[g.roomIndex].world === LAST_STAGE) {   // the very last stage: the ending
    $('r-head').textContent = `全${LAST_STAGE}STAGE 完全脱出！！`;
    $('rank-note').textContent = '謎は最後まで1つも解かなかった。全部ぶっ壊して出てきた。おめでとう。';
  }
  $('r-time').textContent = fmt(g.time) + '秒';
  $('r-rate').textContent = rate + '%';
  $('r-combo').textContent = g.maxCombo + ' HIT';
  $('r-hints').textContent = `${g.hints}/${g.hintsTotal}枚`;
  $('r-phone').textContent = g.phones + '回';
  $('r-caught').textContent = g.caught + '回';
  S.resultText = `【ドパガキ脱出！！】ドパガキ度 ${r[1]}「${r[2]}」／タイム ${fmt(g.time)}秒・破壊率 ${rate}%・最大 ${g.maxCombo} HIT・読み捨てたヒント ${g.hints}枚`;
  $('result').hidden = false;
  $('copy').textContent = '結果をコピー';
  sfx.fanfare();
}

// ------------------------------------------------------------------ input
const inp = { id: null, x0: 0, y0: 0, x: 0, y: 0, t0: 0, moved: false, prop: null, charging: false, tick: 0 };

function pickProp(x, y) {
  ndc.set(x / S.vw * 2 - 1, -(y / S.vh) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const groups = []; for (const p of S.props) if (p.alive && !p.o.noPick) groups.push(p.group);
  const hit = ray.intersectObjects(groups, true)[0];
  if (hit) { let o = hit.object; while (o && !o.userData.prop) o = o.parent; if (o) return o.userData.prop; }
  let best = null, bd = coarse ? 52 : 34;
  for (const p of S.props) {
    if (!p.alive) continue;
    const s = toScreen(p.pos), d = Math.hypot(s.x - x, s.y - y);
    if (d < bd) { bd = d; best = p; }
  }
  return best;
}
function groundPoint(x, y) {
  ndc.set(x / S.vw * 2 - 1, -(y / S.vh) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const o = ray.ray.origin, d = ray.ray.direction;
  if (d.y >= -1e-4) return null;
  const t = -o.y / d.y;
  return V(o.x + d.x * t, 0, o.z + d.z * t);
}
function nearestThrowable() {
  let best = null, bd = 1e9; const k = S.kid;
  for (const p of S.props) {
    if (!p.alive || !p.throwable) continue;
    const d = Math.hypot(p.pos.x - k.x, p.pos.z - k.z);
    if (d < bd) { bd = d; best = p; }
  }
  return best;
}
// For swipes, forgive sloppy thumbs: grab the throwable closest to where the swipe began.
function pickThrowable(x, y) {
  let best = null, bd = coarse ? 78 : 60;
  for (const p of S.props) {
    if (!p.alive || !p.throwable) continue;
    const s = toScreen(p.pos), d = Math.hypot(s.x - x, s.y - y) - (p.name === 'tnt' ? 14 : 0);
    if (d < bd) { bd = d; best = p; }
  }
  return best;
}
function endCharge() { inp.charging = false; $('charge').classList.remove('on'); }

function bindInput() {
  const el = $('app');
  const xy = (e) => { const r = el.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  el.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return;
    if (g.mode !== 'play' || g.lockT > 0 || inp.id !== null) return;
    initAudio();
    const [x, y] = xy(e);
    Object.assign(inp, { id: e.pointerId, x0: x, y0: y, x, y, t0: performance.now(), moved: false, charging: false, prop: pickProp(x, y) });
    try { el.setPointerCapture(e.pointerId); } catch (err) { /* not capturable */ }
    e.preventDefault();
  });
  el.addEventListener('pointermove', (e) => {
    if (e.pointerId !== inp.id) return;
    [inp.x, inp.y] = xy(e);
    if (Math.hypot(inp.x - inp.x0, inp.y - inp.y0) > 16) inp.moved = true;
  });
  const up = (e) => {
    if (e.pointerId !== inp.id) return;
    [inp.x, inp.y] = xy(e);
    const dt = performance.now() - inp.t0, dx = inp.x - inp.x0, dy = inp.y - inp.y0, dist = Math.hypot(dx, dy);
    inp.id = null;
    const k = S.kid;
    if (g.mode !== 'play' || g.exitOpen) { k.cancelCharge(); endCharge(); return; }
    if (inp.charging) { endCharge(); k.release(); return; }
    if (dist > 34) {
      const sd = { x: dx / dist, y: dy / dist };
      if (S.room.def.swipe === 'charge') { k.cmdRam(sd); return; }
      if (S.room.def.swipe === 'pull') { k.cmdPull(sd); return; }
      const prop = (inp.prop && inp.prop.alive && inp.prop.throwable ? inp.prop : null) || pickThrowable(inp.x0, inp.y0) || nearestThrowable();
      k.cmdThrow(prop, { x: dx / dist, y: dy / dist, power: clamp(dist / Math.max(dt, 16) / 1.6, 0, 1) });
    } else if (dist <= 34) {
      if (inp.prop && inp.prop.alive) k.cmdTap(inp.prop); else k.cmdTap(null, groundPoint(inp.x, inp.y));
    }
  };
  el.addEventListener('pointerup', up);
  el.addEventListener('pointercancel', (e) => { if (e.pointerId === inp.id) { inp.id = null; S.kid.cancelCharge(); endCharge(); } });
  el.addEventListener('contextmenu', (e) => e.preventDefault());
  addEventListener('keydown', (e) => {
    if (g.mode !== 'play' || g.lockT > 0 || e.repeat) return;
    if (e.code === 'Space') { e.preventDefault(); if (S.kid.startCharge()) S.kid.chargeT = 0.5, S.kid.release(); }
  });
}

function updateInput(now) {
  if (inp.id === null) return;
  const k = S.kid;
  if (!inp.charging && !inp.moved && now - inp.t0 > 280 && g.mode === 'play' && !g.exitOpen) {
    if (k.startCharge()) {
      inp.charging = true;
      const c = $('charge'); c.style.left = inp.x0 + 'px'; c.style.top = inp.y0 + 'px'; c.classList.add('on');
    } else inp.moved = true;
  }
  if (inp.charging) {
    if (k.state !== 'charge') { endCharge(); inp.id = null; return; }
    const p = clamp(k.chargeT / 0.8, 0, 1);
    $('charge').style.setProperty('--p', p.toFixed(2));
    if (now - inp.tick > 110) { inp.tick = now; sfx.charge(p); }
  }
}

function bindUi() {
  $('start').addEventListener('click', () => { initAudio(); sfx.blip(); showMap(); });
  $('again').addEventListener('click', () => { sfx.blip(); showMap(); });
  $('tomap').addEventListener('click', () => { if (g.mode === 'play') showMap(); });
  $('tip').addEventListener('click', () => { const t = S.room.def.tips; if (g.mode === 'play' && t) { say(t[tipI % t.length], 4); tipI++; } });
  $('map-back').addEventListener('click', () => { $('map').hidden = true; $('title').hidden = false; g.mode = 'title'; });
  $('copy').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(S.resultText || ''); $('copy').textContent = 'コピーした'; }
    catch (e) { $('copy').textContent = 'コピーできなかった'; }
  });
  $('mute').addEventListener('click', () => { initAudio(); setMuted(!isMuted()); $('mute').textContent = isMuted() ? '音 OFF' : '音 ON'; $('mute').setAttribute('aria-pressed', String(isMuted())); });
}

// ------------------------------------------------------------------ per-frame
let hudTimer = '', hudCombo = -1, hudDopa = -1, hudNoise = -1, lastComboShown = 0;
function updateHud() {
  const t = fmt(g.time);
  if (t !== hudTimer) { hudTimer = t; $('timer').textContent = t; }
  const d = Math.round(g.dopamine);
  if (d !== hudDopa) { hudDopa = d; $('dopa-fill').style.transform = `scaleX(${d / 100})`; $('dopa').classList.toggle('low', d < 28); }
  if (g.noiseOn || !$('noise').hidden) {
    const n = Math.round(S.room.def.meter ? (S.room.meterV || 0) : g.noise);
    if (n !== hudNoise) { hudNoise = n; $('noise-fill').style.transform = `scaleX(${n / 100})`; $('noise').classList.toggle('hot', n > 60 && !S.room.def.meter); }
    if (!g.noiseOn && S.room && S.room.def.noise && S.room.guard !== 'asleep') $('noise').hidden = true;
  }
  if (g.combo !== hudCombo) {
    hudCombo = g.combo;
    const c = $('combo');
    if (g.combo >= 2) {
      c.textContent = g.combo + ' HIT'; c.classList.add('show');
      c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump');
      if (g.combo > lastComboShown) sfx.combo(g.combo);
    } else c.classList.remove('show');
    lastComboShown = g.combo;
  }
  const k = S.kid, b = $('bubble');
  if (S.bubbleT > 0) {
    const s = toScreen(V(k.x, 2.2 + (k.root.position.y || 0), k.z));
    b.style.left = clamp(s.x, 90, S.vw - 90) + 'px'; b.style.top = Math.max(70, s.y) + 'px';
  }
  const ph = $('phone');
  if ((k.state === 'phone') === ph.hidden) ph.hidden = k.state !== 'phone';
  if (k.state === 'phone') $('phone-t').textContent = Math.max(0, k.stT).toFixed(1);
}

function rules(dt, raw) {
  const k = S.kid, def = S.room.def;
  if (g.mode !== 'play') return;
  if (g.lockT > 0) { g.lockT -= raw; return; }
  g.time += raw;
  if (!g.exitOpen) g.roomTime += raw;
  if (g.comboT > 0) { g.comboT -= raw; if (g.comboT <= 0) g.combo = 0; }
  if (g.noiseOn) g.noise = Math.max(0, g.noise - 9 * dt);
  if (g.pauseDrain > 0) g.pauseDrain -= raw;
  else if (!g.exitOpen && (k.state === 'idle' || k.state === 'dash' || k.state === 'charge')) {
    g.dopamine = Math.max(0, g.dopamine - (def.drain || 6.5) * (S.room.watch && S.room.watch.phase === 'look' ? 0.5 : 1) * dt);
    if (g.dopamine <= 0) { endCharge(); inp.id = null; k.usePhone(); say('…（スマホ見てる）', 2.4); }
  }
  const h = def.hints && def.hints[S.room.hintIdx];
  if (h && !g.exitOpen && g.roomTime > h[0] && k.canAct()) { S.room.hintIdx++; say(h[1], 3.2); }
  if (def.update) def.update(dt);
  if (S.room.exitPending && !(S.room.wall && S.room.wall.alive)) { S.room.exitPending = false; openExit(); }
}

// One tick of game logic, separate from drawing so a test bot can run rooms at full speed.
function simStep(raw, quiet) {
  let dt = raw;
  if (g.hitStop > 0) { g.hitStop -= raw; dt = 0; }
  else if (g.slowT > 0) { g.slowT -= raw; dt = raw * 0.3; }
  if (dt > 0) {
    for (let i = S.timers.length - 1; i >= 0; i--) { const t = S.timers[i]; t.t -= dt; if (t.t <= 0) { S.timers.splice(i, 1); t.fn(); } }
  }
  S.kid.update(dt, raw);
  if (dt > 0) {
    S.world.step(1 / 60, dt, 3);
    if (S.deferred.length) { const q = S.deferred; S.deferred = []; for (const f of q) f(); }
  }
  updateProps(dt);
  rules(dt, raw);
  if (!quiet) updateFx(raw);
  if (S.bubbleT > 0) { S.bubbleT -= raw; if (S.bubbleT <= 0) $('bubble').classList.remove('show'); }
}

function frame(now) {
  requestAnimationFrame(frame);
  const raw = Math.min(0.05, (now - lastT) / 1000); lastT = now;
  if (raw <= 0) return;
  musicTick(g.mode === 'play', ROOMS[g.roomIndex] ? ROOMS[g.roomIndex].world : 1);
  // adaptive quality
  if (raw > 0.03) slowFrames++; else slowFrames = Math.max(0, slowFrames - 2);
  if (slowFrames > 70 && quality > 0) { slowFrames = 0; setQuality(quality - 1); }

  if (!S.botDriven) { updateInput(now); simStep(raw); }

  // camera: gentle follow, exit dolly, trauma shake
  const k = S.kid, tr = S.trauma * S.trauma;
  zoomK += ((g.exitOpen ? 1 : 0) - zoomK) * Math.min(1, raw * 4);
  const title = g.mode === 'title' || g.mode === 'result' || g.mode === 'map';
  const sway = title ? Math.sin(now / 2600) * 0.16 : 0;
  const tx = camTarget.x + k.x * 0.06 + zoomK * 0, ty = camTarget.y + zoomK * 0.2, tz = camTarget.z - zoomK * 1.0;
  const d = camDist * (1 - zoomK * 0.14) * (title ? 0.93 : 1);
  camera.position.set(tx + Math.sin(sway) * d * camDir.z, ty + camDir.y * d, tz + Math.cos(sway) * d * camDir.z);
  camera.position.x += k.x * 0.05;
  if (tr > 0.0005) {
    camera.position.x += (Math.random() - 0.5) * tr * 0.9; camera.position.y += (Math.random() - 0.5) * tr * 0.9; camera.position.z += (Math.random() - 0.5) * tr * 0.5;
    S.trauma = Math.max(0, S.trauma - raw * 2.0);
  }
  camera.lookAt(tx, ty, tz);
  if (tr > 0.0005) camera.rotation.z += (Math.random() - 0.5) * tr * 0.05;
  camera.updateMatrixWorld();

  // blackout rooms: almost no light, and every hit or blast lights the room for a moment
  lightK += ((S.dark && g.mode === 'play' ? Math.min(1, 0.05 + S.trauma * 1.5) : 1) - lightK) * Math.min(1, raw * (S.dark ? 9 : 4));
  hemi.intensity = 0.8 * lightK; sun.intensity = 1.75 * lightK; scene.environmentIntensity = 0.32 * lightK;
  if (S.room.lamp) S.room.lamp.intensity = 13 * lightK;
  if (k.state !== 'phone') k.light.intensity = S.dark && g.mode === 'play' ? 1.4 : 0;

  reach.visible = k.state === 'charge' && g.mode === 'play';
  if (reach.visible) { reach.position.set(k.x, 0.05, k.z); reach.scale.setScalar((S.room.def.hold === 'blow' ? blowReach : screamReach)(clamp(k.chargeT / 0.8, 0.25, 1))); }
  // while charging, show where the voice will also come out if it reaches a microphone
  let nSp = 0;
  if (reach.visible) {
    const rr = reach.scale.x;
    if (S.props.some((q) => q.alive && q.name === 'mic' && Math.hypot(q.pos.x - k.x, q.pos.z - k.z) < rr))
      for (const q of S.props) if (q.alive && q.name === 'speaker' && nSp < reach2.length) reach2[nSp++].position.set(q.pos.x, 0.05, q.pos.z);
  }
  reach2.forEach((m, i) => { m.visible = i < nSp; });

  updateHud();
  if (bloom.enabled) composer.render(); else renderer.render(scene, camera);
}

// ------------------------------------------------------------------ stage select (progress is a per-browser convenience)
let unlocked = 0;
try { unlocked = clamp(parseInt(localStorage.getItem('dopagaki.unlocked') || '0', 10) || 0, 0, ROOMS.length - 1); } catch (e) { unlocked = 0; }
function unlock(i) {
  if (i > unlocked && i < ROOMS.length) { unlocked = i; try { localStorage.setItem('dopagaki.unlocked', String(i)); } catch (e) { /* storage unavailable */ } }
}
let best = {};
try { best = JSON.parse(localStorage.getItem('dopagaki.best') || '{}') || {}; } catch (e) { best = {}; }
function saveBest(code, t, m) {
  if (m > 0 && !(best['m' + code] <= m)) best['m' + code] = m;
  else if (!(t > 0) || (best[code] && best[code] <= t)) return;
  if (t > 0 && !(best[code] <= t)) best[code] = Math.round(t * 10) / 10;
  try { localStorage.setItem('dopagaki.best', JSON.stringify(best)); } catch (e) { /* storage unavailable */ }
}

// Course map: one zigzag path per STAGE, the kid stands on the next course to beat.
function showMap() {
  g.mode = 'map';
  $('title').hidden = true; $('result').hidden = true; $('hud').hidden = true; $('phone').hidden = true; $('mission-mini').hidden = true; $('tip').hidden = true;
  $('banner').classList.remove('show'); $('escape').classList.remove('show');
  inp.id = null; endCharge(); S.kid.cancelCharge();
  const box = $('worlds'); box.textContent = '';
  let sec = null, path = null, w = 0, here = null;
  const showTo = Math.min(LAST_STAGE, ROOMS[unlocked].world + 1);   // only the stages reached so far, plus the next
  ROOMS.forEach((def, i) => {
    if (def.world > showTo) return;
    if (def.world !== w) {
      w = def.world;
      sec = document.createElement('section'); sec.className = 'world';
      const h = document.createElement('h2');
      const tag = document.createElement('span'); tag.textContent = 'STAGE ' + w;
      h.append(tag, def.worldName || '');
      path = document.createElement('div'); path.className = 'path';
      path.insertAdjacentHTML('beforeend', '<svg viewBox="0 0 500 100" preserveAspectRatio="none" aria-hidden="true"><polyline points="50,36 150,64 250,36 350,64 450,36"/></svg>');
      if (ROOMS.filter((q) => q.world === w).length < 5) path.classList.add('short');
      sec.append(h, path); box.appendChild(sec);
    }
    const b = document.createElement('button');
    const state = i > unlocked ? 'locked' : i === unlocked ? 'current' : 'cleared';
    b.type = 'button'; b.className = 'node ' + state; b.id = 'course-' + def.code; b.disabled = i > unlocked;
    b.setAttribute('aria-label', `${def.code} ${def.name}` + (state === 'locked' ? '（未解放）' : state === 'cleared' ? '（クリア済み）' : ''));
    const dot = document.createElement('b'); dot.textContent = def.code;
    const nm = document.createElement('span'); nm.textContent = def.name;
    const bt = document.createElement('i'); bt.textContent = best[def.code] ? best[def.code].toFixed(1) + '秒' + (best['m' + def.code] ? '・' + best['m' + def.code] + '手' : '') : state === 'locked' ? 'ロック' : '未クリア';
    b.append(dot, nm, bt);
    if (state === 'current') { here = sec; const k = document.createElement('em'); k.className = 'kidico'; k.setAttribute('aria-hidden', 'true'); b.appendChild(k); }
    b.addEventListener('click', () => startGame(i));
    path.appendChild(b);
  });
  $('map-more').textContent = showTo < LAST_STAGE ? `この先、STAGE ${LAST_STAGE} まで続く。` : 'ここが最後のSTAGE。';
  $('map').hidden = false;
  if (here) here.scrollIntoView({ block: 'center' });
}

// ------------------------------------------------------------------ boot
function boot(data) {
  if (data && data.room > 0 && data.room < ROOMS.length) resumeRoom = data.room;
  const go = () => {
    init();
    if (resumeRoom) unlock(resumeRoom);
    window.__dg = { S, loadRoom, startGame, ROOMS, pickProp, inp, setQuality, step: simStep, pickAt: (p) => { const s = toScreen(p.pos); return [s.x, s.y]; }, pt: (x, y, z) => { const s = toScreen(V(x, y, z)); return [s.x, s.y]; }, scr: (name, i = 0) => { const p = S.props.filter((q) => q.alive && q.name === name)[i]; if (!p) return null; const s = toScreen(p.pos); return [s.x, s.y]; }, kid: () => { const s = toScreen(V(S.kid.x, 0.9, S.kid.z)); return [s.x, s.y]; } };
  };
  let done = false;
  const once = () => { if (!done) { done = true; go(); } };
  try {
    Promise.all([
      document.fonts.load('400 40px "Dela Gothic One"', FONT_SAMPLE),
      document.fonts.load('900 20px "Zen Kaku Gothic New"', FONT_SAMPLE),
      document.fonts.load('500 20px "Zen Kaku Gothic New"', FONT_SAMPLE),
    ]).then(once, once);
  } catch (e) { once(); }
  setTimeout(once, 2200);
}
const hot = window.claude && window.claude.hot;
if (hot && hot.snapshot) hot.snapshot(() => ({ room: g.mode === 'play' || g.mode === 'trans' ? g.roomIndex : 0 }));
if (hot && hot.ready) hot.ready(boot); else boot((hot && hot.data) || {});
