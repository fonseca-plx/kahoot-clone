import { create } from "zustand";
import type { GameSocket } from "@/lib/ws";
import { createWebSocketConnection, disconnectWebSocket } from "@/lib/ws";

interface SocketState {
  socket: GameSocket | null;
  isConnected: boolean;
  
  connect: (url: string) => void;
  disconnect: () => void;
  setConnected: (connected: boolean) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  
  connect: (url) => {
    const currentSocket = get().socket;
    
    // Se já existe socket conectado, não criar novo
    if (currentSocket?.connected) {
      console.log("[SocketStore] Already connected");
      return;
    }
    
    // Desconectar socket anterior se existir
    if (currentSocket) {
      disconnectWebSocket(currentSocket);
    }
    
    // Criar nova conexão
    const newSocket = createWebSocketConnection(url);
    
    newSocket.on("connect", () => {
      set({ isConnected: true });
    });
    
    newSocket.on("disconnect", () => {
      set({ isConnected: false });
    });
    
    set({ socket: newSocket });
  },
  
  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      disconnectWebSocket(socket);
      set({ socket: null, isConnected: false });
    }
  },
  
  setConnected: (connected) => set({ isConnected: connected })
}));