import test from "node:test";
import assert from "node:assert/strict";
import {createGame,currentQuest,interact,migrateGame,movePlayer,rest} from "../dist/games/mosslight/shared-rules.js";

test("mosslight starts as a persistent island journey",()=>{const s=createGame();assert.equal(s.day,1);assert.equal(currentQuest(s).id,"welcome");assert.equal(s.player.energy,100);assert.equal(migrateGame(s).version,1)});
test("movement stays inside the playable island",()=>{let s=createGame();for(let i=0;i<500;i++)s=movePlayer(s,-1,-1);assert.equal(s.player.x,18);assert.equal(s.player.y,20);for(let i=0;i<500;i++)s=movePlayer(s,1,1);assert.equal(s.player.x,83);assert.equal(s.player.y,82)});
test("the main quest restores the observatory and bridge",()=>{let s=createGame();({state:s}=interact(s,"post"));assert.equal(s.inventory.letters,1);for(let day=0;day<3;day++){({state:s}=interact(s,"pond"));if(day<2)s=rest(s)}assert.equal(currentQuest(s).id,"lens");({state:s}=interact(s,"observatory"));assert.equal(s.repaired.lens,true);for(let day=0;day<2;day++){({state:s}=interact(s,"oak"));if(day<1)s=rest(s)}assert.equal(currentQuest(s).id,"bridge");({state:s}=interact(s,"dock"));assert.equal(s.repaired.bridge,true);assert.equal(s.completed,true)});
test("resources can only be gathered once each day",()=>{let s=createGame(),result;({state:s}=interact(s,"pond"));({state:s,result}=interact(s,"pond"));assert.equal(s.inventory.dew,1);assert.match(result.body,/今天/)});
