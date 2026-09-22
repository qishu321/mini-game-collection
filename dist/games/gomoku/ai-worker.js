import { chooseMove } from "./gomoku-ai.js";

self.onmessage = event => {
  const { board, side, difficulty, requestId } = event.data;
  const started = performance.now(), move = chooseMove(board, side, difficulty);
  self.postMessage({ move, requestId, elapsed: Math.round(performance.now() - started) });
};
