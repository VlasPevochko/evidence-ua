import assert from 'node:assert/strict';
import test from 'node:test';
import {getAbsorptionModel,getBloodTransportModel,getMusclePoolModel} from './scene-models.ts';
test('muscle pool model resolves value and source from evidence data',()=>{const m=getMusclePoolModel();assert.equal(m.value,'≈95%');assert.equal(m.sourceLabel,'Balsom et al., 1994');assert.match(m.label,/загального пулу/i);});
test('opening pathway models do not claim all swallowed creatine enters muscle',()=>{const c=`${getAbsorptionModel().caption} ${getBloodTransportModel().caption}`;assert.doesNotMatch(c,/весь|100%|усі 5 грамів.*м’яз/i);});
test('source labels are derived from the source registry',()=>{assert.equal(getAbsorptionModel().sourceLabel,'Antonio et al., 2021');assert.match(getBloodTransportModel().sourceLabel,/Balsom et al., 1994/);});
