import { RED, BLACK, NAMES, applyMove, at, checkingPieces, createInitialPieces, enemy, gameStatus, validMoves } from "./shared-rules.js";

const ROLE_NAMES = { general: "主将", advisor: "近卫", elephant: "灵相", horse: "夜骑", rook: "战车", cannon: "炮姬", pawn: "先锋" };
const $ = selector => document.querySelector(selector);
const boardEl = $("#board"), piecesEl = $("#pieces"), targetsEl = $("#targets");
const statusText = $("#statusText"), turnText = $("#turnText"), turnPill = $("#turnPill"), moveCounter = $("#moveCounter");
const battle = $("#battle"), battleText = $("#battleText"), gameOver = $("#gameOver"), winnerText = $("#winnerText"), toastEl = $("#toast");
const mateReveal = $("#mateReveal"), mateDetail = $("#mateDetail");
const modeSelect = $("#modeSelect"), difficultyModal = $("#difficultyModal"), matchmaking = $("#matchmaking");

class ChibiAudio {
  constructor() { this.context = null; this.enabled = sessionStorage.getItem("qijuSound") !== "off"; }
  ready() {
    if (!this.enabled) return null;
    this.context ||= new AudioContext();
    if (this.context.state === "suspended") this.context.resume();
    return this.context;
  }
  tone(frequency, offset = 0, duration = .1, type = "sine", volume = .045, endFrequency = frequency) {
    const ctx = this.ready(); if (!ctx) return;
    const start = ctx.currentTime + offset, oscillator = ctx.createOscillator(), gain = ctx.createGain();
    oscillator.type = type; oscillator.frequency.setValueAtTime(frequency, start); oscillator.frequency.exponentialRampToValueAtTime(Math.max(30, endFrequency), start + duration);
    gain.gain.setValueAtTime(.0001, start); gain.gain.exponentialRampToValueAtTime(volume, start + .012); gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    oscillator.connect(gain).connect(ctx.destination); oscillator.start(start); oscillator.stop(start + duration + .02);
  }
  noise(offset = 0, duration = .16, volume = .035, cutoff = 850) {
    const ctx = this.ready(); if (!ctx) return;
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate), data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain(), start = ctx.currentTime + offset;
    source.buffer = buffer; filter.type = "lowpass"; filter.frequency.value = cutoff; gain.gain.setValueAtTime(volume, start); gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    source.connect(filter).connect(gain).connect(ctx.destination); source.start(start);
  }
  play(name) {
    if (!this.enabled) return;
    if (name === "select") { this.tone(720, 0, .07, "sine", .025, 940); this.tone(1080, .045, .08, "sine", .018, 1320); }
    if (name === "move") { this.noise(0, .07, .022, 1200); this.tone(210, 0, .09, "triangle", .035, 145); }
    if (name === "lock") { this.tone(560, 0, .07, "square", .018, 760); this.tone(980, .065, .09, "sine", .025, 1280); }
    if (name === "capture") { this.noise(0, .2, .05, 720); this.tone(150, 0, .24, "sawtooth", .055, 62); this.tone(760, .08, .18, "triangle", .028, 1180); }
    if (name === "cannon") { this.tone(520, 0, .22, "sawtooth", .024, 118); this.noise(.08, .42, .075, 460); this.tone(92, .08, .45, "triangle", .08, 38); this.tone(1240, .23, .22, "sine", .03, 1840); }
    if (name === "start") [523,659,784,1047].forEach((note, i) => this.tone(note, i * .065, .16, "sine", .025));
    if (name === "victory") [659,784,988,1318].forEach((note, i) => this.tone(note, i * .11, .28, "triangle", .035));
    if (name === "defeat") [392,330,262,196].forEach((note, i) => this.tone(note, i * .12, .24, "triangle", .025));
  }
  toggle() { this.enabled = !this.enabled; sessionStorage.setItem("qijuSound", this.enabled ? "on" : "off"); if (this.enabled) this.play("start"); return this.enabled; }
}

const audio = new ChibiAudio();

let pieces = createInitialPieces(), turn = RED, selectedId = null, legalTargets = [], history = [];
let captured = { red: [], black: [] }, moveNumber = 1, fastMode = false, locked = true, lastMove = null, toastTimer;
let mode = null, difficulty = null, playerSide = RED, aiWorker = null;
let aiRequestVersion = 0;
let socket = null, onlineSequence = 0, onlineStatus = "idle", roomId = null, reconnecting = false;
let clocks = { red: 600000, black: 600000 };
let checkedSide = null, checkingIds = new Set(), endingVersion = 0;
let moveAnimation = Promise.resolve();

function snapshot() { return { pieces: pieces.map(p => ({ ...p })), turn, captured: { red: [...captured.red], black: [...captured.black] }, moveNumber, lastMove: lastMove ? { ...lastMove } : null }; }
function resetBoard() {
  pieces = createInitialPieces(); turn = RED; selectedId = null; legalTargets = []; history = []; captured = { red: [], black: [] };
  moveNumber = 1; lastMove = null; clocks = { red: 600000, black: 600000 }; checkedSide = null; checkingIds = new Set(); endingVersion++;
  mateReveal.hidden = true; gameOver.hidden = true; render();
}
function formatClock(ms) { const value = Math.max(0, Math.ceil(ms / 1000)); return `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`; }
function canControl(piece) {
  if (locked || piece.side !== turn) return false;
  if (mode === "ai") return piece.side === playerSide;
  return mode === "online" && onlineStatus === "playing" && piece.side === playerSide;
}
function selectPiece(piece) {
  if (!canControl(piece)) { if (!locked && piece.side !== turn) toast(piece.side === RED ? "现在轮到玄青方" : "现在轮到朱砂方"); return; }
  selectedId = selectedId === piece.id ? null : piece.id; legalTargets = selectedId ? validMoves(piece, pieces) : [];
  if (selectedId) audio.play(piece.type === "cannon" && legalTargets.some(move => at(pieces, move.x, move.y)) ? "lock" : "select");
  statusText.textContent = selectedId ? `${ROLE_NAMES[piece.type]} · 请选择落子位置` : `${turn === RED ? "朱砂" : "玄青"}方行棋`; render();
}
function playBattle(moving, victim) {
  if (!victim) return Promise.resolve();
  const cannonStrike = moving.type === "cannon";
  audio.play(cannonStrike ? "cannon" : "capture");
  if (fastMode) return Promise.resolve();
  battleText.textContent = `${NAMES[moving.side][moving.type]}破阵 · ${NAMES[victim.side][victim.type]}退场`;
  $("#battleKicker").textContent = cannonStrike ? "CANNON BARRAGE · 炮火锁定" : "BREAK THE FORMATION · 一击破阵";
  $("#battleDetail").textContent = `${moving.side === RED ? "朱砂" : "玄青"}出击，${victim.side === RED ? "朱砂" : "玄青"}${ROLE_NAMES[victim.type]}折损`;
  battle.classList.toggle("battle--red", moving.side === RED); battle.classList.toggle("battle--black", moving.side === BLACK); battle.classList.toggle("battle--cannon", cannonStrike);
  battle.classList.add("show"); battle.setAttribute("aria-hidden", "false");
  return new Promise(resolve => setTimeout(() => { battle.classList.remove("show"); battle.setAttribute("aria-hidden", "true"); resolve(); }, 1180));
}
async function applyLocalMove(move, byAI = false) {
  const moving = pieces.find(p => p.id === move.pieceId), result = applyMove(pieces, move);
  if (!moving || !result) return false;
  history.push(snapshot()); if (result.captured) captured[result.captured.side].push(NAMES[result.captured.side][result.captured.type]);
  locked = true; await playBattle(moving, result.captured);
  if (!result.captured) audio.play("move");
  pieces = result.pieces; lastMove = result.move; turn = enemy(turn); if (turn === RED) moveNumber++;
  selectedId = null; legalTargets = []; const status = gameStatus(turn, pieces); render();
  if (status.over) { await endGame(status.winner, status.reason); return true; }
  if (status.check) { statusText.textContent = "将军！请即刻应对"; toast("将军！"); }
  locked = mode === "ai" && turn !== playerSide; if (mode === "ai" && turn !== playerSide && !byAI) requestAI(); return true;
}
function cancelAI() { aiRequestVersion++; aiWorker?.terminate(); aiWorker = null; }
function requestAI() {
  locked = true; statusText.textContent = difficulty === "nightmare" ? "噩梦棋灵正在深度推演…" : "棋灵正在思考…";
  const version = ++aiRequestVersion;
  aiWorker ||= new Worker("./ai-worker.js", { type: "module" });
  aiWorker.onmessage = async event => { if (version !== aiRequestVersion || mode !== "ai" || turn === playerSide) return; if (event.data.move) await applyLocalMove(event.data.move, true); locked = !gameOver.hidden; render(); if (difficulty === "nightmare" && event.data.depth) toast(`噩梦棋灵 · 深度 ${event.data.depth} · ${Math.round((event.data.nodes || 0) / 1000)}k 节点`); };
  aiWorker.onerror = () => { if (version !== aiRequestVersion) return; aiWorker?.terminate(); aiWorker = null; locked = false; statusText.textContent = "棋灵暂时走神了，请重开一局"; };
  aiWorker.postMessage({ pieces, side: turn, difficulty });
}
async function moveSelected(x, y) {
  if (!selectedId || !legalTargets.some(move => move.x === x && move.y === y)) return;
  const move = { pieceId: selectedId, x, y }; selectedId = null; legalTargets = [];
  if (mode === "online") { locked = true; render(); statusText.textContent = "等待服务器确认…"; send({ type: "move.submit", roomId, sequence: onlineSequence, ...move }); }
  else await applyLocalMove(move);
}
async function endGame(winner, reason = "棋局已定") {
  locked = true;
  const version = ++endingVersion, loser = winner ? enemy(winner) : null;
  if (reason === "将死" && loser) {
    const attackers = checkingPieces(loser, pieces);
    checkedSide = loser; checkingIds = new Set(attackers.map(piece => piece.id)); render();
    const attackNames = attackers.map(piece => NAMES[piece.side][piece.type]).join("、") || "绝杀棋子";
    mateDetail.textContent = `${winner === RED ? "朱砂" : "玄青"}${attackNames}将军，对方主将已无合法着法`;
    mateReveal.hidden = false; statusText.textContent = "绝杀！主将无路可退"; audio.play("lock");
    await new Promise(resolve => setTimeout(resolve, fastMode ? 650 : 1750));
    if (version !== endingVersion) return;
    mateReveal.hidden = true;
  }
  const explanation = reason === "将死" && loser
    ? `${reason} · ${loser === RED ? "朱砂帅" : "玄青将"}被将军且无任何合法着法`
    : reason;
  winnerText.textContent = winner ? `${winner === RED ? "朱砂" : "玄青"}获胜` : "和棋";
  gameOver.querySelector("p").textContent = explanation; gameOver.hidden = false; statusText.textContent = "棋局已定";
  $("#playAgainBtn").textContent = mode === "online" ? "请求再战" : "再来一局";
  audio.play(winner && winner === playerSide ? "victory" : "defeat");
}
function render() {
  piecesEl.replaceChildren();
  for (const piece of pieces) {
    const button = document.createElement("button"); button.type = "button"; button.className = `piece ${piece.side}`;
    if (piece.id === selectedId) button.classList.add("selected"); if (lastMove?.pieceId === piece.id) button.classList.add("last-move");
    if (piece.type === "general" && piece.side === checkedSide) button.classList.add("checkmated");
    if (checkingIds.has(piece.id)) button.classList.add("mate-attacker");
    button.style.setProperty("--x", piece.x); button.style.setProperty("--y", piece.y); button.textContent = NAMES[piece.side][piece.type];
    button.setAttribute("role", "gridcell"); button.setAttribute("aria-label", `${piece.side === RED ? "红方" : "黑方"}${NAMES[piece.side][piece.type]}，${piece.x + 1}列${piece.y + 1}行`);
    button.addEventListener("click", event => {
      event.stopPropagation();
      if (selectedId && piece.side !== turn && legalTargets.some(move => move.x === piece.x && move.y === piece.y)) moveSelected(piece.x, piece.y);
      else selectPiece(piece);
    }); piecesEl.append(button);
  }
  targetsEl.replaceChildren();
  const selectedPiece = pieces.find(piece => piece.id === selectedId);
  if (selectedPiece?.type === "cannon") for (const move of legalTargets) if (at(pieces, move.x, move.y)) {
    const line = document.createElement("i"); line.className = `cannon-line ${move.x === selectedPiece.x ? "vertical" : "horizontal"}`; line.setAttribute("aria-hidden", "true");
    if (move.x === selectedPiece.x) { line.style.left = `${move.x * 12.5}%`; line.style.top = `${Math.min(move.y, selectedPiece.y) * 11.111}%`; line.style.height = `${Math.abs(move.y - selectedPiece.y) * 11.111}%`; }
    else { line.style.left = `${Math.min(move.x, selectedPiece.x) * 12.5}%`; line.style.top = `${move.y * 11.111}%`; line.style.width = `${Math.abs(move.x - selectedPiece.x) * 12.5}%`; }
    targetsEl.append(line);
  }
  for (const move of legalTargets) {
    const target = document.createElement("button"); target.type = "button"; target.className = `target${at(pieces, move.x, move.y) ? " capture" : ""}`;
    if (selectedPiece?.type === "cannon" && at(pieces, move.x, move.y)) target.classList.add("cannon-capture");
    target.style.setProperty("--x", move.x); target.style.setProperty("--y", move.y); target.setAttribute("aria-label", `落子到${move.x + 1}列${move.y + 1}行`);
    target.addEventListener("click", event => { event.stopPropagation(); moveSelected(move.x, move.y); }); targetsEl.append(target);
  }
  turnText.textContent = `${turn === RED ? "红方" : "黑方"}行棋`; turnPill.classList.toggle("black", turn === BLACK); moveCounter.textContent = `第 ${moveNumber} 回合`;
  $("#redCaptured").textContent = captured.red.join(" · ") || "—"; $("#blackCaptured").textContent = captured.black.join(" · ") || "—";
  $("#redClock").textContent = mode === "online" ? formatClock(clocks.red) : "--:--"; $("#blackClock").textContent = mode === "online" ? formatClock(clocks.black) : "--:--";
  if (!selectedId && !locked && onlineStatus !== "countdown") statusText.textContent = `${turn === RED ? "朱砂" : "玄青"}方行棋`;
}
function startAI(level) {
  cancelAI();
  mode = "ai"; difficulty = level; playerSide = RED; locked = false; onlineStatus = "idle"; document.body.dataset.playerSide = RED;
  modeSelect.hidden = true; difficultyModal.hidden = true; $("#modeLabel").textContent = `人机对战 · ${level === "nightmare" ? "噩梦" : "简单"}`;
  $("#connectionState").hidden = true; $("#restartBtn").textContent = "重开一局"; $("#undoBtn").hidden = false; resetBoard(); statusText.textContent = "你执朱砂，先行";
  audio.play("start");
}
function guestIdentity() { let id = sessionStorage.getItem("qijuGuestId"); if (!id) { id = `guest-${crypto.randomUUID()}`; sessionStorage.setItem("qijuGuestId", id); } return id; }
function send(payload) { if (socket?.readyState === WebSocket.OPEN) socket.send(JSON.stringify(payload)); }
function startOnline() {
  mode = "online"; locked = true; onlineStatus = "connecting"; matchmaking.hidden = false; $("#matchTitle").textContent = "正在连接棋台"; $("#matchDetail").textContent = "连接本地对战服务器…";
  const scheme = location.protocol === "https:" ? "wss" : "ws"; socket = new WebSocket(`${scheme}://${location.host}/ws`);
  socket.onopen = () => send({ type: "hello", guestId: guestIdentity(), reconnectToken: sessionStorage.getItem("qijuReconnectToken") });
  socket.onmessage = event => handleServer(JSON.parse(event.data));
  socket.onclose = () => { if (mode !== "online") return; onlineStatus = "disconnected"; locked = true; $("#connectionState").textContent = "连接中断"; statusText.textContent = "正在尝试重新连接…"; if (!reconnecting) { reconnecting = true; setTimeout(() => { reconnecting = false; if (mode === "online") startOnline(); }, 1600); } };
  socket.onerror = () => { $("#matchTitle").textContent = "无法连接"; $("#matchDetail").textContent = "请确认本地对战服务器正在运行"; };
}
async function handleServer(message) {
  if (message.type === "hello.ack") { sessionStorage.setItem("qijuReconnectToken", message.reconnectToken); if (!message.resumed) { send({ type: "queue.join" }); $("#matchTitle").textContent = "正在寻找对手"; $("#matchDetail").textContent = "已进入随机匹配队列"; } }
  if (message.type === "queue.joined") $("#matchDetail").textContent = `当前排队位置：${message.position}`;
  if (message.type === "match.found") { applyOnlineState(message); onlineStatus = "countdown"; $("#matchTitle").textContent = "匹配成功"; $("#matchDetail").textContent = `你执${playerSide === RED ? "朱砂" : "玄青"}，棋局即将开始`; audio.play("start"); }
  if (message.type === "room.started") { applyOnlineState(message); onlineStatus = "playing"; locked = turn !== playerSide; matchmaking.hidden = true; modeSelect.hidden = true; gameOver.hidden = true; statusText.textContent = turn === playerSide ? "轮到你落子" : "等待对手落子"; render(); }
  if (message.type === "move.accepted") { const moving = pieces.find(p => p.id === message.move?.pieceId); moveAnimation = moving && message.capturedPiece ? playBattle(moving, message.capturedPiece) : Promise.resolve(audio.play("move")); applyOnlineState(message); onlineStatus = "playing"; locked = turn !== playerSide; statusText.textContent = message.check ? "将军！" : (turn === playerSide ? "轮到你落子" : "等待对手落子"); render(); }
  if (message.type === "clock") { clocks = message.clocks; render(); }
  if (message.type === "room.state") { applyOnlineState(message); matchmaking.hidden = message.status === "playing"; modeSelect.hidden = message.status === "playing"; onlineStatus = message.status; locked = turn !== playerSide || message.status !== "playing"; render(); }
  if (message.type === "move.rejected") { locked = turn !== playerSide || onlineStatus !== "playing"; toast(message.message); render(); }
  if (message.type === "opponent.disconnected") { statusText.textContent = "对手断线，保留席位 60 秒"; toast("对手正在重连"); }
  if (message.type === "opponent.reconnected") { statusText.textContent = turn === playerSide ? "轮到你落子" : "等待对手落子"; toast("对手已重连"); }
  if (message.type === "room.finished") { applyOnlineState(message); onlineStatus = "finished"; await moveAnimation; await endGame(message.winner, message.reason); }
  if (message.type === "rematch.waiting") toast(message.accepted?.length === 1 ? "等待对手同意再战" : "双方已同意");
}
function applyOnlineState(message) {
  pieces = message.pieces; turn = message.turn; captured = message.captured; clocks = message.clocks; lastMove = message.lastMove;
  onlineSequence = message.sequence; roomId = message.roomId; playerSide = message.youSide; moveNumber = Math.floor(message.sequence / 2) + 1; selectedId = null; legalTargets = [];
  document.body.dataset.playerSide = playerSide; $("#modeLabel").textContent = `联网对战 · 你执${playerSide === RED ? "朱砂" : "玄青"}`;
  $("#connectionState").hidden = false; $("#connectionState").textContent = "在线"; $("#restartBtn").textContent = "认输"; $("#undoBtn").hidden = true;
}
function leaveToMenu() {
  if (mode === "online" && onlineStatus === "playing") send({ type: "resign" });
  cancelAI(); if (socket) { socket.onclose = null; socket.close(); socket = null; }
  mode = null; difficulty = null; locked = true; onlineStatus = "idle"; roomId = null; delete document.body.dataset.playerSide;
  gameOver.hidden = true; matchmaking.hidden = true; difficultyModal.hidden = true; modeSelect.hidden = false; $("#modeLabel").textContent = "Q版国风象棋"; resetBoard();
}
function toast(message) { clearTimeout(toastTimer); toastEl.textContent = message; toastEl.classList.add("show"); toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1700); }

boardEl.addEventListener("click", event => {
  if (!selectedId) return; const rect = boardEl.getBoundingClientRect();
  let x = Math.round(((event.clientX - rect.left) / rect.width) * 8), y = Math.round(((event.clientY - rect.top) / rect.height) * 9);
  if (playerSide === BLACK && mode === "online") { x = 8 - x; y = 9 - y; }
  const occupant = at(pieces, x, y); if (occupant?.side === turn) selectPiece(occupant); else moveSelected(x, y);
});
$("#aiModeBtn").addEventListener("click", () => difficultyModal.hidden = false); $("#difficultyBack").addEventListener("click", () => difficultyModal.hidden = true);
document.querySelectorAll("[data-difficulty]").forEach(button => button.addEventListener("click", () => startAI(button.dataset.difficulty)));
$("#onlineModeBtn").addEventListener("click", startOnline); $("#cancelMatchBtn").addEventListener("click", () => { send({ type: "queue.leave" }); leaveToMenu(); });
$("#menuBtn").addEventListener("click", leaveToMenu); $("#gameOverMenuBtn").addEventListener("click", leaveToMenu);
$("#restartBtn").addEventListener("click", () => mode === "online" ? send({ type: "resign" }) : startAI(difficulty));
$("#playAgainBtn").addEventListener("click", () => { if (mode === "online") { gameOver.hidden = true; send({ type: "rematch" }); toast("已发出再战邀请"); } else startAI(difficulty); });
$("#undoBtn").addEventListener("click", () => {
  if (mode !== "ai" || locked) return; let previous = null; for (let i = 0; i < 2; i++) previous = history.pop() || previous;
  if (!previous) return toast("当前没有可悔的棋步"); ({ pieces, turn, captured, moveNumber, lastMove } = previous); selectedId = null; legalTargets = []; locked = false; gameOver.hidden = true; render(); toast("已退回上一回合");
});
$("#fastToggle").addEventListener("click", event => { fastMode = !fastMode; event.currentTarget.textContent = `演出：${fastMode ? "关" : "开"}`; event.currentTarget.setAttribute("aria-pressed", String(fastMode)); });
const soundToggle = $("#soundToggle");
function renderSoundToggle() { soundToggle.innerHTML = `<span aria-hidden="true">${audio.enabled ? "♪" : "×"}</span> 音效：${audio.enabled ? "开" : "关"}`; soundToggle.setAttribute("aria-pressed", String(audio.enabled)); }
soundToggle.addEventListener("click", () => { audio.toggle(); renderSoundToggle(); });
window.addEventListener("keydown", event => { if (event.key === "Escape") { selectedId = null; legalTargets = []; render(); } });

renderSoundToggle();
resetBoard();
