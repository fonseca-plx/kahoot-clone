import { create } from "zustand";
import type { Room } from "@/lib/types";

interface RoomState {
  currentRoom: Room | null;
  roomCode: string | null;
  playerId: string | null;
  isHost: boolean;
  wsUrl: string | null;
  
  setRoom: (room: Room, wsUrl?: string) => void;
  setPlayerId: (playerId: string) => void;
  setIsHost: (isHost: boolean) => void;
  clearRoom: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  currentRoom: null,
  roomCode: null,
  playerId: null,
  isHost: false,
  wsUrl: null,
  
  setRoom: (room, wsUrl) => 
    set({ 
      currentRoom: room, 
      roomCode: room.code,
      wsUrl: wsUrl || null
    }),
  
  setPlayerId: (playerId) => set({ playerId }),
  
  setIsHost: (isHost) => set({ isHost }),
  
  clearRoom: () => 
    set({ 
      currentRoom: null, 
      roomCode: null, 
      playerId: null, 
      isHost: false,
      wsUrl: null
    })
}));