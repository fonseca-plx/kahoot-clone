"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface TimerBarProps {
  totalSeconds: number;
  onComplete?: () => void;
}

export default function TimerBar({ totalSeconds, onComplete }: TimerBarProps) {
  const [seconds, setSeconds] = useState(totalSeconds);

  useEffect(() => {
    setSeconds(totalSeconds);
    
    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [totalSeconds, onComplete]);

  const percentage = (seconds / totalSeconds) * 100;
  const color = percentage > 50 ? "#7FF60E" : percentage > 25 ? "#FFA500" : "#FF0000";

  return (
    <div className="bg-white rounded-2xl p-4 shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.7)]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock size={20} className="text-[#850EF6]" />
          <span className="font-semibold text-gray-700">Tempo Restante</span>
        </div>
        <span className="text-2xl font-mono font-bold" style={{ color }}>
          {seconds}s
        </span>
      </div>
      
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-[inset_2px_2px_4px_rgba(0,0,0,0.15)]">
        <div
          className="h-full transition-all duration-1000 rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );
}