// lib.js — outils communs (16:9)
const VERT = !!window.VERT; const W = VERT ? 1080 : 1920, H = VERT ? 1920 : 1080, CX = VERT ? 540 : 960, CY = VERT ? 960 : 560;
// position écran : en vertical, les textes vont au centre et descendent de 270 px
const SP = (x, y) => VERT ? [CX, y + 270] : [x, y];
const SPS = (x, y) => VERT ? [Math.max(170, Math.min(910, 540 + (x - 960) * 0.55)), Math.max(760, Math.min(1300, y + 330))] : [x, y];
const SZ = VERT ? 0.86 : 1;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, x) => a + (b - a) * x;
const ease = x => { x = clamp(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const easeIn = x => Math.pow(clamp(x), 3);
const backOut = x => { x = clamp(x); const c1 = 2.0, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const prog = (t, a, d) => clamp((t - a) / d);
const popIn = (t, t0, d = 0.3) => t < t0 ? 0 : backOut((t - t0) / d);
const fadeOut = (t, t1, d = 0.3) => 1 - clamp((t - t1) / d);
const life = (t, t0, t1, din = 0.25, dout = 0.3) => t < t0 || t > t1 + dout ? 0 : Math.min(clamp((t - t0) / din), fadeOut(t, t1, dout));
const fmt = n => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
const norm = s => s.toLowerCase().replace(/[^a-z0-9]/g, '');
const typed = (s, t, t0, d = 0.4) => s.slice(0, Math.ceil(s.length * prog(t, t0, d)));

function txt(c, s, x, y, o = {}) {
  const size = o.size || 60; c.save();
  c.font = `${o.weight || 800} ${size}px ${o.font || 'Poppins'}`;
  c.textAlign = o.align || 'center'; c.textBaseline = o.base || 'middle';
  if (o.shadow !== false) { c.shadowColor = 'rgba(0,0,0,.55)'; c.shadowBlur = o.blur ?? 12; c.shadowOffsetY = 3; }
  if (o.stroke) { c.lineJoin = 'round'; c.strokeStyle = o.stroke; c.lineWidth = o.sw || size * 0.16; c.strokeText(s, x, y); c.shadowColor = 'transparent'; }
  c.fillStyle = o.color || '#fff'; c.fillText(s, x, y); c.restore();
}
function rr(c, x, y, w, h, r) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function measure(c, s, size, weight = 800, font = 'Poppins') { c.save(); c.font = `${weight} ${size}px ${font}`; const m = c.measureText(s).width; c.restore(); return m; }
function tag(c, s, x, y, o = {}) {
  const size = o.size || 46, padX = size * 0.45, padY = size * 0.26;
  const tw = measure(c, s, size, o.weight || 800); const w = tw + padX * 2, h = size + padY * 2;
  c.save(); c.translate(x, y); if (o.rot) c.rotate(o.rot); const sc = o.sc ?? 1; c.scale(sc, sc); c.globalAlpha *= o.alpha ?? 1;
  c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 16; c.shadowOffsetY = 5;
  rr(c, -w / 2, -h / 2, w, h, o.r ?? 12); c.fillStyle = o.bg || '#C00E1F'; c.fill(); c.shadowColor = 'transparent';
  if (o.border) { c.lineWidth = 4; c.strokeStyle = o.border; c.stroke(); }
  txt(c, s, 0, 2, { size, color: o.color || '#fff', shadow: false, weight: o.weight });
  c.restore(); return { w, h };
}
// grain
let GRAIN = null;
function makeGrain() {
  const g = document.createElement('canvas'); g.width = g.height = 256; const x = g.getContext('2d'); const d = x.createImageData(256, 256);
  let s = 12345; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < d.data.length; i += 4) { const v = 110 + r() * 120; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = 255; }
  x.putImageData(d, 0, 0); GRAIN = g;
}
// caméra : stops {t (arrivée), d (durée), lon, lat, s, drift}
function makeCam(stops) {
  stops.sort((a, b) => a.t - b.t);
  const dr = (st, t) => { const dt = Math.max(0, t - st.t); return { lon: st.lon + (st.plon || 0) * dt, lat: st.lat + (st.plat || 0) * dt, s: st.s * (1 + (st.drift ?? 0.03) * dt) }; };
  return function (t) {
    if (t <= stops[0].t) return dr(stops[0], 0);
    for (let i = 0; i < stops.length - 1; i++) {
      const a = stops[i], b = stops[i + 1], dep = b.t - b.d;
      if (t < dep) return dr(a, t);
      if (t < b.t) {
        const A = dr(a, dep), x = (t - dep) / b.d, ez = ease(x);
        const zin = b.s > A.s * 3, zout = A.s > b.s * 3;
        const ep = zin ? ease(Math.min(1, x * 1.35)) : zout ? ease(Math.max(0, x * 1.35 - 0.35)) : ez;
        let dl = b.lon - A.lon; if (dl > 180) dl -= 360; if (dl < -180) dl += 360;
        // vol long : on dézoome au milieu
        let s = Math.exp(lerp(Math.log(A.s), Math.log(b.s), ez));
        if (b.hop) s *= Math.exp(-b.hop * Math.sin(Math.PI * x));
        return { lon: A.lon + dl * ep, lat: lerp(A.lat, b.lat, ep), s };
      }
    }
    return dr(stops.at(-1), t);
  };
}
