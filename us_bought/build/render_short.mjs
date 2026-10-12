import { chromium } from 'playwright'; import { spawn } from 'child_process'; import fs from 'fs';
const [f0, f1, out] = [+process.argv[2], +process.argv[3], process.argv[4]]; const FPS = 30;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1080, height: 1920 } }); p.on('pageerror', e => console.log('pageerror', e.message));
await p.goto('http://localhost:8766/build/short.html'); await p.waitForFunction(() => window.SDUR || window.ERR, null, { timeout: 90000 });
if (process.argv[5] === 'info') { const r = await p.evaluate(() => ({ SDUR, ev: SEVENTS, MISS })); fs.writeFileSync('short_events.json', JSON.stringify({ events: r.ev, dur: r.SDUR })); console.log(r.SDUR, r.ev.length, r.MISS); await b.close(); process.exit(0); }
if (process.argv[5] === 'shots') { fs.mkdirSync('shots', { recursive: true }); for (const u of process.argv.slice(6).map(Number)) { const d = await p.evaluate(u => { render(u); return document.getElementById('c').toDataURL('image/jpeg', 0.85); }, u); fs.writeFileSync(`shots/v_${u.toFixed(1)}.jpg`, Buffer.from(d.split(',')[1], 'base64')); } await b.close(); process.exit(0); }
const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-vcodec', 'mjpeg', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), out], { stdio: ['pipe', 'inherit', 'inherit'] });
for (let f = f0; f < f1; f++) { const d = await p.evaluate(t => { render(t); return document.getElementById('c').toDataURL('image/jpeg', 0.92); }, f / FPS); if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r)); if ((f - f0) % 150 === 0) console.log(out, f, '/', f1); }
ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); console.log('DONE', out);
