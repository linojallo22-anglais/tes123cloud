// scene.js — Team France vs Team USA (scénario imaginaire). Moteur : engine.js.
const USR = '#b22234';
const CAPS = { washington: [-77.04, 38.9], newyork: [-74.0, 40.7], paris: [2.35, 48.86], berlin: [13.4, 52.52], rome: [12.5, 41.9], madrid: [-3.7, 40.42], varsovie: [21.01, 52.23], londres: [-0.13, 51.5], tokyo: [139.69, 35.69], seoul: [126.98, 37.57], canberra: [149.13, -35.28], ottawa: [-75.7, 45.42] };
const CFG = {
  teamCol: { f: '#3b7bff', a: '#ff3b4e', g: '#9aa0a6', h: '#c9ccd1' },
  trail: { jet_fr: '#F7EF08', jet_us: '#ff9a3a' },
  NAME: { '250': 'FRANCE', '840': 'ÉTATS-UNIS', '276': 'ALLEMAGNE', '380': 'ITALIE', '724': 'ESPAGNE', '616': 'POLOGNE', '826': 'ROYAUME-UNI', '392': 'JAPON', '410': 'CORÉE DU SUD', '036': 'AUSTRALIE', '124': 'CANADA' },
  ANCH: { '250': [2.4, 46.8], '840': [-98, 39], '276': [10.4, 51.1], '380': [12.6, 42.9], '724': [-3.7, 40.2], '616': [19.3, 52.1], '826': [-1.8, 53.2], '392': [138.5, 36.5], '410': [127.8, 36.3], '036': [134, -25], '124': [-100, 57] },
  sides: [[-1, BLUE, 'TEAM FRANCE', 'f', 'fr'], [1, USR, 'TEAM USA', 'a', 'us']],
  sprites: ['jet_fr', 'jet_us', 'sol_fr_a', 'sol_fr_b', 'sol_fr_x', 'sol_us_a', 'sol_us_b', 'sol_ca', 'carrier_us', 'carrier_fr', 'shield_crack', 'liberty', 'hands_split', 'qmark', 'padlock', 'bulldog', 'eu', 'nuke', 'scroll', 'uncle', 'money', 'trophy'],
  extraFlags: ['eu', 'fr', 'us', 'gb'],
};

function setup() {
  const a = A;
  a.us0 = T(0, 'etatsunis'); a.fr0 = T(0, 'france'); a.qui = T(0, 'qui'); a.tf = T(0, 'team'); a.contre = T(0, 'contre'); a.tu = T(0, 'team', 2);
  a.b1 = beatStart(1); a.prob = T(1, 'probleme'); a.otan1 = T(1, 'lotan'); a.art = T(1, 'larticle'); a.jamais = T(1, 'jamais'); a.otan2 = T(1, 'lotan', 2); a.explose = T(1, 'explose');
  a.b2 = beatStart(2); a.de = T(2, 'lallemagne'); a.it = T(2, 'litalie'); a.es = T(2, 'lespagne'); a.pl = T(2, 'pologne'); a.ue = T(2, 'lunion'); a.n26 = T(2, 'vingtsix'); a.obliges = T(2, 'obliges');
  a.b3 = beatStart(3); a.uk = T(3, 'royaumeuni'); a.pas = T(3, 'pas'); a.y2025 = T(3, 'deux'); a.bombe = T(3, 'bombe'); a.paris = T(3, 'paris'); a.plutot = T(3, 'plutot');
  a.b4 = beatStart(4); a.tu4 = T(4, 'team'); a.jp = T(4, 'japon'); a.kr = T(4, 'coree'); a.au = T(4, 'laustralie'); a.traites = T(4, 'traites'); a.aucun = T(4, 'aucun'); a.attaque = T(4, 'attaque');
  a.b5 = beatStart(5); a.ca = T(5, 'canada'); a.colle = T(5, 'colle'); a.otan5 = T(5, 'lotan'); a.coince = T(5, 'coince');
  a.b6 = beatStart(6); a.dep = T(6, 'depensent'); a.dix = T(6, 'dix'); a.onze = T(6, 'onze'); a.fr6 = T(6, 'france'); a.seul = T(6, 'seul');
  a.b7 = beatStart(7); a.bombe7 = T(7, 'bombe'); a.amerique = T(7, 'lamerique'); a.naitre = T(7, 'naitre'); a.y1778 = T(7, 'mille');
  a.b8 = beatStart(8); a.tf8 = T(8, 'team'); a.tu8 = T(8, 'team', 2); a.comm = T(8, 'commentaire'); a.abo = T(8, 'abonnetoi'); a.fin = TE(8, 'abonnetoi');
  a.sb = a.tu + 0.35; DUR = a.fin + 0.55; a.big = [[a.b8 + 0.2, DUR + 1]];

  // ---- pays
  C('840', a.us0, 'a', { named: true }); C('250', a.fr0, 'f', { named: true }); SCORE.a.push([a.us0, 1]); SCORE.f.push([a.fr0, 1]);
  const named = [['276', a.de], ['380', a.it], ['724', a.es], ['616', a.pl]];
  named.forEach(([id, t]) => { C(id, t, 'f', { named: true }); SCORE.f.push([t, 1]); });
  const rest = WORLD.EU.filter(id => !['250', ...named.map(x => x[0])].includes(id)).sort((x, y) => WORLD.cent[x][0] - WORLD.cent[y][0]);
  rest.forEach((id, i) => { const t = a.ue + 0.15 + i * 0.045; C(id, t, 'f'); SCORE.f.push([t, 1]); });
  C('826', a.uk, 'h', { named: true }); C('826', a.plutot, 'f'); SCORE.f.push([a.plutot, 1]);
  [['392', a.jp], ['410', a.kr], ['036', a.au]].forEach(([id, t], i) => { C(id, t, 'a', { named: true }); SCORE.a.push([t, 1]); C(id, a.aucun + 0.15 + i * 0.12, 'g'); SCORE.a.push([a.aucun + 0.15 + i * 0.12, -1]); });
  C('124', a.ca, 'h', { named: true });

  // ---- avions
  const L = (jet, from, to, t0, t1, sMid, sEnd, o = {}) => LEGS.push({ jet, a: CAPS[from] || from, b: CAPS[to] || to, t0, t1, sMid, sEnd, ...o });
  L('jet_fr', 'paris', 'berlin', a.b2 + 0.1, a.de, 1500, 1700); L('jet_fr', 'berlin', 'rome', a.de + 0.08, a.it, 1200, 1500); L('jet_fr', 'rome', 'madrid', a.it + 0.08, a.es, 1100, 1500); L('jet_fr', 'madrid', 'varsovie', a.es + 0.08, a.pl, 850, 1300);
  L('jet_us', 'washington', 'tokyo', a.tu4 - 0.15, a.jp, 230, 900); L('jet_us', 'tokyo', 'seoul', a.jp + 0.08, a.kr, 900, 1100); L('jet_us', 'seoul', 'canberra', a.kr + 0.08, a.au + 0.1, 450, 560);
  JETVIS = { jet_fr: [[a.b2 - 0.1, a.n26 + 0.5]], jet_us: [[a.tu4 - 0.25, a.attaque + 0.3]] };

  // ---- caméra
  buildCam([
    st(0, 0, -96, 39, 700, { drift: 0.05 }),
    st(a.fr0 + 0.3, 1.5, 2.4, 46.8, 2300),
    st(a.qui + 0.6, 1.0, -30, 44, 420),
    st(a.tf + 0.3, 0.8, -20, 46, 360),
    st(a.tu + 0.3, 0.8, -45, 42, 400),
    st(a.otan1 + 0.1, 0.9, -30, 50, 320, { drift: 0.04 }),
    st(a.jamais + 0.1, 0.8, -25, 48, 400),
    st(a.explose + 0.2, 0.6, -30, 47, 300),
    st(a.b2 + 0.05, 0.8, 2.35, 47.5, 1900),
    st(a.ue + 0.5, 0.9, 12, 50, 950),
    st(a.obliges + 0.3, 0.8, 10, 50, 1150),
    st(a.uk + 0.2, 1.0, -2, 53, 2200),
    st(a.y2025 + 0.2, 0.9, -0.5, 51, 2700),
    st(a.paris + 0.1, 0.8, 1, 50, 2400),
    st(a.plutot + 0.3, 0.9, -2, 51.5, 2000),
    st(a.tu4 - 0.2, 0.9, -77, 39, 900),
    st(a.traites + 0.3, 1.0, 140, 5, 520, { drift: 0.04 }),
    st(a.aucun + 0.3, 0.8, 138, 9, 580),
    st(a.ca + 0.2, 1.3, -92, 50, 520),
    st(a.colle + 0.4, 0.9, -88, 47, 700),
    st(a.otan5 + 0.2, 1.0, -45, 48, 400),
    st(a.coince + 0.2, 0.8, -60, 47, 480),
    st(a.dep + 0.2, 1.0, -40, 42, 360),
    st(a.onze + 0.2, 0.9, -45, 40, 420),
    st(a.seul + 0.1, 0.8, -30, 43, 380),
    st(a.bombe7 + 0.1, 1.0, 2.4, 46.8, 2200),
    st(a.amerique + 0.2, 1.1, -35, 44, 380),
    st(a.y1778 + 0.2, 0.8, -40, 43, 450),
    st(a.tf8 + 0.2, 1.0, -30, 45, 340),
    st(a.tu8 + 0.2, 0.8, -40, 43, 400),
    st(a.abo + 0.1, 0.8, -30, 45, 350),
    st(a.fin + 0.5, 0.8, -30, 45, 380, { drift: 0.04 }),
  ]);
  A.tilt = [[a.tf - 0.5, a.otan1, 18], [a.b2 - 0.3, a.it, 16], [a.ca - 0.3, a.otan5, 16], [a.tf8 - 0.3, a.comm, 16]];

  // ---- sons et actions
  ev(0, 'whoosh'); ev(a.us0, 'scan'); ev(a.us0 + 0.05, 'pop'); ev(a.fr0 - 0.4, 'whoosh'); ev(a.fr0, 'scan'); ev(a.fr0 + 0.05, 'pop'); ev(a.qui, 'boing'); ev(a.tf, 'pop'); ev(a.contre, 'stamp'); ev(a.tu, 'pop'); ev(a.sb, 'pop');
  act(a.us0, 'États-Unis', 'drapeau'); act(a.tf, 'soldat français', 'agite le drapeau'); act(a.tu, 'soldat américain', 'pose');
  for (const id in CS) for (const p of CS[id]) { if (p.t < a.b2) continue; ev(p.t, p.named ? 'scan' : 'tic'); if (p.named) ev(p.t + 0.05, 'pop'); }
  for (const Lg of LEGS) { ev(Lg.t0, 'jet'); act(Lg.t0, Lg.jet, 'vole'); }
  ev(a.prob, 'boing'); act(a.prob, 'mains', 'se séparent'); ev(a.otan1, 'shine'); act(a.otan1, 'OTAN', 's\'allume'); ev(a.art, 'pop'); act(a.art, 'bouclier', 'apparaît'); ev(a.jamais, 'boing'); ev(a.otan2, 'heartbeat'); ev(a.explose, 'impact'); act(a.explose, 'bouclier', 'se brise'); ev(a.explose + 0.1, 'crumble');
  ev(a.ue, 'shine'); act(a.ue, 'drapeau UE', 'tourne'); ev(a.n26, 'count'); ev(a.obliges, 'stamp');
  ev(a.uk - 0.2, 'whoosh'); act(a.uk, 'bouledogue', 'arrive'); ev(a.pas, 'stamp'); ev(a.y2025, 'pop'); ev(a.bombe, 'impact'); act(a.bombe, 'bombes', 'se relient'); ev(a.paris, 'draw'); ev(a.plutot, 'ding');
  ev(a.tu4, 'pop'); act(a.tu4, 'soldat américain', 'bras croisés'); ev(a.traites, 'photo'); act(a.traites, 'parchemin', 'traités'); ev(a.aucun, 'crumble'); act(a.aucun, 'cadenas', 'se casse'); ev(a.attaque, 'stamp');
  ev(a.ca - 0.3, 'whoosh'); ev(a.colle, 'squeeze'); act(a.colle, 'soldat canadien', 'tremble'); ev(a.otan5, 'shine'); ev(a.coince, 'stamp'); ev(a.coince + 0.3, 'boing');
  ev(a.dep - 0.2, 'whoosh'); ev(a.dep, 'pop'); act(a.dep, 'barres budget', 'montent'); ev(a.dix, 'count'); ev(a.onze, 'thud'); act(a.onze, 'porte-avions', 'arrivent'); for (let i = 0; i < 11; i++) ev(a.onze + 0.15 + i * 0.07, 'tic'); ev(a.seul, 'thud'); act(a.seul, 'porte-avions français', 'arrive');
  ev(a.bombe7 - 0.2, 'whoosh'); ev(a.bombe7, 'impact'); act(a.bombe7, 'soldat français', 'confiant'); ev(a.amerique - 0.3, 'whoosh'); ev(a.amerique, 'sparkle'); act(a.amerique, 'Statue de la Liberté', 'clin d\'œil'); ev(a.y1778, 'photo'); act(a.y1778, 'parchemin', '1778');
  ev(a.tf8 - 0.2, 'cheer'); ev(a.tf8, 'pop'); ev(a.tu8, 'pop'); ev(a.comm, 'pop'); ev(a.abo, 'pop'); ev(a.abo + 0.1, 'ding'); act(a.tf8, 'soldats', 'face à face');
  for (const x of [a.qui + 0.8, a.contre + 0.6, a.prob + 0.5, a.art + 0.6, a.jamais + 0.6, a.explose + 0.8, a.n26 + 0.6, a.obliges + 0.6, a.pas + 0.5, a.bombe + 0.6, a.plutot + 0.5, a.traites + 0.6, a.attaque + 0.5, a.ca + 0.6, a.otan5 + 0.6, a.coince + 0.6, a.dep + 0.6, a.seul + 0.5, a.bombe7 + 0.6, a.naitre + 0.2, a.y1778 + 0.6, a.comm + 0.5]) ev(x, 'tic');
  window.PREVIEW = [0.4, a.fr0 + 0.5, a.qui + 0.4, a.contre + 0.4, a.prob + 0.3, a.otan1 + 0.4, a.art + 0.5, a.jamais + 0.3, a.explose + 0.3, a.explose + 0.8, a.de + 0.3, a.es + 0.3, a.ue + 0.6, a.n26 + 0.4, a.uk + 0.4, a.pas + 0.3, a.bombe + 0.5, a.plutot + 0.4, a.tu4 + 0.4, a.jp + 0.3, a.au + 0.3, a.traites + 0.5, a.aucun + 0.4, a.attaque + 0.3, a.ca + 0.4, a.colle + 0.4, a.coince + 0.4, a.dep + 0.6, a.dix + 0.4, a.onze + 0.8, a.seul + 0.4, a.bombe7 + 0.4, a.amerique + 0.5, a.y1778 + 0.5, a.tf8 + 0.4, a.tu8 + 0.4, a.abo + 0.4];
}

// ---------- sur la carte ----------
function mapUnder(t) {
  const a = A; if (t < a.otan1 - 0.1 || t > a.b2 + 0.2) return;
  const al = clamp((t - a.otan1 + 0.1) / 0.3) * fadeOut(t, a.b2, 0.3); const split = t > a.explose;
  m.save(); m.globalAlpha = al;
  for (const id of WORLD.NATO) { const g = geomOf(id); pathM(g); const am = id === '840' || id === '124'; m.fillStyle = split ? (am ? 'rgba(220,40,60,.38)' : 'rgba(40,90,240,.38)') : 'rgba(70,90,200,.32)'; m.fill(); m.lineWidth = 2.5; m.strokeStyle = split ? (am ? '#ffb3bc' : '#c9d4ff') : '#c9d4ff'; m.stroke(); }
  m.restore();
}

// ---------- calque écran ----------
function shieldHalves(c, x, y, h, split, t) {
  const img = SPR.shield_crack; if (!img) return; const w = h * img.width / img.height;
  for (const side of [-1, 1]) { c.save(); c.translate(x + side * split * 160, y + split * 60); c.rotate(side * split * 0.5); c.beginPath(); if (side < 0) c.rect(-w / 2 - 10, -h / 2 - 10, w / 2 + 10, h + 20); else c.rect(0, -h / 2 - 10, w / 2 + 10, h + 20); c.clip(); c.drawImage(img, -w / 2, -h / 2, w, h); c.restore(); }
}
function screenScene(c, t) {
  const a = A;
  // accroche
  if (t > a.qui && t < a.tf + 0.2) { const s = popIn(t, a.qui, 0.3) * fadeOut(t, a.tf - 0.1, 0.25); c.save(); c.translate(W / 2, 560); c.scale(s, s); sprite(c, 'qmark', 0, 150, 300, { shadow: false }); c.restore(); }
  if (t > a.tf - 0.1 && t < a.b1 + 0.3) {
    const al = fadeOut(t, a.b1, 0.3); c.save(); c.globalAlpha = al;
    waver(c, 'sol_fr', 230, 1440, 380, t, a.tf - 0.1, 0); tag(c, 'TEAM FRANCE', 230, 1010, { size: 52, bg: BLUE, border: '#fff', sc: popIn(t, a.tf, 0.3) });
    if (t > a.tu - 0.1) { soldier(c, 'sol_us_a', 850, 1440, 390, t, a.tu - 0.1, { ph: 1 }); tag(c, 'TEAM USA', 850, 1010, { size: 52, bg: USR, border: '#fff', sc: popIn(t, a.tu, 0.3) }); }
    if (t > a.contre) { c.save(); c.translate(540, 1200); const s = stampScale(t, a.contre); c.scale(s, s); c.shadowColor = '#ffd23a'; c.shadowBlur = 40; txt(c, 'VS', 0, 0, { size: 200, weight: 900, color: '#FFE928', stroke: '#3a2500', sw: 18, shadow: false }); c.restore(); }
    c.restore();
  }
  // OTAN
  if (t > a.prob - 0.1 && t < a.otan1 + 0.3) { const s = popIn(t, a.prob - 0.1, 0.35) * fadeOut(t, a.otan1, 0.3); c.save(); c.translate(W / 2, 1230); c.scale(s, s); sprite(c, 'hands_split', 0, 0, 200, { shadow: false, rot: 0.05 * Math.sin(t * 6) }); c.restore(); }
  if (t > a.otan1 - 0.05 && t < a.b2) tag(c, 'OTAN', W / 2, 470, { size: 70, bg: '#1d3a8a', border: '#fff', sc: popIn(t, a.otan1, 0.3) * fadeOut(t, a.b2 - 0.25, 0.2) });
  if (t > a.art - 0.1 && t < a.b2 + 0.1) {
    const al = fadeOut(t, a.b2 - 0.1, 0.25); const s = popIn(t, a.art - 0.1, 0.35); const sp = easeOut(prog(t, a.explose, 0.5));
    c.save(); c.globalAlpha = al; c.translate(W / 2, 760); c.scale(s, s); shieldHalves(c, 0, 0, 330, sp, t); if (sp < 0.05) txt(c, '5', 0, 10, { size: 150, weight: 900, color: '#fff', stroke: '#0b2a7a', sw: 14 }); c.restore();
    tag(c, 'ARTICLE 5', W / 2, 1030, { size: 54, bg: '#fff', color: '#1d3a8a', sc: popIn(t, a.art + 0.2, 0.3) * fadeOut(t, a.explose - 0.1, 0.2) });
    if (t > a.jamais - 0.1 && t < a.explose) { const q = popIn(t, a.jamais - 0.1, 0.3); sprite(c, 'qmark', 860, 1300, 230 * q, { shadow: false, rot: 0.1 * Math.sin(t * 5) }); sprite(c, 'qmark', 220, 1300, 190 * q, { shadow: false, rot: -0.1 * Math.sin(t * 5) }); }
    stampText(c, 'OTAN : CAS JAMAIS PRÉVU', W / 2, 1150, t, a.jamais + 0.1, a.otan2 - 0.1, { size: 54 });
    stampText(c, 'EXPLOSE', W / 2, 1180, t, a.explose + 0.1, a.b2 - 0.15, { size: 110 });
  }
  // Union européenne
  if (t > a.ue - 0.1 && t < a.b3) { const s = popIn(t, a.ue - 0.1, 0.35) * fadeOut(t, a.b3 - 0.25, 0.25); c.save(); c.translate(W / 2, 520); c.scale(s, s); c.rotate(t * 0.5); sprite(c, 'eu', 0, 100, 200, { shadow: false }); c.restore(); tag(c, 'ART. 42.7', W / 2, 680, { size: 50, bg: '#003399', border: '#fff', sc: s }); }
  if (t > a.n26 - 0.1 && t < a.b3) counter(c, 26, t, a.n26 - 0.1, a.n26 + 0.5, W / 2, 1180, { size: 140, label: 'PAYS OBLIGÉS', until: a.b3 - 0.25 });
  // Royaume-Uni
  if (t > a.uk - 0.1 && t < a.b4) { const al = fadeOut(t, a.b4 - 0.25, 0.25); c.save(); c.globalAlpha = al; sprite(c, 'bulldog', 830, 1450, 330 * popIn(t, a.uk - 0.1, 0.35), { rot: 0.04 * Math.sin(t * 5) }); c.restore(); }
  stampText(c, 'PAS DANS L\'UE', W / 2, 560, t, a.pas, a.y2025 - 0.1, { col: '#6b7076', size: 90 });
  if (t > a.y2025 - 0.1 && t < a.plutot) tag(c, '2025', W / 2, 470, { size: 66, bg: '#C00E1F', border: '#fff', sc: popIn(t, a.y2025, 0.3) * fadeOut(t, a.plutot - 0.2, 0.2) });
  if (t > a.bombe - 0.1 && t < a.b4) {
    const al = fadeOut(t, a.b4 - 0.25, 0.25); const pL = S(...CAPS.londres), pP = S(...CAPS.paris);
    c.save(); c.globalAlpha = al; for (const [p, d] of [[pL, 0], [pP, 0.15]]) sprite(c, 'nuke', p.x, p.y + 60, 130 * popIn(t, a.bombe - 0.1 + d, 0.35), { shadow: false }); c.restore();
    if (t > a.paris - 0.1) { const k = easeOut(prog(t, a.paris - 0.1, 0.5)); c.save(); c.globalAlpha = al; c.strokeStyle = '#FFE928'; c.lineWidth = 12; c.setLineDash([24, 16]); c.lineDashOffset = -t * 60; c.shadowColor = '#FFE928'; c.shadowBlur = 20; c.beginPath(); c.moveTo(pL.x, pL.y - 10); c.lineTo(lerp(pL.x, pP.x, k), lerp(pL.y, pP.y, k) - 10); c.stroke(); c.restore(); }
  }
  stampText(c, 'PLUTÔT TEAM FRANCE', W / 2, 560, t, a.plutot, a.b4 - 0.15, { col: BLUE, size: 70 });
  // Team USA
  if (t > a.tu4 - 0.1 && t < a.jp + 0.3) { const al = fadeOut(t, a.jp, 0.3); c.save(); c.globalAlpha = al; soldier(c, 'sol_us_b', 850, 1440, 390, t, a.tu4 - 0.1); tag(c, 'TEAM USA', 850, 1010, { size: 52, bg: USR, border: '#fff', sc: popIn(t, a.tu4, 0.3) }); c.restore(); }
  if (t > a.traites - 0.1 && t < a.b5) {
    const al = fadeOut(t, a.b5 - 0.25, 0.25); const s = popIn(t, a.traites - 0.1, 0.35);
    c.save(); c.globalAlpha = al; c.translate(W / 2, 640); c.scale(s * fadeOut(t, a.aucun - 0.1, 0.2), s * fadeOut(t, a.aucun - 0.1, 0.2)); c.rotate(-0.04); sprite(c, 'scroll', 0, 130, 260, { shadow: false }); txt(c, 'TRAITÉS', 0, -20, { size: 54, font: 'Caveat', weight: 700, color: '#4a2a08', shadow: false }); txt(c, 'DE DÉFENSE', 0, 30, { size: 44, font: 'Caveat', weight: 700, color: '#4a2a08', shadow: false }); c.restore();
    if (t > a.aucun - 0.1) { const s2 = popIn(t, a.aucun - 0.1, 0.35); c.save(); c.globalAlpha = al; c.translate(W / 2, 1180); c.scale(s2, s2); c.rotate(0.06 * Math.sin(t * 6)); sprite(c, 'padlock', 0, 120, 240, { shadow: false }); c.restore(); }
    stampText(c, 'SI L\'AMÉRIQUE ATTAQUE : 0', W / 2, 600, t, a.attaque - 0.1, a.b5 - 0.15, { size: 54 });
  }
  // Canada
  if (t > a.colle - 0.1 && t < a.b6) {
    const al = fadeOut(t, a.b6 - 0.25, 0.25); const sh = t > a.coince ? 8 * Math.sin(t * 50) : 0;
    c.save(); c.globalAlpha = al; sprite(c, 'sol_ca', W / 2 + sh, 1450, 400 * popIn(t, a.colle - 0.1, 0.3)); c.restore();
    if (t > a.otan5 - 0.1) { c.save(); c.globalAlpha = al; const k = easeOut(prog(t, a.otan5, 0.4)); c.fillStyle = USR; rr(c, 120 - 40 * (1 - k), 1060, 150, 420, 20); c.fill(); c.fillStyle = BLUE; rr(c, 810 + 40 * (1 - k), 1060, 150, 420, 20); c.fill(); txt(c, 'USA', 195, 1270, { size: 50, weight: 900 }); txt(c, 'OTAN', 885, 1270, { size: 46, weight: 900 }); c.restore(); }
    stampText(c, 'COINCÉ', W / 2, 600, t, a.coince, a.b6 - 0.15, { size: 120 });
  }
  // budget et porte-avions
  if (t > a.dep - 0.1 && t < a.onze) {
    const al = fadeOut(t, a.onze - 0.25, 0.25); const s = popIn(t, a.dep - 0.1, 0.35); const g1 = easeOut(prog(t, a.dep + 0.2, 0.8)), g2 = easeOut(prog(t, a.dep + 0.3, 0.5));
    c.save(); c.globalAlpha = al; c.translate(W / 2, 1000); c.scale(s, s);
    rr(c, -400, -560, 800, 650, 30); c.fillStyle = 'rgba(255,255,255,.92)'; c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 30; c.fill(); c.shadowColor = 'transparent';
    txt(c, 'BUDGET MILITAIRE', 0, -500, { size: 44, weight: 900, color: '#111', shadow: false });
    const H1 = 420 * g1, H2 = 38 * g2; rr(c, -270, 20 - H1, 200, H1, 14); c.fillStyle = USR; c.fill(); rr(c, 70, 20 - H2, 200, Math.max(1, H2), 10); c.fillStyle = BLUE; c.fill();
    if (g1 > 0.5) txt(c, '954 Md$', -170, -H1 - 30, { size: 46, weight: 900, color: USR, shadow: false });
    if (t > a.dix - 0.05) { c.save(); c.translate(170, -150); const k = stampScale(t, a.dix); c.scale(k, k); txt(c, '× 10', 0, 0, { size: 96, weight: 900, color: USR, shadow: false }); txt(c, 'PLUS', 0, 70, { size: 44, weight: 900, color: USR, shadow: false }); c.restore(); }
    flagCard(c, -170, 65, FL.us, 70); flagCard(c, 170, 65, FL.fr, 70); c.restore();
    txt(c, 'SIPRI 2025', W / 2, 1135, { size: 26, weight: 800, color: '#fff', stroke: '#000', sw: 6 });
  }
  if (t > a.onze - 0.1 && t < a.b7) {
    const al = fadeOut(t, a.b7 - 0.25, 0.25); c.save(); c.globalAlpha = al;
    for (let i = 0; i < 11; i++) { const r = i < 6 ? 0 : 1, k = i < 6 ? i : i - 6; const x = 130 + k * 92 + r * 46, y = 760 + r * 250; sprite(c, 'carrier_us', x, y, 200 * popIn(t, a.onze + 0.15 + i * 0.07, 0.3), { shadow: false }); }
    if (t > a.seul - 0.15) { sprite(c, 'carrier_fr', W / 2, 1380, 230 * popIn(t, a.seul - 0.15, 0.3), { shadow: false }); }
    c.restore();
    tag(c, '11', 200, 480, { size: 90, bg: USR, border: '#fff', sc: popIn(t, a.onze + 0.2, 0.3) * al }); if (t > a.seul) tag(c, '1', 880, 1240, { size: 90, bg: BLUE, border: '#fff', sc: popIn(t, a.seul, 0.3) * al });
  }
  // la bombe et 1778
  if (t > a.bombe7 - 0.15 && t < a.amerique) { const al = fadeOut(t, a.amerique - 0.25, 0.25); const s = popIn(t, a.bombe7 - 0.15, 0.35) * (1 + 0.05 * Math.sin(t * 7)); c.save(); c.globalAlpha = al; c.shadowColor = '#ffd400'; c.shadowBlur = 40; sprite(c, 'nuke', 300, 760, 220 * s, { shadow: false }); c.restore(); c.save(); c.globalAlpha = al; soldier(c, 'sol_fr_x', 780, 1450, 420, t, a.bombe7 - 0.1); c.restore(); }
  if (t > a.amerique - 0.1 && t < a.b8) {
    const al = fadeOut(t, a.b8 - 0.2, 0.25); const pN = S(...CAPS.newyork), pP = S(...CAPS.paris);
    arrowTo(c, pP.x, pP.y, pN.x, pN.y, t, a.amerique - 0.1, a.b8 - 0.2, BLUE);
    c.save(); c.globalAlpha = al; sprite(c, 'liberty', 790, 1450, 430 * popIn(t, a.amerique, 0.35), { rot: 0.03 * Math.sin(t * 3) }); c.restore();
    if (t > a.y1778 - 0.1) { const s = popIn(t, a.y1778 - 0.1, 0.3); c.save(); c.globalAlpha = al; c.translate(320, 1200); c.scale(s, s); c.rotate(-0.06); sprite(c, 'scroll', 0, 130, 260, { shadow: false }); txt(c, '1778', 0, 0, { size: 90, font: 'Caveat', weight: 700, color: '#4a2a08', shadow: false }); c.restore(); }
  }
  // fin
  if (t > a.tf8 - 0.2) {
    waver(c, 'sol_fr', 210, 1450, 360, t, a.tf8 - 0.2, 0); soldier(c, 'sol_us_a', 870, 1450, 370, t, a.tf8 - 0.1, { ph: 1 });
    if (t > a.tf8 - 0.05) tag(c, 'TEAM FRANCE', 210, 1030, { size: 48, bg: BLUE, border: '#fff', sc: popIn(t, a.tf8, 0.3) }); if (t > a.tu8 - 0.05) tag(c, 'TEAM USA', 870, 1030, { size: 48, bg: USR, border: '#fff', sc: popIn(t, a.tu8, 0.3) });
    { const s = popIn(t, a.tf8 - 0.1, 0.3) * (1 + 0.1 * Math.max(0, 1 - Math.abs(t - a.tu8) / 0.15)); c.save(); c.translate(W / 2, 880); c.scale(s, s); txt(c, 'QUI GAGNE ?', 0, 0, { size: 120, weight: 900, color: '#FFE928', stroke: '#1b1300', sw: 14 }); c.restore(); }
    if (t > a.abo - 0.15) tag(c, 'ABONNE-TOI', W / 2, 1230, { size: 70, bg: '#C00E1F', border: '#fff', sc: stampScale(t, a.abo) });
  }
}
