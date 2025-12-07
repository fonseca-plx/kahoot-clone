import { apiClient, extractData } from "./clients";
import type { User, CreateUserRequest, UserResponse } from "@/lib/types";

export const usersApi = {
  async create(data: CreateUserRequest): Promise<User> {
    const response = await apiClient.post<UserResponse>("/users", data);
    return extractData<User>(response.data);
  },

  async getById(id: string): Promise<User> {
    const response = await apiClient.get<UserResponse>(`/users/${id}`);
    return extractData<User>(response.data);
  },

  async list(): Promise<User[]> {
    const response = await apiClient.get<UserResponse[]>("/users");
    return response.data.map((item) => extractData<User>(item));
  }
};