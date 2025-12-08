"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui";
import JoinRoomForm from "@/components/game/join-room-form";
import ErrorMessage from "@/components/shared/error-message";
import { useLocalUserStore } from "@/store";
import { useRoom } from "@/hooks";
import { ROUTES } from "@/lib/utils";

export default function JoinPage() {
  const router = useRouter();
  const { setDisplayName } = useLocalUserStore();
  const { loading, error, fetchRoomByCode } = useRoom();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleJoin = async (displayName: string, roomCode: string) => {
    setLocalError(null);
    
    // Salvar nome localmente
    setDisplayName(displayName);
    
    // Verificar se sala existe
    const response = await fetchRoomByCode(roomCode);
    
    if (response) {
      // Redirecionar para lobby
      router.push(ROUTES.LOBBY(roomCode));
    } else {
      setLocalError(error?.error || "Sala não encontrada");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      {/* Back Button */}
      <Link href="/" className="inline-flex items-center gap-2 mb-6 text-gray-600 hover:text-[#850EF6] transition-colors">
        <ArrowLeft size={20} />
        <span className="font-semibold">Voltar</span>
      </Link>

      {/* Main Card */}
      <Card className="p-8">
        <h1 className="text-3xl font-bold mb-2 text-center">Entrar no Jogo</h1>
        <p className="text-gray-600 text-center mb-6">
          Digite seu nome e o código da sala
        </p>

        {(localError || error) && (
          <div className="mb-6">
            <ErrorMessage
              message={localError || error?.error || "Erro ao entrar na sala"}
              onDismiss={() => setLocalError(null)}
            />
          </div>
        )}

        <JoinRoomForm onSubmit={handleJoin} loading={loading} />
      </Card>

      {/* Info */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Não precisa criar conta para jogar!</p>
        <p>Basta digitar seu nome e entrar.</p>
      </div>
    </div>
  );
}