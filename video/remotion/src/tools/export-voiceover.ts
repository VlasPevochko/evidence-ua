import {CREATINE_VOICEOVER, totalVoiceoverWords} from '../compositions/creatine-journey/voiceover.ts';

const args = new Set(process.argv.slice(2));

if (args.has('--sample')) {
  const sampleIds = new Set(['hook', 'muscle-pool', 'takeaway']);
  const sample = CREATINE_VOICEOVER
    .filter((scene) => sampleIds.has(scene.id))
    .map((scene) => scene.text)
    .join(' ');
  process.stdout.write(`${sample}\n`);
} else {
  process.stdout.write(
    `${JSON.stringify({
      compositionId: 'CreatineJourney',
      locale: 'uk-UA',
      totalWords: totalVoiceoverWords(),
      scenes: CREATINE_VOICEOVER,
    }, null, 2)}\n`,
  );
}
