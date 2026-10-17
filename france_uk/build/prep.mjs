import fs from 'fs'; import * as topojson from 'topojson-client'; import * as d3 from 'd3-geo';
const nm = '../node_modules/world-atlas/';
const T50 = JSON.parse(fs.readFileSync(nm + 'countries-50m.json')), T10 = JSON.parse(fs.readFileSync(nm + 'countries-10m.json'));
const EU = ['040','056','100','191','196','203','208','233','246','250','276','300','348','372','380','428','440','442','470','528','616','620','642','703','705','724','752'];
const NATO = EU.filter(x => !['040','196','372','470'].includes(x)).concat(['008','124','352','499','807','578','792','826','840']);
const SMALL = ['250','826','276','380','724','616','056','528','752','300','620','372','756','554','036','124','840','040','196','470','442','705','191','233','428','440','208'];
const keep = { '250': ([x, y]) => x > -6 && x < 10 && y > 41 && y < 52, '724': ([x, y]) => y > 35, '840': ([x, y]) => !(y < 25 && x < -150), '620': ([x, y]) => x > -10, '528': ([x, y]) => y > 50 };
function clean(f) { const k = keep[f.id]; if (!k || f.geometry.type !== 'MultiPolygon') return f; return { ...f, geometry: { type: 'MultiPolygon', coordinates: f.geometry.coordinates.filter(p => k(d3.geoCentroid({ type: 'Polygon', coordinates: p }))) } }; }
const f50 = topojson.feature(T50, T50.objects.countries).features.map(clean);
const f10 = topojson.feature(T10, T10.objects.countries).features.filter(f => SMALL.includes(f.id)).map(clean);
const out = { c50: f50.map(f => ({ id: f.id, n: f.properties.name, g: f.geometry })), c10: Object.fromEntries(f10.map(f => [f.id, f.geometry])), borders: topojson.mesh(T50, T50.objects.countries, (a, b) => a !== b), EU, NATO, cent: Object.fromEntries(f50.map(f => [f.id, d3.geoCentroid(f).map(v => +v.toFixed(2))])) };
for (const id of [...EU, ...NATO, '036', '554', '756']) if (!out.c50.find(c => c.id === id)) console.log('MANQUE', id);
fs.writeFileSync('world.json', JSON.stringify(out)); console.log((fs.statSync('world.json').size / 1e6).toFixed(1) + ' Mo');
