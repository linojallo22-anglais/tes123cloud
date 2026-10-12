// scene.js — El Niño. window.render(t) déterministe.
const CY = 860, OX = 470, OY = 680, MW = 2020, MH = 3060, FOC = 1400;
let WORLD, FL = {}, DUR, cam;
const mapC = document.createElement('canvas'); mapC.width = MW; mapC.height = MH; const m = mapC.getContext('2d');
const rotC = document.createElement('canvas'); rotC.width = MW; rotC.height = MH; const rc = rotC.getContext('2d');
const HC = document.createElement('canvas'); HC.width = 1024; HC.height = 256; const hc = HC.getContext('2d');
let canvas, ctx, P = null, cam_s = 1, ANG = 0, TILT = 0, ST = null;

const ISO = { '604': 'pe', '218': 'ec', '360': 'id', '036': 'au', '404': 'ke', '894': 'zm', '716': 'zw', '356': 'in', '156': 'cn', '076': 'br' };
const NAME = { '604': 'PÉROU', '218': 'ÉQUATEUR', '360': 'INDONÉSIE', '036': 'AUSTRALIE', '404': 'KENYA', '894': 'ZAMBIE', '716': 'ZIMBABWE', '356': 'INDE', '156': 'CHINE', '076': 'BRÉSIL' };
const ANCH = { '604': [-75.5, -9.5], '218': [-78.3, -1.4], '360': [117, -2.5], '036': [134, -24], '404': [38, 0.3], '894': [27.5, -13.5], '716': [29.8, -19], '356': [79, 22], '156': [103, 34], '076': [-51, -10] };
const SLICE = /^(au|ke|zm|zw|cn|br|ec)$/;

function makeCam2(stops) {
  stops.sort((a, b) => a.t - b.t);
  const dr = (st, t) => { const dt = Math.max(0, t - st.t); return { lon: st.lon, lat: st.lat, s: st.s * (1 + (st.drift ?? 0.03) * dt) }; };
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
        let lon = A.lon + dl * ep; if (lon > 180) lon -= 360; if (lon < -180) lon += 360;
        return { lon, lat: lerp(A.lat, b.lat, ep), s: Math.exp(lerp(Math.log(A.s), Math.log(b.s), ez)) };
      }
    }
    return dr(stops.at(-1), t);
  };
}
const merc = lat => Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
const wrap = d => ((d % 360) + 540) % 360 - 180;
// coordonnées dans le canevas carte (continu autour de la caméra)
function mxy(lon, lat) { return [540 + OX + ST.s * wrap(lon - ST.lon) * Math.PI / 180, CY + OY - ST.s * (merc(lat) - merc(ST.lat))]; }
function S(lon, lat) {
  const p = mxy(lon, lat); let x = p[0] - OX - 540, y = p[1] - OY - CY;
  const c = Math.cos(ANG), s = Math.sin(ANG); let u = x * c - y * s, v = x * s + y * c; let k = 1;
  if (TILT > 0.001) { const sn = Math.sin(TILT), cs = Math.cos(TILT); k = FOC / (FOC - v * sn); u *= k; v = k * v * cs; }
  return { x: 540 + u, y: CY + v, k };
}
const pathM = g => { m.beginPath(); d3.geoPath(P, m)(g); };
const geomOf = id => (cam_s > 2200 && WORLD.c10[id]) ? WORLD.c10[id] : WORLD.byId[id].g;

const TN = 16384, TS = 1024; const TILES = {}; let LOWRES = null;
const gX = lon => (lon + 180) / 360 * TN, gY = lat => TN / 2 - TN / (2 * Math.PI) * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
function tilesFor(st) {
  const k = 2 * Math.PI * st.s / TN; if (k < 0.3) return [];
  const xc = gX(st.lon), yc = gY(st.lat); const x0 = xc - (540 + OX) / k, x1 = xc + (MW - 540 - OX) / k, y0 = yc - (CY + OY) / k, y1 = yc + (MH - CY - OY) / k;
  const out = []; for (let ty = Math.max(0, Math.floor(y0 / TS)); ty <= Math.min(15, Math.floor(y1 / TS)); ty++) for (let tx = Math.floor(x0 / TS); tx <= Math.floor(x1 / TS); tx++) out.push([((tx % 16) + 16) % 16, ty, tx]);
  return out;
}
function drawSat(st) {
  const cx = 540 + OX, cy = CY + OY; m.fillStyle = '#2f7f8c'; m.fillRect(0, 0, MW, MH); m.imageSmoothingQuality = 'high';
  const k = 2 * Math.PI * st.s / TN, xc = gX(st.lon), yc = gY(st.lat);
  if (k < 0.3 || !tilesFor(st).every(([a, b]) => TILES[b + '_' + a])) {
    const kl = 2 * Math.PI * st.s / LOWRES.width; const W2 = LOWRES.width * kl;
    const X0 = cx - (xc / TN) * W2, Y0 = cy - (yc / TN) * W2;
    for (const off of [-W2, 0, W2]) { const xa = X0 + off; const dx0 = Math.max(0, xa), dx1 = Math.min(MW, xa + W2), dy0 = Math.max(0, Y0), dy1 = Math.min(MH, Y0 + W2); if (dx1 > dx0 && dy1 > dy0) m.drawImage(LOWRES, (dx0 - xa) / kl, (dy0 - Y0) / kl, (dx1 - dx0) / kl, (dy1 - dy0) / kl, dx0, dy0, dx1 - dx0, dy1 - dy0); }
  } else {
    for (const [tx, ty, txr] of tilesFor(st)) { const img = TILES[ty + '_' + tx]; if (!img) continue; const dx = cx + (txr * TS - xc) * k, dy = cy + (ty * TS - yc) * k; m.drawImage(img, dx, dy, TS * k + 1, TS * k + 1); }
  }
  m.save(); pathM(WORLD.borders); m.lineWidth = 1.6; m.strokeStyle = 'rgba(255,255,255,.55)'; m.stroke(); m.restore();
}

// ---------- teintes d'ambiance (sur la carte) ----------
function tint(t) {
  const a = A, sep = Math.min(clamp((t - a.cette + 0.1) / 0.5), 1 - clamp((t - a.auj + 0.2) / 0.6));
  const hot = Math.min(clamp((t - a.y27b) / 1.0), 1 - clamp((t - a.chez + 0.3) / 0.7));
  if (sep > 0) { m.save(); m.globalCompositeOperation = 'color'; m.globalAlpha = sep * 0.8; m.fillStyle = '#7a5a32'; m.fillRect(0, 0, MW, MH); m.globalCompositeOperation = 'multiply'; m.globalAlpha = sep * 0.45; m.fillStyle = '#6a5640'; m.fillRect(0, 0, MW, MH); m.restore(); }
  if (hot > 0) { m.save(); m.globalCompositeOperation = 'color'; m.globalAlpha = hot * 0.5; m.fillStyle = '#ff5a14'; m.fillRect(0, 0, MW, MH); m.globalCompositeOperation = 'overlay'; m.globalAlpha = hot * 0.45; m.fillStyle = '#ff3a00'; m.fillRect(0, 0, MW, MH); m.restore(); }
  return { sep, hot };
}

// ---------- nappe d'eau chaude (anomalie de température) ----------
const HL0 = 110, HSPAN = 180, HLAT = 25; // texture : longitudes 110..290, latitudes -25..25
let BLOBS = [], CBLOBS = [];
function makeBlobs() {
  let s = 4242; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 150; i++) BLOBS.push({ u: r(), v: (r() + r() + r() - 1.5) / 1.5, rx: 4 + r() * 8, ry: 1.6 + r() * 2.6, k: r(), ph: r() * 6 });
  for (let i = 0; i < 40; i++) CBLOBS.push({ u: r(), v: (r() + r() - 1) , rx: 3 + r() * 6, ry: 0.8 + r() * 1.6, ph: r() * 6 });
}
const HCOL = ['255,230,80', '255,170,45', '255,95,30', '225,25,30', '150,10,30'];
let HKF = [];
function heatAt(t) {
  let i = 0; while (i < HKF.length - 1 && HKF[i + 1][0] <= t) i++;
  const a = HKF[i], b = HKF[Math.min(i + 1, HKF.length - 1)]; const x = b[0] > a[0] ? ease(clamp((t - a[0]) / (b[0] - a[0]))) : 0;
  const o = {}; ['a', 'L0', 'L1', 'w', 'cold', 'core'].forEach((k, j) => o[k] = lerp(a[1][j], b[1][j], x));
  if (t > A.tw0 - 0.3 && t < A.tw1 + 0.6) o.L1 = Math.max(o.L0 + 12, waveLon(t) + 4);
  return o;
}
function drawHeat(t) {
  const h = heatAt(t); if (h.a < 0.01 && h.cold < 0.01) return h;
  hc.clearRect(0, 0, 1024, 256);
  const X = lon => (lon - HL0) / HSPAN * 1024, Y = lat => (HLAT - lat) / (2 * HLAT) * 256, sx = 1024 / HSPAN, sy = 256 / (2 * HLAT);
  if (h.cold > 0.01) for (const b of CBLOBS) {
    const lon = 245 + 38 * b.u, lat = b.v * 3.5 * (0.6 + b.u); const x = X(lon), y = Y(lat), rx = b.rx * sx, ry = b.ry * sy;
    hc.save(); hc.translate(x, y); hc.scale(1, ry / rx); const g = hc.createRadialGradient(0, 0, 0, 0, 0, rx); const al = h.cold * (0.55 + 0.2 * Math.sin(t * 1.3 + b.ph));
    g.addColorStop(0, `rgba(70,200,255,${al})`); g.addColorStop(0.6, `rgba(40,120,255,${al * 0.5})`); g.addColorStop(1, 'rgba(40,120,255,0)'); hc.fillStyle = g; hc.beginPath(); hc.arc(0, 0, rx, 0, 7); hc.fill(); hc.restore();
  }
  if (h.a > 0.01) { const x0 = X(h.L0), x1 = X(h.L1), rx = (x1 - x0) / 2, ry = (h.w + 5) * sy; hc.save(); hc.translate((x0 + x1) / 2 + rx * 0.15, Y(-1)); hc.scale(1, ry / Math.max(1, rx)); const g = hc.createRadialGradient(0, 0, 0, 0, 0, rx); g.addColorStop(0, `rgba(255,70,60,${0.5 * h.a})`); g.addColorStop(0.7, `rgba(255,90,80,${0.28 * h.a})`); g.addColorStop(1, 'rgba(255,90,80,0)'); hc.fillStyle = g; hc.beginPath(); hc.arc(0, 0, rx, 0, 7); hc.fill(); hc.restore(); }
  if (h.a > 0.01) for (const b of BLOBS) {
    const lon = lerp(h.L0, h.L1, b.u), wid = 3 + h.w * 1.25 * Math.pow(b.u, 1.2); const lat = b.v * wid; const x = X(lon + Math.sin(t * 0.7 + b.ph) * 0.8), y = Y(lat), rx = b.rx * sx, ry = b.ry * sy;
    const kk = clamp(b.k * 0.6 + h.core * (1 - Math.abs(b.v)) * 0.7 + (b.u > 0.75 ? h.core * 0.3 : 0), 0, 0.999); const col = HCOL[Math.floor(kk * HCOL.length)];
    hc.save(); hc.translate(x, y); hc.scale(1, ry / rx); const g = hc.createRadialGradient(0, 0, 0, 0, 0, rx); const al = h.a * (0.6 + 0.25 * Math.sin(t * 1.7 + b.ph));
    g.addColorStop(0, `rgba(${col},${al})`); g.addColorStop(0.55, `rgba(${col},${al * 0.55})`); g.addColorStop(1, `rgba(${col},0)`); hc.fillStyle = g; hc.beginPath(); hc.arc(0, 0, rx, 0, 7); hc.fill(); hc.restore();
  }
  const [x0, y0] = mxy(HL0, HLAT), y1 = mxy(HL0, -HLAT)[1], w = ST.s * HSPAN * Math.PI / 180, full = ST.s * 2 * Math.PI;
  const zf = clamp(1 - Math.log(Math.max(1, ST.s / 2500)) / Math.log(4), 0.42, 1); m.save(); m.globalAlpha = 0.92 * zf; for (const off of [-full, 0, full]) { const xx = x0 + off; if (xx > MW || xx + w < 0) continue; m.drawImage(HC, xx, y0, w, y1 - y0); } m.restore();
  return h;
}

// ---------- alizés (traits de vent sur la carte) ----------
function windAt(t) { const a = A; return Math.min(clamp((t - a.alizes + 0.3) / 0.5), 1 - 0.85 * clamp((t - a.faiblit) / 0.5), 1 - clamp((t - a.toute) / 0.8)); }
function drawWind(t) {
  const wa = windAt(t); if (wa <= 0.01) return;
  m.save(); m.lineCap = 'round';
  for (let i = 0; i < 100; i++) {
    const lat = -14 + (i * 37 % 100) / 100 * 28, ph = (i * 0.6180339) % 1, head = 285 - ((t * 16 + ph * 165) % 165), len = 9 + (i % 6);
    const life = Math.sin(Math.PI * (((t * 16 + ph * 165) % 165) / 165));
    const pts = []; for (let k = 0; k <= 8; k++) { const lon = head + len * k / 8; pts.push(mxy(lon, lat + Math.sin(lon * 0.15 + i) * 0.6)); }
    const g = m.createLinearGradient(pts[0][0], pts[0][1], pts[8][0], pts[8][1]); g.addColorStop(0, `rgba(255,255,255,${0.85 * wa * life})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    m.beginPath(); pts.forEach((p, k) => k ? m.lineTo(p[0], p[1]) : m.moveTo(p[0], p[1])); m.strokeStyle = g; m.lineWidth = 4 + 3 * Math.min(1, ST.s / 900); m.stroke();
  }
  m.restore();
}

// ---------- pays ----------
let CS = [];
function drawCountries(t) {
  for (const c of CS) {
    if (t < c.t0 || t > c.t1 + 0.4) continue; const g = geomOf(c.id); const dt = t - c.t0; const fl = FL[ISO[c.id]];
    const out = fadeOut(t, c.t1, 0.4); const zf = clamp(1 - 0.5 * Math.log(Math.max(1, cam_s / 2500)) / Math.log(4), 0.45, 1); const fa = clamp(dt / 0.2) * lerp(0.9, 0.5, clamp((dt - 1.6) / 0.6)) * out * (c.dim ?? 1) * zf;
    const flash = Math.max(0, 1 - dt / 0.3);
    if (fl) flagFill(m, () => pathM(g), d3.geoPath(P).bounds(g), fl, fa, flash, SLICE.test(ISO[c.id]) ? 'slice' : 'stretch');
    m.save(); pathM(g); m.lineJoin = 'round'; m.lineWidth = 3.5; m.strokeStyle = '#fff'; m.globalAlpha = 0.85 * clamp(dt / 0.3) * out; m.shadowColor = '#fff'; m.shadowBlur = 14; m.stroke(); m.restore();
  }
}
function flagCard(c, x, y, img, w) { const h = w * 0.75; c.save(); c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 12; c.shadowOffsetY = 4; c.fillStyle = '#fff'; rr(c, x - w / 2 - 5, y - h / 2 - 5, w + 10, h + 10, 6); c.fill(); c.shadowColor = 'transparent'; if (img) c.drawImage(img, x - w / 2, y - h / 2, w, h); c.restore(); }
function drawPins(c, t) {
  for (const cs of CS) {
    if (cs.nopin || t < cs.t0) continue; const tEnd = Math.min(cs.t0 + (cs.pin ?? 2.0), cs.t1); if (t > tEnd + 0.25) continue;
    const a = ANCH[cs.id]; const p = S(a[0], a[1]); const al = fadeOut(t, tEnd, 0.25); const s = popIn(t, cs.t0, 0.3);
    const x = clamp(p.x + (cs.dx || 0), 190, 890), y = clamp(p.y + (cs.dy || 0), 420, 1380);
    c.save(); c.globalAlpha = al; c.translate(x, y); c.scale(s, s); flagCard(c, 0, -62, FL[ISO[cs.id]], 96);
    txt(c, typed(NAME[cs.id], t, cs.t0 + 0.05, 0.3), 0, 34, { size: 64, stroke: '#000', sw: 11 }); c.restore();
  }
}

// ---------- sprites posés sur la carte ----------
// o: drop (chute + écrasement), bob, rot, dx, dy, flip, ymin, ymax, pose(t)->nom
function mapSprite(c, name, lon, lat, h, t, t0, t1, o = {}) {
  if (t < t0 || t > t1 + 0.3) return null; const p = S(lon, lat); if (p.x < -160 || p.x > 1240 || p.y < -300 || p.y > 2200) return null;
  let x = p.x + (o.dx || 0), y = clamp(p.y + (o.dy || 0), o.ymin ?? 640, o.ymax ?? 1440); if (o.xclamp !== false) x = clamp(x, 170, 910);
  return screenSprite(c, name, x, y, h, t, t0, t1, o);
}
function screenSprite(c, name, x, y, h, t, t0, t1, o = {}) {
  if (t < t0 || t > t1 + 0.3) return null; const al = fadeOut(t, t1, 0.3); let sx = 1, sy = 1, yy = y, sc = 1;
  if (o.drop) { const k = clamp((t - t0) / 0.3); yy -= 520 * (1 - easeIn(k)); const bump = Math.max(0, 1 - Math.abs(t - t0 - 0.3) / 0.13); sx = 1 + 0.14 * bump; sy = 1 - 0.18 * bump; }
  else sc = popIn(t, t0, 0.3);
  if (o.bob) yy += Math.sin(t * (o.bobW || 3) + (o.ph || 0)) * o.bob;
  const rot = (o.rot || 0) + (o.wob ? Math.sin(t * (o.wobW || 2.4) + (o.ph || 0)) * o.wob : 0);
  const nm = o.pose ? o.pose(t) : name;
  sprite(c, nm, x + (o.shake ? Math.sin(t * 47) * o.shake : 0), yy, h * sc, { sx: sx * (o.flip ? -1 : 1), sy, rot, alpha: al * (o.alpha ?? 1), shadow: o.shadow });
  return { x, y: yy };
}

// ---------- vague (déplacement de l'eau chaude) ----------
function waveLon(t) { return lerp(140, 276, ease(prog(t, A.tw0, A.tw1 - A.tw0))); } // 0..360
const L180 = l => (l > 180 ? l - 360 : l);
function drawWaveTrail(c, t) {
  if (t < A.tw0 || t > A.b4 + 0.6) return; const al = fadeOut(t, A.b4 + 0.2, 0.4); const end = waveLon(t);
  const pts = []; for (let i = 0; i <= 50; i++) { const l = lerp(140, end, i / 50); pts.push(S(l, 0)); }
  c.save(); c.globalAlpha = al; c.lineCap = 'round'; c.beginPath(); pts.forEach((q, i) => i ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y));
  c.setLineDash([24, 16]); c.lineDashOffset = -t * 70; c.lineWidth = 13; c.strokeStyle = '#1b1300'; c.stroke(); c.lineWidth = 8; c.strokeStyle = '#F7EF08'; c.shadowColor = '#F7EF08'; c.shadowBlur = 14; c.stroke(); c.setLineDash([]);
  const hd = pts.at(-1); c.beginPath(); c.arc(hd.x, hd.y, 14, 0, 7); c.fillStyle = '#fff'; c.shadowColor = '#F7EF08'; c.shadowBlur = 30; c.fill();
  c.restore();
}

// ---------- texte écrit sur la carte (police à empattements, incliné, ancré) ----------
function mapText(c, s, lon, lat, t, t0, t1, o = {}) {
  if (t < t0 || t > t1 + 0.3) return; const p = S(lon, lat); const al = fadeOut(t, t1, 0.3);
  c.save(); c.globalAlpha = al; c.translate(p.x, p.y); c.rotate(ANG + (o.rot ?? -0.32));
  txt(c, typed(s, t, t0, o.d ?? 0.5), 0, 0, { size: o.size || 64, font: 'DejaVu Serif', weight: 700, color: o.color || '#fff', stroke: 'rgba(0,0,0,.6)', sw: 8 });
  c.restore();
}

// ---------- coupe de l'océan (50 cm) ----------
function drawSection(c, t, t0, t1, tcm) {
  if (t < t0 || t > t1 + 0.3) return; const al = Math.min(clamp((t - t0) / 0.3), fadeOut(t, t1, 0.3)); const sc = lerp(0.85, 1, backOut(prog(t, t0, 0.35)));
  const W0 = 900, H0 = 330; c.save(); c.globalAlpha = al; c.translate(540, 1180); c.scale(sc, sc);
  c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 30; rr(c, -W0 / 2, -H0 / 2, W0, H0, 26); c.fillStyle = 'rgba(8,24,44,.88)'; c.fill(); c.shadowColor = 'transparent'; c.lineWidth = 4; c.strokeStyle = 'rgba(255,255,255,.8)'; c.stroke();
  c.save(); rr(c, -W0 / 2, -H0 / 2, W0, H0, 26); c.clip();
  const fill = easeOut(prog(t, t0 + 0.1, 0.6)); const tilt = 70 * easeOut(prog(t, t0 + 0.4, 0.8)) * (1 + 0.04 * Math.sin(t * 3));
  const top = x => -40 + lerp(-tilt / 2, tilt / 2, (x + W0 / 2) / W0) + Math.sin(x * 0.03 + t * 4) * 4;
  // eau froide
  c.beginPath(); c.moveTo(-W0 / 2, H0 / 2); for (let x = -W0 / 2; x <= W0 / 2; x += 10) c.lineTo(x, lerp(H0 / 2, top(x), fill)); c.lineTo(W0 / 2, H0 / 2); c.closePath(); const g = c.createLinearGradient(0, -80, 0, H0 / 2); g.addColorStop(0, '#1e88c9'); g.addColorStop(1, '#0a3d6b'); c.fillStyle = g; c.fill();
  // couche chaude, épaisse à l'ouest, fine à l'est
  c.beginPath(); for (let x = -W0 / 2; x <= W0 / 2; x += 10) { const yt = lerp(H0 / 2, top(x), fill); x === -W0 / 2 ? c.moveTo(x, yt) : c.lineTo(x, yt); }
  for (let x = W0 / 2; x >= -W0 / 2; x -= 10) { const th = lerp(140, 18, (x + W0 / 2) / W0) * fill; c.lineTo(x, lerp(H0 / 2, top(x), fill) + th); } c.closePath();
  const g2 = c.createLinearGradient(-W0 / 2, 0, W0 / 2, 0); g2.addColorStop(0, '#ff3b1f'); g2.addColorStop(0.6, '#ff9a2b'); g2.addColorStop(1, 'rgba(255,190,60,.6)'); c.fillStyle = g2; c.fill();
  // remontée d'eau froide (est)
  for (let i = 0; i < 3; i++) { const x = 300 + i * 45, ph = ((t * 0.9 + i * 0.33) % 1); const y = lerp(130, 10, ph); c.globalAlpha = al * Math.sin(Math.PI * ph); txt(c, '↑', x, y, { size: 54, color: '#9fe3ff', shadow: false, weight: 900 }); } c.globalAlpha = al;
  // alizés au-dessus
  for (let i = 0; i < 4; i++) { const ph = (t * 0.8 + i / 4) % 1; const x = lerp(W0 / 2 - 40, -W0 / 2 + 40, ph); c.globalAlpha = al * Math.sin(Math.PI * ph) * 0.9; txt(c, '←', x, -125, { size: 48, color: '#fff', shadow: false, weight: 900 }); } c.globalAlpha = al;
  c.restore();
  txt(c, 'INDONÉSIE', -W0 / 2 + 130, H0 / 2 - 32, { size: 34, weight: 900 }); txt(c, 'ÉQUATEUR', W0 / 2 - 125, H0 / 2 - 32, { size: 34, weight: 900 });
  txt(c, 'ALIZÉS', 0, -125, { size: 34, weight: 900, color: '#fff' });
  if (t > tcm) { // +50 cm
    const yL = top(-W0 / 2 + 60), yR = top(W0 / 2 - 60); const s2 = popIn(t, tcm, 0.3);
    c.save(); c.strokeStyle = '#FFE928'; c.lineWidth = 5; c.setLineDash([12, 8]); c.beginPath(); c.moveTo(-W0 / 2 + 40, yR); c.lineTo(W0 / 2 - 40, yR); c.stroke(); c.setLineDash([]); c.restore();
    c.save(); c.translate(-W0 / 2 + 175, (yL + yR) / 2 - 20); c.scale(s2, s2); tag(c, '+50 CM', 0, 0, { size: 50, bg: '#FFE928', color: '#1b1300', border: '#1b1300' }); c.restore();
  }
  c.restore();
}

// ---------- divers ----------
function stampText(c, s, x, y, t, t0, t1, o = {}) {
  if (t < t0 || t > t1 + 0.3) return; const sz = o.size || 92; const sc = stampScale(t, t0) * fadeOut(t, t1, 0.3);
  c.save(); c.translate(x, y); c.rotate(o.rot ?? -0.08); c.scale(sc, sc); c.globalAlpha = clamp((t - t0) / 0.08) * fadeOut(t, t1, 0.3);
  const w = measure(c, s, sz, 900) + 60; c.fillStyle = o.bg || 'rgba(255,255,255,.9)'; rr(c, -w / 2, -sz * 0.7, w, sz * 1.4, 18); c.fill(); c.lineWidth = 10; c.strokeStyle = o.col || '#e01b24'; c.stroke();
  txt(c, s, 0, 4, { size: sz, color: o.tcol || o.col || '#e01b24', weight: 900, shadow: false }); c.restore();
}
function bigTitle(c, s, x, y, t, t0, t1, o = {}) {
  if (t < t0 || t > t1 + 0.3) return; const sz = o.size || 190; const sc = popIn(t, t0, 0.35) * (1 + 0.025 * Math.sin(t * 6)) * fadeOut(t, t1, 0.3);
  c.save(); c.translate(x, y); c.rotate(o.rot ?? -0.04); c.scale(sc, sc); c.shadowColor = o.glow || '#ff2a1a'; c.shadowBlur = 55;
  txt(c, s, 0, 0, { size: sz, weight: 900, color: o.color || '#fff', stroke: o.stroke || '#5a0000', sw: sz * 0.09, shadow: false }); c.shadowBlur = 0;
  txt(c, s, 0, 0, { size: sz, weight: 900, color: o.color || '#fff', shadow: false }); c.restore();
}
function darken(c, a) { if (a <= 0) return; c.save(); const g = c.createRadialGradient(W / 2, H / 2, 250, W / 2, H / 2, 1150); g.addColorStop(0, `rgba(0,0,0,${0.3 * a})`); g.addColorStop(1, `rgba(0,0,0,${0.85 * a})`); c.fillStyle = g; c.fillRect(0, 0, W, H); c.restore(); }
function bubble(c, x, y, t, t0, t1) { if (t < t0 || t > t1 + 0.3) return; const s = popIn(t, t0, 0.3) * fadeOut(t, t1, 0.3); c.save(); c.translate(x, y); c.scale(s, s); c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 16; rr(c, -95, -70, 190, 120, 34); c.fillStyle = '#fff'; c.fill(); c.beginPath(); c.moveTo(-40, 45); c.lineTo(-70, 95); c.lineTo(5, 48); c.fill(); c.shadowColor = 'transparent'; for (let i = -1; i <= 1; i++) { c.beginPath(); c.arc(i * 48, -10, 14 + 3 * Math.sin(t * 8 + i), 0, 7); c.fillStyle = '#E6197E'; c.fill(); } c.restore(); }

// ============ TIMELINE ============
let A = {};
function setup() {
  const a = A;
  a.el = T(0, 'el'); a.ce = T(0, 'ce'); a.famine0 = T(0, 'famine'); a.n50 = T(0, 'cinquante'); a.morts = T(0, 'morts'); a.retour0 = T(0, 'et'); a.retour = T(0, 'retour'); a.peut = T(0, 'peutetre'); a.fort = T(0, 'fort'); a.siecle = T(0, 'siecle'); a.fin0 = T(0, 'et', 2); a.montre = T(0, 'montre'); a.y27a = T(0, 'deux');
  a.b1 = beatStart(1); a.pech = T(1, 'pecheurs'); a.perou1 = T(1, 'perou'); a.ils = T(1, 'ils'); a.rech = T(1, 'rechauffer'); a.noel = T(1, 'noel'); a.poiss = T(1, 'poissons'); a.disp = T(1, 'disparaitre'); a.alors = T(1, 'alors'); a.elnino1 = T(1, 'el'); a.jesus = T(1, 'lenfant');
  a.b2 = beatStart(2); a.venti = T(2, 'ventilateur'); a.pacif = T(2, 'pacifique'); a.alizes = T(2, 'alizes'); a.souff = T(2, 'soufflent'); a.ouest = T(2, 'ouest'); a.pouss = T(2, 'poussent'); a.chaude = T(2, 'chaude'); a.indo1 = T(2, 'indonesie'); a.labas = T(2, 'labas'); a.cm = T(2, 'cinquante'); a.equa1 = T(2, 'equateur');
  a.b3 = beatStart(3); a.deux = T(3, 'deux'); a.faiblit = T(3, 'faiblit'); a.toute = T(3, 'et'); a.repart = T(3, 'repart'); a.est = T(3, 'lest'); a.vague = T(3, 'vague'); a.baign = T(3, 'baignoire'); a.sur = T(3, 'sur'); a.km = T(3, 'dix');
  a.b4 = beatStart(4); a.meteo = T(4, 'meteo'); a.folle = T(4, 'folle'); a.perou2 = T(4, 'perou'); a.equa2 = T(4, 'lequateur'); a.noyes = T(4, 'noyes'); a.pluies = T(4, 'pluies'); a.indo2 = T(4, 'lindonesie'); a.aus = T(4, 'laustralie'); a.brul = T(4, 'brulent'); a.sech1 = T(4, 'secheresse'); a.afr = T(4, 'lafrique'); a.inond = T(4, 'inondations'); a.ken = T(4, 'kenya'); a.sech2 = T(4, 'secheresse', 2); a.zam = T(4, 'zambie'); a.zim = T(4, 'zimbabwe');
  a.cette = beatStart(5); a.y1877 = T(5, 'mille'); a.extr = T(5, 'un'); a.asse = T(5, 'asseche'); a.inde = T(5, 'linde'); a.chine = T(5, 'chine'); a.bres = T(5, 'bresil'); a.env = T(5, 'environ'); a.trois = T(5, 'trois'); a.morte = T(5, 'morte');
  a.auj = beatStart(6); a.large = T(6, 'au'); a.perou3 = T(6, 'perou'); a.quatre = T(6, 'quatre'); a.normale = T(6, 'normale'); a.meteo2 = T(6, 'meteo'); a.brit = T(6, 'britannique'); a.y27b = T(6, 'deux'); a.proba = T(6, 'probablement'); a.chaude2 = T(6, 'chaude'); a.mes = T(6, 'mesuree');
  a.chez = beatStart(7); a.sens = T(7, 'sens'); a.comm = T(7, 'commentaire'); a.abo = T(7, 'abonnetoi'); a.proch = T(7, 'prochaine'); a.jum = T(7, 'jumelle'); a.nina = T(7, 'la', 2); a.end = TE(7, 'nina');
  DUR = a.end + 0.55;
  a.tw0 = a.repart - 0.15; a.tw1 = a.baign + 0.75;

  // ---- nappe chaude : [t, [a, L0, L1, largeur est, froid, cœur]]
  HKF = [
    [0, [0.85, 185, 282, 7, 0, 0.6]], [a.b1 - 0.3, [0.85, 185, 282, 7, 0, 0.6]], [a.b1 + 0.8, [0, 262, 284, 3, 0, 0.3]], [a.rech - 0.1, [0, 262, 284, 3, 0, 0.3]], [a.rech + 0.8, [0.75, 262, 284, 4, 0, 0.5]],
    [a.b2 - 0.2, [0.75, 262, 284, 4, 0, 0.5]], [a.b2 + 1.0, [0.7, 150, 210, 2, 0.75, 0.2]], [a.pouss - 0.05, [0.7, 150, 210, 2, 0.75, 0.2]], [a.indo1, [0.75, 116, 172, 2, 0.8, 0.3]],
    [a.tw0 - 0.3, [0.75, 116, 172, 2, 0.8, 0.3]], [a.tw1, [0.8, 150, 280, 6, 0.1, 0.5]], [a.b4 + 0.5, [0.85, 168, 282, 7, 0, 0.7]],
    [a.cette, [0.85, 168, 282, 7, 0, 0.7]], [a.cette + 0.6, [0.45, 168, 282, 7, 0, 0.7]], [a.auj - 0.2, [0.45, 168, 282, 7, 0, 0.7]], [a.auj + 1.0, [0.95, 165, 283, 8, 0, 1]],
    [a.chez - 0.4, [0.95, 165, 283, 8, 0, 1]], [a.nina - 0.3, [0.5, 165, 283, 8, 0, 0.6]], [a.nina + 0.4, [0, 165, 283, 8, 0.9, 0.6]]
  ];

  // ---- pays nommés : drapeau au mot exact
  const C = (id, t0, t1, o = {}) => CS.push({ id, t0, t1, ...o });
  C('604', a.perou1, a.b2 + 0.4, { dx: 80, dy: -90 });
  C('360', a.indo1, a.cm + 0.4, { dy: 160 }); C('218', a.equa1, a.b3 + 1.2, { dy: -40 });
  C('604', a.perou2, a.indo2 + 0.3, { dx: 160, dy: 120, pin: 1.2 }); C('218', a.equa2, a.indo2 + 0.3, { dx: 200, dy: -160 });
  C('360', a.indo2, a.afr, { dy: -150 }); C('036', a.aus, a.afr, { dx: 150, dy: 60 });
  C('404', a.ken, a.cette + 0.4, { dx: -60, dy: -170, pin: 1.5 }); C('894', a.zam, a.cette + 0.4, { dx: -220, dy: -140, pin: 1.4 }); C('716', a.zim, a.cette + 0.4, { dx: 40, dy: 190, pin: 1.3 });
  C('356', a.inde, a.auj + 0.3, { dy: -150 }); C('156', a.chine, a.auj + 0.3, { dy: -150 }); C('076', a.bres, a.auj + 0.3, { dy: -150 });
  C('604', a.perou3, a.y27b, { dx: 100, dy: -260 });

  const st = (t, d, lon, lat, s, o = {}) => ({ t, d, lon, lat, s, ...o });
  const stops = [
    st(0, 0, -140, 2, 440, { drift: 0.07 }),
    st(a.ce + 0.1, 0.9, -122, -2, 680),
    st(a.n50 - 0.05, 0.8, -128, 0, 470),
    st(a.retour + 0.3, 1.2, -96, -3, 2400),
    st(a.fort - 0.05, 0.9, -102, -2, 1300),
    st(a.fin0 + 0.3, 1.0, -135, 0, 640),
    st(a.y27a + 0.2, 1.0, -150, 3, 440, { drift: 0.02 }),
    st(a.perou1 - 0.1, 1.4, -80.8, -8, 9000, { drift: 0.04 }),
    st(a.rech + 0.1, 0.9, -81, -8.6, 11500),
    st(a.poiss - 0.05, 0.8, -81.3, -8, 7600),
    st(a.alors + 0.1, 0.9, -81, -7.8, 10000),
    st(a.jesus - 0.05, 0.8, -81.5, -8, 6400),
    st(a.venti + 0.3, 1.4, -112, -2, 620),
    st(a.pacif + 0.05, 0.9, -122, 0, 470),
    st(a.alizes - 0.05, 0.8, -112, 1, 620),
    st(a.souff + 0.5, 1.0, -150, 1, 470),
    st(a.indo1 + 0.05, 1.5, 125, -2, 1100),
    st(a.cm + 0.1, 1.2, -165, -2, 450, { drift: 0.02 }),
    st(a.equa1 + 0.05, 0.8, -105, -2, 640),
    st(a.deux + 0.3, 1.0, -93, -1, 1400),
    st(a.faiblit + 0.1, 0.7, -91, -1, 2100),
    st(a.tw0, 0.85, 140, 0, 820),
  ];
  // caméra verrouillée sur la vague
  for (let t = a.tw0 + 0.12; t <= a.tw1 + 1e-6; t += 0.12) stops.push(st(t, 0.12, L180(waveLon(t) + 6), 0, 820 * Math.exp(0.32 * Math.sin((t - a.tw0) * 2.1)), { lin: true, drift: 0.02 }));
  stops.push(
    st(a.km - 0.1, 0.8, -150, 0, 440),
    st(a.meteo, 0.8, -140, 0, 470),
    st(a.perou2 - 0.05, 1.3, -80.2, -3.5, 9400, { drift: 0.04 }),
    st(a.indo2 + 0.15, 0.9, 124, -12, 650),
    st(a.sech1 + 0.1, 0.8, 128, -15, 950),
    st(a.afr - 0.05, 0.8, 80, -10, 470),
    st(a.inond + 0.2, 0.9, 33, -4, 900),
    st(a.ken + 0.05, 0.7, 36, -2, 1300),
    st(a.zam - 0.05, 0.8, 29, -14, 1250),
    st(a.zim + 0.1, 0.6, 30, -16, 1500),
    st(a.cette + 0.6, 1.2, 28, 12, 430, { drift: 0.01 }),
    st(a.y1877 + 0.3, 0.8, 30, 13, 520),
    st(a.extr + 0.2, 0.9, 31, 14, 425, { drift: 0.01 }),
    st(a.inde + 0.05, 0.7, 62, 18, 600),
    st(a.chine + 0.05, 0.6, 78, 20, 560),
    st(a.bres + 0.05, 0.6, 30, 14, 425, { drift: 0.01 }),
    st(a.trois - 0.05, 0.9, 30, 14, 560),
    st(a.auj + 0.5, 1.0, -100, 0, 450),
    st(a.perou3 - 0.05, 1.4, -80.8, -6, 9200, { drift: 0.04 }),
    st(a.quatre + 0.05, 0.8, -81.5, -6, 12000),
    st(a.normale + 0.1, 0.8, -83, -4, 6800),
    st(a.brit + 0.1, 1.0, -100, 0, 1000),
    st(a.y27b + 0.4, 1.3, -60, 10, 450),
    st(a.chaude2 + 0.05, 0.8, -50, 14, 560),
    st(a.chez + 0.3, 1.1, -130, 2, 470),
    st(a.comm + 0.2, 0.9, -120, 0, 640),
    st(a.abo + 0.3, 0.9, -138, 2, 460),
    st(a.jum - 0.1, 0.9, -128, 1, 700),
    st(a.nina + 0.2, 1.0, -135, 0, 540, { drift: 0.05 }),
  );
  cam = makeCam2(stops);
  A.tilt = [[a.fort - 0.5, a.fin0 + 0.4, 22], [a.venti - 0.2, a.pacif + 0.6, 26], [a.labas - 0.1, a.equa1 + 0.6, 28], [a.extr - 0.3, a.trois - 0.5, 22], [a.y27b - 0.1, a.chaude2 - 0.4, 22], [a.chez - 0.1, a.sens + 0.6, 24], [a.afr - 0.4, a.inond + 0.1, 18]];

  // ---- sons
  for (const s of stops) if (!s.lin && s.t > 0.3 && s.d >= 0.6) ev(s.t - s.d, 'whoosh');
  ev(0, 'whoosh'); ev(0.02, 'impact'); act(0.05, 'nappe chaude', 'pulse au large du Pérou');
  ev(a.n50, 'stamp'); ev(a.morts + 0.3, 'tic'); ev(a.n50 + 0.05, 'heartbeat'); act(a.n50, 'badge', '50 000 000 MORTS');
  ev(a.retour, 'ping'); act(a.retour, 'nappe chaude', 'flash'); ev(a.fort, 'stamp'); ev(a.y27a, 'alarm'); ev(a.montre, 'tic'); ev(a.fin0, 'pop'); act(a.y27a, 'badge', '2027 ?');
  ev(a.perou1 - 0.5, 'ping'); ev(a.perou1, 'scan'); ev(a.pech - 0.3, 'fall'); ev(a.pech, 'water'); act(a.pech, 'pêcheur', 'tire son filet');
  ev(a.ils, 'pop'); ev(a.rech, 'swell'); act(a.rech, 'mer', 'se réchauffe'); ev(a.noel, 'sparkle'); act(a.noel, 'étoile', 'brille');
  ev(a.poiss, 'water'); act(a.poiss, 'poissons', 'fuient'); ev(a.disp, 'boing'); act(a.disp, 'pêcheur', 'se gratte la tête'); ev(a.elnino1, 'pop'); ev(a.jesus, 'shine');
  ev(a.venti - 0.3, 'fall'); ev(a.venti, 'thud'); ev(a.venti + 0.2, 'fan'); act(a.venti, 'ventilateur', 'tourne'); ev(a.pacif, 'type');
  ev(a.alizes, 'wind'); act(a.alizes, 'alizés', 'soufflent vers l\'ouest'); ev(a.ouest, 'type'); ev(a.pouss, 'wave'); act(a.pouss, 'eau chaude', 'glisse vers l\'ouest');
  ev(a.indo1 - 0.4, 'ping'); ev(a.indo1, 'scan'); ev(a.labas, 'pop'); act(a.labas, 'coupe', 'la mer penche'); ev(a.cm, 'ding'); ev(a.equa1, 'scan');
  ev(a.deux, 'pop'); ev(a.faiblit, 'powerdown'); act(a.faiblit, 'ventilateur', 'ralentit'); ev(a.tw0, 'wave'); ev(a.tw0 + 1.3, 'water'); ev(a.tw0 + 2.6, 'wave'); act(a.tw0, 'vague', 'traverse le Pacifique');
  ev(a.baign, 'pop'); ev(a.baign + 0.1, 'water'); act(a.baign, 'baignoire', 'déborde'); ev(a.km, 'draw'); ev(a.km + 0.35, 'type');
  ev(a.meteo, 'boing'); act(a.meteo, 'planète', 'panique');
  ev(a.perou2, 'scan'); ev(a.equa2, 'scan'); ev(a.equa2 + 0.35, 'thunder'); ev(a.equa2 + 0.5, 'rain'); ev(a.noyes + 0.25, 'thud'); act(a.noyes, 'orage', 'pluie et maison inondée'); ev(a.pluies, 'pop');
  ev(a.indo2, 'scan'); ev(a.aus, 'scan'); ev(a.brul, 'fire'); act(a.brul, 'forêt', 'brûle'); ev(a.sech1, 'pop'); act(a.sech1, 'kangourou', 'a chaud');
  ev(a.ken, 'scan'); ev(a.ken + 0.1, 'rain'); act(a.ken, 'orage', 'Kenya'); ev(a.zam, 'scan'); ev(a.zam + 0.05, 'pop'); act(a.zam, 'maïs', 'sèche'); ev(a.zim, 'scan'); ev(a.zim + 0.05, 'pop');
  ev(a.cette, 'film'); ev(a.extr, 'pop'); ev(a.extr + 0.75, 'tic'); ev(a.asse, 'tic'); act(a.cette, 'pellicule', '1877'); ev(a.y1877, 'stamp'); ev(a.inde, 'scan'); ev(a.inde - 0.25, 'fall'); ev(a.chine, 'scan'); ev(a.chine - 0.25, 'fall'); ev(a.bres, 'scan'); ev(a.bres - 0.25, 'fall'); act(a.inde, 'bols vides', 'tombent');
  ev(a.trois, 'impact'); ev(a.trois + 0.1, 'heartbeat'); act(a.trois, 'chiffre', '3 %');
  ev(a.auj, 'sweep'); ev(a.large, 'ping'); ev(a.perou3, 'scan'); ev(a.quatre - 0.2, 'fall'); ev(a.quatre, 'count'); act(a.quatre, 'thermomètre', 'monte');
  ev(a.meteo2, 'pop'); ev(a.brit, 'scan'); act(a.meteo2, 'scientifique', 'montre'); ev(a.y27b, 'impact'); ev(a.y27b + 0.1, 'fire'); act(a.y27b, 'scientifique', 'choqué'); ev(a.chaude2, 'stamp'); act(a.chaude2, 'planète', 'brûle');
  ev(a.chez, 'pop'); act(a.chez, 'texte', 'ET CHEZ TOI ?'); ev(a.comm, 'pop'); ev(a.abo, 'pop'); ev(a.abo + 0.1, 'ding'); act(a.abo, 'explorateur', 'salue'); ev(a.nina, 'sparkle'); ev(a.nina + 0.05, 'pop'); act(a.nina, 'ventilateur glacé', 'apparaît');
  window.PREVIEW = [0.3, a.n50 + 0.5, a.fort + 0.4, a.y27a + 0.3, a.pech + 0.5, a.noel + 0.4, a.disp + 0.3, a.jesus + 0.4, a.venti + 0.5, a.alizes + 0.6, a.indo1 + 0.3, a.cm + 0.5, a.faiblit + 0.4, (a.tw0 + a.tw1) / 2, a.baign + 0.4, a.km + 0.6, a.meteo + 0.5, a.pluies + 0.3, a.sech1 + 0.4, a.zam + 0.4, a.cette + 0.6, a.bres + 0.5, a.trois + 0.6, a.quatre + 0.8, a.y27b + 0.6, a.chaude2 + 0.4, a.chez + 0.5, a.abo + 0.4, a.nina + 0.4];
}
function tiltAt(t) { let v = 0; for (const [t0, t1, deg] of A.tilt) { if (t < t0 || t > t1 + 1) continue; v = Math.max(v, deg * Math.min(ease((t - t0) / 0.9), 1 - ease((t - t1) / 1))); } return v * Math.PI / 180; }
function angAt(t) { const f = 1 - 0.75 * Math.min(clamp((t - A.extr + 0.8) / 0.8), 1 - clamp((t - A.trois) / 0.8)); return f * (8 * Math.sin(2 * Math.PI * t / 13) + 3.5 * Math.sin(2 * Math.PI * t / 7 + 1)) * Math.PI / 180; }

// ============ CALQUE ÉCRAN ============
let TN_ = null;
function screenScene(c, t) {
  const a = A;
  // --- accroche
  darken(c, Math.min(clamp((t - a.n50 + 0.15) / 0.3), fadeOut(t, a.retour0 - 0.1, 0.4)) * 0.8);
  bigTitle(c, 'EL NIÑO', W / 2, 560, t, 0, a.retour0 - 0.2, { size: 200 });
  stampText(c, '50 000 000 MORTS', W / 2, 880, t, a.n50, a.retour0 - 0.1, { size: 88, rot: -0.07 });
  if (t > a.retour - 0.1 && t < a.peut + 0.3) { const p = S(-100, -3); ping(c, p.x, p.y, t, a.retour - 0.1, '', a.peut); }
  if (t > a.fort - 0.05 && t < a.fin0 + 0.3) { const s = stampScale(t, a.fort) * fadeOut(t, a.fin0, 0.3); tag(c, 'LE PLUS FORT', W / 2, 500, { size: 70, bg: '#C00E1F', border: '#fff', sc: s, rot: -0.05 }); tag(c, 'DEPUIS 100 ANS ?', W / 2, 610, { size: 56, bg: '#fff', color: '#C00E1F', sc: popIn(t, a.siecle, 0.3) * fadeOut(t, a.fin0, 0.3), rot: -0.05 }); }
  if (t > a.y27a - 0.05 && t < a.b1 + 0.3) { const blink = 0.75 + 0.25 * (Math.floor(t * 6) % 2); const s = popIn(t, a.y27a, 0.3) * fadeOut(t, a.b1, 0.3); c.save(); c.globalAlpha = blink; tag(c, '2027 ?', W / 2, 520, { size: 110, bg: '#C00E1F', border: '#FFE928', sc: s }); c.restore(); }
  // --- Pérou, pêcheurs
  mapSprite(c, 'fisher_a', -82.6, -7.8, 330, t, a.pech - 0.3, a.b2 - 0.1, { drop: true, bob: 7, bobW: 2.6, wob: 0.05, pose: tt => tt > a.disp - 0.05 ? 'fisher_b' : 'fisher_a', ymin: 900, ymax: 1400 });
  if (t > a.poiss && t < a.alors + 0.5) { const p = S(-82.6, -7.8); const k = prog(t, a.poiss, 1.6); screenSprite(c, 'fish', clamp(p.x, 170, 910) - 120 - 520 * easeIn(k), clamp(p.y, 900, 1400) - 40 + Math.sin(t * 9) * 8, 150, t, a.poiss, a.alors, { flip: false }); }
  if (t > a.noel - 0.05 && t < a.b2 + 0.1) { c.save(); c.translate(820, 700); c.rotate(Math.sin(t * 2) * 0.08); c.shadowColor = '#ffe680'; c.shadowBlur = 60 + 20 * Math.sin(t * 5); screenSprite(c, 'star', 0, 110, 220, t, a.noel, a.b2 - 0.2, { shadow: false }); c.restore(); }
  if (t > a.ils && t < a.alors) tag(c, 'PÉROU · XIXe SIÈCLE', W / 2, 300, { size: 46, bg: '#1b2a4a', border: '#fff', sc: popIn(t, a.ils, 0.3) * fadeOut(t, a.alors - 0.2, 0.25) });
  if (t > a.elnino1 - 0.05 && t < a.b2 + 0.1) { const s = popIn(t, a.elnino1, 0.3) * fadeOut(t, a.b2 - 0.2, 0.3); tag(c, 'EL NIÑO', W / 2, 400, { size: 96, bg: '#FFE928', color: '#1b1300', border: '#1b1300', sc: s, rot: -0.04 }); if (t > a.jesus) txt(c, typed('= L\'ENFANT JÉSUS', t, a.jesus, 0.4), W / 2, 520, { size: 64, weight: 900, stroke: '#000', sw: 11 }); }
  // --- ventilateur / alizés
  const fanP = S(-86, -1.2);
  if (t > a.venti - 0.3 && t < a.tw0 + 0.6 && fanP.x > -120 && fanP.x < 1150) {
    const on = t < a.faiblit; const h = 330 * clamp(Math.sqrt(cam_s / 700), 0.75, 1.15);
    screenSprite(c, on ? 'fan_a' : 'fan_b', fanP.x + 40, clamp(fanP.y + 150, 800, 1420), h, t, a.venti - 0.3, a.tw0 + 0.3, { drop: true, shake: on ? 2.5 : 0, rot: on ? 0 : 0.18 * easeOut(prog(t, a.faiblit, 0.5)) });
  }
  mapText(c, 'OCÉAN PACIFIQUE', -126, 13, t, a.pacif, a.indo1 - 0.3, { size: 62, rot: -0.2 });
  if (t > a.alizes - 0.05 && t < a.labas) tag(c, '← ALIZÉS ←', W / 2, 470, { size: 72, bg: '#1f6fd1', border: '#fff', sc: popIn(t, a.alizes, 0.3) * fadeOut(t, a.labas - 0.2, 0.3) });
  mapText(c, 'EST', -100, 9, t, a.souff + 0.2, a.indo1, { size: 70, rot: 0, d: 0.2, color: '#FFE928' });
  mapText(c, 'OUEST', 172, 9, t, a.ouest, a.indo1 + 0.4, { size: 70, rot: 0, d: 0.3, color: '#FFE928' });
  if (t > a.indo1 - 0.45 && t < a.indo1 + 0.3) { const p = S(117, -1); ping(c, p.x, p.y, t, a.indo1 - 0.45, '', a.indo1 + 0.1); }
  drawSection(c, t, a.labas - 0.05, a.b3 - 0.15, a.cm);
  // --- tous les 2 à 7 ans, la vague
  if (t > a.deux - 0.05 && t < a.toute + 0.2) tag(c, 'TOUS LES 2 À 7 ANS', W / 2, 300, { size: 58, bg: '#C00E1F', border: '#fff', sc: popIn(t, a.deux, 0.3) * fadeOut(t, a.toute, 0.25) });
  if (t > a.faiblit - 0.05 && t < a.toute + 0.2) stampText(c, 'IL FAIBLIT', W / 2, 520, t, a.faiblit, a.toute, { col: '#5d6b7a', size: 84 });
  drawWaveTrail(c, t);
  if (t > a.tw0 - 0.2 && t < a.km + 0.3) { const p = S(waveLon(t), 0); screenSprite(c, 'wave', clamp(p.x, 180, 900), clamp(p.y + 130, 700, 1400), 300, t, a.tw0 - 0.2, a.km, { bob: 10, bobW: 4, wob: 0.06, wobW: 3 }); }
  if (t > a.baign - 0.05 && t < a.b4) { c.save(); c.translate(820, 640); c.rotate(Math.sin(t * 5) * 0.12); screenSprite(c, 'bath', 0, 90, 190, t, a.baign, a.b4 - 0.2, { shadow: false }); c.restore(); }
  if (t > a.km - 0.05 && t < a.b4 + 0.5) { const A0 = S(140, 0), B0 = S(276, 0); distanceLine(c, [A0.x, A0.y], [B0.x, B0.y], t, a.km, '+10 000 KM', { until: a.b4 + 0.1 }); }
  // --- impacts
  if (t > a.meteo - 0.1 && t < a.perou2 + 0.1) screenSprite(c, 'earth_scared', W / 2, 1300, 400, t, a.meteo - 0.1, a.perou2 - 0.2, { shake: 6 * clamp((t - a.folle) / 0.2), wob: 0.06, wobW: 9 });
  if (t > a.folle - 0.05 && t < a.perou2) stampText(c, 'MÉTÉO FOLLE', W / 2, 480, t, a.folle, a.perou2 - 0.2, { size: 90 });
  mapSprite(c, 'storm', -81.2, -2.6, 300, t, a.equa2 + 0.35, a.indo2 + 0.2, { bob: 8, bobW: 2, ymin: 760, dx: -60 });
  mapSprite(c, 'flood', -79.6, -4.6, 230, t, a.noyes - 0.05, a.indo2 + 0.2, { drop: true, ymin: 1000, dx: 40 });
  mapSprite(c, 'fire', 113.5, 0.5, 250, t, a.brul - 0.05, a.afr - 0.2, { wob: 0.03, wobW: 11 });
  mapSprite(c, 'sun', 140, -15, 220, t, a.brul + 0.1, a.afr - 0.2, { rot: 0, wob: 0.15, wobW: 1.5 });
  mapSprite(c, 'kangaroo', 124, -27, 260, t, a.sech1 - 0.05, a.afr - 0.2, { drop: true, bob: 6, bobW: 5 });
  mapSprite(c, 'storm', 39, 0.5, 240, t, a.ken + 0.2, a.cette, { bob: 6, bobW: 2.2, dx: 150, dy: 120 });
  mapSprite(c, 'drought', 26.5, -14.5, 230, t, a.zam + 0.15, a.cette, { drop: true, dx: 90, dy: 250 });
  mapSprite(c, 'tree', 30.5, -19.5, 230, t, a.zim + 0.15, a.cette, { drop: true, dx: 170, dy: -60 });
  if (t > a.afr - 0.05 && t < a.inond + 0.4) tag(c, 'ET L\'AFRIQUE ?', W / 2, 470, { size: 76, bg: '#C00E1F', border: '#fff', sc: popIn(t, a.afr, 0.3) * fadeOut(t, a.inond + 0.1, 0.25) });
  // --- 1877
  filmStrip(c, t, a.cette - 0.1, 1.5, '1877', null);
  if (t > a.y1877 - 0.05 && t < a.auj) tag(c, '1877', W / 2, 300, { size: 70, bg: '#5a3a1a', border: '#f3e2bf', sc: popIn(t, a.y1877, 0.3) * fadeOut(t, a.auj - 0.2, 0.25) });
  if (t > a.extr - 0.05 && t < a.trois) tag(c, 'SÉCHERESSE GÉANTE', W / 2, 460, { size: 62, bg: '#8a2b0f', border: '#f3e2bf', sc: popIn(t, a.extr, 0.3) * fadeOut(t, a.trois - 0.2, 0.25) });
  mapSprite(c, 'bowl', 79, 22, 170, t, a.inde - 0.25, a.trois - 0.1, { drop: true, ymin: 500, dy: 60 });
  mapSprite(c, 'bowl', 104, 33, 170, t, a.chine - 0.25, a.trois - 0.1, { drop: true, ymin: 500, dy: 60 });
  mapSprite(c, 'bowl', -42, -8, 170, t, a.bres - 0.25, a.trois - 0.1, { drop: true, ymin: 500, dy: 60 });
  if (t > a.trois - 0.1 && t < a.auj + 0.4) { tragic(c, '3 %', 'DE L\'HUMANITÉ', t, a.trois, a.auj - 0.45); if (t > a.morte - 0.1) { c.save(); c.globalAlpha = Math.min(clamp((t - a.morte) / 0.3), fadeOut(t, a.auj - 0.45, 0.4)); txt(c, '≈ 50 MILLIONS DE MORTS', W / 2, 1110, { size: 54, weight: 800, color: '#ffd7cf', stroke: '#000', sw: 9 }); c.restore(); } }
  // --- aujourd'hui
  if (t > a.auj - 0.05 && t < a.brit) tag(c, 'OCTOBRE 2026', W / 2, 300, { size: 58, bg: '#C00E1F', border: '#fff', sc: popIn(t, a.auj, 0.3) * fadeOut(t, a.brit - 0.2, 0.25) });
  if (t > a.large - 0.1 && t < a.perou3 + 0.3) { const p = S(-82, -6); ping(c, p.x, p.y, t, a.large - 0.1, 'AU LARGE DU PÉROU', a.perou3 + 0.05); }
  if (t > a.quatre - 0.3 && t < a.brit + 0.2) {
    const al = fadeOut(t, a.brit - 0.1, 0.3); c.save(); c.globalAlpha = al;
    screenSprite(c, 'thermo', 300, 1380, 380, t, a.quatre - 0.3, a.brit, { drop: true, shadow: false, wob: 0.04, wobW: 8 });
    if (t > a.quatre) { const p = ease(prog(t, a.quatre, 0.9)); const v = (3.9 * p).toFixed(1).replace('.', ','); const bump = 1 + 0.12 * Math.max(0, 1 - Math.abs(t - a.quatre - 0.9) / 0.15); c.save(); c.translate(W / 2 + 60, 560); c.scale(bump * popIn(t, a.quatre, 0.25), bump * popIn(t, a.quatre, 0.25)); txt(c, '+' + v + ' °C', 0, 0, { size: 150, color: '#FFE928', stroke: '#3a0a00', sw: 16, weight: 900 }); txt(c, 'AU-DESSUS DE LA NORMALE', 0, 110, { size: 44, stroke: '#000', sw: 8 }); txt(c, 'SOURCE : NOAA, OCT. 2026', 0, 170, { size: 30, weight: 600, color: 'rgba(255,255,255,.85)', stroke: '#000', sw: 6 }); c.restore(); }
    c.restore();
  }
  if (t > a.brit - 0.1 && t < a.chez) {
    const al = fadeOut(t, a.chez - 0.2, 0.3); const s = popIn(t, a.brit, 0.3); c.save(); c.globalAlpha = al; c.translate(W / 2, 300); c.scale(s, s); flagCard(c, -150, 0, FL.gb, 110); tag(c, 'MET OFFICE', 70, 0, { size: 52, bg: '#1b2a4a', border: '#fff' }); c.restore();
    screenSprite(c, 'sci_a', 230, 1430, 360, t, a.meteo2 - 0.1, a.chez - 0.2, { pose: tt => tt > a.y27b - 0.05 ? 'sci_b' : 'sci_a', bob: 4, bobW: 6 });
  }
  if (t > a.y27b - 0.05 && t < a.chez + 0.2) {
    const al = fadeOut(t, a.chez, 0.3); c.save(); c.globalAlpha = al; c.save(); c.translate(W / 2, 1020); c.rotate(t * 0.15); c.shadowColor = '#ff6a00'; c.shadowBlur = 80; screenSprite(c, 'earth_hot', 0, 190, 380, t, a.y27b, a.chez, { shadow: false }); c.restore(); c.restore();
    bigTitle(c, '2027', W / 2, 560, t, a.y27b, a.chez - 0.1, { size: 230, color: '#FFE928', stroke: '#6a1000', glow: '#ff5a00' });
    stampText(c, 'L\'ANNÉE LA PLUS CHAUDE ?', W / 2, 760, t, a.chaude2, a.chez - 0.1, { size: 60, col: '#e01b24' });
  }
  // --- fin
  if (t > a.chez - 0.05) { const s = popIn(t, a.chez, 0.3) * (1 + 0.1 * Math.max(0, 1 - Math.abs(t - a.chez - 0.8) / 0.15)) * fadeOut(t, a.abo - 0.15, 0.25); c.save(); c.translate(W / 2, 560); c.scale(s, s); txt(c, 'ET CHEZ TOI ?', 0, 0, { size: 116, weight: 900, color: '#FFE928', stroke: '#1b1300', sw: 14 }); c.restore(); }
  bubble(c, 840, 760, t, a.comm, a.abo - 0.1);
  screenSprite(c, 'earth_scared', W / 2, 1380, 330, t, a.chez, a.abo - 0.2, { wob: 0.05, wobW: 4 });
  if (t > a.abo - 0.15) { screenSprite(c, 'explorer', 270, 1440, 380, t, a.abo - 0.15, 1e9, { wob: 0.05, wobW: 5 }); tag(c, 'ABONNE-TOI', W / 2, 470, { size: 80, bg: '#C00E1F', border: '#fff', sc: stampScale(t, a.abo) }); }
  if (t > a.nina - 0.1) { c.save(); c.shadowColor = '#9fe3ff'; c.shadowBlur = 50; screenSprite(c, 'fan_ice', 790, 1420, 340, t, a.nina - 0.1, 1e9, { shake: 1.5, shadow: false }); c.restore(); tag(c, 'LA NIÑA', 790, 1000, { size: 70, bg: '#1f6fd1', border: '#fff', sc: popIn(t, a.nina, 0.3) }); tag(c, 'PROCHAINE VIDÉO', 790, 905, { size: 38, bg: '#fff', color: '#1f6fd1', sc: popIn(t, a.nina + 0.15, 0.3) }); }
}

// ============ RENDU ============
window.render = function (t) {
  const st = cam(t); ST = st; cam_s = st.s; ANG = angAt(t); TILT = tiltAt(t);
  P = d3.geoMercator().rotate([-st.lon, 0]).center([0, st.lat]).scale(st.s).translate([540 + OX, CY + OY]).precision(0).clipExtent([[0, 0], [MW, MH]]);
  drawSat(st); const tn = tint(t); drawHeat(t); drawWind(t); drawCountries(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#0b3a52'; ctx.fillRect(0, 0, W, H);
  if (TILT < 0.001) { ctx.save(); ctx.translate(540, CY); ctx.rotate(ANG); ctx.translate(-540 - OX, -CY - OY); ctx.drawImage(mapC, 0, 0); ctx.restore(); }
  else {
    rc.setTransform(1, 0, 0, 1, 0, 0); rc.clearRect(0, 0, MW, MH); rc.translate(540 + OX, CY + OY); rc.rotate(ANG); rc.translate(-540 - OX, -CY - OY); rc.drawImage(mapC, 0, 0); rc.setTransform(1, 0, 0, 1, 0, 0);
    const sn = Math.sin(TILT), cs = Math.cos(TILT), band = 6;
    for (let y = 0; y < H; y += band) { const a0 = y - CY, a1 = y + band - CY; const v0 = a0 * FOC / (FOC * cs + a0 * sn), v1 = a1 * FOC / (FOC * cs + a1 * sn); const k = FOC / (FOC - ((v0 + v1) / 2) * sn); const sy = CY + OY + v0; if (sy < 0 || sy + v1 - v0 > MH) continue; ctx.drawImage(rotC, 0, sy, MW, Math.max(1, v1 - v0), 540 - k * (540 + OX), y, MW * k, band + 0.6); }
    const hz = ctx.createLinearGradient(0, 0, 0, 500); hz.addColorStop(0, `rgba(200,225,240,${0.45 * TILT / 0.5})`); hz.addColorStop(1, 'rgba(200,225,240,0)'); ctx.fillStyle = hz; ctx.fillRect(0, 0, W, 500);
  }
  if (!window.CLEAN) drawPins(ctx, t);
  ctx.save(); ctx.globalAlpha = 0.07; ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = ctx.createPattern(GRAIN, 'repeat'); ctx.translate((t * 997) % 256, (t * 613) % 256); ctx.fillRect(-256, -256, W + 512, H + 512); ctx.restore();
  const vg = ctx.createRadialGradient(W / 2, H / 2, 700, W / 2, H / 2, 1250); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(0,0,0,${0.35 + 0.3 * tn.sep})`); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  // petit flash blanc quand la nappe « revient »
  const fl = Math.max(0, 1 - Math.abs(t - A.retour) / 0.12) * 0.35; if (fl > 0) { ctx.fillStyle = `rgba(255,255,255,${fl})`; ctx.fillRect(0, 0, W, H); }
  if (!window.CLEAN) { screenScene(ctx, t); drawSubs(ctx, t); }
};

const loadImg = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
window.init = async function () {
  canvas = document.getElementById('c'); ctx = canvas.getContext('2d');
  const [wd, tm] = await Promise.all(['world.json', 'timing.json'].map(u => fetch(u).then(r => r.json())));
  WORLD = wd; WORLD.byId = Object.fromEntries(WORLD.c50.map(c => [c.id, c])); WORDS = tm.words;
  LOWRES = await loadImg('../relief/relief_4096.jpg');
  await Promise.all([...Object.values(ISO), 'gb'].map(async k => { FL[k] = await loadImg('flags/' + k + '.svg'); }));
  const names = ['fan_a', 'fan_b', 'fisher_a', 'fisher_b', 'boat_top', 'fish', 'star', 'wave', 'bath', 'storm', 'flood', 'sun', 'drought', 'fire', 'kangaroo', 'thermo', 'bowl', 'tree', 'earth_scared', 'earth_hot', 'sci_a', 'sci_b', 'explorer', 'fan_ice'];
  await Promise.all(names.map(async n => { SPR[n] = await loadImg('spr/' + n + '.png'); }));
  makeGrain(); makeBlobs(); buildSubs(SCRIPT); setup();
  { const need = new Set(); for (let t = 0; t <= DUR; t += 0.1) { const c = cam(t); for (const [tx, ty] of tilesFor(c)) need.add(ty + '_' + tx); } await Promise.all([...need].map(async n => { TILES[n] = await loadImg('../relief/tiles/' + n + '.jpg'); })); window.NTILES = need.size; }
  window.CAM = { dur: DUR, camAt: t => cam(t), angAt, tiltAt };
  window.VISUALS = SUBS.map(x => x.t0); window.DUR = DUR; window.READY = true;
};
