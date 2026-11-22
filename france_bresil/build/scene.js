// scene.js — Team France vs Team Brésil (scénario imaginaire). Moteur : engine.js.
const BRG = '#0f9a3c';
const P_ = { paris: [2.35, 48.86], brasilia: [-47.88, -15.79], rio: [-43.2, -22.9], pont: [-51.88, 3.87], kourou: [-52.77, 5.24], cayenne: [-52.33, 4.92], washington: [-77.04, 38.9], sdf: [2.36, 48.924] };
const CFG = {
  teamCol: { f: '#3b7bff', a: '#22c55e', g: '#9aa0a6', h: '#c9ccd1' },
  trail: { jet_fr: '#F7EF08', jet_br: '#F7EF08' },
  NAME: { '250': 'FRANCE', '076': 'BRÉSIL', '254': 'GUYANE', '840': 'ÉTATS-UNIS' },
  ANCH: { '250': [2.4, 46.8], '076': [-52, -10], '254': [-53.1, 3.9], '840': [-98, 39] },
  sides: [[-1, BLUE, 'TEAM FRANCE', 'f', 'fr'], [1, BRG, 'TEAM BRÉSIL', 'a', 'br']],
  sprites: ['jet_fr', 'jet_br', 'sol_fr_a', 'sol_fr_b', 'sol_br_a', 'sol_br_b', 'sol_us_a', 'pont', 'amazonie', 'toucan', 'euro', 'diplomates', 'joueur_br', 'pain_sucre', 'metre', 'flag_br', 'eu', 'qmark', 'stamp', 'umbrella', 'shield_crack', 'rocket', 'player', 'ball', 'trophy'],
  extraFlags: ['eu', 'fr', 'br', 'us'],
};
const BRICS = ['643', '356', '156', '710', '818', '231', '364', '784', '360'];
let EU_REST = [], BORDER = [], FR_MAIN = null;
const SPOTS15 = [[-63, 0.5], [-54, 1], [-71, -6], [-62, -6.5], [-53, -6], [-44, -5.5], [-38, -8], [-66, -12.5], [-57, -12.5], [-48, -12], [-40.5, -14.5], [-56, -19.5], [-47, -19.5], [-52, -26.5], [-44, -22]];

function splitFrance() {
  // Guyane séparée de la France (même drapeau), France = Hexagone + Corse
  for (const src of [WORLD.byId['250'].g, WORLD.c10['250']]) {
    if (!src || src.type !== 'MultiPolygon') continue;
    const cen = p => d3.geoCentroid({ type: 'Polygon', coordinates: p });
    const guf = src.coordinates.filter(p => { const [x, y] = cen(p); return x < -50 && x > -56 && y > 1 && y < 7; });
    const met = src.coordinates.filter(p => { const [x, y] = cen(p); return x > -6 && x < 11 && y > 41 && y < 52; });
    if (src === WORLD.byId['250'].g) { WORLD.byId['254'] = { id: '254', n: 'Guyane', g: { type: 'MultiPolygon', coordinates: guf } }; WORLD.byId['250'].g = { type: 'MultiPolygon', coordinates: met }; }
    else { WORLD.c10['254'] = { type: 'MultiPolygon', coordinates: guf }; WORLD.c10['250'] = { type: 'MultiPolygon', coordinates: met }; }
  }
  WORLD.cent['254'] = [-53.1, 3.9];
  // frontière Guyane–Brésil : sommets de la Guyane proches du Brésil
  const g = WORLD.byId['254'].g.coordinates.map(p => p[0]).sort((a, b) => b.length - a.length)[0];
  const br = WORLD.byId['076'].g; const bv = []; (br.type === 'MultiPolygon' ? br.coordinates : [br.coordinates]).forEach(P2 => P2[0].forEach(v => { if (v[0] > -56 && v[0] < -50 && v[1] > 1 && v[1] < 5) bv.push(v); }));
  const near = g.map(v => bv.some(u => Math.abs(u[0] - v[0]) < 0.06 && Math.abs(u[1] - v[1]) < 0.06));
  let s = near.findIndex((x, i) => x && !near[(i - 1 + near.length) % near.length]); if (s < 0) s = 0;
  for (let i = 0; i < g.length; i++) { const k = (s + i) % g.length; if (!near[k]) break; BORDER.push(g[k]); }
  FR_MAIN = WORLD.byId['250'].g.coordinates.slice().sort((a, b) => b[0].length - a[0].length)[0];
}

function setup() {
  const a = A; ISO['254'] = 'fr'; splitFrance();
  a.br0 = T(0, 'bresil'); a.fr0 = T(0, 'france'); a.qui = T(0, 'qui'); a.tf = T(0, 'team'); a.contre = T(0, 'contre'); a.tb = T(0, 'team', 2);
  a.b1 = beatStart(1); a.front = T(1, 'frontiere'); a.avec = T(1, 'avec'); a.guy = T(1, 'guyane'); a.km = T(1, 'sept'); a.longue = T(1, 'plus'); a.fr1 = T(1, 'france', 2);
  a.b2 = beatStart(2); a.n212 = T(2, 'deux'); a.armee = T(2, 'la'); a.latine = T(2, 'latine'); a.traite = T(2, 'traite'); a.y47 = T(2, 'mille'); a.usa = T(2, 'etatsunis'); a.mais = T(2, 'mais'); a.otan = T(2, 'lotan'); a.fr2 = T(2, 'france');
  a.b3 = beatStart(3); a.brics = T(3, 'brics'); a.alli = T(3, 'alliance'); a.pers = T(3, 'personne'); a.bouger = T(3, 'bouger');
  a.b4 = beatStart(4); a.otan4 = T(4, 'lotan'); a.sud = T(4, 'lamerique'); a.ue = T(4, 'lunion'); a.oui = T(4, 'oui'); a.guy4 = T(4, 'guyane'); a.europe = T(4, 'leurope'); a.euro = T(4, 'leuro');
  a.b5 = beatStart(5); a.kourou = T(5, 'kourou'); a.base = T(5, 'base'); a.fusees = T(5, 'fusees'); a.espace = T(5, 'lespace');
  a.b6 = beatStart(6); a.x15 = T(6, 'quinze'); a.hex = T(6, 'lhexagone'); a.der = T(6, 'mais'); a.finale = T(6, 'finale'); a.coupe = T(6, 'coupe'); a.y98 = T(6, 'mille'); a.trois = T(6, 'trois'); a.pour = T(6, 'pour');
  a.b7 = beatStart(7); a.tf7 = T(7, 'team'); a.tb7 = T(7, 'team', 2); a.comm = T(7, 'commentaire'); a.abo = T(7, 'abonnetoi'); a.fin = TE(7, 'abonnetoi');
  a.sb = a.tb + 0.35; DUR = a.fin + 0.6; a.big = [[a.b7 + 0.1, DUR + 1]];

  // ---- pays
  C('076', a.br0, 'a', { named: true }); C('250', a.fr0, 'f', { named: true }); SCORE.a.push([a.br0, 1]); SCORE.f.push([a.fr0, 1]);
  C('254', a.guy, 'f', { named: true });
  C('840', a.usa, 'a', { named: true }); SCORE.a.push([a.usa, 1]); C('840', a.otan, 'h'); SCORE.a.push([a.otan + 0.3, -1]); C('840', a.b3, 'x');
  BRICS.forEach((id, i) => { C(id, a.brics + 0.05 + i * 0.06, 'h'); C(id, a.b4, 'x'); });
  EU_REST = WORLD.EU.filter(id => id !== '250').sort((x, y) => d3.geoDistance(WORLD.cent[x], P_.paris) - d3.geoDistance(WORLD.cent[y], P_.paris));
  EU_REST.forEach((id, i) => { C(id, a.oui + 0.05 + i * 0.025, 'f'); C(id, a.b6, 'x'); });
  SCORE.f.push([a.oui + 0.2, 26]);

  // ---- vols
  LEGS.push({ jet: 'jet_br', a: P_.brasilia, b: P_.pont, t0: a.b1 + 0.1, t1: a.guy - 0.05, sMid: 520, sEnd: 1100 });
  LEGS.push({ jet: 'jet_fr', a: P_.paris, b: P_.cayenne, t0: a.b4 + 0.1, t1: a.ue - 0.1, noFollow: true });
  JETVIS = { jet_br: [[a.b1 - 0.1, a.km + 0.2]], jet_fr: [[a.b4 - 0.1, a.oui]] };

  // ---- caméra
  buildCam([
    st(0, 0, -24, 12, 300, { drift: 0.05 }),
    st(a.br0 + 0.7, 0.8, -45, -5, 380),
    st(a.fr0 + 0.8, 0.9, -22, 25, 310),
    st(a.qui + 0.6, 0.8, -25, 18, 330),
    st(a.tf + 0.4, 0.7, -14, 30, 360),
    st(a.tb + 0.3, 0.7, -38, 5, 380),
    st(a.b1 + 0.05, 0.6, -48, -14, 420),
    st(a.guy + 0.5, 0.7, -52.6, 3.6, 2000, { drift: 0.04 }),
    st(a.km + 0.4, 0.7, -52.8, 3.1, 2600, { drift: 0.04 }),
    st(a.longue + 0.4, 1.0, -51.9, 3.85, 9000, { drift: 0.04 }),
    st(a.fr1 + 0.4, 0.6, -51.9, 3.9, 11000),
    st(a.b2 + 0.4, 1.1, -54, -12, 520, { drift: 0.04 }),
    st(a.n212 + 0.3, 0.7, -50, -14, 600),
    st(a.armee + 0.3, 0.7, -47, -16, 760),
    st(a.traite + 0.4, 1.0, -62, 10, 330, { drift: 0.04 }),
    st(a.y47 + 0.1, 0.7, -70, 20, 300),
    st(a.usa + 0.2, 0.8, -82, 30, 380),
    st(a.mais + 0.3, 0.8, -50, 38, 320),
    st(a.otan + 0.3, 0.8, -35, 42, 280),
    st(a.fr2 + 0.2, 0.7, -10, 45, 340),
    st(a.brics + 0.3, 1.0, 50, 15, 300, { drift: 0.04 }),
    st(a.alli + 0.2, 0.8, 70, 18, 330),
    st(a.pers + 0.2, 0.8, 20, 5, 310),
    st(a.bouger + 0.2, 0.7, 10, 8, 400),
    st(a.b4 + 0.3, 1.0, -30, 28, 300, { drift: 0.04 }),
    st(a.otan4 + 0.3, 0.8, -40, 30, 320),
    st(a.sud + 0.3, 0.8, -55, -2, 380),
    st(a.ue + 0.3, 0.9, 5, 48, 600),
    st(a.oui + 0.3, 0.7, 12, 50, 700),
    st(a.guy4 + 0.6, 1.0, -53, 4, 2600, { drift: 0.04 }),
    st(a.europe + 0.3, 0.7, -53.2, 4.2, 3200),
    st(a.kourou + 0.3, 1.0, -52.8, 5.15, 15000, { drift: 0.04 }),
    st(a.base + 0.3, 0.7, -52.77, 5.2, 19000),
    st(a.espace + 0.3, 0.9, -52.7, 5.0, 9000),
    st(a.b6 + 0.4, 1.1, -50, -12, 650, { drift: 0.03 }),
    st(a.hex + 0.4, 0.8, -53, -12, 850),
    st(a.der + 0.4, 1.0, -15, 30, 330),
    st(a.finale + 0.4, 1.0, 2.36, 48.9, 7000, { drift: 0.04 }),
    st(a.y98 + 0.2, 0.8, 2.36, 48.92, 12000),
    st(a.pour + 0.2, 0.8, 2.36, 48.92, 9000),
    st(a.tf7 + 0.2, 1.1, -25, 18, 320),
    st(a.tb7 + 0.2, 0.8, -35, 8, 380),
    st(a.abo + 0.1, 0.8, -28, 15, 340),
    st(a.fin + 0.5, 0.7, -28, 15, 355, { drift: 0.04 }),
  ]);
  A.tilt = [[a.guy - 0.5, a.fr1, 16], [a.kourou - 0.4, a.espace, 18], [a.finale - 0.3, a.pour - 0.6, 14]];

  // ---- sons et actions
  ev(0, 'whoosh'); ev(a.br0, 'scan'); ev(a.br0 + 0.05, 'pop'); act(a.br0, 'Brésil', 'drapeau'); ev(a.fr0 - 0.3, 'whoosh'); ev(a.fr0, 'scan'); ev(a.qui, 'boing'); ev(a.tf, 'pop'); ev(a.contre, 'stamp'); ev(a.tb, 'pop'); ev(a.sb, 'pop');
  act(a.tf, 'soldat français', 'agite le drapeau'); act(a.tb, 'soldat brésilien', 'pose');
  for (const Lg of LEGS) { ev(Lg.t0, 'jet'); act(Lg.t0, Lg.jet, 'vole'); }
  ev(a.guy, 'scan'); ev(a.guy + 0.05, 'pop'); act(a.guy, 'Guyane', 'drapeau'); ev(a.km, 'draw'); act(a.km, 'frontière', 'se dessine'); ev(a.km + 0.6, 'count'); ev(a.longue, 'stamp'); ev(a.longue + 0.5, 'pop'); act(a.longue + 0.5, 'pont Oyapock', 'pop');
  ev(a.b2 - 0.2, 'whoosh'); ev(a.b2, 'pop'); act(a.b2, 'soldat brésilien', 'arrive'); ev(a.n212, 'count'); act(a.n212, 'compteur', '212 M'); ev(a.n212 + 0.3, 'pop'); ev(a.armee, 'stamp'); act(a.armee, 'soldat', 'salut');
  ev(a.traite, 'photo'); act(a.traite, 'traité', 'parchemin'); ev(a.y47, 'stamp'); ev(a.usa, 'scan'); ev(a.usa + 0.05, 'pop'); act(a.usa, 'soldat US', 'arrive'); ev(a.otan, 'shine'); ev(a.otan + 0.3, 'crumble'); act(a.otan, 'USA', 'hachuré'); ev(a.fr2, 'boing');
  ev(a.brics - 0.2, 'whoosh'); ev(a.brics, 'scan'); BRICS.forEach((id, i) => ev(a.brics + 0.05 + i * 0.06, 'tic')); act(a.brics, 'BRICS', 'hachurés'); ev(a.alli, 'stamp'); act(a.alli, 'diplomates', 'haussent les épaules'); ev(a.pers, 'boing');
  ev(a.otan4, 'shine'); ev(a.otan4 + 0.1, 'draw'); act(a.otan4, 'zone OTAN', 'se dessine'); ev(a.sud, 'impact'); act(a.sud, 'parapluie troué', 'tombe'); ev(a.sud + 0.1, 'crumble');
  ev(a.ue, 'pop'); act(a.ue, 'drapeau UE', 'tourne'); ev(a.oui, 'scan'); EU_REST.forEach((id, i) => { if (i % 3 === 0) ev(a.oui + 0.05 + i * 0.025, 'tic'); }); ev(a.oui + 0.2, 'count'); ev(a.guy4, 'whoosh'); ev(a.europe, 'stamp'); ev(a.euro, 'sparkle'); act(a.euro, 'pièce euro', 'tombe');
  ev(a.kourou, 'ping'); act(a.kourou, 'Kourou', 'ping'); ev(a.base, 'pop'); ev(a.fusees, 'jet'); act(a.fusees, 'fusée', 'décolle');
  ev(a.b6, 'whoosh'); ev(a.x15, 'pop'); act(a.x15, 'France x15', 'posées sur le Brésil'); for (let k = 1; k < 15; k++) ev(a.x15 + k * 0.08, 'tic'); ev(a.hex, 'stamp'); ev(a.der, 'whoosh'); ev(a.finale, 'cheer'); act(a.finale, 'Stade de France', 'ping'); ev(a.y98, 'stamp'); act(a.y98, 'trophée', 'pop'); ev(a.trois, 'impact'); act(a.trois, 'score', '3-0'); ev(a.pour, 'cheer');
  ev(a.tf7 - 0.2, 'whoosh'); ev(a.tf7, 'pop'); ev(a.tb7, 'pop'); ev(a.comm, 'pop'); ev(a.abo, 'pop'); ev(a.abo + 0.1, 'ding'); act(a.tf7, 'soldats', 'face à face');
  fillGaps();
  window.PREVIEW = [0.4, a.fr0 + 0.5, a.contre + 0.4, a.b1 + 1.2, a.guy + 0.5, a.km + 0.8, a.longue + 0.8, a.n212 + 0.6, a.armee + 0.5, a.y47 + 0.4, a.usa + 0.5, a.otan + 0.6, a.brics + 0.6, a.alli + 0.5, a.otan4 + 0.6, a.sud + 0.5, a.oui + 0.6, a.europe + 0.4, a.euro + 0.4, a.kourou + 0.5, a.fusees + 0.6, a.x15 + 1.2, a.hex + 0.4, a.y98 + 0.4, a.trois + 0.4, a.tf7 + 0.4, a.abo + 0.4];
}
function fillGaps() { const ts = EVENTS.map(e => e[0]).sort((x, y) => x - y); for (let i = 1; i < ts.length; i++) for (let t = ts[i - 1] + 1.2; t < ts[i] - 0.3; t += 1.2) ev(t, 'tic'); }

// ---------- carte ----------
function rectPoly(l0, l1, a0, a1) { const r = []; for (let x = l0; x <= l1; x += 2) r.push([x, a0]); for (let y = a0; y <= a1; y += 2) r.push([l1, y]); for (let x = l1; x >= l0; x -= 2) r.push([x, a1]); for (let y = a1; y >= a0; y -= 2) r.push([l0, y]); return { type: 'Polygon', coordinates: [r.reverse()] }; }
function moveShape(ring, from, to) { const R0 = d3.geoRotation([-from[0], -from[1]]), R1 = d3.geoRotation([-to[0], -to[1]]); return ring.map(p => R1.invert(R0(p))); }
function mapOver(t) {
  const a = A;
  // frontière Guyane–Brésil
  if (t > a.km - 0.05 && t < a.b2 + 0.3 && BORDER.length > 1) {
    const al = fadeOut(t, a.b2, 0.3); const n = Math.max(2, Math.round(BORDER.length * easeOut(prog(t, a.km, 0.9))));
    m.save(); m.globalAlpha = al; m.beginPath(); BORDER.slice(0, n).forEach((v, i) => { const p = P(v); i ? m.lineTo(p[0], p[1]) : m.moveTo(p[0], p[1]); });
    m.lineCap = 'round'; m.lineJoin = 'round'; m.lineWidth = 16; m.strokeStyle = '#1b1300'; m.stroke(); m.lineWidth = 10; m.strokeStyle = '#FFE928'; m.shadowColor = '#FFE928'; m.shadowBlur = 18; m.stroke(); m.restore();
  }
  // zone OTAN + tropique
  if (t > a.otan4 - 0.1 && t < a.ue + 0.3) {
    const al = clamp((t - a.otan4 + 0.1) / 0.4) * fadeOut(t, a.ue, 0.3);
    m.save(); pathM(rectPoly(-140, 45, 23.44, 78)); m.globalAlpha = al * 0.22; m.fillStyle = '#3b7bff'; m.fill(); m.globalAlpha = al; m.lineWidth = 6; m.setLineDash([22, 14]); m.strokeStyle = '#7fb2ff'; m.stroke(); m.restore();
    m.save(); m.globalAlpha = al; m.beginPath(); for (let x = -180; x <= 180; x += 3) { const p = P([x, 23.44]); x === -180 ? m.moveTo(p[0], p[1]) : m.lineTo(p[0], p[1]); } m.setLineDash([10, 10]); m.lineWidth = 4; m.strokeStyle = '#FFE928'; m.stroke(); m.restore();
  }
  // 15 Frances posées sur le Brésil (vraie taille)
  if (t > a.x15 - 0.1 && t < a.der + 0.3 && FR_MAIN) {
    const al = fadeOut(t, a.der, 0.3); const c0 = [2.5, 46.6];
    SPOTS15.forEach((sp, k) => {
      const t0 = a.x15 + k * 0.08; if (t < t0) return; const s = popIn(t, t0, 0.25);
      const ring = moveShape(FR_MAIN[0], c0, sp); const g = { type: 'Polygon', coordinates: [ring] };
      m.save(); m.globalAlpha = al * Math.min(1, s); pathM(g); const fl = FL.fr; if (fl) flagFill(m, () => pathM(g), d3.geoPath(P).bounds(g), fl, 0.8, Math.max(0, 1 - (t - t0) / 0.3), 'stretch');
      pathM(g); m.lineWidth = 4; m.strokeStyle = '#fff'; m.shadowColor = '#000'; m.shadowBlur = 8; m.stroke(); m.restore();
    });
  }
}

// ---------- calque écran ----------
function noX(c, x, y, w, t, t0, t1) { if (t < t0 || t > t1 + 0.3) return; c.save(); c.globalAlpha = fadeOut(t, t1, 0.3); c.translate(x, y); c.lineWidth = 18; c.lineCap = 'round'; c.strokeStyle = '#e01b24'; const k = easeOut(prog(t, t0, 0.25)); c.beginPath(); c.moveTo(-w, -w); c.lineTo(-w + 2 * w * k, -w + 2 * w * k); c.stroke(); c.beginPath(); c.moveTo(w, -w); c.lineTo(w - 2 * w * k, -w + 2 * w * k); c.stroke(); c.restore(); }
function parchment(c, x, y, w, h, lines, t, t0, t1) {
  if (t < t0 || t > t1 + 0.3) return; const s = popIn(t, t0, 0.35) * fadeOut(t, t1, 0.3);
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(-0.04); c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 20; rr(c, -w / 2, -h / 2, w, h, 16); c.fillStyle = '#f3e2b8'; c.fill(); c.shadowColor = 'transparent'; c.lineWidth = 6; c.strokeStyle = '#8a6a2f'; c.stroke();
  lines.forEach(([s2, sz, col], i) => txt(c, s2, 0, -h / 2 + 70 + i * (sz + 22), { size: sz, color: col || '#3a2500', weight: 900, shadow: false }));
  c.restore();
}
function screenScene(c, t) {
  const a = A;
  // accroche
  if (t > a.qui && t < a.tf + 0.2) { const s = popIn(t, a.qui, 0.3) * fadeOut(t, a.tf - 0.1, 0.25); c.save(); c.translate(W / 2, 560); c.scale(s, s); sprite(c, 'qmark', 0, 150, 300, { shadow: false }); c.restore(); }
  if (t > a.tf - 0.1 && t < a.b1 + 0.3) {
    const al = fadeOut(t, a.b1, 0.3); c.save(); c.globalAlpha = al;
    waver(c, 'sol_fr', 230, 1440, 380, t, a.tf - 0.1, 0); tag(c, 'TEAM FRANCE', 230, 1010, { size: 50, bg: BLUE, border: '#fff', sc: popIn(t, a.tf, 0.3) });
    if (t > a.tb - 0.1) { soldier(c, 'sol_br_a', 850, 1440, 390, t, a.tb - 0.1, { ph: 1 }); tag(c, 'TEAM BRÉSIL', 850, 1010, { size: 50, bg: BRG, border: '#fff', sc: popIn(t, a.tb, 0.3) }); }
    if (t > a.contre) { c.save(); c.translate(540, 1200); const s = stampScale(t, a.contre); c.scale(s, s); c.shadowColor = '#ffd23a'; c.shadowBlur = 40; txt(c, 'VS', 0, 0, { size: 200, weight: 900, color: '#FFE928', stroke: '#3a2500', sw: 18, shadow: false }); c.restore(); }
    c.restore();
  }
  // frontière
  if (t > a.front - 0.05 && t < a.guy) tag(c, 'UNE FRONTIÈRE ?', W / 2, 470, { size: 70, bg: '#111', border: '#fff', sc: popIn(t, a.front, 0.3) * fadeOut(t, a.guy - 0.15, 0.15) });
  if (t > a.km - 0.1 && t < a.b2) {
    const al = fadeOut(t, a.b2 - 0.25, 0.25);
    if (t < a.longue) counter(c, 730, t, a.km - 0.1, a.km + 0.8, W / 2, 500, { size: 140, suf: ' KM', label: 'DE FRONTIÈRE', until: a.longue - 0.15 });
    if (t > a.longue - 0.05) tag(c, 'N°1 : LA PLUS LONGUE', W / 2, 470, { size: 60, bg: BLUE, border: '#fff', sc: stampScale(t, a.longue) * al });
    if (t > a.longue + 0.4) { const p = S(...P_.pont); c.save(); c.globalAlpha = al; ping(c, p.x, p.y, t, a.longue + 0.4, null, a.b2 - 0.25); sprite(c, 'pont', clamp(p.x, 280, 800), clamp(p.y + 420, 900, 1400), 300 * popIn(t, a.longue + 0.5, 0.35), { shadow: false }); tag(c, 'PONT DE L\'OYAPOCK', clamp(p.x, 280, 800), clamp(p.y + 460, 940, 1440), { size: 40, bg: '#111', border: '#fff', sc: popIn(t, a.longue + 0.7, 0.3) }); c.restore(); }
  }
  // Team Brésil
  if (t > a.b2 - 0.1 && t < a.traite) {
    const al = fadeOut(t, a.traite - 0.25, 0.25); c.save(); c.globalAlpha = al;
    if (t < a.armee) soldier(c, 'sol_br_a', 830, 1460, 400, t, a.b2 - 0.1); else { const pose = Math.floor(t / 0.35) % 2 ? 'sol_br_b' : 'sol_br_a'; sprite(c, t < a.armee + 0.7 ? 'sol_br_b' : pose, 830, 1460, 400); }
    if (t < a.n212) tag(c, 'TEAM BRÉSIL', 830, 1020, { size: 50, bg: BRG, border: '#fff', sc: popIn(t, a.b2, 0.3) * fadeOut(t, a.n212 - 0.15, 0.15) });
    const pr = S(...P_.rio); if (t > a.n212 + 0.2) sprite(c, 'pain_sucre', clamp(pr.x + 40, 200, 600), clamp(pr.y + 120, 700, 1400), 240 * popIn(t, a.n212 + 0.2, 0.35) * fadeOut(t, a.armee - 0.1, 0.2), { shadow: false });
    const pa = S(-62, -4); if (t > a.b2 + 0.2) sprite(c, 'amazonie', clamp(pa.x, 200, 700), clamp(pa.y + 100, 650, 1300), 220 * popIn(t, a.b2 + 0.2, 0.35) * fadeOut(t, a.armee - 0.1, 0.2), { shadow: false });
    if (t > a.b2 + 0.4) sprite(c, 'toucan', 600, 1480, 200 * popIn(t, a.b2 + 0.4, 0.3), { shadow: false, rot: 0.05 * Math.sin(t * 5) });
    c.restore();
    if (t > a.n212 - 0.1 && t < a.armee) counter(c, 212, t, a.n212 - 0.1, a.n212 + 0.7, W / 2, 500, { size: 140, suf: ' M', label: 'D\'HABITANTS', until: a.armee - 0.15 });
    if (t > a.armee - 0.05) tag(c, 'N°1 AMÉRIQUE LATINE', W / 2, 470, { size: 58, bg: BRG, border: '#fff', sc: stampScale(t, a.armee) * al });
    if (t > a.armee + 0.2) tag(c, 'ARMÉE', W / 2, 570, { size: 46, bg: '#111', border: '#fff', sc: popIn(t, a.armee + 0.2, 0.3) * al });
  }
  // traité de 1947
  parchment(c, W / 2, 610, 640, 300, [['TRAITÉ DE RIO', 58], ['1947', 92, '#b3261e']], t, a.traite, a.mais - 0.15);
  if (t > a.usa - 0.1 && t < a.b3) {
    const al = fadeOut(t, a.b3 - 0.25, 0.25); c.save(); c.globalAlpha = al;
    soldier(c, 'sol_br_a', 830, 1460, 380, t, a.traite - 0.1); soldier(c, 'sol_us_a', 560, 1470, 370, t, a.usa - 0.1, { ph: 2 });
    c.restore();
    if (t > a.mais - 0.05) tag(c, 'ÉTATS-UNIS = OTAN', W / 2, 470, { size: 62, bg: '#1d3a8a', border: '#fff', sc: popIn(t, a.otan, 0.3) * al });
    stampText(c, 'ALLIÉS DES DEUX', W / 2, 640, t, a.fr2 - 0.1, a.b3 - 0.15, { size: 70 });
  }
  // BRICS
  if (t > a.brics - 0.05 && t < a.b4) {
    const al = fadeOut(t, a.b4 - 0.25, 0.25);
    tag(c, 'BRICS', W / 2, 470, { size: 90, bg: '#7a3cc9', border: '#fff', sc: popIn(t, a.brics, 0.3) * fadeOut(t, a.alli - 0.15, 0.15) });
    stampText(c, 'PAS UNE ALLIANCE MILITAIRE', W / 2, 470, t, a.alli, a.b4 - 0.2, { size: 50 });
    if (t > a.alli - 0.1) { c.save(); c.globalAlpha = al; const s = popIn(t, a.alli - 0.1, 0.35); c.translate(W / 2, 1450); c.scale(s, s); sprite(c, 'diplomates', 0, 6 * Math.sin(t * 6), 330, { shadow: false }); c.restore(); }
    if (t > a.pers - 0.05) tag(c, '0 OBLIGATION', W / 2, 640, { size: 60, bg: '#111', border: '#fff', sc: popIn(t, a.pers, 0.3) * al });
  }
  // Team France : OTAN
  if (t > a.b4 - 0.1 && t < a.otan4) tag(c, 'TEAM FRANCE', W / 2, 470, { size: 76, bg: BLUE, border: '#fff', sc: popIn(t, a.b4, 0.3) * fadeOut(t, a.otan4 - 0.15, 0.15) });
  if (t > a.otan4 - 0.05 && t < a.ue) {
    const al = fadeOut(t, a.ue - 0.2, 0.2);
    tag(c, 'ZONE OTAN', W / 2, 470, { size: 70, bg: '#1d3a8a', border: '#fff', sc: popIn(t, a.otan4, 0.3) * fadeOut(t, a.sud - 0.15, 0.15) });
    if (t > a.sud - 0.4) { const p = S(...P_.cayenne); const dy = t < a.sud ? -700 * (1 - easeIn(prog(t, a.sud - 0.4, 0.4))) : 0; c.save(); c.globalAlpha = al; sprite(c, 'umbrella', clamp(p.x, 250, 830), clamp(p.y - 30, 650, 1300) + dy, 300, { shadow: false, rot: 0.05 * Math.sin(t * 4) }); c.restore(); }
    stampText(c, 'AMÉRIQUE DU SUD : PAS COUVERTE', W / 2, 470, t, a.sud + 0.1, a.ue - 0.15, { size: 44 });
  }
  // UE
  if (t > a.ue - 0.1 && t < a.b5) {
    const al = fadeOut(t, a.b5 - 0.25, 0.25); const s = popIn(t, a.ue - 0.1, 0.35);
    c.save(); c.globalAlpha = al; c.translate(W / 2, 640); c.scale(s, s); c.rotate(t * 0.4); sprite(c, 'eu', 0, 110, 220, { shadow: false }); c.restore();
    if (t > a.oui - 0.05 && t < a.guy4) tag(c, 'UNION EUROPÉENNE', W / 2, 470, { size: 62, bg: '#003399', border: '#FFCC00', sc: popIn(t, a.oui, 0.3) * fadeOut(t, a.guy4 - 0.1, 0.15) });
    if (t > a.guy4 - 0.05) { const p = S(-53.1, 4); ping(c, p.x, p.y, t, a.guy4 + 0.4, null, a.b5 - 0.25); }
    stampText(c, 'GUYANE = EUROPE', W / 2, 470, t, a.europe, a.b5 - 0.2, { size: 72, col: '#003399' });
    if (t > a.euro - 0.4) { const dy = t < a.euro ? -800 * (1 - easeIn(prog(t, a.euro - 0.4, 0.4))) : 0; c.save(); c.globalAlpha = al; c.translate(W / 2, 1420 + dy); c.rotate(0.1 * Math.sin(t * 5)); sprite(c, 'euro', 0, 0, 260, { shadow: false }); c.restore(); }
  }
  // Kourou
  if (t > a.kourou - 0.1 && t < a.b6) {
    const al = fadeOut(t, a.b6 - 0.25, 0.25); const p = S(...P_.kourou); ping(c, p.x, p.y, t, a.kourou, 'KOUROU', a.b6 - 0.25);
    if (t > a.base - 0.05) tag(c, 'PORT SPATIAL DE L\'EUROPE', W / 2, 470, { size: 52, bg: '#003399', border: '#FFCC00', sc: popIn(t, a.base, 0.3) * al });
    if (t > a.base) { const up = t > a.fusees ? 1400 * easeIn(prog(t, a.fusees, 1.6)) : 0; const shake = t > a.fusees - 0.1 && t < a.fusees + 0.6 ? 5 * Math.sin(t * 90) : 0; const x = clamp(p.x, 200, 880) + shake, y = clamp(p.y, 700, 1400) - up;
      c.save(); c.globalAlpha = al; if (t > a.fusees - 0.1) { const fl = 0.7 + 0.3 * Math.sin(t * 40); const g = c.createRadialGradient(x, y + 20, 5, x, y + 20, 120 * fl); g.addColorStop(0, 'rgba(255,240,180,1)'); g.addColorStop(0.4, 'rgba(255,140,20,.8)'); g.addColorStop(1, 'rgba(255,60,0,0)'); c.fillStyle = g; c.beginPath(); c.ellipse(x, y + 60, 60 * fl, 150 * fl, 0, 0, 7); c.fill(); }
      sprite(c, 'rocket', x, y, 360 * popIn(t, a.base, 0.35), { shadow: false }); c.restore(); }
  }
  // 15 fois plus grand
  if (t > a.x15 - 0.1 && t < a.der) {
    const al = fadeOut(t, a.der - 0.2, 0.25); const n = Math.min(15, Math.floor((t - a.x15) / 0.08) + 1);
    c.save(); c.globalAlpha = al; txt(c, '× ' + n, W / 2, 520, { size: 170, weight: 900, color: '#FFE928', stroke: '#1b1300', sw: 18 }); c.restore();
    if (t > a.hex - 0.05) tag(c, 'L\'HEXAGONE', W / 2, 660, { size: 56, bg: BLUE, border: '#fff', sc: stampScale(t, a.hex) * al });
    if (t > a.x15 + 0.2) { c.save(); c.globalAlpha = al; sprite(c, 'metre', 820, 1480, 220 * popIn(t, a.x15 + 0.2, 0.3), { shadow: false, rot: -0.1 + 0.05 * Math.sin(t * 4) }); c.restore(); }
  }
  // finale 1998
  if (t > a.finale - 0.1 && t < a.b7) {
    const al = fadeOut(t, a.b7 - 0.25, 0.25); const p = S(...P_.sdf); ping(c, p.x, p.y, t, a.finale, 'STADE DE FRANCE', a.y98 - 0.1);
    if (t < a.y98) tag(c, 'FINALE ?', W / 2, 470, { size: 80, bg: '#111', border: '#FFE928', sc: popIn(t, a.finale, 0.3) * fadeOut(t, a.y98 - 0.1, 0.15) });
    if (t > a.y98 - 0.05) tag(c, 'COUPE DU MONDE 1998', W / 2, 470, { size: 58, bg: '#111', border: '#FFE928', sc: stampScale(t, a.y98) * al });
    if (t > a.coupe - 0.1) { c.save(); c.globalAlpha = al; const s = popIn(t, a.coupe - 0.1, 0.35); c.translate(W / 2, 1000); c.scale(s, s); c.rotate(0.06 * Math.sin(t * 3)); sprite(c, 'trophy', 0, 0, 300, { shadow: false }); c.restore(); }
    if (t > a.trois - 0.1) { c.save(); c.globalAlpha = al; soldier(c, 'player', 260, 1480, 380, t, a.trois - 0.1); sprite(c, 'joueur_br', 830, 1480, 360 * popIn(t, a.trois, 0.3)); c.restore(); stampText(c, 'FRANCE 3 – 0 BRÉSIL', W / 2, 620, t, a.trois, a.b7 - 0.2, { size: 64, col: BLUE }); }
  }
  // fin
  if (t > a.tf7 - 0.2) {
    waver(c, 'sol_fr', 210, 1450, 360, t, a.tf7 - 0.2, 0); soldier(c, 'sol_br_a', 870, 1450, 370, t, a.tf7 - 0.1, { ph: 1 });
    if (t > a.tf7 - 0.05) tag(c, 'TEAM FRANCE', 210, 1030, { size: 46, bg: BLUE, border: '#fff', sc: popIn(t, a.tf7, 0.3) }); if (t > a.tb7 - 0.05) tag(c, 'TEAM BRÉSIL', 870, 1030, { size: 46, bg: BRG, border: '#fff', sc: popIn(t, a.tb7, 0.3) });
    { const s = popIn(t, a.tf7 - 0.1, 0.3) * (1 + 0.1 * Math.max(0, 1 - Math.abs(t - a.tb7) / 0.15)); c.save(); c.translate(W / 2, 880); c.scale(s, s); txt(c, 'QUI GAGNE ?', 0, 0, { size: 120, weight: 900, color: '#FFE928', stroke: '#1b1300', sw: 14 }); c.restore(); }
    if (t > a.abo - 0.15) tag(c, 'ABONNE-TOI', W / 2, 1230, { size: 70, bg: '#C00E1F', border: '#fff', sc: stampScale(t, a.abo) });
  }
}
