import React from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {evidenceTheme} from '../brand/theme';
import {EvidenceSource} from './EvidenceSource';

export type BigNumberProps = {
  value: string;
  label: string;
  qualifier?: string;
  sourceLabel?: string;
};

export const BigNumber: React.FC<BigNumberProps> = ({value, label, qualifier, sourceLabel}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div style={{fontFamily: evidenceTheme.fontFamily}}>
      <div
        style={{
          color: evidenceTheme.accent,
          fontSize: 164,
          fontWeight: 800,
          letterSpacing: '-0.07em',
          lineHeight: 0.92,
          opacity: interpolate(frame, [0, 0.3 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
          scale: interpolate(frame, [0, 0.5 * fps], [0.88, 1], {
            extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >{value}</div>
      <div style={{marginTop: 28, color: evidenceTheme.text, fontSize: 44, fontWeight: 650, maxWidth: 780}}>{label}</div>
      {qualifier && <div style={{marginTop: 18, color: evidenceTheme.muted, fontSize: 28}}>{qualifier}</div>}
      {sourceLabel && <div style={{marginTop: 28}}><EvidenceSource label={sourceLabel} /></div>}
    </div>
  );
};
