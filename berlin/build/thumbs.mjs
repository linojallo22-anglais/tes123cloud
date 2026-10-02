import { chromium } from 'playwright'; import fs from 'fs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } }); p.on('pageerror', e => console.log('pageerror', e.message));
await p.goto('http://localhost:8765/build/index.html'); await p.waitForFunction(() => window.READY);
await p.addScriptTag({ url: 'thumb.js' });
for (const v of ['A', 'B', 'C']) { const d = await p.evaluate(v => { renderThumb(v); return document.getElementById('c').toDataURL('image/png'); }, v); fs.writeFileSync(`../miniature_${v}.png`, Buffer.from(d.split(',')[1], 'base64')); }
await b.close();
