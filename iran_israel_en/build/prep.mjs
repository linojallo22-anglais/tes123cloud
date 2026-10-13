// Données : pays, New Jersey posé sur Israël, Alaska posé sur l'Iran (vraie taille), Zagros.
import fs from 'fs'; import * as topojson from 'topojson-client'; import * as d3 from 'd3-geo';
const nm = '../node_modules/';
const base = JSON.parse(fs.readFileSync('../../iran_israel/build/data.json'));
const ST = JSON.parse(fs.readFileSync(nm + 'us-atlas/states-10m.json')); const sf = topojson.feature(ST, ST.objects.states).features;
const R6 = 6371, km2 = g => d3.geoArea(g) * R6 * R6;
const moveTo = (g, to, rot = 0) => { const c0 = d3.geoCentroid(g); const r1 = d3.geoRotation([-c0[0], -c0[1]]), r3 = d3.geoRotation([0, 0, rot]), r2 = d3.geoRotation([-to[0], -to[1]]); const mp = q => typeof q[0] === 'number' ? r2.invert(r3(r1(q))).map(v => +v.toFixed(4)) : q.map(mp); return { type: g.type, coordinates: mp(g.coordinates) }; };
const big = (g, min) => g.type === 'MultiPolygon' ? { type: 'MultiPolygon', coordinates: g.coordinates.filter(p => km2({ type: 'Polygon', coordinates: p }) > min) } : g;
const nj = big(sf.find(f => f.id === '34').geometry, 50), ak = big(sf.find(f => f.id === '02').geometry, 3000);
const out = { c: base.c, borders: base.borders, zagros: base.zagros, njOnIl: moveTo(nj, [35.0, 31.45], 0), akOnIr: moveTo(ak, [53.8, 32.6], 0) };
console.log('NJ', Math.round(km2(nj)), 'IL', Math.round(km2(base.c.il)), 'AK', Math.round(km2(ak)), 'IR', Math.round(km2(base.c.ir)));
fs.writeFileSync('data.json', JSON.stringify(out)); console.log((fs.statSync('data.json').size / 1e6).toFixed(1) + ' Mo');
