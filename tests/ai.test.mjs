import test from "node:test";
import assert from "node:assert/strict";
import { computeMove } from "../dist/games/xiangqi/ai-worker.js";
import { BLACK, applyMove, createInitialPieces } from "../dist/games/xiangqi/shared-rules.js";

test("browser nightmare engine returns a legal move", () => {
  const pieces = createInitialPieces();
  const result = computeMove(pieces, BLACK, "nightmare", 180);
  assert.ok(result.move);
  assert.ok(applyMove(pieces, result.move));
  assert.ok(result.depth >= 1);
  assert.ok(result.nodes > 0);
});
