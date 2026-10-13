import test from 'node:test';
import assert from 'node:assert/strict';
import {sources,organelles,cellKnowledge} from '../src/cell-lab/module.mjs';
const api=await import('../src/cell-lab/sources.mjs').catch(error=>{if(error.code==='ERR_MODULE_NOT_FOUND')return {};throw error;});
const cards=html=>[...html.matchAll(/<article\b[^>]*id="source-([^"]+)"[^>]*>([\s\S]*?)<\/article>/g)].map(match=>({id:match[1],html:match[2]}));
const text=html=>html.replace(/<[^>]*>/g,'');
const expected=[
 {id:'SRC-CELL-TEXT-001',topic:'Органели та цитоскелет',chapter:'3.2',count:'8 структур',structures:['ORG-MITOCHONDRION','ORG-RIBOSOME','ORG-ROUGH-ER','ORG-SMOOTH-ER','ORG-GOLGI','ORG-LYSOSOME','ORG-PEROXISOME','STRUCT-CYTOSKELETON']},
 {id:'SRC-CELL-TEXT-002',topic:'Ядро та ядерце',chapter:'3.3',count:'2 структури',structures:['ORG-NUCLEUS','ORG-NUCLEOLUS']},
 {id:'SRC-CELL-TEXT-003',topic:'Мембрана та обмін',chapter:'3.1',count:'1 структура',structures:['STRUCT-PLASMA-MEMBRANE']}
];

test('source cards map each of the eleven structures exactly once to its canonical chapter',()=>{
 assert.equal(typeof api.renderCellSources,'function','The Cell sources renderer is missing');
 const before=JSON.stringify({sources,organelles,records:cellKnowledge.records}),html=api.renderCellSources(),rendered=cards(html);
 assert.deepEqual(rendered.map(card=>card.id),expected.map(card=>card.id));
 const mapped=[];
 for(const [index,want] of expected.entries()){
  const card=rendered[index],buttons=[...card.html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)];
  assert(text(card.html).includes(want.topic));assert(text(card.html).includes('Розділ '+want.chapter));assert(text(card.html).includes(want.count));
  const ids=buttons.map(match=>match[1].match(/data-organelle="([^"]+)"/)?.[1]);assert.deepEqual(ids,want.structures);mapped.push(...ids);
  for(const match of buttons){const id=match[1].match(/data-organelle="([^"]+)"/)[1];assert.equal(text(match[2]),organelles.find(o=>o.id===id).label);assert(match[1].includes('type="button"'));assert(match[1].includes('data-source-jump="true"'));assert(match[1].includes('aria-controls="organelle-panel"'));assert(match[1].includes('aria-pressed="false"'));}
 }
 assert.equal(mapped.length,11);assert.equal(new Set(mapped).size,11);assert.deepEqual([...mapped].sort(),organelles.map(o=>o.id).sort());
 assert.equal(JSON.stringify({sources,organelles,records:cellKnowledge.records}),before,'Rendering must not alter the scientific data');
});

test('each card retains its exact scope and every associated description and extraction locator',()=>{
 assert.equal(typeof api.renderCellSources,'function');
 const rendered=cards(api.renderCellSources());
 for(const card of rendered){
  const source=sources.find(s=>s.id===card.id),visible=text(card.html);
  assert(visible.includes(source.shortCitation));assert(visible.includes(String(source.year)));assert(visible.includes(source.scope));
  const details=card.html.match(/<details\b[^>]*>([\s\S]*?)<\/details>/)?.[1];assert(details,'Explanations belong in a disclosure below the compact card');assert(!card.html.match(/<details\b[^>]*\bopen\b/));assert(text(details).includes(source.title));
  const records=[...details.matchAll(/<div class="cell-source-record">([\s\S]*?)<\/div>/g)].map(match=>text(match[1]));
  const canonical=cellKnowledge.records.filter(r=>r.sourceId===source.id);assert.equal(records.length,canonical.length);
  for(const record of canonical){assert.equal(records.filter(block=>block.includes(record.outcome.name)&&block.includes(record.result.summary)&&block.includes(record.extractionLocator)).length,1);}
  for(const limitation of source.keyLimitations)assert(text(details).includes(limitation));
 }
});

test('source disclosures remain pending and chapter links open securely with topic labels',()=>{
 assert.equal(typeof api.renderCellSources,'function');
 const rendered=cards(api.renderCellSources());
 for(const [index,card] of rendered.entries()){
  const source=sources[index],visible=text(card.html);
  assert(visible.includes('Пояснення та перевірка джерела'));assert(visible.includes('Статус публікації ще не перевірено.'));
  assert(visible.includes('Фінансування: ще не перевірено за повним текстом.'));assert(visible.includes('Конфлікти інтересів: ще не перевірено за повним текстом.'));
  assert(visible.includes('Перевірка метаданих: '+source.lastChecked));assert(visible.includes('Науковий перегляд пояснень не завершено.'));
  const link=[...card.html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].find(match=>match[1].includes(`href="${source.url}"`));assert(link,'The canonical chapter URL must remain accessible');
  assert.equal(text(link[2]),'Відкрити розділ');assert(link[1].includes('target="_blank"'));assert(link[1].includes('rel="noopener noreferrer"'));assert(link[1].includes(`aria-label="Відкрити розділ: ${expected[index].topic}"`));
  assert(!/Науковий перегляд[^<]*2026-10-11|GRADE|HIGH|Науково перевірено/.test(card.html));
 }
});

test('rendered source data, structure labels, descriptive records and URLs are HTML escaped',()=>{
 assert.equal(typeof api.renderCellSources,'function');
 const source=sources[0],organelle=organelles.find(o=>o.id==='ORG-MITOCHONDRION'),record=cellKnowledge.records.find(r=>r.sourceId===source.id);
 const savedSource={...source},savedOrganelle={...organelle},savedRecord={...record};
 try{
  source.title='<em>A&B "chapter"</em>';source.scope='<scope>';source.shortCitation="Book's & citation";source.url='https://example.test/?a=1&next="<chapter>"';source.keyLimitations=['<limit> & "note"'];source.lastChecked='<metadata>';
  organelle.label='<label>';record.outcome={name:'<outcome>'};record.result={summary:'<result> & "description"'};record.extractionLocator='<locator>';
  const html=api.renderCellSources();
  for(const escaped of ['&lt;em&gt;A&amp;B &quot;chapter&quot;&lt;/em&gt;','&lt;scope&gt;','Book&#39;s &amp; citation','href="https://example.test/?a=1&amp;next=&quot;&lt;chapter&gt;&quot;"','&lt;limit&gt; &amp; &quot;note&quot;','&lt;metadata&gt;','&lt;label&gt;','&lt;outcome&gt;','&lt;result&gt; &amp; &quot;description&quot;','&lt;locator&gt;'])assert(html.includes(escaped),'Missing escaped value: '+escaped);
  assert(!html.includes('<em>'));assert(!html.includes('<scope>'));assert(!html.includes('<label>'));assert(!html.includes('<result>'));assert(!html.includes('<locator>'));
 }finally{Object.assign(source,savedSource);Object.assign(organelle,savedOrganelle);Object.assign(record,savedRecord);}
});
