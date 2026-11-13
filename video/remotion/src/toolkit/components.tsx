import React, {type ComponentProps, type ReactNode} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {Lottie} from '@remotion/lottie';
import {ThreeCanvas} from '@remotion/three';
import {createTikTokStyleCaptions, type Caption} from '@remotion/captions';

export {TransitionSeries, linearTiming, springTiming} from '@remotion/transitions';
export {fade} from '@remotion/transitions/fade';
export {slide} from '@remotion/transitions/slide';
export {Trail} from '@remotion/motion-blur';
export {AnimatedEmoji} from '@remotion/animated-emoji';

export function LottieInsert(props: ComponentProps<typeof Lottie>) {
  return <Lottie {...props} renderer="svg" />;
}

export function Scene3D({children}: {children: ReactNode}) {
  const {width, height} = useVideoConfig();
  return <ThreeCanvas width={width} height={height} camera={{position:[0,0,5], fov:45}}><ambientLight intensity={1} />{children}</ThreeCanvas>;
}

export function Split50({presenter, visual}: {presenter: ReactNode; visual: ReactNode}) {
  return <AbsoluteFill style={{display:'grid', gridTemplateColumns:'1fr 1fr', background:'#102727'}}>
    <div style={{position:'relative', overflow:'hidden'}}>{presenter}</div>
    <div style={{position:'relative', overflow:'hidden'}}>{visual}</div>
  </AbsoluteFill>;
}

// Timings come from the approved transcript, never guessed word durations.
export function WordCaptions({captions}: {captions: Caption[]}) {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const time = frame / fps * 1000;
  const {pages} = createTikTokStyleCaptions({captions, combineTokensWithinMilliseconds:1200});
  const page = pages.find((item) => item.startMs <= time && item.startMs + item.durationMs > time);
  if (!page) return null;
  return <div style={{position:'absolute', left:'8%', right:'8%', bottom:'18%', textAlign:'center', fontFamily:'Arial, sans-serif', fontSize:54, lineHeight:1.25, fontWeight:700, color:'white', textShadow:'0 2px 8px #000'}}>
    {page.tokens.map((token, index) => <span key={index} style={{color:time >= token.fromMs && time < token.toMs ? '#f4ac55' : 'white'}}>{token.text}</span>)}
  </div>;
}

export function SourceCard({title, source, children}: {title: string; source: string; children?: ReactNode}) {
  return <AbsoluteFill style={{padding:'10%', background:'#102727', color:'#fff', fontFamily:'Arial, sans-serif', justifyContent:'center', gap:32}}>
    <h2 style={{fontSize:64, lineHeight:1.1, margin:0}}>{title}</h2>
    {children}
    <p style={{fontSize:30, lineHeight:1.4, margin:0, color:'#b7d3c7'}}>{source}</p>
  </AbsoluteFill>;
}
