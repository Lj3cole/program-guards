// Original scene drawn on a 360px canvas and enlarged without smoothing.
// Decoration is deterministic and never consumes gameplay randomness.
export function buildScene(){
 const layer=document.createElement('canvas');layer.width=layer.height=360;
 const c=layer.getContext('2d');
 const rect=(x,y,w,h,color)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 function stone(x,y,w,h,seed,wall=false){
  rect(x,y,w,h,'#10151d');rect(x+1,y+1,w-2,h-2,wall?'#3d424d':seed%3?'#343b43':'#3c434a');
  rect(x+1,y+1,w-2,2,wall?'#60646a':'#515b62');rect(x+1,y+3,2,h-4,wall?'#4c535c':'#424b54');rect(x+2,y+h-3,w-3,2,'#222831');
  for(let j=0;j<3;j++)rect(x+4+(seed*7+j*11)%Math.max(1,w-8),y+4+(seed*5+j*3)%Math.max(1,h-8),2,1,'#68727a33');
  if(seed%5===0){rect(x+w-9,y+3,1,4,'#1d242c');rect(x+w-12,y+7,4,1,'#1d242c');}
 }
 function pillar(x,y){
  rect(x-2,y+3,18,22,'#080d14');rect(x,y,14,21,'#252b35');rect(x+2,y+2,10,16,'#59606b');rect(x+2,y+2,3,15,'#737982');rect(x,y,14,4,'#858388');rect(x-1,y+18,16,4,'#444550');rect(x+3,y+6,8,2,'#404853');
 }
 function terminal(x,y){
  rect(x+2,y+3,17,18,'#080e16');rect(x,y,17,17,'#343c4c');rect(x,y,17,2,'#657286');rect(x+2,y+3,13,9,'#0e2730');rect(x+4,y+5,7,1,'#65d6ba');rect(x+4,y+7,3,1,'#44a2a9');rect(x+9,y+7,4,1,'#44a2a9');rect(x+2,y+13,9,2,'#69717b');rect(x+13,y+13,2,2,'#e5b667');
 }
 function crate(x,y){rect(x+1,y+2,14,12,'#10151e');rect(x,y,13,12,'#695445');rect(x,y,13,2,'#a18b62');rect(x,y+9,13,3,'#3d3434');rect(x+2,y+2,2,7,'#3a4148');rect(x+9,y+2,2,7,'#3a4148');rect(x+5,y+4,3,3,'#b8ac75');}
 rect(0,0,360,360,'#10151e');
 // Dungeon walls and uneven stone foundation around the complete battle ring.
 for(let y=0;y<360;y+=12)for(let x=-12;x<360;x+=24)stone(x+(y/12%2?12:0),y,24,12,x+y,true);
 rect(13,13,334,334,'#0b1018');
 for(let y=16;y<345;y+=18)for(let x=16;x<345;x+=18)stone(x,y,18,18,x*3+y);
 // Road is continuous and unobstructed; rails separate it from decoration.
 c.strokeStyle='#0b1018';c.lineWidth=40;c.strokeRect(33,33,294,294);
 c.strokeStyle='#333b43';c.lineWidth=32;c.strokeRect(33,33,294,294);
 for(let side=0;side<4;side++)for(let j=0;j<21;j++){
  const u=18+j*14;
  if(side===0)stone(u,19,14,28,j);
  if(side===1)stone(313,u,28,14,j+21);
  if(side===2)stone(u,313,14,28,j+42);
  if(side===3)stone(19,u,28,14,j+63);
 }
 c.strokeStyle='#6f746b';c.lineWidth=2;c.strokeRect(15,15,330,330);c.strokeStyle='#181f2a';c.lineWidth=3;c.strokeRect(51,51,258,258);
 // Copper pipes, grate channels and coolant conduits inside the road.
 rect(55,55,250,250,'#111923');
 c.strokeStyle='#5e5548';c.lineWidth=4;c.strokeRect(59,59,242,242);c.strokeStyle='#9b8863';c.lineWidth=1;c.strokeRect(58,58,244,244);
 for(let k=0;k<12;k++){
  const v=80+k*17;rect(v,55,3,8,'#292e36');rect(v,297,3,8,'#292e36');rect(55,v,8,3,'#292e36');rect(297,v,8,3,'#292e36');
 }
 // Raised deployment platform. Every grid square is still at its original coordinate.
 rect(64,64,232,232,'#070d17');rect(66,66,228,228,'#70747b');rect(68,68,224,224,'#343b46');
 for(let row=0;row<4;row++)for(let col=0;col<4;col++){
  const x=72+col*54,y=72+row*54;rect(x-1,y-1,52,52,'#111824');
  for(let a=0;a<2;a++)for(let b=0;b<2;b++)stone(x+a*25,y+b*25,25,25,row*17+col*9+a*3+b);
  rect(x+2,y+2,4,1,'#82908a');rect(x+2,y+2,1,4,'#82908a');rect(x+45,y+47,4,1,'#54605c');
  // Faint, inset circuit rune rather than a flat empty box.
  rect(x+21,y+21,8,8,'#315257');rect(x+23,y+23,4,4,'#507370');rect(x+24,y+18,2,3,'#526765');rect(x+24,y+29,2,3,'#526765');
 }
 // Hardware and clutter occupy the corners/gutters, never the walkable road.
 for(const [x,y] of [[3,3],[343,3],[3,336],[343,336]])pillar(x,y);
 for(const [x,y] of [[56,56],[287,287]])terminal(x,y);
 crate(286,56);crate(56,288);
 for(const [x,y] of [[171,3],[171,346]]){rect(x,y,18,11,'#161d28');for(let j=0;j<4;j++)rect(x+2+j*4,y+2,2,6,'#6c787b');}
 // Moss, chips and small stones, kept outside the clear deployment squares.
 for(let j=0;j<48;j++){
  const x=20+(j*83)%322,y=j%2?12:346;rect(x,y,3+j%3,2,'#506352');rect(y,x,2,3,'#3c5148');
 }
 return layer;
}
export function drawSceneLights(c,time){
 // Four tiny wall sconces with stepped, pixel flames and no blur.
 for(const [x,y] of [[24,210],[682,210],[24,484],[682,484]]){
  c.fillStyle='#0d111b';c.fillRect(x-2,y+10,16,16);c.fillStyle='#6f604d';c.fillRect(x,y+6,12,14);
  c.fillStyle='#d86b3c';c.fillRect(x,y-8,12,14);c.fillStyle='#ffb457';c.fillRect(x+2,y-12-(Math.floor(time*5)%2)*2,8,16);c.fillStyle='#ffe4a1';c.fillRect(x+4,y-6,4,10);
 }
}
