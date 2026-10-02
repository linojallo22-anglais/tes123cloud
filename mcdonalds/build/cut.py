from PIL import Image, ImageFilter; import numpy as np, scipy.ndimage as nd, sys
SRC=sys.argv[1]; names=open('names.txt').read().split(); ROWS=[4,4,5,6,6]
a=np.array(Image.open(SRC).convert('RGBA'))
# fond semi-transparent (alpha 80-170) : on remappe l'alpha 205->0, 245->255
al=np.clip((a[...,3].astype(np.float32)-205)/40*255,0,255).astype(np.uint8); a[...,3]=al; a[al==0,:3]=0
m=al>128; m=nd.binary_opening(m,iterations=1); lab,n=nd.label(m); cnt=np.bincount(lab.ravel())
big=[k for k in range(1,n+1) if cnt[k]>800]; print('composantes',len(big)); assert len(big)==sum(ROWS), len(big)
cs=dict(zip(big,nd.center_of_mass(m,lab,big)))
rows=sorted(big,key=lambda k:cs[k][0]); order=[]; i=0
for c in ROWS: order+=sorted(rows[i:i+c],key=lambda k:cs[k][1]); i+=c
dist,(iy,ix)=nd.distance_transform_edt(~np.isin(lab,big),return_indices=True)
owner=lab[iy,ix]; owner[dist>6]=0; owner[al==0]=0
for idx,k in enumerate(order):
  mk=owner==k; ys,xs=np.where(mk); b=a.copy(); b[~mk,3]=0
  c=Image.fromarray(b[ys.min():ys.max()+1,xs.min():xs.max()+1])
  big3=c.resize((c.width*3,c.height*3),Image.LANCZOS)
  rgb=big3.convert('RGB').filter(ImageFilter.UnsharpMask(2,70,2)); big3=Image.merge('RGBA',(*rgb.split(),big3.split()[3]))
  big3.save(f'img/{names[idx]}.png'); print(names[idx],big3.size)
