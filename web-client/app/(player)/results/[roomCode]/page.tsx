"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Home, RotateCcw } from "lucide-react";
import { Button, Card } from "@/components/ui";
import Leaderboard from "@/components/game/leaderboard";
import LoadingScreen from "@/components/shared/loading-screen";
import { useGame, useRoom } from "@/hooks";
import { ROUTES } from "@/lib/utils";

export default function ResultsPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.roomCode as string;
  
  const { leaderboard, playerId, resetGame } = useGame();
  const { currentRoom, clearRoom } = useRoom();

  // Reset game state on unmount
  useEffect(() => {
    return () => {
      resetGame();
      clearRoom();
    };
  }, []);

  if (leaderboard.length === 0) {
    return <LoadingScreen message="Carregando resultados..." />;
  }

  const currentPlayerRank = leaderboard.findIndex(
    (entry) => entry.playerId === playerId
  ) + 1;

  const currentPlayerScore = leaderboard.find(
    (entry) => entry.playerId === playerId
  )?.score || 0;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-bold mb-4">🎉 Jogo Finalizado!</h1>
          {currentRoom?.title && (
            <p className="text-xl text-gray-600">{currentRoom.title}</p>
          )}
        </div>

        {/* Player Stats */}
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

        {/* Full Leaderboard */}
        <Leaderboard
          leaderboard={leaderboard}
          currentPlayerId={playerId || undefined}
        />

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href={ROUTES.JOIN}>
            <Button variant="primary" size="lg" className="w-full sm:w-auto">
              <RotateCcw size={20} />
              Jogar Novamente
            </Button>
          </Link>
          
          <Link href={ROUTES.HOME}>
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              <Home size={20} />
              Voltar ao Início
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}