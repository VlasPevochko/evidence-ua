import assert from 'node:assert/strict';
import test from 'node:test';
import {CREATINE_COMPOSITION} from '../../config/composition.ts';
import {creatineJourneyData} from './data.ts';
import {CREATINE_SCENES, sceneDurationInFrames} from './scene-plan.ts';

const expectedIds=['hook','absorption','blood-transport','muscle-pool','atp','saturation','takeaway'];
const expectedSeconds=[4,8,9,9,10,11,8];

test('scene order and durations total exactly 59 seconds',()=>{assert.deepEqual(CREATINE_SCENES.map((s)=>s.id),expectedIds);assert.deepEqual(CREATINE_SCENES.map((s)=>s.durationSeconds),expectedSeconds);assert.equal(CREATINE_SCENES.reduce((a,s)=>a+s.durationSeconds,0),59);assert.equal(CREATINE_SCENES.reduce((a,s)=>a+sceneDurationInFrames(s,CREATINE_COMPOSITION.fps),0),1770);});
test('all scene claim and source IDs resolve',()=>{for(const s of CREATINE_SCENES){for(const id of s.claimIds)assert.ok(creatineJourneyData.claims[id],`missing claim ${id}`);for(const id of s.sourceIds)assert.ok(creatineJourneyData.sources[id],`missing source ${id}`);}});
test('saturation scene stays qualitative and does not invent percentage progression',()=>{const s=CREATINE_SCENES.find((x)=>x.id==='saturation');assert.ok(s);assert.equal(/\d+\s*%/.test(`${s.caption} ${s.onScreenText.join(' ')}`),false);});
test('muscle-pool wording describes total-body stores rather than swallowed-dose uptake',()=>{const s=CREATINE_SCENES.find((x)=>x.id==='muscle-pool');assert.ok(s);assert.match(s.caption,/загального пулу|запасів.*організм/i);assert.doesNotMatch(s.caption,/95%.*(дози|порції|випит)/i);});
