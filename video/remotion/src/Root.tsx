import {AbsoluteFill, Composition} from 'remotion';
import {CREATINE_COMPOSITION} from './config/composition';

const Placeholder = () => (
  <AbsoluteFill
    style={{
      alignItems: 'center',
      backgroundColor: '#0d0f12',
      color: '#f4f2ed',
      display: 'flex',
      justifyContent: 'center',
      fontFamily: 'Inter, Arial, sans-serif',
      fontSize: 72,
    }}
  >
    Creatine Journey
  </AbsoluteFill>
);

export const RemotionRoot = () => (
  <Composition
    id={CREATINE_COMPOSITION.id}
    component={Placeholder}
    width={CREATINE_COMPOSITION.width}
    height={CREATINE_COMPOSITION.height}
    fps={CREATINE_COMPOSITION.fps}
    durationInFrames={CREATINE_COMPOSITION.durationInFrames}
  />
);
