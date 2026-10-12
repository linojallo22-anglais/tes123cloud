// node render.mjs f0 f1 out.mp4  -> images [f0,f1) à 30 i/s, sans son
import { chromium } from 'playwright'; import { spawn } from 'child_process';
const [f0, f1, out] = [+process.argv[2], +process.argv[3], process.argv[4]]; const FPS = 30;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', e => console.log('pageerror', e.message));
await p.goto('http://localhost:8766/build/index.html'); await p.waitForFunction(() => window.READY || window.ERR, null, { timeout: 90000 });
const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-vcodec', 'mjpeg', '-framerate', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), out], { stdio: ['pipe', 'inherit', 'inherit'] });
const t0 = Date.now();
for (let f = f0; f < f1; f++) {
  const d = await p.evaluate(t => { render(t); return document.getElementById('c').toDataURL('image/jpeg', 0.92); }, f / FPS);
  if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
  if ((f - f0) % 150 === 0) console.log(out, f, '/', f1, ((Date.now() - t0) / 1000).toFixed(0) + 's');
}
ff.stdin.end(); await new Promise(r => ff.on('close', r)); await b.close(); console.log('DONE', out);
