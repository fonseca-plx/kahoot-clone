import { useCallback } from "react";
import { api } from "@/lib/api";
import { useQuizStore } from "@/store";
import { useApi } from "./useApi";
import type { CreateQuizRequest } from "@/lib/types";

export function useQuiz() {
  const { quizzes, currentQuiz, setQuizzes, setCurrentQuiz, addQuiz } = useQuizStore();
  const { loading, error, execute } = useApi();

  const fetchQuizzes = useCallback(async () => {
    const result = await execute(() => api.quizzes.list());
    if (result) {
      setQuizzes(result);
    }
    return result;
  }, [execute, setQuizzes]);

  const fetchQuizById = useCallback(async (id: string) => {
    const result = await execute(() => api.quizzes.getById(id));
    if (result) {
      setCurrentQuiz(result);
    }
    return result;
  }, [execute, setCurrentQuiz]);

  const createQuiz = useCallback(async (data: CreateQuizRequest) => {
    const result = await execute(() => api.quizzes.create(data));
    if (result) {
      addQuiz(result);
      setCurrentQuiz(result);
    }
    return result;
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