// Відео від читачів: форма пропозиції (відкриває заявку на GitHub після кліку) і список схвалених відео.
import {VIDEOS} from './videos-data.js?v=1';

// Заявки приймаються як GitHub Issues; адреса пошти не потрібна. Змінити канал можна тут.
export const ISSUES_NEW='https://github.com/VlasPevochko/evidence-ua/issues/new';
export const MAX_URL=300,MAX_NOTE=200,MAX_AUTHOR=80;
// Адреса форми-посередника. Порожня: працює заявка через GitHub. Коли власник створить форму в сервісі Formspree
// (пошта підтверджується там, а не в коді), сюди вставляється лише її адреса виду https://formspree.io/f/xxxxxxxx.
export const FORM_ENDPOINT='';
export const validEndpoint=e=>/^https:\/\/formspree\.io\/f\/[A-Za-z0-9]{6,20}$/.test(String(e||''));
const tidy=(v,max)=>String(v||'').replace(/\s+/g,' ').trim().slice(0,max);
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
export function suggestionLink(info,note='',author=''){
  const cleanNote=tidy(note,MAX_NOTE),cleanAuthor=tidy(author,MAX_AUTHOR);
  const title=`Відео від читача: ${info.platform}`;
  const body=[`Посилання: ${info.url}`,`Платформа: ${info.platform}`,`Автор відео: ${cleanAuthor||'не вказано'}`,cleanNote?`Чим корисне: ${cleanNote}`:'Чим корисне: не вказано','','Пропозиція з сторінки «Відео від читачів». Особистих даних тут не вказуйте.'].join('\n');
  return ISSUES_NEW+'?title='+encodeURIComponent(title)+'&body='+encodeURIComponent(body);
}
// Надсилання через форму-посередника. Викликається лише після кліку; «_gotcha» — пастка для ботів (людина її не бачить).
export async function sendProposal(endpoint,info,fields,fetchImpl=globalThis.fetch){
  if(!validEndpoint(endpoint))return {ok:false,reason:'endpoint'};
  if(fields.trap)return {ok:true,skipped:true};
  const body={url:info.url,platform:info.platform,author:tidy(fields.author,MAX_AUTHOR),note:tidy(fields.note,MAX_NOTE)};
  try{
    const res=await fetchImpl(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(body),referrerPolicy:'no-referrer',credentials:'omit'});
    return res.ok?{ok:true}:{ok:false,reason:'status',status:res.status};
  }catch{return {ok:false,reason:'network'};}
}
// Модель картки: YouTube можна показати на сторінці після кліку, решту лише посиланням.
export function cardModel(video){
  const info=classify(video.url);
  if(!info.ok)return null;
  return {title:video.title,author:video.author,note:video.note,url:info.url,platform:info.platform,embedId:info.youtube,added:video.added};
}

export function mountForm(root=document){
  const form=root.getElementById('vd-form');if(!form)return;
  const url=root.getElementById('vd-url'),note=root.getElementById('vd-note'),author=root.getElementById('vd-author'),trap=root.getElementById('vd-trap'),state=root.getElementById('vd-state'),after=root.getElementById('vd-after'),send=form.querySelector('.vd-send');
  const viaForm=validEndpoint(FORM_ENDPOINT);
  const via=root.getElementById('vd-via'),privForm=root.getElementById('vd-priv-form'),privGit=root.getElementById('vd-priv-git');
  if(via)via.hidden=!viaForm;if(privForm)privForm.hidden=!viaForm;if(privGit)privGit.hidden=viaForm;
  const show=()=>{
    const info=classify(url.value);
    url.setAttribute('aria-invalid',String(!info.ok&&info.reason!=='empty'));
    state.className='vd-state'+(info.ok?' is-ok':info.reason==='empty'?'':' is-bad');
    state.textContent=info.ok?`Посилання виглядає правильно: ${info.platform}.`:info.reason==='empty'?'':info.message;
    return info;
  };
  const githubLink=(info)=>{const a=root.createElement('a');a.href=suggestionLink(info,note.value,author.value);a.target='_blank';a.rel='noopener noreferrer';a.textContent='запропонувати через GitHub';return a;};
  url.addEventListener('input',()=>{after.hidden=true;show();});
  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const info=show();
    if(!info.ok){if(info.reason==='empty'){state.className='vd-state is-bad';state.textContent='Вставте посилання на відео в поле вище.';}url.focus();return;}
    after.hidden=false;after.textContent='';
    if(viaForm){
      send.disabled=true;after.textContent='Надсилаємо…';
      const res=await sendProposal(FORM_ENDPOINT,info,{note:note.value,author:author.value,trap:trap?.value},root.defaultView?.fetch?.bind(root.defaultView));
      send.disabled=false;
      if(res.ok){after.textContent='Дякуємо! Посилання надійшло. Ми подивимось і, якщо відео підходить, додамо його в бібліотеку.';url.value='';note.value='';if(author)author.value='';state.textContent='';state.className='vd-state';}
      else{after.textContent='Не вдалося надіслати. Спробуйте ще раз або ';after.append(githubLink(info),'.');}
      return;
    }
    const href=suggestionLink(info,note.value,author.value);
    const view=root.defaultView;
    if(view&&typeof view.open==='function')view.open(href,'_blank','noopener,noreferrer');
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
