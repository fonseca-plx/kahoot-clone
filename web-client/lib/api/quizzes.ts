import { apiClient, extractData } from "./clients";
import type { Quiz, CreateQuizRequest, QuizResponse } from "@/lib/types";

export const quizzesApi = {
  async create(data: CreateQuizRequest): Promise<Quiz> {
    const response = await apiClient.post<QuizResponse>("/quizzes", data);
    return extractData<Quiz>(response.data);
  },

  async getById(id: string): Promise<Quiz> {
    const response = await apiClient.get<QuizResponse>(`/quizzes/${id}`);
    return extractData<Quiz>(response.data);
  },

  async list(): Promise<Quiz[]> {
    const response = await apiClient.get<QuizResponse[]>("/quizzes");
    return response.data.map((item) => extractData<Quiz>(item));
  }
};