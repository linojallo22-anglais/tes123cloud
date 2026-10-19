// scene.js — Team France vs Team Algérie (scénario imaginaire). Moteur : engine.js.
const GREEN = '#0b8f45';
const CAPS = { paris: [2.35, 48.86], alger: [3.06, 36.75], bruxelles: [4.35, 50.85], marseille: [5.37, 43.3], addis: [38.75, 9.03], caire: [31.24, 30.04], moscou: [37.62, 55.75], pekin: [116.4, 39.9], rome: [12.5, 41.9] };
const CFG = {
  teamCol: { f: '#3b7bff', a: '#19c26b', g: '#9aa0a6', h: '#b9bec4' },
  trail: { jet_fr: '#F7EF08', jet_dz: '#7CFF9E' },
  NAME: { '250': 'FRANCE', '012': 'ALGÉRIE', '380': 'ITALIE', '643': 'RUSSIE', '156': 'CHINE' },
  ANCH: { '250': [2.4, 46.8], '012': [2.6, 30], '380': [12.6, 42.9], '643': [42, 56.5], '156': [108, 34] },
  sides: [[-1, BLUE, 'TEAM FRANCE', 'f', 'fr'], [1, GREEN, 'TEAM ALGÉRIE', 'a', 'dz']],
  sprites: ['jet_fr', 'jet_dz', 'sol_fr_a', 'sol_fr_b', 'sol_dz_a', 'sol_dz_b', 'sol_fr_sad', 'shield_stop', 'pipe', 'handshake', 'noplane', 'parchment', 'stamp', 'money', 'crate', 'eu', 'shrug', 'nuke'],
  extraFlags: ['arab', 'eu', 'fr', 'dz'],
  underScore(c, t) { if (t > A.ua && t < A.b6) { const s = popIn(t, A.ua + 0.4, 0.3) * fadeOut(t, A.b6 - 0.3, 0.3); c.save(); c.translate(228, 95); c.scale(s, s); txt(c, 'SUR LE PAPIER', 0, 0, { size: 30, weight: 900, color: '#fff', stroke: '#0b5a2d', sw: 8, shadow: false }); c.restore(); } },
};

function setup() {
  const a = A;
  a.fr0 = T(0, 'france'); a.dz0 = T(0, 'lalgerie'); a.qui = T(0, 'qui'); a.tf = T(0, 'team'); a.contre = T(0, 'contre'); a.ta = T(0, 'team', 2);
  a.b1 = beatStart(1); a.otan = T(1, 'lotan'); a.n32 = T(1, 'trentedeux'); a.protege = T(1, 'protege'); a.quon = T(1, 'attaque'); a.pas = T(1, 'pas'); a.qui1 = T(1, 'attaque', 2); a.pers = T(1, 'personne'); a.bouge = T(1, 'bouge');
  a.b2 = beatStart(2); a.eu = T(2, 'leurope'); a.pareil = T(2, 'pareil'); a.pers2 = T(2, 'personne');
  a.b3 = beatStart(3); a.it = T(3, 'litalie'); a.tiers = T(3, 'tiers'); a.gaz = T(3, 'gaz'); a.vient = T(3, 'dalgerie'); a.reste = T(3, 'reste');
  a.b4 = beatStart(4); a.res = T(4, 'resultat'); a.fr4 = T(4, 'france'); a.seule = T(4, 'toute');
  a.b5 = beatStart(5); a.ta5 = T(5, 'team'); a.ua = T(5, 'lunion'); a.pacte = T(5, 'pacte'); a.commune = T(5, 'commune'); a.ligue = T(5, 'ligue'); a.n22 = T(5, 'vingtdeux'); a.ru = T(5, 'russie'); a.vendeur = T(5, 'vendeur'); a.cn = T(5, 'chine'); a.part = T(5, 'partenaire'); a.amies = T(5, 'amies'); a.sans = T(5, 'sans');
  a.b6 = beatStart(6); a.ciel = T(6, 'ciel'); a.y2021 = T(6, 'deux'); a.ferme = T(6, 'ferme'); a.avions = T(6, 'avions');
  a.b7 = beatStart(7); a.budget = T(7, 'budget'); a.deuxf = T(7, 'deux'); a.gros = T(7, 'gros'); a.bombe = T(7, 'bombe');
  a.b8 = beatStart(8); a.fou = T(8, 'fou'); a.y1949 = T(8, 'quaranteneuf'); a.traite = T(8, 'traite'); a.protegee = T(8, 'protegee'); a.otan8 = T(8, 'lotan', 2);
  a.b9 = beatStart(9); a.tf9 = T(9, 'team'); a.ta9 = T(9, 'team', 2); a.comm = T(9, 'commentaire'); a.abo = T(9, 'abonnetoi'); a.fin = TE(9, 'abonnetoi');
  a.sb = a.ta + 0.35; DUR = a.fin + 0.55; a.big = [[a.res, a.b5 - 0.2], [a.b9 + 0.2, DUR + 1]];

  // ---- pays
  C('250', a.fr0, 'f', { named: true }); C('012', a.dz0, 'a', { named: true }); SCORE.f.push([a.fr0, 1]); SCORE.a.push([a.dz0, 1]);
  const dist = (id, ll) => d3.geoDistance(WORLD.cent[id], ll);
  const nato = WORLD.NATO.filter(id => id !== '250').sort((x, y) => dist(x, CAPS.paris) - dist(y, CAPS.paris));
  nato.forEach((id, i) => { const t = a.otan + 0.25 + i * 0.035; C(id, t, 'f'); SCORE.f.push([t, 1]); C(id, a.pers + 0.05 + i * 0.012, 'g'); SCORE.f.push([a.pers + 0.05 + i * 0.012, -1]); });
  const euOnly = ['040', '196', '372', '470'];
  WORLD.EU.filter(id => id !== '250').forEach((id, i) => { C(id, a.eu + 0.1 + i * 0.02, 'f', { att: 0.8 }); C(id, a.pers2 + 0.02 + i * 0.01, euOnly.includes(id) ? 'g' : 'g'); });
  C('380', a.it, 'g', { named: true }); // l'Italie repasse au premier plan (déjà grise)
  const afr = WORLD.AFR.filter(id => id !== '012').sort((x, y) => dist(x, CAPS.alger) - dist(y, CAPS.alger));
  afr.forEach((id, i) => { const t = a.ua + 0.3 + i * 0.03; C(id, t, 'a'); SCORE.a.push([t, 1]); });
  SCORE.a.push([a.ua + 0.3 + afr.length * 0.03, 55 - 1 - afr.length]); // Maurice, Seychelles… (trop petits pour la carte)
  const arabAsia = WORLD.ARAB.filter(id => !WORLD.AFR.includes(id)).sort((x, y) => dist(x, CAPS.caire) - dist(y, CAPS.caire));
  arabAsia.forEach((id, i) => { const t = a.n22 - 0.2 + i * 0.05; C(id, t, 'a'); SCORE.a.push([t, 1]); });
  C('643', a.ru, 'a', { named: true }); C('156', a.cn, 'a', { named: true }); C('643', a.amies, 'h'); C('156', a.amies + 0.1, 'h');

  // ---- avions
  const L = (jet, from, to, t0, t1, sMid, sEnd, o = {}) => LEGS.push({ jet, a: CAPS[from] || from, b: CAPS[to] || to, t0, t1, sMid, sEnd, ...o });
  L('jet_fr', 'paris', 'bruxelles', a.otan, a.n32 + 0.2, 2300, 2600);
  L('jet_fr', 'marseille', [3.6, 38.9], a.ciel + 0.3, a.ferme + 0.15, 0, 0, { noFollow: true });
  L('jet_fr', [3.6, 38.9], 'marseille', a.ferme + 0.25, a.avions + 1.0, 0, 0, { noFollow: true, noTrail: true });
  L('jet_dz', 'alger', 'addis', a.ua - 0.1, a.commune, 420, 560);
  L('jet_dz', 'addis', 'caire', a.ligue - 0.3, a.n22 + 0.1, 600, 760);
  L('jet_dz', 'caire', 'moscou', a.ru - 0.2, a.vendeur + 0.1, 420, 520);
  L('jet_dz', 'moscou', 'pekin', a.cn - 0.2, a.part + 0.5, 430, 520);
  JETVIS = { jet_fr: [[a.otan - 0.1, a.protege - 0.2], [a.ciel + 0.2, a.b7 + 0.2]], jet_dz: [[a.ta5 + 0.1, a.b6 - 0.1]] };

  // ---- caméra
  buildCam([
    st(0, 0, 2.6, 46.5, 2600, { drift: 0.05 }),
    st(a.dz0 + 0.6, 1.1, 2.8, 40.5, 1500),
    st(a.qui + 0.6, 0.9, 3, 42, 1150),
    st(a.tf + 0.2, 0.8, 2.5, 44, 1700),
    st(a.ta + 0.3, 0.8, 3.2, 38, 1500),
    st(a.otan - 0.05, 0.8, 2.35, 47.5, 2300),
    st(a.protege - 0.1, 1.4, -32, 48, 330, { drift: 0.04 }),
    st(a.pas + 0.1, 0.9, -20, 46, 420),
    st(a.pers + 0.25, 0.9, -12, 47, 360),
    st(a.eu + 0.35, 1.0, 13, 50, 950),
    st(a.pers2 + 0.25, 0.8, 11, 49, 1150),
    st(a.it + 0.4, 1.1, 10, 39.5, 1700),
    st(a.tiers + 0.6, 0.9, 8.5, 37.5, 2100),
    st(a.reste + 0.3, 0.9, 11, 41, 2600),
    st(a.res + 0.4, 1.0, 2.5, 46.6, 2500),
    st(a.seule + 0.2, 1.0, 2.4, 46.6, 4200, { drift: 0.04 }),
    st(a.ta5 + 0.4, 1.0, 3, 35, 1300),
    st(a.amies + 0.3, 1.2, 76, 55, 470, { drift: 0.04 }),
    st(a.sans + 0.4, 0.8, 80, 54, 520),
    st(a.ciel + 0.3, 1.3, 4.2, 40.8, 2000),
    st(a.y2021 + 0.5, 0.9, 4, 39.5, 2500),
    st(a.ferme + 0.3, 0.9, 3.5, 37.5, 2900),
    st(a.avions + 0.9, 0.9, 3.5, 39.5, 2300),
    st(a.budget + 0.2, 1.0, 3.5, 40, 1500),
    st(a.gros + 0.2, 0.9, 3, 41, 1850),
    st(a.bombe + 0.1, 0.9, 2.4, 46.5, 3000),
    st(a.fou + 0.2, 1.1, 3, 34, 1600),
    st(a.y1949 + 0.3, 1.0, 3.2, 35.2, 2700, { drift: 0.04 }),
    st(a.protegee + 0.2, 0.9, 2.6, 33, 1900),
    st(a.tf9 + 0.2, 1.1, 3, 42.5, 1350),
    st(a.ta9 + 0.2, 0.8, 3, 40, 1700),
    st(a.abo + 0.1, 0.8, 3, 42, 1400),
    st(a.fin + 0.5, 0.8, 3, 42.5, 1550, { drift: 0.04 }),
  ]);
  A.tilt = [[a.tf - 0.5, a.otan, 18], [a.eu - 0.3, a.it + 0.5, 16], [a.ta5 - 0.3, a.pacte, 20], [a.budget - 0.3, a.bombe + 0.4, 16], [a.tf9 - 0.3, a.comm, 16]];

  // ---- sons et actions
  ev(0, 'whoosh'); ev(a.fr0, 'scan'); ev(a.fr0 + 0.05, 'pop'); ev(a.dz0, 'scan'); ev(a.dz0 + 0.05, 'pop'); ev(a.dz0 + 0.3, 'whoosh'); ev(a.qui, 'boing'); ev(a.tf, 'pop'); ev(a.contre, 'stamp'); ev(a.ta, 'pop'); ev(a.sb, 'pop');
  act(a.fr0, 'France', 'drapeau'); act(a.tf, 'soldat français', 'agite le drapeau'); act(a.ta, 'soldat algérien', 'pose');
  ev(a.otan, 'jet'); act(a.otan, 'Rafale', 'décolle vers Bruxelles'); ev(a.otan + 0.25, 'shine');
  nato.forEach((id, i) => { if (i % 3 === 0) ev(a.otan + 0.25 + i * 0.035, 'tic'); }); ev(a.n32, 'count'); ev(a.n32 + 0.4, 'pop');
  ev(a.protege - 1.4, 'whoosh'); ev(a.protege, 'shine'); act(a.protege, 'bouclier OTAN', 'apparaît'); ev(a.quon, 'pop'); ev(a.pas, 'boing'); ev(a.qui1, 'stamp'); act(a.qui1, 'tampon', 'ATTAQUANT'); ev(a.pers, 'impact'); act(a.pers, 'OTAN', 's\'éteint'); ev(a.bouge, 'tic');
  ev(a.eu - 0.3, 'whoosh'); ev(a.eu, 'shine'); act(a.eu, 'drapeau UE', 'tourne'); ev(a.pareil, 'pop'); ev(a.pers2, 'stamp'); act(a.pers2, 'Europe', 's\'éteint');
  ev(a.it - 0.2, 'whoosh'); ev(a.it, 'scan'); ev(a.it + 0.05, 'pop'); ev(a.tiers, 'draw'); act(a.tiers, 'gazoduc', 'se dessine'); ev(a.gaz, 'water'); ev(a.vient, 'pop'); ev(a.reste, 'boing'); act(a.reste, 'personnage', 'hausse les épaules');
  ev(a.res - 0.1, 'whoosh'); ev(a.res, 'count'); ev(a.fr4, 'heartbeat'); act(a.fr4, 'soldat français', 'triste'); ev(a.seule, 'stamp'); ev(a.seule + 0.4, 'whoosh');
  ev(a.ta5, 'pop'); act(a.ta5, 'soldat algérien', 'bras croisés'); ev(a.ta5 + 0.1, 'jet'); act(a.ua, 'jet algérien', 'vole vers Addis-Abeba'); ev(a.ua + 0.3, 'shine');
  afr.forEach((id, i) => { if (i % 3 === 0) ev(a.ua + 0.3 + i * 0.03, 'tic'); }); ev(a.pacte, 'pop'); act(a.pacte, 'parchemin', 'pacte 2005'); ev(a.commune, 'stamp');
  ev(a.ligue - 0.3, 'jet'); ev(a.ligue, 'scan'); act(a.ligue, 'Ligue arabe', 'drapeau'); ev(a.n22, 'count'); ev(a.n22 + 0.3, 'pop');
  ev(a.ru - 0.2, 'jet'); ev(a.ru, 'scan'); ev(a.ru + 0.05, 'pop'); ev(a.vendeur, 'thud'); act(a.vendeur, 'caisse', 'tombe');
  ev(a.cn - 0.2, 'jet'); ev(a.cn, 'scan'); ev(a.cn + 0.05, 'pop'); ev(a.part, 'pop'); act(a.part, 'poignée de main', 'apparaît'); ev(a.amies, 'whoosh'); ev(a.amies + 0.4, 'draw'); ev(a.sans, 'stamp'); act(a.sans, 'tampon', 'SANS TRAITÉ');
  ev(a.ciel - 0.2, 'whoosh'); ev(a.ciel + 0.3, 'jet'); act(a.ciel + 0.3, 'Rafale', 'part de Marseille'); ev(a.y2021, 'pop'); ev(a.ferme, 'barrier'); act(a.ferme, 'panneau', 'interdit'); ev(a.ferme + 0.25, 'boing'); act(a.ferme + 0.25, 'Rafale', 'fait demi-tour'); ev(a.avions, 'alarm');
  ev(a.budget - 0.2, 'whoosh'); ev(a.budget, 'pop'); act(a.budget, 'barres budget', 'montent'); ev(a.budget + 0.4, 'count'); ev(a.deuxf, 'count'); ev(a.gros, 'thud'); ev(a.bombe, 'impact'); act(a.bombe, 'bombe', 'apparaît');
  ev(a.fou - 0.3, 'whoosh'); ev(a.fou, 'boing'); ev(a.y1949, 'photo'); act(a.y1949, 'parchemin', '1949'); ev(a.traite, 'draw'); ev(a.traite + 0.4, 'shine'); act(a.traite, 'Algérie', 'bleu OTAN'); ev(a.protegee, 'stamp'); ev(a.otan8 + 0.3, 'pop');
  ev(a.tf9 - 0.2, 'cheer'); ev(a.tf9, 'pop'); ev(a.ta9, 'pop'); ev(a.comm, 'pop'); ev(a.abo, 'pop'); ev(a.abo + 0.1, 'ding'); act(a.tf9, 'soldats', 'face à face');
  ev(a.contre + 0.6, 'tic'); ev(a.qui + 0.8, 'tic'); ev(a.b1, 'pop'); ev(a.b1 + 1.0, 'tic'); ev(a.protege + 0.6, 'tic'); ev(a.pareil + 0.5, 'tic'); ev(a.vient + 0.6, 'tic'); ev(a.res + 0.6, 'tic'); ev(a.pacte + 0.8, 'tic'); ev(a.commune + 0.6, 'tic'); ev(a.vendeur + 0.6, 'tic'); ev(a.part + 0.6, 'tic'); ev(a.b6 + 0.5, 'tic'); ev(a.avions + 0.8, 'tic'); ev(a.bombe + 0.6, 'tic'); ev(a.b8, 'tic'); ev(a.y1949 + 0.7, 'tic'); ev(a.otan8, 'tic'); ev(a.comm + 0.5, 'tic');
  window.PREVIEW = [0.6, a.dz0 + 0.5, a.qui + 0.4, a.contre + 0.4, a.otan + 0.6, a.n32 + 0.3, a.protege + 0.5, a.qui1 + 0.4, a.pers + 0.6, a.eu + 0.5, a.pers2 + 0.4, a.it + 0.5, a.tiers + 0.6, a.reste + 0.4, a.res + 0.5, a.seule + 0.4, a.ta5 + 0.4, a.ua + 0.8, a.pacte + 0.5, a.ligue + 0.4, a.n22 + 0.5, a.ru + 0.5, a.vendeur + 0.4, a.cn + 0.6, a.part + 0.4, a.sans + 0.4, a.ciel + 0.6, a.y2021 + 0.3, a.ferme + 0.4, a.avions + 0.6, a.budget + 0.6, a.gros + 0.3, a.bombe + 0.4, a.fou + 0.3, a.y1949 + 0.4, a.traite + 0.4, a.protegee + 0.4, a.tf9 + 0.4, a.ta9 + 0.4, a.abo + 0.4];
}

// ---------- sur la carte (avant rotation) ----------
const TRANSMED = [[3.27, 32.93], [6.5, 34.2], [8.3, 35.0], [10.4, 36.6], [11.05, 37.06], [12.59, 37.65], [14.2, 38.2], [15.65, 38.2], [16.2, 39.5], [15.4, 40.7], [14.3, 41.3], [12.5, 42.4], [11.6, 44.6]];
function lineOn(pts, u) { const ps = pts.map(p => P(p)); let L = 0; const seg = []; for (let i = 1; i < ps.length; i++) { const d = Math.hypot(ps[i][0] - ps[i - 1][0], ps[i][1] - ps[i - 1][1]); seg.push(d); L += d; } m.beginPath(); m.moveTo(ps[0][0], ps[0][1]); let acc = 0; for (let i = 1; i < ps.length; i++) { if (acc + seg[i - 1] > L * u) { const f = (L * u - acc) / seg[i - 1]; m.lineTo(lerp(ps[i - 1][0], ps[i][0], f), lerp(ps[i - 1][1], ps[i][1], f)); break; } m.lineTo(ps[i][0], ps[i][1]); acc += seg[i - 1]; } }
function mapOver(t) {
  const a = A;
  // gazoduc Transmed
  if (t > a.tiers - 0.1 && t < a.b4 + 0.3) {
    const u = easeOut(prog(t, a.tiers, 0.9)); const al = fadeOut(t, a.b4, 0.3);
    m.save(); m.globalAlpha = al; m.lineCap = 'round'; m.lineJoin = 'round'; lineOn(TRANSMED, u); m.lineWidth = 16; m.strokeStyle = '#2b3b45'; m.stroke(); m.lineWidth = 9; m.strokeStyle = '#7fe3ff'; m.shadowColor = '#7fe3ff'; m.shadowBlur = 16; m.setLineDash([22, 18]); m.lineDashOffset = -t * 90; m.stroke(); m.restore();
  }
  // ciel algérien fermé
  if (t > a.ferme - 0.1 && t < a.b7 + 0.3) {
    const al = clamp((t - a.ferme + 0.1) / 0.3) * fadeOut(t, a.b7, 0.3); const g = geomOf('012');
    m.save(); m.globalAlpha = al; pathM(g); m.fillStyle = `rgba(230,30,40,${0.18 + 0.08 * Math.sin(t * 8)})`; m.fill(); m.setLineDash([26, 16]); m.lineDashOffset = t * 50; m.lineWidth = 9; m.strokeStyle = '#ff2d2d'; m.shadowColor = '#ff2d2d'; m.shadowBlur = 20; m.stroke(); m.restore();
  }
  // 1949 : l'Algérie dans le traité de l'OTAN
  if (t > a.traite - 0.1 && t < a.b9 + 0.2) {
    const al = clamp((t - a.traite + 0.1) / 0.4) * fadeOut(t, a.b9, 0.3); const g = geomOf('012');
    m.save(); m.globalAlpha = al; pathM(g); m.fillStyle = `rgba(40,80,220,${0.42 + 0.1 * Math.sin(t * 5)})`; m.fill(); m.lineWidth = 8; m.strokeStyle = '#cfe0ff'; m.shadowColor = '#4f7bff'; m.shadowBlur = 30; m.stroke(); m.restore();
  }
}

// ---------- calque écran ----------
function screenScene(c, t) {
  const a = A;
  // accroche
  if (t > a.qui && t < a.tf + 0.2) { const s = popIn(t, a.qui, 0.3) * fadeOut(t, a.tf - 0.1, 0.25); c.save(); c.translate(W / 2, 560); c.scale(s, s); txt(c, '?', 0, 0, { size: 300, weight: 900, color: '#FFE928', stroke: '#1b1300', sw: 18 }); c.restore(); }
  if (t > a.tf - 0.1 && t < a.otan + 0.3) {
    const al = fadeOut(t, a.otan, 0.3); c.save(); c.globalAlpha = al;
    waver(c, 'sol_fr', 230, 1440, 380, t, a.tf - 0.1, 0); tag(c, 'TEAM FRANCE', 230, 1010, { size: 52, bg: BLUE, border: '#fff', sc: popIn(t, a.tf, 0.3) });
    if (t > a.ta - 0.1) { soldier(c, 'sol_dz_a', 850, 1440, 390, t, a.ta - 0.1, { ph: 1 }); tag(c, 'TEAM ALGÉRIE', 850, 1010, { size: 52, bg: GREEN, border: '#fff', sc: popIn(t, a.ta, 0.3) }); }
    if (t > a.contre) { c.save(); c.translate(540, 1200); const s = stampScale(t, a.contre); c.scale(s, s); c.shadowColor = '#ffd23a'; c.shadowBlur = 40; txt(c, 'VS', 0, 0, { size: 200, weight: 900, color: '#FFE928', stroke: '#3a2500', sw: 18, shadow: false }); c.restore(); }
    c.restore();
  }
  // OTAN
  if (t > a.otan && t < a.protege) tag(c, 'OTAN', W / 2, 470, { size: 70, bg: '#1d3a8a', border: '#fff', sc: popIn(t, a.otan, 0.3) * fadeOut(t, a.protege - 0.25, 0.2) });
  if (t > a.n32 - 0.1 && t < a.protege) counter(c, 32, t, a.n32 - 0.1, a.n32 + 0.5, W / 2, 620, { size: 130, label: 'PAYS', until: a.protege - 0.25 });
  if (t > a.protege - 0.1 && t < a.b2 + 0.1) {
    const al = fadeOut(t, a.b2 - 0.1, 0.25); const s = popIn(t, a.protege - 0.1, 0.35);
    c.save(); c.globalAlpha = al; c.translate(W / 2, 760); c.scale(s, s); c.rotate(0.05 * Math.sin(t * 3)); sprite(c, 'shield_stop', 0, 0, 330, { shadow: false }); c.restore();
    tag(c, 'ARTICLE 5', W / 2, 360 + 70, { size: 54, bg: '#1d3a8a', border: '#fff', sc: popIn(t, a.protege + 0.1, 0.3) * al });
    if (t > a.quon - 0.1) tag(c, '✓ ATTAQUÉ', 300, 1000, { size: 56, bg: '#18a34a', border: '#fff', sc: popIn(t, a.quon, 0.3) * al, rot: -0.04 });
    if (t > a.qui1 - 0.1) tag(c, '✗ ATTAQUANT', 780, 1000, { size: 56, bg: '#d4161f', border: '#fff', sc: stampScale(t, a.qui1) * al, rot: 0.04 });
    stampText(c, 'PERSONNE NE BOUGE', W / 2, 1200, t, a.pers + 0.1, a.b2 - 0.15, { size: 70 });
  }
  // Europe
  if (t > a.eu - 0.1 && t < a.it) { const s = popIn(t, a.eu - 0.1, 0.35) * fadeOut(t, a.it - 0.25, 0.25); c.save(); c.translate(W / 2, 520); c.scale(s, s); c.rotate(t * 0.5); sprite(c, 'eu', 0, 110, 220, { shadow: false }); c.restore(); tag(c, 'ART. 42.7 : LA VICTIME', W / 2, 680, { size: 44, bg: '#003399', border: '#fff', sc: popIn(t, a.pareil, 0.3) * fadeOut(t, a.it - 0.25, 0.25) }); }
  stampText(c, 'PERSONNE', W / 2, 1150, t, a.pers2, a.it - 0.15, { size: 100 });
  // Italie, gaz
  if (t > a.tiers - 0.1 && t < a.b4) {
    const al = fadeOut(t, a.b4 - 0.2, 0.25); c.save(); c.globalAlpha = al;
    const p = S(11.4, 37.3); sprite(c, 'pipe', p.x, p.y + 60 + 5 * Math.sin(t * 4), 120 * popIn(t, a.gaz - 0.1, 0.35), { shadow: false });
    if (t > a.tiers) { const s = popIn(t, a.tiers, 0.3) * (1 + 0.04 * Math.sin(t * 6)); c.save(); c.translate(W / 2, 560); c.scale(s, s); txt(c, '1/3', 0, 0, { size: 190, weight: 900, color: '#7fe3ff', stroke: '#06283a', sw: 16 }); txt(c, 'DU GAZ DE L\'ITALIE', 0, 125, { size: 50, weight: 900, color: '#fff', stroke: '#000', sw: 9 }); c.restore(); }
    if (t > a.reste - 0.1) sprite(c, 'shrug', 800, 1440, 360 * popIn(t, a.reste - 0.1, 0.3), { rot: 0.04 * Math.sin(t * 6) });
    c.restore();
  }
  // seule
  if (t > a.fr4 - 0.3 && t < a.ta5 + 0.1) {
    const al = Math.min(clamp((t - a.fr4 + 0.3) / 0.4), fadeOut(t, a.ta5 - 0.1, 0.25)); const p = S(2.4, 46.6);
    c.save(); c.globalAlpha = al; const g = c.createRadialGradient(p.x, p.y, 220, p.x, p.y, 820); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.72)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    sprite(c, 'sol_fr_sad', W / 2, 1460, 470 * popIn(t, a.fr4 - 0.1, 0.35), { rot: 0.02 * Math.sin(t * 2) }); c.restore();
    stampText(c, 'TOUTE SEULE', W / 2, 820, t, a.seule, a.ta5 - 0.1, { col: BLUE, size: 92 });
  }
  // Team Algérie
  if (t > a.ta5 - 0.1 && t < a.ua + 0.4) { const al = fadeOut(t, a.ua + 0.1, 0.3); c.save(); c.globalAlpha = al; soldier(c, 'sol_dz_b', 850, 1440, 390, t, a.ta5 - 0.1); tag(c, 'TEAM ALGÉRIE', 850, 1010, { size: 52, bg: GREEN, border: '#fff', sc: popIn(t, a.ta5, 0.3) }); c.restore(); }
  if (t > a.ua && t < a.ligue) { const al = fadeOut(t, a.ligue - 0.25, 0.25); tag(c, 'UNION AFRICAINE', W / 2, 470, { size: 58, bg: '#127a3a', border: '#e9c33b', sc: popIn(t, a.ua, 0.3) * al });
    if (t > a.pacte - 0.1) { const s = popIn(t, a.pacte - 0.1, 0.35) * al; c.save(); c.translate(W / 2, 1180); c.scale(s, s); c.rotate(-0.05); sprite(c, 'parchment', 0, 190, 360, { shadow: false }); txt(c, 'PACTE DE', -10, -20, { size: 46, font: 'Caveat', weight: 700, color: '#4a2a08', shadow: false }); txt(c, 'DÉFENSE', -10, 30, { size: 52, font: 'Caveat', weight: 700, color: '#4a2a08', shadow: false }); txt(c, '2005', -10, 86, { size: 50, font: 'Caveat', weight: 700, color: '#8a1010', shadow: false }); c.restore(); } }
  if (t > a.ligue - 0.1 && t < a.ru) { const al = fadeOut(t, a.ru - 0.25, 0.25); const s = popIn(t, a.ligue - 0.1, 0.3) * al; c.save(); c.translate(W / 2, 520); c.scale(s, s); flagCard(c, 0, 0, FL.arab, 180); c.restore(); tag(c, 'LIGUE ARABE', W / 2, 670, { size: 56, bg: '#0d6b34', border: '#fff', sc: s }); if (t > a.n22 - 0.1) counter(c, 22, t, a.n22 - 0.1, a.n22 + 0.5, W / 2, 1180, { size: 130, label: 'PAYS', until: a.ru - 0.25 }); }
  if (t > a.vendeur - 0.2 && t < a.cn) { const al = fadeOut(t, a.cn - 0.25, 0.25); const pm = S(...CAPS.moscou); const y = lerp(pm.y - 500, pm.y + 40, easeIn(prog(t, a.vendeur - 0.2, 0.35))); c.save(); c.globalAlpha = al; sprite(c, 'crate', pm.x, y, 170, { rot: -0.06 }); c.restore(); tag(c, '1er VENDEUR D\'ARMES', W / 2, 1200, { size: 50, bg: '#b22222', border: '#fff', sc: popIn(t, a.vendeur + 0.15, 0.3) * al }); }
  if (t > a.part - 0.1 && t < a.b6) { const al = fadeOut(t, a.b6 - 0.25, 0.25); const s = popIn(t, a.part - 0.1, 0.35) * al; c.save(); c.translate(W / 2, 1220); c.scale(s, s); sprite(c, 'handshake', 0, 0, 200, { shadow: false, rot: 0.05 * Math.sin(t * 5) }); c.restore(); tag(c, 'PARTENAIRES', W / 2, 520, { size: 56, bg: '#333', border: '#fff', sc: s * fadeOut(t, a.sans - 0.2, 0.2) }); }
  stampText(c, 'SANS TRAITÉ', W / 2, 560, t, a.sans, a.b6 - 0.1, { col: '#6b7076', size: 96 });
  // ciel fermé
  if (t > a.y2021 - 0.1 && t < a.b7) tag(c, '2021', W / 2, 470, { size: 70, bg: '#C00E1F', border: '#fff', sc: popIn(t, a.y2021, 0.3) * fadeOut(t, a.b7 - 0.25, 0.25) });
  if (t > a.ferme - 0.1 && t < a.b7) { const p = S(3.0, 30.5); const s = stampScale(t, a.ferme) * fadeOut(t, a.b7 - 0.25, 0.25); c.save(); c.translate(p.x, p.y); c.scale(s, s); c.beginPath(); c.arc(0, 0, 118, 0, 7); c.fillStyle = '#fff'; c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 20; c.fill(); c.restore(); c.save(); c.translate(p.x, p.y); c.scale(s, s); sprite(c, 'noplane', 0, 128, 256, { shadow: false }); c.restore(); }
  stampText(c, 'CIEL FERMÉ', W / 2, 1200, t, a.avions, a.b7 - 0.15, { size: 88 });
  // budget
  if (t > a.budget - 0.1 && t < a.fou) {
    const al = fadeOut(t, a.fou - 0.3, 0.3); const s = popIn(t, a.budget - 0.1, 0.35); const g1 = easeOut(prog(t, a.budget + 0.2, 0.7)), g2 = easeOut(prog(t, a.deuxf - 0.1, 0.8));
    c.save(); c.globalAlpha = al; c.translate(W / 2, 1000); c.scale(s, s);
    rr(c, -400, -560, 800, 650, 30); c.fillStyle = 'rgba(255,255,255,.92)'; c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 30; c.fill(); c.shadowColor = 'transparent';
    txt(c, 'BUDGET MILITAIRE', 0, -500, { size: 44, weight: 900, color: '#111', shadow: false });
    const H1 = 170 * g1, H2 = 380 * g2;
    rr(c, -270, 20 - H1, 200, H1, 14); c.fillStyle = GREEN; c.fill(); rr(c, 70, 20 - H2, 200, Math.max(1, H2), 14); c.fillStyle = BLUE; c.fill();
    if (g1 > 0.1) sprite(c, 'money', -170, 10 - H1, 110, { shadow: false });
    if (g1 > 0.5) txt(c, '25 Md$', -170, -H1 - 130, { size: 50, weight: 900, color: GREEN, shadow: false });
    if (g2 > 0.5) txt(c, '× 2', 170, -H2 - 40, { size: 70, weight: 900, color: BLUE, shadow: false });
    flagCard(c, -170, 65, FL.dz, 70); flagCard(c, 170, 65, FL.fr, 70);
    c.restore();
    if (t > a.bombe - 0.15) { const p = S(2.4, 46.8); const s2 = popIn(t, a.bombe - 0.15, 0.35) * (1 + 0.05 * Math.sin(t * 7)); c.save(); c.globalAlpha = al; c.shadowColor = '#ffd400'; c.shadowBlur = 40; sprite(c, 'nuke', W / 2, 1340, 210 * s2, { shadow: false }); c.restore(); }
  }
  // 1949
  if (t > a.y1949 - 0.15 && t < a.b9) {
    const al = fadeOut(t, a.b9 - 0.3, 0.3); const s = popIn(t, a.y1949 - 0.15, 0.35); const yy = t > a.traite + 0.4 ? lerp(0, -330, easeOut(prog(t, a.traite + 0.4, 0.5))) : 0;
    c.save(); c.globalAlpha = al; c.translate(W / 2, 980 + yy); c.scale(s * (1 - 0.35 * easeOut(prog(t, a.traite + 0.4, 0.5))), s * (1 - 0.35 * easeOut(prog(t, a.traite + 0.4, 0.5)))); c.rotate(-0.04);
    sprite(c, 'parchment', 0, 330, 640, { shadow: false });
    txt(c, '1949', -20, -170, { size: 120, font: 'Caveat', weight: 700, color: '#8a1010', shadow: false });
    txt(c, 'Traité de l\'Atlantique Nord', -20, -70, { size: 50, font: 'Caveat', weight: 700, color: '#4a2a08', shadow: false });
    txt(c, typed('Art. 6 : « les départements', t, a.y1949 + 0.4, 0.6), -20, 0, { size: 44, font: 'Caveat', weight: 700, color: '#4a2a08', shadow: false });
    txt(c, typed('algériens de la France »', t, a.y1949 + 0.9, 0.6), -20, 56, { size: 44, font: 'Caveat', weight: 700, color: '#4a2a08', shadow: false });
    c.restore();
    stampText(c, 'PROTÉGÉE PAR L\'OTAN', W / 2, 1220, t, a.protegee, a.otan8 + 0.5, { col: '#1d3a8a', size: 66 });
    if (t > a.otan8 + 0.5) tag(c, 'JUSQU\'EN 1962', W / 2, 1220, { size: 60, bg: '#C00E1F', border: '#fff', sc: popIn(t, a.otan8 + 0.5, 0.3) * al });
  }
  // fin
  if (t > a.tf9 - 0.2) {
    waver(c, 'sol_fr', 210, 1450, 360, t, a.tf9 - 0.2, 0); soldier(c, 'sol_dz_a', 870, 1450, 370, t, a.tf9 - 0.1, { ph: 1 });
    if (t > a.tf9 - 0.05) tag(c, 'TEAM FRANCE', 210, 1030, { size: 48, bg: BLUE, border: '#fff', sc: popIn(t, a.tf9, 0.3) }); if (t > a.ta9 - 0.05) tag(c, 'TEAM ALGÉRIE', 870, 1030, { size: 48, bg: GREEN, border: '#fff', sc: popIn(t, a.ta9, 0.3) });
    { const s = popIn(t, a.tf9 - 0.1, 0.3) * (1 + 0.1 * Math.max(0, 1 - Math.abs(t - a.ta9) / 0.15)); c.save(); c.translate(W / 2, 880); c.scale(s, s); txt(c, 'QUI GAGNE ?', 0, 0, { size: 120, weight: 900, color: '#FFE928', stroke: '#1b1300', sw: 14 }); c.restore(); }
    if (t > a.abo - 0.15) tag(c, 'ABONNE-TOI', W / 2, 1230, { size: 70, bg: '#C00E1F', border: '#fff', sc: stampScale(t, a.abo) });
  }
}
