// scene.js — Team Paris vs Team Marseille. Moteur : engine.js.
const PNV = '#1d3a8a', MSB = '#1fa2dc';
const CITY = { P: [2.35, 48.86], M: [5.37, 43.3] };
const CFG = {
  jetH: 1.35, teamCol: { f: '#3b7bff' }, trail: { jet_fr: '#F7EF08' }, NAME: { '250': 'FRANCE' }, ANCH: { '250': [2.4, 46.8] },
  sides: [[-1, PNV, 'TEAM PARIS', 'f', null], [1, MSB, 'TEAM MARSEILLE', 'a', null]],
  sprites: ['jet_fr', 'sol_paris', 'sol_marseille', 'ndg', 'calanque', 'sun', 'cloud', 'metro', 'greekship', 'parisplage', 'cup', 'crown', 'qgold', 'eiffel', 'louvre', 'ball'],
  extraFlags: ['fr'],
};
const ROUNDS = [ // [beat, titre, gagnant]
  [1, 'LA TAILLE', 'M'], [2, 'LES HABITANTS', 'P'], [3, 'LA MER', 'M'], [4, 'LE SOLEIL', 'M'], [5, 'LE MÉTRO', 'P'], [6, "L'ÂGE", 'M'], [7, 'LES MUSÉES', 'P'], [8, 'LE FOOT', 'P'],
];
function setup() {
  const a = A;
  a.tp = T(0, 'paris'); a.contre = T(0, 'contre'); a.tm = T(0, 'marseille'); a.manche = T(0, 'manche');
  ROUNDS.forEach(r => { r.t = beatStart(r[0]); r.pt = T(r[0], 'point'); r.end = beatEnd(r[0]); });
  // mentions des villes (l'avion y vole)
  const M = [[T(1, 'paris'), 'P'], [T(1, 'marseille'), 'M'], [T(2, 'paris'), 'P'], [T(2, 'marseille'), 'M'], [T(3, 'marseille'), 'M'], [T(3, 'paris'), 'P'], [T(4, 'marseille'), 'M'], [T(4, 'paris'), 'P'], [T(5, 'paris'), 'P'], [T(5, 'marseille'), 'M'], [T(6, 'marseille'), 'M'], [T(7, 'paris'), 'P'], [T(8, 'lom'), 'M'], [T(8, 'psg'), 'P']];
  a.b9 = beatStart(9); a.partout = T(9, 'quatre'); a.toi = T(9, 'toi'); a.tp9 = T(9, 'team'); a.tm9 = T(9, 'team', 2); a.comm = T(9, 'commentaire'); a.abo = T(9, 'abonnetoi'); a.fin = TE(9, 'abonnetoi');
  a.sb = a.tm + 0.3; DUR = a.fin + 0.6; a.big = [[a.b9, DUR + 1]];
  a.r = ROUNDS; a.y93 = T(8, 'mille'); a.y25 = T(8, 'vingtcinq'); a.y26 = T(8, 'vingtsix'); a.grecs = T(6, 'grecs'); a.calanques = T(3, 'calanques'); a.plages = T(3, 'plages');

  C('250', 0.05, 'f'); // la France en tricolore
  SCORE.f.push([a.tp, 1]); SCORE.a.push([a.tm, 1]); SCORE.f.push([a.tp + 0.01, -1]); SCORE.a.push([a.tm + 0.01, -1]);
  ROUNDS.forEach(r => SCORE[r[2] === 'P' ? 'f' : 'a'].push([r.pt, 1]));

  // ---- l'avion
  let cur = 'P';
  M.forEach(([t, c]) => { if (c !== cur) { LEGS.push({ jet: 'jet_fr', a: CITY[cur], b: CITY[c], t0: t - 0.95, t1: t + 0.05, noFollow: true }); cur = c; } });
  JETVIS = { jet_fr: [[ROUNDS[0].t - 0.2, a.b9 - 0.1]] };

  // ---- caméra
  const stops = [st(0, 0, 2.6, 47.5, 1900, { drift: 0.05 }), st(a.tp + 0.6, 0.6, 2.35, 48.4, 3200), st(a.tm + 0.6, 1.0, 5.2, 43.8, 3200), st(a.manche + 0.4, 0.9, 3.8, 47.4, 2900)];
  const B0 = [3.8, 47.4]; const near = (c, k) => [lerp(B0[0], CITY[c][0], k), lerp(B0[1], CITY[c][1], k)];
  ROUNDS.forEach(r => { stops.push(st(r.t + 0.45, 0.6, B0[0], B0[1], 3150, { drift: 0.03 })); stops.push(st(r.pt + 0.35, 0.6, ...near(r[2], 0.3), 3700, { drift: 0.03 })); });
  M.forEach(([t, c]) => { if (!ROUNDS.some(r => Math.abs(r.t + 0.45 - (t + 0.3)) < 0.7 || Math.abs(r.pt + 0.35 - (t + 0.3)) < 0.7)) stops.push(st(t + 0.3, 0.6, ...near(c, 0.22), 3450, { drift: 0.03 })); });
  stops.push(st(a.b9 + 0.5, 1.0, 3.8, 47.2, 2700, { drift: 0.02 }));
  stops.push(st(a.toi + 0.2, 0.8, 3.6, 47.4, 3100));
  stops.push(st(a.tm9 + 0.2, 0.7, 4.0, 47.0, 2800));
  stops.push(st(a.abo + 0.1, 0.7, 3.8, 47.3, 3050));
  stops.push(st(a.fin + 0.5, 0.7, 3.8, 47.2, 2850, { drift: 0.03 }));
  buildCam(stops);
  A.tilt = [[a.tp - 0.2, a.manche, 16], [ROUNDS[2].t - 0.3, ROUNDS[3].t, 14], [a.b9 - 0.3, a.toi, 14]];

  // ---- sons et actions
  ev(0, 'whoosh'); ev(a.tp, 'ping'); ev(a.tp + 0.05, 'pop'); ev(a.contre, 'stamp'); ev(a.tm, 'ping'); ev(a.tm + 0.05, 'pop'); ev(a.sb, 'pop'); ev(a.manche, 'boing');
  act(a.tp, 'Paris', 'épingle'); act(a.tm, 'Marseille', 'épingle'); act(a.contre, 'supporters', 'face à face');
  for (const Lg of LEGS) { ev(Lg.t0, 'jet'); act(Lg.t0, 'Rafale', 'vole'); ev(Lg.t1 - 0.1, 'whoosh'); }
  ROUNDS.forEach((r, i) => { ev(r.t, 'swell'); ev(r.t + 0.05, 'pop'); act(r.t, 'manche ' + (i + 1), r[1]); ev(r.pt, 'ding'); ev(r.pt + 0.05, 'count'); act(r.pt, 'point', r[2] === 'P' ? 'Paris' : 'Marseille'); ev(r.pt + 0.6, 'tic'); });
  for (const x of [T(1, 'cent'), T(1, 'deux'), T(2, 'plus'), T(2, 'moins'), a.calanques, a.plages, T(4, 'trois'), T(4, 'mille', 2), T(5, 'seize'), T(5, 'deux'), a.grecs, T(7, 'louvre'), a.y93, a.y25, a.y26]) ev(x, 'stamp');
  ev(a.b9 - 0.2, 'whoosh'); ev(a.partout, 'impact'); act(a.partout, 'score', '4-4'); ev(a.toi, 'boing'); act(a.toi, 'point d\'interrogation', 'apparaît'); ev(a.tp9, 'pop'); ev(a.tm9, 'pop'); ev(a.comm, 'pop'); ev(a.abo, 'pop'); ev(a.abo + 0.1, 'ding'); ev(a.b9 + 1.5, 'cheer');
  for (const x of [a.manche + 0.6, a.partout + 0.8, a.comm + 0.6, 44.9, 45.6]) ev(x, 'tic'); ROUNDS.forEach(r => { ev(r.t + 0.9, 'tic'); ev(r.t + 1.8, 'tic'); });
  window.PREVIEW = [0.6, a.tm + 0.4, a.manche + 0.3].concat(ROUNDS.flatMap(r => [r.t + 1.2, r.pt + 0.25])).concat([a.y26 + 0.4, a.partout + 0.4, a.toi + 0.3, a.abo + 0.3]);
}

// ---------- calque écran ----------
function cityPin(c, key, t, t0) {
  const p = S(...CITY[key]); const s = popIn(t, t0, 0.35); const col = key === 'P' ? PNV : MSB; const ring = key === 'P' ? '#e3121f' : '#fff';
  const win = ROUNDS.find(r => t >= r.pt && t < r.pt + 0.9 && r[2] === key); const fl = win ? 1 - (t - win.pt) / 0.9 : 0;
  c.save(); c.translate(p.x, p.y); c.scale(s * (1 + 0.25 * fl), s * (1 + 0.25 * fl));
  if (fl > 0) { c.beginPath(); c.arc(0, 0, 60 + 120 * (1 - fl), 0, 7); c.lineWidth = 8; c.strokeStyle = `rgba(255,233,40,${fl})`; c.stroke(); }
  c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 16; c.beginPath(); c.arc(0, 0, 40, 0, 7); c.fillStyle = col; c.fill(); c.shadowColor = 'transparent'; c.lineWidth = 7; c.strokeStyle = ring; c.stroke();
  txt(c, key === 'P' ? 'PARIS' : 'MARSEILLE', 0, 76, { size: 46, weight: 900, color: '#fff', stroke: '#000', sw: 10 });
  if (win) { c.save(); c.translate(0, -70 - 60 * (1 - fl)); c.globalAlpha = Math.min(1, fl * 2); txt(c, '+1', 0, 0, { size: 80, weight: 900, color: '#FFE928', stroke: '#1b1300', sw: 12 }); c.restore(); }
  c.restore();
}
function statTag(c, key, s, t, t0, t1, col) { if (t < t0 || t > t1 + 0.3) return; const p = S(...CITY[key]); tag(c, s, clamp(p.x, 200, 880), clamp(p.y - 120, 490, 1300), { size: 56, bg: col || (key === 'P' ? PNV : MSB), border: '#fff', sc: stampScale(t, t0) * fadeOut(t, t1, 0.3) }); }
function mapSpr(c, name, key, t, t0, t1, h, o = {}) { if (t < t0 || t > t1 + 0.3) return; const p = S(...CITY[key]); if (key === 'P') o = { ...o, dx: (o.dx || 0) - 250, dy: 120 }; const s = popIn(t, t0, 0.35) * fadeOut(t, t1, 0.3); sprite(c, name, clamp(p.x + (o.dx || 0), 150, 930), clamp(p.y + (o.dy ?? -60), 420, 1420) + 5 * Math.sin(t * 4), h * s, { shadow: false, rot: o.rot }); }
function screenScene(c, t) {
  const a = A; const R = a.r;
  if (t < a.b9 + 0.3) { c.save(); c.globalAlpha = fadeOut(t, a.b9, 0.3); if (t > a.tp) cityPin(c, 'P', t, a.tp); if (t > a.tm) cityPin(c, 'M', t, a.tm); c.restore(); }
  // accroche
  if (t < R[0].t + 0.3) {
    const al = fadeOut(t, R[0].t, 0.3); c.save(); c.globalAlpha = al;
    soldier(c, 'sol_paris', 230, 1440, 400, t, a.tp - 0.1); tag(c, 'TEAM PARIS', 230, 1010, { size: 50, bg: PNV, border: '#fff', sc: popIn(t, a.tp, 0.3) });
    if (t > a.tm - 0.1) { soldier(c, 'sol_marseille', 850, 1440, 400, t, a.tm - 0.1, { ph: 1 }); tag(c, 'TEAM MARSEILLE', 850, 1010, { size: 48, bg: MSB, border: '#fff', sc: popIn(t, a.tm, 0.3) }); }
    if (t > a.contre) { c.save(); c.translate(540, 1200); const s = stampScale(t, a.contre); c.scale(s, s); c.shadowColor = '#ffd23a'; c.shadowBlur = 40; txt(c, 'VS', 0, 0, { size: 200, weight: 900, color: '#FFE928', stroke: '#3a2500', sw: 18, shadow: false }); c.restore(); }
    c.restore();
  }
  if (t > a.manche - 0.1 && t < R[0].t + 0.2) tag(c, '1 POINT PAR MANCHE', W / 2, 470, { size: 56, bg: '#FFE928', color: '#111', border: '#111', sc: popIn(t, a.manche, 0.3) * fadeOut(t, R[0].t, 0.2), rot: -0.03 });
  // titre de manche
  R.forEach((r, i) => { const nx = i < 7 ? R[i + 1].t : a.b9; if (t < r.t - 0.05 || t > nx) return; const out = fadeOut(t, nx - 0.2, 0.2); tag(c, 'MANCHE ' + (i + 1) + ' · ' + r[1], W / 2, 410, { size: 52, bg: '#111', color: '#FFE928', border: '#FFE928', sc: popIn(t, r.t, 0.3) * out }); stampText(c, 'POINT ' + (r[2] === 'P' ? 'PARIS' : 'MARSEILLE'), W / 2, 1390, t, r.pt, nx - 0.15, { col: r[2] === 'P' ? PNV : MSB, size: 72 }); });
  // contenus des manches
  const e = i => (i < 7 ? R[i + 1].t : a.b9) - 0.2;
  statTag(c, 'P', '105 km²', t, T(1, 'cent'), e(0)); statTag(c, 'M', '240 km²', t, T(1, 'deux'), e(0));
  statTag(c, 'P', '2 MILLIONS +', t, T(2, 'plus'), e(1)); statTag(c, 'M', '< 900 000', t, T(2, 'moins'), e(1));
  mapSpr(c, 'calanque', 'M', t, a.calanques - 0.1, e(2), 230, { dy: -80 }); mapSpr(c, 'parisplage', 'P', t, a.plages - 0.1, e(2), 220, { dy: -60 });
  mapSpr(c, 'sun', 'M', t, T(4, 'trois') - 0.1, e(3), 200, { dy: -70 }); statTag(c, 'M', '≈ 3 000 H', t, T(4, 'heures'), e(3), '#f59e0b');
  mapSpr(c, 'cloud', 'P', t, T(4, 'mille', 2) - 0.1, e(3), 190, { dy: -70 }); statTag(c, 'P', '1 700 H', t, T(4, 'mille', 2) + 0.2, e(3), '#6b7280');
  mapSpr(c, 'metro', 'P', t, T(5, 'seize') - 0.1, e(4), 200, { dy: -70 }); statTag(c, 'P', '16 LIGNES', t, T(5, 'lignes'), e(4)); statTag(c, 'M', '2 LIGNES', t, T(5, 'deux'), e(4));
  if (t > a.grecs - 0.2 && t < e(5) + 0.3) { const p = S(...CITY.M); const u = easeOut(prog(t, a.grecs - 0.2, 1.0)); c.save(); c.globalAlpha = fadeOut(t, e(5), 0.3); sprite(c, 'greekship', lerp(p.x + 360, p.x + 40, u), clamp(p.y + 200, 500, 1420), 220, { shadow: false, rot: 0.04 * Math.sin(t * 3) }); c.restore(); }
  statTag(c, 'M', '2 600 ANS', t, T(6, 'deux'), e(5), '#8b5cf6');
  mapSpr(c, 'louvre', 'P', t, T(7, 'louvre') - 0.1, e(6), 190, { dy: -70 }); statTag(c, 'P', 'N°1 MONDIAL', t, T(7, 'musee', 2), e(6), '#b45309');
  mapSpr(c, 'cup', 'M', t, a.y93 - 0.1, e(7), 170, { dy: -70, dx: -40 }); statTag(c, 'M', '1993', t, a.y93, e(7));
  mapSpr(c, 'cup', 'P', t, a.y25 - 0.1, e(7), 170, { dy: -70, dx: -60 }); mapSpr(c, 'cup', 'P', t, a.y26 - 0.1, e(7), 170, { dy: -70, dx: 60 }); statTag(c, 'P', '2025 + 2026', t, a.y25, e(7));
  // fin
  if (t > a.b9 - 0.1) {
    soldier(c, 'sol_paris', 210, 1450, 380, t, a.b9 - 0.1); soldier(c, 'sol_marseille', 870, 1450, 380, t, a.b9, { ph: 1 });
    if (t > a.tp9 - 0.05) tag(c, 'TEAM PARIS', 210, 1030, { size: 46, bg: PNV, border: '#fff', sc: popIn(t, a.tp9, 0.3) }); if (t > a.tm9 - 0.05) tag(c, 'TEAM MARSEILLE', 870, 1030, { size: 44, bg: MSB, border: '#fff', sc: popIn(t, a.tm9, 0.3) });
    stampText(c, '4 – 4', W / 2, 900, t, a.partout, a.toi - 0.1, { size: 140, col: '#111' });
    if (t > a.toi - 0.1) { const s = popIn(t, a.toi - 0.1, 0.35) * (1 + 0.05 * Math.sin(t * 6)); c.save(); c.translate(W / 2, 1120); c.scale(s, s); sprite(c, 'qgold', 0, 0, 230, { shadow: false }); c.restore(); tag(c, 'TON POINT ?', W / 2, 880, { size: 70, bg: '#C00E1F', border: '#fff', sc: popIn(t, a.toi, 0.3), rot: -0.03 }); }
    if (t > a.abo - 0.15) tag(c, 'ABONNE-TOI', W / 2, 1280, { size: 66, bg: '#C00E1F', border: '#fff', sc: stampScale(t, a.abo) });
  }
}
