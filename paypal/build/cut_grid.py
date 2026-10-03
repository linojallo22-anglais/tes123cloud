# découpe en regroupant les morceaux par case (lignes x colonnes), pour les éléments en plusieurs morceaux
from PIL import Image, ImageFilter; import numpy as np, scipy.ndimage as nd, sys
SRC,NAMES,R,C,OUT=sys.argv[1],sys.argv[2],int(sys.argv[3]),int(sys.argv[4]),sys.argv[5]
names=open(NAMES).read().split()
a=np.array(Image.open(SRC).convert('RGBA'))
al=np.clip((a[...,3].astype(np.float32)-205)/40*255,0,255).astype(np.uint8); a[...,3]=al; a[al==0,:3]=0
m=al>128; lab,n=nd.label(m); cnt=np.bincount(lab.ravel())
comps=[k for k in range(1,n+1) if cnt[k]>150]
cs=dict(zip(comps,nd.center_of_mass(m,lab,comps)))
def km(vals,k):
    c=np.quantile(vals,np.linspace(.08,.92,k))
    for _ in range(50):
        g=np.argmin(np.abs(np.array(vals)[:,None]-c[None,:]),axis=1)
        c=np.array([np.mean([v for v,gg in zip(vals,g) if gg==j]) if any(g==j) else c[j] for j in range(k)])
    return g,c
# pondère par taille : centres des gros éléments
big=[k for k in comps if cnt[k]>3000]
_,rc=km([cs[k][0] for k in big],R); rc=np.sort(rc)
_,cc=km([cs[k][1] for k in big],C); cc=np.sort(cc)
cell={}
for k in comps:
    r=int(np.argmin(np.abs(rc-cs[k][0]))); c=int(np.argmin(np.abs(cc-cs[k][1]))); cell.setdefault((r,c),[]).append(k)
assert len(cell)==R*C,len(cell)
for (r,c),ks in sorted(cell.items()):
    mk=np.isin(lab,ks); mk=nd.binary_dilation(mk,iterations=2)&(al>0)
    ys,xs=np.where(mk); b=a.copy(); b[~mk,3]=0
    im=Image.fromarray(b[ys.min():ys.max()+1,xs.min():xs.max()+1]); im3=im.resize((im.width*3,im.height*3),Image.LANCZOS)
    rgb=im3.convert('RGB').filter(ImageFilter.UnsharpMask(2,70,2)); im3=Image.merge('RGBA',(*rgb.split(),im3.split()[3]))
    im3.save(f'{OUT}/{names[r*C+c]}.png')
print('ok',len(cell))
