// ==================== PLAYER TYPES ====================
export interface Player {
  playerId: string;
  displayName: string;
  score: number;
}

// ==================== GAME QUESTION TYPES ====================
export interface GameQuestion {
  questionId: string;
  text: string;
  choices: string[];
  timeLimitSeconds: number;
}

// ==================== ANSWER TYPES ====================
export interface AnswerPayload {
  roomId: string;
  questionId: string;
  selectedIndex: number;
  timeMs: number;
}

export interface AnswerResult {
  correct: boolean;
  points: number;
  correctIndex: number;
}

// ==================== LEADERBOARD TYPES ====================
export interface LeaderboardEntry {
  playerId: string;
  displayName: string;
  score: number;
}

// ==================== SOCKET.IO EVENT TYPES ====================
export interface ServerToClientEvents {
  "room:joined": (data: { roomId: string; code: string; playerId: string; isHost?: boolean }) => void;
  "room:player_list": (data: { players: Player[] }) => void;
  "game:starting": (data: { message: string }) => void;
  "game:question": (data: GameQuestion) => void;
  "game:answer_result": (data: AnswerResult) => void;
  "game:leaderboard": (data: { leaderboard: LeaderboardEntry[] }) => void;
  "game:question_end": (data: { questionId: string; correctIndex: number }) => void;
  "game:finished": (data: { leaderboard: LeaderboardEntry[] }) => void;
  error: (data: { message: string }) => void;
}

export interface ClientToServerEvents {
  "room:join": (data: { code?: string; roomId?: string; displayName: string }) => void;
  "host:start": (data: { roomId: string }) => void;
  "game:answer": (data: AnswerPayload) => void;
}

// ==================== GAME STATE TYPES ====================
export type GameStatus = "waiting" | "playing" | "question_end" | "finished";

export interface GameState {
  roomId: string;
  roomCode: string;
  playerId?: string;
  currentQuestion: GameQuestion | null;
  questionStartTime: number | null;
  players: Player[];
  leaderboard: LeaderboardEntry[];
  status: GameStatus;
  isHost: boolean;
}