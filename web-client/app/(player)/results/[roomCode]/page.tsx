"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Home, RotateCcw } from "lucide-react";
import { Button, Card } from "@/components/ui";
import Leaderboard from "@/components/game/leaderboard";
import LoadingScreen from "@/components/shared/loading-screen";
import { useGame, useRoom, useWebSocket } from "@/hooks";
import { ROUTES } from "@/lib/utils";

export default function ResultsPage() {
  const router = useRouter();
  
  const { leaderboard, playerId, resetGame } = useGame();
  const { currentRoom, clearRoom } = useRoom();
  const { disconnect } = useWebSocket();

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  if (leaderboard.length === 0) {
    return <LoadingScreen message="Carregando resultados..." />;
  }

  const currentPlayerRank = leaderboard.findIndex(
    (entry) => entry.playerId === playerId
  ) + 1;

  const currentPlayerScore = leaderboard.find(
    (entry) => entry.playerId === playerId
  )?.score || 0;

  const handlePlayAgain = () => {
    resetGame();
    clearRoom();
    router.push(ROUTES.JOIN);
  };

  const handleGoHome = () => {
    resetGame();
    clearRoom();
    router.push(ROUTES.HOME);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">🎉 Jogo Finalizado!</h1>
          {currentRoom?.title && (
            <p className="text-xl text-gray-600">{currentRoom.title}</p>
          )}
        </div>

        {currentPlayerRank && (
          <Card className="p-8 text-center">
            <p className="text-lg text-gray-600 mb-2">Sua Colocação</p>
            <div className="text-6xl font-bold mb-2">
              {currentPlayerRank === 1 && "🥇"}
              {currentPlayerRank === 2 && "🥈"}
              {currentPlayerRank === 3 && "🥉"}
              {currentPlayerRank > 3 && `#${currentPlayerRank}`}
            </div>
            <p className="text-2xl font-mono font-bold text-[#850EF6]">
              {currentPlayerScore} pontos
            </p>
          </Card>
        )}

        <Leaderboard
          leaderboard={leaderboard}
          currentPlayerId={playerId || undefined}
        />

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="primary" 
            size="lg" 
            className="w-full sm:w-auto"
            onClick={handlePlayAgain}
          >
            <RotateCcw size={20} />
            Jogar Novamente
          </Button>
          
          <Button 
            variant="secondary" 
            size="lg" 
            className="w-full sm:w-auto"
            onClick={handleGoHome}
          >
            <Home size={20} />
            Voltar ao Início
          </Button>
        </div>
      </div>
    </div>
  );
}