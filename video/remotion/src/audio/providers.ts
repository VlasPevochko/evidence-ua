export type VoiceProviderId = 'google-uk-hd' | 'azure-uk' | 'piper-uk' | 'qwen3-reference';

export type VoiceProvider = {
  id: VoiceProviderId;
  label: string;
  runtime: 'api' | 'local' | 'gpu';
  credentialRequired: boolean;
  supportedLocales: readonly string[];
  qualityRole: 'final' | 'fallback' | 'reference-only';
  voices: readonly string[];
  notes: string;
};

export const VOICE_PROVIDERS: readonly VoiceProvider[] = [
  {
    id: 'google-uk-hd',
    label: 'Google Cloud TTS — Ukrainian Chirp 3 HD',
    runtime: 'api',
    credentialRequired: true,
    supportedLocales: ['uk-UA'],
    qualityRole: 'final',
    voices: [
      'uk-UA-Chirp3-HD-Charon',
      'uk-UA-Chirp3-HD-Enceladus',
      'uk-UA-Chirp3-HD-Fenrir',
      'uk-UA-Chirp3-HD-Orus',
      'uk-UA-Chirp3-HD-Puck',
    ],
    notes: 'Quality-first Ukrainian route when Google Cloud TTS credentials are configured.',
  },
  {
    id: 'azure-uk',
    label: 'Azure Speech — Ukrainian Neural',
    runtime: 'api',
    credentialRequired: true,
    supportedLocales: ['uk-UA'],
    qualityRole: 'final',
    voices: ['uk-UA-OstapNeural', 'uk-UA-PolinaNeural'],
    notes: 'Native Ukrainian neural voices; use when Azure Speech is configured and auditioned successfully.',
  },
  {
    id: 'piper-uk',
    label: 'Piper — Ukrainian high voices',
    runtime: 'local',
    credentialRequired: false,
    supportedLocales: ['uk-UA'],
    qualityRole: 'fallback',
    voices: ['uk_UA-mykyta-high', 'uk_UA-oleksa-high', 'uk_UA-tetiana-high'],
    notes: 'Zero-key local fallback and audition path. Final use requires listening QC.',
  },
  {
    id: 'qwen3-reference',
    label: 'Qwen3-TTS reference route',
    runtime: 'gpu',
    credentialRequired: false,
    supportedLocales: ['en-US', 'de-DE', 'fr-FR', 'es-ES', 'it-IT', 'pt-PT', 'ru-RU', 'ja-JP', 'ko-KR', 'zh-CN'],
    qualityRole: 'reference-only',
    voices: [],
    notes: 'Do not select for Ukrainian until first-party Ukrainian support is verified.',
  },
] as const;

export const providerSupportsLocale = (provider: VoiceProvider, locale: string): boolean =>
  provider.supportedLocales.includes(locale);

export const getUkrainianVoiceRoute = (): readonly VoiceProvider[] =>
  VOICE_PROVIDERS.filter((provider) => providerSupportsLocale(provider, 'uk-UA'))
    .sort((a, b) => {
      const rank = {final: 0, fallback: 1, 'reference-only': 2} as const;
      return rank[a.qualityRole] - rank[b.qualityRole];
    });
