const specs=[
 ['syntax-error','語法蟲','普通',11,35,42,3,1],
 ['null','空值怪','普通',12,23,72,3,3],
 ['overflow','溢位怪','普通',13,68,29,3,5],
 ['loop','迴圈蟲','進階',14,58,49,3,11],
 ['leak','洩漏蟲','進階',15,37,88,3,13],
 ['glitch','故障蟹','進階',16,105,34,3,1],
 ['packet','封包蝠','進階',23,32,84,3,3],
 ['latency','延遲蝸牛','進階',24,120,26,3,5],
 ['garbage','垃圾資料團','進階',25,78,44,3,8],
 ['disconnect','斷線蜘蛛','進階',26,48,92,3,12],
 ['race','競態雙蟲','進階',27,54,96,3,1],
 ['fragment','碎片石像','進階',28,145,28,3,3],
 ['zombie','殭屍程序','進階',29,105,42,3,5],
 ['infinite','死循環蛇','進階',30,90,60,3,8],
 ['core-error','核心錯誤體','進階',31,165,38,3,12],
 ['stack-overflow','堆疊巨獸','頭目',17,11000,24,100,10],
 ['deadlock','死鎖雙生怪','頭目',18,34000,26,100,20],
 ['packet-devourer','封包吞噬者','頭目',32,50000,28,150,10],
 ['firewall-colossus','防火牆巨像','頭目',33,65000,23,150,20],
 ['race-hunter','競態獵手','頭目',34,85000,38,200,10],
 ['core-collapse','核心崩潰者','頭目',35,110000,28,200,20]
];
export const ENEMIES=Object.fromEntries(specs.map(([id,name,kind,sprite,hp,speed,reward,firstWave])=>[id,{id,name,kind,sprite,hp,speed,reward,firstWave,ability:null,stage:(['glitch','packet','latency','garbage','disconnect','packet-devourer','firewall-colossus'].includes(id)?2:['race','fragment','zombie','infinite','core-error','race-hunter','core-collapse'].includes(id)?3:1)}]));
export const HP_GROWTH=1.17;
export const HP_MULTIPLIER=1.10;
