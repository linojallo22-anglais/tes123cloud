const $=id=>document.getElementById(id);
const cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x)),eo=t=>1-Math.pow(1-t,3);
const eb=t=>{const c1=1.6,c3=c1+1;return 1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2)},pr=(t,s,d)=>cl((t-s)/d);
const q12=t=>Math.floor(t*12+1e-6)/12;
window.EVENTS=[];const EV=(t,k)=>EVENTS.push([t,k]);
(function(){let h='';for(let c=0;c<7;c++){h+=`<div class="col" style="left:${-30+c*285}px;top:-20px">`;for(let r=0;r<75;r++)h+=(r%15===3)?'<b></b>':`<i style="width:${70+((r*37+c*13)%30)}%"></i>`;h+='</div>';}$('cols').innerHTML=h})();
// --- ancrage sur la voix : WORDS=[[mot,t],...] ---
const nz=s=>s.toLowerCase().replace(/’/g,"'").split(/\s+/).map(w=>w.replace(/[^a-z0-9']/g,'').replace(/^'+|'+$/g,'')).filter(Boolean);
let SCUR=0;window.MISS=[];
function find(ph,from){const p=nz(ph);for(let i=from;i<=WORDS.length-p.length;i++){let ok=true;for(let k=0;k<p.length;k++)if(WORDS[i+k][0]!==p[k]){ok=false;break}if(ok)return i}MISS.push(ph);return -1}
function T(ph,dt=0){const i=find(ph,SCUR);return i<0?NaN:WORDS[i][1]+dt}
const OBJ=[],objs=$('objs'),SC=[];
function scene(ph,dt=0){const i=find(ph,SCUR);if(i>=0)SCUR=i;const t=i<0?NaN:Math.max(0,WORDS[i][1]+dt-0.1);SC.push(t);return t;}
function O(content,a,x,y,opt={}){if(isNaN(a))MISS.push('time:'+content.slice(0,40));const e=document.createElement('div');e.className='o'+(opt.img?' cut':'');
 e.innerHTML=opt.img?`<img src="../img/${content}.png" style="${opt.h?'height:'+opt.h:'width:'+opt.w}px;display:block">`:content;
 if(opt.tape)opt.tape.forEach(tp=>{e.innerHTML+=`<div class="tape" style="left:${tp[0]}px;top:${tp[1]}px;transform:rotate(${tp[2]}deg)"></div>`});
 objs.appendChild(e);const o={e,a,si:SC.length-1,zz:opt.z,x,y,fx:opt.fx||'drop',r:opt.r||0,id:opt.id};OBJ.push(o);
 if(opt.sfx!==false)EV(a,opt.sfx||{stamp:'stamp',drop:'paper',slideL:'slide',slideR:'slide',slideT:'slide',slideB:'slide',pop:'tap'}[o.fx]);
 if(opt.tape)EV(a+.35,'tape');return o;}
const I=(n,a,x,y,o={})=>O(n,a,x,y,Object.assign({img:1},o));
const S=(t,a,x,y,o={})=>O(`<div class="strip ${o.cls||''}" style="${o.st||''}">${t}</div>`,a,x,y,Object.assign({fx:'drop',tape:[[-66,-22,-32]]},o));
const H=(t,a,x,y,o={})=>O(`<div class="head" style="${o.st||''}">${t}</div>`,a,x,y,Object.assign({fx:'slideL'},o));
const ST=(t,a,x,y,o={})=>O(`<div class="stamp ${o.cls||''}" style="${o.st||''}">${t}</div>`,a,x,y,Object.assign({fx:'stamp'},o));
const TG=(t,a,x,y,o={})=>O(`<div class="tag" style="${o.st||''}">${t}</div>`,a,x,y,Object.assign({fx:'pop'},o));
const QT=(t,a,x,y,o={})=>O(`<div class="quote" style="${o.st||''}">${t}</div>`,a,x,y,Object.assign({fx:'pop',sfx:'pop'},o));
const BAR=(c,h,a,x,yb,o={})=>O(`<div style="width:200px;height:${h}px;background:${c};box-shadow:0 10px 16px rgba(40,25,10,.4);clip-path:polygon(0 1%,4% 0,96% 1.5%,100% 0,100% 100%,0 100%)"></div>`,a,x,yb-h/2,Object.assign({fx:'slideB'},o));
const MARKS=[];function circ(a,cx,cy,rx,ry){MARKS.push({a,si:SC.length-1,d:`M${cx+rx} ${cy} A${rx} ${ry} 0 1 1 ${cx+rx-2} ${cy-8}`});EV(a,'scribble');}
function cross(a,cx,cy,s){MARKS.push({a,si:SC.length-1,d:`M${cx-s} ${cy-s*.8} L${cx+s} ${cy+s*.8} M${cx+s} ${cy-s*.8} L${cx-s} ${cy+s*.8}`});EV(a,'scribble');}
const LINES=[];function line(a,x1,y1,x2,y2){LINES.push({a,si:SC.length-1,p:[x1,y1,x2,y2]});EV(a,'string');}
