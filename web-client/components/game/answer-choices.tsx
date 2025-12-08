"use client";

import { Card } from "../ui";

interface AnswerChoicesProps {
  choices: string[];
  onSelect: (index: number) => void;
  selectedIndex?: number;
  correctIndex?: number;
  disabled?: boolean;
}

export default function AnswerChoices({
  choices,
  onSelect,
  selectedIndex,
  correctIndex,
  disabled = false
}: AnswerChoicesProps) {
  const getVariant = (index: number) => {
    if (correctIndex !== undefined) {
      if (index === correctIndex) return "success";
      if (index === selectedIndex && index !== correctIndex) return "error";
    }
    if (index === selectedIndex) return "selected";
    return "default";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {choices.map((choice, index) => (
        <Card
          key={index}
          variant={getVariant(index)}
          hover={!disabled}
          onClick={() => !disabled && onSelect(index)}
          className={`p-6 ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#850EF6] text-white flex items-center justify-center font-bold text-xl shadow-[2px_2px_4px_rgba(0,0,0,0.2)]">
              {String.fromCharCode(65 + index)}
            </div>
            <p className="flex-1 text-lg font-semibold text-left">
              {choice}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
}