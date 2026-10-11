import numpy as np; from PIL import Image; Image.MAX_IMAGE_PIXELS=None
im=Image.open('HYP_HR_SR_OB_DR.tif'); W,H=im.size
box=(int((-12+180)/360*W),int((90-62)/180*H),int((45+180)/360*W),int((90-34)/180*H)); a=np.asarray(im.crop(box).resize((1200,700))).astype(np.float32)
def grade(a):
    r,g,b=a[...,0],a[...,1],a[...,2]; sea=(b>r+18)&(b>=g+2)
    o=a.copy()
    S=a[sea]; ls=S.mean(-1,keepdims=True); S=ls+(S-ls)*0.75; o[sea]=S*np.array([0.36,0.62,0.62])+np.array([12,44,50])
    land=~sea; L=a[land]; lum=L.mean(-1,keepdims=True); o[land]=lum+(L-lum)*1.05
    return np.clip((o-128)*1.05+126,0,255).astype(np.uint8)
Image.fromarray(np.vstack([a.astype(np.uint8),grade(a)])).save('grade_test.jpg',quality=85)
