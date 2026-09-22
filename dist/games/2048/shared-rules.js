export const SIZE = 4;

export function emptyBoard() { return Array(SIZE * SIZE).fill(0); }

export function mergeLine(line) {
  const values = line.filter(Boolean), result = [], merged = [];
  let score = 0;
  for (let i = 0; i < values.length; i++) {
    if (values[i] === values[i + 1]) {
      const value = values[i] * 2; result.push(value); merged.push(result.length - 1); score += value; i++;
    } else result.push(values[i]);
  }
  while (result.length < SIZE) result.push(0);
  return { line: result, score, merged };
}

export function moveBoard(source, direction) {
  const board = [...source], next = emptyBoard(); let score = 0, changed = false, mergedCells = [];
  for (let outer = 0; outer < SIZE; outer++) {
    const indexes = [];
    for (let inner = 0; inner < SIZE; inner++) {
      if (direction === "left") indexes.push(outer * SIZE + inner);
      if (direction === "right") indexes.push(outer * SIZE + (SIZE - 1 - inner));
      if (direction === "up") indexes.push(inner * SIZE + outer);
      if (direction === "down") indexes.push((SIZE - 1 - inner) * SIZE + outer);
    }
    const merged = mergeLine(indexes.map(index => board[index])); score += merged.score;
    indexes.forEach((index, position) => { next[index] = merged.line[position]; if (merged.merged.includes(position)) mergedCells.push(index); });
  }
  changed = next.some((value, index) => value !== board[index]);
  return { board: next, score, changed, mergedCells };
}

export function spawnTile(source, random = Math.random) {
  const board = [...source], empty = board.map((value, index) => value ? -1 : index).filter(index => index >= 0);
  if (!empty.length) return { board, index: null, value: null };
  const index = empty[Math.floor(random() * empty.length)], value = random() < .9 ? 2 : 4; board[index] = value;
  return { board, index, value };
}

export function canMove(board) {
  if (board.includes(0)) return true;
  return ["left","right","up","down"].some(direction => moveBoard(board, direction).changed);
}

export function maxTile(board) { return Math.max(...board); }
