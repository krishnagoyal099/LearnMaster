import { useState } from "react";
import { Input } from "@/components/ui/input";

export function CrosswordGame() {
  const [answers, setAnswers] = useState<string[]>(Array(25).fill(""));

  const handleCellChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newAnswers = [...answers];
      newAnswers[index] = value.toUpperCase();
      setAnswers(newAnswers);
    }
  };

  return (
    <div className="text-center">
      <h4 className="text-lg font-semibold mb-4 text-foreground">
        Mini Crossword
      </h4>
      <div className="grid grid-cols-5 gap-1 mx-auto w-fit mb-4">
        {Array(25)
          .fill(null)
          .map((_, index) => (
            <Input
              key={index}
              type="text"
              maxLength={1}
              value={answers[index]}
              onChange={(e) => handleCellChange(index, e.target.value)}
              className="w-8 h-8 text-center p-0 border-2 border-border focus:border-pink-500"
            />
          ))}
      </div>
      <div className="text-sm text-muted-foreground">
        <p>1 Across: Programming language (6)</p>
        <p>2 Down: Data structure (5)</p>
        <p className="mt-2 text-xs">Hint: Think about what you're learning!</p>
      </div>
    </div>
  );
}
