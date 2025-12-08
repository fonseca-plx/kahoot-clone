import { apiClient } from "./clients";
import type { User, CreateUserRequest, UserResponse } from "@/lib/types";

export const usersApi = {
  async create(data: CreateUserRequest): Promise<UserResponse> {
    const response = await apiClient.post<UserResponse>("/users", data);
    return response.data;
  },

  async getById(id: string): Promise<UserResponse> {
    const response = await apiClient.get<UserResponse>(`/users/${id}`);
    return response.data;
  },

  async list(): Promise<UserResponse[]> {
    const response = await apiClient.get<UserResponse[]>("/users");
    return response.data;
  }
};