import numpy as np, os
from PIL import Image, ImageFilter
from scipy import ndimage
names=['napo_point','napo_scroll','napo_shock','diplo_bag','diplo_jump','canoe','ship_fr','ship_uk','grenadier','grenadier_sick','treaty','moneybag','coins','bank','crown','parchment']
im=Image.open('assets/planche.webp').convert('RGBA');a=np.array(im);H,W=a.shape[:2];R,C=4,4
mask=a[...,3]>150
lab,n=ndimage.label(mask);sizes=ndimage.sum(mask,lab,range(1,n+1))
cells={}
for i in range(n):
    if sizes[i]<30: continue
    cy,cx=ndimage.center_of_mass(mask,lab,i+1);r=min(R-1,int(cy/(H/R)));c=min(C-1,int(cx/(W/C)))
    cells.setdefault(r*C+c,[]).append(i+1)
sheet=Image.new('RGBA',(4*300,4*300),(40,120,90,255))
for k,nm in enumerate(names):
    ids=cells.get(k,[]);big=max(sizes[j-1] for j in ids)
    keep=[j for j in ids if sizes[j-1]>0.01*big]
    m=np.isin(lab,keep);m=ndimage.binary_fill_holes(m);m=ndimage.binary_dilation(m,iterations=1)
    ys,xs=np.where(m);y0,y1,x0,x1=ys.min(),ys.max()+1,xs.min(),xs.max()+1
    out=a[y0:y1,x0:x1].copy()
    out[...,3]=np.where(m[y0:y1,x0:x1],np.where(a[y0:y1,x0:x1,3]>150,255,a[y0:y1,x0:x1,3]),0)
    img=Image.fromarray(out);img=img.resize((img.width*2,img.height*2),Image.LANCZOS).filter(ImageFilter.UnsharpMask(2,60,2))
    img.save(f'build/spr/{nm}.png');print(nm,len(ids),'->',len(keep),img.size)
    t=img.copy();t.thumbnail((280,280));sheet.alpha_composite(t,((k%4)*300+10,(k//4)*300+10))
sheet.convert('RGB').save('build/check_cut.jpg',quality=85)
# tableaux : bandes blanches
b=np.array(Image.open('assets/tableaux.webp').convert('RGB')).astype(int);wh=(b.min(-1)>235)
rows=wh.mean(1)>0.97;cols=wh.mean(0)>0.97
def runs(v):
    out=[];s=None
    for i,x in enumerate(list(v)+[True]):
        if not x and s is None: s=i
        if x and s is not None:
            if i-s>100: out.append((s,i))
            s=None
    return out
R_=runs(rows);C_=runs(cols);print('rows',R_,'cols',C_)
an=['napo_portrait','napo_desk','lasalle','stdomingue','signature','drapeaux']
k=0
for (y0,y1) in R_:
    for (x0,x1) in C_:
        crop=Image.fromarray(b[y0+3:y1-3,x0+3:x1-3].astype(np.uint8));crop=crop.resize((crop.width*2,crop.height*2),Image.LANCZOS).filter(ImageFilter.UnsharpMask(2,50,2))
        crop.save(f'build/arch/{an[k]}.jpg',quality=92);print(an[k],crop.size);k+=1
