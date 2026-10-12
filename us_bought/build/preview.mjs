// node preview.mjs t1 t2 ... -> shots/s_<t>.jpg + infos
import { chromium } from 'playwright'; import fs from 'fs';
const ts = process.argv.slice(2).map(Number); fs.mkdirSync('shots', { recursive: true });
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } }); const errs = [];
p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await p.goto('http://localhost:8766/build/index.html'); await p.waitForFunction(() => window.READY || window.ERR, null, { timeout: 90000 });
const info = await p.evaluate(() => ({ ERR: window.ERR, MISS: window.MISS, DUR: window.DUR, ev: EVENTS.length }));
console.log(JSON.stringify(info));
for (const t of ts) { const d = await p.evaluate(t => { render(t); return document.getElementById('c').toDataURL('image/jpeg', 0.85); }, t); fs.writeFileSync(`shots/s_${t.toFixed(2)}.jpg`, Buffer.from(d.split(',')[1], 'base64')); }
console.log('errs', errs.slice(0, 5)); await b.close();
