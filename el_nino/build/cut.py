import numpy as np, os
from PIL import Image, ImageFilter
from scipy import ndimage
names=['fan_a','fan_b','fisher_a','fisher_b','boat_top','fish','star','wave','bath','storm','flood','sun','drought','fire','kangaroo','thermo','bowl','tree','earth_scared','earth_hot','sci_a','sci_b','explorer','fan_ice']
im=Image.open('assets/planche.webp').convert('RGBA');a=np.array(im);H,W=a.shape[:2];R,C=4,6
mask=a[...,3]>60
lab,n=ndimage.label(mask);sizes=ndimage.sum(mask,lab,range(1,n+1))
cells={}
for i in range(n):
    if sizes[i]<20: continue
    cy,cx=ndimage.center_of_mass(mask,lab,i+1);r=min(R-1,int(cy/(H/R)));c=min(C-1,int(cx/(W/C)))
    cells.setdefault(r*C+c,[]).append(i+1)
os.makedirs('build/spr',exist_ok=True)
sheet=Image.new('RGBA',(6*260,4*260),(40,120,150,255))
for k,nm in enumerate(names):
    ids=cells.get(k,[]);big=max(sizes[j-1] for j in ids)
    keep=[j for j in ids if sizes[j-1]>0.004*big]
    m=np.isin(lab,keep);ys,xs=np.where(m);y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
    out=a[y0:y1,x0:x1].copy();mm=m[y0:y1,x0:x1]
    out[...,3]=np.where(mm,out[...,3],0)
    img=Image.fromarray(out);img=img.resize((img.width*2,img.height*2),Image.LANCZOS).filter(ImageFilter.UnsharpMask(2,60,2))
    img.save(f'build/spr/{nm}.png');print(nm,len(ids),'->',len(keep),img.size)
    t=img.copy();t.thumbnail((240,240));sheet.alpha_composite(t,((k%6)*260+10,(k//6)*260+10))
sheet.convert('RGB').save('build/check_cut.jpg',quality=85)
