import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {EvidenceLogo} from '../brand/EvidenceLogo';
import {evidenceTheme} from '../brand/theme';

export const EndCard: React.FC<{tagline: string}> = ({tagline}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return (
    <AbsoluteFill style={{backgroundColor: evidenceTheme.background, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{textAlign: 'center', opacity: interpolate(frame, [0, 0.4 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}), scale: interpolate(frame, [0, 0.65 * fps], [0.92, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1)})}}>
        <EvidenceLogo />
        <div style={{marginTop: 42, color: evidenceTheme.text, fontFamily: evidenceTheme.fontFamily, fontSize: 34}}>{tagline}</div>
      </div>
    </AbsoluteFill>
  );
};
