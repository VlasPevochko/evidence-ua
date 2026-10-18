// Sends an already generated feedback text, only after the visitor presses the send button.
// Disabled until an endpoint is configured: do not commit a personal mailbox address here.
// To enable, set the FormSubmit alias URL (https://formsubmit.co/ajax/<random-alias>) below.
export const FEEDBACK_ENDPOINT='';
export async function sendFeedback(text,fetchImpl=globalThis.fetch,endpoint=FEEDBACK_ENDPOINT){
 if(!endpoint)throw Error('Feedback sending is not configured');
 const message=String(text||'').trim().slice(0,8000);
 if(!message)throw Error('Empty feedback');
 const response=await fetchImpl(endpoint,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({_subject:'Evidence UA · відгук із сайту',message})});
 const data=await response.json().catch(()=>({}));
 if(!response.ok||data.success===false||data.success==='false')throw Error('Send failed');
 return data;
}
export function mountFeedbackSend(root=document){
 const output=root.querySelector('#home-feedback-output'),copy=root.querySelector('#home-feedback-copy'),text=root.querySelector('#home-feedback-text'),status=root.querySelector('#home-feedback-status'),form=root.querySelector('#home-feedback-form');
 if(!FEEDBACK_ENDPOINT||!output||!copy||!text||!status)return;
 const button=root.createElement?root.createElement('button'):null;if(!button)return;
 button.type='button';button.id='home-feedback-send';button.textContent='Надіслати на пошту проєкту';
 output.insertBefore(button,copy);
 const reset=()=>{button.disabled=false;button.textContent='Надіслати на пошту проєкту';};
 const send=async()=>{
  button.disabled=true;status.textContent='Надсилаємо…';
  try{await sendFeedback(text.value);status.textContent='Надіслано. Дякуємо за відгук!';button.textContent='Надіслано';}
  catch{status.textContent='Не вдалося надіслати. Скопіюйте текст і передайте його вручну.';reset();}
 };
 button.addEventListener('click',send);
 form?.addEventListener('input',reset);form?.addEventListener('change',reset);
 return ()=>{button.removeEventListener('click',send);form?.removeEventListener('input',reset);form?.removeEventListener('change',reset);button.remove?.();};
}
if(typeof document!=='undefined')mountFeedbackSend();
