// engine.js — moteur commun « Team X vs Team Y » (9:16). La scène définit CFG, setup(), screenScene(), mapOver().
const CY = 860, OX = 470, OY = 680, MW = 2020, MH = 3060, FOC = 1400;
const BLUE = '#1f5dff';
let WORLD, BM, FL = {}, DUR, cam, ISO = {};
const mapC = document.createElement('canvas'); mapC.width = MW; mapC.height = MH; const m = mapC.getContext('2d');
const rotC = document.createElement('canvas'); rotC.width = MW; rotC.height = MH; const rc = rotC.getContext('2d');
let canvas, ctx, P = null, cam_s = 1, ANG = 0, TILT = 0;
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
const geomOf = id => (cam_s > 2200 && WORLD.c10[id]) ? WORLD.c10[id] : WORLD.byId[id].g;

const YMAX = Math.log(Math.tan(Math.PI / 4 + 85.0511 * Math.PI / 360));
const TN = 16384, TS = 1024; const TILES = {}; let LOWRES = null;
const gX = lon => (lon + 180) / 360 * TN, gY = lat => TN / 2 - TN / (2 * Math.PI) * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
function tilesFor(st) { // tuiles visibles dans le canevas carte
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
  m.save(); pathM(WORLD.borders); m.lineWidth = 1.6; m.strokeStyle = 'rgba(255,255,255,.62)'; m.stroke(); m.restore();
}

// ---------- pays : phases [t, mode, opts] ; mode = équipe ('f','a'), 'g' (gris hachuré), 'h' (drapeau + hachures) ----------
let CS = {};
const C = (id, t, mode, o = {}) => { (CS[id] = CS[id] || []).push({ t, mode, ...o }); CS[id].sort((x, y) => x.t - y.t); };
function hatch(alpha) { m.save(); m.clip(); m.globalAlpha = alpha; m.strokeStyle = '#fff'; m.lineWidth = 5; m.beginPath(); for (let x = -MH; x < MW; x += 30) { m.moveTo(x, 0); m.lineTo(x + MH, MH); } m.stroke(); m.restore(); }
const SLICE = /^(us|gb|es|ca|au|nz|ch|pt|gr|se|fi|dk|cy|mt|hr|si|sk|ee|lv|lt|ru|cn|no|is|tr|il|eg|sa|ma|dz|tn|ly|sd|ss|cd|za|et|ng|ao|so|ke|tz|mz|mg|na|bw|zm|zw)$/;
function drawCountries(t) {
  for (const id in CS) {
    const ph = CS[id]; let k = -1; for (let i = 0; i < ph.length; i++) if (ph[i].t <= t) k = i; if (k < 0) continue;
    const p = ph[k]; if (p.mode === 'x') continue; const cur = t - p.t; const g = geomOf(id); const fl = FL[ISO[id]];
    const hold = p.named ? 1.6 : 0.4; const kk = clamp((cur - hold) / 0.6);
    const base = p.mode === 'g' ? 0.22 : p.mode === 'h' ? 0.34 : (p.named ? 0.44 : 0.38);
    const fa = (k === 0 ? clamp(cur / 0.2) : 1) * lerp(p.mode === 'g' ? 0.5 : 0.9, base, kk) * (p.att ?? 1) * (CFG.att ? CFG.att(id) : 1);
    const flash = Math.max(0, 1 - cur / 0.3);
    if (fl) flagFill(m, () => pathM(g), d3.geoPath(P).bounds(g), fl, fa, flash, SLICE.test(ISO[id]) ? 'slice' : 'stretch');
    const col = CFG.teamCol[p.mode] || '#9aa0a6';
    m.save(); pathM(g); m.lineJoin = 'round'; m.lineWidth = 3.2; m.strokeStyle = col; m.globalAlpha = 0.9 * (k === 0 ? clamp(cur / 0.4) : 1); m.shadowColor = col; m.shadowBlur = 10; m.stroke(); m.restore();
    if (cur < 2.2 && p.named) { pathM(g); m.save(); m.globalAlpha = 1 - cur / 2.2; m.shadowColor = '#fff'; m.shadowBlur = 25; m.lineWidth = 4; m.strokeStyle = '#fff'; m.stroke(); m.restore(); }
    if (p.mode === 'g' || p.mode === 'h') { pathM(g); m.save(); m.globalAlpha = clamp(cur / 0.4) * 0.55; hatch(0.6); m.restore(); }
  }
}

// ---------- avions ----------
let LEGS = [], JETVIS = {};
const legPos = (L, t) => { const u = ease(prog(t, L.t0, L.t1 - L.t0)); return { ll: d3.geoInterpolate(L.a, L.b)(u), u }; };
function drawTrails(t) {
  for (const L of LEGS) {
    if (t < L.t0 || t > L.t1 + 2.5 || L.noTrail) continue; const { u } = legPos(L, t); const al = fadeOut(t, L.t1 + 1.8, 0.7);
    m.save(); m.globalAlpha = al; m.beginPath(); for (let i = 0; i <= 40; i++) { const p = P(d3.geoInterpolate(L.a, L.b)(u * i / 40)); i ? m.lineTo(p[0], p[1]) : m.moveTo(p[0], p[1]); }
    m.setLineDash([18, 14]); m.lineDashOffset = -t * 60; m.lineWidth = 7; m.strokeStyle = CFG.trail[L.jet] || '#F7EF08'; m.shadowColor = m.strokeStyle; m.shadowBlur = 12; m.lineCap = 'round'; m.stroke(); m.restore();
  }
}
const visWin = (jet, t) => (JETVIS[jet] || []).find(([a, b]) => t >= a && t <= b);
function jetAt(t) {
  const out = [];
  for (const jet in JETVIS) {
    const V = visWin(jet, t); if (!V) continue; const legs = LEGS.filter(L => L.jet === jet);
    const L = legs.find(L => t >= L.t0 && t <= L.t1);
    if (L) { const r = legPos(L, t); out.push({ jet, ll: r.ll, L, u: r.u, alt: Math.sin(Math.PI * r.u), V }); continue; }
    const prev = legs.filter(L => L.t1 < t).at(-1), next = legs.find(L => L.t0 > t);
    out.push({ jet, ll: prev ? prev.b : next.a, L: prev || next, u: prev ? 1 : 0, alt: 0, idle: true, V, home: prev ? prev.b : next.a });
  }
  return out;
}
function drawJets(c, t) {
  for (const J of jetAt(t)) {
    const p = S(J.ll[0], J.ll[1]); const q = S(...d3.geoInterpolate(J.L.a, J.L.b)(clamp(J.u + 0.02))); const p0 = S(...d3.geoInterpolate(J.L.a, J.L.b)(clamp(J.u - 0.02)));
    let dir = Math.atan2(q.y - p0.y, q.x - p0.x); const V = J.V;
    const a = Math.min(clamp((t - V[0]) / 0.3), fadeOut(t, V[1] - 0.3, 0.3));
    const circ = J.idle ? (t * 2.2) % (Math.PI * 2) : 0; const sc = (1 + 0.2 * J.alt) * popIn(t, V[0], 0.35) * (CFG.jetH || 1);
    let x = p.x, y = p.y; if (J.idle) { x += Math.cos(circ) * 70; y += Math.sin(circ) * 40; dir = circ + Math.PI / 2; }
    c.save(); c.globalAlpha = a;
    c.save(); c.translate(x + 26 + 50 * J.alt, y + 36 + 60 * J.alt); c.rotate(dir + Math.PI / 2); c.globalAlpha = 0.32 * a; c.filter = 'brightness(0) blur(5px)'; drawJetImg(c, J.jet, 200 * sc); c.restore();
    c.translate(x, y); c.rotate(dir + Math.PI / 2); drawJetImg(c, J.jet, 200 * sc); c.restore();
  }
}
function drawJetImg(c, name, h) { const img = SPR[name]; if (!img) return; const w = h * img.width / img.height; c.drawImage(img, -w / 2, -h / 2, w, h); c.filter = 'none'; }

// ---------- épingles (pays nommés) ----------
function flagCard(c, x, y, img, w) { const h = w * 0.75; c.save(); c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 12; c.shadowOffsetY = 4; c.fillStyle = '#fff'; rr(c, x - w / 2 - 5, y - h / 2 - 5, w + 10, h + 10, 6); c.fill(); c.shadowColor = 'transparent'; if (img) c.drawImage(img, x - w / 2, y - h / 2, w, h); c.restore(); }
let NAMED = [];
function drawPins(c, t) {
  if (!NAMED.length) { for (const id in CS) for (const p of CS[id]) if (p.named) NAMED.push({ id, t0: p.t, label: p.label }); NAMED.sort((a, b) => a.t0 - b.t0); }
  for (let i = 0; i < NAMED.length; i++) {
    const N = NAMED[i]; if (t < N.t0) continue; const nx = NAMED[i + 1]; const tEnd = Math.min(N.t0 + 2.0, nx ? nx.t0 - 0.05 : 1e9); if (t > tEnd + 0.25) continue;
    const an = CFG.ANCH[N.id] || WORLD.cent[N.id]; const p = S(an[0], an[1]); const al = fadeOut(t, tEnd, 0.25); const s = popIn(t, N.t0, 0.3);
    c.save(); c.globalAlpha = al; c.translate(clamp(p.x, 230, 850), clamp(p.y + 175, 520, 1380)); c.scale(s, s); flagCard(c, 0, -60, FL[ISO[N.id]], 96);
    txt(c, typed(N.label || CFG.NAME[N.id], t, N.t0 + 0.05, 0.3), 0, 34, { size: 66, stroke: '#000', sw: 11 }); c.restore();
  }
}

// ---------- score [t, delta] ----------
let SCORE = { f: [], a: [] };
const scoreAt = (k, t) => SCORE[k].filter(x => x[0] <= t).reduce((s, x) => s + x[1], 0);
function lastBump(k, t) { const l = SCORE[k].filter(x => x[0] <= t).at(-1); return l == null ? 0 : Math.max(0, 1 - (t - l[0]) / 0.18); }
function drawScore(c, t) {
  if (t < A.sb) return; let big = 0; for (const [b0, b1] of A.big || []) big = Math.max(big, prog(t, b0, 0.5) * (1 - prog(t, b1 - 0.1, 0.4)));
  const a = popIn(t, A.sb, 0.35); const y = lerp(250, 640, big), sc = a * lerp(1, 1.3, big);
  c.save(); c.translate(W / 2, y); c.scale(sc, sc);
  for (const [side, col, label, k, fl] of CFG.sides) {
    const val = scoreAt(k, t), bump = lastBump(k, t);
    c.save(); c.translate(side * 228, 0); c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 20; c.shadowOffsetY = 6;
    rr(c, -205, -62, 410, 124, 22); c.fillStyle = col; c.fill(); c.shadowColor = 'transparent'; c.lineWidth = 5; c.strokeStyle = '#fff'; c.stroke();
    c.save(); c.beginPath(); c.arc(-160, 0, 30, 0, 7); c.clip(); const img = FL[fl]; if (img) c.drawImage(img, -200, -30, 80, 60); c.restore(); c.beginPath(); c.arc(-160, 0, 30, 0, 7); c.lineWidth = 4; c.strokeStyle = '#fff'; c.stroke();
    txt(c, label, -12, -2, { size: label.length > 11 ? 28 : 31, shadow: false, weight: 900 });
    c.save(); c.translate(150, 2); c.scale(1 + 0.35 * bump, 1 + 0.35 * bump); txt(c, String(val), 0, 0, { size: val > 9 ? 70 : 76, shadow: false, weight: 900, color: '#FFE928', stroke: '#1b1300', sw: 8 }); c.restore();
    c.restore();
  }
  txt(c, 'VS', 0, 0, { size: 56, weight: 900, color: '#fff', stroke: '#000', sw: 10 });
  if (CFG.underScore) CFG.underScore(c, t);
  c.restore();
  // mention permanente
  txt(c, 'SCÉNARIO IMAGINAIRE', W / 2, 345 + big * 0, { size: 24, weight: 800, color: 'rgba(255,255,255,.8)', stroke: 'rgba(0,0,0,.6)', sw: 6, shadow: false });
}

// ---------- calque écran : outils ----------
function soldier(c, name, x, y, h, t, t0, o = {}) { const bob = Math.abs(Math.sin((t - t0) * 6 + (o.ph || 0))) * 10; sprite(c, name, x, y - bob, h * popIn(t, t0, 0.3), { flip: o.flip, rot: 0.03 * Math.sin((t - t0) * 6 + (o.ph || 0)) }); }
function waver(c, name, x, y, h, t, t0, ph = 0) { const pose = Math.floor((t + ph) / 0.32) % 2 ? 'b' : 'a'; sprite(c, `${name}_${pose}`, x, y - (pose === 'b' ? 14 : 0), h * popIn(t, t0, 0.3)); }
function stampText(c, s, x, y, t, t0, t1, o = {}) {
  if (t < t0 || t > t1 + 0.3) return; const sz = o.size || 92; const sc = stampScale(t, t0) * fadeOut(t, t1, 0.3);
  c.save(); c.translate(x, y); c.rotate(o.rot ?? -0.1); c.scale(sc, sc); c.globalAlpha = clamp((t - t0) / 0.08) * fadeOut(t, t1, 0.3);
  const w = measure(c, s, sz, 900) + 60; c.fillStyle = 'rgba(255,255,255,.9)'; rr(c, -w / 2, -sz * 0.7, w, sz * 1.4, 18); c.fill(); c.lineWidth = 10; c.strokeStyle = o.col || '#e01b24'; c.stroke();
  txt(c, s, 0, 4, { size: sz, color: o.col || '#e01b24', weight: 900, shadow: false }); c.restore();
}
function arrowTo(c, x0, y0, x1, y1, t, t0, t1, col) {
  if (t < t0 || t > t1 + 0.3) return; const p = easeOut(prog(t, t0, 0.4)); const x = lerp(x0, x1, p), y = lerp(y0, y1, p); const cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - 160;
  c.save(); c.globalAlpha = fadeOut(t, t1, 0.3); c.lineWidth = 12; c.lineCap = 'round'; c.strokeStyle = col; c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 10;
  c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(lerp(x0, cx, p), lerp(y0, cy, p), x, y); c.stroke();
  if (p > 0.95) { const an = Math.atan2(y1 - cy, x1 - cx); c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - 40 * Math.cos(an - 0.5), y1 - 40 * Math.sin(an - 0.5)); c.moveTo(x1, y1); c.lineTo(x1 - 40 * Math.cos(an + 0.5), y1 - 40 * Math.sin(an + 0.5)); c.stroke(); }
  c.restore();
}
// élément posé sur la carte (suit le lieu), apparaît en pop puis flotte
function mapSprite(c, name, ll, t, t0, t1, h, o = {}) {
  if (t < t0 || t > t1 + 0.3) return; const p = S(ll[0], ll[1]); const s = popIn(t, t0, 0.35) * fadeOut(t, t1, 0.3);
  sprite(c, name, p.x + (o.dx || 0), p.y + (o.dy || 0) + 6 * Math.sin(t * 4), h * s, { shadow: o.shadow ?? false, rot: o.rot });
}
// barre de caméra : stops + suivi des avions
const st = (t, d, lon, lat, s, o = {}) => ({ t, d, lon, lat, s, ...o });
function buildCam(stops) {
  cam = makeCam2(stops.slice());
  for (const Lg of LEGS) Lg.s0 = cam(Lg.t0 - 0.01).s;
  const all = stops.filter(s => !LEGS.some(L => !L.noFollow && s.t > L.t0 && s.t - s.d < L.t1 + 0.05));
  for (const Lg of LEGS) { if (Lg.noFollow) continue; for (let t = Lg.t0; t <= Lg.t1 + 1e-6; t += 0.12) { const u = prog(t, Lg.t0, Lg.t1 - Lg.t0); const { ll } = legPos(Lg, t); const sc = u < 0.5 ? Math.exp(lerp(Math.log(Lg.s0), Math.log(Lg.sMid), ease(u * 2))) : Math.exp(lerp(Math.log(Lg.sMid), Math.log(Lg.sEnd), ease(u * 2 - 1))); all.push(st(t, 0.12, ll[0], ll[1] - 110 / sc * 57.3 / 1.6, sc, { lin: true, drift: 0.02 })); } }
  cam = makeCam2(all);
}
function tiltAt(t) { let v = 0; for (const [t0, t1, deg] of A.tilt) { if (t < t0 || t > t1 + 1) continue; v = Math.max(v, deg * Math.min(ease((t - t0) / 0.9), 1 - ease((t - t1) / 1))); } return v * Math.PI / 180; }
function angAt(t) { return (8 * Math.sin(2 * Math.PI * t / 13) + 3.5 * Math.sin(2 * Math.PI * t / 7 + 1)) * Math.PI / 180; }

// ============ RENDU ============
let A = {};
window.render = function (t) {
  const s0 = cam(t); cam_s = s0.s; ANG = angAt(t); TILT = tiltAt(t);
  P = d3.geoMercator().rotate([-s0.lon, 0]).center([0, s0.lat]).scale(s0.s).translate([540 + OX, CY + OY]).precision(0).clipExtent([[0, 0], [MW, MH]]);
  drawSat(s0); if (window.mapUnder) mapUnder(t); drawCountries(t); if (window.mapOver) mapOver(t); drawTrails(t);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#0b3a52'; ctx.fillRect(0, 0, W, H);
  if (TILT < 0.001) { ctx.save(); ctx.translate(540, CY); ctx.rotate(ANG); ctx.translate(-540 - OX, -CY - OY); ctx.drawImage(mapC, 0, 0); ctx.restore(); }
  else {
    rc.setTransform(1, 0, 0, 1, 0, 0); rc.clearRect(0, 0, MW, MH); rc.translate(540 + OX, CY + OY); rc.rotate(ANG); rc.translate(-540 - OX, -CY - OY); rc.drawImage(mapC, 0, 0); rc.setTransform(1, 0, 0, 1, 0, 0);
    const sn = Math.sin(TILT), cs = Math.cos(TILT), band = 6;
    for (let y = 0; y < H; y += band) { const a0 = y - CY, a1 = y + band - CY; const v0 = a0 * FOC / (FOC * cs + a0 * sn), v1 = a1 * FOC / (FOC * cs + a1 * sn); const k = FOC / (FOC - ((v0 + v1) / 2) * sn); const sy = CY + OY + v0; if (sy < 0 || sy + v1 - v0 > MH) continue; ctx.drawImage(rotC, 0, sy, MW, Math.max(1, v1 - v0), 540 - k * (540 + OX), y, MW * k, band + 0.6); }
    const hz = ctx.createLinearGradient(0, 0, 0, 500); hz.addColorStop(0, `rgba(200,225,240,${0.45 * TILT / 0.5})`); hz.addColorStop(1, 'rgba(200,225,240,0)'); ctx.fillStyle = hz; ctx.fillRect(0, 0, W, 500);
  }
  if (window.screenUnder) screenUnder(ctx, t);
  drawPins(ctx, t); drawJets(ctx, t);
  ctx.save(); ctx.globalAlpha = 0.07; ctx.globalCompositeOperation = 'overlay'; ctx.fillStyle = ctx.createPattern(GRAIN, 'repeat'); ctx.translate((t * 997) % 256, (t * 613) % 256); ctx.fillRect(-256, -256, W + 512, H + 512); ctx.restore();
  const vg = ctx.createRadialGradient(W / 2, H / 2, 700, W / 2, H / 2, 1250); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.35)'); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
  if (!window.CLEAN) { screenScene(ctx, t); drawScore(ctx, t); drawSubs(ctx, t); }
};
const loadImg = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(null); i.src = src; });
window.init = async function () {
  canvas = document.getElementById('c'); ctx = canvas.getContext('2d');
  const [wd, tm, iso] = await Promise.all(['world.json', 'timing.json', 'iso.json'].map(u => fetch(u).then(r => r.json())));
  WORLD = wd; WORLD.byId = Object.fromEntries(WORLD.c50.map(c => [c.id, c])); WORDS = tm.words; ISO = iso;
  LOWRES = await loadImg('../relief/relief_4096.jpg');
  await Promise.all(CFG.sprites.map(async n => { SPR[n] = await loadImg('spr/' + n + '.png'); }));
  makeGrain(); buildSubs(SCRIPT); setup();
  const flags = new Set([...Object.keys(CS).map(id => ISO[id]), ...(CFG.extraFlags || [])]); await Promise.all([...flags].map(async k => { FL[k] = await loadImg('flags/' + k + '.svg'); }));
  { const need = new Set(); for (let t = 0; t <= DUR; t += 0.1) { const c = cam(t); for (const [tx, ty] of tilesFor(c)) need.add(ty + '_' + tx); } await Promise.all([...need].map(async n => { TILES[n] = await loadImg('../relief/tiles/' + n + '.jpg'); })); window.NTILES = need.size; }
  window.CAM = { dur: DUR, camAt: t => cam(t), angAt, tiltAt };
  window.VISUALS = SUBS.map(x => x.t0); window.DUR = DUR; window.READY = true;
};
