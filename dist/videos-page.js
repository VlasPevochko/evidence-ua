// Відео від читачів: форма пропозиції (відкриває заявку на GitHub після кліку) і список схвалених відео.
import {VIDEOS} from './videos-data.js?v=1';

// Заявки приймаються як GitHub Issues; адреса пошти не потрібна. Змінити канал можна тут.
export const ISSUES_NEW='https://github.com/VlasPevochko/evidence-ua/issues/new';
export const MAX_URL=300,MAX_NOTE=200;
const PLATFORMS=[['YouTube',/^(?:www\.|m\.)?youtube\.com$|^youtu\.be$/],['Instagram',/^(?:www\.)?instagram\.com$/],['TikTok',/^(?:www\.|m\.|vm\.|vt\.)?tiktok\.com$/],['Vimeo',/^(?:www\.|player\.)?vimeo\.com$/],['Facebook',/^(?:www\.|m\.)?facebook\.com$|^fb\.watch$/]];

export function youtubeId(url){
  try{
    const u=new URL(url),host=u.hostname.replace(/^www\.|^m\./,'');
    let id=null;
    if(host==='youtu.be')id=u.pathname.slice(1).split('/')[0];
    else if(host==='youtube.com'){
      if(u.pathname==='/watch')id=u.searchParams.get('v');
      else{const m=u.pathname.match(/^\/(?:shorts|embed|live)\/([^/?#]+)/);if(m)id=m[1];}
    }
    return id&&/^[A-Za-z0-9_-]{11}$/.test(id)?id:null;
  }catch{return null;}
}
// Перевірка того, що вставила людина: лише https, без паролів у адресі, відома платформа або «інша».
export function classify(raw){
  const text=String(raw||'').trim();
  if(!text)return {ok:false,reason:'empty'};
  if(text.length>MAX_URL)return {ok:false,reason:'long',message:'Посилання задовге. Вставте коротку адресу сторінки з відео.'};
  if(/\s/.test(text))return {ok:false,reason:'space',message:'У посиланні не має бути пробілів. Скопіюйте його повністю з адресного рядка.'};
  let u;try{u=new URL(text);}catch{return {ok:false,reason:'format',message:'Це не схоже на посилання. Воно має починатися з https://'};}
  if(u.protocol!=='https:')return {ok:false,reason:'scheme',message:'Потрібне посилання, що починається з https://'};
  if(u.username||u.password)return {ok:false,reason:'creds',message:'У посиланні не має бути логіну чи пароля.'};
  if(!/\.[a-z]{2,}$/i.test(u.hostname))return {ok:false,reason:'host',message:'Це не схоже на адресу сайту. Скопіюйте посилання з адресного рядка.'};
  const known=PLATFORMS.find(([,re])=>re.test(u.hostname));
  return {ok:true,url:u.href,host:u.hostname,platform:known?known[0]:'Інша платформа',youtube:youtubeId(u.href)};
}
// Текст заявки. Особистих даних тут немає: лише те, що людина сама вставила.
export function suggestionLink(info,note=''){
  const cleanNote=String(note||'').replace(/\s+/g,' ').trim().slice(0,MAX_NOTE);
  const title=`Відео від читача: ${info.platform}`;
  const body=[`Посилання: ${info.url}`,`Платформа: ${info.platform}`,cleanNote?`Чим корисне: ${cleanNote}`:'Чим корисне: не вказано','','Пропозиція з сторінки «Відео від читачів». Особистих даних тут не вказуйте.'].join('\n');
  return ISSUES_NEW+'?title='+encodeURIComponent(title)+'&body='+encodeURIComponent(body);
}
// Модель картки: YouTube можна показати на сторінці після кліку, решту лише посиланням.
export function cardModel(video){
  const info=classify(video.url);
  if(!info.ok)return null;
  return {title:video.title,author:video.author,note:video.note,url:info.url,platform:info.platform,embedId:info.youtube,added:video.added};
}

export function mountForm(root=document){
  const form=root.getElementById('vd-form');if(!form)return;
  const url=root.getElementById('vd-url'),note=root.getElementById('vd-note'),state=root.getElementById('vd-state'),after=root.getElementById('vd-after');
  const show=()=>{
    const info=classify(url.value);
    url.setAttribute('aria-invalid',String(!info.ok&&info.reason!=='empty'));
    state.className='vd-state'+(info.ok?' is-ok':info.reason==='empty'?'':' is-bad');
    state.textContent=info.ok?`Посилання виглядає правильно: ${info.platform}.`:info.reason==='empty'?'':info.message;
    return info;
  };
  url.addEventListener('input',()=>{after.hidden=true;show();});
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const info=show();
    if(!info.ok){if(info.reason==='empty'){state.className='vd-state is-bad';state.textContent='Вставте посилання на відео в поле вище.';}url.focus();return;}
    const href=suggestionLink(info,note.value);
    const view=root.defaultView;
    if(view&&typeof view.open==='function')view.open(href,'_blank','noopener,noreferrer');
    after.hidden=false;after.textContent='';
    const a=root.createElement('a');a.href=href;a.target='_blank';a.rel='noopener noreferrer';a.textContent='відкрийте сторінку вручну';
    after.append('Відкрилась сторінка GitHub із готовим текстом: там натисніть «Submit new issue». Якщо вкладка не відкрилась, ',a,'.');
  });
}

export function renderList(root=document,videos=VIDEOS){
  const list=root.getElementById('vd-list');if(!list)return;
  const make=(tag,cls,text)=>{const n=root.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
  const cards=videos.map(cardModel).filter(Boolean);
  if(!cards.length){list.append(make('p','vd-empty','Поки що схвалених відео немає. Перші з’являться після перегляду пропозицій.'));return;}
  const ul=make('ul','vd-cards');
  for(const c of cards){
    const li=make('li','vd-card');
    li.append(make('span','vd-tag','Матеріал від читача: не наукове джерело'),make('h3','',c.title),make('p','vd-meta',`${c.platform}${c.author?' · Автор: '+c.author:''}`));
    if(c.note)li.append(make('p','vd-note',c.note));
    if(c.embedId){
      const play=make('button','vd-play','Відтворити тут');play.type='button';
      const hint=make('p','vd-hint','Після кліку відео завантажиться з YouTube.');
      play.addEventListener('click',()=>{
        const f=root.createElement('iframe');
        f.src='https://www.youtube-nocookie.com/embed/'+c.embedId+'?autoplay=1&rel=0';
        f.title=c.title;f.allow='autoplay; encrypted-media; picture-in-picture';f.allowFullscreen=true;f.referrerPolicy='strict-origin-when-cross-origin';f.className='vd-frame';
        play.replaceWith(f);hint.remove();
      });
      li.append(play,hint);
    }
    const a=make('a','vd-open',`Дивитися на ${c.platform} ↗`);a.href=c.url;a.target='_blank';a.rel='noopener noreferrer';li.append(a);
    ul.append(li);
  }
  list.append(ul);
}
if(typeof document!=='undefined'){mountForm();renderList();}
