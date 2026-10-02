// scene.js — Berlin-Ouest, l'île sans mer. window.render(t) déterministe.
const CY = 780, OX = 470, OY = 680, MW = 2020, MH = 3060, FOC = 1400;
let DATA, WORLD, FL = {}, PH = {}, TEX = {}, cam, DUR;
const mapC = document.createElement('canvas'); mapC.width = MW; mapC.height = MH; const m = mapC.getContext('2d');
const rotC = document.createElement('canvas'); rotC.width = MW; rotC.height = MH; const rc = rotC.getContext('2d');
const altC = document.createElement('canvas'); altC.width = MW; altC.height = MH; const ac = altC.getContext('2d');
let canvas, ctx;

// ---------- lieux ----------
const BER = [13.40, 52.515], WBC = [13.27, 52.48], TEMPEL = [13.401, 52.473], HELM = [11.06, 52.22];
const ROAD = [[10.55, 52.25], [11.06, 52.22], [11.62, 52.13], [11.85, 52.27], [12.55, 52.40], [13.0, 52.40], [13.20, 52.42]];
const RAIL = [[10.55, 52.47], [10.99, 52.43], [11.86, 52.60], [12.34, 52.60], [12.9, 52.55], [13.20, 52.535]];
const CANAL = [[10.45, 52.40], [10.78, 52.43], [11.40, 52.29], [11.66, 52.20], [12.16, 52.40], [12.55, 52.42], [12.95, 52.45], [13.18, 52.50]];
const CORR = [{ from: [9.99, 53.55], out: false }, { from: [9.05, 52.26], out: true }, { from: [8.68, 50.11], out: false }];
const ZLAB = { us: [10.9, 49.4, 'USA'], uk: [8.6, 52.7, 'ROYAUME-UNI'], fr: [7.3, 49.55, 'FRANCE'], su: [12.5, 51.9, 'URSS'] };
const SLAB = { us: [13.34, 52.43, 'USA'], uk: [13.19, 52.52, 'R.-U.'], fr: [13.29, 52.585, 'FRANCE'], su: [13.52, 52.50, 'URSS'] };
const EASTC = [[12.37, 51.34], [13.74, 51.05], [11.63, 52.13], [12.1, 54.09], [11.03, 50.98], [14.33, 51.76]];
const WALK_TO = [WBC, WBC, [10.85, 52.15], WBC, [10.2, 50.98], WBC];

// ---------- utilitaires géo ----------
let P = null; // projection de la carte (coordonnées du canevas carte)
const pathM = g => { const p = d3.geoPath(P, m); m.beginPath(); p(g); };
const pathMulti = gs => { const p = d3.geoPath(P, m); m.beginPath(); for (const g of gs) p(g); };
const kmPx = (km, lat = 52.5) => km / 6371 * cam_s / Math.cos(lat * Math.PI / 180);
let cam_s = 1, ANG = 0, TILT = 0;
function S(lon, lat) { // carte -> écran (rotation + bascule)
  const p = P([lon, lat]); let x = p[0] - OX - 540, y = p[1] - OY - CY;
  const c = Math.cos(ANG), s = Math.sin(ANG); let u = x * c - y * s, v = x * s + y * c;
  let k = 1; if (TILT > 0.001) { const sn = Math.sin(TILT), cs = Math.cos(TILT); k = FOC / (FOC - v * sn); u *= k; v = k * v * cs; }
  return { x: 540 + u, y: CY + v, k };
}
const lineFeat = pts => ({ type: 'LineString', coordinates: pts });
function polyPts(pts) { return pts.map(q => P(q)); }
function partial(c, pts, p) { // trace progressif d'une polyligne en px
  if (p <= 0 || pts.length < 2) return null; let L = 0; const seg = [];
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
  let rem = L * clamp(p); c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); let head = pts[0];
  for (let i = 1; i < pts.length; i++) { if (rem >= seg[i - 1]) { c.lineTo(pts[i][0], pts[i][1]); rem -= seg[i - 1]; head = pts[i]; } else { const f = rem / seg[i - 1]; head = [lerp(pts[i - 1][0], pts[i][0], f), lerp(pts[i - 1][1], pts[i][1], f)]; c.lineTo(head[0], head[1]); break; } }
  return head;
}
function alongPts(pts, u) { // point à la fraction u d'une polyligne lon/lat (en px carte), + direction
  const q = pts.map(p => P(p)); let L = 0; const seg = [];
  for (let i = 1; i < q.length; i++) { const d = Math.hypot(q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1]); seg.push(d); L += d; }
  let rem = L * clamp(u);
  for (let i = 1; i < q.length; i++) { if (rem <= seg[i - 1] || i === q.length - 1) { const f = clamp(rem / seg[i - 1]); return { lonlat: P.invert([lerp(q[i - 1][0], q[i][0], f), lerp(q[i - 1][1], q[i][1], f)]), dir: Math.atan2(q[i][1] - q[i - 1][1], q[i][0] - q[i - 1][0]) }; } rem -= seg[i - 1]; }
}

// ---------- styles de carte ----------
const STY = {
  sat: { sea0: '#1f7389', sea1: '#0b3a4e', border: 'rgba(255,255,255,.75)', coast: 'rgba(140,215,210,.30)', city: '#b4a993', lake: '#2a7d93', river: '#3d93ad' },
  ill: { sea0: '#a6d9e8', sea1: '#86c4d8', land: '#f3e6c3', border: '#8a6b4a', coast: '#5b4630', city: '#f6d98f', lake: '#8ccbe0', river: '#6fb6d3' },
  dark: { sea0: '#121b20', sea1: '#0a0f12', land: '#262626', border: '#5a5a5a', coast: '#3a3a3a', city: '#333333', lake: '#1a2a33', river: '#2a3f4a' }
};
function satLandFill(c) {
  const y = lat => P([cam.lon, lat])[1];
  const g = c.createLinearGradient(0, y(62), 0, y(43));
  [[62, '#6f7a55'], [57, '#5d7a3c'], [54, '#64853f'], [51.5, '#6e8c43'], [49, '#7a8e48'], [46, '#7f8a52'], [43, '#a39a64']].forEach(([lat, col]) => g.addColorStop(clamp((y(lat) - y(62)) / (y(43) - y(62) || 1)), col));
  return g;
}
function anchoredTex(c, img, base, alpha, comp) {
  const z = cam_s / base, L = Math.log2(z), f = L - Math.floor(L), k = Math.pow(2, f);
  const o = P([10, 51]); c.save(); c.globalCompositeOperation = comp || 'source-over';
  for (const [kk, a] of [[k, 1 - f], [k / 2, f]]) { if (a < 0.02) continue; const pat = c.createPattern(img, 'repeat'); pat.setTransform(new DOMMatrix().translate(o[0], o[1]).scale(kk)); c.globalAlpha = alpha * a; c.fillStyle = pat; c.fill(); }
  c.restore();
}
const MOUNT = [[[5.9, 45.0], [6.9, 45.9], [7.9, 46.4], [9.2, 46.5], [10.5, 46.8], [11.6, 47.0], [12.8, 47.1], [14.0, 47.3], [15.5, 47.5]], [[10.35, 51.78], [10.9, 51.72]], [[12.2, 50.4], [13.3, 50.62], [14.2, 50.85]], [[8.05, 47.7], [8.3, 48.65]], [[12.3, 49.3], [13.8, 48.8]], [[15.5, 50.75], [16.6, 50.3], [17.4, 50.2]], [[17.5, 49.4], [19.5, 49.3], [22.5, 49.0], [24.5, 48.0], [25.5, 46.5], [25.8, 45.6], [24, 45.4], [22.5, 45.0]], [[6.9, 48.2], [7.3, 48.9]]];

function drawMap(c, sty, t) {
  const st = STY[sty]; const path = d3.geoPath(P, c);
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0);
  const cx = 540 + OX, cy = CY + OY;
  const g = c.createRadialGradient(cx, cy, 100, cx, cy, 1700); g.addColorStop(0, st.sea0); g.addColorStop(1, st.sea1); c.fillStyle = g; c.fillRect(0, 0, MW, MH);
  if (sty === 'ill') { c.beginPath(); c.rect(0, 0, MW, MH); anchoredTex(c, TEX.waves, 3000, 0.5); }
  const hi = cam_s > 2200, countries = hi ? WORLD.c10m : WORLD.c50m;
  // plateau côtier
  c.beginPath(); path(WORLD.land50m); c.lineJoin = 'round';
  if (sty === 'sat') { for (const [w, a] of [[clamp(kmPx(30), 6, 60), .25], [clamp(kmPx(15), 4, 30), .35]]) { c.lineWidth = w; c.strokeStyle = st.coast.replace(/[\d.]+\)$/, a + ')'); c.stroke(); } }
  // terres
  c.beginPath(); for (const f of countries) path(f.g); if (!hi) path(WORLD.land50m);
  if (sty === 'sat') { c.fillStyle = satLandFill(c); c.fill(); anchoredTex(c, TEX.veg, 2600, 0.55); anchoredTex(c, TEX.fields, 40000, clamp((cam_s - 15000) / 30000) * 0.5); }
  else { c.fillStyle = st.land; c.fill(); if (sty === 'ill') anchoredTex(c, TEX.paper, 3000, 0.35); }
  // montagnes
  if (sty !== 'dark' && cam_s < 30000) for (const ml of MOUNT) {
    const pts = ml.map(q => P(q)); const base = clamp(kmPx(70), 8, 38);
    if (sty === 'sat') {
      for (const [f, a] of [[1.6, .10], [1.1, .14], [.7, .18], [.35, .22]]) { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.lineWidth = base * f; c.strokeStyle = `rgba(105,85,55,${a})`; c.lineCap = 'round'; c.stroke(); }
      c.lineWidth = 2; c.strokeStyle = 'rgba(235,225,200,.35)'; c.stroke();
    } else {
      for (let i = 0; i < pts.length - 1; i++) for (let s = 0; s < 1; s += 0.34) { const x = lerp(pts[i][0], pts[i + 1][0], s), y = lerp(pts[i][1], pts[i + 1][1], s); const h = clamp(base * 0.6, 8, 22); c.beginPath(); c.moveTo(x - h, y + h * 0.6); c.lineTo(x, y - h * 0.6); c.lineTo(x + h, y + h * 0.6); c.lineWidth = 3; c.strokeStyle = '#8a6b4a'; c.stroke(); }
    }
  }
  // arbres (carte illustrée)
  if (sty === 'ill' && cam_s > 2500 && cam_s < 14000) { const r = clamp(cam_s / 900, 4, 12); c.fillStyle = '#9db86f'; c.strokeStyle = '#5f7a3a'; c.lineWidth = 2; for (const tp of WORLD.trees) { const p = P(tp); if (p[0] < 0 || p[1] < 0 || p[0] > MW || p[1] > MH) continue; c.beginPath(); c.arc(p[0], p[1], r, 0, 7); c.fill(); c.stroke(); } }
  // lacs et fleuves
  c.beginPath(); for (const l of DATA.lakes) path(l); c.fillStyle = st.lake; c.fill();
  c.beginPath(); for (const r of DATA.rivers) path(r.g); c.lineWidth = clamp(cam_s / 2500, 1, 9); c.strokeStyle = st.river; c.lineCap = 'round'; c.stroke();
  // ville de Berlin
  if (cam_s > 7000) {
    const a = clamp((cam_s - 7000) / 9000); c.globalAlpha = a; c.beginPath(); for (const k of ['us', 'uk', 'fr', 'su']) path(DATA.sectors[k]);
    c.fillStyle = st.city; c.fill(); if (sty === 'sat') anchoredTex(c, TEX.city, 60000, 0.5); else if (sty === 'ill') anchoredTex(c, TEX.cityIll, 60000, 0.35); else anchoredTex(c, TEX.cityDark, 60000, 0.5);
    c.globalAlpha = 1;
    c.beginPath(); for (const l of DATA.lakes) path(l); c.fillStyle = st.lake; c.fill();
  }
  // frontières
  c.beginPath(); for (const f of countries) path(f.g);
  if (sty === 'ill') { c.setLineDash([10, 7]); c.lineWidth = 2.5; c.strokeStyle = st.border; c.stroke(); c.setLineDash([]); c.beginPath(); path(WORLD.land50m); c.lineWidth = 3.5; c.strokeStyle = st.coast; c.stroke(); }
  else { c.lineWidth = sty === 'sat' ? 1.6 : 1.4; c.strokeStyle = st.border; c.stroke(); }
  c.restore();
}

// ---------- transitions de style ----------
let STYLE_TR = [];
function styleLayers(t) { // renvoie [style, mode, param]
  let cur = 'sat';
  for (const tr of STYLE_TR) {
    if (t >= tr.t0 + tr.d) { cur = tr.to; continue; }
    if (t >= tr.t0) return { a: tr.from, b: tr.to, p: (t - tr.t0) / tr.d, kind: tr.kind };
    break;
  }
  return { a: cur };
}

// ---------- calques de scène posés sur la carte ----------
const flagB = g => d3.geoPath(P).bounds(g);
function zoneFlag(key, img, alpha, flash, geo) { const g = geo || DATA.zones[key]; flagFill(m, () => pathM(g), flagB(g), img, alpha, flash); }
function mapLabel(s, lon, lat, t, t0, size, o = {}) {
  if (t < t0 || (o.until && t > o.until + 0.3)) return; const p = P([lon, lat]);
  m.save(); m.globalAlpha = o.until ? fadeOut(t, o.until, 0.3) : 1;
  txt(m, typed(s, t, t0, o.d || 0.4), p[0], p[1], { size, color: o.color || '#fff', stroke: o.stroke || 'rgba(0,0,0,.85)', sw: size * 0.16, font: o.font, weight: o.weight });
  m.restore();
}
function strokeGeo(g, w, col, dash) { pathM(g); m.lineJoin = 'round'; m.lineCap = 'round'; m.lineWidth = w; m.strokeStyle = col; if (dash) m.setLineDash(dash); m.stroke(); m.setLineDash([]); }
function hatchFill(g, col, alpha) {
  m.save(); pathM(g); m.clip(); m.globalAlpha = alpha; m.fillStyle = col; m.fillRect(0, 0, MW, MH);
  m.globalAlpha = alpha * 0.6; m.strokeStyle = '#fff'; m.lineWidth = 6; m.beginPath(); for (let x = -MH; x < MW; x += 34) { m.moveTo(x, 0); m.lineTo(x + MH, MH); } m.stroke(); m.restore();
}
function wbOutlinePts() { return DATA.west.coordinates[0].map(q => P(q)); }

// ============ TIMELINE ============
let A = {}; // instants clés
function setup() {
  const a = A;
  // ---- beat 0 : accroche
  a.deux0 = T(0, 'deux'); a.ile1 = T(0, 'ile'); a.ile2 = T(0, 'ile', 2); a.sans = T(0, 'sans'); a.mer = T(0, 'mer');
  // ---- beat 1
  a.sur = T(1, 'sur'); a.bo = T(1, 'berlinouest'); a.allem = T(1, 'allemande'); a.sauf = T(1, 'sauf'); a.coinc = T(1, 'coincee'); a.comm = T(1, 'communiste'); a.pq = T(1, 'pourquoi');
  a.film = a.pq + 0.35;
  // ---- beat 2
  a.y45 = T(2, 'mille'); a.allemagne = T(2, 'lallemagne'); a.coupee = T(2, 'coupee'); a.zus = T(2, 'americaine'); a.zuk = T(2, 'britannique'); a.zfr = T(2, 'francaise'); a.zsu = T(2, 'sovietique');
  a.berlin2 = T(2, 'berlin'); a.entiere = T(2, 'entiere'); a.zone2 = T(2, 'sovietique', 2); a.coupe = T(2, 'coupe', 2); a.quatre = T(2, 'quatre', 2);
  // ---- beat 3
  a.b3 = beatStart(3); a.d48 = T(3, 'vingtquatre'); a.sov = T(3, 'sovietiques'); a.routes = T(3, 'routes'); a.rails = T(3, 'rails'); a.canaux = T(3, 'canaux');
  a.km160 = T(3, 'cent', 2); a.rien = T(3, 'rien');
  // ---- beat 4
  a.ciel = T(4, 'ciel'); a.pendant = T(4, 'pendant'); a.avion = T(4, 'avion'); a.atter = T(4, 'atterrit'); a.trois = T(4, 'trois'); a.pres = T(4, 'pres'); a.vols = TE(4, 'vols');
  a.deux4 = T(4, 'deux', 2); a.tonnes = T(4, 'tonnes'); a.tonnesE = TE(4, 'tonnes'); a.certains = T(4, 'certains'); a.bonbons = T(4, 'bonbons'); a.parach = T(4, 'parachutes'); a.mai = T(4, 'mai', 2); a.moscou = T(4, 'moscou'); a.b4e = beatEnd(4);
  // ---- beat 5
  a.b5 = beatStart(5); a.porte = T(5, 'porte'); a.entre = T(5, 'entre'); a.deux5 = T(5, 'deux'); a.allem5 = T(5, 'allemands'); a.fuient = T(5, 'fuient'); a.rien5 = T(5, 'rien');
  a.n199 = T(5, 'quatrevingtdixneuf', 1, -1); a.n199e = TE(5, 'quatrevingtdixneuf', 1, 1); a.beaucoup = T(5, 'beaucoup'); a.ber5 = T(5, 'berlin'); a.metro = T(5, 'metro');
  // ---- beat 6
  a.b6 = beatStart(6); a.nuit = T(6, 'nuit'); a.treize = T(6, 'treize'); a.rda = T(6, 'rda'); a.barb = T(6, 'barbeles'); a.beton = T(6, 'beton'); a.n155 = T(6, 'cinquantecinq', 1, -1); a.km155 = TE(6, 'kilometres');
  a.moins = T(6, 'moins'); a.b6e = beatEnd(6);
  // ---- beat 7
  a.b7 = beatStart(7); a.tombe = T(7, 'tombe'); a.trois7 = T(7, 'trois'); a.allem7 = T(7, 'lallemagne'); a.reunif = T(7, 'reunifie'); a.lile = T(7, 'lile'); a.disp = T(7, 'disparait'); a.fin = TE(7, 'carte');
  DUR = a.fin + 0.55;

  // ---- caméra
  const st = (t, d, lon, lat, s, o = {}) => ({ t, d, lon, lat, s, ...o });
  cam = makeCam([
    st(0, 0, 13.40, 52.45, 2600, { drift: 0 }),
    st(a.ile1 - 0.1, a.ile1 - 0.1, WBC[0], WBC[1], 85000),
    st(a.mer - 0.05, 1.0, WBC[0] + 0.02, WBC[1], 60000),
    st(a.bo - 0.1, 0.9, WBC[0], WBC[1] + 0.01, 90000, { drift: -0.03 }),
    st(a.sauf - 0.1, 1.3, 13.30, 52.45, 20000),
    st(a.pq - 0.1, 0.9, 13.32, 52.47, 30000, { drift: -0.04 }),
    st(a.allemagne - 0.05, 1.6, 10.4, 51.2, 5000),
    st(a.zuk - 0.1, 1.0, 10.0, 51.5, 7300, { drift: -0.03 }),
    st(a.zsu - 0.1, 0.9, 11.2, 51.35, 5000),
    st(a.entiere - 0.05, 1.7, BER[0], 52.50, 70000),
    st(a.coupe - 0.1, 0.8, 13.37, 52.50, 92000, { drift: -0.03 }),
    st(a.d48 - 0.1, 0.9, 13.33, 52.48, 58000),
    st(a.sov - 0.1, 1.4, 12.2, 52.36, 17000),
    st(a.canaux - 0.1, 1.0, 11.9, 52.38, 21000, { drift: -0.03 }),
    st(a.km160 - 0.15, 1.0, 12.25, 52.35, 15500),
    st(a.rien - 0.15, 1.2, WBC[0], WBC[1], 62000),
    st(a.ciel - 0.1, 1.4, 11.3, 51.95, 5200),
    st(a.atter - 0.05, 1.55, TEMPEL[0], TEMPEL[1], 700000),
    st(a.pres - 0.1, 0.9, TEMPEL[0] - 0.01, TEMPEL[1], 150000, { drift: -0.03 }),
    st(a.tonnes - 0.15, 1.0, WBC[0], WBC[1], 78000),
    st(a.certains - 0.1, 0.9, WBC[0], WBC[1], 55000),
    st(a.bonbons - 0.15, 0.9, 13.30, 52.47, 118000, { drift: -0.03 }),
    st(a.mai - 0.1, 1.5, 12.2, 52.36, 17000),
    st(a.moscou - 0.1, 1.0, 12.5, 52.38, 26000, { drift: -0.02 }),
    st(a.porte - 0.1, 1.4, 11.6, 51.75, 5200),
    st(a.entre - 0.1, 1.0, 12.6, 52.15, 7800, { drift: -0.02 }),
    st(a.deux5 - 0.1, 1.0, 11.9, 51.9, 5300),
    st(a.rien5 - 0.1, 0.9, 12.7, 52.25, 7600, { drift: -0.02 }),
    st(a.n199 - 0.1, 1.0, 12.3, 52.05, 5200),
    st(a.metro - 0.05, 2.0, 13.375, 52.514, 180000, { drift: -0.03 }),
    st(a.nuit - 0.1, 1.2, WBC[0], WBC[1], 75000),
    st(a.rda - 0.1, 1.0, 13.33, 52.47, 50000),
    st(a.barb - 0.1, 0.9, 13.385, 52.522, 125000, { drift: -0.03 }),
    st(a.n155 - 0.1, 1.2, WBC[0], WBC[1], 62000),
    st(a.km155 - 0.05, 0.9, WBC[0] + 0.02, WBC[1], 86000, { drift: -0.02 }),
    st(a.moins - 0.1, 1.0, WBC[0], WBC[1], 58000),
    st(a.b7 + 0.9, 1.0, WBC[0], WBC[1], 56000),
    st(a.tombe - 0.1, 1.0, 13.377, 52.516, 160000, { drift: -0.03 }),
    st(a.allem7 - 0.05, 1.8, 10.6, 51.3, 5000),
    st(a.reunif - 0.05, 0.9, 10.6, 51.2, 7000, { drift: -0.02 }),
    st(a.fin + 0.5, a.fin + 0.5 - a.lile + 0.3, 13.40, 52.45, 2600, { drift: 0.02 }),
  ]);
  // ---- bascule 3D [t0, t1, degrés]
  A.tilt = [[a.allemagne - 0.6, a.zsu + 0.6, 28], [a.ciel - 0.5, a.avion - 0.6, 26], [a.porte - 0.4, a.beaucoup - 0.2, 24], [a.trois7 - 0.2, a.lile, 30], [a.sauf - 0.3, a.pq - 0.1, 20]];
  // ---- styles
  STYLE_TR = [{ t0: a.film + 0.35, d: 0.55, from: 'sat', to: 'ill', kind: 'fade' }, { t0: a.b5 - 0.05, d: 0.25, from: 'ill', to: 'dark', kind: 'sweep' }, { t0: a.b7 - 0.05, d: 0.25, from: 'dark', to: 'sat', kind: 'sweep' }];
  // ---- dates
  DATES = [[a.y45, '1945'], [a.d48, '24 JUIN 1948'], [a.pendant, '1948 – 1949'], [a.mai, '12 MAI 1949', undefined, a.b4e + 0.2], [a.entre, '1949 – 1961'], [a.treize, '13 AOÛT 1961', '#14213d', a.moins - 0.1], [a.b7, '9 NOVEMBRE 1989'], [a.trois7, '3 OCTOBRE 1990', undefined, a.reunif + 0.8]];

  // ---- sons et actions
  ev(0.0, 'whoosh'); ev(0.05, 'ping'); ev(0.2, 'type'); ev(0.95, 'pop'); ev(a.deux0, 'stamp'); ev(a.ile1 - 0.3, 'whoosh'); ev(a.ile1, 'wave'); ev(a.ile1 + 0.05, 'pop'); ev(a.sans, 'water'); ev(a.mer, 'ding'); ev(a.mer - 0.1, 'whoosh');
  act(a.ile1, 'mer', 'entoure l\'île'); act(a.sans, 'mer', 's\'évapore');
  ev(a.sur, 'type'); ev(a.allem, 'scan'); ev(a.sauf - 0.2, 'whoosh'); ev(a.comm, 'scan'); ev(a.coinc, 'squeeze'); ev(a.coinc + 0.1, 'pop'); ev(a.pq - 0.1, 'whoosh'); ev(a.film, 'film'); ev(a.film + 0.7, 'shine'); ev(a.film + 1.2, 'whoosh');
  act(a.coinc, 'territoire', 'se resserre');
  ev(a.y45, 'pop'); ev(a.allemagne - 0.4, 'whoosh'); ev(a.allemagne - 0.3, 'draw'); ev(a.allemagne, 'type'); ev(a.coupee, 'draw'); ev(a.coupee + 0.7, 'pop');
  [a.zus, a.zuk, a.zfr, a.zsu].forEach((x, i) => { ev(x, 'fall'); ev(x + 0.3, 'thud'); ev(x + 0.05, 'scan'); act(x, ['soldat US', 'soldat UK', 'soldat FR', 'soldat URSS'][i], 'plante son drapeau'); });
  ev(a.zuk - 0.2, 'whoosh'); ev(a.zsu - 0.15, 'whoosh');
  ev(a.berlin2 - 0.45, 'ping'); ev(a.entiere - 1.7, 'whoosh'); ev(a.entiere, 'thud'); ev(a.zone2, 'scan'); ev(a.coupe - 0.1, 'whoosh'); ev(a.coupe, 'scissors'); act(a.coupe, 'ciseaux', 'coupent Berlin');
  for (let i = 0; i < 4; i++) ev(a.coupe + 0.55 + i * 0.28, 'tic');
  ev(a.d48, 'stamp'); ev(a.d48 - 0.4, 'whoosh'); ev(a.d48 + 0.8, 'scan'); ev(a.sov - 0.3, 'whoosh'); ev(a.sov + 0.2, 'draw'); ev(a.routes, 'draw'); ev(a.routes + 0.35, 'barrier'); ev(a.routes + 0.45, 'stamp'); act(a.routes, 'camion', 'bloqué à la barrière');
  ev(a.rails, 'train'); ev(a.rails + 0.45, 'stamp'); act(a.rails, 'train', 's\'arrête'); act(a.km160, 'ligne', 'mesure la distance'); ev(a.canaux, 'water'); ev(a.canaux + 0.45, 'stamp'); act(a.canaux, 'péniche', 'fait demi-tour'); ev(a.canaux - 0.1, 'whoosh');
  ev(a.km160 - 0.1, 'whoosh'); ev(a.km160, 'draw'); ev(a.km160 + 0.4, 'ding'); ev(a.rien - 0.2, 'whoosh'); ev(a.rien, 'alarm'); act(a.rien, 'Berlin-Ouest', 'encerclée');
  ev(a.ciel - 0.4, 'whoosh'); ev(a.ciel, 'engine'); act(a.ciel, 'avions', 'volent dans les couloirs'); ev(a.pendant, 'pop');
  ev(a.atter - 2.05, 'ping'); ev(a.atter - 1.6, 'whoosh'); ev(a.atter - 0.3, 'engine'); ev(a.atter + 0.2, 'thud'); act(a.atter, 'avion', 'atterrit à Tempelhof'); ev(a.trois, 'ding'); ev(a.atter + 0.8, 'type'); ev(a.atter + 1.45, 'engine'); ev(a.reunif - 0.3, 'whoosh'); ev(a.km160 + 1.1, 'tic'); for (let n = 1; n < 6; n++) { const tl = a.atter - 0.9 + n * 1.7 + 1.1; if (tl < a.tonnes) ev(tl, 'engine'); }
  ev(a.pres - 0.1, 'whoosh'); ev(a.pres, 'photo'); ev(a.pres + 0.1, 'count'); ev(a.deux4, 'count'); for (let x = a.pres + 0.45; x < a.vols; x += 0.4) ev(x, 'tic'); for (let x = a.deux4 + 0.4; x < a.tonnesE; x += 0.4) ev(x, 'tic'); ev(a.certains - 0.3, 'whoosh'); ev(a.tonnes - 0.2, 'whoosh');
  for (let i = 0; i < 8; i++) { ev(a.tonnes + i * 0.18, 'fall'); ev(a.tonnes + i * 0.18 + 0.35, 'thud'); } act(a.tonnes, 'caisses et charbon', 'tombent sur la ville');
  ev(a.bonbons - 0.1, 'whoosh'); ev(a.bonbons, 'sparkle'); act(a.bonbons, 'parachutes', 'descendent'); ev(a.parach, 'pop');
  ev(a.mai - 0.3, 'whoosh'); ev(a.mai, 'stamp'); ev(a.moscou, 'barrier'); ev(a.moscou + 0.1, 'applause'); ev(a.moscou + 0.6, 'engine'); ev(a.moscou + 1.2, 'train'); act(a.moscou, 'camion', 'repart vers Berlin');
  ev(a.b5 - 0.05, 'sweep'); ev(a.porte - 0.3, 'whoosh'); ev(a.porte, 'shine'); ev(a.entre, 'pop'); ev(a.deux5, 'count'); ev(a.entre - 0.3, 'whoosh'); ev(a.entre + 1.0, 'draw'); ev(a.entre + 1.8, 'type'); ev(a.entre + 2.3, 'type'); ev(a.moscou - 0.3, 'whoosh'); for (let x = a.deux5 + 0.4; x < a.allem5; x += 0.4) ev(x, 'tic'); ev(a.deux5 - 0.4, 'whoosh'); ev(a.fuient, 'steps'); act(a.fuient - 0.4, 'marcheurs', 'fuient vers l\'Ouest');
  ev(a.allem5, 'tic'); for (let x = a.fuient + 1.2; x < a.beaucoup; x += 1.1) ev(x, 'steps'); ev(a.n199 - 0.3, 'whoosh'); for (let x = a.n199 + 0.4; x < a.n199e; x += 0.4) ev(x, 'tic'); ev(a.metro - 0.4, 'type'); ev(a.metro - 0.2, 'type'); ev(a.rien5 - 0.2, 'whoosh'); ev(a.n199, 'count'); ev(a.ber5 - 0.45, 'ping'); ev(a.metro - 2.0, 'whoosh'); ev(a.metro - 0.2, 'train'); act(a.metro - 0.3, 'métro', 'passe à l\'Ouest');
  ev(a.nuit - 0.2, 'whoosh'); ev(a.nuit + 0.1, 'swell'); ev(a.treize + 1.2, 'type'); ev(a.rda + 1.0, 'alarm'); ev(a.rda + 1.9, 'tic'); act(a.rda + 1.0, 'Berlin-Ouest', 'est fermée'); ev(a.treize, 'stamp'); ev(a.rda, 'scan'); ev(a.barb - 0.2, 'whoosh'); ev(a.barb, 'wire'); act(a.barb, 'ouvrier', 'déroule les barbelés');
  ev(a.beton, 'concrete'); act(a.beton, 'mur', 'se construit'); for (let i = 0; i < 6; i++) ev(a.beton + 0.3 + i * 0.22, 'pop'); ev(a.beton + 0.1, 'photo');
  ev(a.n155 - 0.2, 'whoosh'); ev(a.n155, 'draw'); ev(a.n155 + 0.05, 'count'); for (let x = a.n155 + 0.5; x < a.moins - 0.3; x += 0.6) ev(x, 'tic'); ev(a.km155, 'ding'); act(a.n155, 'tracé jaune', 'fait le tour du mur'); ev(a.moins - 0.15, 'whoosh'); ev(a.moins, 'impact'); for (let x = a.moins + 0.9; x < a.b6e + 0.1; x += 0.8) ev(x, 'heartbeat');
  ev(a.b7 - 0.05, 'sweep'); ev(a.b7 + 0.1, 'photo'); ev(a.b7 + 0.45, 'type'); ev(a.b7 - 0.1 + 0.9 - 0.3, 'whoosh'); ev(a.b7 + 1.6, 'cheer'); ev(a.b7 + 2.4, 'tic'); ev(a.tombe - 0.2, 'whoosh'); ev(a.tombe, 'crumble'); ev(a.tombe + 0.15, 'applause'); act(a.tombe, 'fêtards', 'cassent le mur');
  ev(a.allem7 - 1.8, 'whoosh'); ev(a.trois7 + 0.9, 'scan'); ev(a.trois7 + 1.3, 'scan'); ev(a.trois7 + 1.0, 'type'); ev(a.trois7 + 1.4, 'type'); ev(a.reunif, 'scan'); ev(a.reunif + 0.05, 'ding'); act(a.reunif, 'Allemagne', 'se réunifie'); ev(a.lile, 'shine'); ev(a.disp, 'whoosh');
  window.PREVIEW = [0.6, a.ile1 + 0.5, a.coinc + 0.4, a.film + 0.6, a.zsu + 0.8, a.quatre + 0.6, a.routes + 0.9, a.km160 + 0.9, a.ciel + 1.6, a.atter + 0.6, a.pres + 1.2, a.bonbons + 1.4, a.fuient + 1.2, a.metro + 0.5, a.beton + 1.0, a.n155 + 1.3, a.moins + 0.8, a.tombe + 0.8, a.reunif + 0.6, a.fin + 0.3];
}

function tiltAt(t) { let v = 0; for (const [t0, t1, deg] of A.tilt) { if (t < t0 || t > t1 + 1) continue; v = Math.max(v, deg * Math.min(ease((t - t0) / 1), 1 - ease((t - t1) / 1))); } return v * Math.PI / 180; }
function angAt(t) { const tr = (t > A.moins && t < A.b6e) ? 0.4 : 1; return tr * (11 * Math.sin(2 * Math.PI * t / 11 + 0.6) + 5 * Math.sin(2 * Math.PI * t / 6.5)) * Math.PI / 180; }

// ============ CALQUE CARTE (tourne avec la carte) ============
function mapScene(t) {
  const a = A, W_ = DATA.west;
  // --- Berlin-Ouest mis en avant (accroche)
  if (t < a.film + 0.8) {
    const al = clamp(t / 0.6);
    hatchFill(W_, '#D88244', 0.75 * al);
    strokeGeo(W_, 5, '#fff'); m.save(); m.shadowColor = '#ffb36b'; m.shadowBlur = 25 + 10 * Math.sin(t * 6); strokeGeo(W_, 3, '#ffd9a8'); m.restore();
    // mer factice autour de l'île
    if (t > a.ile1 - 0.05 && t < a.sans + 1.2) {
      const grow = easeOut(prog(t, a.ile1 - 0.05, 0.4)), dry = prog(t, a.sans, 1.0);
      const wpx = kmPx(3.2) * grow * (1 - 0.7 * dry);
      m.save(); m.globalAlpha = 1 - dry; strokeGeo(W_, wpx * 2, 'rgba(34,140,190,.9)'); strokeGeo(W_, wpx * 1.2, 'rgba(70,175,220,.9)');
      m.lineDashOffset = -t * 60; strokeGeo(W_, 3, 'rgba(255,255,255,.9)', [18, 26]); m.restore();
      if (dry > 0) { m.save(); m.globalAlpha = Math.sin(dry * Math.PI) * 0.6; strokeGeo(W_, wpx * 2.4, 'rgba(255,255,255,.5)'); m.restore(); }
    }
    if (t > a.allem) { const p = prog(t, a.allem, 0.3); flagFill(m, () => pathM(W_), flagB(W_), FL.de, 0.85 * p, 1 - p, 'stretch'); }
    mapLabel('BERLIN-OUEST', WBC[0], WBC[1] + 0.005, t, a.bo, clamp(cam_s / 1500, 34, 70));
    // territoire communiste autour
    if (t > a.comm - 0.1) {
      const p = prog(t, a.comm - 0.1, 0.4);
      m.save(); pathMulti([DATA.zones.su, W_]); m.clip('evenodd'); m.globalAlpha = 0.45 * p; m.fillStyle = '#b3121b'; m.fillRect(0, 0, MW, MH); m.restore();
      if (t > a.coinc) { const q = (t - a.coinc) % 0.9 / 0.9; m.save(); m.globalAlpha = (1 - q) * fadeOut(t, a.film + 0.5); strokeGeo(W_, 6 + 60 * (1 - q), 'rgba(220,30,40,.55)'); m.restore(); }
    }
  }
  // --- 1945 : zones
  if (t > a.y45 && t < a.entiere + 1.5) {
    const out = fadeOut(t, a.entiere + 0.5, 1);
    if (t > a.allemagne - 0.3) { const g = WORLD.c10m.find(c => c.id === '276').g; m.save(); m.globalAlpha = out; strokeGeo(g, 5, '#5b4630'); m.restore(); mapLabel('ALLEMAGNE', 10.4, 51.0, t, a.allemagne, 64, { until: a.zus - 0.2, color: '#5b4630', stroke: '#fff8e8' }); }
    const zt = { us: a.zus, uk: a.zuk, fr: a.zfr, su: a.zsu }, img = { us: FL.us, uk: FL.gb, fr: FL.fr, su: FL.su };
    for (const k of ['uk', 'us', 'fr', 'su']) if (t > zt[k]) { const p = prog(t, zt[k], 0.3); zoneFlag(k, img[k], 0.8 * out, (1 - p) * out); }
    if (t > a.coupee) { m.save(); m.globalAlpha = out; for (const k of ['uk', 'us', 'fr', 'su']) { const p = prog(t, a.coupee, 0.8); pathM(DATA.zones[k]); m.setLineDash([9000 * p, 1e6]); m.lineWidth = 6; m.strokeStyle = '#fff'; m.stroke(); m.setLineDash([]); } m.restore(); }
    for (const k of ['us', 'uk', 'fr', 'su']) if (t > zt[k] + 0.15) mapLabel(ZLAB[k][2], ZLAB[k][0], ZLAB[k][1] - 0.55, t, zt[k] + 0.15, 46, { until: a.berlin2 - 0.2 });
  }
  // --- Berlin dans la zone soviétique puis secteurs
  if (t > a.berlin2 && t < a.sov + 1.2) {
    const out = fadeOut(t, a.sov + 0.6, 0.6);
    const city = { type: 'GeometryCollection', geometries: ['us', 'uk', 'fr', 'su'].map(k => DATA.sectors[k]) };
    if (t < a.coupe + 1) { flagFill(m, () => pathM(city), flagB(city), FL.su, 0.7 * (1 - prog(t, a.coupe + 0.5, 0.4)), 1 - prog(t, a.zone2, 0.3)); }
    if (t > a.coupe) {
      const p = prog(t, a.coupe, 0.55);
      ['us', 'uk', 'fr'].forEach(k => { pathM(DATA.sectors[k]); m.setLineDash([7000 * p, 1e6]); m.lineWidth = 7; m.strokeStyle = '#FFE928'; m.stroke(); m.setLineDash([]); });
      const keys = ['us', 'uk', 'fr', 'su'], img = { us: FL.us, uk: FL.gb, fr: FL.fr, su: FL.su };
      keys.forEach((k, i) => { const t0 = a.coupe + 0.55 + i * 0.28; if (t > t0) { const q = prog(t, t0, 0.3); flagFill(m, () => pathM(DATA.sectors[k]), flagB(DATA.sectors[k]), img[k], 0.82 * out, (1 - q) * out); m.save(); m.globalAlpha = out; strokeGeo(DATA.sectors[k], 3, '#fff'); m.restore(); mapLabel(SLAB[k][2], SLAB[k][0], SLAB[k][1], t, t0 + 0.1, 40, { until: a.sov + 0.4 }); } });
    }
  }
  // --- blocus : routes, rails, canaux
  const blockEnd = a.mai + 3.5;
  if (t > a.d48 && t < blockEnd) {
    const al = Math.min(prog(t, a.d48, 0.5), fadeOut(t, blockEnd - 0.5, 0.5));
    const open = t > a.moscou;
    m.save(); m.globalAlpha = al;
    // zone soviétique autour qui devient rouge
    { const rp = prog(t, a.d48 + 0.8, 0.5) * (open ? 1 - prog(t, a.moscou, 0.6) : 1); if (rp > 0) { m.save(); pathMulti([DATA.zones.su, W_]); m.clip('evenodd'); m.globalAlpha = 0.32 * rp; m.fillStyle = '#c0101c'; m.fillRect(0, 0, MW, MH); m.restore(); } }
    // Berlin-Ouest
    hatchFill(W_, '#D88244', 0.6 * (1 - clamp((cam_s - 90000) / 80000))); strokeGeo(W_, 4, '#fff');
    // frontière de zone
    strokeGeo(DATA.igb, 5, 'rgba(160,20,30,.9)', [16, 10]);
    const lines = [[ROAD, a.routes, '#f4f1e6', 9, null], [RAIL, a.rails, '#2b2b2b', 8, [14, 10]], [CANAL, a.canaux, '#2f8fd0', 9, null]];
    for (const [pts, t0, col, w, dash] of lines) if (t > t0 - 0.05) {
      const pp = polyPts(pts); m.lineCap = 'round'; m.lineJoin = 'round';
      partial(m, pp, prog(t, t0 - 0.05, 0.45)); m.lineWidth = w + 6; m.strokeStyle = 'rgba(0,0,0,.45)'; m.stroke();
      partial(m, pp, prog(t, t0 - 0.05, 0.45)); m.lineWidth = w; m.strokeStyle = open ? '#47d16a' : col; if (dash) { m.setLineDash(dash); m.strokeStyle = '#f4f1e6'; m.lineWidth = w; m.stroke(); m.lineWidth = w - 3; m.strokeStyle = col; m.setLineDash(dash); m.lineDashOffset = 12; } m.stroke(); m.setLineDash([]); m.lineDashOffset = 0;
    }
    m.restore();
  }
  // --- pont aérien : couloirs
  if (t > a.ciel - 1.0 && t < a.atter) {
    const al = fadeOut(t, a.atter - 0.9, 0.6);
    CORR.forEach((cr, i) => {
      const p = prog(t, a.ciel - 1.0 + i * 0.2, 0.6); const g = lineFeat([cr.from, [13.30, 52.48]]);
      m.save(); m.globalAlpha = al; const pts = [P(cr.from), P([13.30, 52.48])];
      partial(m, pts, p); m.lineWidth = kmPx(32); m.lineCap = 'round'; m.strokeStyle = 'rgba(255,255,255,.28)'; m.stroke();
      partial(m, pts, p); m.lineWidth = 3; m.setLineDash([16, 12]); m.lineDashOffset = (cr.out ? 1 : -1) * t * 40; m.strokeStyle = '#fff'; m.stroke(); m.setLineDash([]);
      m.restore();
    });
    mapLabel('BERLIN', 13.35, 52.62, t, a.ciel + 0.3, 44, { until: a.atter - 0.9 });
  }
  // --- Tempelhof
  if (t > a.atter - 1.6 && t < a.tonnes) {
    const c = P(TEMPEL); const sx = kmPx(1.1), sy = kmPx(0.75);
    m.save(); m.translate(c[0], c[1]); m.rotate(-0.08);
    m.beginPath(); m.ellipse(0, 0, sx, sy, 0, 0, 7); m.fillStyle = '#6f9150'; m.fill(); m.lineWidth = 4; m.strokeStyle = 'rgba(255,255,255,.5)'; m.stroke();
    for (const dy of [-0.18, 0.18]) { m.fillStyle = '#4a4a4a'; m.fillRect(-sx * 0.85, dy * sy - kmPx(0.03), sx * 1.7, kmPx(0.06)); m.setLineDash([kmPx(0.05), kmPx(0.04)]); m.beginPath(); m.moveTo(-sx * 0.8, dy * sy); m.lineTo(sx * 0.8, dy * sy); m.lineWidth = Math.max(2, kmPx(0.006)); m.strokeStyle = '#fff'; m.stroke(); m.setLineDash([]); }
    m.restore();
    mapLabel('TEMPELHOF', TEMPEL[0], TEMPEL[1] + 0.009, t, a.atter + 0.8, 52, { until: a.tonnes - 0.4 });
  }
  // --- Berlin-Ouest pendant le pont aérien / bonbons
  if (t > a.tonnes - 0.6 && t < a.mai) { hatchFill(W_, '#D88244', 0.45); strokeGeo(W_, 4, '#fff'); }
  // --- fuite (carte sombre)
  if (t > a.b5 && t < a.b6 + 0.5) {
    m.save(); pathMulti([DATA.zones.su, W_]); m.clip('evenodd'); m.fillStyle = 'rgba(150,20,30,.35)'; m.fillRect(0, 0, MW, MH); m.restore();
    { const ip = prog(t, a.entre + 1.0, 1.0); if (ip > 0) { m.save(); pathM(DATA.igb); m.setLineDash([14, 8]); m.lineWidth = 4 + 6 * (1 - ip); m.strokeStyle = 'rgba(230,60,60,.95)'; m.globalAlpha = ip; m.shadowColor = '#ff4040'; m.shadowBlur = 20 * (1 - ip); m.stroke(); m.restore(); } }
    const g = 0.6 + 0.4 * Math.sin(t * 5);
    if (t > a.porte) { const pa = prog(t, a.porte, 0.4) * (1 - 0.75 * prog(t, a.fuient + 0.3, 0.8)); m.save(); m.shadowColor = '#fff3b0'; m.shadowBlur = 50 * g * pa; pathM(W_); m.fillStyle = `rgba(255,240,170,${0.55 * pa})`; m.fill(); strokeGeo(W_, 5, '#fff'); m.restore(); }
    mapLabel('RDA', 12.9, 51.5, t, a.entre + 1.8, 70, { color: '#ff8a8a' }); mapLabel('RFA', 9.2, 50.9, t, a.entre + 2.3, 70, { color: '#ddd' });
    // flèches de fuite
    if (t > a.fuient - 0.6 && t < a.metro - 1.0) {
      EASTC.forEach((c0, i) => { const pts = [P(c0), P(WALK_TO[i])]; const p = prog(t, a.fuient - 0.6 + i * 0.12, 0.8); m.save(); m.globalAlpha = fadeOut(t, a.metro - 1.6, 0.5); partial(m, pts, p); m.setLineDash([18, 14]); m.lineDashOffset = -t * 50; m.lineWidth = 6; m.strokeStyle = '#fff'; m.stroke(); m.restore(); });
    }
    // métro
    if (t > a.metro - 1.2) {
      const SE = DATA.sectors.su; m.save(); strokeGeo(W_, 6, '#ffd84a'); m.restore();
      const line = polyPts([[13.43, 52.522], [13.388, 52.5205], [13.36, 52.512], [13.32, 52.506]]); m.lineCap = 'round'; partial(m, line, 1); m.lineWidth = kmPx(0.08); m.strokeStyle = 'rgba(255,220,70,.8)'; m.stroke();
      mapLabel('BERLIN-EST', 13.445, 52.538, t, a.metro - 0.4, 50, { color: '#ff9a9a' }); mapLabel('BERLIN-OUEST', 13.335, 52.492, t, a.metro - 0.2, 50, { color: '#fff3b0' });
    }
  }
  // --- le mur
  if (t > a.b6 - 0.3 && t < a.allem7 + 1) {
    const pts = wbOutlinePts();
    if (t > a.rda) { m.save(); pathMulti([DATA.zones.su, W_]); m.clip('evenodd'); m.globalAlpha = 0.38 * prog(t, a.rda, 0.4) * fadeOut(t, a.b7 + 0.3, 0.5); m.fillStyle = '#c0101c'; m.fillRect(0, 0, MW, MH); m.globalAlpha = 0.5 * (1 - prog(t, a.rda, 0.3)) * (t < a.rda + 0.3 ? 1 : 0); m.fillStyle = '#fff'; m.fillRect(0, 0, MW, MH); m.restore(); }
    mapLabel('RDA', 13.58, 52.43, t, a.rda, 72, { color: '#ff8a8a', until: a.b7 });
    mapLabel('BERLIN-OUEST', WBC[0], WBC[1], t, a.treize + 1.2, 54, { until: a.barb - 0.2 });
    if (t > a.rda + 1.0 && t < a.rda + 2.4) { const q = prog(t, a.rda + 1.0, 1.4); m.save(); m.globalAlpha = Math.sin(q * Math.PI * 3) ** 2; m.shadowColor = '#ff2020'; m.shadowBlur = 40; strokeGeo(W_, 12, '#ff3030'); m.restore(); }
    // barbelés
    if (t > a.barb && t < a.tombe + 1) { const h = partial(m, pts, prog(t, a.barb, 1.4)); m.lineWidth = 10; m.strokeStyle = '#555'; m.setLineDash([4, 5]); m.stroke(); m.setLineDash([]); }
    // béton
    const fall = prog(t, a.tombe, 1.4);
    if (t > a.beton) {
      const p = prog(t, a.beton, 1.1);
      if (fall <= 0) { partial(m, pts, p); m.lineWidth = 16; m.strokeStyle = '#2a2a2a'; m.stroke(); partial(m, pts, p); m.lineWidth = 10; m.strokeStyle = '#d8d8d8'; m.stroke(); }
      else { // le mur se brise
        m.lineCap = 'butt'; const n = pts.length, step = 6;
        for (let i = 0; i < n - step; i += step) { const keep = ((i * 7919) % 100) / 100 > fall; if (!keep) continue; m.beginPath(); m.moveTo(pts[i][0], pts[i][1]); for (let j = 1; j <= step; j++) m.lineTo(pts[i + j][0], pts[i + j][1]); m.lineWidth = 10; m.strokeStyle = `rgba(216,216,216,${1 - fall * 0.6})`; m.stroke(); }
        m.lineCap = 'round';
      }
    }
    // tracé du périmètre (155 km)
    if (t > a.n155 && t < a.moins + 0.5) { m.save(); m.globalAlpha = fadeOut(t, a.moins, 0.4); const h = partial(m, pts, prog(t, a.n155, a.km155 - a.n155 + 0.2)); m.lineWidth = 9; m.strokeStyle = '#FFE928'; m.shadowColor = '#FFE928'; m.shadowBlur = 20; m.stroke(); if (h) { m.beginPath(); m.arc(h[0], h[1], 16, 0, 7); m.fillStyle = '#fffbd0'; m.fill(); } m.restore(); }
  }
  // --- fin : réunification
  if (t > a.trois7 + 0.5) {
    const de = WORLD.c10m.find(c => c.id === '276').g;
    if (t > a.trois7 + 0.9 && t < a.reunif + 0.4) { const p = prog(t, a.trois7 + 0.9, 0.3), o = 1 - prog(t, a.reunif, 0.3); for (const k of ['uk', 'us', 'fr']) flagFill(m, () => pathM(DATA.zones[k]), flagB(de), FL.de, 0.7 * p * o, 0, 'stretch'); flagFill(m, () => pathM(DATA.zones.su), flagB(DATA.zones.su), FL.gdr, 0.7 * prog(t, a.trois7 + 1.3, 0.3) * o, 0); mapLabel('RFA', 9.4, 50.6, t, a.trois7 + 1.0, 64, { until: a.reunif - 0.1 }); mapLabel('RDA', 12.6, 51.4, t, a.trois7 + 1.4, 64, { until: a.reunif - 0.1 }); }
    if (t > a.reunif) { const p = prog(t, a.reunif, 0.3); flagFill(m, () => pathM(de), flagB(de), FL.de, 0.8 * p * fadeOut(t, a.disp + 0.6, 0.6), 1 - p, 'stretch'); }
    const wa = 1 - prog(t, a.lile, 0.9);
    if (wa > 0) { m.save(); m.globalAlpha = wa; m.shadowColor = '#fff'; m.shadowBlur = 30; strokeGeo(W_, 4 + 10 * (1 - wa), '#fff'); m.restore(); }
    if (t < a.reunif + 0.3) { m.save(); m.globalAlpha = 1 - prog(t, a.reunif, 0.3); strokeGeo(DATA.igb, 4, 'rgba(230,60,60,.9)', [14, 8]); m.restore(); }
  }
}

// ============ CALQUE ÉCRAN (acteurs debout, badges) ============
function walkPose(t, ph = 0) { return Math.floor((t + ph) / 0.28) % 2 ? 'b' : 'a'; }
function screenScene(c, t) {
  const a = A;
  // ping d'ouverture
  { const p = S(BER[0], 52.48); ping(c, p.x, p.y, t, 0.0, 'BERLIN', 0.9); }
  // badge d'accroche
  if (t > a.deux0 && t < a.bo + 0.4) {
    const out = prog(t, a.bo, 0.35); c.save(); c.globalAlpha = 1 - out; const y0 = 360 - out * 200;
    tag(c, '2 MILLIONS', W / 2, y0, { size: 78, sc: stampScale(t, a.deux0) });
    if (t > a.ile1) { const s = popIn(t, a.ile1, 0.3); c.save(); c.translate(W / 2, y0 + 118); c.scale(s, s); txt(c, 'SUR UNE ÎLE', 0, 0, { size: 74, stroke: '#000', sw: 12 }); c.restore(); }
    if (t > a.mer) { const s = popIn(t, a.mer, 0.3); c.save(); c.translate(W / 2, y0 + 212); c.scale(s, s); const w1 = measure(c, 'SANS ', 74, 800); const w2 = measure(c, 'MER', 74, 800); txt(c, 'SANS ', -(w1 + w2) / 2, 0, { size: 74, stroke: '#000', sw: 12, align: 'left' }); c.shadowColor = '#ff2a2a'; c.shadowBlur = 30; txt(c, 'MER', -(w1 + w2) / 2 + w1, 0, { size: 74, color: '#ff3333', stroke: '#300', sw: 12, align: 'left', shadow: false }); c.restore(); }
    // flèche courbe vers l'île
    if (t > a.ile1 + 0.1) { const p = S(WBC[0], WBC[1]); const pr = easeOut(prog(t, a.ile1 + 0.1, 0.4)); c.save(); c.strokeStyle = '#fff'; c.lineWidth = 8; c.lineCap = 'round'; c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 10; const x0 = W / 2 + 300, y1 = y0 + 150; c.beginPath(); c.moveTo(x0, y1); const ex = lerp(x0, p.x + 120, pr), ey = lerp(y1, p.y - 160, pr); c.quadraticCurveTo(x0 + 80, lerp(y1, ey, 0.6), ex, ey); c.stroke(); if (pr > 0.95) { const an = Math.atan2(ey - lerp(y1, ey, 0.6), ex - (x0 + 80)); c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex - 30 * Math.cos(an - 0.5), ey - 30 * Math.sin(an - 0.5)); c.moveTo(ex, ey); c.lineTo(ex - 30 * Math.cos(an + 0.5), ey - 30 * Math.sin(an + 0.5)); c.stroke(); } c.restore(); }
    c.restore();
  }
  // « PAS une île comme les autres »
  if (t > a.coinc && t < a.film + 0.3) {
    const s = popIn(t, a.coinc, 0.3) * fadeOut(t, a.film, 0.3); c.save(); c.translate(W / 2, 380); c.scale(s, s);
    const w1 = measure(c, 'PAS ', 64), w2 = measure(c, 'une île comme les autres', 64); const x0 = -(w1 + w2) / 2;
    c.shadowColor = '#ff2a2a'; c.shadowBlur = 30; txt(c, 'PAS ', x0, 0, { size: 64, color: '#ff3333', stroke: '#300', sw: 11, align: 'left', shadow: false }); c.shadowBlur = 0;
    txt(c, 'une île comme les autres', x0 + w1, 0, { size: 64, stroke: '#000', sw: 11, align: 'left' }); c.restore();
  }
  if (t > a.coupee + 0.7 && t < a.zus + 0.4) { const s = popIn(t, a.coupee + 0.7, 0.3) * fadeOut(t, a.zus, 0.3); tag(c, '4 ZONES', W / 2, 460, { size: 72, bg: '#fff', color: '#1b1300', sc: s }); }
  // soldats 1945
  const zt = { us: a.zus, uk: a.zuk, fr: a.zfr, su: a.zsu }, sn = { us: 'soldier_us', uk: 'soldier_uk', fr: 'soldier_fr', su: 'soldier_su' };
  for (const k of ['uk', 'fr', 'us', 'su']) {
    const t0 = zt[k]; if (t < t0 - 0.35 || t > a.entiere - 0.6) continue; const p = S(ZLAB[k][0], ZLAB[k][1]);
    const fallP = prog(t, t0 - 0.35, 0.35), land = t - t0; const yoff = (1 - easeIn(fallP)) * -900;
    const sq = land > 0 && land < 0.25 ? 1 - 0.18 * Math.sin(land / 0.25 * Math.PI) : 1;
    const al = fadeOut(t, a.berlin2 - 0.3, 0.3);
    sprite(c, sn[k], p.x, p.y + yoff, 230 * p.k, { sx: 2 - sq, sy: sq, rot: 0.04 * Math.sin(t * 3 + p.x), alpha: al });
  }
  // ping Berlin (1945)
  { const p = S(BER[0], 52.50); ping(c, p.x, p.y, t, a.berlin2 - 0.45, 'BERLIN', a.entiere - 0.4); }
  // blocus : acteurs
  if (t > a.routes - 0.5 && t < a.mai + 3.5) {
    const al = fadeOut(t, a.mai + 3.0, 0.5); const open = t > a.moscou;
    // barrière à Helmstedt
    const bp = S(HELM[0], HELM[1] + 0.02); const down = t > a.routes + 0.35 && !open;
    sprite(c, down ? 'barrier_down' : 'barrier_up', bp.x, bp.y, 120 * bp.k * (down ? 0.75 : 1), { alpha: al * popIn(t, a.routes, 0.3) });
    // camion
    let u = open ? 0.3 + prog(t, a.moscou, 2.5) * 0.65 : clamp(prog(t, a.routes - 0.3, 0.9) * 0.18);
    const tr = alongPts(ROAD, u); const tp = S(...tr.lonlat); const bounce = Math.abs(Math.sin(t * 14)) * 3 * (open || t < a.routes + 0.6 ? 1 : 0);
    sprite(c, 'truck', tp.x, tp.y - bounce, 90 * tp.k, { alpha: al * popIn(t, a.routes - 0.3, 0.3), flip: Math.cos(tr.dir + ANG) < 0 });
    // train
    if (t > a.rails - 0.4) { const u2 = clamp(prog(t, a.rails - 0.4, 0.9) * 0.15); const r = alongPts(RAIL, open ? 0.15 + prog(t, a.moscou + 0.2, 2.5) * 0.8 : u2); const rp = S(...r.lonlat); sprite(c, 'train', rp.x, rp.y, 80 * rp.k, { alpha: al * popIn(t, a.rails - 0.4, 0.3) }); }
    // péniche : avance puis demi-tour
    if (t > a.canaux - 0.4) { let u3 = prog(t, a.canaux - 0.4, 0.8) * 0.16; let back = false; if (!open && t > a.canaux + 0.5) { u3 = 0.16 - prog(t, a.canaux + 0.5, 1.5) * 0.12; back = true; } if (open) u3 = 0.04 + prog(t, a.moscou + 0.3, 2.5) * 0.9; const r = alongPts(CANAL, u3); const rp = S(...r.lonlat); sprite(c, 'barge', rp.x, rp.y + Math.sin(t * 4) * 3, 60 * rp.k, { rot: 0.05 * Math.sin(t * 3), flip: back, alpha: al * popIn(t, a.canaux - 0.4, 0.3) }); }
    // croix rouges
    const X = [[HELM, a.routes + 0.45], [[10.99, 52.43], a.rails + 0.45], [[10.85, 52.42], a.canaux + 0.45]];
    for (const [ll, t0] of X) { if (t < t0) continue; const p = S(ll[0], ll[1] + 0.05); const s = open ? 1 - prog(t, a.moscou, 0.3) : stampScale(t, t0); if (s <= 0) continue; c.save(); c.globalAlpha = al * (open ? 1 - prog(t, a.moscou, 0.3) : clamp((t - t0) / 0.1)); c.translate(p.x, p.y - 70); c.scale(s, s); c.strokeStyle = '#e01b24'; c.lineWidth = 16; c.lineCap = 'round'; c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 10; c.beginPath(); c.moveTo(-30, -30); c.lineTo(30, 30); c.moveTo(30, -30); c.lineTo(-30, 30); c.stroke(); c.restore(); }
    // distance 160 km
    if (t > a.km160 && t < a.rien + 0.3) { const p1 = S(HELM[0], HELM[1]), p2 = S(13.40, 52.52); distanceLine(c, [p1.x, p1.y], [p2.x, p2.y], t, a.km160, '160 KM', { until: a.rien - 0.1 }); }
  }
  // pont aérien : avions dans les couloirs
  if (t > a.ciel - 0.8 && t < a.atter - 0.6) {
    const al = Math.min(prog(t, a.ciel - 0.8, 0.4), fadeOut(t, a.atter - 1.2, 0.5));
    CORR.forEach((cr, i) => {
      for (let j = 0; j < 3; j++) {
        let u = ((t - a.ciel + 0.8) / 3.0 + j / 3 + i * 0.13) % 1; if (cr.out) u = 1 - u;
        const ll = d3.geoInterpolate(cr.from, [13.30, 52.48])(u); const p = S(ll[0], ll[1]);
        const q = S(...d3.geoInterpolate(cr.from, [13.30, 52.48])(clamp(u + (cr.out ? -0.01 : 0.01))));
        const dir = Math.atan2(q.y - p.y, q.x - p.x); const left = Math.cos(dir) < 0;
        sprite(c, 'plane', p.x, p.y + 20, 64 * p.k, { rot: left ? dir + Math.PI : dir, flip: left, alpha: al * clamp(u * 8) * clamp((1 - u) * 8), shadow: false });
      }
    });
  }
  // ping Tempelhof
  { const p = S(TEMPEL[0], TEMPEL[1]); ping(c, p.x, p.y, t, a.atter - 2.05, 'TEMPELHOF', a.atter - 0.7); }
  // atterrissages à Tempelhof
  if (t > a.atter - 0.9 && t < a.tonnes + 0.2) {
    const al = fadeOut(t, a.tonnes - 0.2, 0.3);
    for (let n = 0; n < 6; n++) {
      const t0 = a.atter - 0.9 + n * 1.7; if (t < t0 || t > t0 + 2.4) continue; const u = (t - t0) / 2.4;
      const ll = [TEMPEL[0] - 0.02 + u * 0.035, TEMPEL[1] + 0.0012]; const p = S(...ll); const alt = Math.max(0, (0.45 - u)) * 520;
      sprite(c, 'plane_land', p.x, p.y - alt, 260 * p.k, { rot: alt > 5 ? -0.12 : 0, alpha: al * clamp(u * 6) * clamp((1 - u) * 6) });
    }
  }
  if (t > a.trois && t < a.pres + 0.3) { const s = popIn(t, a.trois, 0.3) * fadeOut(t, a.pres, 0.25); tag(c, '1 AVION / 3 MIN', W / 2, 470, { size: 70, bg: '#FFE928', color: '#1b1300', sc: s, border: '#1b1300' }); }
  // compteurs
  counter(c, 278000, t, a.pres, a.vols, W / 2, 480, { suf: ' VOLS', size: 110, until: a.certains - 0.2 });
  counter(c, 2300000, t, a.deux4, a.tonnesE, W / 2, 640, { size: 100, label: 'TONNES', until: a.certains - 0.2 });
  // caisses et charbon
  if (t > a.tonnes - 0.1 && t < a.mai + 0.2) {
    const al = fadeOut(t, a.mai - 0.3, 0.3);
    const spots = [[13.20, 52.52], [13.33, 52.45], [13.27, 52.56], [13.40, 52.47], [13.15, 52.45], [13.30, 52.50], [13.24, 52.43], [13.36, 52.53]];
    spots.forEach((ll, i) => { const t0 = a.tonnes + i * 0.18; if (t < t0) return; const p = S(...ll); const f = prog(t, t0, 0.35); const land = t - t0 - 0.35; const sq = land > 0 && land < 0.25 ? 1 - 0.22 * Math.sin(land / 0.25 * Math.PI) : 1; sprite(c, i % 2 ? 'coal' : 'crate', p.x, p.y - (1 - easeIn(f)) * 900, 95 * p.k, { sx: 2 - sq, sy: sq, alpha: al }); if (land > 0 && land < 0.4) { c.save(); c.globalAlpha = (1 - land / 0.4) * 0.7 * al; c.fillStyle = '#e8dcc4'; for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(p.x + (k - 2) * 22 * (1 + land * 3), p.y - 8 - land * 30, 14 + land * 30, 0, 7); c.fill(); } c.restore(); } });
  }
  // bonbons en parachute
  if (t > a.bonbons - 0.1 && t < a.mai + 0.4) {
    const al = fadeOut(t, a.mai, 0.3);
    [[13.24, 52.49], [13.33, 52.46], [13.29, 52.51], [13.36, 52.49], [13.27, 52.45], [13.31, 52.48]].forEach((ll, i) => { const t0 = a.bonbons - 0.1 + i * 0.22; if (t < t0) return; const p = S(...ll); const f = prog(t, t0, 2.6); sprite(c, 'candy_chute', p.x + Math.sin((t - t0) * 2.4 + i) * 30, p.y - (1 - easeOut(f)) * 1100, 190 * p.k, { rot: 0.18 * Math.sin((t - t0) * 2.4 + i), alpha: al, shadow: f > 0.9 }); });
  }
  // fuite : marcheurs
  if (t > a.fuient - 0.6 && t < a.metro - 0.9) {
    const al = Math.min(prog(t, a.fuient - 0.6, 0.3), fadeOut(t, a.metro - 1.5, 0.4));
    EASTC.forEach((c0, i) => { const t0 = a.fuient - 0.6 + i * 0.12; const u = 0.12 + prog(t, t0, 7) * 0.8; const ll = d3.geoInterpolate(c0, WALK_TO[i])(u); const p = S(...ll); const q = S(...WALK_TO[i]); const left = q.x < p.x; sprite(c, 'walker_' + walkPose(t, i * 0.13), p.x, p.y - Math.abs(Math.sin((t + i) * 11)) * 4, 150 * p.k, { flip: left, alpha: al }); });
  }
  counter(c, 2700000, t, a.deux5, a.allem5, W / 2, 470, { size: 120, until: a.rien5 - 0.1 });
  counter(c, 199000, t, a.n199, a.n199e, W / 2, 470, { size: 120, label: 'RIEN QU\'EN 1960', until: a.beaucoup + 0.4 });
  { const p = S(13.39, 52.515); ping(c, p.x, p.y, t, a.ber5 - 0.45, 'BERLIN', a.metro - 1.4); }
  // métro
  if (t > a.metro - 1.0 && t < a.nuit) {
    const u = prog(t, a.metro - 1.0, 3.2); const r = alongPts([[13.43, 52.522], [13.388, 52.5205], [13.36, 52.512], [13.32, 52.506]], u); const p = S(...r.lonlat);
    sprite(c, 'metro', p.x, p.y + 40, 230 * p.k, { flip: true, alpha: fadeOut(t, a.nuit - 0.3, 0.3), rot: 0.01 * Math.sin(t * 20) });
  }
  // mur : ouvrier, miradors
  if (t > a.barb - 0.2 && t < a.tombe - 0.5) {
    const al = fadeOut(t, a.n155 - 0.3, 0.3); const p = S(13.392, 52.521);
    sprite(c, 'worker_' + (Math.floor((t - a.barb) / 0.32) % 2 ? 'b' : 'a'), p.x - 40, p.y, 190 * p.k, { alpha: al * popIn(t, a.barb - 0.2, 0.3) });
    sprite(c, 'wire', p.x + 150 * p.k, p.y, 80 * p.k, { alpha: al * popIn(t, a.barb, 0.3) });
  }
  if (t > a.beton && t < a.tombe + 0.3) {
    const pts = DATA.west.coordinates[0]; const al = fadeOut(t, a.tombe, 0.3);
    for (let i = 0; i < 6; i++) { const ll = pts[Math.floor((i + 0.3) / 6 * pts.length)]; const p = S(...ll); const t0 = a.beton + 0.3 + i * 0.22; if (t < t0) continue; sprite(c, 'tower', p.x, p.y, 95 * p.k * popIn(t, t0, 0.3), { alpha: al }); }
  }
  photoCard(c, PH.c54, t, a.pres, a.pres + 2.3, '1948 · TEMPELHOF', 'Des enfants regardent un avion du pont aérien', { side: -1, y: 1110, w: 560, h: 530 });
  photoCard(c, PH.mauer, t, a.beton + 0.1, a.beton + 2.4, 'AOÛT 1961', 'Construction du mur à Berlin', { side: 1, y: 1190, w: 600, h: 408 });
  counter(c, 155, t, a.n155, a.km155, W / 2, 480, { suf: ' KM', size: 130, until: a.moins - 0.2 });
  // chiffre tragique
  tragic(c, '140', 'MORTS AU MUR', t, a.moins, a.b6e + 0.1);
  // chute du mur : fêtards
  if (t > a.tombe - 0.1 && t < a.allem7 + 0.3) {
    const al = fadeOut(t, a.allem7 - 0.3, 0.3); const p = S(13.377, 52.516);
    sprite(c, 'fan_' + (Math.floor((t - a.tombe) / 0.3) % 2 ? 'b' : 'a'), p.x - 150, p.y - Math.abs(Math.sin(t * 9)) * 12, 340 * p.k, { alpha: al * popIn(t, a.tombe - 0.1, 0.3) });
    sprite(c, 'fan_' + (Math.floor((t - a.tombe + 0.15) / 0.3) % 2 ? 'a' : 'b'), p.x + 170, p.y - Math.abs(Math.sin(t * 9 + 1)) * 12, 320 * p.k, { alpha: al * popIn(t, a.tombe + 0.1, 0.3), flip: true });
    // confettis
    c.save(); c.globalAlpha = al; for (let i = 0; i < 70; i++) { const s0 = (i * 9301 + 49297) % 233280 / 233280, s1 = (i * 4253 + 1231) % 1000 / 1000; const tt = t - a.tombe; if (tt < 0) break; const x = p.x + (s0 - 0.5) * 900 + Math.sin(tt * 3 + i) * 20, y = p.y - 650 + ((tt * (180 + s1 * 200) + s1 * 600) % 900); c.fillStyle = ['#FFE928', '#E6197E', '#36c5f0', '#fff', '#2eb67d'][i % 5]; c.save(); c.translate(x, y); c.rotate(tt * 5 + i); c.fillRect(-7, -4, 14, 8); c.restore(); } c.restore();
  }
  photoCard(c, PH.y89, t, a.b7 + 0.1, a.tombe - 0.15, '10 NOV. 1989', 'Sur le mur, devant la porte de Brandebourg', { side: -1, y: 1000, w: 500, h: 700 });
  // étiquette finale
  if (t > a.lile) { const p = S(13.40, 52.52); c.save(); c.globalAlpha = 1 - prog(t, a.disp + 0.2, 0.5); txt(c, 'BERLIN-OUEST', p.x, p.y - 60, { size: 46, stroke: '#000', sw: 8 }); c.restore(); }
  filmStrip(c, t, a.film, 1.3, '1945', null);
}

// ============ RENDU ============
function drawMapLayer(t) {
  const L = styleLayers(t);
  drawMap(m, L.a, t);
  if (L.b) {
    if (L.kind === 'fade') { drawMap(ac, L.b, t); m.save(); m.setTransform(1, 0, 0, 1, 0, 0); m.globalAlpha = L.p; m.drawImage(altC, 0, 0); m.restore(); }
    else { drawMap(ac, L.b, t); const x = OX + lerp(-200, W + 200, L.p); m.save(); m.setTransform(1, 0, 0, 1, 0, 0); m.beginPath(); m.rect(0, 0, x, MH); m.clip(); m.drawImage(altC, 0, 0); m.restore(); m.save(); m.fillStyle = '#fff'; m.shadowColor = '#fff'; m.shadowBlur = 30; m.fillRect(x - 5, 0, 10, MH); m.restore(); }
  }
  // nuit
  if (t > A.nuit - 0.3 && t < A.b7) { m.save(); m.globalAlpha = 0.35 * prog(t, A.nuit - 0.3, 0.5); m.fillStyle = '#0a1840'; m.fillRect(0, 0, MW, MH); m.restore(); }
  mapScene(t);
}
window.render = function (t) {
  const st = cam(t); cam_s = st.s; ANG = angAt(t); TILT = tiltAt(t); window._cam = { lon: st.lon, lat: st.lat };
  P = d3.geoMercator().rotate([-st.lon, 0]).center([0, st.lat]).scale(st.s).translate([540 + OX, CY + OY]).precision(0).clipExtent([[0, 0], [MW, MH]]);
  cam_s = st.s; window.cam_state = st;
  drawMapLayer(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#0b3a4e'; ctx.fillRect(0, 0, W, H);
  const tragicOn = t > A.moins && t < A.b6e + 0.5; if (tragicOn) ctx.filter = `grayscale(${0.85 * prog(t, A.moins, 0.3)}) brightness(${1 - 0.35 * prog(t, A.moins, 0.3)})`;
  if (TILT < 0.001) { ctx.save(); ctx.translate(540, CY); ctx.rotate(ANG); ctx.translate(-540 - OX, -CY - OY); ctx.drawImage(mapC, 0, 0); ctx.restore(); }
  else {
    rc.setTransform(1, 0, 0, 1, 0, 0); rc.clearRect(0, 0, MW, MH); rc.translate(540 + OX, CY + OY); rc.rotate(ANG); rc.translate(-540 - OX, -CY - OY); rc.drawImage(mapC, 0, 0); rc.setTransform(1, 0, 0, 1, 0, 0);
    const sn = Math.sin(TILT), cs = Math.cos(TILT); const band = 8;
    for (let y = 0; y < H; y += band) {
      const v0p = y - CY, v1p = y + band - CY; const v0 = v0p * FOC / (FOC * cs + v0p * sn), v1 = v1p * FOC / (FOC * cs + v1p * sn); const k = FOC / (FOC - ((v0 + v1) / 2) * sn);
      const sy = CY + OY + v0, sh = Math.max(1, v1 - v0); if (sy < 0 || sy + sh > MH) continue;
      ctx.drawImage(rotC, 0, sy, MW, sh, 540 - k * (540 + OX), y, MW * k, band + 0.6);
    }
  }
  ctx.filter = 'none';
  screenScene(ctx, t);
  // grain + vignette légère
  ctx.save(); ctx.globalAlpha = 0.07; ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = ctx.createPattern(GRAIN, 'repeat'); ctx.translate((t * 997) % 256, (t * 613) % 256); ctx.fillRect(-256, -256, W + 512, H + 512); ctx.restore();
  const vg = ctx.createRadialGradient(W / 2, H / 2, 700, W / 2, H / 2, 1250); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.35)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  drawDate(ctx, t);
  drawSubs(ctx, t);
  window.CAM.last = { t, s: st.s, ang: ANG, tilt: TILT };
};

// ============ CHARGEMENT ============
const loadImg = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
window.init = async function () {
  canvas = document.getElementById('c'); ctx = canvas.getContext('2d');
  const [d, wd, tm] = await Promise.all(['data.json', 'world.json', 'timing.json'].map(u => fetch(u).then(r => r.json())));
  DATA = d; WORLD = wd; WORDS = tm.words;
  for (const k of ['us', 'gb', 'fr', 'de', 'su', 'gdr']) FL[k] = await loadImg('flags/' + k + '.svg');
  const names = Object.keys(SPR_COL); await Promise.all(names.map(async n => { SPR[n] = await loadImg('spr/' + n + '.png'); }));
  PH.c54 = await loadImg('../assets/photo_c54.webp'); PH.mauer = await loadImg('../assets/photo_mauerbau.png'); PH.y89 = await loadImg('../assets/photo_1989.webp');
  makeGrain();
  TEX.veg = makeTex(['rgba(40,80,30,.5)', 'rgba(120,140,70,.45)', 'rgba(70,100,40,.5)', 'rgba(150,150,90,.35)'], 900, 11, 22);
  TEX.fields = makeTex(['rgba(170,160,90,.5)', 'rgba(90,120,50,.5)', 'rgba(130,150,70,.5)', 'rgba(190,180,120,.4)'], 500, 5, 30);
  TEX.city = makeTex(['rgba(120,110,95,.6)', 'rgba(205,195,175,.5)', 'rgba(90,110,70,.45)', 'rgba(160,150,135,.5)'], 2400, 3, 7);
  TEX.cityIll = makeTex(['rgba(230,190,110,.5)', 'rgba(255,240,200,.5)', 'rgba(200,170,110,.4)'], 1800, 9, 8);
  TEX.cityDark = makeTex(['rgba(60,60,60,.6)', 'rgba(25,25,25,.6)', 'rgba(80,80,70,.4)'], 1800, 9, 8);
  TEX.paper = makeTex(['rgba(200,170,120,.25)', 'rgba(255,250,235,.3)', 'rgba(180,150,100,.18)'], 300, 21, 40);
  { const g = document.createElement('canvas'); g.width = g.height = 256; const x = g.getContext('2d'); x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = 3; for (let i = 0; i < 9; i++) { const cx = (i * 97) % 256, cy = (i * 61) % 256; x.beginPath(); x.arc(cx, cy, 12, Math.PI * 1.1, Math.PI * 1.9); x.arc(cx + 24, cy, 12, Math.PI * 1.1, Math.PI * 1.9); x.stroke(); } TEX.waves = g; }
  buildSubs(SCRIPT); setup(); window.VISUALS = SUBS.map(x => x.t0).concat(DATES.map(d => d[0])).concat(STYLE_TR.map(x => x.t0 + x.d / 2));
  window.CAM = { stops: true, dur: DUR, tilt: A.tilt, angAt, tiltAt, camAt: t => cam(t) };
  window.DUR = DUR; window.READY = true;
};
