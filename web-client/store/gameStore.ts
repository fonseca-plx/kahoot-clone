import { create } from "zustand";
import type { Player, GameQuestion, LeaderboardEntry, GameStatus } from "@/lib/types";

interface GameState {
  currentQuestion: GameQuestion | null;
  questionStartTime: number | null;
  players: Player[];
  leaderboard: LeaderboardEntry[];
  status: GameStatus;
  hasAnswered: boolean;
  lastAnswerCorrect: boolean | null;
  lastAnswerPoints: number;
  
  setCurrentQuestion: (question: GameQuestion | null) => void;
  setQuestionStartTime: (time: number | null) => void;
  setPlayers: (players: Player[]) => void;
  addPlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  updatePlayerScore: (playerId: string, score: number) => void;
  setLeaderboard: (leaderboard: LeaderboardEntry[]) => void;
  setStatus: (status: GameStatus) => void;
  setHasAnswered: (answered: boolean) => void;
  setAnswerResult: (correct: boolean, points: number) => void;
  resetGame: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  currentQuestion: null,
  questionStartTime: null,
  players: [],
  leaderboard: [],
  status: "waiting",
  hasAnswered: false,
  lastAnswerCorrect: null,
  lastAnswerPoints: 0,
  
  setCurrentQuestion: (question) => 
    set({ 
      currentQuestion: question,
      questionStartTime: question ? Date.now() : null,
      hasAnswered: false,
      lastAnswerCorrect: null,
      lastAnswerPoints: 0
    }),
  
  setQuestionStartTime: (time) => set({ questionStartTime: time }),
  
  setPlayers: (players) => set({ players }),
  
  addPlayer: (player) => 
    set((state) => {
      const exists = state.players.find(p => p.playerId === player.playerId);
      if (exists) return state;
      return { players: [...state.players, player] };
    }),
  
  removePlayer: (playerId) =>
    set((state) => ({
      players: state.players.filter(p => p.playerId !== playerId)
    })),
  
  updatePlayerScore: (playerId, score) =>
    set((state) => ({
      players: state.players.map(p => 
        p.playerId === playerId ? { ...p, score } : p
      )
    })),
  
  setLeaderboard: (leaderboard) => set({ leaderboard }),
  
  setStatus: (status) => set({ status }),
  
  setHasAnswered: (answered) => set({ hasAnswered: answered }),
  
  setAnswerResult: (correct, points) => 
    set({ 
      lastAnswerCorrect: correct, 
      lastAnswerPoints: points,
      hasAnswered: true
    }),
  
  resetGame: () => 
    set({
      currentQuestion: null,
      questionStartTime: null,
      players: [],
      leaderboard: [],
      status: "waiting",
      hasAnswered: false,
      lastAnswerCorrect: null,
      lastAnswerPoints: 0
    })
}));