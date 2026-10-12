import fs from 'fs'; import * as topojson from 'topojson-client'; import * as d3 from 'd3-geo';
const nm = '../node_modules/world-atlas/';
const T50 = JSON.parse(fs.readFileSync(nm + 'countries-50m.json')), T10 = JSON.parse(fs.readFileSync(nm + 'countries-10m.json'));
const NAMED = ['604', '218', '360', '036', '404', '894', '716', '356', '156', '076'];
const keep = { '218': ([x]) => x > -85 };
function clean(f) { const k = keep[f.id]; if (!k || f.geometry.type !== 'MultiPolygon') return f; return { ...f, geometry: { type: 'MultiPolygon', coordinates: f.geometry.coordinates.filter(p => k(d3.geoCentroid({ type: 'Polygon', coordinates: p }))) } }; }
const f50 = topojson.feature(T50, T50.objects.countries).features.map(clean);
const f10 = topojson.feature(T10, T10.objects.countries).features.filter(f => NAMED.includes(f.id)).map(clean);
const out = { c50: f50.filter(f => NAMED.includes(f.id)).map(f => ({ id: f.id, n: f.properties.name, g: f.geometry })), c10: Object.fromEntries(f10.map(f => [f.id, f.geometry])), borders: topojson.mesh(T50, T50.objects.countries, (a, b) => a !== b) };
for (const id of NAMED) { if (!out.c50.find(c => c.id === id)) console.log('MANQUE 50m', id); if (!out.c10[id]) console.log('MANQUE 10m', id); }
fs.writeFileSync('world.json', JSON.stringify(out)); console.log((fs.statSync('world.json').size / 1e6).toFixed(1) + ' Mo');
