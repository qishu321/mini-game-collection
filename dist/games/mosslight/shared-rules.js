export const WORLD={width:100,height:100,start:{x:48,y:63}};
export const LANDMARKS=[
  {id:"post",name:"苔光邮局",x:31,y:40,r:8,icon:"✉",hint:"领取和投递岛民来信"},
  {id:"garden",name:"暖风菜圃",x:31,y:59,r:7,icon:"❀",hint:"采集香草与枝条"},
  {id:"oak",name:"年轮树",x:49,y:25,r:8,icon:"♣",hint:"树下常有干燥木枝"},
  {id:"observatory",name:"星露温室",x:70,y:30,r:9,icon:"✦",hint:"修复岛上的星光装置"},
  {id:"pond",name:"睡莲池",x:70,y:57,r:9,icon:"◌",hint:"清晨可收集星露"},
  {id:"dock",name:"潮汐栈桥",x:49,y:78,r:8,icon:"⌁",hint:"修好木桥即可迎接新来信"}
];
export const QUESTS=[
  {id:"welcome",title:"第一封信",summary:"去苔光邮局找米莫报到",target:"post"},
  {id:"dew",title:"玻璃房的星露",summary:"收集 3 滴星露，送到星露温室",target:"pond"},
  {id:"lens",title:"点亮观星镜",summary:"把星露送到温室，唤醒观星镜",target:"observatory"},
  {id:"timber",title:"潮汐前的修补",summary:"收集 2 根木枝，修复潮汐栈桥",target:"oak"},
  {id:"bridge",title:"寄往远方",summary:"带木枝前往栈桥完成修缮",target:"dock"},
  {id:"complete",title:"岛屿重新来信",summary:"苔光重新亮起，继续自由探索",target:"post"}
];

export function createGame(){return{version:1,day:1,minute:8*60,weather:"晴",player:{...WORLD.start,energy:100},inventory:{dew:0,wood:0,herb:0,letters:0},quest:0,visited:[],repaired:{lens:false,bridge:false},messages:[],steps:0,lastGather:{},completed:false}}
export function migrateGame(saved){if(!saved?.player)return createGame();return{...createGame(),...structuredClone(saved),inventory:{...createGame().inventory,...saved.inventory},repaired:{...createGame().repaired,...saved.repaired},lastGather:saved.lastGather||{}}}
export function currentQuest(state){return QUESTS[Math.min(state.quest,QUESTS.length-1)]}
export function landmarkById(id){return LANDMARKS.find(x=>x.id===id)}
export function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
export function nearbyLandmark(state,max=9){return LANDMARKS.map(l=>({...l,distance:distance(state.player,l)})).filter(l=>l.distance<=Math.max(max,l.r)).sort((a,b)=>a.distance-b.distance)[0]||null}
export function movePlayer(source,dx,dy,delta=1){const state=structuredClone(source),p=state.player,len=Math.hypot(dx,dy)||1,speed=.46*delta;p.x=Math.max(18,Math.min(83,p.x+dx/len*speed));p.y=Math.max(20,Math.min(82,p.y+dy/len*speed));state.steps++;if(state.steps%14===0){state.minute+=5;state.player.energy=Math.max(8,state.player.energy-1);normalizeTime(state)}return state}
function normalizeTime(state){while(state.minute>=24*60){state.minute-=24*60;state.day++;state.player.energy=100;state.lastGather={};state.weather=state.day%4===0?"细雨":state.day%3===0?"多云":"晴"}}
function log(state,title,body){state.messages.unshift({day:state.day,minute:state.minute,title,body});state.messages=state.messages.slice(0,40)}
function gatherReady(state,id){return state.lastGather[id]!==state.day}
export function interact(source,id=null){const state=structuredClone(source),place=id?landmarkById(id):nearbyLandmark(state);if(!place)return{state,result:{type:"hint",title:"风从草叶间吹过",body:"靠近有光点的地点，再按 E 或空格互动。"}};if(!state.visited.includes(place.id))state.visited.push(place.id);let result={type:"talk",title:place.name,body:place.hint};
  if(place.id==="post"){if(state.quest===0){state.inventory.letters=1;state.quest=1;result={type:"story",speaker:"米莫",title:"欢迎，新邮差",body:"温室的观星镜失去了光。去睡莲池收集三滴星露，再把这封信交给露卡吧。"}}else if(state.quest>=5){result={type:"story",speaker:"米莫",title:"岛屿又能寄信了",body:"桥那边已经亮起新的邮灯。今天也会有陌生人的故事抵达这里。"}}else result={type:"talk",speaker:"米莫",title:"慢慢来",body:"最重要的不是赶路，是别错过路边正在发光的小事。"}}
  else if(place.id==="pond"){if(!gatherReady(state,"pond"))result={type:"hint",title:"水面很安静",body:"今天的星露已经收集过了，明天清晨再来。"};else{const amount=state.weather==="细雨"?2:1;state.inventory.dew+=amount;state.lastGather.pond=state.day;if(state.quest===1&&state.inventory.dew>=3)state.quest=2;result={type:"collect",title:`获得星露 ×${amount}`,body:`晶亮的露珠在瓶中轻轻摇晃。${state.inventory.dew}/3`}}}
  else if(place.id==="observatory"){if(state.quest===2&&state.inventory.dew>=3&&state.inventory.letters){state.inventory.dew-=3;state.inventory.letters--;state.repaired.lens=true;state.quest=3;result={type:"story",speaker:"露卡",title:"观星镜醒来了",body:"这些星露刚刚好！可潮汐栈桥还断着，请去年轮树下找两根木枝。"}}else result={type:"talk",speaker:"露卡",title:state.repaired.lens?"星光记录":"缺少星露",body:state.repaired.lens?"今晚的星星会把远方的来信照得很亮。":"三滴星露才能重新启动观星镜。"}}
  else if(place.id==="oak"||place.id==="garden"){const key=place.id;if(!gatherReady(state,key))result={type:"hint",title:"采集过了",body:"让这里休息一天吧。"};else{const item=place.id==="oak"?"wood":"herb",amount=place.id==="oak"?1:2;state.inventory[item]+=amount;state.lastGather[key]=state.day;if(state.quest===3&&state.inventory.wood>=2)state.quest=4;result={type:"collect",title:`获得${item==="wood"?"木枝":"香草"} ×${amount}`,body:item==="wood"?`结实又干燥。${state.inventory.wood}/2`:`带着太阳晒过的香气。`}}}
  else if(place.id==="dock"){if(state.quest===4&&state.inventory.wood>=2){state.inventory.wood-=2;state.repaired.bridge=true;state.quest=5;state.completed=true;state.inventory.letters+=1;result={type:"ending",speaker:"岛屿广播",title:"潮汐栈桥重新开放",body:"远方的邮船鸣响汽笛。苔光邮局收到了一封写给你的信。"}}else result={type:"hint",title:state.repaired.bridge?"海风送来纸张的香味":"木板仍有缺口",body:state.repaired.bridge?"栈桥已经修好，可以继续探索与收集。":"需要两根木枝才能修补。"}}
  state.minute+=result.type==="collect"?20:10;state.player.energy=Math.max(5,state.player.energy-(result.type==="collect"?5:1));normalizeTime(state);log(state,result.title,result.body);return{state,result}}
export function rest(source){const state=structuredClone(source);state.day++;state.minute=7*60;state.player.energy=100;state.lastGather={};state.weather=state.day%4===0?"细雨":state.day%3===0?"多云":"晴";log(state,"新的一天",`第 ${state.day} 天，天气${state.weather}。`);return state}
export function formatTime(state){const h=Math.floor(state.minute/60),m=state.minute%60;return`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`}
