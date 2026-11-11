#!/usr/bin/env python3
"""Create a local review bundle without publishing or changing repository history."""
from pathlib import Path
import argparse, subprocess, shutil, zipfile, json, hashlib
ROOT=Path(__file__).resolve().parents[1]
parser=argparse.ArgumentParser()
parser.add_argument('--output',type=Path,required=True)
args=parser.parse_args();output=args.output.resolve();output.mkdir(parents=True,exist_ok=True)
review=output/'smartdatavisions-review'
if review.exists():shutil.rmtree(review)
review.mkdir();shutil.copytree(ROOT/'dist',review/'site');(review/'source').mkdir();(review/'before').mkdir()
files=subprocess.check_output(['git','ls-files','-z'],cwd=ROOT).decode().split('\0')
for file in filter(None,files):
    dest=review/'source'/file;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(ROOT/file,dest)
base='b5e6e7c'
for file in ['index.html','style.css','script.js','README.md']:
    data=subprocess.check_output(['git','show',base+':'+file],cwd=ROOT)
    if file=='index.html':
        text=data.decode()
        baseline=subprocess.check_output(['git','ls-tree','--name-only',base],cwd=ROOT).decode().splitlines()
        for asset in baseline:
            if Path(asset).suffix.lower() in ['.jpg','.jpeg','.png','.mp4']:
                text=text.replace('src="'+asset+'"','src="../source/'+asset+'"')
        data=text.encode()
    (review/'before'/file).write_bytes(data)
html='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>SmartDataVisions — local review</title><style>
*{box-sizing:border-box}body{font:14px/1.6 system-ui,sans-serif;margin:0;background:#e9ede7;color:#203b32}header{padding:22px 28px;background:#f7f8f2;border-bottom:1px solid #ccd6c7}h1{font-size:21px;line-height:1.3;margin:0 0 8px}p{margin:0}a{color:inherit;text-underline-offset:3px}nav{display:flex;flex-wrap:wrap;gap:15px;margin-top:13px;font-size:12px}.toolbar{display:flex;align-items:center;flex-wrap:wrap;gap:12px;padding:15px 28px;background:white;border-bottom:1px solid #ccd6c7}button,select{font:inherit;color:inherit;padding:10px 14px;border:1px solid #9ead96;border-radius:4px;background:white;cursor:pointer;min-height:44px}button[aria-pressed=true]{background:#173c32;color:white;border-color:#173c32}button:focus-visible,select:focus-visible,a:focus-visible{outline:3px solid #567a3a;outline-offset:3px}label{font-size:12px;margin-left:12px}.viewer{overflow:auto;padding:24px 16px 40px}iframe{border:1px solid #c6d2bf;background:#f7f8f2;display:block;width:100%;height:85vh;min-height:700px;margin:auto}small{font-size:11px;color:#56674f}.status{margin-left:auto}@media(max-width:650px){header{padding:20px}.toolbar{padding:15px 20px;gap:9px}label{margin-left:0}.status{margin-left:0;width:100%}.viewer{padding:15px 8px}}
</style></head><body><header><h1>SmartDataVisions — the redesign, ready to review</h1><p>Local review only. The live website, production branch, CNAME and DNS were not changed.</p><nav aria-label="Review documents"><a href="source/docs/HANDOFF.md">Start here</a><a href="source/docs/AUDIT.md">Audit</a><a href="source/docs/TEST-REPORT.md">Test report</a><a href="source/docs/OWNER-VERIFICATION.md">Owner verification</a><a href="source/docs/MIGRATION.md">Free hosting guide</a></nav></header><div class="toolbar"><div aria-label="Version"><button id="new" type="button" aria-pressed="true">Redesign</button> <button id="old" type="button" aria-pressed="false">Original</button></div><label for="width">Viewport width</label><select id="width"><option value="100%">Fit window</option><option value="1440px">Desktop · 1440</option><option value="1024px">Small desktop · 1024</option><option value="768px">Tablet · 768</option><option value="390px">Mobile · 390</option><option value="320px">Compact · 320</option></select><a id="full" href="site/index.html" target="_blank" rel="noopener noreferrer">Open full page ↗</a><small class="status">Browser screenshots and Lighthouse remain unverified.</small></div><div class="viewer"><iframe id="preview" src="site/index.html" title="Redesigned SmartDataVisions portfolio preview"></iframe></div><script>
const frame=document.getElementById('preview');const redesign=document.getElementById('new');const original=document.getElementById('old');const full=document.getElementById('full');
function show(old){frame.src=old?'before/index.html':'site/index.html';full.href=frame.getAttribute('src');frame.title=(old?'Original':'Redesigned')+' SmartDataVisions portfolio preview';redesign.setAttribute('aria-pressed',String(!old));original.setAttribute('aria-pressed',String(old));}
redesign.addEventListener('click',()=>show(false));original.addEventListener('click',()=>show(true));document.getElementById('width').addEventListener('change',event=>{frame.style.width=event.target.value;});
</script></body></html>'''
(review/'review.html').write_text(html+'\n')
(review/'START-HERE.txt').write_text('Extract the complete package, then open review.html. Or open site/index.html directly.\nSource, original assets, tests and all review reports are under source/.\nThis package is local only; no site was published. Browser QA and Lighthouse remain pending.\n')
for source, filename in [(review,'SmartDataVisions-review-package.zip'),(ROOT/'dist','SmartDataVisions-website.zip')]:
    with zipfile.ZipFile(output/filename,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
        for file in sorted(source.rglob('*')):
            if file.is_file():z.write(file,file.relative_to(source))
for file in ['HANDOFF.md','AUDIT.md','TEST-REPORT.md','OWNER-VERIFICATION.md','MIGRATION.md','BEFORE-AFTER.md']:
    shutil.copy2(ROOT/'docs'/file,output/file)
manifest={}
for f in output.glob('*.zip'):
    manifest[f.name]={'bytes':f.stat().st_size,'sha256':hashlib.sha256(f.read_bytes()).hexdigest()}
(output/'package-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps(manifest,indent=2));print('Review entry:',review/'review.html')
