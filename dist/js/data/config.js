export const CONFIG = Object.freeze({
  width:720, height:720, gridSize:4, gridX:144, gridY:144, cellSize:108,
  maxGuards:30, maxStack:3, startGold:200, summonCost:20, summonIncrease:2, luckCost:100, luckIncrease:50,
  maxEnemies:80, waveDuration:30, bossTimeLimit:60,
  bossControlFactor:0.25, stunRecovery:0.6, bossStunRecovery:1.2, step:1/60,
  tiers:{1:['bit','symbol','bracket'],2:['print','for','if','array'],3:['function','return','break','debug']},
  path:[{x:66,y:66},{x:654,y:66},{x:654,y:654},{x:66,y:654}],
});
export const PATH_LENGTH=2352;
export function positionAt(distance){
  const d=((distance%PATH_LENGTH)+PATH_LENGTH)%PATH_LENGTH;
  const side=Math.floor(d/588), t=d%588;
  return [{x:66+t,y:66},{x:654,y:66+t},{x:654-t,y:654},{x:66,y:654-t}][side];
}
export function cellCenter(i){return {x:CONFIG.gridX+(i%4+.5)*108,y:CONFIG.gridY+(Math.floor(i/4)+.5)*108};}
export function cellAt(x,y){
  const c=Math.floor((x-CONFIG.gridX)/108),r=Math.floor((y-CONFIG.gridY)/108);
  return c>=0&&c<4&&r>=0&&r<4?r*4+c:-1;
}
