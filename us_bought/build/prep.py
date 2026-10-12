# prep.py — territoires achetés par les USA (approximations historiques) + pays utiles -> build/data.json
import json
from shapely.geometry import shape, mapping, Polygon, box, LineString
from shapely.ops import unary_union
R = 'raw/'
adm = json.load(open(R + 'ne_50m_admin_1_states_provinces.geojson'))
ST = {f['properties']['name']: shape(f['geometry']).buffer(0) for f in adm['features'] if f['properties'].get('adm0_a3') == 'USA'}
U = lambda names: unary_union([ST[n] for n in names])
lower48 = unary_union([g for n, g in ST.items() if n not in ('Alaska', 'Hawaii')])

# Mississippi (rive est de la Louisiane), du lac Itasca au golfe
MISS = [(-95.2, 47.24), (-94.6, 46.4), (-93.3, 45.1), (-92.0, 44.4), (-91.2, 43.5), (-91.1, 42.5), (-90.6, 41.5), (-91.4, 40.4),
        (-90.2, 38.65), (-89.5, 37.3), (-89.15, 37.0), (-89.6, 36.0), (-90.05, 35.15), (-91.1, 33.6), (-90.95, 32.4), (-91.5, 31.3),
        (-91.2, 30.5), (-90.07, 29.95), (-89.4, 29.2), (-89.0, 28.9)]
# limite ouest/nord (Sabine, Rivière Rouge, 100e méridien, Arkansas, ligne de partage des eaux, 49e parallèle)
WEST = [(-93.84, 29.0), (-93.84, 29.68), (-94.04, 32.0), (-94.04, 33.55), (-95.5, 33.88), (-97.0, 33.85), (-98.5, 34.1), (-100.0, 34.56),
        (-100.0, 37.75), (-101.5, 37.95), (-103.0, 38.05), (-104.6, 38.25), (-106.0, 38.6), (-106.3, 40.5), (-107.5, 42.5), (-109.8, 43.5),
        (-110.6, 44.6), (-112.5, 45.7), (-113.5, 47.0), (-114.0, 48.0), (-114.07, 49.0), (-95.15, 49.0), (-95.15, 49.4)]
lp_raw = Polygon(WEST + MISS)
louisiana = lp_raw.buffer(0).intersection(lower48)

# Gadsden : entre la Gila (~33°N) / 32°22' et la frontière actuelle
GN = [(-114.72, 32.72), (-113.5, 32.92), (-112.3, 33.0), (-111.4, 33.05), (-110.5, 32.95), (-109.6, 32.75), (-109.05, 32.7), (-108.2, 32.4), (-106.6, 32.33), (-106.45, 31.78)]
gads = Polygon(GN + [(-106.45, 30.5), (-115.5, 30.5), (-115.5, 32.72)]).buffer(0).intersection(U(['Arizona', 'New Mexico']))
# Cession mexicaine
co_part = ST['Colorado'].intersection(box(-110, 36, -106.2, 42))
wy_part = ST['Wyoming'].intersection(box(-112, 40, -107.0, 42.0))
mexc = unary_union([U(['California', 'Nevada', 'Utah']), U(['Arizona', 'New Mexico']).difference(gads), co_part, wy_part]).difference(louisiana)
texas = ST['Texas']
# Floride (+ bande de Floride occidentale au sud du 31e parallèle)
florida = unary_union([ST['Florida'], U(['Alabama', 'Mississippi']).intersection(box(-89.75, 29, -87.4, 31.0))])
oregon = unary_union([U(['Washington', 'Oregon', 'Idaho']), ST['Montana'].intersection(box(-117, 44, -110.6, 49.5)).difference(louisiana), ST['Wyoming'].intersection(box(-112, 42, -109.8, 45.5)).difference(louisiana)])
east1803 = lower48.difference(unary_union([louisiana, gads, mexc, texas, florida, oregon]).buffer(0.05))
alaska = ST['Alaska']
FIFTEEN = ['Arkansas', 'Missouri', 'Iowa', 'Oklahoma', 'Kansas', 'Nebraska', 'Minnesota', 'South Dakota', 'North Dakota', 'Montana', 'Wyoming', 'Louisiana', 'New Mexico', 'Texas', 'Colorado']

w50 = json.load(open('build/w50.json')); w10 = json.load(open('build/w10.json'))
def S(g, tol): g = g.simplify(tol, preserve_topology=True); return mapping(g)
C50 = {c.get('id'): shape(c['g']) for c in w50['c'] if c['g']}
C10 = {c['id']: shape(c['g']) for c in w10['c'] if c['g']}
riv = json.load(open(R + 'ne_10m_rivers_lake_centerlines.geojson'))['features']
want = {'Mississippi': 'miss', 'Missouri': 'misso', 'Gila': 'gila', 'Rio Grande': 'rio', 'Colorado': 'colo', 'Ohio': 'ohio', 'Arkansas': 'ark', 'Yukon': 'yukon'}
rivers = {}
for f in riv:
    n = f['properties'].get('name') or ''
    if n in want:
        g = shape(f['geometry'])
        if g.bounds[0] > -170 and g.bounds[2] < -60 and g.bounds[1] > 25:
            rivers.setdefault(want[n], []).append(S(g, 0.01))
out = {
    'states': {n: S(g, 0.01) for n, g in ST.items()},
    'fifteen': FIFTEEN,
    'zones': {k: S(v, 0.01) for k, v in dict(louisiana=louisiana, gadsden=gads, mexc=mexc, texas=texas, florida=florida, oregon=oregon, east1803=east1803, alaska=alaska, lower48=lower48).items()},
    'c10': {k: S(v, 0.004 if k in ('643', '124', '840', '304') else 0.0008) for k, v in C10.items()},
    'rivers': rivers, 'miss': MISS,
}
json.dump(out, open('build/data.json', 'w'), separators=(',', ':'))
w50s = {'c': [{'id': c.get('id', ''), 'n': c['n'], 'g': S(shape(c['g']), 0.02)} for c in w50['c'] if c['g']], 'b': S(shape(w50['b']), 0.02), 'land': S(shape(w50['land']['features'][0]['geometry']) if w50['land'].get('features') else shape(w50['land']), 0.02)}
json.dump(w50s, open('build/world50.json', 'w'), separators=(',', ':'))
import os
print({k: round(v.area, 1) for k, v in dict(louisiana=louisiana, gads=gads, mexc=mexc, florida=florida, east=east1803).items()}, os.path.getsize('build/data.json') // 1024, os.path.getsize('build/world50.json') // 1024, list(rivers))
