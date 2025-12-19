import WebSocket from 'ws';

/**
 * Tipos de mensagens do protocolo WebSocket
 * Client → Server: mensagens enviadas pelo cliente
 * Server → Client: mensagens enviadas pelo servidor
 */
export enum MessageType {
  // Client → Server
  JOIN_ROOM = 'JOIN_ROOM',
  START_GAME = 'START_GAME',
  ANSWER_QUESTION = 'ANSWER_QUESTION',
  
  // Server → Client
  ROOM_JOINED = 'ROOM_JOINED',
  PLAYER_LIST = 'PLAYER_LIST',
  HOST_CHANGED = 'HOST_CHANGED',
  GAME_STARTING = 'GAME_STARTING',
  GAME_QUESTION = 'GAME_QUESTION',
  ANSWER_RESULT = 'ANSWER_RESULT',
  LEADERBOARD = 'LEADERBOARD',
  QUESTION_END = 'QUESTION_END',
  GAME_FINISHED = 'GAME_FINISHED',
  ERROR = 'ERROR',
  
  // Controle de conexão
  WELCOME = 'WELCOME',
  PING = 'PING',
  PONG = 'PONG',
}

/**
 * Estrutura padrão de mensagem WebSocket
 */
export interface WSMessage<T = any> {
  type: MessageType | string;
  data: T;
  timestamp?: number;
}

/**
 * Informações de cada cliente conectado
 */
export interface ClientInfo {
  id: string;
  ws: WebSocket;
  roomId?: string | null;
  playerId?: string;
  displayName?: string;
  isAlive: boolean;
  connectedAt: number;
}

/**
 * Payloads específicos para cada tipo de mensagem
 */

// Client → Server payloads
export interface JoinRoomPayload {
  code?: string;
  roomId?: string;
  displayName: string;
}

export interface StartGamePayload {
  roomId: string;
}

export interface AnswerQuestionPayload {
  roomId: string;
  questionId: string;
  selectedIndex: number;
  timeMs?: number;
}

// Server → Client payloads
export interface RoomJoinedPayload {
  roomId: string;
  code: string;
  playerId: string;
  isHost: boolean;
}

export interface PlayerListPayload {
  players: Array<{
    playerId: string;
    displayName: string;
    score: number;
  }>;
}

export interface HostChangedPayload {
  newHostPlayerId: string;
  newHostDisplayName: string;
  isHost: boolean;
}

export interface GameStartingPayload {
  message: string;
}

export interface GameQuestionPayload {
  questionId: string;
  text: string;
  choices: string[];
  timeLimitSeconds: number;
}

export interface AnswerResultPayload {
  correct: boolean;
  points: number;
  correctIndex: number;
}

export interface LeaderboardPayload {
  leaderboard: Array<{
    playerId: string;
    displayName: string;
    score: number;
  }>;
}

export interface QuestionEndPayload {
  questionId: string;
  correctIndex: number;
}

export interface GameFinishedPayload {
  leaderboard: Array<{
    playerId: string;
    displayName: string;
    score: number;
  }>;
}

export interface ErrorPayload {
  message: string;
  code?: string | undefined;
}

export interface WelcomePayload {
  clientId: string;
  serverTime: number;
}

/**
 * Valida se uma mensagem tem a estrutura correta
 */
export function isValidMessage(message: any): message is WSMessage {
  return (
    message &&
    typeof message === 'object' &&
    'type' in message &&
    'data' in message &&
    typeof message.type === 'string'
  );
}

/**
 * Cria uma mensagem de erro padronizada
 */
export function createErrorMessage(message: string, code?: string): WSMessage<ErrorPayload> {
  return {
    type: MessageType.ERROR,
    data: { message, code },
    timestamp: Date.now(),
  };
}

/**
 * Cria uma mensagem com o formato padrão
 */
export function createMessage<T = any>(type: MessageType | string, data: T): WSMessage<T> {
  return {
    type,
    data,
    timestamp: Date.now(),
  };
}

/**
 * Serializa uma mensagem para envio via WebSocket
 */
export function serializeMessage(message: WSMessage): string {
  return JSON.stringify(message);
}

/**
 * Deserializa uma mensagem recebida via WebSocket
 */
export function deserializeMessage(data: string): WSMessage | null {
  try {
    const message = JSON.parse(data);
    return isValidMessage(message) ? message : null;
  } catch (error) {
    return null;
  }
}