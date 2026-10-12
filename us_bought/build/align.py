# aligne les mots du script sur whisper -> build/words.json [{w, n, t0, t1, b}]
import json, re, difflib
def norm(w): return re.sub(r"[^a-z0-9]", "", w.lower().replace("’", "'"))
paras = [p for p in open('script-en.txt').read().split('\n\n') if p.strip()]
SW = []
for b, p in enumerate(paras):
    for w in p.split():
        n = norm(w)
        if n: SW.append({'w': w, 'n': n, 'b': b})
asr = json.load(open('build/asr.json'))
aw, at, ae = [], [], []
for c in asr['chunks']:
    for piece in c['text'].split():
        n = norm(piece)
        if n: aw.append(n); at.append(c['timestamp'][0]); ae.append(c['timestamp'][1] or c['timestamp'][0] + 0.3)
sm = difflib.SequenceMatcher(None, [x['n'] for x in SW], aw, autojunk=False)
T0 = [None] * len(SW); T1 = [None] * len(SW)
for a, b, size in sm.get_matching_blocks():
    for k in range(size): T0[a + k] = at[b + k]; T1[a + k] = ae[b + k]
known = [i for i, t in enumerate(T0) if t is not None]
for i in range(len(SW)):
    if T0[i] is None:
        lo = max([k for k in known if k < i], default=None); hi = min([k for k in known if k > i], default=None)
        if lo is None: T0[i] = T0[hi] - 0.3 * (hi - i)
        elif hi is None: T0[i] = T1[lo] + 0.3 * (i - lo)
        else: T0[i] = T1[lo] + (T0[hi] - T1[lo]) * (i - lo) / (hi - lo)
        T1[i] = T0[i] + 0.25
off = 0.12  # whisper en retard
for i, x in enumerate(SW): x['t0'] = round(max(0, T0[i] - off), 3); x['t1'] = round(max(x['t0'] + 0.05, T1[i] - off), 3)
json.dump(SW, open('build/words.json', 'w'))
print('mots', len(SW), 'appariés', len(known), 'paragraphes', len(paras), 'premier', SW[0]['t0'], 'dernier', SW[-1]['t1'])
