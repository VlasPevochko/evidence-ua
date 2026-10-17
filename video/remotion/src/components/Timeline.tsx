import React from 'react';
import {interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {evidenceTheme} from '../brand/theme';
import {EvidenceSource} from './EvidenceSource';

export const Timeline: React.FC<{
  milestones: readonly string[];
  headline: string;
  detail: string;
  sourceLabel: string;
}> = ({milestones, headline, detail, sourceLabel}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const progress = interpolate(frame, [0.5 * fps, 3.2 * fps], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <div style={{fontFamily: evidenceTheme.fontFamily, color: evidenceTheme.text}}>
      <div style={{fontSize: 58, fontWeight: 750, maxWidth: 870}}>{headline}</div>
      <div style={{marginTop: 30, color: evidenceTheme.muted, fontSize: 32, lineHeight: 1.4, maxWidth: 820}}>{detail}</div>
      <div style={{marginTop: 100, position: 'relative', height: 190}}>
        <div style={{position: 'absolute', left: 0, right: 0, top: 52, height: 5, backgroundColor: '#32363c'}} />
        <div style={{position: 'absolute', left: 0, top: 52, width: `${progress * 100}%`, height: 5, backgroundColor: evidenceTheme.accent}} />
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          {milestones.map((label, index) => {
            const threshold = milestones.length === 1 ? 0 : index / (milestones.length - 1);
            const active = progress >= threshold;
            return <div key={label} style={{width: 110, textAlign: 'center'}}><div style={{margin: '33px auto 18px', width: 36, height: 36, borderRadius: '50%', backgroundColor: active ? evidenceTheme.accent : '#3b4047', border: `4px solid ${evidenceTheme.background}`}} /><div style={{fontSize: 25, color: active ? evidenceTheme.text : evidenceTheme.muted}}>{label}</div></div>;
          })}
        </div>
      </div>
      <div style={{marginTop: 30}}><EvidenceSource label={sourceLabel} /></div>
    </div>
  );
};
