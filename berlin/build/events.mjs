import { chromium } from 'playwright'; import fs from 'fs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage(); await p.goto('http://localhost:8765/build/index.html'); await p.waitForFunction(() => window.READY);
fs.writeFileSync('events.json', JSON.stringify(await p.evaluate(() => ({ events: EVENTS, dur: DUR, actions: ACTIONS })))); await b.close();
