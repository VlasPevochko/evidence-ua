// Illustrative rigid segments, in model units. These are not human ROM norms.
const rad=degrees=>degrees*Math.PI/180;
const angle=(value,max)=>Number.isFinite(Number(value))?Math.max(0,Math.min(max,Number(value))):0;
const cycle=value=>((value%1)+1)%1;
export function walkStateAt(percent){
 const p=cycle(percent/100);
 return p<.12?'contact':p<.6?'support':p<.87?'swing':'prepare';
}
export function poseFor(mode,phase,{side=1,manual={}}={}){
 side=side===-1?-1:1;
 const t=(Math.sin(phase)+1)/2;
 const shoulder=[side*23,139,0],hip=[side*13,91,0];
 let arm=0,elbowAngle=0,thigh=0,kneeAngle=0,abduction=0;
 if(mode==='walk'){arm=rad(-Math.cos(phase+Math.PI/2+(side===1?0:Math.PI))*20);elbowAngle=rad(15);}
 if(side===1&&mode==='sagittal')elbowAngle=rad(t*120);
 if(side===1&&mode==='frontal')abduction=rad(t*82);
 if(mode==='puppet'){arm=rad(angle(manual.shoulder,150));elbowAngle=rad(angle(manual.elbow,140));thigh=rad(angle(manual.hip,100));kneeAngle=rad(angle(manual.knee,130));}
 const elbow=abduction?[shoulder[0]+side*30*Math.sin(abduction),shoulder[1]-30*Math.cos(abduction),0]:[shoulder[0],shoulder[1]-30*Math.cos(arm),30*Math.sin(arm)];
 const wrist=abduction?[elbow[0]+side*28*Math.sin(abduction),elbow[1]-28*Math.cos(abduction),0]:[elbow[0],elbow[1]-28*Math.cos(arm+elbowAngle),elbow[2]+28*Math.sin(arm+elbowAngle)];
 let knee=[hip[0],hip[1]-42*Math.cos(thigh),42*Math.sin(thigh)];
 let ankle=[hip[0],knee[1]-42*Math.cos(thigh-kneeAngle),knee[2]+42*Math.sin(thigh-kneeAngle)];
 if(mode==='walk'){
  // Illustrative foot path, not measured gait data. Two equal rigid segments.
  const p=cycle((phase+Math.PI/2)/(Math.PI*2)+(side===1?0:.5)),swing=p>=.6,t=(p-.6)/.4;
  const z=swing?-24+48*t*t*(3-2*t):24-80*p,y=swing?14+18*Math.sin(Math.PI*t):14;
  ankle=[hip[0],y,z];
  const dy=y-hip[1],length=Math.hypot(dy,z),bend=Math.sqrt(Math.max(0,42*42-length*length/4));
  knee=[hip[0],hip[1]+dy/2+bend*z/length,z/2-bend*dy/length];
 }
 return {shoulder,elbow,wrist,hip,knee,ankle};
}
