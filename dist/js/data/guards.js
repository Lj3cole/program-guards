const specs=[
 ['bit','Bit 位元兵',1,0,'#61e2ee',6,230,1,'single',null,'穩定單發，可靠的第一道防線。','位元以 0 或 1 表示二進位資料。'],
 ['symbol','符號兵',1,1,'#ffc36c',2.5,220,.4,'single',null,'快速射擊，每發傷害較低。','分號在部分程式語言中用來結束敘述。'],
 ['bracket','括號兵',1,2,'#8da8ff',12,245,1.8,'single',null,'慢速重擊，單發傷害較高。','大括號可用來界定程式區塊。'],
 ['print','輸出手',2,3,'#58e9ec',38,260,.9,'single',null,'穩定輸出，處理單一目標。','print 是 Python 常用的輸出函式。'],
 ['for','迴圈射手',2,4,'#ffb759',15,250,1,'burst',null,'每次連射三發。','for 迴圈用來重複執行操作。'],
 ['if','判斷狙擊手',2,5,'#b0e36c',48,330,1.25,'execute',{threshold:.3,multiplier:2},'優先瞄準低血量目標，低於 30% 血量時傷害加倍。','if 會在條件成立時執行指定區塊。'],
 ['array','陣列砲台',2,6,'#8caeff',23,270,1.1,'multi',{targets:3},'同時攻擊最多三個不同目標。','陣列是一種有順序、可依索引存取的資料結構。'],
 ['function','函式法師',3,7,'#ca9eff',66,300,.85,'single',{type:'blast',interval:4,damage:130,radius:105},'穩定施法，每四秒追加範圍爆炸。','函式將可重複使用的操作封裝起來。'],
 ['return','回傳守衛',3,8,'#70e0ce',115,300,.85,'single',{type:'push',interval:3,distance:92},'每三秒追加擊退，爭取攻擊時間。','return 將控制權交回呼叫端，可同時回傳值；擊退是遊戲比喻。'],
 ['break','STOP 中斷者',3,9,'#ffe075',85,280,.9,'single',{type:'stun',interval:3.5,duration:1.4,radius:115},'定期釋放 STOP 控制波，暈眩目標周圍 115 範圍內敵人 1.4 秒；頭目 0.35 秒。','break 可中止所在的迴圈；部分語言也用於 switch。'],
 ['debug','除錯專家',3,10,'#ffac9c',45,310,.35,'single',{type:'blast',interval:3,damage:85,radius:135},'持續射擊，每三秒釋放範圍除錯波。','除錯是找出、分析並修正程式問題的過程。'],
];
export const GUARDS=Object.fromEntries(specs.map(([id,name,tier,sprite,color,damage,range,attackInterval,attackType,effect,description,conceptMeaning])=>[id,{id,name,tier,sprite,color,damage,range,attackInterval,attackType,effect,description,conceptMeaning}]));
export const TIER_NAMES={1:'基礎小兵',2:'流程守衛',3:'系統守護者'};
