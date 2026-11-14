import assert from 'node:assert/strict';
import {decodePng} from './lens-pixels.mjs';
import {glyphContrast} from './glyph-contrast.mjs';

// The same runner can capture unchanged main before the feature exists.
export async function atlasFoundationsFlow(browser,origin,viewport,{open,artifact,baseline=false}={}){
 const cases=[
  {zone:'brain',names:['Великі півкулі та кора','Мозочок','Стовбур мозку','Гіпоталамус']},
  {zone:'gut',names:['Рот','Стравохід','Шлунок','Тонка кишка','Товста кишка','Пряма кишка']}
 ];
 for(const {zone,names} of cases){
  const {context,page,seen}=await open(browser,origin,viewport,'/atlas.html?zone='+zone);
  try{
   await page.locator('#atlas-detail').scrollIntoViewIfNeeded();
   if(baseline){
    await artifact(page,viewport,'before-'+zone,page.locator('#atlas-detail'));
    console.log('Atlas baseline '+zone+' @'+viewport.name+': '+JSON.stringify(await page.evaluate(()=>({height:document.documentElement.scrollHeight,width:innerWidth,title:document.querySelector('#atlas-zone-title').textContent}))));
    continue;
   }
   assert.equal(await page.locator('#atlas-zone-status').innerText(),'Бета',zone+': actual educational content is beta');
   assert.deepEqual(await page.locator('[data-atlas-tab]:visible').allTextContents(),['Огляд','Анатомія','Джерела'],zone+': exactly three nonempty tabs');
   await page.locator('[data-atlas-tab="anatomy"]').click();
   const root=page.locator('[data-foundation-root="'+zone+'"]');
   await root.locator('[data-foundation-choice]:not([disabled])').first().waitFor({state:'visible'});
   const buttons=root.locator('[data-foundation-choice]');
   assert.equal(await buttons.count(),names.length);
   for(let i=0;i<names.length;i++){
    await buttons.nth(i).click();
    assert.equal(await buttons.nth(i).getAttribute('aria-pressed'),'true');
    assert.equal(await root.locator('[data-foundation-part]:visible').count(),1,'exactly the chosen explanation is visible');
    assert.equal(await root.locator('[data-foundation-selection]').innerText(),'Обрано: '+names[i],'selected state is announced without a numeric prefix');
    assert.equal(await root.locator('[data-foundation-part]:visible h3').innerText(),names[i]);
   }
   await buttons.first().click();
   await artifact(page,viewport,'after-'+zone+'-anatomy',page.locator('#atlas-detail'));
   // Real keyboard selection and retained anatomy state across tab changes.
   await buttons.first().focus();await page.keyboard.press('End');
   assert.equal(await buttons.last().getAttribute('aria-pressed'),'true');
   assert.equal(await buttons.last().evaluate(e=>e===document.activeElement),true);
   await page.keyboard.press('ArrowRight');
   assert.equal(await buttons.first().getAttribute('aria-pressed'),'true');
   await page.keyboard.press('ArrowDown');
   await page.locator('[data-atlas-tab="overview"]').click();
   await page.locator('[data-atlas-tab="anatomy"]').click();
   await buttons.nth(1).waitFor({state:'visible'});
   await page.waitForFunction(z=>document.querySelector('[data-foundation-root="'+z+'"]')?.dataset.foundationReady==='true',zone);
   assert.equal(await buttons.nth(1).getAttribute('aria-pressed'),'true','anatomy selection survives tab switches');
   await page.emulateMedia({media:'print'});
   assert.equal(await root.locator('[data-foundation-part]:visible').count(),names.length,'all anatomy explanations print');
   assert.equal(await root.locator('.af-diagram-key li:visible').count(),names.length+(zone==='gut'?3:0),'every printed silhouette keeps its HTML name');
   await page.emulateMedia({media:'screen'});
   await page.locator('[data-atlas-tab="research"]').click();
   assert.equal(await page.locator('#atlas-breadcrumb-tab').innerText(),'Джерела');
   assert.ok((await page.title()).includes('Джерела'));
   assert.ok(new URL(page.url()).searchParams.get('tab')==='research');
   assert.match(await page.locator('#atlas-content').innerText(),/Незалежний науковий перегляд не завершено/);
   if(zone==='gut'){
    await page.emulateMedia({media:'print'});
    assert.equal(await page.locator('[data-claim-id]:visible').count(),4,'closed source disclosure prints all borrowed physiology');
    await page.emulateMedia({media:'screen'});
   }
   await page.locator('[data-zone="'+(zone==='brain'?'gut':'brain')+'"]').click();
   await page.goBack();
   assert.equal(new URL(page.url()).searchParams.get('zone'),zone);
   assert.equal(await page.locator('#atlas-breadcrumb-tab').innerText(),'Джерела');
   assert.equal(seen.pageErrors.length,0);
   assert.equal(seen.badResponses.length,0);
   assert.equal(seen.external.length,0);
  }finally{await context.close();}
 }
 if(!baseline){
  await foundationsAppearance(browser,origin,viewport,{open,artifact});
  await foundationsFallbacks(browser,origin,viewport,{open});
 }
}

async function textContrast(page,locator){
 await locator.scrollIntoViewIfNeeded();
 const box=await locator.boundingBox(),scale=await page.evaluate(()=>devicePixelRatio);
 const withText=decodePng(await page.screenshot());
 const style=await locator.getAttribute('style');
 await locator.evaluate(e=>e.style.setProperty('color','transparent','important'));
 const withoutText=decodePng(await page.screenshot());
 await locator.evaluate((e,old)=>old===null?e.removeAttribute('style'):e.setAttribute('style',old),style);
 return glyphContrast(withText,withoutText,{x:box.x*scale,y:box.y*scale,width:box.width*scale,height:box.height*scale});
}
async function foundationsAppearance(browser,origin,viewport,{open,artifact}){
 for(const palette of ['cosmic','green'])for(const theme of ['dark','light']){
  const {context,page,seen}=await open(browser,origin,viewport,'/atlas.html?zone=gut&tab=anatomy',{
   initScript:({palette,theme})=>localStorage.setItem('eua-appearance-v1',JSON.stringify({theme,palette,text:'md'})),
   initArg:{palette,theme},contextOptions:{reducedMotion:'reduce',...(viewport.width<600?{hasTouch:true,isMobile:true}:{})}
  });
  try{
   const root=page.locator('[data-foundation-root="gut"]');
   await root.locator('[data-foundation-choice]:not([disabled])').first().waitFor();
   assert.equal(await page.locator('html').getAttribute('data-palette')||'cosmic',palette);
   assert.equal(await page.locator('html').getAttribute('data-theme')||'dark',theme);
   const geometry=await root.locator('button').evaluateAll(nodes=>nodes.map(b=>({text:b.textContent,width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height,font:parseFloat(getComputedStyle(b).fontSize)})));
   assert.ok(geometry.every(b=>b.width>=44&&b.height>=44&&b.font>=12),JSON.stringify(geometry));
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no horizontal overflow');
   for(const target of [root.locator('[data-foundation-selection]'),root.locator('[data-foundation-part]:visible>p').first()]){
    const contrast=await textContrast(page,target);
    assert.ok(contrast&&contrast.median>=4.5,palette+'/'+theme+' readable painted text '+JSON.stringify(contrast));
   }
   assert.equal(await root.locator('.af-shape').first().evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
   await root.locator('[data-foundation-choice]').last().click();
   await artifact(page,viewport,'after-gut-'+palette+'-'+theme,page.locator('#atlas-detail'));
   console.log('Atlas foundations '+palette+'/'+theme+' @'+viewport.name+': '+JSON.stringify(await page.evaluate(()=>({height:document.documentElement.scrollHeight,width:innerWidth}))));
   assert.equal(seen.pageErrors.length,0);assert.equal(seen.external.length,0);
  }finally{await context.close();}
 }
}
async function foundationsFallbacks(browser,origin,viewport,{open}){
 // Optional controller failure leaves every source-backed explanation readable.
 const failed=await open(browser,origin,viewport,'/atlas.html?zone=gut');
 try{
  await failed.page.route('**/atlas-foundations.js?*',route=>route.abort());
  await failed.page.locator('[data-atlas-tab="anatomy"]').click();
  const root=failed.page.locator('[data-foundation-root="gut"]');
  await failed.page.waitForFunction(()=>document.querySelector('[data-foundation-selection]')?.textContent.includes('не завантажився'));
  assert.equal(await root.locator('[data-foundation-part]:visible').count(),6);
  assert.equal(await root.locator('button:disabled').count(),6);
  for(const zone of ['shoulder','knee','spine','muscles']){
   for(const selector of ['[data-shoulder-return]','[data-knee-return]']){const back=failed.page.locator(selector).first();if(await back.count()&&await back.isVisible())await back.click();}
   await failed.page.locator('[data-zone="'+zone+'"]').click();
   assert.equal(await failed.page.locator('#atlas-detail').getAttribute('data-zone-art'),zone);
   assert.ok((await failed.page.locator('#atlas-content').innerText()).length>100);
  }
  assert.equal(failed.seen.pageErrors.length,0);
 }finally{await failed.context.close();}
 // Delayed import cannot enhance a detached panel or write into another zone.
 const stale=await open(browser,origin,viewport,'/atlas.html?zone=brain');
 try{
  let release;
  await stale.page.route('**/atlas-foundations.js?*',route=>new Promise(resolve=>{release=async()=>{await route.continue();resolve();};}));
  await stale.page.locator('[data-atlas-tab="anatomy"]').click();
  for(let i=0;i<30&&!release;i++)await stale.page.waitForTimeout(20);
  assert.equal(typeof release,'function');
  await stale.page.locator('[data-zone="shoulder"]').click();await release();
  await stale.page.waitForTimeout(150);
  assert.equal(await stale.page.locator('[data-foundation-root]').count(),0);
  assert.equal(await stale.page.locator('#atlas-zone-title').innerText(),'Плечовий комплекс');
  assert.equal(stale.seen.pageErrors.length,0);
 }finally{await stale.context.close();}
 const plain=await open(browser,origin,viewport,'/atlas.html?zone=brain',{contextOptions:{javaScriptEnabled:false}});
 try{
  const transcript=plain.page.locator('.af-noscript');
  assert.equal(await transcript.isVisible(),true);
  assert.equal(await transcript.locator('button').count(),0);
  for(const name of ['Мозочок','Гіпоталамус','Тонка кишка','Пряма кишка','Підшлункова залоза'])
   assert.ok((await transcript.innerText()).includes(name),'no-JS retains '+name);
  assert.ok(await plain.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'no-JS width');
  await plain.page.emulateMedia({media:'print'});
  assert.equal(await transcript.isVisible(),true);
  assert.equal(plain.seen.pageErrors.length,0);assert.equal(plain.seen.external.length,0);
 }finally{await plain.context.close();}
}
