// Choisit les phrases du Short dans la voix longue, calcule les bornes (dans les silences) et colle vshort.wav.
const fs = require('fs'); const { execSync } = require('child_process');
const W = require('./timing.json').words; const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '');
const find = (b, from, to) => { const L = W.map((w, i) => ({ ...w, i })).filter(w => w.b === b); const i0 = L.findIndex(w => norm(w.w) === from); const i1 = L.findIndex((w, k) => k >= i0 && norm(w.w) === to); if (i0 < 0 || i1 < 0) throw new Error('introuvable ' + b + ' ' + from + ' ' + to); return [L[i0].i, L[i1].i]; };
const PICK = [[0, 'douze', 'impossible'], [0, 'liran', 'terre'], [2, 'israel', 'large'], [2, 'et', 'latmosphere'], [3, 'dans', 'degres'], [4, 'le', 'roche'], [5, 'le', 'ici'], [5, 'et', 'epice'], [6, 'et', 'commentaire']];
// précisions : 'le' (beat 4) = « Le plus célèbre », 'a' (beat 2) = « À son point », 'et' (beat 2) = « Et tout en haut », 'et' (beat 5) = « Et sur l'île », 'et' (beat 6) = « Et toi »
const START_AT = { '5|le': 'detroit', '2|et': 'tout', '4|le': 'plus', '5|et': 'sur', '6|et': 'toi' };
const SEG = []; let dst = 0; const GAP = 0.28;
for (const [b, from, to] of PICK) {
  let [i0, i1] = find(b, from, to);
  const nx = START_AT[b + '|' + from]; if (nx) { const L = W.map((w, i) => ({ ...w, i })).filter(w => w.b === b); const k = L.findIndex((w, k) => norm(w.w) === from && L[k + 1] && norm(L[k + 1].w) === nx); i0 = L[k].i; i1 = L.find((w, kk) => kk > k && norm(w.w) === to).i; }
  const s = Math.max((W[i0 - 1]?.t1 ?? 0) + 0.03, W[i0].t0 - 0.12), e = Math.min((W[i1 + 1]?.t0 ?? 1e9) - 0.03, W[i1].t1 + 0.18);
  SEG.push({ src: [+s.toFixed(3), +e.toFixed(3)], dst: +dst.toFixed(3), text: W.slice(i0, i1 + 1).map(w => w.w).join(' ') }); dst += e - s + GAP;
}
const total = dst - GAP; console.log(SEG.map(x => x.dst.toFixed(1) + ' ' + x.src.join('-') + ' ' + x.text).join('\n')); console.log('durée', total.toFixed(2));
fs.writeFileSync('seg.json', JSON.stringify({ SEG, dur: +total.toFixed(3) }));
const parts = SEG.map((g, k) => `[0:a]atrim=${g.src[0]}:${g.src[1]},asetpts=PTS-STARTPTS,afade=t=in:d=0.035,afade=t=out:st=${(g.src[1] - g.src[0] - 0.035).toFixed(3)}:d=0.035${k < SEG.length - 1 ? ',apad=pad_dur=' + GAP : ''}[s${k}]`).join(';');
execSync(`ffmpeg -v error -y -i ../assets/voice.wav -filter_complex "${parts};${SEG.map((_, k) => `[s${k}]`).join('')}concat=n=${SEG.length}:v=0:a=1" vshort.wav`);
console.log('vshort.wav ok');
