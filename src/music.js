export const SCALE_PATTERNS={major:[0,2,4,5,7,9,11],minor:[0,2,3,5,7,8,10],pentatonic:[0,2,4,7,9]};
export function clampBpm(bpm){return Math.min(240,Math.max(40,Number(bpm)||120));}
export function getLoopDurationSeconds(bpm){return(60/clampBpm(bpm))*16;}
export function getLoopPhase(contextTime,startTime,bpm){const duration=getLoopDurationSeconds(bpm);const elapsed=Math.max(0,contextTime-startTime);return(((elapsed%duration)+duration)%duration)/duration;}
export function worldXToLoopSeconds(x,bpm){return Math.min(1,Math.max(0,x))*getLoopDurationSeconds(bpm);}
export function midiToFrequency(midi){return 440*2**((midi-69)/12);}
function allowedNotesNear(midi,key,pattern){const baseOctave=Math.floor(midi/12)-2;const notes=[];for(let octave=baseOctave;octave<=baseOctave+4;octave+=1){const octaveBase=octave*12+key;for(const step of pattern)notes.push(octaveBase+step);}notes.sort((a,b)=>a-b);return notes;}
export function applyScaleAttraction(midi,settings={}){if(settings.mode==='chromatic')return midi;const key=((Number(settings.key)||0)%12+12)%12;const pattern=SCALE_PATTERNS[settings.scale]||SCALE_PATTERNS.major;const attraction=Math.min(.95,Math.max(0,Number(settings.attraction??.78)));const notes=allowedNotesNear(midi,key,pattern);let lower=notes[0],upper=notes[notes.length-1];for(let i=0;i<notes.length-1;i+=1){if(midi>=notes[i]&&midi<=notes[i+1]){lower=notes[i];upper=notes[i+1];break;}}if(upper===lower)return lower;const t=(midi-lower)/(upper-lower);const warped=t-(attraction/(2*Math.PI))*Math.sin(2*Math.PI*t);return lower+warped*(upper-lower);}
export function pressureToVelocity(pressure,pointerType='pen'){if(pointerType==='mouse')return .62;const p=Number.isFinite(pressure)&&pressure>0?pressure:.5;return Math.min(1,Math.max(.08,.12+p*.88));}
