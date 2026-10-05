# détoure des éléments posés sur un fond flou coloré : le fond est lisse, les éléments sont texturés
from PIL import Image; import numpy as np, scipy.ndimage as nd, sys
a=np.array(Image.open(sys.argv[1]).convert('RGB')).astype(np.float32)
g=a.mean(2)
gx=nd.sobel(nd.gaussian_filter(g,0.8),1); gy=nd.sobel(nd.gaussian_filter(g,0.8),0)
mag=np.hypot(gx,gy)
loc=nd.maximum_filter(mag,5)
T=float(sys.argv[3]) if len(sys.argv)>3 else 40
fg=loc>T
fg=nd.binary_closing(fg,structure=np.ones((3,3)),iterations=3)
fg=nd.binary_fill_holes(fg)
fg=nd.binary_opening(fg,structure=nd.generate_binary_structure(2,1),iterations=int(sys.argv[4]) if len(sys.argv)>4 else 4)
lab,n=nd.label(fg); cnt=np.bincount(lab.ravel()); keep=[k for k in range(1,n+1) if cnt[k]>4000]
m=np.isin(lab,keep); m=nd.binary_fill_holes(m)
out=np.zeros(a.shape[:2]+(4,),np.uint8); out[...,:3]=a.astype(np.uint8); out[...,3]=np.where(m,255,0)
Image.fromarray(out).save(sys.argv[2]); print('comps',len(keep))
bg=Image.new('RGBA',(out.shape[1],out.shape[0]),(30,30,30,255)); bg.alpha_composite(Image.fromarray(out)); bg.convert('RGB').resize((out.shape[1]//2,out.shape[0]//2)).save(sys.argv[2].replace('.png','_chk.jpg'))
