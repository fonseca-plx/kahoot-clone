import { create } from "zustand";
import type { Room, RoomResponse } from "@/lib/types";

interface RoomState {
  currentRoomResponse: RoomResponse | null;
  roomCode: string | null;
  playerId: string | null;
  isHost: boolean;
  joinedAt: number | null;
  
  setRoom: (roomResponse: RoomResponse) => void;
  updateRoomStatus: (status: Room['status']) => void;
  setPlayerId: (playerId: string) => void;
  setIsHost: (isHost: boolean) => void;
  clearRoom: () => void;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  currentRoomResponse: null,
  roomCode: null,
  playerId: null,
  isHost: false,
  joinedAt: null,
  
  setRoom: (roomResponse) => 
    set({ 
      currentRoomResponse: roomResponse,
      roomCode: roomResponse.room.code,
      joinedAt: Date.now()
    }),
  
  updateRoomStatus: (status) =>
    set((state) => ({
      currentRoomResponse: state.currentRoomResponse 
        ? {
            ...state.currentRoomResponse,
            room: { ...state.currentRoomResponse.room, status }
          }
        : null
    })),
  
  setPlayerId: (playerId) => set({ playerId }),
  
  setIsHost: (isHost) => set({ isHost }),
  
  clearRoom: () => 
    set({ 
      currentRoomResponse: null,
      roomCode: null, 
      playerId: null, 
      isHost: false,
      joinedAt: null
    })
}));