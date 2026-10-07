import json, numpy as np, scipy.signal as sg, scipy.io.wavfile as wf
import sys; SR=48000; DUR=float(sys.argv[1]); N=int(SR*DUR); out=np.zeros(N+SR*2); rng=np.random.default_rng(21)
def T(d): return np.arange(int(d*SR))/SR
def band(x,lo,hi): b,a=sg.butter(2,[lo/(SR/2),min(hi,23000)/(SR/2)],'band'); return sg.lfilter(b,a,x)
def lp(x,f): b,a=sg.butter(2,f/(SR/2)); return sg.lfilter(b,a,x)
def norm(x,g): return g*x/(np.max(np.abs(x))+1e-9)
def crinkle(d,dens,g,lo=1500,hi=9000):
    y=np.zeros(int(d*SR))
    for k in range(int(dens*d)):
        n=int(rng.uniform(.004,.02)*SR); c=band(rng.normal(0,1,n),lo,hi)*np.hanning(n); i=int(rng.uniform(0,d-.025)*SR); y[i:i+n]+=c*rng.uniform(.2,1)
    return norm(y,g)
def slide(g=.5,d=.45):
    t=T(d); y=band(rng.normal(0,1,len(t)),600,5000)*np.sin(np.pi*t/d)**1.5; y+=crinkle(d,40,.3)[:len(t)]
    thud=np.zeros(len(t)); n=int(.06*SR); i=len(t)-n-10; thud[i:i+n]=np.sin(2*np.pi*140*T(.06))*np.exp(-T(.06)/.015)
    return norm(y*.8+thud*.9,g)
def paper(g=.55): y=crinkle(.35,120,1)*np.linspace(1,.3,int(.35*SR)); return norm(y,g)
def stamp(g=1.0):
    t=T(.45); x=np.sin(2*np.pi*(70+90*np.exp(-t/.02))*t)*np.exp(-t/.1)+band(rng.normal(0,1,len(t)),300,4000)*np.exp(-t/.02)*1.2
    return norm(x,g)
def tape(g=.5,d=.4):
    t=T(d); y=band(rng.normal(0,1,len(t)),1500,9000)*(0.5+0.5*np.sign(np.sin(2*np.pi*55*t)))*np.sin(np.pi*t/d)
    return norm(y,g)
def key(g=.45):
    t=T(.06); x=band(rng.normal(0,1,len(t)),1800,7000)*np.exp(-t/.006)+np.sin(2*np.pi*260*t)*np.exp(-t/.012)*.6
    return norm(x,g*rng.uniform(.7,1))
def pin(g=.5): t=T(.08); return norm(np.sin(2*np.pi*2400*t)*np.exp(-t/.015)+band(rng.normal(0,1,len(t)),3000,9000)*np.exp(-t/.003),g)
def string(g=.45,d=.55): t=T(d); f=300+900*t/d; y=band(rng.normal(0,1,len(t)),800,6000)*.6+np.sin(2*np.pi*np.cumsum(f)/SR)*.25; return norm(y*np.sin(np.pi*t/d),g)
def scribble(g=.5,d=.45):
    t=T(d); y=band(rng.normal(0,1,len(t)),2000,8000)*(0.55+0.45*np.sin(2*np.pi*9*t)); return norm(y*np.sin(np.pi*t/d)**.5,g)
def whoosh(g=.55,d=.38):
    t=np.linspace(0,1,int(d*SR)); x=rng.normal(0,1,len(t)); y=band(x,250,1500)*(1-t)+band(x,1500,7000)*t; return norm(y*np.sin(np.pi*t)**2,g)
def whoosh_s(): return whoosh(.4,.3)
def tap(g=.55): t=T(.08); return norm(np.sin(2*np.pi*(700+500*np.exp(-t/.01))*t)*np.exp(-t/.02)+band(rng.normal(0,1,len(t)),1000,5000)*np.exp(-t/.004)*.5,g)
def pop(g=.6): t=T(.1); f=320+700*np.exp(-t/.02); return norm(np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t/.03),g)
def cash(g=.7): y=crinkle(.55,260,1,2500,11000)*np.linspace(1,.4,int(.55*SR)); return norm(y,g)
def ding(g=.55):
    t=T(1.2); x=sum(np.sin(2*np.pi*f*t)*np.exp(-t/d)*a for f,d,a in [(1320,.5,1),(2650,.25,.4),(3960,.12,.25),(1333,.45,.5)])
    return norm(x*np.minimum(1,t/.002),g)
def boom(g=1.0):
    t=T(1.4); x=np.sin(2*np.pi*(42+60*np.exp(-t/.07))*t)*np.exp(-t/.4)+band(rng.normal(0,1,len(t)),60,1200)*np.exp(-t/.12)*.9
    return norm(x,g)
def thud(g=.6): t=T(.3); return norm(np.sin(2*np.pi*(80+60*np.exp(-t/.02))*t)*np.exp(-t/.07)+band(rng.normal(0,1,len(t)),200,2500)*np.exp(-t/.02)*.6,g)
def coin(g=.7): t=T(.9); return norm(sum(np.sin(2*np.pi*f*t)*np.exp(-t/.2) for f in [3950,5200,6400])*np.minimum(1,t/.001),g)
def whir(g=.5,d=1.2):
    t=T(d); f=180+40*np.sin(2*np.pi*3*t); y=np.sin(2*np.pi*np.cumsum(f)/SR)*.5+band(rng.normal(0,1,len(t)),300,2500)*.5
    return norm(y*np.minimum(1,t/.1)*np.minimum(1,(d-t)/.2),g)
M=dict(slide=slide,paper=paper,stamp=stamp,tape=tape,key=key,pin=pin,string=string,scribble=scribble,whoosh=whoosh,whoosh_s=whoosh_s,tap=tap,pop=pop,cash=cash,ding=ding,boom=boom,thud=thud,coin=coin,whir=whir)
for t0,k in json.load(open('events.json')):
    x=M[k](); i=int(max(0,t0)*SR); out[i:i+len(x)]+=x[:len(out)-i]
fx=out[:N]; fx=fx/np.max(np.abs(fx))*.9
t=np.arange(N)/SR; notes=[73.4,110,146.8,220]
dr=sum(np.sin(2*np.pi*f*t+.6*np.sin(2*np.pi*.05*(i+1)*t))/(i+1) for i,f in enumerate(notes)); dr=lp(dr,700)*(.8+.2*np.sin(2*np.pi*t/7))
dr*=np.minimum(1,t/1.5)*np.minimum(1,(DUR-t)/1.5); dr=dr/np.max(np.abs(dr))*.9
wf.write('fx.wav',SR,(fx*32767).astype(np.int16)); wf.write('drone.wav',SR,(dr*32767).astype(np.int16)); print('ok')
