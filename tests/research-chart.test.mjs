import assert from 'node:assert/strict';
import fs from 'node:fs';
import {STUDIES} from '../dist/research-data.js';
import {chartGeometry,fmt,crossesNull,isRatio,niceStep} from '../dist/research-chart.js';

// Інтервальні графіки в розборах (рішення власника 2026-10-27, «графіки»): лише числа з анотацій, чесна вісь, інтервал не губиться.
const withChart=STUDIES.filter(s=>s.chart);
assert(withChart.length>=5,'five write-ups have a chart');
for(const s of withChart){
  const c=s.chart,g=chartGeometry(c);
  assert(c.rows.length>=2,`${s.id}: a chart has at least two rows (a single number stays text)`);
  for(const r of g.rows){
    assert(r.lo<=r.v&&r.v<=r.hi,`${s.id}/${r.label}: the estimate lies inside its interval`);
    assert(r.pLo>=0&&r.pHi<=100&&r.pLo<=r.p&&r.p<=r.pHi,`${s.id}/${r.label}: marks stay on the axis`);
    assert.equal(r.crosses,crossesNull(r,c.null));
  }
  assert(g.nullPos>0&&g.nullPos<100,`${s.id}: the no-difference line is on the axis`);
  assert(g.ticks.some(t=>t.v===c.null),`${s.id}: the no-difference line has its label`);
  const ps=g.ticks.map(t=>t.p);for(let i=1;i<ps.length;i++)assert(ps[i]-ps[i-1]>=13.9,`${s.id}: axis labels do not collide`);
  // Число в графіку збігається з числом у тексті картки (перший ряд).
  const first=c.rows[0];assert(s.found.includes(fmt(first.v)),`${s.id}: the first chart value ${fmt(first.v)} is stated in the text`);
}
// Відношення на логарифмічній осі: 0,5 і 2 стоять симетрично відносно лінії «немає різниці».
{const g=chartGeometry({null:1,rows:[{label:'a',v:2,lo:0.5,hi:2}, {label:'b',v:0.5,lo:0.5,hi:2}]});const a=g.rows[0],b=g.rows[1];assert(Math.abs((g.nullPos-b.p)-(a.p-g.nullPos))<0.05,'ratios are symmetric on the log axis');}
assert(isRatio({null:1})&&!isRatio({null:0}));
// Ключові чесні висновки видно на графіках.
const crossing=id=>chartGeometry(STUDIES.find(s=>s.id===id).chart).rows.filter(r=>r.crosses).length;
assert.equal(crossing('dash-vs-others'),2,'DASH: both intervals cross the no-difference line');
assert.equal(crossing('steps'),1,'steps: cancer incidence crosses the line');
assert.equal(crossing('coffee')+crossing('short-sleep-weight')+crossing('sweeteners'),0,'the other charts show only differences whose interval excludes the line');
assert.equal(fmt(0.9),'0,90');assert.equal(fmt(-1.54),'−1,54');assert.equal(niceStep(8),2);
// Підписи графіка текстом; рух вимикається; марки не менші за 8 px.
const css=fs.readFileSync('dist/research-page.css','utf8'),js=fs.readFileSync('dist/research-chart.js','utf8');
assert(css.includes('prefers-reduced-motion')&&css.includes('.rs-cdot{top:4px;width:16px'),'reduced motion is honoured and the marker is large enough');
assert(!/<text|createElementNS/.test(js),'labels are HTML text, not text inside SVG');
assert(js.includes("setAttribute('role','list')")&&js.includes('row.title='),'rows are a list with a text title');
console.log('Research charts: values inside intervals, log axis for ratios, honest crossings, aligned labels, reduced motion passed.');
