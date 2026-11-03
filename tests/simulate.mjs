import {Game} from '../dist/js/game.js';
import {GUARDS} from '../dist/js/data/guards.js';
import {cellCenter,positionAt} from '../dist/js/data/config.js';
const order=[0,3,12,15,1,2,4,7,8,11,13,14,5,6,9,10];
for(let seed=1;seed<=3;seed++){
 let n=seed;const g=new Game(()=>((n=(n*1664525+1013904223)>>>0)/4294967296));g.start();let steps=0;
 while(g.mode==='running'&&steps<60000){
  if(steps%15===0){
   for(let i=0;i<16;i++){const c=g.cells[i];if(c&&c.units.length===3&&GUARDS[c.id].tier<3){g.selected=i;g.merge();}}
   for(let i=0;i<16;i++)for(let j=i+1;j<16;j++){const a=g.cells[i],b=g.cells[j];if(a&&b&&a.id===b.id&&a.units.length+b.units.length<=3)g.move(j,i);}
   if(!g.summonProblem())g.summon();
   if(g.pending){const i=g.cells.findIndex(c=>c&&c.id===g.pending&&c.units.length<3);g.place(i>=0?i:order.find(i=>!g.cells[i]));}
  }
  // During boss fights, move the strongest stacks toward the boss instead of
  // leaving all damage in the starting corner. Uses the same public move action.
  if(g.bossId&&!g.pending&&steps%15===0){
   const boss=g.enemies.find(e=>e.uid===g.bossId);
   if(boss){const point=positionAt(boss.p);
    const slots=Array.from({length:16},(_,i)=>i).sort((a,b)=>Math.hypot(cellCenter(a).x-point.x,cellCenter(a).y-point.y)-Math.hypot(cellCenter(b).x-point.x,cellCenter(b).y-point.y));
    const stacks=g.cells.filter(Boolean).sort((a,b)=>GUARDS[b.id].tier-GUARDS[a.id].tier||GUARDS[b.id].damage/GUARDS[b.id].attackInterval-GUARDS[a.id].damage/GUARDS[a.id].attackInterval);
    for(let k=0;k<stacks.length;k++){const from=g.cells.indexOf(stacks[k]),to=slots[k];if(from>=0&&from!==to)g.move(from,to);}
   }
  }
  g.update(1/30);steps++;
 }
 console.log(JSON.stringify({seed,mode:g.mode,wave:g.wave,seconds:Math.round(g.time),kills:g.kills,merges:g.merges,reason:g.reason}));
 // Loss is a balance observation, not a program error.
 if(!['won','lost'].includes(g.mode))process.exitCode=1;
}
