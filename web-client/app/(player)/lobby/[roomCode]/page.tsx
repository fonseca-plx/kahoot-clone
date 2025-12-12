"use client";

import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import RoomCodeDisplay from "@/components/game/room-code-display";
import PlayerList from "@/components/game/player-list";
import HostControls from "@/components/game/host-controls";
import LoadingScreen from "@/components/shared/loading-screen";
import ErrorMessage from "@/components/shared/error-message";
import { useRoom, useGame, useWebSocket, useLocalUser } from "@/hooks";
import { ROUTES } from "@/lib/utils";

export default function LobbyPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = params.roomCode as string;
  
  const { ensureDisplayName } = useLocalUser();
  const { currentRoom, wsUrl, loading, error, fetchRoomByCode } = useRoom();
  const { players, playerId, isHost, status, joinRoom, startGame } = useGame();
  const { socket, isConnected, disconnect } = useWebSocket(wsUrl || undefined);
  
  const hasFetchedRoom = useRef(false);
  const hasJoinedRoom = useRef(false);

  useEffect(() => {
    if (!roomCode || roomCode.length !== 6) {
      router.push(ROUTES.JOIN);
      return;
    }
  }, [roomCode, router]);

  useEffect(() => {
    if (roomCode && roomCode.length === 6 && !hasFetchedRoom.current) {
      hasFetchedRoom.current = true;
      fetchRoomByCode(roomCode);
    }
  }, [roomCode, fetchRoomByCode]);

  useEffect(() => {
    if (socket && isConnected && roomCode && !hasJoinedRoom.current) {
      hasJoinedRoom.current = true;
      const name = ensureDisplayName();
      if (name) {
        joinRoom(roomCode);
      }
    }
  }, [socket, isConnected, roomCode, joinRoom, ensureDisplayName]);

  useEffect(() => {
    hasFetchedRoom.current = false;
    hasJoinedRoom.current = false;
    
    return () => {
      hasFetchedRoom.current = false;
      hasJoinedRoom.current = false;
    };
  }, [roomCode]);

  useEffect(() => {
    if (status === "playing") {
      router.push(ROUTES.PLAY(roomCode));
    }
  }, [status, roomCode, router]);

  const handleStart = () => {
    if (currentRoom?.id) {
      startGame(currentRoom.id);
    }
  };

  const handleLeave = () => {
    disconnect();
    router.push(ROUTES.HOME);
  };

  if (loading) {
    return <LoadingScreen message="Entrando na sala..." />;
  }

  if (error || !currentRoom) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Link href={ROUTES.JOIN} className="inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-[#850EF6] transition-colors">
          <ArrowLeft size={20} />
          <span className="font-semibold">Voltar</span>
        </Link>
        <ErrorMessage
          title="Sala não encontrada"
          message={error?.error || "Não foi possível entrar na sala. Verifique o código e tente novamente."}
          onRetry={() => {
            hasFetchedRoom.current = false;
            fetchRoomByCode(roomCode);
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={handleLeave}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-[#850EF6] transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">Sair</span>
        </button>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold">Sala de Espera</h1>
          {currentRoom.title && (
            <p className="text-gray-600">{currentRoom.title}</p>
          )}
        </div>
        
        <div className="w-20"></div>
      </div>

      {!isConnected && (
        <div className="mb-6">
          <ErrorMessage
            title="Conectando..."
            message="Estabelecendo conexão com o servidor"
          />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <RoomCodeDisplay code={currentRoom.code} />
        </div>

        <div className="md:col-span-2">
          <PlayerList players={players} currentPlayerId={playerId || undefined} />
        </div>

        {isHost && (
          <div className="md:col-span-2">
            <HostControls
              onStart={handleStart}
              disabled={!isConnected || players.length === 0}
              playerCount={players.length}
            />
          </div>
        )}
      </div>

      {!isHost && (
        <div className="mt-6 text-center">
          <p className="text-lg text-gray-600 font-semibold">
            Aguardando o host iniciar o jogo...
          </p>
        </div>
      )}
    </div>
  );
}