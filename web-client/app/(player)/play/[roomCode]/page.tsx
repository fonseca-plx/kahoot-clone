"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import QuestionDisplay from "@/components/game/question-display";
import AnswerChoices from "@/components/game/answer-choices";
import TimerBar from "@/components/game/timer-bar";
import AnswerFeedback from "@/components/game/answer-feedback";
import Leaderboard from "@/components/game/leaderboard";
import LoadingScreen from "@/components/shared/loading-screen";
import { useGame, useRoom } from "@/hooks";

export default function PlayPage() {
  const params = useParams();
  const roomCode = params.roomCode as string;
  
  const { currentRoom } = useRoom();
  const {
    currentQuestion,
    status,
    hasAnswered,
    lastAnswerCorrect,
    lastAnswerPoints,
    leaderboard,
    playerId,
    submitAnswer
  } = useGame();

  const handleAnswer = (index: number) => {
    if (currentQuestion && !hasAnswered) {
      submitAnswer(currentQuestion.questionId, index);
    }
  };

  // Loading state
  if (status === "waiting") {
    return <LoadingScreen message="Aguardando início do jogo..." />;
  }

  // Question end state
  if (status === "question_end" && currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-4xl w-full space-y-6">
          {/* Show correct answer */}
          <QuestionDisplay
            question={currentQuestion}
            questionNumber={1}
            totalQuestions={currentRoom?.quiz?.questions?.length || 1}
          />
          
          <AnswerChoices
            choices={currentQuestion.choices}
            onSelect={() => {}}
            selectedIndex={undefined}
            correctIndex={currentQuestion.correctIndex}
            disabled
          />

          {/* Show leaderboard */}
          {leaderboard.length > 0 && (
            <Leaderboard
              leaderboard={leaderboard}
              currentPlayerId={playerId || undefined}
              showTop={5}
            />
          )}

          <p className="text-center text-xl font-semibold text-gray-600">
            Próxima pergunta em instantes...
          </p>
        </div>
      </div>
    );
  }

  // Playing state
  if (!currentQuestion) {
    return <LoadingScreen message="Carregando pergunta..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        {/* Timer */}
        <TimerBar totalSeconds={currentQuestion.timeLimitSeconds} />

        {/* Question */}
        <QuestionDisplay
          question={currentQuestion}
          questionNumber={1}
          totalQuestions={currentRoom?.quiz?.questions?.length || 1}
        />

        {/* Answer Feedback or Choices */}
        {hasAnswered && lastAnswerCorrect !== null ? (
          <AnswerFeedback
            correct={lastAnswerCorrect}
            points={lastAnswerPoints}
          />
        ) : (
          <AnswerChoices
            choices={currentQuestion.choices}
            onSelect={handleAnswer}
            disabled={hasAnswered}
          />
        )}

        {/* Mini Leaderboard */}
        {leaderboard.length > 0 && (
          <div className="mt-8">
            <Leaderboard
              leaderboard={leaderboard}
              currentPlayerId={playerId || undefined}
              showTop={3}
            />
          </div>
        )}
      </div>
    </div>
  );
}