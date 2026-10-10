// Contrôle automatique du plan (règles pro) avant rendu.
import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage(); await p.goto('http://localhost:8766/build/index.html');
await p.waitForFunction(() => window.READY || window.ERR, null, { timeout: 60000 });
const r = await p.evaluate(() => {
  const fps = 30, N = Math.ceil(DUR * fps), out = { fails: [] };
  const st = []; for (let i = 0; i <= N; i++) { const t = i / fps; const c = CAM.camAt(t); st.push({ t, ls: Math.log(c.s), lon: c.lon, lat: c.lat, ang: CAM.angAt(t), tilt: CAM.tiltAt(t) }); }
  // mouvements de zoom (vitesse log-échelle > 0.35/s)
  const mv = []; let inMv = false;
  for (let i = 1; i < st.length; i++) { const v = Math.abs(st[i].ls - st[i - 1].ls) * fps; if (v > 0.35 && !inMv) { mv.push(st[i].t); inMv = true; } if (v < 0.2) inMv = false; }
  let maxGap = 0, gapAt = 0; for (let i = 1; i < mv.length; i++) if (mv[i] - mv[i - 1] > maxGap) { maxGap = mv[i] - mv[i - 1]; gapAt = mv[i - 1]; }
  out.zoomMoves = mv.length; out.maxZoomGap = +maxGap.toFixed(2) + ' s après ' + gapAt.toFixed(1);
  let idle = 0, idleMax = 0, idleAt = 0; for (let i = 1; i < st.length; i++) { const v = Math.abs(st[i].ls - st[i - 1].ls) * fps; idle = v < 0.2 ? idle + 1 / fps : 0; if (idle > idleMax) { idleMax = idle; idleAt = st[i].t - idle; } } out.maxZoomIdle = idleMax.toFixed(2) + ' s après ' + idleAt.toFixed(1); if (idleMax > 3.0) out.fails.push('zoom à l\'arrêt ' + out.maxZoomIdle);
  // images figées
  let frozen = 0, run = 0; for (let i = 1; i < st.length; i++) { const d = Math.abs(st[i].ls - st[i - 1].ls) + Math.abs(st[i].ang - st[i - 1].ang) * 3 + Math.abs(st[i].lon - st[i - 1].lon) * 50; run = d < 0.0004 ? run + 1 : 0; frozen = Math.max(frozen, run); }
  out.maxFrozen = (frozen / fps).toFixed(2) + ' s'; if (frozen / fps > 0.8) out.fails.push('image figée ' + out.maxFrozen);
  // grandes plongées (x20 en < 2.6 s)
  const dives = []; for (let i = 0; i < st.length; i++) { for (let j = i + 1; j < Math.min(st.length, i + 78); j++) if (Math.abs(st[j].ls - st[i].ls) > Math.log(20)) { if (!dives.length || st[i].t - dives.at(-1) > 3) dives.push(+st[i].t.toFixed(1)); break; } }
  out.dives = dives; let dg = dives[0]; for (let i = 1; i < dives.length; i++) dg = Math.max(dg, dives[i] - dives[i - 1]); dg = Math.max(dg, DUR - dives.at(-1)); out.maxDiveGap = dg.toFixed(1); if (dg > 45) out.fails.push('plongée x20 manquante (écart ' + dg.toFixed(1) + ' s)');
  // rotation, bascule
  out.rotPct = Math.round(st.filter(s => Math.abs(s.ang) > 0.5 * Math.PI / 180).length / st.length * 100); if (out.rotPct < 75) out.fails.push('rotation ' + out.rotPct + '%');
  out.tiltPct = Math.round(st.filter(s => s.tilt > 0.05).length / st.length * 100); if (out.tiltPct < 20 || out.tiltPct > 30) out.fails.push('bascule ' + out.tiltPct + '%');
  // événements
  const ev = EVENTS.map(e => e[0]).concat(VISUALS).sort((a, b) => a - b); let eg = ev[0], egAt = 0; out.eventGaps = []; for (let i = 1; i < ev.length; i++) if (ev[i] - ev[i - 1] > 1.5) out.eventGaps.push(ev[i - 1].toFixed(1) + '+' + (ev[i] - ev[i - 1]).toFixed(1)); for (let i = 1; i < ev.length; i++) if (ev[i] - ev[i - 1] > eg) { eg = ev[i] - ev[i - 1]; egAt = ev[i - 1]; } eg = Math.max(eg, DUR - ev.at(-1));
  out.events = ev.length; out.maxEventGap = eg.toFixed(2) + ' s après ' + egAt.toFixed(1); if (eg > 1.5) out.fails.push('trou d\'événements ' + out.maxEventGap);
  const ac = ACTIONS.map(a => a[0]).sort((a, b) => a - b); let ag = ac[0]; for (let i = 1; i < ac.length; i++) ag = Math.max(ag, ac[i] - ac[i - 1]); ag = Math.max(ag, DUR - ac.at(-1)); out.actions = ac.length; out.maxActionGap = ag.toFixed(1); if (ag > 10) out.fails.push('trou d\'actions ' + ag.toFixed(1));
  out.firstWord = WORDS[0].t0; if (WORDS[0].t0 > 0.1) out.fails.push('premier mot ' + WORDS[0].t0);
  out.tail = (DUR - WORDS.at(-1).t1).toFixed(2); if (+out.tail < 0.3 || +out.tail > 0.8) out.fails.push('fin ' + out.tail);
  const types = [...new Set(EVENTS.map(e => e[1]))]; out.types = types.join(',');
  return out;
});
console.log(JSON.stringify(r, null, 1)); await b.close();
