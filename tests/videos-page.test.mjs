import assert from 'node:assert/strict';
import fs from 'node:fs';
import {classify,youtubeId,suggestionLink,cardModel,ISSUES_NEW,MAX_URL} from '../dist/videos-page.js';
import {VIDEOS} from '../dist/videos-data.js';
import {findMaterials} from '../src/platform/materials.mjs';

// Відео від читачів (рішення власника 2026-10-21): людина вставляє посилання, ми дивимось і публікуємо самі.
const html=fs.readFileSync('dist/videos.html','utf8'),js=fs.readFileSync('dist/videos-page.js','utf8'),css=fs.readFileSync('dist/videos-page.css','utf8');
assert.equal((html.match(/<h1\b/g)||[]).length,1);
assert(html.includes('data-pine')&&html.includes('data-motif="ajiro"')&&fs.readFileSync('dist/page-pine.css','utf8').includes('.pb[data-motif="ajiro"]'),'pine band with its own motif');
for(const f of fs.readdirSync('dist').filter(f=>f.endsWith('.html')&&f!=='videos.html'))assert(!fs.readFileSync('dist/'+f,'utf8').includes('data-motif="ajiro"'),`${f} must not reuse ajiro`);
assert.equal((html.match(/<header\b/g)||[]).length,1,'only the fallback header');
// The field says plainly what to paste.
assert(html.includes('for="vd-url"')&&html.includes('Посилання на відео (URL)'),'a labelled URL field');
assert(html.includes('type="url"')&&html.includes('placeholder="https://www.youtube.com/watch?v=…"'),'URL input with an example');
assert(html.includes('Вставте повну адресу сторінки з відео')&&html.includes('Копіювати посилання')&&html.includes('<b>https://</b>'),'the hint explains where to copy the address from');
assert(html.includes('>Запропонувати відео</button>'),'one clear button');
// Validation.
assert.equal(classify('').reason,'empty');
for(const [bad,reason] of [['hello','format'],['http://youtube.com/watch?v=aaaaaaaaaaa','scheme'],['https://a b.com','space'],['https://user:pw@youtube.com/x','creds'],['https://localhost/x','host'],['javascript:alert(1)','scheme'],['https://x.com/'+'a'.repeat(MAX_URL),'long']])assert.equal(classify(bad).reason,reason,bad);
assert.equal(classify('https://www.youtube.com/watch?v=dQw4w9WgXcQ').platform,'YouTube');
assert.equal(classify('https://youtu.be/dQw4w9WgXcQ').youtube,'dQw4w9WgXcQ');
assert.equal(classify('https://www.instagram.com/reel/abc/').platform,'Instagram');
assert.equal(classify('https://vm.tiktok.com/ZM123/').platform,'TikTok');
assert.equal(classify('https://vimeo.com/123').platform,'Vimeo');
assert.equal(classify('https://example.org/video').platform,'Інша платформа','other platforms are accepted for manual review');
assert.equal(youtubeId('https://www.youtube.com/shorts/dQw4w9WgXcQ'),'dQw4w9WgXcQ');
assert.equal(youtubeId('https://www.youtube.com/watch?v=short'),null,'a malformed id is not embedded');
assert.equal(youtubeId('https://evil.example/watch?v=dQw4w9WgXcQ'),null,'only YouTube hosts are embedded');
// The proposal link: GitHub new-issue page, prefilled, no personal data, no e-mail.
const info=classify('https://youtu.be/dQw4w9WgXcQ');
const link=suggestionLink(info,'  техніка   присіду ');
assert(link.startsWith(ISSUES_NEW+'?title='));
const q=new URL(link).searchParams;
assert(q.get('body').includes('Посилання: https://youtu.be/dQw4w9WgXcQ')&&q.get('body').includes('Чим корисне: техніка присіду'));
assert(!/@/.test(js+html),'no e-mail address anywhere');
assert(suggestionLink(info,'x'.repeat(500)).length<1800,'the prefilled link stays short');
// Library: empty until the owner approves something; every entry is checked.
assert(Array.isArray(VIDEOS));
for(const v of VIDEOS){assert(cardModel(v),`${v.title}: valid https link`);assert(v.title&&v.author&&v.added,`${v.title}: title, author and date`);}
assert.equal(cardModel({title:'t',url:'http://x.org'}),null);
assert.equal(cardModel({title:'t',url:'https://youtu.be/dQw4w9WgXcQ'}).embedId,'dQw4w9WgXcQ');
assert.equal(cardModel({title:'t',url:'https://www.tiktok.com/@a/video/1'}).embedId,null,'only YouTube is shown on the page');
// Privacy: the player is created only inside the click handler; the label is shown; nothing is requested on load.
assert(js.includes("play.addEventListener('click'")&&js.indexOf('youtube-nocookie')>js.indexOf("play.addEventListener('click'"),'the YouTube frame appears only after a click');
assert(js.includes('Матеріал від читача: не наукове джерело')&&js.includes('Після кліку відео завантажиться з YouTube'));
assert(!/fetch\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage/.test(js),'the page stores and sends nothing');
assert(js.includes("'noopener,noreferrer'")&&js.includes('rel=\'noopener noreferrer\'')||js.includes("a.rel='noopener noreferrer'"),'outgoing links are safe');
assert(css.includes('.vd-send')&&!/https?:\/\//.test(css),'no third-party requests in styles');
assert(html.includes('Не приймаємо')&&html.includes('Submit new issue')&&html.includes('Пропозиція буде публічною'),'moderation rules and the public nature are stated');
assert(findMaterials('відео').some(m=>m.href==='./videos.html'),'searchable');
assert(fs.readFileSync('dist/index.html','utf8').includes('<a href="./videos.html">Відео від читачів →</a>'),'linked from home');
assert(fs.existsSync('dist/og/videos.jpg'),'own share card');
console.log('Reader videos: URL field and hint, validation, GitHub proposal link, click-to-load player, honest rules passed.');
