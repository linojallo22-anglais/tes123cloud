// scene.js — Team Bretagne vs Team Normandie (8 manches). Moteur : engine.js.
const BZ = '#111111', NM = '#c8102e';
const CITY = { rennes: [-1.68, 48.11], caen: [-0.37, 49.18], msm: [-1.511, 48.636], brest: [-4.49, 48.39], lorient: [-3.37, 47.75], havre: [0.107, 49.49], carhaix: [-3.57, 48.28], omaha: [-0.85, 49.37], camembert: [0.18, 48.89], livarot: [0.15, 49.0], pontl: [0.18, 49.28], neuf: [1.44, 49.73], phare: [-4.77, 48.45] };
const CFG = {
  noLabel: true, jetH: 1.2, teamCol: { f: '#3b7bff' }, trail: { plane: '#F7EF08' }, NAME: {}, ANCH: {},
  sides: [[-1, '#222', 'TEAM BRETAGNE', 'f', 'bzh'], [1, NM, 'TEAM NORMANDIE', 'a', 'nor']],
  sprites: ['plane', 'bz_a', 'bz_b', 'nm_a', 'nm_b', 'msm', 'phare', 'fromage', 'crepes', 'barge', 'festival', 'easel', 'cidre', 'ball', 'trophy'],
  extraFlags: ['bzh', 'nor', 'fr'],
};
let REG = {}, R = [];
const ROUNDS = [[1, 'LE MONT-SAINT-MICHEL', 'N', 'msm'], [2, 'LES HABITANTS', 'B', 'rennes'], [3, 'LA MER', 'B', 'phare'], [4, 'LE FROMAGE', 'N', 'camembert'], [5, "L'HISTOIRE", 'N', 'omaha'], [6, 'LE FOOT', 'B', 'brest'], [7, 'LA FÊTE', 'B', 'carhaix'], [8, "L'ART", 'N', 'havre']];

function setup() {
  const a = A; for (const r of WORLD.regions) REG[r.code] = r;
  a.tb = T(0, 'team'); a.contre = T(0, 'contre'); a.tn = T(0, 'team', 2); a.manche = T(0, 'un');
  R = ROUNDS.map(([b, title, win, place]) => ({ b, title, win, place, t: beatStart(b), pt: T(b, 'point'), end: beatStart(b + 1) - 0.15 }));
  a.b9 = beatStart(9); a.partout = T(9, 'quatre'); a.toi = T(9, 'toi'); a.tb9 = T(9, 'team'); a.tn9 = T(9, 'team', 2); a.comm = T(9, 'commentaire'); a.abo = T(9, 'abonnetoi'); a.fin = TE(9, 'abonnetoi');
  a.breton = T(1, 'breton'); a.bz2 = T(2, 'bretagne'); a.nm2 = T(2, 'normandie'); a.km = T(3, 'deux'); a.record = T(3, 'record'); a.n640 = T(3, 'six');
  a.cam = T(4, 'camembert'); a.liv = T(4, 'livarot'); a.pont = T(4, 'pontleveque'); a.neuf = T(4, 'neufchatel');
  a.juin = T(5, 'six'); a.deb = T(5, 'debarquement'); a.ligue = T(6, 'ligue'); a.ren = T(6, 'rennes'); a.bre = T(6, 'brest'); a.lor = T(6, 'lorient'); a.hav = T(6, 'havre');
  a.vc = T(7, 'vieilles'); a.n300 = T(7, 'trois'); a.monet = T(8, 'monet'); a.impr = T(8, 'impression'); a.lance = T(8, 'lance');
  a.sb = a.tn + 0.35; DUR = a.fin + 0.6; a.big = [[a.b9, DUR + 1]];
  R.forEach(r => SCORE[r.win === 'B' ? 'f' : 'a'].push([r.pt, 1]));

  // ---- l'avion vole d'une manche à l'autre
  const order = ['msm', 'rennes', 'phare', 'camembert', 'omaha', 'brest', 'carhaix', 'havre'];
  for (let i = 1; i < order.length; i++) LEGS.push({ jet: 'plane', a: CITY[order[i - 1]], b: CITY[order[i]], t0: R[i].t - 0.15, t1: R[i].t + 0.85, noFollow: true });
  JETVIS = { plane: [[R[1].t - 0.35, a.b9 - 0.2]] };

  // ---- caméra
  const W0 = [-1.9, 48.6];
  const stops = [st(0, 0, -1.6, 48.4, 3800, { drift: 0.05 }), st(a.tn + 0.5, 0.9, -1.3, 48.7, 5200), st(a.manche + 0.3, 0.8, -1.8, 48.5, 4600)];
  stops.push(st(R[0].t + 0.6, 1.0, CITY.msm[0], CITY.msm[1] - 0.05, 96000, { drift: 0.03 }), st(a.breton + 0.2, 0.7, CITY.msm[0], CITY.msm[1] - 0.04, 70000), st(R[0].pt + 0.2, 0.6, CITY.msm[0], CITY.msm[1] - 0.06, 90000));
  R.slice(1).forEach(r => { const p = CITY[r.place]; stops.push(st(r.t + 0.85, 1.0, lerp(W0[0], p[0], 0.5), lerp(W0[1], p[1], 0.5), 7600, { drift: 0.03 })); stops.push(st((r.t + 0.85 + r.pt) / 2 + 0.2, 0.7, lerp(W0[0], p[0], 0.4) + 0.3, lerp(W0[1], p[1], 0.4) - 0.1, 6600)); stops.push(st(r.pt + 0.25, 0.6, lerp(W0[0], p[0], 0.65), lerp(W0[1], p[1], 0.65), 9200)); });
  stops.push(st(a.km + 0.3, 0.7, -3.0, 48.2, 7000), st(a.n640 + 0.2, 0.6, -1.0, 48.9, 5600), st(a.liv + 0.2, 0.6, 0.4, 49.2, 10500), st(a.neuf + 0.2, 0.6, 0.6, 49.3, 8800), st(a.deb + 0.2, 0.8, CITY.omaha[0], CITY.omaha[1] - 0.02, 150000), st(a.hav + 0.2, 0.6, -2.0, 48.6, 6000), st(a.n300 + 0.2, 0.6, -3.4, 48.3, 10500), st(a.impr + 0.2, 0.6, 0.1, 49.45, 13000));
  stops.push(st(a.b9 + 0.5, 1.0, -1.6, 48.5, 4000, { drift: 0.03 }), st(a.toi + 0.2, 0.7, -1.5, 48.6, 4800), st(a.tn9 + 0.2, 0.7, -1.7, 48.5, 4200), st(a.comm + 0.2, 0.7, -1.5, 48.6, 5000), st(a.abo + 0.1, 0.7, -1.6, 48.5, 4400), st(a.fin + 0.5, 0.7, -1.6, 48.5, 4300, { drift: 0.03 }));
  buildCam(stops);
  A.tilt = [[a.tb - 0.1, a.manche, 16], [R[2].t - 0.3, R[3].t, 14], [a.b9 - 0.3, a.toi, 14]];

  // ---- sons et actions
  ev(0, 'whoosh'); ev(a.tb, 'pop'); act(a.tb, 'Breton', 'pose'); ev(a.contre, 'stamp'); ev(a.tn, 'pop'); act(a.tn, 'Normande', 'pose'); ev(a.sb, 'pop'); ev(a.manche, 'boing');
  for (const Lg of LEGS) { ev(Lg.t0, 'jet'); act(Lg.t0, 'avion', 'vole'); ev(Lg.t1 - 0.1, 'whoosh'); }
  R.forEach((r, i) => { ev(r.t, 'swell'); ev(r.t + 0.05, 'pop'); act(r.t, 'manche ' + (i + 1), r.title); ev(r.pt, 'ding'); ev(r.pt + 0.05, 'count'); act(r.pt, 'point', r.win === 'B' ? 'Bretagne' : 'Normandie'); ev(r.pt + 0.6, 'tic'); });
  ev(R[0].t + 0.3, 'fall'); ev(R[0].t + 0.6, 'thud'); ev(a.breton, 'stamp');
  ev(a.bz2, 'pop'); ev(a.nm2, 'pop'); ev(a.km, 'draw'); act(a.km, 'côte bretonne', 's\'allume'); ev(a.record, 'stamp'); ev(a.n640, 'pop');
  for (const x of [a.cam, a.liv, a.pont, a.neuf]) ev(x, 'pop'); act(a.cam, 'fromages', 'tombent');
  ev(a.juin, 'stamp'); ev(a.deb, 'wave'); act(a.deb, 'barge', 'accoste'); for (const x of [a.ren, a.bre, a.lor, a.hav]) ev(x, 'ping'); act(a.ren, 'ballons', 'clubs');
  ev(a.vc, 'cheer'); act(a.vc, 'festival', 'scène'); ev(a.n300, 'count'); ev(a.monet, 'pop'); act(a.monet, 'chevalet', 'tableau'); ev(a.impr, 'shine');
  ev(a.b9 - 0.2, 'whoosh'); ev(a.partout, 'impact'); act(a.partout, 'score', '4-4'); ev(a.toi, 'boing'); ev(a.tb9, 'pop'); ev(a.tn9, 'pop'); ev(a.comm, 'pop'); ev(a.abo, 'pop'); ev(a.abo + 0.1, 'ding'); ev(a.b9 + 1.2, 'cheer');
  fillGaps();
  window.PREVIEW = [0.5, a.contre + 0.4, a.manche + 0.4].concat(R.flatMap(r => [r.t + 1.3, r.pt + 0.3])).concat([a.km + 0.5, a.neuf + 0.3, a.deb + 0.4, a.lor + 0.3, a.n300 + 0.4, a.impr + 0.5, a.partout + 0.4, a.toi + 0.4, a.abo + 0.3]);
}
function fillGaps() { const ts = EVENTS.map(e => e[0]).sort((x, y) => x - y); for (let i = 1; i < ts.length; i++) for (let t = ts[i - 1] + 1.2; t < ts[i] - 0.3; t += 1.2) ev(t, 'tic'); }

// ---------- carte : les deux régions en drapeau ----------
function mapOver(t) {
  const a = A;
  for (const [code, t0, fl, col] of [['53', a.tb, 'bzh', '#fff'], ['28', a.tn, 'nor', '#ffcc00']]) {
    if (t < t0) continue; const g = REG[code].g; const age = t - t0; const won = R.find(r => t >= r.pt && t < r.pt + 0.8 && (r.win === 'B') === (code === '53'));
    flagFill(m, () => pathM(g), d3.geoPath(P).bounds(g), FL[fl], (cam_s > 20000 ? 0.3 : 0.62) + (won ? 0.3 * (1 - (t - won.pt) / 0.8) : 0), Math.max(0, 1 - age / 0.4), 'stretch');
    m.save(); pathM(g); m.lineJoin = 'round'; m.lineWidth = 5; m.strokeStyle = col; m.shadowColor = '#000'; m.shadowBlur = 10; m.stroke(); m.restore();
  }
  // la mer : la côte bretonne s'illumine
  if (t > a.km - 0.1 && t < R[3].t) { const g = REG['53'].g; m.save(); pathM(g); m.globalAlpha = fadeOut(t, R[3].t - 0.3, 0.3); m.setLineDash([26, 14]); m.lineDashOffset = -t * 80; m.lineWidth = 12; m.strokeStyle = '#3fd0ff'; m.shadowColor = '#3fd0ff'; m.shadowBlur = 20; m.stroke(); m.restore(); }
}

// ---------- calque écran ----------
function cityPin(c, key, label, t, t0, t1, o = {}) {
  if (t < t0 || t > t1 + 0.3) return; const p = S(...CITY[key]); const s = popIn(t, t0, 0.3); const al = fadeOut(t, t1, 0.3);
  c.save(); c.globalAlpha = al; ping(c, p.x, p.y, t, t0, null, t1); c.restore();
  if (label) tag(c, label, clamp(p.x + (o.dx || 0), 180, 900), clamp(p.y + (o.dy ?? 70), 420, 1420), { size: o.size || 40, bg: o.bg || '#111', color: '#fff', border: '#fff', sc: s * al });
}
function statTag(c, key, s, t, t0, t1, col, o = {}) { if (t < t0 || t > t1 + 0.3) return; const p = S(...CITY[key]); tag(c, s, clamp(p.x + (o.dx || 0), 200, 880), clamp(p.y + (o.dy ?? -110), 460, 1350), { size: 56, bg: col, border: '#fff', sc: stampScale(t, t0) * fadeOut(t, t1, 0.3) }); }
function dropMap(c, name, key, t, t0, t1, h, o = {}) {
  if (t < t0 || t > t1 + 0.3) return; const p = S(...CITY[key]); const dy = t < t0 + 0.32 ? -700 * (1 - easeIn((t - t0) / 0.32)) : 0;
  c.save(); c.globalAlpha = fadeOut(t, t1, 0.3); sprite(c, name, clamp(p.x + (o.dx || 0), 180, 900), clamp(p.y + (o.dy ?? 40), 560, 1420) + dy + 4 * Math.sin(t * 3), h, { shadow: false }); c.restore();
}
function screenScene(c, t) {
  const a = A;
  // accroche
  if (t < R[0].t + 0.3) {
    const al = fadeOut(t, R[0].t, 0.3); c.save(); c.globalAlpha = al;
    soldier(c, 'bz_a', 230, 1440, 400, t, a.tb - 0.1); tag(c, 'TEAM BRETAGNE', 230, 1010, { size: 46, bg: '#222', border: '#fff', sc: popIn(t, a.tb, 0.3) });
    if (t > a.tn - 0.1) { soldier(c, 'nm_a', 850, 1440, 400, t, a.tn - 0.1, { ph: 1 }); tag(c, 'TEAM NORMANDIE', 850, 1010, { size: 44, bg: NM, border: '#fff', sc: popIn(t, a.tn, 0.3) }); }
    if (t > a.contre) { c.save(); c.translate(540, 1200); const s = stampScale(t, a.contre); c.scale(s, s); c.shadowColor = '#ffd23a'; c.shadowBlur = 40; txt(c, 'VS', 0, 0, { size: 200, weight: 900, color: '#FFE928', stroke: '#3a2500', sw: 18, shadow: false }); c.restore(); }
    c.restore();
    if (t > a.manche - 0.1) tag(c, '1 POINT PAR MANCHE', W / 2, 470, { size: 56, bg: '#FFE928', color: '#111', border: '#111', sc: popIn(t, a.manche, 0.3) * fadeOut(t, R[0].t - 0.1, 0.2), rot: -0.03 });
  }
  // titre de manche + point
  R.forEach((r, i) => {
    const nx = i < 7 ? R[i + 1].t : a.b9; if (t < r.t - 0.05 || t > nx) return; const out = fadeOut(t, nx - 0.2, 0.2);
    tag(c, 'MANCHE ' + (i + 1) + ' · ' + r.title, W / 2, 410, { size: r.title.length > 14 ? 42 : 50, bg: '#111', color: '#FFE928', border: '#FFE928', sc: popIn(t, r.t, 0.3) * out });
    stampText(c, 'POINT ' + (r.win === 'B' ? 'BRETAGNE' : 'NORMANDIE'), W / 2, 1390, t, r.pt, nx - 0.15, { col: r.win === 'B' ? '#111' : NM, size: 70 });
    if (t > r.pt - 0.1) { c.save(); c.globalAlpha = out; const j = Math.abs(Math.sin((t - r.pt) * 5)) * 30; sprite(c, r.win === 'B' ? 'bz_b' : 'nm_b', r.win === 'B' ? 170 : 910, 1250 - j, 260 * popIn(t, r.pt - 0.1, 0.3), { shadow: false }); c.restore(); }
  });
  const e = i => (i < 7 ? R[i + 1].t : a.b9) - 0.2;
  // 1 Mont-Saint-Michel
  dropMap(c, 'msm', 'msm', t, R[0].t + 0.3, e(0), 330, { dy: 60 });
  if (t > a.breton - 0.05 && t < R[0].pt) tag(c, 'BRETON AU IXE SIÈCLE', W / 2, 520, { size: 48, bg: '#222', border: '#fff', sc: stampScale(t, a.breton) * fadeOut(t, R[0].pt - 0.15, 0.15) });
  // 2 habitants
  statTag(c, 'rennes', '3,5 M', t, a.bz2, e(1), '#222'); statTag(c, 'caen', '3,35 M', t, a.nm2, e(1), NM);
  // 3 mer
  dropMap(c, 'phare', 'phare', t, R[2].t + 0.3, e(2), 260, { dx: 120, dy: 60 });
  if (t > a.km - 0.1) counter(c, 2500, t, a.km - 0.1, a.km + 0.6, W / 2, 520, { size: 110, pre: '≈ ', suf: ' KM', label: 'DE CÔTES EN BRETAGNE', until: a.n640 - 0.15 });
  if (t > a.record - 0.05 && t < R[2].pt) tag(c, 'RECORD DE FRANCE', W / 2, 700, { size: 44, bg: '#FFE928', color: '#111', border: '#111', sc: stampScale(t, a.record) * fadeOut(t, a.n640 - 0.15, 0.15) });
  if (t > a.n640 - 0.1) counter(c, 640, t, a.n640 - 0.1, a.n640 + 0.4, W / 2, 520, { size: 110, suf: ' KM', label: 'EN NORMANDIE', until: e(2) });
  // 4 fromage
  dropMap(c, 'fromage', 'camembert', t, R[3].t + 0.3, e(3), 220, { dx: -160, dy: 220 });
  [['camembert', 'CAMEMBERT', a.cam], ['livarot', 'LIVAROT', a.liv], ['pontl', "PONT-L'ÉVÊQUE", a.pont], ['neuf', 'NEUFCHÂTEL', a.neuf]].forEach(([k, l, t0], i) => cityPin(c, k, l, t, t0, e(3), { dy: [70, -60, -70, 70][i], size: 34, bg: NM }));
  // 5 histoire
  dropMap(c, 'barge', 'omaha', t, a.deb - 0.1, e(4), 240, { dy: 200 });
  if (t > a.juin - 0.05) tag(c, '6 JUIN 1944', W / 2, 520, { size: 80, bg: '#2f4f2f', border: '#fff', sc: stampScale(t, a.juin) * fadeOut(t, e(4), 0.3) });
  // 6 foot
  [['rennes', 'RENNES', a.ren], ['brest', 'BREST', a.bre], ['lorient', 'LORIENT', a.lor], ['havre', 'LE HAVRE', a.hav]].forEach(([k, l, t0], i) => { cityPin(c, k, l, t, t0, e(5), { size: 36, bg: i < 3 ? '#222' : NM }); if (t > t0 && t < e(5) + 0.3) { const p = S(...CITY[k]); sprite(c, 'ball', p.x, p.y - 30 - 10 * Math.abs(Math.sin((t - t0) * 6)), 70 * popIn(t, t0, 0.3) * fadeOut(t, e(5), 0.3), { shadow: false }); } });
  if (t > a.ligue - 0.05) { tag(c, 'LIGUE 1 : 3 CLUBS', 300, 560, { size: 40, bg: '#222', border: '#fff', sc: popIn(t, a.lor + 0.2, 0.3) * fadeOut(t, e(5), 0.3) }); tag(c, '1 CLUB', 820, 560, { size: 40, bg: NM, border: '#fff', sc: popIn(t, a.hav + 0.2, 0.3) * fadeOut(t, e(5), 0.3) }); }
  // 7 fête
  dropMap(c, 'festival', 'carhaix', t, a.vc - 0.1, e(6), 260, { dx: 120, dy: 220 });
  if (t > a.n300 - 0.1) counter(c, 300000, t, a.n300 - 0.1, a.n300 + 0.7, W / 2, 520, { size: 110, pre: '≈ ', label: 'FESTIVALIERS', until: e(6) });
  // 8 art
  dropMap(c, 'easel', 'havre', t, a.monet - 0.1, e(7), 300, { dx: -180, dy: 260 });
  if (t > a.impr - 0.05) tag(c, '« IMPRESSION, SOLEIL LEVANT »', W / 2, 520, { size: 40, bg: '#f28c28', border: '#fff', sc: popIn(t, a.impr, 0.3) * fadeOut(t, e(7), 0.3) });
  // fin
  if (t > a.b9 - 0.1) {
    const j = k => Math.abs(Math.sin((t - a.b9) * 5 + k)) * 25;
    sprite(c, t > a.tb9 ? 'bz_b' : 'bz_a', 210, 1450 - (t > a.tb9 ? j(0) : 0), 380 * popIn(t, a.b9 - 0.1, 0.3), { shadow: false }); sprite(c, t > a.tn9 ? 'nm_b' : 'nm_a', 870, 1450 - (t > a.tn9 ? j(1) : 0), 380 * popIn(t, a.b9, 0.3), { shadow: false });
    if (t > a.tb9 - 0.05) tag(c, 'TEAM BRETAGNE', 210, 1030, { size: 42, bg: '#222', border: '#fff', sc: popIn(t, a.tb9, 0.3) }); if (t > a.tn9 - 0.05) tag(c, 'TEAM NORMANDIE', 870, 1030, { size: 40, bg: NM, border: '#fff', sc: popIn(t, a.tn9, 0.3) });
    stampText(c, '4 – 4', W / 2, 900, t, a.partout, a.toi - 0.1, { size: 140, col: '#111' });
    if (t > a.toi - 0.1) { const s = popIn(t, a.toi - 0.1, 0.35) * (1 + 0.05 * Math.sin(t * 6)); c.save(); c.translate(W / 2, 1120); c.scale(s, s); sprite(c, 'trophy', 0, 0, 230, { shadow: false }); c.restore(); tag(c, 'TON POINT ?', W / 2, 880, { size: 70, bg: '#C00E1F', border: '#fff', sc: popIn(t, a.toi, 0.3), rot: -0.03 }); }
    if (t > a.abo - 0.15) tag(c, 'ABONNE-TOI', W / 2, 1280, { size: 66, bg: '#C00E1F', border: '#fff', sc: stampScale(t, a.abo) });
  }
}
