import React from 'react';
import {AbsoluteFill} from 'remotion';
import {evidenceTheme} from '../../../brand/theme';
import {BodyPathway} from '../../../science/BodyPathway';
import {EvidenceCaption} from '../../../components/EvidenceCaption';
import {EvidenceSource} from '../../../components/EvidenceSource';
import {getBloodTransportModel} from './scene-models';
export const BloodTransportScene:React.FC=()=>{const m=getBloodTransportModel();return <AbsoluteFill style={{backgroundColor:evidenceTheme.background,fontFamily:evidenceTheme.fontFamily}}><BodyPathway stage="transport"/><div style={{position:'absolute',top:170,left:72,right:72,color:evidenceTheme.text,fontSize:62,fontWeight:760}}>КРОВОТІК <span style={{color:evidenceTheme.accent}}>→</span> ТКАНИНИ</div><div style={{position:'absolute',top:305,left:72}}><EvidenceSource label={m.sourceLabel}/></div><EvidenceCaption>{m.caption}</EvidenceCaption></AbsoluteFill>;};
