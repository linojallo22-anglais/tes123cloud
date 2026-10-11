// scene.js — Team France vs Team Russie. window.render(t) déterministe.
const CY = 860, OX = 470, OY = 680, MW = 2020, MH = 3060, FOC = 1400;
const BLUE = '#1f5dff', RED = '#e3121f';
let WORLD, BM, FL = {}, DUR, cam;
const mapC = document.createElement('canvas'); mapC.width = MW; mapC.height = MH; const m = mapC.getContext('2d');
const rotC = document.createElement('canvas'); rotC.width = MW; rotC.height = MH; const rc = rotC.getContext('2d');
let canvas, ctx, P = null, cam_s = 1, ANG = 0, TILT = 0;

const ISO = { '008': 'al', '056': 'be', '100': 'bg', '124': 'ca', '191': 'hr', '203': 'cz', '208': 'dk', '233': 'ee', '246': 'fi', '250': 'fr', '276': 'de', '300': 'gr', '348': 'hu', '352': 'is', '380': 'it', '428': 'lv', '440': 'lt', '442': 'lu', '499': 'me', '528': 'nl', '807': 'mk', '578': 'no', '616': 'pl', '620': 'pt', '642': 'ro', '703': 'sk', '705': 'si', '724': 'es', '752': 'se', '792': 'tr', '826': 'gb', '840': 'us', '040': 'at', '372': 'ie', '196': 'cy', '470': 'mt', '643': 'ru', '112': 'by', '408': 'kp', '398': 'kz', '417': 'kg', '762': 'tj', '364': 'ir', '156': 'cn', '304': 'gl' };
const NAME = { '250': 'FRANCE', '643': 'RUSSIE', '826': 'ROYAUME-UNI', '276': 'ALLEMAGNE', '380': 'ITALIE', '724': 'ESPAGNE', '616': 'POLOGNE', '040': 'AUTRICHE', '372': 'IRLANDE', '124': 'CANADA', '840': 'ÉTATS-UNIS', '112': 'BIÉLORUSSIE', '408': 'CORÉE DU NORD', '398': 'KAZAKHSTAN', '417': 'KIRGHIZISTAN', '762': 'TADJIKISTAN', '364': 'IRAN', '156': 'CHINE' };
const CAP = { '250': [2.35, 48.86], '826': [-0.13, 51.5], '276': [13.4, 52.52], '380': [12.5, 41.9], '724': [-3.7, 40.42], '616': [21.01, 52.23], '040': [16.37, 48.21], '372': [-6.26, 53.35], '124': [-75.7, 45.42], '840': [-77.04, 38.9], '643': [37.62, 55.75], '112': [27.56, 53.9], '408': [125.75, 39.03], '398': [71.45, 51.17], '417': [74.6, 42.87], '762': [68.78, 38.56], '364': [51.39, 35.69], '156': [116.4, 39.9] };
const ANCH = { ...CAP, '250': [2.4, 46.8], '826': [-1.8, 53.2], '276': [10.4, 51.1], '380': [12.6, 42.9], '724': [-3.7, 40.2], '616': [19.3, 52.1], '040': [14.5, 47.5], '372': [-8, 53.2], '124': [-100, 57], '840': [-98, 39], '643': [45, 57], '112': [28, 53.6], '408': [127, 40.1], '398': [67, 48.3], '417': [74.5, 41.4], '762': [70.8, 38.7], '364': [54, 32.5], '156': [104, 35] };

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
        return { lon: A.lon + dl * ep, lat: lerp(A.lat, b.lat, ep), s: Math.exp(lerp(Math.log(A.s), Math.log(b.s), ez)) };
      }
    }
    return dr(stops.at(-1), t);
  };
}
function S(lon, lat) {
  const p = P([lon, lat]); let x = p[0] - OX - 540, y = p[1] - OY - CY;
  const c = Math.cos(ANG), s = Math.sin(ANG); let u = x * c - y * s, v = x * s + y * c; let k = 1;
  if (TILT > 0.001) { const sn = Math.sin(TILT), cs = Math.cos(TILT); k = FOC / (FOC - v * sn); u *= k; v = k * v * cs; }
  return { x: 540 + u, y: CY + v, k };
}
const pathM = g => { m.beginPath(); d3.geoPath(P, m)(g); };
const geomOf = id => (cam_s > 2200 && WORLD.c10[id]) ? WORLD.c10[id] : WORLD.byId[id].g;

const YMAX = Math.log(Math.tan(Math.PI / 4 + 85.0511 * Math.PI / 360));
function drawSat(st) {
  const Wpx = st.s * 2 * Math.PI, cx = 540 + OX, cy = CY + OY;
  const x0 = cx + st.s * ((-180 - st.lon) * Math.PI / 180), y0 = cy - st.s * (YMAX - Math.log(Math.tan(Math.PI / 4 + st.lat * Math.PI / 360)));
  const k = Wpx / BM.width; m.imageSmoothingQuality = 'high'; m.fillStyle = '#0b3a52'; m.fillRect(0, 0, MW, MH);
  if (st.s > 9000) m.filter = 'blur(2px)';
  for (const off of [-Wpx, 0, Wpx]) { const X0 = x0 + off; const dx0 = Math.max(0, X0), dx1 = Math.min(MW, X0 + Wpx), dy0 = Math.max(0, y0), dy1 = Math.min(MH, y0 + Wpx); if (dx1 <= dx0 || dy1 <= dy0) continue; m.drawImage(BM, (dx0 - X0) / k, (dy0 - y0) / k, (dx1 - dx0) / k, (dy1 - dy0) / k, dx0, dy0, dx1 - dx0, dy1 - dy0); }
  m.filter = 'none';
  const a = clamp((st.s - 1800) / 2500) * 0.82;
  if (a > 0) {
    const y = lat => P([st.lon, lat])[1]; const g = m.createLinearGradient(0, y(70), 0, y(-10));
    const stops = [[70, '#8a8f84'], [60, '#3f5a32'], [52, '#55753a'], [46, '#5f7d3c'], [42, '#7f8350'], [36, '#a69a62'], [30, '#c7a76a'], [20, '#c9a46a'], [10, '#5f7f3a'], [-10, '#3d6b2c']];
    const ya = y(70), yb = y(-10); for (const [l, col] of stops) g.addColorStop(clamp((y(l) - ya) / (yb - ya || 1)), col);
    m.save(); m.globalAlpha = a; pathM(WORLD.land); m.fillStyle = g; m.fill(); m.restore();
    m.save(); pathM(WORLD.land); m.clip(); m.globalAlpha = 0.14 * a; m.globalCompositeOperation = 'overlay'; m.fillStyle = m.createPattern(GRAIN, 'repeat'); m.fillRect(0, 0, MW, MH); m.restore();
  }
  m.save(); pathM(WORLD.land); m.lineWidth = 1.5; m.strokeStyle = 'rgba(255,255,255,.18)'; m.stroke(); pathM(WORLD.borders); m.lineWidth = 1.3; m.strokeStyle = 'rgba(255,255,255,.5)'; m.stroke(); m.restore();
}

// ---------- pays ----------
let CS = {};
function hatch(alpha) { m.save(); m.clip(); m.globalAlpha = alpha; m.strokeStyle = '#fff'; m.lineWidth = 5; m.beginPath(); for (let x = -MH; x < MW; x += 30) { m.moveTo(x, 0); m.lineTo(x + MH, MH); } m.stroke(); m.restore(); }
const SLICE = /^(us|gb|cn|es|ca|kz|ir|by|kp|kg|tj|at|ie|cy|mt|gl|tr|pt|hr|me|al|mk|sk|si|gr|no|se|fi|dk|is)$/;
function drawCountries(t) {
  const zoomFade = 1 - 0.45 * clamp((cam_s - 2600) / 3000);
  for (const id in CS) {
    const c = CS[id]; if (t < c.t) continue; const g = geomOf(id); const dt = t - c.t; const fl = FL[ISO[id]];
    const hold = c.named ? 1.3 : 0.35;
    const flagA = clamp(dt / (c.named ? 0.25 : 0.12)) * (1 - clamp((dt - hold) / 0.5));
    const flash = Math.max(0, 1 - dt / 0.3), teamA = clamp((dt - hold + 0.1) / 0.5);
    const col = { f: BLUE, r: RED, g: '#8b9096' }[c.team];
    if (col && teamA > 0) { pathM(g); m.globalAlpha = (c.team === 'g' ? 0.5 : 0.66) * teamA * (c.dim ? 0.6 : 1) * zoomFade; m.fillStyle = col; m.fill(); m.globalAlpha = 1; if (c.team === 'g') { pathM(g); hatch(0.3 * teamA); } }
    if (flagA > 0 && fl) flagFill(m, () => pathM(g), d3.geoPath(P).bounds(g), fl, 0.9 * flagA * zoomFade, flash, SLICE.test(ISO[id]) ? 'slice' : 'stretch');
    if (c.named && dt < 2.2) { pathM(g); m.save(); m.globalAlpha = 1 - dt / 2.2; m.shadowColor = '#fff'; m.shadowBlur = 25; m.lineWidth = 4; m.strokeStyle = '#fff'; m.stroke(); m.restore(); }
    if (c.re && t > c.re) { const d2 = t - c.re; const fa = clamp(d2 / 0.25) * (1 - clamp((d2 - 1.3) / 0.5)); if (fa > 0) flagFill(m, () => pathM(g), d3.geoPath(P).bounds(g), fl, 0.9 * fa * zoomFade, Math.max(0, 1 - d2 / 0.3), SLICE.test(ISO[id]) ? 'slice' : 'stretch'); if (d2 < 2.2) { pathM(g); m.save(); m.globalAlpha = 1 - d2 / 2.2; m.shadowColor = '#fff'; m.shadowBlur = 25; m.lineWidth = 4; m.strokeStyle = '#fff'; m.stroke(); m.restore(); } }
  }
}

// ---------- avions de chasse ----------
let LEGS = [];
const legPos = (L, t) => { const u = ease(prog(t, L.t0, L.t1 - L.t0)); return { ll: d3.geoInterpolate(L.a, L.b)(u), u }; };
function drawTrails(t) {
  for (const L of LEGS) {
    if (t < L.t0 || t > L.t1 + 2.5) continue; const { u } = legPos(L, t); const al = fadeOut(t, L.t1 + 1.8, 0.7);
    m.save(); m.globalAlpha = al; m.beginPath(); for (let i = 0; i <= 40; i++) { const p = P(d3.geoInterpolate(L.a, L.b)(u * i / 40)); i ? m.lineTo(p[0], p[1]) : m.moveTo(p[0], p[1]); }
    m.setLineDash([18, 14]); m.lineDashOffset = -t * 60; m.lineWidth = 7; m.strokeStyle = L.jet === 'jet_fr' ? '#F7EF08' : '#ff9a3a'; m.shadowColor = m.strokeStyle; m.shadowBlur = 12; m.lineCap = 'round'; m.stroke(); m.restore();
  }
}
function jetAt(t) { // position et état de chaque avion à l'instant t
  const out = [];
  for (const jet of ['jet_fr', 'jet_ru']) {
    const legs = LEGS.filter(L => L.jet === jet); const V = JETVIS[jet]; if (t < V[0] || t > V[1]) continue;
    let L = legs.find(L => t >= L.t0 && t <= L.t1); let ll, dir = null, alt = 0;
    if (L) { const r = legPos(L, t); ll = r.ll; alt = Math.sin(Math.PI * r.u); out.push({ jet, ll, L, u: r.u, alt }); continue; }
    const prev = legs.filter(L => L.t1 < t).at(-1), next = legs.find(L => L.t0 > t);
    const base = prev ? prev.b : next.a; out.push({ jet, ll: base, L: prev || next, u: prev ? 1 : 0, alt: 0, idle: true });
  }
  return out;
}
let JETVIS = {};
function drawJets(c, t) {
  for (const J of jetAt(t)) {
    const p = S(J.ll[0], J.ll[1]); const q = S(...d3.geoInterpolate(J.L.a, J.L.b)(clamp(J.u + 0.02))); const p0 = S(...d3.geoInterpolate(J.L.a, J.L.b)(clamp(J.u - 0.02)));
    let dir = Math.atan2(q.y - p0.y, q.x - p0.x); const V = JETVIS[J.jet];
    const a = Math.min(clamp((t - V[0]) / 0.3), fadeOut(t, V[1] - 0.3, 0.3));
    const circ = J.idle ? (t * 2.2) % (Math.PI * 2) : 0; const sc = (1 + 0.2 * J.alt) * popIn(t, V[0], 0.35);
    let x = p.x, y = p.y; if (J.idle) { x += Math.cos(circ) * 70; y += Math.sin(circ) * 40; dir = circ + Math.PI / 2; }
    c.save(); c.globalAlpha = a;
    c.save(); c.translate(x + 26 + 50 * J.alt, y + 36 + 60 * J.alt); c.rotate(dir + Math.PI / 2); c.globalAlpha = 0.32 * a; c.filter = 'brightness(0) blur(5px)'; drawJetImg(c, J.jet, 210 * sc); c.restore();
    c.translate(x, y); c.rotate(dir + Math.PI / 2); drawJetImg(c, J.jet, 210 * sc); c.restore();
  }
}
function drawJetImg(c, name, h) { const img = SPR[name]; if (!img) { c.fillStyle = name === 'jet_fr' ? '#ccd' : '#7a8'; c.fillRect(-h * 0.3, -h / 2, h * 0.6, h); return; } const w = h * img.width / img.height; c.drawImage(img, -w / 2, -h / 2, w, h); c.filter = 'none'; }

// ---------- épingles ----------
function flagPin(c, x, y, img, r) {
  c.save(); c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 10; c.shadowOffsetY = 4;
  c.beginPath(); c.moveTo(x, y); c.lineTo(x - r * 0.55, y - r * 1.25); c.arc(x, y - r * 1.75, r, Math.PI * 0.82, Math.PI * 0.18); c.closePath(); c.fillStyle = '#fff'; c.fill(); c.shadowColor = 'transparent';
  c.save(); c.beginPath(); c.arc(x, y - r * 1.75, r * 0.8, 0, 7); c.clip(); if (img) c.drawImage(img, x - r * 1.07, y - r * 2.55, r * 2.14, r * 1.6); c.restore(); c.restore();
}
function drawPins(c, t) {
  for (const id in CS) {
    const cs = CS[id]; const tp = cs.named ? cs.t : cs.re; if (tp == null || t < tp) continue; const a = ANCH[id]; const p = S(a[0], a[1]);
    if (p.x < -80 || p.x > W + 80 || p.y < -80 || p.y > H + 80) continue;
    const r = clamp(22 + Math.log2(cam_s / 300) * 6, 18, 46) * p.k * popIn(t, cs.t, 0.3);
    flagPin(c, p.x, p.y, FL[ISO[id]], r);
    const t0 = cs.re && t >= cs.re ? cs.re : cs.t;
    if (t < t0 + 2.3) { c.save(); c.globalAlpha = fadeOut(t, t0 + 2.0, 0.3); txt(c, typed(NAME[id], t, t0 + 0.05, 0.3), p.x, p.y + 52 * Math.max(0.8, p.k), { size: 64, stroke: '#000', sw: 11 }); c.restore(); }
    else if (cam_s > 900) txt(c, NAME[id], p.x, p.y + 28, { size: 28, stroke: '#000', sw: 6, weight: 700 });
  }
}

// ---------- score ----------
let SCORE = { f: [], r: [] };
const scoreAt = (k, t) => SCORE[k].filter(x => x <= t).length;
function lastBump(k, t) { const l = SCORE[k].filter(x => x <= t).at(-1); return l == null ? 0 : Math.max(0, 1 - (t - l) / 0.18); }
function drawScore(c, t) {
  if (t < A.sb) return; const big = prog(t, A.res, 0.5) * (1 - prog(t, A.mais8 - 0.1, 0.4));
  const a = popIn(t, A.sb, 0.35); const y = lerp(250, 640, big), sc = a * lerp(1, 1.3, big);
  c.save(); c.translate(W / 2, y); c.scale(sc, sc);
  for (const [side, col, label, k] of [[-1, BLUE, 'TEAM FRANCE', 'f'], [1, RED, 'TEAM RUSSIE', 'r']]) {
    const val = scoreAt(k, t), bump = lastBump(k, t);
    c.save(); c.translate(side * 228, 0); c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 20; c.shadowOffsetY = 6;
    rr(c, -205, -62, 410, 124, 22); c.fillStyle = col; c.fill(); c.shadowColor = 'transparent'; c.lineWidth = 5; c.strokeStyle = '#fff'; c.stroke();
    c.save(); c.beginPath(); c.arc(-160, 0, 30, 0, 7); c.clip(); const img = FL[k === 'f' ? 'fr' : 'ru']; if (img) c.drawImage(img, -200, -30, 80, 60); c.restore(); c.beginPath(); c.arc(-160, 0, 30, 0, 7); c.lineWidth = 4; c.strokeStyle = '#fff'; c.stroke();
    txt(c, label, -12, -2, { size: 31, shadow: false, weight: 900 });
    c.save(); c.translate(150, 2); c.scale(1 + 0.35 * bump, 1 + 0.35 * bump); txt(c, String(val), 0, 0, { size: 76, shadow: false, weight: 900, color: '#FFE928', stroke: '#1b1300', sw: 8 }); c.restore();
    c.restore();
  }
  txt(c, 'VS', 0, 0, { size: 56, weight: 900, color: '#fff', stroke: '#000', sw: 10 });
  c.restore();
}

// ============ TIMELINE ============
let A = {};
function setup() {
  const a = A;
  a.ru0 = T(0, 'russie'); a.fr0 = T(0, 'france'); a.qui = T(0, 'qui'); a.tf = T(0, 'team'); a.contre = T(0, 'contre'); a.tr = T(0, 'team', 2); a.voici = T(0, 'voici'); a.allies = T(0, 'allies');
  a.b1 = beatStart(1); a.otan = T(1, 'lotan'); a.uk = T(1, 'royaumeuni'); a.de = T(1, 'lallemagne'); a.it = T(1, 'litalie'); a.es = T(1, 'lespagne'); a.pl = T(1, 'pologne'); a.n31 = T(1, 'trente'); a.def = TE(1, 'defendre');
  a.b2 = beatStart(2); a.at = T(2, 'lautriche'); a.ie = T(2, 'lirlande'); a.neutres = T(2, 'neutres'); a.ue = T(2, 'lunion');
  a.b3 = beatStart(3); a.atl = T(3, 'latlantique'); a.ca = T(3, 'canada'); a.us = T(3, 'etatsunis'); a.armee = T(3, 'premiere');
  a.b4 = beatStart(4); a.tr4 = T(4, 'team'); a.by = T(4, 'bielorussie'); a.fidele = T(4, 'fidele');
  a.b5 = beatStart(5); a.kp = T(5, 'coree'); a.combat = T(5, 'combattu');
  a.b6 = beatStart(6); a.kz = T(6, 'kazakhstan'); a.kg = T(6, 'kirghizistan'); a.tj = T(6, 'tadjikistan'); a.mil = T(6, 'militaires');
  a.b7 = beatStart(7); a.ir = T(7, 'liran'); a.cn = T(7, 'chine'); a.part = T(7, 'partenaires'); a.aucun = T(7, 'aucun'); a.oblige = T(7, 'oblige'); a.moscou = T(7, 'moscou');
  a.b8 = beatStart(8); a.res = T(8, 'resultat'); a.n36 = T(8, 'trentesix'); a.six = T(8, 'six'); a.mais8 = T(8, 'mais'); a.stock = T(8, 'stock'); a.nuc = T(8, 'nucleaires');
  a.b9 = beatStart(9); a.forte = T(9, 'forte'); a.ton = T(9, 'ton'); a.abo = T(9, 'abonnetoi'); a.fin = TE(9, 'abonnetoi');
  a.sb = a.voici - 0.1; DUR = a.fin + 0.55;

  const C = (id, t, team, o = {}) => { CS[id] = { t, team, named: !!NAME[id] && !o.unnamed, ...o }; };
  C('643', a.ru0, 'r'); C('250', a.fr0, 'f'); SCORE.r.push(a.ru0); SCORE.f.push(a.fr0);
  [['826', a.uk], ['276', a.de], ['380', a.it], ['724', a.es], ['616', a.pl]].forEach(([id, t]) => { C(id, t, 'f'); SCORE.f.push(t); });
  const rest = WORLD.NATO.filter(id => !['250', '826', '276', '380', '724', '616'].includes(id)).sort((x, y) => WORLD.cent[x][0] - WORLD.cent[y][0]);
  rest.forEach((id, i) => { const t = a.n31 + 0.1 + i * 0.045; C(id, t, 'f', { unnamed: true }); SCORE.f.push(t); });
  C('304', a.n31 + 0.15, 'f', { unnamed: true, dim: true });
  CS['124'].re = a.ca; CS['840'].re = a.us; CS['643'].re = a.tr4;
  C('040', a.at, 'f'); C('372', a.ie, 'f'); SCORE.f.push(a.at, a.ie);
  C('196', a.ue + 0.15, 'f', { unnamed: true }); C('470', a.ue + 0.35, 'f', { unnamed: true }); SCORE.f.push(a.ue + 0.15, a.ue + 0.35);
  C('112', a.by, 'r'); C('408', a.kp, 'r'); C('398', a.kz, 'r'); C('417', a.kg, 'r'); C('762', a.tj, 'r'); SCORE.r.push(a.by, a.kp, a.kz, a.kg, a.tj);
  C('364', a.ir, 'g'); C('156', a.cn, 'g');

  // ---- vols des chasseurs (chaque zoom est accompagné par l'avion)
  const L = (jet, from, to, t0, t1, sMid, sEnd) => LEGS.push({ jet, a: CAP[from] || from, b: CAP[to] || to, t0, t1, sMid, sEnd });
  L('jet_fr', '250', '826', a.otan + 0.1, a.uk, 1500, 2600);
  L('jet_fr', '826', '276', a.uk + 0.15, a.de, 1500, 2500);
  L('jet_fr', '276', '380', a.de + 0.12, a.it, 1400, 2400);
  L('jet_fr', '380', '724', a.it + 0.12, a.es, 1400, 2400);
  L('jet_fr', '724', '616', a.es + 0.12, a.pl, 1200, 2400);
  L('jet_fr', '616', '040', a.def - 0.5, a.at, 1300, 2600);
  L('jet_fr', '040', '372', a.at + 0.15, a.ie + 0.05, 1100, 2400);
  L('jet_fr', '372', '124', a.b3 - 0.1, a.ca, 330, 900);
  L('jet_fr', '124', '840', a.ca + 0.2, a.us, 900, 1300);
  L('jet_ru', '643', '112', a.tr4 + 0.2, a.by, 1600, 2600);
  L('jet_ru', '112', '408', a.by + 0.9, a.kp, 330, 1700);
  L('jet_ru', '408', '398', a.b6 - 0.55, a.kz, 380, 1500);
  L('jet_ru', '398', '417', a.kz + 0.15, a.kg, 1300, 1900);
  L('jet_ru', '417', '762', a.kg + 0.15, a.tj, 1500, 2100);
  JETVIS = { jet_fr: [a.voici, a.b4 - 0.2], jet_ru: [a.voici + 0.15, a.b7 - 0.1] };

  const st = (t, d, lon, lat, s, o = {}) => ({ t, d, lon, lat, s, ...o });
  const stops = [
    st(0, 0, 25, 51, 420, { drift: 0.05 }),
    st(a.fr0 - 0.1, 0.9, 18, 51, 600),
    st(a.tf - 0.1, 1.0, 22, 53, 380),
    st(a.voici - 0.1, 1.0, 10, 50, 560),
    st(a.otan - 0.05, 1.0, 2.3, 48.6, 2600, { drift: 0.04 }),
  ];
  stops.push(
    st(a.n31 - 0.05, 0.8, 12, 50, 700), // vague OTAN (dézoom)
    st(a.neutres - 0.1, 0.8, -4, 52, 1600), // neutres
    st(a.ue - 0.1, 0.9, 12, 44, 900), // Union européenne : Chypre, Malte
    st(a.armee - 0.1, 0.8, -95, 40, 820, { drift: 0.04 }),
    st(a.b4 - 0.05, 0.95, -20, 48, 200),
    st(a.tr4 - 0.05, 0.9, 37.6, 55.3, 4300), // grande plongée sur Moscou
    st(a.combat - 0.1, 1.1, 82, 49, 290), // de Pyongyang à Koursk
    st(a.mil - 0.1, 0.8, 70, 44, 1150),
    st(a.ir - 0.05, 1.2, 54, 33, 1300),
    st(a.cn - 0.05, 0.9, 98, 35, 620),
    st(a.part - 0.1, 0.6, 80, 34, 420),
    st(a.aucun - 0.1, 0.8, 78, 34, 600, { drift: 0.04 }),
    st(a.res - 0.05, 1.4, 40, 40, 230),
    st(a.six - 0.1, 0.8, 50, 45, 300),
    st(a.stock - 0.15, 1.1, 60, 58, 900, { drift: 0.05 }),
    st(a.forte - 0.1, 1.1, 25, 51, 420),
    st(a.ton - 0.1, 0.6, 25, 48, 560),
    st(a.abo - 0.1, 0.8, 25, 49, 800),
    st(a.fin + 0.5, 0.85, 25, 51, 420, { drift: 0.04 }),
  );
  // départ de chaque vol depuis l'échelle courante : s0 = échelle de la caméra juste avant
  cam = makeCam2(stops);
  for (const Lg of LEGS) Lg.s0 = cam(Lg.t0 - 0.01).s;
  stops.splice(0, stops.length, ...stops.filter(s => !s.lin));
  for (const Lg of LEGS) for (let t = Lg.t0; t <= Lg.t1 + 1e-6; t += 0.12) { const u = prog(t, Lg.t0, Lg.t1 - Lg.t0); const { ll } = legPos(Lg, t); const sc = u < 0.5 ? Math.exp(lerp(Math.log(Lg.s0), Math.log(Lg.sMid), ease(u * 2))) : Math.exp(lerp(Math.log(Lg.sMid), Math.log(Lg.sEnd), ease(u * 2 - 1))); stops.push(st(t, 0.12, ll[0], ll[1] - 110 / sc * 57.3 / 1.6, sc, { lin: true, drift: 0.02 })); }
  cam = makeCam2(stops);
  A.tilt = [[a.b3 - 0.2, a.ca - 0.4, 26], [a.by + 0.8, a.kp - 0.3, 24], [a.b6 - 0.7, a.kz - 0.3, 22], [a.res - 0.2, a.mais8, 24], [a.tf - 0.2, a.voici, 18]];

  // ---- sons et actions
  ev(0, 'whoosh'); ev(a.ru0, 'scan'); ev(a.fr0, 'scan'); ev(a.fr0 - 0.1, 'whoosh'); ev(a.qui, 'boing'); ev(a.tf, 'pop'); ev(a.contre, 'stamp'); ev(a.tr, 'pop'); ev(a.tf - 0.1, 'whoosh'); ev(a.voici, 'jet'); ev(a.voici + 0.15, 'jet'); ev(a.sb, 'pop');
  act(a.tf, 'soldat français', 'agite le drapeau'); act(a.tr, 'soldat russe', 'agite le drapeau'); act(a.voici, 'chasseurs', 'décollent');
  ev(a.otan - 0.05, 'whoosh'); ev(a.otan, 'shine');
  for (const id in CS) { const c = CS[id]; ev(c.t, c.named ? 'scan' : 'tic'); if (c.named) ev(c.t + 0.05, 'pop'); if (c.re) { ev(c.re, 'scan'); } }
  for (const Lg of LEGS) { ev(Lg.t0, 'jet'); act(Lg.t0, Lg.jet, 'vole vers ' + Lg.b); ev(Lg.t1 - 0.15, 'whoosh'); }
  ev(a.n31 - 0.1, 'whoosh'); act(a.n31, 'OTAN', 'vague bleue'); ev(a.neutres, 'stamp'); ev(a.ue, 'sparkle'); ev(a.armee, 'stamp');
  ev(a.tr4, 'stamp'); ev(a.fidele, 'pop'); ev(a.combat, 'draw'); ev(a.combat + 0.4, 'stamp'); act(a.combat, 'flèche', 'de la Corée du Nord vers Koursk');
  ev(a.mil, 'pop'); ev(a.part, 'pop'); act(a.part, 'poignée de main', 'partenaires'); ev(a.aucun, 'stamp'); ev(a.oblige, 'boing'); ev(a.moscou, 'ping'); ev(a.armee + 0.75, 'sparkle'); ev(a.ton + 0.9, 'tic'); act(a.oblige, 'personnage', 'hausse les épaules');
  ev(a.res - 0.1, 'whoosh'); ev(a.n36, 'count'); ev(a.six, 'count'); ev(a.stock - 0.15, 'whoosh'); ev(a.nuc, 'impact'); act(a.nuc, 'panneau nucléaire', 'apparaît');
  ev(a.forte, 'cheer'); ev(a.ton, 'pop'); ev(a.abo, 'pop'); ev(a.abo + 0.1, 'ding'); act(a.forte, 'soldats', 'agitent les drapeaux'); act(a.abo, 'personnage', 'salue');
  window.PREVIEW = [0.8, a.fr0 + 0.5, a.contre + 0.4, a.voici + 0.6, a.otan + 0.5, (a.de + a.it) / 2, a.pl + 0.4, a.n31 + 1.2, a.neutres + 0.4, a.ue + 0.6, (a.b3 + a.ca) / 2, a.us + 0.4, a.armee + 0.4, a.tr4 + 0.2, a.by + 0.5, (a.by + a.kp) / 2 + 0.4, a.combat + 0.8, a.tj + 0.4, a.ir + 0.4, a.aucun + 0.4, a.oblige + 0.3, a.n36 + 0.6, a.nuc + 0.5, a.forte + 0.3, a.abo + 0.4];
}
function tiltAt(t) { let v = 0; for (const [t0, t1, deg] of A.tilt) { if (t < t0 || t > t1 + 1) continue; v = Math.max(v, deg * Math.min(ease((t - t0) / 0.9), 1 - ease((t - t1) / 1))); } return v * Math.PI / 180; }
function angAt(t) { return (8 * Math.sin(2 * Math.PI * t / 13) + 3.5 * Math.sin(2 * Math.PI * t / 7 + 1)) * Math.PI / 180; }

// ============ CALQUE ÉCRAN ============
function soldier(c, team, x, y, h, t, t0, ph = 0) { const pose = Math.floor((t + ph) / 0.32) % 2 ? 'b' : 'a'; sprite(c, `sol_${team}_${pose}`, x, y - (pose === 'b' ? 14 : 0), h * popIn(t, t0, 0.3)); }
function stampText(c, s, x, y, t, t0, t1, o = {}) {
  if (t < t0 || t > t1 + 0.3) return; const sz = o.size || 92; const sc = stampScale(t, t0) * fadeOut(t, t1, 0.3);
  c.save(); c.translate(x, y); c.rotate(o.rot ?? -0.1); c.scale(sc, sc); c.globalAlpha = clamp((t - t0) / 0.08) * fadeOut(t, t1, 0.3);
  const w = measure(c, s, sz, 900) + 60; c.fillStyle = 'rgba(255,255,255,.88)'; rr(c, -w / 2, -sz * 0.7, w, sz * 1.4, 18); c.fill(); c.lineWidth = 10; c.strokeStyle = o.col || '#e01b24'; c.stroke();
  txt(c, s, 0, 4, { size: sz, color: o.col || '#e01b24', weight: 900, shadow: false }); c.restore();
}
function screenScene(c, t) {
  const a = A;
  // accroche
  if (t > a.qui && t < a.tf + 0.2) { const s = popIn(t, a.qui, 0.3) * fadeOut(t, a.tf - 0.1, 0.25); c.save(); c.translate(W / 2, 560); c.scale(s, s); txt(c, '?', 0, 0, { size: 300, weight: 900, color: '#FFE928', stroke: '#1b1300', sw: 18 }); c.restore(); }
  if (t > a.tf - 0.1 && t < a.otan + 0.3) {
    const al = fadeOut(t, a.otan, 0.3); c.save(); c.globalAlpha = al;
    soldier(c, 'fr', 230, 1440, 380, t, a.tf - 0.1, 0); tag(c, 'TEAM FRANCE', 230, 1010, { size: 54, bg: BLUE, border: '#fff', sc: popIn(t, a.tf, 0.3) });
    if (t > a.tr - 0.1) { soldier(c, 'ru', 850, 1440, 380, t, a.tr - 0.1, 0.16); tag(c, 'TEAM RUSSIE', 850, 1010, { size: 54, bg: RED, border: '#fff', sc: popIn(t, a.tr, 0.3) }); }
    if (t > a.contre) { c.save(); c.translate(540, 1200); const s = stampScale(t, a.contre); c.scale(s, s); c.shadowColor = '#ffd23a'; c.shadowBlur = 40; txt(c, 'VS', 0, 0, { size: 200, weight: 900, color: '#FFE928', stroke: '#3a2500', sw: 18, shadow: false }); c.restore(); }
    c.restore();
  }
  // OTAN : bouclier sur la France
  if (t > a.otan - 0.1 && t < a.uk + 0.3) { const p = S(2.3, 47.2); sprite(c, 'shield', p.x + 200, p.y + 120, 260 * popIn(t, a.otan - 0.1, 0.3), { alpha: fadeOut(t, a.uk, 0.3) }); tag(c, 'OTAN', p.x + 200, p.y + 175, { size: 54, bg: BLUE, border: '#fff', sc: popIn(t, a.otan, 0.3) * fadeOut(t, a.uk, 0.3) }); }
  // 31 pays
  if (t > a.n31 && t < a.at - 0.1) counter(c, 31, t, a.n31, a.def - 0.2, W / 2, 470, { size: 120, label: 'PAYS ENGAGÉS', until: a.at - 0.4 });
  stampText(c, 'NEUTRES', W / 2, 560, t, a.neutres, a.ue - 0.1, { col: '#2a9d5c', size: 96 });
  if (t > a.ue - 0.05 && t < a.b3 + 0.2) { const s = popIn(t, a.ue, 0.3) * fadeOut(t, a.b3, 0.25); c.save(); c.translate(W / 2, 520); c.scale(s, s); c.fillStyle = '#003399'; c.beginPath(); c.arc(0, 0, 95, 0, 7); c.fill(); c.lineWidth = 6; c.strokeStyle = '#fff'; c.stroke(); for (let i = 0; i < 12; i++) { const an = i / 12 * Math.PI * 2 + t * 0.6; txt(c, '★', Math.cos(an) * 62, Math.sin(an) * 62, { size: 30, color: '#FFCC00', shadow: false }); } c.restore(); tag(c, 'UNION EUROPÉENNE', W / 2, 650, { size: 46, bg: '#003399', border: '#fff', sc: s }); }
  stampText(c, '1re ARMÉE DU MONDE', W / 2, 560, t, a.armee, a.b4 - 0.15, { col: BLUE, size: 70 });
  // Team Russie
  if (t > a.tr4 - 0.1 && t < a.by + 0.2) { const s = popIn(t, a.tr4, 0.3) * fadeOut(t, a.by, 0.2); tag(c, 'TEAM RUSSIE', W / 2, 470, { size: 70, bg: RED, border: '#fff', sc: s }); }
  if (t > a.fidele && t < a.b5 + 0.1) { tag(c, 'ALLIÉ N°1', W / 2, 480, { size: 64, bg: RED, border: '#fff', sc: popIn(t, a.fidele, 0.3) * fadeOut(t, a.b5 - 0.1, 0.2) }); }
  stampText(c, 'DÉJÀ AU COMBAT', W / 2, 520, t, a.combat + 0.4, a.b6 - 0.1, { col: RED, size: 80 });
  if (t > a.combat - 0.1 && t < a.b6 + 0.6) { // flèche Corée du Nord -> Koursk
    const pr = easeOut(prog(t, a.combat, 0.7)); const al = fadeOut(t, a.b6 + 0.2, 0.3); const pts = []; for (let i = 0; i <= 40; i++) { const ll = d3.geoInterpolate(CAP['408'], [36.2, 51.7])(pr * i / 40); const q = S(ll[0], ll[1]); pts.push(q); }
    c.save(); c.globalAlpha = al; c.beginPath(); pts.forEach((q, i) => i ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y)); c.lineWidth = 9; c.strokeStyle = '#ff3b30'; c.shadowColor = '#ff3b30'; c.shadowBlur = 16; c.setLineDash([22, 14]); c.lineDashOffset = -t * 60; c.stroke(); c.setLineDash([]);
    if (pr > 0.98) { const q = S(36.2, 51.7); c.beginPath(); c.arc(q.x, q.y, 16, 0, 7); c.fillStyle = '#ff3b30'; c.fill(); txt(c, 'KOURSK', q.x, q.y - 40, { size: 44, stroke: '#000', sw: 8 }); }
    c.restore();
  }
  if (t > a.mil && t < a.b7) tag(c, 'ALLIANCE MILITAIRE', W / 2, 480, { size: 56, bg: RED, border: '#fff', sc: popIn(t, a.mil, 0.3) * fadeOut(t, a.b7 - 0.2, 0.2) });
  // Iran / Chine
  if (t > a.part - 0.1 && t < a.aucun + 0.3) sprite(c, 'handshake', W / 2, 1380, 230 * popIn(t, a.part - 0.1, 0.3), { alpha: fadeOut(t, a.aucun, 0.3) });
  if (t > a.aucun - 0.1 && t < a.b8) { sprite(c, 'treaty', 300, 1430, 300 * popIn(t, a.aucun - 0.1, 0.3), { rot: -0.1, alpha: fadeOut(t, a.b8 - 0.3, 0.3) }); }
  stampText(c, 'AUCUN TRAITÉ', W / 2, 540, t, a.aucun + 0.1, a.b8 - 0.15, { col: '#6b7076' });
  if (t > a.oblige - 0.1 && t < a.b8) sprite(c, 'shrug', 790, 1440, 360 * popIn(t, a.oblige - 0.1, 0.3), { alpha: fadeOut(t, a.b8 - 0.3, 0.3), rot: 0.04 * Math.sin(t * 6) });
  // bilan
  if (t > a.n36 - 0.1 && t < a.mais8 + 0.3) { const al = fadeOut(t, a.mais8, 0.3); c.save(); c.globalAlpha = al; counter(c, 36, t, a.n36, a.n36 + 0.7, 280, 880, { suf: ' PAYS', size: 92, color: '#fff' }); if (t > a.six) counter(c, 6, t, a.six, a.six + 0.4, 800, 880, { suf: ' PAYS', size: 92, color: '#fff' }); c.restore(); }
  if (t > a.nuc - 0.15 && t < a.b9 + 0.2) { const p = S(60, 58); const s = popIn(t, a.nuc - 0.15, 0.35) * (1 + 0.05 * Math.sin(t * 7)); const al = fadeOut(t, a.b9, 0.25); c.save(); c.globalAlpha = al; c.shadowColor = '#ffd400'; c.shadowBlur = 50; sprite(c, 'nuke', p.x, p.y + 170, 330 * s, { shadow: false }); c.restore(); stampText(c, 'N°1 MONDIAL', W / 2, 520, t, a.nuc + 0.2, a.b9 - 0.1, { col: RED, size: 86 }); }
  { const p = S(37.62, 55.75); ping(c, p.x, p.y, t, a.moscou, 'MOSCOU', a.b8 + 0.2); }
  if (t > a.armee + 0.7 && t < a.armee + 1.4) { const p = S(-98, 39); const q = (t - a.armee - 0.7) / 0.7; c.save(); c.globalAlpha = 1 - q; for (let i = 0; i < 10; i++) { const an = i / 10 * Math.PI * 2; txt(c, '★', p.x + Math.cos(an) * (60 + 260 * q), p.y + Math.sin(an) * (40 + 170 * q), { size: 44, color: '#fff', shadow: false }); } c.restore(); }
  // fin
  if (t > a.forte - 0.2) {
    soldier(c, 'fr', 210, 1450, 360, t, a.forte - 0.2, 0); soldier(c, 'ru', 870, 1450, 360, t, a.forte - 0.1, 0.16);
    if (t > a.ton - 0.05) { const s = popIn(t, a.ton, 0.3) * (1 + 0.12 * Math.max(0, 1 - Math.abs(t - a.ton - 0.9) / 0.15)); c.save(); c.translate(W / 2, 560); c.scale(s, s); txt(c, 'ET TON PAYS ?', 0, 0, { size: 112, weight: 900, color: '#FFE928', stroke: '#1b1300', sw: 14 }); c.restore(); }
    if (t > a.abo - 0.15) { sprite(c, 'waver', 540, 1470, 320 * popIn(t, a.abo - 0.15, 0.3), { rot: 0.05 * Math.sin(t * 5) }); tag(c, 'ABONNE-TOI', W / 2, 740, { size: 70, bg: '#C00E1F', border: '#fff', sc: stampScale(t, a.abo) }); }
  }
}

// ============ RENDU ============
window.render = function (t) {
  const st = cam(t); cam_s = st.s; ANG = angAt(t); TILT = tiltAt(t);
  P = d3.geoMercator().rotate([-st.lon, 0]).center([0, st.lat]).scale(st.s).translate([540 + OX, CY + OY]).precision(0).clipExtent([[0, 0], [MW, MH]]);
  drawSat(st); drawCountries(t); drawTrails(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#0b3a52'; ctx.fillRect(0, 0, W, H);
  if (TILT < 0.001) { ctx.save(); ctx.translate(540, CY); ctx.rotate(ANG); ctx.translate(-540 - OX, -CY - OY); ctx.drawImage(mapC, 0, 0); ctx.restore(); }
  else {
    rc.setTransform(1, 0, 0, 1, 0, 0); rc.clearRect(0, 0, MW, MH); rc.translate(540 + OX, CY + OY); rc.rotate(ANG); rc.translate(-540 - OX, -CY - OY); rc.drawImage(mapC, 0, 0); rc.setTransform(1, 0, 0, 1, 0, 0);
    const sn = Math.sin(TILT), cs = Math.cos(TILT), band = 6;
    for (let y = 0; y < H; y += band) { const a0 = y - CY, a1 = y + band - CY; const v0 = a0 * FOC / (FOC * cs + a0 * sn), v1 = a1 * FOC / (FOC * cs + a1 * sn); const k = FOC / (FOC - ((v0 + v1) / 2) * sn); const sy = CY + OY + v0; if (sy < 0 || sy + v1 - v0 > MH) continue; ctx.drawImage(rotC, 0, sy, MW, Math.max(1, v1 - v0), 540 - k * (540 + OX), y, MW * k, band + 0.6); }
    const hz = ctx.createLinearGradient(0, 0, 0, 500); hz.addColorStop(0, `rgba(200,225,240,${0.45 * TILT / 0.5})`); hz.addColorStop(1, 'rgba(200,225,240,0)'); ctx.fillStyle = hz; ctx.fillRect(0, 0, W, 500);
  }
  drawPins(ctx, t); drawJets(ctx, t);
  ctx.save(); ctx.globalAlpha = 0.07; ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = ctx.createPattern(GRAIN, 'repeat'); ctx.translate((t * 997) % 256, (t * 613) % 256); ctx.fillRect(-256, -256, W + 512, H + 512); ctx.restore();
  const vg = ctx.createRadialGradient(W / 2, H / 2, 700, W / 2, H / 2, 1250); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.35)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  if (!window.CLEAN) { screenScene(ctx, t); drawScore(ctx, t); drawSubs(ctx, t); }
};

const loadImg = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
window.init = async function () {
  canvas = document.getElementById('c'); ctx = canvas.getContext('2d');
  const [wd, tm] = await Promise.all(['world.json', 'timing.json'].map(u => fetch(u).then(r => r.json())));
  WORLD = wd; WORLD.byId = Object.fromEntries(WORLD.c50.map(c => [c.id, c])); WORDS = tm.words;
  BM = await loadImg('../assets/bm_merc.jpg');
  await Promise.all(Object.values(ISO).map(async k => { FL[k] = await loadImg('flags/' + k + '.svg'); }));
  const names = ['jet_fr', 'jet_ru', 'sol_fr_a', 'sol_fr_b', 'sol_ru_a', 'sol_ru_b', 'shield', 'handshake', 'treaty', 'shrug', 'nuke', 'waver'];
  await Promise.all(names.map(async n => { SPR[n] = await loadImg('spr/' + n + '.png'); }));
  makeGrain(); buildSubs(SCRIPT); setup();
  window.CAM = { dur: DUR, camAt: t => cam(t), angAt, tiltAt };
  window.VISUALS = SUBS.map(x => x.t0); window.DUR = DUR; window.READY = true;
};
