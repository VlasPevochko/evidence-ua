// Illustrative rigid segments, in model units. These are not human ROM norms.
const rad=degrees=>degrees*Math.PI/180;
const angle=(value,max)=>Number.isFinite(Number(value))?Math.max(0,Math.min(max,Number(value))):0;
export function poseFor(mode,phase,{side=1,manual={}}={}){
 side=side===-1?-1:1;
 const wave=Math.sin(phase+(side===1?0:Math.PI)),t=(Math.sin(phase)+1)/2;
 const shoulder=[side*23,139,0],hip=[side*13,91,0];
 let arm=0,elbowAngle=0,thigh=0,kneeAngle=0,abduction=0;
 if(mode==='walk'){arm=rad(-wave*20);elbowAngle=rad(15);thigh=rad(wave*24);kneeAngle=rad(8+Math.max(0,-wave)*42);}
 if(side===1&&mode==='sagittal')elbowAngle=rad(t*120);
 if(side===1&&mode==='frontal')abduction=rad(t*82);
 if(mode==='puppet'){arm=rad(angle(manual.shoulder,150));elbowAngle=rad(angle(manual.elbow,140));thigh=rad(angle(manual.hip,100));kneeAngle=rad(angle(manual.knee,130));}
 const elbow=abduction?[shoulder[0]+side*30*Math.sin(abduction),shoulder[1]-30*Math.cos(abduction),0]:[shoulder[0],shoulder[1]-30*Math.cos(arm),30*Math.sin(arm)];
 const wrist=abduction?[elbow[0]+side*28*Math.sin(abduction),elbow[1]-28*Math.cos(abduction),0]:[elbow[0],elbow[1]-28*Math.cos(arm+elbowAngle),elbow[2]+28*Math.sin(arm+elbowAngle)];
 const knee=[hip[0],hip[1]-42*Math.cos(thigh),42*Math.sin(thigh)];
 const ankle=[hip[0],knee[1]-42*Math.cos(thigh-kneeAngle),knee[2]+42*Math.sin(thigh-kneeAngle)];
 return {shoulder,elbow,wrist,hip,knee,ankle};
}
