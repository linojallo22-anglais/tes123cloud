import fs from 'fs'; import * as topojson from 'topojson-client'; import * as d3 from 'd3-geo';
const nm = '../node_modules/world-atlas/';
const T50 = JSON.parse(fs.readFileSync(nm + 'countries-50m.json')), T10 = JSON.parse(fs.readFileSync(nm + 'countries-10m.json'));
const NATO = ['008','056','100','124','191','203','208','233','246','250','276','300','348','352','380','428','440','442','499','528','807','578','616','620','642','703','705','724','752','792','826','840'];
const EUX = ['040','372','196','470'];
const RUS = ['643','112','408','398','417','762'];
const SMALL = ['250','826','276','380','724','616','040','372','196','470','112','408','417','762'];
const keep = { '250': ([x, y]) => x > -6 && x < 10 && y > 41 && y < 52, '724': ([x, y]) => y > 35, '840': ([x, y]) => !(y < 25 && x < -150) };
function clean(f) { const k = keep[f.id]; if (!k || f.geometry.type !== 'MultiPolygon') return f; return { ...f, geometry: { type: 'MultiPolygon', coordinates: f.geometry.coordinates.filter(p => k(d3.geoCentroid({ type: 'Polygon', coordinates: p }))) } }; }
const f50 = topojson.feature(T50, T50.objects.countries).features.map(clean);
const f10 = topojson.feature(T10, T10.objects.countries).features.filter(f => SMALL.includes(f.id)).map(clean);
const out = { c50: f50.map(f => ({ id: f.id, n: f.properties.name, g: f.geometry })), c10: Object.fromEntries(f10.map(f => [f.id, f.geometry])), land: topojson.merge(T50, T50.objects.countries.geometries), borders: topojson.mesh(T50, T50.objects.countries, (a, b) => a !== b), NATO, EUX, RUS, cent: Object.fromEntries(f50.map(f => [f.id, d3.geoCentroid(f).map(v => +v.toFixed(2))])) };
for (const id of [...NATO, ...EUX, ...RUS, '364', '156', '304']) if (!out.c50.find(c => c.id === id)) console.log('MANQUE 50m', id);
for (const id of SMALL) if (!out.c10[id]) console.log('MANQUE 10m', id);
fs.writeFileSync('world.json', JSON.stringify(out)); console.log((fs.statSync('world.json').size / 1e6).toFixed(1) + ' Mo');
