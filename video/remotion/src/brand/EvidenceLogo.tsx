import React from 'react';
import {evidenceTheme} from './theme';

export const EvidenceLogo: React.FC<{compact?: boolean}> = ({compact = false}) => (
  <div style={{fontFamily: evidenceTheme.fontFamily, color: evidenceTheme.text}}>
    <div style={{fontSize: compact ? 32 : 44, fontWeight: 750, letterSpacing: '-0.04em'}}>
      EVIDENCE <span style={{color: evidenceTheme.accent}}>UA</span>
    </div>
    {!compact && (
      <div style={{marginTop: 8, fontSize: 14, letterSpacing: '0.16em', color: evidenceTheme.muted}}>
        ДОКАЗИ ЗАМІСТЬ МІФІВ
      </div>
    )}
  </div>
);
