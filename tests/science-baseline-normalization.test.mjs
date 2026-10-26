import {execFileSync} from 'node:child_process';

execFileSync('python', ['-c', `from copy import deepcopy
from pathlib import Path
from lxml import html
import hashlib,json,sys
sys.path.insert(0, 'tests/helpers')
from science_html_baseline import restore_historical_missing_ci

root=html.fromstring(Path('dist/index.html').read_bytes())
baseline=json.loads(Path('tests/fixtures/home-v56-science-digests.json').read_text())
normalized=deepcopy(root)
restore_historical_missing_ci(normalized)
for section_id in ['supplement-collagen','supplement-citrulline']:
    section=normalized.xpath('//body/section[@id=$id]',id=section_id)[0]
    assert hashlib.sha256(html.tostring(section,encoding='utf-8')).hexdigest()==baseline[section_id]

# A genuine interval beginning with zero must never be rewritten.
caffeine='//*[@id="caffeine-source-SRC-000084"]//b'
before=[b.tail for b in root.xpath(caffeine)]
assert any(tail==' · 95% ДІ 0–0,34' for tail in before)
assert [b.tail for b in normalized.xpath(caffeine)]==before

# Changing an effect estimate or inventing another interval remains an error.
for field,value in [('text','9,99 '),('tail',' · 95% ДІ 1–2')]:
    changed=deepcopy(root)
    number=changed.xpath('//*[@id="collagen-source-SRC-000017"]//dd/p/b')[0]
    setattr(number,field,value)
    try:
        restore_historical_missing_ci(changed)
    except AssertionError:
        pass
    else:
        raise AssertionError('Historical comparison concealed changed result data')

# The full digest still detects unrelated scientific text changes.
changed=deepcopy(root)
section=changed.xpath('//body/section[@id="supplement-collagen"]')[0]
section.xpath('.//h1')[0].text='Unrelated change'
restore_historical_missing_ci(changed)
assert hashlib.sha256(html.tostring(section,encoding='utf-8')).hexdigest()!=baseline['supplement-collagen']
print('Historical comparison: four exact renderer corrections only; real intervals, estimates and other scientific text remain protected.')
`], {stdio:'inherit'});
