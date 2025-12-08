import { Trophy, Medal, Award } from "lucide-react";
import { Badge } from "../ui";
import type { LeaderboardEntry } from "@/lib/types";
import { formatPoints } from "@/lib/utils";

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
  currentPlayerId?: string;
  showTop?: number;
}

export default function Leaderboard({ 
  leaderboard, 
  currentPlayerId,
  showTop 
}: LeaderboardProps) {
  const displayList = showTop ? leaderboard.slice(0, showTop) : leaderboard;

  const getMedalIcon = (position: number) => {
    if (position === 0) return <Trophy className="text-yellow-500" size={28} />;
    if (position === 1) return <Medal className="text-gray-400" size={28} />;
    if (position === 2) return <Award className="text-orange-600" size={28} />;
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.7)]">
      <h3 className="text-2xl font-bold mb-6 text-center">🏆 Placar</h3>

      <div className="space-y-3">
        {displayList.map((entry, index) => (
          <div
            key={entry.playerId}
            className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
              entry.playerId === currentPlayerId
                ? "bg-[#7FF60E]/20 border-2 border-[#7FF60E] scale-105"
                : "bg-gray-50"
            }`}
          >
            <div className="w-12 flex justify-center">
              {getMedalIcon(index) || (
                <span className="text-2xl font-bold text-gray-500">
                  {index + 1}
                </span>
              )}
            </div>

            <div className="flex-1">
              <p className="font-bold text-lg">{entry.displayName}</p>
              {entry.playerId === currentPlayerId && (
                <Badge variant="primary" className="text-xs mt-1">Você</Badge>
              )}
            </div>

            <Badge variant="accent" mono className="text-xl px-4 py-2">
              {formatPoints(entry.score)}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}