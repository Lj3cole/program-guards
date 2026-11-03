import {STAGES} from './stages.js';
import {ENEMIES} from './enemies.js';
export function waveCount(number){return number<=4?32:number<=8?34:number<=12?36:number<=16?38:40;}
export function waveInterval(number){return number<=4?.55:number<=8?.52:number<=12?.50:number<=16?.48:.46;}
export function createWaves(stage=1){const settings=STAGES[stage-1];return Array.from({length:20},(_,i)=>{
 const number=i+1,bossId=number===10?settings.bosses[0]:number===20?settings.bosses[1]:null;
 const pool=Object.values(ENEMIES).filter(e=>e.kind!=='頭目'&&e.stage<=stage&&(e.stage<stage||e.firstWave<=number)).map(e=>e.id);
 const counts={};
 if(!bossId)for(let j=0;j<waveCount(number)+settings.countBonus;j++){const id=pool[j%pool.length];counts[id]=(counts[id]||0)+1;}
 return {id:`wave-${String(number).padStart(2,'0')}`,number,spawnGroups:Object.entries(counts).map(([enemyId,count])=>({enemyId,count,interval:waveInterval(number)})),bossId,bossTimeLimit:bossId?60:null};
});}
export const WAVES=createWaves(1);


WAVES[13].spawnGroups=[['syntax-error',6],['null',6],['overflow',8],['loop',8],['leak',10]].map(([enemyId,count])=>({enemyId,count,interval:.48}));
