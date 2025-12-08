import { Play } from "lucide-react";
import { Button } from "../ui";

interface HostControlsProps {
  onStart: () => void;
  disabled?: boolean;
  playerCount: number;
}

export default function HostControls({ onStart, disabled, playerCount }: HostControlsProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.7)]">
      <h3 className="text-xl font-bold mb-4">Controles do Host</h3>
      
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={onStart}
        disabled={disabled || playerCount === 0}
      >
        <Play size={24} />
        Iniciar Jogo
      </Button>

      {playerCount === 0 && (
        <p className="text-sm text-gray-500 mt-2 text-center">
          Aguarde pelo menos 1 jogador para começar
        </p>
      )}
    </div>
  );
}