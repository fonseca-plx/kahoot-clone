import { Users } from "lucide-react";
import { Badge } from "../ui";
import type { Player } from "@/lib/types";

interface PlayerListProps {
  players: Player[];
  currentPlayerId?: string;
}

export default function PlayerList({ players, currentPlayerId }: PlayerListProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.7)]">
      <div className="flex items-center gap-2 mb-4">
        <Users className="text-[#850EF6]" size={24} />
        <h3 className="text-xl font-bold">
          Jogadores ({players.length})
        </h3>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {players.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Aguardando jogadores...
          </p>
        ) : (
          players.map((player) => (
            <div
              key={player.playerId}
              className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                player.playerId === currentPlayerId
                  ? "bg-[#7FF60E]/20 border-2 border-[#7FF60E]"
                  : "bg-gray-50"
              }`}
            >
              <span className="font-semibold">{player.displayName}</span>
              {player.playerId === currentPlayerId && (
                <Badge variant="primary" className="text-xs">
                  Você
                </Badge>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}