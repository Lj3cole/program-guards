import {ENEMIES} from './enemies.js';
export function waveCount(number){return number<=4?24:number<=8?26:number<=12?28:number<=16?30:32;}
export function waveInterval(number){return number<=4?.55:number<=8?.52:number<=12?.50:number<=16?.48:.46;}
export const WAVES=Array.from({length:20},(_,i)=>{
 const number=i+1,bossId=number===10?'stack-overflow':number===20?'deadlock':null;
 const pool=Object.values(ENEMIES).filter(e=>e.kind!=='頭目'&&e.firstWave<=number).map(e=>e.id);
 const counts={};
 if(!bossId)for(let j=0;j<waveCount(number);j++){const id=pool[j%pool.length];counts[id]=(counts[id]||0)+1;}
 return {id:`wave-${String(number).padStart(2,'0')}`,number,spawnGroups:Object.entries(counts).map(([enemyId,count])=>({enemyId,count,interval:waveInterval(number)})),bossId,bossTimeLimit:bossId?60:null};
});

// Data-only extension: preserve the 30-enemy budget at wave fourteen.
WAVES[13]={
 id:'wave-14',number:14,bossId:null,bossTimeLimit:null,
 spawnGroups:[
  {enemyId:'syntax-error',count:5,interval:.48},
  {enemyId:'null',count:5,interval:.48},
  {enemyId:'overflow',count:6,interval:.48},
  {enemyId:'loop',count:6,interval:.48},
  {enemyId:'leak',count:8,interval:.48},
 ]
};
