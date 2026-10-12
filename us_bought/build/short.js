// short.js — Short 9:16 tiré de la voix longue (remappage du temps)
(function () {
  const baseInit = window.init;
  window.init = async function () {
    await baseInit();
    const SEG = await fetch('short_segs.json').then(r => r.json());
    const last = SEG.at(-1); const SDUR = last.dst + (last.src[1] - last.src[0]) + 0.6;
    window.SDUR = SDUR; window.SEG = SEG;
    // sous-titres : seulement les mots de chaque morceau
    SUBS = [];
    for (const sg of SEG) {
      const ws = WORDS.filter(w => w.t0 >= sg.src[0] - 0.01 && w.t0 < sg.src[1]); let g = [];
      const fl = () => { if (g.length) SUBS.push({ s: g.map(x => x.w).join(' '), t0: g[0].t0, t1: g.at(-1).t1, seg: sg }); g = []; };
      ws.forEach(x => { g.push(x); if ((/[.,!?:;]$/.test(x.w) && g.length >= 2) || g.length >= 4) fl(); }); fl();
    }
    SUBS.forEach((s, i) => { const n = SUBS[i + 1]; s.tEnd = n && n.seg === s.seg ? Math.min(n.t0, s.t1 + 0.6) : Math.min(s.seg.src[1], s.t1 + 0.5); });
    // événements sonores remappés
    const ev = [];
    for (const sg of SEG) for (const [t, k] of EVENTS) if (t >= sg.src[0] && t < sg.src[1]) ev.push([+(sg.dst + t - sg.src[0]).toFixed(3), k]);
    SEG.slice(1).forEach(sg => ev.push([Math.max(0, sg.dst - 0.12), 'whoosh']));
    ev.push([+(SDUR - 3.2).toFixed(3), 'ding']);
    window.SEVENTS = ev.filter(e => e[0] >= 0).sort((a, b) => a[0] - b[0]);
    const baseRender = window.render;
    window.render = function (u) {
      let sg = SEG[0]; for (const s of SEG) if (u >= s.dst) sg = s;
      const t = Math.min(sg.src[0] + (u - sg.dst), sg.src[1] - 0.02);
      baseRender(t);
      const c = ctx; c.setTransform(1, 0, 0, 1, 0, 0);
      const since = u - sg.dst; if (sg !== SEG[0] && since < 0.16) { c.save(); c.globalAlpha = 0.7 * (1 - since / 0.16); c.fillStyle = '#fff'; c.fillRect(0, 0, W, H); c.restore(); }
      if (u > SDUR - 3.2) tag(c, 'FULL VIDEO ON MY CHANNEL', CX, 1560, { size: 50, bg: '#E0201B', border: '#fff', sc: popIn(u, SDUR - 3.2, 0.35) });
    };
  };
})();
