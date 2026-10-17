import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {evidenceTheme} from '../brand/theme';

export const SilentHUD: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const progress = interpolate(frame, [0, Math.max(1, durationInFrames - 1)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const opacity = interpolate(
    frame,
    [Math.max(0, durationInFrames - 5 * fps), Math.max(1, durationInFrames - 3.5 * fps)],
    [1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity,
        fontFamily: evidenceTheme.fontFamily,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 54,
          left: 72,
          right: 72,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: evidenceTheme.muted,
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: '0.08em',
        }}
      >
        <span style={{color: evidenceTheme.accent}}>EVIDENCE UA</span>
        <span>КРЕАТИН · 5 Г</span>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 104,
          left: 72,
          right: 72,
          height: 4,
          borderRadius: 99,
          backgroundColor: 'rgba(244,242,237,0.12)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress * 100}%`,
            backgroundColor: evidenceTheme.accent,
            borderRadius: 99,
          }}
        />
      </div>
    </div>
  );
};
