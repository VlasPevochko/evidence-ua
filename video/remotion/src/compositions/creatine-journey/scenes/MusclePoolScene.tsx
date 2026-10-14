import React from 'react';
import {MusclePool} from '../../../science/MusclePool';
import {EvidenceCaption} from '../../../components/EvidenceCaption';
import {getMusclePoolModel} from './scene-models';
export const MusclePoolScene:React.FC=()=>{const m=getMusclePoolModel();return <><MusclePool value={m.value} label={m.label} sourceLabel={m.sourceLabel}/><EvidenceCaption>{m.caption}</EvidenceCaption></>;};
