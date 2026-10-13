import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage(); p.on('response', r => { if (r.status() >= 400) console.log(r.status(), r.url()); });
await p.goto('http://localhost:8771/build/index.html'); await p.waitForFunction(() => window.READY || window.ERR, null, { timeout: 60000 }); console.log(await p.evaluate(() => window.ERR || 'ok ' + window.NTILES)); await b.close();
