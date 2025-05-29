
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, Trophy, RotateCcw, Brain } from "lucide-react";
import type { QuizQuestion as QuizQuestionType } from "@shared/schema";

interface QuizStackProps {
  quizQuestions: QuizQuestionType[];
  onComplete: (score: number) => void;
}

export function QuizStack({ quizQuestions, onComplete }: QuizStackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes total
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [hasAnswered, setHasAnswered] = useState(false);

  // Timer effect
  useEffect(() => {
    if (isTimerActive && timeLeft > 0 && !showResult) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            finishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isTimerActive, timeLeft, showResult]);

  // Start timer on first question
  useEffect(() => {
    if (!isTimerActive && currentIndex === 0 && !showResult) {
      setIsTimerActive(true);
    }
  }, [currentIndex, isTimerActive, showResult]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((currentIndex + 1) / quizQuestions.length) * 100;

  const next = () => {
    setShowCorrectAnswer(false);
    setHasAnswered(false);
    if (currentIndex < quizQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prev = () => {
    setShowCorrectAnswer(false);
    setHasAnswered(false);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const selectAnswer = (answerIndex: number) => {
    if (hasAnswered) return;
    
    setAnswers((prev) => ({
      ...prev,
      [currentIndex]: answerIndex,
    }));
    setHasAnswered(true);
    setShowCorrectAnswer(true);
  };

  const finishQuiz = () => {
    setIsTimerActive(false);
    let correct = 0;
    quizQuestions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });
    setShowResult(true);
    onComplete(correct);
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setAnswers({});
    setShowResult(false);
    setTimeLeft(300);
    setIsTimerActive(true);
    setShowCorrectAnswer(false);
    setHasAnswered(false);
  };

  if (!quizQuestions || !quizQuestions.length) {
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-red-50 to-orange-50 border-red-200">
        <CardContent>
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">No Quiz Questions Available</h3>
          <p className="text-red-600">Please generate content from a video first to create quiz questions.</p>
        </CardContent>
      </Card>
    );
  }

  const currentQuestion = quizQuestions[currentIndex];
  const isLastQuestion = currentIndex === quizQuestions.length - 1;
  const selectedAnswer = answers[currentIndex];

  if (showResult) {
    const correct = Object.keys(answers).filter(
      (key) => answers[parseInt(key)] === quizQuestions[parseInt(key)].correctAnswer
    ).length;
    const percentage = Math.round((correct / quizQuestions.length) * 100);
    
    let resultColor = "text-red-600";
    let resultBg = "from-red-50 to-red-100";
    let resultIcon = <XCircle className="h-16 w-16 text-red-500" />;
    
    if (percentage >= 80) {
      resultColor = "text-green-600";
      resultBg = "from-green-50 to-emerald-100";
      resultIcon = <Trophy className="h-16 w-16 text-yellow-500" />;
    } else if (percentage >= 60) {
      resultColor = "text-blue-600";
      resultBg = "from-blue-50 to-blue-100";
      resultIcon = <CheckCircle className="h-16 w-16 text-blue-500" />;
    }

    return (
      <Card className={`p-6 text-center bg-gradient-to-br ${resultBg} border-2 max-w-2xl mx-auto`}>
        <CardContent className="space-y-4">
          <div className="flex justify-center mb-4">
            <div className="scale-75">
              {resultIcon}
            </div>
          </div>
          
          <div>
            <h2 className={`text-2xl font-bold ${resultColor} mb-2`}>
              Quiz Complete!
            </h2>
            <p className="text-gray-600 text-sm mb-3">Here's how you performed:</p>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center">
              <div className={`text-xl font-bold ${resultColor}`}>{correct}</div>
              <div className="text-xs text-gray-500">Correct</div>
            </div>
            <div className="text-center">
              <div className={`text-xl font-bold ${resultColor}`}>{quizQuestions.length - correct}</div>
              <div className="text-xs text-gray-500">Incorrect</div>
            </div>
            <div className="text-center">
              <div className={`text-xl font-bold ${resultColor}`}>{percentage}%</div>
              <div className="text-xs text-gray-500">Score</div>
            </div>
          </div>

          <div className="space-y-2">
            {percentage >= 80 && (
              <Badge className="bg-green-100 text-green-800 text-xs px-3 py-1">
                🎉 Excellent! You've mastered this topic!
              </Badge>
            )}
            {percentage >= 60 && percentage < 80 && (
              <Badge className="bg-blue-100 text-blue-800 text-xs px-3 py-1">
                👍 Good job! Consider reviewing the missed questions.
              </Badge>
            )}
            {percentage < 60 && (
              <Badge className="bg-orange-100 text-orange-800 text-xs px-3 py-1">
                📚 Keep studying! Review the material and try again.
              </Badge>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <Button onClick={restartQuiz} variant="outline" size="sm" className="px-4 py-2">
              <RotateCcw className="h-3 w-3 mr-2" />
              Retake Quiz
            </Button>
            <Button onClick={() => window.location.reload()} size="sm" className="px-4 py-2">
              <Brain className="h-3 w-3 mr-2" />
              Generate New Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      {/* Header with Progress and Timer */}
      <Card className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="px-2 py-1 text-xs">
              Question {currentIndex + 1} of {quizQuestions.length}
            </Badge>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <Clock className="h-3 w-3" />
              <span className={timeLeft < 60 ? "text-red-600 font-semibold" : ""}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        </div>
        <Progress value={progress} className="h-2" />
      </Card>

      {/* Main Quiz Card */}
      <Card className="relative overflow-hidden bg-white shadow-md border-gray-200">
        <CardContent className="p-6">
          {/* Question */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 leading-relaxed">
              {currentQuestion.question}
            </h3>
          </div>

          {/* Answer Options */}
          <div className="space-y-2 mb-6">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const showFeedback = showCorrectAnswer;
              
              let buttonStyle = "border-gray-300 bg-white hover:bg-gray-50 text-gray-800";
              
              if (showFeedback) {
                if (isCorrect) {
                  buttonStyle = "border-green-500 bg-green-50 text-green-900";
                } else if (isSelected && !isCorrect) {
                  buttonStyle = "border-red-500 bg-red-50 text-red-900";
                }
              } else if (isSelected) {
                buttonStyle = "border-blue-500 bg-blue-50 text-blue-900";
              }

              return (
                <button
                  key={index}
                  onClick={() => selectAnswer(index)}
                  disabled={hasAnswered}
                  className={`w-full p-3 text-left rounded-lg border-2 transition-all duration-200 ${buttonStyle} ${
                    hasAnswered ? 'cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-xs bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center">
                        {String.fromCharCode(65 + index)}
                      </span>
                      <span className="text-sm">{option}</span>
                    </div>
                    {showFeedback && (
                      <div>
                        {isCorrect && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-600" />}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-3 border-t border-gray-200">
            <Button
              onClick={prev}
              disabled={currentIndex === 0}
              variant="outline"
              size="sm"
              className="px-4"
            >
              Previous
            </Button>

            <div className="flex gap-1.5">
              {quizQuestions.map((_, index) => (
                <div
                  key={index}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    index === currentIndex
                      ? "bg-blue-500"
                      : answers[index] !== undefined
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>

            {isLastQuestion ? (
              <Button
                onClick={finishQuiz}
                disabled={Object.keys(answers).length !== quizQuestions.length}
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white px-4"
              >
                Finish Quiz
              </Button>
            ) : (
              <Button
                onClick={next}
                disabled={!hasAnswered}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4"
              >
                Next Question
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Answer Feedback */}
      {showCorrectAnswer && (
        <Card className="p-3 bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300">
          <div className="flex items-start gap-2">
            {selectedAnswer === currentQuestion.correctAnswer ? (
              <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
            ) : (
              <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
            )}
            <div>
              <p className="font-medium text-sm text-gray-900 mb-1">
                {selectedAnswer === currentQuestion.correctAnswer ? "Correct!" : "Incorrect"}
              </p>
              {selectedAnswer !== currentQuestion.correctAnswer && (
                <p className="text-xs text-gray-600">
                  The correct answer is: <strong>{currentQuestion.options[currentQuestion.correctAnswer]}</strong>
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="text-center text-xs text-gray-500">
        {Object.keys(answers).length} of {quizQuestions.length} questions answered
      </div>
    </div>
  );
}
