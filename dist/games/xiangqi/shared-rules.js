export const RED = "red";
export const BLACK = "black";

export const NAMES = {
  red: { general: "帅", advisor: "仕", elephant: "相", horse: "马", rook: "车", cannon: "炮", pawn: "兵" },
  black: { general: "将", advisor: "士", elephant: "象", horse: "馬", rook: "車", cannon: "砲", pawn: "卒" }
};

export const VALUES = { general: 20000, rook: 900, cannon: 450, horse: 400, elephant: 210, advisor: 210, pawn: 100 };

function piece(side, type, x, y, id) {
  return { side, type, x, y, id: `${side}-${type}-${id}` };
}

export function createInitialPieces() {
  const result = [];
  const back = ["rook", "horse", "elephant", "advisor", "general", "advisor", "elephant", "horse", "rook"];
  back.forEach((type, x) => result.push(piece(BLACK, type, x, 0, x)));
  result.push(piece(BLACK, "cannon", 1, 2, 0), piece(BLACK, "cannon", 7, 2, 1));
  [0, 2, 4, 6, 8].forEach((x, i) => result.push(piece(BLACK, "pawn", x, 3, i)));
  back.forEach((type, x) => result.push(piece(RED, type, x, 9, x)));
  result.push(piece(RED, "cannon", 1, 7, 0), piece(RED, "cannon", 7, 7, 1));
  [0, 2, 4, 6, 8].forEach((x, i) => result.push(piece(RED, "pawn", x, 6, i)));
  return result;
}

export function clonePieces(state) { return state.map(item => ({ ...item })); }
export function at(state, x, y) { return state.find(item => item.x === x && item.y === y); }
export function enemy(side) { return side === RED ? BLACK : RED; }
function inBounds(x, y) { return x >= 0 && x <= 8 && y >= 0 && y <= 9; }
function inPalace(side, x, y) { return x >= 3 && x <= 5 && (side === RED ? y >= 7 && y <= 9 : y >= 0 && y <= 2); }

function rayMoves(item, state, cannon = false) {
  const moves = [];
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    let x = item.x + dx, y = item.y + dy, screen = false;
    while (inBounds(x, y)) {
      const target = at(state, x, y);
      if (!cannon) {
        if (!target) moves.push({ x, y });
        else { if (target.side !== item.side) moves.push({ x, y }); break; }
      } else if (!screen) {
        if (!target) moves.push({ x, y });
        else screen = true;
      } else if (target) {
        if (target.side !== item.side) moves.push({ x, y });
        break;
      }
      x += dx; y += dy;
    }
  }
  return moves;
}

export function pseudoMoves(item, state) {
  const result = [];
  const add = (x, y) => {
    if (!inBounds(x, y)) return;
    const target = at(state, x, y);
    if (!target || target.side !== item.side) result.push({ x, y });
  };

  if (item.type === "rook") return rayMoves(item, state);
  if (item.type === "cannon") return rayMoves(item, state, true);

  if (item.type === "horse") {
    const candidates = [[1,2,0,1],[-1,2,0,1],[1,-2,0,-1],[-1,-2,0,-1],[2,1,1,0],[2,-1,1,0],[-2,1,-1,0],[-2,-1,-1,0]];
    for (const [dx, dy, lx, ly] of candidates) if (!at(state, item.x + lx, item.y + ly)) add(item.x + dx, item.y + dy);
  }
  if (item.type === "elephant") {
    for (const [dx, dy] of [[2,2],[-2,2],[2,-2],[-2,-2]]) {
      const x = item.x + dx, y = item.y + dy;
      const ownSide = item.side === RED ? y >= 5 : y <= 4;
      if (ownSide && !at(state, item.x + dx / 2, item.y + dy / 2)) add(x, y);
    }
  }
  if (item.type === "advisor") {
    for (const [dx, dy] of [[1,1],[-1,1],[1,-1],[-1,-1]]) {
      const x = item.x + dx, y = item.y + dy;
      if (inPalace(item.side, x, y)) add(x, y);
    }
  }
  if (item.type === "general") {
    for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
      const x = item.x + dx, y = item.y + dy;
      if (inPalace(item.side, x, y)) add(x, y);
    }
    const opposing = state.find(p => p.type === "general" && p.side !== item.side);
    if (opposing && opposing.x === item.x) {
      const min = Math.min(item.y, opposing.y) + 1, max = Math.max(item.y, opposing.y);
      if (!state.some(p => p.x === item.x && p.y >= min && p.y < max)) add(opposing.x, opposing.y);
    }
  }
  if (item.type === "pawn") {
    const direction = item.side === RED ? -1 : 1;
    add(item.x, item.y + direction);
    const crossed = item.side === RED ? item.y <= 4 : item.y >= 5;
    if (crossed) { add(item.x - 1, item.y); add(item.x + 1, item.y); }
  }
  return result;
}

export function simulateMove(state, pieceId, x, y) {
  return state.filter(p => p.id === pieceId || p.x !== x || p.y !== y).map(p => p.id === pieceId ? { ...p, x, y } : { ...p });
}

export function isInCheck(side, state) {
  const general = state.find(p => p.side === side && p.type === "general");
  if (!general) return true;
  return state.some(p => p.side !== side && pseudoMoves(p, state).some(move => move.x === general.x && move.y === general.y));
}

export function checkingPieces(side, state) {
  const general = state.find(p => p.side === side && p.type === "general");
  if (!general) return [];
  return state.filter(p => p.side !== side && pseudoMoves(p, state).some(move => move.x === general.x && move.y === general.y));
}

export function validMoves(item, state) {
  return pseudoMoves(item, state).filter(move => !isInCheck(item.side, simulateMove(state, item.id, move.x, move.y)));
}

export function allLegalMoves(side, state) {
  const moves = [];
  for (const item of state) if (item.side === side) {
    for (const move of validMoves(item, state)) moves.push({ pieceId: item.id, fromX: item.x, fromY: item.y, x: move.x, y: move.y, capture: at(state, move.x, move.y)?.id ?? null });
  }
  return moves;
}

export function applyMove(state, move) {
  const moving = state.find(p => p.id === move.pieceId);
  if (!moving) return null;
  const legal = validMoves(moving, state).some(candidate => candidate.x === move.x && candidate.y === move.y);
  if (!legal) return null;
  const captured = at(state, move.x, move.y) ?? null;
  return { pieces: simulateMove(state, move.pieceId, move.x, move.y), captured, move: { pieceId: moving.id, fromX: moving.x, fromY: moving.y, x: move.x, y: move.y } };
}

export function gameStatus(turn, state) {
  const general = state.find(p => p.side === turn && p.type === "general");
  if (!general) return { over: true, winner: enemy(turn), reason: "主将被擒" };
  const moves = allLegalMoves(turn, state);
  if (!moves.length) return { over: true, winner: enemy(turn), reason: isInCheck(turn, state) ? "将死" : "困毙" };
  return { over: false, check: isInCheck(turn, state), legalCount: moves.length };
}

export function positionKey(turn, state) {
  return `${turn}|${[...state].sort((a,b) => a.id.localeCompare(b.id)).map(p => `${p.id}:${p.x}${p.y}`).join("|")}`;
}
