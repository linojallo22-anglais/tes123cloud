// Données : pays du Moyen-Orient, Bretagne, chaînes de montagnes, grille « Israël × 75 » dans l'Iran.
import fs from 'fs'; import * as topojson from 'topojson-client'; import * as d3 from 'd3-geo';
const nm = '../node_modules/';
const T50 = JSON.parse(fs.readFileSync(nm + 'world-atlas/countries-50m.json')), T10 = JSON.parse(fs.readFileSync(nm + 'world-atlas/countries-10m.json'));
const IDS = { il: '376', ir: '364', jo: '400', iq: '368', sy: '760', sa: '682', lb: '422', eg: '818', tr: '792', om: '512', ae: '784', qa: '634', kw: '414', bh: '048', ps: '275', fr: '250', us: '840' };
const f10 = topojson.feature(T10, T10.objects.countries).features, f50 = topojson.feature(T50, T50.objects.countries).features;
const c = {}; for (const [k, id] of Object.entries(IDS)) { const f = (['il', 'ps', 'ae', 'om', 'bh', 'qa', 'kw', 'lb'].includes(k) ? f10 : f50).find(x => x.id === id); if (!f) { console.log('manque', k); continue; } c[k] = f.geometry; }
// France métropolitaine seulement, États-Unis contigus
const keepPolys = (g, fn) => ({ type: 'MultiPolygon', coordinates: g.coordinates.filter(p => fn(d3.geoCentroid({ type: 'Polygon', coordinates: p }))) });
c.fr = keepPolys(c.fr, ([x, y]) => x > -6 && x < 10 && y > 41 && y < 52); c.us = keepPolys(c.us, ([x, y]) => x > -130 && y > 24 && y < 50);
const R = JSON.parse(fs.readFileSync('../data/regions.geojson')); const bzh = R.features.find(f => f.properties.nom === 'Bretagne').geometry;
const R6 = 6371, km2 = g => d3.geoArea(g) * R6 * R6;
// Israël déplacé à vraie taille sur la Bretagne
const c0 = d3.geoCentroid(c.il); const moveTo = (g, to, rot = 0) => { const r1 = d3.geoRotation([-c0[0], -c0[1]]), r3 = d3.geoRotation([0, 0, rot]), r2 = d3.geoRotation([-to[0], -to[1]]); const mp = q => typeof q[0] === 'number' ? r2.invert(r3(r1(q))).map(v => +v.toFixed(4)) : q.map(mp); return { type: g.type, coordinates: mp(g.coordinates) }; };
const ilOnBzh = moveTo(c.il, [-5.6, 46.6], 90);
// grille de carrés de la taille d'Israël dans l'Iran
const side = Math.sqrt(km2(c.il)); const dLat = side / 111.2; const sq = [];
for (let lat = 24.5; lat < 40; lat += dLat) { const dLon = dLat / Math.cos((lat + dLat / 2) * Math.PI / 180); for (let lon = 43.5; lon < 63.5; lon += dLon) { const ctr = [lon + dLon / 2, lat + dLat / 2]; if (d3.geoContains(c.ir, ctr)) sq.push([+lon.toFixed(3), +lat.toFixed(3), +dLon.toFixed(3), +dLat.toFixed(3)]); } }
sq.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
const zagros = [[44.8, 37.4], [45.6, 36.2], [46.4, 35.0], [47.3, 34.0], [48.3, 33.1], [49.4, 32.3], [50.4, 31.5], [51.3, 30.7], [52.3, 29.8], [53.5, 28.9], [54.9, 28.1], [56.2, 27.6]];
const elbourz = [[48.6, 37.6], [49.4, 36.9], [50.3, 36.5], [51.2, 36.15], [52.1, 35.95], [53.2, 36.15], [54.4, 36.5], [55.6, 37.0], [56.7, 37.4]];
const out = { c, borders: topojson.mesh(T50, T50.objects.countries, (a, b) => a !== b), bzh, ilOnBzh, sq, zagros, elbourz };
console.log('Israël km²', Math.round(km2(c.il)), 'Iran', Math.round(km2(c.ir)), 'Bretagne', Math.round(km2(bzh)), 'carrés', sq.length, 'côté', side.toFixed(0));
fs.writeFileSync('data.json', JSON.stringify(out)); console.log((fs.statSync('data.json').size / 1e6).toFixed(1) + ' Mo');
