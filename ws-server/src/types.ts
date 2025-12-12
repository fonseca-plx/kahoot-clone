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
  quiz?: any;
  questionIndex: number;
  status: "waiting" | "running" | "finished";
  hostSocketId: string | null;
  players: Map<string, Player>;
  currentQuestion?: any;
  currentQuestionStart?: number;
  questionTimer?: NodeJS.Timeout | null;
  rabbitMQQueue?: string;
};
