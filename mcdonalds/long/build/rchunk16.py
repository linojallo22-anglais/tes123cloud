# rchunk.py  PAGE f0 f1 OUT
import sys, subprocess, pathlib, threading, http.server, functools, socketserver, json
from playwright.sync_api import sync_playwright
W=pathlib.Path(__file__).resolve().parent.parent.parent; FPS=12; VW,VH=1920,1080; PAGE,f0,f1,OUT=sys.argv[1],int(sys.argv[2]),int(sys.argv[3]),sys.argv[4]
H=functools.partial(http.server.SimpleHTTPRequestHandler,directory=str(W)); H.log_message=lambda *a,**k:None
srv=socketserver.TCPServer(("127.0.0.1",0),H); port=srv.server_address[1]; threading.Thread(target=srv.serve_forever,daemon=True).start()
with sync_playwright() as p:
    b=p.chromium.launch(executable_path="/opt/pw-browsers/chromium"); pg=b.new_page(viewport={"width":VW,"height":VH})
    pg.goto(f"http://127.0.0.1:{port}/"+PAGE); pg.wait_for_function("window.READY===true",timeout=60000); pg.wait_for_timeout(600)
    if f0==0: open(W/"long/build/events.json","w").write(json.dumps(pg.evaluate("EVENTS")))
    ff=subprocess.Popen(["ffmpeg","-v","error","-y","-f","image2pipe","-framerate",str(FPS),"-i","-","-c:v","libx264","-pix_fmt","yuv420p","-crf","17",str(W/OUT)],stdin=subprocess.PIPE)
    for i in range(f0,f1):
        pg.evaluate(f"render({i/FPS})"); ff.stdin.write(pg.screenshot(type="jpeg",quality=94))
        if (i-f0)%100==0: print(OUT,i,flush=True)
    ff.stdin.close(); ff.wait(); b.close()
srv.shutdown(); print("DONE",OUT,flush=True)
