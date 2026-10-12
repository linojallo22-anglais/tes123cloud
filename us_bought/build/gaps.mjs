import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage(); await p.goto('http://localhost:8766/build/index.html'); await p.waitForFunction(() => window.READY || window.ERR, null, { timeout: 90000 });
const r = await p.evaluate(() => { const ts = []; let prev = null; const N = Math.ceil(WORDS.at(-1).t1 * 10); const mv = [];
  for (let i = 1; i < N; i++) { const a = CAM.camAt((i - 1) / 10), c = CAM.camAt(i / 10); const v = Math.abs(Math.log(c.s / a.s)) * 10 + Math.hypot(c.lon - a.lon, c.lat - a.lat) * 10 / (1 + 0); if (v > 0.25) mv.push(i / 10); }
  const starts = mv.filter((t, i) => i === 0 || t - mv[i - 1] > 0.3); const gaps = []; for (let i = 1; i < starts.length; i++) if (starts[i] - starts[i - 1] > 8) gaps.push([starts[i - 1], +(starts[i] - starts[i - 1]).toFixed(1)]);
  const ev = EVENTS.map(e => e[0]).sort((a, b) => a - b); const eg = []; for (let i = 1; i < ev.length; i++) if (ev[i] - ev[i - 1] > 3.5) eg.push([ev[i - 1], +(ev[i] - ev[i - 1]).toFixed(1)]);
  return { moves: starts.length, gaps, eventGaps: eg }; });
console.log(JSON.stringify(r)); await b.close();
