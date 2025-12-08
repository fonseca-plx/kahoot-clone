import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useRoomStore } from "@/store";
import { useApi } from "./useApi";
import { ROUTES } from "@/lib/utils";
import type { CreateRoomRequest } from "@/lib/types";

export function useRoom() {
  const router = useRouter();
  const { currentRoom, roomCode, setRoom, clearRoom } = useRoomStore();
  const { loading, error, execute } = useApi();

  const fetchRoomByCode = useCallback(async (code: string) => {
    const response = await execute(() => api.rooms.getByCode(code));
    if (response) {
      const wsUrl = response._links.websocket?.url;
      setRoom(response.room, wsUrl);
      return response;
    }
    return null;
  }, [execute, setRoom]);

  const createRoom = useCallback(async (data: CreateRoomRequest) => {
    const response = await execute(() => api.rooms.create(data));
    if (response) {
      const wsUrl = response._links.websocket?.url;
      setRoom(response.room, wsUrl);
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
    loading,
    error,
    fetchRoomByCode,
    createRoom,
    joinRoom,
    clearRoom
  };
}