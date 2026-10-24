// scene.js — Team France vs Team Monaco (scénario imaginaire, humour). Moteur : engine.js.
const MCR = '#ce1126';
const MC = [7.42, 43.74];
const CAPS = { paris: [2.35, 48.86], berlin: [13.4, 52.52], rome: [12.5, 41.9], madrid: [-3.7, 40.42], varsovie: [21.01, 52.23], bruxelles: [4.35, 50.85], stade: [2.36, 48.92] };
const CFG = {
  teamCol: { f: '#3b7bff', a: '#ff3b4e', g: '#9aa0a6', h: '#c9ccd1' },
  trail: { jet_fr: '#F7EF08' },
  NAME: { '250': 'FRANCE', '276': 'ALLEMAGNE', '380': 'ITALIE', '724': 'ESPAGNE', '616': 'POLOGNE', '056': 'BELGIQUE' },
  ANCH: { '250': [2.4, 46.8], '276': [10.4, 51.1], '380': [12.6, 42.9], '724': [-3.7, 40.2], '616': [19.3, 52.1], '056': [4.6, 50.6] },
  sides: [[-1, BLUE, 'TEAM FRANCE', 'f', 'fr'], [1, MCR, 'TEAM MONACO', 'a', 'mc']],
  sprites: ['jet_fr', 'sol_fr_a', 'sol_fr_b', 'guard_a', 'guard_b', 'f1', 'yacht', 'casino', 'sol_fr_conf', 'sol_fr_mirror', 'stadium', 'sneakers', 'roulette', 'coins', 'palace', 'eu', 'scroll', 'qmark', 'trophy', 'tape'],
  extraFlags: ['eu', 'fr', 'mc'],
  underScore(c, t) { if (t > A.allie - 0.1) { const s = popIn(t, A.allie, 0.35); c.save(); c.translate(228, 100); c.scale(s, s); rr(c, -120, -26, 240, 52, 14); c.fillStyle = BLUE; c.fill(); c.lineWidth = 4; c.strokeStyle = '#fff'; c.stroke(); txt(c, '+ LA FRANCE', 0, 2, { size: 30, weight: 900, shadow: false }); c.restore(); } },
};

function setup() {
  const a = A;
  a.mo0 = T(0, 'monaco'); a.fr0 = T(0, 'france'); a.qui = T(0, 'qui'); a.tf = T(0, 'team'); a.contre = T(0, 'contre'); a.tm = T(0, 'team', 2);
  a.b1 = beatStart(1); a.armee = T(1, 'armee'); a.pas = T(1, 'pas'); a.cara = T(1, 'environ'); a.f1 = T(1, 'formule'); a.yacht = T(1, 'yachts'); a.casino = T(1, 'casino');
  a.b2 = beatStart(2); a.de = T(2, 'lallemagne'); a.it = T(2, 'litalie'); a.es = T(2, 'lespagne'); a.pl = T(2, 'pologne'); a.be = T(2, 'belgique'); a.otan = T(2, 'lotan'); a.n32 = T(2, 'trentedeux'); a.ue = T(2, 'lunion');
  a.b3 = beatStart(3); a.prob = T(3, 'probleme'); a.y1918 = T(3, 'mille'); a.traites = T(3, 'traites'); a.defend = T(3, 'defend');
  a.b4 = beatStart(4); a.doit = T(4, 'doit'); a.defendre = T(4, 'defendre'); a.contre4 = T(4, 'contre');
  a.b5 = beatStart(5); a.km2 = T(5, 'kilometres'); a.bois = T(5, 'quatre'); a.paris = T(5, 'cinquante');
  a.b6 = beatStart(6); a.n38 = T(6, 'trentehuit'); a.stade = T(6, 'stade');
  a.b7 = beatStart(7); a.km6 = T(7, 'six'); a.pied = T(7, 'pied'); a.heure = T(7, 'heure');
  a.b8 = beatStart(8); a.n36 = T(8, 'trentesix'); a.seul = T(8, 'seul'); a.allie = T(8, 'cest');
  a.b9 = beatStart(9); a.tf9 = T(9, 'team'); a.tm9 = T(9, 'team', 2); a.comm = T(9, 'commentaire'); a.abo = T(9, 'abonnetoi'); a.fin = TE(9, 'abonnetoi');
  a.sb = a.tm + 0.35; DUR = a.fin + 0.6; a.big = [[a.b8, a.b9 - 0.2], [a.b9 + 0.2, DUR + 1]];

  // ---- pays (Monaco est trop petit : épingle ronde à son drapeau)
  C('250', a.fr0, 'f', { named: true }); SCORE.f.push([a.fr0, 1]); SCORE.a.push([a.mo0, 1]);
  const named = [['276', a.de], ['380', a.it], ['724', a.es], ['616', a.pl], ['056', a.be]];
  named.forEach(([id, t]) => { C(id, t, 'f', { named: true }); SCORE.f.push([t, 1]); });
  const rest = WORLD.NATO.filter(id => !['250', ...named.map(x => x[0])].includes(id)).sort((x, y) => d3.geoDistance(WORLD.cent[x], CAPS.paris) - d3.geoDistance(WORLD.cent[y], CAPS.paris));
  rest.forEach((id, i) => { const t = a.otan + 0.15 + i * 0.03; C(id, t, 'f'); SCORE.f.push([t, 1]); });
  ['040', '372', '470', '196'].forEach((id, i) => { const t = a.ue + 0.2 + i * 0.12; C(id, t, 'f'); SCORE.f.push([t, 1]); });

  // ---- avion
  const L = (from, to, t0, t1, sMid, sEnd) => LEGS.push({ jet: 'jet_fr', a: CAPS[from] || from, b: CAPS[to] || to, t0, t1, sMid, sEnd });
  L('paris', 'berlin', a.b2 + 0.1, a.de, 1500, 1700); L('berlin', 'rome', a.de + 0.08, a.it, 1200, 1500); L('rome', 'madrid', a.it + 0.08, a.es, 1100, 1500); L('madrid', 'varsovie', a.es + 0.08, a.pl, 850, 1300); L('varsovie', 'bruxelles', a.pl + 0.08, a.be, 1000, 1700);
  JETVIS = { jet_fr: [[a.b2 - 0.1, a.otan + 0.4]] };

  // ---- caméra
  buildCam([
    st(0, 0, 7.0, 45.5, 330, { drift: 0.05 }),
    st(1.05, 0.9, 7.3, 44.4, 7000),
    st(a.fr0 + 0.9, 0.9, 3.2, 46.2, 2300),
    st(a.qui + 1.1, 0.9, 4, 45.5, 1900),
    st(a.tf + 0.5, 0.8, 3, 46, 2200),
    st(a.tm + 0.3, 0.8, 5.5, 44.8, 2600),
    st(a.b1 + 0.6, 1.0, 7.35, 44.3, 7600, { drift: 0.04 }),
    st(a.pas + 0.2, 0.7, 7.25, 44.35, 6600),
    st(a.cara + 0.3, 0.8, 7.5, 44.4, 8600),
    st(a.f1 + 0.2, 0.7, 7.3, 44.2, 7200),
    st(a.yacht + 0.2, 0.6, 7.5, 44.25, 8000),
    st(a.casino + 0.2, 0.7, 7.45, 44.35, 8800),
    st(a.b2 - 0.05, 0.8, 2.35, 47.4, 2000),
    st(a.otan + 0.5, 1.0, -25, 48, 340, { drift: 0.04 }),
    st(a.n32 + 0.3, 0.7, -12, 47, 430),
    st(a.ue + 0.4, 0.9, 12, 47, 900),
    st(a.prob + 0.2, 1.0, 5, 45.6, 2500),
    st(a.y1918 + 0.3, 0.9, 4.5, 46.2, 2900),
    st(a.defend + 0.2, 0.8, 5.5, 45.4, 2400),
    st(a.b4 + 0.4, 0.9, 7.3, 44.4, 6000),
    st(a.defendre + 0.2, 0.8, 7.0, 44.6, 4800),
    st(a.contre4 + 0.2, 0.7, 6.5, 45.0, 3600),
    st(a.b5 + 0.3, 1.1, 2.35, 49.2, 8500, { drift: 0.04 }),
    st(a.km2 + 0.4, 0.7, 2.4, 49.3, 9600),
    st(a.paris + 0.2, 0.8, 2.35, 49.0, 7000),
    st(a.bois + 0.3, 0.7, 2.3, 49.1, 7600),
    st(a.b6 + 0.3, 0.9, 2.36, 49.25, 9000),
    st(a.stade + 0.2, 0.8, 2.4, 49.1, 7600),
    st(a.b7 + 0.3, 1.1, 7.42, 44.25, 8600, { drift: 0.04 }),
    st(a.pied + 0.2, 0.8, 7.3, 44.4, 7400),
    st(a.b8 + 0.3, 1.1, -8, 47, 340),
    st(a.seul + 0.2, 0.9, 3, 46, 900),
    st(a.allie + 0.2, 0.8, 5, 45, 1500),
    st(a.tf9 + 0.2, 1.0, 4.5, 45.5, 2000),
    st(a.tm9 + 0.2, 0.8, 6, 44.8, 2500),
    st(a.abo + 0.1, 0.8, 4.5, 45.5, 2100),
    st(a.fin + 0.5, 0.8, 4.5, 45.5, 2300, { drift: 0.04 }),
  ]);
  A.tilt = [[a.tf - 0.5, a.b1, 18], [a.b2 - 0.3, a.it, 14], [a.prob - 0.3, a.defend + 0.4, 14], [a.b7 - 0.3, a.heure, 14], [a.tf9 - 0.3, a.comm, 12]];

  // ---- sons et actions
  ev(0, 'whoosh'); ev(a.mo0, 'ping'); act(a.mo0, 'Monaco', 'épingle'); ev(a.fr0 - 0.3, 'whoosh'); ev(a.fr0, 'scan'); ev(a.fr0 + 0.05, 'pop'); ev(a.qui, 'boing'); ev(a.tf, 'pop'); ev(a.contre, 'stamp'); ev(a.tm, 'pop'); ev(a.sb, 'pop');
  act(a.tf, 'soldat français', 'agite le drapeau'); act(a.tm, 'garde monégasque', 'pose');
  for (const id in CS) for (const p of CS[id]) { if (p.t < a.b2) continue; ev(p.t, p.named ? 'scan' : 'tic'); if (p.named) ev(p.t + 0.05, 'pop'); }
  for (const Lg of LEGS) { ev(Lg.t0, 'jet'); act(Lg.t0, 'Rafale', 'vole'); }
  ev(a.b1 - 0.3, 'whoosh'); ev(a.b1, 'pop'); ev(a.pas, 'stamp'); act(a.pas, 'tampon', '0 armée'); ev(a.cara, 'pop'); act(a.cara, 'garde', 'salue'); ev(a.f1, 'engine'); act(a.f1, 'Formule 1', 'roule'); ev(a.yacht, 'wave'); act(a.yacht, 'yacht', 'navigue'); ev(a.casino, 'sparkle'); act(a.casino, 'casino', 'brille');
  ev(a.otan, 'shine'); ev(a.n32, 'count'); ev(a.ue, 'shine'); act(a.ue, 'drapeau UE', 'tourne'); ev(a.ue + 0.8, 'count');
  ev(a.prob - 0.2, 'whoosh'); ev(a.prob, 'boing'); ev(a.y1918, 'photo'); act(a.y1918, 'parchemin', '1918'); ev(a.defend, 'stamp'); act(a.defend, 'flèche', 'France → Monaco');
  ev(a.b4 - 0.3, 'whoosh'); ev(a.doit, 'pop'); act(a.doit, 'soldat français', 'perdu'); ev(a.defendre, 'boing'); ev(a.contre4, 'stamp'); act(a.contre4, 'soldats', 'se montrent du doigt');
  ev(a.b5 - 0.3, 'whoosh'); ev(a.km2, 'pop'); act(a.km2, 'carte des tailles', 'apparaît'); ev(a.bois, 'pop'); ev(a.paris, 'thud');
  ev(a.b6 - 0.3, 'whoosh'); ev(a.b6, 'pop'); act(a.b6, 'stade', 'apparaît'); ev(a.n38, 'count'); ev(a.stade, 'count');
  ev(a.b7 - 0.3, 'whoosh'); ev(a.km6, 'draw'); act(a.km6, 'frontière', 'cercle'); ev(a.pied, 'steps'); act(a.pied, 'baskets', 'marchent'); ev(a.heure, 'ding');
  ev(a.b8 - 0.2, 'whoosh'); ev(a.n36, 'count'); ev(a.seul, 'boing'); ev(a.allie, 'ding'); act(a.allie, 'score Monaco', '+ la France');
  ev(a.tf9 - 0.2, 'cheer'); ev(a.tf9, 'pop'); ev(a.tm9, 'pop'); ev(a.comm, 'pop'); ev(a.abo, 'pop'); ev(a.abo + 0.1, 'ding'); act(a.tf9, 'soldats', 'face à face');
  for (const x of [a.qui + 0.8, a.contre + 0.7, a.armee + 0.4, a.cara + 1.0, a.n32 + 0.6, a.ue + 1.4, a.traites + 0.4, a.defend + 0.7, a.b4 + 0.5, a.contre4 + 0.6, a.km2 + 0.6, a.paris + 0.6, a.n38 + 0.6, a.stade + 0.6, a.km6 + 0.6, a.heure + 0.5, a.n36 + 0.6, a.allie + 0.6, a.comm + 0.5]) ev(x, 'tic');
  window.PREVIEW = [0.6, a.fr0 + 0.4, a.qui + 0.4, a.contre + 0.4, a.b1 + 0.6, a.pas + 0.3, a.cara + 0.6, a.f1 + 0.4, a.yacht + 0.4, a.casino + 0.4, a.de + 0.3, a.be + 0.3, a.otan + 0.6, a.n32 + 0.3, a.ue + 0.6, a.prob + 0.4, a.y1918 + 0.4, a.defend + 0.4, a.doit + 0.3, a.defendre + 0.4, a.contre4 + 0.4, a.km2 + 0.4, a.bois + 0.4, a.paris + 0.4, a.n38 + 0.4, a.stade + 0.4, a.km6 + 0.4, a.pied + 0.5, a.n36 + 0.4, a.allie + 0.4, a.tf9 + 0.4, a.tm9 + 0.4, a.abo + 0.4];
}

// ---------- calque écran ----------
function monacoPin(c, t, t0, big = 1) {
  const p = S(...MC); const s = popIn(t, t0, 0.35) * big; const wave = Math.max(0, (t - t0) % 0.9) / 0.9;
  c.save(); c.translate(p.x, p.y);
  c.beginPath(); c.arc(0, 0, 40 + 80 * wave, 0, 7); c.lineWidth = 6; c.strokeStyle = `rgba(255,255,255,${0.85 * (1 - wave)})`; c.stroke();
  c.scale(s, s); c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 16; c.beginPath(); c.arc(0, 0, 46, 0, 7); c.fillStyle = '#fff'; c.fill(); c.shadowColor = 'transparent';
  c.save(); c.beginPath(); c.arc(0, 0, 40, 0, 7); c.clip(); if (FL.mc) c.drawImage(FL.mc, -54, -40, 108, 80); c.restore();
  txt(c, 'MONACO', 0, 82, { size: 50, weight: 900, color: '#fff', stroke: '#000', sw: 10 }); c.restore();
}
function sizeCard(c, t) {
  const a = A; if (t < a.km2 - 0.15 || t > a.b6 + 0.3) return; const al = fadeOut(t, a.b6, 0.3); const s = popIn(t, a.km2 - 0.15, 0.35);
  c.save(); c.globalAlpha = al; c.translate(W / 2, 1000); c.scale(s, s);
  rr(c, -420, -470, 840, 640, 30); c.fillStyle = 'rgba(255,255,255,.94)'; c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 30; c.fill(); c.shadowColor = 'transparent';
  txt(c, 'À LA MÊME ÉCHELLE', 0, -420, { size: 40, weight: 900, color: '#111', shadow: false });
  const k = 44; // px par √km²
  const rP = Math.sqrt(105 / Math.PI) * k, rB = Math.sqrt(8.46 / Math.PI) * k, rM = Math.sqrt(2.02 / Math.PI) * k;
  const cx = 110, cy = -150;
  if (t > a.paris - 0.1) { const g = easeOut(prog(t, a.paris - 0.1, 0.4)); c.beginPath(); c.arc(cx, cy, rP * g, 0, 7); c.fillStyle = 'rgba(31,93,255,.18)'; c.fill(); c.lineWidth = 5; c.strokeStyle = BLUE; c.stroke(); if (g > 0.7) txt(c, 'PARIS · 105 km²', cx, cy + rP + 34, { size: 34, weight: 900, color: BLUE, shadow: false }); }
  if (t > a.bois - 0.1) { const g = easeOut(prog(t, a.bois - 0.1, 0.35)); c.beginPath(); c.arc(-280, 0, rB * g, 0, 7); c.fillStyle = '#3f9d4a'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#1f5f2a'; c.stroke(); if (g > 0.7) { txt(c, 'BOIS DE', -280, rB + 30, { size: 28, weight: 900, color: '#1f5f2a', shadow: false }); txt(c, 'BOULOGNE', -280, rB + 60, { size: 28, weight: 900, color: '#1f5f2a', shadow: false }); } }
  { const g = popIn(t, a.km2 - 0.1, 0.35); const x = -280, y = -280; c.save(); c.beginPath(); c.arc(x, y, Math.max(1, rM * g), 0, 7); c.clip(); if (FL.mc) c.drawImage(FL.mc, x - rM, y - rM, rM * 2, rM * 2); c.restore(); c.beginPath(); c.arc(x, y, rM * g, 0, 7); c.lineWidth = 3; c.strokeStyle = MCR; c.stroke(); txt(c, 'MONACO · 2 km²', x + 10, y + rM + 32, { size: 30, weight: 900, color: MCR, shadow: false }); }
  if (t > a.bois) tag(c, '× 4', -280, -150, { size: 46, bg: '#3f9d4a', border: '#fff', sc: stampScale(t, a.bois) });
  if (t > a.paris + 0.2) tag(c, '× 50', cx, cy, { size: 70, bg: BLUE, border: '#fff', sc: stampScale(t, a.paris + 0.2) });
  c.restore();
}
function screenScene(c, t) {
  const a = A;
  // épingle Monaco
  if ((t > a.mo0 && t < a.b2 + 0.1) || (t > a.b3 && t < a.b5 + 0.1) || (t > a.b7 && t < a.b8 + 0.1)) { c.save(); c.globalAlpha = Math.min(1, fadeOut(t, t < a.b2 + 0.2 ? a.b2 - 0.2 : t < a.b5 + 0.2 ? a.b5 - 0.2 : t < a.b8 + 0.2 ? a.b8 - 0.2 : 1e9, 0.25)); monacoPin(c, t, t < a.b3 ? a.mo0 : t < a.b7 ? a.b3 : a.b7); c.restore(); }
  // accroche
  if (t > a.qui && t < a.tf + 0.2) { const s = popIn(t, a.qui, 0.3) * fadeOut(t, a.tf - 0.1, 0.25); c.save(); c.translate(W / 2, 560); c.scale(s, s); sprite(c, 'qmark', 0, 150, 300, { shadow: false }); c.restore(); }
  if (t > a.tf - 0.1 && t < a.b1 + 0.3) {
    const al = fadeOut(t, a.b1, 0.3); c.save(); c.globalAlpha = al;
    waver(c, 'sol_fr', 230, 1440, 380, t, a.tf - 0.1, 0); tag(c, 'TEAM FRANCE', 230, 1010, { size: 50, bg: BLUE, border: '#fff', sc: popIn(t, a.tf, 0.3) });
    if (t > a.tm - 0.1) { soldier(c, 'guard_a', 850, 1440, 390, t, a.tm - 0.1, { ph: 1 }); tag(c, 'TEAM MONACO', 850, 1010, { size: 50, bg: MCR, border: '#fff', sc: popIn(t, a.tm, 0.3) }); }
    if (t > a.contre) { c.save(); c.translate(540, 1200); const s = stampScale(t, a.contre); c.scale(s, s); c.shadowColor = '#ffd23a'; c.shadowBlur = 40; txt(c, 'VS', 0, 0, { size: 200, weight: 900, color: '#FFE928', stroke: '#3a2500', sw: 18, shadow: false }); c.restore(); }
    c.restore();
  }
  // Team Monaco
  if (t > a.b1 - 0.1 && t < a.b2) {
    const al = fadeOut(t, a.b2 - 0.25, 0.25); c.save(); c.globalAlpha = al;
    if (t < a.cara) { soldier(c, 'guard_a', 850, 1440, 390, t, a.b1 - 0.1); tag(c, 'TEAM MONACO', 850, 1010, { size: 50, bg: MCR, border: '#fff', sc: popIn(t, a.b1, 0.3) }); }
    else sprite(c, 'guard_b', 850, 1440, 400 * popIn(t, a.cara, 0.3), { rot: 0.02 * Math.sin(t * 8) });
    if (t > a.f1 - 0.1) { const u = prog(t, a.f1 - 0.1, 1.6); sprite(c, 'f1', lerp(-160, 1240, u), 760, 270, { shadow: false, rot: Math.PI / 2 }); }
    if (t > a.yacht - 0.1) { const u = easeOut(prog(t, a.yacht - 0.1, 1.2)); sprite(c, 'yacht', lerp(1180, 760, u), 1120, 200, { shadow: false, rot: -Math.PI / 2 }); }
    if (t > a.casino - 0.1) { const s = popIn(t, a.casino - 0.1, 0.35); sprite(c, 'casino', 330, 1450, 300 * s, { shadow: false }); sprite(c, 'roulette', 140, 1300, 140 * popIn(t, a.casino + 0.15, 0.3), { shadow: false }); sprite(c, 'coins', 530, 1330, 130 * popIn(t, a.casino + 0.3, 0.3), { shadow: false }); }
    c.restore();
  }
  stampText(c, 'ARMÉE : 0', W / 2, 560, t, a.pas, a.cara - 0.1, { size: 100 });
  if (t > a.cara - 0.05 && t < a.f1) counter(c, 120, t, a.cara, a.cara + 0.7, W / 2, 560, { size: 130, label: 'CARABINIERS', until: a.f1 - 0.2 });
  // Team France
  if (t > a.otan - 0.05 && t < a.b3) tag(c, 'OTAN', W / 2, 470, { size: 70, bg: '#1d3a8a', border: '#fff', sc: popIn(t, a.otan, 0.3) * fadeOut(t, a.ue - 0.2, 0.2) });
  if (t > a.n32 - 0.1 && t < a.ue) counter(c, 32, t, a.n32 - 0.1, a.n32 + 0.4, W / 2, 640, { size: 130, label: 'PAYS', until: a.ue - 0.25 });
  if (t > a.ue - 0.1 && t < a.b3) { const s = popIn(t, a.ue - 0.1, 0.35) * fadeOut(t, a.b3 - 0.25, 0.25); c.save(); c.translate(W / 2, 520); c.scale(s, s); c.rotate(t * 0.5); sprite(c, 'eu', 0, 90, 180, { shadow: false }); c.restore(); if (t > a.ue + 0.7) counter(c, 36, t, a.ue + 0.7, a.ue + 1.1, W / 2, 1180, { size: 130, label: 'PAYS', until: a.b3 - 0.25 }); }
  // le traité
  if (t > a.y1918 - 0.1 && t < a.b4) { const al = fadeOut(t, a.b4 - 0.25, 0.25); const s = popIn(t, a.y1918 - 0.1, 0.35); c.save(); c.globalAlpha = al; c.translate(300, 1220); c.scale(s, s); c.rotate(-0.06); sprite(c, 'scroll', 0, 130, 260, { shadow: false }); txt(c, '1918', 0, -20, { size: 80, font: 'Caveat', weight: 700, color: '#4a2a08', shadow: false }); txt(c, 'TRAITÉ', 0, 40, { size: 44, font: 'Caveat', weight: 700, color: '#4a2a08', shadow: false }); c.restore();
    if (t > a.defend - 0.1) { const pP = S(...CAPS.paris), pM = S(...MC); arrowTo(c, pP.x, pP.y, pM.x, pM.y - 50, t, a.defend - 0.1, a.b4 - 0.2, BLUE); } }
  stampText(c, 'LA FRANCE DÉFEND MONACO', W / 2, 520, t, a.defend, a.b4 - 0.15, { col: BLUE, size: 56 });
  // France contre France
  if (t > a.doit - 0.1 && t < a.b5) {
    const al = fadeOut(t, a.b5 - 0.25, 0.25); c.save(); c.globalAlpha = al;
    if (t < a.contre4) sprite(c, 'sol_fr_conf', 820, 1440, 400 * popIn(t, a.doit - 0.1, 0.3), { rot: 0.03 * Math.sin(t * 5) });
    else { sprite(c, 'sol_fr_mirror', W / 2, 1450, 420 * popIn(t, a.contre4 - 0.05, 0.3), { rot: 0.02 * Math.sin(t * 6) }); }
    c.restore();
  }
  stampText(c, 'FRANCE vs FRANCE ?!', W / 2, 560, t, a.contre4, a.b5 - 0.15, { size: 80 });
  // tailles
  sizeCard(c, t);
  // habitants
  if (t > a.b6 - 0.1 && t < a.b7) {
    const al = fadeOut(t, a.b7 - 0.25, 0.25); const p = S(...CAPS.stade); c.save(); c.globalAlpha = al; sprite(c, 'stadium', clamp(p.x, 250, 830), clamp(p.y, 500, 1100) + 120, 280 * popIn(t, a.b6 - 0.1, 0.35), { shadow: false }); c.restore();
    if (t > a.n38 - 0.1) counter(c, 38000, t, a.n38 - 0.1, a.n38 + 0.6, W / 2, 470, { size: 120, label: 'HABITANTS À MONACO', until: a.b7 - 0.25, color: '#ff5a6e' });
    if (t > a.stade - 0.1) counter(c, 80000, t, a.stade - 0.1, a.stade + 0.5, W / 2, 1230, { size: 110, label: 'PLACES AU STADE DE FRANCE', until: a.b7 - 0.25 });
  }
  // frontière
  if (t > a.km6 - 0.1 && t < a.b8) {
    const al = fadeOut(t, a.b8 - 0.25, 0.25); const p = S(...MC); const k = easeOut(prog(t, a.km6 - 0.1, 0.8));
    c.save(); c.globalAlpha = al; c.setLineDash([22, 14]); c.lineDashOffset = -t * 50; c.lineWidth = 9; c.strokeStyle = '#FFE928'; c.shadowColor = '#FFE928'; c.shadowBlur = 18; c.beginPath(); c.arc(p.x, p.y, 150, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * k); c.stroke(); c.restore();
    tag(c, '6 KM', W / 2, 470, { size: 80, bg: '#FFE928', color: '#111', border: '#111', sc: popIn(t, a.km6, 0.3) * al });
    if (t > a.pied - 0.1) { const s = popIn(t, a.pied - 0.1, 0.35); c.save(); c.globalAlpha = al; c.translate(W / 2, 1300); c.scale(s, s); sprite(c, 'sneakers', 0, 0, 220, { shadow: false, rot: 0.06 * Math.sin(t * 9) }); c.restore(); tag(c, '≈ 1 H', 820, 1150, { size: 60, bg: '#111', color: '#FFE928', border: '#FFE928', sc: stampScale(t, a.heure) * al }); }
  }
  // résultat
  if (t > a.seul - 0.1 && t < a.b9) { const al = fadeOut(t, a.b9 - 0.25, 0.25); c.save(); c.globalAlpha = al; sprite(c, 'guard_b', 820, 1450, 400 * popIn(t, a.seul - 0.1, 0.3), { rot: 0.03 * Math.sin(t * 6) }); if (t > a.allie - 0.1) sprite(c, 'sol_fr_conf', 260, 1450, 380 * popIn(t, a.allie - 0.1, 0.3)); c.restore(); }
  // fin
  if (t > a.tf9 - 0.2) {
    waver(c, 'sol_fr', 210, 1450, 360, t, a.tf9 - 0.2, 0); soldier(c, 'guard_a', 870, 1450, 370, t, a.tf9 - 0.1, { ph: 1 });
    if (t > a.tf9 - 0.05) tag(c, 'TEAM FRANCE', 210, 1030, { size: 46, bg: BLUE, border: '#fff', sc: popIn(t, a.tf9, 0.3) }); if (t > a.tm9 - 0.05) tag(c, 'TEAM MONACO', 870, 1030, { size: 46, bg: MCR, border: '#fff', sc: popIn(t, a.tm9, 0.3) });
    { const s = popIn(t, a.tf9 - 0.1, 0.3) * (1 + 0.1 * Math.max(0, 1 - Math.abs(t - a.tm9) / 0.15)); c.save(); c.translate(W / 2, 880); c.scale(s, s); txt(c, 'QUI GAGNE ?', 0, 0, { size: 120, weight: 900, color: '#FFE928', stroke: '#1b1300', sw: 14 }); c.restore(); }
    if (t > a.abo - 0.15) tag(c, 'ABONNE-TOI', W / 2, 1230, { size: 70, bg: '#C00E1F', border: '#fff', sc: stampScale(t, a.abo) });
  }
}
