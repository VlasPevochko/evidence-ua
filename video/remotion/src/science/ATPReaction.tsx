import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {evidenceTheme} from '../brand/theme';

type ATPReactionProps = {
  phosphocreatine: string;
  substrate: string;
  product: string;
  explanation: string;
};

export const ATPReaction: React.FC<ATPReactionProps> = ({phosphocreatine, substrate, product, explanation}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = interpolate(frame, [0.4 * fps, 1.6 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.bezier(0.16, 1, 0.3, 1)});
  return (
    <AbsoluteFill style={{backgroundColor: evidenceTheme.background, alignItems: 'center', justifyContent: 'center', fontFamily: evidenceTheme.fontFamily}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 36, fontSize: 86, fontWeight: 800, color: evidenceTheme.text}}>
        <span style={{color: evidenceTheme.accent}}>{phosphocreatine}</span>
        <span>+</span>
        <span>{substrate}</span>
        <span style={{width: 170, height: 5, backgroundColor: evidenceTheme.muted, position: 'relative', opacity: progress}}>
          <span style={{position: 'absolute', right: -8, top: -12, borderTop: '14px solid transparent', borderBottom: '14px solid transparent', borderLeft: `24px solid ${evidenceTheme.accent}`}} />
        </span>
        <span style={{color: evidenceTheme.accent, opacity: progress, scale: 0.9 + progress * 0.1}}>{product}</span>
      </div>
      <div style={{marginTop: 90, maxWidth: 850, textAlign: 'center', fontSize: 38, lineHeight: 1.35, color: evidenceTheme.muted}}>{explanation}</div>
    </AbsoluteFill>
  );
};
