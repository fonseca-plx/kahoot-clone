import { apiClient, extractData } from "./clients";
import type { Room, CreateRoomRequest, RoomResponse } from "@/lib/types";

export const roomsApi = {
  async create(data: CreateRoomRequest): Promise<RoomResponse> {
    const response = await apiClient.post<RoomResponse>("/rooms", data);
    return response.data;
  },

  async getById(id: string): Promise<RoomResponse> {
    const response = await apiClient.get<RoomResponse>(`/rooms/${id}`);
    return response.data;
  },

  async getByCode(code: string): Promise<RoomResponse> {
    const response = await apiClient.get<RoomResponse>(`/rooms/code/${code}`);
    return response.data;
  },

  async list(): Promise<RoomResponse[]> {
    const response = await apiClient.get<RoomResponse[]>("/rooms");
    return response.data;
  }
};