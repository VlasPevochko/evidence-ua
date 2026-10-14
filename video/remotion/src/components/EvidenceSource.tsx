import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {evidenceTheme} from '../brand/theme';

export const EvidenceSource: React.FC<{label: string}> = ({label}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div
      style={{
        opacity: interpolate(frame, [0, 0.35 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
        color: evidenceTheme.muted,
        fontFamily: evidenceTheme.fontFamily,
        fontSize: 30,
        lineHeight: 1.25,
        letterSpacing: '0.01em',
      }}
    >
      {label}
    </div>
  );
};
