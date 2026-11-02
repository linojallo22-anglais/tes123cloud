// scene.js — Team France vs Team Belgique (scénario imaginaire, humour). Moteur : engine.js.
const BER = '#e8b400', BEK = '#1a1a1a';
const P_ = { paris: [2.35, 48.86], brux: [4.35, 50.85], otan: [4.42, 50.88], lux: [6.13, 49.61], ams: [4.9, 52.37], berlin: [13.4, 52.52], madrid: [-3.7, 40.42], rome: [12.5, 41.9], spb: [30.31, 59.94], wal: [4.85, 50.3] };
const CFG = {
  teamCol: { f: '#3b7bff', a: '#ffcc00', g: '#9aa0a6', h: '#c9ccd1' },
  trail: { jet_fr: '#F7EF08', jet_nl: '#ff8a00', jet_be: '#ffcc00', ball: '#ffffff' },
  NAME: { '250': 'FRANCE', '056': 'BELGIQUE', '528': 'PAYS-BAS', '442': 'LUXEMBOURG', '276': 'ALLEMAGNE', '724': 'ESPAGNE', '380': 'ITALIE' },
  ANCH: { '250': [2.4, 46.8], '056': [4.6, 50.6], '528': [5.6, 52.3], '442': [6.1, 49.75], '276': [10.4, 51.1], '724': [-3.7, 40.2], '380': [12.6, 42.9] },
  sides: [[-1, BLUE, 'TEAM FRANCE', 'f', 'fr'], [1, '#c8102e', 'TEAM BELGIQUE', 'a', 'be']],
  sprites: ['jet_fr', 'jet_be', 'jet_nl', 'sol_fr_a', 'sol_fr_b', 'sol_fr_conf', 'sol_be_a', 'sol_be_b', 'sol_nl', 'radar', 'hq', 'crown', 'player', 'ball', 'fries', 'chat', 'eu', 'scroll', 'qmark', 'shield_crack', 'trophy'],
  extraFlags: ['eu', 'fr', 'be', 'nl', 'lu'],
};

function setup() {
  const a = A;
  a.be0 = T(0, 'belgique'); a.fr0 = T(0, 'france'); a.qui = T(0, 'qui'); a.tf = T(0, 'team'); a.contre = T(0, 'contre'); a.tb = T(0, 'team', 2);
  a.b1 = beatStart(1); a.prob = T(1, 'probleme'); a.deux = T(1, 'deux'); a.otan1 = T(1, 'lotan'); a.siege = T(1, 'siege'); a.brux = T(1, 'bruxelles'); a.pays = T(1, 'pays'); a.acc = T(1, 'accueille'); a.arr = T(1, 'larreter');
  a.b2 = beatStart(2); a.nl = T(2, 'paysbas'); a.y2017 = T(2, 'deux'); a.surv = T(2, 'surveillent'); a.moitie = T(2, 'moitie'); a.lux = T(2, 'luxembourg'); a.protege = T(2, 'protege');
  a.b3 = beatStart(3); a.de = T(3, 'lallemagne'); a.es = T(3, 'lespagne'); a.it = T(3, 'litalie'); a.ue = T(3, 'lunion');
  a.b4 = beatStart(4); a.n30 = T(4, 'trente'); a.fr4 = T(4, 'france'); a.n200 = T(4, 'deux'); a.sept = T(4, 'sept');
  a.b5 = beatStart(5); a.bx5 = T(5, 'bruxelles'); a.wal = T(5, 'wallonie'); a.parlent = T(5, 'parlent'); a.qaq = T(5, 'qui');
  a.b6 = beatStart(6); a.att6 = T(6, 'attaque'); a.demi = T(6, 'demifinale'); a.y2018 = T(6, 'deux'); a.un = T(6, 'un'); a.pour = T(6, 'pour');
  a.b7 = beatStart(7); a.fou = T(7, 'fou'); a.y1831 = T(7, 'mille'); a.elu = T(7, 'elu'); a.roi = T(7, 'roi'); a.fils = T(7, 'fils');
  a.b8 = beatStart(8); a.tf8 = T(8, 'team'); a.tb8 = T(8, 'team', 2); a.comm = T(8, 'commentaire'); a.abo = T(8, 'abonnetoi'); a.fin = TE(8, 'abonnetoi');
  a.sb = a.tb + 0.35; DUR = a.fin + 0.6; a.big = [[a.b8 + 0.1, DUR + 1]];

  // ---- pays
  C('056', a.be0, 'a', { named: true }); C('250', a.fr0, 'f', { named: true }); SCORE.a.push([a.be0, 1]); SCORE.f.push([a.fr0, 1]);
  C('528', a.nl, 'a', { named: true }); SCORE.a.push([a.nl, 1]); C('442', a.lux, 'a', { named: true }); SCORE.a.push([a.lux, 1]);
  [['276', a.de], ['724', a.es], ['380', a.it]].forEach(([id, t]) => { C(id, t, 'f', { named: true }); SCORE.f.push([t, 1]); });
  const rest = WORLD.EU.filter(id => !['250', '056', '528', '442', '276', '724', '380'].includes(id)).sort((x, y) => d3.geoDistance(WORLD.cent[x], P_.paris) - d3.geoDistance(WORLD.cent[y], P_.paris));
  rest.forEach((id, i) => { const t = a.ue + 0.1 + i * 0.05; C(id, t, 'f'); SCORE.f.push([t, 1]); });

  // ---- vols
  LEGS.push({ jet: 'jet_nl', a: P_.ams, b: P_.brux, t0: a.surv - 0.4, t1: a.ciel2 = T(2, 'ciel') + 0.1, sMid: 5200, sEnd: 7000 });
  LEGS.push({ jet: 'jet_be', a: P_.brux, b: P_.lux, t0: a.protege - 0.5, t1: TE(2, 'ciel', 2) - 0.1, sMid: 6000, sEnd: 7600 });
  const L = (from, to, t0, t1, sMid, sEnd) => LEGS.push({ jet: 'jet_fr', a: P_[from], b: P_[to], t0, t1, sMid, sEnd });
  L('paris', 'berlin', a.b3 + 0.15, a.de, 1700, 2000); L('berlin', 'madrid', a.de + 0.1, a.es, 1000, 1700); L('madrid', 'rome', a.es + 0.1, a.it, 1200, 1700);
  LEGS.push({ jet: 'ball', a: P_.brux, b: P_.spb, t0: a.demi - 0.3, t1: a.y2018 + 0.1, sMid: 900, sEnd: 2600 });
  JETVIS = { jet_nl: [[a.surv - 0.6, a.lux - 0.1]], jet_be: [[a.protege - 0.7, a.b3 - 0.1]], jet_fr: [[a.b3 - 0.1, a.ue + 0.4]], ball: [[a.demi - 0.4, a.y2018 + 0.5]] };

  // ---- caméra
  buildCam([
    st(0, 0, 4.0, 49.5, 900, { drift: 0.06 }),
    st(a.be0 + 0.9, 0.9, 4.6, 50.3, 6000),
    st(a.fr0 + 0.8, 0.9, 3.0, 48.4, 2300),
    st(a.qui + 0.8, 0.8, 3.4, 48.0, 2000),
    st(a.tf + 0.5, 0.8, 2.6, 48.0, 2400),
    st(a.tb + 0.3, 0.8, 4.0, 49.4, 3000),
    st(a.prob + 0.4, 0.9, 6, 50, 1300, { drift: 0.04 }),
    st(a.otan1 + 0.3, 0.8, 4, 51, 900),
    st(a.brux + 0.1, 1.2, P_.otan[0], P_.otan[1] - 0.05, 30000, { drift: 0.03 }),
    st(a.acc + 0.2, 0.8, 4.4, 50.75, 18000),
    st(a.b2 + 0.4, 1.0, 4.8, 50.6, 5200, { drift: 0.04 }),
    st(a.nl + 0.3, 0.8, 5.0, 51.4, 4300),
    st(a.moitie + 0.2, 0.8, 4.6, 50.6, 6000),
    st(a.lux + 0.3, 0.8, 5.6, 50.0, 7800),
    st(a.b3 + 0.05, 0.6, 2.6, 48.6, 1900),
    st(a.ue + 0.4, 1.0, 10, 48, 620, { drift: 0.04 }),
    st(a.b4 + 0.3, 1.0, 3.6, 48.6, 2300, { drift: 0.04 }),
    st(a.fr4 + 0.2, 0.7, 2.8, 47.4, 2000),
    st(a.sept + 0.1, 0.7, 3.2, 48.2, 2500),
    st(a.b5 + 0.4, 1.0, 4.5, 50.35, 9000, { drift: 0.04 }),
    st(a.wal + 0.2, 0.7, 4.8, 50.2, 10500),
    st(a.qaq + 0.2, 0.7, 4.2, 50.0, 7000),
    st(a.att6 + 0.3, 0.8, 8, 51, 2200),
    st(a.y2018 + 0.9, 0.8, 30.3, 59.4, 3300),
    st(a.un + 0.4, 0.6, 30.3, 59.6, 4200),
    st(a.pour + 0.2, 0.7, 30.3, 59.5, 3600),
    st(a.b7 + 0.4, 1.2, 3.4, 49.6, 1500, { drift: 0.04 }),
    st(a.roi + 0.4, 1.0, 4.35, 50.75, 32000),
    st(a.fils + 0.2, 0.8, 3.3, 49.6, 3000),
    st(a.tf8 + 0.2, 1.0, 3.0, 48.6, 2200),
    st(a.tb8 + 0.2, 0.8, 4.2, 49.6, 2800),
    st(a.abo + 0.1, 0.8, 3.4, 49.0, 2300),
    st(a.fin + 0.5, 0.8, 3.4, 49.0, 2500, { drift: 0.04 }),
  ]);
  A.tilt = [[a.tf - 0.5, a.b1, 18], [a.b2 - 0.3, a.nl + 0.3, 14], [a.b4 - 0.3, a.sept, 14], [a.b7 - 0.3, a.elu, 14], [a.tf8 - 0.3, a.comm, 12]];

  // ---- sons et actions
  ev(0, 'whoosh'); ev(a.be0, 'scan'); ev(a.be0 + 0.05, 'pop'); act(a.be0, 'Belgique', 'drapeau'); ev(a.fr0 - 0.3, 'whoosh'); ev(a.fr0, 'scan'); ev(a.qui, 'boing'); ev(a.tf, 'pop'); ev(a.contre, 'stamp'); ev(a.tb, 'pop'); ev(a.sb, 'pop');
  act(a.tf, 'soldat français', 'agite le drapeau'); act(a.tb, 'soldat belge', 'pose');
  ev(a.prob, 'boing'); ev(a.otan1, 'shine'); act(a.otan1, 'bouclier OTAN', 'se fend'); ev(a.otan1 + 0.3, 'crumble'); ev(a.siege - 0.2, 'whoosh'); ev(a.brux, 'ping'); ev(a.brux + 0.15, 'fall'); ev(a.brux + 0.45, 'thud'); act(a.brux, 'siège OTAN', 'tombe'); ev(a.acc, 'boing'); ev(a.arr, 'stamp');
  ev(a.nl, 'scan'); ev(a.nl + 0.05, 'pop'); act(a.nl, 'soldat néerlandais', 'arrive'); ev(a.y2017, 'stamp'); ev(a.moitie, 'draw'); act(a.moitie, 'camembert', '50/50'); ev(a.lux, 'scan'); ev(a.lux + 0.05, 'pop'); ev(a.protege, 'scan'); act(a.protege, 'radar', 'tourne');
  for (const Lg of LEGS) { ev(Lg.t0, Lg.jet === 'ball' ? 'whoosh' : 'jet'); act(Lg.t0, Lg.jet, 'vole'); }
  for (const id of ['276', '724', '380']) { ev(CS[id][0].t, 'scan'); ev(CS[id][0].t + 0.05, 'pop'); }
  ev(a.ue, 'shine'); act(a.ue, 'drapeau UE', 'tourne'); for (const id in CS) for (const p of CS[id]) if (p.t > a.ue && !p.named) ev(p.t, 'tic');
  ev(a.b4 - 0.2, 'whoosh'); ev(a.n30, 'count'); act(a.n30, 'barre belge', 'monte'); ev(a.n200, 'count'); act(a.n200, 'barre française', 'monte'); ev(a.sept, 'impact');
  ev(a.b5 - 0.3, 'whoosh'); ev(a.bx5, 'ping'); ev(a.wal, 'ping'); ev(a.parlent, 'pop'); act(a.parlent, 'bulles', 'parlent'); ev(a.qaq, 'boing'); ev(a.qaq + 0.3, 'stamp'); act(a.qaq, 'soldat', 'perdu');
  ev(a.demi, 'cheer'); ev(a.y2018, 'stamp'); ev(a.un, 'impact'); act(a.un, 'score', '1-0'); ev(a.pour, 'cheer'); act(a.pour, 'joueur', 'saute');
  ev(a.b7 - 0.3, 'whoosh'); ev(a.fou, 'boing'); ev(a.y1831, 'photo'); act(a.y1831, 'parchemin', '1831'); ev(a.roi, 'fall'); ev(a.roi + 0.3, 'thud'); act(a.roi, 'couronne', 'tombe'); ev(a.fils, 'draw'); ev(a.fils + 0.3, 'stamp');
  ev(a.tf8 - 0.2, 'cheer'); ev(a.tf8, 'pop'); ev(a.tb8, 'pop'); ev(a.comm, 'pop'); ev(a.abo, 'pop'); ev(a.abo + 0.1, 'ding'); act(a.tf8, 'soldats', 'face à face');
  fillGaps();
  window.PREVIEW = [0.4, a.fr0 + 0.4, a.contre + 0.4, a.prob + 0.3, a.otan1 + 0.5, a.brux + 0.6, a.acc + 0.5, a.arr + 0.4, a.nl + 0.4, a.surv + 0.4, a.moitie + 0.4, a.lux + 0.4, a.protege + 0.5, a.de + 0.3, a.it + 0.3, a.ue + 0.8, a.n30 + 0.5, a.n200 + 0.5, a.sept + 0.3, a.bx5 + 0.3, a.parlent + 0.3, a.qaq + 0.5, a.att6 + 0.3, a.demi + 0.6, a.y2018 + 0.5, a.un + 0.4, a.pour + 0.4, a.fou + 0.3, a.y1831 + 0.4, a.roi + 0.5, a.fils + 0.6, a.tf8 + 0.4, a.abo + 0.4];
}
function fillGaps() { const ts = EVENTS.map(e => e[0]).sort((x, y) => x - y); for (let i = 1; i < ts.length; i++) for (let t = ts[i - 1] + 1.2; t < ts[i] - 0.3; t += 1.2) ev(t, 'tic'); }

// ---------- calque écran ----------
function shield(c, t, t0, t1) { if (t < t0 || t > t1 + 0.3) return; const s = popIn(t, t0, 0.35) * fadeOut(t, t1, 0.3); c.save(); c.translate(W / 2, 1210); c.scale(s, s); c.rotate(0.04 * Math.sin(t * 7)); sprite(c, 'shield_crack', 0, 150, 300, { shadow: false }); c.restore(); }
function bar(c, x, val, max, t, t0, col, label, img) { const h = 520 * val / max * easeOut(prog(t, t0, 0.8)); const y0 = 1420; c.save(); c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 16; rr(c, x - 110, y0 - h, 220, Math.max(1, h), 16); c.fillStyle = col; c.fill(); c.shadowColor = 'transparent'; c.lineWidth = 5; c.strokeStyle = '#fff'; c.stroke(); c.restore(); txt(c, fmtNum(val * easeOut(prog(t, t0, 0.8))), x, y0 - h - 50, { size: 64, weight: 900, color: '#FFE928', stroke: '#1b1300', sw: 10 }); if (img) { c.save(); c.beginPath(); c.arc(x, y0 + 60, 40, 0, 7); c.clip(); c.drawImage(img, x - 54, y0 + 20, 108, 80); c.restore(); c.beginPath(); c.arc(x, y0 + 60, 40, 0, 7); c.lineWidth = 5; c.strokeStyle = '#fff'; c.stroke(); } }
function screenScene(c, t) {
  const a = A;
  // accroche
  if (t > a.qui && t < a.tf + 0.2) { const s = popIn(t, a.qui, 0.3) * fadeOut(t, a.tf - 0.1, 0.25); c.save(); c.translate(W / 2, 560); c.scale(s, s); sprite(c, 'qmark', 0, 150, 300, { shadow: false }); c.restore(); }
  if (t > a.tf - 0.1 && t < a.b1 + 0.3) {
    const al = fadeOut(t, a.b1, 0.3); c.save(); c.globalAlpha = al;
    waver(c, 'sol_fr', 230, 1440, 380, t, a.tf - 0.1, 0); tag(c, 'TEAM FRANCE', 230, 1010, { size: 50, bg: BLUE, border: '#fff', sc: popIn(t, a.tf, 0.3) });
    if (t > a.tb - 0.1) { soldier(c, 'sol_be_a', 850, 1440, 390, t, a.tb - 0.1, { ph: 1 }); tag(c, 'TEAM BELGIQUE', 850, 1010, { size: 48, bg: '#c8102e', border: '#fff', sc: popIn(t, a.tb, 0.3) }); }
    if (t > a.contre) { c.save(); c.translate(540, 1200); const s = stampScale(t, a.contre); c.scale(s, s); c.shadowColor = '#ffd23a'; c.shadowBlur = 40; txt(c, 'VS', 0, 0, { size: 200, weight: 900, color: '#FFE928', stroke: '#3a2500', sw: 18, shadow: false }); c.restore(); }
    c.restore();
  }
  // OTAN
  if (t > a.prob - 0.05 && t < a.siege) tag(c, 'LE PROBLÈME', W / 2, 470, { size: 70, bg: '#e01b24', border: '#fff', sc: popIn(t, a.prob, 0.3) * fadeOut(t, a.otan1 - 0.15, 0.15) });
  if (t > a.otan1 - 0.05 && t < a.siege) tag(c, 'LES DEUX DANS L\'OTAN', W / 2, 470, { size: 58, bg: '#1d3a8a', border: '#fff', sc: popIn(t, a.otan1, 0.3) * fadeOut(t, a.siege - 0.15, 0.15) });
  shield(c, t, a.otan1 - 0.1, a.siege - 0.1);
  if (t > a.brux - 0.1 && t < a.b2) {
    const p = S(...P_.otan); const al = fadeOut(t, a.b2 - 0.25, 0.25); const dy = t < a.brux + 0.35 ? -900 * (1 - easeIn((t - a.brux + 0.1) / 0.45)) : 0;
    c.save(); c.globalAlpha = al; sprite(c, 'hq', clamp(p.x, 250, 830), clamp(p.y + 160, 600, 1400) + dy, 360, { shadow: false }); c.restore();
    tag(c, "SIÈGE DE L'OTAN", W / 2, 470, { size: 62, bg: '#1d3a8a', border: '#fff', sc: popIn(t, a.brux, 0.3) * fadeOut(t, a.acc - 0.15, 0.15) });
    if (t > a.acc - 0.1) { c.save(); c.globalAlpha = al; sprite(c, 'sol_be_b', 850, 1450, 380 * popIn(t, a.acc - 0.1, 0.3), { rot: 0.03 * Math.sin(t * 7) }); c.restore(); }
    stampText(c, "L'ATTAQUANT, C'EST CHEZ L'OTAN", W / 2, 470, t, a.arr, a.b2 - 0.15, { size: 50 });
  }
  if (t > a.brux - 0.05 && t < a.b2) { const p = S(...P_.brux); ping(c, p.x, p.y, t, a.brux, 'BRUXELLES', a.b2 - 0.25); }
  // Team Belgique
  if (t > a.b2 - 0.1 && t < a.b3) {
    const al = fadeOut(t, a.b3 - 0.25, 0.25); c.save(); c.globalAlpha = al;
    soldier(c, 'sol_be_a', 850, 1440, 380, t, a.b2 - 0.1); tag(c, 'TEAM BELGIQUE', 850, 1010, { size: 48, bg: '#c8102e', border: '#fff', sc: popIn(t, a.b2, 0.3) });
    if (t > a.nl - 0.1) soldier(c, 'sol_nl', 600, 1460, 360, t, a.nl - 0.1, { ph: 2 });
    if (t > a.protege - 0.2) { const p = S(...P_.lux); sprite(c, 'radar', clamp(p.x + 170, 220, 880), clamp(p.y + 120, 600, 1350), 220 * popIn(t, a.protege - 0.2, 0.35), { shadow: false, rot: 0.06 * Math.sin(t * 3) }); }
    c.restore();
    if (t > a.y2017 - 0.05 && t < a.moitie) tag(c, 'DEPUIS 2017', W / 2, 470, { size: 70, bg: '#ff8a00', border: '#fff', sc: stampScale(t, a.y2017) * fadeOut(t, a.moitie - 0.15, 0.15) });
    if (t > a.moitie - 0.1 && t < a.lux) { const s = popIn(t, a.moitie - 0.1, 0.35) * fadeOut(t, a.lux - 0.2, 0.2); const k = easeOut(prog(t, a.moitie, 0.6)); c.save(); c.translate(W / 2, 520); c.scale(s, s); c.beginPath(); c.arc(0, 0, 110, 0, 7); c.fillStyle = '#fff'; c.fill(); c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 104, -Math.PI / 2, -Math.PI / 2 + Math.PI * k); c.closePath(); c.fillStyle = '#ff8a00'; c.fill(); c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 104, Math.PI / 2, Math.PI / 2 + Math.PI * k); c.closePath(); c.fillStyle = '#ffcc00'; c.fill(); c.lineWidth = 6; c.strokeStyle = '#111'; c.beginPath(); c.arc(0, 0, 108, 0, 7); c.stroke(); txt(c, 'NL', 50, 0, { size: 44, weight: 900, color: '#fff', stroke: '#000', sw: 8 }); txt(c, 'BE', -50, 0, { size: 44, weight: 900, color: '#fff', stroke: '#000', sw: 8 }); c.restore(); tag(c, "1 AN SUR 2", W / 2, 690, { size: 46, bg: '#111', color: '#FFE928', border: '#FFE928', sc: s }); }
    if (t > a.protege - 0.05) tag(c, 'CIEL PROTÉGÉ PAR LA BELGIQUE', W / 2, 470, { size: 46, bg: '#c8102e', border: '#fff', sc: popIn(t, a.protege, 0.3) * fadeOut(t, a.b3 - 0.2, 0.2) });
  }
  // Team France : UE
  if (t > a.ue - 0.1 && t < a.b4) { const s = popIn(t, a.ue - 0.1, 0.35) * fadeOut(t, a.b4 - 0.25, 0.25); c.save(); c.translate(W / 2, 520); c.scale(s, s); c.rotate(t * 0.5); sprite(c, 'eu', 0, 90, 180, { shadow: false }); c.restore(); }
  // armées
  if (t > a.b4 - 0.1 && t < a.b5) {
    const al = fadeOut(t, a.b5 - 0.25, 0.25); c.save(); c.globalAlpha = al * popIn(t, a.b4 - 0.1, 0.3);
    rr(c, 120, 640, 840, 920, 30); c.fillStyle = 'rgba(10,20,40,.55)'; c.fill();
    txt(c, 'SOLDATS', W / 2, 700, { size: 52, weight: 900, color: '#fff', stroke: '#000', sw: 8 });
    if (t > a.n30 - 0.1) bar(c, 330, 30000, 200000, t, a.n30 - 0.1, '#ffcc00', 'BELGIQUE', FL.be);
    if (t > a.n200 - 0.1) bar(c, 750, 200000, 200000, t, a.n200 - 0.1, BLUE, 'FRANCE', FL.fr);
    c.restore();
    stampText(c, '× 7', W / 2, 1000, t, a.sept, a.b5 - 0.15, { size: 130, col: BLUE });
  }
  // langue
  if (t > a.bx5 - 0.1 && t < a.b6) {
    const al = fadeOut(t, a.b6 - 0.25, 0.25); const pB = S(...P_.brux), pW = S(...P_.wal);
    ping(c, pB.x, pB.y, t, a.bx5, 'BRUXELLES', a.b6 - 0.25); ping(c, pW.x, pW.y, t, a.wal, 'WALLONIE', a.b6 - 0.25);
    c.save(); c.globalAlpha = al; if (t > a.parlent - 0.1) sprite(c, 'chat', 320, 1450, 340 * popIn(t, a.parlent - 0.1, 0.35), { shadow: false });
    if (t > a.qaq - 0.1) { sprite(c, 'sol_fr_conf', 820, 1450, 380 * popIn(t, a.qaq - 0.1, 0.3), { rot: 0.03 * Math.sin(t * 6) }); }
    c.restore();
    if (t > a.parlent - 0.05 && t < a.qaq) tag(c, 'ON PARLE FRANÇAIS', W / 2, 470, { size: 62, bg: BLUE, border: '#fff', sc: popIn(t, a.parlent, 0.3) * fadeOut(t, a.qaq - 0.15, 0.15) });
    stampText(c, 'QUI ATTAQUE QUI ?', W / 2, 470, t, a.qaq + 0.3, a.b6 - 0.15, { size: 72 });
  }
  // foot 2018
  if (t > a.att6 - 0.1 && t < a.b7) {
    const al = fadeOut(t, a.b7 - 0.25, 0.25);
    if (t > a.demi - 0.05 && t < a.un) tag(c, 'DEMI-FINALE', W / 2, 470, { size: 70, bg: '#111', color: '#FFE928', border: '#FFE928', sc: popIn(t, a.demi, 0.3) * fadeOut(t, a.un - 0.15, 0.15) });
    if (t > a.y2018 - 0.05 && t < a.un) tag(c, 'COUPE DU MONDE 2018', W / 2, 580, { size: 50, bg: '#fff', color: '#111', border: '#111', sc: stampScale(t, a.y2018) * fadeOut(t, a.un - 0.15, 0.15) });
    if (t > a.y2018 + 0.2) { const p = S(...P_.spb); ping(c, p.x, p.y, t, a.y2018 + 0.2, 'SAINT-PÉTERSBOURG', a.b7 - 0.25); c.save(); c.globalAlpha = al; sprite(c, 'trophy', clamp(p.x - 250, 200, 880), clamp(p.y + 260, 600, 1300), 200 * popIn(t, a.y2018 + 0.3, 0.35), { shadow: false }); c.restore(); }
    if (t > a.un - 0.05) { const s = stampScale(t, a.un) * al; c.save(); c.translate(W / 2, 520); c.scale(s, s); rr(c, -250, -90, 500, 180, 30); c.fillStyle = '#fff'; c.fill(); c.lineWidth = 8; c.strokeStyle = '#111'; c.stroke(); for (const [x, f] of [[-170, FL.fr], [170, FL.be]]) { c.save(); c.beginPath(); c.arc(x, 0, 50, 0, 7); c.clip(); if (f) c.drawImage(f, x - 67, -50, 134, 100); c.restore(); } txt(c, '1 – 0', 0, 4, { size: 100, weight: 900, color: '#111', shadow: false }); c.restore(); }
    if (t > a.pour - 0.1) { c.save(); c.globalAlpha = al; const j = Math.abs(Math.sin((t - a.pour) * 5)) * 40; sprite(c, 'player', 820, 1460 - j, 420 * popIn(t, a.pour - 0.1, 0.3), { shadow: false }); c.restore(); }
  }
  // 1831
  if (t > a.fou - 0.1 && t < a.b8) {
    const al = fadeOut(t, a.b8 - 0.25, 0.25);
    if (t < a.y1831) tag(c, 'LE PLUS FOU', W / 2, 470, { size: 70, bg: '#e01b24', border: '#fff', sc: popIn(t, a.fou, 0.3) * fadeOut(t, a.y1831 - 0.1, 0.15) });
    if (t > a.y1831 - 0.1) { const s = popIn(t, a.y1831 - 0.1, 0.35); c.save(); c.globalAlpha = al; c.translate(280, 1240); c.scale(s, s); c.rotate(-0.06); sprite(c, 'scroll', 0, 130, 280, { shadow: false }); txt(c, '1831', 0, -30, { size: 84, font: 'Caveat', weight: 700, color: '#4a2a08', shadow: false }); txt(c, 'Roi des Belges', 0, 30, { size: 40, font: 'Caveat', weight: 700, color: '#4a2a08', shadow: false }); c.restore(); }
    if (t > a.roi - 0.1) { const p = S(...P_.brux); const dy = t < a.roi + 0.3 ? -800 * (1 - easeIn((t - a.roi + 0.1) / 0.4)) : 0; c.save(); c.globalAlpha = al; sprite(c, 'crown', clamp(p.x, 250, 830), clamp(p.y + 40, 500, 1300) + dy + 6 * Math.sin(t * 4), 220, { shadow: false }); c.restore(); }
    if (t > a.fils - 0.1) { const pP = S(...P_.paris), pB = S(...P_.brux); arrowTo(c, pP.x, pP.y, pB.x, pB.y + 40, t, a.fils - 0.1, a.b8 - 0.2, BLUE); }
    stampText(c, 'LE FILS DU ROI DE FRANCE', W / 2, 470, t, a.fils + 0.3, a.b8 - 0.15, { col: BLUE, size: 54 });
  }
  // fin
  if (t > a.tf8 - 0.2) {
    waver(c, 'sol_fr', 210, 1450, 360, t, a.tf8 - 0.2, 0); soldier(c, 'sol_be_a', 870, 1450, 370, t, a.tf8 - 0.1, { ph: 1 });
    if (t > a.tf8 - 0.05) tag(c, 'TEAM FRANCE', 210, 1030, { size: 46, bg: BLUE, border: '#fff', sc: popIn(t, a.tf8, 0.3) }); if (t > a.tb8 - 0.05) tag(c, 'TEAM BELGIQUE', 870, 1030, { size: 44, bg: '#c8102e', border: '#fff', sc: popIn(t, a.tb8, 0.3) });
    { const s = popIn(t, a.tf8 - 0.1, 0.3) * (1 + 0.1 * Math.max(0, 1 - Math.abs(t - a.tb8) / 0.15)); c.save(); c.translate(W / 2, 880); c.scale(s, s); txt(c, 'QUI GAGNE ?', 0, 0, { size: 120, weight: 900, color: '#FFE928', stroke: '#1b1300', sw: 14 }); c.restore(); }
    if (t > a.abo - 0.15) tag(c, 'ABONNE-TOI', W / 2, 1230, { size: 70, bg: '#C00E1F', border: '#fff', sc: stampScale(t, a.abo) });
  }
}
