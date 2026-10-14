import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {evidenceTheme} from '../brand/theme';

export const EvidenceCaption: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <div
      style={{
        position: 'absolute', left: 72, right: 72, bottom: 92,
        padding: '24px 30px', borderRadius: 24,
        backgroundColor: 'rgba(13,15,18,0.82)', border: '1px solid rgba(255,255,255,0.10)',
        color: evidenceTheme.text, fontFamily: evidenceTheme.fontFamily, fontSize: 38, fontWeight: 600,
        lineHeight: 1.25, textAlign: 'center',
        opacity: interpolate(frame, [0, 0.25 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
      }}
    >{children}</div>
  );
};
