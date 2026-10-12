import json, re, subprocess
W = json.load(open('words.json'))
def norm(s): return re.sub(r'[^a-z0-9]', '', s.lower())
def find(ph, frm=0):
    p = [norm(x) for x in ph.split()]
    for i in range(frm, len(W) - len(p) + 1):
        if all(W[i + k]['n'] == p[k] for k in range(len(p))): return i
    raise SystemExit('introuvable: ' + ph)
SEGS = [('in 1803 the united', 'tried to buy the biggest island on earth with gold'),
        ('eight hundred and twentyeight', 'about three cents an acre'),
        ('alaska is more than twice', 'the size of texas put'),
        ('newspapers called it', 'even called it walrussia'),
        ('the price twentyfive million', 'ten thousand times more expensive'),
        ('and the answer from denmark', 'greenland is not for sale'),
        ('which deal would you', 'tell me in the comments')]
out = []; parts = []; dst = 0.0
for a, b in SEGS:
    i = find(a); jb = b.split(); j = find(b, i) + len(jb) - 1
    if b.endswith(' put'): j -= 1
    s0 = max((W[i - 1]['t1'] + 0.03) if i > 0 else 0, W[i]['t0'] - 0.12)
    s1 = min((W[j + 1]['t0'] - 0.03) if j + 1 < len(W) else W[j]['t1'] + 0.18, W[j]['t1'] + 0.18)
    out.append({'src': [round(s0, 3), round(s1, 3)], 'dst': round(dst, 3), 'txt': ' '.join(w['w'] for w in W[i:j + 1])})
    dst += (s1 - s0) + 0.28
json.dump(out, open('short_segs.json', 'w'), indent=1)
fc = []; inp = []
for k, sg in enumerate(out):
    d = sg['src'][1] - sg['src'][0]
    fc.append(f"[0:a]atrim={sg['src'][0]}:{sg['src'][1]},asetpts=PTS-STARTPTS,afade=t=in:d=0.035,afade=t=out:st={d-0.035:.3f}:d=0.035,apad=pad_dur=0.28[s{k}]")
fc.append(''.join(f'[s{k}]' for k in range(len(out))) + f'concat=n={len(out)}:v=0:a=1[o]')
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '../assets/voice.wav', '-filter_complex', ';'.join(fc), '-map', '[o]', 'vshort.wav'], check=True)
print('durée', round(dst, 2)); [print(round(s['dst'], 1), s['txt'][:70]) for s in out]
