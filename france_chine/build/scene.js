// scene.js — Team France vs Team Chine (scénario imaginaire). Moteur : engine.js.
const CNR = '#de2910';
const P_ = { paris: [2.35, 48.86], pekin: [116.4, 39.9], shanghai: [121.47, 31.23], noumea: [166.45, -22.27], papeete: [-149.57, -17.54], washington: [-77.04, 38.9] };
const CFG = {
  teamCol: { f: '#3b7bff', a: '#ff3b4e', g: '#9aa0a6', h: '#c9ccd1' },
  trail: { jet_fr: '#F7EF08', jet_cn: '#ff5a5a' },
  NAME: { '250': 'FRANCE', '156': 'CHINE', '540': 'NOUVELLE-CALÉDONIE', '258': 'POLYNÉSIE', '408': 'CORÉE DU NORD' },
  ANCH: { '250': [2.4, 46.8], '156': [104, 35], '540': [165.6, -21.3], '258': [-149.4, -17.6], '408': [127.2, 40.1] },
  sides: [[-1, BLUE, 'TEAM FRANCE', 'f', 'fr'], [1, CNR, 'TEAM CHINE', 'a', 'cn']],
  sprites: ['jet_fr', 'jet_cn', 'sol_fr_a', 'sol_fr_b', 'sol_fr_tro', 'sol_cn_a', 'sol_cn_b', 'sol_kp', 'ship_cn', 'ship_fr', 'fleet_cn', 'umbrella', 'truck', 'globe', 'missile', 'eu', 'qmark', 'shield_crack'],
  extraFlags: ['eu', 'fr', 'cn', 'kp'],
};
let NATO_REST = [];

function setup() {
  const a = A; ISO['540'] = 'fr'; ISO['258'] = 'fr';
  a.cn0 = T(0, 'chine'); a.fr0 = T(0, 'france'); a.qui = T(0, 'qui'); a.tf = T(0, 'team'); a.contre = T(0, 'contre'); a.tc = T(0, 'team', 2);
  a.b1 = beatStart(1); a.paris = T(1, 'paris'); a.nc = T(1, 'nouvellecaledonie'); a.pf = T(1, 'polynesie'); a.pac = T(1, 'pacifique'); a.bout = T(1, 'lautre');
  a.b2 = beatStart(2); a.otan = T(2, 'lotan'); a.n32 = T(2, 'trentedeux'); a.traite = T(2, 'traite'); a.eur = T(2, 'leurope'); a.amn = T(2, 'lamerique'); a.atl = T(2, 'latlantique'); a.pac2 = T(2, 'pacifique'); a.couvert = T(2, 'couvert');
  a.b3 = beatStart(3); a.ue = T(3, 'lunion'); a.partie = T(3, 'partie');
  a.b4 = beatStart(4); a.seul = T(4, 'seul'); a.kp = T(4, 'coree');
  a.b5 = beatStart(5); a.marine = T(5, 'marine'); a.grande = T(5, 'grande'); a.n370 = T(5, 'trois'); a.ogives = T(5, 'ogives'); a.n620 = T(5, 'six'); a.fr5 = T(5, 'france'); a.n290 = T(5, 'deux');
  a.b6 = beatStart(6); a.km = T(6, 'dixsept'); a.pk = T(6, 'pekinnoumea'); a.moins = T(6, 'deux');
  a.b7 = beatStart(7); a.soldats = T(7, 'soldats'); a.sous = T(7, 'sous'); a.nickel = T(7, 'nickel');
  a.b8 = beatStart(8); a.tf8 = T(8, 'team'); a.tc8 = T(8, 'team', 2); a.comm = T(8, 'commentaire'); a.abo = T(8, 'abonnetoi'); a.fin = TE(8, 'abonnetoi');
  a.sb = a.tc + 0.35; DUR = a.fin + 0.6; a.big = [[a.b8 + 0.1, DUR + 1]];

  // ---- pays
  C('156', a.cn0, 'a', { named: true }); C('250', a.fr0, 'f', { named: true }); SCORE.a.push([a.cn0, 1]); SCORE.f.push([a.fr0, 1]);
  C('540', a.nc, 'f', { named: true }); C('258', a.pf, 'f', { named: true });
  NATO_REST = WORLD.NATO.filter(id => id !== '250').sort((x, y) => d3.geoDistance(WORLD.cent[x], P_.paris) - d3.geoDistance(WORLD.cent[y], P_.paris));
  NATO_REST.forEach((id, i) => { const t = a.otan + 0.1 + i * 0.03; C(id, t, 'f'); C(id, a.couvert, 'h'); C(id, a.b4, 'x'); });
  SCORE.f.push([a.n32, 31]); SCORE.f.push([a.couvert, -31]);
  C('408', a.kp, 'a', { named: true }); SCORE.a.push([a.kp, 1]);

  // ---- vols
  LEGS.push({ jet: 'jet_cn', a: P_.shanghai, b: P_.noumea, t0: a.nc - 0.75, t1: a.nc + 0.15, noFollow: true });
  LEGS.push({ jet: 'jet_fr', a: P_.paris, b: P_.noumea, t0: a.b6 - 0.1, t1: a.km + 0.4, noFollow: true });
  LEGS.push({ jet: 'jet_cn', a: P_.pekin, b: P_.noumea, t0: a.pk - 0.1, t1: a.moins, noFollow: true });
  JETVIS = { jet_cn: [[a.nc - 1.1, a.pf], [a.pk - 0.2, a.b7 - 0.1]], jet_fr: [[a.b6 - 0.3, a.pk + 0.4]] };

  // ---- caméra
  buildCam([
    st(0, 0, 60, 38, 330, { drift: 0.05 }),
    st(a.cn0 + 0.8, 0.9, 105, 33, 900),
    st(a.fr0 + 0.9, 1.0, 40, 40, 420),
    st(a.qui + 0.8, 0.8, 50, 38, 360),
    st(a.tf + 0.5, 0.8, 20, 42, 470),
    st(a.tc + 0.3, 0.8, 90, 35, 520),
    st(a.b1 + 0.4, 0.9, 6, 46, 1600, { drift: 0.04 }),
    st(a.paris + 0.15, 0.6, 3, 47.5, 2200),
    st(a.nc - 0.1, 0.9, 145, 5, 390),
    st(a.nc + 0.6, 0.6, 160, -12, 700),
    st(a.pf + 0.5, 1.0, -175, -18, 520),
    st(a.pac + 0.3, 0.8, -170, -10, 300),
    st(a.bout + 0.2, 0.8, 140, 0, 175, { drift: 0.03 }),
    st(a.otan + 0.4, 1.0, -30, 42, 300, { drift: 0.04 }),
    st(a.n32 + 0.3, 0.7, -20, 45, 340),
    st(a.eur + 0.2, 0.7, 10, 45, 380),
    st(a.amn + 0.2, 0.7, -80, 40, 330),
    st(a.atl + 0.2, 0.7, -40, 35, 300),
    st(a.pac2 + 0.2, 1.0, -170, -5, 280),
    st(a.couvert + 0.2, 0.7, 175, -12, 320),
    st(a.ue + 0.3, 0.9, 166, -21, 6600, { drift: 0.04 }),
    st(a.partie + 0.2, 0.7, 165.8, -21.4, 7800),
    st(a.b4 + 0.3, 1.1, 112, 34, 650, { drift: 0.04 }),
    st(a.kp + 0.2, 0.8, 120, 38, 1100),
    st(a.marine + 0.3, 1.0, 122, 27, 1000, { drift: 0.04 }),
    st(a.grande + 0.2, 0.7, 121, 27, 1200),
    st(a.n370 + 0.2, 0.7, 120, 28, 1400),
    st(a.ogives + 0.2, 0.8, 105, 33, 700),
    st(a.fr5 + 0.2, 0.7, 60, 40, 420),
    st(a.b6 + 0.4, 1.0, 95, 10, 172, { drift: 0.02 }),
    st(a.pk + 0.3, 0.7, 128, 5, 200),
    st(a.b7 + 0.4, 1.1, 166, -21.5, 3600, { drift: 0.04 }),
    st(a.sous + 0.3, 0.8, 165.9, -21.2, 5200),
    st(a.nickel + 0.2, 0.7, 165.7, -21.4, 4400),
    st(a.tf8 + 0.2, 1.1, 80, 20, 260),
    st(a.tc8 + 0.2, 0.8, 100, 25, 300),
    st(a.abo + 0.1, 0.8, 80, 22, 270),
    st(a.fin + 0.5, 0.8, 80, 22, 285, { drift: 0.04 }),
  ]);
  A.tilt = [[a.tf - 0.5, a.b1, 18], [a.b4 - 0.3, a.kp + 0.4, 14], [a.b7 - 0.3, a.sous, 14], [a.tf8 - 0.3, a.comm, 12]];

  // ---- sons et actions
  ev(0, 'whoosh'); ev(a.cn0, 'scan'); ev(a.cn0 + 0.05, 'pop'); act(a.cn0, 'Chine', 'drapeau'); ev(a.fr0 - 0.3, 'whoosh'); ev(a.fr0, 'scan'); ev(a.qui, 'boing'); ev(a.tf, 'pop'); ev(a.contre, 'stamp'); ev(a.tc, 'pop'); ev(a.sb, 'pop');
  act(a.tf, 'soldat français', 'agite le drapeau'); act(a.tc, 'soldat chinois', 'pose');
  ev(a.paris, 'ping'); ev(a.paris + 0.4, 'stamp'); act(a.paris, 'Paris', 'barré'); ev(a.nc, 'scan'); ev(a.pf, 'scan'); ev(a.pac, 'swell'); ev(a.bout, 'pop'); act(a.bout, 'globe', 'tourne');
  for (const Lg of LEGS) { ev(Lg.t0, 'jet'); act(Lg.t0, Lg.jet, 'vole'); }
  ev(a.otan, 'shine'); NATO_REST.forEach((id, i) => { if (i % 3 === 0) ev(a.otan + 0.1 + i * 0.03, 'tic'); }); ev(a.n32, 'count'); act(a.n32, 'compteur', '32');
  ev(a.traite, 'photo'); ev(a.eur, 'draw'); act(a.eur, 'zone OTAN', 'se dessine'); ev(a.amn, 'pop'); ev(a.atl, 'pop'); ev(a.pac2, 'whoosh'); ev(a.couvert, 'impact'); act(a.couvert, 'parapluie troué', 'tombe'); ev(a.couvert + 0.1, 'crumble');
  ev(a.ue, 'pop'); act(a.ue, 'drapeau UE', 'barré'); ev(a.partie, 'stamp');
  ev(a.b4 - 0.2, 'whoosh'); ev(a.seul, 'boing'); ev(a.kp, 'scan'); ev(a.kp + 0.05, 'pop'); act(a.kp, 'soldat nord-coréen', 'arrive');
  ev(a.marine, 'wave'); act(a.marine, 'flotte chinoise', 'sort'); ev(a.grande, 'impact'); ev(a.n370, 'count'); ev(a.ogives, 'alarm'); act(a.ogives, 'missile', 'se lève'); ev(a.n620, 'count'); ev(a.n290, 'count'); act(a.n290, 'barres', '620/290');
  ev(a.km, 'stamp'); ev(a.moins, 'stamp'); act(a.moins, 'distance', '2x moins');
  ev(a.soldats, 'pop'); ev(a.soldats + 0.1, 'thud'); act(a.soldats, 'soldat français', 'sur place'); ev(a.nickel, 'thud'); act(a.nickel, 'camion', 'nickel');
  ev(a.tf8 - 0.2, 'cheer'); ev(a.tf8, 'pop'); ev(a.tc8, 'pop'); ev(a.comm, 'pop'); ev(a.abo, 'pop'); ev(a.abo + 0.1, 'ding'); act(a.tf8, 'soldats', 'face à face');
  fillGaps();
  window.PREVIEW = [0.4, a.fr0 + 0.4, a.contre + 0.4, a.paris + 0.6, a.nc + 0.4, a.pf + 0.6, a.bout + 0.5, a.n32 + 0.4, a.eur + 0.5, a.atl + 0.5, a.couvert + 0.5, a.ue + 0.5, a.partie + 0.4, a.seul + 0.3, a.kp + 0.5, a.marine + 0.6, a.n370 + 0.5, a.ogives + 0.5, a.n290 + 0.5, a.km + 0.4, a.moins + 0.4, a.soldats + 0.5, a.nickel + 0.5, a.tf8 + 0.4, a.abo + 0.4];
}
function fillGaps() { const ts = EVENTS.map(e => e[0]).sort((x, y) => x - y); for (let i = 1; i < ts.length; i++) for (let t = ts[i - 1] + 1.2; t < ts[i] - 0.3; t += 1.2) ev(t, 'tic'); }

// ---------- carte : zone OTAN + tropique ----------
function rectPoly(l0, l1, a0, a1) { const r = []; for (let x = l0; x <= l1; x += 2) r.push([x, a0]); for (let y = a0; y <= a1; y += 2) r.push([l1, y]); for (let x = l1; x >= l0; x -= 2) r.push([x, a1]); for (let y = a1; y >= a0; y -= 2) r.push([l0, y]); return { type: 'Polygon', coordinates: [r.reverse()] }; }
function mapOver(t) {
  const a = A; if (t < a.eur - 0.1 || t > a.b3 + 0.3) return; const al = clamp((t - a.eur + 0.1) / 0.4) * fadeOut(t, a.b3, 0.3);
  m.save(); pathM(rectPoly(-140, 45, 23.44, 78)); m.globalAlpha = al * 0.22; m.fillStyle = '#3b7bff'; m.fill(); m.globalAlpha = al; m.lineWidth = 6; m.setLineDash([22, 14]); m.strokeStyle = '#7fb2ff'; m.stroke(); m.restore();
  m.save(); m.globalAlpha = al; m.beginPath(); for (let x = -180; x <= 180; x += 3) { const p = P([x, 23.44]); x === -180 ? m.moveTo(p[0], p[1]) : m.lineTo(p[0], p[1]); } m.setLineDash([10, 10]); m.lineWidth = 4; m.strokeStyle = '#FFE928'; m.stroke(); m.restore();
}

// ---------- calque écran ----------
function noX(c, x, y, w, t, t0, t1) { if (t < t0 || t > t1 + 0.3) return; c.save(); c.globalAlpha = fadeOut(t, t1, 0.3); c.translate(x, y); c.lineWidth = 18; c.lineCap = 'round'; c.strokeStyle = '#e01b24'; const k = easeOut(prog(t, t0, 0.25)); c.beginPath(); c.moveTo(-w, -w); c.lineTo(-w + 2 * w * k, -w + 2 * w * k); c.stroke(); c.beginPath(); c.moveTo(w, -w); c.lineTo(w - 2 * w * k, -w + 2 * w * k); c.stroke(); c.restore(); }
function bars(c, t) {
  const a = A; if (t < a.ogives - 0.1 || t > a.b6 + 0.3) return; const al = fadeOut(t, a.b6 - 0.2, 0.3) * popIn(t, a.ogives - 0.1, 0.3);
  c.save(); c.globalAlpha = al; rr(c, 170, 880, 740, 580, 30); c.fillStyle = 'rgba(10,20,40,.6)'; c.fill(); txt(c, 'OGIVES NUCLÉAIRES', W / 2, 935, { size: 46, weight: 900, color: '#fff', stroke: '#000', sw: 8 });
  [[CNR, 620, a.n620, FL.cn, 380], [BLUE, 290, a.n290, FL.fr, 700]].forEach(([col, n, t0, f, x]) => { if (t < t0 - 0.1) return; const k = easeOut(prog(t, t0 - 0.1, 0.6)); const h = 270 * n / 620 * k; rr(c, x - 85, 1360 - h, 170, Math.max(1, h), 16); c.fillStyle = col; c.fill(); c.lineWidth = 5; c.strokeStyle = '#fff'; c.stroke(); txt(c, fmtNum(n * k), x, 1315 - h, { size: 66, weight: 900, color: '#FFE928', stroke: '#1b1300', sw: 10 }); c.save(); c.beginPath(); c.arc(x, 1405, 32, 0, 7); c.clip(); if (f) c.drawImage(f, x - 43, 1373, 86, 64); c.restore(); });
  c.restore();
}
function screenScene(c, t) {
  const a = A;
  // accroche
  if (t > a.qui && t < a.tf + 0.2) { const s = popIn(t, a.qui, 0.3) * fadeOut(t, a.tf - 0.1, 0.25); c.save(); c.translate(W / 2, 560); c.scale(s, s); sprite(c, 'qmark', 0, 150, 300, { shadow: false }); c.restore(); }
  if (t > a.tf - 0.1 && t < a.b1 + 0.3) {
    const al = fadeOut(t, a.b1, 0.3); c.save(); c.globalAlpha = al;
    waver(c, 'sol_fr', 230, 1440, 380, t, a.tf - 0.1, 0); tag(c, 'TEAM FRANCE', 230, 1010, { size: 50, bg: BLUE, border: '#fff', sc: popIn(t, a.tf, 0.3) });
    if (t > a.tc - 0.1) { soldier(c, 'sol_cn_a', 850, 1440, 390, t, a.tc - 0.1, { ph: 1 }); tag(c, 'TEAM CHINE', 850, 1010, { size: 50, bg: CNR, border: '#fff', sc: popIn(t, a.tc, 0.3) }); }
    if (t > a.contre) { c.save(); c.translate(540, 1200); const s = stampScale(t, a.contre); c.scale(s, s); c.shadowColor = '#ffd23a'; c.shadowBlur = 40; txt(c, 'VS', 0, 0, { size: 200, weight: 900, color: '#FFE928', stroke: '#3a2500', sw: 18, shadow: false }); c.restore(); }
    c.restore();
  }
  // la cible
  if (t > a.paris - 0.1 && t < a.nc) { const p = S(...P_.paris); ping(c, p.x, p.y, t, a.paris, 'PARIS', a.nc - 0.2); noX(c, p.x, p.y, 70, t, a.paris + 0.4, a.nc - 0.2); tag(c, 'PAS PARIS', W / 2, 470, { size: 70, bg: '#111', color: '#fff', border: '#fff', sc: popIn(t, a.paris + 0.3, 0.3) * fadeOut(t, a.nc - 0.2, 0.2) }); }
  if (t > a.pac - 0.05 && t < a.b2) tag(c, 'LE PACIFIQUE', W / 2, 470, { size: 70, bg: '#0b6fa8', border: '#fff', sc: popIn(t, a.pac, 0.3) * fadeOut(t, a.b2 - 0.2, 0.2) });
  if (t > a.bout - 0.1 && t < a.b2 + 0.2) { const s = popIn(t, a.bout - 0.1, 0.35) * fadeOut(t, a.b2, 0.25); c.save(); c.translate(W / 2, 1180); c.scale(s, s); c.rotate(0.15 * Math.sin(t * 2)); sprite(c, 'globe', 0, 170, 340, { shadow: false }); c.restore(); }
  for (const [k, t0] of [['noumea', a.nc], ['papeete', a.pf]]) if (t > t0 - 0.05 && t < a.b2) { const p = S(...P_[k]); ping(c, p.x, p.y, t, t0, null, a.b2 - 0.2); }
  // OTAN
  if (t > a.otan - 0.05 && t < a.b3) tag(c, 'OTAN', W / 2, 470, { size: 70, bg: '#1d3a8a', border: '#fff', sc: popIn(t, a.otan, 0.3) * fadeOut(t, a.eur - 0.15, 0.15) });
  if (t > a.n32 - 0.1 && t < a.eur) counter(c, 32, t, a.n32 - 0.1, a.n32 + 0.4, W / 2, 640, { size: 130, label: 'PAYS', until: a.eur - 0.2 });
  if (t > a.eur - 0.05 && t < a.pac2) { const k = [a.eur, a.amn, a.atl].filter(x => t > x - 0.05).length; tag(c, ['EUROPE', 'EUROPE + AMÉRIQUE DU NORD', 'ZONE OTAN : ATLANTIQUE NORD'][k - 1], W / 2, 470, { size: k === 3 ? 48 : 56, bg: '#1d3a8a', border: '#fff', sc: popIn(t, [a.eur, a.amn, a.atl][k - 1], 0.25) * fadeOut(t, a.pac2 - 0.15, 0.15) }); }
  if (t > a.pac2 - 0.1 && t < a.b3) {
    const al = fadeOut(t, a.b3 - 0.25, 0.25); const p = S(...P_.noumea); const dy = t < a.couvert ? -700 * (1 - easeIn(prog(t, a.pac2 - 0.1, a.couvert - a.pac2 + 0.1))) : 0;
    c.save(); c.globalAlpha = al; sprite(c, 'umbrella', clamp(p.x, 250, 830), clamp(p.y - 40, 600, 1300) + dy, 330, { shadow: false, rot: 0.05 * Math.sin(t * 4) }); c.restore();
    stampText(c, 'PACIFIQUE : PAS COUVERT', W / 2, 470, t, a.couvert, a.b3 - 0.15, { size: 56 });
  }
  // UE
  if (t > a.ue - 0.1 && t < a.b4) {
    const al = fadeOut(t, a.b4 - 0.25, 0.25); const s = popIn(t, a.ue - 0.1, 0.35); c.save(); c.globalAlpha = al; c.translate(W / 2, 560); c.scale(s, s); c.rotate(t * 0.4); sprite(c, 'eu', 0, 110, 220, { shadow: false }); c.restore();
    noX(c, W / 2, 560, 125, t, a.partie, a.b4 - 0.2); stampText(c, 'HORS DE L\'UE', W / 2, 1230, t, a.partie, a.b4 - 0.15, { size: 80 });
  }
  // Team Chine
  if (t > a.b4 - 0.1 && t < a.b5) {
    const al = fadeOut(t, a.b5 - 0.25, 0.25); c.save(); c.globalAlpha = al;
    soldier(c, 'sol_cn_a', 850, 1440, 390, t, a.b4 - 0.1); if (t < a.kp) tag(c, 'TEAM CHINE', 850, 1010, { size: 50, bg: CNR, border: '#fff', sc: popIn(t, a.b4, 0.3) * fadeOut(t, a.kp - 0.15, 0.15) });
    if (t > a.kp - 0.1) soldier(c, 'sol_kp', 600, 1460, 360, t, a.kp - 0.1, { ph: 2 });
    c.restore();
    if (t > a.seul - 0.05) tag(c, '1 SEUL ALLIÉ', W / 2, 470, { size: 70, bg: CNR, border: '#fff', sc: popIn(t, a.seul, 0.3) * fadeOut(t, a.b5 - 0.2, 0.2) });
  }
  // marine + ogives
  if (t > a.marine - 0.1 && t < a.ogives) {
    const al = fadeOut(t, a.ogives - 0.2, 0.25); const p = S(124, 26); c.save(); c.globalAlpha = al;
    for (let k = 0; k < 3; k++) { const u = easeOut(prog(t, a.marine + k * 0.25, 1.2)); sprite(c, 'fleet_cn', clamp(p.x, 200, 880) + (k - 1) * 230, clamp(p.y, 600, 1300) + 260 - 200 * u, 200 * popIn(t, a.marine + k * 0.25, 0.3), { shadow: false }); }
    c.restore();
    if (t > a.grande - 0.05 && t < a.n370) tag(c, 'N°1 MONDIAL', W / 2, 470, { size: 76, bg: CNR, border: '#fff', sc: stampScale(t, a.grande) * fadeOut(t, a.n370 - 0.15, 0.15) });
    if (t > a.n370 - 0.1) counter(c, 370, t, a.n370 - 0.1, a.n370 + 0.6, W / 2, 470, { size: 130, pre: '+ ', label: 'NAVIRES DE COMBAT', until: a.ogives - 0.25 });
  }
  if (t > a.ogives - 0.1 && t < a.n620) { const s = popIn(t, a.ogives - 0.1, 0.35) * fadeOut(t, a.n620 - 0.1, 0.2); c.save(); c.translate(W / 2, 1250); c.scale(s, s); sprite(c, 'missile', 0, 0, 260, { shadow: false }); c.restore(); }
  bars(c, t);
  // distances
  if (t > a.b6 - 0.1 && t < a.b7) {
    const al = fadeOut(t, a.b7 - 0.25, 0.25); const pN = S(...P_.noumea); ping(c, pN.x, pN.y, t, a.b6, 'NOUMÉA', a.b7 - 0.25);
    if (t > a.km - 0.1) tag(c, 'PARIS → NOUMÉA : 17 000 KM', W / 2, 470, { size: 46, bg: BLUE, border: '#fff', sc: stampScale(t, a.km) * fadeOut(t, a.pk - 0.15, 0.15) });
    if (t > a.pk - 0.05) tag(c, 'PÉKIN → NOUMÉA : 8 600 KM', W / 2, 470, { size: 46, bg: CNR, border: '#fff', sc: popIn(t, a.pk, 0.3) * al });
    stampText(c, '2 × MOINS', W / 2, 1230, t, a.moins, a.b7 - 0.15, { size: 110 });
  }
  // sur place
  if (t > a.soldats - 0.1 && t < a.b8) {
    const al = fadeOut(t, a.b8 - 0.25, 0.25); const p = S(...P_.noumea); c.save(); c.globalAlpha = al;
    const dy = t < a.soldats + 0.3 ? -800 * (1 - easeIn((t - a.soldats + 0.1) / 0.4)) : 0; sprite(c, 'sol_fr_tro', 240, 1450 + dy, 420, { shadow: false });
    sprite(c, 'ship_fr', clamp(p.x + 240, 200, 900), clamp(p.y + 200, 700, 1350), 300 * popIn(t, a.soldats + 0.3, 0.35), { shadow: false, rot: 0.04 * Math.sin(t * 2) });
    if (t > a.nickel - 0.15) { const d2 = t < a.nickel + 0.2 ? -700 * (1 - easeIn((t - a.nickel + 0.15) / 0.35)) : 0; sprite(c, 'truck', 760, 1440 + d2, 260, { shadow: false }); }
    c.restore();
    ping(c, p.x, p.y, t, a.b7, 'NOUMÉA', a.b8 - 0.25);
    if (t > a.soldats - 0.05 && t < a.sous) tag(c, 'DÉJÀ SUR PLACE', W / 2, 470, { size: 66, bg: BLUE, border: '#fff', sc: popIn(t, a.soldats, 0.3) * fadeOut(t, a.sous - 0.15, 0.15) });
    if (t > a.nickel - 0.05) tag(c, 'NICKEL', W / 2, 470, { size: 90, bg: '#5a6b2a', border: '#fff', sc: stampScale(t, a.nickel) * al });
  }
  // fin
  if (t > a.tf8 - 0.2) {
    waver(c, 'sol_fr', 210, 1450, 360, t, a.tf8 - 0.2, 0); soldier(c, 'sol_cn_a', 870, 1450, 370, t, a.tf8 - 0.1, { ph: 1 });
    if (t > a.tf8 - 0.05) tag(c, 'TEAM FRANCE', 210, 1030, { size: 46, bg: BLUE, border: '#fff', sc: popIn(t, a.tf8, 0.3) }); if (t > a.tc8 - 0.05) tag(c, 'TEAM CHINE', 870, 1030, { size: 46, bg: CNR, border: '#fff', sc: popIn(t, a.tc8, 0.3) });
    { const s = popIn(t, a.tf8 - 0.1, 0.3) * (1 + 0.1 * Math.max(0, 1 - Math.abs(t - a.tc8) / 0.15)); c.save(); c.translate(W / 2, 880); c.scale(s, s); txt(c, 'QUI GAGNE ?', 0, 0, { size: 120, weight: 900, color: '#FFE928', stroke: '#1b1300', sw: 14 }); c.restore(); }
    if (t > a.abo - 0.15) tag(c, 'ABONNE-TOI', W / 2, 1230, { size: 70, bg: '#C00E1F', border: '#fff', sc: stampScale(t, a.abo) });
  }
}
