// scene.js — La tombe de Napoléon appartient à la France (Sainte-Hélène). Moteur : engine.js.
const GOLD = '#FFE928';
const LL = { paris: [2.3126, 48.855], SH: [-5.705, -15.955], LW: [-5.6872, -15.9617], TB: [-5.6964, -15.9656], BR: [-5.7128, -15.9395], waterloo: [4.41, 50.68], plymouth: [-4.14, 50.37], cherbourg: [-1.62, 49.64], cap: [18.42, -33.92], joburg: [28.05, -26.2], angola: [12.15, -15.2] };
const CFG = {
  teamCol: { f: '#3b7bff', a: '#ffffff' }, trail: { plane: '#F7EF08', ship: '#ffffff' }, NAME: {}, ANCH: {}, sides: [],
  sprites: ['plane', 'napo_a', 'napo_b', 'redcoat', 'ship', 'island', 'longwood', 'tomb', 'briars', 'invalides', 'cannon', 'flag_fr', 'flag_uk', 'qmark'],
  extraFlags: ['fr', 'gb'],
};
let SHIPS = [];

function setup() {
  const a = A; A.sb = 1e9; ISO['654'] = 'gb';
  a.tombe = T(0, 'tombe'); a.napo = T(0, 'napoleon'); a.fr = T(0, 'france'); a.ile = T(0, 'ile');
  a.b1 = beatStart(1); a.sh = T(1, 'saintehelene'); a.atl = T(1, 'latlantique'); a.km = T(1, 'mille');
  a.b2 = beatStart(2); a.y1815 = T(2, 'mille'); a.wat = T(2, 'waterloo'); a.angl = T(2, 'anglais'); a.loin = T(2, 'plus');
  a.b3 = beatStart(3); a.lw = T(3, 'longwood'); a.meurt = T(3, 'meurt'); a.mai = T(3, 'cinq');
  a.b4 = beatStart(4); a.vallee = T(4, 'vallee'); a.n19 = T(4, 'dixneuf'); a.fr4 = T(4, 'france'); a.paris = T(4, 'paris'); a.inv = T(4, 'invalides');
  a.b5 = beatStart(5); a.y1858 = T(5, 'mille'); a.n3 = T(5, 'napoleon'); a.lw5 = T(5, 'longwood'); a.tb5 = T(5, 'tombe'); a.y1959 = T(5, 'mille', 2); a.aus = T(5, 'australienne'); a.troisieme = T(5, 'troisieme'); a.br = T(5, 'briars');
  a.b6 = beatStart(6); a.trois = T(6, 'trois'); a.drapeau = T(6, 'drapeau'); a.tb6 = T(6, 'tombe'); a.vide = T(6, 'vide');
  a.b7 = beatStart(7); a.bateau = T(7, 'bateau'); a.jours = T(7, 'cinq'); a.cap = T(7, 'cap'); a.vol = T(7, 'premier'); a.y2017 = T(7, 'deux');
  a.b8 = beatStart(8); a.savais = T(8, 'savais'); a.comm = T(8, 'commentaire'); a.abo = T(8, 'abonnetoi'); a.fin = TE(8, 'abonnetoi');
  DUR = a.fin + 0.6;
  C('250', a.fr, 'f'); C('654', a.ile, 'a');

  // ---- trajets : bateaux (dessinés à part) et avion
  SHIPS = [{ a: LL.plymouth, b: LL.SH, t0: a.angl - 0.1, t1: a.b3 - 0.25, sMid: 260, sEnd: 1600 }, { a: LL.SH, b: LL.cherbourg, t0: a.n19 + 0.2, t1: a.paris - 0.3, sMid: 260, sEnd: 2600 }, { a: LL.cap, b: LL.SH, t0: a.bateau - 0.6, t1: a.cap + 0.2, noFollow: true }];
  SHIPS.forEach(s => LEGS.push({ jet: 'ship', ...s }));
  LEGS.push({ jet: 'plane', a: LL.joburg, b: LL.SH, t0: a.vol - 0.2, t1: a.y2017 + 0.1, noFollow: true });
  JETVIS = { plane: [[a.vol - 0.4, a.b8 - 0.1]] };

  // ---- caméra
  buildCam([
    st(0, 0, -3, 12, 300, { drift: 0.05 }),
    st(1.3, 0.8, -2, 16, 380),
    st(a.fr + 0.5, 0.8, -1, 20, 300),
    st(a.ile + 0.4, 0.6, -3, 5, 360),
    st(a.sh + 0.9, 1.3, LL.SH[0], LL.SH[1] - 0.04, 60000, { drift: 0.03 }),
    st(a.atl + 0.4, 1.0, 3, -16, 650),
    st(a.km + 0.4, 0.7, 4, -15, 820),
    st(a.y1815 + 0.4, 1.0, LL.waterloo[0], LL.waterloo[1] - 0.3, 9000, { drift: 0.03 }),
    st(a.wat + 0.3, 0.6, LL.waterloo[0], LL.waterloo[1] - 0.2, 12000),
    st(a.lw + 0.2, 1.1, LL.LW[0], LL.LW[1] - 0.003, 280000, { drift: 0.02 }),
    st(a.meurt + 0.2, 0.7, LL.LW[0] - 0.002, LL.LW[1] - 0.002, 360000),
    st(a.b4 + 0.1, 0.7, LL.LW[0] - 0.004, LL.LW[1] - 0.003, 250000),
    st(a.vallee + 0.2, 0.8, LL.TB[0], LL.TB[1] - 0.003, 330000),
    st(a.paris + 0.4, 0.8, LL.paris[0], LL.paris[1] - 0.15, 16000),
    st(a.inv + 0.2, 0.6, LL.paris[0], LL.paris[1] - 0.12, 22000),
    st(a.y1858 + 0.4, 1.2, LL.SH[0], LL.SH[1] - 0.01, 180000, { drift: 0.02 }),
    st(a.lw5 + 0.2, 0.7, LL.LW[0], LL.LW[1] - 0.003, 300000),
    st(a.tb5 + 0.2, 0.6, LL.TB[0], LL.TB[1] - 0.003, 330000),
    st(a.y1959 + 0.3, 0.8, LL.SH[0], LL.SH[1] - 0.01, 190000),
    st(a.troisieme + 0.1, 0.7, LL.SH[0] - 0.003, LL.SH[1] + 0.004, 260000),
    st(a.br + 0.2, 0.7, LL.BR[0], LL.BR[1] - 0.003, 300000),
    st(a.b6 + 0.4, 0.9, LL.SH[0] + 0.005, LL.SH[1] - 0.006, 170000, { drift: 0.02 }),
    st(a.trois + 0.2, 0.7, LL.SH[0] - 0.004, LL.SH[1] - 0.008, 240000),
    st(a.drapeau + 0.2, 0.7, LL.SH[0], LL.SH[1] - 0.008, 210000),
    st(a.tb6 + 0.2, 0.8, LL.TB[0], LL.TB[1] - 0.002, 420000),
    st(a.bateau, 1.0, 5, -24, 430, { drift: 0.03 }),
    st(a.vol + 0.2, 0.8, 10, -20, 380),
    st(a.b8 + 0.4, 1.0, -2, 12, 300, { drift: 0.03 }),
    st(a.comm + 0.2, 0.7, -3, 10, 340),
    st(a.fin + 0.5, 0.8, -3, 10, 320, { drift: 0.03 }),
  ]);
  A.tilt = [[0.2, a.fr, 16], [a.b2 - 0.2, a.angl, 14], [a.b5 - 0.2, a.lw5, 14], [a.b8 - 0.2, a.comm, 12], [a.b6 - 0.2, a.drapeau, 12]];

  // ---- sons et actions
  ev(0, 'whoosh'); ev(a.tombe + 0.1, 'fall'); ev(a.tombe + 0.4, 'thud'); act(a.tombe, 'tombe', 'tombe'); ev(a.napo, 'pop'); act(a.napo, 'Napoléon', 'apparaît'); ev(a.fr, 'scan'); ev(a.ile, 'scan'); act(a.ile, 'drapeau britannique', 'flotte');
  ev(a.sh - 0.2, 'whoosh'); ev(a.sh, 'ping'); ev(a.atl, 'whoosh'); ev(a.km, 'draw'); ev(a.km + 0.4, 'stamp'); act(a.km, 'distance', '1900 km');
  ev(a.y1815, 'stamp'); ev(a.wat, 'impact'); act(a.wat, 'canon', 'tire'); ev(a.angl, 'pop'); act(a.angl, 'soldat anglais', 'escorte');
  for (const s of LEGS) { ev(s.t0, s.jet === 'plane' ? 'jet' : 'wave'); act(s.t0, s.jet, 'part'); ev(s.t1 - 0.1, 'whoosh'); }
  ev(a.lw, 'ping'); ev(a.lw + 0.1, 'fall'); ev(a.lw + 0.4, 'thud'); act(a.lw, 'Longwood', 'tombe'); ev(a.meurt, 'heartbeat'); ev(a.mai, 'stamp');
  ev(a.vallee, 'fall'); ev(a.vallee + 0.3, 'thud'); act(a.vallee, 'tombe', 'tombe'); ev(a.n19, 'count'); ev(a.inv, 'thud'); act(a.inv, 'Invalides', 'tombe'); ev(a.inv + 0.1, 'shine');
  ev(a.y1858, 'stamp'); ev(a.lw5, 'pop'); ev(a.tb5, 'pop'); act(a.lw5, 'drapeau français', 'planté'); ev(a.y1959, 'stamp'); ev(a.aus, 'pop'); ev(a.br, 'fall'); ev(a.br + 0.3, 'thud'); act(a.br, 'Briars', 'tombe');
  ev(a.trois, 'count'); ev(a.drapeau, 'shine'); ev(a.vide, 'impact'); act(a.vide, 'tampon', 'vide');
  ev(a.jours, 'stamp'); ev(a.y2017, 'stamp');
  ev(a.savais, 'boing'); act(a.savais, '?', 'apparaît'); ev(a.comm, 'pop'); ev(a.abo, 'pop'); ev(a.abo + 0.1, 'ding');
  fillGaps();
  window.PREVIEW = [0.5, a.napo + 0.6, a.ile + 0.5, a.sh + 0.8, a.km + 0.5, a.wat + 0.4, a.angl + 1.5, a.lw + 0.6, a.mai + 0.4, a.vallee + 0.6, a.n19 + 0.4, a.inv + 0.5, a.y1858 + 0.6, a.tb5 + 0.4, a.aus + 0.4, a.br + 0.5, a.trois + 0.4, a.drapeau + 0.4, a.vide + 0.4, a.jours + 0.4, a.y2017 + 0.3, a.savais + 0.3, a.abo + 0.3];
}
function fillGaps() { const ts = EVENTS.map(e => e[0]).sort((x, y) => x - y); for (let i = 1; i < ts.length; i++) for (let t = ts[i - 1] + 1.2; t < ts[i] - 0.3; t += 1.2) ev(t, 'tic'); }

// ---------- outils ----------
const edgeA = p => clamp((1470 - p.y) / 90) * clamp((p.y - 360) / 90) * clamp((p.x + 60) / 90) * clamp((W + 60 - p.x) / 90);
function dropAt(c, name, x, y, h, t, t0, t1) {
  if (t < t0 || t > t1 + 0.3) return; const dy = t < t0 + 0.32 ? -700 * (1 - easeIn((t - t0) / 0.32)) : 0; const al = fadeOut(t, t1, 0.3) * edgeA({ x, y });
  c.save(); c.globalAlpha *= al; sprite(c, name, x, y + dy + (dy ? 0 : 4 * Math.sin(t * 3)), h, { shadow: dy === 0 }); c.restore();
}
function pinFlag(c, k, label, t, t0, t1, o = {}) {
  if (t < t0 || t > t1 + 0.3) return; const p = S(...LL[k]); const al = fadeOut(t, t1, 0.3) * edgeA(p); if (al < 0.01) return; const s = popIn(t, t0, 0.35);
  c.save(); c.globalAlpha *= al; const wv = ((t - t0) % 0.9) / 0.9; c.beginPath(); c.arc(p.x, p.y, 22 + 55 * wv, 0, 7); c.lineWidth = 5; c.strokeStyle = `rgba(255,255,255,${0.8 * (1 - wv)})`; c.stroke();
  c.translate(p.x, p.y); c.scale(s, s); c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 12; c.beginPath(); c.arc(0, 0, 28, 0, 7); c.fillStyle = '#fff'; c.fill(); c.shadowColor = 'transparent';
  c.save(); c.beginPath(); c.arc(0, 0, 23, 0, 7); c.clip(); const f = FL[o.flag || 'fr']; if (f) c.drawImage(f, -31, -23, 62, 46); c.restore();
  if (label) txt(c, typed(label, t, t0 + 0.05, 0.3), o.lx || 0, o.ly ?? 62, { size: o.size || 44, weight: 900, color: '#fff', stroke: '#000', sw: 9, align: o.align || 'center' });
  c.restore();
}
function drawShips(c, t) {
  for (const s of SHIPS) {
    if (t < s.t0 - 0.3 || t > s.t1 + 0.6) continue; const u = ease(prog(t, s.t0, s.t1 - s.t0)); const ll = d3.geoInterpolate(s.a, s.b)(u); const p = S(...ll); const q = S(...d3.geoInterpolate(s.a, s.b)(clamp(u + 0.02)));
    const al = Math.min(clamp((t - s.t0 + 0.3) / 0.3), fadeOut(t, s.t1 + 0.3, 0.3)); c.save(); c.globalAlpha = al; sprite(c, 'ship', p.x, p.y + 50, 190, { shadow: false, flip: q.x < p.x - 0.5, rot: 0.05 * Math.sin(t * 3) }); c.restore();
  }
}

function screenUnder(c, t) {
  const a = A; drawShips(c, t);
  // les 3 lieux français
  pinFlag(c, 'LW', 'LONGWOOD', t, a.lw, a.b4 - 0.2, { ly: 0, lx: 40, align: 'left' });
  pinFlag(c, 'TB', 'LA TOMBE', t, a.vallee, a.n19 + 0.4, { ly: 0, lx: -40, align: 'right' });
  for (const [t0, t1] of [[a.lw5, a.b7 - 0.3]]) { pinFlag(c, 'LW', 'LONGWOOD', t, t0, t1, { ly: 0, lx: 40, align: 'left', size: 40 }); }
  pinFlag(c, 'TB', 'LA TOMBE', t, a.tb5, a.b7 - 0.3, { ly: 0, lx: -40, align: 'right', size: 40 });
  pinFlag(c, 'BR', 'LES BRIARS', t, a.br, a.b7 - 0.3, { ly: -60, size: 40 });
  // monuments posés sur l'île
  const pL = S(...LL.LW), pT = S(...LL.TB), pB = S(...LL.BR);
  dropAt(c, 'longwood', clamp(pL.x + 120, 220, 860), pL.y + 230, 230, t, a.lw + 0.1, a.b4 - 0.2);
  dropAt(c, 'tomb', clamp(pT.x - 150, 220, 860), pT.y + 260, 240, t, a.vallee, a.n19 + 0.4);
  dropAt(c, 'briars', clamp(pB.x - 120, 220, 860), pB.y - 70, 220, t, a.br, a.b6 - 0.2);
  if (t > a.vide - 0.4 && t < a.b7) { c.save(); c.globalAlpha = fadeOut(t, a.b7 - 0.25, 0.25); sprite(c, 'tomb', clamp(pT.x - 150, 220, 860), pT.y + 260, 240, { shadow: true }); c.restore(); }
}

function screenScene(c, t) {
  const a = A;
  // accroche : la tombe, Napoléon, les deux drapeaux
  if (t < a.b1 + 0.2) {
    const al = fadeOut(t, a.b1, 0.25); c.save(); c.globalAlpha = al;
    dropAt(c, 'tomb', W / 2, 1300, 300, t, a.tombe + 0.1, a.b1);
    if (t > a.napo - 0.1) soldier(c, 'napo_a', 210, 1450, 420, t, a.napo - 0.1);
    if (t > a.fr - 0.05) sprite(c, 'flag_fr', 860, 1180, 260 * popIn(t, a.fr, 0.35), { shadow: false, rot: 0.04 * Math.sin(t * 3) });
    if (t > a.ile - 0.05) sprite(c, 'flag_uk', 860, 1460, 260 * popIn(t, a.ile, 0.35), { shadow: false, rot: 0.04 * Math.sin(t * 3 + 1) });
    c.restore();
    if (t > a.fr - 0.05) tag(c, 'À LA FRANCE…', W / 2, 470, { size: 70, bg: BLUE, border: '#fff', sc: popIn(t, a.fr, 0.3) * fadeOut(t, a.ile - 0.1, 0.15) });
    if (t > a.ile - 0.05) tag(c, 'SUR UNE ÎLE BRITANNIQUE', W / 2, 470, { size: 54, bg: '#012169', border: '#fff', sc: stampScale(t, a.ile) * al });
  }
  // Sainte-Hélène
  if (t > a.sh - 0.1 && t < a.b2) {
    const al = fadeOut(t, a.b2 - 0.25, 0.25);
    if (t < a.atl) { c.save(); c.globalAlpha = al; sprite(c, 'island', W / 2, 1420, 300 * popIn(t, a.sh + 0.2, 0.35), { shadow: false }); c.restore(); tag(c, 'SAINTE-HÉLÈNE', W / 2, 470, { size: 76, bg: '#012169', border: '#fff', sc: popIn(t, a.sh, 0.3) * fadeOut(t, a.atl - 0.15, 0.15) }); }
    else { tag(c, 'ATLANTIQUE SUD', W / 2, 470, { size: 66, bg: '#0b6fa8', border: '#fff', sc: popIn(t, a.atl, 0.3) * al }); const p1 = S(...LL.SH), p2 = S(...LL.angola); distanceLine(c, [p1.x, p1.y], [p2.x, p2.y], t, a.km - 0.1, '1 900 KM', { until: a.b2 - 0.25 }); ping(c, p1.x, p1.y, t, a.atl, 'SAINTE-HÉLÈNE', a.b2 - 0.25); }
  }
  // 1815
  if (t > a.y1815 - 0.1 && t < a.b3) {
    const al = fadeOut(t, a.b3 - 0.25, 0.25);
    if (t < a.angl) { tag(c, '1815', W / 2, 470, { size: 100, bg: '#7a1f2b', border: GOLD, sc: stampScale(t, a.y1815) * fadeOut(t, a.angl - 0.15, 0.15) }); const p = S(...LL.waterloo); ping(c, p.x, p.y, t, a.wat, 'WATERLOO', a.angl - 0.15); if (t > a.wat - 0.1) { c.save(); c.globalAlpha = fadeOut(t, a.angl - 0.15, 0.2); sprite(c, 'cannon', clamp(p.x + 200, 220, 860), p.y + 250, 180 * popIn(t, a.wat - 0.1, 0.3), { shadow: false, rot: -0.05 * Math.max(0, 1 - (t - a.wat) / 0.3) }); c.restore(); } }
    else { c.save(); c.globalAlpha = al; soldier(c, 'redcoat', 200, 1460, 380, t, a.angl - 0.1); sprite(c, 'napo_b', 820, 1460, 300 * popIn(t, a.angl + 0.6, 0.35), { shadow: false }); c.restore(); tag(c, 'EXIL : LE PLUS LOIN POSSIBLE', W / 2, 470, { size: 46, bg: '#c8102e', border: '#fff', sc: popIn(t, a.loin, 0.3) * al }); }
  }
  // Longwood, mort
  if (t > a.meurt - 0.1 && t < a.b4) { const al = fadeOut(t, a.b4 - 0.25, 0.25); tag(c, '† 5 MAI 1821', W / 2, 470, { size: 80, bg: '#111', color: '#fff', border: '#fff', sc: stampScale(t, a.mai) * al }); c.save(); c.globalAlpha = al; sprite(c, 'napo_b', 220, 1460, 300 * popIn(t, a.meurt - 0.1, 0.35), { shadow: false }); c.restore(); }
  // 19 ans, Invalides
  if (t > a.n19 - 0.1 && t < a.b5) {
    const al = fadeOut(t, a.b5 - 0.25, 0.25);
    if (t < a.paris) counter(c, 19, t, a.n19 - 0.1, a.n19 + 0.4, W / 2, 470, { size: 120, label: 'ANS PLUS TARD', until: a.paris - 0.15 });
    else { tag(c, 'RETOUR À PARIS · 1840', W / 2, 470, { size: 54, bg: BLUE, border: '#fff', sc: popIn(t, a.paris, 0.3) * al }); const p = S(...LL.paris); dropAt(c, 'invalides', clamp(p.x, 220, 860), p.y + 280, 330, t, a.inv - 0.1, a.b5 - 0.2); }
  }
  // 1858, 1959
  if (t > a.y1858 - 0.1 && t < a.b6) {
    const al = fadeOut(t, a.b6 - 0.25, 0.25);
    if (t < a.y1959) { tag(c, '1858', W / 2, 470, { size: 100, bg: BLUE, border: GOLD, sc: stampScale(t, a.y1858) * fadeOut(t, a.y1959 - 0.15, 0.15) }); if (t > a.n3 - 0.05) tag(c, 'NAPOLÉON III RACHÈTE', W / 2, 590, { size: 46, bg: '#fff', color: '#111', border: '#111', sc: popIn(t, a.n3, 0.3) * fadeOut(t, a.y1959 - 0.15, 0.15) }); }
    else { tag(c, '1959', W / 2, 470, { size: 100, bg: '#00843d', border: GOLD, sc: stampScale(t, a.y1959) * al }); if (t > a.aus - 0.05) tag(c, 'UNE AUSTRALIENNE OFFRE', W / 2, 590, { size: 46, bg: '#fff', color: '#111', border: '#111', sc: popIn(t, a.aus, 0.3) * al }); if (t > a.troisieme - 0.05) tag(c, '3E LIEU', 830, 1250, { size: 60, bg: GOLD, color: '#111', border: '#111', sc: stampScale(t, a.troisieme) * al }); }
  }
  // résultat
  if (t > a.b6 - 0.1 && t < a.b7) {
    const al = fadeOut(t, a.b7 - 0.25, 0.25);
    if (t < a.tb6) { tag(c, 'ÎLE BRITANNIQUE', 300, 1180, { size: 40, bg: '#012169', border: '#fff', sc: popIn(t, a.b6, 0.3) * al }); if (t > a.trois - 0.1) tag(c, '3 LIEUX FRANÇAIS', W / 2, 470, { size: 66, bg: BLUE, border: '#fff', sc: stampScale(t, a.trois) * fadeOut(t, a.tb6 - 0.15, 0.15) }); if (t > a.drapeau - 0.1) { c.save(); c.globalAlpha = fadeOut(t, a.tb6 - 0.1, 0.2); sprite(c, 'flag_fr', 820, 1460, 300 * popIn(t, a.drapeau - 0.1, 0.35), { shadow: false, rot: 0.04 * Math.sin(t * 3) }); sprite(c, 'flag_uk', 240, 1460, 260 * popIn(t, a.b6, 0.35), { shadow: false, rot: 0.04 * Math.sin(t * 3 + 1) }); c.restore(); } }
    stampText(c, 'VIDE', W / 2, 520, t, a.vide, a.b7 - 0.15, { size: 140 });
  }
  // bateau, avion
  if (t > a.bateau - 0.1 && t < a.b8) {
    const al = fadeOut(t, a.b8 - 0.25, 0.25); const pC = S(...LL.cap), pS = S(...LL.SH);
    ping(c, pS.x, pS.y, t, a.bateau, 'SAINTE-HÉLÈNE', a.b8 - 0.25); ping(c, pC.x, pC.y, t, a.bateau + 0.2, 'LE CAP', a.vol - 0.2);
    if (t < a.vol) tag(c, '5 JOURS DE BATEAU', W / 2, 470, { size: 60, bg: '#0b6fa8', border: '#fff', sc: stampScale(t, a.jours) * fadeOut(t, a.vol - 0.15, 0.15) });
    else tag(c, '1ER VOL : 2017', W / 2, 470, { size: 70, bg: '#111', color: GOLD, border: GOLD, sc: stampScale(t, a.y2017) * al });
  }
  // fin
  if (t > a.savais - 0.15) {
    const s = popIn(t, a.savais - 0.15, 0.35) * (1 + 0.05 * Math.sin(t * 6)); c.save(); c.translate(W / 2, 1150); c.scale(s, s); sprite(c, 'qmark', 0, 150, 280, { shadow: false }); c.restore();
    soldier(c, 'napo_a', 190, 1460, 380, t, a.savais - 0.1);
    tag(c, 'TU LE SAVAIS ?', W / 2, 470, { size: 80, bg: '#C00E1F', border: '#fff', sc: popIn(t, a.savais, 0.3), rot: -0.03 });
    if (t > a.comm - 0.1) tag(c, 'DIS-LE EN COMMENTAIRE', W / 2, 600, { size: 48, bg: '#111', color: GOLD, border: GOLD, sc: popIn(t, a.comm, 0.3) });
    if (t > a.abo - 0.15) tag(c, 'ABONNE-TOI', 680, 1400, { size: 66, bg: '#C00E1F', border: '#fff', sc: stampScale(t, a.abo) });
  }
}
