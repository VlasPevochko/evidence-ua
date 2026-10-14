import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {evidenceTheme} from '../brand/theme';

export type BodyPathwayStage = 'gi' | 'blood' | 'transport';

const stageX: Record<BodyPathwayStage, number> = {gi: 190, blood: 500, transport: 810};

export const BodyPathway: React.FC<{stage: BodyPathwayStage}> = ({stage}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const x = stageX[stage];
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <svg width="900" height="900" viewBox="0 0 900 900">
        <defs>
          <radialGradient id="nodeGlow">
            <stop offset="0%" stopColor={evidenceTheme.accent} stopOpacity="0.8" />
            <stop offset="100%" stopColor={evidenceTheme.accent} stopOpacity="0" />
          </radialGradient>
        </defs>
        <path d="M190 450 C330 310 410 590 500 450 S690 310 810 450" fill="none" stroke="#34383f" strokeWidth="22" strokeLinecap="round" />
        {[190, 500, 810].map((cx) => <circle key={cx} cx={cx} cy={450} r={42} fill="#1b1f24" stroke="#5b6068" strokeWidth="3" />)}
        <circle cx={x} cy={450} r={90} fill="url(#nodeGlow)" opacity={interpolate(frame, [0, 0.5 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
        <circle cx={x} cy={450} r={30} fill={evidenceTheme.accent} style={{scale: interpolate(frame, [0, 0.6 * fps], [0.5, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1)}), transformOrigin: `${x}px 450px`}} />
      </svg>
    </AbsoluteFill>
  );
};
