// scene.js — Napoléon a vendu un quart des États-Unis (Louisiane 1803). window.render(t) déterministe, 9:16.
const CY = 860, OX = 470, OY = 680, MW = 2020, MH = 3060, FOC = 1400;
let D, FL = {}, ART = {}, DUR, cam;
const mapC = document.createElement('canvas'); mapC.width = MW; mapC.height = MH; const m = mapC.getContext('2d');
const rotC = document.createElement('canvas'); rotC.width = MW; rotC.height = MH; const rc = rotC.getContext('2d');
let canvas, ctx, P = null, cam_s = 1, ANG = 0, TILT = 0;
const NOLA = [-90.07, 29.95], PARIS = [2.35, 48.86], LONDON = [-0.12, 51.5], BREST = [-4.6, 48.2], HAITI = [-72.6, 19.0];
const FCOL = { fr: '#3b7bff', royal: '#f5d76e', es: '#ffc400', us: '#ff3b3b', us15: '#ff3b3b', gb: '#ff2d2d' };

function makeCam2(stops) {
  stops.sort((a, b) => a.t - b.t);
  const dr = (st, t) => { const dt = Math.max(0, t - st.t); return { lon: st.lon, lat: st.lat, s: st.s * (1 + (st.drift ?? 0.03) * dt) }; };
  return t => {
    if (t <= stops[0].t) return dr(stops[0], 0);
    for (let i = 0; i < stops.length - 1; i++) {
      const a = stops[i], b = stops[i + 1], dep = b.t - b.d;
      if (t < dep) return dr(a, t);
      if (t < b.t) {
        const A = dr(a, dep), x = (t - dep) / b.d; const ez = b.lin ? x : ease(x);
        const zi = b.s > A.s * 3, zo = A.s > b.s * 3;
        const ep = b.lin ? x : zi ? ease(Math.min(1, x * 1.35)) : zo ? ease(Math.max(0, x * 1.35 - 0.35)) : ez;
        let dl = b.lon - A.lon; if (dl > 180) dl -= 360; if (dl < -180) dl += 360;
        return { lon: A.lon + dl * ep, lat: lerp(A.lat, b.lat, ep), s: Math.exp(lerp(Math.log(A.s), Math.log(b.s), ez)) };
      }
    }
    return dr(stops.at(-1), t);
  };
}
function S(lon, lat) {
  const p = P([lon, lat]); let x = p[0] - OX - 540, y = p[1] - OY - CY;
  const c = Math.cos(ANG), s = Math.sin(ANG); let u = x * c - y * s, v = x * s + y * c; let k = 1;
  if (TILT > 0.001) { const sn = Math.sin(TILT), cs = Math.cos(TILT); k = FOC / (FOC - v * sn); u *= k; v = k * v * cs; }
  return { x: 540 + u, y: CY + v, k };
}
const pathM = g => { m.beginPath(); d3.geoPath(P, m)(g); };
const lineM = L => { m.beginPath(); L.forEach((q, i) => { const p = P(q); i ? m.lineTo(p[0], p[1]) : m.moveTo(p[0], p[1]); }); };

// ---------- fond en relief (tuiles Natural Earth) ----------
const TN = 16384, TS = 1024; const TILES = {}; let LOWRES = null;
const gX = lon => (lon + 180) / 360 * TN, gY = lat => TN / 2 - TN / (2 * Math.PI) * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
function tilesFor(st) {
  const k = 2 * Math.PI * st.s / TN; if (k < 0.3) return [];
  const xc = gX(st.lon), yc = gY(st.lat); const x0 = xc - (540 + OX) / k, x1 = xc + (MW - 540 - OX) / k, y0 = yc - (CY + OY) / k, y1 = yc + (MH - CY - OY) / k;
  const out = []; for (let ty = Math.max(0, Math.floor(y0 / TS)); ty <= Math.min(15, Math.floor(y1 / TS)); ty++) for (let tx = Math.floor(x0 / TS); tx <= Math.floor(x1 / TS); tx++) out.push([((tx % 16) + 16) % 16, ty, tx]);
  return out;
}
function drawSat(st) {
  const cx = 540 + OX, cy = CY + OY; m.fillStyle = '#2f7f8c'; m.fillRect(0, 0, MW, MH); m.imageSmoothingQuality = 'high';
  const k = 2 * Math.PI * st.s / TN, xc = gX(st.lon), yc = gY(st.lat);
  if (k < 0.3 || !tilesFor(st).every(([a, b]) => TILES[b + '_' + a])) {
    const kl = 2 * Math.PI * st.s / LOWRES.width; const W2 = LOWRES.width * kl;
    const X0 = cx - (xc / TN) * W2, Y0 = cy - (yc / TN) * W2;
    for (const off of [-W2, 0, W2]) { const xa = X0 + off; const dx0 = Math.max(0, xa), dx1 = Math.min(MW, xa + W2), dy0 = Math.max(0, Y0), dy1 = Math.min(MH, Y0 + W2); if (dx1 > dx0 && dy1 > dy0) m.drawImage(LOWRES, (dx0 - xa) / kl, (dy0 - Y0) / kl, (dx1 - dx0) / kl, (dy1 - dy0) / kl, dx0, dy0, dx1 - dx0, dy1 - dy0); }
  } else {
    for (const [tx, ty, txr] of tilesFor(st)) { const img = TILES[ty + '_' + tx]; if (!img) continue; const dx = cx + (txr * TS - xc) * k, dy = cy + (ty * TS - yc) * k; m.drawImage(img, dx, dy, TS * k + 1, TS * k + 1); }
  }
  m.save(); pathM(D.borders); m.lineWidth = 1.6; m.strokeStyle = 'rgba(255,255,255,.62)'; m.stroke(); m.restore();
}

// ---------- territoires colorés avec leur drapeau ----------
let FILLS = [];
const GEO = {};
function drawFills(t) {
  for (const f of FILLS) {
    if (t < f.t0 || t > f.t1 + 0.35) continue;
    const g = GEO[f.g]; const cur = t - f.t0; const out = fadeOut(t, f.t1, 0.35);
    const fa = clamp(cur / 0.2) * lerp(f.max ?? 0.88, f.dim ?? 0.42, clamp((cur - (f.hold ?? 1.6)) / 0.6)) * out;
    const flash = Math.max(0, 1 - cur / 0.3); const col = FCOL[f.flag] || '#fff';
    m.save();
    if (f.clip) { pathM(GEO[f.clip]); m.clip(); }
    flagFill(m, () => pathM(g), d3.geoPath(P).bounds(g), FL[f.flag], fa, flash, f.mode || 'slice');
    pathM(g); m.lineJoin = 'round'; m.lineWidth = 3.4; m.strokeStyle = col; m.globalAlpha = 0.95 * clamp(cur / 0.4) * out; m.shadowColor = col; m.shadowBlur = 12; m.stroke();
    if (cur < 2.2) { m.globalAlpha = (1 - cur / 2.2) * out; m.shadowColor = '#fff'; m.shadowBlur = 25; m.lineWidth = 4.5; m.strokeStyle = '#fff'; m.stroke(); }
    m.restore();
  }
}
// copies de la France posées à vraie taille
function drawFranceCopies(t) {
  const a = A; if (t < a.quatre - 0.1 || t > a.fr4end + 0.4) return;
  D.frCopies.forEach((g, i) => {
    const t0 = a.fr4[i]; if (t < t0) return; const p = easeOut(prog(t, t0, 0.3)); const al = fadeOut(t, a.fr4end, 0.35);
    m.save(); m.globalAlpha = al; const b = d3.geoPath(P).bounds(g); const cx = (b[0][0] + b[1][0]) / 2, cy = (b[0][1] + b[1][1]) / 2; const sc = lerp(1.8, 1, p);
    m.translate(cx, cy); m.scale(sc, sc); m.translate(-cx, -cy - (1 - p) * 120);
    flagFill(m, () => pathM(g), b, FL.fr, 0.75 * clamp((t - t0) / 0.15)); pathM(g); m.lineWidth = 4; m.strokeStyle = '#fff'; m.shadowColor = '#3b7bff'; m.shadowBlur = 14; m.stroke(); m.restore();
  });
}
// États actuels dans la Louisiane
function drawStates(t) {
  const a = A; if (t < a.auj || t > a.b5 + 0.4) return; const al = clamp((t - a.auj) / 0.5) * fadeOut(t, a.b5, 0.4);
  m.save(); pathM(D.lp); m.clip(); m.globalAlpha = al;
  D.states.forEach((s, i) => {
    const t0 = a.quinz + i * 0.07; let hi = t > t0 ? Math.max(0, 1 - (t - t0) / 0.5) : 0;
    if (s.id === '22' && win(t, a.stLa, a.stMt)) hi = 0.6 + 0.2 * Math.sin(t * 8); if (s.id === '30' && t > a.stMt) hi = 0.6 + 0.2 * Math.sin(t * 8);
    if (hi > 0) { pathM(s.g); m.fillStyle = `rgba(255,233,40,${0.55 * hi})`; m.fill(); }
  });
  pathM(D.stMesh); m.lineWidth = 2.6; m.strokeStyle = 'rgba(255,255,255,.95)'; m.setLineDash([10, 7]); m.stroke(); m.setLineDash([]); m.restore();
}
// fleuves
function drawRivers(t) {
  const a = A; if (t < a.desc - 0.2 || t > a.b2 + 0.4) return; const al = fadeOut(t, a.b2, 0.4);
  m.save(); m.globalAlpha = al; m.lineCap = 'round'; m.lineJoin = 'round';
  // Mississippi : tracé lumineux derrière le canot
  const L = CANOE.path; const u = CANOE.u(t); const n = Math.max(2, Math.floor(L.length * u));
  const full = D.miss; lineM(full); m.lineWidth = 5; m.strokeStyle = 'rgba(120,200,255,.35)'; m.stroke();
  lineM(L.slice(0, n)); m.lineWidth = 9; m.strokeStyle = '#7fd4ff'; m.shadowColor = '#3fb2ff'; m.shadowBlur = 18; m.stroke(); m.lineWidth = 3.5; m.strokeStyle = '#fff'; m.stroke();
  // affluents : le bassin s'allume
  [[D.missouri, 0], [D.ohio, 0.15], [D.arkansas, 0.3], [D.red, 0.45], [full, 0.05]].forEach(([R, dl]) => {
    const p = easeOut(prog(t, a.bassin + dl, 0.8)); if (p <= 0) return; lineM(R.slice(0, Math.max(2, Math.floor(R.length * p))));
    m.lineWidth = 7; m.strokeStyle = '#7fd4ff'; m.shadowColor = '#3fb2ff'; m.shadowBlur = 16; m.stroke(); m.lineWidth = 2.5; m.strokeStyle = '#fff'; m.stroke();
  });
  m.restore();
}

// ---------- voyageurs (navires, canot, sac d'or) suivis par la caméra ----------
let LEGS = [];
function pathLeg(spr, pts, t0, t1, sMid, sEnd, o = {}) {
  const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + d3.geoDistance(pts[i - 1], pts[i]));
  const tot = cum.at(-1);
  const at = u => { const d = u * tot; let i = 1; while (i < cum.length - 1 && cum[i] < d) i++; const f = (d - cum[i - 1]) / Math.max(1e-9, cum[i] - cum[i - 1]); return d3.geoInterpolate(pts[i - 1], pts[i])(clamp(f)); };
  const L = { spr, path: pts, t0, t1, sMid, sEnd, at, u: t => (o.linear ? prog(t, t0, t1 - t0) : ease(prog(t, t0, t1 - t0))), size: o.size || 200, rot: o.rot !== false, wake: o.wake ?? '#ffffff', hold: o.hold ?? 0.6, follow: o.follow !== false, dy: o.dy ?? 110 };
  LEGS.push(L); return L;
}
function drawWakes(t) {
  for (const L of LEGS) {
    if (!L.wake || t < L.t0 || t > L.t1 + L.hold + 0.4) continue; const u = L.u(t); const al = fadeOut(t, L.t1 + L.hold, 0.4);
    m.save(); m.globalAlpha = al; m.beginPath(); for (let i = 0; i <= 60; i++) { const p = P(L.at(u * i / 60)); i ? m.lineTo(p[0], p[1]) : m.moveTo(p[0], p[1]); }
    m.setLineDash([16, 12]); m.lineDashOffset = -t * 50; m.lineWidth = 6; m.strokeStyle = L.wake; m.shadowColor = 'rgba(0,0,0,.4)'; m.shadowBlur = 6; m.lineCap = 'round'; m.stroke(); m.restore();
  }
}
function drawTravelers(c, t) {
  for (const L of LEGS) {
    if (t < L.t0 - 0.25 || t > L.t1 + L.hold + 0.3) continue;
    const u = L.u(t); const ll = L.at(u); const p = S(ll[0], ll[1]); const q = S(...L.at(clamp(u + 0.01))), p0 = S(...L.at(clamp(u - 0.01)));
    const dir = Math.atan2(q.y - p0.y, q.x - p0.x); const a = Math.min(clamp((t - L.t0 + 0.25) / 0.25), fadeOut(t, L.t1 + L.hold, 0.3));
    const bob = 1 + 0.03 * Math.sin(t * 6); const img = SPR[L.spr]; if (!img) continue; const h = L.size * bob * popIn(t, L.t0 - 0.25, 0.35);
    c.save(); c.globalAlpha = a; c.translate(p.x, p.y);
    if (L.rot) c.rotate(dir + Math.PI / 2); else c.rotate(0.06 * Math.sin(t * 5));
    const w = h * img.width / img.height;
    c.save(); c.translate(14, 18); c.globalAlpha = 0.3 * a; c.filter = 'brightness(0) blur(5px)'; c.drawImage(img, -w / 2, -h / 2, w, h); c.restore();
    c.drawImage(img, -w / 2, -h / 2, w, h); c.restore();
  }
}

// ---------- étiquettes ----------
function flagCard(c, x, y, img, w) { const h = w * 0.75; c.save(); c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 12; c.shadowOffsetY = 4; c.fillStyle = '#fff'; rr(c, x - w / 2 - 5, y - h / 2 - 5, w + 10, h + 10, 6); c.fill(); c.shadowColor = 'transparent'; if (img) c.drawImage(img, x - w / 2, y - h / 2, w, h); c.restore(); }
let PINS = [];
function drawPins(c, t) {
  PINS.forEach((pn, i) => {
    const nxt = PINS.filter(x => x.t > pn.t + 0.05).map(x => x.t).sort((a, b) => a - b)[0];
    const tEnd = Math.min(pn.t + (pn.d ?? 2.0), nxt != null ? nxt - 0.05 : 1e9); if (t < pn.t || t > tEnd + 0.25) return;
    const p = S(pn.ll[0], pn.ll[1]); const al = fadeOut(t, tEnd, 0.25); const s = popIn(t, pn.t, 0.3);
    c.save(); c.globalAlpha = al; c.translate(p.x, clamp(p.y + (pn.dy ?? 0), 420, 1330)); c.scale(s, s); if (pn.flag) flagCard(c, 0, -62, FL[pn.flag], 96);
    txt(c, typed(pn.name, t, pn.t + 0.05, 0.3), 0, pn.flag ? 34 : 0, { size: pn.size || 62, stroke: '#000', sw: 11 }); c.restore();
  });
}
// texte manuscrit écrit sur la carte
function mapWrite(c, s, ll, t, t0, t1, o = {}) {
  if (t < t0 || t > t1 + 0.3) return; const p = S(ll[0], ll[1]); const al = fadeOut(t, t1, 0.3);
  c.save(); c.globalAlpha = al; c.translate(p.x, p.y); c.rotate(o.rot ?? -0.06);
  txt(c, typed(s, t, t0, o.d ?? 0.6), 0, 0, { size: o.size || 120, font: 'Caveat', weight: 700, color: o.color || '#fff', stroke: '#1d1406', sw: 12, blur: 18 }); c.restore();
}
function stampText(c, s, x, y, t, t0, t1, o = {}) {
  if (t < t0 || t > t1 + 0.3) return; const sz = o.size || 92; const sc = stampScale(t, t0) * fadeOut(t, t1, 0.3);
  c.save(); c.translate(x, y); c.rotate(o.rot ?? -0.1); c.scale(sc, sc); c.globalAlpha = clamp((t - t0) / 0.08) * fadeOut(t, t1, 0.3);
  const w = measure(c, s, sz, 900) + 60; c.fillStyle = 'rgba(255,255,255,.9)'; rr(c, -w / 2, -sz * 0.7, w, sz * 1.4, 18); c.fill(); c.lineWidth = 10; c.strokeStyle = o.col || '#e01b24'; c.stroke();
  txt(c, s, 0, 4, { size: sz, color: o.col || '#e01b24', weight: 900, shadow: false }); c.restore();
}
function bigWord(c, s, y, t, t0, t1, o = {}) {
  if (t < t0 || t > t1 + 0.3) return; const sc = popIn(t, t0, 0.3) * fadeOut(t, t1, 0.25) * (1 + 0.03 * Math.sin(t * 6));
  c.save(); c.translate(W / 2, y); c.scale(sc, sc); txt(c, s, 0, 0, { size: o.size || 130, weight: 900, color: o.color || '#FFE928', stroke: '#1b1300', sw: (o.size || 130) * 0.12 }); c.restore();
}
// tableau d'époque dans un cadre doré
function paintCard(c, img, t, t0, t1, caption, o = {}) {
  if (!img || t < t0 || t > t1 + 0.35) return;
  const pin = easeOut(prog(t, t0, 0.35)), pout = easeIn(prog(t, t1, 0.35)); const side = o.side || 1;
  const cx = W / 2 + side * (1 - pin) * 1000 - side * pout * 1000, cy = o.y || 690; const cw = o.w || 700, ch = o.h || 560;
  c.save(); c.translate(cx, cy); c.rotate((o.rot ?? (side > 0 ? -2 : 2)) * Math.PI / 180);
  c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 45; c.shadowOffsetY = 16;
  const fw = 26; const g = c.createLinearGradient(-cw / 2, -ch / 2, cw / 2, ch / 2); g.addColorStop(0, '#f6d77a'); g.addColorStop(0.35, '#b8862b'); g.addColorStop(0.6, '#f3cf6b'); g.addColorStop(1, '#8a5f17');
  c.fillStyle = g; c.fillRect(-cw / 2 - fw, -ch / 2 - fw, cw + fw * 2, ch + fw * 2); c.shadowColor = 'transparent';
  c.lineWidth = 3; c.strokeStyle = 'rgba(70,40,0,.7)'; c.strokeRect(-cw / 2 - fw + 6, -ch / 2 - fw + 6, cw + fw * 2 - 12, ch + fw * 2 - 12); c.strokeRect(-cw / 2 - 2, -ch / 2 - 2, cw + 4, ch + 4);
  c.save(); c.beginPath(); c.rect(-cw / 2, -ch / 2, cw, ch); c.clip();
  const z = (1.04 + 0.08 * prog(t, t0, t1 - t0 + 0.35)); const r = Math.max(cw / img.width, ch / img.height) * z; const fy = o.fy ?? 0;
  c.drawImage(img, -img.width * r / 2, -img.height * r / 2 + fy * img.height * r, img.width * r, img.height * r);
  const vg = c.createRadialGradient(0, 0, ch * 0.35, 0, 0, ch * 0.85); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(30,15,0,.35)'); c.fillStyle = vg; c.fillRect(-cw / 2, -ch / 2, cw, ch);
  c.restore();
  if (caption) { const pw = measure(c, caption, 34, 800) + 50; c.fillStyle = '#1d1406'; rr(c, -pw / 2, ch / 2 + fw - 8, pw, 58, 8); c.fill(); c.lineWidth = 3; c.strokeStyle = '#d9b25a'; c.stroke(); txt(c, typed(caption, t, t0 + 0.25, 0.35), 0, ch / 2 + fw + 22, { size: 34, weight: 800, color: '#f3d98a', shadow: false }); }
  c.restore();
}
function charSpr(c, name, x, y, h, t, t0, t1, o = {}) { if (t < t0 || t > t1 + 0.3) return; sprite(c, name, x, y, h * popIn(t, t0, 0.3), { alpha: fadeOut(t, t1, 0.3), rot: (o.wob ?? 0.04) * Math.sin(t * 5 + (o.ph || 0)), flip: o.flip }); }
function dropSpr(c, name, x, y, h, t, t0, t1) { if (t < t0 || t > t1 + 0.3) return; const p = prog(t, t0, 0.35); const yy = y - (1 - easeIn(p)) * 500; const sq = p >= 1 ? 1 + 0.12 * Math.max(0, 1 - (t - t0 - 0.35) / 0.15) : 1; sprite(c, name, x, yy, h, { alpha: fadeOut(t, t1, 0.3) * clamp(p * 4), sx: sq, sy: 2 - sq }); }

// ============ TIMELINE ============
let A = {}, CANOE;
function setup() {
  const a = A;
  a.sav = T(0, 'savez'); a.eu = T(0, 'etatsunis'); a.ach = T(0, 'achetes'); a.fr = T(0, 'france'); a.en1803 = T(0, 'en', 2); a.napo = T(0, 'napoleon'); a.vendu = T(0, 'vendu'); a.terr = T(0, 'territoire'); a.quatre = T(0, 'quatre');
  a.fr4 = [T(0, 'quatre'), T(0, 'fois'), T(0, 'plus'), T(0, 'grand')]; a.pour = T(0, 'pour'); a.sept = T(0, 'sept'); a.mais = T(0, 'mais'); a.pq = T(0, 'pourquoi'); a.homme = T(0, 'lhomme'); a.brade = T(0, 'brade'); a.quart = T(0, 'quart'); a.fr4end = a.pour + 0.3;
  a.b1 = beatStart(1); a.salle = T(1, 'lexplorateur'); a.desc = T(1, 'descend'); a.bassin = T(1, 'bassin'); a.fleuve = T(1, 'fleuve'); a.roi = T(1, 'roi'); a.louisiane = T(1, 'louisiane');
  a.b2 = beatStart(2); a.recup = T(2, 'recupere'); a.secret = T(2, 'secret'); a.reve = T(2, 'son'); a.empire = T(2, 'empire'); a.sd = T(2, 'saintdomingue'); a.haiti = T(2, 'haiti'); a.armee = T(2, 'armee'); a.fievre = T(2, 'fievre');
  a.b3 = beatStart(3); a.amer = T(3, 'americains'); a.acheter = T(3, 'acheter'); a.nola = T(3, 'nouvelleorleans'); a.propose = T(3, 'propose'); a.toute = T(3, 'toute');
  a.b4 = beatStart(4); a.sign = T(4, 'laffaire'); a.quinze = T(4, 'quinze'); a.eu4 = T(4, 'etatsunis'); a.doublent = T(4, 'doublent'); a.auj = T(4, 'aujourdhui'); a.quinz = T(4, 'quinzaine'); a.stLa = T(4, 'louisiane'); a.stMt = T(4, 'montana');
  a.b5 = beatStart(5); a.fou = T(5, 'fou'); a.sur = T(5, 'sur'); a.drap = T(5, 'drapeau'); a.vingt = T(5, 'vingt'); a.argent = T(5, 'largent'); a.banque = T(5, 'banque'); a.anglaise = T(5, 'anglaise'); a.napo5 = T(5, 'napoleon'); a.guerre = T(5, 'guerre');
  a.b6 = beatStart(6); a.toi = T(6, 'toi'); a.vendu6 = T(6, 'vendu'); a.comm = T(6, 'disle'); a.fin = TE(6, 'commentaire');
  DUR = a.fin + 0.55;

  GEO.usa = D.c['840']; GEO.fra = D.c['250']; GEO.gbr = D.c['826']; GEO.hti = D.c['332']; GEO.lp = D.lp; GEO.basin = { type: 'GeometryCollection', geometries: [D.lp, D.east] }; GEO.us1803 = D.us1803;
  const F = (g, flag, t0, t1, o = {}) => FILLS.push({ g, flag, t0, t1, ...o });
  F('usa', 'us', a.eu, a.fr - 0.2, { mode: 'slice' });
  F('fra', 'fr', a.fr, a.vendu + 0.8, { mode: 'stretch' });
  F('lp', 'fr', a.terr - 0.1, a.b1 - 0.1);
  F('basin', 'royal', a.fleuve, a.b2 - 0.05);
  F('lp', 'es', a.b2, a.recup + 0.15);
  F('lp', 'fr', a.recup + 0.15, a.eu4 + 0.7, { hold: 2.2 });
  F('lp', 'fr', a.toute, a.eu4 + 0.7, { max: 0.9, dim: 0.5, hold: 1.4 });
  F('fra', 'fr', a.reve, a.sd - 0.6, { mode: 'stretch', dim: 0.5 });
  F('hti', 'fr', a.sd, a.b3 + 0.3, { mode: 'stretch' });
  F('us1803', 'us15', a.eu4, a.b5 - 0.1, { clip: 'usa', hold: 1.0 });
  F('lp', 'us15', a.doublent, a.b5 - 0.1, { hold: 1.2 });
  F('gbr', 'gb', a.anglaise, a.b6 - 0.1, { mode: 'stretch' });
  F('fra', 'fr', a.napo5 + 0.6, a.b6 - 0.1, { mode: 'stretch' });
  F('lp', 'fr', a.b6, DUR + 1, { dim: 0.5 }); F('fra', 'fr', a.b6 + 0.15, DUR + 1, { mode: 'stretch', dim: 0.5 });

  const pin = (t, ll, name, flag, o = {}) => PINS.push({ t, ll, name, flag, ...o });
  pin(a.eu, [-98, 39], 'ÉTATS-UNIS', 'us'); pin(a.fr, [2.4, 46.4], 'FRANCE', 'fr'); pin(a.b2 + 0.05, [-98, 40.5], 'LOUISIANE ESPAGNOLE', 'es', { size: 54 });
  pin(a.sd, [-72.6, 19.2], 'SAINT-DOMINGUE', 'fr', { size: 56, d: 1.25 }); pin(a.haiti, [-72.6, 19.2], '= HAÏTI', null, { size: 76, d: 1.0 });
  pin(a.eu4, [-84, 37.5], 'ÉTATS-UNIS 1803', 'us15', { size: 54 }); pin(a.anglaise, [-3.2, 55.2], 'ROYAUME-UNI', 'gb', { size: 58 });

  // ---- voyageurs
  const toNola = [BREST, [-20, 40], [-50, 30], [-70, 25.5], [-79.2, 24.0], [-83.5, 24.4], [-88.0, 28.0], [-89.35, 28.95]];
  pathLeg('ship_fr', toNola, a.vendu - 0.15, a.terr - 0.1, 300, 1300, { size: 190 });
  const iStl = D.miss.reduce((bi, q, i) => Math.hypot(q[0] + 90.2, q[1] - 38.6) < Math.hypot(D.miss[bi][0] + 90.2, D.miss[bi][1] - 38.6) ? i : bi, 0);
  CANOE = pathLeg('canoe', D.miss.slice(iStl), a.desc - 0.2, a.bassin + 0.2, 8000, 6000, { size: 210, wake: null, linear: true, hold: 0.4 });
  pathLeg('ship_fr', [[-45, 38.2], [-58, 27], [-66, 22.5], [-71.6, 20.4], [-72.35, 19.85]], a.sd - 1.5, a.sd - 0.05, 330, 2600, { size: 200 });
  pathLeg('moneybag', [NOLA, [-80, 32], [-50, 45], [-20, 50], [-5, 51], LONDON], a.argent + 0.05, a.banque - 0.1, 330, 3000, { size: 170, rot: false, wake: '#FFE928' });
  pathLeg('coins', [LONDON, [1.2, 50.3], PARIS], a.napo5, a.napo5 + 1.1, 2000, 2400, { size: 120, rot: false, wake: '#FFE928', follow: false });

  const st = (t, d, lon, lat, s, o = {}) => ({ t, d, lon, lat, s, ...o });
  const stops = [
    st(0, 0, -97, 38.5, 760, { drift: 0.06 }),
    st(a.fr - 0.25, 0.75, -40, 44, 300), st(a.fr + 0.55, 0.8, 2.4, 46.6, 2100, { drift: 0.04 }),
    st(a.napo + 0.3, 0.8, -4.6, 46.8, 2600),
    // (vol du navire de 6.8 à 8.2)
    st(a.terr + 0.55, 0.65, -100.5, 39.6, 1900, { drift: 0.03 }),
    st(a.sept + 0.2, 0.9, -97.5, 37.6, 2500),
    st(a.pq + 0.1, 0.9, -99, 39.5, 1450),
    st(a.brade, 0.5, -97, 37, 1750),
    st(a.quart + 0.35, 1.0, -96, 38.5, 820),
    st(a.b1 + 0.4, 1.2, -91, 38, 1350),
    st(a.salle + 0.6, 1.0, -90.2, 37.0, 2300),
    // (canot sur le Mississippi)
    st(a.roi + 0.5, 1.3, -94.5, 39.3, 1150, { drift: 0.04 }),
    st(a.louisiane + 0.2, 0.9, -98, 39.5, 1550),
    st(a.b2 + 0.45, 1.0, -99, 40.5, 2000),
    st(a.secret + 0.2, 0.8, -97, 39, 2400),
    st(a.reve + 0.3, 1.2, -45, 30, 440, { drift: 0.05 }),
    // (navire vers Saint-Domingue)
    st(a.sd + 0.85, 0.9, -72.6, 19.0, 9000, { drift: 0.03 }),
    st(a.armee + 0.4, 1.0, -73.5, 19.5, 5200),
    st(a.fievre + 0.3, 0.9, -72.3, 18.8, 7200),
    st(a.b3 + 0.6, 1.0, -82, 27, 900),
    st(a.nola + 0.3, 1.4, NOLA[0], NOLA[1], 9000, { drift: 0.04 }),
    st(a.propose + 0.1, 0.7, NOLA[0], NOLA[1] + 0.3, 6500),
    st(a.toute + 0.5, 1.1, -100, 40, 1700),
    st(a.b4 + 0.6, 0.85, -45, 42, 330), st(a.sign + 0.9, 1.1, PARIS[0], PARIS[1], 3000, { drift: 0.03 }),
    st(a.quinze + 0.4, 0.8, 1.8, 48.4, 2200),
    st(a.eu4 - 0.1, 0.9, -42, 40, 330), st(a.doublent + 0.4, 1.0, -89, 38.5, 1000),
    st(a.auj + 0.5, 1.0, -100, 41, 1650),
    st(a.quinz + 0.2, 0.8, -100, 40.5, 1900),
    st(a.stLa + 0.2, 0.75, -92.2, 31.2, 3100),
    st(a.stMt + 0.6, 0.85, -109.6, 47, 2800),
    st(a.b5 + 0.35, 0.55, -86, 34, 580),
    st(a.sur + 1.25, 1.2, NOLA[0], NOLA[1], 14000, { drift: 0.03 }),
    st(a.vingt + 0.1, 0.8, NOLA[0], NOLA[1] - 0.42, 9000),
    // (sac d'or vers Londres)
    st(a.banque + 0.6, 0.7, LONDON[0], LONDON[1], 4200),
    st(a.anglaise + 0.6, 0.65, -1.5, 52.5, 2300),
    st(a.napo5 + 0.6, 0.9, 1.0, 50.2, 2500),
    st(a.guerre + 0.1, 0.7, 0.2, 50.3, 3300),
    st(a.b6 + 0.6, 1.2, -45, 38, 420, { drift: 0.05 }),
    st(a.comm + 0.2, 0.9, -40, 39, 520, { drift: 0.04 }),
  ];
  cam = makeCam2(stops);
  for (const L of LEGS) L.s0 = cam(L.t0 - 0.01).s;
  for (const L of LEGS.filter(L => L.follow)) for (let t = L.t0; t <= L.t1 + 1e-6; t += 0.12) { const u = prog(t, L.t0, L.t1 - L.t0); const ll = L.at(L.u(t)); const sc = u < 0.5 ? Math.exp(lerp(Math.log(L.s0), Math.log(L.sMid), ease(u * 2))) : Math.exp(lerp(Math.log(L.sMid), Math.log(L.sEnd), ease(u * 2 - 1))); stops.push(st(t, 0.12, ll[0], ll[1] - L.dy / sc * 57.3 / 1.6, sc, { lin: true, drift: 0.02 })); }
  cam = makeCam2(stops);
  A.tilt = [[a.vendu - 0.2, a.terr, 24], [a.desc - 0.3, a.bassin, 22], [a.sd - 1.6, a.sd + 0.4, 24], [a.argent, a.banque, 22], [a.b4 + 0.2, a.sign + 0.2, 20], [a.eu4 - 0.6, a.doublent, 18], [a.quart - 0.3, a.b1 + 0.6, 18], [a.fou - 0.3, a.sur + 0.4, 18], [a.b3 + 0.1, a.acheter, 16]];
  DATES = [[a.en1803, '1803'], [a.fr4end + 2.0, null], [a.b1, '1682', '#8a5a14'], [a.b2, '1800', '#8a5a14'], [a.b3 + 0.2, null], [a.b4, '30 AVRIL 1803'], [a.eu4 - 0.2, null], [a.auj, "AUJOURD'HUI", '#1f5dff'], [a.b5, null], [a.sur, 'DÉC. 1803'], [a.argent, null]];

  // ---- sons et actions
  for (let i = 1; i < stops.length; i++) { const s = stops[i]; if (s.lin) continue; const p = cam(s.t - s.d - 0.01).s; if (Math.abs(Math.log(s.s / p)) > 0.25 || s.d >= 0.9) ev(s.t - s.d, 'whoosh'); }
  for (const L of LEGS) { ev(L.t0, L.spr.startsWith('ship') ? 'wave' : L.spr === 'canoe' ? 'water' : 'sparkle'); act(L.t0, L.spr, 'voyage'); }
  for (const f of FILLS) { ev(f.t0, 'scan'); }
  for (const p of PINS) ev(p.t + 0.05, 'pop');
  ev(a.sav, 'boing'); ev(a.ach, 'fall'); ev(a.ach + 0.35, 'thud'); ev(a.napo, 'pop'); act(a.napo, 'Napoléon', 'pointe');
  a.fr4.forEach(t => { ev(t, 'thud'); act(t, 'France', 'tombe sur la Louisiane'); }); ev(a.fr4[3] + 0.4, 'ding');
  ev(a.sept, 'stamp'); ev(a.sept + 0.1, 'sparkle'); ev(a.pq, 'boing'); ev(a.homme, 'shine'); act(a.homme, 'tableau', 'Napoléon'); ev(a.brade, 'stamp'); ev(a.quart + 0.1, 'pop');
  ev(a.b1, 'tic'); ev(a.salle, 'shine'); act(a.salle, 'tableau', 'La Salle'); ev(a.desc, 'draw'); ev(a.bassin, 'draw'); ev(a.roi, 'shine'); act(a.roi, 'couronne', 'apparaît'); ev(a.louisiane, 'type');
  ev(a.b2, 'tic'); ev(a.secret, 'stamp'); act(a.secret, 'traité', 'secret'); ev(a.empire, 'shine'); act(a.empire, 'tableau', 'Napoléon et les cartes'); ev(a.armee, 'shine'); act(a.armee, 'tableau', 'bataille'); ev(a.fievre, 'boing'); act(a.fievre, 'soldat', 'malade');
  ev(a.b3, 'pop'); act(a.b3, 'Napoléon', 'pointe'); ev(a.amer, 'pop'); act(a.amer, 'diplomate', "sac d'argent"); ev(a.nola, 'ping'); ev(a.propose, 'pop'); act(a.propose, 'Napoléon', 'traité'); ev(a.toute, 'stamp');
  ev(a.b4, 'tic'); ev(a.sign - 0.2, 'shine'); act(a.sign, 'tableau', 'signature'); ev(a.quinze, 'count'); ev(a.quinze + 0.2, 'sparkle'); ev(a.doublent, 'stamp'); act(a.doublent, 'diplomate', 'saute de joie'); ev(a.doublent + 0.1, 'cheer');
  ev(a.auj, 'draw'); ev(a.quinz, 'count'); ev(a.stLa, 'type'); ev(a.stMt, 'type'); act(a.quinz, 'États', 's\'allument');
  ev(a.fou, 'stamp'); ev(a.sur + 0.1, 'shine'); act(a.sur, 'tableau', 'drapeaux'); ev(a.drap + 0.9, 'pop'); ev(a.drap + 1.3, 'pop'); ev(a.vingt, 'count'); ev(a.vingt + 0.4, 'pop'); act(a.vingt, 'calendrier', '20 jours');
  ev(a.banque, 'pop'); ev(a.banque + 0.05, 'ping'); act(a.banque, 'banque', 'apparaît'); ev(a.guerre, 'impact'); act(a.guerre, 'navires', 'face à face'); ev(a.guerre + 0.2, 'stamp');
  ev(a.toi, 'boing'); ev(a.homme + 0.3, 'type'); ev(T(0, 'monde'), 'tic'); ev(a.b1 + 0.5, 'fall'); ev(a.b1 + 0.95, 'type'); act(a.b1 + 0.5, 'parchemin', '1682'); ev(a.salle + 0.25, 'type'); ev(a.salle + 1.1, 'tic'); ev(a.roi + 0.1, 'pop'); ev(a.b3 + 0.75, 'tic'); ev(a.b4 + 0.35, 'type'); ev(a.auj + 0.9, 'tic'); ev(a.quinz + 0.9, 'pop'); ev(a.sur + 0.35, 'type'); ev(a.toi + 1.0, 'tic'); act(a.toi, 'Napoléon', 'choqué'); ev(a.vendu6, 'pop'); ev(a.vendu6 + 0.25, 'pop'); ev(a.comm, 'ding');
  window.PREVIEW = [0.5, a.eu + 0.4, a.ach + 0.5, a.fr + 0.6, a.napo + 0.4, (a.vendu + a.terr) / 2, a.terr + 0.4, a.fr4[3] + 0.4, a.sept + 0.4, a.homme + 0.8, a.brade + 0.3, a.quart + 0.5, a.salle + 0.8, (a.desc + a.bassin) / 2, a.fleuve + 0.4, a.louisiane + 0.4, a.b2 + 0.6, a.secret + 0.3, a.empire + 0.6, a.sd - 0.6, a.haiti + 0.3, a.armee + 0.6, a.fievre + 0.4, a.amer + 0.4, a.nola + 0.3, a.toute + 0.4, a.sign + 0.6, a.quinze + 0.6, a.doublent + 0.4, a.quinz + 0.6, a.stMt + 0.4, a.fou + 0.2, a.drap + 0.4, a.vingt + 0.4, (a.argent + a.banque) / 2, a.anglaise + 0.3, a.napo5 + 0.6, a.guerre + 0.3, a.toi + 0.4, a.vendu6 + 0.4];
}
function tiltAt(t) { let v = 0; for (const [t0, t1, deg] of A.tilt) { if (t < t0 || t > t1 + 1) continue; v = Math.max(v, deg * Math.min(ease((t - t0) / 0.9), 1 - ease((t - t1) / 1))); } return v * Math.PI / 180; }
function angAt(t) { return (8 * Math.sin(2 * Math.PI * t / 13) + 3.5 * Math.sin(2 * Math.PI * t / 7 + 1)) * Math.PI / 180; }

// ============ CALQUE ÉCRAN ============
function screenScene(c, t) {
  const a = A; const BL = 1450, XL = 230, XR = 850;
  // accroche
  bigWord(c, 'SAVEZ-VOUS ?', 470, t, Math.max(0, a.sav - 0.15), a.ach - 0.1, { size: 120 });
  if (t > a.ach - 0.1 && t < a.fr + 0.1) { const p = S(-98, 39); dropSpr(c, 'moneybag', p.x, p.y + 140, 280, t, a.ach, a.fr - 0.3); }
  charSpr(c, 'napo_point', XL, BL, 420, t, a.napo - 0.1, a.terr - 0.1, { wob: 0.03 });
  if (t > a.terr && t < a.quatre) mapWrite(c, 'Louisiane', [-99, 41], t, a.terr + 0.1, a.quatre - 0.1, { size: 110 });
  if (t > a.fr4[3] + 0.3 && t < a.fr4end + 0.4) bigWord(c, '4 × LA FRANCE', 470, t, a.fr4[3] + 0.3, a.fr4end, { size: 112 });
  if (t > a.sept - 0.05 && t < a.mais + 0.3) { stampText(c, '7 $ LE KM²', W / 2, 480, t, a.sept, a.mais - 0.1, { col: '#178a3c', size: 104 }); dropSpr(c, 'coins', W / 2, BL, 210, t, a.sept + 0.1, a.mais - 0.1); }
  bigWord(c, '?', 520, t, a.pq - 0.1, a.homme - 0.05, { size: 320 });
  paintCard(c, ART.napo_portrait, t, a.homme - 0.1, a.brade - 0.1, 'NAPOLÉON BONAPARTE', { fy: 0.1 });
  stampText(c, 'BRADÉ !', W / 2, 520, t, a.brade, a.quart - 0.15, { size: 120 });
  if (t > a.quart && t < a.b1 + 0.2) { tag(c, '¼ DES ÉTATS-UNIS', W / 2, 470, { size: 72, bg: '#C00E1F', border: '#fff', sc: popIn(t, a.quart, 0.3) * fadeOut(t, a.b1 - 0.1, 0.25) }); c.save(); c.globalAlpha = 0.9 * clamp((t - a.quart) / 0.3) * fadeOut(t, a.b1 - 0.1, 0.25); c.restore(); }
  // 1682
  if (t > a.b1 + 0.4 && t < a.salle + 0.2) { c.save(); c.globalAlpha = fadeOut(t, a.salle - 0.15, 0.3); dropSpr(c, 'parchment', W / 2, 1420, 420, t, a.b1 + 0.5, a.salle - 0.15); if (t > a.b1 + 0.85) txt(c, typed('1682', t, a.b1 + 0.95, 0.4), W / 2, 1210, { size: 120, font: 'Caveat', weight: 700, color: '#4a2a08', shadow: false }); c.restore(); }
  paintCard(c, ART.lasalle, t, a.salle - 0.15, a.desc - 0.15, 'CAVELIER DE LA SALLE, 1682', { side: -1 });
  charSpr(c, 'crown', W / 2, 640, 250, t, a.roi - 0.1, a.louisiane - 0.2, { wob: 0.05 });
  if (t > a.roi && t < a.louisiane) tag(c, 'LOUIS XIV', W / 2, 700, { size: 58, bg: '#1f3c9a', border: '#f5d76e', sc: popIn(t, a.roi + 0.1, 0.3) * fadeOut(t, a.louisiane - 0.2, 0.2) });
  mapWrite(c, 'Louisiane', [-95, 40], t, a.louisiane - 0.15, a.b2 - 0.1, { size: 150 });
  // 1800
  charSpr(c, 'treaty', XR, BL, 330, t, a.recup - 0.1, a.reve, { wob: 0.05 });
  stampText(c, 'SECRET', XR, 1270, t, a.secret, a.reve, { size: 70, rot: 0.12 });
  paintCard(c, ART.napo_desk, t, a.empire - 0.25, a.sd - 1.6, "LE RÊVE D'UN EMPIRE", { y: 680 });
  paintCard(c, ART.stdomingue, t, a.armee - 0.15, a.fievre - 0.05, 'SAINT-DOMINGUE, 1802', { side: -1, y: 660 });
  charSpr(c, 'grenadier_sick', W / 2, BL, 400, t, a.fievre - 0.15, a.b3 + 0.2, { wob: 0.02 });
  if (t > a.fievre && t < a.b3 + 0.3) tag(c, 'FIÈVRE JAUNE', W / 2, 470, { size: 74, bg: '#e8b90c', color: '#1b1300', border: '#fff', sc: popIn(t, a.fievre, 0.3) * fadeOut(t, a.b3 + 0.1, 0.2) });
  // l'offre
  charSpr(c, 'napo_point', XL, BL, 420, t, a.b3 - 0.1, a.propose - 0.15, { wob: 0.03 });
  charSpr(c, 'diplo_bag', XR, BL, 410, t, a.amer - 0.1, a.toute + 0.6, { wob: 0.03, ph: 1 });
  charSpr(c, 'napo_scroll', XL, BL, 420, t, a.propose - 0.1, a.b4 - 0.1, { wob: 0.03 });
  { const p = S(NOLA[0], NOLA[1]); ping(c, p.x, p.y, t, a.nola - 0.05, null, a.propose - 0.1); if (t > a.nola && t < a.propose + 0.2) { c.save(); c.globalAlpha = fadeOut(t, a.propose - 0.1, 0.25); txt(c, typed('LA NOUVELLE-ORLÉANS', t, a.nola, 0.35), p.x, p.y - 95, { size: 58, stroke: '#000', sw: 10 }); c.restore(); } }
  if (t > a.toute && t < a.b4) tag(c, 'TOUTE LA LOUISIANE !', W / 2, 470, { size: 72, bg: '#1f5dff', border: '#fff', sc: stampScale(t, a.toute) * fadeOut(t, a.b4 - 0.15, 0.2) });
  // la vente
  paintCard(c, ART.signature, t, a.b4 + 0.1, a.quinze - 0.1, 'PARIS, 30 AVRIL 1803', { y: 700 });
  if (t > a.quinze && t < a.eu4) { counter(c, 15000000, t, a.quinze, a.quinze + 0.8, W / 2, 560, { suf: ' $', size: 118, until: a.eu4 - 0.3, label: 'POUR TOUTE LA LOUISIANE' }); dropSpr(c, 'moneybag', W / 2, BL, 330, t, a.quinze + 0.1, a.eu4 - 0.3); }
  stampText(c, 'x2', W / 2, 520, t, a.doublent, a.auj - 0.1, { size: 150, col: '#C00E1F', rot: -0.08 });
  charSpr(c, 'diplo_jump', XR, BL, 420, t, a.doublent, a.auj + 0.4, { wob: 0.08 });
  if (t > a.quinz && t < a.stLa + 0.1) tag(c, "≈ 15 ÉTATS AMÉRICAINS", W / 2, 470, { size: 64, bg: '#1f5dff', border: '#fff', sc: popIn(t, a.quinz, 0.3) * fadeOut(t, a.stLa - 0.1, 0.2) });
  if (t > a.stLa - 0.1 && t < a.b5) { const s = D.states.find(x => x.id === '22'); const p = S(...s.c); c.save(); c.globalAlpha = fadeOut(t, a.stMt - 0.05, 0.2); txt(c, typed('LOUISIANE', t, a.stLa, 0.3), p.x, p.y, { size: 64, stroke: '#000', sw: 11 }); c.restore(); }
  if (t > a.stMt - 0.1 && t < a.b5 + 0.3) { const s = D.states.find(x => x.id === '30'); const p = S(...s.c); c.save(); c.globalAlpha = fadeOut(t, a.b5, 0.25); txt(c, typed('MONTANA', t, a.stMt, 0.3), p.x, p.y, { size: 72, stroke: '#000', sw: 11 }); c.restore(); }
  // le plus fou
  stampText(c, 'LE PLUS FOU ?', W / 2, 520, t, a.fou - 0.3, a.sur, { size: 96, col: '#C00E1F' });
  paintCard(c, ART.drapeaux, t, a.sur, a.vingt - 0.35, 'LA NOUVELLE-ORLÉANS, 1803', { y: 680, fy: 0.05 });
  if (t > a.vingt - 0.3 && t < a.argent + 0.2) {
    const al = fadeOut(t, a.argent, 0.25); c.save(); c.globalAlpha = al; const y = 600;
    [['es', '30 NOV.', -330, 0], ['fr', '30 NOV.', 0, 0.12], ['us15', '20 DÉC.', 330, 0.45]].forEach(([f, d, dx, dl]) => { const s = popIn(t, a.vingt - 0.3 + dl, 0.3); c.save(); c.translate(W / 2 + dx, y); c.scale(s, s); flagCard(c, 0, 0, FL[f], 190); txt(c, d, 0, 120, { size: 44, stroke: '#000', sw: 9 }); c.restore(); });
    for (const dx of [-165, 165]) txt(c, '➜', W / 2 + dx, y, { size: 70, stroke: '#000', sw: 8 });
    c.restore();
    counter(c, 20, t, a.vingt, a.vingt + 0.6, W / 2, 860, { suf: ' JOURS', size: 120, until: a.argent - 0.1, label: 'DE DRAPEAU FRANÇAIS' });
  }
  if (t > a.banque - 0.15 && t < a.napo5 + 0.3) { const p = S(LONDON[0], LONDON[1]); c.save(); c.globalAlpha = fadeOut(t, a.napo5, 0.3); sprite(c, 'bank', p.x, p.y + 60, 280 * popIn(t, a.banque - 0.15, 0.35)); tag(c, 'BARINGS, LONDRES', p.x, p.y + 110, { size: 46, bg: '#1d1406', color: '#f3d98a', border: '#d9b25a', sc: popIn(t, a.banque + 0.1, 0.3) }); c.restore(); }
  if (t > a.guerre - 0.2 && t < a.b6 + 0.2) { const p = S(-1.3, 50.25), q = S(1.6, 50.4); const al = fadeOut(t, a.b6, 0.25); const s = popIn(t, a.guerre - 0.2, 0.35); c.save(); c.globalAlpha = al; for (const [nm, pp, r] of [['ship_uk', p, Math.PI / 2], ['ship_fr', q, -Math.PI / 2]]) { const img = SPR[nm]; const h = 320 * s; const w = h * img.width / img.height; c.save(); c.translate(pp.x, pp.y); c.rotate(r + 0.05 * Math.sin(t * 4)); c.drawImage(img, -w / 2, -h / 2, w, h); c.restore(); } c.restore(); stampText(c, 'GUERRE !', W / 2, 520, t, a.guerre + 0.15, a.b6 - 0.1, { size: 110 }); }
  // fin
  charSpr(c, 'napo_shock', W / 2, BL, 470, t, a.toi - 0.15, DUR + 1, { wob: 0.04 });
  bigWord(c, 'ET TOI ?', 470, t, a.toi - 0.05, DUR + 1, { size: 130 });
  if (t > a.vendu6) { tag(c, 'OUI', W / 2 - 170, 660, { size: 80, bg: '#178a3c', border: '#fff', sc: popIn(t, a.vendu6, 0.3) }); tag(c, 'NON', W / 2 + 170, 660, { size: 80, bg: '#C00E1F', border: '#fff', sc: popIn(t, a.vendu6 + 0.25, 0.3) }); }
  if (t > a.comm) tag(c, 'RÉPONDS EN COMMENTAIRE', W / 2, 800, { size: 50, bg: '#1d1406', color: '#FFE928', border: '#fff', sc: stampScale(t, a.comm) });
}

// ============ RENDU ============
window.render = function (t) {
  const st = cam(t); cam_s = st.s; ANG = angAt(t); TILT = tiltAt(t);
  P = d3.geoMercator().rotate([-st.lon, 0]).center([0, st.lat]).scale(st.s).translate([540 + OX, CY + OY]).precision(0).clipExtent([[0, 0], [MW, MH]]);
  drawSat(st);
  if (t > A.b1 - 0.3 && t < A.b2 + 0.3) { m.save(); m.globalAlpha = 0.22 * Math.min(clamp((t - A.b1 + 0.3) / 0.5), fadeOut(t, A.b2, 0.3)); m.fillStyle = '#9a6a1c'; m.globalCompositeOperation = 'multiply'; m.fillRect(0, 0, MW, MH); m.restore(); }
  drawFills(t); drawStates(t);
  if (t > A.quart - 0.1 && t < A.b1 + 0.3) { m.save(); m.globalAlpha = clamp((t - A.quart + 0.1) / 0.4) * fadeOut(t, A.b1, 0.3); pathM(GEO.usa); m.setLineDash([16, 10]); m.lineDashOffset = -t * 40; m.lineWidth = 5; m.strokeStyle = '#fff'; m.shadowColor = '#000'; m.shadowBlur = 8; m.stroke(); m.restore(); } drawFranceCopies(t); drawRivers(t); drawWakes(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#0b3a52'; ctx.fillRect(0, 0, W, H);
  if (TILT < 0.001) { ctx.save(); ctx.translate(540, CY); ctx.rotate(ANG); ctx.translate(-540 - OX, -CY - OY); ctx.drawImage(mapC, 0, 0); ctx.restore(); }
  else {
    rc.setTransform(1, 0, 0, 1, 0, 0); rc.clearRect(0, 0, MW, MH); rc.translate(540 + OX, CY + OY); rc.rotate(ANG); rc.translate(-540 - OX, -CY - OY); rc.drawImage(mapC, 0, 0); rc.setTransform(1, 0, 0, 1, 0, 0);
    const sn = Math.sin(TILT), cs = Math.cos(TILT), band = 6;
    for (let y = 0; y < H; y += band) { const a0 = y - CY, a1 = y + band - CY; const v0 = a0 * FOC / (FOC * cs + a0 * sn), v1 = a1 * FOC / (FOC * cs + a1 * sn); const k = FOC / (FOC - ((v0 + v1) / 2) * sn); const sy = CY + OY + v0; if (sy < 0 || sy + v1 - v0 > MH) continue; ctx.drawImage(rotC, 0, sy, MW, Math.max(1, v1 - v0), 540 - k * (540 + OX), y, MW * k, band + 0.6); }
    const hz = ctx.createLinearGradient(0, 0, 0, 500); hz.addColorStop(0, `rgba(200,225,240,${0.45 * TILT / 0.5})`); hz.addColorStop(1, 'rgba(200,225,240,0)'); ctx.fillStyle = hz; ctx.fillRect(0, 0, W, 500);
  }
  drawPins(ctx, t); drawTravelers(ctx, t);
  ctx.save(); ctx.globalAlpha = 0.07; ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = ctx.createPattern(GRAIN, 'repeat'); ctx.translate((t * 997) % 256, (t * 613) % 256); ctx.fillRect(-256, -256, W + 512, H + 512); ctx.restore();
  const vg = ctx.createRadialGradient(W / 2, H / 2, 700, W / 2, H / 2, 1250); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.35)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  if (!window.CLEAN) { screenScene(ctx, t); drawDate(ctx, t); drawSubs(ctx, t); }
};

const loadImg = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
window.init = async function () {
  canvas = document.getElementById('c'); ctx = canvas.getContext('2d');
  const [dd, tm] = await Promise.all(['data.json', 'timing.json'].map(u => fetch(u).then(r => r.json())));
  D = dd; WORDS = tm.words;
  LOWRES = await loadImg('../relief/relief_4096.jpg');
  await Promise.all(['fr', 'es', 'gb', 'us', 'us15', 'royal'].map(async k => { FL[k] = await loadImg('flags/' + k + '.svg'); }));
  const names = ['napo_point', 'napo_scroll', 'napo_shock', 'diplo_bag', 'diplo_jump', 'canoe', 'ship_fr', 'ship_uk', 'grenadier', 'grenadier_sick', 'treaty', 'moneybag', 'coins', 'bank', 'crown', 'parchment'];
  await Promise.all(names.map(async n => { SPR[n] = await loadImg('spr/' + n + '.png'); }));
  await Promise.all(['napo_portrait', 'napo_desk', 'lasalle', 'stdomingue', 'signature', 'drapeaux'].map(async n => { ART[n] = await loadImg('arch/' + n + '.jpg'); }));
  makeGrain(); buildSubs(SCRIPT); setup();
  { const need = new Set(); for (let t = 0; t <= DUR; t += 0.1) { const c = cam(t); for (const [tx, ty] of tilesFor(c)) need.add(ty + '_' + tx); } await Promise.all([...need].map(async n => { TILES[n] = await loadImg('../relief/tiles/' + n + '.jpg'); })); window.NTILES = need.size; }
  window.CAM = { dur: DUR, camAt: t => cam(t), angAt, tiltAt };
  window.VISUALS = SUBS.map(x => x.t0); window.DUR = DUR; window.READY = true;
};
