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
  onScreenText: string[];
  claimIds: string[];
  sourceIds: string[];
};

export const sceneDurationInFrames = (scene: CreatineSceneSpec, fps: number): number =>
  Math.round(scene.durationSeconds * fps);

export const CREATINE_SCENES: readonly CreatineSceneSpec[] = [
  {id:'hook',durationSeconds:4,caption:'Ти щойно випив 5 грамів креатину. Що з ними відбувається далі?',onScreenText:['5 г КРЕАТИНУ','ЩО ДАЛІ?'],claimIds:[],sourceIds:[]},
  {id:'absorption',durationSeconds:8,caption:'Після потрапляння в травний тракт креатин всмоктується і переходить у кров.',onScreenText:['ШКТ','→','КРОВ'],claimIds:['absorption'],sourceIds:['antonio-2021']},
  {id:'blood-transport',durationSeconds:9,caption:'Далі кров переносить креатин до тканин, а клітини захоплюють його за допомогою транспортних систем.',onScreenText:['КРОВОТІК','→','ТКАНИНИ'],claimIds:['cellular-uptake'],sourceIds:['balsom-1994','kreider-2017']},
  {id:'muscle-pool',durationSeconds:9,caption:'Понад приблизно 95% загального пулу креатину в організмі знаходиться у скелетних м’язах.',onScreenText:['≈95%','ЗАГАЛЬНОГО ПУЛУ','У СКЕЛЕТНИХ М’ЯЗАХ'],claimIds:['skeletal-muscle-pool'],sourceIds:['balsom-1994']},
  {id:'atp',durationSeconds:10,caption:'У м’язі фосфокреатин допомагає швидко ресинтезувати ATP з ADP. Креатин не створює енергію — він підтримує її швидке відновлення.',onScreenText:['PCr + ADP','→','ATP'],claimIds:['atp-mechanism'],sourceIds:['balsom-1994','kreider-2017']},
  {id:'saturation',durationSeconds:11,caption:'Одна порція не насичує м’язи миттєво. При щоденному прийомі 3–5 грамів запаси зростають поступово — приблизно протягом кількох тижнів.',onScreenText:['3–5 г / день','≈3–4 тижні','БЕЗ ФАЗИ ЗАВАНТАЖЕННЯ'],claimIds:['daily-dose','saturation-time'],sourceIds:['hultman-1996','kreider-2017','antonio-2021']},
  {id:'takeaway',durationSeconds:8,caption:'Креатин — не стимулятор. Це частина системи швидкого енергетичного буферування. Evidence UA — докази замість міфів.',onScreenText:['НЕ СТИМУЛЯТОР','ЕНЕРГЕТИЧНИЙ БУФЕР'],claimIds:['takeaway'],sourceIds:['balsom-1994','kreider-2017']},
] as const;
