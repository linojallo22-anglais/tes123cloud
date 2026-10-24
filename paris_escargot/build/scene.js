// scene.js — Pourquoi Paris a la forme d'un escargot. Moteur : engine.js (fond de carte maison au niveau de Paris).
const CFG = { jetH: 1.45, teamCol: {}, trail: { jet_fr: '#F7EF08' }, NAME: {}, ANCH: {}, sides: [], sprites: ['jet_fr', 'louvre', 'eiffel', 'arc', 'opera', 'notredame', 'sacrecoeur', 'snail', 'rings', 'bourgeois', 'ball', 'skull', 'train', 'coins', 'scroll', 'qmark', 'guy_point', 'guy_think', 'stamp'], extraFlags: ['fr'] };
const ORD = ['premier', 'deuxieme', 'troisieme', 'quatrieme', 'cinquieme', 'sixieme', 'septieme', 'huitieme', 'neuvieme', 'dixieme', 'onzieme', 'douzieme', 'treizieme', 'quatorzieme', 'quinzieme', 'seizieme', 'dixseptieme', 'dixhuitieme', 'dixneuvieme', 'vingtieme'];
// [nom affiché, sprite, [lon, lat] du lieu ou null]
const PLACES = [
  ['LE LOUVRE', 'louvre', [2.3376, 48.8606]], ['LA BOURSE', 'coins', [2.3412, 48.869]], ['LE MARAIS', null, null], ['NOTRE-DAME', 'notredame', [2.3499, 48.853]], ['LE PANTHÉON', null, [2.3464, 48.8462]],
  ['SAINT-GERMAIN-DES-PRÉS', null, null], ['LA TOUR EIFFEL', 'eiffel', [2.2945, 48.8584]], ['LES CHAMPS-ÉLYSÉES', 'arc', [2.295, 48.8738]], ["L'OPÉRA", 'opera', [2.3316, 48.872]], ['LA GARE DU NORD', 'train', [2.3553, 48.8809]],
  ['OBERKAMPF', null, null], ['BERCY', null, null], ['LA BIBLIOTHÈQUE NATIONALE', null, null], ['LES CATACOMBES', 'skull', [2.3324, 48.8339]], ['LE PLUS PEUPLÉ', null, null],
  ['LE PARC DES PRINCES', 'ball', [2.253, 48.8414]], ['LES BATIGNOLLES', null, null], ['MONTMARTRE', 'sacrecoeur', [2.3431, 48.8867]], ['LA VILLETTE', null, null], ['LE PÈRE-LACHAISE', null, null],
];
let PA = null, ARR = [], PB = null;
const COLS = ['#2b6cff', '#e3342f'];

// ---------- fond : relief au loin, carte « papier » propre au niveau de Paris ----------
const _drawSat = drawSat;
drawSat = function (st) {
  const k = clamp((Math.log(st.s) - Math.log(14000)) / (Math.log(60000) - Math.log(14000)));
  if (k < 1) _drawSat(st);
  if (k > 0) {
    m.save(); m.globalAlpha = k; m.fillStyle = '#e8e3d2'; m.fillRect(0, 0, MW, MH);
    m.globalAlpha = k * 0.12; m.fillStyle = m.createPattern(GRAIN, 'repeat'); m.fillRect(0, 0, MW, MH); m.globalAlpha = k;
    // petite grille de rues stylisée (ancrée sur la carte)
    m.strokeStyle = 'rgba(160,150,120,.18)'; m.lineWidth = 2; m.beginPath();
    for (let lon = 2.2; lon <= 2.5; lon += 0.006) { const a = P([lon, 48.79]), b = P([lon, 48.93]); m.moveTo(a[0], a[1]); m.lineTo(b[0], b[1]); }
    for (let lat = 48.79; lat <= 48.93; lat += 0.004) { const a = P([2.2, lat]), b = P([2.5, lat]); m.moveTo(a[0], a[1]); m.lineTo(b[0], b[1]); }
    m.stroke();
    // la Seine
    const w = clamp(st.s * 3.6e-5, 5, 45);
    m.beginPath(); d3.geoPath(P, m)(PA.seine); m.lineCap = 'round'; m.lineJoin = 'round'; m.lineWidth = w + 8; m.strokeStyle = '#5fa8cf'; m.stroke(); m.lineWidth = w; m.strokeStyle = '#8fd0ee'; m.stroke();
    m.restore();
  }
};

function setup() {
  const a = A; A.sb = 1e9; PA = WORLD.paris;
  const proj1 = d3.geoMercator().scale(1).translate([0, 0]);
  ARR = PA.arr.map((r, i) => {
    const b = d3.geoPath(proj1).bounds(r.g); const dim = Math.max(b[1][0] - b[0][0], (b[1][1] - b[0][1]) * 0.85);
    return { ...r, c: d3.geoCentroid(r.g), s: clamp(470 / dim, 240000, 1000000), place: PLACES[i] };
  });
  PB = { type: 'MultiPolygon', coordinates: ARR.flatMap(r => r.g.type === 'MultiPolygon' ? r.g.coordinates : [r.g.coordinates]) };
  const W0 = WORDS.filter(x => x.b === 0);
  ARR.forEach((r, i) => { const k = W0.findIndex(x => norm(x.w).startsWith(ORD[i])); r.t = W0[k].t0; let j = k + 1; if (norm(W0[j].w).startsWith('arrondissement')) j++; r.tp = W0[j].t0; });
  ARR.forEach((r, i) => { r.next = i < 19 ? ARR[i + 1].t : beatStart(1); });
  a.b1 = beatStart(1); a.forme = T(1, 'forme'); a.escargot = T(1, 'escargot'); a.pourquoi = T(1, 'pourquoi');
  a.b2 = beatStart(2); a.y1860 = T(2, 'mille'); a.douze = T(2, 'douze'); a.marier = T(2, 'marier'); a.sans = T(2, 'sans'); a.passy = T(2, 'passy'); a.riches = T(2, 'riches'); a.refusent = T(2, 'refusent'); a.spirale = T(2, 'spirale'); a.part = T(2, 'part'); a.bout = T(2, 'bout');
  a.b3 = beatStart(3); a.toi = T(3, 'toi'); a.arrq = T(3, 'arrondissement'); a.comm = T(3, 'commentaire'); a.abo = T(3, 'abonnetoi'); a.fin = TE(3, 'abonnetoi');
  DUR = a.fin + 0.6; a.big = [];

  // ---- le Rafale vole d'arrondissement en arrondissement
  for (let i = 1; i < 20; i++) { const p = ARR[i - 1], r = ARR[i]; LEGS.push({ jet: 'jet_fr', a: p.c, b: r.c, t0: r.t - 0.85, t1: r.t + 0.05, sMid: Math.min(p.s, r.s) * 0.55, sEnd: r.s }); }
  JETVIS = { jet_fr: [[0.9, a.b1 - 0.1]] };

  // ---- caméra
  const sAll = 300000, cP = [2.343, 48.857];
  const stops = [st(0, 0, 2.5, 47.6, 2400, { drift: 0.05 }), st(ARR[0].t + 1.05, 1.0, ARR[0].c[0], ARR[0].c[1] - 0.002, ARR[0].s, { drift: 0.04 })];
  ARR.forEach((r, i) => { stops.push(st(r.tp + 0.45, 0.6, r.c[0] + 0.0015, r.c[1] - 0.0015, r.s * 1.18, { drift: 0.03 })); });
  stops.push(st(a.b1 + 0.6, 1.1, cP[0], cP[1] - 0.004, sAll, { drift: 0.02 }));
  stops.push(st(a.escargot + 0.3, 0.8, cP[0], cP[1] - 0.006, sAll * 1.12));
  stops.push(st(a.y1860 + 0.3, 0.9, cP[0] - 0.01, cP[1] - 0.003, sAll * 0.95));
  stops.push(st(a.douze + 0.3, 0.7, cP[0] + 0.008, cP[1] - 0.002, sAll * 1.08));
  stops.push(st(a.marier + 0.2, 0.9, cP[0], cP[1] - 0.008, sAll * 1.15));
  stops.push(st(a.sans + 0.2, 0.7, cP[0] + 0.006, cP[1] - 0.006, sAll * 1.02));
  stops.push(st(a.passy + 0.3, 1.0, ARR[15].c[0] + 0.012, ARR[15].c[1] - 0.004, ARR[15].s * 0.8));
  stops.push(st(a.riches + 0.2, 0.6, ARR[15].c[0] + 0.014, ARR[15].c[1] - 0.005, ARR[15].s * 0.7));
  stops.push(st(a.refusent + 0.2, 0.7, ARR[15].c[0] + 0.01, ARR[15].c[1] - 0.006, ARR[15].s * 0.95));
  stops.push(st(a.spirale + 0.3, 1.0, cP[0], cP[1] - 0.004, sAll));
  stops.push(st(a.bout + 0.3, 0.9, cP[0] + 0.01, cP[1] - 0.008, sAll * 1.12));
  stops.push(st(a.toi + 0.2, 0.9, cP[0], cP[1] - 0.006, sAll * 0.92));
  stops.push(st(a.comm + 0.2, 0.8, cP[0] + 0.004, cP[1] - 0.004, sAll * 1.06));
  stops.push(st(a.fin + 0.5, 0.8, cP[0], cP[1] - 0.005, sAll * 0.98, { drift: 0.03 }));
  buildCam(stops);
  A.tilt = [[ARR[3].t - 0.3, ARR[5].t, 14], [ARR[9].t - 0.3, ARR[11].t, 14], [ARR[15].t - 0.3, ARR[17].t, 14], [a.b1 - 0.2, a.pourquoi, 18]];

  // ---- sons et actions
  ev(0, 'whoosh'); ev(0.3, 'whoosh');
  ARR.forEach((r, i) => { if (i > 0) { ev(r.t - 0.85, 'jet'); act(r.t - 0.85, 'Rafale', 'vole vers le ' + (i + 1) + 'e'); ev(r.t - 0.1, 'whoosh'); } ev(r.t, 'scan'); act(r.t, (i + 1) + 'e arrondissement', 's\'allume'); ev(r.t + 0.05, 'pop'); ev(r.tp, r.place[1] ? 'thud' : 'stamp'); act(r.tp, r.place[0], 'apparaît'); ev(r.tp + 0.25, 'ding'); });
  ev(a.b1 - 0.2, 'whoosh'); ev(a.forme, 'draw'); act(a.forme, 'spirale', 'se dessine'); ev(a.escargot, 'boing'); act(a.escargot, 'escargot', 'apparaît'); ev(a.escargot + 0.3, 'sparkle'); ev(a.pourquoi, 'pop');
  ev(a.y1860, 'photo'); act(a.y1860, 'parchemin', '1860'); ev(a.douze, 'count'); act(a.douze, 'compteur', '12 → 20'); ev(a.marier, 'ding'); act(a.marier, 'alliances', 'apparaissent'); ev(a.sans, 'boing');
  ev(a.passy - 0.3, 'whoosh'); ev(a.passy, 'scan'); act(a.passy, 'Passy', '13 ?'); ev(a.riches, 'pop'); act(a.riches, 'bourgeois', 'fâché'); ev(a.refusent, 'stamp');
  ev(a.spirale, 'draw'); act(a.spirale, 'numéros', 'en spirale'); ARR.forEach((r, i) => ev(a.spirale + 0.1 + i * 0.05, 'tic')); ev(a.part, 'whoosh'); act(a.part, '13', 'traverse Paris'); ev(a.bout, 'thud'); ev(a.bout + 0.1, 'ding');
  ev(a.toi, 'boing'); act(a.toi, 'personnage', 'réfléchit'); ev(a.comm, 'pop'); act(a.comm, 'personnage', 'montre'); ev(a.abo, 'pop'); ev(a.abo + 0.1, 'ding');
  for (const x of [a.escargot + 1.0, a.y1860 + 1.0, a.douze + 0.9, a.sans + 0.7, a.riches + 0.6, a.refusent + 0.7, a.bout + 0.7, a.arrq + 0.5, a.comm + 0.6]) ev(x, 'tic');
  window.PREVIEW = ARR.filter((r, i) => i % 3 === 0 || i === 19).map(r => r.tp + 0.5).concat([ARR[1].t - 0.4, a.forme + 0.6, a.escargot + 0.4, a.y1860 + 0.4, a.douze + 0.5, a.marier + 0.4, a.passy + 0.5, a.riches + 0.4, a.refusent + 0.3, a.spirale + 0.5, a.bout + 0.3, a.toi + 0.4, a.abo + 0.3]);
}

// ---------- carte ----------
function curArr(t) { let k = -1; ARR.forEach((r, i) => { if (t >= r.t - 0.05) k = i; }); return t < A.b1 - 0.2 ? k : -1; }
function spiralPts(u) { const pts = ARR.map(r => P(r.c)); const n = (pts.length - 1) * u; const out = []; for (let i = 0; i <= Math.floor(n); i++) out.push(pts[i]); const f = n - Math.floor(n); if (f > 0 && Math.floor(n) + 1 < pts.length) { const p = pts[Math.floor(n)], q = pts[Math.floor(n) + 1]; out.push([lerp(p[0], q[0], f), lerp(p[1], q[1], f)]); } return out; }
function mapOver(t) {
  const a = A; const k = curArr(t); const bP = d3.geoPath(P).bounds(PB); const after = t > a.b1 - 0.2;
  flagFill(m, () => { m.beginPath(); d3.geoPath(P, m)(PB); }, bP, FL.fr, after ? 0.8 : 0.38, 0, 'stretch');
  ARR.forEach((r, i) => {
    if (after || t < r.t - 0.05) return; const cur = i === k; const age = t - r.t;
    flagFill(m, () => { m.beginPath(); d3.geoPath(P, m)(r.g); }, bP, FL.fr, cur ? 0.97 : 0.72, cur ? Math.max(0, 1 - age / 0.35) : 0, 'stretch');
  });
  // contours
  m.save(); m.lineJoin = 'round'; for (const r of ARR) { m.beginPath(); d3.geoPath(P, m)(r.g); m.lineWidth = 3; m.strokeStyle = 'rgba(255,255,255,.9)'; m.stroke(); } m.restore();
  m.save(); m.beginPath(); d3.geoPath(P, m)(PB); m.lineWidth = 7; m.strokeStyle = '#fff'; m.shadowColor = '#1f5dff'; m.shadowBlur = 22; m.stroke(); m.restore();
  if (k >= 0) { const r = ARR[k]; m.save(); m.beginPath(); d3.geoPath(P, m)(r.g); m.lineWidth = 9; m.lineJoin = 'round'; m.strokeStyle = '#fff'; m.shadowColor = '#FFE928'; m.shadowBlur = 30; m.stroke(); m.restore(); }
  // Passy, le 13e refusé
  if (t > a.passy - 0.1 && t < a.spirale + 0.3) { const al = clamp((t - a.passy + 0.1) / 0.3) * fadeOut(t, a.spirale, 0.3); m.save(); m.globalAlpha = al; m.beginPath(); d3.geoPath(P, m)(ARR[15].g); m.fillStyle = `rgba(230,30,40,${0.35 + 0.12 * Math.sin(t * 8)})`; m.fill(); m.lineWidth = 9; m.setLineDash([22, 14]); m.lineDashOffset = t * 50; m.strokeStyle = '#ff2d2d'; m.stroke(); m.restore(); }
  if (t > a.bout - 0.1 && t < a.b3 + 0.5) { const al = clamp((t - a.bout + 0.1) / 0.3) * fadeOut(t, a.b3 + 0.2, 0.3); m.save(); m.globalAlpha = al; m.beginPath(); d3.geoPath(P, m)(ARR[12].g); m.fillStyle = 'rgba(255,233,40,.45)'; m.fill(); m.lineWidth = 8; m.strokeStyle = '#FFE928'; m.shadowColor = '#FFE928'; m.shadowBlur = 24; m.stroke(); m.restore(); }
  // la spirale
  const sp = (t > a.forme - 0.1 && t < a.y1860) ? [a.forme - 0.1, a.y1860] : (t > a.spirale - 0.1 && t < a.toi) ? [a.spirale - 0.1, a.toi] : null;
  if (sp) { const u = easeOut(prog(t, sp[0], 1.3)); const al = fadeOut(t, sp[1] - 0.3, 0.3); const pts = spiralPts(u); m.save(); m.globalAlpha = al; m.lineCap = 'round'; m.lineJoin = 'round'; m.beginPath(); pts.forEach((p, i) => i ? m.lineTo(p[0], p[1]) : m.moveTo(p[0], p[1])); m.lineWidth = 22; m.strokeStyle = 'rgba(40,25,0,.55)'; m.stroke(); m.lineWidth = 13; m.strokeStyle = '#FFE928'; m.shadowColor = '#FFE928'; m.shadowBlur = 26; m.stroke(); m.restore(); }
}

// ---------- calque écran ----------
const ordLabel = i => i === 0 ? '1ER' : (i + 1) + 'E';
function screenScene(c, t) {
  const a = A; const k = curArr(t);
  // numéros des arrondissements déjà vus (la spirale se construit)
  ARR.forEach((r, i) => {
    const show = (k >= 0 && i < k) || (t > a.forme - 0.1 && t < a.y1860) || (t > a.spirale && t > a.spirale + i * 0.05);
    if (!show || (k === i)) return; const p = S(...r.c); txt(c, String(i + 1), p.x, p.y, { size: 46, weight: 900, color: '#fff', stroke: '#0b1a4a', sw: 9 });
  });
  if (k >= 0) {
    const r = ARR[k]; const p = S(...r.c); const out = fadeOut(t, r.next - 0.15, 0.2); const pl = r.place;
    // grand numéro sur l'arrondissement
    { const s = stampScale(t, r.t) * out; c.save(); c.translate(p.x, p.y); c.scale(s, s); txt(c, ordLabel(k), 0, 0, { size: 120, weight: 900, color: '#FFE928', stroke: '#1b1300', sw: 14 }); c.restore(); }
    // nom du lieu (carte en haut)
    if (t > r.tp - 0.05) { const name = pl[0], sz = name.length > 20 ? 58 : name.length > 13 ? 70 : 84; const s = stampScale(t, r.tp) * out; c.save(); c.translate(W / 2, 470); c.scale(s, s); c.rotate(-0.03); const w = measure(c, name, sz, 900) + 70; c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 24; c.shadowOffsetY = 8; rr(c, -w / 2, -sz * 0.75, w, sz * 1.5, 24); c.fillStyle = '#fff'; c.fill(); c.shadowColor = 'transparent'; c.lineWidth = 8; c.strokeStyle = COLS[k % 2]; c.stroke(); txt(c, name, 0, 4, { size: sz, weight: 900, color: COLS[k % 2], shadow: false }); c.restore(); }
    tag(c, ordLabel(k) + ' ARRONDISSEMENT', W / 2, 330, { size: 46, bg: '#1f5dff', border: '#fff', sc: popIn(t, r.t, 0.3) * out });
    if (k === 14 && t > r.tp + 0.4) tag(c, 'N°1 EN HABITANTS', W / 2, 600, { size: 54, bg: '#FFE928', color: '#111', border: '#111', sc: stampScale(t, r.tp + 0.4) * out, rot: 0.04 });
    // monument qui tombe sur son vrai lieu
    if (pl[1] && t > r.tp - 0.1) { const q = S(...(pl[2] || r.c)); const h = pl[1] === 'eiffel' ? 270 : pl[1] === 'ball' || pl[1] === 'coins' || pl[1] === 'skull' ? 170 : 240; const qy = Math.max(q.y, 820 + (pl[1] === 'eiffel' ? 40 : 0)); const y = lerp(qy - 600, qy, easeIn(prog(t, r.tp - 0.1, 0.32))); const sq = Math.max(0, 1 - Math.abs(t - r.tp - 0.22) / 0.1); c.save(); c.globalAlpha = out; sprite(c, pl[1], q.x + (qy !== q.y ? 190 : 0), y + 5 * Math.sin(t * 4), h, { sx: 1 + 0.15 * sq, sy: 1 - 0.15 * sq }); c.restore(); }
    // compteur
    { const b = Math.max(0, 1 - (t - r.t) / 0.2); c.save(); c.translate(W - 120, 330); c.scale(1 + 0.3 * b, 1 + 0.3 * b); c.beginPath(); c.arc(0, 0, 62, 0, 7); c.fillStyle = '#111'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#FFE928'; c.stroke(); txt(c, (k + 1) + '/20', 0, 3, { size: 40, weight: 900, color: '#FFE928', shadow: false }); c.restore(); }
  }
  // l'escargot
  if (t > a.escargot - 0.1 && t < a.y1860) { const al = fadeOut(t, a.y1860 - 0.25, 0.25); const s = popIn(t, a.escargot - 0.1, 0.4) * (1 + 0.05 * Math.sin(t * 6)); c.save(); c.globalAlpha = al; c.translate(W / 2, 1380); c.scale(s, s); sprite(c, 'snail', 0, 0, 330, { shadow: false }); c.restore(); }
  if (t > a.forme - 0.1 && t < a.y1860) tag(c, 'UN ESCARGOT ?!', W / 2, 400, { size: 70, bg: '#FFE928', color: '#111', border: '#111', sc: popIn(t, a.escargot, 0.3) * fadeOut(t, a.y1860 - 0.2, 0.2), rot: -0.04 });
  if (t > a.pourquoi - 0.1 && t < a.y1860) sprite(c, 'qmark', 880, 1250, 240 * popIn(t, a.pourquoi - 0.1, 0.3), { shadow: false, rot: 0.1 * Math.sin(t * 5) });
  // 1860 : de 12 à 20
  if (t > a.y1860 - 0.1 && t < a.marier) { const al = fadeOut(t, a.marier - 0.25, 0.25); const s = popIn(t, a.y1860 - 0.1, 0.35); c.save(); c.globalAlpha = al; c.translate(290, 1250); c.scale(s, s); c.rotate(-0.06); sprite(c, 'scroll', 0, 130, 260, { shadow: false }); txt(c, '1860', 0, 0, { size: 90, font: 'Caveat', weight: 700, color: '#4a2a08', shadow: false }); c.restore();
    if (t > a.douze - 0.1) { const v = Math.round(12 + 8 * easeOut(prog(t, a.douze + 0.2, 0.7))); const b = t > a.douze + 0.9 ? Math.max(0, 1 - (t - a.douze - 0.9) / 0.2) : 0; c.save(); c.globalAlpha = al; c.translate(W / 2, 470); c.scale(popIn(t, a.douze - 0.1, 0.3) * (1 + 0.3 * b), popIn(t, a.douze - 0.1, 0.3) * (1 + 0.3 * b)); txt(c, v + ' ARRONDISSEMENTS', 0, 0, { size: 76, weight: 900, color: '#FFE928', stroke: '#1b1300', sw: 12 }); c.restore(); } }
  // se marier au 13e
  if (t > a.marier - 0.1 && t < a.passy) { const al = fadeOut(t, a.passy - 0.25, 0.25); const s = popIn(t, a.marier - 0.1, 0.35) * al; c.save(); c.translate(W / 2, 1260); c.scale(s, s); sprite(c, 'rings', 0, 0, 200, { shadow: false, rot: 0.08 * Math.sin(t * 4) }); c.restore(); tag(c, '« SE MARIER AU 13E »', W / 2, 470, { size: 58, bg: '#fff', color: '#c2185b', border: '#c2185b', sc: s }); }
  stampText(c, 'PAS MARIÉS !', W / 2, 620, t, a.sans + 0.2, a.passy - 0.15, { size: 84, col: '#c2185b' });
  // Passy refuse
  if (t > a.passy - 0.1 && t < a.spirale) { const al = fadeOut(t, a.spirale - 0.25, 0.25); const p = S(...ARR[15].c); { const s = stampScale(t, a.passy) * al; c.save(); c.translate(p.x, p.y); c.scale(s, s); txt(c, '13 ?', 0, 0, { size: 140, weight: 900, color: '#fff', stroke: '#8a0000', sw: 16 }); c.restore(); } tag(c, 'PASSY', W / 2, 470, { size: 70, bg: '#C00E1F', border: '#fff', sc: popIn(t, a.passy, 0.3) * al });
    if (t > a.riches - 0.1) { c.save(); c.globalAlpha = al; sprite(c, 'bourgeois', 830, 1450, 420 * popIn(t, a.riches - 0.1, 0.3), { rot: 0.03 * Math.sin(t * 5) }); c.restore(); } }
  stampText(c, 'NON !', W / 2, 640, t, a.refusent, a.spirale - 0.15, { size: 130 });
  // le 13 traverse Paris
  if (t > a.part - 0.1 && t < a.b3 + 0.4) { const p0 = S(...ARR[15].c), p1 = S(...ARR[12].c); const u = ease(prog(t, a.part, a.bout - a.part + 0.1)); const x = lerp(p0.x, p1.x, u), y = lerp(p0.y, p1.y, u) - Math.sin(Math.PI * u) * 260; const al = fadeOut(t, a.b3 + 0.1, 0.3); c.save(); c.globalAlpha = al; c.translate(x, y); const s = 1 + 0.25 * Math.sin(Math.PI * u); c.scale(s, s); c.beginPath(); c.arc(0, 0, 76, 0, 7); c.fillStyle = '#FFE928'; c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 20; c.fill(); c.shadowColor = 'transparent'; c.lineWidth = 7; c.strokeStyle = '#111'; c.stroke(); txt(c, '13', 0, 4, { size: 86, weight: 900, color: '#111', shadow: false }); c.restore(); }
  if (t > a.spirale - 0.1 && t < a.b3) tag(c, 'EN SPIRALE', W / 2, 470, { size: 70, bg: '#FFE928', color: '#111', border: '#111', sc: popIn(t, a.spirale, 0.3) * fadeOut(t, a.b3 - 0.2, 0.2) });
  // fin
  if (t > a.toi - 0.1) {
    if (t < a.comm) sprite(c, 'guy_think', 860, 1460, 360 * popIn(t, a.toi - 0.1, 0.3), { rot: 0.03 * Math.sin(t * 4) }); else sprite(c, 'guy_point', 850, 1460, 360 * popIn(t, a.comm - 0.1, 0.3), { flip: true, rot: 0.03 * Math.sin(t * 4) });
    tag(c, 'TON ARRONDISSEMENT ?', W / 2, 470, { size: 62, bg: '#C00E1F', border: '#fff', sc: popIn(t, a.arrq, 0.3), rot: -0.03 });
    if (t > a.abo - 0.15) tag(c, 'ABONNE-TOI', 400, 1330, { size: 66, bg: '#C00E1F', border: '#fff', sc: stampScale(t, a.abo) });
  }
}
