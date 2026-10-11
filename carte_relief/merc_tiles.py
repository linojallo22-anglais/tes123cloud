# Natural Earth HYP_HR_SR_OB_DR (équirectangulaire 21600x10800) -> Mercator 16384x16384 en tuiles 1024 + version basse déf 4096.
import numpy as np, os, sys
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
src = np.asarray(Image.open('HYP_HR_SR_OB_DR.tif').convert('RGB')); H, W, _ = src.shape
N, T = 16384, 1024; LAT = 85.0511; ymax = np.log(np.tan(np.pi / 4 + np.radians(LAT) / 2))
os.makedirs('tiles', exist_ok=True)
cols = ((np.arange(N) + 0.5) / N * W).astype(int)
def grade(a):  # mer bleu-vert, terre sauge (style concurrent)
    a = a.astype(np.float32); r, g, b = a[..., 0], a[..., 1], a[..., 2]; sea = (b > r + 18) & (b >= g + 2)
    o = a.copy(); S = a[sea]; ls = S.mean(-1, keepdims=True); S = ls + (S - ls) * 0.75; o[sea] = S * np.array([0.36, 0.62, 0.62]) + np.array([12, 44, 50])
    L = a[~sea]; lum = L.mean(-1, keepdims=True); o[~sea] = lum + (L - lum) * 1.05
    return np.clip((o - 128) * 1.05 + 126, 0, 255).astype(np.uint8)
low = np.zeros((4096, 4096, 3), np.uint8)
for ty in range(N // T):
    y = np.arange(ty * T, (ty + 1) * T) + 0.5
    lat = np.degrees(2 * np.arctan(np.exp(ymax - 2 * ymax * y / N)) - np.pi / 2)
    rows = np.clip(((90 - lat) / 180 * H).astype(int), 0, H - 1)
    strip = grade(src[rows][:, cols])
    for tx in range(N // T):
        Image.fromarray(strip[:, tx * T:(tx + 1) * T]).save(f'tiles/{ty}_{tx}.jpg', quality=86)
    low[ty * 256:(ty + 1) * 256] = np.asarray(Image.fromarray(strip).resize((4096, 256), Image.LANCZOS))
    print(ty, end=' ', flush=True)
Image.fromarray(low).save('relief_4096.jpg', quality=90); print('ok')
