export const SIZE = 15;
export const EMPTY = 0;
export const BLACK = 1;
export const WHITE = -1;

export function createBoard() { return new Int8Array(SIZE * SIZE); }
export function indexOf(x, y) { return y * SIZE + x; }
export function pointOf(index) { return { x: index % SIZE, y: Math.floor(index / SIZE) }; }
export function isInside(x, y) { return x >= 0 && x < SIZE && y >= 0 && y < SIZE; }

export function placeStone(board, index, side) {
  if (index < 0 || index >= board.length || board[index] !== EMPTY) return null;
  const next = new Int8Array(board); next[index] = side; return next;
}

export function winningLine(board, index) {
  if (index == null || board[index] === EMPTY) return null;
  const side = board[index], { x, y } = pointOf(index);
  for (const [dx, dy] of [[1,0],[0,1],[1,1],[1,-1]]) {
    const run = [{ x, y, index }];
    for (const sign of [-1, 1]) {
      let nx = x + dx * sign, ny = y + dy * sign;
      while (isInside(nx, ny) && board[indexOf(nx, ny)] === side) {
        run[sign < 0 ? "unshift" : "push"]({ x: nx, y: ny, index: indexOf(nx, ny) }); nx += dx * sign; ny += dy * sign;
      }
    }
    if (run.length >= 5) return run;
  }
  return null;
}

export function isDraw(board) { return !board.includes(EMPTY); }

export function nearbyMoves(board, radius = 2) {
  if (!board.some(Boolean)) return [indexOf(7, 7)];
  const found = new Set();
  board.forEach((side, index) => {
    if (!side) return; const { x, y } = pointOf(index);
    for (let dy = -radius; dy <= radius; dy++) for (let dx = -radius; dx <= radius; dx++) {
      const nx = x + dx, ny = y + dy;
      if (isInside(nx, ny) && board[indexOf(nx, ny)] === EMPTY) found.add(indexOf(nx, ny));
    }
  });
  return [...found];
}
