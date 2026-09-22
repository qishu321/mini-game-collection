export const ACTIONS_PER_MONTH = 4;
export const START_YEAR = 194;
export const START_MONTH = 3;

export const SCENARIOS = {
  "群雄割据":{year:194,month:3,description:"十路诸侯并立，适合完整体验经营、外交与统一。",treasury:26000,food:34000},
  "官渡风云":{year:200,month:1,description:"北方决战将至，曹袁更强，战争节奏更紧凑。",treasury:32000,food:42000},
  "赤壁鏖兵":{year:208,month:7,description:"魏强孙刘结盟，长江防线决定天下归属。",treasury:38000,food:48000}
};
export const TECHNOLOGIES = {
  agriculture:{name:"代田法",cost:4200,months:3,description:"农业收入 +12%"}, commerce:{name:"通商令",cost:4600,months:3,description:"商业收入 +12%"},
  logistics:{name:"转运制",cost:5600,months:4,description:"军团耗粮 -15%"}, fortification:{name:"城防营造",cost:5200,months:4,description:"城防衰减减半，守城更强"},
  strategy:{name:"军谋院",cost:6800,months:5,description:"计谋成功率 +12%"}
};
export const NATIONAL_POLICIES = {
  balanced:{name:"休养生息",description:"人口与治安稳定增长"}, farming:{name:"重农屯田",description:"粮食收入 +18%，商业 -8%"},
  trade:{name:"通商富国",description:"金钱收入 +18%，粮食 -8%"}, militarism:{name:"尚武强兵",description:"军队士气更强，城市收入 -10%"},
  benevolence:{name:"仁政安民",description:"灾害损失降低，人口增长加快"}
};
export const CITY_SPECIALTIES={liangzhou:"战马",tianshui:"良马",chengdu:"蜀锦",jianye:"造船",kuaiji:"海盐",xuzhou:"铁矿",xiangyang:"弓弩",changsha:"稻米",luoyang:"典籍",ye:"甲胄",yunnan:"药材",jiaozhi:"香料"};

export const FACTIONS = [
  { id:"wei", name:"曹操", realm:"魏", color:"#31567d", light:"#9bb9cf", capital:"xuchang", trait:"屯田", bonus:"农商收益 +12%" },
  { id:"shu", name:"刘备", realm:"蜀", color:"#9e372f", light:"#e1a496", capital:"chengdu", trait:"仁德", bonus:"治安恢复更快" },
  { id:"wu", name:"孙策", realm:"吴", color:"#39715b", light:"#9bc8ac", capital:"jianye", trait:"水军", bonus:"沿江出征更强" },
  { id:"yuan", name:"袁绍", realm:"袁", color:"#ad8538", light:"#e2c47c", capital:"ye", trait:"名门", bonus:"每月威望更多" },
  { id:"liu", name:"刘表", realm:"荆", color:"#6d5795", light:"#b9a7d3", capital:"xiangyang", trait:"守成", bonus:"城防效果 +15%" },
  { id:"ma", name:"马腾", realm:"凉", color:"#85624a", light:"#cfad8d", capital:"liangzhou", trait:"西凉铁骑", bonus:"陆路攻击 +8%" },
  { id:"lv", name:"吕布", realm:"吕", color:"#b04b3d", light:"#ecaa91", capital:"xuzhou", trait:"飞将", bonus:"主将战力更高" },
  { id:"gong", name:"公孙瓒", realm:"燕", color:"#547b8d", light:"#a9ccd5", capital:"beiping", trait:"白马", bonus:"行军损耗更少" },
  { id:"nan", name:"孟获", realm:"南", color:"#537449", light:"#b1cc94", capital:"yunnan", trait:"山战", bonus:"山地防守 +12%" },
  { id:"han", name:"献帝", realm:"汉", color:"#9d7137", light:"#dfbf79", capital:"luoyang", trait:"正统", bonus:"外交成功率更高" }
];

const C = (id,name,x,y,owner,neighbors,terrain="平原") => ({id,name,x,y,owner,neighbors,terrain});
export const CITY_SPECS = [
  C("liangzhou","凉州",8,18,"ma",["anding","tianshui"],"山地"), C("anding","安定",20,15,"ma",["liangzhou","changan","tianshui","jinyang"]),
  C("tianshui","天水",17,31,"ma",["liangzhou","anding","changan","hanzhong"],"山地"), C("changan","长安",30,27,"han",["anding","tianshui","luoyang","hanzhong","wan"]),
  C("jinyang","晋阳",35,9,"yuan",["anding","ye","luoyang","nanpi"]), C("ye","邺城",51,16,"yuan",["jinyang","nanpi","chenliu","luoyang"]),
  C("nanpi","南皮",63,10,"yuan",["jinyang","ye","beiping","pingyuan"]), C("beiping","北平",78,8,"gong",["nanpi","xiangping","pingyuan"]),
  C("xiangping","襄平",91,12,"gong",["beiping","pingyuan"],"山地"), C("pingyuan","平原",70,22,"yuan",["nanpi","beiping","xiangping","chenliu","xuzhou"]),
  C("luoyang","洛阳",40,27,"han",["changan","jinyang","ye","chenliu","xuchang","wan"]), C("chenliu","陈留",55,28,"wei",["ye","pingyuan","luoyang","xuchang","xuzhou"]),
  C("xuchang","许昌",49,39,"wei",["chenliu","luoyang","wan","runan","shouchun"]), C("wan","宛城",37,42,"liu",["changan","luoyang","xuchang","hanzhong","xiangyang"]),
  C("runan","汝南",56,47,"wei",["xuchang","xiangyang","shouchun","jiangxia"]), C("xuzhou","徐州",72,35,"lv",["pingyuan","chenliu","shouchun","guangling"]),
  C("hanzhong","汉中",27,46,"shu",["tianshui","changan","wan","zitong","xiangyang"],"山地"), C("zitong","梓潼",18,55,"shu",["hanzhong","chengdu","jiangzhou"],"山地"),
  C("chengdu","成都",11,65,"shu",["zitong","jiangzhou","jianning"],"盆地"), C("jiangzhou","江州",24,68,"shu",["zitong","chengdu","wuling","jianning"]),
  C("jianning","建宁",15,82,"nan",["chengdu","jiangzhou","yunnan","lingling"],"山地"), C("yunnan","云南",7,91,"nan",["jianning","jiaozhi"],"山地"),
  C("xiangyang","襄阳",39,55,"liu",["wan","runan","hanzhong","jiangxia","wuling"]), C("jiangxia","江夏",52,60,"liu",["runan","xiangyang","shouchun","hefei","changsha","chaisang"]),
  C("wuling","武陵",34,72,"liu",["jiangzhou","xiangyang","changsha","lingling"]), C("changsha","长沙",47,77,"wu",["wuling","jiangxia","chaisang","lingling","guiyang"]),
  C("lingling","零陵",34,87,"liu",["jianning","wuling","changsha","guiyang","jiaozhi"]), C("guiyang","桂阳",48,91,"wu",["changsha","lingling","yuzhang","jiaozhi"]),
  C("shouchun","寿春",66,48,"wei",["xuchang","runan","xuzhou","jiangxia","hefei","guangling"]), C("hefei","合肥",67,59,"wu",["shouchun","jiangxia","guangling","jianye","chaisang"]),
  C("guangling","广陵",79,46,"lv",["xuzhou","shouchun","hefei","jianye"]), C("jianye","建业",82,61,"wu",["hefei","guangling","kuaiji"]),
  C("kuaiji","会稽",91,82,"wu",["jianye","yuzhang"],"水乡"),
  C("chaisang","柴桑",60,72,"wu",["jiangxia","changsha","hefei","yuzhang"]), C("yuzhang","豫章",64,85,"wu",["chaisang","guiyang","kuaiji","jiaozhi"]),
  C("jiaozhi","交趾",55,97,"nan",["yunnan","lingling","guiyang","yuzhang"],"丛林")
];

const OFFICER_NAMES = {
  wei:["曹操","荀彧","夏侯惇","郭嘉","程昱","许褚"], shu:["刘备","关羽","张飞","诸葛亮","赵云","法正"],
  wu:["孙策","周瑜","太史慈","鲁肃","程普","黄盖"], yuan:["袁绍","颜良","文丑","田丰","沮授","高览"],
  liu:["刘表","蒯良","蔡瑁","文聘","黄祖","伊籍"], ma:["马腾","马超","韩遂","庞德","马岱","成公英"],
  lv:["吕布","陈宫","张辽","高顺","臧霸","侯成"], gong:["公孙瓒","赵范","严纲","田楷","单经","公孙越"],
  nan:["孟获","祝融","木鹿大王","朵思大王","带来洞主","金环三结"], han:["献帝","伏完","董承","王子服","吴子兰","种辑"]
};

function hash(text) { let n=2166136261; for (const ch of text) { n^=ch.codePointAt(0); n=Math.imul(n,16777619); } return n>>>0; }
export const OFFICERS = FACTIONS.flatMap(f => OFFICER_NAMES[f.id].map((name,index) => {
  const seed=hash(name); const ruler=index===0;
  return { id:`${f.id}-${index}`, faction:f.id, name, ruler, command: ruler?86:62+seed%33, politics:ruler?82:58+(seed>>>5)%38, intelligence:ruler?80:57+(seed>>>10)%39, loyalty:ruler?100:78+(seed>>>15)%21 };
}));

export const SKILLS={
  "雄略":{name:"雄略",description:"统军、治政与招降均有小幅加成"},"猛将":{name:"猛将",description:"担任主将时军团战力 +10%"},
  "奇谋":{name:"奇谋",description:"围城时每月额外削减 2 点城防"},"能吏":{name:"能吏",description:"担任太守时钱粮收入 +12%"},
  "神速":{name:"神速",description:"率领军团通过山地时缩短行军时间"},"仁望":{name:"仁望",description:"延揽人才与劝降俘虏更容易成功"}
};
export const OFFICES={
  "校尉":{cost:0,command:0,politics:0,intelligence:0},"偏将军":{cost:1200,command:3,politics:0,intelligence:0},
  "镇军将军":{cost:2600,command:6,politics:0,intelligence:0},"军师":{cost:1900,command:0,politics:0,intelligence:6},
  "尚书":{cost:1900,command:0,politics:6,intelligence:0}
};

function initialSkill(officer){if(["曹操","刘备","孙策","袁绍","刘表"].includes(officer.name))return"雄略";if(["关羽","张飞","赵云","吕布","马超","张辽","太史慈","颜良","文丑","庞德"].includes(officer.name))return"猛将";if(["诸葛亮","郭嘉","周瑜","陈宫","田丰","沮授","法正"].includes(officer.name))return"奇谋";if(["荀彧","鲁肃","蒯良","程昱"].includes(officer.name))return"能吏";if(["公孙瓒","马岱","夏侯惇"].includes(officer.name))return"神速";return officer.politics>=officer.command?"仁望":"猛将"}
function buildOfficerStates(state=null,preserveExisting=false){const used=new Set();if(state){for(const c of Object.values(state.cities||{}))used.add(c.governor);for(const a of Object.values(state.armies||{})){used.add(a.commander);used.add(a.deputy)}}return Object.fromEntries(OFFICERS.map((o,index)=>{const slot=index%6,factionIndex=Math.floor(index/6),wander=!o.ruler&&slot===5&&!used.has(o.id),capital=FACTIONS.find(f=>f.id===o.faction)?.capital,location=wander?FACTIONS[(factionIndex+1)%FACTIONS.length].capital:capital;return[o.id,{faction:wander?null:o.faction,originFaction:o.faction,status:wander?"wandering":"serving",location,loyalty:o.ruler?100:o.loyalty,title:o.ruler?"君主":slot===1?"军师":"校尉",skill:initialSkill(o),merit:o.ruler?50:0,capturedBy:null}]}))}
export function officerById(state,id){const base=OFFICERS.find(o=>o.id===id);if(!base)return null;return {...base,...(state?.officers?.[id]||{})}}

export function createCampaign(playerFaction="wei",scenarioName="群雄割据") {
  const scenario=SCENARIOS[scenarioName]||SCENARIOS["群雄割据"];
  const cities = Object.fromEntries(CITY_SPECS.map((spec,index) => {
    const capital = FACTIONS.find(f=>f.id===spec.owner)?.capital===spec.id;
    const candidates=OFFICERS.filter(o=>o.faction===spec.owner).slice(0,4);
    return [spec.id,{...spec,population:90000+(index%7)*28000, agriculture:42+(index*7)%32, commerce:38+(index*11)%35,
      order:68+(index*5)%27, defense:capital?72:45+(index*3)%24, troops:capital?18000:7200+(index*977)%8500,
      morale:65+(index*3)%27, governor:candidates[index%candidates.length]?.id, delegated:false,specialty:CITY_SPECIALTIES[spec.id]||"农产",disaster:null}];
  }));
  const relations={};
  for (const a of FACTIONS) for (const b of FACTIONS) if (a.id!==b.id) relations[`${a.id}:${b.id}`]=a.id==="han"||b.id==="han"?20:-8;
  const factions=Object.fromEntries(FACTIONS.map(f=>[f.id,{...f,treasury:scenario.treasury,food:scenario.food,prestige:f.id==="han"?340:100,relations,allies:[],alive:true,policy:"balanced",technologies:[],research:null,aiPlan:null}]));
  const officers=buildOfficerStates({cities,armies:{}});
  const state={ version:8, scenario:scenarioName, playerFaction, year:scenario.year, month:scenario.month, turn:1, actions:ACTIONS_PER_MONTH, cities, factions, officers, armies:{}, armyCounter:1,treaties:{},jointTargets:{},
    logs:[{kind:"edict",title:"群雄并起",body:"汉室倾颓，州郡各据一方。经营城池、延揽人才，终结乱世。"}],
    history:[],stats:{citiesCaptured:0,battlesWon:0,battlesLost:0,officersRecruited:0,maxCities:0},eventsSeen:[],status:"playing", winner:null, selectedCity:FACTIONS.find(f=>f.id===playerFaction)?.capital||"xuchang", lastBattle:null };
  state.stats.maxCities=factionCities(state,playerFaction).length;
  if(scenarioName==="官渡风云"){state.cities.ye.troops+=9000;state.cities.xuchang.troops+=7000;state.factions.yuan.prestige+=80;}
  if(scenarioName==="赤壁鏖兵"){state.factions.wei.treasury+=18000;state.cities.xuchang.troops+=16000;state.factions.shu.allies.push("wu");state.factions.wu.allies.push("shu");state.treaties["shu:wu"]={type:"alliance",expires:state.turn+36};}
  return state;
}

export function migrateCampaign(saved) {
  if(!saved?.cities||!saved?.factions)return null;
  const state=clone(saved);state.version=8;state.scenario??="群雄割据";state.armies??={};state.armyCounter??=Object.keys(state.armies).length+1;state.officers??=buildOfficerStates(state,true);state.treaties??={};state.jointTargets??={};state.history??=[];state.stats??={citiesCaptured:0,battlesWon:0,battlesLost:0,officersRecruited:0,maxCities:factionCities(state,state.playerFaction).length};state.eventsSeen??=[];
  for(const city of Object.values(state.cities)){city.specialty??=CITY_SPECIALTIES[city.id]||"农产";city.disaster??=null;}
  for(const faction of Object.values(state.factions)){faction.policy??="balanced";faction.technologies??=[];faction.research??=null;faction.aiPlan??=null;}
  return state;
}

export function factionCities(state,factionId) { return Object.values(state.cities).filter(c=>c.owner===factionId); }
export function factionOfficers(factionId,state=null) { return OFFICERS.map(o=>officerById(state,o.id)).filter(o=>o&&(state?o.faction===factionId&&o.status==="serving":o.originFaction===factionId||o.faction===factionId)); }
export function factionArmies(state,factionId) { return Object.values(state.armies||{}).filter(a=>a.faction===factionId); }
export function availableOfficers(state,factionId) { const busy=new Set(factionArmies(state,factionId).flatMap(a=>[a.commander,a.deputy].filter(Boolean))); return factionOfficers(factionId,state).filter(o=>!busy.has(o.id)&&o.status==="serving"); }
export function wanderingOfficers(state,cityId) { return OFFICERS.map(o=>officerById(state,o.id)).filter(o=>o?.status==="wandering"&&o.location===cityId); }
export function capturedOfficers(state,factionId) { return OFFICERS.map(o=>officerById(state,o.id)).filter(o=>o?.status==="captured"&&o.capturedBy===factionId); }
export function getGovernor(city,state=null) { return officerById(state,city.governor) || factionOfficers(city.owner,state)[0] || OFFICERS.find(o=>o.faction===city.owner); }
export function neighbors(state,cityId) { return state.cities[cityId].neighbors.map(id=>state.cities[id]); }
export function relationship(state,a,b) { return state.factions[a]?.relations?.[`${a}:${b}`] ?? 0; }
export function formatYear(state) { return `兴平${state.year===194?"元":state.year-193}年 · ${["正月","二月","三月","四月","五月","六月","七月","八月","九月","十月","冬月","腊月"][state.month-1]}`; }

function clone(state) { return structuredClone(state); }
function ownCityOrThrow(state,cityId) { const city=state.cities[cityId]; if(!city||city.owner!==state.playerFaction) throw new Error("只能治理己方城池"); return city; }
function spendAction(state,cost=1) { if(state.actions<cost) throw new Error("本月政令已用尽"); state.actions-=cost; }
function spend(faction,money=0,food=0) { if(faction.treasury<money||faction.food<food) throw new Error("钱粮不足"); faction.treasury-=money; faction.food-=food; }

export function cityAction(source,cityId,action) {
  const state=clone(source), city=ownCityOrThrow(state,cityId), faction=state.factions[state.playerFaction]; spendAction(state);
  const governor=getGovernor(city,state); const office=OFFICES[governor?.title]||OFFICES["校尉"],p=(governor?.politics||65)+office.politics; let title="政令已施行", body="";
  if(action==="farm") { spend(faction,1200); const gain=5+Math.floor(p/25); city.agriculture=Math.min(100,city.agriculture+gain); body=`${city.name}开垦水利，农业 +${gain}。`; }
  else if(action==="trade") { spend(faction,1400); const gain=5+Math.floor(p/28); city.commerce=Math.min(100,city.commerce+gain); body=`${city.name}整顿商路，商业 +${gain}。`; }
  else if(action==="order") { spend(faction,700); const gain=7+Math.floor(p/24); city.order=Math.min(100,city.order+gain); body=`${city.name}巡行乡里，治安 +${gain}。`; }
  else if(action==="recruit") { spend(faction,800,1600); const amount=Math.min(Math.floor(city.population*.025),2200+Math.floor(p*8)); city.troops+=amount; city.population-=Math.floor(amount*.35); city.order=Math.max(20,city.order-3); body=`${city.name}征募新军 ${amount.toLocaleString()} 人。`; }
  else if(action==="train") { spend(faction,600,500); const gain=6+Math.floor((governor?.command||65)/30); city.morale=Math.min(100,city.morale+gain); body=`${city.name}整军操练，士气 +${gain}。`; }
  else if(action==="fortify") { spend(faction,1600); const gain=4+Math.floor(p/35); city.defense=Math.min(100,city.defense+gain); body=`${city.name}增筑城防，城防 +${gain}。`; }
  else throw new Error("未知政令");
  if(governor&&state.officers[governor.id])state.officers[governor.id].merit+=1;
  state.logs.unshift({kind:"domestic",title,body}); return state;
}

export function setDelegated(source,cityId,value) { const state=clone(source), city=ownCityOrThrow(state,cityId); city.delegated=Boolean(value); state.logs.unshift({kind:"appoint",title:value?"开启委任":"收回委任",body:`${city.name}将${value?"由太守按局势自行治理":"改由主公亲自调度"}。`}); return state; }

export function appointGovernor(source,cityId,officerId){const state=clone(source),city=ownCityOrThrow(state,cityId),officer=officerById(state,officerId);if(!officer||officer.status!=="serving"||officer.faction!==state.playerFaction)throw new Error("只能任命己方在仕武将");if(factionArmies(state,state.playerFaction).some(a=>a.commander===officerId||a.deputy===officerId))throw new Error("该武将正在军中");spendAction(state);const former=city.governor,other=Object.values(state.cities).find(c=>c.id!==cityId&&c.governor===officerId);if(other)other.governor=former;city.governor=officerId;state.officers[officerId].location=cityId;if(former&&state.officers[former]&&other)state.officers[former].location=other.id;state.officers[officerId].loyalty=Math.min(100,state.officers[officerId].loyalty+3);state.logs.unshift({kind:"appoint",title:"任命太守",body:`${officer.name}就任${city.name}太守。`});return state}
export function recruitOfficer(source,cityId,officerId,method="visit",rng=Math.random,actorFaction=null){const state=clone(source),factionId=actorFaction||state.playerFaction,city=state.cities[cityId],officer=officerById(state,officerId);if(!city||city.owner!==factionId||!officer||officer.status!=="wandering"||officer.location!==cityId)throw new Error("此地没有该名在野武将");if(factionId===state.playerFaction)spendAction(state);const cost=method==="gift"?2200:600;spend(state.factions[factionId],cost);const recruiter=getGovernor(city,state),chance=(method==="gift"?.68:.42)+(recruiter?.intelligence||60)/420+(recruiter?.skill==="仁望"?.12:0),success=rng()<Math.min(.94,chance);if(success){Object.assign(state.officers[officerId],{status:"serving",faction:factionId,location:cityId,capturedBy:null,loyalty:method==="gift"?82:72,title:"校尉"});state.logs.unshift({kind:"officer",title:"贤才来投",body:`${officer.name}受${recruiter.name}延揽，加入${state.factions[factionId].name}麾下。`})}else state.logs.unshift({kind:"officer",title:"访贤未果",body:`${officer.name}暂未出仕，仍在${city.name}隐居。`});return state}
export function rewardOfficer(source,officerId){const state=clone(source),officer=officerById(state,officerId);if(!officer||officer.status!=="serving"||officer.faction!==state.playerFaction)throw new Error("无法赏赐该武将");if(officer.ruler)throw new Error("君主无需自赏");spendAction(state);spend(state.factions[state.playerFaction],1200);state.officers[officerId].loyalty=Math.min(100,officer.loyalty+12);state.logs.unshift({kind:"officer",title:"厚赏将臣",body:`${officer.name}忠诚提升至 ${state.officers[officerId].loyalty}。`});return state}
export function appointOffice(source,officerId,title){const state=clone(source),officer=officerById(state,officerId),office=OFFICES[title];if(!officer||officer.status!=="serving"||officer.faction!==state.playerFaction||officer.ruler)throw new Error("无法授予该武将官职");if(!office)throw new Error("官职不存在");spendAction(state);spend(state.factions[state.playerFaction],office.cost);state.officers[officerId].title=title;state.officers[officerId].loyalty=Math.min(100,officer.loyalty+6);state.logs.unshift({kind:"officer",title:"策命授官",body:`${officer.name}受封${title}，忠诚 +6。`});return state}
export function prisonerAction(source,officerId,action,rng=Math.random){const state=clone(source),officer=officerById(state,officerId);if(!officer||officer.status!=="captured"||officer.capturedBy!==state.playerFaction)throw new Error("俘虏不存在");spendAction(state);if(action==="persuade"){spend(state.factions[state.playerFaction],900);const persuader=factionOfficers(state.playerFaction,state).sort((a,b)=>b.intelligence-a.intelligence)[0],chance=.3+(100-officer.loyalty)/150+(persuader?.skill==="仁望"?.14:0);if(rng()<Math.min(.9,chance)){Object.assign(state.officers[officerId],{status:"serving",faction:state.playerFaction,capturedBy:null,loyalty:52,title:"校尉"});state.logs.unshift({kind:"officer",title:"俘将归心",body:`${officer.name}愿降，加入我方麾下。`})}else{state.officers[officerId].loyalty=Math.max(20,officer.loyalty-8);state.logs.unshift({kind:"officer",title:"拒不受降",body:`${officer.name}仍不肯降，忠于旧主。`})}}else if(action==="release"){const old=officer.faction;Object.assign(state.officers[officerId],{status:"wandering",faction:null,capturedBy:null,location:state.factions[old]?.capital||officer.location});state.factions[state.playerFaction].prestige+=8;if(old&&state.factions[old]){const rel=relationship(state,state.playerFaction,old)+8;state.factions[state.playerFaction].relations[`${state.playerFaction}:${old}`]=rel;state.factions[old].relations[`${old}:${state.playerFaction}`]=rel}state.logs.unshift({kind:"officer",title:"释归俘将",body:`释放${officer.name}，威望 +8。`})}else throw new Error("未知俘虏处置");return state}

export function diplomacyAction(source,targetId,action,rng=Math.random) {
  const state=clone(source), me=state.factions[state.playerFaction], target=state.factions[targetId];
  if(!target||!target.alive||targetId===state.playerFaction) throw new Error("目标势力无效"); spendAction(state); let rel=relationship(state,state.playerFaction,targetId); let body="";
  if(action==="gift") { spend(me,3000); rel=Math.min(100,rel+18); body=`向${target.name}赠送财货，两国关系改善。`; }
  else if(action==="alliance"||action==="truce") { spend(me,action==="alliance"?1600:900); const chance=.36+(rel+100)/500+(state.playerFaction==="han"?.12:0); if(rng()<chance) { const type=action==="alliance"?"alliance":"truce",duration=action==="alliance"?24:12,key=[state.playerFaction,targetId].sort().join(":");state.treaties[key]={type,expires:state.turn+duration};if(type==="alliance"){if(!me.allies.includes(targetId))me.allies.push(targetId);if(!target.allies.includes(state.playerFaction))target.allies.push(state.playerFaction)}rel=Math.max(rel,type==="alliance"?48:12);body=`${target.name}接受${type==="alliance"?"同盟":"停战"}，盟约为期 ${duration} 个月。`; } else { rel-=5; body=`${target.name}婉拒盟约，此事未成。`; } }
  else if(action==="joint") { if(!me.allies.includes(targetId))throw new Error("仅可邀请盟友共同进攻");const enemies=FACTIONS.filter(f=>f.id!==state.playerFaction&&f.id!==targetId&&state.factions[f.id].alive&&!me.allies.includes(f.id)).sort((a,b)=>factionPower(state,b.id)-factionPower(state,a.id));if(!enemies.length)throw new Error("当前没有共同进攻目标");spend(me,1200);state.jointTargets[state.playerFaction]={ally:targetId,target:enemies[0].id,expires:state.turn+8};body=`${target.name}响应檄文，将与我方共同进攻${state.factions[enemies[0].id].name}。`; }
  else if(["sow","turncoat","counterspy"].includes(action)){const strategist=factionOfficers(state.playerFaction,state).sort((a,b)=>b.intelligence-a.intelligence)[0],tech=me.technologies.includes("strategy")?.12:0;spend(me,action==="counterspy"?1200:2200);const chance=.32+(strategist?.intelligence||60)/350+tech-(action==="turncoat"?.12:0);if(rng()<Math.min(.86,chance)){if(action==="sow"){const victim=factionOfficers(targetId,state).filter(o=>!o.ruler).sort((a,b)=>a.loyalty-b.loyalty)[0];if(victim)state.officers[victim.id].loyalty=Math.max(10,victim.loyalty-18);rel-=8;body=`离间成功，${victim?.name||"敌方将臣"}与${target.name}渐生嫌隙。`;}else if(action==="turncoat"){const victim=factionOfficers(targetId,state).filter(o=>!o.ruler&&o.loyalty<72).sort((a,b)=>a.loyalty-b.loyalty)[0];if(victim){Object.assign(state.officers[victim.id],{faction:state.playerFaction,status:"serving",loyalty:46,location:me.capital});body=`${victim.name}受策反，秘密投奔我方。`;}else body="敌方将臣忠诚，策反未得其人。";}else{me.counterspyUntil=state.turn+12;body="反间布局完成，未来十二个月可抵御敌方计谋。";}}else{rel-=4;body="计谋败露，使者无功而返。";}}
  else if(action==="threaten") { const power=factionPower(state,state.playerFaction)/Math.max(1,factionPower(state,targetId)); if(power>1.25||rng()<.18) { me.prestige+=25; rel-=25; body=`${target.name}暂时屈服，威望 +25。`; } else { rel-=35; body=`威压未能奏效，${target.name}厉兵以待。`; } }
  else throw new Error("未知外交行动");
  me.relations[`${state.playerFaction}:${targetId}`]=rel; target.relations[`${targetId}:${state.playerFaction}`]=rel;
  state.logs.unshift({kind:"diplomacy",title:"使者回报",body}); return state;
}

export function setNationalPolicy(source,policyId){const state=clone(source),policy=NATIONAL_POLICIES[policyId];if(!policy)throw new Error("国策不存在");spendAction(state);spend(state.factions[state.playerFaction],1800);state.factions[state.playerFaction].policy=policyId;state.logs.unshift({kind:"policy",title:"国策更张",body:`施行「${policy.name}」：${policy.description}。`});return state}
export function startResearch(source,techId){const state=clone(source),tech=TECHNOLOGIES[techId],f=state.factions[state.playerFaction];if(!tech)throw new Error("科技不存在");if(f.technologies.includes(techId))throw new Error("该科技已经完成");if(f.research)throw new Error("已有科技正在研究");spendAction(state);spend(f,tech.cost);f.research={id:techId,remaining:tech.months};state.logs.unshift({kind:"policy",title:"设院研习",body:`开始研究「${tech.name}」，预计 ${tech.months} 个月完成。`});return state}
export function migratePopulation(source,fromId,toId,amount=10000){const state=clone(source),from=ownCityOrThrow(state,fromId),to=ownCityOrThrow(state,toId);if(fromId===toId||!from.neighbors.includes(toId))throw new Error("只能向相邻己方城市迁民");const moved=Math.min(Math.max(2000,Math.floor(amount)),Math.floor(from.population*.2));spendAction(state);spend(state.factions[state.playerFaction],800);from.population-=moved;to.population+=moved;from.order=Math.max(25,from.order-3);state.logs.unshift({kind:"domestic",title:"迁徙民户",body:`${moved.toLocaleString()} 人由${from.name}迁往${to.name}。`});return state}
export function activeTreaty(state,a,b){const treaty=state.treaties?.[[a,b].sort().join(":")];return treaty&&treaty.expires>state.turn?treaty:null}

export function factionPower(state,id) { return factionCities(state,id).reduce((n,c)=>n+c.troops+c.defense*160,0)+factionArmies(state,id).reduce((n,a)=>n+a.troops,0); }
export function attack(source,fromId,toId,ratio=.45,rng=Math.random,actorFaction=null) {
  const state=clone(source), from=state.cities[fromId], to=state.cities[toId], attackerId=actorFaction||state.playerFaction;
  if(!from||!to||from.owner!==attackerId||!from.neighbors.includes(toId)||to.owner===attackerId) throw new Error("无法向该城出征");
  if(state.factions[attackerId].allies.includes(to.owner)) throw new Error("不可进攻盟友");
  if(!actorFaction) spendAction(state);
  const sent=Math.max(1800,Math.floor(from.troops*Math.max(.25,Math.min(.7,ratio)))); if(from.troops-sent<1200) throw new Error("城中留守兵力不足");
  const commander=factionOfficers(attackerId,state).sort((a,b)=>b.command-a.command)[0]; const defender=getGovernor(to,state);
  const trait=state.factions[attackerId].trait; const terrainBonus=(to.terrain==="山地"||to.terrain==="丛林")?1.12:1;
  const attackScore=sent*(.72+from.morale/180)*(1+(commander?.command||65)/360)*(trait==="西凉铁骑"?1.08:1)*(.88+rng()*.24);
  const defenseScore=to.troops*(.75+to.morale/200)*(1+to.defense/240)*(1+(defender?.command||65)/420)*terrainBonus*(state.factions[to.owner].trait==="守成"?1.15:1)*(.88+rng()*.24);
  const victory=attackScore>defenseScore; const oldOwner=to.owner; let atkLoss,defLoss;
  if(victory) { atkLoss=Math.min(sent-900,Math.floor(sent*(.18+defenseScore/attackScore*.28))); defLoss=Math.floor(to.troops*(.62+rng()*.2)); from.troops-=sent; to.troops=Math.max(900,sent-atkLoss); to.owner=attackerId; to.governor=factionOfficers(attackerId,state)[Math.floor(rng()*Math.max(1,factionOfficers(attackerId,state).length))]?.id; to.defense=Math.max(20,to.defense-18); to.order=Math.max(32,to.order-18); to.morale=62; state.factions[attackerId].prestige+=18; }
  else { atkLoss=Math.floor(sent*(.46+defenseScore/(attackScore+defenseScore)*.34)); defLoss=Math.floor(to.troops*(.12+attackScore/(attackScore+defenseScore)*.24)); from.troops-=atkLoss; to.troops=Math.max(900,to.troops-defLoss); to.morale=Math.min(100,to.morale+4); }
  const report={victory,from:fromId,to:toId,attacker:attackerId,defender:oldOwner,sent,atkLoss,defLoss,title:victory?"破城克敌":"进攻受挫",body:victory?`${commander.name}攻克${to.name}，斩获城池。`:`${commander.name}攻打${to.name}未克，只得退兵。`};
  state.lastBattle=report; state.logs.unshift({kind:"battle",title:report.title,body:report.body}); updateAliveAndStatus(state); return state;
}

function armyOfficer(state,id){return officerById(state,id)}
function captureOfficer(state,officerId,captorFaction,cityId,rng,chance=.4){const officer=officerById(state,officerId);if(!officer||officer.ruler||officer.status!=="serving"||officer.faction===captorFaction||rng()>chance)return false;Object.assign(state.officers[officerId],{status:"captured",capturedBy:captorFaction,location:cityId});state.logs.unshift({kind:"officer",title:"阵前擒将",body:`${officer.name}为${state.factions[captorFaction].name}军所俘。`});return true}
function captureArmyOfficers(state,army,captorFaction,cityId,rng){if(!captorFaction||captorFaction===army.faction)return;for(const [id,chance] of [[army.commander,.58],[army.deputy,.34]])if(id&&!captureOfficer(state,id,captorFaction,cityId,rng,chance)){const officer=officerById(state,id);if(officer?.status==="serving")state.officers[id].location=state.factions[army.faction]?.capital||army.origin}}
function travelMonths(state,fromId,toId,troops,factionId,commander=null){const target=state.cities[toId],trait=state.factions[factionId].trait;let months=(target.terrain==="山地"||target.terrain==="丛林")?2:1;if(troops>26000)months++;if(trait==="白马"||commander?.skill==="神速")months--;return Math.max(1,months)}
function validateArmyTarget(state,fromId,toId,factionId){const from=state.cities[fromId],to=state.cities[toId];if(!from||!to||!from.neighbors.includes(toId))throw new Error("军团只能向接壤城池行军");if(to.owner!==factionId&&(state.factions[factionId].allies.includes(to.owner)||activeTreaty(state,factionId,to.owner)))throw new Error("盟约期内不可擅自进攻");return {from,to}}
function consumeCommand(state,actorFaction){if(actorFaction===state.playerFaction)spendAction(state)}

export function raiseArmy(source,fromId,toId,options={},actorFaction=null){
  const state=clone(source),factionId=actorFaction||state.playerFaction,{from,to}=validateArmyTarget(state,fromId,toId,factionId);if(from.owner!==factionId)throw new Error("只能从己方城池组建军团");
  const troops=Math.floor(Number(options.troops)||from.troops*.45),food=Math.floor(Number(options.food)||troops*.35),commander=armyOfficer(state,options.commanderId)||availableOfficers(state,factionId).sort((a,b)=>b.command-a.command)[0],deputy=armyOfficer(state,options.deputyId);
  if(troops<3000||from.troops-troops<1200)throw new Error("至少出征 3,000 人，并为城池留下 1,200 守军");if(food<Math.ceil(troops*.2))throw new Error("携粮不足，至少需要兵力的两成");
  if(!commander||commander.faction!==factionId||!availableOfficers(state,factionId).some(o=>o.id===commander.id))throw new Error("主将当前不可用");
  if(deputy&&(!availableOfficers(state,factionId).some(o=>o.id===deputy.id)||deputy.id===commander.id))throw new Error("副将当前不可用");
  consumeCommand(state,factionId);spend(state.factions[factionId],0,food);from.troops-=troops;
  const id=`${factionId}-army-${state.armyCounter++}`,months=travelMonths(state,fromId,toId,troops,factionId,commander);
  state.armies[id]={id,faction:factionId,name:`${commander.name}军`,commander:commander.id,deputy:deputy?.id||null,troops,food,morale:Math.max(62,from.morale),origin:fromId,location:fromId,target:toId,status:"moving",remaining:months,totalTravel:months,siegeTurns:0,supply:"畅通"};
  state.officers[commander.id].location=`army:${id}`;if(deputy)state.officers[deputy.id].location=`army:${id}`;
  state.logs.unshift({kind:"military",title:"军团出征",body:`${commander.name}率 ${troops.toLocaleString()} 人自${from.name}出发，预计 ${months} 个月抵达${to.name}。`});return state;
}

export function marchArmy(source,armyId,toId,actorFaction=null){
  const state=clone(source),army=state.armies[armyId],factionId=actorFaction||state.playerFaction;if(!army||army.faction!==factionId)throw new Error("军团不存在");if(army.status!=="stationed")throw new Error("只有驻扎军团可以继续行军");
  const {to}=validateArmyTarget(state,army.location,toId,factionId);consumeCommand(state,factionId);army.origin=army.location;army.target=toId;army.status="moving";army.remaining=travelMonths(state,army.location,toId,army.troops,factionId,armyOfficer(state,army.commander));army.totalTravel=army.remaining;army.siegeTurns=0;
  state.logs.unshift({kind:"military",title:"军团转进",body:`${army.name}离开${state.cities[army.location].name}，向${to.name}进军。`});return state;
}

export function disbandArmy(source,armyId,actorFaction=null){
  const state=clone(source),army=state.armies[armyId],factionId=actorFaction||state.playerFaction;if(!army||army.faction!==factionId)throw new Error("军团不存在");if(army.status!=="stationed"||state.cities[army.location]?.owner!==factionId)throw new Error("军团必须在己方城池驻扎后才能归营");
  consumeCommand(state,factionId);state.cities[army.location].troops+=army.troops;state.factions[factionId].food+=army.food;for(const id of [army.commander,army.deputy])if(id&&state.officers[id])state.officers[id].location=army.location;state.logs.unshift({kind:"military",title:"军团归营",body:`${army.name}在${state.cities[army.location].name}解散，兵粮归入城中。`});delete state.armies[armyId];return state;
}

function armySupplied(state,army){if(army.status==="stationed"&&state.cities[army.location]?.owner===army.faction)return true;const anchor=army.status==="moving"?army.origin:army.target;return Boolean(state.cities[anchor]?.neighbors.some(id=>state.cities[id].owner===army.faction)||state.cities[army.origin]?.owner===army.faction)}
function feedArmy(state,army){const logistics=state.factions[army.faction].technologies?.includes("logistics"),upkeep=Math.max(450,Math.ceil(army.troops*(logistics?.089:.105))),faction=state.factions[army.faction],supplied=armySupplied(state,army);army.supply=supplied?"畅通":"断绝";if(army.food<upkeep&&supplied&&faction.food>0){const sent=Math.min(upkeep*2-army.food,faction.food);army.food+=sent;faction.food-=sent}if(army.food>=upkeep){army.food-=upkeep;army.morale=Math.min(100,army.morale+1)}else{army.food=0;const deserters=Math.max(120,Math.floor(army.troops*.08));army.troops=Math.max(0,army.troops-deserters);army.morale=Math.max(15,army.morale-14);state.logs.unshift({kind:"military",title:"军中缺粮",body:`${army.name}粮道${army.supply}，逃散 ${deserters.toLocaleString()} 人。`})}}
function captureWithArmy(state,army,city){const oldOwner=city.owner,garrison=Math.min(1400,Math.max(700,Math.floor(army.troops*.12)));city.owner=army.faction;city.troops=garrison;city.governor=army.commander;city.defense=Math.max(18,city.defense-20);city.order=Math.max(28,city.order-20);city.morale=55;army.troops-=garrison;army.location=city.id;army.origin=city.id;army.target=null;army.status="stationed";army.remaining=0;army.siegeTurns=0;state.factions[army.faction].prestige+=20;if(state.officers[army.commander])state.officers[army.commander].merit+=12;if(army.faction===state.playerFaction){state.stats.citiesCaptured++;state.stats.battlesWon++;}else if(oldOwner===state.playerFaction)state.stats.battlesLost++;state.logs.unshift({kind:"battle",title:"城池易帜",body:`${army.name}攻克${city.name}，${factionCities(state,oldOwner).length?"敌军退守余城":"该势力就此覆亡"}。`})}
function battleScore(state,army){const commander=armyOfficer(state,army.commander),deputy=armyOfficer(state,army.deputy),office=OFFICES[commander?.title]||OFFICES["校尉"],skill=commander?.skill==="猛将"?1.1:commander?.skill==="雄略"?1.05:1;return army.troops*(.7+army.morale/180)*(1+((commander?.command||60)+office.command)/310+(deputy?.command||0)/900)*skill}

function resolveFieldBattle(state,a,b,rng){const battlefield=a.location||a.target,battleCity=state.cities[battlefield],as=battleScore(state,a)*(.9+rng()*.2),bs=battleScore(state,b)*(.9+rng()*.2),winner=as>=bs?a:b,loser=winner===a?b:a;const winLoss=Math.floor(winner.troops*(.16+rng()*.12)),loseLoss=Math.floor(loser.troops*(.5+rng()*.22));winner.troops=Math.max(800,winner.troops-winLoss);winner.morale=Math.min(100,winner.morale+7);loser.troops=Math.max(0,loser.troops-loseLoss);if(state.officers[winner.commander])state.officers[winner.commander].merit+=8;if(state.officers[loser.commander])state.officers[loser.commander].merit+=2;state.logs.unshift({kind:"battle",title:"两军野战",body:`${winner.name}在${battleCity.name}击退${loser.name}，双方折损 ${winLoss.toLocaleString()} / ${loseLoss.toLocaleString()}。`});if(loser.troops<1200){captureArmyOfficers(state,loser,winner.faction,battlefield,rng);delete state.armies[loser.id]}else{loser.status="moving";loser.target=loser.origin;loser.remaining=1;loser.totalTravel=1;loser.morale=Math.max(25,loser.morale-18)}winner.location=battlefield;if(battleCity.owner===winner.faction){winner.status="stationed";winner.origin=battlefield;winner.target=null}else{winner.status="awaiting";winner.target=battlefield}}

function assaultArmy(state,army,rng){
  const city=state.cities[army.target],commander=armyOfficer(state,army.commander),defender=getGovernor(city,state),trait=state.factions[army.faction].trait,terrain=(city.terrain==="山地"||city.terrain==="丛林");
  const attackScore=battleScore(state,army)*(trait==="西凉铁骑"?1.08:1)*(trait==="飞将"?1.1:1)*(trait==="水军"&&city.terrain==="水乡"?1.15:1)*(.88+rng()*.24);
  const defenseScore=city.troops*(.72+city.morale/190)*(1+city.defense/210)*(1+(defender?.command||60)/420)*(terrain&&state.factions[city.owner].trait==="山战"?1.12:1)*(state.factions[city.owner].trait==="守成"?1.15:1)*(.88+rng()*.24);
  const victory=attackScore>defenseScore,oldOwner=city.owner;let atkLoss,defLoss;if(victory){atkLoss=Math.min(army.troops-700,Math.floor(army.troops*(.17+defenseScore/attackScore*.26)));defLoss=Math.floor(city.troops*(.66+rng()*.2));army.troops-=atkLoss;city.troops=Math.max(0,city.troops-defLoss);captureOfficer(state,city.governor,army.faction,city.id,rng,.46);captureWithArmy(state,army,city)}else{atkLoss=Math.floor(army.troops*(.34+defenseScore/(attackScore+defenseScore)*.3));defLoss=Math.floor(city.troops*(.12+attackScore/(attackScore+defenseScore)*.22));army.troops-=atkLoss;city.troops=Math.max(500,city.troops-defLoss);army.morale=Math.max(22,army.morale-13);army.status=army.troops<1200?"destroyed":"awaiting";if(army.status==="destroyed"){captureArmyOfficers(state,army,city.owner,city.id,rng);delete state.armies[army.id]}}
  const report={victory,armyId:army.id,from:army.origin,to:city.id,attacker:army.faction,defender:oldOwner,sent:army.troops+atkLoss,atkLoss,defLoss,title:victory?"破城克敌":"强攻受挫",body:victory?`${commander.name}攻克${city.name}，军团入城驻扎。`:`${commander.name}强攻${city.name}未克，士气受挫。`};state.lastBattle=report;state.logs.unshift({kind:"battle",title:report.title,body:report.body});return report
}

export function armyAction(source,armyId,action,rng=Math.random,actorFaction=null){
  const state=clone(source),army=state.armies[armyId],factionId=actorFaction||state.playerFaction;if(!army||army.faction!==factionId)throw new Error("军团不存在");
  if(action==="assault"){if(army.status!=="awaiting"&&army.status!=="besieging")throw new Error("军团尚未抵达敌城");consumeCommand(state,factionId);assaultArmy(state,army,rng)}
  else if(action==="besiege"){if(army.status!=="awaiting")throw new Error("军团尚未抵达敌城");consumeCommand(state,factionId);army.status="besieging";state.logs.unshift({kind:"military",title:"围城断粮",body:`${army.name}包围${state.cities[army.target].name}，将按月削弱守军与城防。`})}
  else if(action==="retreat"){if(!["awaiting","besieging"].includes(army.status))throw new Error("当前无法撤退");consumeCommand(state,factionId);army.target=army.origin;army.status="moving";army.remaining=1;army.totalTravel=1;state.logs.unshift({kind:"military",title:"鸣金撤军",body:`${army.name}撤回${state.cities[army.origin].name}。`})}
  else throw new Error("未知军团命令");updateAliveAndStatus(state);return state
}

function processArmies(source,rng){
  const state=clone(source);for(const army of Object.values(state.armies)){feedArmy(state,army);if(army.troops<700){captureArmyOfficers(state,army,state.cities[army.target||army.location]?.owner,army.target||army.location,rng);delete state.armies[army.id];continue}if(army.status==="moving"){army.remaining--;if(army.remaining<=0){army.location=army.target;if(state.cities[army.target].owner===army.faction){army.status="stationed";army.origin=army.target;army.target=null}else army.status="awaiting"}}else if(army.status==="besieging"){const city=state.cities[army.target];army.siegeTurns++;const commander=armyOfficer(state,army.commander),pressure=3+Math.floor((commander?.intelligence||60)/24)+(commander?.skill==="奇谋"?2:0)+(commander?.title==="军师"?2:0);city.defense=Math.max(0,city.defense-pressure);const defenders=Math.min(city.troops-300,Math.max(120,Math.floor(city.troops*.055)));city.troops=Math.max(300,city.troops-defenders);army.troops=Math.max(600,army.troops-Math.max(60,Math.floor(army.troops*.012)));state.logs.unshift({kind:"battle",title:"围城相持",body:`${army.name}围困${city.name}第 ${army.siegeTurns} 月，城防降至 ${city.defense}。`});if(city.defense<=6||city.troops<=500){captureOfficer(state,city.governor,army.faction,city.id,rng,.52);captureWithArmy(state,army,city)}}}
  const at=new Map();for(const army of Object.values(state.armies)){if(army.status==="moving")continue;const place=army.location||army.target;if(!place)continue;const list=at.get(place)||[];list.push(army);at.set(place,list)}for(const list of at.values()){const a=list[0],b=list.find(x=>x.faction!==a.faction);if(a&&b&&state.armies[a.id]&&state.armies[b.id])resolveFieldBattle(state,a,b,rng)}return state
}

function cityIncome(state,city) { const governor=getGovernor(city,state),bonus=governor?.skill==="能吏"||governor?.title==="尚书"?1.12:1;return { money:Math.floor(city.population*(city.commerce/100)*.013*bonus), food:Math.floor(city.population*(city.agriculture/100)*.019*bonus) }; }
function delegatedAction(state,city) { const faction=state.factions[city.owner]; const choices=city.order<60?["order"]:city.troops<6500?["recruit"]:city.agriculture<city.commerce?["farm"]:["trade"]; const action=choices[0]; if(action==="order") city.order=Math.min(100,city.order+5); else if(action==="recruit"&&faction.food>900){city.troops+=800;faction.food-=900;} else if(action==="farm") city.agriculture=Math.min(100,city.agriculture+3); else city.commerce=Math.min(100,city.commerce+3); }

function createAiPlan(state,id){const faction=state.factions[id],cities=factionCities(state,id),border=cities.filter(c=>neighbors(state,c.id).some(n=>n.owner!==id&&!activeTreaty(state,id,n.owner))),joint=Object.values(state.jointTargets||{}).find(x=>x.ally===id&&x.expires>state.turn),enemies=FACTIONS.filter(f=>f.id!==id&&state.factions[f.id].alive&&!faction.allies.includes(f.id)&&!activeTreaty(state,id,f.id));const target=joint?.target||enemies.sort((a,b)=>factionPower(state,a.id)-factionPower(state,b.id))[0]?.id||null;return {target,focus:border.sort((a,b)=>b.troops-a.troops)[0]?.id||cities[0]?.id,expires:state.turn+6,stance:factionPower(state,id)<Math.max(...enemies.map(e=>factionPower(state,e.id)),1)*.55?"defend":"expand"}}
function aiTurn(state,id,rng) {
  const faction=state.factions[id],cities=factionCities(state,id);if(!cities.length)return state;if(!faction.aiPlan||faction.aiPlan.expires<=state.turn)faction.aiPlan=createAiPlan(state,id);const plan=faction.aiPlan;
  const border=cities.filter(c=>neighbors(state,c.id).some(n=>n.owner!==id&&!activeTreaty(state,id,n.owner)));for(const city of cities){const danger=border.includes(city),required=danger?12000:6500;if(city.order<58)city.order+=4;else if(city.troops<required&&faction.food>900){city.troops+=danger?1100:650;faction.food-=danger?1000:650}else if(city.agriculture<city.commerce)city.agriculture=Math.min(100,city.agriculture+2);else city.commerce=Math.min(100,city.commerce+2)}
  const threatened=border.sort((a,b)=>(a.troops-neighbors(state,a.id).filter(n=>n.owner!==id).reduce((s,n)=>s+n.troops,0))-(b.troops-neighbors(state,b.id).filter(n=>n.owner!==id).reduce((s,n)=>s+n.troops,0)))[0],donor=cities.filter(c=>c!==threatened&&c.neighbors.includes(threatened?.id)&&c.troops>15000).sort((a,b)=>b.troops-a.troops)[0];if(threatened&&donor&&threatened.troops<8500){const aid=Math.floor((donor.troops-7000)*.45);donor.troops-=aid;threatened.troops+=aid;state.logs.unshift({kind:"military",title:"诸侯调兵",body:`${faction.name}向${threatened.name}集中 ${aid.toLocaleString()} 援军。`})}
  for(const army of factionArmies(state,id)){if(army.status==="awaiting")return armyAction(state,army.id,army.troops>state.cities[army.target].troops*1.22?"assault":"besiege",rng,id);if(army.status==="stationed"){const choices=neighbors(state,army.location).filter(c=>c.owner!==id&&!activeTreaty(state,id,c.owner)&&!faction.allies.includes(c.owner)).sort((a,b)=>(a.owner===plan.target?-5000:0)+a.troops+a.defense*100-((b.owner===plan.target?-5000:0)+b.troops+b.defense*100));const target=choices[0];if(target&&army.troops>target.troops*(plan.stance==="defend"?1.65:1.25)&&rng()<.58)return marchArmy(state,army.id,target.id,id)}}
  if(factionArmies(state,id).length>=(plan.stance==="defend"?1:3))return state;const opportunities=[];for(const from of cities)for(const to of neighbors(state,from.id))if(to.owner!==id&&!activeTreaty(state,id,to.owner)&&!faction.allies.includes(to.owner)){const ratio=from.troops/Math.max(1,to.troops+to.defense*90),goal=to.owner===plan.target?1.45:1,exposure=neighbors(state,from.id).filter(n=>n.owner!==id).length;opportunities.push({from,to,score:ratio*goal-exposure*.08})}opportunities.sort((a,b)=>b.score-a.score);if(opportunities[0]?.score>1.05&&rng()<.68){const officers=availableOfficers(state,id).sort((a,b)=>b.command-a.command),from=opportunities[0].from;if(officers[0]&&from.troops>11500)return raiseArmy(state,from.id,opportunities[0].to.id,{troops:Math.floor(from.troops*.5),food:Math.floor(from.troops*.24),commanderId:officers[0].id,deputyId:officers[1]?.id},id)}return state;
}

function randomEvent(state,rng) {const own=factionCities(state,state.playerFaction);if(!own.length)return;for(const city of Object.values(state.cities))if(city.disaster){city.disaster.months--;if(city.disaster.months<=0)city.disaster=null}const city=own[Math.floor(rng()*own.length)],roll=rng(),benevolent=state.factions[state.playerFaction].policy==="benevolence";
  if(roll<.07){state.factions[state.playerFaction].food+=3200;state.logs.unshift({kind:"event",title:"五谷丰登",body:`${city.name}今岁丰收，粮草 +3,200。`})}
  else if(roll<.12){city.order=Math.max(20,city.order-(benevolent?4:9));city.population+=12000;state.logs.unshift({kind:"event",title:"流民入境",body:`大批流民涌入${city.name}，人口增加，治安有所波动。`})}
  else if(roll<.17){const loss=benevolent?500:1100;city.troops=Math.max(1000,city.troops-loss);city.disaster={type:"疫病",months:3};state.logs.unshift({kind:"event",title:"军民染疫",body:`${city.name}爆发疫病，兵力 -${loss.toLocaleString()}，预计持续三个月。`})}
  else if(roll<.21){const loss=benevolent?1800:4200;state.factions[state.playerFaction].food=Math.max(0,state.factions[state.playerFaction].food-loss);city.disaster={type:"洪灾",months:2};state.logs.unshift({kind:"event",title:"江河泛滥",body:`${city.name}遭遇洪灾，赈济耗粮 ${loss.toLocaleString()}。`})}}

function processResearch(state){for(const f of Object.values(state.factions)){if(!f.research)continue;f.research.remaining--;if(f.research.remaining<=0){const id=f.research.id;f.technologies.push(id);f.research=null;state.logs.unshift({kind:"policy",title:"科技完成",body:`${f.name}完成「${TECHNOLOGIES[id].name}」研究。`})}}}
function processTreaties(state){for(const [key,treaty] of Object.entries(state.treaties)){if(treaty.expires>state.turn)continue;const [a,b]=key.split(":");if(treaty.type==="alliance"){state.factions[a].allies=state.factions[a].allies.filter(x=>x!==b);state.factions[b].allies=state.factions[b].allies.filter(x=>x!==a)}delete state.treaties[key];state.logs.unshift({kind:"diplomacy",title:"盟约期满",body:`${state.factions[a]?.name||a}与${state.factions[b]?.name||b}的盟约已经期满。`})}for(const [id,order] of Object.entries(state.jointTargets))if(order.expires<=state.turn)delete state.jointTargets[id]}
function historicalEvents(state){const key=`${state.year}-${state.month}`;if(state.eventsSeen.includes(key))return;let event=null;if(state.year===200&&state.month===2)event={title:"官渡对峙",body:"河北与中原剑拔弩张，各方开始囤积军粮。",apply:()=>{state.factions.wei.food+=5000;state.factions.yuan.food+=5000}};else if(state.year===208&&state.month===11)event={title:"赤壁东风",body:"大江之上东风骤起，水军与谋略成为决胜关键。",apply:()=>{for(const c of factionCities(state,"wu"))c.morale=Math.min(100,c.morale+8)}};else if(state.turn===24)event={title:"州牧并权",body:"长期战乱令州牧权势日隆，各势力威望增长。",apply:()=>{for(const f of Object.values(state.factions))if(f.alive)f.prestige+=20}};if(event){event.apply();state.eventsSeen.push(key);state.logs.unshift({kind:"event",title:event.title,body:event.body})}}

function processOfficers(state,rng){
  const busy=new Set(Object.values(state.armies).flatMap(a=>[a.commander,a.deputy].filter(Boolean)));
  for(const base of OFFICERS){const officer=officerById(state,base.id),mutable=state.officers[base.id];if(officer.status==="serving"&&!officer.ruler){const faction=state.factions[officer.faction];mutable.loyalty=Math.max(10,Math.min(100,officer.loyalty+(officer.title!=="校尉"?1:0)-(faction?.treasury<1000?3:0)));if(!faction?.alive&&!busy.has(officer.id)){Object.assign(mutable,{status:"wandering",faction:null,location:CITY_SPECS[Math.floor(rng()*CITY_SPECS.length)].id,title:"校尉"});continue}if(officer.loyalty<28&&!busy.has(officer.id)&&rng()<.18){for(const city of Object.values(state.cities))if(city.governor===officer.id)city.governor=factionOfficers(city.owner,state).find(o=>o.id!==officer.id)?.id;Object.assign(mutable,{status:"wandering",faction:null,location:CITY_SPECS[Math.floor(rng()*CITY_SPECS.length)].id,title:"校尉"});state.logs.unshift({kind:"officer",title:"将臣离心",body:`${officer.name}离开旧主，流落在野。`})}}
    else if(officer.status==="captured"&&officer.capturedBy!==state.playerFaction){mutable.loyalty=Math.max(15,officer.loyalty-3);if(officer.loyalty<58&&rng()<.22){Object.assign(mutable,{status:"serving",faction:officer.capturedBy,capturedBy:null,loyalty:48,title:"校尉"});state.logs.unshift({kind:"officer",title:"俘将归降",body:`${officer.name}归降${state.factions[mutable.faction].name}。`})}}
    else if(officer.status==="wandering"){const city=state.cities[officer.location],owner=city?.owner;if(owner&&owner!==state.playerFaction&&state.factions[owner].treasury>900&&rng()<.12){state.factions[owner].treasury-=600;Object.assign(mutable,{status:"serving",faction:owner,loyalty:68,title:"校尉"});state.logs.unshift({kind:"officer",title:"诸侯得士",body:`${officer.name}受${state.factions[owner].name}延揽出仕。`})}}
  }
}

export function advanceMonth(source,rng=Math.random) {
  let state=processArmies(clone(source),rng); if(state.status!=="playing")return state;
  for(const city of Object.values(state.cities)){const income=cityIncome(state,city),f=state.factions[city.owner],policy=f.policy||"balanced",techMoney=f.technologies.includes("commerce")?1.12:1,techFood=f.technologies.includes("agriculture")?1.12:1,special=["蜀锦","海盐","香料","典籍"].includes(city.specialty)?1.12:1,disaster=city.disaster?.6:1;let money=income.money*techMoney*special*disaster,food=income.food*techFood*disaster;if(policy==="farming"){food*=1.18;money*=.92}else if(policy==="trade"){money*=1.18;food*=.92}else if(policy==="militarism"){money*=.9;food*=.9}f.treasury+=Math.floor(money*(city.owner==="wei"?1.12:1));f.food+=Math.floor(food*(city.specialty==="稻米"?1.12:1));const growth=policy==="benevolence"?.004:city.order>70?.0025:.0008;city.population+=Math.floor(city.population*growth);if(!f.technologies.includes("fortification")||state.turn%2===0)city.defense=Math.max(18,city.defense-1);if(policy==="militarism")city.morale=Math.min(100,city.morale+2);if(city.delegated&&city.owner===state.playerFaction)delegatedAction(state,city)}
  for(const faction of Object.values(state.factions)){const upkeep=factionCities(state,faction.id).reduce((n,c)=>n+Math.floor(c.troops*.08),0);faction.food=Math.max(0,faction.food-upkeep);if(faction.id==="yuan")faction.prestige+=8;}
  for(const f of FACTIONS) if(f.id!==state.playerFaction&&state.factions[f.id].alive) state=aiTurn(state,f.id,rng)||state;
  state.month++;if(state.month>12){state.month=1;state.year++}state.turn++;state.actions=ACTIONS_PER_MONTH;processResearch(state);processTreaties(state);updateAliveAndStatus(state);processOfficers(state,rng);randomEvent(state,rng);historicalEvents(state);const summary=campaignSummary(state);state.stats.maxCities=Math.max(state.stats.maxCities,summary.cities);state.history.push({turn:state.turn,year:state.year,month:state.month,cities:summary.cities,power:summary.power,treasury:state.factions[state.playerFaction].treasury,food:state.factions[state.playerFaction].food,headline:state.logs[0]?.title});state.history=state.history.slice(-180);state.logs=state.logs.slice(0,220);updateAliveAndStatus(state);return state;
}

export function updateAliveAndStatus(state) {
  for(const f of FACTIONS) state.factions[f.id].alive=factionCities(state,f.id).length>0;
  const owned=factionCities(state,state.playerFaction).length;
  if(!owned){state.status="finished";state.winner="defeat";state.logs.unshift({kind:"ending",title:"基业尽失",body:"最后一座城池陷落，霸业至此而终。"});}
  else if(owned===CITY_SPECS.length){state.status="finished";state.winner="victory";const grade=state.turn<=96?"威震寰宇":state.turn<=180?"一代雄主":"百战定鼎";state.ending={grade,scenario:state.scenario,turns:state.turn,stats:{...state.stats}};state.logs.unshift({kind:"ending",title:"天下一统",body:`历经${state.turn}个月，四海归一，新朝由此肇始。评价：${grade}。`});}
}

export function campaignSummary(state) { const cities=factionCities(state,state.playerFaction),armyTroops=factionArmies(state,state.playerFaction).reduce((n,a)=>n+a.troops,0); return { cities:cities.length, population:cities.reduce((n,c)=>n+c.population,0), troops:cities.reduce((n,c)=>n+c.troops,0)+armyTroops, armies:factionArmies(state,state.playerFaction).length, power:factionPower(state,state.playerFaction) }; }
