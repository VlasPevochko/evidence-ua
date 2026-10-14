import {creatineJourneyData} from './data.ts';
import type {EvidenceData} from '../../evidence/types.ts';

export type CreatineSceneId =
  | 'hook'
  | 'absorption'
  | 'blood-transport'
  | 'muscle-pool'
  | 'atp'
  | 'saturation'
  | 'takeaway';

export type CreatineSceneSpec = {
  id: CreatineSceneId;
  durationSeconds: number;
  caption: string;
  onScreenText: readonly string[];
  claimIds: readonly string[];
  sourceIds: readonly string[];
};

export const sceneDurationInFrames = (scene: CreatineSceneSpec, fps: number): number => Math.round(scene.durationSeconds * fps);
const unique = (values: readonly string[]) => [...new Set(values)];

export const createCreatineScenes = (data: EvidenceData = creatineJourneyData): readonly CreatineSceneSpec[] => {
  const absorption = data.claims.absorption;
  const uptake = data.claims['cellular-uptake'];
  const muscle = data.claims['skeletal-muscle-pool'];
  const atp = data.claims['atp-mechanism'];
  const dose = data.claims['daily-dose'];
  const saturation = data.claims['saturation-time'];
  const takeaway = data.claims.takeaway;
  return [
    {id:'hook',durationSeconds:4,caption:'Ти щойно випив 5 грамів креатину. Що з ними відбувається далі?',onScreenText:['5 г КРЕАТИНУ','ЩО ДАЛІ?'],claimIds:[],sourceIds:[]},
    {id:'absorption',durationSeconds:8,caption:'Після потрапляння в травний тракт креатин всмоктується і переходить у кров.',onScreenText:['ШКТ','→','КРОВ'],claimIds:[absorption.id],sourceIds:absorption.sourceIds},
    {id:'blood-transport',durationSeconds:9,caption:'Далі кров переносить креатин до тканин, а клітини захоплюють його за допомогою транспортних систем.',onScreenText:['КРОВОТІК','→','ТКАНИНИ'],claimIds:[uptake.id],sourceIds:uptake.sourceIds},
    {id:'muscle-pool',durationSeconds:9,caption:`${muscle.display} загального пулу креатину в організмі знаходиться у скелетних м’язах.`,onScreenText:[muscle.display,'ЗАГАЛЬНОГО ПУЛУ','У СКЕЛЕТНИХ М’ЯЗАХ'],claimIds:[muscle.id],sourceIds:muscle.sourceIds},
    {id:'atp',durationSeconds:10,caption:'У м’язі фосфокреатин допомагає швидко ресинтезувати ATP з ADP. Креатин не створює енергію — він підтримує її швидке відновлення.',onScreenText:['PCr + ADP','→','ATP'],claimIds:[atp.id],sourceIds:atp.sourceIds},
    {id:'saturation',durationSeconds:11,caption:`Одна порція не насичує м’язи миттєво. При щоденному прийомі ${dose.display.replace(' / день','')} запаси зростають поступово — приблизно протягом кількох тижнів.`,onScreenText:[dose.display,saturation.display,(saturation.qualifier ?? '').toUpperCase()],claimIds:[dose.id,saturation.id],sourceIds:unique([...dose.sourceIds,...saturation.sourceIds])},
    {id:'takeaway',durationSeconds:8,caption:'Креатин — не стимулятор. Це частина системи швидкого енергетичного буферування. Evidence UA — докази замість міфів.',onScreenText:['НЕ СТИМУЛЯТОР',takeaway.display],claimIds:[takeaway.id],sourceIds:takeaway.sourceIds},
  ];
};
export const CREATINE_SCENES = createCreatineScenes();
