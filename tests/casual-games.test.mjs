import test from "node:test";
import assert from "node:assert/strict";
import { canMove, mergeLine, moveBoard, spawnTile } from "../dist/games/2048/shared-rules.js";
import { placeFood, stepSnake } from "../dist/games/snake/shared-rules.js";

test("2048 merges every tile at most once", () => {
  assert.deepEqual(mergeLine([2,2,2,2]), { line:[4,4,0,0], score:8, merged:[0,1] });
  assert.deepEqual(mergeLine([4,4,8,0]), { line:[8,8,0,0], score:8, merged:[0] });
});

test("2048 moves columns and detects a locked board", () => {
  const source = [2,0,0,0, 2,0,0,0, 4,0,0,0, 4,0,0,0];
  assert.deepEqual(moveBoard(source,"up").board.slice(0,8), [4,0,0,0,8,0,0,0]);
  assert.equal(canMove([2,4,2,4, 4,2,4,2, 2,4,2,4, 4,2,4,2]), false);
});

test("2048 spawns only into an empty cell", () => {
  const source = Array(16).fill(2); source[7] = 0;
  const result = spawnTile(source, () => 0); assert.equal(result.index, 7); assert.equal(result.board[7], 2);
});

test("snake grows on food and may enter its vacated tail", () => {
  const snake = [{x:2,y:2},{x:1,y:2},{x:1,y:3},{x:2,y:3}];
  const moved = stepSnake(snake,{x:0,y:1},{x:9,y:9},10,10);
  assert.equal(moved.collided,false); assert.deepEqual(moved.snake[0],{x:2,y:3});
  const grown = stepSnake([{x:2,y:2},{x:1,y:2}],{x:1,y:0},{x:3,y:2},10,10);
  assert.equal(grown.ate,true); assert.equal(grown.snake.length,3);
});

test("snake detects walls and food never appears on its body", () => {
  assert.equal(stepSnake([{x:0,y:0}],{x:-1,y:0},{x:4,y:4},5,5).collided,true);
  assert.deepEqual(placeFood([{x:0,y:0},{x:1,y:0}],2,2,()=>0),{x:0,y:1});
});
