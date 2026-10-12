// scene.js — La géographie qui empêche l'Iran et Israël de se toucher. 16:9, window.render(t) déterministe.
const CX = 540, CY = 900, OX = 470, OY = 680, MW = 2020, MH = 3060, FOC = 1400; const CAMK = 0.58;
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
    const att = clamp(1 - Math.log(cam_s / (f.g === 'il' ? 40000 : f.g === 'ae' || f.g === 'om' ? 9000 : 7000)) / Math.log(6), 0.2, 1);
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
  // accroche
  a.douze = T(0, 'douze'); a.missile = T(0, 'missile'); a.israel0 = T(0, 'israel'); a.armee0 = T(0, 'armee'); a.imposs = T(0, 'impossible'); a.km0 = T(0, 'mille'); a.deserts = T(0, 'deserts'); a.montagnes0 = T(0, 'montagnes'); a.pays23 = T(0, 'deux', 2); a.iran0 = T(0, 'liran'); a.toucher0 = T(0, 'toucher'); a.carte0 = T(0, 'carte'); a.fin0 = T(0, 'fin'); a.arme0 = T(0, 'larme'); a.missile0b = T(0, 'missile', 2); a.avion0 = T(0, 'avion'); a.passage0 = T(0, 'passage'); a.k35 = T(0, 'trentecinq');
  // partie 1
  a.b1 = beatStart(1); a.israel1 = T(1, 'israel'); a.medit = T(1, 'mediterranee'); a.iran1 = T(1, 'liran'); a.km1 = T(1, 'mille'); a.lisb = T(1, 'parislisbonne'); a.front = T(1, 'frontieres'); a.k900 = T(1, 'neuf'); a.jo = T(1, 'jordanie'); a.iq = T(1, 'lirak'); a.sy = T(1, 'syrie'); a.sa = T(1, 'larabie'); a.envahir = T(1, 'envahir'); a.traverser = T(1, 'traverser'); a.desert1 = T(1, 'desert'); a.ciel = T(1, 'ciel'); a.missile1 = T(1, 'missile'); a.douze1 = T(1, 'douze'); a.drone = T(1, 'drone'); a.heures = T(1, 'heures'); a.avions = T(1, 'avions'); a.plein = T(1, 'plein'); a.vol = T(1, 'vol');
  // partie 2
  a.b2 = beatStart(2); a.israel2 = T(2, 'israel'); a.k22 = T(2, 'vingtdeux'); a.bzh = T(2, 'bretagne'); a.etroit = T(2, 'etroit'); a.cisj = T(2, 'cisjordanie'); a.k15 = T(2, 'quinze'); a.paris = T(2, 'largeur'); a.dix = T(2, 'dix'); a.cotiere = T(2, 'plaine'); a.reculer = T(2, 'reculer'); a.toit = T(2, 'toit'); a.etages = T(2, 'trois'); a.bas = T(2, 'bas'); a.dome = T(2, 'dome'); a.milieu = T(2, 'milieu'); a.fronde = T(2, 'fronde'); a.haut = T(2, 'haut'); a.arrow = T(2, 'arrow'); a.espace = T(2, 'lespace'); a.abo2 = T(2, 'abonnetoi');
  // partie 3
  a.b3 = beatStart(3); a.retour = T(3, 'retournement'); a.geant = T(3, 'geant'); a.million = T(3, 'million'); a.france3 = T(3, 'france'); a.israel3 = T(3, 'israel'); a.k75 = T(3, 'soixantequinze'); a.k90m = T(3, 'quatrevingtdix'); a.relief = T(3, 'relief'); a.zagros = T(3, 'zagros'); a.muraille = T(3, 'muraille'); a.k4000 = T(3, 'quatre', 2); a.elbourz = T(3, 'lelbourz'); a.dama = T(3, 'damavand'); a.teheran = T(3, 'teheran'); a.perchee = T(3, 'perchee'); a.plateau = T(3, 'plateau'); a.lut = T(3, 'lut'); a.sat = T(3, 'satellites'); a.k80 = T(3, 'quatrevingts'); a.chauds = T(3, 'chauds'); a.forteresse = T(3, 'forteresse'); a.epreuve = T(3, 'lepreuve'); a.irak3 = T(3, 'irakienne'); a.sudouest = T(3, 'sudouest'); a.jamais = T(3, 'jamais'); a.huit = T(3, 'huit');
  // partie 4
  a.b4 = beatStart(4); a.relief4 = T(4, 'relief'); a.fordo = T(4, 'fordo'); a.qom = T(4, 'qom'); a.creuse = T(4, 'creuse'); a.k90 = T(4, 'quatrevingtdix'); a.profond = T(4, 'profond'); a.juin = T(4, 'juin'); a.usa4 = T(4, 'etatsunis'); a.b2b = T(4, 'bombardiers'); a.amerique = T(4, 'damerique'); a.treize = T(4, 'treize'); a.douze4 = T(4, 'douze', 2); a.seule = T(4, 'seule'); a.premiere = T(4, 'premiere'); a.non = T(4, 'non');
  // partie 5
  a.b5 = beatStart(5); a.voici = T(5, 'voici'); a.ormuz = T(5, 'dormuz'); a.k35b = T(5, 'trentecinq'); a.oman = T(5, 'oman'); a.cinq = T(5, 'cinquieme'); a.iles = T(5, 'iles'); a.abou = T(5, 'abou'); a.tomb = T(5, 'tomb'); a.emirats = T(5, 'emirats'); a.defenses = T(5, 'defenses'); a.lile = T(5, 'lile'); a.rouge = T(5, 'rouge'); a.mange = T(5, 'mange'); a.epice = T(5, 'epice'); a.fevrier = T(5, 'fevrier'); a.usa5 = T(5, 'etatsunis'); a.repondu = T(5, 'repondu'); a.mars = T(5, 'mars'); a.arrete = T(5, 'arrete'); a.agence = T(5, 'lagence'); a.k400 = T(5, 'quatre'); a.toucher5 = T(5, 'toucher'); a.k35c = T(5, 'trentecinq', 2); a.monde = T(5, 'monde', 2);
  // fin
  a.b6 = beatStart(6); a.r1 = T(6, 'mille'); a.r2 = T(6, 'petit'); a.r3 = T(6, 'geant'); a.r4 = T(6, 'montagnebunker'); a.r5 = T(6, 'porte'); a.voila = T(6, 'voila'); a.toi = T(6, 'toi', 2); a.dist = T(6, 'distance'); a.bouclier = T(6, 'bouclier'); a.mb = T(6, 'montagnebunker', 2); a.disle = T(6, 'disle'); a.proch = T(6, 'prochaine'); a.abo = T(6, 'abonnetoi'); a.fin = TE(6, 'carte');
  DUR = a.fin + 0.6;

  for (const k of ['il', 'ir', 'jo', 'iq', 'sy', 'sa', 'om', 'ae', 'us', 'fr']) GEO[k] = D.c[k]; GEO.bzh = D.bzh; GEO.ilBzh = D.ilOnBzh;
  const F = (g, flag, t0, t1, fl = [], o = {}) => FILLS.push({ g, flag, t0, t1, fl: [t0, ...fl].sort((x, y) => x - y), ...o });
  F('ir', 'ir', a.missile - 0.6, DUR + 1, [a.iran1, a.geant, a.relief4 - 0.2, a.ormuz, a.r3], { mode: 'stretch', col: 'ir' });
  F('il', 'il', a.israel0, DUR + 1, [a.israel1, a.israel2, a.reculer, a.r2], { mode: 'slice', col: 'il' });
  for (const [k, t] of [['jo', a.jo], ['iq', a.iq], ['sy', a.sy], ['sa', a.sa]]) F(k, 'g', t, a.ciel + 0.4, [], { hold: 1.2, dim: 0.5 });
  F('iq', 'iq', a.irak3, a.huit + 0.8, [], { mode: 'stretch', hold: 1.0, dim: 0.3 });
  F('us', 'us', a.usa4 - 0.2, a.amerique + 1.2, [], { mode: 'slice' });
  F('om', 'om', a.oman, a.iles + 0.3, [], { mode: 'stretch' });
  F('ae', 'ae', a.emirats, a.lile, [], { mode: 'stretch', hold: 1.2, dim: 0.3 });
  F('bzh', 'fr', a.bzh - 0.3, a.etroit - 0.2, [], { mode: 'stretch', col: 'fr', max: 0.5, dim: 0.35 });
  const pin = (t, ll, name, flag, o = {}) => PINS.push({ t, ll, name, flag, ...o });
  pin(a.israel0, [35.0, 31.3], 'ISRAËL', 'il', { d: 1.8 }); pin(a.missile + 0.6, [54, 32.5], 'IRAN', 'ir', { d: 2.4 });
  pin(a.israel1, [35.0, 31.3], 'ISRAËL', 'il'); pin(a.iran1, [54, 32.5], 'IRAN', 'ir');
  pin(a.jo, [36.5, 30.8], 'JORDANIE', 'jo', { d: 1.2 }); pin(a.iq, [43.5, 33.0], 'IRAK', 'iq', { d: 1.2 }); pin(a.sy, [38.6, 35.2], 'SYRIE', 'sy', { d: 1.2 }); pin(a.sa, [44.5, 26.5], 'ARABIE SAOUDITE', 'sa', { d: 1.6, size: 42 });
  pin(a.usa4, [-98, 39], 'ÉTATS-UNIS', 'us', { d: 1.6 }); pin(a.oman, [57.0, 25.6], 'OMAN', 'om', { d: 2.0 }); pin(a.emirats, [54.6, 24.6], 'ÉMIRATS ARABES UNIS', 'ae', { d: 2.2, size: 40 });

  // ---- voyageurs
  pathLeg('drone', [[47.5, 33.6], [44, 33.2], [40, 32.6]], a.drone - 0.1, a.heures + 0.9, 3600, 3600, { size: 120, follow: false, linear: true, wake: 'rgba(255,170,90,.9)' });
  pathLeg('jet_il', [[34.9, 31.6], [38.5, 32.4], [42.5, 33.1], [45.5, 33.6]], a.avions - 0.15, a.vol + 0.6, 3300, 7800, { size: 140, wake: 'rgba(255,255,255,.9)', dy: 40 });
  pathLeg('tanker', [[36.2, 31.2], [39.4, 31.9], [43.3, 32.6], [46.2, 33.1]], a.avions - 0.15, a.vol + 0.6, 0, 0, { size: 190, follow: false, wake: null });
  pathLeg('b2', [WHITEMAN, [-60, 44], [-30, 42], [-5, 37], [15, 35.5], [35, 34], FORDO], a.b2b - 0.1, a.treize - 0.15, 330, 9000, { size: 160, wake: 'rgba(255,255,255,.85)', dy: 60 });
  const lane = [[54.6, 26.5], [55.6, 26.45], [56.15, 26.62], [56.5, 26.48], [56.9, 26.2], [57.5, 25.7]];
  for (let i = 0; i < 5; i++) pathLeg('oiltanker', lane, a.cinq - 1.4 + i * 0.55, a.cinq + 9 + i * 0.55, 0, 0, { size: 90, follow: false, linear: true, wake: 'rgba(255,255,255,.7)', hold: 0.2, vis0: a.cinq - 1.4 + i * 0.55 });
  for (let i = 0; i < 4; i++) pathLeg('oiltanker', [[54.9, 26.35], [55.8, 26.38], [56.2, 26.5], [56.6, 26.4], [57.1, 26.0]], a.fevrier + i * 0.6, a.fevrier + 14 + i * 0.6, 0, 0, { size: 90, follow: false, linear: true, wake: 'rgba(255,255,255,.7)', stopAt: a.mars + 0.6, hold: Math.max(0.3, a.toucher5 - (a.fevrier + 14 + i * 0.6)) });
  pathLeg('boat', [[55.6, 26.0], [55.25, 26.15], [55.05, 25.95]], a.defenses - 0.3, a.lile - 0.2, 0, 0, { size: 90, follow: false, wake: 'rgba(255,255,255,.8)' });

  const st = (t, d, lon, lat, s, o = {}) => ({ t, d, lon, lat, s, ...o });
  const REG = [44, 31.2, 3300];
  const stops = [
    st(0, 0, 45, 31.6, 2600, { drift: 0.045 }),
    st(a.israel0 + 0.2, 1.2, 43, 31.5, 3300),
    st(a.imposs + 0.1, 1.1, 41, 31.0, 4200),
    st(a.montagnes0 + 0.2, 1.2, 50, 32.5, 5800),
    st(a.iran0 + 0.3, 1.1, 44, 31.5, 3000),
    st(a.carte0 + 0.2, 1.0, 46, 30.5, 3600),
    st(a.missile0b + 0.1, 1.1, 50, 28.5, 3300),
    st(a.k35 + 0.5, 1.6, 56.3, 26.6, 34000, { drift: 0.03 }),
    // partie 1
    st(a.b1 + 0.6, 1.4, 42, 31.5, 3200),
    st(a.israel1 + 0.4, 1.0, 36.5, 31.5, 6200),
    st(a.iran1 + 0.3, 1.2, 50, 32.5, 4300),
    st(a.lisb + 0.2, 1.0, 43, 32.0, 3200),
    st(a.k900 + 0.2, 1.0, 40.5, 33.6, 4800),
    st(a.jo + 0.2, 0.9, 40, 31.5, 4300),
    st(a.sa + 0.4, 1.0, 42, 29.5, 3600),
    st(a.traverser + 0.4, 1.1, 41.5, 32, 4300),
    st(a.ciel + 0.2, 1.0, 43, 33, 3500),
    st(a.douze1 + 0.3, 1.0, 42, 32.5, 4000),
    st(a.drone + 0.3, 1.0, 44, 33, 5000),
    // (chasseur + ravitailleur suivis)
    // partie 2
    st(a.b2 + 0.6, 1.2, 35.2, 31.4, 11000, { drift: 0.03 }),
    st(a.k22 + 0.2, 0.9, 35.0, 31.6, 14000),
    st(a.bzh + 0.1, 1.6, -3.6, 47.6, 9500),
    st(a.etroit - 0.35, 0.9, 16, 40, 900),
    st(a.etroit + 1.0, 1.35, 34.98, 32.3, 36000, { drift: 0.02 }),
    st(a.paris + 0.3, 0.8, 34.95, 32.28, 46000),
    st(a.dix + 0.3, 1.2, 35.0, 31.8, 15000),
    // décor Tel-Aviv
    st(a.reculer + 0.2, 1.3, 35.1, 31.6, 11000),
    st(a.toit + 0.4, 1.2, 36.5, 31.0, 7200),
    st(a.dome + 0.2, 0.9, 35.6, 31.3, 11000),
    st(a.fronde + 0.2, 1.0, 37.5, 31.4, 5600),
    st(a.arrow + 0.2, 1.1, 38.5, 30.0, 4300),
    st(a.espace + 0.9, 1.0, 37.5, 31.0, 6200),
    st(a.abo2 + 0.2, 1.0, 40, 31, 3600),
    // partie 3
    st(a.b3 + 0.8, 1.2, 53.5, 32.5, 4500, { drift: 0.03 }),
    st(a.million + 0.2, 1.0, 53.5, 32.4, 6200),
    st(a.israel3 + 0.2, 1.0, 53.5, 32.4, 4200),
    st(a.relief + 0.2, 1.0, 50.5, 33.0, 5600),
    st(a.zagros + 0.3, 1.1, 49.0, 32.6, 7500),
    st(a.k4000 + 0.1, 1.0, 50.0, 31.6, 9000),
    st(a.elbourz + 0.3, 1.2, 52.0, 36.0, 4800),
    st(a.dama + 0.6, 1.4, 52.1, 35.85, 48000, { drift: 0.02 }),
    st(a.teheran + 0.3, 1.0, 51.4, 35.6, 16000),
    st(a.plateau + 0.2, 1.1, 55, 32.5, 6500),
    st(a.lut + 0.3, 1.2, 58.9, 30.6, 11000),
    st(a.k80 + 0.2, 0.8, 58.9, 30.5, 13500),
    // décor Lut
    st(a.forteresse + 0.3, 1.2, 50, 32.5, 4800),
    st(a.irak3 + 0.3, 1.2, 48.4, 31.6, 11000),
    st(a.jamais + 0.3, 0.9, 48.8, 32.2, 9500),
    st(a.huit + 0.2, 0.8, 49, 32.3, 8000),
    // partie 4
    st(a.b4 + 0.6, 1.1, 51, 34.0, 7000),
    st(a.fordo + 0.6, 2.0, FORDO[0], FORDO[1], 34000, { drift: 0.02 }),
    st(a.qom + 0.3, 0.8, 50.95, 34.78, 30000),
    st(a.creuse + 0.3, 0.9, FORDO[0], FORDO[1] - 0.03, 30000),
    st(a.profond + 0.4, 1.0, FORDO[0] + 0.1, FORDO[1] - 0.1, 26000),
    st(a.juin + 0.3, 1.1, 51, 34.5, 9000),
    st(a.usa4 + 0.2, 1.5, -40, 40, 330),
    // (B-2 suivi)
    st(a.douze4 + 0.2, 0.9, FORDO[0], FORDO[1], 26000),
    st(a.seule + 0.3, 1.1, 51, 34.4, 9000),
    st(a.premiere + 0.4, 1.0, 51.5, 34.0, 6500),
    // partie 5
    st(a.b5 + 0.6, 1.2, 50, 29, 2400),
    st(a.ormuz + 0.4, 1.8, 56.3, 26.65, 26000, { drift: 0.02 }),
    st(a.oman + 0.3, 1.0, 56.4, 26.4, 19000),
    st(a.cinq + 0.2, 1.0, 56.0, 26.5, 16000),
    st(a.iles + 0.3, 1.2, 55.2, 26.1, 24000),
    st(a.emirats + 0.2, 1.0, 54.9, 25.5, 12000),
    st(a.defenses + 0.2, 0.9, 55.2, 26.05, 21000),
    st(a.lile + 0.3, 1.3, HISL[0], HISL[1], 52000, { drift: 0.02 }),
    // décor Ormuz
    st(a.fevrier + 0.3, 1.2, 56.0, 26.4, 15000),
    st(a.repondu + 0.2, 0.9, 56.2, 26.5, 19000),
    st(a.agence + 0.3, 1.0, 56.0, 26.4, 13000),
    st(a.toucher5 + 0.3, 1.2, 45, 30, 3000),
    st(a.monde + 0.3, 1.5, 70, 30, 520, { drift: 0.03 }),
    // fin
    st(a.b6 + 0.7, 1.2, 46, 31.5, 3000),
    st(a.r2 + 0.2, 1.0, 37.5, 31.4, 6500),
    st(a.r3 + 0.2, 1.0, 51.5, 32.5, 4400),
    st(a.r4 + 0.1, 0.9, FORDO[0], FORDO[1], 9000),
    st(a.r5 + 0.2, 1.0, 56.3, 26.6, 12000),
    st(a.voila + 0.3, 1.3, 46, 31.5, 3100),
    st(a.toi + 0.3, 1.0, 45, 31, 5300),
    st(a.disle + 0.2, 1.0, 44, 31.5, 3300),
    st(a.proch + 0.5, 1.4, 56.3, 26.6, 40000, { drift: 0.02 }),
    st(a.abo + 0.3, 1.2, 46, 31, 3000, { drift: 0.03 }),
  ];
  cam = makeCam2(stops);
  for (const L of LEGS) L.s0 = cam(L.t0 - 0.01).s;
  for (const L of LEGS.filter(L => L.follow)) for (let t = L.t0; t <= L.t1 + 1e-6; t += 0.12) { const u = prog(t, L.t0, L.t1 - L.t0); const ll = L.at(L.u(t)); const sc = u < 0.5 ? Math.exp(lerp(Math.log(L.s0), Math.log(L.sMid), ease(u * 2))) : Math.exp(lerp(Math.log(L.sMid), Math.log(L.sEnd), ease(u * 2 - 1))); stops.push(st(t, 0.12, ll[0], ll[1] - L.dy / sc * 57.3 / 1.25, sc, { lin: true, drift: 0.02 })); }
  { const raw = makeCam2(stops); cam = t => { const c = raw(t); const w = t > 115.5 && t < 123.2 ? Math.min(clamp((t - 115.5) / 0.4), clamp((123.2 - t) / 0.4)) : 0; return { ...c, lon: lerp(c.lon, 36.2, w), lat: lerp(c.lat, 31.8, w), s: c.s * CAMK }; }; }
  A.stops = stops;
  A.tilt = [[a.douze - 0.5, a.israel0, 18], [a.avions - 0.4, a.vol + 0.3, 22], [a.toit, a.espace + 1, 20], [a.relief, a.k4000 + 0.5, 22], [a.elbourz, a.teheran + 0.5, 18], [a.b2b - 0.4, a.treize, 20], [a.ormuz - 0.6, a.cinq + 2, 22], [a.monde - 0.3, a.b6, 18], [a.voila, a.toi + 1, 16], [a.irak3 - 0.3, a.huit, 16]];
  DATES = [[a.epreuve + 0.6, '1980', '#8a5a14'], [a.b4, null], [a.juin, 'JUIN 2025', '#C00E1F'], [a.douze4 + 1, null], [a.fevrier, '2026', '#C00E1F'], [a.toucher5, null]];
  A.parts = [[a.b1 - 0.9, 1, a.b2 - 0.4, 'AUCUNE FRONTIÈRE'], [a.b2 - 0.6, 2, a.b3 - 0.4, 'ISRAËL, MINUSCULE'], [a.b3 - 0.6, 3, a.b4 - 0.3, 'LA FORTERESSE'], [a.b4 - 0.5, 4, a.b5 - 0.4, 'LA MONTAGNE-BUNKER'], [a.b5 - 0.6, 5, a.b6 - 0.3, "L'ARME DE L'EAU"]];

  // ---- sons et actions
  for (let i = 1; i < stops.length; i++) { const s = stops[i]; if (s.lin) continue; const p = cam(s.t - s.d - 0.01).s; if (Math.abs(Math.log(s.s / p)) > 0.25 || s.d >= 1.0) ev(s.t - s.d, 'whoosh'); }
  for (const L of LEGS) { if (L.spr === 'tanker') continue; ev(L.t0, L.spr === 'oiltanker' || L.spr === 'boat' ? 'wave' : 'jet'); act(L.t0, L.spr, 'voyage'); }
  for (const f of FILLS) { ev(f.t0, 'scan'); for (const x of f.fl.slice(1)) ev(x, 'scan'); }
  for (const p of PINS) { ev(p.t + 0.05, 'pop'); act(p.t, 'étiquette', p.name); }
  for (const f of FILLS) for (const x of f.fl) act(x, 'drapeau', f.g);
  for (const [t0] of A.parts) { ev(t0, 'sweep'); ev(t0 + 0.5, 'draw'); act(t0, 'carte de chapitre', 'glisse'); }
  const E = (t, type, who) => { ev(t, type); if (who) act(t, who, 'apparaît'); };
  E(a.douze, 'tic', 'chrono'); E(a.missile, 'whoosh', 'missile'); E(a.imposs, 'stamp'); E(a.km0, 'draw', 'arc 1 500 km'); E(a.deserts, 'pop'); E(a.montagnes0, 'pop', 'montagnes'); E(a.pays23, 'pop'); E(a.toucher0, 'stamp'); E(a.carte0, 'pop', 'guide'); E(a.fin0 + 0.3, 'tic'); E(a.missile0b, 'pop'); E(a.avion0, 'pop'); E(a.passage0, 'shine'); E(a.k35, 'ping');
  E(a.medit, 'ping'); E(a.km1, 'draw'); E(a.lisb, 'pop'); E(a.front, 'tic'); E(a.k900, 'draw'); E(a.envahir, 'boing'); E(a.traverser, 'stamp'); E(a.desert1, 'pop'); E(a.ciel, 'shine'); E(a.missile1, 'whoosh', 'missile'); E(a.douze1, 'count'); E(a.heures, 'tic'); E(a.plein, 'ding'); E(a.vol, 'pop');
  E(a.k22, 'count'); E(a.bzh, 'stamp'); E(a.etroit, 'tic'); E(a.k15, 'draw'); E(a.paris, 'pop'); E(a.dix, 'count'); E(a.cotiere, 'sweep', 'décor Tel-Aviv'); E(a.reculer, 'stamp'); E(a.toit, 'shine'); E(a.etages, 'pop'); E(a.dome, 'shine', 'dôme'); E(a.dome + 0.4, 'pop'); E(a.fronde, 'shine', 'fronde'); E(a.arrow, 'jet', 'intercepteur'); E(a.espace, 'sparkle'); E(a.espace + 0.3, 'boing'); E(a.abo2, 'ding');
  E(a.retour, 'stamp'); E(a.million, 'count'); E(a.france3, 'pop'); E(a.israel3, 'tic'); act(a.israel3, 'carrés Israël', 'remplissent l\'Iran'); E(a.k75, 'ding'); E(a.k90m, 'count'); E(a.zagros, 'draw', 'montagnes Zagros'); E(a.muraille, 'sweep', 'décor Zagros'); E(a.k4000, 'pop'); E(a.elbourz, 'draw'); E(a.dama, 'thud', 'Damavand'); E(a.teheran, 'ping'); E(a.perchee, 'pop'); E(a.plateau, 'pop'); E(a.lut, 'pop', 'chameau'); E(a.sat, 'scan', 'satellite'); E(a.k80, 'count', 'thermomètre'); E(a.chauds, 'sweep', 'décor Lut'); E(a.forteresse, 'stamp'); E(a.epreuve + 0.6, 'tic'); E(a.irak3, 'engine', 'char irakien'); E(a.jamais, 'stamp'); E(a.huit, 'count');
  E(a.fordo, 'ping'); E(a.qom, 'ping'); E(a.creuse, 'pop', 'coupe de la montagne'); E(a.k90, 'draw'); E(a.profond, 'pop'); E(a.juin, 'tic'); E(a.treize, 'thud', 'bombe'); for (let i = 0; i < 12; i++) ev(a.douze4 + 0.1 + i * 0.13, 'tic'); E(a.douze4 + 1.7, 'impact'); act(a.douze4, 'bombes', 'tombent'); E(a.seule, 'stamp'); E(a.non, 'pop');
  E(a.voici, 'ping'); E(a.k35b, 'draw'); E(a.cinq, 'pop'); E(a.iles, 'draw'); E(a.abou, 'pop'); E(a.tomb, 'pop'); E(a.defenses, 'pop', 'lanceur'); E(a.lile, 'sweep', 'décor Ormuz'); E(a.rouge, 'pop'); E(a.mange, 'boing', 'sauce rouge'); E(a.fevrier, 'tic'); E(a.usa5, 'pop'); E(a.repondu, 'alarm'); E(a.arrete, 'stamp'); act(a.arrete, 'pétroliers', "s'arrêtent"); E(a.k400, 'count', 'barils'); E(a.toucher5, 'pop'); E(a.monde, 'draw'); E(a.monde + 0.5, 'shine');
  E(a.r1, 'draw'); E(a.r2, 'shine'); E(a.r3, 'pop'); E(a.r4, 'pop'); E(a.r5, 'ping'); E(a.voila, 'shine'); E(a.toi, 'boing', 'guide'); E(a.dist, 'pop'); E(a.bouclier, 'pop'); E(a.mb, 'pop'); E(a.disle, 'ding'); E(a.proch, 'whoosh'); E(a.abo, 'ding'); E(a.abo + 0.2, 'pop');
  [[a.missile0b, 'missile barré'], [a.avion0, 'avion barré'], [a.passage0, 'anneau Ormuz'], [a.lisb, 'étiquette Lisbonne'], [a.k900, 'ligne 900 km'], [a.envahir, 'routes terrestres'], [a.traverser + 0.3, 'char'], [a.k15, 'règle 15 km'], [a.paris, 'étiquette Paris'], [a.k90m, '90 millions'], [a.relief, 'zoom relief'], [a.teheran, 'ping Téhéran'], [a.plateau, 'haut plateau'], [a.profond, 'étiquette'], [a.juin, 'date 2025'], [a.toucher5, 'dézoom'], [a.monde, 'routes du pétrole'], [a.r1, 'arc récap'], [a.k35b, 'règle 35 km'], [a.k4000, '4000 m'], [a.dama, 'volcan'], [a.disle, 'commentaire'], [a.proch, 'teaser Ormuz'], [a.abo, 'guide salue'], [a.bouclier, 'question'], [a.deserts, 'étiquettes'], [a.toucher0, 'point d\'interrogation'], [a.espace, 'guide choqué'], [a.retour, 'tampon'], [a.seule, 'tampon'], [a.non, 'dézoom'], [a.iles, 'anneaux îles'], [a.fevrier, 'pétroliers'], [a.r4, 'bunker récap'], [a.voila, 'dézoom final']].forEach(([t, w]) => act(t, w, 'anime'));
  window.PREVIEW = [0.5, a.missile + 0.6, a.imposs + 0.3, a.km0 + 0.8, a.pays23 + 0.3, a.toucher0 + 0.3, a.carte0 + 0.5, a.k35 + 0.9, a.b1 - 0.2, a.medit + 0.3, a.lisb + 0.4, a.k900 + 0.6, a.sa + 0.4, a.douze1 + 0.6, a.drone + 0.8, a.plein + 0.2, a.k22 + 0.4, a.bzh + 0.8, a.k15 + 0.6, a.cotiere + 1.5, a.dome + 0.5, a.fronde + 0.6, a.espace + 0.5, a.million + 0.6, a.k75 + 0.4, a.zagros + 0.8, a.muraille + 1.2, a.dama + 0.4, a.teheran + 0.4, a.k80 + 0.4, a.chauds + 1.2, a.irak3 + 1.5, a.jamais + 0.4, a.fordo + 0.8, a.k90 + 0.6, a.b2b + 1.2, a.treize + 0.4, a.douze4 + 0.9, a.seule + 0.4, a.ormuz + 0.6, a.k35b + 0.6, a.cinq + 1.2, a.tomb + 0.5, a.emirats + 0.5, a.mange + 0.4, a.arrete + 0.4, a.k400 + 0.6, a.monde + 0.8, a.r2 + 0.4, a.r4 + 0.4, a.toi + 0.6, a.mb + 0.5, a.abo + 0.4];
}
function tiltAt(t) { let v = 0; for (const [t0, t1, deg] of A.tilt) { if (t < t0 || t > t1 + 1) continue; v = Math.max(v, deg * Math.min(ease((t - t0) / 0.9), 1 - ease((t - t1) / 1))); } return v * Math.PI / 180; }
function angAt(t) { return (6 * Math.sin(2 * Math.PI * t / 17) + 2.5 * Math.sin(2 * Math.PI * t / 9 + 1)) * Math.PI / 180; }

// ---------- calque carte (dessiné sur m, avant la rotation) ----------
function mapLayer(t) {
  const a = A;
  // arc Israël – Téhéran
  gcDash(TLV, THR, t, a.km0 - 0.2, a.montagnes0 + 1.0); gcDash(TLV, THR, t, a.km1 - 0.2, a.k900 - 0.3); gcDash(TLV, THR, t, a.r1 - 0.2, a.r2 - 0.1);
  gcDash([35.82, 33.41], [45.38, 33.97], t, a.k900 - 0.1, a.jo + 0.2, '#ffffff', 6);
  // routes terrestres hypothétiques
  if (t > a.envahir - 0.2 && t < a.ciel + 0.4) for (const R of [[[35.5, 32.0], [36.6, 31.9], [39.5, 32.4], [43, 33.3], [45.6, 33.9]], [[35.6, 32.9], [38.5, 34.5], [41.5, 34.4], [45.4, 34.2]], [[35.2, 30.4], [38.5, 30.0], [44, 29.6], [47.5, 30.3]]]) { const u = easeOut(prog(t, a.envahir, 1.2)); m.save(); m.globalAlpha = fadeOut(t, a.ciel, 0.4); const L = []; for (let i = 0; i < R.length - 1; i++) for (let j = 0; j <= 10; j++) L.push(d3.geoInterpolate(R[i], R[i + 1])(j / 10)); lineM(L.slice(0, Math.max(2, Math.floor(L.length * u)))); m.setLineDash([12, 10]); m.lineWidth = 7; m.strokeStyle = '#ff9f1a'; m.shadowColor = '#000'; m.shadowBlur = 6; m.stroke(); m.restore(); }
  // Israël posé sur la Bretagne
  if (t > a.bzh - 0.1 && t < a.etroit) { const al = clamp((t - a.bzh) / 0.4) * fadeOut(t, a.etroit - 0.3, 0.3); m.save(); m.globalAlpha = al; const g = GEO.ilBzh; flagFill(m, () => pathM(g), d3.geoPath(P).bounds(g), FL.il, 0.9 * al, Math.max(0, 1 - (t - a.bzh) / 0.3), 'stretch'); pathM(g); m.lineWidth = 4; m.strokeStyle = '#2f6bff'; m.shadowColor = '#fff'; m.shadowBlur = 14; m.stroke(); m.restore(); }
  // Israël ×75 dans l'Iran
  if (t > a.israel3 - 0.1 && t < a.k90m + 1.0) { const al = fadeOut(t, a.k90m + 0.6, 0.4); const n = D.sq.length; m.save(); m.globalAlpha = al;
    D.sq.forEach(([lon, lat, dl, dt], i) => { const t0 = a.israel3 + 0.1 + (a.k75 + 0.2 - a.israel3) * i / n; if (t < t0) return; const s = backOut(prog(t, t0, 0.25)); const p0 = P([lon, lat + dt]), p1 = P([lon + dl, lat]); const cx = (p0[0] + p1[0]) / 2, cy = (p0[1] + p1[1]) / 2, w = (p1[0] - p0[0]) * 0.9 * s, h = (p1[1] - p0[1]) * 0.9 * s; if (FL.il) m.drawImage(FL.il, cx - w / 2, cy - h / 2, w, h); m.lineWidth = 2; m.strokeStyle = '#1f3c9a'; m.strokeRect(cx - w / 2, cy - h / 2, w, h); });
    m.restore(); }
  // chemin de l'invasion de 1980
  if (t > a.irak3 - 0.1 && t < a.huit + 0.8) { const R = [[47.8, 30.5], [48.2, 30.9], [48.6, 31.4], [48.5, 32.0]]; const u = easeOut(prog(t, a.irak3 + 0.1, 2.2)); const L = []; for (let i = 0; i < R.length - 1; i++) for (let j = 0; j <= 10; j++) L.push(d3.geoInterpolate(R[i], R[i + 1])(j / 10)); m.save(); m.globalAlpha = fadeOut(t, a.huit + 0.4, 0.4); lineM(L.slice(0, Math.max(2, Math.floor(L.length * u)))); m.lineWidth = 16; m.strokeStyle = 'rgba(224,27,36,.9)'; m.lineCap = 'round'; m.shadowColor = '#000'; m.shadowBlur = 8; m.stroke(); m.restore(); }
  // routes du pétrole vers le monde
  if (t > a.monde - 0.1 && t < a.b6 + 0.6) { const O = [56.3, 26.5]; [[121.5, 31.2], [139.7, 35.6], [72.8, 19.0], [126.9, 37.5], [4.4, 51.9], [103.8, 1.3]].forEach((D2, i) => gcDash(O, D2, t, a.monde + i * 0.12, a.b6 + 0.2, '#FFE928', 5)); }
  // double ellipse sur Ormuz (accroche, partie 5, fin)
}

// ---------- calque écran ----------
function screenScene(c, t) {
  const a = A; const BX = 150, BY = 1290;
  // ===== accroche
  if (t < a.missile + 0.1) { const s = popIn(t, 0, 0.3) * fadeOut(t, a.missile, 0.25); c.save(); c.translate(CX, 400); c.scale(s, s); sprite(c, 'stopwatch', 0, 110, 200, { shadow: false }); c.restore(); bigWord(c, '12 MIN', CX, 560, t, 0.1, a.missile, { size: 110 }); }
  missileArc(c, [48.5, 34.2], [34.9, 31.9], t, a.missile, a.israel0 + 0.3, { size: 110 });
  stampText(c, 'IMPOSSIBLE ?', CX, 420, t, a.imposs, a.km0 - 0.1, { size: 84 });
  if (t > a.km0 && t < a.montagnes0 + 1.2) { const p = S(43.5, 35.5); pill(c, '1 580 KM', p.x, p.y, t, a.km0 + 0.3, a.montagnes0 + 1.0, { size: 56 }); }
  pill(c, 'DÉSERTS', 700, 230, t, a.deserts, a.pays23 - 0.1, { bg: '#e8a33c' }); pill(c, 'MONTAGNES', 1220, 230, t, a.montagnes0, a.pays23 - 0.1, { bg: '#8a5a2b', color: '#fff' });
  mountains(c, D.zagros, t, a.montagnes0, a.iran0 + 0.3, { n: 18, step: 0.03, h: 40 });
  bigWord(c, '+ 2 OU 3 PAYS', CX, 220, t, a.pays23, a.iran0 + 0.2, { size: 90 });
  if (t > a.toucher0 - 0.1 && t < a.carte0 + 0.3) { const p = S(41, 32.5); bigWord(c, '?', p.x, p.y - 40, t, a.toucher0 - 0.1, a.carte0, { size: 260 }); stampText(c, 'PAS DE FRONTIÈRE', CX, 420, t, a.toucher0, a.carte0, { size: 70, col: '#C00E1F' }); }
  charSpr(c, 'guide_point', BX, BY, 330, t, a.carte0 - 0.1, a.arme0, { wob: 0.02 });
  if (t > a.missile0b - 0.1 && t < a.passage0 + 0.3) { const al = fadeOut(t, a.passage0, 0.25); c.save(); c.globalAlpha = al; sprite(c, 'missile', 820, 330, 200 * popIn(t, a.missile0b - 0.1, 0.3), { shadow: false, rot: 0.6 }); if (t > a.avion0 - 0.1) sprite(c, 'jet_il', 1100, 340, 190 * popIn(t, a.avion0 - 0.1, 0.3), { shadow: false, rot: 0.3 }); for (const [x, t0] of [[820, a.missile0b + 0.2], [1100, a.avion0 + 0.2]]) if (t > t0) { const k = easeOut(prog(t, t0, 0.25)); c.save(); c.translate(x, 250); c.strokeStyle = '#e01b24'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(-80 * k, -80 * k); c.lineTo(80 * k, 80 * k); c.moveTo(80 * k, -80 * k); c.lineTo(-80 * k, 80 * k); c.stroke(); c.restore(); } c.restore(); }
  if (t > a.passage0 - 0.1 && t < a.b1 - 0.6) { const p = S(56.3, 26.65); ring(c, p.x, p.y, 120, t, a.passage0, a.b1 - 0.8); pill(c, '35 KM', p.x, p.y - 190, t, a.k35, a.b1 - 0.8, { size: 60 }); }
  // ===== partie 1
  if (t > a.medit && t < a.iran1) { const p = S(32.5, 33.5); mapWrite(c, 'Méditerranée', [31.5, 33.6], t, a.medit, a.iran1 - 0.2, { size: 70, color: '#bfe9ff' }); }
  if (t > a.km1 && t < a.k900) { const p = S(43.5, 35.5); pill(c, '1 580 KM', p.x, p.y, t, a.km1 + 0.3, a.k900 - 0.2, { size: 56 }); }
  pill(c, 'PLUS QUE PARIS → LISBONNE (1 450 KM)', CX, 220, t, a.lisb, a.front, { size: 40, bg: '#fff' });
  if (t > a.k900 && t < a.jo + 0.3) { const p = S(40.6, 34.6); pill(c, '≈ 900 KM', p.x, p.y - 30, t, a.k900 + 0.3, a.jo + 0.2, { size: 52, bg: '#fff' }); }
  stampText(c, '2 OU 3 PAYS À TRAVERSER', CX, 220, t, a.traverser, a.ciel - 0.1, { size: 64, col: '#d35400' });
  if (t > a.traverser + 0.3 && t < a.ciel + 0.2) { const p = S(40, 31.3); sprite(c, 'tank', p.x, p.y, 110 * popIn(t, a.traverser + 0.3, 0.3), { alpha: fadeOut(t, a.ciel, 0.25) }); }
  bigWord(c, 'TOUT SE JOUE DANS LE CIEL', CX, 220, t, a.ciel - 0.2, a.missile1 - 0.1, { size: 74, color: '#fff' });
  missileArc(c, [48.0, 34.0], [34.9, 31.9], t, a.missile1, a.douze1 + 1.3, { size: 100 });
  if (t > a.douze1 - 0.1 && t < a.drone) { const s = popIn(t, a.douze1 - 0.1, 0.3) * fadeOut(t, a.drone - 0.2, 0.2); c.save(); c.translate(1560, 300); c.scale(s, s); sprite(c, 'stopwatch', 0, 100, 180, { shadow: false }); c.restore(); counter(c, 12, t, a.douze1, a.douze1 + 0.8, 1560, 470, { suf: ' MIN', size: 84, until: a.drone - 0.2, label: 'MISSILE BALISTIQUE' }); }
  pill(c, 'DRONE : PLUSIEURS HEURES', CX, 220, t, a.heures - 0.2, a.avions - 0.1, { size: 48, bg: '#ff9f1a' });
  pill(c, 'RAVITAILLEMENT EN VOL', CX, 220, t, a.plein - 0.2, a.b2 - 0.5, { size: 50, bg: '#fff' });
  // ===== partie 2
  if (t > a.k22 && t < a.bzh + 0.2) counter(c, 22000, t, a.k22, a.k22 + 0.8, CX, 430, { suf: ' KM²', size: 96, until: a.bzh, label: 'ISRAËL' });
  if (t > a.bzh && t < a.etroit) { const al = popIn(t, a.bzh + 0.3, 0.3) * fadeOut(t, a.etroit - 0.3, 0.25); c.save(); c.translate(560, 470); c.scale(al * 0.85, al * 0.85); c.fillStyle = 'rgba(15,20,28,.8)'; rr(c, -330, -110, 660, 220, 18); c.fill(); for (const [i, lab, km, col] of [[0, 'BRETAGNE', 27000, '#3b7bff'], [1, 'ISRAËL', 22000, '#ffffff']]) { const y = -50 + i * 100; const wb = 380 * km / 27000 * easeOut(prog(t, a.bzh + 0.5 + i * 0.3, 0.6)); c.fillStyle = col; rr(c, -60, y - 22, wb, 44, 8); c.fill(); txt(c, lab, -80, y, { size: 32, weight: 900, align: 'right', shadow: false }); txt(c, fmtNum(km) + ' KM²', -50 + wb + 12, y, { size: 30, weight: 800, align: 'left', color: '#FFE928', shadow: false }); } c.restore(); }
  ruler(c, [34.853, 32.32], [35.013, 32.32], '15 KM', t, a.k15 - 0.3, a.dix, { size: 64 });
  if (t > a.cisj - 0.1 && t < a.k15 + 0.4) { const p = S(35.25, 32.25); mapWrite(c, 'Cisjordanie', [35.3, 32.1], t, a.cisj, a.k15 + 0.3, { size: 64 }); mapWrite(c, 'Mer', [34.62, 32.4], t, a.cisj - 0.4, a.k15 + 0.3, { size: 64, color: '#bfe9ff' }); }
  pill(c, '≈ LA LARGEUR DE PARIS', CX, 220, t, a.paris, a.dix - 0.1, { size: 50 });
  if (t > a.dix && t < a.cotiere + 0.2) counter(c, 10, t, a.dix, a.dix + 0.6, CX, 230, { suf: ' MILLIONS', size: 90, until: a.cotiere, label: "D'HABITANTS" });
  decoReveal(c, DECO.telaviv, TLV, t, a.cotiere - 0.2, a.reculer - 0.4);
  stampText(c, 'AUCUN RECUL POSSIBLE', CX, 220, t, a.reculer, a.toit - 0.1, { size: 66 });
  // dômes de défense
  if (t > a.toit - 0.1 && t < a.abo2 + 0.6) {
    const p = S(34.95, 31.6); const al = fadeOut(t, a.abo2 + 0.3, 0.3); c.save(); c.globalAlpha = al;
    const D3 = [[a.dome - 0.2, 150, '#ffcf3a', 'DÔME DE FER · 4-70 KM'], [a.fronde - 0.2, 300, '#ff8a2a', 'FRONDE DE DAVID · ~300 KM'], [a.arrow - 0.2, 470, '#3fa9ff', 'ARROW 3 · DANS L\'ESPACE']];
    if (t < a.dome - 0.2) { const k = easeOut(prog(t, a.toit, 0.5)); c.lineWidth = 6; c.strokeStyle = '#fff'; c.setLineDash([14, 10]); c.beginPath(); c.ellipse(p.x, p.y, 200 * k, 200 * k * 0.9, 0, Math.PI, 0); c.stroke(); c.setLineDash([]); }
    D3.forEach(([t0, r, col, lab], i) => { if (t < t0) return; const k = backOut(prog(t, t0, 0.5)); const rr2 = r * k; c.save(); c.globalAlpha = al * 0.28; c.fillStyle = col; c.beginPath(); c.ellipse(p.x, p.y, rr2, rr2 * 0.85, 0, Math.PI, 0); c.closePath(); c.fill(); c.globalAlpha = al; c.lineWidth = 6; c.strokeStyle = col; c.shadowColor = col; c.shadowBlur = 18; c.beginPath(); c.ellipse(p.x, p.y, rr2, rr2 * 0.85, 0, Math.PI, 0); c.stroke(); c.restore();
      c.save(); c.translate(600, 420 + i * 64); const s2 = popIn(t, t0 + 0.2, 0.3); c.scale(s2, s2); c.beginPath(); c.arc(-200, 0, 16, 0, 7); c.fillStyle = col; c.fill(); c.lineWidth = 3; c.strokeStyle = '#fff'; c.stroke(); txt(c, lab, -170, 0, { size: 32, weight: 900, align: 'left', stroke: '#000', sw: 7 }); c.restore(); });
    if (t > a.dome - 0.2) sprite(c, 'launcher', p.x - 260, p.y + 70, 90 * popIn(t, a.dome, 0.3)); if (t > a.fronde - 0.2) sprite(c, 'radar', p.x + 200, p.y + 80, 90 * popIn(t, a.fronde, 0.3));
    if (t > a.arrow - 0.3) { const g = c.createLinearGradient(0, 0, 0, 260); g.addColorStop(0, 'rgba(8,10,40,.85)'); g.addColorStop(1, 'rgba(8,10,40,0)'); c.save(); c.globalAlpha = al * clamp((t - a.arrow + 0.3) / 0.5); c.fillStyle = g; c.fillRect(0, 0, W, 260); for (let i = 0; i < 60; i++) { const x = (i * 331) % W, y = (i * 97) % 180; c.fillStyle = '#fff'; c.fillRect(x, y, 3, 3); } txt(c, 'ESPACE', W - 150, 70, { size: 40, weight: 900, color: '#bcd7ff' }); c.restore();
      const u = easeOut(prog(t, a.arrow, 1.8)); const y = lerp(p.y, 120, u); sprite(c, 'interceptor', p.x + 30, y + 90, 170, { shadow: false }); }
  }
  charSpr(c, 'guide_shock', BX, BY, 330, t, a.espace, a.abo2 - 0.2);
  if (t > a.abo2 - 0.1 && t < a.b3 - 0.4) tag(c, 'ABONNE-TOI', CX, 220, { size: 64, bg: '#C00E1F', border: '#fff', sc: stampScale(t, a.abo2) * fadeOut(t, a.b3 - 0.6, 0.2) });
  // ===== partie 3
  stampText(c, 'LE RETOURNEMENT', CX, 220, t, a.retour, a.geant - 0.1, { size: 70, col: '#2aa84a' });
  if (t > a.million && t < a.israel3) { counter(c, 1648000, t, a.million, a.million + 1.0, CX, 230, { suf: ' KM²', size: 92, until: a.israel3 - 0.2, label: 'IRAN' }); pill(c, '= 3 × LA FRANCE', CX, 370, t, a.france3, a.israel3 - 0.2, { size: 52 }); }
  if (t > a.israel3 && t < a.k90m + 0.4) { const n = D.sq.length; const k = Math.min(75, Math.round(75 * clamp((t - a.israel3 - 0.1) / (a.k75 + 0.2 - a.israel3)))); bigWord(c, '× ' + k, CX, 220, t, a.israel3, a.k90m, { size: 110 }); }
  pill(c, '90 MILLIONS D\'HABITANTS', CX, 360, t, a.k90m, a.relief - 0.1, { size: 48, bg: '#fff' });
  mountains(c, D.zagros, t, a.zagros - 0.2, a.plateau, { rows: [-1, 0, 1], step: 0.06, h: 46 });
  mapWrite(c, 'Zagros', [47.0, 31.2], t, a.zagros, a.elbourz, { size: 96 });
  decoReveal(c, DECO.zagros, [49, 32.6], t, a.muraille, a.k4000 - 0.2);
  pill(c, 'SOMMETS À + DE 4 000 M', CX, 220, t, a.k4000, a.elbourz - 0.1, { size: 50 });
  mountains(c, D.elbourz, t, a.elbourz - 0.1, a.plateau, { rows: [0, 0.5], step: 0.05, h: 44 });
  mapWrite(c, 'Elbourz', [53.5, 37.0], t, a.elbourz, a.plateau, { size: 84 });
  if (t > a.dama - 0.2 && t < a.plateau + 0.2) { const p = S(...DAMA); sprite(c, 'volcano', p.x, p.y + 10, 190 * popIn(t, a.dama - 0.2, 0.35), { alpha: fadeOut(t, a.plateau, 0.25) }); pill(c, 'DAMAVAND · 5 600 M', p.x, p.y - 220, t, a.dama + 0.3, a.teheran - 0.1, { size: 44 }); }
  ping2(c, THR, t, a.teheran, a.plateau, 'TÉHÉRAN', { size: 50 });
  pill(c, '+ DE 1 000 M D\'ALTITUDE', CX, 220, t, a.perchee, a.plateau - 0.1, { size: 48 });
  mapWrite(c, 'Haut plateau', [54.8, 33.6], t, a.plateau, a.lut, { size: 84 });
  if (t > a.lut - 0.1 && t < a.chauds + 0.2) { const p = S(...LUT); mapWrite(c, 'Désert du Lut', [58.9, 31.6], t, a.lut, a.chauds, { size: 80 }); sprite(c, 'camel', p.x - 160, p.y + 120, 130 * popIn(t, a.lut, 0.3), { alpha: fadeOut(t, a.chauds, 0.2) }); }
  if (t > a.sat - 0.1 && t < a.chauds) { const u = prog(t, a.sat - 0.1, 3.0); sprite(c, 'satellite', lerp(120, 960, u), 380, 120, { shadow: false, alpha: fadeOut(t, a.chauds - 0.2, 0.2) }); }
  if (t > a.k80 - 0.1 && t < a.chauds + 0.2) { const p = S(...LUT); sprite(c, 'thermo', p.x + 150, p.y + 40, 200 * popIn(t, a.k80 - 0.1, 0.3), { alpha: fadeOut(t, a.chauds, 0.2), shadow: false }); counter(c, 80, t, a.k80, a.k80 + 0.6, CX, 470, { suf: ' °C', size: 110, color: '#ff4d2e', until: a.chauds, label: 'AU SOL (SATELLITE)' }); charSpr(c, 'guide_shock', BX, BY, 330, t, a.k80, a.chauds); }
  decoReveal(c, DECO.lut, LUT, t, a.chauds - 0.2, a.forteresse - 0.1);
  stampText(c, 'FORTERESSE', CX, 220, t, a.forteresse, a.epreuve + 0.4, { size: 84, col: '#7a5532' });
  if (t > a.epreuve + 0.5 && t < a.irak3 + 0.2) { const s = popIn(t, a.epreuve + 0.5, 0.3) * fadeOut(t, a.irak3, 0.2); c.save(); c.translate(CX, 330); c.scale(s, s); sprite(c, 'parchment', 0, 140, 260, { shadow: false }); txt(c, '1980', 0, 0, { size: 100, font: 'Caveat', weight: 700, color: '#4a2a08', shadow: false }); c.restore(); }
  if (t > a.irak3 && t < a.huit + 0.8) { const R = [[47.8, 30.5], [48.2, 30.9], [48.6, 31.4], [48.5, 32.0]]; const u = easeOut(prog(t, a.irak3 + 0.1, 2.2)); const seg = u * (R.length - 1); const k = Math.min(R.length - 2, Math.floor(seg)); const ll = d3.geoInterpolate(R[k], R[k + 1])(seg - k); const p = S(...ll); sprite(c, 'tank', p.x, p.y + 20, 120 * popIn(t, a.irak3, 0.3), { alpha: fadeOut(t, a.huit + 0.5, 0.3) }); pill(c, 'ARMÉE IRAKIENNE', p.x, p.y + 70, t, a.irak3 + 0.3, a.jamais, { size: 36, bg: '#fff' }); }
  if (t > a.jamais && t < a.huit + 0.8) { const p = S(48.5, 32.1); stampText(c, 'STOP', p.x + 40, p.y - 120, t, a.jamais, a.huit + 0.6, { size: 90 }); }
  if (t > a.huit && t < a.b4) counter(c, 8, t, a.huit, a.huit + 0.4, CX, 230, { suf: ' ANS DE GUERRE', size: 86, until: a.b4 - 0.3 });
  // ===== partie 4
  ping2(c, FORDO, t, a.fordo, a.creuse - 0.1, 'FORDO', { size: 56, col: '#ffcf3a' });
  ping2(c, [50.88, 34.64], t, a.qom, a.creuse - 0.1, 'QOM', { size: 48 });
  if (t > a.creuse - 0.1 && t < a.juin + 0.3) { const al = fadeOut(t, a.juin, 0.3); const s = popIn(t, a.creuse - 0.1, 0.35); c.save(); c.globalAlpha = al; c.translate(600, 1080); c.scale(s, s); c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 30; const img = SPR.bunker; const w = 600, h = w * img.height / img.width; c.drawImage(img, -w / 2, -h / 2, w, h); c.shadowColor = 'transparent';
    if (t > a.k90 - 0.1) { const k = easeOut(prog(t, a.k90 - 0.1, 0.5)); c.lineWidth = 8; c.strokeStyle = '#FFE928'; c.beginPath(); c.moveTo(-w / 2 - 40, -h / 2 + 10); c.lineTo(-w / 2 - 40, -h / 2 + 10 + (h * 0.72) * k); c.stroke(); txt(c, '≈ 90 M', -w / 2 - 40, -h / 2 - 34, { size: 56, color: '#FFE928', stroke: '#1b1300', sw: 9 }); }
    c.restore(); }
  charSpr(c, 'guide_loupe', BX, BY, 320, t, a.creuse, a.juin);
  pill(c, 'PLUS PROFOND QUE LA PLUPART DES BOMBES', CX, 220, t, a.profond, a.juin - 0.1, { size: 40, bg: '#fff' });
  pill(c, 'GUERRE DES 12 JOURS', CX, 160, t, a.juin + 0.4, a.usa4, { size: 44, bg: '#fff' });
  if (t > a.treize - 0.1 && t < a.douze4 + 0.2) { const s = popIn(t, a.treize - 0.1, 0.3) * fadeOut(t, a.douze4, 0.2); c.save(); c.translate(1500, 500); c.scale(s, s); sprite(c, 'bomb', 0, 200, 380, { shadow: false }); c.restore(); pill(c, '13 TONNES', 1500, 760, t, a.treize + 0.2, a.douze4, { size: 56 }); }
  if (t > a.douze4 && t < a.seule + 0.3) { const p = S(...FORDO); for (let i = 0; i < 12; i++) { const t0 = a.douze4 + 0.1 + i * 0.13; if (t < t0) continue; const u = prog(t, t0, 0.35); if (u < 1) sprite(c, 'bomb', p.x + ((i * 47) % 160 - 80), lerp(-60, p.y, easeIn(u)), 90, { shadow: false }); }
    if (t > a.douze4 + 1.7) { const k = prog(t, a.douze4 + 1.7, 0.6); c.save(); c.globalAlpha = (1 - k) * 0.9; c.beginPath(); c.arc(p.x, p.y, 40 + 200 * k, 0, 7); c.lineWidth = 14; c.strokeStyle = '#fff'; c.stroke(); c.restore(); }
    counter(c, 12, t, a.douze4 + 0.1, a.douze4 + 1.6, CX, 230, { pre: '× ', size: 100, until: a.seule - 0.1, label: 'BOMBES ANTI-BUNKER' }); }
  stampText(c, 'UNE SEULE MONTAGNE', CX, 220, t, a.seule, a.non + 0.4, { size: 70, col: '#7a5532' });
  // ===== partie 5
  if (t > a.voici - 0.1 && t < a.oman) { const p = S(56.3, 26.65); ring(c, p.x, p.y, 150, t, a.voici + 0.6, a.oman - 0.2); mapWrite(c, "Détroit d'Ormuz", [56.6, 27.25], t, a.ormuz, a.oman, { size: 84 }); }
  ruler(c, HORMUZ_N, HORMUZ_S, '≈ 35 KM', t, a.k35b - 0.2, a.cinq - 0.2, { size: 60, dy: -50 });
  if (t > a.cinq && t < a.iles) { pill(c, '≈ 1/5 DU PÉTROLE MONDIAL', CX, 420, t, a.cinq, a.iles - 0.1, { size: 50 }); sprite(c, 'barrels', 900, 1280, 170 * popIn(t, a.cinq + 0.2, 0.3), { alpha: fadeOut(t, a.iles - 0.1, 0.2) }); }
  for (const [ll, nm, t0] of [[ABU, 'ABOU MOUSSA', a.abou], [GTUNB, 'GRANDE TOMB', a.tomb], [LTUNB, 'PETITE TOMB', a.tomb + 0.25]]) if (t > t0 - 0.1 && t < a.lile) { const p = S(...ll); ring(c, p.x, p.y, 34, t, t0, a.lile - 0.2, '#FFE928', { w: 6, ax: 1.2 }); c.save(); c.globalAlpha = fadeOut(t, a.lile - 0.2, 0.2); txt(c, typed(nm, t, t0, 0.3), p.x + (nm === 'PETITE TOMB' ? -110 : nm === 'GRANDE TOMB' ? 140 : 0), p.y + (nm === 'ABOU MOUSSA' ? 64 : -50), { size: 36, stroke: '#000', sw: 8 }); c.restore(); }
  pill(c, 'ÎLES DISPUTÉES', CX, 220, t, a.emirats + 0.4, a.lile - 0.1, { size: 52, bg: '#fff' });
  if (t > a.defenses - 0.1 && t < a.lile) { const p = S(...ABU); sprite(c, 'launcher', p.x + 120, p.y + 40, 70 * popIn(t, a.defenses, 0.3), { alpha: fadeOut(t, a.lile - 0.2, 0.2) }); }
  ping2(c, HISL, t, a.lile, a.rouge - 0.4, "ÎLE D'ORMUZ", { size: 50 });
  decoReveal(c, DECO.hormuz, HISL, t, a.rouge - 0.5, a.fevrier - 0.2);
  if (t > a.mange - 0.1 && t < a.fevrier) { const s = popIn(t, a.mange - 0.1, 0.35) * fadeOut(t, a.fevrier - 0.3, 0.2); c.save(); c.translate(720, 1060); c.scale(s, s); sprite(c, 'sauce', 0, 100, 220); c.restore(); pill(c, 'ON MANGE LA TERRE !', 720, 1220, t, a.mange + 0.1, a.fevrier - 0.3, { size: 46 }); charSpr(c, 'guide_shock', BX, BY, 330, t, a.mange, a.fevrier - 0.2); }
  if (t > a.usa5 - 0.1 && t < a.repondu + 0.3) { const s = popIn(t, a.usa5 - 0.1, 0.3) * fadeOut(t, a.repondu, 0.2); c.save(); c.translate(CX, 230); c.scale(s, s); flagCard(c, -170, 0, FL.us, 110); txt(c, 'VS', 0, 0, { size: 70, weight: 900, color: '#FFE928', stroke: '#1b1300', sw: 10 }); flagCard(c, 170, 0, FL.ir, 110); c.restore(); }
  stampText(c, 'PRESQUE BLOQUÉ', CX, 220, t, a.arrete, a.agence, { size: 80 });
  if (t > a.k400 - 0.2 && t < a.toucher5 + 0.2) { counter(c, 400000000, t, a.k400, a.k400 + 1.0, CX, 230, { size: 84, until: a.toucher5, label: 'BARILS DES RÉSERVES D\'URGENCE' }); sprite(c, 'barrels', 1700, 900, 190 * popIn(t, a.k400, 0.3), { alpha: fadeOut(t, a.toucher5, 0.2) }); }
  bigWord(c, 'LE MONDE ENTIER', CX, 200, t, a.monde, a.b6 - 0.1, { size: 96 });
  // ===== fin
  if (t > a.r1 && t < a.r2) { const p = S(43.5, 35.5); pill(c, '1 580 KM', p.x, p.y, t, a.r1 + 0.2, a.r2 - 0.1, { size: 56 }); }
  if (t > a.r2 - 0.1 && t < a.r3) { const p = S(34.95, 31.6); const k = backOut(prog(t, a.r2, 0.4)); c.save(); c.globalAlpha = fadeOut(t, a.r3 - 0.1, 0.2); for (const [r, col] of [[90, '#ffcf3a'], [160, '#ff8a2a'], [240, '#3fa9ff']]) { c.lineWidth = 6; c.strokeStyle = col; c.shadowColor = col; c.shadowBlur = 14; c.beginPath(); c.ellipse(p.x, p.y, r * k, r * k * 0.85, 0, Math.PI, 0); c.stroke(); } c.restore(); }
  mountains(c, D.zagros, t, a.r3, a.r4, { n: 16, step: 0.025, h: 40 }); mountains(c, D.elbourz, t, a.r3 + 0.2, a.r4, { n: 10, step: 0.03, h: 38 });
  if (t > a.r4 - 0.1 && t < a.r5) { const s = popIn(t, a.r4, 0.3) * fadeOut(t, a.r5 - 0.1, 0.2); c.save(); c.translate(1380, 560); c.scale(s, s); const img = SPR.bunker; c.drawImage(img, -300, -195, 600, 600 * img.height / img.width); c.restore(); }
  if (t > a.r5 - 0.1 && t < a.voila + 0.3) { const p = S(56.3, 26.65); ring(c, p.x, p.y, 130, t, a.r5, a.voila); pill(c, '35 KM', p.x, p.y - 200, t, a.r5 + 0.2, a.voila, { size: 56 }); }
  charSpr(c, 'guide_shock', BX, BY, 330, t, a.toi - 0.1, a.disle);
  if (t > a.dist - 0.1 && t < a.disle + 0.5) { const al = fadeOut(t, a.disle + 0.3, 0.3); c.save(); c.globalAlpha = al; [['LA DISTANCE ?', a.dist, 420], ['LE BOUCLIER ?', a.bouclier, 510], ['LA MONTAGNE-BUNKER ?', a.mb, 600]].forEach(([s, t0, y]) => { if (t > t0 - 0.1) tag(c, s, CX, y, { size: 42, bg: '#FFD21F', color: '#111', sc: popIn(t, t0 - 0.1, 0.3) }); }); c.restore(); }
  if (t > a.disle && t < a.proch + 0.3) tag(c, 'DIS-LE EN COMMENTAIRE', CX, 720, { size: 52, bg: '#1d1406', color: '#FFE928', border: '#fff', sc: stampScale(t, a.disle) * fadeOut(t, a.proch, 0.2) });
  if (t > a.proch && t < a.abo) { const p = S(56.3, 26.65); ring(c, p.x, p.y, 120, t, a.proch + 0.6, a.abo - 0.2); pill(c, 'PROCHAINE VIDÉO : ORMUZ', CX, 220, t, a.proch, a.abo - 0.2, { size: 48, bg: '#fff' }); }
  if (t > a.abo - 0.1) { tag(c, 'ABONNE-TOI', CX, 230, { size: 74, bg: '#C00E1F', border: '#fff', sc: stampScale(t, a.abo) }); charSpr(c, 'guide_point', BX, BY, 330, t, a.abo - 0.1, DUR + 1); }
  // chapitres
  if (!window.PORTRAIT) for (const [t0, n, , title] of A.parts) chapterCard(c, t, t0, n, { 1: 'AUCUNE FRONTIÈRE COMMUNE', 2: 'ISRAËL, UN PAYS MINUSCULE', 3: "L'IRAN, UNE FORTERESSE NATURELLE", 4: 'FORDO, LA MONTAGNE-BUNKER', 5: "ORMUZ, L'ARME DE L'EAU" }[n]);
  if (!window.PORTRAIT) cornerLabel(c, t, A.parts);
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
  const names = ['jet_il', 'tanker', 'b2', 'drone', 'missile', 'interceptor', 'oiltanker', 'boat', 'launcher', 'radar', 'tank', 'bomb', 'bunker', 'volcano', 'satellite', 'thermo', 'stopwatch', 'barrels', 'sauce', 'guide_point', 'guide_shock', 'guide_loupe', 'parchment', 'camel'];
  await Promise.all(names.map(async n => { SPR[n] = await loadImg('spr/' + n + '.png'); }));
  await Promise.all(['telaviv', 'zagros', 'lut', 'hormuz'].map(async n => { DECO[n] = await loadImg('deco/' + n + '.jpg'); }));
  makeGrain(); buildSubs(SCRIPT); setup();
  { const need = new Set(); for (let t = 0; t <= DUR; t += 0.1) { const c = cam(t); for (const [tx, ty] of tilesFor(c)) need.add(ty + '_' + tx); } await Promise.all([...need].map(async n => { TILES[n] = await loadImg('../relief/tiles/' + n + '.jpg'); })); window.NTILES = need.size; }
  window.CAM = { dur: DUR, camAt: t => cam(t), angAt, tiltAt };
  window.VISUALS = SUBS.map(x => x.t0); window.DUR = DUR; window.READY = true;
};
