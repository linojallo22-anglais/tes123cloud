// scene.js — Chaque région de France a sa marque. Moteur : engine.js (sans score ni équipes).
const CFG = { jetH: 1.15, teamCol: {}, trail: { plane: '#F7EF08' }, NAME: {}, ANCH: {}, sides: [], sprites: ['tyre', 'plane', 'tent', 'biscuit', 'cart', 'butter', 'bag', 'car', 'notebook', 'syrup', 'box', 'lavender', 'ferry', 'guy_point', 'guy_think', 'trophy'], extraFlags: ['fr'] };
// [beat, ville, [lon, lat], code région, nom région, marque, sprite, couleur, mot de la marque, extra]
const ITEMS = [
  [0, 'CLERMONT-FERRAND', [3.08, 45.78], '84', 'AUVERGNE-RHÔNE-ALPES', 'MICHELIN', 'tyre', '#2b6cff', 'michelin', { w: 'etoiles', tag: '★ ★ ★' }],
  [1, 'TOULOUSE', [1.44, 43.6], '76', 'OCCITANIE', 'AIRBUS', 'plane', '#e3342f', 'airbus', null],
  [2, 'LILLE', [3.06, 50.63], '32', 'HAUTS-DE-FRANCE', 'DECATHLON', 'tent', '#0082c3', 'decathlon', { w: 'mille', tag: '1976' }],
  [3, 'NANTES', [-1.55, 47.22], '52', 'PAYS DE LA LOIRE', 'LU', 'biscuit', '#f59e0b', 'lu', { w: 'depuis', tag: 'PETIT BEURRE · 1886' }],
  [4, 'LANDERNEAU', [-4.25, 48.45], '53', 'BRETAGNE', 'E.LECLERC', 'cart', '#0057b8', 'leclerc', { w: 'mille', tag: '1949' }],
  [5, 'NORMANDIE', [-1.03, 49.05], '28', 'NORMANDIE', 'ELLE & VIRE', 'butter', '#16a34a', 'elle', null],
  [6, 'PARIS', [2.35, 48.86], '11', 'ÎLE-DE-FRANCE', 'LOUIS VUITTON', 'bag', '#7c4a1e', 'louis', { w: 'depuis', tag: '1854' }],
  [7, 'SOCHAUX', [6.83, 47.51], '27', 'BOURGOGNE-FRANCHE-COMTÉ', 'PEUGEOT', 'car', '#1e3a8a', 'peugeot', { w: 'lion', tag: 'LE LION' }],
  [8, 'VOSGES', [6.86, 48.37], '44', 'GRAND EST', 'CLAIREFONTAINE', 'notebook', '#9333ea', 'clairefontaine', null],
  [9, 'BOURGES', [2.4, 47.08], '24', 'CENTRE-VAL DE LOIRE', 'MONIN', 'syrup', '#dc2626', 'monin', { w: 'cent', tag: '150 PAYS' }],
  [10, 'BORDEAUX', [-0.58, 44.84], '75', 'NOUVELLE-AQUITAINE', 'CDISCOUNT', 'box', '#0ea5e9', 'cdiscount', { w: 'mille', tag: '1998' }],
  [11, 'MANOSQUE', [5.79, 43.83], '93', 'PROVENCE', "L'OCCITANE", 'lavender', '#7e57c2', 'loccitane', null],
  [12, 'BASTIA', [9.45, 42.7], '94', 'CORSE', 'CORSICA FERRIES', 'ferry', '#eab308', 'corsica', null],
];
let REG = {};
function setup() {
  const a = A; A.sb = 1e9;
  ITEMS.forEach((it, i) => { it.t0 = beatStart(it[0]); it.tb = T(it[0], it[8]); it.te = beatEnd(it[0]); it.tx = it[9] ? T(it[0], it[9].w) : null; it.next = i < 12 ? beatStart(it[0] + 1) : beatStart(13); });
  a.b13 = beatStart(13); a.treize2 = T(13, 'treize', 2); a.chaque = T(13, 'chaque'); a.sienne = T(13, 'sienne'); a.toi = T(13, 'toi'); a.marque = T(13, 'marque', 2); a.comm = T(13, 'commentaire'); a.abo = T(13, 'abonnetoi'); a.fin = TE(13, 'abonnetoi');
  a.occ = T(11, 'occitanie'); a.qui = T(11, 'qui');
  DUR = a.fin + 3.0; a.big = [];
  for (const r of WORLD.regions) REG[r.code] = r;

  // l'avion part vite d'une ville à la suivante (trajectoire jaune, caméra qui le suit)
  for (let i = 1; i < ITEMS.length; i++) { const it = ITEMS[i], pv = ITEMS[i - 1]; const sE = it[3] === '11' ? 8600 : it[3] === '94' ? 6200 : 6400; LEGS.push({ jet: 'plane', a: pv[2], b: it[2], t0: it.t0 - 1.0, t1: it.t0 + 0.1, sMid: 3600, sEnd: sE }); }
  JETVIS = { plane: [[ITEMS[1].t0 - 1.1, ITEMS[12].tb + 0.8]] };
  // caméra : une plongée par ville, petite respiration sur la marque
  const stops = [st(0, 0, 3.08, 46.5, 6800, { drift: 0.05 })];
  ITEMS.forEach((it, i) => {
    const [lon, lat] = it[2]; const s = it[3] === '11' ? 10500 : it[3] === '94' ? 7600 : 7800;
    if (i > 0) stops.push(st(it.t0 + 0.05, 0.75, lon, lat + 0.75 * 7800 / s, s * 0.82));
    stops.push(st(it.tb + 0.5, 0.6, lon + 0.1, lat + 0.6 * 7800 / s, s, { drift: 0.04 }));
    if (it.tx) stops.push(st(it.tx + 0.35, 0.6, lon - 0.1, lat + 0.5 * 7800 / s, s * 1.12, { drift: 0.03 }));
  });
  stops.push(st(a.b13 + 0.4, 1.3, 2.6, 47.6, 3000, { drift: 0.02 }));
  stops.push(st(a.chaque + 0.3, 0.9, 2.8, 47.8, 3300));
  stops.push(st(a.toi + 0.3, 0.9, 2.4, 47.5, 3050));
  stops.push(st(a.marque + 0.3, 0.7, 2.7, 47.7, 3350));
  stops.push(st(a.abo + 0.1, 0.8, 2.6, 47.6, 3100));
  stops.push(st(a.fin + 0.9, 0.9, 2.6, 47.8, 3450));
  stops.push(st(a.fin + 2.3, 0.8, 2.6, 47.6, 3150, { drift: 0.03 }));
  buildCam(stops);
  A.tilt = [[ITEMS[1].t0 - 0.3, ITEMS[2].t0, 16], [ITEMS[6].t0 - 0.3, ITEMS[7].t0, 14], [ITEMS[11].t0 - 0.3, ITEMS[12].t0, 14], [a.b13 - 0.3, a.toi, 18]];

  // sons et actions
  ev(0, 'whoosh');
  ITEMS.forEach((it, i) => {
    if (i > 0) { ev(it.t0 - 1.0, 'jet'); ev(it.t0 - 0.2, 'whoosh'); act(it.t0 - 1.0, 'avion', 'vole vers ' + it[1]); } ev(it.t0, 'scan'); act(it.t0, it[1], 'région s\'allume'); ev(it.tb - 0.05, 'pop'); ev(it.tb + 0.12, it[6] === 'plane' ? 'jet' : it[6] === 'ferry' ? 'water' : 'thud'); act(it.tb, it[5], 'tombe sur la ville'); ev(it.tb + 0.35, 'ding');
    if (it.tx) { ev(it.tx, 'stamp'); act(it.tx, 'étiquette', it[9].tag); }
    ev(it.tb + 1.1, 'tic'); ev(it.tb + 2.0, 'tic');
  });
  ev(a.qui, 'boing'); ev(a.occ, 'stamp'); act(a.occ, 'Occitanie', 'barrée');
  ev(a.b13 - 0.3, 'whoosh'); ITEMS.forEach((it, i) => ev(a.b13 + 0.1 + i * 0.09, 'tic')); ev(a.treize2, 'count'); ev(a.chaque, 'shine'); ev(a.sienne, 'ding'); act(a.sienne, 'trophée', 'apparaît'); ev(a.toi, 'boing'); act(a.toi, 'personnage', 'réfléchit'); ev(a.comm, 'pop'); act(a.comm, 'personnage', 'montre'); ev(a.abo, 'pop'); ev(a.abo + 0.1, 'ding'); ev(a.fin + 0.4, 'shine'); ev(a.fin + 1.2, 'sparkle'); ev(a.fin + 2.0, 'ding'); act(a.fin + 0.3, 'France', 'brille');
  for (let x = a.b13 + 1.4; x < DUR; x += 1.1) ev(x, 'tic');
  window.PREVIEW = ITEMS.flatMap(it => [it.t0 + 0.3, it.tb + 0.5]).concat([a.occ + 0.3, a.b13 + 1.0, a.sienne + 0.4, a.toi + 0.4, a.comm + 0.4, a.abo + 0.3, a.fin + 1.0, DUR - 0.2]);
}

// ---------- carte : régions ----------
function curItem(t) { let k = -1; ITEMS.forEach((it, i) => { if (t >= it.t0 - 0.05) k = i; }); return k; }
function mapOver(t) {
  const a = A; const k = curItem(t); const end = t > a.b13 - 0.2;
  // contours de toutes les régions
  m.save(); for (const code in REG) { pathM(REG[code].g); m.lineWidth = 2.2; m.strokeStyle = 'rgba(255,255,255,.55)'; m.stroke(); } m.restore();
  const gF = geomOf('250'); const bF = d3.geoPath(P).bounds(gF);
  flagFill(m, () => pathM(gF), bF, FL.fr, end ? 0.55 + 0.25 * clamp((t - a.b13) / 1.0) : 0.4, 0, 'stretch');
  pathM(gF); m.save(); m.lineWidth = 5; m.lineJoin = 'round'; m.strokeStyle = '#fff'; m.shadowColor = '#3b7bff'; m.shadowBlur = 18; m.globalAlpha = 0.9; m.stroke(); m.restore();
  ITEMS.forEach((it, i) => {
    if (t < it.t0 - 0.05) return; const g = REG[it[3]].g; const cur = i === k && !end; const age = t - it.t0;
    const al = end ? 0.9 : cur ? 0.95 * clamp(age / 0.3) : 0.62;
    flagFill(m, () => pathM(g), bF, FL.fr, al, cur ? Math.max(0, 1 - age / 0.35) : 0, 'stretch');
    if (cur) { pathM(g); m.save(); m.globalAlpha = 0.22; m.fillStyle = it[7]; m.fill(); m.restore(); }
    if (cur || end) { pathM(g); m.save(); m.globalAlpha = cur ? Math.max(0.7, 1 - age / 1.5) : 0.75; m.lineWidth = cur ? 8 : 4; m.lineJoin = 'round'; m.strokeStyle = '#fff'; m.shadowColor = cur ? it[7] : '#fff'; m.shadowBlur = 26; m.stroke(); m.restore(); }
  });
  // L'Occitane n'est pas en Occitanie
  if (t > a.occ - 0.1 && t < ITEMS[12].t0) { const al = clamp((t - a.occ + 0.1) / 0.2) * fadeOut(t, ITEMS[12].t0 - 0.3, 0.3); pathM(REG['76'].g); m.save(); m.globalAlpha = al; m.fillStyle = `rgba(230,30,40,${0.35 + 0.1 * Math.sin(t * 9)})`; m.fill(); m.lineWidth = 8; m.strokeStyle = '#ff2d2d'; m.setLineDash([24, 14]); m.lineDashOffset = t * 50; m.stroke(); m.restore(); }
}

// ---------- calque écran ----------
function brandCard(c, it, t) {
  const s = stampScale(t, it.tb) * fadeOut(t, it.next - 0.15, 0.2); if (t < it.tb || s <= 0) return;
  const name = it[5], sz = name.length > 12 ? 74 : name.length > 8 ? 88 : 104; c.save(); c.translate(W / 2, 470); c.scale(s, s); c.rotate(-0.03);
  const w = measure(c, name, sz, 900) + 80; c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 24; c.shadowOffsetY = 8; rr(c, -w / 2, -sz * 0.75, w, sz * 1.5, 26); c.fillStyle = '#fff'; c.fill(); c.shadowColor = 'transparent'; c.lineWidth = 8; c.strokeStyle = it[7]; c.stroke();
  txt(c, name, 0, 4, { size: sz, weight: 900, color: it[7], shadow: false }); c.restore();
}
function screenScene(c, t) {
  const a = A; const k = curItem(t);
  if (t < a.b13 - 0.2 && k >= 0) {
    const it = ITEMS[k]; const p = S(...it[2]); const out = fadeOut(t, it.next - 0.15, 0.2);
    // région + ville
    tag(c, it[4], W / 2, 330, { size: it[4].length > 18 ? 38 : 46, bg: it[7], border: '#fff', sc: popIn(t, it.t0, 0.3) * out });
    c.save(); c.globalAlpha = out; ping(c, p.x, p.y, t, it.t0, null, it.next - 0.15); c.restore();
    c.save(); c.globalAlpha = out; txt(c, typed(it[1], t, it.t0 + 0.05, 0.35), p.x, p.y + 78, { size: 54, weight: 900, stroke: '#000', sw: 10 }); c.restore();
    // produit qui tombe (avion qui se pose, ferry qui arrive par la mer)
    if (t > it.tb - 0.1 && it[6] !== 'plane') {
      const h = { plane: 300, ferry: 300, syrup: 270, tent: 240, car: 210 }[it[6]] || 260; let x = p.x, y = p.y - 40, rot = 0;
      const u = easeOut(prog(t, it.tb - 0.1, 0.45));
      if (it[6] === 'plane') { x = lerp(p.x - 520, p.x, u); y = lerp(p.y - 700, p.y - 190, u); rot = -0.6 * (1 - u) + 0.04 * Math.sin(t * 3); }
      else if (it[6] === 'ferry') { x = lerp(p.x - 60, p.x + 70, u); y = lerp(p.y + 480, p.y + 260, u); }
      else { y = lerp(p.y - 600, p.y - 40, easeIn(prog(t, it.tb - 0.1, 0.32))); const sq = Math.max(0, 1 - Math.abs(t - it.tb - 0.22) / 0.1); c.save(); c.globalAlpha = out; sprite(c, it[6], x, y + 6 * Math.sin(t * 4) * u, h, { sx: 1 + 0.15 * sq, sy: 1 - 0.15 * sq }); c.restore(); }
      if (it[6] === 'plane' || it[6] === 'ferry') { c.save(); c.globalAlpha = out; c.translate(x, y); c.rotate(rot); sprite(c, it[6], 0, h / 2, h, { shadow: false }); c.restore(); }
    }
    brandCard(c, it, t);
    if (it.tx && t > it.tx - 0.05) tag(c, it[9].tag, W / 2, 610, { size: 58, bg: '#FFE928', color: '#111', border: '#111', sc: stampScale(t, it.tx) * out, rot: 0.04 });
    // compteur
    const n = ITEMS.filter(x => t >= x.tb).length; if (n > 0) { const b = Math.max(0, 1 - (t - ITEMS[n - 1].tb) / 0.2); c.save(); c.translate(W - 120, 330); c.scale(1 + 0.3 * b, 1 + 0.3 * b); c.beginPath(); c.arc(0, 0, 62, 0, 7); c.fillStyle = '#111'; c.fill(); c.lineWidth = 5; c.strokeStyle = '#FFE928'; c.stroke(); txt(c, n + '/13', 0, 3, { size: 40, weight: 900, color: '#FFE928', shadow: false }); c.restore(); }
  }
  // L'Occitane
  stampText(c, 'PAS EN OCCITANIE !', W / 2, 760, t, a.occ, ITEMS[12].t0 - 0.15, { size: 70 });
  // fin : toute la France
  if (t > a.b13 - 0.2) {
    ITEMS.forEach((it, i) => { const p = S(...it[2]); const s0 = a.b13 + 0.1 + i * 0.09; if (t < s0) return; const s = popIn(t, s0, 0.3); sprite(c, it[6], p.x, p.y + 4 * Math.sin(t * 3 + i), 92 * s, { shadow: false }); });
    const n13 = popIn(t, a.b13, 0.3); c.save(); c.translate(W / 2, 330); c.scale(n13, n13); txt(c, '13 RÉGIONS', 0, 0, { size: 84, weight: 900, color: '#fff', stroke: '#000', sw: 12 }); c.restore();
    if (t > a.treize2 - 0.05) { const s = popIn(t, a.treize2, 0.3); c.save(); c.translate(W / 2, 430); c.scale(s, s); txt(c, '13 MARQUES', 0, 0, { size: 84, weight: 900, color: '#FFE928', stroke: '#1b1300', sw: 12 }); c.restore(); }
    if (t > a.sienne - 0.1) { const s = popIn(t, a.sienne - 0.1, 0.4) * (1 + 0.04 * Math.sin(t * 5)); c.save(); c.shadowColor = '#ffd400'; c.shadowBlur = 50; c.translate(220, 1460); c.scale(s, s); sprite(c, 'trophy', 0, 0, 260, { shadow: false }); c.restore(); }
    if (t > a.toi - 0.1 && t < a.comm) sprite(c, 'guy_think', 880, 1460, 340 * popIn(t, a.toi - 0.1, 0.3), { rot: 0.03 * Math.sin(t * 4) });
    if (t > a.comm - 0.1) sprite(c, 'guy_point', 870, 1460, 340 * popIn(t, a.comm - 0.1, 0.3), { flip: true, rot: 0.03 * Math.sin(t * 4) });
    if (t > a.marque - 0.1) tag(c, 'TA RÉGION ?', 600, 1370, { size: 60, bg: '#C00E1F', border: '#fff', sc: popIn(t, a.marque, 0.3), rot: -0.05 });
    if (t > a.abo - 0.15) tag(c, 'ABONNE-TOI', 600, 1470, { size: 66, bg: '#C00E1F', border: '#fff', sc: stampScale(t, a.abo) });
  }
}
