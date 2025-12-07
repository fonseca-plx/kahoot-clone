import { io, Socket } from "socket.io-client";
import type { ServerToClientEvents, ClientToServerEvents } from "./events";

export type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export function createWebSocketConnection(url: string): GameSocket {
  const socket: GameSocket = io(url, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000
  });

  // Logs de debug
  socket.on("connect", () => {
    console.log("[WS] Connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("[WS] Disconnected:", reason);
  });

  socket.on("error", (error) => {
    console.error("[WS] Error:", error);
  });

  return socket;
}

export function disconnectWebSocket(socket: GameSocket | null) {
  if (socket && socket.connected) {
    socket.disconnect();
    console.log("[WS] Manually disconnected");
  }
}