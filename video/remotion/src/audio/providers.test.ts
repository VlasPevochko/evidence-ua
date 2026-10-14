import assert from 'node:assert/strict';
import test from 'node:test';
import {getUkrainianVoiceRoute, VOICE_PROVIDERS} from './providers.ts';

test('Ukrainian provider route prefers native final-quality providers before local fallback', () => {
  assert.deepEqual(getUkrainianVoiceRoute().map((provider) => provider.id), [
    'google-uk-hd',
    'azure-uk',
    'piper-uk',
  ]);
});

test('Piper exposes three current high-quality Ukrainian audition voices', () => {
  const piper = VOICE_PROVIDERS.find((provider) => provider.id === 'piper-uk');
  assert.ok(piper);
  assert.equal(piper.credentialRequired, false);
  assert.deepEqual(piper.voices, [
    'uk_UA-mykyta-high',
    'uk_UA-oleksa-high',
    'uk_UA-tetiana-high',
  ]);
});

test('Qwen3 reference provider is never routed for Ukrainian', () => {
  const qwen = VOICE_PROVIDERS.find((provider) => provider.id === 'qwen3-reference');
  assert.ok(qwen);
  assert.equal(qwen.supportedLocales.includes('uk-UA'), false);
});
