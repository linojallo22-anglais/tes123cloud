import pathlib, threading, http.server, functools, socketserver
from playwright.sync_api import sync_playwright
from PIL import Image
ROOT=pathlib.Path(__file__).resolve().parent.parent.parent
H=functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(ROOT)); H.log_message=lambda *a,**k:None
srv=socketserver.TCPServer(("127.0.0.1",0),H); port=srv.server_address[1]; threading.Thread(target=srv.serve_forever,daemon=True).start()
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium")
    for v in 'ABC':
        pg=b.new_page(viewport={"width":1280,"height":720}); pg.goto(f"http://127.0.0.1:{port}/blockbuster/thumb.html#{v}"); pg.wait_for_function("window.READY===true",timeout=30000); pg.wait_for_timeout(300)
        pg.screenshot(path=str(ROOT/f'blockbuster/thumbnail-{v}.png')); pg.close()
    b.close()
srv.shutdown()
sh=Image.new('RGB',(1280+40,720*1+200),(30,30,30))
for i,v in enumerate('ABC'):
    im=Image.open(ROOT/f'blockbuster/thumbnail-{v}.png').convert('RGB'); sh.paste(im.resize((426,240)),(i*440,0)); sh.paste(im.resize((320,180)),(i*440,260))
sh.crop((0,0,1320,460)).save(ROOT/'blockbuster/build/thumbs_check.jpg',quality=85)
print('ok')
