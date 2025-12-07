export { createWebSocketConnection, disconnectWebSocket } from "./client";
export type { GameSocket } from "./client";
export type {
  ServerToClientEvents,
  ClientToServerEvents,
  Player,
  GameQuestion,
  AnswerPayload,
  AnswerResult,
  LeaderboardEntry
} from "./events";