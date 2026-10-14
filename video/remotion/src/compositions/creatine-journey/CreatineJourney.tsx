import React from 'react';
import {Series, useVideoConfig} from 'remotion';
import {SilentHUD} from '../../components/SilentHUD';
import {getCreatineAssembly} from './assembly';
import {HookScene} from './scenes/HookScene';
import {AbsorptionScene} from './scenes/AbsorptionScene';
import {BloodTransportScene} from './scenes/BloodTransportScene';
import {MusclePoolScene} from './scenes/MusclePoolScene';
import {ATPScene} from './scenes/ATPScene';
import {SaturationTimelineScene} from './scenes/SaturationTimelineScene';
import {TakeawayScene} from './scenes/TakeawayScene';

export const CreatineJourney: React.FC = () => {
  const {fps} = useVideoConfig();
  const [hook, absorption, blood, muscle, atp, saturation, takeaway] = getCreatineAssembly();

  return (
    <>
      <Series>
        <Series.Sequence durationInFrames={hook.durationInFrames} premountFor={fps}>
          <HookScene caption={hook.caption}/>
        </Series.Sequence>
        <Series.Sequence durationInFrames={absorption.durationInFrames} premountFor={fps}>
          <AbsorptionScene/>
        </Series.Sequence>
        <Series.Sequence durationInFrames={blood.durationInFrames} premountFor={fps}>
          <BloodTransportScene/>
        </Series.Sequence>
        <Series.Sequence durationInFrames={muscle.durationInFrames} premountFor={fps}>
          <MusclePoolScene/>
        </Series.Sequence>
        <Series.Sequence durationInFrames={atp.durationInFrames} premountFor={fps}>
          <ATPScene/>
        </Series.Sequence>
        <Series.Sequence durationInFrames={saturation.durationInFrames} premountFor={fps}>
          <SaturationTimelineScene/>
        </Series.Sequence>
        <Series.Sequence durationInFrames={takeaway.durationInFrames} premountFor={fps}>
          <TakeawayScene/>
        </Series.Sequence>
      </Series>
      <SilentHUD/>
    </>
  );
};
