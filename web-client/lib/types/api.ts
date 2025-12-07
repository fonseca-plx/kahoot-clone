// ==================== BASE TYPES ====================
export interface HateoasLink {
  href: string;
  method?: string;
  description?: string;
}

export interface HateoasLinks {
  self?: HateoasLink;
  [key: string]: any;
}

export interface ApiResponse<T> {
  [key: string]: T;
  _links: HateoasLinks;
}

// ==================== USER TYPES ====================
export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
}

export interface UserResponse extends ApiResponse<User> {
  user: User;
  _links: {
    self: HateoasLink;
    quizzes?: HateoasLink;
  };
}

// ==================== QUIZ TYPES ====================
export interface Question {
  id: string;
  quizId: string;
  text: string;
  choices: string[];
  correctIndex: number;
  timeLimitSeconds: number;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  authorId: string;
  questions: Question[];
  createdAt: string;
}

export interface CreateQuestionRequest {
  text: string;
  choices: string[];
  correctIndex: number;
  timeLimitSeconds?: number;
}

export interface CreateQuizRequest {
  title: string;
  description?: string;
  authorId: string;
  questions: CreateQuestionRequest[];
}

export interface QuizResponse extends ApiResponse<Quiz> {
  quiz: Quiz;
  _links: {
    self: HateoasLink;
    createRoom?: HateoasLink & { payload?: any };
  };
}

// ==================== ROOM TYPES ====================
export interface Room {
  id: string;
  code: string;
  quizId: string;
  title?: string;
  status: "waiting" | "running" | "finished";
  createdAt: string;
  quiz?: Quiz;
}

export interface CreateRoomRequest {
  quizId: string;
  title?: string;
}

export interface WebSocketEventInfo {
  event: string;
  payload: Record<string, any>;
  description?: string;
}

export interface WebSocketInfo {
  url: string;
  events: {
    join?: WebSocketEventInfo;
    start?: WebSocketEventInfo;
  };
}

export interface RoomResponse extends ApiResponse<Room> {
  room: Room;
  _links: {
    self: HateoasLink;
    byCode?: HateoasLink;
    websocket?: WebSocketInfo;
    quiz?: HateoasLink;
  };
}

// ==================== ERROR TYPES ====================
export interface ApiError {
  error: string;
  statusCode?: number;
}