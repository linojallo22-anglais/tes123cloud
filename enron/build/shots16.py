# shots16.py t1 t2 ... -> build/shots/s_t.png + planches contact ; affiche les ancres manquées
import sys, pathlib, threading, http.server, functools, socketserver, json
from playwright.sync_api import sync_playwright
from PIL import Image
ROOT=pathlib.Path(__file__).resolve().parent.parent.parent; OUT=ROOT/"enron/build/shots"; OUT.mkdir(exist_ok=True)
TS=[float(x) for x in sys.argv[1:] if x!="scenes"]
H=functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(ROOT)); H.log_message=lambda *a,**k:None
srv=socketserver.TCPServer(("127.0.0.1",0),H); port=srv.server_address[1]; threading.Thread(target=srv.serve_forever,daemon=True).start()
paths=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium"); pg=b.new_page(viewport={"width":1920,"height":1080})
    errs=[]; pg.on("pageerror",lambda e:errs.append(str(e)))
    pg.goto(f"http://127.0.0.1:{port}/enron/page.html"); pg.wait_for_function("window.READY===true",timeout=60000)
    print('MISS',pg.evaluate("MISS")); print('ERR',errs)
    sc=pg.evaluate("SC"); bad=[(i,sc[i],sc[i+1]) for i in range(len(sc)-1) if not sc[i]<sc[i+1]]
    print('scenes',len(sc),'non croissantes',bad)
    if len(sys.argv)>1 and sys.argv[1]=='scenes':
        json.dump(sc,open(OUT/'sc.json','w')); TS=[]
    for t in TS:
        pg.evaluate(f"render({t})"); f=OUT/f's_{t:07.2f}.png'; pg.screenshot(path=str(f)); paths.append((t,f))
    b.close()
srv.shutdown()
TW,TH=480,270; per=12
for k in range(0,len(paths),per):
    grp=paths[k:k+per]; sh=Image.new('RGB',(TW*4,TH*3))
    for i,(t,f) in enumerate(grp): sh.paste(Image.open(f).convert('RGB').resize((TW,TH)),((i%4)*TW,(i//4)*TH))
    sh.save(OUT/f'contact_{k//per}.jpg',quality=80)
print('ok',len(paths))
