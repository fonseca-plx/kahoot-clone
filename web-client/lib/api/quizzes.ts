import { apiClient } from "./clients";
import type { Quiz, CreateQuizRequest, QuizResponse } from "@/lib/types";

export const quizzesApi = {
  async create(data: CreateQuizRequest): Promise<QuizResponse> {
    const response = await apiClient.post<QuizResponse>("/quizzes", data);
    return response.data;
  },

  async getById(id: string): Promise<QuizResponse> {
    const response = await apiClient.get<QuizResponse>(`/quizzes/${id}`);
    return response.data;
  },

  async list(): Promise<QuizResponse[]> {
    const response = await apiClient.get<QuizResponse[]>("/quizzes");
    return response.data;
  }
};