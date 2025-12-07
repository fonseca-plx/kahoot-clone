// API Types
export type {
  User,
  CreateUserRequest,
  UserResponse,
  Question,
  Quiz,
  CreateQuestionRequest,
  CreateQuizRequest,
  QuizResponse,
  Room,
  CreateRoomRequest,
  RoomResponse,
  ApiError,
  HateoasLink,
  HateoasLinks,
  ApiResponse,
  WebSocketEventInfo,
  WebSocketInfo
} from "./api";

// Game Types
export type {
  Player,
  GameQuestion,
  AnswerPayload,
  AnswerResult,
  LeaderboardEntry,
  ServerToClientEvents,
  ClientToServerEvents,
  GameStatus,
  GameState
} from "./game";