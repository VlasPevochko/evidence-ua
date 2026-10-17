import assert from 'node:assert/strict';
import test from 'node:test';
import {CREATINE_SCENES} from './scene-plan.ts';
import {CREATINE_VOICEOVER, totalVoiceoverWords, voiceoverWordCount} from './voiceover.ts';

test('voiceover covers every CreatineJourney scene exactly once and in order', () => {
  assert.deepEqual(
    CREATINE_VOICEOVER.map((scene) => scene.id),
    CREATINE_SCENES.map((scene) => scene.id),
  );
  assert.equal(new Set(CREATINE_VOICEOVER.map((scene) => scene.id)).size, CREATINE_SCENES.length);
});

test('planning voiceover stays inside the scene word budget before real audio replaces estimates', () => {
  for (const scene of CREATINE_SCENES) {
    const narration = CREATINE_VOICEOVER.find((item) => item.id === scene.id);
    assert.ok(narration);
    const maximumPlanningWords = Math.ceil(scene.durationSeconds * 2.5);
    assert.ok(
      voiceoverWordCount(narration.text) <= maximumPlanningWords,
      `${scene.id} exceeds planning word budget`,
    );
  }
});

test('total narration pacing is intentionally below 150 words per minute', () => {
  const totalSeconds = CREATINE_SCENES.reduce((sum, scene) => sum + scene.durationSeconds, 0);
  const wordsPerMinute = (totalVoiceoverWords() / totalSeconds) * 60;
  assert.ok(wordsPerMinute > 85);
  assert.ok(wordsPerMinute < 150);
});
