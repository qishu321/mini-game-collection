import test from "node:test";
import assert from "node:assert/strict";
import { BLACK, WHITE, createBoard, indexOf, nearbyMoves, placeStone, winningLine } from "../dist/games/gomoku/shared-rules.js";
import { chooseMove } from "../dist/games/gomoku/gomoku-ai.js";

test("gomoku detects horizontal, vertical and diagonal wins", () => {
  for (const points of [
    [[3,7],[4,7],[5,7],[6,7],[7,7]],
    [[8,2],[8,3],[8,4],[8,5],[8,6]],
    [[2,3],[3,4],[4,5],[5,6],[6,7]]
  ]) {
    const board = createBoard(); points.forEach(([x,y]) => board[indexOf(x,y)] = BLACK);
    assert.equal(winningLine(board, indexOf(...points[4])).length, 5);
  }
});

test("gomoku rejects occupied intersections and opens at the center", () => {
  const board = createBoard(), center = indexOf(7,7), placed = placeStone(board, center, BLACK);
  assert.equal(nearbyMoves(board)[0], center); assert.equal(placeStone(placed, center, WHITE), null);
});

test("nightmare AI takes a win and blocks an immediate loss", () => {
  const winning = createBoard(); [4,5,6,7].forEach(x => winning[indexOf(x,7)] = WHITE);
  assert.ok([indexOf(3,7),indexOf(8,7)].includes(chooseMove(winning, WHITE, "nightmare", 100)));
  const blocking = createBoard(); [4,5,6,7].forEach(x => blocking[indexOf(x,9)] = BLACK);
  assert.ok([indexOf(3,9),indexOf(8,9)].includes(chooseMove(blocking, WHITE, "nightmare", 100)));
});
