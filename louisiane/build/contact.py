import sys,glob
from PIL import Image,ImageDraw
fs=sorted(glob.glob('prev/*.jpg'));n=int(sys.argv[1]) if len(sys.argv)>1 else 20
for k in range(0,len(fs),n):
    part=fs[k:k+n];cols=5;rows=(len(part)+cols-1)//cols;w,h=300,533
    sh=Image.new('RGB',(cols*w,rows*h),'black')
    for i,f in enumerate(part):
        im=Image.open(f).resize((w,h));sh.paste(im,((i%cols)*w,(i//cols)*h));ImageDraw.Draw(sh).text(((i%cols)*w+6,(i//cols)*h+6),str(k+i),fill='yellow')
    sh.save(f'contact{k//n}.jpg',quality=82)
