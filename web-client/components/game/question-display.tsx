import type { GameQuestion } from "@/lib/types";

interface QuestionDisplayProps {
  question: GameQuestion;
  questionNumber: number;
  totalQuestions: number;
}

export default function QuestionDisplay({ 
  question, 
  questionNumber, 
  totalQuestions 
}: QuestionDisplayProps) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.7)] text-center">
      <div className="text-sm font-semibold text-gray-600 mb-4">
        Pergunta {questionNumber} de {totalQuestions}
      </div>
      
      <h2 className="text-3xl font-bold leading-tight">
        {question.text}
      </h2>
    </div>
  );
}