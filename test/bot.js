// In-page bot: plays a generated room to the exit with two strategies and reports moves and clock time.
window.BOT = (() => {
  const D = __dg, S = D.S, g = S.game;
  const sim = (sec, until) => { const n = Math.ceil(sec * 60); for (let i = 0; i < n; i++) { D.step(1 / 60, true); if (until && until()) return true; } return until ? until() : true; };
  const sleepers = () => (S.room.sl || []).filter((o) => o.asleep());
  const wallZ = () => (S.room.wall && S.room.wall.alive ? S.room.wall.pos.z : -99);
  const idle = () => sim(4, () => S.kid.state === 'idle');
  const go = (x, z) => { const k = S.kid; if (Math.hypot(k.x - x, k.z - z) < 0.25) return; k.cmdTap(null, { x, z }); idle(); };
  const reach = (p) => 4.2 + 4.6 * p;
  const exitProp = () => S.props.find((p) => ['door', 'glassdoor', 'steeldoor', 'vault'].includes(p.name));
  const boxDist = (p, x, z) => Math.hypot(Math.max(Math.abs(x - p.pos.x) - p.hx, 0), Math.max(Math.abs(z - p.pos.z) - p.hz, 0));
  let c0 = 0;
  const dead = () => g.caught > c0 || g.mode !== 'play';
  const done = () => g.exitOpen;
  const scream = (p) => { const k = S.kid; if (k.startCharge()) { k.chargeT = p * 0.8; k.release(); } sim(1.3, () => dead() || done()); idle(); };
  const mode = () => S.room.def.swipe;
  function throwAt(tx, ty, tz, what) {
    if (mode() === 'charge' || mode() === 'pull') return false;
    const k = S.kid, wz = wallZ(); let b = null, bd = 1e9;
    for (const p of S.props) {
      if (!p.alive || !p.throwable || p.pos.z <= wz) continue;
      if (what === 'tnt' ? p.name !== 'tnt' : (p.name === 'tnt' || (p.name === 'barrel' && p.o.color === 0xd92b2b))) continue;
      const d = Math.hypot(p.pos.x - k.x, p.pos.z - k.z); if (d < bd) { bd = d; b = p; }
    }
    if (!b) return false;
    const a = D.pt(k.x, 1.85, k.z), s = D.pt(tx, ty, tz), dx = s[0] - a[0], dy = s[1] - a[1], d = Math.hypot(dx, dy) || 1;
    k.cmdThrow(b, { x: dx / d, y: dy / d, power: 1 });
    return true;
  }
  // a spot to scream from that reaches the target but no sleeping guard
  function quietSpot(target) {
    const wz = wallZ(), k = S.kid; let best = null;
    for (const p of [0.25, 0.5, 0.75, 1]) {
      const R = reach(p);
      for (let x = -3.2; x <= 3.21; x += 0.4) for (let z = Math.max(wz + 0.6, -3.2); z <= 3.31; z += 0.4) {
        if (boxDist(target, x, z) > R - 0.25) continue;
        if (sleepers().some((o) => Math.hypot(o.x - x, o.z - z) < R + 0.2)) continue;
        if (S.props.some((q) => q.alive && q.name === 'mic' && Math.hypot(q.pos.x - x, q.pos.z - z) < R + 0.2) && S.props.some((q) => q.alive && q.name === 'speaker' && sleepers().some((o) => Math.hypot(o.x - q.pos.x, o.z - q.pos.z) < 3.6))) continue;
        const d = Math.hypot(x - k.x, z - k.z);
        if (!best || d < best.d) best = { x, z, p, d };
      }
      if (best) return best;
    }
    return null;
  }
  function koAll(filter) {
    for (let n = 0; n < 14; n++) {
      if (dead() || done()) return;
      const wz = wallZ();
      const t = sleepers().filter((o) => o.z > wz && (!filter || filter(o)))[0];
      if (!t) return;
      sim(4, () => g.noise < 25);
      if (mode() === 'pull') return;
      if (mode() === 'charge') {
        const sx = t.x < 0 ? 1 : -1; go(Math.max(-3.2, Math.min(3.2, t.x + sx * 1.4)), t.z);
        const k = S.kid, dx = t.x - k.x, dz = t.z - k.z, d = Math.hypot(dx, dz) || 1, before = sleepers().length;
        k.cmdRam({ x: dx / d, y: dz / d }); sim(3, () => sleepers().length < before || dead()); idle(); continue;
      }
      const px = Math.max(-3.2, Math.min(3.2, t.x + (t.x < 0 ? 1 : -1) * (t.helmet ? 3.0 : t.shield ? 2.3 : 0.6))), pz = Math.max(wz + 0.6, Math.min(3.3, t.z + (t.helmet ? 1.3 : t.shield ? 0.15 : 2.4)));
      go(px, pz);
      const before = sleepers().length;
      if (!throwAt(t.x, 0.85, t.z, t.helmet ? 'tnt' : '')) { sim(1.6); continue; }
      sim(3, () => sleepers().length < before || dead()); idle();
    }
  }
  function play(i, smart) {
    D.startGame(i); S.botDriven = true;
    sim(3, () => g.lockT <= 0); g.pauseDrain = 1e9; c0 = g.caught;
    const R = S.room;
    const mic = S.props.find((p) => p.alive && p.name === 'mic');
    if (mic && !smart) { go(mic.pos.x + 0.5, mic.pos.z + 0.6); for (let k = 0; k < 4 && mic.alive; k++) { S.kid.cmdTap(mic); sim(0.5); } idle(); }
    for (const rug of (R.rugs || [])) { if (rug.done || dead()) continue; const k = S.kid, dx = rug.stand[0] - k.x, dz = rug.stand[1] - k.z, d = Math.hypot(dx, dz) || 1; k.cmdPull({ x: dx / d, y: dz / d }); sim(4, () => rug.done); idle(); sim(0.4); }
    if (!smart) for (const pl of S.props.filter((p) => p.name === 'plank')) { if (!pl.alive || dead()) continue; S.kid.cmdTap(pl); sim(4, () => !pl.alive); idle(); sim(0.3); }
    if (!smart) koAll();
    if (R.wall && R.wall.alive) {
      let q = quietSpot(R.wall);
      if (!q) { koAll(); q = quietSpot(R.wall); }
      if (!q) return { ok: false, why: 'wall' };
      for (let n = 0; n < 3 && R.wall.alive && !dead(); n++) { go(q.x, q.z); scream(q.p); sim(2, () => !R.wall.alive || dead()); }
      if (dead()) return { ok: false, why: 'caught-wall' };
    }
    for (let n = 0; n < 16 && !done(); n++) {
      if (dead()) return { ok: false, why: 'caught-exit' };
      const ex = exitProp(); if (!ex) break;
      if (ex.name === 'glassdoor') {
        let q = quietSpot(ex); if (!q) { koAll(); q = quietSpot(ex); }
        if (!q) return { ok: false, why: 'glass' };
        go(q.x, q.z); scream(q.p); sim(2, () => done() || dead());
      } else if (ex.name === 'door') {
        const tnt = S.props.find((p) => p.alive && p.name === 'tnt' && p.pos.z > wallZ());
        if (smart && tnt && !sleepers().some((o) => Math.hypot(o.x, o.z + 3.3) > 3.2)) { go(0.5, 2.3); throwAt(0, 1.35, -3.6, 'tnt'); sim(2.5, () => done() || dead()); idle(); }
        else if (mode() === 'charge') { koAll(); go(0, -1.9); S.kid.cmdRam({ x: 0, y: -1 }); sim(3, () => done() || dead()); idle(); }
        else { koAll(); go(0, -2.6); for (let k = 0; k < 8 && !done() && !dead(); k++) { S.kid.cmdTap(ex); sim(0.3); } }
      } else {
        koAll((o) => Math.hypot(o.x, o.z + 3.3) > 3.2);          // anyone the blast would not take with it
        const tnt = S.props.some((p) => p.alive && p.name === 'tnt' && p.pos.z > wallZ());
        if (tnt) { go(0.5, 2.3); throwAt(0, 1.35, -3.6, 'tnt'); sim(2.5, () => done() || dead()); idle(); }
        else {
          const cs = S.props.find((p) => p.alive && p.name === 'case');
          if (cs) { let q = quietSpot(cs); if (!q) { koAll(); q = quietSpot(cs); } if (!q) return { ok: false, why: 'case' }; go(q.x, q.z); scream(q.p); sim(1.5); }
          else sim(1.7);
        }
      }
    }
    if (!done()) return { ok: false, why: dead() ? 'caught-exit' : 'exit' };
    return { ok: true, moves: g.moves, time: +g.roomTime.toFixed(1) };
  }
  return (i) => {
    const def = D.ROOMS[i];
    const out = { code: def.code, plan: def.plan };
    // physics has some randomness, so each strategy gets up to three goes; keep the best
    const run = (smart) => { let best = null, tries = 0; for (; tries < (window.BOT_TRIES || 3); tries++) { const r = play(i, smart); if (r.ok && (!best || !best.ok || r.moves < best.moves)) best = r; else if (!best) best = r; if (r.ok && tries >= 1) break; } best.tries = tries + (best.ok ? 0 : 0); return best; };
    out.careful = run(false); out.sig = Object.assign({}, S.room.sig, { twist: def.grav < 20 ? 'lowgrav' : def.blastMul > 1 ? 'bigblast' : '', dark: !!def.dark });
    out.smart = run(true);
    return out;
  };
})();
