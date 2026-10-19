# Fond « damier » faux-transparent -> vrai alpha (remplissage depuis les bords + poches enfermées texturées).
import sys, numpy as np
from PIL import Image
from scipy import ndimage
a = np.array(Image.open(sys.argv[1]).convert('RGB')).astype(int)
mx, mn = a.max(2), a.min(2); bgl = (mn > 200) & (mx - mn < 20)
lab, n = ndimage.label(bgl); edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
bg = np.isin(lab, list(edge)); lum = a.mean(2)
for i in range(1, n + 1):
    if i in edge: continue
    m = lab == i; sz = m.sum()
    if sz > 300 and lum[m].std() > 2.5: bg |= m
bg = ndimage.binary_opening(bg, iterations=1)
al = np.where(bg, 0, 255).astype(np.uint8); al = ndimage.binary_erosion(al > 0, iterations=1).astype(np.uint8) * 255
Image.fromarray(np.dstack([a.astype(np.uint8), al])).save(sys.argv[2]); print('fond', bg.mean().round(3))
