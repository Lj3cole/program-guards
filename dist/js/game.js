import {CONFIG,positionAt,cellCenter} from './data/config.js';
import {GUARDS} from './data/guards.js';
import {ENEMIES,HP_GROWTH,HP_MULTIPLIER} from './data/enemies.js';
import {WAVES} from './data/waves.js';
import {LUCK_EFFECTS} from './data/luck.js';

export class Game {
 constructor(random=Math.random){this.random=random;this.reset();}
 reset(){
  this.mode='ready';this.gold=CONFIG.startGold;this.cells=Array(16).fill(null);this.pending=null;
  this.selected=-1;this.enemies=[];this.effects=[];this.bursts=[];this.wave=0;this.waveTimer=30;
  this.bossId=null;this.bossTimer=0;this.spawnQueue=[];this.waveElapsed=0;this.time=0;
  this.summonCount=0;this.luckCount=0;this.activeLuck={};this.lastLuck=null;this.extraQueue=[];
  this.kills=0;this.merges=0;this.reason='';this.serial=0;this.notice='準備好了嗎？開始守衛你的程式世界。';
 }
 start(){if(this.mode==='ready'){this.mode='running';this.beginWave(1);this.notice='點擊召喚，再點格子放置小兵。';}}
 togglePause(){if(this.mode==='running')this.mode='paused';else if(this.mode==='paused')this.mode='running';}
 get guardCount(){return this.cells.reduce((n,c)=>n+(c?.units.length||0),0)+(this.pending?1:0);}
 get summonCost(){return CONFIG.summonCost+this.summonCount*CONFIG.summonIncrease;}
 get luckCost(){return CONFIG.luckCost+this.luckCount*CONFIG.luckIncrease;}
 hasLuck(id){return (this.activeLuck[id]||0)>this.time;}
 get damageFactor(){return (this.hasLuck('power')?1.25:1)*(this.hasLuck('weak')?.8:1);}
 get intervalFactor(){return (this.hasLuck('lag')?1.25:1)/(this.hasLuck('overclock')?1.25:1);}
 enemySpeedFactor(e){return (this.hasLuck('slow')?(e.boss?.875:.75):1)*(this.hasLuck('haste')&&!e.boss?1.25:1);}
 canReinforce(){return !this.pending&&this.guardCount<CONFIG.maxGuards&&CONFIG.tiers[2].every(id=>this.hasPlace(id));}
 luckPool(){return LUCK_EFFECTS.filter(e=>e.id!=='reinforce'||this.canReinforce());}
 luckProblem(){
  if(this.mode!=='running')return '請先開始或繼續遊戲。';
  if(this.pending)return '請先放置已獲得的守衛，再抽抽樂。';
  if(this.gold<this.luckCost)return `金幣不足，需要 ${this.luckCost} 金幣。`;
  return '';
 }
 drawLuck(){
  const problem=this.luckProblem();if(problem){this.notice=problem;return false;}
  const pool=this.luckPool(),total=pool.reduce((n,e)=>n+e.weight,0);
  let point=Math.min(.999999999999,Math.max(0,this.random()))*total;
  let chosen=pool[pool.length-1];for(const e of pool){point-=e.weight;if(point<0){chosen=e;break;}}
  this.gold-=this.luckCost;this.luckCount++;this.lastLuck={id:chosen.id,at:this.time};
  if(chosen.duration)this.activeLuck[chosen.id]=this.time+chosen.duration;
  else if(chosen.id==='cleanup'){
   for(const e of this.enemies)if(!e.boss&&e.hp>0)e.hp*=.8;
   this.effects.push({type:'blast',x:360,y:360,radius:340,color:'#8bebd5',life:.8,maxLife:.8});
  }else if(chosen.id==='reinforce'){
   this.pending=this.randomPick(CONFIG.tiers[2]);this.selected=-1;
  }else if(chosen.id==='invasion'){
   const ids=Object.values(ENEMIES).filter(e=>e.kind!=='頭目'&&e.firstWave<=this.wave).map(e=>e.id);
   for(let i=0;i<5;i++)this.extraQueue.push({at:this.time+(i+1)*.6,id:this.randomPick(ids)});
   this.extraQueue.sort((a,b)=>a.at-b.at);
  }
  this.notice=`${chosen.positive?'增益':'負面'}：${chosen.name}！${chosen.description}`;return true;
 }
 randomPick(ids){return ids[Math.min(ids.length-1,Math.floor(this.random()*ids.length))];}
 hasPlace(id){return this.cells.some(c=>!c||(c.id===id&&c.units.length<CONFIG.maxStack));}
 summonProblem(){
  if(this.mode!=='running')return '請先開始或繼續遊戲。';
  if(this.pending)return '請先放置已獲得的守衛。';
  if(this.hasLuck('jam'))return `召喚干擾中，${Math.ceil(this.activeLuck.jam-this.time)} 秒後恢復。`;
  if(this.guardCount>=CONFIG.maxGuards)return '角色已達 30 隻，合成後可再召喚。';
  if(this.gold<this.summonCost)return '金幣不足，擊敗怪物可獲得金幣。';
  if(!CONFIG.tiers[1].every(id=>this.hasPlace(id)))return '請先合成或整理格子，保留召喚空間。';
  return '';
 }
 summon(){const problem=this.summonProblem();if(problem){this.notice=problem;return false;}
  this.pending=this.randomPick(CONFIG.tiers[1]);this.gold-=this.summonCost;this.summonCount++;this.selected=-1;
  this.notice=`召喚到 ${GUARDS[this.pending].name}！點擊亮起的格子放置。`;return true;
 }
 unit(){return {cooldown:0,special:0};}
 place(i){
  if(this.mode!=='running'||!this.pending||i<0||i>15)return false;
  let c=this.cells[i];
  if(c&&(c.id!==this.pending||c.units.length>=3)){this.notice='這格放不下，請選擇亮起的格子。';return false;}
  if(!c)c=this.cells[i]={id:this.pending,units:[]};
  c.units.push(this.unit());this.notice=`${GUARDS[this.pending].name} 已就位。`;this.pending=null;this.selected=i;return true;
 }
 select(i){if(this.mode!=='running')return;if(this.pending){this.place(i);return;}this.selected=i>=0&&this.cells[i]?i:-1;}
 move(from,to){
  if(this.mode!=='running'||this.pending||from<0||to<0||from>15||to>15||from===to||!this.cells[from])return false;
  const a=this.cells[from],b=this.cells[to];
  if(b&&a.id===b.id){if(a.units.length+b.units.length>3){this.notice='同格最多三隻，這次移動未生效。';return false;}b.units.push(...a.units);this.cells[from]=null;}
  else {this.cells[to]=a;this.cells[from]=b;}
  this.selected=to;this.notice=b&&b.id!==a.id?'兩組守衛已交換位置。':'守衛位置已調整。';return true;
 }
 merge(){
  if(this.mode!=='running'||this.pending)return false;
  const i=this.selected,c=this.cells[i];
  if(!c||c.units.length!==3){this.notice='選取同格三隻相同角色，才能合成。';return false;}
  const tier=GUARDS[c.id].tier;if(tier===3){this.notice='已達最高階，不再合成。';return false;}
  const id=this.randomPick(CONFIG.tiers[tier+1]);this.cells[i]={id,units:[this.unit()]};this.merges++;
  this.notice=`合成成功！${GUARDS[id].name} 加入守衛隊。`;const p=cellCenter(i);
  this.effects.push({type:'merge',x:p.x,y:p.y,color:GUARDS[id].color,life:.8,maxLife:.8});return true;
 }
 beginWave(number){
  this.wave=number;this.waveElapsed=0;this.waveTimer=CONFIG.waveDuration;this.spawnQueue=[];
  const w=WAVES[number-1];
  if(w.bossId){const e=this.spawn(w.bossId,true);this.bossId=e.uid;this.bossTimer=w.bossTimeLimit;this.notice=`頭目 ${e.name} 登場！60 秒內擊敗它。`;return;}
  // Interleave groups, so mixed waves do not arrive as isolated blocks.
  const left=w.spawnGroups.map(g=>({...g}));let t=0;
  while(left.some(g=>g.count>0))for(const g of left)if(g.count>0){this.spawnQueue.push({at:t,id:g.enemyId});t+=g.interval;g.count--;}
  this.notice=`第 ${number} 波開始，準備迎接 Bug！`;
 }
 spawn(id,boss=false){
  const d=ENEMIES[id],hp=boss?d.hp:Math.round(d.hp*HP_MULTIPLIER*Math.pow(HP_GROWTH,this.wave-1));
  const e={...d,uid:++this.serial,maxHp:hp,hp,p:0,stun:0,stunLock:0,boss};this.enemies.push(e);
  if(this.enemies.length>=CONFIG.maxEnemies)this.lose('場上怪物達到 80 隻，系統被 Bug 淹沒了。');return e;
 }
 lose(reason){this.mode='lost';this.reason=reason;this.notice=reason;}
 targets(cell,def){const p=cellCenter(cell);return this.enemies.filter(e=>e.hp>0&&Math.hypot(positionAt(e.p).x-p.x,positionAt(e.p).y-p.y)<=def.range).sort((a,b)=>def.attackType==='execute'?a.hp/a.maxHp-b.hp/b.maxHp:b.p-a.p);}
 hit(e,damage,from,color){if(!e||e.hp<=0)return;const p=positionAt(e.p);e.hp-=damage*this.damageFactor;this.effects.push({type:'shot',x:from.x,y:from.y,tx:p.x,ty:p.y,color,life:.16,maxLife:.16});}
 fire(i,def,u){
  const ts=this.targets(i,def);if(!ts.length)return;const p=cellCenter(i),e=ts[0];
  const damage=def.damage*(def.attackType==='execute'&&e.hp/e.maxHp<def.effect.threshold?def.effect.multiplier:1);
  if(def.attackType==='multi')ts.slice(0,def.effect.targets).forEach(t=>this.hit(t,damage,p,def.color));
  else {this.hit(e,damage,p,def.color);if(def.attackType==='burst'){for(let k=1;k<3;k++)this.bursts.push({due:this.time+k*.11,cell:i,guardId:def.id,target:e.uid,damage:def.damage});}}
  u.cooldown=def.attackInterval*this.intervalFactor;
  if(def.tier===3&&u.special<=0){
   const f=def.effect,pos=positionAt(e.p),factor=e.boss?CONFIG.bossControlFactor:1;
   if(f.type==='blast'){
    this.effects.push({type:'blast',x:pos.x,y:pos.y,radius:f.radius,color:def.color,life:.5,maxLife:.5});
    for(const t of this.enemies){const tp=positionAt(t.p);if(t.hp>0&&Math.hypot(tp.x-pos.x,tp.y-pos.y)<=f.radius)t.hp-=f.damage*this.damageFactor;}
   } else if(f.type==='push'){e.p=Math.max(0,e.p-f.distance*factor);this.effects.push({type:'ring',x:pos.x,y:pos.y,color:def.color,life:.4,maxLife:.4});}
   else if(f.type==='stun'){
    let affected=0;
    for(const t of this.enemies){
     const tp=positionAt(t.p);
     if(t.hp<=0||t.stunLock>0||Math.hypot(tp.x-pos.x,tp.y-pos.y)>f.radius)continue;
     const duration=f.duration*(t.boss?CONFIG.bossControlFactor:1);
     t.stun=Math.max(t.stun,duration);
     // Recovery time prevents multiple STOP units from permanently freezing enemies.
     t.stunLock=duration+(t.boss?CONFIG.bossStunRecovery:CONFIG.stunRecovery);
     affected++;
    }
    if(affected)this.effects.push({type:'stun-wave',x:pos.x,y:pos.y,radius:f.radius,color:def.color,life:.65,maxLife:.65});
   }
   u.special=f.interval;
  }
 }
 update(dt){
  if(this.mode!=='running')return;
  this.time+=dt;this.waveElapsed+=dt;
  for(const id of Object.keys(this.activeLuck))if(this.activeLuck[id]<=this.time)delete this.activeLuck[id];
  this.effects=this.effects.filter(f=>(f.life-=dt)>0);
  while(this.spawnQueue.length&&this.spawnQueue[0].at<=this.waveElapsed&&this.mode==='running')this.spawn(this.spawnQueue.shift().id);
  while(this.extraQueue.length&&this.extraQueue[0].at<=this.time&&this.mode==='running')this.spawn(this.extraQueue.shift().id);
  if(this.mode!=='running')return;
  for(const e of this.enemies){const frozen=Math.min(dt,e.stun);e.stun=Math.max(0,e.stun-dt);e.stunLock=Math.max(0,e.stunLock-dt);e.p+=e.speed*this.enemySpeedFactor(e)*(dt-frozen);}
  const due=this.bursts.filter(b=>b.due<=this.time);this.bursts=this.bursts.filter(b=>b.due>this.time);
  for(const b of due){const d=GUARDS[b.guardId];if(this.cells[b.cell]?.id!==b.guardId)continue;const t=this.enemies.find(e=>e.uid===b.target&&e.hp>0)||this.targets(b.cell,d)[0];if(t)this.hit(t,b.damage,cellCenter(b.cell),d.color);}
  for(let i=0;i<16;i++){const c=this.cells[i];if(!c)continue;const d=GUARDS[c.id];for(const u of c.units){u.cooldown-=dt;u.special-=dt;if(u.cooldown<=0)this.fire(i,d,u);}}
  // Resolve kills before deadline checks on the same simulation tick.
  let bossKilled=false;
  this.enemies=this.enemies.filter(e=>{if(e.hp>0)return true;this.gold+=e.reward;this.kills++;if(e.uid===this.bossId)bossKilled=true;return false;});
  if(bossKilled){this.bossId=null;this.bossTimer=0;this.waveTimer=CONFIG.waveDuration;this.notice='頭目已擊敗！獲得 100 金幣。';}
  if(this.bossId){this.bossTimer-=dt;if(this.bossTimer<=0)this.lose('頭目倒數結束，這次守衛失敗了。');}
  else if(this.wave===WAVES.length){if(!this.enemies.length&&!this.spawnQueue.length&&!this.extraQueue.length){this.mode='won';this.reason='全部 20 波已完成，Bug 已清空。';}}
  else if(!bossKilled){this.waveTimer-=dt;if(this.waveTimer<=0)this.beginWave(this.wave+1);}
 }
}
