import {CONFIG,positionAt,cellCenter,cellAt} from './data/config.js';
import {GUARDS} from './data/guards.js';
import {buildScene,drawSceneLights} from './scene.js';
export const atlas=new Image();atlas.src=new URL('../assets/units.png',import.meta.url).href;
export const newAtlas=new Image();newAtlas.src=new URL('../assets/new-units.png',import.meta.url).href;
export function sprite(ctx,index,x,y,w,h=w){
 const source=index>=19?newAtlas:atlas;const tile=index>=19?index-19:index;
 if(!source.complete||!source.naturalWidth){ctx.fillStyle='#c0ed7c';ctx.fillRect(x+w*.25,y+h*.25,w*.5,h*.5);return;}
 const cw=source.naturalWidth/5,ch=source.naturalHeight/4;
 ctx.imageSmoothingEnabled=false;ctx.drawImage(source,(tile%5)*cw,Math.floor(tile/5)*ch,cw,ch,x,y,w,h);
}
export function spritePreview(canvas,index){const c=canvas.getContext('2d');c.clearRect(0,0,canvas.width,canvas.height);const size=Math.min(canvas.width,canvas.height);sprite(c,index,(canvas.width-size)/2,(canvas.height-size)/2,size,size);}
export class Renderer{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d');this.drag=null;this.hover=-1;this.scenes=[1,2,3].map(stage=>buildScene(stage));}
 draw(game){
  const c=this.ctx;c.clearRect(0,0,720,720);c.imageSmoothingEnabled=false;
  c.drawImage(this.scenes[game.stage-1],0,0,720,720);drawSceneLights(c,game.time,game.stage);
  c.fillStyle='#d4bf8a88';c.font='16px monospace';c.textAlign='center';
  c.fillText('› ›',360,72);c.fillText('⌄',654,365);c.fillText('‹ ‹',360,661);c.fillText('⌃',66,365);
  for(let i=0;i<16;i++){
   const p=cellCenter(i),x=p.x-50,y=p.y-50,stack=game.cells[i];
   c.fillStyle=(Math.floor(i/4)+i%4)%2?'#223d501a':'#1b2c351a';c.fillRect(x,y,100,100);
   c.strokeStyle='#67767b66';c.lineWidth=1;c.strokeRect(x+.5,y+.5,99,99);
   c.fillStyle='#9aa39788';c.fillRect(x+5,y+5,3,3);c.fillRect(x+92,y+92,3,3);
   const valid=game.pending&&(!stack||stack.id===game.pending&&stack.units.length<3);
   if(valid){c.fillStyle='#bbe17a15';c.fillRect(x+2,y+2,96,96);c.setLineDash([6,5]);c.strokeStyle='#badc7c88';c.strokeRect(x+5,y+5,90,90);c.setLineDash([]);}
   if(i===game.selected){c.strokeStyle='#c9f28a';c.lineWidth=3;c.strokeRect(x+1,y+1,98,98);}
   if(this.drag?.to===i){c.strokeStyle='#ffffffbb';c.lineWidth=2;c.strokeRect(x+4,y+4,92,92);}
   if(stack){const d=GUARDS[stack.id];let size=stack.units.length>1?69:85;
    for(let j=0;j<stack.units.length;j++){let ox=stack.units.length===1?0:(j-(stack.units.length-1)/2)*18;let oy=j%2?-6:4;
     sprite(c,d.sprite,p.x-size/2+ox,p.y-size/2+oy,size);}
    c.fillStyle='#080f20ed';c.fillRect(p.x-30,p.y+33,60,15);c.font='bold 9px monospace';c.textAlign='center';c.fillStyle=d.color;c.fillText(`${d.id} ×${stack.units.length}`,p.x,p.y+44);
    for(let n=0;n<d.tier;n++){c.fillStyle=d.color;c.fillRect(p.x-6+(n-(d.tier-1)/2)*9,p.y-46,5,5);}
   }
  }
  // Range only when selecting, so the board remains uncluttered.
  if(game.selected>=0&&game.cells[game.selected]&&!game.pending){const p=cellCenter(game.selected),d=GUARDS[game.cells[game.selected].id];c.save();c.beginPath();c.rect(0,0,720,720);c.clip();c.strokeStyle=d.color+'55';c.lineWidth=1;c.setLineDash([5,6]);c.beginPath();c.arc(p.x,p.y,d.range,0,Math.PI*2);c.stroke();c.setLineDash([]);c.restore();}
  for(const e of [...game.enemies].sort((a,b)=>positionAt(a.p).y-positionAt(b.p).y)){
   const p=positionAt(e.p),size=e.boss?77:43,bob=Math.sin(game.time*7+e.uid)*1.5;
   c.fillStyle='#07191a55';c.beginPath();c.ellipse(p.x,p.y+12,size*.32,7,0,0,Math.PI*2);c.fill();
   sprite(c,e.sprite,p.x-size/2,p.y-size*.58+bob,size);
   c.fillStyle='#112322';c.fillRect(p.x-size*.32,p.y-size*.49-5,size*.64,4);c.fillStyle=e.boss?'#eea29a':'#c9db88';c.fillRect(p.x-size*.32,p.y-size*.49-5,size*.64*Math.max(0,e.hp/e.maxHp),4);
   if(e.stun>0){
    c.fillStyle='#ffe082';c.font='bold 9px monospace';c.fillText('STOP',p.x,p.y-size*.5-10);
    c.strokeStyle='#ffe082';c.lineWidth=2;c.beginPath();c.arc(p.x,p.y, size*.42,0,Math.PI*2);c.stroke();
   }
  }
  for(const f of game.effects){const a=f.life/f.maxLife;c.save();c.globalAlpha=a;c.strokeStyle=f.color;c.fillStyle=f.color;
   if(f.type==='gem'){c.font='bold 17px monospace';c.textAlign='center';c.fillText('◆ +1',f.x,f.y-(1-a)*36);}
   else if(f.type==='bounty'){
    c.font='bold 17px monospace';c.textAlign='center';c.fillText(`+${f.amount}`,f.x,f.y-(1-a)*32);
   }else if(f.type==='stun-wave'){
    c.globalAlpha=a*.16;c.beginPath();c.arc(f.x,f.y,f.radius,0,Math.PI*2);c.fill();
    c.globalAlpha=a;c.lineWidth=4;c.beginPath();c.arc(f.x,f.y,f.radius*(1-a*.7),0,Math.PI*2);c.stroke();
    c.font='bold 14px monospace';c.textAlign='center';c.fillText('STOP',f.x,f.y-12);
   }else if(f.type==='shot'){c.lineWidth=3;c.beginPath();c.moveTo(f.x,f.y);c.lineTo(f.tx,f.ty);c.stroke();c.fillRect(f.tx-3,f.ty-3,6,6);c.fillRect(f.tx-10,f.ty-1,4,3);c.fillRect(f.tx+7,f.ty-1,4,3);c.fillRect(f.tx-1,f.ty-10,3,4);}
   else {const r=f.type==='blast'?f.radius*(1-a*.6):f.type==='merge'?52*(1-a):30*(1-a);c.lineWidth=3;c.beginPath();c.arc(f.x,f.y,r,0,Math.PI*2);c.stroke();}
   c.restore();
  }
  if(this.drag?.active&&game.cells[this.drag.from]){const d=GUARDS[game.cells[this.drag.from].id];c.save();c.globalAlpha=.75;sprite(c,d.sprite,this.drag.x-44,this.drag.y-44,88);c.restore();}

 }
}
