# Allonge les pauses de la voix (sans toucher aux mots) pour viser une durée cible.
import sys, re, numpy as np
from scipy.io import wavfile
src, silf, out, target = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4])
sr, v = wavfile.read(src); v = v.astype(np.float64)
L = open(silf).read(); st = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', L)]; en = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', L)]
gaps = [(a, b) for a, b in zip(st, en) if b - a >= 0.28 and a > 0.3 and b < len(v) / sr - 0.05]
last = st[-1] if len(st) > len(en) else len(v) / sr
need = target - last; wts = np.array([min(b - a, 0.6) for a, b in gaps]); add = np.minimum(need * wts / wts.sum(), 0.45)
print('pauses', len(gaps), 'ajout total %.2f s' % add.sum(), 'fin voix %.2f -> %.2f' % (last, last + add.sum()))
parts = []; pos = 0; f = int(0.01 * sr)
for (a, b), d in zip(gaps, add):
    m = int((a + b) / 2 * sr); seg = v[pos:m].copy(); seg[-f:] *= np.linspace(1, 0, f); parts.append(seg); parts.append(np.zeros(int(d * sr)))
    nxt = v[m:].copy(); nxt[:f] *= np.linspace(0, 1, f); v = np.concatenate([v[:m], nxt]); pos = m
parts.append(v[pos:]); o = np.concatenate(parts)
wavfile.write(out, sr, np.clip(o, -32768, 32767).astype(np.int16)); print('durée %.2f' % (len(o) / sr))
