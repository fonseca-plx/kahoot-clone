// Re-export apenas os tipos de eventos WebSocket
export type {
  ServerToClientEvents,
  ClientToServerEvents
} from "@/lib/types/game";

// Outros tipos (Player, GameQuestion, etc) devem ser importados diretamente de @/lib/types/game