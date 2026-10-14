import React from 'react';
import {Easing, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {evidenceTheme} from '../brand/theme';
import {captionChunkIndex, splitCaptionIntoChunks} from './caption-model';

export const EvidenceCaption: React.FC<{children: React.ReactNode}> = ({children}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const text = typeof children === 'string' ? children : String(children ?? '');
  const chunks = splitCaptionIntoChunks(text, 6);
  const activeIndex = captionChunkIndex(frame, fps, chunks.length);
  const localFrame = frame - activeIndex * 1.45 * fps;

  return (
    <div
      style={{
        position: 'absolute',
        left: 72,
        right: 72,
        bottom: 96,
        minHeight: 168,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '28px 34px',
        borderRadius: 28,
        backgroundColor: 'rgba(13,15,18,0.90)',
        border: '1px solid rgba(244,242,237,0.14)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.34)',
        color: evidenceTheme.text,
        fontFamily: evidenceTheme.fontFamily,
        fontSize: 44,
        fontWeight: 720,
        letterSpacing: '-0.025em',
        lineHeight: 1.12,
        textAlign: 'center',
        opacity: interpolate(localFrame, [0, 0.18 * fps], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        }),
        translate: `0 ${interpolate(localFrame, [0, 0.22 * fps], [24, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        })}px`,
      }}
    >
      <span>
        {chunks[activeIndex]}
        <span style={{color: evidenceTheme.accent}}> ▪</span>
      </span>
    </div>
  );
};
