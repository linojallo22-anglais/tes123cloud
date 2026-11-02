# Fond blanc semi-transparent -> vrai alpha (remplissage depuis les bords sur le quasi-blanc, fermeture des formes)
import sys, numpy as np
from PIL import Image
from scipy import ndimage
a = np.array(Image.open(sys.argv[1]).convert('RGBA')).astype(float)
rgb = a[..., :3] * (a[..., 3:4] / 255) + 255 * (1 - a[..., 3:4] / 255)  # sur blanc
mx, mn = rgb.max(2), rgb.min(2); bgl = (mn > 222) & (mx - mn < 22)
lab, n = ndimage.label(bgl); edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bg = np.isin(lab, list(edge)); fg = ~bg
fg = ndimage.binary_closing(fg, structure=np.ones((3, 3)), iterations=6); fg = ndimage.binary_fill_holes(fg); fg = ndimage.binary_opening(fg, iterations=2)
out = np.dstack([rgb.astype(np.uint8), (fg * 255).astype(np.uint8)])
Image.fromarray(out).save(sys.argv[2]); print('fond', round(bg.mean(), 3))
