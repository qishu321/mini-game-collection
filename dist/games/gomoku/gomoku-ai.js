import { EMPTY, indexOf, isInside, nearbyMoves, pointOf, winningLine } from "./shared-rules.js";

const DIRECTIONS = [[1,0],[0,1],[1,1],[1,-1]];
const SCORE = { five: 100000000, open4: 2200000, four: 320000, open3: 62000, three: 7200, open2: 1300, two: 180, one: 20 };

function shapeAt(board, index, side, dx, dy) {
  const { x, y } = pointOf(index); let count = 1, open = 0;
  for (const sign of [-1, 1]) {
    let nx = x + dx * sign, ny = y + dy * sign;
    while (isInside(nx, ny) && board[indexOf(nx, ny)] === side) { count++; nx += dx * sign; ny += dy * sign; }
    if (isInside(nx, ny) && board[indexOf(nx, ny)] === EMPTY) open++;
  }
  return { count, open };
}

export function tacticalScore(board, index, side) {
  if (board[index] !== EMPTY) return -Infinity;
  board[index] = side; let total = 0;
  for (const [dx, dy] of DIRECTIONS) {
    const { count, open } = shapeAt(board, index, side, dx, dy);
    if (count >= 5) total += SCORE.five;
    else if (count === 4 && open === 2) total += SCORE.open4;
    else if (count === 4 && open === 1) total += SCORE.four;
    else if (count === 3 && open === 2) total += SCORE.open3;
    else if (count === 3 && open === 1) total += SCORE.three;
    else if (count === 2 && open === 2) total += SCORE.open2;
    else if (count === 2 && open === 1) total += SCORE.two;
    else total += SCORE.one * open;
  }
  board[index] = EMPTY;
  const { x, y } = pointOf(index); return total + 18 - Math.abs(x - 7) - Math.abs(y - 7);
}

function orderedMoves(board, side, limit = 12) {
  return nearbyMoves(board).map(index => ({ index, score: tacticalScore(board, index, side) * 1.08 + tacticalScore(board, index, -side) }))
    .sort((a, b) => b.score - a.score).slice(0, limit);
}

function evaluate(board, side) {
  const mine = orderedMoves(board, side, 2), theirs = orderedMoves(board, -side, 2);
  return (mine[0]?.score || 0) + (mine[1]?.score || 0) * .25 - (theirs[0]?.score || 0) * 1.08 - (theirs[1]?.score || 0) * .2;
}

function search(board, side, rootSide, depth, alpha, beta, deadline) {
  if (performance.now() >= deadline || depth === 0) return evaluate(board, rootSide);
  const moves = orderedMoves(board, side, depth >= 2 ? 10 : 7);
  if (!moves.length) return 0;
  const maximizing = side === rootSide;
  let best = maximizing ? -Infinity : Infinity;
  for (const { index } of moves) {
    board[index] = side;
    const won = winningLine(board, index);
    const value = won ? (side === rootSide ? SCORE.five + depth : -SCORE.five - depth)
      : search(board, -side, rootSide, depth - 1, alpha, beta, deadline);
    board[index] = EMPTY;
    if (maximizing) { best = Math.max(best, value); alpha = Math.max(alpha, best); }
    else { best = Math.min(best, value); beta = Math.min(beta, best); }
    if (alpha >= beta || performance.now() >= deadline) break;
  }
  return best;
}

export function chooseMove(source, side, difficulty = "nightmare", budgetMs = 650) {
  const board = new Int8Array(source), candidates = orderedMoves(board, side, 18);
  if (!candidates.length) return null;
  for (const move of candidates) { board[move.index] = side; const win = winningLine(board, move.index); board[move.index] = EMPTY; if (win) return move.index; }
  for (const move of orderedMoves(board, -side, 18)) { board[move.index] = -side; const win = winningLine(board, move.index); board[move.index] = EMPTY; if (win) return move.index; }
  if (difficulty === "easy") {
    const pool = candidates.slice(0, Math.min(6, candidates.length)); return pool[Math.floor(Math.random() * pool.length)].index;
  }
  const deadline = performance.now() + budgetMs; let best = candidates[0].index, bestScore = -Infinity;
  const stones = board.reduce((sum, value) => sum + (value !== EMPTY), 0), depth = stones < 8 ? 2 : 3;
  for (const move of candidates.slice(0, 12)) {
    board[move.index] = side;
    const score = search(board, -side, side, depth - 1, -Infinity, Infinity, deadline) + move.score * .12;
    board[move.index] = EMPTY;
    if (score > bestScore) { bestScore = score; best = move.index; }
    if (performance.now() >= deadline) break;
  }
  return best;
}
