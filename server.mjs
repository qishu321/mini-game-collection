import http from "node:http";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { RED, BLACK, NAMES, applyMove, createInitialPieces, enemy, gameStatus, positionKey } from "./dist/games/xiangqi/shared-rules.js";

const hostIndex = process.argv.indexOf("--host");
const HOST = process.env.QIJU_HOST || (hostIndex >= 0 ? process.argv[hostIndex + 1] : null) || "127.0.0.1";
const PORT = Number(process.env.QIJU_PORT || 4173);
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "dist");
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".png": "image/png", ".svg": "image/svg+xml" };
const GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

const clients = new Set();
const sessions = new Map();
const rooms = new Map();
let queue = [];
let roomCounter = 1;

class Peer {
  constructor(socket) {
    this.socket = socket;
    this.buffer = Buffer.alloc(0);
    this.guestId = null;
    this.token = null;
    this.roomId = null;
    this.side = null;
    this.alive = true;
    socket.on("data", data => this.read(data));
    socket.on("close", () => disconnect(this));
    socket.on("error", () => disconnect(this));
  }
  send(payload) {
    if (!this.socket || this.socket.destroyed) return;
    const body = Buffer.from(JSON.stringify(payload));
    let head;
    if (body.length < 126) head = Buffer.from([0x81, body.length]);
    else if (body.length < 65536) { head = Buffer.alloc(4); head[0] = 0x81; head[1] = 126; head.writeUInt16BE(body.length, 2); }
    else { head = Buffer.alloc(10); head[0] = 0x81; head[1] = 127; head.writeBigUInt64BE(BigInt(body.length), 2); }
    this.socket.write(Buffer.concat([head, body]));
  }
  read(data) {
    this.buffer = Buffer.concat([this.buffer, data]);
    while (this.buffer.length >= 2) {
      const first = this.buffer[0], second = this.buffer[1];
      const opcode = first & 0x0f;
      let length = second & 0x7f, offset = 2;
      if (length === 126) { if (this.buffer.length < 4) return; length = this.buffer.readUInt16BE(2); offset = 4; }
      else if (length === 127) { if (this.buffer.length < 10) return; length = Number(this.buffer.readBigUInt64BE(2)); offset = 10; }
      const masked = Boolean(second & 0x80);
      const maskBytes = masked ? 4 : 0;
      if (this.buffer.length < offset + maskBytes + length) return;
      if (opcode === 0x8) { this.socket.end(); return; }
      if (opcode === 0x9) { this.socket.write(Buffer.from([0x8a, 0x00])); this.buffer = this.buffer.subarray(offset + maskBytes + length); continue; }
      const mask = masked ? this.buffer.subarray(offset, offset + 4) : null;
      const payload = Buffer.from(this.buffer.subarray(offset + maskBytes, offset + maskBytes + length));
      if (mask) for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i % 4];
      this.buffer = this.buffer.subarray(offset + maskBytes + length);
      if (opcode === 0x1) {
        try { handle(this, JSON.parse(payload.toString("utf8"))); }
        catch { this.send({ type: "error", message: "消息格式错误" }); }
      }
    }
  }
}

function roomState(room, peer, type = "room.state", extras = {}) {
  return {
    type,
    roomId: room.id,
    youSide: peer.side,
    pieces: room.pieces,
    turn: room.turn,
    sequence: room.sequence,
    status: room.status,
    clocks: room.clocks,
    captured: room.captured,
    lastMove: room.lastMove,
    winner: room.winner,
    reason: room.reason,
    disconnected: room.disconnected,
    ...extras
  };
}

function broadcastRoom(room, type = "room.state", extras = {}) {
  for (const peer of Object.values(room.players)) peer?.send(roomState(room, peer, type, extras));
}

function newRoom(a, b) {
  const redFirst = Math.random() < 0.5;
  const red = redFirst ? a : b, black = redFirst ? b : a;
  const id = `room-${Date.now().toString(36)}-${roomCounter++}`;
  const pieces = createInitialPieces();
  const room = {
    id, players: { red, black }, pieces, turn: RED, sequence: 0, status: "countdown",
    clocks: { red: 600000, black: 600000 }, captured: { red: [], black: [] }, lastMove: null,
    lastTick: Date.now(), winner: null, reason: null, disconnected: null, repetition: new Map([[positionKey(RED, pieces), 1]]), rematch: new Set()
  };
  for (const [side, peer] of Object.entries(room.players)) {
    peer.roomId = id; peer.side = side;
    const session = sessions.get(peer.token); if (session) { session.roomId = id; session.side = side; }
  }
  rooms.set(id, room);
  broadcastRoom(room, "match.found", { countdownMs: 2500 });
  setTimeout(() => {
    if (room.status !== "countdown") return;
    room.status = "playing"; room.lastTick = Date.now();
    broadcastRoom(room, "room.started");
  }, 2500);
}

function joinQueue(peer) {
  if (!peer.guestId || peer.roomId) return;
  queue = queue.filter(item => item !== peer && item.socket && !item.socket.destroyed);
  if (!queue.includes(peer)) queue.push(peer);
  peer.send({ type: "queue.joined", position: queue.length });
  if (queue.length >= 2) newRoom(queue.shift(), queue.shift());
}

function tickRoom(room) {
  if (room.status !== "playing") return;
  const now = Date.now();
  room.clocks[room.turn] = Math.max(0, room.clocks[room.turn] - (now - room.lastTick));
  room.lastTick = now;
  if (room.clocks[room.turn] <= 0) finishRoom(room, enemy(room.turn), "时间耗尽");
}

function finishRoom(room, winner, reason) {
  room.status = "finished"; room.winner = winner; room.reason = reason; room.lastTick = Date.now();
  broadcastRoom(room, "room.finished");
}

function handleMove(peer, message) {
  const room = rooms.get(peer.roomId);
  if (!room || room.status !== "playing") return peer.send({ type: "move.rejected", message: "棋局尚未开始" });
  tickRoom(room);
  if (room.status !== "playing") return;
  if (peer.side !== room.turn) return peer.send({ type: "move.rejected", message: "还没轮到你" });
  if (message.sequence !== room.sequence) return peer.send(roomState(room, peer, "room.state", { message: "棋局状态已同步" }));
  const moving = room.pieces.find(p => p.id === message.pieceId);
  if (!moving || moving.side !== peer.side) return peer.send({ type: "move.rejected", message: "无效棋子" });
  const result = applyMove(room.pieces, { pieceId: message.pieceId, x: Number(message.x), y: Number(message.y) });
  if (!result) return peer.send({ type: "move.rejected", message: "这一步不符合棋规" });
  room.pieces = result.pieces;
  room.lastMove = result.move;
  if (result.captured) room.captured[result.captured.side].push(NAMES[result.captured.side][result.captured.type]);
  room.clocks[peer.side] += 5000;
  room.turn = enemy(room.turn);
  room.sequence++;
  room.lastTick = Date.now();
  const pos = positionKey(room.turn, room.pieces);
  room.repetition.set(pos, (room.repetition.get(pos) || 0) + 1);
  const status = gameStatus(room.turn, room.pieces);
  broadcastRoom(room, "move.accepted", { move: result.move, capturedPiece: result.captured, check: status.check });
  if (room.repetition.get(pos) >= 3) finishRoom(room, null, "三次重复局面");
  else if (status.over) finishRoom(room, status.winner, status.reason);
}

function reconnect(peer, message) {
  const token = String(message.reconnectToken || "");
  const guestId = String(message.guestId || "guest").slice(0, 80);
  let session = token && sessions.get(token);
  if (session) {
    if (session.peer && session.peer !== peer && session.peer.socket && !session.peer.socket.destroyed) session.peer.socket.end();
    peer.token = token; peer.guestId = session.guestId; peer.roomId = session.roomId; peer.side = session.side; session.peer = peer;
    peer.send({ type: "hello.ack", guestId: peer.guestId, reconnectToken: token, resumed: Boolean(session.roomId) });
    const room = rooms.get(peer.roomId);
    if (room) {
      room.players[peer.side] = peer; room.disconnected = null; clearTimeout(session.forfeitTimer);
      peer.send(roomState(room, peer));
      broadcastRoom(room, "opponent.reconnected");
    }
    return;
  }
  const newToken = crypto.randomBytes(24).toString("base64url");
  peer.token = newToken; peer.guestId = guestId;
  sessions.set(newToken, { guestId, peer, roomId: null, side: null, forfeitTimer: null });
  peer.send({ type: "hello.ack", guestId, reconnectToken: newToken, resumed: false });
}

function handle(peer, message) {
  switch (message.type) {
    case "hello": reconnect(peer, message); break;
    case "queue.join": joinQueue(peer); break;
    case "queue.leave": queue = queue.filter(item => item !== peer); peer.send({ type: "queue.left" }); break;
    case "move.submit": handleMove(peer, message); break;
    case "resign": {
      const room = rooms.get(peer.roomId); if (room?.status === "playing") finishRoom(room, enemy(peer.side), "对手认输"); break;
    }
    case "rematch": {
      const room = rooms.get(peer.roomId); if (!room || room.status !== "finished") break;
      room.rematch.add(peer.side); broadcastRoom(room, "rematch.waiting", { accepted: [...room.rematch] });
      if (room.rematch.size === 2) {
        const formerRed = room.players.red, formerBlack = room.players.black; rooms.delete(room.id); newRoom(formerRed, formerBlack);
      }
      break;
    }
  }
}

function disconnect(peer) {
  if (!clients.has(peer)) return;
  clients.delete(peer); queue = queue.filter(item => item !== peer);
  const session = sessions.get(peer.token); if (session) session.peer = null;
  const room = rooms.get(peer.roomId);
  if (room && room.status === "playing") {
    room.disconnected = peer.side; broadcastRoom(room, "opponent.disconnected", { graceMs: 60000 });
    if (session) session.forfeitTimer = setTimeout(() => {
      if (room.status === "playing" && room.disconnected === peer.side) finishRoom(room, enemy(peer.side), "断线超时");
    }, 60000);
  }
}

const server = http.createServer((request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  if (url.pathname === "/health") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ ok: true, queued: queue.length, rooms: rooms.size })); return;
  }
  const relative = url.pathname === "/" ? "index.html" : decodeURIComponent(url.pathname.slice(1)) + (url.pathname.endsWith("/") ? "index.html" : "");
  const file = path.resolve(ROOT, relative);
  if (!file.startsWith(ROOT + path.sep) && file !== path.join(ROOT, "index.html")) { response.writeHead(403); response.end("Forbidden"); return; }
  fs.readFile(file, (error, data) => {
    if (error) { response.writeHead(404); response.end("Not found"); return; }
    response.writeHead(200, { "content-type": MIME[path.extname(file)] || "application/octet-stream", "cache-control": "no-cache" });
    response.end(data);
  });
});

server.on("upgrade", (request, socket) => {
  if (new URL(request.url, "http://localhost").pathname !== "/ws" || !request.headers["sec-websocket-key"]) { socket.destroy(); return; }
  const accept = crypto.createHash("sha1").update(request.headers["sec-websocket-key"] + GUID).digest("base64");
  socket.write("HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: " + accept + "\r\n\r\n");
  const peer = new Peer(socket); clients.add(peer);
});

setInterval(() => {
  for (const room of rooms.values()) {
    if (room.status !== "playing") continue;
    tickRoom(room);
    if (room.status === "playing") broadcastRoom(room, "clock");
  }
}, 1000).unref();

server.listen(PORT, HOST, () => {
  console.log(`游艺小馆已启动：http://${HOST}:${PORT}`);
  console.log("打开两个浏览器标签页即可测试随机匹配。");
});
