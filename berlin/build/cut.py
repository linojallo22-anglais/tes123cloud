import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
names=['soldier_us','soldier_uk','soldier_fr','soldier_su','barrier_up','barrier_down','train','truck','barge','plane','plane_land','candy_chute','crate','coal','walker_a','walker_b','metro','tower','worker_a','worker_b','wire','wall','fan_a','fan_b']
im=Image.open('assets/planche.webp').convert('RGBA');a=np.array(im);H,W=a.shape[:2];R,C=4,6
mask=a[...,3]>150
lab,n=ndimage.label(mask);objs=ndimage.find_objects(lab);sizes=ndimage.sum(mask,lab,range(1,n+1))
cells={}
for i in range(n):
    if sizes[i]<30: continue
    cy,cx=ndimage.center_of_mass(mask,lab,i+1);r=min(R-1,int(cy/(H/R)));c=min(C-1,int(cx/(W/C)))
    cells.setdefault(r*C+c,[]).append(i+1)
import os;os.makedirs('build/spr',exist_ok=True)
sheet=Image.new('RGBA',(6*300,4*300),(40,120,90,255))
for k,nm in enumerate(names):
    ids=cells.get(k,[]);big=max(sizes[j-1] for j in ids)
    keep=[j for j in ids if sizes[j-1]>0.03*big]
    m=np.isin(lab,keep);m=ndimage.binary_fill_holes(m);m=ndimage.binary_dilation(m,iterations=1)
    ys,xs=np.where(m);y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
    out=a[y0:y1,x0:x1].copy();out[...,3]=np.where(m[y0:y1,x0:x1],np.maximum(out[...,3],0),0)
    # alpha propre : opaque dans le masque (supprime les halos semi-transparents)
    out[...,3]=np.where(m[y0:y1,x0:x1],np.where(a[y0:y1,x0:x1,3]>150,255,a[y0:y1,x0:x1,3]),0)
    img=Image.fromarray(out);img=img.resize((img.width*2,img.height*2),Image.LANCZOS).filter(ImageFilter.UnsharpMask(2,60,2))
    img.save(f'build/spr/{nm}.png');print(nm,len(ids),'->',len(keep),img.size)
    t=img.copy();t.thumbnail((280,280));sheet.alpha_composite(t,((k%6)*300+10,(k//6)*300+10))
sheet.convert('RGB').save('build/check_cut.jpg',quality=85)
