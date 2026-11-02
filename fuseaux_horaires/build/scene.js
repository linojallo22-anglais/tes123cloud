// scene.js — La France, pays aux 12 fuseaux horaires. Moteur : engine.js.
const GOLD = '#FFE928';
const TER = { // [lon, lat], nom, décalage (heure d'hiver de Paris), sprite
  paris: [[2.35, 48.86], 'PARIS', 'UTC+1'], gp: [[-61.55, 16.25], 'GUADELOUPE'], mq: [[-61.02, 14.64], 'MARTINIQUE'], gf: [[-53.1, 3.95], 'GUYANE'], pm: [[-56.3, 46.95], 'ST-PIERRE-ET-MIQUELON'],
  yt: [[45.15, -12.82], 'MAYOTTE'], re: [[55.53, -21.13], 'LA RÉUNION'], nc: [[165.6, -21.3], 'NOUVELLE-CALÉDONIE'], wf: [[-176.2, -13.29], 'WALLIS-ET-FUTUNA'],
  ta: [[-149.43, -17.65], 'TAHITI'], mar: [[-140.0, -9.0], 'MARQUISES'], gam: [[-134.95, -23.12], 'GAMBIER'], ke: [[69.35, -49.35], 'KERGUELEN'], cl: [[-109.2, 10.3], 'CLIPPERTON'], ad: [[140.0, -66.66], 'TERRE ADÉLIE'],
};
const TWELVE = ['paris', 'gp', 'gf', 'yt', 're', 'ke', 'nc', 'wf', 'ta', 'mar', 'gam', 'cl'];
const CFG = { jetH: 1.0, teamCol: { f: '#3b7bff', g: '#9aa0a6' }, trail: { plane: '#F7EF08' }, NAME: {}, ANCH: {}, sides: [], sprites: ['plane', 'clock', 'sun', 'moon', 'fireworks', 'island', 'canoe', 'penguin', 'seal', 'hammock', 'rocket', 'volcano', 'lagoon', 'houses', 'lemur', 'alarm', 'champagne', 'qmark'], extraFlags: ['fr', 'ru', 'us'] };
const L_ = k => TER[k][0];
let VISIT = [];

function setup() {
  const a = A; A.sb = 1e9;
  for (const id of ['540', '258', '876', '666', '260', '663', '652']) ISO[id] = 'fr';
  a.fus = T(0, 'fuseaux'); a.ru = T(0, 'russie'); a.us = T(0, 'etatsunis'); a.fr = T(0, 'france'); a.douze = T(0, 'douze');
  a.b1 = beatStart(1); a.midi = T(1, 'midi'); a.paris = T(1, 'paris'); a.onze = T(1, 'onze'); a.wf1 = T(1, 'wallisetfutuna'); a.une = T(1, 'une'); a.ta1 = T(1, 'tahiti');
  a.b2 = beatStart(2); a.om = T(2, 'loutremer');
  a.b3 = beatStart(3); a.b4 = beatStart(4); a.ru4 = T(4, 'russie'); a.o1 = T(4, 'onze'); a.us4 = T(4, 'etatsunis'); a.o2 = T(4, 'onze', 2);
  a.b5 = beatStart(5); a.ta5 = T(5, 'tahiti'); a.wf5 = T(5, 'wallis'); a.h22 = T(5, 'vingtdeux'); a.meme = T(5, 'meme');
  a.b6 = beatStart(6); a.soleil = T(6, 'soleil'); a.jamais = T(6, 'jamais'); a.nouvel = T(6, 'nouvel'); a.h22b = T(6, 'vingtdeux'); a.wf6 = T(6, 'wallis'); a.ta6 = T(6, 'tahiti');
  a.b7 = beatStart(7); a.adelie = T(7, 'adelie'); a.antar = T(7, 'antarctique'); a.treize = T(7, 'treize');
  a.b8 = beatStart(8); a.savais = T(8, 'savais'); a.comm = T(8, 'commentaire'); a.abo = T(8, 'abonnetoi'); a.fin = TE(8, 'abonnetoi');
  DUR = a.fin + 0.6;
  // escales du tour : [clé, t (nom), t badge, texte badge, sprite, autres clés]
  VISIT = [
    ['gp', T(3, 'guadeloupe'), T(3, 'cinq'), '−5 H', 'hammock', ['mq']],
    ['gf', T(3, 'guyane'), null, null, 'rocket'],
    ['pm', T(3, 'saintpierreetmiquelon'), T(3, 'quatre'), '−4 H', 'houses'],
    ['yt', T(3, 'mayotte'), T(3, 'deux'), '+2 H', 'lemur'],
    ['re', T(3, 'reunion'), T(3, 'trois'), '+3 H', 'volcano'],
    ['nc', T(3, 'nouvellecaledonie'), T(3, 'dix'), '+10 H', 'lagoon'],
    ['wf', T(3, 'wallisetfutuna'), T(3, 'onze'), '+11 H', 'island'],
    ['ta', T(3, 'polynesie'), T(3, 'trois', 2), '3 FUSEAUX', 'canoe'],
  ].map(([k, t, tb, lab, spr, more], i, arr) => ({ k, t, tb, lab, spr, more: more || [], end: i < arr.length - 1 ? null : a.b4 - 0.1 }));
  VISIT.forEach((v, i) => { v.end = v.end ?? (VISIT[i + 1].t - 0.15); });

  // ---- pays
  C('643', a.ru, 'g'); C('643', a.ru + 1.2, 'x'); C('840', a.us, 'g'); C('840', a.us + 1.3, 'x');
  C('643', a.ru4, 'g'); C('643', a.b5, 'x'); C('840', a.us4, 'g'); C('840', a.b5 + 0.01, 'x');
  for (const id of ['250', '540', '258', '876', '666', '260', '663', '652']) C(id, a.fr + 0.05, 'f');

  // ---- avion
  const legs = [['paris', 'wf', a.paris + 0.25, a.wf1, 260, 1300], ['wf', 'ta', a.wf1 + 0.9, a.ta1, 700, 1500],
    ['paris', 'gp', a.om + 0.3, VISIT[0].t, 300, 1700], ['gp', 'gf', VISIT[0].tb + 0.45, VISIT[1].t, 900, 1500], ['gf', 'pm', VISIT[1].t + 0.2, VISIT[2].t, 700, 1500],
    ['pm', 'yt', VISIT[2].tb + 0.45, VISIT[3].t, 230, 1500], ['yt', 're', VISIT[3].tb + 0.45, VISIT[4].t, 1100, 1700], ['re', 'nc', VISIT[4].tb + 0.15, VISIT[5].t, 260, 1500],
    ['nc', 'wf', VISIT[5].tb + 0.2, VISIT[6].t, 800, 1600], ['wf', 'ta', VISIT[6].tb + 0.25, VISIT[7].t, 800, 1400], ['ta', 'ad', a.b7 - 0.1, a.adelie + 0.1, 330, 1300]];
  for (const [f, to, t0, t1, sMid, sEnd] of legs) LEGS.push({ jet: 'plane', a: L_(f), b: L_(to), t0, t1, sMid, sEnd });
  JETVIS = { plane: [[a.paris + 0.0, a.ta1 + 1.0], [a.om + 0.05, a.b4 - 0.1], [a.b7 - 0.35, a.treize]] };

  // ---- caméra
  buildCam([
    st(0, 0, 10, 20, 230, { drift: 0.05 }),
    st(1.7, 0.9, 25, 25, 290),
    st(a.ru + 0.4, 0.8, 70, 45, 330),
    st(a.us + 0.4, 0.8, -100, 35, 330),
    st(a.fr + 0.5, 1.0, 0, 5, 185, { drift: 0.03 }),
    st(a.douze + 0.2, 0.8, 0, 0, 205),
    st(a.midi + 0.1, 0.9, 2.35, 47.6, 4600),
    st(a.ta1 + 0.8, 0.9, -160, -15, 520),
    st(a.om + 0.15, 0.4, -60, 0, 185),
    st(a.b4 + 0.4, 1.0, 20, 20, 210, { drift: 0.03 }),
    st(a.o1 + 0.2, 0.7, 60, 40, 300),
    st(a.us4 + 0.3, 0.7, -100, 30, 300),
    st(a.b5 + 0.4, 1.0, -163, -14, 1100, { drift: 0.03 }),
    st(a.h22 + 0.2, 0.7, -163, -15, 900),
    st(a.meme + 0.2, 0.7, -162, -15, 1300),
    st(a.b6 + 0.4, 1.0, 10, 5, 180, { drift: 0.02 }),
    st(a.soleil + 0.4, 0.8, -10, 8, 215),
    st(a.nouvel + 0.3, 0.8, -175, -13, 4600),
    st(a.h22b + 0.2, 0.7, -176, -13.5, 3600),
    st(a.wf6 + 0.2, 0.6, -176.2, -14.5, 3300),
    st(a.ta6 + 0.3, 0.8, -149.4, -18.5, 3000),
    st(a.treize + 0.2, 0.9, 140, -64, 1600),
    st(a.b8 + 0.2, 1.0, 0, 10, 190),
    st(a.abo + 0.1, 0.8, 0, 8, 215),
    st(a.fin + 0.5, 0.8, 0, 8, 200, { drift: 0.04 }),
  ]);
  A.tilt = [[0.2, a.ru, 16], [a.midi - 0.2, a.wf1, 14], [a.b5 - 0.3, a.meme, 14], [a.b8 - 0.3, a.comm, 12]];

  // ---- sons et actions
  ev(0, 'whoosh'); ev(a.fus, 'tic'); ev(a.ru, 'scan'); ev(a.ru + 0.6, 'stamp'); act(a.ru, 'Russie', 'barrée'); ev(a.us, 'scan'); ev(a.us + 0.6, 'stamp'); act(a.us, 'USA', 'barrés');
  ev(a.fr, 'shine'); TWELVE.forEach((k, i) => ev(a.fr + 0.1 + i * 0.07, 'pop')); act(a.fr, 'France', 'partout'); ev(a.douze, 'impact'); act(a.douze, 'compteur', '12');
  ev(a.midi, 'ding'); act(a.midi, 'horloge Paris', 'midi'); ev(a.onze, 'pop'); act(a.onze, 'horloge Wallis', '23 h'); ev(a.une, 'pop'); act(a.une, 'horloge Tahiti', '1 h');
  for (const Lg of LEGS) { ev(Lg.t0, 'jet'); act(Lg.t0, 'avion', 'vole'); ev(Lg.t1 - 0.1, 'whoosh'); }
  ev(a.om, 'swell'); ev(a.om + 0.05, 'pop');
  VISIT.forEach(v => { ev(v.t, 'ping'); ev(v.t + 0.1, 'fall'); ev(v.t + 0.4, 'thud'); act(v.t, v.spr, 'tombe sur ' + v.k); if (v.tb) { ev(v.tb, 'stamp'); act(v.tb, 'badge', v.lab); } });
  ev(VISIT[0].tb - 0.6, 'pop'); ev(a.ru4, 'scan'); ev(a.o1, 'count'); ev(a.us4, 'scan'); ev(a.o2, 'count'); act(a.ru4, 'barres', '12/11/11');
  ev(a.ta5, 'ping'); ev(a.wf5, 'ping'); ev(a.h22, 'draw'); ev(a.h22 + 0.35, 'stamp'); act(a.h22, 'règle', '22 h'); ev(a.meme, 'stamp');
  ev(a.soleil, 'shine'); act(a.soleil, 'soleil', 'tourne'); ev(a.jamais, 'stamp'); ev(a.nouvel, 'sparkle'); act(a.nouvel, 'feux d\'artifice', 'Wallis'); ev(a.h22b, 'count'); ev(a.wf6, 'sparkle'); ev(a.ta6, 'sparkle'); act(a.ta6, 'feux d\'artifice', 'Tahiti');
  ev(a.adelie, 'ping'); ev(a.adelie + 0.1, 'fall'); ev(a.adelie + 0.4, 'thud'); act(a.adelie, 'manchot', 'tombe'); ev(a.treize, 'impact');
  ev(a.savais, 'boing'); act(a.savais, '?', 'apparaît'); ev(a.comm, 'pop'); ev(a.abo, 'pop'); ev(a.abo + 0.1, 'ding');
  fillGaps();
  window.PREVIEW = [0.3, a.ru + 0.5, a.us + 0.6, a.fr + 0.5, a.douze + 0.3, a.midi + 0.5, a.wf1 + 0.4, a.ta1 + 0.5, a.om + 0.4].concat(VISIT.flatMap(v => [v.t + 0.5, v.tb ? v.tb + 0.3 : v.t + 0.9])).concat([a.o1 + 0.3, a.o2 + 0.3, a.h22 + 0.5, a.meme + 0.3, a.soleil + 0.6, a.jamais + 0.4, a.wf6 + 0.4, a.ta6 + 0.4, a.adelie + 0.5, a.treize + 0.4, a.savais + 0.3, a.abo + 0.4]);
}
function fillGaps() { const ts = EVENTS.map(e => e[0]).sort((x, y) => x - y); for (let i = 1; i < ts.length; i++) for (let t = ts[i - 1] + 1.2; t < ts[i] - 0.3; t += 1.2) ev(t, 'tic'); }

// ---------- carte : bandes de fuseaux, nuit ----------
function band(l0, l1) { const ring = []; for (let la = -80; la <= 80; la += 4) ring.push([l0, la]); for (let la = 80; la >= -80; la -= 4) ring.push([l1, la]); ring.push([l0, -80]); return { type: 'Polygon', coordinates: [ring] }; }
function mapUnder(t) {
  const al = 0.10 * (t < A.b1 ? clamp(t / 0.5) : 1); if (al <= 0) return;
  m.save(); for (let k = -12; k < 12; k += 2) { pathM(band(k * 15 - 7.5, k * 15 + 7.5)); m.fillStyle = `rgba(255,255,255,${al})`; m.fill(); } m.restore();
}
function mapOver(t) {
  const a = A;
  if (t > a.soleil - 0.3 && t < a.nouvel + 0.2) { // nuit qui tourne : le soleil éclaire toujours un bout de France
    const al = Math.min(clamp((t - a.soleil + 0.3) / 0.4), fadeOut(t, a.nouvel - 0.2, 0.4)); const lon = 60 - (t - a.soleil) * 120;
    m.save(); pathM(d3.geoCircle().center([lon + 180, 15]).radius(90)()); m.globalAlpha = al * 0.5; m.fillStyle = '#04112a'; m.fill(); m.restore();
  }
}

// ---------- calque écran ----------
function frPin(c, k, t, t0, t1, label, o = {}) {
  if (t < t0 || (t1 != null && t > t1 + 0.3)) return; const p = S(...L_(k)); const s = popIn(t, t0, 0.3) * (o.r || 1); const al = t1 != null ? fadeOut(t, t1, 0.3) : 1;
  c.save(); c.globalAlpha *= al; c.translate(p.x, p.y);
  if (o.wave) { const wv = ((t - t0) % 0.9) / 0.9; c.beginPath(); c.arc(0, 0, 26 + 60 * wv, 0, 7); c.lineWidth = 5; c.strokeStyle = `rgba(255,255,255,${0.8 * (1 - wv)})`; c.stroke(); }
  c.scale(s, s); c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 10; c.beginPath(); c.arc(0, 0, 22, 0, 7); c.fillStyle = '#fff'; c.fill(); c.shadowColor = 'transparent';
  c.save(); c.beginPath(); c.arc(0, 0, 18, 0, 7); c.clip(); if (FL.fr) c.drawImage(FL.fr, -24, -18, 48, 36); c.restore();
  c.restore();
  if (label && p.x > -40 && p.x < W + 40 && p.y > -40 && p.y < H + 40) { const lx = o.lx != null ? p.x + o.lx : clamp(p.x, 260, 820), ly = p.y + (o.ly ?? 62); txt(c, typed(label, t, t0 + 0.05, 0.35), lx, ly, { size: o.size || 46, weight: 900, color: '#fff', stroke: '#000', sw: 9 }); }
}
function clockAt(c, x, y, r, hh, mm, t, t0, city, icon) {
  const s = popIn(t, t0, 0.35); c.save(); c.translate(x, y); c.scale(s, s);
  sprite(c, 'clock', 0, r, 2 * r, { shadow: false });
  const ha = ((hh % 12) + mm / 60) / 12 * 2 * Math.PI, ma = mm / 60 * 2 * Math.PI; c.lineCap = 'round'; c.strokeStyle = '#111';
  c.lineWidth = r * 0.09; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.sin(ha) * r * 0.45, -Math.cos(ha) * r * 0.45); c.stroke();
  c.lineWidth = r * 0.06; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.sin(ma) * r * 0.68, -Math.cos(ma) * r * 0.68); c.stroke(); c.beginPath(); c.arc(0, 0, r * 0.07, 0, 7); c.fillStyle = '#e01b24'; c.fill();
  sprite(c, icon, r * 0.78, -r * 0.35, r * 0.7, { shadow: false, rot: 0.1 * Math.sin(t * 3) });
  txt(c, city, 0, r + 38, { size: 38, weight: 900, color: '#fff', stroke: '#000', sw: 8 });
  txt(c, String(hh).padStart(2, '0') + ' H', 0, r + 84, { size: 46, weight: 900, color: GOLD, stroke: '#1b1300', sw: 9 });
  c.restore();
}
function screenScene(c, t) {
  const a = A;
  // accroche
  if (t < a.b1 + 0.2) {
    const al = fadeOut(t, a.b1, 0.3);
    if (t > a.fus - 0.1 && t < a.ru) tag(c, 'LE PLUS DE FUSEAUX HORAIRES ?', W / 2, 470, { size: 50, bg: '#111', color: GOLD, border: GOLD, sc: popIn(t, a.fus, 0.3) * fadeOut(t, a.ru - 0.15, 0.15) });
    for (const [t0, t1, s, f] of [[a.ru, a.us - 0.1, 'RUSSIE ?', FL.ru], [a.us, a.fr - 0.1, 'ÉTATS-UNIS ?', FL.us]]) { if (t < t0 - 0.05 || t > t1 + 0.3) continue; tag(c, s, W / 2, 470, { size: 70, bg: '#555', border: '#fff', sc: popIn(t, t0, 0.3) * fadeOut(t, t1, 0.3) }); if (t > t0 + 0.6) { c.save(); c.globalAlpha = fadeOut(t, t1, 0.3); c.translate(W / 2, 470); c.lineWidth = 16; c.lineCap = 'round'; c.strokeStyle = '#e01b24'; const k = easeOut(prog(t, t0 + 0.6, 0.25)); c.beginPath(); c.moveTo(-260, -60); c.lineTo(-260 + 520 * k, -60 + 120 * k); c.stroke(); c.restore(); } }
    if (t > a.fr - 0.05) { c.save(); c.globalAlpha = al; TWELVE.forEach((k, i) => frPin(c, k, t, a.fr + 0.1 + i * 0.07, null, null, { wave: true })); c.restore(); tag(c, 'LA FRANCE !', W / 2, 470, { size: 80, bg: BLUE, border: '#fff', sc: popIn(t, a.fr, 0.3) * fadeOut(t, a.douze - 0.15, 0.15) }); }
    if (t > a.douze - 0.1) counter(c, 12, t, a.douze - 0.1, a.douze + 0.4, W / 2, 500, { size: 200, label: 'FUSEAUX HORAIRES', until: a.b1 - 0.2 });
  }
  // trois horloges
  if (t > a.midi - 0.1 && t < a.b2 + 0.3) {
    const al = fadeOut(t, a.b2, 0.3); c.save(); c.globalAlpha = al;
    clockAt(c, 200, 1200, 120, 12, 0, t, a.midi - 0.1, 'PARIS', 'sun'); if (t > a.onze - 0.1) clockAt(c, 540, 1200, 120, 23, 0, t, a.onze - 0.1, 'WALLIS', 'moon'); if (t > a.une - 0.1) clockAt(c, 880, 1200, 120, 1, 0, t, a.une - 0.1, 'TAHITI', 'moon');
    c.restore();
    frPin(c, 'paris', t, a.paris, a.wf1 - 0.2, 'PARIS', { wave: true }); frPin(c, 'wf', t, a.wf1, a.b2, 'WALLIS-ET-FUTUNA', { wave: true }); frPin(c, 'ta', t, a.ta1, a.b2, 'TAHITI', { wave: true, ly: -60 });
  }
  // outre-mer
  if (t > a.om - 0.1 && t < VISIT[0].t) { TWELVE.forEach((k, i) => frPin(c, k, t, a.om + i * 0.03, VISIT[0].t - 0.2, null, { wave: true })); tag(c, "L'OUTRE-MER", W / 2, 470, { size: 80, bg: BLUE, border: '#fff', sc: popIn(t, a.om, 0.3) * fadeOut(t, VISIT[0].t - 0.2, 0.2) }); }
  // le tour
  VISIT.forEach(v => {
    if (t < v.t - 0.1 || t > v.end + 0.3) return; const p = S(...L_(v.k)); const al = fadeOut(t, v.end, 0.3);
    frPin(c, v.k, t, v.t, v.end, TER[v.k][1], { wave: true, ly: 70 }); v.more.forEach(k2 => frPin(c, k2, t, v.t + 0.75, v.end, TER[k2][1], { ly: 120 }));
    if (v.k === 'ta') { frPin(c, 'mar', t, v.tb - 0.1, v.end, 'MARQUISES', { ly: 0, lx: 130, size: 36 }); frPin(c, 'gam', t, v.tb + 0.1, v.end, 'GAMBIER', { ly: 0, lx: 115, size: 36 }); }
    const dy = t < v.t + 0.35 ? -700 * (1 - easeIn((t - v.t + 0.1) / 0.45)) : 0; c.save(); c.globalAlpha = al; sprite(c, v.spr, clamp(p.x + 250, 220, 870), clamp(p.y + 30, 640, 1380) + dy + 5 * Math.sin(t * 4), 240, { shadow: false }); c.restore();
    if (v.tb && t > v.tb - 0.05) tag(c, v.lab, W / 2, 480, { size: v.lab.length > 6 ? 76 : 110, bg: v.lab[0] === '−' ? '#1d4fd8' : v.lab[0] === '+' ? '#e0731b' : '#111', color: v.lab[0] === '3' ? GOLD : '#fff', border: '#fff', sc: stampScale(t, v.tb) * al });
    if (v.tb && v.k !== 'ta' && t > v.tb - 0.05) txt(c, 'PAR RAPPORT À PARIS', W / 2, 590, { size: 30, weight: 900, color: '#fff', stroke: '#000', sw: 7 });
  });
  // Russie, États-Unis
  if (t > a.b4 - 0.1 && t < a.b5) {
    const al = fadeOut(t, a.b5 - 0.25, 0.25) * popIn(t, a.b4 - 0.1, 0.3); c.save(); c.globalAlpha = al;
    rr(c, 150, 930, 780, 545, 30); c.fillStyle = 'rgba(10,20,40,.6)'; c.fill();
    [[FL.fr, 12, 'FRANCE', a.b4, BLUE], [FL.ru, 11, 'RUSSIE', a.ru4, '#888'], [FL.us, 11, 'USA', a.us4, '#888']].forEach(([f, n, lab, t0, col], i) => {
      if (t < t0 - 0.05) return; const x = 300 + i * 240, h = 280 * n / 12 * easeOut(prog(t, t0, 0.5)); rr(c, x - 70, 1340 - h, 140, Math.max(1, h), 14); c.fillStyle = col; c.fill(); c.lineWidth = 4; c.strokeStyle = '#fff'; c.stroke();
      txt(c, String(Math.round(n * easeOut(prog(t, t0, 0.5)))), x, 1295 - h, { size: 70, weight: 900, color: GOLD, stroke: '#1b1300', sw: 10 });
      c.save(); c.beginPath(); c.arc(x, 1385, 30, 0, 7); c.clip(); if (f) c.drawImage(f, x - 40, 1355, 80, 60); c.restore(); txt(c, lab, x, 1440, { size: 32, weight: 900, color: '#fff', stroke: '#000', sw: 7 });
    });
    c.restore();
  }
  // 22 heures
  if (t > a.ta5 - 0.1 && t < a.b6) {
    const pT = S(...L_('ta')), pW = S(...L_('wf')); frPin(c, 'ta', t, a.ta5, a.b6 - 0.2, 'TAHITI', { wave: true, ly: 70 }); frPin(c, 'wf', t, a.wf5, a.b6 - 0.2, 'WALLIS', { wave: true, ly: 70 });
    if (t > a.h22 - 0.1) distanceLine(c, [pW.x, pW.y], [pT.x, pT.y], t, a.h22 - 0.1, '22 H', { until: a.b6 - 0.2 });
    stampText(c, 'LE MÊME PAYS !', W / 2, 480, t, a.meme, a.b6 - 0.15, { col: BLUE, size: 80 });
    if (t > a.h22 && t < a.meme) { clockAt(c, 300, 1250, 100, 1, 0, t, a.h22, 'TAHITI', 'moon'); clockAt(c, 780, 1250, 100, 23, 0, t, a.h22 + 0.15, 'WALLIS', 'moon'); }
  }
  // soleil
  if (t > a.soleil - 0.2 && t < a.nouvel) {
    const al = fadeOut(t, a.nouvel - 0.2, 0.25); const u = (t - a.soleil) * 0.7; c.save(); c.globalAlpha = al; sprite(c, 'sun', W / 2 + 300 * Math.cos(u * 3), 760 + 60 * Math.sin(u * 3), 230 * popIn(t, a.soleil - 0.2, 0.35), { shadow: false, rot: t }); TWELVE.forEach(k => frPin(c, k, t, a.soleil, a.nouvel - 0.2, null)); c.restore();
    stampText(c, 'JAMAIS', W / 2, 480, t, a.jamais, a.nouvel - 0.15, { size: 110, col: '#e0731b' });
  }
  // Nouvel An
  if (t > a.nouvel - 0.1 && t < a.b7) {
    const al = fadeOut(t, a.b7 - 0.25, 0.25);
    tag(c, 'NOUVEL AN', W / 2, 400, { size: 64, bg: '#111', color: GOLD, border: GOLD, sc: popIn(t, a.nouvel, 0.3) * al });
    if (t > a.h22b - 0.1) counter(c, 22, t, a.h22b - 0.1, a.h22b + 0.4, W / 2, 540, { size: 120, suf: ' H', until: a.b7 - 0.25 });
    for (const [k, t0] of [['wf', a.nouvel + 0.3], ['ta', a.ta6]]) { if (t < t0 - 0.1 || (k === 'wf' && t > a.ta6 + 0.2)) continue; const p = S(...L_(k)); c.save(); c.globalAlpha = al; for (let j = 0; j < 3; j++) { const ph = ((t - t0) * 1.4 + j / 3) % 1; sprite(c, 'fireworks', p.x + (j - 1) * 160, p.y - 60 - 80 * j % 2, 230 * easeOut(ph), { shadow: false, alpha: 1 - ph * ph }); } c.restore(); frPin(c, k, t, t0, k === 'wf' ? a.ta6 - 0.1 : a.b7 - 0.2, k === 'wf' ? 'WALLIS · 1ER' : 'TAHITI · DERNIER', { wave: true, ly: 80 }); }
    if (t > a.nouvel + 0.2) { c.save(); c.globalAlpha = al; sprite(c, 'champagne', 200, 1440, 260 * popIn(t, a.nouvel + 0.2, 0.35), { shadow: false, rot: 0.05 * Math.sin(t * 5) }); c.restore(); }
  }
  // Terre Adélie
  if (t > a.adelie - 0.1 && t < a.b8) {
    const p = S(...L_('ad')); const al = fadeOut(t, a.b8 - 0.25, 0.25); frPin(c, 'ad', t, a.adelie, a.b8 - 0.2, 'TERRE ADÉLIE', { wave: true, ly: -70 });
    const dy = t < a.adelie + 0.35 ? -700 * (1 - easeIn((t - a.adelie + 0.1) / 0.45)) : 0; c.save(); c.globalAlpha = al; sprite(c, 'penguin', clamp(p.x + 300, 220, 900), clamp(p.y + 60, 640, 1380) + dy, 280, { shadow: false, rot: 0.06 * Math.sin(t * 6) }); c.restore();
    if (t > a.antar - 0.05 && t < a.treize) tag(c, '+10 H · ANTARCTIQUE', W / 2, 480, { size: 56, bg: '#e0731b', border: '#fff', sc: popIn(t, a.antar, 0.3) * fadeOut(t, a.treize - 0.15, 0.15) });
    if (t > a.treize - 0.1) counter(c, 13, t, a.treize - 0.1, a.treize + 0.3, W / 2, 500, { size: 200, label: 'FUSEAUX', until: a.b8 - 0.25 });
  }
  // fin
  if (t > a.savais - 0.15) {
    TWELVE.concat(['ad']).forEach(k => frPin(c, k, t, a.b8, null, null));
    const s = popIn(t, a.savais - 0.15, 0.35) * (1 + 0.05 * Math.sin(t * 6)); c.save(); c.translate(W / 2, 1000); c.scale(s, s); sprite(c, 'qmark', 0, 150, 300, { shadow: false }); c.restore();
    tag(c, 'TU LE SAVAIS ?', W / 2, 470, { size: 80, bg: '#C00E1F', border: '#fff', sc: popIn(t, a.savais, 0.3), rot: -0.03 });
    if (t > a.comm - 0.1) tag(c, 'DIS-LE EN COMMENTAIRE', W / 2, 620, { size: 48, bg: '#111', color: GOLD, border: GOLD, sc: popIn(t, a.comm, 0.3) });
    if (t > a.abo - 0.15) tag(c, 'ABONNE-TOI', W / 2, 1290, { size: 70, bg: '#C00E1F', border: '#fff', sc: stampScale(t, a.abo) });
  }
}
