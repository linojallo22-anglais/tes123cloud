import fs from 'fs';
import * as topojson from 'topojson-client';
import * as d3 from 'd3-geo';
const nm='../node_modules/world-atlas/';
const out={};
for (const res of ['50m','10m']){
  const topo=JSON.parse(fs.readFileSync(nm+`countries-${res}.json`));
  const fc=topojson.feature(topo,topo.objects.countries);
  const keep=fc.features.filter(f=>{const [[x0,y0],[x1,y1]]=d3.geoBounds(f);return x1>-25&&x0<45&&y1>34&&y0<72&&!(x1-x0>180)});
  // also keep big ones crossing (Russia) by clipping later in canvas
  const ru=fc.features.find(f=>f.id==='643');
  out['c'+res]=keep.concat(ru&&!keep.includes(ru)?[ru]:[]).map(f=>({id:f.id,n:f.properties.name,g:f.geometry}));
  if(res==='50m'){const L=topojson.merge(topo,topo.objects.countries.geometries);L.coordinates=L.coordinates.filter(p=>{const [[x0,y0],[x1,y1]]=d3.geoBounds({type:'Polygon',coordinates:p});return x1>-30&&x0<60&&y1>30&&y0<75});out.land50m=L;}
  if(res==='10m')out.c10m=out.c10m.filter(c=>{const [[x0,y0],[x1,y1]]=d3.geoBounds({type:'Feature',geometry:c.g});return c.id!=='643'&&x1>0&&x0<26&&y1>44&&y0<58});
}
// trees inside Germany for illustrated style
const de=out.c50m.find(c=>c.id==='276');
let s=7;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;
const trees=[];while(trees.length<420){const p=[5.8+rnd()*9.3,47.2+rnd()*7.9];if(d3.geoContains({type:'Feature',geometry:de.g},p))trees.push(p.map(v=>+v.toFixed(3)))}
out.trees=trees;
fs.writeFileSync('world.json',JSON.stringify(out));
console.log(out.c50m.length,out.c10m.length,(fs.statSync('world.json').size/1e6).toFixed(1)+'MB');
