// scene.js — Team Algérie vs Team Maroc (scénario imaginaire, aucun agresseur désigné). Moteur : engine.js.
const GREEN = '#0b8f45', MRED = '#c1272d';
const CAPS = { alger: [3.06, 36.75], rabat: [-6.84, 34.02], washington: [-77.04, 38.9], telaviv: [34.78, 32.08], paris: [2.35, 48.86], madrid: [-3.7, 40.42], londres: [-0.13, 51.5], abudhabi: [54.37, 24.45], riyad: [46.72, 24.71], manama: [50.58, 26.23], moscou: [37.62, 55.75], pekin: [116.4, 39.9], pretoria: [28.19, -25.75], tunis: [10.18, 36.8], oujda: [-1.9, 34.68] };
const CFG = {
  teamCol: { a: '#19c26b', m: '#ff3b4e', g: '#9aa0a6', h: '#c9ccd1' },
  trail: { jet_dz: '#7CFF9E', jet_ma: '#ff9a3a' },
  NAME: { '012': 'ALGÉRIE', '504': 'MAROC', '840': 'ÉTATS-UNIS', '376': 'ISRAËL', '250': 'FRANCE', '724': 'ESPAGNE', '826': 'ROYAUME-UNI', '784': 'ÉMIRATS', '682': 'ARABIE SAOUDITE', '048': 'BAHREÏN', '643': 'RUSSIE', '156': 'CHINE', '710': 'AFRIQUE DU SUD', '788': 'TUNISIE' },
  ANCH: { '012': [2.6, 30], '504': [-6.5, 32], '840': [-98, 39], '376': [34.9, 31.3], '250': [2.4, 46.8], '724': [-3.7, 40.2], '826': [-1.8, 53.2], '784': [54.3, 23.8], '682': [44.5, 23.5], '048': [50.55, 26.1], '643': [42, 56.5], '156': [108, 34], '710': [24.5, -29.5], '788': [9.5, 34.5] },
  sides: [[-1, GREEN, 'TEAM ALGÉRIE', 'a', 'dz'], [1, MRED, 'TEAM MAROC', 'm', 'ma']],
  sprites: ['jet_dz', 'jet_ma', 'sol_dz_a', 'sol_dz_b', 'sol_ma_a', 'sol_ma_b', 'gate', 'rope', 'handshake', 'handshake_us', 'calendar', 'desert', 'crate', 'money', 'parchment', 'stamp', 'uncle', 'qmark', 'padlock'],
  extraFlags: ['dz', 'ma'],
};

function setup() {
  const a = A; SCORE.m = [];
  a.dz0 = T(0, 'lalgerie'); a.ma0 = T(0, 'maroc'); a.guerre = T(0, 'guerre'); a.qui = T(0, 'qui'); a.ta = T(0, 'team'); a.contre = T(0, 'contre'); a.tm = T(0, 'team', 2);
  a.b1 = beatStart(1); a.tm1 = T(1, 'team'); a.us = T(1, 'etatsunis'); a.y2004 = T(1, 'deux'); a.il = T(1, 'israel'); a.accord = T(1, 'accord'); a.fr = T(1, 'france'); a.es = T(1, 'lespagne'); a.uk = T(1, 'royaumeuni'); a.ae = T(1, 'emirats'); a.sa = T(1, 'larabie'); a.bh = T(1, 'bahrein'); a.tous = T(1, 'tous'); a.sahara = T(1, 'sahara');
  a.b2 = beatStart(2); a.ta2 = T(2, 'team'); a.ru = T(2, 'russie'); a.vendeur = T(2, 'vendeur'); a.cn = T(2, 'chine'); a.za = T(2, 'lafrique'); a.tn = T(2, 'tunisie'); a.tous2 = T(2, 'tous'); a.alger = T(2, 'dalger');
  a.b3 = beatStart(3); a.aucun = T(3, 'aucun'); a.battre = T(3, 'battre'); a.traite = T(3, 'traite');
  a.b4 = beatStart(4); a.chiffres = T(4, 'chiffres'); a.n25 = T(4, 'vingtcinq'); a.six = T(4, 'six'); a.quatre = T(4, 'quatre'); a.hab = T(4, 'quarantesept'); a.n37 = T(4, 'trentesept');
  a.b5 = beatStart(5); a.frontiere = T(5, 'frontiere'); a.fermee = T(5, 'fermee'); a.y1994 = T(5, 'mille');
  a.b6 = beatStart(6); a.ta6 = T(6, 'team'); a.tm6 = T(6, 'team', 2); a.comm = T(6, 'commentaire'); a.abo = T(6, 'abonnetoi'); a.fin = TE(6, 'abonnetoi');
  a.sb = a.tm + 0.35; DUR = a.fin + 0.55; a.big = [[a.traite, a.chiffres - 0.2], [a.b6 + 0.2, DUR + 1]];

  // ---- pays
  C('012', a.dz0, 'a', { named: true }); C('504', a.ma0, 'm', { named: true }); SCORE.a.push([a.dz0, 1]); SCORE.m.push([a.ma0, 1]);
  const mar = [['840', a.us], ['376', a.il], ['250', a.fr], ['724', a.es], ['826', a.uk], ['784', a.ae], ['682', a.sa], ['048', a.bh]];
  const alg = [['643', a.ru], ['156', a.cn], ['710', a.za], ['788', a.tn]];
  mar.forEach(([id, t], i) => { C(id, t, 'm', { named: true }); SCORE.m.push([t, 1]); const t2 = a.aucun + 0.1 + i * 0.07; C(id, t2, 'g'); SCORE.m.push([t2, -1]); });
  alg.forEach(([id, t], i) => { C(id, t, 'a', { named: true }); SCORE.a.push([t, 1]); const t2 = a.aucun + 0.1 + i * 0.1; C(id, t2, 'g'); SCORE.a.push([t2, -1]); });

  // ---- avions
  const L = (jet, from, to, t0, t1, sMid, sEnd, o = {}) => LEGS.push({ jet, a: CAPS[from] || from, b: CAPS[to] || to, t0, t1, sMid, sEnd, ...o });
  L('jet_ma', 'rabat', 'washington', a.tm1 + 0.15, a.us, 300, 700); L('jet_ma', 'washington', 'telaviv', a.us + 0.9, a.il, 280, 1100);
  L('jet_ma', 'telaviv', 'paris', a.accord + 0.6, a.fr, 600, 1300); L('jet_ma', 'paris', 'madrid', a.fr + 0.1, a.es, 1200, 1400); L('jet_ma', 'madrid', 'londres', a.es + 0.1, a.uk, 1000, 1300);
  L('jet_ma', 'londres', 'abudhabi', a.uk + 0.1, a.ae, 380, 900); L('jet_ma', 'abudhabi', 'riyad', a.ae + 0.1, a.sa, 900, 1100); L('jet_ma', 'riyad', 'manama', a.sa + 0.15, a.bh, 1100, 1500);
  L('jet_dz', 'alger', 'moscou', a.ta2 + 0.15, a.ru, 450, 650); L('jet_dz', 'moscou', 'pekin', a.vendeur + 0.3, a.cn, 430, 520); L('jet_dz', 'pekin', 'pretoria', a.cn + 0.5, a.za, 330, 600); L('jet_dz', 'pretoria', 'tunis', a.za + 0.3, a.tn, 380, 900);
  JETVIS = { jet_ma: [[a.tm1 - 0.1, a.tous + 0.3]], jet_dz: [[a.ta2 - 0.1, a.tous2 + 0.3]] };

  // ---- caméra
  buildCam([
    st(0, 0, 0, 33, 2000, { drift: 0.05 }),
    st(a.ma0 + 0.3, 1.0, -3, 31.5, 1900),
    st(a.qui + 0.5, 1.0, -2, 32, 1400),
    st(a.ta + 0.2, 0.8, 0, 31, 1700),
    st(a.tm + 0.3, 0.8, -4, 31, 1600),
    st(a.tm1 - 0.2, 0.8, -6.84, 33.5, 2000),
    st(a.y2004 + 0.2, 0.9, -80, 39, 800),
    st(a.tous + 0.2, 1.1, -12, 25, 1700),
    st(a.sahara + 0.3, 0.9, -12.5, 24.5, 2300, { drift: 0.04 }),
    st(a.ta2 - 0.2, 0.9, 3, 35, 1600),
    st(a.tous2 + 0.2, 1.0, 2, 33, 1500),
    st(a.aucun + 0.2, 1.2, 25, 38, 430, { drift: 0.04 }),
    st(a.traite + 0.2, 0.8, 20, 37, 480),
    st(a.chiffres + 0.1, 1.1, -2, 31, 1500),
    st(a.n25 + 0.3, 0.8, -3, 31.5, 1850),
    st(a.six + 0.2, 0.8, -4, 31.5, 1500),
    st(a.quatre + 0.2, 0.8, -2, 31, 1900),
    st(a.hab + 0.2, 0.9, -1, 31, 1500),
    st(a.hab + 1.1, 0.8, -2, 31.5, 1850),
    st(a.n37 + 0.2, 0.8, -3, 31.5, 1500),
    st(a.frontiere + 0.2, 1.2, -1.9, 33.6, 3600),
    st(a.y1994 + 0.2, 0.9, -1.9, 34.2, 5200, { drift: 0.04 }),
    st(a.ta6 + 0.2, 1.1, -1, 31.5, 1500),
    st(a.tm6 + 0.2, 0.8, -3, 31.5, 1750),
    st(a.abo + 0.1, 0.8, -1, 32, 1550),
    st(a.fin + 0.5, 0.8, -1, 32, 1650, { drift: 0.04 }),
  ]);
  A.tilt = [[a.ta - 0.5, a.tm1, 18], [a.tous - 0.3, a.sahara + 0.6, 16], [a.chiffres - 0.3, a.quatre, 16], [a.frontiere - 0.3, a.y1994 + 0.6, 18]];

  // ---- sons et actions
  ev(0, 'whoosh'); ev(a.dz0, 'scan'); ev(a.dz0 + 0.05, 'pop'); ev(a.ma0, 'scan'); ev(a.ma0 + 0.05, 'pop'); ev(a.guerre, 'impact'); ev(a.qui, 'boing'); ev(a.ta, 'pop'); ev(a.contre, 'stamp'); ev(a.tm, 'pop'); ev(a.sb, 'pop');
  act(a.dz0, 'Algérie', 'drapeau'); act(a.ma0, 'Maroc', 'drapeau'); act(a.ta, 'soldat algérien', 'pose'); act(a.tm, 'soldat marocain', 'pose');
  for (const id in CS) for (const p of CS[id]) { if (p.t < a.b1) continue; ev(p.t, p.named ? 'scan' : 'tic'); if (p.named) ev(p.t + 0.05, 'pop'); }
  for (const Lg of LEGS) { ev(Lg.t0, 'jet'); act(Lg.t0, Lg.jet, 'vole'); }
  ev(a.tm1, 'pop'); act(a.tm1, 'soldat marocain', 'bras croisés'); ev(a.y2004, 'pop'); act(a.y2004, 'poignée de main', 'Maroc–USA'); ev(a.accord, 'photo'); act(a.accord, 'parchemin', 'accord 2021'); ev(a.tous - 0.2, 'whoosh'); ev(a.sahara, 'draw'); act(a.sahara, 'Sahara', 'contour disputé');
  ev(a.ta2, 'pop'); act(a.ta2, 'soldat algérien', 'bras croisés'); ev(a.vendeur, 'thud'); act(a.vendeur, 'caisse', 'tombe'); ev(a.cn + 0.6, 'pop'); act(a.cn + 0.4, 'poignée de main', 'Algérie–Chine'); ev(a.alger, 'ding');
  ev(a.aucun - 0.2, 'whoosh'); ev(a.aucun, 'crumble'); act(a.aucun, 'alliés', 's\'éteignent'); ev(a.battre, 'boing'); ev(a.traite, 'stamp'); act(a.traite, 'cadenas', 'cassé');
  ev(a.chiffres - 0.2, 'whoosh'); ev(a.chiffres, 'pop'); act(a.chiffres, 'barres budget', 'montent'); ev(a.n25, 'count'); ev(a.six, 'count'); ev(a.quatre, 'stamp'); ev(a.hab, 'count'); act(a.hab, 'compteurs habitants', 'montent'); ev(a.n37, 'count');
  ev(a.frontiere - 0.2, 'whoosh'); ev(a.frontiere + 0.2, 'draw'); act(a.frontiere, 'frontière', 'se dessine'); ev(a.fermee, 'barrier'); act(a.fermee, 'portail', 'se ferme'); ev(a.y1994, 'photo'); act(a.y1994, 'calendrier', '1994');
  ev(a.ta6 - 0.2, 'cheer'); ev(a.ta6, 'pop'); ev(a.tm6, 'pop'); ev(a.comm, 'pop'); ev(a.abo, 'pop'); ev(a.abo + 0.1, 'ding'); act(a.ta6, 'soldats', 'face à face');
  for (const x of [a.qui + 0.8, a.contre + 0.7, a.us + 0.6, a.il + 0.6, a.accord + 0.9, a.sahara + 0.6, a.ru + 0.6, a.za + 0.5, a.cn + 1.5, a.tous2 + 0.3, a.battre + 0.5, a.traite + 0.6, a.quatre + 0.6, a.n37 + 0.6, a.fermee + 0.6, a.y1994 + 0.8, a.comm + 0.5]) ev(x, 'tic');
  window.PREVIEW = [0.5, a.ma0 + 0.4, a.qui + 0.4, a.contre + 0.4, a.tm1 + 0.4, a.us + 0.3, a.y2004 + 0.3, a.il + 0.3, a.accord + 0.3, a.fr + 0.2, a.uk + 0.2, a.sa + 0.2, a.bh + 0.3, a.tous + 0.6, a.sahara + 0.4, a.ta2 + 0.4, a.ru + 0.3, a.vendeur + 0.4, a.cn + 0.6, a.za + 0.3, a.tn + 0.3, a.alger + 0.3, a.aucun + 0.5, a.battre + 0.3, a.traite + 0.4, a.chiffres + 0.6, a.six + 0.4, a.quatre + 0.4, a.hab + 0.6, a.n37 + 0.4, a.frontiere + 0.6, a.fermee + 0.4, a.y1994 + 0.6, a.ta6 + 0.4, a.tm6 + 0.4, a.abo + 0.4];
}

// ---------- sur la carte ----------
function mapOver(t) {
  const a = A;
  if (t > a.sahara - 0.4 && t < a.ta2 + 0.2) { const al = clamp((t - a.sahara + 0.4) / 0.3) * fadeOut(t, a.ta2, 0.3); pathM(geomOf('732')); m.save(); m.globalAlpha = al; m.fillStyle = 'rgba(255,214,90,.22)'; m.fill(); m.setLineDash([20, 14]); m.lineDashOffset = -t * 40; m.lineWidth = 7; m.strokeStyle = '#FFE15A'; m.shadowColor = '#FFE15A'; m.shadowBlur = 16; m.stroke(); m.restore(); }
  if (t > a.frontiere && t < a.b6 + 0.3) {
    const al = fadeOut(t, a.b6, 0.3); const pts = WORLD.dzma.coordinates[0]; const u = easeOut(prog(t, a.frontiere + 0.1, 1.0)); const n = Math.max(2, Math.round(pts.length * u));
    m.save(); m.globalAlpha = al; m.beginPath(); pts.slice(0, n).forEach((p, i) => { const q = P(p); i ? m.lineTo(q[0], q[1]) : m.moveTo(q[0], q[1]); }); m.lineCap = 'round'; m.lineJoin = 'round'; m.lineWidth = 16; m.strokeStyle = '#2a0000'; m.stroke(); m.lineWidth = 9; m.strokeStyle = '#ff2d2d'; m.shadowColor = '#ff2d2d'; m.shadowBlur = 24; m.setLineDash([22, 12]); m.lineDashOffset = t * 40; m.stroke(); m.restore();
  }
}

// ---------- calque écran ----------
function screenScene(c, t) {
  const a = A;
  if (t > a.qui && t < a.ta + 0.2) { const s = popIn(t, a.qui, 0.3) * fadeOut(t, a.ta - 0.1, 0.25); c.save(); c.translate(W / 2, 560); c.scale(s, s); sprite(c, 'qmark', 0, 150, 300, { shadow: false }); c.restore(); }
  if (t > a.ta - 0.1 && t < a.b1 + 0.3) {
    const al = fadeOut(t, a.b1, 0.3); c.save(); c.globalAlpha = al;
    soldier(c, 'sol_dz_a', 230, 1440, 390, t, a.ta - 0.1); tag(c, 'TEAM ALGÉRIE', 230, 1010, { size: 50, bg: GREEN, border: '#fff', sc: popIn(t, a.ta, 0.3) });
    if (t > a.tm - 0.1) { soldier(c, 'sol_ma_a', 850, 1440, 390, t, a.tm - 0.1, { ph: 1 }); tag(c, 'TEAM MAROC', 850, 1010, { size: 50, bg: MRED, border: '#fff', sc: popIn(t, a.tm, 0.3) }); }
    if (t > a.contre) { c.save(); c.translate(540, 1200); const s = stampScale(t, a.contre); c.scale(s, s); c.shadowColor = '#ffd23a'; c.shadowBlur = 40; txt(c, 'VS', 0, 0, { size: 200, weight: 900, color: '#FFE928', stroke: '#3a2500', sw: 18, shadow: false }); c.restore(); }
    c.restore();
  }
  // Team Maroc
  if (t > a.tm1 - 0.1 && t < a.us + 0.3) { const al = fadeOut(t, a.us, 0.3); c.save(); c.globalAlpha = al; soldier(c, 'sol_ma_b', 850, 1440, 390, t, a.tm1 - 0.1); tag(c, 'TEAM MAROC', 850, 1010, { size: 50, bg: MRED, border: '#fff', sc: popIn(t, a.tm1, 0.3) }); c.restore(); }
  if (t > a.y2004 - 0.1 && t < a.il) { const al = fadeOut(t, a.il - 0.25, 0.25); const s = popIn(t, a.y2004 - 0.1, 0.35) * al; c.save(); c.translate(W / 2, 1230); c.scale(s, s); sprite(c, 'handshake_us', 0, 0, 200, { shadow: false, rot: 0.05 * Math.sin(t * 5) }); c.restore(); tag(c, 'ALLIÉ MAJEUR · 2004', W / 2, 470, { size: 50, bg: MRED, border: '#fff', sc: s }); }
  if (t > a.accord - 0.1 && t < a.fr) { const al = fadeOut(t, a.fr - 0.25, 0.25); const s = popIn(t, a.accord - 0.1, 0.35) * al; c.save(); c.translate(W / 2, 1220); c.scale(s, s); c.rotate(-0.05); sprite(c, 'parchment', 0, 190, 360, { shadow: false }); txt(c, 'ACCORD', -10, -10, { size: 52, font: 'Caveat', weight: 700, color: '#4a2a08', shadow: false }); txt(c, 'MILITAIRE', -10, 40, { size: 48, font: 'Caveat', weight: 700, color: '#4a2a08', shadow: false }); txt(c, '2021', -10, 92, { size: 50, font: 'Caveat', weight: 700, color: '#8a1010', shadow: false }); c.restore(); }
  if (t > a.tous - 0.1 && t < a.b2) { const al = fadeOut(t, a.b2 - 0.25, 0.25); const s = popIn(t, a.sahara - 0.2, 0.35) * al; c.save(); c.translate(W / 2, 1300); c.scale(s, s); sprite(c, 'desert', 0, 0, 230, { shadow: false }); c.restore(); tag(c, 'PLAN MAROCAIN POUR LE SAHARA', W / 2, 470, { size: 40, bg: MRED, border: '#fff', sc: popIn(t, a.tous, 0.3) * al }); c.save(); c.globalAlpha = s; txt(c, 'territoire disputé', W / 2, 545, { size: 34, weight: 800, color: '#FFE15A', stroke: '#000', sw: 7 }); c.restore(); }
  // Team Algérie
  if (t > a.ta2 - 0.1 && t < a.ru + 0.3) { const al = fadeOut(t, a.ru, 0.3); c.save(); c.globalAlpha = al; soldier(c, 'sol_dz_b', 850, 1440, 390, t, a.ta2 - 0.1); tag(c, 'TEAM ALGÉRIE', 850, 1010, { size: 50, bg: GREEN, border: '#fff', sc: popIn(t, a.ta2, 0.3) }); c.restore(); }
  if (t > a.vendeur - 0.2 && t < a.cn) { const al = fadeOut(t, a.cn - 0.25, 0.25); const pm = S(...CAPS.moscou); const y = lerp(pm.y - 500, pm.y + 40, easeIn(prog(t, a.vendeur - 0.2, 0.35))); c.save(); c.globalAlpha = al; sprite(c, 'crate', clamp(pm.x, 150, 930), clamp(y, 300, 1300), 170, { rot: -0.06 }); c.restore(); tag(c, '1er VENDEUR D\'ARMES', W / 2, 1230, { size: 50, bg: '#b22222', border: '#fff', sc: popIn(t, a.vendeur + 0.15, 0.3) * al }); }
  if (t > a.cn + 0.3 && t < a.za) { const al = fadeOut(t, a.za - 0.25, 0.25); const s = popIn(t, a.cn + 0.3, 0.35) * al; c.save(); c.translate(W / 2, 1240); c.scale(s, s); sprite(c, 'handshake', 0, 0, 200, { shadow: false, rot: 0.05 * Math.sin(t * 5) }); c.restore(); }
  if (t > a.tous2 - 0.1 && t < a.b3) tag(c, 'PROCHES D\'ALGER', W / 2, 470, { size: 54, bg: GREEN, border: '#fff', sc: popIn(t, a.tous2, 0.3) * fadeOut(t, a.b3 - 0.2, 0.2) });
  // aucun traité
  if (t > a.aucun - 0.1 && t < a.chiffres) { const al = fadeOut(t, a.chiffres - 0.25, 0.25); const s = popIn(t, a.aucun - 0.1, 0.35); c.save(); c.globalAlpha = al; c.translate(W / 2, 1150); c.scale(s, s); c.rotate(0.06 * Math.sin(t * 6)); sprite(c, 'padlock', 0, 120, 240, { shadow: false }); c.restore(); }
  stampText(c, 'AUCUN TRAITÉ', W / 2, 1300, t, a.traite - 0.05, a.chiffres - 0.15, { col: '#6b7076', size: 100 });
  // chiffres
  if (t > a.chiffres - 0.1 && t < a.frontiere) {
    const al = fadeOut(t, a.frontiere - 0.25, 0.25); const s = popIn(t, a.chiffres - 0.1, 0.35);
    const pop = t > a.hab - 0.3; const g1 = easeOut(prog(t, pop ? a.hab : a.n25 - 0.1, 0.7)), g2 = easeOut(prog(t, pop ? a.n37 - 0.2 : a.six - 0.1, 0.6));
    c.save(); c.globalAlpha = al; c.translate(W / 2, 1000); c.scale(s, s);
    rr(c, -400, -560, 800, 650, 30); c.fillStyle = 'rgba(255,255,255,.93)'; c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 30; c.fill(); c.shadowColor = 'transparent';
    txt(c, pop ? 'HABITANTS' : 'BUDGET MILITAIRE', 0, -500, { size: 44, weight: 900, color: '#111', shadow: false });
    const H1 = (pop ? 400 : 400) * g1, H2 = (pop ? 400 * 37 / 47 : 400 * 6.3 / 25.4) * g2;
    rr(c, -270, 20 - H1, 200, Math.max(1, H1), 14); c.fillStyle = GREEN; c.fill(); rr(c, 70, 20 - H2, 200, Math.max(1, H2), 14); c.fillStyle = MRED; c.fill();
    if (g1 > 0.5) txt(c, pop ? '47 M' : '25 Md$', -170, -H1 - 30, { size: 50, weight: 900, color: GREEN, shadow: false });
    if (g2 > 0.5) txt(c, pop ? '37 M' : '6 Md$', 170, -H2 - 30, { size: 50, weight: 900, color: MRED, shadow: false });
    if (!pop && g1 > 0.1) sprite(c, 'money', -330, 20, 90, { shadow: false });
    flagCard(c, -170, 65, FL.dz, 70); flagCard(c, 170, 65, FL.ma, 70); c.restore();
    if (!pop) stampText(c, '× 4', 760, 650, t, a.quatre, a.hab - 0.35, { col: GREEN, size: 110 });
    txt(c, pop ? 'ONS 2025 · RECENSEMENT 2024' : 'SIPRI 2025', W / 2, 1135, { size: 26, weight: 800, color: '#fff', stroke: '#000', sw: 6 });
  }
  // frontière
  if (t > a.fermee - 0.1 && t < a.b6) { const al = fadeOut(t, a.b6 - 0.25, 0.25); const pO = S(...CAPS.oujda); const y = lerp(pO.y - 400, pO.y + 60, easeOut(prog(t, a.fermee - 0.1, 0.3))); c.save(); c.globalAlpha = al; sprite(c, 'gate', clamp(pO.x, 200, 880), clamp(y, 400, 1250), 300, { shadow: false }); c.restore(); }
  if (t > a.y1994 - 0.1 && t < a.b6) { const al = fadeOut(t, a.b6 - 0.25, 0.25); const s = popIn(t, a.y1994 - 0.1, 0.35) * al; c.save(); c.translate(W / 2, 1330); c.scale(s, s); c.rotate(-0.05); sprite(c, 'calendar', 0, 0, 280, { shadow: false }); txt(c, '1994', 0, -110, { size: 90, font: 'Caveat', weight: 700, color: '#4a2a08', shadow: false }); c.restore(); }
  stampText(c, 'FERMÉE', W / 2, 520, t, a.fermee + 0.1, a.b6 - 0.15, { size: 110 });
  // fin
  if (t > a.ta6 - 0.2) {
    soldier(c, 'sol_dz_a', 210, 1450, 370, t, a.ta6 - 0.2); soldier(c, 'sol_ma_a', 870, 1450, 370, t, a.ta6 - 0.1, { ph: 1 });
    if (t > a.ta6 - 0.05) tag(c, 'TEAM ALGÉRIE', 210, 1030, { size: 46, bg: GREEN, border: '#fff', sc: popIn(t, a.ta6, 0.3) }); if (t > a.tm6 - 0.05) tag(c, 'TEAM MAROC', 870, 1030, { size: 46, bg: MRED, border: '#fff', sc: popIn(t, a.tm6, 0.3) });
    { const s = popIn(t, a.ta6 - 0.1, 0.3) * (1 + 0.1 * Math.max(0, 1 - Math.abs(t - a.tm6) / 0.15)); c.save(); c.translate(W / 2, 880); c.scale(s, s); txt(c, 'QUI GAGNE ?', 0, 0, { size: 120, weight: 900, color: '#FFE928', stroke: '#1b1300', sw: 14 }); c.restore(); }
    if (t > a.abo - 0.15) tag(c, 'ABONNE-TOI', W / 2, 1230, { size: 70, bg: '#C00E1F', border: '#fff', sc: stampScale(t, a.abo) });
  }
}
