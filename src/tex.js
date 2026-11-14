// Procedural canvas textures (floors, wallpaper, signs, papers)
import { THREE } from './ctx.js';

export const JP = '"Dela Gothic One","Zen Kaku Gothic New","Hiragino Kaku Gothic ProN","Yu Gothic","Noto Sans JP","IPAGothic",sans-serif';
export const JPB = '"Zen Kaku Gothic New","Hiragino Kaku Gothic ProN","Yu Gothic","Noto Sans JP","IPAGothic",sans-serif';

export function ctex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  return t;
}
const speckle = (x, w, h, n, a) => {
  for (let i = 0; i < n; i++) {
    x.fillStyle = `rgba(${Math.random() < 0.5 ? '0,0,0' : '255,255,255'},${Math.random() * a})`;
    x.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 3, 1 + Math.random() * 3);
  }
};

export function floorTex(type, a, b) {
  if (type === 'wood') return ctex(512, 512, (x, w, h) => {
    x.fillStyle = a; x.fillRect(0, 0, w, h);
    const rows = 8, rh = h / rows;
    for (let r = 0; r < rows; r++) {
      let px = -Math.random() * 200;
      while (px < w) {
        const pw = 140 + Math.random() * 160;
        x.fillStyle = `rgba(${Math.random() < 0.5 ? '0,0,0' : '255,220,170'},${0.04 + Math.random() * 0.1})`;
        x.fillRect(px, r * rh, pw, rh);
        x.fillStyle = b; x.fillRect(px, r * rh, 3, rh);
        px += pw;
      }
      x.fillStyle = b; x.fillRect(0, r * rh, w, 3);
    }
    speckle(x, w, h, 500, 0.06);
  }, [2, 2]);
  if (type === 'concrete') return ctex(512, 512, (x, w, h) => {
    x.fillStyle = a; x.fillRect(0, 0, w, h);
    speckle(x, w, h, 2600, 0.09);
    x.strokeStyle = b; x.lineWidth = 4; x.strokeRect(2, 2, w - 4, h - 4);
  }, [3, 3]);
  if (type === 'carpet') return ctex(256, 256, (x, w, h) => {
    x.fillStyle = a; x.fillRect(0, 0, w, h);
    speckle(x, w, h, 4000, 0.1);
    x.strokeStyle = b; x.lineWidth = 6;
    x.beginPath(); x.moveTo(128, 20); x.lineTo(236, 128); x.lineTo(128, 236); x.lineTo(20, 128); x.closePath(); x.stroke();
  }, [5, 5]);
  if (type === 'checker') return ctex(256, 256, (x, w, h) => {
    x.fillStyle = a; x.fillRect(0, 0, w, h);
    x.fillStyle = b; x.fillRect(0, 0, w / 2, h / 2); x.fillRect(w / 2, h / 2, w / 2, h / 2);
    speckle(x, w, h, 600, 0.06);
  }, [5, 5]);
  // metal plates
  return ctex(256, 256, (x, w, h) => {
    x.fillStyle = a; x.fillRect(0, 0, w, h);
    speckle(x, w, h, 900, 0.07);
    x.strokeStyle = b; x.lineWidth = 5; x.strokeRect(3, 3, w - 6, h - 6);
    x.fillStyle = b;
    for (const [px, py] of [[18, 18], [w - 18, 18], [18, h - 18], [w - 18, h - 18]]) { x.beginPath(); x.arc(px, py, 6, 0, 7); x.fill(); }
  }, [4, 4]);
}

export function wallTex(type, a, b) {
  return ctex(256, 256, (x, w, h) => {
    x.fillStyle = a; x.fillRect(0, 0, w, h);
    x.fillStyle = b; x.strokeStyle = b;
    if (type === 'stripe') { for (let i = 0; i < 8; i++) x.fillRect(i * 32, 0, 12, h); }
    else if (type === 'block') {
      x.lineWidth = 4;
      for (let r = 0; r < 4; r++) for (let c = -1; c < 3; c++) x.strokeRect(c * 128 + (r % 2) * 64, r * 64, 128, 64);
    } else if (type === 'dots') {
      for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { x.beginPath(); x.arc(c * 32 + (r % 2) * 16 + 8, r * 32 + 16, 3.5, 0, 7); x.fill(); }
    } else if (type === 'panel') {
      x.lineWidth = 5; x.strokeRect(0, 0, w, h);
      for (const [px, py] of [[20, 20], [w - 20, 20], [20, h - 20], [w - 20, h - 20]]) { x.beginPath(); x.arc(px, py, 7, 0, 7); x.fill(); }
    }
    speckle(x, w, h, 500, 0.04);
  }, [4, 2.2]);
}

// Big sign / label. lines: [{t, s(size), c(color), f(font)}] or strings
export function label(lines, o = {}) {
  const w = o.w || 512, h = o.h || 256;
  return ctex(w, h, (x) => {
    x.fillStyle = o.bg || '#fff'; x.fillRect(0, 0, w, h);
    if (o.hazard) {
      x.save(); x.beginPath(); x.rect(0, 0, w, h); x.clip();
      for (let i = -h; i < w + h; i += 48) { x.fillStyle = '#111'; x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 24, 0); x.lineTo(i + 24 - h, h); x.lineTo(i - h, h); x.fill(); }
      x.restore();
      x.fillStyle = o.bg || '#fff'; x.fillRect(18, 18, w - 36, h - 36);
    }
    if (o.border) { x.strokeStyle = o.border; x.lineWidth = o.bw || 10; x.strokeRect(o.bw / 2 || 5, o.bw / 2 || 5, w - (o.bw || 10), h - (o.bw || 10)); }
    const L = lines.map((l) => (typeof l === 'string' ? { t: l } : l));
    const total = L.reduce((s, l) => s + (l.s || 48) * 1.25, 0);
    let y = (h - total) / 2;
    x.textAlign = 'center'; x.textBaseline = 'middle';
    for (const l of L) {
      const s = l.s || 48;
      x.font = `${l.w || 900} ${s}px ${l.f || JP}`;
      x.fillStyle = l.c || o.fg || '#111';
      x.fillText(l.t, w / 2, y + s * 0.62, w - 30);
      y += s * 1.25;
    }
  });
}

// A dense "real puzzle hint" nobody is going to read.
export function paperTex(title, body) {
  return ctex(384, 512, (x, w, h) => {
    x.fillStyle = '#fffdf2'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#c22'; x.font = `900 30px ${JPB}`; x.textBaseline = 'top';
    x.fillText(title, 24, 22, w - 48);
    x.fillStyle = '#c22'; x.fillRect(24, 62, w - 48, 3);
    x.fillStyle = '#222'; x.font = `500 17px ${JPB}`;
    let y = 78, line = '';
    for (const ch of body) {
      if (ch === '\n' || x.measureText(line + ch).width > w - 48) { x.fillText(line, 24, y); y += 23; line = ch === '\n' ? '' : ch; if (y > h - 30) break; }
      else line += ch;
    }
    if (y <= h - 30) x.fillText(line, 24, y);
  });
}

export function paintingTex(sym, bg, fg) {
  return ctex(256, 256, (x, w, h) => {
    x.fillStyle = bg; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 30; i++) { x.fillStyle = `rgba(255,255,255,${Math.random() * 0.08})`; x.fillRect(Math.random() * w, Math.random() * h, 60, 8); }
    x.fillStyle = fg; x.beginPath();
    if (sym === 0) { x.moveTo(128, 50); x.lineTo(210, 200); x.lineTo(46, 200); }
    else if (sym === 1) x.arc(128, 128, 78, 0, 7);
    else if (sym === 2) x.rect(58, 58, 140, 140);
    else { for (let i = 0; i < 10; i++) { const r = i % 2 ? 36 : 88, a = -Math.PI / 2 + i * Math.PI / 5; x.lineTo(128 + Math.cos(a) * r, 132 + Math.sin(a) * r); } }
    x.closePath(); x.fill();
  });
}

export function backdropTex() {
  return ctex(512, 512, (x, w, h) => {
    const g = x.createRadialGradient(w / 2, h * 0.42, 40, w / 2, h / 2, w * 0.75);
    g.addColorStop(0, '#4a2a8f'); g.addColorStop(0.55, '#24104f'); g.addColorStop(1, '#0e0524');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    for (let r = 0; r < 40; r++) for (let c = 0; c < 40; c++) {
      const px = c * 13 + (r % 2) * 6.5, py = r * 13;
      const d = Math.hypot(px - w / 2, py - h * 0.42) / w;
      x.fillStyle = `rgba(255,70,150,${Math.max(0, 0.34 - d * 0.5)})`;
      x.beginPath(); x.arc(px, py, 1 + d * 5, 0, 7); x.fill();
    }
  });
}
