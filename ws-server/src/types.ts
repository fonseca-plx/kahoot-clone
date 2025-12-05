export type Player = {
  socketId: string;
  playerId: string;
  displayName: string;
  score: number;
  answeredCurrent?: boolean;
  lastAnswerTime?: number;
};

export type RoomState = {
  roomId: string;
  code: string;
  quizId: string;
  questionIndex: number;
  status: "waiting" | "running" | "finished";
  players: Map<string, Player>;
  currentQuestion?: any;
  currentQuestionStart?: number;
  questionTimer?: NodeJS.Timeout | null;
};
