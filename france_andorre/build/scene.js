// scene.js — Team France vs Team Andorre (scénario imaginaire). Moteur : engine.js.
const ADR = '#d52b1e';
const P_ = { paris: [2.35, 48.86], elysee: [2.3166, 48.8704], andorre: [1.52, 42.507], centre: [1.58, 42.545], urgell: [1.4593, 42.3584], pas: [1.7333, 42.5426], madrid: [-3.7, 40.42] };
const CFG = {
  teamCol: { f: '#3b7bff', a: '#ff4b4b', g: '#9aa0a6', h: '#c9ccd1' },
  trail: { jet_fr: '#F7EF08' },
  NAME: { '250': 'FRANCE', '020': 'ANDORRE', '724': 'ESPAGNE' },
  ANCH: { '250': [2.4, 46.8], '020': [1.58, 42.545], '724': [-3.5, 40.3] },
  sides: [[-1, BLUE, 'TEAM FRANCE', 'f', 'fr'], [1, ADR, 'TEAM ANDORRE', 'a', 'ad']],
  sprites: ['jet_fr', 'sol_fr_a', 'sol_fr_b', 'pol_a', 'pol_b', 'sol_es', 'eveque', 'president', 'couronnes', 'village', 'telesiege', 'caddie', 'flag_ad', 'metre', 'eglise', 'euro', 'eu', 'qmark', 'stamp', 'shield_crack'],
  extraFlags: ['eu', 'fr', 'ad', 'es'],
};
let BORDER = [], PEAKS = [];
// Paris (105 km²) en ellipse : 7,5 km × 4,45 km ; 4 Paris entiers + un demi dans Andorre
const PARIS_SPOTS = [[1.52, 42.608, 1], [1.68, 42.588, 1], [1.5, 42.528, 1], [1.655, 42.512, 1], [1.56, 42.458, 0.5]];

function prepBorder() {
  const ad = WORLD.c10['020']; const ring = (ad.type === 'MultiPolygon' ? ad.coordinates[0] : ad.coordinates)[0];
  const fr = WORLD.c10['250']; const fv = []; (fr.type === 'MultiPolygon' ? fr.coordinates : [fr.coordinates]).forEach(P2 => P2[0].forEach(v => { if (v[0] > 1.2 && v[0] < 2.0 && v[1] > 42.3 && v[1] < 42.8) fv.push(v); }));
  const near = ring.map(v => fv.some(u => Math.abs(u[0] - v[0]) < 0.012 && Math.abs(u[1] - v[1]) < 0.012));
  let s = near.findIndex((x, i) => x && !near[(i - 1 + near.length) % near.length]); if (s < 0) s = 0;
  for (let i = 0; i < ring.length; i++) { const k = (s + i) % ring.length; if (!near[k]) break; BORDER.push(ring[k]); }
  // montagnes des Pyrénées (crête approchée)
  let h = 7; const rnd = () => (h = (h * 16807) % 2147483647) / 2147483647;
  for (let lon = -1.9; lon <= 3.2; lon += 0.075) for (let lat = 42.0; lat <= 43.2; lat += 0.06) {
    const ridge = 42.86 - 0.1 * (lon + 1); const d = Math.abs(lat - ridge); if (d > 0.34) continue;
    PEAKS.push([lon + (rnd() - 0.5) * 0.05, lat + (rnd() - 0.5) * 0.04, 0.6 + 0.6 * rnd() * (1 - d / 0.4)]);
  }
  PEAKS.sort((x, y) => y[1] - x[1]);
}

function setup() {
  const a = A; prepBorder();
  a.fr0 = T(0, 'france'); a.ad0 = T(0, 'andorre'); a.qui = T(0, 'qui'); a.tf = T(0, 'team'); a.contre = T(0, 'contre'); a.ta = T(0, 'team', 2);
  a.b1 = beatStart(1); a.deux = T(1, 'deux'); a.pres = T(1, 'president'); a.rep = T(1, 'republique'); a.y1607 = T(1, 'mille'); a.chef = T(1, 'chef', 2); a.copr = T(1, 'coprince'); a.att = T(1, 'france'); a.propre = T(1, 'propre');
  a.b2 = beatStart(2); a.armee = T(2, 'armee'); a.pas = T(2, 'pas'); a.n331 = T(2, 'trois'); a.n89 = T(2, 'quatrevingtneuf'); a.monnaie = T(2, 'monnaie'); a.euro = T(2, 'leuro');
  a.b3 = beatStart(3); a.conf = T(3, 'confiee'); a.esp = T(3, 'lespagne'); a.donc = T(3, 'donc'); a.def = T(3, 'defendre'); a.fr3 = T(3, 'france', 2); a.otan = T(3, 'lotan');
  a.b4 = beatStart(4); a.ev1 = T(4, 'eveque'); a.urg = T(4, 'durgell'); a.ta4 = T(4, 'team'); a.ev2 = T(4, 'eveque', 2);
  a.b5 = beatStart(5); a.n468 = T(5, 'quatre'); a.x45 = T(5, 'quatre', 2); a.paris = T(5, 'paris');
  a.b6 = beatStart(6); a.n57 = T(6, 'cinquantesept'); a.chaque = T(6, 'chaque'); a.n9 = T(6, 'neuf'); a.courses = T(6, 'courses');
  a.b7 = beatStart(7); a.guerre = T(7, 'guerre'); a.dirige = T(7, 'dirige'); a.pres7 = T(7, 'president');
  a.b8 = beatStart(8); a.tf8 = T(8, 'team'); a.ta8 = T(8, 'team', 2); a.comm = T(8, 'commentaire'); a.abo = T(8, 'abonnetoi'); a.fin = TE(8, 'abonnetoi');
  a.sb = a.ta + 0.35; DUR = a.fin + 0.6; a.big = [[a.b8 + 0.1, DUR + 1]];

  // ---- pays
  C('250', a.fr0, 'f', { named: true }); C('020', a.ad0, 'a', { named: true }); SCORE.f.push([a.fr0, 1]); SCORE.a.push([a.ad0, 1]);
  C('724', a.esp, 'a', { named: true }); SCORE.a.push([a.esp, 1]); C('724', a.b4, 'x');
  SCORE.a.push([a.ev2, 1]);

  // ---- vol Paris → Andorre
  LEGS.push({ jet: 'jet_fr', a: P_.paris, b: P_.andorre, t0: a.att - 0.05, t1: a.propre + 0.5, sMid: 2600, sEnd: 9000 });
  JETVIS = { jet_fr: [[a.att - 0.3, a.b2 + 0.4]] };

  // ---- caméra
  buildCam([
    st(0, 0, 2.2, 46.3, 1500, { drift: 0.05 }),
    st(a.ad0 + 0.9, 1.0, 1.58, 42.6, 32000, { drift: 0.03 }),
    st(a.qui + 0.5, 0.7, 1.6, 42.7, 22000),
    st(a.tf + 0.4, 0.9, 1.9, 44.0, 3000),
    st(a.ta + 0.3, 0.8, 1.6, 42.9, 9000),
    st(a.b1 + 0.3, 0.8, 1.2, 43.0, 5000),
    st(a.deux + 0.4, 0.8, 1.58, 42.62, 26000),
    st(a.pres + 0.4, 1.0, 2.0, 46.5, 1900),
    st(a.rep + 0.3, 0.7, 2.35, 48.6, 5500),
    st(a.y1607 + 0.3, 0.9, 2.0, 46.0, 1700),
    st(a.chef + 0.2, 0.7, 2.1, 45.3, 2100),
    st(a.copr + 0.3, 1.0, 1.58, 42.62, 40000, { drift: 0.02 }),
    st(a.att - 0.05, 0.6, 2.2, 47.5, 2400),
    st(a.b2 + 0.4, 0.9, 1.58, 42.6, 30000, { drift: 0.03 }),
    st(a.pas + 0.2, 0.7, 1.56, 42.64, 36000),
    st(a.n331 + 0.3, 0.8, 1.6, 42.6, 28000),
    st(a.n89 + 0.2, 0.7, 1.55, 42.62, 34000),
    st(a.monnaie + 0.3, 0.8, 1.6, 42.65, 24000),
    st(a.b3 + 0.4, 1.0, 0.0, 41.5, 3200, { drift: 0.04 }),
    st(a.conf + 0.3, 0.8, 1.5, 43.5, 3800),
    st(a.esp + 0.2, 0.8, -2.0, 38.6, 2600),
    st(a.def + 0.2, 0.8, 1.0, 42.6, 4500),
    st(a.fr3 + 0.2, 0.7, 1.4, 43.4, 3800),
    st(a.otan + 0.3, 0.9, 2, 46, 900),
    st(a.b4 + 0.5, 1.0, 1.48, 42.42, 30000, { drift: 0.03 }),
    st(a.urg + 0.2, 0.7, 1.46, 42.38, 38000),
    st(a.ta4 + 0.2, 0.8, 1.55, 42.5, 26000),
    st(a.ev2 + 0.2, 0.7, 1.52, 42.48, 31000),
    st(a.b5 + 0.4, 0.9, 1.58, 42.56, 48000, { drift: 0.02 }),
    st(a.x45 + 0.2, 0.8, 1.58, 42.54, 56000, { drift: 0.02 }),
    st(a.b6 + 0.4, 1.0, 1.6, 42.6, 36000),
    st(a.n57 + 0.6, 0.8, 1.62, 42.62, 42000),
    st(a.chaque + 0.3, 0.9, 1.72, 42.56, 30000),
    st(a.n9 + 0.3, 0.8, 1.73, 42.55, 38000),
    st(a.courses + 0.2, 0.7, 1.7, 42.56, 30000),
    st(a.b7 + 0.3, 0.9, 1.8, 44.2, 2600, { drift: 0.04 }),
    st(a.guerre + 0.2, 0.8, 1.9, 45.0, 1500),
    st(a.dirige + 0.2, 0.8, 2.0, 46.5, 1900),
    st(a.pres7 + 0.3, 0.9, 2.3166, 48.869, 40000, { drift: 0.02 }),
    st(a.tf8 + 0.2, 1.1, 1.9, 45.5, 1700),
    st(a.ta8 + 0.2, 0.8, 1.7, 44.0, 2600),
    st(a.abo + 0.1, 0.8, 1.9, 45.0, 1900),
    st(a.fin + 0.5, 0.7, 1.9, 45.0, 2000, { drift: 0.04 }),
  ]);
  A.tilt = [[a.ad0 - 0.4, a.qui + 0.6, 20], [a.b2 - 0.3, a.n89, 18], [a.b4 - 0.3, a.urg + 0.5, 16], [a.chaque - 0.3, a.courses, 16]];

  // ---- sons et actions
  ev(0, 'whoosh'); ev(a.fr0, 'scan'); ev(a.fr0 + 0.05, 'pop'); act(a.fr0, 'France', 'drapeau'); ev(a.ad0 - 0.2, 'whoosh'); ev(a.ad0 + 0.3, 'scan'); ev(a.ad0 + 0.4, 'pop'); act(a.ad0, 'Andorre', 'drapeau'); ev(a.qui, 'boing'); ev(a.tf, 'pop'); ev(a.contre, 'stamp'); ev(a.ta, 'pop'); ev(a.sb, 'pop');
  act(a.tf, 'soldat français', 'agite le drapeau'); act(a.ta, 'policier andorran', 'pose');
  ev(a.b1, 'boing'); ev(a.deux, 'sparkle'); act(a.deux, 'couronnes', 'pop'); ev(a.pres, 'whoosh'); ev(a.pres + 0.3, 'pop'); act(a.pres, 'président', 'arrive'); ev(a.rep, 'ping'); ev(a.y1607, 'photo'); act(a.y1607, 'parchemin', '1607'); ev(a.copr - 0.2, 'whoosh'); ev(a.copr, 'stamp');
  ev(a.att, 'jet'); act(a.att, 'Rafale', 'vole vers Andorre'); ev(a.propre, 'impact'); act(a.propre, 'président', 'tampon');
  ev(a.b2, 'pop'); act(a.b2, 'policier', 'arrive'); ev(a.armee, 'boing'); ev(a.pas, 'stamp'); act(a.pas, 'policier', 'panique'); ev(a.n331, 'count'); ev(a.n89, 'count'); ev(a.n89 + 0.2, 'pop'); act(a.n89, 'village', 'pop'); ev(a.monnaie, 'boing'); ev(a.euro, 'sparkle'); act(a.euro, 'pièce euro', 'tombe');
  ev(a.b3 - 0.2, 'whoosh'); ev(a.conf, 'pop'); ev(a.esp, 'scan'); ev(a.esp + 0.05, 'pop'); act(a.esp, 'soldat espagnol', 'arrive'); ev(a.def, 'impact'); act(a.def, 'flèche', 'Espagne vers France'); ev(a.otan, 'stamp'); ev(a.otan + 0.1, 'shine');
  ev(a.b4 - 0.2, 'whoosh'); ev(a.ev1, 'pop'); act(a.ev1, 'évêque', 'arrive'); ev(a.urg, 'ping'); act(a.urg, 'La Seu d\'Urgell', 'ping'); ev(a.ta4, 'boing'); ev(a.ev2, 'ding'); act(a.ev2, 'évêque', 'rejoint la team');
  ev(a.b5, 'whoosh'); ev(a.n468, 'count'); act(a.n468, 'compteur', '468'); ev(a.x45, 'pop'); PARIS_SPOTS.forEach((p, k) => ev(a.x45 + k * 0.18, 'tic')); act(a.x45, 'Paris x4,5', 'posés'); ev(a.paris, 'stamp');
  ev(a.b6, 'draw'); act(a.b6, 'frontière', 'se dessine'); ev(a.n57, 'count'); ev(a.chaque, 'whoosh'); ev(a.n9, 'count'); act(a.n9, 'caddie', 'roule'); ev(a.courses, 'pop');
  ev(a.b7, 'stamp'); ev(a.guerre, 'impact'); act(a.guerre, 'soldat vs policier', 'face à face'); ev(a.dirige, 'boing'); ev(a.pres7, 'ping'); ev(a.pres7 + 0.4, 'stamp'); act(a.pres7, 'président', 'chef des deux');
  ev(a.tf8 - 0.2, 'whoosh'); ev(a.tf8, 'pop'); ev(a.ta8, 'pop'); ev(a.comm, 'pop'); ev(a.abo, 'pop'); ev(a.abo + 0.1, 'ding'); act(a.tf8, 'équipes', 'face à face');
  fillGaps();
  window.PREVIEW = [0.4, a.ad0 + 0.8, a.contre + 0.4, a.deux + 0.5, a.pres + 0.5, a.y1607 + 0.5, a.copr + 0.5, a.att + 1.0, a.propre + 0.4, a.pas + 0.4, a.n331 + 0.6, a.n89 + 0.6, a.euro + 0.3, a.esp + 0.5, a.def + 0.6, a.otan + 0.5, a.ev1 + 0.5, a.urg + 0.4, a.ev2 + 0.4, a.n468 + 0.8, a.paris + 0.4, a.n57 + 0.5, a.n9 + 0.6, a.guerre + 0.4, a.pres7 + 0.6, a.tf8 + 0.4, a.abo + 0.4];
}
function fillGaps() { const ts = EVENTS.map(e => e[0]).sort((x, y) => x - y); for (let i = 1; i < ts.length; i++) for (let t = ts[i - 1] + 1.2; t < ts[i] - 0.3; t += 1.2) ev(t, 'tic'); }

// ---------- carte ----------
function mapUnder(t) {
  // relief des Pyrénées : rangées de sommets enneigés quand on est près
  const al = clamp((cam_s - 6000) / 6000); if (al <= 0) return;
  const kpx = cam_s * Math.PI / 180; m.save(); m.globalAlpha = al * 0.9;
  for (const [lon, lat, sz] of PEAKS) {
    const p = P([lon, lat]); if (p[0] < -100 || p[0] > MW + 100 || p[1] < -100 || p[1] > MH + 100) continue;
    const h = 0.05 * sz * kpx, w = h * 1.3; if (h < 4) continue; const x = p[0], y = p[1];
    m.beginPath(); m.moveTo(x - w / 2, y); m.lineTo(x, y - h); m.lineTo(x + w / 2, y); m.closePath(); m.fillStyle = '#6b5236'; m.fill();
    m.beginPath(); m.moveTo(x, y - h); m.lineTo(x + w / 2, y); m.lineTo(x + w * 0.1, y); m.closePath(); m.fillStyle = 'rgba(0,0,0,.25)'; m.fill();
    m.beginPath(); m.moveTo(x - w * 0.18, y - h * 0.64); m.lineTo(x, y - h); m.lineTo(x + w * 0.18, y - h * 0.64); m.lineTo(x + w * 0.06, y - h * 0.7); m.lineTo(x - w * 0.05, y - h * 0.6); m.closePath(); m.fillStyle = '#fff'; m.fill();
  }
  m.restore();
}
function mapOver(t) {
  const a = A;
  // Paris à vraie taille dans Andorre
  if (t > a.x45 - 0.1 && t < a.b6 + 0.3) {
    const al = fadeOut(t, a.b6, 0.3); const ky = 4.45 / 111.2, kx = 7.5 / (111.32 * Math.cos(42.55 * Math.PI / 180));
    PARIS_SPOTS.forEach(([lon, lat, f], k) => {
      const t0 = a.x45 + k * 0.18; if (t < t0) return; const s = Math.min(1, popIn(t, t0, 0.3));
      const ring = []; const n = 48; for (let i = 0; i <= n; i++) { const th = (f === 1 ? 2 * Math.PI : Math.PI) * i / n + (f === 1 ? 0 : Math.PI / 2); ring.push([lon + kx * s * Math.cos(th), lat + ky * s * Math.sin(th)]); } if (f !== 1) ring.push(ring[0]);
      m.save(); m.globalAlpha = al; m.beginPath(); ring.forEach((v, i) => { const p = P(v); i ? m.lineTo(p[0], p[1]) : m.moveTo(p[0], p[1]); }); m.closePath();
      m.fillStyle = 'rgba(31,93,255,.55)'; m.fill(); m.lineWidth = 6; m.strokeStyle = '#fff'; m.stroke();
      const c0 = P([lon - (f === 1 ? 0 : kx * 0.4), lat]); m.font = `900 ${Math.round(clamp(cam_s / 1300, 22, 46))}px Poppins`; m.textAlign = 'center'; m.textBaseline = 'middle'; m.lineWidth = 7; m.strokeStyle = '#000'; m.strokeText(f === 1 ? 'PARIS' : '½', c0[0], c0[1]); m.fillStyle = '#fff'; m.fillText(f === 1 ? 'PARIS' : '½', c0[0], c0[1]);
      m.restore();
    });
  }
  if (t > a.x45 - 0.1 && t < a.b6 + 0.3) { m.save(); m.globalAlpha = fadeOut(t, a.b6, 0.3) * clamp((t - a.x45) / 0.3); pathM(WORLD.c10['020']); m.setLineDash([16, 10]); m.lineWidth = 7; m.strokeStyle = '#FFE928'; m.stroke(); m.restore(); }
  // frontière Andorre–France
  if (t > a.b6 - 0.05 && t < a.chaque + 0.3 && BORDER.length > 1) {
    const al = fadeOut(t, a.chaque, 0.3); const n = Math.max(2, Math.round(BORDER.length * easeOut(prog(t, a.b6, 1.0))));
    m.save(); m.globalAlpha = al; m.beginPath(); BORDER.slice(0, n).forEach((v, i) => { const p = P(v); i ? m.lineTo(p[0], p[1]) : m.moveTo(p[0], p[1]); });
    m.lineCap = 'round'; m.lineJoin = 'round'; m.lineWidth = 18; m.strokeStyle = '#1b1300'; m.stroke(); m.lineWidth = 11; m.strokeStyle = '#FFE928'; m.shadowColor = '#FFE928'; m.shadowBlur = 18; m.stroke(); m.restore();
  }
}

// ---------- calque écran ----------
function parchment(c, x, y, w, h, lines, t, t0, t1) {
  if (t < t0 || t > t1 + 0.3) return; const s = popIn(t, t0, 0.35) * fadeOut(t, t1, 0.3);
  c.save(); c.translate(x, y); c.scale(s, s); c.rotate(-0.04); c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 20; rr(c, -w / 2, -h / 2, w, h, 16); c.fillStyle = '#f3e2b8'; c.fill(); c.shadowColor = 'transparent'; c.lineWidth = 6; c.strokeStyle = '#8a6a2f'; c.stroke();
  lines.forEach(([s2, sz, col], i) => txt(c, s2, 0, -h / 2 + 70 + i * (sz + 22), { size: sz, color: col || '#3a2500', weight: 900, shadow: false }));
  c.restore();
}
function drop(c, name, x, y, h, t, t0, o = {}) { if (t < t0 - 0.4) return; const dy = t < t0 ? -800 * (1 - easeIn(prog(t, t0 - 0.4, 0.4))) : 0; const sq = t > t0 && t < t0 + 0.2 ? 1 - 0.12 * Math.sin(Math.PI * (t - t0) / 0.2) : 1; sprite(c, name, x, y + dy, h, { shadow: false, sy: sq, rot: o.rot }); }
function screenScene(c, t) {
  const a = A;
  // accroche
  if (t > a.qui && t < a.tf + 0.2) { const s = popIn(t, a.qui, 0.3) * fadeOut(t, a.tf - 0.1, 0.25); c.save(); c.translate(W / 2, 560); c.scale(s, s); sprite(c, 'qmark', 0, 150, 300, { shadow: false }); c.restore(); }
  if (t > a.tf - 0.1 && t < a.b1 + 0.3) {
    const al = fadeOut(t, a.b1, 0.3); c.save(); c.globalAlpha = al;
    waver(c, 'sol_fr', 230, 1440, 380, t, a.tf - 0.1, 0); tag(c, 'TEAM FRANCE', 230, 1010, { size: 50, bg: BLUE, border: '#fff', sc: popIn(t, a.tf, 0.3) });
    if (t > a.ta - 0.1) { soldier(c, 'pol_a', 850, 1440, 390, t, a.ta - 0.1, { ph: 1 }); tag(c, 'TEAM ANDORRE', 850, 1010, { size: 48, bg: ADR, border: '#fff', sc: popIn(t, a.ta, 0.3) }); }
    if (t > a.contre) { c.save(); c.translate(540, 1200); const s = stampScale(t, a.contre); c.scale(s, s); c.shadowColor = '#ffd23a'; c.shadowBlur = 40; txt(c, 'VS', 0, 0, { size: 200, weight: 900, color: '#FFE928', stroke: '#3a2500', sw: 18, shadow: false }); c.restore(); }
    c.restore();
  }
  // le problème : 2 chefs
  if (t > a.b1 - 0.05 && t < a.deux) tag(c, 'LE PROBLÈME ?', W / 2, 470, { size: 72, bg: '#111', border: '#fff', sc: popIn(t, a.b1, 0.3) * fadeOut(t, a.deux - 0.15, 0.15) });
  if (t > a.deux - 0.1 && t < a.pres) { const s = popIn(t, a.deux - 0.1, 0.35) * fadeOut(t, a.pres - 0.2, 0.2); c.save(); c.translate(W / 2, 1380); c.scale(s, s); c.rotate(0.04 * Math.sin(t * 4)); sprite(c, 'couronnes', 0, 0, 260, { shadow: false }); c.restore(); tag(c, '2 CHEFS', W / 2, 470, { size: 80, bg: ADR, border: '#fff', sc: popIn(t, a.deux, 0.3) * fadeOut(t, a.pres - 0.2, 0.2) }); }
  if (t > a.pres - 0.1 && t < a.att) {
    const al = fadeOut(t, a.att - 0.25, 0.25); c.save(); c.globalAlpha = al; soldier(c, 'president', 800, 1470, 420, t, a.pres - 0.1); c.restore();
    if (t > a.rep - 0.1 && t < a.copr) { const p = S(...P_.paris); ping(c, p.x, p.y, t, a.rep, 'ÉLYSÉE', a.y1607 - 0.1); }
    if (t < a.y1607) tag(c, 'LE PRÉSIDENT FRANÇAIS', W / 2, 470, { size: 56, bg: BLUE, border: '#fff', sc: popIn(t, a.pres, 0.3) * fadeOut(t, a.y1607 - 0.15, 0.15) });
    parchment(c, W / 2, 610, 560, 260, [['DEPUIS', 50], ['1607', 100, '#b3261e']], t, a.y1607, a.copr - 0.1);
    if (t > a.copr - 0.05) { stampText(c, 'COPRINCE D\'ANDORRE', W / 2, 470, t, a.copr, a.att - 0.2, { size: 62, col: ADR }); c.save(); c.globalAlpha = al; const s = popIn(t, a.copr, 0.3); c.translate(800, 1060); c.scale(s, s); sprite(c, 'couronnes', 0, 0, 130, { shadow: false }); c.restore(); }
  }
  if (t > a.att - 0.1 && t < a.b2) {
    const al = fadeOut(t, a.b2 - 0.25, 0.25);
    if (t < a.propre) tag(c, 'LA FRANCE ATTAQUE…', W / 2, 470, { size: 62, bg: BLUE, border: '#fff', sc: popIn(t, a.att, 0.3) * fadeOut(t, a.propre - 0.15, 0.15) });
    if (t > a.propre - 0.1) { c.save(); c.globalAlpha = al; soldier(c, 'president', 540, 1480, 420, t, a.propre - 0.1); c.restore(); stampText(c, 'SON PROPRE PRÉSIDENT', W / 2, 470, t, a.propre, a.b2 - 0.2, { size: 60 }); }
  }
  // Team Andorre : police, habitants, euro
  if (t > a.b2 - 0.1 && t < a.b3) {
    const al = fadeOut(t, a.b3 - 0.25, 0.25);
    c.save(); c.globalAlpha = al; if (t < a.pas) soldier(c, 'pol_a', 820, 1470, 400, t, a.b2 - 0.1); else { const sh = t < a.pas + 0.8 ? 6 * Math.sin(t * 50) : 0; sprite(c, 'pol_b', 820 + sh, 1470, 400); } c.restore();
    if (t < a.armee) tag(c, 'TEAM ANDORRE', W / 2, 470, { size: 66, bg: ADR, border: '#fff', sc: popIn(t, a.b2, 0.3) * fadeOut(t, a.armee - 0.1, 0.15) });
    if (t > a.armee - 0.05 && t < a.pas) tag(c, 'ARMÉE ?', W / 2, 470, { size: 80, bg: '#111', border: '#fff', sc: popIn(t, a.armee, 0.3) * fadeOut(t, a.pas - 0.1, 0.1) });
    stampText(c, '0 SOLDAT', W / 2, 470, t, a.pas, a.n89 - 0.2, { size: 84 });
    if (t > a.n331 - 0.1 && t < a.monnaie) counter(c, 331, t, a.n331 - 0.1, a.n331 + 0.7, W / 2, 650, { size: 130, label: 'POLICIERS', until: a.n89 - 0.15 });
    if (t > a.n89 - 0.1 && t < a.monnaie) { counter(c, 89000, t, a.n89 - 0.1, a.n89 + 0.8, W / 2, 650, { size: 120, label: 'HABITANTS', until: a.monnaie - 0.15 }); c.save(); c.globalAlpha = al * fadeOut(t, a.monnaie - 0.15, 0.2); const s = popIn(t, a.n89, 0.35); c.translate(330, 1450); c.scale(s, s); sprite(c, 'village', 0, 0, 300, { shadow: false }); c.restore(); }
    if (t > a.monnaie - 0.05) { tag(c, 'SA MONNAIE ?', W / 2, 470, { size: 70, bg: '#111', border: '#fff', sc: popIn(t, a.monnaie, 0.3) * fadeOut(t, a.euro - 0.1, 0.15) }); }
    if (t > a.euro - 0.4) { c.save(); c.globalAlpha = al; drop(c, 'euro', 340, 1460, 260, t, a.euro, { rot: 0.1 * Math.sin(t * 5) }); c.restore(); tag(c, 'L\'EURO', W / 2, 470, { size: 90, bg: '#003399', border: '#FFCC00', sc: stampScale(t, a.euro) * al }); }
  }
  // défense : France + Espagne
  if (t > a.b3 - 0.05 && t < a.b4) {
    const al = fadeOut(t, a.b4 - 0.25, 0.25);
    if (t < a.esp) tag(c, 'SA DÉFENSE ?', W / 2, 470, { size: 72, bg: '#111', border: '#fff', sc: popIn(t, a.b3, 0.3) * fadeOut(t, a.esp - 0.1, 0.15) });
    c.save(); c.globalAlpha = al;
    if (t > a.conf - 0.1) waver(c, 'sol_fr', 230, 1460, 360, t, a.conf - 0.1, 0);
    if (t > a.esp - 0.1) soldier(c, 'sol_es', 850, 1460, 380, t, a.esp - 0.1, { ph: 1 });
    c.restore();
    if (t > a.esp - 0.05 && t < a.def) tag(c, 'FRANCE + ESPAGNE', W / 2, 470, { size: 62, bg: '#7a3cc9', border: '#fff', sc: popIn(t, a.esp, 0.3) * fadeOut(t, a.def - 0.1, 0.15) });
    if (t > a.def - 0.05 && t < a.otan) tag(c, 'ESPAGNE ⚔ FRANCE', W / 2, 470, { size: 64, bg: ADR, border: '#fff', sc: stampScale(t, a.def) * fadeOut(t, a.otan - 0.1, 0.15) });
    arrowTo(c, 820, 1060, 300, 1050, t, a.def, a.b4 - 0.25, '#ff3b4e');
    stampText(c, 'OTAN CONTRE OTAN', W / 2, 470, t, a.otan, a.b4 - 0.2, { size: 70, col: '#1d3a8a' });
  }
  // l'évêque
  if (t > a.b4 - 0.05 && t < a.b5) {
    const al = fadeOut(t, a.b5 - 0.25, 0.25);
    if (t < a.ev1) tag(c, '2ᵉ COPRINCE ?', W / 2, 470, { size: 72, bg: '#111', border: '#fff', sc: popIn(t, a.b4, 0.3) * fadeOut(t, a.ev1 - 0.1, 0.15) });
    c.save(); c.globalAlpha = al; if (t > a.ev1 - 0.1) soldier(c, 'eveque', 820, 1480, 430, t, a.ev1 - 0.1); if (t > a.urg) { const s = popIn(t, a.urg, 0.35); c.save(); c.translate(300, 1470); c.scale(s, s); sprite(c, 'eglise', 0, 0, 280, { shadow: false }); c.restore(); } c.restore();
    if (t > a.ev1 - 0.05 && t < a.ta4) tag(c, 'UN ÉVÊQUE ESPAGNOL', W / 2, 470, { size: 60, bg: '#c49a1c', border: '#fff', sc: popIn(t, a.ev1, 0.3) * fadeOut(t, a.ta4 - 0.1, 0.15) });
    if (t > a.urg - 0.05) { const p = S(...P_.urgell); ping(c, p.x, p.y, t, a.urg, 'LA SEU D\'URGELL', a.b5 - 0.25); }
    if (t > a.ta4 - 0.05) tag(c, 'TEAM ANDORRE', W / 2, 470, { size: 66, bg: ADR, border: '#fff', sc: popIn(t, a.ta4, 0.3) * fadeOut(t, a.ev2 - 0.1, 0.15) });
    stampText(c, '+ 1 ÉVÊQUE', W / 2, 470, t, a.ev2, a.b5 - 0.2, { size: 84, col: '#b8860b' });
  }
  // taille
  if (t > a.b5 - 0.05 && t < a.b6) {
    const al = fadeOut(t, a.b6 - 0.25, 0.25);
    if (t < a.n468) tag(c, 'LA TAILLE ?', W / 2, 470, { size: 76, bg: '#111', border: '#fff', sc: popIn(t, a.b5, 0.3) * fadeOut(t, a.n468 - 0.1, 0.15) });
    if (t > a.n468 - 0.1) counter(c, 468, t, a.n468 - 0.1, a.n468 + 0.8, W / 2, 470, { size: 130, suf: ' KM²', label: 'SUPERFICIE', until: a.x45 - 0.15 });
    if (t > a.x45 - 0.05) tag(c, '4,5 × PARIS', W / 2, 470, { size: 96, bg: BLUE, border: '#fff', sc: stampScale(t, a.x45) * al });
    if (t > a.b5 + 0.2) { c.save(); c.globalAlpha = al; sprite(c, 'metre', 820, 1480, 220 * popIn(t, a.b5 + 0.2, 0.3), { shadow: false, rot: -0.1 + 0.05 * Math.sin(t * 4) }); c.restore(); }
  }
  // frontière + courses
  if (t > a.b6 - 0.05 && t < a.b7) {
    const al = fadeOut(t, a.b7 - 0.25, 0.25);
    if (t < a.n57) tag(c, 'LA FRONTIÈRE ?', W / 2, 470, { size: 72, bg: '#111', border: '#fff', sc: popIn(t, a.b6, 0.3) * fadeOut(t, a.n57 - 0.1, 0.15) });
    if (t > a.n57 - 0.1 && t < a.n9) counter(c, 57, t, a.n57 - 0.1, a.n57 + 0.5, W / 2, 470, { size: 140, suf: ' KM', label: 'AVEC LA FRANCE', until: a.chaque - 0.1 });
    if (t > a.chaque - 0.1) { const p = S(...P_.pas); ping(c, p.x, p.y, t, a.chaque, 'PAS DE LA CASA', a.b7 - 0.25); c.save(); c.globalAlpha = al; const s = popIn(t, a.chaque, 0.35); c.translate(300, 1450); c.scale(s, s); sprite(c, 'telesiege', 0, 0, 260, { shadow: false }); c.restore(); }
    if (t > a.n9 - 0.1) { counter(c, 9, t, a.n9 - 0.1, a.n9 + 0.5, W / 2, 470, { size: 130, pre: '+ ', suf: ' MILLIONS', label: 'DE VISITEURS PAR AN', until: a.b7 - 0.25 }); const u = easeOut(prog(t, a.n9 - 0.1, 0.9)); c.save(); c.globalAlpha = al; sprite(c, 'caddie', lerp(1250, 790, u), 1480 - Math.abs(Math.sin(t * 14)) * 6 * (1 - u), 300, { shadow: false }); c.restore(); }
    if (t > a.courses - 0.05) tag(c, 'LES COURSES', W / 2, 640, { size: 56, bg: '#2a9d4b', border: '#fff', sc: popIn(t, a.courses, 0.3) * al });
  }
  // résultat
  if (t > a.b7 - 0.05 && t < a.tf8 - 0.2) {
    const al = fadeOut(t, a.tf8 - 0.45, 0.25);
    stampText(c, 'RÉSULTAT', W / 2, 470, t, a.b7, a.dirige - 0.15, { size: 84, col: '#111' });
    c.save(); c.globalAlpha = al; if (t > a.guerre - 0.1) { waver(c, 'sol_fr', 230, 1460, 360, t, a.guerre - 0.1, 0); sprite(c, 'pol_b', 850 + 5 * Math.sin(t * 40), 1460, 370 * popIn(t, a.guerre - 0.1, 0.3)); } c.restore();
    if (t > a.dirige - 0.05) tag(c, 'DIRIGÉ PAR…', W / 2, 470, { size: 72, bg: '#111', border: '#fff', sc: popIn(t, a.dirige, 0.3) * fadeOut(t, a.pres7 - 0.1, 0.15) });
    if (t > a.pres7 - 0.1) { const p = S(...P_.elysee); ping(c, p.x, p.y, t, a.pres7, 'ÉLYSÉE', a.tf8 - 0.45); c.save(); c.globalAlpha = al; soldier(c, 'president', 540, 1300, 380, t, a.pres7 - 0.1); c.restore(); stampText(c, 'LE PRÉSIDENT FRANÇAIS', W / 2, 470, t, a.pres7 + 0.4, a.tf8 - 0.45, { size: 58 }); }
  }
  // fin
  if (t > a.tf8 - 0.2) {
    waver(c, 'sol_fr', 210, 1450, 360, t, a.tf8 - 0.2, 0); soldier(c, 'pol_a', 870, 1450, 370, t, a.tf8 - 0.1, { ph: 1 });
    if (t > a.tf8 - 0.05) tag(c, 'TEAM FRANCE', 210, 1030, { size: 46, bg: BLUE, border: '#fff', sc: popIn(t, a.tf8, 0.3) }); if (t > a.ta8 - 0.05) tag(c, 'TEAM ANDORRE', 870, 1030, { size: 44, bg: ADR, border: '#fff', sc: popIn(t, a.ta8, 0.3) });
    { const s = popIn(t, a.tf8 - 0.1, 0.3) * (1 + 0.1 * Math.max(0, 1 - Math.abs(t - a.ta8) / 0.15)); c.save(); c.translate(W / 2, 880); c.scale(s, s); txt(c, 'QUI GAGNE ?', 0, 0, { size: 120, weight: 900, color: '#FFE928', stroke: '#1b1300', sw: 14 }); c.restore(); }
    if (t > a.abo - 0.15) tag(c, 'ABONNE-TOI', W / 2, 1230, { size: 70, bg: '#C00E1F', border: '#fff', sc: stampScale(t, a.abo) });
  }
}
