import {creatineJourneyData} from '../data.ts';
import {CREATINE_SCENES} from '../scene-plan.ts';

const scene=(id:(typeof CREATINE_SCENES)[number]['id'])=>CREATINE_SCENES.find((item)=>item.id===id)!;
const sourceLabel=(ids:readonly string[])=>ids.map((id)=>creatineJourneyData.sources[id].shortLabel).join(' · ');
export const getAbsorptionModel=()=>({caption:scene('absorption').caption,sourceLabel:sourceLabel(scene('absorption').sourceIds)});
export const getBloodTransportModel=()=>({caption:scene('blood-transport').caption,sourceLabel:sourceLabel(scene('blood-transport').sourceIds)});
export const getMusclePoolModel=()=>{const claim=creatineJourneyData.claims['skeletal-muscle-pool'];return{value:claim.display,label:'загального пулу креатину — у скелетних м’язах',caption:scene('muscle-pool').caption,sourceLabel:sourceLabel(claim.sourceIds)};};
