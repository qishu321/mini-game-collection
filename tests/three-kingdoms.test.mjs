import test from "node:test";
import assert from "node:assert/strict";
import { ACTIONS_PER_MONTH, CITY_SPECS, FACTIONS, OFFICERS, activeTreaty, advanceMonth, appointGovernor, appointOffice, armyAction, attack, availableOfficers, capturedOfficers, cityAction, createCampaign, diplomacyAction, factionCities, factionOfficers, migrateCampaign, migratePopulation, prisonerAction, raiseArmy, recruitOfficer, rewardOfficer, setDelegated, setNationalPolicy, startResearch, wanderingOfficers } from "../dist/games/three-kingdoms/shared-rules.js";

test("three kingdoms campaign has the promised strategic scale",()=>{
  const state=createCampaign("wei");
  assert.equal(CITY_SPECS.length,36);
  assert.equal(FACTIONS.length,10);
  assert.equal(OFFICERS.length,60);
  assert.equal(Object.keys(state.cities).length,36);
  assert.equal(state.actions,ACTIONS_PER_MONTH);
  assert.ok(factionCities(state,"wei").length>0);
});

test("domestic orders consume actions and improve the selected city",()=>{
  const state=createCampaign("wei"),before=state.cities.xuchang.agriculture;
  const next=cityAction(state,"xuchang","farm");
  assert.equal(next.actions,state.actions-1);
  assert.ok(next.cities.xuchang.agriculture>before);
  assert.ok(next.factions.wei.treasury<state.factions.wei.treasury);
  assert.equal(state.cities.xuchang.agriculture,before);
});

test("delegation and monthly settlement create a persistent campaign loop",()=>{
  let state=createCampaign("wei");
  state=setDelegated(state,"xuchang",true);
  const next=advanceMonth(state,()=>.99);
  assert.equal(next.turn,2);
  assert.equal(next.month,4);
  assert.equal(next.actions,ACTIONS_PER_MONTH);
  assert.equal(next.cities.xuchang.delegated,true);
});

test("a superior adjacent army can conquer and transfer a city",()=>{
  const state=createCampaign("wei");
  state.cities.xuchang.troops=60000;
  state.cities.wan.troops=1000;
  state.cities.wan.defense=10;
  const next=attack(state,"xuchang","wan",.6,()=>.5);
  assert.equal(next.lastBattle.victory,true);
  assert.equal(next.cities.wan.owner,"wei");
  assert.equal(next.actions,state.actions-1);
});

test("an expedition becomes an independent army and reserves its officers",()=>{
  const state=createCampaign("wei"),beforeTroops=state.cities.xuchang.troops;
  const next=raiseArmy(state,"xuchang","wan",{troops:7000,food:2500,commanderId:"wei-2",deputyId:"wei-3"});
  const army=Object.values(next.armies)[0];
  assert.equal(army.status,"moving");
  assert.equal(army.target,"wan");
  assert.equal(next.cities.xuchang.troops,beforeTroops-7000);
  assert.equal(availableOfficers(next,"wei").some(o=>o.id==="wei-2"),false);
});

test("armies march by month, can besiege, and eventually reduce fortifications",()=>{
  let state=createCampaign("wei");
  state=raiseArmy(state,"xuchang","wan",{troops:7000,food:3500,commanderId:"wei-2"});
  const armyId=Object.keys(state.armies)[0];
  state=advanceMonth(state,()=>.99);
  assert.equal(state.armies[armyId].status,"awaiting");
  const defense=state.cities.wan.defense;
  state=armyAction(state,armyId,"besiege",()=>.5);
  state=advanceMonth(state,()=>.99);
  assert.equal(state.armies[armyId].status,"besieging");
  assert.ok(state.cities.wan.defense<defense);
});

test("a powerful army can assault, capture, and remain stationed",()=>{
  let state=createCampaign("wei");state.cities.xuchang.troops=50000;state.cities.wan.troops=900;state.cities.wan.defense=5;
  state=raiseArmy(state,"xuchang","wan",{troops:30000,food:12000,commanderId:"wei-2",deputyId:"wei-3"});
  const armyId=Object.keys(state.armies)[0];state=advanceMonth(state,()=>.99);state=advanceMonth(state,()=>.99);state=armyAction(state,armyId,"assault",()=>.5);
  assert.equal(state.cities.wan.owner,"wei");
  assert.equal(state.armies[armyId].status,"stationed");
  assert.equal(state.armies[armyId].location,"wan");
});

test("wandering officers can be recruited, rewarded, promoted, and appointed governor",()=>{
  let state=createCampaign("wei");const wanderer=wanderingOfficers(state,"xuchang")[0];
  assert.ok(wanderer);
  state=recruitOfficer(state,"xuchang",wanderer.id,"gift",()=>0);
  assert.equal(state.officers[wanderer.id].faction,"wei");
  state=rewardOfficer(state,wanderer.id);
  assert.ok(state.officers[wanderer.id].loyalty>=90);
  state=appointOffice(state,wanderer.id,"尚书");
  assert.equal(state.officers[wanderer.id].title,"尚书");
  state=appointGovernor(state,"xuchang",wanderer.id);
  assert.equal(state.cities.xuchang.governor,wanderer.id);
});

test("defeated governors may be captured and persuaded to surrender",()=>{
  let state=createCampaign("wei");state.cities.xuchang.troops=50000;state.cities.wan.troops=500;state.cities.wan.defense=1;
  const oldGovernor=state.cities.wan.governor;
  state=raiseArmy(state,"xuchang","wan",{troops:30000,food:12000,commanderId:"wei-2",deputyId:"wei-3"});
  const armyId=Object.keys(state.armies)[0];state=advanceMonth(state,()=>.99);state=advanceMonth(state,()=>.99);state=armyAction(state,armyId,"assault",()=>0);
  assert.equal(capturedOfficers(state,"wei").some(o=>o.id===oldGovernor),true);
  state=prisonerAction(state,oldGovernor,"persuade",()=>0);
  assert.equal(state.officers[oldGovernor].status,"serving");
  assert.equal(state.officers[oldGovernor].faction,"wei");
  assert.equal(factionOfficers("wei",state).some(o=>o.id===oldGovernor),true);
});

test("v0.8 scenarios, policies, technology and specialties persist",()=>{
  let state=createCampaign("wei","赤壁鏖兵");
  assert.equal(state.version,8);assert.equal(state.scenario,"赤壁鏖兵");assert.ok(state.cities.xuchang.specialty);
  state=setNationalPolicy(state,"farming");assert.equal(state.factions.wei.policy,"farming");
  state.actions=ACTIONS_PER_MONTH;state=startResearch(state,"agriculture");
  for(let i=0;i<3;i++)state=advanceMonth(state,()=>.99);
  assert.ok(state.factions.wei.technologies.includes("agriculture"));assert.ok(state.history.length>=3);
  const migrated=migrateCampaign(state);assert.equal(migrated.version,8);assert.equal(migrated.scenario,"赤壁鏖兵");
});

test("diplomatic treaties expire and population can move between friendly cities",()=>{
  let state=createCampaign("wei");state=diplomacyAction(state,"liu","truce",()=>0);
  assert.equal(activeTreaty(state,"wei","liu").type,"truce");
  const before=state.cities.xuchang.population,target=state.cities.chenliu.population;state.actions=ACTIONS_PER_MONTH;
  state=migratePopulation(state,"xuchang","chenliu",10000);
  assert.equal(state.cities.xuchang.population,before-10000);assert.equal(state.cities.chenliu.population,target+10000);
  for(let i=0;i<13;i++)state=advanceMonth(state,()=>.99);assert.equal(activeTreaty(state,"wei","liu"),null);
});

test("strategic AI produces a durable plan and reinforces its frontier",()=>{
  let state=createCampaign("wei");state=advanceMonth(state,()=>.2);
  const plan=state.factions.yuan.aiPlan;assert.ok(plan);assert.ok(plan.expires>state.turn);assert.ok(["defend","expand"].includes(plan.stance));
});
