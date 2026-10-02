// Rend des images fixes aux instants donnés (ou PREVIEW) puis planche contact.
import { chromium } from 'playwright'; import fs from 'fs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--disable-web-security'] });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
p.on('console', m => { if (m.type() === 'error') console.log('console:', m.text()); }); p.on('pageerror', e => console.log('pageerror', e.message));
await p.goto('http://localhost:8765/build/index.html');
await p.waitForFunction(() => window.READY || window.ERR, null, { timeout: 60000 });
const err = await p.evaluate(() => window.ERR); if (err) { console.log(err); process.exit(1); }
let times = process.argv.slice(2).map(Number); if (!times.length) times = await p.evaluate(() => window.PREVIEW);
fs.mkdirSync('prev', { recursive: true }); for (const f of fs.readdirSync('prev')) fs.unlinkSync('prev/' + f);
let i = 0;
for (const t of times) { const t0 = Date.now(); const d = await p.evaluate(t => { render(t); return document.getElementById('c').toDataURL('image/jpeg', 0.85); }, t); fs.writeFileSync(`prev/f${String(i++).padStart(2, '0')}.jpg`, Buffer.from(d.split(',')[1], 'base64')); console.log('t=' + t.toFixed(2), (Date.now() - t0) + 'ms'); }
await b.close();
