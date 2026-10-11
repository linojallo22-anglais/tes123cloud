# Trois bruits de zoom "voum" (whoosh grave avec balayage de hauteur), à comparer.
import numpy as np
from scipy.io import wavfile
from scipy.signal import butter, sosfilt
SR = 44100; rng = np.random.default_rng(3)
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def norm(x, g): return g * x / (np.max(np.abs(x)) + 1e-9)
def sweep_noise(d, f0, f1, q=0.6):
    n = rng.standard_normal(int(SR * d)); out = np.zeros_like(n); tt = np.arange(len(n)) / SR
    for i in range(0, len(n), 256):
        fc = f0 * (f1 / f0) ** (i / len(n)); seg = slice(max(0, i - 256), i + 512)
        out[i:i + 256] = bp(n[seg], max(30, fc * (1 - q)), min(15000, fc * (1 + q)), 1)[min(i, 256):min(i, 256) + 256][:len(out[i:i + 256])]
    return out, tt
def voum_A(d=0.75):  # voum grave classique : souffle qui monte puis s'éloigne + sous-basse
    n, tt = sweep_noise(d, 180, 1400); e = np.sin(np.pi * tt / d) ** 1.6
    sub = np.sin(2 * np.pi * np.cumsum(70 + 40 * tt / d) / SR) * np.exp(-((tt - d * 0.45) / (d * 0.25)) ** 2)
    return norm(lp(n, 3000) * e + 0.5 * sub, 0.9)
def voum_B(d=0.6):   # voum rapide de transition (whoosh ciné, aigu -> grave)
    n, tt = sweep_noise(d, 2200, 250, 0.5); e = np.sin(np.pi * tt / d) ** 2 * (1 + 0.8 * (tt / d))
    return norm(lp(n, 5000) * e, 0.9)
def voum_C(d=0.9):   # voum "avion qui passe" : effet Doppler grave et profond
    n, tt = sweep_noise(d, 500, 150, 0.45); e = np.exp(-((tt - d * 0.5) / (d * 0.22)) ** 2)
    tone = np.sin(2 * np.pi * np.cumsum(110 * (1.25 - 0.5 * tt / d)) / SR) * e
    return norm(lp(n, 1800) * e + 0.35 * tone, 0.9)
gap = np.zeros(int(SR * 0.9)); seq = []
for f in (voum_A, voum_B, voum_C):
    for _ in range(2): seq += [f(), gap]
    seq.append(np.zeros(int(SR * 0.8)))
x = np.concatenate(seq); wavfile.write('voum_essais.wav', SR, (x * 32767 * 0.8).astype(np.int16)); print('ok', len(x) / SR)
