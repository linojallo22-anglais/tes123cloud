# Synthèse des bruitages à partir de events.json + mixage avec la voix.
import json, numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt

SR = 44100
rng = np.random.default_rng(7)
def t_(d): return np.arange(int(SR * d)) / SR
def env(n, a=0.005, r=None, curve=4):
    e = np.ones(n); na = max(1, int(a * SR)); e[:na] = np.linspace(0, 1, na)
    if r is None: e *= np.exp(-curve * np.linspace(0, 1, n))
    return e
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def noise(d): return rng.standard_normal(int(SR * d))
def sine(f, d, ph=0): return np.sin(2 * np.pi * np.cumsum(np.broadcast_to(f, (int(SR * d),))) / SR + ph)
def norm(x, g=1.0): return g * x / (np.max(np.abs(x)) + 1e-9)

def whoosh():
    d = 0.7; n = noise(d); tt = t_(d); f = 300 + 2200 * np.sin(np.pi * tt / d) ** 2
    out = np.zeros_like(n)
    for i in range(0, len(n), 512):
        seg = slice(i, i + 1024); fc = f[min(i, len(f) - 1)]; out[seg] += bp(n[seg], max(80, fc * 0.5), min(8000, fc * 1.6), 1)[:len(out[seg])] * 0.5
    return norm(lp(out, 3000) * np.sin(np.pi * tt / d) ** 1.5, 0.55)
def pop(): tt = t_(0.12); return norm(sine(900 * np.exp(-tt * 25) + 300, 0.12) * env(len(tt), 0.002, curve=10), 0.6)
def ping(): tt = t_(0.9); return norm((sine(1760, 0.9) + 0.4 * sine(2640, 0.9)) * env(len(tt), 0.002, curve=5), 0.45)
def ding(): tt = t_(1.1); return norm((sine(1318, 1.1) + 0.5 * sine(1975, 1.1) + 0.2 * sine(2637, 1.1)) * env(len(tt), 0.002, curve=4), 0.45)
def tic(): tt = t_(0.04); return norm(hp(noise(0.04), 2500) * env(len(tt), 0.001, curve=20), 0.35)
def typ():
    out = np.zeros(int(SR * 0.4))
    for k in range(6): s = int(k * 0.06 * SR); c = hp(noise(0.03), 1800) * env(int(0.03 * SR), 0.001, curve=25); out[s:s + len(c)] += c * (0.6 + 0.4 * rng.random())
    return norm(out, 0.3)
def stamp(): tt = t_(0.35); b = lp(noise(0.35), 400) * env(len(tt), 0.001, curve=14) + sine(70, 0.35) * env(len(tt), 0.001, curve=10); return norm(b, 0.8)
def thud(): tt = t_(0.4); return norm(sine(55 + 60 * np.exp(-tt * 20), 0.4) * env(len(tt), 0.002, curve=9) + 0.3 * lp(noise(0.4), 300) * env(len(tt), 0.001, curve=20), 0.75)
def impact():
    tt = t_(2.2); b = sine(40 + 50 * np.exp(-tt * 6), 2.2) * env(len(tt), 0.002, curve=3) + 0.5 * lp(noise(2.2), 200) * env(len(tt), 0.001, curve=4)
    return norm(b, 0.9)
def heartbeat():
    out = np.zeros(int(SR * 0.6))
    for s0, g in [(0, 1), (0.22, 0.7)]: tt = t_(0.18); c = sine(48, 0.18) * env(len(tt), 0.004, curve=12) * g; s = int(s0 * SR); out[s:s + len(c)] += c
    return norm(lp(out, 150), 0.7)
def fall(): tt = t_(0.35); return norm(sine(2200 * np.exp(-tt * 4.5) + 300, 0.35) * np.sin(np.pi * tt / 0.35) * 0.6, 0.3)
def scan(): tt = t_(0.5); return norm(bp(noise(0.5), 1500, 6000) * np.sin(np.pi * tt / 0.5) ** 2 + 0.3 * sine(600 + 1200 * tt, 0.5) * np.sin(np.pi * tt / 0.5), 0.35)
def draw(): tt = t_(0.6); return norm(bp(noise(0.6), 2000, 7000) * (0.6 + 0.4 * np.sin(2 * np.pi * 18 * tt)) * np.sin(np.pi * tt / 0.6), 0.25)
def shine(): tt = t_(1.0); return norm(sum(sine(f, 1.0) * env(len(tt), 0.01 + i * 0.04, curve=3) for i, f in enumerate([1568, 2093, 2637, 3136])), 0.3)
def sparkle():
    out = np.zeros(int(SR * 1.2))
    for k in range(10): s = int(rng.random() * 0.9 * SR); f = 2500 + rng.random() * 3000; tt = t_(0.15); c = sine(f, 0.15) * env(len(tt), 0.001, curve=12); out[s:s + len(c)] += c
    return norm(out, 0.3)
def water(): tt = t_(1.2); return norm(lp(noise(1.2), 900) * (0.7 + 0.3 * np.sin(2 * np.pi * 3 * tt)) * np.sin(np.pi * tt / 1.2), 0.35)
def wave(): tt = t_(1.4); return norm(lp(noise(1.4), 1500) * np.sin(np.pi * tt / 1.4) ** 3, 0.45)
def squeeze(): tt = t_(0.5); return norm(sine(300 - 150 * tt, 0.5) * (1 + 0.5 * np.sin(2 * np.pi * 30 * tt)) * np.sin(np.pi * tt / 0.5), 0.3)
def film():
    tt = t_(1.3); clicks = (np.sin(2 * np.pi * 24 * tt) > 0.95).astype(float); c = hp(noise(1.3), 1500) * clicks
    return norm(c + 0.2 * lp(noise(1.3), 800) * np.sin(np.pi * tt / 1.3), 0.4)
def scissors():
    out = np.zeros(int(SR * 0.5))
    for s0 in (0, 0.22): c = bp(noise(0.12), 3000, 9000) * env(int(0.12 * SR), 0.001, curve=8); s = int(s0 * SR); out[s:s + len(c)] += c
    return norm(out, 0.4)
def barrier(): tt = t_(0.45); return norm(bp(noise(0.45), 400, 2000) * env(len(tt), 0.02, curve=5) + 0.6 * sine(120, 0.45) * env(len(tt), 0.001, curve=15), 0.5)
def train():
    tt = t_(1.4); chug = (np.sin(2 * np.pi * 5 * tt) > 0.6).astype(float)
    return norm(lp(noise(1.4), 1200) * chug * np.sin(np.pi * tt / 1.4) + 0.3 * sine(440, 1.4) * (tt < 0.35), 0.4)
def engine():
    tt = t_(1.5); f = 90 + 20 * np.sin(2 * np.pi * 0.7 * tt)
    return norm((sine(f, 1.5) + 0.5 * sine(2 * f, 1.5) + 0.3 * lp(noise(1.5), 600)) * np.sin(np.pi * tt / 1.5), 0.35)
def alarm(): tt = t_(0.9); f = np.where((tt * 4) % 1 < 0.5, 880, 660); return norm(sine(f, 0.9) * np.sin(np.pi * tt / 0.9) * 0.7, 0.3)
def photo():
    out = np.zeros(int(SR * 0.4)); c = hp(noise(0.03), 2000) * env(int(0.03 * SR), 0.001, curve=20); out[:len(c)] += c; s = int(0.09 * SR); out[s:s + len(c)] += c * 0.8
    tt = t_(0.4); out += 0.3 * bp(noise(0.4), 500, 3000) * np.exp(-tt * 8)
    return norm(out, 0.45)
def count(): return tic()
def applause():
    tt = t_(2.2); out = np.zeros(len(tt))
    for k in range(260): s = int(rng.random() * 1.9 * SR); c = bp(noise(0.02), 800, 5000) * env(int(0.02 * SR), 0.001, curve=15); out[s:s + len(c)] += c * rng.random()
    return norm(out * np.sin(np.pi * tt / 2.2), 0.4)
def cheer(): tt = t_(1.8); return norm(bp(noise(1.8), 300, 2500) * (0.7 + 0.3 * np.sin(2 * np.pi * 4 * tt)) * np.sin(np.pi * tt / 1.8), 0.35) + 0.6 * applause()[:int(1.8 * SR)]
def sweep(): tt = t_(0.35); return norm(bp(noise(0.35), 1000, 8000) * np.sin(np.pi * tt / 0.35), 0.35)
def steps():
    out = np.zeros(int(SR * 1.0))
    for k in range(4): s = int(k * 0.26 * SR); c = lp(noise(0.06), 700) * env(int(0.06 * SR), 0.001, curve=14); out[s:s + len(c)] += c
    return norm(out, 0.35)
def swell(): tt = t_(1.6); return norm((sine(110, 1.6) + sine(165, 1.6)) * np.sin(np.pi * tt / 1.6) ** 2, 0.3)
def wire():
    tt = t_(1.2); return norm(bp(noise(1.2), 2500, 8000) * (np.sin(2 * np.pi * 9 * tt) > 0.3) * np.sin(np.pi * tt / 1.2) + 0.3 * sine(2200, 1.2) * np.exp(-tt * 3) * 0.2, 0.35)
def concrete():
    out = np.zeros(int(SR * 0.9))
    for s0 in (0, 0.3, 0.55): c = thud()[:int(0.3 * SR)] + 0.4 * lp(noise(0.3), 1500) * env(int(0.3 * SR), 0.001, curve=10); s = int(s0 * SR); out[s:s + len(c)] += c[:len(out) - s]
    return norm(out, 0.7)
def crumble():
    tt = t_(1.6); out = 0.5 * lp(noise(1.6), 900) * np.exp(-tt * 2)
    for k in range(40): s = int(rng.random() * 1.3 * SR); c = bp(noise(0.03), 600, 4000) * env(int(0.03 * SR), 0.001, curve=12); out[s:s + len(c)] += c * rng.random()
    return norm(out + 0.5 * thud()[:len(out)] if len(thud()) >= len(out) else out, 0.7)

SFX = dict(whoosh=whoosh, pop=pop, ping=ping, ding=ding, tic=tic, type=typ, stamp=stamp, thud=thud, impact=impact, heartbeat=heartbeat, fall=fall, scan=scan, draw=draw, shine=shine, sparkle=sparkle,
           water=water, wave=wave, squeeze=squeeze, film=film, scissors=scissors, barrier=barrier, train=train, engine=engine, alarm=alarm, photo=photo, count=count, applause=applause, cheer=cheer,
           sweep=sweep, steps=steps, swell=swell, wire=wire, concrete=concrete, crumble=crumble)
E = json.load(open('events.json')); dur = E['dur']
missing = {e[1] for e in E['events']} - set(SFX); assert not missing, missing
N = int((dur + 1) * SR); fx = np.zeros(N); cache = {}
for t, typ_ in E['events']:
    if typ_ not in cache or typ_ in ('applause', 'sparkle', 'crumble', 'cheer'): cache[typ_] = SFX[typ_]()
    s = cache[typ_]; i = int(t * SR); j = min(N, i + len(s)); fx[i:j] += s[:j - i] * (0.9 + 0.2 * rng.random())
# nappe grave discrète
tt = np.arange(N) / SR; pad = lp(np.sin(2 * np.pi * 55 * tt) + 0.6 * np.sin(2 * np.pi * 82.4 * tt + 1) + 0.4 * np.sin(2 * np.pi * 110 * tt) * (0.5 + 0.5 * np.sin(2 * np.pi * tt / 9)), 300)
pad *= np.minimum(1, tt / 1.5) * np.minimum(1, (dur - tt).clip(0) / 1.0)
sr, v = wavfile.read('../assets/voice.wav'); v = v.astype(np.float64) / 32768.0
voice = np.zeros(N); voice[:min(N, len(v))] = v[:N]
mix = voice * 1.0 + norm(fx, 1.0) * 0.42 * np.max(np.abs(voice)) + norm(pad, 1.0) * 0.07 * np.max(np.abs(voice))
mix = mix[:int(dur * SR)]
wavfile.write('mix_raw.wav', SR, (np.clip(mix / max(1, np.max(np.abs(mix))), -1, 1) * 32767).astype(np.int16))
print('ok', len(E['events']), 'événements,', len(set(e[1] for e in E['events'])), 'types')
