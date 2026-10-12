// Short 9:16 : remappage du temps de la vidéo longue (mêmes images, phrases choisies dans la même voix).
(function () {
  const R = window.render; let SEG = [], SDUR = 0;
  const oldInit = window.init;
  window.init = async function () {
    await oldInit();
    const sj = await fetch('seg.json').then(r => r.json()); SEG = sj.SEG; SDUR = sj.dur;
    const ev2 = [], ac2 = [];
    SEG.forEach((g, k) => {
      for (const [t, ty] of EVENTS) if (t >= g.src[0] && t < g.src[1] - 0.05) ev2.push([+(g.dst + t - g.src[0]).toFixed(3), ty]);
      for (const x of ACTIONS) if (x[0] >= g.src[0] && x[0] < g.src[1]) ac2.push([+(g.dst + x[0] - g.src[0]).toFixed(3), x[1], x[2]]);
      if (k > 0) ev2.push([Math.max(0, g.dst - 0.12), 'whoosh']);
    });
    ev2.push([SDUR - 2.6, 'ding']);
    window.EVENTS = ev2.filter(e => e[0] >= 0).sort((a, b) => a[0] - b[0]); window.ACTIONS = ac2;
    DUR = SDUR + 0.5; window.DUR = DUR;
    window.PREVIEW = SEG.flatMap(g => [g.dst + 0.6, g.dst + (g.src[1] - g.src[0]) * 0.6]).concat([SDUR - 1]);
  };
  function srcTime(u) { let k = 0; for (let i = 0; i < SEG.length; i++) if (u >= SEG[i].dst) k = i; const g = SEG[k]; return { t: Math.min(g.src[0] + (u - g.dst), g.src[1] - 0.02), k, du: u - g.dst }; }
  window.render = function (u) {
    const { t, k, du } = srcTime(u); R(t);
    if (k > 0 && du < 0.16) { ctx.save(); ctx.globalAlpha = 0.55 * (1 - du / 0.16); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    if (u > SDUR - 2.6) tag(ctx, 'VIDÉO COMPLÈTE SUR LA CHAÎNE', W / 2, 1600, { size: 46, bg: '#C00E1F', border: '#fff', sc: popIn(u, SDUR - 2.6, 0.3) });
  };
})();
