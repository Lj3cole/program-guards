// Base weights total 100. Only reinforcement depends on placement eligibility.
export const LUCK_EFFECTS = [
 {id:'overclock',name:'超頻模式',positive:true,weight:12,duration:12,description:'全體守衛攻速提高 25%，持續 12 秒。'},
 {id:'power',name:'火力更新',positive:true,weight:12,duration:12,description:'全體守衛傷害提高 25%，持續 12 秒。'},
 {id:'slow',name:'系統緩速',positive:true,weight:10,duration:10,description:'小怪移速降低 25%，持續 10 秒；BOSS 減速 12.5%。'},
 {id:'cleanup',name:'記憶體清理',positive:true,weight:10,duration:0,description:'場上小怪各扣除目前血量的 20%，不影響 BOSS。'},
 {id:'reinforce',name:'幸運援軍',positive:true,weight:6,duration:0,description:'免費獲得一隻隨機二階守衛，抽中後點格子放置。'},
 {id:'lag',name:'系統延遲',positive:false,weight:12,duration:10,description:'全體守衛攻擊間隔增加 25%，持續 10 秒。'},
 {id:'weak',name:'火力異常',positive:false,weight:12,duration:10,description:'全體守衛傷害降低 20%，持續 10 秒。'},
 {id:'haste',name:'Bug 加速',positive:false,weight:10,duration:10,description:'小怪移速提高 25%，持續 10 秒，不影響 BOSS。'},
 {id:'invasion',name:'意外入侵',positive:false,weight:10,duration:0,description:'每 0.6 秒追加一隻符合目前波次的小怪，共 5 隻。'},
 {id:'jam',name:'召喚干擾',positive:false,weight:6,duration:10,description:'10 秒內不能召喚；仍能移動、合成與攻擊。'}
];
