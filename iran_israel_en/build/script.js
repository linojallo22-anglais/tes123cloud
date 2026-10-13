// Sous-titres générés depuis le texte ElevenLabs : groupes de 3-6 mots, nombres affichés en chiffres, mots-clés surlignés.
const PARAS = ["Israel and Iran have traded strikes again and again. But neither army can simply drive to the other country. Here's why, on the map.", "They're almost a thousand miles apart. That's farther than New York to Chicago. And they don't share a single border: Jordan, Iraq, Syria or Saudi Arabia stand in the way.", "Israel is about the size of New Jersey. At its narrowest, it's only nine miles wide. So it built a shield in the sky, with one layer that stops missiles in space.", "Iran is almost as big as Alaska, and it's walled off by the Zagros Mountains, more than nine hundred miles long. It even hid a nuclear site three hundred feet under a mountain. To hit it, America flew B-2 bombers all the way from Missouri.", "But Iran's strongest card is water: the Strait of Hormuz. It's just twenty-one miles wide, and normally about a fifth of the world's oil goes through it.", "Mountains or a shield in space: which one wins? Tell me in the comments."];
const tokenize = s => s.split(/\s+/).filter(Boolean).reduce((a, w) => { if (/^[?:!;…]+$/.test(w) && a.length) a[a.length - 1] += ' ' + w; else a.push(w); return a; }, []);
const NUMS = [['new york', 'NEW YORK'], ['new jersey', '*NEW JERSEY*'], ['saudi arabia', 'SAUDI ARABIA'], ['a thousand miles', '1,000 MILES'], ['nine miles', '9 MILES'], ['nine hundred miles', '900 MILES'], ['three hundred feet', '300 FEET'], ['twenty-one miles', '21 MILES'], ['a fifth', '1/5'], ['b-2', 'B-2']];
const KEYS = /^(ISRAEL|IRAN|IRAN,|DRIVE|MAP|BORDER|BORDER:|JERSEY|SHIELD|SPACE|SPACE:|ALASKA|ZAGROS|MOUNTAIN|MOUNTAINS|B-2|MISSOURI|WATER|HORMUZ|OIL|COMMENTS)[,.:?…]*$/;
const clean = w => w.toLowerCase().replace(/\s*[,.:?!…;]+$/, '');
function buildScript() {
  return PARAS.map(p => {
    const T = tokenize(p); const units = [];
    for (let i = 0; i < T.length;) {
      let hit = null;
      for (const [ph, disp] of NUMS) { const n = ph.split(' ').length; if (i + n <= T.length && T.slice(i, i + n).map(clean).join(' ') === ph) { hit = { n, disp: disp + (T[i + n - 1].match(/\s*[,.:?!…;]+$/) || [''])[0] }; break; } }
      if (hit) { units.push({ toks: T.slice(i, i + hit.n), disp: '*' + hit.disp + '*' }); i += hit.n; }
      else { const up = T[i].toUpperCase(); units.push({ toks: [T[i]], disp: KEYS.test(up) ? '*' + up + '*' : up }); i++; }
    }
    const clauses = []; let cl = [];
    units.forEach(u => { cl.push(u); if (/[.:?!…,;]$/.test(u.toks.at(-1))) { clauses.push(cl); cl = []; } }); if (cl.length) clauses.push(cl);
    const groups = [];
    for (const c of clauses) { const nw = c.reduce((a, x) => a + x.toks.length, 0); const parts = Math.ceil(nw / 5); const per = nw / parts; let cur = [], cnt = 0, k = 1;
      for (const u of c) { cur.push(u); cnt += u.toks.length; if (cnt >= per * k - 0.01 && k < parts) { groups.push(cur); cur = []; k++; } } if (cur.length) groups.push(cur); }
    // fusionner les groupes d'un seul mot court avec le suivant/précédent
    for (let i = groups.length - 1; i >= 0; i--) { const n = groups[i].reduce((a, x) => a + x.toks.length, 0); if (n === 1 && groups[i][0].toks[0].length < 7 && !/\*/.test(groups[i][0].disp)) { if (i > 0 && !/[.?!…]$/.test(groups[i - 1].at(-1).toks.at(-1)) && groups[i - 1].reduce((a, x) => a + x.toks.length, 0) < 6) { groups[i - 1].push(...groups[i]); groups.splice(i, 1); } else if (i + 1 < groups.length) { groups[i + 1].unshift(...groups[i]); groups.splice(i, 1); } } }
    return groups.map(g => { let disp = g.map(u => u.disp).join(' '); const stars = (disp.match(/\*/g) || []).length; if (stars > 2) { let k = 0; disp = disp.replace(/\*/g, () => (k++ < 2 ? '*' : '')); } return [disp, g.flatMap(u => u.toks).join(' ')]; });
  });
}
const SCRIPT = buildScript();
if (typeof module !== 'undefined') module.exports = { SCRIPT, tokenize };
