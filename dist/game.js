const RED = "red";
const BLACK = "black";

const NAMES = {
  red: { general: "帅", advisor: "仕", elephant: "相", horse: "马", rook: "车", cannon: "炮", pawn: "兵" },
  black: { general: "将", advisor: "士", elephant: "象", horse: "馬", rook: "車", cannon: "砲", pawn: "卒" }
};

const ROLE_NAMES = { general: "主将", advisor: "近卫", elephant: "灵相", horse: "夜骑", rook: "战车", cannon: "炮姬", pawn: "先锋" };

const boardEl = document.querySelector("#board");
const piecesEl = document.querySelector("#pieces");
const targetsEl = document.querySelector("#targets");
const statusText = document.querySelector("#statusText");
const turnText = document.querySelector("#turnText");
const turnPill = document.querySelector("#turnPill");
const moveCounter = document.querySelector("#moveCounter");
const battle = document.querySelector("#battle");
const battleText = document.querySelector("#battleText");
const gameOver = document.querySelector("#gameOver");
const winnerText = document.querySelector("#winnerText");
const toastEl = document.querySelector("#toast");

let pieces = [];
let turn = RED;
let selectedId = null;
let legalTargets = [];
let history = [];
let captured = { red: [], black: [] };
let moveNumber = 1;
let fastMode = false;
let locked = false;
let lastMove = null;
let toastTimer;

function createPiece(side, type, x, y, id) {
  return { side, type, x, y, id: `${side}-${type}-${id}` };
}

function initialPieces() {
  const result = [];
  const back = ["rook", "horse", "elephant", "advisor", "general", "advisor", "elephant", "horse", "rook"];
  back.forEach((type, x) => result.push(createPiece(BLACK, type, x, 0, x)));
  result.push(createPiece(BLACK, "cannon", 1, 2, 0), createPiece(BLACK, "cannon", 7, 2, 1));
  [0, 2, 4, 6, 8].forEach((x, i) => result.push(createPiece(BLACK, "pawn", x, 3, i)));
  back.forEach((type, x) => result.push(createPiece(RED, type, x, 9, x)));
  result.push(createPiece(RED, "cannon", 1, 7, 0), createPiece(RED, "cannon", 7, 7, 1));
  [0, 2, 4, 6, 8].forEach((x, i) => result.push(createPiece(RED, "pawn", x, 6, i)));
  return result;
}

function at(x, y, state = pieces) {
  return state.find(piece => piece.x === x && piece.y === y);
}

function inBounds(x, y) { return x >= 0 && x <= 8 && y >= 0 && y <= 9; }
function enemy(side) { return side === RED ? BLACK : RED; }
function inPalace(side, x, y) { return x >= 3 && x <= 5 && (side === RED ? y >= 7 && y <= 9 : y >= 0 && y <= 2); }

function rayMoves(piece, state, cannon = false) {
  const moves = [];
  for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
    let x = piece.x + dx;
    let y = piece.y + dy;
    let screen = false;
    while (inBounds(x, y)) {
      const occupant = at(x, y, state);
      if (!cannon) {
        if (!occupant) moves.push({ x, y });
        else { if (occupant.side !== piece.side) moves.push({ x, y }); break; }
      } else if (!screen) {
        if (!occupant) moves.push({ x, y });
        else screen = true;
      } else if (occupant) {
        if (occupant.side !== piece.side) moves.push({ x, y });
        break;
      }
      x += dx; y += dy;
    }
  }
  return moves;
}

function pseudoMoves(piece, state = pieces) {
  const result = [];
  const add = (x, y) => {
    if (!inBounds(x, y)) return;
    const occupant = at(x, y, state);
    if (!occupant || occupant.side !== piece.side) result.push({ x, y });
  };

  if (piece.type === "rook") return rayMoves(piece, state);
  if (piece.type === "cannon") return rayMoves(piece, state, true);

  if (piece.type === "horse") {
    const candidates = [
      [1, 2, 0, 1], [-1, 2, 0, 1], [1, -2, 0, -1], [-1, -2, 0, -1],
      [2, 1, 1, 0], [2, -1, 1, 0], [-2, 1, -1, 0], [-2, -1, -1, 0]
    ];
    for (const [dx, dy, lx, ly] of candidates) if (!at(piece.x + lx, piece.y + ly, state)) add(piece.x + dx, piece.y + dy);
  }

  if (piece.type === "elephant") {
    for (const [dx, dy] of [[2, 2], [-2, 2], [2, -2], [-2, -2]]) {
      const x = piece.x + dx, y = piece.y + dy;
      const ownSide = piece.side === RED ? y >= 5 : y <= 4;
      if (ownSide && !at(piece.x + dx / 2, piece.y + dy / 2, state)) add(x, y);
    }
  }

  if (piece.type === "advisor") {
    for (const [dx, dy] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) {
      const x = piece.x + dx, y = piece.y + dy;
      if (inPalace(piece.side, x, y)) add(x, y);
    }
  }

  if (piece.type === "general") {
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const x = piece.x + dx, y = piece.y + dy;
      if (inPalace(piece.side, x, y)) add(x, y);
    }
    const opposing = state.find(p => p.type === "general" && p.side !== piece.side);
    if (opposing && opposing.x === piece.x) {
      const min = Math.min(piece.y, opposing.y) + 1;
      const max = Math.max(piece.y, opposing.y);
      if (!state.some(p => p.x === piece.x && p.y >= min && p.y < max)) add(opposing.x, opposing.y);
    }
  }

  if (piece.type === "pawn") {
    const direction = piece.side === RED ? -1 : 1;
    add(piece.x, piece.y + direction);
    const crossed = piece.side === RED ? piece.y <= 4 : piece.y >= 5;
    if (crossed) { add(piece.x - 1, piece.y); add(piece.x + 1, piece.y); }
  }

  return result;
}

function simulateMove(state, id, x, y) {
  return state.filter(piece => piece.id === id || piece.x !== x || piece.y !== y).map(piece => piece.id === id ? { ...piece, x, y } : { ...piece });
}

function isInCheck(side, state = pieces) {
  const general = state.find(piece => piece.side === side && piece.type === "general");
  if (!general) return true;
  return state.some(piece => piece.side !== side && pseudoMoves(piece, state).some(move => move.x === general.x && move.y === general.y));
}

function validMoves(piece, state = pieces) {
  return pseudoMoves(piece, state).filter(move => !isInCheck(piece.side, simulateMove(state, piece.id, move.x, move.y)));
}

function hasAnyLegalMove(side) {
  return pieces.some(piece => piece.side === side && validMoves(piece).length > 0);
}

function snapshot() {
  return { pieces: pieces.map(p => ({ ...p })), turn, captured: { red: [...captured.red], black: [...captured.black] }, moveNumber, lastMove: lastMove ? { ...lastMove } : null };
}

function resetGame() {
  pieces = initialPieces();
  turn = RED;
  selectedId = null;
  legalTargets = [];
  history = [];
  captured = { red: [], black: [] };
  moveNumber = 1;
  locked = false;
  lastMove = null;
  gameOver.hidden = true;
  render();
}

function selectPiece(piece) {
  if (locked || piece.side !== turn) {
    if (!locked) toast(piece.side === RED ? "现在轮到玄青方" : "现在轮到朱砂方");
    return;
  }
  selectedId = selectedId === piece.id ? null : piece.id;
  legalTargets = selectedId ? validMoves(piece) : [];
  statusText.textContent = selectedId ? `${ROLE_NAMES[piece.type]} · 请选择落子位置` : `${turn === RED ? "朱砂" : "玄青"}方行棋`;
  render();
}

async function moveSelected(x, y) {
  if (locked || !selectedId || !legalTargets.some(move => move.x === x && move.y === y)) return;
  const moving = pieces.find(piece => piece.id === selectedId);
  const victim = at(x, y);
  history.push(snapshot());
  lastMove = { fromX: moving.x, fromY: moving.y, x, y, id: moving.id };

  if (victim) {
    captured[victim.side].push(NAMES[victim.side][victim.type]);
    if (!fastMode) {
      locked = true;
      battleText.textContent = `${NAMES[moving.side][moving.type]}破阵 · ${NAMES[victim.side][victim.type]}退场`;
      battle.classList.add("show");
      battle.setAttribute("aria-hidden", "false");
      await new Promise(resolve => setTimeout(resolve, 900));
      battle.classList.remove("show");
      battle.setAttribute("aria-hidden", "true");
      locked = false;
    }
  }

  pieces = simulateMove(pieces, moving.id, x, y);
  selectedId = null;
  legalTargets = [];
  turn = enemy(turn);
  if (turn === RED) moveNumber++;

  const generalAlive = pieces.some(piece => piece.side === turn && piece.type === "general");
  const check = generalAlive && isInCheck(turn);
  render();

  if (!generalAlive || !hasAnyLegalMove(turn)) {
    const winner = enemy(turn);
    winnerText.textContent = `${winner === RED ? "朱砂" : "玄青"}获胜`;
    gameOver.hidden = false;
    statusText.textContent = "棋局已定";
    locked = true;
  } else if (check) {
    statusText.textContent = "将军！请即刻应对";
    toast("将军！");
  }
}

function render() {
  piecesEl.replaceChildren();
  for (const piece of pieces) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `piece ${piece.side}`;
    if (piece.id === selectedId) button.classList.add("selected");
    if (lastMove?.id === piece.id) button.classList.add("last-move");
    button.style.setProperty("--x", piece.x);
    button.style.setProperty("--y", piece.y);
    button.textContent = NAMES[piece.side][piece.type];
    button.setAttribute("role", "gridcell");
    button.setAttribute("aria-label", `${piece.side === RED ? "红方" : "黑方"}${NAMES[piece.side][piece.type]}，${piece.x + 1}列${piece.y + 1}行`);
    button.addEventListener("click", event => { event.stopPropagation(); selectPiece(piece); });
    piecesEl.append(button);
  }

  targetsEl.replaceChildren();
  for (const move of legalTargets) {
    const target = document.createElement("button");
    target.type = "button";
    target.className = `target${at(move.x, move.y) ? " capture" : ""}`;
    target.style.setProperty("--x", move.x);
    target.style.setProperty("--y", move.y);
    target.setAttribute("aria-label", `落子到${move.x + 1}列${move.y + 1}行`);
    target.addEventListener("click", event => { event.stopPropagation(); moveSelected(move.x, move.y); });
    targetsEl.append(target);
  }

  turnText.textContent = `${turn === RED ? "红方" : "黑方"}行棋`;
  turnPill.classList.toggle("black", turn === BLACK);
  moveCounter.textContent = `第 ${moveNumber} 回合`;
  document.querySelector("#redCaptured").textContent = captured.red.join(" · ") || "—";
  document.querySelector("#blackCaptured").textContent = captured.black.join(" · ") || "—";
  if (!selectedId && !locked) statusText.textContent = `${turn === RED ? "朱砂" : "玄青"}方行棋`;
}

function boardCoordinates(event) {
  const rect = boardEl.getBoundingClientRect();
  const x = Math.round(((event.clientX - rect.left) / rect.width) * 8);
  const y = Math.round(((event.clientY - rect.top) / rect.height) * 9);
  return { x: Math.max(0, Math.min(8, x)), y: Math.max(0, Math.min(9, y)) };
}

function toast(message) {
  clearTimeout(toastTimer);
  toastEl.textContent = message;
  toastEl.classList.add("show");
  toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1700);
}

boardEl.addEventListener("click", event => {
  if (!selectedId) return;
  const { x, y } = boardCoordinates(event);
  const occupant = at(x, y);
  if (occupant?.side === turn) selectPiece(occupant);
  else moveSelected(x, y);
});

document.querySelector("#restartBtn").addEventListener("click", resetGame);
document.querySelector("#playAgainBtn").addEventListener("click", resetGame);
document.querySelector("#undoBtn").addEventListener("click", () => {
  const previous = history.pop();
  if (!previous || locked) return toast("当前没有可悔的棋步");
  ({ pieces, turn, captured, moveNumber, lastMove } = previous);
  selectedId = null;
  legalTargets = [];
  gameOver.hidden = true;
  render();
  toast("已退回上一步");
});

document.querySelector("#fastToggle").addEventListener("click", event => {
  fastMode = !fastMode;
  event.currentTarget.textContent = `演出：${fastMode ? "关" : "开"}`;
  event.currentTarget.setAttribute("aria-pressed", String(fastMode));
});

window.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    selectedId = null;
    legalTargets = [];
    render();
  }
});

resetGame();
