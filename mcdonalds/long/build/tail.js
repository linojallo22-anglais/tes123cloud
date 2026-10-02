// fin de scène = début de la scène suivante
const zOf=si=>SC[si+1]!==undefined?SC[si+1]:DUR;
OBJ.forEach(o=>{o.z=o.zz!==undefined?o.zz:zOf(o.si)});MARKS.forEach(m=>m.z=zOf(m.si));LINES.forEach(L=>L.z=zOf(L.si));
const lay=$('lay');
MARKS.forEach((m,i)=>{lay.innerHTML+=`<path id="mk${i}" d="${m.d}" stroke="#C8261E" stroke-width="10" stroke-linecap="round" fill="none" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>`;});
LINES.forEach((L,i)=>{const [x1,y1,x2,y2]=L.p;lay.innerHTML+=`<path id="ln${i}" d="M${x1} ${y1} Q${(x1+x2)/2} ${Math.min(y1,y2)-80} ${x2} ${y2}" stroke="#C8261E" stroke-width="6" fill="none" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/><circle id="pa${i}" cx="${x1}" cy="${y1}" r="11" fill="#B8872B" opacity="0"/><circle id="pb${i}" cx="${x2}" cy="${y2}" r="11" fill="#B8872B" opacity="0"/>`;});
SC.slice(1).forEach(t=>EV(t-.08,'whoosh'));
OBJ.forEach(o=>{if(o.e.querySelector('.strip'))for(let k=0;k<5;k++)EV(o.a+.05+k*.055,'key');});
window.render=function(t){const tq=q12(t);
 let si=0;for(let i=0;i<SC.length;i++)if(t>=SC[i])si=i;const st=SC[si],sd=(SC[si+1]||DUR)-st,k=pr(t,st,sd);
 const jit=(Math.sin(Math.floor(t*12)*12.9898)*43758.5453)%1;
 $('world').style.transform=`scale(${1+.04*k}) rotate(${(si%2?-1:1)*.3*k}deg)`;
 $('paper').style.transform=`translate(${(si%2?-1:1)*14*k}px,${-6*k}px)`;
 for(const o of OBJ){const e=o.e;if(t<o.a||t>o.z+.35){e.style.opacity=0;continue}
  const w=e.offsetWidth,h=e.offsetHeight;let x=o.x,y=o.y,s=1,op=1,r=o.r;
  const p=pr(tq,o.a,o.fx==='stamp'?.25:.42),pe=eb(p);
  if(o.fx==='slideL')x=o.x-2100*(1-pe);if(o.fx==='slideR')x=o.x+2100*(1-pe);
  if(o.fx==='slideT')y=o.y-1300*(1-pe);if(o.fx==='slideB')y=o.y+1300*(1-pe);
  if(o.fx==='drop'){s=1.35-.35*eo(p);op=cl(p*3);r=o.r+(1-eo(p))*8;}
  if(o.fx==='stamp'){s=2.4-1.4*eo(p);op=cl(p*4);}
  if(o.fx==='pop'){s=.2+.8*pe;op=cl(p*3);}
  if(o.fx.startsWith('slide'))r=o.r+(1-eo(p))*(o.fx==='slideL'?-10:10);
  const since=tq-o.a;if(since>.42&&since<.9)r+=Math.sin(since*40)*1.2*(1-(since-.42)/.48);
  if(o.id==='mix'&&since>.45&&since<1.8){x+=Math.sin(tq*90)*4;r+=Math.sin(tq*70)*.8;}
  if(o.id==='drive'&&since>.42){x+=Math.min(since-.42,5)*30;}
  if(o.id==='fly'&&since>.42){x+=(since-.42)*90;y-=(since-.42)*12;}
  if(o.id==='float'){y+=Math.sin(tq*2.2)*6;}
  const q=pr(t,o.z,.35);if(q>0){y-=q*120;op*=1-q;s*=1-.06*q;}
  e.style.opacity=op;e.style.transform=`translate(${x-w/2}px,${y-h/2}px) scale(${s}) rotate(${r+(jit-.5)*.35}deg)`;}
 MARKS.forEach((m,i)=>{const el=$('mk'+i);el.style.strokeDashoffset=1-eo(pr(t,m.a,.4));el.style.opacity=(t>=m.a&&t<m.z+.2)?1:0;});
 LINES.forEach((L,i)=>{const p=eo(pr(t,L.a,.6)),q=pr(t,L.z,.3),on=t>=L.a&&t<L.z+.3;$('ln'+i).style.strokeDashoffset=1-p;$('ln'+i).style.opacity=on?1-q:0;$('pa'+i).setAttribute('opacity',on?1-q:0);$('pb'+i).setAttribute('opacity',on&&p>.95?1-q:0);});
 let c=null;for(const x of CAP)if(t>=x[0])c=x;const sb=$('sub');
 if(c&&c[1]&&t<DUR-.3){const p=pr(tq,c[0],.17);sb.innerHTML=`<span class="w">${c[1]}</span>`;sb.style.opacity=cl(p*2);sb.style.transform=`translateY(${20*(1-eo(p))}px) rotate(${(CAP.indexOf(c)%2?-1:1)*.8}deg)`;}else sb.innerHTML='';};
document.fonts.ready.then(()=>Promise.all([...document.images].map(i=>i.complete?1:new Promise(r=>i.onload=r))).then(()=>{render(0);window.READY=true;}));
