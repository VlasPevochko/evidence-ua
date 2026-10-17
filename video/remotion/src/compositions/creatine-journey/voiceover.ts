import type {CreatineSceneId} from './scene-plan.ts';

export type VoiceoverScene = {
  id: CreatineSceneId;
  text: string;
  tone: 'hook' | 'neutral' | 'explanatory' | 'emphasis' | 'takeaway';
};

export const CREATINE_VOICEOVER: readonly VoiceoverScene[] = [
  {
    id: 'hook',
    text: 'Ти щойно випив п’ять грамів креатину. Що відбувається далі?',
    tone: 'hook',
  },
  {
    id: 'absorption',
    text: 'У травному тракті креатин розчиняється, всмоктується і переходить у кров.',
    tone: 'explanatory',
  },
  {
    id: 'blood-transport',
    text: 'Далі кров переносить його до тканин, а клітини захоплюють креатин за допомогою транспортних систем.',
    tone: 'explanatory',
  },
  {
    id: 'muscle-pool',
    text: 'Приблизно дев’яносто п’ять відсотків загального пулу креатину в організмі знаходиться у скелетних м’язах.',
    tone: 'emphasis',
  },
  {
    id: 'atp',
    text: 'У м’язовій клітині частина креатину стає фосфокреатином. Він швидко передає фосфат АДФ і допомагає ресинтезувати АТФ — безпосереднє паливо для клітини.',
    tone: 'explanatory',
  },
  {
    id: 'saturation',
    text: 'Але одна порція не насичує м’язи миттєво. За щоденного прийому трьох–п’яти грамів запаси зростають поступово — приблизно за три–чотири тижні без фази завантаження.',
    tone: 'neutral',
  },
  {
    id: 'takeaway',
    text: 'Креатин — не стимулятор. Це енергетичний буфер. Evidence UA. Докази замість міфів.',
    tone: 'takeaway',
  },
] as const;

export const voiceoverWordCount = (text: string): number => text.trim().split(/\s+/u).filter(Boolean).length;

export const totalVoiceoverWords = (): number =>
  CREATINE_VOICEOVER.reduce((sum, scene) => sum + voiceoverWordCount(scene.text), 0);
