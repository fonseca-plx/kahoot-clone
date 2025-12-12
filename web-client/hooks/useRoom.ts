import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useRoomStore } from "@/store";
import { useApi } from "./useApi";
import { ROUTES } from "@/lib/utils";
import type { CreateRoomRequest } from "@/lib/types";

export function useRoom() {
  const router = useRouter();
  const { currentRoomResponse, roomCode, setRoom, clearRoom } = useRoomStore();
  const { loading, error, execute } = useApi();

  // Computed values
  const currentRoom = currentRoomResponse?.room || null;
  const wsUrl = currentRoomResponse?._links.websocket?.url || null;
  
  // Debug log
  if (currentRoomResponse) {
    console.log("[useRoom] Room response:", currentRoomResponse);
    console.log("[useRoom] WebSocket URL:", wsUrl);
  }

  const fetchRoomByCode = useCallback(async (code: string) => {
    const response = await execute(() => api.rooms.getByCode(code));
    if (response) {
      setRoom(response);
      return response;
    }
    return null;
  }, [execute, setRoom]);

  const createRoom = useCallback(async (data: CreateRoomRequest) => {
    const response = await execute(() => api.rooms.create(data));
    if (response) {
      setRoom(response);
      return response;
    }
    return null;
  }, [execute, setRoom]);

  const joinRoom = useCallback(async (code: string) => {
    const response = await fetchRoomByCode(code);
    if (response) {
      router.push(ROUTES.LOBBY(code));
    }
    return response;
  }, [fetchRoomByCode, router]);

  return {
    currentRoom,
    roomCode,
    wsUrl,
    loading,
    error,
    fetchRoomByCode,
    createRoom,
    joinRoom,
    clearRoom
  };
}