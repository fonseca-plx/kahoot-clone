export const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "http://localhost:3000/api";
export const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:4000";

export const STORAGE_KEYS = {
  LOCAL_USER: "local-user-storage",
  QUIZ_DRAFTS: "quiz-drafts"
} as const;

export const GAME_CONSTANTS = {
  MIN_PLAYERS: 1,
  MAX_PLAYERS: 50,
  ROOM_CODE_LENGTH: 6,
  MIN_QUESTIONS: 1,
  MAX_QUESTIONS: 50,
  MIN_CHOICES: 2,
  MAX_CHOICES: 6,
  MIN_TIME_LIMIT: 5,
  MAX_TIME_LIMIT: 120,
  DEFAULT_TIME_LIMIT: 10
} as const;

export const UI_CONSTANTS = {
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 3000,
  CONFETTI_DURATION: 5000
} as const;

export const ROUTES = {
  HOME: "/",
  JOIN: "/join",
  LOBBY: (code: string) => `/lobby/${code}`,
  PLAY: (code: string) => `/play/${code}`,
  RESULTS: (code: string) => `/results/${code}`,
  QUIZ_NEW: "/quiz/new",
  QUIZ_VIEW: (id: string) => `/quiz/${id}`,
  QUIZ_ROOM: (id: string) => `/quiz/${id}/room`,
  DASHBOARD: "/dashboard"
} as const;