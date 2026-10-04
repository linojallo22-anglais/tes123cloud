# Personnes en noir et blanc "demi-teinte" façon Vox, en gardant le papier coloré (rouge / jaune) derrière
from PIL import Image; import numpy as np, colorsys, sys, scipy.ndimage as nd
def convert(src,dst):
    im=Image.open(src).convert('RGBA'); a=np.array(im).astype(np.float32)
    rgb=a[...,:3]/255; mx=rgb.max(2); mn=rgb.min(2); sat=np.where(mx>0,(mx-mn)/np.maximum(mx,1e-6),0)
    r,g,b=rgb[...,0],rgb[...,1],rgb[...,2]
    hue=np.zeros_like(mx)
    d=np.maximum(mx-mn,1e-6)
    hue=np.where(mx==r,((g-b)/d)%6,np.where(mx==g,(b-r)/d+2,(r-g)/d+4))*60
    paper=(sat>0.62)&(mx>0.6)&(((hue<14)|(hue>345))|((hue>36)&(hue<56)))   # rouge vif ou jaune moutarde
    # ne garder que les grandes zones de papier (pas une cravate isolée? on la garde aussi : accent Vox)
    lab,n=nd.label(paper); cnt=np.bincount(lab.ravel()); big=np.isin(lab,[k for k in range(1,n+1) if cnt[k]>1500]); paper=big
    paper=nd.binary_closing(paper,iterations=2)
    gray=(0.3*r+0.59*g+0.11*b)
    gray=np.clip((gray-0.5)*1.18+0.5,0,1)                      # un peu plus de contraste
    # trame demi-teinte légère
    h,w=gray.shape; yy,xx=np.mgrid[0:h,0:w]; p=7.0
    dots=(np.sin(xx*np.pi/p*0.7071+yy*np.pi/p*0.7071)*np.sin(xx*np.pi/p*0.7071-yy*np.pi/p*0.7071))*0.5+0.5
    ht=np.clip(gray+ (dots-0.5)*0.16,0,1)
    tint=np.stack([ht*0.98+0.02,ht*0.95+0.03,ht*0.88+0.05],-1)  # gris légèrement chaud (papier)
    out=np.where(paper[...,None],rgb,tint)
    o=np.dstack([out*255,a[...,3]]).astype(np.uint8)
    Image.fromarray(o).save(dst)
for n in sys.argv[1:]:
    convert(f'img/{n}.png',f'img/{n}.png')
print('ok')
