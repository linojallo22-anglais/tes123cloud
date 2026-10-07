# découpe à partir d'un masque RGBA : sépare les éléments collés par érosion -> graines -> plus proche graine
from PIL import Image, ImageFilter; import numpy as np, scipy.ndimage as nd, sys
SRC,NAMES,ROWS,OUT=sys.argv[1],sys.argv[2],[int(x) for x in sys.argv[3].split(',')],sys.argv[4]
names=open(NAMES).read().split(); N=sum(ROWS)
a=np.array(Image.open(SRC)); m=a[...,3]>0
st=nd.generate_binary_structure(2,1)
for it in range(0,60,2):
    e=nd.binary_erosion(m,st,iterations=it) if it else m
    lab,n=nd.label(e); cnt=np.bincount(lab.ravel()); big=[k for k in range(1,n+1) if cnt[k]>600]
    if len(big)>=N: break
print('erosion',it,'graines',len(big))
assert len(big)==N,len(big)
seeds=np.where(np.isin(lab,big),lab,0)
_,(iy,ix)=nd.distance_transform_edt(seeds==0,return_indices=True)
own=seeds[iy,ix]*m
cs={k:nd.center_of_mass(own==k) for k in big}
# lignes : tri par y puis découpe selon ROWS
order=sorted(big,key=lambda k:cs[k][0]); res=[]; i=0
for r in ROWS:
    row=sorted(order[i:i+r],key=lambda k:cs[k][1]); res+=row; i+=r
for name,k in zip(names,res):
    mk=own==k
    mk=nd.binary_opening(mk,st,iterations=6)
    l2,n2=nd.label(mk); c2=np.bincount(l2.ravel()); c2[0]=0; mk=l2==c2.argmax()
    mk=nd.binary_fill_holes(mk); mk=nd.binary_erosion(mk,st,iterations=int(sys.argv[5]) if len(sys.argv)>5 else 2)
    al=nd.gaussian_filter(mk.astype(np.float32),0.7)
    ys,xs=np.where(mk); b=a.copy(); b[...,3]=(al*255).astype(np.uint8)
    im=Image.fromarray(b[ys.min():ys.max()+1,xs.min():xs.max()+1]); im3=im.resize((im.width*3,im.height*3),Image.LANCZOS)
    rgb=im3.convert('RGB').filter(ImageFilter.UnsharpMask(2,70,2)); im3=Image.merge('RGBA',(*rgb.split(),im3.split()[3]))
    im3.save(f'{OUT}/{name}.png'); print(name,im3.size)
