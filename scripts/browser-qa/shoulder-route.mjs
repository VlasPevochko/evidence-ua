import assert from 'node:assert/strict';
import {learningHref} from '../../src/platform/catalog.mjs';

export async function shoulderRouteFlow(browser, origin, viewport, {open, artifact, baseline = false}) {
  const {context, page, seen} = await open(browser, origin, viewport, '/atlas.html');
  try {
    if (baseline) {
      for (const [file, selector] of [['atlas','.atlas-workspace'],['exercises','#exercise-intro'],['index','#home-learning-paths']]) {
        await page.goto(`${origin}/${file}.html`);
        if (file === 'index') await page.locator('#home-learning-paths').evaluate(node => node.open = true);
        await artifact(page, viewport, `shoulder-before-${file}`, page.locator(selector));
        console.log(JSON.stringify({phase:'before',page:file,viewport:viewport.name,...await page.evaluate(() => ({height:document.documentElement.scrollHeight,controls:document.querySelectorAll('a,button').length,width:document.documentElement.scrollWidth}))}));
      }
      return;
    }
    await page.locator('[data-shoulder-route-entry]').click();
    await page.locator('[data-atlas-tab="anatomy"][aria-selected="true"]').waitFor();
    assert.match(await page.locator('.eua-learning-nav').innerText(), /Крок 1 із 6/);
    await page.reload();
    await page.locator('[data-atlas-tab="anatomy"][aria-selected="true"]').waitFor();
    await page.locator('[data-atlas-tab="training"]').click();
    assert.equal(await page.locator('.eua-learning-nav').count(), 0, 'Different Atlas tab clears route progress');
    await page.goto(origin + learningHref('shoulder',0).slice(1));
    await page.locator('[data-zone="knee"]').click();
    assert.equal(await page.locator('.eua-learning-nav').count(), 0, 'Different zone clears route progress');

    await page.goto(origin + '/index.html#home-learning-paths');
    const start = page.locator('[data-home-path="shoulder"] .path-start');
    await start.waitFor({state:'visible'});
    await start.focus();
    assert(await start.evaluate(node => node === document.activeElement), 'Keyboard start receives real focus after route details open');
    await Promise.all([page.waitForURL(url => url.searchParams.get('path') === 'shoulder' && url.searchParams.get('lesson') === '0'), page.keyboard.press('Enter')]);
    for (let index = 0; index < 6; index++) {
      const nav = page.locator('.eua-learning-nav');
      try { await nav.waitFor({state:'visible'}); }
      catch (error) { throw new Error(`Route step ${index} at ${page.url()}; page errors: ${seen.pageErrors.join('; ')}`, {cause:error}); }
      assert.match(await nav.innerText(), new RegExp(`Крок ${index+1} із 6`));
      assert((await nav.boundingBox()).height < viewport.height / 2, 'Route navigation stays compact rather than stretching to a grid row');
      if (index === 0 && viewport.width > 900) {
        const geometry = await page.evaluate(() => {
          const stage = document.querySelector('.atlas-stage').getBoundingClientRect();
          const detail = document.querySelector('#atlas-detail').getBoundingClientRect();
          return {stageRight:stage.right,stageTop:stage.top,detailLeft:detail.left,detailTop:detail.top};
        });
        assert(geometry.detailLeft >= geometry.stageRight && Math.abs(geometry.detailTop-geometry.stageTop) < 2, 'Atlas detail stays next to the figure in the same desktop row');
      }
      if (index === 0) assert.equal(await page.locator('[data-atlas-tab="anatomy"]').getAttribute('aria-selected'), 'true');
      if (index === 2) assert.match(await page.locator('.ex-detail h1').innerText(), /Контроль лопатки/);
      if (index === 3) assert.match(await page.locator('.ex-detail h1').innerText(), /Комплекс для ротаторної манжети/);
      if (index === 2 || index === 3) assert.match(await page.locator('.ex-detail').innerText(), /не оцінено|не перевірено|не завершено/);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `Step ${index} fits viewport`);
      for (const link of await nav.locator('a').all()) assert((await link.boundingBox()).height >= 44, '44px navigation targets');
      // A real key input ends the shared anchor-reveal settling window before
      // we scroll the adjacent navigation into the screenshot viewport.
      await page.keyboard.press('Tab');
      await artifact(page, viewport, `shoulder-step-${index}`, nav);
      if (index < 5) {
        const next = nav.getByRole('link', {name:'Наступний матеріал →'});
        await next.focus();
        await Promise.all([page.waitForURL(url => url.searchParams.get('path') === 'shoulder' && url.searchParams.get('lesson') === String(index+1)), page.keyboard.press('Enter')]);
      }
    }
    assert.equal(new URL(page.url()).hash, '#sources');
    assert(await page.locator('#sources a[href^="https://"]').count() > 0, 'Existing movement sources are reachable');
    await page.goto(origin + '/exercises.html');
    await page.locator('[data-shoulder-route-entry]').click();
    await page.locator('.eua-learning-nav').waitFor();
    await page.evaluate(async () => {
      const shell = await import('./platform-shell.js');
      shell.mountPlatformNavigation(document);
      shell.mountPlatformNavigation(document);
    });
    assert.equal(await page.locator('.eua-learning-nav').count(), 1, 'Repeated mounting stays singular');
    assert.equal(await page.locator('[data-shoulder-route-entry]:visible').count(), 0, 'Active route does not duplicate its entry');
    const wrong = new URL(learningHref('shoulder',2), origin);
    wrong.searchParams.set('e','rotatorna-manzheta-kompleks');
    await page.goto(wrong.href);
    assert.equal(await page.locator('.eua-learning-nav').count(), 0, 'Wrong exercise cannot claim route progress');
    assert.equal(seen.external.length, 0, `No third-party requests: ${seen.external}`);
    assert.deepEqual(seen.pageErrors, []);
    assert.deepEqual(seen.badResponses, []);
    console.log(`Shoulder route passed @${viewport.name}: six steps, entry/return, reload, keyboard, exact content, repeat mount and no external requests.`);
  } finally { await context.close(); }
}
