import assert from 'node:assert/strict';

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
   await page.locator('[data-atlas-tab="research"]').click();
   assert.equal(await page.locator('#atlas-breadcrumb-tab').innerText(),'Джерела');
   assert.ok((await page.title()).includes('Джерела'));
   assert.ok(new URL(page.url()).searchParams.get('tab')==='research');
   assert.match(await page.locator('#atlas-content').innerText(),/Незалежний науковий перегляд не завершено/);
   assert.equal(seen.pageErrors.length,0);
   assert.equal(seen.badResponses.length,0);
   assert.equal(seen.external.length,0);
  }finally{await context.close();}
 }
}
