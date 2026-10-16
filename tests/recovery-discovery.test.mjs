import test from 'node:test';
import assert from 'node:assert/strict';
import {findMaterials,contextLink} from '../src/platform/materials.mjs';

test('sleep loss can be found in its own direction and shared at the relevant section',()=>{
 const results=findMaterials('недосипання','recovery');
 assert(results.some(m=>m.href==='./sleep.html#sleep-performance'&&m.kind==='guide'));
 assert.equal(findMaterials('недосипання','atlas').length,0);
 assert.equal(contextLink('https://evidence.invalid/sleep?utm_source=test#sleep-performance'),'https://evidence.invalid/sleep#sleep-performance');
});

test('movement search takes a reader directly to the chosen lesson',()=>{
 assert(findMaterials('лікоть','movement').some(m=>m.href==='./movement.html#lesson-elbow'));
 assert(findMaterials('крокування','movement').some(m=>m.href==='./movement.html#lesson-walk'));
 assert(!findMaterials('сон','recovery').some(m=>m.areaId==='movement'));
});
