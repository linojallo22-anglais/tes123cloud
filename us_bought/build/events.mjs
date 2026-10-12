import { chromium } from 'playwright'; import fs from 'fs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage(); await p.goto('http://localhost:8766/build/index.html'); await p.waitForFunction(() => window.READY || window.ERR, null, { timeout: 90000 });
const r = await p.evaluate(() => ({ events: EVENTS.filter(e => e[0] >= 0).sort((a, b) => a[0] - b[0]), dur: WORDS.at(-1).t1 + 0.6 }));
fs.writeFileSync('events.json', JSON.stringify(r)); console.log(r.events.length, r.dur, [...new Set(r.events.map(e => e[1]))].join(',')); await b.close();
