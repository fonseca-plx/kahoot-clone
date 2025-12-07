/**
 * Formatar código de sala (uppercase, sem espaços)
 */
export function formatRoomCode(code: string): string {
  return code.toUpperCase().trim();
}

/**
 * Formatar tempo em MM:SS
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Formatar pontos com separador de milhares
 */
export function formatPoints(points: number): string {
  return points.toLocaleString("pt-BR");
}

/**
 * Formatar data para exibição
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(d);
}

/**
 * Truncar texto com reticências
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
}

/**
 * Gerar nome aleatório para jogador
 */
export function generateRandomName(): string {
  const adjectives = ["Rápido", "Esperto", "Astuto", "Brilhante", "Veloz"];
  const nouns = ["Gato", "Leão", "Tigre", "Falcão", "Tubarão"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 1000);
  return `${adj}${noun}${num}`;
}