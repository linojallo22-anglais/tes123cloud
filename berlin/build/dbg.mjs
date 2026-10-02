import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage(); await p.goto('http://localhost:8765/build/index.html'); await p.waitForFunction(() => window.READY);
const [a0, a1] = process.argv.slice(2).map(Number);
console.log(await p.evaluate(([a0, a1]) => JSON.stringify({ A: Object.fromEntries(Object.entries(A).filter(([k, v]) => typeof v === 'number' && v >= a0 && v <= a1).map(([k, v]) => [k, +v.toFixed(2)])), EV: EVENTS.filter(e => e[0] >= a0 && e[0] <= a1).sort((x, y) => x[0] - y[0]) }), [a0, a1]));
await b.close();
