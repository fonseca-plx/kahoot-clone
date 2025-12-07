import { create } from "zustand";
import type { Quiz, CreateQuizRequest } from "@/lib/types";

interface QuizState {
  quizzes: Quiz[];
  currentQuiz: Quiz | null;
  isLoading: boolean;
  
  setQuizzes: (quizzes: Quiz[]) => void;
  setCurrentQuiz: (quiz: Quiz | null) => void;
  addQuiz: (quiz: Quiz) => void;
  setLoading: (loading: boolean) => void;
  clearQuizzes: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  quizzes: [],
  currentQuiz: null,
  isLoading: false,
  
  setQuizzes: (quizzes) => set({ quizzes }),
  
  setCurrentQuiz: (quiz) => set({ currentQuiz: quiz }),
  
  addQuiz: (quiz) => 
    set((state) => ({ 
      quizzes: [quiz, ...state.quizzes] 
    })),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  clearQuizzes: () => 
    set({ 
      quizzes: [], 
      currentQuiz: null 
    })
}));