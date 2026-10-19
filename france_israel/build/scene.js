// scene.js — Team France vs Team Israël (scénario imaginaire). Moteur : engine.js.
const ILB = '#0038b8';
const CAPS = { telaviv: [34.78, 32.08], paris: [2.35, 48.86], berlin: [13.4, 52.52], rome: [12.5, 41.9], madrid: [-3.7, 40.42], varsovie: [21.01, 52.23], bruxelles: [4.35, 50.85], amsterdam: [4.9, 52.37], oslo: [10.75, 59.91], ottawa: [-75.7, 45.42], ankara: [32.86, 39.93], vienne: [16.37, 48.21], dublin: [-6.26, 53.35], lavalette: [14.51, 35.9], nicosie: [33.38, 35.17], washington: [-77.04, 38.9] };
const CFG = {
  teamCol: { f: '#3b7bff', a: '#7fb2ff', g: '#9aa0a6', h: '#b9bec4' },
  trail: { jet_fr: '#F7EF08', jet_il: '#9fd0ff' },
  NAME: { '250': 'FRANCE', '376': 'ISRAËL', '276': 'ALLEMAGNE', '380': 'ITALIE', '724': 'ESPAGNE', '616': 'POLOGNE', '056': 'BELGIQUE', '528': 'PAYS-BAS', '578': 'NORVÈGE', '124': 'CANADA', '792': 'TURQUIE', '040': 'AUTRICHE', '372': 'IRLANDE', '470': 'MALTE', '196': 'CHYPRE', '840': 'ÉTATS-UNIS', '300': 'GRÈCE' },
  ANCH: { '250': [2.4, 46.8], '376': [34.9, 31.3], '276': [10.4, 51.1], '380': [12.6, 42.9], '724': [-3.7, 40.2], '616': [19.3, 52.1], '056': [4.6, 50.6], '528': [5.6, 52.3], '578': [9, 61.5], '124': [-100, 57], '792': [35, 39], '040': [14.5, 47.5], '372': [-8, 53.2], '470': [14.4, 35.9], '196': [33, 35], '840': [-98, 39], '300': [22, 39.3] },
  sides: [[-1, BLUE, 'TEAM FRANCE', 'f', 'fr'], [1, ILB, 'TEAM ISRAËL', 'a', 'il']],
  sprites: ['jet_fr', 'jet_il', 'sol_fr_a', 'sol_fr_b', 'sol_il_a', 'sol_il_b', 'sol_fr_cheer', 'shield_star', 'moneybag', 'hands3', 'heart', 'sol_us', 'stamp', 'tape', 'trophy', 'eu'],
  extraFlags: ['eu', 'fr', 'il', 'us'],
  jetH: 0.95,
};

let ILCOPY = null, CROSSED = [];
function setup() {
  const a = A;
  a.il0 = T(0, 'israel'); a.fr0 = T(0, 'france'); a.qui = T(0, 'qui'); a.tf = T(0, 'team'); a.contre = T(0, 'contre'); a.ti = T(0, 'team', 2);
  a.b1 = beatStart(1); a.de = T(1, 'lallemagne'); a.it = T(1, 'litalie'); a.es = T(1, 'lespagne'); a.pl = T(1, 'pologne'); a.be = T(1, 'belgique'); a.nl = T(1, 'paysbas'); a.no = T(1, 'norvege'); a.ca = T(1, 'canada'); a.tr = T(1, 'turquie'); a.otan = T(1, 'lotan'); a.n32 = T(1, 'trentedeux');
  a.b2 = beatStart(2); a.at = T(2, 'lautriche'); a.ie = T(2, 'lirlande'); a.mt = T(2, 'malte'); a.cy = T(2, 'chypre'); a.n36 = T(2, 'trentesix');
  a.b3 = beatStart(3); a.ti3 = T(3, 'team'); a.us = T(3, 'etatsunis'); a.ami = T(3, 'meilleur'); a.aucun = T(3, 'aucun'); a.avec = T(3, 'avec'); a.otan3 = T(3, 'lotan'); a.donc = T(3, 'donc'); a.tf3 = T(3, 'team', 2);
  a.b4 = beatStart(4); a.gr = T(4, 'grece'); a.cy4 = T(4, 'chypre'); a.amies = T(4, 'amies'); a.eu = T(4, 'leurope'); a.tf4 = T(4, 'team');
  a.b5 = beatStart(5); a.de5 = T(5, 'lallemagne'); a.grande = T(5, 'grande'); a.otan5 = T(5, 'lotan'); a.tf5 = T(5, 'team');
  a.b6 = beatStart(6); a.paris = T(6, 'paris'); a.km = T(6, 'trois'); a.que = T(6, 'que'); a.tf6 = T(6, 'team');
  a.b7 = beatStart(7); a.fr7 = T(7, 'france'); a.n25 = T(7, 'vingtcinq'); a.grandeF = T(7, 'grande');
  a.b8 = beatStart(8); a.res = T(8, 'resultat'); a.n36b = T(8, 'trentesix'); a.contre8 = T(8, 'contre'); a.un = T(8, 'un');
  a.b9 = beatStart(9); a.il9 = T(9, 'israel'); a.armees = T(9, 'armees'); a.fortes = T(9, 'fortes');
  a.b10 = beatStart(10); a.tf10 = T(10, 'team'); a.ti10 = T(10, 'team', 2); a.comm = T(10, 'commentaire'); a.abo = T(10, 'abonnetoi'); a.fin = TE(10, 'abonnetoi');
  a.sb = a.ti + 0.35; DUR = a.fin + 0.55; a.big = [[a.res, a.b9 - 0.2], [a.b10 + 0.2, DUR + 1]];

  // ---- pays
  C('376', a.il0, 'a', { named: true }); C('250', a.fr0, 'f', { named: true }); SCORE.a.push([a.il0, 1]); SCORE.f.push([a.fr0, 1]);
  const named = [['276', a.de], ['380', a.it], ['724', a.es], ['616', a.pl], ['056', a.be], ['528', a.nl], ['578', a.no], ['124', a.ca], ['792', a.tr]];
  named.forEach(([id, t]) => { C(id, t, 'f', { named: true }); SCORE.f.push([t, 1]); });
  const rest = WORLD.NATO.filter(id => !['250', ...named.map(x => x[0])].includes(id)).sort((x, y) => d3.geoDistance(WORLD.cent[x], CAPS.paris) - d3.geoDistance(WORLD.cent[y], CAPS.paris));
  rest.forEach((id, i) => { const t = a.otan + 0.1 + i * 0.03; C(id, t, 'f'); SCORE.f.push([t, 1]); });
  [['040', a.at], ['372', a.ie], ['470', a.mt], ['196', a.cy]].forEach(([id, t]) => { C(id, t, 'f', { named: true }); SCORE.f.push([t, 1]); });
  C('840', a.us, 'g', { named: true }); C('840', a.tf3, 'f');
  C('300', a.gr, 'g', { named: true }); C('196', a.cy4, 'g', { named: true }); C('300', a.tf4, 'f'); C('196', a.tf4 + 0.08, 'f');
  C('276', a.de5, 'g', { named: true }); C('276', a.tf5, 'f');
  // la route Tel-Aviv → Paris : pays survolés
  const gi = d3.geoInterpolate(CAPS.telaviv, CAPS.paris);
  for (let i = 0; i <= 120; i++) { const p = gi(i / 120); for (const c of WORLD.c50) if ((WORLD.NATO.includes(c.id) || WORLD.EU.includes(c.id)) && !CROSSED.includes(c.id) && d3.geoContains(c.g, p)) CROSSED.push(c.id); }
  window.CROSSED = CROSSED;
  // Israël posé sur la France à sa vraie taille
  const c0 = d3.geoCentroid(WORLD.byId['376'].g), c1 = [2.6, 46.7]; const r0 = d3.geoRotation([-c0[0], -c0[1]]), r1 = d3.geoRotation([-c1[0], -c1[1]]);
  const mv = co => typeof co[0] === 'number' ? r1.invert(r0(co)) : co.map(mv);
  ILCOPY = { type: WORLD.c10['376'].type, coordinates: mv(WORLD.c10['376'].coordinates) };

  // ---- avions
  const L = (jet, from, to, t0, t1, sMid, sEnd, o = {}) => LEGS.push({ jet, a: CAPS[from] || from, b: CAPS[to] || to, t0, t1, sMid, sEnd, ...o });
  const tour = [['paris', a.tf1 = beatStart(1) + 0.15], ['berlin', a.de], ['rome', a.it], ['madrid', a.es], ['varsovie', a.pl], ['bruxelles', a.be], ['amsterdam', a.nl], ['oslo', a.no], ['ottawa', a.ca], ['ankara', a.tr]];
  const sm = { berlin: [1500, 1700], rome: [1300, 1600], madrid: [1100, 1500], varsovie: [900, 1400], bruxelles: [1100, 1700], amsterdam: [1900, 2200], oslo: [1000, 1300], ottawa: [270, 420], ankara: [260, 650] };
  for (let i = 1; i < tour.length; i++) { const t0 = i === 1 ? tour[0][1] : tour[i - 1][1] + 0.08; L('jet_fr', tour[i - 1][0], tour[i][0], t0, tour[i][1], ...sm[tour[i][0]]); }
  L('jet_fr', 'ankara', 'vienne', a.n32 + 0.15, a.at, 900, 1400); L('jet_fr', 'vienne', 'dublin', a.at + 0.08, a.ie, 800, 1200); L('jet_fr', 'dublin', 'lavalette', a.ie + 0.08, a.mt, 800, 1300); L('jet_fr', 'lavalette', 'nicosie', a.mt + 0.08, a.cy, 1000, 1500);
  L('jet_il', 'telaviv', 'washington', a.us - 0.35, a.ami + 0.2, 280, 520);
  L('jet_il', 'telaviv', 'paris', a.paris - 0.6, a.km + 0.9, 680, 1300);
  JETVIS = { jet_fr: [[a.b1, a.n36 + 0.6]], jet_il: [[a.us - 0.4, a.aucun], [a.b6 - 0.1, a.tf6 + 0.5]] };

  // ---- caméra
  buildCam([
    st(0, 0, 34.9, 31.6, 9000, { drift: 0.05 }),
    st(a.fr0 + 0.2, 1.3, 2.4, 46.8, 2400),
    st(a.qui + 0.6, 0.9, 18, 42, 900),
    st(a.tf + 0.3, 0.8, 8, 45, 1300),
    st(a.ti + 0.3, 0.8, 25, 38, 1100),
    st(a.b1 + 0.1, 0.7, 2.35, 47.5, 2000),
    st(a.otan + 0.5, 1.0, -25, 48, 330, { drift: 0.04 }),
    st(a.n32 + 0.1, 0.7, -10, 47, 420),
    st(a.n36 + 0.5, 1.0, 14, 46, 900),
    st(a.ti3 + 0.3, 1.2, 34.9, 31.5, 5200, { drift: 0.04 }),
    st(a.aucun + 0.1, 0.9, -40, 40, 400),
    st(a.otan3 + 0.2, 0.9, -80, 40, 700),
    st(a.donc + 0.3, 0.9, -95, 41, 600),
    st(a.tf3 + 0.3, 0.8, -90, 42, 520),
    st(a.gr + 0.2, 1.3, 28, 36.8, 1500),
    st(a.amies + 0.3, 0.9, 31, 35.5, 2000),
    st(a.eu + 0.2, 0.9, 27, 37.5, 1350),
    st(a.de5 + 0.2, 1.2, 10.4, 51.2, 2300),
    st(a.otan5 + 0.2, 0.9, 10.4, 50.5, 3000),
    st(a.tf5 + 0.2, 0.8, 10.4, 51.2, 2100),
    st(a.paris - 0.65, 0.6, 34.78, 32.5, 2600),
    st(a.que + 0.2, 1.1, 18, 41, 900),
    st(a.tf6 + 0.3, 0.8, 16, 42, 1100),
    st(a.fr7 + 0.1, 1.0, 2.6, 46.6, 2400),
    st(a.n25 + 0.4, 0.8, 2.6, 46.6, 3300, { drift: 0.04 }),
    st(a.res + 0.2, 1.2, -18, 45, 380),
    st(a.contre8 + 0.2, 0.9, 20, 40, 700),
    st(a.il9 + 0.2, 1.2, 34.9, 31.6, 7000, { drift: 0.04 }),
    st(a.fortes + 0.2, 0.8, 34.9, 31.8, 5000),
    st(a.tf10 + 0.2, 1.2, 18, 41, 1000),
    st(a.ti10 + 0.2, 0.8, 22, 40, 1250),
    st(a.abo + 0.1, 0.8, 18, 42, 1000),
    st(a.fin + 0.5, 0.8, 18, 42, 1120, { drift: 0.04 }),
  ]);
  A.tilt = [[a.tf - 0.5, a.b1, 18], [a.gr - 0.3, a.tf4, 16], [a.de5 - 0.3, a.tf5, 16], [a.fr7 - 0.3, a.grandeF + 0.4, 16], [a.tf10 - 0.3, a.comm, 16]];

  // ---- sons et actions
  ev(0, 'whoosh'); ev(a.il0, 'scan'); ev(a.il0 + 0.05, 'pop'); ev(a.fr0 - 0.3, 'whoosh'); ev(a.fr0, 'scan'); ev(a.fr0 + 0.05, 'pop'); ev(a.qui, 'boing'); ev(a.tf, 'pop'); ev(a.contre, 'stamp'); ev(a.ti, 'pop'); ev(a.sb, 'pop');
  act(a.il0, 'Israël', 'drapeau'); act(a.tf, 'soldat français', 'agite le drapeau'); act(a.ti, 'soldat israélien', 'pose');
  for (const id in CS) for (const p of CS[id]) { if (p.t < a.b1) continue; ev(p.t, p.named ? 'scan' : 'tic'); if (p.named) ev(p.t + 0.05, 'pop'); }
  for (const Lg of LEGS) { ev(Lg.t0, 'jet'); act(Lg.t0, Lg.jet, 'vole'); }
  ev(a.otan, 'shine'); act(a.otan, 'OTAN', 'vague bleue'); ev(a.n32, 'count'); ev(a.n36, 'count'); ev(a.n36 + 0.3, 'shine');
  ev(a.ti3, 'pop'); act(a.ti3, 'soldat israélien', 'bras croisés'); ev(a.ami, 'pop'); act(a.ami, 'cœur', 'apparaît'); ev(a.ami + 0.5, 'boing'); act(a.ami + 0.5, 'soldat US', 'se gratte la tête'); ev(a.aucun, 'stamp'); ev(a.otan3, 'shine'); act(a.otan3, 'bouclier OTAN', 'apparaît'); ev(a.donc, 'whoosh'); ev(a.tf3, 'ding');
  ev(a.gr - 0.3, 'whoosh'); ev(a.amies, 'pop'); act(a.amies, 'mains', 'se serrent'); ev(a.eu, 'shine'); act(a.eu, 'drapeau UE', 'tourne'); ev(a.tf4, 'ding');
  ev(a.de5 - 0.3, 'whoosh'); ev(a.grande, 'pop'); act(a.grande, 'cœur', 'apparaît'); ev(a.otan5, 'shine'); ev(a.tf5, 'ding');
  ev(a.paris - 0.6, 'whoosh'); ev(a.km, 'draw'); act(a.km, 'ligne', '3 300 km'); ev(a.km + 0.5, 'pop'); CROSSED.forEach((id, i) => ev(a.que + 0.1 + i * 0.12, 'tic')); act(a.que, 'pays survolés', 's\'allument'); ev(a.tf6, 'ding');
  ev(a.fr7 - 0.2, 'whoosh'); ev(a.fr7 + 0.3, 'fall'); act(a.fr7 + 0.3, 'Israël', 'posé sur la France'); ev(a.n25, 'stamp'); ev(a.n25 + 0.2, 'draw'); act(a.n25, 'mètre', 'mesure');
  ev(a.res - 0.1, 'whoosh'); ev(a.res, 'count'); ev(a.n36b, 'count'); ev(a.un, 'thud'); act(a.un, 'trophée', 'apparaît'); ev(a.un + 0.4, 'shine');
  ev(a.il9 - 0.3, 'whoosh'); ev(a.il9, 'pop'); act(a.il9, 'soldat israélien', 'apparaît'); ev(a.armees, 'thud'); ev(a.fortes, 'stamp'); act(a.armees, 'sac', '48 Md$');
  ev(a.tf10 - 0.2, 'cheer'); ev(a.tf10, 'pop'); ev(a.ti10, 'pop'); ev(a.comm, 'pop'); ev(a.abo, 'pop'); ev(a.abo + 0.1, 'ding'); act(a.tf10, 'soldats', 'face à face');
  for (const x of [a.qui + 0.8, a.contre + 0.6, a.b1 + 0.6, a.n32 + 0.6, a.n36 + 0.8, a.ti3 + 0.6, a.us + 0.7, a.aucun + 0.7, a.avec + 0.6, a.otan3 + 0.5, a.tf3 + 0.6, a.amies + 0.6, a.tf4 + 0.5, a.grande + 0.6, a.tf5 + 0.5, a.km + 1.2, a.tf6 + 0.5, a.grandeF + 0.5, a.res + 0.6, a.contre8 + 0.2, a.un + 0.9, a.armees + 0.5, a.fortes + 0.6, a.comm + 0.5]) ev(x, 'tic');
  window.PREVIEW = [0.6, a.fr0 + 0.6, a.qui + 0.4, a.contre + 0.4, a.de + 0.3, a.es + 0.3, a.nl + 0.3, a.ca + 0.3, a.tr + 0.3, a.otan + 0.6, a.n32 + 0.4, a.mt + 0.3, a.n36 + 0.4, a.ti3 + 0.4, a.us + 0.4, a.ami + 0.5, a.aucun + 0.4, a.otan3 + 0.4, a.tf3 + 0.4, a.gr + 0.4, a.amies + 0.4, a.eu + 0.4, a.tf4 + 0.4, a.de5 + 0.4, a.grande + 0.4, a.otan5 + 0.4, a.tf5 + 0.4, a.paris, a.km + 0.6, a.que + 0.4, a.tf6 + 0.4, a.fr7 + 0.6, a.n25 + 0.5, a.res + 0.5, a.n36b + 0.4, a.un + 0.4, a.il9 + 0.4, a.armees + 0.4, a.fortes + 0.3, a.tf10 + 0.4, a.ti10 + 0.4, a.abo + 0.4];
}

// ---------- sur la carte ----------
function mapOver(t) {
  const a = A;
  if (t > a.que && t < a.b7 + 0.2) { const al = fadeOut(t, a.b7, 0.3); CROSSED.forEach((id, i) => { const k = clamp((t - a.que - 0.1 - i * 0.12) / 0.25); if (k <= 0) return; pathM(geomOf(id)); m.save(); m.globalAlpha = al * k; m.lineWidth = 7; m.strokeStyle = '#fff'; m.shadowColor = '#7fb2ff'; m.shadowBlur = 30; m.stroke(); m.fillStyle = 'rgba(80,140,255,.25)'; m.fill(); m.restore(); }); }
  if (t > a.fr7 + 0.2 && t < a.res + 0.2) {
    const al = fadeOut(t, a.res, 0.3); const k = easeOut(prog(t, a.fr7 + 0.25, 0.4)); const c = P([2.6, 46.7]);
    m.save(); m.globalAlpha = al; m.translate(c[0], c[1] - (1 - k) * 260); pathM_off(ILCOPY, c, k); m.restore();
  }
}
function pathM_off(g, c, k) { m.translate(-c[0], -c[1]); m.beginPath(); d3.geoPath(P, m)(g); m.fillStyle = '#fff'; m.fill(); const b = d3.geoPath(P).bounds(g); flagFill(m, () => { m.beginPath(); d3.geoPath(P, m)(g); }, b, FL.il, 0.95, 0, 'slice'); m.beginPath(); d3.geoPath(P, m)(g); m.lineWidth = 4; m.strokeStyle = ILB; m.shadowColor = 'rgba(0,0,0,.5)'; m.shadowBlur = 12; m.stroke(); }

// ---------- calque écran ----------
function screenScene(c, t) {
  const a = A;
  if (t > a.qui && t < a.tf + 0.2) { const s = popIn(t, a.qui, 0.3) * fadeOut(t, a.tf - 0.1, 0.25); c.save(); c.translate(W / 2, 560); c.scale(s, s); txt(c, '?', 0, 0, { size: 300, weight: 900, color: '#FFE928', stroke: '#1b1300', sw: 18 }); c.restore(); }
  if (t > a.tf - 0.1 && t < a.b1 + 0.3) {
    const al = fadeOut(t, a.b1, 0.3); c.save(); c.globalAlpha = al;
    waver(c, 'sol_fr', 230, 1440, 380, t, a.tf - 0.1, 0); tag(c, 'TEAM FRANCE', 230, 1010, { size: 52, bg: BLUE, border: '#fff', sc: popIn(t, a.tf, 0.3) });
    if (t > a.ti - 0.1) { soldier(c, 'sol_il_a', 850, 1440, 390, t, a.ti - 0.1, { ph: 1 }); tag(c, 'TEAM ISRAËL', 850, 1010, { size: 52, bg: ILB, border: '#fff', sc: popIn(t, a.ti, 0.3) }); }
    if (t > a.contre) { c.save(); c.translate(540, 1200); const s = stampScale(t, a.contre); c.scale(s, s); c.shadowColor = '#ffd23a'; c.shadowBlur = 40; txt(c, 'VS', 0, 0, { size: 200, weight: 900, color: '#FFE928', stroke: '#3a2500', sw: 18, shadow: false }); c.restore(); }
    c.restore();
  }
  if (t > a.otan - 0.05 && t < a.b2) { tag(c, 'OTAN', W / 2, 470, { size: 70, bg: '#1d3a8a', border: '#fff', sc: popIn(t, a.otan, 0.3) * fadeOut(t, a.b2 - 0.25, 0.2) }); tag(c, 'ARTICLE 5', W / 2, 1230, { size: 54, bg: '#fff', color: '#1d3a8a', sc: popIn(t, a.otan + 0.3, 0.3) * fadeOut(t, a.b2 - 0.25, 0.2) }); }
  if (t > a.n32 - 0.1 && t < a.b2) counter(c, 32, t, a.n32 - 0.1, a.n32 + 0.4, W / 2, 640, { size: 130, label: 'PAYS', until: a.b2 - 0.25 });
  if (t > a.at - 0.2 && t < a.b3) { const s = popIn(t, a.at - 0.2, 0.35) * fadeOut(t, a.b3 - 0.3, 0.3); c.save(); c.translate(W / 2, 520); c.scale(s, s); c.rotate(t * 0.5); sprite(c, 'eu', 0, 90, 180, { shadow: false }); c.restore(); }
  if (t > a.n36 - 0.1 && t < a.b3) counter(c, 36, t, a.n36 - 0.1, a.n36 + 0.4, W / 2, 1180, { size: 140, label: 'PAYS', until: a.b3 - 0.25 });
  // Team Israël / États-Unis
  if (t > a.ti3 - 0.1 && t < a.us) { const al = fadeOut(t, a.us - 0.25, 0.25); c.save(); c.globalAlpha = al; soldier(c, 'sol_il_b', 850, 1440, 390, t, a.ti3 - 0.1); tag(c, 'TEAM ISRAËL', 850, 1010, { size: 52, bg: ILB, border: '#fff', sc: popIn(t, a.ti3, 0.3) }); c.restore(); }
  if (t > a.ami - 0.1 && t < a.otan3) { const al = fadeOut(t, a.otan3 - 0.25, 0.25); const s = popIn(t, a.ami - 0.1, 0.35) * (1 + 0.08 * Math.abs(Math.sin(t * 5))); c.save(); c.globalAlpha = al; c.translate(W / 2, 640); c.scale(s, s); sprite(c, 'heart', 0, 110, 210, { shadow: false }); c.restore(); tag(c, 'MEILLEUR AMI', W / 2, 760, { size: 50, bg: '#e0245e', border: '#fff', sc: popIn(t, a.ami + 0.1, 0.3) * al }); }
  if (t > a.ami + 0.4 && t < a.donc + 0.2) { const al = fadeOut(t, a.donc, 0.25); c.save(); c.globalAlpha = al; sprite(c, 'sol_us', 820, 1440, 400 * popIn(t, a.ami + 0.4, 0.3), { rot: 0.05 * Math.sin(t * 4) }); c.restore(); }
  stampText(c, 'AUCUN TRAITÉ', W / 2, 600, t, a.aucun + 0.05, a.otan3 - 0.15, { col: '#6b7076' });
  if (t > a.otan3 - 0.1 && t < a.b4) { const al = fadeOut(t, a.b4 - 0.25, 0.25); const s = popIn(t, a.otan3 - 0.1, 0.35); c.save(); c.globalAlpha = al; c.translate(W / 2, 620); c.scale(s, s); sprite(c, 'shield_star', 0, 120, 240, { shadow: false }); c.restore(); tag(c, 'OTAN · ARTICLE 5', W / 2, 760, { size: 48, bg: '#1d3a8a', border: '#fff', sc: s * al }); }
  if (t > a.tf3 - 0.1 && t < a.b4) { const al = fadeOut(t, a.b4 - 0.2, 0.25); c.save(); c.globalAlpha = al; sprite(c, 'sol_fr_cheer', 260, 1440, 380 * popIn(t, a.tf3 - 0.1, 0.3)); c.restore(); stampText(c, 'TEAM FRANCE', W / 2, 1180, t, a.tf3, a.b4 - 0.15, { col: BLUE, size: 84 }); }
  // Grèce, Chypre
  if (t > a.amies - 0.1 && t < a.b5) { const al = fadeOut(t, a.b5 - 0.25, 0.25); const s = popIn(t, a.amies - 0.1, 0.35); c.save(); c.globalAlpha = al; c.translate(W / 2, 860); c.scale(s, s); sprite(c, 'hands3', 0, 0, 210, { shadow: false, rot: 0.05 * Math.sin(t * 5) }); c.restore(); tag(c, 'AMIES D\'ISRAËL', W / 2, 470, { size: 54, bg: ILB, border: '#fff', sc: s * fadeOut(t, a.eu - 0.2, 0.2) }); }
  if (t > a.eu - 0.1 && t < a.b5) { const s = popIn(t, a.eu - 0.1, 0.35) * fadeOut(t, a.b5 - 0.25, 0.25); c.save(); c.translate(W / 2, 520); c.scale(s, s); c.rotate(t * 0.5); sprite(c, 'eu', 0, 90, 180, { shadow: false }); c.restore(); }
  stampText(c, 'TEAM FRANCE', W / 2, 720, t, a.tf4, a.b5 - 0.15, { col: BLUE, size: 84 });
  // Allemagne
  if (t > a.grande - 0.1 && t < a.otan5) { const al = fadeOut(t, a.otan5 - 0.2, 0.2); const s = popIn(t, a.grande - 0.1, 0.35) * (1 + 0.08 * Math.abs(Math.sin(t * 5))); c.save(); c.globalAlpha = al; c.translate(W / 2, 1360); c.scale(s, s); sprite(c, 'heart', 0, 0, 210, { shadow: false }); c.restore(); }
  if (t > a.otan5 - 0.1 && t < a.b6) { const al = fadeOut(t, a.b6 - 0.25, 0.25); const s = popIn(t, a.otan5 - 0.1, 0.35); c.save(); c.globalAlpha = al; c.translate(W / 2, 1370); c.scale(s, s); sprite(c, 'shield_star', 0, 0, 240, { shadow: false }); c.restore(); }
  stampText(c, 'TEAM FRANCE', W / 2, 600, t, a.tf5, a.b6 - 0.15, { col: BLUE, size: 84 });
  // route
  if (t > a.km - 0.1 && t < a.b7) { const A0 = S(...CAPS.telaviv), B0 = S(...CAPS.paris); distanceLine(c, [A0.x, A0.y], [B0.x, B0.y], t, a.km, '3 300 KM', { until: a.b7 - 0.25 }); }
  if (t > a.que && t < a.b7) tag(c, 'QUE DES PAYS TEAM FRANCE', W / 2, 470, { size: 46, bg: BLUE, border: '#fff', sc: popIn(t, a.que + 0.2, 0.3) * fadeOut(t, a.b7 - 0.25, 0.25) });
  // taille
  if (t > a.n25 - 0.1 && t < a.res) { const al = fadeOut(t, a.res - 0.25, 0.25); const s = popIn(t, a.n25 - 0.1, 0.3); c.save(); c.globalAlpha = al; c.translate(W / 2, 1240); c.scale(s, s); sprite(c, 'tape', 0, 0, 160, { shadow: false }); c.restore(); stampText(c, '× 25', W / 2, 560, t, a.n25, a.res - 0.15, { col: BLUE, size: 130 }); }
  // résultat
  if (t > a.un - 0.1 && t < a.b9) { const al = fadeOut(t, a.b9 - 0.25, 0.25); const s = popIn(t, a.un - 0.1, 0.35) * (1 + 0.04 * Math.sin(t * 6)); c.save(); c.globalAlpha = al; c.shadowColor = '#ffd400'; c.shadowBlur = 50; c.translate(W / 2 - 228 * 1.1, 1080); c.scale(s, s); sprite(c, 'trophy', 0, 0, 300, { shadow: false }); c.restore(); }
  // armée israélienne
  if (t > a.il9 - 0.1 && t < a.b10) { const al = fadeOut(t, a.b10 - 0.25, 0.25); c.save(); c.globalAlpha = al; soldier(c, 'sol_il_b', W / 2 + 230, 1450, 470, t, a.il9 - 0.1); c.restore();
    if (t > a.armees - 0.1) { const s = popIn(t, a.armees - 0.1, 0.35); c.save(); c.globalAlpha = al; c.translate(290, 1120); c.scale(s, s); sprite(c, 'moneybag', 0, 0, 230, { shadow: false }); c.restore(); tag(c, '48 Md$ / AN', 290, 1210, { size: 50, bg: ILB, border: '#fff', sc: s * al }); txt(c, 'SIPRI, 2025', 290, 1290, { size: 28, weight: 800, color: '#fff', stroke: '#000', sw: 6 }); }
    stampText(c, 'UNE DES PLUS FORTES', W / 2, 600, t, a.fortes, a.b10 - 0.15, { col: ILB, size: 76 }); }
  // fin
  if (t > a.tf10 - 0.2) {
    waver(c, 'sol_fr', 210, 1450, 360, t, a.tf10 - 0.2, 0); soldier(c, 'sol_il_a', 870, 1450, 370, t, a.tf10 - 0.1, { ph: 1 });
    if (t > a.tf10 - 0.05) tag(c, 'TEAM FRANCE', 210, 1030, { size: 48, bg: BLUE, border: '#fff', sc: popIn(t, a.tf10, 0.3) }); if (t > a.ti10 - 0.05) tag(c, 'TEAM ISRAËL', 870, 1030, { size: 48, bg: ILB, border: '#fff', sc: popIn(t, a.ti10, 0.3) });
    { const s = popIn(t, a.tf10 - 0.1, 0.3) * (1 + 0.1 * Math.max(0, 1 - Math.abs(t - a.ti10) / 0.15)); c.save(); c.translate(W / 2, 880); c.scale(s, s); txt(c, 'QUI GAGNE ?', 0, 0, { size: 120, weight: 900, color: '#FFE928', stroke: '#1b1300', sw: 14 }); c.restore(); }
    if (t > a.abo - 0.15) tag(c, 'ABONNE-TOI', W / 2, 1230, { size: 70, bg: '#C00E1F', border: '#fff', sc: stampScale(t, a.abo) });
  }
}
