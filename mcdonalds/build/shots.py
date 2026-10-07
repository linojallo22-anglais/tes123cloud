# shots.py PAGE t1 t2 ...  -> build/shots/s_t.png + contact sheets
import sys, pathlib, threading, http.server, functools, socketserver
from playwright.sync_api import sync_playwright
from PIL import Image
W=pathlib.Path(__file__).parent.parent; PAGE=sys.argv[1]; TS=[float(x) for x in sys.argv[2:]]
(W/'build/shots').mkdir(exist_ok=True)
H=functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(W)); H.log_message=lambda *a,**k:None
srv=socketserver.TCPServer(("127.0.0.1",0),H); port=srv.server_address[1]; threading.Thread(target=srv.serve_forever,daemon=True).start()
paths=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium"); pg=b.new_page(viewport={"width":1080,"height":1920})
    pg.goto(f"http://127.0.0.1:{port}/"+PAGE); pg.wait_for_function("window.READY===true",timeout=30000); pg.wait_for_timeout(400)
    for t in TS:
        pg.evaluate(f"render({t})"); f=W/f'build/shots/s_{t:06.2f}.png'; pg.screenshot(path=str(f)); paths.append((t,f))
    b.close()
srv.shutdown()
TW,TH=270,480; per=12
for k in range(0,len(paths),per):
    grp=paths[k:k+per]; sh=Image.new('RGB',(TW*6,TH*2),(0,0,0))
    for i,(t,f) in enumerate(grp):
        im=Image.open(f).convert('RGB').resize((TW,TH)); sh.paste(im,((i%6)*TW,(i//6)*TH))
    sh.save(W/f'build/shots/contact_{k//per}.jpg',quality=80)
print('ok',len(paths))
