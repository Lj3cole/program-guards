import {Game} from '../dist/js/game.js';
import {GUARDS} from '../dist/js/data/guards.js';
const order=[0,3,12,15,1,2,4,7,8,11,13,14,5,6,9,10];
for(const merging of [false,true])for(let seed=1;seed<=3;seed++){
 let n=seed,g=new Game(()=>((n=(n*1664525+1013904223)>>>0)/4294967296));g.start();let step=0,peaks={},bossSeconds={},lastWave=1,start=0;
 while(g.mode==='running'&&step<24000){
  if(g.wave!==lastWave){start=g.time;lastWave=g.wave;}
  if(step%15===0){
   if(merging)for(let i=0;i<16;i++){let c=g.cells[i];if(c?.units.length===3&&GUARDS[c.id].tier<3){g.selected=i;g.merge();}}
   for(let i=0;i<16;i++)for(let j=i+1;j<16;j++){let a=g.cells[i],b=g.cells[j];if(a&&b&&a.id===b.id&&a.units.length+b.units.length<=3)g.move(j,i);}
   if(!g.summonProblem())g.summon();
   if(g.pending){let i=g.cells.findIndex(c=>c?.id===g.pending&&c.units.length<3);g.place(i>=0?i:order.find(i=>!g.cells[i]));}
  }
  if(g.bossId)bossSeconds[g.wave]=+(g.time-start).toFixed(1);
  g.update(1/30);peaks[g.wave]=Math.max(peaks[g.wave]||0,g.enemies.length);step++;
 }
 console.log(JSON.stringify({merging,seed,result:g.mode,wave:g.wave,peakWave4:peaks[4],peakWave5:peaks[5],peakWave8:peaks[8],bossSeconds}));
}
