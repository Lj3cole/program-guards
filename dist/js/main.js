import {Game} from './game.js';
import {Renderer,spritePreview,atlas} from './render.js';
import {CONFIG,cellAt} from './data/config.js';
import {GUARDS,TIER_NAMES} from './data/guards.js';
import {ENEMIES} from './data/enemies.js';
import {LUCK_EFFECTS} from './data/luck.js';
const $=id=>document.getElementById(id);
const game=new Game(),canvas=$('board'),renderer=new Renderer(canvas);
let previous=0,accumulator=0,lastUI=0,selectionKey='',lastCover='',rosterBuilt=false,luckKey='',probabilityKey='',activeKey='';
const modeNames={ready:'等待開始',running:'守衛進行中',paused:'已暫停',won:'守衛成功',lost:'系統失守'};
const safeText=(id,text)=>{const e=$(id);if(e.textContent!==String(text))e.textContent=text;};
function updateUI(){
 safeText('gold-stat',game.gold);safeText('wave-stat',String(game.wave).padStart(2,'0'));safeText('enemy-stat',game.enemies.length);safeText('guard-stat',game.guardCount);safeText('mode-badge',modeNames[game.mode]);safeText('notice',game.notice);
 $('enemy-meter').style.width=game.enemies.length/80*100+'%';$('enemy-meter').style.background=game.enemies.length>=60?'#ec9c7e':'#c0ed7c';
 const boss=game.enemies.find(e=>e.uid===game.bossId);$('boss-banner').hidden=!boss;
 safeText('timer-label',boss?'頭目戰':'倒數');safeText('time-stat',boss?'暫停':game.wave===20?'清場':`${Math.max(0,Math.ceil(game.waveTimer))}s`);
 if(boss){safeText('boss-name',boss.name);safeText('boss-clock',`${Math.max(0,Math.ceil(game.bossTimer))}s`);$('boss-hp').style.width=Math.max(0,boss.hp/boss.maxHp*100)+'%';}
 $('summon').disabled=!!game.summonProblem();safeText('summon-cost',game.summonCost);
 updateLuckUI();
 $('question-unit').hidden=!!game.pending;$('pending-sprite').hidden=!game.pending;
 safeText('pending-name',game.pending?GUARDS[game.pending].name:'隨機基礎小兵');safeText('pending-desc',game.pending?'點擊戰場上亮起的格子放置':'Bit・符號兵・括號兵，各 ⅓ 機率');
 if(game.pending)spritePreview($('pending-sprite'),GUARDS[game.pending].sprite);
 safeText('summon-help',game.pending?'放置完成前不能再次召喚、移動或合成。':game.summonProblem()||`本次 ${game.summonCost} 金幣，成功召喚後下次再加 ${CONFIG.summonIncrease}。`);
 const cell=game.cells[game.selected],key=cell?`${cell.id}-${cell.units.length}-${game.selected}`:'';
 $('selection-empty').hidden=!!cell;$('selection-info').hidden=!cell;
 if(cell){const d=GUARDS[cell.id];if(key!==selectionKey){spritePreview($('selected-sprite'),d.sprite);safeText('selected-tier',`T${d.tier} · ${TIER_NAMES[d.tier]}`);safeText('selected-name',d.name);safeText('selected-count',`同格 ${cell.units.length} / 3 隻`);safeText('selected-description',d.description);safeText('selected-damage',d.damage);safeText('selected-speed',`${d.attackInterval}s`);safeText('selected-range',`${d.range}`);}
 $('merge').disabled=game.mode!=='running'||!!game.pending||cell.units.length!==3||d.tier===3;
 safeText('merge-help',d.tier===3?'已達最高階，可拖曳調整作戰位置。':`同格再集齊 ${3-cell.units.length} 隻即可合成下一階。`);
 }
 selectionKey=key;
 $('pause').disabled=!['running','paused'].includes(game.mode);safeText('pause',game.mode==='paused'?'▶ 繼續':'Ⅱ 暫停');
 $('game-cover').hidden=game.mode==='running';
 if(lastCover!==game.mode){lastCover=game.mode;
 if(game.mode==='ready'){safeText('cover-title','你的守衛隊，等你指揮。');$('cover-description').innerHTML='召喚小兵、合成升階。<br>別讓場上的 Bug 達到 80 隻。';safeText('cover-start','▶ 開始守衛');}
 if(game.mode==='paused'){safeText('cover-title','稍作休息，系統已暫停。');safeText('cover-description','怪物、攻擊與倒數都已停止，準備好再繼續。');safeText('cover-start','▶ 繼續守衛');}
 if(game.mode==='won'||game.mode==='lost'){safeText('cover-title',game.mode==='won'?'系統安全，守衛成功！':'Bug 入侵，守衛失敗。');safeText('cover-description',`${game.reason} 本次擊敗 ${game.kills} 隻，完成 ${game.merges} 次合成。`);safeText('cover-start','↻ 再挑戰一次');}
 }
}
function updateLuckUI(){
 safeText('luck-cost',game.luckCost);$('draw-luck').disabled=!!game.luckProblem();
 safeText('luck-help',game.luckProblem()||`已抽 ${game.luckCount} 次 · 下次 ${game.luckCost} 金幣 · 每次加 50`);
 const result=game.lastLuck?LUCK_EFFECTS.find(e=>e.id===game.lastLuck.id):null;
 const key=result?`${game.luckCount}-${result.id}`:'';
 if(key!==luckKey){luckKey=key;
  $('luck-result').className='luck-result'+(result?(result.positive?' positive':' negative'):'');
  safeText('luck-result-kind',result?(result.positive?'↑ 增益指令':'↓ 異常指令'):'等待指令');
  safeText('luck-result-name',result?result.name:'這次，運氣站在哪邊？');
  safeText('luck-result-desc',result?result.description:'第一次 100 金幣，每抽一次再加 50。');
 }
 const pool=game.luckPool(),total=pool.reduce((n,e)=>n+e.weight,0),pkey=pool.map(e=>e.id).join(',');
 if(pkey!==probabilityKey){probabilityKey=pkey;const host=$('luck-probabilities');host.replaceChildren();
  for(const e of LUCK_EFFECTS){const row=document.createElement('div');row.className='probability-row '+(e.positive?'positive':'negative');
   const title=document.createElement('strong');title.textContent=(e.positive?'↑ ':'↓ ')+e.name;
   const chance=document.createElement('b');chance.textContent=pool.includes(e)?`${+(e.weight/total*100).toFixed(1)}%`:'暫不參與';
   const desc=document.createElement('small');desc.textContent=e.description;row.append(title,chance,desc);host.append(row);
  }
 }
 const active=LUCK_EFFECTS.filter(e=>game.hasLuck(e.id)),queue=game.extraQueue.length;
 const akey=active.map(e=>`${e.id}:${Math.ceil(game.activeLuck[e.id]-game.time)}`).join(',')+':'+queue;
 if(akey!==activeKey){activeKey=akey;const host=$('active-luck');host.replaceChildren();host.hidden=!active.length&&!queue;
  for(const e of active){const tag=document.createElement('span');tag.className=e.positive?'positive':'negative';tag.textContent=`${e.positive?'↑':'↓'} ${e.name} · ${Math.ceil(game.activeLuck[e.id]-game.time)}s`;host.append(tag);}
  if(queue){const tag=document.createElement('span');tag.className='negative';tag.textContent=`↓ 入侵援軍待登場：${queue} 隻`;host.append(tag);}
 }
}
function startOrResume(){if(game.mode==='ready')game.start();else if(game.mode==='paused')game.togglePause();else if(['won','lost'].includes(game.mode)){game.reset();game.start();}updateUI();}
$('cover-start').addEventListener('click',startOrResume);
$('summon').addEventListener('click',()=>{game.summon();updateUI();});
$('draw-luck').addEventListener('click',()=>{game.drawLuck();updateUI();});
$('merge').addEventListener('click',()=>{game.merge();updateUI();});
$('pause').addEventListener('click',()=>{game.togglePause();renderer.drag=null;updateUI();});
$('restart').addEventListener('click',()=>{if(game.mode==='ready'||confirm('確定重新開始？目前的角色與進度會清空。')){game.reset();renderer.drag=null;selectionKey='';updateUI();}});
const coords=e=>{const b=canvas.getBoundingClientRect();return{x:(e.clientX-b.left)*720/b.width,y:(e.clientY-b.top)*720/b.height};};
canvas.addEventListener('pointerdown',e=>{if(game.mode!=='running')return;const p=coords(e),i=cellAt(p.x,p.y);if(i<0)return;e.preventDefault();canvas.setPointerCapture(e.pointerId);
 if(game.pending){game.place(i);updateUI();return;}
 game.select(i);renderer.drag=game.cells[i]?{from:i,to:i,x:p.x,y:p.y,sx:p.x,sy:p.y,active:false,pointer:e.pointerId}:null;updateUI();
});
canvas.addEventListener('pointermove',e=>{const p=coords(e),d=renderer.drag;if(!d)return;d.x=p.x;d.y=p.y;d.to=cellAt(p.x,p.y);if(Math.hypot(p.x-d.sx,p.y-d.sy)>8)d.active=true;});
canvas.addEventListener('pointerup',e=>{const d=renderer.drag;if(d?.active){const p=coords(e);game.move(d.from,cellAt(p.x,p.y));}renderer.drag=null;updateUI();});
canvas.addEventListener('pointercancel',()=>{renderer.drag=null;});
function buildRoster(){if(rosterBuilt)return;rosterBuilt=true;const host=$('roster-content');
 for(const tier of [1,2,3]){const h=document.createElement('h3');h.textContent=`T${tier} · ${TIER_NAMES[tier]}`;host.append(h);const grid=document.createElement('div');grid.className='roster-grid';for(const d of Object.values(GUARDS).filter(g=>g.tier===tier))grid.append(card(d,true));host.append(grid);}
 const h=document.createElement('h3');h.textContent='BUG · 怪物與頭目';host.append(h);const grid=document.createElement('div');grid.className='roster-grid';for(const d of Object.values(ENEMIES))grid.append(card(d,false));host.append(grid);
}
function card(d,guard){const el=document.createElement('article');el.className='roster-card';const c=document.createElement('canvas');c.width=150;c.height=110;el.append(c);spritePreview(c,d.sprite);const name=document.createElement('strong');name.textContent=d.id;el.append(name);const sub=document.createElement('small');sub.textContent=d.name;el.append(sub);const p=document.createElement('p');p.textContent=guard?d.description:`${d.kind} · 第 ${d.firstWave} 波起出現`;el.append(p);if(guard){const details=document.createElement('details'),sum=document.createElement('summary');sum.textContent='程式概念';details.append(sum,document.createTextNode(d.conceptMeaning));el.append(details);}return el;}
$('roster-open').addEventListener('click',()=>{buildRoster();$('roster-dialog').showModal();});$('roster-close').addEventListener('click',()=>$('roster-dialog').close());
$('roster-dialog').addEventListener('click',e=>{if(e.target===$('roster-dialog')){const b=e.target.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)e.target.close();}});
atlas.addEventListener('load',()=>{selectionKey='';updateUI();});
function frame(now){const delta=previous?Math.min(.25,(now-previous)/1000):0;previous=now;if(game.mode==='running'){accumulator+=delta;while(accumulator>=CONFIG.step){game.update(CONFIG.step);accumulator-=CONFIG.step;}}else accumulator=0;
 renderer.draw(game);if(now-lastUI>90){updateUI();lastUI=now;}requestAnimationFrame(frame);
}
// Prevent a hidden tab from simulating a long unobserved battle.
document.addEventListener('visibilitychange',()=>{if(document.hidden&&game.mode==='running'){game.togglePause();renderer.drag=null;updateUI();}});
updateUI();requestAnimationFrame(frame);
