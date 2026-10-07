# Sous-titres depuis le script vérifié, calés sur words.json -> build/data.js
import json, re
W=json.load(open('build/words.json'))
def norm(w):
    w=w.lower().replace("’","'"); w=re.sub(r"[^a-z0-9']","",w); return w.strip("'")
HL=re.compile(r"^(rent|landlord|real|estate|landlord\.|crumbs|bricks)$",re.I)
caps=[]; idx=0
for para in open('script-en.txt').read().split('\n'):
    para=para.strip()
    if not para: continue
    toks=para.split()
    if para.startswith('"') and not para.startswith('"We are'):   # réplique de sketch : bulles à l'écran, pas de sous-titre
        t0=W[idx][1]; caps.append([t0,""]); idx+=sum(1 for x in toks if norm(x)); continue
    chunk=[];start=None
    for i,tok in enumerate(toks):
        n=norm(tok)
        if n:
            if start is None: start=W[idx][1]
            idx+=1
        chunk.append(tok)
        rest=0
        for tt in toks[i+1:]:
            rest+=1
            if tt[-1] in '.?!:,': break
        end=tok[-1] in '.?!:' or (tok[-1]==',' and len(chunk)>=3) or (len(' '.join(chunk))>=42 and rest>2) or len(' '.join(chunk))>=56
        if i==len(toks)-1 or end:
            txt=' '.join(chunk).replace('"','')
            caps.append([round(start,2),txt]); chunk=[];start=None
assert idx==len(W),(idx,len(W))
# fusionne les morceaux trop courts (<0.5 s) avec le suivant
out=[]
for c in caps:
    if out and out[-1][1] and c[1] and c[0]-out[-1][0]<0.45: out[-1][1]+=' '+c[1]
    else: out.append(c)
open('build/data.js','w').write('const WORDS='+json.dumps(W)+';\nconst CAP='+json.dumps(out)+';\nconst DUR=473.7;\n')
print(len(out),'sous-titres')
