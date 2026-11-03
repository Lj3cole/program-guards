import test from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../dist/js/game.js';
import {CONFIG,cellCenter} from '../dist/js/data/config.js';
import {GUARDS} from '../dist/js/data/guards.js';
const stack=(g,id,n=1)=>({id,units:Array.from({length:n},()=>g.unit())});
const start=(random=()=>0)=>{const g=new Game(random);g.start();g.spawnQueue=[];return g;};
function victim(g,boss=false){const e=g.spawn(boss?'stack-overflow':'syntax-error',boss);e.p=100;return e;}
test('all fifteen guards can be summoned at their weighted intervals and placed, with one normal charge',()=>{
 let before=0;
 for(const [id,d] of Object.entries(GUARDS)){
  const weight=CONFIG.summonTierWeights[d.tier]/CONFIG.tiers[d.tier].length;
  const g=start(()=>(before+weight/2)/100);assert(g.summon());assert.equal(g.lastSummon,id);assert.equal(g.guardCount,1);assert.equal(g.gold,180);assert.equal(g.summonCost,22);assert.equal(g.cells[0].id,id);assert.equal(g.guardCount,1);before+=weight;
 }
 assert.equal(before,100);
});
test('tier boundaries and a large deterministic sample match 75/20/5 with lower high-tier odds',()=>{
 for(const [r,tier] of [[0,1],[.749999,1],[.75,2],[.949999,2],[.95,3],[.999999,3]]){const g=start(()=>r);assert.equal(GUARDS[g.pickSummon()].tier,tier);}
 let seed=19;const g=new Game(()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296)),counts={1:0,2:0,3:0};
 for(let i=0;i<100000;i++)counts[GUARDS[g.pickSummon()].tier]++;
 for(const tier of [1,2,3])assert(Math.abs(counts[tier]/1000-CONFIG.summonTierWeights[tier])<.6,JSON.stringify(counts));
 assert(counts[1]>counts[2]&&counts[2]>counts[3]);
});
test('placement preflight includes high tiers and never rerolls or charges when a possible outcome has no room',()=>{
 const g=start(()=>{throw Error('Must not draw when space is invalid');});g.cells=g.cells.map(()=>stack(g,'bit'));
 assert(g.hasPlace('bit'));assert(!g.hasPlace('debug'));assert(!g.summon());assert.equal(g.gold,200);assert.equal(g.summonCount,0);
 const ids=Object.keys(GUARDS);g.cells=g.cells.map((_,i)=>stack(g,ids[i%ids.length]));g.random=()=>.999999;
 assert(g.summon());assert.equal(g.lastSummon,'compile');const slot=g.cells.findIndex(c=>c.id==='compile');assert.equal(g.cells[slot].units.length,2);
});
test('symbol final hit gives a 30% chance of exactly +10 extra, with a coin effect and no double payment',()=>{
 for(const [roll,bonus] of [[0,10],[.299999,10],[.30,0],[.99,0]]){
  const g=start(()=>roll),e=victim(g);e.hp=2;g.fire(0,GUARDS.symbol,g.unit());assert.equal(e.killedBy,'symbol');g.update(.01);
  assert.equal(g.gold,200+e.reward+bonus);assert.equal(g.bountyGold,bonus);assert.equal(g.kills,1);assert.equal(g.effects.some(f=>f.type==='bounty'),!!bonus);
  g.update(.01);assert.equal(g.gold,200+e.reward+bonus);assert.equal(g.bountyGold,bonus);
 }
});
test('symbol assistance is not final-hit credit, other guards cannot overwrite a dead enemy attribution',()=>{
 const g=start(()=>0),e=victim(g);e.hp=10;g.hit(e,2,cellCenter(0),'#fff','symbol');g.hit(e,20,cellCenter(0),'#fff','bit');assert.equal(e.killedBy,'bit');g.update(.01);assert.equal(g.bountyGold,0);
 const f=victim(g);f.hp=1;g.hit(f,5,cellCenter(0),'#fff','symbol');g.hit(f,100,cellCenter(0),'#fff','debug');assert.equal(f.killedBy,'symbol');g.update(.01);assert.equal(g.bountyGold,10);
});
test('boss kills, area kills, and kills with no guard credit cannot trigger bounty',()=>{
 const g=start(()=>.99);const boss=victim(g,true);boss.hp=1;g.hit(boss,10,cellCenter(0),'#fff','symbol');g.update(.01);assert.equal(g.gold,300);assert.equal(g.bountyGold,0);
 const e=victim(g);e.hp=100;g.fire(0,GUARDS.function,g.unit());assert.equal(e.killedBy,'function');g.update(.01);assert.equal(g.bountyGold,0);const f=victim(g);f.hp=0;g.update(.01);assert.equal(g.bountyGold,0);
});
test('bounty rewards wait while paused and reset clears cumulative bounty and pending high-tier summons',()=>{
 const g=start(()=>0),e=victim(g);e.hp=1;g.fire(0,GUARDS.symbol,g.unit());g.togglePause();g.update(10);assert.equal(g.gold,200);assert.equal(g.bountyGold,0);g.togglePause();g.update(.01);assert.equal(g.bountyGold,10);
 g.random=()=>.999;assert(g.summon());assert.equal(GUARDS[g.lastSummon].tier,3);g.reset();assert.equal(g.bountyGold,0);assert.equal(g.pending,null);assert.equal(g.summonCost,20);assert.equal(g.gold,200);
});
