/* 弾幕メーカー お試し版（ブラウザ）。
   アプリの試作（danmaku-maker/docs/prototype.html）の計算をそのまま使い、
   ・ステージ作りで使える弾幕パターンは 3 つ（放射・自機狙い・雨）。ほかは「アプリで」へ案内
   ・遊ぶのは、どのステージでも自由（アプリと同じ。遊ぶのに課金は要らない）
   ・共有は URL（#DM1-…）。世界への投稿はアプリで
   言語は <html lang> で決める（日本語と英語の頁が、この 1 本を共有する） */
(function () {
'use strict';
/* ---------- 言語 ----------
   画面の文言は 10 言語（i18n.js。アプリの翻訳から作った）。決め方：
   ?lang= → 前に選んだ言語 → ブラウザの言語（日本語・英語の人は、頁の言語のまま）。
   頁の説明文（検索向け）は、頁の言語（日本語か英語）のまま */
const PAGE_LANG = /^en/.test(document.documentElement.lang || '') ? 'en' : 'ja';
const I18N = window.DM_I18N || {}, LANG_NAMES = window.DM_LANGS || {};
function norm(l) {
  l = String(l || '').toLowerCase();
  if (/^zh-(tw|hk|mo|hant)/.test(l)) return 'zh-Hant';
  if (/^zh/.test(l)) return 'zh-Hans';
  if (/^pt/.test(l)) return 'pt-BR';
  const b = l.split('-')[0];
  return ['ja', 'en', 'ko', 'es', 'fr', 'de', 'ru'].includes(b) ? b : null;
}
function pickLang() {
  const q = norm(new URLSearchParams(location.search).get('lang'));
  if (q && I18N[q]) return q;
  try { const saved = localStorage.getItem('dm_lang'); if (saved && I18N[saved]) return saved; } catch (e) { /* 保存できない環境 */ }
  for (const l of (navigator.languages || [navigator.language])) {
    const n = norm(l);
    if (!n) continue;
    if (n === 'ja' || n === 'en') return PAGE_LANG;
    if (I18N[n]) return n;
  }
  return PAGE_LANG;
}
const LANG = pickLang();
const D = I18N[LANG] || I18N[PAGE_LANG] || {};
const f = (k, ...a) => String(D[k] || '').replace(/\{(\d)\}/g, (_, i) => a[+i]);
const EN = LANG !== 'ja';   /* 日本語以外では、App Store も日本以外の入口にする */
const APP = 'https://apps.apple.com/' + (LANG === 'ja' ? 'jp/' : '') + 'app/id6824245206';
const SELF = location.origin + location.pathname;
const SEP = LANG === 'ja' ? '・' : ' · ';
const S = {
  ty: { ring: D.ty_ring, spiral: D.ty_spiral, aim: D.ty_aim, rain: D.ty_rain, sweep: D.ty_sweep },
  rl: { ring: D.rl_rot, spiral: D.rl_rot, aim: D.rl_aim, rain: D.rl_rain, sweep: D.rl_sweep },
  sl: { x: D.sl_x, y: D.sl_y, s: D.sl_s, e: D.sl_e, i: D.sl_i, c: D.sl_c, v: D.sl_v, r: D.sl_r },
  phases: [D.ph0, D.ph1, D.ph2, D.ph3],
  sub: D.sub, newb: D.newb, codeH: D.codeH, codePh: D.codePh, play: D.play, world: D.world, recv: D.recv, mine: D.mine,
  emptyRecv: D.emptyRecv, emptyMine: D.emptyMine, note: D.note, boss: D.boss, surv: D.surv, by: 'by', rate: D.rate,
  tries: D.tries, clears: D.clears, edit: D.edit, code: D.code, codeErr: D.codeErr, editor: D.editor, back: D.back,
  cond: D.cond, mS: D.mS, mSd: D.mSd, mB: D.mB, mBd: D.mBd, name: D.name, namePh: D.namePh, author: D.author, authorPh: D.authorPh,
  dur: D.dur, durB: D.durB, mv: D.mv, mv0: D.mv0, mv1: D.mv1, mv2: D.mv2, bhp: D.bhp, bossNote: D.bossNote, add: D.add,
  test: D.test, post: D.post, ok: D.ok, need: D.need, del: D.del, pat: D.pat, color: D.color, phase: D.phase,
  toEnd: D.toEnd, lockT: D.lockT, moreOpt: D.moreOpt, quit: D.quit, retry: D.retry, backB: D.backB,
  hint: D.hintDrag + ' ／ ⌨ ←↑↓→ · Shift', win: D.win, bossWin: D.bossWin, timeUp: D.timeUp, hit: D.hit,
  tOk: D.ok, tNg: D.tNg, appRes: D.appRes, appBtn: D.appBtn, shareH: D.shareH, shareNote: D.shareNote,
  xs: '𝕏 ' + D.share, copy: D.copy, close: D.close, copied: D.copied, selected: D.selected, worldCta: D.worldCta,
  ready: D.ready, unnamed: D.unnamed, anon: D.anon, ctaB: D.ctaB, ctaP: D.appRes, ctaA: D.ctaA, lockH: D.lockH + ' ' + [D.ty_ring, D.ty_aim, D.ty_rain].join(' · '),
  lockModalH: D.lockModalH, lockModalP: D.appRes, later: D.later, tag: D.tag, langLabel: D.langLabel,
  em: (n) => f('em', n), survFor: (d) => f('survFor', d), bossFor: (h, d) => f('bossFor', h, d), secs: (n) => f('secs', n),
  wBoss: (t) => f('wBoss', t), wSurv: (d) => f('wSurv', d), lTime: (h) => f('lTime', h), lHit: (t) => f('lHit', t),
  phaseB: (n) => f('phaseB', n), test_: D.test + ': ',
  xText: (n, url) => f('xText', n, url),
  samples: [[D.s1, D.sampleBy], [D.s2, D.sampleBy], [D.s3, D.sampleBy], [D.s5, D.sampleBy], [D.s4, D.sampleBy]],
};

const W = 360, H = 540;
const PAL = ['#ff6b9d', '#5ce1e6', '#ffd166', '#b28dff', '#7cf29c'];
const TK = ['ring', 'spiral', 'aim', 'rain', 'sweep'];   // 共有コードの並び（変えない）
const FREE = ['ring', 'aim', 'rain'];                     // お試し版のステージ作りで使えるもの
const LOCKED = ['swirl', 'homing', 'flower', 'star', 'heart', 'sweepLaser', 'mine', 'meteor', 'gravity', 'snake', 'maker'].map((k) => D['lk_' + k]);
const DEF = { ring: { i: 1, c: 16, v: 2, r: 6 }, spiral: { i: .1, c: 3, v: 2, r: 11 }, aim: { i: .8, c: 5, v: 3, r: 40 }, rain: { i: .25, c: 2, v: 2, r: 0 }, sweep: { i: .15, c: 5, v: 2.5, r: 60 } };
const $ = (id) => document.getElementById(id);

const SAMPLES = [
  { id: 's1', d: 20, e: [{ t: 'spiral', x: .5, y: .25, s: 0, e: 20, i: .12, c: 3, v: 1.8, r: 11, k: 1 }] },
  { id: 's2', d: 20, e: [{ t: 'rain', x: .5, y: 0, s: 0, e: 20, i: .18, c: 2, v: 2.2, r: 0, k: 1 }, { t: 'aim', x: .5, y: .15, s: 5, e: 20, i: 1.5, c: 3, v: 2.5, r: 30, k: 2 }] },
  { id: 's3', d: 20, e: [{ t: 'aim', x: .2, y: .15, s: 0, e: 20, i: .9, c: 5, v: 3, r: 40, k: 0 }, { t: 'aim', x: .8, y: .15, s: .45, e: 20, i: .9, c: 5, v: 3, r: 40, k: 3 }] },
  { id: 's5', m: 'boss', h: 400, mv: 1, d: 60, e: [{ t: 'aim', x: .5, y: .2, s: 0, e: 30, i: .6, c: 5, v: 2.6, r: 50, k: 2, ph: 1 }, { t: 'ring', x: .5, y: .2, s: 0, e: 30, i: .55, c: 18, v: 2, r: 9, k: 0, ph: 2 }, { t: 'spiral', x: .5, y: .2, s: 0, e: 30, i: .09, c: 4, v: 2.1, r: 13, k: 3, ph: 3 }, { t: 'aim', x: .5, y: .2, s: 0, e: 30, i: 1.4, c: 3, v: 3.2, r: 20, k: 1, ph: 3 }] },
  { id: 's4', d: 20, e: [{ t: 'ring', x: .3, y: .2, s: 0, e: 20, i: .7, c: 20, v: 2.2, r: 7, k: 0 }, { t: 'ring', x: .7, y: .2, s: .35, e: 20, i: .7, c: 20, v: 2.2, r: -7, k: 2 }, { t: 'sweep', x: .5, y: .1, s: 6, e: 20, i: .2, c: 3, v: 3, r: 70, k: 1 }] },
].map((s, i) => Object.assign(s, { n: S.samples[i][0], a: S.samples[i][1] }));

/* 保存は、このブラウザの中だけ。使えない環境（プライベートなど）でも動くように */
const store = { get(k, d) { try { const v = localStorage.getItem('dm_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem('dm_' + k, JSON.stringify(v)); } catch (e) { /* 保存できなくても遊べる */ } } };
let mine = store.get('mine', []), recv = store.get('recv', []), stats = store.get('stats', {});

function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const r2 = (n) => Math.round(n * 100) / 100;
const clamp = (v, a, b) => Math.min(b, Math.max(a, Number(v) || 0));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function mkEm(t) { const d = DEF[t]; return { t, x: .5, y: .2, s: 0, e: draft ? draft.d : 30, i: d.i, c: d.c, v: d.v, r: d.r, k: 0, ph: 0 }; }
const DURS = { survive: [10, 20, 30, 45, 60, 90, 120], boss: [30, 60, 90, 120, 180] };
function sanitize(st) {
  const m = st.m === 'boss' ? 'boss' : 'survive';
  const d = DURS[m].includes(+st.d) ? +st.d : DURS[m][1];
  return { m, h: Math.round(clamp(st.h || 400, 100, 1000)), mv: Math.round(clamp(st.mv, 0, 2)), n: String(st.n || S.unnamed).slice(0, 20), a: String(st.a || S.anon).slice(0, 12), d,
    e: (st.e || []).slice(0, 8).filter((x) => S.ty[x.t]).map((x) => ({ t: x.t, x: clamp(x.x, 0, 1), y: clamp(x.y, 0, .6), s: clamp(x.s, 0, 180), e: clamp(x.e, 0, 180), i: clamp(x.i, .05, 2), c: Math.round(clamp(x.c, 1, 36)), v: clamp(x.v, 1, 5), r: clamp(x.r, -90, 90), k: Math.round(clamp(x.k, 0, 4)), ph: Math.round(clamp(x.ph, 0, 3)) })) };
}
function enc(st) {
  const o = { m: st.m === 'boss' ? 1 : 0, h: st.h, mv: st.mv, n: st.n, a: st.a, d: st.d, e: st.e.map((m) => [TK.indexOf(m.t), r2(m.x), r2(m.y), r2(m.s), r2(m.e), r2(m.i), m.c, r2(m.v), Math.round(m.r), m.k, m.ph || 0]) };
  return 'DM1-' + btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function dec(code) {
  code = String(code).trim(); const at = code.indexOf('DM1-'); if (at < 0) throw new Error('fmt'); code = code.slice(at).split(/[\s&]/)[0];
  let b = code.slice(4).replace(/-/g, '+').replace(/_/g, '/'); while (b.length % 4) b += '=';
  const o = JSON.parse(decodeURIComponent(escape(atob(b))));
  const st = sanitize({ m: o.m ? 'boss' : 'survive', h: o.h, mv: o.mv, n: o.n, a: o.a, d: o.d, e: (o.e || []).map((a) => ({ t: TK[a[0]], x: a[1], y: a[2], s: a[3], e: a[4], i: a[5], c: a[6], v: a[7], r: a[8], k: a[9], ph: a[10] || 0 })) });
  if (!st.e.length) throw new Error('empty');
  st.id = 'c' + hash(enc(st)); return st;
}
const linkOf = (code) => SELF + '#' + code;

/* ---------- 文言を入れる（HTML は骨だけ） ---------- */
document.querySelectorAll('[data-t]').forEach((el) => { if (typeof S[el.dataset.t] === 'string') el.textContent = S[el.dataset.t]; });
/* 画面の部品にだけ、選んだ言語を付ける（読み上げ・翻訳機能のため）。説明文は頁の言語のまま */
document.querySelectorAll('[data-ui]').forEach((el) => { el.lang = LANG; });
const pick = $('lang-pick');
if (pick) {
  pick.innerHTML = Object.keys(LANG_NAMES).map((l) => `<option value="${l}"${l === LANG ? ' selected' : ''}>${LANG_NAMES[l]}</option>`).join('');
  pick.setAttribute('aria-label', S.langLabel);
  pick.addEventListener('change', () => {
    try { localStorage.setItem('dm_lang', pick.value); } catch (e) { /* 保存できなくても、下の URL で切り替わる */ }
    const u = new URL(location.href); u.searchParams.set('lang', pick.value); location.href = u.toString();
  });
}
document.querySelectorAll('[data-ph]').forEach((el) => { el.placeholder = S[el.dataset.ph]; });
document.querySelectorAll('a[data-app]').forEach((a) => { a.href = APP; });
$('lock-list').innerHTML = LOCKED.map((n) => `<button type="button" data-lock="1">🔒 ${esc(n)}</button>`).join('');
document.addEventListener('click', (e) => { if (e.target.closest('[data-lock]')) $('cta-modal').hidden = false; });
$('cta-close').onclick = () => { $('cta-modal').hidden = true; };

/* ---------- 画面 ---------- */
function show(id) { for (const s of ['home', 'edit']) $(s).hidden = s !== id; $('play').hidden = id !== 'play'; document.body.classList.toggle('playing', id === 'play'); if (id !== 'play') window.scrollTo(0, 0); }
function card(st, kind) {
  const s = stats[st.id] || { t: 0, c: 0 }, rate = s.t ? Math.round(s.c / s.t * 100) + '%' : '—';
  const acts = kind === 'mine' ? `<div class="acts"><button class="btn small" data-act="edit" data-id="${st.id}">${S.edit}</button><button class="btn small" data-act="code" data-id="${st.id}">${S.code}</button></div>`
    : kind === 'recv' ? `<div class="acts"><button class="btn small" data-act="code" data-id="${st.id}">${S.code}</button></div>` : '';
  return `<div class="stage" role="button" tabindex="0" data-act="play" data-id="${st.id}">
    <div><div class="nm">${esc(st.n)}</div><div class="by">${st.m === 'boss' ? `<span class="badge boss">${S.boss}</span>${S.bossFor(st.h, st.d)}` : `<span class="badge surv">${S.surv}</span>${S.survFor(st.d)}`}${SEP}${S.by} ${esc(st.a)}</div></div>
    <div class="rate">${rate}<small>${S.rate}</small></div>
    <div class="meta"><span>${S.tries} <b>${s.t}</b></span><span>${S.clears} <b>${s.c}</b></span></div>${acts}</div>`;
}
function renderHome() {
  $('list-sample').innerHTML = SAMPLES.map((s) => card(s, 'sample')).join('');
  $('list-recv').innerHTML = recv.length ? recv.map((s) => card(s, 'recv')).join('') : `<div class="empty">${S.emptyRecv}</div>`;
  $('list-mine').innerHTML = mine.length ? mine.map((s) => card(s, 'mine')).join('') : `<div class="empty">${S.emptyMine}</div>`;
}
const findStage = (id) => SAMPLES.find((s) => s.id === id) || mine.find((s) => s.id === id) || recv.find((s) => s.id === id);
$('home').addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const st = findStage(el.dataset.id); if (!st) return; e.stopPropagation();
  if (el.dataset.act === 'play') startGame(st, 'play');
  else if (el.dataset.act === 'edit') openEditor(st);
  else if (el.dataset.act === 'code') openModal(enc(st), st);
});
$('home').addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('stage')) { e.preventDefault(); e.target.click(); } });
function receive(code) {
  const st = dec(code);
  if (!recv.find((s) => s.id === st.id) && !mine.find((s) => s.id === st.id)) { recv.unshift(st); recv = recv.slice(0, 30); store.set('recv', recv); }
  renderHome(); return st;
}
$('code-play').onclick = () => {
  const err = $('code-err'); err.hidden = true;
  try { const st = receive($('code-in').value); $('code-in').value = ''; startGame(st, 'play'); } catch (x) { err.textContent = S.codeErr; err.hidden = false; }
};
$('new-btn').onclick = () => openEditor(null);

/* ---------- エディタ ---------- */
let draft = null;
function openEditor(st) {
  draft = st ? JSON.parse(JSON.stringify(st)) : { id: null, m: 'survive', h: 400, mv: 1, n: '', a: store.get('author', ''), d: 20, e: [mkEm('ring')] };
  draft.m = draft.m || 'survive'; draft.h = draft.h || 400; draft.mv = draft.mv ?? 1; draft.verified = false;
  $('ed-name').value = draft.n; $('ed-author').value = draft.a; $('ed-mv').value = draft.mv; $('ed-hp').value = draft.h;
  renderMode(); updStatus(); show('edit');
}
function renderMode() {
  const b = draft.m === 'boss';
  $('ed-mode-s').checked = !b; $('ed-mode-b').checked = b;
  if (!DURS[draft.m].includes(draft.d)) draft.d = DURS[draft.m][1];
  $('ed-dur').innerHTML = DURS[draft.m].map((v) => `<option value="${v}"${v === draft.d ? ' selected' : ''}>${S.secs(v)}</option>`).join('');
  $('ed-dur-l').textContent = b ? S.durB : S.dur;
  $('ed-mv-f').hidden = !b; $('ed-hp-f').hidden = !b; $('ed-boss-note').hidden = !b;
  $('ed-hp-o').textContent = draft.h;
  renderEms();
}
const SLIDERS = [['x', 0, 1, .05, (v) => Math.round(v * 100) + '%'], ['y', 0, .6, .05, (v) => Math.round(v * 100) + '%'], ['s', 0, 180, .5, (v) => S.secs(v)], ['e', 0, 180, .5, (v) => +v >= draft.d ? S.toEnd : S.secs(v)], ['i', .05, 2, .05, (v) => (+v).toFixed(2) + 's'], ['c', 1, 36, 1, (v) => v], ['v', 1, 5, .25, (v) => (+v).toFixed(2)], ['r', -90, 90, 1, (v) => v + '°']];
function renderEms() {
  /* 編集中の発射台が、お試し版で作れないパターン（受け取ったサンプルを開いた時など）なら、選べる中の近いものに替える */
  for (const m of draft.e) if (!FREE.includes(m.t)) Object.assign(m, { t: 'ring' }, DEF.ring);
  $('ed-ems').innerHTML = draft.e.map((m, i) => `<div class="em" data-i="${i}">
    <div class="em-head"><span class="tag">${S.em(i + 1)}</span>${draft.e.length > 1 ? `<button class="btn small" data-del="${i}">${S.del}</button>` : ''}</div>
    <canvas class="pv" aria-label="${S.ty[m.t]}"></canvas>
    <div class="grid2">
      <div class="field"><label for="em${i}-t">${S.pat}</label><select id="em${i}-t" data-k="t">${FREE.map((t) => `<option value="${t}"${t === m.t ? ' selected' : ''}>${S.ty[t]}</option>`).join('')}<option value="__app">🔒 ${S.moreOpt}</option></select></div>
      <div class="field"><label>${S.color}</label><div class="sw">${PAL.map((c, j) => `<input type="radio" name="em${i}-k" id="em${i}-k${j}" data-k="k" value="${j}" aria-label="${S.color} ${j + 1}" style="background:${c}"${j === m.k ? ' checked' : ''}>`).join('')}</div></div>
    </div>
    ${draft.m === 'boss' ? `<div class="field"><label for="em${i}-ph">${S.phase}</label><select id="em${i}-ph" data-k="ph">${S.phases.map((p, j) => `<option value="${j}"${j === m.ph ? ' selected' : ''}>${p}</option>`).join('')}</select></div>` : ''}
    ${SLIDERS.filter((s) => draft.m !== 'boss' || !['x', 'y', 's', 'e'].includes(s[0])).map(([k, mn, mx, st, f]) => `<div class="sl"><span>${k === 'r' ? S.rl[m.t] : S.sl[k]}</span><input type="range" id="em${i}-${k}" data-k="${k}" min="${mn}" max="${k === 's' || k === 'e' ? draft.d : mx}" step="${st}" value="${k === 'e' ? Math.min(m[k], draft.d) : m[k]}"${(m.t === 'rain' && (k === 'x' || k === 'y' || k === 'r')) ? ' disabled' : ''}><output>${f(m[k])}</output></div>`).join('')}
  </div>`).join('');
  $('ed-add').disabled = draft.e.length >= 8;
  setupPreviews();
}
$('ed-ems').addEventListener('input', (e) => {
  const el = e.target, cd = el.closest('.em'); if (!cd || !el.dataset.k) return;
  const m = draft.e[+cd.dataset.i], k = el.dataset.k;
  if (k === 't') {
    if (el.value === '__app') { el.value = m.t; $('cta-modal').hidden = false; return; }
    Object.assign(m, { t: el.value }, DEF[el.value]); renderEms();
  } else { m[k] = +el.value; const o = el.nextElementSibling; if (o && o.tagName === 'OUTPUT') o.textContent = SLIDERS.find((s) => s[0] === k)[4](el.value); }
  invalidate();
});
$('ed-ems').addEventListener('click', (e) => { const b = e.target.closest('[data-del]'); if (!b) return; draft.e.splice(+b.dataset.del, 1); renderEms(); invalidate(); });
$('ed-add').onclick = () => { if (draft.e.length < 8) { draft.e.push(mkEm('aim')); renderEms(); invalidate(); } };
document.querySelectorAll('input[name=ed-mode]').forEach((r) => r.addEventListener('change', () => { draft.m = r.value; renderMode(); invalidate(); }));
$('ed-mv').addEventListener('change', () => { draft.mv = +$('ed-mv').value; invalidate(); });
$('ed-hp').addEventListener('input', () => { draft.h = +$('ed-hp').value; $('ed-hp-o').textContent = draft.h; invalidate(); });
for (const id of ['ed-name', 'ed-author', 'ed-dur']) $(id).addEventListener('input', () => {
  draft.n = $('ed-name').value; draft.a = $('ed-author').value;
  if (+$('ed-dur').value !== draft.d) { const o = draft.d, n = +$('ed-dur').value; for (const m of draft.e) if (m.e >= o) m.e = n; draft.d = n; renderEms(); invalidate(); }
});
function invalidate() { draft.verified = false; updStatus(); }
function updStatus() {
  const s = $('ed-status');
  if (draft.verified) { s.className = 'status ok'; s.textContent = S.ok; } else { s.className = 'status'; s.textContent = S.need; }
  $('ed-post').disabled = !draft.verified;
}
$('ed-test').onclick = () => { draft.n = $('ed-name').value; draft.a = $('ed-author').value; startGame(sanitize(draft), 'test'); };
$('ed-back').onclick = () => { renderHome(); show('home'); };
$('ed-post').onclick = () => {
  const st = sanitize({ ...draft, n: $('ed-name').value, a: $('ed-author').value });
  const code = enc(st); st.id = draft.id || ('m' + hash(code));
  store.set('author', st.a);
  const idx = mine.findIndex((s) => s.id === st.id); if (idx >= 0) mine[idx] = st; else mine.unshift(st);
  store.set('mine', mine); renderHome(); show('home'); openModal(code, st);
};

/* ---------- 共有 ---------- */
function openModal(code, st) {
  const url = linkOf(code);
  $('m-code').value = url; $('m-msg').textContent = '';
  const text = S.xText(st ? st.n : S.unnamed, url);
  $('m-x').href = 'https://x.com/intent/post?text=' + encodeURIComponent(text);
  $('modal').hidden = false;
}
$('m-close').onclick = () => { $('modal').hidden = true; };
$('m-copy').onclick = () => {
  const t = $('m-code');
  const fb = () => { t.focus(); t.select(); $('m-msg').textContent = S.selected; };
  try { navigator.clipboard.writeText(t.value).then(() => { $('m-msg').textContent = S.copied; }, fb); } catch (e) { fb(); }
};

/* ---------- ゲーム ---------- */
const cv = $('cv'), ctx = cv.getContext('2d'); let dpr = 1, game = null, raf = 0, last = 0, drag = null;
const stars = Array.from({ length: 70 }, (_, i) => { const r = mulberry(i + 7); return { x: r() * W, y: r() * H, s: r() * 1.4 + .3, v: r() * 30 + 10 }; });
function resize() {
  dpr = Math.min(window.devicePixelRatio || 1, 2); cv.width = W * dpr; cv.height = H * dpr;
  const b = $('stagebox'), s = Math.min(b.clientWidth / W, b.clientHeight / H) * .98;
  cv.style.width = Math.floor(W * s) + 'px'; cv.style.height = Math.floor(H * s) + 'px';
}
window.addEventListener('resize', () => { if (game) resize(); });
function startGame(stage, mode) {
  cancelAnimationFrame(raf);
  game = { stage, mode, t: -1.2, bullets: [], p: { x: W / 2, y: H * .85 }, em: stage.e.map((m) => ({ m, next: m.s, shot: 0 })), over: null, hp: stage.h || 0, phase: 1, banner: 0, shots: [], cd: 0, flash: 0, keys: {}, rng: mulberry(hash(JSON.stringify(stage.e))) };
  $('p-title').textContent = (mode === 'test' ? S.test_ : '') + stage.n; $('result').hidden = true;
  show('play'); resize();
  if (mode === 'play') { const s = stats[stage.id] || (stats[stage.id] = { t: 0, c: 0 }); s.t++; store.set('stats', stats); }
  last = performance.now(); raf = requestAnimationFrame(loop);
}
function loop(now) {
  const g = game; if (!g) return;
  let dt = Math.min(.05, (now - last) / 1000); last = now;
  while (dt > 0 && !g.over) { const h = Math.min(dt, 1 / 120); step(h); dt -= h; }
  draw(); if (!g.over) raf = requestAnimationFrame(loop);
}
function emit(m, k, cx, cy, px, py, rng, out) {
  const sp = m.v * 60, col = PAL[m.k], n = Math.max(1, m.c), deg = Math.PI / 180;
  const add = (x, y, a) => { if (out.length < 1600) out.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, col }); };
  switch (m.t) {
    case 'ring': case 'spiral': for (let j = 0; j < n; j++) add(cx, cy, j * 2 * Math.PI / n + k * m.r * deg); break;
    case 'aim': { const b = Math.atan2(py - cy, px - cx); for (let j = 0; j < n; j++) add(cx, cy, b + (n > 1 ? (j / (n - 1) - .5) * m.r * deg : 0)); break; }
    case 'rain': for (let j = 0; j < n; j++) add(rng() * W, -8, Math.PI / 2 + (rng() - .5) * .3); break;
    case 'sweep': { const b = Math.PI / 2 + Math.sin(k * .25) * m.r * deg; for (let j = 0; j < n; j++) add(cx, cy, b + (n > 1 ? (j / (n - 1) - .5) * .5 : 0)); break; }
  }
}
const MV = [[0, 0], [.25, .6], [.32, 1.3]];
function bossPos(g) { const [a, w] = MV[g.stage.mv || 0]; return { x: W * (.5 + a * Math.sin(Math.max(0, g.t) * w)), y: H * .18 }; }
function phaseOf(g) { const r = g.hp / g.stage.h; return r > 2 / 3 ? 1 : r > 1 / 3 ? 2 : 3; }
function step(dt) {
  const g = game, p = g.p, K = g.keys, boss = g.stage.m === 'boss'; g.t += dt;
  const sp = (K.Shift ? 90 : 210) * dt;
  if (K.ArrowLeft || K.a) p.x -= sp; if (K.ArrowRight || K.d) p.x += sp; if (K.ArrowUp || K.w) p.y -= sp; if (K.ArrowDown || K.s) p.y += sp;
  p.x = clamp(p.x, 6, W - 6); p.y = clamp(p.y, 6, H - 6);
  const bp = boss ? bossPos(g) : null;
  if (boss) {
    const ph = phaseOf(g); if (ph !== g.phase) { g.phase = ph; if (ph > 1) { g.bullets.length = 0; g.banner = 1.2; } }
    if (g.banner > 0) g.banner -= dt;
    g.cd -= dt; if (g.t >= 0 && g.cd <= 0) { g.cd = .09; g.shots.push({ x: p.x - 5, y: p.y - 10 }, { x: p.x + 5, y: p.y - 10 }); }
    let w = 0; for (const s of g.shots) { s.y -= 600 * dt; if (s.y < -10) continue; const dx = s.x - bp.x, dy = s.y - bp.y; if (dx * dx + dy * dy < 24 * 24) { g.hp--; g.flash = .06; continue; } g.shots[w++] = s; } g.shots.length = w;
    if (g.flash > 0) g.flash -= dt;
    if (g.hp <= 0) { finish(true); return; }
  }
  if (g.t >= 0) for (const E of g.em) {
    const m = E.m;
    if (boss) {
      if (!(m.ph === 0 || m.ph === g.phase) || g.banner > 0) { E.next = g.t; continue; }
      while (g.t >= E.next) { emit(m, E.shot, m.t === 'rain' ? 0 : bp.x, bp.y, p.x, p.y, g.rng, g.bullets); E.shot++; E.next += Math.max(.05, m.i); }
    } else {
      const end = Math.min(m.e, g.stage.d);
      while (g.t >= E.next && E.next < end) { emit(m, E.shot, m.x * W, m.y * H, p.x, p.y, g.rng, g.bullets); E.shot++; E.next += Math.max(.05, m.i); }
    }
  }
  const bs = g.bullets; let w = 0;
  for (let i = 0; i < bs.length; i++) {
    const b = bs[i]; b.x += b.vx * dt; b.y += b.vy * dt;
    if (b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) continue;
    const dx = b.x - p.x, dy = b.y - p.y; if (dx * dx + dy * dy < 30.25) { finish(false); return; }
    bs[w++] = b;
  }
  bs.length = w;
  if (g.t >= g.stage.d) finish(!boss, boss ? 'time' : null);
}
function finish(win, why) {
  const g = game; g.over = win ? 'win' : 'lose'; const boss = g.stage.m === 'boss';
  if (g.mode === 'play' && win) { stats[g.stage.id].c++; store.set('stats', stats); }
  if (g.mode === 'test' && win) { draft.verified = true; updStatus(); }
  $('r-big').textContent = win ? (boss ? S.bossWin : S.win) : (why === 'time' ? S.timeUp : S.hit); $('r-big').className = 'big ' + (win ? 'win' : 'lose');
  const tt = Math.max(0, g.t).toFixed(1);
  $('r-msg').textContent = g.mode === 'test' ? (win ? S.tOk : S.tNg)
    : win ? (boss ? S.wBoss(tt) : S.wSurv(g.stage.d)) : why === 'time' ? S.lTime(g.hp) : S.lHit(tt);
  /* アプリへの案内は、遊び終わった時に一度だけ、控えめに */
  $('r-app').hidden = g.mode === 'test';
  $('result').hidden = false;
}
function drawBullets(c, bs) { for (const b of bs) { c.fillStyle = b.col; c.beginPath(); c.arc(b.x, b.y, 6, 0, 7); c.fill(); } c.fillStyle = '#fff'; for (const b of bs) { c.beginPath(); c.arc(b.x, b.y, 3, 0, 7); c.fill(); } }
function drawBoss(c, x, y, flash) {
  c.save(); c.translate(x, y); c.fillStyle = flash ? '#fff' : '#ff6b9d'; c.beginPath();
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6, r = i % 2 ? 14 : 22; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill();
  c.fillStyle = '#0a0818'; c.beginPath(); c.arc(0, 0, 7, 0, 7); c.fill(); c.restore();
}
function drawShip(c, x, y) { c.fillStyle = '#5ce1e6'; c.beginPath(); c.moveTo(x, y - 11); c.lineTo(x + 8, y + 8); c.lineTo(x, y + 4); c.lineTo(x - 8, y + 8); c.closePath(); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y, 2.5, 0, 7); c.fill(); }
function draw() {
  const g = game, boss = g.stage.m === 'boss'; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.fillStyle = '#0a0818'; ctx.fillRect(0, 0, W, H);
  const tt = performance.now() / 1000;
  ctx.fillStyle = '#3a3270'; for (const s of stars) ctx.fillRect(s.x, (s.y + tt * s.v) % H, s.s, s.s);
  if (boss) { const bp = bossPos(g); drawBoss(ctx, bp.x, bp.y, g.flash > 0); ctx.fillStyle = '#ffd166'; for (const s of g.shots) ctx.fillRect(s.x - 1.5, s.y - 6, 3, 10); }
  else {
    for (const E of g.em) {
      if (E.m.t === 'rain') continue; const st = E.m.s, en = Math.min(E.m.e, g.stage.d), lead = st - g.t;
      if (g.t >= en || lead > .6) continue;
      ctx.globalAlpha = lead > 0 ? (Math.floor(lead * 10) % 2 ? .15 : .7) : .35; ctx.strokeStyle = PAL[E.m.k]; const x = E.m.x * W, y = E.m.y * H; ctx.beginPath(); ctx.moveTo(x, y - 7); ctx.lineTo(x + 7, y); ctx.lineTo(x, y + 7); ctx.lineTo(x - 7, y); ctx.closePath(); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  drawShip(ctx, g.p.x, g.p.y);
  drawBullets(ctx, g.bullets);
  ctx.fillStyle = '#332b62'; ctx.fillRect(0, 0, W, 5);
  if (boss) { ctx.fillStyle = '#ff6b9d'; ctx.fillRect(0, 0, W * Math.max(0, g.hp) / g.stage.h, 5); ctx.fillStyle = '#0a0818'; ctx.fillRect(W / 3 - 1, 0, 2, 5); ctx.fillRect(W * 2 / 3 - 1, 0, 2, 5); }
  else { ctx.fillStyle = '#ffd166'; ctx.fillRect(0, 0, W * clamp(g.t / g.stage.d, 0, 1), 5); }
  ctx.textAlign = 'center'; ctx.font = '28px ui-monospace,Menlo,monospace'; ctx.fillStyle = '#efeaff';
  if (g.t < 0) ctx.fillText(S.ready, W / 2, H / 2);
  else if (boss && g.banner > 0) { ctx.fillStyle = '#ffd166'; ctx.fillText(S.phaseB(g.phase), W / 2, H / 2); }
  $('p-time').textContent = Math.max(0, g.stage.d - Math.max(0, g.t)).toFixed(1);
}
/* ---------- エディタの見本：発射台ごとに、自分のパターンを繰り返し流す ---------- */
const PH = 330; let pv = [], pvRaf = 0, pvLast = 0;
function setupPreviews() {
  pv = [...document.querySelectorAll('#ed-ems canvas.pv')].map((c, i) => ({ c, i, b: [], t: 0, next: 0, shot: 0, rng: mulberry(i + 1) }));
  cancelAnimationFrame(pvRaf); pvLast = performance.now(); if (pv.length) pvRaf = requestAnimationFrame(pvLoop);
}
function pvLoop(now) {
  if ($('edit').hidden) { pvRaf = 0; return; }
  const dt = Math.min(.05, (now - pvLast) / 1000); pvLast = now;
  const r = Math.min(window.devicePixelRatio || 1, 2);
  for (const P of pv) {
    const m = draft.e[P.i]; if (!m) continue;
    const boss = draft.m === 'boss'; P.t += dt;
    const px = W / 2 + Math.sin(P.t * .9) * 90, py = PH - 40;
    const cx = boss ? W / 2 : m.x * W, cy = boss ? H * .18 : m.y * H;
    while (P.t >= P.next) { emit(m, P.shot, cx, cy, px, py, P.rng, P.b); P.shot++; P.next += Math.max(.05, m.i); }
    let w = 0; for (const b of P.b) { b.x += b.vx * dt; b.y += b.vy * dt; if (b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > PH + 20) continue; P.b[w++] = b; } P.b.length = w;
    const c = P.c, cw = c.clientWidth; if (!cw) continue;
    if (c.width !== Math.round(cw * r)) { c.width = Math.round(cw * r); c.height = Math.round(cw * PH / W * r); }
    const x = c.getContext('2d'), s = c.width / W; x.setTransform(s, 0, 0, s, 0, 0);
    x.fillStyle = '#0a0818'; x.fillRect(0, 0, W, PH);
    if (boss) drawBoss(x, cx, cy, false);
    else if (m.t !== 'rain') { x.strokeStyle = PAL[m.k]; x.lineWidth = 2; x.beginPath(); x.moveTo(cx, cy - 8); x.lineTo(cx + 8, cy); x.lineTo(cx, cy + 8); x.lineTo(cx - 8, cy); x.closePath(); x.stroke(); }
    drawShip(x, px, py); drawBullets(x, P.b);
  }
  pvRaf = requestAnimationFrame(pvLoop);
}
cv.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY }; try { cv.setPointerCapture(e.pointerId); } catch (x) { /* 古いブラウザ */ } });
$('stagebox').addEventListener('pointerdown', (e) => { if (e.target === $('stagebox')) drag = { x: e.clientX, y: e.clientY }; });
window.addEventListener('pointermove', (e) => { if (!drag || !game || game.over) return; const r = cv.getBoundingClientRect(), f = W / r.width; game.p.x += (e.clientX - drag.x) * f * 1.2; game.p.y += (e.clientY - drag.y) * f * 1.2; drag = { x: e.clientX, y: e.clientY }; });
for (const ev of ['pointerup', 'pointercancel']) window.addEventListener(ev, () => { drag = null; });
const KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Shift', 'a', 'd', 'w', 's'];
window.addEventListener('keydown', (e) => { if (game && !$('play').hidden && KEYS.includes(e.key)) { game.keys[e.key] = true; e.preventDefault(); } });
window.addEventListener('keyup', (e) => { if (game) game.keys[e.key] = false; });
function leave() { const g = game; cancelAnimationFrame(raf); game = null; if (g && g.mode === 'test') { show('edit'); setupPreviews(); } else { renderHome(); show('home'); } }
$('p-quit').onclick = leave; $('r-back').onclick = leave;
$('r-retry').onclick = () => { const g = game; startGame(g.stage, g.mode); };

renderHome();
/* リンク（#DM1-…）で来たら、そのステージをすぐ遊べる状態にする（勝手に始めない。押してから） */
if (/#DM1-/.test(location.hash)) {
  try { const st = receive(location.hash.slice(1)); history.replaceState(null, '', SELF); $('code-in').value = ''; setTimeout(() => { const el = document.querySelector(`[data-id="${st.id}"]`); if (el) { el.scrollIntoView({ block: 'center' }); el.focus(); } }, 50); }
  catch (e) { $('code-err').textContent = S.codeErr; $('code-err').hidden = false; }
}
})();
