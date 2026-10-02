import json, math
from shapely.geometry import shape, mapping, LineString, Polygon
from shapely.ops import unary_union, split
R='/home/user/tes123cloud/berlin/raw/'
adm=json.load(open(R+'ne_10m_admin_1_states_provinces.geojson'))
de={f['properties']['name']:shape(f['geometry']) for f in adm['features'] if f['properties']['adm0_a3']=='DEU'}
print(sorted(de))
def g(names): return unary_union([de[n] for n in names])
sov=g(['Mecklenburg-Vorpommern','Brandenburg','Berlin','Sachsen','Sachsen-Anhalt','Thüringen'])
bri=g(['Schleswig-Holstein','Hamburg','Niedersachsen','Nordrhein-Westfalen'])
bw=de['Baden-Württemberg']
cut=LineString([(7.4,48.98),(8.1,48.95),(8.45,48.85),(8.75,48.70),(9.0,48.62),(9.3,48.60),(9.6,48.55),(9.95,48.40),(10.2,48.45),(10.8,48.45)])
parts=split(bw,cut)
north=unary_union([p for p in parts.geoms if p.centroid.y>48.7]); south=unary_union([p for p in parts.geoms if p.centroid.y<=48.7])
us=unary_union([g(['Bayern','Hessen','Bremen']),north])
fr=unary_union([g(['Rheinland-Pfalz','Saarland']),south])
ot=json.load(open(R+'lor_ortsteile.geojson'))
US=['0202']+['06%02d'%i for i in range(1,8)]+['07%02d'%i for i in range(1,7)]+['08%02d'%i for i in range(1,6)]
BR=['0102','0103','0104']+['04%02d'%i for i in range(1,8)]+['05%02d'%i for i in range(1,10)]
FR=['0105','0106']+['12%02d'%i for i in range(1,12)]
sec={'us':[],'uk':[],'fr':[],'su':[]}
for f in ot['features']:
    c=f['properties']['spatial_name']; s=shape(f['geometry']).buffer(0)
    sec['us' if c in US else 'uk' if c in BR else 'fr' if c in FR else 'su'].append(s)
sec={k:unary_union(v).buffer(0.0002).buffer(-0.0002) for k,v in sec.items()}
west=unary_union([sec['us'],sec['uk'],sec['fr']]).buffer(0.0003).buffer(-0.0003)
if west.geom_type=='MultiPolygon': west=max(west.geoms,key=lambda p:p.area)
west=Polygon(west.exterior)
def km(line):
    cs=list(line.coords); t=0
    for (x1,y1),(x2,y2) in zip(cs,cs[1:]):
        p=math.radians; a=math.sin(p(y2-y1)/2)**2+math.cos(p(y1))*math.cos(p(y2))*math.sin(p(x2-x1)/2)**2; t+=2*6371*math.asin(math.sqrt(a))
    return t
print('West Berlin perimeter km', round(km(west.exterior)))
berlin=unary_union(list(sec.values())).buffer(0.0003).buffer(-0.0003)
berlin=max(berlin.geoms,key=lambda p:p.area) if berlin.geom_type=='MultiPolygon' else berlin
inner=west.exterior.difference(berlin.exterior.buffer(0.0008))  # wall inside city
print('inner wall km', round(sum(km(l) for l in getattr(inner,'geoms',[inner]))))
sov=unary_union([sov,berlin.buffer(0.01)])
sov=Polygon(max(sov.geoms,key=lambda p:p.area).exterior) if sov.geom_type=='MultiPolygon' else Polygon(sov.exterior)
igb=sov.boundary.intersection(unary_union([bri,us]).buffer(0.01))
def S(geom,tol): return mapping(geom.simplify(tol,preserve_topology=True))
rivers=json.load(open(R+'ne_10m_rivers_europe.geojson'))['features']+json.load(open(R+'ne_10m_rivers_lake_centerlines.geojson'))['features']
want={'Elbe','Spree','Havel','Rhine','Rhein','Oder','Danube','Donau','Weser','Main'}
riv=[]
for f in rivers:
    n=f['properties'].get('name') or ''
    if n in want:
        s=shape(f['geometry'])
        if s.intersects(Polygon([(5,47),(16,47),(16,55.5),(5,55.5)])): riv.append({'n':n,'g':S(s,0.003)})
lakes=[]
for fn in ['ne_10m_lakes.geojson','ne_10m_lakes_europe.geojson']:
    for f in json.load(open(R+fn))['features']:
        s=shape(f['geometry'])
        if s.intersects(Polygon([(12.8,52.2),(14,52.2),(14,52.8),(12.8,52.8)])): lakes.append(S(s,0.0005))
out={'states':{n:S(v,0.004) for n,v in de.items()},
 'zones':{'su':S(sov,0.004),'uk':S(bri,0.004),'us':S(us,0.004),'fr':S(fr,0.004)},
 'sectors':{k:S(v,0.0003) for k,v in sec.items()},
 'west':S(west,0.0002),'igb':S(igb,0.003),'rivers':riv,'lakes':lakes}
json.dump(out,open('/home/user/tes123cloud/berlin/build/data.json','w'),separators=(',',':'))
print('rivers',len(riv),'lakes',len(lakes))
