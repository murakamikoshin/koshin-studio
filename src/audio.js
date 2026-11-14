// All sound is synthesised with WebAudio: no assets.
let ac = null, out = null, noiseBuf = null, muted = false;

export function initAudio() {
  try {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ac = new AC();
      const comp = ac.createDynamicsCompressor();
      comp.threshold.value = -14; comp.ratio.value = 6;
      out = ac.createGain(); out.gain.value = 0.8;
      out.connect(comp); comp.connect(ac.destination);
      noiseBuf = ac.createBuffer(1, ac.sampleRate * 1.5, ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ac.state === 'suspended') ac.resume();
  } catch (e) { ac = null; }
}
// ---- background music: a short synthesised loop, scheduled a fraction of a second ahead of the clock
let mNext = 0, mStep = 0;
const M_CH = [[0, [0, 3, 7]], [-4, [0, 4, 7]], [3, [0, 4, 7]], [-2, [0, 4, 7]]];
function mNote(type, f, t, dur, peak, lp) {
  const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  if (lp) { const fl = ac.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = lp; o.connect(fl); fl.connect(g); } else o.connect(g);
  g.connect(out); o.start(t); o.stop(t + dur + 0.02);
}
function mDrum(t, kind) {
  if (kind === 'kick') { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.11); g.gain.setValueAtTime(0.16, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.14); o.connect(g); g.connect(out); o.start(t); o.stop(t + 0.16); return; }
  const s = ac.createBufferSource(); s.buffer = noiseBuf; const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = kind === 'snare' ? 1800 : 7000;
  const g = ac.createGain(), d = kind === 'snare' ? 0.11 : 0.03; g.gain.setValueAtTime(kind === 'snare' ? 0.07 : 0.025, t); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  s.connect(f); f.connect(g); g.connect(out); s.start(t, Math.random()); s.stop(t + d + 0.02);
}
export function musicTick(on, world = 1) {
  if (!ac || muted || !on || ac.state !== 'running') { mNext = 0; return; }
  const sp = 60 / (140 + (world % 4) * 6) / 4, tr = [0, 2, -3, 5, -1][world % 5], alt = world % 3;
  if (!mNext || mNext < ac.currentTime) mNext = ac.currentTime + 0.06;
  while (mNext < ac.currentTime + 0.22) {
    const st = mStep % 16, [root, ch] = M_CH[Math.floor(mStep / 16) % 4], t = mNext, hz = (n, base) => base * Math.pow(2, (n + tr) / 12);
    if ([0, 3, 6, 8, 11, 14].includes(st)) mNote('square', hz(root + (st === 11 ? 12 : 0), 55), t, sp * 1.7, 0.05, 500);
    if (st % 2 === 0 && (alt !== 1 || st % 4 !== 2)) mNote(alt === 2 ? 'square' : 'triangle', hz(root + ch[(st / 2 + (alt ? 1 : 0)) % 3] + ((st / 2) % 4 >= 2 ? 12 : 0), 220), t, sp * 1.5, alt === 2 ? 0.018 : 0.04, 2600);
    if (st % 8 === 0) mDrum(t, 'kick'); if (st % 8 === 4) mDrum(t, 'snare'); if (st % 2 === 0) mDrum(t, 'hat');
    mNext += sp; mStep++;
  }
}
export function setMuted(m) { muted = m; if (out) out.gain.value = m ? 0 : 0.8; }
export function isMuted() { return muted; }

function env(g, t, a, d, peak) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(peak, 0.0002), t + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
}
function noise(dur, o = {}) {
  if (!ac || muted) return;
  const t = ac.currentTime + (o.when || 0);
  const s = ac.createBufferSource(); s.buffer = noiseBuf; s.playbackRate.value = o.rate || 1;
  const f = ac.createBiquadFilter(); f.type = o.type || 'lowpass';
  f.frequency.setValueAtTime(o.f || 1200, t);
  if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + dur);
  f.Q.value = o.q || 0.8;
  const g = ac.createGain(); env(g, t, o.a || 0.002, dur, o.g || 0.5);
  s.connect(f); f.connect(g); g.connect(out);
  s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
}
function tone(freq, dur, o = {}) {
  if (!ac || muted) return;
  const t = ac.currentTime + (o.when || 0);
  const os = ac.createOscillator(); os.type = o.type || 'sine';
  os.frequency.setValueAtTime(freq, t);
  if (o.f2) os.frequency.exponentialRampToValueAtTime(o.f2, t + dur);
  const g = ac.createGain(); env(g, t, o.a || 0.002, dur, o.g || 0.4);
  os.connect(g); g.connect(out);
  os.start(t); os.stop(t + dur + 0.05);
}

export const sfx = {
  punch(p = 1) {
    tone(170 * p, 0.12, { f2: 55, g: 0.7 });
    noise(0.07, { f: 2400, f2: 500, g: 0.45 });
  },
  wood() {
    noise(0.22, { type: 'bandpass', f: 900, f2: 300, q: 1.2, g: 0.7 });
    noise(0.1, { f: 4000, g: 0.3, when: 0.02 });
    tone(120, 0.18, { f2: 50, g: 0.5 });
  },
  metal() {
    tone(520, 0.5, { type: 'square', g: 0.12 }); tone(783, 0.4, { type: 'square', g: 0.08 });
    tone(1310, 0.3, { g: 0.1 });
    noise(0.12, { type: 'highpass', f: 2500, g: 0.3 });
    tone(90, 0.2, { f2: 40, g: 0.6 });
  },
  clang() {
    tone(880, 0.35, { type: 'triangle', g: 0.25 }); tone(1320, 0.3, { type: 'triangle', g: 0.18 });
    noise(0.05, { type: 'highpass', f: 3000, g: 0.25 });
  },
  glass() {
    noise(0.35, { type: 'highpass', f: 5000, g: 0.5 });
    for (let i = 0; i < 6; i++) tone(2000 + Math.random() * 4000, 0.12 + Math.random() * 0.2, { g: 0.08, when: Math.random() * 0.18 });
  },
  paper() { noise(0.16, { type: 'bandpass', f: 3200, q: 0.7, g: 0.35 }); noise(0.1, { type: 'bandpass', f: 2200, g: 0.25, when: 0.08 }); },
  stone() { noise(0.3, { f: 700, f2: 150, g: 0.8 }); tone(80, 0.25, { f2: 35, g: 0.6 }); },
  plastic() { noise(0.12, { type: 'bandpass', f: 1800, q: 2, g: 0.5 }); tone(300, 0.08, { f2: 120, type: 'square', g: 0.12 }); },
  coins() { for (let i = 0; i < 14; i++) tone(2600 + Math.random() * 2600, 0.09, { type: 'triangle', g: 0.09, when: i * 0.035 + Math.random() * 0.02 }); },
  boom() {
    noise(0.9, { f: 900, f2: 60, g: 1.0 }); tone(110, 0.7, { f2: 28, g: 0.9 });
    noise(0.25, { type: 'highpass', f: 1800, g: 0.4 });
  },
  whoosh() { noise(0.2, { type: 'bandpass', f: 500, f2: 2600, q: 1.5, g: 0.3, a: 0.05 }); },
  thud() { tone(100, 0.12, { f2: 45, g: 0.5 }); noise(0.06, { f: 800, g: 0.25 }); },
  bounce() { tone(220, 0.14, { f2: 520, g: 0.3 }); },
  dash() { noise(0.09, { type: 'bandpass', f: 1400, f2: 500, q: 1, g: 0.14 }); },
  charge(p) { tone(180 + p * 500, 0.08, { type: 'triangle', g: 0.1 }); },
  scream(p = 1) {
    if (!ac || muted) return;
    const t = ac.currentTime, dur = 0.5 + p * 0.45;
    const os = ac.createOscillator(); os.type = 'sawtooth';
    os.frequency.setValueAtTime(420, t);
    os.frequency.exponentialRampToValueAtTime(780 + p * 260, t + 0.12);
    os.frequency.exponentialRampToValueAtTime(600, t + dur);
    const lfo = ac.createOscillator(); lfo.frequency.value = 17;
    const lg = ac.createGain(); lg.gain.value = 45; lfo.connect(lg); lg.connect(os.frequency);
    const f1 = ac.createBiquadFilter(); f1.type = 'bandpass'; f1.frequency.value = 1050; f1.Q.value = 2.5;
    const f2 = ac.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.value = 2700; f2.Q.value = 3;
    const g = ac.createGain(); env(g, t, 0.03, dur, 0.9);
    os.connect(f1); os.connect(f2); f1.connect(g); f2.connect(g); g.connect(out);
    os.start(t); lfo.start(t); os.stop(t + dur + 0.1); lfo.stop(t + dur + 0.1);
    noise(dur, { type: 'bandpass', f: 1800, q: 0.6, g: 0.22, a: 0.03 });
  },
  blip() { tone(880, 0.06, { type: 'square', g: 0.12 }); },
  error() { tone(200, 0.16, { type: 'square', g: 0.16 }); tone(150, 0.2, { type: 'square', g: 0.16, when: 0.14 }); },
  keypad() { for (let i = 0; i < 5; i++) tone(900 + Math.random() * 700, 0.04, { type: 'square', g: 0.1, when: i * 0.045 }); },
  clear() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.22, { type: 'triangle', g: 0.28, when: i * 0.07 })); },
  fanfare() { [392, 523, 659, 784, 1047, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, 0.3, { type: 'triangle', g: 0.26, when: i * 0.11 })); },
  whistle() { for (let i = 0; i < 3; i++) { tone(2300, 0.14, { type: 'square', g: 0.14, when: i * 0.17 }); tone(2380, 0.14, { g: 0.12, when: i * 0.17 }); } },
  phone() { tone(660, 0.1, { type: 'triangle', g: 0.2 }); tone(990, 0.14, { type: 'triangle', g: 0.2, when: 0.1 }); },
  combo(n) { tone(440 * Math.pow(2, Math.min(n, 24) / 12), 0.07, { type: 'triangle', g: 0.1 }); },
  piano() { for (let i = 0; i < 9; i++) tone(130 * Math.pow(2, Math.floor(Math.random() * 30) / 12), 0.7, { type: 'triangle', g: 0.16, when: Math.random() * 0.12 }); },
  ko() { tone(300, 0.35, { f2: 70, type: 'sawtooth', g: 0.3 }); noise(0.12, { f: 1500, g: 0.4 }); },
  open() { noise(0.6, { type: 'bandpass', f: 300, f2: 900, q: 2, g: 0.4, a: 0.05 }); tone(70, 0.6, { type: 'sawtooth', g: 0.15 }); },
};

export function breakSound(kind) {
  ({ wood: sfx.wood, metal: sfx.metal, glass: sfx.glass, paper: sfx.paper, stone: sfx.stone, plastic: sfx.plastic,
     gold: () => { sfx.metal(); sfx.coins(); }, rubber: sfx.bounce, tnt: sfx.wood, guard: sfx.ko }[kind] || sfx.wood)();
}
