// scene.js — Every Time America Bought Land (16:9, 1920x1080). window.render(t) déterministe.
let DATA, WORLD, WORDS, DUR, cam, P, ANG = 0, CS = 1;
const IMG = {}, FL = {};
let canvas, ctx;
window.EVENTS = []; window.VISUALS = []; window.MISS = [];
const EV = (t, k) => { if (!isNaN(t)) EVENTS.push([+t.toFixed(3), k]); VISUALS.push(t); return t; };

// ---------- lieux ----------
const L = {
  nola: [-90.07, 29.95], wash: [-77.04, 38.9], paris: [2.35, 48.86], london: [-0.13, 51.5], ams: [4.9, 52.37], haiti: [-72.3, 18.9],
  sutter: [-120.89, 38.8], tucson: [-110.97, 32.22], yuma: [-114.62, 32.69], elpaso: [-106.49, 31.76], sitka: [-135.33, 57.05],
  stp: [30.3, 59.94], prudhoe: [-148.4, 70.25], ldio: [-168.92, 65.756], bdio: [-169.075, 65.78], stt: [-64.93, 18.34], stj: [-64.74, 18.33],
  stx: [-64.75, 17.73], colon: [-79.9, 9.36], panama: [-79.53, 8.97], manila: [120.98, 14.6], copen: [12.57, 55.68], nuuk: [-51.7, 64.18],
  mexico: [-99.13, 19.43], madrid: [-3.7, 40.42], berlin: [13.4, 52.5], nyc: [-74.0, 40.7], ilul: [-51.1, 69.22], juneau: [-134.4, 58.3]
};
const CANAL = [[-79.92, 9.35], [-79.85, 9.27], [-79.72, 9.18], [-79.65, 9.1], [-79.6, 9.03], [-79.55, 8.95]];
const RAIL = [[-114.6, 32.5], [-113.0, 32.4], [-111.6, 32.25], [-110.97, 32.22], [-109.9, 32.15], [-108.5, 32.0], [-107.2, 31.9], [-106.5, 31.78]];

// ---------- anclage sur la voix ----------
let CUR = 0;
function find(ph, from = CUR) {
  const p = ph.toLowerCase().split(/\s+/).map(norm).filter(Boolean);
  for (let i = from; i <= WORDS.length - p.length; i++) { let ok = true; for (let k = 0; k < p.length; k++) if (WORDS[i + k].n !== p[k]) { ok = false; break; } if (ok) return i; }
  MISS.push(ph); return -1;
}
const at = (ph, k = 0) => { const i = find(ph); return i < 0 ? NaN : WORDS[Math.min(WORDS.length - 1, i + k)].t0; };
const atE = (ph, k = 0) => { const i = find(ph); return i < 0 ? NaN : WORDS[Math.min(WORDS.length - 1, i + k)].t1; };
const go = ph => { const i = find(ph); if (i >= 0) CUR = i; return i < 0 ? NaN : WORDS[i].t0; };

// ---------- projection ----------
function proj(c) {
  CS = c.s;
  return d3.geoMercator().rotate([-c.lon, 0]).center([0, c.lat]).scale(c.s).translate([CX, CY]).precision(0.3)
    .clipExtent([[-1500, -1500], [W + 1500, H + 1500]]);
}
function scr(ll) { const p = P(ll); if (!p) return [-9999, -9999]; const x = p[0] - CX, y = p[1] - CY, c = Math.cos(ANG), s = Math.sin(ANG); return [CX + x * c - y * s, CY + x * s + y * c]; }
const kmPx = (km, lat) => km / 6371 * CS / Math.cos(lat * Math.PI / 180);
const ANGf = t => (5 * Math.sin(2 * Math.PI * t / 17) + 2.5 * Math.sin(2 * Math.PI * t / 9 + 1)) * Math.PI / 180;

// ---------- géométries ----------
function geo(key) {
  if (key.startsWith('st:')) return DATA.states[key.slice(3)];
  if (key.startsWith('c:')) { const id = key.slice(2); return DATA.c10[id] || (WORLD.c.find(c => c.id === id) || {}).g; }
  return DATA.zones[key];
}
function mapCoords(g, f) {
  const m = r => typeof r[0] === 'number' ? f(r) : r.map(m);
  return { type: g.type, coordinates: m(g.coordinates) };
}

// ---------- fond satellite ----------
const YMAX = Math.PI; // ln tan(pi/4 + 85.0511°/2)
function drawSat(c, cm) {
  const img = IMG.bm; const ww = cm.s * 2 * Math.PI;
  const yc = Math.log(Math.tan(Math.PI / 4 + cm.lat * Math.PI / 360));
  const x0 = CX + cm.s * ((-180 - cm.lon) * Math.PI / 180), y0 = CY - cm.s * (YMAX - yc);
  const vx0 = -900, vx1 = W + 900, vy0 = -900, vy1 = H + 900;
  c.imageSmoothingQuality = 'high';
  for (const k of [-1, 0, 1]) {
    const X0 = x0 + k * ww; const ix0 = Math.max(vx0, X0), ix1 = Math.min(vx1, X0 + ww), iy0 = Math.max(vy0, y0), iy1 = Math.min(vy1, y0 + ww);
    if (ix1 <= ix0 || iy1 <= iy0) continue;
    const sx = (ix0 - X0) / ww * img.width, sy = (iy0 - y0) / ww * img.height, sw = (ix1 - ix0) / ww * img.width, sh = (iy1 - iy0) / ww * img.height;
    c.drawImage(img, sx, sy, Math.max(1, sw), Math.max(1, sh), ix0, iy0, ix1 - ix0, iy1 - iy0);
  }
}
function natColor(lon, lat) {
  if (lat > 66 && lon > -75 && lon < -10) return '#dfe7ec';
  if (lat > 58) return '#7c8a66';
  if (lat < 24 && lon > -95 && lon < -55) return '#4f8a46';
  if (lon < -103 && lat < 42 && lat > 24) return '#b49b74';
  if (lon < -100) return '#8a9363';
  return '#6b8a4c';
}

// ---------- registres d'éléments ----------
const MAPL = [], SCR = [], CAMS = [];
let SEPIA = [], NIGHT = [];

function zoneStyleFill(c, g, st, a, flash) {
  if (a <= 0) return; const path = d3.geoPath(P, c);
  c.save(); c.globalAlpha = a; c.beginPath(); path(g);
  const FC = { us: '#2b4c9b', fr: '#2b4c9b', es: '#c60b1e', mx: '#0a7a4a', ru: '#d52b1e', dk: '#c8102e', gl: '#d00c33', ph: '#0038a8', pa: '#da121a', gb: '#1d3c8f', nl: '#ae1c28' };
  const uni = st.flag ? clamp((CS - 2500) / 2000) : 0;
  if (st.flag && uni > 0) { c.save(); c.globalAlpha = a * 0.5 * uni; c.fillStyle = FC[st.flag] || '#2b4c9b'; c.fill(); c.restore(); c.beginPath(); path(g); }
  if (st.flag && FL[st.flag] && uni < 1) {
    c.save(); c.clip(); const b = d3.geoPath(P).bounds(g); const [[x0, y0], [x1, y1]] = b; const bw = x1 - x0, bh = y1 - y0; const img = FL[st.flag];
    const r = Math.max(bw / img.width, bh / img.height); c.globalAlpha = a * (st.fa ?? 0.82) * (1 - uni);
    c.drawImage(img, (x0 + x1) / 2 - img.width * r / 2, (y0 + y1) / 2 - img.height * r / 2, img.width * r, img.height * r); c.restore();
  } else { c.fillStyle = st.color || '#E01515'; c.globalAlpha = a * (st.fa ?? 0.55); c.fill(); }
  c.globalAlpha = a; c.beginPath(); path(g);
  c.shadowColor = st.glow || 'rgba(255,255,255,.9)'; c.shadowBlur = 14; c.lineJoin = 'round';
  c.lineWidth = st.lw || 3.2; c.strokeStyle = st.line || '#fff'; c.stroke(); c.shadowColor = 'transparent';
  if (flash > 0) { c.beginPath(); path(g); c.globalAlpha = flash * 0.6; c.fillStyle = '#fff'; c.fill(); }
  c.restore();
}
// zone : clé, apparition, disparition, style, {flips:[[t, style]], din}
function Z(key, t0, t1, st, o = {}) {
  const g = geo(key); if (!g) { MISS.push('geo ' + key); return; }
  EV(t0, o.snd || 'scan');
  (o.flips || []).forEach(f => EV(f[0], 'scan'));
  MAPL.push((c, t) => {
    if (t < t0 || t > t1 + 0.4) return;
    let s = st, last = t0; for (const f of (o.flips || [])) if (t >= f[0]) { s = f[1]; last = f[0]; }
    const a = Math.min(clamp((t - t0) / (o.din || 0.35)), fadeOut(t, t1, 0.4)) * (o.alpha ?? 1) * (o.deep ? 1 : clamp(1 - (CS - 30000) / 20000));
    const fl = Math.max(0, 1 - (t - last) / 0.35) * (t >= last ? 1 : 0);
    zoneStyleFill(c, typeof g === 'function' ? g(t) : g, s, a, fl * (o.noflash ? 0 : 1));
  });
}
// forme déplacée (comparaison à vraie taille)
function MOVE(key, from, to, t0, dur, t1, st) {
  const g = geo(key); EV(t0, 'whoosh'); EV(t0 + dur, 'thud');
  const rA = d3.geoRotation([-from[0], -from[1]]);
  let cache = null, cacheP = -1;
  MAPL.push((c, t) => {
    if (t < t0 || t > t1 + 0.4) return;
    const p = ease(prog(t, t0, dur));
    if (p !== cacheP) { const M = d3.geoInterpolate(from, to)(p); const rM = d3.geoRotation([-M[0], -M[1]]); cache = mapCoords(g, q => rM.invert(rA(q))); cacheP = p; }
    zoneStyleFill(c, cache, st, Math.min(clamp((t - t0) / 0.25), fadeOut(t, t1, 0.4)), 0);
  });
}
// ligne (géodésique) progressive
function LINE(pts, t0, dur, t1, o = {}) {
  EV(t0, o.snd || 'draw');
  const dense = []; for (let i = 0; i < pts.length - 1; i++) { const f = d3.geoInterpolate(pts[i], pts[i + 1]); const n = o.n || 24; for (let k = 0; k < n; k++) dense.push(f(k / n)); } dense.push(pts.at(-1));
  MAPL.push((c, t) => {
    if (t < t0 || t > t1 + 0.4) return;
    const p = easeOut(prog(t, t0, dur)), n = Math.max(2, Math.ceil(dense.length * p));
    const q = dense.slice(0, n).map(x => P(x)); if (q.some(x => !x)) return;
    c.save(); c.globalAlpha = fadeOut(t, t1, 0.4); c.lineCap = 'round'; c.lineJoin = 'round';
    if (o.dash) { c.setLineDash(o.dash); c.lineDashOffset = -t * 30; }
    c.beginPath(); q.forEach((x, i) => i ? c.lineTo(x[0], x[1]) : c.moveTo(x[0], x[1]));
    c.lineWidth = (o.w || 7) + 5; c.strokeStyle = 'rgba(0,0,0,.45)'; c.stroke();
    c.shadowColor = o.color || '#F7EF08'; c.shadowBlur = 16; c.lineWidth = o.w || 7; c.strokeStyle = o.color || '#F7EF08'; c.stroke();
    c.setLineDash([]); const h = q.at(-1); c.beginPath(); c.arc(h[0], h[1], (o.w || 7) * 1.3, 0, 7); c.fillStyle = '#fff'; c.fill();
    c.restore();
  });
}
// étiquette écrite sur la carte (tourne avec elle)
function ML(s, ll, t0, t1, o = {}) {
  EV(t0, 'type');
  MAPL.push((c, t) => {
    if (t < t0 || t > t1 + 0.3) return; const p = P(ll); if (!p) return;
    c.save(); c.globalAlpha = fadeOut(t, t1, 0.3); c.translate(p[0] + (o.dx || 0), p[1] + (o.dy || 0)); if (o.rot) c.rotate(o.rot);
    const size = o.size || 44;
    txt(c, typed(s, t, t0, o.d || 0.45), 0, 0, { size, font: o.serif === false ? 'Poppins' : 'DejaVu Serif, Georgia, serif', weight: o.serif === false ? 800 : 700, color: o.color || '#fff', stroke: 'rgba(0,0,0,.8)', sw: size * 0.14 });
    c.restore();
  });
}
// ping de repérage
function PING(ll, t0, t1, name, o = {}) {
  EV(t0, 'ping');
  MAPL.push((c, t) => {
    if (t < t0 || t > t1 + 0.25) return; const p = P(ll); if (!p) return;
    const a = fadeOut(t, t1, 0.25), k = popIn(t, t0, 0.2), wave = ((t - t0) % 0.8) / 0.8;
    c.save(); c.globalAlpha = a; c.translate(p[0], p[1]);
    c.beginPath(); c.arc(0, 0, 26 + 50 * wave, 0, 7); c.lineWidth = 4; c.strokeStyle = `rgba(255,255,255,${0.8 * (1 - wave)})`; c.stroke();
    c.beginPath(); c.arc(0, 0, 26 * k, 0, 7); c.lineWidth = 6; c.strokeStyle = '#fff'; c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 10; c.stroke();
    c.beginPath(); c.arc(0, 0, 8 * k, 0, 7); c.fillStyle = o.dot || '#FFD21F'; c.fill();
    if (name) { c.rotate(-ANG); txt(c, typed(name, t, t0 + 0.05, 0.3), (o.left ? -44 : 44), 0, { size: o.size || 38, align: o.left ? 'right' : 'left', stroke: '#000', sw: 7 }); }
    c.restore();
  });
}
// sprite (debout), ancré à la carte (ll) ou à l'écran (xy)
function SPR(name, pos, t0, t1, h, o = {}) {
  EV(t0, o.snd || (o.screen ? 'pop' : 'fall')); if (!o.screen && !o.nofall) EV(t0 + 0.3, 'thud');
  (o.poses || []).forEach(p => EV(p[0], 'pop'));
  VISUALS.push(t0 + 0.6);
  SCR.push((c, t) => {
    if (t < t0 || t > t1 + 0.35) return;
    let nm = name; for (const p of (o.poses || [])) if (t >= p[0]) nm = p[1];
    const img = IMG['spr_' + nm]; if (!img) return;
    let [x, y] = o.screen ? SPS(pos[0], pos[1]) : scr(pos); x += o.dx || 0; y += o.dy || 0; const hh = VERT ? h * 0.85 : h;
    const a = fadeOut(t, t1, 0.3); const since = t - t0;
    let sy = 1, sx = 1, oy = 0;
    if (o.screen || o.nofall) { const k = popIn(t, t0, 0.35); sx = sy = k; }
    else { const f = easeIn(prog(t, t0, 0.3)); oy = -(1 - f) * 600; if (since > 0.3 && since < 0.55) { const q = (since - 0.3) / 0.25; sy = 1 - 0.18 * Math.sin(Math.PI * q); sx = 1 + 0.12 * Math.sin(Math.PI * q); } }
    const bob = Math.sin(t * 2.4 + (o.ph || 0)) * 0.025;
    const w = hh * img.width / img.height;
    c.save(); c.globalAlpha = a; c.translate(x, y + oy);
    c.save(); c.scale(1, 0.22); c.beginPath(); c.ellipse(0, 0, w * 0.38, w * 0.38, 0, 0, 7); c.fillStyle = 'rgba(0,0,0,.3)'; c.fill(); c.restore();
    c.rotate((o.rot || 0) + Math.sin(t * 1.7 + (o.ph || 0)) * 0.03); c.scale((o.flip ? -1 : 1) * sx * (1 + bob), sy * (1 - bob));
    c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 14; c.shadowOffsetY = 6;
    c.drawImage(img, -w / 2, -hh, w, hh); c.restore();
  });
}
// véhicule le long d'un trajet (vu de dessus ou de profil)
function VEH(name, pts, t0, t1, h, o = {}) {
  EV(t0, o.snd || 'whoosh');
  const dense = []; for (let i = 0; i < pts.length - 1; i++) { const f = d3.geoInterpolate(pts[i], pts[i + 1]); for (let k = 0; k < 30; k++) dense.push(f(k / 30)); } dense.push(pts.at(-1));
  const posAt = u => { const x = clamp(u) * (dense.length - 1), i = Math.floor(x), f = x - i; const a = dense[i], b = dense[Math.min(dense.length - 1, i + 1)]; return [lerp(a[0], b[0], f), lerp(a[1], b[1], f)]; };
  SCR.push((c, t) => {
    if (t < t0 - 0.2 || t > t1 + 0.6) return; const img = IMG['spr_' + name]; if (!img) return;
    const u = ease(prog(t, t0, t1 - t0)); const ll = posAt(u), [x, y] = scr(ll), [x2, y2] = scr(posAt(Math.min(1, u + 0.01)));
    const head = Math.atan2(y2 - y, x2 - x); const a = Math.min(clamp((t - t0 + 0.2) / 0.3), fadeOut(t, t1 + 0.3, 0.3));
    c.save(); c.globalAlpha = a;
    if (o.top) { // sillage
      c.save(); c.lineCap = 'round'; for (let k = 1; k < 14; k++) { const pa = scr(posAt(Math.max(0, u - k * 0.012))), pb = scr(posAt(Math.max(0, u - (k - 1) * 0.012))); c.beginPath(); c.moveTo(pa[0], pa[1]); c.lineTo(pb[0], pb[1]); c.lineWidth = 10 + k * 1.8; c.strokeStyle = `rgba(255,255,255,${0.35 * (1 - k / 14)})`; c.stroke(); } c.restore();
      c.translate(x, y); c.rotate(head + Math.PI / 2 + Math.sin(t * 3) * 0.04);
      const w = h * img.width / img.height; c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 18; c.shadowOffsetX = 10; c.shadowOffsetY = 12; c.drawImage(img, -w / 2, -h / 2, w, h);
    } else {
      const w = h * img.width / img.height; c.translate(x, y + Math.sin(t * 9) * 2); if (x2 < x) c.scale(-1, 1);
      c.save(); c.scale(1, 0.2); c.beginPath(); c.ellipse(0, 0, w * 0.45, w * 0.45, 0, 0, 7); c.fillStyle = 'rgba(0,0,0,.3)'; c.fill(); c.restore();
      c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 12; c.drawImage(img, -w / 2, -h, w, h);
    }
    c.restore();
  });
}
// --- éléments écran ---
function TAG(s, x, y, t0, t1, o = {}) { EV(t0, o.snd || 'pop'); [x, y] = SP(x, y); SCR.push((c, t) => { if (t < t0 || t > t1 + 0.3) return; tag(c, s, x, y + Math.sin(t * 2) * 3, { ...o, size: (o.size || 46) * SZ * (VERT && measure(c, s, (o.size || 46) * SZ) > 950 ? 950 / measure(c, s, (o.size || 46) * SZ) : 1), sc: popIn(t, t0, 0.3) * fadeOut(t, t1, 0.3) }); }); }
function STAMP(s, x, y, t0, t1, o = {}) {
  EV(t0, 'stamp'); [x, y] = SP(x, y);
  SCR.push((c, t) => {
    if (t < t0 || t > t1 + 0.3) return; const sc = lerp(2.3, 1, easeOut(prog(t, t0, 0.18))); const a = Math.min(clamp((t - t0) / 0.1), fadeOut(t, t1, 0.3));
    let size = (o.size || 76) * SZ; if (VERT && measure(c, s, size, 900) > 900) size *= 900 / measure(c, s, size, 900); const col = o.color || '#E0201B', tw = measure(c, s, size, 900) + 60, th = size * 1.35;
    c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(o.rot ?? -0.12); c.scale(sc, sc);
    c.fillStyle = 'rgba(255,255,255,.85)'; rr(c, -tw / 2, -th / 2, tw, th, 14); c.fill(); c.lineWidth = 9; c.strokeStyle = col; c.stroke();
    c.lineWidth = 3; rr(c, -tw / 2 + 10, -th / 2 + 10, tw - 20, th - 20, 8); c.stroke();
    txt(c, s, 0, 4, { size, weight: 900, color: col, shadow: false }); c.restore();
  });
}
function CNT(val, x, y, t0, dur, t1, o = {}) {
  [x, y] = SP(x, y);
  for (let k = 0; k < 8; k++) EV(t0 + dur * k / 8, 'tic'); EV(t0 + dur, 'ding');
  SCR.push((c, t) => {
    if (t < t0 || t > t1 + 0.3) return; const p = ease(prog(t, t0, dur)); const v = val * p;
    const bump = 1 + 0.1 * Math.max(0, 1 - Math.abs(t - t0 - dur) / 0.15); const k = popIn(t, t0, 0.25) * bump;
    c.save(); c.globalAlpha = fadeOut(t, t1, 0.3); c.translate(x, y); c.scale(k, k);
    const s = (o.pre || '') + (o.dec ? v.toFixed(o.dec) : fmt(v)) + (o.suf || ''); let size = (o.size || 96) * SZ; if (VERT && measure(c, s, size, 900) > 940) size *= 940 / measure(c, s, size, 900);
    txt(c, s, 0, 0, { size, weight: 900, color: o.color || '#FFE928', stroke: '#1b1300', sw: size * 0.12, blur: 18 });
    if (o.label) txt(c, o.label, 0, size * 0.72, { size: size * 0.36, color: '#fff', stroke: '#000', sw: 7 });
    c.restore();
  });
}
function DATE(s, t0, t1) { EV(t0, 'pop'); SCR.push((c, t) => { if (t < t0 || t > t1 + 0.25) return; tag(c, s, CX, (VERT ? 330 : 70) + Math.sin(t * 2) * 3, { size: 46, bg: '#C00E1F', border: 'rgba(255,255,255,.9)', sc: popIn(t, t0, 0.3) * fadeOut(t, t1, 0.25) }); }); }
let CHAPS = [];
function CHAP(t0, n, title, tEnd) {
  if (VERT) return;
  EV(t0 - 0.1, 'whoosh'); EV(t0 + 0.35, 'ding'); CHAPS.push({ t0, n, title, tEnd });
  SCR.push((c, t) => {
    if (t < t0 || t > t0 + 2.6) return; const pin = easeOut(prog(t, t0, 0.35)), pout = easeIn(prog(t, t0 + 2.2, 0.35));
    c.save(); c.globalAlpha = 0.45 * (1 - pout) * pin; c.fillStyle = '#000'; c.fillRect(0, 0, W, H); c.restore();
    const x = lerp(-1100, 0, pin) - pout * 1300;
    c.save(); c.translate(x, 0); c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 30;
    c.fillStyle = '#f5f0e3'; c.beginPath(); c.moveTo(0, 330); c.lineTo(1150, 330); c.lineTo(1080, 730); c.lineTo(0, 730); c.closePath(); c.fill(); c.shadowColor = 'transparent';
    txt(c, 'PART ' + n, 120, 420, { size: 74, font: 'Caveat', weight: 700, color: '#C00E1F', align: 'left', shadow: false });
    const hl = easeOut(prog(t, t0 + 0.45, 0.5)); const lines = title.split('|');
    lines.forEach((ln, i) => { const tw = measure(c, ln, 72, 900); c.fillStyle = '#FFD21F'; c.fillRect(110, 525 + i * 92 - 8, (tw + 20) * hl, 52); txt(c, ln, 120, 520 + i * 92, { size: 72, weight: 900, color: '#1b1b1b', align: 'left', shadow: false }); });
    c.restore();
  });
  SCR.push((c, t) => { if (t < t0 + 2.4 || t > tEnd) return; const a = Math.min(clamp((t - t0 - 2.4) / 0.4), fadeOut(t, tEnd - 0.3, 0.3)); c.save(); c.globalAlpha = a * 0.92; tag(c, 'PART ' + n + ' · ' + title.replace('|', ' '), 30 + measure(c, 'PART ' + n + ' · ' + title.replace('|', ' '), 26, 800) / 2 + 12, 40, { size: 26, bg: 'rgba(15,20,30,.8)', r: 8 }); c.restore(); });
}
// décor photo révélé en cercle depuis un point de la carte
function DECOR(img, ll, t0, t1) {
  EV(t0, 'sweep'); EV(t1, 'sweep');
  SCR.push((c, t) => {
    if (t < t0 || t > t1 + 0.6) return; const im = IMG[img]; const [px, py] = scr(ll);
    const R = Math.hypot(W, H); const r = t < t1 ? R * easeOut(prog(t, t0, 0.65)) : R * (1 - easeIn(prog(t, t1, 0.55)));
    const ox = lerp(px, CX, easeOut(prog(t, t0, 0.65))), oy = lerp(py, CY, easeOut(prog(t, t0, 0.65)));
    c.save(); c.beginPath(); c.arc(ox, oy, Math.max(1, r), 0, 7); c.clip();
    const z = 1.04 + 0.07 * prog(t, t0, t1 - t0 + 0.6); const sc = Math.max(W / im.width, H / im.height) * z;
    c.drawImage(im, CX - im.width * sc / 2 + Math.sin(t * 0.3) * 10, CY - im.height * sc / 2, im.width * sc, im.height * sc);
    const g = c.createRadialGradient(CX, CY, 400, CX, CY, 1150); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.45)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.restore();
    c.save(); c.beginPath(); c.arc(ox, oy, Math.max(1, r), 0, 7); c.lineWidth = 10; c.strokeStyle = 'rgba(255,255,255,.9)'; c.shadowColor = '#fff'; c.shadowBlur = 30; c.stroke(); c.restore();
  });
}
// pièce de monnaie dessinée (prix à l'acre)
function COIN(lbl, x, y, t0, t1, o = {}) {
  EV(t0, 'shine'); [x, y] = SPS(x, y);
  SCR.push((c, t) => {
    if (t < t0 || t > t1 + 0.3) return; const k = popIn(t, t0, 0.35) * fadeOut(t, t1, 0.3); const R = o.r || 90; const spin = Math.cos(Math.min(1, (t - t0) / 0.6) * Math.PI * 4);
    c.save(); c.translate(x, y + Math.sin(t * 2.2) * 5); c.scale(k * (0.25 + 0.75 * Math.abs(spin)), k);
    c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 20; c.shadowOffsetY = 8;
    const g = c.createRadialGradient(-R * 0.3, -R * 0.3, 10, 0, 0, R); g.addColorStop(0, o.c0 || '#f4c57a'); g.addColorStop(1, o.c1 || '#a8642a');
    c.beginPath(); c.arc(0, 0, R, 0, 7); c.fillStyle = g; c.fill(); c.shadowColor = 'transparent';
    c.lineWidth = 6; c.strokeStyle = o.c2 || '#7a4418'; c.stroke(); c.beginPath(); c.arc(0, 0, R * 0.82, 0, 7); c.lineWidth = 3; c.stroke();
    txt(c, lbl, 0, 4, { size: R * 0.72, weight: 900, color: '#fff7e0', stroke: o.c2 || '#7a4418', sw: 8 });
    if (o.sub) txt(c, o.sub, 0, R + 34, { size: 32, color: '#fff', stroke: '#000', sw: 6 });
    c.restore();
  });
}
function SEP(t0, t1) { SEPIA.push([t0, t1]); }
function NGT(t0, t1) { NIGHT.push([t0, t1]); }
function K(t, lon, lat, s, d = 1.4, o = {}) { if (!isNaN(t)) CAMS.push({ t, d, lon, lat, s, ...o }); if (!isNaN(t)) EV(t - d, d > 1.6 ? 'whoosh' : 'sweep'); }

// ---------- barres du classement final ----------
function BARS(t0, t1) {
  if (VERT) return;
  const D = [['ALASKA · 1867', 0.02, '2¢', '#3DA35D'], ['LOUISIANA · 1803', 0.028, '3¢', '#3DA35D'], ['MEXICAN CESSION · 1848', 0.045, '≈5¢', '#9BBF3A'], ['GADSDEN · 1853', 0.53, '53¢', '#E8A33A'], ['VIRGIN ISLANDS · 1917', 291, '$291', '#E0201B']];
  D.forEach((d, i) => EV(t0 + 0.4 + i * 0.35, 'pop'));
  SCR.push((c, t) => {
    if (t < t0 || t > t1 + 0.4) return; const a = Math.min(clamp((t - t0) / 0.3), fadeOut(t, t1, 0.4));
    c.save(); c.globalAlpha = a; c.fillStyle = 'rgba(12,16,24,.82)'; rr(c, 260, 150, 1400, 700, 26); c.fill();
    txt(c, 'PRICE PER ACRE', CX, 215, { size: 54, weight: 900, color: '#FFD21F' });
    D.forEach(([n, v, lbl, col], i) => {
      const p = easeOut(prog(t, t0 + 0.4 + i * 0.35, 0.6)); const y = 320 + i * 112; const wmax = 760;
      const wv = (Math.log10(v) + 2) / (Math.log10(291) + 2) * wmax; txt(c, n, 760, y, { size: 34, align: 'right', color: '#fff', weight: 800 });
      rr(c, 790, y - 30, Math.max(20, wv * p), 60, 10); c.fillStyle = col; c.fill();
      if (p > 0.9) txt(c, lbl, 790 + wv * p + 20, y, { size: 44, weight: 900, align: 'left', color: '#fff', stroke: '#000', sw: 6 });
    });
    txt(c, '(scale: logarithmic)', CX, 815, { size: 22, color: 'rgba(255,255,255,.6)', shadow: false, weight: 600 });
    c.restore();
  });
}

// ---------- sous-titres ----------
let SUBS = [];
function buildSubs() {
  let g = [];
  const flush = () => { if (g.length) SUBS.push({ s: g.map(x => x.w).join(' '), t0: g[0].t0, t1: g.at(-1).t1 }); g = []; };
  WORDS.forEach((x, i) => { g.push(x); const end = /[.,!?:;]$/.test(x.w); if ((end && g.length >= 2) || g.length >= 5 || (WORDS[i + 1] && WORDS[i + 1].b !== x.b)) flush(); });
  flush(); SUBS.forEach((s, i) => { const n = SUBS[i + 1]; s.tEnd = n ? Math.min(n.t0, s.t1 + 0.6) : s.t1 + 0.5; });
}
function drawSubs(c, t) {
  const s = SUBS.find(x => t >= x.t0 - 0.05 && t < x.tEnd); if (!s) return;
  const size = VERT ? 62 : 50; c.save(); c.font = `800 ${size}px Poppins`; const tw = c.measureText(s.s).width; const sc = Math.min(1, (VERT ? 960 : 1500) / tw);
  c.translate(CX, VERT ? 1330 : 1000); c.scale(sc, sc); c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  c.lineWidth = 11; c.strokeStyle = '#000'; c.strokeText(s.s, 0, 0); c.fillStyle = '#fff'; c.fillText(s.s, 0, 0); c.restore();
}

// ---------- îles Diomède (dessinées à vraie taille) ----------
function diomede(c) {
  if (CS < 40000) return; const a = clamp((CS - 40000) / 60000);
  const isl = [[L.ldio, 1.6, 1.25, 0.2], [L.bdio, 1.9, 4.4, 0.15]];
  for (const [ll, rx, ry, rot] of isl) {
    const p = P(ll); if (!p) continue; const kx = kmPx(rx, ll[1]), ky = kmPx(ry, ll[1]);
    c.save(); c.globalAlpha = a; c.translate(p[0], p[1]); c.rotate(rot);
    c.beginPath(); for (let k = 0; k <= 40; k++) { const th = k / 40 * 2 * Math.PI, wob = 1 + 0.08 * Math.sin(th * 5 + ll[0]) + 0.05 * Math.sin(th * 9); c.lineTo(Math.cos(th) * kx * wob, Math.sin(th) * ky * wob); }
    c.closePath(); c.fillStyle = '#6f7a5e'; c.shadowColor = 'rgba(255,255,255,.6)'; c.shadowBlur = 20; c.fill(); c.shadowColor = 'transparent'; c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,.7)'; c.stroke();
    c.restore();
  }
}

// ---------- dessin de la carte ----------
function drawMap(c, t, cm) {
  c.fillStyle = '#0b3346'; c.fillRect(-1500, -1500, W + 3000, H + 3000);
  drawSat(c, cm);
  const path = d3.geoPath(P, c);
  // terre "naturelle" quand l'image devient floue
  const la = clamp((cm.s - 1600) / 5000) * 0.78;
  if (la > 0) {
    c.save(); c.globalAlpha = la; c.beginPath(); path(WORLD.land); if (cm.s > 6000) for (const id of ['850', '591', '170', '630', '092', '192']) if (DATA.c10[id]) path(DATA.c10[id]);
    c.fillStyle = natColor(cm.lon, cm.lat); c.fill();
    if (GRAIN) { c.globalAlpha = la * 0.25; c.fillStyle = c.createPattern(GRAIN, 'repeat'); c.fill(); }
    c.restore();
  }
  diomede(c);
  // frontières
  c.save(); c.beginPath(); path(WORLD.b); c.lineWidth = 1.4; c.strokeStyle = 'rgba(255,255,255,.55)'; c.stroke();
  if (cm.s > 900) { c.beginPath(); for (const n in DATA.states) path(DATA.states[n]); c.lineWidth = 0.9; c.strokeStyle = 'rgba(255,255,255,.25)'; c.stroke(); }
  c.beginPath(); path(WORLD.land); c.lineWidth = 1.2; c.strokeStyle = 'rgba(255,255,255,.22)'; c.stroke(); c.restore();
  for (const f of MAPL) f(c, t);
  // sépia (histoire) et nuit
  let sp = 0; for (const [a, b] of SEPIA) sp = Math.max(sp, Math.min(clamp((t - a) / 0.6), 1 - clamp((t - b) / 0.6)));
  if (sp > 0) { c.save(); c.globalAlpha = 0.38 * sp; c.globalCompositeOperation = 'color'; c.fillStyle = '#9c7a48'; c.fillRect(-1500, -1500, W + 3000, H + 3000); c.restore(); }
}
function overlays(c, t) {
  let ng = 0; for (const [a, b] of NIGHT) ng = Math.max(ng, Math.min(clamp((t - a) / 0.4), 1 - clamp((t - b) / 0.4)));
  if (ng > 0) { c.save(); c.globalAlpha = 0.55 * ng; c.fillStyle = '#071029'; c.fillRect(0, 0, W, H); c.restore(); }
  const v = c.createRadialGradient(CX, CY, 500, CX, CY, 1150); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.35)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
}

// ============ TIMELINE ============
function setup() {
  const F = { us: { flag: 'us' }, fr: { flag: 'fr' }, es: { flag: 'es' }, mx: { flag: 'mx' }, ru: { flag: 'ru' }, dk: { flag: 'dk' }, gl: { flag: 'gl' }, ph: { flag: 'ph' }, pa: { flag: 'pa' }, gb: { flag: 'gb' }, red: { color: '#E01515' }, gold: { color: '#FFC22E', fa: 0.6 }, blue: { color: '#2F6BD8', fa: 0.55 }, white: { color: '#ffffff', fa: 0.25 } };
  const END = WORDS.at(-1).t1; DUR = END + 0.6;
  const US = [-97, 38.5];

  // ===== ACCROCHE =====
  const a1803 = at('in 1803'), doubled = at('doubled in size'), overnight = at('overnight'), cents = at('three cents'), a1867 = at('in 1867'), texas0 = at('twice the size of texas', 4),
    folly = at('called it a folly', 3), a1946 = at('in 1946'), island = at('biggest island'), gold0 = at('with gold', 1), fighting = at('by fighting'), shopping = at('by shopping', 1),
    every0 = at('this is every time'), best0 = at('which deal was the best'), expensive0 = at('the most expensive');
  K(0, -95, 40, 1250, 0.1, { drift: 0.02 });
  K(doubled + 0.2, -95, 40, 1500, 1.2);
  Z('east1803', 0, a1867 - 0.3, F.blue, { snd: 'scan' }); Z('louisiana', doubled, a1867 - 0.3, F.us);
  TAG('×2', 1460, 300, doubled + 0.3, a1867 - 0.4, { size: 86, bg: '#E0201B' });
  DATE('1803', a1803, a1867 - 0.3);
  COIN('3¢', 1460, 560, cents, a1867 - 0.4, { sub: 'PER ACRE' });
  K(a1867 + 0.4, -150, 62, 900, 1.6, { drift: 0.025 });
  DATE('1867', a1867, a1946 - 0.3); Z('alaska', a1867 + 0.4, a1946 - 0.3, F.us);
  MOVE('texas', [-99, 31], [-155, 64], texas0 - 0.3, 1.0, a1946 - 0.4, F.gold); MOVE('texas', [-99, 31], [-143, 63.2], texas0 + 0.25, 1.0, a1946 - 0.4, F.gold);
  TAG('2× TEXAS', 1460, 250, texas0 + 0.9, a1946 - 0.4, { bg: '#C00E1F', size: 54 });
  SPR('crieur', [1500, 900], folly - 0.1, a1946 - 0.4, 300, { screen: true });
  K(a1946 + 0.5, -42, 71, 650, 1.7, { drift: 0.03 });
  DATE('1946', a1946, fighting - 0.3); Z('c:304', island - 0.2, fighting - 0.3, F.gl);
  SPR('us1946', [1480, 880], gold0 - 0.3, fighting - 0.3, 330, { screen: true, snd: 'shine' });
  STAMP('SECRET OFFER', 1460, 230, island + 0.3, fighting - 0.3, { rot: -0.1, size: 60 });
  K(fighting + 0.2, -100, 42, 520, 1.5, { drift: 0.02 });
  ['louisiana', 'florida', 'mexc', 'gadsden', 'alaska'].forEach((k, i) => Z(k, shopping - 0.4 + i * 0.25, every0 + 3.2, F.gold, { noflash: true }));
  Z('c:304', shopping + 0.9, every0 + 3.2, F.white);
  STAMP('SHOPPING', 960, 230, shopping, every0 + 3.0, { color: '#2E8B57', rot: -0.08, size: 90 });
  TAG('EVERY TIME AMERICA BOUGHT LAND', CX, 820, every0, best0 + 2.5, { size: 60, bg: '#111', border: '#FFD21F' });
  K(every0 + 1.5, -100, 45, 600, 2.0, { drift: 0.02 });
  TAG('BEST DEAL?', 600, 300, best0 + 0.3, go('part one'), { bg: '#2E8B57' }); TAG('MOST EXPENSIVE?', 1320, 300, expensive0 + 0.3, go('part one'), { bg: '#C00E1F' });

  // ===== PARTIE 1 : LOUISIANE =====
  const p1 = go('part one'); const p2s = at('part two');
  CHAP(p1, 1, 'THE DEAL|OF THE CENTURY', p2s - 0.3); SEP(p1, p2s - 0.5);
  const its1803 = at("it's 1803"), squeezed = at('squeezed'), westm = at('everything west'), france1 = at('belongs to france', 2), napo1 = at('one man napoleon', 2),
    oneCity = at('only wants one city'), nola = at('new orleans'), farmer = at('every farmer'), door = at('door to the sea'), jeff = at('president thomas jefferson'),
    paris = at('to paris'), ten = at('ten million dollars'), problem = at('napoleon has a problem'), haiti = at('war in haiti', 2), britain = at('war with britain', 2),
    money = at('he needs money'), fast = at('fast'), offer = at('make an offer'), minister = at("napoleon's minister"), whole = at('the whole of louisiana'),
    cityAll = at('why buy a city'), sq828 = at('eight hundred and twentyeight'), m15 = at('for fifteen million'), c3 = at('about three cents'), signature = at('with one signature'),
    fifteen = at('all or part of fifteen'), montana = at('to montana', 1), livingston = at('robert livingston'), noblest = at('noblest work'), twist = at("and here's the twist"),
    cash = at("didn't have the cash"), banks = at('two banks'), baring = at('baring brothers'), hope = at('hope and company'), amst = at('in amsterdam', 1), bankers = at('british bankers'),
    payNap = at('helped pay napoleon', 1), backWar = at('back to war');
  K(p1 + 0.1, -88, 38, 1500, 1.8, { drift: 0.02 });
  DATE('1803', its1803, door + 1.5);
  Z('east1803', squeezed - 0.2, p2s - 0.5, F.blue, { flips: [[signature, F.us]] });
  ML('UNITED STATES', [-82, 38], squeezed, westm, { size: 46 });
  LINE(DATA.miss.map(x => x).reverse(), westm - 0.2, 1.4, nola + 1, { color: '#4fc3ff', w: 6, n: 4, snd: 'water' });
  ML('MISSISSIPPI', [-91.6, 35.5], westm + 0.5, oneCity, { size: 34, rot: -1.2 });
  Z('louisiana', france1 - 0.1, p2s - 0.5, F.fr, { flips: [[signature, F.us]] });
  ML('LOUISIANA', [-100, 42], france1 + 0.2, oneCity, { size: 58 });
  SPR('napo_a', [-104, 44.5], napo1 - 0.1, oneCity - 0.2, 330, { snd: 'fall' });
  K(oneCity + 0.2, -90.5, 31.5, 5200, 1.6, { drift: 0.03 });
  PING(L.nola, nola - 0.4, farmer + 0.4, 'NEW ORLEANS');
  DECOR('decor_nola', L.nola, farmer + 0.1, door + 1.0);
  K(jeff + 0.1, -77.5, 39, 4200, 1.5);
  SPR('pres_a', L.wash, jeff, paris + 0.5, 300, { dx: -30 });
  PING(L.wash, jeff - 0.3, paris, 'WASHINGTON', { left: true });
  K(paris + 0.4, -38, 44, 700, 1.7, { drift: 0.02 });
  VEH('navire', [[-75.5, 37], [-60, 41], [-30, 45], [-10, 47], [-1.5, 49.3]], paris - 0.2, problem - 0.2, 120, { top: true, snd: 'water' });
  ML('PARIS', [2.35, 48.86], paris + 0.5, problem, { size: 40, dy: -40 });
  CNT(10000000, 960, 220, ten - 0.1, 1.0, problem - 0.2, { pre: 'MAX $', size: 80 });
  K(problem + 0.2, -38, 32, 560, 1.4);
  PING(L.haiti, haiti - 0.3, money, 'HAITI', { left: true }); Z('c:332', haiti - 0.2, money, F.red);
  Z('c:826', britain - 0.3, money, F.gb); TAG('WAR WITH BRITAIN', 1500, 250, britain, money, { bg: '#C00E1F' });
  SPR('napo_a', [430, 900], problem, money - 0.1, 320, { screen: true, flip: true });
  SPR('napo_b', [430, 900], money - 0.05, offer, 320, { screen: true, flip: true, snd: 'shine' });
  TAG('NEEDS MONEY. FAST.', 430, 520, money, offer - 0.1, { bg: '#111', border: '#FFD21F' });
  K(offer + 0.3, -97, 41, 1450, 1.5, { drift: 0.025 });
  TAG('"WHAT WOULD YOU GIVE FOR THE WHOLE?"', CX, 200, whole - 0.3, sq828 - 0.3, { size: 44, bg: '#111', border: '#fff' });
  STAMP('EVERYTHING', 1450, 760, cityAll + 0.6, sq828 - 0.2, { color: '#E0201B' });
  CNT(828000, 1460, 230, sq828 - 0.1, 1.4, signature - 0.3, { suf: ' SQ MI', size: 76, label: '(≈2,140,000 km²)' });
  CNT(15000000, 1460, 420, m15, 1.0, signature - 0.3, { pre: '$', size: 76, color: '#7CFC7C' });
  COIN('3¢', 1460, 650, c3, signature + 0.5, { sub: 'PER ACRE' });
  TAG('×2', 1460, 300, signature + 0.4, fifteen - 0.2, { size: 90, bg: '#E0201B' });
  K(fifteen + 0.2, -99, 40, 1700, 1.4, { drift: 0.02 });
  DATA.fifteen.forEach((n, i) => { const t = fifteen + 0.15 + i * 0.16; Z('st:' + n, t, livingston, F.gold, { noflash: false, snd: 'tic' }); });
  CNT(15, 1600, 230, fifteen, 2.4, livingston - 0.2, { suf: ' STATES', size: 76 });
  SPR('diplomate', [1500, 900], livingston - 0.1, twist - 0.2, 300, { screen: true });
  TAG('"THE NOBLEST WORK OF OUR WHOLE LIVES"', 820, 220, noblest - 0.3, twist - 0.2, { size: 40, bg: '#111', border: '#FFD21F' });
  K(twist + 0.3, -10, 47, 1500, 1.8, { hop: 1.0, drift: 0.02 });
  STAMP('NO CASH', 1450, 250, cash, banks, { rot: -0.1 });
  PING(L.london, baring - 0.2, bankers + 0.5, 'LONDON', { left: true }); PING(L.ams, hope, bankers + 0.5, 'AMSTERDAM');
  Z('c:826', baring - 0.1, p2s - 0.5, F.gb); Z('c:528', hope, p2s - 0.5, { flag: 'nl' }); Z('c:250', payNap - 0.4, p2s - 0.5, F.fr);
  SPR('banquier', L.london, banks + 0.2, p2s - 0.5, 260, { dx: -60 });
  LINE([L.london, L.paris], bankers + 0.4, 0.6, p2s - 0.5, { color: '#7CFC7C', w: 6 });
  SPR('napo_b', L.paris, payNap - 0.2, p2s - 0.5, 260, { dx: 70 });
  TAG('ENEMIES AT WAR!', 960, 230, backWar - 0.1, p2s - 0.5, { bg: '#E0201B', size: 54 });

  // ===== PARTIE 2 : FLORIDE, MEXIQUE, GADSDEN =====
  const p2 = go('part two'); const p3s = at('part three');
  CHAP(p2, 2, 'THE SOUTH, THE WAR|AND A RAILROAD', p3s - 0.3);
  const flo = at('florida'), y1819 = at('in 1819'), weak = at('too weak'), hands = at('hands it over'), check = at('write spain a check', 2), five = at('five million dollars'),
    biggest = at('the biggest and'), y1846 = at('in 1846'), war = at('to war with mexico'), y2 = at('two years later'), treaty = at('treaty of guadalupe'), sq500 = at('five hundred thousand square'),
    calif = at('california nevada'), m15b = at('fifteen million'), purchase = at('a purchase yes'), afterWar = at('signed after a war'), counting = at('counting texas'), half = at('half of its territory'),
    timing = at('the timing'), jan = at('january twentyfourth'), sutter = at("sutter's mill"), nine = at('nine days later'), rush = at('gold rush'), notFin = at("border still wasn't"),
    strip = at('look at this strip'), y1853 = at('in 1853'), m10 = at('ten million dollars'), why2 = at('why a railroad'), engineers = at('engineers said'), gadsden = at('gadsden purchase'),
    tucson = at('tucson'), border = at('looks like this today');
  K(p2 + 0.3, -84, 29.5, 3200, 1.8, { drift: 0.025 });
  DATE('1819', y1819, biggest - 0.3);
  Z('florida', flo - 0.2, p3s - 0.5, F.es, { flips: [[hands + 0.3, F.us]] });
  SPR('espagnol', [-82.2, 28.6], weak - 0.2, check + 0.5, 280, {});
  STAMP('NO CHECK', 1450, 260, check, five + 1.5, { rot: -0.1 });
  CNT(5000000, 1450, 470, five - 0.1, 1.0, biggest - 0.3, { pre: '$', suf: ' OF CLAIMS', size: 64 });
  K(biggest + 0.3, -106, 32, 1150, 1.7, { drift: 0.02 });
  Z('c:484', y1846 - 0.2, nine, F.mx); Z('mexc', y1846, treaty + 0.2, F.mx, { alpha: 0.95 }); Z('texas', counting - 0.3, nine, F.gold);
  DATE('1846', y1846, y2); DATE('1848', y2, nine);
  SPR('us_officer', [520, 880], war - 0.2, treaty, 300, { screen: true }); SPR('mex_officer', [1400, 880], war, treaty, 300, { screen: true });
  STAMP('WAR', 960, 300, war + 0.2, y2, { size: 100 });
  SPR('traite', [1450, 900], treaty - 0.1, m15b + 1.0, 250, { screen: true });
  Z('mexc', treaty + 0.2, p3s - 0.5, F.us, {});
  SEP(p2, at('the timing'));
  CNT(500000, 1450, 230, sq500 - 0.1, 1.2, afterWar, { pre: '≈', suf: ' SQ MI', size: 76 });
  ML('CALIFORNIA', [-119.5, 37.2], calif - 0.1, half, { size: 34, serif: false }); ML('NEVADA', [-116.8, 39.4], calif + 0.3, half, { size: 34, serif: false }); ML('UTAH', [-111.6, 39.3], calif + 0.6, half, { size: 34, serif: false });
  CNT(15000000, 1450, 400, m15b - 0.1, 1.0, half - 0.3, { pre: '$', size: 72, color: '#7CFC7C' });
  STAMP('AFTER A WAR', 1450, 560, afterWar, counting, { color: '#E0201B', size: 64 });
  TAG('≈ HALF OF MEXICO', 1450, 300, half - 0.2, timing, { bg: '#C00E1F', size: 54 });
  K(timing + 0.3, -120.5, 38.6, 9000, 1.6, { drift: 0.03 });
  DATE('JAN 24, 1848', jan - 0.1, nine + 0.2);
  PING(L.sutter, sutter - 0.4, rush + 1, "SUTTER'S MILL");
  SPR('prospector', L.sutter, sutter, rush + 1.2, 260, { dy: -20, snd: 'fall' });
  TAG('+9 DAYS → TREATY SIGNED', 1450, 250, nine - 0.1, rush + 1.0, { bg: '#111', border: '#FFD21F', size: 44 });
  STAMP('GOLD RUSH!', 1400, 760, rush - 0.2, notFin, { color: '#D4A017', size: 80 });
  K(strip + 0.2, -110.6, 32.3, 6500, 1.7, { drift: 0.03 });
  Z('gadsden', strip - 0.1, p3s - 0.5, { color: '#FF8C1A', fa: 0.7 }, { flips: [[y1853 + 0.2, F.us]] });
  DATE('1853', y1853, gadsden + 1);
  CNT(10000000, 1450, 230, m10 - 0.1, 1.0, why2, { pre: '$', size: 72, color: '#7CFC7C' });
  STAMP('WHY?', 1450, 230, why2 + 0.2, engineers, { size: 90 });
  VEH('train', RAIL, engineers - 0.1, tucson + 1.5, 110, { snd: 'train' });
  ML('GADSDEN PURCHASE', [-110.5, 31.6], gadsden - 0.1, p3s - 0.5, { size: 40 });
  PING(L.tucson, tucson - 0.3, p3s - 0.5, 'TUCSON');
  K(border + 0.1, -105, 33, 2600, 1.5, { drift: -0.02 });

  // ===== PARTIE 3 : ALASKA =====
  const p3 = go('part three'); const p4s = at('part four');
  CHAP(p3, 3, "SEWARD'S ICEBOX", p4s - 0.3); SEP(p3, at('then came gold') - 0.3);
  const y67 = at('1867'), russia = at('russia owns'), alaska = at('alaska but'), far = at('far from the russian'), defend = at('hard to defend'), britain3 = at('to britain anyway', 1), sell = at('offers to sell'),
    seward = at('william seward'), night = at('through the night'), four = at('four in the morning'), price = at('the price seven'), sq586 = at('five hundred and eightysix'), c2 = at('about two cents'),
    twice = at('more than twice the size of texas'), top = at('put it on top'), coast = at('coast to coast'), laughed = at('critics laughed'), icebox = at("called it seward's", 2), walrus = at('walrussia'),
    gold1890 = at('then came gold'), oil = at('in 1968'), prudhoe = at('prudhoe bay'), chest = at('treasure chest'), onemore = at('one more thing'), little = at('from little diomede'),
    seeR = at('you can see russia', 3), bigD = at('big diomede'), half2 = at('two and a half miles');
  K(p3 + 0.3, -150, 61, 900, 2.0, { hop: 0.6, drift: 0.02 });
  DATE('1867', y67, sell + 0.5);
  Z('alaska', russia - 0.2, p4s - 0.5, F.ru, { flips: [[four, F.us]] });
  DECOR('decor_alaska', [-141, 60.3], alaska + 0.1, far - 0.1);
  K(far + 0.4, -80, 60, 260, 1.6, { drift: 0.02 });
  PING(L.stp, far - 0.1, sell, 'ST. PETERSBURG');
  LINE([L.stp, [60, 66], [120, 70], [170, 66], L.sitka], far + 0.2, 1.0, sell, { color: '#ff6b6b', w: 5, dash: [16, 12] });
  Z('c:124', britain3 - 0.4, sell + 0.3, F.gb, { alpha: 0.75 });
  SPR('russe', [-152, 64], sell - 0.3, night + 0.5, 270, {});
  K(seward + 0.2, -150, 61, 1100, 1.4, { drift: 0.025 });
  NGT(night - 0.2, price - 0.2);
  SPR('seward', [1450, 880], seward, price, 300, { screen: true });
  TAG('4:00 AM', 1450, 300, four - 0.1, price, { bg: '#111', border: '#FFD21F', size: 70 });
  CNT(7200000, 1450, 260, price + 0.3, 1.0, twice - 0.3, { pre: '$', size: 76, color: '#7CFC7C' });
  CNT(586000, 1450, 450, sq586 - 0.1, 1.2, twice - 0.3, { suf: ' SQ MI', size: 70, label: '(≈1,518,800 km²)' });
  COIN('2¢', 1450, 680, c2, twice - 0.3, { sub: 'PER ACRE' });
  MOVE('texas', [-99, 31], [-155, 64], twice + 0.1, 1.0, top - 0.2, F.gold); MOVE('texas', [-99, 31], [-143, 63.2], twice + 0.5, 1.0, top - 0.2, F.gold);
  TAG('2× TEXAS', 1450, 250, twice + 1.2, top - 0.2, { bg: '#C00E1F', size: 56 });
  K(top + 0.2, -118, 49, 760, 1.6, { drift: 0.02 });
  Z('lower48', top - 0.2, laughed, F.white, { noflash: true });
  MOVE('alaska', [-152, 63.5], [-97, 39], top + 0.3, 1.6, laughed - 0.1, F.us);
  K(laughed + 0.2, -150, 62, 1000, 1.4);
  SPR('crieur', [520, 880], laughed - 0.1, gold1890, 300, { screen: true });
  STAMP("SEWARD'S ICEBOX", 1400, 300, icebox, gold1890 - 0.2, { color: '#2a7fd4', size: 70 });
  SPR('morse', [1450, 830], walrus - 0.2, gold1890, 260, { screen: true });
  TAG('"WALRUSSIA"', 1450, 520, walrus, gold1890, { bg: '#111', border: '#fff' });
  SPR('mule', [-147, 64.8], gold1890, oil, 240, {});
  TAG('GOLD · 1890s', 1450, 250, gold1890 + 0.2, oil, { bg: '#D4A017', color: '#1b1300' });
  K(oil + 0.2, -148.5, 69.5, 4200, 1.5, { drift: 0.03 });
  DATE('1968', oil, chest + 0.5); PING(L.prudhoe, prudhoe - 0.3, chest + 1, 'PRUDHOE BAY');
  SPR('derrick', L.prudhoe, prudhoe, onemore, 250, { dy: 60 });
  SPR('coffre', [1450, 880], chest - 0.2, onemore, 260, { screen: true, snd: 'shine' });
  TAG('BIGGEST OIL FIELD IN NORTH AMERICA', CX, 200, prudhoe + 0.3, onemore, { bg: '#111', border: '#FFD21F', size: 40 });
  K(little + 0.3, -169.0, 65.77, 420, 1.0);
  K(little + 2.2, -169.0, 65.77, 210000, 1.9, { drift: 0.02 });
  Z('c:643', seeR - 0.3, p4s - 0.6, F.ru, { alpha: 0.6 }); Z('alaska', little - 0.1, p4s - 0.6, F.us, { alpha: 0.6 });
  PING(L.ldio, little + 2.2, p4s - 0.6, 'LITTLE DIOMEDE (USA)', { size: 32 }); PING(L.bdio, bigD, p4s - 0.6, 'BIG DIOMEDE (RUSSIA)', { left: true, size: 32 });
  LINE([[-169.0, 65.775], [-168.958, 65.765]], half2 - 0.2, 0.5, p4s - 0.6, { color: '#FFE928', w: 6, dash: [14, 10] });
  TAG('≈2.4 MILES (3.8 km)', CX, 250, half2, p4s - 0.6, { bg: '#111', border: '#FFE928', size: 50 });

  // ===== PARTIE 4 : ÎLES VIERGES, PHILIPPINES, PANAMA =====
  const p4 = go('part four'); const p5s = at('part five');
  CHAP(p4, 4, 'THE MOST|EXPENSIVE ACRE', p5s - 0.3);
  const cheap = at('not every deal'), y1917 = at('in 1917'), ww1 = at('first world war'), three = at('three small caribbean'), stt = at('saint thomas'), sjo = at('saint john'), scx = at('saint croix'),
    vi = at('virgin islands'), price4 = at('the price twentyfive'), ingold = at('in gold'), sq134 = at('one hundred and thirtyfour'), acre300 = at('three hundred dollars an acre'),
    tenk = at('ten thousand times'), why4 = at('why pay so much'), fear = at('fear'), germany = at('germany could'), sub = at('submarine base'), canal4 = at('panama canal'),
    letgo = at('america later let go'), y1898 = at('in 1898'), philippines = at('for the philippines', 2), seven = at('seven thousand islands'), y46 = at('in 1946'), indep = at('became independent'),
    panama = at('same story in panama'), y1904 = at('in 1904'), m10p = at('ten million dollars to'), strip10 = at('ten miles wide'), build = at('build the panama canal'), y1999 = at('in 1999'), back = at('handed it back');
  K(p4 + 0.3, -66, 22, 1500, 2.0, { hop: 0.5, drift: 0.02 });
  DATE('1917', y1917, price4);
  K(three + 0.2, -64.85, 18.05, 60000, 1.8, { drift: 0.03 });
  Z('c:850', three - 0.2, p5s - 0.5, F.dk, { flips: [[vi - 0.1, F.us]], deep: true });
  SPR('danois', [1500, 880], cheap + 0.5, three + 0.5, 280, { screen: true });
  ML('ST. THOMAS', L.stt, stt, ingold, { size: 40, dy: -50 }); ML('ST. JOHN', L.stj, sjo, ingold, { size: 40, dy: 50 }); ML('ST. CROIX', L.stx, scx, ingold, { size: 40, dy: 60 });
  DECOR('decor_virgin', L.stt, vi + 0.2, price4 - 0.1);
  CNT(25000000, 1450, 230, price4 + 0.2, 1.0, acre300 - 0.2, { pre: '$', size: 80, color: '#FFD21F', label: 'IN GOLD' });
  SPR('coffre', [1760, 880], ingold - 0.2, tenk, 230, { screen: true, snd: 'shine' });
  CNT(134, 1450, 420, sq134 - 0.1, 0.8, acre300 - 0.2, { pre: '≈', suf: ' SQ MI', size: 64 });
  COIN('$291', 1450, 640, acre300 - 0.2, why4, { r: 110, sub: 'PER ACRE', c0: '#ffd66b', c1: '#b8860b', c2: '#7a5a00' });
  COIN('3¢', 470, 300, tenk - 0.3, why4, { r: 70, sub: 'LOUISIANA' });
  TAG('≈10,000× MORE EXPENSIVE', CX, 560, tenk, why4, { bg: '#E0201B', size: 56 });
  K(why4 + 0.2, -64.5, 16, 9000, 1.4);
  STAMP('FEAR', 960, 230, fear - 0.1, germany + 1, { size: 100 });
  VEH('sousmarin', [[-61.8, 15.0], [-63.6, 16.6], [-64.6, 17.55]], germany - 0.1, letgo - 0.2, 110, { snd: 'water' });
  TAG('A GERMAN U-BOAT BASE?', 1450, 300, sub - 0.2, letgo - 0.2, { bg: '#111', border: '#E0201B' });
  K(canal4 - 0.2, -72, 13.5, 1600, 1.3);
  PING(L.colon, canal4 - 0.2, letgo - 0.2, 'PANAMA CANAL');
  K(y1898 + 0.4, 122, 12.5, 1900, 2.2, { hop: 1.6, drift: 0.02 });
  DATE('1898', y1898, y46);
  Z('c:608', y1898 + 0.4, p5s - 0.5, F.es, { flips: [[philippines - 0.1, F.us], [indep - 0.1, F.ph]] });
  CNT(20000000, 1450, 230, at('twenty million') - 0.1, 1.0, y46, { pre: '$', size: 76, color: '#7CFC7C' });
  CNT(7000, 1450, 420, seven - 0.2, 1.0, y46, { suf: '+ ISLANDS', size: 64 });
  DATE('1946', y46, panama - 0.2); STAMP('INDEPENDENT', 1450, 330, indep, panama - 0.2, { color: '#2E5FB8', size: 70 });
  K(panama + 0.6, -79.7, 9.15, 26000, 2.2, { hop: 1.8, drift: 0.03 });
  DATE('1904', y1904, y1999 - 0.2);
  Z('c:591', panama + 0.4, p5s - 0.5, F.pa, { alpha: 0.45, deep: true });
  LINE(CANAL, strip10 - 0.6, 1.0, p5s - 0.5, { color: '#2F6BD8', w: 7 });
  MAPL.push((c, t) => { if (t < strip10 - 0.2 || t > p5s - 0.1) return; const q = CANAL.map(x => P(x)); c.save(); c.globalAlpha = 0.45 * Math.min(clamp((t - strip10 + 0.2) / 0.4), fadeOut(t, p5s - 0.5, 0.4)); c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); q.forEach((x, i) => i ? c.lineTo(x[0], x[1]) : c.moveTo(x[0], x[1])); c.lineWidth = kmPx(16, 9.1); c.strokeStyle = t < back ? '#3c78ff' : '#d21034'; c.stroke(); c.restore(); });
  CNT(10000000, 1450, 230, m10p - 0.1, 1.0, y1999, { pre: '$', size: 72, color: '#7CFC7C' });
  TAG('10 MILES WIDE', 1450, 420, strip10, y1999, { bg: '#2F6BD8', size: 50 });
  DATE('1999', y1999, p5s - 0.4); STAMP('GIVEN BACK', 1450, 330, back - 0.1, p5s - 0.4, { color: '#E0201B', size: 76 });

  // ===== PARTIE 5 : GROENLAND =====
  const p5 = go('part five'); const ends = at('so which deal');
  CHAP(p5, 5, 'THE ONE THAT|GOT AWAY', ends - 0.3);
  const gl = at('there\'s greenland'), truman = at('president harry'), hundred = at('one hundred million'), biggestI = at('biggest island on earth'), no5 = at('denmark said no', 2),
    huge = at('greenland is huge'), sq836 = at('eight hundred and thirtysix'), bigger = at('bigger than the entire'), only = at('only about fiftysix'), y2019 = at('in 2019'), y2025 = at('again in 2025', 1),
    answer = at('and the answer'), notsale = at('is not for sale'), whyW = at('why does america'), look = at('look at the map'), sits = at('greenland sits'), shortest = at('shortest route'),
    watches = at('watches the top');
  K(p5 + 0.3, -42, 71.5, 640, 2.2, { hop: 0.5, drift: 0.02 });
  Z('c:304', gl - 0.2, ends - 0.5, F.dk, { flips: [[huge, F.gl]] });
  DATE('1946', truman - 0.2, no5 + 0.6);
  SPR('us1946', [480, 880], truman, no5 + 0.6, 320, { screen: true, snd: 'shine' });
  CNT(100000000, 960, 230, hundred - 0.1, 1.2, no5 + 0.6, { pre: '$', size: 80, color: '#FFD21F', label: 'IN GOLD' });
  SPR('groenlandais', [1450, 880], no5 - 0.4, huge, 300, { screen: true });
  STAMP('NO', 1450, 420, no5, huge, { size: 120 });
  CNT(836000, 1450, 250, sq836 - 0.1, 1.2, y2019 - 0.2, { suf: ' SQ MI', size: 70, label: '(≈2,166,000 km²)' });
  MOVE('louisiana', [-98, 41], [-40, 71], bigger - 0.2, 1.4, y2019 - 0.2, F.fr);
  TAG('LOUISIANA PURCHASE', 470, 250, bigger + 0.6, y2019 - 0.2, { bg: '#2F6BD8', size: 44 });
  CNT(56000, 1450, 470, only, 1.0, y2019 - 0.2, { pre: '≈', suf: ' PEOPLE', size: 64 });
  DECOR('decor_greenland', L.ilul, y2019 - 0.1, notsale + 0.2);
  DATE('2019', y2019, y2025); DATE('2025', y2025, notsale + 0.3);
  STAMP('NOT FOR SALE', 960, 300, notsale - 0.1, look - 0.1, { size: 100 });
  K(look + 0.4, -40, 56, 420, 1.7, { drift: 0.02 });
  LINE([L.nyc, [-52, 62], [-30, 64], L.paris], shortest - 0.6, 1.4, ends - 0.5, { color: '#FFE928', w: 6, dash: [18, 12] });
  TAG('SHORTEST ROUTE OVER THE ARCTIC', CX, 230, shortest, ends - 0.5, { bg: '#111', border: '#FFE928', size: 44 });
  SPR('groenlandais', [-42, 74], watches - 0.4, ends - 0.5, 230, {});

  // ===== FIN =====
  const e0 = go('so which deal'); const cheapest = at('alaska was the cheapest'), threeC = at('louisiana doubled the country'), vi300 = at('and the virgin islands'),
    addup = at('add it all up'), more = at('more than half'), city = at('a city that became'), desert = at('a desert bought'), ice = at('an icebox full'), saidno = at('an island that said no'),
    which = at('which deal would you'), should = at('should america still'), comments = at('tell me in the comments'), sub0 = at('subscribe'), next = at('next time'), strange = at('the strangest borders');
  K(e0 + 0.2, -100, 45, 650, 1.6, { drift: 0.02 });
  BARS(e0 + 0.3, addup - 0.2);
  K(addup + 0.3, -112, 46, 700, 1.4, { drift: 0.02 });
  ['louisiana', 'florida', 'mexc', 'gadsden', 'alaska'].forEach((k, i) => Z(k, addup + 0.2 + i * 0.25, which - 0.2, F.us));
  Z('east1803', addup, which - 0.2, F.white, { noflash: true });
  CNT(50, 1500, 250, more - 0.1, 1.0, city - 0.1, { suf: '%+', size: 110, label: 'OF TODAY\'S USA' });
  SPR('pres_b', [-100, 40], city - 0.1, which - 0.3, 230, {});
  SPR('train', [-110.5, 32.2], desert - 0.1, which - 0.3, 110, {});
  SPR('coffre', [-151, 64], ice - 0.1, which - 0.3, 200, {});
  SPR('groenlandais', [1700, 880], saidno - 0.1, which - 0.3, 260, { screen: true });
  TAG('WHICH DEAL WOULD YOU MAKE?', CX, 230, which, sub0, { bg: '#111', border: '#FFD21F', size: 58 });
  TAG('SHOULD AMERICA BUY GREENLAND?', CX, 360, should, sub0, { bg: '#C00E1F', size: 52 });
  TAG('TELL ME IN THE COMMENTS', CX, 820, comments, sub0, { bg: '#2E8B57', size: 50 });
  STAMP('SUBSCRIBE', CX, 300, sub0, next, { color: '#E0201B', size: 100 });
  TAG('NEXT: AMERICA\'S STRANGEST BORDERS', CX, 470, strange - 0.6, END + 1, { bg: '#111', border: '#FFD21F', size: 54 });
  SPR('pres_a', [1650, 880], sub0, END + 1, 300, { screen: true });
  K(which + 0.3, -97, 42, 1000, 1.6, { drift: 0.025 });

  // respiration de caméra : un petit mouvement toutes les ~5,5 s dans les passages calmes
  CAMS.sort((x, y) => x.t - y.t);
  const extra = [];
  for (let i = 0; i < CAMS.length - 1; i++) {
    const A = CAMS[i], B = CAMS[i + 1], free = (B.t - B.d) - A.t;
    if (free <= 7) continue;
    const n = Math.floor(free / 5.5);
    for (let k = 1; k <= n; k++) {
      const tk = A.t + k * free / (n + 1) + 0.7, base = A.s * (1 + (A.drift ?? 0.03) * (tk - A.t)), span = W / A.s * 180 / Math.PI;
      extra.push({ t: tk, d: 1.3, lon: A.lon + span * 0.035 * (k % 2 ? 1 : -1), lat: A.lat + span * 0.02 * (k % 2 ? -1 : 1), s: base * (k % 2 ? 1.28 : 0.86), drift: (k % 2 ? -0.015 : 0.02) });
    }
  }
  extra.forEach(e => { CAMS.push(e); EV(e.t - e.d, 'sweep'); });
  cam = makeCam(CAMS);
}

window.render = function (t) {
  const cm = cam(t); if (VERT) cm.s *= 0.86; ANG = ANGf(t); P = proj(cm);
  const c = ctx; c.setTransform(1, 0, 0, 1, 0, 0);
  c.save(); c.translate(CX, CY); c.rotate(ANG); c.translate(-CX, -CY); drawMap(c, t, cm); c.restore();
  overlays(c, t);
  for (const f of SCR) f(c, t);
  if (!window.CLEAN) drawSubs(c, t);
};

window.init = async function () {
  canvas = document.getElementById('c'); ctx = canvas.getContext('2d');
  const J = u => fetch(u).then(r => r.json());
  [DATA, WORLD, WORDS] = await Promise.all([J('data.json'), J('world50.json'), J('words.json')]);
  const load = (k, src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => { IMG[k] = i; res(); }; i.onerror = () => rej(new Error('img ' + src)); i.src = src; });
  const sprs = ['pres_a', 'pres_b', 'napo_a', 'napo_b', 'diplomate', 'banquier', 'espagnol', 'us_officer', 'mex_officer', 'prospector', 'russe', 'seward', 'crieur', 'morse', 'danois', 'us1946', 'groenlandais', 'mule', 'navire', 'train', 'derrick', 'coffre', 'traite', 'sousmarin'];
  await Promise.all([load('bm', '../assets/bm_merc.jpg'), ...['nola', 'alaska', 'virgin', 'greenland'].map(k => load('decor_' + k, '../assets/decor_' + k + '.jpg')), ...sprs.map(s => load('spr_' + s, '../spr/' + s + '.png'))]);
  await Promise.all(['us', 'fr', 'gb', 'nl', 'ht', 'es', 'mx', 'ru', 'dk', 'gl', 'ph', 'pa', 'vi', 'de', 'ca'].map(f => new Promise(res => { const i = new Image(); i.onload = () => { FL[f] = i; res(); }; i.onerror = res; i.src = '../assets/flags/' + f + '.svg'; })));
  makeGrain(); buildSubs(); setup();
  window.CAM = { camAt: cam, angAt: ANGf };
  window.READY = true;
};
