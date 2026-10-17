import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {evidenceTheme} from '../brand/theme';
import {BigNumber} from '../components/BigNumber';

export const MusclePool: React.FC<{value: string; label: string; sourceLabel: string}> = ({value, label, sourceLabel}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{backgroundColor: evidenceTheme.background}}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{position: 'absolute', inset: 0}}>
        <path d="M540 280 C450 280 410 370 430 485 L455 670 380 1000 430 1560 540 1700 650 1560 700 1000 625 670 650 485 C670 370 630 280 540 280Z" fill="#252a31" stroke="#555c65" strokeWidth="4" opacity="0.86" />
        <path d="M490 480 C455 560 455 730 485 900 M590 480 C625 560 625 730 595 900 M455 990 C500 1040 520 1320 500 1500 M625 990 C580 1040 560 1320 580 1500" fill="none" stroke={evidenceTheme.accent} strokeWidth="24" strokeLinecap="round" opacity={interpolate(frame, [0, 1.2 * fps], [0.1, 0.95], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})} />
      </svg>
      <div style={{position: 'absolute', left: 90, right: 90, top: 1120}}>
        <BigNumber value={value} label={label} sourceLabel={sourceLabel} />
      </div>
    </AbsoluteFill>
  );
};
