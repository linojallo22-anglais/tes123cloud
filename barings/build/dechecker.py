# retire un faux damier "transparent" imprimé dans l'image -> PNG RGBA
from PIL import Image; import numpy as np, scipy.ndimage as nd, sys
a=np.array(Image.open(sys.argv[1]).convert('RGB')).astype(int)
mx=a.max(2); mn=a.min(2); sat=mx-mn
bg=(sat<14)&(((mx>=158)&(mx<=192))|(mx>=243))
fg=~bg
fg=nd.binary_opening(fg,structure=np.ones((5,5)))
fg=nd.binary_closing(fg,structure=np.ones((3,3)),iterations=5)
fg=nd.binary_fill_holes(fg)
lab,n=nd.label(fg); cnt=np.bincount(lab.ravel()); keep=[k for k in range(1,n+1) if cnt[k]>2500]
core=np.isin(lab,keep); core=nd.binary_opening(core,structure=nd.generate_binary_structure(2,1),iterations=int(sys.argv[3]) if len(sys.argv)>3 else 1)
ring=nd.binary_dilation(core,iterations=4)
out=np.zeros(a.shape[:2]+(4,),np.uint8)
out[...,:3]=np.where(core[...,None],a,np.array([246,242,234]))
out[...,3]=np.where(ring,255,0)
Image.fromarray(out).save(sys.argv[2]); print('comps',len(keep))
