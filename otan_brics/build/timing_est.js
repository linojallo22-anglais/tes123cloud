// Minutage PROVISOIRE (avant réception du MP3) : durée estimée par mot, total ramené à TOTAL s.
const {SCRIPT,tokenize}=require('./script.js');const TOTAL=+process.argv[2]||89;
let t=0;const words=[];
SCRIPT.forEach((beat,b)=>{beat.forEach(([sub,spk],fi)=>{tokenize(spk).forEach(w=>{const n=w.replace(/[^\p{L}]/gu,'').length;const d=0.09+0.062*n;words.push({w,b,fi,t0:t,t1:t+d});t+=d;if(/[,]$/.test(w))t+=0.18;if(/[.…?:]$/.test(w)||/ [?:]$/.test(w))t+=0.38;});});t+=0.25;});
const k=(TOTAL-0.6)/t;words.forEach(x=>{x.t0=+(x.t0*k).toFixed(3);x.t1=+(x.t1*k).toFixed(3)});
require('fs').writeFileSync('timing.json',JSON.stringify({provisional:true,duration:TOTAL,words}));console.log(words.length,'mots, fin',words.at(-1).t1);
