export const COLS=11,ROWS=7,TOTAL_WAVES=6;
export const PATH=[[0,3],[1,3],[2,3],[2,2],[3,2],[4,2],[4,3],[5,3],[6,3],[6,2],[7,2],[8,2],[8,3],[9,3],[10,3]];
export const PLOTS=[[1,1],[3,1],[5,1],[7,1],[9,1],[0,2],[3,3],[5,2],[7,3],[9,2],[1,4],[3,4],[5,4],[7,4],[9,4],[2,5],[4,5],[6,5],[8,5]];
export const UNITS={
  knight:{name:"小骑士",cost:3,damage:1.55,range:1.45,interval:.8,description:"贴近道路拦敌；连接弓手形成贯穿箭",color:"#e5b66d"},
  ranger:{name:"小弓手",cost:4,damage:1.3,range:2.65,interval:.72,description:"远程输出；连接法师对冰冻敌人增伤",color:"#a9cc8a"},
  mage:{name:"小法师",cost:5,damage:1.15,range:2.05,interval:1.25,description:"范围寒霜；连接骑士为剑刃附霜",color:"#c4b0e8"}
};
export const ENEMIES={
  slime:{name:"软泥团",hp:10,speed:.72,reward:0,role:"成群推进"},
  bat:{name:"夜蝠",hp:13,speed:1.55,reward:0,role:"飞行：不受骑士拦截"},
  armor:{name:"甲壳兽",hp:36,speed:.56,reward:1,role:"护甲：抵抗普通箭矢"},
  sapper:{name:"断丝地精",hp:22,speed:.95,reward:1,role:"靠近冒险者时切断菌丝"},
  boss:{name:"噬灯巨兽",hp:240,speed:.45,reward:6,role:"交替施放断丝咆哮与踏地冲锋；流星术可打断"}
};
export const WAVE_PLAN=[
  {title:"林缘试探",hint:"软泥团会成群推进。把骑士放在弯道旁。",types:["slime","slime","slime","slime","slime","slime"]},
  {title:"夜空来客",hint:"夜蝠不会被骑士拦住，弓手要覆盖后半程。",types:["slime","bat","slime","bat","slime","bat","slime"]},
  {title:"硬壳行军",hint:"甲壳兽能抗箭。试试法师，或让骑士连上弓手。",types:["slime","armor","slime","bat","armor","slime","bat"]},
  {title:"断丝者",hint:"断丝地精会封住附近的冒险者。不要只守一个点。",types:["slime","sapper","bat","sapper","armor","slime","bat"]},
  {title:"月蚀前夜",hint:"飞行、护甲与断丝者混编。检查防线的空档。",types:["bat","armor","sapper","slime","bat","armor","sapper","slime","bat"]},
  {title:"噬灯之夜",hint:"巨兽会预告断丝咆哮与踏地冲锋。流星术命中巨兽可打断。",types:["bat","sapper","armor","bat","armor","sapper","boss"]}
];
export const UPGRADES=[
  {id:"pierce",icon:"➶",name:"穿林箭",description:"弓手的箭穿透下一个敌人",tag:"弓手·攻击方式"},
  {id:"ricochet",icon:"✧",name:"回旋箭",description:"弓手的箭跳向附近另一名敌人",tag:"弓手·攻击方式"},
  {id:"shatter",icon:"❄",name:"碎冰咒",description:"弓手与法师连锁时，冰冻目标碎裂波及周围",tag:"法师×弓手"},
  {id:"bastion",icon:"⛨",name:"孢子壁垒",description:"骑士拦截范围扩大，拦敌更久",tag:"骑士·阵线"},
  {id:"thorns",icon:"✹",name:"荆棘铠",description:"经过骑士身边的敌人持续受伤",tag:"骑士·阵线"},
  {id:"blizzard",icon:"✦",name:"霜环",description:"法师攻击溅射范围扩大",tag:"法师·范围"},
  {id:"ember",icon:"✺",name:"星火余烬",description:"流星术命中后留下灼烧",tag:"法术·主动"},
  {id:"bounty",icon:"◆",name:"拾金菌",description:"每击败一名敌人额外获得 1 金币",tag:"经济·成长"},
  {id:"supply",icon:"▣",name:"旅团补给",description:"立刻获得 5 金币",tag:"经济·即时"},
  {id:"heal",icon:"♥",name:"菌心修复",description:"立刻恢复 3 点城堡生命",tag:"守护·即时"},
  {id:"steel",icon:"⚔",name:"精钢短剑",description:"骑士伤害 +35%",tag:"骑士·强化"}
];
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),point=u=>({x:u.x+.5,y:u.y+.5});
export const plotAt=(x,y)=>PLOTS.some(([px,py])=>px===x&&py===y);
export const linkActive=u=>(u.jam||0)<=0;
export function linkedTo(s,u,type){return s.units.some(v=>v.id!==u.id&&v.type===type&&linkActive(v)&&distance(point(u),point(v))<=2.35)}
export function createRun(){return{phase:"build",wave:0,hearts:10,maxHearts:10,coins:12,score:0,units:[],enemies:[],effects:[],queue:[],spawnClock:0,spellCooldown:0,choices:[],upgrades:[],mods:{knight:1,ranger:1,mage:1,guard:0,range:0,chill:0,haste:1,bounty:0,spell:0,pierce:false,ricochet:false,shatter:false,bastion:false,thorns:false,blizzard:false,ember:false},nextId:1,kills:0}}
export function canPlace(s,type,x,y){return s.phase==="build"&&Boolean(UNITS[type])&&plotAt(x,y)&&!s.units.some(u=>u.x===x&&u.y===y)&&s.coins>=UNITS[type].cost}
export function placeUnit(s,type,x,y){if(!canPlace(s,type,x,y))return false;s.coins-=UNITS[type].cost;s.units.push({id:s.nextId++,type,x,y,level:1,cooldown:0,jam:0});return true}
export function upgradeUnit(s,id){const u=s.units.find(v=>v.id===id);if(!u||s.phase!=="build"||u.level>=3)return false;const cost=UNITS[u.type].cost+u.level*2;if(s.coins<cost)return false;s.coins-=cost;u.level++;return true}
export function sellUnit(s,id){const index=s.units.findIndex(u=>u.id===id);if(index<0||s.phase!=="build")return false;const [u]=s.units.splice(index,1);s.coins+=Math.floor((UNITS[u.type].cost+(u.level-1)*3)*.6);return true}
export const waveQueue=number=>[...(WAVE_PLAN[number-1]?.types||[])];
export function startWave(s){if(s.phase!=="build"||s.wave>=TOTAL_WAVES)return false;s.wave++;s.queue=waveQueue(s.wave);s.spawnClock=.2;s.phase="battle";return true}
export function draftChoices(random=Math.random,owned=[]){const pool=UPGRADES.filter(item=>!owned.includes(item.id)),choices=[];while(choices.length<3&&pool.length){const index=Math.min(pool.length-1,Math.floor(random()*pool.length));choices.push(pool.splice(index,1)[0])}return choices}
export function chooseUpgrade(s,id){if(s.phase!=="reward"||!s.choices.some(c=>c.id===id))return false;s.upgrades.push(id);switch(id){case"steel":s.mods.knight*=1.35;break;case"bounty":s.mods.bounty++;break;case"supply":s.coins+=5;break;case"heal":s.hearts=Math.min(s.maxHearts,s.hearts+3);break;default:s.mods[id]=true}s.choices=[];s.phase="build";return true}
export function enemyPoint(e){const i=Math.min(PATH.length-2,e.segment),a=PATH[i],b=PATH[i+1];return{x:a[0]+(b[0]-a[0])*e.progress+.5,y:a[1]+(b[1]-a[1])*e.progress+.5}}
export function spawnEnemy(s,type){const spec=ENEMIES[type];if(!spec)return;const hp=spec.hp*(1+(s.wave-1)*.16);s.enemies.push({id:s.nextId++,type,hp,maxHp:hp,segment:0,progress:0,slow:0,stun:0,pulse:1.4,burn:0,hit:0,intent:null,abilityClock:type==="boss"?2.8:0,nextAbility:"howl"});s.effects.push({type:"spawn",x:.5,y:3.5,life:.38})}
function removeDead(s){s.enemies=s.enemies.filter(e=>{if(e.hp>0)return true;s.kills++;s.score+=12+s.wave*3;s.coins+=ENEMIES[e.type].reward+s.mods.bounty;s.effects.push({type:"pop",...enemyPoint(e),life:.42});return false})}
export function castSpell(s,x,y){if(s.phase!=="battle"||s.spellCooldown>0||!s.enemies.length)return false;s.spellCooldown=16;s.effects.push({type:"spell",x,y,life:.65});for(const e of s.enemies)if(distance(enemyPoint(e),{x,y})<=1.55){const interrupted=e.type==="boss"&&Boolean(e.intent);damage(e,interrupted?45:10);if(s.mods.ember)e.burn=3;if(interrupted){e.intent=null;e.abilityClock=6.5;e.stun=Math.max(e.stun,2.4);s.effects.push({type:"interrupt",...enemyPoint(e),life:.9});s.interrupts=(s.interrupts||0)+1}}removeDead(s);return true}
function damage(e,amount){if(e.hp>0&&amount>0){e.hp-=amount;if(amount>.2)e.hit=Math.max(e.hit||0,.18)}}
function shatter(s,target,amount){if(!s.mods.shatter)return;const at=enemyPoint(target);for(const e of s.enemies)if(e!==target&&distance(enemyPoint(e),at)<.9)damage(e,amount*.55);s.effects.push({type:"shatter",...at,life:.4})}
function triggerLink(s,u,type,label,at){const ally=s.units.find(v=>v.id!==u.id&&v.type===type&&linkActive(v)&&distance(point(u),point(v))<=2.35);if(!ally)return false;u.linkGlow=.55;ally.linkGlow=.55;if((u.linkNotice||0)<=0){s.effects.push({type:"combo",x:at.x,y:at.y,life:.8,label});u.linkNotice=1.25}return true}
function finishIntent(s,e){const intent=e.intent;if(!intent)return;const at=intent.kind==="rush"?enemyPoint(e):{x:intent.x,y:intent.y};if(intent.kind==="howl"||intent.kind==="sapper"){const radius=intent.kind==="howl"?2.25:1.2,seconds=intent.kind==="howl"?2.2:2.1;for(const u of s.units)if(distance(point(u),at)<radius)u.jam=Math.max(u.jam||0,seconds);s.effects.push({type:"jam",...at,life:.5})}else if(intent.kind==="rush"){e.progress+=1.35;s.effects.push({type:"rush",...at,life:.55});while(e.progress>=1){e.progress--;e.segment++;if(e.segment>=PATH.length-1){s.hearts-=5;e.hp=-999;s.effects.push({type:"hit",x:10.5,y:3.5,life:.7});break}}}e.intent=null;if(e.type==="boss")e.abilityClock=6.8;else e.pulse=2.7}
export function tick(s,dt){if(s.phase!=="battle")return;dt=Math.min(.06,Math.max(0,dt));s.spellCooldown=Math.max(0,s.spellCooldown-dt);s.effects=s.effects.filter(fx=>(fx.life-=dt)>0);s.spawnClock-=dt;
  if(s.queue.length&&s.spawnClock<=0){spawnEnemy(s,s.queue.shift());s.spawnClock=.95}
  for(const u of s.units){u.jam=Math.max(0,(u.jam||0)-dt);u.attack=Math.max(0,(u.attack||0)-dt);u.linkGlow=Math.max(0,(u.linkGlow||0)-dt);u.linkNotice=Math.max(0,(u.linkNotice||0)-dt)}
  for(const e of s.enemies){e.stun=Math.max(0,e.stun-dt);e.slow=Math.max(0,e.slow-dt);e.hit=Math.max(0,(e.hit||0)-dt);e.pulse-=dt;if(e.burn>0){e.burn-=dt;damage(e,2*dt)}
    if(e.hp<=0)continue;
    if(e.intent){e.intent.remaining-=dt;if(e.intent.remaining<=0)finishIntent(s,e)}
    else if(e.type==="boss"){e.abilityClock-=dt;if(e.abilityClock<=0){const kind=e.nextAbility,at=enemyPoint(e);e.intent={kind,remaining:kind==="howl"?1.6:1.25,total:kind==="howl"?1.6:1.25,...at};e.nextAbility=kind==="howl"?"rush":"howl";s.effects.push({type:"warn",...at,life:.5})}}
    else if(e.type==="sapper"&&e.pulse<=0){const at=enemyPoint(e);if(s.units.some(u=>distance(point(u),at)<1.6))e.intent={kind:"sapper",remaining:.7,total:.7,...at};else e.pulse=.35}
    if(e.stun>0||e.hp<=0)continue;let speed=ENEMIES[e.type].speed*(e.slow>0?.58:1);if(e.type==="boss"&&e.hp<e.maxHp*.5)speed*=1.65;
    if(e.type!=="bat")for(const u of s.units)if(u.type==="knight"&&linkActive(u)&&distance(point(u),enemyPoint(e))<(s.mods.bastion?1.4:1.05)){speed*=s.mods.bastion?.42:.62;if(s.mods.thorns)damage(e,2.4*dt);break}
    e.progress+=speed*dt;while(e.progress>=1){e.progress--;e.segment++;if(e.segment>=PATH.length-1){s.hearts-=e.type==="boss"?5:1;e.hp=-999;s.effects.push({type:"hit",x:10.5,y:3.5,life:.7});break}}
  }
  s.enemies=s.enemies.filter(e=>e.hp!==-999);
  for(const u of s.units){u.cooldown-=dt;if(u.cooldown>0||!linkActive(u))continue;const spec=UNITS[u.type],origin=point(u),range=spec.range+(u.type==="ranger"?s.mods.range:0);let target=null;
    for(const e of s.enemies){if(e.hp<=0||distance(origin,enemyPoint(e))>range)continue;if(!target||e.segment+e.progress>target.segment+target.progress)target=e}
    if(!target)continue;const at=enemyPoint(target),base=spec.damage*(1+(u.level-1)*.7)*s.mods[u.type];u.cooldown=spec.interval*s.mods.haste;u.attack=.2;s.effects.push({type:u.type,x:at.x,y:at.y,fromX:origin.x,fromY:origin.y,life:.3});
    if(u.type==="mage"){for(const e of s.enemies)if(distance(enemyPoint(e),at)<(s.mods.blizzard?1.28:.82)){damage(e,base);e.slow=1.5+s.mods.chill*3}}
    else if(u.type==="knight"){damage(target,base);if(target.type!=="bat")target.stun=.2+s.mods.guard;if(triggerLink(s,u,"mage","附霜",at))target.slow=1.5}
    else{const guarded=linkedTo(s,u,"knight"),frozen=target.slow>0,armored=target.type==="armor",mageLinked=frozen&&linkedTo(s,u,"mage"),amount=(base*(guarded?1.25:1)+(mageLinked?1.5:0))*(armored&&!guarded&&!s.mods.pierce?.55:1);damage(target,amount);if(guarded)triggerLink(s,u,"knight","贯穿",at);if(mageLinked){triggerLink(s,u,"mage","冰伤",at);shatter(s,target,amount)}
      if(guarded||s.mods.pierce||s.mods.ricochet){const others=s.enemies.filter(e=>e!==target&&e.hp>0&&distance(enemyPoint(e),at)<(s.mods.ricochet?1.4:.85));if(others.length)damage(others[0],amount*(s.mods.pierce?.8:.55))}
    }
  }
  removeDead(s);if(s.hearts<=0){s.hearts=0;s.phase="lost";return}
  if(!s.queue.length&&!s.enemies.length){if(s.wave===TOTAL_WAVES){s.phase="won";s.score+=s.hearts*35}else{s.phase="reward";s.coins+=5;s.choices=draftChoices(Math.random,s.upgrades)}}
}
