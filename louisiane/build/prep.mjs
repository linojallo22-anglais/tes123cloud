// Données de la carte : pays, fleuves, Louisiane de 1803, États-Unis de 1803, États actuels.
import fs from 'fs'; import * as topojson from 'topojson-client'; import * as d3 from 'd3-geo';
const nm = '../node_modules/';
const T50 = JSON.parse(fs.readFileSync(nm + 'world-atlas/countries-50m.json'));
const ST = JSON.parse(fs.readFileSync(nm + 'us-atlas/states-10m.json'));
const R = JSON.parse(fs.readFileSync('../data/rivers10.geojson'));
const keep = { '250': ([x, y]) => x > -6 && x < 10 && y > 41 && y < 52, '840': ([x, y]) => x > -130 && y > 24 && y < 50 };
function clean(f) { const k = keep[f.id]; if (!k || f.geometry.type !== 'MultiPolygon') return f; return { ...f, geometry: { type: 'MultiPolygon', coordinates: f.geometry.coordinates.filter(p => k(d3.geoCentroid({ type: 'Polygon', coordinates: p }))) } }; }
const IDS = ['840', '124', '484', '250', '826', '332', '214', '192', '724'];
const cs = topojson.feature(T50, T50.objects.countries).features.filter(f => IDS.includes(f.id)).map(clean);
// fleuves : chaîne de segments depuis un point de départ
function river(name, start, stopFn = () => false) {
  const segs = []; R.features.filter(f => f.properties.name === name).forEach(f => (f.geometry.type === 'LineString' ? [f.geometry.coordinates] : f.geometry.coordinates).forEach(l => { if (l.length > 2) segs.push(l); }));
  const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  let cur = start, out = [start]; const used = new Set();
  for (;;) {
    let best = null; segs.forEach((s, i) => { if (used.has(i)) return; for (const rev of [false, true]) { const e = rev ? s.at(-1) : s[0]; const dd = d(e, cur); if (dd < 0.06 && (!best || dd < best.dd)) best = { i, rev, dd }; } });
    if (!best) break; used.add(best.i); const s = best.rev ? [...segs[best.i]].reverse() : segs[best.i];
    for (const p of s.slice(1)) { out.push(p); if (stopFn(p)) return out; } cur = out.at(-1);
  }
  return out;
}
const miss = river('Mississippi', [-95.18, 47.22]);
const missouri = river('Missouri', [-111.52, 46.36]);
const ohio = river('Ohio', [-79.99, 40.45]);
const arkansas = river('Arkansas', [-106.38, 39.22]);
const redAll = river('Red', [-100.9, 34.64]);
console.log('pts', miss.length, missouri.length, ohio.length, arkansas.length, redAll.length, 'fin miss', miss.at(-1), 'fin red', redAll.at(-1));
const near = (L, p) => { let bi = 0, bd = 1e9; L.forEach((q, i) => { const dd = Math.hypot(q[0] - p[0], q[1] - p[1]); if (dd < bd) { bd = dd; bi = i; } }); return bi; };
// ---- Louisiane de 1803 (frontières de 1819 au sud-ouest, ligne de partage des eaux à l'ouest)
const iMan = near(miss, [-91.05, 30.33]);
const north = [[-95.6, 46.6], [-96.6, 45.9], [-97.3, 46.4], [-98.2, 47.5], [-99.5, 48.4], [-101.3, 49.0], [-104, 49.0], [-106.5, 49.6], [-109.5, 49.7], [-111.5, 49.5], [-113.3, 49.2], [-113.9, 48.6]];
const divide = [[-113.3, 47.6], [-112.4, 46.8], [-112.6, 45.8], [-112.0, 44.6], [-111.0, 44.5], [-110.3, 43.7], [-109.6, 42.9], [-108.9, 42.3], [-107.6, 41.4], [-106.8, 40.6]];
const ark = arkansas.filter(p => p[0] <= -100);
const red = redAll.filter(p => p[0] >= -100 && p[0] <= -94.04);
const sabine = [[-94.04, 33.0], [-94.04, 32.0], [-93.8, 31.5], [-93.6, 31.0], [-93.7, 30.3], [-93.85, 29.7], [-93.85, 28.3], [-88.6, 28.3], [-88.8, 29.5], [-89.6, 30.17], [-90.3, 30.2], [-90.6, 30.25]];
let LP = [...miss.slice(0, iMan + 1).reverse()]; // de Manchac à la source (vers le nord)
LP = [...miss.slice(0, iMan + 1)].reverse(); LP.reverse(); // source -> Manchac
// anneau : source -> nord -> ligne de partage -> Arkansas -> 100°O -> Red -> Sabine -> mer -> île d'Orléans -> Manchac -> Mississippi (remonte) -> source
const ring = [miss[0], ...north, ...divide, ...ark, [-100, 37.7], [-100, 34.56], ...red, ...sabine, ...miss.slice(0, iMan + 1).reverse()];
const fix = r => { const g = { type: 'Polygon', coordinates: [r] }; if (d3.geoArea(g) > 2 * Math.PI) r.reverse(); return { type: 'Polygon', coordinates: [r] }; };
const lp = fix(ring.map(p => [+p[0].toFixed(3), +p[1].toFixed(3)]).concat([miss[0]]));
// rive est (Louisiane française de 1682, à l'est du fleuve)
const east = fix([...miss.slice(0, iMan + 1), [-89.6, 30.4], [-88.0, 30.7], [-87.0, 32.5], [-85.3, 34.5], [-83.5, 36.5], [-81.2, 38.5], [-79.8, 40.5], [-79.8, 42.2], [-82.5, 42.0], [-84.5, 41.8], [-87.5, 41.7], [-87.9, 43.5], [-88.6, 45.6], [-90.5, 46.6], [-92.1, 46.75], [-94.0, 47.6], miss[0]]);
// États-Unis de 1803 (est du Mississippi, au nord de la Floride espagnole) : découpé ensuite par la forme des États-Unis
const i31 = near(miss, [-91.63, 31.0]);
const us1803 = fix([...miss.slice(0, i31 + 1), [-85.0, 31.0], [-84.86, 30.7], [-82.2, 30.57], [-81.45, 30.7], [-75, 30.7], [-60, 40], [-60, 49.6], [-95.2, 49.6], miss[0]]);
// France ×4 posée à vraie taille sur la Louisiane
const fr = cs.find(f => f.id === '250'); const c0 = d3.geoCentroid(fr);
const moveTo = (g, to) => { const r1 = d3.geoRotation([-c0[0], -c0[1]]), r2 = d3.geoRotation([-to[0], -to[1]]); const mp = c => typeof c[0] === 'number' ? r2.invert(r1(c)).map(v => +v.toFixed(3)) : c.map(mp); return { type: g.type, coordinates: mp(g.coordinates) }; };
const frCopies = [[-98.2, 46.3], [-107.2, 46.0], [-97.0, 39.2], [-104.8, 39.6]].map(p => moveTo(fr.geometry, p));
// États actuels
const STATES = { '22': 'LOUISIANE', '05': 'ARKANSAS', '29': 'MISSOURI', '19': 'IOWA', '40': 'OKLAHOMA', '20': 'KANSAS', '31': 'NEBRASKA', '46': 'DAKOTA DU SUD', '38': 'DAKOTA DU NORD', '27': 'MINNESOTA', '30': 'MONTANA', '56': 'WYOMING', '08': 'COLORADO', '35': 'NOUVEAU-MEXIQUE', '48': 'TEXAS' };
const sf = topojson.feature(ST, ST.objects.states).features;
const states = Object.keys(STATES).map(id => { const f = sf.find(x => x.id === id); return { id, n: STATES[id], g: f.geometry, c: d3.geoCentroid(f) }; });
const stMesh = topojson.mesh(ST, ST.objects.states, (a, b) => a !== b);
const out = { c: Object.fromEntries(cs.map(f => [f.id, f.geometry])), borders: topojson.mesh(T50, T50.objects.countries, (a, b) => a !== b), miss, missouri, ohio, arkansas, red: redAll, lp, east, us1803, frCopies, states, stMesh };
const km2 = g => d3.geoArea(g) * 6371 * 6371;
console.log('Louisiane km²', Math.round(km2(lp)), 'France', Math.round(km2(fr.geometry)), 'ratio', (km2(lp) / km2(fr.geometry)).toFixed(2));
fs.writeFileSync('data.json', JSON.stringify(out)); console.log((fs.statSync('data.json').size / 1e6).toFixed(1) + ' Mo');
