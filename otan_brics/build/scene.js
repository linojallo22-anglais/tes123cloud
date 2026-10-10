// scene.js — Team OTAN vs Team BRICS. window.render(t) déterministe.
const CY = 840, OX = 470, OY = 680, MW = 2020, MH = 3060, FOC = 1400;
const BLUE = '#1f5dff', RED = '#e3121f';
let WORLD, BM, FL = {}, DUR, cam;
const mapC = document.createElement('canvas'); mapC.width = MW; mapC.height = MH; const m = mapC.getContext('2d');
const rotC = document.createElement('canvas'); rotC.width = MW; rotC.height = MH; const rc = rotC.getContext('2d');
let canvas, ctx, P = null, cam_s = 1, ANG = 0, TILT = 0;

const ISO = { '008': 'al', '056': 'be', '100': 'bg', '124': 'ca', '191': 'hr', '203': 'cz', '208': 'dk', '233': 'ee', '246': 'fi', '250': 'fr', '276': 'de', '300': 'gr', '348': 'hu', '352': 'is', '380': 'it', '428': 'lv', '440': 'lt', '442': 'lu', '499': 'me', '528': 'nl', '807': 'mk', '578': 'no', '616': 'pl', '620': 'pt', '642': 'ro', '703': 'sk', '705': 'si', '724': 'es', '752': 'se', '792': 'tr', '826': 'gb', '840': 'us', '076': 'br', '643': 'ru', '356': 'in', '156': 'cn', '710': 'za', '818': 'eg', '231': 'et', '364': 'ir', '784': 'ae', '360': 'id', '112': 'by', '068': 'bo', '192': 'cu', '398': 'kz', '458': 'my', '566': 'ng', '764': 'th', '800': 'ug', '860': 'uz', '704': 'vn', '682': 'sa', '012': 'dz', '036': 'au', '304': 'gl' };
const NAME = { '250': 'FRANCE', '826': 'ROYAUME-UNI', '276': 'ALLEMAGNE', '380': 'ITALIE', '724': 'ESPAGNE', '616': 'POLOGNE', '643': 'RUSSIE', '112': 'BIÉLORUSSIE', '792': 'TURQUIE', '840': 'ÉTATS-UNIS', '124': 'CANADA', '076': 'BRÉSIL', '192': 'CUBA', '068': 'BOLIVIE', '710': 'AFRIQUE DU SUD', '818': 'ÉGYPTE', '231': 'ÉTHIOPIE', '566': 'NIGERIA', '800': 'OUGANDA', '012': 'ALGÉRIE', '156': 'CHINE', '356': 'INDE', '364': 'IRAN', '784': 'ÉMIRATS', '360': 'INDONÉSIE', '398': 'KAZAKHSTAN', '704': 'VIETNAM', '682': 'ARABIE SAOUDITE', '036': 'AUSTRALIE' };
const ANCH = { '250': [2.4, 46.6], '826': [-1.8, 53.2], '276': [10.4, 51.1], '380': [12.6, 42.9], '724': [-3.7, 40.2], '616': [19.3, 52.1], '643': [45, 57], '112': [28, 53.6], '792': [35, 39], '840': [-98, 39], '124': [-105, 58], '076': [-52, -10], '192': [-79, 21.7], '068': [-64.7, -16.8], '710': [24.5, -29.5], '818': [30, 26.6], '231': [39.6, 8.6], '566': [8, 9.6], '800': [32.4, 1.3], '012': [2.6, 28], '156': [104, 35], '356': [79, 22], '364': [54, 32.5], '784': [54.3, 23.9], '360': [113.5, -1.5], '398': [67, 48], '704': [106, 15], '682': [45, 24], '036': [134, -25.5] };

// ---------- caméra (segments adoucis ou linéaires pour suivre un avion) ----------
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

// ---------- fond satellite réel (NASA Blue Marble en Mercator) ----------
const YMAX = Math.log(Math.tan(Math.PI / 4 + 85.0511 * Math.PI / 360));
function drawSat(st) {
  const Wpx = st.s * 2 * Math.PI, cx = 540 + OX, cy = CY + OY;
  const x0 = cx + st.s * ((-180 - st.lon) * Math.PI / 180);
  const y0 = cy - st.s * (YMAX - Math.log(Math.tan(Math.PI / 4 + st.lat * Math.PI / 360)));
  const k = Wpx / BM.width; m.imageSmoothingQuality = 'high';
  m.fillStyle = '#0b3a52'; m.fillRect(0, 0, MW, MH);
  if (st.s > 9000) m.filter = 'blur(2px)';
  for (const off of [-Wpx, 0, Wpx]) {
    const X0 = x0 + off; const dx0 = Math.max(0, X0), dx1 = Math.min(MW, X0 + Wpx), dy0 = Math.max(0, y0), dy1 = Math.min(MH, y0 + Wpx);
    if (dx1 <= dx0 || dy1 <= dy0) continue;
    m.drawImage(BM, (dx0 - X0) / k, (dy0 - y0) / k, (dx1 - dx0) / k, (dy1 - dy0) / k, dx0, dy0, dx1 - dx0, dy1 - dy0);
  }
  m.filter = 'none';
  // couleur de terre naturelle quand l'image devient floue
  const a = clamp((st.s - 1800) / 2500) * 0.82;
  if (a > 0) {
    const y = lat => P([st.lon, lat])[1]; const g = m.createLinearGradient(0, y(70), 0, y(-40));
    const stops = [[70, '#8a8f84'], [58, '#3f5a32'], [48, '#5a7a3c'], [40, '#8f8a55'], [30, '#c7a76a'], [20, '#c9a46a'], [10, '#5f7f3a'], [0, '#3d6b2c'], [-15, '#6f8a45'], [-25, '#b89a62'], [-40, '#7a8a55']];
    const ya = y(70), yb = y(-40); for (const [l, col] of stops) g.addColorStop(clamp((y(l) - ya) / (yb - ya || 1)), col);
    m.save(); m.globalAlpha = a; pathM(WORLD.land); m.fillStyle = g; m.fill(); m.restore();
    if (GRAIN) { m.save(); pathM(WORLD.land); m.clip(); m.globalAlpha = 0.12 * a; m.globalCompositeOperation = 'overlay'; m.fillStyle = m.createPattern(GRAIN, 'repeat'); m.fillRect(0, 0, MW, MH); m.restore(); }
  }
  m.save(); pathM(WORLD.land); m.lineWidth = 1.5; m.strokeStyle = 'rgba(255,255,255,.18)'; m.stroke();
  pathM(WORLD.borders); m.lineWidth = 1.3; m.strokeStyle = 'rgba(255,255,255,.5)'; m.stroke(); m.restore();
}

// ---------- états des pays ----------
let CS = {}; // id -> {t, team:'o'|'b'|'p'|'s'|'a'|'n', named}
let HOOK = {};
function hatch(alpha) { m.save(); m.clip(); m.globalAlpha = alpha; m.strokeStyle = '#fff'; m.lineWidth = 5; m.beginPath(); for (let x = -MH; x < MW; x += 30) { m.moveTo(x, 0); m.lineTo(x + MH, MH); } m.stroke(); m.restore(); }
function drawCountries(t) {
  // accroche : tout le monde s'allume brièvement
  const hO = Math.min(prog(t, HOOK.o, 0.35), 1 - prog(t, HOOK.off, 0.6)), hB = Math.min(prog(t, HOOK.b, 0.35), 1 - prog(t, HOOK.off, 0.6));
  if (hO > 0) for (const id of WORLD.NATO.concat(['304'])) { pathM(geomOf(id)); m.globalAlpha = 0.62 * hO; m.fillStyle = BLUE; m.fill(); m.globalAlpha = 1; }
  if (hB > 0) for (const id of WORLD.BRICS) { pathM(geomOf(id)); m.globalAlpha = 0.66 * hB; m.fillStyle = RED; m.fill(); m.globalAlpha = 1; }
  for (const id in CS) {
    const c = CS[id]; if (t < c.t) continue; const g = geomOf(id); const dt = t - c.t;
    const fl = FL[ISO[id]]; const flagA = c.named ? clamp(dt / 0.25) * (1 - clamp((dt - 1.3) / 0.5)) : clamp(dt / 0.15) * (1 - clamp((dt - 0.35) / 0.3));
    const flash = Math.max(0, 1 - dt / 0.3);
    const teamA = clamp((dt - (c.named ? 1.2 : 0.3)) / 0.5);
    const col = { o: BLUE, b: RED, p: '#ff6b6b', s: '#8b9096', a: '#8b9096', n: null }[c.team];
    const zoomFade = 1 - 0.45 * clamp((cam_s - 2500) / 3000);
    if (col && teamA > 0) { pathM(g); m.globalAlpha = (c.team === 'p' ? 0.55 : c.team === 's' || c.team === 'a' ? 0.45 : 0.68) * teamA * (c.dim ? 0.65 : 1) * zoomFade; m.fillStyle = col; m.fill(); if (c.team === 'p' || c.team === 's' || c.team === 'a') { pathM(g); hatch(0.3 * teamA); } m.globalAlpha = 1; }
    if (flagA > 0 && fl) { const b = d3.geoPath(P).bounds(g); flagFill(m, () => pathM(g), b, fl, 0.9 * flagA * zoomFade, flash, /^(us|gb|cn|ch|es|br|ca|in|kz|za|sa|ae|ir|by|tr|et|eg|cu|bo|au|vn|dz)$/.test(ISO[id]) ? 'slice' : 'stretch'); }
    if (c.pin && t > c.pin && fl) { const d2 = t - c.pin; const fa = clamp(d2 / 0.25) * (1 - clamp((d2 - 1.3) / 0.5)); if (fa > 0) flagFill(m, () => pathM(g), d3.geoPath(P).bounds(g), fl, 0.9 * fa, Math.max(0, 1 - d2 / 0.3), 'slice'); }
    if (dt < 2.5 && (c.named || dt < 0.6)) { pathM(g); m.save(); m.globalAlpha = 1 - dt / 2.5; m.shadowColor = '#fff'; m.shadowBlur = 25; m.lineWidth = 4; m.strokeStyle = '#fff'; m.stroke(); m.restore(); }
  }
  // Turquie : contour rouge pointillé qui pulse (elle a frappé à la porte)
  if (t > A.frappe) { const q = (t - A.frappe) % 0.8 / 0.8; m.save(); pathM(geomOf('792')); m.setLineDash([16, 10]); m.lineDashOffset = -t * 40; m.lineWidth = 6; m.strokeStyle = `rgba(255,40,40,${0.95 * fadeOut(t, A.b3 + 1.5, 0.5)})`; m.shadowColor = RED; m.shadowBlur = 20 * (1 - q); m.stroke(); m.restore(); }
}

// ---------- trajets d'avion ----------
let FLIGHTS = [];
function flightPos(f, t) { const u = ease(prog(t, f.t0, f.t1 - f.t0)); return { ll: d3.geoInterpolate(f.a, f.b)(u), u }; }
function drawTrails(t) {
  for (const f of FLIGHTS) {
    if (t < f.t0 || t > f.t1 + 3) continue; const { u } = flightPos(f, t); const al = fadeOut(t, f.t1 + 2.2, 0.8);
    const pts = []; for (let i = 0; i <= 60; i++) { const v = u * i / 60; pts.push(P(d3.geoInterpolate(f.a, f.b)(v))); }
    m.save(); m.globalAlpha = al; m.beginPath(); pts.forEach((p, i) => i ? m.lineTo(p[0], p[1]) : m.moveTo(p[0], p[1]));
    m.setLineDash([18, 14]); m.lineDashOffset = -t * 60; m.lineWidth = 7; m.strokeStyle = '#F7EF08'; m.shadowColor = '#F7EF08'; m.shadowBlur = 12; m.lineCap = 'round'; m.stroke(); m.restore();
  }
}
function drawPlanes(c, t) {
  for (const f of FLIGHTS) {
    if (t < f.t0 - 0.2 || t > f.t1 + 0.4) continue; const { ll, u } = flightPos(f, t);
    const p = S(ll[0], ll[1]); const q = S(...d3.geoInterpolate(f.a, f.b)(clamp(u + 0.01)));
    const dir = Math.atan2(q.y - p.y, q.x - p.x); const alt = Math.sin(Math.PI * clamp(u)); const sc = 1 + 0.18 * alt;
    const a = Math.min(clamp((t - f.t0 + 0.2) / 0.25), fadeOut(t, f.t1 + 0.1, 0.3));
    c.save(); c.globalAlpha = a;
    c.save(); c.translate(p.x + 30 + 50 * alt, p.y + 40 + 60 * alt); c.rotate(dir + Math.PI / 2); c.filter = 'blur(6px)'; c.globalAlpha = 0.35 * a; drawSpriteRaw(c, 'plane_top', 170 * sc, true); c.restore();
    c.translate(p.x, p.y); c.rotate(dir + Math.PI / 2); drawSpriteRaw(c, 'plane_top', 170 * sc); c.restore();
  }
}
function drawSpriteRaw(c, name, h, shadowOnly) { // centré
  const img = SPR[name];
  if (img) { const w = h * img.width / img.height; if (shadowOnly) { c.filter = 'brightness(0) blur(6px)'; } c.drawImage(img, -w / 2, -h / 2, w, h); c.filter = 'none'; }
  else { c.fillStyle = shadowOnly ? '#000' : '#fff'; c.beginPath(); c.moveTo(0, -h / 2); c.lineTo(h * 0.45, h * 0.1); c.lineTo(0, h * 0.02); c.lineTo(-h * 0.45, h * 0.1); c.closePath(); c.fill(); c.fillRect(-h * 0.06, -h / 2, h * 0.12, h); }
}

// ---------- épingles-drapeaux et étiquettes ----------
function flagPin(c, x, y, img, r) {
  c.save(); c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 10; c.shadowOffsetY = 4;
  c.beginPath(); c.moveTo(x, y); c.lineTo(x - r * 0.55, y - r * 1.25); c.arc(x, y - r * 1.75, r, Math.PI * 0.82, Math.PI * 0.18); c.closePath(); c.fillStyle = '#fff'; c.fill(); c.shadowColor = 'transparent';
  c.save(); c.beginPath(); c.arc(x, y - r * 1.75, r * 0.8, 0, 7); c.clip(); if (img) c.drawImage(img, x - r * 1.07, y - r * 2.55, r * 2.14, r * 1.6); c.restore();
  c.restore();
}
function drawPins(c, t) {
  for (const id in CS) {
    const cs = CS[id]; const tp = cs.named ? cs.t : cs.pin; if (tp == null || t < tp) continue; const a = ANCH[id]; const p = S(a[0], a[1]);
    if (p.x < -60 || p.x > W + 60 || p.y < -60 || p.y > H + 60) continue;
    const r = clamp(22 + Math.log2(cam_s / 300) * 6, 18, 46) * p.k * popIn(t, tp, 0.3);
    flagPin(c, p.x, p.y, FL[ISO[id]], r);
    const cur = t < tp + 2.4; if (cur) { const s = typed(NAME[id], t, tp + 0.05, 0.3); c.save(); c.globalAlpha = fadeOut(t, tp + 2.1, 0.3); txt(c, s, p.x, p.y + 50 * p.k, { size: 62 * Math.max(0.8, p.k), stroke: '#000', sw: 11 }); c.restore(); }
    else if (cam_s > 500) txt(c, NAME[id], p.x, p.y + 30, { size: 30, stroke: '#000', sw: 6, weight: 700 });
  }
}

// ---------- tableau de score ----------
let SCORE = { o: [], b: [], p: [] };
const scoreAt = (k, t) => SCORE[k].filter(x => x <= t).length;
function lastBump(k, t) { const l = SCORE[k].filter(x => x <= t).at(-1); return l == null ? 0 : Math.max(0, 1 - (t - l) / 0.18); }
function drawScore(c, t) {
  if (t < A.sb) return; const big = prog(t, A.total, 0.6) * (1 - prog(t, A.b8 + 0.2, 0.5));
  const a = popIn(t, A.sb, 0.35); const y = lerp(250, 520, big), sc = a * lerp(1, 1.35, big);
  c.save(); c.translate(W / 2, y); c.scale(sc, sc);
  const o = scoreAt('o', t), b = scoreAt('b', t), pp = scoreAt('p', t);
  for (const [side, col, label, val, bump] of [[-1, BLUE, 'TEAM OTAN', o, lastBump('o', t)], [1, RED, 'TEAM BRICS', b, lastBump('b', t)]]) {
    c.save(); c.translate(side * 228, 0); c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 20; c.shadowOffsetY = 6;
    rr(c, -205, -62, 410, 124, 22); c.fillStyle = col; c.fill(); c.shadowColor = 'transparent'; c.lineWidth = 5; c.strokeStyle = '#fff'; c.stroke();
    txt(c, label, -side * 0 - 52, -2, { size: 40, shadow: false, weight: 900 });
    c.save(); c.translate(140, 2); c.scale(1 + 0.35 * bump, 1 + 0.35 * bump); txt(c, String(val), 0, 0, { size: 78, shadow: false, weight: 900, color: '#FFE928', stroke: '#1b1300', sw: 8 }); c.restore();
    c.restore();
  }
  c.save(); c.shadowColor = '#000'; c.shadowBlur = 16; txt(c, 'VS', 0, 0, { size: 58, weight: 900, color: '#fff', stroke: '#000', sw: 10 }); c.restore();
  if (pp > 0) { const s = 1 + 0.3 * lastBump('p', t); c.save(); c.translate(228, 92); c.scale(s, s); tag(c, '+' + pp + ' PARTENAIRE' + (pp > 1 ? 'S' : ''), 0, 0, { size: 30, bg: '#ff6b6b', border: '#fff' }); c.restore(); }
  c.restore();
}

// ============ TIMELINE ============
let A = {};
function setup() {
  const a = A;
  a.otan0 = T(0, 'otan'); a.brics0 = T(0, 'brics'); a.deux = T(0, 'deux'); a.monde = T(0, 'monde'); a.mais0 = T(0, 'mais'); a.eq0 = T(0, 'equipe');
  a.b1 = beatStart(1); a.europe = T(1, 'leurope'); a.fr = T(1, 'france'); a.y49 = T(1, 'mille'); a.uk = T(1, 'royaumeuni'); a.de = T(1, 'lallemagne'); a.it = T(1, 'litalie'); a.es = T(1, 'lespagne'); a.pl = T(1, 'pologne'); a.trente = T(1, 'trente'); a.eurE = TE(1, 'europeens');
  a.ru = T(2, 'russie'); a.by = T(2, 'bielorussie'); a.tr = T(2, 'turquie'); a.dansOtan = T(2, 'lotan'); a.frappe = T(2, 'frappe'); a.porte = T(2, 'porte');
  a.b3 = beatStart(3); a.us = T(3, 'etatsunis'); a.ca = T(3, 'canada'); a.br = T(3, 'bresil'); a.cu = T(3, 'cuba'); a.bo = T(3, 'bolivie');
  a.b4 = beatStart(4); a.aucun = T(4, 'aucun'); a.za = T(4, 'lafrique'); a.eg = T(4, 'legypte'); a.et = T(4, 'lethiopie'); a.ng = T(4, 'nigeria'); a.ug = T(4, 'louganda'); a.dz = T(4, 'lalgerie'); a.dem = T(4, 'demande'); a.choisie = T(4, 'choisie');
  a.b5 = beatStart(5); a.cn = T(5, 'chine'); a.in = T(5, 'linde'); a.ir = T(5, 'liran'); a.ae = T(5, 'emirats'); a.id = T(5, 'lindonesie'); a.cinq = T(5, 'cinq'); a.kz = T(5, 'kazakhstan'); a.vn = T(5, 'vietnam'); a.sa = T(5, 'larabie'); a.inv = T(5, 'invitee'); a.jamais = T(5, 'jamais'); a.oui = T(5, 'oui');
  a.b6 = beatStart(6); a.pers = T(6, 'personne'); a.au = T(6, 'laustralie');
  a.total = T(7, 'total'); a.n32 = T(7, 'trentedeux'); a.mil = T(7, 'milliard'); a.dix = T(7, 'dix'); a.moitie = T(7, 'moitie'); a.hum = T(7, 'lhumanite');
  a.b8 = beatStart(8); a.eq8 = T(8, 'equipe'); a.aucune = T(8, 'aucune'); a.abo = T(8, 'abonnetoi'); a.fin = TE(8, 'suite');
  a.sb = a.eq0 - 0.1; DUR = a.fin + 0.55;
  HOOK = { o: a.otan0 - 0.05, b: a.brics0, off: a.mais0 + 0.3 };

  // ---- pays nommés / vagues
  const named = (id, t, team) => { CS[id] = { t, team, named: true }; };
  named('250', a.fr, 'o'); named('826', a.uk, 'o'); named('276', a.de, 'o'); named('380', a.it, 'o'); named('724', a.es, 'o'); named('616', a.pl, 'o');
  [a.fr, a.uk, a.de, a.it, a.es, a.pl].forEach(x => SCORE.o.push(x));
  const rest = WORLD.NATO.filter(id => !['250', '826', '276', '380', '724', '616', '840', '124'].includes(id)).sort((x, y) => WORLD.cent[x][0] - WORLD.cent[y][0]);
  rest.forEach((id, i) => { const t = a.trente + 0.1 + i * 0.065; CS[id] = { t, team: 'o', named: false }; SCORE.o.push(t); });
  CS['304'] = { t: a.trente + 0.2, team: 'o', named: false, dim: true };
  named('643', a.ru, 'b'); SCORE.b.push(a.ru); named('112', a.by, 'p'); SCORE.p.push(a.by);
  CS['792'].pin = a.tr; // Turquie déjà bleue : drapeau + épingle au moment où on la nomme
  named('840', a.us, 'o'); named('124', a.ca, 'o'); SCORE.o.push(a.us, a.ca);
  named('076', a.br, 'b'); SCORE.b.push(a.br); named('192', a.cu, 'p'); named('068', a.bo, 'p'); SCORE.p.push(a.cu, a.bo);
  named('710', a.za, 'b'); named('818', a.eg, 'b'); named('231', a.et, 'b'); SCORE.b.push(a.za, a.eg, a.et);
  named('566', a.ng, 'p'); named('800', a.ug, 'p'); SCORE.p.push(a.ng, a.ug);
  named('012', a.dz, 'a');
  named('156', a.cn, 'b'); named('356', a.in, 'b'); named('364', a.ir, 'b'); named('784', a.ae, 'b'); named('360', a.id, 'b'); SCORE.b.push(a.cn, a.in, a.ir, a.ae, a.id);
  named('398', a.kz, 'p'); named('704', a.vn, 'p'); SCORE.p.push(a.kz, a.vn);
  ['860', '764', '458'].forEach((id, i) => { const t = a.cinq + 0.15 + i * 0.2; CS[id] = { t, team: 'p', named: false }; SCORE.p.push(t); });
  named('682', a.sa, 's'); named('036', a.au, 'n');

  // ---- vols
  FLIGHTS = [
    { a: [29, 41], b: [-77, 38.9], t0: a.b3 - 0.5, t1: a.us - 0.35, sMid: 300, s0: 2600, s1: 700 },
    { a: [-47.9, -15.8], b: [18, 2], t0: a.b4 - 0.45, t1: a.aucun - 0.15, sMid: 165, s0: 560, s1: 330 },
    { a: [3, 36.7], b: [116.4, 39.9], t0: a.b5 - 0.45, t1: a.cn - 0.3, sMid: 260, s0: 1800, s1: 620 },
    { a: [46.7, 24.7], b: [134, -25], t0: a.b6 - 0.4, t1: a.pers - 0.15, sMid: 330, s0: 1900, s1: 650 },
  ];
  const st = (t, d, lon, lat, s, o = {}) => ({ t, d, lon, lat, s, ...o });
  const stops = [
    st(0, 0, 10, 33, 200, { drift: 0.04 }),
    st(a.brics0 - 0.1, 0.9, -15, 45, 300),
    st(a.monde - 0.1, 1.0, 40, 33, 205),
    st(a.fr - 0.05, 2.45, 2.4, 46.6, 4500),
    st(a.y49 - 0.1, 0.9, 2.4, 46.8, 2700, { drift: 0.04 }),
    st(a.uk - 0.1, 0.8, -2.5, 54, 3200),
    st(a.de - 0.1, 0.7, 10.4, 51.2, 2300),
    st(a.it - 0.1, 0.7, 12.5, 42.6, 3100),
    st(a.es - 0.1, 0.7, -3.7, 40.2, 2300),
    st(a.pl - 0.1, 0.7, 19.4, 52, 3200),
    st(a.trente - 0.1, 1.1, 14, 50, 760),
    st(a.ru - 0.1, 1.1, 52, 56, 430),
    st(a.by - 0.1, 0.8, 28, 53.6, 1700),
    st(a.tr - 0.1, 0.9, 35, 39.2, 2000),
    st(a.frappe - 0.1, 0.8, 33, 40.2, 2900, { drift: 0.04 }),
  ];
  // suivi des avions : une clé toutes les 0,15 s
  for (const f of FLIGHTS) {
    for (let t = f.t0; t <= f.t1 + 1e-6; t += 0.15) { const u = prog(t, f.t0, f.t1 - f.t0); const { ll } = flightPos(f, t); const sc = u < 0.5 ? Math.exp(lerp(Math.log(f.s0), Math.log(f.sMid), ease(u * 2))) : Math.exp(lerp(Math.log(f.sMid), Math.log(f.s1), ease(u * 2 - 1))); stops.push(st(t, 0.15, ll[0], ll[1], sc, { lin: true, drift: 0 })); }
  }
  stops.push(
    st(a.us + 0.05, 0.4, -98, 39.5, 700),
    st(a.ca - 0.1, 0.9, -100, 56, 480),
    st(a.br - 0.1, 1.3, -54, -10, 820),
    st(a.cu - 0.1, 0.9, -70, 3, 560),
    st(a.za - 0.05, 1.5, 25, -29, 3400),
    st(a.eg - 0.1, 1.0, 30, 26.5, 1900),
    st(a.et - 0.1, 0.8, 39.6, 9, 2400),
    st(a.ng - 0.1, 0.9, 20, 6, 900),
    st(a.ug - 0.1, 0.7, 31, 3, 1350),
    st(a.dz - 0.1, 0.9, 3, 28.5, 1300),
    st(a.choisie - 0.1, 0.8, 3, 29, 1900, { drift: 0.04 }),
    st(a.in - 0.1, 0.9, 79, 22, 900),
    st(a.ir - 0.1, 0.8, 54, 32.5, 1300),
    st(a.ae - 0.1, 0.8, 54.3, 24, 3400),
    st(a.id - 0.1, 1.1, 115, -2, 760),
    st(a.cinq - 0.1, 1.0, 88, 30, 380),
    st(a.sa - 0.1, 1.0, 45, 24, 1400),
    st(a.jamais - 0.1, 0.8, 45, 24.5, 2000, { drift: 0.04 }),
    st(a.au - 0.1, 0.8, 134, -26, 900),
    st(a.n32 - 0.1, 1.6, 20, 25, 205),
    st(a.dix - 0.1, 1.0, 55, 25, 270),
    st(a.eq8 - 0.1, 1.0, 10, 30, 230),
    st(a.fin + 0.5, 1.6, 10, 33, 205, { drift: 0.03 }),
  );
  cam = makeCam2(stops);
  A.tilt = [[a.trente - 0.4, a.eurE + 0.3, 24], ...FLIGHTS.map(f => [f.t0 - 0.3, f.t1 - 0.4, 26]), [a.total - 0.2, a.moitie, 24]];

  // ---- sons et actions
  ev(0, 'whoosh'); ev(a.otan0, 'scan'); ev(a.otan0 + 0.05, 'cheer'); ev(a.brics0, 'scan'); ev(a.brics0 - 0.1, 'whoosh'); ev(a.deux, 'whistle'); ev(a.deux + 0.1, 'stamp'); ev(a.monde - 0.1, 'whoosh'); ev(a.mais0, 'pop'); ev(a.sb, 'pop');
  act(a.otan0, 'supporter bleu', 'saute'); act(a.brics0, 'supporter rouge', 'saute'); act(a.deux, 'arbitre', 'siffle le début');
  ev(a.fr - 2.4, 'whoosh'); ev(a.europe, 'ping');
  for (const id in CS) { const c = CS[id]; ev(c.t, c.named ? 'scan' : 'tic'); if (c.pin) { ev(c.pin, 'scan'); act(c.pin, 'Turquie', 'drapeau'); } if (c.named) { ev(c.t + 0.05, 'pop'); act(c.t, NAME[id] || id, 'se remplit de son drapeau'); } }
  ev(a.y49, 'stamp'); ev(a.trente - 0.1, 'whoosh'); act(a.trente, 'Europe', 'vague bleue');
  ev(a.frappe, 'knock'); ev(a.frappe + 0.35, 'knock'); act(a.frappe, 'porte', 'on toque');
  for (const f of FLIGHTS) { ev(f.t0, 'jet'); ev(f.t1 - 0.2, 'whoosh'); act(f.t0, 'avion', 'vole vers le continent suivant'); }
  ev(a.aucun + 0.1, 'stamp'); ev(a.dem, 'pop'); ev(a.choisie + 0.1, 'stamp'); act(a.dem, 'formulaire', 'candidature');
  ev(a.inv, 'pop'); ev(a.jamais + 0.2, 'boing'); act(a.inv, 'enveloppe', 'invitation');
  ev(a.pers, 'stamp'); ev(a.pers + 0.1, 'boing'); act(a.pers, 'kangourou', 'hausse les épaules');
  ev(a.n32 - 0.2, 'whoosh'); ev(a.n32, 'count'); ev(a.mil, 'ding'); ev(a.dix, 'count'); ev(a.hum, 'ding'); ev(a.dix - 0.1, 'whoosh');
  ev(a.eq8 - 0.1, 'whoosh'); ev(a.eq8, 'cheer'); ev(a.abo, 'pop'); ev(a.abo + 0.1, 'ding'); act(a.eq8, 'supporters', 'sautent'); act(a.abo, 'personnage', 'salue');
  window.PREVIEW = [0.9, a.deux + 0.4, a.fr + 0.4, a.y49 + 0.5, a.pl + 0.5, a.trente + 1.2, a.ru + 0.6, a.frappe + 0.5, (FLIGHTS[0].t0 + FLIGHTS[0].t1) / 2, a.ca + 0.6, a.cu + 0.6, a.aucun + 0.5, a.za + 0.6, a.ug + 0.5, a.choisie + 0.6, a.cn + 0.5, a.ae + 0.5, a.cinq + 0.8, a.jamais + 0.6, a.pers + 0.5, a.moitie + 0.6, a.abo + 0.4];
}
function tiltAt(t) { let v = 0; for (const [t0, t1, deg] of A.tilt) { if (t < t0 || t > t1 + 1) continue; v = Math.max(v, deg * Math.min(ease((t - t0) / 0.9), 1 - ease((t - t1) / 1))); } return v * Math.PI / 180; }
function angAt(t) { return (8 * Math.sin(2 * Math.PI * t / 13) + 3.5 * Math.sin(2 * Math.PI * t / 7 + 1)) * Math.PI / 180; }

// ============ CALQUE ÉCRAN ============
function fan(c, team, x, y, h, t, t0, ph = 0, flip = false) { const pose = Math.floor((t + ph) / 0.3) % 2 ? 'b' : 'a'; const jump = pose === 'b' ? 22 : 0; sprite(c, `fan_${team}_${pose}`, x, y - jump, h * popIn(t, t0, 0.3), { flip }); }
function stampText(c, s, x, y, t, t0, t1, o = {}) {
  if (t < t0 || t > t1 + 0.3) return; const sc = stampScale(t, t0) * fadeOut(t, t1, 0.3);
  c.save(); c.translate(x, y); c.rotate(o.rot ?? -0.12); c.scale(sc, sc); c.globalAlpha = clamp((t - t0) / 0.08) * fadeOut(t, t1, 0.3);
  const w = measure(c, s, o.size || 92, 900) + 60; c.lineWidth = 10; c.strokeStyle = o.col || '#e01b24'; rr(c, -w / 2, -(o.size || 92) * 0.7, w, (o.size || 92) * 1.4, 18); c.stroke();
  txt(c, s, 0, 4, { size: o.size || 92, color: o.col || '#e01b24', weight: 900, stroke: '#fff', sw: 6 }); c.restore();
}
function screenScene(c, t) {
  const a = A;
  // accroche : supporters + arbitre + VS
  if (t < a.mais0 + 0.6) {
    const al = fadeOut(t, a.mais0 + 0.2, 0.4); c.save(); c.globalAlpha = al;
    if (t > a.otan0 - 0.1) { fan(c, 'blue', 230, 1430, 360, t, a.otan0 - 0.1, 0); tag(c, 'TEAM OTAN', 230, 1030, { size: 56, bg: BLUE, border: '#fff', sc: popIn(t, a.otan0, 0.3) }); }
    if (t > a.brics0 - 0.1) { fan(c, 'red', 850, 1430, 360, t, a.brics0 - 0.1, 0.15, true); tag(c, 'TEAM BRICS', 850, 1030, { size: 56, bg: RED, border: '#fff', sc: popIn(t, a.brics0, 0.3) }); }
    if (t > a.deux - 0.1) { sprite(c, 'ref_' + (Math.floor((t - a.deux) / 0.35) % 2 ? 'b' : 'a'), 540, 1470, 330 * popIn(t, a.deux - 0.1, 0.3)); c.save(); c.translate(540, 700); const s = stampScale(t, a.deux); c.scale(s, s); c.shadowColor = '#ffd23a'; c.shadowBlur = 40; txt(c, 'VS', 0, 0, { size: 220, weight: 900, color: '#FFE928', stroke: '#3a2500', sw: 18, shadow: false }); c.restore(); }
    c.restore();
  }
  // badge 1949
  if (t > a.y49 && t < a.uk) { const s = popIn(t, a.y49, 0.3) * fadeOut(t, a.uk - 0.2, 0.2); tag(c, 'MEMBRE DEPUIS 1949', W / 2, 470, { size: 52, bg: BLUE, border: '#fff', sc: s }); }
  // 30 pays européens
  if (t > a.trente && t < a.ru) { const s = popIn(t, a.trente, 0.3) * fadeOut(t, a.ru - 0.25, 0.25); counter(c, 30, t, a.trente, a.eurE, W / 2, 480, { size: 120, label: 'PAYS EUROPÉENS' }); }
  // Biélorussie partenaire
  if (t > a.by + 0.3 && t < a.tr) { const p = S(28, 53.6); tag(c, 'PARTENAIRE', p.x, p.y + 130, { size: 40, bg: '#ff6b6b', border: '#fff', sc: popIn(t, a.by + 0.3, 0.3) * fadeOut(t, a.tr - 0.2, 0.2) }); }
  // Turquie : la porte des BRICS
  if (t > a.frappe - 0.15 && t < a.b3 + 0.4) {
    const p = S(39, 40.5); const knock = Math.max(0, Math.sin((t - a.frappe) * 18)) * (t - a.frappe < 0.9 ? 1 : 0);
    sprite(c, 'door', p.x + 140 + knock * 6, p.y + 40, 320 * popIn(t, a.frappe - 0.15, 0.3), { alpha: fadeOut(t, a.b3, 0.3) });
    tag(c, 'BRICS ?', p.x + 140, p.y - 330, { size: 48, bg: RED, border: '#fff', sc: popIn(t, a.porte, 0.3) * fadeOut(t, a.b3, 0.3) });
  }
  // Afrique : aucun pays OTAN
  stampText(c, 'OTAN : 0 PAYS', W / 2, 760, t, a.aucun, a.za - 0.2, { col: BLUE });
  // Algérie
  if (t > a.dem - 0.1 && t < a.b5) { const p = S(2.6, 28); sprite(c, 'form', p.x + 210, p.y + 120, 230 * popIn(t, a.dem - 0.1, 0.3), { rot: 0.08, alpha: fadeOut(t, a.b5 - 0.3, 0.3) }); }
  stampText(c, 'PAS CHOISIE', W / 2, 560, t, a.choisie, a.b5 - 0.15, { col: '#6b7076', size: 84 });
  // Arabie saoudite
  if (t > a.inv - 0.1 && t < a.b6) { const p = S(45, 24); sprite(c, 'envelope', p.x - 230, p.y + 110, 220 * popIn(t, a.inv - 0.1, 0.3), { rot: -0.1 + 0.05 * Math.sin(t * 4), alpha: fadeOut(t, a.b6 - 0.3, 0.3) }); }
  if (t > a.jamais && t < a.b6) { const p = S(45, 24); const s = popIn(t, a.jamais, 0.3) * (1 + 0.05 * Math.sin(t * 6)); c.save(); c.translate(p.x + 150, p.y - 240); c.scale(s, s); txt(c, '?', 0, 0, { size: 230, weight: 900, color: '#fff', stroke: '#6b7076', sw: 16 }); c.restore(); }
  // Océanie
  if (t > a.pers - 0.15 && t < a.total) { const p = S(134, -25.5); const shrug = Math.floor((t - a.pers) / 0.5) % 2; sprite(c, 'kangaroo', p.x + 40, p.y + 210 - shrug * 10, 380 * popIn(t, a.pers - 0.15, 0.3), { alpha: fadeOut(t, a.total - 0.3, 0.3) }); }
  stampText(c, 'PERSONNE', W / 2, 600, t, a.pers + 0.05, a.au + 1.6, { col: '#6b7076' });
  // bilan
  if (t > a.n32 && t < a.b8 + 0.3) {
    const al = fadeOut(t, a.b8, 0.3); c.save(); c.globalAlpha = al;
    counter(c, 32, t, a.n32, a.n32 + 0.7, 280, 760, { suf: ' PAYS', size: 84, color: '#fff' });
    if (t > a.mil) { const s = popIn(t, a.mil, 0.3); tag(c, '≈ 1 MILLIARD', 280, 880, { size: 48, bg: BLUE, border: '#fff', sc: s }); }
    if (t > a.dix) counter(c, 10, t, a.dix, a.dix + 0.5, 800, 760, { suf: ' PAYS', size: 84, color: '#fff' });
    if (t > a.moitie) { const s = popIn(t, a.moitie, 0.3); tag(c, '≈ 1/2 HUMANITÉ', 800, 880, { size: 48, bg: RED, border: '#fff', sc: s }); }
    c.restore();
  }
  // fin
  if (t > a.eq8 - 0.1) {
    fan(c, 'blue', 210, 1450, 340, t, a.eq8 - 0.1, 0); fan(c, 'red', 870, 1450, 340, t, a.eq8, 0.15, true);
    const s = popIn(t, a.eq8, 0.3); c.save(); c.translate(W / 2, 700); c.scale(s, s); txt(c, 'ET TON PAYS ?', 0, 0, { size: 112, weight: 900, color: '#FFE928', stroke: '#1b1300', sw: 14 }); c.restore();
    if (t > a.abo - 0.1) { sprite(c, 'waver', 540, 1460, 330 * popIn(t, a.abo - 0.1, 0.3), { rot: 0.05 * Math.sin(t * 5) }); tag(c, 'ABONNE-TOI', W / 2, 880, { size: 70, bg: '#C00E1F', border: '#fff', sc: stampScale(t, a.abo) }); }
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
  drawPins(ctx, t); drawPlanes(ctx, t);
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
  const names = ['plane_top', 'ref_a', 'ref_b', 'fan_blue_a', 'fan_blue_b', 'fan_red_a', 'fan_red_b', 'envelope', 'door', 'form', 'kangaroo', 'waver'];
  await Promise.all(names.map(async n => { SPR[n] = await loadImg('spr/' + n + '.png'); }));
  Object.assign(SPR_COL, { ref_a: '#222', ref_b: '#222', fan_blue_a: BLUE, fan_blue_b: BLUE, fan_red_a: RED, fan_red_b: RED, envelope: '#d4a017', door: '#8b5a2b', form: '#ddd', kangaroo: '#c68642', waver: '#2c5aa0' });
  Object.assign(SPR_AR, { envelope: 1.3, door: 0.7, form: 0.8, kangaroo: 0.75 });
  makeGrain(); buildSubs(SCRIPT); setup();
  window.CAM = { dur: DUR, camAt: t => cam(t), angAt, tiltAt };
  window.VISUALS = SUBS.map(x => x.t0); window.DUR = DUR; window.READY = true;
};
