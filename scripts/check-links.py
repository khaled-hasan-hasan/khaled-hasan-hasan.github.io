#!/usr/bin/env python3
"""Record public external-link status without treating bot blocks as broken links."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import concurrent.futures, urllib.request, urllib.error, json
ROOT=Path(__file__).resolve().parents[1]
class Links(HTMLParser):
    def __init__(self):super().__init__();self.urls=set()
    def handle_starttag(self,t,attrs):
        a=dict(attrs)
        if t=='a' and urlsplit(a.get('href','')).scheme=='https':self.urls.add(a['href'])
urls=set()
for p in (ROOT/'dist').rglob('*.html'):
    parser=Links();parser.feed(p.read_text());urls|=parser.urls

def fetch(url):
    try:
        req=urllib.request.Request(url,headers={'User-Agent':'SmartDataVisions-Portfolio-Link-Audit/1.0'})
        with urllib.request.urlopen(req,timeout=25) as r:
            r.read(4096);return {'url':url,'status':r.status,'final_url':r.url,'result':'reachable; content not fully verified'}
    except urllib.error.HTTPError as e:
        return {'url':url,'status':e.code,'result':'manual check required: bot/access response' if e.code in [403,429,999] else 'HTTP failure'}
    except Exception as e:return {'url':url,'status':None,'result':str(e)}
with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:results=list(pool.map(fetch,sorted(urls)))
(ROOT/'docs/external-links.json').write_text(json.dumps({'checked_date':'2026-11-11','links':results},indent=2)+'\n')
for r in results:print(r['status'],r['url'],r['result'])
