import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { generateContent } from "@/lib/api";
import { UrlInputForm } from "@/components/url-input-form";
import { Flashcard } from "@/components/flashcard";
import { QuizStack } from "@/components/quiz-stack";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/Header";
import type {
  Flashcard as FlashcardType,
  QuizQuestion as QuizQuestionType,
} from "../../../shared/schema";

export default function Revision() {
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionType[]>([]);
  const [currentMode, setCurrentMode] = useState<"flashcards" | "quiz">(
    "flashcards"
  );

  const generateMutation = useMutation({
    mutationFn: generateContent,
    onSuccess: (data) => {
      setFlashcards(data.flashcards);
      setQuizQuestions(data.quizQuestions);
    },
  });

  const handleGenerateContent = (youtubeUrl: string) => {
    generateMutation.mutate({ youtubeUrl });
  };

  const handleQuizComplete = (score: number) => {
    const total = quizQuestions.length;
    const percentage = Math.round((score / total) * 100);
    alert(`Quiz completed! You scored ${score}/${total} (${percentage}%)`);
  };

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center">
        <Card className="w-full max-w-2xl shadow-xl rounded-2xl bg-white/90 dark:bg-gray-900/80 border border-border">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-center mb-6 text-foreground">
              YouTube to Study Cards & Quiz
            </h2>
            <p className="text-center text-muted-foreground mb-8">
              Paste a YouTube video URL below to generate flashcards and quiz
              questions.
            </p>
            <UrlInputForm
              onSubmit={handleGenerateContent}
              isLoading={generateMutation.isPending}
              onModeChange={setCurrentMode}
              currentMode={currentMode}
            />
            {generateMutation.isError && (
              <div className="mt-4 text-red-600 text-center">
                {generateMutation.error instanceof Error
                  ? generateMutation.error.message
                  : "An error occurred. Please try again."}
              </div>
            )}
            {(flashcards.length > 0 || quizQuestions.length > 0) && (
              <div className="mt-8">
                {currentMode === "flashcards" && flashcards.length > 0 && (
                  <Flashcard flashcards={flashcards} />
                )}
                {currentMode === "quiz" && quizQuestions.length > 0 && (
                  <div>
                    <QuizStack
                      quizQuestions={quizQuestions}
                      onComplete={handleQuizComplete}
                    />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
