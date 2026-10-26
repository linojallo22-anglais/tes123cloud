// scene.js — Où sont nés et morts les grands prophètes. Moteur : engine.js.
const GOLD = '#FFD23A', DARKG = '#3a2500';
const LL = { BETH: [35.2075, 31.7043], JER: [35.2296, 31.7785], UR: [46.103, 30.962], HEB: [35.110, 31.524], NIL: [31.25, 30.05], NEBO: [35.725, 31.768], MEC: [39.826, 21.423], MED: [39.611, 24.467] };
const MIDBJ = [35.218, 31.756], CIRC = [38.85, 28.25];
const CFG = {
  get jetH() { return cam_s > 40000 ? 0.72 : 1.25; }, teamCol: {}, trail: { plane: '#F7EF08' }, NAME: {}, ANCH: {}, sides: [],
  sprites: ['plane', 'f_jesus', 'f_abraham', 'f_moise', 'f_david', 'nativite', 'sepulcre', 'rayons', 'ur', 'patriarches', 'nil', 'nebo', 'tourdavid', 'kaaba', 'domevert', 'medaillon', 'qgold'],
  extraFlags: [],
};
const HEAD = { f_jesus: [0.49, 0.10], f_abraham: [0.52, 0.13], f_moise: [0.46, 0.12], f_david: [0.445, 0.127] };
let FIG = [], GLOW = [];

// ---------- fond : relief au loin, parchemin au zoom profond (Bethléem / Jérusalem) ----------
const _drawSat = drawSat;
drawSat = function (st) {
  const k = clamp((Math.log(st.s) - Math.log(16000)) / (Math.log(70000) - Math.log(16000)));
  if (k < 1) _drawSat(st);
  if (k > 0) {
    m.save(); m.globalAlpha = k; m.fillStyle = '#eadcbc'; m.fillRect(0, 0, MW, MH);
    m.globalAlpha = k * 0.14; m.fillStyle = m.createPattern(GRAIN, 'repeat'); m.fillRect(0, 0, MW, MH); m.globalAlpha = k;
    // collines stylisées (courbes de niveau ancrées sur la carte)
    let s = 777; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    m.strokeStyle = 'rgba(150,120,70,.22)'; m.lineWidth = 3;
    for (let i = 0; i < 70; i++) {
      const c = P([35.12 + r() * 0.22, 31.62 + r() * 0.26]); const rad = (0.004 + r() * 0.01) * st.s * 0.0175;
      for (let j = 1; j <= 3; j++) { m.beginPath(); m.ellipse(c[0], c[1], rad * j / 3, rad * j / 3 * 0.62, r() * 0.4, 0, 7); m.stroke(); }
    }
    // oliviers
    for (let i = 0; i < 160; i++) { const c = P([35.12 + r() * 0.22, 31.62 + r() * 0.26]); m.beginPath(); m.arc(c[0], c[1], 7 + r() * 6, 0, 7); m.fillStyle = 'rgba(110,130,70,.30)'; m.fill(); }
    // grille fine
    m.strokeStyle = 'rgba(140,110,60,.10)'; m.lineWidth = 2; m.beginPath();
    for (let lon = 35.10; lon <= 35.36; lon += 0.01) { const a = P([lon, 31.6]), b = P([lon, 31.9]); m.moveTo(a[0], a[1]); m.lineTo(b[0], b[1]); }
    for (let lat = 31.6; lat <= 31.9; lat += 0.01) { const a = P([35.1, lat]), b = P([35.36, lat]); m.moveTo(a[0], a[1]); m.lineTo(b[0], b[1]); }
    m.stroke(); m.restore();
  }
};

function setup() {
  const a = A; A.sb = 1e9;
  const nb = b => beatStart(b + 1) - 0.15;
  a.coran = T(0, 'selon', 2); a.cruc = T(0, 'crucifie'); a.eleve = T(0, 'eleve'); a.neuf = T(0, 'neuf');
  FIG = [
    { spr: 'f_jesus', name: 'JÉSUS', n: 1, t0: T(0, 'jesus'), land: T(0, 'bethleem'), end: nb(0), B: LL.BETH, D: LL.JER, bl: 'BETHLÉEM', dl: 'JÉRUSALEM', tb: T(0, 'bethleem'), td: T(0, 'jerusalem'), mb: 'nativite', md: 'sepulcre', fx: -300, fy: 250, ly: [95, -130], dist: ['9 KM', a.neuf, a.coran - 0.3], deep: 1 },
    { spr: 'f_abraham', name: 'ABRAHAM', n: 2, t0: T(1, 'abraham'), land: T(1, 'ur'), end: nb(1), B: LL.UR, D: LL.HEB, bl: 'UR · IRAK', dl: 'HÉBRON', tb: T(1, 'ur'), td: T(1, 'hebron'), mb: 'ur', md: 'patriarches', fx: -310, fy: 300, ly: [95, 95], dist: ['1 000 KM', T(1, 'mille'), nb(1) - 0.1] },
    { spr: 'f_moise', name: 'MOÏSE', n: 3, t0: T(2, 'moise'), land: T(2, 'nil'), end: nb(2), B: LL.NIL, D: LL.NEBO, bl: 'BORD DU NIL', dl: 'MONT NÉBO', tb: T(2, 'nil'), td: T(2, 'nebo'), mb: 'nil', md: 'nebo', fx: -290, fy: 300, ly: [95, 95], dist: ['470 KM', T(2, 'nebo') + 0.4, T(2, 'terre') - 0.2] },
    { spr: 'f_david', name: 'DAVID', n: 4, t0: T(3, 'david'), land: T(3, 'bethleem'), end: nb(3), B: LL.BETH, D: LL.JER, bl: 'BETHLÉEM', dl: 'JÉRUSALEM', tb: T(3, 'bethleem'), td: T(3, 'jerusalem'), mb: null, md: 'tourdavid', fx: -300, fy: 250, ly: [95, -130], dist: ['9 KM', T(3, 'jerusalem') + 0.5, T(3, 'capitale') - 0.2], deep: 1 },
    { spr: 'medaillon', name: 'MOHAMMED', n: 5, t0: T(4, 'mohammed'), land: T(4, 'mecque'), end: nb(4), B: LL.MEC, D: LL.MED, bl: 'LA MECQUE', dl: 'MÉDINE', tb: T(4, 'mecque'), td: T(4, 'medine'), mb: 'kaaba', md: 'domevert', fx: -300, fy: 230, ly: [100, -130], dist: ['340 KM', T(4, 'trois'), T(4, 'repose') - 0.1], med: 1 },
  ];
  a.b5 = beatStart(5); a.cinq = T(5, 'cinq'); a.trois = T(5, 'trois'); a.cercle = T(5, 'cercle'); a.mille = T(5, 'mille');
  a.b6 = beatStart(6); a.surpris = T(6, 'surpris'); a.comm = T(6, 'commentaire'); a.abo = T(6, 'abonne'); a.fin = TE(6, 'abonne');
  DUR = a.fin + 0.6;
  a.evang = T(0, 'evangiles'); a.anc = T(1, 'lancetre'); a.rel = T(1, 'trois'); a.trad = T(1, 'selon'); a.egy = T(2, 'egypte'); a.jor = T(2, 'jordanie'); a.terre = T(2, 'terre'); a.pers = T(2, 'personne'); a.tombe = T(2, 'tombe');
  a.comme = T(3, 'comme'); a.capit = T(3, 'capitale'); a.v570 = T(4, 'cinq'); a.v632 = T(4, 'six'); a.nord = T(4, 'nord'); a.dome = T(4, 'dome'); a.repose = T(4, 'repose');
  GLOW = [['368', T(1, 'ur'), FIG[1].end], ['818', a.egy, T(2, 'meurt')], ['400', a.jor, a.pers], ['682', T(4, 'mecque'), FIG[4].end]];

  // ---- l'avion : naissance -> mort
  const legT = [[T(0, 'meurt') + 0.1, FIG[0].td, 1], [T(1, 'irak') + 0.3, FIG[1].td, 0, 2100, 6200], [T(2, 'il', 2) - 0.1, FIG[2].td, 0, 4300, 8200], [T(3, 'jesus') + 0.25, FIG[3].td, 1], [TE(4, 'soixante') - 0.25, FIG[4].td, 0, 3700, 7600]];
  FIG.forEach((f, i) => { const [t0, t1, nf, sMid, sEnd] = legT[i]; f.L = { jet: 'plane', a: f.B, b: f.D, t0, t1, noFollow: !!nf, sMid, sEnd }; LEGS.push(f.L); });
  JETVIS = { plane: FIG.map(f => [f.L.t0 - 0.45, f.L.t1 + 1.0]) };

  // ---- caméra
  const D0 = 215000;
  const stops = [
    st(0, 0, 35.4, 31.45, 5200, { drift: 0.08 }), st(FIG[0].land - 0.05, 2.3, ...MIDBJ, D0, { drift: 0.025 }),
    st(FIG[0].L.t0 + 0.7, 0.9, MIDBJ[0], MIDBJ[1] + 0.003, 182000), st(a.neuf + 0.3, 0.8, MIDBJ[0] + 0.004, MIDBJ[1], 250000, { drift: 0.02 }), st(a.coran + 0.4, 0.9, MIDBJ[0], MIDBJ[1] - 0.005, 165000), st(a.eleve + 0.3, 0.8, MIDBJ[0], MIDBJ[1] + 0.004, 200000),
    // Abraham
    st(FIG[1].t0 + 0.9, 1.3, 40.6, 31.0, 2500, { drift: 0.02 }), st(a.trad + 0.3, 0.8, 41.5, 31.0, 3000), st(FIG[1].land + 0.35, 0.9, LL.UR[0] - 0.4, LL.UR[1] - 0.6, 6500),
    st(FIG[1].dist[1] + 0.45, 0.9, 40.6, 31.6, 2700, { drift: 0.02 }),
    // Moïse
    st(FIG[2].t0 + 0.8, 1.0, 33.4, 30.0, 3300), st(a.egy + 0.4, 0.7, 30.9, 27.6, 2700), st(FIG[2].land + 0.25, 0.7, LL.NIL[0] + 0.4, LL.NIL[1] - 0.5, 8200),
    st(a.jor + 0.35, 0.8, 36.6, 31.1, 5200), st(a.terre + 0.3, 0.8, 35.1, 31.5, 7600), st(a.tombe + 0.15, 0.7, LL.NEBO[0], LL.NEBO[1] - 0.3, 11000),
    // David
    st(FIG[3].land - 0.1, 1.5, ...MIDBJ, D0, { drift: 0.025 }), st(FIG[3].td + 0.5, 0.8, MIDBJ[0] - 0.004, MIDBJ[1], 180000), st(a.capit + 0.2, 0.6, MIDBJ[0], MIDBJ[1] + 0.004, 235000),
    // Mohammed
    st(FIG[4].t0 + 1.3, 1.5, 38.6, 24.6, 2300, { drift: 0.02 }), st(FIG[4].land + 0.3, 0.9, LL.MEC[0] + 0.3, LL.MEC[1] - 0.6, 7600),
    st(a.v632 + 0.3, 0.6, LL.MED[0] + 0.3, LL.MED[1] - 0.5, 6800), st(FIG[4].dist[1] + 0.35, 0.8, 39.8, 22.7, 4900), st(a.nord + 0.2, 0.6, 39.8, 23.0, 4300), st(a.dome + 0.1, 0.7, LL.MED[0] + 0.15, LL.MED[1] - 0.25, 14000),
    // fin
    st(a.cinq + 0.5, 1.2, CIRC[0], CIRC[1] - 0.3, 2350, { drift: 0.02 }), st(a.trois + 0.3, 0.7, CIRC[0] - 0.3, CIRC[1] - 0.6, 2650), st(a.cercle + 0.2, 0.8, CIRC[0], CIRC[1] - 1.5, 2250, { drift: 0.015 }),
    st(a.surpris + 0.1, 0.7, CIRC[0], CIRC[1] - 1.0, 2600), st(a.abo + 0.1, 0.6, CIRC[0], CIRC[1] - 1.2, 2450, { drift: 0.02 }),
  ];
  buildCam(stops);
  A.tilt = [[FIG[1].t0 + 0.2, a.trad + 0.6, 16], [FIG[2].t0 + 0.1, a.egy + 0.2, 14], [FIG[4].t0 + 0.4, FIG[4].land - 0.2, 16], [a.b5 + 0.2, a.cercle - 0.1, 18]];

  // ---- sons et actions
  ev(0, 'whoosh'); ev(0.05, 'swell');
  FIG.forEach((f, i) => {
    ev(f.t0, 'fall'); ev(f.t0 + 0.3, 'thud'); ev(f.t0 + 0.32, 'shine'); act(f.t0, f.name, 'tombe au centre');
    ev(f.tb, 'ping'); ev(f.tb + 0.05, 'pop'); act(f.tb, 'naissance', f.bl);
    if (f.mb) { ev(f.tb + 0.15, 'fall'); ev(f.tb + 0.4, 'thud'); act(f.tb + 0.15, f.mb, 'tombe'); }
    ev(f.L.t0, 'jet'); act(f.L.t0, 'avion', 'vole'); ev(f.L.t1 - 0.12, 'whoosh');
    ev(f.td, 'ping'); ev(f.td + 0.05, 'pop'); act(f.td, 'mort', f.dl);
    if (f.md) { const tm = f.med ? a.dome - 0.1 : f.td + 0.15; ev(tm, 'fall'); ev(tm + 0.28, 'thud'); act(tm, f.md, 'tombe'); }
    ev(f.dist[1], 'draw'); ev(f.dist[1] + 0.35, 'stamp'); act(f.dist[1], 'distance', f.dist[0]);
    if (i) { ev(f.t0 - 0.5, 'whoosh'); }
  });
  ev(a.evang, 'pop'); ev(a.coran, 'pop'); ev(a.cruc, 'stamp'); ev(a.eleve, 'shine'); ev(a.eleve + 0.1, 'sparkle'); act(a.eleve, 'Jésus', 'élevé vers la lumière');
  ev(a.anc, 'pop'); ev(a.rel, 'pop'); ev(a.rel + 0.25, 'pop'); ev(a.rel + 0.5, 'pop'); ev(a.trad, 'tic'); ev(T(1, 'irak'), 'scan');
  ev(a.egy, 'scan'); ev(T(2, 'nil') + 0.2, 'water'); ev(a.jor, 'scan'); ev(a.terre, 'draw'); act(a.terre, 'flèche', 'terre promise'); ev(a.pers, 'boing'); ev(a.tombe, 'stamp'); act(a.pers, '?', 'tombe inconnue');
  ev(a.comme, 'pop'); act(a.comme, 'mini Jésus', 'apparaît'); ev(a.capit, 'stamp');
  ev(T(4, 'mecque'), 'scan'); ev(a.v570, 'stamp'); ev(a.v632, 'stamp'); ev(a.nord, 'sweep'); act(a.nord, 'boussole', 'nord'); ev(a.dome + 0.2, 'shine');
  for (let i = 0; i < 5; i++) ev(a.cinq + i * 0.18, 'pop'); act(a.cinq, '5 figures', 'rangée'); ev(a.trois, 'stamp'); ev(a.cercle, 'draw'); ev(a.cercle + 0.05, 'swell'); act(a.cercle, 'cercle', 'se dessine'); ev(a.mille, 'stamp');
  ev(a.surpris - 0.1, 'boing'); act(a.surpris, '?', 'apparaît'); ev(a.comm, 'pop'); ev(a.abo, 'pop'); ev(a.abo + 0.1, 'ding');
  for (const x of [1.4, 2.0, 7.6, 10.6, 12.2, 13.0, 16.4, 17.8, 23.4, 24.6, 29.0, 30.6, 34.2, 38.2, 39.2, 41.0, 41.6, 43.9, 48.2, 49.6, 50.4, 53.8, 55.5, 56.2, 58.2, 58.9, 61.2]) ev(x, 'tic');
  window.PREVIEW = [0.3, 1.8, FIG[0].tb + 0.5, FIG[0].L.t0 + 0.5, a.neuf + 0.6, a.cruc + 0.4, a.eleve + 0.6, FIG[1].t0 + 0.6, a.rel + 0.7, FIG[1].tb + 0.5, FIG[1].L.t0 + 0.7, FIG[1].dist[1] + 0.8, FIG[2].t0 + 0.5, FIG[2].tb + 0.4, FIG[2].td + 0.6, a.terre + 0.5, a.tombe + 0.3, FIG[3].t0 + 0.6, a.comme + 0.4, a.capit + 0.3, FIG[4].t0 + 0.8, FIG[4].tb + 0.5, a.v570 + 0.3, FIG[4].L.t0 + 0.6, FIG[4].dist[1] + 0.6, a.dome + 0.5, a.cinq + 1.2, a.trois + 0.4, a.mille + 0.5, a.surpris + 0.4, a.abo + 0.3];
}

// ---------- carte : pays allumés, trajectoires gardées ----------
function mapOver(t) {
  for (const [id, t0, t1] of GLOW) {
    if (t < t0 || t > t1 + 0.4) continue; const al = clamp((t - t0) / 0.3) * fadeOut(t, t1, 0.4); const fl = Math.max(0, 1 - (t - t0) / 0.5);
    m.save(); pathM(geomOf(id)); m.globalAlpha = al * (0.2 + 0.25 * fl); m.fillStyle = GOLD; m.fill();
    m.globalAlpha = al; m.lineJoin = 'round'; m.lineWidth = 4; m.strokeStyle = GOLD; m.shadowColor = GOLD; m.shadowBlur = 16; m.stroke(); m.restore();
  }
  for (const L of LEGS) {
    if (t < L.t1 || (cam_s > 30000 && !L.noFollow)) continue; m.save(); m.globalAlpha = 0.85 * clamp((t - L.t1) / 0.6); m.beginPath();
    for (let i = 0; i <= 40; i++) { const p = P(d3.geoInterpolate(L.a, L.b)(i / 40)); i ? m.lineTo(p[0], p[1]) : m.moveTo(p[0], p[1]); }
    m.lineWidth = 4; m.strokeStyle = '#f5b82e'; m.shadowColor = '#000'; m.shadowBlur = 6; m.lineCap = 'round'; m.stroke(); m.restore();
  }
  // cercle final
  if (t > A.cercle - 0.05) {
    const ring = d3.geoCircle().center(CIRC).radius(1000 / 6371 * 180 / Math.PI).precision(2)().coordinates[0];
    const u = easeOut(prog(t, A.cercle - 0.05, 0.9)); const n = Math.max(2, Math.round(ring.length * u));
    m.save(); m.beginPath(); for (let i = 0; i < n; i++) { const p = P(ring[i]); i ? m.lineTo(p[0], p[1]) : m.moveTo(p[0], p[1]); }
    m.lineWidth = 9; m.strokeStyle = GOLD; m.shadowColor = GOLD; m.shadowBlur = 26; m.setLineDash([]); m.stroke();
    if (u >= 1) { m.closePath(); m.globalAlpha = 0.12 * clamp((t - A.cercle - 0.9) / 0.4); m.fillStyle = GOLD; m.fill(); }
    m.restore();
  }
}

// ---------- calque écran : outils ----------
function glowAt(c, x, y, r, col, al) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col.replace('A', al)); g.addColorStop(1, col.replace('A', 0)); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); }
// figure : halo derrière, sprite, lumière sur le visage voilé
function figure(c, f, x, y, h, al, sq = 1) {
  c.save(); c.globalAlpha *= al;
  glowAt(c, x, y - h * 0.5, h * 0.62, 'rgba(255,214,120,A)', 0.55);
  if (f.med) { medallion(c, x, y - h / 2, h); c.restore(); return; }
  const img = SPR[f.spr]; const w = h * img.width / img.height; const hd = HEAD[f.spr];
  const hx = x + (hd[0] - 0.5) * w, hy = y - h * (1 - hd[1]);
  glowAt(c, hx, hy, h * 0.2, 'rgba(255,255,255,A)', 1);
  c.save(); c.translate(x, y); c.scale(1 / sq, sq); c.drawImage(img, -w / 2, -h, w, h); c.restore();
  if (f.spr !== 'f_jesus') { c.save(); c.globalCompositeOperation = 'lighter'; glowAt(c, hx, hy, h * 0.11, 'rgba(255,250,235,A)', 0.55); c.restore(); }
  else { c.save(); c.globalCompositeOperation = 'lighter'; glowAt(c, hx, hy - h * 0.01, h * 0.12, 'rgba(255,220,140,A)', 0.25); c.restore(); }
  c.restore();
}
// médaillon : uniquement la calligraphie, aucune image
function medallion(c, x, y, h) {
  const img = SPR.medaillon; const w = h * img.width / img.height; c.drawImage(img, x - w / 2, y - h / 2, w, h);
  c.save(); c.translate(x, y); c.textAlign = 'center'; c.textBaseline = 'middle'; c.direction = 'rtl';
  c.font = `700 ${h * 0.27}px Amiri`; c.lineJoin = 'round'; c.lineWidth = h * 0.018; c.strokeStyle = '#5a3a06'; c.strokeText('محمد', 0, -h * 0.04); c.fillStyle = '#f6d77c'; c.fillText('محمد', 0, -h * 0.04);
  c.font = `700 ${h * 0.12}px Amiri`; c.strokeText('ﷺ', 0, h * 0.17); c.fillText('ﷺ', 0, h * 0.17); c.restore();
}
// chute avec écrasement + poussière
function dropY(t, t0, d = 0.32) { return t < t0 + d ? -1 + easeIn((t - t0) / d) : 0; }
function squash(t, t0, d = 0.32) { const x = t - t0 - d; return x < 0 || x > 0.3 ? 1 : 1 - 0.16 * Math.sin(x / 0.3 * Math.PI) * (1 - x / 0.3); }
function dust(c, x, y, t, t0, wd) { const u = (t - t0) / 0.5; if (u < 0 || u > 1) return; c.save(); c.globalAlpha = 0.55 * (1 - u); c.fillStyle = '#efe2c4'; for (const s of [-1, 1]) for (let i = 0; i < 4; i++) { c.beginPath(); c.arc(x + s * (wd * 0.3 + u * wd * (0.4 + i * 0.15)), y - 10 - i * 8 * u, 18 * (1 - u * 0.5) + i * 4, 0, 7); c.fill(); } c.restore(); }
function dropSpr(c, name, x, y, h, t, t0, t1) {
  if (t < t0 || t > t1 + 0.3) return; const dy = dropY(t, t0) * 700; const sq = squash(t, t0); const al = fadeOut(t, t1, 0.3) * clamp((t - t0) / 0.1) * edgeA({ x, y });
  c.save(); c.globalAlpha *= al; if (dy === 0) { c.save(); c.scale(1, 0.25); c.beginPath(); c.ellipse(x, y * 4, h * 0.45, h * 0.45, 0, 0, 7); c.fillStyle = 'rgba(0,0,0,.3)'; c.fill(); c.restore(); }
  const img = SPR[name]; const w = h * img.width / img.height; c.translate(x, y + dy); c.scale(1 / sq, sq); c.drawImage(img, -w / 2, -h, w, h); c.restore();
  dust(c, x, y, t, t0 + 0.32, w);
}
const edgeA = p => clamp((1460 - p.y) / 100) * clamp((p.y - 380) / 100) * (1 - clamp((360 - (p.x ?? 999)) / 80) * clamp((p.y - 930) / 80));
function pin(c, p, kind, city, t, t0, t1, ly) {
  if (t < t0 || t > t1 + 0.3) return; const s = popIn(t, t0, 0.35); const al = fadeOut(t, t1, 0.3) * edgeA(p); const col = kind === 'NAISSANCE' ? '#1d4fd8' : '#8a1c2b';
  c.save(); c.globalAlpha *= al;
  const wave = ((t - t0) % 0.9) / 0.9; c.beginPath(); c.arc(p.x, p.y, 20 + 60 * wave, 0, 7); c.lineWidth = 5; c.strokeStyle = `rgba(255,210,58,${0.8 * (1 - wave)})`; c.stroke();
  c.save(); c.translate(p.x, p.y); c.scale(s, s); c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 12;
  c.beginPath(); c.arc(0, 0, 19, 0, 7); c.fillStyle = col; c.fill(); c.lineWidth = 6; c.strokeStyle = GOLD; c.stroke(); c.restore();
  const y = p.y + ly; const sc = popIn(t, t0 + 0.05, 0.3);
  c.save(); c.translate(clamp(p.x, 240, 840), y); c.scale(sc, sc);
  tag(c, kind, 0, ly > 0 ? -2 : 52, { size: 30, bg: col, border: GOLD, weight: 900 });
  txt(c, typed(city, t, t0 + 0.1, 0.3), 0, ly > 0 ? 56 : -8, { size: 54, weight: 900, color: '#fff', stroke: '#000', sw: 10 });
  c.restore(); c.restore();
}
function distTag(c, A, B, label, t, t0, t1, side = 1) {
  if (t < t0 || t > t1 + 0.3) return; const al = fadeOut(t, t1, 0.3); const p = easeOut(prog(t, t0, 0.35));
  c.save(); c.globalAlpha *= al; c.lineCap = 'round'; c.setLineDash([20, 14]); c.lineDashOffset = -t * 40;
  c.beginPath(); c.moveTo(A.x, A.y); c.lineTo(lerp(A.x, B.x, p), lerp(A.y, B.y, p)); c.lineWidth = 11; c.strokeStyle = '#1b1300'; c.stroke(); c.lineWidth = 6; c.strokeStyle = GOLD; c.stroke(); c.setLineDash([]);
  if (p >= 1) {
    const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2; const dx = B.x - A.x, dy = B.y - A.y, L = Math.hypot(dx, dy) || 1; const nx = -dy / L * side, ny = dx / L * side;
    tag(c, label, clamp(mx + nx * 120, 200, 880), clamp(my + ny * 120, 450, 1380), { size: 64, bg: '#111', color: GOLD, border: GOLD, weight: 900, sc: stampScale(t, t0 + 0.35) });
  }
  c.restore();
}
function title(c, f, t) {
  if (t < f.t0 || t > f.end + 0.3) return; const al = fadeOut(t, f === FIG[0] ? A.eleve - 0.3 : f.end, 0.3); const s = popIn(t, f.t0, 0.35);
  c.save(); c.globalAlpha *= al; c.translate(W / 2, 300); c.scale(s, s);
  tag(c, f.n + ' / 5', 0, -88, { size: 30, bg: 'rgba(0,0,0,.55)', color: GOLD, border: GOLD, weight: 900 });
  c.shadowColor = 'rgba(255,200,80,.8)'; c.shadowBlur = 30; txt(c, f.name, 0, 8, { size: 112, weight: 900, color: GOLD, stroke: DARKG, sw: 14, shadow: false });
  c.restore();
}
// position de la figure : héros au centre, puis posée près de sa ville de naissance
function figPos(f, t) {
  const hero = { x: W / 2, y: 1340, h: f.med ? 560 : 660 }; const an = f.med ? { x: 175, y: 1430, h: 280 } : { x: 170, y: 1465, h: 400 };
  const u = ease(prog(t, f.land, 0.6)); return { x: lerp(hero.x, an.x, u), y: lerp(hero.y, an.y, u), h: lerp(hero.h, an.h, u) };
}

function screenUnder(c, t) {
  const a = A;
  FIG.forEach((f, i) => {
    if (t < f.t0 - 0.05 || t > f.end + 0.3) return; const out = fadeOut(t, f.end, 0.3);
    const pB = S(...f.B), pD = S(...f.D); c.save(); c.globalAlpha = out;
    const jesusUp = i === 0 ? clamp((t - a.eleve + 0.4) / 0.4) : 0; // au moment « élevé », la carte s'efface
    c.globalAlpha = out * (1 - jesusUp);
    // monuments
    if (f.mb) dropSpr(c, f.mb, clamp(pB.x + 270, 200, 900), pB.y + (f.deep ? 135 : 30), f.deep ? 200 : 210, t, f.tb + 0.12, f.end);
    if (f.md && !f.med) dropSpr(c, f.md, clamp(pD.x + 270, 200, 900), pD.y + (f.deep ? -15 : 30), f.deep ? 200 : 210, t, f.td + 0.12, f.end);
    if (f.med) dropSpr(c, 'domevert', clamp(pD.x + 250, 200, 880), pD.y + 40, 260, t, a.dome - 0.1, f.end);
    // distance
    const [lab, d0, d1] = f.dist; distTag(c, pB, pD, lab, t, d0, d1, f.deep || f.med ? -1 : 1);
    pin(c, pB, 'NAISSANCE', f.bl, t, f.tb, f.end, f.ly[0]); pin(c, pD, 'MORT', f.dl, t, f.td, f.end, f.ly[1]);
    c.restore();
  });
}

function screenScene(c, t) {
  const a = A;
  FIG.forEach((f, i) => {
    if (t < f.t0 || t > f.end + 0.3) return; const out = fadeOut(t, f.end, 0.3);
    title(c, f, t);
    // la figure tombe au centre puis va se poser à sa naissance
    let { x, y, h } = figPos(f, t); const dy = dropY(t, f.t0, 0.3) * 1500; const sq = squash(t, f.t0, 0.3);
    if (i === 0 && t > a.eleve - 0.4) { const u = ease(prog(t, a.eleve - 0.4, 1.1)); x = lerp(x, W / 2, u); y = lerp(y, 1060, u); h = lerp(h, 520, u); }
    figure(c, f, x, y + dy + 5 * Math.sin(t * 3), h, out * clamp((t - f.t0) / 0.08), sq); dust(c, x, y, t, f.t0 + 0.3, h * 0.6);
  });
  // Jésus : Évangiles / Coran / élevé
  if (t < FIG[0].end + 0.3) {
    const o = fadeOut(t, a.eleve - 0.3, 0.3);
    if (t > a.evang - 0.05 && t < a.coran) tag(c, 'SELON LES ÉVANGILES', W / 2, 470, { size: 48, bg: '#1f3f8a', border: GOLD, weight: 900, sc: popIn(t, a.evang, 0.3) * fadeOut(t, a.coran - 0.3, 0.3) });
    if (t > a.coran - 0.05) { c.save(); c.globalAlpha = o; tag(c, 'SELON LE CORAN', W / 2, 470, { size: 48, bg: '#0f6b3f', border: GOLD, weight: 900, sc: popIn(t, a.coran, 0.3) }); if (t > a.cruc) tag(c, 'PAS CRUCIFIÉ', W / 2 + 60, 1340, { size: 46, bg: '#fff', color: '#111', border: '#111', weight: 900, sc: stampScale(t, a.cruc), rot: -0.04 }); c.restore(); }
    if (t > a.eleve - 0.3) {
      const u = easeOut(prog(t, a.eleve - 0.3, 0.6)); c.save(); c.globalAlpha = u * fadeOut(t, FIG[0].end, 0.3);
      c.save(); c.globalCompositeOperation = 'lighter'; glowAt(c, W / 2, 520, 620, 'rgba(255,225,150,A)', 0.55); c.restore();
      sprite(c, 'rayons', W / 2, 720 - 40 * (1 - u), 520, { shadow: false }); tag(c, 'ÉLEVÉ AUPRÈS DE DIEU', W / 2, 1290, { size: 46, bg: '#0f6b3f', border: GOLD, weight: 900, sc: popIn(t, a.eleve + 0.1, 0.3) }); c.restore();
    }
  }
  // Abraham : 3 religions
  if (t > a.rel - 0.05 && t < FIG[1].land) {
    const o = fadeOut(t, FIG[1].land - 0.3, 0.3); c.save(); c.globalAlpha = o;
    tag(c, "L'ANCÊTRE COMMUN", W / 2, 470, { size: 44, bg: '#111', color: GOLD, border: GOLD, weight: 900, sc: popIn(t, a.anc, 0.3) });
    ['JUDAÏSME', 'CHRISTIANISME', 'ISLAM'].forEach((s, k) => tag(c, s, W / 2 + (k - 1) * 330, 565, { size: 36, bg: ['#1f3f8a', '#7a1f2b', '#0f6b3f'][k], border: '#fff', weight: 900, sc: popIn(t, a.rel + k * 0.25, 0.3) }));
    c.restore();
  }
  if (t > a.anc - 0.05 && t < a.rel) tag(c, "L'ANCÊTRE COMMUN", W / 2, 470, { size: 44, bg: '#111', color: GOLD, border: GOLD, weight: 900, sc: popIn(t, a.anc, 0.3) });
  // Moïse : Terre promise, tombe inconnue
  if (t > a.terre - 0.1 && t < FIG[2].end + 0.3) {
    const p = S(...LL.NEBO); const o = fadeOut(t, FIG[2].end, 0.3); c.save(); c.globalAlpha = o;
    if (t < a.pers + 0.2) { arrowTo(c, p.x, p.y - 40, p.x - 300, p.y - 150, t, a.terre - 0.1, a.pers, GOLD); tag(c, 'TERRE PROMISE', clamp(p.x - 300, 230, 850), p.y - 240, { size: 44, bg: '#111', color: GOLD, border: GOLD, weight: 900, sc: popIn(t, a.terre + 0.3, 0.3) * fadeOut(t, a.pers, 0.2) }); }
    if (t > a.pers) { const s = popIn(t, a.pers, 0.35) * (1 + 0.05 * Math.sin(t * 6)); c.save(); c.translate(clamp(p.x, 200, 880), p.y - 60); c.scale(s, s); sprite(c, 'qgold', 0, 0, 230, { shadow: false }); c.restore(); }
    stampText(c, 'TOMBE INCONNUE', W / 2, 470, t, a.tombe, FIG[2].end, { col: '#8a1c2b', size: 62 });
    c.restore();
  }
  // David : comme Jésus, capitale
  if (t > a.comme - 0.05 && t < FIG[3].end + 0.3) {
    const p = S(...LL.BETH); const o = fadeOut(t, FIG[3].td - 0.1, 0.3); c.save(); c.globalAlpha = o;
    figure(c, FIG[0], clamp(p.x + 270, 200, 900), p.y + 260 + 4 * Math.sin(t * 3), 250 * popIn(t, a.comme, 0.35), 1);
    tag(c, 'COMME JÉSUS', W / 2, 470, { size: 48, bg: '#111', color: GOLD, border: GOLD, weight: 900, sc: popIn(t, a.comme + 0.05, 0.3) }); c.restore();
    stampText(c, 'SA CAPITALE', W / 2, 470, t, a.capit, FIG[3].end, { col: '#b07a00', size: 64 });
  }
  // Mohammed : dates, nord
  if (t > a.v570 - 0.05 && t < FIG[4].end + 0.3) {
    const o = fadeOut(t, FIG[4].end, 0.3); c.save(); c.globalAlpha = o;
    if (t < FIG[4].L.t0) tag(c, 'VERS 570', W / 2, 470, { size: 60, bg: '#1d4fd8', border: GOLD, weight: 900, sc: stampScale(t, a.v570) * fadeOut(t, FIG[4].L.t0 - 0.2, 0.2) });
    if (t > a.v632 - 0.05 && t < FIG[4].dist[1]) tag(c, 'EN 632', W / 2, 470, { size: 60, bg: '#8a1c2b', border: GOLD, weight: 900, sc: stampScale(t, a.v632) * fadeOut(t, FIG[4].dist[1] - 0.2, 0.2) });
    if (t > a.nord - 0.05 && t < a.repose) { const s = popIn(t, a.nord, 0.3) * fadeOut(t, a.repose - 0.2, 0.2); c.save(); c.translate(900, 560); c.scale(s, s); c.beginPath(); c.arc(0, 0, 70, 0, 7); c.fillStyle = 'rgba(0,0,0,.55)'; c.fill(); c.lineWidth = 5; c.strokeStyle = GOLD; c.stroke(); c.beginPath(); c.moveTo(0, -52); c.lineTo(22, 18); c.lineTo(0, 6); c.lineTo(-22, 18); c.closePath(); c.fillStyle = GOLD; c.fill(); txt(c, 'N', 0, -100, { size: 50, weight: 900, color: GOLD, stroke: '#000', sw: 8 }); c.restore(); }
    if (t > a.dome - 0.05) tag(c, 'SOUS LE DÔME VERT', W / 2, 470, { size: 50, bg: '#0f6b3f', border: GOLD, weight: 900, sc: popIn(t, a.dome + 0.1, 0.3) });
    c.restore();
  }
  // fin : 5 figures, 3 religions, cercle
  if (t > a.cinq - 0.05) {
    const o = fadeOut(t, a.surpris - 0.2, 0.3); c.save(); c.globalAlpha = o;
    FIG.forEach((f, k) => { const x = 130 + k * 205, s = popIn(t, a.cinq + k * 0.18, 0.35); if (s <= 0) return; figure(c, f, x, f.med ? 560 : 610, (f.med ? 170 : 250) * s, 1); txt(c, f.name, x, 645, { size: 30, weight: 900, color: GOLD, stroke: '#000', sw: 7 }); });
    if (t > a.trois - 0.05) tag(c, '3 RELIGIONS', W / 2, 270, { size: 62, bg: '#111', color: GOLD, border: GOLD, weight: 900, sc: stampScale(t, a.trois) });
    else tag(c, '5 GRANDES FIGURES', W / 2, 270, { size: 58, bg: '#111', color: GOLD, border: GOLD, weight: 900, sc: popIn(t, a.cinq, 0.3) });
    c.restore();
    if (t > a.mille - 0.05) {
      const ce = S(...CIRC), ed = S(CIRC[0] + 1000 / 6371 * 180 / Math.PI / Math.cos(CIRC[1] * Math.PI / 180), CIRC[1]); const p = easeOut(prog(t, a.mille - 0.05, 0.35));
      c.save(); c.globalAlpha = fadeOut(t, DUR, 0.3); c.setLineDash([18, 12]); c.lineWidth = 7; c.strokeStyle = GOLD; c.beginPath(); c.moveTo(ce.x, ce.y); c.lineTo(lerp(ce.x, ed.x, p), lerp(ce.y, ed.y, p)); c.stroke(); c.setLineDash([]);
      c.beginPath(); c.arc(ce.x, ce.y, 12, 0, 7); c.fillStyle = GOLD; c.fill();
      if (t < a.surpris - 0.2) tag(c, '1 000 KM', (ce.x + ed.x) / 2, (ce.y + ed.y) / 2 + 62, { size: 60, bg: '#111', color: GOLD, border: GOLD, weight: 900, sc: stampScale(t, a.mille + 0.2) });
      c.restore();
    }
  }
  if (t > a.surpris - 0.15) {
    const s = popIn(t, a.surpris - 0.15, 0.35) * (1 + 0.05 * Math.sin(t * 6)); c.save(); c.translate(W / 2, 760); c.scale(s, s); sprite(c, 'qgold', 0, 0, 300, { shadow: false }); c.restore();
    tag(c, 'LEQUEL T\'A SURPRIS ?', W / 2, 360, { size: 56, bg: '#C00E1F', border: '#fff', weight: 900, sc: popIn(t, a.surpris, 0.3), rot: -0.03 });
    if (t > a.comm - 0.1) tag(c, 'DIS-LE EN COMMENTAIRE', W / 2, 900, { size: 46, bg: '#111', color: GOLD, border: GOLD, weight: 900, sc: popIn(t, a.comm, 0.3) });
    if (t > a.abo - 0.15) tag(c, 'ABONNE-TOI', W / 2, 1290, { size: 66, bg: '#C00E1F', border: '#fff', sc: stampScale(t, a.abo) });
  }
}
