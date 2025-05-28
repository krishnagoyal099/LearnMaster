import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { QuizQuestion as QuizQuestionType } from "@shared/schema";

interface QuizStackProps {
  quizQuestions: QuizQuestionType[];
  onComplete: (score: number) => void;
}

function GlassButton({ children, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-white font-medium transition hover:bg-white/20 active:scale-95 mx-1"
      style={{
        boxShadow:
          "0 4px 24px 0 rgba(255,255,255,0.08), 0 1.5px 6px 0 rgba(0,0,0,0.18)",
      }}
    >
      {children}
    </button>
  );
}

export function QuizStack({ quizQuestions, onComplete }: QuizStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);

  const next = () => {
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const selectAnswer = (answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: answerIndex,
    }));
  };

  const finishQuiz = () => {
    let correct = 0;
    quizQuestions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });
    setShowResult(true);
    onComplete(correct);
  };

  if (!quizQuestions || !quizQuestions.length) {
    return (
      <div className="text-white text-center">No quiz questions found.</div>
    );
  }

  const currentQuestion = quizQuestions[currentIndex];
  const isLastQuestion = currentIndex === quizQuestions.length - 1;
  const hasAnsweredCurrent = answers[currentIndex] !== undefined;

  if (showResult) {
    const correct = Object.keys(answers).filter(
      (key) =>
        answers[parseInt(key)] === quizQuestions[parseInt(key)].correctAnswer
    ).length;

    return (
      <div className="w-full flex flex-col items-center">
        <div className="relative w-full max-w-md h-[300px] rounded-2xl shadow-2xl border-2 border-green-300 bg-white flex flex-col justify-center items-center p-8">
          <div className="text-3xl font-bold text-green-600 mb-4">
            Quiz Complete!
          </div>
          <div className="text-xl text-gray-800 mb-2">
            Score: {correct}/{quizQuestions.length}
          </div>
          <div className="text-lg text-gray-600">
            {Math.round((correct / quizQuestions.length) * 100)}%
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      {/* Quiz Card Stack */}
      <div className="relative w-full max-w-md min-h-[350px] flex justify-center items-center mb-8">
        {/* Stack of background cards */}
        {quizQuestions.length > 1 &&
          currentIndex < quizQuestions.length - 1 && (
            <>
              {/* Third card in back */}
              {currentIndex < quizQuestions.length - 2 && (
                <div
                  className="absolute w-full h-[330px] rounded-2xl border-2 border-gray-300 bg-white shadow-lg"
                  style={{
                    transform: "translateX(8px) translateY(8px) scale(0.95)",
                    zIndex: 1,
                  }}
                />
              )}
              {/* Second card */}
              <div
                className="absolute w-full h-[340px] rounded-2xl border-2 border-gray-300 bg-white shadow-lg cursor-pointer transition-all duration-200 hover:shadow-xl"
                style={{
                  transform: "translateX(4px) translateY(4px) scale(0.97)",
                  zIndex: 2,
                }}
                onClick={next}
                title="Click to show next question"
              />
            </>
          )}

        {/* Active Quiz Card */}
        <div
          className="relative w-full h-[450px] rounded-2xl shadow-2xl border-2 border-gray-300 bg-white select-none"
          style={{
            boxShadow: "0 12px 32px 0 rgba(0, 0, 0, 0.15)",
            zIndex: 10,
          }}
        >
          <div className="p-6 h-full flex flex-col">
            {/* Question Header */}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                  Question {currentIndex + 1} of {quizQuestions.length}
                </span>
                {hasAnsweredCurrent && (
                  <span className="text-xs text-green-600">✓ Answered</span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-800">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Answer Options Container with Scroll */}
            <div
              className="flex-1 overflow-y-auto pr-2"
              style={{ maxHeight: "280px" }}
            >
              <div className="space-y-2">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => selectAnswer(index)}
                    className={`w-full p-3 text-left rounded-xl border-2 transition-all duration-200 ${
                      answers[currentIndex] === index
                        ? "border-blue-500 bg-blue-50 text-blue-900"
                        : "border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <span className="font-medium mr-2 text-sm inline-block w-6">
                      {String.fromCharCode(65 + index)}.
                    </span>
                    <span className="text-sm">{option}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-4 flex justify-between items-center pt-2 border-t">
              <Button
                onClick={prev}
                disabled={currentIndex === 0}
                variant="outline"
                size="sm"
                className="px-4"
              >
                Previous
              </Button>

              {isLastQuestion ? (
                <Button
                  onClick={finishQuiz}
                  disabled={
                    Object.keys(answers).length !== quizQuestions.length
                  }
                  className="bg-green-500 hover:bg-green-600 text-white px-6"
                >
                  Finish Quiz
                </Button>
              ) : (
                <Button
                  onClick={next}
                  disabled={!hasAnsweredCurrent}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6"
                >
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex space-x-2 mb-4">
        {quizQuestions.map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${
              index === currentIndex
                ? "bg-blue-500"
                : answers[index] !== undefined
                ? "bg-green-500"
                : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      <div className="text-sm text-blue-200/80">
        {Object.keys(answers).length} of {quizQuestions.length} questions
        answered
      </div>
    </div>
  );
}
