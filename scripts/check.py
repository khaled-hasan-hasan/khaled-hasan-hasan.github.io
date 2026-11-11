#!/usr/bin/env python3
"""Static artifact checks; no browser or external dependencies required."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import json, re, sys, gzip, hashlib
ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT/'dist'
errors=[]
class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(convert_charrefs=True);self.nodes=[];self.feed(text)
    def handle_starttag(self,tag,attrs):self.nodes.append((tag,dict(attrs)))
    def handle_startendtag(self,tag,attrs):self.handle_starttag(tag,attrs)

def check(ok,msg):
    if not ok:errors.append(msg)

pages={p.relative_to(DIST).as_posix():Page(p.read_text()) for p in DIST.rglob('*.html')}
check(len(pages)==12,'Expected 12 generated pages')
for name,page in pages.items():
    nodes=page.nodes;ids=[a['id'] for _,a in nodes if 'id' in a]
    check(len(ids)==len(set(ids)),f'{name}: duplicate IDs')
    check(sum(t=='h1' for t,a in nodes)==1,f'{name}: exactly one h1')
    check(any(t=='main' and a.get('id')=='main' for t,a in nodes),f'{name}: main/skip target missing')
    check(any(t=='html' and a.get('lang')=='en' for t,a in nodes),f'{name}: language missing')
    for prop in ['og:title','og:description','og:image','og:url','og:type']:
        check(any(t=='meta' and a.get('property')==prop and a.get('content') for t,a in nodes),f'{name}: {prop} missing')
    check(any(t=='meta' and a.get('name')=='description' and a.get('content') for t,a in nodes),f'{name}: description missing')
    check(any(t=='link' and a.get('rel')=='canonical' for t,a in nodes),f'{name}: canonical missing')
    text=(DIST/name).read_text()
    schemas=re.findall(r'<script type="application/ld\+json">(.*?)</script>',text,re.S)
    check(len(schemas)==1,f'{name}: structured data missing')
    for schema in schemas:
        try:json.loads(schema)
        except ValueError:check(False,f'{name}: invalid JSON-LD')
    for tag,a in nodes:
        if tag=='a':
            check(a.get('href') or (a.get('id')=='email-draft' and 'hidden' in a),f'{name}: empty anchor')
            if a.get('target')=='_blank':check({'noopener','noreferrer'}<=set(a.get('rel','').split()),f'{name}: insecure external link')
        if tag=='img':
            check(bool(a.get('alt')),f'{name}: missing image alt')
            check(bool(a.get('width') and a.get('height')),f'{name}: image dimensions missing')
        if tag=='video':check(a.get('preload')=='none' and 'controls' in a,f'{name}: video preload or controls')
        for key in ['href','src','poster']:
            if key not in a:continue
            url=urlsplit(a[key])
            if url.scheme or url.netloc:continue
            path=(DIST/url.path.lstrip('/')) if url.path.startswith('/') else (DIST/name).parent/unquote(url.path)
            if not url.path:path=DIST/name
            path=path.resolve()
            check(path.is_relative_to(DIST.resolve()),f'{name}: path outside dist {a[key]}')
            check(path.is_file(),f'{name}: missing file {a[key]}')
            if url.fragment and path.suffix=='.html' and path.is_file():
                target=pages.get(path.relative_to(DIST).as_posix())
                check(target and any(b.get('id')==url.fragment for _,b in target.nodes),f'{name}: missing anchor {a[key]}')
        if 'srcset' in a:
            for candidate in a['srcset'].split(','):
                image_url=candidate.strip().split()[0]
                check(((DIST/name).parent/image_url).resolve().is_file(),f'{name}: missing srcset candidate')
    for tag,a in nodes:
        if tag in ['input','select','textarea']:
            check(any(t=='label' and b.get('for')==a.get('id') for t,b in nodes),f'{name}: control without label')
css=(DIST/'style.css').read_text()
for asset in re.findall(r'url\([\'"]?([^\)\'\"]+)',css):check((DIST/asset).is_file(),f'CSS asset missing: {asset}')
for f in (DIST/'assets/fonts').glob('*.woff2'):check(f.read_bytes()[:4]==b'wOF2',f'{f.name}: invalid WOFF2 header')
check('prefers-reduced-motion' in css,'Reduced motion support missing')
check(not (DIST/'CNAME').exists(),'CNAME must not be in dist')
check((ROOT/'CNAME').read_bytes()==b'smartdatavisions.com','Original root CNAME changed')
check((DIST/'sitemap.xml').is_file() and (DIST/'robots.txt').is_file(),'Crawl files missing')
check('connect-src \'none\'' in (DIST/'_headers').read_text(),'Expected static security headers')
for name in ['site.json','media.json']:json.loads((ROOT/'content'/name).read_text())
# Restricted pattern scan of shipped text assets, no credential values logged.
secret_pattern=re.compile(r'-----BEGIN (?:RSA |OPENSSH )?PRIVATE KEY-----|AIza[\w-]{30,}|gh[pousr]_[A-Za-z0-9]{30,}|sk-[A-Za-z0-9]{30,}')
for f in DIST.rglob('*'):
    if f.is_file() and f.suffix in ['.html','.js','.css','.json']:
        check(not secret_pattern.search(f.read_text()),f'{f.relative_to(DIST)}: possible provider secret')
# WCAG contrast calculations for core text/button pairings; does not replace a rendered audit.
def luminance(color):
    rgb=[int(color[i:i+2],16)/255 for i in (1,3,5)]
    rgb=[c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4 for c in rgb]
    return sum(c*w for c,w in zip(rgb,[.2126,.7152,.0722]))
ratios={}
for label,fg,bg in [('body','#203b32','#f7f8f2'),('muted','#5c6b62','#f7f8f2'),('muted on sage','#5c6b62','#e9eee1'),('dark CTA','#f7f8f2','#173c32'),('lime CTA','#173c32','#d8ecab'),('closing text','#c1d2c6','#173c32')]:
    a,b=sorted([luminance(fg),luminance(bg)]);ratio=(b+.05)/(a+.05);ratios[label]=round(ratio,2);check(ratio>=4.5,f'{label}: contrast {ratio:.2f}')
assets=['index.html','style.css','script.js','assets/fonts/manrope-latin.woff2','assets/fonts/instrument-serif-latin.woff2','assets/images/hotel-overview.webp']
metrics={'pages':len(pages),'deployment_bytes':sum(p.stat().st_size for p in DIST.rglob('*') if p.is_file()),'home_critical_raw_bytes':sum((DIST/p).stat().st_size for p in assets),'home_critical_gzip_bytes':sum(len(gzip.compress((DIST/p).read_bytes())) for p in assets),'optimized_image_bytes':sum(p.stat().st_size for p in (DIST/'assets/images').glob('*.webp')),'video_bytes':(DIST/'assets/hotel-walkthrough.mp4').stat().st_size,'core_text_contrast':ratios,'browser_qa':'not run: supported browser control tool unavailable','lighthouse':'not measured'}
(ROOT/'docs/static-metrics.json').write_text(json.dumps(metrics,indent=2)+'\n')
if errors:
    print('\n'.join('FAIL '+e for e in errors));sys.exit(1)
print(f'PASS: {len(pages)} pages; local links/fragments, image assets, metadata, labels, core contrast, build allowlist and CNAME preservation.')
print(json.dumps(metrics,indent=2))
