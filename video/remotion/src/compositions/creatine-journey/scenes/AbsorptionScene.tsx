import React from 'react';
import {AbsoluteFill} from 'remotion';
import {evidenceTheme} from '../../../brand/theme';
import {BodyPathway} from '../../../science/BodyPathway';
import {EvidenceCaption} from '../../../components/EvidenceCaption';
import {EvidenceSource} from '../../../components/EvidenceSource';
import {getAbsorptionModel} from './scene-models';
export const AbsorptionScene:React.FC=()=>{const m=getAbsorptionModel();return <AbsoluteFill style={{backgroundColor:evidenceTheme.background,fontFamily:evidenceTheme.fontFamily}}><BodyPathway stage="gi"/><div style={{position:'absolute',top:180,left:72,right:72,color:evidenceTheme.text,fontSize:68,fontWeight:780}}>ШКТ <span style={{color:evidenceTheme.accent}}>→</span> КРОВ</div><div style={{position:'absolute',top:315,left:72}}><EvidenceSource label={m.sourceLabel}/></div><EvidenceCaption>{m.caption}</EvidenceCaption></AbsoluteFill>;};
