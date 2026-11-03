const specs=[
 ['syntax-error','語法蟲','普通',11,35,42,3,1],
 ['null','空值怪','普通',12,23,72,3,3],
 ['overflow','溢位怪','普通',13,68,29,3,5],
 ['loop','迴圈蟲','進階',14,58,49,3,11],
 ['leak','洩漏蟲','進階',15,37,88,3,13],
 ['glitch','故障蟹','進階',16,105,34,3,15],
 ['stack-overflow','堆疊巨獸','頭目',17,11000,24,100,10],
 ['deadlock','死鎖雙生怪','頭目',18,34000,26,100,20]
];
export const ENEMIES=Object.fromEntries(specs.map(([id,name,kind,sprite,hp,speed,reward,firstWave])=>[id,{id,name,kind,sprite,hp,speed,reward,firstWave,ability:null}]));
export const HP_GROWTH=1.17;
export const HP_MULTIPLIER=1.10;
