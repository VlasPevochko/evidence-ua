import assert from 'node:assert/strict';
import {sendFeedback,FEEDBACK_ENDPOINT} from '../src/platform/feedback-send.mjs';
const ENDPOINT='https://example.invalid/feedback';
let call=null;
const ok=async(url,init)=>{call={url,init};return {ok:true,json:async()=>({success:'true'})};};
await sendFeedback('Текст відгуку',ok,ENDPOINT);
assert.equal(call.url,ENDPOINT);assert.equal(call.init.method,'POST');
const body=JSON.parse(call.init.body);assert.equal(body.message,'Текст відгуку');assert(body._subject.includes('Evidence UA'));
await assert.rejects(()=>sendFeedback('   ',ok,ENDPOINT),/Empty/);
await assert.rejects(()=>sendFeedback('x',async()=>({ok:false,json:async()=>({})}),ENDPOINT),/Send failed/);
await assert.rejects(()=>sendFeedback('x',async()=>({ok:true,json:async()=>({success:'false'})}),ENDPOINT),/Send failed/);
assert((await sendFeedback('x'.repeat(9000),ok,ENDPOINT),JSON.parse(call.init.body).message.length)===8000);
// Sending stays off by default and no personal address is committed.
assert.equal(FEEDBACK_ENDPOINT,'');
call=null;
await assert.rejects(()=>sendFeedback('x',ok),/not configured/);
assert.equal(call,null,'must not call the network when unconfigured');
console.log('feedback send: payload, empty text, failure handling and disabled-by-default passed.');
