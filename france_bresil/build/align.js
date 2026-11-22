// Aligne les mots du script sur la transcription whisper (au niveau des caractères), puis cale les débuts de phrase sur les silences.
const fs = require('fs'); const { SCRIPT, tokenize } = require('./script.js');
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
const U = ['zero','un','deux','trois','quatre','cinq','six','sept','huit','neuf','dix','onze','douze','treize','quatorze','quinze','seize'];
const D = {20:'vingt',30:'trente',40:'quarante',50:'cinquante',60:'soixante'};
function fr(n) {
  if (n < 17) return U[n]; if (n < 20) return 'dix' + U[n - 10];
  if (n < 70) { const d = Math.floor(n / 10) * 10, u = n % 10; return D[d] + (u === 1 ? 'etun' : u ? U[u] : ''); }
  if (n < 80) return 'soixante' + (n === 71 ? 'etonze' : fr(n - 60));
  if (n < 100) return 'quatrevingt' + (n === 80 ? '' : fr(n - 80));
  if (n < 1000) { const c = Math.floor(n / 100), r = n % 100; return (c > 1 ? U[c] : '') + 'cent' + (r ? fr(r) : ''); }
  const m = Math.floor(n / 1000), r = n % 1000; return (m > 1 ? fr(m) : '') + 'mille' + (r ? fr(r) : '');
}
const chunks = JSON.parse(fs.readFileSync('whisper.json'));
const wc = []; // [char, chunkIndex, posInChunk, lenChunk]
chunks.forEach((c, i) => {
  let s = c.text.toLowerCase().replace(/(\d)[  ](?=\d{3})/g, '$1').replace(/\bkm\b/g, 'kilometres');
  s = s.replace(/\d+/g, m => m === '000' ? 'mille' : fr(+m));
  const n = norm(s); for (let k = 0; k < n.length; k++) wc.push([n[k], i, k, n.length]);
});
const words = []; SCRIPT.forEach((beat, b) => beat.forEach(([, spk], fi) => tokenize(spk).forEach(w => words.push({ w, b, fi }))));
const sc = []; words.forEach((x, i) => { const n = norm(x.w); for (let k = 0; k < n.length; k++) sc.push([n[k], i]); });
// DP
const A = sc.length, B = wc.length, M = new Int32Array((A + 1) * (B + 1)), P = new Uint8Array((A + 1) * (B + 1));
for (let i = 0; i <= A; i++) { M[i * (B + 1)] = i; P[i * (B + 1)] = 1; }
for (let j = 0; j <= B; j++) { M[j] = j; P[j] = 2; }
for (let i = 1; i <= A; i++) for (let j = 1; j <= B; j++) {
  const k = i * (B + 1) + j, d = M[k - B - 2] + (sc[i - 1][0] === wc[j - 1][0] ? 0 : 1), u = M[k - B - 1] + 1, l = M[k - 1] + 1;
  if (d <= u && d <= l) { M[k] = d; P[k] = 0; } else if (u <= l) { M[k] = u; P[k] = 1; } else { M[k] = l; P[k] = 2; }
}
const match = new Array(A).fill(-1); let i = A, j = B;
while (i > 0 || j > 0) { const p = P[i * (B + 1) + j]; if (i > 0 && j > 0 && p === 0) { if (sc[i - 1][0] === wc[j - 1][0]) match[i - 1] = j - 1; i--; j--; } else if (i > 0 && (p === 1 || j === 0)) i--; else j--; }
const tAt = jj => { const [, ci, pos, len] = wc[jj]; const [s, e] = chunks[ci].timestamp; return s + (e - s) * pos / len; };
const tEnd = jj => { const [, ci, pos, len] = wc[jj]; const [s, e] = chunks[ci].timestamp; return s + (e - s) * (pos + 1) / len; };
words.forEach((x, wi) => {
  const idx = sc.map((c, k) => c[1] === wi ? k : -1).filter(k => k >= 0).filter(k => match[k] >= 0);
  if (idx.length >= Math.max(1, norm(x.w).length * 0.4)) { x.t0 = tAt(match[idx[0]]); x.t1 = tEnd(match[idx.at(-1)]); }
});
// interpolation des mots non trouvés
for (let k = 0; k < words.length; k++) if (words[k].t0 == null) {
  let a = k - 1; while (a >= 0 && words[a].t0 == null) a--; let b = k + 1; while (b < words.length && words[b].t0 == null) b++;
  const ta = a >= 0 ? words[a].t1 : 0, tb = b < words.length ? words[b].t0 : ta + 0.5 * (b - a);
  for (let q = a + 1; q < b; q++) { const f0 = (q - a - 1) / (b - a - 1), f1 = (q - a) / (b - a - 1); words[q].t0 = ta + (tb - ta) * f0; words[q].t1 = ta + (tb - ta) * f1; words[q].interp = true; }
}
// calage sur les silences
const sil = fs.readFileSync('silences.txt', 'utf8').split('\n').map(l => l.match(/silence_end: ([\d.]+)/)).filter(Boolean).map(m => +m[1]);
const starts = words.map((x, k) => k === 0 || /[.?…:!]$/.test(words[k - 1].w) || words[k - 1].b !== x.b ? k : -1).filter(k => k >= 0);
const deltas = [];
starts.forEach(k => { const t = words[k].t0; const c = sil.filter(s => s > t - 0.6 && s < t + 0.15); if (c.length) { const s = c.at(-1); words[k].delta = s - t; deltas.push(s - t); } });
const med = deltas.sort((a, b) => a - b)[Math.floor(deltas.length / 2)] || 0;
let cur = med; const out = [];
words.forEach((x, k) => { if (starts.includes(k)) cur = x.delta ?? med; out.push({ w: x.w, b: x.b, fi: x.fi, t0: +Math.max(0, x.t0 + cur).toFixed(3), t1: +Math.max(0, x.t1 + cur).toFixed(3), interp: !!x.interp }); });
for (let k = 1; k < out.length; k++) if (out[k].t0 < out[k - 1].t0) out[k].t0 = out[k - 1].t0 + 0.02;
const dur = +process.argv[2];
fs.writeFileSync('timing.json', JSON.stringify({ provisional: false, duration: dur, words: out }));
console.log('médiane calage', med.toFixed(3), 'mots interpolés:', out.filter(x => x.interp).map(x => x.w + '@' + x.t0).join(' '));
console.log('premier mot', out[0].t0, 'dernier', out.at(-1).w, out.at(-1).t1);
