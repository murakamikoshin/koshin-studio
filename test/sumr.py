import json, collections, sys
rs={}
for f in sys.argv[1:]:
    for l in open(f):
        r=json.loads(l); rs[r['i']]=r
par={}; bad=[]; band=collections.defaultdict(list); cf=0; ones=0
for r in rs.values():
    if 'err' in r: bad.append((r['i'],r['err'][:100])); continue
    ms=[x['moves'] for x in (r['careful'],r['smart']) if x['ok']]
    if not ms: bad.append((r['i'],r['code'],r['sig']['rules'],r['careful'].get('why'),r['smart'].get('why'))); continue
    par[r['code']]=min(ms); w=int(r['code'].split('-')[0]); band[(w-5)//28].append(min(ms)); cf+= not r['careful']['ok']; ones+=min(ms)==1
print(len(rs), len(par), 'unclear', bad, 'careful-fail', cf, 'one-move', ones)
for k in sorted(band): v=band[k]; print('STAGE %d-%d'%(5+k*28, min(200,4+(k+1)*28)), 'avg', round(sum(v)/len(v),1), 'max', max(v))
json.dump(par, open('/tmp/par.json','w')); json.dump([b[0] for b in bad], open('/tmp/bad.json','w'))
