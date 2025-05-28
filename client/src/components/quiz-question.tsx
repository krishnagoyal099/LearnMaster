import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { QuizQuestion as QuizQuestionType } from "../../../shared/schema";

interface QuizQuestionProps {
  question: QuizQuestionType;
  questionNumber: number;
  selectedAnswer?: number;
  onAnswerSelect: (answerIndex: number) => void;
}

const badgeColors = [
  "bg-blue-100 text-blue-800",
  "bg-purple-100 text-purple-800",
  "bg-emerald-100 text-emerald-800",
  "bg-orange-100 text-orange-800",
];

export function QuizQuestion({
  question,
  questionNumber,
  selectedAnswer,
  onAnswerSelect,
}: QuizQuestionProps) {
  const badgeColor = badgeColors[(questionNumber - 1) % badgeColors.length];

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-gray-200/50">
      <CardContent className="p-6">
        {/* Question Header */}
        <div className="mb-4">
          <Badge className={`${badgeColor} mb-3`}>
            Question {questionNumber} of 4
          </Badge>
          <h4
            className="text-lg font-semibold text-gray-900 whitespace-pre-wrap"
            dir="ltr"
          >
            {question.question}
          </h4>
        </div>

        {/* Options */}
        <RadioGroup
          value={selectedAnswer?.toString()}
          onValueChange={(value) => onAnswerSelect(parseInt(value))}
          className="space-y-4"
        >
          {question.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            return (
              <div
                key={index}
                className={`flex items-start border rounded-lg p-4 cursor-pointer transition
                  ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-100"
                  }
                `}
                onClick={() => onAnswerSelect(index)}
                tabIndex={0}
                role="button"
                aria-pressed={isSelected}
              >
                <span className="font-medium mr-3 flex-shrink-0">
                  {String.fromCharCode(65 + index)}.
                </span>
                <span className="text-gray-800" dir="ltr">
                  {option}
                </span>
              </div>
            );
          })}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}
