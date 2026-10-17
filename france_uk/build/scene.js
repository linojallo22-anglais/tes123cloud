// scene.js — Team France vs Team Royaume-Uni. window.render(t) déterministe.
const CY = 860, OX = 470, OY = 680, MW = 2020, MH = 3060, FOC = 1400;
const BLUE = '#1f5dff', RED = '#e3121f';
let WORLD, BM, FL = {}, DUR, cam;
const mapC = document.createElement('canvas'); mapC.width = MW; mapC.height = MH; const m = mapC.getContext('2d');
const rotC = document.createElement('canvas'); rotC.width = MW; rotC.height = MH; const rc = rotC.getContext('2d');
let canvas, ctx, P = null, cam_s = 1, ANG = 0, TILT = 0;

const ISO = { '040': 'at', '056': 'be', '100': 'bg', '191': 'hr', '196': 'cy', '203': 'cz', '208': 'dk', '233': 'ee', '246': 'fi', '250': 'fr', '276': 'de', '300': 'gr', '348': 'hu', '372': 'ie', '380': 'it', '428': 'lv', '440': 'lt', '442': 'lu', '470': 'mt', '528': 'nl', '616': 'pl', '620': 'pt', '642': 'ro', '703': 'sk', '705': 'si', '724': 'es', '752': 'se', '826': 'gb', '124': 'ca', '036': 'au', '554': 'nz', '840': 'us', '756': 'ch' };
const NAME = { '250': 'FRANCE', '826': 'ROYAUME-UNI', '276': 'ALLEMAGNE', '380': 'ITALIE', '724': 'ESPAGNE', '616': 'POLOGNE', '056': 'BELGIQUE', '528': 'PAYS-BAS', '752': 'SUÈDE', '300': 'GRÈCE', '620': 'PORTUGAL', '372': 'IRLANDE', '124': 'CANADA', '036': 'AUSTRALIE', '554': 'NOUVELLE-ZÉLANDE', '840': 'ÉTATS-UNIS', '756': 'SUISSE' };
const CAP = { '250': [2.35, 48.86], '826': [-0.13, 51.5], '276': [13.4, 52.52], '380': [12.5, 41.9], '724': [-3.7, 40.42], '616': [21.01, 52.23], '056': [4.35, 50.85], '528': [4.9, 52.37], '752': [18.07, 59.33], '300': [23.73, 37.98], '620': [-9.14, 38.72], '372': [-6.26, 53.35], '124': [-75.7, 45.42], '036': [149.13, -35.28], '554': [174.78, -41.29], '840': [-77.04, 38.9], '756': [7.45, 46.95] };
const ANCH = { ...CAP, '250': [2.4, 46.8], '826': [-1.8, 53.2], '276': [10.4, 51.1], '380': [12.6, 42.9], '724': [-3.7, 40.2], '616': [19.3, 52.1], '056': [4.6, 50.6], '528': [5.6, 52.3], '752': [15.5, 62], '300': [22, 39.3], '620': [-8.2, 39.6], '372': [-8, 53.2], '124': [-100, 57], '036': [134, -25], '554': [172.5, -41.5], '840': [-98, 39], '756': [8.2, 46.8] };

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
const TN = 16384, TS = 1024; const TILES = {}; let LOWRES = null;
const gX = lon => (lon + 180) / 360 * TN, gY = lat => TN / 2 - TN / (2 * Math.PI) * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
function tilesFor(st) { // tuiles visibles dans le canevas carte
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
  m.save(); pathM(WORLD.borders); m.lineWidth = 1.6; m.strokeStyle = 'rgba(255,255,255,.62)'; m.stroke(); m.restore();
}

// ---------- pays ----------
let CS = {};
function hatch(alpha) { m.save(); m.clip(); m.globalAlpha = alpha; m.strokeStyle = '#fff'; m.lineWidth = 5; m.beginPath(); for (let x = -MH; x < MW; x += 30) { m.moveTo(x, 0); m.lineTo(x + MH, MH); } m.stroke(); m.restore(); }
const SLICE = /^(us|gb|es|ca|au|nz|ch|pt|gr|se|fi|dk|cy|mt|hr|si|sk|ee|lv|lt)$/;
function drawCountries(t) {
  for (const id in CS) {
    const c = CS[id]; if (t < c.t) continue; const g = geomOf(id); const dt = t - c.t; const fl = FL[ISO[id]];
    let cur = c.re && t > c.re ? t - c.re : dt; const hold = c.named || (c.re && t > c.re) ? 1.6 : 0.4;
    const k = clamp((cur - hold) / 0.6); const fa = clamp(cur / 0.2) * lerp(0.9, c.team === 'g' ? 0.3 : (c.named ? 0.42 : 0.36), k);
    const flash = Math.max(0, 1 - cur / 0.3);
    if (fl) flagFill(m, () => pathM(g), d3.geoPath(P).bounds(g), fl, fa * (c.dim ? 0.7 : 1), flash, SLICE.test(ISO[id]) ? 'slice' : 'stretch');
    const col = { f: '#3b7bff', r: '#ff2d2d', g: '#9aa0a6' }[c.team];
    m.save(); pathM(g); m.lineJoin = 'round'; m.lineWidth = 3.2; m.strokeStyle = col; m.globalAlpha = 0.9 * clamp(dt / 0.4); m.shadowColor = col; m.shadowBlur = 10; m.stroke(); m.restore();
    if (cur < 2.2 && hold > 1) { pathM(g); m.save(); m.globalAlpha = 1 - cur / 2.2; m.shadowColor = '#fff'; m.shadowBlur = 25; m.lineWidth = 4; m.strokeStyle = '#fff'; m.stroke(); m.restore(); }
    if (c.team === 'g' && dt > 1.2) { pathM(g); m.save(); m.globalAlpha = clamp((dt - 1.2) / 0.5) * 0.5; hatch(0.6); m.restore(); }
    if (c.hatchT && t > c.hatchT) { pathM(g); m.save(); m.globalAlpha = clamp((t - c.hatchT) / 0.5) * 0.6; hatch(0.7); m.restore(); }
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
  for (const jet of ['jet_fr', 'jet_uk']) {
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
function flagCard(c, x, y, img, w) { const h = w * 0.75; c.save(); c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 12; c.shadowOffsetY = 4; c.fillStyle = '#fff'; rr(c, x - w / 2 - 5, y - h / 2 - 5, w + 10, h + 10, 6); c.fill(); c.shadowColor = 'transparent'; if (img) c.drawImage(img, x - w / 2, y - h / 2, w, h); c.restore(); }
let NAMED_T = [];
function drawPins(c, t) {
  if (!NAMED_T.length) NAMED_T = Object.values(CS).flatMap(x => [x.named ? x.t : null, x.re ?? null]).filter(x => x != null).sort((a, b) => a - b);
  for (const id in CS) {
    const cs = CS[id]; const t0 = cs.re && t >= cs.re ? cs.re : (cs.named ? cs.t : null); if (t0 == null || t < t0) continue;
    const nxt = NAMED_T.find(x => x > t0 + 0.05); const tEnd = Math.min(t0 + 2.0, nxt != null ? nxt - 0.05 : 1e9); if (t > tEnd + 0.25) continue;
    const a = ANCH[id]; const p = S(a[0], a[1]); const al = fadeOut(t, tEnd, 0.25); const s = popIn(t, t0, 0.3);
    c.save(); c.globalAlpha = al; c.translate(p.x, Math.min(p.y + 175, 1380)); c.scale(s, s); flagCard(c, 0, -60, FL[ISO[id]], 96);
    txt(c, typed(NAME[id], t, t0 + 0.05, 0.3), 0, 34, { size: 66, stroke: '#000', sw: 11 }); c.restore();
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
  for (const [side, col, label, k] of [[-1, BLUE, 'TEAM FRANCE', 'f'], [1, RED, 'TEAM UK', 'r']]) {
    const val = scoreAt(k, t), bump = lastBump(k, t);
    c.save(); c.translate(side * 228, 0); c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 20; c.shadowOffsetY = 6;
    rr(c, -205, -62, 410, 124, 22); c.fillStyle = col; c.fill(); c.shadowColor = 'transparent'; c.lineWidth = 5; c.strokeStyle = '#fff'; c.stroke();
    c.save(); c.beginPath(); c.arc(-160, 0, 30, 0, 7); c.clip(); const img = FL[k === 'f' ? 'fr' : 'gb']; if (img) c.drawImage(img, -200, -30, 80, 60); c.restore(); c.beginPath(); c.arc(-160, 0, 30, 0, 7); c.lineWidth = 4; c.strokeStyle = '#fff'; c.stroke();
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
  a.uk0 = T(0, 'royaumeuni'); a.fr0 = T(0, 'france'); a.qui = T(0, 'qui'); a.tf = T(0, 'team'); a.contre = T(0, 'contre'); a.tr = T(0, 'team', 2); a.voici = T(0, 'voici');
  a.b1 = beatStart(1); a.ue = T(1, 'lunion'); a.de = T(1, 'lallemagne'); a.it = T(1, 'litalie'); a.es = T(1, 'lespagne'); a.pl = T(1, 'pologne'); a.be = T(1, 'belgique'); a.nl = T(1, 'paysbas'); a.se = T(1, 'suede'); a.gr = T(1, 'grece'); a.pt = T(1, 'portugal'); a.n26 = T(1, 'vingtsix'); a.tenus = T(1, 'tenus'); a.aider = TE(1, 'laider');
  a.b2 = beatStart(2); a.ie = T(2, 'lirlande'); a.voisine = T(2, 'voisine');
  a.b3 = beatStart(3); a.tr3 = T(3, 'team'); a.ca = T(3, 'canada'); a.au = T(3, 'laustralie'); a.nz = T(3, 'nouvellezelande'); a.roi = T(3, 'roi'); a.charles = T(3, 'charles'); a.aucun = T(3, 'aucun'); a.oblige = T(3, 'oblige');
  a.b4 = beatStart(4); a.us = T(4, 'etatsunis'); a.hesitent = T(4, 'hesitent'); a.londres = T(4, 'londres'); a.fr4 = T(4, 'france'); a.premier = T(4, 'premier'); a.y1778 = T(4, 'depuis');
  a.b5 = beatStart(5); a.otan = T(5, 'lotan'); a.coupee = T(5, 'coupee');
  a.b6 = beatStart(6); a.ch = T(6, 'suisse'); a.neutre = T(6, 'neutre'); a.regarde = T(6, 'regarde');
  a.b7 = beatStart(7); a.res = T(7, 'resultat'); a.n27 = T(7, 'vingtsept'); a.quatre = T(7, 'quatre'); a.mais8 = T(7, 'mais'); a.pa = T(7, 'deux'); a.seul = T(7, 'seul'); a.nuc = T(7, 'nucleaire'); a.plus = T(7, 'plus'); a.y2026 = T(7, 'depuis'); a.combien = T(7, 'combien');
  a.b8 = beatStart(8); a.gagne = T(8, 'gagne'); a.tf8 = T(8, 'team'); a.tr8 = T(8, 'team', 2); a.comm = T(8, 'commentaire'); a.abo = T(8, 'abonnetoi'); a.fin = TE(8, 'abonnetoi');
  a.sb = a.voici - 0.1; DUR = a.fin + 0.55;

  const C = (id, t, team, o = {}) => { CS[id] = { t, team, named: !!NAME[id] && !o.unnamed, ...o }; };
  C('826', a.uk0, 'r'); C('250', a.fr0, 'f'); SCORE.r.push(a.uk0); SCORE.f.push(a.fr0);
  const named = [['276', a.de], ['380', a.it], ['724', a.es], ['616', a.pl], ['056', a.be], ['528', a.nl], ['752', a.se], ['300', a.gr], ['620', a.pt]];
  named.forEach(([id, t]) => { C(id, t, 'f'); SCORE.f.push(t); });
  const rest = WORLD.EU.filter(id => !['250', '372', ...named.map(x => x[0])].includes(id)).sort((x, y) => WORLD.cent[x][0] - WORLD.cent[y][0]);
  rest.forEach((id, i) => { const t = a.n26 + 0.1 + i * 0.07; C(id, t, 'f', { unnamed: true }); SCORE.f.push(t); });
  C('372', a.ie, 'f'); SCORE.f.push(a.ie);
  CS['826'].re = a.tr3; CS['250'].re = a.fr4;
  [['124', a.ca], ['036', a.au], ['554', a.nz]].forEach(([id, t]) => { C(id, t, 'r', { hatchT: a.aucun }); SCORE.r.push(t); });
  C('840', a.us, 'g'); C('756', a.ch, 'g');

  const L = (jet, from, to, t0, t1, sMid, sEnd) => LEGS.push({ jet, a: CAP[from] || from, b: CAP[to] || to, t0, t1, sMid, sEnd });
  const route = [['250', a.ue + 0.2], ['276', a.de], ['380', a.it], ['724', a.es], ['616', a.pl], ['056', a.be], ['528', a.nl], ['752', a.se], ['300', a.gr], ['620', a.pt]];
  for (let i = 1; i < route.length; i++) { const t0 = i === 1 ? route[0][1] : route[i - 1][1] + 0.1; L('jet_fr', route[i - 1][0], route[i][0], t0, route[i][1], i === 8 ? 950 : 1250, 2100); }
  L('jet_fr', '620', '372', a.aider - 0.2, a.ie, 900, 2000);
  L('jet_uk', '826', '124', a.tr3 + 0.15, a.ca, 330, 700);
  L('jet_uk', '124', '036', a.ca + 0.1, a.au, 230, 420);
  L('jet_uk', '036', '554', a.au + 0.1, a.nz, 520, 900);
  JETVIS = { jet_fr: [a.voici, a.ie + 1.6], jet_uk: [a.voici + 0.15, a.charles + 1.2] };

  const st = (t, d, lon, lat, s, o = {}) => ({ t, d, lon, lat, s, ...o });
  const stops = [
    st(0, 0, -1, 50.5, 1500, { drift: 0.05 }),
    st(a.fr0 - 0.1, 0.9, 1.5, 49.5, 2300),
    st(a.tf - 0.1, 1.0, 0, 50.5, 1600),
    st(a.voici - 0.1, 1.0, 2.3, 48.6, 2600, { drift: 0.04 }),
    st(a.b1 + 0.5, 0.8, 4, 48.5, 1900),
    st(a.n26 + 0.6, 0.7, 11, 50, 1050),
    st(a.voisine + 0.3, 0.9, -4.5, 53, 2600),
    st(a.roi + 0.3, 1.0, 30, 32, 250, { drift: 0.03 }),
    st(a.aucun + 0.2, 0.9, 20, 35, 320),
    st(a.us + 0.2, 1.2, -45, 42, 650),
    st(a.londres + 0.2, 0.8, -38, 45, 760),
    st(a.fr4 + 0.2, 0.8, -32, 44, 640),
    st(a.y1778 + 0.2, 0.8, -40, 43, 760),
    st(a.otan + 0.2, 1.0, -30, 52, 420),
    st(a.coupee + 0.2, 0.7, -18, 53, 560),
    st(a.ch + 0.2, 1.3, 8.2, 46.8, 9000, { drift: 0.02 }),
    st(a.regarde + 0.2, 0.8, 8.2, 46.8, 6500),
    st(a.res + 0.2, 1.2, 4, 50, 950),
    st(a.n27 + 0.4, 0.8, 3, 50.5, 1250),
    st(a.pa + 0.2, 1.0, -2, 50.2, 1700),
    st(a.seul + 0.2, 0.8, 1, 49, 2000),
    st(a.nuc + 0.2, 1.0, 2.3, 47, 2700),
    st(a.y2026 + 0.2, 0.9, 2.3, 46.8, 3500),
    st(a.combien + 0.3, 0.8, 1.5, 47.5, 2600),
    st(a.gagne + 0.2, 1.2, 0, 50, 1500),
    st(a.tr8 + 0.2, 0.8, -1, 51, 1850),
    st(a.abo + 0.1, 0.8, 0, 50, 1400),
    st(a.fin + 0.5, 0.8, 0, 50.5, 1600, { drift: 0.04 }),
  ];
  cam = makeCam2(stops);
  for (const Lg of LEGS) Lg.s0 = cam(Lg.t0 - 0.01).s;
  stops.splice(0, stops.length, ...stops.filter(s => !s.lin));
  for (const Lg of LEGS) for (let t = Lg.t0; t <= Lg.t1 + 1e-6; t += 0.12) { const u = prog(t, Lg.t0, Lg.t1 - Lg.t0); const { ll } = legPos(Lg, t); const sc = u < 0.5 ? Math.exp(lerp(Math.log(Lg.s0), Math.log(Lg.sMid), ease(u * 2))) : Math.exp(lerp(Math.log(Lg.sMid), Math.log(Lg.sEnd), ease(u * 2 - 1))); stops.push(st(t, 0.12, ll[0], ll[1] - 110 / sc * 57.3 / 1.6, sc, { lin: true, drift: 0.02 })); }
  cam = makeCam2(stops);
  A.tilt = [[a.voici - 0.5, a.it, 18], [a.tr3, a.nz, 22], [a.otan - 0.3, a.coupee + 0.5, 18], [a.pa - 0.3, a.seul + 0.5, 16], [a.gagne - 0.3, a.comm, 16]];

  // ---- sons et actions
  ev(0, 'whoosh'); ev(a.uk0, 'scan'); ev(a.fr0, 'scan'); ev(a.fr0 - 0.1, 'whoosh'); ev(a.qui, 'boing'); ev(a.tf, 'pop'); ev(a.contre, 'stamp'); ev(a.tr, 'pop'); ev(a.tf - 0.1, 'whoosh'); ev(a.voici, 'jet'); ev(a.voici + 0.15, 'jet'); ev(a.sb, 'pop');
  act(a.tf, 'soldat français', 'agite le drapeau'); act(a.tr, 'soldat britannique', 'agite le drapeau'); act(a.voici, 'chasseurs', 'décollent');
  ev(a.ue, 'shine'); act(a.ue, 'badge UE', 'apparaît');
  for (const id in CS) { const c = CS[id]; ev(c.t, c.named ? 'scan' : 'tic'); if (c.named) ev(c.t + 0.05, 'pop'); if (c.re) ev(c.re, 'scan'); }
  for (const Lg of LEGS) { ev(Lg.t0, 'jet'); act(Lg.t0, Lg.jet, 'vole'); ev(Lg.t1 - 0.15, 'whoosh'); }
  ev(a.n26 + 0.5, 'whoosh'); act(a.n26, 'Union européenne', 'vague bleue'); ev(a.tenus, 'stamp'); ev(a.voisine, 'boing');
  ev(a.roi, 'shine'); act(a.roi, 'couronne', 'apparaît'); ev(a.aucun, 'stamp'); ev(a.oblige, 'boing'); act(a.oblige, 'personnage', 'hausse les épaules');
  ev(a.us + 0.1, 'pop'); act(a.us, 'oncle Sam', 'hésite'); ev(a.londres, 'draw'); ev(a.fr4, 'draw'); ev(a.y1778, 'pop'); act(a.y1778, 'parchemin', '1778');
  ev(a.otan, 'shine'); ev(a.coupee, 'impact'); act(a.coupee, 'OTAN', 'se déchire'); ev(a.ch - 0.1, 'whoosh'); ev(a.neutre, 'pop'); act(a.neutre, 'jumelles', 'regardent');
  ev(a.res - 0.1, 'whoosh'); ev(a.n27, 'count'); ev(a.quatre, 'count'); ev(a.pa, 'thud'); ev(a.pa + 0.3, 'thud'); act(a.pa, 'porte-avions', 'arrivent'); ev(a.seul, 'thud'); ev(a.nuc, 'impact'); act(a.nuc, 'badge nucléaire', 'apparaît'); ev(a.y2026, 'stamp'); act(a.y2026, 'coffre', 'secret');
  ev(a.gagne, 'cheer'); ev(a.tf8, 'pop'); ev(a.tr8, 'pop'); ev(a.comm, 'pop'); ev(a.abo, 'pop'); ev(a.abo + 0.1, 'ding'); act(a.gagne, 'soldats', 'agitent les drapeaux');
  ev(a.voici + 1.0, 'tic'); ev(a.b1, 'pop'); ev(a.charles, 'pop'); ev(T(4, 'meilleur'), 'pop'); ev(T(4, 'soixantedixhuit'), 'tic'); ev(a.regarde, 'pop'); act(a.regarde, 'Suisse', 'regarde'); act(a.b1, 'Team France', 'annonce');
  window.PREVIEW = [0.8, a.fr0 + 0.4, a.contre + 0.4, a.voici + 0.6, a.ue + 0.5, (a.de + a.it) / 2, a.pl + 0.3, a.se + 0.3, a.pt + 0.3, a.n26 + 1.0, a.tenus + 0.4, a.ie + 0.4, a.voisine + 0.4, (a.tr3 + a.ca) / 2, a.au + 0.2, a.nz + 0.3, a.roi + 0.6, a.aucun + 0.6, a.us + 0.6, a.londres + 0.5, a.fr4 + 0.5, a.y1778 + 0.6, a.otan + 0.5, a.coupee + 0.4, a.neutre + 0.4, a.n27 + 0.5, a.quatre + 0.4, a.pa + 0.6, a.seul + 0.4, a.nuc + 0.5, a.y2026 + 0.6, a.gagne + 0.4, a.tr8 + 0.4, a.abo + 0.4];
}
function tiltAt(t) { let v = 0; for (const [t0, t1, deg] of A.tilt) { if (t < t0 || t > t1 + 1) continue; v = Math.max(v, deg * Math.min(ease((t - t0) / 0.9), 1 - ease((t - t1) / 1))); } return v * Math.PI / 180; }
function angAt(t) { return (8 * Math.sin(2 * Math.PI * t / 13) + 3.5 * Math.sin(2 * Math.PI * t / 7 + 1)) * Math.PI / 180; }

// OTAN sur la carte (avant rotation)
function drawNato(t) {
  const a = A; if (t < a.otan - 0.1 || t > a.ch) return; const al = clamp((t - a.otan + 0.1) / 0.3) * fadeOut(t, a.ch - 0.3, 0.3);
  m.save(); m.globalAlpha = al; for (const id of WORLD.NATO) { const g = geomOf(id); pathM(g); m.fillStyle = 'rgba(70,90,200,.28)'; m.fill(); m.lineWidth = 2.5; m.strokeStyle = '#c9d4ff'; m.stroke(); } m.restore();
}

// ============ CALQUE ÉCRAN ============
function soldier(c, team, x, y, h, t, t0, ph = 0) { const pose = Math.floor((t + ph) / 0.32) % 2 ? 'b' : 'a'; sprite(c, `sol_${team}_${pose}`, x, y - (pose === 'b' ? 14 : 0), h * popIn(t, t0, 0.3)); }
function stampText(c, s, x, y, t, t0, t1, o = {}) {
  if (t < t0 || t > t1 + 0.3) return; const sz = o.size || 92; const sc = stampScale(t, t0) * fadeOut(t, t1, 0.3);
  c.save(); c.translate(x, y); c.rotate(o.rot ?? -0.1); c.scale(sc, sc); c.globalAlpha = clamp((t - t0) / 0.08) * fadeOut(t, t1, 0.3);
  const w = measure(c, s, sz, 900) + 60; c.fillStyle = 'rgba(255,255,255,.88)'; rr(c, -w / 2, -sz * 0.7, w, sz * 1.4, 18); c.fill(); c.lineWidth = 10; c.strokeStyle = o.col || '#e01b24'; c.stroke();
  txt(c, s, 0, 4, { size: sz, color: o.col || '#e01b24', weight: 900, shadow: false }); c.restore();
}
function arrowTo(c, x0, y0, x1, y1, t, t0, t1, col) {
  if (t < t0 || t > t1 + 0.3) return; const p = easeOut(prog(t, t0, 0.4)); const x = lerp(x0, x1, p), y = lerp(y0, y1, p); const cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - 160;
  c.save(); c.globalAlpha = fadeOut(t, t1, 0.3); c.lineWidth = 12; c.lineCap = 'round'; c.strokeStyle = col; c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 10;
  c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(lerp(x0, cx, p), lerp(y0, cy, p), x, y); c.stroke();
  if (p > 0.95) { const an = Math.atan2(y1 - cy, x1 - cx); c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - 40 * Math.cos(an - 0.5), y1 - 40 * Math.sin(an - 0.5)); c.moveTo(x1, y1); c.lineTo(x1 - 40 * Math.cos(an + 0.5), y1 - 40 * Math.sin(an + 0.5)); c.stroke(); }
  c.restore();
}
function screenScene(c, t) {
  const a = A;
  // accroche
  if (t > a.qui && t < a.tf + 0.2) { const s = popIn(t, a.qui, 0.3) * fadeOut(t, a.tf - 0.1, 0.25); c.save(); c.translate(W / 2, 560); c.scale(s, s); txt(c, '?', 0, 0, { size: 300, weight: 900, color: '#FFE928', stroke: '#1b1300', sw: 18 }); c.restore(); }
  if (t > a.tf - 0.1 && t < a.ue + 0.3) {
    const al = fadeOut(t, a.ue, 0.3); c.save(); c.globalAlpha = al;
    soldier(c, 'fr', 230, 1440, 380, t, a.tf - 0.1, 0); tag(c, 'TEAM FRANCE', 230, 1010, { size: 54, bg: BLUE, border: '#fff', sc: popIn(t, a.tf, 0.3) });
    if (t > a.tr - 0.1) { soldier(c, 'uk', 850, 1440, 380, t, a.tr - 0.1, 0.16); tag(c, 'TEAM UK', 850, 1010, { size: 54, bg: RED, border: '#fff', sc: popIn(t, a.tr, 0.3) }); }
    if (t > a.contre) { c.save(); c.translate(540, 1200); const s = stampScale(t, a.contre); c.scale(s, s); c.shadowColor = '#ffd23a'; c.shadowBlur = 40; txt(c, 'VS', 0, 0, { size: 200, weight: 900, color: '#FFE928', stroke: '#3a2500', sw: 18, shadow: false }); c.restore(); }
    c.restore();
  }
  // Union européenne
  if (t > a.ue - 0.1 && t < a.de + 0.3) { const s = popIn(t, a.ue - 0.1, 0.35) * fadeOut(t, a.de, 0.25); c.save(); c.translate(W / 2, 520); c.scale(s, s); c.rotate(t * 0.5); sprite(c, 'eu', 0, 110, 220, { shadow: false }); c.restore(); tag(c, 'UNION EUROPÉENNE', W / 2, 670, { size: 46, bg: '#003399', border: '#fff', sc: s }); }
  if (t > a.n26 && t < a.b2) counter(c, 26, t, a.n26, a.n26 + 1.0, W / 2, 470, { size: 120, label: 'PAYS OBLIGÉS DE L\'AIDER', until: a.b2 - 0.2 });
  stampText(c, 'TRAITÉ DE L\'UE', W / 2, 640, t, a.tenus, a.b2 - 0.1, { col: '#003399', size: 70 });
  stampText(c, 'LA VOISINE !', W / 2, 560, t, a.voisine, a.b3 - 0.1, { col: '#169b62', size: 90 });
  // Commonwealth
  if (t > a.roi - 0.1 && t < a.aucun + 0.2) { const s = popIn(t, a.roi - 0.1, 0.35) * fadeOut(t, a.aucun, 0.2); c.save(); c.translate(W / 2, 560); c.scale(s, s); sprite(c, 'crown', 0, 100, 230, { shadow: false }); c.restore(); tag(c, 'CHARLES III', W / 2, 700, { size: 56, bg: '#7a1fa2', border: '#f5d76e', sc: popIn(t, a.charles, 0.3) * fadeOut(t, a.aucun, 0.2) }); }
  stampText(c, 'AUCUN TRAITÉ', W / 2, 560, t, a.aucun + 0.1, a.b4 - 0.15, { col: '#6b7076' });
  if (t > a.oblige - 0.1 && t < a.b4) sprite(c, 'shrug', 790, 1440, 360 * popIn(t, a.oblige - 0.1, 0.3), { alpha: fadeOut(t, a.b4 - 0.3, 0.3), rot: 0.04 * Math.sin(t * 6) });
  // États-Unis
  if (t > a.us - 0.1 && t < a.b5 + 0.2) { const al = fadeOut(t, a.b5, 0.25); const look = Math.sin(t * 5) * 0.08; c.save(); c.globalAlpha = al; sprite(c, 'uncle', 540, 1440, 380 * popIn(t, a.us - 0.1, 0.3), { rot: look, flip: Math.sin(t * 2.5) > 0 }); c.restore();
    const pL = S(...CAP['826']), pF = S(...CAP['250']); arrowTo(c, 470, 1080, pL.x, pL.y, t, a.londres, a.b5 - 0.1, RED); arrowTo(c, 610, 1080, pF.x, pF.y, t, a.fr4, a.b5 - 0.1, BLUE);
    tag(c, 'ILS HÉSITENT', W / 2, 470, { size: 60, bg: '#fff', color: '#111', sc: popIn(t, a.hesitent, 0.3) * fadeOut(t, a.londres - 0.1, 0.2) });
    if (t > a.y1778 - 0.1) { const s = popIn(t, a.y1778 - 0.1, 0.3); c.save(); c.globalAlpha = al; c.translate(W / 2, 560); c.scale(s, s); sprite(c, 'scroll', 0, 130, 260, { shadow: false }); txt(c, '1778', 0, 0, { size: 90, font: 'Caveat', weight: 700, color: '#4a2a08', shadow: false }); c.restore(); } }
  // OTAN coupée
  if (t > a.otan - 0.1 && t < a.ch) tag(c, 'OTAN', W / 2, 470, { size: 70, bg: '#1d3a8a', border: '#fff', sc: popIn(t, a.otan, 0.3) * fadeOut(t, a.coupee - 0.1, 0.2) });
  if (t > a.coupee - 0.05 && t < a.ch + 0.2) { const p = S(-1.5, 50.3); const k = easeOut(prog(t, a.coupee, 0.35)); const al = fadeOut(t, a.ch, 0.25); c.save(); c.globalAlpha = al; c.lineWidth = 14; c.strokeStyle = '#ff2d2d'; c.shadowColor = '#ff2d2d'; c.shadowBlur = 20; c.lineJoin = 'miter'; c.beginPath(); const y0 = 0, y1 = H * k; for (let y = y0, i = 0; y <= y1; y += 60, i++) { const x = p.x + (i % 2 ? 26 : -26) + (y - p.y) * 0.15; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.restore(); stampText(c, 'COUPÉE EN DEUX', W / 2, 600, t, a.coupee + 0.2, a.ch - 0.1, { size: 80 }); }
  // Suisse
  if (t > a.ch && t < a.b7 + 0.2) { const p = S(8.2, 46.8); const s = popIn(t, a.ch + 0.3, 0.35) * fadeOut(t, a.b7, 0.25); c.save(); c.translate(p.x, p.y - 30 + 8 * Math.sin(t * 4)); c.scale(s, s); sprite(c, 'binoculars', 0, 0, 170); c.restore(); stampText(c, 'NEUTRE', W / 2, 560, t, a.neutre, a.b7 - 0.1, { col: '#6b7076', size: 100 }); }
  // armée
  if (t > a.pa - 0.1 && t < a.nuc + 0.2) { const al = fadeOut(t, a.nuc, 0.25); c.save(); c.globalAlpha = al; for (const [x, t0] of [[180, a.pa], [360, a.pa + 0.3]]) sprite(c, 'carrier_uk', x, 1450, 360 * popIn(t, t0 - 0.05, 0.35), { rot: -0.08 }); if (t > a.seul - 0.1) sprite(c, 'carrier_fr', 860, 1450, 360 * popIn(t, a.seul - 0.1, 0.35), { rot: 0.08 }); c.restore();
    tag(c, '2', 270, 1040, { size: 90, bg: RED, border: '#fff', sc: popIn(t, a.pa + 0.4, 0.3) * al }); if (t > a.seul) tag(c, '1', 860, 1040, { size: 90, bg: BLUE, border: '#fff', sc: popIn(t, a.seul, 0.3) * al }); }
  if (t > a.nuc - 0.15 && t < a.gagne) { const p = S(2.4, 46.8); const s = popIn(t, a.nuc - 0.15, 0.35) * (1 + 0.05 * Math.sin(t * 7)); const al = fadeOut(t, a.gagne - 0.2, 0.25); c.save(); c.globalAlpha = al; c.shadowColor = '#ffd400'; c.shadowBlur = 40;
    if (t < a.y2026) sprite(c, 'nuke', p.x, p.y + 120, 230 * s, { shadow: false }); else sprite(c, 'safe', p.x, p.y + 130, 250 * popIn(t, a.y2026, 0.3), { shadow: false }); c.restore();
    stampText(c, 'FRANCE : PLUS', W / 2, 520, t, a.plus, a.y2026 - 0.1, { col: BLUE, size: 80 }); stampText(c, 'SECRET', W / 2, 520, t, a.y2026 + 0.2, a.gagne - 0.15, { size: 110 }); }
  // fin
  if (t > a.gagne - 0.2) {
    soldier(c, 'fr', 210, 1450, 360, t, a.gagne - 0.2, 0); soldier(c, 'uk', 870, 1450, 360, t, a.gagne - 0.1, 0.16);
    if (t > a.tf8 - 0.05) tag(c, 'TEAM FRANCE', 210, 1030, { size: 50, bg: BLUE, border: '#fff', sc: popIn(t, a.tf8, 0.3) }); if (t > a.tr8 - 0.05) tag(c, 'TEAM UK', 870, 1030, { size: 50, bg: RED, border: '#fff', sc: popIn(t, a.tr8, 0.3) });
    { const s = popIn(t, a.gagne - 0.1, 0.3) * (1 + 0.1 * Math.max(0, 1 - Math.abs(t - a.tf8) / 0.15)); c.save(); c.translate(W / 2, 560); c.scale(s, s); txt(c, 'QUI GAGNE ?', 0, 0, { size: 120, weight: 900, color: '#FFE928', stroke: '#1b1300', sw: 14 }); c.restore(); }
    if (t > a.abo - 0.15) tag(c, 'ABONNE-TOI', W / 2, 740, { size: 70, bg: '#C00E1F', border: '#fff', sc: stampScale(t, a.abo) });
  }
}

// ============ RENDU ============
window.render = function (t) {
  const st = cam(t); cam_s = st.s; ANG = angAt(t); TILT = tiltAt(t);
  P = d3.geoMercator().rotate([-st.lon, 0]).center([0, st.lat]).scale(st.s).translate([540 + OX, CY + OY]).precision(0).clipExtent([[0, 0], [MW, MH]]);
  drawSat(st); drawNato(t); drawCountries(t); drawTrails(t);
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
  LOWRES = await loadImg('../relief/relief_4096.jpg');
  await Promise.all(Object.values(ISO).map(async k => { FL[k] = await loadImg('flags/' + k + '.svg'); }));
  const names = ['jet_fr', 'jet_uk', 'sol_fr_a', 'sol_fr_b', 'sol_uk_a', 'sol_uk_b', 'carrier_uk', 'carrier_fr', 'crown', 'eu', 'uncle', 'shrug', 'scroll', 'binoculars', 'safe', 'nuke'];
  await Promise.all(names.map(async n => { SPR[n] = await loadImg('spr/' + n + '.png'); }));
  makeGrain(); buildSubs(SCRIPT); setup();
  { const need = new Set(); for (let t = 0; t <= DUR; t += 0.1) { const c = cam(t); for (const [tx, ty] of tilesFor(c)) need.add(ty + '_' + tx); } await Promise.all([...need].map(async n => { TILES[n] = await loadImg('../relief/tiles/' + n + '.jpg'); })); window.NTILES = need.size; }
  window.CAM = { dur: DUR, camAt: t => cam(t), angAt, tiltAt };
  window.VISUALS = SUBS.map(x => x.t0); window.DUR = DUR; window.READY = true;
};
