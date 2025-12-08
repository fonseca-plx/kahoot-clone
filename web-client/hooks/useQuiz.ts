import { useCallback } from "react";
import { api } from "@/lib/api";
import { useQuizStore } from "@/store";
import { useApi } from "./useApi";
import type { CreateQuizRequest } from "@/lib/types";

export function useQuiz() {
  const { quizzes, currentQuiz, setQuizzes, setCurrentQuiz, addQuiz } = useQuizStore();
  const { loading, error, execute } = useApi();

  const fetchQuizzes = useCallback(async () => {
    const responses = await execute(() => api.quizzes.list());
    if (responses) {
      const quizList = responses.map(r => r.quiz);
      setQuizzes(quizList);
    }
    return responses;
  }, [execute, setQuizzes]);

  const fetchQuizById = useCallback(async (id: string) => {
    const response = await execute(() => api.quizzes.getById(id));
    if (response) {
      setCurrentQuiz(response.quiz);
    }
    return response;
  }, [execute, setCurrentQuiz]);

  const createQuiz = useCallback(async (data: CreateQuizRequest) => {
    const response = await execute(() => api.quizzes.create(data));
    if (response) {
      addQuiz(response.quiz);
      setCurrentQuiz(response.quiz);
    }
    return response;
  }, [execute, addQuiz, setCurrentQuiz]);

  return {
    quizzes,
    currentQuiz,
    loading,
    error,
    fetchQuizzes,
    fetchQuizById,
    createQuiz,
    setCurrentQuiz
  };
}