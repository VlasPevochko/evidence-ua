import {Config} from '@remotion/cli/config';

Config.setPublicDir('./public');

// Three.js requires an explicit compatible Chromium renderer.
Config.setChromiumOpenGlRenderer('angle');
