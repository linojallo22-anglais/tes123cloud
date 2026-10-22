// helpers.js — fonctions communes réutilisables (caméra, textes, badges, ping, compteurs, drapeaux, sprites, sous-titres)
const W = 1080, H = 1920;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, x) => a + (b - a) * x;
const ease = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const easeIn = x => Math.pow(clamp(x), 3);
const backOut = x => { x = clamp(x); const c1 = 2.2, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const win = (t, a, b) => t >= a && t < b;
const prog = (t, a, d) => clamp((t - a) / d);
// apparition / disparition avec rebond
const popIn = (t, t0, d = 0.3) => t < t0 ? 0 : backOut((t - t0) / d);
const fadeOut = (t, t1, d = 0.3) => 1 - clamp((t - t1) / d);
const lifeA = (t, t0, t1, din = 0.25, dout = 0.3) => t < t0 || t > t1 + dout ? 0 : Math.min(clamp((t - t0) / din), fadeOut(t, t1, dout));
const fmtNum = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');

// ---------- minutage ----------
let WORDS = [];
function w(b, prefix, n = 1, off = 0) {
  const p = norm(prefix); let k = 0;
  const L = WORDS.filter(x => x.b === b);
  for (let i = 0; i < L.length; i++) if (norm(L[i].w).startsWith(p) && ++k === n) return L[clamp(i + off, 0, L.length - 1)];
  throw new Error('mot introuvable: ' + b + ' ' + prefix + ' ' + n);
}
const T = (b, p, n, o) => w(b, p, n, o).t0;
const TE = (b, p, n, o) => w(b, p, n, o).t1;
const beatStart = b => WORDS.find(x => x.b === b).t0;
const beatEnd = b => WORDS.filter(x => x.b === b).at(-1).t1;

// ---------- événements (sons) / actions ----------
window.EVENTS = []; window.ACTIONS = []; window.PREVIEW = [];
const ev = (t, type) => { EVENTS.push([+t.toFixed(3), type]); return t; };
const act = (t, actor, action) => { ACTIONS.push([+t.toFixed(3), actor, action]); return t; };

// ---------- caméra ----------
// stops: {t: arrivée, d: durée du mouvement, lon, lat, s, drift}
function makeCam(stops) {
  stops.sort((a, b) => a.t - b.t);
  const driftState = (st, t) => {
    const dt = Math.max(0, t - st.t); const dr = st.drift ?? 0.03;
    return { lon: st.lon + (st.plon || 0) * dt, lat: st.lat + (st.plat || 0) * dt, s: st.s * (1 + dr * dt) };
  };
  return function (t) {
    if (t <= stops[0].t) return driftState(stops[0], 0);
    for (let i = 0; i < stops.length - 1; i++) {
      const a = stops[i], b = stops[i + 1], dep = b.t - b.d;
      if (t < dep) return driftState(a, t);
      if (t < b.t) {
        const A = driftState(a, dep), x = (t - dep) / b.d;
        const ez = ease(x);
        const zoomIn = b.s > A.s * 3, zoomOut = A.s > b.s * 3;
        const ep = zoomIn ? ease(Math.min(1, x * 1.35)) : zoomOut ? ease(Math.max(0, x * 1.35 - 0.35)) : ez;
        let dl = b.lon - A.lon; if (dl > 180) dl -= 360; if (dl < -180) dl += 360;
        return { lon: A.lon + dl * ep, lat: lerp(A.lat, b.lat, ep), s: Math.exp(lerp(Math.log(A.s), Math.log(b.s), ez)) };
      }
    }
    return driftState(stops.at(-1), t);
  };
}

// ---------- textes ----------
function txt(c, s, x, y, o = {}) {
  const size = o.size || 60; c.save();
  c.font = `${o.weight || 800} ${size}px ${o.font || 'Poppins'}`;
  c.textAlign = o.align || 'center'; c.textBaseline = o.base || 'middle';
  if (o.shadow !== false) { c.shadowColor = 'rgba(0,0,0,.55)'; c.shadowBlur = o.blur ?? 14; c.shadowOffsetY = 4; }
  if (o.stroke) { c.lineJoin = 'round'; c.strokeStyle = o.stroke; c.lineWidth = o.sw || size * 0.16; c.strokeText(s, x, y); c.shadowColor = 'transparent'; }
  c.fillStyle = o.color || '#fff'; c.fillText(s, x, y); c.restore();
}
const typed = (s, t, t0, d = 0.4) => s.slice(0, Math.ceil(s.length * prog(t, t0, d)));
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function measure(c, s, size, weight = 800, font = 'Poppins') { c.save(); c.font = `${weight} ${size}px ${font}`; const m = c.measureText(s).width; c.restore(); return m; }

// étiquette (badge) rectangulaire
function tag(c, s, x, y, o = {}) {
  const size = o.size || 54, padX = size * 0.45, padY = size * 0.28;
  const tw = measure(c, s, size, o.weight || 800); const w = tw + padX * 2, h = size + padY * 2;
  c.save(); c.translate(x, y); if (o.rot) c.rotate(o.rot); c.scale(o.sc ?? 1, o.sc ?? 1); c.globalAlpha *= o.alpha ?? 1;
  c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 18; c.shadowOffsetY = 6;
  rr(c, -w / 2, -h / 2, w, h, o.r ?? 14); c.fillStyle = o.bg || '#C00E1F'; c.fill();
  c.shadowColor = 'transparent';
  if (o.border) { c.lineWidth = 5; c.strokeStyle = o.border; c.stroke(); }
  txt(c, s, 0, 2, { size, color: o.color || '#fff', shadow: false, weight: o.weight });
  c.restore(); return { w, h };
}

// ---------- badge de date (en haut) ----------
let DATES = [];
function drawDate(c, t) {
  for (let i = DATES.length - 1; i >= 0; i--) {
    const [t0, label, bg, tEnd] = DATES[i];
    if (t < t0) continue;
    const next = DATES[i + 1]; const t1 = tEnd ?? (next ? next[0] : 1e9);
    const out = clamp((t - t1) / 0.2);
    if (out >= 1) return;
    const sc = popIn(t, t0, 0.3) * (1 - out);
    const y = 300 + Math.sin(t * 2.1) * 4;
    tag(c, label, W / 2, y, { size: 58, bg: bg || '#C00E1F', sc, border: 'rgba(255,255,255,.9)' });
    if (next && t >= next[0] - 0.01) continue;
    return;
  }
}

// ---------- compteur jaune ----------
function counter(c, value, t, t0, t1, x, y, o = {}) {
  if (t < t0 || t > (o.until ?? 1e9) + 0.3) return;
  const p = ease(prog(t, t0, t1 - t0)); const v = value * p;
  const bump = 1 + 0.07 * Math.abs(Math.sin(p * Math.PI * 7)) * (p < 1 ? 1 : 0) + 0.12 * Math.max(0, 1 - Math.abs(t - t1) / 0.15);
  const a = o.until ? fadeOut(t, o.until, 0.3) : 1;
  c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(bump * popIn(t, t0, 0.25), bump * popIn(t, t0, 0.25));
  txt(c, (o.pre || '') + fmtNum(v) + (o.suf || ''), 0, 0, { size: o.size || 120, color: o.color || '#FFE928', stroke: '#1b1300', sw: (o.size || 120) * 0.12, blur: 20 });
  if (o.label) txt(c, o.label, 0, (o.size || 120) * 0.72, { size: (o.size || 120) * 0.36, color: '#fff', stroke: '#000', sw: 8 });
  c.restore();
}

// ---------- ligne de distance ----------
function distanceLine(c, A, B, t, t0, label, o = {}) {
  if (t < t0 || t > (o.until ?? 1e9) + 0.3) return;
  const a = o.until ? fadeOut(t, o.until, 0.3) : 1;
  const p = easeOut(prog(t, t0, 0.35));
  const X = lerp(A[0], B[0], p), Y = lerp(A[1], B[1], p);
  c.save(); c.globalAlpha = a; c.lineCap = 'round';
  c.setLineDash([22, 16]); c.lineDashOffset = -t * 40; c.lineWidth = 11; c.strokeStyle = '#1b1300'; c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(X, Y); c.stroke();
  c.lineWidth = 7; c.strokeStyle = '#FFE928'; c.stroke(); c.setLineDash([]);
  for (const P of [A, [X, Y]]) { c.beginPath(); c.arc(P[0], P[1], 13, 0, 7); c.fillStyle = '#FFE928'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#1b1300'; c.stroke(); }
  if (p >= 1) {
    let ang = Math.atan2(B[1] - A[1], B[0] - A[0]); if (ang > Math.PI / 2) ang -= Math.PI; if (ang < -Math.PI / 2) ang += Math.PI;
    c.translate((A[0] + B[0]) / 2, (A[1] + B[1]) / 2); c.rotate(ang);
    const s = typed(label, t, t0 + 0.35, 0.3); const sc = popIn(t, t0 + 0.35, 0.3);
    c.scale(sc, sc); txt(c, s, 0, -52, { size: 76, color: '#FFE928', stroke: '#1b1300', sw: 12 });
  }
  c.restore();
}

// ---------- ping de repérage ----------
function ping(c, x, y, t, t0, name, tEnd) {
  if (t < t0 || t > tEnd + 0.25) return;
  const a = fadeOut(t, tEnd, 0.25), k = popIn(t, t0, 0.2);
  c.save(); c.globalAlpha = a;
  const wave = ((t - t0) % 0.7) / 0.7;
  c.beginPath(); c.arc(x, y, 40 + 70 * wave, 0, 7); c.lineWidth = 5; c.strokeStyle = `rgba(255,255,255,${0.8 * (1 - wave)})`; c.stroke();
  c.beginPath(); c.arc(x, y, 44 * k, 0, 7); c.lineWidth = 8; c.strokeStyle = '#fff'; c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 12; c.stroke();
  c.beginPath(); c.arc(x, y, 11 * k, 0, 7); c.fillStyle = '#fff'; c.fill();
  if (name) txt(c, typed(name, t, t0 + 0.05, 0.3), x + 66, y, { size: 48, align: 'left', stroke: '#000', sw: 9 });
  c.restore();
}

// ---------- tampon ----------
function stampScale(t, t0) { const p = prog(t, t0, 0.18); return lerp(2.2, 1, easeOut(p)); }

// ---------- carte-preuve (photo d'archive) ----------
function photoCard(c, img, t, t0, t1, date, caption, o = {}) {
  if (t < t0 || t > t1 + 0.35) return;
  const pin = easeOut(prog(t, t0, 0.3)), pout = easeIn(prog(t, t1, 0.3));
  const side = o.side || 1;
  const cx = W / 2 + side * (1 - pin) * 900 - side * pout * 900 + (o.dx || 0), cy = o.y || 960;
  const cw = o.w || 700, ch = o.h || 520;
  c.save(); c.translate(cx, cy); c.rotate((o.rot ?? -2.5) * Math.PI / 180);
  c.shadowColor = 'rgba(0,0,0,.55)'; c.shadowBlur = 40; c.shadowOffsetY = 14;
  c.fillStyle = '#f7f3ea'; c.fillRect(-cw / 2 - 16, -ch / 2 - 16, cw + 32, ch + 120); c.shadowColor = 'transparent';
  c.save(); c.beginPath(); c.rect(-cw / 2, -ch / 2, cw, ch); c.clip();
  const z = 1 + 0.05 * prog(t, t0, t1 - t0 + 0.3);
  if (img) {
    const r = Math.max(cw / img.width, ch / img.height) * z;
    c.filter = 'sepia(.45) contrast(1.08)'; c.drawImage(img, -img.width * r / 2, -img.height * r / 2, img.width * r, img.height * r); c.filter = 'none';
  } else {
    const g = c.createLinearGradient(0, -ch / 2, 0, ch / 2); g.addColorStop(0, '#8d7a5c'); g.addColorStop(1, '#4e4230'); c.fillStyle = g; c.fillRect(-cw / 2, -ch / 2, cw, ch);
    txt(c, 'PHOTO D\'ARCHIVE', 0, 0, { size: 44, color: 'rgba(255,255,255,.6)', shadow: false });
  }
  if (GRAIN) { c.globalAlpha = 0.18; c.fillStyle = c.createPattern(GRAIN, 'repeat'); c.fillRect(-cw / 2, -ch / 2, cw, ch); c.globalAlpha = 1; }
  c.restore();
  txt(c, typed(date, t, t0 + 0.2, 0.35), -cw / 2 + 4, ch / 2 + 38, { size: 40, font: 'Courier New', weight: 700, color: '#2a2018', align: 'left', shadow: false });
  txt(c, caption, -cw / 2 + 4, ch / 2 + 82, { size: 30, weight: 600, color: '#4a3d30', align: 'left', shadow: false });
  c.restore();
}

// ---------- pellicule de film ----------
function filmStrip(c, t, t0, d, label, img) {
  if (t < t0 || t > t0 + d) return;
  const p = (t - t0) / d; const x = lerp(W + 200, -2400, ease(p));
  c.save(); c.translate(0, 900); c.rotate(-0.08);
  c.fillStyle = '#111'; c.fillRect(x, -230, 2600, 460);
  c.fillStyle = '#f2efe6';
  for (let i = 0; i < 52; i++) { rr(c, x + 20 + i * 50, -212, 28, 22, 4); c.fill(); rr(c, x + 20 + i * 50, 190, 28, 22, 4); c.fill(); }
  for (let i = 0; i < 6; i++) {
    const fx = x + 40 + i * 430;
    c.fillStyle = i % 2 ? '#6b5a42' : '#7d6a4f'; c.fillRect(fx, -170, 390, 340);
    if (img && i % 2 === 1) { c.save(); c.beginPath(); c.rect(fx, -170, 390, 340); c.clip(); const r = Math.max(390 / img.width, 340 / img.height); c.filter = 'sepia(.6)'; c.drawImage(img, fx + 195 - img.width * r / 2, -img.height * r / 2, img.width * r, img.height * r); c.filter = 'none'; c.restore(); }
    else txt(c, label, fx + 195, 0, { size: 110, color: '#f6e9c8', stroke: '#2b2116', sw: 10 });
  }
  c.restore();
}

// ---------- chiffre tragique ----------
function tragic(c, s, label, t, t0, t1) {
  if (t < t0 || t > t1 + 0.4) return;
  const a = Math.min(clamp((t - t0) / 0.3), fadeOut(t, t1, 0.4));
  c.save(); c.globalAlpha = a;
  const g = c.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 1100); g.addColorStop(0, 'rgba(0,0,0,.25)'); g.addColorStop(1, 'rgba(0,0,0,.85)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  const sc = lerp(1.25, 1, easeOut(prog(t, t0, 0.5))) * (1 + 0.02 * Math.sin(t * 5));
  c.translate(W / 2, 760); c.scale(sc, sc);
  c.shadowColor = '#ff1a1a'; c.shadowBlur = 60;
  txt(c, s, 0, 0, { size: 300, color: '#ff2a2a', stroke: '#3a0000', sw: 14, shadow: false });
  c.shadowBlur = 0; txt(c, label, 0, 200, { size: 64, color: '#fff', stroke: '#000', sw: 10 });
  c.restore();
}

// ---------- drapeaux ----------
// remplit le chemin (déjà construit) avec l'image du drapeau en mode "slice" sur la boîte b=[[x0,y0],[x1,y1]]
function flagFill(c, buildPath, b, img, alpha, flash = 0, mode = 'slice') {
  if (!img || alpha <= 0) return;
  const [[x0, y0], [x1, y1]] = b; const bw = x1 - x0, bh = y1 - y0; if (bw < 1 || bh < 1) return;
  c.save(); c.globalAlpha = alpha; buildPath(); c.clip();
  if (mode === 'stretch') c.drawImage(img, x0, y0, bw, bh);
  else { const r = Math.max(bw / img.width, bh / img.height); c.drawImage(img, (x0 + x1) / 2 - img.width * r / 2, (y0 + y1) / 2 - img.height * r / 2, img.width * r, img.height * r); }
  if (flash > 0) { c.globalAlpha = flash * 0.55; c.fillStyle = '#fff'; c.fillRect(x0, y0, bw, bh); }
  c.restore();
}

// ---------- sprites (planche découpée) ----------
const SPR = {}; // nom -> Image
const SPR_COL = { soldier_us: '#5b6b3a', soldier_uk: '#8a7a4c', soldier_fr: '#2f4f8f', soldier_su: '#a8322a', barrier_up: '#c0392b', barrier_down: '#c0392b', train: '#222', truck: '#2e4d2b', barge: '#333', plane: '#c9ccd1', plane_land: '#c9ccd1', candy_chute: '#fff', crate: '#9a6b3c', coal: '#3a3a3a', walker_a: '#6d6d6d', walker_b: '#6d6d6d', metro: '#f1c40f', tower: '#8e8e8e', worker_a: '#7f8c8d', worker_b: '#7f8c8d', wire: '#bbb', wall: '#a7a7a7', fan_a: '#2c5aa0', fan_b: '#2c5aa0' };
const SPR_AR = { train: 2.2, truck: 1.8, barge: 3, plane: 1.9, plane_land: 1.9, metro: 2.6, barrier_up: 1.3, barrier_down: 1.6, wall: 1.3, wire: 1.4, crate: 1.2, coal: 1, tower: 0.45, candy_chute: 0.8 };
// x,y = point bas-centre ; h = hauteur en px
function sprite(c, name, x, y, h, o = {}) {
  const img = SPR[name];
  c.save(); c.translate(x, y); if (o.rot) c.rotate(o.rot);
  const sx = (o.flip ? -1 : 1) * (o.sx ?? 1), sy = o.sy ?? 1; c.scale(sx, sy); c.globalAlpha *= o.alpha ?? 1;
  if (o.shadow !== false) { c.save(); c.scale(1, 0.25); c.beginPath(); c.ellipse(0, 0, h * 0.32, h * 0.32, 0, 0, 7); c.fillStyle = 'rgba(0,0,0,.28)'; c.fill(); c.restore(); }
  if (img) { const w = h * img.width / img.height; c.drawImage(img, -w / 2, -h, w, h); }
  else {
    const w = h * (SPR_AR[name] || 0.62);
    c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 10;
    rr(c, -w / 2, -h, w, h, Math.min(w, h) * 0.18); c.fillStyle = SPR_COL[name] || '#999'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#fff'; c.stroke();
    c.shadowColor = 'transparent';
    txt(c, name.replace('_', ' '), 0, -h / 2, { size: Math.max(14, Math.min(28, w / 7)), shadow: false, color: '#fff', stroke: '#000', sw: 4 });
  }
  c.restore();
}

// ---------- sous-titres ----------
let SUBS = [];
function buildSubs(SCRIPT) {
  SUBS = [];
  SCRIPT.forEach((beat, b) => {
    let idx = 0; const L = WORDS.filter(x => x.b === b);
    beat.forEach(([disp, spk]) => { const n = tokenize(spk).length; const ws = L.slice(idx, idx + n); idx += n; SUBS.push({ disp, t0: ws[0].t0, t1: ws.at(-1).t1 }); });
    if (idx !== L.length) throw new Error('sous-titres/mots incohérents beat ' + b);
  });
  for (let i = 0; i < SUBS.length; i++) { const nx = SUBS[i + 1]; SUBS[i].tEnd = nx ? Math.min(nx.t0, SUBS[i].t1 + 0.6) : SUBS[i].t1 + 0.5; }
}
function drawSubs(c, t) {
  const s = SUBS.find(x => t >= x.t0 - 0.05 && t < x.tEnd); if (!s) return;
  const parts = s.disp.split('*'); const size = 66;
  c.save(); c.font = `900 ${size}px Poppins`;
  const widths = parts.map(p => c.measureText(p).width); let total = widths.reduce((a, b) => a + b, 0);
  const maxW = 980, sc = Math.min(1, maxW / total) * (0.9 + 0.1 * backOut(prog(t, s.t0 - 0.05, 0.18)));
  c.translate(W / 2, 1575); c.scale(sc, sc);
  let x = -total / 2;
  parts.forEach((p, i) => {
    if (i % 2 === 1) { rr(c, x - 12, -size * 0.62, widths[i] + 24, size * 1.22, 18); c.fillStyle = '#E6197E'; c.fill(); }
    c.lineJoin = 'round'; c.lineWidth = 13; c.strokeStyle = '#000'; c.textBaseline = 'middle'; c.textAlign = 'left';
    if (i % 2 === 0) c.strokeText(p, x, 4);
    c.fillStyle = '#fff'; c.fillText(p, x, 4); x += widths[i];
  });
  c.restore();
}

// ---------- grain ----------
let GRAIN = null;
function makeGrain() {
  const g = document.createElement('canvas'); g.width = g.height = 256; const x = g.getContext('2d'); const d = x.createImageData(256, 256);
  let s = 12345; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < d.data.length; i += 4) { const v = 110 + r() * 120; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  x.putImageData(d, 0, 0); GRAIN = g;
}
// texture "satellite" : taches de végétation, ancrée sur la carte
function makeTex(colors, n, seed, rmax) {
  const g = document.createElement('canvas'); g.width = g.height = 512; const x = g.getContext('2d');
  let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < n; i++) {
    const cx = r() * 512, cy = r() * 512, rad = 6 + r() * rmax; x.fillStyle = colors[Math.floor(r() * colors.length)];
    for (const dx of [-512, 0, 512]) for (const dy of [-512, 0, 512]) { x.beginPath(); x.ellipse(cx + dx, cy + dy, rad, rad * (0.5 + r() * 0.7), r() * 3, 0, 7); x.fill(); }
  }
  return g;
}
