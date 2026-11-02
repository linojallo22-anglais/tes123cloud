// scene.js — Team France vs Team Suisse (scénario imaginaire, humour). Moteur : engine.js.
const CHR = '#d52b1e';
const P_ = { paris: [2.35, 48.86], berne: [7.45, 46.95], geneve: [6.14, 46.2], annemasse: [6.24, 46.19], vaduz: [9.52, 47.14], vatican: [12.45, 41.9], italie: [12.2, 43.4], berlin: [13.4, 52.52] };
const CFG = {
  teamCol: { f: '#3b7bff', a: '#ff3b4e', g: '#9aa0a6', h: '#c9ccd1' },
  trail: { jet_fr: '#F7EF08', jet_ch: '#ff5a5a', airliner: '#ffffff' },
  NAME: { '250': 'FRANCE', '756': 'SUISSE', '438': 'LIECHTENSTEIN', '336': 'VATICAN' },
  ANCH: { '250': [2.4, 46.8], '756': [8.2, 46.8], '438': [9.55, 47.15], '336': [12.45, 41.9] },
  sides: [[-1, BLUE, 'TEAM FRANCE', 'f', 'fr'], [1, CHR, 'TEAM SUISSE', 'a', 'ch']],
  sprites: ['jet_fr', 'jet_ch', 'airliner', 'sol_fr_a', 'sol_fr_b', 'sol_fr_conf', 'sol_ch_a', 'sol_ch_b', 'chalet', 'bunker', 'clock_sleep', 'garde', 'castle', 'commuters', 'knife', 'cheese', 'eu', 'scroll', 'qmark', 'shield_crack'],
  extraFlags: ['eu', 'fr', 'ch', 'li', 'va'],
  underScore(c, t) { if (t > A.zero - 0.1 && t < A.b5) { const s = popIn(t, A.zero, 0.35) * fadeOut(t, A.b5 - 0.2, 0.2); c.save(); c.translate(228, 100); c.scale(s, s); rr(c, -120, -26, 240, 52, 14); c.fillStyle = '#111'; c.fill(); c.lineWidth = 4; c.strokeStyle = '#fff'; c.stroke(); txt(c, '0 ALLIÉ', 0, 2, { size: 30, weight: 900, shadow: false }); c.restore(); } },
};
let BUNK = [];

function setup() {
  const a = A;
  a.ch0 = T(0, 'suisse'); a.fr0 = T(0, 'france'); a.qui = T(0, 'qui'); a.tf = T(0, 'team'); a.contre = T(0, 'contre'); a.tc = T(0, 'team', 2);
  a.b1 = beatStart(1); a.otan1 = T(1, 'lotan'); a.pas = T(1, 'pas'); a.ue1 = T(1, 'lunion'); a.non = T(1, 'non'); a.neutre = T(1, 'neutre'); a.y1815 = T(1, 'mille'); a.zero = T(1, 'zero');
  a.b2 = beatStart(2); a.lie = T(2, 'liechtenstein'); a.plus = T(2, 'plus'); a.y1868 = T(2, 'mille'); a.garde = T(2, 'garde'); a.pape = T(2, 'pape'); a.vat = T(2, 'vatican');
  a.b3 = beatStart(3); a.att = T(3, 'attention'); a.n147 = T(3, 'cent'); a.fusil = T(3, 'fusil'); a.maison = T(3, 'maison'); a.n370 = T(3, 'trois'); a.bunk = T(3, 'bunkers'); a.place = T(3, 'place'); a.hab = T(3, 'habitant');
  a.b4 = beatStart(4); a.ciel = T(4, 'ciel'); a.y2014 = T(4, 'deux'); a.bureau = T(4, 'heures'); a.avion = T(4, 'avion'); a.geneve = T(4, 'geneve'); a.escorte = T(4, 'escorte'); a.fr4 = T(4, 'francais');
  a.b5 = beatStart(5); a.otan5 = T(5, 'lotan'); a.n32 = T(5, 'trentedeux'); a.ue5 = T(5, 'lunion');
  a.b6 = beatStart(6); a.prob = T(6, 'probleme'); a.jour = T(6, 'chaque'); a.n239 = T(6, 'deux'); a.front = T(6, 'frontiere'); a.att6 = T(6, 'attaquerait'); a.sal = T(6, 'salaries');
  a.b7 = beatStart(7); a.y1815b = T(7, 'mille'); a.signe = T(7, 'signe'); a.garantit = T(7, 'garantit'); a.neutra = T(7, 'neutralite');
  a.b8 = beatStart(8); a.tf8 = T(8, 'team'); a.tc8 = T(8, 'team', 2); a.comm = T(8, 'commentaire'); a.abo = T(8, 'abonnetoi'); a.fin = TE(8, 'abonnetoi');
  a.sb = a.tc + 0.35; DUR = a.fin + 0.6; a.big = [[a.b8 + 0.1, DUR + 1]];

  // ---- pays
  C('756', a.ch0, 'a', { named: true }); C('250', a.fr0, 'f', { named: true }); SCORE.a.push([a.ch0, 1]); SCORE.f.push([a.fr0, 1]);
  C('438', a.lie, 'g', { named: true });
  const rest = WORLD.NATO.filter(id => id !== '250').sort((x, y) => d3.geoDistance(WORLD.cent[x], P_.paris) - d3.geoDistance(WORLD.cent[y], P_.paris));
  rest.forEach((id, i) => { const t = a.otan5 + 0.1 + i * 0.045; C(id, t, 'f'); SCORE.f.push([t, 1]); });
  ['040', '372', '470', '196'].forEach((id, i) => { const t = a.ue5 + 0.2 + i * 0.12; C(id, t, 'f'); SCORE.f.push([t, 1]); });

  // ---- vols : jet suisse vers le Vatican, avion détourné escorté vers Genève
  LEGS.push({ jet: 'jet_ch', a: P_.berne, b: P_.vatican, t0: a.garde - 0.1, t1: a.pape + 0.1, sMid: 2600, sEnd: 6500 });
  LEGS.push({ jet: 'airliner', a: P_.italie, b: P_.geneve, t0: a.avion - 0.1, t1: a.geneve + 0.25, sMid: 3300, sEnd: 6800 });
  JETVIS = { jet_ch: [[a.garde - 0.4, a.b3 - 0.1]], airliner: [[a.avion - 0.35, a.b5 - 0.15]] };

  // bunkers : points dans la Suisse
  { let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; const g = geomOf('756'); while (BUNK.length < 16) { const p = [6.1 + r() * 4.3, 45.9 + r() * 1.8]; if (d3.geoContains(g, p)) BUNK.push(p); } }

  // ---- caméra
  buildCam([
    st(0, 0, 8.2, 46.6, 900, { drift: 0.06 }),
    st(a.ch0 + 0.9, 0.9, 8.1, 46.3, 5200),
    st(a.fr0 + 0.8, 0.9, 4.6, 46.4, 2300),
    st(a.qui + 0.8, 0.8, 5.2, 46.0, 2000),
    st(a.tf + 0.5, 0.8, 3.6, 46.2, 2400),
    st(a.tc + 0.3, 0.8, 7.0, 45.8, 3000),
    st(a.b1 + 0.6, 1.0, 8.2, 46.2, 7600, { drift: 0.04 }),
    st(a.otan1 + 0.3, 0.9, 9, 48, 1100),
    st(a.ue1 + 0.3, 0.8, 10, 47, 1500),
    st(a.neutre + 0.2, 0.9, 8.2, 46.3, 6800),
    st(a.zero + 0.1, 0.6, 8.2, 46.4, 8400),
    st(a.lie + 0.25, 1.1, 9.55, 46.9, 26000, { drift: 0.03 }),
    st(a.y1868 + 0.3, 0.7, 9.5, 46.95, 21000),
    st(a.vat + 0.5, 0.7, 12.45, 41.75, 9000),
    st(a.b3 + 0.4, 1.0, 8.2, 46.2, 6200, { drift: 0.04 }),
    st(a.n147 + 0.3, 0.7, 8.1, 46.3, 7200),
    st(a.fusil + 0.2, 0.7, 8.3, 46.1, 6000),
    st(a.bunk + 0.2, 0.8, 8.2, 46.25, 7800),
    st(a.place + 0.3, 0.7, 8.1, 46.3, 6600),
    st(a.ciel + 0.3, 1.0, 7.8, 46.4, 4200, { drift: 0.04 }),
    st(a.y2014 + 0.3, 0.7, 8.0, 46.2, 5000),
    st(a.bureau + 0.2, 0.7, 7.8, 46.3, 4400),
    st(a.fr4 + 0.3, 0.8, 6.3, 45.8, 9000),
    st(a.b5 + 0.4, 1.1, 8, 50, 520, { drift: 0.04 }),
    st(a.n32 + 0.3, 0.8, 0, 50, 420),
    st(a.ue5 + 0.4, 0.8, 12, 48, 750),
    st(a.prob + 0.3, 1.1, 6.2, 45.95, 16000, { drift: 0.03 }),
    st(a.n239 + 0.3, 0.7, 6.2, 46.0, 19000),
    st(a.front + 0.2, 0.7, 6.25, 45.9, 15000),
    st(a.att6 + 0.2, 0.8, 6.3, 45.95, 12000),
    st(a.b7 + 0.4, 1.0, 5.2, 46.9, 2400, { drift: 0.04 }),
    st(a.signe + 0.2, 0.7, 4.6, 47.2, 2800),
    st(a.neutra + 0.2, 0.7, 6.4, 46.6, 3400),
    st(a.tf8 + 0.2, 1.0, 5.0, 46.3, 2200),
    st(a.tc8 + 0.2, 0.8, 6.8, 46.0, 2700),
    st(a.abo + 0.1, 0.8, 5.5, 46.2, 2300),
    st(a.fin + 0.5, 0.8, 5.5, 46.2, 2500, { drift: 0.04 }),
  ]);
  A.tilt = [[a.tf - 0.5, a.b1, 18], [a.b3 - 0.3, a.fusil, 14], [a.b5 - 0.3, a.n32, 14], [a.b7 - 0.3, a.garantit, 14], [a.tf8 - 0.3, a.comm, 12]];

  // ---- sons et actions
  ev(0, 'whoosh'); ev(a.ch0, 'scan'); ev(a.ch0 + 0.05, 'pop'); act(a.ch0, 'Suisse', 'drapeau'); ev(a.fr0 - 0.3, 'whoosh'); ev(a.fr0, 'scan'); ev(a.qui, 'boing'); ev(a.tf, 'pop'); ev(a.contre, 'stamp'); ev(a.tc, 'pop'); ev(a.sb, 'pop');
  act(a.tf, 'soldat français', 'agite le drapeau'); act(a.tc, 'soldat suisse', 'pose');
  ev(a.b1 - 0.3, 'whoosh'); ev(a.otan1, 'pop'); ev(a.pas, 'stamp'); act(a.pas, 'OTAN', 'barrée'); ev(a.ue1, 'pop'); ev(a.non, 'stamp'); act(a.non, 'UE', 'barrée'); ev(a.neutre, 'shine'); act(a.neutre, 'bouclier', 'neutre'); ev(a.zero, 'impact'); act(a.zero, 'tampon', '0 allié');
  ev(a.lie - 0.3, 'whoosh'); ev(a.lie, 'scan'); act(a.lie, 'château', 'tombe'); ev(a.lie + 0.3, 'thud'); ev(a.y1868, 'stamp');
  for (const Lg of LEGS) { ev(Lg.t0, 'jet'); act(Lg.t0, Lg.jet, 'vole'); ev(Lg.t1 - 0.1, 'whoosh'); }
  ev(a.pape, 'pop'); act(a.pape, 'garde suisse', 'apparaît'); ev(a.vat, 'ping');
  ev(a.att, 'alarm'); ev(a.n147, 'count'); act(a.n147, 'soldats suisses', 'rangée'); ev(a.fusil, 'pop'); ev(a.maison, 'thud'); act(a.maison, 'chalet', 'tombe');
  ev(a.n370, 'count'); BUNK.forEach((p, i) => ev(a.bunk - 0.3 + i * 0.09, 'tic')); act(a.bunk, 'bunkers', 'sortent de terre'); ev(a.hab, 'ding');
  ev(a.ciel, 'swell'); ev(a.y2014, 'stamp'); ev(a.bureau, 'boing'); act(a.bureau, 'horloge', 'dort'); ev(a.geneve, 'ping'); ev(a.escorte, 'jet'); act(a.escorte, 'Rafale', 'escortent');
  ev(a.b5 - 0.2, 'whoosh'); ev(a.otan5, 'shine'); ev(a.n32, 'count'); ev(a.ue5, 'shine'); act(a.ue5, 'drapeau UE', 'tourne'); ev(a.ue5 + 0.8, 'count');
  for (const id in CS) for (const p of CS[id]) if (p.t > a.b5 && !p.named) ev(p.t, 'tic');
  ev(a.prob - 0.2, 'whoosh'); ev(a.prob, 'boing'); ev(a.n239, 'count'); act(a.n239, 'frontaliers', 'traversent'); ev(a.front, 'steps'); ev(a.att6, 'boing'); ev(a.sal, 'stamp');
  ev(a.b7 - 0.3, 'whoosh'); ev(a.y1815b, 'photo'); act(a.y1815b, 'parchemin', '1815'); ev(a.signe, 'stamp'); ev(a.neutra, 'draw'); act(a.neutra, 'flèche', 'France → Suisse');
  ev(a.tf8 - 0.2, 'cheer'); ev(a.tf8, 'pop'); ev(a.tc8, 'pop'); ev(a.comm, 'pop'); ev(a.abo, 'pop'); ev(a.abo + 0.1, 'ding'); act(a.tf8, 'soldats', 'face à face');
  fillGaps();
  window.PREVIEW = [0.4, a.fr0 + 0.4, a.qui + 0.4, a.contre + 0.4, a.pas + 0.4, a.non + 0.4, a.neutre + 0.5, a.zero + 0.4, a.lie + 0.6, a.y1868 + 0.4, a.garde + 0.6, a.vat + 0.4, a.att + 0.3, a.n147 + 0.6, a.maison + 0.3, a.bunk + 0.6, a.hab + 0.3, a.y2014 + 0.3, a.bureau + 0.4, a.avion + 0.6, a.escorte + 0.6, a.n32 + 0.4, a.ue5 + 0.8, a.prob + 0.4, a.n239 + 0.6, a.front + 0.5, a.sal + 0.4, a.y1815b + 0.4, a.signe + 0.4, a.neutra + 0.5, a.tf8 + 0.4, a.abo + 0.4];
}
function fillGaps() { const ts = EVENTS.map(e => e[0]).sort((x, y) => x - y); for (let i = 1; i < ts.length; i++) for (let t = ts[i - 1] + 1.2; t < ts[i] - 0.3; t += 1.2) ev(t, 'tic'); }

// ---------- calque écran ----------
function noTag(c, s, x, y, t, t0, t1, o = {}) { if (t < t0 || t > t1 + 0.3) return; const sc = popIn(t, t0, 0.3) * fadeOut(t, t1, 0.3); tag(c, s, x, y, { size: o.size || 60, bg: o.bg || '#1d3a8a', border: '#fff', sc }); if (t > o.x) { c.save(); c.globalAlpha = fadeOut(t, t1, 0.3); c.translate(x, y); c.lineWidth = 16; c.lineCap = 'round'; c.strokeStyle = '#e01b24'; const k = easeOut(prog(t, o.x, 0.25)); const w = (o.w || 200); c.beginPath(); c.moveTo(-w, -w * 0.35); c.lineTo(-w + 2 * w * k, -w * 0.35 + 0.7 * w * k); c.stroke(); if (k > 0.5) { const k2 = easeOut(prog(t, o.x + 0.12, 0.25)); c.beginPath(); c.moveTo(w, -w * 0.35); c.lineTo(w - 2 * w * k2, -w * 0.35 + 0.7 * w * k2); c.stroke(); } c.restore(); } }
function escorts(c, t) {
  const L = LEGS.find(l => l.jet === 'airliner'); if (t < A.escorte - 0.2 || t > A.b5 - 0.1) return;
  const u = clamp(ease(prog(t, L.t0, L.t1 - L.t0))); const ll = d3.geoInterpolate(L.a, L.b)(u); const p = S(...ll); const q = S(...d3.geoInterpolate(L.a, L.b)(clamp(u + 0.02))); const p0 = S(...d3.geoInterpolate(L.a, L.b)(clamp(u - 0.02)));
  let dir = Math.atan2(q.y - p0.y, q.x - p0.x); if (u >= 1) dir = -2.2; const nx = -Math.sin(dir), ny = Math.cos(dir); const s = popIn(t, A.escorte - 0.2, 0.35);
  for (const sd of [-1, 1]) { const x = p.x + nx * 170 * sd - Math.cos(dir) * 60, y = p.y + ny * 170 * sd - Math.sin(dir) * 60 + 8 * Math.sin(t * 5 + sd); c.save(); c.translate(x, y); c.rotate(dir + Math.PI / 2); c.scale(s, s); drawJetImg(c, 'jet_fr', 170); c.restore(); }
}
function screenScene(c, t) {
  const a = A;
  // accroche
  if (t > a.qui && t < a.tf + 0.2) { const s = popIn(t, a.qui, 0.3) * fadeOut(t, a.tf - 0.1, 0.25); c.save(); c.translate(W / 2, 560); c.scale(s, s); sprite(c, 'qmark', 0, 150, 300, { shadow: false }); c.restore(); }
  if (t > a.tf - 0.1 && t < a.b1 + 0.3) {
    const al = fadeOut(t, a.b1, 0.3); c.save(); c.globalAlpha = al;
    waver(c, 'sol_fr', 230, 1440, 380, t, a.tf - 0.1, 0); tag(c, 'TEAM FRANCE', 230, 1010, { size: 50, bg: BLUE, border: '#fff', sc: popIn(t, a.tf, 0.3) });
    if (t > a.tc - 0.1) { soldier(c, 'sol_ch_a', 850, 1440, 390, t, a.tc - 0.1, { ph: 1 }); tag(c, 'TEAM SUISSE', 850, 1010, { size: 50, bg: CHR, border: '#fff', sc: popIn(t, a.tc, 0.3) }); }
    if (t > a.contre) { c.save(); c.translate(540, 1200); const s = stampScale(t, a.contre); c.scale(s, s); c.shadowColor = '#ffd23a'; c.shadowBlur = 40; txt(c, 'VS', 0, 0, { size: 200, weight: 900, color: '#FFE928', stroke: '#3a2500', sw: 18, shadow: false }); c.restore(); }
    c.restore();
  }
  // Team Suisse : seule
  if (t > a.b1 - 0.1 && t < a.b2) {
    const al = fadeOut(t, a.b2 - 0.25, 0.25); c.save(); c.globalAlpha = al;
    if (t < a.zero) soldier(c, 'sol_ch_a', 850, 1440, 390, t, a.b1 - 0.1); else sprite(c, 'sol_ch_b', 850, 1440, 400 * popIn(t, a.zero - 0.05, 0.3), { rot: 0.03 * Math.sin(t * 7) });
    tag(c, 'TEAM SUISSE', 850, 1010, { size: 50, bg: CHR, border: '#fff', sc: popIn(t, a.b1, 0.3) });
    c.restore();
    noTag(c, 'OTAN', W / 2, 520, t, a.otan1, a.ue1 - 0.15, { x: a.pas, size: 90 });
    if (t > a.ue1 - 0.1 && t < a.neutre) { const s = popIn(t, a.ue1 - 0.1, 0.3) * fadeOut(t, a.neutre - 0.2, 0.2); c.save(); c.translate(W / 2, 560); c.scale(s, s); c.rotate(t * 0.5); sprite(c, 'eu', 0, 110, 220, { shadow: false }); c.restore(); if (t > a.non) { c.save(); c.globalAlpha = fadeOut(t, a.neutre - 0.2, 0.2); c.translate(W / 2, 560); c.lineWidth = 18; c.lineCap = 'round'; c.strokeStyle = '#e01b24'; const k = easeOut(prog(t, a.non, 0.25)); c.beginPath(); c.moveTo(-130, -130); c.lineTo(-130 + 260 * k, -130 + 260 * k); c.stroke(); c.beginPath(); c.moveTo(130, -130); c.lineTo(130 - 260 * k, -130 + 260 * k); c.stroke(); c.restore(); } }
    if (t > a.neutre - 0.05 && t < a.zero) tag(c, 'NEUTRE DEPUIS 1815', W / 2, 500, { size: 62, bg: '#fff', color: CHR, border: CHR, sc: popIn(t, a.neutre, 0.3) * fadeOut(t, a.zero - 0.15, 0.15) });
    stampText(c, '0 ALLIÉ', W / 2, 520, t, a.zero, a.b2 - 0.15, { size: 120 });
  }
  // Liechtenstein, Garde suisse
  if (t > a.lie - 0.1 && t < a.garde) { const p = S(9.55, 47.15); c.save(); c.globalAlpha = fadeOut(t, a.garde - 0.25, 0.25); const dy = t < a.lie + 0.3 ? -700 * (1 - easeIn((t - a.lie + 0.1) / 0.4)) : 0; sprite(c, 'castle', clamp(p.x + 230, 230, 850), clamp(p.y + 170, 600, 1400) + dy, 300, { shadow: false }); c.restore(); }
  stampText(c, "PAS D'ARMÉE · 1868", W / 2, 470, t, a.y1868, a.garde - 0.15, { size: 70 });
  if (t > a.pape - 0.1 && t < a.b3) { const p = S(...P_.vatican); const s = popIn(t, a.pape - 0.1, 0.35); c.save(); c.globalAlpha = fadeOut(t, a.b3 - 0.25, 0.25); sprite(c, 'garde', clamp(p.x - 230, 200, 880), clamp(p.y + 260, 700, 1420), 420 * s, { shadow: false }); c.restore(); tag(c, 'GARDE SUISSE → LE PAPE', W / 2, 470, { size: 50, bg: '#f4c430', color: '#111', border: '#111', sc: popIn(t, a.pape, 0.3) * fadeOut(t, a.b3 - 0.2, 0.2) }); if (t > a.vat - 0.05) ping(c, p.x, p.y, t, a.vat, 'VATICAN', a.b3 - 0.2); }
  // armée suisse
  if (t > a.att - 0.1 && t < a.b4) {
    const al = fadeOut(t, a.b4 - 0.25, 0.25); c.save(); c.globalAlpha = al;
    if (t > a.n147 - 0.1) for (let k = 0; k < 3; k++) soldier(c, 'sol_ch_a', 280 + k * 260, 1440 - (k === 1 ? 30 : 0), 330, t, a.n147 - 0.1 + k * 0.12, { ph: k });
    if (t > a.fusil - 0.1 && t < a.n370) { const dy = t < a.maison ? -800 * (1 - easeIn(prog(t, a.fusil - 0.1, a.maison - a.fusil + 0.1))) : 0; c.save(); c.globalAlpha *= fadeOut(t, a.n370 - 0.2, 0.2); sprite(c, 'chalet', W / 2, 1060 + dy, 330, { shadow: false }); c.restore(); }
    BUNK.forEach((ll, i) => { const t0 = a.bunk - 0.3 + i * 0.09; if (t < t0) return; const p = S(...ll); const s = popIn(t, t0, 0.3); sprite(c, 'bunker', p.x, p.y + 20, 95 * s, { shadow: false }); });
    c.restore();
    stampText(c, 'ATTENTION', W / 2, 470, t, a.att, a.n147 - 0.05, { col: '#d4a000', size: 90 });
    if (t > a.n147 - 0.05 && t < a.n370) counter(c, 147000, t, a.n147, a.n147 + 0.8, W / 2, 470, { size: 120, label: 'SOLDATS', until: a.n370 - 0.15 });
    if (t > a.n370 - 0.05) counter(c, 370000, t, a.n370, a.bunk + 0.4, W / 2, 470, { size: 120, label: 'BUNKERS', until: a.b4 - 0.25 });
    if (t > a.place - 0.05 && t < a.b4) tag(c, '1 PLACE PAR HABITANT', W / 2, 990, { size: 54, bg: '#111', color: '#FFE928', border: '#FFE928', sc: stampScale(t, a.place) * fadeOut(t, a.b4 - 0.2, 0.2) });
  }
  // le ciel, 2014
  if (t > a.ciel - 0.1 && t < a.b5) {
    const al = fadeOut(t, a.b5 - 0.25, 0.25); c.save(); c.globalAlpha = al;
    if (t < a.avion) { const p = S(...P_.berne); sprite(c, 'jet_ch', clamp(p.x, 250, 830), clamp(p.y + 120, 700, 1300), 260 * popIn(t, a.ciel - 0.1, 0.35), { shadow: false }); }
    if (t > a.bureau - 0.15 && t < a.geneve + 0.3) { const s = popIn(t, a.bureau - 0.15, 0.35) * fadeOut(t, a.geneve, 0.3); c.save(); c.translate(820, 1230); c.scale(s, s); c.rotate(0.05 * Math.sin(t * 3)); sprite(c, 'clock_sleep', 0, 140, 280, { shadow: false }); c.restore(); tag(c, 'LUN–VEN · 8 H – 17 H', 760, 1440, { size: 44, bg: '#111', color: '#fff', border: '#fff', sc: popIn(t, a.bureau + 0.25, 0.3) * fadeOut(t, a.geneve, 0.3) }); }
    c.restore();
    if (t > a.y2014 - 0.05 && t < a.avion) tag(c, '2014', W / 2, 470, { size: 90, bg: CHR, border: '#fff', sc: stampScale(t, a.y2014) * fadeOut(t, a.avion - 0.2, 0.2) });
    if (t > a.avion - 0.05 && t < a.escorte) tag(c, 'AVION DÉTOURNÉ', W / 2, 470, { size: 60, bg: '#e01b24', border: '#fff', sc: popIn(t, a.avion, 0.3) * fadeOut(t, a.escorte - 0.2, 0.2) });
    if (t > a.geneve - 0.05) { const p = S(...P_.geneve); ping(c, p.x, p.y, t, a.geneve, 'GENÈVE', a.b5 - 0.2); }
    escorts(c, t);
    if (t > a.escorte - 0.05) tag(c, 'ESCORTÉ PAR LA FRANCE', W / 2, 470, { size: 54, bg: BLUE, border: '#fff', sc: popIn(t, a.escorte, 0.3) * fadeOut(t, a.b5 - 0.2, 0.2) });
  }
  // Team France
  if (t > a.otan5 - 0.05 && t < a.b6) tag(c, 'OTAN', W / 2, 470, { size: 70, bg: '#1d3a8a', border: '#fff', sc: popIn(t, a.otan5, 0.3) * fadeOut(t, a.ue5 - 0.2, 0.2) });
  if (t > a.n32 - 0.1 && t < a.ue5) counter(c, 32, t, a.n32 - 0.1, a.n32 + 0.4, W / 2, 640, { size: 130, label: 'PAYS', until: a.ue5 - 0.25 });
  if (t > a.ue5 - 0.1 && t < a.b6) { const s = popIn(t, a.ue5 - 0.1, 0.35) * fadeOut(t, a.b6 - 0.25, 0.25); c.save(); c.translate(W / 2, 520); c.scale(s, s); c.rotate(t * 0.5); sprite(c, 'eu', 0, 90, 180, { shadow: false }); c.restore(); if (t > a.ue5 + 0.7) counter(c, 36, t, a.ue5 + 0.7, a.ue5 + 1.1, W / 2, 1180, { size: 130, label: 'PAYS', until: a.b6 - 0.25 }); }
  // frontaliers
  if (t > a.prob - 0.1 && t < a.b7) {
    const al = fadeOut(t, a.b7 - 0.25, 0.25); const pA = S(...P_.annemasse), pG = S(...P_.geneve);
    c.save(); c.globalAlpha = al;
    if (t > a.jour - 0.1) { for (let k = 0; k < 3; k++) { const u = ((t - a.jour) * 0.32 + k / 3) % 1; const x = lerp(pA.x - 330, pG.x + 200, u), y = lerp(pA.y + 240, pG.y + 60, u) + k * 40; c.save(); c.globalAlpha *= Math.min(1, u * 5, (1 - u) * 5); sprite(c, 'commuters', x, y + 120, 170, { shadow: false, flip: pG.x < pA.x - 330 }); c.restore(); } }
    if (t > a.att6 - 0.1) { sprite(c, 'sol_ch_b', 850, 1450, 380 * popIn(t, a.att6 - 0.1, 0.3), { rot: 0.04 * Math.sin(t * 6) }); const s = popIn(t, a.att6 + 0.2, 0.3); c.save(); c.translate(850, 960); c.scale(s, s); sprite(c, 'qmark', 0, 0, 150, { shadow: false }); c.restore(); }
    c.restore();
    { const p = S(...P_.geneve); ping(c, p.x, p.y, t, a.jour, 'GENÈVE', a.b7 - 0.25); }
    if (t > a.prob - 0.05 && t < a.n239) tag(c, 'LE PROBLÈME', W / 2, 470, { size: 70, bg: '#e01b24', border: '#fff', sc: popIn(t, a.prob, 0.3) * fadeOut(t, a.n239 - 0.2, 0.2) });
    if (t > a.n239 - 0.1) counter(c, 239000, t, a.n239 - 0.1, a.n239 + 0.9, W / 2, 470, { size: 120, label: 'FRANÇAIS PAR JOUR', until: a.att6 - 0.2 });
    stampText(c, 'SES PROPRES SALARIÉS', W / 2, 500, t, a.sal, a.b7 - 0.15, { size: 64 });
  }
  // 1815
  if (t > a.y1815b - 0.1 && t < a.b8) {
    const al = fadeOut(t, a.b8 - 0.25, 0.25); const s = popIn(t, a.y1815b - 0.1, 0.35); c.save(); c.globalAlpha = al; c.translate(300, 1230); c.scale(s, s); c.rotate(-0.06); sprite(c, 'scroll', 0, 130, 280, { shadow: false }); txt(c, '1815', 0, -30, { size: 84, font: 'Caveat', weight: 700, color: '#4a2a08', shadow: false }); txt(c, 'Traité de Paris', 0, 30, { size: 40, font: 'Caveat', weight: 700, color: '#4a2a08', shadow: false }); c.restore();
    stampText(c, 'SIGNÉ : LA FRANCE', W / 2, 500, t, a.signe, a.b8 - 0.15, { col: BLUE, size: 64 });
    if (t > a.neutra - 0.1) { const pP = S(...P_.paris), pB = S(...P_.berne); arrowTo(c, pP.x, pP.y, pB.x, pB.y - 40, t, a.neutra - 0.1, a.b8 - 0.2, BLUE); tag(c, 'NEUTRALITÉ GARANTIE', 760, 1150, { size: 44, bg: '#fff', color: CHR, border: CHR, sc: popIn(t, a.neutra + 0.2, 0.3) * al }); }
  }
  // fin
  if (t > a.tf8 - 0.2) {
    waver(c, 'sol_fr', 210, 1450, 360, t, a.tf8 - 0.2, 0); soldier(c, 'sol_ch_a', 870, 1450, 370, t, a.tf8 - 0.1, { ph: 1 });
    if (t > a.tf8 - 0.05) tag(c, 'TEAM FRANCE', 210, 1030, { size: 46, bg: BLUE, border: '#fff', sc: popIn(t, a.tf8, 0.3) }); if (t > a.tc8 - 0.05) tag(c, 'TEAM SUISSE', 870, 1030, { size: 46, bg: CHR, border: '#fff', sc: popIn(t, a.tc8, 0.3) });
    { const s = popIn(t, a.tf8 - 0.1, 0.3) * (1 + 0.1 * Math.max(0, 1 - Math.abs(t - a.tc8) / 0.15)); c.save(); c.translate(W / 2, 880); c.scale(s, s); txt(c, 'QUI GAGNE ?', 0, 0, { size: 120, weight: 900, color: '#FFE928', stroke: '#1b1300', sw: 14 }); c.restore(); }
    if (t > a.abo - 0.15) tag(c, 'ABONNE-TOI', W / 2, 1230, { size: 70, bg: '#C00E1F', border: '#fff', sc: stampScale(t, a.abo) });
  }
}
