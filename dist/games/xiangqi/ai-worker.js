const K = 1, A = 2, B = 3, N = 4, R = 5, C = 6, P = 7;
const VALUE = [0, 30000, 220, 220, 450, 1000, 500, 120];
const TYPE = { general: K, advisor: A, elephant: B, horse: N, rook: R, cannon: C, pawn: P };
const MATE = 1_000_000, INF = 2_000_000, TIMEOUT = Symbol("timeout");
const HORSE = [[1,2,0,1],[-1,2,0,1],[1,-2,0,-1],[-1,-2,0,-1],[2,1,1,0],[2,-1,1,0],[-2,1,-1,0],[-2,-1,-1,0]];
const DIAGONAL = [[1,1],[-1,1],[1,-1],[-1,-1]];
const ORTHOGONAL = [[1,0],[-1,0],[0,1],[0,-1]];

let board, rootIds, hash, lockHash, deadline, nodes, completedDepth, stopped;
let tt = new Map(), history = new Int32Array(8100), killers = [];

function randomTable(seed) {
  const table = Array.from({ length: 15 }, () => new Uint32Array(90));
  let value = seed >>> 0;
  const next = () => { value ^= value << 13; value ^= value >>> 17; value ^= value << 5; return value >>> 0; };
  for (const row of table) for (let i = 0; i < 90; i++) row[i] = next();
  return table;
}
const ZOBRIST = randomTable(0x91e10da5), ZOBRIST_LOCK = randomTable(0x6d2b79f5), SIDE_KEY = 0xa511e9b3;

const sq = (x, y) => y * 9 + x;
const xOf = square => square % 9;
const yOf = square => (square / 9) | 0;
const encode = (from, to) => from * 128 + to;
const fromOf = move => (move / 128) | 0;
const toOf = move => move & 127;
const sideOf = piece => piece > 0 ? 1 : piece < 0 ? -1 : 0;
const typeOf = piece => Math.abs(piece);
const inside = (x, y) => x >= 0 && x < 9 && y >= 0 && y < 10;
const palace = (side, x, y) => x >= 3 && x <= 5 && (side > 0 ? y >= 7 && y <= 9 : y >= 0 && y <= 2);

function initialize(pieces) {
  board = new Int8Array(90); rootIds = new Array(90).fill(null); hash = 0; lockHash = 0;
  for (const piece of pieces) {
    const square = sq(piece.x, piece.y), code = TYPE[piece.type] * (piece.side === "red" ? 1 : -1);
    board[square] = code; rootIds[square] = piece.id;
    hash = (hash ^ ZOBRIST[code + 7][square]) >>> 0; lockHash = (lockHash ^ ZOBRIST_LOCK[code + 7][square]) >>> 0;
  }
}

function pushMove(moves, side, from, x, y, capturesOnly = false) {
  if (!inside(x, y)) return false;
  const target = board[sq(x, y)];
  if (sideOf(target) === side) return true;
  if (!capturesOnly || target) moves.push(encode(from, sq(x, y)));
  return Boolean(target);
}

function pseudoMoves(side, capturesOnly = false) {
  const moves = [];
  for (let from = 0; from < 90; from++) {
    const piece = board[from]; if (sideOf(piece) !== side) continue;
    const type = typeOf(piece), x = xOf(from), y = yOf(from);
    if (type === R || type === C) {
      for (const [dx, dy] of ORTHOGONAL) {
        let nx = x + dx, ny = y + dy, screened = false;
        while (inside(nx, ny)) {
          const target = board[sq(nx, ny)];
          if (type === R) {
            if (!target) { if (!capturesOnly) moves.push(encode(from, sq(nx, ny))); }
            else { if (sideOf(target) !== side) moves.push(encode(from, sq(nx, ny))); break; }
          } else if (!screened) {
            if (!target) { if (!capturesOnly) moves.push(encode(from, sq(nx, ny))); }
            else screened = true;
          } else if (target) { if (sideOf(target) !== side) moves.push(encode(from, sq(nx, ny))); break; }
          nx += dx; ny += dy;
        }
      }
    } else if (type === N) {
      for (const [dx, dy, lx, ly] of HORSE) if (!board[sq(x + lx, y + ly)]) pushMove(moves, side, from, x + dx, y + dy, capturesOnly);
    } else if (type === B) {
      for (const [dx, dy] of [[2,2],[-2,2],[2,-2],[-2,-2]]) {
        const nx = x + dx, ny = y + dy;
        if ((side > 0 ? ny >= 5 : ny <= 4) && inside(nx, ny) && !board[sq(x + dx / 2, y + dy / 2)]) pushMove(moves, side, from, nx, ny, capturesOnly);
      }
    } else if (type === A) {
      for (const [dx, dy] of DIAGONAL) if (palace(side, x + dx, y + dy)) pushMove(moves, side, from, x + dx, y + dy, capturesOnly);
    } else if (type === K) {
      for (const [dx, dy] of ORTHOGONAL) if (palace(side, x + dx, y + dy)) pushMove(moves, side, from, x + dx, y + dy, capturesOnly);
      for (const dy of [-1, 1]) for (let ny = y + dy; inside(x, ny); ny += dy) if (board[sq(x, ny)]) { if (board[sq(x, ny)] === -side * K) moves.push(encode(from, sq(x, ny))); break; }
    } else if (type === P) {
      const dy = side > 0 ? -1 : 1; pushMove(moves, side, from, x, y + dy, capturesOnly);
      if (side > 0 ? y <= 4 : y >= 5) { pushMove(moves, side, from, x - 1, y, capturesOnly); pushMove(moves, side, from, x + 1, y, capturesOnly); }
    }
  }
  return moves;
}

function findKing(side) { for (let i = 0; i < 90; i++) if (board[i] === side * K) return i; return -1; }

function inCheck(side) {
  const king = findKing(side); if (king < 0) return true;
  const x = xOf(king), y = yOf(king), foe = -side;
  for (const [dx, dy] of ORTHOGONAL) {
    let nx = x + dx, ny = y + dy, blockers = 0;
    while (inside(nx, ny)) {
      const piece = board[sq(nx, ny)];
      if (piece) {
        if (!blockers) {
          if (piece === foe * R || piece === foe * K && dx === 0) return true;
          blockers = 1;
        } else { if (piece === foe * C) return true; break; }
      }
      nx += dx; ny += dy;
    }
  }
  for (const [dx, dy, lx, ly] of HORSE) {
    const hx = x - dx, hy = y - dy;
    if (inside(hx, hy) && board[sq(hx, hy)] === foe * N && !board[sq(hx + lx, hy + ly)]) return true;
  }
  const pawnDirection = foe > 0 ? -1 : 1, py = y - pawnDirection;
  if (inside(x, py) && board[sq(x, py)] === foe * P) return true;
  for (const px of [x - 1, x + 1]) if (inside(px, y) && board[sq(px, y)] === foe * P && (foe > 0 ? y <= 4 : y >= 5)) return true;
  for (const [dx, dy] of DIAGONAL) if (inside(x + dx, y + dy) && board[sq(x + dx, y + dy)] === foe * A) return true;
  for (const [dx, dy] of [[2,2],[-2,2],[2,-2],[-2,-2]]) {
    const ex = x + dx, ey = y + dy;
    if (inside(ex, ey) && board[sq(ex, ey)] === foe * B && !board[sq(x + dx / 2, y + dy / 2)]) return true;
  }
  return false;
}

function make(move) {
  const from = fromOf(move), to = toOf(move), piece = board[from], captured = board[to];
  hash = (hash ^ ZOBRIST[piece + 7][from] ^ ZOBRIST[piece + 7][to]) >>> 0;
  lockHash = (lockHash ^ ZOBRIST_LOCK[piece + 7][from] ^ ZOBRIST_LOCK[piece + 7][to]) >>> 0;
  if (captured) { hash = (hash ^ ZOBRIST[captured + 7][to]) >>> 0; lockHash = (lockHash ^ ZOBRIST_LOCK[captured + 7][to]) >>> 0; }
  board[to] = piece; board[from] = 0; return captured;
}
function undo(move, captured) {
  const from = fromOf(move), to = toOf(move), piece = board[to];
  board[from] = piece; board[to] = captured;
  hash = (hash ^ ZOBRIST[piece + 7][from] ^ ZOBRIST[piece + 7][to]) >>> 0;
  lockHash = (lockHash ^ ZOBRIST_LOCK[piece + 7][from] ^ ZOBRIST_LOCK[piece + 7][to]) >>> 0;
  if (captured) { hash = (hash ^ ZOBRIST[captured + 7][to]) >>> 0; lockHash = (lockHash ^ ZOBRIST_LOCK[captured + 7][to]) >>> 0; }
}

function legalMoves(side, capturesOnly = false) {
  const legal = [];
  for (const move of pseudoMoves(side, capturesOnly)) { const captured = make(move), legalMove = !inCheck(side); undo(move, captured); if (legalMove) legal.push(move); }
  return legal;
}

function positional(piece, square) {
  const side = sideOf(piece), type = typeOf(piece), x = xOf(square), y = yOf(square), center = 4 - Math.abs(4 - x), advance = side > 0 ? 9 - y : y;
  if (type === P) return advance * 11 + center * 4 + (advance >= 5 ? 62 : 0);
  if (type === N) return center * 12 + (4 - Math.abs(4.5 - y)) * 5;
  if (type === C) return center * 7 + (y > 1 && y < 8 ? 18 : 0);
  if (type === R) return center * 3 + (y > 0 && y < 9 ? 12 : 0);
  if (type === K) return -Math.abs(4 - x) * 10;
  return 0;
}

function evaluate(side) {
  let score = 0, ownGuards = 0, foeGuards = 0;
  for (let square = 0; square < 90; square++) {
    const piece = board[square]; if (!piece) continue;
    const value = VALUE[typeOf(piece)] + positional(piece, square);
    if (sideOf(piece) === side) { score += value; if (typeOf(piece) === A || typeOf(piece) === B) ownGuards++; }
    else { score -= value; if (typeOf(piece) === A || typeOf(piece) === B) foeGuards++; }
  }
  score += (ownGuards - foeGuards) * 7;
  if (inCheck(side)) score -= 105; if (inCheck(-side)) score += 90;
  return score;
}

function checkTime() { if ((++nodes & 2047) === 0 && performance.now() >= deadline) { stopped = true; throw TIMEOUT; } }
function ttKey(side) { return (hash ^ (side < 0 ? SIDE_KEY : 0)) >>> 0; }
function moveScore(move, ttMove, ply) {
  if (move === ttMove) return 2_000_000;
  const from = fromOf(move), to = toOf(move), victim = board[to];
  if (victim) return 1_000_000 + VALUE[typeOf(victim)] * 32 - VALUE[typeOf(board[from])];
  if (move === killers[ply]?.[0]) return 900_000;
  if (move === killers[ply]?.[1]) return 800_000;
  return history[from * 90 + to];
}
function ordered(moves, ttMove, ply) { return moves.sort((a, b) => moveScore(b, ttMove, ply) - moveScore(a, ttMove, ply)); }

function quiescence(side, alpha, beta, ply, remaining = 8) {
  checkTime();
  if (findKing(side) < 0) return -MATE + ply; if (findKing(-side) < 0) return MATE - ply;
  const checked = inCheck(side), stand = evaluate(side);
  if (!checked) { if (stand >= beta) return beta; if (stand > alpha) alpha = stand; if (remaining <= 0) return alpha; }
  if (remaining <= -2) return stand;
  const moves = ordered(legalMoves(side, !checked), 0, ply);
  if (checked && !moves.length) return -MATE + ply;
  for (const move of moves) {
    const captured = make(move), score = -quiescence(-side, -beta, -alpha, ply + 1, remaining - 1); undo(move, captured);
    if (score >= beta) return beta; if (score > alpha) alpha = score;
  }
  return alpha;
}

function hasMajor(side) { for (const piece of board) if (sideOf(piece) === side && (typeOf(piece) === R || typeOf(piece) === C || typeOf(piece) === N)) return true; return false; }

function search(side, depth, alpha, beta, ply, allowNull = true) {
  checkTime();
  if (findKing(side) < 0) return -MATE + ply; if (findKing(-side) < 0) return MATE - ply;
  const checked = inCheck(side); if (checked && depth > 0 && ply < 10) depth++;
  if (depth <= 0) return quiescence(side, alpha, beta, ply);
  const key = ttKey(side), cached = tt.get(key), originalAlpha = alpha;
  if (cached?.lock === lockHash && cached.depth >= depth) {
    if (cached.flag === 0) return cached.score;
    if (cached.flag === 1) alpha = Math.max(alpha, cached.score); else beta = Math.min(beta, cached.score);
    if (alpha >= beta) return cached.score;
  }
  if (allowNull && depth >= 4 && !checked && hasMajor(side)) {
    const reduction = depth >= 7 ? 3 : 2, score = -search(-side, depth - 1 - reduction, -beta, -beta + 1, ply + 1, false);
    if (score >= beta) return beta;
  }
  const moves = ordered(legalMoves(side), cached?.move || 0, ply);
  if (!moves.length) return -MATE + ply;
  let best = -INF, bestMove = 0, index = 0;
  for (const move of moves) {
    const captured = make(move); let score;
    if (index === 0) score = -search(-side, depth - 1, -beta, -alpha, ply + 1, true);
    else {
      const quiet = !captured, reduction = quiet && depth >= 4 && index >= 5 && !checked ? 1 + (index >= 12 && depth >= 6 ? 1 : 0) : 0;
      score = -search(-side, depth - 1 - reduction, -alpha - 1, -alpha, ply + 1, true);
      if (score > alpha && reduction) score = -search(-side, depth - 1, -alpha - 1, -alpha, ply + 1, true);
      if (score > alpha && score < beta) score = -search(-side, depth - 1, -beta, -alpha, ply + 1, true);
    }
    undo(move, captured); index++;
    if (score > best) { best = score; bestMove = move; }
    if (score > alpha) alpha = score;
    if (alpha >= beta) {
      if (!captured) { killers[ply] ||= []; if (killers[ply][0] !== move) killers[ply] = [move, killers[ply][0] || 0]; history[fromOf(move) * 90 + toOf(move)] += depth * depth; }
      break;
    }
  }
  const flag = best <= originalAlpha ? 2 : best >= beta ? 1 : 0;
  if (tt.size > 350_000) tt.clear(); tt.set(key, { lock: lockHash, depth, score: best, flag, move: bestMove });
  return best;
}

function rootSearch(side, depth, alpha, beta, rootMoves) {
  let best = -INF, bestMove = rootMoves[0]?.move || rootMoves[0] || 0, index = 0;
  for (const entry of rootMoves) {
    const move = entry.move || entry, captured = make(move); let score;
    if (index++ === 0) score = -search(-side, depth - 1, -beta, -alpha, 1, true);
    else { score = -search(-side, depth - 1, -alpha - 1, -alpha, 1, true); if (score > alpha && score < beta) score = -search(-side, depth - 1, -beta, -alpha, 1, true); }
    undo(move, captured);
    entry.score = score;
    if (score > best) { best = score; bestMove = move; }
    if (score > alpha) alpha = score;
  }
  rootMoves.sort((a, b) => (b.score ?? -INF) - (a.score ?? -INF));
  return { best, bestMove };
}

function nightmare(side, budget) {
  deadline = performance.now() + budget; nodes = 0; completedDepth = 0; stopped = false;
  for (let i = 0; i < history.length; i++) history[i] >>= 1;
  killers = [];
  let rootMoves = ordered(legalMoves(side), 0, 0).map(move => ({ move, score: 0 }));
  let bestMove = rootMoves[0]?.move || 0, previous = 0;
  for (let depth = 1; depth <= 12; depth++) {
    try {
      let window = depth >= 4 ? 70 : INF, result = rootSearch(side, depth, previous - window, previous + window, rootMoves);
      if (result.best <= previous - window || result.best >= previous + window) result = rootSearch(side, depth, -INF, INF, rootMoves);
      bestMove = result.bestMove; previous = result.best; completedDepth = depth;
      if (Math.abs(previous) > MATE - 200 || performance.now() >= deadline) break;
    } catch (error) { if (error !== TIMEOUT) throw error; break; }
  }
  return bestMove;
}

function simple(side) {
  const moves = legalMoves(side), scored = [];
  for (const move of moves) {
    const captured = make(move); let score = captured ? VALUE[typeOf(captured)] * 5 : 0;
    score += -evaluate(-side) * .12 + Math.random() * 180; if (inCheck(-side)) score += 100; undo(move, captured); scored.push({ move, score });
  }
  scored.sort((a, b) => b.score - a.score); return scored[0]?.move || 0;
}

export function computeMove(pieces, sideName, difficulty, budgetOverride) {
  initialize(pieces); const side = sideName === "red" ? 1 : -1, started = performance.now();
  const move = difficulty === "nightmare" ? nightmare(side, budgetOverride ?? 1700) : simple(side);
  if (!move) return { move: null, depth: completedDepth, nodes, elapsed: performance.now() - started };
  const from = fromOf(move), to = toOf(move);
  return { move: { pieceId: rootIds[from], x: xOf(to), y: yOf(to) }, depth: completedDepth, nodes, elapsed: performance.now() - started };
}

if (typeof self !== "undefined") self.onmessage = event => {
  const { pieces, side, difficulty } = event.data, started = performance.now();
  const result = computeMove(pieces, side, difficulty);
  const minimumDelay = difficulty === "nightmare" ? 620 : 360;
  setTimeout(() => self.postMessage(result), Math.max(0, minimumDelay - (performance.now() - started)));
};
