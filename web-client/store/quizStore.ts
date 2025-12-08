import { create } from "zustand";
import type { Quiz, CreateQuizRequest } from "@/lib/types";

interface QuizState {
  quizzes: Quiz[];
  currentQuiz: Quiz | null;
  
  setQuizzes: (quizzes: Quiz[]) => void;
  setCurrentQuiz: (quiz: Quiz | null) => void;
  addQuiz: (quiz: Quiz) => void;
  updateQuiz: (id: string, updates: Partial<Quiz>) => void;
  removeQuiz: (id: string) => void;
  clearQuizzes: () => void;
}

export const useQuizStore = create<QuizState>((set) => ({
  quizzes: [],
  currentQuiz: null,
  
  setQuizzes: (quizzes) => set({ quizzes }),
  
  setCurrentQuiz: (quiz) => set({ currentQuiz: quiz }),
  
  addQuiz: (quiz) => 
    set((state) => ({ 
      quizzes: [quiz, ...state.quizzes] 
    })),
  
  updateQuiz: (id, updates) =>
    set((state) => ({
      quizzes: state.quizzes.map(q => q.id === id ? { ...q, ...updates } : q),
      currentQuiz: state.currentQuiz?.id === id 
        ? { ...state.currentQuiz, ...updates } 
        : state.currentQuiz
    })),
  
  removeQuiz: (id) =>
    set((state) => ({
      quizzes: state.quizzes.filter(q => q.id !== id),
      currentQuiz: state.currentQuiz?.id === id ? null : state.currentQuiz
    })),
  
  clearQuizzes: () => 
    set({ 
      quizzes: [], 
      currentQuiz: null 
    })
}));