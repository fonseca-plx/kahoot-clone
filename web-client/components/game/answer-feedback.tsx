import { CheckCircle, XCircle } from "lucide-react";
import { Badge } from "../ui";

interface AnswerFeedbackProps {
  correct: boolean;
  points: number;
}

export default function AnswerFeedback({ correct, points }: AnswerFeedbackProps) {
  return (
    <div className={`rounded-2xl p-8 text-center shadow-[6px_6px_12px_rgba(0,0,0,0.15),-6px_-6px_12px_rgba(255,255,255,0.7)] ${
      correct ? "bg-green-50" : "bg-red-50"
    }`}>
      <div className="flex flex-col items-center gap-4">
        {correct ? (
          <>
            <CheckCircle className="text-green-500" size={64} />
            <h3 className="text-3xl font-bold text-green-700">Correto!</h3>
            <Badge variant="success" className="text-2xl font-mono px-6 py-3">
              +{points} pontos
            </Badge>
          </>
        ) : (
          <>
            <XCircle className="text-red-500" size={64} />
            <h3 className="text-3xl font-bold text-red-700">Incorreto</h3>
            <p className="text-gray-600">Tente na próxima!</p>
          </>
        )}
      </div>
    </div>
  );
}