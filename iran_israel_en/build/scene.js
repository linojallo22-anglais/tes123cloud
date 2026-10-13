// scene.js — Why Israel and Iran can't invade each other (anglais, 9:16). window.render(t) déterministe.
const CX = 540, CY = 900, OX = 470, OY = 680, MW = 2020, MH = 3060, FOC = 1400;
let D, FL = {}, DECO = {}, DUR, cam;
const mapC = document.createElement('canvas'); mapC.width = MW; mapC.height = MH; const m = mapC.getContext('2d');
const rotC = document.createElement('canvas'); rotC.width = MW; rotC.height = MH; const rc = rotC.getContext('2d');
let canvas, ctx, P = null, cam_s = 1, ANG = 0, TILT = 0;
const TLV = [34.78, 32.08], THR = [51.39, 35.69], QOM = [50.88, 34.64], FORDO = [50.996, 34.885], DAMA = [52.11, 35.95], LUT = [58.9, 30.5], WHITEMAN = [-93.55, 38.73];
const HORMUZ_N = [56.33, 26.86], HORMUZ_S = [56.36, 26.52], ABU = [55.03, 25.88], GTUNB = [55.30, 26.26], LTUNB = [55.15, 26.24], HISL = [56.46, 27.06];
const FCOL = { il: '#2f6bff', ir: '#2aa84a', g: '#c9ced3', us: '#ff3b3b', om: '#e0262c', ae: '#00a651', iq: '#ff4d4d', fr: '#3b7bff' };

function makeCam2(stops) {
  stops.sort((a, b) => a.t - b.t);
  const dr = (st, t) => { const dt = Math.max(0, t - st.t); return { lon: st.lon, lat: st.lat, s: st.s * (1 + (st.drift ?? 0.025) * dt) }; };
  return t => {
    if (t <= stops[0].t) return dr(stops[0], 0);
    for (let i = 0; i < stops.length - 1; i++) {
      const a = stops[i], b = stops[i + 1], dep = b.t - b.d;
      if (t < dep) return dr(a, t);
      if (t < b.t) {
        const A = dr(a, dep), x = (t - dep) / b.d; const ez = b.lin ? x : ease(x);
        const zi = b.s > A.s * 3, zo = A.s > b.s * 3;
        const ep = b.lin ? x : zi ? ease(Math.min(1, x * 1.35)) : zo ? ease(Math.max(0, x * 1.35 - 0.35)) : ez;
        let dl = b.lon - A.lon; if (dl > 180) dl -= 360; if (dl < -180) dl += 360;
        return { lon: A.lon + dl * ep, lat: lerp(A.lat, b.lat, ep), s: Math.exp(lerp(Math.log(A.s), Math.log(b.s), ez)) };
      }
    }
    return dr(stops.at(-1), t);
  };
}
function S(lon, lat) {
  const p = P([lon, lat]); let x = p[0] - OX - CX, y = p[1] - OY - CY;
  const c = Math.cos(ANG), s = Math.sin(ANG); let u = x * c - y * s, v = x * s + y * c; let k = 1;
  if (TILT > 0.001) { const sn = Math.sin(TILT), cs = Math.cos(TILT); k = FOC / (FOC - v * sn); u *= k; v = k * v * cs; }
  return { x: CX + u, y: CY + v, k };
}
const pathM = g => { m.beginPath(); d3.geoPath(P, m)(g); };
const lineM = L => { m.beginPath(); L.forEach((q, i) => { const p = P(q); i ? m.lineTo(p[0], p[1]) : m.moveTo(p[0], p[1]); }); };
const gcLine = (a, b, u = 1, n = 60) => { const f = d3.geoInterpolate(a, b); const L = []; for (let i = 0; i <= n; i++) L.push(f(u * i / n)); return L; };
const kmPx = (km, lat) => { const a = P([0, lat]), b = P([km / 111.2, lat]); return Math.abs(b[0] - a[0]) * Math.cos(lat * Math.PI / 180) || 1; };

// ---------- fond en relief ----------
const TN = 16384, TS = 1024; const TILES = {}; let LOWRES = null;
const gX = lon => (lon + 180) / 360 * TN, gY = lat => TN / 2 - TN / (2 * Math.PI) * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
function tilesFor(st) {
  const k = 2 * Math.PI * st.s / TN; if (k < 0.3) return [];
  const xc = gX(st.lon), yc = gY(st.lat); const x0 = xc - (CX + OX) / k, x1 = xc + (MW - CX - OX) / k, y0 = yc - (CY + OY) / k, y1 = yc + (MH - CY - OY) / k;
  const out = []; for (let ty = Math.max(0, Math.floor(y0 / TS)); ty <= Math.min(15, Math.floor(y1 / TS)); ty++) for (let tx = Math.floor(x0 / TS); tx <= Math.floor(x1 / TS); tx++) out.push([((tx % 16) + 16) % 16, ty, tx]);
  return out;
}
function drawSat(st) {
  const cx = CX + OX, cy = CY + OY; m.fillStyle = '#2f7f8c'; m.fillRect(0, 0, MW, MH); m.imageSmoothingQuality = 'high';
  const k = 2 * Math.PI * st.s / TN, xc = gX(st.lon), yc = gY(st.lat);
  if (k < 0.3 || !tilesFor(st).every(([a, b]) => TILES[b + '_' + a])) {
    const kl = 2 * Math.PI * st.s / LOWRES.width; const W2 = LOWRES.width * kl;
    const X0 = cx - (xc / TN) * W2, Y0 = cy - (yc / TN) * W2;
    for (const off of [-W2, 0, W2]) { const xa = X0 + off; const dx0 = Math.max(0, xa), dx1 = Math.min(MW, xa + W2), dy0 = Math.max(0, Y0), dy1 = Math.min(MH, Y0 + W2); if (dx1 > dx0 && dy1 > dy0) m.drawImage(LOWRES, (dx0 - xa) / kl, (dy0 - Y0) / kl, (dx1 - dx0) / kl, (dy1 - dy0) / kl, dx0, dy0, dx1 - dx0, dy1 - dy0); }
  } else {
    for (const [tx, ty, txr] of tilesFor(st)) { const img = TILES[ty + '_' + tx]; if (!img) continue; const dx = cx + (txr * TS - xc) * k, dy = cy + (ty * TS - yc) * k; m.drawImage(img, dx, dy, TS * k + 1, TS * k + 1); }
  }
  m.save(); pathM(D.borders); m.lineWidth = 1.8; m.strokeStyle = 'rgba(255,255,255,.62)'; m.stroke(); m.restore();
}

// ---------- pays colorés (drapeau plein quand on en parle, puis ~0,4) ----------
let FILLS = []; const GEO = {};
function drawFills(t) {
  for (const f of FILLS) {
    if (t < f.t0 || t > f.t1 + 0.35) continue;
    const last = f.fl.filter(x => x <= t).at(-1) ?? f.t0; const cur = t - last; const out = fadeOut(t, f.t1, 0.35) * clamp((t - f.t0) / 0.2);
    const att = clamp(1 - Math.log(cam_s / (f.g === 'il' ? 40000 : f.g === 'ae' || f.g === 'om' ? 16000 : 7000)) / Math.log(6), 0.2, 1);
    const fa = lerp(f.max ?? 0.88, f.dim ?? 0.4, clamp((cur - (f.hold ?? 1.6)) / 0.6)) * out * att; const flash = Math.max(0, 1 - cur / 0.3); const col = FCOL[f.col || f.flag] || '#fff';
    const g = GEO[f.g];
    m.save();
    if (f.flag === 'g') { pathM(g); m.globalAlpha = fa * 0.75; m.fillStyle = '#9aa3ab'; m.fill(); if (flash > 0) { m.globalAlpha = flash * 0.5; m.fillStyle = '#fff'; m.fill(); } }
    else flagFill(m, () => pathM(g), d3.geoPath(P).bounds(g), FL[f.flag], fa, flash, f.mode || 'slice');
    pathM(g); m.lineJoin = 'round'; m.lineWidth = 3.4; m.strokeStyle = col; m.globalAlpha = 0.95 * out; m.shadowColor = col; m.shadowBlur = 12; m.stroke();
    if (cur < 2.0) { m.globalAlpha = (1 - cur / 2.0) * out; m.shadowColor = '#fff'; m.shadowBlur = 25; m.lineWidth = 4.5; m.strokeStyle = '#fff'; m.stroke(); }
    m.restore();
  }
}
let PINS = [];
function flagCard(c, x, y, img, w) { const h = w * 0.75; c.save(); c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 12; c.shadowOffsetY = 4; c.fillStyle = '#fff'; rr(c, x - w / 2 - 5, y - h / 2 - 5, w + 10, h + 10, 6); c.fill(); c.shadowColor = 'transparent'; if (img) c.drawImage(img, x - w / 2, y - h / 2, w, h); c.restore(); }
function drawPins(c, t) {
  PINS.forEach(pn => {
    const tEnd = pn.t + (pn.d ?? 2.2); if (t < pn.t || t > tEnd + 0.25) return;
    const p = S(pn.ll[0], pn.ll[1]); const al = fadeOut(t, tEnd, 0.25); const s = popIn(t, pn.t, 0.3);
    c.save(); c.globalAlpha = al; c.translate(clamp(p.x, 130, W - 130), clamp(p.y + (pn.dy ?? 0), 330, 1250)); c.scale(s, s); if (pn.flag) flagCard(c, 0, -52, FL[pn.flag], 80);
    txt(c, typed(pn.name, t, pn.t + 0.05, 0.3), 0, pn.flag ? 26 : 0, { size: pn.size || 48, stroke: '#000', sw: 9 }); c.restore();
  });
}

// ---------- outils graphiques ----------
function mapWrite(c, s, ll, t, t0, t1, o = {}) {
  if (t < t0 || t > t1 + 0.3) return; const p = S(ll[0], ll[1]); const al = fadeOut(t, t1, 0.3);
  c.save(); c.globalAlpha = al; c.translate(p.x, p.y); c.rotate(o.rot ?? -0.05);
  txt(c, typed(s, t, t0, o.d ?? 0.5), 0, 0, { size: o.size || 90, font: 'Caveat', weight: 700, color: o.color || '#fff', stroke: '#1d1406', sw: 10, blur: 16 }); c.restore();
}
function stampText(c, s, x, y, t, t0, t1, o = {}) {
  if (t < t0 || t > t1 + 0.3) return; const sz = o.size || 72; const sc = stampScale(t, t0) * fadeOut(t, t1, 0.3);
  c.save(); c.translate(x, y); c.rotate(o.rot ?? -0.06); c.scale(sc, sc); c.globalAlpha = clamp((t - t0) / 0.08) * fadeOut(t, t1, 0.3);
  const w = measure(c, s, sz, 900) + 50; c.fillStyle = 'rgba(255,255,255,.92)'; rr(c, -w / 2, -sz * 0.7, w, sz * 1.4, 16); c.fill(); c.lineWidth = 8; c.strokeStyle = o.col || '#e01b24'; c.stroke();
  txt(c, s, 0, 3, { size: sz, color: o.col || '#e01b24', weight: 900, shadow: false }); c.restore();
}
function bigWord(c, s, x, y, t, t0, t1, o = {}) {
  if (t < t0 || t > t1 + 0.3) return; const sc = popIn(t, t0, 0.3) * fadeOut(t, t1, 0.25) * (1 + 0.025 * Math.sin(t * 6));
  c.save(); c.translate(x, y); c.scale(sc, sc); txt(c, s, 0, 0, { size: o.size || 100, weight: 900, color: o.color || '#FFE928', stroke: '#1b1300', sw: (o.size || 100) * 0.12 }); c.restore();
}
function pill(c, s, x, y, t, t0, t1, o = {}) { if (t < t0 || t > t1 + 0.3) return; tag(c, s, x, y, { size: o.size || 44, bg: o.bg || '#FFD21F', color: o.color || '#111', border: o.border, sc: popIn(t, t0, 0.3) * fadeOut(t, t1, 0.25), rot: o.rot }); }
function charSpr(c, name, x, y, h, t, t0, t1, o = {}) { if (t < t0 || t > t1 + 0.3) return; sprite(c, name, x, y, h * popIn(t, t0, 0.3), { alpha: fadeOut(t, t1, 0.3), rot: (o.wob ?? 0.03) * Math.sin(t * 5 + (o.ph || 0)), flip: o.flip, shadow: o.shadow }); }
function dropSpr(c, name, x, y, h, t, t0, t1, o = {}) { if (t < t0 || t > t1 + 0.3) return; const p = prog(t, t0, 0.35); const yy = y - (1 - easeIn(p)) * 420; const sq = p >= 1 ? 1 + 0.12 * Math.max(0, 1 - (t - t0 - 0.35) / 0.15) : 1; sprite(c, name, x, yy, h, { alpha: fadeOut(t, t1, 0.3) * clamp(p * 4), sx: sq, sy: 2 - sq, shadow: o.shadow }); }
function ring(c, x, y, r, t, t0, t1, col = '#FFE928', o = {}) {
  if (t < t0 || t > t1 + 0.3) return; const p = easeOut(prog(t, t0, 0.5)); c.save(); c.globalAlpha = fadeOut(t, t1, 0.3); c.lineWidth = o.w || 8; c.strokeStyle = col; c.shadowColor = col; c.shadowBlur = 16; c.lineCap = 'round';
  for (const [dr, ph] of [[0, 0], [10, 0.4]]) { c.beginPath(); c.ellipse(x, y, (r + dr) * (o.ax || 1.25), r + dr, -0.15, ph, ph + p * Math.PI * 2); c.stroke(); } c.restore();
}
function ping2(c, ll, t, t0, t1, name, o = {}) {
  if (t < t0 || t > t1 + 0.3) return; const p = S(ll[0], ll[1]); const a = fadeOut(t, t1, 0.25), k = popIn(t, t0, 0.2); const wave = ((t - t0) % 0.8) / 0.8;
  c.save(); c.globalAlpha = a; c.beginPath(); c.arc(p.x, p.y, 26 + 50 * wave, 0, 7); c.lineWidth = 4; c.strokeStyle = `rgba(255,255,255,${0.8 * (1 - wave)})`; c.stroke();
  c.beginPath(); c.arc(p.x, p.y, 26 * k, 0, 7); c.lineWidth = 6; c.strokeStyle = o.col || '#fff'; c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 10; c.stroke(); c.beginPath(); c.arc(p.x, p.y, 8 * k, 0, 7); c.fillStyle = o.col || '#fff'; c.fill();
  if (name) txt(c, typed(name, t, t0 + 0.05, 0.3), p.x + (o.dx ?? 0), p.y + (o.dy ?? -62), { size: o.size || 46, stroke: '#000', sw: 9 }); c.restore();
}
// règle de distance sur la carte (écran)
function ruler(c, A, B, label, t, t0, t1, o = {}) {
  if (t < t0 || t > t1 + 0.3) return; const a = S(...A), b = S(...B); const p = easeOut(prog(t, t0, 0.45)); const X = lerp(a.x, b.x, p), Y = lerp(a.y, b.y, p);
  c.save(); c.globalAlpha = fadeOut(t, t1, 0.3); c.lineCap = 'round';
  c.lineWidth = 10; c.strokeStyle = '#1b1300'; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(X, Y); c.stroke(); c.lineWidth = 6; c.strokeStyle = o.col || '#FFE928'; c.stroke();
  const ang = Math.atan2(b.y - a.y, b.x - a.x); for (const P2 of [[a.x, a.y], [X, Y]]) { c.save(); c.translate(P2[0], P2[1]); c.rotate(ang); c.fillStyle = o.col || '#FFE928'; c.strokeStyle = '#1b1300'; c.lineWidth = 3; c.fillRect(-4, -18, 8, 36); c.strokeRect(-4, -18, 8, 36); c.restore(); }
  if (p > 0.95) { let an = ang; if (an > Math.PI / 2) an -= Math.PI; if (an < -Math.PI / 2) an += Math.PI; c.translate((a.x + b.x) / 2, (a.y + b.y) / 2); c.rotate(an); const s = popIn(t, t0 + 0.45, 0.3); c.scale(s, s); txt(c, label, 0, o.dy ?? -46, { size: o.size || 58, color: o.col || '#FFE928', stroke: '#1b1300', sw: 10 }); }
  c.restore();
}
// trait de grand cercle en pointillé (carte)
function gcDash(A, B, t, t0, t1, col = '#FFE928', w = 6) {
  if (t < t0 || t > t1 + 0.35) return; const u = easeOut(prog(t, t0, 0.8)); m.save(); m.globalAlpha = fadeOut(t, t1, 0.35); lineM(gcLine(A, B, u)); m.setLineDash([18, 12]); m.lineDashOffset = -t * 50; m.lineCap = 'round'; m.lineWidth = w + 4; m.strokeStyle = 'rgba(0,0,0,.45)'; m.stroke(); m.lineWidth = w; m.strokeStyle = col; m.shadowColor = col; m.shadowBlur = 10; m.stroke(); m.restore();
}
// rangées de montagnes
function mountains(c, line, t, t0, t1, o = {}) {
  if (t < t0 || t > t1 + 0.3) return; const al = fadeOut(t, t1, 0.3); const pts = []; const n = o.n || 26;
  for (let i = 0; i < n; i++) { const u = i / (n - 1); const seg = u * (line.length - 1); const k = Math.min(line.length - 2, Math.floor(seg)); const f = seg - k; const ll = d3.geoInterpolate(line[k], line[k + 1])(f); for (const off of (o.rows || [0])) pts.push([ll[0] + off * 0.55, ll[1] + off * 0.35, i]); }
  c.save(); c.globalAlpha = al;
  pts.forEach(([lon, lat, i], j) => { const t1i = t0 + i * (o.step || 0.05); if (t < t1i) return; const p = S(lon, lat); const h = (o.h || 46) * p.k * (0.8 + 0.4 * ((j * 37) % 10) / 10) * backOut(prog(t, t1i, 0.3)); if (h <= 1) return;
    c.beginPath(); c.moveTo(p.x - h * 0.75, p.y); c.lineTo(p.x, p.y - h); c.lineTo(p.x + h * 0.75, p.y); c.closePath(); c.fillStyle = '#7a5532'; c.fill(); c.lineWidth = 2.5; c.strokeStyle = '#3d2610'; c.stroke();
    c.beginPath(); c.moveTo(p.x - h * 0.27, p.y - h * 0.64); c.lineTo(p.x, p.y - h); c.lineTo(p.x + h * 0.27, p.y - h * 0.64); c.closePath(); c.fillStyle = '#fff'; c.fill(); });
  c.restore();
}
// carte de chapitre
function chapterCard(c, t, t0, n, title) {
  if (t < t0 || t > t0 + 2.6) return; const pin = easeOut(prog(t, t0, 0.4)), pout = easeIn(prog(t, t0 + 2.2, 0.4)); const x = lerp(-900, 0, pin) - pout * 900;
  c.save(); c.globalAlpha = 0.28 * (1 - pout) * pin; c.fillStyle = '#000'; c.fillRect(0, 0, W, H); c.restore();
  c.save(); c.translate(x, 0); c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 30; c.fillStyle = 'rgba(250,247,238,.97)'; rr(c, -40, 360, 940, 280, 26); c.fill(); c.shadowColor = 'transparent';
  txt(c, 'Partie ' + n, 110, 430, { size: 76, font: 'Caveat', weight: 700, color: '#C00E1F', align: 'left', shadow: false });
  c.font = '900 58px Poppins'; const tw = c.measureText(title).width; const hp = easeOut(prog(t, t0 + 0.45, 0.6));
  c.fillStyle = 'rgba(255,214,0,.8)'; c.fillRect(104, 532, (tw + 16) * hp, 40);
  txt(c, title, 110, 540, { size: 58, weight: 900, color: '#1b1300', align: 'left', shadow: false }); c.restore();
}
function cornerLabel(c, t, items) { const it = items.filter(x => t >= x[0] + 2.5 && t < x[2]).at(-1); if (!it) return; const a = clamp((t - it[0] - 2.5) / 0.4) * fadeOut(t, it[2] - 0.3, 0.3); c.save(); c.globalAlpha = a * 0.92; c.font = '800 26px Poppins'; const s = 'PARTIE ' + it[1] + ' · ' + it[3]; const w = c.measureText(s).width + 36; c.fillStyle = 'rgba(15,20,28,.72)'; rr(c, 24, 24, w, 46, 12); c.fill(); txt(c, s, 42, 48, { size: 26, weight: 800, color: '#FFE928', align: 'left', shadow: false }); c.restore(); }
// révélation d'un décor en cercle depuis un point de la carte
function decoReveal(c, img, ll, t, t0, t1) {
  if (!img || t < t0 || t > t1) return; const p = S(ll[0], ll[1]); const R0 = Math.hypot(W, H);
  const open = easeOut(prog(t, t0, 0.7)), close = easeIn(prog(t, t1 - 0.6, 0.6)); const r = R0 * open * (1 - close) + 2;
  const cx = lerp(p.x, CX, open * (1 - close)), cy = lerp(p.y, CY, open * (1 - close));
  c.save(); c.beginPath(); c.arc(cx, cy, r, 0, 7); c.clip(); const z = 1.04 + 0.08 * prog(t, t0, t1 - t0); const sc = Math.max(W / img.width, H / img.height) * z;
  c.drawImage(img, CX - img.width * sc / 2, CY - img.height * sc / 2, img.width * sc, img.height * sc);
  const vg = c.createRadialGradient(CX, CY, 400, CX, CY, 1150); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.4)'); c.fillStyle = vg; c.fillRect(0, 0, W, H); c.restore();
  c.save(); c.beginPath(); c.arc(cx, cy, r, 0, 7); c.lineWidth = 10; c.strokeStyle = 'rgba(255,255,255,.95)'; c.shadowColor = '#fff'; c.shadowBlur = 30; c.stroke(); c.restore();
}
// arc de missile (écran)
function missileArc(c, A, B, t, t0, t1, o = {}) {
  if (t < t0 || t > t1 + 0.6) return; const a = S(...A), b = S(...B); const u = ease(prog(t, t0, t1 - t0)); const hgt = Math.hypot(b.x - a.x, b.y - a.y) * (o.h || 0.35);
  const pt = v => { const x = lerp(a.x, b.x, v), y = lerp(a.y, b.y, v) - hgt * 4 * v * (1 - v); return [x, y]; };
  c.save(); c.globalAlpha = fadeOut(t, t1 + 0.3, 0.3); c.beginPath(); for (let i = 0; i <= 50; i++) { const [x, y] = pt(u * i / 50); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.lineWidth = 5; c.strokeStyle = o.col || 'rgba(255,120,60,.95)'; c.setLineDash([14, 10]); c.lineDashOffset = -t * 60; c.shadowColor = o.col || '#ff7a3c'; c.shadowBlur = 12; c.stroke(); c.setLineDash([]);
  if (t <= t1) { const [x, y] = pt(u), [x2, y2] = pt(Math.min(1, u + 0.01)); const img = SPR[o.spr || 'missile']; const h = o.size || 120; const w = h * img.width / img.height; c.translate(x, y); c.rotate(Math.atan2(y2 - y, x2 - x) + Math.PI / 2); c.drawImage(img, -w / 2, -h / 2, w, h); }
  c.restore();
}

// ---------- voyageurs suivis par la caméra ----------
let LEGS = [];
function pathLeg(spr, pts, t0, t1, sMid, sEnd, o = {}) {
  const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + d3.geoDistance(pts[i - 1], pts[i]));
  const tot = cum.at(-1);
  const at = u => { const d = u * tot; let i = 1; while (i < cum.length - 1 && cum[i] < d) i++; const f = (d - cum[i - 1]) / Math.max(1e-9, cum[i] - cum[i - 1]); return d3.geoInterpolate(pts[i - 1], pts[i])(clamp(f)); };
  const L = { spr, path: pts, t0, t1, sMid, sEnd, at, u: t => (o.linear ? prog(t, t0, t1 - t0) : ease(prog(t, t0, t1 - t0))), size: o.size || 150, rot: o.rot !== false, wake: o.wake === undefined ? '#ffffff' : o.wake, hold: o.hold ?? 0.5, follow: o.follow !== false, dy: o.dy ?? 70, stopAt: o.stopAt, vis0: o.vis0 ?? t0 - 0.25, off: o.off || [0, 0] };
  if (L.stopAt) { const base = L.u; L.u = t => base(Math.min(t, L.stopAt)); }
  LEGS.push(L); return L;
}
function drawWakes(t) {
  for (const L of LEGS) {
    if (!L.wake || t < L.t0 || t > L.t1 + L.hold + 0.4) continue; const u = L.u(t); const al = fadeOut(t, L.t1 + L.hold, 0.4);
    m.save(); m.globalAlpha = al; m.beginPath(); for (let i = 0; i <= 60; i++) { const p = P(L.at(u * i / 60)); i ? m.lineTo(p[0], p[1]) : m.moveTo(p[0], p[1]); }
    m.setLineDash([16, 12]); m.lineDashOffset = -t * 50; m.lineWidth = 5; m.strokeStyle = L.wake; m.shadowColor = 'rgba(0,0,0,.4)'; m.shadowBlur = 6; m.lineCap = 'round'; m.stroke(); m.restore();
  }
}
function drawTravelers(c, t) {
  for (const L of LEGS) {
    if (t < L.vis0 || t > L.t1 + L.hold + 0.3) continue;
    const u = L.u(t); const ll = L.at(u); const p = S(ll[0], ll[1]); const q = S(...L.at(clamp(u + 0.01))), p0 = S(...L.at(clamp(u - 0.01)));
    const dir = Math.atan2(q.y - p0.y, q.x - p0.x); const a = Math.min(clamp((t - L.vis0) / 0.25), fadeOut(t, L.t1 + L.hold, 0.3));
    const img = SPR[L.spr]; if (!img) continue; const h = L.size * (1 + 0.025 * Math.sin(t * 6)) * popIn(t, L.vis0, 0.35);
    c.save(); c.globalAlpha = a; c.translate(p.x + L.off[0], p.y + L.off[1]); if (L.rot) c.rotate(dir + Math.PI / 2); else c.rotate(0.05 * Math.sin(t * 5));
    const w = h * img.width / img.height;
    c.save(); c.translate(12, 16); c.globalAlpha = 0.3 * a; c.filter = 'brightness(0) blur(5px)'; c.drawImage(img, -w / 2, -h / 2, w, h); c.restore();
    c.drawImage(img, -w / 2, -h / 2, w, h); c.restore();
  }
}

// ============ TIMELINE ============
let A = {};
function setup() {
  const a = A;
  a.israel0 = T(0, 'israel'); a.iran0 = T(0, 'iran'); a.strikes = T(0, 'strikes'); a.but0 = T(0, 'but'); a.drive = T(0, 'drive'); a.country = T(0, 'country'); a.why = T(0, 'heres'); a.map = T(0, 'map');
  a.b1 = beatStart(1); a.thousand = T(1, 'thousand'); a.apart = T(1, 'apart'); a.ny = T(1, 'new'); a.chicago = T(1, 'chicago'); a.border = T(1, 'border'); a.jo = T(1, 'jordan'); a.iq = T(1, 'iraq'); a.sy = T(1, 'syria'); a.sa = T(1, 'saudi'); a.way = T(1, 'way');
  a.b2 = beatStart(2); a.jersey = T(2, 'jersey'); a.narrow = T(2, 'narrowest'); a.nine = T(2, 'nine'); a.so = T(2, 'so'); a.shield = T(2, 'shield'); a.layer = T(2, 'layer'); a.stopsW = T(2, 'stops'); a.space = T(2, 'space');
  a.b3 = beatStart(3); a.alaska = T(3, 'alaska'); a.walled = T(3, 'walled'); a.zagros = T(3, 'zagros'); a.k900 = T(3, 'nine'); a.long = T(3, 'long'); a.nuclear = T(3, 'nuclear'); a.k300 = T(3, 'three'); a.mountain = T(3, 'mountain', 2); a.hit = T(3, 'hit'); a.america = T(3, 'america'); a.b2b = T(3, 'b2'); a.missouri = T(3, 'missouri'); a.mEnd = TE(3, 'missouri');
  a.b4 = beatStart(4); a.water = T(4, 'water'); a.hormuz = T(4, 'hormuz'); a.k21 = T(4, 'twentyone'); a.normally = T(4, 'normally'); a.fifth = T(4, 'fifth'); a.oil = T(4, 'oil'); a.through = T(4, 'through');
  a.b5 = beatStart(5); a.shield5 = T(5, 'shield'); a.which = T(5, 'which'); a.wins = T(5, 'wins'); a.tell = T(5, 'tell'); a.comments = T(5, 'comments'); a.fin = TE(5, 'comments');
  DUR = a.fin + 0.55;

  for (const k of ['il', 'ir', 'jo', 'iq', 'sy', 'sa', 'om', 'us']) GEO[k] = D.c[k];
  const F = (g, flag, t0, t1, fl = [], o = {}) => FILLS.push({ g, flag, t0, t1, fl: [t0, ...fl].sort((x, y) => x - y), ...o });
  F('il', 'il', a.israel0, DUR + 1, [a.b2, a.shield5], { mode: 'slice', col: 'il' });
  F('ir', 'ir', a.iran0, DUR + 1, [a.b3, a.water, a.b5], { mode: 'stretch', col: 'ir' });
  for (const [k, t] of [['jo', a.jo], ['iq', a.iq], ['sy', a.sy], ['sa', a.sa]]) F(k, 'g', t, a.b2 + 0.4, [], { hold: 1.0, dim: 0.5 });
  F('us', 'us', a.america - 0.2, a.mEnd + 0.8, [], { mode: 'slice' });
  F('om', 'om', a.hormuz, a.fifth, [], { mode: 'stretch', hold: 1.0, dim: 0.3 });
  const pin = (t, ll, name, flag, o = {}) => PINS.push({ t, ll, name, flag, ...o });
  pin(a.israel0, [35.0, 31.3], 'ISRAEL', 'il', { d: 1.4 }); pin(a.iran0 + 0.2, [54, 32.5], 'IRAN', 'ir', { d: 1.6 });
  pin(a.jo, [36.6, 30.8], 'JORDAN', 'jo', { d: 1.0 }); pin(a.iq, [43.5, 33.0], 'IRAQ', 'iq', { d: 1.0 }); pin(a.sy, [38.6, 35.2], 'SYRIA', 'sy', { d: 1.0 }); pin(a.sa, [44.5, 26.5], 'SAUDI ARABIA', 'sa', { d: 1.3, size: 42 });
  pin(a.america, [-98, 39], 'USA', 'us', { d: 1.2 }); pin(a.hormuz + 0.6, [57.0, 25.7], 'OMAN', 'om', { d: 1.2 });

  // ---- voyageurs
  pathLeg('jeep', [[35.25, 32.2], [36.6, 32.3], [38.2, 32.45]], a.drive - 0.5, a.country + 0.2, 0, 0, { size: 150, follow: false, wake: 'rgba(255,255,255,.7)', hold: 1.0 });
  pathLeg('truck', [[35.2, 31.5], [36.6, 31.6], [37.9, 31.8]], a.drive - 0.3, a.country + 0.35, 0, 0, { size: 160, follow: false, wake: 'rgba(255,255,255,.7)', hold: 0.9 });
  pathLeg('b2', [WHITEMAN, [-60, 44], [-30, 42], [-5, 37], [15, 35.5], [35, 34], FORDO], a.b2b - 0.3, a.mEnd + 0.5, 300, 7000, { size: 150, wake: 'rgba(255,255,255,.85)', dy: 60 });
  const lane = [[54.6, 26.5], [55.6, 26.45], [56.15, 26.62], [56.5, 26.48], [56.9, 26.2], [57.5, 25.7]];
  for (let i = 0; i < 4; i++) pathLeg('tanker', lane, a.hormuz - 0.3 + i * 0.5, a.hormuz + 7 + i * 0.5, 0, 0, { size: 80, follow: false, linear: true, wake: 'rgba(255,255,255,.7)', hold: 0.2, vis0: a.hormuz - 0.3 + i * 0.5 });

  const st = (t, d, lon, lat, s, o = {}) => ({ t, d, lon, lat, s, ...o });
  const stops = [
    st(0, 0, 46, 31.5, 1500, { drift: 0.05 }),
    st(a.strikes + 0.6, 1.0, 46, 32, 2000),
    st(a.drive + 0.3, 1.2, 37.2, 32.0, 4200, { drift: 0.03 }),
    st(a.map + 0.4, 1.0, 46, 31, 1600),
    st(a.thousand + 0.4, 1.0, 43, 33, 2000),
    st(a.ny + 0.3, 0.9, 42, 33.5, 2600),
    st(a.border + 0.2, 1.0, 40, 31, 2200),
    st(a.sa + 0.5, 0.9, 42, 28.5, 1800),
    st(a.b2 + 0.7, 1.4, 35.1, 31.4, 9000),
    st(a.narrow + 0.5, 1.2, 34.95, 32.3, 24000, { drift: 0.02 }),
    st(a.shield + 0.2, 1.0, 35.4, 31.6, 7000),
    st(a.space + 0.2, 0.9, 36, 31.4, 4600),
    st(a.b3 + 0.5, 1.1, 53.5, 32.5, 2700),
    st(a.alaska + 0.3, 0.8, 53.5, 33, 2200),
    st(a.zagros + 0.3, 1.0, 49.5, 32.5, 4200),
    st(a.nuclear + 0.6, 1.4, FORDO[0], FORDO[1], 22000, { drift: 0.02 }),
    st(a.k300 + 0.4, 0.6, FORDO[0], FORDO[1] - 0.04, 28000),
    st(a.america + 0.2, 1.1, -40, 38, 280),
    // (B-2 suivi jusqu'à Fordo)
    st(a.water - 0.2, 1.0, 52, 30, 3200),
    st(a.hormuz + 0.4, 1.4, 56.3, 26.6, 16000, { drift: 0.02 }),
    st(a.k21 + 0.3, 0.8, 56.35, 26.65, 21000),
    st(a.oil + 0.1, 1.0, 56.0, 26.5, 13000),
    st(a.b5 + 0.3, 1.2, 46, 31.5, 1800),
    st(a.which + 0.4, 0.9, 46, 31, 2300),
    st(a.comments + 0.2, 0.8, 46, 31.5, 1900, { drift: 0.04 }),
  ];
  cam = makeCam2(stops);
  for (const L of LEGS) L.s0 = cam(L.t0 - 0.01).s;
  for (const L of LEGS.filter(L => L.follow)) for (let t = L.t0; t <= L.t1 + 1e-6; t += 0.12) { const u = prog(t, L.t0, L.t1 - L.t0); const ll = L.at(L.u(t)); const sc = u < 0.5 ? Math.exp(lerp(Math.log(L.s0), Math.log(L.sMid), ease(u * 2))) : Math.exp(lerp(Math.log(L.sMid), Math.log(L.sEnd), ease(u * 2 - 1))); stops.push(st(t, 0.12, ll[0], ll[1] - L.dy / sc * 57.3 / 1.25, sc, { lin: true, drift: 0.02 })); }
  cam = makeCam2(stops);
  A.stops = stops;
  A.tilt = [[a.drive - 0.6, a.map, 18], [a.b2 - 0.2, a.nine + 0.5, 16], [a.b2b - 0.3, a.mEnd, 20], [a.hormuz - 0.4, a.k21 + 1, 18]];
  A.parts = [];

  // ---- sons et actions
  for (let i = 1; i < stops.length; i++) { const s = stops[i]; if (s.lin) continue; const p = cam(s.t - s.d - 0.01).s; if (Math.abs(Math.log(s.s / p)) > 0.25 || s.d >= 1.0) ev(s.t - s.d, 'whoosh'); }
  for (const L of LEGS) { ev(L.t0, L.spr === 'tanker' ? 'wave' : L.spr === 'b2' ? 'jet' : 'engine'); act(L.t0, L.spr, 'voyage'); }
  for (const f of FILLS) for (const x of f.fl) { ev(x, 'scan'); act(x, 'drapeau', f.g); }
  for (const p of PINS) { ev(p.t + 0.05, 'pop'); act(p.t, 'étiquette', p.name); }
  const E = (t, type, who) => { ev(t, type); if (who) act(t, who, 'anime'); };
  E(a.strikes, 'whoosh', 'missiles'); E(a.strikes + 0.4, 'whoosh'); E(a.country + 0.3, 'stamp', 'barrière'); E(a.why, 'pop', 'narrateur'); E(a.map, 'ding');
  E(a.thousand, 'draw', 'arc 984 miles'); E(a.apart, 'pop'); E(a.ny, 'draw', 'New York–Chicago'); E(a.chicago, 'pop'); E(a.border, 'stamp'); E(a.way, 'stamp', 'barrière');
  E(a.jersey, 'thud', 'New Jersey'); E(a.narrow, 'tic'); E(a.nine, 'draw', 'règle 9 miles'); E(a.shield, 'shine', 'dôme'); E(a.stopsW, 'jet', 'fusée'); E(a.space, 'sparkle'); E(a.space + 0.2, 'boing');
  E(a.alaska, 'thud', 'Alaska'); E(a.zagros, 'draw', 'montagnes'); E(a.k900, 'pop'); E(a.nuclear, 'pop', 'bunker'); E(a.k300, 'draw'); E(a.k300 + 0.3, 'boing'); E(a.b2b, 'pop'); E(a.mEnd + 0.5, 'thud', 'bombe'); E(a.mEnd + 0.9, 'impact');
  E(a.water, 'water'); E(a.hormuz, 'ping'); E(a.k21, 'draw', 'règle 21 miles'); E(a.normally - 0.3, 'sweep', 'décor Ormuz'); E(a.fifth, 'pop', 'goutte de pétrole'); E(a.oil, 'count');
  E(a.b5, 'pop', 'montagnes'); E(a.shield5, 'pop', 'dôme'); E(a.shield5 + 0.4, 'stamp'); E(a.which, 'boing', 'narrateur'); E(a.comments, 'ding'); E(a.comments + 0.2, 'pop');
  window.PREVIEW = [0.3, a.strikes + 0.5, a.drive + 0.5, a.country + 0.6, a.why + 0.3, a.thousand + 0.6, a.chicago + 0.3, a.border + 0.3, a.sa + 0.3, a.jersey + 0.5, a.narrow + 0.2, a.nine + 0.6, a.shield + 0.6, a.space + 0.4, a.alaska + 0.4, a.zagros + 0.8, a.k900 + 0.4, a.nuclear + 0.7, a.k300 + 0.5, a.america + 0.4, a.b2b + 0.9, a.mEnd + 0.6, a.hormuz + 0.6, a.k21 + 0.5, a.fifth + 0.3, a.b5 + 0.5, a.which + 0.4, a.comments + 0.4];
}
function tiltAt(t) { let v = 0; for (const [t0, t1, deg] of A.tilt) { if (t < t0 || t > t1 + 1) continue; v = Math.max(v, deg * Math.min(ease((t - t0) / 0.9), 1 - ease((t - t1) / 1))); } return v * Math.PI / 180; }
function angAt(t) { return (6 * Math.sin(2 * Math.PI * t / 13) + 2.5 * Math.sin(2 * Math.PI * t / 7 + 1)) * Math.PI / 180; }

// ---------- calque carte ----------
function overlayShape(g, t, t0, t1, col) {
  if (t < t0 || t > t1 + 0.35) return; const p = easeOut(prog(t, t0, 0.35)); const al = fadeOut(t, t1, 0.35);
  m.save(); m.globalAlpha = al; const b = d3.geoPath(P).bounds(g); const cx = (b[0][0] + b[1][0]) / 2, cy = (b[0][1] + b[1][1]) / 2; const sc = lerp(1.6, 1, p);
  m.translate(cx, cy); m.scale(sc, sc); m.translate(-cx, -cy - (1 - p) * 140);
  pathM(g); m.fillStyle = col; m.globalAlpha = al * 0.45; m.fill(); m.globalAlpha = al; m.setLineDash([14, 9]); m.lineWidth = 5; m.strokeStyle = '#fff'; m.shadowColor = col; m.shadowBlur = 14; m.stroke(); m.restore();
}
function mapLayer(t) {
  const a = A;
  gcDash(TLV, THR, t, a.thousand - 0.2, a.border - 0.2);
  if (t > a.ny - 0.1 && t < a.border) { const f = 711 / 984; const B = d3.geoInterpolate(TLV, THR)(f); const off = [0.0, -1.4]; gcDash([TLV[0] + off[0], TLV[1] + off[1]], [B[0] + off[0], B[1] + off[1]], t, a.ny, a.border - 0.2, '#ffffff', 6); }
  overlayShape(D.njOnIl, t, a.jersey - 0.1, a.narrow, '#2f6bff');
  overlayShape(D.akOnIr, t, a.alaska - 0.1, a.zagros - 0.2, '#3fa9ff');
}

// ---------- calque écran ----------
function screenScene(c, t) {
  const a = A; const BX = 150, BY = 1290;
  // accroche
  missileArc(c, [48.5, 34.2], [34.9, 31.9], t, a.strikes - 0.1, a.strikes + 1.4, { size: 90 });
  missileArc(c, [34.9, 31.6], [50.5, 33.5], t, a.strikes + 0.3, a.strikes + 1.8, { size: 90, col: 'rgba(90,170,255,.95)' });
  if (t > a.country - 0.1 && t < a.map + 0.3) { const p = S(38.6, 32.15); const s = popIn(t, a.country - 0.1, 0.3) * fadeOut(t, a.map, 0.25); c.save(); c.translate(p.x + 40, p.y + 30); c.scale(s, s); sprite(c, 'barrier', 0, 0, 150); c.restore(); stampText(c, 'NO WAY THROUGH', CX, 420, t, a.country + 0.3, a.map, { size: 70 }); }
  charSpr(c, 'guy_point', BX, BY, 330, t, a.why - 0.1, a.b1 + 0.4);
  // distance
  if (t > a.thousand && t < a.border) { const p = S(43.5, 35.6); pill(c, '984 MILES', p.x, p.y - 20, t, a.thousand + 0.3, a.border - 0.2, { size: 56 }); }
  if (t > a.ny && t < a.border) { const f = 711 / 984; const B = d3.geoInterpolate(TLV, THR)(f * 0.5); const p = S(B[0], B[1] - 1.4); pill(c, 'NEW YORK → CHICAGO: 711 MI', p.x, p.y + 60, t, a.ny + 0.3, a.border - 0.2, { size: 38, bg: '#fff' }); }
  stampText(c, 'NO SHARED BORDER', CX, 420, t, a.border, a.jo + 0.2, { size: 70, col: '#C00E1F' });
  if (t > a.way - 0.2 && t < a.b2 + 0.2) { const p = S(39.5, 31.8); const s = popIn(t, a.way - 0.2, 0.3) * fadeOut(t, a.b2, 0.2); c.save(); c.translate(p.x, p.y); c.scale(s, s); sprite(c, 'barrier', 0, 40, 170); c.restore(); }
  // Israël
  if (t > a.jersey && t < a.narrow) { pill(c, 'ISRAEL ≈ NEW JERSEY', CX, 420, t, a.jersey + 0.2, a.narrow - 0.1, { size: 54 }); }
  ruler(c, [34.853, 32.32], [35.013, 32.32], '9 MILES', t, a.nine - 0.3, a.shield - 0.2, { size: 62 });
  if (t > a.shield - 0.2 && t < a.b3 + 0.2) { const p = S(35.0, 31.6); const al = fadeOut(t, a.b3, 0.25); const k = backOut(prog(t, a.shield - 0.2, 0.5)); c.save(); c.globalAlpha = al * 0.95; const img = SPR.dome; const w = 520 * k, h = w * img.height / img.width; c.drawImage(img, p.x - w / 2, p.y - h + 30, w, h); c.restore();
    pill(c, 'A SHIELD IN THE SKY', CX, 420, t, a.shield, a.layer, { size: 54, bg: '#3fa9ff', color: '#fff' });
    if (t > a.stopsW - 0.4) { const g = c.createLinearGradient(0, 0, 0, 360); g.addColorStop(0, 'rgba(8,10,40,.9)'); g.addColorStop(1, 'rgba(8,10,40,0)'); c.save(); c.globalAlpha = al * clamp((t - a.stopsW + 0.4) / 0.5); c.fillStyle = g; c.fillRect(0, 0, W, 360); for (let i = 0; i < 50; i++) { c.fillStyle = '#fff'; c.fillRect((i * 331) % W, 40 + (i * 97) % 240, 3, 3); } txt(c, 'SPACE', CX, 120, { size: 64, weight: 900, color: '#bcd7ff' }); c.restore();
      const u = easeOut(prog(t, a.stopsW - 0.3, 1.6)); sprite(c, 'rocket', p.x + 20, lerp(p.y - 80, 260, u) + 120, 200, { shadow: false }); }
  }
  charSpr(c, 'guy_shock', BX, BY, 330, t, a.space - 0.1, a.b3);
  // Iran
  if (t > a.alaska && t < a.zagros) { pill(c, 'IRAN ≈ ALASKA', CX, 420, t, a.alaska + 0.2, a.zagros - 0.2, { size: 58 }); }
  mountains(c, D.zagros, t, a.zagros - 0.2, a.nuclear, { rows: [-1, 0, 1], step: 0.05, h: 40 });
  mapWrite(c, 'Zagros', [47.0, 31.0], t, a.zagros, a.nuclear - 0.2, { size: 92 });
  pill(c, '900+ MILES OF MOUNTAINS', CX, 420, t, a.k900, a.nuclear - 0.2, { size: 50 });
  ping2(c, FORDO, t, a.nuclear, a.america - 0.3, 'FORDOW', { size: 52, col: '#ffcf3a' });
  if (t > a.nuclear + 0.2 && t < a.america) { const al = fadeOut(t, a.america - 0.3, 0.25); const s = popIn(t, a.nuclear + 0.2, 0.35); c.save(); c.globalAlpha = al; c.translate(600, 1060); c.scale(s, s); const img = SPR.bunker; const w = 520, h = w * img.height / img.width; c.drawImage(img, -w / 2, -h / 2, w, h);
    if (t > a.k300 - 0.1) { const k = easeOut(prog(t, a.k300 - 0.1, 0.5)); c.lineWidth = 8; c.strokeStyle = '#FFE928'; c.beginPath(); c.moveTo(-w / 2 - 40, -h / 2 + 30); c.lineTo(-w / 2 - 40, -h / 2 + 30 + h * 0.66 * k); c.stroke(); txt(c, '300 FT', -w / 2 - 40, -h / 2 - 10, { size: 54, color: '#FFE928', stroke: '#1b1300', sw: 9 }); }
    c.restore(); }
  pill(c, 'B-2 BOMBERS FROM MISSOURI', CX, 420, t, a.b2b, a.mEnd + 0.4, { size: 46, bg: '#fff' });
  if (t > a.mEnd + 0.4 && t < a.water + 0.2) { const p = S(...FORDO); const u = prog(t, a.mEnd + 0.4, 0.4); if (u < 1) sprite(c, 'bomb', p.x, lerp(200, p.y, easeIn(u)), 150, { shadow: false }); else { const k = prog(t, a.mEnd + 0.8, 0.6); c.save(); c.globalAlpha = (1 - k) * 0.9; c.beginPath(); c.arc(p.x, p.y, 40 + 220 * k, 0, 7); c.lineWidth = 14; c.strokeStyle = '#fff'; c.stroke(); c.restore(); } }
  // Ormuz
  if (t > a.water - 0.1 && t < a.hormuz + 0.3) bigWord(c, 'WATER', CX, 440, t, a.water - 0.1, a.hormuz, { size: 130, color: '#4fd6ff' });
  if (t > a.hormuz - 0.1 && t < a.normally) { const p = S(56.3, 26.65); ring(c, p.x, p.y, 120, t, a.hormuz + 0.3, a.normally - 0.2); mapWrite(c, 'Strait of Hormuz', [56.5, 27.4], t, a.hormuz, a.normally - 0.2, { size: 72 }); }
  ruler(c, HORMUZ_N, HORMUZ_S, '21 MILES', t, a.k21 - 0.2, a.normally - 0.2, { size: 58, dy: -50 });
  decoReveal(c, DECO.hormuz, [56.3, 26.6], t, a.normally - 0.3, a.through + 0.2);
  if (t > a.fifth - 0.1 && t < a.through + 0.6) { const s = popIn(t, a.fifth - 0.1, 0.3) * fadeOut(t, a.through + 0.3, 0.2); c.save(); c.translate(780, 1080); c.scale(s, s); sprite(c, 'oildrop', 0, 100, 220); c.restore(); pill(c, "≈ 1/5 OF THE WORLD'S OIL", CX, 420, t, a.fifth, a.through + 0.3, { size: 50 }); }
  // fin
  if (t > a.b5 - 0.1) { const s1 = popIn(t, a.b5, 0.3), s2 = popIn(t, a.shield5, 0.3); c.save(); c.translate(290, 760); c.scale(s1, s1); sprite(c, 'ridge', 0, 60, 150); c.restore(); c.save(); c.translate(790, 760); c.scale(s2, s2); const img = SPR.dome; const w = 340, h = w * img.height / img.width; c.drawImage(img, -w / 2, 60 - h, w, h); c.restore();
    if (t > a.shield5 + 0.3) { c.save(); c.translate(CX, 700); const s = stampScale(t, a.shield5 + 0.3); c.scale(s, s); txt(c, 'VS', 0, 0, { size: 150, weight: 900, color: '#FFE928', stroke: '#1b1300', sw: 16 }); c.restore(); }
    tag(c, 'MOUNTAINS', 290, 860, { size: 44, bg: '#8a5a2b', sc: s1 }); tag(c, 'SHIELD', 790, 860, { size: 44, bg: '#2f6bff', sc: s2 }); }
  bigWord(c, 'WHICH ONE WINS?', CX, 470, t, a.which, DUR + 1, { size: 96 });
  charSpr(c, 'guy_shock', BX, BY, 330, t, a.which - 0.1, a.tell);
  if (t > a.tell - 0.1) { charSpr(c, 'guy_cross', BX, BY, 330, t, a.tell - 0.1, DUR + 1); tag(c, 'TELL ME IN THE COMMENTS', CX, 1600, { size: 46, bg: '#C00E1F', border: '#fff', sc: stampScale(t, a.comments) }); }
}

// ============ RENDU ============
window.render = function (t) {
  const st = cam(t); cam_s = st.s; ANG = angAt(t); TILT = tiltAt(t);
  P = d3.geoMercator().rotate([-st.lon, 0]).center([0, st.lat]).scale(st.s).translate([CX + OX, CY + OY]).precision(0).clipExtent([[0, 0], [MW, MH]]);
  drawSat(st); drawFills(t); mapLayer(t); drawWakes(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#0b3a52'; ctx.fillRect(0, 0, W, H);
  if (TILT < 0.001) { ctx.save(); ctx.translate(CX, CY); ctx.rotate(ANG); ctx.translate(-CX - OX, -CY - OY); ctx.drawImage(mapC, 0, 0); ctx.restore(); }
  else {
    rc.setTransform(1, 0, 0, 1, 0, 0); rc.clearRect(0, 0, MW, MH); rc.translate(CX + OX, CY + OY); rc.rotate(ANG); rc.translate(-CX - OX, -CY - OY); rc.drawImage(mapC, 0, 0); rc.setTransform(1, 0, 0, 1, 0, 0);
    const sn = Math.sin(TILT), cs = Math.cos(TILT), band = 5;
    for (let y = 0; y < H; y += band) { const a0 = y - CY, a1 = y + band - CY; const v0 = a0 * FOC / (FOC * cs + a0 * sn), v1 = a1 * FOC / (FOC * cs + a1 * sn); const k = FOC / (FOC - ((v0 + v1) / 2) * sn); const sy = CY + OY + v0; if (sy < 0 || sy + v1 - v0 > MH) continue; ctx.drawImage(rotC, 0, sy, MW, Math.max(1, v1 - v0), CX - k * (CX + OX), y, MW * k, band + 0.6); }
    const hz = ctx.createLinearGradient(0, 0, 0, 300); hz.addColorStop(0, `rgba(200,225,240,${0.45 * TILT / 0.5})`); hz.addColorStop(1, 'rgba(200,225,240,0)'); ctx.fillStyle = hz; ctx.fillRect(0, 0, W, 300);
  }
  drawPins(ctx, t); drawTravelers(ctx, t);
  ctx.save(); ctx.globalAlpha = 0.06; ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = ctx.createPattern(GRAIN, 'repeat'); ctx.translate((t * 997) % 256, (t * 613) % 256); ctx.fillRect(-256, -256, W + 512, H + 512); ctx.restore();
  const vg = ctx.createRadialGradient(CX, CY, 650, CX, CY, 1200); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.32)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  if (!window.CLEAN) { screenScene(ctx, t); drawDate(ctx, t); drawSubs(ctx, t); }
};

const loadImg = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
window.init = async function () {
  canvas = document.getElementById('c'); ctx = canvas.getContext('2d');
  const [dd, tm] = await Promise.all(['data.json', 'timing.json'].map(u => fetch(u).then(r => r.json())));
  D = dd; WORDS = tm.words;
  LOWRES = await loadImg('../relief/relief_4096.jpg');
  await Promise.all(['il', 'ir', 'jo', 'iq', 'sy', 'sa', 'om', 'ae', 'us', 'fr'].map(async k => { FL[k] = await loadImg('flags/' + k + '.svg'); }));
  const names = ['jeep', 'truck', 'barrier', 'ridge', 'dome', 'rocket', 'missile', 'b2', 'bomb', 'bunker', 'tanker', 'oildrop', 'guy_point', 'guy_shock', 'guy_cross', 'globe'];
  await Promise.all(names.map(async n => { SPR[n] = await loadImg('spr/' + n + '.png'); }));
  await Promise.all(['ramon', 'damavand', 'kavir', 'hormuz'].map(async n => { DECO[n] = await loadImg('deco/' + n + '.jpg'); }));
  makeGrain(); buildSubs(SCRIPT); setup();
  { const need = new Set(); for (let t = 0; t <= DUR; t += 0.1) { const c = cam(t); for (const [tx, ty] of tilesFor(c)) need.add(ty + '_' + tx); } await Promise.all([...need].map(async n => { TILES[n] = await loadImg('../relief/tiles/' + n + '.jpg'); })); window.NTILES = need.size; }
  window.CAM = { dur: DUR, camAt: t => cam(t), angAt, tiltAt };
  window.VISUALS = SUBS.map(x => x.t0); window.DUR = DUR; window.READY = true;
};
