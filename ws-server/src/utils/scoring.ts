export function computePoints(isCorrect: boolean, timeMs: number, timeLimitMs: number): number {
  if (!isCorrect) return 0;

  const base = 1000;
  const speedFactor = Math.max(0, (timeLimitMs - timeMs) / timeLimitMs);
  const bonus = Math.round(base * speedFactor);

  return base + bonus;
}
