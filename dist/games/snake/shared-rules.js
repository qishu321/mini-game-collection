export function samePoint(a, b) { return a.x === b.x && a.y === b.y; }

export function nextHead(head, direction) { return { x: head.x + direction.x, y: head.y + direction.y }; }

export function stepSnake(snake, direction, food, width, height) {
  const head = nextHead(snake[0], direction), ate = samePoint(head, food);
  const bodyToCheck = ate ? snake : snake.slice(0, -1);
  const collided = head.x < 0 || head.x >= width || head.y < 0 || head.y >= height || bodyToCheck.some(part => samePoint(part, head));
  if (collided) return { snake, ate: false, collided: true };
  const next = [head, ...snake]; if (!ate) next.pop();
  return { snake: next, ate, collided: false };
}

export function placeFood(snake, width, height, random = Math.random) {
  const free = [];
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) if (!snake.some(part => part.x === x && part.y === y)) free.push({ x, y });
  return free.length ? free[Math.floor(random() * free.length)] : null;
}
