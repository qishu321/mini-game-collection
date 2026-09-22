import { BLACK, EMPTY, SIZE, WHITE, createBoard, indexOf, isDraw, placeStone, pointOf, winningLine } from "./shared-rules.js";

const $ = selector => document.querySelector(selector);
const boardEl = $("#board"), stonesEl = $("#stones"), winLineEl = $("#winLine"), cursorEl = $("#cursor");
const statusText = $("#statusText"), turnStone = $("#turnStone"), result = $("#result"), modeSelect = $("#modeSelect"), toastEl = $("#toast");

let board = createBoard(), turn = BLACK, lastMove = null, win = null, history = [], mode = null, difficulty = null;
let locked = true, gameEnded = false, requestId = 0, worker = null, cursor = { x: 7, y: 7 }, toastTimer;
let soundEnabled = sessionStorage.getItem("gomokuSound") !== "off", audioContext = null;

function sideName(side) { return side === BLACK ? "黑子" : "白子"; }
function tone(freq = 420, duration = .12, volume = .035) {
  if (!soundEnabled) return;
  audioContext ||= new AudioContext(); if (audioContext.state === "suspended") audioContext.resume();
  const oscillator = audioContext.createOscillator(), gain = audioContext.createGain(), now = audioContext.currentTime;
  oscillator.type = "sine"; oscillator.frequency.setValueAtTime(freq, now); oscillator.frequency.exponentialRampToValueAtTime(freq * .72, now + duration);
  gain.gain.setValueAtTime(volume, now); gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
  oscillator.connect(gain).connect(audioContext.destination); oscillator.start(now); oscillator.stop(now + duration);
}
function playWin() { [523,659,784,1047].forEach((note, index) => setTimeout(() => tone(note,.2,.025), index * 85)); }

function render() {
  stonesEl.replaceChildren();
  board.forEach((side, index) => {
    if (side === EMPTY) return;
    const { x, y } = pointOf(index), stone = document.createElement("button");
    stone.type = "button"; stone.className = `stone ${side === BLACK ? "black" : "white"}`;
    if (index === lastMove) stone.classList.add("last"); if (win?.some(point => point.index === index)) stone.classList.add("win");
    stone.style.setProperty("--x", x); stone.style.setProperty("--y", y); stone.setAttribute("aria-label", `${sideName(side)}，第${x + 1}列第${y + 1}行`);
    stonesEl.append(stone);
  });
  turnStone.className = `mini-stone ${turn === BLACK ? "black" : "white"}`;
  $("#moveCount").textContent = `第 ${history.length} 手`;
  $(".player--black").classList.toggle("active", turn === BLACK && !gameEnded);
  $(".player--white").classList.toggle("active", turn === WHITE && !gameEnded);
  winLineEl.classList.toggle("show", Boolean(win));
  const line = winLineEl.querySelector("line");
  if (win) {
    const first = win[0], last = win[win.length - 1];
    line.setAttribute("x1", first.x * 100 / 14); line.setAttribute("y1", first.y * 100 / 14);
    line.setAttribute("x2", last.x * 100 / 14); line.setAttribute("y2", last.y * 100 / 14);
  }
}

function reset() {
  requestId++; board = createBoard(); turn = BLACK; lastMove = null; win = null; history = []; gameEnded = false; locked = false;
  result.hidden = true; winLineEl.classList.remove("show"); statusText.textContent = mode === "ai" ? "你执黑子，请落子" : "黑子先行"; render();
}

function startGame(nextMode, level = null) {
  mode = nextMode; difficulty = level; modeSelect.hidden = true;
  $("#modeLabel").textContent = mode === "ai" ? `人机对弈 · ${level === "nightmare" ? "噩梦棋灵" : "轻松棋灵"}` : "本地双人 · 自由规则";
  $("#whiteName").textContent = mode === "ai" ? "云端棋灵" : "云子"; $("#whiteRole").textContent = mode === "ai" ? "棋灵 · 后手" : "后手玩家";
  $("#blackName").textContent = mode === "ai" ? "你 · 墨团" : "墨团"; $("#blackRole").textContent = mode === "ai" ? "玩家 · 先手" : "先手玩家";
  reset(); tone(660,.12,.025);
}

async function place(index, fromAI = false) {
  if (locked || gameEnded || board[index] !== EMPTY) return;
  if (mode === "ai" && turn === WHITE && !fromAI) return;
  history.push({ board: new Int8Array(board), turn, lastMove });
  board = placeStone(board, index, turn); lastMove = index; tone(turn === BLACK ? 240 : 360,.09,.04);
  win = winningLine(board, index);
  if (win) { gameEnded = true; locked = true; render(); statusText.textContent = `${sideName(turn)}五子连珠`; await finish(turn); return; }
  if (isDraw(board)) { gameEnded = true; locked = true; render(); await finish(EMPTY); return; }
  turn = -turn; render();
  if (mode === "ai" && turn === WHITE) requestAI(); else { locked = false; statusText.textContent = `${sideName(turn)}落子`; }
}

function requestAI() {
  locked = true; statusText.textContent = difficulty === "nightmare" ? "棋灵正在推演星路…" : "棋灵正在想…";
  const id = ++requestId; worker ||= new Worker("./ai-worker.js", { type: "module" });
  worker.onmessage = event => {
    if (event.data.requestId !== requestId || mode !== "ai" || gameEnded) return;
    locked = false; place(event.data.move, true);
    if (difficulty === "nightmare") toast(`棋灵推演 ${event.data.elapsed}ms`);
  };
  worker.onerror = () => { worker?.terminate(); worker = null; locked = false; statusText.textContent = "棋灵走神了，请重开一局"; };
  worker.postMessage({ board: [...board], side: WHITE, difficulty, requestId: id });
}

async function finish(winner) {
  if (winner) { statusText.textContent = `${sideName(winner)}连成五子！`; playWin(); await new Promise(resolve => setTimeout(resolve, 1050)); }
  $("#resultSeal").textContent = winner ? "胜" : "和"; $("#resultTitle").textContent = winner ? `${sideName(winner)}获胜` : "和棋";
  $("#resultDetail").textContent = winner ? "五子连珠，落子成章" : "星盘落满，难分高下"; result.hidden = false;
}

function undo() {
  if (!mode || !history.length) return toast("现在还没有可悔的棋");
  requestId++; const steps = mode === "ai" ? Math.min(2, history.length) : 1, snapshot = history[history.length - steps];
  history.splice(history.length - steps, steps); board = new Int8Array(snapshot.board); turn = snapshot.turn; lastMove = snapshot.lastMove; win = null; gameEnded = false; locked = false;
  result.hidden = true; winLineEl.classList.remove("show"); statusText.textContent = `${sideName(turn)}重新落子`; render(); toast(mode === "ai" ? "已退回上一回合" : "已退回一手");
}

function eventPoint(event) {
  const rect = boardEl.getBoundingClientRect();
  return { x: Math.max(0, Math.min(14, Math.round((event.clientX - rect.left) / rect.width * 14))), y: Math.max(0, Math.min(14, Math.round((event.clientY - rect.top) / rect.height * 14))) };
}
function showCursor(x, y) { cursor = { x, y }; cursorEl.style.setProperty("--x", x); cursorEl.style.setProperty("--y", y); cursorEl.hidden = false; }
function toast(text) { clearTimeout(toastTimer); toastEl.textContent = text; toastEl.classList.add("show"); toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1500); }

boardEl.addEventListener("pointermove", event => { const point = eventPoint(event); showCursor(point.x, point.y); });
boardEl.addEventListener("pointerleave", () => cursorEl.hidden = true);
boardEl.addEventListener("click", event => { const { x, y } = eventPoint(event); place(indexOf(x, y)); });
boardEl.addEventListener("keydown", event => {
  const moves = { ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1] };
  if (moves[event.key]) { event.preventDefault(); cursor.x = Math.max(0,Math.min(14,cursor.x + moves[event.key][0])); cursor.y = Math.max(0,Math.min(14,cursor.y + moves[event.key][1])); showCursor(cursor.x,cursor.y); }
  if (event.key === "Enter" || event.key === " ") { event.preventDefault(); place(indexOf(cursor.x,cursor.y)); }
});
document.querySelectorAll("[data-mode]").forEach(button => button.addEventListener("click", () => startGame(button.dataset.mode, button.dataset.level)));
$("#undoBtn").addEventListener("click", undo); $("#restartBtn").addEventListener("click", () => mode && reset()); $("#againBtn").addEventListener("click", reset);
$("#menuBtn").addEventListener("click", () => { requestId++; result.hidden = true; modeSelect.hidden = false; locked = true; });
$("#soundBtn").addEventListener("click", event => { soundEnabled = !soundEnabled; sessionStorage.setItem("gomokuSound", soundEnabled ? "on" : "off"); event.currentTarget.textContent = soundEnabled ? "♪" : "×"; if (soundEnabled) tone(660); });
render();
