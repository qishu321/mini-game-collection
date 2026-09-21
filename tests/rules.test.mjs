import test from "node:test";
import assert from "node:assert/strict";
import {
  RED,
  BLACK,
  allLegalMoves,
  applyMove,
  createInitialPieces,
  isInCheck,
  checkingPieces,
  gameStatus,
  pseudoMoves,
  validMoves
} from "../dist/games/xiangqi/shared-rules.js";

const p = (id, side, type, x, y) => ({ id, side, type, x, y });
const has = (moves, x, y) => moves.some(move => move.x === x && move.y === y);

test("initial position has legal moves for both sides", () => {
  const pieces = createInitialPieces();
  assert.equal(pieces.length, 32);
  assert.ok(allLegalMoves(RED, pieces).length > 0);
  assert.ok(allLegalMoves(BLACK, pieces).length > 0);
  assert.equal(isInCheck(RED, pieces), false);
  assert.equal(isInCheck(BLACK, pieces), false);
});

test("checkmate identifies the checking piece and the winning side", () => {
  const pieces = [
    p("bg", BLACK, "general", 4, 0),
    p("rg", RED, "general", 4, 9),
    p("r1", RED, "rook", 4, 1),
    p("r2", RED, "rook", 3, 1),
    p("r3", RED, "rook", 5, 1)
  ];
  assert.deepEqual(checkingPieces(BLACK, pieces).map(piece => piece.id), ["r1"]);
  assert.deepEqual(gameStatus(BLACK, pieces), { over: true, winner: RED, reason: "将死" });
});

test("horse leg blocks the corresponding pair of jumps", () => {
  const horse = p("rh", RED, "horse", 4, 4);
  const pieces = [horse, p("block", RED, "pawn", 4, 3)];
  const moves = pseudoMoves(horse, pieces);
  assert.equal(has(moves, 3, 2), false);
  assert.equal(has(moves, 5, 2), false);
  assert.equal(has(moves, 6, 3), true);
});

test("elephant eye and river boundary are enforced", () => {
  const elephant = p("re", RED, "elephant", 2, 7);
  let moves = pseudoMoves(elephant, [elephant]);
  assert.equal(has(moves, 4, 5), true);
  assert.equal(has(moves, 0, 5), true);
  moves = pseudoMoves(elephant, [elephant, p("eye", RED, "pawn", 3, 6)]);
  assert.equal(has(moves, 4, 5), false);
  const riverElephant = p("river", RED, "elephant", 4, 5);
  assert.equal(has(pseudoMoves(riverElephant, [riverElephant]), 6, 3), false);
});

test("cannon captures only over exactly one screen", () => {
  const cannon = p("rc", RED, "cannon", 4, 7);
  const target = p("br", BLACK, "rook", 4, 2);
  assert.equal(has(pseudoMoves(cannon, [cannon, target]), 4, 2), false);
  const screen = p("screen", RED, "pawn", 4, 5);
  assert.equal(has(pseudoMoves(cannon, [cannon, screen, target]), 4, 2), true);
  const secondScreen = p("screen2", BLACK, "pawn", 4, 4);
  assert.equal(has(pseudoMoves(cannon, [cannon, screen, secondScreen, target]), 4, 2), false);
});

test("a pinned blocker cannot expose facing generals", () => {
  const redGeneral = p("rg", RED, "general", 4, 9);
  const blackGeneral = p("bg", BLACK, "general", 4, 0);
  const blocker = p("rr", RED, "rook", 4, 5);
  const pieces = [redGeneral, blackGeneral, blocker];
  const moves = validMoves(blocker, pieces);
  assert.equal(has(moves, 3, 5), false);
  assert.equal(has(moves, 4, 4), true);
  assert.equal(applyMove(pieces, { pieceId: "rr", x: 3, y: 5 }), null);
});
