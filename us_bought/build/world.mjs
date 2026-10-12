import fs from 'fs'; import * as topo from 'topojson-client';
const w50=JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-50m.json')); const w10=JSON.parse(fs.readFileSync('node_modules/world-atlas/countries-10m.json'));
const f50=topo.feature(w50,w50.objects.countries); const f10=topo.feature(w10,w10.objects.countries);
const borders50=topo.mesh(w50,w50.objects.countries,(a,b)=>a!==b); const borders10=topo.mesh(w10,w10.objects.countries,(a,b)=>a!==b);
const land50=topo.feature(w50,w50.objects.land);
const KEEP10=['840','643','124','484','304','208','608','591','850','192','332','214','630','044','092','188','558','222','340','320','084','170'];
fs.writeFileSync('build/w50.json',JSON.stringify({c:f50.features.map(f=>({id:f.id,n:f.properties.name,g:f.geometry})),b:borders50,land:land50}));
fs.writeFileSync('build/w10.json',JSON.stringify({c:f10.features.filter(f=>KEEP10.includes(f.id)).map(f=>({id:f.id,n:f.properties.name,g:f.geometry})),b:borders10}));
console.log(f50.features.length, f10.features.filter(f=>KEEP10.includes(f.id)).map(f=>f.properties.name).join(','));
