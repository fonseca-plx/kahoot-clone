import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGameStore, useRoomStore, useSocketStore } from "@/store";
import { useLocalUser } from "./useLocalUser";
import { ROUTES } from "@/lib/utils";

export function useGame() {
  const router = useRouter();
  const { socket } = useSocketStore();
  const { roomCode, playerId, setPlayerId, isHost } = useRoomStore();
  const { displayName } = useLocalUser();
  const {
    currentQuestion,
    questionStartTime,
    players,
    leaderboard,
    status,
    hasAnswered,
    lastAnswerCorrect,
    lastAnswerPoints,
    setCurrentQuestion,
    setPlayers,
    setLeaderboard,
    setStatus,
    setAnswerResult,
    resetGame
  } = useGameStore();

  // Registrar event listeners do WebSocket
  useEffect(() => {
    if (!socket) return;

    socket.on("room:joined", (data) => {
      setPlayerId(data.playerId);
      console.log("[Game] Joined room:", data);
    });

    socket.on("room:player_list", (data) => {
      setPlayers(data.players);
    });

    socket.on("game:question", (data) => {
      setStatus("playing");
      setCurrentQuestion(data);
    });

    socket.on("game:answer_result", (data) => {
      setAnswerResult(data.correct, data.points);
    });

    socket.on("game:leaderboard", (data) => {
      setLeaderboard(data.leaderboard);
    });

    socket.on("game:question_end", () => {
      setStatus("question_end");
    });

    socket.on("game:finished", (data) => {
      setStatus("finished");
      setLeaderboard(data.leaderboard);
      if (roomCode) {
        router.push(ROUTES.RESULTS(roomCode));
      }
    });

    socket.on("error", (data) => {
      console.error("[Game] Error:", data.message);
    });

    return () => {
      socket.off("room:joined");
      socket.off("room:player_list");
      socket.off("game:question");
      socket.off("game:answer_result");
      socket.off("game:leaderboard");
      socket.off("game:question_end");
      socket.off("game:finished");
      socket.off("error");
    };
  }, [socket, roomCode, router, setPlayerId, setPlayers, setCurrentQuestion, setLeaderboard, setStatus, setAnswerResult]);

  const joinRoom = useCallback((code: string) => {
    if (!socket) return;
    socket.emit("room:join", { code, displayName });
  }, [socket, displayName]);

  const startGame = useCallback((roomId: string) => {
    if (!socket || !isHost) return;
    socket.emit("host:start", { roomId });
  }, [socket, isHost]);

  const submitAnswer = useCallback((questionId: string, selectedIndex: number) => {
    if (!socket || !roomCode || hasAnswered) return;
    
    const timeMs = questionStartTime ? Date.now() - questionStartTime : 0;
    
    socket.emit("game:answer", {
      roomId: roomCode,
      questionId,
      selectedIndex,
      timeMs
    });
  }, [socket, roomCode, hasAnswered, questionStartTime]);

  return {
    // Estado
    currentQuestion,
    players,
    leaderboard,
    status,
    hasAnswered,
    lastAnswerCorrect,
    lastAnswerPoints,
    playerId,
    isHost,
    
    // Ações
    joinRoom,
    startGame,
    submitAnswer,
    resetGame
  };
}