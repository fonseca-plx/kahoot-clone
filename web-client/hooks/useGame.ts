import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useGameStore, useRoomStore, useSocketStore } from "@/store";
import { useLocalUser } from "./useLocalUser";
import { ROUTES } from "@/lib/utils";

export function useGame() {
  const router = useRouter();
  const { socket } = useSocketStore();
  const { roomCode, playerId, setPlayerId, isHost, setIsHost } = useRoomStore();
  const { displayName } = useLocalUser();
  const displayNameRef = useRef(displayName);
  
  // Atualizar ref quando displayName mudar
  useEffect(() => {
    displayNameRef.current = displayName;
  }, [displayName]);
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

    const handleRoomJoined = (data: any) => {
      setPlayerId(data.playerId);
      
      // Atualizar isHost
      if (data.isHost !== undefined) {
        setIsHost(data.isHost);
      }
      
      console.log("[Game] Joined room:", data);
    };

    const handlePlayerList = (data: any) => {
      setPlayers(data.players);
    };

    const handleGameStarting = () => {
      console.log("[Game] Game is starting...");
      setStatus("playing");
    };

    const handleQuestion = (data: any) => {
      setStatus("playing");
      setCurrentQuestion(data);
    };

    const handleAnswerResult = (data: any) => {
      setAnswerResult(data.correct, data.points);
    };

    const handleLeaderboard = (data: any) => {
      setLeaderboard(data.leaderboard);
    };

    const handleQuestionEnd = () => {
      setStatus("question_end");
    };

    const handleFinished = (data: any) => {
      setStatus("finished");
      setLeaderboard(data.leaderboard);
      if (roomCode) {
        router.push(ROUTES.RESULTS(roomCode));
      }
    };

    const handleHostChanged = (data: any) => {
      setIsHost(data.isHost);
      if (data.isHost) {
        console.log("[Game] You are now the host!");
      }
    };

    const handleError = (data: any) => {
      console.error("[Game] Error:", data.message);
    };

    socket.on("room:joined", handleRoomJoined);
    socket.on("room:player_list", handlePlayerList);
    socket.on("room:host_changed", handleHostChanged);
    socket.on("game:starting", handleGameStarting);
    socket.on("game:question", handleQuestion);
    socket.on("game:answer_result", handleAnswerResult);
    socket.on("game:leaderboard", handleLeaderboard);
    socket.on("game:question_end", handleQuestionEnd);
    socket.on("game:finished", handleFinished);
    socket.on("error", handleError);

    return () => {
      socket.off("room:joined", handleRoomJoined);
      socket.off("room:player_list", handlePlayerList);
      socket.off("room:host_changed", handleHostChanged);
      socket.off("game:starting", handleGameStarting);
      socket.off("game:question", handleQuestion);
      socket.off("game:answer_result", handleAnswerResult);
      socket.off("game:leaderboard", handleLeaderboard);
      socket.off("game:question_end", handleQuestionEnd);
      socket.off("game:finished", handleFinished);
      socket.off("error", handleError);
    };
  }, [socket, roomCode, router, setPlayerId, setPlayers, setCurrentQuestion, setLeaderboard, setStatus, setAnswerResult]);

  const joinRoom = useCallback((code: string) => {
    if (!socket) return;
    // Usar ref para pegar o valor mais recente sem depender de displayName
    socket.emit("room:join", { code, displayName: displayNameRef.current });
  }, [socket]);

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