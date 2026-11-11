#!/usr/bin/env python3
"""Verify the actual downloadable ZIP, including its source inventory and local references."""
from pathlib import Path, PurePosixPath
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import argparse,zipfile,hashlib,json,posixpath,subprocess
parser=argparse.ArgumentParser();parser.add_argument('archive',type=Path);args=parser.parse_args()
root=Path(__file__).resolve().parents[1]
required=['review.html','START-HERE.txt','site/index.html','site/services.html','site/work.html','site/about.html','site/contact.html','site/style.css','site/script.js','site/assets/hotel-walkthrough.mp4','source/content/site.json','source/content/media.json','source/scripts/build.py','source/tests/interactions.test.cjs','source/docs/AUDIT.md','source/docs/TEST-REPORT.md','source/docs/MIGRATION.md','source/docs/OWNER-VERIFICATION.md','before/index.html','before/style.css','before/script.js']
with zipfile.ZipFile(args.archive) as z:
    assert z.testzip() is None,'ZIP integrity/CRC failure'
    names=set(z.namelist())
    assert len(names)==len(z.namelist()),'Duplicate ZIP entries'
    assert all(not n.startswith('/') and '..' not in PurePosixPath(n).parts for n in names),'Unsafe ZIP path'
    assert all(n in names for n in required),'Missing required review file'
    assert not any('/node_modules/' in n or '/.git/' in n for n in names),'Dependency or Git state accidentally included'
    assert z.read('source/CNAME')==b'smartdatavisions.com','Original CNAME not preserved'
    source_files=subprocess.check_output(['git','ls-files','-z'],cwd=root).decode().split('\0')
    for file in filter(None,source_files):
        assert 'source/'+file in names,'Missing tracked source: '+file
        assert z.read('source/'+file)==(root/file).read_bytes(),'Source mismatch: '+file
    class Targets(HTMLParser):
        def __init__(self,file):super().__init__();self.file=file
        def handle_starttag(self,tag,attrs):
            for k,v in attrs:
                if k not in ['href','src','poster'] or not v:continue
                u=urlsplit(v)
                if u.scheme or u.netloc or not u.path:continue
                target=posixpath.normpath(('site/'+u.path.lstrip('/')) if u.path.startswith('/') else posixpath.join(posixpath.dirname(self.file),unquote(u.path)))
                assert target in names,f'{self.file}: missing {target}'
    for file in names:
        if file.endswith('.html') and (file.startswith('site/') or file.startswith('before/') or file=='review.html'):
            Targets(file).feed(z.read(file).decode())
    result={'archive':args.archive.name,'bytes':args.archive.stat().st_size,'sha256':hashlib.sha256(args.archive.read_bytes()).hexdigest(),'files':len(names),'case_studies':len([n for n in names if n.startswith('site/case-studies/') and n.endswith('.html')]),'tracked_source_files_verified':len(list(filter(None,source_files))),'zip_integrity':'passed','source_and_assets':'passed','local_review_targets':'passed'}
    if 'browser-qa/summary.json' in names:
        qa=json.loads(z.read('browser-qa/summary.json'));result['browser_qa']=qa['result'];result['screenshots']=len(qa['screenshots']);result['lighthouse']=qa['lighthouse']
args.archive.with_suffix('.verification.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
