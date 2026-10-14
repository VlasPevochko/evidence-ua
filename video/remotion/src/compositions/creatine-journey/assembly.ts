import {CREATINE_COMPOSITION} from '../../config/composition.ts';
import {ATP_REACTION_LABELS,QUALITATIVE_SATURATION_MILESTONES} from '../../science/model.ts';
import {creatineJourneyData} from './data.ts';
import {CREATINE_SCENES,sceneDurationInFrames} from './scene-plan.ts';
const sourceLabels=(ids:readonly string[])=>ids.map((id)=>creatineJourneyData.sources[id].shortLabel).join(' · ');
export const getCreatineAssembly=()=>CREATINE_SCENES.map((scene)=>({...scene,durationInFrames:sceneDurationInFrames(scene,CREATINE_COMPOSITION.fps)}));
export const getATPSceneModel=()=>({labels:ATP_REACTION_LABELS,explanation:'Фосфокреатин підтримує швидкий ресинтез ATP з ADP — без створення додаткової енергії.',caption:CREATINE_SCENES.find((s)=>s.id==='atp')!.caption,sourceLabel:sourceLabels(creatineJourneyData.claims['atp-mechanism'].sourceIds)});
export const getSaturationSceneModel=()=>({dailyDose:creatineJourneyData.claims['daily-dose'].display,saturationTime:creatineJourneyData.claims['saturation-time'].display,qualifier:creatineJourneyData.claims['saturation-time'].qualifier!,milestones:QUALITATIVE_SATURATION_MILESTONES,caption:CREATINE_SCENES.find((s)=>s.id==='saturation')!.caption,sourceLabel:sourceLabels(['hultman-1996','kreider-2017','antonio-2021'])});
export const getTakeawaySceneModel=()=>({caption:CREATINE_SCENES.find((s)=>s.id==='takeaway')!.caption,sourceLabel:sourceLabels(creatineJourneyData.claims.takeaway.sourceIds)});
