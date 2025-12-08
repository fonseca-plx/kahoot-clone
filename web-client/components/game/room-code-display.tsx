import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui";

interface RoomCodeDisplayProps {
  code: string;
}

export default function RoomCodeDisplay({ code }: RoomCodeDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.7)] text-center">
      <p className="text-sm font-semibold text-gray-600 mb-2">Código da Sala</p>
      
      <div className="flex items-center justify-center gap-4">
        <Badge variant="accent" className="text-5xl font-mono px-8 py-4 tracking-widest">
          {code}
        </Badge>
        
        <button
          onClick={handleCopy}
          className="p-3 rounded-xl hover:bg-gray-100 transition-colors"
          title="Copiar código"
        >
          {copied ? (
            <Check className="text-green-500" size={28} />
          ) : (
            <Copy className="text-gray-600" size={28} />
          )}
        </button>
      </div>
      
      <p className="text-xs text-gray-500 mt-3">
        Compartilhe este código com os jogadores
      </p>
    </div>
  );
}