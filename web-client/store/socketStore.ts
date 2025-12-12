import { create } from "zustand";
import type { GameSocket } from "@/lib/ws";
import { createWebSocketConnection, disconnectWebSocket } from "@/lib/ws";

interface SocketState {
  socket: GameSocket | null;
  isConnected: boolean;
  connectionError: string | null;
  
  connect: (url: string) => void;
  disconnect: () => void;
  setConnected: (connected: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  connectionError: null,
  
  connect: (url) => {
    console.log("[SocketStore] Attempting to connect to:", url);
    
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
    
    // Limpar erro anterior
    set({ connectionError: null });
    
    // Criar nova conexão
    const newSocket = createWebSocketConnection(url);
    
    newSocket.on("connect", () => {
      console.log("[SocketStore] Connected successfully");
      set({ isConnected: true, connectionError: null });
    });
    
    newSocket.on("disconnect", (reason) => {
      console.log("[SocketStore] Disconnected:", reason);
      set({ isConnected: false });
    });
    
    newSocket.on("connect_error", (error) => {
      console.error("[SocketStore] Connection error:", error);
      set({ 
        connectionError: error.message,
        isConnected: false 
      });
    });
    
    set({ socket: newSocket });
  },
  
  disconnect: () => {
    const socket = get().socket;
    if (socket) {
      disconnectWebSocket(socket);
      set({ socket: null, isConnected: false, connectionError: null });
    }
  },
  
  setConnected: (connected) => set({ isConnected: connected }),
  
  setError: (error) => set({ connectionError: error })
}));