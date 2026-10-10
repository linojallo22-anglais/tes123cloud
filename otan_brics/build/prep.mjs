import fs from 'fs'; import * as topojson from 'topojson-client'; import * as d3 from 'd3-geo';
const nm = '../node_modules/world-atlas/';
const T50 = JSON.parse(fs.readFileSync(nm + 'countries-50m.json')), T10 = JSON.parse(fs.readFileSync(nm + 'countries-10m.json'));
const NATO = ['008','056','100','124','191','203','208','233','246','250','276','300','348','352','380','428','440','442','499','528','807','578','616','620','642','703','705','724','752','792','826','840'];
const BRICS = ['076','643','356','156','710','818','231','364','784','360'];
const PART = ['112','068','192','398','458','566','764','800','860','704'];
const NAMED = ['250','826','276','380','724','616','643','112','792','840','124','076','192','068','710','818','231','566','800','012','156','356','364','784','360','398','704','682','036'];
// découpe : garder la partie métropolitaine pour le cadrage / drapeaux
const keep = { '250': ([x, y]) => x > -6 && x < 10 && y > 41 && y < 52, '724': ([x, y]) => y > 35, '840': ([x, y]) => !(y < 25 && x < -150) };
function clean(f) {
  const k = keep[f.id]; if (!k || f.geometry.type !== 'MultiPolygon') return f;
  const polys = f.geometry.coordinates.filter(p => { const c = d3.geoCentroid({ type: 'Polygon', coordinates: p }); return k(c); });
  return { ...f, geometry: { type: 'MultiPolygon', coordinates: polys } };
}
const f50 = topojson.feature(T50, T50.objects.countries).features.map(clean);
const BIG = ['643','124','840','076','156','356','360','036','398','710','068','012','682','231','364'];
const f10 = topojson.feature(T10, T10.objects.countries).features.filter(f => NAMED.includes(f.id) && !BIG.includes(f.id)).map(clean);
const out = {
  c50: f50.map(f => ({ id: f.id, n: f.properties.name, g: f.geometry })),
  c10: Object.fromEntries(f10.map(f => [f.id, f.geometry])),
  land: topojson.merge(T50, T50.objects.countries.geometries),
  borders: topojson.mesh(T50, T50.objects.countries, (a, b) => a !== b),
  NATO, BRICS, PART, NAMED,
  cent: Object.fromEntries(f50.map(f => [f.id, d3.geoCentroid(f).map(v => +v.toFixed(2))])),
};
for (const id of [...NATO, ...BRICS, ...PART, '682', '012', '036']) if (!out.c50.find(c => c.id === id)) console.log('MANQUE', id);
fs.writeFileSync('world.json', JSON.stringify(out)); console.log((fs.statSync('world.json').size / 1e6).toFixed(1) + ' Mo', f10.length, 'pays 10m');
console.log(out.c50.filter(c => NATO.includes(c.id)).map(c => c.n).join(', '));
