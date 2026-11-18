// scene.js — Les 4 domaines nationaux français à Jérusalem. Moteur : engine.js.
const GOLD = '#FFD23A';
const LL = { paris: [2.35, 48.86], SA: [35.2363, 31.7812], EL: [35.2445, 31.7786], TR: [35.2297, 31.7885], AG: [35.1105, 31.8065] };
const OLD = [[35.2262, 31.7792], [35.2300, 31.7807], [35.2366, 31.7818], [35.2372, 31.7780], [35.2363, 31.7738], [35.2318, 31.7722], [35.2280, 31.7728], [35.2262, 31.7760], [35.2262, 31.7792]];
const CFG = {
  get jetH() { return cam_s > 40000 ? 0.75 : 1.2; }, teamCol: { f: '#3b7bff' }, trail: { plane: '#F7EF08' }, NAME: {}, ANCH: {}, sides: [],
  sprites: ['plane', 'ste_anne', 'eleona', 'tombeau', 'abougosh', 'gend_a', 'gend_b', 'suit', 'sultan', 'key', 'flag_fr', 'olive', 'wall', 'qmark'],
  extraFlags: ['fr'],
};
let SITES = [];

// fond : relief au loin, parchemin au zoom profond
const _drawSat = drawSat;
drawSat = function (st) {
  const k = clamp((Math.log(st.s) - Math.log(16000)) / (Math.log(70000) - Math.log(16000)));
  if (k < 1) _drawSat(st);
  if (k > 0) {
    m.save(); m.globalAlpha = k; m.fillStyle = '#eadcbc'; m.fillRect(0, 0, MW, MH);
    m.globalAlpha = k * 0.14; m.fillStyle = m.createPattern(GRAIN, 'repeat'); m.fillRect(0, 0, MW, MH); m.globalAlpha = k;
    let s = 777; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    m.strokeStyle = 'rgba(150,120,70,.20)'; m.lineWidth = 3;
    for (let i = 0; i < 260; i++) { const c = P([34.3 + r() * 1.8, 31.2 + r() * 1.2]); const rad = (0.001 + r() * 0.006) * st.s * 0.0175; for (let j = 1; j <= 3; j++) { m.beginPath(); m.ellipse(c[0], c[1], rad * j / 3, rad * j / 3 * 0.62, r() * 0.4, 0, 7); m.stroke(); } }
    for (let i = 0; i < 900; i++) { const c = P([34.3 + r() * 1.8, 31.2 + r() * 1.2]); m.beginPath(); m.arc(c[0], c[1], 6 + r() * 6, 0, 7); m.fillStyle = 'rgba(110,130,70,.28)'; m.fill(); }
    m.strokeStyle = 'rgba(140,110,60,.10)'; m.lineWidth = 2; m.beginPath();
    const g = st.s > 300000 ? 0.002 : 0.01;
    const L0 = st.s > 300000 ? [35.18, 35.30, 31.74, 31.82] : [34.3, 36.1, 31.2, 32.4];
    for (let lon = L0[0]; lon <= L0[1]; lon += g) { const a = P([lon, L0[2]]), b = P([lon, L0[3]]); m.moveTo(a[0], a[1]); m.lineTo(b[0], b[1]); }
    for (let lat = L0[2]; lat <= L0[3]; lat += g) { const a = P([L0[0], lat]), b = P([L0[1], lat]); m.moveTo(a[0], a[1]); m.lineTo(b[0], b[1]); }
    m.stroke();
    // remparts de la vieille ville
    m.beginPath(); OLD.forEach((p, i) => { const q = P(p); i ? m.lineTo(q[0], q[1]) : m.moveTo(q[0], q[1]); }); m.closePath();
    m.fillStyle = 'rgba(214,170,90,.30)'; m.fill(); m.lineJoin = 'round'; m.lineWidth = clamp(st.s / 60000, 2, 16); m.strokeStyle = 'rgba(120,80,30,.85)'; m.stroke();
    m.restore();
  }
};

function setup() {
  const a = A; A.sb = 1e9;
  a.fr0 = T(0, 'france'); a.quatre = T(0, 'quatre'); a.jer = T(0, 'jerusalem'); a.cote = T(0, 'un'); a.dom = T(0, 'domaines');
  a.b1 = beatStart(1); a.sa = T(1, 'sainteanne'); a.y1856 = T(1, 'mille'); a.sultan = T(1, 'sultan'); a.nap = T(1, 'napoleon'); a.crimee = T(1, 'crimee');
  a.b2 = beatStart(2); a.el = T(2, 'leleona'); a.oliv = T(2, 'oliviers'); a.trad = T(2, 'selon'); a.np = T(2, 'notre');
  a.b3 = beatStart(3); a.tr = T(3, 'tombeau'); a.roche = T(3, 'roche'); a.ans = T(3, 'deux');
  a.b4 = beatStart(4); a.ag = T(4, 'dabou'); a.crois = T(4, 'croises');
  a.b5 = beatStart(5); a.gend = T(5, 'gendarmes'); a.lieux = T(5, 'lieux');
  a.b6 = beatStart(6); a.chirac = T(6, 'jacques'); a.refuse = T(6, 'refuse'); a.soldats = T(6, 'soldats'); a.y2020 = T(6, 'en', 2); a.macron = T(6, 'emmanuel'); a.sortez = T(6, 'sortez');
  a.b7 = beatStart(7); a.y2024 = T(7, 'deux'); a.arr = T(7, 'arretes'); a.min = T(7, 'ministre'); a.ref7 = T(7, 'refuse');
  a.b8 = beatStart(8); a.bout = T(8, 'bout'); a.comm = T(8, 'commentaire'); a.abo = T(8, 'abonnetoi'); a.fin = TE(8, 'abonnetoi');
  DUR = a.fin + 0.6;
  SITES = [['SA', 'SAINTE-ANNE', 'ste_anne', a.sa, 1], ['EL', 'ÉLÉONA', 'eleona', a.el, 2], ['TR', 'TOMBEAU DES ROIS', 'tombeau', a.tr, 3], ['AG', 'ABOU GOSH', 'abougosh', a.ag, 4]];
  C('250', a.fr0, 'f');

  // ---- avion : Paris -> Jérusalem, puis de lieu en lieu
  LEGS.push({ jet: 'plane', a: LL.paris, b: LL.SA, t0: a.fr0 + 0.5, t1: a.jer, sMid: 650, sEnd: 30000 });
  LEGS.push({ jet: 'plane', a: LL.SA, b: LL.EL, t0: a.b2 - 0.9, t1: a.el, noFollow: true });
  LEGS.push({ jet: 'plane', a: LL.EL, b: LL.TR, t0: a.b3 - 0.6, t1: a.tr, noFollow: true });
  LEGS.push({ jet: 'plane', a: LL.TR, b: LL.AG, t0: a.b4 - 0.2, t1: a.ag + 0.1, sMid: 60000, sEnd: 750000 });
  JETVIS = { plane: [[a.fr0 + 0.3, a.jer + 0.8], [a.b2 - 1.0, a.b5 - 0.2]] };

  // ---- caméra
  const D = 950000, mid = (p, q) => [(LL[p][0] + LL[q][0]) / 2, (LL[p][1] + LL[q][1]) / 2];
  buildCam([
    st(0, 0, 2.6, 46.6, 1500, { drift: 0.05 }),
    st(a.cote + 0.4, 0.8, 35.17, 31.79, 90000, { drift: 0.03 }),
    st(a.dom + 0.3, 0.7, 35.2, 31.795, 75000),
    st(a.sa + 0.2, 1.0, LL.SA[0], LL.SA[1] - 0.0012, D, { drift: 0.02 }),
    st(a.y1856 + 0.3, 0.7, LL.SA[0] - 0.0005, LL.SA[1] - 0.0010, 820000),
    st(a.nap + 0.2, 0.7, LL.SA[0], LL.SA[1] - 0.0014, 1000000),
    st(a.crimee + 0.2, 0.6, LL.SA[0] + 0.0005, LL.SA[1] - 0.0012, 900000),
    st(a.el - 0.2, 0.9, ...mid('SA', 'EL'), 720000),
    st(a.oliv + 0.2, 0.7, LL.EL[0], LL.EL[1] - 0.0012, 1000000),
    st(a.trad + 0.6, 0.8, LL.EL[0] + 0.0004, LL.EL[1] - 0.0013, 860000),
    st(a.np + 0.2, 0.7, LL.EL[0], LL.EL[1] - 0.0010, 1150000),
    st(a.tr - 0.1, 0.9, ...mid('EL', 'TR'), 620000),
    st(a.roche + 0.2, 0.7, LL.TR[0], LL.TR[1] - 0.0012, 1000000),
    st(a.ans + 0.2, 0.6, LL.TR[0], LL.TR[1] - 0.0010, 1200000),
    st(a.crois + 0.2, 0.6, LL.AG[0], LL.AG[1] - 0.0012, 880000),
    st(a.b5 + 0.4, 1.0, 35.175, 31.795, 45000, { drift: 0.03 }),
    st(a.lieux + 0.2, 0.7, 35.18, 31.795, 55000),
    st(a.chirac + 0.1, 1.0, LL.SA[0], LL.SA[1] - 0.0012, D, { drift: 0.02 }),
    st(a.soldats + 0.2, 0.7, LL.SA[0] - 0.0005, LL.SA[1] - 0.0010, 820000),
    st(a.y2020 + 0.3, 0.6, LL.SA[0] + 0.0004, LL.SA[1] - 0.0011, 1020000),
    st(a.macron + 0.2, 0.7, LL.SA[0], LL.SA[1] - 0.0013, 800000),
    st(a.sortez + 0.1, 0.5, LL.SA[0], LL.SA[1] - 0.0012, 1300000),
    st(a.b7 + 0.6, 1.0, LL.EL[0], LL.EL[1] - 0.0012, D),
    st(a.arr + 0.2, 0.6, LL.EL[0], LL.EL[1] - 0.0011, 1150000),
    st(a.min + 0.2, 0.7, LL.EL[0] - 0.0005, LL.EL[1] - 0.0012, 900000),
    st(a.b8 + 0.5, 1.1, 35.18, 31.795, 60000, { drift: 0.03 }),
    st(a.comm + 0.2, 0.7, 35.19, 31.795, 70000),
    st(a.fin + 0.5, 0.8, 35.19, 31.795, 62000, { drift: 0.03 }),
  ]);
  A.tilt = [[a.cote - 0.3, a.b1, 16], [a.b3 - 0.3, a.roche, 14], [a.b5 - 0.2, a.chirac, 14], [a.b8 - 0.2, a.comm, 12]];

  // ---- sons et actions
  ev(0, 'whoosh'); ev(a.fr0, 'scan'); act(a.fr0, 'France', 'drapeau'); ev(a.quatre, 'pop'); ev(a.jer, 'ping');
  for (const Lg of LEGS) { ev(Lg.t0, 'jet'); act(Lg.t0, 'avion', 'vole'); ev(Lg.t1 - 0.1, 'whoosh'); }
  ev(a.cote, 'ping'); ev(a.dom, 'stamp'); act(a.dom, 'clé', 'apparaît');
  SITES.forEach(([k, n, spr, t0]) => { ev(t0, 'ping'); ev(t0 + 0.12, 'fall'); ev(t0 + 0.42, 'thud'); act(t0, spr, 'tombe'); });
  ev(a.y1856, 'stamp'); ev(a.sultan, 'pop'); act(a.sultan, 'sultan', 'tend la clé'); ev(a.nap, 'pop'); ev(a.crimee, 'stamp');
  ev(a.oliv, 'pop'); act(a.oliv, 'olivier', 'pousse'); ev(a.np, 'shine'); ev(a.roche, 'thud'); ev(a.ans, 'count'); ev(a.crois, 'stamp');
  ev(a.gend, 'pop'); act(a.gend, 'gendarmes', 'gardent'); ev(a.lieux, 'ding');
  ev(a.b6 - 0.2, 'whoosh'); ev(a.b6, 'stamp'); ev(a.refuse, 'boing'); act(a.refuse, 'homme en costume', 'pointe la porte'); ev(a.y2020, 'stamp'); ev(a.sortez, 'impact'); act(a.sortez, 'tampon', 'Sortez');
  ev(a.y2024, 'stamp'); ev(a.arr, 'alarm'); act(a.arr, 'gendarme', 'stop'); ev(a.ref7, 'stamp');
  ev(a.b8, 'boing'); act(a.b8, '?', 'apparaît'); ev(a.comm, 'pop'); ev(a.abo, 'pop'); ev(a.abo + 0.1, 'ding');
  fillGaps();
  window.PREVIEW = [0.4, a.fr0 + 0.8, a.jer + 0.4, a.cote + 0.6, a.dom + 0.5, a.sa + 0.6, a.y1856 + 0.3, a.sultan + 0.6, a.crimee + 0.3, a.el + 0.6, a.oliv + 0.4, a.np + 0.3, a.tr + 0.6, a.ans + 0.3, a.ag + 0.6, a.crois + 0.3, a.gend + 0.5, a.lieux + 0.4, a.chirac + 0.5, a.refuse + 0.5, a.macron + 0.4, a.sortez + 0.4, a.y2024 + 0.4, a.arr + 0.5, a.ref7 + 0.4, a.bout + 0.3, a.abo + 0.4];
}
function fillGaps() { const ts = EVENTS.map(e => e[0]).sort((x, y) => x - y); for (let i = 1; i < ts.length; i++) for (let t = ts[i - 1] + 1.2; t < ts[i] - 0.3; t += 1.2) ev(t, 'tic'); }

// ---------- outils ----------
function dropY(t, t0, d = 0.32) { return t < t0 + d ? -1 + easeIn((t - t0) / d) : 0; }
function squash(t, t0, d = 0.32) { const x = t - t0 - d; return x < 0 || x > 0.3 ? 1 : 1 - 0.16 * Math.sin(x / 0.3 * Math.PI) * (1 - x / 0.3); }
function dust(c, x, y, t, t0, wd) { const u = (t - t0) / 0.5; if (u < 0 || u > 1) return; c.save(); c.globalAlpha = 0.55 * (1 - u); c.fillStyle = '#efe2c4'; for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(x + s * (wd * 0.3 + u * wd * (0.4 + i * 0.15)), y - 10 - i * 8 * u, 18 * (1 - u * 0.5) + i * 4, 0, 7); c.fill(); } c.restore(); }
const edgeA = p => clamp((1470 - p.y) / 90) * clamp((p.y - 360) / 90) * clamp((p.x + 60) / 90) * clamp((W + 60 - p.x) / 90);
function dropSpr(c, name, x, y, h, t, t0, t1) {
  if (t < t0 || t > t1 + 0.3) return; const dy = dropY(t, t0) * 700; const sq = squash(t, t0); const al = fadeOut(t, t1, 0.3) * clamp((t - t0) / 0.1) * edgeA({ x, y });
  c.save(); c.globalAlpha *= al; if (dy === 0) { c.save(); c.scale(1, 0.25); c.beginPath(); c.ellipse(x, y * 4, h * 0.45, h * 0.45, 0, 0, 7); c.fillStyle = 'rgba(0,0,0,.3)'; c.fill(); c.restore(); }
  const img = SPR[name]; const w = h * img.width / img.height; c.translate(x, y + dy); c.scale(1 / sq, sq); c.drawImage(img, -w / 2, -h, w, h); c.restore();
  dust(c, x, y, t, t0 + 0.32, w);
}
function sitePin(c, k, label, n, t, t0, t1, o = {}) {
  if (t < t0 || t > t1 + 0.3) return; const p = S(...LL[k]); const al = fadeOut(t, t1, 0.3) * edgeA(p); if (al <= 0.01) return; const s = popIn(t, t0, 0.35) * (o.small ? 0.75 : 1);
  c.save(); c.globalAlpha *= al; const wv = ((t - t0) % 0.9) / 0.9; c.beginPath(); c.arc(p.x, p.y, 22 + 60 * wv, 0, 7); c.lineWidth = 5; c.strokeStyle = `rgba(255,210,58,${0.8 * (1 - wv)})`; c.stroke();
  c.translate(p.x, p.y); c.scale(s, s); c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 12; c.beginPath(); c.arc(0, 0, 30, 0, 7); c.fillStyle = '#fff'; c.fill(); c.shadowColor = 'transparent';
  c.save(); c.beginPath(); c.arc(0, 0, 25, 0, 7); c.clip(); if (FL.fr) c.drawImage(FL.fr, -34, -25, 68, 50); c.restore(); c.lineWidth = 4; c.strokeStyle = GOLD; c.beginPath(); c.arc(0, 0, 30, 0, 7); c.stroke();
  txt(c, String(n), 0, -48, { size: 34, weight: 900, color: GOLD, stroke: '#1b1300', sw: 8 });
  if (label && !o.noLabel) txt(c, typed(label, t, t0 + 0.05, 0.35), 0, o.ly ?? 64, { size: o.small ? 40 : 50, weight: 900, color: '#fff', stroke: '#000', sw: 10 });
  c.restore();
}

function screenUnder(c, t) {
  const a = A;
  if (cam_s > 300000) { const p = S(35.2318, 31.7768); const q = S(35.2455, 31.7745); c.save(); c.globalAlpha = 0.85 * edgeA(p); txt(c, 'VIEILLE VILLE', p.x, p.y, { size: 40, weight: 800, font: 'Caveat', color: '#5a3a10', shadow: false }); c.globalAlpha = 0.85 * edgeA(q); txt(c, 'Mont des Oliviers', q.x, q.y + 40, { size: 44, weight: 700, font: 'Caveat', color: '#4a5a20', shadow: false }); c.restore(); }
  // lieux : épingles + monuments
  SITES.forEach(([k, label, spr, t0, n], i) => {
    const t1 = i < 3 ? SITES[i + 1][3] - 0.3 : a.b5 - 0.2; const p = S(...LL[k]);
    dropSpr(c, spr, clamp(p.x + 250, 230, 860), p.y + 40, 280, t, t0 + 0.12, t1);
    sitePin(c, k, label, n, t, t0, t1);
  });
  // vue d'ensemble : les 4 drapeaux
  for (const [t0, t1] of [[a.jer + 0.1, a.b1 - 0.2], [a.b5, a.chirac - 0.1], [a.b8, DUR]]) { sitePin(c, 'SA', 'JÉRUSALEM', '×3', t, t0, t1, { ly: -110 }); sitePin(c, 'AG', 'ABOU GOSH', '×1', t, t0 + 0.2, t1, { ly: 70 }); }
  // Chirac / Macron : Sainte-Anne ; 2024 : Éléona
  if (t > a.b6 - 0.1 && t < a.b7) { const p = S(...LL.SA); c.save(); c.globalAlpha = fadeOut(t, a.b7 - 0.2, 0.25); sprite(c, 'ste_anne', clamp(p.x + 250, 230, 860), p.y + 40, 280, { shadow: false }); c.restore(); sitePin(c, 'SA', 'SAINTE-ANNE', 1, t, a.b6, a.b7 - 0.2); }
  if (t > a.b7 - 0.1 && t < a.b8) { const p = S(...LL.EL); c.save(); c.globalAlpha = fadeOut(t, a.b8 - 0.2, 0.25); sprite(c, 'eleona', clamp(p.x + 250, 230, 860), p.y + 40, 280, { shadow: false }); c.restore(); sitePin(c, 'EL', 'ÉLÉONA', 2, t, a.b7, a.b8 - 0.2); }
}

function screenScene(c, t) {
  const a = A;
  if (t > a.quatre - 0.05 && t < a.jer) tag(c, '4 LIEUX', W / 2, 470, { size: 90, bg: '#1d3a8a', border: GOLD, sc: popIn(t, a.quatre, 0.3) * fadeOut(t, a.jer - 0.15, 0.15) });
  if (t > a.jer - 0.05 && t < a.dom) tag(c, '3 À JÉRUSALEM + 1 À CÔTÉ', W / 2, 470, { size: 54, bg: '#1d3a8a', border: GOLD, sc: popIn(t, a.jer, 0.3) * fadeOut(t, a.dom - 0.15, 0.15) });
  if (t > a.dom - 0.1 && t < a.b1 + 0.2) { const al = fadeOut(t, a.b1, 0.25); tag(c, 'DOMAINES NATIONAUX FRANÇAIS', W / 2, 470, { size: 48, bg: BLUE, border: GOLD, sc: stampScale(t, a.dom) * al }); c.save(); c.globalAlpha = al; const s = popIn(t, a.dom + 0.1, 0.35); c.translate(W / 2, 1230); c.scale(s, s); c.rotate(-0.1 + 0.08 * Math.sin(t * 3)); sprite(c, 'key', 0, 60, 120, { shadow: false }); c.restore(); }
  // Sainte-Anne
  if (t > a.y1856 - 0.05 && t < a.b2) {
    const al = fadeOut(t, a.b2 - 0.25, 0.25);
    tag(c, '1856', W / 2, 470, { size: 90, bg: '#7a1f2b', border: GOLD, sc: stampScale(t, a.y1856) * al });
    if (t > a.sultan - 0.1) { c.save(); c.globalAlpha = al; soldier(c, 'sultan', 210, 1460, 400, t, a.sultan - 0.1); c.restore(); tag(c, 'LE SULTAN OTTOMAN', 230, 1010, { size: 38, bg: '#7a1f2b', border: '#fff', sc: popIn(t, a.sultan, 0.3) * al }); }
    if (t > a.nap - 0.05) tag(c, '→ NAPOLÉON III', 760, 1180, { size: 50, bg: BLUE, border: '#fff', sc: popIn(t, a.nap, 0.3) * al });
    if (t > a.crimee - 0.05) tag(c, 'APRÈS LA GUERRE DE CRIMÉE', W / 2, 580, { size: 40, bg: '#fff', color: '#111', border: '#111', sc: popIn(t, a.crimee, 0.3) * al });
  }
  // Éléona
  if (t > a.oliv - 0.1 && t < a.b3) {
    const al = fadeOut(t, a.b3 - 0.25, 0.25); c.save(); c.globalAlpha = al; sprite(c, 'olive', 230, 1460, 300 * popIn(t, a.oliv - 0.1, 0.35), { shadow: false, rot: 0.03 * Math.sin(t * 2) }); c.restore();
    tag(c, 'MONT DES OLIVIERS', W / 2, 470, { size: 56, bg: '#4a5a20', border: '#fff', sc: popIn(t, a.oliv, 0.3) * fadeOut(t, a.np - 0.15, 0.15) });
    if (t > a.np - 0.1) { c.save(); c.globalCompositeOperation = 'lighter'; const g = c.createRadialGradient(W / 2, 470, 0, W / 2, 470, 380); g.addColorStop(0, `rgba(255,220,140,${0.4 * al})`); g.addColorStop(1, 'rgba(255,220,140,0)'); c.fillStyle = g; c.fillRect(0, 100, W, 760); c.restore(); tag(c, 'LE NOTRE PÈRE', W / 2, 470, { size: 70, bg: GOLD, color: '#111', border: '#111', sc: popIn(t, a.np, 0.3) * al }); }
  }
  // Tombeau des Rois
  if (t > a.roche - 0.1 && t < a.b4) { const al = fadeOut(t, a.b4 - 0.25, 0.25); tag(c, 'CREUSÉ DANS LA ROCHE', W / 2, 470, { size: 56, bg: '#7a5a2a', border: '#fff', sc: popIn(t, a.roche, 0.3) * fadeOut(t, a.ans - 0.15, 0.15) }); if (t > a.ans - 0.1) counter(c, 2000, t, a.ans - 0.1, a.ans + 0.5, W / 2, 480, { size: 130, pre: '≈ ', label: 'ANS', until: a.b4 - 0.25 }); }
  // Abou Gosh
  stampText(c, 'ÉGLISE DES CROISÉS', W / 2, 470, t, a.crois, a.b5 - 0.15, { size: 64, col: '#7a1f2b' });
  // gendarmes
  if (t > a.gend - 0.1 && t < a.b6 + 0.2) { const al = fadeOut(t, a.b6, 0.25); c.save(); c.globalAlpha = al; soldier(c, 'gend_a', 250, 1460, 380, t, a.gend - 0.1); soldier(c, 'gend_a', 830, 1460, 380, t, a.gend + 0.1, { ph: 1 }); sprite(c, 'flag_fr', W / 2, 1450, 330 * popIn(t, a.gend + 0.3, 0.35), { shadow: false, rot: 0.03 * Math.sin(t * 3) }); c.restore(); tag(c, 'GENDARMES FRANÇAIS', W / 2, 470, { size: 58, bg: BLUE, border: '#fff', sc: popIn(t, a.gend, 0.3) * al }); }
  // 1996 / 2020
  if (t > a.b6 - 0.1 && t < a.b7) {
    const al = fadeOut(t, a.b7 - 0.25, 0.25);
    if (t < a.y2020) { tag(c, '1996 · JACQUES CHIRAC', W / 2, 470, { size: 50, bg: '#111', color: GOLD, border: GOLD, sc: stampScale(t, a.b6) * fadeOut(t, a.y2020 - 0.15, 0.15) }); if (t > a.refuse - 0.1) tag(c, 'REFUSE D\'ENTRER', W / 2, 580, { size: 46, bg: '#fff', color: '#111', border: '#111', sc: popIn(t, a.refuse, 0.3) * fadeOut(t, a.y2020 - 0.15, 0.15) }); }
    else tag(c, '2020 · EMMANUEL MACRON', W / 2, 470, { size: 48, bg: '#111', color: GOLD, border: GOLD, sc: stampScale(t, a.y2020) * al });
    if (t > a.refuse - 0.1) { c.save(); c.globalAlpha = al; sprite(c, 'suit', 260, 1460, 400 * popIn(t, a.refuse - 0.1, 0.3), { shadow: false }); c.restore(); }
    stampText(c, '« SORTEZ ! »', W / 2, 1180, t, a.sortez, a.b7 - 0.15, { size: 110 });
  }
  // 2024
  if (t > a.b7 - 0.1 && t < a.b8) {
    const al = fadeOut(t, a.b8 - 0.25, 0.25);
    tag(c, '2024', W / 2, 470, { size: 90, bg: '#111', color: GOLD, border: GOLD, sc: stampScale(t, a.y2024) * fadeOut(t, a.arr - 0.15, 0.15) });
    if (t > a.arr - 0.1) { c.save(); c.globalAlpha = al; sprite(c, 'gend_b', 250, 1460, 400 * popIn(t, a.arr - 0.1, 0.3), { shadow: false, rot: 0.03 * Math.sin(t * 6) }); c.restore(); tag(c, '2 GENDARMES ARRÊTÉS', W / 2, 470, { size: 56, bg: '#e01b24', border: '#fff', sc: popIn(t, a.arr, 0.3) * al }); }
    stampText(c, 'LE MINISTRE REFUSE D\'ENTRER', W / 2, 1200, t, a.ref7, a.b8 - 0.15, { size: 50, col: BLUE });
  }
  // fin
  if (t > a.b8 - 0.15) {
    const s = popIn(t, a.b8 - 0.15, 0.35) * (1 + 0.05 * Math.sin(t * 6)); c.save(); c.translate(W / 2, 1200); c.scale(s, s); sprite(c, 'qmark', 0, 150, 280, { shadow: false }); c.restore();
    tag(c, 'UN BOUT DE JÉRUSALEM ?', W / 2, 470, { size: 60, bg: '#C00E1F', border: '#fff', sc: popIn(t, a.b8, 0.3), rot: -0.03 });
    if (t > a.comm - 0.1) tag(c, 'DIS-LE EN COMMENTAIRE', W / 2, 600, { size: 46, bg: '#111', color: GOLD, border: GOLD, sc: popIn(t, a.comm, 0.3) });
    if (t > a.abo - 0.15) tag(c, 'ABONNE-TOI', W / 2, 1360, { size: 70, bg: '#C00E1F', border: '#fff', sc: stampScale(t, a.abo) });
  }
}
