# Aligne chaque mot du script sur les temps whisper -> build/words.json [[mot_normalisé, t], ...]
import json, re, difflib
def norm(w):
    w=w.lower().replace("’","'")
    w=re.sub(r"[^a-z0-9']","",w); return w.strip("'")
NUM={'0':'zero','1':'one','2':'two','3':'three','4':'four','5':'five','6':'six','7':'seven','8':'eight','9':'nine'}
script=open('script-en.txt').read()
sw=[norm(x) for x in script.split()]; sw=[x for x in sw if x]
asr=json.load(open('build/asr.json'))
aw=[];at=[]
for c in asr['chunks']:
    for piece in c['text'].split():
        n=norm(piece)
        if n: aw.append(n); at.append(max(0,c['timestamp'][0]-0.25))
sm=difflib.SequenceMatcher(None,sw,aw,autojunk=False)
T=[None]*len(sw)
for a,b,size in sm.get_matching_blocks():
    for k in range(size): T[a+k]=at[b+k]
# interpolation des trous
known=[i for i,t in enumerate(T) if t is not None]
for i in range(len(T)):
    if T[i] is None:
        p=max([k for k in known if k<i],default=None); n=min([k for k in known if k>i],default=None)
        if p is None: T[i]=T[n]
        elif n is None: T[i]=T[p]+0.3*(i-p)
        else: T[i]=T[p]+(T[n]-T[p])*(i-p)/(n-p)
print('mots script',len(sw),'whisper',len(aw),'appariés',len(known))
json.dump([[w,round(t,2)] for w,t in zip(sw,T)],open('build/words.json','w'))
